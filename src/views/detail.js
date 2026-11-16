// The ficha: a page over the list on a phone or tablet, the third column on a wide screen.
import { FAMILIES } from "../catalog.js";
import { game } from "../game.js";
import {
  areaList, areaName, categoryName, comfortName, descriptionText, environmentName, familyName, flavorName,
  likeName, spawnWord, specialtyName, subcategoryName,
} from "../i18n/game-terms.js";
import { isEnglish, t } from "../i18n/index.js";
import { back, goToHouse, listBy, openEntry } from "../router.js";
import { render, state } from "../state.js";
import { flipMark, hasMark, setHome } from "../store.js";
import { byId, h } from "../ui/dom.js";
import {
  BACK, CHECK_BUTTON, CHEVRON, TAB_ICONS, environmentIcon, flavorIcon, svg,
} from "../ui/icons.js";
import { capitalize, fold } from "../util.js";
import { pic, whereLabel } from "./controls.js";
import {
  KINDS, displayName, entrySubtitle, homeOf, isMarked, ownsPokemon, recipeLearned, whereOf,
} from "./entries.js";

const MAX_FANS = 30;
export const WIDE_QUERY = "(min-width: 900px)";
const isNarrow = () => !matchMedia(WIDE_QUERY).matches;

// ---------- building blocks ----------

const chevron = () => h("span", { class: "chev", "aria-hidden": "true" }, "›");

const row = (label, value, onclick) => h(onclick ? "button" : "div", { class: "gi", onclick },
  h("span", { class: "grow" }, label), value != null ? h("span", { class: "v" }, value) : null, onclick ? chevron() : null);

function markedTag(entry) {
  if (entry.kind === "obj") {
    return recipeLearned(entry) ? t("mark.recipe") : hasMark("items", entry.id) ? t("mark.seen") : null;
  }
  return isMarked(entry) ? t(entry.kind === "pok" ? "mark.youHaveIt" : "mark.seen") : null;
}

const linkRow = (entry, note) => h("button", { class: "gi", onclick: () => openEntry(entry) }, pic(entry.pic),
  h("span", { class: "grow" }, displayName(entry), note ? h("small", null, note) : null),
  markedTag(entry) ? h("span", { class: "ok" }, markedTag(entry)) : null, chevron());

const section = (titleKey, ...children) => h("div", { class: "sect" }, h("h3", null, t(titleKey)), ...children);
const rowList = (rows) => (rows.length ? h("div", { class: "glist" }, rows) : null);

const tags = (values, show, link) => h("div", { class: "tags" }, values.map((x) => (link
  ? h("button", { class: "tag link", onclick: link(x) }, show ? show(x) : x)
  : h("span", { class: "tag" }, show ? show(x) : x))));

const likeTags = (likes) => tags(likes, (x) => capitalize(likeName(x)), (l) => listBy("obj", { tag: l }));

// strings scraped from a Spanish web page stay Spanish in English mode, and say so
const scrapedLang = () => (isEnglish() ? "es" : null);

/** When a Pokémon shows up in a habitat: rarity, times of day and weather when not all, the only areas. */
const spawnText = (m) => [
  spawnWord(m.r),
  (m.t || []).length && m.t.length < 4 ? m.t.map(spawnWord).join(", ") : "",
  (m.w || []).length && m.w.length < 3 ? m.w.map(spawnWord).join(", ") : "",
  m.only ? t("detail.onlyIn", { z: areaList(m.only) }) : "",
].filter(Boolean).join(" · ");

// ---------- one body per kind ----------

function homePicker(entry) {
  return section("detail.location", h("label", { class: "zsel" },
    h("select", { "aria-label": t("detail.location"), onchange: (ev) => { setHome(entry.id, ev.target.value); render(); } },
      h("option", { value: "" }, t("detail.notSet")),
      game.homes.map((z) => h("option", { value: z, selected: z === homeOf(entry.k) ? true : null }, areaName(z)))),
    h("span", { class: "chev", html: CHEVRON })));
}

