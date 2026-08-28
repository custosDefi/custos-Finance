# Custos 重构任务拆解

状态：第一阶段代码、本地验收和目标 L2 合约盘点完成；暂无满足安全门槛的外部 Launchpad 可接入
原则：先清理，再补产品骨架；合约复用先于合约开发。

## T0：产品和边界

- [x] 固化产品方案。
- [x] 固化“不做清单”。
- [x] 记录 Robinhood 官方开源核验结果。
- [x] 定义两个 Launch 和 Market 的数据边界。

## T1：清理旧功能

- [x] 从前端主路由移除 Spot、Perps、Season、旧 Transparency。
- [x] 删除旧 Spot 页面、Perps Terminal、旧 beta 页面和专用 ABI/部署文件。
- [x] 从后端移除 Pyth synthetic market、Perp websocket 和 Season 积分 API。
- [x] 删除 Desyn/ConfigurableRightsPool 遗留脚本和测试。
- [x] 删除 Desyn 部署 README、包名和仓库描述。
- [x] 保留 V2 Swap、SDK、Factory、Router、Multicall 和本地 Swap 验证脚本。

验收：

- 活动代码不再引用 Spot、Perps、Season、Desyn。
- 前端 TypeScript 构建通过。
- Swap 页面和本地 Swap 验证仍然可用。

## T2：后端资产目录

- [x] 将 API 名称改为 Custos Asset Hub API。
- [x] 保留 SQLite 作为本地演示存储。
- [x] 建立 listings 的最小字段模型。
- [x] 增加 permissionless submission API。
- [x] 增加 curated RWA submission API。
- [x] 增加 Market 查询 API。
- [x] API 只保存元数据和链上地址，不执行铸币、不托管资金。

验收：

- 后端可以启动。
- 空数据库会生成安全的 demo listing。
- 两个 Launch 表单可以提交并返回状态。
- API 返回的数据可直接被 Market 页面展示。

## T3：前端产品骨架

- [x] 主导航只保留 Swap、Market、Launch、RWA Launch。
- [x] 增加 Permissionless Launch 表单。
- [x] 增加 Curated RWA Launch 表单。
- [x] 增加统一 Market 页面。
- [x] 所有不具备合约适配器的按钮显示明确状态，不伪造交易成功。
- [x] 更新 Landing 页面，移除 Spot、Perps、Season 文案。

验收：

- 用户可以无钱包浏览 Market。
- 提交表单前会显示风险和“仅登记、不会自动铸币”的说明。
- 页面在 API 不可用时仍有清晰的空状态/错误状态。

## T4：合约复用适配

- [x] 盘点目标 L2 上现有的 Token Factory、Vesting、LP Lock 和 Sale 合约；GIWA 官方清单未发现可用的通用发行组件。
- [x] 核对候选的许可证、审计报告、部署地址、Solidity 版本和升级权限；当前没有满足条件的外部 Launchpad 候选，因此没有合约可以批准接入。
- [x] 形成“不接入未知合约”的适配决策；后续只有在外部协议提供可核验部署地址、ABI、许可证和安全材料后，才新增适配任务。
- [x] 未完成审计和适配前，Launch 只做提交/登记，不开放链上部署按钮。
- [x] 任何 RWA Registry 只保存引用和 Hash，不证明现实资产所有权。

验收：

- 复用来源和版本可以在文档中追溯；本阶段明确记录了没有可批准的外部 Launchpad。
- 没有复制未经验证的网上 Launchpad 合约。
- 前端不会把“登记成功”显示成“Token 已发行”。

## T5：测试和 Grant 交付

- [x] 前端 build。
- [x] SDK test/typecheck。
- [x] V2 合约 test 和本地交互验证。
- [x] 后端 import/health/API smoke test。
- [x] Playwright 验证 Swap、Market、两个 Launch 的页面渲染。
- [x] 更新 README、部署说明和 Grant 交付清单。

## Definition of Done

一项任务只有在代码、文档和验证结果同时完成时才算完成。任何 demo、待适配、未验证状态都必须在 UI 和 API 中显式表达。当前“Permissionless Launch”是开放登记入口，不宣称已经实现独立 Token 的链上铸造；真正发币必须等待外部成熟 Factory 的核验和接入。
