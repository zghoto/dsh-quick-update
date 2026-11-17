window.__ModuleLoader__.load({
  id: 'dsh-quick-update',
  factory() {
    /** Dictionary namespace owned by this plugin. */
    const NS = 'quickUpdate';

    /** Simplified Chinese copy and the key source of truth. */
    const zh = {
      check: '检查',
      checking: '检查中…',
      update: '更新',
      updating: '更新中…',
      updateTo: '更新到 {version}',
      retryUpdate: '重试更新',
      updated: '已更新',
      updatedRestart: '已更新，重启生效',
      checkNow: '检查这个插件是否有新版本',
      updateNow: '更新到 {version}',
      updateAll: '更新全部',
      updateAllBusy: '更新中 {done}/{total}',
      updateAllTitle: '依次更新 {count} 个插件',
      updateAllTitleGit: '依次更新 {count} 个插件（其中 {git} 个从 Git 提交重装）',
      updateAllWaiting: '等待确认…',
      confirmGitTitle: '{count} 个插件有新的 Git 提交，但没有发布新版本号',
      confirmGitBody: '这些插件只在分支上有了新提交。更新会先卸载再从该提交重装，失败会尝试装回原来的提交。是否一起更新？',
      confirmGitAll: '全部更新',
      confirmGitSkip: '跳过这些插件',
      confirmGitCancel: '取消',
      updateFailed: '更新失败',
      updatingTo: '正在更新到 {version}…',
      versionsTitle: '{name} 的版本',
      versionsInstalled: '已安装 v{version}',
      versionsEmpty: '没有可直接安装的新版本',
      versionsOmitted: '另有 {count} 个更新的版本未列出',
      versionsFailed: '无法读取版本列表',
      tagLatest: 'latest',
      tagPrerelease: '预发布',
      tagDeprecated: '已弃用',
      tagNeedsDsh: '需要更新 DSH',
      reasonUpToDate: '已是最新版本',
      reasonNotUpdatable: '不是 npm 安装来源，无法检查',
      reasonGit: 'Git 安装：Host 只能更新 registry 安装的插件，请用插件市场更新',
      reasonLinked: '本地链接安装，需从来源手动更新',
      reasonBundled: '随 DSH 一起更新',
      gitTag: 'Git 提交',
      badgeLatest: '最新',
      badgeUpdatable: '可更新',
      uninstall: '卸载',
      uninstallConfirm: '确认卸载',
      uninstalling: '卸载中…',
      uninstallTitle: '卸载 {name}',
      uninstallHint: '再次点击确认卸载 {name}：会把它从 profile 中移除。',
      uninstallBlocked: '不能在这里卸载：{reason}',
      uninstallReasonManaged: '由 DSH 管理，无法移除',
      uninstallReasonUnaddressable: '这个条目没有可保存的补丁位置',
      uninstallFailed: '卸载失败：{reason}',
      badgeNeedsDsh: '可更新但最新版不兼容当前版本 DSH',
      gitBehind: '有新提交 {sha}',
      gitLatest: 'Git 源（{ref}）已是最新（{sha}）',
      gitCheckFailed: 'Git 源检查失败：{reason}',
      gitUpdateConfirm: '再次点击确认更新到 {sha}',
      gitUpdateHint: 'Git 更新会先卸载再安装该提交，失败时会尝试装回原来的提交。',
      gitUpdating: '正在从 Git 更新…',
      gitUpdated: '已从 Git 更新到 {sha}',
      sourceDefault: '默认安装源',
      updateCountAll: '{total} 个插件可更新（含 {git} 个 Git 新提交）',
      updateCountNone: '所有插件均为最新版本',
      gitCountHint: 'Git 安装的插件按提交比较，版本号可能不变；这里把这类更新也计入总数，「更新全部」会一并处理。',
      gitUnavailable: 'Git 扩展还没加载，重启 DSH 后可用',
      updateAfterCheck: '点击后先检查这个插件的最新版本，有更新再装',
      updateAllCheckFirst: '点击后先检查全部插件，有更新再逐个安装',
      reasonNeedsDsh: '{version} 需要更新的 DSH：它要求 {peers}',
      reasonUnchecked: '尚未检查',
      reasonCheckFailed: '检查失败：{reason}',
      reasonUpdateFailed: '更新失败：{reason}',
    };

    /** English copy, checked against the Chinese key set. */
    const en = {
      check: 'Check',
      checking: 'Checking…',
      update: 'Update',
      updating: 'Updating…',
      updateTo: 'Update to {version}',
      retryUpdate: 'Retry',
      updated: 'Updated',
      updatedRestart: 'Updated · restart',
      checkNow: 'Check this plugin for a newer version',
      updateNow: 'Update to {version}',
      updateAll: 'Update all',
      updateAllBusy: 'Updating {done}/{total}',
      updateAllTitle: 'Update {count} plugins one after another',
      updateAllTitleGit: 'Update {count} plugins ({git} reinstalled from Git commits)',
      updateAllWaiting: 'Waiting for confirmation…',
      confirmGitTitle: '{count} plugin(s) have new Git commits but no new version number',
      confirmGitBody: 'These plugins only received commits on their branch. Updating removes them and reinstalls that commit, and tries to restore the previous commit when that fails. Update them too?',
      confirmGitAll: 'Update all',
      confirmGitSkip: 'Skip these plugins',
      confirmGitCancel: 'Cancel',
      updateFailed: 'Update failed',
      updatingTo: 'Updating to {version}…',
      versionsTitle: 'Versions of {name}',
      versionsInstalled: 'Installed v{version}',
      versionsEmpty: 'No newer version can be installed',
      versionsOmitted: '{count} more newer versions are not listed',
      versionsFailed: 'Could not read the version list',
      tagLatest: 'latest',
      tagPrerelease: 'prerelease',
      tagDeprecated: 'deprecated',
      tagNeedsDsh: 'needs a newer DSH',
      reasonUpToDate: 'Already up to date',
      reasonNotUpdatable: 'Not installed from npm; cannot check',
      reasonGit: 'Installed from Git: the Host only updates registry installs; update it in the market',
      reasonLinked: 'Linked from disk; update it at its source',
      reasonBundled: 'Updated together with DSH',
      gitTag: 'Git commit',
      badgeLatest: 'Latest',
      badgeUpdatable: 'Update available',
      uninstall: 'Uninstall',
      uninstallConfirm: 'Confirm',
      uninstalling: 'Uninstalling…',
      uninstallTitle: 'Uninstall {name}',
      uninstallHint: 'Click again to uninstall {name}: it is removed from this profile.',
      uninstallBlocked: 'Cannot uninstall here: {reason}',
      uninstallReasonManaged: 'managed by DSH and cannot be removed',
      uninstallReasonUnaddressable: 'this entry has no patch location to save',
      uninstallFailed: 'Uninstall failed: {reason}',
      badgeNeedsDsh: 'Update available, newest version needs a newer DSH',
      gitBehind: 'New commit {sha}',
      gitLatest: 'Git source ({ref}) is up to date ({sha})',
      gitCheckFailed: 'Git check failed: {reason}',
      gitUpdateConfirm: 'Click again to update to {sha}',
      gitUpdateHint: 'A Git update removes the package and installs that commit; the previous commit is installed again when it fails.',
      gitUpdating: 'Updating from Git…',
      gitUpdated: 'Updated from Git to {sha}',
      sourceDefault: 'Default registry',
      updateCountAll: '{total} plugin(s) can be updated ({git} of them via Git commits)',
      updateCountNone: 'All plugins are up to date',
      gitCountHint: 'Git-installed plugins are compared by commit and may keep their version; they are included in this total and in Update all.',
      gitUnavailable: 'The Git extension is not loaded yet; restart DSH',
      updateAfterCheck: 'Click to check this plugin first, then update when one is offered',
      updateAllCheckFirst: 'Checks every plugin first, then installs what is offered',
      reasonNeedsDsh: '{version} needs a newer DSH: it requires {peers}',
      reasonUnchecked: 'Not checked yet',
      reasonCheckFailed: 'Check failed: {reason}',
      reasonUpdateFailed: 'Update failed: {reason}',
    };

    /**
     * Stylesheet for the injected controls. The Plugins page exposes no
     * per-row action slot, so these live inside its own rows and must look
     * like the page's: theme tokens only, host button metrics.
     */
    const STYLES = String.raw`
.qu-inline-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  margin-inline-start: 10px;
}
.qu-split {
  display: inline-flex;
  align-items: center;
}
.qu-inline-button {
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
  flex: none;
  height: 28px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 26px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.qu-split .qu-inline-button:first-child {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}
.qu-split .qu-arrow {
  padding: 0 5px;
  border-inline-start-width: 0;
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}
[data-plugin-toolbar] .qu-inline-button {
  margin-inline-start: 0;
}
.qu-inline-button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
}
.qu-inline-button:active:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-active, rgba(127, 127, 127, 0.16));
}
.qu-inline-button:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
.qu-inline-button:disabled {
  opacity: 0.5;
  cursor: default;
}
.qu-inline-button[data-tone='accent'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)) 38%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)) 12%, transparent);
  color: var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
  font-weight: 500;
}
.qu-inline-button[data-tone='accent']:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)) 20%, transparent);
}
.qu-inline-button[data-tone='danger'][data-armed='yes'] {
  border-color: var(--dsw-alias-state-error-primary);
  background: var(--dsw-alias-state-error-primary);
  color: #fff;
  font-weight: 500;
}
.qu-inline-button[data-tone='danger'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);
  color: var(--dsw-alias-state-error-primary);
}
.qu-inline-button[data-tone='success'] {
  border-color: transparent;
  background: transparent;
  color: var(--dsw-alias-state-success-primary);
  opacity: 1;
  padding: 0 6px;
}
.qu-status-tag {
  flex: none;
  max-width: 340px;
  overflow: hidden;
  padding: 0 6px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qu-status-tag[data-tone='info'] {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)) 14%, transparent);
  color: var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
}
.qu-status-tag[data-tone='warn'] {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);
  color: var(--dsw-alias-state-warn-primary);
}
.qu-version-chip {
  flex: none;
  margin-inline-start: 6px;
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}
.qu-menu {
  position: fixed;
  z-index: 2147483000;
  box-sizing: border-box;
  min-width: 300px;
  max-width: 420px;
  max-height: 340px;
  overflow: auto;
  padding: 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-1));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.qu-menu-head {
  padding: 6px 8px;
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-size: 11px;
  line-height: 16px;
}
.qu-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);
}
.qu-confirm {
  box-sizing: border-box;
  width: min(460px, calc(100vw - 48px));
  padding: 18px 20px 16px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-1));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
  color: var(--dsw-alias-label-primary);
}
.qu-confirm-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}
.qu-confirm-body {
  margin: 0 0 16px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.qu-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.qu-updates-note {
  color: var(--dsw-alias-state-business-primary, var(--dsw-alias-label-secondary));
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}
.qu-menu-note {
  padding: 6px 8px;
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-size: 11px;
  line-height: 16px;
}
.qu-menu-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.qu-menu-row:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
}
.qu-menu-row:disabled {
  opacity: 0.5;
  cursor: default;
}
.qu-menu-version {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.qu-menu-tag {
  padding: 0 6px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.qu-menu-date {
  margin-inline-start: auto;
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-size: 11px;
}
.qu-menu-source {
  margin-inline-start: 8px;
  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));
  font-size: 11px;
  white-space: nowrap;
}
.qu-menu-row[data-armed='yes'] {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary)) 14%, transparent);
}
.qu-placeholder {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 -8px;
  padding: 8px;
  border-radius: 12px;
}
.qu-placeholder-icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 0.5px solid var(--dsw-alias-border-l3, var(--dsw-alias-border-l2));
  border-radius: 10px;
}
.qu-placeholder-main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.qu-placeholder-title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qu-placeholder-note,
.qu-placeholder-badge {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
.qu-placeholder-badge {
  flex: none;
  white-space: nowrap;
}
.qu-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
  animation: qu-pulse 1s ease-in-out infinite;
}
@keyframes qu-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .qu-dot { animation: none; }
}
`;

    /** Flatten a thrown value into a message a control can carry. */
    function errorMessage(error) {
      if (error && typeof error.message === 'string' && error.message !== '') return error.message;
      return String(error);
    }

    return {
      name: 'dsh-quick-update',
      inject: ['locale', 'remote'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-quick-update: dictionaries');
        const t = ctx.locale.bind(NS);

        /* ---------------------------- state ------------------------------- */

        /** The page's own actions and store, once the React tree exposes them. */
        let bridge = null;
        /** 'page' drives the page's actions; 'direct' uses the Remote alone. */
        let mode = 'none';
        let ensured = false;
        let batch = null;
        let scheduled = null;
        let pagePresent = false;
        /** True while a confirmation dialog this plugin owns is mounted. */
        let dialogOpen = false;
        let refreshRunning = false;
        /** True once the plugin was unloaded; no late timer may repaint. */
        let disposed = false;
        /** True while this plugin clicks the page's refresh itself. */
        let programmaticRefresh = false;

        /** name -> { source, availability }: where each row's package came from. */
        const sources = new Map();
        /** Package names whose uninstall is running right now. */
        const removing = new Set();
        /** name -> reason: the last uninstall that failed. */
        const removeErrors = new Map();
        /** name -> timer: a row whose uninstall is armed for a second click. */
        const armedRemove = new Map();

        /** name -> Git source check: its commits, or why the lookup failed. */
        const gitChecks = new Map();

        /** Direct-mode data: what our own Remote reads found. */
        const checks = new Map();
        const inflight = new Set();
        const failures = new Map();
        const finished = new Map();
        /** name -> installed version, for the chip beside the title. */
        const installed = new Map();
        /** name -> { title, target, nextName }: rows an update temporarily removes. */
        const pending = new Map();

        /** The Host namespace handle, captured by the inject path below. */
        let manager = null;
        const pluginManager = () => {
          if (manager === null) throw new Error('pluginManager remote is not injected yet');
          return manager;
        };

        const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

        const pageState = () => {
          if (bridge === null || bridge.store === null) return null;
          try {
            return typeof bridge.store.getSnapshot === 'function' ? bridge.store.getSnapshot() : null;
          } catch (_error) {
            return null;
          }
        };

        /* ------------------------- the page's own face -------------------- */

        /**
         * The page hands its actions to the slot root as `slotInjected`, and
         * its page component receives `actions`; accept either shape.
         *
         * @param props - one fiber's memoized props.
         * @returns the page actions and store, or null.
         */
        const pickFace = (props) => {
          if (props === null || typeof props !== 'object') return null;
          const injected = props.slotInjected;
          const inner = injected !== null && typeof injected === 'object' ? injected.props : null;
          for (const candidate of [inner, injected, props.actions, props]) {
            if (candidate === null || typeof candidate !== 'object') continue;
            if (typeof candidate.checkVersions !== 'function') continue;
            if (typeof candidate.ensureVersions !== 'function') continue;
            if (typeof candidate.openUpdate !== 'function') continue;
            if (typeof candidate.runUpdate !== 'function') continue;
            const hooks = candidate.hooks;
            const store = hooks && hooks.pluginManager ? hooks.pluginManager : null;
            if (store === null || typeof store.getSnapshot !== 'function') continue;
            return { actions: candidate, store };
          }
          return null;
        };

        /**
         * Walk up from a rendered Plugins node to the component carrying the
         * page's actions. A store is required: without its snapshot the row
         * states cannot be honest, and the Remote path is used instead.
         *
         * @returns { actions, store } or null.
         */
        const findBridge = () => {
          const anchor = document.querySelector('[data-plugin-toolbar]')
            || document.querySelector('li[data-plugin-package]');
          if (anchor === null) return null;
          const key = Object.keys(anchor).find((name) => name.startsWith('__reactFiber$'));
          if (key === undefined) return null;
          let fiber = anchor[key];
          for (let depth = 0; fiber && depth < 100; depth += 1) {
            const found = pickFace(fiber.memoizedProps);
            if (found !== null) return found;
            fiber = fiber.return;
          }
          return null;
        };

        /* --------------------------- page geometry ------------------------ */

        /** Installed bundles the page lists in its own 已安装插件 group. */
        const bundlesGroup = () => document.querySelector('[data-plugin-group="bundles"]');
        const bundleRows = () => Array.from(document.querySelectorAll(
          '[data-plugin-group="bundles"] li[data-plugin-package]',
        ));
        const rowNames = () => bundleRows()
          .map((row) => row.getAttribute('data-plugin-package'))
          .filter((name) => name !== null && name !== '');

        /** The head, main column, title row and title control of one row. */
        const rowParts = (row) => {
          const head = row.firstElementChild;
          if (head === null) return null;
          const main = head.children.length > 1 ? head.children[1] : null;
          const titleRow = main === null ? null : main.firstElementChild;
          const title = titleRow === null ? null : titleRow.firstElementChild;
          const end = head.lastElementChild;
          return {
            head,
            titleRow,
            title,
            end: end !== null && end !== head && end.querySelector('[role="switch"]') !== null ? end : null,
          };
        };

        /* ---------------------------- readings ---------------------------- */

        const installable = (version) => version !== null && typeof version === 'object'
          && version.bundle === true
          && version.incompatible === void 0;

        const updateCandidate = (list) => {
          if (!list || list.status !== 'listed' || !Array.isArray(list.versions)) return void 0;
          for (const version of list.versions) {
            if (installable(version) && version.deprecated === void 0 && version.prerelease !== true) return version;
          }
          return void 0;
        };

        /**
         * The newest newer version that only this DSH version blocks, so a row
         * can explain itself instead of claiming to be current.
         *
         * @param list - the Host's version list.
         * @returns that version, or undefined when none is blocked this way.
         */
        const blockedCandidate = (list) => {
          if (!list || list.status !== 'listed' || !Array.isArray(list.versions)) return void 0;
          for (const version of list.versions) {
            if (version.bundle === true
              && version.deprecated === void 0
              && version.prerelease !== true
              && version.incompatible !== void 0) return version;
          }
          return void 0;
        };

        /** Render the requirements of a version this DSH cannot run. */
        const requirementsText = (version) => {
          const requirements = version && version.incompatible ? version.incompatible.requirements : void 0;
          if (requirements === null || typeof requirements !== 'object') return '';
          return Object.entries(requirements).map(([name, range]) => `${name} ${range}`).join(', ');
        };

        const newRequestId = () => {
          const api = typeof crypto !== 'undefined' ? crypto : void 0;
          if (api && typeof api.randomUUID === 'function') return api.randomUUID();
          return `quick-update-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        };

        /** The version the page currently has on disk for one plugin. */
        const installedVersion = (name) => {
          if (mode === 'page') {
            const state = pageState();
            const pkg = state && Array.isArray(state.packages)
              ? state.packages.find((item) => item.name === name)
              : void 0;
            if (pkg && typeof pkg.version === 'string') return pkg.version;
          }
          return installed.get(name);
        };

        /** The page's own version check for one plugin, when it has run. */
        const pageVersion = (name) => {
          const state = pageState();
          if (state === null) return void 0;
          const versions = state.versions || {};
          return versions[name];
        };

        /**
         * One row's state, in the shape the controls render.
         *
         * @param name - the installed package name.
         * @returns phase, offered version, reason, and the completion mark.
         */
        const recordOf = (name) => {
          if (pending.has(name)) return { phase: 'updating' };
          if (isGitSource(name)) {
            const check = gitChecks.get(name);
            if (check === undefined) return { phase: 'blocked', reason: t('reasonGit') };
            if (check.phase === 'checking') return { phase: 'checking' };
            if (check.phase === 'error') return { phase: 'failed', reason: t('gitCheckFailed', { reason: check.message }) };
            const facts = check.facts;
            if (facts.behind === true) return { phase: 'git', version: shortCommit(facts.remoteCommit), facts };
            return { phase: 'latest', git: true, facts };
          }
          if (mode === 'page') {
            const state = pageState();
            if (state === null) return { phase: 'loading' };
            for (const pkg of state.packages || []) {
              if (pkg && pkg.name) {
                sources.set(pkg.name, {
                  source: pkg.source,
                  availability: pkg.availability,
                  removable: pkg.removable === true,
                  readOnlyReason: pkg.readOnlyReason,
                  official: pkg.official === true,
                });
              }
            }
            const update = state.update || null;
            if (update !== null && update.packageName === name) {
              if (update.phase === 'running') return { phase: 'updating' };
              if (update.phase === 'confirm') {
                const target = updateCandidate(pageVersion(name) && pageVersion(name).list);
                return { phase: 'candidate', version: target ? target.version : update.to };
              }
              if (update.phase === 'done') {
                const applied = update.result
                  && (update.result.application === 'applied' || update.result.application === 'restart-required');
                if (applied) return { phase: 'done', restart: update.result.application === 'restart-required' };
                return { phase: 'failure', reason: update.lost || t('updateFailed') };
              }
            }
            if (batch !== null && batch.current === name && batch.phase === 'apply') return { phase: 'updating' };
            const version = pageVersion(name);
            if (!version) return { phase: 'unchecked' };
            if (version.phase === 'checking') return { phase: 'checking' };
            if (version.phase === 'error') return { phase: 'failed', reason: version.message || t('updateFailed') };
            if (!version.list || version.list.status !== 'listed') {
              return { phase: 'blocked', reason: refusedReason(name) };
            }
            const candidate = updateCandidate(version.list);
            if (candidate !== void 0) return { phase: 'candidate', version: candidate.version };
            const blocked = blockedCandidate(version.list);
            if (blocked !== void 0) {
              return { phase: 'needsDsh', version: blocked.version, peers: requirementsText(blocked) };
            }
            return { phase: 'latest' };
          }
          const check = checks.get(name);
          if (inflight.has(name)) return { phase: 'updating' };
          if (check === undefined) return { phase: 'unchecked' };
          if (check.phase === 'checking') return { phase: 'checking' };
          if (check.phase === 'error') return { phase: 'failed', reason: check.message || t('updateFailed') };
          const candidate = check.phase === 'done' ? updateCandidate(check.list) : void 0;
          if (candidate !== void 0) return { phase: 'candidate', version: candidate.version };
          const failure = failures.get(name);
          if (failure !== undefined) return { phase: 'failure', reason: failure };
          const done = finished.get(name);
          if (done !== undefined) return { phase: 'done', restart: done.restart === true };
          if (check.phase === 'done' && check.list && check.list.status !== 'listed') {
            return { phase: 'blocked', reason: refusedReason(name) };
          }
          const blocked = check.phase === 'done' ? blockedCandidate(check.list) : void 0;
          if (blocked !== void 0) {
            return { phase: 'needsDsh', version: blocked.version, peers: requirementsText(blocked) };
          }
          return { phase: 'latest' };
        };

        /**
         * Why the Host will not offer a version for one row.
         *
         * @param name - the installed package name.
         * @returns the row's own explanation of where it came from.
         */
        const refusedReason = (name) => {
          const facts = sources.get(name);
          const source = facts && typeof facts.source === 'string' ? facts.source : '';
          if (facts && facts.availability === 'installation') return t('reasonBundled');
          if (/^(git|github:|https?:|ssh:)/.test(source)) return t('reasonGit');
          if (source.startsWith('link:') || source.startsWith('file:')) return t('reasonLinked');
          return t('reasonNotUpdatable');
        };

        /** Whether the Host lets this row's bundle be removed from the profile. */
        const canUninstall = (name) => {
          const facts = sources.get(name);
          return facts !== undefined && facts.removable === true && facts.readOnlyReason === void 0;
        };

        /** Why this row cannot be uninstalled, in the row's own words. */
        const uninstallBlockedReason = (name) => {
          const facts = sources.get(name);
          if (facts === undefined) return t('reasonUnchecked');
          if (facts.readOnlyReason === 'management-required') return t('uninstallReasonManaged');
          if (facts.readOnlyReason === 'unaddressable') return t('uninstallReasonUnaddressable');
          return t('uninstallReasonManaged');
        };

        /**
         * Remove one bundle through the Host's own removal path — the same
         * `removeBundle` the shipped detail page calls — after the row's
         * second click.
         *
         * @param name - the installed package name.
         */
        const uninstallRow = async (name) => {
          if (!canUninstall(name) || removing.has(name)) return;
          removeErrors.delete(name);
          removing.add(name);
          paint();
          try {
            const answer = await pluginManager().removeBundle(name);
            const failed = !answer || answer.application === 'failed' || answer.changed === false;
            if (!failed) {
              clickRefresh();
              return;
            }
            const error = answer && answer.error ? answer.error : void 0;
            removeErrors.set(name, (error && (error.diagnostic || error.code)) || t('updateFailed'));
          } catch (error) {
            removeErrors.set(name, errorMessage(error));
          } finally {
            removing.delete(name);
            paint();
          }
        };

        /** Arm one row's uninstall until the second click or a short timeout. */
        const armUninstall = (name) => {
          const existing = armedRemove.get(name);
          if (existing !== void 0) {
            clearTimeout(existing);
          }
          armedRemove.set(name, setTimeout(() => {
            armedRemove.delete(name);
            paint();
          }, 4000));
          paint();
        };

        const GIT_SOURCE_RE = /^(?:git\+|github:|gitlab:|bitbucket:|git@|ssh:)/;

        /** Whether one row's package was installed from a Git repository. */
        const isGitSource = (name) => {
          const facts = sources.get(name);
          const source = facts && typeof facts.source === 'string' ? facts.source : '';
          return GIT_SOURCE_RE.test(source) || /^https?:\/\/.+\.git(?:#.*)?$/.test(source);
        };

        /** The short form of a commit hash. */
        const shortCommit = (commit) => (typeof commit === 'string' ? commit.slice(0, 7) : '');

        /** One read-only request for a Git row's commits. */
        const requestGit = async (name) => {
          try {
            const response = await fetch(`/dsh-quick-update/api/git?name=${encodeURIComponent(name)}`, {
              credentials: 'same-origin',
              headers: { accept: 'application/json' },
            });
            if (!response.ok) return { ok: false, error: response.status === 404 ? t('gitUnavailable') : `HTTP ${response.status}` };
            return await response.json();
          } catch (error) {
            return { ok: false, error: errorMessage(error) };
          }
        };

        /** Ask the Host whether this Git dependency has newer commits (one retry for a flaky remote). */
        const checkGit = async (name) => {
          gitChecks.set(name, { phase: 'checking' });
          paint();
          let answer = await requestGit(name);
          if (!answer || answer.ok !== true) {
            await sleep(700);
            answer = await requestGit(name);
          }
          if (!answer || answer.ok !== true) {
            gitChecks.set(name, { phase: 'error', message: (answer && answer.error) || 'git check failed' });
          } else {
            gitChecks.set(name, { phase: 'done', facts: answer });
          }
          paint();
          return answer;
        };

        /**
         * Replace one Git-installed plugin with the remote commit, through the
         * Host's own remove-and-install path with a rollback.
         *
         * @param name - the installed package name.
         * @returns whether the Host changed anything.
         */
        const updateGit = async (name, options) => {
          const check = gitChecks.get(name);
          const facts = check && check.phase === 'done' ? check.facts : null;
          if (facts === null) return { ok: false, reason: t('reasonUnchecked') };
          beginPending(name, shortCommit(facts.remoteCommit));
          paint();
          let answer = null;
          try {
            const response = await fetch('/dsh-quick-update/api/git-update', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name }),
            });
            if (!response.ok) {
              answer = { ok: false, error: response.status === 404 ? t('gitUnavailable') : `HTTP ${response.status}` };
            } else {
              answer = await response.json();
            }
          } catch (error) {
            answer = { ok: false, error: errorMessage(error) };
          } finally {
            pending.delete(name);
            paint();
          }
          if (answer && answer.ok === true) {
            gitChecks.delete(name);
            if (!options || options.refresh !== false) clickRefresh();
            await checkGit(name);
            return { ok: true };
          }
          gitChecks.set(name, { phase: 'error', message: (answer && answer.error) || t('updateFailed') });
          paint();
          return { ok: false, reason: (answer && answer.error) || t('updateFailed') };
        };

        /** What is already known about one row's versions. */
        const knownListing = (name) => {
          if (mode === 'page') {
            const version = pageVersion(name);
            if (!version) return { phase: 'unknown' };
            if (version.phase === 'checking') return { phase: 'checking' };
            if (version.phase === 'error') return { phase: 'error', message: version.message };
            return version.list ? { phase: 'ready', list: version.list } : { phase: 'unknown' };
          }
          const check = checks.get(name);
          if (check === void 0) return { phase: 'unknown' };
          if (check.phase === 'checking') return { phase: 'checking' };
          if (check.phase === 'error') return { phase: 'error', message: check.message };
          return check.list ? { phase: 'ready', list: check.list } : { phase: 'unknown' };
        };

        /** Wait until one row leaves the checking phase, bounded. */
        const waitChecked = async (name, timeoutMs) => {
          const deadline = Date.now() + (timeoutMs === void 0 ? 45000 : timeoutMs);
          while (Date.now() < deadline) {
            if (knownListing(name).phase !== 'checking') return;
            await sleep(300);
          }
        };

        /**
         * Check one plugin on demand, then update it when the check offered a
         * version. This is what a row's 更新 button does before anything is
         * known about that plugin.
         *
         * @param name - the installed package name.
         */
        const checkThenUpdate = async (name) => {
          if (mode === 'page' && bridge !== null) {
            try {
              bridge.actions.checkVersions(name);
            } catch (_error) {
              /* the row keeps its state */
            }
            await waitChecked(name);
          } else {
            await checkDirect(name);
          }
          if (recordOf(name).phase === 'candidate') await updateRow(name);
          paint();
        };

        /** The Git commit a row would update to, when it has one. */
        const gitCandidateOf = (name) => {
          const record = recordOf(name);
          return record.phase === 'git' ? record.version : void 0;
        };

        /** Whether a row offers any update, registry version or Git commit. */
        const isUpdatable = (name) => candidateOf(name) !== undefined || gitCandidateOf(name) !== void 0;

        const candidateOf = (name) => {
          const record = recordOf(name);
          return record.phase === 'candidate' ? record.version : void 0;
        };

        /* ------------------------- direct-mode reads ---------------------- */

        const readBundles = async () => {
          const answer = await pluginManager().listBundles();
          if (!answer || answer.ok !== true) {
            const error = answer && answer.error ? answer.error : void 0;
            throw new Error((error && error.message) || 'listBundles failed');
          }
          return answer.value || [];
        };

        const rememberInstalled = (packages) => {
          for (const pkg of packages) {
            if (!pkg || pkg.installed !== true) continue;
            if (typeof pkg.version === 'string') installed.set(pkg.name, pkg.version);
            sources.set(pkg.name, {
              source: pkg.source,
              availability: pkg.availability,
              removable: pkg.removable === true,
              readOnlyReason: pkg.readOnlyReason,
              official: pkg.official === true,
            });
          }
        };

        const readVersions = async (name) => {
          const answer = await pluginManager().listVersions(name, {});
          if (!answer || answer.ok !== true) {
            const error = answer && answer.error ? answer.error : void 0;
            return { phase: 'error', message: (error && (error.diagnostic || error.message)) || 'listVersions failed' };
          }
          return { phase: 'done', list: answer.value };
        };

        const checkDirect = async (name) => {
          checks.set(name, { phase: 'checking' });
          paint();
          const next = await readVersions(name);
          checks.set(name, next);
          if (next.phase === 'done') failures.delete(name);
          paint();
          return next;
        };

        const checkAllDirect = async (names) => {
          try {
            rememberInstalled(await readBundles());
          } catch (_error) {
            /* the chip keeps its last reading */
          }
          for (const name of names) {
            if (isGitSource(name)) await checkGit(name);
            else await checkDirect(name);
          }
          paint();
        };

        const updateDirect = async (name, version) => {
          const check = checks.get(name);
          const candidate = version !== void 0
            ? { version }
            : check && check.phase === 'done' ? updateCandidate(check.list) : void 0;
          if (candidate === void 0 || inflight.has(name)) return { ok: false, reason: t('reasonUpToDate') };
          const registry = check && check.list && typeof check.list.registry === 'string' ? check.list.registry : void 0;
          inflight.add(name);
          failures.delete(name);
          paint();
          const options = { requestId: newRequestId() };
          if (typeof registry === 'string' && registry !== '') options.registry = registry;
          let outcome;
          try {
            const answer = await pluginManager().updateBundle(name, candidate.version, options);
            if (answer && answer.ok === true && answer.value) {
              const result = answer.value.result || {};
              if (result.application === 'applied' || result.application === 'restart-required') {
                finished.set(name, { restart: result.application === 'restart-required' });
                checks.delete(name);
                outcome = { ok: true, restart: result.application === 'restart-required' };
              } else {
                const error = result.error;
                outcome = { ok: false, reason: (error && (error.diagnostic || error.code)) || t('updateFailed') };
              }
            } else {
              const error = answer && answer.error ? answer.error : void 0;
              outcome = { ok: false, reason: (error && (error.diagnostic || error.message)) || t('updateFailed') };
            }
          } catch (error) {
            outcome = { ok: false, reason: errorMessage(error) };
          }
          inflight.delete(name);
          if (!outcome.ok) failures.set(name, outcome.reason);
          paint();
          if (outcome.ok) {
            clickRefresh();
            try {
              rememberInstalled(await readBundles());
            } catch (_error) {
              /* ignore */
            }
            await checkDirect(name);
          }
          return outcome;
        };

        /* --------------------- page-mode check and update ----------------- */

        const checkRow = (name) => {
          if (isGitSource(name)) {
            void checkGit(name);
            return;
          }
          if (mode === 'page' && bridge !== null) {
            try {
              bridge.actions.checkVersions(name);
            } catch (_error) {
              /* fall through to the direct check */
            }
          } else {
            void checkDirect(name);
          }
          paint();
        };

        /**
         * Ask the page to open and run one update, waiting until its check has
         * produced the requested target.
         *
         * @param name - the installed package name.
         * @param version - an exact version, or undefined for the offered one.
         * @returns the outcome the batch and the menu report.
         */
        /** Close the page's update dialog when it is no longer running. */
        const closePageUpdate = () => {
          if (bridge === null || typeof bridge.actions.closeUpdate !== 'function') return;
          try {
            bridge.actions.closeUpdate();
          } catch (_error) {
            /* the page may have moved on */
          }
        };

        const pageUpdateInner = async (name, version) => {
          try {
            bridge.actions.ensureVersions(name);
          } catch (_error) {
            /* the wait below reports the failure */
          }
          const deadline = Date.now() + 90000;
          while (Date.now() < deadline) {
            const state = pageState();
            if (state === null) break;
            const running = state.update;
            if (running !== null && running.packageName === name) {
              if (running.phase === 'done') {
                const applied = running.result
                  && (running.result.application === 'applied' || running.result.application === 'restart-required');
                return {
                  ok: applied === true,
                  reason: running.lost || '',
                  restart: applied === true && running.result.application === 'restart-required',
                };
              }
              if (running.phase === 'running') {
                await sleep(500);
                continue;
              }
              break;
            }
            const current = pageVersion(name);
            if (current && current.phase === 'checking') {
              await sleep(400);
              continue;
            }
            if (current && current.phase === 'done' && current.list && current.list.status === 'listed') {
              const chosen = version !== void 0
                ? version
                : (updateCandidate(current.list) || {}).version;
              if (chosen === undefined) return { ok: false, reason: t('reasonUpToDate') };
              try {
                bridge.actions.ensureVersions(name);
                bridge.actions.openUpdate(name, chosen);
                bridge.actions.runUpdate();
              } catch (error) {
                return { ok: false, reason: errorMessage(error) };
              }
              await sleep(1200);
              continue;
            }
            await sleep(400);
          }
          const last = pageState();
          const finishedUpdate = last && last.update;
          if (finishedUpdate && finishedUpdate.packageName === name && finishedUpdate.phase === 'done') {
            const applied = finishedUpdate.result
              && (finishedUpdate.result.application === 'applied' || finishedUpdate.result.application === 'restart-required');
            return { ok: applied === true, reason: finishedUpdate.lost || '' };
          }
          return { ok: false, reason: t('updateFailed') };
        };

        /**
         * Update one plugin through the page's own dialog. The dialog is a
         * modal whose backdrop blurs the page, so it is closed as soon as the
         * update settles — otherwise the page stays masked.
         *
         * @param name - the installed package name.
         * @param version - the exact version chosen.
         * @returns the outcome.
         */
        const pageUpdate = async (name, version) => {
          closePageUpdate();
          try {
            return await pageUpdateInner(name, version);
          } finally {
            closePageUpdate();
          }
        };

        /**
         * Update one plugin, keeping a placeholder in the list while the Host
         * removes and reinstalls it.
         *
         * @param name - the installed package name.
         * @param version - an exact version chosen from the menu, or undefined.
         * @returns the outcome.
         */
        const updateRow = async (name, version) => {
          const target = version !== void 0 ? version : candidateOf(name);
          if (target === undefined) return { ok: false, reason: t('reasonUpToDate') };
          beginPending(name, target);
          try {
            if (mode === 'page' && bridge !== null) return await pageUpdate(name, target);
            return await updateDirect(name, target);
          } finally {
            pending.delete(name);
            paint();
          }
        };

        /**
         * Whether a row's update state is already known, so a batch reuses the
         * result on screen instead of asking the registry again.
         *
         * @param name - the installed package name.
         * @returns true once that row's check has settled, failed or not.
         */
        const settled = (name) => {
          if (isGitSource(name)) {
            const git = gitChecks.get(name);
            return git !== undefined && git.phase !== 'checking';
          }
          if (mode === 'page') {
            const version = pageVersion(name);
            return version !== undefined && version.phase !== 'checking';
          }
          const check = checks.get(name);
          return check !== undefined && check.phase !== 'checking';
        };

        const runBatch = async () => {
          if (batch !== null) return;
          const names = rowNames();
          const unknown = names.filter((name) => !isGitSource(name) && !settled(name));
          const gitUnknown = names.filter((name) => isGitSource(name) && !settled(name));
          batch = {
            phase: unknown.length > 0 || gitUnknown.length > 0 ? 'checking' : 'apply',
            done: 0,
            total: names.length,
            current: null,
            name: '',
          };
          paint();
          if (unknown.length > 0) {
            if (mode === 'page' && bridge !== null) {
              for (const name of unknown) {
                try {
                  bridge.actions.ensureVersions(name);
                } catch (_error) {
                  /* one package */
                }
              }
              const deadline = Date.now() + 90000;
              while (Date.now() < deadline) {
                const state = pageState();
                if (state === null) break;
                const busy = state.busy || [];
                const waiting = unknown.some((name) => {
                  const version = pageVersion(name);
                  return version === undefined || version.phase === 'checking';
                });
                if (!waiting && busy.length === 0) break;
                await sleep(400);
              }
            } else {
              for (const name of unknown) await checkDirect(name);
            }
          }
          for (const name of gitUnknown) {
            if (batch === null) return;
            await checkGit(name);
          }
          if (batch === null) return;
          const targets = rowNames().filter(isUpdatable);
          if (targets.length === 0) {
            batch = null;
            paint();
            return;
          }
          const gitTargets = targets.filter((name) => gitCandidateOf(name) !== undefined);
          let chosen = targets;
          if (gitTargets.length > 0) {
            batch = { phase: 'confirm', done: 0, total: targets.length, current: null, name: '' };
            paint();
            const choice = await confirmDialog({
              title: t('confirmGitTitle', { count: String(gitTargets.length) }),
              body: t('confirmGitBody'),
              primary: t('confirmGitAll'),
              secondary: t('confirmGitSkip'),
            });
            if (choice === 'cancel') {
              batch = null;
              paint();
              return;
            }
            if (choice === 'secondary') {
              chosen = targets.filter((name) => gitCandidateOf(name) === undefined);
            }
            if (chosen.length === 0) {
              batch = null;
              paint();
              return;
            }
          }
          let completed = 0;
          let gitTouched = false;
          for (const name of chosen) {
            if (batch === null) return;
            batch = { phase: 'apply', done: completed, total: chosen.length, current: name, name };
            paint();
            const viaGit = gitCandidateOf(name) !== undefined;
            const outcome = viaGit
              ? await updateGit(name, { refresh: false })
              : await updateRow(name);
            if (batch === null) return;
            if (!outcome.ok) {
              batch = { phase: 'failed', done: completed, total: chosen.length, current: null, name, reason: outcome.reason };
              paint();
              return;
            }
            if (viaGit) gitTouched = true;
            completed += 1;
            batch = { phase: 'apply', done: completed, total: chosen.length, current: null, name: '' };
            paint();
          }
          batch = null;
          if (gitTouched) clickRefresh();
          paint();
        };

        /* -------------------------- version menu -------------------------- */

        let menu = null;

        const closeMenu = () => {
          if (menu === null) return;
          menu.element.remove();
          document.removeEventListener('mousedown', menu.onOutside, true);
          document.removeEventListener('keydown', menu.onKey, true);
          window.removeEventListener('resize', closeMenu, true);
          window.removeEventListener('scroll', closeMenu, true);
          menu = null;
        };

        const menuRow = (version, sourceText) => {
          const row = document.createElement('button');
          row.type = 'button';
          row.className = 'qu-menu-row';
          row.setAttribute('data-quick-update-version-row', version.version);
          const label = document.createElement('span');
          label.className = 'qu-menu-version';
          label.textContent = version.version;
          row.append(label);
          const tags = [];
          if (Array.isArray(version.tags) && version.tags.includes('latest')) tags.push(t('tagLatest'));
          if (version.prerelease === true) tags.push(t('tagPrerelease'));
          if (version.deprecated !== void 0) tags.push(t('tagDeprecated'));
          if (version.incompatible !== void 0) tags.push(t('tagNeedsDsh'));
          for (const text of tags) {
            const tag = document.createElement('span');
            tag.className = 'qu-menu-tag';
            tag.textContent = text;
            row.append(tag);
          }
          if (typeof version.publishedAt === 'string' && version.publishedAt !== '') {
            const date = document.createElement('span');
            date.className = 'qu-menu-date';
            date.textContent = version.publishedAt.slice(0, 10);
            row.append(date);
          }
          if (typeof sourceText === 'string' && sourceText !== '') {
            const source = document.createElement('span');
            source.className = 'qu-menu-source';
            source.textContent = sourceText;
            row.append(source);
          }
          row.disabled = version.incompatible !== void 0;
          return row;
        };

        /** The menu's label for where a version comes from. */
        const registryLabel = (registry) => {
          if (typeof registry !== 'string' || registry === '') return t('sourceDefault');
          try {
            return new URL(registry).host;
          } catch (_error) {
            return registry;
          }
        };

        /**
         * Fill the popover for a Git-installed plugin: the remote commit it
         * tracks, behind an explicit second click, plus where it comes from.
         *
         * @param name - the installed package name.
         * @param element - the popover element.
         * @param body - the placeholder body to replace.
         */
        const fillGitMenu = async (name, element, body) => {
          const cached = gitChecks.get(name);
          const answer = cached !== undefined && cached.phase === 'done'
            ? { ok: true, ...cached.facts }
            : await checkGit(name);
          if (menu === null || menu.name !== name) return;
          body.remove();
          const note = (text) => {
            const node = document.createElement('div');
            node.className = 'qu-menu-note';
            node.textContent = text;
            element.append(node);
            return node;
          };
          if (!answer || answer.ok !== true) {
            note(t('gitCheckFailed', { reason: (answer && answer.error) || 'git check failed' }));
            return;
          }
          if (answer.behind !== true) {
            note(t('gitLatest', { ref: answer.ref, sha: shortCommit(answer.remoteCommit) }));
            if (answer.label) note(answer.label);
            return;
          }
          const row = document.createElement('button');
          row.type = 'button';
          row.className = 'qu-menu-row';
          row.setAttribute('data-quick-update-git-row', name);
          const version = document.createElement('span');
          version.className = 'qu-menu-version';
          version.textContent = t('gitBehind', { sha: shortCommit(answer.remoteCommit) });
          row.append(version);
          const tag = document.createElement('span');
          tag.className = 'qu-menu-tag';
          tag.textContent = t('gitTag');
          row.append(tag);
          if (answer.label) {
            const source = document.createElement('span');
            source.className = 'qu-menu-source';
            source.textContent = answer.label;
            row.append(source);
          }
          const hint = note(t('gitUpdateHint'));
          let armed = false;
          row.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!armed) {
              armed = true;
              row.setAttribute('data-armed', 'yes');
              hint.textContent = t('gitUpdateConfirm', { sha: shortCommit(answer.remoteCommit) });
              return;
            }
            closeMenu();
            const outcome = await updateGit(name);
            if (!outcome.ok) {
              // The row now carries the failure in its own tooltip.
              paint();
            }
          });
          element.append(row);
          if (answer.installedCommit) note(t('versionsInstalled', { version: shortCommit(answer.installedCommit) }));
        };

        /**
         * Open the version popover for one plugin, listing every published
         * version the Host can install, newest first.
         *
         * @param name - the installed package name.
         * @param anchor - the arrow control the popover hangs from.
         */
        const openVersionMenu = async (name, anchor) => {
          if (menu !== null && menu.name === name) {
            closeMenu();
            return;
          }
          closeMenu();
          const element = document.createElement('div');
          element.className = 'qu-menu';
          element.setAttribute('data-quick-update-menu', name);
          const head = document.createElement('div');
          head.className = 'qu-menu-head';
          head.textContent = t('versionsTitle', { name });
          element.append(head);
          const body = document.createElement('div');
          body.textContent = t('checking');
          body.className = 'qu-menu-note';
          element.append(body);
          const onOutside = (event) => {
            if (menu === null) return;
            if (menu.element.contains(event.target) || anchor.contains(event.target)) return;
            closeMenu();
          };
          const onKey = (event) => {
            if (event.key === 'Escape') closeMenu();
          };
          menu = { name, element, anchor, onOutside, onKey };
          document.body.appendChild(element);
          const rect = anchor.getBoundingClientRect();
          const width = element.offsetWidth || 320;
          const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
          const below = rect.bottom + 6;
          const height = element.offsetHeight || 200;
          element.style.left = `${left}px`;
          element.style.top = `${below + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : below}px`;
          document.addEventListener('mousedown', onOutside, true);
          document.addEventListener('keydown', onKey, true);
          window.addEventListener('resize', closeMenu, true);
          window.addEventListener('scroll', closeMenu, true);

          if (isGitSource(name)) {
            await fillGitMenu(name, element, body);
            return;
          }

          let known = knownListing(name);
          if (known.phase === 'unknown') {
            if (mode === 'page') checkRow(name);
            else await checkDirect(name);
            known = knownListing(name);
          }
          if (known.phase === 'checking') await waitChecked(name);
          if (menu === null || menu.name !== name) return;
          body.remove();
          known = knownListing(name);
          const listing = known.phase === 'ready' ? known.list : null;
          if (listing === null || listing.status !== 'listed') {
            const note = document.createElement('div');
            note.className = 'qu-menu-note';
            note.textContent = known.phase === 'error'
              ? t('reasonCheckFailed', { reason: known.message || t('updateFailed') })
              : listing === null ? t('versionsFailed') : refusedReason(name);
            element.append(note);
            return;
          }
          const list = document.createElement('div');
          const sourceText = registryLabel(listing.registry);
          for (const version of listing.versions || []) {
            const row = menuRow(version, sourceText);
            row.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              closeMenu();
              void updateRow(name, version.version);
            });
            list.append(row);
          }
          if (list.childElementCount === 0) {
            const note = document.createElement('div');
            note.className = 'qu-menu-note';
            note.textContent = t('versionsEmpty');
            element.append(note);
          } else {
            element.append(list);
          }
          const installedRow = document.createElement('div');
          installedRow.className = 'qu-menu-note';
          installedRow.textContent = `${t('versionsInstalled', { version: listing.installed })} · ${sourceText}`;
          element.append(installedRow);
          if (typeof listing.omitted === 'number' && listing.omitted > 0) {
            const omitted = document.createElement('div');
            omitted.className = 'qu-menu-note';
            omitted.textContent = t('versionsOmitted', { count: String(listing.omitted) });
            element.append(omitted);
          }
        };

        /* ------------------------ placeholder rows ------------------------ */

        /** Remember what a row looked like before the Host removes it. */
        const beginPending = (name, target) => {
          const row = bundleRows().find((item) => item.getAttribute('data-plugin-package') === name);
          const parts = row ? rowParts(row) : null;
          const title = parts && parts.title !== null ? parts.title.textContent : name;
          const next = row && row.nextElementSibling !== null
            ? row.nextElementSibling.getAttribute('data-plugin-package')
            : '';
          pending.set(name, { title, target, nextName: next || '' });
          paint();
        };

        const createPlaceholder = (name, info) => {
          const node = document.createElement('li');
          node.className = 'qu-placeholder';
          node.setAttribute('data-quick-update-placeholder', name);
          const icon = document.createElement('span');
          icon.className = 'qu-placeholder-icon';
          const dot = document.createElement('span');
          dot.className = 'qu-dot';
          icon.append(dot);
          const main = document.createElement('div');
          main.className = 'qu-placeholder-main';
          const title = document.createElement('span');
          title.className = 'qu-placeholder-title';
          const note = document.createElement('span');
          note.className = 'qu-placeholder-note';
          main.append(title, note);
          const badge = document.createElement('span');
          badge.className = 'qu-placeholder-badge';
          badge.textContent = t('updating');
          node.append(icon, main, badge);
          return node;
        };

        /** Keep a placeholder where an update temporarily removed its row. */
        const paintPlaceholders = () => {
          const group = bundlesGroup();
          if (group === null) return;
          const list = group.querySelector('ul');
          if (list === null) return;
          const present = new Set(rowNames());
          for (const [name, info] of pending) {
            const selector = `[data-quick-update-placeholder="${name}"]`;
            let node = list.querySelector(selector);
            if (present.has(name)) {
              if (node !== null) node.remove();
              continue;
            }
            if (node === null) {
              node = createPlaceholder(name, info);
              const before = info.nextName === ''
                ? null
                : list.querySelector(`li[data-plugin-package="${info.nextName}"]`);
              list.insertBefore(node, before);
            }
            const title = node.querySelector('.qu-placeholder-title');
            const note = node.querySelector('.qu-placeholder-note');
            const agent = node.querySelector('.qu-placeholder-badge');
            if (title !== null && title.textContent !== info.title) title.textContent = info.title;
            const text = t('updatingTo', { version: info.target });
            if (note !== null && note.textContent !== text) note.textContent = text;
            if (agent !== null && agent.textContent !== t('updating')) agent.textContent = t('updating');
          }
          for (const node of list.querySelectorAll('[data-quick-update-placeholder]')) {
            const name = node.getAttribute('data-quick-update-placeholder');
            if (name !== null && !pending.has(name)) node.remove();
          }
        };

        /* ----------------------------- painting --------------------------- */

        const setText = (element, text) => {
          if (element.textContent !== text) element.textContent = text;
        };
        const setAttr = (element, name, value) => {
          if (element.getAttribute(name) !== value) {
            if (value === null) element.removeAttribute(name);
            else element.setAttribute(name, value);
          }
        };
        const setDisabled = (element, disabled) => {
          if (element.disabled !== disabled) element.disabled = disabled;
        };

        /** The version chip beside a row's title. */
        const paintVersionChip = (row, name) => {
          const parts = rowParts(row);
          if (parts === null || parts.titleRow === null) return;
          const version = installedVersion(name);
          let chip = parts.titleRow.querySelector('[data-quick-update-version]');
          if (version === undefined || version === '') {
            if (chip !== null) chip.remove();
            return;
          }
          if (chip === null) {
            chip = document.createElement('span');
            chip.className = 'qu-version-chip';
            chip.setAttribute('data-quick-update-version', '');
            parts.titleRow.insertBefore(chip, parts.title === null ? null : parts.title.nextSibling);
          }
          setText(chip, `v${version}`);
        };

        /**
         * The check result beside the plugin name, in the same slot the page's
         * own 可更新 tag uses: 最新 once a check found nothing newer, and the
         * yellow note when the newer version needs a newer DSH.
         *
         * @param row - one installed row.
         * @param name - its package name.
         */
        const paintStatusTag = (row, name) => {
          const parts = rowParts(row);
          if (parts === null || parts.titleRow === null) return;
          const record = recordOf(name);
          const pageTag = parts.titleRow.querySelector('[class*="statusTag"]');
          const text = record.phase === 'latest'
            ? t('badgeLatest')
            : record.phase === 'needsDsh'
              ? t('badgeNeedsDsh')
              : (record.phase === 'candidate' || record.phase === 'git') && pageTag === null
                ? t('badgeUpdatable')
                : '';
          let tag = parts.titleRow.querySelector('[data-quick-update-badge]');
          if (text === '') {
            if (tag !== null) tag.remove();
            return;
          }
          if (tag === null) {
            tag = document.createElement('span');
            tag.className = 'qu-status-tag';
            tag.setAttribute('data-quick-update-badge', '');
            const chip = parts.titleRow.querySelector('[data-quick-update-version]');
            const anchor = chip !== null ? chip : parts.title;
            parts.titleRow.insertBefore(tag, anchor === null ? null : anchor.nextSibling);
          }
          setText(tag, text);
          setAttr(tag, 'data-tone', record.phase === 'needsDsh'
            ? 'warn'
            : record.phase === 'candidate' ? 'info' : 'muted');
        };

        /** The two controls of one row, created once and reused after. */
        const createRowActions = (end) => {
          const group = document.createElement('span');
          group.className = 'qu-inline-actions';
          group.setAttribute('data-quick-update-actions', '');
          const check = document.createElement('button');
          check.type = 'button';
          check.className = 'qu-inline-button';
          check.setAttribute('data-quick-update-action', 'check');
          check.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const name = check.getAttribute('data-quick-update-name');
            if (name === null || name === '' || batch !== null) return;
            const phase = recordOf(name).phase;
            if (phase === 'checking' || phase === 'updating') return;
            checkRow(name);
          });
          const split = document.createElement('span');
          split.className = 'qu-split';
          const update = document.createElement('button');
          update.type = 'button';
          update.className = 'qu-inline-button';
          update.setAttribute('data-quick-update-action', 'update');
          update.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const name = update.getAttribute('data-quick-update-name');
            if (name === null || name === '' || batch !== null) return;
            if (isGitSource(name)) {
              void openVersionMenu(name, update);
              return;
            }
            const phase = recordOf(name).phase;
            if (phase === 'candidate') {
              void updateRow(name);
              return;
            }
            if (phase === 'unchecked' || phase === 'failure' || phase === 'failed') {
              void checkThenUpdate(name);
            }
          });
          const arrow = document.createElement('button');
          arrow.type = 'button';
          arrow.className = 'qu-inline-button qu-arrow';
          arrow.setAttribute('data-quick-update-action', 'versions');
          arrow.textContent = '▾';
          arrow.title = t('versionsTitle', { name: '…' });
          arrow.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const name = arrow.getAttribute('data-quick-update-name');
            if (name !== null && name !== '' && batch === null) void openVersionMenu(name, arrow);
          });
          const uninstall = document.createElement('button');
          uninstall.type = 'button';
          uninstall.className = 'qu-inline-button';
          uninstall.setAttribute('data-quick-update-action', 'uninstall');
          uninstall.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const name = uninstall.getAttribute('data-quick-update-name');
            if (name === null || name === '' || batch !== null) return;
            if (!canUninstall(name) || removing.has(name)) return;
            if (!armedRemove.has(name)) {
              armUninstall(name);
              return;
            }
            const timer = armedRemove.get(name);
            if (timer !== void 0) clearTimeout(timer);
            armedRemove.delete(name);
            void uninstallRow(name);
          });
          split.append(update, arrow);
          group.append(check, split, uninstall);
          end.insertBefore(group, end.firstElementChild);
          return { group, check, update, arrow, uninstall };
        };

        const paintRow = (row) => {
          const name = row.getAttribute('data-plugin-package');
          if (name === null || name === '') return;
          const parts = rowParts(row);
          if (parts === null || parts.end === null) return;
          paintVersionChip(row, name);
          paintStatusTag(row, name);
          let nodes = parts.end.querySelector('[data-quick-update-actions]');
          if (nodes === null) {
            nodes = createRowActions(parts.end);
          } else {
            nodes = {
              check: nodes.querySelector('[data-quick-update-action="check"]'),
              update: nodes.querySelector('[data-quick-update-action="update"]'),
              arrow: nodes.querySelector('[data-quick-update-action="versions"]'),
              uninstall: nodes.querySelector('[data-quick-update-action="uninstall"]'),
            };
          }
          const { check, update, arrow, uninstall } = nodes;
          if (check === null || update === null || arrow === null || uninstall === void 0) return;
          for (const control of [check, update, arrow, uninstall]) {
            if (control === null || control === void 0) continue;
            if (control.getAttribute('data-quick-update-name') !== name) control.setAttribute('data-quick-update-name', name);
          }
          const record = recordOf(name);
          const busy = record.phase === 'updating';
          const blocked = batch !== null || mode === 'none';
          const version = installedVersion(name) || '';

          setText(check, record.phase === 'checking' ? t('checking') : t('check'));
          const checkTitle = record.phase === 'checking' ? t('checking') : t('checkNow');
          if (check.title !== checkTitle) check.title = checkTitle;
          setDisabled(check, busy || record.phase === 'checking' || blocked);
          setAttr(check, 'data-tone', null);

          const candidate = record.phase === 'candidate' || record.phase === 'git' ? record.version : void 0;
          setText(update, busy
            ? t('updating')
            : candidate !== void 0
              ? t('update')
              : record.phase === 'done'
                ? t(record.restart === true ? 'updatedRestart' : 'updated')
                : record.phase === 'failure'
                  ? t('retryUpdate')
                  : t('update'));
          const clickable = !busy && !blocked && (
            record.phase === 'candidate'
            || record.phase === 'git'
            || record.phase === 'unchecked'
            || record.phase === 'failure'
            || record.phase === 'failed'
          );
          let updateTitle = '';
          if (busy) updateTitle = t('updating');
          else if (record.phase === 'unchecked') updateTitle = t('updateAfterCheck');
          else if (record.phase === 'git') updateTitle = t('gitBehind', { sha: candidate });
          else if (candidate !== void 0) updateTitle = t('updateNow', { version: candidate });
          else if (record.phase === 'done') updateTitle = t(record.restart === true ? 'updatedRestart' : 'updated');
          else if (record.phase === 'failure') updateTitle = t('reasonUpdateFailed', { reason: record.reason });
          else if (record.phase === 'failed') updateTitle = t('reasonCheckFailed', { reason: record.reason });
          else if (record.phase === 'needsDsh') {
            updateTitle = t('reasonNeedsDsh', { version: record.version, peers: record.peers });
          } else if (record.phase === 'blocked') updateTitle = record.reason;
          else if (record.phase === 'checking') updateTitle = t('checking');
          else if (record.phase === 'latest' && record.git === true) {
            updateTitle = t('gitLatest', { ref: record.facts.ref, sha: shortCommit(record.facts.remoteCommit) });
          }
          else updateTitle = t('reasonUpToDate');
          if (update.title !== updateTitle) update.title = updateTitle;
          setDisabled(update, !clickable);
          const tone = candidate !== void 0 || record.phase === 'git' ? 'accent'
            : record.phase === 'done' ? 'success'
              : record.phase === 'failure' || record.phase === 'failed' ? 'danger' : null;
          setAttr(update, 'data-tone', tone);

          const arrowTitle = t('versionsTitle', { name: version === '' ? name : `${name} v${version}` });
          if (arrow.title !== arrowTitle) arrow.title = arrowTitle;
          setDisabled(arrow, busy || blocked);
          setAttr(arrow, 'data-tone', tone);

          const removable = canUninstall(name);
          const isRemoving = removing.has(name);
          const armed = armedRemove.has(name);
          const blockedReason = removable ? '' : uninstallBlockedReason(name);
          setText(uninstall, isRemoving
            ? t('uninstalling')
            : armed ? t('uninstallConfirm') : t('uninstall'));
          const failure = removeErrors.get(name);
          const uninstallTitle = isRemoving
            ? t('uninstalling')
            : armed
              ? t('uninstallHint', { name })
              : !removable
                ? t('uninstallBlocked', { reason: blockedReason })
                : failure !== void 0
                  ? t('uninstallFailed', { reason: failure })
                  : t('uninstallTitle', { name });
          if (uninstall.title !== uninstallTitle) uninstall.title = uninstallTitle;
          setDisabled(uninstall, isRemoving || busy || record.phase === 'checking' || blocked || !removable);
          setAttr(uninstall, 'data-tone', 'danger');
          setAttr(uninstall, 'data-armed', armed ? 'yes' : null);
        };

        /**
         * The button inside the page's refresh control. The control may be the
         * button itself or a wrapper around it.
         *
         * @param toolbar - the page's toolbar element.
         * @returns the button, or null when the toolbar is not the expected shape.
         */
        const nativeRefreshButton = (toolbar) => {
          const control = nativeRefreshChild(toolbar);
          if (control === null) return null;
          if (control.tagName === 'BUTTON') return control;
          return control.querySelector('button');
        };

        const nativeRefreshChild = (toolbar) => {
          for (const child of toolbar.children) {
            if (child.hasAttribute('data-quick-update-action')) continue;
            if (child.tagName === 'BUTTON' || child.querySelector('button') !== null) return child;
          }
          return null;
        };

        /**
         * The page's own 刷新 is the one check-everything trigger. In page mode
         * its store already publishes the answers; in direct mode the rows are
         * kept in step by re-reading the inventory and checking each plugin.
         */
        const onNativeRefresh = async () => {
          if (mode !== 'direct' || refreshRunning) return;
          refreshRunning = true;
          try {
            await sleep(300);
            try {
              rememberInstalled(await readBundles());
            } catch (_error) {
              /* keep what the rows already know */
            }
            await checkAllDirect(rowNames());
          } finally {
            refreshRunning = false;
          }
        };

        const clickRefresh = () => {
          const toolbar = document.querySelector('[data-plugin-toolbar]');
          if (toolbar === null) return;
          const button = nativeRefreshButton(toolbar);
          if (button === null || button.disabled === true) return;
          programmaticRefresh = true;
          try {
            button.click();
          } finally {
            setTimeout(() => {
              programmaticRefresh = false;
            }, 1500);
          }
        };

        const paintToolbar = (toolbar) => {
          let button = toolbar.querySelector(':scope > [data-quick-update-action="update-all"]');
          if (button === null) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'qu-inline-button';
            button.setAttribute('data-quick-update-action', 'update-all');
            button.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              void runBatch();
            });
            const refresh = nativeRefreshChild(toolbar);
            if (refresh === null) toolbar.appendChild(button);
            else toolbar.insertBefore(button, refresh.nextElementSibling);
          }
          // The page's refresh is observed at the document level instead of on
          // that button, because React may replace the button element.
          const targets = rowNames().filter(isUpdatable);
          const knownAny = rowNames().some((name) => knownListing(name).phase !== 'unknown');
          const label = batch === null
            ? t('updateAll')
            : batch.phase === 'checking'
              ? t('checking')
              : batch.phase === 'confirm'
                ? t('updateAllWaiting')
                : t('updateAllBusy', {
                done: String(batch.done),
                total: String(batch.total),
              });
          setText(button, label);
          const gitTargets = targets.filter((name) => gitCandidateOf(name) !== undefined).length;
          const title = batch === null
            ? (targets.length > 0
              ? (gitTargets > 0
                ? t('updateAllTitleGit', { count: String(targets.length), git: String(gitTargets) })
                : t('updateAllTitle', { count: String(targets.length) }))
              : knownAny ? t('reasonUpToDate') : t('updateAllCheckFirst'))
            : label;
          if (button.title !== title) button.title = title;
          setDisabled(button, batch !== null || mode === 'none');
          setAttr(button, 'data-tone', targets.length > 0 && batch === null ? 'accent' : null);
          paintUpdateCounts(toolbar);
        };

        /**
         * The page's own note counts only installable registry versions, so a
         * row whose only update is a Git commit is missing from it. While such
         * rows exist this replaces that note with the combined count; otherwise
         * the page's own sentence stays untouched.
         *
         * @param toolbar - the page's toolbar element.
         */
        const paintUpdateCounts = (toolbar) => {
          const names = rowNames();
          const gitCount = names.filter((name) => recordOf(name).phase === 'git').length;
          const registryCount = names.filter((name) => candidateOf(name) !== undefined).length;
          const nativeNote = toolbar.querySelector('[class*="updatesNote"]');
          let note = toolbar.querySelector(':scope > [data-quick-update-note]');
          if (gitCount === 0) {
            if (note !== null) note.remove();
            if (nativeNote !== null && nativeNote.style.display === 'none') nativeNote.style.display = '';
            return;
          }
          if (nativeNote !== null) nativeNote.style.display = 'none';
          if (note === null) {
            note = document.createElement('span');
            note.className = 'qu-updates-note';
            note.setAttribute('data-quick-update-note', '');
            if (nativeNote !== null) {
              nativeNote.after(note);
            } else {
              const refresh = nativeRefreshChild(toolbar);
              if (refresh === null) toolbar.prepend(note);
              else toolbar.insertBefore(note, refresh);
            }
          }
          const total = registryCount + gitCount;
          setText(note, total > 0
            ? t('updateCountAll', { total: String(total), git: String(gitCount) })
            : t('updateCountNone'));
          const hint = t('gitCountHint');
          if (note.title !== hint) note.title = hint;
        };

        /** Drop controls that ended up outside the installed-bundles group. */
        const clearStrays = () => {
          for (const node of document.querySelectorAll('[data-quick-update-actions]')) {
            if (node.closest('[data-plugin-group="bundles"]') === null) node.remove();
          }
          for (const chip of document.querySelectorAll('[data-quick-update-version]')) {
            if (chip.closest('[data-plugin-group="bundles"]') === null) chip.remove();
          }
        };

        const removeInjected = () => {
          closeMenu();
          const selector = '[data-quick-update-action], [data-quick-update-actions], '
            + '[data-quick-update-placeholder], [data-quick-update-version], [data-quick-update-menu], [data-quick-update-note], [data-quick-update-confirm]';
          for (const node of document.querySelectorAll(selector)) node.remove();
        };

        /**
         * One modal confirmation for a batch that mixes published versions and
         * Git commits.
         *
         * @param options - the title, body, and the two action labels.
         * @returns the chosen action: primary, secondary, or cancel.
         */
        const confirmDialog = (options) => new Promise((resolve) => {
          if (disposed) {
            resolve('cancel');
            return;
          }
          const overlay = document.createElement('div');
          overlay.className = 'qu-confirm-overlay';
          overlay.setAttribute('data-quick-update-confirm', '');
          const card = document.createElement('div');
          card.className = 'qu-confirm';
          const title = document.createElement('p');
          title.className = 'qu-confirm-title';
          title.textContent = options.title;
          const body = document.createElement('p');
          body.className = 'qu-confirm-body';
          body.textContent = options.body;
          const actions = document.createElement('div');
          actions.className = 'qu-confirm-actions';
          let cleanup = () => {};
          const finish = (choice) => {
            cleanup();
            resolve(choice);
          };
          const onKey = (event) => {
            if (event.key === 'Escape') finish('cancel');
          };
          const onOutside = (event) => {
            if (!card.contains(event.target)) finish('cancel');
          };
          cleanup = () => {
            dialogOpen = false;
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('mousedown', onOutside, true);
            overlay.remove();
          };
          const cancel = document.createElement('button');
          cancel.type = 'button';
          cancel.className = 'qu-inline-button';
          cancel.textContent = t('confirmGitCancel');
          cancel.addEventListener('click', () => finish('cancel'));
          const secondary = document.createElement('button');
          secondary.type = 'button';
          secondary.className = 'qu-inline-button';
          secondary.textContent = options.secondary;
          secondary.addEventListener('click', () => finish('secondary'));
          const primary = document.createElement('button');
          primary.type = 'button';
          primary.className = 'qu-inline-button';
          primary.setAttribute('data-tone', 'accent');
          primary.textContent = options.primary;
          primary.addEventListener('click', () => finish('primary'));
          actions.append(cancel, secondary, primary);
          card.append(title, body, actions);
          overlay.append(card);
          document.addEventListener('keydown', onKey, true);
          document.addEventListener('mousedown', onOutside, true);
          dialogOpen = true;
          document.body.append(overlay);
          primary.focus();
        });

        /** Repaint every injected control from the current mode and state. */
        const paint = () => {
          if (disposed) return;
          const toolbar = document.querySelector('[data-plugin-toolbar]');
          const rows = bundleRows();
          const nextPresent = toolbar !== null || rows.length > 0;
          if (nextPresent && !pagePresent) {
            // The page mounted again; its own store is empty until a first
            // check, while a surviving store already holds the answers.
            const state = bridge === null ? null : pageState();
            if (mode !== 'page' || state === null || Object.keys(state.versions || {}).length === 0) {
              ensured = false;
            }
          }
          pagePresent = nextPresent;
          if (!pagePresent) {
            removeInjected();
            return;
          }
          if (bridge === null) bridge = findBridge();
          const nextMode = bridge === null ? 'direct' : 'page';
          if (nextMode !== mode) {
            mode = nextMode;
            ensured = false;
            if (mode === 'direct') {
              checks.clear();
              failures.clear();
            }
          }
          if (!dialogOpen) {
            for (const node of document.querySelectorAll('[data-quick-update-confirm]')) node.remove();
          }
          clearStrays();
          if (!ensured && mode !== 'none') {
            ensured = true;
            // Entering the page checks nothing on its own: the page's own 刷新
            // checks everything, and each row checks itself when used. This
            // read only fills installed versions and install sources locally.
            if (mode === 'page') {
              const state = pageState();
              if (state !== null) rememberInstalled(state.packages || []);
            } else {
              void readBundles().then((packages) => {
                rememberInstalled(packages);
                paint();
              }).catch(() => {
                /* the rows simply keep their package names */
              });
            }
          }
          if (toolbar !== null) paintToolbar(toolbar);
          for (const row of rows) paintRow(row);
          paintPlaceholders();
        };

        const schedule = () => {
          if (disposed || scheduled !== null) return;
          scheduled = setTimeout(() => {
            scheduled = null;
            paint();
          }, pagePresent ? 150 : 800);
        };

        /* ---------------------------- wiring ------------------------------ */

        const styles = document.createElement('style');
        styles.setAttribute('data-dsh-quick-update', '');
        styles.textContent = STYLES;
        ctx.effect(() => {
          document.head.appendChild(styles);
          return () => {
            disposed = true;
            for (const timer of armedRemove.values()) clearTimeout(timer);
            armedRemove.clear();
            styles.remove();
            removeInjected();
          };
        }, 'dsh-quick-update: styles');

        ctx.effect(() => {
          const onClick = (event) => {
            const toolbar = document.querySelector('[data-plugin-toolbar]');
            if (toolbar === null) return;
            const refresh = nativeRefreshChild(toolbar);
            if (refresh === null) return;
            const inside = refresh === event.target || refresh.contains(event.target);
            if (!inside || programmaticRefresh) return;
            void onNativeRefresh();
          };
          document.addEventListener('click', onClick, true);
          return () => document.removeEventListener('click', onClick, true);
        }, 'dsh-quick-update: refresh hook');

        ctx.effect(() => {
          const observer = new MutationObserver(schedule);
          observer.observe(document.body, { childList: true, subtree: true });
          return () => {
            observer.disconnect();
            if (scheduled !== null) {
              clearTimeout(scheduled);
              scheduled = null;
            }
            removeInjected();
          };
        }, 'dsh-quick-update: page observer');

        /** The Host namespace must be injected by its own path, last. */
        ctx.inject(['remote.pluginManager'], (scope) => {
          manager = scope.remote.pluginManager;
          ensured = false;
          paint();
          return () => {
            manager = null;
          };
        });

        paint();
      },
    };
  },
});
