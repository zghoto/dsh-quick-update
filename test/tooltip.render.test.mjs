/**
 * Renders the mark's bubble in a real browser and reads it back.
 *
 * The page is hovered, so the bubble the mark shows is built by the plugin's
 * own code, and the markup is read back.
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter((path) => existsSync(path));

if (BROWSERS.length === 0) {
  console.log('tooltip render: no browser on this machine; skipped');
  process.exit(0);
}

const browser = BROWSERS[0];

/** A port nothing is listening on. */
async function freePort() {
  const { createServer } = await import('node:net');
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => { resolve(port); });
    });
  });
}

const port = await freePort();
const server = spawn(
  process.platform === 'win32' ? 'python' : 'python3',
  ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
  { cwd: root, stdio: 'ignore', windowsHide: true },
);

try {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/test/tooltip.html`);
      if (response.ok) break;
    } catch (_error) {
      /* not up yet */
    }
    await new Promise((resolve) => { setTimeout(resolve, 250); });
  }

  const output = execFileSync(browser, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=6000',
    '--dump-dom',
    `http://127.0.0.1:${port}/test/tooltip.html`,
  ], { encoding: 'utf8', timeout: 90000, windowsHide: true });

  /* The bubble must be on the document body, the way the page's own is. */
  const bubble = /<span[^>]*class="qu-bubble"[^>]*>([\s\S]*?)<\/span>/.exec(output);
  assert.ok(bubble, 'the bubble must be shown when the mark is hovered');
  assert.ok(bubble[0].includes('role="tooltip"'), 'the bubble must carry the role a tooltip has');
  assert.ok(bubble[0].includes('aria-label="'), 'the bubble must carry what it says');
  assert.ok(bubble[1].includes('qu-bubble-label'), 'the bubble must hold its text in a label');

  /* The bubble must sit on the body, not inside the toolbar. */
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(output);
  assert.ok(body, 'the body must be there');
  assert.ok(
    body[1].indexOf('qu-bubble') > body[1].indexOf('</header>'),
    'the bubble must sit on the body, after the toolbar',
  );

  /* The mark must be there too. */
  const mark = /<span[^>]*qu-concurrency-mark[^>]*>([\s\S]*?)<\/span>/.exec(output);
  assert.ok(mark, 'the mark must be rendered');
  assert.ok(mark[1].includes('!'), 'the mark must be an exclamation mark');

  console.log('tooltip render: all checks passed');
} finally {
  server.kill();
}
