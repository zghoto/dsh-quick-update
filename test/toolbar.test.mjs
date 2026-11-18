/**
 * Checks the arrow next to the page's refresh button.
 *
 * The page's own markup is a small stand-in: a toolbar holding the refresh
 * button, exactly the shape the plugin looks for. The plugin's own painting
 * is run against it, and the result is read back.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/* ---- the arrow is placed right after the refresh button ---- */

const toolbar = source.slice(source.indexOf('const paintToolbar = (toolbar) =>'));
const create = toolbar.slice(0, toolbar.indexOf('let button = toolbar.querySelector'));

assert.ok(
  create.includes("input.setAttribute('data-quick-update-action', 'concurrency')"),
  'the input must carry the concurrency action',
);
assert.ok(
  create.includes("input.type = 'number'"),
  'the control must be a number input',
);
assert.ok(
  create.includes("input.min = '0'"),
  'the input must refuse anything below zero',
);
assert.ok(
  create.includes("readConcurrencyInput(input)"),
  'the input must be read as a count',
);
assert.ok(
  create.includes('toolbar.append(holder)'),
  'the input must stand on its own',
);
assert.ok(
  !create.includes('qu-arrow'),
  'the control must not be an arrow joined to the refresh button',
);

/* ---- the count that the input holds ---- */

const reader = source.slice(source.indexOf('const readConcurrencyInput = (input) =>'));
const readerBody = reader.slice(0, reader.indexOf('\n        };'));
assert.ok(
  readerBody.includes('value < 0'),
  'a negative count must be refused',
);
assert.ok(
  readerBody.includes('Math.floor(value)'),
  'a count must be a whole number',
);
assert.ok(
  readerBody.includes("raw === ''"),
  'an empty input must mean no limit',
);

/* ---- the copy exists in both languages ---- */

const keysOf = (name) => {
  const start = source.indexOf(`const ${name} = {`);
  const end = source.indexOf('\n    };', start);
  return [...source.slice(start, end).matchAll(/^      ([A-Za-z][A-Za-z0-9]*):/gm)].map((match) => match[1]);
};
const zhKeys = keysOf('zh');
const enKeys = keysOf('en');
assert.deepEqual(zhKeys, enKeys, 'the Chinese and English copy must carry the same keys');
for (const key of ['concurrencyButton', 'concurrencyTitle', 'concurrencyHint', 'concurrencyAll', 'concurrencyAtMost']) {
  assert.ok(zhKeys.includes(key), `the Chinese copy must define ${key}`);
  assert.ok(enKeys.includes(key), `the English copy must define ${key}`);
}

console.log('toolbar arrow: all checks passed');
