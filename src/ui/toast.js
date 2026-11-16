// A short message at the bottom of the screen, optionally with one action (Undo).
import { h } from "./dom.js";

let current = null;

export function toast(message, actionLabel, onAction) {
  if (current) current.remove();
  const el = h("div", { class: "toast", role: "status" }, h("span", null, message),
    actionLabel ? h("button", { class: "tact", onclick: () => { el.remove(); onAction(); } }, actionLabel) : null);
  current = el;
  document.body.append(el);
  setTimeout(() => el.remove(), actionLabel ? 4000 : 2200);
}
