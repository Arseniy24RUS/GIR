(() => {
  "use strict";

  const MODULE_VERSION = "1.0.0";
  const API = "/api/rule-of-law";
  const MAP_URL = "/static/world_countries_lite.geojson";
  const VIEW_KEYS = ["overview", "factors", "subfactors", "trend", "ranking", "methodology"];
  const OFFICIAL_ORDER = "official_wjp_overall_global_rank";
  const DERIVED_OVERALL_ORDER = "derived_gir_overall_score_order_not_official_rank";
  const DERIVED_FACTOR_ORDER = "derived_gir_factor_score_order_not_official_rank";
  const DERIVED_SUBFACTOR_ORDER = "derived_gir_subfactor_score_order_not_official_rank";
  const STRICT_SERIES_FROM = 2015;

  const TEXT = {
    ru: {
      indexName: "Индекс верховенства права WJP", short: "ROLI", group: "Государство и институты",
      loading: "Загрузка WJP Rule of Law Index", loadingDetail: "Получаем опубликованную редакцию, профиль факторов, подфакторы и исторические периоды.",
      notLoaded: "Интерфейс ROLI готов", notLoadedDetail: "Опубликованный выпуск ещё не прошёл publication gate. Тестовые страновые значения не подставляются.",
      error: "Не удалось загрузить ROLI", retry: "Повторить",
      overview: "Обзор", factors: "8 факторов", subfactors: "44 подфактора", trend: "Динамика", ranking: "Мировой рейтинг", methodology: "Методология и аудит",
      kicker: "Верховенство права · опыт граждан и оценки практикующих юристов",
      lead: "Официальный показатель World Justice Project по шкале 0–1. Чем выше score, тем сильнее соблюдение принципов верховенства права.",
      officialScore: "Официальный score", officialRank: "Официальное место", jurisdictions: "Юрисдикций", scoreScale: "Шкала 0–1 · больше — лучше",
      country: "Страна / юрисдикция", period: "Период", share: "Скопировать ссылку", provenance: "Происхождение значения", copied: "Ссылка скопирована",
      available: "Данные опубликованы", dataStatus: "Статус данных",
      overviewKicker: "Страновой профиль", overviewHeading: "Общий индекс и восемь факторов", overviewText: "Официальные score сохраняются без пересчёта. Место отображается только при наличии проверенного официального companion-источника.",
      worldMedian: "Медиана 143 юрисдикций", regionalMedian: "Медиана региона GIR", changeSince2015: "Изменение с 2015 года", remainingGap: "До максимума 1,0",
      mapTitle: "Карта верховенства права", mapText: "Цвет показывает официальный общий score; серый — нет сопоставимого значения.",
      factorProfile: "Профиль восьми факторов", neighbors: "Соседи по порядку", noData: "Нет данных", openProfile: "Открыть профиль",
      factorsKicker: "Концептуальная структура", factorsHeading: "Восемь равновзвешенных факторов", factorsText: "Факторы охватывают ограничения власти, коррупцию, открытость государства, права, безопасность, регулирование и правосудие.",
      compareWith: "Сравнить с", noComparison: "Без сравнения", factorScore: "Score фактора", showSubfactors: "Открыть подфакторы", radarAlternative: "Табличная альтернатива диаграмме",
      subfactorsKicker: "Диагностический уровень", subfactorsHeading: "44 международно сопоставимых подфактора", subfactorsText: "Выберите фактор и подфактор. Значения импортируются из официального historical workbook WJP.",
      allFactors: "Все факторы", sourceHeader: "Исходное название", sourceSheet: "Исходный лист", sourceRow: "Исходная строка", sourceColumn: "Исходная колонка", showTrend: "Показать динамику",
      subfactorOrderWarning: "Сортировка стран по подфактору — производный порядок GIR, а не официальный общий рейтинг WJP.",
      trendKicker: "Исторический ряд", trendHeading: "Динамика внутри одной редакции", trendText: "Исходные комбинированные окна 2012–2013 и 2017–2018 сохраняются без фиктивной ежегодной интерполяции.",
      metric: "Показатель", overallScore: "Общий score", firstPeriod: "Первый период", latestPeriod: "Последний период", absoluteChange: "Изменение", minimum: "Минимум", maximum: "Максимум",
      strictBoundary: "Сопоставимость", pre2015: "До 2015: осторожная интерпретация", noSeries: "Нет временного ряда",
      rankingKicker: "Сравнение юрисдикций", rankingHeading: "Мировая таблица WJP", rankingText: "При наличии official rank используется официальный порядок. Для факторов и подфакторов показывается явно обозначенный производный порядок GIR.",
      selectedMetric: "Порядок строк", officialOverall: "Общий показатель", factorOrder: "По фактору · производный", subfactorOrder: "По подфактору · производный",
      search: "Поиск", searchPlaceholder: "Страна, юрисдикция или ISO3", region: "Регион WJP", income: "Группа дохода", allRegions: "Все регионы", allIncome: "Все группы", pageSize: "Строк на странице", exportCsv: "Экспорт CSV",
      resultCount: "Результатов", rank: "Позиция", derivedOrder: "Порядок GIR", name: "Юрисдикция", score: "Score", previous: "Назад", next: "Далее", page: "Страница", of: "из",
      officialOrderNote: "Строки следуют официальному глобальному месту WJP.", derivedOrderNote: "Порядок рассчитан GIR по выбранному score и не является официальным рейтингом WJP.",
      methodologyKicker: "Воспроизводимость", methodologyHeading: "Методология, источники и audit trail", methodologyText: "Интерфейс разделяет официальные значения, официальный rank companion и производные аналитические представления GIR.",
      principle1: "Два типа опросов", principle1Text: "General Population Poll фиксирует опыт и восприятие граждан; Qualified Respondents’ Questionnaires собирают оценки практикующих юристов и экспертов.",
      principle2: "Восемь факторов и 44 подфактора", principle2Text: "Восемь факторов входят в агрегированный индекс с равным весом; каждый фактор раскрывается через международно сопоставимые подфакторы.",
      principle3: "Шкала 0–1", principle3Text: "Большее значение означает более сильное соблюдение принципов верховенства права. Score не является процентом населения.",
      informalJustice: "Factor 9: Informal Justice", informalJusticeText: "Данные собираются, но не включаются в межстрановые score и rankings из-за недостаточной сопоставимости.",
      sourceAudit: "Источник и аудит", auditPassed: "Проверка пройдена", auditFailed: "Требуется проверка", publicationGate: "Publication gate", publisher: "Издатель", release: "Редакция", releaseId: "Release ID", retrievedAt: "Получено", rawSnapshot: "SHA-256 workbook", rankSnapshot: "SHA-256 rank companion", transformId: "Transformation ID", importerVersion: "Версия импортёра", snapshotCheck: "Целостность snapshot", validationIssues: "Предупреждения импорта",
      officialSource: "Интерактивный индекс WJP", dataPage: "Исторические данные", report: "Отчёт 2025", methodologyLink: "Методология WJP", close: "Закрыть", downloadName: "gir-rule-of-law",
      officialRankSource: "Источник места", selectedMetricLabel: "Выбранная метрика", sourceCell: "Исходная ячейка", exactPeriod: "Точный период", framework: "Структура индекса",
    },
    en: {
      indexName: "WJP Rule of Law Index", short: "ROLI", group: "Governance & institutions",
      loading: "Loading the WJP Rule of Law Index", loadingDetail: "Retrieving the published edition, factor profile, subfactors and historical periods.",
      notLoaded: "The ROLI interface is ready", notLoadedDetail: "No edition has passed the publication gate yet. No test country values are substituted.",
      error: "ROLI could not be loaded", retry: "Retry",
      overview: "Overview", factors: "8 factors", subfactors: "44 subfactors", trend: "Trend", ranking: "World ranking", methodology: "Methodology & audit",
      kicker: "Rule of law · citizens’ experiences and legal-practitioner assessments",
      lead: "World Justice Project’s official 0–1 measure. A higher score indicates stronger adherence to the rule of law.",
      officialScore: "Official score", officialRank: "Official rank", jurisdictions: "Jurisdictions", scoreScale: "0–1 scale · higher is better",
      country: "Country / jurisdiction", period: "Period", share: "Copy link", provenance: "Value provenance", copied: "Link copied",
      available: "Published data", dataStatus: "Data status",
      overviewKicker: "Country profile", overviewHeading: "Overall index and eight factors", overviewText: "Official scores are preserved without recomputation. Rank is shown only when a verified official companion source is present.",
      worldMedian: "Median across 143 jurisdictions", regionalMedian: "Derived GIR regional median", changeSince2015: "Change since 2015", remainingGap: "Distance to 1.0",
      mapTitle: "Rule-of-law map", mapText: "Colour represents the official overall score; grey means no comparable value.",
      factorProfile: "Eight-factor profile", neighbors: "Ordering neighbours", noData: "No data", openProfile: "Open profile",
      factorsKicker: "Conceptual framework", factorsHeading: "Eight equally weighted factors", factorsText: "The factors cover constraints on power, corruption, open government, rights, security, regulation and justice.",
      compareWith: "Compare with", noComparison: "No comparison", factorScore: "Factor score", showSubfactors: "Open subfactors", radarAlternative: "Tabular alternative to the chart",
      subfactorsKicker: "Diagnostic layer", subfactorsHeading: "44 internationally comparable subfactors", subfactorsText: "Choose a factor and subfactor. Values are imported from WJP’s official historical workbook.",
      allFactors: "All factors", sourceHeader: "Source label", sourceSheet: "Source sheet", sourceRow: "Source row", sourceColumn: "Source column", showTrend: "Show trend",
      subfactorOrderWarning: "Ordering by a subfactor is a derived GIR view, not WJP’s official overall ranking.",
      trendKicker: "Historical series", trendHeading: "Trend within one edition", trendText: "Combined source windows 2012–2013 and 2017–2018 are preserved without invented annual interpolation.",
      metric: "Metric", overallScore: "Overall score", firstPeriod: "First period", latestPeriod: "Latest period", absoluteChange: "Change", minimum: "Minimum", maximum: "Maximum",
      strictBoundary: "Comparability", pre2015: "Pre-2015: interpret cautiously", noSeries: "No time series",
      rankingKicker: "Jurisdiction comparison", rankingHeading: "WJP world table", rankingText: "Official rank order is used when available. Factor and subfactor views use an explicitly labelled derived GIR order.",
      selectedMetric: "Row ordering", officialOverall: "Overall measure", factorOrder: "By factor · derived", subfactorOrder: "By subfactor · derived",
      search: "Search", searchPlaceholder: "Country, jurisdiction or ISO3", region: "WJP region", income: "Income group", allRegions: "All regions", allIncome: "All groups", pageSize: "Rows per page", exportCsv: "Export CSV",
      resultCount: "Results", rank: "Position", derivedOrder: "GIR order", name: "Jurisdiction", score: "Score", previous: "Previous", next: "Next", page: "Page", of: "of",
      officialOrderNote: "Rows follow WJP’s official global rank.", derivedOrderNote: "GIR orders rows by the selected score; this is not an official WJP ranking.",
      methodologyKicker: "Reproducibility", methodologyHeading: "Methodology, sources and audit trail", methodologyText: "The interface separates official values, the official rank companion and derived GIR analytical views.",
      principle1: "Two survey instruments", principle1Text: "The General Population Poll captures citizens’ experiences and perceptions; Qualified Respondents’ Questionnaires collect assessments from legal practitioners and experts.",
      principle2: "Eight factors and 44 subfactors", principle2Text: "Eight factors enter the aggregate with equal weight; each is disaggregated into internationally comparable subfactors.",
      principle3: "0–1 scale", principle3Text: "A higher value indicates stronger adherence to the rule of law. The score is not a percentage of the population.",
      informalJustice: "Factor 9: Informal Justice", informalJusticeText: "Data are collected but excluded from cross-country scores and rankings because they are not sufficiently comparable.",
      sourceAudit: "Source & audit", auditPassed: "Audit passed", auditFailed: "Review required", publicationGate: "Publication gate", publisher: "Publisher", release: "Edition", releaseId: "Release ID", retrievedAt: "Retrieved", rawSnapshot: "Workbook SHA-256", rankSnapshot: "Rank companion SHA-256", transformId: "Transformation ID", importerVersion: "Importer version", snapshotCheck: "Snapshot integrity", validationIssues: "Import warnings",
      officialSource: "WJP interactive index", dataPage: "Historical data", report: "2025 report", methodologyLink: "WJP methodology", close: "Close", downloadName: "gir-rule-of-law",
      officialRankSource: "Rank source", selectedMetricLabel: "Selected metric", sourceCell: "Source cell", exactPeriod: "Exact period", framework: "Index framework",
    }
  };

  const runtime = {
    root: null, context: {}, lang: "ru", theme: "dark", instance: 0,
    view: "overview", country: "", period: "2025", compareCountry: "",
    selectedFactor: "factor_1", selectedSubfactor: "1.1", trendMetric: "overall", rankingMetric: "overall",
    rankingQuery: "", rankingRegion: "", rankingIncome: "", rankingPage: 1, rankingPageSize: 25,
    status: null, metadata: null, releases: null, periods: null, factors: null, subfactors: null,
    ranking: null, metricRanking: null, profile: null, compareProfile: null, series: null, metricSeries: null, audit: null, geo: null,
    abortController: null, detailController: null,
  };
  const metadataCache = new Map();
  const geoCache = { value: null, promise: null };

  const tr = (key) => TEXT[runtime.lang]?.[key] ?? TEXT.en[key] ?? key;
  const locale = () => runtime.lang === "ru" ? "ru-RU" : "en-US";
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const numeric = (value) => {
    if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  const formatScore = (value, digits = 3) => { const number = numeric(value); return number === null ? "—" : new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(number); };
  const formatInteger = (value) => { const number = numeric(value); return number === null ? "—" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(number); };
  const formatSigned = (value) => { const n = numeric(value); return n === null ? "—" : `${n > 0 ? "+" : ""}${new Intl.NumberFormat(locale(), { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n)}`; };
  const formatDate = (value) => { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale(), { dateStyle: "medium" }).format(date); };
  const median = (values) => { const list = values.map(numeric).filter((v) => v !== null).sort((a,b) => a-b); if (!list.length) return null; const i = Math.floor(list.length/2); return list.length%2 ? list[i] : (list[i-1]+list[i])/2; };
  const urlBase = () => (window.location.origin && window.location.origin !== "null") ? `${window.location.origin}/` : (document.baseURI || "http://localhost/");
  const safeUrl = (value) => { try { const url = new URL(String(value || ""), urlBase()); return ["http:","https:"].includes(url.protocol) ? url.href : ""; } catch (_) { return ""; } };
  const isAbort = (error) => error?.name === "AbortError";

  async function fetchJson(path, { params = {}, signal, cache = "no-store" } = {}) {
    const url = new URL(path, urlBase());
    Object.entries(params).forEach(([key, value]) => { if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal, cache });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }
  async function cached(path, signal) {
    if (metadataCache.has(path)) return metadataCache.get(path);
    const value = await fetchJson(path, { signal, cache: "default" }); metadataCache.set(path, value); return value;
  }
  async function loadGeo() {
    if (geoCache.value) return geoCache.value;
    if (!geoCache.promise) geoCache.promise = fetch(MAP_URL, { cache: "force-cache" }).then((r) => { if (!r.ok) throw new Error("Map unavailable"); return r.json(); }).then((v) => (geoCache.value = v)).catch(() => null).finally(() => { geoCache.promise = null; });
    return geoCache.promise;
  }

  const periodItems = () => runtime.periods?.items || [];
  const factorCatalog = () => runtime.factors?.items || [];
  const subfactorCatalog = () => runtime.subfactors?.items || [];
  const rankingItems = (payload = runtime.ranking) => payload?.items || [];
  const profileEntity = () => ({ ...(rankingItems().find((item) => item.iso3 === runtime.country) || {}), ...(runtime.profile?.entity || {}) });
  const factorByCode = (code) => factorCatalog().find((item) => item.factor_code === code) || {};
  const subfactorByCode = (code) => subfactorCatalog().find((item) => item.subfactor_code === code) || {};
  const factorResult = (code, profile = runtime.profile) => (profile?.factors || []).find((item) => item.factor_code === code) || {};
  const subfactorResult = (code) => (runtime.profile?.subfactors || []).find((item) => item.subfactor_code === code) || {};
  const factorName = (item) => runtime.lang === "ru" ? (item?.name_ru || item?.name_en || item?.factor_code || "—") : (item?.name_en || item?.name_ru || item?.factor_code || "—");
  const subfactorName = (item) => runtime.lang === "ru" ? (item?.name_ru || item?.name_en || item?.subfactor_code || "—") : (item?.name_en || item?.name_ru || item?.subfactor_code || "—");
  const countryName = (item) => runtime.lang === "ru" ? (item?.host_name_ru || item?.name_ru || item?.host_name_en || item?.name_en || item?.iso3 || item?.source_iso3 || "—") : (item?.host_name_en || item?.name_en || item?.host_name_ru || item?.iso3 || item?.source_iso3 || "—");
  const currentRelease = () => runtime.profile?.release || runtime.metadata?.latest_release || runtime.releases?.items?.[0] || {};
  const currentRankingPayload = () => runtime.rankingMetric === "overall" ? runtime.ranking : (runtime.metricRanking || runtime.ranking);

  function flagMarkup(item, className = "roli-flag") {
    const iso2 = String(item?.host_iso2 || "").toLowerCase();
    if (!iso2) return `<span class="${className} is-code" aria-hidden="true">${escapeHtml(item?.iso3 || item?.source_iso3 || "")}</span>`;
    return `<img class="${className}" src="/static/flags/${escapeHtml(iso2)}.svg" alt="" loading="lazy">`;
  }
  function notify(message) {
    if (typeof runtime.context.toast === "function") runtime.context.toast(message);
    else { const node = document.querySelector("#toast"); if (node) { node.textContent = message; node.classList.add("show"); setTimeout(() => node.classList.remove("show"), 1800); } }
  }

  function deepLink() {
    const params = new URLSearchParams(window.location.search);
    return {
      view: params.get("roli_view"), country: params.get("roli_country") || params.get("country"), period: params.get("roli_period") || params.get("roli_year"),
      factor: params.get("roli_factor"), subfactor: params.get("roli_subfactor"), trendMetric: params.get("roli_trend_metric"), rankingMetric: params.get("roli_ranking_metric") || params.get("roli_metric"), compare: params.get("roli_compare"),
    };
  }
  function updateDeepLink({ notifyHost = false } = {}) {
    const url = new URL(window.location.href);
    const pairs = { roli_view: runtime.view, roli_country: runtime.country, roli_period: runtime.period, roli_factor: runtime.selectedFactor, roli_subfactor: runtime.selectedSubfactor, roli_trend_metric: runtime.trendMetric, roli_ranking_metric: runtime.rankingMetric, roli_compare: runtime.compareCountry };
    Object.entries(pairs).forEach(([key, value]) => value && value !== "overall" ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    url.hash = "index-ROLI";
    try { history.replaceState(history.state, "", url); } catch (_) {}
    if (notifyHost && typeof runtime.context.onContextChange === "function") runtime.context.onContextChange({ index: "ROLI", country: runtime.country, year: Number(String(runtime.period).split("-").pop()) || 2025 });
  }

  function rankingParams(metric = "overall") {
    const params = { period: runtime.period, limit: 500 };
    if (metric.startsWith("factor:")) params.factor_code = metric.slice(7);
    if (metric.startsWith("subfactor:")) params.subfactor_code = metric.slice(10);
    return params;
  }
  async function loadMetricRanking(metric, signal = null) {
    if (!metric || metric === "overall") { runtime.metricRanking = null; return; }
    runtime.metricRanking = await fetchJson(`${API}/ranking`, { params: { ...rankingParams(metric), release_id: runtime.ranking?.release_id }, signal });
  }
  async function loadMetricSeries(metric, signal = null) {
    if (!metric || metric === "overall") { runtime.metricSeries = null; return; }
    const releaseId = runtime.ranking?.release_id;
    const isFactor = metric.startsWith("factor:");
    const code = metric.slice(isFactor ? 7 : 10);
    const path = isFactor ? `${API}/factor/${encodeURIComponent(code)}/country/${encodeURIComponent(runtime.country)}/series` : `${API}/subfactor/${encodeURIComponent(code)}/country/${encodeURIComponent(runtime.country)}/series`;
    runtime.metricSeries = await fetchJson(path, { params: { release_id: releaseId }, signal });
  }
  async function loadProfile(signal) {
    const params = { period: runtime.period, release_id: runtime.ranking?.release_id };
    return Promise.all([
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}`, { params, signal }),
      fetchJson(`${API}/country/${encodeURIComponent(runtime.country)}/series`, { params: { release_id: runtime.ranking?.release_id }, signal }),
    ]);
  }
  async function loadWorkspace() {
    runtime.abortController?.abort(); runtime.abortController = new AbortController(); const signal = runtime.abortController.signal;
    renderState("loading");
    try {
      [runtime.status, runtime.metadata, runtime.releases, runtime.periods, runtime.factors, runtime.subfactors] = await Promise.all([
        fetchJson(`${API}/status`, { signal }), cached(`${API}/metadata`, signal), cached(`${API}/releases`, signal), cached(`${API}/periods`, signal), cached(`${API}/factors`, signal), cached(`${API}/subfactors`, signal),
      ]);
      if (runtime.status?.data_status !== "available" || !periodItems().length) { renderState("not_loaded"); return; }
      const labels = periodItems().map((item) => String(item.observation_label));
      if (!labels.includes(String(runtime.period))) runtime.period = labels[0];
      runtime.ranking = await fetchJson(`${API}/ranking`, { params: rankingParams("overall"), signal });
      if (runtime.ranking?.data_status !== "available" || !rankingItems().length) { renderState("not_loaded"); return; }
      if (!rankingItems().some((item) => item.iso3 === runtime.country)) runtime.profile = null;
      const profileBundle = loadProfile(signal);
      [runtime.profile, runtime.series, runtime.audit, runtime.geo] = await Promise.all([
        profileBundle.then((v) => v[0]), profileBundle.then((v) => v[1]),
        fetchJson(`${API}/audit`, { params: { release_id: runtime.ranking.release_id }, signal }).catch(() => null), loadGeo(),
      ]);
      if (!factorResult(runtime.selectedFactor).factor_code) runtime.selectedFactor = runtime.profile?.factors?.[0]?.factor_code || "factor_1";
      if (!subfactorResult(runtime.selectedSubfactor).subfactor_code) runtime.selectedSubfactor = runtime.profile?.subfactors?.find((x) => x.factor_code === runtime.selectedFactor)?.subfactor_code || "1.1";
      if (runtime.compareCountry && runtime.compareCountry !== runtime.country) runtime.compareProfile = await fetchJson(`${API}/country/${encodeURIComponent(runtime.compareCountry)}`, { params: { period: runtime.period, release_id: runtime.ranking.release_id }, signal }).catch(() => null); else runtime.compareProfile = null;
      if (runtime.rankingMetric !== "overall") await loadMetricRanking(runtime.rankingMetric, signal);
      if (runtime.trendMetric !== "overall") await loadMetricSeries(runtime.trendMetric, signal);
      updateDeepLink({ notifyHost: true }); renderAvailable();
    } catch (error) { if (!isAbort(error)) renderState("error", error); }
  }
  async function reloadProfile() {
    runtime.detailController?.abort(); runtime.detailController = new AbortController(); const signal = runtime.detailController.signal;
    try { [runtime.profile, runtime.series] = await loadProfile(signal); runtime.metricSeries = null; runtime.compareProfile = null; if (runtime.trendMetric !== "overall") await loadMetricSeries(runtime.trendMetric, signal); updateDeepLink({ notifyHost: true }); renderAvailable(); }
    catch (error) { if (!isAbort(error)) renderState("error", error); }
  }

  function stateShell(kind, error = null) {
    const title = kind === "loading" ? tr("loading") : kind === "not_loaded" ? tr("notLoaded") : tr("error");
    const detail = kind === "loading" ? tr("loadingDetail") : kind === "not_loaded" ? tr("notLoadedDetail") : escapeHtml(error?.message || String(error || ""));
    return `<section class="roli-workspace" data-roli-state="${kind}"><div class="roli-state-card" role="${kind === "error" ? "alert" : "status"}" aria-live="polite"><span>ROLI</span><h1>${escapeHtml(title)}</h1><p>${detail}</p>${kind === "error" ? `<button class="roli-button" data-roli-action="retry">${escapeHtml(tr("retry"))}</button>` : ""}</div></section>`;
  }
  function renderState(kind, error = null) { if (!runtime.root) return; runtime.root.innerHTML = stateShell(kind, error); bindEvents(); }
  function externalLink(url, label) { const safe = safeUrl(url); return safe ? `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>` : ""; }

  function hero() {
    const item = profileEntity(), release = currentRelease();
    return `<section class="roli-hero"><div class="roli-hero-copy"><div class="roli-hero-badges"><span>${escapeHtml(tr("group"))}</span><span>${escapeHtml(release.edition_name || "2025")}</span><span>${escapeHtml(runtime.period)}</span></div><p class="roli-kicker">${escapeHtml(tr("kicker"))}</p><h1>${escapeHtml(tr("indexName"))}</h1><p>${escapeHtml(tr("lead"))}</p><div class="roli-country-line">${flagMarkup(item)}<div><span>${escapeHtml(tr("country"))}</span><strong>${escapeHtml(countryName(item))}</strong></div></div><div class="roli-source-links">${externalLink(release.index_page_url || runtime.metadata?.sources?.index, tr("officialSource"))}${externalLink(release.data_page_url || runtime.metadata?.sources?.data_page, tr("dataPage"))}${externalLink(release.report_url || runtime.metadata?.sources?.report, tr("report"))}</div></div><div class="roli-hero-score"><span>${escapeHtml(tr("officialScore"))}</span><strong>${formatScore(item.overall_score)}</strong><small>${escapeHtml(tr("scoreScale"))}</small><div class="roli-hero-score-meta"><div><span>${escapeHtml(tr("officialRank"))}</span><strong>${numeric(item.official_rank) === null ? "—" : `#${formatInteger(item.official_rank)}`}</strong></div><div><span>${escapeHtml(tr("jurisdictions"))}</span><strong>${formatInteger(runtime.ranking?.total || rankingItems().length)}</strong></div><div><span>${escapeHtml(tr("period"))}</span><strong>${escapeHtml(runtime.period)}</strong></div></div></div></section>`;
  }
  function countryOptions(selected = runtime.country, blank = false) {
    const rows = rankingItems().filter((x) => x.iso3).slice().sort((a,b) => countryName(a).localeCompare(countryName(b), locale()));
    return `${blank ? `<option value="">${escapeHtml(tr("noComparison"))}</option>` : ""}${rows.map((x) => `<option value="${escapeHtml(x.iso3)}" ${x.iso3 === selected ? "selected" : ""}>${escapeHtml(countryName(x))} · ${escapeHtml(x.iso3)}</option>`).join("")}`;
  }
  function periodOptions() { return periodItems().map((x) => `<option value="${escapeHtml(x.observation_label)}" ${String(x.observation_label) === String(runtime.period) ? "selected" : ""}>${escapeHtml(x.observation_label)}</option>`).join(""); }
  function controlBar() { return `<section class="roli-controls"><label class="roli-control-primary"><span>${escapeHtml(tr("country"))}</span><select data-roli-country>${countryOptions()}</select></label><label class="roli-control-primary"><span>${escapeHtml(tr("period"))}</span><select data-roli-period data-roli-year>${periodOptions()}</select></label><div class="roli-context-readout"><span>${escapeHtml(tr("dataStatus"))}</span><strong>${escapeHtml(tr("available"))}</strong></div><div class="roli-control-actions"><button class="roli-button roli-button-secondary" data-roli-action="share">${escapeHtml(tr("share"))}</button><button class="roli-button roli-button-secondary" data-roli-action="provenance">${escapeHtml(tr("provenance"))}</button></div></section>`; }
  function tabs() { return `<div class="roli-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}">${VIEW_KEYS.map((key) => `<button type="button" role="tab" id="roli-tab-${runtime.instance}-${key}" aria-selected="${runtime.view === key}" aria-controls="roli-panel-${runtime.instance}-${key}" tabindex="${runtime.view === key ? 0 : -1}" data-roli-view="${key}">${escapeHtml(tr(key))}</button>`).join("")}</div>`; }
  function sectionHeading(kicker, title, text, extra = "") { return `<header class="roli-section-heading"><div><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(text)}</span></div>${extra}</header>`; }
  function metricCard(label, value, note, derived = false) { return `<article class="roli-metric ${derived ? "is-derived" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note || "")}</small></article>`; }

  function scoreBin(score) { const n = numeric(score); if (n === null) return "na"; return Math.max(0, Math.min(5, Math.floor(n * 6))); }
  function projectPoint(coord) { const lon = Number(coord[0]), lat = Math.max(-85, Math.min(85, Number(coord[1]))); return [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500]; }
  function ringPath(ring) { return ring.map((point, i) => { const [x,y] = projectPoint(point); return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z"; }
  function geometryPath(geometry) { if (!geometry) return ""; if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath).join(" "); if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((p) => p.map(ringPath)).join(" "); return ""; }
  function featureIso(feature) { const p = feature?.properties || {}; return String(p.ISO_A3 || p.iso_a3 || p.ADM0_A3 || p.adm0_a3 || p.ISO3 || p.iso3 || "").toUpperCase(); }
  function mapMarkup() {
    if (!runtime.geo?.features) return `<div class="roli-map-fallback">${escapeHtml(tr("noData"))}</div>`;
    const byIso = new Map(rankingItems().filter((x) => x.iso3).map((x) => [x.iso3, x]));
    const paths = runtime.geo.features.map((feature) => { const iso = featureIso(feature), item = byIso.get(iso), d = geometryPath(feature.geometry); if (!d) return ""; const selected = iso === runtime.country; return `<path class="roli-map-country roli-map-bin-${scoreBin(item?.overall_score)} ${selected ? "is-selected" : ""}" d="${d}" data-roli-map-iso="${escapeHtml(iso)}" data-has-value="${Boolean(item)}" tabindex="-1"><title>${escapeHtml(item ? `${countryName(item)} · ${formatScore(item.overall_score)}` : iso)}</title></path>`; }).join("");
    return `<svg class="roli-map-canvas" viewBox="0 0 1000 500" role="img" aria-label="${escapeHtml(tr("mapTitle"))}">${paths}</svg><div class="roli-map-legend"><span>0</span>${[0,1,2,3,4,5].map((x) => `<i class="roli-map-bin-${x}"></i>`).join("")}<span>1</span></div>`;
  }
  function factorBars() { return `<div class="roli-factor-bars">${(runtime.profile?.factors || []).map((item) => `<button class="roli-factor-bar" data-roli-factor-open="${escapeHtml(item.factor_code)}"><span><b>${escapeHtml(`${item.factor_number}. ${factorName(item)}`)}</b><em>${formatScore(item.score)}</em></span><i><u style="width:${Math.max(0, Math.min(100, (numeric(item.score) || 0) * 100))}%"></u></i></button>`).join("")}</div>`; }
  function overviewPanel() {
    const item = profileEntity(), values = rankingItems().map((x) => x.overall_score), region = item.source_region || item.region_code;
    const regionValues = rankingItems().filter((x) => (x.source_region || x.region_code) === region).map((x) => x.overall_score);
    const series = runtime.series?.items || [], start = series.find((x) => numeric(x.observation_end_year) >= STRICT_SERIES_FROM) || series[0], end = series[series.length-1];
    const position = rankingItems().findIndex((x) => x.iso3 === runtime.country); const neighbors = rankingItems().slice(Math.max(0, position-2), position+3);
    return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-overview" aria-labelledby="roli-tab-${runtime.instance}-overview" data-roli-panel="overview">${sectionHeading(tr("overviewKicker"), tr("overviewHeading"), tr("overviewText"))}<div class="roli-metric-grid">${metricCard(tr("worldMedian"), formatScore(median(values)), "GIR", true)}${metricCard(tr("regionalMedian"), formatScore(median(regionValues)), region || "—", true)}${metricCard(tr("changeSince2015"), formatSigned(numeric(end?.overall_score) - numeric(start?.overall_score)), `${start?.observation_label || "—"} → ${end?.observation_label || "—"}`, true)}${metricCard(tr("remainingGap"), formatScore(1 - (numeric(item.overall_score) || 0)), tr("scoreScale"), true)}</div><div class="roli-overview-grid"><article class="roli-card roli-map-card"><div class="roli-card-title"><div><p>${escapeHtml(tr("mapTitle"))}</p><h3>${escapeHtml(tr("mapText"))}</h3></div></div>${mapMarkup()}</article><article class="roli-card roli-profile-card"><div class="roli-card-title"><div><p>${escapeHtml(tr("factorProfile"))}</p><h3>8 + 44</h3></div></div>${factorBars()}</article></div><article class="roli-card roli-neighbors"><div class="roli-card-title"><div><p>${escapeHtml(tr("neighbors"))}</p><h3>${escapeHtml(runtime.ranking?.ordering_semantics === OFFICIAL_ORDER ? tr("officialOrderNote") : tr("derivedOrderNote"))}</h3></div></div><div class="roli-neighbor-grid">${neighbors.map((x, i) => `<button class="roli-neighbor ${x.iso3 === runtime.country ? "is-selected" : ""}" data-roli-country-pick="${escapeHtml(x.iso3 || "")}">${flagMarkup(x, "roli-flag-inline")}<span><b>${escapeHtml(countryName(x))}</b><small>${numeric(x.official_rank) === null ? `${tr("derivedOrder")} ${position-2+i+1}` : `#${formatInteger(x.official_rank)}`}</small></span><strong>${formatScore(x.overall_score)}</strong></button>`).join("")}</div></article></section>`;
  }

  function compareSelector() { return `<label class="roli-inline-control"><span>${escapeHtml(tr("compareWith"))}</span><select data-roli-compare>${countryOptions(runtime.compareCountry, true)}</select></label>`; }
  function factorCards() { return `<div class="roli-dimension-grid">${factorCatalog().map((catalog) => { const current = factorResult(catalog.factor_code), compare = factorResult(catalog.factor_code, runtime.compareProfile); return `<article class="roli-dimension-card"><div class="roli-dimension-index">${formatInteger(catalog.factor_number)}</div><div><h3>${escapeHtml(factorName(catalog))}</h3><div class="roli-dimension-score"><strong>${formatScore(current.score)}</strong>${runtime.compareProfile ? `<span>${formatScore(compare.score)}</span>` : ""}</div><div class="roli-parity-track"><i style="width:${(numeric(current.score)||0)*100}%"></i>${runtime.compareProfile ? `<u style="left:${(numeric(compare.score)||0)*100}%"></u>` : ""}</div><button class="roli-text-button" data-roli-factor-open="${escapeHtml(catalog.factor_code)}">${escapeHtml(tr("showSubfactors"))} →</button></div></article>`; }).join("")}</div>`; }
  function radarChart() {
    const size=420,c=210,r=150, factors=factorCatalog(); const point=(i,value)=>{const a=-Math.PI/2+i*2*Math.PI/factors.length;return [c+Math.cos(a)*r*value,c+Math.sin(a)*r*value]};
    const polygon=(profile)=>factors.map((f,i)=>point(i,numeric(factorResult(f.factor_code,profile).score)||0).map((v)=>v.toFixed(1)).join(",")).join(" ");
    return `<svg class="roli-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHtml(tr("factorProfile"))}">${[.25,.5,.75,1].map((level)=>`<polygon class="roli-radar-grid" points="${factors.map((_,i)=>point(i,level).join(",")).join(" ")}"></polygon>`).join("")}${factors.map((f,i)=>{const [x,y]=point(i,1.13);return `<line class="roli-radar-grid" x1="${c}" y1="${c}" x2="${point(i,1)[0]}" y2="${point(i,1)[1]}"></line><text x="${x}" y="${y}" text-anchor="middle">${f.factor_number}</text>`}).join("")}<polygon class="roli-radar-primary" points="${polygon(runtime.profile)}"></polygon>${runtime.compareProfile ? `<polygon class="roli-radar-compare" points="${polygon(runtime.compareProfile)}"></polygon>` : ""}</svg>`;
  }
  function factorTable() { return `<div class="roli-table-scroll"><table class="roli-table"><thead><tr><th>${escapeHtml(tr("factors"))}</th><th>${escapeHtml(countryName(profileEntity()))}</th>${runtime.compareProfile ? `<th>${escapeHtml(countryName(runtime.compareProfile.entity))}</th>` : ""}</tr></thead><tbody>${factorCatalog().map((f)=>`<tr><td>${escapeHtml(`${f.factor_number}. ${factorName(f)}`)}</td><td>${formatScore(factorResult(f.factor_code).score)}</td>${runtime.compareProfile ? `<td>${formatScore(factorResult(f.factor_code,runtime.compareProfile).score)}</td>` : ""}</tr>`).join("")}</tbody></table></div>`; }
  function factorsPanel() { return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-factors" aria-labelledby="roli-tab-${runtime.instance}-factors" data-roli-panel="factors">${sectionHeading(tr("factorsKicker"),tr("factorsHeading"),tr("factorsText"),compareSelector())}<div class="roli-factors-layout"><article class="roli-card roli-radar-card">${radarChart()}<details><summary>${escapeHtml(tr("radarAlternative"))}</summary>${factorTable()}</details></article>${factorCards()}</div></section>`; }

  function filteredSubfactors() { return subfactorCatalog().filter((x) => runtime.selectedFactor === "all" || x.factor_code === runtime.selectedFactor); }
  function subfactorPanel() {
    const selected = subfactorByCode(runtime.selectedSubfactor), result = subfactorResult(runtime.selectedSubfactor), factor = factorByCode(selected.factor_code);
    return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-subfactors" aria-labelledby="roli-tab-${runtime.instance}-subfactors" data-roli-panel="subfactors">${sectionHeading(tr("subfactorsKicker"),tr("subfactorsHeading"),tr("subfactorsText"),`<label class="roli-inline-control"><span>${escapeHtml(tr("factors"))}</span><select data-roli-subfactor-filter><option value="all" ${runtime.selectedFactor === "all" ? "selected" : ""}>${escapeHtml(tr("allFactors"))}</option>${factorCatalog().map((x)=>`<option value="${escapeHtml(x.factor_code)}" ${runtime.selectedFactor===x.factor_code?"selected":""}>${escapeHtml(`${x.factor_number}. ${factorName(x)}`)}</option>`).join("")}</select></label>`)}<div class="roli-subfactors-layout"><article class="roli-card"><div class="roli-subfactor-list">${filteredSubfactors().map((x)=>`<button class="roli-subfactor-row ${x.subfactor_code===runtime.selectedSubfactor?"is-selected":""}" data-roli-subfactor-pick="${escapeHtml(x.subfactor_code)}"><span class="roli-subfactor-index">${escapeHtml(x.subfactor_code)}</span><span>${escapeHtml(subfactorName(x))}</span><strong>${formatScore(subfactorResult(x.subfactor_code).score)}</strong></button>`).join("")}</div></article><article class="roli-card roli-subfactor-detail"><div class="roli-card-title"><div><p>${escapeHtml(`${selected.subfactor_code || "—"} · ${factorName(factor)}`)}</p><h3>${escapeHtml(subfactorName(selected))}</h3></div><strong>${formatScore(result.score)}</strong></div><dl class="roli-detail-list"><div><dt>${escapeHtml(tr("sourceHeader"))}</dt><dd>${escapeHtml(selected.source_header || "—")}</dd></div><div><dt>${escapeHtml(tr("sourceSheet"))}</dt><dd>${escapeHtml(result.source_sheet || "—")}</dd></div><div><dt>${escapeHtml(tr("sourceRow"))}</dt><dd>${formatInteger(result.source_row)}</dd></div><div><dt>${escapeHtml(tr("sourceColumn"))}</dt><dd>${escapeHtml(result.provenance_json?.source_column || "—")}</dd></div></dl><button class="roli-button roli-button-secondary" data-roli-subfactor-trend="${escapeHtml(selected.subfactor_code || "")}">${escapeHtml(tr("showTrend"))}</button><p class="roli-provenance-note">${escapeHtml(tr("subfactorOrderWarning"))}</p></article></div></section>`;
  }

  function trendOptions() { return `<option value="overall" ${runtime.trendMetric==="overall"?"selected":""}>${escapeHtml(tr("overallScore"))}</option><optgroup label="${escapeHtml(tr("factors"))}">${factorCatalog().map((x)=>`<option value="factor:${escapeHtml(x.factor_code)}" ${runtime.trendMetric===`factor:${x.factor_code}`?"selected":""}>${escapeHtml(factorName(x))}</option>`).join("")}</optgroup><optgroup label="${escapeHtml(tr("subfactors"))}">${subfactorCatalog().map((x)=>`<option value="subfactor:${escapeHtml(x.subfactor_code)}" ${runtime.trendMetric===`subfactor:${x.subfactor_code}`?"selected":""}>${escapeHtml(`${x.subfactor_code} ${subfactorName(x)}`)}</option>`).join("")}</optgroup>`; }
  function trendData() { const source = runtime.trendMetric === "overall" ? runtime.series : runtime.metricSeries; return (source?.items || []).map((x)=>({...x,value:numeric(runtime.trendMetric === "overall" ? x.overall_score : x.score)})).filter((x)=>x.value!==null); }
  function chartMarkup(items) {
    if (!items.length) return `<div class="roli-chart-empty">${escapeHtml(tr("noSeries"))}</div>`;
    const width=900,height=300,px=52,py=34,min=Math.min(...items.map(x=>x.value)),max=Math.max(...items.map(x=>x.value)),floor=Math.max(0,min-.04),ceil=Math.min(1,max+.04),span=Math.max(.001,ceil-floor);
    const x=(i)=>px+(items.length===1?(width-px*2)/2:i*(width-px*2)/(items.length-1)),y=(v)=>height-py-((v-floor)/span)*(height-py*2);
    const line=items.map((item,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(item.value).toFixed(1)}`).join(" ");
    return `<svg class="roli-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("trend"))}">${[0,.25,.5,.75,1].map((step)=>{const v=floor+span*step,yy=y(v);return `<g class="roli-chart-grid"><line x1="${px}" x2="${width-px}" y1="${yy}" y2="${yy}"></line><text x="3" y="${yy+4}">${formatScore(v,2)}</text></g>`}).join("")}<path class="roli-chart-line" d="${line}"></path>${items.map((item,i)=>`<g class="roli-chart-points"><circle cx="${x(i)}" cy="${y(item.value)}" r="5"><title>${escapeHtml(`${item.observation_label}: ${formatScore(item.value)}`)}</title></circle></g><text x="${x(i)}" y="${height-8}" text-anchor="middle">${escapeHtml(item.observation_label)}</text>`).join("")}</svg>`;
  }
  function trendPanel() { const items=trendData(),first=items[0],last=items[items.length-1],change=first&&last?last.value-first.value:null; return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-trend" aria-labelledby="roli-tab-${runtime.instance}-trend" data-roli-panel="trend">${sectionHeading(tr("trendKicker"),tr("trendHeading"),tr("trendText"),`<label class="roli-inline-control"><span>${escapeHtml(tr("metric"))}</span><select data-roli-trend-metric>${trendOptions()}</select></label>`)}<div class="roli-metric-grid">${metricCard(tr("firstPeriod"),first?.observation_label||"—",formatScore(first?.value))}${metricCard(tr("latestPeriod"),last?.observation_label||"—",formatScore(last?.value))}${metricCard(tr("absoluteChange"),formatSigned(change),`${first?.observation_label||"—"} → ${last?.observation_label||"—"}`,true)}${metricCard(tr("minimum"),formatScore(items.length?Math.min(...items.map(x=>x.value)):null),"")}${metricCard(tr("maximum"),formatScore(items.length?Math.max(...items.map(x=>x.value)):null),"")}</div><article class="roli-card roli-chart-card">${chartMarkup(items)}<div class="roli-table-scroll"><table class="roli-table"><thead><tr><th>${escapeHtml(tr("period"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("strictBoundary"))}</th></tr></thead><tbody>${items.map((x)=>`<tr><td>${escapeHtml(x.observation_label)}</td><td>${formatScore(x.value)}</td><td>${numeric(x.observation_end_year)>=STRICT_SERIES_FROM?"2015+":escapeHtml(tr("pre2015"))}</td></tr>`).join("")}</tbody></table></div></article></section>`; }

  function rankingMetricOptions() { return `<option value="overall" ${runtime.rankingMetric==="overall"?"selected":""}>${escapeHtml(tr("officialOverall"))}</option><optgroup label="${escapeHtml(tr("factorOrder"))}">${factorCatalog().map((x)=>`<option value="factor:${escapeHtml(x.factor_code)}" ${runtime.rankingMetric===`factor:${x.factor_code}`?"selected":""}>${escapeHtml(factorName(x))}</option>`).join("")}</optgroup><optgroup label="${escapeHtml(tr("subfactorOrder"))}">${subfactorCatalog().map((x)=>`<option value="subfactor:${escapeHtml(x.subfactor_code)}" ${runtime.rankingMetric===`subfactor:${x.subfactor_code}`?"selected":""}>${escapeHtml(`${x.subfactor_code} ${subfactorName(x)}`)}</option>`).join("")}</optgroup>`; }
  function filteredRanking() {
    const query=runtime.rankingQuery.trim().toLocaleLowerCase(locale()); return rankingItems(currentRankingPayload()).filter((x)=>{const region=x.source_region||x.region_code||"",income=x.source_income_group||x.income_group_code||""; if(runtime.rankingRegion&&region!==runtime.rankingRegion)return false;if(runtime.rankingIncome&&income!==runtime.rankingIncome)return false;return !query||`${countryName(x)} ${x.iso3||""} ${x.source_iso3||""}`.toLocaleLowerCase(locale()).includes(query);});
  }
  function rankingPanel() {
    const payload=currentRankingPayload(), rows=filteredRanking(), pages=Math.max(1,Math.ceil(rows.length/runtime.rankingPageSize)); runtime.rankingPage=Math.min(runtime.rankingPage,pages); const start=(runtime.rankingPage-1)*runtime.rankingPageSize,pageRows=rows.slice(start,start+runtime.rankingPageSize),derived=payload?.ordering_semantics!==OFFICIAL_ORDER;
    const regions=[...new Set(rankingItems(payload).map(x=>x.source_region||x.region_code).filter(Boolean))].sort(), incomes=[...new Set(rankingItems(payload).map(x=>x.source_income_group||x.income_group_code).filter(Boolean))].sort();
    return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-ranking" aria-labelledby="roli-tab-${runtime.instance}-ranking" data-roli-panel="ranking">${sectionHeading(tr("rankingKicker"),tr("rankingHeading"),tr("rankingText"))}<div class="roli-ranking-filters"><label><span>${escapeHtml(tr("selectedMetric"))}</span><select data-roli-ranking-metric>${rankingMetricOptions()}</select></label><label><span>${escapeHtml(tr("search"))}</span><input type="search" data-roli-ranking-query value="${escapeHtml(runtime.rankingQuery)}" placeholder="${escapeHtml(tr("searchPlaceholder"))}"></label><label><span>${escapeHtml(tr("region"))}</span><select data-roli-ranking-region><option value="">${escapeHtml(tr("allRegions"))}</option>${regions.map(x=>`<option value="${escapeHtml(x)}" ${runtime.rankingRegion===x?"selected":""}>${escapeHtml(x)}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("income"))}</span><select data-roli-ranking-income><option value="">${escapeHtml(tr("allIncome"))}</option>${incomes.map(x=>`<option value="${escapeHtml(x)}" ${runtime.rankingIncome===x?"selected":""}>${escapeHtml(x)}</option>`).join("")}</select></label><label><span>${escapeHtml(tr("pageSize"))}</span><select data-roli-ranking-size>${[10,25,50,100].map(x=>`<option value="${x}" ${runtime.rankingPageSize===x?"selected":""}>${x}</option>`).join("")}</select></label><button class="roli-button roli-button-secondary" data-roli-action="export">${escapeHtml(tr("exportCsv"))}</button></div><article class="roli-card roli-ranking-card"><div class="roli-ranking-summary"><strong>${escapeHtml(tr("resultCount"))}: ${formatInteger(rows.length)}</strong><span class="roli-order-note">${escapeHtml(derived?tr("derivedOrderNote"):tr("officialOrderNote"))}<code>${escapeHtml(payload?.ordering_semantics||DERIVED_OVERALL_ORDER)}</code></span></div><div class="roli-table-scroll"><table class="roli-table roli-ranking-table"><thead><tr><th>${escapeHtml(derived?tr("derivedOrder"):tr("rank"))}</th><th>${escapeHtml(tr("name"))}</th><th>${escapeHtml(tr("score"))}</th><th>${escapeHtml(tr("officialRank"))}</th><th>${escapeHtml(tr("region"))}</th><th>${escapeHtml(tr("income"))}</th></tr></thead><tbody>${pageRows.map((x,i)=>`<tr class="${x.iso3===runtime.country?"is-selected":""}"><td>${derived?formatInteger(x.derived_order||start+i+1):(numeric(x.official_rank)===null?"—":`#${formatInteger(x.official_rank)}`)}</td><td><button class="roli-country-link" data-roli-country-pick="${escapeHtml(x.iso3||"")}">${flagMarkup(x,"roli-flag-inline")}<span>${escapeHtml(countryName(x))}<small>${escapeHtml(x.iso3||x.source_iso3||"")}</small></span></button></td><td>${formatScore(x.selected_metric_score??x.overall_score)}</td><td>${numeric(x.official_rank)===null?"—":`#${formatInteger(x.official_rank)}`}</td><td>${escapeHtml(x.source_region||x.region_code||"—")}</td><td>${escapeHtml(x.source_income_group||x.income_group_code||"—")}</td></tr>`).join("")}</tbody></table></div><div class="roli-pagination"><button class="roli-button roli-button-secondary" data-roli-page="${Math.max(1,runtime.rankingPage-1)}" ${runtime.rankingPage<=1?"disabled":""}>${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${runtime.rankingPage} ${escapeHtml(tr("of"))} ${pages}</span><button class="roli-button roli-button-secondary" data-roli-page="${Math.min(pages,runtime.rankingPage+1)}" ${runtime.rankingPage>=pages?"disabled":""}>${escapeHtml(tr("next"))}</button></div></article></section>`;
  }

  function auditModel() { const a=runtime.audit||{}, release=a.release||currentRelease()||{}, issues=a.issues||a.import_issues||[], checks=a.checks||a.publication_gate?.checks||[]; return { release, issues, checks, ok:a.ok!==false&&!issues.some(x=>String(x.severity||"").toLowerCase()==="error") }; }
  function methodologyPanel() { const model=auditModel(), release=model.release, sources=runtime.metadata?.sources||{}; return `<section class="roli-panel" role="tabpanel" tabindex="0" id="roli-panel-${runtime.instance}-methodology" aria-labelledby="roli-tab-${runtime.instance}-methodology" data-roli-panel="methodology">${sectionHeading(tr("methodologyKicker"),tr("methodologyHeading"),tr("methodologyText"))}<div class="roli-method-grid">${[[tr("principle1"),tr("principle1Text")],[tr("principle2"),tr("principle2Text")],[tr("principle3"),tr("principle3Text")]].map(([title,text],i)=>`<article class="roli-method-card"><span>0${i+1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}</div><div class="roli-method-layout"><article class="roli-card"><div class="roli-card-title"><div><p>${escapeHtml(tr("framework"))}</p><h3>8 + 44</h3></div><span>${escapeHtml(tr("scoreScale"))}</span></div>${factorCatalog().map((f)=>`<details open><summary><b>${escapeHtml(`${f.factor_number}. ${factorName(f)}`)}</b><span>${subfactorCatalog().filter(x=>x.factor_code===f.factor_code).length}</span></summary><ol>${subfactorCatalog().filter(x=>x.factor_code===f.factor_code).map(x=>`<li>${escapeHtml(`${x.subfactor_code} ${subfactorName(x)}`)}</li>`).join("")}</ol></details>`).join("")}<div class="roli-benchmark-note"><h4>${escapeHtml(tr("informalJustice"))}</h4><p>${escapeHtml(tr("informalJusticeText"))}</p></div></article><article class="roli-card roli-audit-card"><div class="roli-card-title"><div><p>${escapeHtml(tr("sourceAudit"))}</p><h3>${escapeHtml(model.ok?tr("auditPassed"):tr("auditFailed"))}</h3></div><span class="${model.ok?"is-passed":"is-review"}">${escapeHtml(tr("publicationGate"))}</span></div><dl class="roli-audit-list"><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(release.publisher||"World Justice Project")}</dd></div><div><dt>${escapeHtml(tr("release"))}</dt><dd>${escapeHtml(release.edition_name||"2025")}</dd></div><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd><code>${escapeHtml(runtime.ranking?.release_id||"—")}</code></dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("rawSnapshot"))}</dt><dd><code>${escapeHtml(release.raw_snapshot_sha256||"—")}</code></dd></div><div><dt>${escapeHtml(tr("rankSnapshot"))}</dt><dd><code>${escapeHtml(release.rank_companion_sha256||"—")}</code></dd></div><div><dt>${escapeHtml(tr("snapshotCheck"))}</dt><dd>${escapeHtml(model.ok?tr("auditPassed"):tr("auditFailed"))}</dd></div><div><dt>${escapeHtml(tr("transformId"))}</dt><dd><code>${escapeHtml(release.transform_id||"—")}</code></dd></div><div><dt>${escapeHtml(tr("importerVersion"))}</dt><dd>${escapeHtml(release.importer_version||"—")}</dd></div></dl><div class="roli-source-links">${externalLink(release.index_page_url||sources.index,tr("officialSource"))}${externalLink(release.data_page_url||sources.data_page,tr("dataPage"))}${externalLink(release.methodology_url||sources.methodology,tr("methodologyLink"))}</div>${model.issues.length?`<details><summary>${escapeHtml(tr("validationIssues"))} · ${model.issues.length}</summary><ul>${model.issues.slice(0,30).map(x=>`<li>${escapeHtml(`${x.code||x.severity}: ${x.message||""}`)}</li>`).join("")}</ul></details>`:""}</article></div></section>`; }

  function activePanel() { if(runtime.view==="factors")return factorsPanel();if(runtime.view==="subfactors")return subfactorPanel();if(runtime.view==="trend")return trendPanel();if(runtime.view==="ranking")return rankingPanel();if(runtime.view==="methodology")return methodologyPanel();return overviewPanel(); }
  function inactivePanels() { return VIEW_KEYS.filter(x=>x!==runtime.view).map(x=>`<section class="roli-panel" role="tabpanel" id="roli-panel-${runtime.instance}-${x}" aria-labelledby="roli-tab-${runtime.instance}-${x}" data-roli-panel="${x}" hidden></section>`).join(""); }
  function renderAvailable() { if(!runtime.root)return; runtime.root.innerHTML=`<section class="roli-workspace" data-roli-state="available">${hero()}${controlBar()}${tabs()}<div class="roli-view-stage">${activePanel()}${inactivePanels()}</div><div class="roli-sr-only" aria-live="polite" data-roli-live>${escapeHtml(`${countryName(profileEntity())}, ${runtime.period}`)}</div></section>`; bindEvents(); }

  function provenanceHtml() { const item=profileEntity(),release=currentRelease(),factor=factorResult(runtime.selectedFactor),sub=subfactorResult(runtime.selectedSubfactor); const rows=[[tr("country"),countryName(item)],["ISO3",item.iso3||item.source_iso3],[tr("exactPeriod"),runtime.period],[tr("officialScore"),formatScore(item.overall_score)],[tr("officialRank"),numeric(item.official_rank)===null?"—":`#${formatInteger(item.official_rank)}`],[tr("officialRankSource"),item.official_rank_source||"—"],[tr("sourceSheet"),item.result_source_sheet||item.source_sheet||"—"],[tr("sourceRow"),item.result_source_row||item.source_row||"—"],[tr("releaseId"),runtime.ranking?.release_id||"—"],[tr("rawSnapshot"),release.raw_snapshot_sha256||"—"],[tr("transformId"),release.transform_id||"—"],[tr("selectedMetricLabel"),`${factorName(factorByCode(runtime.selectedFactor))} / ${subfactorName(subfactorByCode(runtime.selectedSubfactor))}`],[tr("sourceCell"),`${sub.source_sheet||"—"} · ${sub.source_row||"—"}`]]; return `<dialog class="roli-dialog" data-roli-dialog><div class="roli-dialog-head"><div><p>${escapeHtml(tr("provenance"))}</p><h2>${escapeHtml(countryName(item))}</h2></div><button class="roli-button roli-button-secondary" data-roli-action="close-dialog">${escapeHtml(tr("close"))}</button></div><dl class="roli-provenance">${rows.map(([a,b])=>`<div><dt>${escapeHtml(a)}</dt><dd>${escapeHtml(b??"—")}</dd></div>`).join("")}</dl><p class="roli-provenance-note">${escapeHtml(runtime.ranking?.ordering_semantics===OFFICIAL_ORDER?tr("officialOrderNote"):tr("derivedOrderNote"))}</p></dialog>`; }
  function openProvenance() { if(typeof runtime.context.openDrawer==="function") runtime.context.openDrawer({title:tr("provenance"),html:provenanceHtml().replace(/^<dialog[^>]*>|<\/dialog>$/g,"")}); else {const holder=document.createElement("div");holder.innerHTML=provenanceHtml();const dialog=holder.firstElementChild;document.body.appendChild(dialog);dialog.addEventListener("close",()=>dialog.remove(),{once:true});dialog.querySelector('[data-roli-action="close-dialog"]')?.addEventListener("click",()=>dialog.close());dialog.showModal();} }
  async function shareProfile() { try { await navigator.clipboard.writeText(window.location.href); notify(tr("copied")); } catch (_) { notify(window.location.href); } }
  function csvCell(value) { const text=String(value??""); return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text; }
  function exportRanking() { const payload=currentRankingPayload(),items=filteredRanking(),headers=["period","official_rank","derived_order","iso3","jurisdiction","overall_score","selected_metric_score","region","income_group","release_id","ordering_semantics"],rows=items.map(x=>[runtime.period,x.official_rank,x.derived_order,x.iso3||x.source_iso3,countryName(x),x.overall_score,x.selected_metric_score,x.source_region||x.region_code,x.source_income_group||x.income_group_code,payload?.release_id,payload?.ordering_semantics]);const blob=new Blob([[headers,...rows].map(r=>r.map(csvCell).join(",")).join("\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`${tr("downloadName")}-${runtime.period}.csv`;a.click();URL.revokeObjectURL(url); }

  async function setView(view,{focusTab=false,focusPanel=false}={}) { if(!VIEW_KEYS.includes(view))return;runtime.view=view;updateDeepLink();renderAvailable();if(focusTab)runtime.root.querySelector(`[data-roli-view="${view}"]`)?.focus();if(focusPanel)runtime.root.querySelector(`[data-roli-panel="${view}"]`)?.focus(); }
  function rerenderStage({focusSelector="",cursor=null}={}) { renderAvailable();if(focusSelector){const el=runtime.root.querySelector(focusSelector);el?.focus();if(cursor!==null&&el?.setSelectionRange)el.setSelectionRange(cursor,cursor);}updateDeepLink(); }
  function handleTabKeydown(event) { const tabs=[...runtime.root.querySelectorAll("[data-roli-view]")],i=tabs.indexOf(event.currentTarget);let next=null;if(event.key==="ArrowRight")next=(i+1)%tabs.length;if(event.key==="ArrowLeft")next=(i-1+tabs.length)%tabs.length;if(event.key==="Home")next=0;if(event.key==="End")next=tabs.length-1;if(next!==null){event.preventDefault();setView(tabs[next].dataset.roliView,{focusTab:true});} }
  async function changeCountry(value) { runtime.country=String(value||"").toUpperCase();await reloadProfile(); }
  async function changePeriod(value) { runtime.period=String(value||"");runtime.metricRanking=null;runtime.metricSeries=null;await loadWorkspace(); }

  function bindEvents() {
    if(!runtime.root)return;
    runtime.root.querySelectorAll("[data-roli-view]").forEach((b)=>{b.onclick=()=>setView(b.dataset.roliView);b.onkeydown=handleTabKeydown;});
    runtime.root.querySelector("[data-roli-country]")?.addEventListener("change",(e)=>changeCountry(e.target.value));
    runtime.root.querySelector("[data-roli-period]")?.addEventListener("change",(e)=>changePeriod(e.target.value));
    runtime.root.querySelectorAll("[data-roli-country-pick]").forEach((b)=>b.addEventListener("click",()=>b.dataset.roliCountryPick&&changeCountry(b.dataset.roliCountryPick)));
    runtime.root.querySelectorAll("[data-roli-map-iso]").forEach((p)=>p.addEventListener("click",()=>p.dataset.hasValue==="true"&&changeCountry(p.dataset.roliMapIso)));
    runtime.root.querySelector("[data-roli-compare]")?.addEventListener("change",async(e)=>{runtime.compareCountry=e.target.value;runtime.compareProfile=runtime.compareCountry?await fetchJson(`${API}/country/${encodeURIComponent(runtime.compareCountry)}`,{params:{period:runtime.period,release_id:runtime.ranking.release_id}}).catch(()=>null):null;rerenderStage();});
    runtime.root.querySelectorAll("[data-roli-factor-open]").forEach((b)=>b.addEventListener("click",()=>{runtime.selectedFactor=b.dataset.roliFactorOpen;runtime.selectedSubfactor=subfactorCatalog().find(x=>x.factor_code===runtime.selectedFactor)?.subfactor_code||runtime.selectedSubfactor;setView("subfactors",{focusPanel:true});}));
    runtime.root.querySelector("[data-roli-subfactor-filter]")?.addEventListener("change",(e)=>{runtime.selectedFactor=e.target.value;runtime.selectedSubfactor=filteredSubfactors()[0]?.subfactor_code||runtime.selectedSubfactor;rerenderStage({focusSelector:"[data-roli-subfactor-filter]"});});
    runtime.root.querySelectorAll("[data-roli-subfactor-pick]").forEach((b)=>b.addEventListener("click",()=>{runtime.selectedSubfactor=b.dataset.roliSubfactorPick;runtime.selectedFactor=subfactorByCode(runtime.selectedSubfactor).factor_code||runtime.selectedFactor;rerenderStage({focusSelector:`[data-roli-subfactor-pick="${runtime.selectedSubfactor}"]`});}));
    runtime.root.querySelector("[data-roli-subfactor-trend]")?.addEventListener("click",async(e)=>{runtime.trendMetric=`subfactor:${e.currentTarget.dataset.roliSubfactorTrend}`;await loadMetricSeries(runtime.trendMetric);setView("trend",{focusPanel:true});});
    runtime.root.querySelector("[data-roli-trend-metric]")?.addEventListener("change",async(e)=>{runtime.trendMetric=e.target.value;await loadMetricSeries(runtime.trendMetric);rerenderStage({focusSelector:"[data-roli-trend-metric]"});});
    runtime.root.querySelector("[data-roli-ranking-metric]")?.addEventListener("change",async(e)=>{runtime.rankingMetric=e.target.value;runtime.rankingPage=1;await loadMetricRanking(runtime.rankingMetric);rerenderStage({focusSelector:"[data-roli-ranking-metric]"});});
    runtime.root.querySelector("[data-roli-ranking-query]")?.addEventListener("input",(e)=>{runtime.rankingQuery=e.target.value;runtime.rankingPage=1;rerenderStage({focusSelector:"[data-roli-ranking-query]",cursor:e.target.selectionStart});});
    runtime.root.querySelector("[data-roli-ranking-region]")?.addEventListener("change",(e)=>{runtime.rankingRegion=e.target.value;runtime.rankingPage=1;rerenderStage();});
    runtime.root.querySelector("[data-roli-ranking-income]")?.addEventListener("change",(e)=>{runtime.rankingIncome=e.target.value;runtime.rankingPage=1;rerenderStage();});
    runtime.root.querySelector("[data-roli-ranking-size]")?.addEventListener("change",(e)=>{runtime.rankingPageSize=Number(e.target.value);runtime.rankingPage=1;rerenderStage();});
    runtime.root.querySelectorAll("[data-roli-page]").forEach((b)=>b.addEventListener("click",()=>{runtime.rankingPage=Number(b.dataset.roliPage);rerenderStage();}));
    runtime.root.querySelectorAll("[data-roli-action]").forEach((b)=>b.addEventListener("click",()=>{const a=b.dataset.roliAction;if(a==="retry")loadWorkspace();if(a==="share")shareProfile();if(a==="provenance")openProvenance();if(a==="export")exportRanking();if(a==="close-dialog")b.closest("dialog")?.close();}));
  }

  function render(context={}) {
    runtime.context=context;runtime.root=context.root||document.querySelector("#view");runtime.lang=context.lang==="en"?"en":"ru";runtime.theme=context.theme||document.documentElement.dataset.theme||"dark";runtime.instance+=1;
    const link=deepLink();runtime.view=VIEW_KEYS.includes(link.view)?link.view:runtime.view;runtime.country=String(link.country||context.country||"").toUpperCase();if(!runtime.country)return runtime;runtime.period=String(link.period||context.year||runtime.period);runtime.selectedFactor=link.factor||runtime.selectedFactor;runtime.selectedSubfactor=link.subfactor||runtime.selectedSubfactor;runtime.trendMetric=link.trendMetric||runtime.trendMetric;runtime.rankingMetric=link.rankingMetric||runtime.rankingMetric;runtime.compareCountry=link.compare||runtime.compareCountry;
    if(!runtime.root)throw new Error("ROLI root element is missing");loadWorkspace();return runtime;
  }
  function invalidate({hard=false}={}) { runtime.abortController?.abort();runtime.detailController?.abort();if(hard){metadataCache.clear();geoCache.value=null;geoCache.promise=null;} }

  window.GIRRuleOfLaw = Object.freeze({ render, invalidate, version: MODULE_VERSION, officialOrder: OFFICIAL_ORDER, derivedOverallOrder: DERIVED_OVERALL_ORDER, derivedFactorOrder: DERIVED_FACTOR_ORDER, derivedSubfactorOrder: DERIVED_SUBFACTOR_ORDER, scoreBands: "derived_gir_score_bands_not_official_wjp_categories", comparability: { strictFrom: "2015+", pre_2015_caution: true }, framework: "8 + 44", sources: ["General Population Poll", "Qualified Respondents Questionnaires"] });
})();
