/* GIR · QS Intelligence Workspace
 *
 * A portfolio-level analytical surface for QS World University Rankings,
 * subject rankings, sustainability, regional rankings, business education,
 * cities, skills and ratings. It deliberately keeps official QS rows and
 * GIR-derived country profiles as separate analytical layers.
 */
(() => {
  "use strict";

  const DEFAULT_PROJECT = "QS_AREA_ENGINEERING_TECHNOLOGY";
  const MAX_COMPARE = 4;
  const FAMILY_ORDER = [
    "world", "subject_area", "subject", "sustainability", "regional",
    "mba", "business_masters", "online_mba", "executive_mba",
    "international_trade", "city", "country", "rating", "legacy",
  ];
  const TAB_ORDER = ["overview", "ranking", "universities", "countries", "subjects", "geography", "data"];
  const RANK_BANDS = [
    { key: "top50", max: 50, ru: "Первые 50", en: "Top 50" },
    { key: "top100", max: 100, ru: "Места 51–100", en: "51–100" },
    { key: "top250", max: 250, ru: "Места 101–250", en: "101–250" },
    { key: "top500", max: 500, ru: "Места 251–500", en: "251–500" },
    { key: "rest", max: Infinity, ru: "Места 501 и ниже", en: "501+" },
  ];

  const FAMILY_META = {
    world: { ru: "Мировой рейтинг", en: "World ranking", code: "WUR", tone: "blue" },
    subject_area: { ru: "Предметные области", en: "Broad subject areas", code: "AREA", tone: "teal" },
    subject: { ru: "Дисциплины", en: "Subjects", code: "55", tone: "teal" },
    sustainability: { ru: "Устойчивое развитие", en: "Sustainability", code: "ESG", tone: "green" },
    regional: { ru: "Региональные рейтинги", en: "Regional rankings", code: "REG", tone: "violet" },
    mba: { ru: "Глобальный рейтинг программ делового администрирования", en: "Global MBA", code: "MBA", tone: "orange" },
    business_masters: { ru: "Магистратуры по бизнесу", en: "Business Masters", code: "MSC", tone: "orange" },
    online_mba: { ru: "Онлайн-программы делового администрирования", en: "Online MBA", code: "OMBA", tone: "orange" },
    executive_mba: { ru: "Деловое администрирование для руководителей", en: "Executive MBA", code: "EMBA", tone: "orange" },
    international_trade: { ru: "Международная торговля", en: "International Trade", code: "ITR", tone: "orange" },
    city: { ru: "Студенческие города", en: "Student cities", code: "CITY", tone: "violet" },
    country: { ru: "Навыки будущего", en: "Future skills", code: "SKILL", tone: "violet" },
    rating: { ru: "Звёзды QS", en: "QS Stars", code: "STAR", tone: "gold" },
    legacy: { ru: "Исторические проекты", en: "Legacy projects", code: "HIST", tone: "muted" },
  };

  const AREA_META = {
    ARTS_HUMANITIES: { ru: "Искусство и гуманитарные науки", en: "Arts & Humanities", code: "A&H", tone: "violet" },
    ENGINEERING_TECHNOLOGY: { ru: "Инженерия и технологии", en: "Engineering & Technology", code: "E&T", tone: "blue" },
    LIFE_SCIENCES_MEDICINE: { ru: "Науки о жизни и медицина", en: "Life Sciences & Medicine", code: "LSM", tone: "green" },
    NATURAL_SCIENCES: { ru: "Естественные науки", en: "Natural Sciences", code: "NS", tone: "teal" },
    SOCIAL_SCIENCES_MANAGEMENT: { ru: "Социальные науки и менеджмент", en: "Social Sciences & Management", code: "SSM", tone: "orange" },
  };

  const cache = {
    base: null,
    project: new Map(),
    ranking: new Map(),
    country: new Map(),
    institution: new Map(),
  };
  let context = null;
  let loadSerial = 0;
  let renderGeneration = 0;
  let activeController = null;
  let institutionController = null;
  let model = null;
  const ui = {
    tab: "overview",
    project: DEFAULT_PROJECT,
    edition: null,
    country: null,
    rankingQuery: "",
    rankingCountry: "all",
    rankingBand: "all",
    rankingPage: 1,
    rankingPageSize: 50,
    selectedEntity: null,
    compare: [],
    institutionQuery: "",
    subjectQuery: "",
    subjectArea: "all",
    dataFamily: "all",
    dataStatus: "all",
  };

  function lang() { return context?.lang === "en" ? "en" : "ru"; }
  function localiseRussianTerms(value) {
    return String(value)
      .replace(/\bScore\b/g, "Оценка")
      .replace(/\bscore\b/g, "оценка")
      .replace(/\bendpoint\b/gi, "официальный интерфейс данных")
      .replace(/\baliases\b/gi, "альтернативные названия")
      .replace(/\bRights gates\b/gi, "Ограничения прав")
      .replace(/\bprovenance\b/gi, "происхождение данных")
      .replace(/\bquality flag\b/gi, "признак качества")
      .replace(/\bsnapshot\b/gi, "снимок данных")
      .replace(/\bratings\b/gi, "рейтинговые оценки")
      .replace(/\bdata science\b/gi, "анализ данных")
      .replace(/\bsource-gated\b/gi, "ожидает источник")
      .replace(/\bQS ID\b/g, "идентификатор QS")
      .replace(/\bQS E&T\b/g, "QS «Инженерия и технологии»")
      .replace(/\bQS Engineering & Technology\b/g, "QS «Инженерия и технологии»")
      .replace(/\bWUR\b/g, "мировой рейтинг")
      .replace(/\bMBA\b/g, "программы делового администрирования");
  }
  function tr(ru, en) { return lang() === "ru" ? localiseRussianTerms(ru) : en; }
  function finaliseVisibleHtml(value) {
    let html = String(value);
    if (lang() === "ru") {
      html = html
        .replace(/>Score</g, ">Оценка<")
        .replace(/>H-index</g, ">Индекс Хирша<")
        .replace(/>Provenance</g, ">Происхождение данных<")
        .replace(/>Snapshot \+ SHA-256</g, ">Снимок данных + SHA-256<")
        .replace(/>QS World University Rankings by Subject</g, ">Предметные рейтинги QS<")
        .replace(/>Top 100</g, ">Первые 100<")
        .replace(/>Top 250</g, ">Первые 250<");
    }
    const missing = missingValue();
    return html
      .replace(/<div class="qsi-institution-rank">QS<\/div>/g, `<div class="qsi-institution-rank">${missing}</div>`)
      .replace(/operator_confirmed_authorized_export/g, tr("подтверждённая разрешённая выгрузка", "operator-confirmed authorised export"))
      .replace(/staged_partial_authorized_export/g, tr("частично загруженная разрешённая выгрузка", "partially staged authorised export"))
      .replace(/redistribution_prohibited/g, tr("повторное распространение запрещено", "redistribution prohibited"))
      .replace(/rights_not_confirmed/g, tr("права не подтверждены", "rights not confirmed"))
      .replace(/not_loaded/g, tr("данные не загружены", "data not loaded"))
      .replace(new RegExp(`#${missing}`, "g"), missing)
      .replace(/>—</g, `>${missing}<`)
      .replace(/— ·/g, `${missing} ·`)
      .replace(/· —/g, `· ${missing}`)
      .replace(/ · <\/small>/g, ` · ${missing}</small>`);
  }
  function missingValue() { return tr("не указано в источнике", "not reported by source"); }
  function esc(value) {
    if (context?.escapeHtml) return context.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function fmt(value, digits = 1) {
    if (value == null || !Number.isFinite(Number(value))) return missingValue();
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function intFmt(value) {
    if (value == null || !Number.isFinite(Number(value))) return missingValue();
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 0 });
  }
  function pct(value, digits = 0) {
    if (value == null || !Number.isFinite(Number(value))) return missingValue();
    return `${fmt(Number(value) <= 1 ? Number(value) * 100 : Number(value), digits)}%`;
  }
  function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function array(value) { return Array.isArray(value) ? value : []; }
  function normaliseCountry(value) {
    const code = String(value || "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
  }
  function isAbort(error) { return error?.name === "AbortError"; }
  function isCurrent(generation, root = context?.root) {
    return generation === renderGeneration && Boolean(root?.isConnected) && root === context?.root;
  }
  function beginLoad() {
    activeController?.abort();
    institutionController?.abort();
    activeController = new AbortController();
    institutionController = null;
    renderGeneration += 1;
    cache.base = null;
    cache.project.clear();
    cache.ranking.clear();
    cache.country.clear();
    cache.institution.clear();
    return { generation: renderGeneration, signal: activeController.signal, root: context?.root };
  }
  function projectName(project) { return (lang() === "ru" ? project?.name_ru : project?.name_en) || project?.project_code || missingValue(); }
  function familyMeta(family) { return FAMILY_META[family] || { ru: family, en: family, code: String(family || "QS").slice(0, 5).toUpperCase(), tone: "muted" }; }
  function familyName(family) { const item = familyMeta(family); return lang() === "ru" ? item.ru : item.en; }
  function areaName(area) { const item = AREA_META[area]; return item ? (lang() === "ru" ? item.ru : item.en) : area; }
  function selectedProject() { return array(model?.base?.catalog?.projects).find((item) => item.project_code === ui.project) || null; }
  function selectedEditionRow() { return array(model?.project?.editions).find((item) => Number(item.edition_year) === Number(ui.edition)) || null; }
  function rankingRows() { return array(model?.ranking?.items); }
  function countryPayload() { return model?.country || {}; }
  function currentCountryProfile() { return countryPayload()?.profile || null; }
  function currentCountryInstitutions() { return array(countryPayload()?.institutions); }
  function currentCountryComponents() { return array(countryPayload()?.components); }
  function platformCountries() { return array(context?.platformContext?.countries); }
  function countryMeta(iso3 = ui.country) {
    const code = normaliseCountry(iso3);
    return platformCountries().find((item) => item.iso3 === code) || (code ? { iso3: code, name_ru: code, name_en: code } : null);
  }
  function countryName(iso3 = ui.country) {
    const item = countryMeta(iso3);
    return item ? ((lang() === "ru" ? item.name_ru : item.name_en) || item.iso3) : tr("Страна не выбрана", "Country not selected");
  }
  function flag(iso3, cls = "") {
    const item = countryMeta(iso3);
    if (!item) return `<span class="qsi-flag-fallback">${esc(tr("Выберите страну", "Select a country"))}</span>`;
    return context?.flagImage ? context.flagImage(item, cls) : `<span class="qsi-flag-fallback">${esc(item.iso3)}</span>`;
  }
  function latestLoadedProject() {
    return array(model?.base?.projects?.items)[0] || array(model?.base?.catalog?.projects).find((item) => item.project_code === DEFAULT_PROJECT) || null;
  }
  function isPublished() { return model?.ranking?.status === "published" && rankingRows().length > 0; }
  function hasCountryProfile() { return Boolean(currentCountryProfile()); }
  function statusLabel(status) {
    const labels = {
      published: ["Опубликовано", "Published"],
      source_gated: ["Ожидает официальный пакет", "Awaiting official package"],
      rights_gated: ["Ограничено правами", "Rights-gated"],
      staged_partial: ["Неполный выпуск", "Partial release"],
      operational: ["Контур готов", "Workspace ready"],
    };
    const pair = labels[status] || [status || "статус не указан", status || "status not reported"];
    return lang() === "ru" ? pair[0] : pair[1];
  }
  function qualityLabel(flagValue) {
    const map = {
      official_value: ["Официальная строка", "Official row"],
      official_complete_release: ["Полный выпуск", "Complete release"],
      recomputed_from_official_components: ["Производная агрегация GIR", "GIR-derived aggregation"],
    };
    const pair = map[flagValue] || [flagValue || "качество не указано", flagValue || "quality not reported"];
    return lang() === "ru" ? pair[0] : pair[1];
  }

  async function fetchJSON(url, signal) {
    const response = await fetch(url, { cache: "no-store", signal });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body?.detail;
      const message = typeof detail === "string" ? detail : detail?.message || detail?.code || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return body;
  }

  function readUrlState() {
    const params = new URLSearchParams(location.search);
    const tab = params.get("qs_tab");
    if (TAB_ORDER.includes(tab)) ui.tab = tab;
    if (params.get("qs_project")) ui.project = params.get("qs_project").toUpperCase();
    if (params.get("qs_edition")) ui.edition = Number(params.get("qs_edition"));
    const urlCountry = normaliseCountry(params.get("qs_country"));
    if (urlCountry) ui.country = urlCountry;
    if (params.get("qs_entity")) ui.selectedEntity = params.get("qs_entity");
    const compare = (params.get("qs_compare") || "").split(",").filter(Boolean).slice(0, MAX_COMPARE);
    if (compare.length) ui.compare = compare;
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set("qs_tab", ui.tab);
    url.searchParams.set("qs_project", ui.project);
    if (ui.edition) url.searchParams.set("qs_edition", String(ui.edition)); else url.searchParams.delete("qs_edition");
    if (ui.country) url.searchParams.set("qs_country", ui.country); else url.searchParams.delete("qs_country");
    if (ui.selectedEntity) url.searchParams.set("qs_entity", ui.selectedEntity); else url.searchParams.delete("qs_entity");
    if (ui.compare.length) url.searchParams.set("qs_compare", ui.compare.join(",")); else url.searchParams.delete("qs_compare");
    history.replaceState(null, "", `${url.pathname}${url.search}${location.hash}`);
  }

  async function loadBase(signal) {
    if (!cache.base) {
      cache.base = Promise.all([
        fetchJSON("/api/qs/status", signal),
        fetchJSON("/api/qs/catalog?include_inactive=true", signal),
        fetchJSON("/api/qs/projects?loaded_only=true", signal),
        fetchJSON("/api/qs/coverage", signal),
        fetchJSON("/api/qs/subjects", signal),
      ]).then(([status, catalog, projects, coverage, subjects]) => ({ status, catalog, projects, coverage, subjects }))
        .catch((error) => { cache.base = null; throw error; });
    }
    return cache.base;
  }

  async function loadProject(code, signal) {
    if (!cache.project.has(code)) {
      const request = Promise.all([
        fetchJSON(`/api/qs/projects/${encodeURIComponent(code)}`, signal),
        fetchJSON(`/api/qs/projects/${encodeURIComponent(code)}/editions`, signal),
      ]).then(([details, editions]) => ({ ...details, editions: editions.items || [] }))
        .catch((error) => { cache.project.delete(code); throw error; });
      cache.project.set(code, request);
    }
    return cache.project.get(code);
  }

  async function loadRanking(code, edition, signal) {
    const key = `${code}:${edition || "latest"}`;
    if (!cache.ranking.has(key)) {
      const params = new URLSearchParams({ limit: "2000" });
      if (edition) params.set("edition", String(edition));
      const request = fetchJSON(`/api/qs/projects/${encodeURIComponent(code)}/ranking?${params}`, signal)
        .catch((error) => { cache.ranking.delete(key); throw error; });
      cache.ranking.set(key, request);
    }
    return cache.ranking.get(key);
  }

  async function loadCountry(code, edition, iso3, signal) {
    if (!normaliseCountry(iso3)) {
      return { project_code: code, edition, status: "country_required", profile: null, components: [], institutions: [] };
    }
    const key = `${code}:${edition || "latest"}:${iso3}`;
    if (!cache.country.has(key)) {
      const params = new URLSearchParams();
      if (edition) params.set("edition", String(edition));
      const request = fetchJSON(`/api/qs/countries/${encodeURIComponent(iso3)}/projects/${encodeURIComponent(code)}?${params}`, signal)
        .catch((error) => { cache.country.delete(key); throw error; });
      cache.country.set(key, request);
    }
    return cache.country.get(key);
  }

  async function loadInstitution(entityId, signal) {
    if (!entityId) return null;
    if (!cache.institution.has(entityId)) {
      const request = fetchJSON(`/api/qs/institutions/${encodeURIComponent(entityId)}`, signal)
        .catch((error) => { cache.institution.delete(entityId); throw error; });
      cache.institution.set(entityId, request);
    }
    return cache.institution.get(entityId);
  }

  async function hydrate(generation, signal) {
    const token = ++loadSerial;
    const base = await loadBase(signal);
    if (token !== loadSerial || !isCurrent(generation)) return null;
    const catalogCodes = new Set(array(base.catalog.projects).map((item) => item.project_code));
    if (!catalogCodes.has(ui.project)) ui.project = latestProjectFromBase(base)?.project_code || DEFAULT_PROJECT;
    const project = await loadProject(ui.project, signal);
    if (token !== loadSerial || !isCurrent(generation)) return null;
    const editions = array(project.editions).filter((item) => Number(item.actual_rows || 0) > 0);
    if (!ui.edition || !array(project.editions).some((item) => Number(item.edition_year) === Number(ui.edition))) {
      ui.edition = Number(editions[0]?.edition_year || project.project?.current_edition || selectedProjectFromBase(base, ui.project)?.current_edition || 2026);
    }
    const [ranking, country] = await Promise.all([
      loadRanking(ui.project, ui.edition, signal),
      loadCountry(ui.project, ui.edition, ui.country, signal),
    ]);
    let institution = null;
    const fallbackEntity = ranking?.items?.[0]?.entity_id || null;
    if (ui.selectedEntity && array(ranking?.items).some((item) => item.entity_id === ui.selectedEntity)) institution = await loadInstitution(ui.selectedEntity, signal);
    else if (fallbackEntity && ui.tab === "universities") {
      ui.selectedEntity = fallbackEntity;
      institution = await loadInstitution(fallbackEntity, signal);
    }
    if (token !== loadSerial || !isCurrent(generation)) return null;
    model = { base, project, ranking, country, institution };
    syncUrl();
    return model;
  }

  function latestProjectFromBase(base) { return array(base?.projects?.items)[0] || array(base?.catalog?.projects).find((item) => item.project_code === DEFAULT_PROJECT); }
  function selectedProjectFromBase(base, code) { return array(base?.catalog?.projects).find((item) => item.project_code === code); }

  function markSvg() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 17h50M7 31h34M7 45h50"/><circle cx="47" cy="31" r="10"/><path d="M47 25v12M41 31h12"/></svg>`;
  }

  function renderLoading(root) {
    root.innerHTML = `<section class="qsi-workspace"><div class="qsi-loading"><div class="qsi-mark">${markSvg()}</div><span>QS Intelligence</span><h1>${tr("Формируем университетский портфель", "Building the university intelligence portfolio")}</h1><p>${tr("Загружаются проекты, редакции, университетские строки, страновые профили и пространственные данные.", "Loading projects, editions, university rows, country profiles and spatial evidence.")}</p></div></section>`;
  }

  function renderError(root, error) {
    root.innerHTML = `<section class="qsi-workspace"><div class="qsi-error"><div class="qsi-mark">${markSvg()}</div><span>QS Intelligence</span><h1>${tr("Не удалось загрузить QS-портфель", "Could not load the QS portfolio")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="qsi-button" data-qsi-retry>${tr("Повторить", "Retry")}</button></div></section>`;
    root.querySelector("[data-qsi-retry]")?.addEventListener("click", () => refresh());
  }

  function projectOptions() {
    const projects = array(model?.base?.catalog?.projects).filter((item) => Number(item.active) === 1);
    const groups = new Map();
    for (const project of projects) {
      if (!groups.has(project.family)) groups.set(project.family, []);
      groups.get(project.family).push(project);
    }
    return FAMILY_ORDER.filter((family) => groups.has(family)).map((family) => {
      const options = groups.get(family).sort((a, b) => projectName(a).localeCompare(projectName(b), lang() === "ru" ? "ru" : "en"));
      return `<optgroup label="${esc(familyName(family))}">${options.map((item) => `<option value="${esc(item.project_code)}" ${item.project_code === ui.project ? "selected" : ""}>${esc(projectName(item))}</option>`).join("")}</optgroup>`;
    }).join("");
  }

  function editionOptions() {
    const editions = array(model?.project?.editions);
    const current = selectedProject()?.current_edition;
    if (!editions.length) return `<option value="${esc(current || 2026)}">${esc(current || 2026)}</option>`;
    return editions.map((item) => `<option value="${item.edition_year}" ${Number(item.edition_year) === Number(ui.edition) ? "selected" : ""}>${esc(item.release_label || item.edition_year)} · ${intFmt(item.actual_rows)} ${tr("строк", "rows")}</option>`).join("");
  }

  function countryOptions(includeAll = false) {
    const countries = [...platformCountries()].sort((a, b) => countryName(a.iso3).localeCompare(countryName(b.iso3), lang() === "ru" ? "ru" : "en"));
    const required = !includeAll && !normaliseCountry(ui.country)
      ? `<option value="" selected disabled>${tr("Выберите страну", "Select a country")}</option>`
      : "";
    return `${required}${includeAll ? `<option value="all" ${ui.rankingCountry === "all" ? "selected" : ""}>${tr("Все страны", "All countries")}</option>` : ""}${countries.map((item) => `<option value="${esc(item.iso3)}" ${(includeAll ? ui.rankingCountry : ui.country) === item.iso3 ? "selected" : ""}>${esc(countryName(item.iso3))}</option>`).join("")}`;
  }

  function exportPermitted() {
    const editionPermission = selectedEditionRow()?.export_permitted;
    const rankingPermission = model?.ranking?.export_permitted;
    return isPublished() && (
      editionPermission === true || Number(editionPermission) === 1
      || rankingPermission === true || Number(rankingPermission) === 1
    );
  }

  function commandHeader() {
    const project = selectedProject();
    const edition = selectedEditionRow();
    const published = isPublished();
    const canExport = exportPermitted();
    const exportExplanation = published
      ? tr("Выгрузка строк отключена условиями текущей лицензии.", "Row export is disabled by the current licence.")
      : tr("Экспорт станет доступен только для опубликованной и разрешённой редакции.", "Export is available only for a published, permitted edition.");
    return `<header class="qsi-command"><div class="qsi-command-identity"><div class="qsi-command-mark">${markSvg()}</div><div><span class="qsi-kicker">GIR · QS Intelligence</span><h1>${tr("Университеты, дисциплины и образовательные экосистемы", "Universities, subjects and education ecosystems")}</h1><p>${tr("Единое рабочее пространство QS: мировой рейтинг, 55 дисциплин, устойчивость, регионы, бизнес-образование, студенческие города и производные страновые профили GIR.", "One QS intelligence surface for the world ranking, 55 subjects, sustainability, regions, business education, student cities and GIR-derived country profiles.")}</p></div></div><div class="qsi-command-actions"><button type="button" class="qsi-button is-secondary" data-qsi-tab="data">${tr("Метод и данные", "Method & data")}</button><a class="qsi-button" href="${esc(project?.official_url || "https://www.topuniversities.com/qs-top-uni-wur")}" target="_blank" rel="noopener noreferrer">${tr("Официальный QS", "Official QS")} ↗</a></div></header>
      <section class="qsi-toolbar" aria-label="${tr("Параметры QS", "QS controls")}">
        <label class="qsi-field qsi-field-project"><span>${tr("Рейтинговый проект", "Ranking project")}</span><select class="qsi-select" data-qsi-project>${projectOptions()}</select></label>
        <label class="qsi-field"><span>${tr("Редакция", "Edition")}</span><select class="qsi-select" data-qsi-edition>${editionOptions()}</select></label>
        <label class="qsi-field"><span>${tr("Страна", "Country")}</span><select class="qsi-select" data-qsi-country>${countryOptions(false)}</select></label>
        <div class="qsi-toolbar-state ${published ? "is-ready" : "is-gated"}"><i></i><div><span>${published ? statusLabel("published") : statusLabel(model?.ranking?.status)}</span><strong>${published ? `${intFmt(edition?.actual_rows || rankingRows().length)} ${tr("университетских строк", "university rows")}` : tr("Числовой выпуск ещё не установлен", "Numeric release not yet installed")}</strong></div></div>
        <div class="qsi-export-control"><button type="button" class="qsi-button qsi-export" data-qsi-export aria-describedby="qsi-export-note" ${canExport ? "" : "disabled"}>CSV</button><small id="qsi-export-note">${esc(exportExplanation)}</small></div>
      </section>`;
  }

  function tabs() {
    const labels = {
      overview: ["Обзор", "Overview"], ranking: ["Рейтинг", "Ranking"], universities: ["Университеты", "Universities"],
      countries: ["Страновые системы", "Country systems"], subjects: ["Дисциплины и портфель", "Subjects & portfolio"],
      geography: ["География", "Geography"], data: ["Данные и метод", "Data & method"],
    };
    return `<nav class="qsi-tabs" role="tablist" aria-label="${tr("Разделы QS", "QS views")}">${TAB_ORDER.map((tab, index) => `<button type="button" role="tab" aria-selected="${ui.tab === tab}" tabindex="${ui.tab === tab ? "0" : "-1"}" data-qsi-tab="${tab}" data-qsi-tab-index="${index}">${lang() === "ru" ? labels[tab][0] : labels[tab][1]}</button>`).join("")}</nav>`;
  }

  function kpis() {
    const status = model?.base?.status || {};
    const project = selectedProject();
    const edition = selectedEditionRow();
    const profile = currentCountryProfile();
    const rows = rankingRows();
    return `<section class="qsi-kpis" aria-label="${tr("Ключевые показатели", "Key indicators")}">
      <article><span>${tr("Проекты QS", "QS projects")}</span><strong>${intFmt(status.projects_registered)}</strong><small>${tr("14 семейств", "14 families")}</small></article>
      <article><span>${tr("Дисциплины", "Subjects")}</span><strong>${intFmt(status.subjects)}</strong><small>${intFmt(status.broad_subject_areas)} ${tr("областей", "broad areas")}</small></article>
      <article class="is-accent"><span>${tr("Текущий проект", "Selected project")}</span><strong>${esc(familyMeta(project?.family).code)}</strong><small>${esc(projectName(project))}</small></article>
      <article><span>${tr("Университеты", "Universities")}</span><strong>${intFmt(edition?.actual_rows || rows.length)}</strong><small>${intFmt(edition?.actual_country_count || new Set(rows.map((item) => item.iso3).filter(Boolean)).size)} ${tr("стран", "countries")}</small></article>
      <article><span>${countryName()}</span><strong>${profile?.rank == null ? missingValue() : `#${intFmt(profile.rank)}`}</strong><small>${profile ? `${intFmt(profile.institution_count)} ${tr("университетов", "universities")}` : tr("нет опубликованного профиля", "no published profile")}</small></article>
      <article class="is-status ${isPublished() ? "is-ready" : "is-gated"}"><span>${tr("Статус данных", "Data status")}</span><strong>${statusLabel(isPublished() ? "published" : model?.ranking?.status)}</strong><small>${selectedEditionRow()?.rights_status || tr("проект зарегистрирован", "project registered")}</small></article>
    </section>`;
  }

  function sectionHeader(step, title, copy, layer = "") {
    return `<header><div class="qsi-panel-title"><span>${esc(step)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ""}</div>${layer ? `<div class="qsi-layer-tag">${esc(layer)}</div>` : ""}</header>`;
  }

  function bandCounts(rows = rankingRows()) {
    const counts = Object.fromEntries(RANK_BANDS.map((band) => [band.key, 0]));
    for (const row of rows) {
      const rank = Number(row.rank_midpoint ?? row.rank_min);
      const band = RANK_BANDS.find((item) => rank <= item.max) || RANK_BANDS.at(-1);
      counts[band.key] += 1;
    }
    return counts;
  }

  function rankScoreChart(rows = rankingRows()) {
    if (!rows.length) return emptyState(tr("Рейтинг ещё не загружен", "Ranking not loaded"), tr("После установки разрешённого выпуска здесь появятся распределение score, позиции и выбранные страны.", "Once an authorised release is installed, score distribution, ranks and selected countries will appear here."));
    const values = rows.filter((item) => Number.isFinite(Number(item.rank_midpoint)) && Number.isFinite(Number(item.overall_score)));
    if (!values.length) return emptyState(tr("Score не опубликован", "Score not published"), tr("Для этой редакции доступны места, но отсутствует сопоставимый общий score.", "This edition contains ranks but no comparable overall score."));
    const width = 760, height = 330, pad = { l: 52, r: 20, t: 26, b: 38 };
    const maxRank = Math.max(...values.map((item) => Number(item.rank_midpoint)));
    const scores = values.map((item) => Number(item.overall_score));
    const minScore = Math.min(...scores), maxScore = Math.max(...scores);
    const x = (rank) => pad.l + (Number(rank) - 1) / Math.max(1, maxRank - 1) * (width - pad.l - pad.r);
    const y = (score) => pad.t + (maxScore - Number(score)) / Math.max(.0001, maxScore - minScore) * (height - pad.t - pad.b);
    const selected = values.filter((item) => item.iso3 === ui.country);
    const labels = [...values].sort((a, b) => Number(a.rank_midpoint) - Number(b.rank_midpoint)).slice(0, 3);
    const grid = [0, .25, .5, .75, 1].map((ratio) => {
      const yy = pad.t + ratio * (height - pad.t - pad.b);
      const val = maxScore - ratio * (maxScore - minScore);
      return `<line x1="${pad.l}" y1="${yy}" x2="${width - pad.r}" y2="${yy}"/><text x="${pad.l - 8}" y="${yy + 4}" text-anchor="end">${fmt(val, 0)}</text>`;
    }).join("");
    const markers = [50, 100, 250, 500].filter((rank) => rank < maxRank).map((rank) => `<line class="qsi-rank-threshold" x1="${x(rank)}" y1="${pad.t}" x2="${x(rank)}" y2="${height - pad.b}"/><text class="qsi-threshold-label" x="${x(rank) + 4}" y="${pad.t + 12}">${lang() === "ru" ? `Первые ${rank}` : `Top ${rank}`}</text>`).join("");
    const dots = values.map((item) => `<circle class="${item.iso3 === ui.country ? "is-country" : ""}" cx="${x(item.rank_midpoint)}" cy="${y(item.overall_score)}" r="${item.iso3 === ui.country ? 5.2 : 2.4}" tabindex="${item.iso3 === ui.country || Number(item.rank_midpoint) <= 10 ? "0" : "-1"}" data-qsi-entity="${esc(item.entity_id)}"><title>${esc(item.canonical_name)} · #${esc(item.rank_display)} · ${fmt(item.overall_score, 1)}</title></circle>`).join("");
    const labelText = labels.map((item, index) => `<text class="qsi-point-label" x="${x(item.rank_midpoint) + 7}" y="${y(item.overall_score) + (index % 2 ? 14 : -8)}">${esc(item.canonical_name)}</text>`).join("");
    return `<div class="qsi-chart-wrap"><svg class="qsi-rank-score-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="qsi-rank-score-title qsi-rank-score-desc"><title id="qsi-rank-score-title">${esc(tr("Рейтинг и официальный score", "Rank and official score"))}</title><desc id="qsi-rank-score-desc">${esc(tr("Каждая точка — университет. По горизонтали место, по вертикали официальный score. Выбранная страна выделена.", "Each point is a university. Rank is on the horizontal axis and official score on the vertical axis. The selected country is highlighted."))}</desc><g class="qsi-chart-grid">${grid}${markers}</g><g class="qsi-chart-points">${dots}</g>${labelText}<text class="qsi-axis-label" x="${width / 2}" y="${height - 5}" text-anchor="middle">${esc(tr("Место в рейтинге", "Rank position"))}</text><text class="qsi-axis-label" transform="translate(14 ${height / 2}) rotate(-90)" text-anchor="middle">${esc(tr("Официальный score", "Official score"))}</text></svg><div class="qsi-chart-note"><span><i class="is-country"></i>${esc(countryName())}</span><span><i></i>${tr("остальные университеты", "other universities")}</span></div></div>`;
  }

  function countryProfilePanel() {
    const profile = currentCountryProfile();
    const institutions = currentCountryInstitutions();
    if (!profile) {
      return `<section class="qsi-panel span-4">${sectionHeader("02", tr("Страновая университетская система", "Country university system"), tr("Официальные университетские строки и отдельная производная страновая диагностика GIR.", "Official university rows and a separate GIR-derived country diagnosis."), tr("Производный слой GIR", "GIR-derived layer"))}<div class="qsi-panel-body">${emptyState(tr("Профиль страны недоступен", "Country profile unavailable"), tr("В выбранной редакции нет опубликованного странового профиля или выпуск ещё не установлен.", "The selected edition has no public country profile or the release has not yet been installed."))}</div></section>`;
    }
    const components = currentCountryComponents();
    return `<section class="qsi-panel span-4">${sectionHeader("02", tr("Страновая университетская система", "Country university system"), tr("Масштаб, пиковая позиция, типичная глубина и официальный университетский score.", "Breadth, peak position, typical depth and official university score."), tr("Производный слой GIR", "GIR-derived layer"))}<div class="qsi-country-head">${flag(ui.country, "inline")}<div><strong>${esc(countryName())}</strong><span>${esc(projectName(selectedProject()))} · ${ui.edition}</span></div></div><div class="qsi-country-score"><div><span>${tr("Score GIR", "GIR score")}</span><strong>${fmt(profile.score, 1)}</strong><small>${tr("из 100", "out of 100")}</small></div><div><span>${tr("Место", "Rank")}</span><strong>#${intFmt(profile.rank)}</strong><small>${pct(profile.percentile, 0)} ${tr("процентиль", "percentile")}</small></div><div><span>${tr("Университеты", "Universities")}</span><strong>${intFmt(profile.institution_count)}</strong><small>Top 250 · ${intFmt(profile.top250_count)}</small></div></div><div class="qsi-component-list">${components.map((item) => `<div class="qsi-component"><div><span>${componentLabel(item.component_code)}</span><b>${fmt(item.normalized_score, 1)}</b></div><div class="qsi-component-track"><i style="width:${clamp(item.normalized_score)}%"></i></div><small>${tr("вклад", "contribution")} ${fmt(item.weighted_contribution, 1)} · ${tr("вес", "weight")} ${pct(item.weight, 0)}</small></div>`).join("")}</div><div class="qsi-country-top"><span>${tr("Ведущие университеты страны", "Leading universities in the country")}</span>${institutions.slice(0, 4).map((item) => `<button type="button" data-qsi-entity="${esc(item.entity_id)}"><b>#${esc(item.rank_display || fmt(item.rank_midpoint, 0))}</b><span>${esc(item.canonical_name)}</span></button>`).join("")}</div><footer class="qsi-panel-footer"><span>${tr("Это не официальный страновой рейтинг QS", "This is not an official QS country ranking")}</span><button type="button" class="qsi-link" data-qsi-tab="countries">${tr("Открыть страновой анализ", "Open country analysis")}</button></footer></section>`;
  }

  function componentLabel(code) {
    const labels = {
      BEST_RANK: ["Пиковая позиция", "Best rank"], MEDIAN_RANK: ["Типичная позиция", "Median rank"],
      QS_SCORE: ["Официальный score пула", "Official pool score"], TOP_COUNT: ["Глубина представительства", "Representation depth"],
      RANKED_INSTITUTIONS: ["Масштаб представительства", "Representation breadth"], ELITE_DEPTH: ["Глубина лидирующего сегмента", "Elite depth"],
    };
    const pair = labels[code] || [code, code]; return lang() === "ru" ? pair[0] : pair[1];
  }

  function emptyState(title, copy, action = "") {
    return `<div class="qsi-empty"><div class="qsi-empty-mark">QS</div><strong>${esc(title)}</strong><p>${esc(copy)}</p>${action}</div>`;
  }

  function topList(rows = rankingRows(), limit = 10) {
    if (!rows.length) return emptyState(tr("Нет опубликованной таблицы", "No published table"), tr("Выберите загруженный проект или установите официальный выпуск.", "Choose a loaded project or install an official release."));
    return `<div class="qsi-top-list">${rows.slice(0, limit).map((item) => `<button type="button" data-qsi-entity="${esc(item.entity_id)}"><strong>${esc(item.rank_display || `#${fmt(item.rank_midpoint, 0)}`)}</strong><div><b>${esc(item.canonical_name)}</b><span>${esc(item.city || missingValue())} · ${esc(item.country_name || item.iso3 || missingValue())}</span></div><em>${fmt(item.overall_score, 1)}</em></button>`).join("")}</div>`;
  }

  function portfolioCoverage() {
    const coverage = array(model?.base?.coverage?.items);
    const projects = array(model?.base?.catalog?.projects).filter((item) => Number(item.active) === 1);
    const byFamily = new Map();
    for (const family of FAMILY_ORDER) byFamily.set(family, { total: 0, loaded: 0, rows: 0 });
    for (const project of projects) {
      const item = byFamily.get(project.family) || { total: 0, loaded: 0, rows: 0 };
      item.total += 1;
      const cov = coverage.find((row) => row.project_code === project.project_code);
      if (Number(cov?.loaded_rows || 0) > 0) item.loaded += 1;
      item.rows += Number(cov?.loaded_rows || 0);
      byFamily.set(project.family, item);
    }
    return `<div class="qsi-family-coverage">${FAMILY_ORDER.filter((family) => byFamily.get(family)?.total).map((family) => {
      const item = byFamily.get(family); const meta = familyMeta(family); const ratio = item.total ? item.loaded / item.total * 100 : 0;
      return `<button type="button" data-qsi-family="${esc(family)}" class="is-${esc(meta.tone)}"><span>${esc(meta.code)}</span><div><b>${esc(familyName(family))}</b><small>${intFmt(item.loaded)} / ${intFmt(item.total)} ${tr("проектов с данными", "projects with data")}</small><i><em style="width:${ratio}%"></em></i></div><strong>${item.rows ? intFmt(item.rows) : tr("данные не загружены", "data not loaded")}</strong></button>`;
    }).join("")}</div>`;
  }

  function overviewView() {
    const counts = bandCounts();
    const total = rankingRows().length || 1;
    return `<section class="qsi-view" data-qsi-view="overview">${kpis()}<div class="qsi-grid"><section class="qsi-panel span-8">${sectionHeader("01", tr("Международное поле выбранного проекта", "International field of the selected project"), tr("Официальные университетские позиции и score; выбранная страна выделена, а пороги Top 50/100/250/500 показаны явно.", "Official university ranks and scores, with the selected country highlighted and Top 50/100/250/500 thresholds shown explicitly."), tr("Официальный университетский слой", "Official university layer"))}<div class="qsi-panel-body">${rankScoreChart()}</div><div class="qsi-band-strip">${RANK_BANDS.map((band) => `<div><span>${lang() === "ru" ? band.ru : band.en}</span><strong>${intFmt(counts[band.key])}</strong><i style="width:${counts[band.key] / total * 100}%"></i></div>`).join("")}</div></section>${countryProfilePanel()}<section class="qsi-panel span-7">${sectionHeader("03", tr("Верхняя часть рейтинга", "Top of the ranking"), tr("Официальные строки выбранного проекта. Откройте университет для временной траектории и участия в других QS-проектах.", "Official rows in the selected project. Open an institution to inspect trends and participation across QS projects."), tr("Официальные данные QS", "Official QS data"))}<div class="qsi-panel-body">${topList(rankingRows(), 12)}</div><footer class="qsi-panel-footer"><span>${intFmt(rankingRows().length)} ${tr("строк в редакции", "rows in the edition")}</span><button type="button" class="qsi-link" data-qsi-tab="ranking">${tr("Открыть полный рейтинг", "Open full ranking")}</button></footer></section><section class="qsi-panel span-5">${sectionHeader("04", tr("Экосистема QS", "QS ecosystem"), tr("Мировой рейтинг, предметы, устойчивость, регионы, бизнес-образование, города и ratings — без искусственного общего супериндекса.", "World ranking, subjects, sustainability, regions, business education, cities and ratings — without an invented cross-project super-score."), tr("90 проектов", "90 projects"))}<div class="qsi-panel-body">${portfolioCoverage()}</div><footer class="qsi-panel-footer"><span>${intFmt(model?.base?.status?.projects_registered)} ${tr("зарегистрировано", "registered")}</span><button type="button" class="qsi-link" data-qsi-tab="subjects">${tr("Исследовать портфель", "Explore portfolio")}</button></footer></section><section class="qsi-panel span-12 qsi-map-preview">${sectionHeader("05", tr("Глобальная география университетов", "Global university geography"), tr("Координаты привязаны к городам или агломерациям; каждая точка сохраняет собственный provenance и оценку качества сопоставления.", "Coordinates are city or metropolitan centroids; every point keeps its own provenance and match-quality assessment."), tr("Пространственный слой GIR", "GIR spatial layer"))}<div class="qsi-map-host" data-qsi-map-host></div></section></div></section>`;
  }

  function filteredRanking() {
    let rows = [...rankingRows()];
    const query = ui.rankingQuery.trim().toLowerCase();
    if (query) rows = rows.filter((item) => `${item.canonical_name || ""} ${item.city || ""} ${item.country_name || ""} ${item.iso3 || ""}`.toLowerCase().includes(query));
    if (ui.rankingCountry !== "all") rows = rows.filter((item) => item.iso3 === ui.rankingCountry);
    if (ui.rankingBand !== "all") {
      const band = RANK_BANDS.find((item) => item.key === ui.rankingBand);
      const previousMax = band ? (RANK_BANDS[RANK_BANDS.indexOf(band) - 1]?.max || 0) : 0;
      rows = rows.filter((item) => Number(item.rank_midpoint) > previousMax && Number(item.rank_midpoint) <= band.max);
    }
    return rows;
  }

  function compareButton(item) {
    const selected = ui.compare.includes(item.entity_id);
    return `<button type="button" class="qsi-compare-toggle ${selected ? "is-selected" : ""}" data-qsi-compare="${esc(item.entity_id)}" aria-pressed="${selected}" title="${esc(tr("Добавить к сравнению", "Add to comparison"))}">${selected ? "✓" : "+"}</button>`;
  }

  function rankingView() {
    const rows = filteredRanking();
    const pages = Math.max(1, Math.ceil(rows.length / ui.rankingPageSize));
    ui.rankingPage = Math.min(ui.rankingPage, pages);
    const pageRows = rows.slice((ui.rankingPage - 1) * ui.rankingPageSize, ui.rankingPage * ui.rankingPageSize);
    return `<section class="qsi-view" data-qsi-view="ranking"><section class="qsi-ranking-summary"><div><span>${tr("Редакция", "Edition")}</span><strong>${ui.edition}</strong></div><div><span>${tr("Всего строк", "Total rows")}</span><strong>${intFmt(rankingRows().length)}</strong></div><div><span>${tr("После фильтров", "After filters")}</span><strong>${intFmt(rows.length)}</strong></div><div><span>${tr("Страны", "Countries")}</span><strong>${intFmt(new Set(rows.map((item) => item.iso3).filter(Boolean)).size)}</strong></div><div><span>${tr("В сравнении", "In comparison")}</span><strong>${ui.compare.length} / ${MAX_COMPARE}</strong></div></section><section class="qsi-panel"><div class="qsi-table-toolbar"><label><span>${tr("Поиск", "Search")}</span><input class="qsi-input" data-qsi-ranking-query value="${esc(ui.rankingQuery)}" placeholder="${esc(tr("Университет, город или страна", "University, city or country"))}"></label><label><span>${tr("Страна", "Country")}</span><select class="qsi-select" data-qsi-ranking-country>${countryOptions(true)}</select></label><label><span>${tr("Диапазон", "Rank band")}</span><select class="qsi-select" data-qsi-ranking-band><option value="all">${tr("Все позиции", "All ranks")}</option>${RANK_BANDS.map((band) => `<option value="${band.key}" ${ui.rankingBand === band.key ? "selected" : ""}>${lang() === "ru" ? band.ru : band.en}</option>`).join("")}</select></label><label><span>${tr("Строк на странице", "Rows per page")}</span><select class="qsi-select" data-qsi-page-size>${[25, 50, 100].map((size) => `<option value="${size}" ${ui.rankingPageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label></div>${pageRows.length ? `<div class="qsi-table-wrap" tabindex="0" role="region" aria-label="${esc(tr("Рейтинг университетов", "University ranking"))}"><table class="qsi-table"><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Университет", "University")}</th><th>${tr("Страна / город", "Country / city")}</th><th>${tr("Score", "Score")}</th><th>${tr("Качество", "Quality")}</th><th>${tr("Сравнить", "Compare")}</th></tr></thead><tbody>${pageRows.map((item) => `<tr><td><button type="button" class="qsi-rank-button" data-qsi-entity="${esc(item.entity_id)}">${esc(item.rank_display || fmt(item.rank_midpoint, 0))}</button></td><td><button type="button" class="qsi-entity-link" data-qsi-entity="${esc(item.entity_id)}"><b>${esc(item.canonical_name)}</b><span>${esc(item.profile_path || "")}</span></button></td><td>${flag(item.iso3, "inline")}<b>${esc(item.country_name || item.iso3 || "—")}</b><span>${esc(item.city || "—")}</span></td><td><strong>${fmt(item.overall_score, 1)}</strong></td><td><span class="qsi-quality">${esc(qualityLabel(item.quality_flag))}</span></td><td>${compareButton(item)}</td></tr>`).join("")}</tbody></table></div>` : emptyState(tr("Ничего не найдено", "No matching rows"), tr("Измените поиск, страну или диапазон мест.", "Adjust the search, country or rank band."))}<footer class="qsi-pagination"><button type="button" data-qsi-page="prev" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><span>${tr("Страница", "Page")} ${ui.rankingPage} / ${pages} · ${intFmt(rows.length)}</span><button type="button" data-qsi-page="next" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Вперёд", "Next")} →</button></footer></section>${compareTray()}</section>`;
  }

  function compareTray() {
    if (!ui.compare.length) return `<aside class="qsi-compare-tray is-empty"><span>${tr("Сравнение университетов", "University comparison")}</span><p>${tr("Добавьте до четырёх университетов из рейтинга.", "Add up to four institutions from the ranking.")}</p></aside>`;
    const rows = ui.compare.map((id) => rankingRows().find((item) => item.entity_id === id)).filter(Boolean);
    return `<aside class="qsi-compare-tray"><div><span>${tr("Сравнение университетов", "University comparison")}</span><strong>${rows.length} / ${MAX_COMPARE}</strong></div><div>${rows.map((item) => `<button type="button" data-qsi-entity="${esc(item.entity_id)}"><b>#${esc(item.rank_display || fmt(item.rank_midpoint, 0))}</b><span>${esc(item.canonical_name)}</span><i data-qsi-remove-compare="${esc(item.entity_id)}">×</i></button>`).join("")}</div><button type="button" class="qsi-button" data-qsi-tab="universities">${tr("Открыть сравнение", "Open comparison")}</button></aside>`;
  }

  function trendChart(rankings, metric = "rank") {
    const rows = [...array(rankings)].sort((a, b) => Number(a.edition_year) - Number(b.edition_year));
    if (rows.length < 2) return emptyState(tr("Недостаточно редакций", "Not enough editions"), tr("Для временной траектории необходимы минимум две сопоставимые редакции.", "At least two comparable editions are required for a trend."));
    const width = 680, height = 250, pad = { l: 48, r: 24, t: 24, b: 38 };
    const values = rows.map((item) => metric === "rank" ? Number(item.rank_midpoint) : Number(item.overall_score)).filter(Number.isFinite);
    if (!values.length) return emptyState(tr("Нет числового ряда", "No numeric series"), tr("В выбранных редакциях показатель не опубликован.", "The selected editions do not publish this metric."));
    const min = Math.min(...values), max = Math.max(...values);
    const x = (index) => pad.l + index / Math.max(1, rows.length - 1) * (width - pad.l - pad.r);
    const y = (value) => pad.t + (metric === "rank" ? (value - min) : (max - value)) / Math.max(.0001, max - min) * (height - pad.t - pad.b);
    const path = rows.map((item, index) => `${index ? "L" : "M"}${x(index)},${y(metric === "rank" ? Number(item.rank_midpoint) : Number(item.overall_score))}`).join(" ");
    return `<svg class="qsi-trend-chart" viewBox="0 0 ${width} ${height}" role="img"><title>${esc(metric === "rank" ? tr("Изменение позиции", "Rank trend") : tr("Изменение score", "Score trend"))}</title><g class="qsi-chart-grid">${[0, .25, .5, .75, 1].map((ratio) => `<line x1="${pad.l}" y1="${pad.t + ratio * (height - pad.t - pad.b)}" x2="${width - pad.r}" y2="${pad.t + ratio * (height - pad.t - pad.b)}"/>`).join("")}</g><path class="qsi-trend-line" d="${path}"/>${rows.map((item, index) => { const value = metric === "rank" ? Number(item.rank_midpoint) : Number(item.overall_score); return `<circle cx="${x(index)}" cy="${y(value)}" r="5"><title>${item.edition_year}: ${metric === "rank" ? `#${fmt(value, 0)}` : fmt(value, 1)}</title></circle><text x="${x(index)}" y="${height - 10}" text-anchor="middle">${item.edition_year}</text><text class="qsi-value-label" x="${x(index)}" y="${y(value) - 10}" text-anchor="middle">${metric === "rank" ? `#${fmt(value, 0)}` : fmt(value, 1)}</text>`; }).join("")}</svg>`;
  }

  function institutionProfile(payload) {
    if (!payload) return emptyState(tr("Выберите университет", "Select a university"), tr("Откройте строку рейтинга или найдите университет в списке.", "Open a ranking row or find an institution in the list."));
    const entity = payload.entity || {};
    const rankings = array(payload.rankings).filter((item) => item.project_code === ui.project);
    const latest = [...rankings].sort((a, b) => Number(b.edition_year) - Number(a.edition_year))[0] || array(payload.rankings)[0];
    return `<div class="qsi-institution-profile"><div class="qsi-institution-identity"><div class="qsi-institution-rank">${latest?.rank_display ? `#${esc(latest.rank_display)}` : "QS"}</div><div><span>${esc(projectName(selectedProject()))}</span><h2>${esc(entity.canonical_name)}</h2><p>${flag(entity.iso3, "inline")} ${esc(entity.city || "—")} · ${esc(entity.country_name || entity.iso3 || "—")}</p></div><button type="button" class="qsi-button ${ui.compare.includes(entity.entity_id) ? "is-selected" : ""}" data-qsi-compare="${esc(entity.entity_id)}">${ui.compare.includes(entity.entity_id) ? tr("В сравнении", "In comparison") : tr("Добавить к сравнению", "Add to comparison")}</button></div><div class="qsi-institution-kpis"><div><span>${tr("Последнее место", "Latest rank")}</span><strong>${latest?.rank_display ? `#${esc(latest.rank_display)}` : "—"}</strong></div><div><span>${tr("Score", "Score")}</span><strong>${fmt(latest?.overall_score, 1)}</strong></div><div><span>${tr("Редакции", "Editions")}</span><strong>${intFmt(rankings.length)}</strong></div><div><span>${tr("QS-проекты", "QS projects")}</span><strong>${intFmt(new Set(array(payload.rankings).map((item) => item.project_code)).size)}</strong></div></div><div class="qsi-institution-grid"><section><header><span>${tr("Траектория позиции", "Rank trajectory")}</span><strong>${rankings.length} ${tr("редакции", "editions")}</strong></header>${trendChart(rankings, "rank")}</section><section><header><span>${tr("Участие в QS-портфеле", "QS portfolio participation")}</span><strong>${array(payload.rankings).length}</strong></header><div class="qsi-memberships">${array(payload.rankings).map((item) => `<div><span>${esc(lang() === "ru" ? item.project_name_ru : item.project_name_en)}</span><b>${item.rank_display ? `#${esc(item.rank_display)}` : "—"}</b><small>${item.edition_year} · ${fmt(item.overall_score, 1)}</small></div>`).join("")}</div></section></div><div class="qsi-indicator-state"><strong>${tr("Официальные индикаторы", "Official indicators")}</strong>${array(payload.indicator_values).length ? `<div>${array(payload.indicator_values).map((item) => `<span><b>${esc(item.indicator_code)}</b>${fmt(item.value, 1)}</span>`).join("")}</div>` : `<p>${tr("В текущем архиве опубликованы место и общий score. Репутационные, библиометрические, интернационализационные и иные показатели появятся здесь после загрузки соответствующих разрешённых выгрузок.", "The current archive publishes rank and overall score. Reputation, bibliometric, internationalisation and other indicators will appear after the relevant authorised exports are loaded.")}</p>`}</div></div>`;
  }

  function universitiesView() {
    const rows = rankingRows();
    const query = ui.institutionQuery.trim().toLowerCase();
    const filtered = query ? rows.filter((item) => `${item.canonical_name || ""} ${item.city || ""} ${item.country_name || ""}`.toLowerCase().includes(query)) : rows;
    return `<section class="qsi-view" data-qsi-view="universities"><div class="qsi-university-layout"><aside class="qsi-university-list"><header><div><span>${tr("Университеты редакции", "Institutions in edition")}</span><strong>${intFmt(rows.length)}</strong></div><input class="qsi-input" data-qsi-institution-query value="${esc(ui.institutionQuery)}" placeholder="${esc(tr("Найти университет", "Find a university"))}"></header><div>${filtered.slice(0, 120).map((item) => `<button type="button" class="${ui.selectedEntity === item.entity_id ? "is-selected" : ""}" data-qsi-entity="${esc(item.entity_id)}"><strong>${esc(item.rank_display || fmt(item.rank_midpoint, 0))}</strong><span>${esc(item.canonical_name)}<small>${esc(item.city || "—")} · ${esc(item.iso3 || "")}</small></span><b>${fmt(item.overall_score, 1)}</b></button>`).join("")}</div></aside><section class="qsi-university-main">${institutionProfile(model?.institution)}${compareMatrix()}</section></div></section>`;
  }

  function compareMatrix() {
    const selectedRows = ui.compare.map((id) => rankingRows().find((item) => item.entity_id === id)).filter(Boolean);
    if (selectedRows.length < 2) return `<section class="qsi-compare-matrix is-empty"><strong>${tr("Сравнение университетов", "University comparison")}</strong><p>${tr("Добавьте минимум два университета из рейтинга. Сравнение не создаёт дополнительный score — показываются официальные места и значения выбранного проекта.", "Add at least two institutions from the ranking. The comparison creates no additional score; it shows official ranks and values from the selected project.")}</p></section>`;
    return `<section class="qsi-compare-matrix"><header><div><span>${tr("Сравнение", "Comparison")}</span><h2>${selectedRows.length} ${tr("университета", "universities")}</h2></div><button type="button" class="qsi-link" data-qsi-clear-compare>${tr("Очистить", "Clear")}</button></header><div class="qsi-table-wrap" tabindex="0"><table class="qsi-table"><thead><tr><th>${tr("Показатель", "Metric")}</th>${selectedRows.map((item) => `<th>${esc(item.canonical_name)}</th>`).join("")}</tr></thead><tbody><tr><td>${tr("Место", "Rank")}</td>${selectedRows.map((item) => `<td><strong>#${esc(item.rank_display || fmt(item.rank_midpoint, 0))}</strong></td>`).join("")}</tr><tr><td>Score</td>${selectedRows.map((item) => `<td>${fmt(item.overall_score, 1)}</td>`).join("")}</tr><tr><td>${tr("Страна", "Country")}</td>${selectedRows.map((item) => `<td>${flag(item.iso3, "inline")} ${esc(item.country_name || item.iso3 || "—")}</td>`).join("")}</tr><tr><td>${tr("Город", "City")}</td>${selectedRows.map((item) => `<td>${esc(item.city || "—")}</td>`).join("")}</tr></tbody></table></div></section>`;
  }

  function aggregateCountries(rows = rankingRows()) {
    const groups = new Map();
    for (const item of rows) {
      if (!item.iso3) continue;
      if (!groups.has(item.iso3)) groups.set(item.iso3, []);
      groups.get(item.iso3).push(item);
    }
    return [...groups.entries()].map(([iso3, items]) => {
      const ranks = items.map((item) => Number(item.rank_midpoint)).filter(Number.isFinite).sort((a, b) => a - b);
      const scores = items.map((item) => Number(item.overall_score)).filter(Number.isFinite);
      return { iso3, country_name: items[0]?.country_name || iso3, count: items.length, best_rank: ranks[0] ?? null, median_rank: ranks.length ? ranks[Math.floor((ranks.length - 1) / 2)] : null, mean_score: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null, top100: ranks.filter((rank) => rank <= 100).length, top250: ranks.filter((rank) => rank <= 250).length };
    }).sort((a, b) => a.best_rank - b.best_rank || b.count - a.count);
  }

  function countrySystemChart(rows) {
    const top = rows.slice(0, 18);
    const max = Math.max(...top.map((item) => item.count), 1);
    return `<div class="qsi-country-bars">${top.map((item) => `<button type="button" data-qsi-country-select="${esc(item.iso3)}" class="${item.iso3 === ui.country ? "is-selected" : ""}"><span>${flag(item.iso3, "inline")}<b>${esc(countryName(item.iso3))}</b></span><i><em style="width:${item.count / max * 100}%"></em></i><strong>${intFmt(item.count)}</strong><small>${tr("лучшее место", "best rank")} #${intFmt(item.best_rank)}</small></button>`).join("")}</div>`;
  }

  function countriesView() {
    const countries = aggregateCountries();
    const profile = currentCountryProfile();
    return `<section class="qsi-view" data-qsi-view="countries"><div class="qsi-grid"><section class="qsi-panel span-7">${sectionHeader("01", tr("Международная структура университетских систем", "International structure of university systems"), tr("Число представленных университетов и пиковая позиция — описательные признаки официального университетского слоя, а не новый страновой рейтинг.", "Institution count and best rank are descriptive properties of the official university layer, not a new country ranking."), tr("Официальные университетские строки", "Official university rows"))}<div class="qsi-panel-body">${countries.length ? countrySystemChart(countries) : emptyState(tr("Нет страновых данных", "No country data"), tr("Для этого проекта ещё не опубликованы университетские строки.", "No university rows are published for this project yet."))}</div></section><section class="qsi-panel span-5">${sectionHeader("02", countryName(), tr("Производный профиль GIR рассчитывается только внутри выбранного проекта и редакции.", "The GIR-derived profile is calculated only within the selected project and edition."), tr("Не официальный рейтинг QS", "Not an official QS ranking"))}<div class="qsi-panel-body">${profile ? `<div class="qsi-country-detail"><div class="qsi-country-hero">${flag(ui.country, "big")}<div><span>${projectName(selectedProject())}</span><strong>${fmt(profile.score, 1)}</strong><small>#${intFmt(profile.rank)} · ${pct(profile.percentile, 0)}</small></div></div><dl><div><dt>${tr("Университеты", "Universities")}</dt><dd>${intFmt(profile.institution_count)}</dd></div><div><dt>Top 100</dt><dd>${intFmt(profile.top100_count)}</dd></div><div><dt>Top 250</dt><dd>${intFmt(profile.top250_count)}</dd></div><div><dt>${tr("Лучшее место", "Best rank")}</dt><dd>#${intFmt(profile.best_rank)}</dd></div><div><dt>${tr("Медианное место", "Median rank")}</dt><dd>#${intFmt(profile.median_rank)}</dd></div></dl><button type="button" class="qsi-button" data-qsi-provenance="${esc(profile.value_id)}">${tr("Provenance профиля", "Profile provenance")}</button></div>` : emptyState(tr("Нет профиля выбранной страны", "No profile for selected country"), tr("Выберите другую страну или опубликованный проект.", "Choose another country or a published project."))}</div></section><section class="qsi-panel span-12">${sectionHeader("03", tr("Университетский пул выбранной страны", "University pool of the selected country"), tr("Официальные позиции университетов внутри выбранного рейтингового проекта.", "Official positions of institutions within the selected ranking project."), tr("Официальный слой QS", "Official QS layer"))}<div class="qsi-panel-body">${currentCountryInstitutions().length ? topList(currentCountryInstitutions(), 30) : emptyState(tr("Университеты не опубликованы", "Institutions not published"), tr("В выбранной редакции отсутствуют публичные строки для этой страны.", "The selected edition has no public rows for this country."))}</div></section></div></section>`;
  }

  function subjectsView() {
    const subjects = array(model?.base?.subjects?.items);
    const query = ui.subjectQuery.trim().toLowerCase();
    const filtered = subjects.filter((item) => (ui.subjectArea === "all" || item.area_code === ui.subjectArea) && (!query || `${item.name_ru} ${item.name_en} ${item.subject_code}`.toLowerCase().includes(query)));
    const byArea = new Map();
    for (const subject of subjects) {
      if (!byArea.has(subject.area_code)) byArea.set(subject.area_code, []);
      byArea.get(subject.area_code).push(subject);
    }
    const coverage = array(model?.base?.coverage?.items);
    return `<section class="qsi-view" data-qsi-view="subjects"><section class="qsi-portfolio-intro"><div><span>QS World University Rankings by Subject</span><h2>${tr("Пять областей и 55 дисциплин", "Five broad areas and 55 subjects")}</h2><p>${tr("Каждая дисциплина — самостоятельный рейтинговый проект со своей международной вселенной и весами. GIR не складывает их в единый недокументированный супериндекс.", "Each subject is a separate ranking project with its own international universe and weights. GIR does not collapse them into an undocumented super-score.")}</p></div><div class="qsi-portfolio-numbers"><div><strong>5</strong><span>${tr("областей", "areas")}</span></div><div><strong>55</strong><span>${tr("дисциплин", "subjects")}</span></div><div><strong>90</strong><span>${tr("проектов QS", "QS projects")}</span></div></div></section><div class="qsi-area-grid">${[...byArea.entries()].map(([area, items]) => { const meta = AREA_META[area] || { code: area, tone: "muted" }; const projectCode = `QS_AREA_${area}`; const cov = coverage.find((row) => row.project_code === projectCode); const loaded = Number(cov?.loaded_rows || 0) > 0; return `<button type="button" class="qsi-area-card is-${meta.tone} ${ui.subjectArea === area ? "is-selected" : ""}" data-qsi-area="${esc(area)}"><span>${esc(meta.code)}</span><h3>${esc(areaName(area))}</h3><p>${intFmt(items.length)} ${tr("дисциплин", "subjects")}</p><div><i class="${loaded ? "is-ready" : "is-gated"}"></i>${loaded ? `${intFmt(cov.loaded_rows)} ${tr("строк загружено", "rows loaded")}` : tr("контур готов", "workspace ready")}</div></button>`; }).join("")}</div><section class="qsi-panel"><div class="qsi-subject-toolbar"><label><span>${tr("Поиск дисциплины", "Search subjects")}</span><input class="qsi-input" data-qsi-subject-query value="${esc(ui.subjectQuery)}" placeholder="${esc(tr("Например, право, медицина или data science", "For example law, medicine or data science"))}"></label><button type="button" class="qsi-link" data-qsi-area="all">${tr("Показать все", "Show all")}</button></div><div class="qsi-subject-list">${filtered.map((item) => { const projectCode = `QS_SUBJECT_${item.subject_code}`; const project = array(model?.base?.catalog?.projects).find((p) => p.project_code === projectCode); const cov = coverage.find((row) => row.project_code === projectCode); const loaded = Number(cov?.loaded_rows || 0) > 0; return `<button type="button" data-qsi-project-select="${esc(projectCode)}"><span>${esc(AREA_META[item.area_code]?.code || item.area_code)}</span><div><b>${esc(lang() === "ru" ? item.name_ru : item.name_en)}</b><small>${esc(areaName(item.area_code))}</small></div><em class="${loaded ? "is-ready" : "is-gated"}">${loaded ? `${intFmt(cov.loaded_rows)} ${tr("строк", "rows")}` : tr("ожидает пакет", "source-gated")}</em><i>→</i></button>`; }).join("")}</div></section><section class="qsi-method-lenses"><article><span>01</span><h3>${tr("Академическая репутация", "Academic reputation")}</h3><p>${tr("Международный академический опрос в соответствующей дисциплине.", "Global academic survey within the relevant discipline.")}</p></article><article><span>02</span><h3>${tr("Репутация работодателей", "Employer reputation")}</h3><p>${tr("Оценка выпускников работодателями с предметной специализацией.", "Employer assessment of graduates with subject-specific weighting.")}</p></article><article><span>03</span><h3>${tr("Цитирования на публикацию", "Citations per paper")}</h3><p>${tr("Предметно нормированное исследовательское влияние.", "Field-normalised research impact.")}</p></article><article><span>04</span><h3>H-index</h3><p>${tr("Сочетание продуктивности и цитируемости исследовательского пула.", "Combined productivity and citation impact of the research pool.")}</p></article><article><span>05</span><h3>${tr("Международная исследовательская сеть", "International Research Network")}</h3><p>${tr("Устойчивые международные исследовательские связи.", "Sustained international research collaboration.")}</p></article></section></section>`;
  }

  function geographyView() {
    return `<section class="qsi-view" data-qsi-view="geography"><section class="qsi-geo-intro"><div><span>${tr("Пространственная аналитика", "Spatial analytics")}</span><h2>${tr("Мировая география университетов", "Global university geography")}</h2><p>${tr("Текущий опубликованный географический слой построен по QS Engineering & Technology 2026. После загрузки других разрешённых проектов карта расширится без изменения интерфейса.", "The current published geography layer is based on QS Engineering & Technology 2026. As other authorised projects are loaded, the map can expand without redesigning the interface.")}</p></div><div><strong>627</strong><span>${tr("канонических университетов", "canonical institutions")}</span><strong>393</strong><span>${tr("городских центров", "city centroids")}</span></div></section><div class="qsi-map-host is-full" data-qsi-map-host></div><section class="qsi-geo-method"><article><span>WGS84</span><h3>${tr("Приблизительные координаты", "Approximate coordinates")}</h3><p>${tr("По умолчанию используется центр города или агломерации, а не точная граница кампуса.", "City or metropolitan centroids are used by default, not exact campus boundaries.")}</p></article><article><span>QA</span><h3>${tr("Качество сопоставления", "Match quality")}</h3><p>${tr("Каждая координата имеет метод, уверенность и quality flag.", "Every coordinate has a match method, confidence and quality flag.")}</p></article><article><span>PROV</span><h3>Provenance</h3><p>${tr("Точка связана с университетской строкой, snapshot и источником географии.", "Each point links to the university row, snapshot and geography source.")}</p></article></section></section>`;
  }

  function dataView() {
    const coverage = array(model?.base?.coverage?.items).filter((item) => ui.dataFamily === "all" || item.family === ui.dataFamily).filter((item) => ui.dataStatus === "all" || (ui.dataStatus === "loaded" ? Number(item.loaded_rows) > 0 : Number(item.loaded_rows) === 0));
    const edition = selectedEditionRow();
    return `<section class="qsi-view" data-qsi-view="data"><section class="qsi-data-principles"><article><span>01</span><h3>${tr("Официальный университетский слой", "Official university layer")}</h3><p>${tr("Место, диапазон, score и официальные индикаторы сохраняются без пересчёта GIR.", "Rank, band, score and official indicators are stored without GIR recomputation.")}</p></article><article><span>02</span><h3>${tr("Производный страновой слой", "Derived country layer")}</h3><p>${tr("Страновые профили создаются отдельно и никогда не называются официальным рейтингом QS.", "Country profiles are separate and are never labelled as an official QS ranking.")}</p></article><article><span>03</span><h3>${tr("Нет супериндекса", "No super-score")}</h3><p>${tr("WUR, дисциплины, устойчивость, MBA, города и ratings не смешиваются в одно число.", "WUR, subjects, sustainability, MBA, cities and ratings are not collapsed into one number.")}</p></article><article><span>04</span><h3>${tr("Права на уровне редакции", "Edition-level rights")}</h3><p>${tr("Публикация университетских строк и производной страновой оценки управляется независимо.", "University-row and derived-country publication rights are controlled independently.")}</p></article></section><section class="qsi-panel"><div class="qsi-data-summary"><div><span>${tr("Проекты", "Projects")}</span><strong>${intFmt(model?.base?.status?.projects_registered)}</strong></div><div><span>${tr("Загруженные редакции", "Loaded editions")}</span><strong>${intFmt(model?.base?.status?.editions_loaded)}</strong></div><div><span>${tr("Университетские строки", "Ranking entries")}</span><strong>${intFmt(model?.base?.status?.ranking_entries)}</strong></div><div><span>${tr("Страновые профили", "Country profiles")}</span><strong>${intFmt(model?.base?.status?.country_profiles)}</strong></div><div><span>${tr("Права текущей редакции", "Current edition rights")}</span><strong>${esc(edition?.rights_status || tr("не подтверждены", "not confirmed"))}</strong></div></div><div class="qsi-table-toolbar"><label><span>${tr("Семейство", "Family")}</span><select class="qsi-select" data-qsi-data-family><option value="all">${tr("Все семейства", "All families")}</option>${FAMILY_ORDER.map((family) => `<option value="${family}" ${ui.dataFamily === family ? "selected" : ""}>${esc(familyName(family))}</option>`).join("")}</select></label><label><span>${tr("Состояние", "Status")}</span><select class="qsi-select" data-qsi-data-status><option value="all">${tr("Все", "All")}</option><option value="loaded" ${ui.dataStatus === "loaded" ? "selected" : ""}>${tr("С данными", "Loaded")}</option><option value="gated" ${ui.dataStatus === "gated" ? "selected" : ""}>${tr("Ожидает источник", "Source-gated")}</option></select></label></div><div class="qsi-table-wrap" tabindex="0"><table class="qsi-table qsi-coverage-table"><thead><tr><th>${tr("Проект", "Project")}</th><th>${tr("Семейство", "Family")}</th><th>${tr("Текущая редакция", "Current edition")}</th><th>${tr("Загружено редакций", "Loaded editions")}</th><th>${tr("Строки", "Rows")}</th><th>${tr("Статус", "Status")}</th></tr></thead><tbody>${coverage.map((item) => `<tr><td><button type="button" class="qsi-entity-link" data-qsi-project-select="${esc(item.project_code)}"><b>${esc(lang() === "ru" ? item.name_ru : item.name_en)}</b><span>${esc(item.project_code)}</span></button></td><td>${esc(familyName(item.family))}</td><td>${esc(item.current_edition || tr("не опубликована", "not published"))}</td><td>${intFmt(item.loaded_editions)}</td><td>${intFmt(item.loaded_rows)}</td><td><span class="qsi-status ${Number(item.loaded_rows) ? "is-ready" : "is-gated"}">${Number(item.loaded_rows) ? statusLabel("published") : statusLabel("source_gated")}</span></td></tr>`).join("")}</tbody></table></div></section><section class="qsi-lineage"><div><span>01</span><b>${tr("Разрешённый пакет QS", "Authorised QS package")}</b><p>${tr("CSV, XLSX, JSON или официальный endpoint", "CSV, XLSX, JSON or official endpoint")}</p></div><i>→</i><div><span>02</span><b>Snapshot + SHA-256</b><p>${tr("Приватное хранение и аудит", "Private storage and audit")}</p></div><i>→</i><div><span>03</span><b>${tr("Канонический университет", "Canonical institution")}</b><p>${tr("QS ID, страна, город, aliases", "QS ID, country, city, aliases")}</p></div><i>→</i><div><span>04</span><b>${tr("Проект и редакция", "Project and edition")}</b><p>${tr("Официальные места и индикаторы", "Official ranks and indicators")}</p></div><i>→</i><div><span>05</span><b>${tr("Публикация", "Publication")}</b><p>${tr("Rights gates, provenance, экспорт", "Rights gates, provenance, export")}</p></div></section></section>`;
  }

  function availabilityView() {
    const project = selectedProject();
    const status = model?.ranking?.status || "source_gated";
    const rightsGated = status === "rights_gated";
    const loaded = latestLoadedProject();
    const title = rightsGated
      ? tr("Университетские строки этой редакции ограничены правами", "University rows for this edition are rights-gated")
      : tr("Числовой выпуск проекта ещё не установлен", "The numeric project release is not installed yet");
    const copy = rightsGated
      ? tr("Проект и редакция сохранены без подмены. GIR не показывает закрытые строки, не строит по ним карту или страновой профиль и не заменяет их данными другого QS-проекта.", "The requested project and edition are preserved without substitution. GIR does not expose restricted rows, build a map or country profile from them, or replace them with another QS project.")
      : tr("Проект зарегистрирован в QS-портфеле, но разрешённый официальный пакет данных отсутствует. GIR не синтезирует строки, не показывает пустые графики и не подменяет выбранный проект доступным рейтингом.", "The project is registered in the QS portfolio, but an authorised official data package is unavailable. GIR does not synthesise rows, show empty charts, or substitute the selected project with an available ranking.");
    const switchAction = loaded && loaded.project_code !== ui.project
      ? `<button type="button" class="qsi-button" data-qsi-project-select="${esc(loaded.project_code)}">${tr("Открыть опубликованный QS E&T", "Open published QS E&T")}</button>`
      : "";
    return `<section class="qsi-view qsi-availability" data-qsi-view="availability" role="region" aria-live="polite">
      <div class="qsi-availability-mark">${markSvg()}</div>
      <span class="qsi-status is-gated">${esc(statusLabel(status))}</span>
      <h2>${esc(title)}</h2>
      <p>${esc(copy)}</p>
      <dl>
        <div><dt>${tr("Запрошенный проект", "Requested project")}</dt><dd>${esc(projectName(project))}</dd></div>
        <div><dt>${tr("Редакция", "Edition")}</dt><dd>${esc(ui.edition || project?.current_edition || tr("не опубликована", "not published"))}</dd></div>
        <div><dt>${tr("Страна", "Country")}</dt><dd>${esc(countryName())}</dd></div>
        <div><dt>${tr("Статус", "Status")}</dt><dd>${esc(statusLabel(status))}</dd></div>
      </dl>
      <div class="qsi-availability-actions">${switchAction}<button type="button" class="qsi-button is-secondary" data-qsi-tab="data">${tr("Проверить покрытие и права", "Inspect coverage and rights")}</button><a class="qsi-button is-secondary" href="${esc(project?.official_url || "https://www.topuniversities.com/qs-top-uni-wur")}" target="_blank" rel="noopener noreferrer">${tr("Официальная страница QS", "Official QS page")} ↗</a></div>
    </section>`;
  }

  function viewHtml() {
    if (!isPublished() && ui.tab !== "subjects" && ui.tab !== "data") return availabilityView();
    if (ui.tab === "overview") return overviewView();
    if (ui.tab === "ranking") return rankingView();
    if (ui.tab === "universities") return universitiesView();
    if (ui.tab === "countries") return countriesView();
    if (ui.tab === "subjects") return subjectsView();
    if (ui.tab === "geography") return geographyView();
    return dataView();
  }

  function rootHtml() {
    return finaliseVisibleHtml(`<section class="qsi-workspace">${commandHeader()}${tabs()}${viewHtml()}</section>`);
  }

  function mountMap() {
    const host = context.root.querySelector("[data-qsi-map-host]");
    if (!host || !isPublished() || !window.GIRUniversityMap?.render) return;
    window.GIRUniversityMap.render(host, {
      sourceCode: "QS_ET",
      year: 2026,
      selectedCountry: ui.country,
      lang: lang(),
      eyebrow: tr("QS: инженерия и технологии, 2026", "QS · Engineering & Technology 2026"),
      title: tr("Карта QS: инженерия и технологии, 2026", "QS Engineering & Technology map, 2026"),
      subtitle: tr("Карта всегда показывает опубликованный слой QS E&T 2026 и не выдаёт его за географию другого выбранного проекта.", "The map always shows the published QS E&T 2026 layer and is never presented as geography for another selected project."),
      defaultRankMax: ui.tab === "geography" ? 500 : 250,
      openProvenance: (valueId, trigger) => context.openProvenance?.(valueId, trigger),
      selectCountry: (iso3) => selectCountry(iso3),
    });
  }

  function selectCountry(iso3) {
    const code = normaliseCountry(iso3);
    if (!code || code === ui.country) return;
    if (context.selectCountry?.(code) === false) return;
    ui.country = code;
    context.country = code;
    cache.country.clear();
    ui.rankingPage = 1;
    syncUrl();
    refresh();
  }

  async function selectInstitution(entityId) {
    if (!entityId) return;
    ui.selectedEntity = entityId;
    ui.tab = "universities";
    syncUrl();
    institutionController?.abort();
    institutionController = new AbortController();
    const signal = institutionController.signal;
    const generation = renderGeneration;
    const root = context.root;
    try {
      const payload = await loadInstitution(entityId, signal);
      if (!isCurrent(generation, root) || ui.selectedEntity !== entityId) return;
      model.institution = payload;
      renderCurrent(generation, root);
    } catch (error) {
      if (!isAbort(error) && isCurrent(generation, root)) context.onNotice?.(error.message || String(error));
    }
  }

  function toggleCompare(entityId) {
    if (!entityId) return;
    if (ui.compare.includes(entityId)) ui.compare = ui.compare.filter((item) => item !== entityId);
    else if (ui.compare.length < MAX_COMPARE) ui.compare = [...ui.compare, entityId];
    else context.onNotice?.(tr("Можно сравнивать не более четырёх университетов.", "You can compare up to four institutions."));
    syncUrl();
    renderCurrent();
  }

  async function changeProject(code) {
    ui.project = code;
    ui.edition = null;
    ui.selectedEntity = null;
    ui.compare = [];
    ui.rankingPage = 1;
    syncUrl();
    await refresh();
  }

  async function refresh() {
    const request = beginLoad();
    if (!isCurrent(request.generation, request.root)) return;
    renderLoading(request.root);
    try {
      const hydrated = await hydrate(request.generation, request.signal);
      if (!hydrated || !isCurrent(request.generation, request.root)) return;
      renderCurrent(request.generation, request.root);
    } catch (error) {
      if (!isAbort(error) && isCurrent(request.generation, request.root)) renderError(request.root, error);
    }
  }

  function renderCurrent(generation = renderGeneration, root = context?.root) {
    if (!isCurrent(generation, root)) return;
    root.innerHTML = rootHtml();
    bind();
    if (ui.tab === "overview" || ui.tab === "geography") mountMap();
    window.GIRMath?.render?.(root);
  }

  function bindTabs() {
    const buttons = [...context.root.querySelectorAll("[data-qsi-tab]")];
    buttons.forEach((button) => button.addEventListener("click", () => {
      const tab = button.dataset.qsiTab;
      if (!TAB_ORDER.includes(tab)) return;
      ui.tab = tab;
      syncUrl();
      if (tab === "universities" && !ui.selectedEntity && rankingRows()[0]?.entity_id) ui.selectedEntity = rankingRows()[0].entity_id;
      renderCurrent();
      if (tab === "universities" && ui.selectedEntity && !model.institution) selectInstitution(ui.selectedEntity);
    }));
    context.root.querySelector(".qsi-tabs")?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const current = TAB_ORDER.indexOf(ui.tab); let next = current;
      if (event.key === "ArrowLeft") next = (current - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      if (event.key === "ArrowRight") next = (current + 1) % TAB_ORDER.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = TAB_ORDER.length - 1;
      event.preventDefault(); ui.tab = TAB_ORDER[next]; syncUrl(); renderCurrent(); context.root.querySelector(`[data-qsi-tab="${ui.tab}"]`)?.focus();
    });
  }

  function bind() {
    bindTabs();
    context.root.querySelector("[data-qsi-project]")?.addEventListener("change", (event) => changeProject(event.target.value));
    context.root.querySelector("[data-qsi-edition]")?.addEventListener("change", (event) => { ui.edition = Number(event.target.value); ui.selectedEntity = null; cache.ranking.clear(); cache.country.clear(); syncUrl(); refresh(); });
    context.root.querySelector("[data-qsi-country]")?.addEventListener("change", (event) => selectCountry(event.target.value));
    context.root.querySelector("[data-qsi-export]")?.addEventListener("click", () => { if (exportPermitted()) location.href = `/api/qs/projects/${encodeURIComponent(ui.project)}/ranking.csv?edition=${encodeURIComponent(ui.edition)}`; });

    context.root.querySelectorAll("[data-qsi-entity]").forEach((button) => button.addEventListener("click", (event) => { if (event.target.closest("[data-qsi-compare]")) return; selectInstitution(button.dataset.qsiEntity); }));
    context.root.querySelectorAll("[data-qsi-compare]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); toggleCompare(button.dataset.qsiCompare); }));
    context.root.querySelectorAll("[data-qsi-remove-compare]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); toggleCompare(button.dataset.qsiRemoveCompare); }));
    context.root.querySelector("[data-qsi-clear-compare]")?.addEventListener("click", () => { ui.compare = []; syncUrl(); renderCurrent(); });
    context.root.querySelectorAll("[data-qsi-provenance]").forEach((button) => button.addEventListener("click", () => context.openProvenance?.(button.dataset.qsiProvenance, button)));

    let rankingTimer = null;
    context.root.querySelector("[data-qsi-ranking-query]")?.addEventListener("input", (event) => { clearTimeout(rankingTimer); ui.rankingQuery = event.target.value; rankingTimer = setTimeout(() => { ui.rankingPage = 1; renderCurrent(); }, 180); });
    context.root.querySelector("[data-qsi-ranking-country]")?.addEventListener("change", (event) => { ui.rankingCountry = event.target.value; ui.rankingPage = 1; renderCurrent(); });
    context.root.querySelector("[data-qsi-ranking-band]")?.addEventListener("change", (event) => { ui.rankingBand = event.target.value; ui.rankingPage = 1; renderCurrent(); });
    context.root.querySelector("[data-qsi-page-size]")?.addEventListener("change", (event) => { ui.rankingPageSize = Number(event.target.value); ui.rankingPage = 1; renderCurrent(); });
    context.root.querySelectorAll("[data-qsi-page]").forEach((button) => button.addEventListener("click", () => { ui.rankingPage += button.dataset.qsiPage === "next" ? 1 : -1; renderCurrent(); }));

    let institutionTimer = null;
    context.root.querySelector("[data-qsi-institution-query]")?.addEventListener("input", (event) => { clearTimeout(institutionTimer); ui.institutionQuery = event.target.value; institutionTimer = setTimeout(renderCurrent, 180); });
    let subjectTimer = null;
    context.root.querySelector("[data-qsi-subject-query]")?.addEventListener("input", (event) => { clearTimeout(subjectTimer); ui.subjectQuery = event.target.value; subjectTimer = setTimeout(renderCurrent, 180); });
    context.root.querySelectorAll("[data-qsi-area]").forEach((button) => button.addEventListener("click", () => { ui.subjectArea = button.dataset.qsiArea; renderCurrent(); }));
    context.root.querySelectorAll("[data-qsi-project-select]").forEach((button) => button.addEventListener("click", () => changeProject(button.dataset.qsiProjectSelect)));
    context.root.querySelectorAll("[data-qsi-country-select]").forEach((button) => button.addEventListener("click", () => selectCountry(button.dataset.qsiCountrySelect)));
    context.root.querySelectorAll("[data-qsi-family]").forEach((button) => button.addEventListener("click", () => { ui.dataFamily = button.dataset.qsiFamily; ui.tab = "data"; syncUrl(); renderCurrent(); }));
    context.root.querySelector("[data-qsi-data-family]")?.addEventListener("change", (event) => { ui.dataFamily = event.target.value; renderCurrent(); });
    context.root.querySelector("[data-qsi-data-status]")?.addEventListener("change", (event) => { ui.dataStatus = event.target.value; renderCurrent(); });
  }

  async function render(options) {
    context = { ...options };
    const urlCountry = normaliseCountry(new URLSearchParams(location.search).get("qs_country"));
    if (!model) {
      ui.country = normaliseCountry(options.country);
      readUrlState();
    } else if (!urlCountry) {
      ui.country = normaliseCountry(options.country) || ui.country;
    }
    context.root.classList.add("qsi-root");
    await refresh();
  }

  function invalidate() {
    renderGeneration += 1;
    loadSerial += 1;
    activeController?.abort();
    institutionController?.abort();
    activeController = null;
    institutionController = null;
    cache.base = null;
    cache.project.clear();
    cache.ranking.clear();
    cache.country.clear();
    cache.institution.clear();
    model = null;
  }

  window.GIRQSIntelligence = { render, invalidate };
})();
