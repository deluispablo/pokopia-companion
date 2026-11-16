// The tabs, the kinds of entry they list, and how an entry reads in the current language and marks.
import { game } from "../game.js";
import { t, isEnglish } from "../i18n/index.js";
import { areaName, categoryName, comfortName, familyName, flavorName, subcategoryName } from "../i18n/game-terms.js";
import { state } from "../state.js";
import { getMarks, hasMark } from "../store.js";
import { flavorIcon, TAB_ICONS } from "../ui/icons.js";
import { fold } from "../util.js";

export const TABS = ["pok", "hab", "obj", "rec", "casa"]
  .map((key) => ({ key, label: "tabs." + key, icon: TAB_ICONS[key] }));
export const tabOf = (key) => TABS.find((tab) => tab.key === key);

/** Per list tab: the label of its main filter, the mark button's words and the "show" segment's words. */
export const KINDS = {
  pok: { groupLabel: "filters.zone", on: "mark.have", off: "mark.asMine", show: ["show.have", "show.missing"] },
  hab: { groupLabel: "filters.zone", on: "mark.seen", off: "mark.asSeen", show: ["show.seen", "show.notSeen"] },
  obj: { groupLabel: "filters.category", on: "mark.seen", off: "mark.asSeen", show: ["show.seen", "show.notSeen"] },
  rec: { groupLabel: "filters.family", on: "mark.seen", off: "mark.asSeen", show: ["show.seen", "show.notSeen"] },
};

export const isMarked = (entry) => hasMark(entry.set, entry.id);
export const recipeLearned = (entry) => !!entry && entry.craft && hasMark("craft", entry.id);
export const ownsPokemon = (k) => hasMark("pok", game.pokemon[k].n);
/** Where an owned Pokémon lives now, or "". */
export const homeOf = (k) => (ownsPokemon(k) && getMarks().zone[game.pokemon[k].n]) || "";
export const whereOf = (entry) => (entry.kind === "pok" && ownsPokemon(entry.k) ? homeOf(entry.k) : "");

export const displayName = (entry) => (isEnglish() && entry.en ? entry.en : entry.name);

export const groupName = (kind, group) =>
  (kind === "obj" ? categoryName(group) : kind === "rec" ? familyName(group) : areaName(group));

const dexLabel = (entry) => (entry.num ? t("entry.number", { n: entry.num }) : "");

/** The line under an entry's name; in a list the group header already says some of it. */
export function entrySubtitle(entry, inList) {
  if (entry.kind === "pok" || entry.kind === "hab") {
    if (inList) return dexLabel(entry);
    return [dexLabel(entry), groupName(entry.kind, entry.group)].filter(Boolean).join(" · ");
  }
  if (entry.kind === "obj") {
    const comfort = game.comfort[entry.id];
    return [
      entry.subcat && !(inList && state.group) ? subcategoryName(entry.subcat) : "",
      comfort ? t("detail.comfortKind", { c: comfortName(comfort).toLowerCase() }) : "",
    ].filter(Boolean).join(" · ");
  }
  return [flavorIcon(entry.o[4]), flavorName(entry.o[4])];
}

export const matchesQuery = (entry, query) =>
  fold(entry.name).includes(query) || (entry.en && fold(entry.en).includes(query));

/** Number of filters set on the current list (not counting search and the show segment). */
export const activeFilterCount = () =>
  (state.group ? 1 : 0) + (state.subcategory ? 1 : 0) + (state.recipe ? 1 : 0) + Object.keys(state.filters).length;

function passesRecipe(entry) {
  if (!state.recipe) return true;
  if (state.recipe === "craft") return entry.craft;
  if (state.recipe === "learned") return recipeLearned(entry);
  return entry.craft && !recipeLearned(entry);
}

function passesKindFilters(kind, entry) {
  const f = state.filters;
  if (kind === "pok") {
    return (!f.env || entry.o.env === f.env) && (!f.spw || (entry.o.spw || []).includes(f.spw))
      && (!f.zone || homeOf(entry.k) === f.zone);
  }
  if (kind === "obj") return (!f.tag || (game.itemTags[entry.id] || []).includes(f.tag)) && passesRecipe(entry);
  if (kind === "rec") return !f.flavor || entry.o[4] === f.flavor;
  return true;
}

/** The entries the current search and filters let through; ignoreShow skips the show segment. */
export function visibleEntries(kind, ignoreShow) {
  const query = fold(state.query.trim());
  return game.entries[kind].filter((entry) => (!query || matchesQuery(entry, query))
    && (!state.group || entry.group === state.group)
    && (!state.subcategory || entry.subcat === state.subcategory)
    && (ignoreShow || state.show === "all" || (state.show === "own") === isMarked(entry))
    && passesKindFilters(kind, entry));
}

/** The subcategories of an item category, in the order the list shows them. */
export const subcategoriesOf = (category) =>
  [...new Set(game.entries.obj.filter((e) => e.group === category).map((e) => e.subcat))].filter(Boolean);
