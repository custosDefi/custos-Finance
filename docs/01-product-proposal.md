# Custos Launch & Market 产品方案

状态：重构基线
日期：2026-08-28

## 1. 背景

Custos 被邀请到一条 L2 上做生态项目并申请 grant。团队资金有限，因此不适合承担需要大量库存、做市资金、风险准备金或复杂清算系统的产品。

本阶段的目标不是做一个全品类 DeFi，而是做一套可以被 L2 生态使用的资产入口：

项目提交资产信息 → 资产进入 Launch 流程 → 经过登记/审核 → 出现在 Market → 项目方提供流动性 → 用户通过 Swap 交易。

## 2. 产品定位

产品名称暂定：Custos Launch & Market。

定位：

> 一个面向 L2 生态的轻资产资产发行入口、精选 RWA 项目目录和 Swap 交易入口。

Custos 不承担发行方、托管方、做市商、审计方或法律意见提供者的角色。RWA 页面展示的是项目提交和审核状态，不等同于 Custos 对底层资产真实性、价值、偿付能力或收益的承诺。

## 3. 第一阶段范围

### 3.1 Swap

- 保留当前基于 Uniswap V2 模型的 Swap。
- 保留现有 Factory、Router、Pair 和 SDK。
- 交易池由项目方或流动性提供方准备。
- Custos 不承诺为每个项目补充流动性。

### 3.2 Permissionless Launch

任何人都可以提交普通 Token 的基础资料：

- 名称、Symbol、Decimals、总供应量或供应说明。
- 创建者钱包。
- Logo/Metadata URI。
- Token 合约地址和 Pool 地址（如果已经部署）。
- 风险声明确认。

第一阶段的 permissionless 流程先完成资料登记、公开展示和 Swap 连接。没有经过审计和安全检查的 Token 必须显示为未验证资产。

### 3.3 Curated RWA Launch

只允许白名单或通过人工审核的项目进入精选 RWA 页面：

- 发行方。
- 资产类型。
- 托管方或服务方。
- 法律文件。
- 审计/评估文件。
- 资产证明 Hash。
- 发行辖区和限制地区。
- Token、Pool、Metadata 地址。
- 审核状态、审核时间和审核者。

第一阶段把它做成“登记、审核、展示和市场接入”基础设施，不做 Custos 自己的 RWA 发行和赎回。

### 3.4 Market

Market 是资产目录，不是新的交易引擎。它统一展示：

- Permissionless 社区 Token。
- Curated 精选项目。
- Curated RWA 资产。
- Token 地址、Pool 地址、网络和状态。
- 风险提示、审核信息和项目资料链接。
- 已有 Pool 的 Swap 入口。

第一阶段不再展示旧的 Pyth synthetic Spot 市场，不再把实时参考价包装成可赎回的 RWA 产品。

## 4. 两个 Launch 的边界

| 能力 | Permissionless Launch | Curated RWA Launch |
| --- | --- | --- |
| 谁可以提交 | 任意用户 | 白名单/审核通过的项目 |
| 默认状态 | Submitted / Listed | Review / Approved / Listed |
| 是否代表 RWA | 不代表 | 只展示项目提交的 RWA 资料和审核状态 |
| 是否有安全背书 | 无 | 仅有资料审核，不等同于投资建议 |
| 是否自动做市 | 否 | 否 |
| 流动性责任 | 创建者/项目方 | 项目方或明确的流动性合作方 |
| 第一阶段是否强制链上部署 | 否，支持先登记 | 否，审核通过后再接入合约 |

## 5. Robinhood 参考与限制

已核验的 Robinhood GitHub 公开组织没有 Launchpad 或 RWA Launchpad 合约。可以参考的不是某个“Robinhood 开源发射平台”，而是其官方链文档中的产品分层：

- 资产采用标准 ERC-20。
- 资产目录提供地址、元数据和状态。
- 交易可以接 AMM、RFQ 或其他流动性来源。
- 发行方、托管、价格源和应用入口分开。
- 资产可以被钱包、交易、借贷和其他应用组合使用。

不能照搬的部分：

- Robinhood 具有发行主体、托管机构、法律文件和合规体系。
- Robinhood Stock Token 有明确的底层发行和赎回关系。
- Custos 当前没有这些能力，不能把普通 Token 或项目资料描述成真实股票、黄金或收益凭证。

## 6. 明确不做

- Spot synthetic trading。
- Perpetuals、杠杆、清算和保证金。
- 借贷、收益金库、自动复投和指数篮子。
- Custos 自有资金做市、流动性补贴和价格托底。
- Custos 托管真实资产或承诺赎回。
- 自研复杂 Bonding Curve、拍卖、Referral 和激励系统。
- 自研 Token Factory、RWA Registry、Vesting 或 LP Lock 合约。
- 使用“已审核”暗示资产已被监管批准或保证收益。

## 7. Grant 目标

建议 grant 交付聚焦可验证的基础设施：

1. 在目标 L2 上可访问的 Swap。
2. 两个清晰隔离的 Launch 入口。
3. 可搜索的 Market 资产目录。
4. 至少一个精选 RWA 项目的完整资料页样板。
5. 标准资产元数据、风险披露、Token/Pool 地址展示。
6. 文档化的合约复用和安全边界。
7. 一套可重复的本地部署、演示和测试流程。

## 8. 成功标准

- 用户能从 Market 找到资产并进入 Swap。
- 普通 Token 提交不需要人工审核即可进入待展示状态，但明确标注“未验证”。
- RWA 项目必须经过审核状态流转后才进入精选列表。
- 页面不会再出现 Spot、Perps、Season 等不属于当前目标的入口。
- 没有新的自研复杂金融合约进入主线。
- 任何 RWA 项目都能看到发行方、文件、辖区、状态和风险提示。
