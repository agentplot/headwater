// How it fits: one core answers every surface with the same release under
// the same name (headwater 10, 32, 33). Alone, a key in herdr starts an agent
// in a worktree and sluice lands its bump; with an inbox, the Flywheel
// plugin hands the release to millpond, which keeps it once however often
// it is reported. Either way the landed bump moves the pin, and the release
// leaves every surface (9). The loop runs the two ways in turn.
import { BASE, Loop, esc, scope } from './loop';
import type { Layout } from './hero';

const T = 24;
const STILL = 0.34 * T; // alone: landed, the pin moved, the release still on every surface
const RELEASE = 'pkg:npm/react@19.2.1';
const KEY = 'release/npm/react/19.2.1';

type Box = { x: number; y: number; w: number; h: number };
interface Geo {
  W: number;
  H: number;
  core: Box;
  surf: Box[]; // Claude Code, herdr, command line, Flywheel plugin
  agent: Box;
  pond: Box;
  sluice: Box;
  laneLabel: { alone: [number, number]; inbox: [number, number] };
  key: [number, number];
  toAgent: string;
  toPond: string;
  agentToSluice: string;
  pondToSluice: string;
  back: string;
  backLabel: [number, number, string];
  dedupe: [number, number, string];
  foot: (n: number) => [number, number];
  footTwoLines: boolean;
}

const len = (d: string) => {
  // Lengths of paths made of H and V segments from an M.
  let x = 0;
  let y = 0;
  let total = 0;
  for (const m of d.matchAll(/([MHV])\s*([\d.]+)(?:,([\d.]+))?/g)) {
    const [, c, a, b] = m;
    if (c === 'M') {
      x = +a;
      y = +b;
    } else if (c === 'H') {
      total += Math.abs(+a - x);
      x = +a;
    } else {
      total += Math.abs(+a - y);
      y = +a;
    }
  }
  return Math.ceil(total);
};

const wide: Geo = {
  W: 720,
  H: 436,
  core: { x: 20, y: 115, w: 140, h: 84 },
  surf: [44, 104, 164, 224].map((y) => ({ x: 200, y, w: 156, h: 46 })),
  agent: { x: 400, y: 104, w: 166, h: 46 },
  pond: { x: 400, y: 224, w: 166, h: 46 },
  sluice: { x: 600, y: 164, w: 104, h: 46 },
  laneLabel: { alone: [400, 94], inbox: [400, 214] },
  key: [378, 100],
  toAgent: 'M356,127 H400',
  toPond: 'M356,247 H400',
  agentToSluice: 'M566,127 H628 V164',
  pondToSluice: 'M566,247 H628 V210',
  back: 'M676,210 V316 H90 V199',
  backLabel: [381, 334, 'middle'],
  dedupe: [483, 288, 'middle'],
  foot: (n) => [20, 368 + n * 22],
  footTwoLines: false,
};

const tall: Geo = {
  W: 362,
  H: 600,
  core: { x: 112, y: 16, w: 140, h: 62 },
  surf: [
    { x: 22, y: 104, w: 158, h: 46 },
    { x: 22, y: 162, w: 158, h: 46 },
    { x: 192, y: 104, w: 158, h: 46 },
    { x: 192, y: 162, w: 158, h: 46 },
  ],
  agent: { x: 22, y: 264, w: 158, h: 46 },
  pond: { x: 192, y: 264, w: 158, h: 46 },
  sluice: { x: 127, y: 352, w: 108, h: 40 },
  laneLabel: { alone: [22, 254], inbox: [192, 254] },
  key: [150, 226],
  toAgent: 'M101,208 V264',
  toPond: 'M271,208 V264',
  agentToSluice: 'M101,310 V372 H127',
  pondToSluice: 'M271,310 V372 H235',
  back: 'M181,392 V412 H8 V47 H112',
  backLabel: [22, 430, 'start'],
  dedupe: [271, 326, 'middle'],
  foot: (n) => [14, 464 + n * 44],
  footTwoLines: true,
};

