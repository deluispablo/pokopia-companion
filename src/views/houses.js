// Houses › Design a house: up to four residents, the best housemates for them, and the items, comfort items and
// dishes that suit their likes (logic in logic/houses.js), on your marked Pokémon or all of them.
import { game } from "../game.js";
import { areaName, comfortName, environmentName, flavorName, houseTypeName, likeName } from "../i18n/game-terms.js";
import { t } from "../i18n/index.js";
import { fit, groupFit, groupLikes, pickByType, rankItems } from "../logic/houses.js";
import { goToHouse, listBy, openEntry } from "../router.js";
import { MAX_RESIDENTS, render, state } from "../state.js";
import { anyMark, getMarks, hasMark } from "../store.js";
import { byId, h } from "../ui/dom.js";
import { CHEVRON, RECIPE, SEARCH, environmentIcon, flavorIcon } from "../ui/icons.js";
import { toast } from "../ui/toast.js";
import { capitalize, fold, uniq } from "../util.js";
import { moreLink, pic, segmented, selectField, whereLabel } from "./controls.js";
import { displayName, homeOf, ownsPokemon, recipeLearned } from "./entries.js";

const P = game.pokemon;
/** One colour per housemate, for their slot and their dots. */
const RESIDENT_COLORS = ["#E5484D", "#0A84FF", "#E8A33A", "#AF52DE"];
const CANDIDATE_STEP = 10;
const ITEM_STEP = 20;
const COMFORT_KINDS = [
  ["Ocio", "houses.comfortFun"], ["Descanso", "houses.comfortRest"],
  ["Decoración", "houses.comfortDecor"], ["Caminos", "houses.comfortPaths"],
];

// ---------- shared with the split view ----------

const houses = () => state.houses;
export const ownClass = (k) => (ownsPokemon(k) ? "own" : "miss");
export const percent = (f) => Math.round(f * 100) + "%";
export const pokemonPic = (k) => pic(game.entries.pok[k].pic);
/** The homes you have set for your Pokémon, in the game's order. */
const yourHomes = () => game.homes.filter((z) => Object.values(getMarks().zone).includes(z));

/** Whether a Pokémon passes "My Pokémon" (and its home filter); with nothing marked, every one does. */
export const passesMine = (k) => !houses().mineOnly || !anyMark("pok")
  || (ownsPokemon(k) && (!houses().home || homeOf(k) === houses().home));

/** A home filter the player no longer uses is dropped. */
export function dropStaleHome() {
  if (houses().home && !yourHomes().includes(houses().home)) houses().home = "";
}

/** "My Pokémon / All" and, with "My Pokémon", where they live. */
export function pokemonFilters() {
  return [
    segmented([[true, t("houses.myPokemon")], [false, t("houses.all")]], houses().mineOnly,
      (v) => { houses().mineOnly = v; if (!v) houses().home = ""; }, t("houses.pokemon")),
    houses().mineOnly && yourHomes().length
      ? selectField(t("filters.location"), t("houses.allAreas"), yourHomes(), houses().home,
        (v) => { houses().home = v; }, areaName)
      : null,
  ];
}

/** Where an owned Pokémon lives, unless the list is already filtered by home. */
export const homeTag = (k) => (homeOf(k) && !houses().home ? whereLabel(homeOf(k)) : null);

// ---------- picking residents ----------

const hasLikes = (k) => (P[k].likes || []).length > 0;
const houseEnvironment = () => (houses().members.length ? P[houses().members[0]].env : "");

function addMember(k) {
  houses().query = "";
  goToHouse(houses().members.concat(k));
}

