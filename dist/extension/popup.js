// core/constants.ts
var ROLE_A = "A";
var ROLE_B = "B";
var ROLES = Object.freeze([ROLE_A, ROLE_B]);
var PHASES = Object.freeze({
  IDLE: "idle",
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  STOPPED: "stopped",
  ERROR: "error"
});
var STOP_REASONS = Object.freeze({
  USER_STOP: "user_stop",
  STOP_MARKER: "stop_marker",
  MAX_ROUNDS: "max_rounds_reached",
  DUPLICATE_OUTPUT: "duplicate_output",
  STARTER_EMPTY: "starter_empty",
  HOP_TIMEOUT: "hop_timeout",
  TARGET_HIDDEN_NO_GENERATION: "target_hidden_no_generation",
  REPLY_OBSERVATION_MISSING: "reply_observation_missing",
  WRONG_TARGET: "wrong_target",
  STALE_TARGET: "stale_target",
  UNREACHABLE_TARGET: "unreachable_target",
  BINDING_INVALID: "binding_invalid",
  STARTER_SETTLE_TIMEOUT: "starter_settle_timeout",
  TARGET_SETTLE_TIMEOUT: "target_settle_timeout",
  SUBMISSION_NOT_VERIFIED: "submission_not_verified"
});
var ERROR_REASONS = Object.freeze({
  SELECTOR_FAILURE: "selector_failure",
  MESSAGE_SEND_FAILED: "message_send_failed",
  UNSUPPORTED_TAB: "unsupported_tab",
  EMPTY_ASSISTANT_REPLY: "empty_assistant_reply",
  INTERNAL_ERROR: "internal_error"
});
var MESSAGE_TYPES = Object.freeze({
  GET_RUNTIME_STATE: "GET_RUNTIME_STATE",
  GET_POPUP_MODEL: "GET_POPUP_MODEL",
  GET_OVERLAY_MODEL: "GET_OVERLAY_MODEL",
  SET_BINDING: "SET_BINDING",
  CLEAR_BINDING: "CLEAR_BINDING",
  SET_STARTER: "SET_STARTER",
  SET_RUNTIME_SETTINGS: "SET_RUNTIME_SETTINGS",
  START_SESSION: "START_SESSION",
  PAUSE_SESSION: "PAUSE_SESSION",
  RESUME_SESSION: "RESUME_SESSION",
  STOP_SESSION: "STOP_SESSION",
  CLEAR_TERMINAL: "CLEAR_TERMINAL",
  SET_NEXT_HOP_OVERRIDE: "SET_NEXT_HOP_OVERRIDE",
  SET_OVERLAY_ENABLED: "SET_OVERLAY_ENABLED",
  SET_AMBIENT_OVERLAY_ENABLED: "SET_AMBIENT_OVERLAY_ENABLED",
  SET_OVERLAY_COLLAPSED: "SET_OVERLAY_COLLAPSED",
  SET_OVERLAY_POSITION: "SET_OVERLAY_POSITION",
  RESET_OVERLAY_POSITION: "RESET_OVERLAY_POSITION",
  GET_ASSISTANT_SNAPSHOT: "GET_ASSISTANT_SNAPSHOT",
  GET_THREAD_ACTIVITY: "GET_THREAD_ACTIVITY",
  GET_LAST_ACK_DEBUG: "GET_LAST_ACK_DEBUG",
  GET_LATEST_USER_TEXT: "GET_LATEST_USER_TEXT",
  GET_RECENT_RUNTIME_EVENTS: "GET_RECENT_RUNTIME_EVENTS",
  SEND_RELAY_MESSAGE: "SEND_RELAY_MESSAGE",
  SYNC_OVERLAY_STATE: "SYNC_OVERLAY_STATE",
  REQUEST_OPEN_POPUP: "REQUEST_OPEN_POPUP"
});
var DEFAULT_SETTINGS = Object.freeze({
  maxRoundsEnabled: true,
  maxRounds: 8,
  hopTimeoutMs: 6e4,
  pollIntervalMs: 1500,
  settleSamplesRequired: 2,
  bridgeStatePrefix: "[BRIDGE_STATE]",
  continueMarker: "CONTINUE",
  stopMarker: "FREEZE"
});
var DEFAULT_OVERLAY_SETTINGS = Object.freeze({
  enabled: true,
  ambientEnabled: false,
  collapsed: false,
  position: null
});

