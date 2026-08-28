# Market 资产市场规格

## 1. 目标

Market 是一个统一的资产发现页，让用户先理解资产，再决定是否进入 Swap。它不是实时行情终端，也不替代交易合约。

## 2. 分类

- All
- Community Tokens
- Curated Projects
- RWA

## 3. 卡片字段

- 名称和 Symbol。
- Channel/Category。
- Listing status。
- Verified/Unverified/Curated 标签。
- Issuer（如果有）。
- Jurisdiction（如果有）。
- Token/Pool 地址。
- 文档和 Metadata 链接。
- Swap 或 Details 操作。
- 风险提示。

## 4. 首阶段不显示

- Pyth synthetic price。
- Perps funding、杠杆、清算数据。
- 虚构 TVL、APR、交易量。
- 没有来源的 USD 估值。

## 5. 与 Swap 的关系

Market listing
  ├── tokenAddress exists + poolAddress exists → Open Swap
  └── otherwise → Show “Liquidity/contract pending”

项目方负责提供初始 Token 和 quote 流动性。Custos 只提供发现、资料和交易入口。
