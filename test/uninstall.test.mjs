/**
 * Checks that an uninstall leaves the page usable.
 *
 * The Host reports every change with `plugin-manager/changed`, and the page
 * listens for it and reloads itself. The plugin must not click the refresh
 * as well: a second round of checks would grey out every check button for
 * as long as it ran, right after the person removed a plugin.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');

/**
 * The source of one function, from its name to the line that closes it.
 *
 * @param {string} name - the function's name.
 * @returns {string} the function's source.
 */
function extract(name) {
  const lines = source.split('\n');
  const first = lines.findIndex((line) => {
    const text = line.trim();
    return text.startsWith(`function ${name}(`)
      || text.startsWith(`async function ${name}(`)
      || text.startsWith(`const ${name} = `);
  });
  assert.notEqual(first, -1, `${name} must exist`);
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

/* ---- the removal does not start another round of checks ---- */

const removal = extract('uninstallRow');
assert.ok(removal.includes('pluginManager().removeBundle(name)'), 'the removal must go through the Host');
assert.ok(
  !removal.includes('clickRefresh()'),
  'the removal must not click the page refresh: the page reloads itself when the Host reports the change',
);
assert.ok(
  removal.includes('rememberInstalledFromPage()'),
  'the removal must read the page\'s own inventory',
);

/* ---- the check button is disabled while the row is uninstalled ---- */

const paint = extract('paintRow');
assert.ok(
  paint.includes('setDisabled(check, busy || blocked || isRemoving || record.phase === \'checking\');'),
  'the check button must be disabled while the row\'s plugin is being uninstalled',
);
assert.ok(
  paint.includes('const isRemoving = removing.has(name);'),
  'the row\'s removal state must be read before the buttons are set',
);
assert.ok(
  paint.indexOf('const isRemoving = removing.has(name);') < paint.indexOf('setDisabled(check,'),
  'the removal state must be read before the check button is set',
);

/* ---- the click does not start a check for a row that is going away ---- */

const create = extract('createRowActions');
assert.ok(
  create.includes('if (removing.has(name)) return;'),
  'a row that is being uninstalled must not start a check',
);
assert.ok(
  create.includes("if (phase === 'checking' || phase === 'updating') return;"),
  'a row that is being checked must not be checked again',
);

/* ---- the helper the removal uses exists ---- */

assert.ok(
  source.includes('const rememberInstalledFromPage = () => {'),
  'the helper that reads the page inventory must exist',
);
assert.ok(
  source.includes('const packages = state.packages || [];'),
  'the helper must read the page\'s packages',
);

console.log('uninstall: all checks passed');
