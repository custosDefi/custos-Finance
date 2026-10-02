import React,{useCallback,useEffect,useRef,useState} from 'react'
import {Contract,utils} from 'ethers'
import {Diamond,ExternalLink,Loader2,RefreshCw} from 'lucide-react'
import {displayRead,snapshotDisplay,invalidateRealityReads,ensureGiwa,RealityConfig,short} from './realityClient'

import {nftAddress as address,nftAbi as abi,readNftState,type NftState as State} from './realityNftRead'

export default function RealityNftPage({config,wallet,connect,notify}:{config:RealityConfig|null;wallet:string;connect:()=>Promise<void>;notify:(message:string)=>void}){
  const [state,setState]=useState<State|null>(()=>config?snapshotDisplay<State>('nft:'+config.rpc+':'+wallet)||null:null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[hash,setHash]=useState('')
  const request=useRef(0)
  const refresh=useCallback(async()=>{
    if(!config)return;const sequence=++request.current;setLoading(true)
    try{const result=await displayRead<State>('nft:'+config.rpc+':'+wallet,15000,()=>readNftState(config,wallet));if(sequence===request.current){setState(result);setError('')}}
    catch{if(sequence===request.current)setError('Unable to read the GIWA NFT contract. Refresh to retry.')}
    finally{if(sequence===request.current)setLoading(false)}
  },[config,wallet])
  useEffect(()=>{setState(config?snapshotDisplay<State>('nft:'+config.rpc+':'+wallet)||null:null);void refresh();const t=setInterval(()=>void refresh(),20000);return()=>{request.current++;clearInterval(t)}},[refresh])
  async function mint(){
    if(!wallet){await connect();return}if(!config||!state)return;setBusy(true)
    try{const p=await ensureGiwa(config),signer=p.getSigner();if((await signer.getAddress()).toLowerCase()!==wallet.toLowerCase())throw new Error('Use the connected wallet')
      const c=new Contract(address,abi,signer);const [price,open,minted,supply,max]=await Promise.all([c.mintPrice(),c.mintOpen(),c.mintedByWallet(wallet),c.totalSupply(),c.MAX_SUPPLY()]);if(!open)throw new Error('Mint is not open');if(minted.gte(await c.WALLET_LIMIT()))throw new Error('Wallet mint limit reached');if(supply.gte(max))throw new Error('Collection sold out')
      notify('Confirm the NFT mint in your wallet');const tx=await c.publicMint(1,{value:price});setHash(tx.hash);await tx.wait(2);invalidateRealityReads();notify('GIWA Genesis NFT mint successful');await refresh()
    }catch(e:any){notify(e.reason||e.message||'Mint failed')}finally{setBusy(false)}
  }
  const sold=!!state&&state.supply>=state.max,limit=!!state&&state.minted>=state.limit
  return <section className="rl-nft-page">
    <div className="rl-nft-top"><span><Diamond size={18}/> CUSTOS <small>GENESIS</small></span><a href={config?.explorer+'/address/'+address} target="_blank" rel="noreferrer">EXPLORER <ExternalLink size={13}/></a></div>
    <div className="rl-nft-layout">
      <div className="rl-nft-story"><p className="rl-eyebrow">THE FIRST MARK OF A NEW WORLD</p><p className="rl-nft-chapter">CHAPTER 03 — TESTNET EDITION</p><h1>Every wallet<br/>deserves a<br/><em>mark.</em></h1><p>A limited onchain edition for the builders shaping GIWA’s next chapter. Connect, mint your mark, and keep a verifiable artifact of the journey.</p><div className="rl-nft-caption">GIWA × CUSTOS · PHASE III</div></div>
      <div className="rl-nft-art"><div className="rl-nft-art-cap">GIWA × CUSTOS <span>GENESIS EDITION</span></div><img src="/assets/nft/collection-artwork.png" alt="GIWA Genesis Phase 3 NFT artwork"/><p>SELECTED BUILDER · 2026</p></div>
      <div className="rl-panel rl-nft-mint">
        <p className="rl-eyebrow">{sold?'COLLECTION SOLD OUT':state?(state.open?'MINT OPEN':'MINT PAUSED'):'GIWA TESTNET'}</p>
        <div className="rl-nft-mint-title"><div><p>MINT INFO</p><h2>{state?.name||'GIWA Genesis'}</h2></div><span>PHASE III</span></div>
        <dl><div><dt>COLLECTION SUPPLY</dt><dd>{state?state.supply.toLocaleString()+' / '+state.max.toLocaleString():'—'}</dd></div><div><dt>MINT PRICE</dt><dd>{state?utils.formatEther(state.price)+' ETH':'—'}</dd></div><div><dt>WALLET LIMIT</dt><dd>{state?state.limit+' NFT':'—'}</dd></div><div><dt>QUANTITY</dt><dd>01</dd></div></dl>
        <button className="rl-button" disabled={!config||busy||sold||!!wallet&&(!state||!state.open||limit)} onClick={()=>void mint()}>{busy?<Loader2 className="spin" size={16}/>:null}{sold?'COLLECTION SOLD OUT':!wallet?'Connect wallet':limit?'ALREADY MINTED':state?.open?'MINT 1 NFT':'MINT PAUSED'}</button>
        {error?<p className="rl-footnote">{error}</p>:null}
        <button className="rl-nft-refresh" disabled={loading} onClick={()=>{invalidateRealityReads();void refresh()}}><RefreshCw size={13}/>Refresh onchain state</button>
        <p className="rl-footnote">{wallet?short(wallet):'Wallet limits and prices are read from the contract'} · GIWA Sepolia</p>
        {hash?<a className="rl-chain-link" href={config?.explorer+'/tx/'+hash} target="_blank" rel="noreferrer">View mint transaction ↗</a>:null}
      </div>
    </div>
  </section>
}
