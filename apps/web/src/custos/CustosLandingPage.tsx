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
  Lock,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react'

const MARKET_CARDS = [
  {
    symbol: 'XAU / USD',
    title: 'Gold',
    category: 'Precious metal · Pyth reference',
    image: '/assets/markets/gold.png',
  },
  {
    symbol: 'XAG / USD',
    title: 'Silver',
    category: 'Precious metal · Pyth reference',
    image: '/assets/markets/silver.png',
  },
  {
    symbol: 'WTI / USD',
    title: 'WTI Crude Oil',
    category: 'Energy · Pyth reference',
    image: '/assets/markets/oil.png',
  },
]

const STEPS = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect GIWA',
    body: 'Connect an EVM wallet on GIWA Sepolia and keep test ETH for gas.',
  },
  {
    number: '02',
    icon: CircleDollarSign,
    title: 'Claim shared tUSDC',
    body: 'Use the Custos Finance testnet faucet. The same tUSDC works across Spot and Perpetuals.',
  },
  {
    number: '03',
    icon: FileCheck2,
    title: 'Explore real markets',
    body: 'Follow Pyth reference prices and OHLC candles for Gold, Silver and WTI.',
  },
  {
    number: '04',
    icon: Layers3,
    title: 'Trade, LP or open Perps',
    body: 'Swap synthetic spot assets, provide tUSDC liquidity, or trade perpetuals.',
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
    ['MARKETS', 'markets'],
  ] as const

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <a className="landing-brand" href="#top" onClick={(event) => scrollToSection(event, 'top')}>
          <LogoMark />
          <span>
            <strong>Custos Finance</strong>
            <small>RWA · SPOT · PERPETUALS</small>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Landing page navigation">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={(event) => scrollToSection(event, id)}>{label}</a>
          ))}
          <a href="#season-cta" onClick={(event) => scrollToSection(event, 'season-cta')}>SEASON 1</a>
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
            <a key={id} href={`#${id}`} onClick={(event) => { setOpen(false); scrollToSection(event, id) }}>{label}</a>
          ))}
          <a href="#season-cta" onClick={(event) => { setOpen(false); scrollToSection(event, 'season-cta') }}>SEASON 1</a>
          <button type="button" onClick={() => { setOpen(false); onEnter() }}>ENTER CUSTOS <ArrowUpRight size={14} /></button>
        </nav>
      ) : null}
    </header>
  )
}

export default function CustosLandingPage() {
  const goToMarkets = () => { window.location.hash = '/defi?tab=markets' }
  const goToSeason = () => { window.location.hash = '/defi?tab=season' }
  const goToTerminal = () => { window.location.hash = '/defi' }

  return (
    <div className="landing-page">
      <section id="top" className="landing-hero">
        <div className="landing-hero-media" aria-hidden="true">
          <img src="/assets/hero-field.png" alt="" />
          <div className="landing-hero-wash" />
        </div>
        <LandingHeader onEnter={goToTerminal} />

        <div className="landing-hero-content">
          <p className="landing-kicker">REAL MARKETS · GIWA SEPOLIA</p>
          <h1>
            <span>Real markets, moving onchain.</span>
            <em>Gold. Silver. Oil. One unified terminal.</em>
          </h1>
          <div className="landing-hero-actions">
            <button type="button" className="landing-primary-button" onClick={goToMarkets}>Explore live markets <ArrowUpRight size={15} /></button>
            <button type="button" className="landing-secondary-button" onClick={goToSeason}>Join Season 1 <ArrowUpRight size={14} /></button>
          </div>
          <p className="landing-disclaimer"><Lock size={12} /> PUBLIC TESTNET · SYNTHETIC ASSETS · NO CASH VALUE</p>
        </div>
      </section>

      <section id="journey" className="landing-section landing-flow-section">
        <div className="landing-section-heading landing-flow-heading">
          <div>
            <p className="landing-kicker">THE CUSTOS FLOW</p>
            <h2>One wallet. <span>Three market layers.</span></h2>
          </div>
          <p>Connect once, claim shared tUSDC, follow Pyth real-world reference prices, then use Spot, Liquidity and Perpetuals from one GIWA Sepolia account.</p>
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
            <div className="landing-feature-label"><ShieldCheck size={16} /> PYTH-ANCHORED</div>
            <div className="landing-feature-copy">
              <h2>Every market begins with a real reference.</h2>
              <p>Gold, Silver and WTI use Pyth reference data for live market context and historical OHLC candles, while the GIWA contracts remain transparent testnet instruments.</p>
              <button type="button" className="landing-outline-button" onClick={goToMarkets}>Explore real markets <ArrowUpRight size={13} /></button>
            </div>
          </article>
          <article className="landing-feature-card landing-feature-image-card">
            <img src="/assets/markets/gold.png" alt="Gold bullion" />
            <div className="landing-feature-image-wash" />
            <div className="landing-feature-copy">
              <div className="landing-feature-label"><BarChart3 size={16} /> UNIFIED tUSDC</div>
              <h2>Spot, liquidity and perpetuals share one test asset.</h2>
              <p>The same tUSDC contract is used as the Spot quote asset, one-sided LP inventory and Perpetuals collateral, keeping the testnet flow simple.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="markets" className="landing-section landing-markets-section">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">LIVE MARKET PREVIEW</p>
            <h2>Choose a real-world reference market.</h2>
          </div>
          <button type="button" className="landing-text-button" onClick={goToMarkets}>Open all live markets <ArrowUpRight size={14} /></button>
        </div>
        <div className="landing-market-grid">
          {MARKET_CARDS.map((market) => (
            <button type="button" key={market.symbol} className="landing-market-card" onClick={goToMarkets}>
              <div className="landing-market-image"><img src={market.image} alt={market.title} /><span>LIVE</span></div>
              <div className="landing-market-body">
                <p className="landing-market-pair">{market.symbol}</p>
                <h3>{market.title}</h3>
                <p>{market.category}</p>
                <div className="landing-market-action">Open market <ArrowUpRight size={13} /></div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="season-cta" className="landing-section landing-cta-section">
        <div className="landing-cta-card">
          <div className="landing-cta-copy">
            <div className="landing-feature-label"><BadgeCheck size={16} /> PUBLIC BETA · SEASON 1</div>
            <h2>Open participation on GIWA Sepolia. Real market data, testnet execution.</h2>
            <p>rXAU, rXAG, rWTI and tUSDC are synthetic testnet assets. They are not redeemable for physical commodities, cash, securities or any legally enforceable real-world claim. Season points do not guarantee tokens, rewards or monetary value.</p>
          </div>
          <div className="landing-cta-actions">
            <button type="button" className="landing-secondary-button" onClick={goToSeason}>Join Season 1 <ArrowUpRight size={14} /></button>
            <button type="button" className="landing-primary-button" onClick={goToTerminal}>Enter Custos <ArrowUpRight size={14} /></button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><LogoMark size={30} /><span>CUSTOS · GIWA SEPOLIA</span></div>
        <span><Globe2 size={12} /> PYTH CORE = ONCHAIN SETTLEMENT ORACLE</span>
        <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noreferrer">EXPLORER <ExternalLink size={11} /></a>
      </footer>
    </div>
  )
}
