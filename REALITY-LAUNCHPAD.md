# Custos Reality Launchpad

The root page and `/#/defi/launchpad` now open the Reality application. Existing DeFi routes remain available. This implementation targets **GIWA Sepolia, chain 91342**. It does not claim a deployed GIWA mainnet contract.

## Implemented flows

- Wallet message authentication, expiring sessions, owned image uploads, immutable project metadata.
- Permissionless fixed-supply token launch: no platform approval and no verification badge.
- Asset-proof submission with a random challenge, private evidence, administrator review, approval/rejection/revocation and audit records. Administrators cannot review their own projects.
- Explore, market, rankings, project detail, likes, collections, watchlists, comments and one community valuation per wallet. Community valuation is separate from token price.
- Fixed-supply launch contract with native ETH bonding-curve purchases and sales. Receipt verification binds the token to its project. No creator reserve withdrawal, privileged minting or graduation mechanism.
- A resumable trade-event index provides real 24-hour volume and change. Missing or stale data displays a dash.
- ERC-20 swaps through a configured Uniswap V2-compatible router, direct or WETH routes, actual quotes, explicit approval, deadlines and slippage protection. Availability depends on deployed pools and liquidity.

Verification attests to reviewed proof. Creating an ERC-20 does not itself transfer legal ownership or establish a right to property or income. Those documents and issuance terms must be supplied for individual asset-backed projects.

## Local development

1. Install Python dependencies from `apps/api/requirements.txt` in a virtual environment.
2. Configure `apps/api/.env.example` variables in the process environment. `REALITY_DATA_DIR` must be a persistent directory. Set `FRONTEND_ORIGIN=http://127.0.0.1:3001` for development.
3. In `apps/api`, run `python -m uvicorn main:app --host 127.0.0.1 --port 8001`.
4. Install and build `packages/swap-sdk` before installing `apps/web` so its local package includes `dist`.
5. In `apps/web`, run `yarn install --frozen-lockfile`, then `yarn dev --host 127.0.0.1 --port 3001`. Vite proxies `/api` to port 8001.

## Contract and tests

In `contracts/launch-bridge`, run `yarn install --frozen-lockfile`, `yarn build:reality`, then `yarn test:reality`. The compiler writes matching frontend deployment and backend bytecode-validation artifacts. The contract test uses an isolated local chain with chain ID 91342; it does not send transactions to GIWA.

Backend checks: `python -m pytest apps/api/test_reality.py` (install pytest separately). Frontend checks: `yarn build` in `apps/web`.

## Deployment prerequisites

Set `REALITY_ADMIN_WALLETS` to comma-separated public administrator wallet addresses. A signed-in administrator can deploy the compiled launch contract through the review/configuration page using their own wallet and test ETH, then save its address. The backend verifies its deployed bytecode. No private key should be put in the application or sent in chat.

Set `REALITY_PLATFORM_TOKEN`, `REALITY_SWAP_ROUTER` and `REALITY_SWAP_FACTORY` to actual contracts on GIWA Sepolia. A router must be compatible with the swap interface and match the factory. Without these contracts and funded liquidity pools, the UI correctly disables quotes and exchanges.

For a persistent VM, configure `deploy/compose.vm.yaml` and run the existing Docker deployment. Keep `VITE_API_BASE` empty for the same-origin `/api` reverse proxy; set `FRONTEND_ORIGIN` and `REALITY_PUBLIC_ORIGIN` to your public HTTPS origin. Back up `runtime-data`. Uploaded public images are re-encoded, and private proof files require owner or administrator authentication.

For Cloud Run, configure `REALITY_DATABASE_URL` (PostgreSQL) and `REALITY_GCS_BUCKET` (private bucket), plus the service identity's database/storage access. Reality refuses Cloud Run's ephemeral local filesystem. Provide a reliable GIWA RPC for production traffic.

## Current limits

Contracts need independent security review before accepting valuable funds. Chain confirmations and the event index are not guarantees against deep reorganizations. The current ranking view loads up to 60 recent projects; a global market index and price-sorted pagination remain future work. The application does not supply fiat prices, automatic legal verification, marketplace shipping/escrow, real-property rights enforcement, external tokenization integrations or perpetual markets for newly launched tokens.

The code is locally runnable. Updating the public site requires repository push and access to its deployment environment; adding these files alone does not change the running website.
