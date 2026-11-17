/**
 * dsh-quick-update host entry.
 *
 * The Client half drives the Plugins page; the Host half answers the one
 * question the browser cannot answer alone: whether a Git-installed plugin has
 * newer commits on its tracked branch, and — when the person asks for it —
 * installs that commit.
 *
 * Two exact routes are registered on the web server when one is composed:
 *
 * - `GET  /dsh-quick-update/api/git?name=<package>` reads the profile manifest
 *   and `pnpm-lock.yaml` for the installed commit, then asks the repository
 *   with `git ls-remote`.
 * - `POST /dsh-quick-update/api/git-update` replaces the installed package with
 *   the remote commit and reinstalls the previous commit when that fails.
 *
 * Neither route takes a URL from the caller: the Git spec comes from the
 * profile manifest, so the browser cannot point an install at an arbitrary
 * repository.
 */
import { execFile, execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

export const name = 'dsh-quick-update';

const execFileAsync = promisify(execFile);

/** Ways to name the Git executable, most reliable first. */
const GIT_CANDIDATES = process.platform === 'win32'
  ? ['git', 'C:\\Program Files\\Git\\cmd\\git.exe', 'C:\\Program Files (x86)\\Git\\cmd\\git.exe']
  : ['git'];

/** The Git executable that answers, or null when this machine has none. */
let cachedGit;
function gitExecutable() {
  if (cachedGit !== void 0) return cachedGit;
  for (const candidate of GIT_CANDIDATES) {
    try {
      const out = String(execFileSync(candidate, ['--version'], {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }));
      if (/git version/i.test(out)) {
        cachedGit = candidate;
        return cachedGit;
      }
    } catch (_error) {
      /* try the next candidate */
    }
  }
  cachedGit = null;
  return cachedGit;
}

/** How long one Git remote lookup may take. */
const GIT_TIMEOUT_MS = 20000;


/** A commit hash as `git` prints it. */
const COMMIT_RE = /^[0-9a-f]{40}$/i;

/**
 * Directories that may hold the active profile, most reliable first.
 *
 * @param ctx - the Host plugin context.
 * @returns candidate profile directories.
 */
function profileCandidates(ctx) {
  const candidates = [];
  const env = process.env;
  if (typeof env.DSH_PROFILE_DIR === 'string' && env.DSH_PROFILE_DIR !== '') {
    candidates.push(env.DSH_PROFILE_DIR);
  }
  const home = typeof env.DSH_HOME === 'string' && env.DSH_HOME !== ''
    ? env.DSH_HOME
    : join(homedir(), '.dsh');
  if (typeof env.DSH_PROFILE === 'string' && env.DSH_PROFILE !== '') {
    candidates.push(join(home, 'profiles', env.DSH_PROFILE));
  }
  try {
    const manager = ctx.get('pluginManager');
    const dir = manager && manager.profile && typeof manager.profile.dir === 'string'
      ? manager.profile.dir
      : null;
    if (dir !== null) candidates.push(dir);
  } catch (_error) {
    /* the service may be absent or private */
  }
  return candidates.filter((dir, index) => candidates.indexOf(dir) === index);
}

/** The DSH home directory, from the environment or the default location. */
function dshHome() {
  const env = process.env;
  if (typeof env.DSH_HOME === 'string' && env.DSH_HOME !== '') return env.DSH_HOME;
  return join(homedir(), '.dsh');
}

/**
 * Profiles on disk whose manifest already depends on this plugin, which is the
 * profile the running Host belongs to.
 *
 * @returns candidate profile directories, newest first.
 */
function scannedProfiles() {
  const root = join(dshHome(), 'profiles');
  let names;
  try {
    names = readdirSync(root);
  } catch (_error) {
    return [];
  }
  const found = [];
  for (const name of names) {
    const dir = join(root, name);
    try {
      const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      const deps = manifest && manifest.dependencies ? manifest.dependencies : {};
      if (typeof deps['dsh-quick-update'] === 'string') found.push(dir);
    } catch (_error) {
      /* not a profile */
    }
  }
  return found;
}

/** The profile directory the running Host manages. */
let cachedProfileDir;
function profileDir(ctx) {
  if (cachedProfileDir !== void 0) return cachedProfileDir;
  const candidates = profileCandidates(ctx);
  for (const dir of candidates) {
    try {
      if (existsSync(join(dir, 'package.json'))) {
        cachedProfileDir = dir;
        return dir;
      }
    } catch (_error) {
      /* try the next candidate */
    }
  }
  const scanned = scannedProfiles();
  cachedProfileDir = scanned.length > 0 ? scanned[0] : null;
  return cachedProfileDir;
}

/**
 * Split one Git spec into the repository URL, an optional ref, and a label.
 *
 * @param spec - the dependency spec from the profile manifest.
 * @returns the parsed spec, or null for anything that is not Git.
 */
function parseGitSpec(spec) {
  if (typeof spec !== 'string' || spec === '') return null;
  let raw = spec;
  let ref;
  const hash = raw.indexOf('#');
  if (hash >= 0) {
    ref = raw.slice(hash + 1) || void 0;
    raw = raw.slice(0, hash);
  }
  let url;
  if (raw.startsWith('github:')) {
    url = `https://github.com/${raw.slice('github:'.length)}.git`;
  } else if (raw.startsWith('gitlab:')) {
    url = `https://gitlab.com/${raw.slice('gitlab:'.length)}.git`;
  } else if (raw.startsWith('bitbucket:')) {
    url = `https://bitbucket.org/${raw.slice('bitbucket:'.length)}.git`;
  } else if (raw.startsWith('git+')) {
    url = raw.slice('git+'.length);
  } else if (raw.startsWith('git@') || raw.startsWith('https://') || raw.startsWith('http://') || raw.startsWith('ssh://')) {
    url = raw;
  } else {
    return null;
  }
  const hostMatch = /^(?:git\+)?(?:https?|ssh):\/\/(?:[^@/]+@)?([^/:]+)[/:](.+?)(?:\.git)?$/.exec(url);
  let label = url;
  if (hostMatch !== null) {
    const host = hostMatch[1].toLowerCase();
    const repo = hostMatch[2].replace(/\.git$/, '');
    const known = { 'github.com': 'GitHub', 'gitlab.com': 'GitLab', 'gitee.com': 'Gitee', 'bitbucket.org': 'Bitbucket' };
    label = `${known[host] || host} · ${repo}`;
  }
  return { url, ref, label };
}

/**
 * The installed commit of one Git dependency, read from the lockfile entry the
 * package manager resolved.
 *
 * @param dir - the profile directory.
 * @param dependency - the dependency name.
 * @param spec - its manifest spec.
 * @returns the resolved commit, or null when the lockfile does not name one.
 */
function installedCommitOf(dir, dependency, spec) {
  let lock;
  try {
    lock = readFileSync(join(dir, 'pnpm-lock.yaml'), 'utf8');
  } catch (_error) {
    return null;
  }
  const escaped = dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const entry = new RegExp(`(?:'|")?${escaped}(?:'|")?:\\s*\\n\\s+specifier:[^\\n]*\\n\\s+version:\\s*([^\\n]+)`);
  const matched = entry.exec(lock);
  const version = matched === null ? null : matched[1];
  if (version !== null) {
    const byHash = /#([0-9a-f]{40})/i.exec(version);
    if (byHash !== null) return byHash[1].toLowerCase();
    const byTarball = /\/tar\.gz\/([0-9a-f]{40})/i.exec(version);
    if (byTarball !== null) return byTarball[1].toLowerCase();
  }
  const hosted = /^(?:github|gitlab|bitbucket):(\d+)?\/?([^#]+)$/.exec(typeof spec === 'string' ? spec : '');
  if (hosted !== null) {
    const resolution = new RegExp(`resolution:\\s*\\{[^}]*commit:\\s*([0-9a-f]{40})[^}]*\\}`, 'i');
    const match = resolution.exec(lock);
    if (match !== null) return match[1].toLowerCase();
  }
  return null;
}

/**
 * Read the Git facts of one installed dependency.
 *
 * @param ctx - the Host plugin context.
 * @param dependency - the installed package name.
 * @returns its spec, repository, ref, and installed commit, or a reason.
 */
function gitFacts(ctx, dependency) {
  if (typeof dependency !== 'string' || dependency === '' || dependency.startsWith('-')) {
    return { error: 'invalid dependency name' };
  }
  const dir = profileDir(ctx);
  if (dir === null) return { error: 'profile directory not found' };
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  } catch (error) {
    return { error: `profile manifest is unreadable: ${error.message}` };
  }
  const spec = manifest && manifest.dependencies ? manifest.dependencies[dependency] : void 0;
  if (typeof spec !== 'string') return { error: `${dependency} is not a direct dependency` };
  const parsed = parseGitSpec(spec);
  if (parsed === null) return { error: `${dependency} is not a Git dependency` };
  return {
    dir,
    spec,
    url: parsed.url,
    ref: parsed.ref,
    label: parsed.label,
    installedCommit: installedCommitOf(dir, dependency, spec),
  };
}

/**
 * The network proxy this machine uses for HTTPS, if any. Git and pnpm do not
 * read the macOS system proxy themselves, and the Host process often starts
 * without the proxy variables in its environment.
 *
 * @returns the proxy URL and where it came from, or null.
 */
let cachedProxy;
function systemProxy() {
  if (cachedProxy !== void 0) return cachedProxy;
  const env = process.env;
  for (const name of ['HTTPS_PROXY', 'https_proxy', 'ALL_PROXY', 'all_proxy', 'HTTP_PROXY', 'http_proxy']) {
    const value = env[name];
    if (typeof value === 'string' && value !== '') {
      cachedProxy = { url: value, source: `env:${name}` };
      return cachedProxy;
    }
  }
  if (process.platform === 'win32') {
    try {
      const out = String(execFileSync('reg', [
        'query',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
      ], { encoding: 'utf8', timeout: 5000, windowsHide: true }));
      const enabled = /ProxyEnable\s+REG_DWORD\s+0x1/i.test(out);
      if (enabled) {
        const server = /ProxyServer\s+REG_SZ\s+([^\r\n]+)/i.exec(out)?.[1]?.trim();
        if (typeof server === 'string' && server !== '') {
          let url = server;
          if (server.includes('=')) {
            const parts = {};
            for (const part of server.split(';')) {
              const index = part.indexOf('=');
              if (index > 0) parts[part.slice(0, index).trim().toLowerCase()] = part.slice(index + 1).trim();
            }
            url = parts.https || parts.http || parts.socks || '';
          }
          if (url !== '') {
            if (!/^[a-z]+:\/\//i.test(url)) url = `http://${url}`;
            cachedProxy = { url, source: 'wininet' };
            return cachedProxy;
          }
        }
      }
    } catch (_error) {
      /* no readable system proxy */
    }
  }
  if (process.platform === 'darwin') {
    try {
      const out = String(execFileSync('scutil', ['--proxy'], { encoding: 'utf8', timeout: 5000 }));
      const enabled = /HTTPSEnable\s*:\s*1/.test(out) || /HTTPEnable\s*:\s*1/.test(out);
      if (enabled) {
        const host = /HTTPSProxy\s*:\s*([^\s]+)/.exec(out)?.[1] || /HTTPProxy\s*:\s*([^\s]+)/.exec(out)?.[1];
        const port = /HTTPSPort\s*:\s*(\d+)/.exec(out)?.[1] || /HTTPPort\s*:\s*(\d+)/.exec(out)?.[1];
        if (typeof host === 'string' && typeof port === 'string') {
          cachedProxy = { url: `http://${host}:${port}`, source: 'scutil' };
          return cachedProxy;
        }
      }
    } catch (_error) {
      /* no system proxy readable */
    }
  }
  cachedProxy = null;
  return null;
}

/**
 * Run one package-manager operation with the proxy in this process's
 * environment, because the installation spawns pnpm, which reads the proxy
 * from the environment rather than from the macOS network settings.
 *
 * @param run - the operation to run.
 */
async function withNetworkEnv(run) {
  const bridged = networkEnv();
  const keys = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy'];
  const saved = {};
  for (const key of keys) {
    saved[key] = process.env[key];
    if (typeof bridged[key] === 'string') process.env[key] = bridged[key];
  }
  try {
    return await run();
  } finally {
    for (const key of keys) {
      if (saved[key] === void 0) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

/** The environment child processes need so they reach the network like the page does. */
function networkEnv() {
  const proxy = systemProxy();
  if (proxy === null) {
    return { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' };
  }
  const bridged = { ...process.env };
  for (const name of ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy']) {
    bridged[name] = proxy.url;
  }
  bridged.GIT_TERMINAL_PROMPT = '0';
  bridged.GCM_INTERACTIVE = 'never';
  return bridged;
}

/**
 * Ask the repository for the commit the tracked ref points at.
 *
 * @param facts - the dependency's Git facts.
 * @returns the remote commit, the resolved ref name, and its publication hint.
 */
async function remoteCommitOf(facts) {
  const git = gitExecutable();
  if (git === null) {
    throw new Error('Git is not installed on this system, so a Git-installed plugin cannot be checked');
  }
  const args = ['ls-remote', '--symref', facts.url];
  args.push(facts.ref === void 0 || COMMIT_RE.test(facts.ref) ? 'HEAD' : facts.ref, 'HEAD');
  const { stdout } = await execFileAsync(git, args, {
    timeout: GIT_TIMEOUT_MS,
    env: networkEnv(),
    windowsHide: true,
  });
  let commit = null;
  let ref = facts.ref === void 0 ? 'HEAD' : facts.ref;
  for (const line of String(stdout || '').split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    const symref = /^ref:\s+(\S+)\s+HEAD$/.exec(trimmed);
    if (symref !== null) {
      ref = symref[1].replace(/^refs\/heads\//, '');
      continue;
    }
    const head = /^([0-9a-f]{40})\s+HEAD$/i.exec(trimmed);
    if (head !== null) commit = head[1].toLowerCase();
  }
  if (commit === null) throw new Error('git ls-remote named no HEAD');
  return { commit, ref };
}

/** The install spec that pins one exact commit. */
function specAtCommit(spec, commit) {
  const base = spec.split('#')[0];
  return `${base}#${commit}`;
}

/** Send one JSON answer. */
function sendJson(response, status, body) {
  const text = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  });
  response.end(text);
}

/** Read one JSON request body. */
async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('request body is too large');
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text === '' ? {} : JSON.parse(text);
}

/**
 * Register the plugin against the host context.
 *
 * @param ctx - the Host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['webServer'], (scope) => {
    const manager = () => {
      const service = scope.get('pluginManager');
      if (!service) throw new Error('pluginManager service is unavailable');
      return service;
    };

    const disposers = [];

    disposers.push(scope.webServer.register({
      kind: 'exact',
      path: '/dsh-quick-update/api/git',
      handler: (request, response) => {
        if (request.method !== 'GET') {
          response.writeHead(405, { allow: 'GET' });
          response.end();
          return;
        }
        void (async () => {
          try {
            const url = new URL(request.url ?? '/', 'http://localhost');
            const dependency = url.searchParams.get('name') ?? '';
            const facts = gitFacts(scope, dependency);
            if (facts.error !== void 0) {
              sendJson(response, 200, { ok: false, name: dependency, error: facts.error });
              return;
            }
            const remote = await remoteCommitOf(facts);
            sendJson(response, 200, {
              ok: true,
              name: dependency,
              spec: facts.spec,
              label: facts.label,
              url: facts.url,
              ref: remote.ref,
              installedCommit: facts.installedCommit,
              remoteCommit: remote.commit,
              proxy: systemProxy() === null ? null : systemProxy().source,
              behind: facts.installedCommit !== null && facts.installedCommit !== remote.commit,
              checkedAt: new Date().toISOString(),
            });
          } catch (error) {
            sendJson(response, 200, { ok: false, error: error instanceof Error ? error.message : String(error) });
          }
        })();
      },
    }));

    disposers.push(scope.webServer.register({
      kind: 'exact',
      path: '/dsh-quick-update/api/git-update',
      handler: (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        void (async () => {
          let dependency = '';
          try {
            const body = await readJson(request);
            dependency = typeof body.name === 'string' ? body.name : '';
            const facts = gitFacts(scope, dependency);
            if (facts.error !== void 0) {
              sendJson(response, 400, { ok: false, name: dependency, error: facts.error });
              return;
            }
            const remote = await remoteCommitOf(facts);
            const previous = facts.installedCommit;
            if (previous === remote.commit) {
              sendJson(response, 200, { ok: true, name: dependency, changed: false, commit: remote.commit });
              return;
            }
            const pluginManager = manager();
            const requestId = randomUUID();
            const removal = await withNetworkEnv(() => pluginManager.removeBundle(dependency));
            if (removal && removal.application === 'failed') {
              sendJson(response, 200, { ok: false, name: dependency, stage: 'remove', error: 'removal failed' });
              return;
            }
            const installed = await withNetworkEnv(() => pluginManager.installBundle(specAtCommit(facts.spec, remote.commit), {
              requestId,
              enabled: true,
              saveExact: true,
            }));
            if (installed && installed.application !== 'failed') {
              sendJson(response, 200, {
                ok: true,
                name: dependency,
                changed: true,
                commit: remote.commit,
                ref: remote.ref,
                label: facts.label,
              });
              return;
            }
            let restored = null;
            if (previous !== null) {
              try {
                restored = await withNetworkEnv(() => pluginManager.installBundle(specAtCommit(facts.spec, previous), {
                  requestId: randomUUID(),
                  enabled: true,
                  saveExact: true,
                }));
              } catch (error) {
                restored = { application: 'failed', error: { diagnostic: error instanceof Error ? error.message : String(error) } };
              }
            }
            sendJson(response, 200, {
              ok: false,
              name: dependency,
              stage: 'install',
              error: (installed && installed.error && (installed.error.diagnostic || installed.error.code)) || 'installation failed',
              restored: restored !== null && restored.application !== 'failed',
            });
          } catch (error) {
            sendJson(response, 200, {
              ok: false,
              name: dependency,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })();
      },
    }));

    scope.effect(() => () => {
      for (const dispose of disposers) {
        try {
          dispose();
        } catch (_error) {
          /* already gone */
        }
      }
    }, 'dsh-quick-update: git routes');
  }, 'dsh-quick-update: web routes');

}
