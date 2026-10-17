// How it works: advisories beside releases. Notes and advisories arrive
// apart (headwater 19); a person dismisses a release and it leaves the
// report, while the advisory naming the pin stays (21, 22); a bump moves the
// pin past every release and out of the advisory's range, and both go (9, 18).
// The dependency is made up, so no real project's notes or advisories are
// put in its mouth.
import { BASE, Loop, esc, scope } from './loop';
import type { Layout } from './hero';

const T = 15;
const STILL = 0.4 * T; // dismissed, and the advisory still standing

const rows = [
  { v: '2.4.1', date: '2026-10-14', notes: '“Fixes a regression in 2.4.0’s retry loop.”' },
  { v: '2.4.0', date: '2026-10-08', notes: '“Adds HTTP/3 behind a flag; the default is unchanged.”' },
  { v: '2.3.2', date: '2026-09-30', notes: '“Rejects folded header lines, which 2.3.1 accepted.”' },
];
const DISMISSED = 1;

const caps: Array<[string, string, number, number]> = [
  ['Notes and advisories', 'arrive apart.', 2, 17],
  ['A dismissed release leaves;', 'the advisory stays.', 17, 48],
  ['The pin moves past it,', 'and the advisory goes.', 48, 96],
];

interface Geo {
  W: number;
  H: number;
  head: { name: [number, number]; purl: [number, number]; pin: [number, number, string]; badge: [number, number] };
  rel: { x: number; w: number; head: number; row: (r: number) => number; h: number };
  adv: { x: number; w: number; head: number; y: number; h: number };
  fixer: { x: number; y: number; w: number };
  cap: (n: number) => [number, number];
}

const wide: Geo = {
  W: 720,
  H: 378,
  head: { name: [20, 38], purl: [116, 38], pin: [330, 38, 'start'], badge: [430, 24] },
  rel: { x: 20, w: 420, head: 74, row: (r) => 86 + r * 60, h: 52 },
  adv: { x: 460, w: 240, head: 74, y: 86, h: 112 },
  fixer: { x: 20, y: 282, w: 420 },
  cap: (n) => [20 + n * 236, 340],
};

const tall: Geo = {
  W: 360,
  H: 540,
  head: { name: [14, 32], purl: [14, 50], pin: [346, 32, 'end'], badge: [262, 40] },
  rel: { x: 12, w: 336, head: 86, row: (r) => 98 + r * 60, h: 52 },
  adv: { x: 12, w: 336, head: 300, y: 312, h: 96 },
  fixer: { x: 12, y: 420, w: 336 },
  cap: (n) => [14, 476 + n * 24],
};

