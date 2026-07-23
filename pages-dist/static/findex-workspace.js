/* GIR · World Bank Global Findex · native workspace
 * Backend contract: missing_values_imputed is false; survey-wave gaps remain gaps.
 */
(() => {
  "use strict";

  const API_ROOT = "/api/economy-finance/findex";
  const GEO_URLS = ["/static/world_countries_lite.geojson", "/static/world.geojson", "/world.geojson"];
  const SOURCE_URL = "https://www.worldbank.org/en/publication/globalfindex";
  const DOWNLOAD_URL = "https://www.worldbank.org/en/publication/globalfindex/download-data";
  const METHOD_URL = "https://www.worldbank.org/en/publication/globalfindex/methodology";
  const MAX_COMPARE = 6;
  const DEFAULT_INDICATOR = "account_t_d";
  const WAVES = [2011, 2014, 2017, 2021, 2024];
  const SERIES_CLASSES = ["findex-series-0", "findex-series-1", "findex-series-2", "findex-series-3", "findex-series-4", "findex-series-5"];
  const CATEGORY_ORDER = ["accounts", "payments", "saving", "borrowing", "resilience", "connectivity", "digital_safety", "insurance", "financial_health", "other"];
  const GROUPS = {
    all: ["all"],
    gender: ["men", "women"],
    income: ["richest 60%", "poorest 40%"],
    age_cat: ["age 25+", "ages 15-24"],
    urbanicity: ["rural", "urban"],
    laborforce: ["in laborforce", "out of laborforce"],
    education: ["secondary edu or more", "prim edu or less"]
  };

  const I18N = {
    ru: {
      loading: "Загрузка Global Findex", loadingText: "GIR читает опубликованный локальный снимок World Bank и готовит выбранный официальный срез.",
      unavailable: "Global Findex пока не загружен", unavailableText: "Backend установлен, но официальный файл World Bank ещё не опубликован в локальном хранилище GIR.",
      loadCommand: "python -m giip.economy_finance.findex_cli download", importCommand: "python -m giip.economy_finance.findex_cli import-file /path/to/GlobalFindexDatabase2025.xlsx", verifyCommand: "python -m giip.economy_finance.findex_cli verify",
      error: "Не удалось открыть Global Findex", retry: "Повторить", overline: "Экономика и финансы · официальная база показателей", title: "Финансовая доступность",
      lead: "Счета, платежи, сбережения, заимствования, финансовая устойчивость и цифровая связанность — с разрезами по группам населения.",
      source: "World Bank · Global Findex Database", official: "Официальная оценка World Bank", derived: "Место, процентиль и разрыв рассчитаны GIR", snapshot: "Локальный воспроизводимый снимок",
      qa: "QA FIXTURE · НЕОФИЦИАЛЬНЫЕ ЗНАЧЕНИЯ", sourceButton: "Официальный источник", dataButton: "Скачать данные", methodButton: "Методология", exportCsv: "Скачать CSV",
      economy: "Экономика", indicator: "Показатель", year: "Волна", population: "Срез населения", release: "Выпуск", value: "Официальное значение", rank: "Место GIR", percentile: "Процентиль", economies: "экономик",
      noComposite: "Global Findex не публикует единый сводный балл страны. Каждый экран относится к одному официальному показателю, году и срезу населения.",
      navigation: "Навигация по Global Findex", navPosition: "Позиция", navMap: "Карта", navExplorer: "Показатели", navGaps: "Разрывы", navTrend: "Динамика", navCompare: "Сравнение", navRanking: "Рейтинг", navMethod: "Методология",
      s1Kicker: "01 · Позиция экономики", s1Title: "Один официальный срез — без выдуманного композита", s1Text: "Оценка World Bank показана отдельно от соревновательного места и процентиля GIR.",
      rankOf: "Место среди экономик", selectedSlice: "Выбранный срез", coverage: "Покрытие", median: "Медиана", distanceMedian: "От медианы", higher: "выше", lower: "ниже", percentagePoints: "п.п.",
      headline: "Ключевые официальные показатели", account: "Владение счётом", fiAccount: "Счёт в финансовой организации", mobileAccount: "Мобильный денежный счёт", notAvailable: "нет данных",
      s2Kicker: "02 · Пространственное распределение", s2Title: "Мировая карта выбранного показателя", s2Text: "Карта использует штатную геометрию и цветовую шкалу GIR. Нажатие на страну меняет активный профиль.", mapHint: "Квантили: низкие → высокие", mapUnavailable: "Геометрия карты временно недоступна; рейтинг и временные ряды продолжают работать.", leaders: "Лидеры среза", selectedContext: "Положение выбранной экономики",
      s3Kicker: "03 · Каталог показателей", s3Title: "Почти 300 официальных измерений", s3Text: "Ищите показатель по названию или коду, фильтруйте по теме и сразу открывайте его сопоставимый страновой срез.",
      searchIndicator: "Поиск показателя", allCategories: "Все темы", showHeadline: "Ключевые", showAll: "Все", indicatorsShown: "Показано показателей", openIndicator: "Открыть показатель", current: "Текущий",
      cat_accounts: "Счета", cat_payments: "Платежи", cat_saving: "Сбережения", cat_borrowing: "Заимствования", cat_resilience: "Устойчивость", cat_connectivity: "Связанность", cat_digital_safety: "Цифровая безопасность", cat_insurance: "Страхование", cat_financial_health: "Финансовое благополучие", cat_other: "Прочее",
      s4Kicker: "04 · Демографические разрывы", s4Title: "Кто остаётся вне цифровых и финансовых услуг", s4Text: "GIR сопоставляет две официальные подгруппы внутри одного показателя и года; разница в процентных пунктах является производным полем.",
      dimension: "Измерение", group_gender: "Гендер", group_income: "Доход", group_age_cat: "Возраст", group_urbanicity: "Местность", group_laborforce: "Рабочая сила", group_education: "Образование", subgroupGap: "Разрыв", largestGaps: "Наибольшие абсолютные разрывы", valueA: "Группа A", valueB: "Группа B", gapFormula: "Разрыв GIR = A − B", noGap: "Для выбранного показателя или года этот разрез недоступен.",
      men: "Мужчины", women: "Женщины", "richest 60%": "Богатейшие 60%", "poorest 40%": "Беднейшие 40%", "age 25+": "Возраст 25+", "ages 15-24": "Возраст 15–24", rural: "Сельская местность", urban: "Города", "in laborforce": "В рабочей силе", "out of laborforce": "Вне рабочей силы", "secondary edu or more": "Среднее образование и выше", "prim edu or less": "Начальное образование и ниже", all: "Все взрослые 15+",
      s5Kicker: "05 · Исторические волны", s5Title: "Динамика без интерполяции", s5Text: "Показываются только опубликованные волны 2011, 2014, 2017, 2021 и 2024 годов. Пропуски остаются пропусками.", trend: "Официальная динамика World Bank", firstWave: "Первая волна", latestWave: "Последняя волна", change: "Изменение", minimum: "Минимум", maximum: "Максимум", noInterpolation: "GIR не интерполирует годы между опросами и не переносит запоздалые наблюдения между волнами.",
      s6Kicker: "06 · Сравнение", s6Title: "Сопоставление до шести экономик", s6Text: "Все линии используют один официальный показатель и один демографический срез.", addEconomy: "Добавить экономику", remove: "Удалить", compareLimit: "Можно выбрать не более шести экономик.", comparisonChart: "Сравнение траекторий", currentComparison: "Последний доступный срез",
      s7Kicker: "07 · Рейтинг", s7Title: "Рейтинг выбранного официального среза", s7Text: "Сортировка и место относятся только к текущему показателю, году и группе населения.", search: "Поиск по стране или коду", sort: "Сортировка", sortRank: "По месту", sortValue: "По значению", sortName: "По названию", shown: "Показано", noResults: "По запросу ничего не найдено.", officialValue: "World Bank · официально", girRank: "Место · GIR", girPercentile: "Процентиль · GIR", openEconomy: "Выбрать экономику",
      s8Kicker: "08 · Методология и происхождение", s8Title: "Как читать Global Findex в GIR", s8Text: "Рабочая область разделяет официальные оценки, производную аналитику GIR и техническое происхождение выпуска.",
      concept: "Что измеряет источник", conceptText: "Global Findex — спросовая база показателей о том, как взрослые пользуются финансовыми услугами и цифровыми технологиями. Это не официальный сводный индекс страны.",
      survey: "Выборка 2025", surveyText: "Редакция основана на национально репрезентативных опросах взрослых 15+ в 141 экономике, проведённых в 2024 году.",
      formula: "Аналитический слой GIR", formulaText: "Соревновательное место: 1, 2, 2, 4. Процентиль = 100 × (N − место) / (N − 1). Разрыв = официальная доля A − официальная доля B.",
      caveat: "Ограничение интерпретации", caveatText: "Более высокая доля обычно означает более широкий доступ или использование, но направление интерпретации зависит от конкретного показателя и не заменяет анализ качества услуг.",
      provenance: "Происхождение выпуска", retrieved: "Получено", sha256: "SHA-256", parser: "Парсер", transformations: "Преобразования", sourceMember: "Исходный файл", period: "Волны", license: "Лицензия", notSpecified: "не указано", officialOrigin: "Официальное значение", girOrigin: "Производные поля", selected: "Выбрано"
    },
    en: {
      loading: "Loading Global Findex", loadingText: "GIR is reading the published local World Bank snapshot and preparing the selected official slice.",
      unavailable: "Global Findex has not been loaded yet", unavailableText: "The backend is installed, but no official World Bank file has been published to GIR's local store.",
      loadCommand: "python -m giip.economy_finance.findex_cli download", importCommand: "python -m giip.economy_finance.findex_cli import-file /path/to/GlobalFindexDatabase2025.xlsx", verifyCommand: "python -m giip.economy_finance.findex_cli verify",
      error: "The Global Findex workspace could not be opened", retry: "Retry", overline: "Economy and finance · official indicator database", title: "Financial inclusion",
      lead: "Accounts, payments, saving, borrowing, financial resilience and digital connectivity, with population-group breakdowns.",
      source: "World Bank · Global Findex Database", official: "Official World Bank estimate", derived: "Rank, percentile and gap calculated by GIR", snapshot: "Local reproducible snapshot",
      qa: "QA FIXTURE · NON-OFFICIAL VALUES", sourceButton: "Official source", dataButton: "Download data", methodButton: "Methodology", exportCsv: "Download CSV",
      economy: "Economy", indicator: "Indicator", year: "Wave", population: "Population slice", release: "Release", value: "Official value", rank: "GIR rank", percentile: "Percentile", economies: "economies",
      noComposite: "Global Findex does not publish one composite country score. Every view refers to one official indicator, year and population slice.",
      navigation: "Global Findex navigation", navPosition: "Position", navMap: "Map", navExplorer: "Indicators", navGaps: "Gaps", navTrend: "Trend", navCompare: "Comparison", navRanking: "Ranking", navMethod: "Methodology",
      s1Kicker: "01 · Economy position", s1Title: "One official slice — no invented composite", s1Text: "The World Bank estimate is shown separately from GIR's competition rank and percentile.",
      rankOf: "Rank among economies", selectedSlice: "Selected slice", coverage: "Coverage", median: "Median", distanceMedian: "Distance from median", higher: "above", lower: "below", percentagePoints: "pp",
      headline: "Headline official indicators", account: "Account ownership", fiAccount: "Financial institution account", mobileAccount: "Mobile money account", notAvailable: "no data",
      s2Kicker: "02 · Spatial distribution", s2Title: "World map of the selected indicator", s2Text: "The map uses GIR's native geometry and colour scale. Select a country to change the active profile.", mapHint: "Quantiles: low → high", mapUnavailable: "Map geometry is temporarily unavailable; ranking and time series remain available.", leaders: "Slice leaders", selectedContext: "Selected economy position",
      s3Kicker: "03 · Indicator catalogue", s3Title: "Almost 300 official measures", s3Text: "Search by label or code, filter by topic and open a comparable country slice immediately.",
      searchIndicator: "Search indicators", allCategories: "All topics", showHeadline: "Headline", showAll: "All", indicatorsShown: "Indicators shown", openIndicator: "Open indicator", current: "Current",
      cat_accounts: "Accounts", cat_payments: "Payments", cat_saving: "Saving", cat_borrowing: "Borrowing", cat_resilience: "Resilience", cat_connectivity: "Connectivity", cat_digital_safety: "Digital safety", cat_insurance: "Insurance", cat_financial_health: "Financial health", cat_other: "Other",
      s4Kicker: "04 · Demographic gaps", s4Title: "Who remains outside digital and financial services", s4Text: "GIR compares two official subgroups for one indicator and year; the percentage-point difference is a derived field.",
      dimension: "Dimension", group_gender: "Gender", group_income: "Income", group_age_cat: "Age", group_urbanicity: "Urbanicity", group_laborforce: "Labour force", group_education: "Education", subgroupGap: "Gap", largestGaps: "Largest absolute gaps", valueA: "Group A", valueB: "Group B", gapFormula: "GIR gap = A − B", noGap: "This breakdown is unavailable for the selected indicator or year.",
      men: "Men", women: "Women", "richest 60%": "Richest 60%", "poorest 40%": "Poorest 40%", "age 25+": "Age 25+", "ages 15-24": "Ages 15–24", rural: "Rural", urban: "Urban", "in laborforce": "In labour force", "out of laborforce": "Out of labour force", "secondary edu or more": "Secondary education or more", "prim edu or less": "Primary education or less", all: "All adults age 15+",
      s5Kicker: "05 · Survey waves", s5Title: "Trend without interpolation", s5Text: "Only published waves for 2011, 2014, 2017, 2021 and 2024 are shown. Missing values remain missing.", trend: "Official World Bank trend", firstWave: "First wave", latestWave: "Latest wave", change: "Change", minimum: "Minimum", maximum: "Maximum", noInterpolation: "GIR does not interpolate between survey waves or move delayed observations between waves.",
      s6Kicker: "06 · Comparison", s6Title: "Compare up to six economies", s6Text: "Every line uses one official indicator and one demographic slice.", addEconomy: "Add economy", remove: "Remove", compareLimit: "Up to six economies can be selected.", comparisonChart: "Trajectory comparison", currentComparison: "Latest available slice",
      s7Kicker: "07 · Ranking", s7Title: "Ranking for the selected official slice", s7Text: "Ordering and rank apply only to the current indicator, year and population group.", search: "Search country or code", sort: "Sort", sortRank: "By rank", sortValue: "By value", sortName: "By name", shown: "Shown", noResults: "No results match the query.", officialValue: "World Bank · official", girRank: "Rank · GIR", girPercentile: "Percentile · GIR", openEconomy: "Select economy",
      s8Kicker: "08 · Methodology and provenance", s8Title: "How to read Global Findex in GIR", s8Text: "The workspace separates official estimates, GIR-derived analytics and technical release provenance.",
      concept: "What the source measures", conceptText: "Global Findex is a demand-side database on how adults use financial services and digital technology. It is not an official composite country index.",
      survey: "2025 sample", surveyText: "The edition is based on nationally representative surveys of adults age 15+ in 141 economies conducted during 2024.",
      formula: "GIR analytical layer", formulaText: "Competition rank: 1, 2, 2, 4. Percentile = 100 × (N − rank) / (N − 1). Gap = official share A − official share B.",
      caveat: "Interpretation limit", caveatText: "A higher share often means broader access or use, but direction depends on the indicator and does not replace analysis of service quality.",
      provenance: "Release provenance", retrieved: "Retrieved", sha256: "SHA-256", parser: "Parser", transformations: "Transformations", sourceMember: "Source file", period: "Waves", license: "License", notSpecified: "not specified", officialOrigin: "Official value", girOrigin: "Derived fields", selected: "Selected"
    }
  };

  const state = {
    root: null, lang: "ru", theme: "dark", token: 0, status: "idle", error: null,
    meta: null, methodology: null, provenance: null, dimensions: null,
    indicators: [], categories: [], years: [], ranking: [], country: null, series: [], compare: [], gaps: null, geo: null,
    indicator: DEFAULT_INDICATOR, year: 2024, group: "all", subgroup: "all", iso3: "", compareIso: [],
    gapGroup: "gender", search: "", sort: "rank", indicatorSearch: "", category: "all", headlineOnly: false
  };

  const t = (key) => I18N[state.lang]?.[key] ?? I18N.ru[key] ?? key;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"}[char]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value) => Number.isFinite(Number(value));
  const pct = (value, digits = 1) => finite(value) ? Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US", {minimumFractionDigits: digits, maximumFractionDigits: digits}) + "%" : "—";
  const signedPp = (value, digits = 1) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US", {minimumFractionDigits: digits, maximumFractionDigits: digits})} ${t("percentagePoints")}` : "—";
  const mean = (values) => { const clean = values.filter(finite).map(Number); return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : null; };
  const median = (values) => { const clean = values.filter(finite).map(Number).sort((a,b)=>a-b); if (!clean.length) return null; const m=Math.floor(clean.length/2); return clean.length%2?clean[m]:(clean[m-1]+clean[m])/2; };

  function isQa() { return Boolean(window.__GIR_FINDEX_QA__ || state.meta?.qa_fixture); }
  function currentIndicator() { return state.indicators.find((item) => item.indicator_code === state.indicator) || {indicator_code: state.indicator, label_en: state.indicator, label_ru: state.indicator, category: "other", orientation: "positive"}; }
  function indicatorLabel(item = currentIndicator()) { return (state.lang === "ru" ? item?.label_ru : item?.label_en) || item?.label_en || item?.indicator_code || "—"; }
  function economyName(row) { return row?.economy_name || row?.economy?.economy_name || row?.name || row?.economy_code || "—"; }
  function currentRow() { return state.ranking.find((row) => row.economy_code === state.iso3) || null; }
  function releaseLabel() { const r=state.meta?.current_release; return r?.edition || r?.release_label || state.meta?.confirmed_edition || "2025"; }
  function subgroupLabel(value) { return t(value) || value; }
  function groupLabel(value) { return value === "all" ? t("all") : t(`group_${value}`); }
  function categoryLabel(value) { return t(`cat_${value || "other"}`); }
  function categoryCount(value) { return state.categories.find((item) => item.category === value)?.indicator_count || 0; }
  function headlineValue(code) { const item = state.country?.indicators?.find((entry) => entry.indicator_code === code); return item?.official_percent; }

  async function request(path, params = {}) {
    const adapter = window.__GIR_FINDEX_QA_ADAPTER__;
    if (adapter?.request) return adapter.request(path, params);
    const url = new URL(`${API_ROOT}${path}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => { if (value == null || value === "") return; url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value)); });
    const response = await fetch(url, {headers: {Accept: "application/json"}, cache: "no-store"});
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { const detail = typeof payload.detail === "string" ? payload.detail : payload.detail?.message || payload.error || `HTTP ${response.status}`; const error = new Error(detail); error.status = response.status; throw error; }
    return payload;
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("country", state.iso3); url.searchParams.set("year", String(state.year));
    url.searchParams.set("findexIndicator", state.indicator); url.searchParams.set("findexGroup", state.group); url.searchParams.set("findexSubgroup", state.subgroup);
    if (state.compareIso.length) url.searchParams.set("findexCompare", state.compareIso.join(","));
    url.hash = "index-GLOBAL_FINDEX";
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  async function loadGeo(token = state.token) {
    const adapter = window.__GIR_FINDEX_QA_ADAPTER__;
    if (adapter?.geo) { try { const geo = await adapter.geo(); if (token === state.token && geo?.type === "FeatureCollection") { state.geo = geo; preserveScrollRender(); } } catch (_error) {} return; }
    for (const url of GEO_URLS) { try { const response = await fetch(url, {cache: "force-cache"}); if (!response.ok) continue; const geo = await response.json(); if (token !== state.token) return; if (geo?.type === "FeatureCollection") { state.geo = geo; preserveScrollRender(); return; } } catch (_error) {} }
  }

  function availableSubgroups(group = state.group) {
    const official = state.dimensions?.official_dimensions?.filter((item) => item.group_code === group).map((item) => item.subgroup_code) || [];
    return official.length ? official : (GROUPS[group] || ["all"]);
  }

  async function loadSlice(token = state.token, requestedYear = state.year) {
    let yearsPayload;
    try { yearsPayload = await request("/years", {indicator: state.indicator, group: state.group, subgroup: state.subgroup}); }
    catch (error) {
      if (state.group !== "all") { state.group = "all"; state.subgroup = "all"; yearsPayload = await request("/years", {indicator: state.indicator, group: "all", subgroup: "all"}); }
      else throw error;
    }
    if (token !== state.token) return;
    state.years = (yearsPayload.years || []).map((item) => Number(item.year)).filter(finite).sort((a,b)=>a-b);
    const year = Number(requestedYear); state.year = state.years.includes(year) ? year : state.years.at(-1);
    const ranking = await request("/ranking", {indicator: state.indicator, year: state.year, group: state.group, subgroup: state.subgroup, limit: 1000});
    if (token !== state.token) return;
    state.ranking = ranking.rows || [];
    if (!state.ranking.some((row) => row.economy_code === state.iso3)) state.country = null;
    state.compareIso = state.compareIso.filter((code) => state.ranking.some((row) => row.economy_code === code));
    if (!state.compareIso.includes(state.iso3)) state.compareIso.unshift(state.iso3);
    while (state.compareIso.length < Math.min(4, state.ranking.length)) { const next = state.ranking.find((row) => !state.compareIso.includes(row.economy_code)); if (!next) break; state.compareIso.push(next.economy_code); }
  }

  async function loadCountry(token = state.token) {
    const [country, series] = await Promise.all([
      request(`/economies/${encodeURIComponent(state.iso3)}`, {year: state.year, group: state.group, subgroup: state.subgroup}),
      request(`/economies/${encodeURIComponent(state.iso3)}/series`, {indicator: state.indicator, group: state.group, subgroup: state.subgroup})
    ]);
    if (token !== state.token) return;
    state.country = country; state.series = series.series || [];
  }

  async function loadCompare(token = state.token) {
    if (state.compareIso.length < 2) { state.compare = []; return; }
    const payload = await request("/compare", {economies: state.compareIso.join(","), indicator: state.indicator, group: state.group, subgroup: state.subgroup});
    if (token === state.token) state.compare = payload.economies || [];
  }

  async function loadGaps(token = state.token) {
    const subgroups = GROUPS[state.gapGroup] || [];
    if (subgroups.length < 2) { state.gaps = null; return; }
    try { const payload = await request("/gaps", {indicator: state.indicator, year: state.year, group: state.gapGroup, subgroup_a: subgroups[0], subgroup_b: subgroups[1]}); if (token === state.token) state.gaps = payload; }
    catch (_error) { if (token === state.token) state.gaps = null; }
  }

  function loadingMarkup() { return `<section class="index-workspace findex-native"><div class="iw-loading"><span class="iw-loading-mark">WB</span><h1>${esc(t("loading"))}</h1><p>${esc(t("loadingText"))}</p></div></section>`; }
  function notLoadedMarkup(meta) { return `<section class="index-workspace findex-native"><div class="iw-error findex-not-loaded"><span class="iw-loading-mark">WB</span><h1>${esc(t("unavailable"))}</h1><p>${esc(t("unavailableText"))}</p><div class="findex-command-stack"><code>${esc(t("loadCommand"))}</code><code>${esc(t("importCommand"))}</code><code>${esc(t("verifyCommand"))}</code></div><div class="iw-hero-actions"><a class="iw-button primary" href="${esc(meta?.source_page_url || SOURCE_URL)}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))}</a></div></div></section>`; }
  function errorMarkup(error) { return `<section class="index-workspace findex-native"><div class="iw-error"><span class="iw-loading-mark">WB</span><h1>${esc(t("error"))}</h1><p>${esc(error?.message || error)}</p><button class="iw-button primary" data-findex-retry type="button">${esc(t("retry"))}</button></div></section>`; }
  function options(items, selected, valueFn, labelFn) { return items.map((item) => { const value=valueFn(item); return `<option value="${esc(value)}" ${String(value)===String(selected)?"selected":""}>${esc(labelFn(item))}</option>`; }).join(""); }

  function controlStripMarkup() {
    const groups = Object.keys(GROUPS).filter((group) => group === "all" || availableSubgroups(group).length);
    const slices = groups.flatMap((group) => availableSubgroups(group).map((subgroup) => ({value: `${group}|${subgroup}`, label: group === "all" ? subgroupLabel(subgroup) : `${groupLabel(group)} · ${subgroupLabel(subgroup)}`})));
    return `<div class="findex-control-strip" aria-label="Global Findex controls">
      <label><span>${esc(t("economy"))}</span><select class="select" data-findex-country>${options(state.ranking, state.iso3, (row)=>row.economy_code, economyName)}</select></label>
      <label><span>${esc(t("indicator"))}</span><select class="select" data-findex-indicator>${options(state.indicators, state.indicator, (item)=>item.indicator_code, (item)=>`${indicatorLabel(item)} · ${item.indicator_code}`)}</select></label>
      <label><span>${esc(t("population"))}</span><select class="select" data-findex-slice>${options(slices, `${state.group}|${state.subgroup}`, (item)=>item.value, (item)=>item.label)}</select></label>
      <label><span>${esc(t("year"))}</span><select class="select" data-findex-year>${state.years.slice().reverse().map((year)=>`<option value="${year}" ${year===state.year?"selected":""}>${year}</option>`).join("")}</select></label>
      <div class="findex-control-meta"><span>${esc(t("release"))}</span><b>Global Findex ${esc(releaseLabel())}</b><small>${state.ranking.length} ${esc(t("economies"))}</small></div>
    </div>`;
  }

  function heroMarkup(row) {
    const csv = `${API_ROOT}/ranking.csv?indicator=${encodeURIComponent(state.indicator)}&year=${state.year}&group=${encodeURIComponent(state.group)}&subgroup=${encodeURIComponent(state.subgroup)}`;
    return `<header class="iw-hero findex-hero"><div class="iw-hero-copy"><p class="iw-overline">${esc(t("overline"))}</p><h1>${esc(t("title"))}</h1><p>${esc(t("lead"))}</p><div class="iw-hero-badges"><span>${esc(t("source"))}</span><span>${esc(t("official"))}</span><span>${esc(t("derived"))}</span>${isQa()?`<strong>${esc(t("qa"))}</strong>`:""}</div><div class="findex-no-composite"><b>≠</b><span>${esc(t("noComposite"))}</span></div></div>
      <div class="iw-hero-score"><span>${esc(t("value"))}</span><strong>${pct(row?.official_percent,1)}</strong><small>${esc(indicatorLabel())}</small><dl><div><dt>${esc(t("rank"))}</dt><dd>${row?.rank ?? "—"}</dd></div><div><dt>${esc(t("percentile"))}</dt><dd>${pct(row?.percentile,0)}</dd></div></dl></div>
      <div class="iw-hero-actions"><a class="iw-button primary" href="${esc(SOURCE_URL)}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))}</a><a class="iw-button" href="${esc(DOWNLOAD_URL)}" target="_blank" rel="noopener noreferrer">${esc(t("dataButton"))}</a><a class="iw-button" href="${esc(csv)}">${esc(t("exportCsv"))}</a></div></header>`;
  }

  function jumpMarkup() { const items=[["#findex-position","navPosition"],["#findex-map","navMap"],["#findex-explorer","navExplorer"],["#findex-gaps","navGaps"],["#findex-trend","navTrend"],["#findex-compare","navCompare"],["#findex-ranking","navRanking"],["#findex-method","navMethod"]]; return `<nav class="iw-jumpbar" aria-label="${esc(t("navigation"))}">${items.map(([id,key])=>`<button type="button" data-findex-jump="${id}">${esc(t(key))}</button>`).join("")}</nav>`; }
  function sectionHeading(kicker,title,text) { return `<div class="iw-section-heading"><p>${esc(kicker)}</p><h2>${esc(title)}</h2><span>${esc(text)}</span></div>`; }

  function headlineCard(code, labelKey) { const value=headlineValue(code); const active=state.indicator===code; return `<button type="button" class="findex-headline-card ${active?"active":""}" data-findex-open-indicator="${code}"><span>${esc(t(labelKey))}</span><strong>${pct(value,1)}</strong><small>${esc(code)}</small><i style="--value:${finite(value)?clamp(value,0,100):0}%"></i></button>`; }
  function positionMarkup(row) {
    const med=median(state.ranking.map((item)=>item.official_percent)); const diff=finite(row?.official_percent)&&finite(med)?row.official_percent-med:null;
    return `<section class="iw-section" id="findex-position">${sectionHeading(t("s1Kicker"),t("s1Title"),t("s1Text"))}<div class="findex-position-grid"><article class="iw-panel findex-position-card"><div class="findex-position-top"><div><span>${esc(economyName(row))}</span><strong>${pct(row?.official_percent,1)}</strong><small>${esc(indicatorLabel())}</small></div><div class="findex-rank-tile"><span>${esc(t("rankOf"))}</span><b>${row?.rank ?? "—"}<em> / ${state.ranking.length}</em></b><small>${pct(row?.percentile,0)} ${esc(t("percentile").toLowerCase())}</small></div></div><div class="findex-position-metrics"><div><span>${esc(t("selectedSlice"))}</span><b>${esc(groupLabel(state.group))}</b><small>${esc(subgroupLabel(state.subgroup))} · ${state.year}</small></div><div><span>${esc(t("median"))}</span><b>${pct(med,1)}</b><small>${state.ranking.length} ${esc(t("economies"))}</small></div><div><span>${esc(t("distanceMedian"))}</span><b>${signedPp(diff,1)}</b><small>${diff>=0?esc(t("higher")):esc(t("lower"))}</small></div></div><div class="findex-origin-strip"><div><span>${esc(t("officialOrigin"))}</span><b>World Bank · ${esc(state.indicator)}</b></div><div><span>${esc(t("girOrigin"))}</span><b>rank · percentile · gap</b></div></div>${row?.value_id?`<button type="button" class="iw-button" data-findex-provenance="${esc(row.value_id)}">${esc(t("provenance"))}</button>`:""}</article>
      <article class="iw-panel findex-headline-panel"><header><span>${esc(t("headline"))}</span><small>2024 · all adults 15+</small></header><div class="findex-headline-grid">${headlineCard("account_t_d","account")}${headlineCard("fiaccount_t_d","fiAccount")}${headlineCard("mobileaccount_t_d","mobileAccount")}</div></article></div></section>`;
  }

  function featureIso(feature) { const p=feature?.properties||{}; return String(p.iso_a3||p.ISO_A3||p.adm0_a3||p.ADM0_A3||p.sov_a3||p.SOV_A3||p.gu_a3||"").toUpperCase(); }
  function projectPoint(point) { const lon=Number(point?.[0]),lat=Number(point?.[1]); return [((lon+180)/360)*960,((90-lat)/180)*480]; }
  function ringPath(ring) { return ring.map((point,index)=>{const [x,y]=projectPoint(point);return `${index?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`;}).join("")+"Z"; }
  function geometryPath(geometry) { if (!geometry) return ""; if (geometry.type==="Polygon") return geometry.coordinates.map(ringPath).join(" "); if (geometry.type==="MultiPolygon") return geometry.coordinates.flatMap((polygon)=>polygon.map(ringPath)).join(" "); return ""; }
  function quantiles(values,bins=7){const sorted=values.filter(finite).map(Number).sort((a,b)=>a-b);return Array.from({length:bins-1},(_,i)=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*(i+1)/bins))]??0);}
  function binFor(value,thresholds){if(!finite(value))return 0;let index=1;for(const threshold of thresholds){if(Number(value)>threshold)index++;}return clamp(index,1,7);}
  function mapSvgMarkup(){
    if(!state.geo?.features?.length)return `<div class="findex-map-unavailable">${esc(t("mapUnavailable"))}</div>`;
    const values=state.ranking.map((row)=>row.official_percent);const thresholds=quantiles(values);const byIso=new Map(state.ranking.map((row)=>[row.economy_code,row]));
    const paths=state.geo.features.map((feature)=>{const iso=featureIso(feature),row=byIso.get(iso),value=row?.official_percent,bin=binFor(value,thresholds),selected=iso===state.iso3;const d=geometryPath(feature.geometry);if(!d)return "";return `<path d="${d}" class="findex-map-country map-bin-${bin} ${selected?"selected":""}" data-findex-map-iso="${esc(iso)}" tabindex="0" role="button" aria-label="${esc(`${economyName(row)||iso}: ${pct(value,1)}`)}"><title>${esc(`${economyName(row)||iso}: ${pct(value,1)}`)}</title></path>`;}).join("");
    return `<svg class="findex-world-map" viewBox="0 0 960 480" role="img" aria-label="${esc(t("s2Title"))}">${paths}</svg>`;
  }
  function mapMarkup(row){const leaders=state.ranking.slice(0,6);return `<section class="iw-section" id="findex-map">${sectionHeading(t("s2Kicker"),t("s2Title"),t("s2Text"))}<div class="findex-map-grid"><article class="iw-panel findex-map-panel"><div class="findex-map-frame">${mapSvgMarkup()}</div><div class="findex-map-legend"><span>${esc(t("mapHint"))}</span>${[1,2,3,4,5,6,7].map((bin)=>`<i class="map-bin-${bin}"></i>`).join("")}</div></article><aside class="iw-panel findex-map-aside"><header><span>${esc(t("leaders"))}</span><small>${state.year}</small></header><ol>${leaders.map((item)=>`<li><button type="button" data-findex-select="${item.economy_code}"><em>${item.rank}</em><span>${esc(economyName(item))}</span><b>${pct(item.official_percent,1)}</b></button></li>`).join("")}</ol><div class="findex-selected-context"><span>${esc(t("selectedContext"))}</span><b>${esc(economyName(row))}</b><strong>${pct(row?.official_percent,1)}</strong><small>#${row?.rank??"—"} · ${pct(row?.percentile,0)}</small></div></aside></div></section>`;}

  function filteredIndicators(){const needle=state.indicatorSearch.trim().toLowerCase();return state.indicators.filter((item)=>{if(state.category!=="all"&&item.category!==state.category)return false;if(state.headlineOnly&&!item.is_headline)return false;if(!needle)return true;return `${item.indicator_code} ${item.label_en||""} ${item.label_ru||""}`.toLowerCase().includes(needle);}).slice(0,80);}
  function explorerMarkup(){const items=filteredIndicators();const categories=CATEGORY_ORDER.filter((cat)=>categoryCount(cat)>0);return `<section class="iw-section" id="findex-explorer">${sectionHeading(t("s3Kicker"),t("s3Title"),t("s3Text"))}<div class="iw-panel findex-explorer-panel"><div class="findex-category-strip"><button type="button" class="${state.category==="all"?"active":""}" data-findex-category="all"><span>${esc(t("allCategories"))}</span><b>${state.indicators.length}</b></button>${categories.map((cat)=>`<button type="button" class="${state.category===cat?"active":""}" data-findex-category="${cat}"><span>${esc(categoryLabel(cat))}</span><b>${categoryCount(cat)}</b></button>`).join("")}</div><div class="findex-explorer-toolbar"><label><span>${esc(t("searchIndicator"))}</span><input class="input" data-findex-indicator-search value="${esc(state.indicatorSearch)}" placeholder="account · payment · mobile"></label><button type="button" class="iw-button ${state.headlineOnly?"primary":""}" data-findex-headline-toggle>${esc(state.headlineOnly?t("showAll"):t("showHeadline"))}</button><small>${esc(t("indicatorsShown"))}: ${items.length} / ${state.indicators.length}</small></div><div class="findex-indicator-list">${items.map((item)=>`<button type="button" class="${item.indicator_code===state.indicator?"active":""}" data-findex-open-indicator="${esc(item.indicator_code)}"><span><i>${esc(categoryLabel(item.category))}</i><strong>${esc(indicatorLabel(item))}</strong><code>${esc(item.indicator_code)}</code></span><em>${item.is_headline?"◆":""}</em><b>${item.indicator_code===state.indicator?esc(t("current")):"→"}</b></button>`).join("")||`<div class="iw-empty">${esc(t("noResults"))}</div>`}</div></div></section>`;}

  function gapsMarkup(){const pairs=GROUPS[state.gapGroup]||[];const rows=state.gaps?.rows||[];const selected=rows.find((row)=>row.economy_code===state.iso3);const maxAbs=Math.max(1,...rows.slice(0,12).map((row)=>Math.abs(row.gap_percentage_points||0)));return `<section class="iw-section" id="findex-gaps">${sectionHeading(t("s4Kicker"),t("s4Title"),t("s4Text"))}<div class="findex-gap-controls">${["gender","income","age_cat","urbanicity","laborforce","education"].map((group)=>`<button type="button" class="${state.gapGroup===group?"active":""}" data-findex-gap-group="${group}">${esc(groupLabel(group))}</button>`).join("")}</div>${rows.length?`<div class="findex-gaps-grid"><article class="iw-panel findex-gap-profile"><header><span>${esc(economyName(currentRow()))}</span><small>${esc(indicatorLabel())} · ${state.year}</small></header><div class="findex-gap-values"><div><span>${esc(subgroupLabel(pairs[0]))}</span><strong>${pct(selected?.value_a*100,1)}</strong><i style="--value:${finite(selected?.value_a)?selected.value_a*100:0}%"></i></div><div><span>${esc(subgroupLabel(pairs[1]))}</span><strong>${pct(selected?.value_b*100,1)}</strong><i style="--value:${finite(selected?.value_b)?selected.value_b*100:0}%"></i></div></div><div class="findex-gap-result"><span>${esc(t("subgroupGap"))}</span><strong>${signedPp(selected?.gap_percentage_points,1)}</strong><small>${esc(t("gapFormula"))}</small></div></article><article class="iw-panel findex-gap-ranking"><header><span>${esc(t("largestGaps"))}</span><small>${esc(groupLabel(state.gapGroup))}</small></header><ol>${rows.slice(0,9).map((row)=>`<li><button type="button" data-findex-select="${row.economy_code}"><span>${esc(economyName(row))}</span><i><b style="width:${Math.abs(row.gap_percentage_points)/maxAbs*100}%"></b></i><em>${signedPp(row.gap_percentage_points,1)}</em></button></li>`).join("")}</ol></article></div>`:`<div class="iw-panel iw-empty">${esc(t("noGap"))}</div>`}</section>`;}

  function lineChartMarkup(seriesList, selectedYear, compact=false){const all=seriesList.flatMap((item)=>item.series||[]).filter((item)=>finite(item.official_percent));if(!all.length)return `<div class="iw-empty">${esc(t("notAvailable"))}</div>`;const years=[...new Set(all.map((item)=>Number(item.year)))].sort((a,b)=>a-b),minY=Math.min(...years),maxY=Math.max(...years);const x=(year)=>50+(Number(year)-minY)/Math.max(1,maxY-minY)*840;const y=(value)=>compact?20+(100-Number(value))*1.25:35+(100-Number(value))*2.55;const height=compact?180:330;const lines=seriesList.map((entry,index)=>{const points=(entry.series||[]).filter((item)=>finite(item.official_percent)).map((item)=>`${x(item.year).toFixed(1)},${y(item.official_percent).toFixed(1)}`).join(" ");const dots=(entry.series||[]).filter((item)=>finite(item.official_percent)).map((item)=>`<circle cx="${x(item.year)}" cy="${y(item.official_percent)}" r="${Number(item.year)===selectedYear?5:3}" class="${SERIES_CLASSES[index%SERIES_CLASSES.length]}"><title>${esc(`${economyName(entry.economy||entry)} · ${item.year}: ${pct(item.official_percent,1)}`)}</title></circle>`).join("");return `<polyline points="${points}" class="findex-chart-line ${SERIES_CLASSES[index%SERIES_CLASSES.length]}"/>${dots}`;}).join("");return `<svg class="findex-line-chart ${compact?"compact":""}" viewBox="0 0 940 ${height}" role="img" aria-label="${esc(t("trend"))}">${[0,25,50,75,100].map((value)=>`<line x1="50" x2="890" y1="${y(value)}" y2="${y(value)}"/><text x="42" y="${y(value)+4}" text-anchor="end">${value}%</text>`).join("")}${years.map((year)=>`<text x="${x(year)}" y="${height-10}" text-anchor="middle">${year}</text>`).join("")}${lines}</svg>`;}
  function trendMarkup(){const values=state.series.map((item)=>item.official_percent).filter(finite),first=state.series[0],last=state.series.at(-1),delta=first&&last?last.official_percent-first.official_percent:null;return `<section class="iw-section" id="findex-trend">${sectionHeading(t("s5Kicker"),t("s5Title"),t("s5Text"))}<div class="findex-trend-grid"><article class="iw-panel findex-chart-panel"><header><span>${esc(t("trend"))}</span><small>${esc(economyName(state.country?.economy))}</small></header>${lineChartMarkup([{economy:state.country?.economy,series:state.series}],state.year)}</article><aside class="iw-panel findex-trend-summary"><dl><div><dt>${esc(t("firstWave"))}</dt><dd>${first?.year??"—"}<small>${pct(first?.official_percent,1)}</small></dd></div><div><dt>${esc(t("latestWave"))}</dt><dd>${last?.year??"—"}<small>${pct(last?.official_percent,1)}</small></dd></div><div><dt>${esc(t("change"))}</dt><dd>${signedPp(delta,1)}</dd></div><div><dt>${esc(t("minimum"))}</dt><dd>${pct(values.length?Math.min(...values):null,1)}</dd></div><div><dt>${esc(t("maximum"))}</dt><dd>${pct(values.length?Math.max(...values):null,1)}</dd></div></dl><div class="findex-wave-strip">${WAVES.map((year)=>`<span class="${state.series.some((item)=>Number(item.year)===year)?"available":""}">${year}</span>`).join("")}</div><p>${esc(t("noInterpolation"))}</p></aside></div></section>`;}

  function compareMarkup(){const candidates=state.ranking.filter((row)=>!state.compareIso.includes(row.economy_code));return `<section class="iw-section" id="findex-compare">${sectionHeading(t("s6Kicker"),t("s6Title"),t("s6Text"))}<div class="findex-compare-toolbar"><label><span>${esc(t("addEconomy"))}</span><select class="select" data-findex-compare-add><option value="">—</option>${options(candidates,"",(row)=>row.economy_code,economyName)}</select></label><small>${esc(t("compareLimit"))}</small></div><div class="findex-comparison-grid"><article class="iw-panel findex-chart-panel"><header><span>${esc(t("comparisonChart"))}</span><small>${esc(indicatorLabel())}</small></header>${lineChartMarkup(state.compare,state.year)}</article><aside class="iw-panel findex-compare-list"><header><span>${esc(t("currentComparison"))}</span><small>${state.year}</small></header>${state.compare.map((item,index)=>{const last=(item.series||[]).find((point)=>Number(point.year)===state.year)||(item.series||[]).at(-1);return `<div><i class="${SERIES_CLASSES[index%SERIES_CLASSES.length]}"></i><button type="button" data-findex-select="${item.economy?.economy_code}">${esc(economyName(item.economy))}</button><b>${pct(last?.official_percent,1)}</b><button type="button" data-findex-compare-remove="${item.economy?.economy_code}" aria-label="${esc(t("remove"))}">×</button></div>`;}).join("")}</aside></div></section>`;}

  function filteredRanking(){const needle=state.search.trim().toLowerCase();let rows=state.ranking.filter((row)=>!needle||`${row.economy_name} ${row.economy_code}`.toLowerCase().includes(needle));rows=rows.slice();if(state.sort==="value")rows.sort((a,b)=>b.official_percent-a.official_percent);else if(state.sort==="name")rows.sort((a,b)=>economyName(a).localeCompare(economyName(b),state.lang));else rows.sort((a,b)=>a.rank-b.rank);return rows;}
  function rankingMarkup(){const rows=filteredRanking();return `<section class="iw-section" id="findex-ranking">${sectionHeading(t("s7Kicker"),t("s7Title"),t("s7Text"))}<div class="iw-table-toolbar"><label><span>${esc(t("search"))}</span><input class="input" data-findex-search value="${esc(state.search)}" placeholder="RUS · Germany"></label><label class="findex-sort-label"><span>${esc(t("sort"))}</span><select class="select" data-findex-sort><option value="rank" ${state.sort==="rank"?"selected":""}>${esc(t("sortRank"))}</option><option value="value" ${state.sort==="value"?"selected":""}>${esc(t("sortValue"))}</option><option value="name" ${state.sort==="name"?"selected":""}>${esc(t("sortName"))}</option></select></label><small>${esc(t("shown"))}: ${rows.length} / ${state.ranking.length}</small></div><div class="iw-table-wrap"><table class="iw-table findex-ranking-table"><thead><tr><th>#</th><th>${esc(t("economy"))}</th><th>${esc(t("officialValue"))}</th><th>${esc(t("girRank"))}</th><th>${esc(t("girPercentile"))}</th><th>${esc(t("provenance"))}</th></tr></thead><tbody>${rows.map((row)=>`<tr class="${row.economy_code===state.iso3?"selected":""}" tabindex="0" data-findex-select="${row.economy_code}" aria-label="${esc(`${t("openEconomy")}: ${economyName(row)}`)}"><td>${row.rank}</td><td><div class="iw-country-cell"><i class="findex-iso-badge">${esc(row.economy_code)}</i><span><b>${esc(economyName(row))}</b><small>${esc(row.region||row.income_group||"")}</small></span></div></td><td><b>${pct(row.official_percent,1)}</b><small>${esc(state.indicator)}</small></td><td>${row.rank}<small>${row.tie_count>1?`=${row.tie_count}`:""}</small></td><td>${pct(row.percentile,0)}</td><td>${row.value_id?`<button type="button" class="iw-button" data-findex-provenance="${esc(row.value_id)}" aria-label="${esc(t("provenance"))}">↗</button>`:""}</td></tr>`).join("")||`<tr><td colspan="6">${esc(t("noResults"))}</td></tr>`}</tbody></table></div></section>`;}

  function provenanceValue(...keys){const release=state.provenance?.release||state.meta?.current_release||{};for(const key of keys){if(release[key]!=null&&release[key]!=="")return release[key];}return null;}
  function methodMarkup(){const transforms=state.meta?.derived_fields||{};return `<section class="iw-section" id="findex-method">${sectionHeading(t("s8Kicker"),t("s8Title"),t("s8Text"))}<div class="iw-method-grid"><article class="iw-panel iw-method-card"><span>01</span><h3>${esc(t("concept"))}</h3><p>${esc(t("conceptText"))}</p></article><article class="iw-panel iw-method-card"><span>02</span><h3>${esc(t("survey"))}</h3><p>${esc(t("surveyText"))}</p></article><article class="iw-panel iw-method-card"><span>03</span><h3>${esc(t("formula"))}</h3><p>${esc(t("formulaText"))}</p></article><article class="iw-panel iw-method-card"><span>04</span><h3>${esc(t("caveat"))}</h3><p>${esc(t("caveatText"))}</p></article></div><article class="iw-panel findex-provenance-panel"><header class="findex-subheading"><div><span>${esc(t("provenance"))}</span><small>${esc(t("snapshot"))}</small></div><a class="iw-button" href="${esc(METHOD_URL)}" target="_blank" rel="noopener noreferrer">${esc(t("methodButton"))}</a></header><dl class="iw-source-list"><div><dt>${esc(t("sourceMember"))}</dt><dd>${esc(provenanceValue("source_filename","source_member")||t("notSpecified"))}</dd></div><div><dt>${esc(t("retrieved"))}</dt><dd>${esc(provenanceValue("acquired_at","retrieved_at")||t("notSpecified"))}</dd></div><div><dt>${esc(t("period"))}</dt><dd>${esc(WAVES.join(" · "))}</dd></div><div><dt>${esc(t("license"))}</dt><dd>CC BY 4.0</dd></div><div><dt>${esc(t("sha256"))}</dt><dd><code>${esc(provenanceValue("source_sha256")||t("notSpecified"))}</code></dd></div><div><dt>${esc(t("parser"))}</dt><dd><code>${esc(provenanceValue("parser_version")||state.meta?.parser_version||t("notSpecified"))}</code></dd></div><div><dt>${esc(t("transformations"))}</dt><dd><code>${esc(Object.values(transforms).filter(Boolean).map((item)=>typeof item==="string"?item:Object.values(item||{}).join(", ")).join(" · ")||t("notSpecified"))}</code></dd></div></dl></article></section>`;}

  function workspaceMarkup(){const row=currentRow();return `<article class="index-workspace findex-native" data-findex-root>${heroMarkup(row)}${controlStripMarkup()}${jumpMarkup()}${positionMarkup(row)}${mapMarkup(row)}${explorerMarkup()}${gapsMarkup()}${trendMarkup()}${compareMarkup()}${rankingMarkup()}${methodMarkup()}<div class="findex-live-region" aria-live="polite" aria-atomic="true"></div></article>`;}
  function announce(message){const node=state.root?.querySelector(".findex-live-region");if(node)node.textContent=message;}
  function preserveScrollRender(){if(!state.root||state.status!=="ready")return;const y=window.scrollY;state.root.innerHTML=workspaceMarkup();bindWorkspace();window.scrollTo(0,y);}

  async function refresh({indicator=state.indicator,year=state.year,group=state.group,subgroup=state.subgroup}={}){
    const token=++state.token;state.indicator=indicator;state.year=Number(year);state.group=group;state.subgroup=subgroup;state.root.innerHTML=loadingMarkup();
    try{await loadSlice(token,state.year);await Promise.all([loadCountry(token),loadCompare(token),loadGaps(token)]);if(token!==state.token)return;state.status="ready";state.root.innerHTML=workspaceMarkup();bindWorkspace();syncUrl();}
    catch(error){if(token!==state.token)return;state.status="error";state.error=error;state.root.innerHTML=errorMarkup(error);bindError();}
  }
  async function selectCountry(code){code=String(code||"").toUpperCase();if(!code||code===state.iso3)return;state.iso3=code;if(!state.compareIso.includes(code))state.compareIso=[code,...state.compareIso].slice(0,MAX_COMPARE);const token=++state.token;state.root.innerHTML=loadingMarkup();try{await Promise.all([loadCountry(token),loadCompare(token)]);if(token!==state.token)return;state.status="ready";state.root.innerHTML=workspaceMarkup();bindWorkspace();syncUrl();announce(`${economyName(currentRow())}: ${pct(currentRow()?.official_percent,1)}`);}catch(error){if(token!==state.token)return;state.root.innerHTML=errorMarkup(error);bindError();}}

  function bindError(){state.root?.querySelector("[data-findex-retry]")?.addEventListener("click",()=>render({root:state.root,lang:state.lang,theme:state.theme,country:state.iso3,year:state.year}));}
  function bindWorkspace(){const root=state.root;if(!root)return;
    root.querySelectorAll("[data-findex-provenance]").forEach((button)=>button.addEventListener("click",(event)=>{event.preventDefault();event.stopPropagation();window.openProvenance?.(button.dataset.findexProvenance,button);}));
    root.querySelector("[data-findex-country]")?.addEventListener("change",(event)=>selectCountry(event.target.value));
    root.querySelector("[data-findex-indicator]")?.addEventListener("change",(event)=>refresh({indicator:event.target.value}));
    root.querySelector("[data-findex-year]")?.addEventListener("change",(event)=>refresh({year:Number(event.target.value)}));
    root.querySelector("[data-findex-slice]")?.addEventListener("change",(event)=>{const [group,subgroup]=event.target.value.split("|");refresh({group,subgroup});});
    root.querySelectorAll("[data-findex-open-indicator]").forEach((button)=>button.addEventListener("click",()=>refresh({indicator:button.dataset.findexOpenIndicator,group:"all",subgroup:"all"})));
    root.querySelectorAll("[data-findex-jump]").forEach((button)=>button.addEventListener("click",()=>root.querySelector(button.dataset.findexJump)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})));
    root.querySelectorAll("[data-findex-select]").forEach((element)=>{const activate=()=>selectCountry(element.dataset.findexSelect);element.addEventListener("click",activate);element.addEventListener("keydown",(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}});});
    root.querySelectorAll("[data-findex-map-iso]").forEach((element)=>{const activate=()=>selectCountry(element.dataset.findexMapIso);element.addEventListener("click",activate);element.addEventListener("keydown",(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate();}});});
    root.querySelectorAll("[data-findex-category]").forEach((button)=>button.addEventListener("click",()=>{state.category=button.dataset.findexCategory;preserveScrollRender();}));
    root.querySelector("[data-findex-headline-toggle]")?.addEventListener("click",()=>{state.headlineOnly=!state.headlineOnly;preserveScrollRender();});
    const indicatorSearch=root.querySelector("[data-findex-indicator-search]");indicatorSearch?.addEventListener("input",(event)=>{state.indicatorSearch=event.target.value;const section=root.querySelector("#findex-explorer");if(section){const y=window.scrollY;section.outerHTML=explorerMarkup();bindWorkspace();window.scrollTo(0,y);const next=state.root.querySelector("[data-findex-indicator-search]");next?.focus();if(next)next.setSelectionRange(next.value.length,next.value.length);}});
    root.querySelectorAll("[data-findex-gap-group]").forEach((button)=>button.addEventListener("click",async()=>{state.gapGroup=button.dataset.findexGapGroup;const token=++state.token;await loadGaps(token);if(token===state.token)preserveScrollRender();}));
    root.querySelector("[data-findex-compare-add]")?.addEventListener("change",async(event)=>{const code=event.target.value;if(!code||state.compareIso.includes(code)||state.compareIso.length>=MAX_COMPARE)return;state.compareIso.push(code);const token=++state.token;await loadCompare(token);if(token===state.token){preserveScrollRender();syncUrl();}});
    root.querySelectorAll("[data-findex-compare-remove]").forEach((button)=>button.addEventListener("click",async()=>{if(state.compareIso.length<=2)return;state.compareIso=state.compareIso.filter((code)=>code!==button.dataset.findexCompareRemove);const token=++state.token;await loadCompare(token);if(token===state.token){preserveScrollRender();syncUrl();}}));
    const search=root.querySelector("[data-findex-search]");search?.addEventListener("input",(event)=>{state.search=event.target.value;const section=root.querySelector("#findex-ranking");if(section){const y=window.scrollY;section.outerHTML=rankingMarkup();bindWorkspace();window.scrollTo(0,y);const next=state.root.querySelector("[data-findex-search]");next?.focus();if(next)next.setSelectionRange(next.value.length,next.value.length);}});
    root.querySelector("[data-findex-sort]")?.addEventListener("change",(event)=>{state.sort=event.target.value;preserveScrollRender();});
  }

  async function initialize(options,token){
    state.lang=options.lang==="en"?"en":"ru";state.theme=options.theme||document.documentElement.dataset.theme||"dark";const params=new URLSearchParams(window.location.search);state.indicator=params.get("findexIndicator")||DEFAULT_INDICATOR;state.iso3=String(options.country||params.get("country")||"").toUpperCase();if(!state.iso3)return;state.group=params.get("findexGroup")||"all";state.subgroup=params.get("findexSubgroup")||"all";state.root.innerHTML=loadingMarkup();
    const meta=await request("/meta");if(token!==state.token)return;state.meta=meta;if(meta.backend_status!=="ready"||!meta.current_release){state.status="not_loaded";state.root.innerHTML=notLoadedMarkup(meta);return;}
    const [indicatorPayload,dimensions,methodology,provenance]=await Promise.all([request("/indicators",{limit:1000}),request("/dimensions"),request("/methodology"),request("/provenance")]);if(token!==state.token)return;
    state.indicators=indicatorPayload.indicators||[];state.categories=indicatorPayload.categories||[];state.dimensions=dimensions;state.methodology=methodology;state.provenance=provenance;if(!state.indicators.some((item)=>item.indicator_code===state.indicator))state.indicator=DEFAULT_INDICATOR;
    const requestedYear=Number(options.year||params.get("year")||2024);const queryCompare=(params.get("findexCompare")||"").split(",").map((value)=>value.trim().toUpperCase()).filter(Boolean);state.compareIso=[state.iso3,...queryCompare].filter((value,index,array)=>value&&array.indexOf(value)===index).slice(0,MAX_COMPARE);
    await loadSlice(token,requestedYear);await Promise.all([loadCountry(token),loadCompare(token),loadGaps(token)]);if(token!==state.token)return;state.status="ready";state.root.innerHTML=workspaceMarkup();bindWorkspace();syncUrl();loadGeo(token);
  }

  async function render(options={}){const root=options.root||document.querySelector("#view");if(!root)return;state.root=root;const token=++state.token;state.status="loading";try{await initialize(options,token);}catch(error){if(token!==state.token)return;state.status="error";state.error=error;root.innerHTML=errorMarkup(error);bindError();}}
  window.GIRFindex=Object.freeze({render});
})();
