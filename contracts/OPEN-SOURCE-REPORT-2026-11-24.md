# Custos 合约开源与链上地址清单

整理日期：2026 年 11 月 24 日

覆盖网络：GIWA Sepolia（链 ID 91342）、Ethereum Sepolia（链 ID 11155111），均为测试网。

本文件汇总已识别的链上合约、公开源码和浏览器验证结果，适合转发查阅。固定和历史清单共有 **126 个按网络及地址区分的合约**，均已在对应浏览器完整验证。发行平台生成的代币实例单独说明，未逐个声称独立验证。

## 常用开源链接

- [Custos 公开仓库](https://github.com/custosDefi/custos-Finance)
- [合约地址与源码总索引（持续更新）](https://github.com/custosDefi/custos-Finance/blob/main/contracts/DEPLOYMENTS.md)
- [全部合约源码目录](https://github.com/custosDefi/custos-Finance/tree/main/contracts)
- [精确编译输入和历史源码](https://github.com/custosDefi/custos-Finance/tree/main/contracts/verification)
- [Reality 代币快照清单](https://github.com/custosDefi/custos-Finance/blob/main/contracts/deployments/giwa-reality-tokens-2026-11-24/manifest.json)

本文的文件级源码和快照链接固定指向本次整理的提交 `c3320b2`，浏览器链接指向相应链上的合约地址。可通过上面的总索引查看后续更新。

“已验证”表示浏览器返回完整源码匹配，不代表合约经过安全审计；所列配置也不保证对应业务当前可用。

项目固定地址中，42 个 GIWA 合约和 4 个 Ethereum Sepolia 合约已在各自的 Blockscout 浏览器完整验证。
另外 80 个旧版 GIWA 市场部署也已逐个完整验证，见 [历史市场地址清单](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/deployments/giwa-market-history-2026-11-24.json)。
结构化地址、源码路径、链和编译器版本见 [固定合约清单](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/deployments/contract-registry-2026-11-24.json)。

## 当前核心合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| Reality launchpad | GIWA Sepolia | [0x61Ce8427cFC9947dAe0eBc84E367d6e666f90285](https://sepolia-explorer.giwa.io/address/0x61Ce8427cFC9947dAe0eBc84E367d6e666f90285) | [CustosRealityLaunchpad](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosRealityLaunchpad.sol) |
| CFI staking | GIWA Sepolia | [0x91618694D70100edd9e6508A1d680Ea4E0797592](https://sepolia-explorer.giwa.io/address/0x91618694D70100edd9e6508A1d680Ea4E0797592) | [CustosCFIBinanceStake](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosCFIBinanceStake.sol) |
| Configurable faucet | GIWA Sepolia | [0xb77C2e25D7a998556eE0C71d170e7FD7Ead080a1](https://sepolia-explorer.giwa.io/address/0xb77C2e25D7a998556eE0C71d170e7FD7Ead080a1) | [CustosConfigurableTestnetFaucet](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosConfigurableTestnetFaucet.sol) |
| KBW NFT | GIWA Sepolia | [0xF2B200A8a90cB40f08e91CE1539260556719d691](https://sepolia-explorer.giwa.io/address/0xF2B200A8a90cB40f08e91CE1539260556719d691) | [CustosKBW2026](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/nft/contracts/CustosKBW2026.sol) |

## V2 交易合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| V2 weth | GIWA Sepolia | [0xeDBc87C8c03af5eB8Ff2C97ae9708719Ed050b66](https://sepolia-explorer.giwa.io/address/0xeDBc87C8c03af5eB8Ff2C97ae9708719Ed050b66) | [WETH9](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/third-party/WETH9.sol) |
| V2 factory | GIWA Sepolia | [0x349a1CBB28C6267B4B567A06b2661Af8d6A1a1f5](https://sepolia-explorer.giwa.io/address/0x349a1CBB28C6267B4B567A06b2661Af8d6A1a1f5) | [UniswapV2Factory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/factory.sol) |
| V2 router | GIWA Sepolia | [0x4F1F5E8DE722e2773e7794af41ca0863457943C5](https://sepolia-explorer.giwa.io/address/0x4F1F5E8DE722e2773e7794af41ca0863457943C5) | [UniswapV2Router02](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/router.sol) |
| V2 multicall | GIWA Sepolia | [0x95a882901Bd9e4F819034ba62FB3F21Cf248E19B](https://sepolia-explorer.giwa.io/address/0x95a882901Bd9e4F819034ba62FB3F21Cf248E19B) | [Multicall](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/muticall.sol) |
| V2 tokenA | GIWA Sepolia | [0x32AF40B25CB5842f91E2B790563e5F0e51A70832](https://sepolia-explorer.giwa.io/address/0x32AF40B25CB5842f91E2B790563e5F0e51A70832) | [MockERC20](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/MockERC20.sol) |
| V2 tokenB | GIWA Sepolia | [0x5ea3096fA9366e136605A73269B38900529dfD5A](https://sepolia-explorer.giwa.io/address/0x5ea3096fA9366e136605A73269B38900529dfD5A) | [MockERC20](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/MockERC20.sol) |
| V2 pair | GIWA Sepolia | [0x1A649Eb1D48D7962D3f72A54311CA4048590B25A](https://sepolia-explorer.giwa.io/address/0x1A649Eb1D48D7962D3f72A54311CA4048590B25A) | [UniswapV2Pair](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/factory.sol) |
| V2 second pair | GIWA Sepolia | [0x9c3e1A84Bd7f9F74F211d214c40F47f8A5F41ac6](https://sepolia-explorer.giwa.io/address/0x9c3e1A84Bd7f9F74F211d214c40F47f8A5F41ac6) | [UniswapV2Pair](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/swap/contracts/factory.sol) |

## 市场、资产与资金池

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| Markets testUSDC | GIWA Sepolia | [0xdE1Ae220D755AFf0Ddd1f02dBe93F2E0FeF2f263](https://sepolia-explorer.giwa.io/address/0xdE1Ae220D755AFf0Ddd1f02dBe93F2E0FeF2f263) | [TestUSDC](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/TestUSDC.sol) |
| Markets oracleRouter | GIWA Sepolia | [0x4aE104028b03c2Bd8730b32999A0ce22865A8eee](https://sepolia-explorer.giwa.io/address/0x4aE104028b03c2Bd8730b32999A0ce22865A8eee) | [PythOracleRouter](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/PythOracleRouter.sol) |
| Markets registry | GIWA Sepolia | [0x094d3a81582E470d9b669C0E776eE422CbEC4570](https://sepolia-explorer.giwa.io/address/0x094d3a81582E470d9b669C0E776eE422CbEC4570) | [RwaVerificationRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaVerificationRegistry.sol) |
| Markets assetFactory | GIWA Sepolia | [0xe306f0ea65CCe42462f57E79b7EC203a4e88dAee](https://sepolia-explorer.giwa.io/address/0xe306f0ea65CCe42462f57E79b7EC203a4e88dAee) | [RwaAssetFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetFactory.sol) |
| Markets poolFactory | GIWA Sepolia | [0x5360507e0965f9e0d50b729E72a17B83B3ccd8Cc](https://sepolia-explorer.giwa.io/address/0x5360507e0965f9e0d50b729E72a17B83B3ccd8Cc) | [RwaPoolFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaPoolFactory.sol) |
| Markets marketRegistry | GIWA Sepolia | [0x1F8088286c9ecb75A4AECe9300524C9B4f33cEC4](https://sepolia-explorer.giwa.io/address/0x1F8088286c9ecb75A4AECe9300524C9B4f33cEC4) | [MarketRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarketRegistry.sol) |
| Markets marginVault | GIWA Sepolia | [0x38847c6C1fC6bACAD3929c541812f532CFcdc174](https://sepolia-explorer.giwa.io/address/0x38847c6C1fC6bACAD3929c541812f532CFcdc174) | [MarginVault](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarginVault.sol) |
| Markets perpEngine | GIWA Sepolia | [0x6163B145B1cDe748E3BE527df3085E708880F7F3](https://sepolia-explorer.giwa.io/address/0x6163B145B1cDe748E3BE527df3085E708880F7F3) | [GiwaPerpEngineV12](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/GiwaPerpEngineV12.sol) |
| RWA rKINV26 token | GIWA Sepolia | [0x85B65f5A44EE2faff5e99D04A5E2f842c16c12B3](https://sepolia-explorer.giwa.io/address/0x85B65f5A44EE2faff5e99D04A5E2f842c16c12B3) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | GIWA Sepolia | [0xeA3ec5d362D5599161e5Bc4013103Fb0b4758A95](https://sepolia-explorer.giwa.io/address/0xeA3ec5d362D5599161e5Bc4013103Fb0b4758A95) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | GIWA Sepolia | [0x9e1CD03EEfe22e62f104966Dc7784c32fC174e07](https://sepolia-explorer.giwa.io/address/0x9e1CD03EEfe22e62f104966Dc7784c32fC174e07) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | GIWA Sepolia | [0x01Ef4d5431EB2Ed3f66D47686D433b34928dF3dd](https://sepolia-explorer.giwa.io/address/0x01Ef4d5431EB2Ed3f66D47686D433b34928dF3dd) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | GIWA Sepolia | [0x09fDD53efaA8b87Fe2B6C4e09f179b9BaED08913](https://sepolia-explorer.giwa.io/address/0x09fDD53efaA8b87Fe2B6C4e09f179b9BaED08913) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | GIWA Sepolia | [0xCc753182d9DDD5875Ba974a16600f1Dac83Efa1f](https://sepolia-explorer.giwa.io/address/0xCc753182d9DDD5875Ba974a16600f1Dac83Efa1f) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| Spot XAU token | GIWA Sepolia | [0xA9E82BA86C8069508be7dc254248946886E6B0FE](https://sepolia-explorer.giwa.io/address/0xA9E82BA86C8069508be7dc254248946886E6B0FE) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot XAU pool | GIWA Sepolia | [0xa6B3b7e400d89874880F78654211B5108d2f563C](https://sepolia-explorer.giwa.io/address/0xa6B3b7e400d89874880F78654211B5108d2f563C) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| Spot XAG token | GIWA Sepolia | [0x0032b38908bDDDF634Aa0e9a548C516573FC1A3B](https://sepolia-explorer.giwa.io/address/0x0032b38908bDDDF634Aa0e9a548C516573FC1A3B) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot XAG pool | GIWA Sepolia | [0x73D0D1FfFF7Cb3B5E98694B8e68268123c0A5144](https://sepolia-explorer.giwa.io/address/0x73D0D1FfFF7Cb3B5E98694B8e68268123c0A5144) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| Spot OIL token | GIWA Sepolia | [0xD451C4fFFE0F77887b1036D1e431b9d3b408154A](https://sepolia-explorer.giwa.io/address/0xD451C4fFFE0F77887b1036D1e431b9d3b408154A) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot OIL pool | GIWA Sepolia | [0x6000F1Bb346AF1Bd6EDB3F061E6A2BBA15270756](https://sepolia-explorer.giwa.io/address/0x6000F1Bb346AF1Bd6EDB3F061E6A2BBA15270756) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |

## 历史及跨链合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| GIWA Genesis NFT | GIWA Sepolia | [0xe12c3b8940368e85500ec48CfF1EB0e7cB882dF2](https://sepolia-explorer.giwa.io/address/0xe12c3b8940368e85500ec48CfF1EB0e7cB882dF2) | [GiwaGenesis](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/nft/contracts/GiwaGenesis.sol) |
| Previous Binance CFI vault | GIWA Sepolia | [0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87](https://sepolia-explorer.giwa.io/address/0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87) | [CustosCFIBinanceStake](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosCFIBinanceStake.sol) |
| Previous Pyth CFI vault | GIWA Sepolia | [0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137](https://sepolia-explorer.giwa.io/address/0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137) | [CustosCFIStake](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosCFIStake.sol) |
| Previous test faucet | GIWA Sepolia | [0x08a9e665fC13e65021DA8e8b2C8993Db843d5Fb7](https://sepolia-explorer.giwa.io/address/0x08a9e665fC13e65021DA8e8b2C8993Db843d5Fb7) | [CustosTestnetFaucet](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosTestnetFaucet.sol) |
| Legacy launchpad | GIWA Sepolia | [0x37BC45c02dbc2f390E7404aFB688FA64e3b17E64](https://sepolia-explorer.giwa.io/address/0x37BC45c02dbc2f390E7404aFB688FA64e3b17E64) | [CustosLaunchpad](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosLaunchpad.sol) |
| Legacy bridge | GIWA Sepolia | [0xEee47E68C564dDC33F91e62555fb76E969606C44](https://sepolia-explorer.giwa.io/address/0xEee47E68C564dDC33F91e62555fb76E969606C44) | [CustosBridge](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy bridgeToken | GIWA Sepolia | [0xa35b0D5F4C3f870f2fFfA154eA41083ABF694c0A](https://sepolia-explorer.giwa.io/address/0xa35b0D5F4C3f870f2fFfA154eA41083ABF694c0A) | [CustosBridgeToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/historical/CustosBridge-2026-09-06.sol) |
| Initial faucet | GIWA Sepolia | [0x857cd2B7FAC430b88E34bD0DbBDb4cc69Aa1d251](https://sepolia-explorer.giwa.io/address/0x857cd2B7FAC430b88E34bD0DbBDb4cc69Aa1d251) | [CustosTestnetFaucet](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/historical/CustosTestnetFaucet-initial.sol) |
| Initial GIWA Genesis NFT | GIWA Sepolia | [0x930552e1bB7ff3c47011FC21B8483cAc7528F9fB](https://sepolia-explorer.giwa.io/address/0x930552e1bB7ff3c47011FC21B8483cAc7528F9fB) | [GiwaGenesis](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/nft/contracts/GiwaGenesis.sol) |
| Legacy launch token example | GIWA Sepolia | [0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec](https://sepolia-explorer.giwa.io/address/0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec) | [CustosLaunchToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosLaunchpad.sol) |
| Legacy launchpad | Ethereum Sepolia | [0xD5005CcB436c0479206cD0757740cF249144C9E7](https://eth-sepolia.blockscout.com/address/0xD5005CcB436c0479206cD0757740cF249144C9E7) | [CustosLaunchpad](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosLaunchpad.sol) |
| Legacy bridge | Ethereum Sepolia | [0x9C296c3F0586Ab6412E06161D148eAde806076a0](https://eth-sepolia.blockscout.com/address/0x9C296c3F0586Ab6412E06161D148eAde806076a0) | [CustosBridge](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy bridge token | Ethereum Sepolia | [0x35BF7faB801C3fF283f4fABaE5ae8690099e9e01](https://eth-sepolia.blockscout.com/address/0x35BF7faB801C3fF283f4fABaE5ae8690099e9e01) | [CustosBridgeToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy launch token | Ethereum Sepolia | [0xe1eE00FA78F41D92B69b1D50CE3d47eBBfE578A4](https://eth-sepolia.blockscout.com/address/0xe1eE00FA78F41D92B69b1D50CE3d47eBBfE578A4) | [CustosLaunchToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosLaunchpad.sol) |

## 发行平台生成的代币

当前 Reality 发行平台在 GIWA 区块 **42178793** 的快照包含 **6605 个代币实例**。
这些实例由同一份 [RealityToken 源码](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosRealityLaunchpad.sol)生成，供应量作为 immutable 写入字节码。
下表的每种供应量均有一个已完整验证的实例；相同字节码的其他实例可在浏览器显示为 verified twin。
**verified twin 不表示每个实例都已单独验证。** 快照之后创建的实例和新的供应量不会自动出现在此快照中。

| 初始供应量（代币） | 快照中的实例数 | 已完整验证的实例 |
| ---: | ---: | --- |
| 1,000,000 | 6,484 | [0x985305F62E8fEa995E18E396e050d9859CA9A84b](https://sepolia-explorer.giwa.io/address/0x985305F62E8fEa995E18E396e050d9859CA9A84b) |
| 100,000 | 34 | [0x9B273A3A3393271DFa6bc035E0745379E5aA8b27](https://sepolia-explorer.giwa.io/address/0x9B273A3A3393271DFa6bc035E0745379E5aA8b27) |
| 2,000,000 | 29 | [0xb21f6cb1CF912633901D26ffD4B7062E1c2b947E](https://sepolia-explorer.giwa.io/address/0xb21f6cb1CF912633901D26ffD4B7062E1c2b947E) |
| 500,000 | 26 | [0xA7Cf7Dba576Ac8cf62D39c17b251A92764617090](https://sepolia-explorer.giwa.io/address/0xA7Cf7Dba576Ac8cf62D39c17b251A92764617090) |
| 21,000,000 | 7 | [0xcD9756800deD32E307B82c6441f92fa7c024B55F](https://sepolia-explorer.giwa.io/address/0xcD9756800deD32E307B82c6441f92fa7c024B55F) |
| 1,000,000,000 | 6 | [0x5EdDFe484dB5583A9e6BAa02B6D872567d9a7D44](https://sepolia-explorer.giwa.io/address/0x5EdDFe484dB5583A9e6BAa02B6D872567d9a7D44) |
| 100,000,000 | 6 | [0xd3d8320C09270B0137ed68659B4Ff4641d41B894](https://sepolia-explorer.giwa.io/address/0xd3d8320C09270B0137ed68659B4Ff4641d41B894) |
| 1,000 | 3 | [0xf3a95897baD31Cad28ee1B491F5eE8176884d437](https://sepolia-explorer.giwa.io/address/0xf3a95897baD31Cad28ee1B491F5eE8176884d437) |
| 10,000,000 | 2 | [0xA94BFEC3b36D7b16beA6844FFeAe9D85DA119e6A](https://sepolia-explorer.giwa.io/address/0xA94BFEC3b36D7b16beA6844FFeAe9D85DA119e6A) |
| 100,000,000,000 | 2 | [0xF1c55Ab41473b82B5A4aFA7b93B4df3A55d58775](https://sepolia-explorer.giwa.io/address/0xF1c55Ab41473b82B5A4aFA7b93B4df3A55d58775) |
| 10,000 | 1 | [0xccFBE06F1282C04171B5cfF3D1595E791A8b35c0](https://sepolia-explorer.giwa.io/address/0xccFBE06F1282C04171B5cfF3D1595E791A8b35c0) |
| 9,999 | 1 | [0xD55E9B8A32d88322b36eC16838eC44456ae200f8](https://sepolia-explorer.giwa.io/address/0xD55E9B8A32d88322b36eC16838eC44456ae200f8) |
| 1 | 1 | [0x60F314Ed5275A231a5dD15D5Ee64F2E023438694](https://sepolia-explorer.giwa.io/address/0x60F314Ed5275A231a5dD15D5Ee64F2E023438694) |
| 688 | 1 | [0x6319f337dF9372A74e6Ebf5a39D6FcCF71f012E2](https://sepolia-explorer.giwa.io/address/0x6319f337dF9372A74e6Ebf5a39D6FcCF71f012E2) |
| 500,000,000 | 1 | [0xC8A8bbA289Ae150986481Eee76Fa24b727D57C68](https://sepolia-explorer.giwa.io/address/0xC8A8bbA289Ae150986481Eee76Fa24b727D57C68) |
| 66,656 | 1 | [0xf48eEDd0f78646b96eB68A63782411744722309D](https://sepolia-explorer.giwa.io/address/0xf48eEDd0f78646b96eB68A63782411744722309D) |

[Reality 代币快照和分片清单](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/deployments/giwa-reality-tokens-2026-11-24/manifest.json)列出全部 6,605 个 ID、地址和供应量。
旧版 GIWA Launchpad 的 77 个代币见 [旧版代币快照](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/deployments/giwa-legacy-launch-tokens-2026-11-24.json)，
其 [CustosLaunchToken 源码](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/src/CustosLaunchpad.sol)及[代表实例](https://sepolia-explorer.giwa.io/address/0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec)已验证。
源码和快照可通过 [只读脚本](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/launch-bridge/scripts/snapshot-launch-tokens.cjs)重新枚举。

## 第三方网络合约

Reality 原生 ETH 跨链使用 GIWA / OP Stack 官方基础设施，不由 Custos 部署或控制：

- Ethereum Sepolia Portal: [0x956962C34687A954e611A83619ABaA37Ce6bC78A](https://eth-sepolia.blockscout.com/address/0x956962C34687A954e611A83619ABaA37Ce6bC78A)
- Ethereum Sepolia DisputeGameFactory: [0x37347caB2afaa49B776372279143D71ad1f354F6](https://eth-sepolia.blockscout.com/address/0x37347caB2afaa49B776372279143D71ad1f354F6)
- GIWA Sepolia L2ToL1MessagePasser: [0x4200000000000000000000000000000000000016](https://sepolia-explorer.giwa.io/address/0x4200000000000000000000000000000000000016)
- GIWA Sepolia Pyth: [0x2880ab155794e7179c9ee2e38200202908c17b43](https://sepolia-explorer.giwa.io/address/0x2880ab155794e7179c9ee2e38200202908c17b43)

这些依赖的源码和验证状态应以各自官方来源及浏览器为准。V2 WETH9 源自 Uniswap / Dapphub，已保留其 GPL 许可。

## 复现与许可

各合约的精确编译输入、编译器版本、第三方源码来源及许可证说明见 [源码验证与编译输入](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/verification/README.md)。
索引基于仓库记录、实际链上代码、工厂只读查询和浏览器验证结果；它不声称覆盖无法从这些记录发现的其他部署。

## 附录 历史市场合约明细

以下 80 个合约均部署在 GIWA Sepolia，浏览器已逐个完整验证。按原部署批次分组；每个地址和源码链接均可直接打开。

### 部署批次 91342-20260828095508-fac6ee42

| 功能 | 合约地址（浏览器） | 源码 |
| --- | --- | --- |
| testUSDC | [0xcfD64985C0812E0A80Daa18c8a026FCa555113a2](https://sepolia-explorer.giwa.io/address/0xcfD64985C0812E0A80Daa18c8a026FCa555113a2) | [TestUSDC](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/TestUSDC.sol) |
| oracleRouter | [0x905778a1d1DBfd78fb1bA6F756f439B1d92Da4a0](https://sepolia-explorer.giwa.io/address/0x905778a1d1DBfd78fb1bA6F756f439B1d92Da4a0) | [PythOracleRouter](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/PythOracleRouter.sol) |
| registry | [0xa1eb5a89DabCb4A780c6191899f94D5582300880](https://sepolia-explorer.giwa.io/address/0xa1eb5a89DabCb4A780c6191899f94D5582300880) | [RwaVerificationRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaVerificationRegistry.sol) |
| assetFactory | [0x7BB430aA9fF0f9080c970855AFCE7Ef6C4Ce147F](https://sepolia-explorer.giwa.io/address/0x7BB430aA9fF0f9080c970855AFCE7Ef6C4Ce147F) | [RwaAssetFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetFactory.sol) |
| poolFactory | [0x5c4F7016e0Ea75f167d34dE210D25a2973150ba9](https://sepolia-explorer.giwa.io/address/0x5c4F7016e0Ea75f167d34dE210D25a2973150ba9) | [RwaPoolFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaPoolFactory.sol) |
| marketRegistry | [0x4Ff5F14aed26375c402c0C1164b474423ae5B3b6](https://sepolia-explorer.giwa.io/address/0x4Ff5F14aed26375c402c0C1164b474423ae5B3b6) | [MarketRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarketRegistry.sol) |
| marginVault | [0xBD1017f8c7ce46920bef44612F6C3f4bF29Ac770](https://sepolia-explorer.giwa.io/address/0xBD1017f8c7ce46920bef44612F6C3f4bF29Ac770) | [MarginVault](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarginVault.sol) |
| perpEngine | [0xdDA5dC86b949008358b4f6a21363256B5f7A0aA6](https://sepolia-explorer.giwa.io/address/0xdDA5dC86b949008358b4f6a21363256B5f7A0aA6) | [GiwaPerpEngineV12](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/GiwaPerpEngineV12.sol) |
| spot XAU token | [0xCA2E6a1be477E517730cfA0e6b675D9CA9425258](https://sepolia-explorer.giwa.io/address/0xCA2E6a1be477E517730cfA0e6b675D9CA9425258) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAU pool | [0x306495b5a0eB41ffeb64D291881F78803420dCe7](https://sepolia-explorer.giwa.io/address/0x306495b5a0eB41ffeb64D291881F78803420dCe7) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot XAG token | [0x2D7d3aC00D2Af7Ae82E8854252c86662A71B3dA8](https://sepolia-explorer.giwa.io/address/0x2D7d3aC00D2Af7Ae82E8854252c86662A71B3dA8) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAG pool | [0x7C117894Dc8a262fEDD93Be95F34D85c67EE5e1F](https://sepolia-explorer.giwa.io/address/0x7C117894Dc8a262fEDD93Be95F34D85c67EE5e1F) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot OIL token | [0xb2cDbbbA725Bdc1Cf967fD222436D7adAca87D23](https://sepolia-explorer.giwa.io/address/0xb2cDbbbA725Bdc1Cf967fD222436D7adAca87D23) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot OIL pool | [0x72F3Fa1D8C18Fb2b6460D26eFFf42F7dd4a9BAaF](https://sepolia-explorer.giwa.io/address/0x72F3Fa1D8C18Fb2b6460D26eFFf42F7dd4a9BAaF) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| RWA rKINV26 token | [0xaB8F6F6e51266a099dc1634932b9729bb519cC2C](https://sepolia-explorer.giwa.io/address/0xaB8F6F6e51266a099dc1634932b9729bb519cC2C) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | [0x243a49BeB298db0Fe82CF6249Aa7fC28cf390eAA](https://sepolia-explorer.giwa.io/address/0x243a49BeB298db0Fe82CF6249Aa7fC28cf390eAA) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | [0x48D65C6Bdc02Da7882668C1Cf22644AF0a245A34](https://sepolia-explorer.giwa.io/address/0x48D65C6Bdc02Da7882668C1Cf22644AF0a245A34) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | [0x832EaE154831929B2ed50198e5A7A01B898d5078](https://sepolia-explorer.giwa.io/address/0x832EaE154831929B2ed50198e5A7A01B898d5078) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | [0xA8F22D363Bd53Aee1593871dC0fbe4e81bAF0ACb](https://sepolia-explorer.giwa.io/address/0xA8F22D363Bd53Aee1593871dC0fbe4e81bAF0ACb) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | [0x120a44617e9876312667970bE27261d994264B79](https://sepolia-explorer.giwa.io/address/0x120a44617e9876312667970bE27261d994264B79) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |

### 部署批次 91342-20260828100415-fac6ee42

| 功能 | 合约地址（浏览器） | 源码 |
| --- | --- | --- |
| testUSDC | [0x7cF2328985e754ED424aD96423Ae501b9E2d6fFb](https://sepolia-explorer.giwa.io/address/0x7cF2328985e754ED424aD96423Ae501b9E2d6fFb) | [TestUSDC](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/TestUSDC.sol) |
| oracleRouter | [0x8A01685cB334CeB51aB37B0e9D6a997d7aeeE6Fa](https://sepolia-explorer.giwa.io/address/0x8A01685cB334CeB51aB37B0e9D6a997d7aeeE6Fa) | [PythOracleRouter](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/PythOracleRouter.sol) |
| registry | [0x2A59E3A2F7Fff7Db5b0E772dfB8e53fE8364ff82](https://sepolia-explorer.giwa.io/address/0x2A59E3A2F7Fff7Db5b0E772dfB8e53fE8364ff82) | [RwaVerificationRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaVerificationRegistry.sol) |
| assetFactory | [0x54f3C0a28EaF1E4900cE561FE97e6F86F282bA97](https://sepolia-explorer.giwa.io/address/0x54f3C0a28EaF1E4900cE561FE97e6F86F282bA97) | [RwaAssetFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetFactory.sol) |
| poolFactory | [0x05b250e9a81C5eb2aD481FB7acE5E084017126f8](https://sepolia-explorer.giwa.io/address/0x05b250e9a81C5eb2aD481FB7acE5E084017126f8) | [RwaPoolFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaPoolFactory.sol) |
| marketRegistry | [0x4a1BFdcd8CaB18Fc7470a3035aC9b88cb32fB98e](https://sepolia-explorer.giwa.io/address/0x4a1BFdcd8CaB18Fc7470a3035aC9b88cb32fB98e) | [MarketRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarketRegistry.sol) |
| marginVault | [0xB687B4711b163bC4c6f447a514Cf6Cc0DafBdA56](https://sepolia-explorer.giwa.io/address/0xB687B4711b163bC4c6f447a514Cf6Cc0DafBdA56) | [MarginVault](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarginVault.sol) |
| perpEngine | [0x82Fe9DC9e274803934E67e983080e11B25B8F80D](https://sepolia-explorer.giwa.io/address/0x82Fe9DC9e274803934E67e983080e11B25B8F80D) | [GiwaPerpEngineV12](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/GiwaPerpEngineV12.sol) |
| spot XAU token | [0x6Ccb8309564331B512C615B905ca3EB707Edb575](https://sepolia-explorer.giwa.io/address/0x6Ccb8309564331B512C615B905ca3EB707Edb575) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAU pool | [0xEbDd0c79deae9b6418daD317142Dcc3F2cA99608](https://sepolia-explorer.giwa.io/address/0xEbDd0c79deae9b6418daD317142Dcc3F2cA99608) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot XAG token | [0xE9038dff0977115141Ae42c722cDA7c0de481c95](https://sepolia-explorer.giwa.io/address/0xE9038dff0977115141Ae42c722cDA7c0de481c95) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAG pool | [0xBE0bcC3d050249d267Ab34CddA238565a311793a](https://sepolia-explorer.giwa.io/address/0xBE0bcC3d050249d267Ab34CddA238565a311793a) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot OIL token | [0x1F024eFbFd238275c982448615176b879f067936](https://sepolia-explorer.giwa.io/address/0x1F024eFbFd238275c982448615176b879f067936) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot OIL pool | [0x8d3f6D8A31E2BCb643da6B3Db54283a00643a85D](https://sepolia-explorer.giwa.io/address/0x8d3f6D8A31E2BCb643da6B3Db54283a00643a85D) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| RWA rKINV26 token | [0xbC991DB2676Abe8a58D167974cdf28cb05F9E0f0](https://sepolia-explorer.giwa.io/address/0xbC991DB2676Abe8a58D167974cdf28cb05F9E0f0) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | [0xd0533d672C7Ff89d9F96992C656f02994B890a62](https://sepolia-explorer.giwa.io/address/0xd0533d672C7Ff89d9F96992C656f02994B890a62) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | [0xD9c02c30E87BD3bd7Aa00eE0c3aAF2DEDFD05de3](https://sepolia-explorer.giwa.io/address/0xD9c02c30E87BD3bd7Aa00eE0c3aAF2DEDFD05de3) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | [0xB6CC4Cc0F787d964e68B07B6520e396d68b2fECC](https://sepolia-explorer.giwa.io/address/0xB6CC4Cc0F787d964e68B07B6520e396d68b2fECC) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | [0x1fBdC6D7434d3de98e65a4C1BEbAa378cbb794Be](https://sepolia-explorer.giwa.io/address/0x1fBdC6D7434d3de98e65a4C1BEbAa378cbb794Be) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | [0x101b093EEC73ECD50ea1C865cb19Ea119A042fA4](https://sepolia-explorer.giwa.io/address/0x101b093EEC73ECD50ea1C865cb19Ea119A042fA4) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |

### 部署批次 91342-20260828104037-fac6ee42

| 功能 | 合约地址（浏览器） | 源码 |
| --- | --- | --- |
| testUSDC | [0x1c7Fdb68f2a3431CBE63B12Eacb63CAf9D8890Af](https://sepolia-explorer.giwa.io/address/0x1c7Fdb68f2a3431CBE63B12Eacb63CAf9D8890Af) | [TestUSDC](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/TestUSDC.sol) |
| oracleRouter | [0xfc5bE0C4373C2D4C3f6F6e9D3696AC8B9361F084](https://sepolia-explorer.giwa.io/address/0xfc5bE0C4373C2D4C3f6F6e9D3696AC8B9361F084) | [PythOracleRouter](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/PythOracleRouter.sol) |
| registry | [0xEDEAa147edC4112AC697A61B0b773b15361339EA](https://sepolia-explorer.giwa.io/address/0xEDEAa147edC4112AC697A61B0b773b15361339EA) | [RwaVerificationRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaVerificationRegistry.sol) |
| assetFactory | [0xFA7D3027d1f844C307ecea2c506a81166fa37A2c](https://sepolia-explorer.giwa.io/address/0xFA7D3027d1f844C307ecea2c506a81166fa37A2c) | [RwaAssetFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetFactory.sol) |
| poolFactory | [0xAf9529BF4A7ac7Dd26255eEe984CE8Ca9241D55E](https://sepolia-explorer.giwa.io/address/0xAf9529BF4A7ac7Dd26255eEe984CE8Ca9241D55E) | [RwaPoolFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaPoolFactory.sol) |
| marketRegistry | [0xF3013E46b7957879416C996ba3eeF79bfE1A50FE](https://sepolia-explorer.giwa.io/address/0xF3013E46b7957879416C996ba3eeF79bfE1A50FE) | [MarketRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarketRegistry.sol) |
| marginVault | [0xa0D6454c23d012e1292ec7990742A80e768fbB6E](https://sepolia-explorer.giwa.io/address/0xa0D6454c23d012e1292ec7990742A80e768fbB6E) | [MarginVault](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarginVault.sol) |
| perpEngine | [0x9F0835F430aD4c6fe0A9420AfCE6b4bf36d3b0CB](https://sepolia-explorer.giwa.io/address/0x9F0835F430aD4c6fe0A9420AfCE6b4bf36d3b0CB) | [GiwaPerpEngineV12](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/GiwaPerpEngineV12.sol) |
| spot XAU token | [0xB672a53E3f0781E058F72690B1579a6892B1A871](https://sepolia-explorer.giwa.io/address/0xB672a53E3f0781E058F72690B1579a6892B1A871) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAU pool | [0x44850184e7ae94B9909AB9b484E9a45b28DdBB89](https://sepolia-explorer.giwa.io/address/0x44850184e7ae94B9909AB9b484E9a45b28DdBB89) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot XAG token | [0x2aE2756ff4F08cb8718C25a4c89b2CC42843151E](https://sepolia-explorer.giwa.io/address/0x2aE2756ff4F08cb8718C25a4c89b2CC42843151E) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAG pool | [0xC19907c7cd615f09B68d644C46bc0D39b0326bd2](https://sepolia-explorer.giwa.io/address/0xC19907c7cd615f09B68d644C46bc0D39b0326bd2) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot OIL token | [0x5DA87f28283BC35E978335be7b0513fa8d07121a](https://sepolia-explorer.giwa.io/address/0x5DA87f28283BC35E978335be7b0513fa8d07121a) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot OIL pool | [0x4E72B874998Ec330aC40A13E314C167E39Dd1014](https://sepolia-explorer.giwa.io/address/0x4E72B874998Ec330aC40A13E314C167E39Dd1014) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| RWA rKINV26 token | [0xdb23f4B260700999cBF4f86878A646D74412BDE8](https://sepolia-explorer.giwa.io/address/0xdb23f4B260700999cBF4f86878A646D74412BDE8) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | [0x43bf339A5b791587A5419Aa1d3f88508d5A97c9F](https://sepolia-explorer.giwa.io/address/0x43bf339A5b791587A5419Aa1d3f88508d5A97c9F) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | [0x3ca9C6BD47332b2e8d819a95fB2805A71Acc4C94](https://sepolia-explorer.giwa.io/address/0x3ca9C6BD47332b2e8d819a95fB2805A71Acc4C94) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | [0x8f42B22F55467837F1432e98698Aa058b7E663a4](https://sepolia-explorer.giwa.io/address/0x8f42B22F55467837F1432e98698Aa058b7E663a4) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | [0x67d4B20EEF7Aff1Cb579A854D547E8B09591c805](https://sepolia-explorer.giwa.io/address/0x67d4B20EEF7Aff1Cb579A854D547E8B09591c805) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | [0xca340191D4Dab7c5Bc48B10b7f8A935b616354ef](https://sepolia-explorer.giwa.io/address/0xca340191D4Dab7c5Bc48B10b7f8A935b616354ef) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |

### 部署批次 91342-20260906011746-06709d97

| 功能 | 合约地址（浏览器） | 源码 |
| --- | --- | --- |
| testUSDC | [0x9a434B8578319433844154DC4eb6e4CaA119EdE8](https://sepolia-explorer.giwa.io/address/0x9a434B8578319433844154DC4eb6e4CaA119EdE8) | [TestUSDC](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/TestUSDC.sol) |
| oracleRouter | [0xD5005CcB436c0479206cD0757740cF249144C9E7](https://sepolia-explorer.giwa.io/address/0xD5005CcB436c0479206cD0757740cF249144C9E7) | [PythOracleRouter](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/PythOracleRouter.sol) |
| registry | [0x0689AFa9ED68115844707b7625088ef5e6e1ac12](https://sepolia-explorer.giwa.io/address/0x0689AFa9ED68115844707b7625088ef5e6e1ac12) | [RwaVerificationRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaVerificationRegistry.sol) |
| assetFactory | [0xc766701e6fB30e3fcE4CeB1167ca2762BF3C5B91](https://sepolia-explorer.giwa.io/address/0xc766701e6fB30e3fcE4CeB1167ca2762BF3C5B91) | [RwaAssetFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetFactory.sol) |
| poolFactory | [0x43cCDa15C2fd90b887566ffbFB6157C6F63d0d6B](https://sepolia-explorer.giwa.io/address/0x43cCDa15C2fd90b887566ffbFB6157C6F63d0d6B) | [RwaPoolFactory](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaPoolFactory.sol) |
| marketRegistry | [0x3E7D87cFA2f30074C7E7CF4206CE4e4ECBDaCc30](https://sepolia-explorer.giwa.io/address/0x3E7D87cFA2f30074C7E7CF4206CE4e4ECBDaCc30) | [MarketRegistry](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarketRegistry.sol) |
| marginVault | [0xD4ecF7bB001554F7d312036c86699dC2d6218224](https://sepolia-explorer.giwa.io/address/0xD4ecF7bB001554F7d312036c86699dC2d6218224) | [MarginVault](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/MarginVault.sol) |
| perpEngine | [0x7736bb4341491C011087d407d76318F4a581395F](https://sepolia-explorer.giwa.io/address/0x7736bb4341491C011087d407d76318F4a581395F) | [GiwaPerpEngineV12](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/perp/GiwaPerpEngineV12.sol) |
| spot XAU token | [0xaaff09f126342553829c38F6b7B75da63C7F7bbE](https://sepolia-explorer.giwa.io/address/0xaaff09f126342553829c38F6b7B75da63C7F7bbE) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAU pool | [0x92033FD87e9Fb97F870F0162ebAFc4bc7fEdF8ec](https://sepolia-explorer.giwa.io/address/0x92033FD87e9Fb97F870F0162ebAFc4bc7fEdF8ec) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot XAG token | [0x5e50e53864D97EA90fe6c754ED1042541E8831C4](https://sepolia-explorer.giwa.io/address/0x5e50e53864D97EA90fe6c754ED1042541E8831C4) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot XAG pool | [0xbF9C4F4a5805c287aa062AA8F4772d94E4f007f2](https://sepolia-explorer.giwa.io/address/0xbF9C4F4a5805c287aa062AA8F4772d94E4f007f2) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| spot OIL token | [0x6ef49E02BE1BAc8C9085a3A31DF19efc318EA3ca](https://sepolia-explorer.giwa.io/address/0x6ef49E02BE1BAc8C9085a3A31DF19efc318EA3ca) | [SyntheticRwaToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/SyntheticRwaToken.sol) |
| spot OIL pool | [0x970d57Bea4d0f7b8dd6D851520008a20C95f16Ab](https://sepolia-explorer.giwa.io/address/0x970d57Bea4d0f7b8dd6D851520008a20C95f16Ab) | [OracleSpotPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/spot/OracleSpotPool.sol) |
| RWA rKINV26 token | [0x867590520D75F6597cb50ae30E35698649642229](https://sepolia-explorer.giwa.io/address/0x867590520D75F6597cb50ae30E35698649642229) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | [0x2541a6D54618Cb533cE35bAABE471DdCDb59aD96](https://sepolia-explorer.giwa.io/address/0x2541a6D54618Cb533cE35bAABE471DdCDb59aD96) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | [0xf60969b4C5f32105FF90956199048A0Dc8219A94](https://sepolia-explorer.giwa.io/address/0xf60969b4C5f32105FF90956199048A0Dc8219A94) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | [0x85b0de9bd837b4C5803c2b9d4aAb8e087dCBDAB3](https://sepolia-explorer.giwa.io/address/0x85b0de9bd837b4C5803c2b9d4aAb8e087dCBDAB3) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | [0x31354F683a74E55E6139b8b70776458C7A4B92aF](https://sepolia-explorer.giwa.io/address/0x31354F683a74E55E6139b8b70776458C7A4B92aF) | [RwaAssetToken](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | [0x3ADCAFB6E19344E2528E17891eeA6c19f115B9ac](https://sepolia-explorer.giwa.io/address/0x3ADCAFB6E19344E2528E17891eeA6c19f115B9ac) | [RwaAMMPool](https://github.com/custosDefi/custos-Finance/blob/c3320b2d8dc739ca06f52ecc4145524cb78a40e4/contracts/markets/contracts/RwaAMMPool.sol) |
