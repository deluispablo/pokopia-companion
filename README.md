# Mi Pokopia · Companion

A phone-first web app for players of Pokopia on Nintendo Switch 2. The game's save can't be read, so you
mark things by hand as you play: the Pokémon you have befriended and where each one lives now, the habitats you
have registered, your Collection (ancient artifacts, human records, highlight reel photos, recipes and items) and
the dishes you have seen. It also works on tablets and desktops, in
Spanish (default) or English, with a light and a dark theme.

This is a fan project, not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Game names,
data and pictures belong to their owners.

## Features

- Pokémon, Habitats, Collection and Cooking lists organised like the game's own menus, with search and
  filters (registration status, location, type, category, family, flavour, environment, specialty, recipe,
  attribute)
- The Collection's five sections as in the game: Ancient Artifacts (from the game's own table), Human Records,
  Highlight Reel, Recipes and Items. Human record types and highlight reel shots come from
  [Pokopia Guide](https://pokopiaguide.com/collectibles), as the game keeps no list of them we can read
- A page for each entry, linking Pokémon, habitats, items and dishes to each other
- One-tap marking with undo, and a quick-mark sheet for marking many at once
- Houses: design a house for up to four Pokémon (best housemates, items, comfort items and dishes that suit
  their likes) or let the app split all your Pokémon into houses
- Progress counts per list, and a first-visit tips card

## Privacy

Your marks stay in your browser (localStorage) and are never sent anywhere. Use the backup button to export
them to a file and to import them again, on this device or another one.

## Run locally

There is no build step and nothing to install:

```sh
python3 -m http.server 8000   # or: npm start
```

Then open http://localhost:8000. Any static file server works; opening `index.html` from disk does not,
because the app uses ES modules.

## Project structure

```
index.html          page shell: loads the data scripts, then src/main.js
css/                tokens (colours, sizes) · base · components · layout (breakpoints 600/900/1400)
data/               generated game data, as scripts that define PANEL_* globals (do not edit)
img/                pictures of Pokémon, habitats and items
src/
  main.js           boot: preferences, marks, router, events
  catalog.js        shapes the game data into list entries; game.js builds it from the page globals
  state.js          what the screen shows, and render()
  router.js         addresses (#pok/Ivysaur, #casa/rep…) and navigation
  store.js          marks and preferences in localStorage, import/export helpers
  i18n/             es.js and en.js UI strings, game-terms.js official game wording
  logic/houses.js   house fit, item ranking and the automatic split
  ui/               DOM helper, icons, toast, sheet, focus keeping
  views/            header, filters, list, detail page, houses, split, sheets, nav
tests/              node --test suites
tools/sync-data.sh  copies fresh game data from the nxnative repo
dev/                sample marks to import while testing
```

## Updating game data

The files in `data/` and `img/` are generated from the game's files by the Python tools of the separate
nxnative project, and are copied here as they are. With a checkout of nxnative next to this repo:

```sh
tools/sync-data.sh                       # from ../nxnative/dm/games/0400A3A01EE4C000/panel
tools/sync-data.sh path/to/panel         # or NXNATIVE_PANEL=path/to/panel tools/sync-data.sh
```

It copies `data.js images.js cats.js areas.js en.js crafts.js comfort.js` and `img/`, nothing else.
Run the tests and look over the app before committing the update.

## Tests

Node 18 or later, no dependencies:

```sh
npm test   # or: node --test
```

They cover the marks store, address parsing, both dictionaries, the house logic and the shape of the game data.

## Deploy

GitHub Pages: Settings › Pages › Deploy from a branch › `main`, folder `/ (root)`. Every push to `main` redeploys it.
