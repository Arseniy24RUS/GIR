(() => {
  "use strict";

  const MODULE_VERSION = "1.0.0";
  const API = "/api/corruption-perceptions";
  const VIEW_KEYS = ["overview", "sources", "trend", "ranking", "changes", "methodology"];
  const MAP_URLS = ["/static/world_countries_lite.geojson"];
  const OFFICIAL_ORDER = "official_transparency_international_rank";
  const DERIVED_SOURCE_ORDER = "derived_gir_source_score_order_not_official_country_rank";
  const SCORE_SEMANTICS = "official_transparency_international_cpi_score_0_to_100_higher_is_better";
  const OFFICIAL_RANK_PRESERVED = true;
  const MINIMUM_SOURCES = 3;
  const CONFIDENCE_LEVEL = 0.90;

  const TEXT = {
    ru: {
      indexName: "Индекс восприятия коррупции",
      indexShort: "CPI",
      publisher: "Transparency International",
      loadingTitle: "Загрузка CPI",
      loadingText: "Получаем опубликованную редакцию, официальный рейтинг, источники и временные ряды.",
      notLoadedTitle: "Интерфейс CPI готов",
      notLoadedText: "Опубликованная редакция ещё не прошла publication gate. Тестовые значения не подставляются.",
      errorTitle: "Не удалось загрузить CPI",
      retry: "Повторить",
      overview: "Обзор",
      sources: "13 источников",
      trend: "Динамика",
      ranking: "Мировой рейтинг",
      changes: "Значимые изменения",
      methodology: "Методология и аудит",
      heroKicker: "Коррупция государственного сектора · восприятие экспертов и бизнеса",
      heroLead: "Официальный показатель Transparency International по шкале 0–100: более высокий score означает более низкий воспринимаемый уровень коррупции государственного сектора.",
      officialScore: "Официальный score",
      officialRank: "Официальное место",
      scoreScale: "Шкала 0–100 · больше — лучше",
      countries: "Стран и территорий",
      dataYear: "Год данных",
      edition: "Редакция",
      country: "Страна",
      share: "Скопировать ссылку",
      provenance: "Происхождение значения",
      copied: "Ссылка скопирована",
      overviewKicker: "Страновой профиль",
      overviewHeading: "Официальный CPI и статистическая неопределённость",
      overviewText: "Score и rank сохранены в том виде, в котором они опубликованы Transparency International. GIR не пересчитывает официальные места.",
      globalAverage: "Официальное среднее мира",
      regionalAverage: "Среднее региона",
      changeSince2012: "Изменение с 2012 года",
      sourceCount: "Источников в оценке",
      confidenceInterval: "90%-ный доверительный интервал",
      standardError: "Стандартная ошибка",
      worldMap: "Карта CPI",
      mapText: "Цвет отражает официальный score выбранного года; серый означает отсутствие данных.",
      scoreProfile: "Положение на шкале 0–100",
      neighbors: "Соседи по официальному рейтингу",
      position: "Место",
      score: "Score",
      noData: "Нет данных",
      openProfile: "Открыть профиль",
      region: "Регион",
      significantStatus: "Статистически значимое изменение",
      noSignificantChange: "В официальной таблице значимых изменений страна не отмечена",
      improved: "Улучшение",
      declined: "Ухудшение",
      sourcesKicker: "Входные оценки",
      sourcesHeading: "Источники, использованные для расчёта",
      sourcesText: "CPI объединяет стандартизированные оценки независимых институтов. Для включения страны требуется минимум три источника; сами входные значения не являются отдельным официальным рейтингом CPI.",
      selectedSource: "Выбранный источник",
      sourceInstitution: "Организация",
      standardizedScore: "Стандартизированная оценка",
      activeSource: "Используется в текущей редакции",
      historicalSource: "Исторический источник",
      reversed: "Шкала была обращена до стандартизации",
      notReversed: "Направление шкалы сохранено",
      observations: "Наблюдений страны",
      sourceSeries: "Динамика входной оценки",
      sourceOrderingWarning: "Сортировка по источнику — производная аналитика GIR, а не официальный рейтинг Transparency International.",
      trendKicker: "Сопоставимый ряд",
      trendHeading: "Динамика score с 2012 года",
      trendText: "Официальные CPI scores сопоставимы с 2012 года. Места во времени следует интерпретировать осторожно, поскольку охват стран меняется.",
      metric: "Показатель",
      scoreMetric: "Официальный score",
      rankMetric: "Официальное место",
      firstYear: "Первый год",
      lastYear: "Последний год",
      periodDelta: "Изменение за период",
      minimum: "Минимум",
      maximum: "Максимум",
      rankWarning: "Изменение места не эквивалентно изменению score и зависит от состава рейтинга.",
      trendTable: "Табличный ряд",
      lowerCi: "Нижняя граница CI",
      upperCi: "Верхняя граница CI",
      rankingKicker: "Сравнение стран",
      rankingHeading: "Официальный мировой рейтинг CPI",
      rankingText: "По умолчанию строки следуют опубликованному месту. При выборе отдельного источника официальный rank сохраняется, а порядок становится производным.",
      search: "Поиск",
      searchPlaceholder: "Страна или ISO3",
      allRegions: "Все регионы",
      incomeGroup: "Группа дохода",
      allIncomeGroups: "Все группы",
      rankingMetric: "Порядок строк",
      officialRanking: "Официальное место CPI",
      pageSize: "Строк на странице",
      exportCsv: "Экспорт CSV",
      shown: "Показано",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      sourceScore: "Оценка источника",
      sourceCountShort: "Источники",
      uncertainty: "90% CI",
      changesKicker: "Официальная статистическая проверка",
      changesHeading: "Статистически значимые изменения с 2012 года",
      changesText: "Transparency International публикует отдельную таблицу стран, изменение score которых статистически значимо. Категория не выводится GIR из простого сравнения двух чисел.",
      all: "Все",
      improvers: "Улучшившиеся",
      decliners: "Ухудшившиеся",
      currentScore: "Текущий score",
      referenceScore: "Исходный score",
      referenceYear: "Исходный год",
      direction: "Изменение",
      totalChanges: "Всего отмечено",
      methodologyKicker: "Воспроизводимость",
      methodologyHeading: "Методология, лицензирование и audit trail",
      methodologyText: "Интерфейс отделяет официальные результаты, входные оценки и производные представления GIR, сохраняя provenance каждой строки.",
      principleSubject: "Что измеряет CPI",
      principleSubjectText: "Воспринимаемый уровень коррупции государственного сектора по данным экспертов и руководителей бизнеса, а не число зарегистрированных преступлений.",
      principleSources: "Минимум три источника",
      principleSourcesText: "Страна включается в индекс только при наличии не менее трёх подходящих источников; в редакции 2025 используется 13 действующих источников.",
      principleScale: "Шкала 0–100",
      principleScaleText: "0 означает очень высокий воспринимаемый уровень коррупции, 100 — очень низкий. Score не является процентом.",
      principleTime: "Сопоставимость с 2012 года",
      principleTimeText: "Сопоставлять во времени следует прежде всего score. Rank зависит от числа и состава стран в конкретном выпуске.",
      framework: "Схема данных CPI",
      sourcesAudit: "Источник и аудит",
      auditPassed: "Проверка пройдена",
      auditReview: "Требуется проверка",
      publicationGate: "Publication gate",
      release: "Редакция",
      releaseId: "Release ID",
      retrievedAt: "Получено",
      rawSnapshot: "SHA-256 исходного файла",
      rawBytes: "Размер snapshot",
      transformId: "Transformation ID",
      importerVersion: "Версия импортёра",
      sourceSheet: "Исходный лист",
      sourceRow: "Исходная строка",
      officialSource: "Страница CPI 2025",
      dataset: "Официальный XLSX",
      methodologyLink: "Техническая методология",
      sourceDescription: "Описание источников",
      copyright: "Условия использования",
      mapUnavailable: "Карта недоступна; рейтинг и профиль продолжают работать.",
      keyboardTabs: "Для перемещения по вкладкам используйте клавиши со стрелками, Home и End.",
      official: "Официальное значение Transparency International",
      derived: "Производная аналитика GIR",
      sourceInput: "Официальная входная оценка",
      highBand: "Более высокий score",
      upperMidBand: "Выше среднего",
      midBand: "Средний диапазон",
      lowBand: "Низкий score",
      veryLowBand: "Очень низкий score",
      records: "записей",
      clear: "Сбросить",
    },
    en: {
      indexName: "Corruption Perceptions Index",
      indexShort: "CPI",
      publisher: "Transparency International",
      loadingTitle: "Loading CPI",
      loadingText: "Retrieving the published release, official ranking, sources and time series.",
      notLoadedTitle: "The CPI interface is ready",
      notLoadedText: "No release has passed the publication gate yet. No test values are substituted.",
      errorTitle: "CPI could not be loaded",
      retry: "Retry",
      overview: "Overview",
      sources: "13 sources",
      trend: "Trend",
      ranking: "World ranking",
      changes: "Significant changes",
      methodology: "Methodology & audit",
      heroKicker: "Public-sector corruption · expert and business perceptions",
      heroLead: "Transparency International's official 0–100 measure: a higher score indicates lower perceived levels of public-sector corruption.",
      officialScore: "Official score",
      officialRank: "Official rank",
      scoreScale: "0–100 scale · higher is better",
      countries: "Countries & territories",
      dataYear: "Data year",
      edition: "Edition",
      country: "Country",
      share: "Copy link",
      provenance: "Value provenance",
      copied: "Link copied",
      overviewKicker: "Country profile",
      overviewHeading: "Official CPI and statistical uncertainty",
      overviewText: "Score and rank are preserved exactly as published by Transparency International. GIR does not recompute official ranks.",
      globalAverage: "Official global average",
      regionalAverage: "Regional average",
      changeSince2012: "Change since 2012",
      sourceCount: "Sources in assessment",
      confidenceInterval: "90% confidence interval",
      standardError: "Standard error",
      worldMap: "CPI map",
      mapText: "Colour represents the official score for the selected year; grey means no data.",
      scoreProfile: "Position on the 0–100 scale",
      neighbors: "Neighbours in the official ranking",
      position: "Rank",
      score: "Score",
      noData: "No data",
      openProfile: "Open profile",
      region: "Region",
      significantStatus: "Statistically significant change",
      noSignificantChange: "The country is not flagged in the official significant-change table",
      improved: "Improvement",
      declined: "Decline",
      sourcesKicker: "Input assessments",
      sourcesHeading: "Sources used in the calculation",
      sourcesText: "CPI combines standardised assessments from independent institutions. At least three sources are required; the input values are not separate official CPI rankings.",
      selectedSource: "Selected source",
      sourceInstitution: "Institution",
      standardizedScore: "Standardised score",
      activeSource: "Used in current edition",
      historicalSource: "Historical source",
      reversed: "Scale reversed before standardisation",
      notReversed: "Source direction retained",
      observations: "Country observations",
      sourceSeries: "Input-score trend",
      sourceOrderingWarning: "Ordering by an input source is derived GIR analytics, not an official Transparency International ranking.",
      trendKicker: "Comparable series",
      trendHeading: "Score trend since 2012",
      trendText: "Official CPI scores are comparable from 2012. Ranks require caution because country coverage changes.",
      metric: "Metric",
      scoreMetric: "Official score",
      rankMetric: "Official rank",
      firstYear: "First year",
      lastYear: "Last year",
      periodDelta: "Period change",
      minimum: "Minimum",
      maximum: "Maximum",
      rankWarning: "A rank movement is not equivalent to a score movement and depends on ranking coverage.",
      trendTable: "Tabular series",
      lowerCi: "Lower CI",
      upperCi: "Upper CI",
      rankingKicker: "Country comparison",
      rankingHeading: "Official CPI world ranking",
      rankingText: "Rows follow the published rank by default. When an input source is selected, the official rank remains visible while row order becomes derived.",
      search: "Search",
      searchPlaceholder: "Country or ISO3",
      allRegions: "All regions",
      incomeGroup: "Income group",
      allIncomeGroups: "All groups",
      rankingMetric: "Row order",
      officialRanking: "Official CPI rank",
      pageSize: "Rows per page",
      exportCsv: "Export CSV",
      shown: "Shown",
      previous: "Previous",
      next: "Next",
      page: "Page",
      sourceScore: "Source score",
      sourceCountShort: "Sources",
      uncertainty: "90% CI",
      changesKicker: "Official statistical test",
      changesHeading: "Statistically significant changes since 2012",
      changesText: "Transparency International publishes a separate table of countries whose score change is statistically significant. GIR does not infer this category from a simple two-number comparison.",
      all: "All",
      improvers: "Improvers",
      decliners: "Decliners",
      currentScore: "Current score",
      referenceScore: "Reference score",
      referenceYear: "Reference year",
      direction: "Change",
      totalChanges: "Total flagged",
      methodologyKicker: "Reproducibility",
      methodologyHeading: "Methodology, licensing and audit trail",
      methodologyText: "The interface separates official results, source inputs and derived GIR views while retaining row-level provenance.",
      principleSubject: "What CPI measures",
      principleSubjectText: "Perceived levels of public-sector corruption according to experts and business executives, not the number of recorded offences.",
      principleSources: "At least three sources",
      principleSourcesText: "A country is included only when at least three eligible sources are available; the 2025 edition uses 13 active sources.",
      principleScale: "0–100 scale",
      principleScaleText: "0 means very high perceived corruption and 100 means very low perceived corruption. The score is not a percentage.",
      principleTime: "Comparable since 2012",
      principleTimeText: "Score is the primary metric for comparisons over time. Rank depends on the number and composition of countries in each edition.",
      framework: "CPI data model",
      sourcesAudit: "Source & audit",
      auditPassed: "Audit passed",
      auditReview: "Review required",
      publicationGate: "Publication gate",
      release: "Release",
      releaseId: "Release ID",
      retrievedAt: "Retrieved",
      rawSnapshot: "Raw-file SHA-256",
      rawBytes: "Snapshot size",
      transformId: "Transformation ID",
      importerVersion: "Importer version",
      sourceSheet: "Source sheet",
      sourceRow: "Source row",
      officialSource: "CPI 2025 page",
      dataset: "Official XLSX",
      methodologyLink: "Technical methodology",
      sourceDescription: "Source description",
      copyright: "Terms of use",
      mapUnavailable: "The map is unavailable; ranking and profile remain usable.",
      keyboardTabs: "Use Arrow keys, Home and End to move between tabs.",
      official: "Official Transparency International value",
      derived: "Derived GIR analytics",
      sourceInput: "Official source input",
      highBand: "Higher score",
      upperMidBand: "Above middle",
      midBand: "Middle range",
      lowBand: "Low score",
      veryLowBand: "Very low score",
      records: "records",
      clear: "Clear",
    },
  };

  const runtime = {
    root: null,
    context: {},
    lang: "ru",
    theme: "dark",
    view: "overview",
    country: "",
    year: null,
    sourceCode: "",
    rankingSource: "",
    trendMetric: "score",
    changeCategory: "",
    rankingQuery: "",
    rankingRegion: "",
    rankingIncome: "",
    rankingPage: 1,
    rankingPageSize: 25,
    status: null,
    metadata: null,
    releases: null,
    years: null,
    sources: null,
    regions: null,
    ranking: null,
    sourceRanking: null,
    profile: null,
    series: null,
    sourceSeries: null,
    changes: null,
    audit: null,
    geo: null,
    abortController: null,
    detailController: null,
    instance: 0,
  };

  const metadataCache = new Map();
  const geoCache = { value: null, promise: null };

  function tr(key) { return TEXT[runtime.lang]?.[key] ?? TEXT.ru[key] ?? key; }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  }
  function numeric(value) {
    if (value === null || value === undefined || value === "") return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
  }
  function locale() { return runtime.lang === "ru" ? "ru-RU" : "en-US"; }
  function formatNumber(value, digits = 0) {
    const number = numeric(value);
    if (number === null) return "—";
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number);
  }
  function formatSigned(value, digits = 0) {
    const number = numeric(value);
    if (number === null) return "—";
    return `${number > 0 ? "+" : ""}${formatNumber(number, digits)}`;
  }
  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale(), { year: "numeric", month: "short", day: "2-digit" }).format(date);
  }
  function median(values) {
    const numbers = values.map(numeric).filter((value) => value !== null).sort((a, b) => a - b);
    if (!numbers.length) return null;
    const middle = Math.floor(numbers.length / 2);
    return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2;
  }
  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  function countryName(item) {
    if (!item) return "—";
    if (runtime.lang === "ru") return item.host_name_ru || item.name_ru || item.current_name || item.host_name_en || item.iso3 || item.source_iso3 || "—";
    return item.host_name_en || item.name_en || item.current_name || item.host_name_ru || item.iso3 || item.source_iso3 || "—";
  }
  function sourceName(item) { return item?.name_en || item?.source_code || "—"; }
  function regionName(code) {
    const item = (runtime.regions?.items || []).find((row) => row.region_code === code);
    if (!item) return code || "—";
    return runtime.lang === "ru" ? (item.name_ru || item.name_en || code) : (item.name_en || item.name_ru || code);
  }
  function scoreBand(score) {
    const value = numeric(score);
    if (value === null) return { key: "noData", tone: "none" };
    if (value >= 80) return { key: "highBand", tone: "very-high" };
    if (value >= 60) return { key: "upperMidBand", tone: "high" };
    if (value >= 40) return { key: "midBand", tone: "medium" };
    if (value >= 20) return { key: "lowBand", tone: "low" };
    return { key: "veryLowBand", tone: "very-low" };
  }
  function notify(message) {
    if (typeof runtime.context.onNotice === "function") runtime.context.onNotice(message);
  }
  function abortError(error) { return error?.name === "AbortError"; }

  async function fetchJson(path, { params = null, signal = null, cache = "no-store" } = {}) {
    const url = new URL(path, window.location.origin);
    if (params) Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
    });
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache, signal });
    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`;
      try { detail = (await response.json()).detail || detail; } catch (_) { /* no-op */ }
      throw new Error(detail);
    }
    return response.json();
  }

  function deepLink() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("cpi_view") || (VIEW_KEYS.includes(params.get("view")) ? params.get("view") : null);
    const year = Number(params.get("cpi_year") || params.get("year"));
    const country = params.get("cpi_country") || params.get("country");
    return {
      view: VIEW_KEYS.includes(view) ? view : null,
      country: country ? String(country).toUpperCase() : null,
      year: Number.isFinite(year) ? year : null,
      sourceCode: params.get("cpi_source") || "",
      rankingSource: params.get("cpi_ranking_source") || "",
      trendMetric: ["score", "rank"].includes(params.get("cpi_metric")) ? params.get("cpi_metric") : null,
      changeCategory: ["Improver", "Decliner"].includes(params.get("cpi_change")) ? params.get("cpi_change") : "",
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("cpi_country", runtime.country);
    if (runtime.year) url.searchParams.set("cpi_year", String(runtime.year));
    url.searchParams.set("cpi_view", runtime.view);
    if (runtime.sourceCode) url.searchParams.set("cpi_source", runtime.sourceCode); else url.searchParams.delete("cpi_source");
    if (runtime.rankingSource) url.searchParams.set("cpi_ranking_source", runtime.rankingSource); else url.searchParams.delete("cpi_ranking_source");
    if (runtime.trendMetric !== "score") url.searchParams.set("cpi_metric", runtime.trendMetric); else url.searchParams.delete("cpi_metric");
    if (runtime.changeCategory) url.searchParams.set("cpi_change", runtime.changeCategory); else url.searchParams.delete("cpi_change");
    url.hash = "index-CPI";
    history.replaceState(null, "", url);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({ country: runtime.country, year: runtime.year, view: runtime.view });
    }
  }

  function flagMarkup(item, className = "cpi-flag-slot") {
    const iso3 = String(item?.iso3 || item?.source_iso3 || "").toUpperCase();
    const iso2 = String(item?.host_iso2 || item?.iso2 || "").toLowerCase();
    if (iso2 && /^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className}"><img data-cpi-flag src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
    }
    return `<span class="${className} is-fallback"><span aria-hidden="true">${escapeHtml(iso3 || "•")}</span></span>`;
  }

  function yearItems() { return runtime.years?.items || []; }
  function rankingItems(payload = runtime.ranking) { return payload?.items || []; }
  function sourceCatalog() { return runtime.sources?.items || []; }
  function selectedSource() { return sourceCatalog().find((item) => item.source_code === runtime.sourceCode) || sourceCatalog()[0] || null; }
  function profileCountry() { return runtime.profile?.country || rankingItems().find((item) => item.iso3 === runtime.country) || {}; }
  function selectedRankingItem() { return rankingItems().find((item) => item.iso3 === runtime.country) || rankingItems()[0] || null; }
  function currentRelease() {
    const releaseId = runtime.ranking?.release_id || runtime.profile?.release_id;
    return runtime.releases?.items?.find((item) => item.release_id === releaseId) || runtime.profile?.release || runtime.metadata?.latest_release || {};
  }
  function globalRegion() { return (runtime.regions?.items || []).find((item) => item.region_code === "GLOBAL") || null; }
  function countryRegion() { return (runtime.regions?.items || []).find((item) => item.region_code === profileCountry().region_code) || runtime.profile?.region_result || null; }

  async function loadMetadata(signal) {
    if (metadataCache.has("bundle")) return metadataCache.get("bundle");
    const bundle = await Promise.all([
      fetchJson(`${API}/status`, { signal }),
      fetchJson(`${API}/metadata`, { signal, cache: "default" }),
      fetchJson(`${API}/releases`, { signal, cache: "default" }),
      fetchJson(`${API}/years`, { signal, cache: "default" }),
      fetchJson(`${API}/sources`, { signal, cache: "default" }),
    ]);
    metadataCache.set("bundle", bundle);
    return bundle;
  }

  async function loadGeo() {
    if (geoCache.value) return geoCache.value;
    if (geoCache.promise) return geoCache.promise;
    geoCache.promise = (async () => {
      for (const url of MAP_URLS) {
        try {
          const response = await fetch(url, { cache: "force-cache", headers: { Accept: "application/geo+json,application/json" } });
          if (!response.ok) continue;
          const value = await response.json();
          if (Array.isArray(value?.features) && value.features.length) {
            geoCache.value = value;
            return value;
          }
        } catch (_) { /* try next */ }
      }
      return null;
    })();
    return geoCache.promise;
  }

  async function loadCountryDetail(signal) {
    const item = selectedRankingItem();
    if (!item?.iso3) return [null, { items: [], total: 0 }, null, null];
    runtime.country = String(item.iso3).toUpperCase();
    const profile = await fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}`, {
      params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal,
    });
    if (!runtime.sourceCode) runtime.sourceCode = profile?.source_scores?.[0]?.source_code || sourceCatalog()[0]?.source_code || "";
    return Promise.all([
      Promise.resolve(profile),
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking.release_id }, signal }),
      runtime.sourceCode ? fetchJson(`${API}/source/${encodeURIComponent(runtime.sourceCode)}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking.release_id }, signal }).catch(() => null) : Promise.resolve(null),
      fetchJson(`${API}/audit`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }).catch(() => null),
    ]);
  }

  async function loadWorkspace() {
    const instance = runtime.instance;
    runtime.abortController?.abort();
    runtime.abortController = new AbortController();
    renderState("loading");
    try {
      const [status, metadata, releases, years, sources] = await loadMetadata(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      runtime.status = status; runtime.metadata = metadata; runtime.releases = releases; runtime.years = years; runtime.sources = sources;
      if (status.data_status !== "available" || !yearItems().length) {
        renderState("not_loaded");
        return;
      }
      const availableYears = yearItems().map((item) => Number(item.data_year)).filter(Number.isFinite);
      if (!availableYears.includes(Number(runtime.year))) runtime.year = Math.max(...availableYears);
      const [ranking, regions, changes, geo] = await Promise.all([
        fetchJson(`${API}/ranking`, { params: { year: runtime.year, limit: 1000, offset: 0 }, signal: runtime.abortController.signal }),
        fetchJson(`${API}/regions`, { params: { year: runtime.year }, signal: runtime.abortController.signal }),
        fetchJson(`${API}/significant-changes`, { signal: runtime.abortController.signal }),
        loadGeo(),
      ]);
      if (instance !== runtime.instance) return;
      runtime.ranking = ranking; runtime.sourceRanking = null; runtime.regions = regions; runtime.changes = changes; runtime.geo = geo;
      if (!rankingItems().some((item) => item.iso3 === runtime.country)) runtime.profile = null;
      const [profile, series, sourceSeries, audit] = await loadCountryDetail(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      runtime.profile = profile; runtime.series = series; runtime.sourceSeries = sourceSeries; runtime.audit = audit;
      renderAvailable();
      updateDeepLink();
    } catch (error) {
      if (abortError(error) || instance !== runtime.instance) return;
      renderState("error", error);
    }
  }

  async function reloadCountry({ focusSelector = "" } = {}) {
    runtime.detailController?.abort();
    runtime.detailController = new AbortController();
    try {
      const [profile, series, sourceSeries, audit] = await loadCountryDetail(runtime.detailController.signal);
      runtime.profile = profile; runtime.series = series; runtime.sourceSeries = sourceSeries; runtime.audit = audit;
      renderAvailable(); updateDeepLink();
      if (focusSelector) requestAnimationFrame(() => runtime.root?.querySelector(focusSelector)?.focus());
    } catch (error) {
      if (!abortError(error)) renderState("error", error);
    }
  }

  async function changeCountry(value) {
    const code = String(value || "").toUpperCase();
    if (!code || code === runtime.country) return;
    runtime.country = code;
    await reloadCountry();
  }

  async function changeYear(value) {
    const year = Number(value);
    if (!Number.isFinite(year) || year === runtime.year) return;
    runtime.year = year; runtime.rankingPage = 1;
    await loadWorkspace();
  }

  async function changeSource(value) {
    runtime.sourceCode = String(value || "");
    runtime.detailController?.abort(); runtime.detailController = new AbortController();
    try {
      runtime.sourceSeries = runtime.sourceCode ? await fetchJson(`${API}/source/${encodeURIComponent(runtime.sourceCode)}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking.release_id }, signal: runtime.detailController.signal }) : null;
      renderAvailable(); updateDeepLink({ notifyHost: false });
    } catch (error) { if (!abortError(error)) notify(String(error.message || error)); }
  }

  async function changeRankingSource(value) {
    runtime.rankingSource = String(value || ""); runtime.rankingPage = 1;
    if (!runtime.rankingSource) runtime.sourceRanking = null;
    else {
      runtime.detailController?.abort(); runtime.detailController = new AbortController();
      runtime.sourceRanking = await fetchJson(`${API}/ranking`, {
        params: { year: runtime.year, release_id: runtime.ranking.release_id, source_code: runtime.rankingSource, limit: 1000, offset: 0 },
        signal: runtime.detailController.signal,
      });
    }
    renderAvailable(); updateDeepLink({ notifyHost: false });
  }

  function stateShell(title, text, action = "") {
    return `<section class="cpi-workspace" aria-live="polite"><article class="cpi-state-card" role="status"><span class="cpi-state-code">${escapeHtml(tr("indexShort"))}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>${action}</article></section>`;
  }
  function renderState(kind, error = null) {
    if (!runtime.root) return;
    if (kind === "loading") runtime.root.innerHTML = stateShell(tr("loadingTitle"), tr("loadingText"), `<span class="cpi-loader" aria-hidden="true"></span>`);
    if (kind === "not_loaded") runtime.root.innerHTML = stateShell(tr("notLoadedTitle"), tr("notLoadedText"));
    if (kind === "error") runtime.root.innerHTML = stateShell(tr("errorTitle"), String(error?.message || error || "Error"), `<button class="cpi-button cpi-button-primary" type="button" data-cpi-retry>${escapeHtml(tr("retry"))}</button>`);
    runtime.root.querySelector("[data-cpi-retry]")?.addEventListener("click", () => loadWorkspace());
  }

  function externalLink(value, label) {
    const url = safeUrl(value);
    return url ? `<a class="cpi-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>` : "";
  }

  function hero() {
    const item = profileCountry(); const release = currentRelease(); const band = scoreBand(item.score);
    return `<header class="cpi-hero">
      <div class="cpi-hero-copy">
        <div class="cpi-title-row"><span class="cpi-index-code">CPI</span>${flagMarkup(item, "cpi-hero-flag")}</div>
        <p class="cpi-kicker">${escapeHtml(tr("heroKicker"))}</p>
        <h1>${escapeHtml(tr("indexName"))}</h1>
        <p>${escapeHtml(tr("heroLead"))}</p>
        <div class="cpi-hero-links">
          ${externalLink(runtime.metadata?.sources?.index_page, tr("officialSource"))}
          ${externalLink(runtime.metadata?.sources?.methodology, tr("methodologyLink"))}
        </div>
      </div>
      <div class="cpi-hero-score">
        <div class="cpi-hero-badges"><span>${escapeHtml(tr("official"))}</span><span>${escapeHtml(String(runtime.year || "—"))}</span></div>
        <div class="cpi-score-block" data-tone="${escapeHtml(band.tone)}"><span>${escapeHtml(tr("officialScore"))}</span><strong>${formatNumber(item.score, 0)}</strong><small>${escapeHtml(tr("scoreScale"))}</small></div>
        <div class="cpi-hero-score-meta"><div><span>${escapeHtml(tr("officialRank"))}</span><strong>${formatNumber(item.official_rank, 0)}</strong><small>${escapeHtml(`/ ${runtime.ranking?.total || "—"}`)}</small></div><div><span>${escapeHtml(tr("edition"))}</span><strong>${escapeHtml(String(release.release_year || runtime.year || "—"))}</strong><small>${escapeHtml(release.edition_name || release.report_title || "CPI")}</small></div></div>
      </div>
    </header>`;
  }

  function countryOptions(selected = runtime.country) {
    return rankingItems().map((item) => `<option value="${escapeHtml(item.iso3)}" ${item.iso3 === selected ? "selected" : ""}>${escapeHtml(countryName(item))} · ${escapeHtml(item.iso3 || "")}</option>`).join("");
  }
  function yearOptions() {
    return yearItems().map((item) => `<option value="${escapeHtml(item.data_year)}" ${Number(item.data_year) === Number(runtime.year) ? "selected" : ""}>${escapeHtml(item.data_year)}</option>`).join("");
  }
  function controlBar() {
    return `<div class="cpi-controls"><div class="cpi-control-primary"><label><span>${escapeHtml(tr("country"))}</span><select data-cpi-country>${countryOptions()}</select></label><label><span>${escapeHtml(tr("dataYear"))}</span><select data-cpi-year>${yearOptions()}</select></label></div><div class="cpi-control-actions"><button class="cpi-button cpi-button-secondary" type="button" data-cpi-action="share">${escapeHtml(tr("share"))}</button><button class="cpi-button cpi-button-secondary" type="button" data-cpi-action="provenance">${escapeHtml(tr("provenance"))}</button></div></div>`;
  }
  function tabs() {
    return `<div class="cpi-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}">${VIEW_KEYS.map((view) => `<button type="button" role="tab" id="cpi-tab-${runtime.instance}-${view}" aria-selected="${runtime.view === view}" aria-controls="cpi-panel-${runtime.instance}-${view}" tabindex="${runtime.view === view ? "0" : "-1"}" data-cpi-view="${view}">${escapeHtml(tr(view))}</button>`).join("")}</div>`;
  }
  function sectionHeading(kicker, title, text, extra = "") {
    return `<header class="cpi-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`;
  }

  function featureIso(feature) {
    const p = feature?.properties || {};
    return String(p.ISO_A3 || p.ADM0_A3 || p.iso_a3 || p.ISO3 || p.iso3 || p.id || "").toUpperCase();
  }
  function projectPoint(point, width, height) {
    const longitude = Number(point?.[0]); const latitude = Number(point?.[1]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
    return [((longitude + 180) / 360) * width, ((90 - latitude) / 180) * height];
  }
  function ringPath(ring, width, height) {
    const points = (ring || []).map((point) => projectPoint(point, width, height)).filter(Boolean);
    return points.length ? `${points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(" ")} Z` : "";
  }
  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return (geometry.coordinates || []).map((ring) => ringPath(ring, width, height)).join(" ");
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map((ring) => ringPath(ring, width, height))).join(" ");
    return "";
  }
  function mapBin(score) {
    const value = numeric(score);
    if (value === null) return 0;
    if (value < 20) return 1;
    if (value < 30) return 2;
    if (value < 40) return 3;
    if (value < 50) return 4;
    if (value < 60) return 5;
    if (value < 70) return 6;
    if (value < 80) return 7;
    return 8;
  }
  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="cpi-map-fallback">${escapeHtml(tr("mapUnavailable"))}</div>`;
    const byIso = new Map(rankingItems().map((item) => [String(item.iso3 || item.source_iso3).toUpperCase(), item]));
    const width = 920; const height = 470;
    const paths = runtime.geo.features.map((feature) => {
      const iso = featureIso(feature); const item = byIso.get(iso); const d = geometryPath(feature.geometry, width, height); if (!d) return "";
      return `<path class="cpi-map-country cpi-map-bin-${mapBin(item?.score)} ${iso === runtime.country ? "is-selected" : ""}" d="${d}" data-cpi-map-iso="${escapeHtml(iso)}" data-has-value="${Boolean(item)}"><title>${escapeHtml(item ? `${countryName(item)}: ${formatNumber(item.score, 0)}` : iso)}</title></path>`;
    }).join("");
    return `<div class="cpi-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("worldMap"))}">${paths}</svg></div><div class="cpi-map-legend">${["0–19","20–29","30–39","40–49","50–59","60–69","70–79","80–100"].map((label, index) => `<span><i class="cpi-map-bin-${index + 1}"></i>${escapeHtml(label)}</span>`).join("")}</div>`;
  }

  function metricCard(label, value, detail, derived = false) {
    return `<article class="cpi-metric"><span>${escapeHtml(derived ? tr("derived") : tr("official"))}</span><h3>${escapeHtml(label)}</h3><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail || "")}</small></article>`;
  }
  function firstSeries() { return runtime.series?.items?.[0] || null; }
  function lastSeries() { const items = runtime.series?.items || []; return items[items.length - 1] || null; }
  function currentChange() { return runtime.profile?.significant_change || null; }

  function confidenceCard() {
    const item = profileCountry(); const lower = numeric(item.lower_ci); const upper = numeric(item.upper_ci); const score = numeric(item.score);
    const min = Math.max(0, Math.floor((lower ?? score ?? 0) / 10) * 10 - 10); const max = Math.min(100, Math.ceil((upper ?? score ?? 100) / 10) * 10 + 10); const span = Math.max(1, max - min);
    const left = lower === null ? 0 : ((lower - min) / span) * 100; const width = lower === null || upper === null ? 0 : ((upper - lower) / span) * 100; const point = score === null ? 0 : ((score - min) / span) * 100;
    return `<article class="cpi-ci-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("confidenceInterval"))}</p><h3>${formatNumber(lower, 1)}–${formatNumber(upper, 1)}</h3></div><span>${escapeHtml(`${tr("standardError")}: ${formatNumber(item.standard_error, 2)}`)}</span></div><div class="cpi-ci-track" aria-hidden="true"><i class="cpi-ci-range" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%"></i><b class="cpi-ci-point" style="left:${point.toFixed(2)}%"></b></div><div class="cpi-ci-axis"><span>${formatNumber(min, 0)}</span><span>${escapeHtml(`${tr("officialScore")}: ${formatNumber(score, 0)}`)}</span><span>${formatNumber(max, 0)}</span></div></article>`;
  }

  function neighborTable() {
    const items = rankingItems(); const index = items.findIndex((item) => item.iso3 === runtime.country); const neighbors = items.slice(Math.max(0, index - 2), Math.min(items.length, index + 3));
    return `<article class="cpi-card cpi-neighbors-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("neighbors"))}</p><h3>${escapeHtml(tr("officialRanking"))}</h3></div></div><div class="cpi-table-scroll"><table class="cpi-table"><thead><tr><th>${escapeHtml(tr("position"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(tr("score"))}</th></tr></thead><tbody>${neighbors.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${formatNumber(item.official_rank, 0)}</td><td><button class="cpi-country-link" type="button" data-cpi-country-pick="${escapeHtml(item.iso3)}">${flagMarkup(item, "cpi-flag-inline")}${escapeHtml(countryName(item))}</button></td><td>${formatNumber(item.score, 0)}</td></tr>`).join("")}</tbody></table></div></article>`;
  }

  function overviewPanel() {
    const item = profileCountry(); const first = firstSeries(); const global = globalRegion(); const region = countryRegion(); const change = currentChange();
    const delta = numeric(item.score) !== null && numeric(first?.score) !== null ? numeric(item.score) - numeric(first.score) : null;
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-overview" aria-labelledby="cpi-tab-${runtime.instance}-overview" data-cpi-panel="overview" tabindex="0">
      ${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}
      <div class="cpi-metric-grid">
        ${metricCard(tr("globalAverage"), formatNumber(global?.average_score, 0), `${runtime.year} · ${tr("official")}`)}
        ${metricCard(tr("regionalAverage"), formatNumber(region?.average_score ?? runtime.profile?.region_result?.average_score, 0), regionName(item.region_code))}
        ${metricCard(tr("changeSince2012"), formatSigned(delta, 0), `${first?.data_year || "—"} → ${runtime.year}`)}
        ${metricCard(tr("sourceCount"), formatNumber(item.number_of_sources, 0), `${tr("minimum")}: ${MINIMUM_SOURCES}`)}
      </div>
      <div class="cpi-overview-grid">
        <article class="cpi-card cpi-map-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("worldMap"))}</p><h3>${escapeHtml(tr("mapText"))}</h3></div></div>${mapMarkup()}</article>
        <div class="cpi-profile-card">${confidenceCard()}<article class="cpi-card cpi-provenance-note"><div class="cpi-card-title"><div><p>${escapeHtml(tr("significantStatus"))}</p><h3>${escapeHtml(change ? (change.category === "Improver" ? tr("improved") : tr("declined")) : tr("noSignificantChange"))}</h3></div>${change ? `<span class="cpi-change-chip">${formatSigned(change.direction_of_change, 0)}</span>` : ""}</div>${change ? `<p>${escapeHtml(`${change.reference_year}: ${formatNumber(change.reference_score, 0)} → ${change.current_year}: ${formatNumber(change.current_score, 0)}`)}</p>` : ""}</article></div>
      </div>
      ${neighborTable()}
    </section>`;
  }

  function sourceOptions(selected = runtime.sourceCode, includeAll = false) {
    const all = includeAll ? `<option value="">${escapeHtml(tr("officialRanking"))}</option>` : "";
    return all + sourceCatalog().filter((item) => item.active_current || item.source_code === selected).map((item) => `<option value="${escapeHtml(item.source_code)}" ${item.source_code === selected ? "selected" : ""}>${escapeHtml(sourceName(item))}</option>`).join("");
  }
  function sourceScoreFor(code) { return runtime.profile?.source_scores?.find((item) => item.source_code === code) || null; }
  function sourceCards() {
    return `<div class="cpi-source-grid">${sourceCatalog().map((source) => {
      const value = sourceScoreFor(source.source_code);
      return `<article class="cpi-source-card ${source.source_code === runtime.sourceCode ? "is-selected" : ""}"><header><div><span class="cpi-source-chip">${escapeHtml(source.active_current ? tr("activeSource") : tr("historicalSource"))}</span><h3>${escapeHtml(sourceName(source))}</h3></div><strong class="cpi-source-score">${formatNumber(value?.standardized_score, 1)}</strong></header><p>${escapeHtml(source.institution || "")}</p><button type="button" data-cpi-source-pick="${escapeHtml(source.source_code)}">${escapeHtml(tr("selectedSource"))}</button></article>`;
    }).join("")}</div>`;
  }
  function sourceDetail() {
    const source = selectedSource(); const value = sourceScoreFor(source?.source_code); const count = runtime.sourceSeries?.items?.length || 0;
    if (!source) return "";
    return `<aside class="cpi-source-detail"><p class="cpi-kicker">${escapeHtml(tr("selectedSource"))}</p><h3>${escapeHtml(sourceName(source))}</h3><p>${escapeHtml(source.institution || "")}</p><dl><div><dt>${escapeHtml(tr("standardizedScore"))}</dt><dd>${formatNumber(value?.standardized_score, 1)}</dd></div><div><dt>${escapeHtml(tr("observations"))}</dt><dd>${formatNumber(count, 0)}</dd></div><div><dt>${escapeHtml(tr("activeSource"))}</dt><dd>${escapeHtml(source.active_current ? tr("activeSource") : tr("historicalSource"))}</dd></div><div><dt>${escapeHtml(tr("direction"))}</dt><dd>${escapeHtml(source.reversed_before_standardization ? tr("reversed") : tr("notReversed"))}</dd></div><div><dt>${escapeHtml(tr("sourceSheet"))}</dt><dd>${escapeHtml(value?.source_sheet || "—")}</dd></div><div><dt>${escapeHtml(tr("sourceRow"))}</dt><dd>${escapeHtml(value?.source_row ?? "—")}</dd></div></dl>${sourceMiniChart()}</aside>`;
  }
  function sourceMiniChart() {
    const items = runtime.sourceSeries?.items || [];
    if (!items.length) return `<div class="cpi-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    return `<div class="cpi-chart-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("sourceSeries"))}</p><h3>${escapeHtml(`${items[0].data_year}–${items[items.length - 1].data_year}`)}</h3></div></div>${lineChart(items.map((item) => ({ year: item.data_year, value: item.standardized_score })), { minValue: 0, maxValue: 100, reverse: false, compact: true })}</div>`;
  }
  function sourcesPanel() {
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-sources" aria-labelledby="cpi-tab-${runtime.instance}-sources" data-cpi-panel="sources" tabindex="0">
      ${sectionHeading(tr("sourcesKicker"), tr("sourcesHeading"), tr("sourcesText"))}
      <div class="cpi-source-toolbar"><label class="cpi-inline-field"><span>${escapeHtml(tr("selectedSource"))}</span><select data-cpi-source>${sourceOptions()}</select></label><div class="cpi-notice cpi-source-order-warning">${escapeHtml(tr("sourceOrderingWarning"))}</div></div>
      <div class="cpi-source-layout"><div class="cpi-source-list">${sourceCards()}</div>${sourceDetail()}</div>
    </section>`;
  }

  function linePath(points, width, height, minYear, maxYear, minValue, maxValue) {
    const spanYear = Math.max(1, maxYear - minYear); const spanValue = Math.max(1e-9, maxValue - minValue);
    return points.map((point, index) => {
      const x = 38 + ((point.year - minYear) / spanYear) * (width - 58);
      const y = 18 + ((maxValue - point.value) / spanValue) * (height - 48);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }
  function lineChart(points, { minValue = null, maxValue = null, reverse = false, compact = false } = {}) {
    const clean = points.filter((point) => numeric(point.year) !== null && numeric(point.value) !== null).map((point) => ({ ...point, year: Number(point.year), value: Number(point.value) }));
    if (!clean.length) return `<div class="cpi-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    const width = compact ? 520 : 920; const height = compact ? 220 : 360; const years = clean.map((point) => point.year); const values = clean.map((point) => point.value);
    const minYear = Math.min(...years); const maxYear = Math.max(...years); const naturalMin = Math.min(...values); const naturalMax = Math.max(...values);
    let lo = minValue === null ? naturalMin - Math.max(2, (naturalMax - naturalMin) * .18) : minValue; let hi = maxValue === null ? naturalMax + Math.max(2, (naturalMax - naturalMin) * .18) : maxValue;
    if (reverse) [lo, hi] = [naturalMin - 2, naturalMax + 2];
    const path = linePath(clean, width, height, minYear, maxYear, lo, hi);
    const dots = clean.map((point) => {
      const x = 38 + ((point.year - minYear) / Math.max(1, maxYear - minYear)) * (width - 58); const y = 18 + ((hi - point.value) / Math.max(1e-9, hi - lo)) * (height - 48);
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4"><title>${escapeHtml(`${point.year}: ${formatNumber(point.value, 1)}`)}</title></circle>`;
    }).join("");
    return `<div class="cpi-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("trendHeading"))}"><g class="cpi-chart-grid">${[0,.25,.5,.75,1].map((ratio) => `<line x1="38" y1="${(18 + ratio * (height - 48)).toFixed(2)}" x2="${width - 20}" y2="${(18 + ratio * (height - 48)).toFixed(2)}"></line>`).join("")}</g><path class="cpi-chart-line" d="${path}"></path><g class="cpi-chart-dots">${dots}</g></svg></div>`;
  }
  function trendSummary() {
    const items = runtime.series?.items || []; const values = items.map((item) => numeric(runtime.trendMetric === "rank" ? item.official_rank : item.score)).filter((value) => value !== null); const first = items[0]; const last = items[items.length - 1];
    const firstValue = runtime.trendMetric === "rank" ? first?.official_rank : first?.score; const lastValue = runtime.trendMetric === "rank" ? last?.official_rank : last?.score; const delta = numeric(firstValue) !== null && numeric(lastValue) !== null ? numeric(lastValue) - numeric(firstValue) : null;
    return `<div class="cpi-metric-grid">${metricCard(tr("firstYear"), formatNumber(firstValue, runtime.trendMetric === "score" ? 0 : 0), String(first?.data_year || "—"))}${metricCard(tr("lastYear"), formatNumber(lastValue, 0), String(last?.data_year || "—"))}${metricCard(tr("periodDelta"), formatSigned(delta, 0), `${first?.data_year || "—"} → ${last?.data_year || "—"}`)}${metricCard(tr("minimum"), formatNumber(values.length ? Math.min(...values) : null, 0), tr(runtime.trendMetric === "rank" ? "rankMetric" : "scoreMetric"))}</div>`;
  }
  function trendTable() {
    const items = runtime.series?.items || [];
    return `<details class="cpi-table-details"><summary>${escapeHtml(tr("trendTable"))}</summary><div class="cpi-table-scroll"><table class="cpi-table"><thead><tr><th>${escapeHtml(tr("dataYear"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("lowerCi"))}</th><th>${escapeHtml(tr("upperCi"))}</th><th>${escapeHtml(tr("sourceCountShort"))}</th></tr></thead><tbody>${items.map((item) => `<tr><td>${item.data_year}</td><td>${formatNumber(item.score, 0)}</td><td>${formatNumber(item.official_rank, 0)}</td><td>${formatNumber(item.lower_ci, 1)}</td><td>${formatNumber(item.upper_ci, 1)}</td><td>${formatNumber(item.number_of_sources, 0)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }
  function trendPanel() {
    const items = runtime.series?.items || []; const points = items.map((item) => ({ year: item.data_year, value: runtime.trendMetric === "rank" ? item.official_rank : item.score }));
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-trend" aria-labelledby="cpi-tab-${runtime.instance}-trend" data-cpi-panel="trend" tabindex="0">
      ${sectionHeading(tr("trendKicker"), tr("trendHeading"), tr("trendText"), `<label class="cpi-inline-field"><span>${escapeHtml(tr("metric"))}</span><select data-cpi-trend-metric><option value="score" ${runtime.trendMetric === "score" ? "selected" : ""}>${escapeHtml(tr("scoreMetric"))}</option><option value="rank" ${runtime.trendMetric === "rank" ? "selected" : ""}>${escapeHtml(tr("rankMetric"))}</option></select></label>`)}
      ${trendSummary()}
      ${runtime.trendMetric === "rank" ? `<div class="cpi-notice cpi-method-warning">${escapeHtml(tr("rankWarning"))}</div>` : ""}
      <article class="cpi-card cpi-chart-card">${lineChart(points, { minValue: runtime.trendMetric === "score" ? 0 : null, maxValue: runtime.trendMetric === "score" ? 100 : null, reverse: runtime.trendMetric === "rank" })}</article>
      ${trendTable()}
    </section>`;
  }

  function activeRankingPayload() { return runtime.rankingSource ? (runtime.sourceRanking || runtime.ranking) : runtime.ranking; }
  function regionOptions() {
    return `<option value="">${escapeHtml(tr("allRegions"))}</option>` + (runtime.regions?.items || []).filter((item) => item.region_code !== "GLOBAL").map((item) => `<option value="${escapeHtml(item.region_code)}" ${item.region_code === runtime.rankingRegion ? "selected" : ""}>${escapeHtml(runtime.lang === "ru" ? item.name_ru : item.name_en)}</option>`).join("");
  }
  function incomeOptions() {
    const values = [...new Set(rankingItems(activeRankingPayload()).map((item) => item.host_income_group).filter(Boolean))].sort();
    return `<option value="">${escapeHtml(tr("allIncomeGroups"))}</option>` + values.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingIncome ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
  }
  function filteredRanking() {
    const query = runtime.rankingQuery.trim().toLocaleLowerCase(locale());
    let items = rankingItems(activeRankingPayload()).filter((item) => {
      if (runtime.rankingRegion && item.region_code !== runtime.rankingRegion) return false;
      if (runtime.rankingIncome && item.host_income_group !== runtime.rankingIncome) return false;
      if (query && !`${countryName(item)} ${item.iso3 || ""} ${item.source_iso3 || ""}`.toLocaleLowerCase(locale()).includes(query)) return false;
      return true;
    });
    items = items.map((item, index) => ({ ...item, derived_position: index + 1 }));
    return items;
  }
  function rankingFilters() {
    return `<div class="cpi-ranking-filters"><label><span>${escapeHtml(tr("search"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}" data-cpi-ranking-query></label><label><span>${escapeHtml(tr("region"))}</span><select data-cpi-ranking-region>${regionOptions()}</select></label><label><span>${escapeHtml(tr("incomeGroup"))}</span><select data-cpi-ranking-income>${incomeOptions()}</select></label><label><span>${escapeHtml(tr("rankingMetric"))}</span><select data-cpi-ranking-source>${sourceOptions(runtime.rankingSource, true)}</select></label><label><span>${escapeHtml(tr("pageSize"))}</span><select data-cpi-ranking-size>${[10,25,50,100].map((size) => `<option value="${size}" ${size === runtime.rankingPageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" class="cpi-button cpi-button-secondary" data-cpi-action="export">${escapeHtml(tr("exportCsv"))}</button></div>`;
  }
  function rankingTable() {
    const items = filteredRanking(); const pages = Math.max(1, Math.ceil(items.length / runtime.rankingPageSize)); runtime.rankingPage = Math.min(runtime.rankingPage, pages); const start = (runtime.rankingPage - 1) * runtime.rankingPageSize; const visible = items.slice(start, start + runtime.rankingPageSize); const sourceMode = Boolean(runtime.rankingSource);
    return `<article class="cpi-card cpi-ranking-card"><div class="cpi-ranking-summary"><span>${escapeHtml(`${tr("shown")}: ${visible.length} / ${items.length}`)}</span><span class="cpi-rank-chip">${escapeHtml(sourceMode ? tr("derived") : tr("official"))}</span></div>${sourceMode ? `<div class="cpi-notice cpi-source-order-warning">${escapeHtml(tr("sourceOrderingWarning"))}</div>` : ""}<div class="cpi-table-scroll"><table class="cpi-table cpi-ranking-table"><thead><tr><th>${escapeHtml(sourceMode ? tr("position") : tr("officialRank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(tr("score"))}</th>${sourceMode ? `<th>${escapeHtml(tr("sourceScore"))}</th>` : ""}<th>${escapeHtml(tr("sourceCountShort"))}</th><th>${escapeHtml(tr("uncertainty"))}</th></tr></thead><tbody>${visible.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${formatNumber(sourceMode ? item.derived_position : item.official_rank, 0)}</td><td><button type="button" class="cpi-country-link" data-cpi-country-pick="${escapeHtml(item.iso3)}">${flagMarkup(item, "cpi-flag-inline")}${escapeHtml(countryName(item))}<small>${escapeHtml(item.iso3 || "")}</small></button></td><td>${formatNumber(item.score, 0)}</td>${sourceMode ? `<td>${formatNumber(item.metric_score, 1)}</td>` : ""}<td>${formatNumber(item.number_of_sources, 0)}</td><td>${formatNumber(item.lower_ci, 1)}–${formatNumber(item.upper_ci, 1)}</td></tr>`).join("")}</tbody></table></div><div class="cpi-pagination"><button type="button" class="cpi-button cpi-button-secondary" data-cpi-page="${Math.max(1, runtime.rankingPage - 1)}" ${runtime.rankingPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(`${tr("page")} ${runtime.rankingPage} / ${pages}`)}</span><button type="button" class="cpi-button cpi-button-secondary" data-cpi-page="${Math.min(pages, runtime.rankingPage + 1)}" ${runtime.rankingPage >= pages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div></article>`;
  }
  function rankingPanel() {
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-ranking" aria-labelledby="cpi-tab-${runtime.instance}-ranking" data-cpi-panel="ranking" tabindex="0">${sectionHeading(tr("rankingKicker"), tr("rankingHeading"), tr("rankingText"))}${rankingFilters()}${rankingTable()}</section>`;
  }

  function filteredChanges() {
    const items = runtime.changes?.items || [];
    return runtime.changeCategory ? items.filter((item) => item.category === runtime.changeCategory) : items;
  }
  function changeCards() {
    return `<div class="cpi-change-grid">${filteredChanges().map((item) => `<article class="cpi-change-card" data-category="${escapeHtml(item.category)}"><header><div><span class="cpi-change-chip">${escapeHtml(item.category === "Improver" ? tr("improved") : tr("declined"))}</span><h3>${escapeHtml(countryName(item))}</h3></div><strong class="cpi-change-value">${formatSigned(item.direction_of_change, 0)}</strong></header><p>${escapeHtml(`${item.reference_year}: ${formatNumber(item.reference_score, 0)} → ${item.current_year}: ${formatNumber(item.current_score, 0)}`)}</p><div class="cpi-change-meta"><span>${escapeHtml(regionName(item.region_code))}</span><button type="button" class="cpi-text-button" data-cpi-country-pick="${escapeHtml(item.iso3)}">${escapeHtml(tr("openProfile"))}</button></div></article>`).join("")}</div>`;
  }
  function changesPanel() {
    const all = runtime.changes?.items || []; const improvers = all.filter((item) => item.category === "Improver").length; const decliners = all.filter((item) => item.category === "Decliner").length;
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-changes" aria-labelledby="cpi-tab-${runtime.instance}-changes" data-cpi-panel="changes" tabindex="0">${sectionHeading(tr("changesKicker"), tr("changesHeading"), tr("changesText"))}<div class="cpi-change-summary"><div><span>${escapeHtml(tr("totalChanges"))}</span><strong>${formatNumber(all.length, 0)}</strong></div><div><span>${escapeHtml(tr("improvers"))}</span><strong>${formatNumber(improvers, 0)}</strong></div><div><span>${escapeHtml(tr("decliners"))}</span><strong>${formatNumber(decliners, 0)}</strong></div></div><div class="cpi-change-filters"><label class="cpi-inline-field"><span>${escapeHtml(tr("significantStatus"))}</span><select data-cpi-change-category><option value="" ${!runtime.changeCategory ? "selected" : ""}>${escapeHtml(tr("all"))}</option><option value="Improver" ${runtime.changeCategory === "Improver" ? "selected" : ""}>${escapeHtml(tr("improvers"))}</option><option value="Decliner" ${runtime.changeCategory === "Decliner" ? "selected" : ""}>${escapeHtml(tr("decliners"))}</option></select></label></div>${changeCards()}</section>`;
  }

  function auditModel() { return runtime.audit?.audit || runtime.audit || {}; }
  function methodCard(title, text) { return `<article class="cpi-method-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`; }
  function methodologyPanel() {
    const release = currentRelease(); const audit = auditModel(); const sources = runtime.metadata?.sources || {}; const ok = audit?.ok === true || audit?.publication_gate?.ok === true; const country = profileCountry(); const p = country.provenance || {};
    const links = [externalLink(sources.index_page, tr("officialSource")), externalLink(sources.methodology, tr("methodologyLink")), externalLink(sources.source_description, tr("sourceDescription")), externalLink(sources.copyright, tr("copyright"))].join("");
    return `<section class="cpi-panel" role="tabpanel" id="cpi-panel-${runtime.instance}-methodology" aria-labelledby="cpi-tab-${runtime.instance}-methodology" data-cpi-panel="methodology" tabindex="0">${sectionHeading(tr("methodologyKicker"), tr("methodologyHeading"), tr("methodologyText"))}<div class="cpi-method-grid">${methodCard(tr("principleSubject"), tr("principleSubjectText"))}${methodCard(tr("principleSources"), tr("principleSourcesText"))}${methodCard(tr("principleScale"), tr("principleScaleText"))}${methodCard(tr("principleTime"), tr("principleTimeText"))}</div><div class="cpi-method-layout"><article class="cpi-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("framework"))}</p><h3>${escapeHtml("182 · 13 · 2012–2025")}</h3></div></div><ul><li><b>${escapeHtml(tr("officialScore"))}</b><small>${escapeHtml(SCORE_SEMANTICS)}</small></li><li><b>${escapeHtml(tr("officialRank"))}</b><small>${escapeHtml(OFFICIAL_ORDER)}</small></li><li><b>${escapeHtml(tr("confidenceInterval"))}</b><small>${escapeHtml(`${CONFIDENCE_LEVEL * 100}%`)}</small></li><li><b>${escapeHtml(tr("sourceOrderingWarning"))}</b><small>${escapeHtml(DERIVED_SOURCE_ORDER)}</small></li></ul></article><article class="cpi-card cpi-audit-card"><div class="cpi-card-title"><div><p>${escapeHtml(tr("sourcesAudit"))}</p><h3>${escapeHtml(ok ? tr("auditPassed") : tr("auditReview"))}</h3></div><span class="${ok ? "is-passed" : "is-review"}">${escapeHtml(ok ? "OK" : "REVIEW")}</span></div><dl class="cpi-release-facts"><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd><code>${escapeHtml(release.release_id || runtime.ranking?.release_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("rawBytes"))}</dt><dd>${formatNumber(release.raw_bytes, 0)}</dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(release.transform_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("importerVersion"))}</dt><dd><code>${escapeHtml(release.importer_version || "—")}</code></dd></div><div><dt>${escapeHtml(tr("sourceSheet"))}</dt><dd>${escapeHtml(p.source_sheet || p.source_workbook || "—")}</dd></div><div><dt>${escapeHtml(tr("sourceRow"))}</dt><dd>${escapeHtml(p.source_row ?? "—")}</dd></div></dl><div class="cpi-source-links">${links}</div></article></div></section>`;
  }

  function activePanel() {
    if (runtime.view === "overview") return overviewPanel();
    if (runtime.view === "sources") return sourcesPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "changes") return changesPanel();
    return methodologyPanel();
  }
  function inactivePanels() {
    return VIEW_KEYS.filter((view) => view !== runtime.view).map((view) => `<div role="tabpanel" id="cpi-panel-${runtime.instance}-${view}" aria-labelledby="cpi-tab-${runtime.instance}-${view}" data-cpi-panel="${view}" hidden></div>`).join("");
  }
  function renderAvailable() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `<section class="cpi-workspace" data-cpi-state="available" aria-live="polite">${hero()}${controlBar()}${tabs()}<div class="cpi-view-stage">${activePanel()}${inactivePanels()}</div></section>`;
    bindEvents();
  }

  function provenanceHtml() {
    const country = profileCountry(); const p = country.provenance || {}; const release = currentRelease();
    const rows = [["ISO3",country.iso3],[tr("dataYear"),runtime.year],[tr("sourceSheet"),p.source_sheet || p.source_workbook],[tr("sourceRow"),p.source_row],[tr("releaseId"),runtime.ranking?.release_id],[tr("rawSnapshot"),release.raw_snapshot_sha256],[tr("transformId"),release.transform_id],[tr("officialRank"),country.official_rank],[tr("confidenceInterval"),`${country.lower_ci ?? "—"}–${country.upper_ci ?? "—"}`]];
    return `<dialog class="cpi-dialog" data-cpi-dialog><div class="cpi-dialog-head"><div><p>${escapeHtml(tr("provenance"))}</p><h2>${escapeHtml(countryName(country))} · ${escapeHtml(String(runtime.year))}</h2></div><button type="button" data-cpi-dialog-close aria-label="Close">×</button></div><dl>${rows.map(([key,value]) => `<div><dt>${escapeHtml(key)}</dt><dd><code>${escapeHtml(value ?? "—")}</code></dd></div>`).join("")}</dl></dialog>`;
  }
  function openProvenance() {
    runtime.root?.querySelector("[data-cpi-dialog]")?.remove();
    runtime.root?.insertAdjacentHTML("beforeend", provenanceHtml());
    const dialog = runtime.root?.querySelector("[data-cpi-dialog]"); if (!dialog) return;
    dialog.querySelector("[data-cpi-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("close", () => dialog.remove(), { once: true }); dialog.showModal();
  }
  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try { await navigator.clipboard.writeText(window.location.href); notify(tr("copied")); }
    catch (_) { notify(window.location.href); }
  }
  function csvCell(value) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function exportRanking() {
    const sourceMode = Boolean(runtime.rankingSource); const rows = filteredRanking();
    const csv = [[sourceMode ? "derived_position" : "official_rank","official_rank","iso3","country","year","cpi_score",sourceMode ? "source_code" : "ordering","source_score","number_of_sources","lower_ci","upper_ci","ordering_semantics"], ...rows.map((item) => [sourceMode ? item.derived_position : item.official_rank,item.official_rank,item.iso3,countryName(item),runtime.year,item.score,sourceMode ? runtime.rankingSource : "official_rank",sourceMode ? item.metric_score : "",item.number_of_sources,item.lower_ci,item.upper_ci,sourceMode ? DERIVED_SOURCE_ORDER : OFFICIAL_ORDER])].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `cpi-${runtime.year}-${runtime.rankingSource || "official"}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function setView(view, { focusTab = false, focusPanel = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    runtime.view = view; renderAvailable(); updateDeepLink({ notifyHost: false });
    requestAnimationFrame(() => {
      if (focusTab) runtime.root?.querySelector(`[data-cpi-view="${view}"]`)?.focus();
      if (focusPanel) runtime.root?.querySelector(`[data-cpi-panel="${view}"]`)?.focus();
    });
  }
  function rerenderStage({ focusSelector = "", cursor = null } = {}) {
    renderAvailable();
    if (focusSelector) requestAnimationFrame(() => { const element = runtime.root?.querySelector(focusSelector); element?.focus(); if (cursor !== null && typeof element?.setSelectionRange === "function") element.setSelectionRange(cursor, cursor); });
  }
  function handleTabKeydown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const index = VIEW_KEYS.indexOf(event.currentTarget.dataset.cpiView); let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % VIEW_KEYS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + VIEW_KEYS.length) % VIEW_KEYS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = VIEW_KEYS.length - 1;
    setView(VIEW_KEYS[next], { focusTab: true });
  }

  function bindEvents() {
    const root = runtime.root; if (!root) return;
    root.querySelectorAll("[data-cpi-country]").forEach((select) => { select.onchange = (event) => changeCountry(event.target.value); });
    root.querySelectorAll("[data-cpi-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-cpi-view]").forEach((button) => { button.onclick = () => setView(button.dataset.cpiView, { focusTab: true }); button.onkeydown = handleTabKeydown; });
    root.querySelectorAll('[data-cpi-action="share"]').forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll('[data-cpi-action="provenance"]').forEach((button) => { button.onclick = openProvenance; });
    root.querySelectorAll('[data-cpi-action="export"]').forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-cpi-country-pick]").forEach((button) => { button.onclick = async () => { await changeCountry(button.dataset.cpiCountryPick); if (runtime.view !== "overview") setView("overview", { focusPanel: true }); }; });
    root.querySelectorAll('[data-cpi-map-iso][data-has-value="true"]').forEach((path) => { path.style.cursor = "pointer"; path.onclick = () => changeCountry(path.dataset.cpiMapIso); });
    root.querySelectorAll("[data-cpi-source]").forEach((select) => { select.onchange = (event) => changeSource(event.target.value); });
    root.querySelectorAll("[data-cpi-source-pick]").forEach((button) => { button.onclick = () => changeSource(button.dataset.cpiSourcePick); });
    root.querySelectorAll("[data-cpi-trend-metric]").forEach((select) => { select.onchange = (event) => { runtime.trendMetric = event.target.value; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-cpi-trend-metric]" }); }; });
    root.querySelectorAll("[data-cpi-ranking-source]").forEach((select) => { select.onchange = (event) => changeRankingSource(event.target.value); });
    root.querySelectorAll("[data-cpi-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-cpi-ranking-region]" }); }; });
    root.querySelectorAll("[data-cpi-ranking-income]").forEach((select) => { select.onchange = (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-cpi-ranking-income]" }); }; });
    root.querySelectorAll("[data-cpi-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-cpi-ranking-size]" }); }; });
    const search = root.querySelector("[data-cpi-ranking-query]"); if (search) search.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-cpi-ranking-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-cpi-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage = Number(button.dataset.cpiPage); rerenderStage(); runtime.root?.querySelector(".cpi-ranking-table")?.scrollIntoView({ block: "start" }); }; });
    root.querySelectorAll("[data-cpi-change-category]").forEach((select) => { select.onchange = (event) => { runtime.changeCategory = event.target.value; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-cpi-change-category]" }); }; });
  }

  function render(context = {}) {
    if (!context.root) throw new Error("GIRCorruptionPerceptions.render requires root");
    runtime.abortController?.abort(); runtime.detailController?.abort();
    runtime.root = context.root; runtime.context = context; runtime.lang = context.lang === "en" ? "en" : "ru"; runtime.theme = context.theme || document.documentElement.dataset.theme || "dark"; runtime.instance += 1;
    const link = deepLink(); runtime.view = link.view || "overview"; runtime.country = link.country || String(context.country || "").toUpperCase(); if (!runtime.country) return; runtime.year = link.year || (Number(context.year) || null); runtime.sourceCode = link.sourceCode || runtime.sourceCode; runtime.rankingSource = link.rankingSource || ""; runtime.trendMetric = link.trendMetric || "score"; runtime.changeCategory = link.changeCategory || ""; runtime.sourceRanking = null;
    return loadWorkspace();
  }
  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort(); runtime.detailController?.abort();
    if (hard) { metadataCache.clear(); geoCache.value = null; geoCache.promise = null; }
    runtime.status = runtime.metadata = runtime.releases = runtime.years = runtime.sources = runtime.regions = runtime.ranking = runtime.sourceRanking = runtime.profile = runtime.series = runtime.sourceSeries = runtime.changes = runtime.audit = null;
  }

  window.GIRCorruptionPerceptions = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    semantics: Object.freeze({ score: SCORE_SEMANTICS, officialOrder: OFFICIAL_ORDER, sourceOrder: DERIVED_SOURCE_ORDER, officialRankPreserved: OFFICIAL_RANK_PRESERVED, minimumSources: MINIMUM_SOURCES, confidenceLevel: CONFIDENCE_LEVEL }),
    _test: Object.freeze({ numeric, median, escapeHtml, scoreBand, featureIso, geometryPath, mapBin }),
  });
})();
