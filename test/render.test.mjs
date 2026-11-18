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

/* The server runs in the background; the check waits for it. The port is
   picked at random, so a port another check left behind does not get in the
   way. */
const { spawn } = await import('node:child_process');

/**
 * A port nothing is listening on.
 *
 * @returns {Promise<number>} the port.
 */
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

/** Wait until the server answers. */
async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/test/render.html`);
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
    `http://127.0.0.1:${port}/test/render.html`,
  ], { encoding: 'utf8', timeout: 90000, windowsHide: true });

  /* The input must be there, and it must be a number input. */
  const input = /<input[^>]*data-quick-update-action="concurrency"[^>]*>/.exec(output);
  assert.ok(input, 'the concurrency input must be rendered');
  assert.ok(input[0].includes('type="number"'), 'the control must be a number input');
  assert.ok(input[0].includes('min="0"'), 'the input must refuse anything below zero');
  assert.ok(input[0].includes('placeholder="0"'), 'the input must show a zero as its placeholder');
  assert.ok(input[0].includes('title='), 'the input must say what it does in its title');
  /* It is empty when there is no limit. */
  assert.ok(!/value="[0-9]/.test(input[0]), 'the input must be empty when there is no limit');

  /* The mark explains the field on hover. */
  const mark = /<span[^>]*qu-concurrency-mark[^>]*>([\s\S]*?)<\/span>/.exec(output);
  assert.ok(mark, 'the mark must be rendered');
  assert.ok(mark[1].includes('!'), 'the mark must be an exclamation mark');
  assert.ok(mark[0].includes('title="'), 'the mark must explain the field on hover');

  /* The input sits right after the page's refresh button. */
  const toolbar = /<header[^>]*data-plugin-toolbar[^>]*>([\s\S]*?)<\/header>/.exec(output);
  assert.ok(toolbar, 'the toolbar must be rendered');
  /* The controls, in the order they stand in the toolbar. */
  const controls = [...toolbar[1].matchAll(/<(?:button|input)[^>]*>/g)].map((match) => match[0]);
  const inputIndex = controls.findIndex((match) => match.includes('data-quick-update-action="concurrency"'));
  assert.ok(inputIndex >= 0, 'the concurrency input must be in the toolbar');
  const refreshIndex = controls.findIndex((match) => match.includes('class="addButton"'));
  assert.ok(refreshIndex >= 0, 'the page\'s own refresh button must be there');
  assert.equal(inputIndex, refreshIndex + 1, 'the input must sit right after the refresh button');

  console.log('toolbar render: all checks passed');
} finally {
  server.kill();
}
