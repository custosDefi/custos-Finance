# Address-only, gas-sponsored GIWA faucet

User flow: `/reality/faucet` (alias `/defi/faucet`) → paste address → Turnstile
human verification → durable request → official operator calls
`CustosTestnetFaucet.claimFor(address)` → contract pays native GIWA test ETH.
No recipient wallet connection, signature, existing ETH or approval is needed.
The official operator pays gas; the contract reserve supplies the payout.
The header entry is hidden under the three-dot **More pages** menu immediately
after Account. The portalled menu supports keyboard focus, Escape, outside
click and narrow/mobile scrolling without clipping its Faucet link.

## Safety and operator responsibilities

- Only the contract's operator can distribute; the owner's immutable address
  can pause, rotate the operator, and recover unused funds while paused.
- Amount, cooldown and daily payout cap are immutable. Deployment script's
  proposed defaults are 0.001 ETH per address / 24 hours / 0.1 ETH per UTC day.
  Confirm these limits and the official operator account before deployment.
- Mainnet deployment is rejected. Address cooldowns are not Sybil protection.
  CAPTCHA, six attempts/hour per client and 100 requests/day limit service use.
- API signer is exclusively `FAUCET_OPERATOR_PRIVATE_KEY`; there is NO implicit
  reuse of the Bridge Relayer/CFI key. Use a separately funded official wallet
  that is not submitting transactions in another service (nonce ownership).
- Server checks chain ID, operator, contract, eligibility, reserve, transaction
  simulation and bounded gas including OP Stack L1 fee. A payout cannot spend
  from the operator's ETH balance beyond its transaction fee.
- SQLite queue survives restart. It saves raw signed bytes/hash before sending,
  serializes account nonces across workers, deduplicates active recipient jobs,
  and retries uncertain broadcasts with identical bytes. Two confirmations are
  required before reporting delivery. Failed/unknown RPC responses never claim
  success. An unresolved nonce stops subsequent sends for operator review.
- Don't delete/reset faucet.db or change the signer while a transaction is
  unresolved. `attention` jobs require manual onchain inspection; no automatic
  new-nonce replacement. Keep regular persistent-volume snapshots.
- Public job responses never expose private keys, CAPTCHA secrets or raw signed
  transaction bytes. Only a validated receiving address and CAPTCHA token are
  accepted; callers cannot specify calldata, payout amounts, sender or RPC URLs.

## Deployment (not run automatically)

`npm run test:faucet` in `contracts/launch-bridge` runs an isolated Ganache test.
`TEST_PYTHON=/path/to/api/venv/bin/python npm run test:faucet:service` also runs
the real API signer/queue against a fresh localhost Ganache chain, using only
random local keys and a test-only CAPTCHA transport. It proves a zero-ETH
recipient is paid and API restart does not duplicate the transaction.
The private deployer env file must set PRIVATE_KEY and FAUCET_OPERATOR_ADDRESS;
optional FAUCET_CLAIM_ETH, FAUCET_COOLDOWN_SECONDS and FAUCET_DAILY_ETH specify
the approved limits. Keys must stay in ignored private files.

`node scripts/deploy-faucet.cjs /absolute/private/env/path` is read-only dry run.
Only adding `--send` deploys; deployment never automatically funds the contract.
Saved pending signed bytes live in ignored artifacts/ with mode 600. A verified
public address record is written to deployments/giwa-faucet.json.

After explicit approval, separately deposit the agreed test ETH into the
contract and fund the official operator with test ETH for gas. Confirm code,
owner/operator and immutable limits before enabling distribution.

## VM configuration

Store the private signer and Turnstile secret only in root-owned mode-600
`/opt/custos/.env`. Compose injects these optional settings; default is disabled:

```
FAUCET_ENABLED=true
FAUCET_CONTRACT_ADDRESS=<verified deployed address>
FAUCET_OPERATOR_PRIVATE_KEY=<dedicated official sender key>
FAUCET_TURNSTILE_SITE_KEY=<public site key>
FAUCET_TURNSTILE_SECRET=<private CAPTCHA secret>
FAUCET_ALLOWED_ORIGINS=https://custosfinance.xyz,https://www.custosfinance.xyz
FAUCET_TRUSTED_PROXY_CIDRS=<exact internal nginx proxy IP or subnet>
```

`FAUCET_DATABASE_PATH=/data/faucet.db` is already wired to the durable volume.
Configure Turnstile hostnames and action `faucet`. No CAPTCHA bypass is provided.
Without valid signer, contract and CAPTCHA configuration, the page explicitly
shows unavailable and submissions return 503; other services remain unaffected.

Trust forwarded IP only from the actual private nginx proxy range, never
0.0.0.0/0. Existing nginx overwrites X-Real-IP. Without a trusted proxy setting,
the server safely rate-limits the immediate peer (shared proxy), not forged
headers. With Cloudflare, configure nginx's validated Cloudflare real-IP ranges
separately if per-visitor limits are required; do not blindly trust public
CF-Connecting-IP headers. Preserve the API's loopback-only binding/firewall.

API: `GET /api/faucet/config`, `POST /api/faucet/requests` with
`{address, captchaToken}`, `GET /api/faucet/requests/{id}`. Signing runs only in
the server worker, not request handlers or frontend. `FAUCET_ENABLED` alone
does not authorize deployment or transfer of funds.