// core/reason-catalog.ts
var UNKNOWN_STOP_REASON = "unknown_stop_reason";
var UNKNOWN_ERROR_REASON = "unknown_error_reason";
var stopReasonDescriptions = {
  [STOP_REASONS.USER_STOP]: {
    title: "\u7528\u6237\u505C\u6B62",
    severity: "info",
    summary: "\u6865\u63A5\u7531\u7528\u6237\u624B\u52A8\u505C\u6B62\u3002",
    nextAction: "\u9700\u8981\u7EE7\u7EED\u65F6\u91CD\u65B0\u5F00\u59CB\u4F1A\u8BDD\u3002"
  },
  [STOP_REASONS.STOP_MARKER]: {
    title: "\u6536\u5230\u505C\u6B62\u6807\u8BB0",
    severity: "info",
    summary: "\u76EE\u6807\u56DE\u590D\u5305\u542B\u914D\u7F6E\u7684\u505C\u6B62\u6807\u8BB0\uFF0C\u6865\u63A5\u6309\u89C4\u5219\u7ED3\u675F\u3002",
    nextAction: "\u68C0\u67E5\u6700\u65B0\u56DE\u590D\uFF1B\u5982\u679C\u8FD8\u8981\u7EE7\u7EED\uFF0C\u8C03\u6574\u4E0A\u4E0B\u6587\u540E\u91CD\u65B0\u542F\u52A8\u3002"
  },
  [STOP_REASONS.MAX_ROUNDS]: {
    title: "\u8FBE\u5230\u8F6E\u6570\u4E0A\u9650",
    severity: "warning",
    summary: "\u6865\u63A5\u5DF2\u8FBE\u5230\u5F53\u524D\u8BBE\u7F6E\u7684\u6700\u5927\u8F6E\u6570\u3002",
    nextAction: "\u5982\u679C\u9700\u8981\u66F4\u591A\u8F6E\u6B21\uFF0C\u63D0\u9AD8\u8F6E\u6570\u9650\u5236\u6216\u624B\u52A8\u7EE7\u7EED\u3002"
  },
  [STOP_REASONS.DUPLICATE_OUTPUT]: {
    title: "\u68C0\u6D4B\u5230\u91CD\u590D\u8F93\u51FA",
    severity: "warning",
    summary: "\u8F93\u51FA\u6CA1\u6709\u4EA7\u751F\u6709\u6548\u53D8\u5316\uFF0C\u6865\u63A5\u4E3A\u907F\u514D\u5FAA\u73AF\u800C\u505C\u6B62\u3002",
    nextAction: "\u68C0\u67E5\u4E24\u4FA7\u63D0\u793A\u662F\u5426\u9677\u5165\u91CD\u590D\uFF0C\u518D\u7528\u65B0\u7684\u4E0A\u4E0B\u6587\u7EE7\u7EED\u3002"
  },
  [STOP_REASONS.STARTER_EMPTY]: {
    title: "\u8D77\u59CB\u56DE\u590D\u4E3A\u7A7A",
    severity: "warning",
    summary: "\u542F\u52A8\u65F6\u8D77\u59CB\u4FA7\u6CA1\u6709\u53EF\u8F6C\u53D1\u7684 assistant \u56DE\u590D\u3002",
    nextAction: "\u5148\u8BA9\u8D77\u59CB\u4FA7\u4EA7\u751F\u4E00\u6761\u56DE\u590D\uFF0C\u6216\u5207\u6362\u8D77\u59CB\u4FA7\u540E\u518D\u542F\u52A8\u3002"
  },
  [STOP_REASONS.HOP_TIMEOUT]: {
    title: "\u5355\u8DF3\u8D85\u65F6",
    severity: "warning",
    summary: "\u67D0\u4E00\u8DF3\u5728\u8D85\u65F6\u7A97\u53E3\u5185\u6CA1\u6709\u89C2\u5BDF\u5230\u53EF\u63A5\u53D7\u7684\u56DE\u590D\u5B8C\u6210\u4FE1\u53F7\u3002",
    nextAction: "\u786E\u8BA4\u76EE\u6807\u9875\u4ECD\u53EF\u54CD\u5E94\uFF1B\u5FC5\u8981\u65F6\u5237\u65B0\u9875\u9762\u3001\u5F00\u542F\u4FDD\u6D3B\u63D2\u4EF6\uFF0C\u6216\u63D0\u9AD8\u8D85\u65F6\u65F6\u95F4\u3002"
  },
  [STOP_REASONS.TARGET_HIDDEN_NO_GENERATION]: {
    title: "\u9690\u85CF\u76EE\u6807\u9875\u672A\u5F00\u59CB\u751F\u6210",
    severity: "warning",
    summary: "\u76EE\u6807\u9875\u5904\u4E8E\u9690\u85CF\u6216\u975E\u6D3B\u8DC3\u72B6\u6001\uFF0C\u63D0\u4EA4\u540E\u6CA1\u6709\u89C2\u5BDF\u5230\u751F\u6210\u5F00\u59CB\u3002",
    nextAction: "\u8BA9\u4E24\u4E2A\u76EE\u6807\u9875\u4FDD\u6301\u6D3B\u8DC3\uFF0C\u6216\u4F7F\u7528\u9875\u9762\u4FDD\u6D3B\u65B9\u6848\u540E\u91CD\u8BD5\u3002"
  },
  [STOP_REASONS.REPLY_OBSERVATION_MISSING]: {
    title: "\u56DE\u590D\u89C2\u5BDF\u7F3A\u5931",
    severity: "warning",
    summary: "\u63D0\u4EA4\u540E\u65E0\u6CD5\u8BFB\u53D6\u5230\u76EE\u6807\u9875\u7684 assistant \u56DE\u590D\u4E8B\u5B9E\u3002",
    nextAction: "\u68C0\u67E5\u76EE\u6807\u7EBF\u7A0B\u662F\u5426\u4ECD\u5728\u6B63\u786E\u9875\u9762\uFF0C\u5237\u65B0\u540E\u91CD\u65B0\u7ED1\u5B9A\u518D\u8BD5\u3002"
  },
  [STOP_REASONS.WRONG_TARGET]: {
    title: "\u76EE\u6807\u6807\u7B7E\u4E0D\u5339\u914D",
    severity: "warning",
    summary: "\u5F53\u524D\u89C2\u5BDF\u5230\u7684\u6807\u7B7E\u4E0D\u662F\u672C\u8DF3\u671F\u671B\u7684\u76EE\u6807\u6807\u7B7E\u3002",
    nextAction: "\u68C0\u67E5 A/B \u7ED1\u5B9A\u548C\u5F53\u524D\u6807\u7B7E\u9875\uFF0C\u5FC5\u8981\u65F6\u6E05\u7A7A\u540E\u91CD\u65B0\u7ED1\u5B9A\u3002"
  },
  [STOP_REASONS.STALE_TARGET]: {
    title: "\u76EE\u6807\u7EBF\u7A0B\u5DF2\u53D8\u66F4",
    severity: "warning",
    summary: "\u76EE\u6807\u6807\u7B7E\u4ECD\u53EF\u8BBF\u95EE\uFF0C\u4F46\u5B83\u7684\u7EBF\u7A0B\u8EAB\u4EFD\u5DF2\u7ECF\u4E0D\u662F\u672C\u8DF3\u671F\u671B\u7684\u7EBF\u7A0B\u3002",
    nextAction: "\u56DE\u5230\u6B63\u786E\u7EBF\u7A0B\u6216\u91CD\u65B0\u7ED1\u5B9A\u5F53\u524D\u7EBF\u7A0B\u3002"
  },
  [STOP_REASONS.UNREACHABLE_TARGET]: {
    title: "\u76EE\u6807\u9875\u4E0D\u53EF\u8FBE",
    severity: "warning",
    summary: "\u6269\u5C55\u65E0\u6CD5\u4ECE\u76EE\u6807\u6807\u7B7E\u9875\u8BFB\u53D6\u8FD0\u884C\u65F6\u89C2\u5BDF\u6837\u672C\uFF0C\u5E38\u89C1\u4E8E\u9875\u9762\u52A0\u8F7D\u4E2D\u3001\u5185\u5BB9\u811A\u672C\u5931\u8054\u6216\u6807\u7B7E\u9875\u5F02\u5E38\u3002",
    nextAction: "\u67E5\u770B runtime log \u4E2D\u7684 tab_status\u3001tab_url\u3001pending_url \u548C observation_error\uFF1B\u5237\u65B0\u5F02\u5E38\u9875\u9762\u540E\u91CD\u8BD5\u3002"
  },
  [STOP_REASONS.BINDING_INVALID]: {
    title: "\u7ED1\u5B9A\u5931\u6548",
    severity: "warning",
    summary: "\u4FDD\u5B58\u7684 A/B \u6807\u7B7E\u7ED1\u5B9A\u5DF2\u4E0D\u80FD\u6EE1\u8DB3\u5F53\u524D\u8FD0\u884C\u8981\u6C42\u3002",
    nextAction: "\u6E05\u7A7A\u72B6\u6001\u5E76\u91CD\u65B0\u7ED1\u5B9A\u4E24\u4E2A ChatGPT \u6807\u7B7E\u9875\u3002"
  },
  [STOP_REASONS.STARTER_SETTLE_TIMEOUT]: {
    title: "\u8D77\u59CB\u9875\u7A33\u5B9A\u8D85\u65F6",
    severity: "warning",
    summary: "\u542F\u52A8\u524D\u7B49\u5F85\u8D77\u59CB\u9875\u7A33\u5B9A\u65F6\u8D85\u65F6\u3002",
    nextAction: "\u7B49\u5F85\u9875\u9762\u52A0\u8F7D\u5B8C\u6210\u540E\u518D\u542F\u52A8\u3002"
  },
  [STOP_REASONS.TARGET_SETTLE_TIMEOUT]: {
    title: "\u76EE\u6807\u9875\u7A33\u5B9A\u8D85\u65F6",
    severity: "warning",
    summary: "\u76EE\u6807\u9875\u6CA1\u6709\u5728\u9884\u671F\u65F6\u95F4\u5185\u8FDB\u5165\u53EF\u64CD\u4F5C\u72B6\u6001\u3002",
    nextAction: "\u5237\u65B0\u76EE\u6807\u9875\uFF0C\u786E\u8BA4\u8F93\u5165\u6846\u53EF\u7528\u540E\u91CD\u8BD5\u3002"
  },
  [STOP_REASONS.SUBMISSION_NOT_VERIFIED]: {
    title: "\u63D0\u4EA4\u672A\u88AB\u9A8C\u8BC1",
    severity: "warning",
    summary: "\u6269\u5C55\u89E6\u53D1\u4E86\u63D0\u4EA4\u52A8\u4F5C\uFF0C\u4F46\u6CA1\u6709\u89C2\u5BDF\u5230\u76EE\u6807\u7EBF\u7A0B\u65B0\u589E\u7528\u6237\u6D88\u606F\u6216\u751F\u6210\u5F00\u59CB\u7684\u53EF\u4FE1\u8BC1\u636E\u3002",
    nextAction: "\u91CD\u70B9\u68C0\u67E5 composer \u662F\u5426\u5F02\u5E38\u3001\u6D88\u606F\u662F\u5426\u88AB\u9875\u9762\u6E05\u7A7A\u3001\u4EE5\u53CA ack debug \u4E2D\u7684 payload/readback \u5B57\u6BB5\u3002"
  }
};
var errorReasonDescriptions = {
  [ERROR_REASONS.SELECTOR_FAILURE]: {
    title: "\u9009\u62E9\u5668\u5931\u8D25",
    severity: "error",
    summary: "\u9875\u9762\u4E0A\u7F3A\u5C11\u6269\u5C55\u6267\u884C\u64CD\u4F5C\u6240\u9700\u7684\u5143\u7D20\u3002",
    nextAction: "\u5237\u65B0\u9875\u9762\uFF0C\u7B49 ChatGPT UI \u5B8C\u5168\u52A0\u8F7D\u540E\u91CD\u8BD5\u3002"
  },
  [ERROR_REASONS.MESSAGE_SEND_FAILED]: {
    title: "\u6D88\u606F\u53D1\u9001\u5931\u8D25",
    severity: "error",
    summary: "\u6269\u5C55\u672A\u80FD\u628A relay payload \u6210\u529F\u5199\u5165\u5E76\u63D0\u4EA4\u5230\u76EE\u6807\u9875\u3002",
    nextAction: "\u68C0\u67E5\u8F93\u5165\u6846\u662F\u5426\u53EF\u7F16\u8F91\u3001\u53D1\u9001\u6309\u94AE\u662F\u5426\u53EF\u7528\uFF0C\u4EE5\u53CA\u9875\u9762\u662F\u5426\u5904\u4E8E\u5F02\u5E38\u52A0\u8F7D\u72B6\u6001\u3002"
  },
  [ERROR_REASONS.UNSUPPORTED_TAB]: {
    title: "\u4E0D\u652F\u6301\u7684\u6807\u7B7E\u9875",
    severity: "error",
    summary: "\u5F53\u524D\u6807\u7B7E\u9875\u4E0D\u662F\u652F\u6301\u7684 ChatGPT \u7EBF\u7A0B\u6216 live session\u3002",
    nextAction: "\u6253\u5F00\u652F\u6301\u7684 ChatGPT \u9875\u9762\u540E\u91CD\u65B0\u7ED1\u5B9A\u3002"
  },
  [ERROR_REASONS.EMPTY_ASSISTANT_REPLY]: {
    title: "assistant \u56DE\u590D\u4E3A\u7A7A",
    severity: "error",
    summary: "\u6E90\u9875\u9762\u6CA1\u6709\u53EF\u8F6C\u53D1\u7684 assistant \u56DE\u590D\u5185\u5BB9\u3002",
    nextAction: "\u7B49\u5F85\u6E90\u9875\u9762\u56DE\u590D\u5B8C\u6210\uFF0C\u6216\u6362\u4E00\u4E2A\u5DF2\u6709\u56DE\u590D\u7684\u7EBF\u7A0B\u4F5C\u4E3A\u8D77\u59CB\u4FA7\u3002"
  },
  [ERROR_REASONS.INTERNAL_ERROR]: {
    title: "\u5185\u90E8\u9519\u8BEF",
    severity: "error",
    summary: "\u6865\u63A5\u8FD0\u884C\u65F6\u51FA\u73B0\u672A\u9884\u671F\u7684\u5185\u90E8\u5F02\u5E38\u3002",
    nextAction: "\u4FDD\u7559\u8C03\u8BD5\u65E5\u5FD7\uFF0C\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\uFF1B\u5982\u679C\u590D\u73B0\uFF0C\u628A\u65E5\u5FD7\u4EA4\u7ED9 agent \u5206\u6790\u3002"
  }
};
function normalizeReason(reason) {
  if (typeof reason !== "string") {
    return null;
  }
  const [baseReason] = reason.split(":", 1);
  return baseReason?.trim() || null;
}
function describeReason(reason, catalog, unknownReason, fallback) {
  const normalizedReason = normalizeReason(reason);
  if (!normalizedReason || !catalog[normalizedReason]) {
    return { ...fallback, reason: unknownReason };
  }
  return { ...catalog[normalizedReason], reason: normalizedReason };
}
function describeStopReason(reason) {
  return describeReason(reason, stopReasonDescriptions, UNKNOWN_STOP_REASON, {
    title: "\u672A\u77E5\u505C\u6B62\u539F\u56E0",
    severity: "warning",
    summary: "\u6865\u63A5\u56E0\u4E3A\u672A\u8BC6\u522B\u7684\u505C\u6B62\u539F\u56E0\u7ED3\u675F\u3002",
    nextAction: "\u67E5\u770B\u6700\u65B0 runtime event \u548C\u8C03\u8BD5\u5FEB\u7167\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u91CD\u8BD5\u3002"
  });
}
function describeErrorReason(reason) {
  return describeReason(reason, errorReasonDescriptions, UNKNOWN_ERROR_REASON, {
    title: "\u672A\u77E5\u9519\u8BEF",
    severity: "error",
    summary: "\u6865\u63A5\u9047\u5230\u672A\u8BC6\u522B\u7684\u9519\u8BEF\u539F\u56E0\u3002",
    nextAction: "\u4FDD\u7559\u65E5\u5FD7\u5E76\u91CD\u8BD5\uFF1B\u5982\u679C\u91CD\u590D\u51FA\u73B0\uFF0C\u6309\u6700\u65B0 runtime event \u7EE7\u7EED\u6392\u67E5\u3002"
  });
}
function describeIssueReason(reason) {
  const normalizedReason = normalizeReason(reason);
  return normalizedReason && errorReasonDescriptions[normalizedReason] ? describeErrorReason(normalizedReason) : describeStopReason(normalizedReason);
}

