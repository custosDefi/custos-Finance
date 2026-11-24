# Custos 合约开源目录

这里汇总项目的 Solidity 源码、已知部署地址、区块浏览器验证结果以及可复现的编译输入。

- [链上合约与源码索引](DEPLOYMENTS.md)：按功能列出合约地址、浏览器链接和源码。
- [可转发的合约开源报告](OPEN-SOURCE-REPORT-2026-11-24.md)：包含固定及历史合约明细，链接可独立打开。
- [Reality 代币地址快照](deployments/giwa-reality-tokens-2026-11-24/manifest.json)：分片列出截至指定区块的 6,605 个发行实例。
- [旧版市场部署](deployments/giwa-market-history-2026-11-24.json)：80 个历史合约地址及源码路径。
- [源码验证与编译输入](verification/README.md)：编译器版本、标准 JSON 输入及许可信息。

源码按用途存放：

| 目录 | 内容 |
| --- | --- |
| [launch-bridge/src](launch-bridge/src) | 发行平台、质押、测试水龙头和旧版跨链合约 |
| [markets/contracts](markets/contracts) | 测试代币、预言机、现货、永续和 RWA 市场 |
| [nft/contracts](nft/contracts) | NFT 合约 |
| [swap/contracts](swap/contracts) | V2 工厂、路由、交易对、多调用和测试代币 |
| [verification](verification) | 已部署历史源码、第三方源码及精确编译输入 |

这些记录覆盖 GIWA Sepolia 与 Ethereum Sepolia 测试网；第三方网络基础设施与项目合约在索引中分别标注。
