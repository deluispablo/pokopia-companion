// Building DOM nodes.

export const byId = (id) => document.getElementById(id);

/** h("button", {class: "x", onclick: fn, html: "<svg…>"}, ...children): attributes that are null or false
 *  are left out, "on…" adds a listener, "html" sets innerHTML; children may be nested arrays. */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (name.startsWith("on")) el.addEventListener(name.slice(2), value);
    else if (name === "html") el.innerHTML = value;
    else el.setAttribute(name, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity)) if (child != null && child !== false) el.append(child);
  return el;
}
