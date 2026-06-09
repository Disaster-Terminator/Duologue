import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { importExtensionModule } from "./extension-test-harness.mjs";

const { shouldShowOverlay } = await importExtensionModule("core/overlay-visibility");
const contentScript = await readFile(new URL("../src/extension/content-script.ts", import.meta.url), "utf8");
const overlayCss = await readFile(new URL("../src/extension/overlay.css", import.meta.url), "utf8");

const baseInput = {
  isChatGptPage: true,
  assignedRole: null,
  phase: "idle",
  hasIssue: false,
  overlaySettings: {
    enabled: true,
    ambientEnabled: false,
    collapsed: false,
    position: null
  }
};

test("shouldShowOverlay hides when overlay is disabled", () => {
  assert.equal(
    shouldShowOverlay({
      ...baseInput,
      assignedRole: "A",
      overlaySettings: {
        ...baseInput.overlaySettings,
        enabled: false
      }
    }),
    false
  );
});

test("shouldShowOverlay hides on unbound ChatGPT pages", () => {
  assert.equal(shouldShowOverlay(baseInput), false);
});

test("shouldShowOverlay shows on bound ChatGPT pages", () => {
  assert.equal(
    shouldShowOverlay({
      ...baseInput,
      assignedRole: "B"
    }),
    true
  );
});

test("shouldShowOverlay does not show ambient overlay on unbound non-ChatGPT pages", () => {
  assert.equal(
    shouldShowOverlay({
      ...baseInput,
      isChatGptPage: false,
      phase: "running",
      hasIssue: true,
      overlaySettings: {
        ...baseInput.overlaySettings,
        ambientEnabled: true
      }
    }),
    false
  );
});

test("overlay hides binding controls while locked and keeps stop button accessible", () => {
  assert.match(contentScript, /chatgpt-bridge-overlay__control-group--bindings/);
  assert.match(contentScript, /chatgpt-bridge-overlay__control-group--session/);
  assert.match(contentScript, /chatgpt-bridge-overlay--bindings-locked/);
  assert.match(
    overlayCss,
    /\.chatgpt-bridge-overlay--bindings-locked \.chatgpt-bridge-overlay__control-group--bindings\s*\{\s*display: none;/s
  );
  assert.match(
    overlayCss,
    /\.chatgpt-bridge-overlay--bindings-locked \.chatgpt-bridge-overlay__control-group--session\s*\{\s*padding-top: 0;\s*border-top: 0;/s
  );
  assert.doesNotMatch(overlayCss, /bindings-locked[^{]*:nth-child/);
  assert.match(contentScript, /data-action="stop" aria-label="\$\{c\.stop\}" title="\$\{c\.stop\}"/);
});
