# Duologue

<p>
  <a href="./README.md">中文</a>
</p>

<p>
  <img alt="platform Chromium Extension" src="https://img.shields.io/badge/platform-Chromium%20Extension-4285F4">
  <img alt="manifest MV3" src="https://img.shields.io/badge/manifest-MV3-5f6368">
  <img alt="language TypeScript" src="https://img.shields.io/badge/language-TypeScript-3178C6">
  <img alt="runtime Node.js" src="https://img.shields.io/badge/runtime-Node.js-339933">
  <img alt="package manager pnpm" src="https://img.shields.io/badge/package%20manager-pnpm-F69220">
  <img alt="browser automation Playwright" src="https://img.shields.io/badge/browser%20automation-Playwright-2EAD33">
</p>

Duologue is a dual-session conversation orchestration extension for ChatGPT Web.

It binds two existing ChatGPT pages into a controlled relay channel, reads replies from one side, builds relay payloads, sends them to the other side, and continues the next turn. It is designed for paired-model discussion, agent collaboration experiments, prompt adversarial testing, and ChatGPT Web workflow prototyping.

---

## Core capabilities

- Bind two ChatGPT pages as `A / B`
- Choose `A` or `B` as the starter
- Read the latest assistant reply from one side
- Build a relay payload and send it to the other side
- Wait for the target side to finish replying, then continue in reverse
- Support `Start / Pause / Resume / Stop / Clear`
- Provide an in-page floating panel as the primary control surface
- Provide a popup for global status, settings, and debugging

In one sentence: **Duologue turns paired ChatGPT tabs into a controlled conversation channel.**

---

## Use cases

Duologue is intended for users who are comfortable with workflow prototyping and browser-extension debugging.

Good fit:

- ChatGPT-to-ChatGPT relay
- agent-to-agent relay prototypes
- paired-model discussion and review
- prompt adversarial testing and output validation
- automation experiments on top of ChatGPT Web

Not the current target:

- one-click store extension experience
- fully unattended long-running automation
- production-grade reliability guarantees

---

## Supported pages

Duologue primarily supports these ChatGPT pages:

```text
https://chatgpt.com/c/<conversation-id>
https://chatgpt.com/g/<project-id>/c/<conversation-id>
```

The current implementation can also handle some live sessions that have not yet become persistent thread URLs. For the first run, it is safer to let both pages complete at least one normal conversation turn before binding and starting relay.

---

## Quick start

### 1. Get the extension artifact

Prefer the GitHub Actions artifact when available:

- `chatgpt-tab-bridge-extension`: the loadable `dist/extension` directory
- `chatgpt-tab-bridge-extension-zip`: the same directory as a zip archive

If you build from source, continue with the steps below.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Build the extension

```bash
pnpm run build
```

The build output is written to and committed at:

```text
dist/extension
```

`dist/extension` is the current extension distribution directory, not disposable build cache. CI checks that it matches the source build output.

### 4. Load it in the browser

Microsoft Edge or another Chromium-based browser is recommended. Load the build output as an unpacked extension.

For Edge:

1. Open `edge://extensions`
2. Enable Developer mode
3. Click “Load unpacked”
4. Select `dist/extension`

### 5. Open and bind two ChatGPT pages

Open the two ChatGPT pages you want to relay between, then use the in-page floating panel to bind them as:

- `A`
- `B`

The two pages should not point to the same thread, and both should be ready for normal input and sending.

### 6. Start relay

Choose `A` or `B` as the starter, then click `Start`.

Duologue proceeds through this loop:

1. Read the latest assistant reply from the starter side
2. Build a relay payload
3. Send it to the target side
4. Wait for the target side to finish replying
5. Continue the next turn in reverse

---

## Control surfaces

### In-page floating panel

The floating panel is the primary control surface.

It can:

- Bind the current page as `A` or `B`
- Choose the starter side
- Control `Start / Pause / Resume / Stop / Clear`
- Show phase, round, next hop, step, and last issue
- Move, collapse, and restore the panel

### Popup

The popup is for global overview, settings, and debugging.

It can:

- Show the global relay status
- Show current bindings
- Switch language
- Enable the floating panel, set default expansion, and reset position
- Show low-frequency debugging information

---

## Runtime status

Common states include:

- `ready`
- `running`
- `paused`
- `stopped`
- `error`

Common step messages include:

- `reading A`
- `sending A -> B`
- `waiting B reply`

These states help identify where relay is currently blocked instead of reducing failures to “the extension does not respond”.

---

## Development commands

```bash
pnpm run build
pnpm run typecheck
pnpm test
pnpm run check
```

Development and CI use Node.js 24 with pnpm 10.33.2. `pnpm run check` is the default local pre-submit gate: typecheck, unit tests, extension build, and `dist/extension` consistency.

Common browser-integration commands:

```bash
pnpm run test:smoke
pnpm run test:real-hop
pnpm run test:semi
pnpm run test:e2e
```

See `docs/development.md` for development gates and `docs/testing.md` for testing/auth carrier lanes. `docs/auth.md` is retained as historical auth investigation notes and is not the current testing source of truth.

---

## Permissions and privacy

Duologue focuses on browser-extension state and ChatGPT page interaction:

- `storage`
- `tabs`
- `https://chatgpt.com/*`

It reads messages, writes into the composer, and triggers sends on the ChatGPT pages you explicitly bind. Do not use it with conversations that you do not want extension scripts to participate in.

Duologue aims to make relay visible, pausable, and stoppable, not to hide page interactions.

---

## Current boundaries

### It depends on ChatGPT Web page structure

Duologue interacts with ChatGPT Web through content scripts. If the ChatGPT frontend structure, selectors, composer behavior, or send flow changes, the extension may need updates.

### It is not invisible background automation

Duologue does not require both controlled pages to stay focused all the time, but it still performs real page reads and writes, including reading messages, filling the composer, and sending messages.

### Long-running sessions can be affected by browser and page state

Tab discard, MV3 service-worker suspension, stale ChatGPT page state, ongoing generation, or unexpected UI states can pause or break relay.

When an error occurs, try first:

1. Refresh the related ChatGPT pages
2. Re-bind `A / B`
3. Clear state and start again

---

## Project position

Duologue is an evolving ChatGPT Web dual-end relay tool. The main relay path is usable, but the project is still focused on experimentation, integration testing, and workflow exploration.

Current priorities:

- improve two-page binding reliability
- reduce wrong target observation and false send-success detection
- stabilize the floating-panel control path
- separate user, development, and testing documentation

---

## License

See `LICENSE`.
