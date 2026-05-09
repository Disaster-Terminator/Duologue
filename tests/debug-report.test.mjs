import test from "node:test";
import assert from "node:assert/strict";

import { STOP_REASONS } from "../src/extension/core/constants.ts";
import { buildDebugReport } from "../src/extension/core/debug-report.ts";

function makeInput(overrides = {}) {
  return {
    state: {
      phase: "running",
      bindings: {
        A: { tabId: 1, title: "标签 A", url: "https://chatgpt.com/c/a" },
        B: { tabId: 2, title: "标签 B", url: "https://chatgpt.com/c/b" }
      },
      settings: {
        maxRounds: 8,
        maxRoundsEnabled: true,
        stopMarker: "[BRIDGE_STATE] FREEZE",
        hopTimeoutMs: 60000,
        pollIntervalMs: 1500,
        settleSamplesRequired: 2,
        bridgeStatePrefix: "[BRIDGE_STATE]",
        continueMarker: "[BRIDGE_STATE] CONTINUE"
      },
      activeHop: {
        sourceRole: "A",
        targetRole: "B",
        targetTabId: 2,
        round: 3,
        stage: "waiting_reply",
        hopId: "hop-3"
      },
      lastStopReason: STOP_REASONS.UNREACHABLE_TARGET,
      lastError: null
    },
    overlaySettings: {
      enabled: true,
      ambientEnabled: false,
      collapsed: false,
      position: { x: 1, y: 2 }
    },
    recentRuntimeEvents: [],
    generatedAt: "2026-05-09T12:00:00.000Z",
    ...overrides
  };
}

test("buildDebugReport includes Chinese issue advice and core runtime state", () => {
  const report = buildDebugReport(makeInput());

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.currentPhase, "running");
  assert.equal(report.bindings.A.tabId, 1);
  assert.equal(report.activeHop.stage, "waiting_reply");
  assert.equal(report.issueAdvice.reason, STOP_REASONS.UNREACHABLE_TARGET);
  assert.match(report.issueAdvice.summary, /目标标签页/);
});

test("buildDebugReport truncates large fields and keeps recent event diagnostics", () => {
  const huge = "x".repeat(1000);
  const report = buildDebugReport(makeInput({
    recentRuntimeEvents: Array.from({ length: 40 }, (_, index) => ({
      id: `evt-${index}`,
      timestamp: "2026-05-09T12:00:00.000Z",
      level: "error",
      category: "reply",
      phaseStep: huge,
      sourceRole: "A",
      targetRole: "B",
      round: index,
      dispatchReadbackSummary: huge,
      sendTriggerMode: huge,
      verificationBaseline: huge,
      verificationPollSample: `classification:unreachable_target|tab_status:loading|${huge}`,
      verificationVerdict: huge
    }))
  }));

  assert.equal(report.recentRuntimeEvents.length, 25);
  assert.ok(report.recentRuntimeEvents[0].phaseStep.length < 300);
  assert.ok(report.recentRuntimeEvents[0].verificationPollSample.length < 300);
  assert.ok(report.recentRuntimeEvents.at(-1).verificationVerdict.endsWith("..."));
});

test("buildDebugReport handles null optional inputs", () => {
  const report = buildDebugReport(makeInput({
    overlaySettings: null,
    recentRuntimeEvents: null
  }));

  assert.equal(report.overlaySettings, null);
  assert.deepEqual(report.recentRuntimeEvents, []);
});
