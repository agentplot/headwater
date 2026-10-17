// The diagrams' animation: one loop of T seconds in CSS keyframes, the way
// sluice's docs/diagrams/sluice.py draws its own, so a diagram moves with no
// script and a reader who asks for less motion gets one still frame of it.
// Times are percents of the loop. A diagram writes plain class names and
// keyframe names starting k-; scope() prefixes both, so two diagrams on one
// page never meet.

export type Frame = [number, string];

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

export class Loop {
  readonly css: string[] = [];

  constructor(
    readonly T: number,
    readonly E = 0.8,
  ) {}

  /** Keyframes named k-<name>. */
  kf(name: string, frames: Frame[]): string {
    const body = frames.map(([p, v]) => `${fmt(p)}%{${v}}`).join('');
    this.css.push(`@keyframes k-${name}{${body}}`);
    return `k-${name}`;
  }

  /** The class <cls> runs keyframes k-<cls>. */
  anim(cls: string, frames: Frame[], timing = 'linear'): string {
    this.kf(cls, frames);
    this.css.push(`.${cls}{animation:k-${cls} ${this.T}s ${timing} infinite}`);
    return cls;
  }

  /** Opacity hi inside [a, b] and lo outside, fading over E. */
  show(cls: string, a: number, b: number, lo = 0, hi = 1): string {
    const E = this.E;
    const fr: Frame[] =
      a <= 0
        ? [[0, `opacity:${hi}`], [b, `opacity:${hi}`], [b + E, `opacity:${lo}`], [100, `opacity:${lo}`]]
        : [[0, `opacity:${lo}`], [a - E, `opacity:${lo}`], [a, `opacity:${hi}`], [b, `opacity:${hi}`], [Math.min(b + E, 100), `opacity:${lo}`]];
    if (fr[fr.length - 1][0] < 100) fr.push([100, `opacity:${lo}`]);
    return this.anim(cls, fr);
  }

  /**
   * One property held at each value from its percent until the next, changing
   * over E: points are [percent, value], the first at 0.
   */
  hold(cls: string, prop: string, points: Array<[number, string]>, timing = 'ease-in-out'): string {
    const fr: Frame[] = [];
    points.forEach(([p, v], i) => {
      fr.push([p, `${prop}:${v}`]);
      const next = points[i + 1];
      const end = next ? next[0] - this.E : 100;
      if (end > p) fr.push([end, `${prop}:${v}`]);
    });
    return this.anim(cls, fr, timing);
  }

  /** Waypoints [percent, x, y] of a translate, eased between each pair. */
  path(cls: string, points: Array<[number, number, number, number?]>): string {
    return this.anim(
      cls,
      points.map(([p, x, y, o]) => [p, `transform:translate(${fmt(x)}px,${fmt(y)}px)${o === undefined ? '' : `;opacity:${o}`}`]),
      'ease-in-out',
    );
  }

  rule(css: string) {
    this.css.push(css);
  }

  /**
   * The style of the whole drawing. The reader who asks for less motion gets
   * the frame at `still` seconds, every caption shown.
   */
  style(base: string, still: number, stillExtra = ''): string {
    return (
      base +
      this.css.join('') +
      `@media (prefers-reduced-motion:reduce){.root *{animation-play-state:paused!important;animation-delay:-${fmt(still)}s!important}${stillExtra}}`
    );
  }
}

/** Every class, keyframe and id of one drawing, prefixed with `p`. */
export function scope(svg: string, p: string): string {
  svg = svg.replace(/<style>([\s\S]*?)<\/style>/, (_, css: string) => {
    const st = css
      .replace(/\.(?=[a-zA-Z])/g, `.${p}-`)
      .replace(/\bk-/g, `${p}-k-`);
    return `<style>${st}</style>`;
  });
  svg = svg.replace(/class="([^"]*)"/g, (_, c: string) => `class="${c.split(/\s+/).filter(Boolean).map((x) => `${p}-${x}`).join(' ')}"`);
  svg = svg.replace(/\bid="([^"]+)"/g, `id="${p}-$1"`);
  svg = svg.replace(/aria-labelledby="([^"]+)"/g, (_, ids: string) => `aria-labelledby="${ids.split(' ').map((i) => `${p}-${i}`).join(' ')}"`);
  svg = svg.replace(/url\(#([^)]+)\)/g, `url(#${p}-$1)`);
  svg = svg.replace(/href="#([^"]+)"/g, `href="#${p}-$1"`);
  return svg;
}

/** The text and shape styles every diagram shares, over the tokens in diagrams.css. */
export const BASE = `
text{font-family:var(--sl-font);fill:var(--d-fg)}
.mono{font-family:var(--sl-font-mono)}
.bg{fill:var(--d-bg)} .t{fill:var(--d-fg)} .m{fill:var(--d-muted)} .f{fill:var(--d-faint)}
.acc{fill:var(--d-accent)} .ok{fill:var(--d-ok)} .bad{fill:var(--d-bad)}
.b{font-weight:600} .hd{font-size:11px;letter-spacing:.08em;fill:var(--d-muted);font-weight:600}
.lg{font-size:15px} .sm{font-size:13px} .xs{font-size:11.5px} .xxs{font-size:10px}
.card{fill:var(--d-panel);stroke:var(--d-rule);stroke-width:1.5}
.band{fill:var(--d-soft)}
.badge{fill:var(--d-accent)} .badget{fill:var(--d-on-accent);font-size:12px;font-weight:700}
`;

/** An escaped string for SVG text. */
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
