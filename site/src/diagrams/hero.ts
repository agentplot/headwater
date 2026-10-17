// The start page's diagram: headwater reads the declarations, asks the
// lookups, reports every release newer than each pin, and a landed bump
// moves the pin so its releases leave the report. One claim: the pin alone
// decides what is new (headwater 9). Drawn twice, wide and tall, from the same
// timeline; Figure.astro shows the one that fits.
import { BASE, Loop, esc, scope } from './loop';

export type Layout = 'wide' | 'tall';

const T = 18;
// The still frame for a reader who asks for less motion: the bump has
// landed, the pin has moved, and react's two releases are struck through.
const STILL = 0.78 * T;

const deps = [
  { file: 'Cargo.toml', name: 'serde', id: 'pkg:cargo/serde', pin: 3, versions: ['1.0.219', '1.0.225', '1.0.226', '1.0.227', '1.0.228'] },
  { file: 'pyproject.toml', name: 'fastapi', id: 'pkg:pypi/fastapi', pin: 3, versions: ['0.116.1', '0.117.0', '0.117.1', '0.118.0', '0.119.0'] },
  { file: 'package.json', name: 'react', id: 'pkg:npm/react', pin: 2, versions: ['18.3.1', '19.0.0', '19.1.0', '19.2.0', '19.2.1'] },
];
const BUMPED = 2; // react
const BUMP_TO = 4; // 19.2.1

// Each release newer than its pin, in the report's order.
const report = deps.flatMap((d, i) => d.versions.map((v, k) => ({ i, k, name: d.name, v })).filter((r) => r.k > d.pin));

const caps: Array<[string, string, number, number]> = [
  ['headwater reads what', 'the repository declares.', 2, 16],
  ['It asks where each', 'dependency is published.', 16, 36],
  ['Every release newer than', 'its pin is reported.', 36, 56],
  ['A bump lands, the pin moves,', 'and its releases leave.', 56, 96],
];

interface Geo {
  W: number;
  H: number;
  heads: Array<[string, number, number]>;
  card: (i: number) => { x: number; y: number; w: number; h: number };
  cardText: { file: number; name: number; pin: number; pad: number; nameCls: string };
  band: { x: number; y: number; w: number; h: number; labels: Array<[string, number, number]> };
  chipFrom: (i: number) => [number, number];
  chipTo: (i: number) => [number, number];
  chipFont: number;
  track: (i: number) => { x1: number; x2: number; y: number; tick: (k: number) => number; label?: [number, number] };
  count: { x: number; y: number; anchor: string };
  rchip: (j: number) => { x: number; y: number; w: number; h: number };
  fixer: { x: number; y: number; w: number; h: number };
  bumpPath: string;
  bumpLen: number;
  arrow: string;
  pill: { x: number; y: number; w: number };
  cap: (n: number) => { x: number; y: number; one: boolean };
}

const wide: Geo = {
  W: 900,
  H: 446,
  heads: [
    ['THE REPOSITORY', 20, 46],
    ['LOOKUPS', 244, 46],
    ['RELEASES IN VERSION ORDER', 376, 46],
    ['THE REPORT', 664, 46],
  ],
  card: (i) => ({ x: 20, y: 64 + i * 92, w: 206, h: 76 }),
  cardText: { file: 22, name: 44, pin: 64, pad: 16, nameCls: 'sm b' },
  band: {
    x: 244,
    y: 64,
    w: 112,
    h: 260,
    labels: [
      ['deps.dev', 300, 84],
      ['GitHub', 300, 156],
      ['ecosyste.ms', 300, 248],
      ['OSV', 300, 316],
    ],
  },
  chipFrom: (i) => [170, 64 + i * 92 + 44],
  chipTo: (i) => [300, 64 + i * 92 + 44],
  chipFont: 9.5,
  track: (i) => ({ x1: 376, x2: 648, y: 64 + i * 92 + 40, tick: (k) => 394 + k * 61 }),
  count: { x: 664, y: 76, anchor: 'start' },
  rchip: (j) => ({ x: 664, y: 90 + j * 38, w: 216, h: 30 }),
  fixer: { x: 664, y: 254, w: 216, h: 40 },
  bumpPath: 'M772,294 V362 H123 V328',
  bumpLen: 68 + 649 + 34,
  arrow: 'M117,334 L123,325 L129,334 Z',
  pill: { x: 448, y: 362, w: 132 },
  cap: (n) => ({ x: 20 + n * 218, y: 408, one: false }),
};

