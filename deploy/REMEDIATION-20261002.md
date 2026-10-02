# Full-site remediation — 2026-10-02

Scope: repair findings from the full-site audit and deploy without changing
contracts, private keys, user balances, existing databases or Relayer state.

## Applied changes

- Root persistent disk expanded online from 10 GB to 30 GB; `/dev/sda1` ext4
  grown in place. About 20 GB free afterward (30% used). No logs/images deleted.
  Existing daily snapshot policy remains attached. This increases disk billing.
- `custos-allow-web` now permits only tcp:80; existing HTTPS rule remains.
  Compose binds API port 8000 to loopback only. Nginx retains internal API/WS
  access; SSH, certificates and Relayer ports/state are unchanged.
- Nginx security headers: HSTS, nosniff, same-origin framing, restricted
  base/object/frame-ancestor CSP, Referrer-Policy and Permissions-Policy.
  Header include is repeated where cache directives override inheritance.
- Rankings table scrollport is positioned relative, anchoring absolutely
  positioned screen-reader labels inside it. The table remains horizontally
  scrollable without widening the whole mobile document.
- Explorer helper maps GIWA and Ethereum Sepolia explicitly; GIWA link labels
  no longer say Etherscan.
- Removed retired WalletConnect v1, Portis and Fortmatic connectors/menu items.
  Injected/MetaMask and Coinbase access remain. No QR v2 replacement is claimed;
  it needs its own project configuration. Avatar artwork uses a dependency-free
  public-address SVG instead of the vulnerable legacy color parser.
- Compatible security patches locked for ws, routing regex, hashing, secp256k1
  v3 and semver v5. Frontend production dependency audit changed from 57 findings
  (4 critical, 20 high, 18 moderate) to 17 low-only findings. Yarn lock is updated;
  npm override equivalents are included for local installs.
- Pyth Core errors return structured 503, not a successful empty/unsigned quote.
  Public-chain transactions cannot use the local mock or testnet fallback path.
  New perpetual orders require a fresh real Pyth quote; collateral withdrawal
  remains available independently of the oracle. Local mocks remain supported.
- History failures return safe structured errors, not upstream HTML/provider
  internals. UI displays the explanatory message. Perp health separates loaded
  credentials from actual fresh Pyth data and reports degraded status.

## External constraints — not falsely marked resolved

The current credential is loaded, but Pyth rejects every requested Pro feed and
Core BTC/ETH with `Not entitled`. An unauthenticated Core request returns 401.
Only a correctly entitled credential or provider-side grant can restore live
Pyth data. No keys were changed, printed or committed; no subscription purchased.
CFI Binance quotes and native/Relayer bridges are independent of Pyth.

The 17 remaining low dependency advisories propagate from elliptic/Ethers v5
and legacy Coinbase crypto helpers. Compatibility-preserving patched releases
cannot remove all of them. Resolving them requires a planned wallet/Ethers major
migration with transaction/signature regression tests; arbitrary cross-major
overrides are not a valid security fix. This is not a mainnet security audit.

## Verification

Remote main's real on-chain OHLC candles and red/green volume update (`4bdbec2`)
was merged before building, including its 4h/1d chart resolutions.
Frontend: 175 tests passed, TypeScript and fresh production build passed.
Backend: 46 tests passed, including denied/malformed oracle payload rejection,
local mock compatibility, structured history errors and degraded health.
Relayer: 3 persistence/retry/replay tests passed. Browser regression checks cover
mobile page containment with independent table scrolling, GIWA explorer links,
nonzero V2 quotes, retired-wallet removal and the disabled stale-oracle order.
Deployment/live verification and rollback details are added after the switch.
