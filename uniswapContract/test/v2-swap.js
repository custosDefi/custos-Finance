const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Custos V2 Swap', function () {
  let owner
  let trader
  let factory
  let router
  let tokenA
  let tokenB
  let pair

  const amount = (value) => ethers.utils.parseEther(value)
  const deadline = () => Math.floor(Date.now() / 1000) + 3600

  beforeEach(async function () {
    ;[owner, trader] = await ethers.getSigners()

    const wethArtifact = require('@uniswap/v2-periphery/build/WETH9.json')
    const WETH9 = new ethers.ContractFactory(wethArtifact.abi, wethArtifact.bytecode, owner)
    const weth = await WETH9.deploy()
    await weth.deployed()

    const Factory = await ethers.getContractFactory('UniswapV2Factory')
    factory = await Factory.deploy(owner.address)
    await factory.deployed()

    const Router = await ethers.getContractFactory('UniswapV2Router02')
    router = await Router.deploy(factory.address, weth.address)
    await router.deployed()

    const ERC20 = await ethers.getContractFactory('MockERC20')
    tokenA = await ERC20.deploy('Custos Token A', 'CUSTOS-A', amount('1000000'))
    await tokenA.deployed()
    tokenB = await ERC20.deploy('Custos Token B', 'CUSTOS-B', amount('1000000'))
    await tokenB.deployed()

    await (await tokenA.transfer(trader.address, amount('100'))).wait()
    await (await tokenB.approve(router.address, amount('10000'))).wait()
    await (await tokenA.approve(router.address, amount('10000'))).wait()
    await (
      await router.addLiquidity(
        tokenA.address,
        tokenB.address,
        amount('10000'),
        amount('10000'),
        0,
        0,
        owner.address,
        deadline(),
      )
    ).wait()

    const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
    pair = await ethers.getContractAt('UniswapV2Pair', pairAddress)
  })

  it('creates one pair and mints liquidity', async function () {
    expect(await factory.getPair(tokenB.address, tokenA.address)).to.equal(pair.address)
    expect((await factory.allPairsLength()).toString()).to.equal('1')
    expect((await pair.totalSupply()).gt(0)).to.equal(true)

    const reserves = await pair.getReserves()
    expect(reserves[0].gt(0)).to.equal(true)
    expect(reserves[1].gt(0)).to.equal(true)
  })

  it('quotes and executes an exact-input token swap', async function () {
    const amountIn = amount('10')
    const path = [tokenA.address, tokenB.address]
    const quoted = await router.getAmountsOut(amountIn, path)
    const beforeA = await tokenA.balanceOf(trader.address)
    const beforeB = await tokenB.balanceOf(trader.address)

    await (await tokenA.connect(trader).approve(router.address, amountIn)).wait()
    await (
      await router.connect(trader).swapExactTokensForTokens(
        amountIn,
        quoted[1].mul(99).div(100),
        path,
        trader.address,
        deadline(),
      )
    ).wait()

    const afterA = await tokenA.balanceOf(trader.address)
    const afterB = await tokenB.balanceOf(trader.address)
    expect(afterA.toString()).to.equal(beforeA.sub(amountIn).toString())
    expect(afterB.gt(beforeB)).to.equal(true)
  })
})
