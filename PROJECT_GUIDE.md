# Custos Finance 项目说明

## 1. 当前目标

Custos 为目标 L2 提供一套可演示的资产入口：

```text
项目资料 → Launch → Market → 项目方提供 Token/Pool → Swap
```

产品分为两个 Launch：

- `Launch`：permissionless 普通 Token 资料登记，显示为未验证社区资产。
- `RWA Launch`：精选 RWA 项目提交资料，进入白名单/人工审核流程。

`Market` 只负责资产发现、资料展示和状态说明；只有已有 Token 和 Pool 地址的 listing 才显示进入现有 Swap 的入口。

## 2. 仓库职责

### 2.1 `uniswapContract/`

- Hardhat V2-compatible Swap 工程。
- `contracts/factory.sol`、`router.sol`、`muticall.sol` 保留交易基础设施。
- `contracts/MockERC20.sol` 只用于本地测试。
- `scripts/deploy-local-uniswap.js` 部署本地合约。
- `scripts/verify-local-interactions.js` 执行本地 Swap 验证。

### 2.2 `v2-sdk/`

前端使用的 Swap SDK。部署后由 `scripts/sync-local-config.js` 回填 Factory、Init Code Hash、WETH 和 Router 相关配置。

### 2.3 `uniswap-interface/`

React 前端，主入口为：

- `/defi`：Swap
- `/defi/market`：Market
- `/defi/launch`：Permissionless Launch
- `/defi/rwa-launch`：Curated RWA Launch

Pool、Add、Remove 和 Find 页面作为 V2 维护入口保留，但不属于主产品叙事。

### 2.4 `backend/`

FastAPI Custos Asset Hub API。SQLite 只保存 listing 元数据、审核状态和 Token/Pool/文件引用，不保存私钥，不代签名，不托管资金，不执行铸币或交易结算。

默认 API：`http://127.0.0.1:8001`

关键接口：

- `GET /api/health`
- `GET /api/config`
- `GET /api/overview`
- `GET /api/assets`
- `POST /api/launch/permissionless`
- `POST /api/launch/curated-rwa`
- `POST /api/assets/{id}/chain`（需要 `X-Admin-Key`）
- `POST /api/assets/{id}/review`（需要 `X-Admin-Key`）

### 2.5 `docs/`

从 [`docs/README.md`](docs/README.md) 开始阅读产品方案、任务拆解、合约复用研究、清理计划和 Grant 交付清单。

## 3. 本地完整流程

```bash
./scripts/run-local-full.sh
```

流程包括：

1. 应用品牌配置。
2. 启动或复用 `127.0.0.1:7545` Hardhat 节点。
3. 部署 V2 Factory、Router、WETH、Multicall 和测试 Token。
4. 同步 SDK、前端地址和 TokenList。
5. 构建 SDK。
6. 执行链上加流动性与 Swap 验证。
7. 启动 Asset Hub API 和前端。

API 本地数据库默认为 `backend/custos_asset_hub.db`。数据库和 `.env` 都被 Git 忽略；部署环境请显式设置 `DATABASE_PATH`。

## 4. 网络配置

本地开发网络：

- RPC：`http://127.0.0.1:7545`
- Chain ID：`47805`
- 前端变量：`VITE_CHAIN_ID`、`VITE_NETWORK_URL`

生产/测试网部署使用通用变量：

- API：`CHAIN_ID`、`NETWORK_NAME`、`RPC_URL`、`EXPLORER_URL`
- 前端：`VITE_CHAIN_ID`、`VITE_NETWORK_URL`

不要把本地 Hardhat 私钥用于真实网络，也不要提交任何 `.env`、数据库或部署密钥。

## 5. 验收命令

```bash
npm run build --prefix uniswap-interface
npm test --prefix v2-sdk
npm test --prefix uniswapContract
python -m py_compile backend/main.py
```
