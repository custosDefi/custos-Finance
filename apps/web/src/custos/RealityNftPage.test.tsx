import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {BigNumber} from 'ethers'
import {beforeEach,expect,it,vi} from 'vitest'
const snapshot=vi.hoisted(()=>({state:null as any}))
vi.mock('./realityClient',()=>({snapshotDisplay:()=>snapshot.state,displayRead:vi.fn(),invalidateRealityReads:vi.fn(),ensureGiwa:vi.fn(),short:(value:string)=>value}))
import RealityNftPage from './RealityNftPage'
const config={rpc:'test',explorer:'https://example.test'} as any
beforeEach(()=>{snapshot.state={name:'GIWA Genesis',supply:1111,max:1111,open:true,limit:1,minted:0,price:BigNumber.from('100000000000000')}})
function render(wallet=''){return renderToStaticMarkup(<RealityNftPage config={config} wallet={wallet} connect={vi.fn()} notify={vi.fn()}/>)}
it('shows sold out even when the contract mint switch remains open and wallet is disconnected',()=>{
 const html=render();expect(html).toContain('COLLECTION SOLD OUT');expect(html).not.toContain('MINT OPEN');expect(html).toMatch(/<button class="rl-button" disabled="">COLLECTION SOLD OUT/)
 expect(html).toContain('src="/assets/nft/collection-artwork.png"');expect(html).not.toContain('www.custosfinance.xyz')
})
it('keeps wallet connection available when the collection has remaining supply',()=>{snapshot.state.supply=100;const html=render();expect(html).toContain('MINT OPEN');expect(html).toContain('>Connect wallet</button>');expect(html).not.toContain('COLLECTION SOLD OUT')})
it('disables minting for a wallet that reached its limit',()=>{snapshot.state.supply=100;snapshot.state.minted=1;expect(render('0x1111111111111111111111111111111111111111')).toMatch(/<button class="rl-button" disabled="">ALREADY MINTED/)} )
