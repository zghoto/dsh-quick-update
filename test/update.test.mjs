/**
 * Checks for the host half's Git update route.
 *
 * The route is driven the way the page drives it: a request goes in, and the
 * answers come back. The plugin manager is a mock that records what it was
 * asked to do, so the update's effect on the profile is checked directly.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8');

/* What the Host's lookup would report for the dependency under test. */
const facts = {
  error: undefined,
  dir: 'C:/profile',
  spec: 'git+https://github.com/MerkyorLynn/dsh-live-compact.git',
  url: 'https://github.com/MerkyorLynn/dsh-live-compact.git',
  ref: undefined,
  label: 'GitHub · MerkyorLynn/dsh-live-compact',
  installedCommit: '3ed5e4054a6ad9d8c6a1edf0909856ea03584c82',
};

/**
 * Build the plugin's routes against a mock manager.
 *
 * @param {object} manager - the mock plugin manager.
 * @returns {Function} the handler of the git-update route.
 */
function buildRoute(manager) {
  const scope = {
    get: () => manager,
    webServer: {
      register: (route) => {
        if (route.path === '/dsh-quick-update/api/git-update') {
          scope.handler = route.handler;
        }
        return () => {};
      },
    },
    effect: (fn) => {
      scope.cleanup = fn();
    },
  };
  const ctx = {
    inject: (names, fn) => {
      scope.injected = fn(scope);
    },
  };
  /* The mock's own failure is visible rather than silent. */
  manager.installBundle = async (spec, options) => {
    manager.calls.push({ method: 'installBundle', spec, options });
    return manager.outcome(spec);
  };
  // The module's own code is the code under test: it is read from the source
  // and run, so a change to the route is what the test exercises.
  const applySource = source.slice(source.indexOf('export function apply(ctx)'));
  const body = applySource
    .replace('export function apply(ctx) {', 'function apply(ctx) {')
    .replace(/^export const name = .*$/m, '');
  /* The route's own helpers are taken from the module, so the test drives the
     real reading of the request and the real writing of the answer. */
  const helper = (name) => {
    const lines = source.split('\n');
    const start = lines.findIndex((line) => line.startsWith(`function ${name}(`) || line.startsWith(`async function ${name}(`));
    assert.notEqual(start, -1, `${name} must exist`);
    let end = start;
    while (end < lines.length && lines[end] !== '}') end += 1;
    return lines.slice(start, end + 1).join('\n');
  };
  const constants = [...source.matchAll(/^const ([A-Z][A-Z0-9_]*) = ([^;]+);$/gm)]
    .map((match) => `const ${match[1]} = ${match[2]};`)
    .join('\n');
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
    'gitFacts',
    'remoteCommitOf',
    'specAtCommit',
    'withNetworkEnv',
    `${constants}\n${helper('sendJson')}\n${helper('readJson')}\n${body}\nreturn apply;`,
  );
  const apply = factory(
    () => {},
    () => '',
    () => 'request-id',
    () => true,
    () => '{}',
    () => [],
    () => 'C:/Users/test',
    () => 'C:/Users/test',
    (fn) => fn,
    /* gitFacts(scope, dependency) */
    () => facts,
    /* remoteCommitOf(facts) */
    () => Promise.resolve({ ok: true, commit: 'remote-commit', ref: 'main' }),
    /* specAtCommit(spec, commit) */
    (spec, commit) => `${spec.split('#')[0]}#${commit}`,
    /* withNetworkEnv(run) */
    (fn) => fn(),
  );
  apply(ctx);
  assert.ok(scope.handler, 'the git-update route must be registered');
  return scope.handler;
}

/**
 * One request, and the answer the route gave.
 *
 * @param {Function} handler - the route's handler.
 * @param {string} name - the dependency to update.
 * @returns {Promise<object>} the parsed answer.
 */
function callRoute(handler, name) {
  return new Promise((resolve) => {
    const chunks = [];
    const response = {
      writeHead: () => {},
      end: (text) => {
        chunks.push(text);
        try {
          resolve(JSON.parse(text));
        } catch (_error) {
          resolve({ raw: text });
        }
      },
    };
    const request = {
      method: 'POST',
      url: '/dsh-quick-update/api/git-update',
      [Symbol.asyncIterator]: async function* iterator() {
        yield Buffer.from(JSON.stringify({ name }));
      },
    };
    handler(request, response);
  });
}

/* A manager that records its calls. */
function makeManager(outcome) {
  const calls = [];
  return {
    calls,
    outcome,
    async removeBundle(name) {
      calls.push({ method: 'removeBundle', name });
      return { application: 'failed', error: { code: 'bundle-in-use' } };
    },
  };
}

/* ---- the update must not remove the installed bundle ---- */

const manager = makeManager(() => ({ application: 'applied' }));
const handler = buildRoute(manager);

/* The facts are what the route reads; the mock manager stands in for the
   Host's own lookup so the test does not need a real profile. */
const answer = await callRoute(handler, 'dsh-live-compact');

assert.equal(answer.ok, true, 'the update must succeed');
assert.equal(answer.changed, true, 'the update must report a change');
assert.equal(
  manager.calls.some((call) => call.method === 'removeBundle'),
  false,
  'the update must not remove the bundle: a running bundle cannot be removed',
);
const install = manager.calls.find((call) => call.method === 'installBundle');
assert.ok(install, 'the update must install the new commit');
assert.ok(
  install.spec.endsWith('#remote-commit'),
  `the installed spec must pin the remote commit, got ${install.spec}`,
);
assert.equal(install.options.saveExact, true, 'the installed spec must be saved exactly');

/* ---- a failed install restores the previous commit ---- */

const failing = makeManager((spec) => (
  spec.includes('#remote-commit')
    ? { application: 'failed', error: { diagnostic: 'the network is down' } }
    : { application: 'applied' }
));
const failingHandler = buildRoute(failing);
const failed = await callRoute(failingHandler, 'dsh-live-compact');

assert.equal(failed.ok, false, 'a failed install must be reported');
assert.equal(failed.stage, 'install', 'the failure must name the stage');
assert.ok(failed.error.length > 0, 'the failure must carry a reason');
assert.equal(
  failing.calls.filter((call) => call.method === 'removeBundle').length,
  0,
  'a failed install must not remove the bundle either',
);
const restore = failing.calls.filter((call) => call.method === 'installBundle').at(-1);
assert.ok(
  restore.spec.endsWith('#3ed5e4054a6ad9d8c6a1edf0909856ea03584c82'),
  `the previous commit must be restored, got ${restore.spec}`,
);
assert.equal(failed.restored, true, 'the restore must be reported');

console.log('update route: all checks passed');
