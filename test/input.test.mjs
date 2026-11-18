/**
 * Checks that the concurrency field reads as the person means it to.
 *
 * The field is left empty when there is no limit, and a grey zero stands in
 * for it: an empty field is the default, so the number the person types is
 * the only thing shown in the colour of text.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/* ------------------------------------------------------------------ *
 * The field is empty when there is no limit.
 * ------------------------------------------------------------------ */

const toolbar = source.slice(source.indexOf('const paintToolbar = (toolbar) =>'));
const inputBlock = toolbar.slice(0, toolbar.indexOf('let button = toolbar.querySelector'));

assert.ok(
  inputBlock.includes("const shown = checkConcurrency === 0 ? '' : String(checkConcurrency);"),
  'the field must be empty when there is no limit',
);
assert.ok(
  inputBlock.includes("input.placeholder = '0'"),
  'the field must show a zero as its placeholder',
);
assert.ok(
  inputBlock.includes("document.activeElement !== input"),
  'the number the person is typing must not be overwritten',
);

/* ------------------------------------------------------------------ *
 * The zero is grey, and the number is not.
 * ------------------------------------------------------------------ */

const styles = source.slice(source.indexOf('const STYLES = String.raw'));
assert.ok(
  styles.includes('.qu-concurrency-input::placeholder'),
  'the placeholder must have its own colour',
);
const placeholder = styles.slice(styles.indexOf('.qu-concurrency-input::placeholder'));
assert.ok(
  placeholder.includes('label-tertiary'),
  'the zero must be grey',
);

/* ------------------------------------------------------------------ *
 * The mark explains the field.
 * ------------------------------------------------------------------ */

assert.ok(
  inputBlock.includes("mark.className = 'qu-concurrency-mark'"),
  'the mark must be there',
);
assert.ok(
  inputBlock.includes("mark.textContent = '!'"),
  'the mark must be an exclamation mark',
);
assert.ok(
  inputBlock.includes("mark.setAttribute('aria-label', hint)"),
  'the mark must say what it means',
);
assert.ok(
  styles.includes('.qu-concurrency-mark'),
  'the mark must have its own look',
);

/* ------------------------------------------------------------------ *
 * The label is gone.
 * ------------------------------------------------------------------ */

assert.ok(
  !inputBlock.includes('qu-concurrency-label'),
  'the field must not carry a label',
);
assert.ok(
  !styles.includes('.qu-concurrency-label'),
  'the label must not have a style either',
);

/* ------------------------------------------------------------------ *
 * The field sits right after the page's refresh button.
 * ------------------------------------------------------------------ */

assert.ok(
  inputBlock.includes('toolbar.insertBefore(holder, refresh.nextElementSibling)'),
  'the field must sit right after the refresh button',
);

/* ------------------------------------------------------------------ *
 * The plugin's own controls are never taken for the page's refresh button.
 * ------------------------------------------------------------------ */

const native = source.slice(source.indexOf('const nativeRefreshChild = (toolbar) =>'));
const nativeBlock = native.slice(0, native.indexOf('\n        };'));
assert.ok(
  nativeBlock.includes('isOwnControl(child)'),
  'the lookup must skip every control of this plugin',
);
assert.ok(
  source.includes('data-quick-update-concurrency-holder'),
  'the holder must be recognised as the plugin\'s own',
);

console.log('concurrency input: all checks passed');
