import test from "node:test";
import assert from "node:assert/strict";

import { ERROR_REASONS, STOP_REASONS } from "../src/extension/core/constants.ts";
import {
  describeErrorReason,
  describeIssueReason,
  describeStopReason
} from "../src/extension/core/reason-catalog.ts";

test("describeStopReason covers every STOP_REASONS value with Chinese guidance", () => {
  for (const reason of Object.values(STOP_REASONS)) {
    const description = describeStopReason(reason);

    assert.equal(description.reason, reason);
    assert.ok(description.title.length > 0);
    assert.ok(description.summary.length > 0);
    assert.ok(description.nextAction.length > 0);
    assert.ok(["info", "warning", "error"].includes(description.severity));
    assert.doesNotMatch(description.title, /^[A-Za-z ]+$/);
  }
});

test("describeErrorReason covers every ERROR_REASONS value", () => {
  for (const reason of Object.values(ERROR_REASONS)) {
    const description = describeErrorReason(reason);

    assert.equal(description.reason, reason);
    assert.equal(description.severity, "error");
    assert.ok(description.summary.length > 0);
    assert.ok(description.nextAction.length > 0);
  }
});

test("colon-suffixed reasons resolve to their stable base reason", () => {
  assert.equal(
    describeErrorReason("message_send_failed:payload_not_applied").reason,
    ERROR_REASONS.MESSAGE_SEND_FAILED
  );
  assert.equal(
    describeStopReason("unreachable_target:tab_loading").reason,
    STOP_REASONS.UNREACHABLE_TARGET
  );
});

test("describeIssueReason prefers known error reasons over stop fallback", () => {
  const description = describeIssueReason("message_send_failed:payload_not_applied");

  assert.equal(description.reason, ERROR_REASONS.MESSAGE_SEND_FAILED);
  assert.equal(description.severity, "error");
});

test("unknown reasons return stable Chinese fallback", () => {
  const description = describeStopReason("not_real:extra");

  assert.equal(description.reason, "unknown_stop_reason");
  assert.equal(description.severity, "warning");
  assert.match(description.summary, /未识别/);
});
