# Duologue E2E Environment Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Duologue's browser automation and e2e preconditions explicit without changing relay business behavior.

**Architecture:** Add a capability-report layer around the existing e2e harness. The new layer classifies browser transport, auth state, extension availability, tab ownership, scenario requirements, observability, and blockers; it must not become a second browser launcher or scenario runner.

**Tech Stack:** Node.js ESM scripts, Node built-in test runner, Playwright/CloakBrowser as existing runtime carriers, pnpm scripts already defined in `package.json`.

---

## Decision Summary

The correct abstraction is `CapabilityReport`, not `BrowserRunner`.

Current `scripts/_playwright-bridge-helpers.mjs` and `scripts/e2e-bridge-playwright.mjs` already launch browsers, choose pages, bind tabs, normalize runtime state, and execute relay scenarios. First-round governance should only expose and validate the environment facts those flows currently infer implicitly.

```js
E2EEnvironment = {
  transport,      // cloak-persistent | playwright-persistent | cdp-attach
  auth,           // authenticated | anonymous | recoverable-gate | blocked
  extension,      // loaded-at-launch | installed-in-attached-profile | missing | not-injected
  tabs,           // harness-owned | existing-user-tabs | mixed
  scenario,       // auth requirements, root allowance, fallback policy, minimum rounds
  observability,  // debug log server ownership, diagnostics path, redaction policy
  blockers        // actionable environment blocker codes
}
```

Subagent review with Codex `gpt-5.5` agreed with this shape and narrowed the first slice to "capability report + blocker normalization". The review explicitly rejected making a new browser orchestration layer, copying Oracle's cookie/session sync strategy, or strong-leasing CDP user tabs in the first pass.

Retinue/opencode was also attempted for repository-governance inventory, but the job stalled with no completed assistant text. Treat that output as non-evidence. Local checks showed `.sisyphus/`, `.serena`, `.superpowers/`, `.pnpm-store/`, `tmp/`, and `node_modules/` are ignored; `.sisyphus` is not tracked.

## Non-Negotiable Boundaries

- Do not change relay logic, state-machine transitions, popup commands, overlay commands, or ChatGPT message parsing in this slice.
- Do not turn `scripts/e2e-browser-environment.mjs` into a browser launcher.
- Do not introduce a new dependency.
- Do not log or persist cookies, tokens, local/session storage values, full page body samples, user conversation text, or account-identifying snippets.
- Do not close, clean, or mutate user-owned CDP browser profiles or tabs.
- Do not re-promote storage replay or cookie sync to the main auth strategy.

## File Structure

- Create `scripts/e2e-browser-environment.mjs`
  - Owns pure classifiers, round policy, diagnostic redaction, blocker classification, and persistent-profile lease helpers.
  - Imports only Node built-ins unless an existing project helper is needed.
- Create `tests/e2e-browser-environment.test.mjs`
  - Covers the new module with deterministic Node tests.
- Modify `scripts/e2e-bridge-playwright.mjs`
  - Calls the new module at environment boundaries.
  - Keeps existing launch/navigation/binding/scenario execution flow intact.
- Modify `docs/testing.md`
  - Documents capability model, round policy, debug log behavior, and blocker meanings.
- Modify `docs/auth.md`
  - Reaffirms CloakBrowser persistent profile as the main e2e carrier, Playwright persistent profile as smoke support, CDP attach as diagnostic fallback, and storage replay as diagnostic only.

## Task 1: Add Pure Capability Classifiers

**Files:**
- Create: `scripts/e2e-browser-environment.mjs`
- Test: `tests/e2e-browser-environment.test.mjs`

- [ ] **Step 1: Write classifier tests first**

Add tests that import named functions from `scripts/e2e-browser-environment.mjs` and verify these cases:

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyTransport,
  classifyExtensionCapability,
  resolveScenarioRequirements,
  resolveRoundPolicy,
  classifyEnvironmentBlocker,
  sanitizeEnvironmentDiagnostics
} from "../scripts/e2e-browser-environment.mjs";

test("classifyTransport maps Cloak persistent profile", () => {
  assert.deepEqual(
    classifyTransport({
      strategy: { mode: "persistent" },
      browserCarrier: "cloakbrowser",
      userDataDir: "G:/repository/Duologue/tmp/cloakbrowser-auth-profile"
    }),
    {
      kind: "cloak-persistent",
      lifecycle: "harness-launched",
      canLoadExtensionAtLaunch: true,
      canMutateProfile: true,
      userDataDir: "G:/repository/Duologue/tmp/cloakbrowser-auth-profile"
    }
  );
});

