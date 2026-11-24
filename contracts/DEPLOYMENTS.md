# Custos 链上合约与源码索引

本清单记录截至 2026-11-24 核对的部署。GIWA Sepolia（91342）和 Ethereum Sepolia（11155111）都是测试网。
“已验证”表示浏览器返回完整源码匹配，不代表合约经过安全审计；所列配置也不保证对应业务当前可用。

项目固定地址中，42 个 GIWA 合约和 4 个 Ethereum Sepolia 合约已在各自的 Blockscout 浏览器完整验证。
另外 80 个旧版 GIWA 市场部署也已逐个完整验证，见 [历史市场地址清单](deployments/giwa-market-history-2026-11-24.json)。
结构化地址、源码路径、链和编译器版本见 [固定合约清单](deployments/contract-registry-2026-11-24.json)。

## 当前核心合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| Reality launchpad | GIWA Sepolia | [0x61Ce8427cFC9947dAe0eBc84E367d6e666f90285](https://sepolia-explorer.giwa.io/address/0x61Ce8427cFC9947dAe0eBc84E367d6e666f90285) | [CustosRealityLaunchpad](launch-bridge/src/CustosRealityLaunchpad.sol) |
| CFI staking | GIWA Sepolia | [0x91618694D70100edd9e6508A1d680Ea4E0797592](https://sepolia-explorer.giwa.io/address/0x91618694D70100edd9e6508A1d680Ea4E0797592) | [CustosCFIBinanceStake](launch-bridge/src/CustosCFIBinanceStake.sol) |
| Configurable faucet | GIWA Sepolia | [0xb77C2e25D7a998556eE0C71d170e7FD7Ead080a1](https://sepolia-explorer.giwa.io/address/0xb77C2e25D7a998556eE0C71d170e7FD7Ead080a1) | [CustosConfigurableTestnetFaucet](launch-bridge/src/CustosConfigurableTestnetFaucet.sol) |
| KBW NFT | GIWA Sepolia | [0xF2B200A8a90cB40f08e91CE1539260556719d691](https://sepolia-explorer.giwa.io/address/0xF2B200A8a90cB40f08e91CE1539260556719d691) | [CustosKBW2026](nft/contracts/CustosKBW2026.sol) |

## V2 交易合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| V2 weth | GIWA Sepolia | [0xeDBc87C8c03af5eB8Ff2C97ae9708719Ed050b66](https://sepolia-explorer.giwa.io/address/0xeDBc87C8c03af5eB8Ff2C97ae9708719Ed050b66) | [WETH9](verification/third-party/WETH9.sol) |
| V2 factory | GIWA Sepolia | [0x349a1CBB28C6267B4B567A06b2661Af8d6A1a1f5](https://sepolia-explorer.giwa.io/address/0x349a1CBB28C6267B4B567A06b2661Af8d6A1a1f5) | [UniswapV2Factory](swap/contracts/factory.sol) |
| V2 router | GIWA Sepolia | [0x4F1F5E8DE722e2773e7794af41ca0863457943C5](https://sepolia-explorer.giwa.io/address/0x4F1F5E8DE722e2773e7794af41ca0863457943C5) | [UniswapV2Router02](swap/contracts/router.sol) |
| V2 multicall | GIWA Sepolia | [0x95a882901Bd9e4F819034ba62FB3F21Cf248E19B](https://sepolia-explorer.giwa.io/address/0x95a882901Bd9e4F819034ba62FB3F21Cf248E19B) | [Multicall](swap/contracts/muticall.sol) |
| V2 tokenA | GIWA Sepolia | [0x32AF40B25CB5842f91E2B790563e5F0e51A70832](https://sepolia-explorer.giwa.io/address/0x32AF40B25CB5842f91E2B790563e5F0e51A70832) | [MockERC20](swap/contracts/MockERC20.sol) |
| V2 tokenB | GIWA Sepolia | [0x5ea3096fA9366e136605A73269B38900529dfD5A](https://sepolia-explorer.giwa.io/address/0x5ea3096fA9366e136605A73269B38900529dfD5A) | [MockERC20](swap/contracts/MockERC20.sol) |
| V2 pair | GIWA Sepolia | [0x1A649Eb1D48D7962D3f72A54311CA4048590B25A](https://sepolia-explorer.giwa.io/address/0x1A649Eb1D48D7962D3f72A54311CA4048590B25A) | [UniswapV2Pair](swap/contracts/factory.sol) |
| V2 second pair | GIWA Sepolia | [0x9c3e1A84Bd7f9F74F211d214c40F47f8A5F41ac6](https://sepolia-explorer.giwa.io/address/0x9c3e1A84Bd7f9F74F211d214c40F47f8A5F41ac6) | [UniswapV2Pair](swap/contracts/factory.sol) |

## 市场、资产与资金池

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| Markets testUSDC | GIWA Sepolia | [0xdE1Ae220D755AFf0Ddd1f02dBe93F2E0FeF2f263](https://sepolia-explorer.giwa.io/address/0xdE1Ae220D755AFf0Ddd1f02dBe93F2E0FeF2f263) | [TestUSDC](markets/contracts/perp/TestUSDC.sol) |
| Markets oracleRouter | GIWA Sepolia | [0x4aE104028b03c2Bd8730b32999A0ce22865A8eee](https://sepolia-explorer.giwa.io/address/0x4aE104028b03c2Bd8730b32999A0ce22865A8eee) | [PythOracleRouter](markets/contracts/perp/PythOracleRouter.sol) |
| Markets registry | GIWA Sepolia | [0x094d3a81582E470d9b669C0E776eE422CbEC4570](https://sepolia-explorer.giwa.io/address/0x094d3a81582E470d9b669C0E776eE422CbEC4570) | [RwaVerificationRegistry](markets/contracts/RwaVerificationRegistry.sol) |
| Markets assetFactory | GIWA Sepolia | [0xe306f0ea65CCe42462f57E79b7EC203a4e88dAee](https://sepolia-explorer.giwa.io/address/0xe306f0ea65CCe42462f57E79b7EC203a4e88dAee) | [RwaAssetFactory](markets/contracts/RwaAssetFactory.sol) |
| Markets poolFactory | GIWA Sepolia | [0x5360507e0965f9e0d50b729E72a17B83B3ccd8Cc](https://sepolia-explorer.giwa.io/address/0x5360507e0965f9e0d50b729E72a17B83B3ccd8Cc) | [RwaPoolFactory](markets/contracts/RwaPoolFactory.sol) |
| Markets marketRegistry | GIWA Sepolia | [0x1F8088286c9ecb75A4AECe9300524C9B4f33cEC4](https://sepolia-explorer.giwa.io/address/0x1F8088286c9ecb75A4AECe9300524C9B4f33cEC4) | [MarketRegistry](markets/contracts/perp/MarketRegistry.sol) |
| Markets marginVault | GIWA Sepolia | [0x38847c6C1fC6bACAD3929c541812f532CFcdc174](https://sepolia-explorer.giwa.io/address/0x38847c6C1fC6bACAD3929c541812f532CFcdc174) | [MarginVault](markets/contracts/perp/MarginVault.sol) |
| Markets perpEngine | GIWA Sepolia | [0x6163B145B1cDe748E3BE527df3085E708880F7F3](https://sepolia-explorer.giwa.io/address/0x6163B145B1cDe748E3BE527df3085E708880F7F3) | [GiwaPerpEngineV12](markets/contracts/perp/GiwaPerpEngineV12.sol) |
| RWA rKINV26 token | GIWA Sepolia | [0x85B65f5A44EE2faff5e99D04A5E2f842c16c12B3](https://sepolia-explorer.giwa.io/address/0x85B65f5A44EE2faff5e99D04A5E2f842c16c12B3) | [RwaAssetToken](markets/contracts/RwaAssetToken.sol) |
| RWA rKINV26 pool | GIWA Sepolia | [0xeA3ec5d362D5599161e5Bc4013103Fb0b4758A95](https://sepolia-explorer.giwa.io/address/0xeA3ec5d362D5599161e5Bc4013103Fb0b4758A95) | [RwaAMMPool](markets/contracts/RwaAMMPool.sol) |
| RWA rSOLAR27 token | GIWA Sepolia | [0x9e1CD03EEfe22e62f104966Dc7784c32fC174e07](https://sepolia-explorer.giwa.io/address/0x9e1CD03EEfe22e62f104966Dc7784c32fC174e07) | [RwaAssetToken](markets/contracts/RwaAssetToken.sol) |
| RWA rSOLAR27 pool | GIWA Sepolia | [0x01Ef4d5431EB2Ed3f66D47686D433b34928dF3dd](https://sepolia-explorer.giwa.io/address/0x01Ef4d5431EB2Ed3f66D47686D433b34928dF3dd) | [RwaAMMPool](markets/contracts/RwaAMMPool.sol) |
| RWA rCOFFEE26 token | GIWA Sepolia | [0x09fDD53efaA8b87Fe2B6C4e09f179b9BaED08913](https://sepolia-explorer.giwa.io/address/0x09fDD53efaA8b87Fe2B6C4e09f179b9BaED08913) | [RwaAssetToken](markets/contracts/RwaAssetToken.sol) |
| RWA rCOFFEE26 pool | GIWA Sepolia | [0xCc753182d9DDD5875Ba974a16600f1Dac83Efa1f](https://sepolia-explorer.giwa.io/address/0xCc753182d9DDD5875Ba974a16600f1Dac83Efa1f) | [RwaAMMPool](markets/contracts/RwaAMMPool.sol) |
| Spot XAU token | GIWA Sepolia | [0xA9E82BA86C8069508be7dc254248946886E6B0FE](https://sepolia-explorer.giwa.io/address/0xA9E82BA86C8069508be7dc254248946886E6B0FE) | [SyntheticRwaToken](markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot XAU pool | GIWA Sepolia | [0xa6B3b7e400d89874880F78654211B5108d2f563C](https://sepolia-explorer.giwa.io/address/0xa6B3b7e400d89874880F78654211B5108d2f563C) | [OracleSpotPool](markets/contracts/spot/OracleSpotPool.sol) |
| Spot XAG token | GIWA Sepolia | [0x0032b38908bDDDF634Aa0e9a548C516573FC1A3B](https://sepolia-explorer.giwa.io/address/0x0032b38908bDDDF634Aa0e9a548C516573FC1A3B) | [SyntheticRwaToken](markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot XAG pool | GIWA Sepolia | [0x73D0D1FfFF7Cb3B5E98694B8e68268123c0A5144](https://sepolia-explorer.giwa.io/address/0x73D0D1FfFF7Cb3B5E98694B8e68268123c0A5144) | [OracleSpotPool](markets/contracts/spot/OracleSpotPool.sol) |
| Spot OIL token | GIWA Sepolia | [0xD451C4fFFE0F77887b1036D1e431b9d3b408154A](https://sepolia-explorer.giwa.io/address/0xD451C4fFFE0F77887b1036D1e431b9d3b408154A) | [SyntheticRwaToken](markets/contracts/spot/SyntheticRwaToken.sol) |
| Spot OIL pool | GIWA Sepolia | [0x6000F1Bb346AF1Bd6EDB3F061E6A2BBA15270756](https://sepolia-explorer.giwa.io/address/0x6000F1Bb346AF1Bd6EDB3F061E6A2BBA15270756) | [OracleSpotPool](markets/contracts/spot/OracleSpotPool.sol) |

## 历史及跨链合约

| 功能 / 合约 | 链 | 合约地址（浏览器） | 源码 |
| --- | --- | --- | --- |
| GIWA Genesis NFT | GIWA Sepolia | [0xe12c3b8940368e85500ec48CfF1EB0e7cB882dF2](https://sepolia-explorer.giwa.io/address/0xe12c3b8940368e85500ec48CfF1EB0e7cB882dF2) | [GiwaGenesis](nft/contracts/GiwaGenesis.sol) |
| Previous Binance CFI vault | GIWA Sepolia | [0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87](https://sepolia-explorer.giwa.io/address/0xE38214dEAC49b139d1a6376b3A58Ff72B3D0eE87) | [CustosCFIBinanceStake](launch-bridge/src/CustosCFIBinanceStake.sol) |
| Previous Pyth CFI vault | GIWA Sepolia | [0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137](https://sepolia-explorer.giwa.io/address/0xE6ad5FE166edeA0B949180168E928Ee6AA9B7137) | [CustosCFIStake](launch-bridge/src/CustosCFIStake.sol) |
| Previous test faucet | GIWA Sepolia | [0x08a9e665fC13e65021DA8e8b2C8993Db843d5Fb7](https://sepolia-explorer.giwa.io/address/0x08a9e665fC13e65021DA8e8b2C8993Db843d5Fb7) | [CustosTestnetFaucet](launch-bridge/src/CustosTestnetFaucet.sol) |
| Legacy launchpad | GIWA Sepolia | [0x37BC45c02dbc2f390E7404aFB688FA64e3b17E64](https://sepolia-explorer.giwa.io/address/0x37BC45c02dbc2f390E7404aFB688FA64e3b17E64) | [CustosLaunchpad](launch-bridge/src/CustosLaunchpad.sol) |
| Legacy bridge | GIWA Sepolia | [0xEee47E68C564dDC33F91e62555fb76E969606C44](https://sepolia-explorer.giwa.io/address/0xEee47E68C564dDC33F91e62555fb76E969606C44) | [CustosBridge](verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy bridgeToken | GIWA Sepolia | [0xa35b0D5F4C3f870f2fFfA154eA41083ABF694c0A](https://sepolia-explorer.giwa.io/address/0xa35b0D5F4C3f870f2fFfA154eA41083ABF694c0A) | [CustosBridgeToken](verification/historical/CustosBridge-2026-09-06.sol) |
| Initial faucet | GIWA Sepolia | [0x857cd2B7FAC430b88E34bD0DbBDb4cc69Aa1d251](https://sepolia-explorer.giwa.io/address/0x857cd2B7FAC430b88E34bD0DbBDb4cc69Aa1d251) | [CustosTestnetFaucet](verification/historical/CustosTestnetFaucet-initial.sol) |
| Initial GIWA Genesis NFT | GIWA Sepolia | [0x930552e1bB7ff3c47011FC21B8483cAc7528F9fB](https://sepolia-explorer.giwa.io/address/0x930552e1bB7ff3c47011FC21B8483cAc7528F9fB) | [GiwaGenesis](nft/contracts/GiwaGenesis.sol) |
| Legacy launch token example | GIWA Sepolia | [0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec](https://sepolia-explorer.giwa.io/address/0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec) | [CustosLaunchToken](launch-bridge/src/CustosLaunchpad.sol) |
| Legacy launchpad | Ethereum Sepolia | [0xD5005CcB436c0479206cD0757740cF249144C9E7](https://eth-sepolia.blockscout.com/address/0xD5005CcB436c0479206cD0757740cF249144C9E7) | [CustosLaunchpad](launch-bridge/src/CustosLaunchpad.sol) |
| Legacy bridge | Ethereum Sepolia | [0x9C296c3F0586Ab6412E06161D148eAde806076a0](https://eth-sepolia.blockscout.com/address/0x9C296c3F0586Ab6412E06161D148eAde806076a0) | [CustosBridge](verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy bridge token | Ethereum Sepolia | [0x35BF7faB801C3fF283f4fABaE5ae8690099e9e01](https://eth-sepolia.blockscout.com/address/0x35BF7faB801C3fF283f4fABaE5ae8690099e9e01) | [CustosBridgeToken](verification/historical/CustosBridge-2026-09-06.sol) |
| Legacy launch token | Ethereum Sepolia | [0xe1eE00FA78F41D92B69b1D50CE3d47eBBfE578A4](https://eth-sepolia.blockscout.com/address/0xe1eE00FA78F41D92B69b1D50CE3d47eBBfE578A4) | [CustosLaunchToken](launch-bridge/src/CustosLaunchpad.sol) |

## 发行平台生成的代币

当前 Reality 发行平台在 GIWA 区块 **42178793** 的快照包含 **6605 个代币实例**。
这些实例由同一份 [RealityToken 源码](launch-bridge/src/CustosRealityLaunchpad.sol)生成，供应量作为 immutable 写入字节码。
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

[Reality 代币快照和分片清单](deployments/giwa-reality-tokens-2026-11-24/manifest.json)列出全部 6,605 个 ID、地址和供应量。
旧版 GIWA Launchpad 的 77 个代币见 [旧版代币快照](deployments/giwa-legacy-launch-tokens-2026-11-24.json)，
其 [CustosLaunchToken 源码](launch-bridge/src/CustosLaunchpad.sol)及[代表实例](https://sepolia-explorer.giwa.io/address/0xF839ED22AA15Bfb6874c070cBC93E0179893a4ec)已验证。
源码和快照可通过 [只读脚本](launch-bridge/scripts/snapshot-launch-tokens.cjs)重新枚举。

## 第三方网络合约

Reality 原生 ETH 跨链使用 GIWA / OP Stack 官方基础设施，不由 Custos 部署或控制：

- Ethereum Sepolia Portal: [0x956962C34687A954e611A83619ABaA37Ce6bC78A](https://eth-sepolia.blockscout.com/address/0x956962C34687A954e611A83619ABaA37Ce6bC78A)
- Ethereum Sepolia DisputeGameFactory: [0x37347caB2afaa49B776372279143D71ad1f354F6](https://eth-sepolia.blockscout.com/address/0x37347caB2afaa49B776372279143D71ad1f354F6)
- GIWA Sepolia L2ToL1MessagePasser: [0x4200000000000000000000000000000000000016](https://sepolia-explorer.giwa.io/address/0x4200000000000000000000000000000000000016)
- GIWA Sepolia Pyth: [0x2880ab155794e7179c9ee2e38200202908c17b43](https://sepolia-explorer.giwa.io/address/0x2880ab155794e7179c9ee2e38200202908c17b43)

这些依赖的源码和验证状态应以各自官方来源及浏览器为准。V2 WETH9 源自 Uniswap / Dapphub，已保留其 GPL 许可。

## 复现与许可

各合约的精确编译输入、编译器版本、第三方源码来源及许可证说明见 [源码验证与编译输入](verification/README.md)。
索引基于仓库记录、实际链上代码、工厂只读查询和浏览器验证结果；它不声称覆盖无法从这些记录发现的其他部署。