// core/debug-report.ts
var SCHEMA_VERSION = 1;
var MAX_TEXT = 240;
var MAX_TITLE = 120;
var MAX_URL = 240;
var MAX_ERROR = 360;
var MAX_EVENTS = 25;
function trunc(value, max) {
  const text = typeof value === "string" ? value : value == null ? "" : String(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
function bindingSummary(binding) {
  if (!binding) {
    return null;
  }
  return {
    tabId: binding.tabId,
    title: trunc(binding.title, MAX_TITLE),
    url: trunc(binding.url, MAX_URL)
  };
}
function summarizeEvents(events) {
  if (!events?.length) {
    return [];
  }
  return events.slice(-MAX_EVENTS).map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    level: event.level,
    category: event.category,
    phaseStep: trunc(event.phaseStep, MAX_TEXT),
    sourceRole: event.sourceRole,
    targetRole: event.targetRole,
    round: event.round,
    dispatchReadbackSummary: trunc(event.dispatchReadbackSummary, MAX_TEXT),
    sendTriggerMode: trunc(event.sendTriggerMode, 80),
    verificationBaseline: trunc(event.verificationBaseline, MAX_TEXT),
    verificationPollSample: trunc(event.verificationPollSample, MAX_TEXT),
    verificationVerdict: trunc(event.verificationVerdict, MAX_TEXT)
  }));
}
function buildDebugReport(input) {
  const reason = input.state.lastError ?? input.state.lastStopReason;
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: input.generatedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    currentPhase: input.state.phase,
    bindings: {
      A: bindingSummary(input.state.bindings.A),
      B: bindingSummary(input.state.bindings.B)
    },
    settings: {
      maxRounds: input.state.settings.maxRounds,
      maxRoundsEnabled: input.state.settings.maxRoundsEnabled,
      stopMarker: trunc(input.state.settings.stopMarker, MAX_TEXT),
      hopTimeoutMs: input.state.settings.hopTimeoutMs,
      pollIntervalMs: input.state.settings.pollIntervalMs
    },
    overlaySettings: input.overlaySettings ? {
      enabled: input.overlaySettings.enabled,
      ambientEnabled: input.overlaySettings.ambientEnabled,
      collapsed: input.overlaySettings.collapsed
    } : null,
    activeHop: input.state.activeHop ? {
      sourceRole: input.state.activeHop.sourceRole,
      targetRole: input.state.activeHop.targetRole,
      targetTabId: input.state.activeHop.targetTabId,
      round: input.state.activeHop.round,
      stage: trunc(input.state.activeHop.stage, 80),
      hopId: input.state.activeHop.hopId
    } : null,
    lastStopReason: input.state.lastStopReason,
    lastError: trunc(input.state.lastError, MAX_ERROR) || null,
    issueAdvice: describeIssueReason(reason),
    recentRuntimeEvents: summarizeEvents(input.recentRuntimeEvents)
  };
}

