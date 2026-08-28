# Custos Finance Interface

Custos Finance 的 React + Vite 前端，使用仓库内的 `custoswap-sdk` 和 V2-compatible Swap 合约。

## 页面

- `/defi`：Swap
- `/defi/market`：社区 Token、精选项目和 RWA 资产目录
- `/defi/launch`：任何人提交普通 Token 资料
- `/defi/rwa-launch`：精选 RWA 项目提交资料并等待审核

Launch 页面第一阶段只创建资料 listing，不自动铸币、不提供流动性，也不代表审计、托管或投资建议。

## 开发

```bash
npm install --legacy-peer-deps
npm run dev
```

默认访问：`http://127.0.0.1:3001`。

环境变量位于 `.env`：

```text
VITE_CHAIN_ID=47805
VITE_NETWORK_URL=http://127.0.0.1:7545
VITE_API_BASE=http://127.0.0.1:8001
```

仓库根目录的一键脚本会在本地部署合约后同步地址和 TokenList：

```bash
cd ..
./scripts/run-local-full.sh
```

## 验证

```bash
npm run build
npm test
npm run lint
```
