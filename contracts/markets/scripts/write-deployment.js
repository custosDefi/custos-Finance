const fs = require('fs');
const path = require('path');
const { id } = require('ethers');

function json(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function address(value) {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value) ? value : '';
}

function clean(value) {
  return address(value) ? value : '';
}

function betaAction(targets, selectors) {
  return { targets: targets.filter(Boolean), selectors };
}

function selector(signature) {
  return id(signature).slice(0, 10).toLowerCase();
}

function writeDeploymentFiles({ root, network, deployer, pyth, contracts, rwa, spot, perps, deployedAt }) {
  const timestamp = deployedAt || new Date().toISOString();
  const marketDeployment = {
    version: 'custos-markets-v1',
    network,
    deployer,
    deployedAt: timestamp,
    contracts,
    settlementToken: rwa.settlementToken,
    markets: rwa.markets,
    spot,
    perps,
  };

  json(path.join(root, 'contracts/markets/deployments', network.chainId === 91342 ? 'giwa-sepolia.json' : 'local.json'), marketDeployment);

  json(path.join(root, 'apps/web/src/custos/deployment.generated.json'), {
    network: network.name,
    chainId: network.chainId,
    deployedAt: marketDeployment.deployedAt,
    deployer,
    pyth: pyth || '',
    contracts: {
      testUSDC: contracts.testUSDC || contracts.rwaSettlementToken,
      oracleRouter: contracts.oracleRouter,
      marketRegistry: contracts.marketRegistry,
      marginVault: contracts.marginVault,
      perpEngine: contracts.perpEngine,
    },
    markets: perps,
    version: 'custos-markets-v1',
  });

  json(path.join(root, 'apps/web/src/custos/spot.generated.json'), {
    version: 'custos-spot-v1',
    chainId: network.chainId,
    deployedAt: marketDeployment.deployedAt,
    deployer,
    quoteToken: contracts.testUSDC || contracts.rwaSettlementToken,
    quoteSymbol: 'tUSDC',
    quoteDecimals: 6,
    oracleRouter: contracts.oracleRouter,
    markets: spot,
    notes: [
      'Synthetic testnet spot markets; not redeemable for physical assets.',
      'Spot execution is anchored to the configured Pyth or local mock oracle.',
      'The same tUSDC contract is used by Spot and Perpetuals.',
    ],
  });

  json(path.join(root, 'apps/web/src/custos/rwa.generated.json'), {
    version: 'custos-rwa-v1',
    chainId: network.chainId,
    deployedAt: marketDeployment.deployedAt,
    deployer,
    contracts: {
      verifiedToken: contracts.verifiedToken || contracts.rwaSettlementToken,
      verifiedTokenFaucet: contracts.verifiedTokenFaucet || '',
      registry: contracts.registry,
      assetFactory: contracts.assetFactory,
      poolFactory: contracts.poolFactory,
    },
    settlementToken: rwa.settlementToken,
    markets: rwa.markets,
  });

  json(path.join(root, 'apps/api/market-config.json'), marketDeployment);

  const spotPools = Object.values(spot).map((market) => clean(market.pool));
  const betaConfig = {
    version: 'public-beta-s1',
    chainId: network.chainId,
    generatedAt: marketDeployment.deployedAt,
    contracts: {
      testUSDC: contracts.testUSDC || contracts.rwaSettlementToken,
      marginVault: contracts.marginVault,
      perpEngine: contracts.perpEngine,
      spotPools,
      spotMarkets: Object.fromEntries(Object.entries(spot).map(([key, market]) => [key, {
        token: market.token,
        pool: market.pool,
        feedId: market.feedId,
        tokenSymbol: market.tokenSymbol,
        underlying: market.underlying,
      }])),
    },
    actions: {
      faucet: betaAction([contracts.testUSDC || contracts.rwaSettlementToken], [selector('faucet()')]),
      spot_trade: betaAction(spotPools, [selector('buyExactQuote(uint256,uint256,bytes[])'), selector('sellExactAsset(uint256,uint256,bytes[])')]),
      add_liquidity: betaAction(spotPools, [selector('addLiquidity(uint256,uint256,bytes[])')]),
      remove_liquidity: betaAction(spotPools, [selector('removeLiquidity(uint256,uint256,bytes[])')]),
      perp_deposit: betaAction([contracts.marginVault], [selector('deposit(uint256)')]),
      perp_withdraw: betaAction([contracts.marginVault], [selector('withdraw(uint256)')]),
      perp_open: betaAction([contracts.perpEngine], [selector('openPositionWithTriggers(bytes32,bool,uint256,uint256,uint256,uint256,bytes[])')]),
      perp_close: betaAction([contracts.perpEngine], [selector('closePosition(uint256,bytes[])')]),
      tpsl: betaAction([contracts.perpEngine], [selector('setTriggerPrices(uint256,uint256,uint256)')]),
    },
  };
  json(path.join(root, 'apps/api/beta-contracts.generated.json'), betaConfig);
  return marketDeployment;
}

module.exports = { writeDeploymentFiles, selector };
