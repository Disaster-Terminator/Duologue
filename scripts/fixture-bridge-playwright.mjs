import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import {
  bindFromPage,
  cleanupBrowser,
  clickPopupAction,
  ensureOverlay,
  expectBindingState,
  expectPopupActionEnabled,
  expectPopupPhaseState,
  getExtensionId,
  getRuntimeState,
  launchBrowserWithExtension,
  openPopup,
  readOverlayState,
  readPopupState,
  sleep
} from "./_playwright-bridge-helpers.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = path.join(repoRoot, "dist", "extension");
const fixturePath = path.join(repoRoot, "tests", "fixtures", "chatgpt-thread.html");
const fixtureHtml = await readFile(fixturePath, "utf8");
const fixtureUrlPattern = /^https:\/\/chatgpt\.com\/c\/fixture-[ab](?:[?#].*)?$/;
const maxRounds = 4;
const pauseResumeRounds = 3;

async function resolveSystemBrowserExecutablePath() {
  if (process.platform !== "win32") {
    return null;
  }

  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next installed browser candidate.
    }
  }

  return null;
}

async function launchFixtureBrowser() {
  if (process.env.BROWSER_EXECUTABLE_PATH) {
    return await launchBrowserWithExtension({
      extensionPath,
      browserExecutablePath: process.env.BROWSER_EXECUTABLE_PATH
    });
  }

  try {
    await access(chromium.executablePath());
    return await launchBrowserWithExtension({ extensionPath });
  } catch {
    // Use a system browser only when the versioned Playwright browser is absent.
  }

  const browserExecutablePath = await resolveSystemBrowserExecutablePath();
  if (!browserExecutablePath) {
    throw new Error(
      "No browser is available for fixture e2e. Run 'pnpm exec playwright install chromium' " +
        "or set BROWSER_EXECUTABLE_PATH."
    );
  }

  console.warn(`[fixture-e2e] Playwright Chromium unavailable; falling back to ${browserExecutablePath}`);
  return await launchBrowserWithExtension({ extensionPath, browserExecutablePath });
}

async function bindRole(page, popupPage, role) {
  const result = await bindFromPage(page, popupPage, role);
  assert.equal(result.ok, true, `Expected role ${role} binding to succeed: ${result.error || ""}`);
  await expectBindingState(popupPage, role);
}

async function sendRuntimeMessage(popupPage, message) {
  return await popupPage.evaluate(async (payload) => {
    return await chrome.runtime.sendMessage(payload);
  }, message);
}

async function readFullRuntimeState(popupPage) {
  const response = await sendRuntimeMessage(popupPage, { type: "GET_RUNTIME_STATE" });
  assert.equal(response?.ok, true, `Expected runtime state response: ${JSON.stringify(response)}`);
  return response.result;
}

async function readFixtureState(page) {
  return await page.evaluate(() => ({ ...window.__DUOLOGUE_FIXTURE__ }));
}

async function configureRuntime(popupPage, rounds) {
  const response = await sendRuntimeMessage(popupPage, {
    type: "SET_RUNTIME_SETTINGS",
    settings: {
      maxRoundsEnabled: true,
      maxRounds: rounds,
      hopTimeoutMs: 5000,
      pollIntervalMs: 100,
      settleSamplesRequired: 2
    }
  });
  assert.equal(response?.ok, true, `Expected runtime settings update: ${JSON.stringify(response)}`);
}

async function setFixtureReplyDelay(pages, replyDelayMs) {
  await Promise.all(
    pages.map((page) =>
      page.evaluate((delayMs) => {
        window.__DUOLOGUE_FIXTURE__.replyDelayMs = delayMs;
      }, replyDelayMs)
    )
  );
}

async function waitForRelayProgress(pageA, pageB, baselineA, baselineB) {
  await Promise.race([
    pageA.waitForFunction(
      (baseline) => window.__DUOLOGUE_FIXTURE__.acceptedMessages > baseline,
      baselineA,
      { timeout: 10000 }
    ),
    pageB.waitForFunction(
      (baseline) => window.__DUOLOGUE_FIXTURE__.acceptedMessages > baseline,
      baselineB,
      { timeout: 10000 }
    )
  ]);
}

let context = null;
let userDataDir = null;

