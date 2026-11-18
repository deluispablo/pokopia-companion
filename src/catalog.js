// Shapes the generated game data (the PANEL_* globals that data/*.js define) into the entries the app
// lists and links. Rows keep the generator's tuple form:
//   item   [id, name, englishName, category, subcategory]
//   recipe [name, description, familyKey, boostedMove, flavor, unused, dishItemId]
// The Collection follows the game's menu: ancient artifacts, human records, highlight reel, recipes and items.
import { fold, uniq } from "./util.js";

/** Item categories in the order of the game's Collection > Items tabs, with the colour of their placeholder square.
 *  The game lists no special buildings there. */
const CATEGORIES = [
  ["Muebles", "#A2845E"], ["Decoración", "#C9485B"], ["Exteriores", "#2F9E8F"], ["Objetos útiles", "#AF52DE"],
  ["Estructuras", "#6E7B8B"], ["Bloques", "#5E9C76"], ["Kits", "#2F7FD6"], ["Naturaleza", "#4E9A6A"],
  ["Comida", "#E8833A"], ["Materiales", "#8E8E93"], ["Objetos clave", "#D4A017"], ["Otros", "#A1A1A6"],
];
const NOT_IN_CATALOG = "Edificios especiales";
/** Collection > Recipes tabs; any other category is under Other. */
const RECIPE_CATEGORIES = ["Muebles", "Decoración", "Exteriores", "Objetos útiles", "Estructuras", "Bloques", "Otros"];
/** Collection > Ancient Artifacts and Human Records tabs (collection.js keys). */
const ARTIFACT_GROUPS = ["large", "small", "fossil"];
const RECORD_GROUPS = ["newspaper", "diary", "magazine", "memo", "letter", "paper", "photo"];
const SHOT_COLOR = "#2F7FD6";
// cats.js keeps the panel's own names (the desktop Guía) for these; the game's catalog calls them otherwise
const GAME_CATEGORY = {
  "Construcción": "Estructuras", "Varios": "Otros", "Utilidades": "Objetos útiles", "Exterior": "Exteriores",
};
// and the game's Collection calls these items Human Records
const GAME_SUBCATEGORY = { "Diarios": "Notas humanas" };

/** Cooking families: recipe key, list name, the utensil that makes them and their colour. */
export const FAMILIES = [
  { key: "ensalada", name: "Ensaladas", utensil: "Tabla de cortar", color: "#4E9A6A" },
  { key: "sopa", name: "Sopas", utensil: "Olla", color: "#2F7FD6" },
  { key: "pan", name: "Panes", utensil: "Horno de pan", color: "#C08A3E" },
  { key: "hamburguesa", name: "Hamburguesas", utensil: "Sartén", color: "#B5533C" },
  { key: "batido", name: "Batidos", utensil: "Batidora", color: "#A04FCF" },
];

export const FLAVORS = ["dulce", "amargo", "ácido", "seco", "picante", "normal"];

const OTHER_ZONE = "Otros";
// the last habitat number of each main area; Cuenca Coralina's habitats are flagged instead
const ZONE_ENDS = [
  [49, "Estepa Estéril"], [97, "Bahía Borrasca"], [136, "Riscos Rocosos"],
  [183, "Islas Aisladas"], [209, "Pradera Paleta"],
];
export const ZONES = [...ZONE_ENDS.map(([, zone]) => zone), "Cuenca Coralina", OTHER_ZONE];

const POKEMON_COLOR = "#E5484D";
const HABITAT_COLOR = "#30A46C";
const GREY = "#8E8E93";

const padDex = (n) => (n == null ? "" : String(n).padStart(3, "0"));
const titleCase = (text) => (text ? text.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : "");

function mainZone(habitat) {
  if (!habitat) return "";
  if (habitat.dk === "Cuenca") return "Cuenca Coralina";
  if (habitat.dk || habitat.num == null) return "";
  return (ZONE_ENDS.find(([last]) => habitat.num <= last) || [])[1] || "";
}

// one card per name and category, preferring the id that has a picture
function browsableItems(items, itemImages) {
  const seen = new Map();
  for (const item of items) {
    if (!item[1] || item[1] === "(?)" || item[3] === "Recetas" || item[3] === NOT_IN_CATALOG) continue;
    const key = item[3] + "|" + fold(item[1]);
    const kept = seen.get(key);
    if (!kept || (!itemImages.has(kept[0]) && itemImages.has(item[0]))) seen.set(key, item);
  }
  return [...seen.values()];
}