function pokemonBody(entry) {
  const p = entry.o;
  const out = [];
  if (hasMark("pok", entry.id)) out.push(homePicker(entry));
  const facts = [
    p.env && row(t("detail.idealHabitat"), [environmentIcon(p.env, 15), environmentName(p.env)], listBy("pok", { env: p.env })),
    p.flavor && row(t("detail.favoriteFlavor"), [flavorIcon(p.flavor, 15), flavorName(p.flavor)],
      listBy("rec", { flavor: p.flavor })),
  ].filter(Boolean);
  if (facts.length) out.push(section("detail.guide", rowList(facts)));
  if ((p.spw || []).length) out.push(section("detail.specialty", tags(p.spw, specialtyName, (s) => listBy("pok", { spw: s }))));
  if ((p.likes || []).length) {
    const design = () => { state.houses.query = ""; goToHouse([entry.k]); };
    out.push(section("detail.favorites", likeTags(p.likes)),
      h("div", { class: "glist", style: "margin:14px 16px 0" }, h("button", { class: "gi", onclick: design },
        h("span", { class: "ico", html: svg(TAB_ICONS.casa, 18) }),
        h("span", { class: "grow" }, t("detail.designHouseWith", { p: p.n })), chevron())));
  }
  const habitats = (p.habs || []).map((i) => game.entries.hab[i]).filter(Boolean);
  if (habitats.length) {
    out.push(section("detail.whereToFind", rowList(habitats.map((x) =>
      linkRow(x, spawnText((x.o.mons || []).find((m) => m.p === entry.k) || {}) || entrySubtitle(x))))));
  }
  return out;
}

function habitatBody(entry) {
  const x = entry.o;
  const out = [];
  if (x.d) out.push(section("detail.description", h("p", null, descriptionText(x.d))));
  const needs = (x.req || []).map((r) => {
    const item = game.itemEntry(r.id);
    return item ? linkRow(item, "× " + r.q) : row(r.t, "× " + r.q);
  });
  if (needs.length) out.push(section("detail.builtWith", rowList(needs)));
  const visitors = (x.mons || []).map((m) => ({ m, p: game.pokemon[m.p] })).filter((v) => v.p);
  if (visitors.length) {
    out.push(section("detail.attracts", rowList(visitors.map(({ m, p }) => linkRow(game.findEntry("pok", p.n), spawnText(m))))));
  }
  if ((x.areas || []).length) out.push(section("detail.areas", tags(x.areas, areaName)));
  return out;
}

// the Pokémon who like an item most: its attributes among their likes, plus a matching favourite flavour
function itemFans(tagsOfItem) {
  if (!tagsOfItem.length) return [];
  const score = (p) => (p.likes || []).filter((l) => tagsOfItem.includes(l)).length
    + (tagsOfItem.includes("cosas con sabor " + p.flavor) ? 1 : 0);
  const least = tagsOfItem.length > 1 ? 2 : 1;
  return game.pokemon.map((p, k) => [k, score(p)]).filter(([, s]) => s >= least)
    .sort((a, b) => b[1] - a[1] || ownsPokemon(b[0]) - ownsPokemon(a[0]));
}

function itemBody(entry) {
  const item = entry.o;
  const id = item[0];
  const out = [];
  const comfort = game.comfort[id];
  if (game.itemDesc[id]) out.push(section("detail.description", h("p", null, descriptionText(game.itemDesc[id]))));
  const category = item[4] ? categoryName(item[3]) + " · " + subcategoryName(item[4]) : categoryName(item[3]);
  out.push(section("detail.guide", rowList([
    row(t("detail.category"), category, listBy("obj", {}, { group: item[3] })),
    comfort && row(t("detail.comfort"), comfortName(comfort)),
  ].filter(Boolean))));
  const itemTags = game.itemTags[id] || [];
  if (itemTags.length) out.push(section("detail.attributes", likeTags(itemTags)));

  const web = game.itemWeb[id] || {};
  if ((web.rec || []).length) {
    const parts = web.rec.map(([part, q]) => {
      const partEntry = typeof part === "number" && game.itemEntry(part);
      return partEntry ? linkRow(partEntry, "× " + q) : row(String(part), "× " + q);
    });
    out.push(section("detail.howToCraft", rowList(parts),
      web.un ? h("p", { class: "small muted", style: "margin:6px 4px 0", lang: scrapedLang() },
        t("detail.unlockedBy", { u: web.un })) : null));
  }
  if (web.m || (web.z || []).length) {
    out.push(section("detail.howToGet",
      web.m ? rowList([row(t("detail.method"), h("span", { lang: scrapedLang() }, web.m))]) : null,
      (web.z || []).length ? h("div", { style: "margin-top:8px", lang: scrapedLang() }, tags(web.z)) : null));
  }

  const fans = itemFans(itemTags);
  if (fans.length) {
    out.push(section("detail.likedBy", h("div", { class: "tags" }, fans.slice(0, MAX_FANS).map(([k]) =>
      h("button", { class: "tag link" + (ownsPokemon(k) ? " mine" : ""), onclick: () => openEntry(game.entries.pok[k]) },
        game.pokemon[k].n)))));
  }
  const madeWithIt = FAMILIES.find((f) => fold(f.utensil) === fold(item[1]));
  if (madeWithIt) {
    out.push(section("detail.dishesWithUtensil",
      rowList(game.entries.rec.filter((r) => r.o[2] === madeWithIt.key).map((r) => linkRow(r)))));
  }
  const dishes = game.dishesWith(id);
  if (dishes.length) out.push(section("detail.ingredientOf", rowList(dishes.map((r) => linkRow(r)))));
  const habitats = game.habitatsUsing(item);
  if (habitats.length) out.push(section("detail.usedInHabitats", rowList(habitats.map((x) => linkRow(x, entrySubtitle(x))))));
  return out;
}

