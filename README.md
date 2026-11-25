| Field | Value |
| --- | --- |
| Repository URL | https://github.com/JamesVillanueva-Dev/134-hw-3 |
| Part 1 Deployed URL | https://134hw3.netlify.app/part1/cheese.html |
| Part 2 Deployed URL | https://134hw3.netlify.app/ |

## Homework 5, Part 4: static site generator exercise

The Eleventy (11ty) exercise is in [`ssg-exercise/`](ssg-exercise/). It rebuilds two portfolio pages, **Home** and **About**, from a shared layout with a shared footer. The commands to install, build and preview it are in [`ssg-exercise/README.md`](ssg-exercise/README.md).

The portfolio itself (the HTML files at the repo root) is unchanged and is still what GitHub Pages deploys. The empty `.nojekyll` file at the root stops GitHub Pages from running Jekyll, which would otherwise try to run the include tags in the exercise's Nunjucks templates and could break the deployment.
