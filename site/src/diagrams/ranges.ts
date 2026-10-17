// How it works: inside the range or outside it. react is declared ^18.3.0 and
// pinned at 18.3.1. A release inside the range moves only the lockfile, and
// the brief names `npm update react`; a release outside it moves the
// manifest, as a major release needs, and the brief names
// `npm install react@19.2.1`. headwater reports both, so a major release is
// never hidden, and runs neither command.
import { BASE, Loop, esc, scope } from './loop';
import type { Layout } from './hero';

const T = 14;
const STILL = 0.9 * T;

const versions = ['18.2.0', '18.3.1', '18.3.2', '19.0.0', '19.1.0', '19.2.1'];
const PIN = 1;
const OUTSIDE = 3; // the first release past the range

type Card = { x: number; y: number; w: number; h: number };
interface Geo {
  W: number;
  H: number;
  file: [number, number];
  decl: [number, number];
  pin: [number, number];
  lock: [number, number];
  track: { x1: number; x2: number; y: number; tick: (k: number) => number };
  verFont: number;
  range: { x1: number; x2: number; label: string };
  inside: Card;
  outside: Card;
  toInside: string;
  toOutside: string;
  foot: string[];
  footY: number;
}

const wide: Geo = {
  W: 720,
  H: 332,
  file: [20, 34],
  decl: [112, 34],
  pin: [700, 34],
  lock: [700, 50],
  track: { x1: 40, x2: 694, y: 126, tick: (k) => 70 + k * 114 },
  verFont: 10,
  range: { x1: 154, x2: 355, label: '^18.3.0 takes >=18.3.0 <19.0.0' },
  inside: { x: 40, y: 182, w: 300, h: 88 },
  outside: { x: 370, y: 182, w: 324, h: 88 },
  toInside: 'M298,156 V182',
  toOutside: 'M640,156 V182',
  foot: ['headwater reports both, so a major release is never hidden.', 'Whoever makes the change runs the command; headwater never does.'],
  footY: 300,
};

const tall: Geo = {
  W: 362,
  H: 446,
  file: [14, 28],
  decl: [14, 46],
  pin: [348, 28],
  lock: [348, 46],
  track: { x1: 16, x2: 346, y: 128, tick: (k) => 36 + k * 58 },
  verFont: 9,
  range: { x1: 70, x2: 181, label: '^18.3.0 takes <19.0.0' },
  inside: { x: 12, y: 178, w: 296, h: 84 },
  outside: { x: 12, y: 276, w: 338, h: 84 },
  toInside: 'M152,156 V178',
  toOutside: 'M326,156 V276',
  foot: ['headwater reports both, so a major release is never', 'hidden. Whoever makes the change runs the command;', 'headwater never does.'],
  footY: 390,
};

