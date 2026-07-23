/* GIR Society Stage 06 — World Happiness Report analytical workspace */
(() => {
  "use strict";

  const MODULE_VERSION = "whr-frontend/6.0.0";
  const API = "/api/world-happiness";
  const VIEW_KEYS = ["overview", "factors", "trend", "ranking", "methodology"];
  const FACTOR_ORDERING_SEMANTICS = "derived_gir_factor_contribution_sort_not_official_country_rank";
  const MAP_URLS = ["/static/world_countries_lite.geojson", "/static/world_countries.geojson", "/world.geojson"];
  const FACTOR_COLORS = {
    log_gdp_per_capita: "#6c63ff",
    social_support: "#0bb3ad",
    healthy_life_expectancy: "#3487eb",
    freedom_to_make_life_choices: "#ff9945",
    generosity: "#ec5a64",
    perceptions_of_corruption: "#9b59d0",
    dystopia_plus_residual: "#778497",
  };

  const TEXT = {
    ru: {
      group: "Общество и человеческое развитие",
      reportName: "Всемирный доклад о счастье",
      indexName: "Рейтинг World Happiness Report",
      shortName: "WHR",
      lead: "Мировая карта субъективного благополучия: официальная оценка жизни, доверительные интервалы, объясняющие факторы, перекрывающиеся трёхлетние окна и полная прослеживаемость источника.",
      loading: "Собираем глобальную картину благополучия",
      loadingDetail: "Проверяем опубликованную редакцию, трёхлетние окна, доверительные интервалы и происхождение значений.",
      notLoaded: "Интерфейс готов, но опубликованная редакция WHR пока отсутствует",
      notLoadedDetail: "Импортируйте официальный Figure 2.1 workbook и пройдите publication gate. До публикации числовые значения не показываются.",
      error: "Не удалось открыть World Happiness Report",
      retry: "Повторить загрузку",
      officialSource: "Официальный сайт",
      dataSharing: "Данные Figure 2.1",
      country: "Страна или территория",
      windowEnd: "Конечный год окна",
      share: "Скопировать ссылку",
      provenance: "Происхождение значения",
      copied: "Ссылка скопирована",
      overview: "Обзор",
      factors: "Объяснение различий",
      trend: "Динамика",
      ranking: "Рейтинг",
      methodology: "Методология",
      overviewKicker: "Обзор",
      overviewHeading: "Как жители оценивают качество своей жизни",
      overviewText: "Рейтинг основан на ответе на один вопрос Cantril Ladder по шкале 0–10. Карта и ориентиры GIR помогают читать распределение, но не изменяют официальные значения.",
      officialLabel: "Официальное значение источника",
      ladderTitle: "Лестница оценки жизни",
      ladderWorst: "Худшая возможная жизнь",
      ladderBest: "Лучшая возможная жизнь",
      ladderNote: "Маркер показывает трёхлетнюю среднюю; контур — опубликованный 95% доверительный интервал.",
      scoreScale: "Шкала 0–10",
      officialRank: "Официальное место",
      confidenceInterval: "95% доверительный интервал",
      globalMedian: "Медиана выборки",
      distributionPosition: "Положение в распределении",
      analyticalGir: "Аналитический ориентир GIR",
      changePeriod: "Изменение за период",
      worldMap: "Мировая карта",
      mapText: "Цвет показывает официальную оценку жизни. Страны без сопоставимого ISO3 остаются в рейтинге, но не размещаются на карте.",
      mapUnavailable: "Локальная геометрия карты недоступна. Рейтинг и профиль страны продолжают работать.",
      noData: "Нет данных",
      countryProfile: "Профиль страны",
      neighbors: "Соседи по официальному рейтингу",
      currentWindow: "Текущее окно",
      reportedScore: "Оценка жизни",
      factorKicker: "Объяснение различий",
      factorHeading: "Декомпозиция опубликованной оценки",
      factorText: "Цветные сегменты воспроизводят модельные вклады Figure 2.1. Это аналитическое объяснение результата, а не набор весов или управленческий рейтинг факторов.",
      officialImported: "Официальные импортированные значения",
      decomposition: "Объясняющие вклады",
      factorNotInput: "Не входит в формулу официального места",
      factorGuide: "Как читать факторы",
      factorGuideText: "Шесть факторов помогают объяснить различия между странами. Dystopia + residual объединяет эталонный уровень и необъяснённый остаток модели.",
      rankByFactor: "Сравнить страны по вкладу",
      derivedOrdering: "Производный порядок GIR — не официальный рейтинг",
      rankingInputNo: "ranking_input: false",
      factorTable: "Таблица вкладов",
      contribution: "Вклад",
      semantics: "Семантика",
      trendKicker: "Динамика",
      trendHeading: "Траектория перекрывающихся трёхлетних окон",
      trendText: "Каждая точка — средняя оценка жизни за три года. Соседние окна перекрываются, а число стран в рейтинге меняется; изменение места нельзя трактовать как равномерную количественную шкалу.",
      metric: "Показатель",
      lifeEvaluation: "Оценка жизни",
      rankMetric: "Официальное место",
      oneRelease: "Показан один опубликованный release_id; разные редакции не сшиваются",
      firstWindow: "Первое окно",
      lastWindow: "Последнее окно",
      minimum: "Минимум",
      maximum: "Максимум",
      seriesTable: "Табличная версия временного ряда",
      window: "Окно",
      rank: "Место",
      rankingKicker: "Рейтинг",
      rankingHeading: "Официальный мировой рейтинг",
      rankingText: "Основной порядок сохраняет опубликованное место. Выбор фактора переключает таблицу на явно маркированную аналитическую сортировку без пересчёта official rank.",
      search: "Поиск страны, территории или ISO3",
      searchPlaceholder: "Например, Финляндия или FIN",
      order: "Порядок",
      officialOrder: "Официальное место",
      region: "Регион",
      allRegions: "Все регионы",
      income: "Группа дохода",
      allIncome: "Все группы дохода",
      pageSize: "Строк на странице",
      includeNonIso: "Показывать исторические non-ISO сущности",
      exportCsv: "Экспорт CSV",
      countriesShown: "Показано",
      selectCountry: "Открыть профиль",
      nonIso: "non-ISO",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      methodologyKicker: "Методология",
      methodologyHeading: "Что именно измеряет World Happiness Report",
      methodologyText: "Интерфейс разделяет официальный outcome, статистическую неопределённость, модельные объяснения и техническое происхождение каждой записи.",
      cantrilTitle: "Cantril Ladder 0–10",
      cantrilText: "Респондент оценивает свою текущую жизнь относительно лучшей и худшей возможной для себя жизни.",
      rollingTitle: "Трёхлетнее среднее",
      rollingText: "Рейтинг использует среднюю оценку за перекрывающееся трёхлетнее окно, а не значение одного календарного года.",
      ciTitle: "Статистическая неопределённость",
      ciText: "Опубликованный 95% интервал помогает не переинтерпретировать небольшие различия между соседними странами.",
      factorsTitle: "Факторы — не веса рейтинга",
      factorsMethodText: "ВВП, поддержка, здоровье, свобода, щедрость и коррупция объясняют различия, но официальное место строится по оценке жизни.",
      edition: "Редакция",
      coverageTitle: "Охват и источник",
      entitiesCovered: "Сущностей в окне",
      mappedCoverage: "С ISO3",
      releaseYear: "Год выпуска",
      publisher: "Издатель",
      releaseId: "Release ID",
      reportPage: "Страница отчёта",
      dataPage: "Страница данных",
      methodologyPage: "Методология",
      faqPage: "FAQ",
      gallupPage: "Метод Gallup",
      auditStatus: "Аудит данных",
      auditPassed: "Проверки пройдены",
      auditFailed: "Нужна проверка",
      publicationGate: "Publication gate",
      snapshotCheck: "Проверка snapshot",
      retrievedAt: "Получено",
      rawSnapshot: "SHA-256 raw snapshot",
      validationIssues: "Замечания импорта",
      noIssues: "Нет блокирующих ошибок",
      provenanceTitle: "Происхождение значения",
      provenanceKicker: "Проверяемость",
      close: "Закрыть",
      entityKey: "Entity key",
      mappingMethod: "Метод сопоставления",
      transformId: "Transform ID",
      importerVersion: "Версия импортёра",
      sourceSheet: "Исходный лист",
      sourceRow: "Исходная строка",
      officialData: "Официальные значения World Happiness Report",
      officialRankNotice: "Official rank никогда не пересчитывается frontend-кодом",
      sourceUnavailable: "Источник не указан",
      latest: "Последняя редакция",
      downloadName: "world-happiness-ranking",
      periodDelta: "Изменение",
      percentile: "Выше доли выборки",
      factorSort: "Объясняющий фактор",
      totalContribution: "Сумма опубликованных сегментов",
      keyboardTabs: "Используйте стрелки влево и вправо, Home и End для перехода между разделами.",
    },
    en: {
      group: "Society & human development",
      reportName: "World Happiness Report",
      indexName: "World Happiness Report ranking",
      shortName: "WHR",
      lead: "A global view of subjective wellbeing: official life evaluations, confidence intervals, explanatory factors, overlapping three-year windows and end-to-end provenance.",
      loading: "Building the global wellbeing view",
      loadingDetail: "Checking the published edition, rolling windows, confidence intervals and value provenance.",
      notLoaded: "The workspace is ready, but no WHR edition has been published",
      notLoadedDetail: "Import the official Figure 2.1 workbook and pass the publication gate. No country values are shown before publication.",
      error: "World Happiness Report could not be opened",
      retry: "Try again",
      officialSource: "Official website",
      dataSharing: "Figure 2.1 data",
      country: "Country or territory",
      windowEnd: "Window end year",
      share: "Copy link",
      provenance: "Value provenance",
      copied: "Link copied",
      overview: "Overview",
      factors: "Explaining differences",
      trend: "Trends",
      ranking: "Ranking",
      methodology: "Methodology",
      overviewKicker: "Overview",
      overviewHeading: "How people evaluate the quality of their lives",
      overviewText: "The ranking is based on a single Cantril Ladder question on a 0–10 scale. GIR map and reference metrics help read the distribution without changing official values.",
      officialLabel: "Official source value",
      ladderTitle: "Life-evaluation ladder",
      ladderWorst: "Worst possible life",
      ladderBest: "Best possible life",
      ladderNote: "The marker is the three-year mean; the outline is the published 95% confidence interval.",
      scoreScale: "0–10 scale",
      officialRank: "Official rank",
      confidenceInterval: "95% confidence interval",
      globalMedian: "Sample median",
      distributionPosition: "Position in distribution",
      analyticalGir: "GIR analytical reference",
      changePeriod: "Change over period",
      worldMap: "World map",
      mapText: "Colour represents the official life evaluation. Entities without a comparable ISO3 remain in the table but are not placed on the map.",
      mapUnavailable: "Local map geometry is unavailable. Ranking and country profile remain functional.",
      noData: "No data",
      countryProfile: "Country profile",
      neighbors: "Official-ranking neighbours",
      currentWindow: "Current window",
      reportedScore: "Life evaluation",
      factorKicker: "Explaining differences",
      factorHeading: "Decomposition of the published evaluation",
      factorText: "The coloured segments reproduce modelled contributions from Figure 2.1. They explain the outcome; they are not weights or a management ranking of factors.",
      officialImported: "Official imported values",
      decomposition: "Explanatory contributions",
      factorNotInput: "Not an input to official rank",
      factorGuide: "How to read the factors",
      factorGuideText: "Six factors help explain cross-country differences. Dystopia + residual combines a benchmark and the model’s unexplained residual.",
      rankByFactor: "Compare countries by contribution",
      derivedOrdering: "Derived GIR ordering — not an official ranking",
      rankingInputNo: "ranking_input: false",
      factorTable: "Contribution table",
      contribution: "Contribution",
      semantics: "Semantics",
      trendKicker: "Trends",
      trendHeading: "Trajectory of overlapping three-year windows",
      trendText: "Each point is a three-year average. Adjacent windows overlap and the number of ranked countries changes; rank movement is not an equal-interval quantitative scale.",
      metric: "Metric",
      lifeEvaluation: "Life evaluation",
      rankMetric: "Official rank",
      oneRelease: "One published release_id is shown; annual editions are not spliced",
      firstWindow: "First window",
      lastWindow: "Last window",
      minimum: "Minimum",
      maximum: "Maximum",
      seriesTable: "Tabular time-series alternative",
      window: "Window",
      rank: "Rank",
      rankingKicker: "Ranking",
      rankingHeading: "Official world ranking",
      rankingText: "The default order preserves published rank. Selecting a factor switches the table to an explicitly labelled analytical ordering without recomputing official rank.",
      search: "Search country, territory or ISO3",
      searchPlaceholder: "For example Finland or FIN",
      order: "Order",
      officialOrder: "Official rank",
      region: "Region",
      allRegions: "All regions",
      income: "Income group",
      allIncome: "All income groups",
      pageSize: "Rows per page",
      includeNonIso: "Include historical non-ISO entities",
      exportCsv: "Export CSV",
      countriesShown: "Shown",
      selectCountry: "Open profile",
      nonIso: "non-ISO",
      previous: "Previous",
      next: "Next",
      page: "Page",
      methodologyKicker: "Methodology",
      methodologyHeading: "What the World Happiness Report measures",
      methodologyText: "The workspace separates the official outcome, statistical uncertainty, modelled explanations and technical provenance of every record.",
      cantrilTitle: "Cantril Ladder 0–10",
      cantrilText: "Respondents evaluate their current life relative to the best and worst possible life for themselves.",
      rollingTitle: "Three-year average",
      rollingText: "The ranking uses an overlapping three-year mean, not a value for a single calendar year.",
      ciTitle: "Statistical uncertainty",
      ciText: "The published 95% interval helps prevent over-interpreting small differences between neighbouring countries.",
      factorsTitle: "Factors are not ranking weights",
      factorsMethodText: "GDP, support, health, freedom, generosity and corruption explain differences; official rank is based on life evaluation.",
      edition: "Edition",
      coverageTitle: "Coverage and source",
      entitiesCovered: "Entities in window",
      mappedCoverage: "Mapped to ISO3",
      releaseYear: "Release year",
      publisher: "Publisher",
      releaseId: "Release ID",
      reportPage: "Report page",
      dataPage: "Data page",
      methodologyPage: "Methodology",
      faqPage: "FAQ",
      gallupPage: "Gallup method",
      auditStatus: "Data audit",
      auditPassed: "Checks passed",
      auditFailed: "Review required",
      publicationGate: "Publication gate",
      snapshotCheck: "Snapshot check",
      retrievedAt: "Retrieved",
      rawSnapshot: "Raw snapshot SHA-256",
      validationIssues: "Import issues",
      noIssues: "No blocking errors",
      provenanceTitle: "Value provenance",
      provenanceKicker: "Traceability",
      close: "Close",
      entityKey: "Entity key",
      mappingMethod: "Mapping method",
      transformId: "Transform ID",
      importerVersion: "Importer version",
      sourceSheet: "Source sheet",
      sourceRow: "Source row",
      officialData: "Official World Happiness Report values",
      officialRankNotice: "Official rank is never recomputed in frontend code",
      sourceUnavailable: "Source unavailable",
      latest: "Latest edition",
      downloadName: "world-happiness-ranking",
      periodDelta: "Change",
      percentile: "Above share of sample",
      factorSort: "Explanatory factor",
      totalContribution: "Sum of published segments",
      keyboardTabs: "Use Left and Right Arrow, Home and End to move between sections.",
    },
  };

  const runtime = {
    root: null,
    context: {},
    lang: "ru",
    theme: "dark",
    view: "overview",
    identity: "FIN",
    year: null,
    status: null,
    metadata: null,
    releases: null,
    years: null,
    factors: null,
    ranking: null,
    factorRanking: null,
    profile: null,
    series: null,
    audit: null,
    geo: null,
    rankingQuery: "",
    rankingRegion: "",
    rankingIncome: "",
    rankingFactor: "",
    rankingIncludeNonIso: true,
    rankingPage: 1,
    rankingPageSize: 25,
    trendMetric: "life_evaluation",
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
  function formatNumber(value, digits = 3) {
    const number = numeric(value);
    if (number === null) return "—";
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number);
  }
  function formatInteger(value) {
    const number = numeric(value);
    return number === null ? "—" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(number);
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
  function percentile(values, value) {
    const target = numeric(value);
    const numbers = values.map(numeric).filter((item) => item !== null);
    if (target === null || !numbers.length) return null;
    return (numbers.filter((item) => item <= target).length / numbers.length) * 100;
  }
  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  function scoreTone(value) {
    const score = numeric(value);
    if (score === null) return "none";
    if (score >= 7) return "high";
    if (score >= 6) return "mid";
    if (score >= 5) return "low";
    return "critical";
  }
  function countryName(item) {
    if (!item) return "—";
    if (runtime.lang === "ru") return item.name_ru || item.country_name_ru || item.country_name_source || item.name_en || item.iso3 || item.entity_key || "—";
    return item.name_en || item.country_name_en || item.country_name_source || item.name_ru || item.iso3 || item.entity_key || "—";
  }
  function factorName(item) { return runtime.lang === "ru" ? (item.name_ru || item.name_en || item.factor_code) : (item.name_en || item.name_ru || item.factor_code); }
  function windowLabel(item) {
    const end = Number(item?.window_end_year ?? item?.reference_year ?? runtime.year);
    const start = Number(item?.window_start_year ?? end - 2);
    return Number.isFinite(start) && Number.isFinite(end) ? `${start}–${end}` : "—";
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
    const view = params.get("whr_view") || (VIEW_KEYS.includes(params.get("view")) ? params.get("view") : null);
    const identity = params.get("whr_country") || params.get("country");
    const year = Number(params.get("whr_year") || params.get("year"));
    const factor = params.get("whr_factor") || "";
    return {
      view: VIEW_KEYS.includes(view) ? view : null,
      identity: identity ? String(identity).toUpperCase() : null,
      year: Number.isFinite(year) ? year : null,
      factor,
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("whr_country", runtime.identity);
    if (runtime.year) url.searchParams.set("whr_year", String(runtime.year));
    url.searchParams.set("whr_view", runtime.view);
    if (runtime.rankingFactor) url.searchParams.set("whr_factor", runtime.rankingFactor); else url.searchParams.delete("whr_factor");
    url.hash = "index-WHR";
    history.replaceState(null, "", url);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({ country: runtime.identity.length === 3 ? runtime.identity : null, year: runtime.year, view: runtime.view });
    }
  }

  function flagMarkup(item, className = "whr-flag-slot") {
    const iso3 = String(item?.iso3 || "").toUpperCase();
    const iso2 = String(item?.iso2 || item?.country_iso2 || "").toLowerCase();
    if (iso2 && /^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className}"><img data-whr-flag src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
    }
    return `<span class="${className} is-fallback"><span aria-hidden="true">${escapeHtml(iso3 || "•")}</span></span>`;
  }

  function releaseForYear() {
    const releaseId = runtime.ranking?.release_id;
    return runtime.releases?.items?.find((item) => item.release_id === releaseId) || runtime.ranking?.release || runtime.status?.latest || {};
  }
  function yearEntry() { return runtime.years?.items?.find((item) => Number(item.reference_year) === Number(runtime.year)) || {}; }
  function rankingItems() { return runtime.ranking?.items || []; }
  function selectedRankingItem() {
    return rankingItems().find((item) => (item.iso3 || item.entity_key) === runtime.identity) || rankingItems()[0] || null;
  }

  async function loadMetadata(signal) {
    if (metadataCache.has("bundle")) return metadataCache.get("bundle");
    const bundle = await Promise.all([
      fetchJson(`${API}/status`, { signal }),
      fetchJson(`${API}/metadata`, { signal, cache: "default" }),
      fetchJson(`${API}/releases`, { signal, cache: "default" }),
      fetchJson(`${API}/years`, { signal, cache: "default" }),
      fetchJson(`${API}/factors`, { signal, cache: "default" }),
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
        } catch (_) { /* try fallback */ }
      }
      return null;
    })();
    return geoCache.promise;
  }

  async function loadProfile(signal) {
    const rankingItem = selectedRankingItem();
    if (!rankingItem) return [null, null];
    const key = rankingItem.iso3 || rankingItem.entity_key;
    runtime.identity = key;
    const encoded = encodeURIComponent(key);
    const profilePath = rankingItem.iso3 ? `${API}/country/${encoded}` : `${API}/entity/${encoded}`;
    const profilePromise = fetchJson(profilePath, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal });
    const seriesPromise = rankingItem.iso3
      ? fetchJson(`${API}/country/${encoded}/series`, { params: { release_id: runtime.ranking.release_id }, signal })
      : Promise.resolve({ data_status: "not_loaded", items: [], total: 0 });
    return Promise.all([profilePromise, seriesPromise]);
  }

  async function loadWorkspace() {
    runtime.abortController?.abort();
    runtime.abortController = new AbortController();
    const signal = runtime.abortController.signal;
    renderState("loading");
    try {
      [runtime.status, runtime.metadata, runtime.releases, runtime.years, runtime.factors] = await loadMetadata(signal);
      if (runtime.status?.data_status !== "available" || !runtime.status?.published_years?.length) {
        renderState("not_loaded");
        return;
      }
      const years = runtime.status.published_years.map(Number);
      if (!runtime.year || !years.includes(Number(runtime.year))) runtime.year = Math.max(...years);
      runtime.ranking = await fetchJson(`${API}/ranking`, { params: { year: runtime.year, include_non_iso: true, limit: 1000 }, signal });
      if (runtime.ranking?.data_status !== "available" || !runtime.ranking?.items?.length) {
        renderState("not_loaded");
        return;
      }
      if (!rankingItems().some((item) => (item.iso3 || item.entity_key) === runtime.identity)) {
        const finland = rankingItems().find((item) => item.iso3 === "FIN");
        runtime.identity = (finland || rankingItems()[0]).iso3 || (finland || rankingItems()[0]).entity_key;
      }
      const detailPromise = loadProfile(signal);
      const [detail, audit, geo] = await Promise.all([
        detailPromise,
        fetchJson(`${API}/audit`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }),
        loadGeo(),
      ]);
      [runtime.profile, runtime.series] = detail;
      runtime.audit = audit;
      runtime.geo = geo;
      renderAvailable();
      updateDeepLink({ notifyHost: false });
    } catch (error) {
      if (!abortError(error)) renderState("error", error);
    }
  }

  async function reloadProfile() {
    runtime.detailController?.abort();
    runtime.detailController = new AbortController();
    const signal = runtime.detailController.signal;
    try {
      [runtime.profile, runtime.series] = await loadProfile(signal);
      renderAvailable();
      updateDeepLink({ notifyHost: true });
    } catch (error) {
      if (!abortError(error)) renderState("error", error);
    }
  }

  async function changeIdentity(value) {
    runtime.identity = String(value || "");
    await reloadProfile();
  }
  async function changeYear(value) {
    const year = Number(value);
    if (!Number.isFinite(year)) return;
    runtime.year = year;
    runtime.rankingFactor = "";
    runtime.factorRanking = null;
    runtime.rankingPage = 1;
    runtime.abortController?.abort();
    runtime.abortController = new AbortController();
    const signal = runtime.abortController.signal;
    renderState("loading");
    try {
      runtime.ranking = await fetchJson(`${API}/ranking`, { params: { year, include_non_iso: true, limit: 1000 }, signal });
      if (!rankingItems().some((item) => (item.iso3 || item.entity_key) === runtime.identity)) runtime.identity = (rankingItems()[0]?.iso3 || rankingItems()[0]?.entity_key || "FIN");
      [runtime.profile, runtime.series] = await loadProfile(signal);
      runtime.audit = await fetchJson(`${API}/audit`, { params: { year, release_id: runtime.ranking.release_id }, signal });
      renderAvailable();
      updateDeepLink({ notifyHost: true });
    } catch (error) { if (!abortError(error)) renderState("error", error); }
  }

  async function loadFactorRanking(code) {
    if (!code) { runtime.factorRanking = null; return; }
    runtime.factorRanking = await fetchJson(`${API}/ranking`, {
      params: { year: runtime.year, release_id: runtime.ranking.release_id, factor_code: code, include_non_iso: runtime.rankingIncludeNonIso, limit: 1000 },
      signal: runtime.detailController?.signal,
    });
  }

  function stateShell(kind, error = null) {
    const source = safeUrl(runtime.metadata?.index?.official_source_url || "https://www.worldhappiness.report/");
    const loading = kind === "loading";
    const title = loading ? tr("loading") : kind === "not_loaded" ? tr("notLoaded") : tr("error");
    const detail = loading ? tr("loadingDetail") : kind === "not_loaded" ? tr("notLoadedDetail") : String(error?.message || error || "Unknown error");
    return `<section class="whr-state-shell whr-state-${kind}" data-whr-state="${kind}"><article class="whr-state-card"><div class="whr-state-art" aria-hidden="true"><div class="whr-loading-orbit"><i></i><i></i><i></i><span>10</span></div></div><p class="whr-kicker">${escapeHtml(tr("reportName"))}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p><footer>${kind === "error" ? `<button class="whr-button whr-button-primary" type="button" data-whr-action="retry">${escapeHtml(tr("retry"))}</button>` : ""}${source ? `<a class="whr-button" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a>` : ""}</footer></article></section>`;
  }
  function renderState(kind, error = null) {
    if (!runtime.root) return;
    runtime.root.innerHTML = stateShell(kind, error);
    runtime.root.querySelectorAll('[data-whr-action="retry"]').forEach((button) => { button.onclick = loadWorkspace; });
  }

  function hero() {
    const item = runtime.profile || selectedRankingItem() || {};
    const release = releaseForYear();
    const score = numeric(item.life_evaluation);
    const rank = numeric(item.official_rank);
    return `<header class="whr-hero" data-tone="${scoreTone(score)}"><div class="whr-hero-copy"><div class="whr-hero-badges"><span>${escapeHtml(tr("group"))}</span><span>${escapeHtml(release.edition_name || tr("latest"))}</span><span>${escapeHtml(windowLabel(item))}</span></div><p class="whr-kicker">${escapeHtml(tr("reportName"))}</p><h1>${escapeHtml(tr("indexName"))}</h1><p>${escapeHtml(tr("lead"))}</p><div class="whr-hero-links"><a href="${escapeHtml(safeUrl(runtime.metadata?.index?.official_source_url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a><a href="${escapeHtml(safeUrl(runtime.metadata?.index?.data_sharing_url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("dataSharing"))}<span aria-hidden="true">↗</span></a></div></div><div class="whr-hero-score"><div class="whr-hero-country">${flagMarkup(item, "whr-hero-flag")}<div><span>${escapeHtml(countryName(item))}</span><small>${escapeHtml(item.iso3 || item.entity_key || "")}</small></div></div><div class="whr-score-orbit" role="img" aria-label="${escapeHtml(`${tr("lifeEvaluation")}: ${formatNumber(score, 3)}`)}"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="72"></circle><circle class="whr-score-progress" cx="90" cy="90" r="72" pathLength="100" style="--score-progress:${score === null ? 0 : Math.max(0, Math.min(100, score * 10))}"></circle></svg><div><strong>${formatNumber(score, 3)}</strong><span>${escapeHtml(tr("scoreScale"))}</span></div></div><div class="whr-hero-score-meta"><div><span>${escapeHtml(tr("officialRank"))}</span><strong>${rank === null ? "—" : `#${formatInteger(rank)}`}</strong></div><div><span>${escapeHtml(tr("confidenceInterval"))}</span><strong>${numeric(item.ci_lower) === null ? "—" : `${formatNumber(item.ci_lower, 3)}–${formatNumber(item.ci_upper, 3)}`}</strong></div></div></div></header>`;
  }

  function controlBar() {
    const options = rankingItems().map((item) => {
      const value = item.iso3 || item.entity_key;
      const label = `${countryName(item)}${item.iso3 ? ` · ${item.iso3}` : ` · ${tr("nonIso")}`}`;
      return `<option value="${escapeHtml(value)}"${value === runtime.identity ? " selected" : ""}>${escapeHtml(label)}</option>`;
    }).join("");
    const years = [...(runtime.status?.published_years || [])].sort((a, b) => b - a).map((year) => `<option value="${year}"${Number(year) === Number(runtime.year) ? " selected" : ""}>${year - 2}–${year}</option>`).join("");
    return `<section class="whr-controls"><label><span>${escapeHtml(tr("country"))}</span><span class="whr-select-shell">${flagMarkup(runtime.profile || selectedRankingItem(), "whr-control-flag")}<select data-whr-country>${options}</select><i aria-hidden="true"></i></span></label><label><span>${escapeHtml(tr("windowEnd"))}</span><span class="whr-select-shell"><select data-whr-year>${years}</select><i aria-hidden="true"></i></span></label><div class="whr-control-actions"><button class="whr-button" type="button" data-whr-action="share"><span aria-hidden="true">↗</span>${escapeHtml(tr("share"))}</button><button class="whr-button" type="button" data-whr-action="provenance"><span aria-hidden="true">⌘</span>${escapeHtml(tr("provenance"))}</button></div></section>`;
  }

  function tabs() {
    return `<nav class="whr-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}" aria-description="${escapeHtml(tr("keyboardTabs"))}">${VIEW_KEYS.map((view) => `<button type="button" role="tab" id="whr-tab-${runtime.instance}-${view}" aria-controls="whr-panel-${runtime.instance}-${view}" aria-selected="${runtime.view === view}" tabindex="${runtime.view === view ? "0" : "-1"}" data-whr-view="${view}">${escapeHtml(tr(view))}</button>`).join("")}</nav>`;
  }
  function sectionHeading(kicker, title, text, extra = "") {
    return `<header class="whr-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`;
  }

  function ladderMarkup() {
    const item = runtime.profile || {};
    const score = numeric(item.life_evaluation);
    const low = numeric(item.ci_lower);
    const high = numeric(item.ci_upper);
    const marker = score === null ? 0 : Math.max(0, Math.min(100, score * 10));
    const left = low === null ? marker : Math.max(0, Math.min(100, low * 10));
    const right = high === null ? marker : Math.max(0, Math.min(100, high * 10));
    return `<article class="whr-card whr-ladder-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("officialLabel"))}</p><h3>${escapeHtml(tr("ladderTitle"))}</h3></div><span>${escapeHtml(tr("scoreScale"))}</span></div><div class="whr-ladder" role="img" aria-label="${escapeHtml(`${tr("lifeEvaluation")}: ${formatNumber(score, 3)}; ${tr("confidenceInterval")}: ${formatNumber(low, 3)}–${formatNumber(high, 3)}`)}"><div class="whr-ladder-scale">${Array.from({ length: 11 }, (_, index) => `<i style="--step:${index}"><span>${index}</span></i>`).join("")}</div><div class="whr-ladder-track"><span class="whr-ladder-ci" style="--ci-left:${left}%;--ci-width:${Math.max(0.8, right - left)}%"></span><span class="whr-ladder-marker" style="--marker:${marker}%"><b>${formatNumber(score, 3)}</b></span></div><div class="whr-ladder-labels"><span>${escapeHtml(tr("ladderWorst"))}</span><span>${escapeHtml(tr("ladderBest"))}</span></div></div><p class="whr-card-note">${escapeHtml(tr("ladderNote"))}</p></article>`;
  }

  function featureIso(feature) {
    const p = feature?.properties || {};
    const values = [feature?.id, p.iso_a3, p.ISO_A3, p.adm0_a3, p.ADM0_A3, p.sov_a3, p.SOV_A3];
    const value = values.find((candidate) => /^[A-Za-z]{3}$/.test(String(candidate || "")));
    return value ? String(value).toUpperCase() : "";
  }
  function projectPoint(point, width, height) {
    const lon = Number(point[0]); const lat = Math.max(-85, Math.min(85, Number(point[1])));
    return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
  }
  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    const polygon = (rings) => rings.map((ring) => ring.map((point, index) => {
      const [x, y] = projectPoint(point, width, height);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join("") + "Z").join("");
    if (geometry.type === "Polygon") return polygon(geometry.coordinates || []);
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).map(polygon).join("");
    return "";
  }
  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="whr-map-unavailable">${escapeHtml(tr("mapUnavailable"))}</div>`;
    const byIso = new Map(rankingItems().filter((item) => item.iso3).map((item) => [item.iso3, item]));
    const width = 1120; const height = 520;
    const paths = runtime.geo.features.map((feature) => {
      const iso3 = featureIso(feature);
      const item = byIso.get(iso3);
      const value = numeric(item?.life_evaluation);
      const d = geometryPath(feature.geometry, width, height);
      if (!d) return "";
      const selected = iso3 === runtime.identity;
      return `<path d="${d}" data-whr-map-iso="${escapeHtml(iso3)}" data-has-value="${value !== null}" data-selected="${selected}" style="--map-score:${value === null ? 0 : value}" aria-hidden="true"><title>${escapeHtml(item ? `${countryName(item)} · ${formatNumber(value, 3)}` : feature.properties?.name || iso3)}</title></path>`;
    }).join("");
    return `<svg class="whr-map-canvas" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("worldMap"))}" preserveAspectRatio="xMidYMid meet">${paths}</svg><div class="whr-map-legend" aria-hidden="true"><span>0</span><i></i><span>10</span></div>`;
  }

  function overviewPanel() {
    const item = runtime.profile || {};
    const values = rankingItems().map((entry) => entry.life_evaluation);
    const med = median(values);
    const pct = percentile(values, item.life_evaluation);
    const series = runtime.series?.items || [];
    const delta = series.length > 1 ? numeric(series.at(-1)?.life_evaluation) - numeric(series[0]?.life_evaluation) : null;
    const metrics = [
      [tr("globalMedian"), formatNumber(med, 3)],
      [tr("distributionPosition"), pct === null ? "—" : `${formatNumber(pct, 1)}%`],
      [tr("changePeriod"), delta === null ? "—" : `${delta >= 0 ? "+" : ""}${formatNumber(delta, 3)}`],
    ];
    const neighbors = item.neighbors || [];
    return `<section class="whr-panel" role="tabpanel" id="whr-panel-${runtime.instance}-overview" aria-labelledby="whr-tab-${runtime.instance}-overview" tabindex="0" data-whr-panel="overview">${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}<div class="whr-overview-grid">${ladderMarkup()}<div class="whr-metric-grid">${metrics.map(([label, value]) => `<article class="whr-metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><small>${escapeHtml(tr("analyticalGir"))}</small></article>`).join("")}</div></div><div class="whr-map-grid"><article class="whr-card whr-map-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("worldMap"))}</p><h3>${escapeHtml(tr("worldMap"))}</h3></div><span>${escapeHtml(windowLabel(item))}</span></div><p class="whr-card-note">${escapeHtml(tr("mapText"))}</p>${mapMarkup()}</article><article class="whr-card whr-profile-card"><div class="whr-profile-head">${flagMarkup(item, "whr-profile-flag")}<div><p>${escapeHtml(tr("countryProfile"))}</p><h3>${escapeHtml(countryName(item))}</h3><span>${escapeHtml(item.iso3 || item.entity_key || "")}</span></div></div><dl class="whr-profile-facts"><div><dt>${escapeHtml(tr("currentWindow"))}</dt><dd>${escapeHtml(windowLabel(item))}</dd></div><div><dt>${escapeHtml(tr("reportedScore"))}</dt><dd>${formatNumber(item.life_evaluation, 3)}</dd></div><div><dt>${escapeHtml(tr("officialRank"))}</dt><dd>${numeric(item.official_rank) === null ? "—" : `#${formatInteger(item.official_rank)}`}</dd></div><div><dt>${escapeHtml(tr("confidenceInterval"))}</dt><dd>${numeric(item.ci_lower) === null ? "—" : `${formatNumber(item.ci_lower, 3)}–${formatNumber(item.ci_upper, 3)}`}</dd></div></dl><div class="whr-neighbors"><p>${escapeHtml(tr("neighbors"))}</p>${neighbors.map((neighbor) => `<button type="button" data-whr-country-pick="${escapeHtml(neighbor.iso3 || neighbor.entity_key)}"><span>#${formatInteger(neighbor.official_rank)}</span><b>${escapeHtml(countryName(neighbor))}</b><em>${formatNumber(neighbor.life_evaluation, 3)}</em></button>`).join("")}</div></article></div><aside class="whr-method-alert"><div aria-hidden="true">i</div><div><h3>${escapeHtml(tr("factorsTitle"))}</h3><p>${escapeHtml(tr("factorsMethodText"))}</p></div><button type="button" data-whr-view-jump="factors">${escapeHtml(tr("factors"))}<span aria-hidden="true">→</span></button></aside></section>`;
  }

  function factorModel() {
    const catalog = runtime.factors?.items || runtime.metadata?.framework?.factors || [];
    const byCode = new Map((runtime.profile?.factors || []).map((item) => [item.factor_code, item]));
    const items = catalog.map((factor) => ({ ...factor, ...(byCode.get(factor.factor_code) || {}), contribution: numeric(byCode.get(factor.factor_code)?.contribution), color: FACTOR_COLORS[factor.factor_code] || "#8392a6" }));
    const sum = items.reduce((acc, item) => acc + (item.contribution || 0), 0);
    return { items, sum, score: numeric(runtime.profile?.life_evaluation) };
  }
  function decompositionBar(model) {
    const total = model.items.reduce((acc, item) => acc + Math.max(0, item.contribution || 0), 0) || 1;
    return `<div class="whr-decomposition-track" role="img" aria-label="${escapeHtml(tr("decomposition"))}">${model.items.map((item) => `<span style="--factor-color:${item.color};--factor-width:${Math.max(5, ((Math.max(0, item.contribution || 0) / total) * 100)).toFixed(2)}%"><i>${escapeHtml(factorName(item))}</i><b>${formatNumber(item.contribution, 3)}</b></span>`).join("")}</div>`;
  }
  function factorsPanel() {
    const model = factorModel();
    return `<section class="whr-panel" role="tabpanel" id="whr-panel-${runtime.instance}-factors" aria-labelledby="whr-tab-${runtime.instance}-factors" tabindex="0" data-whr-panel="factors">${sectionHeading(tr("factorKicker"), tr("factorHeading"), tr("factorText"))}<article class="whr-card whr-decomposition-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("officialImported"))}</p><h3>${escapeHtml(tr("decomposition"))}</h3></div><span>${escapeHtml(countryName(runtime.profile))} · ${escapeHtml(windowLabel(runtime.profile))}</span></div>${decompositionBar(model)}<div class="whr-decomposition-note"><strong>${formatNumber(model.score, 3)}</strong><span>${escapeHtml(tr("lifeEvaluation"))}</span><p>${escapeHtml(tr("factorText"))}</p></div></article><div class="whr-factor-grid">${model.items.map((item, index) => `<article class="whr-factor-card" style="--factor-color:${item.color}"><span class="whr-factor-index">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(factorName(item))}</h3><p>${escapeHtml(item.source_header || item.factor_code)}</p></div><strong>${formatNumber(item.contribution, 3)}</strong><small>${escapeHtml(tr("factorNotInput"))}</small><button type="button" data-whr-factor-ranking="${escapeHtml(item.factor_code)}">${escapeHtml(tr("rankByFactor"))}<span aria-hidden="true">↗</span></button></article>`).join("")}</div><div class="whr-factor-bottom"><article class="whr-card whr-factor-guide"><div class="whr-card-title"><div><p>${escapeHtml(tr("factorGuide"))}</p><h3>${escapeHtml(tr("factorGuide"))}</h3></div><span>${escapeHtml(tr("rankingInputNo"))}</span></div><p>${escapeHtml(tr("factorGuideText"))}</p><div class="whr-factor-callout"><strong>${formatNumber(model.sum, 3)}</strong><span>${escapeHtml(tr("totalContribution"))}</span></div><p class="whr-derived-badge">${escapeHtml(tr("derivedOrdering"))}</p></article><article class="whr-card whr-factor-table-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("factorTable"))}</p><h3>${escapeHtml(tr("factorTable"))}</h3></div></div><div class="whr-table-scroll"><table class="whr-table"><thead><tr><th>${escapeHtml(tr("factors"))}</th><th>${escapeHtml(tr("contribution"))}</th><th>${escapeHtml(tr("semantics"))}</th></tr></thead><tbody>${model.items.map((item) => `<tr><td><span class="whr-factor-dot" style="--factor-color:${item.color}"></span>${escapeHtml(factorName(item))}</td><td>${formatNumber(item.contribution, 3)}</td><td>${escapeHtml(item.semantics || tr("factorNotInput"))}</td></tr>`).join("")}</tbody></table></div></article></div></section>`;
  }

  function chartMarkup(items, metric) {
    const values = items.map((item) => numeric(item[metric])).filter((value) => value !== null);
    if (!values.length) return `<div class="whr-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    const width = 920, height = 340, padX = 52, padY = 34;
    const min = metric === "official_rank" ? Math.min(...values) : Math.min(...values) - 0.1;
    const max = metric === "official_rank" ? Math.max(...values) : Math.max(...values) + 0.1;
    const range = Math.max(0.001, max - min);
    const point = (item, index) => {
      const x = padX + (index / Math.max(1, items.length - 1)) * (width - padX * 2);
      const raw = numeric(item[metric]);
      const ratio = metric === "official_rank" ? (max - raw) / range : (raw - min) / range;
      return [x, height - padY - ratio * (height - padY * 2)];
    };
    const points = items.map(point);
    const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${line} L${points.at(-1)[0].toFixed(1)},${height - padY} L${points[0][0].toFixed(1)},${height - padY} Z`;
    return `<svg class="whr-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(metric === "official_rank" ? tr("rankMetric") : tr("lifeEvaluation"))}"><defs><linearGradient id="whr-area-${runtime.instance}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--whr-accent)" stop-opacity=".28"></stop><stop offset="1" stop-color="var(--whr-accent)" stop-opacity="0"></stop></linearGradient></defs>${Array.from({ length: 5 }, (_, i) => { const y = padY + i * ((height - padY * 2) / 4); return `<line x1="${padX}" x2="${width - padX}" y1="${y}" y2="${y}" class="whr-chart-grid"></line>`; }).join("")}<path d="${area}" fill="url(#whr-area-${runtime.instance})"></path><path d="${line}" class="whr-chart-line"></path>${points.map(([x, y], index) => `<g><circle cx="${x}" cy="${y}" r="5"></circle><title>${escapeHtml(`${windowLabel(items[index])}: ${metric === "official_rank" ? `#${formatInteger(items[index][metric])}` : formatNumber(items[index][metric], 3)}`)}</title></g>`).join("")}${items.map((item, index) => `<text x="${points[index][0]}" y="${height - 8}" text-anchor="middle">${item.reference_year}</text>`).join("")}</svg>`;
  }
  function trendPanel() {
    const items = runtime.series?.items || [];
    const metric = runtime.trendMetric;
    const values = items.map((item) => numeric(item[metric])).filter((value) => value !== null);
    const first = items.find((item) => numeric(item[metric]) !== null);
    const last = [...items].reverse().find((item) => numeric(item[metric]) !== null);
    const delta = first && last ? numeric(last[metric]) - numeric(first[metric]) : null;
    const stats = [
      [tr("firstWindow"), first ? windowLabel(first) : "—"],
      [tr("lastWindow"), last ? windowLabel(last) : "—"],
      [tr("minimum"), values.length ? (metric === "official_rank" ? `#${formatInteger(Math.min(...values))}` : formatNumber(Math.min(...values), 3)) : "—"],
      [tr("maximum"), values.length ? (metric === "official_rank" ? `#${formatInteger(Math.max(...values))}` : formatNumber(Math.max(...values), 3)) : "—"],
      [tr("periodDelta"), delta === null ? "—" : `${delta >= 0 ? "+" : ""}${metric === "official_rank" ? formatInteger(delta) : formatNumber(delta, 3)}`],
    ];
    const selector = `<label class="whr-inline-select"><span>${escapeHtml(tr("metric"))}</span><span class="whr-select-shell"><select data-whr-trend-metric><option value="life_evaluation"${metric === "life_evaluation" ? " selected" : ""}>${escapeHtml(tr("lifeEvaluation"))}</option><option value="official_rank"${metric === "official_rank" ? " selected" : ""}>${escapeHtml(tr("rankMetric"))}</option></select><i aria-hidden="true"></i></span></label>`;
    return `<section class="whr-panel" role="tabpanel" id="whr-panel-${runtime.instance}-trend" aria-labelledby="whr-tab-${runtime.instance}-trend" tabindex="0" data-whr-panel="trend">${sectionHeading(tr("trendKicker"), tr("trendHeading"), tr("trendText"), selector)}<div class="whr-trend-grid"><article class="whr-card whr-chart-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("oneRelease"))}</p><h3>${escapeHtml(metric === "official_rank" ? tr("rankMetric") : tr("lifeEvaluation"))}</h3></div><span>${escapeHtml(countryName(runtime.profile))}</span></div>${chartMarkup(items, metric)}</article><div class="whr-trend-stats">${stats.map(([label, value], index) => `<article class="whr-metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b>${index === 4 ? `<small>${escapeHtml(tr("analyticalGir"))}</small>` : ""}</article>`).join("")}</div></div><article class="whr-card whr-series-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("seriesTable"))}</p><h3>${escapeHtml(tr("seriesTable"))}</h3></div></div><div class="whr-table-scroll"><table class="whr-table"><thead><tr><th>${escapeHtml(tr("window"))}</th><th>${escapeHtml(tr("lifeEvaluation"))}</th><th>${escapeHtml(tr("confidenceInterval"))}</th><th>${escapeHtml(tr("officialRank"))}</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escapeHtml(windowLabel(item))}</td><td>${formatNumber(item.life_evaluation, 3)}</td><td>${numeric(item.ci_lower) === null ? "—" : `${formatNumber(item.ci_lower, 3)}–${formatNumber(item.ci_upper, 3)}`}</td><td>${numeric(item.official_rank) === null ? "—" : `#${formatInteger(item.official_rank)}`}</td></tr>`).join("")}</tbody></table></div></article></section>`;
  }

  function currentRankingPayload() { return runtime.rankingFactor ? (runtime.factorRanking || runtime.ranking) : runtime.ranking; }
  function filteredRanking() {
    const source = currentRankingPayload()?.items || [];
    const query = runtime.rankingQuery.trim().toLocaleLowerCase(locale());
    return source.filter((item) => {
      if (!runtime.rankingIncludeNonIso && !item.iso3) return false;
      if (runtime.rankingRegion && item.region !== runtime.rankingRegion) return false;
      if (runtime.rankingIncome && item.income_group !== runtime.rankingIncome) return false;
      if (query) {
        const haystack = `${countryName(item)} ${item.country_name_source || ""} ${item.iso3 || ""} ${item.entity_key || ""}`.toLocaleLowerCase(locale());
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }
  function rankingFilters() {
    const source = currentRankingPayload()?.items || rankingItems();
    const regions = [...new Set(source.map((item) => item.region).filter(Boolean))].sort();
    const incomes = [...new Set(source.map((item) => item.income_group).filter(Boolean))].sort();
    const factorOptions = (runtime.factors?.items || []).map((item) => `<option value="${escapeHtml(item.factor_code)}"${runtime.rankingFactor === item.factor_code ? " selected" : ""}>${escapeHtml(factorName(item))}</option>`).join("");
    return `<div class="whr-ranking-filters"><label class="whr-search-field"><span>${escapeHtml(tr("search"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}" data-whr-ranking-query></label><label><span>${escapeHtml(tr("order"))}</span><span class="whr-select-shell"><select data-whr-ranking-factor><option value="">${escapeHtml(tr("officialOrder"))}</option>${factorOptions}</select><i aria-hidden="true"></i></span></label><label><span>${escapeHtml(tr("region"))}</span><span class="whr-select-shell"><select data-whr-ranking-region><option value="">${escapeHtml(tr("allRegions"))}</option>${regions.map((value) => `<option value="${escapeHtml(value)}"${runtime.rankingRegion === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select><i aria-hidden="true"></i></span></label><label><span>${escapeHtml(tr("income"))}</span><span class="whr-select-shell"><select data-whr-ranking-income><option value="">${escapeHtml(tr("allIncome"))}</option>${incomes.map((value) => `<option value="${escapeHtml(value)}"${runtime.rankingIncome === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select><i aria-hidden="true"></i></span></label><label><span>${escapeHtml(tr("pageSize"))}</span><span class="whr-select-shell"><select data-whr-ranking-size>${[10,25,50,100].map((value) => `<option value="${value}"${runtime.rankingPageSize === value ? " selected" : ""}>${value}</option>`).join("")}</select><i aria-hidden="true"></i></span></label><label class="whr-check"><input type="checkbox" data-whr-ranking-noniso${runtime.rankingIncludeNonIso ? " checked" : ""}><span>${escapeHtml(tr("includeNonIso"))}</span></label></div>`;
  }
  function rankingTable() {
    const rows = filteredRanking();
    const pages = Math.max(1, Math.ceil(rows.length / runtime.rankingPageSize));
    runtime.rankingPage = Math.min(runtime.rankingPage, pages);
    const start = (runtime.rankingPage - 1) * runtime.rankingPageSize;
    const pageRows = rows.slice(start, start + runtime.rankingPageSize);
    return `<div class="whr-ranking-meta"><div><strong>${escapeHtml(tr("countriesShown"))}: ${formatInteger(rows.length)}</strong>${runtime.rankingFactor ? `<span class="whr-derived-badge">${escapeHtml(tr("derivedOrdering"))}</span>` : `<span>${escapeHtml(tr("officialRankNotice"))}</span>`}</div><button class="whr-button" type="button" data-whr-action="export"><span aria-hidden="true">⇩</span>${escapeHtml(tr("exportCsv"))}</button></div><div class="whr-table-scroll"><table class="whr-table whr-ranking-table"><thead><tr><th>${escapeHtml(runtime.rankingFactor ? tr("order") : tr("rank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(runtime.rankingFactor ? tr("contribution") : tr("lifeEvaluation"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("confidenceInterval"))}</th><th>${escapeHtml(tr("region"))}</th></tr></thead><tbody>${pageRows.map((item, index) => `<tr class="${(item.iso3 || item.entity_key) === runtime.identity ? "is-selected" : ""}"><td>${runtime.rankingFactor ? formatInteger(start + index + 1) : (numeric(item.official_rank) === null ? "—" : `#${formatInteger(item.official_rank)}`)}</td><td><button class="whr-country-cell" type="button" data-whr-country-pick="${escapeHtml(item.iso3 || item.entity_key)}" aria-label="${escapeHtml(`${tr("selectCountry")}: ${countryName(item)}`)}">${flagMarkup(item, "whr-table-flag")}<span><b>${escapeHtml(countryName(item))}</b><small>${escapeHtml(item.iso3 || item.entity_key || tr("nonIso"))}</small></span></button></td><td><strong>${runtime.rankingFactor ? formatNumber(item.factor_contribution, 3) : formatNumber(item.life_evaluation, 3)}</strong></td><td>${numeric(item.official_rank) === null ? "—" : `#${formatInteger(item.official_rank)}`}</td><td>${numeric(item.ci_lower) === null ? "—" : `${formatNumber(item.ci_lower, 3)}–${formatNumber(item.ci_upper, 3)}`}</td><td>${escapeHtml(item.region || "—")}</td></tr>`).join("") || `<tr><td colspan="6">${escapeHtml(tr("noData"))}</td></tr>`}</tbody></table></div><div class="whr-pagination"><button type="button" data-whr-page="${runtime.rankingPage - 1}"${runtime.rankingPage <= 1 ? " disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${runtime.rankingPage} / ${pages}</span><button type="button" data-whr-page="${runtime.rankingPage + 1}"${runtime.rankingPage >= pages ? " disabled" : ""}>${escapeHtml(tr("next"))}</button></div>`;
  }
  function rankingPanel() {
    return `<section class="whr-panel" role="tabpanel" id="whr-panel-${runtime.instance}-ranking" aria-labelledby="whr-tab-${runtime.instance}-ranking" tabindex="0" data-whr-panel="ranking">${sectionHeading(tr("rankingKicker"), tr("rankingHeading"), tr("rankingText"))}<article class="whr-card whr-ranking-card">${rankingFilters()}${runtime.rankingFactor && !runtime.factorRanking ? `<div class="whr-inline-loading" role="status"><i></i><span>${escapeHtml(tr("loading"))}</span></div>` : rankingTable()}</article></section>`;
  }

  function auditModel() {
    const audit = runtime.audit?.audit || {};
    const checks = audit.checks || audit.publication_assessment?.checks || {};
    const values = Object.values(checks);
    return { audit, checks, passed: values.length ? values.every(Boolean) : Boolean(audit.ok || audit.publishable), issueCount: (audit.issues || []).length + (audit.foreign_key_violations || []).length };
  }
  function methodLink(url, label) {
    const href = safeUrl(url);
    return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span aria-hidden="true">↗</span></a>` : "";
  }
  function methodologyPanel() {
    const release = releaseForYear(); const year = yearEntry(); const audit = auditModel(); const index = runtime.metadata?.index || {};
    const cards = [["01",tr("cantrilTitle"),tr("cantrilText")],["02",tr("rollingTitle"),tr("rollingText")],["03",tr("ciTitle"),tr("ciText")],["04",tr("factorsTitle"),tr("factorsMethodText")]];
    return `<section class="whr-panel" role="tabpanel" id="whr-panel-${runtime.instance}-methodology" aria-labelledby="whr-tab-${runtime.instance}-methodology" tabindex="0" data-whr-panel="methodology">${sectionHeading(tr("methodologyKicker"), tr("methodologyHeading"), tr("methodologyText"))}<div class="whr-method-grid">${cards.map(([number,title,text]) => `<article class="whr-method-card"><span>${number}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div><div class="whr-method-bottom"><article class="whr-card whr-coverage-card"><div class="whr-card-title"><div><p>${escapeHtml(tr("edition"))}</p><h3>${escapeHtml(tr("coverageTitle"))}</h3></div><span>${escapeHtml(release.edition_name || "—")}</span></div><dl><div><dt>${escapeHtml(tr("window"))}</dt><dd>${escapeHtml(windowLabel(year))}</dd></div><div><dt>${escapeHtml(tr("entitiesCovered"))}</dt><dd>${formatInteger(year.entity_count || release.current_result_count)}</dd></div><div><dt>${escapeHtml(tr("mappedCoverage"))}</dt><dd>${formatInteger(year.mapped_entity_count || release.mapped_entity_count)}</dd></div><div><dt>${escapeHtml(tr("releaseYear"))}</dt><dd>${formatInteger(release.release_year)}</dd></div><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(release.publisher || index.publisher || "—")}</dd></div><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd><code>${escapeHtml(release.release_id || runtime.ranking?.release_id || "—")}</code></dd></div></dl><div class="whr-method-links">${methodLink(index.official_source_url,tr("reportPage"))}${methodLink(index.data_sharing_url,tr("dataPage"))}${methodLink(index.methodology_url,tr("methodologyPage"))}${methodLink(index.faq_url,tr("faqPage"))}${methodLink(index.gallup_method_url,tr("gallupPage"))}</div></article><article class="whr-card whr-audit-card ${audit.passed ? "is-ok" : "is-warning"}"><div class="whr-audit-head"><div class="whr-audit-icon" aria-hidden="true">${audit.passed ? "✓" : "!"}</div><div><p>${escapeHtml(tr("auditStatus"))}</p><h3>${escapeHtml(audit.passed ? tr("auditPassed") : tr("auditFailed"))}</h3></div></div><dl><div><dt>${escapeHtml(tr("publicationGate"))}</dt><dd>${escapeHtml(release.status || (audit.passed ? "published" : "—"))}</dd></div><div><dt>${escapeHtml(tr("snapshotCheck"))}</dt><dd>${audit.checks.snapshot_sha256_matches === false ? tr("auditFailed") : tr("auditPassed")}</dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${formatDate(release.retrieved_at)}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("validationIssues"))}</dt><dd>${audit.issueCount ? formatInteger(audit.issueCount) : tr("noIssues")}</dd></div></dl><button class="whr-button" type="button" data-whr-action="provenance">${escapeHtml(tr("provenanceTitle"))}</button></article></div></section>`;
  }

  function activePanel() {
    if (runtime.view === "factors") return factorsPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "methodology") return methodologyPanel();
    return overviewPanel();
  }
  function viewStageMarkup() { return activePanel() + VIEW_KEYS.filter((view) => view !== runtime.view).map((view) => `<div role="tabpanel" id="whr-panel-${runtime.instance}-${view}" aria-labelledby="whr-tab-${runtime.instance}-${view}" hidden></div>`).join(""); }
  function renderAvailable() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `<article class="whr-workspace" data-whr-workspace data-version="${MODULE_VERSION}" data-theme="${escapeHtml(runtime.theme)}">${hero()}${controlBar()}${tabs()}<div class="whr-view-stage">${viewStageMarkup()}</div><footer class="whr-workspace-footer"><span>${escapeHtml(tr("officialData"))}</span><span>${escapeHtml(tr("officialRankNotice"))}</span><span>GIR · ${MODULE_VERSION}</span></footer><p class="whr-sr-only" aria-live="polite" aria-atomic="true" data-whr-live></p></article>`;
    bindEvents();
  }

  function provenanceRows() {
    const item = runtime.profile || selectedRankingItem() || {};
    const release = item.release || releaseForYear();
    const provenance = item.provenance || {};
    return [
      [tr("country"), `${countryName(item)}${item.iso3 ? ` (${item.iso3})` : ""}`],
      [tr("entityKey"), item.entity_key], [tr("mappingMethod"), item.mapping_method], [tr("window"), windowLabel(item)],
      [tr("lifeEvaluation"), formatNumber(item.life_evaluation, 8)], [tr("confidenceInterval"), numeric(item.ci_lower) === null ? null : `${formatNumber(item.ci_lower, 8)}–${formatNumber(item.ci_upper, 8)}`],
      [tr("officialRank"), item.official_rank], [tr("releaseId"), item.release_id || release.release_id || runtime.ranking?.release_id],
      [tr("releaseYear"), release.release_year], [tr("publisher"), release.publisher], [tr("retrievedAt"), release.retrieved_at],
      [tr("rawSnapshot"), release.raw_snapshot_sha256], [tr("transformId"), release.transform_id], [tr("importerVersion"), release.importer_version],
      [tr("sourceSheet"), item.source_sheet || provenance.source_sheet], [tr("sourceRow"), item.source_row || provenance.source_row],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
  }
  function provenanceHtml() {
    const item = runtime.profile || {};
    return `<div class="whr-provenance"><dl>${provenanceRows().map(([label,value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>${item.provenance || item.entity_provenance ? `<details><summary>JSON</summary><pre>${escapeHtml(JSON.stringify({ observation: item.provenance || {}, entity: item.entity_provenance || {} }, null, 2))}</pre></details>` : ""}</div>`;
  }
  function openProvenance(trigger) {
    if (typeof runtime.context.openDrawer === "function") {
      runtime.context.openDrawer(provenanceHtml(), { title: tr("provenanceTitle"), kicker: tr("provenanceKicker"), trigger });
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.className = "whr-dialog";
    dialog.innerHTML = `<div class="whr-dialog-head"><div><p>${escapeHtml(tr("provenanceKicker"))}</p><h2>${escapeHtml(tr("provenanceTitle"))}</h2></div><button type="button" data-whr-dialog-close>${escapeHtml(tr("close"))}</button></div>${provenanceHtml()}`;
    document.body.append(dialog);
    dialog.querySelector("[data-whr-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("close", () => { dialog.remove(); trigger?.focus?.(); }, { once: true });
    dialog.showModal();
  }

  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try { await navigator.clipboard.writeText(window.location.href); }
    catch (_) {
      const input = document.createElement("textarea"); input.value = window.location.href; input.style.position = "fixed"; input.style.opacity = "0"; document.body.append(input); input.select(); document.execCommand("copy"); input.remove();
    }
    notify(tr("copied"));
  }
  function csvCell(value) { const text = String(value ?? ""); return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function exportRanking() {
    const factor = runtime.rankingFactor; const headers = ["reference_year","window_start_year","window_end_year","official_rank","iso3","entity_key","country","life_evaluation","ci_lower","ci_upper","region","income_group","release_id"];
    if (factor) headers.push(`factor_${factor}`);
    const rows = filteredRanking().map((item) => {
      const row = [runtime.year,item.window_start_year,item.window_end_year,item.official_rank ?? "",item.iso3 ?? "",item.entity_key ?? "",countryName(item),item.life_evaluation ?? "",item.ci_lower ?? "",item.ci_upper ?? "",item.region ?? "",item.income_group ?? "",currentRankingPayload()?.release_id ?? ""];
      if (factor) row.push(item.factor_contribution ?? ""); return row;
    });
    const blob = new Blob(["\uFEFF" + [headers,...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = href; anchor.download = `${tr("downloadName")}-${runtime.year}${factor ? `-${factor}` : ""}.csv`; document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(href);
  }

  async function setView(view, { focusPanel = false, focusTab = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    const changed = runtime.view !== view; runtime.view = view;
    if (changed) { updateDeepLink({ notifyHost: true }); renderAvailable(); }
    requestAnimationFrame(() => {
      const element = runtime.root?.querySelector(focusTab ? `[data-whr-view="${view}"]` : `[data-whr-panel="${view}"]`);
      if (focusPanel || focusTab) element?.focus({ preventScroll: focusTab });
      if (focusTab) element?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }
  function rerenderStage({ focusSelector = null, cursor = null } = {}) {
    const stage = runtime.root?.querySelector(".whr-view-stage"); if (stage) stage.innerHTML = viewStageMarkup(); bindEvents();
    if (focusSelector) { const replacement = runtime.root?.querySelector(focusSelector); replacement?.focus({ preventScroll: true }); if (cursor !== null) replacement?.setSelectionRange?.(cursor, cursor); }
  }
  function handleTabKeydown(event) {
    const tabs = [...runtime.root.querySelectorAll("[data-whr-view]")]; const index = tabs.indexOf(event.currentTarget); let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return; event.preventDefault(); setView(tabs[next].dataset.whrView, { focusTab: true });
  }
  async function selectFactorRanking(code) {
    runtime.rankingFactor = code; runtime.rankingPage = 1; runtime.view = "ranking"; runtime.factorRanking = null; updateDeepLink({ notifyHost: true }); renderAvailable();
    runtime.detailController?.abort(); runtime.detailController = new AbortController();
    try { await loadFactorRanking(code); rerenderStage(); requestAnimationFrame(() => runtime.root?.querySelector('[data-whr-panel="ranking"]')?.focus()); }
    catch (error) { if (!abortError(error)) renderState("error", error); }
  }

  function bindEvents() {
    const root = runtime.root; if (!root) return;
    root.querySelectorAll("img[data-whr-flag]").forEach((image) => {
      const revealFallback = () => { image.parentElement?.classList.add("is-fallback"); image.remove(); };
      if (image.complete && image.naturalWidth === 0) revealFallback(); else image.addEventListener("error", revealFallback, { once: true });
    });
    root.querySelectorAll('[data-whr-action="retry"]').forEach((button) => { button.onclick = loadWorkspace; });
    root.querySelectorAll("[data-whr-country]").forEach((select) => { select.onchange = (event) => changeIdentity(event.target.value); });
    root.querySelectorAll("[data-whr-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-whr-view]").forEach((button) => { button.onclick = () => setView(button.dataset.whrView, { focusTab: true }); button.onkeydown = handleTabKeydown; });
    root.querySelectorAll("[data-whr-view-jump]").forEach((button) => { button.onclick = () => setView(button.dataset.whrViewJump, { focusPanel: true }); });
    root.querySelectorAll('[data-whr-action="share"]').forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll('[data-whr-action="provenance"]').forEach((button) => { button.onclick = () => openProvenance(button); });
    root.querySelectorAll('[data-whr-action="export"]').forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-whr-country-pick]").forEach((button) => { button.onclick = async () => { await changeIdentity(button.dataset.whrCountryPick); if (runtime.view === "ranking") await setView("overview", { focusPanel: true }); }; });
    root.querySelectorAll('[data-whr-map-iso][data-has-value="true"]').forEach((path) => { path.style.cursor = "pointer"; path.onclick = () => changeIdentity(path.dataset.whrMapIso); });
    root.querySelectorAll("[data-whr-factor-ranking]").forEach((button) => { button.onclick = () => selectFactorRanking(button.dataset.whrFactorRanking); });
    root.querySelectorAll("[data-whr-trend-metric]").forEach((select) => { select.onchange = (event) => { runtime.trendMetric = event.target.value; rerenderStage(); }; });
    const search = root.querySelector("[data-whr-ranking-query]");
    if (search) search.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-whr-ranking-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-whr-ranking-factor]").forEach((select) => { select.onchange = async (event) => {
      runtime.rankingFactor = event.target.value; runtime.factorRanking = null; runtime.rankingPage = 1; updateDeepLink({ notifyHost: true }); rerenderStage();
      if (runtime.rankingFactor) { runtime.detailController?.abort(); runtime.detailController = new AbortController(); try { await loadFactorRanking(runtime.rankingFactor); rerenderStage(); } catch (error) { if (!abortError(error)) renderState("error", error); } }
    }; });
    root.querySelectorAll("[data-whr-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-whr-ranking-income]").forEach((select) => { select.onchange = (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-whr-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-whr-ranking-noniso]").forEach((input) => { input.onchange = (event) => { runtime.rankingIncludeNonIso = event.target.checked; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-whr-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage = Number(button.dataset.whrPage); rerenderStage(); runtime.root?.querySelector(".whr-ranking-table")?.scrollIntoView({ block: "start" }); }; });
  }

  function render(context = {}) {
    if (!context.root) throw new Error("GIRWorldHappiness.render requires root");
    runtime.abortController?.abort(); runtime.detailController?.abort();
    runtime.root = context.root; runtime.context = context; runtime.lang = context.lang === "en" ? "en" : "ru"; runtime.theme = context.theme || document.documentElement.dataset.theme || "dark"; runtime.instance += 1;
    const link = deepLink(); runtime.view = link.view || "overview"; runtime.identity = link.identity || String(context.country || "FIN").toUpperCase(); runtime.year = link.year || (Number(context.year) || null); runtime.rankingFactor = link.factor || ""; runtime.factorRanking = null;
    return loadWorkspace();
  }
  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort(); runtime.detailController?.abort();
    if (hard) { metadataCache.clear(); geoCache.value = null; geoCache.promise = null; }
    runtime.status = runtime.metadata = runtime.releases = runtime.years = runtime.factors = runtime.ranking = runtime.factorRanking = runtime.profile = runtime.series = runtime.audit = null;
  }

  window.GIRWorldHappiness = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    orderingSemantics: FACTOR_ORDERING_SEMANTICS,
    _test: Object.freeze({ median, percentile, numeric, escapeHtml, scoreTone, featureIso, geometryPath, factorOrderingSemantics: FACTOR_ORDERING_SEMANTICS }),
  });
})();
