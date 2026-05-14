import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { binaryInfo, launchPersistentContext } from "cloakbrowser";

import {
  attemptRecoverableAuthRecovery,
  classifyExtensionLoadedEvidence,
  collectOverlayEvidence,
  collectPopupEvidence,
  deriveExtensionIdFromServiceWorkers,
  ensureOverlay,
  getExtensionId,
  probeChatGptAuthState,
  readFlag,
  readPathFlag,
  waitForExtensionServiceWorkers
} from "./_playwright-bridge-helpers.mjs";

const OUT_DIR = path.resolve(process.cwd(), "tmp", "cloakbrowser-smoke");
const SUMMARY_PATH = path.join(OUT_DIR, "summary.json");
const SCREENSHOT_PATH = path.join(OUT_DIR, "chatgpt-page.png");
const TARGET_URL = readFlag("--url") || "https://chatgpt.com";
const EXTENSION_PATH = readPathFlag("--path") || path.resolve(process.cwd(), "dist/extension");
const PROFILE_DIR =
  readPathFlag("--profile-dir") ||
  process.env.CLOAKBROWSER_PROFILE_DIR ||
  path.resolve(process.env.HOME || process.cwd(), ".chatgpt-cloakbrowser-profile");
const FINGERPRINT_SEED = process.env.CLOAKBROWSER_FINGERPRINT_SEED || "76421";
const INTERACTIVE = process.argv.includes("--interactive");

function log(message) {
  console.log(`[cloakbrowser-smoke] ${message}`);
}

async function waitForManualLogin() {
  log("CloakBrowser persistent profile is open. Log into ChatGPT in that window, then press Enter here.");
  await new Promise((resolve) => process.stdin.once("data", resolve));
}

async function launchCloakProfile() {
  return await launchPersistentContext({
    userDataDir: PROFILE_DIR,
    headless: false,
    args: [
      `--fingerprint=${FINGERPRINT_SEED}`,
      "--fingerprint-platform=windows",
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--password-store=basic",
      "--enable-unsafe-extension-debugging"
    ]
  });
}

async function openAndProbe(context) {
  const page =
    context.pages().find((candidate) => candidate.url().startsWith("https://chatgpt.com")) ||
    (await context.newPage());
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const auth = await probeChatGptAuthState(page);
  return { page, auth };
}

async function probeAndRecoverAuth(page) {
  const initialAuth = await probeChatGptAuthState(page);
  const isRecoverableGate =
    initialAuth.status === "recoverable_account_selection_gate" ||
    initialAuth.status === "recoverable_auth_cta_with_shell";

  if (!isRecoverableGate) {
    return {
      initialAuth,
      auth: initialAuth,
      recovered: false,
      recoveryStatus: initialAuth.status,
      isRecoverableGate: false
    };
  }

  const recovery = await attemptRecoverableAuthRecovery(page);
  if (recovery.recovered) {
    const finalAuth = await probeChatGptAuthState(page);
    return {
      initialAuth,
      auth: finalAuth,
      recovered: true,
      recoveryStatus: recovery.status,
      isRecoverableGate: true
    };
  }

  return {
    initialAuth,
    auth: initialAuth,
    recovered: false,
    recoveryStatus: recovery.status,
    isRecoverableGate: true
  };
}

async function collectInfrastructureEvidence(context, page) {
  await ensureOverlay(page);
  const overlay = await collectOverlayEvidence(page);
  const serviceWorkers = await waitForExtensionServiceWorkers(context);
  const serviceWorker = {
    ok: serviceWorkers.length > 0,
    count: serviceWorkers.length,
    urls: serviceWorkers.map((worker) => worker.url())
  };
  const extensionId =
    overlay.dataset.extensionId ||
    deriveExtensionIdFromServiceWorkers(serviceWorkers) ||
    (await getExtensionId(page));
  const popup = await collectPopupEvidence(context, extensionId);

  return {
    serviceWorker,
    overlay,
    popup,
    extensionId,
    extensionLoaded: serviceWorker.ok && overlay.ok && popup.ok && popup.runtimePing.ok
  };
}

