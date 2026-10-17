// Screenshots of the built site, to judge it by eye: every page at 1280 and
// 390 pixels wide in both themes, the reduced-motion still of each diagram,
// and frames of each diagram's loop. Run from site/ after `bun run build`,
// inside the devenv shell, whose PLAYWRIGHT_BROWSERS_PATH holds Chromium:
//
//   devenv shell -- bun run shots <out-dir> [page ...]
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');
const base = '/headwater';
const [out = resolve(here, '../shots'), ...only] = process.argv.slice(2);
const pages = { start: '/', 'how-it-works': '/how-it-works/', 'how-it-fits': '/how-it-fits/', design: '/design/', roadmap: '/roadmap/' };
const widths = [1280, 390];
const themes = ['dark', 'light'];
// Points in each diagram's loop, as fractions of it.
const frames = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' };
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(base)) return res.writeHead(404).end();
  let file = join(dist, path.slice(base.length));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const origin = `http://127.0.0.1:${server.address().port}${base}`;

mkdirSync(join(out, 'frames'), { recursive: true });
// The full Chromium, which is the one the devenv shell's Nix store holds.
const browser = await chromium.launch({ channel: 'chromium' });
try {
  for (const [name, path] of Object.entries(pages)) {
    if (only.length && !only.includes(name)) continue;
    for (const theme of themes) {
      for (const width of widths) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, deviceScaleFactor: 2 });
        const page = await ctx.newPage();
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        // The page as a reader first sees it, each diagram at its still frame.
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForTimeout(200);
        await page.screenshot({ path: join(out, `${name}-${width}-${theme}.png`), fullPage: true });
        const figs = await page.locator('figure.hw-figure, figure.hw-canvas').all();
        for (const [n, fig] of figs.entries()) {
          if (await fig.isVisible()) await fig.screenshot({ path: join(out, 'frames', `${name}-${n}-${width}-${theme}-still.png`) });
        }
        // Frames of each diagram's loop, wide on the wide page and tall on the phone.
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        for (const [n, fig] of figs.entries()) {
          if (!(await fig.isVisible())) continue;
          for (const f of frames) {
            await fig.evaluate((el, f) => {
              for (const a of el.getAnimations({ subtree: true })) {
                const d = a.effect.getTiming().duration;
                a.pause();
                a.currentTime = f * d;
              }
              el.dispatchEvent(new CustomEvent('hw:frame', { detail: f }));
            }, f);
            await page.waitForTimeout(60);
            await fig.screenshot({ path: join(out, 'frames', `${name}-${n}-${width}-${theme}-${String(Math.round(f * 100)).padStart(2, '0')}.png`) });
          }
        }
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`shots in ${out}`);
