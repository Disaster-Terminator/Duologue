# 认证载体历史记录

> 当前测试事实源是 `docs/testing.md`。本文件只保留认证与登录态方案的历史判断，避免后续再次走回已经验证过的弯路。

## 当前结论

ChatGPT Web 的登录态、Cloudflare 风控和浏览器指纹策略会影响自动化稳定性。仓库当前不再把导出的 `storageState` 当作默认认证基线。

当前优先级：

1. CloakBrowser 持久 profile：当前可用于 smoke 和 happy-path e2e。
2. Playwright 持久 profile：保留为基础 smoke 通道。
3. CDP attach：备用诊断通道。
4. Storage replay：仅诊断，不作为主路径。

具体命令、前置条件和解释以 `docs/testing.md` 为准。

## 已降级的路线

### Storage replay

这些命令仍然有诊断价值：

```bash
pnpm run auth:export
pnpm run auth:verify
pnpm run test:storage-auth-smoke
CHATGPT_CDP_ENDPOINT=http://127.0.0.1:9333 pnpm run auth:export:cdp-storage
```

但它们只回答“导出的 cookie / origin / session 材料在某个诊断上下文里是否可用”，不能证明真实 ChatGPT Web e2e 载体可靠。

保留原因：

- 对比持久 profile 与导出状态时仍有用。
- 可以解释某次登录态丢失是 cookie、sessionStorage、origin 权限还是页面风控问题。
- 作为历史失败路线留档，避免误把 replay 当成默认方案。

### 旧 auth-backed 业务脚本

这些脚本仍在 `package.json` 中保留，主要用于兼容和调查：

```bash
pnpm run auth:export:legacy
pnpm run test:real-hop:auth
pnpm run test:semi:auth
pnpm run test:e2e:auth
```

它们不是当前推荐的验收入口。运行前先确认 `docs/testing.md` 中的基础 smoke 已通过。

## Playwright 相关历史约束

早期调查中，`storageState` 与 persistent context / extension loading 的组合不适合作为本项目主路径。相关外部限制包括：

- persistent context 不能可靠地从 `storageState` 初始化完整浏览器登录态。
- extension loading 与 storage replay 组合后，不能代表真实用户 profile 的行为。
- ChatGPT Web 对 replay 出来的状态更容易出现恢复失败、挑战或半登录态。

因此，当前文档把持久 profile 和真实浏览器载体放在前面，把 storage replay 保留为诊断工具。
