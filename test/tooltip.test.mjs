/**
 * Checks the bubble the mark shows.
 *
 * The page's own tooltips are a React component, which injected DOM cannot
 * use. The bubble they render, though, is a fixed-positioned element on the
 * document body whose whole look comes from the theme tokens the page
 * already sets. The checks are that the bubble is built that way, and that
 * it uses the same tokens the page's own tooltip uses.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/* ------------------------------------------------------------------ *
 * The bubble is built the way the page builds it.
 * ------------------------------------------------------------------ */

assert.ok(
  source.includes("element.className = 'qu-bubble'"),
  'the bubble must have its own class',
);
assert.ok(
  source.includes("element.setAttribute('role', 'tooltip')"),
  'the bubble must carry the role a tooltip has',
);
assert.ok(
  source.includes("element.setAttribute('aria-label', text)"),
  'the bubble must carry what it says',
);
assert.ok(
  source.includes("label.className = 'qu-bubble-label'"),
  'the bubble must hold its text in a label',
);
assert.ok(
  source.includes('document.body.appendChild(element)'),
  'the bubble must sit on the document body, as the page\'s own does',
);
assert.ok(
  source.includes('position: fixed'),
  'the bubble must be placed by its own position, as the page\'s own is',
);

/* ------------------------------------------------------------------ *
 * The look comes from the theme tokens the page sets.
 * ------------------------------------------------------------------ */

const styles = source.slice(source.indexOf('const STYLES = String.raw'));
assert.ok(
  styles.includes('--dsw-alias-tooltip-bg'),
  'the bubble must use the page\'s tooltip background',
);
assert.ok(
  styles.includes('--dsw-alias-tooltip-label'),
  'the bubble must use the page\'s tooltip label colour',
);
assert.ok(
  styles.includes('--dsw-radius-sm'),
  'the bubble must use the page\'s radius',
);

/* ------------------------------------------------------------------ *
 * The mark opens the bubble on hover.
 * ------------------------------------------------------------------ */

const inputBlock = source.slice(source.indexOf('// The input says how many checks'));
const markBlock = inputBlock.slice(0, inputBlock.indexOf('const input = holder.querySelector'));
assert.ok(
  markBlock.includes("mark.addEventListener('mouseenter', show)"),
  'the mark must open the bubble when the pointer comes',
);
assert.ok(
  markBlock.includes("mark.addEventListener('mouseleave', hide)"),
  'the mark must close the bubble when the pointer leaves',
);
assert.ok(
  markBlock.includes("mark.addEventListener('focus', show)"),
  'the mark must open the bubble when it is focused',
);
assert.ok(
  markBlock.includes("mark.setAttribute('tabindex', '0')"),
  'the mark must be reachable by the keyboard',
);
assert.ok(
  markBlock.includes("mark.setAttribute('aria-label', hint)"),
  'the mark must say what it means for a reader',
);

/* The bubble is closed when the plugin is unloaded. */
assert.ok(
  source.includes('closeBubble();'),
  'the bubble must be closed when it is no longer wanted',
);

console.log('tooltip bubble: all checks passed');
