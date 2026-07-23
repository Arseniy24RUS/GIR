(() => {
  "use strict";

  const MODULE_VERSION = "1.0.0";
  const API = "/api/uhc-service-coverage";
  const VIEW_KEYS = ["overview", "domains", "trend", "tracers", "ranking", "methodology"];
  const MAP_URLS = ["/static/world_countries_lite.geojson"];
  const DERIVED_OVERALL_ORDER = "derived_gir_overall_score_order_not_official_rank";
  const DERIVED_DOMAIN_ORDER = "derived_gir_domain_score_order_not_official_rank";
  const SCORE_SEMANTICS = "official_uhc_service_coverage_index_0_to_100_not_population_percentage";
  const TRACER_NUMERIC_VALUES_IN_CURRENT_EXPORT = false;

  const TEXT = {
    ru: {
      indexName: "Индекс охвата основными услугами здравоохранения",
      indexShort: "UHC SCI",
      publisher: "Всемирная организация здравоохранения и Всемирный банк",
      official: "Официальное значение WHO–World Bank",
      derived: "Производная аналитика GIR",
      loadingTitle: "Загрузка UHC SCI",
      loadingText: "Получаем опубликованную редакцию, страновые профили и временные ряды.",
      notLoadedTitle: "Интерфейс UHC SCI готов",
      notLoadedText: "Опубликованная редакция ещё не прошла publication gate. Тестовые значения не подставляются.",
      errorTitle: "Не удалось загрузить UHC SCI",
      retry: "Повторить",
      overview: "Обзор",
      domains: "4 направления",
      trend: "Динамика",
      tracers: "14 индикаторов",
      ranking: "Мировая таблица",
      methodology: "Методология и аудит",
      heroKicker: "SDG 3.8.1 · охват основными услугами здравоохранения",
      heroLead: "Сводная оценка доступности основных медицинских услуг по шкале 0–100, рассчитанная WHO и Всемирным банком на основе четырнадцати tracer indicators.",
      officialScore: "UHC SCI",
      scoreScale: "Шкала 0–100 · больше — лучше",
      notPercentage: "Индекс, а не процент населения",
      derivedPosition: "Позиция в порядке GIR",
      noOfficialRank: "WHO и Всемирный банк не публикуют официальный рейтинг стран",
      dataYear: "Год данных",
      edition: "Редакция",
      country: "Страна",
      share: "Скопировать ссылку",
      provenance: "Происхождение значения",
      copied: "Ссылка скопирована",
      overviewKicker: "Страновой профиль",
      overviewHeading: "Охват услугами и место в мировой выборке",
      overviewText: "Официальный score, четыре направления и контекст мира. Позиция рассчитывается GIR только для навигации и не является рейтингом WHO или Всемирного банка.",
      worldBenchmark: "Мировое значение",
      globalMedian: "Медиана стран",
      changeSince2000: "Изменение с 2000 года",
      remainingGap: "Расстояние до 100",
      worldMap: "Карта охвата",
      mapText: "Цвет отражает официальный score выбранного года; серый означает отсутствие данных.",
      domainProfile: "Профиль четырёх направлений",
      neighbors: "Соседи по производному порядку GIR",
      position: "Позиция",
      score: "Score",
      noData: "Нет данных",
      openProfile: "Открыть профиль",
      domainKicker: "Архитектура индекса",
      domainHeading: "Четыре направления охвата",
      domainText: "Итоговый UHC SCI является геометрическим средним четырёх официальных субиндексов. Сравнение стран не меняет исходные значения.",
      compare: "Сравнить со страной",
      noComparison: "Без сравнения",
      selectedCountry: "Выбранная страна",
      comparisonCountry: "Страна сравнения",
      change: "Изменение",
      startValue: "2000",
      currentValue: "2023",
      domainTable: "Табличная альтернатива профиля",
      trendKicker: "Временной ряд",
      trendHeading: "Динамика в единой пересмотренной редакции",
      trendText: "Показаны ежегодные официальные значения 2000–2023 из одного выпуска revised-2025. Ряды разных методических редакций автоматически не склеиваются.",
      metric: "Показатель",
      overall: "Итоговый UHC SCI",
      allDomains: "Все направления",
      firstYear: "Первый год",
      lastYear: "Последний год",
      minimum: "Минимум",
      maximum: "Максимум",
      periodDelta: "Изменение за период",
      trendTable: "Табличный ряд",
      tracersKicker: "Методический каталог",
      tracersHeading: "Четырнадцать tracer indicators",
      tracersText: "Текущая официальная выгрузка содержит итоговый индекс и четыре субиндекса, но не числовые страновые ряды всех четырнадцати tracer indicators. GIR показывает каталог без генерации отсутствующих значений.",
      filterDomain: "Направление",
      all: "Все",
      sourceOrganization: "Источник показателя",
      denominator: "Целевая группа / знаменатель",
      direction: "Направление улучшения",
      higherBetter: "Больше — лучше",
      lowerRescaled: "Меньше исходное значение — лучше; источник нормирует показатель",
      valuesUnavailable: "Числовой ряд не входит в текущий export",
      rankingKicker: "Сравнение стран",
      rankingHeading: "Мировая таблица официальных score",
      rankingText: "Порядок строк является производной сортировкой GIR. Поле официального места остаётся пустым, поскольку источник его не публикует.",
      search: "Поиск",
      searchPlaceholder: "Страна или ISO3",
      region: "Регион",
      allRegions: "Все регионы",
      rankingMetric: "Сортировать по",
      pageSize: "Строк на странице",
      exportCsv: "Экспорт CSV",
      shown: "Показано",
      officialRank: "Официальное место",
      derivedOrder: "Производный порядок GIR — не официальный рейтинг",
      domainScore: "Score направления",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      methodologyKicker: "Воспроизводимость",
      methodologyHeading: "Методология, источник и publication gate",
      methodologyText: "Интерфейс отделяет официальные значения от производных сравнений и показывает происхождение каждого наблюдения.",
      principleComposite: "Сводный индекс",
      principleCompositeText: "UHC SCI объединяет 14 tracer indicators в четырёх направлениях и рассчитывается по шкале 0–100.",
      principleNotPercent: "Не процент населения",
      principleNotPercentText: "Score 87 означает значение индекса 87 из 100, а не то, что ровно 87% населения полностью обеспечены всеми услугами.",
      principleNoRank: "Без официального rank",
      principleNoRankText: "WHO и Всемирный банк публикуют score. Любая позиция в таблице GIR является производной сортировкой.",
      principleRevision: "Единая редакция",
      principleRevisionText: "Текущий ряд 2000–2023 относится к пересмотренной методике 2025 года; предыдущие редакции не смешиваются без проверки сопоставимости.",
      framework: "Структура 4 + 14",
      sourcesAudit: "Источник и аудит",
      auditPassed: "Проверка пройдена",
      auditReview: "Требуется проверка",
      publicationGate: "Publication gate",
      release: "Редакция",
      releaseId: "Release ID",
      retrievedAt: "Получено",
      rawSnapshot: "SHA-256 исходного файла",
      transformId: "Transformation ID",
      importerVersion: "Версия импортёра",
      sourceRows: "Исходная строка",
      sourceSheet: "Исходный файл",
      sourceStructure: "Структура Data360",
      officialSource: "WHO indicator page",
      dataset: "Data360 dataset",
      report: "Глобальный доклад 2025",
      csvSource: "Официальный CSV",
      mapUnavailable: "Карта недоступна; таблица и профиль продолжают работать.",
      keyboardTabs: "Для перемещения по вкладкам используйте клавиши со стрелками, Home и End.",
      dataQuality: "Статус наблюдения",
      publicObservation: "Публичное официальное наблюдение",
      percentOfScale: "доля шкалы 0–100",
      coverageBandVeryHigh: "Очень высокий охват",
      coverageBandHigh: "Высокий охват",
      coverageBandMedium: "Средний охват",
      coverageBandLow: "Низкий охват",
      coverageBandVeryLow: "Очень низкий охват",
    },
    en: {
      indexName: "UHC Service Coverage Index",
      indexShort: "UHC SCI",
      publisher: "World Health Organization and World Bank",
      official: "Official WHO–World Bank value",
      derived: "Derived GIR analytics",
      loadingTitle: "Loading UHC SCI",
      loadingText: "Retrieving the published release, country profiles and time series.",
      notLoadedTitle: "The UHC SCI interface is ready",
      notLoadedText: "No release has passed the publication gate yet. No test values are substituted.",
      errorTitle: "UHC SCI could not be loaded",
      retry: "Retry",
      overview: "Overview",
      domains: "4 domains",
      trend: "Trend",
      tracers: "14 indicators",
      ranking: "World table",
      methodology: "Methodology & audit",
      heroKicker: "SDG 3.8.1 · essential health service coverage",
      heroLead: "A 0–100 summary measure of essential health-service coverage, produced by WHO and the World Bank from fourteen tracer indicators.",
      officialScore: "UHC SCI",
      scoreScale: "0–100 scale · higher is better",
      notPercentage: "An index, not a population percentage",
      derivedPosition: "Position in GIR order",
      noOfficialRank: "WHO and the World Bank do not publish an official country ranking",
      dataYear: "Data year",
      edition: "Release",
      country: "Country",
      share: "Copy link",
      provenance: "Value provenance",
      copied: "Link copied",
      overviewKicker: "Country profile",
      overviewHeading: "Service coverage in global context",
      overviewText: "Official score, four domains and world context. The position is calculated by GIR for navigation only and is not a WHO or World Bank ranking.",
      worldBenchmark: "World value",
      globalMedian: "Country median",
      changeSince2000: "Change since 2000",
      remainingGap: "Distance to 100",
      worldMap: "Coverage map",
      mapText: "Colour represents the official score for the selected year; grey means no data.",
      domainProfile: "Four-domain profile",
      neighbors: "Neighbours in derived GIR order",
      position: "Position",
      score: "Score",
      noData: "No data",
      openProfile: "Open profile",
      domainKicker: "Index architecture",
      domainHeading: "Four coverage domains",
      domainText: "The overall UHC SCI is the geometric mean of four official subindices. Country comparison never changes source values.",
      compare: "Compare with country",
      noComparison: "No comparison",
      selectedCountry: "Selected country",
      comparisonCountry: "Comparison country",
      change: "Change",
      startValue: "2000",
      currentValue: "2023",
      domainTable: "Tabular profile alternative",
      trendKicker: "Time series",
      trendHeading: "Trend within one revised release",
      trendText: "Annual official values for 2000–2023 are shown from the same revised-2025 release. Methodologically different releases are not spliced automatically.",
      metric: "Metric",
      overall: "Overall UHC SCI",
      allDomains: "All domains",
      firstYear: "First year",
      lastYear: "Last year",
      minimum: "Minimum",
      maximum: "Maximum",
      periodDelta: "Period change",
      trendTable: "Tabular series",
      tracersKicker: "Methodological catalogue",
      tracersHeading: "Fourteen tracer indicators",
      tracersText: "The current official export contains the overall index and four subindices, but not country-level numeric series for all fourteen tracer indicators. GIR displays the catalogue without generating missing values; it does not fabricate missing values.",
      filterDomain: "Domain",
      all: "All",
      sourceOrganization: "Indicator source",
      denominator: "Target group / denominator",
      direction: "Direction of progress",
      higherBetter: "Higher is better",
      lowerRescaled: "Lower source value is better; the source rescales the indicator",
      valuesUnavailable: "Numeric series is not included in the current export",
      rankingKicker: "Country comparison",
      rankingHeading: "World table of official scores",
      rankingText: "Row order is a derived GIR sort. Official rank remains empty because the source does not publish one.",
      search: "Search",
      searchPlaceholder: "Country or ISO3",
      region: "Region",
      allRegions: "All regions",
      rankingMetric: "Sort by",
      pageSize: "Rows per page",
      exportCsv: "Export CSV",
      shown: "Shown",
      officialRank: "Official rank",
      derivedOrder: "Derived GIR order — not an official ranking",
      domainScore: "Domain score",
      previous: "Previous",
      next: "Next",
      page: "Page",
      methodologyKicker: "Reproducibility",
      methodologyHeading: "Methodology, source and publication gate",
      methodologyText: "The interface separates official values from derived comparisons and exposes provenance for each observation.",
      principleComposite: "Composite index",
      principleCompositeText: "UHC SCI combines 14 tracer indicators in four domains and is reported on a 0–100 scale.",
      principleNotPercent: "Not a population percentage",
      principleNotPercentText: "A score of 87 means an index value of 87 out of 100; it does not mean exactly 87% of people receive every needed service.",
      principleNoRank: "No official rank",
      principleNoRankText: "WHO and the World Bank publish scores. Any position in GIR is a derived sort.",
      principleRevision: "One methodological release",
      principleRevisionText: "The current 2000–2023 series uses the revised 2025 method; earlier editions are not mixed without a comparability review.",
      framework: "4 + 14 framework",
      sourcesAudit: "Source and audit",
      auditPassed: "Checks passed",
      auditReview: "Review required",
      publicationGate: "Publication gate",
      release: "Release",
      releaseId: "Release ID",
      retrievedAt: "Retrieved",
      rawSnapshot: "Raw-file SHA-256",
      transformId: "Transformation ID",
      importerVersion: "Importer version",
      sourceRows: "Source row",
      sourceSheet: "Source file",
      sourceStructure: "Data360 structure",
      officialSource: "WHO indicator page",
      dataset: "Data360 dataset",
      report: "2025 global report",
      csvSource: "Official CSV",
      mapUnavailable: "The map is unavailable; the table and profile still work.",
      keyboardTabs: "Use arrow keys, Home and End to move between tabs.",
      dataQuality: "Observation status",
      publicObservation: "Public official observation",
      percentOfScale: "share of the 0–100 scale",
      coverageBandVeryHigh: "Very high coverage",
      coverageBandHigh: "High coverage",
      coverageBandMedium: "Medium coverage",
      coverageBandLow: "Low coverage",
      coverageBandVeryLow: "Very low coverage",
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
    compareCountry: "",
    selectedDomain: "rmnch",
    trendMetric: "overall",
    tracerDomain: "",
    rankingMetric: "overall",
    rankingQuery: "",
    rankingRegion: "",
    rankingPage: 1,
    rankingPageSize: 25,
    status: null,
    metadata: null,
    releases: null,
    years: null,
    domains: null,
    tracers: null,
    ranking: null,
    metricRanking: null,
    profile: null,
    compareProfile: null,
    series: null,
    world: null,
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
    if (runtime.lang === "ru") return item.name_ru || item.ref_area_label || item.name_en || item.iso3 || item.ref_area || "—";
    return item.name_en || item.ref_area_label || item.name_ru || item.iso3 || item.ref_area || "—";
  }
  function domainName(item) {
    if (!item) return "—";
    return runtime.lang === "ru" ? (item.name_ru || item.name_en || item.domain_code) : (item.name_en || item.name_ru || item.domain_code);
  }
  function tracerName(item) {
    if (!item) return "—";
    return runtime.lang === "ru" ? (item.name_ru || item.name_en || item.tracer_code) : (item.name_en || item.name_ru || item.tracer_code);
  }
  function coverageBand(score) {
    const value = numeric(score);
    if (value === null) return { key: "noData", tone: "none" };
    if (value >= 85) return { key: "coverageBandVeryHigh", tone: "very-high" };
    if (value >= 70) return { key: "coverageBandHigh", tone: "high" };
    if (value >= 55) return { key: "coverageBandMedium", tone: "medium" };
    if (value >= 40) return { key: "coverageBandLow", tone: "low" };
    return { key: "coverageBandVeryLow", tone: "very-low" };
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
    const view = params.get("uhc_view") || (VIEW_KEYS.includes(params.get("view")) ? params.get("view") : null);
    const year = Number(params.get("uhc_year") || params.get("year"));
    const country = params.get("uhc_country") || params.get("country");
    return {
      view: VIEW_KEYS.includes(view) ? view : null,
      country: country ? String(country).toUpperCase() : null,
      year: Number.isFinite(year) ? year : null,
      compare: params.get("uhc_compare") ? String(params.get("uhc_compare")).toUpperCase() : "",
      domain: params.get("uhc_domain") || null,
      trendMetric: params.get("uhc_trend_metric") || null,
      rankingMetric: params.get("uhc_ranking_metric") || null,
      tracerDomain: params.get("uhc_tracer_domain") || null,
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("uhc_country", runtime.country);
    if (runtime.year) url.searchParams.set("uhc_year", String(runtime.year));
    url.searchParams.set("uhc_view", runtime.view);
    if (runtime.compareCountry) url.searchParams.set("uhc_compare", runtime.compareCountry); else url.searchParams.delete("uhc_compare");
    if (runtime.selectedDomain) url.searchParams.set("uhc_domain", runtime.selectedDomain); else url.searchParams.delete("uhc_domain");
    if (runtime.trendMetric !== "overall") url.searchParams.set("uhc_trend_metric", runtime.trendMetric); else url.searchParams.delete("uhc_trend_metric");
    if (runtime.rankingMetric !== "overall") url.searchParams.set("uhc_ranking_metric", runtime.rankingMetric); else url.searchParams.delete("uhc_ranking_metric");
    if (runtime.tracerDomain) url.searchParams.set("uhc_tracer_domain", runtime.tracerDomain); else url.searchParams.delete("uhc_tracer_domain");
    url.hash = "index-UHC_SCI";
    history.replaceState(null, "", url);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({ country: runtime.country, year: runtime.year, view: runtime.view });
    }
  }

  function flagMarkup(item, className = "uhc-flag-slot") {
    const iso3 = String(item?.iso3 || "").toUpperCase();
    const iso2 = String(item?.iso2 || "").toLowerCase();
    if (iso2 && /^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className}"><img data-uhc-flag src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
    }
    return `<span class="${className} is-fallback"><span aria-hidden="true">${escapeHtml(iso3 || "•")}</span></span>`;
  }

  function yearItems() { return runtime.years?.items || []; }
  function rankingItems(payload = runtime.ranking) { return payload?.items || []; }
  function domainCatalog() { return runtime.domains?.items || runtime.metadata?.domains || []; }
  function tracerCatalog() { return runtime.tracers?.items || runtime.metadata?.tracers || []; }
  function domainByCode(code) { return domainCatalog().find((item) => item.domain_code === code) || null; }
  function profileCountry() { return runtime.profile?.country || rankingItems().find((item) => item.iso3 === runtime.country) || {}; }
  function selectedRankingItem() { return rankingItems().find((item) => item.iso3 === runtime.country) || rankingItems()[0] || null; }
  function currentRelease() {
    const releaseId = runtime.ranking?.release_id || runtime.profile?.release_id;
    return runtime.releases?.items?.find((item) => item.release_id === releaseId) || runtime.profile?.release || runtime.ranking?.release || {};
  }
  function domainResult(code, profile = runtime.profile) { return profile?.domains?.find((item) => item.domain_code === code) || null; }

  async function loadMetadata(signal) {
    if (metadataCache.has("bundle")) return metadataCache.get("bundle");
    const bundle = await Promise.all([
      fetchJson(`${API}/status`, { signal }),
      fetchJson(`${API}/metadata`, { signal, cache: "default" }),
      fetchJson(`${API}/releases`, { signal, cache: "default" }),
      fetchJson(`${API}/years`, { signal, cache: "default" }),
      fetchJson(`${API}/domains`, { signal, cache: "default" }),
      fetchJson(`${API}/tracers`, { signal, cache: "default" }),
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

  async function loadProfile(signal) {
    const item = selectedRankingItem();
    if (!item?.iso3) return [null, { items: [], total: 0 }, null];
    runtime.country = String(item.iso3).toUpperCase();
    return Promise.all([
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }),
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking.release_id }, signal }),
      fetchJson(`${API}/aggregate/WLD`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }).catch(() => null),
    ]);
  }

  async function loadWorkspace() {
    const instance = runtime.instance;
    runtime.abortController?.abort();
    runtime.abortController = new AbortController();
    renderState("loading");
    try {
      const [status, metadata, releases, years, domains, tracers] = await loadMetadata(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      runtime.status = status; runtime.metadata = metadata; runtime.releases = releases; runtime.years = years; runtime.domains = domains; runtime.tracers = tracers;
      if (status.data_status !== "available" || !yearItems().length) {
        renderState("not_loaded");
        return;
      }
      const availableYears = yearItems().map((item) => Number(item.data_year)).filter(Number.isFinite);
      if (!availableYears.includes(Number(runtime.year))) runtime.year = Math.max(...availableYears);
      const [ranking, geo] = await Promise.all([
        fetchJson(`${API}/ranking`, { params: { year: runtime.year, limit: 1000, offset: 0 }, signal: runtime.abortController.signal }),
        loadGeo(),
      ]);
      if (instance !== runtime.instance) return;
      runtime.ranking = ranking; runtime.metricRanking = null; runtime.geo = geo;
      if (!rankingItems().some((item) => item.iso3 === runtime.country)) runtime.profile = null;
      const [profile, series, world] = await loadProfile(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      runtime.profile = profile; runtime.series = series; runtime.world = world;
      runtime.audit = await fetchJson(`${API}/audit`, { params: { year: runtime.year, release_id: ranking.release_id }, signal: runtime.abortController.signal }).catch(() => null);
      renderAvailable();
      updateDeepLink();
    } catch (error) {
      if (abortError(error) || instance !== runtime.instance) return;
      renderState("error", error);
    }
  }

  async function reloadProfile({ focusSelector = "" } = {}) {
    runtime.detailController?.abort();
    runtime.detailController = new AbortController();
    try {
      const [profile, series, world] = await loadProfile(runtime.detailController.signal);
      runtime.profile = profile; runtime.series = series; runtime.world = world;
      renderAvailable(); updateDeepLink();
      if (focusSelector) requestAnimationFrame(() => runtime.root?.querySelector(focusSelector)?.focus());
    } catch (error) {
      if (!abortError(error)) renderState("error", error);
    }
  }

  async function changeCountry(value) {
    const code = String(value || "").toUpperCase();
    if (!code || code === runtime.country) return;
    runtime.country = code; runtime.compareCountry = runtime.compareCountry === code ? "" : runtime.compareCountry;
    await reloadProfile();
  }

  async function changeYear(value) {
    const year = Number(value);
    if (!Number.isFinite(year) || year === runtime.year) return;
    runtime.year = year; runtime.rankingPage = 1;
    await loadWorkspace();
  }

  async function changeCompare(value) {
    runtime.compareCountry = String(value || "").toUpperCase();
    if (!runtime.compareCountry) { runtime.compareProfile = null; renderAvailable(); updateDeepLink({ notifyHost: false }); return; }
    runtime.detailController?.abort(); runtime.detailController = new AbortController();
    try {
      runtime.compareProfile = await fetchJson(`${API}/country/${encodeURIComponent(runtime.compareCountry)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal: runtime.detailController.signal });
      renderAvailable(); updateDeepLink({ notifyHost: false });
    } catch (error) { if (!abortError(error)) notify(String(error.message || error)); }
  }

  async function selectRankingMetric(value) {
    runtime.rankingMetric = value || "overall"; runtime.rankingPage = 1;
    if (runtime.rankingMetric === "overall") runtime.metricRanking = null;
    else {
      runtime.detailController?.abort(); runtime.detailController = new AbortController();
      runtime.metricRanking = await fetchJson(`${API}/ranking`, { params: { year: runtime.year, release_id: runtime.ranking.release_id, domain_code: runtime.rankingMetric, limit: 1000, offset: 0 }, signal: runtime.detailController.signal });
    }
    renderAvailable(); updateDeepLink({ notifyHost: false });
  }

  function stateShell(title, text, action = "") {
    return `<section class="uhc-workspace" aria-live="polite"><article class="uhc-state-card" role="status"><span class="uhc-state-code">${escapeHtml(tr("indexShort"))}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>${action}</article></section>`;
  }
  function renderState(kind, error = null) {
    if (!runtime.root) return;
    if (kind === "loading") runtime.root.innerHTML = stateShell(tr("loadingTitle"), tr("loadingText"), `<span class="uhc-loader" aria-hidden="true"></span>`);
    else if (kind === "not_loaded") runtime.root.innerHTML = stateShell(tr("notLoadedTitle"), tr("notLoadedText"));
    else runtime.root.innerHTML = stateShell(tr("errorTitle"), String(error?.message || error || "Unknown error"), `<button type="button" class="uhc-button" data-uhc-retry>${escapeHtml(tr("retry"))}</button>`);
    const retry = runtime.root.querySelector("[data-uhc-retry]"); if (retry) retry.onclick = () => { metadataCache.clear(); loadWorkspace(); };
  }

  function externalLink(value, label) {
    const url = safeUrl(value);
    return url ? `<a class="uhc-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>` : "";
  }

  function hero() {
    const country = profileCountry();
    const score = numeric(country.score);
    const band = coverageBand(score);
    const derived = rankingItems().find((item) => item.iso3 === runtime.country)?.derived_position;
    const release = currentRelease();
    return `<header class="uhc-hero">
      <div class="uhc-hero-copy">
        <p class="uhc-kicker">${escapeHtml(tr("heroKicker"))}</p>
        <div class="uhc-title-row"><span class="uhc-index-code">${escapeHtml(tr("indexShort"))}</span><span>${escapeHtml(release.edition_name || String(release.release_year || ""))}</span></div>
        <h1>${escapeHtml(tr("indexName"))}</h1>
        <p>${escapeHtml(tr("heroLead"))}</p>
        <div class="uhc-hero-notes"><span>${escapeHtml(tr("notPercentage"))}</span><span>${escapeHtml(tr("noOfficialRank"))}</span></div>
      </div>
      <div class="uhc-hero-score">
        <div class="uhc-country-heading">${flagMarkup(country, "uhc-hero-flag")}<div><span>${escapeHtml(tr("country"))}</span><strong>${escapeHtml(countryName(country))}</strong></div></div>
        <div class="uhc-score-line"><strong>${formatNumber(score, 0)}</strong><span>/ 100</span></div>
        <div class="uhc-score-track"><i style="width:${score === null ? 0 : Math.max(0, Math.min(100, score))}%"></i></div>
        <div class="uhc-score-meta"><span class="is-${band.tone}">${escapeHtml(tr(band.key))}</span><span>${escapeHtml(tr("derivedPosition"))}: ${derived ? `${derived}/${runtime.ranking?.total || rankingItems().length}` : "—"}</span></div>
      </div>
    </header>`;
  }

  function countryOptions(selected = runtime.country, includeEmpty = false) {
    const rows = rankingItems();
    return `${includeEmpty ? `<option value="">${escapeHtml(tr("noComparison"))}</option>` : ""}${rows.map((item) => `<option value="${escapeHtml(item.iso3 || "")}" ${item.iso3 === selected ? "selected" : ""}>${escapeHtml(`${countryName(item)} · ${item.iso3 || ""}`)}</option>`).join("")}`;
  }
  function yearOptions() {
    return yearItems().slice().sort((a, b) => Number(b.data_year) - Number(a.data_year)).map((item) => `<option value="${item.data_year}" ${Number(item.data_year) === Number(runtime.year) ? "selected" : ""}>${item.data_year}</option>`).join("");
  }
  function controlBar() {
    return `<div class="uhc-controls"><div class="uhc-control-primary"><label><span>${escapeHtml(tr("country"))}</span><select data-uhc-country>${countryOptions()}</select></label><label><span>${escapeHtml(tr("dataYear"))}</span><select data-uhc-year>${yearOptions()}</select></label></div><div class="uhc-control-actions"><button type="button" class="uhc-button uhc-button-secondary" data-uhc-action="share">${escapeHtml(tr("share"))}</button><button type="button" class="uhc-button uhc-button-secondary" data-uhc-action="provenance">${escapeHtml(tr("provenance"))}</button></div></div>`;
  }
  function tabs() {
    return `<div class="uhc-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}">${VIEW_KEYS.map((view) => `<button type="button" role="tab" id="uhc-tab-${runtime.instance}-${view}" aria-controls="uhc-panel-${runtime.instance}-${view}" aria-selected="${runtime.view === view}" tabindex="${runtime.view === view ? "0" : "-1"}" data-uhc-view="${view}">${escapeHtml(tr(view))}</button>`).join("")}</div><p class="uhc-sr-only">${escapeHtml(tr("keyboardTabs"))}</p>`;
  }
  function sectionHeading(kicker, title, text, extra = "") {
    return `<header class="uhc-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`;
  }

  function featureIso(feature) {
    const p = feature?.properties || {};
    return String(feature?.id || p.iso3 || p.ISO_A3 || p.ADM0_A3 || p.gu_a3 || "").toUpperCase();
  }
  function projectPoint(point, width, height) {
    const lon = Number(point?.[0]); const lat = Number(point?.[1]);
    return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
  }
  function geometryPath(geometry, width, height) {
    const rings = geometry?.type === "Polygon" ? geometry.coordinates : geometry?.type === "MultiPolygon" ? geometry.coordinates.flat() : [];
    return rings.map((ring) => ring.map((point, index) => { const [x, y] = projectPoint(point, width, height); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + " Z").join(" ");
  }
  function mapBin(score) {
    const value = numeric(score);
    if (value === null) return 0;
    if (value >= 85) return 6;
    if (value >= 75) return 5;
    if (value >= 65) return 4;
    if (value >= 55) return 3;
    if (value >= 40) return 2;
    return 1;
  }
  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="uhc-map-fallback"><p>${escapeHtml(tr("mapUnavailable"))}</p></div>`;
    const width = 960; const height = 500;
    const scoreByIso = new Map(rankingItems().filter((item) => item.iso3).map((item) => [item.iso3, item]));
    const paths = runtime.geo.features.map((feature) => {
      const iso = featureIso(feature); const item = scoreByIso.get(iso); const path = geometryPath(feature.geometry, width, height); const selected = iso === runtime.country;
      if (!path) return "";
      return `<path d="${path}" class="uhc-map-country uhc-map-bin-${mapBin(item?.score)} ${selected ? "is-selected" : ""}" data-uhc-map-iso="${escapeHtml(iso)}" data-has-value="${Boolean(item)}"><title>${escapeHtml(item ? `${countryName(item)} — ${formatNumber(item.score, 0)}` : `${iso} — ${tr("noData")}`)}</title></path>`;
    }).join("");
    return `<div class="uhc-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("worldMap"))}">${paths}</svg><div class="uhc-map-legend" aria-hidden="true"><span>0</span>${[1,2,3,4,5,6].map((bin) => `<i class="uhc-map-bin-${bin}"></i>`).join("")}<span>100</span></div></div>`;
  }

  function metricCard(label, value, detail, derived = false) {
    return `<article class="uhc-metric"><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(detail || (derived ? tr("derived") : tr("official")))}</small></article>`;
  }
  function seriesItem(year) { return runtime.series?.items?.find((item) => Number(item.data_year) === Number(year)) || null; }
  function firstSeries() { return runtime.series?.items?.[0] || null; }
  function lastSeries() { const items = runtime.series?.items || []; return items[items.length - 1] || null; }
  function currentWorldScore() { return numeric(runtime.world?.country?.score); }

  function domainBars(profile = runtime.profile) {
    const rows = profile?.domains || [];
    return `<div class="uhc-domain-bars">${domainCatalog().map((catalog) => {
      const result = rows.find((item) => item.domain_code === catalog.domain_code) || {};
      const score = numeric(result.score);
      return `<button type="button" class="uhc-domain-bar" data-uhc-domain-open="${escapeHtml(catalog.domain_code)}"><span><b>${escapeHtml(domainName(catalog))}</b><small>${escapeHtml(catalog.source_code || "")}</small></span><i><em style="width:${score === null ? 0 : Math.max(0, Math.min(100, score))}%"></em></i><strong>${formatNumber(score, 0)}</strong></button>`;
    }).join("")}</div>`;
  }

  function neighborTable() {
    const rows = rankingItems();
    const index = rows.findIndex((item) => item.iso3 === runtime.country);
    const slice = rows.slice(Math.max(0, index - 2), Math.min(rows.length, index + 3));
    if (!slice.length) return `<p class="muted">${escapeHtml(tr("noData"))}</p>`;
    return `<div class="uhc-table-scroll"><table class="uhc-table"><thead><tr><th>${escapeHtml(tr("position"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th></tr></thead><tbody>${slice.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${item.derived_position ? `#${item.derived_position}` : "—"}</td><td><button type="button" class="uhc-country-link" data-uhc-country-pick="${escapeHtml(item.iso3)}">${flagMarkup(item, "uhc-flag-inline")}<span>${escapeHtml(countryName(item))}</span></button></td><td>${formatNumber(item.score, 0)}</td><td>—</td></tr>`).join("")}</tbody></table></div>`;
  }

  function overviewPanel() {
    const country = profileCountry();
    const first = firstSeries(); const last = lastSeries();
    const delta = numeric(first?.score) !== null && numeric(last?.score) !== null ? Number(last.score) - Number(first.score) : null;
    const med = median(rankingItems().map((item) => item.score));
    const score = numeric(country.score);
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-overview" aria-labelledby="uhc-tab-${runtime.instance}-overview" data-uhc-panel="overview">
      ${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}
      <div class="uhc-metric-grid">${metricCard(tr("worldBenchmark"), formatNumber(currentWorldScore(), 0), `${runtime.year} · ${tr("official")}`)}${metricCard(tr("globalMedian"), formatNumber(med, 0), tr("derived"), true)}${metricCard(tr("changeSince2000"), formatSigned(delta, 0), first && last ? `${first.data_year}–${last.data_year}` : tr("noData"))}${metricCard(tr("remainingGap"), score === null ? "—" : formatNumber(Math.max(0, 100 - score), 0), tr("percentOfScale"), true)}</div>
      <div class="uhc-overview-grid"><article class="uhc-card uhc-map-card"><div class="uhc-card-title"><div><p>${escapeHtml(tr("worldMap"))}</p><h3>${escapeHtml(String(runtime.year))}</h3></div><span>${escapeHtml(tr("mapText"))}</span></div>${mapMarkup()}</article><article class="uhc-card uhc-profile-card"><div class="uhc-card-title"><div><p>${escapeHtml(tr("domainProfile"))}</p><h3>${escapeHtml(countryName(country))}</h3></div><span>${escapeHtml(tr("scoreScale"))}</span></div>${domainBars()}</article></div>
      <article class="uhc-card"><div class="uhc-card-title"><div><p>${escapeHtml(tr("derivedOrder"))}</p><h3>${escapeHtml(tr("neighbors"))}</h3></div><span>${escapeHtml(tr("noOfficialRank"))}</span></div>${neighborTable()}</article>
    </section>`;
  }

  function radarPoints(values, radius = 106, center = 128) {
    return values.map((value, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
      const scale = Math.max(0, Math.min(1, (numeric(value) || 0) / 100));
      return `${(center + Math.cos(angle) * radius * scale).toFixed(1)},${(center + Math.sin(angle) * radius * scale).toFixed(1)}`;
    }).join(" ");
  }
  function radarChart() {
    const catalog = domainCatalog();
    const values = catalog.map((item) => domainResult(item.domain_code)?.score);
    const compareValues = catalog.map((item) => domainResult(item.domain_code, runtime.compareProfile)?.score);
    const axes = catalog.map((item, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / catalog.length); const x = 128 + Math.cos(angle) * 106; const y = 128 + Math.sin(angle) * 106;
      return `<line x1="128" y1="128" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line><text x="${(128 + Math.cos(angle) * 121).toFixed(1)}" y="${(128 + Math.sin(angle) * 121).toFixed(1)}" text-anchor="middle">${index + 1}</text>`;
    }).join("");
    const grids = [25, 50, 75, 100].map((scale) => `<polygon points="${radarPoints(catalog.map(() => scale))}"></polygon>`).join("");
    return `<div class="uhc-radar"><svg viewBox="0 0 256 256" role="img" aria-label="${escapeHtml(tr("domainProfile"))}"><g class="uhc-radar-grid">${grids}${axes}</g>${runtime.compareProfile ? `<polygon class="uhc-radar-compare" points="${radarPoints(compareValues)}"></polygon>` : ""}<polygon class="uhc-radar-primary" points="${radarPoints(values)}"></polygon></svg><div class="uhc-radar-legend"><span><i class="is-primary"></i>${escapeHtml(countryName(profileCountry()))}</span>${runtime.compareProfile ? `<span><i class="is-compare"></i>${escapeHtml(countryName(runtime.compareProfile.country))}</span>` : ""}</div></div>`;
  }
  function compareSelector() {
    return `<label class="uhc-inline-control"><span>${escapeHtml(tr("compare"))}</span><select data-uhc-compare>${countryOptions(runtime.compareCountry, true)}</select></label>`;
  }
  function domainCards() {
    const first = firstSeries(); const last = lastSeries();
    return `<div class="uhc-domain-grid">${domainCatalog().map((catalog, index) => {
      const current = domainResult(catalog.domain_code) || {};
      const compare = domainResult(catalog.domain_code, runtime.compareProfile) || {};
      const start = first?.domains?.find((item) => item.domain_code === catalog.domain_code)?.score;
      const end = last?.domains?.find((item) => item.domain_code === catalog.domain_code)?.score;
      const delta = numeric(start) !== null && numeric(end) !== null ? Number(end) - Number(start) : null;
      return `<article class="uhc-domain-card"><div class="uhc-domain-number">0${index + 1}</div><h3>${escapeHtml(domainName(catalog))}</h3><p>${escapeHtml(catalog.source_code || "")}</p><div class="uhc-domain-score"><strong>${formatNumber(current.score, 0)}</strong><span>/ 100</span></div><div class="uhc-score-track"><i style="width:${Math.max(0, Math.min(100, numeric(current.score) || 0))}%"></i></div><dl><div><dt>${escapeHtml(tr("change"))}</dt><dd>${formatSigned(delta, 0)}</dd></div>${runtime.compareProfile ? `<div><dt>${escapeHtml(tr("comparisonCountry"))}</dt><dd>${formatNumber(compare.score, 0)}</dd></div>` : ""}</dl><button type="button" class="uhc-text-button" data-uhc-domain-trend="${escapeHtml(catalog.domain_code)}">${escapeHtml(tr("trend"))} →</button></article>`;
    }).join("")}</div>`;
  }
  function domainTable() {
    return `<div class="uhc-table-scroll"><table class="uhc-table"><caption>${escapeHtml(tr("domainTable"))}</caption><thead><tr><th>#</th><th>${escapeHtml(tr("domainProfile"))}</th><th>${escapeHtml(tr("selectedCountry"))}</th>${runtime.compareProfile ? `<th>${escapeHtml(tr("comparisonCountry"))}</th>` : ""}<th>${escapeHtml(tr("officialRank"))}</th></tr></thead><tbody>${domainCatalog().map((catalog, index) => { const value = domainResult(catalog.domain_code); const compare = domainResult(catalog.domain_code, runtime.compareProfile); return `<tr><td>${index + 1}</td><td>${escapeHtml(domainName(catalog))}</td><td>${formatNumber(value?.score, 0)}</td>${runtime.compareProfile ? `<td>${formatNumber(compare?.score, 0)}</td>` : ""}<td>—</td></tr>`; }).join("")}</tbody></table></div>`;
  }
  function domainsPanel() {
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-domains" aria-labelledby="uhc-tab-${runtime.instance}-domains" data-uhc-panel="domains">${sectionHeading(tr("domainKicker"), tr("domainHeading"), tr("domainText"), compareSelector())}<div class="uhc-domain-layout"><article class="uhc-card">${radarChart()}${domainTable()}</article><div>${domainCards()}</div></div></section>`;
  }

  function trendOptions() {
    return `<option value="overall" ${runtime.trendMetric === "overall" ? "selected" : ""}>${escapeHtml(tr("overall"))}</option><option value="all_domains" ${runtime.trendMetric === "all_domains" ? "selected" : ""}>${escapeHtml(tr("allDomains"))}</option>${domainCatalog().map((item) => `<option value="${escapeHtml(item.domain_code)}" ${runtime.trendMetric === item.domain_code ? "selected" : ""}>${escapeHtml(domainName(item))}</option>`).join("")}`;
  }
  function metricValue(item, metric) {
    if (!item) return null;
    if (metric === "overall") return numeric(item.score);
    return numeric(item.domains?.find((row) => row.domain_code === metric)?.score);
  }
  function chartSeries(metric) {
    const items = runtime.series?.items || [];
    return items.map((item) => ({ year: Number(item.data_year), value: metricValue(item, metric) })).filter((item) => item.value !== null);
  }
  function linePath(points, width, height, minYear, maxYear, minValue, maxValue) {
    return points.map((point, index) => {
      const x = 58 + ((point.year - minYear) / Math.max(1, maxYear - minYear)) * (width - 86);
      const y = 24 + (1 - ((point.value - minValue) / Math.max(1, maxValue - minValue))) * (height - 66);
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }
  function chartMarkup() {
    const metrics = runtime.trendMetric === "all_domains" ? ["overall", ...domainCatalog().map((item) => item.domain_code)] : [runtime.trendMetric];
    const all = metrics.flatMap((metric) => chartSeries(metric));
    if (!all.length) return `<p class="muted">${escapeHtml(tr("noData"))}</p>`;
    const width = 920; const height = 360; const minYear = Math.min(...all.map((p) => p.year)); const maxYear = Math.max(...all.map((p) => p.year));
    const minValue = Math.max(0, Math.floor(Math.min(...all.map((p) => p.value)) / 10) * 10 - 5); const maxValue = Math.min(100, Math.ceil(Math.max(...all.map((p) => p.value)) / 10) * 10 + 5);
    const grid = [0, .25, .5, .75, 1].map((ratio) => { const value = Math.round(maxValue - ratio * (maxValue - minValue)); const y = 24 + ratio * (height - 66); return `<line x1="58" y1="${y}" x2="${width - 28}" y2="${y}"></line><text x="48" y="${y + 4}" text-anchor="end">${value}</text>`; }).join("");
    const lines = metrics.map((metric, index) => `<path class="uhc-line uhc-line-${index}" d="${linePath(chartSeries(metric), width, height, minYear, maxYear, minValue, maxValue)}"></path>`).join("");
    const labels = metrics.map((metric, index) => `<span><i class="uhc-line-${index}"></i>${escapeHtml(metric === "overall" ? tr("overall") : domainName(domainByCode(metric)))}</span>`).join("");
    return `<div class="uhc-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("trendHeading"))}"><g class="uhc-chart-grid">${grid}<text x="58" y="${height - 10}">${minYear}</text><text x="${width - 28}" y="${height - 10}" text-anchor="end">${maxYear}</text></g>${lines}</svg><div class="uhc-chart-legend">${labels}</div></div>`;
  }
  function trendSummary() {
    const metric = runtime.trendMetric === "all_domains" ? "overall" : runtime.trendMetric;
    const points = chartSeries(metric); const values = points.map((item) => item.value);
    const first = points[0]; const last = points[points.length - 1]; const delta = first && last ? last.value - first.value : null;
    return `<div class="uhc-metric-grid">${metricCard(tr("firstYear"), first ? `${first.year} · ${formatNumber(first.value, 0)}` : "—", tr("official"))}${metricCard(tr("lastYear"), last ? `${last.year} · ${formatNumber(last.value, 0)}` : "—", tr("official"))}${metricCard(tr("minimum"), values.length ? formatNumber(Math.min(...values), 0) : "—", tr("official"))}${metricCard(tr("periodDelta"), formatSigned(delta, 0), tr("official"))}</div>`;
  }
  function trendTable() {
    const items = runtime.series?.items || [];
    return `<details class="uhc-table-details"><summary>${escapeHtml(tr("trendTable"))}</summary><div class="uhc-table-scroll"><table class="uhc-table"><thead><tr><th>${escapeHtml(tr("dataYear"))}</th><th>${escapeHtml(tr("overall"))}</th>${domainCatalog().map((d) => `<th>${escapeHtml(domainName(d))}</th>`).join("")}</tr></thead><tbody>${items.map((item) => `<tr><td>${item.data_year}</td><td>${formatNumber(item.score, 0)}</td>${domainCatalog().map((d) => `<td>${formatNumber(item.domains?.find((row) => row.domain_code === d.domain_code)?.score, 0)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }
  function trendPanel() {
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-trend" aria-labelledby="uhc-tab-${runtime.instance}-trend" data-uhc-panel="trend">${sectionHeading(tr("trendKicker"), tr("trendHeading"), tr("trendText"), `<label class="uhc-inline-control"><span>${escapeHtml(tr("metric"))}</span><select data-uhc-trend-metric>${trendOptions()}</select></label>`)}${trendSummary()}<article class="uhc-card">${chartMarkup()}${trendTable()}</article></section>`;
  }

  function filteredTracers() { return tracerCatalog().filter((item) => !runtime.tracerDomain || item.domain_code === runtime.tracerDomain); }
  function tracerFilters() {
    return `<label class="uhc-inline-control"><span>${escapeHtml(tr("filterDomain"))}</span><select data-uhc-tracer-domain><option value="">${escapeHtml(tr("all"))}</option>${domainCatalog().map((item) => `<option value="${escapeHtml(item.domain_code)}" ${runtime.tracerDomain === item.domain_code ? "selected" : ""}>${escapeHtml(domainName(item))}</option>`).join("")}</select></label>`;
  }
  function tracersPanel() {
    const rows = filteredTracers();
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-tracers" aria-labelledby="uhc-tab-${runtime.instance}-tracers" data-uhc-panel="tracers">${sectionHeading(tr("tracersKicker"), tr("tracersHeading"), tr("tracersText"), tracerFilters())}<div class="uhc-tracer-groups">${domainCatalog().filter((domain) => rows.some((item) => item.domain_code === domain.domain_code)).map((domain) => `<section class="uhc-card"><div class="uhc-card-title"><div><p>${escapeHtml(domain.source_code || "")}</p><h3>${escapeHtml(domainName(domain))}</h3></div><span>${rows.filter((item) => item.domain_code === domain.domain_code).length}</span></div><div class="uhc-tracer-grid">${rows.filter((item) => item.domain_code === domain.domain_code).map((item) => `<article class="uhc-tracer-card"><div class="uhc-tracer-head"><code>${escapeHtml(item.tracer_code)}</code><span data-numeric-values="${String(Boolean(item.numeric_values_in_current_export))}">${escapeHtml(item.numeric_values_in_current_export ? tr("publicObservation") : tr("valuesUnavailable"))}</span></div><h4>${escapeHtml(tracerName(item))}</h4><dl><div><dt>${escapeHtml(tr("sourceOrganization"))}</dt><dd>${escapeHtml(item.source_organization || "—")}</dd></div><div><dt>${escapeHtml(tr("denominator"))}</dt><dd>${escapeHtml(item.denominator_population || "—")}</dd></div><div><dt>${escapeHtml(tr("direction"))}</dt><dd>${escapeHtml(item.preferred_direction === "lower_is_better_source_rescaled" ? tr("lowerRescaled") : tr("higherBetter"))}</dd></div></dl></article>`).join("")}</div></section>`).join("")}</div></section>`;
  }

  function currentRankingPayload() { return runtime.rankingMetric === "overall" && !runtime.includeAggregates ? runtime.ranking : runtime.metricRanking || runtime.ranking; }
  function rankingMetricOptions() {
    return `<option value="overall" ${runtime.rankingMetric === "overall" ? "selected" : ""}>${escapeHtml(tr("overall"))}</option>${domainCatalog().map((item) => `<option value="${escapeHtml(item.domain_code)}" ${runtime.rankingMetric === item.domain_code ? "selected" : ""}>${escapeHtml(domainName(item))}</option>`).join("")}`;
  }
  function regionOptions() {
    const values = [...new Set(rankingItems().map((item) => item.region).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), locale()));
    return `<option value="">${escapeHtml(tr("allRegions"))}</option>${values.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingRegion ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  }
  function filteredRanking() {
    const query = runtime.rankingQuery.trim().toLocaleLowerCase(locale());
    return rankingItems(currentRankingPayload()).filter((item) => {
      if (runtime.rankingRegion && item.region !== runtime.rankingRegion) return false;
      if (query && !`${countryName(item)} ${item.iso3 || ""} ${item.ref_area_label || ""}`.toLocaleLowerCase(locale()).includes(query)) return false;
      return true;
    });
  }
  function rankingFilters() {
    return `<div class="uhc-ranking-filters"><label class="is-wide"><span>${escapeHtml(tr("search"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}" data-uhc-ranking-query></label><label><span>${escapeHtml(tr("rankingMetric"))}</span><select data-uhc-ranking-metric>${rankingMetricOptions()}</select></label><label><span>${escapeHtml(tr("region"))}</span><select data-uhc-ranking-region>${regionOptions()}</select></label><label><span>${escapeHtml(tr("pageSize"))}</span><select data-uhc-ranking-size>${[10,25,50,100].map((size) => `<option value="${size}" ${size === runtime.rankingPageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" class="uhc-button uhc-button-secondary" data-uhc-action="export">${escapeHtml(tr("exportCsv"))}</button></div>`;
  }
  function rankingTable() {
    const rows = filteredRanking();
    const totalPages = Math.max(1, Math.ceil(rows.length / runtime.rankingPageSize)); runtime.rankingPage = Math.min(runtime.rankingPage, totalPages);
    const start = (runtime.rankingPage - 1) * runtime.rankingPageSize; const pageRows = rows.slice(start, start + runtime.rankingPageSize); const domainMode = runtime.rankingMetric !== "overall";
    return `<div class="uhc-ranking-summary"><span>${escapeHtml(tr("shown"))}: <b>${formatNumber(rows.length, 0)}</b></span><span class="is-derived">${escapeHtml(tr("derivedOrder"))}</span></div><div class="uhc-table-scroll"><table class="uhc-table uhc-ranking-table"><thead><tr><th>${escapeHtml(tr("position"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(domainMode ? tr("domainScore") : tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("region"))}</th></tr></thead><tbody>${pageRows.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${item.derived_position ? `#${item.derived_position}` : "—"}</td><td><button type="button" class="uhc-country-link" data-uhc-country-pick="${escapeHtml(item.iso3 || "")}">${flagMarkup(item, "uhc-flag-inline")}<span><b>${escapeHtml(countryName(item))}</b><small>${escapeHtml(item.iso3 || "")}</small></span></button></td><td>${formatNumber(item.score, 0)}</td><td>—</td><td>${escapeHtml(item.region || "—")}</td></tr>`).join("")}</tbody></table></div><div class="uhc-pagination"><button type="button" data-uhc-page="${Math.max(1, runtime.rankingPage - 1)}" ${runtime.rankingPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${runtime.rankingPage} / ${totalPages}</span><button type="button" data-uhc-page="${Math.min(totalPages, runtime.rankingPage + 1)}" ${runtime.rankingPage >= totalPages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div>`;
  }
  function rankingPanel() {
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-ranking" aria-labelledby="uhc-tab-${runtime.instance}-ranking" data-uhc-panel="ranking">${sectionHeading(tr("rankingKicker"), tr("rankingHeading"), tr("rankingText"))}<article class="uhc-card">${rankingFilters()}${rankingTable()}</article></section>`;
  }

  function auditModel() {
    const audit = runtime.audit?.audit || runtime.audit || {}; const release = currentRelease();
    return { audit, release, ok: audit.ok === true || audit.publication_gate?.ok === true, issues: audit.issues || [], gate: audit.publication_gate || {} };
  }
  function methodologyPanel() {
    const model = auditModel(); const sources = runtime.metadata?.official_sources || {};
    const principles = [[tr("principleComposite"),tr("principleCompositeText")],[tr("principleNotPercent"),tr("principleNotPercentText")],[tr("principleNoRank"),tr("principleNoRankText")],[tr("principleRevision"),tr("principleRevisionText")]];
    return `<section class="uhc-panel" role="tabpanel" tabindex="0" id="uhc-panel-${runtime.instance}-methodology" aria-labelledby="uhc-tab-${runtime.instance}-methodology" data-uhc-panel="methodology">${sectionHeading(tr("methodologyKicker"), tr("methodologyHeading"), tr("methodologyText"))}<div class="uhc-method-grid">${principles.map(([title,text],index) => `<article class="uhc-method-card"><span>0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div><div class="uhc-method-layout"><article class="uhc-card"><div class="uhc-card-title"><div><p>${escapeHtml(tr("framework"))}</p><h3>4 + 14</h3></div><span>${escapeHtml(tr("scoreScale"))}</span></div>${domainCatalog().map((domain) => `<details open><summary><b>${escapeHtml(domainName(domain))}</b><span>${tracerCatalog().filter((item) => item.domain_code === domain.domain_code).length}</span></summary><ul>${tracerCatalog().filter((item) => item.domain_code === domain.domain_code).map((item) => `<li><span>${escapeHtml(tracerName(item))}</span><small>${escapeHtml(item.source_organization || "")}</small></li>`).join("")}</ul></details>`).join("")}</article><article class="uhc-card uhc-audit-card"><div class="uhc-card-title"><div><p>${escapeHtml(tr("sourcesAudit"))}</p><h3>${escapeHtml(model.ok ? tr("auditPassed") : tr("auditReview"))}</h3></div><span class="${model.ok ? "is-passed" : "is-review"}">${escapeHtml(tr("publicationGate"))}</span></div><dl class="uhc-audit-list"><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(runtime.metadata?.publisher || tr("publisher"))}</dd></div><div><dt>${escapeHtml(tr("release"))}</dt><dd>${escapeHtml(model.release.edition_name || String(runtime.year || "—"))}</dd></div><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd><code>${escapeHtml(runtime.ranking?.release_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(model.release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(model.release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(model.release.transform_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("importerVersion"))}</dt><dd>${escapeHtml(model.release.importer_version || "—")}</dd></div></dl><div class="uhc-source-links">${externalLink(sources.indicator_page, tr("officialSource"))}${externalLink(sources.dataset, tr("dataset"))}${externalLink(sources.who_report || sources.report_pdf, tr("report"))}${externalLink(sources.csv, tr("csvSource"))}</div></article></div></section>`;
  }

  function activePanel() {
    if (runtime.view === "domains") return domainsPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "tracers") return tracersPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "methodology") return methodologyPanel();
    return overviewPanel();
  }
  function inactivePanels() {
    return VIEW_KEYS.filter((view) => view !== runtime.view).map((view) => `<div role="tabpanel" id="uhc-panel-${runtime.instance}-${view}" aria-labelledby="uhc-tab-${runtime.instance}-${view}" data-uhc-panel="${view}" hidden></div>`).join("");
  }
  function renderAvailable() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `<section class="uhc-workspace" data-uhc-state="available" aria-live="polite">${hero()}${controlBar()}${tabs()}<div class="uhc-view-stage">${activePanel()}${inactivePanels()}</div></section>`;
    bindEvents();
  }

  function provenanceHtml() {
    const country = profileCountry(); const p = country.provenance || {}; const release = currentRelease();
    const rows = [["ISO3",country.iso3],[tr("dataYear"),country.data_year],[tr("sourceSheet"),p.source_sheet],[tr("sourceRows"),p.source_row],[tr("sourceStructure"),p.structure_id],[tr("releaseId"),runtime.ranking?.release_id],[tr("rawSnapshot"),release.raw_snapshot_sha256],[tr("transformId"),release.transform_id]];
    return `<dialog class="uhc-dialog" data-uhc-dialog><div class="uhc-dialog-head"><div><p>${escapeHtml(tr("provenance"))}</p><h2>${escapeHtml(countryName(country))} · ${escapeHtml(String(runtime.year))}</h2></div><button type="button" data-uhc-dialog-close aria-label="Close">×</button></div><dl>${rows.map(([k,v]) => `<div><dt>${escapeHtml(k)}</dt><dd><code>${escapeHtml(v ?? "—")}</code></dd></div>`).join("")}</dl></dialog>`;
  }
  function openProvenance() {
    const existing = runtime.root?.querySelector("[data-uhc-dialog]"); if (existing) existing.remove();
    runtime.root?.insertAdjacentHTML("beforeend", provenanceHtml());
    const dialog = runtime.root?.querySelector("[data-uhc-dialog]");
    if (!dialog) return;
    dialog.querySelector("[data-uhc-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("close", () => dialog.remove(), { once: true }); dialog.showModal();
  }
  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try { await navigator.clipboard.writeText(window.location.href); notify(tr("copied")); }
    catch (_) { notify(window.location.href); }
  }
  function csvCell(value) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function exportRanking() {
    const domainMode = runtime.rankingMetric !== "overall";
    const rows = filteredRanking();
    const csv = [["derived_position","official_rank","iso3","country","year",domainMode ? "domain_code" : "metric","score","order_semantics"], ...rows.map((item) => [item.derived_position,"",item.iso3,countryName(item),runtime.year,domainMode ? runtime.rankingMetric : "overall",item.score,domainMode ? DERIVED_DOMAIN_ORDER : DERIVED_OVERALL_ORDER])].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `uhc-sci-${runtime.year}-${runtime.rankingMetric}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function setView(view, { focusTab = false, focusPanel = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    runtime.view = view; renderAvailable(); updateDeepLink({ notifyHost: false });
    requestAnimationFrame(() => {
      if (focusTab) runtime.root?.querySelector(`[data-uhc-view="${view}"]`)?.focus();
      if (focusPanel) runtime.root?.querySelector(`[data-uhc-panel="${view}"]`)?.focus();
    });
  }
  function rerenderStage({ focusSelector = "", cursor = null } = {}) {
    renderAvailable();
    if (focusSelector) requestAnimationFrame(() => { const el = runtime.root?.querySelector(focusSelector); el?.focus(); if (cursor !== null && typeof el?.setSelectionRange === "function") el.setSelectionRange(cursor, cursor); });
  }
  function handleTabKeydown(event) {
    if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
    event.preventDefault(); const index = VIEW_KEYS.indexOf(event.currentTarget.dataset.uhcView); let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % VIEW_KEYS.length; if (event.key === "ArrowLeft") next = (index - 1 + VIEW_KEYS.length) % VIEW_KEYS.length; if (event.key === "Home") next = 0; if (event.key === "End") next = VIEW_KEYS.length - 1;
    setView(VIEW_KEYS[next], { focusTab: true });
  }

  function bindEvents() {
    const root = runtime.root; if (!root) return;
    root.querySelectorAll("[data-uhc-country]").forEach((select) => { select.onchange = (event) => changeCountry(event.target.value); });
    root.querySelectorAll("[data-uhc-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-uhc-view]").forEach((button) => { button.onclick = () => setView(button.dataset.uhcView, { focusTab: true }); button.onkeydown = handleTabKeydown; });
    root.querySelectorAll('[data-uhc-action="share"]').forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll('[data-uhc-action="provenance"]').forEach((button) => { button.onclick = openProvenance; });
    root.querySelectorAll('[data-uhc-action="export"]').forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-uhc-country-pick]").forEach((button) => { button.onclick = async () => { await changeCountry(button.dataset.uhcCountryPick); if (runtime.view === "ranking") setView("overview", { focusPanel: true }); }; });
    root.querySelectorAll('[data-uhc-map-iso][data-has-value="true"]').forEach((path) => { path.style.cursor = "pointer"; path.onclick = () => changeCountry(path.dataset.uhcMapIso); });
    root.querySelectorAll("[data-uhc-domain-open]").forEach((button) => { button.onclick = () => { runtime.selectedDomain = button.dataset.uhcDomainOpen; runtime.trendMetric = runtime.selectedDomain; setView("domains", { focusPanel: true }); updateDeepLink({ notifyHost: false }); }; });
    root.querySelectorAll("[data-uhc-domain-trend]").forEach((button) => { button.onclick = () => { runtime.trendMetric = button.dataset.uhcDomainTrend; setView("trend", { focusPanel: true }); }; });
    root.querySelectorAll("[data-uhc-compare]").forEach((select) => { select.onchange = (event) => changeCompare(event.target.value); });
    root.querySelectorAll("[data-uhc-trend-metric]").forEach((select) => { select.onchange = (event) => { runtime.trendMetric = event.target.value; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-uhc-trend-metric]" }); }; });
    root.querySelectorAll("[data-uhc-tracer-domain]").forEach((select) => { select.onchange = (event) => { runtime.tracerDomain = event.target.value; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-uhc-tracer-domain]" }); }; });
    root.querySelectorAll("[data-uhc-ranking-metric]").forEach((select) => { select.onchange = (event) => selectRankingMetric(event.target.value); });
    root.querySelectorAll("[data-uhc-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-uhc-ranking-region]" }); }; });
    root.querySelectorAll("[data-uhc-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-uhc-ranking-size]" }); }; });
    const search = root.querySelector("[data-uhc-ranking-query]"); if (search) search.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-uhc-ranking-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-uhc-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage = Number(button.dataset.uhcPage); rerenderStage(); runtime.root?.querySelector(".uhc-ranking-table")?.scrollIntoView({ block: "start" }); }; });
  }

  function render(context = {}) {
    if (!context.root) throw new Error("GIRUHCServiceCoverage.render requires root");
    runtime.abortController?.abort(); runtime.detailController?.abort();
    runtime.root = context.root; runtime.context = context; runtime.lang = context.lang === "en" ? "en" : "ru"; runtime.theme = context.theme || document.documentElement.dataset.theme || "dark"; runtime.instance += 1;
    const link = deepLink(); runtime.view = link.view || "overview"; runtime.country = link.country || String(context.country || "").toUpperCase(); if (!runtime.country) return; runtime.year = link.year || (Number(context.year) || null); runtime.compareCountry = link.compare || ""; runtime.selectedDomain = link.domain || runtime.selectedDomain; runtime.trendMetric = link.trendMetric || "overall"; runtime.rankingMetric = link.rankingMetric || "overall"; runtime.tracerDomain = link.tracerDomain || ""; runtime.metricRanking = null; runtime.compareProfile = null;
    return loadWorkspace();
  }
  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort(); runtime.detailController?.abort();
    if (hard) { metadataCache.clear(); geoCache.value = null; geoCache.promise = null; }
    runtime.status = runtime.metadata = runtime.releases = runtime.years = runtime.domains = runtime.tracers = runtime.ranking = runtime.metricRanking = runtime.profile = runtime.compareProfile = runtime.series = runtime.world = runtime.audit = null;
  }

  window.GIRUHCServiceCoverage = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    semantics: Object.freeze({ score: SCORE_SEMANTICS, overallOrder: DERIVED_OVERALL_ORDER, domainOrder: DERIVED_DOMAIN_ORDER, officialRankAvailable: false, numeric_values_in_current_export: TRACER_NUMERIC_VALUES_IN_CURRENT_EXPORT }),
    _test: Object.freeze({ numeric, median, escapeHtml, coverageBand, featureIso, geometryPath, mapBin, metricValue }),
  });
})();
