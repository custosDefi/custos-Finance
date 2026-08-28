import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'

export type AssetChannel = 'permissionless' | 'curated_rwa'
export type ListingStatus = 'submitted' | 'review' | 'approved' | 'listed' | 'paused' | 'rejected'

export type AssetListing = {
  id: number
  channel: AssetChannel
  channelLabel: string
  name: string
  symbol: string
  decimals: number
  supplyModel: string
  description: string
  creatorWallet: string
  assetType: string
  issuer: string
  jurisdiction: string
  custodyProvider: string
  documentUri: string
  auditUri: string
  proofHash: string
  metadataUri: string
  tokenAddress: string
  poolAddress: string
  status: ListingStatus
  featured: boolean
  curated: boolean
  contractAttached: boolean
  poolAttached: boolean
  reviewer: string
  riskNote: string
  createdAt: string
  updatedAt: string
}

type MarketFilter = 'all' | 'permissionless' | 'curated_rwa'

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8001'
    : typeof window !== 'undefined'
      ? window.location.origin
      : 'http://127.0.0.1:8001')

const STATUS_LABELS: Record<ListingStatus, string> = {
  submitted: 'SUBMITTED',
  review: 'IN REVIEW',
  approved: 'APPROVED',
  listed: 'LISTED',
  paused: 'PAUSED',
  rejected: 'REJECTED',
}

function shorten(value: string, start = 7, end = 5) {
  if (!value) return 'Not attached'
  if (value.length <= start + end + 3) return value
  return value.slice(0, start) + '…' + value.slice(-end)
}

function statusClass(status: ListingStatus) {
  return 'asset-hub-status asset-hub-status-' + status
}

function isExternalUri(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

function openUri(value: string) {
  if (isExternalUri(value)) window.open(value, '_blank', 'noopener,noreferrer')
}

function ListingBadges({ listing }: { listing: AssetListing }) {
  return (
    <div className="asset-hub-badges">
      <span className={statusClass(listing.status)}>{STATUS_LABELS[listing.status]}</span>
      <span className="asset-hub-badge">{listing.curated ? 'CURATED RWA' : 'COMMUNITY'}</span>
      {listing.featured ? <span className="asset-hub-badge accent">FEATURED</span> : null}
    </div>
  )
}

function ListingCard({
  listing,
  onDetails,
  onSwap,
}: {
  listing: AssetListing
  onDetails: () => void
  onSwap: () => void
}) {
  return (
    <article className="asset-hub-card">
      <div className="asset-hub-card-top">
        <div className="asset-hub-token-mark">{listing.symbol.slice(0, 2)}</div>
        <ListingBadges listing={listing} />
      </div>
      <div className="asset-hub-card-heading">
        <div>
          <p className="asset-hub-symbol">{listing.symbol}</p>
          <h2>{listing.name}</h2>
        </div>
        <Sparkles size={17} className={listing.curated ? 'asset-hub-icon-accent' : 'asset-hub-icon-muted'} />
      </div>
      <p className="asset-hub-card-description">{listing.description}</p>
      <div className="asset-hub-card-meta">
        <span>{listing.assetType || 'Community token'}</span>
        <span>{listing.issuer || 'Creator supplied'}</span>
      </div>
      <div className="asset-hub-card-actions">
        <button type="button" className="asset-hub-button secondary" onClick={onDetails}>
          Details <ArrowUpRight size={14} />
        </button>
        {listing.contractAttached && listing.poolAttached ? (
          <button type="button" className="asset-hub-button primary" onClick={onSwap}>
            Open Swap <ArrowUpRight size={14} />
          </button>
        ) : (
          <span className="asset-hub-pending">Liquidity pending</span>
        )}
      </div>
    </article>
  )
}

function ListingDetails({
  listing,
  onClose,
  onSwap,
}: {
  listing: AssetListing
  onClose: () => void
  onSwap: () => void
}) {
  const rows = [
    ['Issuer', listing.issuer || 'Not provided'],
    ['Jurisdiction', listing.jurisdiction || 'Not provided'],
    ['Custody / service', listing.custodyProvider || 'Not applicable'],
    ['Token contract', shorten(listing.tokenAddress)],
    ['Swap pool', shorten(listing.poolAddress)],
    ['Creator', shorten(listing.creatorWallet)],
    ['Reviewer', listing.reviewer || 'Not reviewed'],
  ]

  return (
    <aside className="asset-hub-detail">
      <div className="asset-hub-detail-header">
        <div>
          <div className="asset-hub-eyebrow">ASSET DETAIL</div>
          <h2>{listing.name}</h2>
          <p>{listing.symbol} · {listing.channelLabel}</p>
        </div>
        <button type="button" className="asset-hub-icon-button" onClick={onClose} aria-label="Close details">
          <X size={17} />
        </button>
      </div>
      <ListingBadges listing={listing} />
      <div className="asset-hub-detail-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {listing.curated ? (
        <div className="asset-hub-proof-list">
          <div><FileText size={15} /><span>Legal documents</span><button type="button" disabled={!isExternalUri(listing.documentUri)} onClick={() => openUri(listing.documentUri)}>{listing.documentUri ? 'Open' : 'Missing'}</button></div>
          <div><ClipboardCheck size={15} /><span>Audit / assessment</span><button type="button" disabled={!isExternalUri(listing.auditUri)} onClick={() => openUri(listing.auditUri)}>{listing.auditUri ? 'Open' : 'Missing'}</button></div>
          <div><LinkIcon size={15} /><span>Proof hash</span><strong>{shorten(listing.proofHash, 10, 8)}</strong></div>
        </div>
      ) : null}
      <div className="asset-hub-risk-box">
        <CircleAlert size={16} />
        <p>{listing.riskNote}</p>
      </div>
      {listing.contractAttached && listing.poolAttached ? (
        <button type="button" className="asset-hub-button primary full" onClick={onSwap}>
          Trade through existing Swap <ArrowUpRight size={15} />
        </button>
      ) : null}
    </aside>
  )
}