test("classifyTransport maps CDP attach as user-owned and not extension-loadable", () => {
  assert.deepEqual(
    classifyTransport({
      strategy: { mode: "cdp", cdpEndpoint: "http://127.0.0.1:9333" },
      browserCarrier: null,
      userDataDir: null
    }),
    {
      kind: "cdp-attach",
      lifecycle: "attached-user-browser",
      canLoadExtensionAtLaunch: false,
      canMutateProfile: false,
      cdpEndpoint: "http://127.0.0.1:9333"
    }
  );
});

test("classifyExtensionCapability separates missing CDP extension from injection failure", () => {
  assert.equal(
    classifyExtensionCapability({
      transportKind: "cdp-attach",
      serviceWorkerOk: false,
      overlayOk: false,
      popupOk: false,
      runtimePingOk: false
    }).status,
    "missing"
  );

  assert.equal(
    classifyExtensionCapability({
      transportKind: "cdp-attach",
      serviceWorkerOk: true,
      overlayOk: false,
      popupOk: true,
      runtimePingOk: true
    }).status,
    "not-injected"
  );
});

test("round policy rejects one-round business e2e", () => {
  const requirements = resolveScenarioRequirements({
    scenarioName: "happy-path",
    rootOnly: true,
    forceAnonymous: false
  });

  assert.equal(resolveRoundPolicy({ requestedRounds: 1, requirements }).ok, false);
  assert.equal(resolveRoundPolicy({ requestedRounds: 4, requirements }).rounds, 4);
});

test("diagnostics redaction drops sensitive samples", () => {
  assert.deepEqual(
    sanitizeEnvironmentDiagnostics({
      url: "https://chatgpt.com/c/example-thread",
      title: "private thread title",
      bodySample: "private conversation text",
      markerFlags: { composerVisible: true },
      status: "blocked"
    }),
    {
      urlCategory: "chatgpt-thread",
      markerFlags: { composerVisible: true },
      status: "blocked"
    }
  );
});
```

- [ ] **Step 2: Run the failing tests**

Run:

```powershell
node --test tests/e2e-browser-environment.test.mjs
```

Expected result before implementation: module import failure because `scripts/e2e-browser-environment.mjs` does not exist.

- [ ] **Step 3: Implement the pure module**

Create `scripts/e2e-browser-environment.mjs` with named exports used by the tests. Keep functions deterministic. Do not import Playwright.

The module must include:

```js
export function classifyTransport({ strategy, browserCarrier, userDataDir }) {
  if (strategy?.mode === "cdp") {
    return {
      kind: "cdp-attach",
      lifecycle: "attached-user-browser",
      canLoadExtensionAtLaunch: false,
      canMutateProfile: false,
      cdpEndpoint: strategy.cdpEndpoint || null
    };
  }

  const carrier = String(browserCarrier || "playwright").toLowerCase();
  return {
    kind: carrier === "cloakbrowser" ? "cloak-persistent" : "playwright-persistent",
    lifecycle: "harness-launched",
    canLoadExtensionAtLaunch: true,
    canMutateProfile: true,
    userDataDir: userDataDir || null
  };
}
```

Implement the remaining exports with the same small, data-only style.

- [ ] **Step 4: Verify the new module tests pass**

Run:

```powershell
node --test tests/e2e-browser-environment.test.mjs
```

Expected result: all tests in `tests/e2e-browser-environment.test.mjs` pass.

## Task 2: Add Scenario Requirements and Round Policy

**Files:**
- Modify: `scripts/e2e-browser-environment.mjs`
- Test: `tests/e2e-browser-environment.test.mjs`

- [ ] **Step 1: Expand tests for scenario requirements**

Add assertions for:

- `happy-path` requires extension, two injectable ChatGPT pages, and at least 2 rounds.
- Task9 scenarios allow root live-session baseline.
- Smoke-style callers may use 1 round only when explicitly classified as smoke, not business e2e.
- High-risk scenarios can request 4-8 rounds without changing defaults.

- [ ] **Step 2: Implement `resolveScenarioRequirements`**

Use data tables rather than nested conditionals. A representative shape:

```js
const BUSINESS_E2E_DEFAULT_MIN_ROUNDS = 2;
const DEFAULT_E2E_ROUNDS = 4;
const TASK9_SCENARIO_NAMES = new Set([
  "resume-default",
  "resume-with-override-a",
  "resume-with-override-b",
  "task9-suite"
]);

