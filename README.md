# CSE 134B Homework 5

- Repository: https://github.com/JamesVillanueva-Dev/CSE-134-HW5
- Deployed portfolio: https://jamesvillanueva-dev.github.io/CSE-134-HW5/
- Web Component page: https://jamesvillanueva-dev.github.io/CSE-134-HW5/projects.html (the `<fact-panel>` near the top of the page)

## Homework 5, Part 4: static site generator exercise

The Eleventy (11ty) exercise is in [`ssg-exercise/`](ssg-exercise/). It rebuilds two portfolio pages, **Home** and **About**, from a shared layout with a shared footer. The commands to install, build and preview it are in [`ssg-exercise/README.md`](ssg-exercise/README.md).

The portfolio itself (the HTML files at the repo root) is unchanged and is still what GitHub Pages deploys. The empty `.nojekyll` file at the root stops GitHub Pages from running Jekyll, which would otherwise try to run the include tags in the exercise's Nunjucks templates and could break the deployment.

## Design note: fact panel

**What the visitor wants:** a quick, fun random fact while browsing my projects, without leaving or reloading the page.

**One action: pressing "Get a new fact"**

1. The click listener calls `loadFact()`, which ignores the click if a request is already running (`isLoading`).
2. It sets `isLoading`, gives the button `aria-disabled="true"`, and sets the status to "Loading a new fact…".
3. `fetch()` sends a GET request to `API_URL` (the Useless Facts API) with `Accept: application/json` and a 10-second timeout (`AbortSignal.timeout(10000)`).
4. I check `response.ok`, parse the JSON with `response.json()`, and make sure `text` is a non-empty string. A missing `source` falls back to "Useless Facts API".
5. `showFact()` shows the fact and its source with `textContent`, so nothing from the API runs as HTML.
6. The status says "New fact loaded." and the button reads "Get a new fact".

**What the visitor sees:** While waiting, the button looks unavailable (dimmer text, dashed border) and the status says "Loading a new fact…". On success, the new fact replaces the old one. If anything fails (network, timeout, HTTP error, bad JSON or no text), the last fact stays on screen, the status says "Couldn't load a new fact. Check your connection and press Try again." and the button becomes "Try again", which retries without a reload. Either way, `finally` removes `aria-disabled`.

**Other pieces:** The Compact view button, outside the component, toggles the observed `compact` attribute (hiding the source line) and saves the choice in localStorage under "hw5-fact-panel-mode". With JavaScript off, a `<noscript>` message shows instead.
