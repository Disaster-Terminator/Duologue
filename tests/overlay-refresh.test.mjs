import test from "node:test";
import assert from "node:assert/strict";

import { importExtensionModule } from "./extension-test-harness.mjs";

const {
  classifyOverlayRefreshError,
  formatOverlayRefreshFailure,
  shouldDisableOverlayRefreshAfterFailure,
  shouldStartOverlayRefresh
} = await importExtensionModule("core/overlay-refresh");

test("classifyOverlayRefreshError identifies extension context invalidation", () => {
  const error = new Error("Extension context invalidated.");

  assert.equal(classifyOverlayRefreshError(error), "context_invalidated");
  assert.equal(shouldDisableOverlayRefreshAfterFailure(error), true);
});

test("classifyOverlayRefreshError identifies missing runtime receiver", () => {
  const error = new Error("Could not establish connection. Receiving end does not exist.");

  assert.equal(classifyOverlayRefreshError(error), "receiving_end_missing");
  assert.equal(shouldDisableOverlayRefreshAfterFailure(error), false);
});

test("classifyOverlayRefreshError identifies empty responses and generic runtime errors", () => {
  assert.equal(classifyOverlayRefreshError(undefined), "empty_response");
  assert.equal(classifyOverlayRefreshError({ message: "custom failure" }), "runtime_error");
});

test("shouldStartOverlayRefresh blocks overlapping and disabled refreshes", () => {
  assert.equal(shouldStartOverlayRefresh({ disabled: false, inFlight: false }), true);
  assert.equal(shouldStartOverlayRefresh({ disabled: false, inFlight: true }), false);
  assert.equal(shouldStartOverlayRefresh({ disabled: true, inFlight: false }), false);
});

test("formatOverlayRefreshFailure explains page refresh recovery in user locale", () => {
  assert.match(formatOverlayRefreshFailure("context_invalidated", "zh-CN"), /刷新此页面/);
  assert.match(formatOverlayRefreshFailure("context_invalidated", "en"), /Refresh this page/);
});
