// The address holds where you are, so Back and links work:
//   #pok  #pok/<name>  #hab/<name>  #obj/<id>  #rec/<name>  #casa  #casa/<Name>,<Name> (or indexes)  #casa/rep
// Every in-app step is pushed with {app: true}; the ficha's Back pops it, or (after a deep link) replaces the
// address with the list. Each list tab keeps its own filters and scroll while you visit others.
import { game } from "./game.js";
import { LIST_TABS, MAX_RESIDENTS, freshList, render, resetHouse, state } from "./state.js";
import { byId } from "./ui/dom.js";
import { closeSheet } from "./ui/sheet.js";
import { uniq } from "./util.js";

export const TAB_KEYS = ["pok", "hab", "obj", "rec", "casa"];
const SPLIT_ID = "rep";

// ---------- pure: addresses ----------

/** "#obj/1052" -> {tab: "obj", id: "1052"}; an unknown tab falls back to the Pokémon list. */
export function parseHash(hash) {
  let text = "";
  try { text = decodeURIComponent(hash.replace(/^#/, "")); } catch { /* a malformed address reads as none */ }
  const [tab, ...rest] = text.split("/");
  return { tab: TAB_KEYS.includes(tab) ? tab : "pok", id: rest.join("/") };
}

/** House members from "Pidgey,Pidgeot" or "16,17": known names or indexes, once each, at most four. */
export function parseHouse(id, pokemon) {
  const indexOf = (key) => (/^\d+$/.test(key) ? (pokemon[+key] ? +key : -1) : pokemon.findIndex((p) => p.n === key));
  return uniq(id.split(",").filter(Boolean).map(indexOf).filter((k) => k >= 0)).slice(0, MAX_RESIDENTS);
}

export const entryHash = (tab, id) => encodeURIComponent(tab) + (id != null ? "/" + encodeURIComponent(id) : "");

export function housesHash(mode, members, pokemon) {
  if (mode === "split") return "casa/" + SPLIT_ID;
  return "casa" + (members.length ? "/" + members.map((k) => encodeURIComponent(pokemon[k].n)).join(",") : "");
}

// ---------- navigation ----------

let routedHash = null;
const snapshots = {}; // per tab: {list, scroll}, saved when you leave it
let pendingList = null; // list state a link asks for (listBy), applied when its tab opens
let pendingScroll = null; // list scroll to restore after the next render

/** The scroll position route() asks render() to restore, once. */
export function takePendingScroll() {
  const scroll = pendingScroll;
  pendingScroll = null;
  return scroll;
}

function applyHash() {
  const { tab, id } = parseHash(location.hash);
  state.tab = tab;
  if (tab !== "casa") {
    state.selected = id ? game.findEntry(tab, tab === "obj" ? +id : id) || null : null;
    return;
  }
  state.selected = null;
  state.houses.mode = id === SPLIT_ID ? "split" : "design";
  if (id === SPLIT_ID) return;
  const members = parseHouse(id, game.pokemon);
  if (members.join() !== state.houses.members.join()) resetHouse(members);
}

function snapshot(tab) {
  const list = LIST_TABS.includes(tab) ? Object.fromEntries(Object.keys(freshList()).map((k) => [k, state[k]])) : null;
  return { list, scroll: byId("list").scrollTop };
}

export function route() {
  if (location.hash === routedHash) return; // popstate and hashchange both fire for one step
  routedHash = location.hash;
  closeSheet();
  const previousTab = state.tab;
  applyHash();
  const changedTab = previousTab !== state.tab;
  if (changedTab) snapshots[previousTab] = snapshot(previousTab);
  if (pendingList) {
    Object.assign(state, pendingList);
    pendingList = null;
  } else if (changedTab) {
    const saved = snapshots[state.tab] || {};
    if (LIST_TABS.includes(state.tab)) Object.assign(state, freshList(), saved.list);
    pendingScroll = saved.scroll || 0;
  }
  render();
}

/** Reads the address the page opened with and follows every later change. */
export function startRouter() {
  routedHash = location.hash;
  applyHash();
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);
}

/** Goes somewhere in the app: a new history step, or the same step replaced (house edits, Back after a deep link). */
export function goTo(hash, replace) {
  if (location.hash.slice(1) === hash) {
    render();
    return;
  }
  history[replace ? "replaceState" : "pushState"]({ app: true }, "", "#" + hash);
  route();
}

export const openEntry = (entry) => goTo(entryHash(entry.kind, entry.id));

export function back() {
  if (history.state && history.state.app) history.back();
  else goTo(state.tab, true);
}

export const currentHousesHash = () => housesHash(state.houses.mode, state.houses.members, game.pokemon);

/** Opens the designer with these members; a step of its own unless you are already in Houses. */
export function goToHouse(members) {
  const inHouses = state.tab === "casa";
  state.houses.members = members;
  state.houses.mode = "design";
  goTo(currentHousesHash(), inHouses);
}

/** A click handler that lists a tab by a filter (Items by attribute or category, Cooking by flavour,
 *  Pokémon by environment or specialty). */
export const listBy = (tab, filters, extra) => () => {
  const list = { ...freshList(), filters, ...extra };
  if (state.tab === tab && !state.selected) {
    Object.assign(state, list);
    render();
  } else {
    pendingList = list;
    goTo(tab);
  }
};
