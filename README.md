# Custos Finance

Custos Finance 是面向 L2 生态的轻资产产品，当前主线由四个表面组成：

- `Swap`：基于 Uniswap V2-compatible Factory、Router、Pair 和 SDK 的现货兑换。
- `Launch`：任何人都可以提交普通 Token 的资料登记。
- `RWA Launch`：精选 RWA 项目的白名单/人工审核入口。
- `Market`：统一展示社区 Token、精选项目和 RWA 资产，并在 Token 与 Pool 均已提供时进入 Swap。

Custos 不自建复杂 Launchpad、Bonding Curve、Vesting、LP Lock、RWA Registry、托管或做市系统。Launch 第一阶段只保存项目资料和已有链上地址，不代表 Custos 铸币、审计、托管或保证流动性。

## 仓库结构

- `uniswapContract/`：V2-compatible Swap 合约、本地部署和交互测试
- `v2-sdk/`：前端使用的 Swap SDK
- `uniswap-interface/`：Swap、Market 和两个 Launch 页面
- `backend/`：Custos Asset Hub 元数据 API
- `tokenlist/`：本地 TokenList 与图标资源
- `docs/`：产品方案、任务拆解、架构和 Grant 交付文档
- `deploy/`：Cloud Run 与 VM 部署文件
- `scripts/`：本地部署、地址同步和品牌脚本

## 本地启动

在仓库根目录执行：

```bash
./scripts/run-local-full.sh
```

脚本会启动本地 Hardhat 节点，部署 V2 Factory/Router/WETH/测试 Token，回填 SDK 和前端地址，执行 Swap 验证，并启动：

- Asset Hub API：`http://127.0.0.1:8001`
- 前端：`http://127.0.0.1:3001`

常用参数：

```bash
./scripts/run-local-full.sh --skip-install
./scripts/run-local-full.sh --no-start-frontend
./scripts/run-local-full.sh --no-start-backend
```

首次启动 API 前，如本地虚拟环境不存在：

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

## 验证

```bash
npm run build --prefix uniswap-interface
npm test --prefix v2-sdk
npm test --prefix uniswapContract
python -m py_compile backend/main.py
```

更完整的边界和后续合约复用要求见 [`docs/README.md`](docs/README.md)。
