// A list tab's filters, as labelled rows from the widest pick to the finest: main group (area, category,
// family), an item category's subcategories, Cooking's flavours, then "more filters" as fields in columns.
import { FLAVORS } from "../catalog.js";
import { game } from "../game.js";
import {
  areaName, environmentName, flavorName, likeName, specialtyName, subcategoryName,
} from "../i18n/game-terms.js";
import { t } from "../i18n/index.js";
import { PAGE_SIZE, render, state } from "../state.js";
import { byId, h } from "../ui/dom.js";
import { FILTER, flavorIcon, svg } from "../ui/icons.js";
import { capitalize } from "../util.js";
import { chip, filterRow, selectField, subtab } from "./controls.js";
import { KINDS, activeFilterCount, groupName, subcategoriesOf } from "./entries.js";

const RECIPE_FILTERS = { craft: "recipe.craftable", learned: "recipe.learned", tolearn: "recipe.toLearn" };

function setFilter(key, value) {
  state.filters = { ...state.filters, [key]: value };
  if (!value) delete state.filters[key];
}
const filterSetter = (key) => (value) => setFilter(key, value);

function groupRow(kind) {
  const all = game.entries[kind];
  const groups = game.groups[kind].filter((g) => all.some((e) => e.group === g));
  const pickGroup = (g) => () => {
    state.group = g;
    state.subcategory = "";
    state.limit = PAGE_SIZE;
    render();
  };
  return filterRow(t(KINDS[kind].groupLabel), h("div", { class: "chips" },
    chip(t("filters.all"), !state.group, pickGroup("")),
    groups.map((g) => chip(groupName(kind, g), state.group === g, pickGroup(state.group === g ? "" : g)))));
}

function subcategoryRow() {
  const subcategories = state.group ? subcategoriesOf(state.group) : [];
  if (subcategories.length <= 1) return null;
  const pick = (sub) => () => {
    state.subcategory = sub;
    if (sub) state.limit = PAGE_SIZE;
    render();
  };
  return filterRow(t("filters.subcategory"), h("div", { class: "subtabs" },
    subtab(t("filters.all"), !state.subcategory, pick("")),
    subcategories.map((x) => subtab(subcategoryName(x), state.subcategory === x, pick(x)))));
}

function flavorRow() {
  const pick = (flavor) => () => {
    setFilter("flavor", flavor);
    state.limit = PAGE_SIZE;
    render();
  };
  return filterRow(t("filters.flavor"), h("div", { class: "chips" },
    chip(t("filters.all"), !state.filters.flavor, () => { setFilter("flavor", ""); render(); }),
    FLAVORS.map((f) => chip(flavorName(f), state.filters.flavor === f,
      pick(state.filters.flavor === f ? "" : f), flavorIcon(f)))));
}

function moreFields(kind) {
  const any = t("filters.any");
  const f = state.filters;
  if (kind === "pok") {
    return [
      selectField(t("filters.environment"), any, game.environments, f.env, filterSetter("env"), environmentName),
      selectField(t("filters.specialty"), any, game.specialties, f.spw, filterSetter("spw"), specialtyName),
      selectField(t("filters.location"), any, game.homes, f.zone, filterSetter("zone"), areaName),
    ];
  }
  if (kind === "obj") {
    return [
      selectField(t("filters.recipe"), any, Object.keys(RECIPE_FILTERS), state.recipe,
        (v) => { state.recipe = v; }, (v) => t(RECIPE_FILTERS[v])),
      selectField(t("filters.attribute"), any, game.tags, f.tag, filterSetter("tag"), (v) => capitalize(likeName(v))),
    ];
  }
  return [];
}

/** The filter rows of a list tab. */
export function filtersPanel(kind) {
  const rows = [groupRow(kind)];
  if (kind === "obj") rows.push(subcategoryRow());
  if (kind === "rec") rows.push(flavorRow());
  const fields = moreFields(kind);
  if (fields.length) {
    rows.push(h("div", { class: "frow more" }, h("span", { class: "flabel" }, t("filters.more")),
      h("div", { class: "fgrid", style: "--n:" + fields.length }, fields)));
  }
  return h("div", { class: "filters" }, rows);
}

/** On a phone, once the list scrolls, the filter rows fold into this button. */
export function filtersSummary() {
  const count = activeFilterCount();
  const unfold = () => {
    byId("list").scrollTop = 0;
    byId("top").classList.remove("compact");
  };
  return h("button", { class: "fsum", onclick: unfold }, h("span", { class: "ico", html: svg(FILTER, 16) }),
    t("filters.button"), count ? h("span", { class: "fcount" }, String(count)) : null);
}
