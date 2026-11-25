// eleventy.config.js: settings for the Eleventy (11ty) build.
//
// Eleventy looks for a file with this name in the folder you run it
// from, so `npm run build` and `npm start` pick it up automatically.
//
// This file is an ES module (it uses `export`), because package.json
// has "type": "module". That's the format Eleventy v3's docs use.

// The default export is a function Eleventy calls once at startup.
// It passes in eleventyConfig, an object with methods for changing
// how the build works.
export default function (eleventyConfig) {
  // Passthrough copy: copy these files into the output folder exactly
  // as they are, without treating them as templates. Paths start from
  // this project folder. Eleventy drops the input folder name, so
  // "src/styles.css" ends up at "_site/styles.css".
  eleventyConfig.addPassthroughCopy("src/styles.css");

  // Only the two images the pages use: the headshot in both formats.
  // The <picture> element on both pages offers the .webp first and
  // falls back to the .jpg, and the .jpg is also the favicon.
  eleventyConfig.addPassthroughCopy("src/images/headshot.jpg");
  eleventyConfig.addPassthroughCopy("src/images/headshot.webp");
}

// Folder settings. A separate named export, because Eleventy needs to
// know the folders before it runs the function above.
export const config = {
  dir: {
    input: "src", // where the templates live (index.njk, about.njk...)
    output: "_site", // where the finished HTML is written
    // _includes (layouts and partials) is looked up inside "src".
  },
};