export function MarketPage({
  onSwap,
  setToast,
}: {
  onSwap: (listing: AssetListing) => void
  setToast: (value: string) => void
}) {
  const [listings, setListings] = useState<AssetListing[]>([])
  const [filter, setFilter] = useState<MarketFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AssetListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE + '/api/assets', { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.detail || 'Asset API returned ' + response.status)
      setListings(Array.isArray(body) ? body : [])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Asset data is temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visibleListings = useMemo(() => {
    const query = search.trim().toLowerCase()
    return listings.filter((listing) => {
      const matchesFilter = filter === 'all' || listing.channel === filter
      const matchesSearch =
        !query ||
        [listing.name, listing.symbol, listing.assetType, listing.issuer]
          .join(' ')
          .toLowerCase()
          .includes(query)
      return matchesFilter && matchesSearch
    })
  }, [filter, listings, search])

  return (
    <div className="asset-hub-page defi-fade-in">
      <div className="asset-hub-heading">
        <div>
          <div className="defi-eyebrow">CUSTOS MARKET</div>
          <h1>Discover assets before you trade.</h1>
          <p>One directory for community tokens, curated projects and RWA information. Only listings with an attached Token and Pool can open the existing Swap.</p>
        </div>
        <button type="button" className="defi-secondary-button" onClick={() => void refresh()}>
          {loading ? <Loader2 size={15} className="asset-hub-spin" /> : <Search size={15} />}
          {loading ? 'Refreshing…' : 'Refresh market'}
        </button>
      </div>

      <div className="asset-hub-notice">
        <ShieldCheck size={17} />
        <span>Market is informational. A listing is not a token audit, legal approval, custody promise or investment recommendation.</span>
      </div>

      <div className="asset-hub-toolbar">
        <div className="asset-hub-tabs" role="tablist" aria-label="Market filters">
          {([
            ['all', 'All assets'],
            ['permissionless', 'Community tokens'],
            ['curated_rwa', 'Curated RWA'],
          ] as const).map(([value, label]) => (
            <button type="button" role="tab" aria-selected={filter === value} key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <label className="asset-hub-search">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or symbol" aria-label="Search assets" />
        </label>
      </div>

      {error ? <div className="asset-hub-empty error"><CircleAlert size={18} /><span>{error}</span><button type="button" onClick={() => void refresh()}>Try again</button></div> : null}
      {!loading && !error && visibleListings.length === 0 ? (
        <div className="asset-hub-empty"><Search size={20} /><span>No listings match this filter.</span></div>
      ) : null}
      <div className="asset-hub-market-layout">
        <div className="asset-hub-grid">
          {visibleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onDetails={() => setSelected(listing)}
              onSwap={() => onSwap(listing)}
            />
          ))}
        </div>
        {selected ? <ListingDetails listing={selected} onClose={() => setSelected(null)} onSwap={() => onSwap(selected)} /> : null}
      </div>

      <div className="asset-hub-footnote">
        <BadgeCheck size={15} />
        <span>Featured means selected for the curated view; it does not mean guaranteed value, redemption or liquidity.</span>
        <button type="button" onClick={() => { setFilter('curated_rwa'); setToast('Showing the curated RWA view.') }}>View curated RWA</button>
      </div>
    </div>
  )
}

type LaunchFormBase = {
  name: string
  symbol: string
  decimals: string
  supply_model: string
  description: string
  creator_wallet: string
  metadata_uri: string
  token_address: string
  pool_address: string
}

const INITIAL_LAUNCH_FORM: LaunchFormBase = {
  name: '',
  symbol: '',
  decimals: '18',
  supply_model: 'Fixed supply',
  description: '',
  creator_wallet: '',
  metadata_uri: '',
  token_address: '',
  pool_address: '',
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="asset-hub-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function LaunchResult({ listing, onMarket }: { listing: AssetListing; onMarket: () => void }) {
  return (
    <div className="asset-hub-success">
      <CheckCircle2 size={20} />
      <div>
        <strong>{listing.name} submitted</strong>
        <p>{listing.curated ? 'The submission is waiting for curated review.' : 'The listing is visible in Market as an unverified community token.'} No token was minted by Custos.</p>
      </div>
      <button type="button" className="asset-hub-button secondary" onClick={onMarket}>Open Market</button>
    </div>
  )
}

export function PermissionlessLaunchPage({
  account,
  onMarket,
  setToast,
}: {
  account: string | null | undefined
  onMarket: () => void
  setToast: (value: string) => void
}) {
  const [form, setForm] = useState<LaunchFormBase>(INITIAL_LAUNCH_FORM)
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AssetListing | null>(null)

  useEffect(() => {
    if (account && !form.creator_wallet) setForm((previous) => ({ ...previous, creator_wallet: account }))
  }, [account, form.creator_wallet])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!riskAcknowledged) {
      setError('Please acknowledge the community-token risk disclosure.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(API_BASE + '/api/launch/permissionless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, decimals: Number(form.decimals), risk_acknowledged: true }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.detail || 'Launch submission failed.')
      setResult(body.listing as AssetListing)
      setToast('Community listing created. No token was minted by Custos.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Launch submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LaunchPageFrame
      eyebrow="PERMISSIONLESS LAUNCH"
      title="List a community token."
      description="Anyone can submit a standard token listing. The first release records metadata and connects an existing Token/Pool; it does not deploy a token or provide liquidity."
      icon={<UploadCloud size={20} />}
      notice="Permissionless means open submission, not open endorsement. Users should independently review the contract, creator and liquidity."
    >
      {result ? <LaunchResult listing={result} onMarket={onMarket} /> : null}
      <form className="asset-hub-form" onSubmit={submit}>
        <div className="asset-hub-form-section">
          <div className="asset-hub-form-section-heading"><span>01</span><div><h2>Token information</h2><p>Use the address fields only if the token and pool already exist.</p></div></div>
          <div className="asset-hub-form-grid">
            <FormField label="Token name" name="name" value={form.name} required placeholder="Example Token" onChange={(value) => setForm({ ...form, name: value })} />
            <FormField label="Symbol" name="symbol" value={form.symbol} required placeholder="EXM" onChange={(value) => setForm({ ...form, symbol: value })} />
            <FormField label="Decimals" name="decimals" value={form.decimals} required type="number" onChange={(value) => setForm({ ...form, decimals: value })} />
            <FormField label="Supply model" name="supply_model" value={form.supply_model} required placeholder="Fixed supply" onChange={(value) => setForm({ ...form, supply_model: value })} />
          </div>
          <label className="asset-hub-field full"><span>Description *</span><textarea name="description" required minLength={10} value={form.description} placeholder="What is this token for?" onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        </div>
        <div className="asset-hub-form-section">
          <div className="asset-hub-form-section-heading"><span>02</span><div><h2>References</h2><p>These references are displayed as supplied and are not verified by Custos.</p></div></div>
          <div className="asset-hub-form-grid">
            <FormField label="Creator wallet" name="creator_wallet" value={form.creator_wallet} placeholder="0x…" onChange={(value) => setForm({ ...form, creator_wallet: value })} />
            <FormField label="Metadata URI" name="metadata_uri" value={form.metadata_uri} placeholder="ipfs://…" onChange={(value) => setForm({ ...form, metadata_uri: value })} />
            <FormField label="Token contract (optional)" name="token_address" value={form.token_address} placeholder="0x…" onChange={(value) => setForm({ ...form, token_address: value })} />
            <FormField label="Swap pool (optional)" name="pool_address" value={form.pool_address} placeholder="0x…" onChange={(value) => setForm({ ...form, pool_address: value })} />
          </div>
        </div>
        <label className="asset-hub-check">
          <input type="checkbox" checked={riskAcknowledged} onChange={(event) => setRiskAcknowledged(event.target.checked)} />
          <span>I understand that this is an unverified community listing, and Custos does not audit, issue, custody or guarantee this token. *</span>
        </label>
        {error ? <div className="asset-hub-form-error"><CircleAlert size={16} /> {error}</div> : null}
        <button type="submit" className="asset-hub-button primary large" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="asset-hub-spin" /> : <UploadCloud size={16} />}
          {submitting ? 'Submitting…' : 'Create listing'}
        </button>
      </form>
    </LaunchPageFrame>
  )
}

