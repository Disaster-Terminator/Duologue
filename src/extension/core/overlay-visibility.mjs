export function shouldShowOverlay(input) {
  if (input.overlaySettings?.enabled === false) {
    return false;
  }

  return Boolean(input.isChatGptPage && input.assignedRole);
}
