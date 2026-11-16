import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { dictionaries, setLanguage, t } from "../src/i18n/index.js";

const { es, en } = dictionaries;
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("every key exists in both languages", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
});

test("translations use the same placeholders", () => {
  for (const key of Object.keys(es)) assert.deepEqual(placeholders(en[key]), placeholders(es[key]), key);
});

test("every literal key the code uses is defined", () => {
  const src = new URL("../src/", import.meta.url).pathname;
  const files = [];
  const walk = (dir) => readdirSync(dir).forEach((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".js") && !path.includes("/i18n/")) files.push(path);
  });
  walk(src);
  const namespaces = [...new Set(Object.keys(es).map((k) => k.split(".")[0]))].join("|");
  const keyPattern = new RegExp(`"((?:${namespaces})\\.[A-Za-z]+)"`, "g");
  for (const file of files) {
    for (const [, key] of readFileSync(file, "utf8").matchAll(keyPattern)) assert.ok(key in es, `${key} in ${file}`);
  }
});

test("t fills placeholders and falls back to Spanish", () => {
  setLanguage("en");
  assert.equal(t("progress.here", { n: 2, m: 5 }), "here 2 of 5");
  setLanguage("fr");
  assert.equal(t("progress.here", { n: 2, m: 5 }), "aquí 2 de 5");
  assert.equal(t("no.such.key"), "no.such.key");
  setLanguage("es");
});
