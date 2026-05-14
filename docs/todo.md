# 当前 Backlog

本文件只记录仍然需要推进的工作。已经完成的调试结论、历史失败路线和旧状态不要继续堆在这里；测试事实写入 `docs/testing.md`，开发/门控事实写入 `docs/development.md`，认证历史写入 `docs/auth.md`。

## P0：保留诊断能力

- 继续把 `pnpm run debug:log-server` 作为真实浏览器调试的首选日志入口。
- 遇到误停、超时、后台不推进或目标页状态异常时，先收集 `tmp/bridge-debug/events.jsonl` 和 popup debug snapshot，再改 relay 语义。
- 新增 relay 修复前，优先证明卡点发生在发送确认、回复等待、状态迁移还是 stop guard。

## P1：文档与发布治理

- README 中文为事实源，`README.en.md` 作为英文镜像引用；英文内容只跟随中文更新。
- 保持 `docs/testing.md` 为测试/e2e/认证载体事实源。
- 保持 `docs/development.md` 为 Node、pnpm、hooks、CI、构建产物策略事实源。
- `docs/auth.md` 只保留历史认证路线和已降级方案，不作为当前测试入口。
- 根目录不再保留会话交接/实验 Markdown；历史记录统一进入 `docs/archive/`。
- `.sisyphus/` 属于本地运行态/历史代理状态，不再作为仓库跟踪内容。
- 发布说明继续明确：推荐下载 GitHub Actions artifact；源码构建时加载 `dist/extension`；`dist/extension` 是提交产物。

## P2：Relay 稳定性

- 对仍可能出现的 false stop / stuck verification 继续做日志驱动诊断，不凭 popup 当前状态猜测。
- 重点区分：
  - dispatch 已 accepted，但 verification 采样来自陈旧 DOM。
  - verification 已 passed，但 relay loop 没有进入 waiting reply。
  - 页面仍在生成，但插件因 timeout、stale target、max rounds 或 guard 停止。
- 暂停/恢复、起点切换、空线程边界继续以人工真实浏览器验证为准；能稳定复现后再收敛为自动化用例。

## P3：前端产品打磨

- popup 宽度和密度继续收紧，但不要牺牲调试可读性。
- 保持全站 ambient overlay 默认关闭；优先考虑 extension action badge / popup 作为低侵入状态入口。
- 修复低风险 UI 欠账：
  - popup 静态文案 i18n 缺口。
  - 旧兼容按钮死代码。
  - `focus-visible` 和 `prefers-reduced-motion`。
  - overlay `max-height` / `overflow-y` 防护。
  - popup 响应式宽度。
- 上述 UI 改动完成后，需要真实浏览器手测 popup、ChatGPT 页内 overlay 和 ambient overlay。

## P4：测试噪音

- Node 24 下仍有 `MODULE_TYPELESS_PACKAGE_JSON` warning。后续单独调查是否可以安全加 `"type": "module"`，或调整测试导入方式。
- 不要为了消 warning 破坏当前扩展构建和 Node test runner 兼容性。
