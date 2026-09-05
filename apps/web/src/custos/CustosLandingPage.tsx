import React, { useEffect, useState } from 'react'
import './homepage.css'

function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function BrandSymbol({ className = 'brand-symbol' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5">
        <path d="M49 19.5A21 21 0 1 0 49 44.5" />
        <path d="M41.3 25.1a11.5 11.5 0 1 0 0 13.8" />
      </g>
      <path d="M34 32h16.4" stroke="#35b978" strokeWidth="5" />
    </svg>
  )
}

function LargeBrandSymbol({ className = 'hero-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="38">
        <path d="M391.91 157.25A168 168 0 1 0 391.91 354.75" />
        <path d="M330.43 201.92A92 92 0 1 0 330.43 310.08" />
      </g>
      <path d="M270 256H401" stroke="#35b978" strokeWidth="38" />
    </svg>
  )
}

function LandingHeader({ onEnter }: { onEnter: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  const links = [
    ['System', 'system'],
    ['Markets', 'markets'],
    ['Proof', 'proof'],
    ['Season 1', 'season'],
  ] as const

  const navigateTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false)
    scrollToSection(event, id)
  }

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label="Custos Finance home" onClick={(event) => navigateTo(event, 'top')}>
        <BrandSymbol />
        <span>CUSTOS FINANCE</span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>

      <nav className={`primary-nav${open ? ' is-open' : ''}`} id="primary-nav" aria-label="Primary navigation">
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={(event) => navigateTo(event, id)}>{label}</a>
        ))}
      </nav>

      <a className="header-cta" href="#/defi" onClick={onEnter}>
        Launch testnet <span aria-hidden="true">↗</span>
      </a>
    </header>
  )
}

function HomepageMarketRow({ number, code, name, variant }: { number: string; code: string; name: string; variant: string }) {
  return (
    <a className="market-row" href="#/defi?tab=markets">
      <span className="market-no">{number}</span>
      <span className="market-code">{code}</span>
      <span className="market-name">{name}</span>
      <span className={`market-line ${variant}`} aria-hidden="true"><i /></span>
      <span className="market-state">24H MARKET</span>
      <span className="market-arrow" aria-hidden="true">↗</span>
    </a>
  )
}

