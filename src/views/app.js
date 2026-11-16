// Draws the whole app from the state, keeping list scroll and keyboard focus where they belong.
import { t } from "../i18n/index.js";
import { takePendingScroll } from "../router.js";
import { state } from "../state.js";
import { byId } from "../ui/dom.js";
import { focusKey, refocus } from "../ui/focus.js";
import { lastShown, renderDetail } from "./detail.js";
import { renderHeader } from "./header.js";
import { dropStaleHome } from "./houses.js";
import { renderList } from "./list.js";
import { renderNav } from "./nav.js";

// what the list shows: when it changes (tab, mode, search or a filter) the list goes back to the top,
// but not when you mark something
const listKey = () => (state.tab === "casa"
  ? "casa:" + state.houses.mode
  : [state.tab, state.section, state.show, state.query, state.group, state.subcategory, state.recipe, JSON.stringify(state.filters)]
    .join("|"));
let lastListKey = "";

export function renderApp() {
  const focus = focusKey();
  const closed = lastShown() && !state.selected ? lastShown() : null;
  for (const [id, label] of [["side", "app.sections"], ["tabbar", "app.sections"], ["detail", "app.details"]]) {
    byId(id).setAttribute("aria-label", t(label));
  }
  dropStaleHome();
  renderNav();
  renderHeader();
  renderList();
  renderDetail();
  const key = listKey();
  const scroll = takePendingScroll();
  if (scroll != null) byId("list").scrollTop = scroll;
  else if (key !== lastListKey) byId("list").scrollTop = 0;
  lastListKey = key;
  // keep the keyboard where it was: the same control rebuilt, or the card of the detail page just closed
  refocus(closed ? "open:" + closed.kind + ":" + closed.id : focus);
}