function recipeBody(entry) {
  const r = entry.o;
  const out = [];
  if (r[1]) out.push(section("detail.description", h("p", null, descriptionText(r[1]))));
  const family = game.familyOf(r);
  const utensil = game.itemEntryByName(family.utensil);
  const dish = game.dishes[r[6]] || {};
  out.push(section("detail.howToCook", rowList([
    utensil ? linkRow(utensil, t("detail.utensil")) : row(t("detail.utensil"), family.utensil),
    ...(dish.spw ? [row(t("detail.needsPokemon"), specialtyName(dish.spw), listBy("pok", { spw: dish.spw }))] : []),
  ])));
  const ingredients = (dish.ing || []).map((id) => game.itemById.get(id)).filter(Boolean);
  if (ingredients.length) {
    out.push(section("detail.ingredients", rowList(ingredients.map((item) => {
      const card = game.itemEntry(item[0]);
      return card ? linkRow(card) : row(item[1]);
    }))));
  }
  out.push(section("detail.guide", rowList([
    row(t("detail.family"), familyName(family.name)),
    row(t("detail.boosts"), r[3]),
    row(t("detail.flavor"), [flavorIcon(r[4], 15), flavorName(r[4])], listBy("rec", { flavor: r[4] })),
  ])));
  if ((game.itemTags[r[6]] || []).length) out.push(section("detail.attributes", likeTags(game.itemTags[r[6]])));
  return out;
}

const BODIES = { pok: pokemonBody, hab: habitatBody, obj: itemBody, rec: recipeBody };

// ---------- the panel ----------

let lastSelected = null;
export const lastShown = () => lastSelected;

function markButton(entry, on, onKey, offKey, kind) {
  return h("button", {
    class: "ownbtn", "aria-pressed": String(on), onclick: () => { flipMark(kind, entry.id); render(); },
    html: on ? CHECK_BUTTON + " " + t(onKey) : t(offKey),
  });
}

export function renderDetail() {
  const el = byId("detail");
  const entry = state.selected;
  el.replaceChildren();
  const app = document.querySelector(".app");
  app.classList.toggle("open", !!entry);
  app.classList.toggle("casa-tab", state.tab === "casa");
  // the ficha covers the list on phone and tablet, but the tabs stay below it to jump anywhere
  document.querySelector(".main").inert = !!entry && isNarrow();
  const fresh = entry !== lastSelected;
  lastSelected = entry;
  if (fresh && entry) {
    requestAnimationFrame(() => {
      const target = el.querySelector(isNarrow() ? ".back" : "h2");
      if (!target) return;
      if (!isNarrow()) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  }
  if (!entry) {
    el.append(h("div", { class: "empty" },
      h("b", null, t(state.tab === "casa" ? "detail.pickHousesTitle" : "detail.pickTitle")), t("detail.pickHint")));
    return;
  }
  const kind = KINDS[entry.kind];
  const where = whereOf(entry);
  el.append(
    h("div", { class: "dtop" }, h("button", { class: "back", onclick: back, html: BACK + t("detail.back") })),
    h("div", { class: "dbody" },
      h("div", { class: "hero" }, pic(entry.pic), h("h2", null, displayName(entry)), h("span", null, entrySubtitle(entry)),
        where ? whereLabel(where) : null),
      h("div", { class: "ownbtns" }, markButton(entry, isMarked(entry), kind.on, kind.off, entry.set),
        entry.craft ? markButton(entry, recipeLearned(entry), "mark.haveRecipe", "mark.recipeAsLearned", "craft") : null),
      ...BODIES[entry.kind](entry),
      h("p", { class: "fan" }, t("app.disclaimer"))));
  if (fresh) el.scrollTop = 0;
}
