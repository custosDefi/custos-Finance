# Custos Launch & Market 文档

本目录是 Custos Finance 当前重构的产品、技术和执行基线。

## 阅读顺序

1. [产品方案](./01-product-proposal.md)
2. [任务拆解](./02-task-breakdown.md)
3. [合约复用研究](./03-contract-reuse-research.md)
4. [清理计划](./04-cleanup-plan.md)
5. [架构方案](./05-architecture.md)
6. [Launch 规格](./06-launchpad-spec.md)
7. [RWA 精选规格](./07-rwa-curation-spec.md)
8. [Market 规格](./08-market-spec.md)
9. [Grant 交付物](./09-grant-deliverables.md)
10. [Robinhood Chain 社区 Launchpad 补充核验](./10-robinhood-launchpad-review.md)

## 当前结论

Custos 的第一阶段只做：

- Swap：保留现有 V2 Swap 和底层 Factory/Router。
- Permissionless Launch：任何人都可以提交普通 Token 的发行/市场资料。
- Curated RWA Launch：项目可以申请进入精选流程，但只有经过人工审核并进入白名单的 RWA listing 才能公开展示。
- Market：统一展示已登记的社区 Token、精选项目和 RWA 资产，并提供 Swap 入口。

第一阶段不做 Spot、Perps、借贷、收益聚合、托管、法币出入金和 Custos 自己发行/担保真实 RWA。当前也没有批准任何外部 Token Factory，因此 Permissionless Launch 暂时是开放登记，不是链上铸币交易。
