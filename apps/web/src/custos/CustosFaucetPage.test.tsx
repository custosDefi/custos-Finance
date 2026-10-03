import React, {act} from 'react'
import {createRoot} from 'react-dom/client'
import {afterEach, expect, it, vi} from 'vitest'
import CustosFaucetPage from './CustosFaucetPage'
Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true})
vi.mock('./FaucetTurnstile', () => ({default: () => <div>Human verification</div>}))
let root: ReturnType<typeof createRoot>, container: HTMLDivElement
afterEach(() => {act(() => root?.unmount());container?.remove();sessionStorage.clear();vi.unstubAllGlobals()})
it('allows address entry without a connected wallet and cannot claim when unconfigured', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => ({chainId: 91342, contract: '', siteKey: '', enabled: false, message: 'Sponsored faucet is not yet configured.'})}))
  container = document.createElement('div');document.body.appendChild(container);root = createRoot(container)
  await act(async () => root.render(<CustosFaucetPage/>))
  expect(container.textContent).toContain('No wallet connection or signature required')
  expect(container.querySelector('input')).not.toBeNull()
  expect(container.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled).toBe(true)
  expect(container.textContent).toContain('Sponsored faucet is not yet configured')
  expect(container.textContent).not.toContain('Connect wallet')
})
it('restores a pending request after refresh without sending a second claim', async () => {
  const job = {id: 'a'.repeat(32), recipient: '0x2222222222222222222222222222222222222222', state: 'submitted', tx_hash: '0x' + 'ab'.repeat(32)}
  sessionStorage.setItem('custos-faucet-request-v1', JSON.stringify(job))
  const fetchMock = vi.fn().mockResolvedValue({ok: true, json: async () => ({chainId: 91342, contract: '', siteKey: '', enabled: false, message: 'Waiting for activation'})})
  vi.stubGlobal('fetch', fetchMock)
  container = document.createElement('div');document.body.appendChild(container);root = createRoot(container)
  await act(async () => root.render(<CustosFaucetPage/>))
  expect(container.textContent).toContain('Waiting for onchain confirmation')
  expect(container.querySelector<HTMLInputElement>('input')?.value).toBe(job.recipient)
  expect(container.querySelector<HTMLInputElement>('input')?.disabled).toBe(true)
  expect(fetchMock.mock.calls.every(call => call[1].method === 'GET')).toBe(true)
})
