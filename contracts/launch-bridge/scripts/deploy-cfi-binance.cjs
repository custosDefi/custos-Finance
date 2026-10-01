const fs=require('fs'),path=require('path'),{ethers}=require('ethers');
function readEnv(file){const env={};for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z_0-9]+)\s*=\s*(.*)$/);if(m)env[m[1]]=m[2].trim().replace(/^['"]|['"]$/g,'')}return env}
async function main(){
 if(!process.argv[2]||!process.argv[3])throw Error('Private deployer env and backend env paths required');
 const deploy=readEnv(process.argv[2]),backend=readEnv(process.argv[3]);
 const signer=new ethers.Wallet(backend.CFI_QUOTE_SIGNER_KEY).address,p=new ethers.providers.JsonRpcProvider('https://sepolia-rpc.giwa.io');if((await p.getNetwork()).chainId!==91342)throw Error('Wrong chain');
 const wallet=new ethers.Wallet(deploy.PRIVATE_KEY,p),a=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../apps/web/src/custos/cfi-binance-artifact.json'))),factory=new ethers.ContractFactory(a.abi,a.bytecode,wallet),target=path.resolve(__dirname,'../deployments/giwa-cfi-binance.json');
 let record=fs.existsSync(target)?JSON.parse(fs.readFileSync(target)):null;
 if(!record){
  const previous='0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137';
  if(!(await new ethers.Contract(previous,['function totalPrincipal() view returns(uint256)'],p).totalPrincipal()).isZero())throw Error('Previous vault has deposits; preserve its redemption UI before switching');
  const gas=(await p.estimateGas({...factory.getDeployTransaction(signer),from:wallet.address})).mul(120).div(100),price=await p.getGasPrice();
  if(gas.mul(price).gt(ethers.utils.parseEther('0.0002'))||gas.mul(price).gt((await wallet.getBalance()).div(2)))throw Error('Fee or balance limit');
  console.log('Estimated testnet execution fee ETH',ethers.utils.formatEther(gas.mul(price)));if(!process.argv.includes('--send'))return;
  const c=await factory.deploy(signer,{gasLimit:gas,gasPrice:price});record={chainId:91342,deployer:wallet.address,vault:c.address,cfi:c.address,quoteSigner:signer,priceSource:'Binance ETHUSDT, operator-signed',previousVault:previous,transactionHash:c.deployTransaction.hash,status:'pending'};fs.writeFileSync(target,JSON.stringify(record,null,2));console.log('Binance CFI deployment submitted',record.transactionHash);
 }
 const receipt=await p.waitForTransaction(record.transactionHash,2,180000);if(!receipt||receipt.status!==1)throw Error('Deployment failed');
 const tx=await p.getTransaction(record.transactionHash);if(tx.data.toLowerCase()!==factory.getDeployTransaction(signer).data.toLowerCase()||tx.from.toLowerCase()!==record.deployer.toLowerCase())throw Error('Creation bytecode mismatch');
 const c=new ethers.Contract(record.vault,a.abi,p);if((await c.quoteSigner()).toLowerCase()!==signer.toLowerCase()||await c.symbol()!=='CFI')throw Error('Contract configuration mismatch');
 record.status='verified';record.blockNumber=receipt.blockNumber;record.runtimeCodeHash=ethers.utils.keccak256(await p.getCode(record.vault));record.deployedAt=new Date().toISOString();fs.writeFileSync(target,JSON.stringify(record,null,2));console.log(JSON.stringify(record));
}
main().catch(()=>{console.error('Binance CFI deployment stopped. Check the saved transaction, chain and wallet balance. Credentials were not logged.');process.exitCode=1});
