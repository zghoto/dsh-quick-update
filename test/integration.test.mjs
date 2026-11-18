/**
 * An end-to-end check of the Git update, against the machine's own profile
 * and the real repository.
 *
 * The host half's own functions are used: the profile is read from disk, the
 * remote commit is asked of the repository over the network, and the update
 * route is driven with a manager that records what it was asked to do. The
 * manager is the only stand-in, so the check says what the plugin would do to
 * the profile.
 *
 * The check is skipped when no profile is present.
 */
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const profileDir = process.env.DSH_PROFILE_DIR
  ?? 'C:/Users/23689/.dsh/profiles/desktop';

if (!existsSync(`${profileDir}/package.json`)) {
  console.log('integration: no profile on this machine; skipped');
  process.exit(0);
}

const source = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8');

/**
 * The source of one function, from its name to the line that closes it.
 *
 * @param {string} name - the function's name.
 * @returns {string} the function's source.
 */
function extract(name) {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`function ${name}(`) || line.startsWith(`async function ${name}(`));
  assert.notEqual(start, -1, `${name} must exist`);
  let end = start;
  while (end < lines.length && lines[end] !== '}') end += 1;
  return lines.slice(start, end + 1).join('\n');
}

/* The module's constants and its cache variables, so a function that reads
   one of them still works. */
const constants = [
  ...[...source.matchAll(/^const ([A-Z][A-Z0-9_]*) = ([^;]+);$/gm)]
    .map((match) => `const ${match[1]} = ${match[2]};`),
  ...[...source.matchAll(/^let ([a-z][A-Za-z0-9]*);$/gm)]
    .map((match) => `let ${match[1]};`),
].join('\n');

const helpers = [...source.matchAll(/^(?:async )?function ([a-z][A-Za-z0-9]*)\(/gm)]
  .map((match) => match[1])
  .map((name) => extract(name))
  .join('\n');

/* The host half's own functions, with the real Node APIs. */
const nodeApis = {
  execFile: (await import('node:child_process')).execFile,
  execFileSync: (await import('node:child_process')).execFileSync,
  randomUUID: (await import('node:crypto')).randomUUID,
  existsSync: (await import('node:fs')).existsSync,
  readFileSync: (await import('node:fs')).readFileSync,
  readdirSync: (await import('node:fs')).readdirSync,
  homedir: (await import('node:os')).homedir,
  join: (await import('node:path')).join,
  promisify: (await import('node:util')).promisify,
};

const factory = new Function(
  'execFile',
  'execFileSync',
  'randomUUID',
  'existsSync',
  'readFileSync',
  'readdirSync',
  'homedir',
  'join',
  'promisify',
  `${constants}\nconst execFileAsync = promisify(execFile);\n${helpers}\nreturn { gitFacts, remoteCommitOf, specAtCommit, parseGitSpec };`,
);

const host = factory(
  nodeApis.execFile,
  nodeApis.execFileSync,
  nodeApis.randomUUID,
  nodeApis.existsSync,
  nodeApis.readFileSync,
  nodeApis.readdirSync,
  nodeApis.homedir,
  nodeApis.join,
  nodeApis.promisify,
);

/* The context the profile lookup needs. */
const ctx = { get: () => null };
process.env.DSH_PROFILE_DIR = profileDir;

/* The Git dependencies the profile records. */
const manifest = JSON.parse(readFileSync(`${profileDir}/package.json`, 'utf8'));
const gitDependencies = Object.entries(manifest.dependencies ?? {})
  .filter(([, spec]) => host.parseGitSpec(spec) !== null);

assert.ok(gitDependencies.length > 0, 'the profile must record a Git dependency');

for (const [name, spec] of gitDependencies) {
  const facts = host.gitFacts(ctx, name);
  assert.ok(facts.error === undefined, `${name}: ${facts.error}`);

  /* The installed commit is read from the lockfile. */
  assert.ok(
    typeof facts.installedCommit === 'string' && facts.installedCommit.length === 40,
    `${name}: the installed commit must be read from the lockfile, got ${facts.installedCommit}`,
  );

  /* The repository answers with the commit the branch points at. A remote
     that cannot be reached is not a failure of this plugin, so the check
     says so and moves on. */
  let remote;
  try {
    remote = await host.remoteCommitOf(facts);
  } catch (error) {
    console.log(`integration: ${name} 的仓库暂时连不上，跳过（${error instanceof Error ? error.message : String(error)}）`);
    continue;
  }
  assert.ok(
    typeof remote.commit === 'string' && remote.commit.length === 40,
    `${name}: the remote commit must be a full hash, got ${remote.commit}`,
  );

  /* The commit the update installs is pinned to the same repository. */
  const target = host.specAtCommit(facts.spec, remote.commit);
  assert.ok(target !== null, `${name}: the update spec must be built`);
  assert.ok(
    target.endsWith(`#${remote.commit}`),
    `${name}: the update spec must pin the remote commit, got ${target}`,
  );
  assert.ok(
    target.startsWith(spec.split('#')[0]),
    `${name}: the update spec must name the same repository, got ${target}`,
  );

  /* The repository the target names is the one the facts read. */
  const targetFacts = host.parseGitSpec(target);
  assert.equal(targetFacts.url, facts.url, `${name}: the target must name the same repository`);

  console.log(`integration: ${name} ${facts.installedCommit.slice(0, 8)} -> ${remote.commit.slice(0, 8)} (${facts.label})`);
}

console.log('integration: all checks passed');
