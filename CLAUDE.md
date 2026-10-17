# headwater

Reports every release newer than what a repository pins, with upstream's
notes and the advisories that name it. The design is the statement of
invariants in agentplot/blueprints, `design/headwater/requirements.md`;
this repository cites its clauses by number and never restates them. The
design book is at https://agentplot.github.io/blueprints/headwater/.

Nothing is built yet. The order of work is steps H1 to H7 of
`design/capture/plan.md` in agentplot/blueprints.

## Layers

Run a repository tool through the shell per command,
`devenv shell -- <command>`.

| layer | what | about |
|---|---|---|
| `check-fast` | the site's build, `moon run site:build` | under a minute |

## The site

`site/` is the Starlight site at https://agentplot.github.io/headwater,
published by `.github/workflows/pages.yml`. `site/README.md` says where
its pages and diagrams live.

## Commits

Stage by pathspec and commit the paths you wrote: `git add <paths>`, then
`git commit -m "<subject>" -- <paths>`. Never `-a`, never `add .`.
Conventional Commits subjects, scope the part of the tree touched.
