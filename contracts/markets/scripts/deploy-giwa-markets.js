const path = require('path');
const hre = require('hardhat');
const {
  FEEDS,
  SPOT_MARKETS,
  PERP_MARKETS,
  RWA_MARKETS,
  perpMarketId,
  rwaAssetId,
} = require('./market-definitions');
const { writeDeploymentFiles } = require('./write-deployment');

const { ethers, network } = hre;
const DEFAULT_PYTH = '0x2880ab155794e7179c9ee2e38200202908c17b43';
const DEFAULT_VERIFIED_TOKEN = '0xBCdB22f56642DE57624CfC2fBb9eE398cF3CA268';
const DEFAULT_VERIFIED_TOKEN_FAUCET = '0xfe4b4F5f2f8843dC9Ca75E563f2f7eB0f44Ae83e';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address,uint256) returns (bool)',
  'function allowance(address,address) view returns (uint256)',
];

async function deploy(name, args = []) {
  const factory = await ethers.getContractFactory(name);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  return contract;
}

async function wait(tx) {
  await tx.wait();
}

async function assertContract(address, label) {
  if (!ethers.isAddress(address)) throw new Error(`${label} is not a valid address.`);
  const code = await ethers.provider.getCode(address);
  if (code === '0x') throw new Error(`${label} has no code at ${address}.`);
}

