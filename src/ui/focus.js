// Keeps keyboard focus across re-renders, which rebuild every control.
import { byId } from "./dom.js";

const LABEL_LENGTH = 80;
const labelOf = (el) => (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, LABEL_LENGTH);
const focusIsLive = () => document.activeElement && document.activeElement !== document.body
  && document.activeElement.isConnected;

/** A stable name for the focused control: its data-k, else its region, tag and label. */
export function focusKey() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  if (el.dataset.k) return el.dataset.k;
  const region = el.closest("#top, #list, #detail, #side, #tabbar, #sheet");
  if (!region) return null;
  return region.id + "|" + el.tagName + "|" + labelOf(el);
}

/** Focuses the rebuilt twin of a control named by focusKey(), unless something else holds focus. */
export function refocus(key) {
  if (!key || focusIsLive()) return;
  let el = document.querySelector('[data-k="' + CSS.escape(key) + '"]');
  if (!el && key.includes("|")) {
    const [regionId, tag, label] = key.split("|");
    const region = byId(regionId);
    el = region && [...region.querySelectorAll(tag)].find((x) => labelOf(x) === label);
  }
  if (el) el.focus({ preventScroll: true });
}
