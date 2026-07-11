import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [packageJson, runner, fixture] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../scripts/fixture-bridge-playwright.mjs", import.meta.url), "utf8"),
  readFile(new URL("./fixtures/chatgpt-thread.html", import.meta.url), "utf8")
]);

test("fixture e2e has an explicit package entry point", () => {
  assert.equal(
    packageJson.scripts["test:fixture-e2e"],
    "node scripts/fixture-bridge-playwright.mjs"
  );
  assert.equal(
    packageJson.scripts["gate:browser"],
    "pnpm run gate:local && pnpm run test:fixture-e2e"
  );
});

test("fixture runner uses real extension pages without auth state", () => {
  assert.match(runner, /return await launchBrowserWithExtension\(\{ extensionPath \}\)/);
  assert.match(runner, /chromium\.executablePath\(\)/);
  assert.match(runner, /Playwright Chromium unavailable; falling back/);
  assert.match(runner, /https:\/\/chatgpt\.com\/c\/fixture-a/);
  assert.match(runner, /https:\/\/chatgpt\.com\/c\/fixture-b/);
  assert.match(runner, /const maxRounds = 4;/);
  assert.doesNotMatch(runner, /storageStatePath|sessionStorageData|CHATGPT_CDP_ENDPOINT/);
});

test("fixture exposes the minimum ChatGPT DOM contract", () => {
  assert.match(fixture, /data-message-author-role/);
  assert.match(fixture, /id="composer-submit-button"/);
  assert.match(fixture, /data-testid="stop-button"/);
  assert.match(fixture, /\[BRIDGE_STATE\] CONTINUE/);
});
