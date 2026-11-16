// Mi Pokopia · Companion: boots the app once the game data scripts have defined their globals.
import { game } from "./game.js";
import { t } from "./i18n/index.js";
import { back, startRouter } from "./router.js";
import { render, setRenderer, state } from "./state.js";
import { loadMarks, loadPrefs, setSaveErrorHandler } from "./store.js";
import { byId } from "./ui/dom.js";
import { closeSheet } from "./ui/sheet.js";
import { toast } from "./ui/toast.js";
import { renderApp } from "./views/app.js";
import { WIDE_QUERY, renderDetail } from "./views/detail.js";
import { applyPrefs } from "./views/header.js";

// phone: once the list scrolls, the header folds its filters away (a gap avoids flicker at the edge)
function foldHeaderOnScroll(ev) {
  const y = ev.target.scrollTop;
  const top = byId("top");
  if (y > 60) top.classList.add("compact");
  else if (y < 4) top.classList.remove("compact");
}

// Escape closes a sheet, else the detail page
function onKeydown(ev) {
  if (ev.key !== "Escape" || ev.defaultPrevented) return;
  if (!byId("sheet").hidden) {
    closeSheet();
    render();
  } else if (state.selected) {
    back();
  }
}

setRenderer(renderApp);
setSaveErrorHandler(() => toast(t("backup.saveFailed")));
byId("list").addEventListener("scroll", foldHeaderOnScroll, { passive: true });
document.addEventListener("keydown", onKeydown);
// the inert list behind a detail page follows the layout when the window crosses the wide breakpoint
matchMedia(WIDE_QUERY).addEventListener("change", () => renderDetail());

loadPrefs();
applyPrefs();
loadMarks(game.known);
startRouter();
render();