function candidate(k, env, full) {
  const add = () => { if (!full) addMember(k); };
  const members = houses().members;
  if (env && P[k].env !== env) {
    return h("button", { class: "cand other " + ownClass(k), "aria-disabled": String(full), onclick: add },
      pokemonPic(k),
      h("span", null, h("b", null, P[k].n),
        h("span", { class: "sub" }, t("houses.otherEnv", { e: environmentName(P[k].env || "").toLowerCase() }))),
      h("span"));
  }
  const f = fit(P, k, members);
  const common = members.length ? uniq(members.flatMap((j) => P[k].likes.filter((l) => P[j].likes.includes(l)))) : null;
  let note = "";
  if (common) {
    note = common.length ? t("houses.inCommon", { l: common.map(likeName).join(", ") }) : t("houses.nothingInCommon");
  }
  else if (P[k].flavor) note = [flavorIcon(P[k].flavor), flavorName(P[k].flavor)];
  const barColor = f == null ? "" : f >= .5 ? "var(--ok)" : f >= .3 ? "var(--accent)" : "var(--off)";
  const textColor = f >= .5 ? "var(--ok)" : f >= .3 ? "var(--text)" : "var(--text-3)";
  return h("button", { class: "cand " + ownClass(k), "aria-disabled": String(full), onclick: add }, pokemonPic(k),
    h("span", null, h("b", null, P[k].n), h("span", { class: "sub" }, note), homeTag(k)),
    f == null ? h("span") : h("span", { class: "pct" }, h("b", { style: "color:" + textColor }, percent(f)),
      h("span", { class: "bar" }, h("i", { style: `width:${Math.round(f * 100)}%;background:${barColor}` }))));
}

// an empty house: the Pokémon by environment (the one the house will have), five of each until opened
function candidatesByEnvironment(list) {
  const byEnv = new Map();
  for (const k of list) {
    const env = P[k].env || "—";
    byEnv.set(env, (byEnv.get(env) || []).concat(k));
  }
  return [...byEnv].sort((a, b) => b[1].length - a[1].length).map(([env, ks]) => {
    const key = "env:" + env;
    const shown = houses().open.has(key) ? ks : ks.slice(0, 5);
    return [
      h("div", { class: "gsub" }, environmentIcon(env, 14),
        t("houses.envGroup", { e: environmentName(env).toLowerCase() }), h("span", { class: "n" }, " " + ks.length)),
      shown.map((k) => candidate(k, "", false)),
      moreLink(key, ks.length, 5, Infinity),
    ];
  });
}

function candidates() {
  const { members, otherEnvironments, candidateLimit } = houses();
  const env = houseEnvironment();
  const query = fold(houses().query);
  const full = members.length >= MAX_RESIDENTS;
  const list = P.map((p, k) => k).filter((k) => hasLikes(k) && !members.includes(k)
    && (!query || fold(P[k].n).includes(query)) && passesMine(k) && (!env || P[k].env === env || otherEnvironments));
  if (!list.length) return [h("p", { class: "small muted", style: "padding:12px 4px" }, t("houses.noMatch"))];
  const out = full ? [h("p", { class: "hfull" }, t("houses.full"))] : [];
  if (!members.length && !query) return candidatesByEnvironment(list);
  if (members.length) {
    list.sort((a, b) => (P[a].env !== env) - (P[b].env !== env) || fit(P, b, members) - fit(P, a, members));
  }
  const more = () => { houses().candidateLimit += CANDIDATE_STEP; render(); };
  return out.concat(list.slice(0, candidateLimit).map((k) => candidate(k, env, full)),
    list.length > candidateLimit
      ? h("button", { class: "link more", onclick: more }, t("list.showMore", { n: list.length - candidateLimit }))
      : null);
}

