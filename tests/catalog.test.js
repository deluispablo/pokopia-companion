import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCatalog, ZONES } from "../src/catalog.js";
import { loadGameGlobals } from "./helpers/game-data.js";

const game = buildCatalog(loadGameGlobals());

test("every list has entries", () => {
  for (const kind of ["pok", "hab", "obj", "rec"]) assert.ok(game.entries[kind].length > 0, kind);
  assert.ok(game.items.length > game.entries.obj.length, "items collapse to one card per name");
  assert.ok(game.homes.length > 0 && game.environments.length > 0 && game.specialties.length > 0);
  assert.ok(game.tags.length > 0);
});

test("entries have unique ids and a known group", () => {
  for (const kind of ["pok", "hab", "obj", "rec"]) {
    const ids = game.entries[kind].map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, kind);
    for (const e of game.entries[kind]) assert.ok(game.groups[kind].includes(e.group), `${kind} ${e.id} ${e.group}`);
  }
  assert.ok(game.entries.pok.every((e) => ZONES.includes(e.group)));
});

test("lookups find what the routes and detail pages link to", () => {
  const ivysaur = game.findEntry("pok", "Ivysaur");
  assert.equal(ivysaur.kind, "pok");
  assert.ok(ivysaur.o.habs.length > 0);
  const card = game.entries.obj[0];
  assert.equal(game.itemEntry(card.id), card);
  assert.equal(game.itemEntryByName(card.name.toUpperCase()), card);
  assert.ok(game.entries.obj.some((e) => e.craft), "some items have a recipe");
  assert.ok(game.known.pok.has("Ivysaur") && game.known.items.has(card.id));
});

test("missing globals give an empty catalog instead of failing", () => {
  const empty = buildCatalog({});
  assert.equal(empty.entries.pok.length, 0);
  assert.equal(empty.findEntry("pok", "Ivysaur"), undefined);
});

test("the collection follows the game's menu", () => {
  const count = (kind, group) => game.entries[kind].filter((e) => e.group === group).length;
  assert.deepEqual([count("art", "large"), count("art", "small"), count("art", "fossil")], [51, 46, 22]);
  assert.equal(game.entries.art.filter((e) => e.basin).length, 14);
  assert.equal(game.entries.hr.length, 157);
  assert.equal(count("hr", "photo"), 18);
  assert.equal(game.entries.shot.length, 50);
  assert.ok(game.entries.ins.length > 0 && game.entries.ins.every((e) => e.set === "craft"));
  for (const kind of ["art", "hr", "shot", "ins"]) {
    const ids = game.entries[kind].map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, kind);
    for (const e of game.entries[kind]) assert.ok(game.groups[kind].includes(e.group), `${kind} ${e.id} ${e.group}`);
    assert.equal(game.findEntry(kind, ids[0]).kind, kind);
  }
  assert.ok(!game.entries.obj.some((e) => e.group === "Edificios especiales"), "the game's catalog has no buildings");
  assert.equal(game.known.shots.size, 50);
});

test("a habitat names the Pokémon it attracts", () => {
  const herbazal = game.findEntry("hab", "Herbazal verde");
  const names = game.visitorsOf(herbazal);
  assert.ok(names.length > 0 && names.every((n) => game.known.pok.has(n)));
  assert.deepEqual(game.visitorsOf({ o: {} }), []);
});