const foot: Array<[string, string, Array<[number, number]>]> = [
  ['Alone: a key in herdr starts an agent in a worktree,', 'and sluice lands its bump.', [[2, 47]]],
  ['With an inbox: millpond keeps the release once,', 'and the plan turns it into work.', [[50, 97]]],
  ['Either way the landed bump moves the pin,', 'and the release leaves every surface.', [[28, 47], [80, 97]]],
];

export function surfacesSvg(layout: Layout): string {
  const g = layout === 'wide' ? wide : tall;
  const L = new Loop(T);
  const out: string[] = [];
  const add = (s: string) => out.push(s);
  const E = L.E;

  // Opacity lo outside each window and hi inside, for steps that happen in both halves.
  const windows = (cls: string, ws: Array<[number, number]>, lo = 0, hi = 1) => {
    const fr: Array<[number, string]> = [[0, `opacity:${lo}`]];
    for (const [a, b] of ws) fr.push([a - E, `opacity:${lo}`], [a, `opacity:${hi}`], [b, `opacity:${hi}`], [b + E, `opacity:${lo}`]);
    fr.push([100, `opacity:${lo}`]);
    return L.anim(cls, fr);
  };
  // A line drawn on over [a, b] and held until z, for each half.
  const draw = (cls: string, d: string, ws: Array<[number, number, number]>) => {
    const n = len(d);
    const fr: Array<[number, string]> = [[0, `stroke-dashoffset:${n};opacity:0`]];
    for (const [a, b, z] of ws)
      fr.push([a - 0.1, `stroke-dashoffset:${n};opacity:0`], [a, `stroke-dashoffset:${n};opacity:1`], [b, 'stroke-dashoffset:0;opacity:1'], [z, 'stroke-dashoffset:0;opacity:1'], [z + E, 'stroke-dashoffset:0;opacity:0']);
    fr.push([100, `stroke-dashoffset:${n};opacity:0`]);
    L.anim(cls, fr);
    add(`<path class="base" d="${d}"/><path class="flow ${cls}" d="${d}" stroke-dasharray="${n}"/>`);
  };
  const box = (b: Box, cls: string, lines: string[], extra = '') => {
    add(`<g class="${extra}"><rect class="${cls}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8"/>`);
    lines.forEach((l, i) => add(l.replace(/\{x\}/g, String(b.x + 12)).replace(/\{y(\d+)\}/g, (_, o) => String(b.y + +o))));
    add('</g>');
  };

  // The lanes' names, each lit while its way runs.
  windows('lnA', [[2, 47]], 0.4);
  windows('lnB', [[50, 97]], 0.4);
  add(`<text class="hd lnA" x="${g.laneLabel.alone[0]}" y="${g.laneLabel.alone[1]}">ALONE</text>`);
  add(`<text class="hd lnB" x="${g.laneLabel.inbox[0]}" y="${g.laneLabel.inbox[1]}">WITH AN INBOX</text>`);

  // The ways between them.
  draw('fA1', g.toAgent, [[12, 15, 47]]);
  draw('fA2', g.agentToSluice, [[19, 23, 47]]);
  draw('fB1', g.toPond, [[60, 63, 97]]);
  draw('fB2', g.pondToSluice, [[71, 75, 97]]);
  draw('fBack', g.back, [[28, 33, 47], [80, 85, 97]]);
  windows('backl', [[31, 47], [83, 97]]);
  const [blx, bly, bla] = g.backLabel;
  add(`<text class="xs t backl" x="${blx}" y="${bly}" text-anchor="${bla}">the pin moves to 19.2.1</text>`);

  // The core.
  const c = g.core;
  box(c, 'corebox', [
    `<text class="lg b" x="${c.x + c.w / 2}" y="{y${layout === 'wide' ? 32 : 26}}" text-anchor="middle">headwater</text>`,
    `<text class="xs m" x="${c.x + c.w / 2}" y="{y${layout === 'wide' ? 50 : 44}}" text-anchor="middle">one core</text>`,
    ...(layout === 'wide' ? [`<text class="mono xxs m" x="${c.x + c.w / 2}" y="{y68}" text-anchor="middle">scan · report · brief</text>`] : []),
  ]);

  // The surfaces, each told the same release under the same name.
  const names = ['Claude Code', 'herdr', 'command line', 'Flywheel plugin'];
  g.surf.forEach((s, i) => {
    const lit = i === 1 ? 'litA' : i === 3 ? 'litB' : '';
    box(s, `surfbox ${lit}`, [`<text class="xs b" x="{x}" y="{y18}">${names[i]}</text>`]);
  });
  L.hold('litA', 'stroke', [[0, 'var(--d-rule)'], [8, 'var(--d-accent)'], [24, 'var(--d-rule)']]);
  L.hold('litB', 'stroke', [[0, 'var(--d-rule)'], [58, 'var(--d-accent)'], [70, 'var(--d-rule)']]);
  const cx = c.x + c.w;
  const cy = c.y + c.h / 2;
  const chipW = RELEASE.length * 9 * 0.6 + 12;
  g.surf.forEach((s, i) => {
    const x = s.x + 12;
    const y = s.y + 25;
    const dx = (layout === 'wide' ? cx : c.x + c.w / 2) - (x + chipW / 2);
    const dy = (layout === 'wide' ? cy : c.y + c.h) - (y + 8);
    const pts: Array<[number, number, number, number?]> = [[0, dx, dy, 0]];
    for (const [a, z] of [[1, 36], [51, 88]]) pts.push([a + i * 0.6, dx, dy, 0], [a + i * 0.6 + 0.4, dx, dy, 1], [a + i * 0.6 + 4, 0, 0, 1], [z, 0, 0, 1], [z + 2, 0, 0, 0], [z + 2.1, dx, dy, 0]);
    pts.push([100, dx, dy, 0]);
    L.path(`rel${i}`, pts);
    add(`<g class="rel${i}"><rect class="chip" x="${x}" y="${y}" width="${chipW}" height="16" rx="8"/>`);
    add(`<text class="mono chipt" x="${x + chipW / 2}" y="${y + 11.5}" text-anchor="middle">${RELEASE}</text></g>`);
  });

  // Alone: the fix key, and the agent it starts.
  const [kx, ky] = g.key;
  windows('key', [[9, 16]]);
  add(`<g class="key"><rect class="keycap" x="${kx - 10}" y="${ky - 10}" width="20" height="20" rx="4"/><text class="mono xs b keyt" x="${kx}" y="${ky + 4}" text-anchor="middle">f</text></g>`);
  const a = g.agent;
  windows('agentlit', [[15, 47]], 0.35);
  box(a, 'lanebox', [`<text class="xs b" x="{x}" y="{y18}">agent in a worktree</text>`, `<text class="mono xxs m" x="{x}" y="{y35}">bump react to 19.2.1</text>`], 'agentlit');

  // With an inbox: millpond, which keeps one capture per key.
  const p = g.pond;
  windows('pondlit', [[63, 97]], 0.35);
  box(p, 'lanebox', [`<text class="xs b" x="{x}" y="{y18}">millpond</text>`, `<text class="mono xxs m" x="{x}" y="{y35}">${KEY}</text>`], 'pondlit');
  // A second scan reports the release again, under the same key, and is kept once.
  const fy = g.surf[3];
  const from = layout === 'wide' ? { x: fy.x + fy.w, y: fy.y + fy.h / 2 } : { x: fy.x + fy.w / 2, y: fy.y + fy.h };
  const to = layout === 'wide' ? { x: p.x + 8, y: p.y + p.h / 2 } : { x: p.x + p.w / 2, y: p.y + 6 };
  L.path('dup', [[0, 0, 0, 0], [65, 0, 0, 0], [65.4, 0, 0, 1], [68.5, to.x - from.x, to.y - from.y, 1], [69.5, to.x - from.x, to.y - from.y, 0], [100, 0, 0, 0]]);
  add(`<g class="dup"><circle class="dupdot" cx="${from.x}" cy="${from.y}" r="6"/></g>`);
  windows('dedupe', [[68.5, 97]]);
  const [ddx, ddy, dda] = g.dedupe;
  add(`<text class="xxs m dedupe" x="${ddx}" y="${ddy}" text-anchor="${dda}">second scan, same key: kept once</text>`);
  windows('plan', [[72, 97]]);
  if (layout === 'wide') add(`<text class="xxs m plan" x="574" y="266">an item, then the plan</text>`);

  // sluice, where either way's bump lands.
  const sl = g.sluice;
  L.hold('sllit', 'opacity', [[0, '.55'], [23, '1'], [47, '.55'], [75, '1'], [97, '.55']]);
  box(sl, 'sluicebox', [`<text class="sm b sluicet" x="${sl.x + sl.w / 2}" y="{y${sl.h / 2 + 5}}" text-anchor="middle">sluice lands</text>`], 'sllit');

  // The footer: which way is running, and what holds either way.
  foot.forEach(([l1, l2, ws], n) => {
    const [x, y] = g.foot(n);
    windows(`ft${n}`, ws, 0.32);
    const mark = n === 2 ? 'markok' : 'markacc';
    add(`<g class="ft${n}"><circle class="${mark}" cx="${x + 5}" cy="${y - 4}" r="4.5"/>`);
    if (g.footTwoLines) add(`<text class="xs t" x="${x + 18}" y="${y}">${esc(l1)}</text><text class="xs t" x="${x + 18}" y="${y + 17}">${esc(l2)}</text></g>`);
    else add(`<text class="sm t" x="${x + 18}" y="${y}">${esc(`${l1} ${l2}`)}</text></g>`);
  });

  const style = L.style(
    BASE +
      `.corebox{fill:var(--d-panel);stroke:var(--d-fg);stroke-width:1.6}
.surfbox{fill:var(--d-panel);stroke:var(--d-rule);stroke-width:1.5}
.lanebox{fill:var(--d-panel);stroke:var(--d-rule);stroke-width:1.5}
.sluicebox{fill:var(--d-ok)} .sluicet{fill:var(--d-on-accent)}
.chip{fill:var(--d-accent)} .chipt{fill:var(--d-on-accent);font-size:9px}
.base{fill:none;stroke:var(--d-rule);stroke-width:1.5;stroke-dasharray:3 4}
.flow{fill:none;stroke:var(--d-accent);stroke-width:2}
.fBack{stroke:var(--d-ok)}
.keycap{fill:var(--d-fg)} .keyt{fill:var(--d-bg)}
.dupdot{fill:var(--d-accent)}
.markacc{fill:var(--d-accent)} .markok{fill:var(--d-ok)}
`,
    STILL,
  );
  const title = 'One core, every surface: alone or feeding an inbox';
  const desc =
    'headwater’s one core reports the release pkg:npm/react@19.2.1, and Claude Code, herdr, the command line and the Flywheel plugin each show it under that same name. Alone: a key in herdr starts an agent in its own worktree, which bumps react to 19.2.1, and sluice lands the bump. With an inbox: the Flywheel plugin hands the release to millpond under the key release/npm/react/19.2.1; a second scan reports it again under the same key and millpond keeps it once; the plan turns it into work, and sluice lands the bump. Either way the pin moves to 19.2.1 and the release leaves every surface.';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" class="root" role="img" aria-labelledby="ttl dsc">` +
    `<title id="ttl">${esc(title)}</title><desc id="dsc">${esc(desc)}</desc><style>${style}</style>` +
    `<rect class="bg" width="${g.W}" height="${g.H}" rx="10"/>` +
    out.join('') +
    '</svg>';
  return scope(svg, `hs${layout[0]}`);
}