export default function CustosLandingPage() {
  const goToTerminal = () => { window.location.hash = '/defi' }
  const goToSeason = () => { window.location.hash = '/defi?tab=season' }

  return (
    <div className="homepage">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="ambient-blocks ambient-blocks--left" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <LandingHeader onEnter={goToTerminal} />

        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" /> GIWA SEPOLIA · PUBLIC TESTNET</p>
          <h1 id="hero-title">CUSTOS FINANCE</h1>
          <p className="hero-kicker">RWA EXCHANGE ON GIWA</p>
          <p className="hero-tagline">REAL ASSETS. VISIBLE PROOF.</p>
          <p className="hero-description">
            A unified onchain terminal for real-world assets, spot markets and perpetuals—built for transparent execution from one wallet.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#/defi" onClick={goToTerminal}>
              Enter Custos <span aria-hidden="true">↗</span>
            </a>
            <a className="button button--ghost" href="#markets" onClick={(event) => scrollToSection(event, 'markets')}>
              Explore markets <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <LargeBrandSymbol />
          <span className="art-block art-block--one" />
          <span className="art-block art-block--two" />
          <span className="art-block art-block--three" />
          <span className="art-block art-block--green" />
        </div>

        <div className="hero-index" aria-hidden="true">01 / 05</div>
        <div className="hero-scroll" aria-hidden="true"><span /> SCROLL TO EXPLORE</div>
      </section>

      <section className="ticker" aria-label="Custos system highlights">
        <div><span>01</span><strong>RWA</strong><small>Pyth-anchored markets</small></div>
        <div><span>02</span><strong>SPOT</strong><small>Unified collateral</small></div>
        <div><span>03</span><strong>PERPETUALS</strong><small>One trading terminal</small></div>
        <div><span>04</span><strong>GIWA</strong><small>Built on testnet</small></div>
      </section>

      <section className="system section" id="system" aria-labelledby="system-title">
        <div className="section-label"><span>01</span> THE SYSTEM</div>
        <div className="section-heading">
          <h2 id="system-title">ONE WALLET.<br />THREE MARKET LAYERS.</h2>
          <p>Custos brings fragmented markets into one deliberate flow. Deposit once, move across the stack and keep every position in view.</p>
        </div>

        <div className="layer-grid">
          <article className="layer-card layer-card--featured">
            <div className="card-topline"><span>01</span><span>REAL-WORLD ASSETS</span></div>
            <div className="layer-glyph layer-glyph--rings" aria-hidden="true" />
            <h3>RWA</h3>
            <p>Trade synthetic exposure to gold, silver and oil with transparent oracle anchoring.</p>
            <a href="#markets" onClick={(event) => scrollToSection(event, 'markets')}>View RWA markets <span>↗</span></a>
          </article>
          <article className="layer-card">
            <div className="card-topline"><span>02</span><span>LIQUID MARKETS</span></div>
            <div className="layer-glyph layer-glyph--grid" aria-hidden="true" />
            <h3>SPOT</h3>
            <p>Move between core assets without leaving the Custos terminal or fragmenting collateral.</p>
            <a href="#/defi?tab=spot">Open terminal <span>↗</span></a>
          </article>
          <article className="layer-card">
            <div className="card-topline"><span>03</span><span>CAPITAL EFFICIENCY</span></div>
            <div className="layer-glyph layer-glyph--bars" aria-hidden="true"><i /><i /><i /><i /></div>
            <h3>PERPETUALS</h3>
            <p>Express directional views through a focused interface designed for fast market decisions.</p>
            <a href="#/defi?tab=perpetuals">Explore perps <span>↗</span></a>
          </article>
        </div>
      </section>

      <section className="markets section" id="markets" aria-labelledby="markets-title">
        <div className="section-label section-label--light"><span>02</span> LIVE MARKET PREVIEW</div>
        <div className="market-heading">
          <div>
            <p className="eyebrow"><span className="status-dot" /> PYTH-ANCHORED · INDICATIVE</p>
            <h2 id="markets-title">REAL MARKETS.<br />ONCHAIN ACCESS.</h2>
          </div>
          <p>Purpose-built market views for the assets people already understand.</p>
        </div>

        <div className="market-list">
          <HomepageMarketRow number="01" code="XAU" name="GOLD / tUSDC" variant="market-line--one" />
          <HomepageMarketRow number="02" code="XAG" name="SILVER / tUSDC" variant="market-line--two" />
          <HomepageMarketRow number="03" code="WTI" name="OIL / tUSDC" variant="market-line--three" />
        </div>
        <p className="market-disclaimer">PUBLIC TESTNET · SYNTHETIC ASSETS · NO CASH VALUE</p>
      </section>

      <section className="proof section" id="proof" aria-labelledby="proof-title">
        <div className="section-label"><span>03</span> VISIBLE PROOF</div>
        <div className="proof-layout">
          <div className="proof-copy">
            <h2 id="proof-title">BUILT TO MAKE<br />THE SIGNAL VISIBLE.</h2>
            <p>Price inputs, collateral movement and market access belong in one legible system—not behind layers of interfaces.</p>
          </div>
          <div className="proof-items">
            <article>
              <span className="proof-no">01</span>
              <h3>PYTH ANCHORED</h3>
              <p>Oracle-linked pricing gives each RWA market a transparent reference point.</p>
            </article>
            <article>
              <span className="proof-no">02</span>
              <h3>UNIFIED tUSDC</h3>
              <p>One collateral layer keeps the journey between markets direct and understandable.</p>
            </article>
            <article>
              <span className="proof-no">03</span>
              <h3>GIWA NATIVE</h3>
              <p>Custos is being developed inside the GIWA ecosystem from testnet to production.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="season section" id="season" aria-labelledby="season-title">
        <div className="season-blocks" aria-hidden="true"><span /><span /><span /></div>
        <div className="season-copy">
          <p className="eyebrow"><span className="status-dot" /> SEASON 1 · NOW OPEN</p>
          <h2 id="season-title">ENTER EARLY.<br />BUILD YOUR SIGNAL.</h2>
          <p>Explore the testnet, complete the market journey and follow Custos as the next layer comes online.</p>
          <a className="button button--primary" href="#/defi?tab=season" onClick={goToSeason}>
            Join Season 1 <span>↗</span>
          </a>
        </div>
        <LargeBrandSymbol className="season-mark" />
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <BrandSymbol />
          <div><strong>CUSTOS FINANCE</strong><small>RWA EXCHANGE ON GIWA</small></div>
        </div>
        <div className="footer-links">
          <a href="#markets" onClick={(event) => scrollToSection(event, 'markets')}>Markets</a>
          <a href="#proof" onClick={(event) => scrollToSection(event, 'proof')}>Proof</a>
          <a href="#season" onClick={(event) => scrollToSection(event, 'season')}>Season 1</a>
        </div>
        <div className="footer-meta"><span>GIWA SEPOLIA</span><span>TESTNET ONLINE</span><span>© {new Date().getFullYear()} CUSTOS</span></div>
      </footer>
    </div>
  )
}
