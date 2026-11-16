// Small controls the views share.
import { areaName } from "../i18n/game-terms.js";
import { t } from "../i18n/index.js";
import { PAGE_SIZE, render, state } from "../state.js";
import { h } from "../ui/dom.js";
import { CHEVRON, HOME, LOGO, svg } from "../ui/icons.js";

const GREY = "#8E8E93";

/** A picture, or a coloured square with the initial when there is none or it fails to load. */
export function pic(p, extraClass) {
  const more = extraClass ? " " + extraClass : "";
  if (p.src) {
    return h("img", {
      class: "pic" + (p.hab ? " hab" : "") + more, src: p.src, alt: "", loading: "lazy",
      onerror: (ev) => ev.target.replaceWith(pic({ sq: p.sq || "?", color: GREY }, extraClass)),
    });
  }
  return h("span", { class: "pic sq" + more, style: "background:" + p.color, "aria-hidden": "true" },
    p.text || (p.sq || "?").charAt(0).toUpperCase());
}

export const brand = () => h("div", { class: "brand" }, h("span", { class: "logo", html: LOGO }),
  h("span", { class: "bname" }, t("app.name"), h("span", { class: "bsub" }, t("app.tagline"))));

/** Segmented buttons: options [[value, label]], set(value) then render. */
export const segmented = (options, value, set, label) => h("div", { class: "seg", role: "group", "aria-label": label },
  options.map(([v, text]) => h("button", {
    "aria-pressed": String(value === v), onclick: () => { set(v); render(); },
  }, text)));

/** A filter as a field, its label on top and the select below, so filters line up in columns. */
export function selectField(label, anyLabel, options, value, set, show) {
  const onchange = (e) => { set(e.target.value); state.limit = PAGE_SIZE; render(); };
  return h("label", { class: "ffield" + (value ? " on" : "") }, h("span", { class: "flabel" }, label),
    h("span", { class: "fsel" },
      h("select", { onchange }, h("option", { value: "" }, anyLabel),
        options.map((o) => h("option", { value: o, selected: o === value ? true : null }, show ? show(o) : o))),
      h("span", { class: "chev", html: CHEVRON })));
}

export const filterRow = (label, ...children) =>
  h("div", { class: "frow" }, h("span", { class: "flabel" }, label), ...children);

export const chip = (label, on, onclick, iconEl) =>
  h("button", { class: "chip", "aria-pressed": String(on), onclick }, iconEl || null, label);

export const subtab = (label, on, onclick) =>
  h("button", { class: "subtab", "aria-pressed": String(on), onclick }, label);

/** "lives in <area>", with the home symbol. */
export const whereLabel = (area) => h("span", { class: "where" },
  h("span", { class: "ico", html: svg(HOME, 12) }), h("span", null, areaName(area)));

/** A "show more" link: open shows up to `max` of `rows`, closed only `closed`. */
export function moreLink(key, total, closed, max) {
  if (total <= closed) return null;
  const opened = state.houses.open.has(key);
  const toggle = () => {
    if (opened) state.houses.open.delete(key);
    else state.houses.open.add(key);
    render();
  };
  return h("button", { class: "link more", onclick: toggle },
    opened ? t("houses.showLess") : t("houses.showMoreN", { n: Math.min(total, max) - closed }));
}
