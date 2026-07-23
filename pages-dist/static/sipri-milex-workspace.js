/* GIR — SIPRI Military Expenditure analytical workspace, cumulative stage 08.
 * Evidence-first, licence-aware and dependency-free. The module ships no SIPRI
 * country-level values. Metadata and release-level facts remain visible while
 * country analytics activate only after an authorized local import.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)sipri-milex-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const API_BASE = "/api/security-connectivity/sipri-milex";
  const META_URL = new URL("sipri-milex/sipri_milex_frontend_meta.json", STATIC_BASE).href;
  const GEO_URL = new URL("goci/goci-world-geo.json", STATIC_BASE).href;
  const TOKEN_KEY = "gir-sipri-milex-session-token";
  const LATEST_YEAR = 2025;
  const DEFAULT_SERIES = "constant_usd_millions";
  const RANK_LIMIT = 500;

  const COPY = {
    ru: {
      module: "Безопасность и международная связанность",
      title: "Военные расходы SIPRI",
      acronym: "SIPRI MILEX",
      lead: "Глобальная обсерватория военных расходов с длинными временными рядами, контролем неопределённости и лицензионно безопасным контуром доступа.",
      release: "Выпуск 2026 · данные по 2025 год",
      source: "Stockholm International Peace Research Institute",
      officialDatabase: "Официальная база",
      methodology: "Методология",
      terms: "Условия использования",
      doi: "DOI",
      globalPulse: "Глобальный пульс 2025",
      globalPulseText: "Публичные агрегаты выпуска. Страновой массив не включён в патч и появляется только после авторизованного локального импорта.",
      total: "Мировые расходы",
      realChange: "Реальное изменение",
      burden: "Доля мирового ВВП",
      perCapita: "На человека",
      usdTrillion: "трлн долл.",
      percent: "%",
      usd: "долл.",
      evidenceFirst: "Evidence-first",
      evidenceText: "Значение, стиль ячейки, лист, адрес ячейки, хеш строки и источник сохраняются вместе.",
      inputNotCapability: "Ресурс, а не мощь",
      inputNotCapabilityText: "Военные расходы отражают объём ресурсов, но не являются прямой мерой боеспособности или безопасности.",
      longSeries: "1949–2025",
      longSeriesText: "Непрерывно пересматриваемые исторические ряды; актуальный выпуск заменяет предыдущие редакции.",
      baseYear: "Постоянные цены 2024",
      baseYearText: "Для трендов используются постоянные доллары; текущие доллары предназначены для оценки размера в конкретном году.",
      dataVault: "Контур данных",
      dataVaultTitle: "Авторизованный локальный импорт",
      dataVaultText: "Frontend не загружает и не публикует страновой массив сам. Оператор принимает условия SIPRI, фиксирует основание использования и импортирует официальный workbook в локальный SQLite.",
      accessStep1: "Получить официальный workbook", accessStep1Text: "Скачать текущую редакцию непосредственно с сайта SIPRI после ознакомления с условиями.",
      accessStep2: "Проверить целостность", accessStep2Text: "Зафиксировать SHA-256 файла и убедиться, что структура и последний год соответствуют выпуску.",
      accessStep3: "Зафиксировать основание", accessStep3Text: "Записать аттестацию оператора: внутреннее исследование, лицензия или письменное разрешение.",
      accessStep4: "Подключить интерфейс", accessStep4Text: "Импортировать workbook в локальный SQLite; GIR автоматически откроет аналитику согласно разрешённой аудитории.",
      metadataReady: "Метаданные готовы",
      awaitingImport: "Ожидается импорт workbook",
      importedPrivate: "Импортирован · частный API",
      importedPublic: "Импортирован · разрешённый публичный API",
      staticMode: "Статический metadata-only режим",
      connection: "Подключение",
      connected: "Данные подключены",
      tokenRequired: "Требуется сессионный токен",
      tokenLabel: "X-GIR-SIPRI-Token",
      tokenPlaceholder: "Введите токен частного API",
      connect: "Подключить",
      disconnect: "Очистить токен",
      tokenNote: "Токен хранится только в sessionStorage этой вкладки и не записывается в базу или URL.",
      importGuide: "Инструкция импорта",
      copyCommand: "Копировать команду",
      copied: "Скопировано",
      accessPolicy: "Политика доступа",
      noDataset: "Страновые значения в ZIP отсутствуют",
      noWorkbook: "Официальный XLSX в ZIP отсутствует",
      publicNeedsPermission: "Публичный API и CSV требуют лицензии или письменного разрешения",
      releaseIntegrity: "Целостность выпуска",
      revision: "Пересмотрено",
      workbook: "Workbook",
      coverage: "Покрытие",
      values: "значений",
      countries: "стран",
      series: "рядов",
      liveWorkspace: "Аналитическое пространство",
      liveWorkspaceText: "После подключения доступны профиль страны, карта, длинный ряд, сравнение и доказательный рейтинг.",
      selectedCountry: "Выбранная страна",
      year: "Год",
      metric: "Показатель",
      value: "Значение",
      rank: "Место",
      percentile: "Процентиль",
      change1y: "1 год",
      change10y: "10 лет",
      quality: "Качество",
      reported: "Опубликовано / без отметки",
      estimate: "Оценка SIPRI",
      uncertain: "Повышенная неопределённость",
      unresolved: "Цвет ячейки не распознан",
      currentUsd: "Текущие доллары США",
      constantUsd: "Постоянные доллары США 2024",
      shareGdp: "Доля ВВП",
      perCapitaMetric: "На душу населения",
      governmentShare: "Доля госрасходов",
      localCalendar: "Национальная валюта · календарный год",
      localFinancial: "Национальная валюта · финансовый год",
      regionalTotals: "Региональные итоги",
      countryProfile: "Профиль страны",
      profileText: "Пять основных измерений за выбранный год. Официальные значения сохраняются без синтетического композита.",
      trend: "Динамика",
      trendText: "Для реальной динамики выбирайте ряд в постоянных долларах. Ретроспективные значения могут пересматриваться в новых выпусках.",
      allYears: "Весь ряд",
      years25: "25 лет",
      years10: "10 лет",
      map: "География расходов",
      mapText: "Цвет показывает выбранный официальный ряд. Точное значение и статус качества доступны в подсказке и таблице.",
      low: "Ниже",
      high: "Выше",
      noData: "Нет данных",
      mapKeyboard: "Стрелки перемещают фокус; Enter или пробел выбирают страну; Escape закрывает подсказку.",
      comparison: "Сравнительная лаборатория",
      comparisonText: "Сравнивайте до пяти стран в одном официальном ряду. Близкие значения следует читать вместе со страновыми примечаниями SIPRI.",
      addCountry: "Добавить страну",
      add: "Добавить",
      reset: "Сбросить",
      remove: "Удалить",
      ranking: "Рейтинг стран",
      rankingText: "Места — прозрачная производная GIR по официальным значениям; одинаковые значения получают одинаковое competition rank.",
      search: "Поиск страны или ISO3",
      sort: "Сортировка",
      byRank: "По месту",
      byValue: "По значению",
      byCountry: "По стране",
      byChange1y: "По изменению за год",
      byChange10y: "По изменению за 10 лет",
      ascending: "По возрастанию",
      descending: "По убыванию",
      includeEstimates: "Показывать оценки SIPRI",
      includeUncertain: "Показывать неопределённые значения",
      rows: "Строк",
      page: "Страница",
      of: "из",
      previous: "Назад",
      next: "Вперёд",
      exportCsv: "Экспорт CSV",
      exportBlocked: "CSV отключён текущим разрешением",
      evidence: "Доказательная запись",
      zeroResults: "По выбранным условиям ничего не найдено.",
      analyticBlueprint: "Архитектура после импорта",
      blueprintText: "Все панели уже готовы к работе с API, но не имитируют отсутствующие значения.",
      lockedProfile: "Профиль страны",
      lockedTrend: "Временной ряд",
      lockedMap: "Карта и распределение",
      lockedRanking: "Рейтинг и provenance",
      activateByImport: "Активируется после авторизованного импорта",
      seriesArchitecture: "Архитектура показателей",
      seriesArchitectureText: "Восемь официальных представлений покрывают размер расходов, реальную динамику и нагрузку на экономику и бюджет.",
      interpretation: "Как читать данные",
      constantForTrend: "Постоянные доллары — для динамики",
      constantForTrendText: "Они уменьшают влияние инфляции и подходят для сравнения ресурсов во времени.",
      currentForSize: "Текущие доллары — для масштаба года",
      currentForSizeText: "Они зависят от рыночных обменных курсов и не должны автоматически трактоваться как покупательная способность.",
      burdenIsApprox: "Доля ВВП — приблизительная нагрузка",
      burdenIsApproxText: "Это доля национальных ресурсов, направленных на военную сферу, а не оценка эффективности расходов.",
      notesMatter: "Примечания обязательны",
      notesMatterText: "Для близких страновых значений SIPRI рекомендует учитывать определения, охват и специальные примечания.",
      qualityLegend: "Сигналы качества workbook",
      qualityLegendText: "Синий шрифт в официальном Excel означает оценку SIPRI, красный — повышенную неопределённость.",
      provenance: "Происхождение данных",
      close: "Закрыть",
      sourceSheet: "Лист Excel",
      sourceCell: "Ячейка",
      sourceRow: "Строка",
      valueText: "Исходное значение",
      rowHash: "SHA-256 строки",
      workbookHash: "SHA-256 workbook",
      snapshot: "Snapshot ID",
      transformation: "Transformation run",
      formula: "Версия формулы",
      scoreStatus: "Статус значения",
      rankStatus: "Статус места",
      scoreOfficial: "официальное значение SIPRI workbook",
      rankDerived: "производное standard-competition rank GIR",
      loading: "Загрузка SIPRI MILEX",
      loadingText: "Проверяются выпуск, восемь рядов, режим доступа и доказательные метаданные.",
      loadError: "Не удалось открыть пространство SIPRI MILEX",
      retry: "Повторить",
      unauthorized: "Сессионный токен не принят или отсутствует.",
      forbidden: "Текущее основание использования не разрешает выдачу числовых данных.",
      notImported: "Официальный workbook ещё не импортирован.",
      networkError: "Backend недоступен; показан безопасный metadata-only режим.",
      textAlternative: "Текстовая альтернатива",
      latest: "Последнее значение",
      period: "Период",
      sourceMode: "Режим данных",
      liveApi: "FastAPI + авторизованный SQLite",
      metadataOnly: "проверенный metadata-only bundle",
      attribution: "Information from the Stockholm International Peace Research Institute (SIPRI) Military Expenditure Database",
      frontendVersion: "Интерфейс stage 08",
      validationTitle: "Лабораторная проверка интерфейса",
      validationText: "Числовые панели ниже подключены к локальному архивному workbook 1949–2022 только для браузерного тестирования. Этот файл и его страновые значения не входят в production-патч.",
    },
    en: {
      module: "Security & international connectivity",
      title: "SIPRI Military Expenditure",
      acronym: "SIPRI MILEX",
      lead: "A global military-expenditure observatory with long time series, uncertainty controls and a licence-safe data-access boundary.",
      release: "2026 release · data through 2025",
      source: "Stockholm International Peace Research Institute",
      officialDatabase: "Official database", methodology: "Methodology", terms: "Terms of use", doi: "DOI",
      globalPulse: "Global pulse 2025", globalPulseText: "Public release-level aggregates. The country dataset is not bundled and appears only after an authorized local import.",
      total: "World expenditure", realChange: "Real change", burden: "Share of world GDP", perCapita: "Per person",
      usdTrillion: "USD tn", percent: "%", usd: "USD",
      evidenceFirst: "Evidence-first", evidenceText: "Value, cell style, worksheet, cell address, row hash and source stay together.",
      inputNotCapability: "Resources, not capability", inputNotCapabilityText: "Military expenditure measures resource input; it is not a direct measure of capability or security.",
      longSeries: "1949–2025", longSeriesText: "Continuously revised historical series; the current release replaces earlier editions.",
      baseYear: "Constant 2024 prices", baseYearText: "Constant dollars are used for trends; current dollars describe scale in a specific year.",
      dataVault: "Data boundary", dataVaultTitle: "Authorized local import", dataVaultText: "The frontend never downloads or republishes the country dataset by itself. An operator accepts SIPRI terms, records a permission basis and imports the official workbook into local SQLite.",
      accessStep1: "Obtain the official workbook", accessStep1Text: "Download the current edition directly from SIPRI after reviewing the applicable terms.",
      accessStep2: "Verify integrity", accessStep2Text: "Pin the file SHA-256 and verify that its structure and latest year match the release.",
      accessStep3: "Record the permission basis", accessStep3Text: "Store an operator attestation for internal research, a licence or written permission.",
      accessStep4: "Connect the workspace", accessStep4Text: "Import the workbook into local SQLite; GIR unlocks analytics for the authorized audience automatically.",
      metadataReady: "Metadata ready", awaitingImport: "Awaiting workbook import", importedPrivate: "Imported · private API", importedPublic: "Imported · authorized public API", staticMode: "Static metadata-only mode",
      connection: "Connection", connected: "Data connected", tokenRequired: "Session token required", tokenLabel: "X-GIR-SIPRI-Token", tokenPlaceholder: "Enter private API token", connect: "Connect", disconnect: "Clear token", tokenNote: "The token is stored in this tab's sessionStorage only and is never written to the database or URL.",
      importGuide: "Import guide", copyCommand: "Copy command", copied: "Copied", accessPolicy: "Access policy", noDataset: "No country values in the ZIP", noWorkbook: "No official XLSX in the ZIP", publicNeedsPermission: "Public API and CSV require a licence or written permission",
      releaseIntegrity: "Release integrity", revision: "Revised", workbook: "Workbook", coverage: "Coverage", values: "values", countries: "countries", series: "series",
      liveWorkspace: "Analytical workspace", liveWorkspaceText: "Once connected, country profile, map, long series, comparison and evidence ranking become available.",
      selectedCountry: "Selected country", year: "Year", metric: "Metric", value: "Value", rank: "Rank", percentile: "Percentile", change1y: "1 year", change10y: "10 years", quality: "Quality",
      reported: "Reported / unmarked", estimate: "SIPRI estimate", uncertain: "Heightened uncertainty", unresolved: "Cell colour unresolved",
      currentUsd: "Current US dollars", constantUsd: "Constant 2024 US dollars", shareGdp: "Share of GDP", perCapitaMetric: "Per capita", governmentShare: "Share of government spending", localCalendar: "Local currency · calendar year", localFinancial: "Local currency · financial year", regionalTotals: "Regional totals",
      countryProfile: "Country profile", profileText: "Five core views for the selected year. Official values remain separate; no synthetic composite is created.",
      trend: "Trend", trendText: "Use constant-dollar series for real trends. Historical values may be revised in subsequent editions.", allYears: "All years", years25: "25 years", years10: "10 years",
      map: "Geography of expenditure", mapText: "Colour encodes the selected official series. Exact values and quality status are available in the tooltip and table.", low: "Lower", high: "Higher", noData: "No data", mapKeyboard: "Arrow keys move focus; Enter or Space selects a country; Escape closes the tooltip.",
      comparison: "Comparison lab", comparisonText: "Compare up to five countries in one official series. Read close cross-country values together with SIPRI country notes.", addCountry: "Add country", add: "Add", reset: "Reset", remove: "Remove",
      ranking: "Country ranking", rankingText: "Ranks are a transparent GIR derivative from official values; equal values receive equal competition rank.", search: "Search country or ISO3", sort: "Sort", byRank: "By rank", byValue: "By value", byCountry: "By country", byChange1y: "By 1-year change", byChange10y: "By 10-year change", ascending: "Ascending", descending: "Descending", includeEstimates: "Include SIPRI estimates", includeUncertain: "Include uncertain values", rows: "Rows", page: "Page", of: "of", previous: "Previous", next: "Next", exportCsv: "Export CSV", exportBlocked: "CSV disabled by current permission", evidence: "Evidence record", zeroResults: "Nothing matches the selected conditions.",
      analyticBlueprint: "Post-import architecture", blueprintText: "Every panel is wired to the API but never fabricates missing values.", lockedProfile: "Country profile", lockedTrend: "Time series", lockedMap: "Map and distribution", lockedRanking: "Ranking and provenance", activateByImport: "Activates after authorized import",
      seriesArchitecture: "Series architecture", seriesArchitectureText: "Eight official views cover expenditure scale, real trends and economic and budget burden.",
      interpretation: "How to read the data", constantForTrend: "Constant dollars for trends", constantForTrendText: "They reduce inflation effects and support comparisons of resource volume over time.", currentForSize: "Current dollars for annual scale", currentForSizeText: "They depend on market exchange rates and should not be treated automatically as purchasing power.", burdenIsApprox: "GDP share is an approximate burden", burdenIsApproxText: "It indicates the share of national resources devoted to the military, not spending effectiveness.", notesMatter: "Country notes matter", notesMatterText: "For close country comparisons SIPRI recommends checking definitions, coverage and special notes.",
      qualityLegend: "Workbook quality signals", qualityLegendText: "Blue text in the official Excel marks a SIPRI estimate; red marks heightened uncertainty.",
      provenance: "Data provenance", close: "Close", sourceSheet: "Excel sheet", sourceCell: "Cell", sourceRow: "Row", valueText: "Source value", rowHash: "Row SHA-256", workbookHash: "Workbook SHA-256", snapshot: "Snapshot ID", transformation: "Transformation run", formula: "Formula version", scoreStatus: "Value status", rankStatus: "Rank status", scoreOfficial: "official SIPRI workbook value", rankDerived: "GIR-derived standard-competition rank",
      loading: "Loading SIPRI MILEX", loadingText: "Checking release, eight series, access mode and evidence metadata.", loadError: "Unable to open SIPRI MILEX workspace", retry: "Retry", unauthorized: "The session token is missing or was rejected.", forbidden: "The current permission basis does not allow numeric API access.", notImported: "The official workbook has not been imported yet.", networkError: "Backend unavailable; showing the safe metadata-only mode.",
      textAlternative: "Text alternative", latest: "Latest value", period: "Period", sourceMode: "Data mode", liveApi: "FastAPI + authorized SQLite", metadataOnly: "verified metadata-only bundle",
      attribution: "Information from the Stockholm International Peace Research Institute (SIPRI) Military Expenditure Database", frontendVersion: "Stage 08 interface",
      validationTitle: "Interface validation laboratory",
      validationText: "The numeric panels below are connected to a local archival 1949–2022 workbook solely for browser testing. Neither that file nor its country values are included in the production patch.",
    },
  };

  const S = {
    context: null,
    meta: null,
    geo: null,
    mode: "loading",
    accessError: null,
    token: "",
    selectedIso: "",
    selectedSeries: DEFAULT_SERIES,
    selectedYear: LATEST_YEAR,
    ranking: [],
    profile: null,
    trend: null,
    compare: [],
    compareTrends: new Map(),
    query: "",
    sort: "rank",
    direction: "asc",
    page: 0,
    pageSize: 25,
    includeEstimates: true,
    includeUncertain: true,
    trendWindow: "all",
    renderToken: 0,
    loadKey: "",
    busy: false,
  };

  const tr = (key) => (COPY[S.context?.lang === "en" ? "en" : "ru"][key] ?? key);
  const esc = (value) => {
    if (S.context?.escapeHtml) return S.context.escapeHtml(String(value ?? ""));
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  const num = (value) => finite(value) ? Number(value) : null;
  const intFmt = (value) => new Intl.NumberFormat(S.context?.lang === "en" ? "en-US" : "ru-RU", {maximumFractionDigits: 0}).format(Number(value || 0));
  const decimalFmt = (value, digits = 1) => finite(value) ? new Intl.NumberFormat(S.context?.lang === "en" ? "en-US" : "ru-RU", {minimumFractionDigits: 0, maximumFractionDigits: digits}).format(Number(value)) : "—";
  const signed = (value, digits = 1) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${decimalFmt(value, digits)}%` : "—";
  const lang = () => S.context?.lang === "en" ? "en" : "ru";

  function seriesList() { return S.meta?.series?.series || []; }
  function seriesByCode(code = S.selectedSeries) { return seriesList().find((item) => item.series_code === code) || seriesList()[0] || null; }
  function seriesName(item) {
    if (!item) return "";
    if (item.series_code === "constant_usd_millions" || item.series_code === "regional_totals_constant_usd_millions") return shortSeriesName(item.series_code);
    return lang() === "ru" ? item.name_ru : item.name_en;
  }
  function shortSeriesName(code) {
    if (code === "constant_usd_millions" || code === "regional_totals_constant_usd_millions") {
      const base = release().constant_usd_base_year || S.meta?.overview?.constant_usd_base_year || 2024;
      if (code === "regional_totals_constant_usd_millions") {
        return lang() === "ru" ? `Региональные итоги · постоянные доллары США ${base}` : `Regional totals · constant ${base} US dollars`;
      }
      return lang() === "ru" ? `Постоянные доллары США ${base}` : `Constant ${base} US dollars`;
    }
    const keys = {
      current_usd_millions: "currentUsd", share_gdp_percent: "shareGdp",
      per_capita_usd: "perCapitaMetric", share_government_spending_percent: "governmentShare",
      local_currency_calendar: "localCalendar", local_currency_financial_year: "localFinancial",
    };
    return tr(keys[code] || "metric");
  }
  function release() { return S.meta?.overview?.release || S.meta?.releases?.releases?.[0] || {}; }
  function baseYearTitle() {
    const base = release().constant_usd_base_year || S.meta?.overview?.constant_usd_base_year || 2024;
    return lang() === "ru" ? `Постоянные цены ${base}` : `Constant ${base} prices`;
  }
  function releaseSummary() {
    return S.meta?.release_summary || release()?.metadata?.release?.release_summary || release()?.metadata?.release_summary || {};
  }
  function sourceUrls() { return S.meta?.source_urls || S.meta?.methodology?.source_urls || {}; }
  function releaseLabel() {
    const rel = release();
    const edition = rel.release_year || S.meta?.overview?.release_year || 2026;
    const latest = rel.latest_data_year || S.meta?.overview?.latest_data_year || LATEST_YEAR;
    return lang() === "ru" ? `Выпуск ${edition} · данные по ${latest} год` : `Release ${edition} · data through ${latest}`;
  }
  function pulseTitle() {
    const latest = release().latest_data_year || S.meta?.overview?.latest_data_year || LATEST_YEAR;
    return lang() === "ru" ? `Глобальный пульс ${latest}` : `Global pulse ${latest}`;
  }
  function apiHeaders() { return S.token ? {"X-GIR-SIPRI-Token": S.token} : {}; }

  class ApiError extends Error {
    constructor(status, detail) { super(typeof detail === "string" ? detail : detail?.message || detail?.code || `HTTP ${status}`); this.status = status; this.detail = detail || {}; }
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {cache: "no-store", ...options});
    let payload = null;
    try { payload = await response.json(); } catch (_) { payload = null; }
    if (!response.ok) throw new ApiError(response.status, payload?.detail || payload || response.statusText);
    return payload;
  }

  async function loadMeta() {
    const staticMeta = await fetchJson(META_URL);
    let api = null;
    try {
      const [overview, releases, series, methodology, license, health] = await Promise.all([
        fetchJson(API_BASE), fetchJson(`${API_BASE}/releases`), fetchJson(`${API_BASE}/series`),
        fetchJson(`${API_BASE}/methodology`), fetchJson(`${API_BASE}/license`), fetchJson(`${API_BASE}/health`),
      ]);
      api = {overview, releases, series, methodology, license, health};
    } catch (error) {
      api = null;
      S.accessError = error;
    }
    return api ? {...staticMeta, ...api, data_mode: "backend_metadata"} : staticMeta;
  }

  async function loadGeo() {
    try { return await fetchJson(GEO_URL); }
    catch (_) { return null; }
  }

  function statusMode(meta) {
    const overview = meta?.overview || {};
    if (!meta || meta.data_mode === "metadata_only_static_bundle") return "static";
    if (!overview.imported) return "locked";
    if (overview.api_audience === "private_internal") return S.token ? "live-private-pending" : "token";
    if (overview.api_audience === "public") return "live-public-pending";
    return "forbidden";
  }

  function rankingUrl() {
    const params = new URLSearchParams({year: String(S.selectedYear), series: S.selectedSeries, limit: String(RANK_LIMIT), offset: "0", sort: "rank", direction: "asc"});
    return `${API_BASE}/ranking?${params}`;
  }

  async function loadLiveData({preserveSelection = true} = {}) {
    S.busy = true;
    try {
      const ranking = await fetchJson(rankingUrl(), {headers: apiHeaders()});
      S.ranking = Array.isArray(ranking.rows) ? ranking.rows : [];
      S.selectedYear = Number(ranking.year || S.selectedYear);
      if (!preserveSelection || !S.ranking.some((row) => row.iso3 === S.selectedIso)) {
        const requested = String(S.context?.country || "").toUpperCase();
        S.selectedIso = S.ranking.find((row) => row.iso3 === requested)?.iso3 || requested;
      }
      if (!S.compare.length) {
        const seed = [S.selectedIso, ...S.ranking.slice(0, 3).map((row) => row.iso3)].filter(Boolean);
        S.compare = Array.from(new Set(seed)).slice(0, 3);
      }
      const [profile, trend] = await Promise.all([
        fetchJson(`${API_BASE}/countries/${encodeURIComponent(S.selectedIso)}?year=${S.selectedYear}`, {headers: apiHeaders()}),
        fetchJson(`${API_BASE}/trend?entity=${encodeURIComponent(S.selectedIso)}&series=${encodeURIComponent(S.selectedSeries)}`, {headers: apiHeaders()}),
      ]);
      S.profile = profile;
      S.trend = trend;
      S.compareTrends.set(`${S.selectedIso}:${S.selectedSeries}`, trend);
      S.mode = S.meta.overview.api_audience === "private_internal" ? "live-private" : "live-public";
      S.accessError = null;
    } catch (error) {
      S.accessError = error;
      if (error instanceof ApiError && error.status === 401) S.mode = "token";
      else if (error instanceof ApiError && error.status === 403) S.mode = "forbidden";
      else if (error instanceof ApiError && error.status === 409) S.mode = "locked";
      else S.mode = "static";
    } finally { S.busy = false; }
  }

  async function hydrate() {
    S.token = sessionStorage.getItem(TOKEN_KEY) || "";
    const [meta, geo] = await Promise.all([loadMeta(), loadGeo()]);
    S.meta = meta;
    S.geo = geo;
    const requestedYear = Number(S.context?.year || LATEST_YEAR);
    S.selectedYear = requestedYear >= 1949 && requestedYear <= LATEST_YEAR ? requestedYear : LATEST_YEAR;
    S.selectedIso = String(S.context?.country || "").toUpperCase();
    S.mode = statusMode(meta);
    if (S.mode === "live-private-pending" || S.mode === "live-public-pending") await loadLiveData();
  }

  function statusText() {
    if (S.mode === "live-private") return tr("importedPrivate");
    if (S.mode === "live-public") return tr("importedPublic");
    if (S.mode === "token") return tr("tokenRequired");
    if (S.mode === "forbidden") return tr("forbidden");
    if (S.mode === "static") return tr("staticMode");
    return tr("awaitingImport");
  }
  function statusClass() {
    if (S.mode.startsWith("live")) return "is-live";
    if (S.mode === "token") return "is-token";
    if (S.mode === "forbidden") return "is-danger";
    return "is-locked";
  }
  function dataModeLabel() { return S.mode.startsWith("live") ? tr("liveApi") : tr("metadataOnly"); }

  function formatValue(value, code = S.selectedSeries, localCurrency = "") {
    if (!finite(value)) return "—";
    const n = Number(value);
    if (["share_gdp_percent", "share_government_spending_percent"].includes(code)) return `${decimalFmt(n, 2)}%`;
    if (code === "per_capita_usd") return `${decimalFmt(n, n < 100 ? 1 : 0)} ${tr("usd")}`;
    if (code.startsWith("local_currency")) return `${decimalFmt(n, Math.abs(n) < 100 ? 2 : 0)}${localCurrency ? ` ${esc(localCurrency)}` : ""}`;
    if (Math.abs(n) >= 1_000_000) return `${decimalFmt(n / 1_000_000, 2)} ${tr("usdTrillion")}`;
    if (Math.abs(n) >= 1_000) return `${decimalFmt(n / 1_000, 1)} ${lang() === "ru" ? "млрд долл." : "USD bn"}`;
    return `${decimalFmt(n, 1)} ${lang() === "ru" ? "млн долл." : "USD m"}`;
  }

  function qualityLabel(flag) {
    return ({sipri_reported_or_unmarked: tr("reported"), sipri_estimate: tr("estimate"), sipri_uncertain: tr("uncertain"), sipri_colour_unresolved: tr("unresolved")})[flag] || flag || "—";
  }
  function qualityClass(flag) {
    if (flag === "sipri_estimate") return "is-estimate";
    if (flag === "sipri_uncertain") return "is-uncertain";
    if (flag === "sipri_colour_unresolved") return "is-unresolved";
    return "is-reported";
  }
  function countryName(row) { return row?.canonical_name_en || row?.name || row?.source_name || row?.iso3 || "—"; }
  function selectedRow() { return S.ranking.find((row) => row.iso3 === S.selectedIso) || null; }
  function profileValue(code) { return S.profile?.values?.find((item) => item.series_code === code) || null; }

  function icon(name) {
    const paths = {
      globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a13 13 0 0 1 0 16M12 4a13 13 0 0 0 0 16"/>',
      shield: '<path d="M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
      lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      chart: '<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      timeline: '<path d="M3 12h18M6 8v8m6-11v14m6-11v8"/>',
      map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
      file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
      key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 3 3"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
      download: '<path d="M12 3v12m-4-4 4 4 4-4M5 21h14"/>',
      evidence: '<path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.info}</svg>`;
  }

  function heroMarkup() {
    const summary = releaseSummary();
    const total = num(summary.global_military_expenditure_2025_usd_billions);
    const change = num(summary.real_change_2025_percent);
    const burden = num(summary.global_military_burden_2025_percent);
    const perCapita = num(summary.per_capita_2025_usd);
    const links = sourceUrls();
    return `<section class="milexw-hero" aria-labelledby="milexw-title">
      <div class="milexw-hero-grid">
        <div class="milexw-hero-copy">
          <div class="milexw-kicker"><span>${esc(tr("module"))}</span><b>${esc(tr("acronym"))}</b></div>
          <h1 id="milexw-title">${esc(tr("title"))}</h1>
          <p>${esc(tr("lead"))}</p>
          <div class="milexw-hero-meta">
            <span>${icon("timeline")}${esc(releaseLabel())}</span>
            <span>${icon("database")}${esc(tr("source"))}</span>
          </div>
          <div class="milexw-actions">
            <a class="milexw-btn primary" href="${esc(links.database || release().official_database_url || "https://www.sipri.org/databases/milex")}" target="_blank" rel="noopener">${icon("globe")}${esc(tr("officialDatabase"))}</a>
            <a class="milexw-btn" href="${esc(links.methods || S.meta?.methodology?.source_urls?.sources_and_methods || "https://www.sipri.org/databases/milex/sources-and-methods")}" target="_blank" rel="noopener">${icon("file")}${esc(tr("methodology"))}</a>
            <button type="button" class="milexw-btn" data-milex-action="jump" data-target="milex-data-vault">${icon("lock")}${esc(tr("dataVault"))}</button>
          </div>
        </div>
        <div class="milexw-pulse" aria-label="${esc(pulseTitle())}">
          <div class="milexw-pulse-orbit orbit-a"></div><div class="milexw-pulse-orbit orbit-b"></div>
          <div class="milexw-pulse-core"><span>${esc(tr("total"))}</span><strong>${total == null ? "—" : decimalFmt(total / 1000, 3)}</strong><em>${esc(tr("usdTrillion"))}</em></div>
          <div class="milexw-pulse-stat pos-a"><b>${change == null ? "—" : signed(change)}</b><span>${esc(tr("realChange"))}</span></div>
          <div class="milexw-pulse-stat pos-b"><b>${burden == null ? "—" : `${decimalFmt(burden, 1)}%`}</b><span>${esc(tr("burden"))}</span></div>
          <div class="milexw-pulse-stat pos-c"><b>${perCapita == null ? "—" : `$${intFmt(perCapita)}`}</b><span>${esc(tr("perCapita"))}</span></div>
        </div>
      </div>
      <div class="milexw-status-strip">
        <span class="milexw-status ${statusClass()}"><i></i>${esc(statusText())}</span>
        <span>${esc(tr("sourceMode"))}: <b>${esc(dataModeLabel())}</b></span>
        <span>${esc(release().workbook_version || "v1.2")} · ${esc(String(release().earliest_data_year || 1949))}–${esc(String(release().latest_data_year || 2025))}</span>
        <span>${esc(tr("frontendVersion"))}</span>
      </div>
    </section>`;
  }

  function releasePulseMarkup() {
    const summary = releaseSummary();
    const cards = [
      ["total", summary.global_military_expenditure_2025_usd_billions, (v) => `${decimalFmt(Number(v) / 1000, 3)} ${tr("usdTrillion")}`, "globe"],
      ["realChange", summary.real_change_2025_percent, (v) => signed(v), "chart"],
      ["burden", summary.global_military_burden_2025_percent, (v) => `${decimalFmt(v, 1)}%`, "shield"],
      ["perCapita", summary.per_capita_2025_usd, (v) => `$${intFmt(v)}`, "database"],
    ];
    const principles = [
      ["evidenceFirst", "evidenceText", "evidence"], ["inputNotCapability", "inputNotCapabilityText", "shield"],
      ["longSeries", "longSeriesText", "timeline"], ["baseYear", "baseYearText", "chart"],
    ];
    return `<section class="milexw-section" id="milex-release-pulse">
      <div class="milexw-section-head"><div><span>${esc(releaseLabel())}</span><h2>${esc(pulseTitle())}</h2><p>${esc(tr("globalPulseText"))}</p></div><span class="milexw-chip">${esc(tr("metadataReady"))}</span></div>
      <div class="milexw-kpi-grid">${cards.map(([label, value, formatter, iconName]) => `<article class="milexw-kpi"><div>${icon(iconName)}<span>${esc(tr(label))}</span></div><strong>${value == null ? "—" : esc(formatter(value))}</strong><small>${esc(String(release().latest_data_year || LATEST_YEAR))} · SIPRI release-level fact</small></article>`).join("")}</div>
      <div class="milexw-principles">${principles.map(([title, text, iconName]) => `<article>${icon(iconName)}<div><h3>${esc(title === "baseYear" ? baseYearTitle() : tr(title))}</h3><p>${esc(tr(text))}</p></div></article>`).join("")}</div>
    </section>`;
  }

  function importCommand() {
    return `python scripts/import_sipri_milex.py \\\n  --workbook data/restricted/sipri_milex/SIPRI-Milex-data-1949-2025_v1.2.xlsx \\\n  --expect-sha256 <VERIFIED_SHA256> \\\n  --accept-sipri-terms \\\n  --permission-basis private_internal_analysis \\\n  --operator-attestation "Authorized internal research; no public redistribution" \\\n  --api-audience private_internal \\\n  --db data/global_index_platform.sqlite --json`;
  }

  function accessMessage() {
    const error = S.accessError;
    if (S.mode === "token") return tr("unauthorized");
    if (S.mode === "forbidden") return tr("forbidden");
    if (error instanceof ApiError && error.status === 409) return tr("notImported");
    if (S.mode === "static") return tr("networkError");
    return tr("notImported");
  }

  function vaultMarkup() {
    const rel = release();
    const health = S.meta?.health || {};
    const counts = health.counts || {};
    const permission = S.meta?.overview?.permission || null;
    const isToken = S.mode === "token";
    const live = S.mode.startsWith("live");
    const tokenPanel = isToken ? `<form class="milexw-token-form" data-milex-form="token">
      <label><span>${esc(tr("tokenLabel"))}</span><input id="milexToken" type="password" autocomplete="off" placeholder="${esc(tr("tokenPlaceholder"))}" /></label>
      <button class="milexw-btn primary" type="submit">${icon("key")}${esc(tr("connect"))}</button>
      <p>${esc(tr("tokenNote"))}</p>
    </form>` : "";
    return `<section class="milexw-section milexw-vault" id="milex-data-vault">
      <div class="milexw-section-head"><div><span>${esc(tr("dataVault"))}</span><h2>${esc(tr("dataVaultTitle"))}</h2><p>${esc(tr("dataVaultText"))}</p></div><span class="milexw-chip ${statusClass()}">${esc(statusText())}</span></div>
      <div class="milexw-vault-grid">
        <article class="milexw-access-card">
          <div class="milexw-access-icon">${icon(live ? "database" : "lock")}</div>
          <div><span>${esc(tr("connection"))}</span><h3>${esc(live ? tr("connected") : accessMessage())}</h3>
          <p>${esc(live ? `${rel.country_count || counts.entities_count || S.ranking.length} ${tr("countries")} · ${rel.value_count || counts.values_count || 0} ${tr("values")}` : tr("dataVaultText"))}</p></div>
          ${live && S.mode === "live-private" ? `<button type="button" class="milexw-link-btn" data-milex-action="disconnect">${esc(tr("disconnect"))}</button>` : ""}
        </article>
        <article class="milexw-integrity-card"><h3>${esc(tr("releaseIntegrity"))}</h3><dl>
          <div><dt>${esc(tr("workbook"))}</dt><dd>${esc(rel.official_workbook_filename || "SIPRI-Milex-data-1949-2025_v1.2.xlsx")}</dd></div>
          <div><dt>${esc(tr("revision"))}</dt><dd>${esc(String(rel.official_revised_at || "2026-04-27 19:00 CET"))}</dd></div>
          <div><dt>${esc(tr("coverage"))}</dt><dd>${esc(String(rel.earliest_data_year || 1949))}–${esc(String(rel.latest_data_year || 2025))}</dd></div>
          <div><dt>SHA-256</dt><dd class="mono">${esc(rel.workbook_sha256 || (lang() === "ru" ? "вычисляется при локальном импорте" : "computed during local import"))}</dd></div>
        </dl></article>
        <article class="milexw-policy-card"><h3>${esc(tr("accessPolicy"))}</h3><ul>
          <li>${icon("shield")}<span>${esc(tr("noDataset"))}</span></li><li>${icon("file")}<span>${esc(tr("noWorkbook"))}</span></li><li>${icon("lock")}<span>${esc(tr("publicNeedsPermission"))}</span></li>
        </ul>${permission ? `<small>${esc(permission.permission_basis || "")} · ${esc(permission.api_audience || "")}</small>` : ""}</article>
      </div>
      <div class="milexw-access-flow" aria-label="${esc(tr("dataVaultTitle"))}">${[["accessStep1","accessStep1Text","download"],["accessStep2","accessStep2Text","evidence"],["accessStep3","accessStep3Text","shield"],["accessStep4","accessStep4Text","chart"]].map(([title,text,iconName],index)=>`<article><span>${String(index+1).padStart(2,"0")}</span><div>${icon(iconName)}<h3>${esc(tr(title))}</h3><p>${esc(tr(text))}</p></div></article>`).join("")}</div>
      ${tokenPanel}
      ${!live && !isToken ? `<details class="milexw-import-guide"><summary>${icon("database")}<span>${esc(tr("importGuide"))}</span></summary><div><pre><code>${esc(importCommand())}</code></pre><button type="button" class="milexw-btn" data-milex-action="copy-command" data-copy="${esc(importCommand())}">${icon("file")}${esc(tr("copyCommand"))}</button></div></details>` : ""}
    </section>`;
  }

  function lockedWorkspaceMarkup() {
    const cards = [["lockedProfile", "profileText", "shield"], ["lockedTrend", "trendText", "chart"], ["lockedMap", "mapText", "map"], ["lockedRanking", "rankingText", "evidence"]];
    return `<section class="milexw-section milexw-blueprint" id="milex-live-workspace">
      <div class="milexw-section-head"><div><span>${esc(tr("liveWorkspace"))}</span><h2>${esc(tr("analyticBlueprint"))}</h2><p>${esc(tr("blueprintText"))}</p></div><span class="milexw-chip is-locked">${icon("lock")}${esc(tr("awaitingImport"))}</span></div>
      <div class="milexw-blueprint-grid">${cards.map(([title,text,iconName],index) => `<article><div class="milexw-blueprint-preview preview-${index+1}"><span></span><span></span><span></span>${icon(iconName)}</div><h3>${esc(tr(title))}</h3><p>${esc(tr(text))}</p><small>${esc(tr("activateByImport"))}</small></article>`).join("")}</div>
    </section>`;
  }

  function profileMarkup() {
    const row = selectedRow();
    if (!row) return "";
    const core = ["constant_usd_millions", "current_usd_millions", "share_gdp_percent", "per_capita_usd", "share_government_spending_percent"];
    return `<section class="milexw-section" id="milex-country-profile">
      <div class="milexw-section-head"><div><span>${esc(tr("selectedCountry"))} · ${esc(S.selectedYear)}</span><h2>${esc(countryName(row))} <small>${esc(row.iso3 || "")}</small></h2><p>${esc(tr("profileText"))}</p></div><button type="button" class="milexw-btn" data-milex-action="evidence" data-iso="${esc(row.iso3)}">${icon("evidence")}${esc(tr("evidence"))}</button></div>
      <div class="milexw-profile-grid">
        <article class="milexw-profile-main ${qualityClass(row.quality_flag)}"><div class="milexw-profile-label"><span>${esc(shortSeriesName(S.selectedSeries))}</span><em>${esc(qualityLabel(row.quality_flag))}</em></div><strong>${esc(formatValue(row.value, row.series_code, row.local_currency))}</strong><div class="milexw-profile-stats"><span><b>${row.rank == null ? "—" : `#${esc(row.rank)}`}</b>${esc(tr("rank"))}</span><span><b>${row.percentile == null ? "—" : `${decimalFmt(row.percentile, 1)}%`}</b>${esc(tr("percentile"))}</span><span><b>${esc(signed(row.change_1y_pct))}</b>${esc(tr("change1y"))}</span><span><b>${esc(signed(row.change_10y_pct))}</b>${esc(tr("change10y"))}</span></div></article>
        <div class="milexw-profile-cards">${core.map((code) => { const item = profileValue(code); return `<article class="${qualityClass(item?.quality_flag)}"><span>${esc(shortSeriesName(code))}</span><strong>${esc(item ? formatValue(item.value, code, item.local_currency) : "—")}</strong><small>${item ? esc(qualityLabel(item.quality_flag)) : esc(tr("noData"))}</small></article>`; }).join("")}</div>
      </div>
    </section>`;
  }

  function trendValues() {
    let values = Array.isArray(S.trend?.values) ? S.trend.values.slice() : [];
    if (S.trendWindow === "10") values = values.slice(-10);
    if (S.trendWindow === "25") values = values.slice(-25);
    return values;
  }

  function lineChart(values, {width = 940, height = 330, label = "", className = "milexw-line", showArea = true} = {}) {
    const clean = values.filter((item) => finite(item.value));
    if (!clean.length) return `<div class="milexw-empty">${esc(tr("noData"))}</div>`;
    const padding = {left: 62, right: 22, top: 24, bottom: 42};
    const xs = clean.map((item) => Number(item.year));
    const ys = clean.map((item) => Number(item.value));
    let minY = Math.min(...ys), maxY = Math.max(...ys);
    if (minY === maxY) { minY *= .95; maxY *= 1.05 || 1; }
    const spanY = maxY - minY;
    minY -= spanY * .08; maxY += spanY * .08;
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const x = (year) => padding.left + ((year - minX) / Math.max(1, maxX - minX)) * (width - padding.left - padding.right);
    const y = (value) => padding.top + (1 - (value - minY) / Math.max(1e-9, maxY - minY)) * (height - padding.top - padding.bottom);
    const points = clean.map((item) => `${x(Number(item.year)).toFixed(2)},${y(Number(item.value)).toFixed(2)}`).join(" ");
    const area = `${padding.left},${height-padding.bottom} ${points} ${x(maxX)},${height-padding.bottom}`;
    const yTicks = Array.from({length: 5}, (_, i) => minY + (maxY - minY) * i / 4).reverse();
    const xTicks = Array.from(new Set([minX, Math.round(minX + (maxX-minX)*.25), Math.round(minX + (maxX-minX)*.5), Math.round(minX + (maxX-minX)*.75), maxX]));
    return `<svg class="milexw-chart ${esc(className)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
      <defs><linearGradient id="milexArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".28"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      ${yTicks.map((tick) => `<g><line x1="${padding.left}" y1="${y(tick)}" x2="${width-padding.right}" y2="${y(tick)}"/><text x="${padding.left-10}" y="${y(tick)+4}" text-anchor="end">${esc(decimalFmt(tick, Math.abs(tick)<10?1:0))}</text></g>`).join("")}
      ${xTicks.map((tick) => `<text x="${x(tick)}" y="${height-14}" text-anchor="middle">${esc(tick)}</text>`).join("")}
      ${showArea ? `<polygon class="milexw-chart-area" points="${area}" fill="url(#milexArea)"/>` : ""}
      <polyline class="milexw-chart-line" points="${points}"/>
      ${clean.map((item) => `<circle class="milexw-chart-point ${qualityClass(item.quality_flag)}" cx="${x(Number(item.year))}" cy="${y(Number(item.value))}" r="${item.year === maxX ? 5 : 3}" data-year="${esc(item.year)}" data-value="${esc(item.value)}"><title>${esc(item.year)} · ${esc(formatValue(item.value, S.selectedSeries, item.local_currency))} · ${esc(qualityLabel(item.quality_flag))}</title></circle>`).join("")}
    </svg>`;
  }

  function trendMarkup() {
    const values = trendValues();
    const first = values[0], last = values[values.length - 1];
    return `<section class="milexw-section" id="milex-trend">
      <div class="milexw-section-head"><div><span>${esc(tr("trend"))} · ${esc(shortSeriesName(S.selectedSeries))}</span><h2>${esc(countryName(selectedRow()))}</h2><p>${esc(tr("trendText"))}</p></div><div class="milexw-segments" role="group" aria-label="${esc(tr("period"))}">${[["10","years10"],["25","years25"],["all","allYears"]].map(([value,key]) => `<button type="button" class="${S.trendWindow===value?"active":""}" data-milex-action="trend-window" data-window="${value}">${esc(tr(key))}</button>`).join("")}</div></div>
      <div class="milexw-trend-grid"><article class="milexw-chart-card">${lineChart(values, {label: `${countryName(selectedRow())} · ${shortSeriesName(S.selectedSeries)}`})}<div class="milexw-chart-foot"><span>${esc(first?.year ?? "—")} · ${esc(first ? formatValue(first.value, S.selectedSeries, first.local_currency) : "—")}</span><b>${esc(last?.year ?? "—")} · ${esc(last ? formatValue(last.value, S.selectedSeries, last.local_currency) : "—")}</b></div></article><aside><div><span>${esc(tr("latest"))}</span><strong>${esc(last ? formatValue(last.value, S.selectedSeries, last.local_currency) : "—")}</strong></div><div><span>${esc(tr("change1y"))}</span><strong>${esc(signed(selectedRow()?.change_1y_pct))}</strong></div><div><span>${esc(tr("change10y"))}</span><strong>${esc(signed(selectedRow()?.change_10y_pct))}</strong></div><div><span>${esc(tr("period"))}</span><strong>${esc(first?.year ?? "—")}–${esc(last?.year ?? "—")}</strong></div></aside></div>
    </section>`;
  }

  function geoBounds(features) {
    let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity;
    const scan=(coords)=>{if(!Array.isArray(coords))return;if(typeof coords[0]==="number"){const [lon,lat]=coords;if(lon<-170||lon>190)return;minLon=Math.min(minLon,lon);maxLon=Math.max(maxLon,lon);minLat=Math.min(minLat,lat);maxLat=Math.max(maxLat,lat);}else coords.forEach(scan);};
    features.forEach((f)=>scan(f.geometry?.coordinates)); return {minLon,minLat,maxLon,maxLat};
  }
  function geoPath(geom,w,h,b) {
    const project=(lon,lat)=>[(lon-b.minLon)/(b.maxLon-b.minLon)*w,h-(lat-b.minLat)/(b.maxLat-b.minLat)*h];
    const ring=(points)=>points.map((p,i)=>{const [x,y]=project(p[0],p[1]);return`${i?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`;}).join("")+"Z";
    if(geom?.type==="Polygon")return geom.coordinates.map(ring).join("");
    if(geom?.type==="MultiPolygon")return geom.coordinates.map((poly)=>poly.map(ring).join("")).join("");
    return "";
  }
  function quantile(sorted,p){if(!sorted.length)return null;const pos=(sorted.length-1)*p,lo=Math.floor(pos),hi=Math.ceil(pos);return lo===hi?sorted[lo]:sorted[lo]+(sorted[hi]-sorted[lo])*(pos-lo);}
  function mapScale() {
    const values = S.ranking.map((row)=>Number(row.value)).filter(Number.isFinite).sort((a,b)=>a-b);
    return {values, thresholds:Array.from({length:6},(_,i)=>quantile(values,(i+1)/7)), min:values[0], median:quantile(values,.5), max:values[values.length-1]};
  }
  function mapBin(value,scale){if(!finite(value)||!scale.values.length)return null;let bin=0;while(bin<scale.thresholds.length&&Number(value)>scale.thresholds[bin])bin++;return bin;}

  function mapMarkup() {
    if (!S.geo?.features?.length) return "";
    const width=1000,height=440,bounds=geoBounds(S.geo.features),scale=mapScale(),byIso=new Map(S.ranking.map((row)=>[row.iso3,row]));
    const paths=S.geo.features.map((feature)=>{const iso=feature.properties?.iso3,row=byIso.get(iso),d=geoPath(feature.geometry,width,height,bounds),bin=mapBin(row?.value,scale);if(!iso||!d)return"";return `<path class="milexw-map-country ${bin==null?"no-data":`bin-${bin+1}`} ${iso===S.selectedIso?"selected":""} ${qualityClass(row?.quality_flag)}" d="${d}" data-milex-action="map-country" data-iso="${esc(iso)}" data-value="${esc(row?.value ?? "")}" tabindex="${iso===S.selectedIso?"0":"-1"}" role="button" aria-label="${esc(countryName(row)||feature.properties?.name||iso)}${row?` · ${esc(formatValue(row.value,row.series_code,row.local_currency))}`:` · ${esc(tr("noData"))}`}"><title>${esc(countryName(row)||feature.properties?.name||iso)} · ${esc(row?formatValue(row.value,row.series_code,row.local_currency):tr("noData"))}</title></path>`;}).join("");
    const textRows=S.ranking.slice(0,12).map((row)=>`<li><button type="button" data-milex-action="country" data-iso="${esc(row.iso3)}"><span>${esc(countryName(row))}</span><b>${esc(formatValue(row.value,row.series_code,row.local_currency))}</b></button></li>`).join("");
    return `<section class="milexw-section" id="milex-map"><div class="milexw-section-head"><div><span>${esc(tr("map"))} · ${esc(shortSeriesName(S.selectedSeries))}</span><h2>${esc(tr("map"))}</h2><p>${esc(tr("mapText"))}</p></div><span class="milexw-chip">${esc(S.ranking.length)} ${esc(tr("countries"))}</span></div>
      <div class="milexw-map-layout"><article class="milexw-map-card"><svg class="milexw-map" viewBox="0 0 ${width} ${height}" role="group" aria-label="${esc(tr("map"))}">${paths}</svg><div class="milexw-map-legend"><span>${esc(formatValue(scale.min,S.selectedSeries))}</span><i>${Array.from({length:7},(_,i)=>`<b class="bin-${i+1}"></b>`).join("")}</i><span>${esc(formatValue(scale.max,S.selectedSeries))}</span></div><p>${esc(tr("mapKeyboard"))}</p><div class="milexw-tooltip" hidden></div></article><aside><h3>${esc(tr("textAlternative"))}</h3><ol>${textRows}</ol></aside></div>
    </section>`;
  }

  function comparisonRows() { return S.compare.map((iso)=>S.ranking.find((row)=>row.iso3===iso)).filter(Boolean); }
  function comparisonMarkup() {
    const rows = comparisonRows();
    const available = S.ranking.filter((row)=>!S.compare.includes(row.iso3));
    const max = Math.max(...rows.map((row)=>Number(row.value)||0),1);
    return `<section class="milexw-section" id="milex-comparison"><div class="milexw-section-head"><div><span>${esc(tr("comparison"))}</span><h2>${esc(tr("comparison"))}</h2><p>${esc(tr("comparisonText"))}</p></div><button type="button" class="milexw-btn" data-milex-action="reset-compare">${esc(tr("reset"))}</button></div>
      <div class="milexw-compare-toolbar"><label><span>${esc(tr("addCountry"))}</span><select id="milexCompareSelect">${available.map((row)=>`<option value="${esc(row.iso3)}">${esc(countryName(row))}</option>`).join("")}</select></label><button type="button" class="milexw-btn primary" data-milex-action="add-compare" ${available.length&&rows.length<5?"":"disabled"}>${esc(tr("add"))}</button></div>
      <div class="milexw-compare-grid">${rows.map((row,index)=>`<article><div><span class="milexw-rank-dot">${row.rank==null?"—":`#${esc(row.rank)}`}</span><button type="button" aria-label="${esc(tr("remove"))}" data-milex-action="remove-compare" data-iso="${esc(row.iso3)}" ${rows.length<=2?"disabled":""}>×</button></div><h3>${esc(countryName(row))}</h3><strong>${esc(formatValue(row.value,row.series_code,row.local_currency))}</strong><div class="milexw-compare-bar"><i style="--v:${clamp((Number(row.value)/max)*100,1,100)}%"></i></div><dl><div><dt>${esc(tr("change1y"))}</dt><dd>${esc(signed(row.change_1y_pct))}</dd></div><div><dt>${esc(tr("change10y"))}</dt><dd>${esc(signed(row.change_10y_pct))}</dd></div><div><dt>${esc(tr("quality"))}</dt><dd class="${qualityClass(row.quality_flag)}">${esc(qualityLabel(row.quality_flag))}</dd></div></dl></article>`).join("")}</div>
    </section>`;
  }

  function filteredRanking() {
    const q=S.query.trim().toLowerCase();
    let rows=S.ranking.filter((row)=>(S.includeEstimates||!row.is_sipri_estimate)&&(S.includeUncertain||!row.is_uncertain));
    if(q)rows=rows.filter((row)=>`${countryName(row)} ${row.source_name||""} ${row.iso3||""}`.toLowerCase().includes(q));
    const dir=S.direction==="desc"?-1:1;
    rows.sort((a,b)=>{let av,bv;if(S.sort==="country"){av=countryName(a).toLowerCase();bv=countryName(b).toLowerCase();return av.localeCompare(bv)*dir;}if(S.sort==="value"){av=num(a.value);bv=num(b.value);}else if(S.sort==="change_1y"){av=num(a.change_1y_pct);bv=num(b.change_1y_pct);}else if(S.sort==="change_10y"){av=num(a.change_10y_pct);bv=num(b.change_10y_pct);}else{av=num(a.rank);bv=num(b.rank);}if(av==null&&bv==null)return 0;if(av==null)return 1;if(bv==null)return-1;return(av-bv)*dir;});
    return rows;
  }

  function rankingMarkup() {
    const rows=filteredRanking(),pages=Math.max(1,Math.ceil(rows.length/S.pageSize));S.page=clamp(S.page,0,pages-1);const slice=rows.slice(S.page*S.pageSize,(S.page+1)*S.pageSize);
    const exportAllowed=Boolean(S.meta?.overview?.csv_export_allowed);
    return `<section class="milexw-section" id="milex-ranking"><div class="milexw-section-head"><div><span>${esc(tr("ranking"))} · ${esc(S.selectedYear)}</span><h2>${esc(tr("ranking"))}</h2><p>${esc(tr("rankingText"))}</p></div><button type="button" class="milexw-btn" data-milex-action="export" ${exportAllowed?"":"disabled"} title="${esc(exportAllowed?tr("exportCsv"):tr("exportBlocked"))}">${icon("download")}${esc(tr("exportCsv"))}</button></div>
      <div class="milexw-ranking-toolbar"><label class="search"><span>${esc(tr("search"))}</span><input id="milexSearch" type="search" value="${esc(S.query)}" placeholder="${esc(tr("search"))}" /></label><label><span>${esc(tr("sort"))}</span><select id="milexSort">${[["rank","byRank"],["value","byValue"],["country","byCountry"],["change_1y","byChange1y"],["change_10y","byChange10y"]].map(([value,key])=>`<option value="${value}" ${S.sort===value?"selected":""}>${esc(tr(key))}</option>`).join("")}</select></label><label><span>${esc(tr("sort"))}</span><select id="milexDirection"><option value="asc" ${S.direction==="asc"?"selected":""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction==="desc"?"selected":""}>${esc(tr("descending"))}</option></select></label><label><span>${esc(tr("rows"))}</span><select id="milexPageSize">${[10,25,50,100].map((n)=>`<option value="${n}" ${S.pageSize===n?"selected":""}>${n}</option>`).join("")}</select></label></div>
      <div class="milex-checks"><label><input id="milexEstimates" type="checkbox" ${S.includeEstimates?"checked":""}/><span>${esc(tr("includeEstimates"))}</span></label><label><input id="milexUncertain" type="checkbox" ${S.includeUncertain?"checked":""}/><span>${esc(tr("includeUncertain"))}</span></label></div>
      <div class="milexw-table-wrap"><table class="milexw-ranking-table"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("selectedCountry"))}</th><th>${esc(tr("value"))}</th><th>${esc(tr("change1y"))}</th><th>${esc(tr("change10y"))}</th><th>${esc(tr("quality"))}</th><th>${esc(tr("evidence"))}</th></tr></thead><tbody>${slice.length?slice.map((row)=>`<tr class="${row.iso3===S.selectedIso?"selected":""}"><td><b>${row.rank==null?"—":`#${esc(row.rank)}`}</b>${row.tied_rank?`<small>tie</small>`:""}</td><td><button type="button" data-milex-action="country" data-iso="${esc(row.iso3)}"><span>${esc(countryName(row))}</span><small>${esc(row.iso3||"")}</small></button></td><td><strong>${esc(formatValue(row.value,row.series_code,row.local_currency))}</strong><small>${row.percentile==null?"":`P${Math.round(Number(row.percentile))}`}</small></td><td class="${num(row.change_1y_pct)>0?"up":num(row.change_1y_pct)<0?"down":""}">${esc(signed(row.change_1y_pct))}</td><td class="${num(row.change_10y_pct)>0?"up":num(row.change_10y_pct)<0?"down":""}">${esc(signed(row.change_10y_pct))}</td><td><span class="milexw-quality ${qualityClass(row.quality_flag)}">${esc(qualityLabel(row.quality_flag))}</span></td><td><button type="button" class="milexw-evidence-btn" data-milex-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(`${tr("evidence")}: ${countryName(row)}`)}">${icon("evidence")}</button></td></tr>`).join(""):`<tr><td colspan="7"><div class="milexw-empty">${esc(tr("zeroResults"))}</div></td></tr>`}</tbody></table></div>
      <div class="milexw-pagination"><span>${esc(tr("page"))} <b>${S.page+1}</b> ${esc(tr("of"))} <b>${pages}</b> · ${esc(rows.length)} ${esc(tr("countries"))}</span><div><button type="button" data-milex-action="previous-page" ${S.page===0?"disabled":""}>${esc(tr("previous"))}</button><button type="button" data-milex-action="next-page" ${S.page>=pages-1?"disabled":""}>${esc(tr("next"))}</button></div></div>
    </section>`;
  }

  function liveWorkspaceMarkup() {
    return `<div id="milex-live-workspace">${profileMarkup()}${trendMarkup()}${mapMarkup()}${comparisonMarkup()}${rankingMarkup()}</div>`;
  }

  function seriesMarkup() {
    const interpretation = [["constantForTrend","constantForTrendText","chart"],["currentForSize","currentForSizeText","database"],["burdenIsApprox","burdenIsApproxText","shield"],["notesMatter","notesMatterText","info"]];
    return `<section class="milexw-section" id="milex-methodology"><div class="milexw-section-head"><div><span>${esc(tr("methodology"))}</span><h2>${esc(tr("seriesArchitecture"))}</h2><p>${esc(tr("seriesArchitectureText"))}</p></div><a class="milexw-btn" href="${esc(sourceUrls().methods||"https://www.sipri.org/databases/milex/sources-and-methods")}" target="_blank" rel="noopener">${icon("file")}${esc(tr("methodology"))}</a></div>
      <div class="milexw-series-grid">${seriesList().map((item,index)=>`<article class="${item.series_code===S.selectedSeries?"active":""}"><div><span>${String(index+1).padStart(2,"0")}</span>${icon(item.scope==="aggregate"?"globe":"chart")}</div><h3>${esc(seriesName(item))}</h3><dl><div><dt>code</dt><dd class="mono">${esc(item.series_code)}</dd></div><div><dt>${esc(tr("period"))}</dt><dd>${esc(item.period_basis)}</dd></div><div><dt>unit</dt><dd>${esc(item.unit)}</dd></div></dl>${item.scope==="country"&&item.score_direction!=="not_cross_country_rankable"?`<button type="button" data-milex-action="series" data-series="${esc(item.series_code)}">${esc(tr("metric"))} →</button>`:""}</article>`).join("")}</div>
      <div class="milexw-interpretation"><div class="milexw-section-head compact"><div><span>${esc(tr("interpretation"))}</span><h2>${esc(tr("interpretation"))}</h2></div></div><div>${interpretation.map(([title,text,iconName])=>`<article>${icon(iconName)}<h3>${esc(tr(title))}</h3><p>${esc(tr(text))}</p></article>`).join("")}</div></div>
      <div class="milexw-quality-legend"><div><h3>${esc(tr("qualityLegend"))}</h3><p>${esc(tr("qualityLegendText"))}</p></div><ul><li class="is-reported"><i></i>${esc(tr("reported"))}</li><li class="is-estimate"><i></i>${esc(tr("estimate"))}</li><li class="is-uncertain"><i></i>${esc(tr("uncertain"))}</li><li class="is-unresolved"><i></i>${esc(tr("unresolved"))}</li></ul></div>
    </section>`;
  }

  function evidenceDialogMarkup() { return `<dialog id="milexEvidenceDialog" class="milexw-dialog"><div class="milexw-dialog-shell"><header><div><span>${esc(tr("provenance"))}</span><h2>${esc(tr("evidence"))}</h2></div><button type="button" data-milex-action="close-dialog" aria-label="${esc(tr("close"))}">×</button></header><div class="milexw-dialog-body"><div class="milexw-loading-inline"><i></i><span>${esc(tr("loading"))}</span></div></div></div></dialog>`; }
  function toastMarkup(){return `<div class="milexw-toast" role="status" aria-live="polite" hidden></div>`;}

  function validationBannerMarkup() {
    if (!S.meta?.overview?.validation_fixture) return "";
    return `<aside class="milexw-validation-banner" role="note">${icon("info")}<div><strong>${esc(tr("validationTitle"))}</strong><p>${esc(tr("validationText"))}</p></div><span>LAB · 2022</span></aside>`;
  }

  function workspaceMarkup() {
    const live=S.mode.startsWith("live");
    return `<div class="milexw" data-mode="${esc(S.mode)}">${validationBannerMarkup()}${heroMarkup()}${releasePulseMarkup()}${vaultMarkup()}${live?liveWorkspaceMarkup():lockedWorkspaceMarkup()}${seriesMarkup()}<footer class="milexw-attribution"><span>${esc(tr("attribution"))}</span><a href="${esc(sourceUrls().doi||`https://doi.org/${release().doi||"10.55163/CQGC9685"}`)}" target="_blank" rel="noopener">${esc(release().doi||"10.55163/CQGC9685")}</a></footer>${evidenceDialogMarkup()}${toastMarkup()}</div>`;
  }

  function loadingMarkup() { return `<section class="milexw-loading"><div class="milexw-loader"><i></i><i></i><i></i></div><h1>${esc(tr("loading"))}</h1><p>${esc(tr("loadingText"))}</p></section>`; }
  function errorMarkup(error) { return `<section class="milexw-error"><div>${icon("info")}</div><h1>${esc(tr("loadError"))}</h1><p>${esc(error?.message||tr("networkError"))}</p><button type="button" class="milexw-btn primary" data-milex-action="retry">${esc(tr("retry"))}</button></section>`; }

  async function refreshMetric() {
    S.busy=true; paint();
    await loadLiveData({preserveSelection:true});
    paint();
  }
  async function selectCountry(iso) {
    const next=String(iso||"").toUpperCase(); if(!next||next===S.selectedIso)return;
    S.selectedIso=next; S.busy=true; paint();
    try {
      const [profile,trend]=await Promise.all([
        fetchJson(`${API_BASE}/countries/${encodeURIComponent(next)}?year=${S.selectedYear}`,{headers:apiHeaders()}),
        fetchJson(`${API_BASE}/trend?entity=${encodeURIComponent(next)}&series=${encodeURIComponent(S.selectedSeries)}`,{headers:apiHeaders()}),
      ]);
      S.profile=profile;S.trend=trend;S.compareTrends.set(`${next}:${S.selectedSeries}`,trend);
      if(!S.compare.includes(next))S.compare=[next,...S.compare].slice(0,5);
      S.context.country=next;
    } catch(error){S.accessError=error;}
    finally{S.busy=false;paint();}
  }

  function showMapTooltip(node,event) {
    const tooltip=S.context.root.querySelector(".milexw-tooltip");if(!tooltip)return;const row=S.ranking.find((item)=>item.iso3===node.dataset.iso);tooltip.innerHTML=`<b>${esc(countryName(row)||node.dataset.iso)}</b><span>${esc(row?formatValue(row.value,row.series_code,row.local_currency):tr("noData"))}</span>${row?`<small>${esc(qualityLabel(row.quality_flag))}</small>`:""}`;tooltip.hidden=false;
    const card=node.closest(".milexw-map-card"),rect=card.getBoundingClientRect(),target=node.getBoundingClientRect();const left=event?.clientX?event.clientX-rect.left:target.left+target.width/2-rect.left;const top=event?.clientY?event.clientY-rect.top:target.top-rect.top;tooltip.style.left=`${clamp(left,80,rect.width-90)}px`;tooltip.style.top=`${clamp(top,45,rect.height-45)}px`;
  }
  function hideTooltip(){const tooltip=S.context.root.querySelector(".milexw-tooltip");if(tooltip)tooltip.hidden=true;}
  function focusNeighbour(node,direction){const nodes=Array.from(S.context.root.querySelectorAll(".milexw-map-country[data-iso]"));const index=nodes.indexOf(node);if(index<0)return;const next=nodes[(index+direction+nodes.length)%nodes.length];node.tabIndex=-1;next.tabIndex=0;next.focus();showMapTooltip(next);}

  async function openEvidence(iso, trigger) {
    const dialog=S.context.root.querySelector("#milexEvidenceDialog");if(!dialog)return;dialog.__returnFocus=trigger||document.activeElement;const body=dialog.querySelector(".milexw-dialog-body");body.innerHTML=`<div class="milexw-loading-inline"><i></i><span>${esc(tr("loading"))}</span></div>`;if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
    try {
      const params=new URLSearchParams({year:String(S.selectedYear),series:S.selectedSeries,limit:"5",offset:"0",q:iso,include_provenance:"true"});
      const payload=await fetchJson(`${API_BASE}/ranking?${params}`,{headers:apiHeaders()});const row=payload.rows?.find((item)=>item.iso3===iso)||payload.rows?.[0];if(!row)throw new Error(tr("noData"));const p=row.provenance||{};
      const fields=[[tr("selectedCountry"),`${countryName(row)} · ${row.iso3||""}`],[tr("year"),row.year],[tr("metric"),seriesName(seriesByCode(row.series_code))],[tr("value"),formatValue(row.value,row.series_code,row.local_currency)],[tr("valueText"),row.value_text],[tr("rank"),row.rank==null?"—":`#${row.rank}`],[tr("quality"),qualityLabel(row.quality_flag)],[tr("sourceSheet"),row.source_sheet],[tr("sourceRow"),row.source_row],[tr("sourceCell"),row.source_cell],[tr("rowHash"),row.row_sha256],[tr("workbookHash"),p.workbook_sha256],[tr("snapshot"),p.snapshot_id],[tr("transformation"),p.transformation_run_id],[tr("formula"),p.formula_version],[tr("scoreStatus"),tr("scoreOfficial")],[tr("rankStatus"),tr("rankDerived")]];
      dialog.querySelector("h2").textContent=`${countryName(row)} · ${S.selectedYear}`;
      body.innerHTML=`<div class="milexw-evidence-hero"><span class="milexw-quality ${qualityClass(row.quality_flag)}">${esc(qualityLabel(row.quality_flag))}</span><strong>${esc(formatValue(row.value,row.series_code,row.local_currency))}</strong><small>${esc(seriesName(seriesByCode(row.series_code)))}</small></div><dl>${fields.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd class="${String(k).includes("SHA")||String(k).includes("Snapshot")||String(k).includes("Transformation")?"mono":""}">${esc(v??"—")}</dd></div>`).join("")}</dl><footer><a class="milexw-btn" href="${esc(release().official_database_url||sourceUrls().database||"https://www.sipri.org/databases/milex")}" target="_blank" rel="noopener">${icon("globe")}${esc(tr("officialDatabase"))}</a></footer>`;
    } catch(error){body.innerHTML=`<div class="milexw-empty">${esc(error.message||tr("noData"))}</div>`;}
    dialog.querySelector("[data-milex-action='close-dialog']")?.focus();
  }
  function closeDialog(){const dialog=S.context.root.querySelector("#milexEvidenceDialog");if(!dialog)return;const target=dialog.__returnFocus;if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");if(target?.focus&&target.isConnected)target.focus();}
  function toast(message){const node=S.context.root.querySelector(".milexw-toast");if(!node)return;node.textContent=message;node.hidden=false;clearTimeout(node.__timer);node.__timer=setTimeout(()=>{node.hidden=true;},2200);}

  async function exportCsv() {
    try { const response=await fetch(`${API_BASE}/export.csv?year=${S.selectedYear}&series=${encodeURIComponent(S.selectedSeries)}`,{headers:apiHeaders()});if(!response.ok)throw new Error(tr("exportBlocked"));const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`sipri_milex_${S.selectedSeries}_${S.selectedYear}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url); }
    catch(error){toast(error.message||tr("exportBlocked"));}
  }

  function bind() {
    const root=S.context.root;
    root.querySelectorAll("[data-milex-action]").forEach((control)=>control.addEventListener("click",async()=>{
      const action=control.dataset.milexAction;
      if(action==="retry")return render(S.context,{force:true});
      if(action==="jump")return root.querySelector(`#${CSS.escape(control.dataset.target||"")}`)?.scrollIntoView({behavior:"smooth",block:"start"});
      if(action==="copy-command"){try{await navigator.clipboard.writeText(control.dataset.copy||importCommand());toast(tr("copied"));}catch(_){toast(importCommand());}return;}
      if(action==="disconnect"){sessionStorage.removeItem(TOKEN_KEY);S.token="";S.mode="token";return paint();}
      if(action==="trend-window"){S.trendWindow=control.dataset.window||"all";return paintAt("milex-trend");}
      if(action==="series"){const code=control.dataset.series;if(code&&code!==S.selectedSeries){S.selectedSeries=code;S.page=0;await refreshMetric();}return;}
      if(action==="country"||action==="map-country")return selectCountry(control.dataset.iso);
      if(action==="evidence")return openEvidence(control.dataset.iso||S.selectedIso,control);
      if(action==="close-dialog")return closeDialog();
      if(action==="add-compare"){const iso=root.querySelector("#milexCompareSelect")?.value;if(iso&&!S.compare.includes(iso)&&S.compare.length<5)S.compare.push(iso);return paintAt("milex-comparison");}
      if(action==="remove-compare"){if(S.compare.length>2)S.compare=S.compare.filter((iso)=>iso!==control.dataset.iso);return paintAt("milex-comparison");}
      if(action==="reset-compare"){S.compare=Array.from(new Set([S.selectedIso,...S.ranking.slice(0,2).map((row)=>row.iso3)])).slice(0,3);return paintAt("milex-comparison");}
      if(action==="previous-page"){S.page=Math.max(0,S.page-1);return paintAt("milex-ranking");}
      if(action==="next-page"){S.page+=1;return paintAt("milex-ranking");}
      if(action==="export")return exportCsv();
    }));
    root.querySelector("[data-milex-form='token']")?.addEventListener("submit",async(event)=>{event.preventDefault();const token=root.querySelector("#milexToken")?.value?.trim();if(!token)return;S.token=token;sessionStorage.setItem(TOKEN_KEY,token);S.mode="live-private-pending";S.busy=true;paint();await loadLiveData();paint();});
    const search=root.querySelector("#milexSearch");if(search){let timer;search.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>{S.query=search.value;S.page=0;paintAt("milex-ranking");},180);});}
    root.querySelector("#milexSort")?.addEventListener("change",(event)=>{S.sort=event.target.value;S.page=0;paintAt("milex-ranking");});
    root.querySelector("#milexDirection")?.addEventListener("change",(event)=>{S.direction=event.target.value;S.page=0;paintAt("milex-ranking");});
    root.querySelector("#milexPageSize")?.addEventListener("change",(event)=>{S.pageSize=Number(event.target.value)||25;S.page=0;paintAt("milex-ranking");});
    root.querySelector("#milexEstimates")?.addEventListener("change",(event)=>{S.includeEstimates=event.target.checked;S.page=0;paintAt("milex-ranking");});
    root.querySelector("#milexUncertain")?.addEventListener("change",(event)=>{S.includeUncertain=event.target.checked;S.page=0;paintAt("milex-ranking");});
    root.querySelectorAll(".milexw-map-country").forEach((node)=>{node.addEventListener("pointerenter",(event)=>showMapTooltip(node,event));node.addEventListener("pointermove",(event)=>showMapTooltip(node,event));node.addEventListener("pointerleave",hideTooltip);node.addEventListener("focus",()=>showMapTooltip(node));node.addEventListener("blur",hideTooltip);node.addEventListener("keydown",(event)=>{if(["Enter"," "].includes(event.key)){event.preventDefault();selectCountry(node.dataset.iso);}else if(["ArrowRight","ArrowDown"].includes(event.key)){event.preventDefault();focusNeighbour(node,1);}else if(["ArrowLeft","ArrowUp"].includes(event.key)){event.preventDefault();focusNeighbour(node,-1);}else if(event.key==="Escape")hideTooltip();});});
    const dialog=root.querySelector("#milexEvidenceDialog");if(dialog){dialog.addEventListener("cancel",(event)=>{event.preventDefault();closeDialog();});dialog.addEventListener("click",(event)=>{if(event.target===dialog)closeDialog();});}
  }

  function paintAt(id){const y=window.scrollY;paint();const target=S.context.root.querySelector(`#${CSS.escape(id)}`);if(target)window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-150),behavior:"auto"});else window.scrollTo({top:y,behavior:"auto"});}
  function paint() {
    if(!S.context?.root||!S.meta)return;
    S.context.root.innerHTML=workspaceMarkup();
    bind();
    document.documentElement.dataset.sipriMilexReady="true";
    document.documentElement.dataset.sipriMilexMode=S.mode;
    window.dispatchEvent(new CustomEvent("gir:sipri-milex-ready",{detail:{mode:S.mode,year:S.selectedYear,series:S.selectedSeries,iso3:S.selectedIso}}));
  }

  async function render(context, options={}) {
    if(!context?.root)throw new Error("SIPRI Milex workspace requires a root element");
    if(!context.country)return;S.context=context;S.selectedIso=String(context.country).toUpperCase();
    const key=`${context.lang||"ru"}:${context.theme||"dark"}`;const token=++S.renderToken;
    context.root.innerHTML=loadingMarkup();document.documentElement.dataset.sipriMilexReady="false";
    try {
      if(!S.meta||S.loadKey!==key||options.force){await hydrate();if(token!==S.renderToken)return;S.loadKey=key;}
      else if(S.mode.startsWith("live")&&S.selectedIso!==String(context.country||S.selectedIso).toUpperCase())await selectCountry(context.country);
      paint();
    } catch(error){console.error("SIPRI Milex workspace failed",error);if(token!==S.renderToken)return;context.root.innerHTML=errorMarkup(error);context.root.querySelector("[data-milex-action='retry']")?.addEventListener("click",()=>render(context,{force:true}));document.documentElement.dataset.sipriMilexReady="error";}
  }
  function invalidate(){S.meta=null;S.geo=null;S.loadKey="";S.ranking=[];S.profile=null;S.trend=null;S.mode="loading";}
  const api=Object.freeze({render,invalidate,version:"8.0.0-stage08"});
  window.GIRSIPRIMilex=api;window.GIRSIPRIMilexWorkspace=api;
})();
