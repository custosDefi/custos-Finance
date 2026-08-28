# Custos Swap contracts

本目录只保留 Custos Swap 所需的 Uniswap V2-compatible primitives：

- contracts/factory.sol
- contracts/router.sol
- contracts/muticall.sol
- contracts/MockERC20.sol（仅用于本地测试）

Launch、RWA 审核、Token Factory、Vesting 和 LP Lock 不在本目录自行实现。它们必须在后续确认成熟的外部实现、许可证、审计和目标 L2 部署后再接入。

## 本地流程

    npm install
    npm run deploy:local
    npm run verify:local

默认本地 RPC 是 http://127.0.0.1:7545，部署结果写入 deployments/local/main-contracts.json。

## 网络安全

本地部署脚本使用 Hardhat 测试账户和测试 Token。不要把本地私钥或测试部署用于真实网络。
