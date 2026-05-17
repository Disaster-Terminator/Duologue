import type { BridgeRole, OverlaySettings, RuntimePhase } from "../shared/types.js";

export interface OverlayVisibilityInput {
  isChatGptPage: boolean;
  assignedRole: BridgeRole | null;
  phase: RuntimePhase;
  hasIssue: boolean;
  overlaySettings: OverlaySettings | null | undefined;
}

export function shouldShowOverlay(input: OverlayVisibilityInput): boolean {
  if (input.overlaySettings?.enabled === false) {
    return false;
  }

  return Boolean(input.isChatGptPage && input.assignedRole);
}
