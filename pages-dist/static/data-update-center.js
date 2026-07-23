(() => {
  "use strict";

  const API = "/api/data-updates";
  const API_V2 = `${API}/v2`;
  const TABS = ["overview", "portfolio", "sources", "plan", "releases", "operations"];
  const GROUP_ICONS = {
    core: "globe", education: "education", institutions: "institution", digital: "digital",
    economy: "economy", society: "society", environment: "environment", security: "security",
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    tab: "overview",
    dashboard: null,
    preflight: null,
    preview: null,
    sourceDetail: null,
    jobDiff: null,
    loading: false,
    mutation: "",
    error: "",
    notice: "",
    selectedSources: new Set(),
    selectedModules: new Set(),
    selectedGroups: new Set(),
    sourceQuery: "",
    sourceGroup: "all",
    sourceState: "all",
    moduleQuery: "",
    moduleGroup: "all",
    moduleState: "all",
    expandedGroups: new Set(["core", "education", "institutions", "digital", "environment", "security"]),
    expandedJob: "",
    expandedPlan: "",
    sourceFocusReturn: null,
  };

  const COPY = {
    ru: {
      title: "Центр жизненного цикла данных",
      subtitle: "Единое управление источниками, 44 аналитическими модулями и исследовательскими наборами — от сигнала нового выпуска до проверяемой публикации и отката.",
      overview: "Обзор",
      portfolio: "Портфель",
      sources: "Источники",
      plan: "План обновления",
      releases: "Задания и релизы",
      operations: "Эксплуатация",
      refresh: "Обновить состояние",
      check: "Проверить выпуски",
      preflight: "Проверить готовность",
      requestPlan: "Построить dry-run",
      createPlan: "Создать исполняемый план",
      stage: "Запустить staging",
      publish: "Опубликовать",
      rollback: "Откатить",
      viewDiff: "Показать дельту",
      adminMode: "Режим оператора",
      readOnly: "Только просмотр",
      close: "Закрыть",
      sourceRegistry: "Реестр источников",
      lifecycle: "Контур публикации",
      queue: "Очередь оператора",
      portfolioReadiness: "Готовность тематического портфеля",
      calendar: "Операционный календарь проверок",
      selected: "Выбрано",
      searchSource: "Источник, организация или модуль",
      searchModule: "Название, код или издатель",
      allGroups: "Все направления",
      allStates: "Все состояния",
      selectAttention: "Выбрать требующие внимания",
      clearSelection: "Очистить выбор",
      openSource: "Открыть паспорт источника",
      latestSnapshot: "Последний snapshot",
      latestCheck: "Последняя проверка",
      connector: "Коннектор",
      rights: "Права",
      cadence: "Периодичность",
      modules: "Модули",
      datasets: "Наборы",
      publicationTargets: "Цели публикации",
      affectedProducts: "Затрагиваемые продукты",
      blockers: "Блокирующие условия",
      warnings: "Предупреждения",
      planSteps: "DAG и контрольные этапы",
      noSelection: "Выберите группу, модуль или источник. Dry-run не изменяет научную базу.",
      noRows: "Нет записей для выбранных фильтров.",
      noActivity: "Через этот контур ещё не выполнялись задания.",
      dbIntegrity: "Научная база",
      connectorCoverage: "Покрытие коннекторами",
      policyCoverage: "Операционные политики",
      disk: "Резерв диска",
      publicationLock: "Блокировка публикации",
      commands: "Командная строка",
      standards: "Инженерные принципы",
      packageRegistration: "Регистрация официального пакета",
      serverPath: "Локальный путь к файлу на сервере",
      releaseLabel: "Редакция / выпуск",
      registerPackage: "Зарегистрировать пакет",
      packageRights: "Подтверждения прав",
      officialPackage: "Официальный или разрешённый экспорт",
      storagePermitted: "Локальное хранение разрешено",
      transformPermitted: "Преобразование разрешено",
      derivedPermitted: "Публикация производных результатов разрешена",
      institutionRowsPermitted: "Публикация исходных строк разрешена",
      loading: "Формируется операционный профиль платформы…",
      operationRunning: "Выполняется защищённая операция…",
      noSnapshot: "Snapshot отсутствует",
      scheduleNote: "Дата следующей проверки — график GIR, а не обещание издателя о выпуске.",
      dryRunNote: "Dry-run показывает источники, зависимости, права и publication targets, не создавая staging и не изменяя SQLite.",
      sourceDetail: "Паспорт источника",
      history: "История",
      snapshots: "Snapshots",
      packages: "Пакеты",
      checks: "Проверки",
      currentRelease: "Текущая редакция",
      nextCheck: "Следующая проверка",
      dataStatus: "Состояние данных",
      sourceGated: "Ожидает источник",
      published: "Опубликован",
      loadMore: "Показать подробнее",
      riskGuard: "Публикация блокируется, если staging уменьшает число опубликованных модулей, страновых ячеек или строк Data Explorer.",
      qsKicker: "Аналитика QS",
      qsTitle: "QS как экосистема источников",
      qsCopy: "Каждый рейтинг QS обновляется и публикуется отдельно. GIR не создаёт супериндекс из мирового рейтинга университетов (WUR), дисциплин, рейтинга устойчивого развития и профессиональных рейтингов.",
      qsRegistered: "зарегистрированных проектов",
      qsLoaded: "проектов с данными",
      qsSubjects: "дисциплин",
      qsFamilies: "семейств источников",
    },
    en: {
      title: "Data lifecycle control center",
      subtitle: "Unified control of sources, 44 analytical modules and research datasets—from a release signal to validated publication and rollback.",
      overview: "Overview", portfolio: "Portfolio", sources: "Sources", plan: "Update plan", releases: "Jobs & releases", operations: "Operations",
      refresh: "Refresh state", check: "Check releases", preflight: "Run preflight", requestPlan: "Build dry run", createPlan: "Create executable plan", stage: "Run staging", publish: "Publish", rollback: "Roll back", viewDiff: "View delta",
      adminMode: "Operator mode", readOnly: "Read only", close: "Close",
      sourceRegistry: "Source registry", lifecycle: "Publication workflow", queue: "Operator queue", portfolioReadiness: "Portfolio readiness", calendar: "Operational check calendar", selected: "Selected",
      searchSource: "Source, organisation or module", searchModule: "Name, code or publisher", allGroups: "All groups", allStates: "All states", selectAttention: "Select attention queue", clearSelection: "Clear selection", openSource: "Open source passport",
      latestSnapshot: "Latest snapshot", latestCheck: "Latest check", connector: "Connector", rights: "Rights", cadence: "Cadence", modules: "Modules", datasets: "Datasets", publicationTargets: "Publication targets", affectedProducts: "Affected products", blockers: "Blockers", warnings: "Warnings", planSteps: "DAG and control stages",
      noSelection: "Select a group, module or source. A dry run never changes the scientific database.", noRows: "No records match the current filters.", noActivity: "No jobs have been executed through this workflow yet.",
      dbIntegrity: "Scientific database", connectorCoverage: "Connector coverage", policyCoverage: "Operational policies", disk: "Disk reserve", publicationLock: "Publication lock", commands: "Command line", standards: "Engineering principles",
      packageRegistration: "Register official package", serverPath: "Local server file path", releaseLabel: "Edition / release", registerPackage: "Register package", packageRights: "Rights assertions", officialPackage: "Official or authorised export", storagePermitted: "Local storage permitted", transformPermitted: "Transformation permitted", derivedPermitted: "Publication of derived results permitted", institutionRowsPermitted: "Publication of source rows permitted",
      loading: "Building the platform operational profile…", operationRunning: "Running protected operation…", noSnapshot: "No snapshot", scheduleNote: "The next-check date is a GIR schedule, not a publisher release commitment.", dryRunNote: "The dry run shows sources, dependencies, rights and publication targets without creating staging or changing SQLite.", sourceDetail: "Source passport", history: "History", snapshots: "Snapshots", packages: "Packages", checks: "Checks", currentRelease: "Current release", nextCheck: "Next check", dataStatus: "Data state", sourceGated: "Source-gated", published: "Published", loadMore: "Show details",
      riskGuard: "Publication is blocked if staging reduces published modules, country cells or Data Explorer rows.",
      qsKicker: "QS Intelligence",
      qsTitle: "QS as a source ecosystem",
      qsCopy: "Every QS ranking is updated and published separately. GIR never creates a super-index from WUR, subjects, Sustainability and professional rankings.",
      qsRegistered: "registered projects",
      qsLoaded: "projects with data",
      qsSubjects: "subjects",
      qsFamilies: "source families",
    },
  };

  const STATE_LABELS = {
    ru: {
      current: "Актуально", immutable: "Архивный выпуск", derived_dependency: "Пересчитывается по зависимостям",
      check_due_soon: "Скоро проверить", check_overdue: "Проверка просрочена", check_inconclusive: "Проверка не завершена",
      new_release_signal: "Обнаружен сигнал выпуска", package_ready: "Пакет готов", source_not_loaded: "Числовой слой не загружен",
      rights_or_package_required: "Нужен разрешённый пакет", credential_required: "Нужен API-токен", connector_review_required: "Требуется настройка коннектора",
      source_gated: "Ожидает источник", update_available: "Доступно обновление", review_required: "Требуется проверка", ready_to_stage: "Готов к staging",
      ready: "Готов", blocked: "Заблокирован", validated: "Проверен", running: "Выполняется", failed: "Ошибка", published: "Опубликован", rolled_back: "Откачен", created: "Создан",
      reachable_no_new_signal: "Новых сигналов нет", remote_not_modified: "Не изменён (HTTP 304)", remote_metadata_changed: "Метаданные изменились", new_release_signal_check: "Новый выпуск", manual_rights_required: "Ручная проверка прав", network_check_skipped: "Сеть не использовалась", check_inconclusive_signal: "Проверка не завершена",
    },
    en: {
      current: "Current", immutable: "Archival release", derived_dependency: "Rebuilt through dependencies",
      check_due_soon: "Check due soon", check_overdue: "Check overdue", check_inconclusive: "Check inconclusive", new_release_signal: "Release signal detected", package_ready: "Package ready", source_not_loaded: "Numeric layer not loaded", rights_or_package_required: "Authorised package required", credential_required: "API token required", connector_review_required: "Connector review required", source_gated: "Source-gated", update_available: "Update available", review_required: "Review required", ready_to_stage: "Ready to stage", ready: "Ready", blocked: "Blocked", validated: "Validated", running: "Running", failed: "Failed", published: "Published", rolled_back: "Rolled back", created: "Created",
      reachable_no_new_signal: "No new signal", remote_not_modified: "Not modified (HTTP 304)", remote_metadata_changed: "Metadata changed", new_release_signal_check: "New release", manual_rights_required: "Manual rights review", network_check_skipped: "Network skipped", check_inconclusive_signal: "Check inconclusive",
    },
  };

  function tr(key) { return COPY[state.lang]?.[key] || COPY.ru[key] || key; }
  function authUser() { return window.GIRAuth?.state?.user || null; }
  function isAdmin() { return window.GIRAuth?.state?.authenticated === true && authUser()?.role === "admin"; }
  function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch])); }
  function fmtInt(value) { return Number.isFinite(Number(value)) ? new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "en-US").format(Number(value)) : "—"; }
  function fmtPct(value) { return Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 100)}%` : "—"; }
  function fmtBytes(value) {
    const number = Number(value || 0); if (!number) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"]; const index = Math.min(Math.floor(Math.log(number) / Math.log(1024)), units.length - 1);
    return `${(number / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
  }
  function fmtDate(value, withTime = false) {
    if (!value) return "—"; const date = new Date(value); if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(state.lang === "ru" ? "ru-RU" : "en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
  }
  function shortHash(value) { return value ? `${String(value).slice(0, 10)}…${String(value).slice(-6)}` : "—"; }
  function labelState(value) { return STATE_LABELS[state.lang]?.[value] || value || "—"; }
  function tone(value) {
    if (["current", "ready", "validated", "published", "remote_not_modified", "reachable_no_new_signal"].includes(value)) return "success";
    if (["check_due_soon", "review_required", "scheduled", "created", "running", "derived_dependency"].includes(value)) return "warning";
    if (["new_release_signal", "update_available", "package_ready", "ready_to_stage"].includes(value)) return "accent";
    if (["failed", "blocked", "check_overdue", "source_not_loaded", "rights_or_package_required", "credential_required", "connector_review_required", "source_gated"].includes(value)) return "danger";
    return "neutral";
  }
  function badge(value, text = labelState(value)) { return `<span class="du2-badge du2-badge--${tone(value)}">${esc(text)}</span>`; }
  function icon(name) {
    const paths = {
      globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.2 3.4 4.9 3.4 8S14.2 17.8 12 20c-2.2-2.2-3.4-4.9-3.4-8S9.8 6.2 12 4Z"/>',
      education: '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4c3 2.4 7 2.4 10 0v-4M21 9v6"/>',
      institution: '<path d="M3 10h18M5 10V8l7-4 7 4v2M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18"/>',
      digital: '<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4M7 9h3M14 9h3M7 13h10"/>',
      economy: '<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h22"/>',
      society: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M2.5 20c.5-4 2.4-6 5.5-6s5 2 5.5 6M13 14c3.8-.6 6.5 1.2 7.5 5"/>',
      environment: '<path d="M20 4C11 4 5 9 5 16c0 2.5 1.5 4 4 4 7 0 11-6 11-16Z"/><path d="M5 21c3-7 7-10 13-14"/>',
      security: '<path d="M12 3 5 6v6c0 4.5 2.7 7.7 7 9 4.3-1.3 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
      source: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 12h6M10 16h6"/>',
      plan: '<path d="M4 5h16M4 12h10M4 19h16"/><circle cx="18" cy="12" r="2"/>',
      release: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
      operations: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5L9.2 6a8 8 0 0 0-1.7 1L5 6 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.5-1a8 8 0 0 0 1.7 1l.3 3h5l.3-3a8 8 0 0 0 1.7-1l2.5 1 2-3.5-2.1-1.5a7 7 0 0 0 .1-1Z"/>',
      check: '<path d="m4 12 5 5L20 6"/>',
      alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/>',
      arrow: '<path d="m9 18 6-6-6-6"/>',
      lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    };
    return `<svg class="du2-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.source}</svg>`;
  }

  async function request(path, options = {}) {
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(path.startsWith("/") ? path : `${API}${path}`, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("json") ? await response.json() : await response.text();
    if (!response.ok) throw new Error(typeof payload === "string" ? payload : payload.detail || payload.message || JSON.stringify(payload));
    return payload;
  }

  function setBusy(name) { state.mutation = name; state.error = ""; state.notice = ""; renderShell(); }
  async function mutate(name, action, success) {
    setBusy(name);
    try {
      const result = await action();
      state.notice = success || (state.lang === "ru" ? "Операция завершена." : "Operation completed.");
      await load(false);
      return result;
    } catch (error) {
      state.error = error.message || String(error);
      renderShell();
      return null;
    } finally {
      state.mutation = "";
      renderShell();
    }
  }

  async function load(showSpinner = true) {
    if (showSpinner) { state.loading = true; renderShell(); }
    state.error = "";
    try {
      const [dashboard, preflight] = await Promise.all([
        request(`${API_V2}/dashboard`),
        request(`${API_V2}/preflight`),
      ]);
      state.dashboard = dashboard;
      state.preflight = preflight;
    } catch (error) {
      state.error = error.message || String(error);
    } finally {
      state.loading = false;
      renderShell();
    }
  }

  function header() {
    const d = state.dashboard;
    const system = d?.system || {};
    const summary = d?.summary || {};
    return `<header class="du2-header">
      <div class="du2-header__copy">
        <div class="du2-eyebrow">GIR / Data operations</div>
        <h1>${esc(tr("title"))}</h1>
        <p>${esc(tr("subtitle"))}</p>
      </div>
      <div class="du2-header__actions">
        <button class="button" type="button" data-action="refresh">${icon("refresh")}${esc(tr("refresh"))}</button>
        <span class="button ${isAdmin() ? "success" : ""}">${icon("lock")}${esc(isAdmin() ? tr("adminMode") : tr("readOnly"))}</span>
      </div>
      <div class="du2-status-rail">
        <div><span>${esc(tr("dbIntegrity"))}</span><strong>${esc(system.control_database_integrity === "ok" ? "SQLite OK" : system.control_database_integrity || "—")}</strong><small>${shortHash(d?.scientific_database?.sha256)}</small></div>
        <div><span>${esc(tr("policyCoverage"))}</span><strong>${fmtInt(system.explicit_policy_count)} / ${fmtInt(summary.source_count)}</strong><small>${esc(state.lang === "ru" ? "индивидуальных профилей" : "explicit profiles")}</small></div>
        <div><span>${esc(tr("connectorCoverage"))}</span><strong>${fmtInt(system.connector_counts?.implemented || 0)} / ${fmtInt(summary.source_count)}</strong><small>${esc(state.lang === "ru" ? "исполняемых контуров" : "executable workflows")}</small></div>
        <div><span>${esc(tr("disk"))}</span><strong>${fmtBytes(system.disk_free_bytes)}</strong><small>${system.disk_ready ? esc(state.lang === "ru" ? "достаточно для staging" : "staging capacity ready") : esc(state.lang === "ru" ? "недостаточно" : "insufficient")}</small></div>
        <div><span>${esc(tr("publicationLock"))}</span><strong>${system.publication_lock_clear ? esc(state.lang === "ru" ? "Свободна" : "Clear") : esc(state.lang === "ru" ? "Занята" : "Locked")}</strong><small>${fmtInt(summary.active_job_count)} ${esc(state.lang === "ru" ? "активных заданий" : "active jobs")}</small></div>
      </div>
    </header>`;
  }

  function readOnlyNotice() {
    if (!authUser() || isAdmin()) return "";
    return `<div class="du2-notice" role="status"><strong>${esc(tr("readOnly"))}</strong><span>${esc(state.lang === "ru" ? "Изменяющие операции доступны после входа под профилем администратора." : "Sign in with an administrator profile to run mutating operations.")}</span></div>`;
  }

  function tabBar() {
    const icons = { overview: "database", portfolio: "globe", sources: "source", plan: "plan", releases: "release", operations: "operations" };
    return `<nav class="du2-tabs" role="tablist" aria-label="${esc(tr("title"))}">${TABS.map((tab) => `<button type="button" role="tab" aria-selected="${state.tab === tab}" tabindex="${state.tab === tab ? 0 : -1}" class="du2-tab ${state.tab === tab ? "is-active" : ""}" data-tab="${tab}">${icon(icons[tab])}<span>${esc(tr(tab))}</span></button>`).join("")}</nav>`;
  }

  function metrics() {
    const s = state.dashboard?.summary || {};
    const data = [
      [s.module_count, state.lang === "ru" ? "аналитических модулей" : "analytical modules", `${fmtInt(s.numeric_module_count)} ${state.lang === "ru" ? "с числовым выпуском" : "with numeric releases"}`],
      [s.dataset_count, state.lang === "ru" ? "наборов Data Explorer" : "Data Explorer datasets", `${fmtInt(s.published_dataset_count)} ${state.lang === "ru" ? "опубликовано" : "published"}`],
      [s.source_count, state.lang === "ru" ? "источника" : "sources", `${fmtInt(s.snapshot_count)} snapshots`],
      [s.dataset_row_count, state.lang === "ru" ? "исследовательских строк" : "research rows", state.lang === "ru" ? "в опубликованных наборах" : "in published datasets"],
      [s.attention_source_count, state.lang === "ru" ? "позиций в очереди" : "operator queue items", `${fmtInt(s.active_job_count)} ${state.lang === "ru" ? "активных заданий" : "active jobs"}`],
    ];
    return `<div class="du2-metrics">${data.map(([value, label, note]) => `<article class="du2-metric"><strong>${fmtInt(value)}</strong><span>${esc(label)}</span><small>${esc(note)}</small></article>`).join("")}</div>`;
  }

  function lifecycle() {
    const steps = [
      ["01", state.lang === "ru" ? "Обнаружение" : "Discovery", state.lang === "ru" ? "ETag, Last-Modified, официальный release-channel" : "ETag, Last-Modified and official release channel"],
      ["02", state.lang === "ru" ? "Получение" : "Acquisition", state.lang === "ru" ? "API, официальный файл или разрешённый пакет" : "API, official file or authorised package"],
      ["03", "Staging", state.lang === "ru" ? "Изолированная SQLite и project overlay" : "Isolated SQLite and project overlay"],
      ["04", state.lang === "ru" ? "Валидация" : "Validation", state.lang === "ru" ? "Схема, формулы, provenance, полнота" : "Schema, formulas, provenance and completeness"],
      ["05", state.lang === "ru" ? "Дельта" : "Release diff", state.lang === "ru" ? "Модули, наборы, строки и файловые цели" : "Modules, datasets, rows and file targets"],
      ["06", state.lang === "ru" ? "Публикация" : "Publication", state.lang === "ru" ? "Атомарная замена и проверенный rollback" : "Atomic replacement and verified rollback"],
    ];
    return `<section class="card du2-lifecycle"><div class="du2-section-head"><div><span>Lifecycle</span><h2>${esc(tr("lifecycle"))}</h2></div><p>${esc(tr("riskGuard"))}</p></div><ol>${steps.map(([n, title, text]) => `<li><span>${n}</span><div><strong>${esc(title)}</strong><p>${esc(text)}</p></div></li>`).join("")}</ol></section>`;
  }

  function groupCard(group, compact = false) {
    const total = Number(group.module_count || 0); const numeric = Number(group.numeric_module_count || 0); const progress = total ? Math.round(numeric / total * 100) : 0;
    const label = state.lang === "ru" ? group.label_ru : group.label_en;
    const description = state.lang === "ru" ? group.description_ru : group.description_en;
    return `<article class="du2-group-card ${compact ? "is-compact" : ""}" data-group-card="${esc(group.key)}">
      <div class="du2-group-card__icon">${icon(GROUP_ICONS[group.key])}</div>
      <div class="du2-group-card__body"><div class="du2-group-card__top"><h3>${esc(label)}</h3><strong>${numeric}/${total}</strong></div><p>${esc(description)}</p>
      <div class="du2-progress" aria-label="${esc(label)}: ${progress}%"><i style="width:${progress}%"></i></div>
      <div class="du2-group-card__meta"><span>${fmtInt(group.source_count)} ${esc(state.lang === "ru" ? "источников" : "sources")}</span><span>${fmtInt(group.dataset_count)} ${esc(state.lang === "ru" ? "наборов" : "datasets")}</span><span class="${group.attention_source_count ? "has-attention" : ""}">${fmtInt(group.attention_source_count)} ${esc(state.lang === "ru" ? "требуют действий" : "need action")}</span></div></div>
    </article>`;
  }

  function groupGrid() { return `<section><div class="du2-section-head"><div><span>44 / 8</span><h2>${esc(tr("portfolioReadiness"))}</h2></div><button class="du2-link" type="button" data-tab-link="portfolio">${esc(state.lang === "ru" ? "Открыть весь портфель" : "Open full portfolio")}${icon("arrow")}</button></div><div class="du2-group-grid">${(state.dashboard?.groups || []).map((g) => groupCard(g)).join("")}</div></section>`; }

  function queue() {
    const items = state.dashboard?.operator_queue || [];
    return `<section class="card"><div class="du2-section-head"><div><span>Priority</span><h2>${esc(tr("queue"))}</h2></div><button class="du2-link" type="button" data-action="select-attention">${esc(tr("selectAttention"))}</button></div>
      <div class="du2-queue">${items.length ? items.slice(0, 8).map((item) => `<button type="button" class="du2-queue-row" data-source-detail="${esc(item.source_id)}"><span class="du2-priority">${fmtInt(item.priority)}</span><span><strong>${esc(item.source_name || item.source_id)}</strong><small>${esc((item.module_codes || []).join(" · ") || item.source_id)}</small></span>${badge(item.operational_state)}${icon("arrow")}</button>`).join("") : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`}</div>
    </section>`;
  }

  function calendar() {
    const rows = state.dashboard?.calendar || [];
    return `<section class="card"><div class="du2-section-head"><div><span>Schedule</span><h2>${esc(tr("calendar"))}</h2></div><p>${esc(tr("scheduleNote"))}</p></div><div class="du2-calendar">${rows.slice(0, 10).map((item) => `<button type="button" data-source-detail="${esc(item.source_id)}"><time>${fmtDate(item.next_check_at)}</time><span><strong>${esc(item.source_name)}</strong><small>${esc((item.module_codes || []).join(" · ") || item.source_id)}</small></span>${badge(item.state, item.days_until_check < 0 ? `${Math.abs(item.days_until_check)} ${state.lang === "ru" ? "дн. просрочки" : "days overdue"}` : `${item.days_until_check} ${state.lang === "ru" ? "дн." : "days"}`)}</button>`).join("")}</div></section>`;
  }

  function qsPortfolioPanel() {
    const q = state.dashboard?.qs_portfolio;
    if (!q || !Number(q.registered_projects || 0)) return "";
    const sourceFamilies = Number((q.families || []).length || 7);
    const qsFamilies = state.lang === "ru"
      ? ["Мировой рейтинг (WUR)", "Дисциплины", "Устойчивое развитие", "Региональные", "MBA и магистратура", "Профессиональные"]
      : ["WUR", "Subjects", "Sustainability", "Regional", "MBA & Masters", "Professional"];
    return `<section class="card du2-qs-portfolio"><div class="du2-section-head"><div><span>${esc(tr("qsKicker"))}</span><h2>${esc(tr("qsTitle"))}</h2></div><a class="du2-link" href="/#index-QS_ET">${esc(state.lang === "ru" ? "Открыть аналитику QS" : "Open QS Intelligence")}${icon("arrow")}</a></div><p>${esc(tr("qsCopy"))}</p><div class="du2-qs-metrics"><div><strong>${fmtInt(q.registered_projects)}</strong><span>${esc(tr("qsRegistered"))}</span></div><div><strong>${fmtInt(q.loaded_projects)}</strong><span>${esc(tr("qsLoaded"))}</span></div><div><strong>${fmtInt(q.subjects)}</strong><span>${esc(tr("qsSubjects"))}</span></div><div><strong>${fmtInt(sourceFamilies)}</strong><span>${esc(tr("qsFamilies"))}</span></div></div><div class="du2-qs-flow">${qsFamilies.map((family) => `<span>${esc(family)}</span>`).join("")}</div></section>`;
  }

  function overviewTab() {
    return `${metrics()}${qsPortfolioPanel()}<div class="du2-overview-grid"><div>${groupGrid()}${lifecycle()}</div><aside>${queue()}${calendar()}</aside></div>`;
  }

  function moduleFilters() {
    return `<div class="du2-filterbar"><label class="du2-search">${icon("search")}<input type="search" value="${esc(state.moduleQuery)}" placeholder="${esc(tr("searchModule"))}" data-filter="module-query"></label><select class="select" data-filter="module-group"><option value="all">${esc(tr("allGroups"))}</option>${(state.dashboard?.groups || []).map((g) => `<option value="${esc(g.key)}" ${state.moduleGroup === g.key ? "selected" : ""}>${esc(state.lang === "ru" ? g.label_ru : g.label_en)}</option>`).join("")}</select><select class="select" data-filter="module-state"><option value="all">${esc(tr("allStates"))}</option>${["current","source_gated","credential_required","review_required"].map((value) => `<option value="${value}" ${state.moduleState === value ? "selected" : ""}>${esc(labelState(value))}</option>`).join("")}</select></div>`;
  }

  function filteredModules() {
    const query = state.moduleQuery.trim().toLowerCase();
    return (state.dashboard?.modules || []).filter((item) => {
      const text = [item.code, item.name_ru, item.name_en, item.authority].join(" ").toLowerCase();
      return (!query || text.includes(query)) && (state.moduleGroup === "all" || item.group === state.moduleGroup) && (state.moduleState === "all" || item.operational_state === state.moduleState);
    });
  }

  function moduleRow(item) {
    const name = state.lang === "ru" ? item.name_ru : item.name_en;
    const checked = state.selectedModules.has(item.code);
    return `<label class="du2-module-row"><input type="checkbox" data-module-select="${esc(item.code)}" ${checked ? "checked" : ""}><span class="du2-module-code">${esc(item.code)}</span><span class="du2-module-name"><strong>${esc(name)}</strong><small>${esc(item.authority || "—")} · ${fmtInt(item.available_country_count)} ${esc(state.lang === "ru" ? "стран" : "countries")}</small></span>${badge(item.operational_state)}<span class="du2-module-meta"><strong>${fmtInt(item.published_dataset_count)}/${fmtInt(item.dataset_count)}</strong><small>${esc(state.lang === "ru" ? "наборов" : "datasets")}</small></span><a href="${esc(item.route)}" aria-label="${esc(name)}">${icon("arrow")}</a></label>`;
  }

  function portfolioTab() {
    const modules = filteredModules();
    return `<section class="du2-worktop"><div><span>Portfolio operations</span><h2>${esc(state.lang === "ru" ? "44 модуля как единая система зависимостей" : "44 modules as one dependency system")}</h2><p>${esc(state.lang === "ru" ? "Выбор модуля автоматически добавляет его первичные источники в dry-run. Производные регистры пересчитываются через upstream-зависимости и не загружаются отдельно." : "Selecting a module adds its primary sources to the dry run. Derived registries are rebuilt through upstream dependencies and are never downloaded separately.")}</p></div><div class="du2-worktop__actions"><button class="button" data-action="clear-selection">${esc(tr("clearSelection"))}</button><button class="button primary" data-tab-link="plan">${esc(tr("requestPlan"))}</button></div></section>${moduleFilters()}<div class="du2-portfolio-layout"><aside class="du2-group-nav">${(state.dashboard?.groups || []).map((g) => `<button type="button" data-group-select="${esc(g.key)}" class="${state.selectedGroups.has(g.key) ? "is-selected" : ""}">${icon(GROUP_ICONS[g.key])}<span>${esc(state.lang === "ru" ? g.label_ru : g.label_en)}</span><strong>${g.numeric_module_count}/${g.module_count}</strong></button>`).join("")}</aside><section class="card du2-module-list"><div class="du2-list-head"><span>${fmtInt(modules.length)} ${esc(state.lang === "ru" ? "модулей" : "modules")}</span><span>${fmtInt(state.selectedModules.size)} ${esc(tr("selected").toLowerCase())}</span></div>${modules.length ? modules.map(moduleRow).join("") : `<p class="du2-empty">${esc(tr("noRows"))}</p>`}</section></div>`;
  }

  function sourceFilters() {
    const states = [...new Set((state.dashboard?.sources || []).map((x) => x.operational_state))].sort();
    return `<div class="du2-filterbar"><label class="du2-search">${icon("search")}<input type="search" value="${esc(state.sourceQuery)}" placeholder="${esc(tr("searchSource"))}" data-filter="source-query"></label><select class="select" data-filter="source-group"><option value="all">${esc(tr("allGroups"))}</option>${(state.dashboard?.groups || []).map((g) => `<option value="${esc(g.key)}" ${state.sourceGroup === g.key ? "selected" : ""}>${esc(state.lang === "ru" ? g.label_ru : g.label_en)}</option>`).join("")}</select><select class="select" data-filter="source-state"><option value="all">${esc(tr("allStates"))}</option>${states.map((value) => `<option value="${esc(value)}" ${state.sourceState === value ? "selected" : ""}>${esc(labelState(value))}</option>`).join("")}</select><button type="button" class="button" data-action="select-attention">${esc(tr("selectAttention"))}</button></div>`;
  }

  function filteredSources() {
    const query = state.sourceQuery.trim().toLowerCase();
    const groupModules = state.sourceGroup === "all" ? null : new Set((state.dashboard?.groups || []).find((g) => g.key === state.sourceGroup)?.module_codes || []);
    return (state.dashboard?.sources || []).filter((item) => {
      const text = [item.source_id, item.source_name, item.owner, ...(item.module_codes || [])].join(" ").toLowerCase();
      const groupMatch = !groupModules || (item.module_codes || []).some((code) => groupModules.has(code));
      return (!query || text.includes(query)) && groupMatch && (state.sourceState === "all" || item.operational_state === state.sourceState);
    });
  }

  function sourceRow(item) {
    const checked = state.selectedSources.has(item.source_id);
    const snapshot = item.latest_snapshot;
    return `<tr><td><input type="checkbox" aria-label="${esc(item.source_name || item.source_id)}" data-source-select="${esc(item.source_id)}" ${checked ? "checked" : ""}></td><td><button type="button" class="du2-source-link" data-source-detail="${esc(item.source_id)}"><strong>${esc(item.source_name || item.source_id)}</strong><small>${esc(item.owner || item.source_id)}</small></button></td><td>${badge(item.operational_state)}</td><td><span class="du2-cell-main">${esc((item.connector || {}).family || item.adapter || "—")}</span><small>${esc((item.connector || {}).maturity || "—")}</small></td><td><span class="du2-cell-main">${esc(item.schedule?.kind || "—")}</span><small>${fmtDate(item.schedule?.next_check_at)}</small></td><td><span class="du2-cell-main">${snapshot ? esc(String(snapshot.release_year || item.release_year || "—")) : "—"}</span><small>${snapshot ? shortHash(snapshot.raw_snapshot_sha256) : esc(tr("noSnapshot"))}</small></td><td><span class="du2-cell-main">${fmtInt(item.module_count)}</span><small>${fmtInt(item.dataset_count)} ${esc(state.lang === "ru" ? "наборов" : "datasets")}</small></td><td><button type="button" class="du2-icon-button" data-source-detail="${esc(item.source_id)}" aria-label="${esc(tr("openSource"))}">${icon("arrow")}</button></td></tr>`;
  }

  function baseSourcesTab() {
    const rows = filteredSources();
    return `<section class="du2-worktop"><div><span>Source registry</span><h2>${esc(state.lang === "ru" ? "62 источника с явным операционным профилем" : "62 sources with explicit operational profiles")}</h2><p>${esc(state.lang === "ru" ? "Реестр различает открытые API, официальные файлы, лицензируемые экспорты, credentialed endpoints и производные зависимости. Сетевая проверка не означает публикацию." : "The registry distinguishes open APIs, official files, licensed exports, credentialed endpoints and derived dependencies. A network check is not a publication.")}</p></div><div class="du2-worktop__actions"><button class="button" data-action="check-selected" ${state.selectedSources.size && isAdmin() ? "" : "disabled"}>${esc(tr("check"))}</button><button class="button primary" data-tab-link="plan">${esc(tr("requestPlan"))}</button></div></section>${sourceFilters()}<section class="card du2-table-card"><div class="du2-list-head"><span>${fmtInt(rows.length)} ${esc(state.lang === "ru" ? "источников" : "sources")}</span><span>${fmtInt(state.selectedSources.size)} ${esc(tr("selected").toLowerCase())}</span></div><div class="du2-table-scroll" role="region" aria-label="${esc(tr("sourceRegistry"))}" tabindex="0"><table class="du2-table"><thead><tr><th></th><th>${esc(tr("sourceRegistry"))}</th><th>${esc(tr("dataStatus"))}</th><th>${esc(tr("connector"))}</th><th>${esc(tr("cadence"))}</th><th>${esc(tr("latestSnapshot"))}</th><th>${esc(tr("affectedProducts"))}</th><th></th></tr></thead><tbody>${rows.map(sourceRow).join("")}</tbody></table></div>${rows.length ? "" : `<p class="du2-empty">${esc(tr("noRows"))}</p>`}</section>`;
  }

  function sourcesTab() {
    const count = fmtInt(state.dashboard?.summary?.source_count || state.dashboard?.sources?.length || 0);
    const fixed = state.lang === "ru" ? "62 источника с явным операционным профилем" : "62 sources with explicit operational profiles";
    const dynamic = state.lang === "ru" ? `${count} источников с явным операционным профилем` : `${count} sources with explicit operational profiles`;
    return baseSourcesTab().replace(fixed, dynamic);
  }

  function selectedChips() {
    const sourceMap = new Map((state.dashboard?.sources || []).map((item) => [item.source_id, item]));
    const moduleMap = new Map((state.dashboard?.modules || []).map((item) => [item.code, item]));
    const groupMap = new Map((state.dashboard?.groups || []).map((item) => [item.key, item]));
    const chips = [];
    state.selectedGroups.forEach((key) => { const item = groupMap.get(key); if (item) chips.push(`<button type="button" data-remove-group="${esc(key)}">${icon(GROUP_ICONS[key])}${esc(state.lang === "ru" ? item.label_ru : item.label_en)} ×</button>`); });
    state.selectedModules.forEach((key) => { const item = moduleMap.get(key); if (item) chips.push(`<button type="button" data-remove-module="${esc(key)}"><strong>${esc(key)}</strong>${esc(state.lang === "ru" ? item.name_ru : item.name_en)} ×</button>`); });
    state.selectedSources.forEach((key) => { const item = sourceMap.get(key); if (item) chips.push(`<button type="button" data-remove-source="${esc(key)}">${esc(item.source_name || key)} ×</button>`); });
    return chips.length ? `<div class="du2-chips">${chips.join("")}</div>` : `<p class="du2-empty du2-empty--bordered">${esc(tr("noSelection"))}</p>`;
  }

  function basePlanPreview() {
    const p = state.preview;
    if (!p) return `<section class="card du2-plan-placeholder">${icon("plan")}<h3>${esc(state.lang === "ru" ? "Сначала сформируйте dry-run" : "Build a dry run first")}</h3><p>${esc(tr("dryRunNote"))}</p></section>`;
    const ru = state.lang === "ru";
    return `<div class="du2-plan-grid"><section class="card"><div class="du2-section-head"><div><span>${esc(p.status)}</span><h2>${esc(state.lang === "ru" ? "Охват плана" : "Plan scope")}</h2></div>${badge(p.status)}</div><div class="du2-plan-metrics"><div><strong>${fmtInt(p.estimated.source_count)}</strong><span>${esc(state.lang === "ru" ? "источников" : "sources")}</span></div><div><strong>${fmtInt(p.estimated.module_count)}</strong><span>${esc(state.lang === "ru" ? "модулей" : "modules")}</span></div><div><strong>${fmtInt(p.estimated.dataset_count)}</strong><span>${esc(state.lang === "ru" ? "наборов" : "datasets")}</span></div><div><strong>${fmtInt(p.estimated.publication_target_count)}</strong><span>${esc(state.lang === "ru" ? "целей публикации" : "publication targets")}</span></div></div><div class="du2-impact-list"><h3>${esc(tr("affectedProducts"))}</h3>${(p.impacts || []).map((x) => `<span>${esc(x)}</span>`).join("") || "—"}<h3>${esc(tr("publicationTargets"))}</h3>${(p.publication_targets || []).map((x) => `<code>${esc(x)}</code>`).join("") || "—"}</div></section><section class="card"><div class="du2-section-head"><div><span>DAG</span><h2>${esc(tr("planSteps"))}</h2></div></div><ol class="du2-dag">${(p.steps || []).map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(ru ? step.label_ru : step.label_en)}</strong><small>${esc(step.code)}</small></div></li>`).join("")}</ol></section></div><div class="du2-plan-alerts">${p.blockers?.length ? `<section class="card du2-alert-card is-danger"><h3>${icon("alert")}${esc(tr("blockers"))}</h3>${p.blockers.map((x) => `<p><strong>${esc(x.source_id || x.code)}</strong>${esc(ru ? x.message_ru : x.message_en)}</p>`).join("")}</section>` : ""}${p.warnings?.length ? `<section class="card du2-alert-card is-warning"><h3>${icon("alert")}${esc(tr("warnings"))}</h3>${p.warnings.map((x) => `<p><strong>${esc(x.source_id || x.code)}</strong>${esc(ru ? x.message_ru : x.message_en)}</p>`).join("")}</section>` : ""}</div>`;
  }

  function planPreview() {
    const q = state.preview?.qs_scope;
    if (!q) return basePlanPreview();
    const ru = state.lang === "ru";
    const qsPanel = `<section class="card du2-qs-plan"><div class="du2-section-head"><div><span>${esc(ru ? "Аналитика QS" : "QS Intelligence")}</span><h2>${esc(ru ? "Проектный охват QS" : "QS project scope")}</h2></div><span class="du2-badge du2-badge--accent">${fmtInt((q.selected_source_ids || []).length)} ${esc(ru ? "источников" : "sources")}</span></div><p>${esc(ru ? "Каждый проект и редакция проходят собственные проверки полноты, прав и публикации; межпроектный супериндекс не создаётся." : "Every project and edition passes separate completeness, rights and publication gates; no cross-project super-index is created.")}</p><div class="du2-qs-metrics"><div><strong>${fmtInt(q.registered_projects)}</strong><span>${esc(ru ? "проектов" : "projects")}</span></div><div><strong>${fmtInt(q.loaded_projects)}</strong><span>${esc(ru ? "с данными" : "with data")}</span></div><div><strong>${fmtInt(q.subjects)}</strong><span>${esc(ru ? "дисциплин" : "subjects")}</span></div><div><strong>${fmtInt(q.entries)}</strong><span>${esc(ru ? "университетских строк" : "institution rows")}</span></div></div></section>`;
    return `${qsPanel}${basePlanPreview()}`;
  }

  function planTab() {
    const canPreview = state.selectedSources.size || state.selectedModules.size || state.selectedGroups.size;
    return `<section class="du2-worktop"><div><span>Dry run / dependency graph</span><h2>${esc(state.lang === "ru" ? "План обновления до изменения научной базы" : "Review the update before changing scientific data")}</h2><p>${esc(tr("dryRunNote"))}</p></div><div class="du2-worktop__actions"><button class="button" data-action="clear-selection">${esc(tr("clearSelection"))}</button><button class="button" data-action="preview" ${canPreview ? "" : "disabled"}>${esc(tr("requestPlan"))}</button><button class="button primary" data-action="create-plan" ${state.preview?.status === "ready" && isAdmin() ? "" : "disabled"}>${esc(tr("createPlan"))}</button></div></section>${selectedChips()}${planPreview()}`;
  }

  function eventTimeline(events = []) {
    return events.length ? `<ol class="du2-event-list">${events.map((event) => `<li class="is-${esc(event.level || "info")}"><time>${fmtDate(event.created_at, true)}</time><div><strong>${esc(event.message)}</strong><small>${esc(event.event_type)}</small></div></li>`).join("")}</ol>` : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`;
  }

  function diffPanel() {
    const d = state.jobDiff;
    if (!d) return "";
    const deltas = Object.entries(d.diff?.product_deltas || {});
    return `<section class="card du2-diff"><div class="du2-section-head"><div><span>${esc(d.job_id)}</span><h2>${esc(state.lang === "ru" ? "Дельта научного выпуска" : "Scientific release delta")}</h2></div><button type="button" class="du2-icon-button" data-action="close-diff">×</button></div><div class="du2-diff-grid">${deltas.map(([key, value]) => `<div><span>${esc(key.replace("portfolio.", "").replace("explorer.", ""))}</span><strong class="${Number(value.delta) < 0 ? "is-negative" : Number(value.delta) > 0 ? "is-positive" : ""}">${Number(value.delta) > 0 ? "+" : ""}${fmtInt(value.delta)}</strong><small>${fmtInt(value.before)} → ${fmtInt(value.after)}</small></div>`).join("")}</div></section>`;
  }

  function planList() {
    const plans = state.dashboard?.recent?.plans || [];
    return plans.length ? plans.map((item) => `<article class="du2-history-row"><button type="button" class="du2-history-main" data-expand-plan="${esc(item.plan_id)}"><span>${badge(item.status)}</span><span><strong>${esc(item.plan_id)}</strong><small>${fmtDate(item.created_at, true)} · ${(item.source_ids || []).length} ${esc(state.lang === "ru" ? "источников" : "sources")}</small></span>${icon("arrow")}</button>${state.expandedPlan === item.plan_id ? `<div class="du2-history-detail"><code>${esc((item.source_ids || []).join("\n"))}</code><div class="du2-inline-actions"><button class="button primary" data-stage-plan="${esc(item.plan_id)}" ${item.status === "ready" && isAdmin() ? "" : "disabled"}>${esc(tr("stage"))}</button></div></div>` : ""}</article>`).join("") : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`;
  }

  function jobList() {
    const jobs = state.dashboard?.recent?.jobs || [];
    return jobs.length ? jobs.map((item) => `<article class="du2-history-row"><button type="button" class="du2-history-main" data-expand-job="${esc(item.job_id)}"><span>${badge(item.status)}</span><span><strong>${esc(item.job_id)}</strong><small>${fmtDate(item.created_at, true)} · ${esc(item.plan_id || "")}</small></span>${icon("arrow")}</button>${state.expandedJob === item.job_id ? `<div class="du2-history-detail"><div class="du2-inline-actions"><button class="button" data-job-diff="${esc(item.job_id)}">${esc(tr("viewDiff"))}</button><button class="button primary" data-publish-job="${esc(item.job_id)}" ${item.status === "validated" && isAdmin() ? "" : "disabled"}>${esc(tr("publish"))}</button></div></div>` : ""}</article>`).join("") : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`;
  }

  function publicationList() {
    const items = state.dashboard?.recent?.publications || [];
    return items.length ? items.map((item) => `<article class="du2-history-row"><div class="du2-history-main is-static"><span>${badge(item.status)}</span><span><strong>${esc(item.publication_id)}</strong><small>${fmtDate(item.published_at, true)} · ${shortHash(item.published_db_sha256)}</small></span><button class="button" data-rollback="${esc(item.publication_id)}" ${item.status === "published" && isAdmin() ? "" : "disabled"}>${esc(tr("rollback"))}</button></div></article>`).join("") : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`;
  }

  function releasesTab() {
    return `<section class="du2-worktop"><div><span>Audit ledger</span><h2>${esc(state.lang === "ru" ? "Планы, staging-задания и опубликованные редакции" : "Plans, staging jobs and published editions")}</h2><p>${esc(state.lang === "ru" ? "Каждый переход фиксируется в отдельной control-базе. Научная SQLite остаётся неизменной до подтверждённой публикации." : "Every transition is recorded in a separate control database. Scientific SQLite remains unchanged until confirmed publication.")}</p></div></section>${diffPanel()}<div class="du2-history-grid"><section class="card"><div class="du2-section-head"><div><span>Plans</span><h2>${esc(state.lang === "ru" ? "Исполняемые планы" : "Executable plans")}</h2></div></div>${planList()}</section><section class="card"><div class="du2-section-head"><div><span>Jobs</span><h2>Staging</h2></div></div>${jobList()}</section><section class="card"><div class="du2-section-head"><div><span>Publications</span><h2>${esc(state.lang === "ru" ? "История релизов" : "Release history")}</h2></div></div>${publicationList()}</section></div>`;
  }

  function preflightChecklist() {
    const checks = state.preflight?.checks || [];
    return `<section class="card"><div class="du2-section-head"><div><span>Preflight</span><h2>${esc(state.lang === "ru" ? "Готовность к безопасному staging" : "Safe-staging readiness")}</h2></div><button class="button" data-action="preflight">${esc(tr("preflight"))}</button></div><div class="du2-checklist">${checks.map((item) => `<div><span class="du2-checkmark ${item.passed ? "is-ok" : item.warning_only ? "is-warning" : "is-failed"}">${item.passed ? "✓" : item.warning_only ? "!" : "×"}</span><span><strong>${esc(item.code)}</strong><small>${esc(item.value ?? (item.total ? `${item.explicit}/${item.total}` : ""))}</small></span></div>`).join("")}</div></section>`;
  }

  function connectorLedger() {
    const s = state.dashboard?.system || {}; const counts = s.connector_counts || {};
    return `<section class="card"><div class="du2-section-head"><div><span>Coverage</span><h2>${esc(state.lang === "ru" ? "Автоматизация без ложных обещаний" : "Automation without false promises")}</h2></div></div><div class="du2-coverage"><div><strong>${fmtInt(counts.implemented || 0)}</strong><span>${esc(state.lang === "ru" ? "исполняемых контуров" : "executable workflows")}</span></div><div><strong>${fmtInt(counts.review_required || 0)}</strong><span>${esc(state.lang === "ru" ? "требуют настройки" : "need connector review")}</span></div><div><strong>${fmtInt(counts.not_applicable || 0)}</strong><span>${esc(state.lang === "ru" ? "производных слоёв" : "derived layers")}</span></div><div><strong>${fmtInt(s.explicit_policy_count || 0)}</strong><span>${esc(state.lang === "ru" ? "индивидуальных политик" : "explicit policies")}</span></div></div><p>${esc(state.lang === "ru" ? "Открытый API, официальный файл, лицензируемый экспорт и производная формула остаются разными типами операций. Наличие коннектора не отменяет прав на конкретный выпуск." : "Open APIs, official files, licensed exports and derived formulas remain distinct operations. Connector availability never overrides release-specific rights.")}</p></section>`;
  }

  function operationsTab() {
    const commands = [
      "python scripts/manage_data_updates.py dashboard",
      "python scripts/manage_data_updates.py preflight --deep",
      "python scripts/manage_data_updates.py preview --module EPI --module WGI",
      "python scripts/manage_data_updates.py check --source YALE_EPI_2026",
      "python scripts/manage_data_updates.py plan --source YALE_EPI_2026",
      "python scripts/manage_data_updates.py stage PLAN_ID --execute-network-pipeline",
      "python scripts/manage_data_updates.py diff JOB_ID",
      "python scripts/manage_data_updates.py publish JOB_ID",
      "python scripts/manage_data_updates.py rollback PUBLICATION_ID",
    ];
    return `<section class="du2-worktop"><div><span>Operations</span><h2>${esc(state.lang === "ru" ? "Эксплуатация, аудит и автоматическое расписание" : "Operations, audit and scheduled automation")}</h2><p>${esc(state.lang === "ru" ? "По расписанию можно выполнять только проверку каналов и формирование сигналов. Публикация остаётся отдельной подтверждаемой операцией." : "Scheduled automation may check channels and create signals. Publication remains a separate confirmed operation.")}</p></div></section><div class="du2-ops-grid">${preflightChecklist()}${connectorLedger()}<section class="card du2-standards"><div class="du2-section-head"><div><span>Engineering contract</span><h2>${esc(tr("standards"))}</h2></div></div><ul><li><strong>HTTP validators</strong><span>ETag / Last-Modified / 304</span></li><li><strong>Dataset identity</strong><span>snapshot + SHA-256 + release label</span></li><li><strong>Provenance</strong><span>source → transform → value → product</span></li><li><strong>Publication</strong><span>staging → gates → atomic replace → rollback</span></li><li><strong>Product guard</strong><span>44 modules / 60 datasets / row-count invariants</span></li></ul></section><section class="card"><div class="du2-section-head"><div><span>CLI</span><h2>${esc(tr("commands"))}</h2></div></div><div class="du2-command-list">${commands.map((x) => `<code>${esc(x)}</code>`).join("")}</div></section></div>`;
  }

  function sourceDrawer() {
    const detail = state.sourceDetail;
    if (!detail) return "";
    const s = detail.source; const modules = detail.modules || [];
    return `<div class="du2-drawer-backdrop" data-action="close-source"></div><aside class="du2-drawer" role="dialog" aria-modal="true" aria-labelledby="du2-source-title"><header><div><span>${esc(s.source_id)}</span><h2 id="du2-source-title">${esc(s.source_name || s.source_id)}</h2><p>${esc(s.owner || "")}</p></div><button type="button" class="du2-drawer-close" data-action="close-source" aria-label="${esc(tr("close"))}">×</button></header><div class="du2-drawer-body"><section class="du2-source-summary"><div><span>${esc(tr("dataStatus"))}</span>${badge(s.operational_state)}</div><div><span>${esc(tr("currentRelease"))}</span><strong>${esc(String(s.release_year || s.policy?.latest_known_release || "—"))}</strong></div><div><span>${esc(tr("nextCheck"))}</span><strong>${fmtDate(s.schedule?.next_check_at)}</strong></div><div><span>${esc(tr("connector"))}</span><strong>${esc(s.connector?.family || s.adapter || "—")}</strong></div></section><section><h3>${esc(tr("modules"))}</h3><div class="du2-chips is-static">${modules.map((m) => `<a href="${esc(m.route)}"><strong>${esc(m.code)}</strong>${esc(state.lang === "ru" ? m.name_ru : m.name_en)}</a>`).join("") || "—"}</div></section><section><h3>${esc(state.lang === "ru" ? "Официальный канал" : "Official channel")}</h3><a href="${esc(s.official_url || s.source_url || s.url || "#")}" target="_blank" rel="noopener">${esc(s.official_url || s.source_url || s.url || "—")}</a><p>${esc(state.lang === "ru" ? s.policy?.notes_ru || s.license_note || "" : s.policy?.notes_en || s.license_note || "")}</p></section><section><h3>${esc(tr("snapshots"))}</h3>${detail.snapshots?.length ? `<div class="du2-detail-list">${detail.snapshots.slice(0, 8).map((x) => `<div><span><strong>${esc(x.snapshot_id)}</strong><small>${fmtDate(x.retrieved_at)} · ${fmtBytes(x.bytes_count)}</small></span><code>${shortHash(x.raw_snapshot_sha256)}</code></div>`).join("")}</div>` : `<p class="du2-empty">${esc(tr("noSnapshot"))}</p>`}</section><section><h3>${esc(tr("checks"))}</h3>${detail.checks?.length ? `<div class="du2-detail-list">${detail.checks.slice(0, 8).map((x) => `<div><span><strong>${esc(labelState(x.signal))}</strong><small>${fmtDate(x.checked_at, true)} · HTTP ${esc(x.http_status || "—")}</small></span>${badge(x.status)}</div>`).join("")}</div>` : `<p class="du2-empty">${esc(tr("noActivity"))}</p>`}</section>${isAdmin() && s.connector?.package_supported ? packageForm(s) : ""}</div></aside>`;
  }

  function packageForm(source) {
    return `<section class="du2-package"><h3>${esc(tr("packageRegistration"))}</h3><form data-package-form><input type="hidden" name="source_id" value="${esc(source.source_id)}"><label><span>${esc(tr("serverPath"))}</span><input class="input" name="file_path" required placeholder="/srv/gir/imports/release.xlsx"></label><label><span>${esc(tr("releaseLabel"))}</span><input class="input" name="release_label" placeholder="2027"></label><fieldset><legend>${esc(tr("packageRights"))}</legend>${[["official_or_authorized_export","officialPackage"],["storage_permitted","storagePermitted"],["transformation_permitted","transformPermitted"],["derived_publication_permitted","derivedPermitted"],["institution_row_publication_permitted","institutionRowsPermitted"]].map(([name,key]) => `<label><input type="checkbox" name="${name}"><span>${esc(tr(key))}</span></label>`).join("")}</fieldset><button class="button primary" type="submit">${esc(tr("registerPackage"))}</button></form></section>`;
  }

  function content() {
    if (state.loading) return `<div class="du2-loading"><span></span><p>${esc(tr("loading"))}</p></div>`;
    if (!state.dashboard) return `<section class="card du2-fatal"><h2>${esc(state.lang === "ru" ? "Центр обновлений недоступен" : "Update center unavailable")}</h2><pre>${esc(state.error)}</pre><button class="button primary" data-action="refresh">${esc(tr("refresh"))}</button></section>`;
    if (state.tab === "portfolio") return portfolioTab();
    if (state.tab === "sources") return sourcesTab();
    if (state.tab === "plan") return planTab();
    if (state.tab === "releases") return releasesTab();
    if (state.tab === "operations") return operationsTab();
    return overviewTab();
  }

  function renderShell() {
    if (!state.root) return;
    state.root.innerHTML = `<div class="du2-workspace">${header()}${readOnlyNotice()}${state.error ? `<div class="du2-notice is-error" role="alert"><strong>${esc(state.lang === "ru" ? "Операция не выполнена" : "Operation failed")}</strong><span>${esc(state.error)}</span><button type="button" data-action="dismiss">×</button></div>` : ""}${state.notice ? `<div class="du2-notice is-success" role="status"><strong>${esc(state.lang === "ru" ? "Готово" : "Completed")}</strong><span>${esc(state.notice)}</span><button type="button" data-action="dismiss">×</button></div>` : ""}${tabBar()}<main class="du2-content" role="tabpanel">${content()}</main>${state.mutation ? `<div class="du2-busy" role="status"><span></span>${esc(tr("operationRunning"))}</div>` : ""}${sourceDrawer()}</div>`;
    bind();
  }

  async function buildPreview() {
    state.error = "";
    state.preview = await request(`${API_V2}/plan-preview`, { method: "POST", body: JSON.stringify({ source_ids: [...state.selectedSources], module_codes: [...state.selectedModules], group_codes: [...state.selectedGroups], include_dependencies: true }) });
    renderShell();
  }

  function bind() {
    const root = state.root;
    root.querySelectorAll("[data-tab]").forEach((button, index, all) => {
      button.addEventListener("click", () => { state.tab = button.dataset.tab; renderShell(); });
      button.addEventListener("keydown", (event) => {
        let next = null; if (event.key === "ArrowRight") next = (index + 1) % all.length; if (event.key === "ArrowLeft") next = (index - 1 + all.length) % all.length; if (event.key === "Home") next = 0; if (event.key === "End") next = all.length - 1;
        if (next !== null) { event.preventDefault(); all[next].click(); all[next].focus(); }
      });
    });
    root.querySelectorAll("[data-tab-link]").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.tabLink; renderShell(); }));
    root.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", async () => {
      const action = button.dataset.action;
      if (action === "refresh") return load();
      if (action === "dismiss") { state.error = ""; state.notice = ""; return renderShell(); }
      if (action === "select-attention") { (state.dashboard?.operator_queue || []).forEach((x) => state.selectedSources.add(x.source_id)); state.tab = "sources"; return renderShell(); }
      if (action === "clear-selection") { state.selectedSources.clear(); state.selectedModules.clear(); state.selectedGroups.clear(); state.preview = null; return renderShell(); }
      if (action === "preview") { try { await buildPreview(); } catch (error) { state.error = error.message; renderShell(); } return; }
      if (action === "check-selected") return mutate("check", () => request(`${API}/check`, { method: "POST", body: JSON.stringify({ source_ids: [...state.selectedSources], network: true }) }), state.lang === "ru" ? "Проверка release-каналов завершена." : "Release-channel check completed.");
      if (action === "create-plan") return mutate("create-plan", async () => { const p = await request(`${API}/plans`, { method: "POST", body: JSON.stringify({ source_ids: state.preview?.selection?.source_ids || [] }) }); state.tab = "releases"; state.expandedPlan = p.plan_id; }, state.lang === "ru" ? "Исполняемый план создан." : "Executable plan created.");
      if (action === "preflight") return mutate("preflight", async () => { state.preflight = await request(`${API_V2}/preflight?deep=true`); }, state.lang === "ru" ? "Глубокая проверка завершена." : "Deep preflight completed.");
      if (action === "close-source") return closeSource();
      if (action === "close-diff") { state.jobDiff = null; return renderShell(); }
    }));
    root.querySelectorAll("[data-filter]").forEach((control) => control.addEventListener(control.tagName === "INPUT" ? "input" : "change", () => {
      const key = control.dataset.filter; if (key === "module-query") state.moduleQuery = control.value; if (key === "module-group") state.moduleGroup = control.value; if (key === "module-state") state.moduleState = control.value; if (key === "source-query") state.sourceQuery = control.value; if (key === "source-group") state.sourceGroup = control.value; if (key === "source-state") state.sourceState = control.value; renderShell(); root.querySelector(`[data-filter="${key}"]`)?.focus();
    }));
    root.querySelectorAll("[data-source-select]").forEach((input) => input.addEventListener("change", () => { input.checked ? state.selectedSources.add(input.dataset.sourceSelect) : state.selectedSources.delete(input.dataset.sourceSelect); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-module-select]").forEach((input) => input.addEventListener("change", () => { input.checked ? state.selectedModules.add(input.dataset.moduleSelect) : state.selectedModules.delete(input.dataset.moduleSelect); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-group-select]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.groupSelect; state.selectedGroups.has(key) ? state.selectedGroups.delete(key) : state.selectedGroups.add(key); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-remove-source]").forEach((button) => button.addEventListener("click", () => { state.selectedSources.delete(button.dataset.removeSource); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-remove-module]").forEach((button) => button.addEventListener("click", () => { state.selectedModules.delete(button.dataset.removeModule); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-remove-group]").forEach((button) => button.addEventListener("click", () => { state.selectedGroups.delete(button.dataset.removeGroup); state.preview = null; renderShell(); }));
    root.querySelectorAll("[data-source-detail]").forEach((button) => button.addEventListener("click", async () => { state.sourceFocusReturn = button; try { state.sourceDetail = await request(`${API_V2}/sources/${encodeURIComponent(button.dataset.sourceDetail)}`); renderShell(); setTimeout(() => root.querySelector(".du2-drawer-close")?.focus(), 0); } catch (error) { state.error = error.message; renderShell(); } }));
    root.querySelectorAll("[data-expand-plan]").forEach((button) => button.addEventListener("click", () => { state.expandedPlan = state.expandedPlan === button.dataset.expandPlan ? "" : button.dataset.expandPlan; renderShell(); }));
    root.querySelectorAll("[data-expand-job]").forEach((button) => button.addEventListener("click", () => { state.expandedJob = state.expandedJob === button.dataset.expandJob ? "" : button.dataset.expandJob; renderShell(); }));
    root.querySelectorAll("[data-stage-plan]").forEach((button) => button.addEventListener("click", () => { if (!window.confirm(state.lang === "ru" ? "Создать staging-копию, выполнить импортёры и все научные валидаторы?" : "Create staging, run importers and all scientific validators?")) return; mutate("stage", () => request(`${API}/jobs`, { method: "POST", body: JSON.stringify({ plan_id: button.dataset.stagePlan, execute_network_pipeline: true, run_external_validators: true }) }), state.lang === "ru" ? "Staging завершён." : "Staging completed."); }));
    root.querySelectorAll("[data-job-diff]").forEach((button) => button.addEventListener("click", async () => { try { state.jobDiff = await request(`${API_V2}/jobs/${encodeURIComponent(button.dataset.jobDiff)}/diff`); renderShell(); } catch (error) { state.error = error.message; renderShell(); } }));
    root.querySelectorAll("[data-publish-job]").forEach((button) => button.addEventListener("click", () => { if (!window.confirm(state.lang === "ru" ? "Опубликовать проверенную staging-редакцию и создать rollback-копию?" : "Publish the validated staging edition and create a rollback copy?")) return; mutate("publish", () => request(`${API}/jobs/${encodeURIComponent(button.dataset.publishJob)}/publish`, { method: "POST", body: "{}" }), state.lang === "ru" ? "Новая редакция опубликована." : "New edition published."); }));
    root.querySelectorAll("[data-rollback]").forEach((button) => button.addEventListener("click", () => { if (!window.confirm(state.lang === "ru" ? "Восстановить предыдущую научную редакцию и все файловые наборы?" : "Restore the previous scientific edition and all file sets?")) return; mutate("rollback", () => request(`${API}/rollback/${encodeURIComponent(button.dataset.rollback)}`, { method: "POST", body: "{}" }), state.lang === "ru" ? "Предыдущая редакция восстановлена." : "Previous edition restored."); }));
    const packageFormNode = root.querySelector("[data-package-form]");
    if (packageFormNode) packageFormNode.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(packageFormNode); const rights = {}; ["official_or_authorized_export","storage_permitted","transformation_permitted","derived_publication_permitted","institution_row_publication_permitted"].forEach((key) => rights[key] = form.get(key) === "on"); mutate("package", () => request(`${API}/packages/register`, { method: "POST", body: JSON.stringify({ source_id: form.get("source_id"), file_path: form.get("file_path"), release_label: form.get("release_label"), rights }) }), state.lang === "ru" ? "Пакет зарегистрирован и проверен по SHA-256." : "Package registered and SHA-256 verified."); });
    document.removeEventListener("keydown", onGlobalKeydown); document.addEventListener("keydown", onGlobalKeydown);
  }

  function closeSource() { state.sourceDetail = null; renderShell(); const target = state.sourceFocusReturn; state.sourceFocusReturn = null; setTimeout(() => target?.focus?.(), 0); }
  function onGlobalKeydown(event) {
    if (event.key === "Escape" && state.sourceDetail) { event.preventDefault(); closeSource(); return; }
    if (state.sourceDetail && event.key === "Tab") {
      const drawer = state.root?.querySelector(".du2-drawer"); if (!drawer) return; const focusable = [...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]; if (!focusable.length) return; const first = focusable[0], last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  async function render(options = {}) {
    state.root = document.getElementById("view"); state.lang = options.lang === "en" ? "en" : "ru"; state.theme = options.theme || "dark";
    renderShell(); if (!state.dashboard && !state.loading) await load();
  }

  function invalidate() { state.dashboard = null; state.preflight = null; state.preview = null; }
  window.addEventListener("gir:auth-changed", renderShell);
  window.GIRDataUpdates = { render, invalidate };
})();
