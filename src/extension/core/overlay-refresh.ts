export type OverlayRefreshFailureKind =
  | "context_invalidated"
  | "receiving_end_missing"
  | "empty_response"
  | "runtime_error";

export function classifyOverlayRefreshError(error: unknown): OverlayRefreshFailureKind {
  if (error === undefined || error === null) {
    return "empty_response";
  }

  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("extension context invalidated")) {
    return "context_invalidated";
  }

  if (
    message.includes("receiving end does not exist") ||
    message.includes("could not establish connection")
  ) {
    return "receiving_end_missing";
  }

  return "runtime_error";
}

export function shouldDisableOverlayRefreshAfterFailure(error: unknown): boolean {
  return classifyOverlayRefreshError(error) === "context_invalidated";
}

export function shouldStartOverlayRefresh({
  disabled,
  inFlight
}: {
  disabled: boolean;
  inFlight: boolean;
}): boolean {
  return !disabled && !inFlight;
}

export function formatOverlayRefreshFailure(kind: OverlayRefreshFailureKind, locale: "zh-CN" | "en"): string {
  if (locale === "zh-CN") {
    switch (kind) {
      case "context_invalidated":
        return "扩展上下文已失效，请刷新此页面以重新注入插件。";
      case "receiving_end_missing":
        return "暂时无法连接扩展后台，若持续出现请刷新页面。";
      case "empty_response":
        return "扩展后台返回空响应，若持续出现请刷新页面。";
      case "runtime_error":
        return "刷新悬浮窗状态失败，请查看控制台错误。";
    }
  }

  switch (kind) {
    case "context_invalidated":
      return "Extension context expired. Refresh this page to inject the extension again.";
    case "receiving_end_missing":
      return "Extension background is temporarily unreachable. Refresh if this persists.";
    case "empty_response":
      return "Extension background returned an empty response. Refresh if this persists.";
    case "runtime_error":
      return "Overlay status refresh failed. Check the console error.";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return String(error);
}
