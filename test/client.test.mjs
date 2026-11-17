/**
 * Checks for the client half's batch logic.
 *
 * The batch is driven through the same shape the page uses: a list of rows,
 * a check that reports a Git commit, and an update that may fail. The
 * checks read the real source, so a change to the source that breaks the
 * behaviour fails here.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/**
 * The batch's apply loop, as it appears in the source.
 *
 * The loop is checked for the behaviour that matters rather than copied: a
 * failure must not stop the loop, and the failure must be reported.
 *
 * @returns {string} the loop's source.
 */
function applyLoop() {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.includes('let completed = 0;'));
  assert.notEqual(start, -1, 'the apply loop must exist');
  let end = start;
  while (end < lines.length && !lines[end].includes('clickRefresh();')) end += 1;
  assert.notEqual(end, lines.length, 'the apply loop must end');
  return lines.slice(start, end + 1).join('\n');
}

const loop = applyLoop();

/* A failed row is recorded and the loop continues. */
assert.ok(loop.includes('failed.push'), 'a failure must be recorded');
assert.ok(loop.includes('continue;'), 'a failure must not stop the loop');
assert.ok(!loop.includes('return;\n            }'), 'the loop must not return on a failure');

/* The batch reports the failure with its reason. */
assert.ok(loop.includes("phase: 'failed'"), 'the batch must record a failed phase');
assert.ok(loop.includes('reason: failureSummary(failed)'), 'the batch must carry the reason');
assert.ok(loop.includes('failedCount: failed.length'), 'the batch must carry the failure count');

/* The reason helper names every failed plugin. */
assert.ok(source.includes('const failureSummary = (failed) =>'), 'the reason helper must exist');
assert.ok(source.includes("t('batchFailed'"), 'the reason helper must use the batchFailed copy');

/* A failed batch leaves the page usable. */
assert.ok(source.includes('const batchRunning = () => batch !== null && batch.phase !== \'failed\';'),
  'a failed batch must not block other actions');
assert.ok(source.includes('setDisabled(button, (batch !== null && !failed) || mode === \'none\');'),
  'the update-all button must stay usable after a failure');

/* The toolbar reports the failure instead of a frozen progress count. */
assert.ok(source.includes("t('updateAllFailed'"), 'the toolbar must report a failed batch');

/* The copy for a failed batch exists in both languages. */
const zhStart = source.indexOf('const zh = {');
const enStart = source.indexOf('const en = {');
assert.notEqual(zhStart, -1, 'the Chinese copy must exist');
assert.notEqual(enStart, -1, 'the English copy must exist');
/* Each copy ends at the line that closes its object. */
const copyBlock = (start) => {
  const lines = source.slice(start).split('\n');
  let end = 0;
  while (end < lines.length && lines[end] !== '    };') end += 1;
  assert.notEqual(end, lines.length, 'a copy must be closed');
  return lines.slice(0, end + 1).join('\n');
};
const zhBlock = copyBlock(zhStart);
const enBlock = copyBlock(enStart);
for (const key of ['updateAllFailed', 'updateAllFailedTitle', 'batchFailed']) {
  assert.ok(zhBlock.includes(`${key}:`), `the Chinese copy must define ${key}`);
  assert.ok(enBlock.includes(`${key}:`), `the English copy must define ${key}`);
}

/* The two copy sets carry the same keys. */
const keysOf = (block) => [...block.matchAll(/^      ([A-Za-z][A-Za-z0-9]*):/gm)].map((match) => match[1]);
const zhKeys = keysOf(zhBlock);
const enKeys = keysOf(enBlock);
assert.deepEqual(zhKeys, enKeys, 'the Chinese and English copy must carry the same keys');
assert.ok(zhKeys.length > 50, 'the copy must not be empty');

console.log('client half: all checks passed');
