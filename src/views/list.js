// A list tab: its cards grouped (by area, category, subcategory or family), the first-visit tips, the empty
// states and the "also in" links to other tabs that match the search.
import { game } from "../game.js";
import { subcategoryName } from "../i18n/game-terms.js";
import { t } from "../i18n/index.js";
import { listBy, openEntry } from "../router.js";
import { freshList, render, state } from "../state.js";
import { countMarks, flipMark, getMarks, hasMark, prefs, setHome, setPref } from "../store.js";
import { byId, h } from "../ui/dom.js";
import { BACKUP, CHECK, HOME, RECIPE, svg } from "../ui/icons.js";
import { toast } from "../ui/toast.js";
import { fold, uniq } from "../util.js";
import { pic, whereLabel } from "./controls.js";
import {
  KINDS, TABS, activeFilterCount, displayName, entrySubtitle, groupName, isMarked, listKind, matchesQuery,
  recipeLearned, subcategoriesOf, visibleEntries, whereOf,
} from "./entries.js";
import { renderHouses } from "./houses.js";
import { renderSplit } from "./split.js";

const MORE_STEP = 240;

/** A mark made from a list card says what changed, with a way to take it back (the Pokémon's home too). */
function markWithUndo(kind, id, name) {
  const home = kind === "pok" ? getMarks().zone[id] : null;
  const on = !hasMark(kind, id);
  flipMark(kind, id);
  render();
  toast((on ? "✓ " : "○ ") + name, t("undo"), () => {
    flipMark(kind, id);
    if (home) setHome(id, home);
    render();
  });
}

// the open button, the mark circle and the recipe button are siblings, so none is nested in another
function card(entry) {
  const own = isMarked(entry);
  const subtitle = entrySubtitle(entry, true);
  const where = whereOf(entry);
  const key = entry.kind + ":" + entry.id;
  const name = displayName(entry);
  const learned = recipeLearned(entry);
  return h("div", { class: "card " + (own ? "own" : "miss") + (state.selected === entry ? " sel" : "") },
    h("button", { class: "copen", "data-k": "open:" + key, onclick: () => openEntry(entry) }, pic(entry.pic),
      h("span", { class: "t" }, h("b", null, name), subtitle ? h("span", null, subtitle) : null,
        where ? whereLabel(where) : null)),
    h("button", {
      class: "mark", "data-k": "mark:" + key, "aria-pressed": String(own),
      "aria-label": t(KINDS[entry.kind].on) + ": " + name, html: CHECK,
      onclick: () => markWithUndo(entry.set, entry.id, name),
    }),
    entry.craft ? h("button", {
      class: "rmark", "data-k": "rmark:" + key, "aria-pressed": String(learned),
      "aria-label": t("mark.haveRecipe") + ": " + name, title: t(learned ? "recipe.learned" : "recipe.toLearn"),
      html: RECIPE, onclick: () => markWithUndo("craft", entry.id, name),
    }) : null);
}

function alsoIn() {
  const query = fold(state.query.trim());
  if (!query) return null;
  const hits = TABS.filter((tab) => tab.key !== "casa" && tab.key !== state.tab)
    .map((tab) => [tab, game.entries[tab.key].filter((e) => matchesQuery(e, query)).length])
    .filter(([, n]) => n);
  if (!hits.length) return null;
  return h("div", { class: "elsewhere" }, h("span", { class: "small muted" }, t("list.alsoIn")),
    hits.map(([tab, n]) => h("button", { class: "chip", onclick: listBy(tab.key, {}, { query: state.query }) },
      t(tab.label) + " · " + n)));
}

function tips() {
  const line = (iconHtml, key) => h("li", null, h("span", { class: "tico", html: iconHtml }), h("span", null, t(key)));
  return h("section", { class: "tips" }, h("b", null, t("tips.title")),
    h("ul", null, line(CHECK, "tips.mark"), line(RECIPE, "tips.recipe"), line(svg(HOME, 14), "tips.home"),
      line(svg(BACKUP, 14), "tips.backup")),
    h("button", { class: "btn", onclick: () => { setPref("tipsSeen", 1); render(); } }, t("tips.gotIt")));
}

function emptyState() {
  const nothingMarked = state.show === "own" && !state.query && !activeFilterCount();
  const clear = () => { Object.assign(state, freshList()); render(); };
  return h("div", { class: "empty" },
    h("b", null, t(nothingMarked ? "list.noMarksTitle" : "list.noMatchTitle")),
    t(nothingMarked ? "list.noMarksHint" : "list.noMatchHint"),
    nothingMarked ? null : h("button", { class: "btn", onclick: clear }, t("list.clearFilters")));
}

// [label, entries] in list order: an item category with subcategories splits by them
function sections(kind, entries) {
  const subcategories = kind === "obj" && state.group && !state.subcategory ? subcategoriesOf(state.group) : [];
  if (subcategories.length > 1) {
    return subcategories.concat([""]).map((sub) => [sub ? subcategoryName(sub) : t("list.otherSubcategory"),
      entries.filter((e) => e.subcat === sub)]);
  }
  // items come in the game's order, which also orders their categories (food first)
  const groups = kind === "obj" ? uniq(entries.map((e) => e.group)) : game.groups[kind];
  return groups.map((g) => [groupName(kind, g), entries.filter((e) => e.group === g)]);
}

export function renderList() {
  const el = byId("list");
  el.replaceChildren();
  if (state.tab === "casa") {
    el.append(state.houses.mode === "split" ? renderSplit() : renderHouses());
    return;
  }
  const kind = listKind();
  const entries = visibleEntries(kind);
  if (!entries.length) {
    el.append(emptyState(), alsoIn() || "");
    return;
  }
  let shown = 0;
  for (const [label, group] of sections(kind, entries)) {
    if (!group.length || shown >= state.limit) continue;
    const take = group.slice(0, state.limit - shown);
    shown += take.length;
    el.append(h("div", { class: "gh" }, label, h("span", { class: "n" }, String(group.length))),
      h("div", { class: "grid" }, take.map(card)));
  }
  if (entries.length > shown) {
    const more = () => { state.limit += MORE_STEP; renderList(); };
    el.append(h("button", { class: "btn more", onclick: more }, t("list.showMore", { n: entries.length - shown })));
  }
  const other = alsoIn();
  if (other) el.prepend(other);
  if (!prefs.tipsSeen && !countMarks(getMarks())) el.prepend(tips());
}
