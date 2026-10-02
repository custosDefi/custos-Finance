import React,{act} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter} from 'react-router-dom'
import {afterEach,expect,it,vi} from 'vitest'
import {CreatePanel} from './RealityApp'
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true})
let root:ReturnType<typeof createRoot>|undefined,container:HTMLDivElement|undefined
afterEach(()=>{act(()=>root?.unmount());container?.remove()})
it('updates the creation mode from navigation without losing the entered project fields',async()=>{
 container=document.createElement('div');document.body.appendChild(container);root=createRoot(container)
 const render=(mode:string)=>root!.render(<MemoryRouter><CreatePanel session={null} config={null} connect={vi.fn()} notify={vi.fn()} go={vi.fn()} mode={mode}/></MemoryRouter>)
 await act(async()=>render('free'))
 const name=container.querySelector<HTMLInputElement>('input[placeholder="For example: My father’s old camera"]')!
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(name,'My Camera');name.dispatchEvent(new Event('input',{bubbles:true}))})
 await act(async()=>render('verified'))
 expect(container.textContent).toContain('Blue V application · Human review required');expect(container.querySelector('button[type="submit"]')?.textContent).toBe('Continue to evidence upload');expect(name.value).toBe('My Camera')
 await act(async()=>render('free'))
 expect(container.textContent).not.toContain('Blue V application · Human review required');expect(container.querySelector('button[type="submit"]')?.textContent).toBe('Save project and continue');expect(name.value).toBe('My Camera')
})