export function advisorySvg(layout: Layout): string {
  const g = layout === 'wide' ? wide : tall;
  const L = new Loop(T);
  const out: string[] = [];
  const add = (s: string) => out.push(s);

  // The dependency, its pin, and whether an advisory names it.
  add(`<text class="lg b" x="${g.head.name[0]}" y="${g.head.name[1]}">acme-http</text>`);
  add(`<text class="mono xs m" x="${g.head.purl[0]}" y="${g.head.purl[1]}">pkg:pypi/acme-http</text>`);
  const [px, py, pa] = g.head.pin;
  L.show('pinold', 0, 55.5);
  L.show('pinnew', 56.3, 96);
  add(`<text class="mono sm pinold" x="${px}" y="${py}" text-anchor="${pa}"><tspan class="m">pin </tspan><tspan class="b">2.3.1</tspan></text>`);
  add(`<text class="mono sm pinnew" x="${px}" y="${py}" text-anchor="${pa}"><tspan class="m">pin </tspan><tspan class="b ok">2.4.1</tspan></text>`);
  const [bx, by] = g.head.badge;
  L.show('badge', 9, 61);
  L.anim('badgepulse', [[0, 'transform:scale(1)'], [31, 'transform:scale(1)'], [33, 'transform:scale(1.12)'], [36, 'transform:scale(1)'], [100, 'transform:scale(1)']], 'ease-in-out');
  add(`<g class="badge"><g class="badgepulse"><rect class="affected" x="${bx}" y="${by}" width="74" height="22" rx="11"/>`);
  add(`<text class="xs b afft" x="${bx + 37}" y="${by + 15}" text-anchor="middle">affected</text></g></g>`);

  // The releases newer than the pin, each with its notes as upstream wrote them.
  const r = g.rel;
  add(`<text class="hd" x="${r.x}" y="${r.head}">RELEASES NEWER THAN THE PIN</text>`);
  rows.forEach((row, i) => {
    const y = r.row(i);
    const a = 2 + i * 2;
    const cls = `rw${i}`;
    if (i === DISMISSED) {
      L.anim(cls, [[0, 'opacity:0'], [a - 0.5, 'opacity:0'], [a, 'opacity:1'], [22, 'opacity:1'], [23, 'opacity:.45'], [25.5, 'opacity:.45'], [27, 'opacity:0'], [100, 'opacity:0']]);
    } else if (i === 2) {
      // The last row closes the gap the dismissed one leaves.
      L.anim(cls, [
        [0, 'opacity:0;transform:translate(0px,0px)'],
        [a - 0.5, 'opacity:0;transform:translate(0px,0px)'],
        [a, 'opacity:1;transform:translate(0px,0px)'],
        [27, 'opacity:1;transform:translate(0px,0px)'],
        [30, 'opacity:1;transform:translate(0px,-60px)'],
        [57, 'opacity:1;transform:translate(0px,-60px)'],
        [58, 'opacity:.45;transform:translate(0px,-60px)'],
        [61, 'opacity:.45;transform:translate(0px,-60px)'],
        [63, 'opacity:0;transform:translate(0px,-60px)'],
        [100, 'opacity:0;transform:translate(0px,0px)'],
      ], 'ease-in-out');
    } else {
      L.anim(cls, [[0, 'opacity:0'], [a - 0.5, 'opacity:0'], [a, 'opacity:1'], [57, 'opacity:1'], [58, 'opacity:.45'], [61, 'opacity:.45'], [63, 'opacity:0'], [100, 'opacity:0']]);
    }
    add(`<g class="${cls}"><rect class="row" x="${r.x}" y="${y}" width="${r.w}" height="${r.h}" rx="7"/>`);
    add(`<rect class="acc" x="${r.x}" y="${y}" width="4" height="${r.h}" rx="2"/>`);
    add(`<text class="mono sm b acc" x="${r.x + 16}" y="${y + 21}">${row.v}</text>`);
    add(`<text class="mono xxs m" x="${r.x + r.w - 12}" y="${y + 20}" text-anchor="end">${row.date}</text>`);
    add(`<text class="xs t notes" x="${r.x + 16}" y="${y + 40}">${esc(row.notes)}</text>`);
    const strikeAt = i === DISMISSED ? 22 : 57;
    L.show(`sk${i}`, strikeAt, i === DISMISSED ? 27 : 63);
    add(`<line class="strike sk${i}" x1="${r.x + 10}" y1="${y + 17}" x2="${r.x + 70}" y2="${y + 17}"/></g>`);
  });
  // The acknowledgement: given by a person, for one release.
  const dy = r.row(DISMISSED);
  L.path('ack', [[0, 40, 0, 0], [17.5, 40, 0, 0], [19, 0, 0, 1], [25.5, 0, 0, 1], [27, 0, 0, 0], [100, 40, 0, 0]]);
  add(`<g class="ack"><rect class="acktag" x="${r.x + r.w - 168}" y="${dy + 28}" width="156" height="20" rx="10"/>`);
  add(`<text class="xxs b ackt" x="${r.x + r.w - 90}" y="${dy + 41.5}" text-anchor="middle">dismissed by a person</text></g>`);
  // Where it went: the acknowledgement stays readable (24).
  const gy = r.row(2);
  L.show('gone', 30, 55);
  add(`<g class="gone"><rect class="ghost" x="${r.x}" y="${gy}" width="${r.w}" height="${r.h - 12}" rx="7"/>`);
  add(`<text class="xs m" x="${r.x + 16}" y="${gy + 25}">2.4.0 · dismissed by a person, left out of the report</text></g>`);
  L.show('none', 64, 96);
  add(`<text class="sm m none" x="${r.x + 16}" y="${r.row(0) + 30}">nothing newer than 2.4.1</text>`);

  // The advisory, from its own source, beside the releases and never in their notes.
  const v = g.adv;
  add(`<text class="hd" x="${v.x}" y="${v.head}">ADVISORIES THAT NAME THE PIN</text>`);
  L.anim('adv', [[0, 'opacity:0'], [8, 'opacity:0'], [9, 'opacity:1'], [60, 'opacity:1'], [61, 'opacity:.45'], [63, 'opacity:.45'], [65, 'opacity:0'], [100, 'opacity:0']]);
  L.anim('advpulse', [[0, 'stroke-width:1.5'], [31, 'stroke-width:1.5'], [33, 'stroke-width:4'], [36, 'stroke-width:1.5'], [100, 'stroke-width:1.5']], 'ease-in-out');
  add(`<g class="adv"><rect class="advbox advpulse" x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" rx="7"/>`);
  add(`<text class="sm b bad" x="${v.x + 14}" y="${v.y + 24}">OSV · severity high</text>`);
  add(`<text class="mono xs t" x="${v.x + 14}" y="${v.y + (layout === 'wide' ? 48 : 46)}">affects 2.0.0 to 2.3.1</text>`);
  add(`<text class="mono xs t" x="${v.x + 14}" y="${v.y + (layout === 'wide' ? 68 : 66)}">fixed in 2.3.2</text>`);
  add(`<text class="xxs m" x="${v.x + 14}" y="${v.y + (layout === 'wide' ? 94 : 86)}">severity as the advisory gives it</text>`);
  L.show('advgo', 61, 66);
  add(`<text class="xs m advgo" x="${v.x + v.w - 14}" y="${v.y + 24}" text-anchor="end">no longer names the pin</text></g>`);
  L.show('advnone', 66, 96);
  add(`<text class="sm m advnone" x="${v.x + 14}" y="${v.y + 30}">no advisory names 2.4.1</text>`);

  // The bump, which a fixer makes and sluice lands.
  const f = g.fixer;
  L.show('fixer', 50, 96);
  add(`<g class="fixer"><rect class="fixbox" x="${f.x}" y="${f.y}" width="${f.w}" height="30" rx="7"/>`);
  add(`<text class="xs t" x="${f.x + 14}" y="${f.y + 19.5}">a fixer moves the pin to 2.4.1</text>`);
  L.show('lands', 53.5, 96);
  add(`<g class="lands"><rect class="pillbox" x="${f.x + f.w - 112}" y="${f.y + 5}" width="104" height="20" rx="10"/>`);
  add(`<text class="xxs b pillt" x="${f.x + f.w - 60}" y="${f.y + 18.5}" text-anchor="middle">sluice lands it</text></g></g>`);

  caps.forEach(([l1, l2, a, z], n) => {
    const [x, y] = g.cap(n);
    L.show(`cap${n}`, a, z, 0.32);
    add(`<g class="cap cap${n}"><circle class="badge2" cx="${x + 10}" cy="${y - 4}" r="9.5"/><text class="badget" x="${x + 10}" y="${y}" text-anchor="middle">${n + 1}</text>`);
    if (layout === 'wide') add(`<text class="sm t" x="${x + 26}" y="${y}">${esc(l1)}</text><text class="sm t" x="${x + 26}" y="${y + 17}">${esc(l2)}</text></g>`);
    else add(`<text class="xs t" x="${x + 26}" y="${y}">${esc(`${l1} ${l2}`)}</text></g>`);
  });

  const style = L.style(
    BASE +
      `.row{fill:var(--d-panel);stroke:var(--d-rule);stroke-width:1}
.notes{font-style:italic}
.strike{stroke:var(--d-fg);stroke-width:1.6}
.affected{fill:var(--d-bad-soft);stroke:var(--d-bad);stroke-width:1.2} .afft{fill:var(--d-bad)}
.badgepulse{transform-box:fill-box;transform-origin:center}
.advbox{fill:var(--d-bad-soft);stroke:var(--d-bad)}
.acktag{fill:var(--d-fg)} .ackt{fill:var(--d-bg)}
.ghost{fill:none;stroke:var(--d-rule);stroke-dasharray:4 3}
.fixbox{fill:none;stroke:var(--d-muted);stroke-width:1.2;stroke-dasharray:4 3}
.pillbox{fill:var(--d-ok)} .pillt{fill:var(--d-on-accent)}
.badge2{fill:var(--d-accent)}
`,
    STILL,
    '.cap{animation:none!important;opacity:1!important}',
  );
  const title = 'Advisories beside releases: an acknowledgement never hides one';
  const desc =
    'acme-http is pinned at 2.3.1. Three newer releases are reported, 2.4.1, 2.4.0 and 2.3.2, each with its notes as upstream wrote them. Apart from them, an OSV advisory of high severity names versions 2.0.0 to 2.3.1, so the dependency is marked affected. A person dismisses 2.4.0, and it leaves the report; the advisory and the affected mark stay. A fixer moves the pin to 2.4.1 and sluice lands it: no release is newer, the advisory no longer names the pin, and both leave the report.';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" class="root" role="img" aria-labelledby="ttl dsc">` +
    `<title id="ttl">${esc(title)}</title><desc id="dsc">${esc(desc)}</desc><style>${style}</style>` +
    `<rect class="bg" width="${g.W}" height="${g.H}" rx="10"/>` +
    out.join('') +
    '</svg>';
  return scope(svg, `ha${layout[0]}`);
}
