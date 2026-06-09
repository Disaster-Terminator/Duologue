import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const popupHtml = await readFile(new URL("../src/extension/popup.html", import.meta.url), "utf8");
const popupCss = await readFile(new URL("../src/extension/popup.css", import.meta.url), "utf8");
const popupTs = await readFile(new URL("../src/extension/popup.ts", import.meta.url), "utf8");

test("popup keeps session controls immediately after status", () => {
  const statusIndex = popupHtml.indexOf('popup__section--status');
  const sessionIndex = popupHtml.indexOf('popup__section--session');
  const bindingsIndex = popupHtml.indexOf('popup__section--bindings');
  const runtimeIndex = popupHtml.indexOf('data-copy="sectionRuntime"');

  assert.notEqual(statusIndex, -1);
  assert.notEqual(sessionIndex, -1);
  assert.notEqual(bindingsIndex, -1);
  assert.notEqual(runtimeIndex, -1);
  assert.ok(statusIndex < bindingsIndex);
  assert.ok(statusIndex < sessionIndex);
  assert.ok(sessionIndex < bindingsIndex);
  assert.ok(bindingsIndex < runtimeIndex);
});

test("popup binding section presents bind actions before bound-tab summaries", () => {
  const bindingsStart = popupHtml.indexOf('popup__section--bindings');
  const bindingsEnd = popupHtml.indexOf('data-copy="sectionRuntime"');
  const bindingsSection = popupHtml.slice(bindingsStart, bindingsEnd);

  assert.ok(bindingsSection.indexOf('id="currentTabStatus"') < bindingsSection.indexOf('id="bindAButton"'));
  assert.ok(bindingsSection.indexOf('id="bindAButton"') < bindingsSection.indexOf('id="bindingA"'));
  assert.ok(bindingsSection.indexOf('id="bindBButton"') < bindingsSection.indexOf('id="bindingB"'));
});

test("popup binding emphasis is state-driven instead of always highlighted", () => {
  assert.match(popupCss, /\.popup__btn--bind\[data-current="true"\]/);
  assert.match(popupCss, /\.popup__btn--bind\[data-current="true"\]:disabled/);
  assert.match(popupCss, /\.popup__binding-card\[data-bound="true"\]/);

  const bindBaseRule = popupCss.match(/\.popup__btn--bind\s*\{(?<body>[^}]*)\}/)?.groups?.body ?? "";
  assert.doesNotMatch(bindBaseRule, /#ead9a6|201,\s*179,\s*122/);
});

test("popup chrome uses viewport-aware height and clears hidden readiness variant", () => {
  assert.match(popupCss, /max-height:\s*min\(640px,\s*calc\(100vh - 16px\)\);/);
  assert.match(popupTs, /delete elements\.readinessRow\.dataset\.variant;/);
});

test("popup resume override select matches render option writes", () => {
  const overrideSelect = popupHtml.match(/<select class="popup__select" id="overrideSelect">(?<body>[\s\S]*?)<\/select>/)?.groups
    ?.body;

  assert.ok(overrideSelect);
  assert.equal([...overrideSelect.matchAll(/<option\b/g)].length, 3);
  assert.match(overrideSelect, /<option value="">/);
  assert.match(overrideSelect, /<option value="A">/);
  assert.match(overrideSelect, /<option value="B">/);
});