export function rangesSvg(layout: Layout): string {
  const g = layout === 'wide' ? wide : tall;
  const L = new Loop(T);
  const out: string[] = [];
  const add = (s: string) => out.push(s);
  const tr = g.track;
  const draw = (cls: string, d: string, n: number, a: number, b: number) => {
    L.anim(cls, [
      [0, `stroke-dashoffset:${n};opacity:0`],
      [a, `stroke-dashoffset:${n};opacity:1`],
      [b, 'stroke-dashoffset:0;opacity:1'],
      [96, 'stroke-dashoffset:0;opacity:1'],
      [97, 'stroke-dashoffset:0;opacity:0'],
      [100, `stroke-dashoffset:${n};opacity:0`],
    ]);
    add(`<path class="${cls}" d="${d}" stroke-dasharray="${n}"/>`);
  };

  // The declaration, and the pin its lockfile resolves.
  add(`<text class="mono xs m" x="${g.file[0]}" y="${g.file[1]}">package.json</text>`);
  add(`<text class="mono sm t" x="${g.decl[0]}" y="${g.decl[1]}">"react": "^18.3.0"</text>`);
  add(`<text class="mono sm" x="${g.pin[0]}" y="${g.pin[1]}" text-anchor="end"><tspan class="m">pin </tspan><tspan class="b">${versions[PIN]}</tspan></text>`);
  add(`<text class="mono xxs m" x="${g.lock[0]}" y="${g.lock[1]}" text-anchor="end">package-lock.json</text>`);

  // The releases in version order, and what is newer than the pin.
  const len = tr.x2 - tr.x1;
  const px = tr.tick(PIN);
  L.show('newer', 24, 96);
  add(`<rect class="newer newerr" x="${px + 10}" y="${tr.y - 13}" width="${tr.x2 - px - 6}" height="26" rx="6"/>`);
  draw('track', `M${tr.x1},${tr.y} H${tr.x2}`, len, 0.5, 5);
  versions.forEach((v, k) => {
    const x = tr.tick(k);
    L.show(`tk${k}`, 2 + k * 0.8, 96);
    let mark = `<circle class="tick" cx="${x}" cy="${tr.y}" r="5.5"/>`;
    if (k > PIN && k < OUTSIDE) {
      L.hold(`in${k}`, 'fill', [[0, 'var(--d-faint)'], [26, 'var(--d-accent)'], [97, 'var(--d-faint)']]);
      mark = `<circle class="tick in${k}" cx="${x}" cy="${tr.y}" r="5.5"/>`;
    } else if (k >= OUTSIDE) {
      L.hold(`out${k}`, 'stroke', [[0, 'var(--d-faint)'], [28 + (k - OUTSIDE) * 0.8, 'var(--d-accent)'], [97, 'var(--d-faint)']]);
      mark = `<circle class="tickout out${k}" cx="${x}" cy="${tr.y}" r="5.5"/>`;
    }
    add(`<g class="tk${k}">${mark}<text class="mono m" style="font-size:${g.verFont}px" x="${x}" y="${tr.y + 22}" text-anchor="middle">${v}</text></g>`);
  });
  L.show('pin', 6, 96);
  add(`<g class="pin"><line class="pinline" x1="${px}" y1="${tr.y - 12}" x2="${px}" y2="${tr.y + 9}"/><circle class="pinring" cx="${px}" cy="${tr.y}" r="9"/>`);
  add(`<text class="mono xxs t b" x="${px}" y="${tr.y + 36}" text-anchor="middle">pin</text></g>`);

  // The range the declaration gives: a bracket over the line, ending where
  // the next major begins.
  const r = g.range;
  const by = tr.y - 30;
  draw('bracket', `M${r.x1},${by + 8} V${by} H${r.x2} V${tr.y + 14}`, r.x2 - r.x1 + 8 + 44, 12, 19);
  L.show('rangel', 16, 96);
  add(`<text class="mono xs acc rangel" x="${(r.x1 + r.x2) / 2}" y="${by - 8}" text-anchor="middle">${esc(r.label)}</text>`);
  L.show('beyond', 30, 96);
  add(`<text class="xxs m beyond" x="${r.x2 + 10}" y="${by + 4}">past the range</text>`);

  // The two moves, and the ecosystem's own command for each, as a brief names it.
  const card = (c: Card, cls: string, head: string, line: string, cmd: string, at: number) => {
    L.show(cls, at, 96);
    L.show(`${cls}cmd`, at + 5, 96);
    const cmdW = cmd.length * 7.2 + 20;
    add(`<g class="${cls}"><rect class="card ${cls === 'outc' ? 'cardout' : ''}" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="8"/>`);
    add(`<text class="hd" x="${c.x + 14}" y="${c.y + 21}">${head}</text>`);
    add(`<text class="sm t" x="${c.x + 14}" y="${c.y + 42}">${esc(line)}</text>`);
    add(`<g class="${cls}cmd"><rect class="cmd" x="${c.x + 14}" y="${c.y + c.h - 32}" width="${cmdW}" height="22" rx="5"/>`);
    add(`<text class="mono xs cmdt" x="${c.x + 24}" y="${c.y + c.h - 16.5}">${esc(cmd)}</text></g></g>`);
  };
  draw('toin', g.toInside, 40, 36, 40);
  card(g.inside, 'inc', 'INSIDE THE RANGE', `${versions[2]}: only the lockfile changes`, 'npm update react', 40);
  draw('toout', g.toOutside, 130, 54, 58);
  card(g.outside, 'outc', 'OUTSIDE THE RANGE', layout === 'wide' ? `${versions[5]}: the manifest changes, as a major needs` : `${versions[5]}: the manifest changes`, `npm install react@${versions[5]}`, 58);

  // What holds either way.
  L.show('foot', 72, 96, 0.35);
  add(`<g class="foot">${g.foot.map((l, i) => `<text class="${layout === 'wide' ? 'sm' : 'xs'} t" x="${layout === 'wide' ? 20 : 14}" y="${g.footY + i * 16}">${esc(l)}</text>`).join('')}</g>`);

  const style = L.style(
    BASE +
      `.track{fill:none;stroke:var(--d-rule);stroke-width:2;stroke-linecap:round}
.tick{fill:var(--d-faint)}
.tickout{fill:var(--d-bg);stroke:var(--d-faint);stroke-width:2.2}
.newer{fill:var(--d-accent-soft)}
.pinline{stroke:var(--d-fg);stroke-width:2.5;stroke-linecap:round}
.pinring{fill:none;stroke:var(--d-fg);stroke-width:2.5}
.bracket{fill:none;stroke:var(--d-accent);stroke-width:1.6}
.toin,.toout{fill:none;stroke:var(--d-accent);stroke-width:1.6}
.cardout{stroke:var(--d-accent);stroke-dasharray:5 3}
.cmd{fill:var(--d-soft)} .cmdt{fill:var(--d-fg)}
`,
    STILL,
    '.foot{animation:none!important;opacity:1!important}',
  );
  const title = 'Inside the range or outside it: both are reported';
  const desc =
    'package.json declares react ^18.3.0, which takes 18.3.0 and later releases below 19.0.0, and the lockfile pins 18.3.1. The releases in version order are 18.2.0, 18.3.1, 18.3.2, 19.0.0, 19.1.0 and 19.2.1. 18.3.2 is newer and inside the range: only the lockfile changes, and the brief names npm update react. 19.0.0, 19.1.0 and 19.2.1 are newer and outside it: the manifest changes, as a major release needs, and the brief names npm install react@19.2.1. headwater reports both, so a major release is never hidden, and whoever makes the change runs the command; headwater never does.';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" class="root" role="img" aria-labelledby="ttl dsc">` +
    `<title id="ttl">${esc(title)}</title><desc id="dsc">${esc(desc)}</desc><style>${style}</style>` +
    `<rect class="bg" width="${g.W}" height="${g.H}" rx="10"/>` +
    out.join('') +
    '</svg>';
  return scope(svg, `hr${layout[0]}`);
}