function picker() {
  const n = houses().members.length;
  const env = houseEnvironment();
  const toggle = () => { houses().pickerOpen = !houses().pickerOpen; render(); };
  const onSearch = (e) => {
    houses().query = e.target.value;
    houses().candidateLimit = CANDIDATE_STEP;
    byId("hlist").replaceChildren(...candidates().flat(Infinity).filter(Boolean));
  };
  const searchLabel = t("houses.searchPokemon");
  return h("section", { class: "hcard" },
    h("button", { class: "fold", "aria-expanded": String(houses().pickerOpen), onclick: toggle },
      h("h2", { class: "grow" }, t(n ? "houses.addResidents" : "houses.pickFirst")),
      h("span", { class: "chev", html: CHEVRON })),
    houses().pickerOpen ? [
      h("div", { class: "msearch", html: SEARCH },
        h("input", {
          type: "search", placeholder: searchLabel, value: houses().query, "aria-label": searchLabel, oninput: onSearch,
        })),
      h("div", { class: "hopts" }, anyMark("pok") ? pokemonFilters() : null,
        env ? h("label", { class: "check" }, h("input", {
          type: "checkbox", checked: houses().otherEnvironments ? true : null,
          onchange: () => { houses().otherEnvironments = !houses().otherEnvironments; render(); },
        }), t("houses.includeOtherEnvs")) : null),
      h("p", { class: "small muted", style: "margin:0" }, env
        ? [t("houses.envBefore"), h("b", null, environmentName(env).toLowerCase()), t("houses.envAfter")]
        : t("houses.firstSetsEnv")),
      h("div", { id: "hlist", class: "hlist" + (houses().mineOnly && anyMark("pok") ? " mine-only" : "") },
        candidates()),
    ] : null);
}

// ---------- the house ----------

function autofill() {
  const members = houses().members.slice();
  const env = P[members[0]].env;
  while (members.length < MAX_RESIDENTS) {
    const best = P.map((p, k) => k)
      .filter((k) => hasLikes(k) && !members.includes(k) && passesMine(k) && P[k].env === env)
      .sort((a, b) => fit(P, b, members) - fit(P, a, members))[0];
    if (best == null) break;
    members.push(best);
  }
  if (members.length === houses().members.length) toast(t("houses.noMoreCompatible"));
  else goToHouse(members);
}

