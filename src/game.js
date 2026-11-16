// The catalog of this page: the classic scripts in data/ define the PANEL_* globals before any module runs.
import { buildCatalog } from "./catalog.js";

export const game = buildCatalog(globalThis);
