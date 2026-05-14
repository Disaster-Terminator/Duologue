# Duologue

<p>
  <a href="./README.en.md">English</a>
</p>

<p>
  <img alt="platform Chromium Extension" src="https://img.shields.io/badge/platform-Chromium%20Extension-4285F4">
  <img alt="manifest MV3" src="https://img.shields.io/badge/manifest-MV3-5f6368">
  <img alt="language TypeScript" src="https://img.shields.io/badge/language-TypeScript-3178C6">
  <img alt="runtime Node.js" src="https://img.shields.io/badge/runtime-Node.js-339933">
  <img alt="package manager pnpm" src="https://img.shields.io/badge/package%20manager-pnpm-F69220">
  <img alt="browser automation Playwright" src="https://img.shields.io/badge/browser%20automation-Playwright-2EAD33">
</p>

Duologue 是一个面向 ChatGPT Web 的双会话对话编排扩展。

它可以将两个已经打开的 ChatGPT 页面绑定为一组受控通道，在两端之间读取回复、构造接力消息并推进下一轮对话。它适合用于双模型讨论、代理协作实验、提示词对抗验证和 ChatGPT Web 工作流原型。

---

## 核心能力

- 将两个 ChatGPT 页面绑定为 `A / B`
- 选择 `A` 或 `B` 作为起始侧
- 读取一侧最新的 assistant 回复
- 生成 relay payload 并发送到另一侧
- 等待目标侧回复后反向继续
- 支持 `Start / Pause / Resume / Stop / Clear`
- 提供页内悬浮窗作为主控制面
- 提供 popup 用于全局状态、设置和调试入口

一句话：**Duologue 将两个 ChatGPT 页面编排为一组可控的双端对话通道。**

---

## 适合场景

Duologue 更适合会主动调试工作流的用户，而不是普通商店扩展用户。

适合：

- 双 ChatGPT 会话接力
- agent-to-agent relay 原型
- 双模型讨论和互评
- 提示词对抗与输出验证
- 基于 ChatGPT Web 的自动化工作流实验

暂不适合：

- 一键安装、即装即用的商店扩展
- 长时间无人值守的高可靠自动化
- 对稳定性、兼容性有生产级要求的场景

---

## 页面支持

优先支持以下 ChatGPT 页面：

```text
https://chatgpt.com/c/<conversation-id>
https://chatgpt.com/g/<project-id>/c/<conversation-id>
```

当前实现也可以处理部分尚未形成持久线程 URL 的 live session。首次使用时，建议先让两个页面各自完成至少一轮正常对话，再进行绑定和 relay，这样更稳定。

---

## 快速开始

### 1. 获取扩展产物

推荐优先使用 GitHub Actions 产物：

- `chatgpt-tab-bridge-extension`：可直接加载的 `dist/extension` 目录
- `chatgpt-tab-bridge-extension-zip`：同一目录的 zip 包

如果你从源码构建，则继续执行下面的步骤。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 构建扩展

```bash
pnpm run build
```

构建产物会输出到并提交在：

```text
dist/extension
```

`dist/extension` 是当前仓库的扩展发布目录，不是可以随意忽略的临时构建缓存。CI 会检查源码构建结果与这个目录一致。

### 4. 加载到浏览器

当前推荐使用 Microsoft Edge 或其他 Chromium 系浏览器，以“已解压扩展”的方式加载。

以 Edge 为例：

1. 打开 `edge://extensions`
2. 开启“开发人员模式”
3. 点击“加载已解压的扩展”
4. 选择 `dist/extension`

### 5. 打开并绑定两个 ChatGPT 页面

手动打开两个要参与 relay 的 ChatGPT 页面，然后通过页内悬浮窗分别绑定为：

- `A`
- `B`

建议两个页面不要指向同一个线程，并确保页面处于可输入、可发送的状态。

### 6. 启动 relay

选择 `A` 或 `B` 作为 starter，然后点击 `Start`。

Duologue 会按下面的循环推进：

1. 读取起始侧最新 assistant 回复
2. 生成 relay payload
3. 发送给目标侧
4. 等待目标侧回复完成
5. 反向继续下一轮

---

## 交互入口

### 页内悬浮窗

悬浮窗是主要操作面，适合日常使用。

可以完成：

- 绑定当前页为 `A` 或 `B`
- 选择 starter
- 控制 `Start / Pause / Resume / Stop / Clear`
- 查看 phase、round、next hop、step、last issue
- 拖动、折叠和恢复悬浮窗

### Popup

Popup 更偏向全局总览、设置和调试。

可以完成：

- 查看全局 relay 状态
- 查看当前绑定
- 切换语言
- 控制悬浮窗启用、默认展开和位置重置
- 查看低频调试信息

---

## 运行状态

运行时通常会看到这些状态：

- `ready`
- `running`
- `paused`
- `stopped`
- `error`

以及类似这样的步骤提示：

- `reading A`
- `sending A -> B`
- `waiting B reply`

这些状态用于定位 relay 当前卡在哪一步，避免只看到“扩展没反应”。

---

## 开发命令

```bash
pnpm run build
pnpm run typecheck
pnpm test
pnpm run check
```

开发和 CI 使用 Node.js 24 与 pnpm 10.33.2。`pnpm run check` 是本地提交前的默认质量门，会执行类型检查、单元测试、扩展构建和 `dist/extension` 一致性检查。

本地调试运行时行为时，先启动日志服务器：

```bash
pnpm run debug:log-server
```

默认监听 `http://127.0.0.1:17761/events`，健康检查为 `http://127.0.0.1:17761/health`，日志写入 `tmp/bridge-debug/events.jsonl`。

常用浏览器联调命令：

```bash
pnpm run test:smoke
pnpm run test:real-hop
pnpm run test:semi
pnpm run test:e2e
```

更多开发说明见 `docs/development.md`，测试分层和登录态载体说明见 `docs/testing.md`。旧的认证实验记录见 `docs/auth.md`，不作为当前测试事实源。

---

## 权限与隐私

Duologue 的核心权限围绕浏览器扩展和 ChatGPT 页面交互：

- `storage`
- `tabs`
- `https://chatgpt.com/*`

它会在你明确绑定的 ChatGPT 页面中读取消息、写入输入框并触发发送。请不要把它用于你不愿意让扩展脚本参与处理的敏感会话。

Duologue 的目标是让 relay 行为可见、可暂停、可停止，而不是隐藏页面上的读写操作。

---

## 当前边界

### 依赖 ChatGPT Web 页面结构

Duologue 通过内容脚本与 ChatGPT 网页交互。ChatGPT 前端结构、选择器、输入框行为或发送流程变化时，扩展可能需要同步适配。

### 不是完全无痕后台运行

Duologue 不要求两个被控页面始终保持前台焦点，但运行时仍会真实读写页面，包括读取消息、填写输入框和触发发送。

### 长时间运行可能受页面状态影响

浏览器标签页回收、MV3 service worker 挂起、ChatGPT 页面状态陈化、页面正在生成或 UI 异常，都可能导致 relay 暂停或失败。

遇到异常时，优先尝试：

1. 刷新相关 ChatGPT 页面
2. 重新绑定 `A / B`
3. 清空状态后重新开始

---

## 项目定位

Duologue 是一个正在演进中的 ChatGPT Web 双端 relay 工具。它已经具备可运行的主链路，但仍以实验、联调和工作流探索为主要目标。

当前重点是：

- 提高双页面绑定的可靠性
- 减少错误观察目标页和误判发送成功
- 稳定悬浮窗主操作链路
- 分离用户文档、开发文档和测试文档

---

## License

See `LICENSE`.