try {
  const launched = await launchFixtureBrowser();
  context = launched.context;
  userDataDir = launched.userDataDir;

  await context.route(fixtureUrlPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: fixtureHtml
    });
  });

  const existingPages = context.pages();
  const pageA = existingPages[0] ?? await context.newPage();
  const pageB = await context.newPage();

  await Promise.all([
    pageA.goto("https://chatgpt.com/c/fixture-a", { waitUntil: "domcontentloaded" }),
    pageB.goto("https://chatgpt.com/c/fixture-b", { waitUntil: "domcontentloaded" })
  ]);

  await Promise.all([ensureOverlay(pageA), ensureOverlay(pageB)]);

  const extensionId = await getExtensionId(pageA);
  const popupPage = await openPopup(context, extensionId);
  await popupPage.waitForSelector("#phaseBadge");

  await bindRole(pageA, popupPage, "A");
  await bindRole(pageB, popupPage, "B");
  await expectPopupPhaseState(popupPage, "ready");

  await configureRuntime(popupPage, maxRounds);

  await clickPopupAction(popupPage, "start");
  await expectPopupPhaseState(popupPage, "stopped");

  const runtimeState = await readFullRuntimeState(popupPage);
  assert.equal(runtimeState.round, maxRounds);
  assert.equal(runtimeState.lastStopReason, "max_rounds_reached");

  const [fixtureA, fixtureB, popupState, overlayA, overlayB] = await Promise.all([
    readFixtureState(pageA),
    readFixtureState(pageB),
    readPopupState(popupPage),
    readOverlayState(pageA),
    readOverlayState(pageB)
  ]);

  assert.equal(fixtureA.acceptedMessages + fixtureB.acceptedMessages, maxRounds);
  assert.equal(fixtureA.generatedReplies + fixtureB.generatedReplies, maxRounds);
  assert.equal(popupState.phase, "stopped");
  assert.equal(overlayA?.phase, "stopped");
  assert.equal(overlayB?.phase, "stopped");

  const compactState = await getRuntimeState(popupPage);
  assert.equal(compactState.bindings?.A?.url, "https://chatgpt.com/c/fixture-a");
  assert.equal(compactState.bindings?.B?.url, "https://chatgpt.com/c/fixture-b");

  console.log(
    `[fixture-e2e] max-rounds PASS rounds=${runtimeState.round} ` +
      `A=${fixtureA.acceptedMessages}/${fixtureA.generatedReplies} ` +
      `B=${fixtureB.acceptedMessages}/${fixtureB.generatedReplies}`
  );

  await clickPopupAction(popupPage, "clear-terminal");
  await expectPopupPhaseState(popupPage, "ready");
  await configureRuntime(popupPage, pauseResumeRounds);
  await setFixtureReplyDelay([pageA, pageB], 800);

  const pauseBaselineA = await readFixtureState(pageA);
  const pauseBaselineB = await readFixtureState(pageB);
  await clickPopupAction(popupPage, "start");
  await expectPopupActionEnabled(popupPage, "pause");
  try {
    await waitForRelayProgress(
      pageA,
      pageB,
      pauseBaselineA.acceptedMessages,
      pauseBaselineB.acceptedMessages
    );
  } catch (error) {
    const [failedRuntime, failedA, failedB, failedPopup] = await Promise.all([
      readFullRuntimeState(popupPage),
      readFixtureState(pageA),
      readFixtureState(pageB),
      readPopupState(popupPage)
    ]);
    throw new Error(
      `Pause scenario did not dispatch: runtime=${JSON.stringify(failedRuntime)} ` +
        `fixtureA=${JSON.stringify(failedA)} fixtureB=${JSON.stringify(failedB)} ` +
        `popup=${JSON.stringify(failedPopup)}`,
      { cause: error }
    );
  }
  await clickPopupAction(popupPage, "pause");
  await expectPopupPhaseState(popupPage, "paused");

  const [pausedPopup, pausedOverlayA, pausedOverlayB] = await Promise.all([
    readPopupState(popupPage),
    readOverlayState(pageA),
    readOverlayState(pageB)
  ]);
  assert.equal(pausedPopup.phase, "paused");
  assert.equal(pausedOverlayA?.phase, "paused");
  assert.equal(pausedOverlayB?.phase, "paused");

  await clickPopupAction(popupPage, "resume");
  await expectPopupPhaseState(popupPage, "stopped");

  const resumedState = await readFullRuntimeState(popupPage);
  const [resumedFixtureA, resumedFixtureB, resumedOverlayA, resumedOverlayB] = await Promise.all([
    readFixtureState(pageA),
    readFixtureState(pageB),
    readOverlayState(pageA),
    readOverlayState(pageB)
  ]);

  assert.equal(resumedState.round, pauseResumeRounds);
  assert.equal(resumedState.lastStopReason, "max_rounds_reached");
  assert.equal(
    resumedFixtureA.acceptedMessages + resumedFixtureB.acceptedMessages -
      pauseBaselineA.acceptedMessages - pauseBaselineB.acceptedMessages,
    pauseResumeRounds
  );
  assert.equal(
    resumedFixtureA.generatedReplies + resumedFixtureB.generatedReplies -
      pauseBaselineA.generatedReplies - pauseBaselineB.generatedReplies,
    pauseResumeRounds
  );
  assert.equal(resumedOverlayA?.phase, "stopped");
  assert.equal(resumedOverlayB?.phase, "stopped");

  console.log(`[fixture-e2e] pause-resume PASS rounds=${resumedState.round}`);
} finally {
  await sleep(100);
  await cleanupBrowser(context, userDataDir, { removeUserDataDir: true });
}
