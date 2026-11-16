// The app's symbols. Most are path data on a 22-unit grid, drawn by svg() at any size.
import { h } from "./dom.js";

/** A line icon from 22-unit path data; small sizes get a heavier stroke so they stay legible. */
export function svg(paths, size = 22) {
  const stroke = size <= 14 ? 2.2 : size <= 18 ? 1.8 : 1.6;
  return `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none" stroke="currentColor" `
    + `stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const ROUND = `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;

// complete icons with their own grid
export const CHECK = `<svg width="12" height="12" viewBox="0 0 12 12" ${ROUND} stroke-width="2">`
  + `<path d="M2.5 6.3l2.3 2.3L9.5 3.6"/></svg>`;
// the same tick in a wider box, as the detail page's mark button has always drawn it
export const CHECK_BUTTON = `<svg width="16" height="16" viewBox="0 0 16 16" ${ROUND} stroke-width="2">`
  + `<path d="M2.5 6.3l2.3 2.3L9.5 3.6"/></svg>`;
export const RECIPE = `<svg width="12" height="12" viewBox="0 0 12 12" ${ROUND} stroke-width="1.4">`
  + `<path d="M3 2h5.5a1 1 0 011 1v7H4a1 1 0 01-1-1z"/><path d="M4.8 4.5h3M4.8 6.5h3"/></svg>`;
export const SEARCH = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" `
  + `stroke-width="1.6" aria-hidden="true"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/></svg>`;
export const CHEVRON = `<svg width="14" height="14" viewBox="0 0 14 14" ${ROUND} stroke-width="1.8">`
  + `<path d="M3.5 5.5L7 9l3.5-3.5"/></svg>`;
export const BACK = `<svg width="11" height="18" viewBox="0 0 12 20" ${ROUND} stroke-width="2">`
  + `<path d="M10 2L2 10l8 8"/></svg>`;
// the logo: a sprout growing out of a little island, in the app's blue and green
export const LOGO = `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">`
  + `<rect width="30" height="30" rx="8" fill="var(--accent)"/>`
  + `<ellipse cx="15" cy="21.5" rx="9" ry="3.2" fill="#FFFFFF" opacity=".95"/>`
  + `<path d="M15 20.5V13" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>`
  + `<path d="M15 14.5c-.4-3.4-2.6-5.4-6-5.6.2 3.4 2.4 5.5 6 5.6z" fill="#7FE08A"/>`
  + `<path d="M15 13c.3-3.2 2.4-5.2 5.8-5.4-.1 3.3-2.3 5.3-5.8 5.4z" fill="#B8F5BE"/></svg>`;

// path data for svg()
export const HOME = `<path d="M3 10l8-7 8 7v9H3z"/><path d="M9 19v-6h4v6"/>`;
export const QUICK_MARK = `<rect x="3.5" y="3.5" width="15" height="15" rx="4"/><path d="M7.5 11.2l2.4 2.4 4.6-5"/>`;
export const BACKUP = `<rect x="3.5" y="4" width="15" height="4.5" rx="1.2"/>`
  + `<path d="M5 8.5V17a1 1 0 001 1h10a1 1 0 001-1V8.5"/><path d="M9 12h4"/>`;
export const FILTER = `<path d="M4 6h14M7 11h8M9.5 16h3"/>`;
const SUN = `<circle cx="11" cy="11" r="3.5"/>`
  + `<path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.3 5.3l1.4 1.4M15.3 15.3l1.4 1.4M5.3 16.7l1.4-1.4M15.3 6.7l1.4-1.4"/>`;
const MOON = `<path d="M17 13.5A7 7 0 018.5 5a7 7 0 108.5 8.5z"/>`;

export const TAB_ICONS = {
  pok: `<circle cx="11" cy="11" r="8"/><path d="M3 11h5.5M13.5 11H19"/><circle cx="11" cy="11" r="2.5"/>`,
  hab: `<path d="M11 3l5 7h-3l4 6H5l4-6H6z"/><path d="M11 16v3"/>`,
  obj: `<path d="M4 7l7-3.5L18 7v8l-7 3.5L4 15z"/><path d="M4 7l7 3.5L18 7M11 10.5v8"/>`,
  rec: `<path d="M4 11h14a7 7 0 01-14 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3"/>`,
  casa: `<path d="M4 10l7-6 7 6v8H4z"/><path d="M9 18v-5h4v5"/>`,
};

export const THEME_ICONS = {
  system: `<circle cx="11" cy="11" r="7"/><path d="M11 4a7 7 0 000 14z" fill="currentColor"/>`,
  light: SUN,
  dark: MOON,
};

// one symbol per environment and flavour (the game's six of each), keyed by their Spanish names
const ENVIRONMENT_ICONS = {
  "Iluminado": SUN,
  "Oscuro": MOON,
  "Húmedo": `<path d="M11 3.5s-5.5 6-5.5 9.5a5.5 5.5 0 0011 0c0-3.5-5.5-9.5-5.5-9.5z"/>`,
  "Seco": `<path d="M3 17h16"/><path d="M5 17c1-4 3.5-6 6-6s5 2 6 6"/><path d="M15 4.5l-1 1.8M18.5 7l-1.8 1M11 3v2"/>`,
  "Calentito": `<path d="M11 19a5 5 0 005-5c0-3-2-4.5-2.5-7.5-1.5 1-2.5 2.5-2.5 4.5-1-.5-1.5-1.5-1.5-3`
    + `C7.5 9.5 6 11.5 6 14a5 5 0 005 5z"/>`,
  "Fresquito": `<path d="M11 3v16M4 7l14 8M4 15l14-8"/><path d="M9 4.5l2 1.5 2-1.5M9 17.5l2-1.5 2 1.5"/>`,
};

const FLAVOR_ICONS = {
  dulce: `<circle cx="11" cy="11" r="3.5"/><path d="M7.7 9.6L4 7v8l3.7-2.6M14.3 9.6L18 7v8l-3.7-2.6"/>`,
  picante: `<path d="M15 6c-3 0-4 3-5.5 6.5S6 18 4 18c6 1 12-3 12-9 0-1.2-.4-2.3-1-3z"/>`
    + `<path d="M15 6c0-1.5 1-2.5 2.5-2.5"/>`,
  "ácido": `<ellipse cx="11" cy="11" rx="7" ry="5" transform="rotate(-35 11 11)"/><path d="M8 14l6-6"/>`,
  amargo: `<path d="M5 9h10v4a5 5 0 01-10 0z"/><path d="M15 10h1.5a2 2 0 010 4H15"/>`
    + `<path d="M8 4.5c0 1.5 1 1.5 1 3M11.5 4.5c0 1.5 1 1.5 1 3"/>`,
  seco: `<path d="M11 19V8"/>`
    + `<path d="M11 9c-2.5 0-3.5-2-3.5-4 2.5 0 3.5 2 3.5 4zM11 9c2.5 0 3.5-2 3.5-4-2.5 0-3.5 2-3.5 4z`
    + `M11 13c-2.5 0-3.5-2-3.5-4 2.5 0 3.5 2 3.5 4zM11 13c2.5 0 3.5-2 3.5-4-2.5 0-3.5 2-3.5 4z"/>`,
  normal: `<circle cx="11" cy="11" r="7"/><circle cx="11" cy="11" r="3.5"/>`,
};

/** An inline icon element, or null when the map has none for that key. */
export const icon = (paths, size = 13) => (paths ? h("span", { class: "ico", html: svg(paths, size) }) : null);
export const environmentIcon = (environment, size) => icon(ENVIRONMENT_ICONS[environment], size);
export const flavorIcon = (flavor, size) => icon(FLAVOR_ICONS[flavor || "normal"], size);