export function resolveScenarioRequirements({ scenarioName, rootOnly, forceAnonymous, kind = "business-e2e" }) {
  const isTask9 = TASK9_SCENARIO_NAMES.has(scenarioName);
  return {
    scenarioName,
    kind,
    requiresExtension: true,
    requiresTwoInjectableTabs: true,
    requiresAuthenticatedProfile: !forceAnonymous,
    allowsAnonymousFallback: Boolean(forceAnonymous),
    allowsRootLiveSession: Boolean(rootOnly || isTask9),
    minRounds: kind === "smoke" ? 1 : BUSINESS_E2E_DEFAULT_MIN_ROUNDS,
    recommendedRounds: kind === "smoke" ? 1 : DEFAULT_E2E_ROUNDS
  };
}
```

- [ ] **Step 3: Implement `resolveRoundPolicy`**

Return structured data:

```js
{
  ok: true,
  rounds: 4,
  source: "default",
  minRounds: 2,
  recommendedRounds: 4
}
```

For invalid requests, return `ok: false` plus blocker code `e2e_rounds_below_scenario_minimum` instead of throwing inside the pure classifier.

- [ ] **Step 4: Keep the existing CLI validation behavior**

When integrating into `scripts/e2e-bridge-playwright.mjs`, preserve the existing 2-50 CLI range for business e2e. Do not allow `--rounds 1` to become a business e2e pass.

## Task 3: Add Persistent Profile Lease

**Files:**
- Modify: `scripts/e2e-browser-environment.mjs`
- Test: `tests/e2e-browser-environment.test.mjs`

- [ ] **Step 1: Add tests for lease decisions**

Cover:

- Persistent profile with a known `userDataDir` is leaseable.
- CDP attach is report-only and not leaseable in the first slice.
- Stale leases are ignored when the recorded process no longer exists or the timestamp exceeds the lease TTL.
- Active leases return blocker `profile_locked_by_other_run`.

- [ ] **Step 2: Implement lease helpers with Node built-ins**

Exports:

```js
export function resolveProfileLeaseTarget({ transport }) {}
export function isProcessAlive(pid) {}
export function classifyProfileLease({ lease, nowMs, ttlMs, processAlive }) {}
```

Use a lease file under the profile directory, for example:

```text
<profile>/.duologue-e2e-profile.lock.json
```

The file should include `pid`, `createdAt`, `cwd`, and `transportKind`. Do not include URLs, cookies, storage, page titles, or scenario prompts.

- [ ] **Step 3: Integrate lease acquisition around persistent e2e only**

In `scripts/e2e-bridge-playwright.mjs`, acquire the lease before launching a persistent context when a concrete profile path is known. Release it during `cleanupEnv` or equivalent cleanup. If acquisition fails, throw `HarnessBlockerError("profile_locked_by_other_run", ...)`.

Do not lease CDP attach in this slice.

## Task 4: Normalize Environment Blockers

**Files:**
- Modify: `scripts/e2e-browser-environment.mjs`
- Modify: `scripts/e2e-bridge-playwright.mjs`
- Test: `tests/e2e-browser-environment.test.mjs`

- [ ] **Step 1: Define blocker codes**

The first slice should support these codes:

```text
auth_gate_before_overlay
persistent_profile_auth_unavailable
extension_missing_in_attached_profile
extension_loaded_but_content_script_not_injected
profile_locked_by_other_run
unsupported_chatgpt_url
cdp_attached_without_owned_tabs
debug_log_server_unavailable
e2e_rounds_below_scenario_minimum
```

- [ ] **Step 2: Map existing errors without widening catch blocks**

Replace only local message construction where the environment cause is already known. Do not catch arbitrary scenario failures and reclassify them as environment blockers.

- [ ] **Step 3: Preserve business failures**

If relay verification, popup/overlay sync, state-machine phase, or message propagation fails after environment preflight succeeds, keep it as a real test failure.

## Task 5: Add Safe Observability Report

**Files:**
- Modify: `scripts/e2e-browser-environment.mjs`
- Modify: `scripts/e2e-bridge-playwright.mjs`
- Test: `tests/e2e-browser-environment.test.mjs`

- [ ] **Step 1: Add redaction tests**

Assert that report output includes status booleans and URL categories, not raw page text:

```js
{
  urlCategory: "chatgpt-thread",
  markerFlags: {
    composerVisible: true,
    overlayVisible: false
  },
  blockerCode: "auth_gate_before_overlay"
}
```

- [ ] **Step 2: Wire debug log server ownership into the report**

Use the existing `ensureDebugLogServer()` behavior:

- Healthy server before run: `ownership = "external"`
- Started by harness: `ownership = "harness"`
- Disabled by flag: `ownership = "disabled"`
- Startup failure: blocker `debug_log_server_unavailable`

- [ ] **Step 3: Avoid storing raw snapshots**

Where current code collects `bodySample`, `title`, or raw URL, convert it before persisting diagnostics. Raw values may still be used transiently in memory for immediate classification, but must not be written into report artifacts.

## Task 6: Documentation Governance

**Files:**
- Modify: `docs/testing.md`
- Modify: `docs/auth.md`

- [ ] **Step 1: Update `docs/testing.md`**

Document:

- Capability report terms.
- e2e round policy: business e2e minimum 2, default 4, high-risk changes 4-8, smoke-only 1.
- Debug log server auto-start/reuse behavior.
- Persistent profile lease behavior.
- CDP attach limitation: target profile must already have Duologue installed and content-script injectable.

- [ ] **Step 2: Update `docs/auth.md`**

Keep the auth ordering:

1. CloakBrowser persistent profile for real happy-path e2e.
2. Playwright persistent profile for smoke.
3. CDP attach for diagnostic fallback.
4. Storage replay only for diagnosis.

Explicitly reject cookie/session sync as the main path.

- [ ] **Step 3: Keep archive material archived**

Do not move old freeze-delivery package notes or historical auth experiments back to root docs. If old docs are mentioned, link them as archive material only.

## Task 7: Verification and Delivery

**Files:**
- All files touched by prior tasks.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
node --test tests/e2e-browser-environment.test.mjs
```

