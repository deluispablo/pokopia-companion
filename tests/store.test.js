import assert from "node:assert/strict";
import { test } from "node:test";
import { blankMarks, cleanMarks, countMarks, countToday, isMarksFile, mergeMarks } from "../src/store.js";

const known = {
  pok: new Set(["Pikachu", "Eevee"]),
  hab: new Set(["Herbazal verde"]),
  rec: new Set(["Sopa básica"]),
  items: new Map([[10, []], [20, []]]),
  craft: new Map([[10, []]]),
  homes: new Set(["Isla Nube", "Bahía Borrasca"]),
};

test("isMarksFile wants version 1 and at least one list", () => {
  assert.equal(isMarksFile({ v: 1, pok: [] }), true);
  assert.equal(isMarksFile({ v: 1, craft: [10] }), true);
  assert.equal(isMarksFile({ v: 1 }), false);
  assert.equal(isMarksFile({ v: 2, pok: [] }), false);
  assert.equal(isMarksFile([]), false);
  assert.equal(isMarksFile(null), false);
  assert.equal(isMarksFile("pok"), false);
});

test("cleanMarks keeps only known things, once each", () => {
  const m = cleanMarks({
    v: 1,
    pok: ["Pikachu", "Pikachu", "Mewtwo"],
    hab: ["Herbazal verde", 3],
    items: [10, 99, "10"],
    craft: [10, 20],
    rec: "not a list",
  }, known);
  assert.deepEqual(m.pok, ["Pikachu"]);
  assert.deepEqual(m.hab, ["Herbazal verde"]);
  assert.deepEqual(m.items, [10]);
  assert.deepEqual(m.craft, [10]);
  assert.deepEqual(m.rec, []);
});

test("cleanMarks keeps known homes and finite times, and drops __proto__", () => {
  const raw = JSON.parse('{"v":1,"pok":[],"zone":{"Pikachu":"Isla Nube","Eevee":"Atlantis","Mew":"Isla Nube",'
    + '"__proto__":"Isla Nube"},"at":{"pok:Pikachu":5,"pok:Eevee":"5","x":null,"__proto__":1}}');
  const m = cleanMarks(raw, known);
  assert.deepEqual(m.zone, { Pikachu: "Isla Nube" });
  assert.deepEqual(m.at, { "pok:Pikachu": 5 });
  assert.equal(Object.getPrototypeOf(m.zone), Object.prototype);
});

test("mergeMarks joins lists and lets the first set win where both say something", () => {
  const base = { ...blankMarks(), pok: ["Pikachu"], zone: { Pikachu: "Isla Nube" }, at: { "pok:Pikachu": 1 } };
  const extra = {
    ...blankMarks(), pok: ["Pikachu", "Eevee"], items: [10],
    zone: { Pikachu: "Bahía Borrasca", Eevee: "Isla Nube" }, at: { "pok:Pikachu": 2, "pok:Eevee": 3 },
  };
  const m = mergeMarks(base, extra);
  assert.deepEqual(m.pok, ["Pikachu", "Eevee"]);
  assert.deepEqual(m.items, [10]);
  assert.deepEqual(m.zone, { Pikachu: "Isla Nube", Eevee: "Isla Nube" });
  assert.deepEqual(m.at, { "pok:Pikachu": 1, "pok:Eevee": 3 });
  assert.equal(countMarks(m), 3);
});

test("countToday counts marks since local midnight", () => {
  const now = new Date(2026, 10, 16, 15, 0);
  const at = { a: +new Date(2026, 10, 16, 0, 0), b: +new Date(2026, 10, 16, 14, 0), c: +new Date(2026, 10, 15, 23, 59) };
  assert.equal(countToday(at, now), 2);
});
