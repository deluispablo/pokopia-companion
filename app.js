// Mi Pokopia: the Guía's data (../panel/*.js) for a phone, with what you have marked by hand, kept in this browser only
"use strict";
const D = window.PANEL_DATA || {}, IMG = window.PANEL_IMAGES || {}, GCATS = window.PANEL_CATS || {}, H = window.PanelCasa;
// lower case without accents, for search
const fold = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const uniq = a => [...new Set(a)];
const num = n => n == null ? "" : "Nº " + String(n).padStart(3, "0");
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// ---------- preferences (theme, language) and words: the UI is written in Spanish, English from this table ----------
const PREFS_KEY = "pokopia:prefs";
let P = { theme: "system", lang: "es" };
try { Object.assign(P, JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")); } catch (e) { }
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(P)); } catch (e) { } };
const applyTheme = () => { const r = document.documentElement; if (P.theme === "system") delete r.dataset.theme; else r.dataset.theme = P.theme; r.lang = P.lang; };
const EN = {
  "Pokémon": "Pokémon", "Hábitats": "Habitats", "Objetos": "Items", "Cocina": "Cooking", "Buscar": "Search", "Todos": "All", "Todo": "All",
  "Tengo": "Have", "Me faltan": "Missing", "Visto": "Seen", "No visto": "Not seen", "Lo tengo": "I have it", "Marcar como mío": "Mark as mine", "Marcar como visto": "Mark as seen",
  "Tengo la receta": "I have the recipe", "Marcar receta como aprendida": "Mark recipe as learned", "Receta": "Recipe", "Se fabrica": "Craftable", "Receta aprendida": "Recipe learned", "Receta por aprender": "Recipe to learn",
  "Tienes {n} Pokémon de {m}": "You have {n} of {m} Pokémon", "Has visto {n} de {m}": "You've seen {n} of {m}", "Has visto {n} de {m} · {r} recetas de {c}": "Seen {n} of {m} · {r} of {c} recipes", "Has visto {n} platos de {m}": "You've seen {n} of {m} dishes",
  "Ver más ({n})": "Show more ({n})", "Aún no has marcado nada aquí": "Nothing marked here yet", "Toca el círculo de una tarjeta o usa Marcar rápido.": "Tap a card's circle or use Quick mark.", "Nada coincide": "Nothing matches", "Prueba con otra búsqueda o quita los filtros.": "Try another search or clear the filters.",
  "Marcar rápido": "Quick mark", "Ajustes": "Settings", "Copia de seguridad": "Backup", "Tema": "Theme", "Sistema": "System", "Claro": "Light", "Oscuro": "Dark", "Idioma": "Language",
  "Tus marcas": "Your marks", "Se guardan solo en este navegador.": "They're saved in this browser only.", "Este navegador no deja guardarlas: se perderán al cerrar.": "This browser can't save them: they'll be lost when you close it.", "Llevas {n} marcadas.": "{n} marked so far.",
  "Exportar a un archivo": "Export to a file", "Importar de un archivo": "Import from a file", "Marcas exportadas": "Marks exported", "Marcas importadas": "Marks imported", "Ese archivo no tiene marcas de Pokopia": "That file has no Pokopia marks", "No se pudo guardar en este navegador": "Couldn't save in this browser",
  "¿Reemplazar tus marcas por las del archivo?\n\nAceptar: reemplazar. Cancelar: juntarlas con las que ya tienes.": "Replace your marks with the file's?\n\nOK: replace. Cancel: merge them with yours.",
  "Web de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company.": "Fan site, not affiliated with Nintendo, Game Freak or The Pokémon Company.",
  "Listo": "Done", "Toca lo que hayas conseguido": "Tap what you've got", "Has marcado {n} hoy": "{n} marked today", "Atrás": "Back", "Elige algo de la lista": "Pick something from the list", "Verás aquí su ficha.": "Its page shows here.", "Toca un Pokémon u objeto": "Tap a Pokémon or item",
  "Guía": "Guide", "Entorno ideal": "Ideal Habitat", "Sabor favorito": "Favorite flavor", "Especialidad": "Specialties", "Gustos": "Favorites", "Hábitat preferido": "Where to Find", "Diseñar una casa con {p}": "Design a house with {p}", "Ubicación actual": "Current location", "Zona": "Area", "Categoría": "Category", "Subcategoría": "Subcategory", "Familia": "Family", "Marcar": "Mark", "Viviendas": "Houses", "Sin indicar": "Not set",
  "Descripción": "Description", "Se construye con": "Built with", "Pokémon que atrae": "Pokémon it attracts", "Zonas": "Areas", "Solo en {z}": "Only in {z}", "Confort": "Comfort", "Confort: {c}": "Comfort: {c}", "Cómo conseguirlo": "How to get it", "Método": "Method",
  "Platos que se preparan con este utensilio": "Dishes made with this utensil", "Ingrediente de": "Ingredient of", "Se usa en hábitats": "Used in habitats", "Atributos": "Attributes", "Cómo se prepara": "How to make it", "Utensilio": "Utensil", "Necesita un Pokémon con": "Needs a Pokémon with", "Ingredientes": "Ingredients", "Potencia": "Boosts", "Sabor": "Flavor",
  "Lo tienes": "You have it", "Atributo": "Attribute", "Entorno": "Environment", "Cualquiera": "Any", "Todas las zonas": "All areas",
  "Diseñar una casa": "Design a house", "Repartir": "Split up", "Añadir residentes": "Add residents", "Elige el primer residente": "Pick the first resident", "Buscar Pokémon": "Search Pokémon", "Mis Pokémon": "My Pokémon", "Incluir otros entornos": "Include other environments",
  "Entorno de la casa: ": "House environment: ", ". Los de otros entornos (luz, temperatura y humedad) estarían menos cómodos.": ". Pokémon from other environments (light, temperature and humidity) would be less comfortable.", "El primer Pokémon que elijas fija el entorno de la casa.": "The first Pokémon you pick sets the house's environment.",
  "Elige Pokémon para ver los compañeros más afines y los objetos que mejor van con sus gustos.": "Pick Pokémon to see the best housemates and the items that suit their likes.", "Ningún Pokémon coincide.": "No Pokémon matches.", "La casa está completa (4 de 4). Quita a un residente para añadir otro.": "The house is full (4 of 4). Remove a resident to add another.",
  "Entorno {e}, distinto al de la casa": "{e} environment, not the house's", "En común: {l}": "In common: {l}", "Sin gustos en común": "No likes in common", "La casa": "The house", " de afinidad": " affinity", "Completar automáticamente": "Fill automatically", "Vaciar": "Empty",
  "Añadir": "Add", "Vacío": "Empty", "{n} objetos gustan a los {r} residentes. En verde, lo común a todos.": "{n} items please all {r} residents. In green, what they all share.", "Todos los objetos": "All items", "Con receta aprendida": "With recipe learned",
  "Ocio": "Fun", "Decoración": "Decoration", "Descanso": "Rest", "Caminos": "Paths", "Juguetes como molinillos o bloques de construcción": "Toys like pinwheels or building blocks", "Adornos como lámparas de seta o guirnaldas": "Decor like mushroom lamps or garlands", "Asientos y camas": "Seats and beds", "Suelos y caminos del entorno": "Floors and paths around",
  "Los objetos de ocio y de decoración cerca de la casa aumentan el confort de sus residentes. Se muestran los más valorados en cada clase.": "Fun and decoration items near the house raise its residents' comfort. The best rated in each kind are shown.",
  "{n} opciones": "{n} options", "{n} opción": "{n} option", "Recomendación por tipo": "Best by type", "El objeto más valorado por los residentes en cada tipo. Cada punto indica un residente al que le gusta.": "The residents' favorite item of each type. Each dot is a resident who likes it.",
  "Todos los objetos afines": "All matching items", "Ordenados por número de residentes a los que les gustan.": "Sorted by how many residents like them.", "Mostrar {n} más": "Show {n} more", "Mostrar menos": "Show less",
  "Comida": "Food", "Los platos que más encajan con sus sabores favoritos y sus gustos.": "The dishes that best match their favorite flavors and likes.",
  "Solo se consideran los objetos con atributos conocidos. El tipo de cada objeto se deduce de su nombre.": "Only items with known attributes count. Each item's type is guessed from its name.",
  "Reparto automático en casas de hasta cuatro Pokémon, cada una de un único entorno, con la mayor afinidad posible.": "Automatic split into houses of up to four Pokémon, one environment each, with the best affinity.",
  "casas": "houses", "de afinidad media": "average affinity", "sin casa": "without a house", "Pokémon en total": "Pokémon in total", "Sin Pokémon para repartir": "No Pokémon to split", "Marca algunos Pokémon o elige «Todos».": "Mark some Pokémon or choose “All”.",
  "Abrir en el diseñador": "Open in the designer", "Sin gustos comunes a todos los residentes.": "No likes shared by every resident.", "Entorno {e}": "{e} environment", "{n} casa": "{n} house", "{n} casas": "{n} houses", "Sin casa": "Without a house", "Pokémon sin compañeros compatibles de su mismo entorno.": "Pokémon with no compatible housemates of their environment.",
  "Muebles": "Furniture", "Utilidades": "Utilities", "Construcción": "Building", "Bloques": "Blocks", "Exterior": "Outdoor", "Naturaleza": "Nature", "Materiales": "Materials", "Kits": "Kits", "Edificios especiales": "Special buildings", "Objetos clave": "Key items", "Objetos útiles": "Useful items", "Varios": "Other",
  "Ensaladas": "Salads", "Sopas": "Soups", "Panes": "Breads", "Hamburguesas": "Burgers", "Batidos": "Smoothies", "Otros": "Other", "También en:": "Also in:", "No hay más Pokémon compatibles con esta casa": "No more compatible Pokémon for this house", "Quitar filtros": "Clear filters", "Quitar a {p}": "Remove {p}", "Cómo se fabrica": "How to craft it", "Desbloqueo: {u}": "Unlocked by: {u}", "Pokémon a los que más les gusta": "Pokémon who like it most",
  "Con receta": "With recipe", "Vistos o con receta": "Seen or with recipe", "¿Qué hago con las marcas que ya tienes?": "What should happen to the marks you already have?", "Juntarlas con las del archivo": "Merge them with the file's", "Reemplazarlas por las del archivo": "Replace them with the file's", "Cancelar": "Cancel",
  "Deshacer": "Undo", "{n} desconocidas ignoradas": "{n} unknown skipped", "Se muestran {n} de {m}: busca para encontrar el resto.": "Showing {n} of {m}: search to find the rest.",
  "Filtros": "Filters", "aquí {n} de {m}": "here {n} of {m}", "Lleva la cuenta de tu partida": "Keep track of your game", "Entendido": "Got it", "Secciones": "Sections", "Ficha": "Details",
  "Toca el círculo de lo que ya tienes o has visto.": "Tap the circle on what you already have or have seen.", "En los objetos, el pergamino marca la receta aprendida.": "On items, the scroll marks a learned recipe.",
  "En la ficha de un Pokémon puedes anotar dónde vive.": "On a Pokémon's page you can note where it lives.", "Tus marcas se guardan solo en este navegador: haz una copia de seguridad de vez en cuando.": "Your marks are saved in this browser only: back them up now and then.",
  "Más filtros": "More filters", "Modo": "Mode", "Mostrar": "Show", "Cama": "Bed", "Mesa": "Table", "Asiento": "Seat", "Luz": "Light", "Almacenaje": "Storage", "En la pared": "On the wall", "Plantas": "Plants", "Alfombra": "Rug", "Puerta y ventana": "Door and window", "Tejado": "Roof", "Suelo": "Floor", "Pared": "Wall",
};
const t = (s, v) => { let o = P.lang === "en" && EN[s] != null ? EN[s] : s; if (v) for (const k in v) o = o.split("{" + k + "}").join(v[k]); return o; };