// copy/bridge-copy.ts
var DEFAULT_UI_LOCALE = "zh-CN";
var zhCN = {
  overlay: {
    bridgeTitle: "\u4E2D\u7EE7",
    phaseReady: "\u5C31\u7EEA",
    phaseRunning: "\u8FD0\u884C\u4E2D",
    phasePaused: "\u5DF2\u6682\u505C",
    phaseStopped: "\u5DF2\u505C\u6B62",
    phaseError: "\u9519\u8BEF",
    phaseIdle: "\u7A7A\u95F2",
    roleUnbound: "\u672A\u7ED1\u5B9A",
    roleBoundA: "\u5DF2\u7ED1\u5B9A A",
    roleBoundB: "\u5DF2\u7ED1\u5B9A B",
    roundLabel: "\u8F6E\u6B21",
    nextLabel: "\u4E0B\u4E00\u8DF3",
    stepLabel: "\u6B65\u9AA4",
    issueLabel: "\u95EE\u9898",
    starterLabel: "\u8D77\u59CB\u4FA7",
    starterA: "A \u8D77\u59CB",
    starterB: "B \u8D77\u59CB",
    bindA: "\u7ED1\u5B9A A",
    bindB: "\u7ED1\u5B9A B",
    unbind: "\u7A7A\u95F2",
    start: "\u5F00\u59CB",
    pause: "\u6682\u505C",
    resume: "\u6062\u590D",
    stop: "\u505C\u6B62",
    clear: "\u6E05\u7A7A",
    popup: "\u9762\u677F",
    collapseExpand: "+",
    collapseCollapse: "\u2212",
    none: "\u65E0",
    idle: "\u7A7A\u95F2"
  },
  popup: {
    eyebrow: "Duologue",
    title: "\u8BBE\u7F6E",
    sectionGlobalStatus: "\u5168\u5C40\u72B6\u6001",
    sectionSettings: "\u8BBE\u7F6E",
    sectionFallback: "\u5907\u7528\u64CD\u4F5C",
    sectionDebug: "\u8C03\u8BD5",
    debugSummary: "\u8C03\u8BD5\u4FE1\u606F",
    labelStarter: "\u8D77\u59CB\u4FA7",
    labelMaxRoundsLimit: "\u8F6E\u6570\u9650\u5236",
    labelMaxRounds: "\u6865\u63A5\u8F6E\u6570",
    maxRoundsHelp: "\u5F00\u542F\u540E\u5230\u8FBE\u76EE\u6807\u8F6E\u6570\u81EA\u52A8\u505C\u6B62\uFF1B\u5173\u95ED\u540E\u663E\u793A\u4E3A \u221E\u3002",
    maxRoundsDecrease: "\u51CF\u5C11\u6865\u63A5\u8F6E\u6570",
    maxRoundsIncrease: "\u589E\u52A0\u6865\u63A5\u8F6E\u6570",
    roundUnit: "\u8F6E",
    labelOverride: "\u6682\u505C\u65F6\u4E0B\u4E00\u8DF3\u8986\u76D6",
    labelEnableOverlay: "\u542F\u7528\u60AC\u6D6E\u7A97",
    labelEnableAmbientOverlay: "\u5168\u7AD9\u72B6\u6001\u63D0\u793A",
    labelDefaultExpanded: "\u9ED8\u8BA4\u5C55\u5F00\u60AC\u6D6E\u7A97",
    bindingA: "\u7ED1\u5B9A A",
    bindingB: "\u7ED1\u5B9A B",
    currentTab: "\u5F53\u524D\u6807\u7B7E\u9875",
    unbind: "\u89E3\u7ED1",
    start: "\u5F00\u59CB",
    pause: "\u6682\u505C",
    resume: "\u6062\u590D",
    stop: "\u505C\u6B62",
    clearTerminal: "\u6E05\u7A7A\u7EC8\u7AEF",
    openHelp: "\u5E2E\u52A9",
    resetPosition: "\u91CD\u7F6E\u4F4D\u7F6E",
    copyDebug: "\u590D\u5236\u8C03\u8BD5\u5FEB\u7167",
    downloadDebug: "\u4E0B\u8F7D\u65E5\u5FD7",
    copied: "\u8C03\u8BD5\u5FEB\u7167\u5DF2\u590D\u5236",
    copiedDebugSnapshot: "\u5DF2\u590D\u5236\u8C03\u8BD5\u5FEB\u7167",
    downloadedDebugSnapshot: "\u5DF2\u4E0B\u8F7D\u8C03\u8BD5\u65E5\u5FD7",
    failedToCopyDebugSnapshot: "\u590D\u5236\u8C03\u8BD5\u5FEB\u7167\u5931\u8D25",
    failedToDownloadDebugSnapshot: "\u4E0B\u8F7D\u8C03\u8BD5\u65E5\u5FD7\u5931\u8D25",
    noActiveTab: "\u65E0\u53EF\u7528\u6D3B\u52A8\u6807\u7B7E\u9875\u3002",
    unsupportedTab: "\u5F53\u524D\u6807\u7B7E\u9875\u4E0D\u662F\u652F\u6301\u7684 ChatGPT \u7EBF\u7A0B\u3002",
    tabBoundAs: (role) => `\u5F53\u524D\u6807\u7B7E\u9875\u5DF2\u7ED1\u5B9A\u4E3A ${role}\u3002`,
    tabEligible: (kind) => `\u5F53\u524D\u6807\u7B7E\u9875\u7B26\u5408\u6761\u4EF6\uFF08${kind}\uFF09\u3002`,
    unbound: "\u672A\u7ED1\u5B9A",
    none: "\u65E0",
    idle: "\u7A7A\u95F2",
    roundLabel: "\u8F6E\u6B21",
    nextHopLabel: "\u4E0B\u4E00\u8DF3",
    currentStepLabel: "\u5F53\u524D\u6B65\u9AA4",
    transportLabel: "\u4F20\u8F93",
    selectorLabel: "\u9009\u62E9\u5668",
    lastIssueLabel: "\u6700\u540E\u95EE\u9898",
    threadLabel: "\u7EBF\u7A0B",
    projectThreadLabel: "\u9879\u76EE\u7EBF\u7A0B",
    overrideNone: "\u4E0D\u8986\u76D6",
    overrideA: "A \u2192 B",
    overrideB: "B \u2192 A",
    starterA: "A \u8D77\u59CB",
    starterB: "B \u8D77\u59CB",
    localeLabel: "\u8BED\u8A00",
    localeZh: "\u4E2D\u6587",
    localeEn: "English",
    helpText: "\u8986\u76D6\u4EC5\u5728\u6682\u505C\u65F6\u751F\u6548\uFF1B\u6E05\u7A7A\u7EC8\u7AEF\u53EF\u5C06\u5DF2\u505C\u6B62/\u9519\u8BEF\u72B6\u6001\u91CD\u7F6E\u4E3A\u5C31\u7EEA\u3002",
    readinessLabel: "\u65E0\u6CD5\u542F\u52A8:",
    blockReasons: {
      starter_generating: "\u8D77\u59CB\u4FA7\u6B63\u5728\u751F\u6210\u4E2D",
      starter_empty: "\u8D77\u59CB\u4FA7\u6CA1\u6709\u53EF\u8F6C\u53D1\u56DE\u590D",
      clear_terminal_required: "\u9700\u8981\u6E05\u7A7A\u7EC8\u7AEF",
      missing_binding: "\u7F3A\u5C11\u7ED1\u5B9A",
      preflight_pending: "\u7B49\u5F85\u8D77\u59CB\u4FA7\u5C31\u7EEA"
    }
  }
};
var en = {
  overlay: {
    bridgeTitle: "Bridge",
    phaseReady: "Ready",
    phaseRunning: "Running",
    phasePaused: "Paused",
    phaseStopped: "Stopped",
    phaseError: "Error",
    phaseIdle: "Idle",
    roleUnbound: "Unbound",
    roleBoundA: "Bound as A",
    roleBoundB: "Bound as B",
    roundLabel: "Round",
    nextLabel: "Next",
    stepLabel: "Step",
    issueLabel: "Issue",
    starterLabel: "Starter",
    starterA: "A starts",
    starterB: "B starts",
    bindA: "Bind A",
    bindB: "Bind B",
    unbind: "Idle",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    clear: "Clear",
    popup: "Popup",
    collapseExpand: "+",
    collapseCollapse: "\u2212",
    none: "None",
    idle: "idle"
  },
  popup: {
    eyebrow: "Duologue",
    title: "Settings",
    sectionGlobalStatus: "Global status",
    sectionSettings: "Settings",
    sectionFallback: "Fallback",
    sectionDebug: "Debug",
    debugSummary: "Debug info",
    labelStarter: "Starter side",
    labelMaxRoundsLimit: "Round limit",
    labelMaxRounds: "Bridge rounds",
    maxRoundsHelp: "When enabled, stops after the selected count; disabled shows \u221E.",
    maxRoundsDecrease: "Decrease bridge rounds",
    maxRoundsIncrease: "Increase bridge rounds",
    roundUnit: "rounds",
    labelOverride: "Paused next hop override",
    labelEnableOverlay: "Enable overlay",
    labelEnableAmbientOverlay: "Site-wide status hint",
    labelDefaultExpanded: "Default expanded overlay",
    bindingA: "Binding A",
    bindingB: "Binding B",
    currentTab: "Current tab",
    unbind: "Unbind",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    clearTerminal: "Clear terminal",
    openHelp: "Help",
    resetPosition: "Reset position",
    copyDebug: "Copy debug snapshot",
    downloadDebug: "Download logs",
    copied: "Debug snapshot copied",
    copiedDebugSnapshot: "Copied debug snapshot",
    downloadedDebugSnapshot: "Downloaded debug log",
    failedToCopyDebugSnapshot: "Failed to copy debug snapshot",
    failedToDownloadDebugSnapshot: "Failed to download debug log",
    noActiveTab: "No active tab available.",
    unsupportedTab: "Current tab is not a supported ChatGPT thread.",
    tabBoundAs: (role) => `Current tab is bound as ${role}.`,
    tabEligible: (kind) => `Current tab is eligible (${kind}).`,
    unbound: "Unbound",
    none: "None",
    idle: "idle",
    roundLabel: "Round",
    nextHopLabel: "Next hop",
    currentStepLabel: "Current step",
    transportLabel: "Transport",
    selectorLabel: "Selector",
    lastIssueLabel: "Last issue",
    threadLabel: "thread",
    projectThreadLabel: "project thread",
    overrideNone: "No override",
    overrideA: "A \u2192 B",
    overrideB: "B \u2192 A",
    starterA: "A starts",
    starterB: "B starts",
    localeLabel: "Language",
    localeZh: "Chinese",
    localeEn: "English",
    helpText: "Override only applies while paused; Clear returns stopped/error to ready.",
    readinessLabel: "Cannot start:",
    blockReasons: {
      starter_generating: "Starter is still generating",
      starter_empty: "Starter has no reply to forward",
      clear_terminal_required: "Terminal must be cleared",
      missing_binding: "Missing binding",
      preflight_pending: "Waiting for starter to settle"
    }
  }
};
function getOverlayCopy(locale) {
  return locale === "en" ? en.overlay : zhCN.overlay;
}
function getPopupCopy(locale) {
  return locale === "en" ? en.popup : zhCN.popup;
}
function formatPhase(locale, phase) {
  const c = getOverlayCopy(locale);
  switch (phase) {
    case "ready":
      return c.phaseReady;
    case "running":
      return c.phaseRunning;
    case "paused":
      return c.phasePaused;
    case "stopped":
      return c.phaseStopped;
    case "error":
      return c.phaseError;
    default:
      return c.phaseIdle;
  }
}
function applyStaticCopy(root, locale) {
  const c = getPopupCopy(locale);
  root.querySelectorAll("[data-copy]").forEach((el) => {
    const rawKey = el.dataset.copy;
    if (!rawKey) return;
    const key = rawKey;
    const value = c[key];
    if (typeof value === "string") {
      el.textContent = value;
    }
  });
}

