/**
 * Run every check.
 *
 * The source is checked first, so a syntax error is reported before a
 * behaviour check runs.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

for (const file of ['lib/index.js', 'lib/client.js']) {
  execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' });
  console.log(`syntax ok: ${file}`);
}

for (const file of ['host.test.mjs', 'host-semantics.test.mjs', 'client.test.mjs', 'update.test.mjs', 'integration.test.mjs']) {
  const out = execFileSync(process.execPath, [join(here, file)], { stdio: 'pipe' });
  process.stdout.write(out);
}

console.log('all checks passed');
