# Launch 平台规格

## 1. Permissionless Launch

### 当前实现与目标形态

目标形态是用户通过钱包调用经过核验的外部 Token Factory，拿到 Token 地址和交易哈希，再由 Market 展示。当前目标 L2 尚未找到满足安全门槛的外部 Factory，因此第一阶段只开放资料登记和已有 Token/Pool 接入；不得把登记结果显示成 Token 已部署。

### 表单

- Token name
- Symbol
- Decimals
- Supply model
- Creator wallet
- Metadata URI
- Optional token address
- Optional pool address
- Risk acknowledgement

### 结果

返回：

- listing id
- channel
- status
- contract adapter status
- created time

第一阶段结果是“登记已创建”，不是“Token 已部署”。如果用户已有 Token/Pool，可以把地址附加到 listing；如果没有，必须等待后续合约适配器。

## 2. Curated RWA Launch

Curated RWA Launch 第一阶段是白名单/人工审核的项目资料入口，不自建 RWA 发行、托管、赎回或资产所有权证明合约。审核通过只改变展示状态，不产生链上资产。

### 必填资料

- Project/asset name
- Symbol
- Asset type
- Issuer
- Jurisdiction
- Custody provider
- Legal document URI
- Audit or assessment URI
- Proof hash
- Metadata URI
- Creator/contact wallet
- Risk acknowledgement

### 审核要求

- 项目方身份和发行主体可追溯。
- 文件可访问或可通过 Hash 校验。
- 资产类型、发行量、限制地区和赎回规则有明确说明。
- 页面明确列出“资料审核不等于法律或投资背书”。

## 3. 共同约束

- Symbol 必须规范化并唯一。
- URI 不能被 UI 当成官方证明。
- 未配置 Factory 时不显示链上部署按钮。
- 项目方负责初始流动性和后续流动性维护。
- 交易进入现有 Swap，而不是在 Launch 中复制一套交易逻辑。
