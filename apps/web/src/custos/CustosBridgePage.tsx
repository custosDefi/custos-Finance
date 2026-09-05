import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  ExternalLink,
  Loader2,
  LockKeyhole,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  UnlockKeyhole,
} from 'lucide-react'

import { useActiveWeb3React } from '../hooks'
import {
  BRIDGE_ABI,
  BRIDGE_TOKEN_ABI,
  protocolContract,
  protocolDeployment,
  protocolDeployments,
} from './protocolContracts'

type Props = {
  wallet: string
  onConnect: () => void
  setToast: (value: string) => void
}

type RelayMessage = {
  messageId: string
  sourceChainId: number
  targetChainId: number
  sourceBridge: string
  sourceToken: string
  recipient: string
  amount: string
  nonce: string
  payload: string
  createdAt: number
}

const STORAGE_KEY = 'custos.bridge.pending.v1'

function short(value: string) {
  return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : '—'
}

function readPending(): RelayMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const value = raw ? JSON.parse(raw) : []
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writePending(value: RelayMessage[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value.slice(0, 12)))
}

function networkParams(deployment: ReturnType<typeof protocolDeployment>) {
  if (!deployment) return null
  return {
    chainId: `0x${deployment.chainId.toString(16)}`,
    chainName: deployment.network,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [deployment.rpc],
    blockExplorerUrls: [import.meta.env.VITE_GIWA_EXPLORER || 'https://sepolia-explorer.giwa.io'],
  }
}