Expected result: pass.

- [ ] **Step 2: Run deterministic project gate**

Run:

```powershell
pnpm run gate:local
```

Expected result: typecheck, build, unit tests, and `verify:dist` pass.

- [ ] **Step 3: Run e2e only when an authenticated persistent carrier is available**

Preferred command for the main carrier:

```powershell
$env:CHATGPT_BROWSER_CARRIER = "cloakbrowser"
$env:CLOAKBROWSER_PROFILE_DIR = "G:\repository\Duologue\tmp\cloakbrowser-auth-profile"
pnpm run test:e2e -- --root-only --scenario happy-path --rounds 4
```

Expected result if auth/profile is healthy: pass.

Expected result if ChatGPT auth gate blocks automation: structured `BLOCKED` result with an actionable blocker code. Do not report that business e2e passed when the blocker occurs.

- [ ] **Step 4: Commit using Lore protocol**

Commit message intent line should describe why the environment facts were made explicit. Include trailers for constraints, rejected alternatives, tests, and untested e2e blockers when applicable.

## Deferred Work

- `/api/auth/session` probe can be added after the first capability-report slice proves useful. It must record only status booleans and evidence labels.
- CDP tab lease can be considered later if the attached browser exposes a reliable, non-destructive ownership signal.
- Oracle-style cookie/session sync should remain rejected unless ChatGPT Web behavior and project constraints change materially.
- Broader repository cleanup should be a separate governance pass. Current local evidence shows ignored state directories are not tracked; the next cleanup pass should focus on untracked historical state and stale entry-point docs, not removing committed `dist/extension`.

## Acceptance Criteria

- Environment failures produce specific blocker codes instead of ambiguous e2e failures.
- Existing relay scenarios still execute through the current harness path.
- Business e2e cannot be claimed from a one-round run.
- Debug log server behavior is explicit and self-starting unless disabled.
- Persistent profile contention is blocked before corrupting or racing the profile.
- Diagnostics are useful without leaking user content or auth material.
- Documentation explains the supported carriers and why storage replay/cookie sync are not the main route.
