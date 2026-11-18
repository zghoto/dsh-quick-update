/**
 * Checks that the controls appear with the page, not a moment after it.
 *
 * The check is a measurement: the wait logic is taken from the source and
 * run against a page that appears late, and the time between the page
 * appearing and the controls appearing is read back. The old behaviour
 * waited a fixed 800 ms, so a page that appears at once must no longer cost
 * that.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/* ------------------------------------------------------------------ *
 * The old behaviour: a fixed delay for a page that is not there yet.
 * ------------------------------------------------------------------ */

assert.ok(
  !source.includes('REPAINT_DELAY_ABSENT_MS'),
  'the fixed delay for a page that is not there must be gone',
);
assert.ok(
  !source.includes('pagePresent ? REPAINT_DELAY_MS : '),
  'the repaint must not wait longer when the page is absent',
);

/* ------------------------------------------------------------------ *
 * The new behaviour: the plugin waits for the page.
 * ------------------------------------------------------------------ */

assert.ok(
  source.includes('const waitForPage = () => {'),
  'the plugin must wait for the page',
);
assert.ok(
  source.includes('waitForPage();'),
  'the wait must be started when the page is not there',
);

/* The wait is short enough to be invisible. */
const poll = /const PAGE_POLL_INTERVAL_MS = (\d+);/.exec(source);
assert.ok(poll, 'the poll interval must be named');
assert.ok(Number(poll[1]) <= 100, 'the poll interval must be short');

/* The wait ends when the page is there. */
const waitStart = source.indexOf('const waitForPage = () => {');
assert.notEqual(waitStart, -1);
const waitBody = source.slice(waitStart, source.indexOf('\n        };', waitStart));
assert.ok(
  waitBody.includes("document.querySelector('[data-plugin-toolbar]')"),
  'the wait must look for the page\'s toolbar',
);
assert.ok(
  waitBody.includes('bundleRows()'),
  'the wait must look for the page\'s rows',
);
assert.ok(
  waitBody.includes('paint();'),
  'the wait must paint once the page is there',
);

/* The wait must end when the plugin is unloaded. */
assert.ok(
  source.includes('clearTimeout(pageWait);'),
  'the wait timer must be cleared',
);

/* ------------------------------------------------------------------ *
 * The measurement.
 * ------------------------------------------------------------------ */

/** The wait, as the source writes it, with the page answering. */
function buildWait(state) {
  const factory = new Function('state', `
    const PAGE_POLL_INTERVAL_MS = 50;
    let pageWait = null;
    let disposed = false;
    /* The plugin's own reading of whether it has painted the page. */
    let pagePresent = false;
    /* The page is there when the state says so. */
    const bundleRows = () => (state.pageThere ? ['row'] : []);
    const document = { querySelector: (selector) => (state.pageThere && selector.includes('toolbar') ? {} : null) };
    const paint = () => { state.painted += 1; pagePresent = true; };
    ${source.slice(waitStart, source.indexOf('\n        };', waitStart) + 14)}
    return { waitForPage };
  `);
  const built = factory(state);
  return built;
}

/**
 * How long the wait takes when the page appears after a moment.
 *
 * @param {number} pageAppearsAfter - how long the page takes to appear.
 * @returns {Promise<number>} the milliseconds until the controls appear.
 */
async function measure(pageAppearsAfter) {
  const state = { pageThere: false, painted: 0 };
  const built = buildWait(state);
  const waitForPage = built.waitForPage;

  const started = Date.now();
  waitForPage();

  await new Promise((resolve) => {
    setTimeout(() => {
      state.pageThere = true;
      resolve();
    }, pageAppearsAfter);
  });

  while (state.painted === 0) {
    await new Promise((resolve) => { setTimeout(resolve, 5); });
  }
  return Date.now() - started;
}

/* A page that is there at once must not cost the old 800 ms. */
const quick = await measure(0);
assert.ok(quick < 400, `a page that is there at once must be painted at once, took ${quick} ms`);

/* A page that appears later must be painted as soon as it is there. */
const slow = await measure(300);
assert.ok(slow < 500, `a late page must be painted as soon as it appears, took ${slow} ms`);

console.log(`delay: all checks passed (page at once: ${quick} ms, page at 300 ms: ${slow} ms)`);
