// Loads the generated data/*.js files (classic scripts that set window.PANEL_*) into a sandbox, as the page does.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const FILES = ["data.js", "images.js", "cats.js", "areas.js", "en.js", "crafts.js", "comfort.js"];

export function loadGameGlobals() {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of FILES) {
    const code = readFileSync(new URL("../../data/" + file, import.meta.url), "utf8");
    vm.runInContext(code, sandbox, { filename: file });
  }
  return sandbox;
}