export default function CustosBridgePage({ wallet, onConnect, setToast }: Props) {
  const { account, chainId, library } = useActiveWeb3React()
  const activeWallet = wallet || account || ''
  const activeChainId = Number(chainId || 0)
  const deployment = protocolDeployment(activeChainId)
  const targetChainId = deployment?.counterparty?.chainId || 0
  const targetDeployment = protocolDeployment(targetChainId)
  const bridge = useMemo(
    () => protocolContract(deployment?.contracts.bridge, BRIDGE_ABI, library as any, activeWallet),
    [activeWallet, deployment?.contracts.bridge, library],
  )
  const token = useMemo(
    () => protocolContract(deployment?.contracts.bridgeToken, BRIDGE_TOKEN_ABI, library as any),
    [deployment?.contracts.bridgeToken, library],
  )

  const [amount, setAmount] = useState('10')
  const [balance, setBalance] = useState('0')
  const [isRelayer, setIsRelayer] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<RelayMessage[]>([])
  const [selected, setSelected] = useState<RelayMessage | null>(null)
  const [sourceChain, setSourceChain] = useState('')
  const [sourceBridge, setSourceBridge] = useState('')
  const [sourceToken, setSourceToken] = useState('')
  const [recipient, setRecipient] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [nonce, setNonce] = useState('')
  const [payload, setPayload] = useState('0x')
  const configuredNetworks = protocolDeployments()

  const refresh = useCallback(async () => {
    setPending(readPending())
    if (!token || !activeWallet) {
      setBalance('0')
      setIsRelayer(false)
      return
    }
    try {
      const [rawBalance, relayer] = await Promise.all([
        token.balanceOf(activeWallet),
        bridge ? bridge.isRelayer(activeWallet) : Promise.resolve(false),
      ])
      setBalance(formatUnits(rawBalance, 18))
      setIsRelayer(Boolean(relayer))
    } catch (error) {
      console.warn('[Custos bridge]', error)
    }
  }, [activeWallet, bridge, token])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 8_000)
    return () => window.clearInterval(timer)
  }, [refresh])

  function selectMessage(message: RelayMessage) {
    setSelected(message)
    setSourceChain(String(message.sourceChainId))
    setSourceBridge(message.sourceBridge)
    setSourceToken(message.sourceToken)
    setRecipient(message.recipient)
    setRawAmount(message.amount)
    setNonce(message.nonce)
    setPayload(message.payload || '0x')
  }

  async function switchTo(deploymentToUse: ReturnType<typeof protocolDeployment>) {
    if (!deploymentToUse || !window.ethereum) {
      setToast('An injected wallet is required to switch networks.')
      return
    }
    const params = networkParams(deploymentToUse)
    if (!params) return
    try {
      await (window.ethereum as any).request({ method: 'wallet_switchEthereumChain', params: [{ chainId: params.chainId }] })
    } catch (error: any) {
      if (error?.code !== 4902) throw error
      await (window.ethereum as any).request({ method: 'wallet_addEthereumChain', params: [params] })
    }
  }

  async function bridgeOut() {
    if (!activeWallet) {
      onConnect()
      return
    }
    if (!bridge || !deployment || !targetDeployment) {
      setToast('Bridge contracts are not configured for this network pair.')
      return
    }
    try {
      const amountRawValue = parseUnits(amount, 18)
      if (amountRawValue.lte(0)) throw new Error('Enter an amount greater than zero.')
      if (amountRawValue.gt(parseUnits(balance || '0', 18))) throw new Error('Insufficient cUSD balance.')
      setBusy(true)
      setToast(`Confirm burn and bridge message on ${deployment.network}…`)
      const tx = await bridge.bridgeOut(
        deployment.contracts.bridgeToken,
        targetDeployment.chainId,
        targetDeployment.contracts.bridge,
        activeWallet,
        amountRawValue,
        '0x',
      )
      const receipt = await tx.wait()
      const event = (receipt.events || []).find((item: any) => item.event === 'MessageSent')
      if (!event?.args) throw new Error('MessageSent event was not found.')
      const message: RelayMessage = {
        messageId: event.args.messageId,
        sourceChainId: Number(event.args.sourceChainId),
        targetChainId: Number(event.args.targetChainId),
        sourceBridge: event.args.sourceBridge,
        sourceToken: event.args.sourceToken,
        recipient: event.args.recipient,
        amount: event.args.amount.toString(),
        nonce: event.args.nonce.toString(),
        payload: event.args.payload || '0x',
        createdAt: Date.now(),
      }
      const next = [message, ...readPending().filter((item) => item.messageId !== message.messageId)]
      writePending(next)
      setPending(next)
      selectMessage(message)
      setToast(`Message ${short(message.messageId)} is ready for the admin relayer.`)
      await refresh()
    } catch (error: any) {
      setToast(error?.reason || error?.data?.message || error?.message || 'Bridge request failed.')
    } finally {
      setBusy(false)
    }
  }

  async function executeMessage() {
    if (!activeWallet) {
      onConnect()
      return
    }
    if (!bridge || !selected) {
      setToast('Select a pending source-chain message first.')
      return
    }
    if (!isRelayer) {
      setToast('The connected wallet is not the configured bridge admin/relayer.')
      return
    }
    if (activeChainId !== selected.targetChainId) {
      const target = protocolDeployment(selected.targetChainId)
      if (target) {
        setToast(`Switch wallet to ${target.network}, then execute the destination message.`)
        await switchTo(target)
      }
      return
    }
    try {
      setBusy(true)
      setToast(`Confirm destination mint on ${deployment?.network || 'target chain'}…`)
      const tx = await bridge.executeMessage(
        selected.messageId,
        Number(sourceChain),
        sourceBridge,
        sourceToken,
        recipient,
        rawAmount,
        nonce,
        payload || '0x',
      )
      await tx.wait()
      const next = readPending().filter((item) => item.messageId !== selected.messageId)
      writePending(next)
      setPending(next)
      setSelected(null)
      setToast(`Message ${short(selected.messageId)} executed and destination cUSD minted.`)
      await refresh()
    } catch (error: any) {
      setToast(error?.reason || error?.data?.message || error?.message || 'Message execution failed.')
    } finally {
      setBusy(false)
    }
  }

  const sourceNetwork = deployment?.network || 'SOURCE CHAIN'
  const targetNetwork = targetDeployment?.network || 'TARGET CHAIN'
  const configured = Boolean(deployment && targetDeployment)

  return (
    <div className="defi-fade-in protocol-page bridge-page">
      <div className="protocol-hero bridge-hero">
        <div className="protocol-hero-copy">
          <div className="defi-eyebrow">TRUSTED MESSAGE BRIDGE</div>
          <h1>Move a message. Let the chain mint the proof.</h1>
          <p>Custos keeps the bridge intentionally legible: source-chain burn, emitted message, admin relayer handoff, destination-chain mint. Every step has an onchain receipt.</p>
          <div className="protocol-hero-actions"><button type="button" className="defi-primary-button" onClick={() => document.getElementById('bridge-console')?.scrollIntoView({ behavior: 'smooth' })}><ArrowLeftRight size={15} /> Open bridge console</button><div className="bridge-admin-pill"><span className="defi-status-dot" />{isRelayer ? 'RELAYER WALLET' : 'USER MODE'}</div></div>
        </div>
        <div className="bridge-visual"><div className="bridge-visual-chain source"><span className="bridge-visual-dot" /><strong>{sourceNetwork}</strong><small>LOCK / BURN</small></div><div className="bridge-visual-line"><span /><span /><span /></div><div className="bridge-visual-chain target"><span className="bridge-visual-dot" /><strong>{targetNetwork}</strong><small>MINT / RELEASE</small></div><div className="bridge-visual-relayer"><Radio size={14} /> RELAYER MESSAGE</div></div>
      </div>

      <div className="bridge-flow-strip"><div className="bridge-flow-step active"><span>01</span><LockKeyhole size={16} /><strong>Source burn</strong><small>user signs</small></div><ArrowRight className="bridge-flow-arrow" size={18} /><div className="bridge-flow-step"><span>02</span><Send size={16} /><strong>Admin relay</strong><small>message copied</small></div><ArrowRight className="bridge-flow-arrow" size={18} /><div className="bridge-flow-step"><span>03</span><UnlockKeyhole size={16} /><strong>Destination mint</strong><small>admin executes</small></div></div>

      {!configured ? <section className="defi-card protocol-empty-state"><ArrowLeftRight size={23} /><h3>Two configured protocol networks are required.</h3><p>Deploy the local pair first. The deployment script writes both bridge addresses and token pairs into the frontend protocol registry.</p></section> : null}

      <section id="bridge-console" className="bridge-console-grid">
        <div className="defi-card bridge-transfer-card">
          <div className="protocol-form-heading"><div className="protocol-icon"><ArrowLeftRight size={17} /></div><div><div className="defi-eyebrow">USER TRANSFER</div><h3>Bridge cUSD to {targetNetwork}.</h3></div></div>
          <div className="bridge-network-row"><div><span>FROM</span><strong>{sourceNetwork}</strong><small>{short(deployment?.contracts.bridge || '')}</small></div><ArrowRight size={18} /><div><span>TO</span><strong>{targetNetwork}</strong><small>{short(targetDeployment?.contracts.bridge || '')}</small></div></div>
          <label className="bridge-amount-label">Amount <span>Balance {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} cUSD</span><div className="bridge-amount-input"><input aria-label="Bridge amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><span>cUSD</span></div></label>
          <div className="bridge-recipient-box"><span>RECIPIENT</span><strong>{activeWallet ? activeWallet : 'Connect wallet to populate recipient'}</strong></div>
          <button type="button" className="defi-primary-button full" disabled={busy || !configured} onClick={() => void bridgeOut()}>{busy ? <Loader2 className="protocol-spin" size={15} /> : <Send size={15} />} Burn and create relay message</button>
          <p className="protocol-inline-note"><ShieldCheck size={13} /> The source token is burned by the bridge contract; no admin can redirect the recipient.</p>
          {!activeWallet ? <button type="button" className="defi-secondary-button full" onClick={onConnect}>Connect wallet</button> : null}
        </div>

        <div className="defi-card bridge-config-card"><div className="protocol-form-heading"><div className="protocol-icon"><Clipboard size={17} /></div><div><div className="defi-eyebrow">ONCHAIN CONFIGURATION</div><h3>Verify the trusted pair.</h3></div></div><div className="bridge-config-list"><div><span>LOCAL BRIDGE</span><strong>{short(deployment?.contracts.bridge || '')}</strong><small>admin + relayer controlled</small></div><div><span>REMOTE BRIDGE</span><strong>{short(targetDeployment?.contracts.bridge || '')}</strong><small>trusted remote registered</small></div><div><span>LOCAL ASSET</span><strong>{short(deployment?.contracts.bridgeToken || '')}</strong><small>burnable cUSD</small></div><div><span>REMOTE ASSET</span><strong>{short(targetDeployment?.contracts.bridgeToken || '')}</strong><small>mintable paired cUSD</small></div></div><button type="button" className="defi-secondary-button" onClick={() => void refresh()}><RefreshCw size={14} /> Refresh balance and role</button></div>
      </section>

      <section className="bridge-relayer-section">
        <div className="protocol-section-heading"><div><div className="defi-eyebrow">ADMIN RELAYER WORKBENCH</div><h2>Carry the event between chains.</h2><p>The UI never pretends this step is automatic. Select a source event, switch to the destination network, and execute it with the configured admin/relayer wallet.</p></div><div className={`protocol-chain-chip ${isRelayer ? 'success' : ''}`}><span className="defi-status-dot" />{isRelayer ? 'AUTHORIZED RELAYER' : 'READ-ONLY UNTIL ADMIN CONNECTS'}</div></div>
        <div className="bridge-relayer-grid">
          <div className="defi-card bridge-inbox-card"><div className="bridge-card-heading"><div><span>MESSAGE INBOX</span><h3>{pending.length} pending handoff{pending.length === 1 ? '' : 's'}</h3></div><button type="button" className="icon-button" aria-label="Refresh pending messages" onClick={() => void refresh()}><RefreshCw size={15} /></button></div>{pending.length === 0 ? <div className="bridge-inbox-empty"><Radio size={18} /><p>Source events appear here after a user signs a bridge request in this browser.</p></div> : <div className="bridge-message-list">{pending.map((message) => <button type="button" key={message.messageId} className={`bridge-message-row ${selected?.messageId === message.messageId ? 'active' : ''}`} onClick={() => selectMessage(message)}><span className="bridge-message-status" /><div><strong>{short(message.messageId)}</strong><small>{message.sourceChainId} → {message.targetChainId} · {formatUnits(message.amount, 18)} cUSD</small></div><ArrowRight size={14} /></button>)}</div>}</div>
          <div className="defi-card bridge-execute-card"><div className="bridge-card-heading"><div><span>DESTINATION EXECUTION</span><h3>Admin message payload</h3></div>{isRelayer ? <span className="protocol-state live"><Check size={12} /> AUTHORIZED</span> : null}</div><div className="bridge-relay-form"><label>Message ID<input value={selected?.messageId || ''} onChange={(event) => setSelected((value) => value ? { ...value, messageId: event.target.value } : { messageId: event.target.value, sourceChainId: Number(sourceChain) || 0, targetChainId, sourceBridge, sourceToken, recipient, amount: rawAmount, nonce, payload, createdAt: Date.now() })} placeholder="0x message id" /></label><div className="bridge-two-fields"><label>Source chain<input value={sourceChain} onChange={(event) => setSourceChain(event.target.value)} /></label><label>Nonce<input value={nonce} onChange={(event) => setNonce(event.target.value)} placeholder="uint256" /></label></div><div className="bridge-two-fields"><label>Raw amount<input value={rawAmount} onChange={(event) => setRawAmount(event.target.value)} placeholder="uint256" /></label><label>Payload bytes<input value={payload} onChange={(event) => setPayload(event.target.value)} /></label></div><label>Source bridge<input value={sourceBridge} onChange={(event) => setSourceBridge(event.target.value)} placeholder="0x source bridge" /></label><label>Source token<input value={sourceToken} onChange={(event) => setSourceToken(event.target.value)} placeholder="0x source token" /></label><label>Recipient<input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x recipient" /></label></div><div className="bridge-execute-actions"><button type="button" className="defi-secondary-button" onClick={() => selected && void navigator.clipboard?.writeText(JSON.stringify(selected))}><Copy size={14} /> Copy payload</button><button type="button" className="defi-primary-button" disabled={busy || !selected} onClick={() => void executeMessage()}>{busy ? <Loader2 className="protocol-spin" size={15} /> : <UnlockKeyhole size={15} />} {activeChainId === selected?.targetChainId ? 'Execute destination mint' : 'Switch and execute'}</button></div></div>
        </div>
      </section>

      <section className="defi-card bridge-network-table"><div className="bridge-card-heading"><div><span>PROTOCOL REGISTRY</span><h3>Configured chain endpoints</h3></div><ExternalLink size={15} /></div><div className="bridge-network-list">{configuredNetworks.map((item) => <div key={item.chainId}><div className="bridge-network-name"><span className="defi-status-dot" /><strong>{item.network}</strong><small>{item.chainId}</small></div><span>{short(item.contracts.bridge)}</span><button type="button" className="icon-button" aria-label={`Switch to ${item.network}`} onClick={() => void switchTo(item)}><ArrowRight size={14} /></button></div>)}</div></section>

      <div className="protocol-disclaimer"><ShieldCheck size={15} /><span>Bridge assets are testnet representations. The relayer is intentionally centralized for this phase; production would require threshold signing, fraud proofs or a finalized messaging protocol.</span><button type="button" aria-label="Copy bridge address" onClick={() => deployment && void navigator.clipboard?.writeText(deployment.contracts.bridge)}><Copy size={13} /></button></div>
    </div>
  )
}
