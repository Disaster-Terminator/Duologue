import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CHATGPT_MATCH = "https://chatgpt.com/*";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

for (const manifestPath of ["src/extension/manifest.json", "dist/extension/manifest.json"]) {
  test(`${manifestPath} uses Duologue as the extension name`, async () => {
    const manifest = await readJson(manifestPath);

    assert.equal(manifest.name, "Duologue");
    assert.equal(manifest.action.default_title, "Duologue");
  });

  test(`${manifestPath} injects only on ChatGPT by default`, async () => {
    const manifest = await readJson(manifestPath);

    assert.deepEqual(manifest.host_permissions, [CHATGPT_MATCH]);
    assert.equal(
      manifest.host_permissions.includes("<all_urls>"),
      false,
      "host_permissions must not request all URLs"
    );
    assert.equal(manifest.content_scripts.length, 1);
    assert.deepEqual(manifest.content_scripts[0].matches, [CHATGPT_MATCH]);
    assert.equal(
      manifest.content_scripts[0].matches.includes("<all_urls>"),
      false,
      "content script must not inject on all URLs"
    );
  });
}
