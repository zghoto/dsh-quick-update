/**
 * Checks that the page's refresh checks every plugin at once.
 *
 * The check is a behaviour check, not a source check: the real helper is
 * taken from the source and run against a set of names whose work is slow
 * enough to tell a parallel run from a sequential one.
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

/* The number of checks that may run at the same time. */
const concurrency = /const CHECK_CONCURRENCY = (\d+);/.exec(source);
assert.ok(concurrency, 'the concurrency limit must be named');
assert.ok(Number(concurrency[1]) >= 2, 'the concurrency limit must allow more than one');

/* The helper is run as the real code. */
const limit = /const CHECK_CONCURRENCY = (\d+);/.exec(source);
assert.ok(limit, 'the concurrency limit must be named');
const factory = new Function(`const CHECK_CONCURRENCY = ${limit[1]};\n${helper}\nreturn inParallel;`);
const inParallel = factory();

/* ---- the work runs at the same time, not one after another ---- */

const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let running = 0;
let peak = 0;
const order = [];

await inParallel(names, async (name) => {
  running += 1;
  peak = Math.max(peak, running);
  order.push(`start:${name}`);
  await new Promise((resolve) => { setTimeout(resolve, 20); });
  order.push(`end:${name}`);
  running -= 1;
});

assert.ok(peak > 1, `the checks must run together, the peak concurrency was ${peak}`);
assert.ok(peak <= Number(concurrency[1]), `the peak ${peak} must not exceed the limit ${concurrency[1]}`);
assert.equal(order[0], 'start:a', 'the first name starts first');
assert.ok(
  order.indexOf('end:a') > order.indexOf('start:c'),
  'a later name must start before the first one ends',
);

/* ---- every name is answered ---- */

const answers = await inParallel(['x', 'y'], async (name) => `${name}!`);
assert.deepEqual(answers, ['x!', 'y!'], 'every name must keep its own answer');

/* ---- an empty list is fine ---- */

assert.deepEqual(await inParallel([], async () => 'never'), [], 'an empty list must answer nothing');

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

console.log('parallel check: all checks passed');
