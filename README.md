# headwater

**Every release newer than what your repository pins, in upstream's own words.**

headwater reads what a repository declares, asks where each dependency is
published, and reports every release newer than the pin, with its notes and
the advisories that name it. The pin decides what is new: when a bump lands,
the pin moves and the release leaves the report. headwater never changes the
repository and never acts on a release. A person or an agent decides, and the
change is theirs.

> **Status: designed, not built.** The design is settled in a statement of
> invariants; no code exists yet. The [roadmap](https://agentplot.github.io/headwater/roadmap/)
> orders the work.

## What it does

- **Reads declarations** a repository already has: npm, Python, Cargo, Go,
  mise, GitHub Actions, container images, and a watch list for tools no
  manifest names.
- **Asks lookups in batches**: deps.dev, GitHub, ecosyste.ms, each registry's
  own API, and OSV for advisories. A lookup learns the identities and
  versions asked about, and nothing else of the repository.
- **Reports upstream's words whole.** Notes arrive as upstream wrote them, and
  no model reads them inside headwater. Advisories stand apart from notes.
- **Scans what matters most more often.** A repository names tiers of its
  dependencies, each with a cadence; a scan reaches the sources of the tiers
  that are due.
- **Keeps its state in the git directory**, outside the repository's content,
  shared by every worktree.

One core answers four surfaces the same way: a command line, a Claude Code
plugin, a herdr plugin with a sidebar of unread releases and a key that hands
a release to an agent in its own worktree, and a Flywheel plugin whose adapter
hands each release to [millpond](https://github.com/agentplot/millpond), the
inbox.

## Design

- [The design book](https://agentplot.github.io/blueprints/headwater/)
- [The statement of invariants](https://github.com/agentplot/blueprints/blob/main/design/headwater/requirements.md)
  in agentplot/blueprints, which this repository cites by clause number
- [The site](https://agentplot.github.io/headwater), built from `site/`

headwater is one of a family: millpond keeps the inbox, eddy lists recorded
meetings, [sluice](https://github.com/agentplot/sluice) lands each change, and
[Flywheel](https://github.com/agentplot/flywheel-web) runs the teams that make
them. Its first user is swancloud, a NixOS fleet whose watch list names the
tools it pins.

## License

[MIT](LICENSE)
