/**
 * Renders the plugin's toolbar in a real browser and reads the result back.
 *
 * The check is what the person's eye sees: a browser runs the plugin's own
 * painting against a stand-in for the page's toolbar, and the markup it
 * produced is read back. The browser is skipped when there is none, so the
 * check still runs on a machine without one.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/* The browsers this machine may have. */
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter((path) => existsSync(path));

if (BROWSERS.length === 0) {
  console.log('toolbar render: no browser on this machine; skipped');
  process.exit(0);
}

const browser = BROWSERS[0];

/* The page the check renders. */
const page = readFileSync(join(here, 'render.html'), 'utf8');
assert.ok(page.includes('data-quick-update-action'), 'the page must carry the toolbar');

/* The server runs in the background; the check waits for it. */
const { spawn } = await import('node:child_process');
const server = spawn(
  process.platform === 'win32' ? 'python' : 'python3',
  ['-m', 'http.server', '8973', '--bind', '127.0.0.1'],
  { cwd: root, stdio: 'ignore', windowsHide: true },
);

/** Wait until the server answers. */
async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8973/test/render.html');
      if (response.ok) return;
    } catch (_error) {
      /* not up yet */
    }
    await new Promise((resolve) => { setTimeout(resolve, 250); });
  }
  throw new Error('the server did not start');
}

try {
  await waitForServer();

  const output = execFileSync(browser, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://127.0.0.1:8973/test/render.html',
  ], { encoding: 'utf8', timeout: 90000, windowsHide: true });

  /* The arrow must be there, right after the page's own refresh button. */
  const arrow = /<button[^>]*data-quick-update-action="concurrency"[^>]*>([\s\S]*?)<\/button>/.exec(output);
  assert.ok(arrow, 'the concurrency arrow must be rendered');
  assert.ok(arrow[1].includes('▾'), 'the arrow must show the dropdown mark');
  assert.ok(arrow[0].includes('title='), 'the arrow must say what it does');

  /* It must sit right after the page's refresh button. */
  const toolbar = /<header[^>]*data-plugin-toolbar[^>]*>([\s\S]*?)<\/header>/.exec(output);
  assert.ok(toolbar, 'the toolbar must be rendered');
  const children = [...toolbar[1].matchAll(/<button[^>]*>/g)];
  const arrowIndex = children.findIndex((match) => match[0].includes('data-quick-update-action="concurrency"'));
  const refreshIndex = children.findIndex((match) => !match[0].includes('data-quick-update-action'));
  assert.ok(refreshIndex >= 0, 'the page\'s own refresh button must be there');
  assert.equal(arrowIndex, refreshIndex + 1, 'the arrow must sit right after the refresh button');

  console.log('toolbar render: all checks passed');
} finally {
  server.kill();
}
