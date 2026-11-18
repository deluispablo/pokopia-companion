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

/** The Collection tab's sections, as in the game: the kind of entry each lists. */
export const SECTIONS = ["art", "hr", "shot", "ins", "obj"];
/** The kind of entry the current list shows. */
export const listKind = () => (state.tab === "obj" ? state.section : state.tab);

const HAVE = { on: "mark.have", off: "mark.asMine", show: ["show.have", "show.missing"] };
/** Per kind of entry: the label of its main filter, the mark button's words, and either the "show" segment's
 *  words or (Pokémon and habitats) the game's Registration Status filter with its second mark, info. */
export const KINDS = {
  pok: {
    groupLabel: "filters.area", on: "mark.befriended", off: "mark.asBefriended", info: "pokInfo",
    infoOn: "mark.sensed", infoOff: "mark.asSensed",
    status: [["all", "status.all"], ["own", "status.befriended"], ["info", "status.sensed"], ["miss", "status.unknownPok"]],
  },
  hab: {
    groupLabel: "filters.area", on: "mark.registered", off: "mark.asRegistered", info: "habInfo",
    infoOn: "mark.known", infoOff: "mark.asKnown",
    status: [["all", "status.all"], ["allpok", "status.allPokemon"], ["own", "status.registered"], ["info", "status.known"], ["miss", "status.unknownHab"]],
  },
  obj: { groupLabel: "filters.category", on: "mark.seen", off: "mark.asSeen", show: ["show.seen", "show.notSeen"] },
  rec: { groupLabel: "filters.family", on: "mark.seen", off: "mark.asSeen", show: ["show.seen", "show.notSeen"] },
  art: { groupLabel: "filters.type", ...HAVE },
  hr: { groupLabel: "filters.type", ...HAVE },
  shot: { groupLabel: "filters.type", on: "mark.taken", off: "mark.asTaken", show: ["show.taken", "show.notTaken"] },
  ins: { groupLabel: "filters.category", on: "mark.haveRecipe", off: "mark.recipeAsLearned", show: HAVE.show },
};

export const isMarked = (entry) => hasMark(entry.set, entry.id);
/** A Pokémon or habitat you know about (the game's "sensed" / "known"), without the main mark. */
export const isKnown = (entry) => !!KINDS[entry.kind].info && hasMark(KINDS[entry.kind].info, entry.id);
const statusOf = (entry) => (isMarked(entry) ? "own" : isKnown(entry) ? "info" : "miss");
// a habitat whose every Pokémon you have befriended (the game's "All Pokémon Registered")
const allVisitorsBefriended = (entry) => {
  const names = game.visitorsOf(entry);
  return names.length > 0 && names.every((n) => hasMark("pok", n));
};
const passesShow = (entry) => state.show === "all" || state.show === statusOf(entry)
  || (state.show === "allpok" && allVisitorsBefriended(entry));
export const recipeLearned = (entry) => !!entry && entry.craft && hasMark("craft", entry.id);
export const ownsPokemon = (k) => hasMark("pok", game.pokemon[k].n);
/** Where an owned Pokémon lives now, or "". */
export const homeOf = (k) => (ownsPokemon(k) && getMarks().zone[game.pokemon[k].n]) || "";
export const whereOf = (entry) => (entry.kind === "pok" && ownsPokemon(entry.k) ? homeOf(entry.k) : "");

export const displayName = (entry) => (isEnglish() && entry.en ? entry.en : entry.name);
const frameName = ([es, en]) => (isEnglish() ? en : es);

export function groupName(kind, group) {
  if (kind === "obj" || kind === "ins") return categoryName(group);
  if (kind === "rec") return familyName(group);
  if (kind === "art" || kind === "hr") return t("collection." + group);
  if (kind === "shot") return t("collection.shot");
  return areaName(group);
}

const dexLabel = (entry) => (entry.num ? t("entry.number", { n: entry.num }) : "");

/** The line under an entry's name; in a list the group header already says some of it. */
export function entrySubtitle(entry, inList) {
  if (entry.kind === "pok" || entry.kind === "hab") {
    if (inList) return dexLabel(entry);
    return [dexLabel(entry), groupName(entry.kind, entry.group)].filter(Boolean).join(" · ");
  }
  if (entry.kind === "art" || entry.kind === "hr") {
    return [
      entry.num ? t("entry.number", { n: entry.num }) : "",
      inList ? "" : groupName(entry.kind, entry.group),
      entry.basin ? areaName("Cuenca Coralina") : "",
    ].filter(Boolean).join(" · ");
  }
  if (entry.kind === "shot") {
    return [dexLabel(entry), entry.frame ? t("collection.frame", { f: frameName(entry.frame) }) : "",
      entry.basin ? areaName("Cuenca Coralina") : ""].filter(Boolean).join(" · ");
  }
  if (entry.kind === "ins") return entry.subcat ? subcategoryName(entry.subcat) : inList ? "" : categoryName(entry.group);
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
    && (ignoreShow || passesShow(entry))
    && passesKindFilters(kind, entry));
}

/** The subcategories of an item category, in the order the list shows them. */
export const subcategoriesOf = (category) =>
  [...new Set(game.entries.obj.filter((e) => e.group === category).map((e) => e.subcat))].filter(Boolean);
