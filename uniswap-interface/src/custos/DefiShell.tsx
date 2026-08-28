import React, { useMemo, useState } from 'react'
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu as MenuIcon, X } from 'lucide-react'

import AddLiquidity from '../pages/AddLiquidity'
import Pool from '../pages/Pool'
import PoolFinder from '../pages/PoolFinder'
import RemoveLiquidity from '../pages/RemoveLiquidity'
import Swap from '../pages/Swap'
import { useActiveWeb3React } from '../hooks'
import { useETHBalances } from '../state/wallet/hooks'
import Menu from '../components/Menu'
import Popups from '../components/Popups'
import Web3Status from '../components/Web3Status'
import I18nSwitch from '../components/I18nSwitch'
import {
  CuratedRwaLaunchPage,
  MarketPage,
  PermissionlessLaunchPage,
} from './AssetHubPages'
import type { AssetListing } from './AssetHubPages'

type WorkspaceTab = 'swap' | 'market' | 'launch' | 'rwa-launch'

type NavItem = {
  id: WorkspaceTab
  label: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'swap', label: 'Swap', description: 'Trade listed tokens' },
  { id: 'market', label: 'Market', description: 'Discover assets and projects' },
  { id: 'launch', label: 'Launch', description: 'List a community token' },
  { id: 'rwa-launch', label: 'RWA Launch', description: 'Submit a curated project' },
]

function tabFromLocation(pathname: string, search: string): WorkspaceTab {
  const queryTab = new URLSearchParams(search).get('tab')
  if (pathname === '/defi' || pathname === '/defi/overview') {
    if (queryTab === 'markets' || queryTab === 'market') return 'market'
    if (queryTab === 'launch') return 'launch'
    if (queryTab === 'rwa-launch' || queryTab === 'rwa') return 'rwa-launch'
    return 'swap'
  }

  const segment = pathname.split('/')[2]
  if (segment === 'markets') return 'market'
  if (segment === 'rwa') return 'rwa-launch'
  if (NAV_ITEMS.some((item) => item.id === segment)) return segment as WorkspaceTab
  return 'swap'
}

function pathForTab(tab: WorkspaceTab) {
  return tab === 'swap' ? '/defi' : '/defi/' + tab
}

function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <img
      src="/custos-icon.png"
      alt="Custos Finance"
      width={size}
      height={size}
      className="defi-logo-mark"
    />
  )
}

function WorkspaceContent({
  tab,
  account,
  setToast,
  go,
  openSwap,
}: {
  tab: WorkspaceTab
  account: string | null | undefined
  setToast: (value: string) => void
  go: (next: WorkspaceTab) => void
  openSwap: (listing: AssetListing) => void
}) {
  if (tab === 'market') {
    return (
      <MarketPage
        setToast={setToast}
        onSwap={openSwap}
      />
    )
  }

  if (tab === 'launch') {
    return (
      <PermissionlessLaunchPage
        account={account}
        onMarket={() => go('market')}
        setToast={setToast}
      />
    )
  }

  if (tab === 'rwa-launch') {
    return (
      <CuratedRwaLaunchPage
        account={account}
        onMarket={() => go('market')}
        setToast={setToast}
      />
    )
  }

  return (
    <div className="defi-core-page">
      <Swap />
    </div>
  )
}

export default function DefiShell() {
  const history = useHistory()
  const location = useLocation()
  const { account, chainId } = useActiveWeb3React()
  const ethBalance = useETHBalances(account ? [account] : [])?.[account || '']
  const [navOpen, setNavOpen] = useState(false)
  const [toast, setToast] = useState('')
  const tab = tabFromLocation(location.pathname, location.search)
  const numericChainId = Number(chainId || 0)

  const networkLabel = useMemo(() => {
    if (numericChainId === 47805) return 'LOCAL TESTNET'
    if (numericChainId === 91342) return 'GIWA SEPOLIA'
    if (numericChainId) return 'CHAIN ' + numericChainId
    return 'NETWORK NOT CONNECTED'
  }, [numericChainId])

  const go = (next: WorkspaceTab) => {
    setNavOpen(false)
    history.push(pathForTab(next))
  }

  const openSwap = (listing: AssetListing) => {
    setNavOpen(false)
    history.push({
      pathname: '/defi',
      search: listing.tokenAddress ? '?outputCurrency=' + encodeURIComponent(listing.tokenAddress) : '',
    })
    setToast(listing.symbol + ' selected in Swap. The project is responsible for maintaining liquidity.')
  }

  const activeTab = NAV_ITEMS.some((item) => item.id === tab) ? tab : 'swap'

  return (
    <div className="defi-app">
      <Popups />
      <div className="defi-grid-overlay" />
      <main className="defi-main">
        <header className="defi-topbar">
          <div className="defi-topbar-left">
            <button type="button" className="defi-brand" onClick={() => go('swap')}>
              <LogoMark size={58} />
              <span><strong>Custos Finance</strong><small>SWAP · LAUNCH · MARKET</small></span>
            </button>
          </div>
          <nav className="defi-top-nav" aria-label="Custos Finance navigation">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                className={'defi-top-nav-item ' + (activeTab === id ? 'active' : '')}
                onClick={() => go(id)}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="defi-topbar-right">
            <div className="defi-top-network"><span className="defi-status-dot" />{networkLabel}</div>
            {account && ethBalance ? <span className="defi-eth-balance">{ethBalance.toSignificant(4)} ETH</span> : null}
            <div className="defi-wallet-button"><Web3Status /></div>
            <Menu />
            <I18nSwitch />
            <button
              type="button"
              className="defi-mobile-menu"
              onClick={() => setNavOpen((open) => !open)}
              aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={navOpen}
            >
              {navOpen ? <X size={19} /> : <MenuIcon size={19} />}
            </button>
          </div>
          {navOpen ? (
            <nav className="defi-mobile-nav" aria-label="Custos Finance mobile navigation">
              {NAV_ITEMS.map(({ id, label, description }) => (
                <button
                  type="button"
                  key={id}
                  className={'defi-mobile-nav-item ' + (activeTab === id ? 'active' : '')}
                  onClick={() => go(id)}
                >
                  <span>{label}</span>
                  <small>{description}</small>
                  {activeTab === id ? <ArrowUpRight size={15} /> : null}
                </button>
              ))}
            </nav>
          ) : null}
        </header>

        <div className="defi-content">
          <Switch>
            <Route exact path="/defi/liquidity/v2" render={() => <div className="defi-core-page"><Pool /></div>} />
            <Route exact path="/swap" render={() => <Redirect to="/defi" />} />
            <Route exact path="/swap/:outputCurrency" render={() => <Redirect to="/defi" />} />
            <Route exact path={['/send', '/pool', '/create']} render={() => <Redirect to="/defi" />} />
            <Route exact path="/find" render={() => <div className="defi-core-page"><PoolFinder /></div>} />
            <Route exact path="/add" component={AddLiquidity} />
            <Route exact path="/add/:currencyIdA" component={AddLiquidity} />
            <Route exact path="/add/:currencyIdA/:currencyIdB" component={AddLiquidity} />
            <Route exact path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
            <Route path="/defi" render={() => <WorkspaceContent tab={tab} account={account} setToast={setToast} go={go} openSwap={openSwap} />} />
            <Redirect to="/defi" />
          </Switch>
        </div>
      </main>

      {toast ? <div className="defi-toast" role="status" onClick={() => setToast('')}>{toast}<X size={14} /></div> : null}
    </div>
  )
}
