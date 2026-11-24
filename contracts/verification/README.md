# 源码验证与编译输入

[`inputs/`](inputs) 中是验证链上合约时使用的 Solidity Standard JSON 输入，包含源码及优化器、EVM 版本等编译设置。它们可以在区块浏览器选择 **Solidity Standard JSON Input** 后直接上传，并使用下列编译器版本。构造参数由浏览器从部署记录识别。

| 输入 | 编译器 | 合约 |
| --- | --- | --- |
| [reality-launchpad](inputs/reality-launchpad-v0.8.30.json) | `v0.8.30+commit.73712a01` | `CustosRealityLaunchpad`, `RealityToken` |
| [cfi-binance-stake](inputs/cfi-binance-stake-v0.8.30.json) | `v0.8.30+commit.73712a01` | `CustosCFIBinanceStake` |
| [cfi-pyth-stake](inputs/cfi-pyth-stake-v0.8.30.json) | `v0.8.30+commit.73712a01` | `CustosCFIStake`（历史版本） |
| [configurable-faucet](inputs/configurable-faucet-v0.8.30.json) | `v0.8.30+commit.73712a01` | `CustosConfigurableTestnetFaucet` |
| [legacy-faucet](inputs/legacy-faucet-v0.8.30.json), [initial-faucet](inputs/initial-faucet-v0.8.30.json) | `v0.8.30+commit.73712a01` | 两个已退役版本的 `CustosTestnetFaucet` |
| [legacy-launch-bridge](inputs/legacy-launch-bridge-v0.6.6.json) | `v0.6.6+commit.6c089d02` | `CustosLaunchpad`, `CustosLaunchToken`, `CustosBridge`, `CustosBridgeToken` |
| [markets](inputs/markets-v0.8.26.json) | `v0.8.26+commit.8a97fa7a` | 现货、永续、RWA、预言机和测试代币 |
| [giwa-genesis-nft](inputs/giwa-genesis-nft-v0.8.26.json) | `v0.8.26+commit.8a97fa7a` | `GiwaGenesis` |
| [kbw2026-nft](inputs/kbw2026-nft-v0.8.30.json) | `v0.8.30+commit.73712a01` | `CustosKBW2026` |
| [uniswap-v2-factory](inputs/uniswap-v2-factory-v0.5.16.json) | `v0.5.16+commit.9c3226ce` | `UniswapV2Factory`, `UniswapV2Pair` |
| [uniswap-v2-router](inputs/uniswap-v2-router-v0.6.6.json) | `v0.6.6+commit.6c089d02` | `UniswapV2Router02` |
| [multicall](inputs/multicall-v0.6.12.json) | `v0.6.12+commit.27d51765` | `Multicall` |
| [mock-erc20](inputs/mock-erc20-v0.6.6.json) | `v0.6.6+commit.6c089d02` | `MockERC20` |
| [uniswap-weth9](inputs/uniswap-weth9-v0.6.6.json) | `v0.6.6+commit.6c089d02` | `WETH9` |

例如，使用已安装的 Solidity 0.8.30 编译器可以执行：

```bash
solc --standard-json < contracts/verification/inputs/cfi-binance-stake-v0.8.30.json > /tmp/cfi-compiled.json
```

旧版跨链合约部署时的 [CustosBridge 源码](historical/CustosBridge-2026-09-06.sol)与现行仓库版本只有注释差异；两者编译后的元数据不同。初代水龙头的[部署时源码](historical/CustosTestnetFaucet-initial.sol)也单独保存。KBW NFT 部署时使用 Solidity 0.8.30 和 `CustosKBW2026.sol` 作为源文件名，输入保留了这一细节。

项目源码的许可证以各文件中的 SPDX 标识为准。OpenZeppelin 依赖保留其 MIT 许可证；[WETH9](third-party/WETH9.sol)源自 Uniswap V2 Periphery / Dapphub，保留 GNU GPL v3 或更高版本的原始许可文本。V2 目录的 [GPL v3 许可证](../swap/LICENSE)也随仓库保留。

重新生成发行平台地址快照需要 Node.js 18+、`curl` 和 `contracts/launch-bridge` 的依赖；命令只读取链上数据，不会签名或发送交易：

```bash
cd contracts/launch-bridge
npm install
node scripts/snapshot-launch-tokens.cjs --output /tmp/custos-reality-tokens.json
node scripts/snapshot-launch-tokens.cjs --legacy --output /tmp/custos-legacy-tokens.json
```

可选 `--limit N` 用于只检查前 N 个实例，`GIWA_RPC_URL` 可指定 GIWA Sepolia RPC。脚本读取同一区块上的发行数量和代币信息。