async function closeContext(context) {
  await context?.close?.().catch(() => {});
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  let summary = {};
  let firstContext = null;
  let bootstrapPerformed = false;

  try {
    firstContext = await launchCloakProfile();
    let { page, auth } = await openAndProbe(firstContext);

    if (!auth.authenticated && INTERACTIVE) {
      bootstrapPerformed = true;
      await waitForManualLogin();
      await page.waitForTimeout(3000);
      auth = await probeChatGptAuthState(page);
    }

    const firstAuth = auth;
    await closeContext(firstContext);
    firstContext = null;

    const secondContext = await launchCloakProfile();
    try {
      const reopened = await openAndProbe(secondContext);
      const {
        initialAuth,
        auth: finalAuth,
        recovered,
        recoveryStatus,
        isRecoverableGate
      } = await probeAndRecoverAuth(reopened.page);

      const infrastructure = await collectInfrastructureEvidence(secondContext, reopened.page);
      await reopened.page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});

      const extensionEvidence = classifyExtensionLoadedEvidence({
        serviceWorkerOk: infrastructure.serviceWorker.ok,
        overlayOk: infrastructure.overlay.ok,
        popupOk: infrastructure.popup.ok,
        runtimePingOk: infrastructure.popup.runtimePing.ok
      });

      const loggedIn =
        finalAuth.authenticated &&
        finalAuth.status !== "recoverable_account_selection_gate" &&
        finalAuth.status !== "recoverable_auth_cta_with_shell";
      const pageTestable = loggedIn && extensionEvidence.ok;
      const verdict = pageTestable ? "PASS" : "FAIL";

      summary = {
        timestamp: new Date().toISOString(),
        verdict,
        carrier: {
          primary: "cloakbrowser-persistent-profile",
          profileDir: PROFILE_DIR,
          extensionPath: EXTENSION_PATH,
          targetUrl: TARGET_URL,
          fingerprintSeed: FINGERPRINT_SEED,
          bootstrapPerformed,
          binary: binaryInfo()
        },
        firstLaunch: {
          auth: {
            ok: firstAuth.authenticated,
            status: firstAuth.status,
            evidence: firstAuth.evidence,
            url: firstAuth.url,
            markers: firstAuth.markers
          }
        },
        finalLaunch: {
          loggedIn,
          initialAuthStatus: initialAuth.status,
          auth: {
            ok: finalAuth.authenticated,
            status: finalAuth.status,
            evidence: finalAuth.evidence,
            url: finalAuth.url,
            title: finalAuth.title,
            markers: finalAuth.markers
          },
          recovery: {
            attempted: isRecoverableGate,
            recovered,
            status: recoveryStatus
          },
          extensionLoaded: extensionEvidence.ok,
          extensionEvidenceMode: extensionEvidence.mode,
          pageTestable,
          serviceWorker: infrastructure.serviceWorker,
          overlay: infrastructure.overlay,
          popup: infrastructure.popup,
          extensionId: infrastructure.extensionId
        },
        artifacts: {
          summary: SUMMARY_PATH,
          screenshot: SCREENSHOT_PATH
        }
      };
    } finally {
      await closeContext(secondContext);
    }
  } catch (error) {
    summary = {
      timestamp: new Date().toISOString(),
      verdict: "FAIL",
      carrier: {
        primary: "cloakbrowser-persistent-profile",
        profileDir: PROFILE_DIR,
        extensionPath: EXTENSION_PATH,
        targetUrl: TARGET_URL,
        fingerprintSeed: FINGERPRINT_SEED,
        bootstrapPerformed,
        binary: binaryInfo()
      },
      error: error instanceof Error ? error.message : String(error),
      artifacts: {
        summary: SUMMARY_PATH,
        screenshot: SCREENSHOT_PATH
      }
    };
  } finally {
    await closeContext(firstContext);
    await fs.writeFile(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  log(`verdict: ${summary.verdict}`);
  console.log(JSON.stringify(summary, null, 2));

  if (summary.verdict !== "PASS") {
    process.exitCode = 1;
  }
}

await main();
