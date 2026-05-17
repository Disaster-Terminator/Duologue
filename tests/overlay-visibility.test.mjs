import test from "node:test";
import assert from "node:assert/strict";

import { importExtensionModule } from "./extension-test-harness.mjs";

const { shouldShowOverlay } = await importExtensionModule("core/overlay-visibility");

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
