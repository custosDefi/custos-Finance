# Custos Launch & Market 架构

## 1. 分层

Landing
  └── Workspace
      ├── Swap              → existing V2 contracts + SDK
      ├── Market            → Asset Hub API + token/pool links
      ├── Launch            → permissionless submission
      └── RWA Launch        → curated submission + review state

Asset Hub API
  ├── metadata registry
  ├── submission status
  ├── curated listing
  └── chain attachment references

Chain
  └── existing Swap primitives

## 2. 数据责任

后端保存：

- 项目资料和资产元数据。
- 审核状态。
- Token、Pool、Metadata、文件 Hash 等引用。
- 提交时间和更新时间。

钱包/合约保存：

- 真实 Token 余额。
- Swap 交易。
- 已部署合约的实际状态。

后端不保存私钥，不代用户签名，不托管资产，不根据数据库余额结算交易。

## 3. 核心对象

### Asset Listing

- id
- channel：permissionless 或 curated_rwa
- name
- symbol
- assetType
- issuer
- creatorWallet
- jurisdiction
- custodyProvider
- documentUri
- auditUri
- proofHash
- metadataUri
- tokenAddress
- poolAddress
- status
- featured
- riskNote

### Status

submitted → review → approved → listed
                    └→ rejected
listed → paused

Permissionless 默认可以 submitted → listed，但页面必须保留“未验证”标识。Curated RWA 必须经过 review → approved → listed。

## 4. 错误和降级

- API 不可用：Market 显示错误状态，不显示伪造价格。
- 合约适配器未配置：Launch 显示“仅登记”，不显示“部署成功”。
- Token 地址缺失：Market 只显示资料，不显示 Swap 入口。
- Pool 地址缺失：Market 标注“流动性由项目方准备”。
