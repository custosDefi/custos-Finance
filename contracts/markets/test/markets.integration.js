const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Custos markets integration', function () {
  async function deploy(name, args = []) {
    const factory = await ethers.getContractFactory(name);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    return contract;
  }

  async function tx(transaction) {
    await (await transaction).wait();
  }

  it('runs RWA proof, RWA AMM, oracle Spot and Perpetual flows locally', async function () {
    const [owner, trader, liquidator] = await ethers.getSigners();
    const quote = await deploy('TestUSDC', [owner.address]);
    const oracle = await deploy('MockOracleRouter', [owner.address]);
    const quoteAddress = await quote.getAddress();

    await tx(quote.ownerMint(owner.address, ethers.parseUnits('1000000', 6)));
    await tx(quote.ownerMint(trader.address, ethers.parseUnits('10000', 6)));

    // RWA proof -> verified asset -> token -> constant-product pool -> swap.
    const registry = await deploy('RwaVerificationRegistry');
    const assetFactory = await deploy('RwaAssetFactory', [await registry.getAddress()]);
    const poolFactory = await deploy('RwaPoolFactory');
    const assetId = ethers.id('CUSTOS-RWA:TEST:v1');
    const proofHash = ethers.id('test document');

    await tx(registry.registerAsset(assetId, proofHash, 'ipfs://custos/test', 1_900_000_000, 25));
    await expect(assetFactory.createAssetToken(assetId, 'Unverified', 'rNO', ethers.parseUnits('1', 18)))
      .to.be.revertedWith('asset not verified');
    await tx(registry.setAssetStatus(assetId, 2));
    await tx(assetFactory.createAssetToken(assetId, 'Test Invoice', 'rTEST', ethers.parseUnits('100000', 18)));
    const rwaTokenAddress = await assetFactory.assetToken(assetId);
    await tx(poolFactory.createPool(rwaTokenAddress, quoteAddress));
    const rwaPoolAddress = await poolFactory.getPool(rwaTokenAddress, quoteAddress);
    const rwaToken = await ethers.getContractAt('RwaAssetToken', rwaTokenAddress);
    const rwaPool = await ethers.getContractAt('RwaAMMPool', rwaPoolAddress);
    await tx(rwaToken.approve(rwaPoolAddress, ethers.parseUnits('20000', 18)));
    await tx(quote.approve(rwaPoolAddress, ethers.parseUnits('20000', 6)));
    await tx(rwaPool.addLiquidity(ethers.parseUnits('20000', 18), ethers.parseUnits('20000', 6), 0, 0, owner.address));
    await tx(quote.connect(trader).approve(rwaPoolAddress, ethers.parseUnits('1000', 6)));
    const rwaOut = await rwaPool.getAmountOut(quoteAddress, ethers.parseUnits('1000', 6));
    await tx(rwaPool.connect(trader).swapExactInput(quoteAddress, ethers.parseUnits('1000', 6), rwaOut, trader.address));
    expect(await rwaToken.balanceOf(trader.address)).to.equal(rwaOut);

    // Oracle Spot: tUSDC-only LP, oracle-priced mint/burn and liquidity shares.
    const spotFeed = ethers.id('CUSTOS-SPOT:XAU:v1');
    await tx(oracle.setPrice(spotFeed, ethers.parseUnits('2300', 18), ethers.parseUnits('0.01', 18), 0));
    const synthetic = await deploy('SyntheticRwaToken', [
      'Custos Synthetic Gold',
      'rXAU',
      'XAU/USD',
      '1 token = 1 troy oz gold reference',
      owner.address,
    ]);
    const spotPool = await deploy('OracleSpotPool', [
      await synthetic.getAddress(),
      quoteAddress,
      await oracle.getAddress(),
      spotFeed,
      'Custos rXAU LP',
      'cLP-XAU',
      owner.address,
    ]);
    await tx(synthetic.setPool(await spotPool.getAddress()));
    await tx(quote.approve(await spotPool.getAddress(), ethers.parseUnits('10000', 6)));
    await tx(spotPool.addLiquidity(ethers.parseUnits('10000', 6), 0, []));
    const quotedSpot = await spotPool.quoteBuy(ethers.parseUnits('100', 6));
    await tx(quote.connect(trader).approve(await spotPool.getAddress(), ethers.parseUnits('100', 6)));
    await tx(spotPool.connect(trader).buyExactQuote(ethers.parseUnits('100', 6), quotedSpot.assetOut, []));
    expect(await synthetic.balanceOf(trader.address)).to.equal(quotedSpot.assetOut);
    await tx(synthetic.connect(trader).approve(await spotPool.getAddress(), quotedSpot.assetOut));
    const quotedSell = await spotPool.connect(trader).quoteSell(quotedSpot.assetOut);
    await tx(spotPool.connect(trader).sellExactAsset(quotedSpot.assetOut, quotedSell.quoteOut, []));
    expect(await synthetic.balanceOf(trader.address)).to.equal(0n);

    // Perpetual: collateral deposit -> isolated position -> PnL settlement.
    const perpFeed = ethers.id('CUSTOS-PERP:BTC:v1');
    await tx(oracle.setPrice(perpFeed, ethers.parseUnits('100', 18), ethers.parseUnits('0.01', 18), 0));
    const marketRegistry = await deploy('MarketRegistry', [owner.address]);
    const vault = await deploy('MarginVault', [quoteAddress, owner.address]);
    const engine = await deploy('GiwaPerpEngineV12', [
      await vault.getAddress(),
      await marketRegistry.getAddress(),
      await oracle.getAddress(),
      owner.address,
    ]);
    await tx(vault.setEngine(await engine.getAddress()));
    const marketId = ethers.id('CUSTOS-PERP:BTC:v1');
    await tx(marketRegistry.setMarket(marketId, {
      symbol: 'BTC',
      feedId: perpFeed,
      maxPriceAge: 120,
      maxLeverageBps: 50000,
      maintenanceMarginBps: 500,
      maxConfidenceBps: 100,
      maxOpenInterestUsd: ethers.parseUnits('100000', 18),
      active: true,
      reduceOnly: false,
    }));
    await tx(quote.approve(await vault.getAddress(), ethers.parseUnits('100000', 6)));
    await tx(vault.fundReserve(ethers.parseUnits('100000', 6)));
    await tx(quote.connect(trader).approve(await vault.getAddress(), ethers.parseUnits('2000', 6)));
    await tx(vault.connect(trader).deposit(ethers.parseUnits('2000', 6)));
    await tx(engine.connect(trader).openPositionWithTriggers(
      marketId,
      true,
      ethers.parseUnits('1000', 6),
      20000,
      0,
      0,
      [],
    ));
    const ids = await engine.getActivePositionIds(trader.address, marketId);
    expect(ids).to.have.length(1);
    await tx(oracle.setPrice(perpFeed, ethers.parseUnits('110', 18), ethers.parseUnits('0.01', 18), 0));
    await tx(engine.connect(trader).closePosition(ids[0], []));
    expect(await vault.available(trader.address)).to.be.greaterThan(ethers.parseUnits('2000', 6));
    expect(await vault.locked(trader.address)).to.equal(0n);
    expect(await vault.available(liquidator.address)).to.equal(0n);
  });
});
