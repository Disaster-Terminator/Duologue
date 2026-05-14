# 开发说明

本项目是一个 Microsoft Edge 扩展，用来在两个 ChatGPT 标签页之间中继消息。开发时编辑 `src/extension/` 下的源码；提交的扩展产物由构建流程生成到 `dist/extension/`。

## 核心命令

```bash
pnpm run build
pnpm run typecheck
pnpm test
pnpm run check
```

`pnpm run check` 是本地提交前的默认质量门：依次执行类型检查、单元测试、扩展构建，并确认 `dist/extension` 与源码构建结果一致。CI 使用同一套语义；如果只想检查已构建产物是否忘记提交，运行：

```bash
pnpm run verify:dist
```

## 调试日志服务器

手动 relay 或 e2e 调试前，先启动本地运行时日志接收服务：

```bash
pnpm run debug:log-server
```

默认配置：

- 事件入口：`http://127.0.0.1:17761/events`
- 健康检查：`http://127.0.0.1:17761/health`
- 日志文件：`tmp/bridge-debug/events.jsonl`
- 轮转策略：5 MB，保留 3 个备份

PowerShell 覆盖示例：

```powershell
$env:BRIDGE_DEBUG_PORT = "17762"; pnpm run debug:log-server
$env:BRIDGE_DEBUG_LOG = "tmp/bridge-debug/manual-run.jsonl"; pnpm run debug:log-server
$env:BRIDGE_DEBUG_LOG_MAX_BYTES = "10485760"; $env:BRIDGE_DEBUG_LOG_MAX_BACKUPS = "5"; pnpm run debug:log-server
```

POSIX shell 覆盖示例：

```bash
BRIDGE_DEBUG_PORT=17762 pnpm run debug:log-server
BRIDGE_DEBUG_LOG=tmp/bridge-debug/manual-run.jsonl pnpm run debug:log-server
BRIDGE_DEBUG_LOG_MAX_BYTES=10485760 BRIDGE_DEBUG_LOG_MAX_BACKUPS=5 pnpm run debug:log-server
```

复现 relay 问题时保持服务器运行。扩展在本地日志服务器可用时会把运行时事件写入 JSONL，这个文件是 agent 侧排查卡顿、误停、超时和状态不同步问题的主要证据。

## 浏览器测试说明

真实 ChatGPT 手动测试仍然是当前更可靠的验收路径。OpenAI 登录态、Cloudflare 挑战和浏览器风控会让完整自动化不稳定。测试分层见 `docs/testing.md`，认证载体说明见 `docs/auth.md`。
