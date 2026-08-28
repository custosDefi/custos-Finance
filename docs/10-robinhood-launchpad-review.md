# Robinhood Chain 社区 Launchpad 补充核验

核验日期：2026-08-28。

## 结论先行

Robinhood 官方 GitHub 组织没有公开的 Token Launchpad 或 RWA Launchpad 合约。网上能找到的是 Robinhood Chain 生态参与者的社区项目；它们可以帮助我们理解“开放发币、即时交易、锁定流动性、事件索引”的产品形态，但不能仅凭公开仓库就作为 Custos 的生产依赖。

当前项目的目标链是 GIWA Sepolia（chain ID `91342`），而本次发现的社区 Launchpad 主要部署在 Robinhood Chain（chain ID `4663`）或其测试网（`46630`）。不同链上的部署地址不能互换。

## 核验来源

- [Robinhood GitHub 组织](https://github.com/Robinhood)
- [Robinhood Chain 官方文档](https://docs.robinhood.com/chain/)
- [PotatoPad](https://github.com/itsfriedpotato/potatopad)
- [PotatoPad 安全页](https://github.com/itsfriedpotato/potatopad/security)
- [Hashling contracts](https://github.com/hashlingxyz/hashling-contracts)
- [Hashling deployment record](https://github.com/hashlingxyz/hashling-contracts/blob/main/DEPLOYMENTS.md)
- [Hashling Factory V2 的 Blockscout 地址](https://robinhoodchain.blockscout.com/address/0xC73A79A974fD175927b6b87C86d57081c9d2F3C9)
- [Dazren protocol contracts](https://github.com/SYMBaiEX/dazren-protocol-contracts)
- [Zentral Core](https://github.com/zentralhood/zentral-core)
- [Hoodium Launchpad](https://github.com/Hoodium-HQ/hoodium_launchpad)

## 项目核对

### PotatoPad

PotatoPad 是最接近“任何人创建 Token，并从第一笔交易进入 Uniswap V3”的公开示例：

- `createToken` 创建固定供应量 Token。
- Launchpad 创建 Token/WETH 池，并把单边 LP NFT 交给不可提取的 Fee Locker。
- 通过事件把图像和社交资料交给前端索引。
- 允许附带一次性 creator buy。

但是它的 README 明确写着 `Demo software. Unaudited. Not production-ready`，GitHub Security 页面也显示没有安全策略；其许可还要求保留 `Made by proofofpotato.com` 归属。它适合作为流程和页面交互参考，不适合作为未经额外审查的生产合约依赖。

### Hashling Factory V2

Hashling 的仓库比普通 demo 更完整：

- MIT 许可。
- 提供 `HashlingFactoryV2`、Token、迁移器和永久 LP Locker 的源码、ABI 约束和测试。
- README/DEPLOYMENTS 提供 Robinhood Chain 4663 的 Factory、Migrator、Locker 地址。
- Robinhood Chain Blockscout 的地址数据将 Factory 标记为 `is_verified: true`，源码文件为 `src/HashlingFactoryV2.sol`。

仍然不能直接接入：

- 仓库的安全页显示没有 GitHub Security Policy；`SECURITY.md` 是项目自己的安全说明，不是独立审计报告。
- 它依赖 Robinhood Chain 的 Uniswap V3、WETH 和迁移器地址，不能作为 GIWA Sepolia 的地址或 ABI 配置。
- 其 bonding curve、graduation、refund、fee 和 LP lock 是一整套资金逻辑，不能只复制 Factory ABI 而忽略依赖和资金路径。

它是当前最值得继续阅读的参考实现，但不是已批准的 Custos 适配器。

### Dazren

Dazren 提供源码、Foundry 测试、Robinhood testnet `46630` 部署清单和内部安全/规模审查。仓库同时明确说明该审查不是独立审计；其公开的 One Dollar Audit 记录也被描述为 AI first-pass security audits，不能当作生产安全认证。因此不接入当前项目。

### Zentral Core

Zentral 提供 MIT 合约、Robinhood Chain 4663 的验证地址、V3/V4 Launch 和 LP 锁定逻辑。它能帮助我们比较 permissionless Launch 的资产和费用分层，但当前仓库没有足够的独立外部审计材料，且目标链不一致，不接入。

### Hoodium

Hoodium 的合约文档和内部 `AUDIT.md` 很完整，但文档明确写着外部审计尚未完成，并把这列为真实资金部署的硬门槛。它可作为审计清单和失败场景的参考，不能作为当前依赖。

## 适合 Custos 的可复用部分

可以参考以下产品层设计，不直接复制资金合约：

1. Permissionless Launch 使用标准 Token 元数据和事件索引。
2. Token 与交易池的地址、创建交易和状态分开记录。
3. Market 只读取已部署 Token/Pool，交易交给现有 Swap。
4. LP 锁定、费用、迁移和退款分别作为独立安全边界审查。
5. RWA Launch 只开放精选项目申请和审核，不把资料审核当成资产所有权证明。

## 接入门槛

未来要把当前“开放登记”升级为真实链上 Launch，外部协议必须提供并通过：

- 当前目标 L2 的明确部署地址和网络 ID。
- 与部署字节码一致的源码、ABI、编译器和优化参数。
- 明确许可证和第三方依赖许可证。
- 独立外部审计报告、修复提交和回归测试。
- 所有者、升级、暂停、费用、Token mint、LP 提取、退款和管理员权限说明。
- 目标链上的真实 canary 交易和可重复的只读验证脚本。
- 与 Custos Swap 的 Token/Pool/路由兼容性证明。

任何一项缺失，都保持 `CONTRACT_ADAPTER_CONFIGURED = False`，前端只提供提交、审核、登记和已有地址接入。
