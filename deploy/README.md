# Custos Finance 部署

部署由两个服务组成：

- `custos-api`：FastAPI Custos Asset Hub 元数据 API。
- `custos-web`：包含 Swap、Market 和两个 Launch 入口的静态前端。

API 不再提供 Spot、Perps、Pyth 行情流或旧 RWA Exchange 接口。它只保存 listing 元数据、审核状态和链上地址引用。

## Cloud Run

脚本使用当前 gcloud project，默认区域为 `asia-east2`：

```bash
gcloud config set project YOUR_PROJECT_ID
./deploy/cloudrun.sh
```

可通过环境变量配置目标 L2：

```bash
CHAIN_ID=91342 \
NETWORK_NAME="Target L2 Testnet" \
RPC_URL="https://example-rpc" \
EXPLORER_URL="https://example-explorer" \
./deploy/cloudrun.sh
```

Cloud Run 的默认数据库路径为 `/tmp/custos_asset_hub.db`，实例重启会丢失演示数据。正式环境应切换到持久化数据库，并为审核接口设置独立的 `ADMIN_REVIEW_KEY`，通过 Secret Manager 注入，不要写进脚本。

## VM Compose

复制并设置所需变量后运行：

```bash
docker compose -f deploy/compose.vm.yaml up -d --build
```

Compose 使用 `/data/custos_asset_hub.db`，并通过 `FRONTEND_ORIGIN`、`CHAIN_ID`、`RPC_URL` 等通用变量配置 API 和前端。
