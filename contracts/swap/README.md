# Custos Swap Contracts

这是 Custos Finance 的 Hardhat 合约工作区，保留原有的 Uniswap V2-compatible Swap
原语、CRP/ConfigurableRightsPool、部署脚本和测试脚本。Spot、Perps 与 Real Market
测试环境的页面和 API 配置位于仓库的 `apps/web/` 与 `apps/api/`。

## 本地开发

```bash
npm install --legacy-peer-deps
npx hardhat deploy --network local --tags main
npx hardhat test --network local
npx hardhat run --network local scripts/verify-local-interactions.js
```

默认本地 RPC 是 `http://127.0.0.1:7545`，部署结果写入
`deployments/local/main-contracts.json`。

## 安全说明

本地部署脚本使用 Hardhat 测试账户和测试 Token。不要把本地私钥或测试部署用于真实网络。