export function CuratedRwaLaunchPage({
  account,
  onMarket,
  setToast,
}: {
  account: string | null | undefined
  onMarket: () => void
  setToast: (value: string) => void
}) {
  const [form, setForm] = useState<LaunchFormBase & {
    asset_type: string
    issuer: string
    jurisdiction: string
    custody_provider: string
    document_uri: string
    audit_uri: string
    proof_hash: string
  }>({
    ...INITIAL_LAUNCH_FORM,
    asset_type: '',
    issuer: '',
    jurisdiction: '',
    custody_provider: '',
    document_uri: '',
    audit_uri: '',
    proof_hash: '',
  })
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AssetListing | null>(null)

  useEffect(() => {
    if (account && !form.creator_wallet) setForm((previous) => ({ ...previous, creator_wallet: account }))
  }, [account, form.creator_wallet])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!riskAcknowledged) {
      setError('Please acknowledge the RWA disclosure.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(API_BASE + '/api/launch/curated-rwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, decimals: Number(form.decimals), risk_acknowledged: true }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.detail || 'RWA submission failed.')
      setResult(body.listing as AssetListing)
      setToast('RWA submission received. It is waiting for review.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'RWA submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LaunchPageFrame
      eyebrow="CURATED RWA LAUNCH"
      title="Submit a project for review."
      description="This is the white-list track for selected real-world-asset projects. A submission enters review; it does not mean legal approval, custody, redemption or guaranteed value."
      icon={<ShieldCheck size={20} />}
      notice="Curated status describes the information and review workflow only. The issuer and custody provider remain responsible for their claims and obligations."
    >
      {result ? <LaunchResult listing={result} onMarket={onMarket} /> : null}
      <form className="asset-hub-form" onSubmit={submit}>
        <div className="asset-hub-form-section">
          <div className="asset-hub-form-section-heading"><span>01</span><div><h2>Project and asset</h2><p>These fields become part of the public information page.</p></div></div>
          <div className="asset-hub-form-grid">
            <FormField label="Project / asset name" name="name" value={form.name} required placeholder="Receivable Pool" onChange={(value) => setForm({ ...form, name: value })} />
            <FormField label="Symbol" name="symbol" value={form.symbol} required placeholder="RWA1" onChange={(value) => setForm({ ...form, symbol: value })} />
            <FormField label="Asset type" name="asset_type" value={form.asset_type} required placeholder="Trade receivable" onChange={(value) => setForm({ ...form, asset_type: value })} />
            <FormField label="Jurisdiction" name="jurisdiction" value={form.jurisdiction} required placeholder="Singapore" onChange={(value) => setForm({ ...form, jurisdiction: value })} />
          </div>
          <label className="asset-hub-field full"><span>Project description *</span><textarea name="description" required minLength={10} value={form.description} placeholder="Describe the asset, issuance and intended market use." onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        </div>
        <div className="asset-hub-form-section">
          <div className="asset-hub-form-section-heading"><span>02</span><div><h2>Parties and evidence</h2><p>Use links or content-addressed references that reviewers can inspect.</p></div></div>
          <div className="asset-hub-form-grid">
            <FormField label="Issuer" name="issuer" value={form.issuer} required placeholder="Legal issuer" onChange={(value) => setForm({ ...form, issuer: value })} />
            <FormField label="Custody / service provider" name="custody_provider" value={form.custody_provider} required placeholder="Custodian or administrator" onChange={(value) => setForm({ ...form, custody_provider: value })} />
            <FormField label="Legal documents URI" name="document_uri" value={form.document_uri} required placeholder="https://…" onChange={(value) => setForm({ ...form, document_uri: value })} />
            <FormField label="Audit / assessment URI" name="audit_uri" value={form.audit_uri} required placeholder="https://…" onChange={(value) => setForm({ ...form, audit_uri: value })} />
            <FormField label="Asset proof hash" name="proof_hash" value={form.proof_hash} required placeholder="0x… or sha256:…" onChange={(value) => setForm({ ...form, proof_hash: value })} />
            <FormField label="Creator / contact wallet" name="creator_wallet" value={form.creator_wallet} placeholder="0x…" onChange={(value) => setForm({ ...form, creator_wallet: value })} />
            <FormField label="Metadata URI" name="metadata_uri" value={form.metadata_uri} placeholder="ipfs://…" onChange={(value) => setForm({ ...form, metadata_uri: value })} />
            <FormField label="Token contract (optional)" name="token_address" value={form.token_address} placeholder="0x…" onChange={(value) => setForm({ ...form, token_address: value })} />
            <FormField label="Swap pool (optional)" name="pool_address" value={form.pool_address} placeholder="0x…" onChange={(value) => setForm({ ...form, pool_address: value })} />
            <FormField label="Supply model" name="supply_model" value={form.supply_model} required placeholder="Fixed supply" onChange={(value) => setForm({ ...form, supply_model: value })} />
          </div>
        </div>
        <label className="asset-hub-check">
          <input type="checkbox" checked={riskAcknowledged} onChange={(event) => setRiskAcknowledged(event.target.checked)} />
          <span>I confirm that the submitted information is accurate to the best of my knowledge, and understand that Custos review is not legal, regulatory, custody or investment approval. *</span>
        </label>
        {error ? <div className="asset-hub-form-error"><CircleAlert size={16} /> {error}</div> : null}
        <button type="submit" className="asset-hub-button primary large" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="asset-hub-spin" /> : <ClipboardCheck size={16} />}
          {submitting ? 'Sending for review…' : 'Submit for curated review'}
        </button>
      </form>
    </LaunchPageFrame>
  )
}

function LaunchPageFrame({
  eyebrow,
  title,
  description,
  icon,
  notice,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  icon: React.ReactNode
  notice: string
  children: React.ReactNode
}) {
  return (
    <div className="asset-hub-page defi-fade-in">
      <div className="asset-hub-heading launch">
        <div>
          <div className="defi-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="asset-hub-launch-icon">{icon}</div>
      </div>
      <div className="asset-hub-notice">
        <CircleAlert size={17} />
        <span>{notice}</span>
      </div>
      {children}
    </div>
  )
}
