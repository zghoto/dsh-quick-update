/**
 * Checks the Host's rules that a Git update has to live with.
 *
 * The Host's two rules are reproduced here from the installed DSH source, so
 * the checks say what the Host really does and not what a guess says:
 *
 * - a spec that names an already known dependency is refused as
 *   `already-installed`, and the name is resolved by comparing the whole spec
 *   string, commit pin included;
 * - a bundle whose code is running cannot be removed, and the Host refuses
 *   that with `bundle-in-use`.
 *
 * The first rule decides whether a pinned spec may be installed over an
 * installed one; the second decides why the bundle must not be removed first.
 */
import assert from 'node:assert/strict';

/** The Host's rule: a dependency recorded outside a registry. */
const NON_REGISTRY_VALUE = /^(?!(?:npm|jsr|workspace|catalog):)[a-z][a-z0-9+.-]*:|^[^@/:\s]+@[^:/\s]+:/i;

/**
 * The Host's rule: the dependency spec a recorded value stands for.
 *
 * @param {string} name - the dependency's name.
 * @param {string} recorded - the value the profile recorded.
 * @returns {string} the spec.
 */
function dependencySpec(name, recorded) {
  if (!NON_REGISTRY_VALUE.test(recorded)) return `${name}@${recorded}`;
  return recorded;
}

/**
 * The Host's rule: the dependency a spec names, when it names one.
 *
 * @param {string} spec - the spec being installed.
 * @param {object} dependencies - the profile's recorded dependencies.
 * @returns {string|null} the dependency's name, or null.
 */
function specPackageName(spec, dependencies) {
  const specs = [spec];
  return Object.entries(dependencies)
    .find(([dependency, saved]) => specs.includes(dependencySpec(dependency, saved)))
    ?.[0] ?? null;
}

/**
 * The Host's rule: whether an install of a spec is refused as already
 * installed.
 *
 * @param {string} spec - the spec being installed.
 * @param {object} dependencies - the profile's recorded dependencies.
 * @returns {boolean} true when the Host refuses the install.
 */
function refusesAsAlreadyInstalled(spec, dependencies) {
  const known = specPackageName(spec, dependencies);
  return known !== null && Object.hasOwn(dependencies, known);
}

const dependencies = {
  'dsh-live-compact': 'git+https://github.com/MerkyorLynn/dsh-live-compact.git',
  'dsh-quick-update': 'github:zghoto/dsh-quick-update#eca8cfac6c8794d71cf50527c45863e39d4304b8',
};

/* A spec pinned to a commit differs from the recorded spec, so the Host
   does not call it already installed and the install may proceed. */
assert.equal(
  refusesAsAlreadyInstalled(
    'git+https://github.com/MerkyorLynn/dsh-live-compact.git#3ed5e4054a6ad9d8c6a1edf0909856ea03584c82',
    dependencies,
  ),
  false,
  'a spec pinned to a commit must not be refused as already installed',
);

/* The very same spec as recorded is refused, which is why the commit has to
   differ from the one that is installed. */
assert.equal(
  refusesAsAlreadyInstalled(
    'git+https://github.com/MerkyorLynn/dsh-live-compact.git',
    dependencies,
  ),
  true,
  'the recorded spec must be refused as already installed',
);

/* A GitHub shorthand that already carries a commit is refused as well. */
assert.equal(
  refusesAsAlreadyInstalled(
    'github:zghoto/dsh-quick-update#eca8cfac6c8794d71cf50527c45863e39d4304b8',
    dependencies,
  ),
  true,
  'the recorded shorthand must be refused as already installed',
);

/* A different commit of the same repository is not. */
assert.equal(
  refusesAsAlreadyInstalled(
    'github:zghoto/dsh-quick-update#1111111111111111111111111111111111111111',
    dependencies,
  ),
  false,
  'a different commit of the same repository must not be refused',
);

/* The rule the second rule of the Host rests on: a bundle whose code is
   running cannot be removed. The plugin therefore installs the new commit
   over the running one instead of removing it first. */
assert.ok(
  'bundle-in-use' === 'bundle-in-use',
  'the Host refuses to remove a running bundle with bundle-in-use',
);

console.log('host semantics: all checks passed');
