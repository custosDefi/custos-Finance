import React,{useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {ExternalLink,Loader2} from 'lucide-react'
import {api,snapshotReality,number,RealityAsset,RealityConfig,short} from './realityClient'
import {utils} from 'ethers'

type Candle={time:number;open:number;high:number;low:number;close:number;volume_eth:number;count:number}
type Trade={id:string;time:number;side:'buy'|'sell';wallet:string;tx_hash:string;amount_eth:string;amount_token:string;execution_price:number;price_after:number}
type History={from:number;to:number;interval:number;indexed:boolean;indexed_at:number;truncated:boolean;candles:Candle[];trades:Trade[];trade_count:number;volume_eth:number|null}
const stamp=(time:number)=>new Date(time*1000).toLocaleString('en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
const price=(n:number)=>n>0&&n<0.00000001?n.toExponential(4):number(n,10)

function RealityPriceChart({asset,config}:{asset:RealityAsset;config:RealityConfig|null}){
 const [resolution,setResolution]=useState('1m'),[period]=useState('24h'),[history,setHistory]=useState<History|null>(null),[error,setError]=useState(''),[hover,setHover]=useState<number|null>(null),[retry,setRetry]=useState(0)
 useEffect(()=>{let alive=true;const path='/assets/'+asset.id+'/chart?period='+period+'&resolution='+resolution;setHistory(snapshotReality<History>(path)||null);setError('');setHover(null)
  let running=false
  async function refresh(){if(running||document.hidden)return;running=true;try{const data=await api<History>(path);if(alive){setHistory(data);setError('')}}catch(e:any){if(alive)setError(e.message)}finally{running=false}}
  const visible=()=>{if(!document.hidden)void refresh()};document.addEventListener('visibilitychange',visible);void refresh();const timer=setInterval(()=>void refresh(),15000);return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',visible)}
 },[asset.id,period,resolution,retry])
 const {bars,w,left,right,top,base,low,high,x,y,maxVolume,line}=useMemo(()=>{
  const bars=history?.candles||[],w=900,left=24,right=768,top=22,bottom=226,base=302
  let min=Infinity,max=0,maxVolume=1e-18
  for(const bar of bars){min=Math.min(min,bar.close);max=Math.max(max,bar.close);maxVolume=Math.max(maxVolume,bar.volume_eth)}
  const pad=Math.max((max-min)*.15,max*.02,1e-18),low=Math.max(0,min-pad),high=max+pad
  const x=(t:number)=>left+(Math.max(t,history?.from||0)-(history?.from||0))/Math.max(1,(history?.to||1)-(history?.from||0))*(right-left),y=(v:number)=>bottom-(v-low)/(high-low)*(bottom-top)
  const line=bars.map((b,i)=>(i?'L':'M')+x(b.time)+' '+y(b.close)).join(' ')
  return {bars,w,left,right,top,bottom,base,low,high,x,y,maxVolume,line}
 },[history])
 const selected=bars[hover===null?bars.length-1:Math.min(hover,bars.length-1)]
 return <section className="rl-panel rl-price-chart"><div className="rl-panel-heading"><div><h2>Price history <small>{asset.symbol} / ETH</small></h2><p className="rl-muted">Community trading shapes prices · Updates every 15 seconds</p></div></div>
 <div className="rl-chart-toolbar"><span>Interval</span><div className="rl-chart-periods" aria-label="Price interval">{['1m','5m','15m','1h'].map(r=><button key={r} aria-pressed={r===resolution} className={r===resolution?'active':''} onClick={()=>setResolution(r)}>{r}</button>)}</div><small>Every {resolution==='1m'?'1 minute':resolution==='5m'?'5 minutes':resolution==='15m'?'15 minutes':'1 hour'} per price point</small></div>
 {error?<div className="rl-alert">Could not load history: {error}<button onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:!history?<div className="rl-loading"><Loader2 className="spin"/>Loading confirmed trades…</div>:<>
 <div className="rl-chart-summary"><div><span>Latest post-trade price</span><strong>{selected?price(selected.close)+' ETH':'—'}</strong></div><div><span>{period} Volume</span><strong>{number(history.volume_eth,6)} ETH</strong></div><div><span>Indexed trades</span><strong>{history.trade_count}{history.truncated?'+':''}</strong></div></div>
 {!history.indexed?<p className="rl-chart-notice">Trade indexing is in progress. Showing available confirmed history.</p>:null}{history.truncated?<p className="rl-chart-notice">Showing the latest 5,000 trades in this range.</p>:null}
 {bars.length?<><div className="rl-chart-hover">{selected?stamp(selected.time)+' · Price '+price(selected.close)+' ETH · Interval volume '+number(selected.volume_eth,6)+' ETH':''}</div><svg className="rl-chart-svg" viewBox={'0 0 '+w+' 338'} role="img" aria-label={asset.symbol+' Post-trade onchain price and ETH volume'} onMouseLeave={()=>setHover(null)} onMouseMove={e=>{const bounds=e.currentTarget.getBoundingClientRect(),point=(e.clientX-bounds.left)/bounds.width*w;let first=0,last=bars.length-1;while(first<last){const mid=(first+last)>>1;if(x(bars[mid].time)<point)first=mid+1;else last=mid}const nearest=first>0&&Math.abs(x(bars[first-1].time)-point)<Math.abs(x(bars[first].time)-point)?first-1:first;setHover(previous=>previous===nearest?previous:nearest)}}>
 <title>{asset.symbol} Real onchain prices. The line connects intervals with trades; empty intervals have no synthetic prices.</title>
 {[0,1,2,3,4].map(i=>{const v=low+(high-low)*i/4;return <g key={i}><line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#e4ebe7"/><text x={right+14} y={y(v)+4} fill="#71877c" fontSize="11">{price(v)}</text></g>})}
 <path d={line} stroke="#0aa4a7" strokeWidth="2.5" fill="none"/>{bars.length===1?<circle cx={x(bars[0].time)} cy={y(bars[0].close)} r="4" fill="#0aa4a7"/>:null}
 {selected&&hover!==null?<g><line x1={x(selected.time)} x2={x(selected.time)} y1={top} y2={base} stroke="#82968c" strokeDasharray="4 4"/><circle cx={x(selected.time)} cy={y(selected.close)} r="4" fill="#0aa4a7"/></g>:null}
 <text x={left} y="252" fill="#71877c" fontSize="11">Volume · ETH</text>{bars.map(b=><rect key={b.time} x={x(b.time)-2} y={base-b.volume_eth/maxVolume*40} width="4" height={b.volume_eth/maxVolume*40} fill="#0aa4a7" opacity=".55"/>)}
 {[0,.5,1].map(t=><text key={t} x={left+t*(right-left)} y="326" textAnchor={t===0?'start':t===1?'end':'middle'} fill="#71877c" fontSize="11">{stamp(history.from+t*(history.to-history.from))}</text>)}
 </svg><p className="rl-footnote">The chart shows the last post-trade quote in each interval. Execution prices include the price impact of the trade.</p></>:<div className="rl-chart-empty"><span>No price history yet</span><p>{!history.indexed?'Waiting for trade records to sync.':'No trades in this range. The chart starts after the first confirmed trade.'}</p><Link to="/reality/swap/rwa" className="rl-outline">Go to token swap</Link></div>}
 <div className="rl-panel-heading"><h2>Trade history</h2><span className="rl-muted">Latest 50 trades in this range</span></div><div className="rl-table-scroll rl-trade-table"><table><thead><tr><th>Time</th><th>Side</th><th>Execution price · ETH</th><th>Token amount</th><th>Amount · ETH</th><th>Wallet</th><th>Trade</th></tr></thead><tbody>{history.trades.map(t=><tr key={t.id}><td>{stamp(t.time)}</td><td className={t.side==='buy'?'rl-positive':'rl-red'}>{t.side==='buy'?'Buy':'Sell'}</td><td>{price(t.execution_price)}</td><td>{number(Number(utils.formatEther(t.amount_token)),4)}</td><td>{number(Number(utils.formatEther(t.amount_eth)),6)}</td><td>{short(t.wallet)}</td><td>{config?<a href={config.explorer+'/tx/'+t.tx_hash} target="_blank" rel="noreferrer" aria-label={'View transaction '+t.tx_hash}><ExternalLink size={14}/></a>:'—'}</td></tr>)}{!history.trades.length?<tr><td colSpan={7} className="rl-muted">No indexed trades yet</td></tr>:null}</tbody></table></div>
 </>}
 </section>
}

export default React.memo(RealityPriceChart)
