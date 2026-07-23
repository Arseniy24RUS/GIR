/* GIR · ShanghaiRanking ARWU 2025 research workspace
 *
 * This module keeps two analytically different layers explicit:
 *   1. the official institution-level Academic Ranking of World Universities;
 *   2. the transparent GIR-derived country research-university system index.
 *
 * The same interface renders both the pre-publication governance state and the
 * fully published analytical state. Missing licensed data are never replaced
 * with demonstration scores in production.
 */
(() => {
  "use strict";

  const EDITION = 2025;
  const INDICATOR_ORDER = ["ALUMNI", "AWARD", "HICI", "N_S", "PUB", "PCP"];
  const COMPONENT_ORDER = ["RANKED_INSTITUTIONS", "ELITE_DEPTH", "BEST_RANK", "MEDIAN_RANK"];
  const RANK_BANDS = [
    { code: "TOP_100", label: "1–100", weight: 1.0 },
    { code: "RANK_101_200", label: "101–200", weight: 0.6 },
    { code: "RANK_201_300", label: "201–300", weight: 0.4 },
    { code: "RANK_301_500", label: "301–500", weight: 0.25 },
    { code: "RANK_501_1000", label: "501–1000", weight: 0.1 },
  ];

  const cache = {
    status: null,
    methodology: null,
    workspaces: new Map(),
    institutions: new Map(),
  };
  let context = null;
  let model = null;
  let loadToken = 0;
  const ui = {
    view: "overview",
    rankingQuery: "",
    rankingPage: 1,
    rankingPageSize: 25,
    institutionQuery: "",
    institutionScope: "country",
    institutionPage: 1,
    institutionPageSize: 25,
    institutionPayload: null,
    institutionLoading: false,
    institutionError: "",
  };

  const INDICATOR_COPY = {
    ALUMNI: {
      ru: { title: "Выпускники — лауреаты", short: "Alumni", copy: "Выпускники университета, получившие Нобелевскую премию или медаль Филдса; вес зависит от периода получения степени." },
      en: { title: "Award-winning alumni", short: "Alumni", copy: "Alumni who received Nobel Prizes or Fields Medals, with time-dependent weights for the degree period." },
    },
    AWARD: {
      ru: { title: "Сотрудники — лауреаты", short: "Award", copy: "Сотрудники университета, получившие Нобелевскую премию или медаль Филдса; учитываются период и совместная аффилиация." },
      en: { title: "Award-winning staff", short: "Award", copy: "Staff who received Nobel Prizes or Fields Medals, accounting for time and multiple affiliations." },
    },
    HICI: {
      ru: { title: "Высокоцитируемые исследователи", short: "HiCi", copy: "Число Highly Cited Researchers, публикуемое Clarivate, как показатель глобального исследовательского влияния." },
      en: { title: "Highly Cited Researchers", short: "HiCi", copy: "Clarivate Highly Cited Researchers as a measure of global research influence." },
    },
    N_S: {
      ru: { title: "Публикации в Nature и Science", short: "N&S", copy: "Статьи в Nature и Science; для специализированных гуманитарных и социальных университетов индикатор исключается с перераспределением веса." },
      en: { title: "Nature and Science papers", short: "N&S", copy: "Papers in Nature and Science; omitted with weight reallocation for specialist humanities and social-science institutions." },
    },
    PUB: {
      ru: { title: "Публикации в SCIE и SSCI", short: "PUB", copy: "Исследовательские публикации, индексируемые в Science Citation Index Expanded и Social Sciences Citation Index." },
      en: { title: "SCIE and SSCI papers", short: "PUB", copy: "Research papers indexed in Science Citation Index Expanded and Social Sciences Citation Index." },
    },
    PCP: {
      ru: { title: "Результативность на сотрудника", short: "PCP", copy: "Сводная академическая результативность, нормированная на число сотрудников в эквиваленте полной занятости." },
      en: { title: "Per-capita performance", short: "PCP", copy: "Composite academic performance normalised by full-time-equivalent academic staff." },
    },
  };

  const COMPONENT_COPY = {
    RANKED_INSTITUTIONS: {
      ru: { title: "Масштаб представительства", short: "Breadth", copy: "Число университетов страны в опубликованном top-1000. Перед нормированием применяется ln(1+n)." },
      en: { title: "Representation breadth", short: "Breadth", copy: "Number of national universities in the published top 1000. ln(1+n) is applied before normalisation." },
    },
    ELITE_DEPTH: {
      ru: { title: "Глубина ведущего сегмента", short: "Elite depth", copy: "Взвешенная глубина университетского пула: позиции 1–100 получают больший вклад, чем нижние диапазоны." },
      en: { title: "Elite-university depth", short: "Elite depth", copy: "Band-weighted depth of the university pool, giving greater contribution to top-100 positions." },
    },
    BEST_RANK: {
      ru: { title: "Пиковая позиция", short: "Best rank", copy: "Лучшая опубликованная позиция исследовательского университета страны; меньшие места инвертируются при нормировании." },
      en: { title: "Best university position", short: "Best rank", copy: "The country's strongest published university position; lower ranks are reversed during normalisation." },
    },
    MEDIAN_RANK: {
      ru: { title: "Типичная позиция пула", short: "Median rank", copy: "Медиана позиций национального университетского пула, отражающая системную глубину, а не единственный флагман." },
      en: { title: "Typical pool position", short: "Median rank", copy: "Median position of the national university pool, capturing system depth rather than a single flagship." },
    },
  };

  function lang() { return context?.lang === "en" ? "en" : "ru"; }
  function tr(ru, en) { return lang() === "ru" ? ru : en; }
  function esc(value) {
    if (context?.escapeHtml) return context.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }
  function fmt(value, digits = 1) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function intFmt(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 0 });
  }
  function pct(value, digits = 0) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const numeric = Number(value);
    return `${fmt(numeric <= 1 ? numeric * 100 : numeric, digits)}%`;
  }
  function signed(value, digits = 1) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    const numeric = Number(value);
    return `${numeric > 0 ? "+" : ""}${fmt(numeric, digits)}`;
  }
  function clamp(value, low = 0, high = 100) { return Math.max(low, Math.min(high, Number(value) || 0)); }
  function local(item, ruKey = "name_ru", enKey = "name_en", fallback = "—") {
    if (!item) return fallback;
    return (lang() === "ru" ? item[ruKey] : item[enKey]) || item.name || item.title || item.iso3 || fallback;
  }
  function selectedIso3() { return String(context?.country || "").toUpperCase(); }
  function platformCountries() { return Array.isArray(context?.platformContext?.countries) ? context.platformContext.countries : []; }
  function selectedCountryMeta() {
    return platformCountries().find((item) => item.iso3 === selectedIso3()) || { iso3: selectedIso3(), name_ru: selectedIso3(), name_en: selectedIso3(), flag: null };
  }
  function countryLabel(row) {
    return (lang() === "ru" ? row?.name_ru : row?.name_en) || row?.country_name || row?.iso3 || "—";
  }
  function status() { return model?.status || {}; }
  function methodology() { return model?.methodology || {}; }
  function workspace() { return model?.workspace || {}; }
  function selectedCountry() { return workspace()?.country || null; }
  function components() { return Array.isArray(workspace()?.components) ? workspace().components : []; }
  function indicators() { return methodology()?.official_layer?.indicators || []; }
  function girComponents() { return methodology()?.gir_country_layer?.components || []; }
  function rankingRows() { return Array.isArray(workspace()?.ranking) ? workspace().ranking : []; }
  function distribution() { return Array.isArray(workspace()?.distribution) ? workspace().distribution : []; }
  function selectedPublished() { return Boolean(selectedCountry()?.score != null); }
  function releasePublished() { return Boolean(rankingRows().length && workspace()?.data_status === "loaded"); }
  function sourceUrl() { return workspace()?.official_ranking?.source_url || methodology()?.official_layer?.source_url || "https://www.shanghairanking.com/rankings/arwu/2025"; }
  function methodologyUrl() { return workspace()?.official_ranking?.methodology_url || methodology()?.official_layer?.methodology_url || "https://www.shanghairanking.com/methodology/arwu/2025"; }
  function trackerUrl() { return workspace()?.licensing?.tracker_url || "https://www.shanghairanking.com/solutions/arwu"; }
  function componentRow(code) { return components().find((item) => item.component_code === code || item.code === code) || null; }
  function indicatorAggregate(code) { return (workspace()?.official_indicator_aggregates || []).find((item) => item.indicator_code === code || item.code === code) || null; }
  function componentName(code) { return COMPONENT_COPY[code]?.[lang()]?.title || code; }
  function componentShort(code) { return COMPONENT_COPY[code]?.[lang()]?.short || code; }
  function indicatorName(code) { return INDICATOR_COPY[code]?.[lang()]?.title || code; }
  function indicatorShort(code) { return INDICATOR_COPY[code]?.[lang()]?.short || code; }
  function componentScore(row) { return row?.normalized_value ?? row?.normalized_score ?? row?.score ?? null; }
  function componentRaw(row) { return row?.raw_value ?? row?.value ?? null; }
  function componentContribution(row) { return row?.weighted_contribution ?? row?.contribution ?? (componentScore(row) == null ? null : Number(componentScore(row)) * Number(row?.weight || 0)); }
  function componentWeight(code, row = componentRow(code)) {
    if (row?.weight != null) return Number(row.weight);
    return Number(girComponents().find((item) => item.code === code)?.weight || 0.25);
  }
  function selectedRank() { return selectedCountry()?.rank ?? null; }
  function selectedPercentile() { return selectedCountry()?.percentile ?? null; }
  function selectedInstitutionCount() { return selectedCountry()?.institution_count ?? 0; }

  function externalLink(url, label, className = "arwu-button is-secondary") {
    return `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span aria-hidden="true">↗</span></a>`;
  }
  function flagMarkup(meta, size = "normal") {
    if (context?.flagImage && meta?.iso3) return context.flagImage(meta.iso3, countryLabel(meta), `arwu-flag is-${size}`);
    return `<span class="arwu-flag-fallback" aria-hidden="true">${esc(meta?.iso3 || "—")}</span>`;
  }
  function panelHeader(kicker, title, copy = "", tag = "") {
    return `<header><div class="arwu-panel-title"><span>${esc(kicker)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ""}</div>${tag ? `<span class="arwu-layer-tag">${esc(tag)}</span>` : ""}</header>`;
  }
  function metric(label, value, note = "", cls = "") {
    return `<div class="arwu-metric ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }
  function emptyState(title, copy, action = "") {
    return `<div class="arwu-empty"><span aria-hidden="true">◇</span><h3>${esc(title)}</h3><p>${esc(copy)}</p>${action}</div>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body?.detail;
      const message = typeof detail === "string" ? detail : detail?.[lang() === "ru" ? "message_ru" : "message_en"];
      throw new Error(message || `HTTP ${response.status}`);
    }
    return body;
  }

  function normaliseStatus(raw) {
    const loaded = raw?.loaded || {};
    const latest = raw?.latest_import || raw?.loaded?.latest_import || null;
    const numericPublished = Number(loaded.country_score_rows || 0) > 0;
    return {
      ...raw,
      numericPublished,
      latest_import: latest,
      release: {
        status: numericPublished ? "published" : raw?.data_status || "awaiting_authorized_export",
        institution_rows: Number(loaded.institution_rows || 0),
        published_rows: Number(loaded.published_top_1000_rows || 0),
        country_scores: Number(loaded.country_score_rows || 0),
      },
    };
  }

  function normaliseWorkspace(raw) {
    const institutionPayload = raw?.institutions || {};
    return {
      ...raw,
      ranking: Array.isArray(raw?.ranking) ? raw.ranking : raw?.ranking?.rows || [],
      distribution: Array.isArray(raw?.distribution) ? raw.distribution : [],
      components: Array.isArray(raw?.components) ? raw.components : [],
      official_indicator_aggregates: Array.isArray(raw?.official_indicator_aggregates) ? raw.official_indicator_aggregates : [],
      institutions: {
        access: Array.isArray(institutionPayload) ? "authorized" : institutionPayload.access || "rights_gated",
        rows: Array.isArray(institutionPayload) ? institutionPayload : institutionPayload.rows || [],
        total: Array.isArray(institutionPayload) ? institutionPayload.length : Number(institutionPayload.total || 0),
        reason_ru: institutionPayload.reason_ru || "",
        reason_en: institutionPayload.reason_en || "",
      },
    };
  }

  async function load() {
    const iso3 = selectedIso3();
    const key = `${iso3}:${EDITION}`;
    if (!cache.status) cache.status = fetchJson(`/api/arwu/status?year=${EDITION}`);
    if (!cache.methodology) cache.methodology = fetchJson(`/api/arwu/methodology`);
    if (!cache.workspaces.has(key)) cache.workspaces.set(key, fetchJson(`/api/index/ARWU/workspace?country=${encodeURIComponent(iso3)}&year=${EDITION}`));
    const [rawStatus, rawMethodology, rawWorkspace] = await Promise.all([cache.status, cache.methodology, cache.workspaces.get(key)]);
    return { status: normaliseStatus(rawStatus), methodology: rawMethodology, workspace: normaliseWorkspace(rawWorkspace) };
  }

  function loadingState() {
    return `<div class="arwu-workspace"><section class="arwu-loading" aria-live="polite"><span class="arwu-loading-mark">ARWU</span><h1>${tr("Формируется аналитика исследовательских университетов", "Building research-university analytics")}</h1><p>${tr("Загружаются официальный методический слой, состояние выпуска и страновая диагностическая модель GIR.", "Loading the official methodology, release state and the GIR country diagnostic model.")}</p></section></div>`;
  }
  function errorState(error) {
    return `<div class="arwu-workspace"><section class="arwu-error" role="alert"><span>ARWU · ${EDITION}</span><h1>${tr("Не удалось открыть рабочее пространство", "Unable to open the workspace")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="arwu-button" data-arwu-retry>${tr("Повторить", "Retry")}</button></section></div>`;
  }

  function releaseState() {
    const code = status()?.release?.status || workspace()?.data_status || "awaiting_authorized_export";
    const labels = {
      published: tr("Страновая аналитика опубликована", "Country analytics published"),
      loaded: tr("Страновая аналитика опубликована", "Country analytics published"),
      awaiting_authorized_export: tr("Ожидается разрешённый экспорт", "Authorised export pending"),
      partial_authorized_export_validated_non_publishable: tr("Неполный файл проверен; публикация заблокирована", "Partial file validated; publication locked"),
      validated_non_publishable: tr("Файл проверен; публикация не разрешена", "File validated; publication not permitted"),
      rejected: tr("Выпуск отклонён проверкой", "Release rejected by validation"),
    };
    return { code, label: labels[code] || code, published: releasePublished() };
  }

  function commandHeader() {
    return `<section class="arwu-command"><div class="arwu-command-identity"><span class="arwu-command-mark">ARWU</span><div><span class="arwu-kicker">${tr("УНИВЕРСИТЕТСКАЯ АНАЛИТИКА · ИССЛЕДОВАТЕЛЬСКИЕ СИСТЕМЫ · 2025", "UNIVERSITY ANALYTICS · RESEARCH SYSTEMS · 2025")}</span><h1>${tr("ARWU: исследовательские университеты", "ARWU research universities")}</h1><p>${tr("Официальный университетский рейтинг ShanghaiRanking и отдельная прозрачная страновая диагностика GIR.", "The official ShanghaiRanking institution ranking and a separate transparent GIR country diagnostic.")}</p></div></div><div class="arwu-command-actions">${externalLink(sourceUrl(), tr("Официальный рейтинг", "Official ranking"))}${externalLink(methodologyUrl(), tr("Методика ARWU", "ARWU methodology"))}<button type="button" class="arwu-button" data-arwu-view="quality">${tr("Готовность данных", "Data readiness")}</button></div></section>`;
  }

  function countryOptions() {
    return platformCountries().map((country) => `<option value="${esc(country.iso3)}" ${country.iso3 === selectedIso3() ? "selected" : ""}>${esc(countryLabel(country))}</option>`).join("");
  }

  function toolbar() {
    const state = releaseState();
    return `<section class="arwu-toolbar" aria-label="${esc(tr("Параметры анализа ARWU", "ARWU analysis controls"))}"><label class="arwu-field"><span>${tr("Страна", "Country")}</span><select class="arwu-select" data-arwu-country>${countryOptions()}</select></label><label class="arwu-field"><span>${tr("Редакция", "Edition")}</span><select class="arwu-select" aria-label="${esc(tr("Редакция ARWU", "ARWU edition"))}" disabled><option>${EDITION}</option></select></label><div class="arwu-toolbar-context"><span>${tr("Аналитический слой", "Analytical layer")}</span><strong>${tr("Производная страновая оценка GIR", "GIR-derived country score")}</strong></div><div class="arwu-toolbar-status ${state.published ? "is-ready" : "is-caution"}"><i aria-hidden="true"></i><span>${esc(state.label)}</span></div></section>`;
  }

  const TAB_DEFS = [
    ["overview", "Обзор", "Overview"],
    ["country", "Профиль страны", "Country profile"],
    ["institutions", "Университеты", "Universities"],
    ["international", "Международное поле", "International field"],
    ["quality", "Данные и качество", "Data and quality"],
    ["methodology", "Методика", "Methodology"],
  ];
  function tabs() {
    return `<div class="arwu-tabs" role="tablist" aria-label="${esc(tr("Разделы ARWU", "ARWU sections"))}">${TAB_DEFS.map(([code, ru, en]) => `<button type="button" role="tab" id="arwuTab${code}" aria-controls="arwuView${code}" aria-selected="${ui.view === code ? "true" : "false"}" tabindex="${ui.view === code ? "0" : "-1"}" data-arwu-view="${code}">${esc(tr(ru, en))}</button>`).join("")}</div>`;
  }

  function kpiStrip() {
    const summary = workspace()?.summary || {};
    const state = releaseState();
    return `<section class="arwu-kpis" aria-label="${esc(tr("Ключевые параметры ARWU", "ARWU key parameters"))}">${metric(tr("Редакция", "Edition"), String(EDITION), tr("ежегодный выпуск", "annual edition"))}${metric(tr("Оценивается", "Evaluated"), `${intFmt(summary.official_candidate_university_count_minimum || 2500)}+`, tr("университетов", "universities"))}${metric(tr("Публикуется", "Published"), intFmt(summary.official_published_university_count || 1000), tr("университетов", "universities"))}${metric(tr("Индикаторы ARWU", "ARWU indicators"), intFmt(summary.official_indicator_count || 6), tr("официальная модель", "official model"))}${metric(tr("Компоненты GIR", "GIR components"), intFmt(girComponents().length || 4), tr("страновая диагностика", "country diagnostic"))}${metric(tr("Числовой слой", "Numeric layer"), state.published ? tr("Опубликован", "Published") : tr("Ожидается экспорт", "Export pending"), state.published ? `${intFmt(summary.country_count)} ${tr("стран", "countries")}` : tr("без демонстрационных значений", "no demonstration values"), state.published ? "is-accent" : "is-warning")}</section>`;
  }

  function componentRows({ compact = false } = {}) {
    return `<div class="arwu-component-list ${compact ? "is-compact" : ""}">${COMPONENT_ORDER.map((code) => {
      const row = componentRow(code);
      const score = componentScore(row);
      const contribution = componentContribution(row);
      const weight = componentWeight(code, row);
      const raw = componentRaw(row);
      const width = score == null ? 0 : clamp(score);
      return `<div class="arwu-component-row"><div class="arwu-component-copy"><b>${esc(componentName(code))}</b><span>${esc(COMPONENT_COPY[code][lang()].copy)}</span></div><div class="arwu-component-values"><strong>${score == null ? "—" : fmt(score, 1)}</strong><span>${tr("вклад", "contribution")} ${contribution == null ? "—" : fmt(contribution, 1)} · ${pct(weight, 0)}</span></div><div class="arwu-track" aria-label="${esc(componentName(code))}: ${score == null ? tr("нет данных", "no data") : fmt(score, 1)}"><i style="width:${width}%"></i></div>${compact ? "" : `<small>${tr("Исходное значение", "Raw value")}: ${raw == null ? "—" : fmt(raw, Number.isInteger(Number(raw)) ? 0 : 1)}</small>`}</div>`;
    }).join("")}</div>`;
  }

  function countryConsole() {
    const meta = selectedCountryMeta();
    const country = selectedCountry();
    const available = selectedPublished();
    return `<article class="arwu-panel span-6 arwu-country-console">${panelHeader(tr("ПРОФИЛЬ СТРАНЫ", "COUNTRY PROFILE"), countryLabel(meta), tr("Страновая оценка описывает масштаб и глубину системы исследовательских университетов.", "The country score describes the breadth and depth of the research-university system."), tr("GIR · производная оценка", "GIR · derived score"))}<div class="arwu-country-heading">${flagMarkup(meta)}<div><strong>${esc(countryLabel(meta))}</strong><span>${available ? tr("Опубликованный профиль", "Published profile") : tr("Результат ещё не опубликован", "Result not yet published")}</span></div></div><div class="arwu-country-metrics">${metric(tr("Оценка GIR", "GIR score"), available ? fmt(country.score, 1) : "—", tr("из 100", "out of 100"))}${metric(tr("Место", "Rank"), available ? `${intFmt(country.rank)} / ${intFmt(rankingRows().length)}` : "—", tr("описательное место GIR", "descriptive GIR rank"))}${metric(tr("Процентиль", "Percentile"), available ? pct(country.percentile, 0) : "—", tr("международное поле", "international field"))}${metric(tr("Университеты", "Universities"), available ? intFmt(country.institution_count) : "—", tr("в опубликованном top-1000", "in the published top 1000"))}</div>${componentRows({ compact: true })}<footer class="arwu-panel-footer"><span>${available ? tr("Сумма четырёх взвешенных вкладов воспроизводит итоговый score.", "The four weighted contributions reproduce the final score.") : tr("Структура расчёта готова; числовые значения появятся только после полного разрешённого импорта.", "The calculation structure is ready; numeric values appear only after a complete authorised import.")}</span>${available && country.value_id ? `<button type="button" class="arwu-link-button" data-arwu-provenance="${esc(country.value_id)}">${tr("Происхождение оценки", "Score provenance")} →</button>` : `<button type="button" class="arwu-link-button" data-arwu-view="quality">${tr("Открыть контроль выпуска", "Open release control")} →</button>`}</footer></article>`;
  }

  function officialModelConsole() {
    const totalWeight = indicators().reduce((sum, item) => sum + Number(item.weight || 0), 0);
    return `<article class="arwu-panel span-3 arwu-official-console">${panelHeader(tr("ОФИЦИАЛЬНАЯ МОДЕЛЬ", "OFFICIAL MODEL"), tr("Шесть индикаторов", "Six indicators"), tr("Университетская формула ShanghaiRanking.", "ShanghaiRanking's institution formula."), totalWeight ? pct(totalWeight, 0) : "100%")}<div class="arwu-indicator-mini">${INDICATOR_ORDER.map((code) => {
      const item = indicators().find((entry) => entry.code === code) || {};
      const weight = Number(item.weight ?? ({ ALUMNI: .1, AWARD: .2, HICI: .2, N_S: .2, PUB: .2, PCP: .1 }[code]));
      return `<div><span><b>${esc(indicatorShort(code))}</b><em>${esc(indicatorName(code))}</em></span><strong>${pct(weight, 0)}</strong><i><u style="width:${clamp(weight * 100)}%"></u></i></div>`;
    }).join("")}</div><footer class="arwu-panel-footer"><span>${tr("Каждый индикатор масштабируется относительно лидирующего университета.", "Each indicator is scaled relative to the leading university.")}</span></footer></article>`;
  }

  function releaseSteps() {
    const release = status()?.release || {};
    const latest = status()?.latest_import || {};
    const importRecorded = Boolean(latest?.import_id || release.institution_rows > 0);
    const topComplete = Number(release.published_rows || 0) >= 1000 || Boolean(latest?.full_published_universe);
    const countryPublished = releasePublished();
    const steps = [
      { n: 1, done: importRecorded, active: !importRecorded, title: tr("Получить разрешённый экспорт", "Obtain an authorised export"), note: tr("официальный файл / ARWU Tracker", "official file / ARWU Tracker") },
      { n: 2, done: topComplete, active: importRecorded && !topComplete, title: tr("Проверить top-1000 и ISO3", "Validate top 1000 and ISO3"), note: topComplete ? tr("полнота подтверждена", "completeness confirmed") : tr("ожидает полного выпуска", "awaiting complete release") },
      { n: 3, done: countryPublished, active: topComplete && !countryPublished, title: tr("Рассчитать страновой слой GIR", "Compute the GIR country layer"), note: tr("четыре компонента · 0–100", "four components · 0–100") },
      { n: 4, done: countryPublished, active: false, title: tr("Опубликовать аналитику", "Publish analytics"), note: countryPublished ? tr("доступно пользователям", "available to users") : tr("после правовой проверки", "after rights review") },
    ];
    return `<div class="arwu-release-steps">${steps.map((item) => `<div class="${item.done ? "is-done" : item.active ? "is-active" : ""}"><span>${item.done ? "✓" : item.n}</span><div><b>${esc(item.title)}</b><small>${esc(item.note)}</small></div></div>`).join("")}</div>`;
  }

  function releaseConsole() {
    const release = status()?.release || {};
    const state = releaseState();
    return `<article class="arwu-panel span-3 arwu-release-console">${panelHeader(tr("ГОТОВНОСТЬ ДАННЫХ", "DATA READINESS"), state.published ? tr("Выпуск опубликован", "Release published") : tr("Контролируемый импорт", "Controlled import"), tr("Числовая аналитика не создаётся до прохождения всех gates.", "Numeric analytics are not created before all gates pass."), state.published ? tr("ГОТОВО", "READY") : tr("ОЖИДАЕТ", "PENDING"))}${releaseSteps()}<div class="arwu-release-metrics">${metric(tr("Импортировано", "Imported"), `${intFmt(release.institution_rows)} / 1 000`)}${metric(tr("Опубликовано стран", "Published countries"), intFmt(release.country_scores))}</div><footer class="arwu-panel-footer"><button type="button" class="arwu-button is-secondary" data-arwu-view="quality">${tr("Открыть контроль выпуска", "Open release control")}</button></footer></article>`;
  }

  function formulaArchitecturePanel() {
    const formula = workspace()?.formula || {};
    return `<article class="arwu-panel span-7">${panelHeader(tr("СТРАНОВАЯ МОДЕЛЬ GIR", "GIR COUNTRY MODEL"), tr("Четыре равных измерения системы", "Four equally weighted system dimensions"), tr("Страновой score не воспроизводит официальную формулу университета и не является продуктом ShanghaiRanking.", "The country score does not reproduce the official institution formula and is not a ShanghaiRanking product."), tr("25% × 4", "25% × 4"))}<div class="arwu-formula"><code>ARWU<sub>GIR</sub> = 0,25 × BREADTH* + 0,25 × ELITE_DEPTH* + 0,25 × BEST_RANK* + 0,25 × MEDIAN_RANK*</code><p>${esc(lang() === "ru" ? formula.formula_text_ru || formula.method_notes_ru : formula.formula_text_en || formula.method_notes_en)}</p></div><div class="arwu-formula-grid">${COMPONENT_ORDER.map((code, index) => `<div><span>0${index + 1}</span><b>${esc(componentName(code))}</b><p>${esc(COMPONENT_COPY[code][lang()].copy)}</p><strong>25%</strong></div>`).join("")}</div></article>`;
  }

  function bandWeightsPanel() {
    return `<article class="arwu-panel span-5">${panelHeader(tr("ГЛУБИНА ВЕДУЩЕГО СЕГМЕНТА", "ELITE-DEPTH MODEL"), tr("Вес диапазонов ARWU", "ARWU band weights"), tr("Исходное диапазонное место сохраняется; midpoint применяется только в вычислениях.", "The published rank band is retained; its midpoint is used only for computation."))}<div class="arwu-band-grid">${RANK_BANDS.map((band) => `<div><span>${esc(band.label)}</span><i><u style="width:${band.weight * 100}%"></u></i><strong>${fmt(band.weight, band.weight < 1 ? 2 : 1)}</strong></div>`).join("")}</div><div class="arwu-method-note"><strong>${tr("Почему логарифмирование?", "Why logarithms?")}</strong><p>${tr("Breadth и elite depth используют ln(1+x), чтобы размер крупной университетской системы не давал линейного преимущества над меньшими системами.", "Breadth and elite depth use ln(1+x) so that large university systems do not receive a linear scale advantage over smaller systems.")}</p></div></article>`;
  }

  function overviewView() {
    return `<section class="arwu-view" id="arwuViewoverview" role="tabpanel" aria-labelledby="arwuTaboverview">${kpiStrip()}<div class="arwu-grid">${countryConsole()}${officialModelConsole()}${releaseConsole()}${formulaArchitecturePanel()}${bandWeightsPanel()}</div><div class="arwu-boundary"><strong>${tr("Методическая граница", "Methodological boundary")}</strong><p>${tr("ShanghaiRanking публикует рейтинг отдельных университетов. GIR создаёт отдельную воспроизводимую страновую диагностику масштаба и глубины исследовательской университетской системы; она не является официальным рейтингом стран ARWU.", "ShanghaiRanking publishes an institution ranking. GIR creates a separate reproducible country diagnostic of research-university system breadth and depth; it is not an official ARWU country ranking.")}</p></div></section>`;
  }

  function scoreCard() {
    const meta = selectedCountryMeta();
    const country = selectedCountry();
    const available = selectedPublished();
    return `<article class="arwu-panel span-4 arwu-score-card">${panelHeader(tr("ИТОГОВАЯ ОЦЕНКА", "OVERALL SCORE"), countryLabel(meta), tr("Производная страновая оценка GIR.", "GIR-derived country score."), tr("не официальный рейтинг стран", "not an official country ranking"))}<div class="arwu-score-identity">${flagMarkup(meta, "large")}<div><strong>${esc(countryLabel(meta))}</strong><span>${EDITION}</span></div></div><div class="arwu-score-number"><strong>${available ? fmt(country.score, 1) : "—"}</strong><span>${tr("из 100", "out of 100")}</span></div><div class="arwu-score-facts">${metric(tr("Место GIR", "GIR rank"), available ? intFmt(country.rank) : "—")}${metric(tr("Процентиль", "Percentile"), available ? pct(country.percentile, 0) : "—")}${metric(tr("Университеты", "Universities"), available ? intFmt(country.institution_count) : "—")}${metric(tr("Качество", "Quality"), available ? String(country.data_quality || "—") : "—")}</div>${available && country.value_id ? `<button type="button" class="arwu-button is-secondary" data-arwu-provenance="${esc(country.value_id)}">${tr("Проверить происхождение", "Open provenance")}</button>` : `<div class="arwu-score-lock"><i aria-hidden="true"></i><p>${tr("Результат будет опубликован только после полного разрешённого top-1000 и проверки прав на производный слой.", "The result will be published only after a complete authorised top 1000 and rights validation for the derived layer.")}</p></div>`}</article>`;
  }

  function decompositionPanel() {
    const rows = COMPONENT_ORDER.map((code) => ({ code, row: componentRow(code) }));
    const total = rows.reduce((sum, item) => sum + Number(componentContribution(item.row) || 0), 0);
    return `<article class="arwu-panel span-8">${panelHeader(tr("ДЕКОМПОЗИЦИЯ", "DECOMPOSITION"), tr("Из чего складывается страновая оценка", "How the country score is formed"), tr("Исходное значение, нормированный score, вес и численный вклад показаны раздельно.", "Raw value, normalised score, weight and numeric contribution are shown separately."), selectedPublished() ? `${fmt(total, 1)} / 100` : tr("структура готова", "structure ready"))}<div class="arwu-decomposition">${rows.map(({ code, row }) => {
      const score = componentScore(row);
      const contribution = componentContribution(row);
      const raw = componentRaw(row);
      const weight = componentWeight(code, row);
      return `<div><div class="arwu-decomposition-copy"><span>${esc(componentShort(code))}</span><b>${esc(componentName(code))}</b><p>${esc(COMPONENT_COPY[code][lang()].copy)}</p></div><div class="arwu-decomposition-metrics"><span>${tr("исходное", "raw")}<strong>${raw == null ? "—" : fmt(raw, Number.isInteger(Number(raw)) ? 0 : 1)}</strong></span><span>${tr("score", "score")}<strong>${score == null ? "—" : fmt(score, 1)}</strong></span><span>${tr("вес", "weight")}<strong>${pct(weight, 0)}</strong></span><span>${tr("вклад", "contribution")}<strong>${contribution == null ? "—" : fmt(contribution, 1)}</strong></span></div><div class="arwu-contribution-track"><i style="width:${contribution == null ? 0 : clamp(contribution / 25 * 100)}%"></i></div>${row?.value_id ? `<button type="button" class="arwu-link-button" data-arwu-provenance="${esc(row.value_id)}">${tr("Provenance", "Provenance")} →</button>` : ""}</div>`;
    }).join("")}</div></article>`;
  }

  function indicatorProfilePanel() {
    const available = (workspace()?.official_indicator_aggregates || []).length > 0;
    return `<article class="arwu-panel span-6">${panelHeader(tr("ОФИЦИАЛЬНЫЕ ИНДИКАТОРЫ", "OFFICIAL INDICATORS"), tr("Диагностический профиль ведущих университетов", "Diagnostic profile of leading universities"), tr("Среднее до десяти наиболее высоко расположенных университетов страны; этот слой не входит в страновой score GIR.", "Mean of up to ten highest-ranked national universities; this layer does not enter the GIR country score."), tr("отдельный слой", "separate layer"))}<div class="arwu-indicator-profile">${INDICATOR_ORDER.map((code) => {
      const aggregate = indicatorAggregate(code);
      const method = indicators().find((item) => item.code === code) || {};
      const value = aggregate?.raw_value;
      const width = value == null ? 0 : clamp(value);
      return `<div><span><b>${esc(indicatorShort(code))}</b><em>${esc(indicatorName(code))}</em></span><strong>${value == null ? "—" : fmt(value, 1)}</strong><small>${aggregate ? `${intFmt(aggregate.institution_count)} ${tr("университетов", "universities")}` : `${pct(method.weight || 0, 0)} ${tr("в официальной формуле", "in the official formula")}`}</small><i><u style="width:${width}%"></u></i>${aggregate?.value_id ? `<button type="button" class="arwu-icon-button" aria-label="${esc(tr("Происхождение показателя", "Indicator provenance"))}" data-arwu-provenance="${esc(aggregate.value_id)}">↗</button>` : ""}</div>`;
    }).join("")}</div>${available ? "" : `<div class="arwu-inline-note"><strong>${tr("Профиль ожидает числовой слой", "Profile awaiting numeric data")}</strong><p>${tr("Официальные индикаторные scores появятся только при наличии разрешённого экспорта и достаточной полноты строк.", "Official indicator scores appear only when an authorised export provides sufficient row coverage.")}</p></div>`}</article>`;
  }

  function countryUniversitiesPreview() {
    const payload = workspace()?.institutions || {};
    const rows = payload.rows || [];
    if (payload.access !== "authorized") {
      return `<article class="arwu-panel span-6">${panelHeader(tr("УНИВЕРСИТЕТСКИЙ СЛОЙ", "INSTITUTION LAYER"), tr("Строки ограничены правами доступа", "Rows are rights-gated"), tr("Страновой производный результат и публикация исходных университетских строк имеют разные правовые gates.", "The derived country result and publication of institution rows have separate rights gates."), tr("restricted", "restricted"))}${emptyState(tr("Университетские строки не публикуются", "Institution rows are not published"), lang() === "ru" ? payload.reason_ru || "Отдельное разрешение на публикацию университетских строк не зарегистрировано." : payload.reason_en || "No separate permission to publish institution rows has been recorded.", `<button type="button" class="arwu-button is-secondary" data-arwu-view="institutions">${tr("Открыть университетский слой", "Open institution layer")}</button>`)}</article>`;
    }
    return `<article class="arwu-panel span-6">${panelHeader(tr("УНИВЕРСИТЕТСКИЙ СЛОЙ", "INSTITUTION LAYER"), tr("Ведущие университеты страны", "Leading national universities"), tr("Показано разрешённое представление официальных строк ARWU.", "Authorised view of official ARWU institution rows."), `${intFmt(payload.total)} ${tr("строк", "rows")}`)}<div class="arwu-mini-table">${rows.slice(0, 8).map((row) => `<div><strong>${esc(row.world_rank_display || fmt(row.world_rank_midpoint, 0))}</strong><span>${esc(row.institution_name)}</span><em>${row.total_score == null ? "—" : fmt(row.total_score, 1)}</em></div>`).join("")}</div><footer class="arwu-panel-footer"><span>${tr("Диапазонное место сохраняется в опубликованном виде.", "Published rank bands are retained as shown.")}</span><button type="button" class="arwu-link-button" data-arwu-view="institutions">${tr("Все университеты", "All universities")} →</button></footer></article>`;
  }

  function interpretationPanel() {
    return `<article class="arwu-panel span-12 arwu-interpretation">${panelHeader(tr("ИНТЕРПРЕТАЦИЯ", "INTERPRETATION"), tr("Что измеряет и чего не измеряет ARWU", "What ARWU measures and what it does not"), tr("Высокая позиция отражает исследовательскую мощность и академический престиж, но не является исчерпывающей оценкой качества обучения.", "A high position reflects research capacity and academic prestige but is not a comprehensive measure of teaching quality."))}<div class="arwu-interpretation-grid"><div><strong>${tr("Корректный вывод", "Supported interpretation")}</strong><p>${tr("Страна имеет более масштабный и/или более глубокий пул университетов, представленных в официальном top-1000 ARWU.", "The country has a broader and/or deeper pool of universities represented in the official ARWU top 1000.")}</p></div><div><strong>${tr("Некорректный вывод", "Unsupported interpretation")}</strong><p>${tr("Место не доказывает качество всей системы высшего образования, доступность обучения или результативность каждого университета страны.", "The rank does not prove the quality of an entire higher-education system, access to education or the performance of every national university.")}</p></div><div><strong>${tr("Системный эффект", "System-size effect")}</strong><p>${tr("Breadth и elite depth зависят от размера системы; логарифмирование уменьшает, но не устраняет этот эффект.", "Breadth and elite depth depend on system size; logarithms reduce but do not remove this effect.")}</p></div></div></article>`;
  }

  function countryView() {
    return `<section class="arwu-view" id="arwuViewcountry" role="tabpanel" aria-labelledby="arwuTabcountry"><div class="arwu-grid">${scoreCard()}${decompositionPanel()}${indicatorProfilePanel()}${countryUniversitiesPreview()}${interpretationPanel()}</div></section>`;
  }

  function institutionAccessState(payload) {
    const access = payload?.access || workspace()?.institutions?.access || "rights_gated";
    if (access === "authorized") return null;
    const reason = lang() === "ru" ? payload?.reason_ru || workspace()?.institutions?.reason_ru : payload?.reason_en || workspace()?.institutions?.reason_en;
    return `<div class="arwu-rights-gate"><div><span aria-hidden="true">▣</span><div><strong>${tr("Публикация университетских строк ограничена", "Institution-row publication is restricted")}</strong><p>${esc(reason || tr("Не зарегистрировано отдельное разрешение на публикацию строк.", "No separate permission to publish institution rows is recorded."))}</p></div></div><dl><dt>${tr("Страновой score GIR", "GIR country score")}</dt><dd>${tr("может публиковаться при отдельном разрешении на производный слой", "may be published under separate derived-layer permission")}</dd><dt>${tr("Университетские строки", "Institution rows")}</dt><dd>${tr("требуют отдельного разрешения", "require separate permission")}</dd><dt>${tr("Raw-файл", "Raw file")}</dt><dd>${tr("не распространяется по умолчанию", "not redistributed by default")}</dd></dl>${externalLink(trackerUrl(), tr("ARWU Tracker", "ARWU Tracker"), "arwu-button is-secondary")}</div>`;
  }

  function institutionToolbar() {
    return `<form class="arwu-table-toolbar" data-arwu-institution-form><label><span>${tr("Область", "Scope")}</span><select class="arwu-select" data-arwu-institution-scope><option value="country" ${ui.institutionScope === "country" ? "selected" : ""}>${tr("Выбранная страна", "Selected country")}</option><option value="all" ${ui.institutionScope === "all" ? "selected" : ""}>${tr("Все страны", "All countries")}</option></select></label><label><span>${tr("Поиск университета", "University search")}</span><input class="arwu-input" type="search" value="${esc(ui.institutionQuery)}" placeholder="${esc(tr("Название университета", "University name"))}" data-arwu-institution-query></label><button type="submit" class="arwu-button">${tr("Найти", "Search")}</button></form>`;
  }

  function institutionTable(payload) {
    const rows = payload?.rows || [];
    if (ui.institutionLoading) return `<div class="arwu-table-loading" aria-live="polite">${tr("Загружаются университетские строки…", "Loading institution rows…")}</div>`;
    if (ui.institutionError) return emptyState(tr("Не удалось загрузить таблицу", "Unable to load the table"), ui.institutionError, `<button type="button" class="arwu-button" data-arwu-institution-retry>${tr("Повторить", "Retry")}</button>`);
    const gate = institutionAccessState(payload);
    if (gate) return gate;
    if (!rows.length) return emptyState(tr("Строки не найдены", "No rows found"), tr("Измените область или поисковый запрос.", "Change the scope or search query."));
    return `<div class="arwu-table-region" role="region" tabindex="0" aria-label="${esc(tr("Таблица университетов ARWU", "ARWU institution table"))}"><table class="arwu-table arwu-institution-table"><caption>${tr("Официальные университетские строки ARWU 2025; отображение зависит от зарегистрированных прав.", "Official ARWU 2025 institution rows; visibility depends on recorded rights.")}</caption><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Университет", "University")}</th><th>${tr("Страна", "Country")}</th><th>${tr("Нац. место", "National rank")}</th><th>${tr("Score", "Score")}</th>${INDICATOR_ORDER.map((code) => `<th>${esc(indicatorShort(code))}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${esc(row.world_rank_display || fmt(row.world_rank_midpoint, 0))}</strong></td><td>${esc(row.institution_name)}</td><td>${esc(row.country_name || row.iso3 || "—")}</td><td>${esc(row.national_rank_display || "—")}</td><td>${row.total_score == null ? "—" : fmt(row.total_score, 1)}</td><td>${row.alumni_score == null ? "—" : fmt(row.alumni_score, 1)}</td><td>${row.award_score == null ? "—" : fmt(row.award_score, 1)}</td><td>${row.hici_score == null ? "—" : fmt(row.hici_score, 1)}</td><td>${row.ns_score == null ? "—" : fmt(row.ns_score, 1)}</td><td>${row.pub_score == null ? "—" : fmt(row.pub_score, 1)}</td><td>${row.pcp_score == null ? "—" : fmt(row.pcp_score, 1)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function institutionPagination(payload) {
    if (payload?.access !== "authorized") return "";
    const total = Number(payload?.total || 0);
    const pages = Math.max(1, Math.ceil(total / ui.institutionPageSize));
    const current = Math.min(ui.institutionPage, pages);
    return `<div class="arwu-pagination"><span>${tr("Строки", "Rows")} ${total ? (current - 1) * ui.institutionPageSize + 1 : 0}–${Math.min(total, current * ui.institutionPageSize)} ${tr("из", "of")} ${intFmt(total)}</span><div><button type="button" data-arwu-institution-page="${current - 1}" ${current <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><strong>${current} / ${pages}</strong><button type="button" data-arwu-institution-page="${current + 1}" ${current >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></div>`;
  }

  function institutionsView() {
    const payload = ui.institutionPayload || workspace()?.institutions || {};
    return `<section class="arwu-view" id="arwuViewinstitutions" role="tabpanel" aria-labelledby="arwuTabinstitutions"><div class="arwu-university-map-host" data-university-map-host="ARWU"></div><article class="arwu-panel span-12">${panelHeader(tr("УНИВЕРСИТЕТСКИЙ РЕЕСТР", "INSTITUTION REGISTER"), tr("Официальные строки ARWU 2025", "Official ARWU 2025 rows"), tr("Ранг, общий score и шесть официальных индикаторов отображаются только при наличии отдельного права на публикацию строк.", "Rank, overall score and six official indicators are displayed only when separate row-publication rights are recorded."), `${intFmt(payload?.total || 0)} ${tr("строк", "rows")}`)}${institutionToolbar()}${institutionTable(payload)}${institutionPagination(payload)}</article><div class="arwu-boundary"><strong>${tr("Не путать уровни", "Keep layers separate")}</strong><p>${tr("Университетская строка является официальной записью ARWU. Страновая оценка GIR рассчитывается из полного опубликованного top-1000 и имеет отдельную формулу и provenance.", "An institution row is an official ARWU record. The GIR country score is calculated from the complete published top 1000 and has a separate formula and provenance.")}</p></div></section>`;
  }

  function histogramSvg() {
    const bins = distribution();
    if (!bins.length) return `<div class="arwu-empty-chart">${tr("Распределение появится после публикации полного странового слоя.", "The distribution appears after the complete country layer is published.")}</div>`;
    const W = 720, H = 260, pad = { l: 42, r: 18, t: 20, b: 38 };
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    const maxCount = Math.max(...bins.map((item) => Number(item.count || 0)), 1);
    const barW = plotW / bins.length;
    const selected = selectedCountry()?.score;
    const sx = selected == null ? null : pad.l + clamp(selected) / 100 * plotW;
    return `<div class="arwu-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="arwuHistTitle arwuHistDesc"><title id="arwuHistTitle">${tr("Распределение страновых оценок GIR на основе ARWU", "Distribution of ARWU-based GIR country scores")}</title><desc id="arwuHistDesc">${tr("Гистограмма производных страновых оценок; выбранная страна отмечена вертикальной линией.", "Histogram of derived country scores; the selected country is marked by a vertical line.")}</desc>${[0, .25, .5, .75, 1].map((p) => { const y = pad.t + plotH * (1 - p); return `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"></line><text class="label" x="${pad.l - 7}" y="${y + 3}" text-anchor="end">${Math.round(maxCount * p)}</text>`; }).join("")}${bins.map((bin, index) => { const count = Number(bin.count || 0); const height = count / maxCount * plotH; const isSelected = selected != null && Number(bin.low) <= selected && selected <= Number(bin.high); return `<rect class="bar ${isSelected ? "is-selected" : ""}" x="${pad.l + index * barW + 3}" y="${pad.t + plotH - height}" width="${Math.max(3, barW - 6)}" height="${height}" tabindex="0"><title>${fmt(bin.low, 0)}–${fmt(bin.high, 0)}: ${count}</title></rect>`; }).join("")}${sx == null ? "" : `<line class="selected-line" x1="${sx}" x2="${sx}" y1="${pad.t}" y2="${pad.t + plotH}"></line>`}<line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${pad.t + plotH}" y2="${pad.t + plotH}"></line>${[0, 20, 40, 60, 80, 100].map((value) => `<text class="label" x="${pad.l + value / 100 * plotW}" y="${H - 11}" text-anchor="middle">${value}</text>`).join("")}</svg></div>`;
  }

  function scatterSvg() {
    const rows = rankingRows().filter((row) => Number.isFinite(Number(row.score)) && Number.isFinite(Number(row.institution_count)));
    if (!rows.length) return `<div class="arwu-empty-chart">${tr("Сопоставление появится после публикации странового слоя.", "The comparison appears after the country layer is published.")}</div>`;
    const W = 720, H = 310, pad = { l: 58, r: 24, t: 24, b: 48 };
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    const maxInstitutions = Math.max(...rows.map((row) => Number(row.institution_count)), 1);
    const logMax = Math.log1p(maxInstitutions);
    const x = (n) => pad.l + Math.log1p(Number(n)) / logMax * plotW;
    const y = (score) => pad.t + (1 - clamp(score) / 100) * plotH;
    const ticksX = Array.from(new Set([0, 1, 5, 10, 25, 50, 100, maxInstitutions].filter((value) => value <= maxInstitutions))).sort((a, b) => a - b);
    return `<div class="arwu-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="arwuScatterTitle arwuScatterDesc"><title id="arwuScatterTitle">${tr("Масштаб представительства и страновая оценка", "Institution breadth and country score")}</title><desc id="arwuScatterDesc">${tr("По горизонтали — число университетов страны в top-1000 ARWU в логарифмическом масштабе; по вертикали — производная оценка GIR.", "Horizontal axis: number of national universities in the ARWU top 1000 on a logarithmic scale; vertical axis: the derived GIR score.")}</desc>${[0, 25, 50, 75, 100].map((value) => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(value)}" y2="${y(value)}"></line><text class="label" x="${pad.l - 8}" y="${y(value) + 3}" text-anchor="end">${value}</text>`).join("")}${ticksX.map((value) => `<line class="grid" x1="${x(value)}" x2="${x(value)}" y1="${pad.t}" y2="${pad.t + plotH}"></line><text class="label" x="${x(value)}" y="${H - 15}" text-anchor="middle">${value}</text>`).join("")}${rows.map((row) => `<circle class="point ${row.iso3 === selectedIso3() ? "is-selected" : ""}" cx="${x(row.institution_count)}" cy="${y(row.score)}" r="${row.iso3 === selectedIso3() ? 6 : 3.6}" tabindex="0" data-arwu-row="${esc(row.iso3)}"><title>${esc(countryLabel(row))}: ${fmt(row.score, 1)}; ${intFmt(row.institution_count)} ${tr("университетов", "universities")}</title></circle>`).join("")}<line class="axis" x1="${pad.l}" x2="${W - pad.r}" y1="${pad.t + plotH}" y2="${pad.t + plotH}"></line><line class="axis" x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${pad.t + plotH}"></line><text class="axis-title" x="${pad.l + plotW / 2}" y="${H - 1}" text-anchor="middle">${tr("Университеты в top-1000 (логарифмическая ось)", "Universities in top 1000 (log scale)")}</text></svg></div>`;
  }

  function filteredRanking() {
    const query = ui.rankingQuery.trim().toLocaleLowerCase(lang() === "ru" ? "ru" : "en");
    return rankingRows().filter((row) => !query || countryLabel(row).toLocaleLowerCase(lang() === "ru" ? "ru" : "en").includes(query) || String(row.iso3 || "").toLowerCase().includes(query));
  }

  function rankingTable() {
    const rows = filteredRanking();
    const pages = Math.max(1, Math.ceil(rows.length / ui.rankingPageSize));
    ui.rankingPage = Math.min(ui.rankingPage, pages);
    const slice = rows.slice((ui.rankingPage - 1) * ui.rankingPageSize, ui.rankingPage * ui.rankingPageSize);
    if (!rankingRows().length) return emptyState(tr("Страновой рейтинг ещё не опубликован", "Country ranking not yet published"), tr("После разрешённого полного импорта здесь появятся score, место, процентиль и число университетов каждой страны.", "After a complete authorised import, this area will show score, rank, percentile and university count for each country."));
    return `<div class="arwu-table-region" role="region" tabindex="0" aria-label="${esc(tr("Страновой рейтинг GIR на основе ARWU", "ARWU-based GIR country ranking"))}"><table class="arwu-table"><caption>${tr("Производная страновая агрегация GIR; не официальный рейтинг стран ShanghaiRanking.", "GIR-derived country aggregation; not an official ShanghaiRanking country ranking.")}</caption><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Страна", "Country")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Процентиль", "Percentile")}</th><th>${tr("Университеты", "Universities")}</th><th>${tr("Качество", "Quality")}</th></tr></thead><tbody>${slice.map((row) => `<tr class="${row.iso3 === selectedIso3() ? "is-selected" : ""}" tabindex="0" data-arwu-row="${esc(row.iso3)}"><td><strong>${intFmt(row.rank)}</strong></td><td><span class="arwu-country-cell">${flagMarkup(row, "small")}<b>${esc(countryLabel(row))}</b><small>${esc(row.iso3)}</small></span></td><td>${fmt(row.score, 1)}</td><td>${pct(row.percentile, 0)}</td><td>${intFmt(row.institution_count)}</td><td>${esc(row.data_quality || "—")}</td></tr>`).join("")}</tbody></table></div><div class="arwu-pagination"><span>${tr("Страны", "Countries")} ${rows.length ? (ui.rankingPage - 1) * ui.rankingPageSize + 1 : 0}–${Math.min(rows.length, ui.rankingPage * ui.rankingPageSize)} ${tr("из", "of")} ${intFmt(rows.length)}</span><div><button type="button" data-arwu-ranking-page="${ui.rankingPage - 1}" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><strong>${ui.rankingPage} / ${pages}</strong><button type="button" data-arwu-ranking-page="${ui.rankingPage + 1}" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></div>`;
  }

  function internationalView() {
    const top = rankingRows()[0];
    return `<section class="arwu-view" id="arwuViewinternational" role="tabpanel" aria-labelledby="arwuTabinternational"><div class="arwu-grid"><article class="arwu-panel span-7">${panelHeader(tr("РАСПРЕДЕЛЕНИЕ", "DISTRIBUTION"), tr("Страновые оценки GIR", "GIR country scores"), tr("Гистограмма показывает производное международное поле 0–100.", "The histogram shows the derived 0–100 international field."), `${intFmt(rankingRows().length)} ${tr("стран", "countries")}`)}${histogramSvg()}<div class="arwu-chart-legend"><span class="selected"><i></i>${tr("выбранная страна", "selected country")}</span></div></article><article class="arwu-panel span-5">${panelHeader(tr("ЛИДИРУЮЩАЯ ГРУППА", "LEADING GROUP"), tr("Верхние позиции странового поля", "Top positions in the country field"), tr("Описательный порядок GIR, а не официальный рейтинг ShanghaiRanking.", "Descriptive GIR ordering, not an official ShanghaiRanking ranking."))}${rankingRows().length ? `<div class="arwu-top-list">${rankingRows().slice(0, 8).map((row) => `<button type="button" data-arwu-row="${esc(row.iso3)}"><span>${intFmt(row.rank)}</span><b>${esc(countryLabel(row))}</b><strong>${fmt(row.score, 1)}</strong><small>${intFmt(row.institution_count)} ${tr("университетов", "universities")}</small></button>`).join("")}</div>` : emptyState(tr("Пока нет опубликованного поля", "No published field yet"), tr("Top-1000 ещё не загружен в разрешённом режиме.", "The top 1000 has not yet been loaded under an authorised basis."))}${top ? `<footer class="arwu-panel-footer"><span>${tr("Лидер", "Leader")}: <b>${esc(countryLabel(top))}</b></span></footer>` : ""}</article><article class="arwu-panel span-7">${panelHeader(tr("СТРУКТУРА СИСТЕМЫ", "SYSTEM STRUCTURE"), tr("Масштаб и итоговая оценка", "Breadth and overall score"), tr("Логарифмическая ось числа университетов позволяет сравнивать системы разного масштаба.", "A logarithmic institution-count axis supports comparisons across differently sized systems."))}${scatterSvg()}</article><article class="arwu-panel span-5">${panelHeader(tr("ВЫБРАННАЯ СТРАНА", "SELECTED COUNTRY"), countryLabel(selectedCountryMeta()), tr("Краткая структура текущего профиля.", "Compact structure of the current profile."), selectedPublished() ? `${fmt(selectedCountry().score, 1)} / 100` : "—")}${componentRows({ compact: true })}</article><article class="arwu-panel span-12">${panelHeader(tr("МЕЖДУНАРОДНЫЙ РЕЙТИНГ", "INTERNATIONAL RANKING"), tr("Производная страновая агрегация GIR", "GIR-derived country aggregation"), tr("Поиск, выбор страны, пагинация и CSV текущей редакции.", "Search, country selection, pagination and edition CSV."), releasePublished() ? `${intFmt(rankingRows().length)} ${tr("стран", "countries")}` : tr("ожидает выпуска", "awaiting release"))}<div class="arwu-table-toolbar"><label><span>${tr("Поиск страны", "Country search")}</span><input class="arwu-input" type="search" value="${esc(ui.rankingQuery)}" placeholder="${esc(tr("Название или ISO3", "Name or ISO3"))}" data-arwu-ranking-query></label>${releasePublished() ? `<a class="arwu-button is-secondary" href="/api/index/ARWU/workspace.csv?year=${EDITION}&lang=${lang()}" download="gir-arwu-${EDITION}.csv">CSV ↓</a>` : `<button type="button" class="arwu-button is-secondary" disabled>CSV ↓</button>`}</div>${rankingTable()}</article></div></section>`;
  }

  function rightsMatrix() {
    const latest = status()?.latest_import || {};
    const rights = [
      [tr("Локальное хранение", "Local storage"), latest.storage_permitted],
      [tr("Аналитическое преобразование", "Analytical transformation"), latest.transformation_permitted],
      [tr("Публикация странового слоя", "Country-layer publication"), latest.derived_country_publication_permitted],
      [tr("Публикация университетских строк", "Institution-row publication"), latest.institution_row_publication_permitted],
      [tr("Распространение raw", "Raw redistribution"), latest.raw_redistribution_permitted],
    ];
    return `<div class="arwu-rights-matrix">${rights.map(([label, value]) => `<div><span>${esc(label)}</span><strong class="${value ? "is-yes" : "is-no"}">${value ? tr("Разрешено", "Permitted") : tr("Не подтверждено", "Not confirmed")}</strong></div>`).join("")}</div>`;
  }

  function qualitySummaryPanel() {
    const release = status()?.release || {};
    const latest = status()?.latest_import || {};
    const mapped = Number(latest.published_institutions_mapped || latest.institutions_mapped || 0);
    const received = Number(latest.published_rows_received || release.published_rows || 0);
    const mappingPct = received ? mapped / received * 100 : 0;
    return `<article class="arwu-panel span-7">${panelHeader(tr("КОНТРОЛЬ ВЫПУСКА", "RELEASE CONTROL"), tr("Полнота, сопоставление и публикационные gates", "Completeness, mapping and publication gates"), tr("Неполный файл может быть проверен, но не заменяет действующую полную редакцию и не создаёт страновые scores.", "A partial file may be validated but cannot replace a complete edition or create country scores."), releaseState().label)}<div class="arwu-quality-grid">${metric(tr("Получено строк", "Rows received"), intFmt(latest.rows_received || release.institution_rows), tr("в импортированном файле", "in imported file"))}${metric(tr("Top-1000", "Top 1000"), intFmt(latest.published_rows_received || release.published_rows), tr("должно быть 1 000", "must equal 1,000"), Number(latest.published_rows_received || release.published_rows) === 1000 ? "is-accent" : "is-warning")}${metric(tr("Сопоставлено ISO3", "ISO3 mapped"), received ? pct(mappingPct, 1) : "—", `${intFmt(mapped)} / ${intFmt(received)}`)}${metric(tr("Страновые scores", "Country scores"), intFmt(release.country_scores), tr("после полного gate", "after full gate"))}</div>${releaseSteps()}<div class="arwu-quality-ledger"><div><span>${tr("Checksum", "Checksum")}</span><code>${esc(latest.file_sha256 || "—")}</code></div><div><span>${tr("Основание доступа", "Access basis")}</span><b>${esc(latest.acquisition_basis || status()?.licensing?.accepted_input || "—")}</b></div><div><span>${tr("Статус публикации", "Publication status")}</span><b>${esc(latest.publication_status || workspace()?.data_status || "—")}</b></div><div><span>${tr("Import ID", "Import ID")}</span><code>${esc(latest.import_id || "—")}</code></div></div></article>`;
  }

  function lineagePanel() {
    const steps = [
      ["01", tr("Разрешённый официальный экспорт", "Authorised official export"), tr("CSV/XLSX из официального или лицензированного контура.", "CSV/XLSX from an official or licensed access channel.")],
      ["02", tr("Сохранение и SHA-256", "Preservation and SHA-256"), tr("Приватный snapshot; raw не публикуется по умолчанию.", "Private snapshot; raw data are not redistributed by default.")],
      ["03", tr("Проверка top-1000 и ISO3", "Top-1000 and ISO3 validation"), tr("Полнота выпуска, уникальность строк и сопоставление стран.", "Edition completeness, row uniqueness and country mapping.")],
      ["04", tr("Нормирование компонентов", "Component normalisation"), tr("Логарифмы, обратная нормализация рангов и midpoint диапазонов.", "Log transforms, reversed ranks and rank-band midpoints.")],
      ["05", tr("Страновой score и provenance", "Country score and provenance"), tr("Четыре взвешенных вклада и отдельная доказательная карточка.", "Four weighted contributions and a separate evidence record.")],
    ];
    return `<article class="arwu-panel span-5">${panelHeader(tr("DATA LINEAGE", "DATA LINEAGE"), tr("От официальной строки к страновой диагностике", "From official row to country diagnostic"), tr("Официальный и производный слои не смешиваются.", "Official and derived layers remain separate."))}<div class="arwu-lineage">${steps.map(([n, title, copy]) => `<div><span>${n}</span><div><b>${esc(title)}</b><p>${esc(copy)}</p></div></div>`).join("")}</div></article>`;
  }

  function qualityView() {
    return `<section class="arwu-view" id="arwuViewquality" role="tabpanel" aria-labelledby="arwuTabquality"><div class="arwu-grid">${qualitySummaryPanel()}${lineagePanel()}<article class="arwu-panel span-6">${panelHeader(tr("ПРАВА НА ДАННЫЕ", "DATA RIGHTS"), tr("Раздельные разрешения", "Separate permissions"), tr("Право на производную страновую аналитику не подразумевает право публиковать raw или университетские строки.", "Permission for derived country analytics does not imply permission to publish raw data or institution rows."))}${rightsMatrix()}<div class="arwu-panel-actions">${externalLink(sourceUrl(), tr("Copyright notice", "Copyright notice"))}${externalLink(trackerUrl(), "ARWU Tracker")}</div></article><article class="arwu-panel span-6">${panelHeader(tr("КОНТРАКТ ИМПОРТА", "IMPORT CONTRACT"), tr("Строгая загрузка без scraping", "Strict ingestion without scraping"), tr("Поддерживаются только пользовательский официальный файл, лицензированный Tracker-export или письменное разрешение.", "Only a user-supplied official file, licensed Tracker export or written permission is accepted."))}<div class="arwu-contract"><dl><dt>${tr("Форматы", "Formats")}</dt><dd>${esc((workspace()?.import_contract?.formats || ["csv", "xlsx", "xlsm"]).join(", ").toUpperCase())}</dd><dt>${tr("Обязательные поля", "Required fields")}</dt><dd><code>${esc((workspace()?.import_contract?.required_fields || []).join(" · "))}</code></dd><dt>${tr("Gate полноты", "Completeness gate")}</dt><dd>${intFmt(workspace()?.import_contract?.complete_publication_gate || 1000)} ${tr("опубликованных строк", "published rows")}</dd><dt>${tr("Неполный импорт", "Partial import")}</dt><dd>${tr("только валидация; scores не публикуются", "validation only; scores remain unpublished")}</dd></dl><pre>python scripts/import_arwu_authorized_export.py \\\n  /secure/ARWU2025.xlsx \\\n  --confirm-official-export \\\n  --confirm-local-storage-permitted \\\n  --confirm-transformation-permitted \\\n  --confirm-derived-country-publication-permitted</pre></div></article></div><div class="arwu-boundary"><strong>${tr("Запрет автоматического извлечения", "No automated extraction")}</strong><p>${tr("Модуль не выполняет scraping сайта ShanghaiRanking. Веб-интерфейс показывает только официально полученный разрешённый слой и допустимые производные результаты.", "The module does not scrape the ShanghaiRanking website. The interface displays only an officially obtained authorised layer and permitted derived results.")}</p></div></section>`;
  }

  function officialMethodCards() {
    return `<div class="arwu-method-grid">${INDICATOR_ORDER.map((code) => {
      const item = indicators().find((entry) => entry.code === code) || {};
      const copy = INDICATOR_COPY[code][lang()];
      return `<article class="arwu-method-card"><header><span>${esc(copy.short)}</span><strong>${pct(item.weight ?? ({ ALUMNI: .1, AWARD: .2, HICI: .2, N_S: .2, PUB: .2, PCP: .1 }[code]), 0)}</strong></header><h3>${esc(copy.title)}</h3><p>${esc(copy.copy)}</p><small>${esc(lang() === "ru" ? item.criterion_ru || "" : item.criterion_en || "")}</small></article>`;
    }).join("")}</div>`;
  }

  function methodologyView() {
    const officialLayer = methodology()?.official_layer || {};
    const girLayer = methodology()?.gir_country_layer || {};
    const limitations = methodology()?.limitations?.[lang()] || [];
    return `<section class="arwu-view" id="arwuViewmethodology" role="tabpanel" aria-labelledby="arwuTabmethodology"><div class="arwu-grid"><article class="arwu-panel span-12">${panelHeader(tr("ОФИЦИАЛЬНАЯ МЕТОДИКА ARWU", "OFFICIAL ARWU METHODOLOGY"), tr("Шесть индикаторов исследовательской результативности", "Six research-performance indicators"), tr("Итоговый score университета формируется из взвешенных индикаторов и масштабируется относительно лидера.", "The institution score is formed from weighted indicators and scaled relative to the leader."), "ShanghaiRanking")}${officialMethodCards()}<div class="arwu-method-note"><strong>${tr("Нормирование", "Normalisation")}</strong><p>${esc(lang() === "ru" ? officialLayer.normalization_ru || "" : officialLayer.normalization_en || "")}</p></div><div class="arwu-method-note"><strong>${tr("Специальный случай N&S", "N&S special case")}</strong><p>${esc(lang() === "ru" ? officialLayer.special_case_ru || "" : officialLayer.special_case_en || "")}</p></div></article><article class="arwu-panel span-7">${panelHeader(tr("СТРАНОВАЯ ФОРМУЛА GIR", "GIR COUNTRY FORMULA"), tr("Масштаб, элитная глубина, пик и типичная позиция", "Breadth, elite depth, peak and typical position"), tr("Все четыре компонента имеют равный вес и нормируются внутри полной редакции.", "All four components have equal weight and are normalised within the complete edition."), tr("не официальный продукт ARWU", "not an official ARWU product"))}<div class="arwu-formula large"><code>ARWU<sub>GIR</sub> = ¼(BREADTH* + ELITE_DEPTH* + BEST_RANK* + MEDIAN_RANK*)</code><p>${esc(lang() === "ru" ? workspace()?.formula?.method_notes_ru || "" : workspace()?.formula?.method_notes_en || "")}</p></div>${componentRows()}</article><article class="arwu-panel span-5">${panelHeader(tr("РАНГИ И НЕОПРЕДЕЛЁННОСТЬ", "RANKS AND UNCERTAINTY"), tr("Диапазонные позиции", "Rank bands"), tr("Опубликованный интервал не преобразуется в ложное точное место.", "A published interval is not turned into a falsely precise rank."))}<div class="arwu-rank-rule"><div><span>201–300</span><strong>250,5</strong><small>${tr("midpoint только для расчёта", "midpoint for computation only")}</small></div><p>${tr("Исходное отображение диапазона сохраняется в университетской таблице и provenance. Чем выше доля диапазонных позиций, тем осторожнее следует интерпретировать небольшие различия страновых scores.", "The original band display is retained in the institution table and provenance. The larger the share of banded ranks, the more cautiously small country-score differences should be interpreted.")}</p></div>${bandWeightsPanel().replace('<article class="arwu-panel span-5">', '<div class="arwu-embedded-band">').replace('</article>', '</div>')}</article><article class="arwu-panel span-12">${panelHeader(tr("ОГРАНИЧЕНИЯ И ИСТОЧНИКИ", "LIMITATIONS AND SOURCES"), tr("Граница корректной интерпретации", "Boundary of valid interpretation"), tr("ARWU — сильный, но тематически специализированный измеритель исследовательской университетской системы.", "ARWU is a strong but thematically specialised measure of research-university systems."))}<div class="arwu-limitations">${limitations.map((item, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></div>`).join("")}</div><div class="arwu-panel-actions">${externalLink(sourceUrl(), tr("ARWU 2025", "ARWU 2025"))}${externalLink(methodologyUrl(), tr("Полная методика", "Full methodology"))}${externalLink(trackerUrl(), "ARWU Tracker")}</div></article></div></section>`;
  }

  function activeView() {
    if (ui.view === "country") return countryView();
    if (ui.view === "institutions") return institutionsView();
    if (ui.view === "international") return internationalView();
    if (ui.view === "quality") return qualityView();
    if (ui.view === "methodology") return methodologyView();
    return overviewView();
  }

  function renderPage({ preserveFocus = false } = {}) {
    if (!context?.root || !model) return;
    context.root.innerHTML = `<div class="arwu-workspace">${commandHeader()}${toolbar()}${tabs()}${activeView()}</div>`;
    bindEvents();
    if (ui.view === "institutions" && !ui.institutionPayload && !ui.institutionLoading) requestAnimationFrame(() => loadInstitutionRows());
    if (preserveFocus) requestAnimationFrame(() => context.root.querySelector(`[data-arwu-view="${ui.view}"]`)?.focus());
  }

  function selectCountry(iso3) {
    const code = String(iso3 || "").toUpperCase();
    if (!code) return;
    context?.selectCountry?.(code);
  }

  async function loadInstitutionRows({ force = false } = {}) {
    if (!model || ui.view !== "institutions") return;
    const offset = Math.max(0, (ui.institutionPage - 1) * ui.institutionPageSize);
    const scopeIso = ui.institutionScope === "country" ? selectedIso3() : "";
    const key = `${EDITION}:${scopeIso}:${ui.institutionQuery.trim()}:${offset}:${ui.institutionPageSize}`;
    if (!force && cache.institutions.has(key)) {
      ui.institutionPayload = cache.institutions.get(key);
      renderPage();
      return;
    }
    ui.institutionLoading = true;
    ui.institutionError = "";
    renderPage();
    try {
      const query = new URLSearchParams({ year: String(EDITION), limit: String(ui.institutionPageSize), offset: String(offset) });
      if (scopeIso) query.set("iso3", scopeIso);
      if (ui.institutionQuery.trim()) query.set("q", ui.institutionQuery.trim());
      const payload = await fetchJson(`/api/arwu/institutions?${query.toString()}`);
      cache.institutions.set(key, payload);
      ui.institutionPayload = payload;
    } catch (error) {
      ui.institutionError = error?.message || String(error);
    } finally {
      ui.institutionLoading = false;
      if (ui.view === "institutions") renderPage();
    }
  }

  function bindEvents() {
    const root = context.root;
    root.querySelectorAll("[data-arwu-view]").forEach((button) => button.addEventListener("click", () => {
      ui.view = button.dataset.arwuView;
      renderPage({ preserveFocus: true });
    }));
    const tabsRoot = root.querySelector(".arwu-tabs");
    tabsRoot?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabsList = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
      const current = tabsList.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabsList.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabsList.length) % tabsList.length;
      ui.view = tabsList[next].dataset.arwuView;
      renderPage();
      requestAnimationFrame(() => context.root.querySelector(`[data-arwu-view="${ui.view}"]`)?.focus());
    });
    root.querySelector("[data-arwu-country]")?.addEventListener("change", (event) => selectCountry(event.target.value));
    root.querySelectorAll("[data-arwu-row]").forEach((node) => {
      const activate = () => selectCountry(node.dataset.arwuRow);
      node.addEventListener("click", activate);
      node.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-arwu-provenance]").forEach((button) => button.addEventListener("click", () => context?.openProvenance?.(button.dataset.arwuProvenance, button)));
    root.querySelector("[data-arwu-ranking-query]")?.addEventListener("input", (event) => {
      ui.rankingQuery = event.target.value;
      ui.rankingPage = 1;
      renderPage();
      requestAnimationFrame(() => { const input = context.root.querySelector("[data-arwu-ranking-query]"); input?.focus(); input?.setSelectionRange(ui.rankingQuery.length, ui.rankingQuery.length); });
    });
    root.querySelectorAll("[data-arwu-ranking-page]").forEach((button) => button.addEventListener("click", () => {
      ui.rankingPage = Math.max(1, Number(button.dataset.arwuRankingPage));
      renderPage();
      requestAnimationFrame(() => context.root.querySelector(".arwu-table-region")?.focus());
    }));
    root.querySelector("[data-arwu-institution-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      ui.institutionQuery = root.querySelector("[data-arwu-institution-query]")?.value || "";
      ui.institutionScope = root.querySelector("[data-arwu-institution-scope]")?.value || "country";
      ui.institutionPage = 1;
      ui.institutionPayload = null;
      loadInstitutionRows({ force: true });
    });
    root.querySelector("[data-arwu-institution-scope]")?.addEventListener("change", (event) => {
      ui.institutionScope = event.target.value;
      ui.institutionPage = 1;
      ui.institutionPayload = null;
      loadInstitutionRows({ force: true });
    });
    root.querySelectorAll("[data-arwu-institution-page]").forEach((button) => button.addEventListener("click", () => {
      ui.institutionPage = Math.max(1, Number(button.dataset.arwuInstitutionPage));
      ui.institutionPayload = null;
      loadInstitutionRows({ force: true });
    }));
    root.querySelector("[data-arwu-institution-retry]")?.addEventListener("click", () => loadInstitutionRows({ force: true }));
    const universityMapHost = root.querySelector('[data-university-map-host="ARWU"]');
    if (universityMapHost && window.GIRUniversityMap?.render) {
      window.GIRUniversityMap.render(universityMapHost, {
        sourceCode: "ARWU",
        year: EDITION,
        lang: lang(),
        selectedCountry: selectedIso3(),
        defaultRankMax: 500,
        eyebrow: "ShanghaiRanking ARWU 2025",
        title: tr("Мировая карта исследовательских университетов ARWU", "World map of ARWU research universities"),
        subtitle: tr("Цвет показывает диапазон официального места, размер — опубликованный total score или позицию; университетские строки остаются под отдельным rights gate.", "Colour shows the official rank band and size represents the published total score or position; institution rows remain protected by a separate rights gate."),
        openProvenance: context.openProvenance,
        selectCountry: (iso3) => selectCountry(iso3),
      });
    }
  }

  async function render(nextContext) {
    context = nextContext;
    if (!context?.root || !selectedIso3()) return;
    const token = ++loadToken;
    context.root.innerHTML = loadingState();
    try {
      const payload = await load();
      if (token !== loadToken) return;
      model = payload;
      ui.institutionPayload = null;
      renderPage();
    } catch (error) {
      if (token !== loadToken) return;
      context.root.innerHTML = errorState(error);
      context.root.querySelector("[data-arwu-retry]")?.addEventListener("click", () => { invalidate(); render(nextContext); });
    }
  }

  function invalidate({ country } = {}) {
    model = null;
    ui.institutionPayload = null;
    ui.institutionError = "";
    if (country) cache.workspaces.delete(`${String(country).toUpperCase()}:${EDITION}`);
  }

  window.GIRARWU = { render, invalidate, _test: { cache, ui } };
})();
