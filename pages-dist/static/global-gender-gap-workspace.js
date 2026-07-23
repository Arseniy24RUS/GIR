/* GIR Society Stage 08 — Global Gender Gap Index analytical workspace */
(() => {
  "use strict";

  const MODULE_VERSION = "gggi-frontend/8.0.0";
  const API = "/api/gender-gap";
  const VIEW_KEYS = ["overview", "dimensions", "indicators", "trend", "ranking", "methodology"];
  const MAP_URLS = ["/static/world_countries_lite.geojson", "/static/world_countries.geojson", "/world.geojson"];
  const OFFICIAL_ORDER = "official_world_economic_forum_rank";
  const DERIVED_SUBINDEX_ORDER = "derived_gir_subindex_score_sort_not_official_country_rank";
  const DERIVED_INDICATOR_ORDER = "derived_gir_indicator_score_sort_not_official_country_rank";
  const RANKING_INPUT_SEMANTICS = "ranking_input: official overall score only; subindices and indicators remain analytical dimensions";
  // Mutable country, ranking, profile and audit responses use cache: "no-store".

  const TEXT = {
    ru: {
      group: "Общество и человеческое развитие",
      indexName: "Глобальный индекс гендерного разрыва",
      shortName: "GGGI",
      reportName: "Global Gender Gap Report",
      lead: "Официальная оценка гендерного паритета по четырём измерениям и 14 показателям — с сохранением опубликованных мест, исходных значений женщин и мужчин и полного provenance.",
      loading: "Формируем профиль гендерного паритета",
      loadingDetail: "Проверяем опубликованную редакцию, четыре субиндекса, 14 показателей и происхождение каждой записи.",
      notLoaded: "Интерфейс готов, но опубликованная редакция Global Gender Gap Index пока отсутствует",
      notLoadedDetail: "Импортируйте официальный экспорт WEF, проверьте его командой validate и пройдите publication gate. До публикации числовые значения не показываются.",
      error: "Не удалось открыть Global Gender Gap Index",
      retry: "Повторить загрузку",
      officialSource: "Официальный отчёт",
      dashboard: "Интерактивный dashboard",
      methodologyLink: "Методология",
      country: "Экономика",
      year: "Год",
      share: "Скопировать ссылку",
      provenance: "Происхождение значения",
      copied: "Ссылка скопирована",
      overview: "Обзор",
      dimensions: "4 измерения",
      indicators: "14 показателей",
      trend: "Динамика",
      ranking: "Рейтинг",
      methodology: "Методология",
      officialEdition: "Официальная редакция WEF",
      scoreClosed: "гендерного разрыва закрыто",
      rawScore: "Официальный score 0–1",
      officialRank: "Официальное место",
      economies: "Экономик в выпуске",
      indicatorsAvailable: "Доступных показателей",
      overviewKicker: "Обзор",
      overviewHeading: "Насколько экономика приблизилась к гендерному паритету",
      overviewText: "Индекс измеряет относительные разрывы между женщинами и мужчинами, а не абсолютный уровень развития. GIR помогает читать распределение, но не пересчитывает официальный score или rank.",
      worldMap: "Мировая карта",
      mapText: "Цвет показывает официальный общий score. Экономики без сопоставимого ISO3 остаются в таблице, но не размещаются на карте.",
      mapUnavailable: "Локальная геометрия карты недоступна. Рейтинг и профиль экономики продолжают работать.",
      globalMedian: "Медиана выборки",
      percentile: "Положение в распределении",
      changeSinceFirst: "Изменение с первого доступного года",
      remainingGap: "Оставшийся разрыв",
      analyticalGir: "Аналитический ориентир GIR",
      fourDimensions: "Профиль четырёх измерений",
      neighbors: "Соседи по официальному рейтингу",
      openProfile: "Открыть профиль",
      noData: "Нет данных",
      dimensionsKicker: "Архитектура индекса",
      dimensionsHeading: "Четыре равновзвешенных измерения",
      dimensionsText: "Общий score — простое среднее четырёх официальных субиндексов. Их внутренние показатели имеют веса WEF и ограничиваются соответствующим benchmark паритета.",
      score: "Score",
      rank: "Место",
      gapToParity: "До benchmark паритета",
      compare: "Сравнить с экономикой",
      noComparison: "Без сравнения",
      selectedEconomy: "Выбранная экономика",
      comparisonEconomy: "Экономика сравнения",
      radarAlternative: "Табличная альтернатива профиля",
      dimensionIndicators: "Показатели измерения",
      showIndicators: "Открыть показатели",
      indicatorsKicker: "Детализация",
      indicatorsHeading: "Четырнадцать официальных показателей",
      indicatorsText: "Score показателя — отношение значения женщин к значению мужчин, ограниченное benchmark паритета. Исходные значения могут иметь разные единицы и не должны сравниваться между показателями.",
      filterDimension: "Измерение",
      allDimensions: "Все измерения",
      selectedIndicator: "Карточка выбранного показателя",
      femaleValue: "Значение женщин",
      maleValue: "Значение мужчин",
      femaleMaleGap: "Разница в исходных значениях",
      observationPeriod: "Период наблюдения",
      dataSource: "Источник данных",
      parityBenchmark: "Benchmark паритета",
      officialWeight: "Официальный вес внутри субиндекса",
      indicatorRank: "Официальное место показателя",
      scoreInterpretation: "Доля пути к benchmark паритета",
      openTrend: "Открыть динамику показателя",
      missingRaw: "Исходное значение не опубликовано",
      trendKicker: "Динамика",
      trendHeading: "Траектория в пределах одной редакции данных",
      trendText: "Показываются только официально импортированные значения одного release_id. Разные ежегодные редакции не сшиваются автоматически, а движение места не является интервальной шкалой.",
      metric: "Показатель",
      overallScore: "Общий score",
      overallRank: "Официальное место",
      firstYear: "Первый год",
      lastYear: "Последний год",
      minimum: "Минимум",
      maximum: "Максимум",
      periodDelta: "Изменение",
      seriesTable: "Табличная версия временного ряда",
      sourcePeriod: "Период источника",
      rankingKicker: "Рейтинг",
      rankingHeading: "Официальный мировой рейтинг и аналитические срезы",
      rankingText: "Основной порядок сохраняет опубликованное место WEF. Сортировка по субиндексу или показателю является производным порядком GIR и не меняет official rank.",
      rankingMetric: "Срез рейтинга",
      overallOfficial: "Общий индекс — официальный порядок",
      search: "Поиск экономики или ISO3",
      searchPlaceholder: "Например, Исландия или ISL",
      region: "Регион",
      allRegions: "Все регионы",
      income: "Группа дохода",
      allIncome: "Все группы дохода",
      pageSize: "Строк на странице",
      exportCsv: "Экспорт CSV",
      shown: "Показано",
      selectedMetricScore: "Score выбранного среза",
      selectedMetricRank: "Опубликованное место среза",
      officialRankPreserved: "Official rank сохраняется без пересчёта",
      derivedOrder: "Производный порядок GIR — не официальный рейтинг",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      methodologyKicker: "Методология и аудит",
      methodologyHeading: "Что измеряет Global Gender Gap Index",
      methodologyText: "Интерфейс разделяет относительные разрывы, официальные score/rank, исходные значения, специальные benchmark здоровья и технический provenance.",
      gapsNotLevels: "Разрывы, а не уровни",
      gapsNotLevelsText: "Индекс сравнивает положение женщин относительно мужчин внутри экономики и не вознаграждает высокий абсолютный уровень дохода, образования или здоровья сам по себе.",
      outcomesNotInputs: "Результаты, а не ресурсы",
      outcomesNotInputsText: "Методология концентрируется на наблюдаемых результатах и не смешивает их с политиками, расходами или институциональными намерениями.",
      parityCapping: "Односторонняя шкала паритета",
      parityCappingText: "Отношения ограничиваются benchmark: превышение паритета не повышает score. Для двух медицинских показателей применяются специальные границы.",
      officialRanking: "Официальный rank не пересчитывается",
      officialRankingText: "При аналитической сортировке по субиндексу или показателю опубликованное место остаётся отдельным полем и не подменяется порядком GIR.",
      inclusionRule: "Правило включения",
      inclusionRuleText: "Экономика получает общий score при наличии достаточно свежих данных как минимум по 12 из 14 показателей.",
      healthBenchmarks: "Специальные benchmark здоровья",
      sexRatioBenchmark: "Соотношение полов при рождении",
      lifeBenchmark: "Ожидаемая продолжительность здоровой жизни",
      framework: "Структура индекса",
      sourcesAudit: "Источник и аудит",
      publisher: "Издатель",
      release: "Редакция",
      releaseId: "Release ID",
      retrievedAt: "Получено",
      rawSnapshot: "SHA-256 raw snapshot",
      transformId: "Transform ID",
      importerVersion: "Версия импортёра",
      publicationGate: "Publication gate",
      snapshotCheck: "Проверка snapshot",
      auditPassed: "Проверки пройдены",
      auditFailed: "Нужна проверка",
      validationIssues: "Замечания импорта",
      noIssues: "Нет блокирующих ошибок",
      sourceRow: "Исходная строка",
      sourceSheet: "Исходный лист",
      mappingMethod: "Метод сопоставления",
      entityKey: "Entity key",
      officialValue: "Официальное значение источника",
      close: "Закрыть",
      keyboardTabs: "Используйте стрелки влево и вправо, Home и End для перехода между разделами.",
      downloadName: "global-gender-gap-ranking",
      percentClosed: "закрыто",
      fullParity: "Benchmark паритета",
      notApplicable: "н/д",
      scoreScale: "Шкала 0–1",
      official: "Официальное значение WEF",
      girDerived: "Производная аналитика GIR",
    },
    en: {
      group: "Society & human development",
      indexName: "Global Gender Gap Index",
      shortName: "GGGI",
      reportName: "Global Gender Gap Report",
      lead: "Official gender-parity results across four dimensions and 14 indicators, preserving published ranks, women’s and men’s source values and end-to-end provenance.",
      loading: "Building the gender-parity profile",
      loadingDetail: "Checking the published edition, four subindices, 14 indicators and the provenance of every record.",
      notLoaded: "The workspace is ready, but no Global Gender Gap Index edition has been published",
      notLoadedDetail: "Import an official WEF export, validate it and pass the publication gate. No country values are shown before publication.",
      error: "Global Gender Gap Index could not be opened",
      retry: "Try again",
      officialSource: "Official report",
      dashboard: "Interactive dashboard",
      methodologyLink: "Methodology",
      country: "Economy",
      year: "Year",
      share: "Copy link",
      provenance: "Value provenance",
      copied: "Link copied",
      overview: "Overview",
      dimensions: "4 dimensions",
      indicators: "14 indicators",
      trend: "Trends",
      ranking: "Ranking",
      methodology: "Methodology",
      officialEdition: "Official WEF edition",
      scoreClosed: "of the gender gap closed",
      rawScore: "Official score 0–1",
      officialRank: "Official rank",
      economies: "Economies in edition",
      indicatorsAvailable: "Available indicators",
      overviewKicker: "Overview",
      overviewHeading: "How close an economy is to gender parity",
      overviewText: "The index measures relative gaps between women and men, not absolute development levels. GIR helps read the distribution without recomputing the official score or rank.",
      worldMap: "World map",
      mapText: "Colour represents the official overall score. Economies without a comparable ISO3 remain in the table but are not placed on the map.",
      mapUnavailable: "Local map geometry is unavailable. Ranking and economy profile remain functional.",
      globalMedian: "Sample median",
      percentile: "Position in distribution",
      changeSinceFirst: "Change since first available year",
      remainingGap: "Remaining gap",
      analyticalGir: "GIR analytical reference",
      fourDimensions: "Four-dimension profile",
      neighbors: "Official-ranking neighbours",
      openProfile: "Open profile",
      noData: "No data",
      dimensionsKicker: "Index architecture",
      dimensionsHeading: "Four equally weighted dimensions",
      dimensionsText: "The overall score is the simple average of four official subindices. Indicators within each subindex carry WEF weights and are capped at the relevant parity benchmark.",
      score: "Score",
      rank: "Rank",
      gapToParity: "Distance to parity benchmark",
      compare: "Compare with economy",
      noComparison: "No comparison",
      selectedEconomy: "Selected economy",
      comparisonEconomy: "Comparison economy",
      radarAlternative: "Tabular profile alternative",
      dimensionIndicators: "Dimension indicators",
      showIndicators: "Open indicators",
      indicatorsKicker: "Detail",
      indicatorsHeading: "Fourteen official indicators",
      indicatorsText: "An indicator score is the women-to-men ratio capped at the parity benchmark. Source values use different units and should not be compared across indicators.",
      filterDimension: "Dimension",
      allDimensions: "All dimensions",
      selectedIndicator: "Selected indicator card",
      femaleValue: "Women’s value",
      maleValue: "Men’s value",
      femaleMaleGap: "Difference in source values",
      observationPeriod: "Observation period",
      dataSource: "Data source",
      parityBenchmark: "Parity benchmark",
      officialWeight: "Official weight within subindex",
      indicatorRank: "Official indicator rank",
      scoreInterpretation: "Share of path to the parity benchmark",
      openTrend: "Open indicator trend",
      missingRaw: "Source value not published",
      trendKicker: "Trends",
      trendHeading: "Trajectory within one data release",
      trendText: "Only officially imported values from one release_id are displayed. Annual editions are not spliced automatically, and rank movement is not an interval scale.",
      metric: "Metric",
      overallScore: "Overall score",
      overallRank: "Official rank",
      firstYear: "First year",
      lastYear: "Last year",
      minimum: "Minimum",
      maximum: "Maximum",
      periodDelta: "Change",
      seriesTable: "Tabular time-series alternative",
      sourcePeriod: "Source period",
      rankingKicker: "Ranking",
      rankingHeading: "Official world ranking and analytical cuts",
      rankingText: "The default order preserves the published WEF rank. Ordering by a subindex or indicator is a derived GIR view and does not alter official rank.",
      rankingMetric: "Ranking cut",
      overallOfficial: "Overall index — official order",
      search: "Search economy or ISO3",
      searchPlaceholder: "For example Iceland or ISL",
      region: "Region",
      allRegions: "All regions",
      income: "Income group",
      allIncome: "All income groups",
      pageSize: "Rows per page",
      exportCsv: "Export CSV",
      shown: "Shown",
      selectedMetricScore: "Selected-cut score",
      selectedMetricRank: "Published rank for cut",
      officialRankPreserved: "Official rank is preserved without recomputation",
      derivedOrder: "Derived GIR ordering — not an official ranking",
      previous: "Previous",
      next: "Next",
      page: "Page",
      methodologyKicker: "Methodology and audit",
      methodologyHeading: "What the Global Gender Gap Index measures",
      methodologyText: "The workspace separates relative gaps, official scores/ranks, source values, special health benchmarks and technical provenance.",
      gapsNotLevels: "Gaps, not levels",
      gapsNotLevelsText: "The index compares women’s outcomes with men’s within an economy and does not reward high absolute income, education or health levels by themselves.",
      outcomesNotInputs: "Outcomes, not inputs",
      outcomesNotInputsText: "The methodology focuses on observed outcomes rather than policies, spending or institutional intentions.",
      parityCapping: "One-sided parity scale",
      parityCappingText: "Ratios are capped at the benchmark: exceeding parity does not raise the score. Two health indicators use special caps.",
      officialRanking: "Official rank is never recomputed",
      officialRankingText: "When an analytical subindex or indicator order is used, the published rank remains a separate field and is never replaced by GIR order.",
      inclusionRule: "Economy inclusion rule",
      inclusionRuleText: "An economy receives an overall score when sufficiently recent data are available for at least 12 of 14 indicators.",
      healthBenchmarks: "Special health benchmarks",
      sexRatioBenchmark: "Sex ratio at birth",
      lifeBenchmark: "Healthy life expectancy",
      framework: "Index framework",
      sourcesAudit: "Source and audit",
      publisher: "Publisher",
      release: "Edition",
      releaseId: "Release ID",
      retrievedAt: "Retrieved",
      rawSnapshot: "Raw snapshot SHA-256",
      transformId: "Transform ID",
      importerVersion: "Importer version",
      publicationGate: "Publication gate",
      snapshotCheck: "Snapshot check",
      auditPassed: "Checks passed",
      auditFailed: "Review required",
      validationIssues: "Import issues",
      noIssues: "No blocking errors",
      sourceRow: "Source row",
      sourceSheet: "Source sheet",
      mappingMethod: "Mapping method",
      entityKey: "Entity key",
      officialValue: "Official source value",
      close: "Close",
      keyboardTabs: "Use Left/Right arrows, Home and End to move between sections.",
      downloadName: "global-gender-gap-ranking",
      percentClosed: "closed",
      fullParity: "Parity benchmark",
      notApplicable: "n/a",
      scoreScale: "0–1 scale",
      official: "Official WEF value",
      girDerived: "Derived GIR analysis",
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
    selectedSubindex: "economic_participation",
    selectedIndicator: "labour_force_participation",
    compareCountry: "",
    rankingMetric: "overall",
    rankingQuery: "",
    rankingRegion: "",
    rankingIncome: "",
    rankingPage: 1,
    rankingPageSize: 25,
    trendMetric: "overall_score",
    status: null,
    metadata: null,
    releases: null,
    years: null,
    subindexes: null,
    indicators: null,
    ranking: null,
    metricRanking: null,
    profile: null,
    compareProfile: null,
    series: null,
    indicatorSeries: null,
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
  function formatNumber(value, digits = 3) {
    const number = numeric(value);
    if (number === null) return "—";
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number);
  }
  function formatInteger(value) {
    const number = numeric(value);
    return number === null ? "—" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(number);
  }
  function formatPercent(value, digits = 1) {
    const number = numeric(value);
    if (number === null) return "—";
    return new Intl.NumberFormat(locale(), { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number);
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
    if (score >= 0.8) return "high";
    if (score >= 0.65) return "mid";
    if (score >= 0.5) return "low";
    return "critical";
  }
  function countryName(item) {
    if (!item) return "—";
    if (runtime.lang === "ru") return item.name_ru || item.country_name_ru || item.economy_name_source || item.name_en || item.iso3 || item.entity_key || "—";
    return item.name_en || item.country_name_en || item.economy_name_source || item.name_ru || item.iso3 || item.entity_key || "—";
  }
  function subindexName(item) {
    if (!item) return "—";
    return runtime.lang === "ru" ? (item.name_ru || item.name_en || item.subindex_code) : (item.name_en || item.name_ru || item.subindex_code);
  }
  function indicatorName(item) {
    if (!item) return "—";
    return runtime.lang === "ru" ? (item.name_ru || item.name_en || item.indicator_code) : (item.name_en || item.name_ru || item.indicator_code);
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
    const view = params.get("gggi_view") || (VIEW_KEYS.includes(params.get("view")) ? params.get("view") : null);
    const year = Number(params.get("gggi_year") || params.get("year"));
    const country = params.get("gggi_country") || params.get("country");
    return {
      view: VIEW_KEYS.includes(view) ? view : null,
      country: country ? String(country).toUpperCase() : null,
      year: Number.isFinite(year) ? year : null,
      subindex: params.get("gggi_subindex") || null,
      indicator: params.get("gggi_indicator") || null,
      compare: params.get("gggi_compare") ? String(params.get("gggi_compare")).toUpperCase() : "",
      rankingMetric: params.get("gggi_ranking_metric") || params.get("gggi_metric") || null,
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("gggi_country", runtime.country);
    if (runtime.year) url.searchParams.set("gggi_year", String(runtime.year));
    url.searchParams.set("gggi_view", runtime.view);
    if (runtime.selectedSubindex) url.searchParams.set("gggi_subindex", runtime.selectedSubindex); else url.searchParams.delete("gggi_subindex");
    if (runtime.selectedIndicator) url.searchParams.set("gggi_indicator", runtime.selectedIndicator); else url.searchParams.delete("gggi_indicator");
    if (runtime.compareCountry) url.searchParams.set("gggi_compare", runtime.compareCountry); else url.searchParams.delete("gggi_compare");
    if (runtime.rankingMetric && runtime.rankingMetric !== "overall") url.searchParams.set("gggi_ranking_metric", runtime.rankingMetric); else url.searchParams.delete("gggi_ranking_metric");
    url.searchParams.delete("gggi_metric");
    url.hash = "index-GGGI";
    history.replaceState(null, "", url);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({ country: runtime.country, year: runtime.year, view: runtime.view });
    }
  }

  function flagMarkup(item, className = "gggi-flag-slot") {
    const iso3 = String(item?.iso3 || "").toUpperCase();
    const iso2 = String(item?.iso2 || item?.country_iso2 || "").toLowerCase();
    if (iso2 && /^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className}"><img data-gggi-flag src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
    }
    return `<span class="${className} is-fallback"><span aria-hidden="true">${escapeHtml(iso3 || "•")}</span></span>`;
  }

  function yearItems() { return runtime.years?.items || []; }
  function rankingItems(payload = runtime.ranking) { return payload?.items || []; }
  function selectedRankingItem() {
    return rankingItems().find((item) => item.iso3 === runtime.country) || rankingItems()[0] || null;
  }
  function profileCountry() { return runtime.profile?.country || selectedRankingItem() || {}; }
  function currentRelease() {
    const releaseId = runtime.ranking?.release_id;
    return runtime.releases?.items?.find((item) => item.release_id === releaseId) || runtime.ranking?.release || runtime.profile?.release || {};
  }
  function subindexCatalog() { return runtime.subindexes?.items || runtime.metadata?.subindexes || []; }
  function indicatorCatalog() { return runtime.indicators?.items || runtime.metadata?.indicators || []; }
  function subindexByCode(code) { return subindexCatalog().find((item) => item.subindex_code === code) || null; }
  function indicatorByCode(code) { return indicatorCatalog().find((item) => item.indicator_code === code) || null; }
  function indicatorResult(code) { return runtime.profile?.indicators?.find((item) => item.indicator_code === code) || null; }
  function subindexResult(code) { return runtime.profile?.subindexes?.find((item) => item.subindex_code === code) || null; }

  async function loadMetadata(signal) {
    if (metadataCache.has("bundle")) return metadataCache.get("bundle");
    const bundle = await Promise.all([
      fetchJson(`${API}/status`, { signal }),
      fetchJson(`${API}/metadata`, { signal, cache: "default" }),
      fetchJson(`${API}/releases`, { signal, cache: "default" }),
      fetchJson(`${API}/years`, { signal, cache: "default" }),
      fetchJson(`${API}/subindexes`, { signal, cache: "default" }),
      fetchJson(`${API}/indicators`, { signal, cache: "default" }),
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
    if (!item?.iso3) return [null, { items: [], total: 0 }];
    runtime.country = String(item.iso3).toUpperCase();
    return Promise.all([
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }),
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking.release_id }, signal }),
    ]);
  }

  async function loadWorkspace() {
    runtime.abortController?.abort();
    runtime.abortController = new AbortController();
    const signal = runtime.abortController.signal;
    renderState("loading");
    try {
      [runtime.status, runtime.metadata, runtime.releases, runtime.years, runtime.subindexes, runtime.indicators] = await loadMetadata(signal);
      if (runtime.status?.data_status !== "available" || !yearItems().length) {
        renderState("not_loaded");
        return;
      }
      const years = yearItems().map((item) => Number(item.index_year)).filter(Number.isFinite);
      if (!runtime.year || !years.includes(Number(runtime.year))) runtime.year = Math.max(...years);
      runtime.ranking = await fetchJson(`${API}/ranking`, { params: { year: runtime.year, limit: 1000 }, signal });
      if (runtime.ranking?.data_status !== "available" || !rankingItems().length) {
        renderState("not_loaded");
        return;
      }
      if (!rankingItems().some((item) => item.iso3 === runtime.country)) runtime.profile = null;
      const profileBundle = loadProfile(signal);
      [runtime.profile, runtime.series, runtime.audit, runtime.geo] = await Promise.all([
        profileBundle.then((items) => items[0]),
        profileBundle.then((items) => items[1]),
        fetchJson(`${API}/audit`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }).catch(() => null),
        loadGeo(),
      ]);
      const profileIndicators = runtime.profile?.indicators || [];
      if (!profileIndicators.some((item) => item.indicator_code === runtime.selectedIndicator)) {
        runtime.selectedIndicator = profileIndicators[0]?.indicator_code || indicatorCatalog()[0]?.indicator_code || "";
      }
      const profileSubindexes = runtime.profile?.subindexes || [];
      if (!profileSubindexes.some((item) => item.subindex_code === runtime.selectedSubindex)) {
        runtime.selectedSubindex = profileSubindexes[0]?.subindex_code || subindexCatalog()[0]?.subindex_code || "";
      }
      if (runtime.compareCountry && runtime.compareCountry !== runtime.country) {
        runtime.compareProfile = await fetchJson(`${API}/country/${encodeURIComponent(runtime.compareCountry)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }).catch(() => null);
      } else {
        runtime.compareProfile = null;
      }
      if (runtime.rankingMetric !== "overall") await loadMetricRanking(runtime.rankingMetric, signal);
      if (runtime.trendMetric.startsWith("indicator:")) await loadIndicatorSeries(runtime.trendMetric.slice("indicator:".length), signal);
      updateDeepLink({ notifyHost: true });
      renderAvailable();
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
      runtime.compareProfile = null;
      runtime.compareCountry = "";
      runtime.indicatorSeries = null;
      updateDeepLink({ notifyHost: true });
      renderAvailable();
    } catch (error) {
      if (!abortError(error)) renderState("error", error);
    }
  }

  async function changeCountry(value) {
    runtime.country = String(value || "").toUpperCase();
    await reloadProfile();
  }

  async function changeYear(value) {
    runtime.year = Number(value);
    runtime.metricRanking = null;
    await loadWorkspace();
  }

  function metricParams(metric) {
    if (!metric || metric === "overall") return {};
    if (metric.startsWith("subindex:")) return { subindex_code: metric.slice("subindex:".length) };
    if (metric.startsWith("indicator:")) return { indicator_code: metric.slice("indicator:".length) };
    return {};
  }

  async function loadMetricRanking(metric, signal = null) {
    if (!metric || metric === "overall") { runtime.metricRanking = null; return; }
    runtime.metricRanking = await fetchJson(`${API}/ranking`, {
      params: { year: runtime.year, release_id: runtime.ranking.release_id, ...metricParams(metric), limit: 1000 },
      signal,
    });
  }

  async function loadIndicatorSeries(code, signal = null) {
    if (!code || !runtime.country) { runtime.indicatorSeries = null; return; }
    runtime.indicatorSeries = await fetchJson(`${API}/indicator/${encodeURIComponent(code)}/series`, {
      params: { iso3: runtime.country, release_id: runtime.ranking.release_id },
      signal,
    });
  }

  function stateShell(kind, error = null) {
    const title = kind === "loading" ? tr("loading") : kind === "not_loaded" ? tr("notLoaded") : tr("error");
    const detail = kind === "loading" ? tr("loadingDetail") : kind === "not_loaded" ? tr("notLoadedDetail") : escapeHtml(error?.message || String(error || ""));
    const action = kind === "error" ? `<button type="button" class="gggi-button" data-gggi-action="retry">${escapeHtml(tr("retry"))}</button>` : "";
    return `<section class="gggi-workspace" data-gggi-state="${escapeHtml(kind)}"><div class="gggi-state-card" role="${kind === "error" ? "alert" : "status"}" aria-live="polite"><span class="gggi-state-code">GGGI</span><h1>${escapeHtml(title)}</h1><p>${detail}</p>${action}</div></section>`;
  }

  function renderState(kind, error = null) {
    if (!runtime.root) return;
    runtime.root.innerHTML = stateShell(kind, error);
    bindEvents();
  }

  function externalLink(url, label) {
    const safe = safeUrl(url);
    return safe ? `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>` : "";
  }

  function hero() {
    const country = profileCountry();
    const release = currentRelease();
    const score = numeric(country.score);
    const rank = numeric(country.official_rank);
    const count = runtime.ranking?.total || rankingItems().length;
    const availableIndicators = (runtime.profile?.indicators || []).filter((item) => numeric(item.score) !== null).length;
    const sources = runtime.metadata?.official_sources || {};
    return `<section class="gggi-hero">
      <div class="gggi-hero-copy">
        <div class="gggi-hero-badges"><span>${escapeHtml(tr("group"))}</span><span>${escapeHtml(release.edition_name || `${tr("reportName")} ${runtime.year || ""}`)}</span><span>${escapeHtml(String(runtime.year || "—"))}</span></div>
        <p class="gggi-kicker">${escapeHtml(tr("reportName"))}</p>
        <h1>${escapeHtml(tr("indexName"))}</h1>
        <p>${escapeHtml(tr("lead"))}</p>
        <div class="gggi-source-links">${externalLink(sources.report || sources.series, tr("officialSource"))}${externalLink(sources.dashboard, tr("dashboard"))}${externalLink(sources.methodology, tr("methodologyLink"))}</div>
      </div>
      <div class="gggi-hero-score">
        <div class="gggi-country-line">${flagMarkup(country)}<div><strong>${escapeHtml(countryName(country))}</strong><span>${escapeHtml(country.iso3 || "")}</span></div></div>
        <div class="gggi-score-block" data-tone="${scoreTone(score)}"><strong>${formatPercent(score, 1)}</strong><span>${escapeHtml(tr("scoreClosed"))}</span><small>${escapeHtml(tr("rawScore"))}: ${formatNumber(score, 3)}</small></div>
        <div class="gggi-hero-score-meta"><div><span>${escapeHtml(tr("officialRank"))}</span><strong>${rank === null ? "—" : `#${formatInteger(rank)}`}</strong></div><div><span>${escapeHtml(tr("economies"))}</span><strong>${formatInteger(count)}</strong></div><div><span>${escapeHtml(tr("indicatorsAvailable"))}</span><strong>${formatInteger(availableIndicators)} / 14</strong></div></div>
      </div>
    </section>`;
  }

  function countryOptions(selected = runtime.country, allowBlank = false) {
    const options = rankingItems().filter((item) => item.iso3).map((item) => `<option value="${escapeHtml(item.iso3)}" ${item.iso3 === selected ? "selected" : ""}>${escapeHtml(countryName(item))} · ${escapeHtml(item.iso3)}</option>`).join("");
    return `${allowBlank ? `<option value="">${escapeHtml(tr("noComparison"))}</option>` : ""}${options}`;
  }

  function yearOptions() {
    return yearItems().map((item) => `<option value="${item.index_year}" ${Number(item.index_year) === Number(runtime.year) ? "selected" : ""}>${item.index_year}</option>`).join("");
  }

  function controlBar() {
    const release = currentRelease();
    return `<div class="gggi-controls">
      <div class="gggi-control-primary">
        <label><span>${escapeHtml(tr("country"))}</span><select data-gggi-country aria-label="${escapeHtml(tr("country"))}">${countryOptions()}</select></label>
        <label><span>${escapeHtml(tr("year"))}</span><select data-gggi-year aria-label="${escapeHtml(tr("year"))}">${yearOptions()}</select></label>
        <div class="gggi-context-readout"><span>${escapeHtml(tr("officialEdition"))}</span><strong>${escapeHtml(release.edition_name || String(runtime.year || "—"))}</strong></div>
      </div>
      <div class="gggi-control-actions"><button type="button" class="gggi-button gggi-button-secondary" data-gggi-action="share">↗ ${escapeHtml(tr("share"))}</button><button type="button" class="gggi-button gggi-button-secondary" data-gggi-action="provenance">⌘ ${escapeHtml(tr("provenance"))}</button></div>
    </div>`;
  }

  function tabs() {
    return `<div class="gggi-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}">${VIEW_KEYS.map((view) => `<button type="button" role="tab" id="gggi-tab-${runtime.instance}-${view}" aria-controls="gggi-panel-${runtime.instance}-${view}" aria-selected="${runtime.view === view}" tabindex="${runtime.view === view ? "0" : "-1"}" data-gggi-view="${view}">${escapeHtml(tr(view))}</button>`).join("")}</div><p class="gggi-sr-only">${escapeHtml(tr("keyboardTabs"))}</p>`;
  }

  function sectionHeading(kicker, title, text, extra = "") {
    return `<header class="gggi-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`;
  }

  function featureIso(feature) {
    const properties = feature?.properties || {};
    return String(feature?.id || properties.iso3 || properties.ISO_A3 || properties.ADM0_A3 || properties.gu_a3 || "").toUpperCase();
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
    if (value >= 0.85) return 7;
    if (value >= 0.8) return 6;
    if (value >= 0.75) return 5;
    if (value >= 0.7) return 4;
    if (value >= 0.65) return 3;
    if (value >= 0.6) return 2;
    return 1;
  }
  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="gggi-map-fallback"><p>${escapeHtml(tr("mapUnavailable"))}</p></div>`;
    const width = 960; const height = 500;
    const scoreByIso = new Map(rankingItems().filter((item) => item.iso3).map((item) => [item.iso3, item]));
    const paths = runtime.geo.features.map((feature) => {
      const iso = featureIso(feature); const item = scoreByIso.get(iso); const path = geometryPath(feature.geometry, width, height); const selected = iso === runtime.country;
      if (!path) return "";
      return `<path d="${path}" class="gggi-map-country gggi-map-bin-${mapBin(item?.score)} ${selected ? "is-selected" : ""}" data-gggi-map-iso="${escapeHtml(iso)}" data-has-value="${Boolean(item)}"><title>${escapeHtml(item ? `${countryName(item)} — ${formatPercent(item.score, 1)}` : `${iso} — ${tr("noData")}`)}</title></path>`;
    }).join("");
    return `<div class="gggi-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("worldMap"))}">${paths}</svg><div class="gggi-map-legend" aria-hidden="true"><span>0–60%</span>${[1,2,3,4,5,6,7].map((bin) => `<i class="gggi-map-bin-${bin}"></i>`).join("")}<span>85–100%</span></div></div>`;
  }

  function metricCard(label, value, detail, derived = false) {
    return `<div class="gggi-metric"><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(detail || (derived ? tr("girDerived") : tr("official")))}</small></div>`;
  }

  function neighborTable() {
    const rows = rankingItems();
    const index = rows.findIndex((item) => item.iso3 === runtime.country);
    const slice = rows.slice(Math.max(0, index - 2), Math.min(rows.length, index + 3));
    if (!slice.length) return `<p class="muted">${escapeHtml(tr("noData"))}</p>`;
    return `<div class="gggi-table-scroll"><table class="gggi-table"><thead><tr><th>${escapeHtml(tr("rank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(tr("score"))}</th></tr></thead><tbody>${slice.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</td><td><button type="button" class="gggi-country-link" data-gggi-country-pick="${escapeHtml(item.iso3)}">${flagMarkup(item, "gggi-flag-inline")}<span>${escapeHtml(countryName(item))}</span></button></td><td>${formatPercent(item.score, 1)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function subindexBars(profile = runtime.profile) {
    const results = profile?.subindexes || [];
    return `<div class="gggi-subindex-bars">${subindexCatalog().map((catalog) => {
      const result = results.find((item) => item.subindex_code === catalog.subindex_code) || {};
      const score = numeric(result.score);
      return `<button type="button" class="gggi-subindex-bar" data-gggi-subindex-open="${escapeHtml(catalog.subindex_code)}"><span><b>${escapeHtml(subindexName(catalog))}</b><small>${result.official_rank == null ? "—" : `#${formatInteger(result.official_rank)}`}</small></span><i><em style="width:${score === null ? 0 : Math.max(0, Math.min(100, score * 100))}%"></em></i><strong>${formatPercent(score, 1)}</strong></button>`;
    }).join("")}</div>`;
  }

  function overviewPanel() {
    const country = profileCountry();
    const scores = rankingItems().map((item) => item.score);
    const med = median(scores);
    const pct = percentile(scores, country.score);
    const series = runtime.series?.items || [];
    const first = series[0]; const last = series[series.length - 1];
    const delta = numeric(first?.score) !== null && numeric(last?.score) !== null ? Number(last.score) - Number(first.score) : null;
    const remaining = numeric(country.score) === null ? null : Math.max(0, 1 - Number(country.score));
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-overview" aria-labelledby="gggi-tab-${runtime.instance}-overview" data-gggi-panel="overview">
      ${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}
      <div class="gggi-metric-grid">${metricCard(tr("globalMedian"), formatPercent(med, 1), tr("analyticalGir"), true)}${metricCard(tr("percentile"), pct === null ? "—" : `${formatNumber(pct, 0)}%`, tr("analyticalGir"), true)}${metricCard(tr("changeSinceFirst"), delta === null ? "—" : `${delta >= 0 ? "+" : ""}${formatPercent(delta, 1)}`, series.length ? `${first.index_year}–${last.index_year}` : tr("noData"), true)}${metricCard(tr("remainingGap"), formatPercent(remaining, 1), tr("analyticalGir"), true)}</div>
      <div class="gggi-overview-grid"><article class="gggi-card gggi-map-card"><div class="gggi-card-title"><div><p>${escapeHtml(tr("worldMap"))}</p><h3>${escapeHtml(tr("worldMap"))}</h3></div><span>${escapeHtml(tr("mapText"))}</span></div>${mapMarkup()}</article><article class="gggi-card gggi-profile-card"><div class="gggi-card-title"><div><p>${escapeHtml(tr("fourDimensions"))}</p><h3>${escapeHtml(countryName(country))}</h3></div><span>${escapeHtml(tr("scoreScale"))}</span></div>${subindexBars()}</article></div>
      <article class="gggi-card gggi-neighbors-card"><div class="gggi-card-title"><div><p>${escapeHtml(tr("officialRank"))}</p><h3>${escapeHtml(tr("neighbors"))}</h3></div><span>${escapeHtml(tr("officialRankPreserved"))}</span></div>${neighborTable()}</article>
    </section>`;
  }

  function radarPoints(values, radius = 108, center = 130) {
    return values.map((value, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
      const scale = Math.max(0, Math.min(1, numeric(value) || 0));
      return `${(center + Math.cos(angle) * radius * scale).toFixed(1)},${(center + Math.sin(angle) * radius * scale).toFixed(1)}`;
    }).join(" ");
  }
  function radarChart() {
    const catalog = subindexCatalog();
    const values = catalog.map((item) => subindexResult(item.subindex_code)?.score);
    const compareValues = catalog.map((item) => runtime.compareProfile?.subindexes?.find((row) => row.subindex_code === item.subindex_code)?.score);
    const axes = catalog.map((item, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / catalog.length); const x = 130 + Math.cos(angle) * 108; const y = 130 + Math.sin(angle) * 108;
      return `<line x1="130" y1="130" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line><text x="${(130 + Math.cos(angle) * 123).toFixed(1)}" y="${(130 + Math.sin(angle) * 123).toFixed(1)}" text-anchor="middle">${escapeHtml(String(index + 1))}</text>`;
    }).join("");
    const grids = [0.25, 0.5, 0.75, 1].map((scale) => `<polygon points="${radarPoints(catalog.map(() => scale))}"></polygon>`).join("");
    return `<div class="gggi-radar"><svg viewBox="0 0 260 260" role="img" aria-label="${escapeHtml(tr("fourDimensions"))}"><g class="gggi-radar-grid">${grids}${axes}</g>${runtime.compareProfile ? `<polygon class="gggi-radar-compare" points="${radarPoints(compareValues)}"></polygon>` : ""}<polygon class="gggi-radar-primary" points="${radarPoints(values)}"></polygon></svg><div class="gggi-radar-legend"><span><i class="is-primary"></i>${escapeHtml(countryName(profileCountry()))}</span>${runtime.compareProfile ? `<span><i class="is-compare"></i>${escapeHtml(countryName(runtime.compareProfile.country))}</span>` : ""}</div></div>`;
  }

  function compareSelector() {
    return `<label class="gggi-inline-control"><span>${escapeHtml(tr("compare"))}</span><select data-gggi-compare>${countryOptions(runtime.compareCountry, true)}</select></label>`;
  }

  function dimensionCards() {
    return `<div class="gggi-dimension-grid">${subindexCatalog().map((catalog, index) => {
      const result = subindexResult(catalog.subindex_code) || {};
      const score = numeric(result.score);
      const compare = runtime.compareProfile?.subindexes?.find((item) => item.subindex_code === catalog.subindex_code) || {};
      const count = indicatorCatalog().filter((item) => item.subindex_code === catalog.subindex_code).length;
      return `<article class="gggi-dimension-card"><div class="gggi-dimension-index">0${index + 1}</div><div><h3>${escapeHtml(subindexName(catalog))}</h3><div class="gggi-dimension-score"><strong>${formatPercent(score, 1)}</strong><span>${result.official_rank == null ? "—" : `#${formatInteger(result.official_rank)}`}</span></div><div class="gggi-comparison-track"><i style="width:${score === null ? 0 : Math.min(100, score * 100)}%"></i>${numeric(compare.score) !== null ? `<b style="left:${Math.min(100, Number(compare.score) * 100)}%" title="${escapeHtml(countryName(runtime.compareProfile.country))}: ${formatPercent(compare.score, 1)}"></b>` : ""}</div><dl><div><dt>${escapeHtml(tr("gapToParity"))}</dt><dd>${score === null ? "—" : formatPercent(Math.max(0, 1 - score), 1)}</dd></div><div><dt>${escapeHtml(tr("dimensionIndicators"))}</dt><dd>${count}</dd></div>${numeric(compare.score) !== null ? `<div><dt>${escapeHtml(tr("comparisonEconomy"))}</dt><dd>${formatPercent(compare.score, 1)}</dd></div>` : ""}</dl><button type="button" class="gggi-text-button" data-gggi-subindex-open="${escapeHtml(catalog.subindex_code)}">${escapeHtml(tr("showIndicators"))} →</button></div></article>`;
    }).join("")}</div>`;
  }

  function dimensionTable() {
    const compare = runtime.compareProfile;
    return `<div class="gggi-table-scroll"><table class="gggi-table"><thead><tr><th>#</th><th>${escapeHtml(tr("dimensions"))}</th><th>${escapeHtml(tr("selectedEconomy"))}</th><th>${escapeHtml(tr("rank"))}</th>${compare ? `<th>${escapeHtml(countryName(compare.country))}</th>` : ""}</tr></thead><tbody>${subindexCatalog().map((catalog, index) => {
      const result = subindexResult(catalog.subindex_code) || {}; const other = compare?.subindexes?.find((item) => item.subindex_code === catalog.subindex_code) || {};
      return `<tr><td>0${index + 1}</td><td><b>${escapeHtml(subindexName(catalog))}</b></td><td>${formatPercent(result.score, 1)}</td><td>${result.official_rank == null ? "—" : `#${formatInteger(result.official_rank)}`}</td>${compare ? `<td>${formatPercent(other.score, 1)}</td>` : ""}</tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function dimensionsPanel() {
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-dimensions" aria-labelledby="gggi-tab-${runtime.instance}-dimensions" data-gggi-panel="dimensions">
      ${sectionHeading(tr("dimensionsKicker"), tr("dimensionsHeading"), tr("dimensionsText"), compareSelector())}
      <div class="gggi-dimensions-layout"><article class="gggi-card gggi-radar-card">${radarChart()}<details><summary>${escapeHtml(tr("radarAlternative"))}</summary>${dimensionTable()}</details></article><div>${dimensionCards()}</div></div>
    </section>`;
  }

  function filteredIndicators() {
    const results = runtime.profile?.indicators || [];
    if (!runtime.selectedSubindex || runtime.selectedSubindex === "all") return results;
    return results.filter((item) => item.subindex_code === runtime.selectedSubindex);
  }

  function indicatorFilter() {
    return `<label class="gggi-inline-control"><span>${escapeHtml(tr("filterDimension"))}</span><select data-gggi-indicator-filter><option value="all" ${runtime.selectedSubindex === "all" ? "selected" : ""}>${escapeHtml(tr("allDimensions"))}</option>${subindexCatalog().map((item) => `<option value="${escapeHtml(item.subindex_code)}" ${item.subindex_code === runtime.selectedSubindex ? "selected" : ""}>${escapeHtml(subindexName(item))}</option>`).join("")}</select></label>`;
  }

  function indicatorList() {
    const rows = filteredIndicators();
    return `<div class="gggi-indicator-list" role="list">${rows.map((item) => `<button type="button" role="listitem" class="gggi-indicator-row ${item.indicator_code === runtime.selectedIndicator ? "is-selected" : ""}" data-gggi-indicator-pick="${escapeHtml(item.indicator_code)}"><span><b>${escapeHtml(indicatorName(item))}</b><small>${escapeHtml(subindexName(subindexByCode(item.subindex_code)))}</small></span><em><strong>${formatPercent(item.score, 1)}</strong><small>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</small></em></button>`).join("")}</div>`;
  }

  function rawValue(value) {
    const number = numeric(value);
    return number === null ? "—" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 3 }).format(number);
  }

  function selectedIndicatorCard() {
    const item = indicatorResult(runtime.selectedIndicator) || filteredIndicators()[0] || {};
    const catalog = indicatorByCode(item.indicator_code) || item;
    const score = numeric(item.score);
    return `<article class="gggi-card gggi-indicator-detail"><div class="gggi-card-title"><div><p>${escapeHtml(tr("selectedIndicator"))}</p><h3>${escapeHtml(indicatorName(catalog))}</h3></div><span>${escapeHtml(subindexName(subindexByCode(catalog.subindex_code)))}</span></div><div class="gggi-indicator-score"><div><strong>${formatPercent(score, 1)}</strong><span>${escapeHtml(tr("scoreInterpretation"))}</span></div><div><span>${escapeHtml(tr("indicatorRank"))}</span><strong>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</strong></div></div><div class="gggi-parity-track"><i style="width:${score === null ? 0 : Math.min(100, score * 100)}%"></i><b style="left:100%"></b></div><dl class="gggi-detail-list"><div><dt>${escapeHtml(tr("femaleValue"))}</dt><dd>${rawValue(item.female_value)}</dd></div><div><dt>${escapeHtml(tr("maleValue"))}</dt><dd>${rawValue(item.male_value)}</dd></div><div><dt>${escapeHtml(tr("femaleMaleGap"))}</dt><dd>${rawValue(item.female_male_gap)}</dd></div><div><dt>${escapeHtml(tr("parityBenchmark"))}</dt><dd>${formatNumber(catalog.parity_cap, 3)}</dd></div><div><dt>${escapeHtml(tr("officialWeight"))}</dt><dd>${formatPercent(catalog.weight, 1)}</dd></div><div><dt>${escapeHtml(tr("observationPeriod"))}</dt><dd>${escapeHtml(item.observation_period || "—")}</dd></div><div class="is-wide"><dt>${escapeHtml(tr("dataSource"))}</dt><dd>${escapeHtml(item.data_source || catalog.source_organization || "—")}</dd></div></dl><button type="button" class="gggi-button gggi-button-secondary" data-gggi-indicator-trend="${escapeHtml(item.indicator_code || "")}">${escapeHtml(tr("openTrend"))} →</button></article>`;
  }

  function indicatorsPanel() {
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-indicators" aria-labelledby="gggi-tab-${runtime.instance}-indicators" data-gggi-panel="indicators">
      ${sectionHeading(tr("indicatorsKicker"), tr("indicatorsHeading"), tr("indicatorsText"), indicatorFilter())}
      <div class="gggi-indicators-layout"><article class="gggi-card gggi-indicator-index">${indicatorList()}</article>${selectedIndicatorCard()}</div>
    </section>`;
  }

  function trendOptions() {
    return `<option value="overall_score" ${runtime.trendMetric === "overall_score" ? "selected" : ""}>${escapeHtml(tr("overallScore"))}</option><option value="overall_rank" ${runtime.trendMetric === "overall_rank" ? "selected" : ""}>${escapeHtml(tr("overallRank"))}</option>${indicatorCatalog().map((item) => `<option value="indicator:${escapeHtml(item.indicator_code)}" ${runtime.trendMetric === `indicator:${item.indicator_code}` ? "selected" : ""}>${escapeHtml(indicatorName(item))}</option>`).join("")}`;
  }

  function trendData() {
    if (runtime.trendMetric.startsWith("indicator:")) {
      return (runtime.indicatorSeries?.items || []).map((item) => ({ year: item.index_year, value: item.score, rank: item.official_rank, period: item.observation_period, source: item.data_source }));
    }
    return (runtime.series?.items || []).map((item) => ({ year: item.index_year, value: runtime.trendMetric === "overall_rank" ? item.official_rank : item.score, rank: item.official_rank, period: item.index_year }));
  }

  function chartMarkup(items, invert = false) {
    const values = items.map((item) => numeric(item.value)).filter((value) => value !== null);
    if (!values.length) return `<div class="gggi-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    const width = 920; const height = 330; const left = 60; const right = 24; const top = 24; const bottom = 48;
    let min = Math.min(...values); let max = Math.max(...values);
    if (min === max) { min -= 0.01; max += 0.01; }
    const x = (index) => left + (index / Math.max(1, items.length - 1)) * (width - left - right);
    const y = (value) => {
      const ratio = (Number(value) - min) / (max - min);
      return top + (invert ? ratio : 1 - ratio) * (height - top - bottom);
    };
    const points = items.map((item, index) => numeric(item.value) === null ? null : `${x(index).toFixed(1)},${y(item.value).toFixed(1)}`).filter(Boolean).join(" ");
    const grid = [0, 0.25, 0.5, 0.75, 1].map((step) => { const yy = top + step * (height - top - bottom); const value = invert ? min + step * (max - min) : max - step * (max - min); return `<line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}"></line><text x="${left - 10}" y="${yy + 4}" text-anchor="end">${runtime.trendMetric === "overall_rank" ? formatInteger(value) : formatPercent(value, 1)}</text>`; }).join("");
    const labels = items.map((item, index) => `<text x="${x(index)}" y="${height - 18}" text-anchor="middle">${escapeHtml(item.year)}</text>`).join("");
    const dots = items.map((item, index) => numeric(item.value) === null ? "" : `<circle cx="${x(index)}" cy="${y(item.value)}" r="4"><title>${escapeHtml(`${item.year}: ${runtime.trendMetric === "overall_rank" ? `#${formatInteger(item.value)}` : formatPercent(item.value, 1)}`)}</title></circle>`).join("");
    return `<svg class="gggi-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("trend"))}"><g class="gggi-chart-grid">${grid}${labels}</g><polyline points="${points}"></polyline><g class="gggi-chart-points">${dots}</g></svg>`;
  }

  function trendPanel() {
    const items = trendData();
    const values = items.map((item) => numeric(item.value)).filter((value) => value !== null);
    const first = items.find((item) => numeric(item.value) !== null); const last = [...items].reverse().find((item) => numeric(item.value) !== null);
    const delta = first && last ? Number(last.value) - Number(first.value) : null;
    const isRank = runtime.trendMetric === "overall_rank";
    const formatter = (value) => isRank ? (numeric(value) === null ? "—" : `#${formatInteger(value)}`) : formatPercent(value, 1);
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-trend" aria-labelledby="gggi-tab-${runtime.instance}-trend" data-gggi-panel="trend">
      ${sectionHeading(tr("trendKicker"), tr("trendHeading"), tr("trendText"), `<label class="gggi-inline-control"><span>${escapeHtml(tr("metric"))}</span><select data-gggi-trend-metric>${trendOptions()}</select></label>`)}
      <div class="gggi-metric-grid">${metricCard(tr("firstYear"), first ? String(first.year) : "—", first ? formatter(first.value) : "—")}${metricCard(tr("lastYear"), last ? String(last.year) : "—", last ? formatter(last.value) : "—")}${metricCard(tr("periodDelta"), delta === null ? "—" : `${delta >= 0 ? "+" : ""}${isRank ? formatNumber(delta, 0) : formatPercent(delta, 1)}`, tr("girDerived"), true)}${metricCard(tr("minimum"), values.length ? formatter(Math.min(...values)) : "—", tr("girDerived"), true)}${metricCard(tr("maximum"), values.length ? formatter(Math.max(...values)) : "—", tr("girDerived"), true)}</div>
      <article class="gggi-card gggi-chart-card">${chartMarkup(items, isRank)}<details><summary>${escapeHtml(tr("seriesTable"))}</summary><div class="gggi-table-scroll"><table class="gggi-table"><thead><tr><th>${escapeHtml(tr("year"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("rank"))}</th><th>${escapeHtml(tr("sourcePeriod"))}</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escapeHtml(item.year)}</td><td>${runtime.trendMetric === "overall_rank" ? "—" : formatPercent(item.value, 1)}</td><td>${item.rank == null ? "—" : `#${formatInteger(item.rank)}`}</td><td>${escapeHtml(item.period || "—")}</td></tr>`).join("")}</tbody></table></div></details></article>
    </section>`;
  }

  function rankingMetricOptions() {
    return `<option value="overall" ${runtime.rankingMetric === "overall" ? "selected" : ""}>${escapeHtml(tr("overallOfficial"))}</option><optgroup label="${escapeHtml(tr("dimensions"))}">${subindexCatalog().map((item) => `<option value="subindex:${escapeHtml(item.subindex_code)}" ${runtime.rankingMetric === `subindex:${item.subindex_code}` ? "selected" : ""}>${escapeHtml(subindexName(item))}</option>`).join("")}</optgroup><optgroup label="${escapeHtml(tr("indicators"))}">${indicatorCatalog().map((item) => `<option value="indicator:${escapeHtml(item.indicator_code)}" ${runtime.rankingMetric === `indicator:${item.indicator_code}` ? "selected" : ""}>${escapeHtml(indicatorName(item))}</option>`).join("")}</optgroup>`;
  }

  function currentRankingPayload() { return runtime.rankingMetric === "overall" ? runtime.ranking : (runtime.metricRanking || runtime.ranking); }
  function regionOptions() {
    const values = [...new Set(rankingItems().map((item) => item.region).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), locale()));
    return `<option value="">${escapeHtml(tr("allRegions"))}</option>${values.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingRegion ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  }
  function incomeOptions() {
    const values = [...new Set(rankingItems().map((item) => item.income_group).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), locale()));
    return `<option value="">${escapeHtml(tr("allIncome"))}</option>${values.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingIncome ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  }
  function filteredRanking() {
    const query = runtime.rankingQuery.trim().toLocaleLowerCase(locale());
    return rankingItems(currentRankingPayload()).filter((item) => {
      if (runtime.rankingRegion && item.region !== runtime.rankingRegion) return false;
      if (runtime.rankingIncome && item.income_group !== runtime.rankingIncome) return false;
      if (query && !`${countryName(item)} ${item.iso3 || ""} ${item.economy_name_source || ""}`.toLocaleLowerCase(locale()).includes(query)) return false;
      return true;
    });
  }

  function rankingFilters() {
    return `<div class="gggi-ranking-filters"><label class="is-wide"><span>${escapeHtml(tr("search"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}" data-gggi-ranking-query></label><label><span>${escapeHtml(tr("rankingMetric"))}</span><select data-gggi-ranking-metric>${rankingMetricOptions()}</select></label><label><span>${escapeHtml(tr("region"))}</span><select data-gggi-ranking-region>${regionOptions()}</select></label><label><span>${escapeHtml(tr("income"))}</span><select data-gggi-ranking-income>${incomeOptions()}</select></label><label><span>${escapeHtml(tr("pageSize"))}</span><select data-gggi-ranking-size>${[10,25,50,100].map((size) => `<option value="${size}" ${size === runtime.rankingPageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" class="gggi-button gggi-button-secondary" data-gggi-action="export">${escapeHtml(tr("exportCsv"))}</button></div>`;
  }

  function rankingTable() {
    const rows = filteredRanking();
    const totalPages = Math.max(1, Math.ceil(rows.length / runtime.rankingPageSize));
    runtime.rankingPage = Math.min(runtime.rankingPage, totalPages);
    const start = (runtime.rankingPage - 1) * runtime.rankingPageSize;
    const pageRows = rows.slice(start, start + runtime.rankingPageSize);
    const derived = runtime.rankingMetric !== "overall";
    return `<div class="gggi-ranking-summary"><span>${escapeHtml(tr("shown"))}: <b>${formatInteger(rows.length)}</b></span><span class="${derived ? "is-derived" : "is-official"}">${escapeHtml(derived ? tr("derivedOrder") : tr("officialRankPreserved"))}</span></div><div class="gggi-table-scroll"><table class="gggi-table gggi-ranking-table"><thead><tr><th>${escapeHtml(tr("rank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(derived ? tr("selectedMetricScore") : tr("score"))}</th>${derived ? `<th>${escapeHtml(tr("selectedMetricRank"))}</th>` : ""}<th>${escapeHtml(tr("region"))}</th><th>${escapeHtml(tr("income"))}</th></tr></thead><tbody>${pageRows.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</td><td><button type="button" class="gggi-country-link" data-gggi-country-pick="${escapeHtml(item.iso3 || "")}">${flagMarkup(item, "gggi-flag-inline")}<span><b>${escapeHtml(countryName(item))}</b><small>${escapeHtml(item.iso3 || "")}</small></span></button></td><td>${formatPercent(derived ? item.selected_metric_score : item.score, 1)}</td>${derived ? `<td>${item.selected_metric_rank == null ? "—" : `#${formatInteger(item.selected_metric_rank)}`}</td>` : ""}<td>${escapeHtml(item.region || "—")}</td><td>${escapeHtml(item.income_group || "—")}</td></tr>`).join("")}</tbody></table></div><div class="gggi-pagination"><button type="button" data-gggi-page="${Math.max(1, runtime.rankingPage - 1)}" ${runtime.rankingPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${runtime.rankingPage} / ${totalPages}</span><button type="button" data-gggi-page="${Math.min(totalPages, runtime.rankingPage + 1)}" ${runtime.rankingPage >= totalPages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div>`;
  }

  function rankingPanel() {
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-ranking" aria-labelledby="gggi-tab-${runtime.instance}-ranking" data-gggi-panel="ranking">${sectionHeading(tr("rankingKicker"), tr("rankingHeading"), tr("rankingText"))}<article class="gggi-card gggi-ranking-card">${rankingFilters()}${rankingTable()}</article></section>`;
  }

  function auditModel() {
    const audit = runtime.audit?.audit || runtime.audit || {};
    const release = currentRelease();
    return { audit, release, ok: audit.ok === true, snapshot: audit.snapshot || {}, issues: audit.issues || audit.issue_summary || [] };
  }

  function methodologyPanel() {
    const model = auditModel();
    const sources = runtime.metadata?.official_sources || {};
    const principles = [
      [tr("gapsNotLevels"), tr("gapsNotLevelsText")],
      [tr("outcomesNotInputs"), tr("outcomesNotInputsText")],
      [tr("parityCapping"), tr("parityCappingText")],
      [tr("officialRanking"), tr("officialRankingText")],
    ];
    return `<section class="gggi-panel" role="tabpanel" tabindex="0" id="gggi-panel-${runtime.instance}-methodology" aria-labelledby="gggi-tab-${runtime.instance}-methodology" data-gggi-panel="methodology">${sectionHeading(tr("methodologyKicker"), tr("methodologyHeading"), tr("methodologyText"))}<div class="gggi-method-grid">${principles.map(([title, text], index) => `<article class="gggi-method-card"><span>0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div><div class="gggi-method-layout"><article class="gggi-card"><div class="gggi-card-title"><div><p>${escapeHtml(tr("framework"))}</p><h3>4 + 14</h3></div><span>${escapeHtml(tr("inclusionRuleText"))}</span></div>${subindexCatalog().map((sub) => `<details open><summary><b>${escapeHtml(subindexName(sub))}</b><span>${indicatorCatalog().filter((item) => item.subindex_code === sub.subindex_code).length}</span></summary><ul>${indicatorCatalog().filter((item) => item.subindex_code === sub.subindex_code).map((item) => `<li><span>${escapeHtml(indicatorName(item))}</span><b>${formatPercent(item.weight, 1)}</b></li>`).join("")}</ul></details>`).join("")}<div class="gggi-benchmark-note"><h4>${escapeHtml(tr("healthBenchmarks"))}</h4><div><span>${escapeHtml(tr("sexRatioBenchmark"))}</span><strong>0.944</strong></div><div><span>${escapeHtml(tr("lifeBenchmark"))}</span><strong>1.06</strong></div></div></article><article class="gggi-card gggi-audit-card"><div class="gggi-card-title"><div><p>${escapeHtml(tr("sourcesAudit"))}</p><h3>${escapeHtml(model.ok ? tr("auditPassed") : tr("auditFailed"))}</h3></div><span class="${model.ok ? "is-passed" : "is-review"}">${escapeHtml(model.ok ? tr("publicationGate") : tr("validationIssues"))}</span></div><dl class="gggi-audit-list"><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(runtime.metadata?.publisher || "World Economic Forum")}</dd></div><div><dt>${escapeHtml(tr("release"))}</dt><dd>${escapeHtml(model.release.edition_name || String(runtime.year || "—"))}</dd></div><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd><code>${escapeHtml(runtime.ranking?.release_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(model.release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(model.release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("snapshotCheck"))}</dt><dd>${escapeHtml(model.snapshot.matches === false ? tr("auditFailed") : tr("auditPassed"))}</dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(model.release.transform_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("importerVersion"))}</dt><dd>${escapeHtml(model.release.importer_version || "—")}</dd></div></dl><div class="gggi-source-links">${externalLink(sources.report || sources.series, tr("officialSource"))}${externalLink(sources.dashboard, tr("dashboard"))}${externalLink(sources.methodology, tr("methodologyLink"))}</div></article></div></section>`;
  }

  function activePanel() {
    if (runtime.view === "dimensions") return dimensionsPanel();
    if (runtime.view === "indicators") return indicatorsPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "methodology") return methodologyPanel();
    return overviewPanel();
  }
  function inactivePanels() {
    return VIEW_KEYS.filter((view) => view !== runtime.view).map((view) => `<div role="tabpanel" id="gggi-panel-${runtime.instance}-${view}" aria-labelledby="gggi-tab-${runtime.instance}-${view}" data-gggi-panel="${view}" hidden></div>`).join("");
  }
  function renderAvailable() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `<section class="gggi-workspace" data-gggi-state="available">${hero()}${controlBar()}${tabs()}<div class="gggi-view-stage">${activePanel()}${inactivePanels()}</div></section>`;
    bindEvents();
  }

  function provenanceHtml() {
    const country = profileCountry(); const provenance = country.provenance || {};
    const release = currentRelease();
    const rows = [
      [tr("entityKey"), country.entity_key],
      ["ISO3", country.iso3],
      [tr("mappingMethod"), country.mapping_method],
      [tr("year"), runtime.year],
      [tr("officialRank"), country.official_rank],
      [tr("officialValue"), country.score],
      [tr("releaseId"), runtime.ranking?.release_id],
      [tr("sourceSheet"), provenance.source_sheet || provenance.sheet_name],
      [tr("sourceRow"), provenance.source_row || provenance.row_number],
      [tr("rawSnapshot"), release.raw_snapshot_sha256],
      [tr("transformId"), release.transform_id],
      [tr("importerVersion"), release.importer_version],
    ];
    return `<dl class="gggi-provenance">${rows.filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd><code>${escapeHtml(value)}</code></dd></div>`).join("")}</dl><p class="gggi-provenance-note">${escapeHtml(tr("officialRankPreserved"))}</p>`;
  }
  function openProvenance(trigger) {
    const html = provenanceHtml();
    if (typeof runtime.context.openDrawer === "function") {
      runtime.context.openDrawer(html, { title: tr("provenance"), kicker: tr("indexName"), trigger });
      return;
    }
    const dialog = document.createElement("dialog"); dialog.className = "gggi-dialog"; dialog.innerHTML = `<div class="gggi-dialog-head"><h2>${escapeHtml(tr("provenance"))}</h2><button type="button" data-gggi-dialog-close>${escapeHtml(tr("close"))}</button></div>${html}`; document.body.append(dialog); dialog.querySelector("[data-gggi-dialog-close]").onclick = () => dialog.close(); dialog.addEventListener("close", () => { dialog.remove(); trigger?.focus?.(); }, { once: true }); dialog.showModal();
  }

  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try { await navigator.clipboard.writeText(window.location.href); }
    catch (_) { const input = document.createElement("textarea"); input.value = window.location.href; input.style.position = "fixed"; input.style.opacity = "0"; document.body.append(input); input.select(); document.execCommand("copy"); input.remove(); }
    notify(tr("copied"));
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
  function exportRanking() {
    const derived = runtime.rankingMetric !== "overall";
    const headers = ["index_year", "official_rank", "iso3", "economy", "overall_score", "region", "income_group", "release_id", "order_semantics"];
    if (derived) headers.push("selected_metric", "selected_metric_score", "selected_metric_rank");
    const rows = filteredRanking().map((item) => {
      const row = [runtime.year, item.official_rank ?? "", item.iso3 ?? "", countryName(item), item.score ?? "", item.region ?? "", item.income_group ?? "", currentRankingPayload()?.release_id ?? "", currentRankingPayload()?.order_semantics ?? OFFICIAL_ORDER];
      if (derived) row.push(runtime.rankingMetric, item.selected_metric_score ?? "", item.selected_metric_rank ?? "");
      return row;
    });
    const blob = new Blob(["\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = href; anchor.download = `${tr("downloadName")}-${runtime.year}-${runtime.rankingMetric.replace(":", "-")}.csv`; document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(href);
  }

  async function setView(view, { focusPanel = false, focusTab = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    const changed = runtime.view !== view; runtime.view = view;
    if (changed) { updateDeepLink({ notifyHost: true }); renderAvailable(); }
    requestAnimationFrame(() => {
      const element = runtime.root?.querySelector(focusTab ? `[data-gggi-view="${view}"]` : `[data-gggi-panel="${view}"]`);
      if (focusPanel || focusTab) element?.focus({ preventScroll: focusTab });
      if (focusTab) element?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function rerenderStage({ focusSelector = null, cursor = null } = {}) {
    const stage = runtime.root?.querySelector(".gggi-view-stage");
    if (stage) stage.innerHTML = activePanel() + inactivePanels();
    bindEvents();
    if (focusSelector) { const replacement = runtime.root?.querySelector(focusSelector); replacement?.focus({ preventScroll: true }); if (cursor !== null) replacement?.setSelectionRange?.(cursor, cursor); }
  }

  function handleTabKeydown(event) {
    const tabs = [...runtime.root.querySelectorAll("[data-gggi-view]")]; const index = tabs.indexOf(event.currentTarget); let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return; event.preventDefault(); setView(tabs[next].dataset.gggiView, { focusTab: true });
  }

  async function selectCompare(value) {
    runtime.compareCountry = String(value || "").toUpperCase();
    runtime.compareProfile = null;
    if (runtime.compareCountry && runtime.compareCountry !== runtime.country) {
      runtime.detailController?.abort(); runtime.detailController = new AbortController();
      try { runtime.compareProfile = await fetchJson(`${API}/country/${encodeURIComponent(runtime.compareCountry)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal: runtime.detailController.signal }); }
      catch (error) { if (!abortError(error)) notify(error.message || String(error)); }
    }
    updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-gggi-compare]" });
  }

  async function selectRankingMetric(metric) {
    runtime.rankingMetric = metric; runtime.metricRanking = null; runtime.rankingPage = 1; updateDeepLink({ notifyHost: false }); rerenderStage();
    if (metric !== "overall") {
      runtime.detailController?.abort(); runtime.detailController = new AbortController();
      try { await loadMetricRanking(metric, runtime.detailController.signal); rerenderStage({ focusSelector: "[data-gggi-ranking-metric]" }); }
      catch (error) { if (!abortError(error)) renderState("error", error); }
    }
  }

  async function selectTrendMetric(metric) {
    runtime.trendMetric = metric; runtime.indicatorSeries = null; rerenderStage();
    if (metric.startsWith("indicator:")) {
      runtime.detailController?.abort(); runtime.detailController = new AbortController();
      try { await loadIndicatorSeries(metric.slice("indicator:".length), runtime.detailController.signal); rerenderStage({ focusSelector: "[data-gggi-trend-metric]" }); }
      catch (error) { if (!abortError(error)) renderState("error", error); }
    }
  }

  function bindEvents() {
    const root = runtime.root; if (!root) return;
    root.querySelectorAll("img[data-gggi-flag]").forEach((image) => {
      const revealFallback = () => { image.parentElement?.classList.add("is-fallback"); image.remove(); };
      if (image.complete && image.naturalWidth === 0) revealFallback(); else image.addEventListener("error", revealFallback, { once: true });
    });
    root.querySelectorAll('[data-gggi-action="retry"]').forEach((button) => { button.onclick = loadWorkspace; });
    root.querySelectorAll("[data-gggi-country]").forEach((select) => { select.onchange = (event) => changeCountry(event.target.value); });
    root.querySelectorAll("[data-gggi-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-gggi-view]").forEach((button) => { button.onclick = () => setView(button.dataset.gggiView, { focusTab: true }); button.onkeydown = handleTabKeydown; });
    root.querySelectorAll('[data-gggi-action="share"]').forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll('[data-gggi-action="provenance"]').forEach((button) => { button.onclick = () => openProvenance(button); });
    root.querySelectorAll('[data-gggi-action="export"]').forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-gggi-country-pick]").forEach((button) => { button.onclick = async () => { if (!button.dataset.gggiCountryPick) return; await changeCountry(button.dataset.gggiCountryPick); if (runtime.view === "ranking") await setView("overview", { focusPanel: true }); }; });
    root.querySelectorAll('[data-gggi-map-iso][data-has-value="true"]').forEach((path) => { path.style.cursor = "pointer"; path.onclick = () => changeCountry(path.dataset.gggiMapIso); });
    root.querySelectorAll("[data-gggi-subindex-open]").forEach((button) => { button.onclick = () => { runtime.selectedSubindex = button.dataset.gggiSubindexOpen; runtime.selectedIndicator = runtime.profile?.indicators?.find((item) => item.subindex_code === runtime.selectedSubindex)?.indicator_code || runtime.selectedIndicator; updateDeepLink({ notifyHost: false }); setView("indicators", { focusPanel: true }); }; });
    root.querySelectorAll("[data-gggi-compare]").forEach((select) => { select.onchange = (event) => selectCompare(event.target.value); });
    root.querySelectorAll("[data-gggi-indicator-filter]").forEach((select) => { select.onchange = (event) => { runtime.selectedSubindex = event.target.value; const first = filteredIndicators()[0]; if (first) runtime.selectedIndicator = first.indicator_code; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: "[data-gggi-indicator-filter]" }); }; });
    root.querySelectorAll("[data-gggi-indicator-pick]").forEach((button) => { button.onclick = () => { runtime.selectedIndicator = button.dataset.gggiIndicatorPick; updateDeepLink({ notifyHost: false }); rerenderStage({ focusSelector: `[data-gggi-indicator-pick="${runtime.selectedIndicator}"]` }); }; });
    root.querySelectorAll("[data-gggi-indicator-trend]").forEach((button) => { button.onclick = async () => { const code = button.dataset.gggiIndicatorTrend; runtime.trendMetric = `indicator:${code}`; await setView("trend", { focusPanel: true }); await selectTrendMetric(runtime.trendMetric); }; });
    root.querySelectorAll("[data-gggi-trend-metric]").forEach((select) => { select.onchange = (event) => selectTrendMetric(event.target.value); });
    const search = root.querySelector("[data-gggi-ranking-query]");
    if (search) search.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-gggi-ranking-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-gggi-ranking-metric]").forEach((select) => { select.onchange = (event) => selectRankingMetric(event.target.value); });
    root.querySelectorAll("[data-gggi-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-gggi-ranking-region]" }); }; });
    root.querySelectorAll("[data-gggi-ranking-income]").forEach((select) => { select.onchange = (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-gggi-ranking-income]" }); }; });
    root.querySelectorAll("[data-gggi-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-gggi-ranking-size]" }); }; });
    root.querySelectorAll("[data-gggi-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage = Number(button.dataset.gggiPage); rerenderStage(); runtime.root?.querySelector(".gggi-ranking-table")?.scrollIntoView({ block: "start" }); }; });
  }

  function render(context = {}) {
    if (!context.root) throw new Error("GIRGlobalGenderGap.render requires root");
    runtime.abortController?.abort(); runtime.detailController?.abort();
    runtime.root = context.root; runtime.context = context; runtime.lang = context.lang === "en" ? "en" : "ru"; runtime.theme = context.theme || document.documentElement.dataset.theme || "dark"; runtime.instance += 1;
    const link = deepLink(); runtime.view = link.view || "overview"; runtime.country = link.country || String(context.country || "").toUpperCase(); if (!runtime.country) return; runtime.year = link.year || (Number(context.year) || null); runtime.selectedSubindex = link.subindex || runtime.selectedSubindex; runtime.selectedIndicator = link.indicator || runtime.selectedIndicator; runtime.compareCountry = link.compare || ""; runtime.rankingMetric = link.rankingMetric || "overall"; runtime.metricRanking = null; runtime.indicatorSeries = null;
    return loadWorkspace();
  }

  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort(); runtime.detailController?.abort();
    if (hard) { metadataCache.clear(); geoCache.value = null; geoCache.promise = null; }
    runtime.status = runtime.metadata = runtime.releases = runtime.years = runtime.subindexes = runtime.indicators = runtime.ranking = runtime.metricRanking = runtime.profile = runtime.compareProfile = runtime.series = runtime.indicatorSeries = runtime.audit = null;
  }

  window.GIRGlobalGenderGap = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    orderingSemantics: Object.freeze({ official: OFFICIAL_ORDER, subindex: DERIVED_SUBINDEX_ORDER, indicator: DERIVED_INDICATOR_ORDER, rankingInput: RANKING_INPUT_SEMANTICS }),
    _test: Object.freeze({ median, percentile, numeric, escapeHtml, scoreTone, featureIso, geometryPath, mapBin, metricParams }),
  });
})();
