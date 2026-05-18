import { getPopupCopy, type PopupCopy, type UiLocale } from "../copy/bridge-copy.ts";
import type { BridgeRole, PopupModel, RuntimeState } from "../shared/types.js";

export const MIN_MAX_ROUNDS = 1;
export const MAX_MAX_ROUNDS = 50;

export interface PopupBindingButtonState {
  disabled: boolean;
  current: boolean;
}

export interface PopupRenderState {
  bindingA: string;
  bindingB: string;
  bindingABound: boolean;
  bindingBBound: boolean;
  currentTabStatus: string;
  bindAButton: PopupBindingButtonState;
  bindBButton: PopupBindingButtonState;
  overrideValue: string;
  overrideLabels: [string, string, string];
}

export function derivePopupRenderState(model: PopupModel, locale: UiLocale): PopupRenderState {
  const copy = getPopupCopy(locale);
  const { state, currentTab, controls, readiness } = model;
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
    overrideValue: controls.canSetOverride ? readiness.sourceRole ?? "" : state.nextHopOverride ?? "",
    overrideLabels: [copy.overrideNone, copy.overrideA, copy.overrideB]
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
