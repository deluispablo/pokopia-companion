import assert from "node:assert/strict";
import { test } from "node:test";
import { fit, groupFit, groupLikes, partition, pickByType, rankItems, typeOf } from "../src/logic/houses.js";

const P = [
  { n: "A", env: "Seco", flavor: "dulce", likes: ["madera", "piedra", "agua", "fuego", "viento"] },
  { n: "B", env: "Seco", flavor: "dulce", likes: ["madera", "piedra", "agua", "x1", "x2"] },
  { n: "C", env: "Seco", flavor: "amargo", likes: ["y1", "y2", "y3", "y4", "y5"] },
  { n: "D", env: "Húmedo", flavor: "dulce", likes: ["madera", "z1", "z2", "z3", "z4"] },
  { n: "E", env: "Húmedo", flavor: "", likes: ["madera", "z1", "w1", "w2", "w3"] },
];

test("fit counts shared likes and a shared flavour, out of six", () => {
  assert.equal(fit(P, 0, []), null);
  assert.equal(fit(P, 0, [1]), 4 / 6);
  assert.equal(fit(P, 0, [2]), 0);
  assert.equal(fit(P, 0, [1, 2]), 2 / 6);
  assert.equal(fit(P, 3, [4]), 2 / 6);
});

test("groupFit averages each member's fit to the others", () => {
  assert.equal(groupFit(P, [0, 1]), 4 / 6);
});

test("groupLikes lists the most shared likes first", () => {
  const likes = groupLikes(P, [0, 1, 3]);
  assert.deepEqual(likes[0], ["madera", [0, 1, 2]]);
  assert.deepEqual(likes.find(([l]) => l === "agua"), ["agua", [0, 1]]);
});

test("partition never mixes environments and leaves a loner out", () => {
  const houses = partition(P, [0, 1, 2, 3, 4]);
  for (const house of houses) assert.equal(new Set(house.m.map((k) => P[k].env)).size, 1);
  const housed = houses.flatMap((x) => x.m).sort();
  assert.deepEqual(housed, [0, 1, 2, 3, 4]);
  assert.deepEqual(partition(P, [0]), []);
});

test("rankItems ranks placeable items by residents pleased, one per set of attributes", () => {
  const items = [
    [1, "Silla de madera", "", "Muebles"],
    [2, "Mesa de piedra", "", "Muebles"],
    [3, "Taburete", "", "Muebles"],
    [4, "Manzana", "", "Comida"],
    [5, "Lámpara", "", "Muebles"],
  ];
  const tags = { 1: ["madera"], 2: ["piedra", "agua"], 3: ["madera"], 4: ["madera"], 5: ["nada"] };
  const rows = rankItems(P, [0, 1, 3], items, tags);
  assert.deepEqual(rows.map((r) => r.it[0]), [1, 2]);
  assert.deepEqual(rows[0].per, [1, 1, 1]);
  assert.equal(rows[1].sum, 4);
  assert.deepEqual([...pickByType(rows).keys()], ["Mesa", "Asiento"]); // in TYPE_NAMES order
});

test("typeOf reads the kind of furnishing from the Spanish name", () => {
  assert.equal(typeOf([1, "Cama de paja", "", "Muebles"]), "Cama");
  assert.equal(typeOf([1, "Tejado rojo", "", "Construcción"]), "Tejado");
  assert.equal(typeOf([1, "Tablón", "", "Materiales"]), "Materiales");
  assert.equal(typeOf([1, "Cosa rara", "", "Muebles"]), "Decoración");
});
