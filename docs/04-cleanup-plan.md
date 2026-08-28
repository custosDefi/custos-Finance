# 第一阶段清理计划

状态：已执行（2026-08-28）

## 保留

- [x] uniswap-interface/src/pages/Swap
- [x] v2-sdk
- [x] uniswapContract/contracts/factory.sol
- [x] uniswapContract/contracts/router.sol
- [x] uniswapContract/contracts/muticall.sol
- [x] uniswapContract/contracts/MockERC20.sol
- [x] Swap 需要的通用钱包、Token、Multicall、交易状态和 SDK 代码
- [x] uniswapContract/scripts/deploy-local-uniswap.js
- [x] uniswapContract/scripts/verify-local-interactions.js

## 从产品主线移除

### 前端

- [x] src/custos/SpotPages.tsx
- [x] src/custos/CustosPerpTerminal.tsx
- [x] src/custos/PublicBetaPage.tsx
- [x] src/custos/useMarketStream.ts
- [x] src/custos/spotContracts.ts
- [x] src/custos/perpContracts.ts
- [x] src/custos/spot.generated.json
- [x] src/custos/deployment.generated.json
- [x] src/custos/perpTerminal.css
- [x] 旧的 Spot、Perps、Season、synthetic market 文案和路由
- [x] 未被新产品引用的旧静态资源（旧 market SVG、market board 和重复 logo）
- [x] 依赖已废弃 Rinkeby RPC、旧路由和硬编码测试私钥的 Cypress 遗留测试

### 后端

- [x] backend/real_market.py
- [x] backend/perp_market.py
- [x] backend/public_beta.py
- [x] backend/beta-contracts.generated.json
- [x] backend/beta-contracts.DEPLOYED.backup.json
- [x] Pyth synthetic quote、Perp websocket、Season points API

### 合约遗留

- [x] uniswapContract/scripts/ConfigurableRightsPool/
- [x] uniswapContract/test/ConfigurableRightsPool/
- [x] uniswapContract/scripts/deploy-desyn.js
- [x] 与 Desyn 部署、CRP、DSProxy 和旧实验流程绑定的脚本
- [x] 旧的 Desyn 项目 README、包名和仓库描述

## 不在本次删除

- [x] Pool、AddLiquidity、RemoveLiquidity 等 V2 页面暂时保留为维护入口，但不出现在新产品主导航；如果确认项目方完全通过外部流程提供流动性，再在下一次清理中删除。
- [x] 本地部署产物和忽略目录不进入 Git；不使用破坏性命令删除用户工作区数据。
- [x] 旧数据库文件属于本地运行数据，不提交到仓库。

## 清理后检查

    rg -n "Spot|Perp|Season|ConfigurableRightsPool|desyn|public_beta|real_market|perp_market" backend uniswap-interface/src uniswapContract --glob '!**/node_modules/**'
    npm run build --prefix uniswap-interface
    npm test --prefix v2-sdk

允许文档中保留历史说明和“不再支持”的记录；活动代码和主导航不应再依赖这些模块。
