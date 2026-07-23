(() => {
  "use strict";

  const MODULE_VERSION = "1.0.0";
  const API = "/api/world-press-freedom";
  const VIEW_KEYS = ["overview", "indicators", "trend", "ranking", "changes", "methodology"];
  const MAP_URL = "/static/world_countries_lite.geojson";
  const OFFICIAL_SCORE_SEMANTICS = "official_rsf_world_press_freedom_score_0_to_100_higher_is_better";
  const OFFICIAL_OVERALL_ORDER = "official_rsf_world_press_freedom_rank";
  const OFFICIAL_INDICATOR_ORDER = "official_rsf_indicator_rank";
  const DERIVED_REGIONAL_SEMANTICS = "derived_GIR_arithmetic_summary_not_official_RSF_regional_score";
  const SITUATION_ORDER = ["good", "satisfactory", "problematic", "difficult", "very_serious"];

  const TEXT = {
    ru: {
      indexName: "Всемирный индекс свободы прессы",
      indexShort: "WPFI",
      publisher: "Репортёры без границ (RSF)",
      loadingTitle: "Загрузка WPFI",
      loadingText: "Получаем опубликованную редакцию, официальный рейтинг, пять индикаторов и сопоставимый ряд.",
      notLoadedTitle: "Интерфейс WPFI готов",
      notLoadedText: "Опубликованная редакция ещё не прошла publication gate. Тестовые значения не подставляются.",
      errorTitle: "Не удалось загрузить WPFI",
      retry: "Повторить",
      overview: "Обзор",
      indicators: "Пять индикаторов",
      trend: "Динамика",
      ranking: "Мировой рейтинг",
      changes: "Изменения",
      methodology: "Методология и аудит",
      heroKicker: "Свобода журналистики · независимость, правовая среда и безопасность",
      heroLead: "Официальный индекс RSF по шкале 0–100: более высокий score означает более благоприятные условия для свободной журналистики.",
      officialScore: "Официальный score",
      officialRank: "Официальное место",
      scoreScale: "Шкала 0–100 · больше — лучше",
      countries: "Стран и территорий",
      releaseYear: "Редакция",
      assessmentYear: "Оцениваемый год",
      country: "Страна",
      share: "Скопировать ссылку",
      provenance: "Происхождение значения",
      copied: "Ссылка скопирована",
      overviewKicker: "Страновой профиль",
      overviewHeading: "Официальный WPFI и пять контекстов свободы прессы",
      overviewText: "Score и rank сохранены в том виде, в котором они опубликованы RSF. GIR не пересчитывает официальный рейтинг.",
      worldAverage: "Среднее 180 участников",
      regionalAverage: "Среднее региона GIR",
      scoreEvolution: "Изменение score за год",
      rankEvolution: "Изменение места за год",
      situation: "Категория ситуации",
      worldMap: "Карта свободы прессы",
      mapText: "Цвет соответствует официальным порогам RSF; серый означает отсутствие сопоставимого значения.",
      profile: "Профиль пяти индикаторов",
      neighbors: "Соседи по официальному рейтингу",
      position: "Место",
      score: "Score",
      indicatorScore: "Score индикатора",
      noData: "Нет данных",
      openProfile: "Открыть профиль",
      region: "Регион RSF",
      indicatorsKicker: "Структура индекса",
      indicatorsHeading: "Пять равновзвешенных контекстуальных индикаторов",
      indicatorsText: "Политический, экономический, правовой, социокультурный контексты и безопасность имеют равный вес. Safety дополнительно учитывает зарегистрированные нарушения.",
      selectedIndicator: "Выбранный индикатор",
      weight: "Вес",
      questionnaireItems: "Вопросов и подпунктов",
      officialIndicatorRank: "Официальное место по индикатору",
      indicatorSeries: "Динамика индикатора",
      indicatorOrderingWarning: "Порядок по отдельному индикатору является опубликованным RSF indicator rank, но не заменяет общий WPFI rank.",
      trendKicker: "Сопоставимый ряд",
      trendHeading: "Динамика по методологии 2022+",
      trendText: "Редакции 2022–2026 используют современную методическую основу. Выпуски до 2022 года намеренно не объединяются с этим рядом.",
      metric: "Показатель",
      overallScore: "Общий официальный score",
      overallRank: "Общее официальное место",
      firstYear: "Первый выпуск",
      lastYear: "Последний выпуск",
      periodDelta: "Изменение за период",
      minimum: "Минимум",
      maximum: "Максимум",
      rankWarning: "Изменение места зависит от результатов других стран и не эквивалентно изменению score.",
      trendTable: "Табличный ряд",
      rankingKicker: "Сравнение стран",
      rankingHeading: "Официальный рейтинг RSF",
      rankingText: "По умолчанию строки следуют общему официальному месту. Для отдельных индикаторов используется опубликованное RSF indicator rank; общий rank остаётся отдельной колонкой.",
      search: "Поиск",
      searchPlaceholder: "Страна или ISO3",
      allRegions: "Все регионы RSF",
      allSituations: "Все категории",
      incomeGroup: "Группа дохода",
      allIncomeGroups: "Все группы",
      rankingMetric: "Порядок строк",
      officialRanking: "Общий официальный rank",
      includeNonIso: "Показывать официальные не-ISO сущности",
      pageSize: "Строк на странице",
      exportCsv: "Экспорт CSV",
      shown: "Показано",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      changesKicker: "Опубликованная годовая динамика",
      changesHeading: "Кто улучшил и ухудшил score",
      changesText: "Используются официальные поля Score evolution и Rank evolution текущего CSV. GIR не выводит причинность и не пересчитывает эти изменения.",
      all: "Все",
      improvements: "Рост score",
      declines: "Снижение score",
      stable: "Без изменения",
      scoreChange: "Изменение score",
      rankChange: "Изменение rank",
      currentScore: "Текущий score",
      previousScore: "Предыдущий score",
      totalChanges: "Участников",
      biggestImprovement: "Наибольший рост",
      biggestDecline: "Наибольшее снижение",
      regionalSummary: "Региональная сводка GIR",
      methodologyKicker: "Воспроизводимость",
      methodologyHeading: "Методология, права и audit trail",
      methodologyText: "Интерфейс отделяет официальные значения RSF, опубликованные indicator ranks и производные сводки GIR, сохраняя provenance каждой строки.",
      principleSubject: "Что измеряет индекс",
      principleSubjectText: "Свободу журналистов и СМИ выбирать, производить и распространять общественно значимую информацию независимо от вмешательства и угроз.",
      principleComponents: "Два слоя оценки",
      principleComponentsText: "Количественный учёт нарушений и качественная экспертная анкета; score безопасности включает оба слоя.",
      principleScale: "Шкала 0–100",
      principleScaleText: "100 — наилучшая возможная ситуация, 0 — наихудшая. Score не является процентом свободных СМИ.",
      principleTime: "Сопоставимость 2022+",
      principleTimeText: "Современная методология применяется с 2022 года; ранние выпуски не смешиваются с ней в один ряд.",
      classification: "Официальные пороги карты RSF",
      framework: "Схема данных WPFI",
      sourceAudit: "Источник и аудит",
      auditPassed: "Проверка пройдена",
      auditReview: "Требуется проверка",
      publicationGate: "Publication gate",
      release: "Редакция",
      releaseId: "Release ID",
      retrievedAt: "Получено",
      rawSnapshot: "SHA-256 исходного CSV",
      rawBytes: "Размер snapshot",
      transformId: "Transformation ID",
      importerVersion: "Версия импортёра",
      sourceRow: "Исходная строка",
      officialSource: "Интерактивный индекс RSF",
      annualCsv: "Официальный годовой CSV",
      methodologyLink: "Методология RSF 2026",
      analysisLink: "Анализ выпуска 2026",
      terms: "Условия использования",
      mapUnavailable: "Карта недоступна; рейтинг и профиль продолжают работать.",
      keyboardTabs: "Для перемещения по вкладкам используйте клавиши со стрелками, Home и End.",
      official: "Официальное значение RSF",
      derived: "Производная аналитика GIR",
      records: "записей",
      clear: "Сбросить",
      situation_good: "Хорошая",
      situation_satisfactory: "Удовлетворительная",
      situation_problematic: "Проблемная",
      situation_difficult: "Тяжёлая",
      situation_very_serious: "Очень тяжёлая",
    },
    en: {
      indexName: "World Press Freedom Index",
      indexShort: "WPFI",
      publisher: "Reporters Without Borders (RSF)",
      loadingTitle: "Loading WPFI",
      loadingText: "Retrieving the published release, official ranking, five indicators and comparable series.",
      notLoadedTitle: "The WPFI interface is ready",
      notLoadedText: "No release has passed the publication gate yet. No test values are substituted.",
      errorTitle: "WPFI could not be loaded",
      retry: "Retry",
      overview: "Overview",
      indicators: "Five indicators",
      trend: "Trend",
      ranking: "World ranking",
      changes: "Changes",
      methodology: "Methodology & audit",
      heroKicker: "Journalistic freedom · independence, legal environment and safety",
      heroLead: "RSF's official 0–100 index: a higher score indicates a more favourable environment for free journalism.",
      officialScore: "Official score",
      officialRank: "Official rank",
      scoreScale: "0–100 scale · higher is better",
      countries: "Countries & territories",
      releaseYear: "Edition",
      assessmentYear: "Assessment year",
      country: "Country",
      share: "Copy link",
      provenance: "Value provenance",
      copied: "Link copied",
      overviewKicker: "Country profile",
      overviewHeading: "Official WPFI and five press-freedom contexts",
      overviewText: "Score and rank are preserved exactly as published by RSF. GIR does not recompute the official ranking.",
      worldAverage: "Mean across 180 entries",
      regionalAverage: "Derived GIR regional mean",
      scoreEvolution: "Annual score change",
      rankEvolution: "Annual rank change",
      situation: "Situation category",
      worldMap: "Press-freedom map",
      mapText: "Colours follow RSF's official thresholds; grey means no comparable value.",
      profile: "Five-indicator profile",
      neighbors: "Neighbours in the official ranking",
      position: "Rank",
      score: "Score",
      indicatorScore: "Indicator score",
      noData: "No data",
      openProfile: "Open profile",
      region: "RSF region",
      indicatorsKicker: "Index structure",
      indicatorsHeading: "Five equally weighted contextual indicators",
      indicatorsText: "Political, economic, legal, sociocultural and safety contexts carry equal weights. Safety additionally incorporates recorded abuses.",
      selectedIndicator: "Selected indicator",
      weight: "Weight",
      questionnaireItems: "Questions and subquestions",
      officialIndicatorRank: "Official indicator rank",
      indicatorSeries: "Indicator trend",
      indicatorOrderingWarning: "Ordering by one indicator uses RSF's published indicator rank, but does not replace the overall WPFI rank.",
      trendKicker: "Comparable series",
      trendHeading: "Trend under the 2022+ methodology",
      trendText: "The 2022–2026 editions use the modern methodological framework. Pre-2022 editions are intentionally kept outside this series.",
      metric: "Metric",
      overallScore: "Overall official score",
      overallRank: "Overall official rank",
      firstYear: "First edition",
      lastYear: "Latest edition",
      periodDelta: "Period change",
      minimum: "Minimum",
      maximum: "Maximum",
      rankWarning: "Rank movement depends on other countries' results and is not equivalent to score movement.",
      trendTable: "Tabular series",
      rankingKicker: "Country comparison",
      rankingHeading: "Official RSF ranking",
      rankingText: "Rows follow the overall official rank by default. For an indicator, RSF's published indicator rank controls order while the overall rank remains visible.",
      search: "Search",
      searchPlaceholder: "Country or ISO3",
      allRegions: "All RSF regions",
      allSituations: "All categories",
      incomeGroup: "Income group",
      allIncomeGroups: "All groups",
      rankingMetric: "Row order",
      officialRanking: "Overall official rank",
      includeNonIso: "Include official non-ISO entities",
      pageSize: "Rows per page",
      exportCsv: "Export CSV",
      shown: "Shown",
      previous: "Previous",
      next: "Next",
      page: "Page",
      changesKicker: "Published annual movement",
      changesHeading: "Who improved and declined",
      changesText: "The current CSV's official Score evolution and Rank evolution fields are used. GIR does not infer causality or recompute these changes.",
      all: "All",
      improvements: "Score increases",
      declines: "Score decreases",
      stable: "No change",
      scoreChange: "Score change",
      rankChange: "Rank change",
      currentScore: "Current score",
      previousScore: "Previous score",
      totalChanges: "Entries",
      biggestImprovement: "Largest increase",
      biggestDecline: "Largest decline",
      regionalSummary: "Derived GIR regional summary",
      methodologyKicker: "Reproducibility",
      methodologyHeading: "Methodology, rights and audit trail",
      methodologyText: "The interface separates official RSF values, published indicator ranks and derived GIR summaries while retaining row-level provenance.",
      principleSubject: "What the index measures",
      principleSubjectText: "The freedom enjoyed by journalists and media to select, produce and disseminate public-interest information independently and without threats.",
      principleComponents: "Two assessment layers",
      principleComponentsText: "A quantitative abuses tally and a qualitative expert questionnaire; the safety score incorporates both layers.",
      principleScale: "0–100 scale",
      principleScaleText: "100 is the best possible situation and 0 the worst. The score is not a percentage of free media.",
      principleTime: "Comparable from 2022",
      principleTimeText: "The modern methodology applies from 2022; earlier editions are not merged into the same series.",
      classification: "Official RSF map thresholds",
      framework: "WPFI data model",
      sourceAudit: "Source & audit",
      auditPassed: "Audit passed",
      auditReview: "Review required",
      publicationGate: "Publication gate",
      release: "Release",
      releaseId: "Release ID",
      retrievedAt: "Retrieved",
      rawSnapshot: "Raw CSV SHA-256",
      rawBytes: "Snapshot size",
      transformId: "Transformation ID",
      importerVersion: "Importer version",
      sourceRow: "Source row",
      officialSource: "RSF interactive index",
      annualCsv: "Official annual CSV",
      methodologyLink: "RSF 2026 methodology",
      analysisLink: "2026 edition analysis",
      terms: "Terms of use",
      mapUnavailable: "The map is unavailable; ranking and profile remain usable.",
      keyboardTabs: "Use Arrow keys, Home and End to move between tabs.",
      official: "Official RSF value",
      derived: "Derived GIR analytics",
      records: "records",
      clear: "Clear",
      situation_good: "Good",
      situation_satisfactory: "Satisfactory",
      situation_problematic: "Problematic",
      situation_difficult: "Difficult",
      situation_very_serious: "Very serious",
    },
  };

  const runtime = {
    root: null, context: {}, lang: "ru", theme: "dark", view: "overview",
    country: "", year: null, indicatorCode: "political_context",
    trendMetric: "score", rankingMetric: "overall", changeDirection: "",
    rankingQuery: "", rankingRegion: "", rankingIncome: "", rankingSituation: "",
    includeNonIso: false, rankingPage: 1, rankingPageSize: 25,
    status: null, metadata: null, releases: null, years: null, indicators: null,
    regions: null, ranking: null, indicatorRanking: null, profile: null,
    series: null, indicatorSeries: null, audit: null, geo: null,
    abortController: null, detailController: null, instance: 0,
  };
  const metadataCache = new Map();
  const geoCache = { value: null, promise: null };

  const tr = (key) => TEXT[runtime.lang]?.[key] ?? TEXT.ru[key] ?? key;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  const numeric = (value) => { if (value === null || value === undefined || value === "") return null; const number = Number(value); return Number.isFinite(number) ? number : null; };
  const locale = () => runtime.lang === "ru" ? "ru-RU" : "en-US";
  const formatNumber = (value, digits = 2) => { const number = numeric(value); return number === null ? "—" : new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number); };
  const formatInteger = (value) => { const number = numeric(value); return number === null ? "—" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(number); };
  const formatYear = (value) => { const number = numeric(value); return number === null ? "—" : String(Math.trunc(number)); };
  const formatSigned = (value, digits = 2) => { const number = numeric(value); return number === null ? "—" : `${number > 0 ? "+" : ""}${formatNumber(number, digits)}`; };
  const formatDate = (value) => { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale(), { year: "numeric", month: "short", day: "2-digit" }).format(date); };
  const median = (values) => { const numbers = values.map(numeric).filter((value) => value !== null).sort((a, b) => a - b); if (!numbers.length) return null; const middle = Math.floor(numbers.length / 2); return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2; };
  const safeUrl = (value) => { try { const url = new URL(String(value || ""), window.location.origin); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch (_) { return ""; } };
  const notify = (message) => { if (typeof runtime.context.onNotice === "function") runtime.context.onNotice(message); };
  const abortError = (error) => error?.name === "AbortError";

  function countryName(item) {
    if (!item) return "—";
    if (runtime.lang === "ru") return item.host_name_ru || item.name_ru || item.name_en || item.name_fr || item.iso3 || item.source_iso3 || "—";
    return item.host_name_en || item.name_en || item.name_fr || item.host_name_ru || item.iso3 || item.source_iso3 || "—";
  }
  function indicatorName(item) { return runtime.lang === "ru" ? (item?.name_ru || item?.name_en || item?.indicator_code || "—") : (item?.name_en || item?.name_ru || item?.indicator_code || "—"); }
  function regionName(code) { const item = (runtime.regions?.items || []).find((row) => row.region_code === code); return item ? (runtime.lang === "ru" ? (item.name_ru || item.name_en) : (item.name_en || item.name_ru)) : (code || "—"); }
  function situationName(code) { return tr(`situation_${code || ""}`); }

  async function fetchJson(path, { params = null, signal = null, cache = "no-store" } = {}) {
    const url = new URL(path, window.location.origin);
    Object.entries(params || {}).forEach(([key, value]) => { if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache, signal });
    if (!response.ok) { let detail = `${response.status} ${response.statusText}`; try { detail = (await response.json()).detail || detail; } catch (_) { /* noop */ } throw new Error(detail); }
    return response.json();
  }

  function deepLink() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("wpfi_view") || (VIEW_KEYS.includes(params.get("view")) ? params.get("view") : null);
    const year = Number(params.get("wpfi_year") || params.get("year"));
    const country = params.get("wpfi_country") || params.get("country");
    return {
      view: VIEW_KEYS.includes(view) ? view : null,
      country: country ? String(country).toUpperCase() : null,
      year: Number.isFinite(year) ? year : null,
      indicatorCode: params.get("wpfi_indicator") || "",
      trendMetric: params.get("wpfi_metric") || "",
      rankingMetric: params.get("wpfi_ranking_metric") || "",
      changeDirection: params.get("wpfi_change") || "",
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("wpfi_country", runtime.country);
    if (runtime.year) url.searchParams.set("wpfi_year", String(runtime.year));
    url.searchParams.set("wpfi_view", runtime.view);
    if (runtime.indicatorCode) url.searchParams.set("wpfi_indicator", runtime.indicatorCode); else url.searchParams.delete("wpfi_indicator");
    if (runtime.trendMetric !== "score") url.searchParams.set("wpfi_metric", runtime.trendMetric); else url.searchParams.delete("wpfi_metric");
    if (runtime.rankingMetric !== "overall") url.searchParams.set("wpfi_ranking_metric", runtime.rankingMetric); else url.searchParams.delete("wpfi_ranking_metric");
    if (runtime.changeDirection) url.searchParams.set("wpfi_change", runtime.changeDirection); else url.searchParams.delete("wpfi_change");
    url.hash = "index-WPFI";
    history.replaceState(null, "", url);
    if (notifyHost && typeof runtime.context.onContextChange === "function") runtime.context.onContextChange({ country: runtime.country, year: runtime.year, view: runtime.view });
  }

  function flagMarkup(item, className = "wpfi-flag-slot") {
    const iso3 = String(item?.iso3 || item?.source_iso3 || "").toUpperCase();
    const iso2 = String(item?.host_iso2 || item?.iso2 || "").toLowerCase();
    if (iso2 && /^[a-z]{2}$/.test(iso2)) return `<span class="${className}"><img data-wpfi-flag src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
    return `<span class="${className} is-fallback"><span aria-hidden="true">${escapeHtml(iso3 || "•")}</span></span>`;
  }

  const yearItems = () => runtime.years?.items || [];
  const indicatorCatalog = () => runtime.indicators?.items || [];
  const rankingItems = (payload = runtime.ranking) => payload?.items || [];
  const currentRankingPayload = () => runtime.rankingMetric === "overall" ? runtime.ranking : (runtime.indicatorRanking || runtime.ranking);
  const profileEntity = () => {
    const rankingItem = rankingItems().find((item) => item.iso3 === runtime.country) || {};
    return { ...rankingItem, ...(runtime.profile?.entity || {}) };
  };
  const selectedIndicator = () => indicatorCatalog().find((item) => item.indicator_code === runtime.indicatorCode) || indicatorCatalog()[0] || null;
  const indicatorResult = (code) => runtime.profile?.indicators?.find((item) => item.indicator_code === code) || null;
  const currentRelease = () => {
    const listed = runtime.releases?.items?.find((item) => item.release_id === runtime.ranking?.release_id) || {};
    return { ...listed, ...(runtime.metadata?.latest_release || {}), ...(runtime.profile?.release || {}) };
  };

  async function loadMetadata(signal) {
    if (metadataCache.has("bundle")) return metadataCache.get("bundle");
    const bundle = await Promise.all([
      fetchJson(`${API}/status`, { signal }), fetchJson(`${API}/metadata`, { signal, cache: "default" }),
      fetchJson(`${API}/releases`, { signal, cache: "default" }), fetchJson(`${API}/years`, { signal, cache: "default" }),
      fetchJson(`${API}/indicators`, { signal, cache: "default" }),
    ]);
    metadataCache.set("bundle", bundle); return bundle;
  }
  async function loadGeo() {
    if (geoCache.value) return geoCache.value;
    if (geoCache.promise) return geoCache.promise;
    geoCache.promise = fetch(MAP_URL, { cache: "force-cache", headers: { Accept: "application/geo+json,application/json" } }).then((response) => response.ok ? response.json() : null).then((value) => { geoCache.value = Array.isArray(value?.features) ? value : null; return geoCache.value; }).catch(() => null);
    return geoCache.promise;
  }
  async function loadProfile(signal) {
    const item = rankingItems().find((row) => row.iso3 === runtime.country) || rankingItems().find((row) => row.iso3) || null;
    if (!item?.iso3) return [null, { items: [], total: 0 }, null];
    runtime.country = item.iso3;
    return Promise.all([
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }),
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}/series`, { signal }),
      fetchJson(`${API}/audit`, { params: { year: runtime.year, release_id: runtime.ranking.release_id }, signal }).catch(() => null),
    ]);
  }
  async function loadIndicatorRanking(code, signal = null) {
    if (!code) { runtime.indicatorRanking = null; return; }
    runtime.indicatorRanking = await fetchJson(`${API}/ranking`, { params: { year: runtime.year, indicator_code: code, include_non_iso: true, limit: 500 }, signal });
  }
  async function loadIndicatorSeries(code, signal = null) {
    if (!code || !runtime.country) { runtime.indicatorSeries = null; return; }
    runtime.indicatorSeries = await fetchJson(`${API}/indicator/${encodeURIComponent(code)}/country/${encodeURIComponent(runtime.country)}/series`, { signal }).catch(() => null);
  }

  async function loadWorkspace() {
    const instance = runtime.instance;
    runtime.abortController?.abort(); runtime.abortController = new AbortController();
    renderState("loading");
    try {
      const [status, metadata, releases, years, indicators] = await loadMetadata(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      Object.assign(runtime, { status, metadata, releases, years, indicators });
      if (status.data_status !== "available" || !yearItems().length) { renderState("not_loaded"); return; }
      const availableYears = yearItems().map((item) => Number(item.release_year)).filter(Number.isFinite);
      if (!availableYears.includes(Number(runtime.year))) runtime.year = Math.max(...availableYears);
      if (!indicatorCatalog().some((item) => item.indicator_code === runtime.indicatorCode)) runtime.indicatorCode = indicatorCatalog()[0]?.indicator_code || "";
      const [ranking, regions, geo] = await Promise.all([
        fetchJson(`${API}/ranking`, { params: { year: runtime.year, include_non_iso: true, limit: 500 }, signal: runtime.abortController.signal }),
        fetchJson(`${API}/regions`, { params: { year: runtime.year }, signal: runtime.abortController.signal }), loadGeo(),
      ]);
      if (instance !== runtime.instance) return;
      Object.assign(runtime, { ranking, regions, geo, indicatorRanking: null });
      if (!rankingItems().some((item) => item.iso3 === runtime.country)) runtime.profile = null;
      const [profile, series, audit] = await loadProfile(runtime.abortController.signal);
      if (instance !== runtime.instance) return;
      Object.assign(runtime, { profile, series, audit });
      if (runtime.view === "indicators" || (runtime.view === "trend" && !["score", "rank"].includes(runtime.trendMetric))) await loadIndicatorSeries(runtime.indicatorCode, runtime.abortController.signal);
      if (runtime.rankingMetric !== "overall") await loadIndicatorRanking(runtime.rankingMetric, runtime.abortController.signal);
      renderAvailable(); updateDeepLink();
    } catch (error) { if (!abortError(error) && instance === runtime.instance) renderState("error", error); }
  }

  async function reloadProfile() {
    runtime.detailController?.abort(); runtime.detailController = new AbortController();
    try {
      const [profile, series, audit] = await loadProfile(runtime.detailController.signal);
      Object.assign(runtime, { profile, series, audit, indicatorSeries: null });
      if (runtime.view === "indicators" || (runtime.view === "trend" && !["score", "rank"].includes(runtime.trendMetric))) await loadIndicatorSeries(runtime.indicatorCode, runtime.detailController.signal);
      renderAvailable(); updateDeepLink();
    } catch (error) { if (!abortError(error)) renderState("error", error); }
  }
  async function changeCountry(value) { runtime.country = String(value || "").toUpperCase(); await reloadProfile(); }
  async function changeYear(value) { runtime.year = Number(value); runtime.rankingPage = 1; await loadWorkspace(); }

  function stateShell(kind, error = null) {
    const title = kind === "loading" ? tr("loadingTitle") : kind === "not_loaded" ? tr("notLoadedTitle") : tr("errorTitle");
    const text = kind === "loading" ? tr("loadingText") : kind === "not_loaded" ? tr("notLoadedText") : String(error?.message || error || "");
    return `<section class="wpfi-state-shell"><article class="wpfi-state-card"><span class="wpfi-state-code">${escapeHtml(tr("indexShort"))}</span><div class="wpfi-state-mark" aria-hidden="true">${kind === "loading" ? '<i class="wpfi-loader"></i>' : kind === "not_loaded" ? '○' : '!'}</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>${kind === "error" ? `<button type="button" class="wpfi-button wpfi-button-primary" data-wpfi-action="retry">${escapeHtml(tr("retry"))}</button>` : ""}</article></section>`;
  }
  function renderState(kind, error = null) { if (!runtime.root) return; runtime.root.innerHTML = `<div class="wpfi-workspace" data-wpfi-state="${escapeHtml(kind)}" aria-live="polite">${stateShell(kind, error)}</div>`; bindEvents(); }
  function externalLink(url, label) { const safe = safeUrl(url); return safe ? `<a class="wpfi-link" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>` : ""; }

  function hero() {
    const item = profileEntity(); const release = currentRelease();
    return `<header class="wpfi-hero"><div class="wpfi-hero-copy"><p class="wpfi-kicker">${escapeHtml(tr("heroKicker"))}</p><div class="wpfi-title-row">${flagMarkup(item, "wpfi-hero-flag")}<div><span class="wpfi-index-code">${escapeHtml(tr("indexShort"))}</span><h1>${escapeHtml(tr("indexName"))}</h1><p>${escapeHtml(tr("heroLead"))}</p></div></div><div class="wpfi-hero-links">${externalLink(release.index_page_url || runtime.metadata?.sources?.index_page, tr("officialSource"))}${externalLink(release.analysis_url || runtime.metadata?.sources?.analysis, tr("analysisLink"))}</div></div><aside class="wpfi-hero-score"><div class="wpfi-score-block"><span>${escapeHtml(tr("officialScore"))}</span><strong>${formatNumber(item.score, 2)}</strong><small>${escapeHtml(tr("scoreScale"))}</small></div><div class="wpfi-hero-score-meta"><div><span>${escapeHtml(tr("officialRank"))}</span><strong>${formatInteger(item.official_rank)} / ${formatInteger(runtime.ranking?.total)}</strong></div><div class="wpfi-situation-meta"><span>${escapeHtml(tr("situation"))}</span><strong>${escapeHtml(situationName(item.situation_code))}</strong></div><div><span>${escapeHtml(tr("releaseYear"))}</span><strong>${formatYear(runtime.year)}</strong></div><div><span>${escapeHtml(tr("assessmentYear"))}</span><strong>${formatYear(runtime.profile?.assessment_year || release.assessment_year)}</strong></div></div></aside></header>`;
  }
  function countryOptions() { return rankingItems().filter((item) => item.iso3).map((item) => `<option value="${escapeHtml(item.iso3)}" ${item.iso3 === runtime.country ? "selected" : ""}>${escapeHtml(countryName(item))} · ${escapeHtml(item.iso3)}</option>`).join(""); }
  function yearOptions() { return yearItems().map((item) => `<option value="${escapeHtml(item.release_year)}" ${Number(item.release_year) === Number(runtime.year) ? "selected" : ""}>${escapeHtml(item.release_year)}</option>`).join(""); }
  function controlBar() { return `<div class="wpfi-controls"><div class="wpfi-control-primary"><label><span>${escapeHtml(tr("country"))}</span><select data-wpfi-country>${countryOptions()}</select></label><label><span>${escapeHtml(tr("releaseYear"))}</span><select data-wpfi-year>${yearOptions()}</select></label></div><div class="wpfi-control-actions"><button class="wpfi-button wpfi-button-secondary" type="button" data-wpfi-action="share">${escapeHtml(tr("share"))}</button><button class="wpfi-button wpfi-button-secondary" type="button" data-wpfi-action="provenance">${escapeHtml(tr("provenance"))}</button></div></div>`; }
  function tabs() { return `<div class="wpfi-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}">${VIEW_KEYS.map((view) => `<button type="button" role="tab" id="wpfi-tab-${runtime.instance}-${view}" aria-selected="${runtime.view === view}" aria-controls="wpfi-panel-${runtime.instance}-${view}" tabindex="${runtime.view === view ? "0" : "-1"}" data-wpfi-view="${view}">${escapeHtml(tr(view))}</button>`).join("")}</div>`; }
  function sectionHeading(kicker, title, text, extra = "") { return `<header class="wpfi-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`; }

  function featureIso(feature) { const p = feature?.properties || {}; return String(p.ISO_A3 || p.ADM0_A3 || p.iso_a3 || p.ISO3 || p.iso3 || p.id || "").toUpperCase(); }
  function projectPoint(point, width, height) { const longitude = Number(point?.[0]); const latitude = Number(point?.[1]); return Number.isFinite(longitude) && Number.isFinite(latitude) ? [((longitude + 180) / 360) * width, ((90 - latitude) / 180) * height] : null; }
  function ringPath(ring, width, height) { const points = (ring || []).map((point) => projectPoint(point, width, height)).filter(Boolean); return points.length ? `${points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(" ")} Z` : ""; }
  function geometryPath(geometry, width, height) { if (!geometry) return ""; if (geometry.type === "Polygon") return (geometry.coordinates || []).map((ring) => ringPath(ring, width, height)).join(" "); if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map((ring) => ringPath(ring, width, height))).join(" "); return ""; }
  function situationBin(code) { return ({ very_serious: 1, difficult: 3, problematic: 5, satisfactory: 7, good: 8 })[code] || 0; }
  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="wpfi-map-fallback">${escapeHtml(tr("mapUnavailable"))}</div>`;
    const byIso = new Map(rankingItems().filter((item) => item.iso3).map((item) => [String(item.iso3).toUpperCase(), item])); const width = 920; const height = 470;
    const paths = runtime.geo.features.map((feature) => { const iso = featureIso(feature); const item = byIso.get(iso); const d = geometryPath(feature.geometry, width, height); if (!d) return ""; return `<path class="wpfi-map-country wpfi-map-bin-${situationBin(item?.situation_code)} ${iso === runtime.country ? "is-selected" : ""}" d="${d}" data-wpfi-map-iso="${escapeHtml(iso)}" data-has-value="${Boolean(item)}"><title>${escapeHtml(item ? `${countryName(item)}: ${formatNumber(item.score, 2)}` : iso)}</title></path>`; }).join("");
    return `<div class="wpfi-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("worldMap"))}">${paths}</svg></div><div class="wpfi-map-legend">${SITUATION_ORDER.map((code) => `<span><i class="wpfi-map-bin-${situationBin(code)}"></i>${escapeHtml(situationName(code))}</span>`).join("")}</div>`;
  }
  function metricCard(label, value, detail, derived = false) { return `<article class="wpfi-metric"><span>${escapeHtml(derived ? tr("derived") : tr("official"))}</span><h3>${escapeHtml(label)}</h3><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail || "")}</small></article>`; }
  function worldMean() {
    const officialSummary = numeric(runtime.audit?.audit?.publication_gate?.summary?.score_average);
    if (officialSummary !== null) return officialSummary;
    const values = rankingItems().map((item) => numeric(item.score)).filter((value) => value !== null);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }
  function regionSummary(code) { return (runtime.regions?.items || []).find((item) => item.region_code === code) || null; }

  function indicatorBars() {
    return `<div class="wpfi-domain-bars">${(runtime.profile?.indicators || []).map((item, index) => `<button type="button" class="wpfi-domain-bar" data-wpfi-indicator-pick="${escapeHtml(item.indicator_code)}"><span>${escapeHtml(indicatorName(item))}</span><i><b style="width:${Math.max(0, Math.min(100, numeric(item.score) || 0))}%"></b></i><strong>${formatNumber(item.score, 2)}</strong><small>#${formatInteger(item.official_rank)}</small></button>`).join("")}</div>`;
  }
  function neighborTable() {
    const items = rankingItems(); const index = items.findIndex((item) => item.iso3 === runtime.country); const neighbors = items.slice(Math.max(0, index - 2), Math.min(items.length, index + 3));
    return `<article class="wpfi-card wpfi-neighbors-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("neighbors"))}</p><h3>${escapeHtml(tr("officialRanking"))}</h3></div></div><div class="wpfi-table-scroll"><table class="wpfi-table"><thead><tr><th>${escapeHtml(tr("position"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("situation"))}</th></tr></thead><tbody>${neighbors.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${formatInteger(item.official_rank)}</td><td><button class="wpfi-country-link" type="button" data-wpfi-country-pick="${escapeHtml(item.iso3 || "")}">${flagMarkup(item, "wpfi-flag-inline")}${escapeHtml(countryName(item))}</button></td><td>${formatNumber(item.score, 2)}</td><td>${escapeHtml(situationName(item.situation_code))}</td></tr>`).join("")}</tbody></table></div></article>`;
  }
  function overviewPanel() {
    const item = profileEntity(); const region = regionSummary(item.region_code);
    return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-overview" aria-labelledby="wpfi-tab-${runtime.instance}-overview" data-wpfi-panel="overview" tabindex="0">${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}<div class="wpfi-metric-grid">${metricCard(tr("worldAverage"), formatNumber(worldMean(), 2), `${formatInteger(runtime.ranking?.total)} · ${tr("derived")}`, true)}${metricCard(tr("regionalAverage"), formatNumber(region?.derived_mean_score, 2), regionName(item.region_code), true)}${metricCard(tr("scoreEvolution"), formatSigned(item.score_evolution, 2), `${formatNumber(item.previous_score, 2)} → ${formatNumber(item.score, 2)}`)}${metricCard(tr("rankEvolution"), formatSigned(item.rank_evolution, 0), `${formatInteger(item.previous_rank)} → ${formatInteger(item.official_rank)}`)}</div><div class="wpfi-overview-grid"><article class="wpfi-card wpfi-map-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("worldMap"))}</p><h3>${escapeHtml(tr("mapText"))}</h3></div></div>${mapMarkup()}</article><article class="wpfi-card wpfi-profile-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("profile"))}</p><h3>${escapeHtml(countryName(item))}</h3></div><span class="wpfi-source-chip">${escapeHtml(situationName(item.situation_code))}</span></div>${indicatorBars()}</article></div>${neighborTable()}</section>`;
  }

  function indicatorCards() {
    return `<div class="wpfi-source-grid wpfi-indicator-grid">${indicatorCatalog().map((catalog) => { const result = indicatorResult(catalog.indicator_code); return `<button type="button" class="wpfi-source-card wpfi-indicator-card ${catalog.indicator_code === runtime.indicatorCode ? "is-selected" : ""}" data-wpfi-indicator-pick="${escapeHtml(catalog.indicator_code)}"><span class="wpfi-source-chip">${escapeHtml(`${formatNumber((catalog.weight || 0) * 100, 0)}%`)}</span><h3>${escapeHtml(indicatorName(catalog))}</h3><strong class="wpfi-source-score">${formatNumber(result?.score, 2)}</strong><small>#${formatInteger(result?.official_rank)} · ${formatInteger(catalog.questionnaire_items)} ${escapeHtml(tr("questionnaireItems").toLowerCase())}</small></button>`; }).join("")}</div>`;
  }
  function lineChart(items, field = "score", reverse = false) {
    const points = (items || []).map((item) => ({ year: Number(item.release_year), value: numeric(item[field]) })).filter((item) => Number.isFinite(item.year) && item.value !== null);
    if (!points.length) return `<div class="wpfi-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    const width = 760, height = 260, padX = 42, padY = 28; const years = points.map((p) => p.year); const values = points.map((p) => p.value); const minYear = Math.min(...years), maxYear = Math.max(...years); let minValue = Math.min(...values), maxValue = Math.max(...values); if (minValue === maxValue) { minValue -= 1; maxValue += 1; } const scaleX = (year) => padX + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - padX * 2); const scaleY = (value) => padY + ((reverse ? value - minValue : maxValue - value) / (maxValue - minValue)) * (height - padY * 2); const d = points.map((p, i) => `${i ? "L" : "M"}${scaleX(p.year).toFixed(2)},${scaleY(p.value).toFixed(2)}`).join(" ");
    return `<div class="wpfi-chart"><svg viewBox="0 0 ${width} ${height}" role="img"><g class="wpfi-chart-grid"><line x1="${padX}" x2="${padX}" y1="${padY}" y2="${height - padY}"></line><line x1="${padX}" x2="${width - padX}" y1="${height - padY}" y2="${height - padY}"></line></g><path class="wpfi-chart-line wpfi-line-0" d="${d}"></path><g class="wpfi-chart-dots">${points.map((p) => `<circle cx="${scaleX(p.year)}" cy="${scaleY(p.value)}" r="4"><title>${p.year}: ${formatNumber(p.value, field.includes("rank") ? 0 : 2)}</title></circle>`).join("")}</g></svg></div>`;
  }
  function indicatorsPanel() {
    const catalog = selectedIndicator(); const result = indicatorResult(runtime.indicatorCode); const series = runtime.indicatorSeries?.items || [];
    return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-indicators" aria-labelledby="wpfi-tab-${runtime.instance}-indicators" data-wpfi-panel="indicators" tabindex="0">${sectionHeading(tr("indicatorsKicker"), tr("indicatorsHeading"), tr("indicatorsText"))}${indicatorCards()}<div class="wpfi-source-layout"><article class="wpfi-card wpfi-source-detail"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("selectedIndicator"))}</p><h3>${escapeHtml(indicatorName(catalog))}</h3></div><span class="wpfi-rank-chip">#${formatInteger(result?.official_rank)}</span></div><dl><div><dt>${escapeHtml(tr("indicatorScore"))}</dt><dd>${formatNumber(result?.score, 2)}</dd></div><div><dt>${escapeHtml(tr("weight"))}</dt><dd>${formatNumber((catalog?.weight || 0) * 100, 0)}%</dd></div><div><dt>${escapeHtml(tr("questionnaireItems"))}</dt><dd>${formatInteger(catalog?.questionnaire_items)}</dd></div><div><dt>${escapeHtml(tr("officialIndicatorRank"))}</dt><dd>${formatInteger(result?.official_rank)} / ${formatInteger(runtime.ranking?.total)}</dd></div></dl><p>${escapeHtml(runtime.lang === "ru" ? catalog?.note_ru : catalog?.note_en)}</p><div class="wpfi-source-order-warning">${escapeHtml(tr("indicatorOrderingWarning"))}</div></article><article class="wpfi-card wpfi-chart-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("indicatorSeries"))}</p><h3>${escapeHtml(countryName(profileEntity()))}</h3></div></div>${lineChart(series, "score")}</article></div></section>`;
  }

  function trendMetricOptions() { return [`<option value="score" ${runtime.trendMetric === "score" ? "selected" : ""}>${escapeHtml(tr("overallScore"))}</option>`, `<option value="rank" ${runtime.trendMetric === "rank" ? "selected" : ""}>${escapeHtml(tr("overallRank"))}</option>`, ...indicatorCatalog().map((item) => `<option value="${escapeHtml(item.indicator_code)}" ${runtime.trendMetric === item.indicator_code ? "selected" : ""}>${escapeHtml(indicatorName(item))}</option>`)].join(""); }
  function trendData() { return runtime.trendMetric === "score" || runtime.trendMetric === "rank" ? (runtime.series?.items || []) : (runtime.indicatorSeries?.items || []); }
  function trendPanel() {
    const items = trendData(); const field = runtime.trendMetric === "rank" ? "official_rank" : "score"; const values = items.map((item) => numeric(item[field])).filter((value) => value !== null); const first = items[0], last = items[items.length - 1]; const delta = numeric(last?.[field]) !== null && numeric(first?.[field]) !== null ? numeric(last[field]) - numeric(first[field]) : null; const isRank = field === "official_rank";
    return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-trend" aria-labelledby="wpfi-tab-${runtime.instance}-trend" data-wpfi-panel="trend" tabindex="0">${sectionHeading(tr("trendKicker"), tr("trendHeading"), tr("trendText"), `<label class="wpfi-inline-field"><span>${escapeHtml(tr("metric"))}</span><select data-wpfi-trend-metric>${trendMetricOptions()}</select></label>`)}<div class="wpfi-metric-grid">${metricCard(tr("firstYear"), formatYear(first?.release_year), formatNumber(first?.[field], isRank ? 0 : 2))}${metricCard(tr("lastYear"), formatYear(last?.release_year), formatNumber(last?.[field], isRank ? 0 : 2))}${metricCard(tr("periodDelta"), formatSigned(delta, isRank ? 0 : 2), isRank ? tr("rankWarning") : "2022+", isRank)}${metricCard(tr("minimum"), formatNumber(values.length ? Math.min(...values) : null, isRank ? 0 : 2), `${tr("maximum")}: ${formatNumber(values.length ? Math.max(...values) : null, isRank ? 0 : 2)}`)}</div><article class="wpfi-card wpfi-chart-card">${lineChart(items, field, isRank)}</article>${isRank ? `<p class="wpfi-notice">${escapeHtml(tr("rankWarning"))}</p>` : ""}<details class="wpfi-table-details"><summary>${escapeHtml(tr("trendTable"))}</summary><div class="wpfi-table-scroll"><table class="wpfi-table wpfi-trend-table"><thead><tr><th>${escapeHtml(tr("releaseYear"))}</th><th>${escapeHtml(tr("assessmentYear"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("situation"))}</th></tr></thead><tbody>${items.map((item) => `<tr><td>${formatYear(item.release_year)}</td><td>${formatYear(item.assessment_year)}</td><td>${formatNumber(item.score, 2)}</td><td>${formatInteger(item.official_rank)}</td><td>${escapeHtml(item.situation_code ? situationName(item.situation_code) : "—")}</td></tr>`).join("")}</tbody></table></div></details></section>`;
  }

  function rankingMetricOptions() { return `<option value="overall" ${runtime.rankingMetric === "overall" ? "selected" : ""}>${escapeHtml(tr("officialRanking"))}</option>${indicatorCatalog().map((item) => `<option value="${escapeHtml(item.indicator_code)}" ${runtime.rankingMetric === item.indicator_code ? "selected" : ""}>${escapeHtml(indicatorName(item))}</option>`).join("")}`; }
  function regionOptions() { return `<option value="">${escapeHtml(tr("allRegions"))}</option>${(runtime.regions?.items || []).filter((item) => item.current !== false && numeric(item.entity_count) > 0).map((item) => `<option value="${escapeHtml(item.region_code)}" ${runtime.rankingRegion === item.region_code ? "selected" : ""}>${escapeHtml(regionName(item.region_code))}</option>`).join("")}`; }
  function situationOptions() { return `<option value="">${escapeHtml(tr("allSituations"))}</option>${SITUATION_ORDER.map((code) => `<option value="${code}" ${runtime.rankingSituation === code ? "selected" : ""}>${escapeHtml(situationName(code))}</option>`).join("")}`; }
  function incomeOptions() { const groups = [...new Set(rankingItems().map((item) => item.host_income_group).filter(Boolean))].sort(); return `<option value="">${escapeHtml(tr("allIncomeGroups"))}</option>${groups.map((group) => `<option value="${escapeHtml(group)}" ${runtime.rankingIncome === group ? "selected" : ""}>${escapeHtml(group)}</option>`).join("")}`; }
  function filteredRanking() {
    const items = currentRankingPayload()?.items || []; const query = runtime.rankingQuery.trim().toLocaleLowerCase();
    return items.filter((item) => runtime.includeNonIso || Boolean(item.iso3)).filter((item) => !runtime.rankingRegion || item.region_code === runtime.rankingRegion).filter((item) => !runtime.rankingSituation || item.situation_code === runtime.rankingSituation).filter((item) => !runtime.rankingIncome || item.host_income_group === runtime.rankingIncome).filter((item) => !query || [countryName(item), item.iso3, item.source_iso3, item.name_en, item.name_fr].some((value) => String(value || "").toLocaleLowerCase().includes(query)));
  }
  function rankingFilters() { return `<div class="wpfi-ranking-filters"><label><span>${escapeHtml(tr("search"))}</span><input type="search" data-wpfi-ranking-query value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}"></label><label><span>${escapeHtml(tr("rankingMetric"))}</span><select data-wpfi-ranking-metric>${rankingMetricOptions()}</select></label><label><span>${escapeHtml(tr("region"))}</span><select data-wpfi-ranking-region>${regionOptions()}</select></label><label><span>${escapeHtml(tr("situation"))}</span><select data-wpfi-ranking-situation>${situationOptions()}</select></label><label><span>${escapeHtml(tr("incomeGroup"))}</span><select data-wpfi-ranking-income>${incomeOptions()}</select></label><label class="wpfi-page-size-field"><span>${escapeHtml(tr("pageSize"))}</span><select data-wpfi-ranking-size>${[10,25,50,100].map((size) => `<option value="${size}" ${runtime.rankingPageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label><label class="wpfi-check-field"><input type="checkbox" data-wpfi-include-non-iso ${runtime.includeNonIso ? "checked" : ""}><span>${escapeHtml(tr("includeNonIso"))}</span></label></div>`; }
  function rankingTable() {
    const items = filteredRanking(); const totalPages = Math.max(1, Math.ceil(items.length / runtime.rankingPageSize)); runtime.rankingPage = Math.min(runtime.rankingPage, totalPages); const start = (runtime.rankingPage - 1) * runtime.rankingPageSize; const pageItems = items.slice(start, start + runtime.rankingPageSize); const indicatorMode = runtime.rankingMetric !== "overall";
    return `<div class="wpfi-ranking-summary"><span>${escapeHtml(`${tr("shown")}: ${items.length}`)}</span><button type="button" class="wpfi-button wpfi-button-secondary" data-wpfi-action="export">${escapeHtml(tr("exportCsv"))}</button></div>${indicatorMode ? `<p class="wpfi-ranking-note">${escapeHtml(tr("indicatorOrderingWarning"))}</p>` : ""}<div class="wpfi-table-scroll"><table class="wpfi-table wpfi-ranking-table"><thead><tr><th>${escapeHtml(indicatorMode ? tr("officialIndicatorRank") : tr("officialRank"))}</th><th>${escapeHtml(tr("country"))}</th><th>${escapeHtml(indicatorMode ? tr("indicatorScore") : tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("scoreEvolution"))}</th><th>${escapeHtml(tr("situation"))}</th></tr></thead><tbody>${pageItems.map((item) => `<tr class="${item.iso3 === runtime.country ? "is-selected" : ""}"><td>${formatInteger(indicatorMode ? item.selected_indicator_rank : item.official_rank)}</td><td><button type="button" class="wpfi-country-link" data-wpfi-country-pick="${escapeHtml(item.iso3 || "")}" ${item.iso3 ? "" : "disabled"}>${flagMarkup(item, "wpfi-flag-inline")}${escapeHtml(countryName(item))}</button></td><td>${formatNumber(indicatorMode ? item.selected_indicator_score : item.score, 2)}</td><td>${formatInteger(item.official_rank)}</td><td>${formatSigned(item.score_evolution, 2)}</td><td>${escapeHtml(situationName(item.situation_code))}</td></tr>`).join("")}</tbody></table></div><div class="wpfi-pagination"><button type="button" data-wpfi-page="prev" ${runtime.rankingPage <= 1 ? "disabled" : ""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(`${tr("page")} ${runtime.rankingPage} / ${totalPages}`)}</span><button type="button" data-wpfi-page="next" ${runtime.rankingPage >= totalPages ? "disabled" : ""}>${escapeHtml(tr("next"))}</button></div>`;
  }
  function rankingPanel() { return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-ranking" aria-labelledby="wpfi-tab-${runtime.instance}-ranking" data-wpfi-panel="ranking" tabindex="0">${sectionHeading(tr("rankingKicker"), tr("rankingHeading"), tr("rankingText"))}<article class="wpfi-card wpfi-ranking-card">${rankingFilters()}${rankingTable()}</article></section>`; }

  function changeItems() {
    return rankingItems().filter((item) => numeric(item.score_evolution) !== null).filter((item) => !runtime.changeDirection || (runtime.changeDirection === "up" ? numeric(item.score_evolution) > 0 : runtime.changeDirection === "down" ? numeric(item.score_evolution) < 0 : numeric(item.score_evolution) === 0)).sort((a, b) => runtime.changeDirection === "down" ? numeric(a.score_evolution) - numeric(b.score_evolution) : numeric(b.score_evolution) - numeric(a.score_evolution));
  }
  function changeCards() { return `<div class="wpfi-change-grid">${changeItems().slice(0, 36).map((item) => `<article class="wpfi-change-card"><div class="wpfi-card-title"><div>${flagMarkup(item, "wpfi-flag-inline")}<h3>${escapeHtml(countryName(item))}</h3><p>${escapeHtml(regionName(item.region_code))}</p></div><span class="wpfi-change-chip">${formatSigned(item.score_evolution, 2)}</span></div><div class="wpfi-change-value"><strong>${formatNumber(item.score, 2)}</strong><small>${formatNumber(item.previous_score, 2)} → ${formatNumber(item.score, 2)}</small></div><div class="wpfi-change-meta"><span>${escapeHtml(`${tr("rankChange")}: ${formatSigned(item.rank_evolution, 0)}`)}</span><button type="button" class="wpfi-text-button" data-wpfi-country-pick="${escapeHtml(item.iso3 || "")}">${escapeHtml(tr("openProfile"))}</button></div></article>`).join("")}</div>`; }
  function changesPanel() {
    const all = rankingItems().filter((item) => numeric(item.score_evolution) !== null); const up = all.filter((item) => numeric(item.score_evolution) > 0); const down = all.filter((item) => numeric(item.score_evolution) < 0); const stable = all.filter((item) => numeric(item.score_evolution) === 0); const best = [...up].sort((a,b) => numeric(b.score_evolution)-numeric(a.score_evolution))[0]; const worst = [...down].sort((a,b) => numeric(a.score_evolution)-numeric(b.score_evolution))[0];
    return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-changes" aria-labelledby="wpfi-tab-${runtime.instance}-changes" data-wpfi-panel="changes" tabindex="0">${sectionHeading(tr("changesKicker"), tr("changesHeading"), tr("changesText"))}<div class="wpfi-change-summary">${metricCard(tr("totalChanges"), formatInteger(all.length), `${runtime.year}`)}${metricCard(tr("improvements"), formatInteger(up.length), best ? `${countryName(best)} ${formatSigned(best.score_evolution,2)}` : "")}${metricCard(tr("declines"), formatInteger(down.length), worst ? `${countryName(worst)} ${formatSigned(worst.score_evolution,2)}` : "")}${metricCard(tr("stable"), formatInteger(stable.length), "0.00")}</div><div class="wpfi-change-filters"><button type="button" class="wpfi-button ${runtime.changeDirection === "" ? "wpfi-button-primary" : "wpfi-button-secondary"}" data-wpfi-change="">${escapeHtml(tr("all"))}</button><button type="button" class="wpfi-button ${runtime.changeDirection === "up" ? "wpfi-button-primary" : "wpfi-button-secondary"}" data-wpfi-change="up">${escapeHtml(tr("improvements"))}</button><button type="button" class="wpfi-button ${runtime.changeDirection === "down" ? "wpfi-button-primary" : "wpfi-button-secondary"}" data-wpfi-change="down">${escapeHtml(tr("declines"))}</button><button type="button" class="wpfi-button ${runtime.changeDirection === "stable" ? "wpfi-button-primary" : "wpfi-button-secondary"}" data-wpfi-change="stable">${escapeHtml(tr("stable"))}</button></div>${changeCards()}<h3>${escapeHtml(tr("regionalSummary"))}</h3><div class="wpfi-region-grid">${(runtime.regions?.items || []).filter((item) => item.current !== false && numeric(item.entity_count) > 0).map((item) => `<article class="wpfi-region-card"><span>${escapeHtml(tr("derived"))}</span><h3>${escapeHtml(regionName(item.region_code))}</h3><strong class="wpfi-region-score">${formatNumber(item.derived_mean_score, 2)}</strong><small>${formatInteger(item.entity_count)} ${escapeHtml(tr("records"))} · ${formatNumber(item.min_score,2)}–${formatNumber(item.max_score,2)}</small></article>`).join("")}</div></section>`;
  }

  function methodCard(title, text) { return `<article class="wpfi-method-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`; }
  function methodologyPanel() {
    const release = currentRelease(); const audit = runtime.audit?.audit || {}; const gate = audit.publication_gate || {}; const sources = runtime.metadata?.sources || {}; const thresholds = runtime.metadata?.methodology?.classification_thresholds || [];
    return `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-methodology" aria-labelledby="wpfi-tab-${runtime.instance}-methodology" data-wpfi-panel="methodology" tabindex="0">${sectionHeading(tr("methodologyKicker"), tr("methodologyHeading"), tr("methodologyText"))}<div class="wpfi-method-grid">${methodCard(tr("principleSubject"), tr("principleSubjectText"))}${methodCard(tr("principleComponents"), tr("principleComponentsText"))}${methodCard(tr("principleScale"), tr("principleScaleText"))}${methodCard(tr("principleTime"), tr("principleTimeText"))}</div><div class="wpfi-method-layout"><article class="wpfi-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("classification"))}</p><h3>${escapeHtml(tr("scoreScale"))}</h3></div></div><div class="wpfi-tracer-grid wpfi-situation-scale">${thresholds.map((item) => `<article class="wpfi-tracer-card"><span class="wpfi-source-chip">${formatNumber(item.min_inclusive,0)}–${formatNumber(item.max_exclusive >= 100 ? 100 : item.max_exclusive,0)}</span><h3>${escapeHtml(runtime.lang === "ru" ? item.name_ru : item.name_en)}</h3></article>`).join("")}</div></article><article class="wpfi-card wpfi-audit-card"><div class="wpfi-card-title"><div><p>${escapeHtml(tr("sourceAudit"))}</p><h3>${escapeHtml(gate.ok ? tr("auditPassed") : tr("auditReview"))}</h3></div><span class="wpfi-source-chip">${escapeHtml(release.status || "—")}</span></div><dl class="wpfi-audit-list"><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd>${escapeHtml(release.release_id || runtime.ranking?.release_id || "—")}</dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("rawBytes"))}</dt><dd>${formatInteger(release.raw_bytes)}</dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(release.transform_id || "—")}</code></dd></div><div><dt>${escapeHtml(tr("importerVersion"))}</dt><dd>${escapeHtml(release.importer_version || "—")}</dd></div><div><dt>${escapeHtml(tr("publicationGate"))}</dt><dd>${gate.ok ? tr("auditPassed") : tr("auditReview")}</dd></div></dl><div class="wpfi-source-links">${externalLink(release.index_page_url || sources.index_page, tr("officialSource"))}${externalLink(release.source_url, tr("annualCsv"))}${externalLink(release.methodology_url || sources.methodology, tr("methodologyLink"))}${externalLink(release.analysis_url || sources.analysis, tr("analysisLink"))}${externalLink(release.terms_url || sources.terms, tr("terms"))}</div></article></div></section>`;
  }

  function activePanel() { return ({ overview: overviewPanel, indicators: indicatorsPanel, trend: trendPanel, ranking: rankingPanel, changes: changesPanel, methodology: methodologyPanel })[runtime.view](); }
  function inactivePanels() { return VIEW_KEYS.filter((view) => view !== runtime.view).map((view) => `<section class="wpfi-panel" role="tabpanel" id="wpfi-panel-${runtime.instance}-${view}" aria-labelledby="wpfi-tab-${runtime.instance}-${view}" data-wpfi-panel="${view}" hidden></section>`).join(""); }
  function renderAvailable() { if (!runtime.root) return; runtime.root.innerHTML = `<div class="wpfi-workspace" data-wpfi-state="available" data-module-version="${MODULE_VERSION}" aria-live="polite">${hero()}${controlBar()}${tabs()}<div class="wpfi-view-stage">${activePanel()}${inactivePanels()}</div><p class="wpfi-sr-only">${escapeHtml(tr("keyboardTabs"))}</p></div>`; bindEvents(); }

  function provenanceHtml() {
    const item = profileEntity(); const release = currentRelease(); const indicator = indicatorResult(runtime.indicatorCode); const payload = item.result_provenance || item.provenance || {};
    return `<div class="wpfi-provenance"><h2>${escapeHtml(tr("provenance"))}</h2><dl><div><dt>${escapeHtml(tr("country"))}</dt><dd>${escapeHtml(countryName(item))}</dd></div><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd>${escapeHtml(release.release_id || runtime.ranking?.release_id || "—")}</dd></div><div><dt>${escapeHtml(tr("officialScore"))}</dt><dd>${formatNumber(item.score,2)}</dd></div><div><dt>${escapeHtml(tr("officialRank"))}</dt><dd>${formatInteger(item.official_rank)}</dd></div><div><dt>${escapeHtml(tr("sourceRow"))}</dt><dd>${formatInteger(item.result_source_row || item.source_row)}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(release.transform_id || "—")}</code></dd></div></dl><details><summary>JSON provenance</summary><pre>${escapeHtml(JSON.stringify({ result: payload, selected_indicator: indicator?.provenance || null }, null, 2))}</pre></details></div>`;
  }
  function openProvenance() { if (typeof runtime.context.openDrawer === "function") runtime.context.openDrawer({ title: tr("provenance"), html: provenanceHtml() }); else { const dialog = document.createElement("dialog"); dialog.className = "wpfi-dialog"; dialog.innerHTML = `<div class="wpfi-dialog-head"><button type="button" data-wpfi-action="close-dialog">×</button></div>${provenanceHtml()}`; document.body.append(dialog); dialog.showModal(); } }
  async function shareProfile() { try { await navigator.clipboard.writeText(window.location.href); notify(tr("copied")); } catch (_) { notify(window.location.href); } }
  function csvCell(value) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function exportRanking() { const items = filteredRanking(); const indicatorMode = runtime.rankingMetric !== "overall"; const rows = [["ordering_rank","country","iso3","metric_score","official_overall_rank","overall_score","score_evolution","situation"], ...items.map((item) => [indicatorMode ? item.selected_indicator_rank : item.official_rank, countryName(item), item.iso3 || item.source_iso3, indicatorMode ? item.selected_indicator_score : item.score, item.official_rank, item.score, item.score_evolution, item.situation_code])]; const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `gir-wpfi-${runtime.year}-${runtime.rankingMetric}.csv`; anchor.click(); URL.revokeObjectURL(url); }

  async function setView(view, { focusTab = false, focusPanel = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return; runtime.view = view;
    if (view === "indicators" && !runtime.indicatorSeries) await loadIndicatorSeries(runtime.indicatorCode);
    if (view === "trend" && !["score", "rank"].includes(runtime.trendMetric) && !runtime.indicatorSeries) await loadIndicatorSeries(runtime.trendMetric);
    renderAvailable(); updateDeepLink();
    if (focusTab) runtime.root.querySelector(`[data-wpfi-view="${view}"]`)?.focus();
    if (focusPanel) runtime.root.querySelector(`[data-wpfi-panel="${view}"]`)?.focus();
  }
  function rerenderStage({ focusSelector = "", cursor = null } = {}) { renderAvailable(); if (focusSelector) { const input = runtime.root.querySelector(focusSelector); input?.focus(); if (cursor !== null && input?.setSelectionRange) input.setSelectionRange(cursor, cursor); } updateDeepLink(); }
  function handleTabKeydown(event) { const tabs = [...runtime.root.querySelectorAll("[data-wpfi-view]")]; const index = tabs.indexOf(event.currentTarget); let next = null; if (event.key === "ArrowRight") next = (index + 1) % tabs.length; if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length; if (event.key === "Home") next = 0; if (event.key === "End") next = tabs.length - 1; if (next !== null) { event.preventDefault(); setView(tabs[next].dataset.wpfiView, { focusTab: true }); } }

  function bindEvents() {
    if (!runtime.root) return;
    runtime.root.querySelectorAll("[data-wpfi-view]").forEach((button) => { button.onclick = () => setView(button.dataset.wpfiView, { focusPanel: false }); button.onkeydown = handleTabKeydown; });
    runtime.root.querySelector("[data-wpfi-country]")?.addEventListener("change", (event) => changeCountry(event.target.value));
    runtime.root.querySelector("[data-wpfi-year]")?.addEventListener("change", (event) => changeYear(event.target.value));
    runtime.root.querySelectorAll("[data-wpfi-country-pick]").forEach((button) => button.addEventListener("click", () => button.dataset.wpfiCountryPick && changeCountry(button.dataset.wpfiCountryPick)));
    runtime.root.querySelectorAll("[data-wpfi-map-iso]").forEach((path) => path.addEventListener("click", () => path.dataset.hasValue === "true" && changeCountry(path.dataset.wpfiMapIso)));
    runtime.root.querySelectorAll("[data-wpfi-indicator-pick]").forEach((button) => button.addEventListener("click", async () => { runtime.indicatorCode = button.dataset.wpfiIndicatorPick; runtime.trendMetric = runtime.view === "trend" ? runtime.indicatorCode : runtime.trendMetric; await loadIndicatorSeries(runtime.indicatorCode); renderAvailable(); updateDeepLink(); }));
    runtime.root.querySelector("[data-wpfi-trend-metric]")?.addEventListener("change", async (event) => { runtime.trendMetric = event.target.value; runtime.indicatorSeries = null; if (!["score","rank"].includes(runtime.trendMetric)) await loadIndicatorSeries(runtime.trendMetric); renderAvailable(); updateDeepLink(); });
    runtime.root.querySelector("[data-wpfi-ranking-metric]")?.addEventListener("change", async (event) => { runtime.rankingMetric = event.target.value; runtime.rankingPage = 1; runtime.indicatorRanking = null; if (runtime.rankingMetric !== "overall") await loadIndicatorRanking(runtime.rankingMetric); renderAvailable(); updateDeepLink(); });
    runtime.root.querySelector("[data-wpfi-ranking-query]")?.addEventListener("input", (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderStage({ focusSelector: "[data-wpfi-ranking-query]", cursor: event.target.selectionStart }); });
    runtime.root.querySelector("[data-wpfi-ranking-region]")?.addEventListener("change", (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderStage(); });
    runtime.root.querySelector("[data-wpfi-ranking-situation]")?.addEventListener("change", (event) => { runtime.rankingSituation = event.target.value; runtime.rankingPage = 1; rerenderStage(); });
    runtime.root.querySelector("[data-wpfi-ranking-income]")?.addEventListener("change", (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderStage(); });
    runtime.root.querySelector("[data-wpfi-ranking-size]")?.addEventListener("change", (event) => { runtime.rankingPageSize = Number(event.target.value); runtime.rankingPage = 1; rerenderStage(); });
    runtime.root.querySelector("[data-wpfi-include-non-iso]")?.addEventListener("change", (event) => { runtime.includeNonIso = event.target.checked; runtime.rankingPage = 1; rerenderStage(); });
    runtime.root.querySelectorAll("[data-wpfi-page]").forEach((button) => button.addEventListener("click", () => { runtime.rankingPage += button.dataset.wpfiPage === "next" ? 1 : -1; rerenderStage(); }));
    runtime.root.querySelectorAll("[data-wpfi-change]").forEach((button) => button.addEventListener("click", () => { runtime.changeDirection = button.dataset.wpfiChange; rerenderStage(); }));
    runtime.root.querySelectorAll("[data-wpfi-action]").forEach((button) => button.addEventListener("click", () => { const action = button.dataset.wpfiAction; if (action === "retry") loadWorkspace(); if (action === "share") shareProfile(); if (action === "provenance") openProvenance(); if (action === "export") exportRanking(); if (action === "close-dialog") button.closest("dialog")?.close(); }));
  }

  function render(context = {}) {
    runtime.context = context; runtime.root = context.root || document.querySelector("#view"); runtime.lang = context.lang === "en" ? "en" : "ru"; runtime.theme = context.theme || document.documentElement.dataset.theme || "dark"; runtime.instance += 1;
    const link = deepLink(); runtime.view = link.view || runtime.view; runtime.country = link.country || String(context.country || "").toUpperCase(); if (!runtime.country) return runtime; runtime.year = link.year || Number(context.year) || runtime.year; runtime.indicatorCode = link.indicatorCode || runtime.indicatorCode; runtime.trendMetric = link.trendMetric || runtime.trendMetric; runtime.rankingMetric = link.rankingMetric || runtime.rankingMetric; runtime.changeDirection = link.changeDirection || runtime.changeDirection;
    if (!runtime.root) throw new Error("WPFI root element is missing"); loadWorkspace(); return runtime;
  }
  function invalidate({ hard = false } = {}) { runtime.abortController?.abort(); runtime.detailController?.abort(); if (hard) { metadataCache.clear(); geoCache.value = null; geoCache.promise = null; } }

  window.GIRWorldPressFreedom = Object.freeze({
    render,
    invalidate,
    version: MODULE_VERSION,
    officialScoreSemantics: OFFICIAL_SCORE_SEMANTICS,
    officialOverallOrdering: OFFICIAL_OVERALL_ORDER,
    officialIndicatorOrdering: OFFICIAL_INDICATOR_ORDER,
    derivedRegionalSemantics: DERIVED_REGIONAL_SEMANTICS,
  });
})();
