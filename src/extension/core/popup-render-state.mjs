export const MIN_MAX_ROUNDS = 1;
export const MAX_MAX_ROUNDS = 50;

const COPY = {
  "zh-CN": {
    unbound: "未绑定",
    noActiveTab: "无可用活动标签页。",
    unsupportedTab: "当前标签页不是支持的 ChatGPT 线程。",
    threadLabel: "线程",
    projectThreadLabel: "项目线程",
    none: "无",
    overrideNone: "不覆盖",
    overrideA: "A → B",
    overrideB: "B → A",
    tabBoundAs: (role) => `当前标签页已绑定为 ${role}。`,
    tabEligible: (kind) => `当前标签页符合条件（${kind}）。`
  },
  en: {
    unbound: "Unbound",
    noActiveTab: "No active tab",
    unsupportedTab: "Current tab is not a supported ChatGPT thread.",
    threadLabel: "Thread",
    projectThreadLabel: "Project thread",
    none: "None",
    overrideNone: "No override",
    overrideA: "A → B",
    overrideB: "B → A",
    tabBoundAs: (role) => `Current tab is bound as ${role}.`,
    tabEligible: (kind) => `Current tab is eligible (${kind}).`
  }
};

function getPopupCopy(locale) {
  return locale === "en" ? COPY.en : COPY["zh-CN"];
}

export function derivePopupRenderState(model, locale) {
  const copy = getPopupCopy(locale);
  const { state, currentTab, controls, display, readiness } = model;
  const canBindCurrentTab =
    Boolean(currentTab?.urlInfo.supported) && state.phase !== "running" && state.phase !== "paused";

  return {
    bindingA: summarizeBinding(copy, state.bindings.A),
    bindingB: summarizeBinding(copy, state.bindings.B),
    bindingABound: Boolean(state.bindings.A),
    bindingBBound: Boolean(state.bindings.B),
    currentTabStatus: getCurrentTabStatus(copy, currentTab),
    bindAButton: {
      disabled: !canBindCurrentTab,
      current: currentTab?.assignedRole === "A"
    },
    bindBButton: {
      disabled: !canBindCurrentTab,
      current: currentTab?.assignedRole === "B"
    },
    sessionActions: deriveSessionActions(model),
    maxRoundsControl: deriveMaxRoundsControl(model),
    issueDisplay: deriveIssueDisplay(display.lastIssue, copy.none),
    overrideValue: controls.canSetOverride ? readiness.sourceRole ?? "" : state.nextHopOverride ?? "",
    overrideLabels: [copy.overrideNone, copy.overrideA, copy.overrideB]
  };
}

export function deriveSessionActions(model) {
  const { state, controls } = model;
  return {
    startDisabled: !controls.canStart,
    pauseDisabled: !controls.canPause,
    resumeDisabled: !controls.canResume,
    stopDisabled: !controls.canStop,
    sessionActionRowHidden: controls.canClearTerminal,
    recoveryActionRowHidden: !controls.canClearTerminal,
    startHidden: state.phase === "running" || state.phase === "paused" || controls.canClearTerminal,
    pauseHidden: state.phase !== "running",
    resumeHidden: state.phase !== "paused",
    stopHidden: state.phase !== "running" && state.phase !== "paused",
    clearTerminalHidden: !controls.canClearTerminal,
    clearTerminalDisabled: !controls.canClearTerminal,
    resumeSourceHidden: !controls.canSetOverride
  };
}

export function deriveMaxRoundsControl(model) {
  const { state, controls } = model;
  const canHotIncreaseMaxRounds = state.phase === "running" && state.settings.maxRoundsEnabled;
  const canEditMaxRounds = controls.canSetSettings || canHotIncreaseMaxRounds;
  const min = canHotIncreaseMaxRounds ? state.settings.maxRounds : MIN_MAX_ROUNDS;
  const unlimited = !state.settings.maxRoundsEnabled;

  return {
    min,
    inputDisabled: !canEditMaxRounds || unlimited,
    toggleDisabled: !controls.canSetSettings,
    unlimited,
    value: unlimited ? "" : String(clampMaxRounds(state.settings.maxRounds)),
    placeholder: unlimited ? "∞" : ""
  };
}

export function deriveIssueDisplay(lastIssue, noneText) {
  if (lastIssue && lastIssue !== "None") {
    return {
      rowHidden: false,
      issueText: lastIssue,
      debugIssueText: lastIssue
    };
  }

  return {
    rowHidden: true,
    issueText: "",
    debugIssueText: noneText
  };
}

export function getCurrentTabStatus(copy, currentTab) {
  if (!currentTab) {
    return copy.noActiveTab;
  }
  if (!currentTab.urlInfo.supported) {
    return copy.unsupportedTab;
  }
  return currentTab.assignedRole
    ? copy.tabBoundAs(currentTab.assignedRole)
    : copy.tabEligible(currentTab.urlInfo.kind);
}

export function formatRoundProgress(enabled, round, maxRounds) {
  return `${round} / ${enabled ? maxRounds : "∞"}`;
}

export function summarizeBinding(copy, binding) {
  if (!binding) {
    return copy.unbound;
  }

  const label = binding.urlInfo?.kind === "project" ? copy.projectThreadLabel : copy.threadLabel;
  return `${binding.title || label} (#${binding.tabId})`;
}

export function clampMaxRounds(value) {
  if (!Number.isFinite(value)) {
    return 8;
  }
  return Math.min(MAX_MAX_ROUNDS, Math.max(MIN_MAX_ROUNDS, Math.round(value)));
}
