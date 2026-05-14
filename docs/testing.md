# 测试分层

本项目的真实验收对象是 ChatGPT Web 页面，因此测试分为两类：本地可稳定执行的质量门，以及依赖登录态/风控状态的真实浏览器验收。不要把登录态偶发失败等同于核心桥接逻辑失败；先看具体通道、日志和页面证据。

## 本地质量门

提交前默认运行：

```bash
pnpm run check
```

这条命令会依次执行：

1. `pnpm run typecheck`
2. `pnpm test`
3. `pnpm run build`
4. `pnpm run verify:dist`

`verify:dist` 会检查 `dist/extension` 是否与源码构建结果一致。当前策略是提交源码和 `dist/extension`，CI 也会检查两者同步，并上传扩展目录和 zip 作为构建产物。

## 调试日志

手动测试、半自动测试和 e2e 前，建议保持日志服务器运行：

```bash
pnpm run debug:log-server
```

默认日志写入 `tmp/bridge-debug/events.jsonl`。出现卡住、误停、超时、焦点切换异常时，优先读这个 JSONL，而不是只看 popup 当前状态。

## CloakBrowser 真实 e2e

当普通 Chrome / Edge profile 触发 ChatGPT / Cloudflare 风控时，优先使用 CloakBrowser 通道。第一次登录由人工在终端启动：

```bash
pnpm run auth:bootstrap-cloak
```

登录完成并回车后，脚本会关闭并重开同一 profile，验证登录态是否持久。

后续基础 smoke：

```bash
pnpm run test:cloak-smoke
```

这条 smoke 只证明三件事：

1. ChatGPT 登录态有效
2. 扩展已加载
3. 页面可被脚本控制

完整 happy-path e2e 使用同一个持久 profile：

```powershell
$env:CHATGPT_BROWSER_CARRIER = "cloakbrowser"
$env:CLOAKBROWSER_PROFILE_DIR = "G:\chatgpt-tab-bridge\tmp\cloakbrowser-auth-profile"
pnpm run test:e2e -- --root-only --scenario happy-path
```

不要并行运行多个使用同一 `CLOAKBROWSER_PROFILE_DIR` 的测试；Chromium 持久 profile 只能被一个浏览器实例稳定持有。

CloakBrowser 通道使用它自己的 Playwright wrapper，不要把它的 `chrome.exe` 传给 `BROWSER_EXECUTABLE_PATH`。它使用独立持久 profile：优先读取 `CLOAKBROWSER_PROFILE_DIR`，否则落到 `~/.chatgpt-cloakbrowser-profile`；`CLOAKBROWSER_FINGERPRINT_SEED` 用来保持稳定的回访浏览器身份。

浏览器窗口默认使用 `1280x800` 逻辑像素，并在启动后通过 CDP 强制覆盖持久 profile 保存的窗口位置。高 DPI 屏幕上物理像素会按系统缩放放大。需要调整时设置：

```powershell
$env:CHATGPT_BROWSER_VIEWPORT = "1200x760"
$env:CHATGPT_BROWSER_WINDOW_POSITION = "80,80"
```

## Playwright 持久 profile smoke

默认基础 smoke 仍保留 Playwright 持久 profile 通道：

```bash
pnpm run auth:bootstrap-profile
pnpm run test:smoke
```

`auth:bootstrap-profile` 是一次性人工登录入口。`test:smoke` 与 Cloak smoke 一样，只验证登录、扩展加载和页面可控，不验证桥接业务。

## CDP attach 备用通道

如果需要复用人工启动的真实浏览器，可用 CDP attach：

```bash
pnpm run browser:cdp-launch
CHATGPT_CDP_ENDPOINT=http://127.0.0.1:9333 pnpm run test:cdp-smoke
```

这个通道是备用诊断路径，不是默认 e2e 载体。它同样必须先满足“已登录、扩展已加载、页面可控”三项基础事实。

## Storage replay 诊断通道

Storage replay 只用于诊断，不再作为默认认证基线：

```bash
pnpm run auth:export
pnpm run auth:verify
pnpm run test:storage-auth-smoke
```

结果解释：

- `PASS`：导出的 storage 在该诊断通道中碰巧可用
- `FAIL`：有诊断意义，但不能单独否定持久 profile 或 CloakBrowser 通道

## 业务通道

`real-hop`、`semi` 和 `e2e` 都是业务层测试，不负责判断认证载体是否成立。运行它们之前，先让对应 smoke 通过。

目前可自动化证明的主路径是 CloakBrowser happy-path e2e。暂停/恢复、起点切换、空线程边界、长轮次后台运行仍以人工真实浏览器测试为主；当某个问题可以稳定复现，再把它收敛成自动化用例。
