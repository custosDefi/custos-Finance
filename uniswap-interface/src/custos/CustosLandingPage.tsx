import React, { useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  BadgeCheck,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  Globe2,
  Layers3,
  Menu,
  ShieldCheck,
  UploadCloud,
  Wallet,
  X,
} from 'lucide-react'

const MARKET_CARDS = [
  {
    symbol: 'COMMUNITY',
    title: 'Community tokens',
    category: 'Permissionless listing · unverified',
    image: '/assets/markets/silver.png',
    route: '/defi/market',
  },
  {
    symbol: 'CURATED RWA',
    title: 'Selected projects',
    category: 'White-list review · information first',
    image: '/assets/markets/gold.png',
    route: '/defi/market',
  },
  {
    symbol: 'SWAP',
    title: 'Listed pools',
    category: 'Existing Token + Pool required',
    image: '/assets/markets/oil.png',
    route: '/defi',
  },
]

const STEPS = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect a wallet',
    body: 'Use an EVM wallet on the target L2. Browsing Market does not require a wallet.',
  },
  {
    number: '02',
    icon: UploadCloud,
    title: 'Submit an asset',
    body: 'List a community token openly, or send a complete RWA project file for review.',
  },
  {
    number: '03',
    icon: FileCheck2,
    title: 'Make the status clear',
    body: 'Market shows whether a listing is community, under review, curated or connected to a pool.',
  },
  {
    number: '04',
    icon: Layers3,
    title: 'Trade through Swap',
    body: 'When a project provides a Token and Pool, users can enter the existing V2 Swap.',
  },
] as const

function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/custos-icon.png"
      alt="Custos Finance"
      width={size}
      height={size}
      className="landing-logo-mark"
    />
  )
}

function LandingHeader({ onEnter }: { onEnter: () => void }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['JOURNEY', 'journey'],
    ['BENEFITS', 'benefits'],
    ['MARKET', 'markets'],
  ] as const

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <a className="landing-brand" href="#top" onClick={(event) => scrollToSection(event, 'top')}>
          <LogoMark />
          <span>
            <strong>Custos Finance</strong>
            <small>SWAP · LAUNCH · MARKET</small>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Landing page navigation">
          {links.map(([label, id]) => (
            <a key={id} href={'#' + id} onClick={(event) => scrollToSection(event, id)}>{label}</a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <button type="button" className="landing-enter-button" onClick={onEnter}>ENTER CUSTOS <ArrowUpRight size={13} /></button>
          <button
            type="button"
            className="landing-mobile-toggle"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="landing-mobile-nav" aria-label="Mobile landing navigation">
          {links.map(([label, id]) => (
            <a key={id} href={'#' + id} onClick={(event) => { setOpen(false); scrollToSection(event, id) }}>{label}</a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onEnter() }}>ENTER CUSTOS <ArrowUpRight size={14} /></button>
        </nav>
      ) : null}
    </header>
  )
}

