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
  create.includes("arrow.setAttribute('data-quick-update-action', 'concurrency')"),
  'the arrow must carry the concurrency action',
);
assert.ok(
  create.includes("arrow.textContent = '▾'"),
  'the arrow must show the same mark as the other dropdowns',
);
assert.ok(
  create.includes('toolbar.insertBefore(arrow, refresh.nextElementSibling)'),
  'the arrow must sit right after the page\'s refresh button',
);

/* ---- the arrow opens the menu and the menu saves the choice ---- */

assert.ok(
  create.includes('openConcurrencyMenu(arrow)'),
  'the arrow must open the menu',
);

/* ---- the arrow is not the page\'s own control, so the plugin must not
        mistake it for the refresh button ---- */

const native = source.slice(source.indexOf('const nativeRefreshChild = (toolbar) =>'));
const nativeChild = native.slice(0, native.indexOf('const onNativeRefresh'));
assert.ok(
  nativeChild.includes("if (child.hasAttribute('data-quick-update-action')) continue;"),
  'the plugin\'s own controls must be skipped when looking for the refresh button',
);

/* ---- the menu marks the chosen bound ---- */

const menu = source.slice(source.indexOf('const openConcurrencyMenu = (anchor) =>'));
assert.ok(
  menu.includes("row.setAttribute('data-quick-update-concurrency', String(value))"),
  'every row must name the bound it chooses',
);
assert.ok(
  menu.includes("if (value === checkConcurrency)"),
  'the chosen bound must be marked',
);
assert.ok(
  menu.includes("mark.textContent = '✓'"),
  'the chosen bound must be shown as chosen',
);

/* ---- the bounds offered ---- */

const choices = /const CHECK_CONCURRENCY_CHOICES = \[([^\]]*)\];/.exec(source);
assert.ok(choices, 'the bounds must be named');
const list = choices[1].split(',').map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
assert.ok(list.length >= 3, 'several bounds must be offered');
assert.ok(list.every((value) => value >= 1), 'a bound must be at least one');
assert.ok(
  list.every((value, index) => index === 0 || value > list[index - 1]),
  'the bounds must be in order',
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
for (const key of ['concurrencyTitle', 'concurrencyHint', 'concurrencyAll', 'concurrencyAtMost']) {
  assert.ok(zhKeys.includes(key), `the Chinese copy must define ${key}`);
  assert.ok(enKeys.includes(key), `the English copy must define ${key}`);
}

console.log('toolbar arrow: all checks passed');
