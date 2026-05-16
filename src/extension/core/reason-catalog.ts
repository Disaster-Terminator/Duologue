import { ERROR_REASONS, STOP_REASONS } from "./constants.ts";

export type ReasonSeverity = "info" | "warning" | "error";

export interface ReasonDescription {
  title: string;
  severity: ReasonSeverity;
  summary: string;
  nextAction: string;
  reason: string;
}

const UNKNOWN_STOP_REASON = "unknown_stop_reason";
const UNKNOWN_ERROR_REASON = "unknown_error_reason";

const stopReasonDescriptions: Record<string, Omit<ReasonDescription, "reason">> = {
  [STOP_REASONS.USER_STOP]: {
    title: "用户停止",
    severity: "info",
    summary: "桥接由用户手动停止。",
    nextAction: "需要继续时重新开始会话。"
  },
  [STOP_REASONS.STOP_MARKER]: {
    title: "收到停止标记",
    severity: "info",
    summary: "目标回复包含配置的停止标记，桥接按规则结束。",
    nextAction: "检查最新回复；如果还要继续，调整上下文后重新启动。"
  },
  [STOP_REASONS.MAX_ROUNDS]: {
    title: "达到轮数上限",
    severity: "warning",
    summary: "桥接已达到当前设置的最大轮数。",
    nextAction: "如果需要更多轮次，提高轮数限制或手动继续。"
  },
  [STOP_REASONS.DUPLICATE_OUTPUT]: {
    title: "检测到重复输出",
    severity: "warning",
    summary: "输出没有产生有效变化，桥接为避免循环而停止。",
    nextAction: "检查两侧提示是否陷入重复，再用新的上下文继续。"
  },
  [STOP_REASONS.STARTER_EMPTY]: {
    title: "起始回复为空",
    severity: "warning",
    summary: "启动时起始侧没有可转发的 assistant 回复。",
    nextAction: "先让起始侧产生一条回复，或切换起始侧后再启动。"
  },
  [STOP_REASONS.HOP_TIMEOUT]: {
    title: "单跳超时",
    severity: "warning",
    summary: "某一跳在超时窗口内没有观察到可接受的回复完成信号。",
    nextAction: "确认目标页仍可响应；如果页面没有继续生成，刷新页面或重新绑定后再试。"
  },
  [STOP_REASONS.TARGET_HIDDEN_NO_GENERATION]: {
    title: "隐藏目标页未开始生成",
    severity: "warning",
    summary: "目标页处于隐藏或非活跃状态，提交后没有观察到生成开始。",
    nextAction: "让两个目标页保持活跃，或使用页面保活方案后重试。"
  },
  [STOP_REASONS.REPLY_OBSERVATION_MISSING]: {
    title: "回复观察缺失",
    severity: "warning",
    summary: "提交后无法读取到目标页的 assistant 回复事实。",
    nextAction: "检查目标线程是否仍在正确页面，刷新后重新绑定再试。"
  },
  [STOP_REASONS.WRONG_TARGET]: {
    title: "目标标签不匹配",
    severity: "warning",
    summary: "当前观察到的标签不是本跳期望的目标标签。",
    nextAction: "检查 A/B 绑定和当前标签页，必要时清空后重新绑定。"
  },
  [STOP_REASONS.STALE_TARGET]: {
    title: "目标线程已变更",
    severity: "warning",
    summary: "目标标签仍可访问，但它的线程身份已经不是本跳期望的线程。",
    nextAction: "回到正确线程或重新绑定当前线程。"
  },
  [STOP_REASONS.UNREACHABLE_TARGET]: {
    title: "目标页不可达",
    severity: "warning",
    summary: "扩展无法从目标标签页读取运行时观察样本，常见于页面加载中、内容脚本失联或标签页异常。",
    nextAction: "查看 runtime log 中的 tab_status、tab_url、pending_url 和 observation_error；刷新异常页面后重试。"
  },
  [STOP_REASONS.BINDING_INVALID]: {
    title: "绑定失效",
    severity: "warning",
    summary: "保存的 A/B 标签绑定已不能满足当前运行要求。",
    nextAction: "清空状态并重新绑定两个 ChatGPT 标签页。"
  },
  [STOP_REASONS.STARTER_SETTLE_TIMEOUT]: {
    title: "起始页稳定超时",
    severity: "warning",
    summary: "启动前等待起始页稳定时超时。",
    nextAction: "等待页面加载完成后再启动。"
  },
  [STOP_REASONS.TARGET_SETTLE_TIMEOUT]: {
    title: "目标页稳定超时",
    severity: "warning",
    summary: "目标页没有在预期时间内进入可操作状态。",
    nextAction: "刷新目标页，确认输入框可用后重试。"
  },
  [STOP_REASONS.SUBMISSION_NOT_VERIFIED]: {
    title: "提交未被验证",
    severity: "warning",
    summary: "扩展触发了提交动作，但没有观察到目标线程新增用户消息或生成开始的可信证据。",
    nextAction: "重点检查 composer 是否异常、消息是否被页面清空、以及 ack debug 中的 payload/readback 字段。"
  }
};

