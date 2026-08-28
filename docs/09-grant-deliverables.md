# Grant 交付清单

## Demo 交付

- [x] L2 网络配置和部署说明。
- [x] 可用 Swap 页面。
- [x] Permissionless Launch 页面和提交 API。
- [x] Curated RWA Launch 页面和提交 API。
- [x] Market 资产目录和详情/Swap 入口。
- [x] 至少一个带完整字段的 RWA demo listing。
- [x] 合约复用研究和许可证/审计检查表。
- [x] 风险披露和“不提供托管/发行/投资建议”说明。
- [x] 本地一键运行脚本。
- [x] 前端、SDK、后端和 V2 合约测试记录。

## 已执行验证

```text
Frontend build: passed
SDK tests: 125 passed, 3 skipped
V2 contract tests: 2 passed
Asset Hub API smoke: passed
Python compile and shell/Node syntax checks: passed
Playwright UI checks: passed (Landing, Market, Permissionless Launch, Curated RWA Launch, Swap)
```

Playwright 页面验收已在本地 API、前端和钱包链环境启动后完成；页面无 console/page error 和失败请求。

## 建议指标

- Launch submission 数量。
- Curated RWA review/list 数量。
- Market listing 数量。
- 有效 Token/Pool 地址数量。
- Swap 成功交易数量。
- 页面访问和钱包连接数量。

这些指标只衡量产品使用和技术集成，不承诺交易量、收益、资产价值或投资回报。

## 后续路线

1. 由 L2/外部协议方提供可核验的 Token Factory/Claim/LP Lock/Sale 地址、ABI 和安全材料。
2. 建立安全、许可证和权限审查；通过后再新增适配器任务。
3. 为 RWA 项目接入真正的身份、审核和审计日志，可评估 GIWA Dojang/EAS 的只读证明能力。
4. 在有明确流动性和合规边界后，再评估更复杂的发行机制。
