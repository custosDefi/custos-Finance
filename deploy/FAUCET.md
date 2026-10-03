# Address-only, gas-sponsored GIWA faucet

User flow: `/reality/faucet` (alias `/defi/faucet`) → paste address → optional
Turnstile human verification → durable request → official operator calls
`CustosTestnetFaucet.claimFor(address)` → contract pays native GIWA test ETH.
No recipient wallet connection, signature, existing ETH or approval is needed.
The official operator pays gas; the contract reserve supplies the payout.
The header entry is hidden under the three-dot **More pages** menu immediately
after Account. The portalled menu supports keyboard focus, Escape, outside
click and narrow/mobile scrolling without clipping its Faucet link.

## Safety and operator responsibilities

- Only the contract's operator can distribute; the owner's immutable address
  can pause, rotate the operator, and recover unused funds while paused.
- Amount and cooldown are immutable. The owner can change the daily payout
  cap while paused with `setDailyLimit(uint256 wei)`. Already-distributed ETH
  for the current UTC day is never reset by a limit change. Deployment defaults
  are 0.001 ETH per address / 24 hours / 1 ETH per UTC day.
  Confirm these limits and the official operator account before deployment.
- Mainnet deployment is rejected. Address cooldowns are not Sybil protection.
  CAPTCHA defaults to required; explicit `FAUCET_CAPTCHA_REQUIRED=false`
  permits address-only claims without calling/loading Turnstile. Six attempts
  per hour per IP and the daily chain budget still apply. Request budget follows
  `dailyLimit / claimAmount` (1000 at 1 ETH / 0.001 ETH); an optional stricter
  `FAUCET_DAILY_REQUEST_LIMIT` may be configured. Without CAPTCHA, multi-IP/
  multi-address farming remains possible and can consume the daily budget.
- API signer is exclusively `FAUCET_OPERATOR_PRIVATE_KEY`; there is NO implicit
  reuse of the Bridge Relayer/CFI key. Use a separately funded official wallet
  that is not submitting transactions in another service (nonce ownership).
- Server checks chain ID, operator, contract, eligibility, reserve, transaction
  simulation and bounded gas including OP Stack L1 fee. A payout cannot spend
  from the operator's ETH balance beyond its transaction fee.
- SQLite queue survives restart. It saves raw signed bytes/hash before sending,
  retries transient RPC preparation errors with bounded backoff before signing,
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
FAUCET_CAPTCHA_REQUIRED=false
FAUCET_CONTRACT_ADDRESS=<verified deployed address>
FAUCET_OPERATOR_PRIVATE_KEY=<dedicated official sender key>
FAUCET_TURNSTILE_SITE_KEY=<public site key>
FAUCET_TURNSTILE_SECRET=<private CAPTCHA secret>
FAUCET_ALLOWED_ORIGINS=https://custosfinance.xyz,https://www.custosfinance.xyz
FAUCET_TRUSTED_PROXY_CIDRS=<exact internal nginx proxy IP or subnet>
```

`FAUCET_DATABASE_PATH=/data/faucet.db` is already wired to the durable volume.
Configure Turnstile hostnames and action `faucet`. No CAPTCHA bypass is provided.
The current user-authorized deployment uses address-only mode; this is not a
test token, mocked verification, or a request-controlled CAPTCHA bypass.
This applies when CAPTCHA is required; address-only mode is an explicit server
configuration, never a flag accepted from a caller. Without valid signer,
contract and any required CAPTCHA configuration, the page explicitly
shows unavailable and submissions return 503; other services remain unaffected.
When the contract and dedicated signer are configured but CAPTCHA/activation
is missing, config still returns actual chain-read reserve, amount and pause
state. This read-only display does not start a worker or authorize a payout.
The frontend retains only public request metadata in sessionStorage so a page
reload continues checking the same request; no CAPTCHA token or key is stored.

Trust forwarded IP only from the actual private nginx proxy range, never
0.0.0.0/0. Existing nginx overwrites X-Real-IP. Without a trusted proxy setting,
the server safely rate-limits the immediate peer (shared proxy), not forged
headers. With Cloudflare, configure nginx's validated Cloudflare real-IP ranges
separately if per-visitor limits are required; do not blindly trust public
CF-Connecting-IP headers. Preserve the API's loopback-only binding/firewall.
VM Nginx now includes verified Cloudflare proxy ranges, replaces X-Real-IP with
the resolved visitor IP, and ignores forged Cloudflare headers on direct access.
The API trusts only the private Compose bridge subnet for this overwritten IP.

API: `GET /api/faucet/config`, `POST /api/faucet/requests` with
`{address}` (or `{address, captchaToken}` when required), `GET /api/faucet/requests/{id}`. Signing runs only in
the server worker, not request handlers or frontend. `FAUCET_ENABLED` alone
does not authorize deployment or transfer of funds.

## Initial immutable-cap deployment and real-chain checks — 2026-10-03

- Contract: `0x857cd2B7FAC430b88E34bD0DbBDb4cc69Aa1d251`.
- Owner: `0xCb440121395fcE13bcA9a5D5ED826b2A47Ede44F`.
- Dedicated operator: `0xc504b7eE17CA998bF0AEd2F24eA4f1ED013C130a`.
- 0.001 ETH deposit/recovery passed before the authorized 4 ETH deposit.
- Operator paid gas for a real 0.001 ETH payout to an initially empty test
  wallet; duplicate claim simulation was rejected by the onchain cooldown.
- Public transaction hashes and receiver are in
  `contracts/launch-bridge/deployments/history/giwa-faucet-37643031.json`. Signed bytes/keys are
  excluded from git and from the public deployment record.
- Historical reserve after this test: 3.999 ETH. The owner restored pause. Until genuine
  Turnstile credentials are supplied, keep FAUCET_ENABLED=false. The direct
  operator test and isolated API/CAPTCHA fixture do NOT prove a production
  website request or genuine human verification has completed.
  These were the initial deployment conditions, superseded by the explicitly
  authorized address-only adjustable-cap migration below.

## Changing the current daily budget without redeploying

Using the current deployment record's owner wallet, call `setPaused(true)`,
then `setDailyLimit(1000000000000000000)` for 1 ETH, then `setPaused(false)`.
Only the owner can do this. Limits below one claim are rejected. The API reads
the new chain value automatically; no rebuild, env edit, counter reset or new
contract is needed. Lowering the limit below today's payouts stops further
claims until the next UTC day or a valid increase. Operator cannot change it.

The current adjustable-cap contract is
`0x08a9e665fC13e65021DA8e8b2C8993Db843d5Fb7`, owner and operator unchanged.
The old immutable-cap contract above was paused and emptied by its owner;
3.999 ETH was recovered for migration. Its public record is archived under
`deployments/history/giwa-faucet-37643031.json`. Future cap changes use the
setter rather than migration.
