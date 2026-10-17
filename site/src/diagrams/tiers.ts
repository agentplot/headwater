// How it works: tiers and cadence. Over eight days a repository's sessions
// start seven times. At each start headwater scans the tiers that are due
// and reaches their sources; a tier that is not due is answered from what
// headwater holds, and reaches none (headwater 15, 17). A scan that cannot
// reach a source leaves its tier due (16).
import { BASE, Loop, esc, scope } from './loop';
import type { Layout } from './hero';

const T = 16;
const STILL = 0.93 * T;
const HOURS = 8 * 24;
const SWEEP = [4, 88]; // the playhead's run, in percent

// Each start: its hour, and what each tier does there.
type Act = 'scan' | 'held' | 'unread';
// A note sits above the sources' pulses or below the axis, and starts at
// its mark unless it ends there.
const starts: Array<{ h: number; fav: Act; def: Act; note?: [string, 'up' | 'down', 'start' | 'end'] }> = [
  { h: 9, fav: 'scan', def: 'scan', note: ['first start: both due', 'up', 'start'] },
  { h: 15, fav: 'held', def: 'held', note: ['six hours on: nothing due', 'down', 'start'] },
  { h: 33, fav: 'scan', def: 'held' },
  { h: 57, fav: 'unread', def: 'held', note: ['a source failed: still due', 'up', 'start'] },
  { h: 62, fav: 'scan', def: 'held' },
  { h: 105, fav: 'scan', def: 'held' },
  { h: 177, fav: 'scan', def: 'scan', note: ['seven days on: both due', 'up', 'end'] },
];
const tiers = [
  { key: 'fav' as const, name: 'favorites', cadence: 24, label: 'cadence 1 day' },
  { key: 'def' as const, name: 'default', cadence: 168, label: 'cadence 7 days' },
];

interface Geo {
  W: number;
  H: number;
  x0: number;
  x1: number;
  src: { y: number; h: number };
  lane: (i: number) => number;
  laneLabel: (i: number) => [number, number];
  axis: number;
  held: { y: number; h: number };
  notes: boolean;
  caps: (n: number) => [number, number];
}

const wide: Geo = {
  W: 720,
  H: 352,
  x0: 150,
  x1: 696,
  src: { y: 30, h: 30 },
  lane: (i) => 112 + i * 64,
  laneLabel: (i) => [20, 112 + i * 64],
  axis: 232,
  held: { y: 262, h: 30 },
  notes: true,
  caps: (n) => [20 + n * 236, 326],
};

const tall: Geo = {
  W: 360,
  H: 420,
  x0: 20,
  x1: 344,
  src: { y: 30, h: 30 },
  lane: (i) => 120 + i * 70,
  laneLabel: (i) => [20, 120 + i * 70 - 22],
  axis: 250,
  held: { y: 278, h: 30 },
  notes: false,
  caps: (n) => [14, 340 + n * 24],
};

