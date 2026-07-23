/* GIR Society Stage 04 — Sustainable Development Report / SDG Index workspace.
 * Runtime country values are loaded exclusively from the Stage 03 SDG API.
 * No production country scores, ranks, dashboards, trends, or indicators are bundled.
 * The API contract cross_edition_timeseries_forbidden is preserved: only publisher-backdated values inside one release are charted.
 */
(() => {
  "use strict";

  const MODULE_VERSION = "sdg-frontend/4.0.0";
  const API = Object.freeze({
    status: "/api/sdg/status",
    metadata: "/api/sdg/metadata",
    releases: "/api/sdg/releases",
    years: "/api/sdg/years",
    goals: "/api/sdg/goals",
    ranking: "/api/sdg/ranking",
    country: (iso3) => `/api/sdg/country/${encodeURIComponent(iso3)}`,
    series: (iso3) => `/api/sdg/country/${encodeURIComponent(iso3)}/series`,
    indicators: "/api/sdg/indicators",
    indicatorSeries: (code) => `/api/sdg/indicator/${encodeURIComponent(code)}/series`,
    audit: "/api/sdg/audit",
  });
  const GEO_URLS = [
    "/static/world_countries_lite.geojson",
    "/static/world_countries.geojson",
    "/world.geojson",
  ];
  const VIEW_KEYS = ["overview", "goals", "trend", "indicators", "ranking", "methodology"];
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const apiCache = new Map();
  const goalRankingCache = new Map();
  let instanceCounter = 0;

  const GOAL_COLORS = Object.freeze({
    1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D", 5: "#FF3A21",
    6: "#26BDE2", 7: "#FCC30B", 8: "#A21942", 9: "#FD6925", 10: "#DD1367",
    11: "#FD9D24", 12: "#BF8B2E", 13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B",
    16: "#00689D", 17: "#19486A",
  });
  const GOAL_DARK_TEXT = new Set([2, 6, 7, 11]);
  const STATUS_ORDER = Object.freeze({
    achieved: 4,
    challenges_remain: 3,
    significant_challenges: 2,
    major_challenges: 1,
    data_unavailable: 0,
  });
  const TREND_ORDER = Object.freeze({
    on_track_or_maintaining: 4,
    moderately_improving: 3,
    stagnating: 2,
    decreasing: 1,
    trend_unavailable: 0,
  });

  const COPY = {
    ru: {
      group: "Общество и человеческое развитие",
      indexName: "Индекс достижения Целей устойчивого развития",
      reportName: "Sustainable Development Report",
      shortName: "SDG Index",
      lead: "Единое аналитическое пространство для общего индекса, 17 целей, международных spillover-эффектов, трендов и исходных индикаторов — с сохранением официальных мест и полной прослеживаемостью данных.",
      officialData: "Официальные импортированные значения",
      officialSource: "Официальный портал",
      downloads: "Скачать материалы",
      methodology: "Методология",
      loading: "Собираем пространство устойчивого развития",
      loadingDetail: "Проверяем опубликованную редакцию, 17 целей, страновые профили и происхождение значений.",
      unavailableTitle: "Интерфейс готов — опубликованная редакция SDG Index пока не загружена",
      unavailableText: "Числовые значения появятся только после контролируемого импорта официальной книги данных и успешного publication gate. До этого GIR намеренно не показывает имитацию рейтинга.",
      unavailableAdmin: "Контур публикации данных",
      unavailableStep1: "получить официальный Excel или выгрузку ArcGIS",
      unavailableStep2: "проверить структуру, страны, 17 целей и индикаторы",
      unavailableStep3: "опубликовать редакцию после аудита raw snapshot и SHA-256",
      retry: "Повторить",
      errorTitle: "Не удалось открыть пространство SDG Index",
      errorText: "Сервер вернул неполный или недоступный набор данных. Другие модули GIR не затронуты.",
      technicalDetails: "Технические сведения",
      country: "Страна",
      year: "Год данных",
      edition: "Редакция",
      selectCountry: "Выберите страну",
      selectYear: "Выберите год",
      share: "Скопировать ссылку",
      copied: "Ссылка на выбранный профиль скопирована",
      export: "Экспорт CSV",
      overview: "Обзор",
      goals: "17 целей",
      trend: "Динамика",
      indicators: "Индикаторы",
      ranking: "Рейтинг",
      methodologyTab: "Методология",
      score: "Общий балл",
      officialRank: "Официальное место",
      unranked: "не ранжируется",
      spillover: "Международный spillover",
      spilloverRank: "Место по spillover",
      progress2015: "Изменение с 2015",
      headline: "Headline score",
      dataYear: "Год наблюдения",
      releaseYear: "Год редакции",
      profileCoverage: "Страновых профилей",
      rankedCoverage: "Стран в официальном рейтинге",
      goalCount: "Целей",
      indicatorCount: "Индикаторов",
      trendCount: "Индикаторов с трендом",
      overviewHeading: "Устойчивое развитие в мировом контексте",
      overviewText: "Карта и сравнения используют общий официальный балл выбранного года. Цветовая шкала карты — аналитическая визуализация GIR, а не отдельная официальная классификация.",
      geography: "География общего индекса",
      mapHint: "Нажмите на страну с доступным значением. Для клавиатуры доступны селектор страны и таблица рейтинга.",
      mapUnavailable: "Геометрия карты недоступна; все значения остаются доступны в рейтинге.",
      selectedProfile: "Профиль выбранной страны",
      worldMedian: "Медиана выборки",
      gapLeader: "Отставание от лидера",
      distribution: "Положение в распределении",
      leader: "Лидер",
      countriesCovered: "Стран в выбранном году",
      derivedLabel: "аналитический ориентир GIR",
      officialLabel: "официальное значение источника",
      goalDashboard: "Панель 17 целей",
      goalDashboardText: "Статус показывает расстояние до достижения цели, а тренд — направление долгосрочной динамики. Они не заменяют общий балл страны.",
      clickGoal: "Выберите цель для подробного профиля",
      goal: "Цель",
      goalScore: "Баллы цели",
      dashboardStatus: "Статус",
      trendStatus: "Тренд",
      achieved: "Цель достигнута",
      challenges_remain: "Проблемы сохраняются",
      significant_challenges: "Значительные проблемы",
      major_challenges: "Серьёзные проблемы",
      data_unavailable: "Недостаточно данных",
      on_track_or_maintaining: "На траектории / сохраняет достижение",
      moderately_improving: "Умеренно улучшается",
      stagnating: "Стагнирует",
      decreasing: "Ухудшается",
      trend_unavailable: "Тренд недоступен",
      selectedGoal: "Выбранная цель",
      viewIndicators: "Открыть индикаторы цели",
      compareCountries: "Сравнить страны",
      noGoalData: "Для выбранной цели в этой редакции нет значения.",
      goalsHeading: "Сбалансированный профиль по 17 целям",
      goalsText: "Каждая карточка соединяет три разных слоя: балл цели, traffic-light статус и официальную категорию тренда. Пропуски не заменяются нулями.",
      statusLegend: "Легенда статусов",
      trendLegend: "Легенда трендов",
      strengths: "Наиболее высокие баллы",
      priorities: "Наиболее низкие баллы",
      noGoalScores: "Баллы по целям отсутствуют в опубликованном профиле.",
      trendHeading: "Сопоставимая траектория внутри одной редакции",
      trendText: "Временной ряд использует только ретроспективные значения, пересчитанные издателем в рамках одной редакции. Смешивание разных ежегодных выпусков запрещено.",
      scoreTrend: "Динамика общего балла",
      rankTrend: "Динамика официального места",
      spilloverTrend: "Динамика spillover",
      metric: "Показатель",
      periodChange: "Изменение за период",
      firstYear: "Первый год",
      lastYear: "Последний год",
      observations: "Наблюдений",
      bestValue: "Лучшее значение",
      comparabilityNotice: "Сопоставимость ограничена одним release_id",
      goalTrajectory: "Траектории 17 целей",
      accessibleTable: "Показать значения графика таблицей",
      indicatorsHeading: "Проводник по исходным индикаторам",
      indicatorsText: "Каталог связывает показатель с целью, единицей измерения, источником, направлением и доступным временным рядом. Значения отображаются без пересчёта.",
      searchIndicator: "Поиск по коду, названию или описанию",
      allGoals: "Все цели",
      allIndicators: "Все индикаторы",
      globalOnly: "Только глобальные",
      oecdOnly: "Только дополнительные OECD",
      oecdFilter: "Охват",
      code: "Код",
      indicator: "Индикатор",
      unit: "Единица",
      source: "Источник",
      direction: "Направление",
      yearsAvailable: "Доступные годы",
      valuesAvailable: "Значений",
      higherBetter: "выше — лучше",
      lowerBetter: "ниже — лучше",
      neutralDirection: "направление не задано",
      oecdAdditional: "дополнительный показатель OECD",
      selectIndicator: "Выберите индикатор из каталога",
      indicatorSeries: "Временной ряд выбранной страны",
      latestObservation: "Последнее наблюдение",
      noIndicatorSeries: "Для выбранной страны временной ряд этого индикатора отсутствует.",
      openSourceMetadata: "Метаданные показателя",
      rankingHeading: "Официальный мировой рейтинг",
      rankingText: "Общий режим сохраняет официальные места. При выборе отдельной цели страны сортируются по её баллу только для анализа; это не официальный rank.",
      overallIndex: "Общий SDG Index",
      sortByGoal: "Сортировка по цели",
      goalSortNotice: "Порядок по цели — производная сортировка GIR, не официальный рейтинг",
      includeUnranked: "Показывать страны без официального места",
      searchCountry: "Поиск страны или ISO3",
      allRegions: "Все регионы",
      allIncome: "Все группы дохода",
      rowsPerPage: "Строк на странице",
      showing: "Показано",
      of: "из",
      previous: "Назад",
      next: "Далее",
      rank: "Место",
      region: "Регион",
      income: "Группа дохода",
      openProfile: "Открыть профиль",
      noMatches: "По выбранным фильтрам стран не найдено.",
      methodologyHeading: "Методология, охват и аудит",
      methodologyText: "Здесь разделены смысл индекса, параметры выбранной редакции, правила сопоставимости и техническое происхождение локального снимка.",
      indexPrinciple: "Что означает общий балл",
      indexPrincipleText: "Шкала 0–100 показывает расстояние страны до оптимального результата по совокупности Целей устойчивого развития. GIR не пересчитывает официальный балл или место.",
      dashboardPrinciple: "Как читать dashboard",
      dashboardPrincipleText: "Цветовая категория показывает расстояние до достижения конкретной цели, а тренд — направление динамики по официальной методике издателя.",
      scale: "Шкала",
      rankSemantics: "Семантика места",
      officialRankOnly: "только официальный rank; пропуски не заполняются",
      publisher: "Издатель",
      valuesStatus: "Статус значений",
      importedOfficial: "официальный импорт без пересчёта",
      dataFootprint: "Охват опубликованных данных",
      yearsCovered: "Годы наблюдений",
      releaseDetails: "Паспорт редакции",
      releaseId: "ID редакции",
      reportTitle: "Название доклада",
      doi: "DOI",
      retrievedAt: "Получено",
      snapshotHash: "SHA-256 снимка",
      transform: "Преобразование",
      audit: "Аудит происхождения",
      auditPassed: "Raw snapshot найден, контрольная сумма совпадает, блокирующих ошибок нет",
      auditAttention: "Аудит требует внимания",
      snapshotPresent: "Снимок существует",
      hashMatches: "SHA-256 совпадает",
      storedErrors: "Ошибок импорта",
      technicalContract: "Технический контракт API",
      methodologyNotice: "Медиана, процентиль, разница с лидером и сортировка по отдельной цели являются аналитическими элементами GIR. Они явно отделены от официальных баллов, мест, dashboard-статусов и трендов.",
      provenanceTitle: "Происхождение данных SDG Index",
      provenanceKicker: "SDG · PROVENANCE",
      field: "Поле",
      value: "Значение",
      countrySourceName: "Название страны в источнике",
      rawRow: "Строка исходного файла",
      sourceSheet: "Лист исходного файла",
      sourceUrl: "URL источника",
      methodologyUrl: "URL методологии",
      transformationId: "ID преобразования",
      transformationVersion: "Версия преобразования",
      rawSnapshot: "Контрольная сумма raw snapshot",
      release: "Редакция",
      observationYear: "Год наблюдения",
      qualityFlag: "Флаг качества",
      close: "Закрыть",
      notAvailable: "не указано",
      keyboardTabs: "Используйте стрелки влево и вправо для перехода между разделами.",
      downloadName: "sdg-ranking",
      page: "Страница",
      current: "Текущее",
      change: "Изменение",
      loaded: "Опубликовано",
      official: "Официальное",
      profile: "Профиль",
      data: "Данные",
      sourceLinks: "Официальные материалы",
    },
    en: {
      group: "Society & human development",
      indexName: "Sustainable Development Goals Index",
      reportName: "Sustainable Development Report",
      shortName: "SDG Index",
      lead: "A unified analytical workspace for the headline index, 17 goals, international spillovers, trends and raw indicators — preserving official ranks and full data traceability.",
      officialData: "Official imported values",
      officialSource: "Official portal",
      downloads: "Download materials",
      methodology: "Methodology",
      loading: "Building the sustainable development workspace",
      loadingDetail: "Checking the published edition, 17 goals, country profiles and value provenance.",
      unavailableTitle: "The interface is ready — no SDG Index edition has been published in GIR yet",
      unavailableText: "Numerical values appear only after controlled import of the official workbook and a successful publication gate. Until then GIR deliberately shows no simulated ranking.",
      unavailableAdmin: "Data publication path",
      unavailableStep1: "obtain the official Excel workbook or ArcGIS export",
      unavailableStep2: "validate countries, 17 goals, dashboards, trends and indicators",
      unavailableStep3: "publish the edition after raw snapshot and SHA-256 audit",
      retry: "Retry",
      errorTitle: "The SDG Index workspace could not be opened",
      errorText: "The server returned an incomplete or unavailable dataset. Other GIR modules are unaffected.",
      technicalDetails: "Technical details",
      country: "Country",
      year: "Data year",
      edition: "Edition",
      selectCountry: "Select a country",
      selectYear: "Select a year",
      share: "Copy link",
      copied: "A link to the selected profile has been copied",
      export: "Export CSV",
      overview: "Overview",
      goals: "17 goals",
      trend: "Trend",
      indicators: "Indicators",
      ranking: "Ranking",
      methodologyTab: "Methodology",
      score: "Overall score",
      officialRank: "Official rank",
      unranked: "not ranked",
      spillover: "International spillover",
      spilloverRank: "Spillover rank",
      progress2015: "Change since 2015",
      headline: "Headline score",
      dataYear: "Observation year",
      releaseYear: "Edition year",
      profileCoverage: "Country profiles",
      rankedCoverage: "Countries officially ranked",
      goalCount: "Goals",
      indicatorCount: "Indicators",
      trendCount: "Trend indicators",
      overviewHeading: "Sustainable development in global context",
      overviewText: "The map and benchmarks use the official overall score for the selected year. The map colour scale is an analytical GIR visualisation, not a separate official classification.",
      geography: "Geography of the headline index",
      mapHint: "Select a country with an available value. Keyboard users can use the country selector and ranking table.",
      mapUnavailable: "Map geometry is unavailable; all values remain accessible in the ranking.",
      selectedProfile: "Selected country profile",
      worldMedian: "Sample median",
      gapLeader: "Gap to leader",
      distribution: "Distribution position",
      leader: "Leader",
      countriesCovered: "Countries in selected year",
      derivedLabel: "GIR analytical benchmark",
      officialLabel: "official source value",
      goalDashboard: "17-goal dashboard",
      goalDashboardText: "Status shows distance to achievement, while trend shows long-run direction. Neither replaces the country's overall score.",
      clickGoal: "Select a goal for a detailed profile",
      goal: "Goal",
      goalScore: "Goal score",
      dashboardStatus: "Status",
      trendStatus: "Trend",
      achieved: "SDG achieved",
      challenges_remain: "Challenges remain",
      significant_challenges: "Significant challenges",
      major_challenges: "Major challenges",
      data_unavailable: "Data unavailable",
      on_track_or_maintaining: "On track / maintaining achievement",
      moderately_improving: "Moderately improving",
      stagnating: "Stagnating",
      decreasing: "Decreasing",
      trend_unavailable: "Trend unavailable",
      selectedGoal: "Selected goal",
      viewIndicators: "Open goal indicators",
      compareCountries: "Compare countries",
      noGoalData: "No value is available for this goal in the selected edition.",
      goalsHeading: "Balanced profile across all 17 goals",
      goalsText: "Each card combines three distinct layers: goal score, traffic-light status and official trend category. Missing values are never replaced with zeroes.",
      statusLegend: "Status legend",
      trendLegend: "Trend legend",
      strengths: "Highest goal scores",
      priorities: "Lowest goal scores",
      noGoalScores: "No goal scores are present in the published country profile.",
      trendHeading: "Comparable trajectory within one edition",
      trendText: "The time series uses only backdated values recalculated by the publisher within one release. Mixing different annual editions is prohibited.",
      scoreTrend: "Overall score trend",
      rankTrend: "Official rank trend",
      spilloverTrend: "Spillover trend",
      metric: "Metric",
      periodChange: "Period change",
      firstYear: "First year",
      lastYear: "Last year",
      observations: "Observations",
      bestValue: "Best value",
      comparabilityNotice: "Comparability is limited to one release_id",
      goalTrajectory: "Trajectories across 17 goals",
      accessibleTable: "Show chart values as a table",
      indicatorsHeading: "Raw indicator explorer",
      indicatorsText: "The catalogue links every indicator to its goal, unit, source, preferred direction and available time series. Values are displayed without recomputation.",
      searchIndicator: "Search code, name or description",
      allGoals: "All goals",
      allIndicators: "All indicators",
      globalOnly: "Global indicators only",
      oecdOnly: "OECD additions only",
      oecdFilter: "Coverage",
      code: "Code",
      indicator: "Indicator",
      unit: "Unit",
      source: "Source",
      direction: "Direction",
      yearsAvailable: "Available years",
      valuesAvailable: "Values",
      higherBetter: "higher is better",
      lowerBetter: "lower is better",
      neutralDirection: "direction not specified",
      oecdAdditional: "additional OECD indicator",
      selectIndicator: "Select an indicator from the catalogue",
      indicatorSeries: "Selected country time series",
      latestObservation: "Latest observation",
      noIndicatorSeries: "No time series is available for this indicator and country.",
      openSourceMetadata: "Indicator metadata",
      rankingHeading: "Official global ranking",
      rankingText: "Overall mode preserves official ranks. Selecting a goal sorts countries by its score for analysis only; that order is not an official rank.",
      overallIndex: "Overall SDG Index",
      sortByGoal: "Sort by goal",
      goalSortNotice: "Goal order is a GIR analytical sort, not an official ranking",
      includeUnranked: "Include countries without an official rank",
      searchCountry: "Search country or ISO3",
      allRegions: "All regions",
      allIncome: "All income groups",
      rowsPerPage: "Rows per page",
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next",
      rank: "Rank",
      region: "Region",
      income: "Income group",
      openProfile: "Open profile",
      noMatches: "No countries match the selected filters.",
      methodologyHeading: "Methodology, coverage and audit",
      methodologyText: "This section separates index meaning, selected-edition parameters, comparability rules and the technical provenance of the local snapshot.",
      indexPrinciple: "What the headline score means",
      indexPrincipleText: "The 0–100 scale expresses a country's distance to optimal performance across the Sustainable Development Goals. GIR does not recompute the official score or rank.",
      dashboardPrinciple: "How to read the dashboard",
      dashboardPrincipleText: "The colour category shows distance to achievement for a goal, while trend captures direction under the publisher's official methodology.",
      scale: "Scale",
      rankSemantics: "Rank semantics",
      officialRankOnly: "official rank only; missing ranks remain missing",
      publisher: "Publisher",
      valuesStatus: "Value status",
      importedOfficial: "official import without recomputation",
      dataFootprint: "Published data footprint",
      yearsCovered: "Observation years",
      releaseDetails: "Edition passport",
      releaseId: "Release ID",
      reportTitle: "Report title",
      doi: "DOI",
      retrievedAt: "Retrieved",
      snapshotHash: "Snapshot SHA-256",
      transform: "Transformation",
      audit: "Provenance audit",
      auditPassed: "Raw snapshot exists, checksum matches and no blocking errors remain",
      auditAttention: "Audit requires attention",
      snapshotPresent: "Snapshot exists",
      hashMatches: "SHA-256 matches",
      storedErrors: "Stored import errors",
      technicalContract: "Technical API contract",
      methodologyNotice: "Median, percentile, gap to leader and goal-specific ordering are GIR analytical elements. They remain explicitly separate from official scores, ranks, dashboard statuses and trends.",
      provenanceTitle: "SDG Index data provenance",
      provenanceKicker: "SDG · PROVENANCE",
      field: "Field",
      value: "Value",
      countrySourceName: "Country name in source",
      rawRow: "Source row",
      sourceSheet: "Source sheet",
      sourceUrl: "Source URL",
      methodologyUrl: "Methodology URL",
      transformationId: "Transformation ID",
      transformationVersion: "Transformation version",
      rawSnapshot: "Raw snapshot checksum",
      release: "Edition",
      observationYear: "Observation year",
      qualityFlag: "Quality flag",
      close: "Close",
      notAvailable: "not provided",
      keyboardTabs: "Use left and right arrow keys to move between sections.",
      downloadName: "sdg-ranking",
      page: "Page",
      current: "Current",
      change: "Change",
      loaded: "Published",
      official: "Official",
      profile: "Profile",
      data: "Data",
      sourceLinks: "Official materials",
    },
  };

  const runtime = {
    id: 0,
    root: null,
    context: {},
    lang: "ru",
    theme: "dark",
    view: "overview",
    year: null,
    releaseId: null,
    iso3: "",
    selectedGoal: 1,
    indicatorCode: "",
    status: null,
    metadata: null,
    years: [],
    releases: [],
    goals: [],
    ranking: null,
    goalRanking: null,
    profile: null,
    series: null,
    indicatorsPayload: null,
    indicatorSeriesPayload: null,
    audit: null,
    geo: null,
    geoError: null,
    loading: false,
    error: null,
    abortController: null,
    detailController: null,
    trendMetric: "score",
    rankingGoal: 0,
    rankingQuery: "",
    rankingRegion: "",
    rankingIncome: "",
    rankingIncludeUnranked: true,
    rankingPage: 1,
    rankingPageSize: 25,
    indicatorQuery: "",
    indicatorGoal: 0,
    indicatorScope: "all",
    indicatorPage: 1,
    indicatorPageSize: 18,
  };

  function tr(key) {
    return COPY[runtime.lang]?.[key] ?? COPY.en[key] ?? key;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function numeric(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && !value.trim()) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function formatNumber(value, digits = 1) {
    const number = numeric(value);
    if (number == null) return "—";
    return new Intl.NumberFormat(runtime.lang === "ru" ? "ru-RU" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(number);
  }

  function formatInteger(value) {
    const number = numeric(value);
    if (number == null) return "—";
    return new Intl.NumberFormat(runtime.lang === "ru" ? "ru-RU" : "en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  function formatSigned(value, digits = 1) {
    const number = numeric(value);
    if (number == null) return "—";
    const absolute = formatNumber(Math.abs(number), digits);
    if (Math.abs(number) < (digits ? 0.05 : 0.5)) return `±${absolute}`;
    return `${number > 0 ? "+" : "−"}${absolute}`;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(runtime.lang === "ru" ? "ru-RU" : "en-GB", {
      year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(date);
  }

  function countryName(item) {
    if (!item) return runtime.iso3 || "—";
    const preferred = runtime.lang === "ru" ? item.name_ru : item.name_en;
    return preferred || item.country_name_source || item.name_en || item.name_ru || item.iso3 || "—";
  }

  function goalName(goal, { short = false } = {}) {
    if (!goal) return "—";
    const key = short ? (runtime.lang === "ru" ? "short_ru" : "short_en") : (runtime.lang === "ru" ? "name_ru" : "name_en");
    return goal[key] || goal.name_en || goal.goal_code || `${tr("goal")} ${goal.goal_no || goal.number || ""}`;
  }

  function indicatorName(item) {
    if (!item) return "—";
    return item.name_en || item.description || item.indicator_code || "—";
  }

  function sourceFlag(item, className = "sdg-flag") {
    const iso2 = String(item?.iso2 || "").trim().toLowerCase();
    const iso3 = String(item?.iso3 || runtime.iso3 || "").trim().toUpperCase();
    const label = escapeHtml(countryName(item));
    if (!/^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className} sdg-flag-fallback" aria-label="${label}">${escapeHtml(iso3)}</span>`;
    }
    return `<span class="${className} sdg-flag-slot"><img src="/static/flags/${escapeHtml(iso2)}.svg" alt="${label}" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
  }

  function scoreTone(value) {
    const number = numeric(value);
    if (number == null) return "none";
    if (number >= 85) return "7";
    if (number >= 75) return "6";
    if (number >= 65) return "5";
    if (number >= 55) return "4";
    if (number >= 45) return "3";
    if (number >= 30) return "2";
    return "1";
  }

  function median(values) {
    const sorted = values.map(numeric).filter((value) => value != null).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function percentile(values, value) {
    const target = numeric(value);
    const sorted = values.map(numeric).filter((item) => item != null).sort((a, b) => a - b);
    if (target == null || !sorted.length) return null;
    const below = sorted.filter((item) => item < target).length;
    const equal = sorted.filter((item) => item === target).length;
    return ((below + equal / 2) / sorted.length) * 100;
  }

  function statusLabel(value) {
    return tr(STATUS_ORDER[value] !== undefined ? value : "data_unavailable");
  }

  function trendLabel(value) {
    return tr(TREND_ORDER[value] !== undefined ? value : "trend_unavailable");
  }

  function trendGlyph(value) {
    return ({
      on_track_or_maintaining: "↗",
      moderately_improving: "↗",
      stagnating: "→",
      decreasing: "↓",
      trend_unavailable: "·",
    })[value] || "·";
  }

  function preferredDirectionLabel(value) {
    const text = String(value || "").toLowerCase();
    if (text.includes("lower") || text.includes("decrease") || text.includes("negative")) return tr("lowerBetter");
    if (text.includes("higher") || text.includes("increase") || text.includes("positive")) return tr("higherBetter");
    return tr("neutralDirection");
  }

  function goalColor(number) {
    return GOAL_COLORS[Number(number)] || "#2947A0";
  }

  function goalTextColor(number) {
    return GOAL_DARK_TEXT.has(Number(number)) ? "#071321" : "#FFFFFF";
  }

  function cacheKey(url) {
    return String(url);
  }

  async function fetchJson(url, { signal, optional = false, cache = true } = {}) {
    const key = cacheKey(url);
    const now = Date.now();
    const cached = apiCache.get(key);
    if (cache && cached && cached.expiresAt > now) return cached.value;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      const value = await response.json();
      if (cache) apiCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
      return value;
    } catch (error) {
      if (optional && error?.name !== "AbortError") return null;
      throw error;
    }
  }

  async function fetchGeo(signal) {
    for (const url of GEO_URLS) {
      try {
        const value = await fetchJson(url, { signal, cache: true });
        if (value?.type === "FeatureCollection" && Array.isArray(value.features)) return value;
      } catch (error) {
        if (error?.name === "AbortError") throw error;
      }
    }
    return null;
  }

  function readDeepLink(context) {
    const query = new URLSearchParams(window.location.search);
    const requestedView = String(query.get("sdg_view") || "").toLowerCase();
    const requestedYear = Number(query.get("sdg_year") || context.year || 0);
    const requestedCountry = String(query.get("sdg_country") || query.get("country") || context.country || "").toUpperCase();
    const requestedGoal = Number(query.get("sdg_goal") || 1);
    const requestedIndicator = String(query.get("sdg_indicator") || "").trim();
    return {
      view: VIEW_KEYS.includes(requestedView) ? requestedView : "overview",
      year: Number.isInteger(requestedYear) && requestedYear > 0 ? requestedYear : null,
      iso3: /^[A-Z]{3}$/.test(requestedCountry) ? requestedCountry : "",
      goal: Number.isInteger(requestedGoal) && requestedGoal >= 1 && requestedGoal <= 17 ? requestedGoal : 1,
      indicator: requestedIndicator.length <= 160 ? requestedIndicator : "",
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("index", "SDG");
    url.searchParams.set("country", runtime.iso3);
    if (runtime.year) url.searchParams.set("year", String(runtime.year));
    url.searchParams.set("sdg_country", runtime.iso3);
    if (runtime.year) url.searchParams.set("sdg_year", String(runtime.year));
    url.searchParams.set("sdg_view", runtime.view);
    url.searchParams.set("sdg_goal", String(runtime.selectedGoal || 1));
    if (runtime.indicatorCode) url.searchParams.set("sdg_indicator", runtime.indicatorCode);
    else url.searchParams.delete("sdg_indicator");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash || "#index-SDG"}`);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({
        country: runtime.iso3,
        year: runtime.year,
        view: runtime.view,
        goal: runtime.selectedGoal,
        indicator: runtime.indicatorCode,
      });
    }
  }

  function announce(message) {
    const node = runtime.root?.querySelector("[data-sdg-live]");
    if (node) node.textContent = String(message || "");
  }

  function notify(message) {
    if (typeof runtime.context.onNotice === "function") runtime.context.onNotice(message);
    else announce(message);
  }

  function setDocumentMeta() {
    document.title = `${tr("indexName")} · GIR`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = tr("lead");
  }

  function selectYear(requested, years) {
    const values = years.map((item) => Number(item.reference_year)).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return null;
    if (requested && values.includes(Number(requested))) return Number(requested);
    return values[values.length - 1];
  }

  function selectCountry(requested, items) {
    const code = String(requested || "").toUpperCase();
    if (items.some((item) => item.iso3 === code)) return code;
    return code;
  }

  function selectedRankingItem() {
    return (runtime.ranking?.items || []).find((item) => item.iso3 === runtime.iso3) || runtime.profile || null;
  }

  function selectedGoalMeta(number = runtime.selectedGoal) {
    return runtime.goals.find((item) => Number(item.number || item.goal_no) === Number(number)) || {
      number: Number(number), goal_no: Number(number), goal_code: `SDG${String(number).padStart(2, "0")}`,
      name_ru: `${tr("goal")} ${number}`, name_en: `Goal ${number}`,
    };
  }

  function selectedGoalResult(number = runtime.selectedGoal) {
    return (runtime.profile?.goals || []).find((item) => Number(item.goal_no) === Number(number)) || null;
  }

  function goalModel(number) {
    const meta = selectedGoalMeta(number);
    const result = (runtime.profile?.goals || []).find((item) => Number(item.goal_no) === Number(number)) || {};
    return { ...meta, ...result, number: Number(number), goal_no: Number(number) };
  }

  function releaseForYear() {
    return runtime.releases.find((item) => item.release_id === runtime.releaseId)
      || runtime.ranking?.release
      || runtime.profile
      || runtime.status?.latest
      || {};
  }

  function yearEntry() {
    return runtime.years.find((item) => Number(item.reference_year) === Number(runtime.year)) || {};
  }

  function renderLoading() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `
      <section class="sdg-workspace sdg-state-shell" data-sdg-workspace data-version="${MODULE_VERSION}">
        <div class="sdg-state-card" role="status" aria-live="polite">
          <div class="sdg-loading-wheel" aria-hidden="true">${Array.from({ length: 17 }, (_, index) => `<i style="--i:${index};--goal-color:${goalColor(index + 1)}"></i>`).join("")}<span>SDG</span></div>
          <p class="sdg-kicker">${escapeHtml(tr("group"))}</p>
          <h1>${escapeHtml(tr("loading"))}</h1>
          <p>${escapeHtml(tr("loadingDetail"))}</p>
          <div class="sdg-skeleton-row" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </div>
      </section>`;
  }

  function emptyGoalGrid() {
    const goals = runtime.goals.length ? runtime.goals : (runtime.metadata?.framework?.goals || []);
    return `<div class="sdg-empty-goals" aria-label="${escapeHtml(tr("goals"))}">${goals.map((goal) => {
      const number = Number(goal.number || goal.goal_no);
      return `<div class="sdg-empty-goal" style="--goal-color:${goalColor(number)};--goal-text:${goalTextColor(number)}"><strong>${number}</strong><span>${escapeHtml(goalName(goal, { short: true }))}</span></div>`;
    }).join("")}</div>`;
  }

  function renderEmptyState() {
    const index = runtime.metadata?.index || {};
    const source = safeUrl(index.official_source_url);
    const downloads = safeUrl(index.downloads_url);
    const methodology = safeUrl(index.methodology_url);
    runtime.root.innerHTML = `
      <section class="sdg-workspace sdg-empty-state" data-sdg-workspace data-version="${MODULE_VERSION}">
        <header class="sdg-empty-hero">
          <div class="sdg-empty-copy">
            <p class="sdg-kicker">${escapeHtml(tr("group"))}</p>
            <span class="sdg-official-chip"><i aria-hidden="true"></i>${escapeHtml(tr("officialData"))}</span>
            <h1>${escapeHtml(tr("indexName"))}</h1>
            <p class="sdg-lead">${escapeHtml(tr("lead"))}</p>
            <div class="sdg-link-row">
              ${source ? `<a class="sdg-text-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a>` : ""}
              ${downloads ? `<a class="sdg-text-link" href="${escapeHtml(downloads)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("downloads"))}<span aria-hidden="true">↗</span></a>` : ""}
              ${methodology ? `<a class="sdg-text-link" href="${escapeHtml(methodology)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("methodology"))}<span aria-hidden="true">↗</span></a>` : ""}
            </div>
          </div>
          <div class="sdg-empty-message">
            <span class="sdg-empty-code" aria-hidden="true">17 / 2030</span>
            <h2>${escapeHtml(tr("unavailableTitle"))}</h2>
            <p>${escapeHtml(tr("unavailableText"))}</p>
            <button type="button" class="sdg-button sdg-button-secondary" data-sdg-action="retry">${escapeHtml(tr("retry"))}</button>
          </div>
        </header>
        ${emptyGoalGrid()}
        <aside class="sdg-admin-note">
          <div><span>CLI</span><h2>${escapeHtml(tr("unavailableAdmin"))}</h2></div>
          <ol><li>${escapeHtml(tr("unavailableStep1"))}</li><li>${escapeHtml(tr("unavailableStep2"))}</li><li>${escapeHtml(tr("unavailableStep3"))}</li></ol>
          <pre><code>python -m giip.sdg_index fetch --release-year 2026 --output /secure/database_2026.xlsx
python -m giip.sdg_index import /secure/database_2026.xlsx ...
python -m giip.sdg_index publish &lt;release-id&gt;</code></pre>
        </aside>
        <p class="sdg-sr-only" aria-live="polite" data-sdg-live></p>
      </section>`;
    bindEvents();
  }

  function renderError(error) {
    runtime.root.innerHTML = `
      <section class="sdg-workspace sdg-state-shell" data-sdg-workspace data-version="${MODULE_VERSION}">
        <div class="sdg-state-card sdg-state-error" role="alert">
          <div class="sdg-error-code" aria-hidden="true">SDG / !</div>
          <p class="sdg-kicker">${escapeHtml(tr("group"))}</p>
          <h1>${escapeHtml(tr("errorTitle"))}</h1>
          <p>${escapeHtml(tr("errorText"))}</p>
          <details><summary>${escapeHtml(tr("technicalDetails"))}</summary><pre>${escapeHtml(error?.message || String(error || "Unknown error"))}</pre></details>
          <button type="button" class="sdg-button" data-sdg-action="retry">${escapeHtml(tr("retry"))}</button>
        </div>
      </section>`;
    bindEvents();
  }

  async function loadWorkspace({ preserveInteraction = false } = {}) {
    if (!runtime.root) return;
    runtime.abortController?.abort();
    runtime.detailController?.abort();
    const controller = new AbortController();
    runtime.abortController = controller;
    runtime.loading = true;
    runtime.error = null;
    renderLoading();
    try {
      const [status, metadata, yearsPayload, releasesPayload, goalsPayload] = await Promise.all([
        fetchJson(API.status, { signal: controller.signal, cache: false }),
        fetchJson(API.metadata, { signal: controller.signal }),
        fetchJson(API.years, { signal: controller.signal, cache: false }),
        fetchJson(API.releases, { signal: controller.signal, cache: false }),
        fetchJson(API.goals, { signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      runtime.status = status;
      runtime.metadata = metadata;
      runtime.years = Array.isArray(yearsPayload?.items) ? yearsPayload.items : [];
      runtime.releases = Array.isArray(releasesPayload?.items) ? releasesPayload.items : [];
      runtime.goals = Array.isArray(goalsPayload?.items) ? goalsPayload.items : (metadata?.framework?.goals || []);
      if (status?.data_status !== "available" || !runtime.years.length) {
        runtime.loading = false;
        renderEmptyState();
        return;
      }

      runtime.year = selectYear(runtime.year, runtime.years);
      runtime.releaseId = yearEntry().release_id || null;
      const query = new URLSearchParams({ year: String(runtime.year), limit: "500", offset: "0", include_unranked: "true" });
      const [ranking, audit, geo] = await Promise.all([
        fetchJson(`${API.ranking}?${query}`, { signal: controller.signal, cache: false }),
        fetchJson(`${API.audit}?${new URLSearchParams({ year: String(runtime.year) })}`, { signal: controller.signal, optional: true, cache: false }),
        fetchGeo(controller.signal).catch((error) => {
          if (error?.name === "AbortError") throw error;
          runtime.geoError = error;
          return null;
        }),
      ]);
      if (controller.signal.aborted) return;
      runtime.ranking = ranking;
      runtime.releaseId = ranking?.release_id || runtime.releaseId;
      runtime.audit = audit;
      runtime.geo = geo;
      const items = Array.isArray(ranking?.items) ? ranking.items : [];
      runtime.iso3 = selectCountry(runtime.iso3, items);
      await loadSelectedProfile(controller.signal);
      if (controller.signal.aborted) return;
      if (runtime.view === "indicators") await ensureIndicators({ signal: controller.signal, render: false });
      runtime.loading = false;
      if (!preserveInteraction) {
        runtime.rankingPage = 1;
        runtime.indicatorPage = 1;
      }
      updateDeepLink({ notifyHost: true });
      renderAvailable();
    } catch (error) {
      if (error?.name === "AbortError") return;
      runtime.loading = false;
      runtime.error = error;
      renderError(error);
    }
  }

  async function loadSelectedProfile(signal) {
    const query = new URLSearchParams({ year: String(runtime.year) });
    if (runtime.releaseId) query.set("release_id", runtime.releaseId);
    const [profile, series] = await Promise.all([
      fetchJson(`${API.country(runtime.iso3)}?${query}`, { signal, cache: false }),
      fetchJson(`${API.series(runtime.iso3)}?${query}`, { signal, cache: false }),
    ]);
    runtime.profile = profile;
    runtime.series = series;
    if (runtime.indicatorCode && runtime.view === "indicators") {
      await loadIndicatorSeries(runtime.indicatorCode, { signal, render: false });
    } else {
      runtime.indicatorSeriesPayload = null;
    }
  }

  async function changeCountry(iso3, { focusView = false } = {}) {
    const code = String(iso3 || "").toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || code === runtime.iso3) return;
    runtime.iso3 = code;
    runtime.detailController?.abort();
    const controller = new AbortController();
    runtime.detailController = controller;
    const stage = runtime.root?.querySelector(".sdg-view-stage");
    if (stage) stage.setAttribute("aria-busy", "true");
    try {
      await loadSelectedProfile(controller.signal);
      if (controller.signal.aborted) return;
      updateDeepLink({ notifyHost: true });
      renderAvailable();
      announce(`${tr("country")}: ${countryName(selectedRankingItem())}`);
      if (focusView) runtime.root?.querySelector(`[data-sdg-panel="${runtime.view}"]`)?.focus({ preventScroll: true });
    } catch (error) {
      if (error?.name !== "AbortError") renderError(error);
    }
  }

  async function changeYear(year) {
    const value = Number(year);
    if (!Number.isInteger(value) || value === runtime.year) return;
    runtime.year = value;
    runtime.releaseId = null;
    runtime.rankingPage = 1;
    runtime.indicatorPage = 1;
    runtime.indicatorsPayload = null;
    runtime.indicatorSeriesPayload = null;
    runtime.goalRanking = null;
    runtime.rankingGoal = 0;
    await loadWorkspace({ preserveInteraction: true });
  }

  async function ensureIndicators({ signal = null, render = true } = {}) {
    if (runtime.indicatorsPayload?.release_id === runtime.releaseId && Array.isArray(runtime.indicatorsPayload?.items)) return runtime.indicatorsPayload;
    const controller = signal ? null : new AbortController();
    if (controller) {
      runtime.detailController?.abort();
      runtime.detailController = controller;
      signal = controller.signal;
    }
    const query = new URLSearchParams({ year: String(runtime.year), limit: "1000", offset: "0" });
    if (runtime.releaseId) query.set("release_id", runtime.releaseId);
    const payload = await fetchJson(`${API.indicators}?${query}`, { signal, cache: false });
    runtime.indicatorsPayload = payload;
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!runtime.indicatorCode || !items.some((item) => item.indicator_code === runtime.indicatorCode)) {
      const preferred = items.find((item) => Number(item.goal_no) === Number(runtime.selectedGoal)) || items[0];
      runtime.indicatorCode = preferred?.indicator_code || "";
    }
    if (runtime.indicatorCode) await loadIndicatorSeries(runtime.indicatorCode, { signal, render: false });
    if (render) renderAvailable();
    return payload;
  }

  async function loadIndicatorSeries(code, { signal = null, render = true } = {}) {
    const value = String(code || "").trim();
    if (!value) {
      runtime.indicatorSeriesPayload = null;
      return null;
    }
    const controller = signal ? null : new AbortController();
    if (controller) {
      runtime.detailController?.abort();
      runtime.detailController = controller;
      signal = controller.signal;
    }
    const query = new URLSearchParams({ year: String(runtime.year), iso3: runtime.iso3, limit: "5000", offset: "0" });
    if (runtime.releaseId) query.set("release_id", runtime.releaseId);
    const payload = await fetchJson(`${API.indicatorSeries(value)}?${query}`, { signal, cache: false });
    runtime.indicatorCode = value;
    runtime.indicatorSeriesPayload = payload;
    updateDeepLink({ notifyHost: false });
    if (render) renderAvailable();
    return payload;
  }

  async function loadGoalRanking(goalNo, { render = true } = {}) {
    const number = Number(goalNo) || 0;
    runtime.rankingGoal = number;
    runtime.rankingPage = 1;
    if (!number) {
      runtime.goalRanking = null;
      if (render) renderAvailable();
      return runtime.ranking;
    }
    const key = `${runtime.releaseId || runtime.year}:${runtime.year}:${number}`;
    if (goalRankingCache.has(key)) {
      runtime.goalRanking = goalRankingCache.get(key);
      if (render) renderAvailable();
      return runtime.goalRanking;
    }
    runtime.detailController?.abort();
    const controller = new AbortController();
    runtime.detailController = controller;
    const query = new URLSearchParams({ year: String(runtime.year), goal_no: String(number), limit: "500", offset: "0", include_unranked: "true" });
    if (runtime.releaseId) query.set("release_id", runtime.releaseId);
    const payload = await fetchJson(`${API.ranking}?${query}`, { signal: controller.signal, cache: false });
    goalRankingCache.set(key, payload);
    runtime.goalRanking = payload;
    if (render) renderAvailable();
    return payload;
  }

  function heroMetrics() {
    const profile = runtime.profile || selectedRankingItem() || {};
    const scores = (runtime.ranking?.items || []).map((item) => numeric(item.score)).filter((value) => value != null);
    const score = numeric(profile.score);
    const sampleMedian = median(scores);
    const leader = (runtime.ranking?.items || []).find((item) => numeric(item.score) != null) || null;
    const leaderScore = numeric(leader?.score);
    return {
      profile,
      score,
      rank: numeric(profile.official_rank),
      sampleMedian,
      leader,
      leaderScore,
      gapLeader: score != null && leaderScore != null ? score - leaderScore : null,
      percentile: percentile(scores, score),
    };
  }

  function scoreRing(value) {
    const score = numeric(value);
    const angle = score == null ? 0 : Math.max(0, Math.min(100, score)) * 3.6;
    return `<div class="sdg-score-ring" style="--score-angle:${angle}deg" aria-label="${escapeHtml(`${tr("score")}: ${formatNumber(score, 1)}`)}"><div><strong>${formatNumber(score, 1)}</strong><span>/ 100</span></div></div>`;
  }

  function hero() {
    const model = heroMetrics();
    const profile = model.profile;
    const release = releaseForYear();
    const edition = release.edition_name || runtime.ranking?.release?.edition_name || `${tr("reportName")} ${release.release_year || runtime.year}`;
    return `
      <header class="sdg-hero">
        <div class="sdg-hero-grid">
          <div class="sdg-hero-copy">
            <p class="sdg-kicker">${escapeHtml(tr("group"))}</p>
            <div class="sdg-chip-row"><span class="sdg-official-chip"><i aria-hidden="true"></i>${escapeHtml(tr("officialData"))}</span><span class="sdg-edition-chip">${escapeHtml(edition)}</span></div>
            <h1>${escapeHtml(tr("indexName"))}</h1>
            <p class="sdg-lead">${escapeHtml(tr("lead"))}</p>
          </div>
          <div class="sdg-hero-country">
            <div class="sdg-country-ident">${sourceFlag(profile, "sdg-hero-flag")}<div><span>${escapeHtml(runtime.iso3)}</span><h2>${escapeHtml(countryName(profile))}</h2><p>${escapeHtml([profile.region, profile.income_group].filter(Boolean).join(" · ") || edition)}</p></div></div>
            <div class="sdg-hero-score">${scoreRing(model.score)}<div class="sdg-rank-block"><span>${escapeHtml(tr("officialRank"))}</span><strong>${model.rank == null ? escapeHtml(tr("unranked")) : `#${formatInteger(model.rank)}`}</strong><small>${escapeHtml(tr("officialLabel"))}</small></div></div>
          </div>
        </div>
        <div class="sdg-goal-ribbon" aria-hidden="true">${Array.from({ length: 17 }, (_, index) => `<i style="--goal-color:${goalColor(index + 1)}"></i>`).join("")}</div>
      </header>`;
  }

  function controlBar() {
    const items = runtime.ranking?.items || [];
    const countries = [...items].sort((a, b) => countryName(a).localeCompare(countryName(b), runtime.lang));
    const years = [...runtime.years].sort((a, b) => Number(b.reference_year) - Number(a.reference_year));
    return `
      <section class="sdg-control-bar" aria-label="${escapeHtml(`${tr("country")} · ${tr("year")}`)}">
        <label class="sdg-control sdg-control-country"><span>${escapeHtml(tr("country"))}</span><div>${sourceFlag(selectedRankingItem(), "sdg-control-flag")}<select data-sdg-country aria-label="${escapeHtml(tr("selectCountry"))}">${countries.map((item) => `<option value="${escapeHtml(item.iso3)}" ${item.iso3 === runtime.iso3 ? "selected" : ""}>${escapeHtml(countryName(item))} · ${escapeHtml(item.iso3)}</option>`).join("")}</select></div></label>
        <label class="sdg-control"><span>${escapeHtml(tr("year"))}</span><select data-sdg-year aria-label="${escapeHtml(tr("selectYear"))}">${years.map((item) => `<option value="${item.reference_year}" ${Number(item.reference_year) === Number(runtime.year) ? "selected" : ""}>${item.reference_year} · ${escapeHtml(item.edition_name || item.release_year || "")}</option>`).join("")}</select></label>
        <div class="sdg-control-summary"><span>${escapeHtml(tr("edition"))}</span><strong>${escapeHtml(releaseForYear().edition_name || runtime.ranking?.release?.edition_name || runtime.releaseId || "—")}</strong><small>${escapeHtml(runtime.releaseId || "")}</small></div>
        <div class="sdg-control-actions"><button type="button" class="sdg-button sdg-button-secondary" data-sdg-action="share"><span aria-hidden="true">⌁</span>${escapeHtml(tr("share"))}</button><button type="button" class="sdg-button" data-sdg-action="provenance"><span aria-hidden="true">◎</span>${escapeHtml(tr("data"))}</button></div>
      </section>`;
  }

  function tabs() {
    return `<nav class="sdg-tabs" role="tablist" aria-label="${escapeHtml(tr("shortName"))}" aria-description="${escapeHtml(tr("keyboardTabs"))}">${VIEW_KEYS.map((key) => `<button type="button" id="sdg-tab-${runtime.id}-${key}" role="tab" aria-selected="${runtime.view === key}" aria-controls="sdg-panel-${runtime.id}-${key}" tabindex="${runtime.view === key ? "0" : "-1"}" data-sdg-view="${key}"><span>${escapeHtml(tr(key === "methodology" ? "methodologyTab" : key))}</span>${key === "goals" ? "<b>17</b>" : key === "indicators" && runtime.indicatorsPayload?.total ? `<b>${formatInteger(runtime.indicatorsPayload.total)}</b>` : ""}</button>`).join("")}</nav>`;
  }

  function sectionHeading(kicker, title, text, extra = "") {
    return `<div class="sdg-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</div>`;
  }

  function metricCard(label, value, note, { derived = false, tone = "" } = {}) {
    return `<article class="sdg-metric-card ${derived ? "is-derived" : "is-official"} ${tone ? `is-${tone}` : ""}"><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></article>`;
  }

  function featureIso(feature) {
    const properties = feature?.properties || {};
    const candidates = [feature?.id, properties.iso3, properties.ISO3, properties.iso_a3, properties.ISO_A3, properties.ISO_A3_EH, properties.ADM0_A3, properties.adm0_a3, properties.gu_a3, properties.id];
    for (const candidate of candidates) {
      const code = String(candidate || "").trim().toUpperCase();
      if (/^[A-Z]{3}$/.test(code) && code !== "-99") return code;
    }
    return "";
  }

  function projectPoint(point, width, height) {
    const lon = Number(point?.[0]);
    const lat = Number(point?.[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
  }

  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    const ringPath = (ring) => {
      const points = ring.map((point) => projectPoint(point, width, height)).filter(Boolean);
      if (!points.length) return "";
      return `M${points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join("L")}Z`;
    };
    if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath).join("");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon) => polygon.map(ringPath)).join("");
    return "";
  }

  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="sdg-map-fallback"><span aria-hidden="true">⌖</span><p>${escapeHtml(tr("mapUnavailable"))}</p></div>`;
    const scores = new Map((runtime.ranking?.items || []).map((item) => [item.iso3, item]));
    const width = 1000;
    const height = 500;
    const paths = runtime.geo.features.map((feature) => {
      const iso3 = featureIso(feature);
      const item = scores.get(iso3);
      const path = geometryPath(feature.geometry, width, height);
      if (!path) return "";
      const hasValue = numeric(item?.score) != null;
      const title = hasValue ? `${countryName(item)} · ${formatNumber(item.score, 1)}` : iso3 || "";
      return `<path d="${path}" class="sdg-map-country" data-tone="${scoreTone(item?.score)}" data-sdg-map-iso="${escapeHtml(iso3)}" data-has-value="${hasValue}" data-selected="${iso3 === runtime.iso3}" aria-hidden="true"><title>${escapeHtml(title)}</title></path>`;
    }).join("");
    return `<svg class="sdg-map-canvas" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${paths}</svg>`;
  }

  function mapLegend() {
    return `<div class="sdg-map-legend"><span>0</span><i aria-hidden="true">${Array.from({ length: 7 }, (_, index) => `<b data-tone="${index + 1}"></b>`).join("")}</i><span>100</span></div>`;
  }

  function compactGoalGrid({ limit = 17 } = {}) {
    return `<div class="sdg-goal-grid sdg-goal-grid-compact">${Array.from({ length: Math.min(17, limit) }, (_, index) => goalCard(goalModel(index + 1), { compact: true })).join("")}</div>`;
  }

  function statusBadge(status, { compact = false } = {}) {
    const normalized = STATUS_ORDER[status] !== undefined ? status : "data_unavailable";
    return `<span class="sdg-status-badge" data-status="${normalized}" title="${escapeHtml(statusLabel(normalized))}"><i aria-hidden="true"></i>${compact ? "" : escapeHtml(statusLabel(normalized))}</span>`;
  }

  function trendBadge(trend, { compact = false } = {}) {
    const normalized = TREND_ORDER[trend] !== undefined ? trend : "trend_unavailable";
    return `<span class="sdg-trend-badge" data-trend="${normalized}" title="${escapeHtml(trendLabel(normalized))}"><b aria-hidden="true">${trendGlyph(normalized)}</b>${compact ? "" : escapeHtml(trendLabel(normalized))}</span>`;
  }

  function goalCard(goal, { compact = false } = {}) {
    const number = Number(goal.goal_no || goal.number);
    const score = numeric(goal.score);
    return `<button type="button" class="sdg-goal-card ${compact ? "is-compact" : ""} ${number === runtime.selectedGoal ? "is-selected" : ""}" style="--goal-color:${goalColor(number)};--goal-text:${goalTextColor(number)}" data-sdg-goal="${number}" aria-pressed="${number === runtime.selectedGoal}">
      <span class="sdg-goal-number">${number}</span>
      <span class="sdg-goal-name">${escapeHtml(goalName(goal, { short: compact }))}</span>
      <strong>${score == null ? "—" : formatNumber(score, 1)}</strong>
      <span class="sdg-goal-signals">${statusBadge(goal.dashboard_status, { compact: true })}${trendBadge(goal.trend_status, { compact: true })}</span>
    </button>`;
  }

  function selectedGoalPanel() {
    const goal = goalModel(runtime.selectedGoal);
    const number = Number(goal.goal_no || goal.number);
    const series = (runtime.series?.items || []).map((item) => {
      const result = (item.goals || []).find((entry) => Number(entry.goal_no) === number);
      return result ? { year: item.reference_year, value: result.score } : null;
    }).filter(Boolean);
    return `<aside class="sdg-goal-focus" style="--goal-color:${goalColor(number)};--goal-text:${goalTextColor(number)}">
      <div class="sdg-goal-focus-head"><span>${number}</span><div><p>${escapeHtml(tr("selectedGoal"))}</p><h3>${escapeHtml(goalName(goal))}</h3></div></div>
      <div class="sdg-goal-focus-score"><strong>${formatNumber(goal.score, 1)}</strong><span>/ 100</span></div>
      <div class="sdg-goal-focus-signals">${statusBadge(goal.dashboard_status)}${trendBadge(goal.trend_status)}</div>
      ${series.length > 1 ? sparkline(series.map((item) => item.value), { label: `${goalName(goal)} · ${tr("trend")}`, color: goalColor(number) }) : `<p class="sdg-goal-empty">${escapeHtml(tr("noGoalData"))}</p>`}
      <div class="sdg-goal-focus-actions"><button type="button" class="sdg-button sdg-button-secondary" data-sdg-action="goal-indicators" data-goal="${number}">${escapeHtml(tr("viewIndicators"))}</button><button type="button" class="sdg-button sdg-button-ghost" data-sdg-action="goal-ranking" data-goal="${number}">${escapeHtml(tr("compareCountries"))}</button></div>
    </aside>`;
  }

  function overviewPanel() {
    const model = heroMetrics();
    const profile = model.profile;
    const year = yearEntry();
    return `<section id="sdg-panel-${runtime.id}-overview" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-overview" tabindex="0" data-sdg-panel="overview">
      ${sectionHeading(tr("overview"), tr("overviewHeading"), tr("overviewText"))}
      <div class="sdg-overview-metrics">
        ${metricCard(tr("officialRank"), model.rank == null ? escapeHtml(tr("unranked")) : `#${formatInteger(model.rank)}`, tr("officialLabel"), { tone: "rank" })}
        ${metricCard(tr("worldMedian"), formatNumber(model.sampleMedian, 1), tr("derivedLabel"), { derived: true })}
        ${metricCard(tr("gapLeader"), `${formatSigned(model.gapLeader, 1)} ${runtime.lang === "ru" ? "п." : "pts"}`, tr("derivedLabel"), { derived: true })}
        ${metricCard(tr("distribution"), model.percentile == null ? "—" : `${formatInteger(model.percentile)}%`, tr("derivedLabel"), { derived: true })}
        ${metricCard(tr("spillover"), formatNumber(profile.spillover_score, 1), tr("officialLabel"))}
        ${metricCard(tr("progress2015"), formatSigned(profile.progress_since_2015, 1), tr("officialLabel"), { tone: numeric(profile.progress_since_2015) >= 0 ? "positive" : "negative" })}
      </div>
      <div class="sdg-overview-grid">
        <article class="sdg-card sdg-map-card">
          <div class="sdg-card-head"><div><p>${escapeHtml(tr("overview"))}</p><h3>${escapeHtml(tr("geography"))}</h3></div><span>${formatInteger(runtime.ranking?.total || year.profile_count || 0)} · ${runtime.year}</span></div>
          <p class="sdg-card-hint">${escapeHtml(tr("mapHint"))}</p>
          <div class="sdg-map-wrap">${mapMarkup()}</div>${mapLegend()}
        </article>
        <article class="sdg-card sdg-profile-card">
          <div class="sdg-card-head"><div><p>${escapeHtml(tr("profile"))}</p><h3>${escapeHtml(tr("selectedProfile"))}</h3></div><button type="button" class="sdg-icon-button" data-sdg-action="provenance" aria-label="${escapeHtml(tr("provenanceTitle"))}">◎</button></div>
          <div class="sdg-profile-ident">${sourceFlag(profile, "sdg-profile-flag")}<div><h3>${escapeHtml(countryName(profile))}</h3><span>${escapeHtml(runtime.iso3)} · ${runtime.year}</span></div></div>
          <dl class="sdg-profile-list"><div><dt>${escapeHtml(tr("score"))}</dt><dd>${formatNumber(profile.score, 1)}</dd></div><div><dt>${escapeHtml(tr("officialRank"))}</dt><dd>${profile.official_rank == null ? escapeHtml(tr("unranked")) : `#${formatInteger(profile.official_rank)}`}</dd></div><div><dt>${escapeHtml(tr("spillover"))}</dt><dd>${formatNumber(profile.spillover_score, 1)}</dd></div><div><dt>${escapeHtml(tr("progress2015"))}</dt><dd>${formatSigned(profile.progress_since_2015, 1)}</dd></div></dl>
          <div class="sdg-profile-benchmark"><div><span>${escapeHtml(tr("leader"))}</span><strong>${escapeHtml(countryName(model.leader))}</strong><b>${formatNumber(model.leaderScore, 1)}</b></div><div><span>${escapeHtml(tr("worldMedian"))}</span><strong>${escapeHtml(tr("derivedLabel"))}</strong><b>${formatNumber(model.sampleMedian, 1)}</b></div></div>
        </article>
      </div>
      <div class="sdg-dashboard-layout">
        <article class="sdg-card sdg-dashboard-card"><div class="sdg-card-head"><div><p>${escapeHtml(tr("goals"))}</p><h3>${escapeHtml(tr("goalDashboard"))}</h3></div><span>${escapeHtml(tr("clickGoal"))}</span></div><p class="sdg-card-hint">${escapeHtml(tr("goalDashboardText"))}</p>${compactGoalGrid()}</article>
        ${selectedGoalPanel()}
      </div>
    </section>`;
  }

  function statusLegend() {
    const statuses = ["achieved", "challenges_remain", "significant_challenges", "major_challenges", "data_unavailable"];
    return `<div class="sdg-legend-list">${statuses.map((item) => statusBadge(item)).join("")}</div>`;
  }

  function trendLegend() {
    const trends = ["on_track_or_maintaining", "moderately_improving", "stagnating", "decreasing", "trend_unavailable"];
    return `<div class="sdg-legend-list">${trends.map((item) => trendBadge(item)).join("")}</div>`;
  }

  function goalExtremes() {
    const values = Array.from({ length: 17 }, (_, index) => goalModel(index + 1)).filter((goal) => numeric(goal.score) != null);
    return {
      strengths: [...values].sort((a, b) => numeric(b.score) - numeric(a.score)).slice(0, 3),
      priorities: [...values].sort((a, b) => numeric(a.score) - numeric(b.score)).slice(0, 3),
    };
  }

  function goalSummaryList(items, title, kind) {
    return `<article class="sdg-goal-summary is-${kind}"><h3>${escapeHtml(title)}</h3>${items.length ? `<ol>${items.map((item) => `<li><span style="--goal-color:${goalColor(item.goal_no || item.number)}">${item.goal_no || item.number}</span><div><strong>${escapeHtml(goalName(item))}</strong><small>${statusLabel(item.dashboard_status)}</small></div><b>${formatNumber(item.score, 1)}</b></li>`).join("")}</ol>` : `<p>${escapeHtml(tr("noGoalScores"))}</p>`}</article>`;
  }

  function goalsPanel() {
    const extremes = goalExtremes();
    return `<section id="sdg-panel-${runtime.id}-goals" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-goals" tabindex="0" data-sdg-panel="goals">
      ${sectionHeading(tr("goals"), tr("goalsHeading"), tr("goalsText"))}
      <div class="sdg-goals-main"><div class="sdg-goal-grid">${Array.from({ length: 17 }, (_, index) => goalCard(goalModel(index + 1))).join("")}</div>${selectedGoalPanel()}</div>
      <div class="sdg-goals-lower">
        <div class="sdg-legend-card"><div><h3>${escapeHtml(tr("statusLegend"))}</h3>${statusLegend()}</div><div><h3>${escapeHtml(tr("trendLegend"))}</h3>${trendLegend()}</div></div>
        <div class="sdg-goal-extremes">${goalSummaryList(extremes.strengths, tr("strengths"), "strength")}${goalSummaryList(extremes.priorities, tr("priorities"), "priority")}</div>
      </div>
    </section>`;
  }

  function chartModel(items, accessor) {
    const points = items.map((item) => ({ year: Number(item.reference_year ?? item.observation_year ?? item.year), value: numeric(accessor(item)) })).filter((item) => Number.isFinite(item.year) && item.value != null).sort((a, b) => a.year - b.year);
    if (!points.length) return { points: [], min: 0, max: 100 };
    const values = points.map((item) => item.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const padding = Math.max((max - min) * 0.12, 0.5);
    return { points, min: min - padding, max: max + padding };
  }

  function lineChart(items, accessor, { label, invert = false, digits = 1, color = "var(--sdg-accent)" } = {}) {
    const model = chartModel(items, accessor);
    if (!model.points.length) return `<div class="sdg-chart-empty">—</div>`;
    const width = 900;
    const height = 280;
    const pad = { left: 58, right: 24, top: 24, bottom: 42 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const x = (index) => pad.left + (model.points.length === 1 ? innerW / 2 : (index / (model.points.length - 1)) * innerW);
    const y = (value) => {
      const ratio = (value - model.min) / (model.max - model.min || 1);
      return pad.top + (invert ? ratio : 1 - ratio) * innerH;
    };
    const path = model.points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
    const area = `${path} L${x(model.points.length - 1).toFixed(1)},${(pad.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;
    const grid = Array.from({ length: 5 }, (_, index) => {
      const yy = pad.top + (index / 4) * innerH;
      const raw = invert ? model.min + ((4 - index) / 4) * (model.max - model.min) : model.max - (index / 4) * (model.max - model.min);
      return `<g><line x1="${pad.left}" y1="${yy}" x2="${width - pad.right}" y2="${yy}"></line><text x="${pad.left - 10}" y="${yy + 4}" text-anchor="end">${escapeHtml(formatNumber(raw, digits))}</text></g>`;
    }).join("");
    const pointMarkup = model.points.map((point, index) => `<g><circle cx="${x(index)}" cy="${y(point.value)}" r="5"><title>${point.year}: ${formatNumber(point.value, digits)}</title></circle><text x="${x(index)}" y="${height - 14}" text-anchor="middle">${point.year}</text></g>`).join("");
    return `<svg class="sdg-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label || "chart")}" style="--chart-series:${escapeHtml(color)}"><g class="sdg-chart-grid">${grid}</g><path class="sdg-chart-area" d="${area}"></path><path class="sdg-chart-line" d="${path}"></path><g class="sdg-chart-points">${pointMarkup}</g></svg>`;
  }

  function sparkline(values, { label = "", color = "var(--sdg-accent)" } = {}) {
    const points = values.map(numeric).filter((value) => value != null);
    if (points.length < 2) return "";
    const width = 220;
    const height = 64;
    let min = Math.min(...points);
    let max = Math.max(...points);
    if (min === max) { min -= 1; max += 1; }
    const x = (index) => 4 + (index / (points.length - 1)) * (width - 8);
    const y = (value) => 4 + (1 - (value - min) / (max - min)) * (height - 8);
    const path = points.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
    return `<svg class="sdg-sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}" style="--spark-color:${escapeHtml(color)}"><path d="${path}"></path><circle cx="${x(points.length - 1)}" cy="${y(points[points.length - 1])}" r="4"></circle></svg>`;
  }

  function trendMetricAccessor(item) {
    if (runtime.trendMetric === "official_rank") return item.official_rank;
    if (runtime.trendMetric === "spillover_score") return item.spillover_score;
    return item.score;
  }

  function trendMetricLabel() {
    if (runtime.trendMetric === "official_rank") return tr("rankTrend");
    if (runtime.trendMetric === "spillover_score") return tr("spilloverTrend");
    return tr("scoreTrend");
  }

  function trendSummary(items) {
    const points = chartModel(items, trendMetricAccessor).points;
    if (!points.length) return { first: null, last: null, change: null, best: null };
    const first = points[0];
    const last = points[points.length - 1];
    const values = points.map((item) => item.value);
    const best = runtime.trendMetric === "official_rank" ? Math.min(...values) : Math.max(...values);
    return { first, last, change: last.value - first.value, best, count: points.length };
  }

  function seriesTable(items) {
    return `<details class="sdg-chart-table"><summary>${escapeHtml(tr("accessibleTable"))}</summary><div class="sdg-table-scroll"><table><thead><tr><th>${escapeHtml(tr("year"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("spillover"))}</th><th>${escapeHtml(tr("progress2015"))}</th></tr></thead><tbody>${items.map((item) => `<tr><td>${item.reference_year}</td><td>${formatNumber(item.score, 1)}</td><td>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</td><td>${formatNumber(item.spillover_score, 1)}</td><td>${formatSigned(item.progress_since_2015, 1)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function goalTrajectoryRows(items) {
    return Array.from({ length: 17 }, (_, index) => {
      const number = index + 1;
      const meta = selectedGoalMeta(number);
      const values = items.map((item) => (item.goals || []).find((goal) => Number(goal.goal_no) === number)?.score).map(numeric).filter((value) => value != null);
      const change = values.length > 1 ? values[values.length - 1] - values[0] : null;
      return `<button type="button" class="sdg-goal-trajectory-row" data-sdg-goal="${number}" style="--goal-color:${goalColor(number)}"><span>${number}</span><div><strong>${escapeHtml(goalName(meta, { short: true }))}</strong><small>${values.length ? `${formatNumber(values[values.length - 1], 1)} · ${formatSigned(change, 1)}` : "—"}</small></div>${values.length > 1 ? sparkline(values, { label: goalName(meta), color: goalColor(number) }) : "<i>—</i>"}</button>`;
    }).join("");
  }

  function trendPanel() {
    const items = runtime.series?.items || [];
    const summary = trendSummary(items);
    const invert = runtime.trendMetric === "official_rank";
    const digits = invert ? 0 : 1;
    return `<section id="sdg-panel-${runtime.id}-trend" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-trend" tabindex="0" data-sdg-panel="trend">
      ${sectionHeading(tr("trend"), tr("trendHeading"), tr("trendText"), `<span class="sdg-comparability-chip">${escapeHtml(tr("comparabilityNotice"))}</span>`)}
      <div class="sdg-trend-controls"><label><span>${escapeHtml(tr("metric"))}</span><select data-sdg-trend-metric><option value="score" ${runtime.trendMetric === "score" ? "selected" : ""}>${escapeHtml(tr("scoreTrend"))}</option><option value="official_rank" ${runtime.trendMetric === "official_rank" ? "selected" : ""}>${escapeHtml(tr("rankTrend"))}</option><option value="spillover_score" ${runtime.trendMetric === "spillover_score" ? "selected" : ""}>${escapeHtml(tr("spilloverTrend"))}</option></select></label><span>${escapeHtml(runtime.series?.release_id || runtime.releaseId || "")}</span></div>
      <div class="sdg-trend-metrics">${metricCard(tr("firstYear"), summary.first?.year ?? "—", summary.first ? formatNumber(summary.first.value, digits) : "—")}${metricCard(tr("lastYear"), summary.last?.year ?? "—", summary.last ? formatNumber(summary.last.value, digits) : "—")}${metricCard(tr("periodChange"), formatSigned(summary.change, digits), tr("derivedLabel"), { derived: true, tone: numeric(summary.change) >= 0 && !invert || numeric(summary.change) <= 0 && invert ? "positive" : "negative" })}${metricCard(tr("bestValue"), formatNumber(summary.best, digits), tr("derivedLabel"), { derived: true })}${metricCard(tr("observations"), formatInteger(summary.count || 0), tr("officialData"))}</div>
      <article class="sdg-card sdg-chart-card"><div class="sdg-card-head"><div><p>${escapeHtml(tr("trend"))}</p><h3>${escapeHtml(trendMetricLabel())}</h3></div><span>${escapeHtml(countryName(runtime.profile))} · ${runtime.iso3}</span></div>${lineChart(items, trendMetricAccessor, { label: `${trendMetricLabel()} · ${countryName(runtime.profile)}`, invert, digits })}${seriesTable(items)}</article>
      <article class="sdg-card sdg-goal-trajectories"><div class="sdg-card-head"><div><p>${escapeHtml(tr("goals"))}</p><h3>${escapeHtml(tr("goalTrajectory"))}</h3></div><span>${escapeHtml(`${items[0]?.reference_year || "—"}–${items[items.length - 1]?.reference_year || "—"}`)}</span></div><div class="sdg-goal-trajectory-grid">${goalTrajectoryRows(items)}</div></article>
    </section>`;
  }

  function filteredIndicators() {
    const items = Array.isArray(runtime.indicatorsPayload?.items) ? runtime.indicatorsPayload.items : [];
    const needle = runtime.indicatorQuery.trim().toLocaleLowerCase(runtime.lang);
    return items.filter((item) => {
      if (runtime.indicatorGoal && Number(item.goal_no) !== Number(runtime.indicatorGoal)) return false;
      if (runtime.indicatorScope === "global" && Boolean(item.oecd_only)) return false;
      if (runtime.indicatorScope === "oecd" && !Boolean(item.oecd_only)) return false;
      if (needle) {
        const haystack = [item.indicator_code, item.name_en, item.description, item.unit, item.data_source].filter(Boolean).join(" ").toLocaleLowerCase(runtime.lang);
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  function indicatorFilters() {
    return `<div class="sdg-indicator-filters"><label><span>${escapeHtml(tr("searchIndicator"))}</span><input type="search" value="${escapeHtml(runtime.indicatorQuery)}" placeholder="${escapeHtml(tr("searchIndicator"))}" data-sdg-indicator-query></label><label><span>${escapeHtml(tr("goal"))}</span><select data-sdg-indicator-goal><option value="0">${escapeHtml(tr("allGoals"))}</option>${runtime.goals.map((goal) => `<option value="${goal.number}" ${Number(runtime.indicatorGoal) === Number(goal.number) ? "selected" : ""}>${goal.number}. ${escapeHtml(goalName(goal, { short: true }))}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("oecdFilter"))}</span><select data-sdg-indicator-scope><option value="all" ${runtime.indicatorScope === "all" ? "selected" : ""}>${escapeHtml(tr("allIndicators"))}</option><option value="global" ${runtime.indicatorScope === "global" ? "selected" : ""}>${escapeHtml(tr("globalOnly"))}</option><option value="oecd" ${runtime.indicatorScope === "oecd" ? "selected" : ""}>${escapeHtml(tr("oecdOnly"))}</option></select></label></div>`;
  }

  function indicatorList() {
    const items = filteredIndicators();
    const totalPages = Math.max(1, Math.ceil(items.length / runtime.indicatorPageSize));
    runtime.indicatorPage = Math.min(Math.max(1, runtime.indicatorPage), totalPages);
    const start = (runtime.indicatorPage - 1) * runtime.indicatorPageSize;
    const pageItems = items.slice(start, start + runtime.indicatorPageSize);
    return `<div class="sdg-indicator-list" role="listbox" aria-label="${escapeHtml(tr("indicators"))}">${pageItems.map((item) => {
      const number = Number(item.goal_no);
      return `<button type="button" role="option" aria-selected="${item.indicator_code === runtime.indicatorCode}" class="sdg-indicator-item ${item.indicator_code === runtime.indicatorCode ? "is-selected" : ""}" data-sdg-indicator="${escapeHtml(item.indicator_code)}" style="--goal-color:${goalColor(number)}"><span class="sdg-indicator-goal">${number}</span><div><strong>${escapeHtml(item.indicator_code)}</strong><p>${escapeHtml(indicatorName(item))}</p><small>${escapeHtml(item.unit || tr("notAvailable"))} · ${formatInteger(item.value_count || 0)} ${escapeHtml(tr("valuesAvailable").toLowerCase())}</small></div>${item.oecd_only ? `<b>OECD</b>` : ""}</button>`;
    }).join("") || `<p class="sdg-no-results">${escapeHtml(tr("noMatches"))}</p>`}</div><div class="sdg-pagination"><span>${escapeHtml(tr("showing"))} ${items.length ? start + 1 : 0}–${Math.min(start + runtime.indicatorPageSize, items.length)} ${escapeHtml(tr("of"))} ${items.length}</span><div><button type="button" data-sdg-indicator-page="previous" ${runtime.indicatorPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${runtime.indicatorPage} / ${totalPages}</span><button type="button" data-sdg-indicator-page="next" ${runtime.indicatorPage >= totalPages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div></div>`;
  }

  function selectedIndicator() {
    return (runtime.indicatorsPayload?.items || []).find((item) => item.indicator_code === runtime.indicatorCode)
      || runtime.indicatorSeriesPayload?.indicator
      || null;
  }

  function indicatorDetail() {
    const indicator = selectedIndicator();
    if (!indicator) return `<div class="sdg-indicator-empty"><span aria-hidden="true">123</span><h3>${escapeHtml(tr("selectIndicator"))}</h3></div>`;
    const number = Number(indicator.goal_no);
    const items = runtime.indicatorSeriesPayload?.items || [];
    const latest = [...items].filter((item) => numeric(item.value_numeric) != null || item.value_text).sort((a, b) => Number(b.observation_year) - Number(a.observation_year))[0] || null;
    return `<article class="sdg-indicator-detail" style="--goal-color:${goalColor(number)}">
      <header><span>${number}</span><div><p>${escapeHtml(indicator.indicator_code)}</p><h3>${escapeHtml(indicatorName(indicator))}</h3></div>${indicator.oecd_only ? `<b>OECD</b>` : ""}</header>
      <div class="sdg-indicator-facts"><dl><div><dt>${escapeHtml(tr("unit"))}</dt><dd>${escapeHtml(indicator.unit || tr("notAvailable"))}</dd></div><div><dt>${escapeHtml(tr("direction"))}</dt><dd>${escapeHtml(preferredDirectionLabel(indicator.preferred_direction))}</dd></div><div><dt>${escapeHtml(tr("source"))}</dt><dd>${escapeHtml(indicator.data_source || tr("notAvailable"))}</dd></div><div><dt>${escapeHtml(tr("yearsAvailable"))}</dt><dd>${escapeHtml([indicator.year_min, indicator.year_max].filter((value) => value != null).join("–") || tr("notAvailable"))}</dd></div></dl></div>
      ${indicator.description ? `<p class="sdg-indicator-description">${escapeHtml(indicator.description)}</p>` : ""}
      <div class="sdg-indicator-current"><div><span>${escapeHtml(tr("latestObservation"))}</span><strong>${latest ? escapeHtml(latest.value_numeric != null ? formatNumber(latest.value_numeric, 2) : latest.value_text) : "—"}</strong><small>${latest?.observation_year || "—"} · ${escapeHtml(countryName(runtime.profile))}</small></div>${items.length > 1 ? sparkline(items.map((item) => item.value_numeric), { label: `${indicatorName(indicator)} · ${countryName(runtime.profile)}`, color: goalColor(number) }) : ""}</div>
      <div class="sdg-indicator-chart"><h4>${escapeHtml(tr("indicatorSeries"))}</h4>${items.length ? lineChart(items, (item) => item.value_numeric, { label: `${indicatorName(indicator)} · ${countryName(runtime.profile)}`, color: goalColor(number), digits: 2 }) : `<p class="sdg-no-results">${escapeHtml(tr("noIndicatorSeries"))}</p>`}</div>
      <details class="sdg-indicator-metadata"><summary>${escapeHtml(tr("openSourceMetadata"))}</summary><pre>${escapeHtml(JSON.stringify({ indicator_code: indicator.indicator_code, goal_no: indicator.goal_no, unit: indicator.unit, preferred_direction: indicator.preferred_direction, data_source: indicator.data_source, oecd_only: Boolean(indicator.oecd_only), used_for_index: Boolean(indicator.used_for_index), used_for_dashboard: Boolean(indicator.used_for_dashboard), used_for_trend: Boolean(indicator.used_for_trend), lower_bound: indicator.lower_bound, upper_bound: indicator.upper_bound, green_threshold: indicator.green_threshold, red_threshold: indicator.red_threshold }, null, 2))}</pre></details>
    </article>`;
  }

  function indicatorsPanel() {
    if (!runtime.indicatorsPayload) {
      return `<section id="sdg-panel-${runtime.id}-indicators" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-indicators" tabindex="0" data-sdg-panel="indicators"><div class="sdg-inline-loading" role="status"><div class="sdg-loading-wheel is-small" aria-hidden="true">${Array.from({ length: 17 }, (_, index) => `<i style="--i:${index};--goal-color:${goalColor(index + 1)}"></i>`).join("")}<span>SDG</span></div><p>${escapeHtml(tr("loadingDetail"))}</p></div></section>`;
    }
    return `<section id="sdg-panel-${runtime.id}-indicators" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-indicators" tabindex="0" data-sdg-panel="indicators">
      ${sectionHeading(tr("indicators"), tr("indicatorsHeading"), tr("indicatorsText"), `<span class="sdg-count-chip">${formatInteger(runtime.indicatorsPayload.total || 0)}</span>`)}
      ${indicatorFilters()}
      <div class="sdg-indicator-workspace"><aside class="sdg-indicator-catalog">${indicatorList()}</aside>${indicatorDetail()}</div>
    </section>`;
  }

  function currentRankingPayload() {
    return runtime.rankingGoal ? (runtime.goalRanking || { items: [], total: 0 }) : runtime.ranking;
  }

  function filteredRanking() {
    const items = Array.isArray(currentRankingPayload()?.items) ? currentRankingPayload().items : [];
    const needle = runtime.rankingQuery.trim().toLocaleLowerCase(runtime.lang);
    return items.filter((item) => {
      if (!runtime.rankingIncludeUnranked && item.official_rank == null) return false;
      if (runtime.rankingRegion && item.region !== runtime.rankingRegion) return false;
      if (runtime.rankingIncome && item.income_group !== runtime.rankingIncome) return false;
      if (needle) {
        const haystack = [item.iso3, item.country_name_source, item.name_ru, item.name_en].filter(Boolean).join(" ").toLocaleLowerCase(runtime.lang);
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  function rankingFilters() {
    const baseItems = runtime.ranking?.items || [];
    const regions = [...new Set(baseItems.map((item) => item.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, runtime.lang));
    const incomes = [...new Set(baseItems.map((item) => item.income_group).filter(Boolean))].sort((a, b) => a.localeCompare(b, runtime.lang));
    return `<div class="sdg-ranking-filters"><label class="sdg-ranking-search"><span>${escapeHtml(tr("searchCountry"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchCountry"))}" data-sdg-ranking-query></label><label><span>${escapeHtml(tr("metric"))}</span><select data-sdg-ranking-goal><option value="0">${escapeHtml(tr("overallIndex"))}</option>${runtime.goals.map((goal) => `<option value="${goal.number}" ${Number(runtime.rankingGoal) === Number(goal.number) ? "selected" : ""}>${goal.number}. ${escapeHtml(goalName(goal, { short: true }))}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("region"))}</span><select data-sdg-ranking-region><option value="">${escapeHtml(tr("allRegions"))}</option>${regions.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingRegion ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("income"))}</span><select data-sdg-ranking-income><option value="">${escapeHtml(tr("allIncome"))}</option>${incomes.map((value) => `<option value="${escapeHtml(value)}" ${value === runtime.rankingIncome ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("rowsPerPage"))}</span><select data-sdg-ranking-size>${[25, 50, 100].map((value) => `<option value="${value}" ${runtime.rankingPageSize === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="sdg-checkbox"><input type="checkbox" data-sdg-ranking-unranked ${runtime.rankingIncludeUnranked ? "checked" : ""}><span>${escapeHtml(tr("includeUnranked"))}</span></label></div>`;
  }

  function rankingTable() {
    const items = filteredRanking();
    const totalPages = Math.max(1, Math.ceil(items.length / runtime.rankingPageSize));
    runtime.rankingPage = Math.min(Math.max(1, runtime.rankingPage), totalPages);
    const start = (runtime.rankingPage - 1) * runtime.rankingPageSize;
    const pageItems = items.slice(start, start + runtime.rankingPageSize);
    const goalMode = Boolean(runtime.rankingGoal);
    return `<div class="sdg-ranking-meta"><span>${escapeHtml(tr("showing"))} ${items.length ? start + 1 : 0}–${Math.min(start + runtime.rankingPageSize, items.length)} ${escapeHtml(tr("of"))} ${items.length}</span><div><button type="button" class="sdg-button sdg-button-secondary" data-sdg-action="export">${escapeHtml(tr("export"))}</button></div></div>${goalMode ? `<aside class="sdg-goal-sort-notice"><span aria-hidden="true">i</span><p>${escapeHtml(tr("goalSortNotice"))}</p></aside>` : ""}<div class="sdg-table-scroll"><table class="sdg-table"><thead><tr><th>${escapeHtml(tr("rank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(goalMode ? tr("goalScore") : tr("score"))}</th>${goalMode ? `<th>${escapeHtml(tr("dashboardStatus"))}</th><th>${escapeHtml(tr("trendStatus"))}</th>` : `<th>${escapeHtml(tr("spillover"))}</th><th>${escapeHtml(tr("progress2015"))}</th>`}<th>${escapeHtml(tr("region"))}</th><th><span class="sdg-sr-only">${escapeHtml(tr("openProfile"))}</span></th></tr></thead><tbody>${pageItems.map((item) => `<tr class="${item.iso3 === runtime.iso3 ? "is-selected" : ""}"><td>${item.official_rank == null ? "—" : `#${formatInteger(item.official_rank)}`}</td><td><button type="button" class="sdg-country-link" data-sdg-country-pick="${escapeHtml(item.iso3)}">${sourceFlag(item, "sdg-table-flag")}<span><strong>${escapeHtml(countryName(item))}</strong><small>${escapeHtml(item.iso3)}${item.income_group ? ` · ${escapeHtml(item.income_group)}` : ""}</small></span></button></td><td><span class="sdg-score-cell" data-tone="${scoreTone(goalMode ? item.goal_score : item.score)}"><strong>${formatNumber(goalMode ? item.goal_score : item.score, 1)}</strong><i style="--score:${Math.max(0, Math.min(100, numeric(goalMode ? item.goal_score : item.score) || 0))}%"></i></span></td>${goalMode ? `<td>${statusBadge(item.dashboard_status, { compact: true })}<span class="sdg-table-signal-text">${escapeHtml(statusLabel(item.dashboard_status))}</span></td><td>${trendBadge(item.trend_status, { compact: true })}<span class="sdg-table-signal-text">${escapeHtml(trendLabel(item.trend_status))}</span></td>` : `<td>${formatNumber(item.spillover_score, 1)}</td><td class="${numeric(item.progress_since_2015) >= 0 ? "is-positive" : "is-negative"}">${formatSigned(item.progress_since_2015, 1)}</td>`}<td>${escapeHtml(item.region || "—")}</td><td><button type="button" class="sdg-row-arrow" data-sdg-country-pick="${escapeHtml(item.iso3)}" aria-label="${escapeHtml(`${tr("openProfile")}: ${countryName(item)}`)}">→</button></td></tr>`).join("") || `<tr><td colspan="8"><p class="sdg-no-results">${escapeHtml(tr("noMatches"))}</p></td></tr>`}</tbody></table></div><div class="sdg-pagination"><span>${escapeHtml(tr("page"))} ${runtime.rankingPage} / ${totalPages}</span><div><button type="button" data-sdg-page="previous" ${runtime.rankingPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><button type="button" data-sdg-page="next" ${runtime.rankingPage >= totalPages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div></div>`;
  }

  function rankingPanel() {
    return `<section id="sdg-panel-${runtime.id}-ranking" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-ranking" tabindex="0" data-sdg-panel="ranking">
      ${sectionHeading(tr("ranking"), tr("rankingHeading"), tr("rankingText"), `<span class="sdg-count-chip">${formatInteger(currentRankingPayload()?.total || 0)}</span>`)}
      ${rankingFilters()}
      <article class="sdg-card sdg-ranking-card">${rankingTable()}</article>
    </section>`;
  }

  function auditModel() {
    const audit = runtime.audit?.audit || {};
    const snapshot = audit.snapshot || {};
    const issueSummary = audit.issue_summary || audit.issues || {};
    const errors = numeric(issueSummary.error_count ?? audit.error_count ?? audit.stored_error_count) || 0;
    const snapshotPresent = Boolean(snapshot.exists ?? snapshot.present ?? audit.snapshot_exists);
    const hashMatches = Boolean(snapshot.sha256_matches ?? snapshot.hash_matches ?? audit.raw_snapshot_sha256_matches);
    const ok = Boolean(runtime.audit?.data_status === "available" && (audit.ok ?? (snapshotPresent && hashMatches && !errors)));
    return { audit, snapshot, errors, snapshotPresent, hashMatches, ok };
  }

  function dataFootprint() {
    const release = releaseForYear();
    const year = yearEntry();
    return {
      profiles: release.profile_country_count ?? year.profile_count ?? runtime.ranking?.total,
      ranked: release.ranked_country_count ?? year.ranked_count,
      goals: 17,
      indicators: release.indicator_count ?? runtime.indicatorsPayload?.total ?? runtime.metadata?.persisted_metadata?.indicator_count,
      trends: release.trend_status_count ?? runtime.metadata?.persisted_metadata?.trend_indicator_count,
      yearMin: release.reference_year_min ?? runtime.series?.release?.reference_year_min ?? runtime.series?.items?.[0]?.reference_year,
      yearMax: release.reference_year_max ?? runtime.series?.release?.reference_year_max ?? runtime.series?.items?.at?.(-1)?.reference_year,
    };
  }

  function methodLink(url, label) {
    const safe = safeUrl(url);
    return safe ? `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span aria-hidden="true">↗</span></a>` : "";
  }

  function methodologyPanel() {
    const index = runtime.metadata?.index || {};
    const release = releaseForYear();
    const footprint = dataFootprint();
    const audit = auditModel();
    return `<section id="sdg-panel-${runtime.id}-methodology" class="sdg-panel" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-methodology" tabindex="0" data-sdg-panel="methodology">
      ${sectionHeading(tr("methodologyTab"), tr("methodologyHeading"), tr("methodologyText"))}
      <div class="sdg-method-grid">
        <article class="sdg-method-principle"><span>01</span><h3>${escapeHtml(tr("indexPrinciple"))}</h3><p>${escapeHtml(tr("indexPrincipleText"))}</p><dl><div><dt>${escapeHtml(tr("scale"))}</dt><dd>0–100</dd></div><div><dt>${escapeHtml(tr("rankSemantics"))}</dt><dd>${escapeHtml(tr("officialRankOnly"))}</dd></div><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(index.publisher || "SDSN")}</dd></div><div><dt>${escapeHtml(tr("valuesStatus"))}</dt><dd>${escapeHtml(tr("importedOfficial"))}</dd></div></dl></article>
        <article class="sdg-method-principle"><span>02</span><h3>${escapeHtml(tr("dashboardPrinciple"))}</h3><p>${escapeHtml(tr("dashboardPrincipleText"))}</p><div class="sdg-method-legends"><div>${statusLegend()}</div><div>${trendLegend()}</div></div></article>
        <article class="sdg-footprint"><span>03</span><h3>${escapeHtml(tr("dataFootprint"))}</h3><div class="sdg-footprint-grid"><div><strong>${formatInteger(footprint.profiles)}</strong><span>${escapeHtml(tr("profileCoverage"))}</span></div><div><strong>${formatInteger(footprint.ranked)}</strong><span>${escapeHtml(tr("rankedCoverage"))}</span></div><div><strong>${formatInteger(footprint.goals)}</strong><span>${escapeHtml(tr("goalCount"))}</span></div><div><strong>${formatInteger(footprint.indicators)}</strong><span>${escapeHtml(tr("indicatorCount"))}</span></div><div><strong>${formatInteger(footprint.trends)}</strong><span>${escapeHtml(tr("trendCount"))}</span></div><div><strong>${escapeHtml([footprint.yearMin, footprint.yearMax].filter((value) => value != null).join("–") || "—")}</strong><span>${escapeHtml(tr("yearsCovered"))}</span></div></div></article>
      </div>
      <div class="sdg-method-lower">
        <article class="sdg-card sdg-release-passport"><div class="sdg-card-head"><div><p>${escapeHtml(tr("edition"))}</p><h3>${escapeHtml(tr("releaseDetails"))}</h3></div><span>${escapeHtml(release.release_year || runtime.year)}</span></div><dl><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd>${escapeHtml(release.release_id || runtime.releaseId || "—")}</dd></div><div><dt>${escapeHtml(tr("reportTitle"))}</dt><dd>${escapeHtml(release.report_title || release.edition_name || "—")}</dd></div><div><dt>${escapeHtml(tr("doi"))}</dt><dd>${escapeHtml(release.doi || "—")}</dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("snapshotHash"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("transform"))}</dt><dd><code>${escapeHtml([release.transform_id, release.transform_version].filter(Boolean).join(" · ") || "—")}</code></dd></div></dl><div class="sdg-source-links">${methodLink(release.source_url || index.official_source_url, tr("officialSource"))}${methodLink(release.download_url || index.downloads_url, tr("downloads"))}${methodLink(release.methodology_url || index.methodology_url, tr("methodology"))}</div></article>
        <article class="sdg-card sdg-audit-card ${audit.ok ? "is-passed" : "is-attention"}"><div class="sdg-card-head"><div><p>${escapeHtml(tr("data"))}</p><h3>${escapeHtml(tr("audit"))}</h3></div><span>${audit.ok ? "PASS" : "CHECK"}</span></div><div class="sdg-audit-state"><strong>${audit.ok ? "✓" : "!"}</strong><p>${escapeHtml(audit.ok ? tr("auditPassed") : tr("auditAttention"))}</p></div><dl><div><dt>${escapeHtml(tr("snapshotPresent"))}</dt><dd>${audit.snapshotPresent ? "✓" : "—"}</dd></div><div><dt>${escapeHtml(tr("hashMatches"))}</dt><dd>${audit.hashMatches ? "✓" : "—"}</dd></div><div><dt>${escapeHtml(tr("storedErrors"))}</dt><dd>${formatInteger(audit.errors)}</dd></div></dl></article>
      </div>
      <aside class="sdg-method-notice"><span aria-hidden="true">i</span><p>${escapeHtml(tr("methodologyNotice"))}</p></aside>
      <details class="sdg-technical-contract"><summary>${escapeHtml(tr("technicalContract"))}</summary><pre><code>${escapeHtml(JSON.stringify({ module_version: MODULE_VERSION, api_version: runtime.metadata?.api_version, index_code: runtime.metadata?.index_code, rank_semantics: runtime.ranking?.rank_semantics, goal_order_semantics: runtime.goalRanking?.goal_order_semantics, edition_comparability: runtime.metadata?.framework?.edition_comparability, cross_edition_timeseries_forbidden: runtime.metadata?.data_policy?.cross_edition_timeseries_forbidden, data_policy: runtime.metadata?.data_policy }, null, 2))}</code></pre></details>
    </section>`;
  }

  function activePanel() {
    if (runtime.view === "goals") return goalsPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "indicators") return indicatorsPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "methodology") return methodologyPanel();
    return overviewPanel();
  }

  function inactivePanelPlaceholders() {
    return VIEW_KEYS.filter((key) => key !== runtime.view).map((key) => `<section id="sdg-panel-${runtime.id}-${key}" role="tabpanel" aria-labelledby="sdg-tab-${runtime.id}-${key}" hidden></section>`).join("");
  }

  function viewStageMarkup() {
    return `${activePanel()}${inactivePanelPlaceholders()}`;
  }

  function renderAvailable() {
    if (!runtime.root) return;
    setDocumentMeta();
    runtime.root.innerHTML = `<article class="sdg-workspace" data-sdg-workspace data-version="${MODULE_VERSION}" data-sdg-theme="${escapeHtml(runtime.theme)}">${hero()}${controlBar()}${tabs()}<div class="sdg-view-stage">${viewStageMarkup()}</div><footer class="sdg-workspace-footer"><span>${escapeHtml(tr("officialData"))}</span><span>${escapeHtml(runtime.ranking?.rank_semantics || tr("officialRankOnly"))}</span><span>${escapeHtml(`GIR · ${MODULE_VERSION}`)}</span></footer><p class="sdg-sr-only" aria-live="polite" aria-atomic="true" data-sdg-live></p></article>`;
    bindEvents();
  }

  function provenanceRows() {
    const country = runtime.profile || selectedRankingItem() || {};
    const provenance = country.provenance || {};
    const release = releaseForYear();
    const rows = [
      [tr("country"), `${countryName(country)} (${runtime.iso3})`],
      [tr("countrySourceName"), country.country_name_source],
      [tr("observationYear"), country.reference_year || runtime.year],
      [tr("score"), numeric(country.score) != null ? formatNumber(country.score, 6) : null],
      [tr("officialRank"), country.official_rank],
      [tr("spillover"), numeric(country.spillover_score) != null ? formatNumber(country.spillover_score, 6) : null],
      [tr("progress2015"), numeric(country.progress_since_2015) != null ? formatNumber(country.progress_since_2015, 6) : null],
      [tr("releaseId"), country.release_id || runtime.releaseId],
      [tr("releaseYear"), country.release_year || release.release_year],
      [tr("retrievedAt"), country.retrieved_at || release.retrieved_at],
      [tr("sourceUrl"), country.source_url || release.source_url],
      [tr("methodologyUrl"), country.methodology_url || release.methodology_url],
      [tr("transformationId"), country.transform_id || release.transform_id],
      [tr("transformationVersion"), country.transform_version || release.transform_version],
      [tr("rawSnapshot"), country.raw_snapshot_sha256 || release.raw_snapshot_sha256],
      [tr("sourceSheet"), provenance.source_sheet ?? provenance.sheet_name],
      [tr("rawRow"), provenance.source_row ?? provenance.row_number ?? provenance.raw_row],
      [tr("qualityFlag"), country.quality_flag],
    ];
    return rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  function provenanceHtml() {
    const rows = provenanceRows();
    const provenance = runtime.profile?.provenance || {};
    return `<div class="sdg-provenance"><dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>${Object.keys(provenance).length ? `<details><summary>${escapeHtml(runtime.lang === "ru" ? "Машиночитаемый provenance" : "Machine-readable provenance")}</summary><pre>${escapeHtml(JSON.stringify(provenance, null, 2))}</pre></details>` : ""}</div>`;
  }

  function openProvenance(trigger) {
    if (typeof runtime.context.openDrawer === "function") {
      runtime.context.openDrawer(provenanceHtml(), { title: tr("provenanceTitle"), kicker: tr("provenanceKicker"), trigger });
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.className = "sdg-dialog";
    dialog.innerHTML = `<div class="sdg-dialog-head"><div><p>${escapeHtml(tr("provenanceKicker"))}</p><h2>${escapeHtml(tr("provenanceTitle"))}</h2></div><button type="button" data-sdg-dialog-close>${escapeHtml(tr("close"))}</button></div>${provenanceHtml()}`;
    document.body.append(dialog);
    dialog.querySelector("[data-sdg-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("close", () => { dialog.remove(); trigger?.focus?.(); }, { once: true });
    dialog.showModal();
    dialog.querySelector("[data-sdg-dialog-close]").focus();
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function exportRanking() {
    const rows = filteredRanking();
    const goalMode = Boolean(runtime.rankingGoal);
    const headers = ["reference_year", "official_rank", "iso3", "country", goalMode ? `goal_${runtime.rankingGoal}_score` : "sdg_index_score", "dashboard_status", "trend_status", "spillover_score", "progress_since_2015", "region", "income_group", "release_id"];
    const body = rows.map((item) => [runtime.year, item.official_rank ?? "", item.iso3, countryName(item), goalMode ? item.goal_score ?? "" : item.score ?? "", item.dashboard_status ?? "", item.trend_status ?? "", item.spillover_score ?? "", item.progress_since_2015 ?? "", item.region ?? "", item.income_group ?? "", runtime.releaseId ?? ""]);
    const csv = "\uFEFF" + [headers, ...body].map((row) => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tr("downloadName")}-${runtime.year}${goalMode ? `-goal-${runtime.rankingGoal}` : ""}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify(tr("copied"));
    } catch (_) {
      const input = document.createElement("textarea");
      input.value = window.location.href;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      notify(tr("copied"));
    }
  }

  async function setView(view, { focusPanel = false, focusTab = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    const changed = view !== runtime.view;
    runtime.view = view;
    if (view === "indicators" && !runtime.indicatorsPayload) {
      updateDeepLink({ notifyHost: true });
      renderAvailable();
      try { await ensureIndicators({ render: true }); } catch (error) { if (error?.name !== "AbortError") renderError(error); }
    } else if (changed) {
      updateDeepLink({ notifyHost: true });
      renderAvailable();
    }
    if (focusPanel || focusTab) {
      window.requestAnimationFrame(() => {
        const selector = focusTab ? `[data-sdg-view="${view}"]` : `[data-sdg-panel="${view}"]`;
        runtime.root?.querySelector(selector)?.focus({ preventScroll: focusTab });
      });
    }
  }

  function rerenderStage({ focusSelector = null, cursor = null } = {}) {
    const stage = runtime.root?.querySelector(".sdg-view-stage");
    if (stage) stage.innerHTML = viewStageMarkup();
    bindEvents();
    if (focusSelector) {
      const replacement = runtime.root?.querySelector(focusSelector);
      replacement?.focus({ preventScroll: true });
      if (cursor != null) replacement?.setSelectionRange?.(cursor, cursor);
    }
  }

  function selectGoal(number, { openView = null } = {}) {
    const value = Number(number);
    if (!Number.isInteger(value) || value < 1 || value > 17) return;
    runtime.selectedGoal = value;
    updateDeepLink({ notifyHost: true });
    if (openView) setView(openView, { focusPanel: true });
    else rerenderStage();
  }

  function handleTabKeydown(event) {
    const current = event.target.closest("[data-sdg-view]");
    if (!current) return;
    const tabs = [...runtime.root.querySelectorAll("[data-sdg-view]")];
    const index = tabs.indexOf(current);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex == null) return;
    event.preventDefault();
    setView(tabs[nextIndex].dataset.sdgView, { focusTab: true });
  }

  function bindEvents() {
    const root = runtime.root;
    if (!root) return;
    root.querySelectorAll("[data-sdg-action=retry]").forEach((button) => { button.onclick = () => loadWorkspace(); });
    root.querySelectorAll("[data-sdg-country]").forEach((select) => { select.onchange = (event) => changeCountry(event.target.value); });
    root.querySelectorAll("[data-sdg-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-sdg-view]").forEach((button) => { button.onclick = () => setView(button.dataset.sdgView, { focusTab: true }); button.onkeydown = handleTabKeydown; });
    root.querySelectorAll("[data-sdg-action=provenance]").forEach((button) => { button.onclick = () => openProvenance(button); });
    root.querySelectorAll("[data-sdg-action=share]").forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll("[data-sdg-action=export]").forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-sdg-country-pick]").forEach((button) => { button.onclick = () => changeCountry(button.dataset.sdgCountryPick); });
    root.querySelectorAll("[data-sdg-map-iso][data-has-value=true]").forEach((path) => { path.style.cursor = "pointer"; path.onclick = () => changeCountry(path.dataset.sdgMapIso); });
    root.querySelectorAll("[data-sdg-goal]").forEach((button) => { button.onclick = () => selectGoal(button.dataset.sdgGoal); });
    root.querySelectorAll("[data-sdg-action=goal-indicators]").forEach((button) => { button.onclick = () => { runtime.indicatorGoal = Number(button.dataset.goal); selectGoal(button.dataset.goal, { openView: "indicators" }); }; });
    root.querySelectorAll("[data-sdg-action=goal-ranking]").forEach((button) => { button.onclick = async () => { const goal = Number(button.dataset.goal); runtime.selectedGoal = goal; await setView("ranking"); await loadGoalRanking(goal); }; });
    root.querySelectorAll("[data-sdg-trend-metric]").forEach((select) => { select.onchange = (event) => { runtime.trendMetric = event.target.value; rerenderStage(); }; });

    const rankingSearch = root.querySelector("[data-sdg-ranking-query]");
    if (rankingSearch) rankingSearch.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-sdg-ranking-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-sdg-ranking-goal]").forEach((select) => { select.onchange = (event) => loadGoalRanking(event.target.value); });
    root.querySelectorAll("[data-sdg-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-ranking-income]").forEach((select) => { select.onchange = (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-ranking-unranked]").forEach((input) => { input.onchange = (event) => { runtime.rankingIncludeUnranked = event.target.checked; runtime.rankingPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage += button.dataset.sdgPage === "next" ? 1 : -1; rerenderStage(); runtime.root.querySelector(".sdg-ranking-meta")?.scrollIntoView({ block: "nearest" }); }; });

    const indicatorSearch = root.querySelector("[data-sdg-indicator-query]");
    if (indicatorSearch) indicatorSearch.oninput = (event) => { runtime.indicatorQuery = event.target.value; runtime.indicatorPage = 1; rerenderStage({ focusSelector: "[data-sdg-indicator-query]", cursor: event.target.selectionStart }); };
    root.querySelectorAll("[data-sdg-indicator-goal]").forEach((select) => { select.onchange = (event) => { runtime.indicatorGoal = Number(event.target.value) || 0; runtime.indicatorPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-indicator-scope]").forEach((select) => { select.onchange = (event) => { runtime.indicatorScope = event.target.value; runtime.indicatorPage = 1; rerenderStage(); }; });
    root.querySelectorAll("[data-sdg-indicator]").forEach((button) => { button.onclick = async () => { try { await loadIndicatorSeries(button.dataset.sdgIndicator); } catch (error) { if (error?.name !== "AbortError") renderError(error); } }; });
    root.querySelectorAll("[data-sdg-indicator-page]").forEach((button) => { button.onclick = () => { runtime.indicatorPage += button.dataset.sdgIndicatorPage === "next" ? 1 : -1; rerenderStage(); }; });

    root.querySelectorAll("img").forEach((image) => { image.onerror = () => image.closest(".sdg-flag-slot, .sdg-control-flag, .sdg-hero-flag, .sdg-profile-flag, .sdg-table-flag")?.classList.add("is-fallback"); });
  }

  function render(context = {}) {
    const root = context.root instanceof Element ? context.root : document.querySelector(context.root || "#view");
    if (!root) throw new Error("GIRSustainableDevelopment.render: root element was not found");
    runtime.abortController?.abort();
    runtime.detailController?.abort();
    runtime.id = ++instanceCounter;
    runtime.root = root;
    runtime.context = context;
    runtime.lang = context.lang === "en" ? "en" : "ru";
    runtime.theme = context.theme === "light" ? "light" : "dark";
    const deepLink = readDeepLink(context);
    if (!deepLink.iso3) return;
    runtime.view = deepLink.view;
    runtime.year = deepLink.year;
    runtime.iso3 = deepLink.iso3;
    runtime.selectedGoal = deepLink.goal;
    runtime.indicatorCode = deepLink.indicator;
    setDocumentMeta();
    return loadWorkspace();
  }

  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort();
    runtime.detailController?.abort();
    if (hard) {
      apiCache.clear();
      goalRankingCache.clear();
    }
    runtime.status = null;
    runtime.ranking = null;
    runtime.goalRanking = null;
    runtime.profile = null;
    runtime.series = null;
    runtime.indicatorsPayload = null;
    runtime.indicatorSeriesPayload = null;
  }

  window.GIRSustainableDevelopment = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    _test: Object.freeze({
      median,
      percentile,
      scoreTone,
      featureIso,
      geometryPath,
      numeric,
      escapeHtml,
      statusLabel,
      trendGlyph,
      preferredDirectionLabel,
      goalColor,
    }),
  });
})();
