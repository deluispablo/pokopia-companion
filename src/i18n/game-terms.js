// Game terms in the current language, with the official wording of the game in Spanish and English.
// The data is in Spanish: these tables give the English, and en.js (game.english) the names it carries.
import { game } from "../game.js";
import { capitalize } from "../util.js";
import { isEnglish } from "./index.js";

const CATEGORY_EN = {
  "Muebles": "Furniture", "Decoración": "Misc.", "Objetos útiles": "Utilities", "Estructuras": "Buildings",
  "Bloques": "Blocks", "Exteriores": "Outdoor", "Naturaleza": "Nature", "Comida": "Food", "Materiales": "Materials",
  "Kits": "Kits", "Edificios especiales": "Special buildings", "Objetos clave": "Key Items", "Otros": "Other",
};

const SUBCATEGORY_EN = {
  "Almacenaje": "Storage", "Mesas y asientos": "Tables and seats", "Camas y tocadores": "Beds and dressers",
  "Puertas, ventanas y tejados": "Doors, windows and roofs", "Estructuras": "Structures",
  "Pinturas y materiales raros": "Paints and rare materials", "Alfombras y otros": "Rugs and more",
  "Regalos de Pokémon": "Pokémon gifts", "Notas humanas": "Human Records", "Pistas de hábitat": "Habitat hints",
  "Paredes": "Walls", "Suelos": "Floors", "Rocas": "Rocks", "Tierras": "Soil", "Céspedes": "Grass",
  "Líquidos": "Liquids", "Semillas de árbol": "Tree seeds", "Semillas": "Seeds", "Cultivos": "Crops",
  "Minerales y corales": "Minerals and coral", "Árboles y plantas": "Trees and plants", "Tesoros": "Treasures",
  "Menaje": "Tableware", "Aparatos": "Appliances", "Adornos": "Ornaments", "Trofeos": "Trophies",
  "Máquinas y estatuas": "Machines and statues", "Edificios": "Buildings",
  "Aparatos y farolas": "Devices and streetlights", "Lámparas": "Lamps", "Estaciones": "Stations",
  "Kits de casa": "House kits", "Kits de reparación": "Repair kits", "Medallas": "Badges", "Mejoras": "Upgrades",
};

// comfort kinds (comfort.js) by the game's names: Nivel de confort / Comfort Report
const COMFORT_KIND = {
  "Ocio": ["Objeto de ocio", "Toy"],
  "Descanso": ["Objeto de descanso", "Relaxation"],
  "Decoración": ["Decoración", "Decoration"],
  "Caminos": ["Pavimento", "Road"],
};

const ENVIRONMENT_EN = {
  "Iluminado": "Bright", "Oscuro": "Dark", "Húmedo": "Humid", "Seco": "Dry", "Calentito": "Warm", "Fresquito": "Cool",
};

const FLAVOR_EN = { dulce: "Sweet", amargo: "Bitter", "ácido": "Sour", seco: "Dry", picante: "Spicy", normal: "Mild" };

// when a Pokémon shows up in a habitat (from the web data, in Spanish)
const SPAWN_EN = {
  "Común": "Common", "Rara": "Rare", "Muy rara": "Very rare", "Mañana": "Morning", "Día": "Day",
  "Tarde": "Evening", "Noche": "Night", "Sol": "Sun", "Nublado": "Clouds", "Lluvia": "Rain",
};

const FAMILY_EN = {
  "Ensaladas": "Salads", "Sopas": "Soups", "Panes": "Breads", "Hamburguesas": "Burgers", "Batidos": "Smoothies",
};

// the kinds of furnishing of logic/houses.js
const HOUSE_TYPE_EN = {
  "Cama": "Bed", "Mesa": "Table", "Asiento": "Seat", "Luz": "Light", "Almacenaje": "Storage",
  "En la pared": "On the wall", "Plantas": "Plants", "Alfombra": "Rug", "Puerta y ventana": "Door and window",
  "Tejado": "Roof", "Suelo": "Floor", "Pared": "Wall", "Decoración": "Decoration", "Materiales": "Materials",
};

// the list's catch-all area, which en.js does not name
const AREA_EN = { "Otros": "Other" };

const english = (table, term) => (isEnglish() ? table[term] || term : term);

export const categoryName = (category) => english(CATEGORY_EN, category);
export const subcategoryName = (subcategory) => english(SUBCATEGORY_EN, subcategory);
export const comfortName = (kind) => (COMFORT_KIND[kind] ? COMFORT_KIND[kind][isEnglish() ? 1 : 0] : kind);
export const environmentName = (environment) => english(ENVIRONMENT_EN, environment);
export const flavorName = (flavor) => (isEnglish() ? FLAVOR_EN[flavor] || flavor : capitalize(flavor));
export const spawnWord = (word) => english(SPAWN_EN, word);
export const familyName = (family) => english(FAMILY_EN, family);
export const houseTypeName = (type) => english(HOUSE_TYPE_EN, type);
export const specialtyName = (specialty) => capitalize(english(game.english.spw, specialty));
export const areaName = (area) => (isEnglish() ? game.english.areas[area] || AREA_EN[area] || area : area);
/** "Isla Nube o Pradera Paleta" in the current language. */
export const areaList = (areas) => (isEnglish() ? areas.split(" o ").map(areaName).join(" or ") : areas);
/** A habitat or item description: en.js has the game's English, keyed by the Spanish text. */
export const descriptionText = (text) =>
  (isEnglish() && (game.english.habDesc[text] || game.english.itemDesc[text])) || text;

// "cosas de madera" -> "madera"
const shortLike = (like) => like.replace(/^cosas (que |con |de |para |donde )?/, "").replace(/^evocan /, "");
/** A like as the game says it in English, or short in Spanish. */
export const likeName = (like) => (isEnglish() && game.english.tags[like] ? game.english.tags[like] : shortLike(like));