const tall: Geo = {
  W: 372,
  H: 728,
  heads: [
    ['THE REPOSITORY', 12, 26],
    ['LOOKUPS', 12, 128],
    ['RELEASES IN VERSION ORDER', 12, 224],
    ['THE REPORT', 12, 444],
  ],
  card: (i) => ({ x: 12 + i * 112, y: 36, w: 100, h: 72 }),
  cardText: { file: 19, name: 39, pin: 59, pad: 10, nameCls: 'sm b' },
  band: {
    x: 12,
    y: 136,
    w: 336,
    h: 62,
    labels: [
      ['deps.dev', 58, 188],
      ['GitHub', 138, 188],
      ['ecosyste.ms', 224, 188],
      ['OSV', 306, 188],
    ],
  },
  chipFrom: (i) => [62 + i * 112, 96],
  chipTo: (i) => [62 + i * 112, 158],
  chipFont: 9,
  track: (i) => ({ x1: 20, x2: 344, y: 264 + i * 62, tick: (k) => 36 + k * 72, label: [20, 264 + i * 62 - 20] }),
  count: { x: 348, y: 444, anchor: 'end' },
  rchip: (j) => ({ x: 12 + (j % 2) * 174, y: 456 + Math.floor(j / 2) * 38, w: 162, h: 30 }),
  fixer: { x: 12, y: 538, w: 336, h: 32 },
  bumpPath: 'M180,570 V590 H360 V72 H344',
  bumpLen: 20 + 180 + 518 + 16,
  arrow: 'M347,66 L338,72 L347,78 Z',
  pill: { x: 262, y: 590, w: 120 },
  cap: (n) => ({ x: 12, y: 632 + n * 26, one: true }),
};