// ui/preferences.ts
var UI_LOCALE_STORAGE_KEY = "chatgptBridgeUiLocale";
function readUiLocale() {
  try {
    const raw = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw === "zh-CN" || raw === "en") {
      return raw;
    }
  } catch {
  }
  return DEFAULT_UI_LOCALE;
}
function writeUiLocale(locale) {
  try {
    localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
  } catch {
  }
}

// popup.ts
var REFRESH_INTERVAL_MS = 1e3;
var MIN_MAX_ROUNDS = 1;
var MAX_MAX_ROUNDS = 50;
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    )
  ]);
}
var elements = {
  phaseBadge: requireElement("#phaseBadge"),
  currentTabStatus: requireElement("#currentTabStatus"),
  bindAButton: requireElement("#bindAButton"),
  bindBButton: requireElement("#bindBButton"),
  bindingA: requireElement("#bindingA"),
  bindingB: requireElement("#bindingB"),
  localeSelect: requireElement("#localeSelect"),
  maxRoundsRange: requireElement("#maxRoundsRange"),
  maxRoundsValue: requireElement("#maxRoundsValue"),
  maxRoundsEnabledCheckbox: requireElement("#maxRoundsEnabledCheckbox"),
  decreaseMaxRoundsButton: requireElement("#decreaseMaxRoundsButton"),
  increaseMaxRoundsButton: requireElement("#increaseMaxRoundsButton"),
  overlayEnabledCheckbox: requireElement("#overlayEnabledCheckbox"),
  ambientOverlayEnabledCheckbox: requireElement("#ambientOverlayEnabledCheckbox"),
  defaultExpandedCheckbox: requireElement("#defaultExpandedCheckbox"),
  resetOverlayPositionButton: requireElement("#resetOverlayPositionButton"),
  starterSelect: requireElement("#starterSelect"),
  overrideSelect: requireElement("#overrideSelect"),
  startButton: requireElement("#startButton"),
  pauseButton: requireElement("#pauseButton"),
  resumeButton: requireElement("#resumeButton"),
  stopButton: requireElement("#stopButton"),
  clearTerminalButton: requireElement("#clearTerminalButton"),
  copyDebugButton: requireElement("#copyDebugButton"),
  downloadDebugButton: requireElement("#downloadDebugButton"),
  openHelpButton: requireElement("#openHelpButton"),
  roundValue: requireElement("#roundValue"),
  nextHopValue: requireElement("#nextHopValue"),
  currentStepValue: requireElement("#currentStepValue"),
  currentStepValueDebug: requireElement("#currentStepValueDebug"),
  transportValue: requireElement("#transportValue"),
  selectorValue: requireElement("#selectorValue"),
  issueValue: requireElement("#issueValue"),
  issueValueDebug: requireElement("#issueValueDebug"),
  issueRow: requireElement("#issueRow"),
  copyFeedback: requireElement("#copyFeedback"),
  readinessRow: requireElement("#readinessRow"),
  readinessReason: requireElement("#readinessReason")
};
var currentTabId = null;
var currentModel = null;
var refreshTimerId = null;
var refreshInFlight = null;
var currentLocale = readUiLocale();
applyStaticCopy(document.body, currentLocale);
document.documentElement.lang = currentLocale === "en" ? "en" : "zh-CN";
wireEvents();
void refresh();
startAutoRefresh();
async function refresh() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = refreshLatestModel();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
async function refreshLatestModel() {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    currentTabId = activeTab?.id ?? null;
    const response = await sendMessage({
      type: MESSAGE_TYPES.GET_POPUP_MODEL,
      activeTabId: currentTabId
    });
    currentModel = response;
    render(response);
    return response;
  } catch (error) {
    const message = getErrorMessage(error);
    elements.currentTabStatus.textContent = message;
    elements.issueValue.textContent = message;
    return null;
  }
}
function wireEvents() {
  elements.bindAButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.SET_BINDING,
      role: "A",
      tabId: currentTabId
    });
  });
  elements.bindBButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.SET_BINDING,
      role: "B",
      tabId: currentTabId
    });
  });
  elements.starterSelect.addEventListener("change", () => {
    void perform({
      type: MESSAGE_TYPES.SET_STARTER,
      role: elements.starterSelect.value
    });
  });
  elements.overrideSelect.addEventListener("change", () => {
    const role = toNullableRole(elements.overrideSelect.value);
    void perform({
      type: MESSAGE_TYPES.SET_NEXT_HOP_OVERRIDE,
      role
    });
  });
  elements.startButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.START_SESSION
    });
  });
  elements.pauseButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.PAUSE_SESSION
    });
  });
  elements.resumeButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.RESUME_SESSION
    });
  });
  elements.stopButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.STOP_SESSION
    });
  });
  elements.clearTerminalButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.CLEAR_TERMINAL
    });
  });
  elements.copyDebugButton.addEventListener("click", () => {
    void copyDebugSnapshot();
  });
  elements.downloadDebugButton.addEventListener("click", () => {
    void downloadDebugSnapshot();
  });
  elements.openHelpButton.addEventListener("click", () => {
    window.open("https://github.com/Disaster-Terminator/Duologue#readme", "_blank");
  });
  elements.overlayEnabledCheckbox.addEventListener("change", () => {
    void perform({
      type: MESSAGE_TYPES.SET_OVERLAY_ENABLED,
      enabled: elements.overlayEnabledCheckbox.checked
    });
  });
  elements.ambientOverlayEnabledCheckbox.addEventListener("change", () => {
    void perform({
      type: MESSAGE_TYPES.SET_AMBIENT_OVERLAY_ENABLED,
      enabled: elements.ambientOverlayEnabledCheckbox.checked
    });
  });
  elements.resetOverlayPositionButton.addEventListener("click", () => {
    void perform({
      type: MESSAGE_TYPES.RESET_OVERLAY_POSITION
    });
  });
  elements.localeSelect.addEventListener("change", () => {
    const newLocale = elements.localeSelect.value;
    currentLocale = newLocale;
    writeUiLocale(newLocale);
    document.documentElement.lang = newLocale === "en" ? "en" : "zh-CN";
    applyStaticCopy(document.body, newLocale);
    if (currentModel) {
      render(currentModel);
    }
  });
  elements.maxRoundsRange.addEventListener("input", () => {
    renderMaxRoundsValue(Number(elements.maxRoundsRange.value));
  });
  elements.maxRoundsRange.addEventListener("change", () => {
    void updateMaxRounds(Number(elements.maxRoundsRange.value));
  });
  elements.maxRoundsEnabledCheckbox.addEventListener("change", () => {
    void perform({
      type: MESSAGE_TYPES.SET_RUNTIME_SETTINGS,
      settings: {
        maxRoundsEnabled: elements.maxRoundsEnabledCheckbox.checked
      }
    });
  });
  elements.decreaseMaxRoundsButton.addEventListener("click", () => {
    void updateMaxRounds(Number(elements.maxRoundsRange.value) - 1);
  });
  elements.increaseMaxRoundsButton.addEventListener("click", () => {
    void updateMaxRounds(Number(elements.maxRoundsRange.value) + 1);
  });
  elements.defaultExpandedCheckbox.addEventListener("change", () => {
    void perform({
      type: MESSAGE_TYPES.SET_OVERLAY_COLLAPSED,
      collapsed: !elements.defaultExpandedCheckbox.checked
    });
  });
}
async function perform(message) {
  try {
    await sendMessage(message);
    await refresh();
  } catch (error) {
    elements.issueValue.textContent = getErrorMessage(error);
  }
}
function render(model) {
  const copy = getPopupCopy(currentLocale);
  const { state, currentTab, controls, display, overlaySettings, readiness } = model;
  elements.phaseBadge.textContent = formatPhase(currentLocale, state.phase);
  elements.phaseBadge.dataset.phase = state.phase;
  elements.bindingA.textContent = summarizeBinding(copy, state.bindings.A);
  elements.bindingB.textContent = summarizeBinding(copy, state.bindings.B);
  elements.roundValue.textContent = formatRoundProgress(state.settings.maxRoundsEnabled, state.round, state.settings.maxRounds);
  elements.nextHopValue.textContent = display.nextHop;
  elements.currentStepValue.textContent = display.currentStep || copy.idle;
  elements.currentStepValueDebug.textContent = display.currentStep || copy.idle;
  elements.transportValue.textContent = display.transport || copy.none;
  elements.selectorValue.textContent = display.selector || copy.none;
  if (display.lastIssue && display.lastIssue !== "None") {
    elements.issueRow.hidden = false;
    elements.issueValue.textContent = display.lastIssue;
    elements.issueValueDebug.textContent = display.lastIssue;
  } else {
    elements.issueRow.hidden = true;
    elements.issueValueDebug.textContent = copy.none;
  }
  elements.starterSelect.value = state.starter;
  elements.overrideSelect.value = state.nextHopOverride ?? "";
  elements.localeSelect.value = currentLocale;
  setMaxRoundsControl(state.settings.maxRounds, state.settings.maxRoundsEnabled);
  elements.overlayEnabledCheckbox.checked = overlaySettings.enabled;
  elements.ambientOverlayEnabledCheckbox.checked = overlaySettings.ambientEnabled;
  elements.defaultExpandedCheckbox.checked = !overlaySettings.collapsed;
  const toggle = elements.overlayEnabledCheckbox.closest(".popup__toggle");
  if (toggle) {
    toggle.dataset.checked = String(elements.overlayEnabledCheckbox.checked);
  }
  const ambientToggle = elements.ambientOverlayEnabledCheckbox.closest(".popup__toggle");
  if (ambientToggle) {
    ambientToggle.dataset.checked = String(elements.ambientOverlayEnabledCheckbox.checked);
  }
  const expandedToggle = elements.defaultExpandedCheckbox.closest(".popup__toggle");
  if (expandedToggle) {
    expandedToggle.dataset.checked = String(elements.defaultExpandedCheckbox.checked);
  }
  if (!currentTab) {
    elements.currentTabStatus.textContent = copy.noActiveTab;
  } else if (!currentTab.urlInfo.supported) {
    elements.currentTabStatus.textContent = copy.unsupportedTab;
  } else {
    elements.currentTabStatus.textContent = currentTab.assignedRole ? copy.tabBoundAs(currentTab.assignedRole) : copy.tabEligible(currentTab.urlInfo.kind);
  }
  elements.startButton.disabled = !controls.canStart;
  elements.pauseButton.disabled = !controls.canPause;
  elements.resumeButton.disabled = !controls.canResume;
  elements.stopButton.disabled = !controls.canStop;
  elements.clearTerminalButton.disabled = !controls.canClearTerminal;
  elements.starterSelect.disabled = !controls.canSetStarter;
  elements.overrideSelect.disabled = !controls.canSetOverride;
  elements.maxRoundsRange.disabled = !controls.canSetSettings;
  elements.maxRoundsEnabledCheckbox.disabled = !controls.canSetSettings;
  elements.decreaseMaxRoundsButton.disabled = !controls.canSetSettings || !state.settings.maxRoundsEnabled || state.settings.maxRounds <= MIN_MAX_ROUNDS;
  elements.increaseMaxRoundsButton.disabled = !controls.canSetSettings || !state.settings.maxRoundsEnabled || state.settings.maxRounds >= MAX_MAX_ROUNDS;
  elements.decreaseMaxRoundsButton.setAttribute("aria-label", copy.maxRoundsDecrease);
  elements.increaseMaxRoundsButton.setAttribute("aria-label", copy.maxRoundsIncrease);
  const maxRoundsToggle = elements.maxRoundsEnabledCheckbox.closest(".popup__toggle");
  if (maxRoundsToggle) {
    maxRoundsToggle.dataset.checked = String(elements.maxRoundsEnabledCheckbox.checked);
  }
  if (readiness.blockReason) {
    elements.readinessRow.hidden = false;
    const reasonKey = readiness.blockReason;
    elements.readinessReason.textContent = copy.blockReasons?.[reasonKey] || copy.none;
  } else {
    elements.readinessRow.hidden = true;
  }
  const starterOptions = elements.starterSelect.options;
  starterOptions[0].textContent = copy.starterA;
  starterOptions[1].textContent = copy.starterB;
  const overrideOptions = elements.overrideSelect.options;
  overrideOptions[0].textContent = copy.overrideNone;
  overrideOptions[1].textContent = copy.overrideA;
  overrideOptions[2].textContent = copy.overrideB;
}
function showCopyFeedback(message, isSuccess) {
  const feedback = elements.copyFeedback;
  feedback.textContent = message;
  feedback.className = "popup__copy-feedback";
  feedback.classList.add(isSuccess ? "popup__copy-feedback--success" : "popup__copy-feedback--error");
  feedback.hidden = false;
  setTimeout(() => {
    feedback.hidden = true;
  }, 1800);
}
async function copyDebugSnapshot() {
  const payload = await collectDebugSnapshotPayload();
  if (!payload) {
    showCopyFeedback(getPopupCopy(currentLocale).failedToCopyDebugSnapshot, false);
    return;
  }
  try {
    await navigator.clipboard.writeText(payload);
    showCopyFeedback(getPopupCopy(currentLocale).copiedDebugSnapshot, true);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = payload;
    fallback.setAttribute("readonly", "true");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
    showCopyFeedback(getPopupCopy(currentLocale).copiedDebugSnapshot, true);
  }
}
async function downloadDebugSnapshot() {
  const copy = getPopupCopy(currentLocale);
  const payload = await collectDebugSnapshotPayload();
  if (!payload) {
    showCopyFeedback(copy.failedToDownloadDebugSnapshot, false);
    return;
  }
  try {
    const blob = new Blob([payload], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `duologue-debug-${formatFileTimestamp(/* @__PURE__ */ new Date())}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showCopyFeedback(copy.downloadedDebugSnapshot, true);
  } catch (error) {
    console.warn("Failed to download debug snapshot:", error);
    showCopyFeedback(copy.failedToDownloadDebugSnapshot, false);
  }
}
async function collectDebugSnapshotPayload() {
  const latestModel = await refresh() ?? currentModel;
  if (!latestModel) {
    return null;
  }
  const ackTarget = resolveAckDebugTarget(latestModel, currentTabId);
  if (!ackTarget.tabId) {
    return null;
  }
  let ackDebug = null;
  let runtimeEvents = [];
  try {
    ackDebug = await withTimeout(
      chrome.tabs.sendMessage(ackTarget.tabId, { type: MESSAGE_TYPES.GET_LAST_ACK_DEBUG }),
      5e3
    );
  } catch (error) {
    console.warn("Failed to fetch ack debug:", error);
  }
  try {
    const eventsResponse = await withTimeout(
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_RECENT_RUNTIME_EVENTS
      }),
      5e3
    );
    runtimeEvents = eventsResponse.ok ? eventsResponse.result : [];
  } catch (error) {
    console.warn("Failed to fetch runtime events:", error);
  }
  return buildDebugSnapshot(latestModel, ackDebug, ackTarget, runtimeEvents);
}
function buildDebugSnapshot(model, ackDebug, ackTarget, runtimeEvents = []) {
  const copy = getPopupCopy(currentLocale);
  const { state, currentTab, display } = model;
  const tabStatus = currentTab?.assignedRole ? copy.tabBoundAs(currentTab.assignedRole) : currentTab?.urlInfo?.supported ? copy.tabEligible(currentTab.urlInfo.kind) : copy.unsupportedTab;
  const lines = [
    copy.title,
    "",
    `${formatPhase(currentLocale, state.phase)}`,
    tabStatus,
    `A: ${summarizeBinding(copy, state.bindings.A)}`,
    `B: ${summarizeBinding(copy, state.bindings.B)}`,
    `${copy.labelStarter}: ${state.starter}`,
    `${copy.roundLabel}: ${formatRoundProgress(state.settings.maxRoundsEnabled, state.round, state.settings.maxRounds)}`,
    `${copy.nextHopLabel}: ${display.nextHop}`,
    `${copy.currentStepLabel}: ${display.currentStep || copy.idle}`,
    `${copy.transportLabel}: ${display.transport || copy.none}`,
    `${copy.selectorLabel}: ${display.selector || copy.none}`,
    `${copy.lastIssueLabel}: ${display.lastIssue || copy.none}`,
    `Ack target: ${ackTarget.role ?? "current"} (#${ackTarget.tabId ?? "N/A"}, ${ackTarget.source})`
  ];
  if (ackDebug && ackDebug.ok === false && ackDebug.error) {
    lines.push("", "Ack Debug:", `  Error: ${ackDebug.error}`);
  } else if (ackDebug) {
    const response = ackDebug.response ?? {};
    const evidence = response.dispatchEvidence ?? {};
    lines.push(
      "",
      "Ack Debug:",
      `  Timestamp: ${formatTimestamp(ackDebug.timestamp)}`,
      `  Outcome: ${ackDebug.outcome || "unknown"}`,
      `  Reason: ${ackDebug.reason || "none"}`,
      `  Accepted: ${response.dispatchAccepted ?? response.ok ?? "N/A"}`,
      `  Mode: ${response.applyMode || "unknown"}:${response.mode || "unknown"}`,
      `  Signal: ${response.dispatchSignal || evidence.ackSignal || "none"}`,
      `  Error code: ${response.dispatchErrorCode || "none"}`,
      `  Error: ${response.error || "none"}`,
      `  Expected (hash): ${ackDebug?.baseline?.expectedHash || evidence.expectedHash || "N/A"}`,
      `  Baseline:`,
      `    userHash: ${ackDebug?.baseline?.userHash || evidence.baselineUserHash || "N/A"}`,
      `    composerText: ${preview(ackDebug?.baseline?.composerText ?? evidence.baselineComposerPreview)}`,
      `    generating: ${ackDebug?.baseline?.generating ?? evidence.baselineGenerating ?? "N/A"}`,
      `  Evidence:`,
      `    currentUserHash: ${evidence.currentUserHash || "N/A"}`,
      `    currentGenerating: ${evidence.currentGenerating ?? "N/A"}`,
      `    payloadReleased: ${evidence.payloadReleased ?? "N/A"}`,
      `    textChanged: ${evidence.textChanged ?? "N/A"}`,
      `    buttonStateChanged: ${evidence.buttonStateChanged ?? "N/A"}`,
      `    attempts: ${evidence.attempts ?? "N/A"}`,
      `    latestUser: ${preview(evidence.latestUserPreview)}`
    );
  }
  if (runtimeEvents.length > 0) {
    lines.push("", "Runtime Events:");
    for (const event of runtimeEvents.slice(-10)) {
      lines.push(
        `  ${formatTimestamp(event.timestamp)} [${event.level ?? "info"}:${event.category ?? "runtime"}] ${event.phaseStep} ${event.sourceRole ?? "-"}->${event.targetRole ?? "-"} r${event.round}`,
        `    summary: ${event.dispatchReadbackSummary}`,
        `    mode: ${event.sendTriggerMode}`,
        `    baseline: ${event.verificationBaseline}`,
        `    poll: ${event.verificationPollSample}`,
        `    verdict: ${event.verificationVerdict}`
      );
    }
  }
  lines.push(
    "",
    "Structured Debug Report:",
    JSON.stringify(
      buildDebugReport({
        state,
        overlaySettings: model.overlaySettings,
        recentRuntimeEvents: runtimeEvents
      }),
      null,
      2
    )
  );
  return lines.join("\n");
}
function resolveAckDebugTarget(model, fallbackTabId) {
  const { state } = model;
  const role = state.activeHop?.targetRole ?? state.runtimeActivity.targetRole ?? model.currentTab?.assignedRole ?? null;
  const tabId = state.activeHop?.targetTabId ?? (role ? state.bindings[role]?.tabId ?? null : null) ?? fallbackTabId;
  return {
    role,
    tabId,
    source: state.activeHop?.targetTabId ? "active-hop" : role && state.bindings[role]?.tabId ? "runtime-target-role" : "active-tab"
  };
}
function formatTimestamp(value) {
  if (!value) {
    return "N/A";
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}
function formatFileTimestamp(value) {
  return value.toISOString().replace(/[:.]/g, "-");
}
function formatRoundProgress(enabled, round, maxRounds) {
  return `${round} / ${enabled ? maxRounds : "\u221E"}`;
}
function preview(value) {
  const text = String(value ?? "");
  if (!text) {
    return "N/A";
  }
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}
function summarizeBinding(copy, binding) {
  if (!binding) {
    return copy.unbound;
  }
  const label = binding.urlInfo?.kind === "project" ? copy.projectThreadLabel : copy.threadLabel;
  return `${binding.title || label} (#${binding.tabId})`;
}
async function updateMaxRounds(value) {
  const maxRounds = clampMaxRounds(value);
  setMaxRoundsControl(maxRounds, elements.maxRoundsEnabledCheckbox.checked);
  await perform({
    type: MESSAGE_TYPES.SET_RUNTIME_SETTINGS,
    settings: {
      maxRounds
    }
  });
}
function setMaxRoundsControl(value, enabled) {
  const maxRounds = clampMaxRounds(value);
  elements.maxRoundsRange.value = String(maxRounds);
  elements.maxRoundsEnabledCheckbox.checked = enabled;
  elements.maxRoundsRange.closest(".popup__round-control")?.setAttribute(
    "data-unlimited",
    String(!enabled)
  );
  renderMaxRoundsValue(maxRounds, enabled);
}
function renderMaxRoundsValue(value, enabled = elements.maxRoundsEnabledCheckbox.checked) {
  elements.maxRoundsValue.textContent = enabled ? String(clampMaxRounds(value)) : "\u221E";
}
function clampMaxRounds(value) {
  if (!Number.isFinite(value)) {
    return 8;
  }
  return Math.min(MAX_MAX_ROUNDS, Math.max(MIN_MAX_ROUNDS, Math.round(value)));
}
async function sendMessage(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response.ok) {
    throw new Error("error" in response ? response.error : "runtime_message_failed");
  }
  return response.result;
}
function startAutoRefresh() {
  if (refreshTimerId !== null) {
    return;
  }
  refreshTimerId = window.setInterval(() => {
    void refresh().catch((error) => {
      console.error("Refresh failed:", error);
    });
  }, REFRESH_INTERVAL_MS);
  window.addEventListener("beforeunload", () => {
    if (refreshTimerId !== null) {
      window.clearInterval(refreshTimerId);
      refreshTimerId = null;
    }
  }, { once: true });
}
function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required popup element: ${selector}`);
  }
  return element;
}
function toNullableRole(value) {
  return value === "A" || value === "B" ? value : null;
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
