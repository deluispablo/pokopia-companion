// The tab bar (phone and tablet) and the sidebar (desktop).
import { game } from "../game.js";
import { t } from "../i18n/index.js";
import { currentHousesHash, goTo } from "../router.js";
import { LIST_TABS, freshList, render, state } from "../state.js";
import { byId, h } from "../ui/dom.js";
import { svg } from "../ui/icons.js";
import { brand } from "./controls.js";
import { TABS, isMarked } from "./entries.js";

const progress = (key) => {
  if (key === "casa") return "";
  const all = game.entries[key];
  return all.filter(isMarked).length + "/" + all.length;
};

// tapping the current tab on its list starts the list over; from a detail page it goes back to the list
const goToTab = (key) => () => {
  if (key === state.tab && !state.selected) {
    if (LIST_TABS.includes(key)) Object.assign(state, freshList());
    byId("list").scrollTop = 0;
    render();
    return;
  }
  goTo(key === "casa" ? currentHousesHash() : key);
};

const current = (key) => (state.tab === key ? "page" : null);

export function renderNav() {
  byId("tabbar").replaceChildren(...TABS.map((tab) => h("button", {
    "aria-current": current(tab.key), "data-k": "tab:" + tab.key, onclick: goToTab(tab.key),
  }, h("span", { html: svg(tab.icon) }), t(tab.label))));

  byId("side").replaceChildren(brand(),
    ...TABS.map((tab) => h("button", {
      class: "navi", "aria-current": current(tab.key), "data-k": "navi:" + tab.key, onclick: goToTab(tab.key),
    }, h("span", { class: "nico", html: svg(tab.icon, 18) }), h("span", { class: "grow" }, t(tab.label)),
    h("span", { class: "n" }, progress(tab.key)))),
    h("span", { class: "spacer" }), h("p", { class: "fan side-fan" }, t("app.disclaimer")));
}
