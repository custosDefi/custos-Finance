# 合约复用研究与边界

## 1. Robinhood 核验

核验日期：2026-08-28。

公开来源：

- [Robinhood GitHub 组织](https://github.com/Robinhood)
- [Robinhood Chain 官方文档](https://docs.robinhood.com/chain/)
- [Token Contracts](https://docs.robinhood.com/chain/contracts)
- [Building with Stock Tokens](https://docs.robinhood.com/chain/building-with-stock-tokens)
- [Robinhood Chain 生态](https://docs.robinhood.com/chain/#ecosystem)

核验结果：

- Robinhood 官方 GitHub 组织的公开仓库主要是 Faust、ticker、spark、thorn、Kafka/Airflow 等基础设施，没有官方 Token Launchpad、RWA Launchpad 或可直接复用的发射平台合约。
- Robinhood Chain 的官方文档展示的是已发行的 Stock Token/ETF 合约地址、交易场所和开发接口，不是一个让第三方任意发行资产的 Factory。
- Stock Tokens 虽然兼容 ERC-20，但还有发行方定义的扩展和专门的发行/法律关系；“链是 permissionless”不等于“任何人都能发行 Robinhood Stock Token”。
- 官方生态页把 Uniswap、Rialto、Morpho 等交易/流动性/借贷组件与资产发行分开描述，符合“资产目录、发行主体、流动性和应用入口分层”的参考方向。

结论：Robinhood 官方代码和文档只能作为产品分层、资产目录和交易入口的参考，不能作为 Custos 的 Launchpad 合约来源，也不能把其 Stock Token 发行模式复制到普通 RWA 项目。

## 1.1 Robinhood Chain 社区 Launchpad 补充核验

补充核验日期：2026-08-28。详细记录见[《Robinhood Chain 社区 Launchpad 补充核验》](./10-robinhood-launchpad-review.md)。

公开仓库中确实出现了若干自称 Robinhood Chain Launchpad 的社区项目，但“代码公开”不等于“可以安全复用”。本次重点核对了开源许可、源码/部署证据、审计声明和目标链：

| 项目 | 可确认的证据 | 当前结论 |
| --- | --- | --- |
| PotatoPad | MIT with attribution；README 明确标注 `Unaudited`、`Not production-ready` | 只能参考直接进入 Uniswap V3 的产品流程，不接入 |
| Hashling Factory V2 | MIT；仓库提供 Robinhood Chain 4663 地址；Blockscout 地址接口显示源码已验证 | 没有独立审计/安全策略，且不是当前目标 L2，不接入 |
| Dazren | 有源码、测试和 Robinhood testnet 46630 部署记录；仓库自己说明内部 review 不是独立审计 | 不接入；测试网部署不能替代目标链生产部署 |
| Zentral | MIT、Robinhood Chain 4663 验证地址和本地测试 | 未找到独立外部审计证据，不接入 |
| Hoodium | 有合约源码和内部审计记录；合约 README 明确外部审计未完成且阻塞真实资金部署 | 不接入 |

因此，当前没有同时满足“当前目标 L2 部署、源码与 ABI 可追溯、许可明确、独立安全材料充分、权限和资金路径可核验”的外部 Launchpad。社区项目的架构可以继续作为参考，但不能把它们的地址、ABI 或合约源码直接复制到本项目。

## 2. 目标 L2（GIWA Sepolia）核验

公开来源：

- [GIWA Chain 文档](https://docs.giwa.io/)
- [GIWA Sepolia 网络信息](https://docs.giwa.io/get-started/connect-to-giwa)
- [GIWA 合约地址](https://docs.giwa.io/network-information/contracts)
- [GIWA Token 合约教程](https://docs.giwa.io/get-started/smart-contract/issue-a-token)
- [GIWA GitHub 组织](https://github.com/giwa-io)
- [Dojang 源码](https://github.com/giwa-io/dojang)

核验结果：

- GIWA Sepolia chain ID 为 `91342`，是 EVM/OP Stack L2。
- 官方合约清单包含 `OptimismMintableERC20Factory`、EAS、Dojang 相关合约和 Playground 的 `VerifiedToken`，但没有通用 Permissionless Token Factory、Sale、Vesting 或 LP Lock 合约。
- `OptimismMintableERC20Factory` 是桥接系统组件，不能当作任意项目 Token Launchpad；它要求已有 L1 资产关系，不能满足“用户填写名称后直接创建一个独立 Token”。
- GIWA 官方 Token 教程是开发者自行编写/部署 ERC-20 的教程；这不符合本项目“不自研发行合约”的边界。
- Dojang 是身份/事实 attestation 基础设施，可以作为未来 RWA 项目方或地址证明的参考，但不是 RWA Registry，也不证明底层资产所有权。

结论：当前目标 L2 没有满足接入门槛的外部 Launchpad。Custos 暂不开放链上发币按钮，Launch 先做登记、审核和已有 Token/Pool 的接入；真实发币作为后续独立适配任务。

## 3. 当前仓库可保留的成熟能力

| 能力 | 当前来源 | 处理 |
| --- | --- | --- |
| ERC-20 Swap | Uniswap V2 风格实现 | 保留并继续测试 |
| Factory/Router/Pair | 当前 uniswapContract/contracts | 只用于 Swap，暂不扩展 |
| Token SDK | v2-sdk | 保留 |
| Token 标准接口 | OpenZeppelin/行业 ERC-20 接口 | 作为后续适配约束 |
| Market 元数据 | 后端 SQLite/API | 保留为应用层，不宣称链上证明 |

## 4. 后续候选组件

候选必须逐项通过许可证、独立审计、版本、目标 L2 部署和权限检查：

- ERC-20：OpenZeppelin Contracts 的固定版本实现。
- Minimal proxy/clone：只在外部 Factory 已有明确审计边界时使用。
- Vesting：成熟的 VestingWallet 类实现。
- LP Lock：采用已有协议或第三方已部署、可验证的锁仓合约。
- Fixed-price sale：优先复用现有 Sale/Claim 协议；找不到可靠实现时先做链下审核和项目方外部发售。

本仓库当前不写新的 Launchpad、Bonding Curve、Sale、Vesting、LP Lock 或 RWA Registry 合约，也不接入只有自我声明而没有独立安全证据的社区部署。

## 5. 适配器原则

前端和后端只依赖抽象能力：

LaunchRequest → optional ContractAdapter → TokenAddress / PoolAddress / TxHash → Market Listing。

没有 ContractAdapter 时：

- 可以提交和审核资料。
- 可以保存已有 Token/Pool 地址。
- 可以进入 Market。
- 不能把表单提交显示成链上发行。
- 不能自动转账、做市、铸币或锁 LP。

只有当外部适配器通过完整核验后，才允许将 Permissionless Launch 从“开放登记”升级为“钱包发起的链上创建 Token”。

## 6. RWA 特别约束

RWA 项目页面只展示项目方提供的事实和文件引用：

- 发行方和托管方由项目方填写。
- 文件通过 URI 或 Hash 引用。
- 审核状态由管理员/审核流程产生。
- Verified 只表示资料状态，不表示法律批准、资产偿付或投资安全。
- Market 的价格如果未来接入，必须单独标注来源、更新时间和用途。
