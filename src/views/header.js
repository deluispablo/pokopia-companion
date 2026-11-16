// The header: brand and four buttons of one shape (quick mark, language, theme, backup), then the tab's title,
// search, what to show, the filters and the progress line.
import { game } from "../game.js";
import { setLanguage, t } from "../i18n/index.js";
import { currentHousesHash, goTo } from "../router.js";
import { PAGE_SIZE, render, state } from "../state.js";
import { prefs, setPref } from "../store.js";
import { byId, h } from "../ui/dom.js";
import { BACKUP, CHECK, QUICK_MARK, SEARCH, THEME_ICONS, svg } from "../ui/icons.js";
import { brand, segmented } from "./controls.js";
import { KINDS, activeFilterCount, isMarked, recipeLearned, tabOf, visibleEntries } from "./entries.js";
import { filtersPanel, filtersSummary } from "./filters.js";
import { renderList } from "./list.js";
import { openBackup, openQuickMark } from "./sheets.js";

const code = (text) => '<span class="hcode">' + text + "</span>";
// each language is named in itself
const languageOptions = () => [
  { value: "es", name: "Español", face: code("ES"), lang: "es" },
  { value: "en", name: "English", face: code("EN"), lang: "en" },
];
const themeOptions = () => ["system", "light", "dark"]
  .map((value) => ({ value, name: t("theme." + value), face: svg(THEME_ICONS[value], 18) }));

/** Applies the theme and language preferences to the page. */
export function applyPrefs() {
  const root = document.documentElement;
  if (prefs.theme === "system") delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;
  root.lang = prefs.lang;
  setLanguage(prefs.lang);
}

function changePref(key, value) {
  setPref(key, value);
  applyPrefs();
  render();
}

/** A header button showing the current value, with a small menu: arrow keys, Home/End, Escape returns focus. */
function prefMenu(key, title, options) {
  const chosen = options.find((o) => o.value === prefs[key]) || options[0];
  const wrap = h("span", { class: "tmenu" });
  const label = t(title) + ": " + chosen.name;
  const button = h("button", {
    class: "hbtn", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": label, title: label,
  }, h("span", { class: "hface", html: chosen.face }));
  const popup = h("div", { class: "pop", role: "menu", hidden: true }, h("div", { class: "poph" }, t(title)),
    options.map((o) => h("button", {
      role: "menuitemradio", "aria-checked": String(prefs[key] === o.value), lang: o.lang || null,
      onclick: () => { document.removeEventListener("click", outside, true); changePref(key, o.value); },
    }, h("span", { class: "pface", html: o.face }), h("span", { class: "grow" }, o.name),
    prefs[key] === o.value ? h("span", { html: CHECK }) : null)));
  const items = () => [...popup.querySelectorAll("button")];

  function close(focusButton) {
    popup.hidden = true;
    button.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", outside, true);
    if (focusButton) button.focus();
  }
  function outside(ev) {
    if (!wrap.contains(ev.target)) close(false);
  }
  button.onclick = () => {
    if (!popup.hidden) return close(true);
    popup.hidden = false;
    button.setAttribute("aria-expanded", "true");
    document.addEventListener("click", outside, true);
    (items().find((b) => b.getAttribute("aria-checked") === "true") || items()[0]).focus();
  };
  popup.onkeydown = (ev) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    if (ev.key === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      close(true);
    } else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      list[(i + (ev.key === "ArrowDown" ? 1 : list.length - 1)) % list.length].focus();
    } else if (ev.key === "Home" || ev.key === "End") {
      ev.preventDefault();
      list[ev.key === "Home" ? 0 : list.length - 1].focus();
    }
  };
  wrap.addEventListener("focusout", (ev) => { if (!popup.hidden && !wrap.contains(ev.relatedTarget)) close(false); });
  wrap.append(button, popup);
  return wrap;
}

function topRow() {
  const quickLabel = t("header.quickMark");
  const backupLabel = t("header.backup");
  return h("div", { class: "row1" }, brand(), h("span", { class: "grow" }), h("div", { class: "hbtns" },
    h("button", { class: "hbtn quick", "aria-label": quickLabel, title: quickLabel, onclick: openQuickMark },
      h("span", { class: "hface", html: svg(QUICK_MARK, 18) }), h("span", { class: "ql" }, t("header.quickMarkShort")),
      h("span", { class: "qlong" }, quickLabel)),
    prefMenu("lang", "header.language", languageOptions()),
    prefMenu("theme", "header.theme", themeOptions()),
    h("button", { class: "hbtn", "aria-label": backupLabel, title: backupLabel, onclick: openBackup },
      h("span", { class: "hface", html: svg(BACKUP, 18) }))));
}

function searchBox() {
  const label = t("search.placeholder");
  const input = h("input", {
    placeholder: label, "aria-label": label, value: state.query, type: "search",
    oninput: (ev) => { state.query = ev.target.value; state.limit = PAGE_SIZE; renderList(); },
  });
  return h("div", { class: "msearch", html: SEARCH }, input);
}

function showSegment(kind) {
  const [own, missing] = KINDS[kind].show;
  return segmented([["all", t("show.all")], ["own", t(own)], ["miss", t(missing)]], state.show,
    (v) => { state.show = v; state.limit = PAGE_SIZE; }, t("show.label"));
}

function progressLine(kind) {
  const all = game.entries[kind];
  const mine = all.filter(isMarked).length;
  const counts = { n: mine, m: all.length };
  if (kind === "obj") {
    Object.assign(counts, { r: all.filter(recipeLearned).length, c: all.filter((e) => e.craft).length });
  }
  // with a search or filters on, also how many of the shown ones you have
  const shown = activeFilterCount() || state.query ? visibleEntries(kind, true) : null;
  const here = shown ? " · " + t("progress.here", { n: shown.filter(isMarked).length, m: shown.length }) : null;
  return h("div", { class: "prog" }, h("span", null, t("progress." + kind, counts), here ? h("b", null, here) : null),
    h("span", { class: "bar" }, h("i", { style: "width:" + (mine / all.length * 100) + "%" })));
}

export function renderHeader() {
  const top = byId("top");
  top.replaceChildren(topRow(), h("h1", null, t(tabOf(state.tab).label)));
  if (state.tab === "casa") {
    const modes = [["design", t("houses.design")], ["split", t("houses.split")]];
    top.append(segmented(modes, state.houses.mode,
      (v) => { state.houses.mode = v; goTo(currentHousesHash(), true); }, t("houses.mode")));
    return;
  }
  const kind = state.tab;
  top.append(searchBox(), showSegment(kind), filtersPanel(kind), filtersSummary(), progressLine(kind));
}
