// UI language: t("key", {name: value}) looks the key up in the current language's dictionary.
import es from "./es.js";
import en from "./en.js";

export const dictionaries = { es, en };

let current = "es";

/** Any language without a dictionary falls back to Spanish. */
export const setLanguage = (lang) => { current = dictionaries[lang] ? lang : "es"; };
export const isEnglish = () => current === "en";

export function t(key, vars) {
  let text = dictionaries[current][key] ?? key;
  if (vars) for (const name in vars) text = text.split("{" + name + "}").join(vars[name]);
  return text;
}
