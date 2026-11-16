// Small helpers that know nothing about the app.

/** Lower case without accents, for search. */
export const fold = (text) =>
  String(text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const uniq = (list) => [...new Set(list)];

export const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

export const isPlainObject = (x) => x != null && typeof x === "object" && !Array.isArray(x);
