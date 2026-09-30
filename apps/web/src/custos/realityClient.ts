import { BigNumber, Contract, providers, utils } from 'ethers'
import artifacts from './reality-artifacts.json'

export const REALITY_API=(import.meta.env.VITE_API_BASE || '').replace(/\/$/,'')
export type RealityConfig={chain_id:number;name:string;rpc:string;explorer:string;testnet:boolean;launchpad:string;platform_token:string;swap_router:string;swap_factory:string;weth:string;admin_configured:boolean}
export type RealityAsset={id:string;wallet:string;name:string;symbol:string;story:string;description:string;category:string;mode:string;image_url:string;review_status:string;verified:boolean;supply:string;proof_code?:string;proof_ids?:string;review_note?:string;proof_files?:{id:string;name:string;type:string}[];token_address?:string;launch_id?:number;tx_hash?:string;love_count:number;collect_count:number;watch_count:number;loved:boolean;collectd:boolean;watchd:boolean;valuation_count:number;community_value:number|null;created_at:number;comments?:{id:string;wallet:string;body:string;created_at:number}[]}
let credential=''
export function setCredential(token:string){credential=token}
export async function api<T=any>(path:string,body?:unknown,method?:string):Promise<T>{
  const response=await fetch(REALITY_API+'/api/reality'+path,{method:method||(body===undefined?'GET':'POST'),headers:{...(credential?{Authorization:'Bearer '+credential}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})})
  if(!response.ok){let message='请求失败';try{const value=await response.json();message=typeof value.detail==='string'?value.detail:'输入信息不符合要求'}catch{message='服务器暂时不可用'}throw new Error(message)}
  return response.json()
}
export async function uploadFile(file:File,privateFile=false){
  const r=await fetch(REALITY_API+'/api/reality/uploads?private='+privateFile,{method:'POST',headers:{Authorization:'Bearer '+credential,'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name)},body:file});const value=await r.json();if(!r.ok)throw new Error(value.detail||'上传失败');return value as {id:string;url:string;name:string}
}
export async function openProof(id:string){const r=await fetch(REALITY_API+'/api/reality/media/'+id,{headers:{Authorization:'Bearer '+credential}});if(!r.ok)throw new Error('无法读取证明');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
export function photoUrl(value:string){return value.startsWith('/api/')?REALITY_API+value:value}
export const short=(s:string)=>s?s.slice(0,6)+'…'+s.slice(-4):'—'
export const number=(n:number|null|undefined,digits=4)=>n===null||n===undefined||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(n)
export const launchABI=artifacts.CustosRealityLaunchpad.abi
export const tokenABI=['function name() view returns(string)','function symbol() view returns(string)','function decimals() view returns(uint8)','function balanceOf(address) view returns(uint256)','function totalSupply() view returns(uint256)','function allowance(address,address) view returns(uint256)','function approve(address,uint256) returns(bool)']
export function readonly(config:RealityConfig){return new providers.JsonRpcProvider(config.rpc,{name:config.name,chainId:config.chain_id})}
export async function ensureGiwa(config:RealityConfig){
  const injected=(window as any).ethereum;if(!injected)throw new Error('请安装 MetaMask 或兼容的 EVM 钱包')
  const id='0x'+config.chain_id.toString(16);const current=await injected.request({method:'eth_chainId'});if(current!==id){try{await injected.request({method:'wallet_switchEthereumChain',params:[{chainId:id}]})}catch(e:any){if(e.code!==4902)throw e;await injected.request({method:'wallet_addEthereumChain',params:[{chainId:id,chainName:config.name,rpcUrls:[config.rpc],nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},blockExplorerUrls:[config.explorer]}]})}}
  const provider=new providers.Web3Provider(injected,'any');await provider.send('eth_requestAccounts',[]);return provider
}
export type MarketValue={price:number;cap:number;reserve:number;tokenReserve:string;quoteReserve:string;change24h?:number|null;volume24h?:number|null}
export async function fetchMarket(config:RealityConfig,asset:RealityAsset):Promise<MarketValue|null>{
  if(!config.launchpad||!asset.launch_id||!asset.token_address)return null
  const l=await new Contract(config.launchpad,launchABI,readonly(config)).getLaunch(asset.launch_id)
  const token=Number(utils.formatEther(l.tokenReserve)),quote=Number(utils.formatEther(l.quoteReserve));const price=token>0?quote/token:0
  return {price,cap:price*Number(asset.supply),reserve:Number(utils.formatEther(l.raised)),tokenReserve:l.tokenReserve.toString(),quoteReserve:l.quoteReserve.toString()}
}
export async function publishAsset(config:RealityConfig,asset:RealityAsset,onHash:(hash:string)=>void){
  if(!utils.isAddress(config.launchpad))throw new Error('GIWA 发射台合约尚未配置，请联系管理员')
  if(asset.mode==='verified'&&!asset.verified)throw new Error('认证发行须先通过人工审核')
  const p=await ensureGiwa(config);const signer=p.getSigner();if((await signer.getAddress()).toLowerCase()!==asset.wallet.toLowerCase())throw new Error('请切换至项目创建者的钱包')
  const launch=new Contract(config.launchpad,launchABI,signer)
  const origin=REALITY_API||window.location.origin
  const tx=await launch.createLaunch(asset.name,asset.symbol,origin+'/api/reality/assets/'+asset.id+'/metadata',utils.parseUnits(asset.supply,18),utils.parseEther('1'),0,0)
  onHash(tx.hash);await tx.wait(2)
  return api('/assets/'+asset.id+'/attach',{tx_hash:tx.hash})
}
export async function tradeLaunch(config:RealityConfig,asset:RealityAsset,side:'buy'|'sell',amount:string,slippage:number){
  if(!asset.launch_id||!config.launchpad)throw new Error('项目尚未发行')
  const provider=await ensureGiwa(config),signer=provider.getSigner(),launch=new Contract(config.launchpad,launchABI,signer),input=utils.parseUnits(amount,18)
  if(input.lte(0))throw new Error('请输入大于零的数量')
  if(side==='buy'){const out:BigNumber=await launch.quoteFor(asset.launch_id,input);const tx=await launch.buy(asset.launch_id,out.mul(10000-slippage).div(10000),{value:input});return tx.wait()}
  const token=new Contract(asset.token_address!,tokenABI,signer),out:BigNumber=await launch.quoteSell(asset.launch_id,input),owner=await signer.getAddress()
  if((await token.allowance(owner,launch.address)).lt(input)){await(await token.approve(launch.address,input)).wait()}
  const tx=await launch.sell(asset.launch_id,input,out.mul(10000-slippage).div(10000),Math.floor(Date.now()/1000)+600);return tx.wait()
}
const routerABI=['function factory() view returns(address)','function WETH() view returns(address)','function getAmountsOut(uint256,address[]) view returns(uint256[])','function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns(uint256[])']
export type SwapQuote={input:string;output:string;amount:string;amountOut:BigNumber;decimals:number;inputDecimals:number;symbol:string;inputSymbol:string;path:string[];at:number;router:string;chainId:number}
export async function quoteSwap(config:RealityConfig,input:string,output:string,amount:string):Promise<SwapQuote>{
  if(!utils.isAddress(config.swap_router)||!utils.isAddress(config.swap_factory))throw new Error('GIWA 兑换路由尚未配置')
  if(!utils.isAddress(input)||!utils.isAddress(output)||input.toLowerCase()===output.toLowerCase())throw new Error('请选择两个不同的有效代币地址')
  const p=readonly(config),router=new Contract(config.swap_router,routerABI,p),a=new Contract(input,tokenABI,p),b=new Contract(output,tokenABI,p)
  const [factory,ad,bd,symbol,inputSymbol]=await Promise.all([router.factory(),a.decimals(),b.decimals(),b.symbol(),a.symbol()])
  if(factory.toLowerCase()!==config.swap_factory.toLowerCase())throw new Error('兑换路由与工厂配置不匹配')
  if(Number(ad)>36||Number(bd)>36)throw new Error('暂不支持此代币精度')
  const value=utils.parseUnits(amount,ad);if(value.lte(0))throw new Error('请输入有效数量')
  let path=[input,output],result:BigNumber[]
  try{result=await router.getAmountsOut(value,path)}catch{if([input,output].some(x=>x.toLowerCase()===config.weth.toLowerCase()))throw new Error('没有可用流动性');path=[input,config.weth,output];try{result=await router.getAmountsOut(value,path)}catch{throw new Error('没有可用兑换路径，请先添加流动性')}}
  return {input,output,amount,amountOut:result[result.length-1],decimals:Number(bd),inputDecimals:Number(ad),symbol,inputSymbol,path,at:Date.now(),router:config.swap_router,chainId:config.chain_id}
}
export async function executeSwap(config:RealityConfig,q:SwapQuote,slippage:number){
  if(Date.now()-q.at>60000)throw new Error('报价已过期，请重新获取')
  if(q.chainId!==config.chain_id||q.router.toLowerCase()!==config.swap_router.toLowerCase())throw new Error('网络或路由已变化')
  const p=await ensureGiwa(config),signer=p.getSigner(),account=await signer.getAddress(),amount=utils.parseUnits(q.amount,q.inputDecimals)
  const token=new Contract(q.input,tokenABI,signer),router=new Contract(q.router,routerABI,signer)
  if((await token.balanceOf(account)).lt(amount))throw new Error('余额不足')
  if((await token.allowance(account,q.router)).lt(amount))await(await token.approve(q.router,amount)).wait()
  // Keep the user's quoted minimum through approval; never silently replace it.
  const minimum=q.amountOut.mul(10000-slippage).div(10000)
  const tx=await router.swapExactTokensForTokens(amount,minimum,q.path,account,Math.floor(Date.now()/1000)+600);return tx.wait()
}
