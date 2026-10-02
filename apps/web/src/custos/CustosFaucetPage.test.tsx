import React, {act} from 'react'
import {createRoot} from 'react-dom/client'
import {afterEach, expect, it, vi} from 'vitest'
import CustosFaucetPage from './CustosFaucetPage'
Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true})
vi.mock('./FaucetTurnstile', () => ({default: () => <div>Human verification</div>}))
let root: ReturnType<typeof createRoot>, container: HTMLDivElement
afterEach(() => {act(() => root?.unmount());container?.remove();vi.unstubAllGlobals()})
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
