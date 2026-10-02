import {utils} from 'ethers'

export type FaucetConfig = {
  chainId: number; contract: string; siteKey: string; enabled: boolean; message: string
  amountWei?: string; cooldownSeconds?: number; reserveWei?: string
  dailyLimitWei?: string; distributedTodayWei?: string
}
export type FaucetJob = {id: string; recipient: string; state: 'queued' | 'signed' | 'submitted' | 'confirmed' | 'failed' | 'attention'; tx_hash: string | null; error: string}
const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export function recipientAddress(input: string): string {
  const value = input.trim()
  if (!utils.isAddress(value) || value.toLowerCase() === '0x0000000000000000000000000000000000000000') throw new Error('Enter a valid, nonzero Ethereum address.')
  return utils.getAddress(value)
}
export async function faucetApi<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(base + '/api/faucet' + path, {
    method: body ? 'POST' : 'GET', signal, cache: 'no-store',
    headers: body ? {'Content-Type': 'application/json'} : {},
    ...(body ? {body: JSON.stringify(body)} : {}),
  })
  let value: any
  try {value = await response.json()} catch {throw new Error('Faucet service is temporarily unavailable.')}
  if (!response.ok) throw new Error(typeof value.detail === 'string' ? value.detail : value.detail?.message || 'Faucet request could not be completed.')
  return value as T
}
export function faucetJobLabel(job: FaucetJob): string {
  return {queued: 'Queued for the official sender', signed: 'Preparing delivery', submitted: 'Waiting for onchain confirmation', confirmed: 'Test ETH delivered', failed: 'Delivery failed', attention: 'Official sender review required'}[job.state]
}