// ---------- data, as the Guía reads it ----------
// item categories by the game's names (its catalog tabs, ES and EN); cats.js keeps the Guía's own names, renamed here
const CAT_GAME = { "Construcción": "Estructuras", "Varios": "Otros", "Utilidades": "Objetos útiles", "Exterior": "Exteriores" };
const CATS = [["Muebles", "#A2845E", "Furniture"], ["Decoración", "#C9485B", "Misc."], ["Objetos útiles", "#AF52DE", "Utilities"], ["Estructuras", "#6E7B8B", "Buildings"], ["Bloques", "#5E9C76", "Blocks"], ["Exteriores", "#2F9E8F", "Outdoor"],
  ["Naturaleza", "#4E9A6A", "Nature"], ["Comida", "#E8833A", "Food"], ["Materiales", "#8E8E93", "Materials"], ["Kits", "#2F7FD6", "Kits"], ["Edificios especiales", "#B5533C", "Special buildings"], ["Objetos clave", "#D4A017", "Key Items"], ["Otros", "#A1A1A6", "Other"]];
const CAT_EN = Object.fromEntries(CATS.map(c => [c[0], c[2]]));
const SUB_EN = { "Almacenaje": "Storage", "Mesas y asientos": "Tables and seats", "Camas y tocadores": "Beds and dressers", "Puertas, ventanas y tejados": "Doors, windows and roofs", "Estructuras": "Structures",
  "Pinturas y materiales raros": "Paints and rare materials", "Alfombras y otros": "Rugs and more", "Regalos de Pokémon": "Pokémon gifts", "Diarios": "Diaries", "Pistas de hábitat": "Habitat hints",
  "Paredes": "Walls", "Suelos": "Floors", "Rocas": "Rocks", "Tierras": "Soil", "Céspedes": "Grass", "Líquidos": "Liquids", "Semillas de árbol": "Tree seeds", "Semillas": "Seeds", "Cultivos": "Crops",
  "Minerales y corales": "Minerals and coral", "Árboles y plantas": "Trees and plants", "Tesoros": "Treasures", "Menaje": "Tableware", "Aparatos": "Appliances", "Adornos": "Ornaments", "Trofeos": "Trophies",
  "Máquinas y estatuas": "Machines and statues", "Edificios": "Buildings", "Aparatos y farolas": "Devices and streetlights", "Lámparas": "Lamps", "Estaciones": "Stations", "Kits de casa": "House kits",
  "Kits de reparación": "Repair kits", "Medallas": "Badges", "Mejoras": "Upgrades" };
// comfort kinds (comfort.js) by the game's names: Nivel de confort / Comfort Report
const COMF = { "Ocio": ["Objeto de ocio", "Toy"], "Descanso": ["Objeto de descanso", "Relaxation"], "Decoración": ["Decoración", "Decoration"], "Caminos": ["Pavimento", "Road"] };
const ENV_EN = { "Iluminado": "Bright", "Oscuro": "Dark", "Húmedo": "Humid", "Seco": "Dry", "Calentito": "Warm", "Fresquito": "Cool" };
const FLAV_EN = { dulce: "Sweet", amargo: "Bitter", "ácido": "Sour", seco: "Dry", picante: "Spicy", normal: "Mild" };
const PEN = Object.assign({ tags: {}, spw: {}, areas: {}, habs: {}, habDesc: {}, itemDesc: {} }, window.PANEL_EN);
const en = () => P.lang === "en";
const tCat = c => en() ? CAT_EN[c] || c : c;
const tSub = c => en() ? SUB_EN[c] || c : c;
const tComf = c => COMF[c] ? COMF[c][en() ? 1 : 0] : c;
const tEnv = e => en() ? ENV_EN[e] || e : e;
const tFlav = f => en() ? FLAV_EN[f] || f : cap(f);
const tSpw = s => cap(en() ? PEN.spw[s] || s : s);
const tArea = z => en() ? PEN.areas[z] || t(z) : z;
// a game description in the chosen language (en.js has the game's English, keyed by the Spanish text)
const tDesc = d => en() && (PEN.habDesc[d] || PEN.itemDesc[d]) || d;
// spawn words (from the web data, in Spanish) and "X o Y" area lists
const SPAWN_EN = { "Común": "Common", "Rara": "Rare", "Muy rara": "Very rare", "Mañana": "Morning", "Día": "Day", "Tarde": "Evening", "Noche": "Night", "Sol": "Sun", "Nublado": "Clouds", "Lluvia": "Rain" };
const tSpawn = w => en() ? SPAWN_EN[w] || w : w;
const tAreas = s => en() ? s.split(" o ").map(tArea).join(" or ") : s;
const CAT_COLOR = Object.fromEntries(CATS);
const FAMS = [["ensalada", "Ensaladas", "Tabla de cortar", "#4E9A6A"], ["sopa", "Sopas", "Olla", "#2F7FD6"], ["pan", "Panes", "Horno de pan", "#C08A3E"], ["hamburguesa", "Hamburguesas", "Sartén", "#B5533C"], ["batido", "Batidos", "Batidora", "#A04FCF"]];
const FLAVORS = ["dulce", "amargo", "ácido", "seco", "picante", "normal"];
const ZONE_ENDS = [[49, "Estepa Estéril"], [97, "Bahía Borrasca"], [136, "Riscos Rocosos"], [183, "Islas Aisladas"], [209, "Pradera Paleta"]];
const ZONES = ZONE_ENDS.map(z => z[1]).concat(["Cuenca Coralina", "Otros"]);
// the places a Pokémon can live (areas.js, the game's area names), for "Ubicación actual"
const LIVE_ZONES = uniq((window.PANEL_AREAS || []).filter(Boolean));
const mainZone = x => !x ? "" : x.dk === "Cuenca" ? "Cuenca Coralina" : x.dk || x.num == null ? "" : ((ZONE_ENDS.find(([n]) => x.num <= n) || [])[1] || "");
const ITEMS = (D.items || []).map(it => GCATS[it[0]] ? [it[0], it[1], it[2], GCATS[it[0]][0], GCATS[it[0]][1]] : it).map(it => CAT_GAME[it[3]] ? [it[0], it[1], it[2], CAT_GAME[it[3]], it[4]] : it);
const HABS = D.habitats || [], DISHES = D.dishes || {}, DESC = D.itemDesc || {}, ITAGS = D.itemTags || {}, IWEB = D.itemWeb || {}, COMFORT = window.PANEL_COMFORT || {};
const POKS = (D.pokemon || []).map(p => typeof p === "string" ? { n: p, habs: [], likes: [], spw: [] } : p);
const RECIPES = D.recipes || [], TAGS = D.tags || [];
const ENVS = uniq(POKS.map(p => p.env).filter(Boolean)).sort((a, b) => a.localeCompare(b, "es"));
const SPWS = uniq(POKS.flatMap(p => p.spw || [])).filter(s => s && /^[a-záéíóúñ]/.test(s)).sort((a, b) => a.localeCompare(b, "es"));
const ITEM_IMG = new Set(IMG.item || []);
const itemById = new Map(ITEMS.map(it => [it[0], it]));
// an item you craft (crafts.js: what each recipe makes), by name: the game repeats items under several ids
const CRAFTABLE = new Set((window.PANEL_CRAFTS || []).filter(Boolean).map(id => itemById.has(id) ? fold(itemById.get(id)[1]) : ""));
const canCraft = it => CRAFTABLE.has(fold(it[1]));
// one card per name and category, preferring the id that has a picture
const BROWSE = (() => { const seen = new Map(); for (const it of ITEMS) { if (!it[1] || it[1] === "(?)" || it[3] === "Recetas") continue;
  const k = it[3] + "|" + fold(it[1]), o = seen.get(k); if (!o || (!ITEM_IMG.has(o[0]) && ITEM_IMG.has(it[0]))) seen.set(k, it); } return [...seen.values()]; })();
const pokZone = p => mainZone(HABS[(p.habs || [])[0]]) || "Otros";
const famOf = r => FAMS.find(f => f[0] === r[2]) || FAMS[0];
const shortLike = s => s.replace(/^cosas (que |con |de |para |donde )?/, "").replace(/^evocan /, "");
// a like as the game says it (English from en.js), short in Spanish: "cosas de madera" → "madera"
const like = s => en() && PEN.tags[s] ? PEN.tags[s] : shortLike(s);
const enName = s => s ? s.replace(/(^|\s)\S/g, m => m.toUpperCase()) : "";

// ---------- your marks: localStorage "pokopia:v1" ----------
// pok: Pokémon you have · zone: where each lives · hab, items, rec: habitats, items and dishes you have seen · craft: recipes learned
const KEY = "pokopia:v1", KINDS = ["pok", "hab", "craft", "items", "rec"];
let M = blank(), storeOk = true;
function blank() { return { v: 1, pok: [], hab: [], craft: [], items: [], rec: [], zone: {}, at: {} }; }
const isObj = x => x != null && typeof x === "object" && !Array.isArray(x);
// a marks file: version 1 and at least one list of marks (a list left out counts as empty)
const valid = o => isObj(o) && o.v === 1 && ["pok", "hab", "items", "rec", "craft"].some(k => Array.isArray(o[k]));
// what a file or the store holds, keeping only marks of things that exist: names of Pokémon, habitats and dishes,
// ids of items and recipes, known places, and finite times
function clean(o) {
  const m = blank(), known = { pok: new Set(POKS.map(p => p.n)), hab: new Set(HABS.map(x => x.n)), rec: new Set(RECIPES.map(r => r[0])), items: itemById, craft: itemById };
  for (const k of KINDS) if (Array.isArray(o[k])) m[k] = uniq(o[k].filter(x => known[k].has(x)));
  const pairs = x => isObj(x) ? Object.entries(x).filter(([k]) => k !== "__proto__") : [];
  for (const [n, z] of pairs(o.zone)) if (known.pok.has(n) && LIVE_ZONES.includes(z)) m.zone[n] = z;
  for (const [k, v] of pairs(o.at)) if (Number.isFinite(v)) m.at[k] = v;
  return m;
}
const markCount = m => KINDS.reduce((n, k) => n + m[k].length, 0);
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { storeOk = false; return; }
  if (raw == null) return;
  let o = null; try { o = JSON.parse(raw); } catch (e) { }
  if (valid(o)) { M = clean(o); return; }
  // unreadable marks are kept aside, never overwritten by the next tap
  try { localStorage.setItem(KEY + ":bad-" + Date.now(), raw); } catch (e) { }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(M)); storeOk = true; }
  catch (e) { if (storeOk) toast(t("No se pudo guardar en este navegador")); storeOk = false; }
}
let SETS = {};
const resets = () => { SETS = Object.fromEntries(KINDS.map(k => [k, new Set(M[k])])); };
const has = (set, id) => SETS[set].has(id);
function flip(set, id) {
  const s = SETS[set], k = set + ":" + id;
  if (s.has(id)) { s.delete(id); delete M.at[k]; if (set === "pok") delete M.zone[id]; } else { s.add(id); M.at[k] = Date.now(); }
  M[set] = [...s]; save();
}
const toggle = (set, id) => { flip(set, id); render(); };
// a mark from a list card: says what changed, with a way to take it back
function markWithUndo(set, id, name) {
  const zone = set === "pok" ? M.zone[id] : null, on = !has(set, id);
  toggle(set, id);
  toast((on ? "✓ " : "○ ") + name, t("Deshacer"), () => { flip(set, id); if (zone) M.zone[id] = zone, save(); render(); });
}
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return Object.values(M.at).filter(x => x >= +d).length; };
const hasPok = k => has("pok", POKS[k].n);
const zoneOf = k => hasPok(k) && M.zone[POKS[k].n] || "";
function setZone(name, z) { if (z) { M.zone[name] = z; if (!has("pok", name)) flip("pok", name); } else delete M.zone[name]; save(); render(); }

