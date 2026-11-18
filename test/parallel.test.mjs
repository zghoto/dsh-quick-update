/**
 * Checks that the page's refresh checks every plugin at once, and that the
 * number of checks running at the same time is the person's choice.
 *
 * The check is a behaviour check, not a source check: the real helper is
 * taken from the source and run against a set of names whose work is slow
 * enough to tell a parallel run from a sequential one, and against each
 * bound the setting offers.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/**
 * The source of one block, from its start line to the line that closes it.
 *
 * @param {string} start - the line the block starts with.
 * @returns {string} the block's source.
 */
function extract(start) {
  const lines = source.split('\n');
  const first = lines.findIndex((line) => line.includes(start));
  assert.notEqual(first, -1, `${start} must exist`);
  let end = first;
  let depth = 0;
  let begun = false;
  for (; end < lines.length; end += 1) {
    for (const ch of lines[end]) {
      if (ch === '{') {
        depth += 1;
        begun = true;
      } else if (ch === '}') {
        depth -= 1;
      }
    }
    if (begun && depth === 0 && end > first) break;
  }
  return lines.slice(first, end + 1).join('\n');
}

/* The helper that runs the work over every name. */
const helper = extract('const inParallel = async (names, run) =>');

/* The setting that chooses the bound. */
const defaultBound = /const DEFAULT_CHECK_CONCURRENCY = (\d+);/.exec(source);
assert.ok(defaultBound, 'the default bound must be named');
assert.equal(defaultBound[1], '0', 'the default must let every row run at once');

/* The bound is the person's choice, and it is kept in this browser. */
assert.ok(
  source.includes("const CHECK_CONCURRENCY_KEY = 'dsh-quick-update.check-concurrency';"),
  'the choice must be kept under a named key',
);
assert.ok(source.includes('readCheckConcurrency'), 'the saved choice must be read');
assert.ok(source.includes('writeCheckConcurrency'), 'the chosen bound must be saved');

/* The helper is run as the real code, with the bound under the test's
   control. */
const factory = new Function(`
  let checkConcurrency = 0;
  ${helper}
  return { run: inParallel, setBound: (value) => { checkConcurrency = value; } };
`);
const { run, setBound } = factory();

/**
 * Run the helper and report what it did.
 *
 * @param {number} bound - the bound to set.
 * @param {string[]} names - the names to check.
 * @returns the peak number of checks that ran at once.
 */
async function peakOf(bound, names) {
  setBound(bound);
  let running = 0;
  let peak = 0;
  const order = [];
  await run(names, async (name) => {
    running += 1;
    peak = Math.max(peak, running);
    order.push(`start:${name}`);
    await new Promise((resolve) => { setTimeout(resolve, 20); });
    order.push(`end:${name}`);
    running -= 1;
  });
  return { peak, order };
}

const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/* ---- the default lets every row run at once ---- */

const all = await peakOf(0, names);
assert.equal(all.peak, names.length, 'the default must let every row run at once');
assert.ok(
  all.order.indexOf('end:a') > all.order.indexOf('start:c'),
  'a later name must start before the first one ends',
);

/* ---- a chosen bound is honoured ---- */

const two = await peakOf(2, names);
assert.equal(two.peak, 2, 'the chosen bound must be the peak');
assert.ok(
  two.order.indexOf('end:a') < two.order.indexOf('start:c'),
  'with a bound of two, the third name waits for the first',
);

const one = await peakOf(1, names);
assert.equal(one.peak, 1, 'a bound of one must check the rows one after another');

/* ---- a bound above the number of rows is the same as letting them all run ---- */

const many = await peakOf(100, names);
assert.equal(many.peak, names.length, 'a bound above the row count must not hold a row back');

/* ---- every name is answered, in order ---- */

setBound(0);
const answers = await run(['x', 'y'], async (name) => `${name}!`);
assert.deepEqual(answers, ['x!', 'y!'], 'every name must keep its own answer');

/* ---- an empty list is fine ---- */

assert.deepEqual(await run([], async () => 'never'), [], 'an empty list must answer nothing');

/* ---- the refresh uses the parallel helper ---- */

const refresh = extract('const onNativeRefresh = async () =>');
assert.ok(
  refresh.includes('await checkAllDirect(rowNames())'),
  'the refresh must check every row',
);

const checkAll = extract('const checkAllDirect = async (names) =>');
assert.ok(
  checkAll.includes('await inParallel(names'),
  'the check of every row must run together',
);
assert.ok(
  !/for \(const name of names\) \{\s*if \(isGitSource\(name\)\) await checkGit\(name\)/.test(checkAll),
  'the rows must not be checked one after another',
);

/* ---- the batch checks its rows together too ---- */

const batch = extract('const runBatch = async () =>');
assert.ok(
  batch.includes('await inParallel(unknown, (name) => checkDirect(name))'),
  'the batch must check the registry rows together',
);
assert.ok(
  batch.includes('await inParallel(gitUnknown, (name) => checkGit(name))'),
  'the batch must check the Git rows together',
);

/* ---- the setting is offered from the page's toolbar ---- */

const toolbar = extract('const paintToolbar = (toolbar) =>');
assert.ok(
  toolbar.includes("data-quick-update-action', 'concurrency'"),
  'the toolbar must carry the arrow that opens the setting',
);
assert.ok(
  toolbar.includes('openConcurrencyMenu(arrow)'),
  'the arrow must open the menu',
);

const menu = extract('const openConcurrencyMenu = (anchor) =>');
assert.ok(
  menu.includes('CHECK_CONCURRENCY_CHOICES'),
  'the menu must offer the bounds',
);
assert.ok(
  menu.includes('writeCheckConcurrency(value)'),
  'choosing a bound must save it',
);
assert.ok(
  menu.includes("t('concurrencyAll')"),
  'the menu must offer "all"',
);

console.log('parallel check: all checks passed');