const errorReasonDescriptions: Record<string, Omit<ReasonDescription, "reason">> = {
  [ERROR_REASONS.SELECTOR_FAILURE]: {
    title: "选择器失败",
    severity: "error",
    summary: "页面上缺少扩展执行操作所需的元素。",
    nextAction: "刷新页面，等 ChatGPT UI 完全加载后重试。"
  },
  [ERROR_REASONS.MESSAGE_SEND_FAILED]: {
    title: "消息发送失败",
    severity: "error",
    summary: "扩展未能把 relay payload 成功写入并提交到目标页。",
    nextAction: "检查输入框是否可编辑、发送按钮是否可用，以及页面是否处于异常加载状态。"
  },
  [ERROR_REASONS.UNSUPPORTED_TAB]: {
    title: "不支持的标签页",
    severity: "error",
    summary: "当前标签页不是支持的 ChatGPT 线程或 live session。",
    nextAction: "打开支持的 ChatGPT 页面后重新绑定。"
  },
  [ERROR_REASONS.EMPTY_ASSISTANT_REPLY]: {
    title: "assistant 回复为空",
    severity: "error",
    summary: "源页面没有可转发的 assistant 回复内容。",
    nextAction: "等待源页面回复完成，或换一个已有回复的线程作为起始侧。"
  },
  [ERROR_REASONS.INTERNAL_ERROR]: {
    title: "内部错误",
    severity: "error",
    summary: "桥接运行时出现未预期的内部异常。",
    nextAction: "保留调试日志，刷新页面后重试；如果复现，把日志交给 agent 分析。"
  }
};

function normalizeReason(reason: string | null | undefined): string | null {
  if (typeof reason !== "string") {
    return null;
  }

  const [baseReason] = reason.split(":", 1);
  return baseReason?.trim() || null;
}

function describeReason(
  reason: string | null | undefined,
  catalog: Record<string, Omit<ReasonDescription, "reason">>,
  unknownReason: string,
  fallback: Omit<ReasonDescription, "reason">
): ReasonDescription {
  const normalizedReason = normalizeReason(reason);
  if (!normalizedReason || !catalog[normalizedReason]) {
    return { ...fallback, reason: unknownReason };
  }

  return { ...catalog[normalizedReason], reason: normalizedReason };
}

export function describeStopReason(reason: string | null | undefined): ReasonDescription {
  return describeReason(reason, stopReasonDescriptions, UNKNOWN_STOP_REASON, {
    title: "未知停止原因",
    severity: "warning",
    summary: "桥接因为未识别的停止原因结束。",
    nextAction: "查看最新 runtime event 和调试快照，再决定是否重试。"
  });
}

export function describeErrorReason(reason: string | null | undefined): ReasonDescription {
  return describeReason(reason, errorReasonDescriptions, UNKNOWN_ERROR_REASON, {
    title: "未知错误",
    severity: "error",
    summary: "桥接遇到未识别的错误原因。",
    nextAction: "保留日志并重试；如果重复出现，按最新 runtime event 继续排查。"
  });
}

export function describeIssueReason(reason: string | null | undefined): ReasonDescription {
  const normalizedReason = normalizeReason(reason);
  return normalizedReason && errorReasonDescriptions[normalizedReason]
    ? describeErrorReason(normalizedReason)
    : describeStopReason(normalizedReason);
}
