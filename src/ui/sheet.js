// A modal sheet over the app (bottom sheet on a phone, centred dialog on a wide screen).
import { render } from "../state.js";
import { byId, h } from "./dom.js";

let openedFrom = null; // the control focused before the sheet opened, focused again on close

export function closeSheet() {
  const wrap = byId("sheet");
  if (wrap.hidden) return;
  wrap.hidden = true;
  wrap.replaceChildren();
  document.querySelector(".app").inert = false;
  if (openedFrom && openedFrom.isConnected) openedFrom.focus({ preventScroll: true });
  openedFrom = null;
}

/** content(close) returns the sheet's children; the first one's text names the dialog. */
export function openSheet(content, short) {
  const wrap = byId("sheet");
  if (wrap.hidden) openedFrom = document.activeElement;
  wrap.hidden = false;
  document.querySelector(".app").inert = true;
  requestAnimationFrame(() => {
    const first = wrap.querySelector("input:not([hidden]), button");
    if (first) first.focus({ preventScroll: true });
  });
  const close = () => { closeSheet(); render(); };
  wrap.onclick = (ev) => { if (ev.target === wrap) close(); };
  const children = content(close);
  const title = children[0] && children[0].textContent;
  wrap.replaceChildren(h("div", {
    class: "sheet" + (short ? " short" : ""), role: "dialog", "aria-modal": "true", "aria-label": title,
  }, h("div", { class: "grab" }), ...children));
}
