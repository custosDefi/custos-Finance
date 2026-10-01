## CFI staking and account center (October 1, 2026)

The Reality UI is English. Account pages provide display-name editing, native ETH/CFI/principal balances, project holdings and wallet-scoped transaction history.

Active GIWA Sepolia (91342) vault and account-bound CFI receipt: `0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87`.
Deployment transaction: `0x4e4b230951e4d2039d55f15d30ed7e4ca7fdd21201fe5e41510413de59e441d2`, block 37482741.
Immutable quote signer: `0x33AFD96fE7E87C297c1a46dFE659B541DDF97E77`.

- ETH stays in the immutable contract. There is no administrator withdrawal.
- Minting uses the Binance public ETHUSDT ticker: https://data-api.binance.vision/api/v3/ticker/price?symbol=ETHUSDT . No Binance API key or Pyth subscription is required for this staking flow.
- CFI minted = deposited ETH multiplied by its current ETH/USDT price. A 1 ETH deposit at 2,000 USDT mints 2,000 CFI; at 2,222 USDT it mints 2,222 CFI. USDT is the quote currency, not a guaranteed USD price.
- Binance does not sign the onchain quote. The contract trusts the configured backend operator signer. EIP-712 quotes bind the wallet, amount, price, nonce, chain and vault, expire within 60 seconds and cannot be replayed. Quotes refresh every 15 seconds in the visible UI; a new signed quote is fetched before each deposit.
- CFI has 18 decimals and is account-bound. Burning the entire balance returns the original ETH principal; partial burns return proportional principal. Multiple deposits aggregate. CFI is a receipt with no dollar peg or promised yield.
- A price/API failure blocks new deposits but does not block withdrawals. Unstaking requires no oracle or backend price quote.
- The first confirmed stake earns 100 Season 1 points once per wallet. GIWA transaction receipts are verified automatically.
- The previous Pyth vault `0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137` had zero principal before switching. Its source and deployment record remain historical; no user deposits were migrated.

### Backend configuration

```env
REALITY_CFI_STAKING=0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87
REALITY_CFI_START_BLOCK=37482741
REALITY_CFI_PRICE_SOURCE=binance
CFI_QUOTE_SIGNER_KEY=
```

The private local `apps/api/.env` already contains the dedicated quote signing key. It is excluded from Git and project archives. Preserve that existing key securely when moving the backend: a newly generated key will not match the deployed immutable quote signer. Never put it in a VITE_ variable. Pyth settings may still be used by unrelated legacy features.

Contract commands in `contracts/launch-bridge`: `node scripts/compile-cfi-binance.cjs`, `node scripts/test-cfi-binance.cjs`. The deployment script estimates by default and sends only with `--send`; an existing verified record is reused.

Validation: production frontend build and 22 backend tests passed. Contract tests cover price conversion, tampering, signer/chain/vault binding, quote expiry, nonce replay, slippage, custody and partial/full redemption. A live Binance signed quote was recovered to the configured signer and its digest matched the deployed GIWA contract. No user staking transaction was submitted during verification.
