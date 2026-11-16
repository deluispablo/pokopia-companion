import assert from "node:assert/strict";
import { test } from "node:test";
import { entryHash, housesHash, parseHash, parseHouse } from "../src/router.js";

const pokemon = [{ n: "Bulbasaur" }, { n: "Ivysaur" }, { n: "Shellos (West Sea)" }, { n: "Pidgey" }, { n: "Pidgeot" }];

test("parseHash reads the tab and the id", () => {
  assert.deepEqual(parseHash("#pok/Ivysaur"), { tab: "pok", id: "Ivysaur" });
  assert.deepEqual(parseHash("#obj/1052"), { tab: "obj", id: "1052" });
  assert.deepEqual(parseHash("#hab/Herbazal%20verde"), { tab: "hab", id: "Herbazal verde" });
  assert.deepEqual(parseHash("#casa/rep"), { tab: "casa", id: "rep" });
  assert.deepEqual(parseHash("#rec"), { tab: "rec", id: "" });
});

test("parseHash falls back to the Pokémon list", () => {
  assert.deepEqual(parseHash(""), { tab: "pok", id: "" });
  assert.deepEqual(parseHash("#nope/x"), { tab: "pok", id: "x" });
  assert.deepEqual(parseHash("#%E0%A4%A"), { tab: "pok", id: "" });
});

test("an id may contain slashes", () => {
  assert.deepEqual(parseHash("#rec/a/b"), { tab: "rec", id: "a/b" });
});

test("parseHouse takes names or indexes, once each, at most four", () => {
  assert.deepEqual(parseHouse("Pidgey,Pidgeot", pokemon), [3, 4]);
  assert.deepEqual(parseHouse("0,1", pokemon), [0, 1]);
  assert.deepEqual(parseHouse("Ivysaur,1,Nobody,99,,Bulbasaur", pokemon), [1, 0]);
  assert.deepEqual(parseHouse("0,1,2,3,4", pokemon), [0, 1, 2, 3]);
  assert.deepEqual(parseHouse("", pokemon), []);
});

test("hashes round-trip through parseHash", () => {
  assert.equal(entryHash("hab", "Herbazal verde"), "hab/Herbazal%20verde");
  assert.deepEqual(parseHash("#" + entryHash("obj", 1052)), { tab: "obj", id: "1052" });
  assert.equal(housesHash("design", [2, 0], pokemon), "casa/Shellos%20(West%20Sea),Bulbasaur");
  assert.equal(housesHash("design", [], pokemon), "casa");
  assert.equal(housesHash("split", [1], pokemon), "casa/rep");
  const { id } = parseHash("#" + housesHash("design", [2, 0], pokemon));
  assert.deepEqual(parseHouse(id, pokemon), [2, 0]);
});
