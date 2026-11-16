// The sheets: quick mark, and backup (export to a file, import from one).
import { game } from "../game.js";
import { t } from "../i18n/index.js";
import { render, state } from "../state.js";
import {
  EXPORT_PREFIX, MARK_KINDS, canStore, cleanImported, countMarks, countToday, flipMark, getMarks, hasMark,
  isMarksFile, mergeIntoMarks, setMarks,
} from "../store.js";
import { h } from "../ui/dom.js";
import { SEARCH } from "../ui/icons.js";
import { closeSheet, openSheet } from "../ui/sheet.js";
import { toast } from "../ui/toast.js";
import { fold } from "../util.js";
import { pic } from "./controls.js";
import { displayName, listKind, matchesQuery } from "./entries.js";

// the Collection's sections each get a chip, named as in the game
const QUICK_KINDS = ["pok", "hab", "art", "hr", "shot", "ins", "obj", "rec"];
const quickLabel = (k) => t(["pok", "hab", "rec"].includes(k) ? "tabs." + k : "collection." + k);
const QUICK_MAX = 90; // cards shown at once; searching finds the rest

// ---------- quick mark ----------

export function openQuickMark() {
  let kind = state.tab === "casa" ? "pok" : listKind();
  let query = "";
  openSheet((close) => {
    const grid = h("div", { class: "qgrid" });
    const footer = h("span");
    const searchLabel = t("search.placeholder");
    const input = h("input", {
      type: "search", placeholder: searchLabel, "aria-label": searchLabel,
      oninput: (ev) => { query = ev.target.value; draw(); },
    });
    function draw() {
      const q = fold(query.trim());
      const matches = game.entries[kind].filter((e) => !q || matchesQuery(e, q));
      grid.replaceChildren(...matches.slice(0, QUICK_MAX).map((e) => h("button", {
        class: "q" + (hasMark(e.set, e.id) ? " own" : ""), "aria-pressed": String(hasMark(e.set, e.id)),
        onclick: () => { flipMark(e.set, e.id); draw(); input.select(); },
      }, pic(e.pic), h("span", null, displayName(e)))),
      matches.length > QUICK_MAX
        ? h("p", { class: "qmore small muted" }, t("quick.truncated", { n: QUICK_MAX, m: matches.length }))
        : "");
      const today = countToday(getMarks().at);
      footer.textContent = today ? t("quick.today", { n: today }) : t("quick.hint");
    }
    const chips = h("div", { class: "chips" }, QUICK_KINDS.map((k) => h("button", {
      class: "chip", "aria-pressed": String(k === kind),
      onclick: (ev) => {
        kind = k;
        [...chips.children].forEach((b) => b.setAttribute("aria-pressed", String(b === ev.currentTarget)));
        draw();
      },
    }, quickLabel(k))));
    draw();
    setTimeout(() => input.focus(), 50);
    return [
      h("div", { class: "shead" }, h("b", null, t("header.quickMark"))),
      h("div", { class: "spad" }, h("div", { class: "msearch", html: SEARCH }, input), chips),
      grid,
      h("div", { class: "sfoot" }, footer, h("button", { class: "btn primary", onclick: close }, t("quick.done"))),
    ];
  });
}

// ---------- backup ----------

const textNote = (text) => h("p", { class: "muted", style: "margin:0;font-size:13px" }, text);

const actionRow = (label, onclick) => h("button", { class: "gi", onclick }, h("span", { class: "grow" }, label),
  h("span", { class: "chev", "aria-hidden": "true" }, "›"));

export function openBackup() {
  openSheet((close) => {
    const file = h("input", {
      type: "file", accept: "application/json,.json", hidden: true, onchange: (ev) => importFile(ev.target.files[0]),
    });
    const stored = t(canStore() ? "backup.stored" : "backup.notStored");
    return [
      h("div", { class: "shead" }, h("b", null, t("header.backup"))),
      h("div", { class: "spad" },
        textNote(stored + " " + t("backup.count", { n: countMarks(getMarks()) })),
        h("div", { class: "glist" },
          actionRow(t("backup.export"), () => { exportFile(); close(); }),
          actionRow(t("backup.import"), () => file.click())),
        file,
        h("p", { class: "fan", style: "margin:8px 0 0" }, t("app.disclaimer"))),
    ];
  }, true);
}

function exportFile() {
  const blob = new Blob([JSON.stringify(getMarks(), null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = h("a", { href: url, download: EXPORT_PREFIX + new Date().toISOString().slice(0, 10) + ".json" });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(t("backup.exported"));
}

async function importFile(file) {
  if (!file) return;
  let content = null;
  try { content = JSON.parse(await file.text()); } catch { /* not JSON: same as a file without marks */ }
  if (!isMarksFile(content)) {
    closeSheet();
    toast(t("backup.badFile"));
    return;
  }
  const marks = cleanImported(content);
  const listed = MARK_KINDS.reduce((n, k) => n + (Array.isArray(content[k]) ? content[k].length : 0), 0);
  const skipped = listed - countMarks(marks);
  const message = t("backup.imported") + (skipped > 0 ? " · " + t("backup.skipped", { n: skipped }) : "");

  const apply = (how) => {
    const before = getMarks();
    if (how === "replace") setMarks(marks);
    else mergeIntoMarks(marks);
    closeSheet();
    render();
    // replacing can be undone: the marks you had come back
    if (how === "replace") toast(message, t("undo"), () => { setMarks(before); render(); });
    else toast(message);
  };
  closeSheet();
  openSheet((close) => [
    h("div", { class: "shead" }, h("b", null, t("backup.import"))),
    h("div", { class: "spad" }, textNote(t("backup.importQuestion")),
      h("button", { class: "btn primary big", onclick: () => apply("merge") }, t("backup.merge")),
      h("button", { class: "btn big", onclick: () => apply("replace") }, t("backup.replace")),
      h("button", { class: "btn big", onclick: close }, t("backup.cancel"))),
  ], true);
}