export function heroSvg(layout: Layout): string {
  const g = layout === 'wide' ? wide : tall;
  const L = new Loop(T);
  const out: string[] = [];
  const add = (s: string) => out.push(s);

  for (const [t, x, y] of g.heads) add(`<text class="hd" x="${x}" y="${y}">${t}</text>`);

  // The lookups, which glow while the identities are asked about.
  const b = g.band;
  L.hold('bandglow', 'stroke', [[0, 'transparent'], [19, 'var(--d-accent)'], [29, 'transparent']]);
  add(`<rect class="band bandglow" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" stroke-width="1.5"/>`);
  for (const [t, x, y] of b.labels) add(`<text class="mono xxs m" x="${x}" y="${y}" text-anchor="middle">${t}</text>`);

  // The declarations: one card per dependency, lit while it is read.
  deps.forEach((d, i) => {
    const c = g.card(i);
    const ct = g.cardText;
    const lit = 3 + i * 3;
    const stroke: Array<[number, string]> =
      i === BUMPED
        ? [[0, 'var(--d-rule)'], [lit, 'var(--d-accent)'], [17, 'var(--d-rule)'], [66, 'var(--d-ok)'], [97, 'var(--d-rule)']]
        : [[0, 'var(--d-rule)'], [lit, 'var(--d-accent)'], [17, 'var(--d-rule)']];
    L.hold(`cd${i}`, 'stroke', stroke);
    add(`<rect class="card cd${i}" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="7"/>`);
    add(`<text class="mono xxs m" x="${c.x + ct.pad}" y="${c.y + ct.file}">${d.file}</text>`);
    add(`<text class="${ct.nameCls}" x="${c.x + ct.pad}" y="${c.y + ct.name}">${d.name}</text>`);
    add(`<text class="mono xs m" x="${c.x + ct.pad}" y="${c.y + ct.pin}">pin</text>`);
    const vx = c.x + ct.pad + 28;
    if (i === BUMPED) {
      L.show('pinold', 0, 65.5);
      L.show('pinnew', 66.3, 96);
      add(`<text class="mono xs t b pinold" x="${vx}" y="${c.y + ct.pin}">${d.versions[d.pin]}</text>`);
      add(`<text class="mono xs ok b pinnew" x="${vx}" y="${c.y + ct.pin}">${d.versions[BUMP_TO]}</text>`);
    } else {
      add(`<text class="mono xs t b" x="${vx}" y="${c.y + ct.pin}">${d.versions[d.pin]}</text>`);
    }
  });

  // Each version line: the releases its source publishes, in its own order.
  deps.forEach((d, i) => {
    const tr = g.track(i);
    const t0 = 27 + i * 1.6;
    const len = tr.x2 - tr.x1;
    L.anim(`ln${i}`, [
      [0, `stroke-dashoffset:${len};opacity:0`],
      [t0, `stroke-dashoffset:${len};opacity:1`],
      [t0 + 3, 'stroke-dashoffset:0;opacity:1'],
      [96, 'stroke-dashoffset:0;opacity:1'],
      [97, `stroke-dashoffset:0;opacity:0`],
      [100, `stroke-dashoffset:${len};opacity:0`],
    ]);
    if (tr.label) {
      L.show(`tl${i}`, t0, 96);
      add(`<text class="xs b tl${i}" x="${tr.label[0]}" y="${tr.label[1]}">${d.name}</text>`);
    }
    // What is newer than the pin, shaded from the pin to the line's end.
    const px = tr.tick(d.pin);
    const regionEnd = i === BUMPED ? 68 : 96;
    L.show(`nr${i}`, 37 + i, regionEnd);
    add(`<rect class="newer nr${i}" x="${px + 9}" y="${tr.y - 13}" width="${tr.x2 - px - 6}" height="26" rx="6"/>`);
    add(`<text class="mono xxs acc nr${i}" x="${tr.x2 + 2}" y="${tr.y - 18}" text-anchor="end">newer</text>`);
    add(`<line class="track ln${i}" x1="${tr.x1}" y1="${tr.y}" x2="${tr.x2}" y2="${tr.y}" stroke-dasharray="${len}"/>`);
    d.versions.forEach((v, k) => {
      const x = tr.tick(k);
      const at = t0 + 1 + k * 0.5;
      L.show(`tk${i}${k}`, at, 96);
      const newer = k > d.pin;
      let fill = '';
      if (newer) {
        const pts: Array<[number, string]> =
          i === BUMPED ? [[0, 'var(--d-faint)'], [37 + i, 'var(--d-accent)'], [70, 'var(--d-faint)']] : [[0, 'var(--d-faint)'], [37 + i, 'var(--d-accent)'], [97, 'var(--d-faint)']];
        L.hold(`tf${i}${k}`, 'fill', pts);
        fill = ` tf${i}${k}`;
      }
      add(`<g class="tk${i}${k}"><circle class="tick${fill}" cx="${x}" cy="${tr.y}" r="5"/>`);
      add(`<text class="mono xxs m" x="${x}" y="${tr.y + 21}" text-anchor="middle">${v}</text></g>`);
    });
    // The pin: a ring on its release, moved only by the bump.
    const pinAt = t0 + 1 + d.pin * 0.5;
    L.show(`pm${i}`, pinAt, 96);
    let mover = '';
    if (i === BUMPED) {
      const dx = tr.tick(BUMP_TO) - px;
      L.path('pmove', [[0, 0, 0], [67, 0, 0], [71, dx, 0], [96.5, dx, 0], [97, 0, 0], [100, 0, 0]]);
      mover = ' pmove';
      // Where the pin was, and the way it went.
      L.show('ghost', 67, 96);
      add(`<g class="ghost"><line class="pinline" x1="${px}" y1="${tr.y - 18}" x2="${px}" y2="${tr.y + 9}" stroke-dasharray="3 3" opacity=".55"/>`);
      add(`<path class="moved" d="M${px + 4},${tr.y - 36} H${px + dx - 22}"/><path class="movedhead" d="M${px + dx - 24},${tr.y - 40} L${px + dx - 16},${tr.y - 36} L${px + dx - 24},${tr.y - 32} Z"/></g>`);
    }
    add(`<g class="pm${i}"><g class="${mover.trim()}"><line class="pinline" x1="${px}" y1="${tr.y - 18}" x2="${px}" y2="${tr.y + 9}"/>`);
    add(`<circle class="pinring" cx="${px}" cy="${tr.y}" r="8.5"/>`);
    add(`<text class="mono xxs t b" x="${px}" y="${tr.y - 22}" text-anchor="middle">pin</text></g></g>`);
  });

  // The identities, asked about and nothing else of the repository (37).
  deps.forEach((d, i) => {
    const [fx, fy] = g.chipFrom(i);
    const [tx, ty] = g.chipTo(i);
    const w = d.id.length * g.chipFont * 0.6 + 12;
    const a = 16 + i * 2;
    L.path(`id${i}`, [[0, 0, 0, 0], [a, 0, 0, 0], [a + 0.6, 0, 0, 1], [a + 5, tx - fx, ty - fy, 1], [26 + i, tx - fx, ty - fy, 1], [27.5 + i, tx - fx, ty - fy, 0], [100, 0, 0, 0]]);
    add(`<g class="id${i}"><rect class="idchip" x="${fx - w / 2}" y="${fy - 10}" width="${w}" height="20" rx="10"/>`);
    add(`<text class="mono idt" style="font-size:${g.chipFont}px" x="${fx}" y="${fy + 3.5}" text-anchor="middle">${d.id}</text></g>`);
  });

  // How many releases the report holds, before and after the bump.
  const cnt = g.count;
  L.show('cnt4', 50, 73.5);
  L.show('cnt2', 74.3, 96);
  add(`<text class="xs m cnt4" x="${cnt.x}" y="${cnt.y}" text-anchor="${cnt.anchor}">${report.length} newer than their pins</text>`);
  add(`<text class="xs m cnt2" x="${cnt.x}" y="${cnt.y}" text-anchor="${cnt.anchor}">${report.filter((r) => r.i !== BUMPED).length} newer than their pins</text>`);

  // The fixer's bump, landed through sluice, back to the declaration.
  const f = g.fixer;
  L.show('fixer', 56, 96);
  add(`<g class="fixer"><rect class="fixbox" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="7"/>`);
  add(`<text class="xs t" x="${f.x + f.w / 2}" y="${f.y + f.h / 2 + 4}" text-anchor="middle">a fixer moves react’s pin to ${deps[BUMPED].versions[BUMP_TO]}</text></g>`);
  L.anim('bump', [
    [0, `stroke-dashoffset:${g.bumpLen};opacity:0`],
    [58.5, `stroke-dashoffset:${g.bumpLen};opacity:1`],
    [65, 'stroke-dashoffset:0;opacity:1'],
    [96, 'stroke-dashoffset:0;opacity:1'],
    [97, 'stroke-dashoffset:0;opacity:0'],
    [100, `stroke-dashoffset:${g.bumpLen};opacity:0`],
  ]);
  add(`<path class="bumpline bump" d="${g.bumpPath}" stroke-dasharray="${g.bumpLen}"/>`);
  L.show('bumphead', 64.6, 96);
  add(`<path class="bumphead" d="${g.arrow}"/>`);
  const p = g.pill;
  L.show('pill', 61, 96);
  add(`<g class="pill"><rect class="pillbox" x="${p.x - p.w / 2}" y="${p.y - 12}" width="${p.w}" height="24" rx="12"/>`);
  add(`<text class="xs pillt" x="${p.x}" y="${p.y + 4}" text-anchor="middle">sluice lands it</text></g>`);

  // The report: each newer release flies in from its line, and react's
  // leave once the pin has passed them.
  report.forEach((r, j) => {
    const c = g.rchip(j);
    const tr = g.track(r.i);
    const dx = tr.tick(r.k) - (c.x + c.w / 2);
    const dy = tr.y - (c.y + c.h / 2);
    const a = 42 + j * 2;
    const pts: Array<[number, number, number, number?]> =
      r.i === BUMPED
        ? [[0, dx, dy, 0], [a, dx, dy, 0], [a + 0.4, dx, dy, 1], [a + 3.5, 0, 0, 1], [72, 0, 0, 1], [73, 0, 0, 0.4], [82, 0, 0, 0.4], [84, 0, 0, 0], [100, dx, dy, 0]]
        : [[0, dx, dy, 0], [a, dx, dy, 0], [a + 0.4, dx, dy, 1], [a + 3.5, 0, 0, 1], [96, 0, 0, 1], [97, 0, 0, 0], [100, dx, dy, 0]];
    L.path(`rc${j}`, pts);
    add(`<g class="rc${j}"><rect class="rchip" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="6"/>`);
    add(`<rect class="acc" x="${c.x}" y="${c.y}" width="4" height="${c.h}" rx="2"/>`);
    add(`<text class="sm b" x="${c.x + 14}" y="${c.y + 20}">${r.name}</text>`);
    add(`<text class="mono xs acc" x="${c.x + c.w - 12}" y="${c.y + 20}" text-anchor="end">${r.v}</text>`);
    if (r.i === BUMPED) {
      L.show(`st${j}`, 72, 96);
      add(`<line class="strike st${j}" x1="${c.x + 8}" y1="${c.y + c.h / 2}" x2="${c.x + c.w - 8}" y2="${c.y + c.h / 2}"/>`);
    }
    add('</g>');
  });

  // The captions: the one that is happening, the rest dimmed.
  caps.forEach(([l1, l2, a, z], n) => {
    const c = g.cap(n);
    L.show(`cap${n}`, a, z, 0.32);
    add(`<g class="cap cap${n}"><circle class="badge" cx="${c.x + 11}" cy="${c.one ? c.y - 4 : c.y + 4}" r="10"/>`);
    add(`<text class="badget" x="${c.x + 11}" y="${c.one ? c.y : c.y + 8}" text-anchor="middle">${n + 1}</text>`);
    if (c.one) add(`<text class="xs t" x="${c.x + 28}" y="${c.y}">${esc(`${l1} ${l2}`)}</text></g>`);
    else add(`<text class="sm t" x="${c.x + 28}" y="${c.y}">${esc(l1)}</text><text class="sm t" x="${c.x + 28}" y="${c.y + 17}">${esc(l2)}</text></g>`);
  });

  const style = L.style(
    BASE +
      `.track{stroke:var(--d-rule);stroke-width:2;stroke-linecap:round}
.tick{fill:var(--d-faint)}
.newer{fill:var(--d-accent-soft)}
.pinline{stroke:var(--d-fg);stroke-width:2.5;stroke-linecap:round}
.pinring{fill:none;stroke:var(--d-fg);stroke-width:2.5}
.moved{fill:none;stroke:var(--d-ok);stroke-width:1.6}
.movedhead{fill:var(--d-ok)}
.idchip{fill:var(--d-accent)} .idt{fill:var(--d-on-accent)}
.rchip{fill:var(--d-panel);stroke:var(--d-rule);stroke-width:1}
.strike{stroke:var(--d-fg);stroke-width:1.6}
.fixbox{fill:none;stroke:var(--d-muted);stroke-width:1.2;stroke-dasharray:4 3}
.bumpline{fill:none;stroke:var(--d-ok);stroke-width:2}
.bumphead{fill:var(--d-ok)}
.pillbox{fill:var(--d-ok)} .pillt{fill:var(--d-on-accent);font-weight:600}
.pmove{transform-box:view-box}
`,
    STILL,
    '.cap{animation:none!important;opacity:1!important}',
  );

  const title = 'headwater: the pin decides what is new';
  const desc =
    'A repository declares serde 1.0.227 in Cargo.toml, fastapi 0.118.0 in pyproject.toml and react 19.1.0 in package.json. headwater reads the declarations and sends only each identity to the lookups: deps.dev, GitHub, ecosyste.ms and OSV. Each answer is a line of releases in version order with the pin marked, and every release past the pin is newer: serde 1.0.228, fastapi 0.119.0, react 19.2.0 and 19.2.1, four in the report. A fixer bumps react to 19.2.1 and sluice lands it. The pin in package.json moves to 19.2.1, the ring on react’s line moves with it, and react’s two releases leave the report, which now holds two.';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" class="root" role="img" aria-labelledby="ttl dsc">` +
    `<title id="ttl">${title}</title><desc id="dsc">${esc(desc)}</desc><style>${style}</style>` +
    `<rect class="bg" width="${g.W}" height="${g.H}" rx="10"/>` +
    out.join('') +
    '</svg>';
  return scope(svg, `hh${layout[0]}`);
}
