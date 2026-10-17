# The site

headwater's site at https://agentplot.github.io/headwater, an
[Astro](https://astro.build) site with [Starlight](https://starlight.astro.build),
published by `.github/workflows/pages.yml` on every push to `main` that
touches `site/` or the README.

```sh
devenv shell -- site-dev                      # http://localhost:4321/headwater/
devenv shell -- moon run site:build           # dist/, with every internal link checked
devenv shell -- bash -c 'cd site && bun run shots <dir>'   # screenshots, after a build
```

## Where the pages live

`src/content/docs/`, one file per page, in the sidebar `astro.config.mjs`
lists: the start page (`index.mdx`), how it works, how it fits, the design
and the roadmap. The theme's banner says headwater is designed, not built,
on every page, until its entry in the theme's family list says otherwise.

## The look and the diagrams

The family's header, footer and diagram are `@agentplot/site-theme`'s,
installed from its checkout until it is published (`package.json`); the
Pages workflow builds once the dependency names its GitHub tag.

| file | what |
|---|---|
| `src/styles/diagrams.css` | the diagrams' palette, the only colours a diagram draws with: the family's tokens, headwater's accent, `--ap-accent`, and the theme's warning colour, `--ap-warn`, for an advisory |
| `src/diagrams/loop.ts` | the diagrams' animation: one CSS keyframe loop per drawing, a still frame for reduced motion, every class scoped to its drawing |
| `src/diagrams/hero.ts` | the start page: the pin decides what is new |
| `src/diagrams/tiers.ts` | how it works: a scan reaches only the sources of tiers that are due |
| `src/diagrams/advisory.ts` | how it works: an advisory stays beside the releases while it names the pin |
| `src/diagrams/surfaces.ts` | how it fits: one core, every surface, alone or feeding an inbox |
| `src/components/Batches.astro` | how it works, on a canvas: one scan, three requests |
| `src/components/Figure.astro` | a diagram drawn wide and tall, the tall one on a phone |
| `scripts/shots.mjs` | screenshots of every page at 1280 and 390 pixels in both themes, each diagram's still, and frames of each loop |

Each diagram makes one claim, and its motion is the mechanism the claim
names. A reader who asks for less motion sees one still frame that makes
the claim alone. Change a drawing in its own file; the wide and tall
layouts share one timeline.
