import test from "node:test";
import assert from "node:assert/strict";

import { importExtensionModule } from "./extension-test-harness.mjs";

const {
  clampMaxRounds,
  derivePopupRenderState,
  formatRoundProgress
} = await importExtensionModule("core/popup-render-state");

const threadUrlInfo = {
  supported: true,
  kind: "thread",
  threadId: "thread-a",
  projectId: null,
  normalizedUrl: "https://chatgpt.com/c/thread-a"
};

const unsupportedUrlInfo = {
  supported: false,
  kind: "unsupported",
  normalizedUrl: null
};

function makeBinding(role, tabId) {
  return {
    role,
    tabId,
    title: `${role} thread`,
    url: `https://chatgpt.com/c/thread-${role}`,
    urlInfo: {
      ...threadUrlInfo,
      threadId: `thread-${role}`,
      normalizedUrl: `https://chatgpt.com/c/thread-${role}`
    },
    sessionIdentity: null,
    isEmptyThread: null,
    boundAt: "2026-05-18T00:00:00.000Z"
  };
}

function makeModel(overrides = {}) {
  const state = {
    phase: "idle",
    bindings: {
      A: null,
      B: null
    },
    settings: {
      relayMode: "plain",
      maxRoundsEnabled: true,
      maxRounds: 8,
      hopTimeoutMs: 120000,
      pollIntervalMs: 1000,
      settleSamplesRequired: 2,
      bridgeStatePrefix: "[BRIDGE_STATE]",
      continueMarker: "CONTINUE",
      stopMarker: "FREEZE"
    },
    starter: "A",
    nextHopSource: "A",
    nextHopOverride: null,
    round: 0,
    sessionId: 1,
    pendingFreshSession: false,
    requiresTerminalClear: false,
    lastStopReason: null,
    lastError: null,
    activeHop: null,
    lastCompletedHop: null,
    lastForwardedHashes: {
      A: null,
      B: null
    },
    lastAssistantHashes: {
      A: null,
      B: null
    },
    runtimeActivity: {
      step: "idle",
      sourceRole: null,
      targetRole: null,
      pendingRound: null,
      lastActionAt: null,
      transport: null,
      selector: null
    },
    updatedAt: "2026-05-18T00:00:00.000Z",
    ...(overrides.state ?? {})
  };

  return {
    state,
    overlaySettings: {
      enabled: true,
      ambientEnabled: false,
      collapsed: false,
      position: null
    },
    currentTab: {
      id: 10,
      title: "Current thread",
      url: threadUrlInfo.normalizedUrl,
      urlInfo: threadUrlInfo,
      assignedRole: null
    },
    controls: {
      canStart: false,
      canPause: false,
      canResume: false,
      canStop: false,
      canClearTerminal: false,
      canSetStarter: true,
      canSetOverride: false,
      canSetSettings: true,
      ...(overrides.controls ?? {})
    },
    display: {
      nextHop: "A → B",
      currentStep: "idle",
      lastActionAt: null,
      transport: null,
      selector: null,
      lastIssue: "None"
    },
    readiness: {
      starterReady: false,
      preflightPending: false,
      blockReason: null,
      sourceRole: null,
      ...(overrides.readiness ?? {})
    },
    ...(overrides.model ?? {})
  };
}

test("derivePopupRenderState keeps unbound eligible binding actions neutral", () => {
  const state = derivePopupRenderState(makeModel(), "zh-CN");

  assert.equal(state.currentTabStatus, "当前标签页符合条件（thread）。");
  assert.equal(state.bindingABound, false);
  assert.equal(state.bindingBBound, false);
  assert.deepEqual(state.bindAButton, {
    disabled: false,
    current: false
  });
  assert.deepEqual(state.bindBButton, {
    disabled: false,
    current: false
  });
});

test("derivePopupRenderState marks only the current bound role active", () => {
  const state = derivePopupRenderState(
    makeModel({
      state: {
        bindings: {
          A: makeBinding("A", 10),
          B: makeBinding("B", 11)
        }
      },
      model: {
        currentTab: {
          id: 10,
          title: "A thread",
          url: "https://chatgpt.com/c/thread-A",
          urlInfo: threadUrlInfo,
          assignedRole: "A"
        }
      }
    }),
    "zh-CN"
  );

  assert.equal(state.currentTabStatus, "当前标签页已绑定为 A。");
  assert.equal(state.bindingABound, true);
  assert.equal(state.bindingBBound, true);
  assert.equal(state.bindAButton.current, true);
  assert.equal(state.bindBButton.current, false);
});

test("derivePopupRenderState disables binding actions for unsupported and running states", () => {
  const unsupported = derivePopupRenderState(
    makeModel({
      model: {
        currentTab: {
          id: 20,
          title: "Other",
          url: "https://example.com",
          urlInfo: unsupportedUrlInfo,
          assignedRole: null
        }
      }
    }),
    "zh-CN"
  );
  assert.equal(unsupported.currentTabStatus, "当前标签页不是支持的 ChatGPT 线程。");
  assert.equal(unsupported.bindAButton.disabled, true);
  assert.equal(unsupported.bindBButton.disabled, true);

  const running = derivePopupRenderState(
    makeModel({
      state: {
        phase: "running"
      }
    }),
    "zh-CN"
  );
  assert.equal(running.bindAButton.disabled, true);
  assert.equal(running.bindBButton.disabled, true);
});

test("derivePopupRenderState exposes exactly the three override labels render writes", () => {
  const withoutOverride = derivePopupRenderState(makeModel(), "zh-CN");
  assert.equal(withoutOverride.overrideValue, "");
  assert.deepEqual(withoutOverride.overrideLabels, ["不覆盖", "A → B", "B → A"]);

  const withOverride = derivePopupRenderState(
    makeModel({
      controls: {
        canSetOverride: true
      },
      readiness: {
        sourceRole: "B"
      }
    }),
    "zh-CN"
  );
  assert.equal(withOverride.overrideValue, "B");
});

test("popup render helpers keep round values within supported bounds", () => {
  assert.equal(formatRoundProgress(true, 2, 8), "2 / 8");
  assert.equal(formatRoundProgress(false, 2, 8), "2 / ∞");
  assert.equal(clampMaxRounds(Number.NaN), 8);
  assert.equal(clampMaxRounds(-5), 1);
  assert.equal(clampMaxRounds(99), 50);
});
