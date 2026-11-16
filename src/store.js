// What the player marks by hand, and their preferences, kept in this browser's localStorage only.
// Marks ("pokopia:v1"): pok = Pokémon owned, zone = where each lives now, hab / items / rec = habitats, items
// and dishes seen, craft = item recipes learned, at = when each mark was made ("kind:id" -> ms).
import { isPlainObject, uniq } from "./util.js";

export const MARKS_KEY = "pokopia:v1";
const PREFS_KEY = "pokopia:prefs";
export const MARK_KINDS = ["pok", "hab", "craft", "items", "rec"];
// kept as it was first published, so every backup file has the same name pattern
export const EXPORT_PREFIX = "pokopia-marcas-";

// ---------- pure helpers (no storage) ----------

export const blankMarks = () => ({ v: 1, pok: [], hab: [], craft: [], items: [], rec: [], zone: {}, at: {} });

/** A marks file: version 1 and at least one list of marks (a list left out counts as empty). */
export const isMarksFile = (o) => isPlainObject(o) && o.v === 1 && MARK_KINDS.some((k) => Array.isArray(o[k]));

const ownEntries = (x) => (isPlainObject(x) ? Object.entries(x).filter(([k]) => k !== "__proto__") : []);

/** Keeps only marks of things that exist (known: a Set or Map per kind, plus homes) and finite times. */
export function cleanMarks(o, known) {
  const m = blankMarks();
  for (const k of MARK_KINDS) if (Array.isArray(o[k])) m[k] = uniq(o[k].filter((x) => known[k].has(x)));
  for (const [name, home] of ownEntries(o.zone)) {
    if (known.pok.has(name) && known.homes.has(home)) m.zone[name] = home;
  }
  for (const [key, time] of ownEntries(o.at)) if (Number.isFinite(time)) m.at[key] = time;
  return m;
}

/** Both sets of marks together; where both say something about one thing, base wins. */
export function mergeMarks(base, extra) {
  const m = { ...base, zone: { ...extra.zone, ...base.zone }, at: { ...extra.at, ...base.at } };
  for (const k of MARK_KINDS) m[k] = uniq(base[k].concat(extra[k]));
  return m;
}

export const countMarks = (m) => MARK_KINDS.reduce((n, k) => n + m[k].length, 0);

/** How many marks were made today (local time). */
export function countToday(at, now = new Date()) {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return Object.values(at).filter((time) => time >= +midnight).length;
}

// ---------- the marks of this browser ----------

let marks = blankMarks();
let sets = {};
let known = null;
let storageWorks = true;
let onSaveError = () => {};

function adopt(m) {
  marks = m;
  sets = Object.fromEntries(MARK_KINDS.map((k) => [k, new Set(m[k])]));
}

export const setSaveErrorHandler = (handler) => { onSaveError = handler; };
export const canStore = () => storageWorks;
export const getMarks = () => marks;
export const hasMark = (kind, id) => sets[kind].has(id);
export const anyMark = (kind) => sets[kind].size > 0;
export const cleanImported = (o) => cleanMarks(o, known);

/** Reads the stored marks; catalog.known says which names and ids exist. */
export function loadMarks(knownThings) {
  known = knownThings;
  adopt(blankMarks());
  let raw = null;
  try {
    raw = localStorage.getItem(MARKS_KEY);
  } catch {
    storageWorks = false;
    return;
  }
  if (raw == null) return;
  let stored = null;
  try { stored = JSON.parse(raw); } catch { /* handled below like any unreadable value */ }
  if (isMarksFile(stored)) {
    adopt(cleanMarks(stored, known));
    return;
  }
  // unreadable marks are kept aside, never overwritten by the next tap
  try { localStorage.setItem(MARKS_KEY + ":bad-" + Date.now(), raw); } catch { /* nothing more to try */ }
}

function save() {
  try {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
    storageWorks = true;
  } catch {
    if (storageWorks) onSaveError();
    storageWorks = false;
  }
}

/** Replaces every mark (an import, or undoing one). */
export function setMarks(m) {
  adopt(m);
  save();
}

/** Adds the file's marks to the ones here. */
export function mergeIntoMarks(extra) {
  adopt(mergeMarks(cleanMarks(marks, known), extra));
  save();
}

/** Marks or unmarks one thing; unmarking a Pokémon also forgets where it lives. */
export function flipMark(kind, id) {
  const set = sets[kind];
  const key = kind + ":" + id;
  if (set.has(id)) {
    set.delete(id);
    delete marks.at[key];
    if (kind === "pok") delete marks.zone[id];
  } else {
    set.add(id);
    marks.at[key] = Date.now();
  }
  marks[kind] = [...set];
  save();
}

/** Where a Pokémon lives now; setting a home also marks it as owned. */
export function setHome(name, home) {
  if (home) {
    marks.zone[name] = home;
    if (!hasMark("pok", name)) flipMark("pok", name);
  } else {
    delete marks.zone[name];
  }
  save();
}

// ---------- preferences ----------

export const prefs = { theme: "system", lang: "es" };

export function loadPrefs() {
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")); } catch { /* defaults */ }
}

export function setPref(key, value) {
  prefs[key] = value;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* kept for this visit only */ }
}
