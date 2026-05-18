import { getPopupCopy, type PopupCopy, type UiLocale } from "../copy/bridge-copy.ts";
import type { BridgeRole, PopupModel, RuntimeState } from "../shared/types.js";

export const MIN_MAX_ROUNDS = 1;
export const MAX_MAX_ROUNDS = 50;

export interface PopupBindingButtonState {
  disabled: boolean;
  current: boolean;
}

export interface PopupSessionActionState {
  startDisabled: boolean;
  pauseDisabled: boolean;
  resumeDisabled: boolean;
  stopDisabled: boolean;
  sessionActionRowHidden: boolean;
  recoveryActionRowHidden: boolean;
  startHidden: boolean;
  pauseHidden: boolean;
  resumeHidden: boolean;
  stopHidden: boolean;
  clearTerminalHidden: boolean;
  clearTerminalDisabled: boolean;
  resumeSourceHidden: boolean;
}

export interface PopupMaxRoundsControlState {
  min: number;
  inputDisabled: boolean;
  toggleDisabled: boolean;
  unlimited: boolean;
  value: string;
  placeholder: string;
}

export interface PopupIssueDisplayState {
  rowHidden: boolean;
  issueText: string;
  debugIssueText: string;
}

export interface PopupRenderState {
  bindingA: string;
  bindingB: string;
  bindingABound: boolean;
  bindingBBound: boolean;
  currentTabStatus: string;
  bindAButton: PopupBindingButtonState;
  bindBButton: PopupBindingButtonState;
  sessionActions: PopupSessionActionState;
  maxRoundsControl: PopupMaxRoundsControlState;
  issueDisplay: PopupIssueDisplayState;
  overrideValue: string;
  overrideLabels: [string, string, string];
}

export function derivePopupRenderState(model: PopupModel, locale: UiLocale): PopupRenderState {
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

export function deriveSessionActions(model: PopupModel): PopupSessionActionState {
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

export function deriveMaxRoundsControl(model: PopupModel): PopupMaxRoundsControlState {
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

export function deriveIssueDisplay(
  lastIssue: PopupModel["display"]["lastIssue"],
  noneText: string
): PopupIssueDisplayState {
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

export function getCurrentTabStatus(copy: PopupCopy, currentTab: PopupModel["currentTab"]): string {
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

export function formatRoundProgress(enabled: boolean, round: number, maxRounds: number): string {
  return `${round} / ${enabled ? maxRounds : "∞"}`;
}

export function summarizeBinding(copy: PopupCopy, binding: RuntimeState["bindings"][BridgeRole]): string {
  if (!binding) {
    return copy.unbound;
  }

  const label = binding.urlInfo?.kind === "project" ? copy.projectThreadLabel : copy.threadLabel;
  return `${binding.title || label} (#${binding.tabId})`;
}

export function clampMaxRounds(value: number): number {
  if (!Number.isFinite(value)) {
    return 8;
  }
  return Math.min(MAX_MAX_ROUNDS, Math.max(MIN_MAX_ROUNDS, Math.round(value)));
}
