// Pure logic of the Guía's "Casa" tab (no DOM): how well a Pokémon fits a house of others (shared likes), the house's
// likes with who has each, the items that please the house ranked, and the best of each kind of item (bed, table,
// seat, light, wall, roof...). PanelCasa in the page, module.exports in Node
(function (root) {
  "use strict";
  // fit of k to the housemates m: its likes in common with each (out of 5) plus a shared favourite flavour, out of 6, averaged
  function fit(P, k, m) {
    if (!m.length) return null;
    const one = j => (P[k].likes.filter(l => P[j].likes.includes(l)).length + (P[k].flavor && P[k].flavor === P[j].flavor ? 1 : 0)) / 6;
    return m.reduce((s, j) => s + one(j), 0) / m.length;
  }
  // [[like, [housemate positions]]], the likes more of them share first
  function groupLikes(P, m) {
    const by = new Map();
    m.forEach((k, i) => P[k].likes.forEach(l => { if (!by.has(l)) by.set(l, []); by.get(l).push(i); }));
    return [...by].sort((a, b) => b[1].length - a[1].length);
  }
  // kinds of item for furnishing a house, by name (the game's item table has no such field that we know of)
  // shortcut: name prefixes, Spanish only; an item named otherwise falls in Decoración until its prefix is added
  const TYPES = [
    ["Cama", /^(cama|hamaca|futón|litera|lecho)/i], ["Mesa", /^(mesa|escritorio|mostrador|mesita)/i],
    ["Asiento", /^(silla|sofá|taburete|banco|asiento|tumbona|cojín|sillón|butaca|puf|banqueta)/i],
    ["Luz", /^(lámpara|farola|farolillo|vela|antorcha|foco|candelabro|luz|linterna|lamparita|fanal)/i],
    ["Almacenaje", /^(estantería|estante|armario|cajonera|tocador|caja|cesta|arcón|taquilla|mueble|nevera|baúl|balda|revistero)/i],
    ["En la pared", /^(cuadro|lienzo|póster|marco|reloj|espejo|pizarra|guirnalda|mapa|bandera|tapiz)/i],
    ["Plantas", /^(flores|planta|arbolito|maceta|adorno floral|ramo|seto)/i],
    ["Alfombra", /^(alfombra|felpudo|tatami|esterilla)/i],
    ["Puerta y ventana", /^(puerta|ventana)/i], ["Tejado", /^(tejado|techo)/i],
    ["Suelo", /^(suelo|baldosas|tierra|parqué|césped|adoquín)/i], ["Pared", /^(pared|zócalo|muro|pilar|columna)/i],
  ];
  const TYPE_NAMES = TYPES.map(t => t[0]).concat(["Decoración", "Materiales"]);
  function typeOf(it) {
    const t = TYPES.find(([, re]) => re.test(it[1]));
    return t ? t[0] : it[3] === "Materiales" ? "Materiales" : "Decoración";
  }
  const KINDS = new Set(["Muebles", "Decoración", "Utilidades", "Construcción", "Bloques", "Exterior", "Naturaleza", "Materiales"]);   // what can go in a house (cats.js categories)
  // the placeable items with attributes that please at least one housemate: {it, t, per (likes matched per housemate), who, sum},
  // pleasing more housemates first, then more likes; one item per set of attributes (the eight music buttons are one)
  function rankItems(P, m, items, tags) {
    const rows = items.filter(it => KINDS.has(it[3]) && tags[it[0]]).map(it => {
      const t = tags[it[0]], per = m.map(k => P[k].likes.filter(l => t.includes(l)).length);
      return { it, t, per, who: per.filter(Boolean).length, sum: per.reduce((a, b) => a + b, 0) };
    }).filter(r => r.who).sort((a, b) => b.who - a.who || b.sum - a.sum);
    const seen = new Set();
    return rows.filter(r => { const sig = r.t.slice().sort().join("|"); if (seen.has(sig)) return false; seen.add(sig); return true; });
  }
  // Map kind -> its ranked rows, in TYPE_NAMES order
  function pickByType(rows) {
    const by = new Map(TYPE_NAMES.map(n => [n, []]));
    rows.forEach(r => by.get(typeOf(r.it)).push(r));
    for (const [n, v] of by) if (!v.length) by.delete(n);
    return by;
  }
  // how well a group lives together: each member's fit to the others, averaged
  const groupFit = (P, m) => m.reduce((s, k) => s + fit(P, k, m.filter(j => j !== k)), 0) / m.length;
  // Repartir: split pool (indexes) into houses of up to 4 that never mix environments, each Pokémon once:
  // [{m, fit}], environment by environment in pool order, best house first. Greedy, not optimal: while 2 or more remain,
  // every one seeds a group grown to 4 by best fit, and the best group is taken. A single leftover gets no house
  function partition(P, pool) {
    const out = [], envs = [...new Set(pool.map(k => P[k].env))];
    for (const env of envs) {
      let left = pool.filter(k => P[k].env === env);
      const pair = new Map();   // fit of one Pokémon to one other, computed once
      const one = (a, b) => { const key = a < b ? a + "," + b : b + "," + a; if (!pair.has(key)) pair.set(key, fit(P, a, [b])); return pair.get(key); };
      const fitTo = (c, g) => g.reduce((s, j) => s + one(c, j), 0) / g.length;
      const score = g => g.reduce((s, k) => s + fitTo(k, g.filter(j => j !== k)), 0) / g.length;
      const houses = [];
      while (left.length >= 2) {
        let best = null, bestFit = -1;
        for (const seed of left) {
          const g = [seed];
          while (g.length < 4 && g.length < left.length) {
            let c = null, cf = -1;
            for (const k of left) if (!g.includes(k)) { const f = fitTo(k, g); if (f > cf) { cf = f; c = k; } }
            g.push(c);
          }
          const f = score(g); if (f > bestFit) { bestFit = f; best = g; }
        }
        houses.push({ m: best, fit: bestFit }); left = left.filter(k => !best.includes(k));
      }
      out.push(...houses.sort((a, b) => b.fit - a.fit));
    }
    return out;
  }
  const api = { fit, groupLikes, typeOf, rankItems, pickByType, TYPE_NAMES, groupFit, partition };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PanelCasa = api;
})(this);
