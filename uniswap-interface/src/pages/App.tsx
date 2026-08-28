import React, { Suspense } from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Web3ReactManager from '../components/Web3ReactManager'
import DefiShell from '../custos/DefiShell'
import CustosLandingPage from '../custos/CustosLandingPage'

/**
 * Custos application routes.
 *
 * The landing page owns the public `/` experience.  Everything behind it is
 * deliberately grouped under `/defi`, so the product is not presented as a
 * single-purpose swap page even though the Custos V2 swap and LP primitives
 * remain available inside the workspace.
 */
export default function App() {
  return (
    <Suspense fallback={null}>
      <HashRouter>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <Switch>
          <Route exact path={['/', '/index.html']} component={CustosLandingPage} />
          <Route
            path={['/defi', '/swap', '/send', '/pool', '/find', '/create', '/add', '/remove']}
            render={() => (
              <Web3ReactManager>
                <DefiShell />
              </Web3ReactManager>
            )}
          />
          <Redirect to="/" />
        </Switch>
      </HashRouter>
    </Suspense>
  )
}