async function pythUpdate(feedId) {
  const base = (process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network').replace(/\/$/, '');
  const url = `${base}/v2/updates/price/latest?ids[]=${encodeURIComponent(feedId)}`;
  const response = await fetch(url, {
    headers: process.env.PYTH_API_KEY ? { Authorization: `Bearer ${process.env.PYTH_API_KEY}` } : {},
  });
  if (!response.ok) throw new Error(`Pyth update failed (${response.status}) for ${feedId}: ${await response.text()}`);
  const body = await response.json();
  const data = body?.binary?.data || [];
  if (!data.length) throw new Error(`Pyth returned no binary update for ${feedId}.`);
  return data.map((value) => String(value).startsWith('0x') ? String(value) : `0x${value}`);
}

async function deployRwa({ owner, quoteAddress }) {
  const registry = await deploy('RwaVerificationRegistry');
  const assetFactory = await deploy('RwaAssetFactory', [await registry.getAddress()]);
  const poolFactory = await deploy('RwaPoolFactory');
  const quote = new ethers.Contract(quoteAddress, ERC20_ABI, owner);
  const decimals = Number(await quote.decimals());
  const quoteUnit = 10n ** BigInt(decimals);
  const assetUnit = 10n ** 18n;
  const markets = [];

  for (const config of RWA_MARKETS) {
    const assetId = rwaAssetId(config.key);
    const documentHash = ethers.id(`Custos GIWA test proof | ${config.key} | ${config.name}`);
    await wait(await registry.registerAsset(assetId, documentHash, config.metadataURI, Math.floor(new Date(`${config.maturity}T00:00:00Z`).getTime() / 1000), config.risk));
    await wait(await registry.setAssetStatus(assetId, 2));
    await wait(await assetFactory.createAssetToken(assetId, config.name, config.key, ethers.parseUnits(config.supply, 18)));
    const tokenAddress = await assetFactory.assetToken(assetId);
    await wait(await poolFactory.createPool(tokenAddress, quoteAddress));
    const poolAddress = await poolFactory.getPool(tokenAddress, quoteAddress);
    markets.push({
      name: config.name,
      symbol: config.key,
      asset_type: config.assetType,
      maturity: config.maturity,
      risk: config.risk,
      supply: config.supply,
      weight: config.weight,
      assetPerQuote: 1,
      assetId,
      tokenAddress,
      poolAddress,
      documentHash,
      metadataURI: config.metadataURI,
      assetLiquidity: '0',
      quoteLiquidity: '0',
    });
  }

  return {
    contracts: {
      registry: await registry.getAddress(),
      assetFactory: await assetFactory.getAddress(),
      poolFactory: await poolFactory.getAddress(),
    },
    quote,
    decimals,
    quoteUnit,
    assetUnit,
    markets,
  };
}

async function seedRwa({ owner, rwa, quoteAddress }) {
  const balance = await rwa.quote.balanceOf(owner.address);
  if (balance === 0n) {
    console.warn('RWA pools were created but not seeded: deployer has no official VerifiedToken.');
    return;
  }

  const configuredBps = Number(process.env.BOOTSTRAP_VERIFIED_TOKEN_BPS || 6000);
  const seedTotal = (balance * BigInt(Math.min(9500, Math.max(100, configuredBps)))) / 10000n;
  const weightTotal = RWA_MARKETS.reduce((sum, market) => sum + market.weight, 0);
  let distributed = 0n;

  for (let index = 0; index < rwa.markets.length; index += 1) {
    const market = rwa.markets[index];
    const isLast = index === rwa.markets.length - 1;
    const quoteAmount = isLast ? seedTotal - distributed : (seedTotal * BigInt(RWA_MARKETS[index].weight)) / BigInt(weightTotal);
    distributed += quoteAmount;
    const assetAmount = (quoteAmount * rwa.assetUnit) / rwa.quoteUnit;
    if (quoteAmount === 0n || assetAmount === 0n) continue;

    const asset = await ethers.getContractAt('RwaAssetToken', market.tokenAddress, owner);
    const pool = await ethers.getContractAt('RwaAMMPool', market.poolAddress, owner);
    await wait(await asset.approve(market.poolAddress, assetAmount));
    await wait(await rwa.quote.approve(market.poolAddress, quoteAmount));
    await wait(await pool.addLiquidity(assetAmount, quoteAmount, 0, 0, owner.address));
    const reserves = await pool.getReserves();
    market.assetLiquidity = ethers.formatUnits(reserves.assetReserve, 18);
    market.quoteLiquidity = ethers.formatUnits(reserves.quoteReserve, rwa.decimals);
  }
}

async function deploySpot({ owner, quoteToken, oracle }) {
  const tokenFactory = await ethers.getContractFactory('SyntheticRwaToken');
  const poolFactory = await ethers.getContractFactory('OracleSpotPool');
  const quoteAddress = await quoteToken.getAddress();
  const markets = {};

  for (const config of SPOT_MARKETS) {
    const token = await tokenFactory.deploy(config.name, config.symbol, config.underlying, config.unit, owner.address);
    await token.waitForDeployment();
    const pool = await poolFactory.deploy(
      await token.getAddress(), quoteAddress, await oracle.getAddress(), FEEDS[config.key],
      `Custos ${config.symbol} LP`, `cLP-${config.key}`, owner.address,
    );
    await pool.waitForDeployment();
    await wait(await token.setPool(await pool.getAddress()));

    const updateData = await pythUpdate(FEEDS[config.key]);
    const fee = await pool.getUpdateFee(updateData);
    const seed = ethers.parseUnits('1000', 6);
    await wait(await quoteToken.approve(await pool.getAddress(), seed));
    await wait(await pool.addLiquidity(seed, 0, updateData, { value: fee }));

    markets[config.key] = {
      name: config.name,
      tokenSymbol: config.symbol,
      underlying: config.underlying,
      pythSymbol: config.pythSymbol,
      feedId: FEEDS[config.key],
      unit: config.unit,
      token: await token.getAddress(),
      pool: await pool.getAddress(),
    };
  }
  return markets;
}

async function deployPerps({ owner, quoteToken, oracle }) {
  const marketRegistry = await deploy('MarketRegistry', [owner.address]);
  const vault = await deploy('MarginVault', [await quoteToken.getAddress(), owner.address]);
  const engine = await deploy('GiwaPerpEngineV12', [await vault.getAddress(), await marketRegistry.getAddress(), await oracle.getAddress(), owner.address]);
  await wait(await vault.setEngine(await engine.getAddress()));

  const markets = {};
  for (const config of PERP_MARKETS) {
    const marketId = perpMarketId(config.key);
    await wait(await marketRegistry.setMarket(marketId, {
      symbol: config.key,
      feedId: FEEDS[config.key],
      maxPriceAge: config.maxPriceAge,
      maxLeverageBps: config.maxLeverageBps,
      maintenanceMarginBps: config.maintenanceMarginBps,
      maxConfidenceBps: config.maxConfidenceBps,
      maxOpenInterestUsd: ethers.parseUnits(config.maxOpenInterestUsd, 18),
      active: true,
      reduceOnly: false,
    }));
    markets[config.key] = {
      marketId,
      feedId: FEEDS[config.key],
      maxPriceAge: config.maxPriceAge,
      maxLeverageBps: config.maxLeverageBps,
      maintenanceMarginBps: config.maintenanceMarginBps,
      maxConfidenceBps: config.maxConfidenceBps,
      maxOpenInterestUsd: config.maxOpenInterestUsd,
    };
  }

  const reserve = ethers.parseUnits('100000', 6);
  await wait(await quoteToken.approve(await vault.getAddress(), reserve));
  await wait(await vault.fundReserve(reserve));
  return {
    contracts: {
      marketRegistry: await marketRegistry.getAddress(),
      marginVault: await vault.getAddress(),
      perpEngine: await engine.getAddress(),
    },
    markets,
  };
}

async function main() {
  const [owner] = await ethers.getSigners();
  const verifiedTokenAddress = process.env.VERIFIED_TOKEN_ADDRESS || DEFAULT_VERIFIED_TOKEN;
  const faucetAddress = process.env.VERIFIED_TOKEN_FAUCET_ADDRESS || DEFAULT_VERIFIED_TOKEN_FAUCET;
  const pythAddress = process.env.PYTH_ADDRESS || DEFAULT_PYTH;
  await assertContract(verifiedTokenAddress, 'Official VerifiedToken');
  await assertContract(faucetAddress, 'Official VerifiedToken Faucet');
  await assertContract(pythAddress, 'GIWA Pyth Core');

  const verified = new ethers.Contract(verifiedTokenAddress, ERC20_ABI, owner);
  const verifiedDecimals = Number(await verified.decimals());
  const verifiedSymbol = await verified.symbol();
  const projectQuote = await deploy('TestUSDC', [owner.address]);
  const oracle = await deploy('PythOracleRouter', [pythAddress, owner.address]);
  await wait(await projectQuote.ownerMint(owner.address, ethers.parseUnits('500000', 6)));

  const rwa = await deployRwa({ owner, quoteAddress: verifiedTokenAddress });
  await seedRwa({ owner, rwa, quoteAddress: verifiedTokenAddress });
  const spot = await deploySpot({ owner, quoteToken: projectQuote, oracle });
  const perps = await deployPerps({ owner, quoteToken: projectQuote, oracle });

  const root = path.resolve(__dirname, '../../..');
  const deployment = writeDeploymentFiles({
    root,
    network: { name: 'GIWA Sepolia', chainId: Number(network.config.chainId || 91342) },
    deployer: owner.address,
    pyth: pythAddress,
    contracts: {
      verifiedToken: verifiedTokenAddress,
      verifiedTokenFaucet: faucetAddress,
      rwaSettlementToken: verifiedTokenAddress,
      testUSDC: await projectQuote.getAddress(),
      oracleRouter: await oracle.getAddress(),
      ...rwa.contracts,
      ...perps.contracts,
    },
    rwa: {
      settlementToken: {
        name: 'GIWA VerifiedToken',
        symbol: verifiedSymbol,
        address: verifiedTokenAddress,
        decimals: verifiedDecimals,
        official: true,
        faucetAddress,
        claimUrl: 'https://sepolia-playground.giwa.io/',
        claimFlow: 'Issue Dojang → Claim VerifiedToken → return to Custos Finance',
        disclaimer: 'Official GIWA Playground test token. Testnet-only; not USDC and not redeemable for cash.',
      },
      markets: rwa.markets,
    },
    spot,
    perps: perps.markets,
  });

  console.log(JSON.stringify({
    network: deployment.network,
    deployer: deployment.deployer,
    contracts: deployment.contracts,
    spot: Object.fromEntries(Object.entries(spot).map(([key, value]) => [key, value.pool])),
    rwa: rwa.markets.map((market) => ({ symbol: market.symbol, token: market.tokenAddress, pool: market.poolAddress })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