// ---------- the lists: each entry {kind, id, name, sub, pic, group}; "set" is the mark the circle toggles ----------
const pokPic = p => IMG.pok && IMG.pok[p.n] ? { src: "img/pokemon/" + IMG.pok[p.n] } : { sq: p.n, color: "#E5484D" };
const habPic = x => x.img ? { src: "img/habitats/" + x.img, hab: true } : { sq: x.n, color: "#30A46C" };
const itemPic = it => ITEM_IMG.has(it[0]) ? { src: "img/items/" + it[0] + ".png" } : { sq: it[1], color: CAT_COLOR[it[3]] || "#8E8E93" };
const dishPic = r => r[6] != null && ITEM_IMG.has(r[6]) ? { src: "img/items/" + r[6] + ".png" } : { sq: r[0], color: famOf(r)[3] };
const ENTRIES = {
  pok: POKS.map((p, k) => ({ kind: "pok", set: "pok", id: p.n, name: p.n, num: num(p.dex), pic: pokPic(p), group: pokZone(p), o: p, k })),
  hab: HABS.map((x, i) => ({ kind: "hab", set: "hab", id: x.n, name: x.n, en: PEN.habs && PEN.habs[x.n], num: num(x.num), pic: habPic(x), group: mainZone(x) || "Otros", o: x, i })),
  obj: BROWSE.map(it => ({ kind: "obj", set: "items", id: it[0], name: it[1], en: enName(it[2]), craft: canCraft(it), pic: itemPic(it), group: it[3], subcat: it[4] || "", o: it })),
  rec: RECIPES.map(r => ({ kind: "rec", set: "rec", id: r[0], name: r[0], en: r[6] != null && itemById.has(r[6]) ? enName(itemById.get(r[6])[2]) : "", pic: dishPic(r), group: famOf(r)[1], o: r })),
};
const nm = e => P.lang === "en" && e.en ? e.en : e.name;
const gname = (kind, g) => kind === "obj" ? tCat(g) : kind === "rec" ? t(g) : tArea(g);
function subOf(e, inList) {
  if (e.kind === "pok" || e.kind === "hab") return inList ? e.num : [e.num, gname(e.kind, e.group)].filter(Boolean).join(" · ");
  // the list's group header already names the subcategory once a category is picked
  if (e.kind === "obj") return [e.subcat && !(inList && S.group) ? tSub(e.subcat) : "", COMFORT[e.id] ? t("Confort: {c}", { c: tComf(COMFORT[e.id]).toLowerCase() }) : ""].filter(Boolean).join(" · ");
  return [flavIco(e.o[4]), tFlav(e.o[4])];
}
const whereOf = e => e.kind === "pok" && hasPok(e.k) ? zoneOf(e.k) : "";
const whereTxt = z => h("span", { class: "where" }, h("span", { class: "ico", html: svg(HOME, 12) }), h("span", null, tArea(z)));
const KIND = {
  pok: { glabel: "Zona", groups: ZONES, on: "Lo tengo", off: "Marcar como mío", filt: ["Tengo", "Me faltan"] },
  hab: { glabel: "Zona", groups: ZONES, on: "Visto", off: "Marcar como visto", filt: ["Visto", "No visto"] },
  obj: { glabel: "Categoría", groups: CATS.map(c => c[0]), on: "Visto", off: "Marcar como visto", filt: ["Visto", "No visto"] },
  rec: { glabel: "Familia", groups: FAMS.map(f => f[1]), on: "Visto", off: "Marcar como visto", filt: ["Visto", "No visto"] },
};
const TABS = [
  { k: "pok", t: "Pokémon", icon: '<circle cx="11" cy="11" r="8"/><path d="M3 11h5.5M13.5 11H19"/><circle cx="11" cy="11" r="2.5"/>' },
  { k: "hab", t: "Hábitats", icon: '<path d="M11 3l5 7h-3l4 6H5l4-6H6z"/><path d="M11 16v3"/>' },
  { k: "obj", t: "Objetos", icon: '<path d="M4 7l7-3.5L18 7v8l-7 3.5L4 15z"/><path d="M4 7l7 3.5L18 7M11 10.5v8"/>' },
  { k: "rec", t: "Cocina", icon: '<path d="M4 11h14a7 7 0 01-14 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3"/>' },
  { k: "casa", t: "Viviendas", icon: '<path d="M4 10l7-6 7 6v8H4z"/><path d="M9 18v-5h4v5"/>' },
];
const tabOf = k => TABS.find(x => x.k === k);
const find = (kind, id) => ENTRIES[kind].find(e => e.id === id);
// the card of an item id (the list keeps one per name)
const itemEntry = id => { const it = itemById.get(id); if (!it) return null; const f = fold(it[1]);
  const b = BROWSE.find(x => x[3] === it[3] && fold(x[1]) === f) || BROWSE.find(x => fold(x[1]) === f); return b ? find("obj", b[0]) : null; };
const itemByName = name => { const b = BROWSE.find(x => fold(x[1]) === fold(name)); return b ? find("obj", b[0]) : null; };
const learned = e => !!e && e.craft && has("craft", e.id);

// ---------- state and navigation ----------
// The address holds where you are (#pok, #pok/Charmander, #obj/1052, #casa/Pidgey,Pidgeot, #casa/rep), so Back and
// links work. Every in-app step is pushed with {app: true}; the ficha's Atrás pops it, or (after a deep link) replaces
// the address with the list. Each list tab keeps its own filters and scroll while you visit others.
// f: the filters a link can set (attribute, flavour, environment, specialty, current location); rf: the recipe filter
const S = { tab: "pok", sel: null, show: "all", q: "", group: "", sub: "", limit: 120, f: {}, rf: "",
  cmode: "", house: [], hq: "", hmine: "sí", hzone: "", hother: false, hgot: "", hopen: new Set(), hmore: 20, hcand: 10, hpick: true };
const LIST_TABS = ["pok", "hab", "obj", "rec"];
const freshList = () => ({ show: "all", q: "", group: "", sub: "", limit: 120, f: {}, rf: "" });
const SNAP = {};          // per tab: its list state and scroll, saved when you leave it
let pendingList = null;   // list state a link asks for (listBy), applied when its tab opens
let pendingScroll = null; // list scroll to restore after the next render
const pokByKey = x => /^\d+$/.test(x) ? (POKS[+x] ? +x : -1) : POKS.findIndex(p => p.n === x);
function readHash() {
  let hs = ""; try { hs = decodeURIComponent(location.hash.slice(1)); } catch (e) { }
  const [tb, ...rest] = hs.split("/"), id = rest.join("/");
  S.tab = tabOf(tb) ? tb : "pok";
  if (S.tab === "casa") { S.sel = null; S.cmode = id === "rep" ? "rep" : "";
    if (id !== "rep") { const m = uniq(id.split(",").filter(Boolean).map(pokByKey).filter(k => k >= 0)).slice(0, 4);
      if (m.join() !== S.house.join()) { S.house = m; S.hmore = 20; S.hopen = new Set(); S.hcand = 10; } }
    return; }
  S.sel = !id ? null : find(S.tab, S.tab === "obj" ? +id : id) || null;
}
const hashOf = (tab, e) => encodeURIComponent(tab) + (e ? "/" + encodeURIComponent(e.id) : "");
const casaHash = () => "casa" + (S.cmode === "rep" ? "/rep" : S.house.length ? "/" + S.house.map(k => encodeURIComponent(POKS[k].n)).join(",") : "");
let routed = null;
function route() {
  if (location.hash === routed) return;   // popstate and hashchange both fire for one step
  routed = location.hash; closeSheet();
  const was = S.tab; readHash();
  if (was !== S.tab) SNAP[was] = Object.assign(LIST_TABS.includes(was) ? Object.fromEntries(Object.keys(freshList()).map(k => [k, S[k]])) : {}, { scroll: $("list").scrollTop });
  if (pendingList) { Object.assign(S, pendingList); pendingList = null; }
  else if (was !== S.tab) { const snap = SNAP[S.tab] || {}; if (LIST_TABS.includes(S.tab)) Object.assign(S, freshList(), snap); pendingScroll = snap.scroll || 0; }
  render();
}
// go somewhere in the app: a new history step, or the same step replaced (house edits, Atrás after a deep link)
function goTo(hash, replace) {
  if (location.hash.slice(1) === hash) { render(); return; }
  history[replace ? "replaceState" : "pushState"]({ app: true }, "", "#" + hash); route();
}
const open = e => goTo(hashOf(e.kind, e));
function back() { if (history.state && history.state.app) history.back(); else goTo(S.tab, true); }
// a link that lists by a filter: Objetos by attribute or category, Cocina by flavour, Pokémon by environment or specialty
const listBy = (tab, f, extra) => () => { const l = Object.assign(freshList(), { f }, extra);
  if (S.tab === tab && !S.sel) { Object.assign(S, l); render(); } else { pendingList = l; goTo(tab); } };
window.addEventListener("popstate", route);
window.addEventListener("hashchange", route);