export default function CustosLandingPage() {
  const goToMarket = () => { window.location.hash = '/defi/market' }
  const goToLaunch = () => { window.location.hash = '/defi/launch' }
  const goToRwaLaunch = () => { window.location.hash = '/defi/rwa-launch' }
  const goToSwap = () => { window.location.hash = '/defi' }

  return (
    <div className="landing-page">
      <section id="top" className="landing-hero">
        <div className="landing-hero-media" aria-hidden="true">
          <img src="/assets/hero-field.png" alt="" />
          <div className="landing-hero-wash" />
        </div>
        <LandingHeader onEnter={goToSwap} />

        <div className="landing-hero-content">
          <p className="landing-kicker">ASSETS · L2 · OPEN ACCESS</p>
          <h1>
            <span>Bring assets onchain.</span>
            <em>Launch clearly. Discover carefully. Swap when liquidity is ready.</em>
          </h1>
          <div className="landing-hero-actions">
            <button type="button" className="landing-primary-button" onClick={goToMarket}>Explore Market <ArrowUpRight size={15} /></button>
            <button type="button" className="landing-secondary-button" onClick={goToLaunch}>Launch a token <ArrowUpRight size={14} /></button>
          </div>
          <p className="landing-disclaimer"><ShieldCheck size={12} /> METADATA-FIRST · NO CUSTODY · NO GUARANTEED VALUE</p>
        </div>
      </section>

      <section id="journey" className="landing-section landing-flow-section">
        <div className="landing-section-heading landing-flow-heading">
          <div>
            <p className="landing-kicker">THE CUSTOS FLOW</p>
            <h2>One directory. <span>Two launch tracks.</span></h2>
          </div>
          <p>Custos separates open community listings from curated RWA submissions, then connects assets to one existing Swap surface when projects provide liquidity.</p>
        </div>
        <div className="landing-step-grid">
          {STEPS.map(({ number, icon: Icon, title, body }) => (
            <article key={number} className="landing-step-card">
              <div className="landing-step-meta"><span>{number}</span><Icon size={17} /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="landing-section landing-benefits-section">
        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <div className="landing-feature-label"><BarChart3 size={16} /> PERMISSIONLESS</div>
            <div className="landing-feature-copy">
              <h2>Open submission, explicit risk.</h2>
              <p>Anyone can submit a standard token listing. Community assets are clearly marked unverified, and no submission is treated as an audit, endorsement or liquidity promise.</p>
              <button type="button" className="landing-outline-button" onClick={goToLaunch}>Open Launch <ArrowUpRight size={13} /></button>
            </div>
          </article>
          <article className="landing-feature-card landing-feature-image-card">
            <img src="/assets/markets/gold.png" alt="" />
            <div className="landing-feature-image-wash" />
            <div className="landing-feature-copy">
              <div className="landing-feature-label"><BadgeCheck size={16} /> CURATED RWA</div>
              <h2>Evidence before exposure.</h2>
              <p>Selected RWA projects can submit issuer, custody, jurisdiction, legal-document and proof references for a human review workflow.</p>
              <button type="button" className="landing-outline-button" onClick={goToRwaLaunch}>Submit an RWA project <ArrowUpRight size={13} /></button>
            </div>
          </article>
        </div>
      </section>

      <section id="markets" className="landing-section landing-markets-section">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">MARKET PREVIEW</p>
            <h2>Start with information, then trade.</h2>
          </div>
          <button type="button" className="landing-text-button" onClick={goToMarket}>Open Market <ArrowUpRight size={14} /></button>
        </div>
        <div className="landing-market-grid">
          {MARKET_CARDS.map((market) => (
            <button type="button" key={market.symbol} className="landing-market-card" onClick={() => { window.location.hash = market.route }}>
              <div className="landing-market-image"><img src={market.image} alt="" /><span>INFO</span></div>
              <div className="landing-market-body">
                <p className="landing-market-pair">{market.symbol}</p>
                <h3>{market.title}</h3>
                <p>{market.category}</p>
                <div className="landing-market-action">Open surface <ArrowUpRight size={13} /></div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="launch-cta" className="landing-section landing-cta-section">
        <div className="landing-cta-card">
          <div className="landing-cta-copy">
            <div className="landing-feature-label"><CircleDollarSign size={16} /> ASSET HUB · TESTNET READY</div>
            <h2>Keep the product small enough to ship and useful enough to grow.</h2>
            <p>Custos does not custody real assets, mint unreviewed tokens, provide market-making capital or guarantee redemption. Projects remain responsible for their assets, documents and liquidity.</p>
          </div>
          <div className="landing-cta-actions">
            <button type="button" className="landing-secondary-button" onClick={goToRwaLaunch}>Submit RWA <ArrowUpRight size={14} /></button>
            <button type="button" className="landing-primary-button" onClick={goToSwap}>Enter Swap <ArrowUpRight size={14} /></button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><LogoMark size={30} /><span>CUSTOS · ASSET HUB</span></div>
        <span><Globe2 size={12} /> STANDARD TOKENS · EXTERNAL LIQUIDITY · CLEAR STATUS</span>
        <a href="https://github.com/custosDefi/custos-Finance" target="_blank" rel="noreferrer">SOURCE <ExternalLink size={11} /></a>
      </footer>
    </div>
  )
}
