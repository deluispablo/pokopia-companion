// Houses › Split up: every Pokémon (yours or all) shared out into houses of up to four, one environment each.
import { game } from "../game.js";
import { environmentName, likeName } from "../i18n/game-terms.js";
import { t } from "../i18n/index.js";
import { groupLikes, partition } from "../logic/houses.js";
import { goToHouse, listBy, openEntry } from "../router.js";
import { state } from "../state.js";
import { anyMark } from "../store.js";
import { h } from "../ui/dom.js";
import { environmentIcon } from "../ui/icons.js";
import { capitalize, uniq } from "../util.js";
import { homeTag, ownClass, passesMine, percent, pokemonFilters, pokemonPic } from "./houses.js";

const P = game.pokemon;
let cache = null; // the split of the last pool: it takes a moment and marks rarely change the pool

const average = (houses) => (houses.length ? houses.reduce((a, x) => a + x.fit, 0) / houses.length : 0);
const note = (key) => h("p", { class: "small muted", style: "margin:0" }, t(key));
const affinityColor = (f) => (f >= .45 ? "var(--ok)" : "var(--text)");

function houseBox(house) {
  const shared = groupLikes(P, house.m).filter(([, who]) => who.length === house.m.length);
  const design = () => { state.houses.query = ""; goToHouse(house.m.slice()); };
  return h("div", { class: "rhouse" },
    h("div", { class: "hrow" },
      h("b", { class: "rpct grow", style: "color:" + affinityColor(house.fit) }, percent(house.fit),
        h("span", { class: "small muted" }, t("houses.affinity"))),
      h("button", { class: "btn", onclick: design }, t("split.openInDesigner"))),
    h("div", { class: "rmembers" }, house.m.map((k) => h("button", {
      class: "rmon " + ownClass(k), onclick: () => openEntry(game.entries.pok[k]),
    }, pokemonPic(k), h("b", null, P[k].n), homeTag(k)))),
    shared.length
      ? h("div", { class: "likes" }, shared.map(([like]) =>
        h("button", { class: "like all", onclick: listBy("obj", { tag: like }) }, capitalize(likeName(like)))))
      : note("split.noSharedLikes"));
}

function environmentCard(env, houses) {
  const count = t(houses.length === 1 ? "split.houseCountOne" : "split.houseCountMany", { n: houses.length });
  return h("section", { class: "hcard" },
    h("div", { class: "hrow" },
      h("h2", { class: "grow" }, environmentIcon(env, 16),
        t("houses.envGroup", { e: environmentName(env).toLowerCase() })),
      h("span", { class: "small muted" }, count + " · " + percent(average(houses)))),
    h("div", { class: "rhouses" }, houses.map(houseBox)));
}

export function renderSplit() {
  const pool = P.map((p, k) => k).filter((k) => (P[k].likes || []).length && P[k].env && passesMine(k));
  const key = pool.join(",");
  if (!cache || cache.key !== key) cache = { key, houses: partition(P, pool) };
  const houses = cache.houses.filter((x) => x.fit > 0);
  const housed = new Set(houses.flatMap((x) => x.m));
  const homeless = pool.filter((k) => !housed.has(k));

  const summary = [
    [houses.length, "split.houses"], [percent(average(houses)), "split.averageAffinity"],
    [homeless.length, "split.homeless"], [pool.length, "split.total"],
  ];
  const head = h("section", { class: "hcard" },
    anyMark("pok") ? h("div", { class: "hopts" }, pokemonFilters()) : null,
    note("split.intro"),
    h("div", { class: "rsum" }, summary.map(([value, label]) =>
      h("div", null, h("b", null, String(value)), h("span", { class: "small muted" }, t(label))))));
  if (!pool.length) {
    return h("div", { class: "casa" }, head,
      h("div", { class: "empty" }, h("b", null, t("split.emptyTitle")), t("split.emptyHint")));
  }
  const environments = uniq(houses.map((x) => P[x.m[0]].env));
  return h("div", { class: "casa" }, head,
    environments.map((env) => environmentCard(env, houses.filter((x) => P[x.m[0]].env === env))),
    homeless.length ? h("section", { class: "hcard" },
      h("h2", null, t("split.homelessTitle")), note("split.homelessHint"),
      h("div", { class: "tags" }, homeless.map((k) =>
        h("button", { class: "tag link", onclick: () => openEntry(game.entries.pok[k]) }, P[k].n)))) : null);
}