/** Builds the catalog from an object holding the PANEL_* globals (window in the page). */
export function buildCatalog(globals) {
  const data = globals.PANEL_DATA || {};
  const images = globals.PANEL_IMAGES || {};
  const categoryOf = globals.PANEL_CATS || {};
  const english = { tags: {}, spw: {}, areas: {}, habs: {}, habDesc: {}, itemDesc: {}, ...globals.PANEL_EN };
  const comfort = globals.PANEL_COMFORT || {};
  const collection = { artifacts: [], records: {}, shots: [], frames: {}, ...globals.PANEL_COLLECTION };

  const items = (data.items || []).map((item) => {
    const [category, subcategory] = categoryOf[item[0]] || [item[3], item[4]];
    return [item[0], item[1], item[2], GAME_CATEGORY[category] || category, GAME_SUBCATEGORY[subcategory] || subcategory];
  });
  const itemById = new Map(items.map((item) => [item[0], item]));
  const itemImages = new Set(images.item || []);
  const habitats = data.habitats || [];
  const pokemon = (data.pokemon || [])
    .map((p) => (typeof p === "string" ? { n: p, habs: [], likes: [], spw: [] } : p));
  const recipes = data.recipes || [];
  const dishes = data.dishes || {};
  const cards = browsableItems(items, itemImages);
  // the places a Pokémon can live (areas.js has the game's area names)
  const homes = uniq((globals.PANEL_AREAS || []).filter(Boolean));
  const environments = uniq(pokemon.map((p) => p.env).filter(Boolean)).sort((a, b) => a.localeCompare(b, "es"));
  const specialties = uniq(pokemon.flatMap((p) => p.spw || []))
    .filter((s) => s && /^[a-záéíóúñ]/.test(s))
    .sort((a, b) => a.localeCompare(b, "es"));

  // recipes name the item they make by id, but the game repeats an item under several ids: match by name
  // the crafting table's rows, in the game's order: a recipe's place there is its place in Collection > Recipes
  const recipeRank = new Map();
  (globals.PANEL_CRAFTS || []).forEach((id, row) => {
    const name = id && itemById.has(id) ? fold(itemById.get(id)[1]) : "";
    if (name && !recipeRank.has(name)) recipeRank.set(name, row);
  });
  const familyOf = (recipe) => FAMILIES.find((f) => f.key === recipe[2]) || FAMILIES[0];
  const categoryColor = Object.fromEntries(CATEGORIES);

  const itemPicture = (item) => (itemImages.has(item[0])
    ? { src: "img/items/" + item[0] + ".png" }
    : { sq: item[1], color: categoryColor[item[3]] || GREY });
  // an artifact or human record: the item itself, every id on its own (ten photos share one name)
  const collected = (kind, id, group, extra) => {
    const item = itemById.get(id);
    return item && {
      kind, set: "items", id, name: item[1], en: titleCase(item[2]), pic: itemPicture(item), group, o: item, ...extra,
    };
  };
  const pokemonPicture = (p) => (images.pok && images.pok[p.n]
    ? { src: "img/pokemon/" + images.pok[p.n] }
    : { sq: p.n, color: POKEMON_COLOR });
  const habitatPicture = (x) => (x.img
    ? { src: "img/habitats/" + x.img, hab: true }
    : { sq: x.n, color: HABITAT_COLOR });
  const dishPicture = (r) => (r[6] != null && itemImages.has(r[6])
    ? { src: "img/items/" + r[6] + ".png" }
    : { sq: r[0], color: familyOf(r).color });

  // each entry: {kind, set (the mark its circle toggles), id, name, en, num, pic, group, o (the raw row)}
  const entries = {
    pok: pokemon.map((p, k) => ({
      kind: "pok", set: "pok", id: p.n, name: p.n, num: padDex(p.dex), pic: pokemonPicture(p),
      group: mainZone(habitats[(p.habs || [])[0]]) || OTHER_ZONE, o: p, k,
    })),
    hab: habitats.map((x, i) => ({
      kind: "hab", set: "hab", id: x.n, name: x.n, en: english.habs && english.habs[x.n], num: padDex(x.num),
      pic: habitatPicture(x), group: mainZone(x) || OTHER_ZONE, o: x, i,
    })),
    obj: cards.map((item) => ({
      kind: "obj", set: "items", id: item[0], name: item[1], en: titleCase(item[2]),
      craft: recipeRank.has(fold(item[1])), pic: itemPicture(item), group: item[3], subcat: item[4] || "", o: item,
    })),
    rec: recipes.map((r) => ({
      kind: "rec", set: "rec", id: r[0], name: r[0],
      en: r[6] != null && itemById.has(r[6]) ? titleCase(itemById.get(r[6])[2]) : "",
      pic: dishPicture(r), group: familyOf(r).name, o: r,
    })),
    art: collection.artifacts.map(([id, group, basin]) => collected("art", id, group, { basin: !!basin }))
      .filter(Boolean),
    hr: RECORD_GROUPS.flatMap((group) => (collection.records[group] || [])
      .map((id, i) => collected("hr", id, group, { num: String(i + 1) }))).filter(Boolean),
    // a shot: [es, en, reward frame, Bubbly Basin]
    shot: collection.shots.map(([name, en, frame, basin], i) => ({
      kind: "shot", set: "shots", id: i + 1, name, en, num: String(i + 1), pic: { text: String(i + 1), color: SHOT_COLOR },
      group: "", frame: collection.frames[frame] || null, basin: !!basin,
    })),
  };
  // Collection > Recipes: the items you can craft, marked by the recipe learned
  entries.ins = entries.obj.filter((e) => e.craft).map((e) => ({
    ...e, kind: "ins", set: "craft", craft: false, group: RECIPE_CATEGORIES.includes(e.group) ? e.group : "Otros",
  })).sort((a, b) => recipeRank.get(fold(a.name)) - recipeRank.get(fold(b.name)));

  const findEntry = (kind, id) => entries[kind].find((e) => e.id === id);
  const sameName = (name) => (item) => fold(item[1]) === name;
  // the card of an item id (the list keeps one card per name)
  const itemEntry = (id) => {
    const item = itemById.get(id);
    if (!item) return null;
    const name = fold(item[1]);
    const card = cards.find((x) => x[3] === item[3] && sameName(name)(x)) || cards.find(sameName(name));
    return card ? findEntry("obj", card[0]) : null;
  };
  const itemEntryByName = (name) => {
    const card = cards.find(sameName(fold(name)));
    return card ? findEntry("obj", card[0]) : null;
  };
  const itemNameIs = (id, name) => itemById.has(id) && fold(itemById.get(id)[1]) === name;
  const dishesWith = (id) => {
    const item = itemById.get(id);
    const name = item && fold(item[1]);
    return entries.rec.filter((e) => ((dishes[e.o[6]] || {}).ing || []).some((i) => itemNameIs(i, name)));
  };
  /** The names of the Pokémon a habitat attracts. */
  const visitorsOf = (habitat) => uniq((habitat.o.mons || []).map((m) => (pokemon[m.p] || {}).n).filter(Boolean));
  const habitatsUsing = (item) => {
    const name = fold(item[1]);
    return entries.hab.filter((x) => (x.o.req || [])
      .some((r) => r.id != null && fold((itemById.get(r.id) || [])[1]) === name));
  };

  return {
    items, itemById, cards, habitats, pokemon, recipes, dishes, comfort, english, homes, environments, specialties,
    itemDesc: data.itemDesc || {},
    itemTags: data.itemTags || {},
    itemWeb: data.itemWeb || {},
    tags: data.tags || [],
    groups: {
      pok: ZONES, hab: ZONES, obj: CATEGORIES.map(([name]) => name), rec: FAMILIES.map((f) => f.name),
      art: ARTIFACT_GROUPS, hr: RECORD_GROUPS, shot: [""], ins: RECIPE_CATEGORIES,
    },
    entries, findEntry, itemEntry, itemEntryByName, familyOf, itemPicture, dishesWith, habitatsUsing, visitorsOf,
    // what a stored or imported mark may name
    known: {
      pok: new Set(pokemon.map((p) => p.n)), hab: new Set(habitats.map((x) => x.n)),
      rec: new Set(recipes.map((r) => r[0])), items: itemById, craft: itemById, homes: new Set(homes),
      shots: new Set(entries.shot.map((e) => e.id)),
      pokInfo: new Set(pokemon.map((p) => p.n)), habInfo: new Set(habitats.map((x) => x.n)),
    },
  };
}
