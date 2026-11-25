# Static site generator exercise (Eleventy)

Homework 5, Part 4. Two pages from my portfolio, Home and About, rebuilt with [Eleventy](https://www.11ty.dev/) (version 3). Both pages use one shared layout, and the footer is written once and appears on both.

This folder is separate from the portfolio. The portfolio at the repo root is still plain HTML and is what GitHub Pages deploys.

## Commands

You need Node.js installed. `package.json` is in this folder, not at the repo root, so run the commands from here. From the repo root, `cd` in first:

```sh
cd ssg-exercise  # from the repo root
npm install      # install Eleventy (into node_modules/)
npm run build    # build the pages into _site/
npm start        # build, then serve _site/ and rebuild when a file changes
```

`npm start` keeps running. Stop it with Ctrl+C.

## Preview both pages

After `npm start`, open:

- Home: http://localhost:8080/
- About: http://localhost:8080/about.html

If port 8080 is busy, Eleventy picks another one and prints the address in the terminal.

## See the shared footer update

1. Edit `src/_includes/footer.njk`, for example change "GitHub" to "GitHub profile".
2. Rebuild with `npm run build`. If `npm start` is running, it rebuilds by itself.
3. Refresh both pages. Both footers show the change.

## Files

| Path | What it is |
| --- | --- |
| `eleventy.config.js` | Eleventy settings: `src` in, `_site` out, and which files to copy as-is |
| `src/_includes/layout.njk` | Shared page shell: head, header and nav, `<main>`, and the footer include |
| `src/_includes/footer.njk` | The shared footer |
| `src/index.njk` | Home: front matter and the page's main content |
| `src/about.njk` | About: front matter and the page's main content |
| `src/styles.css`, `src/images/` | Copied from the portfolio and copied into `_site/` unchanged |

`node_modules/` and `_site/` aren't committed. `npm install` and `npm run build` recreate them.

## Differences from the portfolio pages

- No JavaScript and no theme toggle. Home's `<hello-world>` demo, which needs a script, is left out.
- The nav only links Home and About, the two pages built here.
- Links in the page content and footer to other portfolio pages (resume, projects, contact, HTML experiments) are kept as they are, but those pages aren't part of this exercise, so they show "not found" in the preview.
