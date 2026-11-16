// What the screen shows right now, and the one render() every view calls after changing it.

export const LIST_TABS = ["pok", "hab", "obj", "rec"];
export const PAGE_SIZE = 120;
export const MAX_RESIDENTS = 4;

/** A list tab's own state, kept per tab while you visit others.
 *  filters: what a link can set (tag, flavor, env, spw, zone); recipe: "", "craft", "learned" or "tolearn". */
export const freshList = () => ({
  show: "all", query: "", group: "", subcategory: "", limit: PAGE_SIZE, filters: {}, recipe: "",
});

export const state = {
  tab: "pok",
  selected: null, // the entry whose detail page is open
  ...freshList(),
  houses: {
    mode: "design", // or "split"
    members: [], // Pokémon indexes, at most four
    query: "",
    mineOnly: true,
    home: "",
    otherEnvironments: false,
    items: "", // "", "recipe" (recipe learned) or "seen" (seen or recipe learned)
    open: new Set(), // expanded "show more" groups
    itemLimit: 20,
    candidateLimit: 10,
    pickerOpen: true,
  },
};

/** A new house: its expanded groups and limits start over. */
export function resetHouse(members) {
  Object.assign(state.houses, { members, itemLimit: 20, open: new Set(), candidateLimit: 10 });
}

let renderer = () => {};
export const setRenderer = (fn) => { renderer = fn; };
export const render = () => renderer();
