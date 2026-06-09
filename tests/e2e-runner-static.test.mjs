import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const e2eRunner = await readFile(new URL("../scripts/e2e-bridge-playwright.mjs", import.meta.url), "utf8");
const bridgeHelpers = await readFile(new URL("../scripts/_playwright-bridge-helpers.mjs", import.meta.url), "utf8");

test("e2e runner imports the anonymous bootstrap helper it calls", () => {
  const helperImport = e2eRunner.match(
    /import\s*\{(?<body>[\s\S]*?)\}\s*from "\.\/_playwright-bridge-helpers\.mjs";/
  )?.groups?.body;

  assert.ok(helperImport);
  assert.match(e2eRunner, /\bbootstrapAnonymousThread\(/);
  assert.match(helperImport, /\bbootstrapAnonymousThread\b/);
});

test("e2e overlay bootstrap waits for injection before pre-bind visibility", () => {
  assert.match(
    bridgeHelpers,
    /waitForSelector\("\.chatgpt-bridge-overlay",\s*\{\s*state: "attached",\s*timeout: 30000\s*\}\)/
  );
});

test("e2e runner defaults to multiple rounds while preserving cli overrides", () => {
  assert.match(e2eRunner, /const DEFAULT_E2E_MAX_ROUNDS = 4;/);
  assert.match(
    e2eRunner,
    /readPositiveIntFlag\("--rounds"\)\s*\?\?\s*readPositiveIntFlag\("--max-rounds"\)\s*\?\?\s*DEFAULT_E2E_MAX_ROUNDS/
  );
});

test("e2e runner reports auth/login diversion before waiting for overlay injection", () => {
  assert.match(e2eRunner, /\bHarnessBlockerError\b/);
  assert.match(e2eRunner, /\bisChatGptLoginOrAuthUrl\b/);
  assert.match(e2eRunner, /chatgpt_auth_gate_before_overlay/);
  assert.match(e2eRunner, /\bensureOverlayInjectableChatGptPages\(/);
  assert.ok([...e2eRunner.matchAll(/\bensureOverlayInjectableChatGptPages\(/g)].length >= 2);
});

test("e2e runner classifies stale auth carriers as harness blockers", () => {
  assert.match(e2eRunner, /persistent_profile_auth_unavailable/);
  assert.match(e2eRunner, /auth_expired_after_navigation/);
  assert.match(e2eRunner, /throw new HarnessBlockerError\(\s*code,/);
});