export function tiersSvg(layout: Layout): string {
  const g = layout === 'wide' ? wide : tall;
  const L = new Loop(T);
  const out: string[] = [];
  const add = (s: string) => out.push(s);
  const X = (h: number) => g.x0 + ((g.x1 - g.x0) * h) / HOURS;
  const P = (h: number) => SWEEP[0] + ((SWEEP[1] - SWEEP[0]) * h) / HOURS; // when the playhead reaches hour h

  // The sources above, what headwater holds below.
  add(`<rect class="srcband" x="${g.x0 - 8}" y="${g.src.y}" width="${g.x1 - g.x0 + 16}" height="${g.src.h}" rx="7"/>`);
  add(`<text class="hd" x="${g.x0}" y="${g.src.y + g.src.h / 2 + 4}">THE SOURCES</text>`);
  add(`<rect class="heldband" x="${g.x0 - 8}" y="${g.held.y}" width="${g.x1 - g.x0 + 16}" height="${g.held.h}" rx="7"/>`);
  add(`<text class="hd" x="${g.x0}" y="${g.held.y + g.held.h / 2 + 4}">WHAT HEADWATER HOLDS</text>`);

  // The days.
  for (let d = 0; d <= 8; d++) {
    const x = X(d * 24);
    add(`<line class="day" x1="${x}" y1="${g.axis - 4}" x2="${x}" y2="${g.axis + 4}"/>`);
    if (d < 8) add(`<text class="mono xxs m" x="${X(d * 24 + 12)}" y="${g.axis - 7}" text-anchor="middle">${layout === 'wide' ? 'day ' : ''}${d + 1}</text>`);
  }
  add(`<line class="axis" x1="${g.x0}" y1="${g.axis}" x2="${g.x1}" y2="${g.axis}"/>`);

  // The tiers: a lane each, and after each complete scan the span until it is due again.
  tiers.forEach((t, i) => {
    const y = g.lane(i);
    const [lx, ly] = g.laneLabel(i);
    add(`<text class="sm b" x="${lx}" y="${ly - (layout === 'wide' ? 2 : 0)}">${t.name}</text>`);
    add(`<text class="xs m" x="${layout === 'wide' ? lx : lx + 84}" y="${layout === 'wide' ? ly + 15 : ly}">${t.label}</text>`);
    add(`<line class="lane" x1="${g.x0}" y1="${y}" x2="${g.x1}" y2="${y}"/>`);
    starts.forEach((s, n) => {
      if (s[t.key] !== 'scan') return;
      const a = P(s.h);
      const z = Math.min(s.h + t.cadence, HOURS);
      const cls = `sp${i}${n}`;
      // The span grows with the playhead, so it is due when the playhead meets its end.
      const len = X(z) - X(s.h);
      L.anim(cls, [
        [0, 'transform:scaleX(0);opacity:0'],
        [a, 'transform:scaleX(0);opacity:1'],
        [P(z), 'transform:scaleX(1);opacity:1'],
        [96, 'transform:scaleX(1);opacity:1'],
        [97, 'transform:scaleX(1);opacity:0'],
        [100, 'transform:scaleX(0);opacity:0'],
      ]);
      add(`<rect class="span ${cls}" x="${X(s.h)}" y="${y - 7}" width="${len}" height="14" rx="4"/>`);
      if (s.h + t.cadence <= HOURS) {
        L.show(`du${i}${n}`, P(z), 96);
        add(`<g class="du${i}${n}"><line class="dueline" x1="${X(z)}" y1="${y - 11}" x2="${X(z)}" y2="${y + 11}"/>`);
        add(`<text class="mono xxs acc" x="${X(z)}" y="${y + 23}" text-anchor="middle">due</text></g>`);
      }
    });
  });

  // Each start: a mark on the axis, and what each tier did with it.
  starts.forEach((s, n) => {
    const x = X(s.h);
    const a = P(s.h);
    L.show(`st${n}`, a, 96);
    add(`<g class="st${n}"><path class="startmark" d="M${x - 5},${g.axis + 10} L${x},${g.axis + 1} L${x + 5},${g.axis + 10} Z"/>`);
    add('</g>');
    // A pulse up to the sources when any tier scans, else down to what is held.
    const reached = s.fav !== 'held' || s.def !== 'held';
    const topTier = s.fav !== 'held' ? 0 : 1;
    L.anim(`pu${n}`, [
      [0, 'opacity:0'],
      [a - 0.3, 'opacity:0'],
      [a, 'opacity:1'],
      [a + 5, 'opacity:1'],
      [a + 7, 'opacity:0.22'],
      [96, 'opacity:0.22'],
      [97, 'opacity:0'],
      [100, 'opacity:0'],
    ]);
    if (reached) {
      add(`<line class="ask pu${n}" x1="${x}" y1="${g.lane(topTier) - 9}" x2="${x}" y2="${g.src.y + g.src.h}"/>`);
      L.show(`hit${n}`, a, a + 5);
      add(`<circle class="hit hit${n}" cx="${x}" cy="${g.src.y + g.src.h / 2}" r="7"/>`);
    }
    add(`<line class="read pu${n}" x1="${x}" y1="${g.axis + 1}" x2="${x}" y2="${g.held.y}"/>`);
    tiers.forEach((t, i) => {
      const y = g.lane(i);
      const act = s[t.key];
      const cls = `tm${i}${n}`;
      L.show(cls, a, 96);
      if (act === 'scan') add(`<circle class="scan ${cls}" cx="${x}" cy="${y}" r="5.5"/>`);
      else if (act === 'unread') add(`<g class="${cls}"><circle class="unread" cx="${x}" cy="${y}" r="5.5"/><path class="unreadx" d="M${x - 2.6},${y - 2.6} L${x + 2.6},${y + 2.6} M${x + 2.6},${y - 2.6} L${x - 2.6},${y + 2.6}"/></g>`);
      else add(`<circle class="heldmark ${cls}" cx="${x}" cy="${y}" r="4"/>`);
    });
    if (g.notes && s.note) {
      const [note, where, anchor] = s.note;
      L.show(`nt${n}`, a, 96);
      const ny = where === 'up' ? g.src.y + g.src.h + 14 : g.held.y - 8;
      add(`<text class="xs t nt${n}" x="${x + (anchor === 'end' ? 8 : -8)}" y="${ny}" text-anchor="${anchor}">${esc(note)}</text>`);
    }
  });

  // The playhead: now.
  L.path('now', [[0, 0, 0, 0], [SWEEP[0] - 0.5, 0, 0, 0], [SWEEP[0], 0, 0, 1], [SWEEP[1], g.x1 - g.x0, 0, 1], [96, g.x1 - g.x0, 0, 1], [97, g.x1 - g.x0, 0, 0], [100, 0, 0, 0]]);
  L.rule('.now{animation-timing-function:linear!important}');
  add(`<g class="now"><line class="nowline" x1="${g.x0}" y1="${g.src.y + g.src.h + 2}" x2="${g.x0}" y2="${g.held.y - 2}"/></g>`);

  // The legend.
  const legend: Array<[string, string]> = [
    ['scan', 'scanned, sources reached'],
    ['heldmark', 'not due: answered from what is held'],
    ['unread', 'unread: a source did not answer'],
  ];
  legend.forEach(([kind, label], n) => {
    const [x, y] = g.caps(n);
    if (kind === 'scan') add(`<circle class="scan" cx="${x + 6}" cy="${y - 4}" r="5.5"/>`);
    else if (kind === 'heldmark') add(`<circle class="heldmark" cx="${x + 6}" cy="${y - 4}" r="4"/>`);
    else add(`<circle class="unread" cx="${x + 6}" cy="${y - 4}" r="5.5"/><path class="unreadx" d="M${x + 3.4},${y - 6.6} L${x + 8.6},${y - 1.4} M${x + 8.6},${y - 6.6} L${x + 3.4},${y - 1.4}"/>`);
    add(`<text class="xs t" x="${x + 18}" y="${y}">${esc(label)}</text>`);
  });

  const style = L.style(
    BASE +
      `.srcband{fill:var(--d-accent-soft)} .heldband{fill:var(--d-soft)}
.axis{stroke:var(--d-muted);stroke-width:1.5} .day{stroke:var(--d-muted);stroke-width:1.2}
.lane{stroke:var(--d-rule);stroke-width:2}
.span{fill:var(--d-accent-soft);transform-box:fill-box;transform-origin:left center}
.dueline{stroke:var(--d-accent);stroke-width:2}
.startmark{fill:var(--d-fg)}
.ask{stroke:var(--d-accent);stroke-width:2}
.read{stroke:var(--d-muted);stroke-width:1.5;stroke-dasharray:2 3}
.hit{fill:var(--d-accent)}
.scan{fill:var(--d-accent)}
.heldmark{fill:var(--d-panel);stroke:var(--d-muted);stroke-width:1.5}
.unread{fill:var(--d-panel);stroke:var(--d-bad);stroke-width:2} .unreadx{stroke:var(--d-bad);stroke-width:1.6;stroke-linecap:round}
.nowline{stroke:var(--d-fg);stroke-width:1.5;opacity:.55}
`,
    STILL,
    '.now{opacity:0!important}',
  );
  const title = 'Tiers and cadence: a scan reaches the sources only of tiers that are due';
  const desc =
    'Over eight days a repository’s sessions start seven times. The favorites tier has a cadence of one day and the default tier of seven. At the first start both tiers are due and both scans reach the sources. Six hours later nothing is due, and the answer comes from what headwater holds, reaching no source. Each day the favorites tier falls due again and is scanned; on day three a source does not answer, the scan is incomplete, the favorites stay due, and the next start scans them again. On day eight the default tier is due again and both are scanned.';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" class="root" role="img" aria-labelledby="ttl dsc">` +
    `<title id="ttl">${esc(title)}</title><desc id="dsc">${esc(desc)}</desc><style>${style}</style>` +
    `<rect class="bg" width="${g.W}" height="${g.H}" rx="10"/>` +
    out.join('') +
    '</svg>';
  return scope(svg, `ht${layout[0]}`);
}