// ---------- drawing ----------
const $ = id => document.getElementById(id);
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (k === "html") e.innerHTML = v; else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k);
  return e;
}
const svg = (inner, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="${size <= 14 ? 2.2 : size <= 18 ? 1.8 : 1.6}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const CHECK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.3l2.3 2.3L9.5 3.6"/></svg>';
const SCROLL = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2h5.5a1 1 0 011 1v7H4a1 1 0 01-1-1z"/><path d="M4.8 4.5h3M4.8 6.5h3"/></svg>';
const SEARCH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/></svg>';
const HOME = '<path d="M3 10l8-7 8 7v9H3z"/><path d="M9 19v-6h4v6"/>';
// one symbol per environment and flavour (the game's six of each)
const ENV_ICO = { "Iluminado": '<circle cx="11" cy="11" r="3.5"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.3 5.3l1.4 1.4M15.3 15.3l1.4 1.4M5.3 16.7l1.4-1.4M15.3 6.7l1.4-1.4"/>',
  "Oscuro": '<path d="M17 13.5A7 7 0 018.5 5a7 7 0 108.5 8.5z"/>', "Húmedo": '<path d="M11 3.5s-5.5 6-5.5 9.5a5.5 5.5 0 0011 0c0-3.5-5.5-9.5-5.5-9.5z"/>',
  "Seco": '<path d="M3 17h16"/><path d="M5 17c1-4 3.5-6 6-6s5 2 6 6"/><path d="M15 4.5l-1 1.8M18.5 7l-1.8 1M11 3v2"/>', "Calentito": '<path d="M11 19a5 5 0 005-5c0-3-2-4.5-2.5-7.5-1.5 1-2.5 2.5-2.5 4.5-1-.5-1.5-1.5-1.5-3C7.5 9.5 6 11.5 6 14a5 5 0 005 5z"/>',
  "Fresquito": '<path d="M11 3v16M4 7l14 8M4 15l14-8"/><path d="M9 4.5l2 1.5 2-1.5M9 17.5l2-1.5 2 1.5"/>' };
const FLAV_ICO = { dulce: '<circle cx="11" cy="11" r="3.5"/><path d="M7.7 9.6L4 7v8l3.7-2.6M14.3 9.6L18 7v8l-3.7-2.6"/>', picante: '<path d="M15 6c-3 0-4 3-5.5 6.5S6 18 4 18c6 1 12-3 12-9 0-1.2-.4-2.3-1-3z"/><path d="M15 6c0-1.5 1-2.5 2.5-2.5"/>',
  "ácido": '<ellipse cx="11" cy="11" rx="7" ry="5" transform="rotate(-35 11 11)"/><path d="M8 14l6-6"/>', amargo: '<path d="M5 9h10v4a5 5 0 01-10 0z"/><path d="M15 10h1.5a2 2 0 010 4H15"/><path d="M8 4.5c0 1.5 1 1.5 1 3M11.5 4.5c0 1.5 1 1.5 1 3"/>',
  seco: '<path d="M11 19V8"/><path d="M11 9c-2.5 0-3.5-2-3.5-4 2.5 0 3.5 2 3.5 4zM11 9c2.5 0 3.5-2 3.5-4-2.5 0-3.5 2-3.5 4zM11 13c-2.5 0-3.5-2-3.5-4 2.5 0 3.5 2 3.5 4zM11 13c2.5 0 3.5-2 3.5-4-2.5 0-3.5 2-3.5 4z"/>',
  normal: '<circle cx="11" cy="11" r="7"/><circle cx="11" cy="11" r="3.5"/>' };
const ico = (map, k, size = 13) => map[k] ? h("span", { class: "ico", html: svg(map[k], size) }) : null;
const envIco = (e, size) => ico(ENV_ICO, e, size), flavIco = (f, size) => ico(FLAV_ICO, f || "normal", size);
const CHEV = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5L7 9l3.5-3.5"/></svg>';
// the logo: a sprout growing out of a little island, in the Guía's blue and green
const LOGO = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="8" fill="var(--accent)"/><ellipse cx="15" cy="21.5" rx="9" ry="3.2" fill="#FFFFFF" opacity=".95"/><path d="M15 20.5V13" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><path d="M15 14.5c-.4-3.4-2.6-5.4-6-5.6.2 3.4 2.4 5.5 6 5.6z" fill="#7FE08A"/><path d="M15 13c.3-3.2 2.4-5.2 5.8-5.4-.1 3.3-2.3 5.3-5.8 5.4z" fill="#B8F5BE"/></svg>';
const brand = () => h("div", { class: "brand" }, h("span", { class: "logo", html: LOGO }), h("span", { class: "bname" }, "Mi Pokopia", h("span", { class: "bsub" }, "Companion")));
function pic(p, cls) {
  if (p.src) return h("img", { class: "pic" + (p.hab ? " hab" : "") + (cls ? " " + cls : ""), src: p.src, alt: "", loading: "lazy", onerror: ev => ev.target.replaceWith(pic({ sq: p.sq || "?", color: "#8E8E93" }, cls)) });
  return h("span", { class: "pic sq" + (cls ? " " + cls : ""), style: "background:" + p.color, "aria-hidden": "true" }, (p.sq || "?").charAt(0).toUpperCase());
}
const pokPicK = k => pic(ENTRIES.pok[k].pic);
const segc = (opts, val, set, label) => h("div", { class: "seg", role: "group", "aria-label": label }, opts.map(([k, l]) => h("button", { "aria-pressed": String(val === k), onclick: () => { set(k); render(); } }, l)));
// a filter as a field: its label on top and the select below, so the filters line up in columns
function pick(label, all, opts, val, set, show) {
  return h("label", { class: "ffield" + (val ? " on" : "") }, h("span", { class: "flabel" }, t(label)),
    h("span", { class: "fsel" }, h("select", { onchange: e => { set(e.target.value); S.limit = 120; render(); } }, h("option", { value: "" }, t(all)),
      opts.map(o => h("option", { value: o, selected: o === val ? true : null }, show ? show(o) : o))), h("span", { class: "chev", html: CHEV })));
}
const frow = (label, ...kids) => h("div", { class: "frow" }, h("span", { class: "flabel" }, label), ...kids);
const chip = (label, on, onclick, icon) => h("button", { class: "chip", "aria-pressed": String(on), onclick }, icon || null, label);
const subtab = (label, on, onclick) => h("button", { class: "subtab", "aria-pressed": String(on), onclick }, label);
// the subcategories of the picked item category, in the order the list shows them
const subsOf = cat => uniq(ENTRIES.obj.filter(e => e.group === cat).map(e => e.subcat)).filter(Boolean);
function card(e) {
  const own = has(e.set, e.id), sub = subOf(e, true);
  const k = e.kind + ":" + e.id;
  return h("div", { class: "card " + (own ? "own" : "miss") + (S.sel === e ? " sel" : "") },
    h("button", { class: "copen", "data-k": "open:" + k, onclick: () => open(e) }, pic(e.pic), h("span", { class: "t" }, h("b", null, nm(e)), sub ? h("span", null, sub) : null, whereOf(e) ? whereTxt(whereOf(e)) : null)),
    h("button", { class: "mark", "data-k": "mark:" + k, "aria-pressed": String(own), "aria-label": t(KIND[e.kind].on) + ": " + nm(e), html: CHECK, onclick: () => markWithUndo(e.set, e.id, nm(e)) }),
    e.craft ? h("button", { class: "rmark", "data-k": "rmark:" + k, "aria-pressed": String(learned(e)), "aria-label": t("Tengo la receta") + ": " + nm(e), title: t(learned(e) ? "Receta aprendida" : "Receta por aprender"), html: SCROLL, onclick: () => markWithUndo("craft", e.id, nm(e)) }) : null);
}
function visible(kind, anyMark) {
  const q = fold(S.q.trim()), f = S.f;
  return ENTRIES[kind].filter(e => (!q || fold(e.name).includes(q) || (e.en && fold(e.en).includes(q))) && (!S.group || e.group === S.group) && (!S.sub || e.subcat === S.sub) && (anyMark || S.show === "all" || (S.show === "own") === has(e.set, e.id))
    && (kind !== "pok" || ((!f.env || e.o.env === f.env) && (!f.spw || (e.o.spw || []).includes(f.spw)) && (!f.zone || zoneOf(e.k) === f.zone)))
    && (kind !== "obj" || ((!f.tag || (ITAGS[e.id] || []).includes(f.tag)) && (!S.rf || (S.rf === "craft" ? e.craft : S.rf === "learned" ? learned(e) : e.craft && !learned(e)))))
    && (kind !== "rec" || !f.flavor || e.o[4] === f.flavor));
}
const QUICK = '<rect x="3.5" y="3.5" width="15" height="15" rx="4"/><path d="M7.5 11.2l2.4 2.4 4.6-5"/>';
const BACKUP = '<rect x="3.5" y="4" width="15" height="4.5" rx="1.2"/><path d="M5 8.5V17a1 1 0 001 1h10a1 1 0 001-1V8.5"/><path d="M9 12h4"/>';
// the header: brand and four buttons of one shape (mark, language, theme, backup); then title, search, what to show and the filters, each full width
function header() {
  const tb = tabOf(S.tab), el = $("top"); el.replaceChildren();
  el.append(h("div", { class: "row1" }, brand(), h("span", { class: "grow" }), h("div", { class: "hbtns" },
    h("button", { class: "hbtn quick", "aria-label": t("Marcar rápido"), title: t("Marcar rápido"), onclick: quick }, h("span", { class: "hface", html: svg(QUICK, 18) }), h("span", { class: "ql" }, t("Marcar")), h("span", { class: "qlong" }, t("Marcar rápido"))),
    prefMenu("lang", "Idioma", LANGS), prefMenu("theme", "Tema", THEMES),
    h("button", { class: "hbtn", "aria-label": t("Copia de seguridad"), title: t("Copia de seguridad"), onclick: menu }, h("span", { class: "hface", html: svg(BACKUP, 18) })))));
  el.append(h("h1", null, t(tb.t)));
  if (S.tab === "casa") { el.append(segc([["", t("Diseñar una casa")], ["rep", t("Repartir")]], S.cmode, v => { S.cmode = v; goTo(casaHash(), true); }, t("Modo"))); return; }
  const kind = S.tab, K = KIND[kind], all = ENTRIES[kind], mine = all.filter(e => has(e.set, e.id)).length;
  const input = h("input", { placeholder: t("Buscar"), "aria-label": t("Buscar"), value: S.q, type: "search", oninput: ev => { S.q = ev.target.value; S.limit = 120; list(); } });
  el.append(h("div", { class: "msearch", html: SEARCH }, input));
  el.append(segc([["all", t("Todos")], ["own", t(K.filt[0])], ["miss", t(K.filt[1])]], S.show, v => { S.show = v; S.limit = 120; }, t("Mostrar")));
  // 1: the main kind (area, category, family) · 2: an item category's subcategories · 3: the other filters, as fields in columns
  const groups = K.groups.filter(g => all.some(e => e.group === g)), setG = g => () => { S.group = g; S.sub = ""; S.limit = 120; render(); };
  const rows = [frow(t(K.glabel), h("div", { class: "chips" }, chip(t("Todo"), !S.group, setG("")), groups.map(g => chip(gname(kind, g), S.group === g, setG(S.group === g ? "" : g)))))];
  const subs = kind === "obj" && S.group ? subsOf(S.group) : [];
  if (subs.length > 1) rows.push(frow(t("Subcategoría"), h("div", { class: "subtabs" }, subtab(t("Todo"), !S.sub, () => { S.sub = ""; render(); }), subs.map(x => subtab(tSub(x), S.sub === x, () => { S.sub = x; S.limit = 120; render(); })))));
  const setF = k => v => { S.f = Object.assign({}, S.f, { [k]: v }); if (!v) delete S.f[k]; };
  const fields = kind === "pok" ? [pick("Entorno", "Cualquiera", ENVS, S.f.env, setF("env"), tEnv), pick("Especialidad", "Cualquiera", SPWS, S.f.spw, setF("spw"), tSpw), pick("Ubicación actual", "Cualquiera", LIVE_ZONES, S.f.zone, setF("zone"), tArea)]
    : kind === "obj" ? [pick("Receta", "Cualquiera", ["craft", "learned", "tolearn"], S.rf, v => { S.rf = v; }, v => t({ craft: "Se fabrica", learned: "Receta aprendida", tolearn: "Receta por aprender" }[v])), pick("Atributo", "Cualquiera", TAGS, S.f.tag, setF("tag"), v => cap(like(v)))]
    : [];
  // Cocina: the flavour as chips with their symbols, one more row
  if (kind === "rec") rows.push(frow(t("Sabor"), h("div", { class: "chips" }, chip(t("Todo"), !S.f.flavor, () => { setF("flavor")(""); render(); }),
    FLAVORS.map(f => chip(tFlav(f), S.f.flavor === f, () => { setF("flavor")(S.f.flavor === f ? "" : f); S.limit = 120; render(); }, flavIco(f))))));
  if (fields.length) rows.push(h("div", { class: "frow more" }, h("span", { class: "flabel" }, t("Más filtros")), h("div", { class: "fgrid", style: "--n:" + fields.length }, fields)));
  el.append(h("div", { class: "filters" }, rows));
  const nf = (S.group ? 1 : 0) + (S.sub ? 1 : 0) + (S.rf ? 1 : 0) + Object.keys(S.f).length;
  el.append(h("button", { class: "fsum", onclick: () => { $("list").scrollTop = 0; $("top").classList.remove("compact"); } },
    h("span", { class: "ico", html: svg('<path d="M4 6h14M7 11h8M9.5 16h3"/>', 16) }), t("Filtros"), nf ? h("span", { class: "fcount" }, String(nf)) : null));
  const prog = kind === "pok" ? t("Tienes {n} Pokémon de {m}", { n: mine, m: all.length }) : kind === "obj"
    ? t("Has visto {n} de {m} · {r} recetas de {c}", { n: mine, m: all.length, r: all.filter(learned).length, c: all.filter(e => e.craft).length })
    : kind === "rec" ? t("Has visto {n} platos de {m}", { n: mine, m: all.length }) : t("Has visto {n} de {m}", { n: mine, m: all.length });
  const vis = nf || S.q ? visible(kind, true) : null, vown = vis ? vis.filter(e => has(e.set, e.id)).length : 0;
  el.append(h("div", { class: "prog" }, h("span", null, prog, vis ? h("b", null, " · " + t("aquí {n} de {m}", { n: vown, m: vis.length })) : null), h("span", { class: "bar" }, h("i", { style: "width:" + (mine / all.length * 100) + "%" }))));
}
function elsewhere() {
  const q = fold(S.q.trim()); if (!q) return null;
  const hits = TABS.filter(x => x.k !== "casa" && x.k !== S.tab).map(x => [x, ENTRIES[x.k].filter(e => fold(e.name).includes(q) || (e.en && fold(e.en).includes(q))).length]).filter(([, n]) => n);
  return hits.length ? h("div", { class: "elsewhere" }, h("span", { class: "small muted" }, t("También en:")), hits.map(([x, n]) => h("button", { class: "chip", onclick: listBy(x.k, {}, { q: S.q }) }, t(x.t) + " · " + n))) : null;
}
function list() {
  const el = $("list"); el.replaceChildren();
  if (S.tab === "casa") { el.append(S.cmode === "rep" ? repartir() : casa()); return; }
  const kind = S.tab, K = KIND[kind], es = visible(kind);
  if (!es.length) { const none = S.show === "own" && !S.q && !S.group && !S.sub && !S.rf && !Object.keys(S.f).length;
    el.append(h("div", { class: "empty" }, h("b", null, t(none ? "Aún no has marcado nada aquí" : "Nada coincide")), t(none ? "Toca el círculo de una tarjeta o usa Marcar rápido." : "Prueba con otra búsqueda o quita los filtros."),
      none ? null : h("button", { class: "btn", onclick: () => { Object.assign(S, freshList()); render(); } }, t("Quitar filtros"))), elsewhere() || ""); return; }
  let shown = 0;
  const bySub = kind === "obj" && S.group && !S.sub && subsOf(S.group).length > 1;
  const parts = bySub ? subsOf(S.group).concat([""]).map(x => [x ? tSub(x) : t("Otros"), es.filter(e => e.subcat === x)]) : K.groups.map(g => [gname(kind, g), es.filter(e => e.group === g)]);
  for (const [label, ge] of parts) {
    if (!ge.length || shown >= S.limit) continue;
    const take = ge.slice(0, S.limit - shown); shown += take.length;
    el.append(h("div", { class: "gh" }, label, h("span", { class: "n" }, String(ge.length))), h("div", { class: "grid" }, take.map(card)));
  }
  if (es.length > shown) el.append(h("button", { class: "btn more", onclick: () => { S.limit += 240; list(); } }, t("Ver más ({n})", { n: es.length - shown })));
  const other = elsewhere(); if (other) el.prepend(other);
  if (!P.tipsSeen && !markCount(M)) el.prepend(tips());
}
function tips() {
  const line = (icon, text) => h("li", null, h("span", { class: "tico", html: icon }), h("span", null, t(text)));
  return h("section", { class: "tips" }, h("b", null, t("Lleva la cuenta de tu partida")),
    h("ul", null, line(CHECK, "Toca el círculo de lo que ya tienes o has visto."), line(SCROLL, "En los objetos, el pergamino marca la receta aprendida."),
      line(svg(HOME, 14), "En la ficha de un Pokémon puedes anotar dónde vive."), line(svg(BACKUP, 14), "Tus marcas se guardan solo en este navegador: haz una copia de seguridad de vez en cuando.")),
    h("button", { class: "btn", onclick: () => setPref("tipsSeen", 1) }, t("Entendido")));
}
function nav() {
  const counts = k => k === "casa" ? "" : ENTRIES[k].filter(e => has(e.set, e.id)).length + "/" + ENTRIES[k].length;
  const to = k => () => {
    if (k === S.tab && !S.sel) { if (LIST_TABS.includes(k)) Object.assign(S, freshList()); $("list").scrollTop = 0; render(); return; }
    goTo(k === "casa" ? casaHash() : k);
  };
  $("tabbar").replaceChildren(...TABS.map(x => h("button", { "aria-current": S.tab === x.k ? "page" : null, "data-k": "tab:" + x.k, onclick: to(x.k) }, h("span", { html: svg(x.icon) }), t(x.t))));
  $("side").replaceChildren(brand(),
    ...TABS.map(x => h("button", { class: "navi", "aria-current": S.tab === x.k ? "page" : null, "data-k": "navi:" + x.k, onclick: to(x.k) }, h("span", { class: "nico", html: svg(x.icon, 18) }), h("span", { class: "grow" }, t(x.t)), h("span", { class: "n" }, counts(x.k)))),
    h("span", { class: "spacer" }), h("p", { class: "fan side-fan" }, t("Web de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company.")));
}

// ---------- Casa: the Guía's designer and Repartir (logic in ../panel/casa.js), on your marked Pokémon ----------
const MC = ["#E5484D", "#0A84FF", "#E8A33A", "#AF52DE"];   // one colour per housemate
const anyPok = () => SETS.pok.size > 0;
const mineOk = k => !S.hmine || !anyPok() || (hasPok(k) && (!S.hzone || zoneOf(k) === S.hzone));
const yourZones = () => LIVE_ZONES.filter(z => Object.values(M.zone).includes(z));
const fixZone = () => { if (S.hzone && !yourZones().includes(S.hzone)) S.hzone = ""; };
const setHouse = m => { const inCasa = S.tab === "casa"; S.house = m; S.cmode = ""; goTo(casaHash(), inCasa); };
const ownCls = k => hasPok(k) ? "own" : "miss";
const pctTxt = f => Math.round(f * 100) + "%";
const toggleOpen = key => { S.hopen.has(key) ? S.hopen.delete(key) : S.hopen.add(key); render(); };
const whereTag = k => hasPok(k) && zoneOf(k) && !S.hzone ? whereTxt(zoneOf(k)) : null;
function candRow(k, env, full) {
  const add = () => { if (!full) { S.hq = ""; setHouse(S.house.concat(k)); } };
  if (env && POKS[k].env !== env) return h("button", { class: "cand other " + ownCls(k), "aria-disabled": String(full), onclick: add }, pokPicK(k),
    h("span", null, h("b", null, POKS[k].n), h("span", { class: "sub" }, t("Entorno {e}, distinto al de la casa", { e: tEnv(POKS[k].env || "").toLowerCase() }))), h("span"));
  const f = H.fit(POKS, k, S.house), common = S.house.length ? uniq(S.house.flatMap(j => POKS[k].likes.filter(l => POKS[j].likes.includes(l)))) : null;
  const col = f == null ? "" : f >= .5 ? "var(--ok)" : f >= .3 ? "var(--accent)" : "var(--off)";
  return h("button", { class: "cand " + ownCls(k), "aria-disabled": String(full), onclick: add }, pokPicK(k),
    h("span", null, h("b", null, POKS[k].n), h("span", { class: "sub" }, common ? (common.length ? t("En común: {l}", { l: common.map(like).join(", ") }) : t("Sin gustos en común")) : POKS[k].flavor ? [flavIco(POKS[k].flavor), tFlav(POKS[k].flavor)] : ""), whereTag(k)),
    f == null ? h("span") : h("span", { class: "pct" }, h("b", { style: "color:" + (f >= .5 ? "var(--ok)" : f >= .3 ? "var(--text)" : "var(--text-3)") }, pctTxt(f)),
      h("span", { class: "bar" }, h("i", { style: `width:${Math.round(f * 100)}%;background:${col}` }))));
}
function candidates() {
  const env = S.house.length ? POKS[S.house[0]].env : "", q = fold(S.hq), full = S.house.length >= 4;
  const ks = POKS.map((p, k) => k).filter(k => (POKS[k].likes || []).length && !S.house.includes(k) && (!q || fold(POKS[k].n).includes(q)) && mineOk(k) && (!env || POKS[k].env === env || S.hother));
  if (!ks.length) return [h("p", { class: "small muted", style: "padding:12px 4px" }, t("Ningún Pokémon coincide."))];
  const out = full ? [h("p", { class: "hfull" }, t("La casa está completa (4 de 4). Quita a un residente para añadir otro."))] : [];
  if (S.house.length || q) {
    if (S.house.length) ks.sort((a, b) => (POKS[a].env !== env) - (POKS[b].env !== env) || H.fit(POKS, b, S.house) - H.fit(POKS, a, S.house));
    return out.concat(ks.slice(0, S.hcand).map(k => candRow(k, env, full)),
      ks.length > S.hcand ? h("button", { class: "link more", onclick: () => { S.hcand += 10; render(); } }, t("Ver más ({n})", { n: ks.length - S.hcand })) : null);
  }
  // an empty house: the Pokémon by environment (the one the house will have), five of each until opened
  const by = new Map(); for (const k of ks) { const e = POKS[k].env || "—"; by.set(e, (by.get(e) || []).concat(k)); }
  return [...by].sort((a, b) => b[1].length - a[1].length).map(([e, l]) => { const key = "env:" + e, opened = S.hopen.has(key);
    return [h("div", { class: "gsub" }, envIco(e, 14), t("Entorno {e}", { e: tEnv(e).toLowerCase() }), h("span", { class: "n" }, " " + l.length)), (opened ? l : l.slice(0, 5)).map(k => candRow(k, "", false)),
      l.length > 5 ? h("button", { class: "link more", onclick: () => toggleOpen(key) }, opened ? t("Mostrar menos") : t("Mostrar {n} más", { n: l.length - 5 })) : null]; });
}
function autofill() {
  const m = S.house.slice(), env = POKS[m[0]].env;
  while (m.length < 4) {
    const c = POKS.map((p, k) => k).filter(k => (POKS[k].likes || []).length && !m.includes(k) && mineOk(k) && POKS[k].env === env).sort((a, b) => H.fit(POKS, b, m) - H.fit(POKS, a, m))[0];
    if (c == null) break; m.push(c);
  }
  if (m.length === S.house.length) toast(t("No hay más Pokémon compatibles con esta casa")); else setHouse(m);
}
const dots = per => h("span", { class: "hdots" }, S.house.map((k, i) => h("i", { style: `background:${per[i] ? MC[i] : "var(--line)"}`, title: POKS[k].n })));
function itemRow(r) {
  const it = r.it, e = itemEntry(it[0]), own = e && has("items", e.id);
  return h("button", { class: "hitem " + (own || learned(e) ? "own" : "miss"), onclick: () => e && open(e) }, pic(itemPic(it)),
    h("span", { class: "t" }, h("b", null, e ? nm(e) : it[1], learned(e) ? h("span", { class: "rtag", html: SCROLL, title: t("Receta aprendida") }) : null),
      h("span", { class: "tags" }, r.t.filter(l => S.house.some(k => POKS[k].likes.includes(l))).map(like).join(" · ")), dots(r.per)));
}
const dishRow = r => h("button", { class: "hitem " + (has("rec", r.e.id) ? "own" : "miss"), onclick: () => open(r.e) }, pic(r.e.pic),
  h("span", { class: "t" }, h("b", null, nm(r.e)), h("span", { class: "tags" }, [tFlav(r.e.o[4])].concat(r.t.filter(l => S.house.some(k => POKS[k].likes.includes(l))).map(like)).join(" · ")), dots(r.per)));
const gotOk = it => { if (!S.hgot) return true; const e = itemEntry(it[0]); return learned(e) || (S.hgot === "got" && !!e && has("items", e.id)); };
function more(key, rows) {
  return rows.length > 1 ? h("button", { class: "link more", onclick: () => toggleOpen(key) }, S.hopen.has(key) ? t("Mostrar menos") : t("Mostrar {n} más", { n: Math.min(rows.length, 8) - 1 })) : null;
}
const topRows = (key, rows) => S.hopen.has(key) ? rows.slice(0, 8) : rows.slice(0, 1);
// the house's likes, environment and favourite flavours as chips that list what has them
function houseChips(n) {
  const env = POKS[S.house[0]].env, fl = new Map();
  S.house.forEach((k, i) => { const f = POKS[k].flavor; if (f) fl.set(f, (fl.get(f) || []).concat(i)); });
  const who = idx => h("span", { class: "hdots" }, idx.map(i => h("i", { style: "background:" + MC[i] })));
  return h("div", { class: "likes" },
    env ? h("button", { class: "like env", title: t("Entorno"), onclick: listBy("pok", { env }) }, envIco(env), tEnv(env), who(S.house.map((k, i) => POKS[k].env === env ? i : -1).filter(i => i >= 0))) : null,
    [...fl].map(([f, idx]) => h("button", { class: "like flavor" + (idx.length === n && n > 1 ? " all" : ""), title: t("Sabor"), onclick: listBy("rec", { flavor: f }) }, flavIco(f), tFlav(f), who(idx))),
    H.groupLikes(POKS, S.house).map(([l, idx]) => h("button", { class: "like" + (idx.length === n && n > 1 ? " all" : ""), onclick: listBy("obj", { tag: l }) }, cap(like(l)), who(idx))));
}
function casa() {
  const env = S.house.length ? POKS[S.house[0]].env : "", n = S.house.length;
  const pickBox = h("section", { class: "hcard" },
    h("button", { class: "fold", "aria-expanded": String(S.hpick), onclick: () => { S.hpick = !S.hpick; render(); } }, h("h2", { class: "grow" }, t(n ? "Añadir residentes" : "Elige el primer residente")), h("span", { class: "chev", html: CHEV })),
    S.hpick ? [h("div", { class: "msearch", html: SEARCH }, h("input", { type: "search", placeholder: t("Buscar Pokémon"), value: S.hq, "aria-label": t("Buscar Pokémon"), oninput: e => { S.hq = e.target.value; S.hcand = 10; $("hlist").replaceChildren(...candidates().flat(Infinity).filter(Boolean)); } })),
      h("div", { class: "hopts" }, anyPok() ? segc([["sí", t("Mis Pokémon")], ["", t("Todos")]], S.hmine, v => { S.hmine = v; if (!v) S.hzone = ""; }, t("Pokémon")) : null,
        anyPok() && S.hmine && yourZones().length ? pick("Ubicación actual", "Todas las zonas", yourZones(), S.hzone, v => { S.hzone = v; }, tArea) : null,
        env ? h("label", { class: "check" }, h("input", { type: "checkbox", checked: S.hother ? true : null, onchange: () => { S.hother = !S.hother; render(); } }), t("Incluir otros entornos")) : null),
      h("p", { class: "small muted", style: "margin:0" }, env ? [t("Entorno de la casa: "), h("b", null, tEnv(env).toLowerCase()), t(". Los de otros entornos (luz, temperatura y humedad) estarían menos cómodos.")] : t("El primer Pokémon que elijas fija el entorno de la casa.")),
      h("div", { id: "hlist", class: "hlist" + (S.hmine && anyPok() ? " mine-only" : "") }, candidates())] : null);
  if (!n) return h("div", { class: "casa" }, h("p", { class: "small muted", style: "margin:0 2px" }, t("Elige Pokémon para ver los compañeros más afines y los objetos que mejor van con sus gustos.")), pickBox);
  const items = H.rankItems(POKS, S.house, ITEMS.filter(gotOk), ITAGS), by = H.pickByType(items);
  const group = n > 1 ? Math.round(100 * S.house.reduce((s, k, i) => s + H.fit(POKS, k, S.house.filter((_, j) => j !== i)), 0) / n) : null;
  const slots = [0, 1, 2, 3].map(i => {
    const k = S.house[i];
    if (k == null) return h("button", { class: "slot", onclick: () => { S.hpick = true; render(); const q = document.querySelector("#hlist"); if (q) q.scrollIntoView({ behavior: "smooth", block: "center" }); } }, h("span", { style: "font-size:22px" }, "+"), h("span", { class: "small" }, t("Añadir")));
    return h("div", { class: "slot full " + ownCls(k), style: `border-color:${MC[i]}66;background:${MC[i]}0F`, role: "link", tabindex: "0", onclick: () => open(ENTRIES.pok[k]), onkeydown: e => { if (e.key === "Enter") open(ENTRIES.pok[k]); } },
      h("button", { class: "x", "aria-label": t("Quitar a {p}", { p: POKS[k].n }), onclick: e => { e.stopPropagation(); setHouse(S.house.filter(x => x !== k)); } }, "×"),
      pokPicK(k), h("b", null, POKS[k].n), h("span", { class: "small muted envfl" }, POKS[k].env ? [envIco(POKS[k].env), tEnv(POKS[k].env)] : null, POKS[k].flavor ? [flavIco(POKS[k].flavor), tFlav(POKS[k].flavor)] : null), hasPok(k) && zoneOf(k) ? whereTxt(zoneOf(k)) : null);
  });
  const house = h("section", { class: "hcard" },
    h("div", { class: "hrow" }, h("h2", { class: "grow" }, t("La casa")), group != null ? h("span", { class: "meter" }, h("b", { style: `color:${group >= 45 ? "var(--ok)" : "var(--text)"}` }, group + "%"), h("span", { class: "small muted" }, t(" de afinidad"))) : null),
    h("div", { class: "slots" }, slots),
    h("div", { class: "hrow" }, n < 4 ? h("button", { class: "btn", onclick: autofill }, t("Completar automáticamente")) : null, h("button", { class: "btn", onclick: () => setHouse([]) }, t("Vaciar"))),
    houseChips(n),
    n > 1 ? h("p", { class: "small muted", style: "margin:0" }, t("{n} objetos gustan a los {r} residentes. En verde, lo común a todos.", { n: items.filter(r => r.who === n).length, r: n })) : null);
  const bar = h("div", { class: "hbar" }, segc([["", t("Todos")], ["rec", t("Con receta")], ["got", t("Vistos o con receta")]], S.hgot, v => { S.hgot = v; }, t("Objetos")));
  const KINDSC = [["Ocio", "Juguetes como molinillos o bloques de construcción"], ["Descanso", "Asientos y camas"], ["Decoración", "Adornos como lámparas de seta o guirnaldas"], ["Caminos", "Suelos y caminos del entorno"]];
  const score = (tg, extra) => { const per = S.house.map((k, i) => POKS[k].likes.filter(l => tg.includes(l)).length + (extra ? extra(k) : 0)); return { per, who: per.filter(Boolean).length, sum: per.reduce((a, b) => a + b, 0) }; };
  const byComfort = KINDSC.map(([kind, what]) => [kind, what, BROWSE.filter(it => COMFORT[it[0]] === kind && gotOk(it)).map(it => { const tg = ITAGS[it[0]] || []; return Object.assign({ it, t: tg }, score(tg)); })
    .filter(r => r.who).sort((a, b) => b.who - a.who || b.sum - a.sum)]).filter(([, , rows]) => rows.length);
  const optN = l => t(l === 1 ? "{n} opción" : "{n} opciones", { n: l });
  const comfort = byComfort.length ? h("section", { class: "hcard" }, h("h2", null, t("Confort")), h("p", { class: "small muted", style: "margin:0" }, t("Los objetos de ocio y de decoración cerca de la casa aumentan el confort de sus residentes. Se muestran los más valorados en cada clase.")),
    h("div", { class: "types" }, byComfort.map(([kind, what, rows]) => h("div", { class: "type" }, h("div", { class: "hrow" }, h("b", { class: "grow" }, tComf(kind)), h("span", { class: "small muted" }, optN(rows.length))),
      h("span", { class: "small muted" }, t(what)), topRows("c:" + kind, rows).map(itemRow), more("c:" + kind, rows))))) : null;
  // food: a resident's favourite flavour counts as one more like
  const dishes = ENTRIES.rec.map(e => { const tg = ITAGS[e.o[6]] || []; return Object.assign({ e, t: tg }, score(tg, k => POKS[k].flavor && POKS[k].flavor === e.o[4] ? 1 : 0)); })
    .filter(r => r.who).sort((a, b) => b.who - a.who || b.sum - a.sum);
  const food = dishes.length ? h("section", { class: "hcard" }, h("h2", null, t("Comida")), h("p", { class: "small muted", style: "margin:0" }, t("Los platos que más encajan con sus sabores favoritos y sus gustos.")),
    h("div", { class: "hitems" }, (S.hopen.has("food") ? dishes.slice(0, 12) : dishes.slice(0, 4)).map(dishRow)),
    dishes.length > 4 ? h("button", { class: "link more", onclick: () => toggleOpen("food") }, S.hopen.has("food") ? t("Mostrar menos") : t("Mostrar {n} más", { n: Math.min(dishes.length, 12) - 4 })) : null) : null;
  const types = h("section", { class: "hcard" }, h("h2", null, t("Recomendación por tipo")), h("p", { class: "small muted", style: "margin:0" }, t("El objeto más valorado por los residentes en cada tipo. Cada punto indica un residente al que le gusta.")),
    h("div", { class: "types" }, [...by].map(([type, rows]) => h("div", { class: "type" }, h("div", { class: "hrow" }, h("b", { class: "grow" }, t(type)), h("span", { class: "small muted" }, optN(rows.length))), topRows(type, rows).map(itemRow), more(type, rows)))));
  const all = h("section", { class: "hcard" }, h("h2", null, t("Todos los objetos afines")), h("p", { class: "small muted", style: "margin:0" }, t("Ordenados por número de residentes a los que les gustan.")),
    h("div", { class: "hitems" }, items.slice(0, S.hmore).map(itemRow)),
    items.length > S.hmore ? h("button", { class: "btn more", onclick: () => { S.hmore += 20; render(); } }, t("Mostrar {n} más", { n: Math.min(20, items.length - S.hmore) })) : null);
  return h("div", { class: "casa" }, house, n < 4 ? pickBox : null, bar, comfort, food, types, all, h("p", { class: "fan" }, t("Solo se consideran los objetos con atributos conocidos. El tipo de cada objeto se deduce de su nombre.")));
}
let repCache = null;
function repartir() {
  const pool = POKS.map((p, k) => k).filter(k => (POKS[k].likes || []).length && POKS[k].env && mineOk(k)), key = pool.join(",");
  if (!repCache || repCache.key !== key) repCache = { key, hs: H.partition(POKS, pool) };
  const hs = repCache.hs.filter(x => x.fit > 0), housed = new Set(hs.flatMap(x => x.m)), loose = pool.filter(k => !housed.has(k));
  const avg = l => l.length ? l.reduce((a, x) => a + x.fit, 0) / l.length : 0;
  const head = h("section", { class: "hcard" }, anyPok() ? h("div", { class: "hopts" }, segc([["sí", t("Mis Pokémon")], ["", t("Todos")]], S.hmine, v => { S.hmine = v; if (!v) S.hzone = ""; }, t("Pokémon")),
      S.hmine && yourZones().length ? pick("Ubicación actual", "Todas las zonas", yourZones(), S.hzone, v => { S.hzone = v; }, tArea) : null) : null,
    h("p", { class: "small muted", style: "margin:0" }, t("Reparto automático en casas de hasta cuatro Pokémon, cada una de un único entorno, con la mayor afinidad posible.")),
    h("div", { class: "rsum" }, [[hs.length, "casas"], [pctTxt(avg(hs)), "de afinidad media"], [loose.length, "sin casa"], [pool.length, "Pokémon en total"]].map(([v, l]) => h("div", null, h("b", null, String(v)), h("span", { class: "small muted" }, t(l))))));
  if (!pool.length) return h("div", { class: "casa" }, head, h("div", { class: "empty" }, h("b", null, t("Sin Pokémon para repartir")), t("Marca algunos Pokémon o elige «Todos».")));
  const houseCard = x => { const shared = H.groupLikes(POKS, x.m).filter(([, w]) => w.length === x.m.length);
    return h("div", { class: "rhouse" }, h("div", { class: "hrow" }, h("b", { class: "rpct grow", style: `color:${x.fit >= .45 ? "var(--ok)" : "var(--text)"}` }, pctTxt(x.fit), h("span", { class: "small muted" }, t(" de afinidad"))),
        h("button", { class: "btn", onclick: () => { S.hq = ""; setHouse(x.m.slice()); } }, t("Abrir en el diseñador"))),
      h("div", { class: "rmembers" }, x.m.map(k => h("button", { class: "rmon " + ownCls(k), onclick: () => open(ENTRIES.pok[k]) }, pokPicK(k), h("b", null, POKS[k].n), hasPok(k) && zoneOf(k) && !S.hzone ? whereTxt(zoneOf(k)) : null))),
      shared.length ? h("div", { class: "likes" }, shared.map(([l]) => h("button", { class: "like all", onclick: listBy("obj", { tag: l }) }, cap(like(l))))) : h("p", { class: "small muted", style: "margin:0" }, t("Sin gustos comunes a todos los residentes."))); };
  const envs = uniq(hs.map(x => POKS[x.m[0]].env));
  return h("div", { class: "casa" }, head,
    envs.map(env => { const l = hs.filter(x => POKS[x.m[0]].env === env);
      return h("section", { class: "hcard" }, h("div", { class: "hrow" }, h("h2", { class: "grow" }, envIco(env, 16), t("Entorno {e}", { e: tEnv(env).toLowerCase() })), h("span", { class: "small muted" }, t(l.length === 1 ? "{n} casa" : "{n} casas", { n: l.length }) + " · " + pctTxt(avg(l)))),
        h("div", { class: "rhouses" }, l.map(houseCard))); }),
    loose.length ? h("section", { class: "hcard" }, h("h2", null, t("Sin casa")), h("p", { class: "small muted", style: "margin:0" }, t("Pokémon sin compañeros compatibles de su mismo entorno.")),
      h("div", { class: "tags" }, loose.map(k => h("button", { class: "tag link", onclick: () => open(ENTRIES.pok[k]) }, POKS[k].n)))) : null);
}

// ---------- ficha ----------
const row = (label, value, onclick) => h(onclick ? "button" : "div", { class: "gi", onclick }, h("span", { class: "grow" }, label), value != null ? h("span", { class: "v" }, value) : null, onclick ? h("span", { class: "chev", "aria-hidden": "true" }, "›") : null);
const okTag = e => e.kind === "obj" ? (learned(e) ? t("Receta") : has("items", e.id) ? t("Visto") : null) : has(e.set, e.id) ? t(e.kind === "pok" ? "Lo tienes" : "Visto") : null;
const linkRow = (e, small) => h("button", { class: "gi", onclick: () => open(e) }, pic(e.pic),
  h("span", { class: "grow" }, nm(e), small ? h("small", null, small) : null), okTag(e) ? h("span", { class: "ok" }, okTag(e)) : null, h("span", { class: "chev", "aria-hidden": "true" }, "›"));
// when a Pokémon shows up in a habitat: rarity, times of day and weather when not all, the only areas
const spawnTxt = m => [tSpawn(m.r), (m.t || []).length && m.t.length < 4 ? m.t.map(tSpawn).join(", ") : "", (m.w || []).length && m.w.length < 3 ? m.w.map(tSpawn).join(", ") : "", m.only ? t("Solo en {z}", { z: tAreas(m.only) }) : ""].filter(Boolean).join(" · ");
const sect = (title, ...kids) => h("div", { class: "sect" }, h("h3", null, t(title)), ...kids);
const glist = rows => rows.length ? h("div", { class: "glist" }, rows) : null;
const tags = (a, f, link) => h("div", { class: "tags" }, a.map(x => link ? h("button", { class: "tag link", onclick: link(x) }, f ? f(x) : x) : h("span", { class: "tag" }, f ? f(x) : x)));
const dishesWith = id => { const it = itemById.get(id); const f = it && fold(it[1]); return ENTRIES.rec.filter(e => ((DISHES[e.o[6]] || {}).ing || []).some(i => itemById.has(i) && fold(itemById.get(i)[1]) === f)); };
function body(e) {
  const o = e.o, out = [];
  if (e.kind === "pok") {
    if (has("pok", e.id)) out.push(sect("Ubicación actual", h("label", { class: "zsel" }, h("select", { "aria-label": t("Ubicación actual"), onchange: ev => setZone(e.id, ev.target.value) },
      h("option", { value: "" }, t("Sin indicar")), LIVE_ZONES.map(z => h("option", { value: z, selected: z === zoneOf(e.k) ? true : null }, tArea(z)))), h("span", { class: "chev", html: CHEV }))));
    const facts = [o.env && row(t("Entorno ideal"), [envIco(o.env, 15), tEnv(o.env)], listBy("pok", { env: o.env })), o.flavor && row(t("Sabor favorito"), [flavIco(o.flavor, 15), tFlav(o.flavor)], listBy("rec", { flavor: o.flavor }))].filter(Boolean);
    if (facts.length) out.push(sect("Guía", glist(facts)));
    if ((o.spw || []).length) out.push(sect("Especialidad", tags(o.spw, tSpw, s => listBy("pok", { spw: s }))));
    if ((o.likes || []).length) out.push(sect("Gustos", tags(o.likes, x => cap(like(x)), l => listBy("obj", { tag: l }))),
      h("div", { class: "glist", style: "margin:14px 16px 0" }, h("button", { class: "gi", onclick: () => { S.hq = ""; setHouse([e.k]); } }, h("span", { class: "ico", html: svg(TABS[4].icon, 18) }), h("span", { class: "grow" }, t("Diseñar una casa con {p}", { p: o.n })), h("span", { class: "chev", "aria-hidden": "true" }, "›"))));
    const hs = (o.habs || []).map(i => ENTRIES.hab[i]).filter(Boolean);
    if (hs.length) out.push(sect("Hábitat preferido", glist(hs.map(x => linkRow(x, spawnTxt((x.o.mons || []).find(m => m.p === e.k) || {}) || subOf(x))))));
  } else if (e.kind === "hab") {
    if (o.d) out.push(sect("Descripción", h("p", null, tDesc(o.d))));
    const req = (o.req || []).map(r => { const it = itemEntry(r.id); return it ? linkRow(it, "× " + r.q) : row(r.t, "× " + r.q); });
    if (req.length) out.push(sect("Se construye con", glist(req)));
    const mons = (o.mons || []).map(m => ({ m, p: POKS[m.p] })).filter(x => x.p);
    if (mons.length) out.push(sect("Pokémon que atrae", glist(mons.map(({ m, p }) => linkRow(find("pok", p.n), spawnTxt(m))))));
    if ((o.areas || []).length) out.push(sect("Zonas", tags(o.areas, tArea)));
  } else if (e.kind === "obj") {
    if (DESC[o[0]]) out.push(sect("Descripción", h("p", null, tDesc(DESC[o[0]]))));
    out.push(sect("Guía", glist([row(t("Categoría"), o[4] ? tCat(o[3]) + " · " + tSub(o[4]) : tCat(o[3]), listBy("obj", {}, { group: o[3] })), COMFORT[o[0]] && row(t("Confort"), tComf(COMFORT[o[0]]))].filter(Boolean))));
    if ((ITAGS[o[0]] || []).length) out.push(sect("Atributos", tags(ITAGS[o[0]], x => cap(like(x)), l => listBy("obj", { tag: l }))));
    const w = IWEB[o[0]] || {};
    if ((w.rec || []).length) out.push(sect("Cómo se fabrica", glist(w.rec.map(([i, q]) => { const me = typeof i === "number" && itemEntry(i); return me ? linkRow(me, "× " + q) : row(String(i), "× " + q); })),
      w.un ? h("p", { class: "small muted", style: "margin:6px 4px 0", lang: en() ? "es" : null }, t("Desbloqueo: {u}", { u: w.un })) : null));
    if (w.m || (w.z || []).length) out.push(sect("Cómo conseguirlo", w.m ? glist([row(t("Método"), h("span", { lang: en() ? "es" : null }, w.m))]) : null, (w.z || []).length ? h("div", { style: "margin-top:8px", lang: en() ? "es" : null }, tags(w.z)) : null));
    const tg = ITAGS[o[0]] || [], fans = tg.length ? POKS.map((p, k) => [k, (p.likes || []).filter(l => tg.includes(l)).length + (tg.includes("cosas con sabor " + p.flavor) ? 1 : 0)]).filter(f => f[1] >= (tg.length > 1 ? 2 : 1)).sort((a, b) => b[1] - a[1] || hasPok(b[0]) - hasPok(a[0])) : [];
    if (fans.length) out.push(sect("Pokémon a los que más les gusta", h("div", { class: "tags" }, fans.slice(0, 30).map(([k]) => h("button", { class: "tag link" + (hasPok(k) ? " mine" : ""), onclick: () => open(ENTRIES.pok[k]) }, POKS[k].n)))));
    const fam = FAMS.find(f => fold(f[2]) === fold(o[1]));
    if (fam) out.push(sect("Platos que se preparan con este utensilio", glist(ENTRIES.rec.filter(r => r.o[2] === fam[0]).map(r => linkRow(r)))));
    const ds = dishesWith(o[0]); if (ds.length) out.push(sect("Ingrediente de", glist(ds.map(r => linkRow(r)))));
    const name = fold(o[1]), hs = ENTRIES.hab.filter(x => (x.o.req || []).some(r => r.id != null && fold((itemById.get(r.id) || [])[1]) === name));
    if (hs.length) out.push(sect("Se usa en hábitats", glist(hs.map(x => linkRow(x, subOf(x))))));
  } else if (e.kind === "rec") {
    if (o[1]) out.push(sect("Descripción", h("p", null, tDesc(o[1]))));
    const fam = famOf(o), ut = itemByName(fam[2]), dish = DISHES[o[6]] || {};
    out.push(sect("Cómo se prepara", glist([ut ? linkRow(ut, t("Utensilio")) : row(t("Utensilio"), fam[2])].concat(dish.spw ? [row(t("Necesita un Pokémon con"), tSpw(dish.spw), listBy("pok", { spw: dish.spw }))] : []))));
    const ing = (dish.ing || []).map(id => itemById.get(id)).filter(Boolean);
    if (ing.length) out.push(sect("Ingredientes", glist(ing.map(it => { const be = itemEntry(it[0]); return be ? linkRow(be) : row(it[1]); }))));
    out.push(sect("Guía", glist([row(t("Familia"), t(fam[1])), row(t("Potencia"), o[3]), row(t("Sabor"), [flavIco(o[4], 15), tFlav(o[4])], listBy("rec", { flavor: o[4] }))])));
    if ((ITAGS[o[6]] || []).length) out.push(sect("Atributos", tags(ITAGS[o[6]], x => cap(like(x)), l => listBy("obj", { tag: l }))));
  }
  return out;
}
let lastSel = null;
const phone = () => !matchMedia("(min-width: 900px)").matches;
function detail() {
  const el = $("detail"), e = S.sel; el.replaceChildren();
  const app = document.querySelector(".app"); app.classList.toggle("open", !!e); app.classList.toggle("casa-tab", S.tab === "casa");
  // the ficha covers the list on phone and tablet, but the tabs stay below it to jump anywhere
  document.querySelector(".main").inert = !!e && phone();
  const fresh = e !== lastSel; lastSel = e;
  if (fresh && e) requestAnimationFrame(() => { const b = el.querySelector(phone() ? ".back" : "h2"); if (b) { if (!phone()) b.tabIndex = -1; b.focus({ preventScroll: true }); } });
  if (!e) { el.append(h("div", { class: "empty" }, h("b", null, t(S.tab === "casa" ? "Toca un Pokémon u objeto" : "Elige algo de la lista")), t("Verás aquí su ficha."))); return; }
  const own = has(e.set, e.id), K = KIND[e.kind];
  const btn = (on, label, offLabel, set) => h("button", { class: "ownbtn", "aria-pressed": String(on), onclick: () => toggle(set, e.id), html: on ? CHECK.replace(/12/g, "16") + " " + t(label) : t(offLabel) });
  el.append(h("div", { class: "dtop" }, h("button", { class: "back", onclick: back, html: '<svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2L2 10l8 8"/></svg>' + t("Atrás") })),
    h("div", { class: "dbody" }, h("div", { class: "hero" }, pic(e.pic), h("h2", null, nm(e)), h("span", null, subOf(e)), whereOf(e) ? whereTxt(whereOf(e)) : null),
      h("div", { class: "ownbtns" }, btn(own, K.on, K.off, e.set), e.craft ? btn(learned(e), "Tengo la receta", "Marcar receta como aprendida", "craft") : null),
      ...body(e), h("p", { class: "fan" }, t("Web de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company."))));
  if (fresh) el.scrollTop = 0;
}
// the list goes back to the top when what it shows changes (tab, mode, search or a filter), not when you mark something
const listKey = () => S.tab === "casa" ? "casa:" + S.cmode : [S.tab, S.show, S.q, S.group, S.sub, S.rf, JSON.stringify(S.f)].join("|");
let lastKey = "";
function render() {
  const focus = focusKey(), closed = lastSel && !S.sel ? lastSel : null;
  for (const [id, l] of [["side", "Secciones"], ["tabbar", "Secciones"], ["detail", "Ficha"]]) $(id).setAttribute("aria-label", t(l));
  resets(); fixZone(); nav(); header(); list(); detail();
  const key = listKey();
  if (pendingScroll != null) { $("list").scrollTop = pendingScroll; pendingScroll = null; } else if (key !== lastKey) $("list").scrollTop = 0;
  lastKey = key;
  // keep the keyboard where it was: the same control rebuilt, or the card of the ficha you just closed
  refocus(closed ? "open:" + closed.kind + ":" + closed.id : focus);
}
// a stable name for the focused control, so render() can focus its rebuilt twin
function focusKey() {
  const a = document.activeElement; if (!a || a === document.body) return null;
  if (a.dataset.k) return a.dataset.k;
  const box = a.closest("#top, #list, #detail, #side, #tabbar, #sheet"); if (!box) return null;
  return box.id + "|" + a.tagName + "|" + (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 80);
}
function refocus(k) {
  if (!k || (document.activeElement && document.activeElement !== document.body && document.activeElement.isConnected)) return;
  let el = document.querySelector('[data-k="' + CSS.escape(k) + '"]');
  if (!el && k.includes("|")) { const [box, tag, label] = k.split("|"), root = $(box);
    el = root && [...root.querySelectorAll(tag)].find(x => (x.getAttribute("aria-label") || x.textContent || "").trim().slice(0, 80) === label); }
  if (el) el.focus({ preventScroll: true });
}

// ---------- hojas: marcado rápido y ajustes ----------
let sheetFrom = null;
function closeSheet() { const w = $("sheet"); if (w.hidden) return; w.hidden = true; w.replaceChildren(); document.querySelector(".app").inert = false; if (sheetFrom && sheetFrom.isConnected) sheetFrom.focus({ preventScroll: true }); sheetFrom = null; }
function sheet(content, short) {
  const w = $("sheet"); if (w.hidden) sheetFrom = document.activeElement; w.hidden = false; document.querySelector(".app").inert = true;
  requestAnimationFrame(() => { const f = w.querySelector("input:not([hidden]), button"); if (f) f.focus({ preventScroll: true }); });
  const close = () => { closeSheet(); render(); };
  w.onclick = ev => { if (ev.target === w) close(); };
  const kids = content(close), title = kids[0] && kids[0].textContent;
  w.replaceChildren(h("div", { class: "sheet" + (short ? " short" : ""), role: "dialog", "aria-modal": "true", "aria-label": title }, h("div", { class: "grab" }), ...kids));
}
const QKINDS = [["pok", "Pokémon"], ["hab", "Hábitats"], ["obj", "Objetos"], ["rec", "Cocina"]];
function quick() {
  let kind = S.tab === "casa" ? "pok" : S.tab, q = "";
  sheet(close => {
    const QMAX = 90, grid = h("div", { class: "qgrid" }), foot = h("span");
    const draw = () => {
      const f = fold(q.trim()), all = ENTRIES[kind].filter(e => !f || fold(e.name).includes(f) || (e.en && fold(e.en).includes(f))), es = all.slice(0, QMAX);
      grid.replaceChildren(...es.map(e => h("button", { class: "q" + (has(e.set, e.id) ? " own" : ""), "aria-pressed": String(has(e.set, e.id)), onclick: () => { flip(e.set, e.id); draw(); input.select(); } }, pic(e.pic), h("span", null, nm(e)))),
        all.length > QMAX ? h("p", { class: "qmore small muted" }, t("Se muestran {n} de {m}: busca para encontrar el resto.", { n: QMAX, m: all.length })) : "");
      const n = today(); foot.textContent = n ? t("Has marcado {n} hoy", { n }) : t("Toca lo que hayas conseguido");
    };
    const chips = h("div", { class: "chips" }, QKINDS.map(([k, l]) => h("button", { class: "chip", "aria-pressed": String(k === kind), onclick: ev => { kind = k; [...chips.children].forEach(b => b.setAttribute("aria-pressed", String(b === ev.currentTarget))); draw(); } }, t(l))));
    const input = h("input", { type: "search", placeholder: t("Buscar"), "aria-label": t("Buscar"), oninput: ev => { q = ev.target.value; draw(); } });
    draw(); setTimeout(() => input.focus(), 50);
    return [h("div", { class: "shead" }, h("b", null, t("Marcar rápido"))), h("div", { class: "spad" }, h("div", { class: "msearch", html: SEARCH }, input), chips), grid,
      h("div", { class: "sfoot" }, foot, h("button", { class: "btn primary", onclick: close }, t("Listo")))];
  });
}
// language and theme: one button each showing the current value (ES/EN, the theme's symbol), with a small menu
const setPref = (k, v) => { P[k] = v; savePrefs(); applyTheme(); render(); };
const LANGS = [["es", "Español", "ES"], ["en", "English", "EN"]];
const THEMES = [["system", "Sistema", '<circle cx="11" cy="11" r="7"/><path d="M11 4a7 7 0 000 14z" fill="currentColor"/>'], ["light", "Claro", '<circle cx="11" cy="11" r="3.5"/><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.3 5.3l1.4 1.4M15.3 15.3l1.4 1.4M5.3 16.7l1.4-1.4M15.3 6.7l1.4-1.4"/>'], ["dark", "Oscuro", '<path d="M17 13.5A7 7 0 018.5 5a7 7 0 108.5 8.5z"/>']];
const face = f => f.startsWith("<") ? svg(f, 18) : '<span class="hcode">' + f + "</span>";
function prefMenu(key, title, opts) {
  const cur = opts.find(x => x[0] === P[key]) || opts[0], lbl = l => key === "lang" ? l : t(l), wrap = h("span", { class: "tmenu" });
  const btn = h("button", { class: "hbtn", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": t(title) + ": " + lbl(cur[1]), title: t(title) + ": " + lbl(cur[1]) }, h("span", { class: "hface", html: face(cur[2]) }));
  const pop = h("div", { class: "pop", role: "menu", hidden: true }, h("div", { class: "poph" }, t(title)), opts.map(([v, l, f]) => h("button", { role: "menuitemradio", "aria-checked": String(P[key] === v), lang: key === "lang" ? v : null, onclick: () => { document.removeEventListener("click", outside, true); setPref(key, v); } },
    h("span", { class: "pface", html: face(f) }), h("span", { class: "grow" }, lbl(l)), P[key] === v ? h("span", { html: CHECK }) : null)));
  const items = () => [...pop.querySelectorAll("button")];
  const shut = refocusBtn => { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); document.removeEventListener("click", outside, true); if (refocusBtn) btn.focus(); };
  const outside = ev => { if (!wrap.contains(ev.target)) shut(false); };
  btn.onclick = () => { if (!pop.hidden) return shut(true); pop.hidden = false; btn.setAttribute("aria-expanded", "true"); document.addEventListener("click", outside, true);
    (items().find(b => b.getAttribute("aria-checked") === "true") || items()[0]).focus(); };
  pop.onkeydown = ev => { const l = items(), i = l.indexOf(document.activeElement);
    if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); shut(true); }
    else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); l[(i + (ev.key === "ArrowDown" ? 1 : l.length - 1)) % l.length].focus(); }
    else if (ev.key === "Home" || ev.key === "End") { ev.preventDefault(); l[ev.key === "Home" ? 0 : l.length - 1].focus(); } };
  wrap.addEventListener("focusout", ev => { if (!pop.hidden && !wrap.contains(ev.relatedTarget)) shut(false); });
  wrap.append(btn, pop); return wrap;
}
function menu() {
  sheet(close => {
    const file = h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: ev => importFile(ev.target.files[0]) });
    const total = markCount(M);
    return [h("div", { class: "shead" }, h("b", null, t("Copia de seguridad"))),
      h("div", { class: "spad" },
        h("p", { class: "muted", style: "margin:0;font-size:13px" }, t(storeOk ? "Se guardan solo en este navegador." : "Este navegador no deja guardarlas: se perderán al cerrar.") + " " + t("Llevas {n} marcadas.", { n: total })),
        h("div", { class: "glist" }, row(t("Exportar a un archivo"), null, () => { exportFile(); close(); }), row(t("Importar de un archivo"), null, () => file.click())), file,
        h("p", { class: "fan", style: "margin:8px 0 0" }, t("Web de fans, sin relación con Nintendo, Game Freak ni The Pokémon Company.")))];
  }, true);
}
function exportFile() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(M, null, 1)], { type: "application/json" }));
  const a = h("a", { href: url, download: "pokopia-marcas-" + new Date().toISOString().slice(0, 10) + ".json" });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast(t("Marcas exportadas"));
}
async function importFile(f) {
  if (!f) return;
  let o; try { o = JSON.parse(await f.text()); } catch (e) { o = null; }
  if (!valid(o)) { closeSheet(); toast(t("Ese archivo no tiene marcas de Pokopia")); return; }
  const c = clean(o), skipped = KINDS.reduce((n, k) => n + (Array.isArray(o[k]) ? o[k].length : 0), 0) - markCount(c);
  // replacing keeps the marks you had, so the toast can bring them back
  const done = how => { const before = M;
    if (how === "replace") M = c; else { M = clean(M); for (const k of KINDS) M[k] = uniq(M[k].concat(c[k])); M.zone = Object.assign({}, c.zone, M.zone); M.at = Object.assign({}, c.at, M.at); }
    save(); closeSheet(); render();
    const msg = t("Marcas importadas") + (skipped > 0 ? " · " + t("{n} desconocidas ignoradas", { n: skipped }) : "");
    if (how === "replace") toast(msg, t("Deshacer"), () => { M = before; save(); render(); }); else toast(msg); };
  closeSheet();
  sheet(cl => [h("div", { class: "shead" }, h("b", null, t("Importar de un archivo"))), h("div", { class: "spad" }, h("p", { class: "muted", style: "margin:0;font-size:13px" }, t("¿Qué hago con las marcas que ya tienes?")),
    h("button", { class: "btn primary big", onclick: () => done("merge") }, t("Juntarlas con las del archivo")), h("button", { class: "btn big", onclick: () => done("replace") }, t("Reemplazarlas por las del archivo")), h("button", { class: "btn big", onclick: cl }, t("Cancelar")))], true);
}
let toastEl = null;
function toast(msg, action, onAction) {
  if (toastEl) toastEl.remove();
  const x = toastEl = h("div", { class: "toast", role: "status" }, h("span", null, msg),
    action ? h("button", { class: "tact", onclick: () => { x.remove(); onAction(); } }, action) : null);
  document.body.append(x); setTimeout(() => x.remove(), action ? 4000 : 2200);
}

$("list").addEventListener("scroll", e => { const y = e.target.scrollTop, top = $("top"); if (y > 60) top.classList.add("compact"); else if (y < 4) top.classList.remove("compact"); }, { passive: true });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || e.defaultPrevented) return;
  if (!$("sheet").hidden) { closeSheet(); render(); } else if (S.sel) back();
});
matchMedia("(min-width: 900px)").addEventListener("change", () => detail());
applyTheme(); load(); routed = location.hash; readHash(); render();