function slot(i) {
  const k = houses().members[i];
  if (k == null) {
    const add = () => {
      houses().pickerOpen = true;
      render();
      const list = document.querySelector("#hlist");
      if (list) list.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    return h("button", { class: "slot", onclick: add }, h("span", { style: "font-size:22px" }, "+"),
      h("span", { class: "small" }, t("houses.add")));
  }
  const p = P[k];
  const open = () => openEntry(game.entries.pok[k]);
  const remove = (e) => { e.stopPropagation(); goToHouse(houses().members.filter((x) => x !== k)); };
  return h("div", {
    class: "slot full " + ownClass(k), style: `border-color:${RESIDENT_COLORS[i]}66;background:${RESIDENT_COLORS[i]}0F`,
    role: "link", tabindex: "0", onclick: open, onkeydown: (e) => { if (e.key === "Enter") open(); },
  },
  h("button", { class: "x", "aria-label": t("houses.remove", { p: p.n }), onclick: remove }, "×"),
  pokemonPic(k), h("b", null, p.n),
  h("span", { class: "small muted envfl" }, p.env ? [environmentIcon(p.env), environmentName(p.env)] : null,
    p.flavor ? [flavorIcon(p.flavor), flavorName(p.flavor)] : null),
  homeOf(k) ? whereLabel(homeOf(k)) : null);
}

const dots = (indexes) =>
  h("span", { class: "hdots" }, indexes.map((i) => h("i", { style: "background:" + RESIDENT_COLORS[i] })));

// the house's environment, favourite flavours and likes as chips that list what has them
function houseChips(n) {
  const members = houses().members;
  const env = P[members[0]].env;
  const flavors = new Map();
  members.forEach((k, i) => {
    const f = P[k].flavor;
    if (f) flavors.set(f, (flavors.get(f) || []).concat(i));
  });
  const shared = (indexes) => (indexes.length === n && n > 1 ? " all" : "");
  return h("div", { class: "likes" },
    env ? h("button", { class: "like env", title: t("houses.environment"), onclick: listBy("pok", { env }) },
      environmentIcon(env), environmentName(env),
      dots(members.map((k, i) => (P[k].env === env ? i : -1)).filter((i) => i >= 0))) : null,
    [...flavors].map(([f, indexes]) => h("button", {
      class: "like flavor" + shared(indexes), title: t("houses.flavor"), onclick: listBy("rec", { flavor: f }),
    }, flavorIcon(f), flavorName(f), dots(indexes))),
    groupLikes(P, members).map(([like, indexes]) => h("button", {
      class: "like" + shared(indexes), onclick: listBy("obj", { tag: like }),
    }, capitalize(likeName(like)), dots(indexes))));
}

function houseCard(items) {
  const n = houses().members.length;
  const affinity = n > 1 ? Math.round(100 * groupFit(P, houses().members)) : null;
  return h("section", { class: "hcard" },
    h("div", { class: "hrow" }, h("h2", { class: "grow" }, t("houses.house")),
      affinity != null ? h("span", { class: "meter" },
        h("b", { style: `color:${affinity >= 45 ? "var(--ok)" : "var(--text)"}` }, affinity + "%"),
        h("span", { class: "small muted" }, t("houses.affinity"))) : null),
    h("div", { class: "slots" }, [0, 1, 2, 3].map(slot)),
    h("div", { class: "hrow" },
      n < MAX_RESIDENTS ? h("button", { class: "btn", onclick: autofill }, t("houses.autofill")) : null,
      h("button", { class: "btn", onclick: () => goToHouse([]) }, t("houses.clear"))),
    houseChips(n),
    n > 1 ? h("p", { class: "small muted", style: "margin:0" },
      t("houses.sharedItems", { n: items.filter((r) => r.who === n).length, r: n })) : null);
}

// ---------- what suits the house ----------

// "" every item, "recipe" with the recipe learned, "seen" seen or with the recipe learned
function passesOwned(item) {
  if (!houses().items) return true;
  const entry = game.itemEntry(item[0]);
  return recipeLearned(entry) || (houses().items === "seen" && !!entry && hasMark("items", entry.id));
}

const likedByHouse = (likes) => likes.filter((l) => houses().members.some((k) => P[k].likes.includes(l)));
const dotsFor = (per) => h("span", { class: "hdots" }, houses().members.map((k, i) =>
  h("i", { style: `background:${per[i] ? RESIDENT_COLORS[i] : "var(--line)"}`, title: P[k].n })));

function itemRow(row) {
  const item = row.it;
  const entry = game.itemEntry(item[0]);
  const own = entry && hasMark("items", entry.id);
  const learned = recipeLearned(entry);
  return h("button", { class: "hitem " + (own || learned ? "own" : "miss"), onclick: () => entry && openEntry(entry) },
    pic(game.itemPicture(item)),
    h("span", { class: "t" },
      h("b", null, entry ? displayName(entry) : item[1],
        learned ? h("span", { class: "rtag", html: RECIPE, title: t("recipe.learned") }) : null),
      h("span", { class: "tags" }, likedByHouse(row.t).map(likeName).join(" · ")), dotsFor(row.per)));
}

const dishRow = (row) => h("button", {
  class: "hitem " + (hasMark("rec", row.e.id) ? "own" : "miss"), onclick: () => openEntry(row.e),
}, pic(row.e.pic), h("span", { class: "t" }, h("b", null, displayName(row.e)),
  h("span", { class: "tags" }, [flavorName(row.e.o[4])].concat(likedByHouse(row.t).map(likeName)).join(" · ")),
  dotsFor(row.per)));

/** How many residents like these attributes, and how much: {per, who, sum}; extra(k) adds to a resident. */
function score(attributes, extra) {
  const per = houses().members
    .map((k) => P[k].likes.filter((l) => attributes.includes(l)).length + (extra ? extra(k) : 0));
  return { per, who: per.filter(Boolean).length, sum: per.reduce((a, b) => a + b, 0) };
}
const byScore = (a, b) => b.who - a.who || b.sum - a.sum;
const shownRows = (key, rows, closed, max) => (houses().open.has(key) ? rows.slice(0, max) : rows.slice(0, closed));
const optionCount = (n) => t(n === 1 ? "houses.optionsOne" : "houses.optionsMany", { n });

const cardIntro = (key) => h("p", { class: "small muted", style: "margin:0" }, t(key));

function typeBox(title, count, rows, key, note) {
  return h("div", { class: "type" },
    h("div", { class: "hrow" }, h("b", { class: "grow" }, title),
      h("span", { class: "small muted" }, optionCount(count))),
    note, shownRows(key, rows, 1, 8).map(itemRow), moreLink(key, rows.length, 1, 8));
}

function comfortCard() {
  const kinds = COMFORT_KINDS.map(([kind, note]) => {
    const rows = game.cards.filter((item) => game.comfort[item[0]] === kind && passesOwned(item)).map((item) => {
      const attributes = game.itemTags[item[0]] || [];
      return { it: item, t: attributes, ...score(attributes) };
    }).filter((r) => r.who).sort(byScore);
    return [kind, note, rows];
  }).filter(([, , rows]) => rows.length);
  if (!kinds.length) return null;
  return h("section", { class: "hcard" }, h("h2", null, t("houses.comfort")), cardIntro("houses.comfortIntro"),
    h("div", { class: "types" }, kinds.map(([kind, note, rows]) => typeBox(comfortName(kind), rows.length, rows,
      "c:" + kind, h("span", { class: "small muted" }, t(note))))));
}

function foodCard() {
  // a resident's favourite flavour counts as one more like
  const dishes = game.entries.rec.map((e) => {
    const attributes = game.itemTags[e.o[6]] || [];
    return { e, t: attributes, ...score(attributes, (k) => (P[k].flavor && P[k].flavor === e.o[4] ? 1 : 0)) };
  }).filter((r) => r.who).sort(byScore);
  if (!dishes.length) return null;
  return h("section", { class: "hcard" }, h("h2", null, t("houses.food")), cardIntro("houses.foodIntro"),
    h("div", { class: "hitems" }, shownRows("food", dishes, 4, 12).map(dishRow)),
    moreLink("food", dishes.length, 4, 12));
}

function byTypeCard(items) {
  return h("section", { class: "hcard" }, h("h2", null, t("houses.byType")), cardIntro("houses.byTypeIntro"),
    h("div", { class: "types" }, [...pickByType(items)].map(([type, rows]) =>
      typeBox(houseTypeName(type), rows.length, rows, type, null))));
}

function allItemsCard(items) {
  const limit = houses().itemLimit;
  const more = () => { houses().itemLimit += ITEM_STEP; render(); };
  return h("section", { class: "hcard" }, h("h2", null, t("houses.allMatching")), cardIntro("houses.allMatchingIntro"),
    h("div", { class: "hitems" }, items.slice(0, limit).map(itemRow)),
    items.length > limit
      ? h("button", { class: "btn more", onclick: more },
        t("houses.showMoreN", { n: Math.min(ITEM_STEP, items.length - limit) }))
      : null);
}

export function renderHouses() {
  const n = houses().members.length;
  if (!n) {
    const intro = h("p", { class: "small muted", style: "margin:0 2px" }, t("houses.intro"));
    return h("div", { class: "casa" }, intro, picker());
  }
  const items = rankItems(P, houses().members, game.items.filter(passesOwned), game.itemTags);
  const ownedFilter = h("div", { class: "hbar" }, segmented(
    [["", t("houses.all")], ["recipe", t("houses.withRecipe")], ["seen", t("houses.seenOrRecipe")]],
    houses().items, (v) => { houses().items = v; }, t("houses.items")));
  return h("div", { class: "casa" }, houseCard(items), n < MAX_RESIDENTS ? picker() : null, ownedFilter,
    comfortCard(), foodCard(), byTypeCard(items), allItemsCard(items),
    h("p", { class: "fan" }, t("houses.footnote")));
}
