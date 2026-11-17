/**
 * Checks for the host half's Git helpers.
 *
 * The helpers are exercised through the module's own behaviour: the source is
 * read, the pure functions are extracted, and their answers are compared with
 * what the DSH Host expects.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8');

/**
 * The source of one function, from its name to the line that closes it.
 *
 * The module writes every function at column zero and ends it with a line
 * that holds only the closing brace, so the end of a function is found by
 * that shape rather than by counting braces, which a regular expression
 * literal full of braces would confuse.
 *
 * @param {string} name - the function's name.
 * @returns {string} the function's source.
 */
function extract(name) {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`function ${name}(`));
  assert.notEqual(start, -1, `${name} must exist`);
  let end = start;
  while (end < lines.length && lines[end] !== '}') end += 1;
  assert.notEqual(end, lines.length, `${name} must be closed`);
  return lines.slice(start, end + 1).join('\n');
}

/**
 * Pull one function out of the source and make it callable.
 *
 * The module's constant declarations and the other functions it calls are
 * included, so a function that reads one of them still works.
 *
 * @param {string} name - the function's name.
 * @returns {Function} the function.
 */
function load(name) {
  const constants = [...source.matchAll(/^const ([A-Z][A-Z0-9_]*) = ([^;]+);$/gm)]
    .map((match) => `const ${match[1]} = ${match[2]};`)
    .join('\n');
  const helpers = [...source.matchAll(/^function ([a-z][A-Za-z0-9]*)\(/gm)]
    .map((match) => match[1])
    .filter((other) => other !== name)
    .map((other) => extract(other))
    .join('\n');
  const factory = new Function(`${constants}\n${helpers}\n${extract(name)}; return ${name};`);
  return factory();
}

const parseGitSpec = load('parseGitSpec');
const specAtCommit = load('specAtCommit');

/* --------------------------- parseGitSpec --------------------------- */

assert.equal(parseGitSpec('github:zghoto/dsh-quick-update').url, 'https://github.com/zghoto/dsh-quick-update.git');
assert.equal(parseGitSpec('github:zghoto/dsh-quick-update').ref, undefined);

const pinned = parseGitSpec('github:zghoto/dsh-quick-update#eca8cfac6c8794d71cf50527c45863e39d4304b8');
assert.equal(pinned.ref, 'eca8cfac6c8794d71cf50527c45863e39d4304b8');
assert.equal(pinned.url, 'https://github.com/zghoto/dsh-quick-update.git');
assert.equal(pinned.label, 'GitHub · zghoto/dsh-quick-update');

const plain = parseGitSpec('git+https://github.com/MerkyorLynn/dsh-live-compact.git');
assert.equal(plain.url, 'https://github.com/MerkyorLynn/dsh-live-compact.git');
assert.equal(plain.ref, undefined);
assert.equal(plain.label, 'GitHub · MerkyorLynn/dsh-live-compact');

const ssh = parseGitSpec('git@github.com:owner/repo.git');
assert.equal(ssh.url, 'git@github.com:owner/repo.git');

/* A registry spec is not Git. */
assert.equal(parseGitSpec('dsh-market@1.73.20'), null);
assert.equal(parseGitSpec('^0.1.3'), null);
assert.equal(parseGitSpec(''), null);
assert.equal(parseGitSpec(undefined), null);

/* A host with no friendly name still reads. */
assert.equal(parseGitSpec('https://git.example.com/owner/repo.git').label, 'git.example.com · owner/repo');

/* --------------------------- specAtCommit --------------------------- */

const commit = '337b21619c65945f828bd1433345566ddf4e4e7e';
assert.equal(
  specAtCommit('git+https://github.com/MerkyorLynn/dsh-live-compact.git', commit),
  `git+https://github.com/MerkyorLynn/dsh-live-compact.git#${commit}`,
);
assert.equal(
  specAtCommit('github:zghoto/dsh-quick-update', commit),
  `github:zghoto/dsh-quick-update#${commit}`,
);
/* An already pinned spec keeps its host and gains the new commit. */
assert.equal(
  specAtCommit('github:zghoto/dsh-quick-update#0000000000000000000000000000000000000000', commit),
  `github:zghoto/dsh-quick-update#${commit}`,
);
/* A registry spec cannot be pinned to a commit. */
assert.equal(specAtCommit('dsh-market@1.73.20', commit), null);

console.log('host half: all checks passed');
