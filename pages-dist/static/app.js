const $ = (query, root = document) => root.querySelector(query);
const $$ = (query, root = document) => Array.from(root.querySelectorAll(query));
const INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"];
const SIDEBAR_STORAGE_KEY = "gir-sidebar";
const PRODUCT_NAMES = {
  ru: "GIR — Глобальный рейтинг индексов",
  en: "GIR — Global Index Ranker",
};
const STATIC_INDEX_META = {
  HDI: { code: "HDI", short_name_ru: "ИЧР", short_name_en: "HDI", name_ru: "Индекс человеческого развития", name_en: "Human Development Index" },
  HCI_PLUS: { code: "HCI_PLUS", short_name_ru: "HCI+", short_name_en: "HCI+", name_ru: "Индекс человеческого капитала плюс", name_en: "Human Capital Index Plus" },
  GTCI: { code: "GTCI", short_name_ru: "GTCI", short_name_en: "GTCI", name_ru: "Индекс глобальной конкурентоспособности талантов", name_en: "Global Talent Competitiveness Index" },
  GII: { code: "GII", short_name_ru: "GII", short_name_en: "GII", name_ru: "Глобальный инновационный индекс", name_en: "Global Innovation Index" },
  IDI: { code: "IDI", short_name_ru: "IDI", short_name_en: "IDI", name_ru: "Индекс развития ИКТ", name_en: "ICT Development Index" },
  QS_ET: { code: "QS_ET", short_name_ru: "QS", short_name_en: "QS", name_ru: "QS: инженерия и технологии", name_en: "QS Engineering & Technology" },
  HTEI: { code: "HTEI", short_name_ru: "HTEI", short_name_en: "HTEI", name_ru: "Индекс занятости в высокотехнологичных отраслях", name_en: "High-Tech Employment Index" },
};
const BRAND_ASSETS = {
  ru: {
    dark: { gir: "gir-ru-dark.svg", mgimo: "mgimo-ru-dark.svg", fnisc: "fnisc-ru-dark.svg", priority: "priority-ru-dark.svg", ministry: "minobrnauki-ru-dark.png" },
    light: { gir: "gir-ru-light.svg", mgimo: "mgimo-ru-light.svg", fnisc: "fnisc-ru-light.svg", priority: "priority-ru-light.svg", ministry: "minobrnauki-ru-light.png" },
  },
  en: {
    dark: { gir: "gir-en-dark.svg", mgimo: "mgimo-en-dark.svg", fnisc: "fnisc-en-dark.svg", priority: "priority-en-dark.svg", ministry: "minobrnauki-en-dark.png" },
    light: { gir: "gir-en-light.svg", mgimo: "mgimo-en-light.svg", fnisc: "fnisc-en-light.svg", priority: "priority-en-light.svg", ministry: "minobrnauki-en-light.png" },
  },
};
const NAV_ICONS = {
  landing: "house.svg",
  country: "user-round.svg",
  matrix: "table-2.svg",
  "htei-model": "graduation-cap.svg",
  "policy-center": "briefcase-business.svg",
  "data-lab": "chart-no-axes-combined.svg",
  methodology: "database.svg",
  acceptance: "clipboard-check.svg",
};
let DATA = null;
let PLATFORM_CONTEXT = null;
let PLATFORM_CONTEXT_LOADING = null;
const PLATFORM_CONTEXT_PAGES = new Set(["matrix", "htei-model", "policy-center"]);
let LANDING_SUMMARY = null;
let GEO = null;
let GEO_LOADING = null;
let DATA_LOADING = null;
let LANDING_SUMMARY_LOADING = null;
let HTEI_WORKSPACE = null;
let HTEI_WORKSPACE_KEY = "";
let HTEI_WORKSPACE_LOADING = null;
let sidebarReturnFocus = null;
let drawerReturnFocus = null;
let toastTimer = null;
let staticGlobalBound = false;
window.__GIIP_READY__ = false;

const params = new URLSearchParams(location.search);
const initialLang = params.get("lang") || localStorage.getItem("lang") || (navigator.language || "ru").slice(0, 2);
const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
const state = {
  page: "landing",
  country: (params.get("country") || "RUS").toUpperCase(),
  year: Number(params.get("year") || 0),
  index: normalizeIndex(params.get("index") || "HTEI"),
  lang: initialLang === "en" ? "en" : "ru",
  theme: ["light", "dark"].includes(params.get("theme") || localStorage.getItem("theme")) ? (params.get("theme") || localStorage.getItem("theme")) : preferredTheme,
  trendMetric: "rank",
  hteiMode: params.get("htei_mode") || "common_support",
  rankingOffset: 0,
  rankingPageSize: 25,
  rankingQuery: "",
  matrixRegion: "all",
  matrixIncome: "all",
  matrixGroup: "all",
  matrixMetric: "rank",
  matrixTopN: "",
  matrixSortCode: "HTEI",
  matrixSortDir: "asc",
  matrixQuery: "",
  customBenchmark: [],
  sidebarExpanded: storedSidebar ? storedSidebar === "expanded" : window.innerWidth >= 1440,
  sidebarOverlayOpen: false,
};

const COPY = {
  ru: {
    landing: "Главная",
    country: "Профиль страны",
    commandTitle: "Панель ЛПР по стране",
    commandText: "Сводная аналитика по международным индексам человеческого капитала, талантов, инноваций, цифровой инфраструктуры, инженерно-технологического образования и высокотехнологичной занятости.",
    landingMeta: "GIR объединяет официальные международные индексы, исторические ряды, методологии и рекомендации в единой доказательной среде для принятия решений.",
    matrix: "Сравнение стран",
    methodology: "Методология и источники",
    acceptance: "ТЗ МГИМО / Приёмка",
    hteiModel: "Модель подготовки кадров",
    policyCenter: "Рекомендации России",
    dataLab: "Данные и исследование",
    year: "Год",
    countryLabel: "Страна",
    region: "Регион",
    allRegions: "Все регионы",
    score: "Оценка",
    rank: "Место",
    dataYear: "Год данных",
    source: "Источник",
    sources: "Источники данных",
    formula: "Формула",
    components: "Компоненты",
    componentTree: "Дерево компонентов",
    rawIndicators: "Исходные показатели",
    ranking: "Рейтинг стран",
    fullRanking: "Полный рейтинг",
    asofCoverage: "Диагностическое покрытие ASOF без рейтинга",
    trend: "Динамика",
    rankTrend: "Динамика места",
    scoreTrend: "Динамика оценки",
    map: "Карта мира",
    mapScale: "Квантили: низкие \u2192 высокие",
    recommendations: "Рекомендации",
    weak: "Проседающий компонент",
    strong: "Сильный компонент",
    contribution: "Вклад в итоговую оценку",
    leverage: "Управленческий рычаг",
    diagnostics: "Диагностика",
    provenance: "Происхождение данных",
    retrieved: "Получено",
    snapshot: "Исходный файл",
    checksum: "Контрольная сумма SHA-256",
    darkTheme: "Тёмная тема",
    lightTheme: "Светлая тема",
    close: "Закрыть",
    notAvailable: "нет данных",
    topLevers: "Три главных рычага улучшения позиции",
    riskIndices: "Индексы риска",
    quickLevers: "Быстрые управленческие рычаги",
    longLevers: "Долгосрочные структурные рычаги",
    why: "Почему это важно",
    peer: "Фронтир / топ-10",
    qsUniversities: "Вузы QS Engineering & Technology",
    dataQuality: "Качество и свежесть данных",
    releaseReadiness: "Готовность к передаче заказчику",
    releaseBlockers: "Блокирующие замечания P0",
    tzBlock: "Блоки исходного ТЗ МГИМО",
    exportBrief: "Экспортировать справку",
    search: "Поиск страны",
    official: "официальное значение",
    derived: "аналитическая агрегация",
    projectIndex: "авторский индекс проекта",
    historicalOfficial: "официальное значение — историческая редакция",
    diagnosticDecomposition: "аналитическая диагностическая декомпозиция",
    confidence: "Доверие к данным",
    coverage: "Покрытие",
    uncertainty: "Неопределённость",
    noSynchronousRank: "Место не присваивается: диагностический ASOF-профиль",
    directCore: "Прямой слой",
    commonSupport: "Единое сопоставимое пространство",
    proxyExtended: "Расширенное proxy-пространство",
    comparableCore: "Единое сопоставимое пространство",
    comparableExtended: "Расширенное proxy-пространство",
    asofDiagnostic: "Диагностический ASOF-профиль",
    rowsPerPage: "Строк на странице",
    previous: "Назад",
    next: "Далее",
    page: "Страница",
    methodologyStatus: "Методический статус",
    valueType: "Тип значения",
    hteiExact: "Индекс занятости в высокотехнологичных отраслях (High-tech employment index)",
    navOverview: "Обзор",
    navIndices: "Индексы",
    navAnalytics: "Аналитика",
    navMethodology: "Методология",
    openNavigation: "Открыть навигацию",
    closeNavigation: "Закрыть навигацию",
    expandNavigation: "Развернуть навигацию",
    collapseNavigation: "Свернуть навигацию",
    contextLabel: "Контекст анализа",
  },
  en: {
    landing: "Home",
    country: "Country profile",
    commandTitle: "Country command center",
    commandText: "Integrated analytics across human development, human capital, talent, innovation, digital infrastructure, engineering education and high-tech employment.",
    landingMeta: "GIR brings official international indices, historical series, methodologies and recommendations into one evidence environment for decision-making.",
    matrix: "Country comparison",
    methodology: "Methodology and sources",
    acceptance: "MGIMO ToR / Acceptance",
    hteiModel: "Training-system model",
    policyCenter: "Russia recommendations",
    dataLab: "Data & research",
    year: "Year",
    countryLabel: "Country",
    region: "Region",
    allRegions: "All regions",
    score: "Score",
    rank: "Rank",
    dataYear: "Data year",
    source: "Source",
    sources: "Data sources",
    formula: "Formula",
    components: "Components",
    componentTree: "Component tree",
    rawIndicators: "Raw indicators",
    ranking: "Country ranking",
    fullRanking: "Full ranking",
    asofCoverage: "ASOF diagnostic coverage without ranking",
    trend: "Trend",
    rankTrend: "Rank trend",
    scoreTrend: "Score trend",
    map: "World map",
    mapScale: "Quantiles: lower \u2192 higher",
    recommendations: "Recommendations",
    weak: "Weak component",
    strong: "Strong component",
    contribution: "Contribution to score",
    leverage: "Policy lever",
    diagnostics: "Diagnostics",
    provenance: "Data provenance",
    retrieved: "Retrieved",
    snapshot: "Raw snapshot",
    checksum: "SHA-256 checksum",
    darkTheme: "Dark theme",
    lightTheme: "Light theme",
    close: "Close",
    notAvailable: "not available",
    topLevers: "Top three levers to improve rank",
    riskIndices: "Risk indices",
    quickLevers: "Quick policy levers",
    longLevers: "Long-term structural levers",
    why: "Why it matters",
    peer: "Frontier / top-10",
    qsUniversities: "QS Engineering & Technology universities",
    dataQuality: "Data quality and freshness",
    releaseReadiness: "Customer release readiness",
    releaseBlockers: "P0 release blockers",
    tzBlock: "Original MGIMO ToR blocks",
    exportBrief: "Export brief",
    search: "Country search",
    official: "official value",
    derived: "analytical aggregation",
    projectIndex: "project composite index",
    historicalOfficial: "official value — historical edition",
    diagnosticDecomposition: "analytical diagnostic decomposition",
    confidence: "Data confidence",
    coverage: "Coverage",
    uncertainty: "Uncertainty",
    noSynchronousRank: "No rank is assigned: diagnostic ASOF profile",
    directCore: "Direct-data tier",
    commonSupport: "Common-support universe",
    proxyExtended: "Extended proxy universe",
    comparableCore: "Common-support universe",
    comparableExtended: "Extended proxy universe",
    asofDiagnostic: "Diagnostic ASOF profile",
    rowsPerPage: "Rows per page",
    previous: "Previous",
    next: "Next",
    page: "Page",
    methodologyStatus: "Methodological status",
    valueType: "Value type",
    hteiExact: "High-Tech Employment Index",
    navOverview: "Overview",
    navIndices: "Indices",
    navAnalytics: "Analytics",
    navMethodology: "Methodology",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    expandNavigation: "Expand navigation",
    collapseNavigation: "Collapse navigation",
    contextLabel: "Analysis context",
  },
};

function t(key) { return COPY[state.lang][key] || key; }
function normalizeIndex(code) {
  const value = String(code || "").toUpperCase().replace(/[-\s]/g, "_");
  if (["QS", "QSET", "QS_E_T"].includes(value)) return "QS_ET";
  return INDEX_ORDER.includes(value) ? value : "HTEI";
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fmt(value, digits = 1) { return value == null || Number.isNaN(Number(value)) ? "—" : Number(value).toFixed(digits); }
function intFmt(value) { return value == null ? "—" : Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US"); }
function isStandardIndexPage(page) { return page.startsWith("index-") && normalizeIndex(page.replace("index-", "")) !== "HTEI"; }
function pageUsesPlatformContext(page) { return PLATFORM_CONTEXT_PAGES.has(page) || isStandardIndexPage(page); }
function activeContext() { return DATA || PLATFORM_CONTEXT || { countries: [], years: [], indices: [], regions: [], income_groups: [] }; }
function byCode(code) { return DATA?.indices?.find((item) => item.code === code) || PLATFORM_CONTEXT?.indices?.find((item) => item.code === code) || STATIC_INDEX_META[code] || { code, short_name_ru: code, short_name_en: code, name_ru: code, name_en: code }; }
function indexPayload(code) { return DATA.index_payloads[code]; }
function countryName(country) { return state.lang === "ru" ? country.name_ru : country.name_en; }
function componentName(component) { return state.lang === "ru" ? component.name_ru : component.name_en; }
function indexLabel(code) { const idx = byCode(code); return idx ? (state.lang === "ru" ? idx.short_name_ru : idx.short_name_en) : code; }
function indexFullName(index) { return state.lang === "ru" ? index.name_ru : index.name_en; }
function incomeGroupLabel(value) {
  if (state.lang !== "ru") return value;
  return ({
    "High income": "Высокий доход",
    "Upper middle income": "Доход выше среднего",
    "Lower middle income": "Доход ниже среднего",
    "Low income": "Низкий доход",
    "Not classified": "Не классифицировано",
  })[value] || value;
}
function yearNote(valueYear, requestedYear = state.year) { return valueYear ? `${t("dataYear")}: ${valueYear}${Number(valueYear) === Number(requestedYear) ? "" : ` / ${requestedYear}`}` : ""; }
function initialCountryName() { return state.country === "RUS" ? (state.lang === "ru" ? "\u0420\u043e\u0441\u0441\u0438\u044f" : "Russia") : state.country; }
function renderLoadingShell() {
  document.documentElement.lang = state.lang;
  const langBtn = $("#langBtn");
  if (langBtn) langBtn.textContent = state.lang.toUpperCase();
  applyBrandAssets();
  renderContextBar();
  setSidebarUI();
  $("#view").innerHTML = `<section class="hero"><div class="card hero-main"><h1>${t("commandTitle")}: ${escapeHtml(initialCountryName())}</h1><p class="muted">${state.lang === "ru" ? "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445" : "Loading data"}</p></div></section>`;
}
function renderLoadError(err) {
  window.__GIIP_READY__ = false;
  document.documentElement.dataset.appReady = "error";
  $("#view").innerHTML = `<div class="card"><h2>${state.lang === "ru" ? "Ошибка загрузки" : "Load error"}</h2><pre>${escapeHtml(err?.stack || err?.message || err)}</pre></div>`;
}
function flagIso2(country) {
  const direct = String(country?.iso2 || "").trim().toLowerCase();
  if (/^[a-z]{2}$/.test(direct)) return direct;
  const iso3 = String(country?.iso3 || "").trim().toUpperCase();
  const match = activeContext().countries?.find((item) => item.iso3 === iso3);
  const resolved = String(match?.iso2 || "").trim().toLowerCase();
  return /^[a-z]{2}$/.test(resolved) ? resolved : "";
}
function flagImage(country, className = "flag-img") {
  const iso2 = flagIso2(country);
  const label = escapeHtml(countryName(country));
  const iso = escapeHtml(String(country?.iso3 || iso2 || "").toUpperCase());
  if (!iso2) return `<span class="${className} flag-fallback" aria-label="${label}">${iso}</span>`;
  const size = className.includes("big") ? "big" : "inline";
  return `<span class="flag-slot ${size}"><img class="${className}" src="static/flags/${iso2}.svg" alt="${label}" loading="lazy" decoding="async" data-flag-image><span class="flag-fallback ${size}" aria-label="${label}">${iso}</span></span>`;
}
function cleanSelectText(text) { return String(text || "").replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").trim(); }
function selectShell(selectHtml, label) { return `<span class="select-shell">${selectHtml}<span class="select-display" aria-hidden="true">${escapeHtml(cleanSelectText(label))}</span></span>`; }
function syncSelectDisplay(select) {
  const display = select.closest(".select-shell")?.querySelector(".select-display");
  if (!display) return;
  display.textContent = cleanSelectText(select.selectedOptions[0]?.textContent || select.value);
  if (select.id === "countrySelect") {
    const country = DATA?.countries?.find((item) => item.iso3 === select.value);
    const iso2 = flagIso2(country);
    const image = iso2 ? `url("static/flags/${iso2}.svg")` : "none";
    select.classList.add("country-select");
    display.classList.add("country-select-display");
    select.style.setProperty("--country-flag-url", image);
    display.style.setProperty("--country-flag-url", image);
  }
}
function syncAllSelectDisplays() { document.querySelectorAll("select.select").forEach(syncSelectDisplay); }
function valueType(index) {
  const status = String(index?.score_status || index?.official_or_derived || "");
  if (status === "project_composite_index" || status === "project_index_required_by_TZ") return t("projectIndex");
  if (status.includes("historical")) return t("historicalOfficial");
  if (status === "derived_country_aggregation") return t("derived");
  return t("official");
}
function methodologyLabel(index) {
  if (!index) return "";
  return escapeHtml(state.lang === "ru" ? (index.label_ru || "") : (index.label_en || ""));
}
function methodologyWarning(index) {
  if (!index) return "";
  const warning = state.lang === "ru" ? index.warning_ru : index.warning_en;
  return warning ? `<div class="soft-note methodology-warning"><b>${t("methodologyStatus")}</b><br>${escapeHtml(warning)}</div>` : "";
}
function hteiModeLabel(mode) {
  if (mode === "direct_core") return t("directCore");
  if (mode === "proxy_extended" || mode === "comparable_extended") return t("proxyExtended");
  if (mode === "asof_diagnostic") return t("asofDiagnostic");
  return t("commonSupport");
}
function hteiModeSelector(payload) {
  const fallback = payload?.scientific_profile?.fallback_mode;
  const note = fallback ? (state.lang === "ru" ? `Для выбранной страны автоматически показан режим «${hteiModeLabel(fallback)}».` : `The selected country is shown using the “${hteiModeLabel(fallback)}” fallback.`) : "";
  const options = [["direct_core",t("directCore")],["common_support",t("commonSupport")],["proxy_extended",t("proxyExtended")],["asof_diagnostic",t("asofDiagnostic")]];
  return `<label>${state.lang === "ru" ? "Режим HTEI" : "HTEI mode"}: ${selectShell(`<select id="hteiMode" class="select" aria-label="HTEI mode">${options.map(([value,label])=>`<option value="${value}" ${state.hteiMode===value?"selected":""}>${escapeHtml(label)}</option>`).join("")}</select>`, hteiModeLabel(state.hteiMode))}</label>${note?`<span class="tiny muted mode-fallback-note">${escapeHtml(note)}</span>`:""}`;
}

function setImageSource(nodes, src, alt) {
  nodes.forEach((node) => {
    node.src = src;
    if (alt != null) node.alt = alt;
  });
}

function applyBrandAssets() {
  const assets = BRAND_ASSETS[state.lang][state.theme];
  const prefix = "static/brand/";
  const alts = state.lang === "ru"
    ? {
        mgimo: "Московский государственный институт международных отношений (университет) МИД России",
        fnisc: "Федеральный научно-исследовательский социологический центр Российской академии наук (ФНИСЦ РАН)",
        priority: "Программа стратегического академического лидерства «Приоритет-2030»",
        ministry: "Министерство науки и высшего образования Российской Федерации",
      }
    : {
        mgimo: "MGIMO University",
        fnisc: "Federal Center of Theoretical and Applied Sociology of the Russian Academy of Sciences (FCTAS RAS)",
        priority: "Priority 2030 Strategic Academic Leadership Program",
        ministry: "Ministry of Science and Higher Education of the Russian Federation",
      };
  setImageSource($$("[data-gir-logo]"), prefix + assets.gir, PRODUCT_NAMES[state.lang]);
  Object.keys(alts).forEach((key) => {
    const nodes = $$(`[data-logo="${key}"]`);
    setImageSource(nodes, prefix + assets[key], alts[key]);
    nodes.forEach((node) => {
      node.title = alts[key];
      const link = node.closest("a");
      if (link) link.setAttribute("aria-label", alts[key]);
    });
  });
  $$("[data-gir-logo]").forEach((node) => { node.title = PRODUCT_NAMES[state.lang]; });
  $$(".header-gir-home").forEach((link) => link.setAttribute("aria-label", PRODUCT_NAMES[state.lang]));
  document.title = state.page === "landing" ? PRODUCT_NAMES[state.lang] : `${currentPageLabel()} · ${PRODUCT_NAMES[state.lang]}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    if (state.page === "landing") description.content = t("landingMeta");
    else if (state.page === "methodology") description.content = state.lang === "ru"
      ? "Методология GIR: источники, данные, формулы индексов, авторские модели, provenance, качество и ограничения интерпретации."
      : "GIR methodology: sources, data, index formulae, project models, provenance, quality and interpretation limits.";
    else description.content = t("commandText");
  }
  const footerBrand = $("#footerBrand");
  if (footerBrand) footerBrand.textContent = state.lang === "ru" ? "© 2026 GIR / МГИМО — ФНИСЦ РАН" : "© 2026 GIR / MGIMO — FCTAS RAS";
  const themeIcon = $("#themeIcon");
  if (themeIcon) themeIcon.src = state.theme === "dark" ? "static/icons/sun.svg" : "static/icons/moon.svg";
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = state.theme === "dark" ? "#0A132D" : "#FFFFFF";
}

function currentPageLabel() {
  if (state.page === "landing") return t("landing");
  if (state.page === "country") return t("country");
  if (state.page === "matrix") return t("matrix");
  if (state.page === "htei-model") return t("hteiModel");
  if (state.page === "policy-center") return t("policyCenter");
  if (state.page === "methodology") return t("methodology");
  if (state.page === "acceptance") return t("acceptance");
  if (state.page.startsWith("index-")) {
    const idx = byCode(normalizeIndex(state.page.replace("index-", "")));
    return idx ? indexFullName(idx) : state.index;
  }
  return PRODUCT_NAMES[state.lang];
}

function renderContextBar() {
  const bar = $("#contextBar");
  if (!bar) return;
  const isIndependentPage = state.page === "landing" || state.page === "methodology";
  bar.hidden = isIndependentPage;
  if (isIndependentPage) { bar.replaceChildren(); return; }
  const ctx = activeContext();
  const selected = (ctx.countries || []).find((item) => item.iso3 === state.country) || { iso3: state.country, name_ru: initialCountryName(), name_en: initialCountryName() };
  if (state.page === "policy-center") {
    const russia = (ctx.countries || []).find((item) => item.iso3 === "RUS") || selected;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div>
      <div class="context-controls context-fixed-controls"><div class="context-fixed"><span>${t("countryLabel")}</span><strong>${escapeHtml(countryName(russia))}</strong></div><div class="context-fixed"><span>${state.lang === "ru" ? "Период программы" : "Programme horizon"}</span><strong>2026–2030</strong></div></div>`;
    return;
  }
  if (state.page === "matrix") {
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div>
      <div class="context-controls context-fixed-controls"><label><span>${t("year")}</span>${selectShell(`<select id="yearSelect" class="select context-year" aria-label="${t("year")}">${yearsOptions()}</select>`, state.year)}</label><div class="context-fixed"><span>${state.lang === "ru" ? "Масштаб сравнения" : "Comparison scale"}</span><strong>${state.lang === "ru" ? "Процентиль 0–100" : "Percentile 0–100"}</strong></div></div>`;
    return;
  }
  if (!(ctx.countries || []).length) {
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(initialCountryName())}</strong></div>`;
    return;
  }
  bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}">${countryOptions()}</select>`, countryName(selected))}</label><label><span>${t("year")}</span>${selectShell(`<select id="yearSelect" class="select context-year" aria-label="${t("year")}">${yearsOptions()}</select>`, state.year)}</label></div>`;
}

function bindContextControls() {
  const countrySelect = $("#countrySelect");
  if (countrySelect) countrySelect.onchange = (event) => {
    state.country = event.target.value;
    if (isStandardIndexPage(state.page)) { window.GIRIndexWorkspace?.invalidate?.(state.index, state.country, state.year); render(); }
    else if (state.page === "htei-model") { window.GIRStage4?.invalidateTraining?.(state.country, state.year); render(); }
    else refreshData().then(render).catch(renderLoadError);
  };
  const yearSelect = $("#yearSelect");
  if (yearSelect) yearSelect.onchange = (event) => {
    state.year = Number(event.target.value);
    if (state.page === "matrix" || isStandardIndexPage(state.page) || state.page === "htei-model") render();
    else refreshData().then(render).catch(renderLoadError);
  };
  syncAllSelectDisplays();
}

function sidebarIsOverlay() { return window.innerWidth < 1024; }

function setSidebarUI() {
  const overlayOpen = sidebarIsOverlay() && state.sidebarOverlayOpen;
  document.documentElement.dataset.sidebar = state.sidebarExpanded ? "expanded" : "collapsed";
  document.documentElement.classList.toggle("sidebar-overlay-open", overlayOpen);
  const expandedForAria = sidebarIsOverlay() ? overlayOpen : state.sidebarExpanded;
  const toggle = $("#sidebarToggle");
  const mobile = $("#mobileMenuBtn");
  const toggleIcon = $("#sidebarToggleIcon");
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(expandedForAria));
    toggle.setAttribute("aria-label", expandedForAria ? t("collapseNavigation") : t("expandNavigation"));
  }
  if (mobile) {
    mobile.setAttribute("aria-expanded", String(overlayOpen));
    mobile.setAttribute("aria-label", overlayOpen ? t("closeNavigation") : t("openNavigation"));
  }
  if (toggleIcon) toggleIcon.src = expandedForAria ? "static/icons/panel-left-close.svg" : "static/icons/panel-left-open.svg";
}

function openSidebarOverlay(origin) {
  sidebarReturnFocus = origin || document.activeElement;
  state.sidebarOverlayOpen = true;
  setSidebarUI();
  window.setTimeout(() => $("#sidebar a, #sidebar button")?.focus(), 0);
}

function closeSidebarOverlay({ restoreFocus = true } = {}) {
  if (!state.sidebarOverlayOpen) return;
  state.sidebarOverlayOpen = false;
  setSidebarUI();
  if (restoreFocus && sidebarReturnFocus?.focus) sidebarReturnFocus.focus();
  sidebarReturnFocus = null;
}

function toggleSidebar(origin) {
  if (sidebarIsOverlay()) {
    if (state.sidebarOverlayOpen) closeSidebarOverlay(); else openSidebarOverlay(origin);
    return;
  }
  state.sidebarExpanded = !state.sidebarExpanded;
  localStorage.setItem(SIDEBAR_STORAGE_KEY, state.sidebarExpanded ? "expanded" : "collapsed");
  setSidebarUI();
}

function navGroups() {
  return [
    { label: t("navOverview"), items: [{ key: "landing", label: t("landing") }, { key: "country", label: t("country") }, { key: "matrix", label: t("matrix") }] },
    { label: t("navIndices"), items: INDEX_ORDER.map((code) => ({ key: `index-${code}`, label: indexFullName(byCode(code)), code })) },
    { label: t("navAnalytics"), items: [{ key: "htei-model", label: t("hteiModel") }, { key: "policy-center", label: t("policyCenter") }] },
    { label: t("navMethodology"), items: [{ key: "methodology", label: t("methodology") }, { key: "data-lab", label: t("dataLab"), href: "data-lab.html" }] },
  ];
}

function countryOptions() { return (activeContext().countries || []).map((c) => `<option value="${c.iso3}" ${c.iso3 === state.country ? "selected" : ""}>${escapeHtml(countryName(c))}</option>`).join(""); }
function yearsOptions() { return (activeContext().years || []).map((year) => `<option value="${year}" ${Number(year) === Number(state.year) ? "selected" : ""}>${year}</option>`).join(""); }
function selectors(extra = "") {
  return extra ? `<div class="toolbar">${extra}</div>` : "";
}

function setTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("theme", state.theme);
  const themeBtn = $("#themeBtn");
  if (themeBtn) {
    themeBtn.title = state.theme === "dark" ? t("lightTheme") : t("darkTheme");
    themeBtn.setAttribute("aria-label", themeBtn.title);
  }
  applyBrandAssets();
}
function setLang() {
  document.documentElement.lang = state.lang;
  localStorage.setItem("lang", state.lang);
  $("#langBtn").textContent = state.lang.toUpperCase();
  $("#footerIndices").textContent = (DATA || PLATFORM_CONTEXT) ? INDEX_ORDER.map(indexLabel).join(" · ") : "";
  const skip = document.querySelector("[data-skip-link]");
  if (skip) skip.textContent = state.lang === "ru" ? "Перейти к основному содержанию" : "Skip to main content";
  applyBrandAssets();
  window.GIRCooperation?.updateLocale?.(state.lang);
  setSidebarUI();
}
function pageFromParams() {
  const hash = location.hash.replace("#", "");
  if (hash) return hash;
  if (params.get("index")) return `index-${state.index}`;
  if (params.has("country") || params.has("year")) return "country";
  return "landing";
}
async function load() {
  window.__GIIP_READY__ = false;
  document.documentElement.dataset.appReady = "false";
  document.documentElement.dataset.theme = state.theme;
  state.page = pageFromParams();
  if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && !sidebarIsOverlay()) {
    state.sidebarExpanded = state.page === "landing" ? false : window.innerWidth >= 1440;
  }
  window.GIRCooperation?.init?.({ getLang: () => state.lang });
  window.GIRCooperation?.bindTriggers?.(document);
  bindStatic();
  setTheme(); setLang(); bindStatic(); renderNav();

  if (!pageNeedsAppData(state.page)) {
    if (pageUsesPlatformContext(state.page)) {
      renderLoadingShell();
      await ensurePlatformContext();
      if (!state.year) state.year = PLATFORM_CONTEXT.default_year;
    }
    const renderResult = render();
    if (renderResult?.then) await renderResult;
    window.__GIIP_READY__ = true;
    document.documentElement.dataset.appReady = "true";
    window.dispatchEvent(new CustomEvent("giip:ready", { detail: { country: state.country, year: state.year, page: state.page } }));
    if (state.page === "landing") {
      ensureLandingSummary().then(() => { if (state.page === "landing") renderLanding(); }).catch((err) => console.error("Landing summary load failed", err));
    }
    return;
  }

  renderLoadingShell();
  await ensureData();
  setTheme(); setLang(); bindStatic(); renderNav(); render();
  window.__GIIP_READY__ = true;
  document.documentElement.dataset.appReady = "true";
  window.dispatchEvent(new CustomEvent("giip:ready", { detail: { country: state.country, year: state.year, page: state.page } }));
  if (pageNeedsGeo(state.page)) ensureGeo().then(() => render()).catch((err) => console.error("GeoJSON load failed", err));
}
function ensureLandingSummary() {
  if (LANDING_SUMMARY) return Promise.resolve(LANDING_SUMMARY);
  if (!LANDING_SUMMARY_LOADING) {
    LANDING_SUMMARY_LOADING = fetch(`/api/landing-summary?country=RUS`)
      .then((response) => {
        if (!response.ok) throw new Error(`Landing summary HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        LANDING_SUMMARY = payload;
        return payload;
      })
      .finally(() => { LANDING_SUMMARY_LOADING = null; });
  }
  return LANDING_SUMMARY_LOADING;
}

function ensureData() {
  if (DATA) return Promise.resolve(DATA);
  if (!DATA_LOADING) {
    DATA_LOADING = refreshData()
      .then(() => DATA)
      .finally(() => { DATA_LOADING = null; });
  }
  return DATA_LOADING;
}
function ensurePlatformContext() {
  if (PLATFORM_CONTEXT) return Promise.resolve(PLATFORM_CONTEXT);
  if (!PLATFORM_CONTEXT_LOADING) {
    PLATFORM_CONTEXT_LOADING = fetch("/api/platform-context", { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error(`Platform context HTTP ${response.status}`); return response.json(); })
      .then((value) => { PLATFORM_CONTEXT = value; if (!state.year) state.year = value.default_year; return value; })
      .finally(() => { PLATFORM_CONTEXT_LOADING = null; });
  }
  return PLATFORM_CONTEXT_LOADING;
}
function pageNeedsAppData(page) { return page === "country" || page === "index-HTEI" || page === "acceptance"; }
function pageNeedsGeo(page) { return page === "country" || page === "index-HTEI"; }
function ensureGeo() {
  if (GEO) return Promise.resolve(GEO);
  if (!GEO_LOADING) {
    GEO_LOADING = fetch("/world.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
        return response.json();
      })
      .then((geojson) => {
        GEO = geojson;
        return GEO;
      })
      .catch((err) => {
        GEO_LOADING = null;
        throw err;
      });
  }
  return GEO_LOADING;
}
async function refreshData() {
  const yearParam = state.year ? `&year=${state.year}` : "";
  const response = await fetch(`/api/app-data?country=${state.country}${yearParam}`);
  if (!response.ok) throw new Error(`App data HTTP ${response.status}`);
  DATA = await response.json();
  state.year = DATA.requested_year || DATA.default_year;
  state.country = DATA.country.country.iso3;
  invalidateHteiWorkspace();
  renderContextBar();
  syncAllSelectDisplays();
}
async function refreshMatrixData() {
  const query = new URLSearchParams({
    year: String(state.year),
    group: state.matrixGroup || "all",
    income_group: state.matrixIncome || "all",
    metric: state.matrixMetric || "rank",
    sort_index: state.matrixSortCode || "HTEI",
    sort_metric: state.matrixMetric || "rank",
    sort_dir: state.matrixSortDir || "asc",
    lang: state.lang,
  });
  if (state.matrixTopN) query.set("topN", String(state.matrixTopN));
  if (state.matrixRegion && state.matrixRegion !== "all") query.set("region", state.matrixRegion);
  if (state.matrixQuery) query.set("q", state.matrixQuery);
  const response = await fetch(`/api/cross-matrix?${query.toString()}`);
  const matrixPayload = await response.json();
  if (DATA) DATA.cross_matrix = matrixPayload;
  if (state.page === "matrix") renderMatrix();
}
function delegatedActionTarget(event) {
  const target = event.target instanceof Element ? event.target.closest("[data-gir-action]") : null;
  return target && document.documentElement.contains(target) ? target : null;
}
function runDelegatedAction(control, event) {
  if (!control) return false;
  const action = control.dataset.girAction;
  if (!action) return false;
  if (action === "route") { event.preventDefault(); routeTo(control.dataset.route || "landing"); return true; }
  if (action === "provenance") { event.preventDefault(); openProvenance(control.dataset.valueId || "", control); return true; }
  if (action === "country") { event.preventDefault(); goCountry(control.dataset.iso || "RUS"); return true; }
  if (action === "sort-matrix") { event.preventDefault(); sortMatrix(control.dataset.code || "HTEI"); return true; }
  if (action === "map-country") { event.preventDefault(); selectMapCountry(control.dataset.iso || "RUS", event); return true; }
  return false;
}
function bindStatic() {
  $("#themeBtn").onclick = () => { state.theme = state.theme === "dark" ? "light" : "dark"; setTheme(); (!pageNeedsAppData(state.page) || DATA) ? render() : renderLoadingShell(); };
  $("#langBtn").onclick = () => { state.lang = state.lang === "ru" ? "en" : "ru"; setLang(); if (!pageNeedsAppData(state.page) || DATA) { renderNav(); render(); } else { renderLoadingShell(); } };
  $("#sidebarToggle").onclick = (event) => toggleSidebar(event.currentTarget);
  $("#mobileMenuBtn").onclick = (event) => toggleSidebar(event.currentTarget);
  $("#sidebarBackdrop").onclick = () => closeSidebarOverlay();
  $$(".header-gir-home").forEach((link) => {
    link.onclick = (event) => { event.preventDefault(); routeTo("landing"); };
  });
  if (!staticGlobalBound) {
    staticGlobalBound = true;
    document.addEventListener("click", (event) => {
      runDelegatedAction(delegatedActionTarget(event), event);
    });
    document.addEventListener("error", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.matches("[data-flag-image]")) return;
      image.closest(".flag-slot")?.classList.add("is-fallback");
      image.remove();
    }, true);
    document.addEventListener("keydown", (event) => {
      const actionTarget = delegatedActionTarget(event);
      if (actionTarget && (event.key === "Enter" || event.key === " ") && !["BUTTON", "A"].includes(actionTarget.tagName)) {
        if (runDelegatedAction(actionTarget, event)) return;
      }
      const drawer = $("#drawer");
      if (drawer?.classList.contains("open")) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDrawer();
          return;
        }
        if (event.key === "Tab") {
          const focusable = $$("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])", drawer)
            .filter((node) => node.offsetParent !== null);
          if (focusable.length) {
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
          return;
        }
      }
      if (event.key === "Escape" && state.sidebarOverlayOpen) {
        event.preventDefault();
        closeSidebarOverlay();
        return;
      }
      if (event.key !== "Tab" || !state.sidebarOverlayOpen) return;
      const focusable = $$("#sidebar a[href], #sidebar button:not([disabled])").filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener("resize", () => {
      if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && window.innerWidth >= 1024) {
        state.sidebarExpanded = state.page === "landing" ? false : window.innerWidth >= 1440;
      }
      if (!sidebarIsOverlay()) state.sidebarOverlayOpen = false;
      setSidebarUI();
    });
    window.addEventListener("hashchange", () => {
      const page = pageFromParams();
      if (!page || page === state.page) return;
      navigateTo(page, { updateHash: false });
    });
  }
}
async function navigateTo(page, { updateHash = true } = {}) {
  state.page = page;
  if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && !sidebarIsOverlay()) {
    state.sidebarExpanded = page === "landing" ? false : window.innerWidth >= 1440;
  }
  if (page.startsWith("index-")) state.index = normalizeIndex(page.replace("index-", ""));
  if (updateHash && location.hash !== `#${page}`) location.hash = page;
  if (sidebarIsOverlay()) closeSidebarOverlay({ restoreFocus: false });
  if (!pageNeedsAppData(page)) {
    if (pageUsesPlatformContext(page) && !PLATFORM_CONTEXT) {
      renderLoadingShell();
      try { await ensurePlatformContext(); } catch (err) { if (state.page === page) renderLoadError(err); return; }
      if (state.page !== page) return;
    }
    renderNav();
    const renderResult = render();
    if (renderResult?.then) await renderResult;
    window.requestAnimationFrame(() => $("#view")?.focus?.({ preventScroll: true }));
    return;
  }
  if (!DATA) {
    renderLoadingShell();
    try {
      await ensureData();
    } catch (err) {
      if (state.page === page) renderLoadError(err);
      return;
    }
    if (state.page !== page) return;
  }
  renderNav(); render();
  if (pageNeedsGeo(page) && !GEO) {
    ensureGeo().then(() => { if (state.page === page) render(); }).catch((err) => console.error("GeoJSON load failed", err));
  }
}
function routeTo(page) { return navigateTo(page); }
function renderNav() {
  $("#nav").innerHTML = navGroups().map((group) => `<section class="nav-group">
    <h2>${escapeHtml(group.label)}</h2>
    <div class="nav-group-items">${group.items.map((item) => {
      const code = item.code ? ({ QS_ET: "QS", HCI_PLUS: "HCI+" }[item.code] || item.code) : "";
      const icon = item.code
        ? `<span class="nav-code" aria-hidden="true">${escapeHtml(code)}</span>`
        : `<img class="nav-icon" src="static/icons/${NAV_ICONS[item.key] || "database.svg"}" alt="" aria-hidden="true">`;
      const content = `${icon}<span class="nav-copy"><strong>${escapeHtml(item.label)}</strong>${code ? `<small>${escapeHtml(code)}</small>` : ""}</span>`;
      if (item.href) {
        return `<a class="nav-item" href="${escapeHtml(item.href)}" title="${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}">${content}</a>`;
      }
      return `<button type="button" class="nav-item ${state.page === item.key ? "active" : ""}" title="${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}" ${state.page === item.key ? 'aria-current="page"' : ""} data-gir-action="route" data-route="${escapeHtml(item.key)}">${content}</button>`;
    }).join("")}</div>
  </section>`).join("");
  setSidebarUI();
}
function renderLanding() {
  const view = $("#view");
  if (!window.GIRLanding?.render) {
    view.innerHTML = `<section class="landing-missing"><h1>${escapeHtml(PRODUCT_NAMES[state.lang])}</h1></section>`;
    return;
  }
  view.innerHTML = window.GIRLanding.render({ lang: state.lang, theme: state.theme, summary: LANDING_SUMMARY });
  $$('[data-route-target]', view).forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      routeTo(control.dataset.routeTarget || "country");
    });
  });
  window.GIRCooperation?.bindTriggers?.(view);
  if (!LANDING_SUMMARY && !LANDING_SUMMARY_LOADING) {
    ensureLandingSummary()
      .then(() => { if (state.page === "landing") renderLanding(); })
      .catch((err) => console.error("Landing summary load failed", err));
  }
}
function render() {
  document.documentElement.dataset.page = state.page;
  $("#view")?.classList.toggle("landing-view", state.page === "landing");
  $("#view")?.classList.toggle("methodology-view", state.page === "methodology");
  renderContextBar();
  bindContextControls();
  applyBrandAssets();
  setSidebarUI();
  window.GIRCooperation?.updateLocale?.(state.lang);
  if (state.page === "landing") return renderLanding();
  if (state.page === "country" && window.GIRCountryProfileV2?.render) return window.GIRCountryProfileV2.render();
  if (state.page === "country") return renderCountry();
  if (state.page === "matrix") return renderMatrix();
  if (state.page === "htei-model") return renderHteiModel();
  if (state.page === "policy-center") return renderPolicyCenter();
  if (state.page === "methodology") return renderMethodology();
  if (state.page === "acceptance") return renderAcceptance();
  if (state.page === "index-HTEI") return renderHteiWorkspace();
  if (state.page.startsWith("index-") && window.GIRIndexWorkspace?.render) return renderStandardIndexWorkspace(normalizeIndex(state.page.replace("index-", "")));
  if (state.page.startsWith("index-")) return renderIndex(normalizeIndex(state.page.replace("index-", "")));
  return renderLanding();
}

function indexCard(card) {
  const idx = byCode(card.index_code);
  if (!card.available) {
    return `<div class="card kpi span3"><div class="chart-title"><span class="index-badge">${escapeHtml(indexLabel(card.index_code))}</span></div><div class="value muted">${t("notAvailable")}</div></div>`;
  }
  const weak = card.weak_component;
  const delta = card.rank_delta_1y;
  const rankText = card.rank == null ? "—" : `#${card.rank}`;
  const modeText = card.index_code === "HTEI" ? `<span class="method-chip">${escapeHtml(hteiModeLabel(card.ranking_mode || card.scientific_profile?.mode || "comparable_core"))}</span>` : "";
  const freshness = card.index_code === "HTEI" ? freshnessPill(card) : "";
  return `<div class="card kpi span3">
    <div class="chart-title"><span class="index-badge ${idx.is_tz_index ? "tz" : ""}">${escapeHtml(indexLabel(card.index_code))}</span><span class="tiny muted">${escapeHtml(idx.authority)}</span></div>
    <div class="sub"><b>${escapeHtml(indexFullName(idx))}</b></div>
    <div class="value">${rankText} <span class="muted tiny">· ${fmt(card.score,1)}</span></div>
    <div class="sub">${yearNote(card.value_year, card.requested_year)}${delta == null ? "" : ` · <span class="delta ${delta >= 0 ? "plus" : "minus"}">${delta >= 0 ? "+" : ""}${delta}</span>`}</div>
    ${modeText}${freshness}
    <div class="spark">${card.rank == null ? "" : sparkline(card.trend || [], "rank")}</div>
    <div class="sub">${t("weak")}: <b>${weak ? escapeHtml(componentName(weak)) : "—"}</b></div>
    <div class="tiny muted value-status">${escapeHtml(valueType(card))}</div>
    <button type="button" class="link-btn" data-gir-action="route" data-route="index-${escapeHtml(card.index_code)}">${t("diagnostics")}</button>
  </div>`;
}
function renderCountry() {
  const country = DATA.country.country;
  const command = DATA.command_center;
  const cards = DATA.country.indices.sort((a,b) => INDEX_ORDER.indexOf(a.index_code) - INDEX_ORDER.indexOf(b.index_code));
  $("#view").innerHTML = `<section class="hero">
    <div class="card hero-main"><div class="flag-big">${flagImage(country, "flag-img big")}</div><h1>${t("commandTitle")}: ${escapeHtml(countryName(country))}</h1><p>${t("commandText")}</p>${selectors()}</div>
    <div class="card"><h3>${state.lang === "ru" ? "Выбор peer group" : "Peer group"}</h3>${benchmarkSelector(command)}</div>
  </section>
  <section class="grid">${cards.map(indexCard).join("")}</section>
  <section class="grid dashboard-grid">
    <div class="card span7"><div class="chart-title"><h3>${t("map")}: ${escapeHtml(indexLabel(state.index))}</h3>${selectShell(`<select id="mapIndex" class="select" aria-label="${t("map")}">${INDEX_ORDER.map((code)=>`<option value="${code}" ${state.index===code?"selected":""}>${escapeHtml(indexLabel(code))}</option>`).join("")}</select>`, indexLabel(state.index))}</div><div class="map-wrap">${worldMap(state.index)}</div></div>
    <div class="card span5"><h3>${state.lang === "ru" ? "Профиль относительно фронтира" : "Profile against frontier"}</h3>${radar(cards.filter((c)=>c.available))}</div>
    <div class="card span6"><h3>${state.lang === "ru" ? "Три главных индексных риска" : "Top three index risks"}</h3>${riskIndexList(command.risk_indices || [])}</div>
    <div class="card span6"><h3>${state.lang === "ru" ? "Три проседающих компонента" : "Three weakest components"}</h3>${leverList(command.weakest_components || [], true)}</div>
    <div class="card span6"><h3>${state.lang === "ru" ? "Быстрые рычаги" : "Quick levers"}</h3>${leverList(command.quick_levers || [], true)}</div>
    <div class="card span6"><h3>${state.lang === "ru" ? "Долгосрочные рычаги" : "Long-term levers"}</h3>${leverList(command.long_term_levers || command.long_levers || [], true)}</div>
    <div class="card span7"><h3>${state.lang === "ru" ? (state.country === "RUS" ? "Практические рекомендации для России" : "Приоритетные управленческие меры") : (state.country === "RUS" ? "Practical recommendations for Russia" : "Priority policy measures")}</h3>${policyRecommendations(command.policy_recommendations || [])}</div>
    <div class="card span5"><h3>${t("recommendations")}</h3>${recommendations(command.recommendations)}</div>
    <div class="card span12"><h3>${t("tzBlock")}</h3>${tzSummary(command.tz_summary)}</div>
  </section>`;
  bindDynamic();
}
function renderMatrix() {
  if (window.GIRComparison && typeof window.GIRComparison.render === "function") {
    window.GIRComparison.render({
      root: $("#view"),
      lang: state.lang,
      year: state.year,
      theme: state.theme,
      state,
      countries: (PLATFORM_CONTEXT || DATA)?.countries || [],
      regions: (PLATFORM_CONTEXT || DATA)?.regions || [],
      incomeGroups: (PLATFORM_CONTEXT || DATA)?.income_groups || [],
      escapeHtml,
      fmt,
      intFmt,
      flagImage,
      countryName,
      indexLabel,
      indexFullName,
      openProvenance,
      goCountry,
      routeTo,
      syncAllSelectDisplays,
    });
    return;
  }
  return renderMatrixV2();
  const matrix = DATA.cross_matrix;
  const rows = matrix.countries.filter((c) => state.matrixRegion === "all" || c.region === state.matrixRegion)
    .filter((c) => !state.matrixQuery || `${c.iso3} ${c.name_ru} ${c.name_en}`.toLowerCase().includes(state.matrixQuery.toLowerCase()));
  $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${t("matrix")}</h1><p>${state.lang === "ru" ? "Сравнение стран сразу по всем выбранным международным индексам. Ячейка показывает место, оценку и фактический год данных." : "Compare countries across all selected international indices. Each cell shows rank, score and actual data year."}</p>${selectors(`<label>${t("region")}: ${selectShell(`<select id="regionSelect" class="select"><option value="all">${t("allRegions")}</option>${(DATA.regions||[]).map((r)=>`<option value="${escapeHtml(r)}" ${state.matrixRegion===r?"selected":""}>${escapeHtml(r)}</option>`).join("")}</select>`, state.matrixRegion === "all" ? t("allRegions") : state.matrixRegion)}</label><label>${t("search")}: <input id="matrixSearch" class="input" value="${escapeHtml(state.matrixQuery)}"></label>`)}</div><div class="card"><h3>${t("dataQuality")}</h3>${qualityMini()}</div></section><section class="card span12"><h3>${t("fullRanking")}</h3>${matrixTable(rows, matrix.indices)}</section>`;
  bindDynamic();
}
function renderMatrixV2() {
  const matrix = DATA.cross_matrix || {countries: [], benchmark_options: []};
  const rows = matrix.countries || [];
  state.matrixSortCode = matrix.sort_index || state.matrixSortCode || "HTEI";
  state.matrixSortDir = matrix.sort_dir || state.matrixSortDir || "asc";
  const metricOptions = [
    ["rank", t("rank")],
    ["score", t("score")],
    ["rank_delta_1y", state.lang === "ru" ? "Изменение места за год" : "Rank change, 1 year"],
    ["rank_delta_5y", state.lang === "ru" ? "Изменение места за 5 лет" : "Rank change, 5 years"],
    ["data_quality", t("dataQuality")],
  ];
  const groupOptions = [{code: "all", label_ru: state.lang === "ru" ? "Все страны" : "All countries", label_en: "All countries"}, ...(matrix.benchmark_options || [])];
  const selectedGroup = groupOptions.find((g) => g.code === state.matrixGroup) || groupOptions[0];
  const selectedMetric = metricOptions.find(([key]) => key === state.matrixMetric) || metricOptions[0];
  const csvQuery = new URLSearchParams({year: String(state.year), group: state.matrixGroup, income_group: state.matrixIncome || "all", metric: state.matrixMetric, sort_index: state.matrixSortCode, sort_metric: state.matrixMetric, sort_dir: state.matrixSortDir});
  if (state.matrixTopN) csvQuery.set("topN", String(state.matrixTopN));
  if (state.matrixRegion && state.matrixRegion !== "all") csvQuery.set("region", state.matrixRegion);
  if (state.matrixQuery) csvQuery.set("q", state.matrixQuery);
  const maxCountries = Math.max(1, (DATA.countries || []).length);
  const controls = `<label>${state.lang === "ru" ? "Группа" : "Group"}: ${selectShell(`<select id="matrixGroup" class="select"><option value="all">${state.lang==="ru"?"Все страны":"All countries"}</option>${(matrix.benchmark_options||[]).map((g)=>`<option value="${escapeHtml(g.code)}" ${state.matrixGroup===g.code?"selected":""}>${escapeHtml(state.lang==="ru"?g.label_ru:g.label_en)}</option>`).join("")}</select>`, selectedGroup[state.lang==="ru"?"label_ru":"label_en"] || selectedGroup.code)}</label><label>${state.lang === "ru" ? "Режим" : "Mode"}: ${selectShell(`<select id="matrixMetric" class="select">${metricOptions.map(([key,label])=>`<option value="${key}" ${state.matrixMetric===key?"selected":""}>${escapeHtml(label)}</option>`).join("")}</select>`, selectedMetric[1])}</label><label>Top-N: <input id="matrixTopN" class="input small-input" type="number" min="1" max="${maxCountries}" value="${escapeHtml(state.matrixTopN)}"></label><label>${t("region")}: ${selectShell(`<select id="regionSelect" class="select"><option value="all">${t("allRegions")}</option>${(DATA.regions||[]).map((r)=>`<option value="${escapeHtml(r)}" ${state.matrixRegion===r?"selected":""}>${escapeHtml(r)}</option>`).join("")}</select>`, state.matrixRegion === "all" ? t("allRegions") : state.matrixRegion)}</label><label>${state.lang==="ru"?"Группа дохода":"Income group"}: ${selectShell(`<select id="incomeSelect" class="select"><option value="all">${state.lang==="ru"?"Все группы":"All income groups"}</option>${(DATA.income_groups||[]).map((r)=>`<option value="${escapeHtml(r)}" ${state.matrixIncome===r?"selected":""}>${escapeHtml(incomeGroupLabel(r))}</option>`).join("")}</select>`, state.matrixIncome === "all" ? (state.lang==="ru"?"Все группы":"All income groups") : incomeGroupLabel(state.matrixIncome))}</label><label>${t("search")}: <input id="matrixSearch" class="input" value="${escapeHtml(state.matrixQuery)}"></label><a class="link-btn" href="/api/cross-matrix.csv?${csvQuery.toString()}" download="cross-matrix-${state.year}.csv">CSV</a>`;
  $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${t("matrix")}</h1><p>${state.lang === "ru" ? "Сравнение стран по индексам с фильтрами по группам, регионам, top-N, поиском и режимами ячеек." : "Compare countries across indices with group, region, top-N, search and cell-mode controls."}</p>${selectors(controls)}</div><div class="card"><h3>${t("dataQuality")}</h3>${qualityMini()}</div></section><section class="card span12"><h3>${t("fullRanking")}</h3>${matrixTableV2(rows, matrix.indices || [], matrix.metric || state.matrixMetric)}</section>`;
  bindDynamic();
}
function hteiWorkspaceKey() {
  return `${state.country}|${state.year || 0}|${state.hteiMode}`;
}

function invalidateHteiWorkspace() {
  HTEI_WORKSPACE = null;
  HTEI_WORKSPACE_KEY = "";
  HTEI_WORKSPACE_LOADING = null;
}

function updateHteiUrlState() {
  const url = new URL(location.href);
  url.searchParams.set("country", state.country);
  url.searchParams.set("year", String(state.year));
  url.searchParams.set("htei_mode", state.hteiMode);
  history.replaceState(null, "", `${url.pathname}${url.search}${location.hash}`);
}

function syncHteiWorkspaceToApp(payload) {
  if (!DATA?.index_payloads?.HTEI || !payload) return;
  DATA.index_payloads.HTEI.ranking = payload.ranking || [];
  DATA.index_payloads.HTEI.mode = payload.effective_mode;
  DATA.index_payloads.HTEI.scientific_profile = {
    ...(DATA.index_payloads.HTEI.scientific_profile || {}),
    profile: payload.profile,
    mode: payload.effective_mode,
    fallback_mode: payload.fallback?.effective_mode || null,
  };
}

function ensureHteiWorkspace({ force = false } = {}) {
  const key = hteiWorkspaceKey();
  if (!force && HTEI_WORKSPACE && HTEI_WORKSPACE_KEY === key) return Promise.resolve(HTEI_WORKSPACE);
  if (!force && HTEI_WORKSPACE_LOADING?.key === key) return HTEI_WORKSPACE_LOADING.promise;
  const query = new URLSearchParams({
    iso3: state.country,
    year: String(state.year || 2026),
    mode: state.hteiMode,
  });
  const promise = fetch(`/api/htei/workspace?${query.toString()}`)
    .then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = body?.detail;
        const message = typeof detail === "object"
          ? (state.lang === "ru" ? detail.message_ru : detail.message_en) || JSON.stringify(detail)
          : detail || `HTEI workspace HTTP ${response.status}`;
        throw new Error(message);
      }
      return body;
    })
    .then((payload) => {
      if (hteiWorkspaceKey() === key) {
        HTEI_WORKSPACE = payload;
        HTEI_WORKSPACE_KEY = key;
        syncHteiWorkspaceToApp(payload);
      }
      return payload;
    })
    .finally(() => {
      if (HTEI_WORKSPACE_LOADING?.key === key) HTEI_WORKSPACE_LOADING = null;
    });
  HTEI_WORKSPACE_LOADING = { key, promise };
  return promise;
}

function hteiWorkspaceContext(payload = HTEI_WORKSPACE) {
  return {
    root: $("#view"),
    payload,
    lang: state.lang,
    theme: state.theme,
    mapHtml: payload ? worldMap("HTEI") : "",
    onModeChange: (mode) => {
      state.hteiMode = mode;
      invalidateHteiWorkspace();
      updateHteiUrlState();
      renderHteiWorkspace();
    },
    onCountryChange: (iso3) => {
      const countryCode = String(iso3 || "").toUpperCase();
      if (!countryCode || countryCode === state.country) return;
      state.country = countryCode;
      invalidateHteiWorkspace();
      updateHteiUrlState();
      window.GIRHTEI?.loading?.(hteiWorkspaceContext(null));
      refreshData()
        .then(() => { if (state.page === "index-HTEI") render(); })
        .catch((err) => window.GIRHTEI?.error?.(hteiWorkspaceContext(null), err.message));
    },
    onCountryProfile: (iso3) => goCountry(iso3),
    onProvenance: (valueId, trigger) => openProvenance(valueId, trigger),
    onNotice: (message) => showToast(message),
    onRetry: () => {
      invalidateHteiWorkspace();
      renderHteiWorkspace();
    },
  };
}

function renderHteiWorkspace() {
  state.index = "HTEI";
  const root = $("#view");
  if (!window.GIRHTEI?.render) {
    root.innerHTML = `<section class="card"><h1>HTEI</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль исследовательского пространства не загружен." : "The research workspace module is unavailable.")}</p></section>`;
    return;
  }
  const key = hteiWorkspaceKey();
  if (HTEI_WORKSPACE && HTEI_WORKSPACE_KEY === key) {
    syncHteiWorkspaceToApp(HTEI_WORKSPACE);
    window.GIRHTEI.render(hteiWorkspaceContext(HTEI_WORKSPACE));
    bindDynamic();
    return;
  }
  window.GIRHTEI.loading(hteiWorkspaceContext(null));
  ensureHteiWorkspace()
    .then(() => {
      if (state.page === "index-HTEI" && HTEI_WORKSPACE_KEY === hteiWorkspaceKey()) renderHteiWorkspace();
    })
    .catch((err) => {
      if (state.page === "index-HTEI") window.GIRHTEI.error(hteiWorkspaceContext(null), err.message || String(err));
    });
}

function renderStandardIndexWorkspace(code) {
  return window.GIRIndexWorkspace.render({
    root: $("#view"), code, country: state.country, year: state.year, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, fmt, intFmt, flagImage, openProvenance, goCountry, routeTo,
  });
}

function renderIndex(code) {
  state.index = code;
  const payload = indexPayload(code);
  const idx = payload.index;
  const diag = payload.country_diagnostics;
  const country = DATA.country.country;
  if (!payload.ranking.length || !diag.score) return renderUnavailableIndex(payload);
  const qsBlock = code === "QS_ET" ? qsInstitutionBlock() : "";
  const hteiBlock = code === "HTEI" ? hteiSourceBlock(payload) : "";
  const humanCapitalCombined = code === "HCI_PLUS" ? (payload.human_capital_combined || DATA.country?.human_capital_combined || DATA.command_center?.human_capital_combined) : null;
  const isAsof = code === "HTEI" && payload.mode === "asof_diagnostic";
  const rankText = diag.score.rank == null ? "—" : `#${diag.score.rank}`;
  const modeControl = code === "HTEI" ? hteiModeSelector(payload) : "";
  const modeNotice = code === "HTEI" && diag.score.rank == null ? `<div class="soft-note warning-note"><b>${t("noSynchronousRank")}</b><br>${escapeHtml(state.lang === "ru" ? (payload.scientific_profile?.mode_explanation_ru || "") : (payload.scientific_profile?.mode_explanation_en || ""))}</div>` : "";
  const profile = payload.scientific_profile?.profile || {};
  const uncertainty = code === "HTEI" ? uncertaintySummary(profile) : "";
  const filteredRanking = filterRanking(payload.ranking);
  const pageRows = filteredRanking.slice(state.rankingOffset, state.rankingOffset + state.rankingPageSize);
  const rankingBlock = rankingTable(pageRows, {code, total: filteredRanking.length, asof: isAsof});
  const trendMetric = isAsof ? "score" : state.trendMetric;
  const trendControl = (isAsof || code === "HCI_PLUS") ? "" : `<label>${t("trend")}: ${selectShell(`<select id="trendMetric" class="select"><option value="rank" ${state.trendMetric==="rank"?"selected":""}>${t("rankTrend")}</option><option value="score" ${state.trendMetric==="score"?"selected":""}>${t("scoreTrend")}</option></select>`, state.trendMetric==="rank"?t("rankTrend"):t("scoreTrend"))}</label>`;
  const titleControls = `${trendControl}${modeControl}`;
  const rankSummary = isAsof ? `<div><span>${t("methodologyStatus")}</span><b>${t("noSynchronousRank")}</b></div>` : `<div><span>${t("rank")}</span><b>${rankText}</b></div>`;
  const trendHtml = code === "HCI_PLUS" ? humanCapitalCombinedChart(humanCapitalCombined, 520, 275) : lineChart(countrySeries(code, state.country), 520, 275, trendMetric);
  const trendTitle = code === "HCI_PLUS" ? (state.lang === "ru" ? "Исторический HCI и текущий HCI+" : "Historical HCI and current HCI+") : (trendMetric === "rank" ? t("rankTrend") : t("scoreTrend"));
  $("#view").innerHTML = `<section class="hero"><div class="card"><span class="index-badge ${idx.is_tz_index ? "tz" : ""}">${escapeHtml(indexLabel(code))}</span><h1>${escapeHtml(indexFullName(idx))}</h1><p>${escapeHtml(state.lang === "ru" ? idx.description_ru : idx.description_en)}</p><p class="methodology-label">${methodologyLabel(idx)}</p>${methodologyWarning(idx)}${modeNotice}${selectors(titleControls)}</div><div class="card"><h3>${flagImage(country,"flag-img inline")} ${escapeHtml(countryName(country))}</h3><div class="index-summary">${rankSummary}<div><span>${t("score")}</span><b>${fmt(diag.score.score,1)}</b></div><div><span>${t("dataYear")}</span><b>${diag.value_year}</b></div><div><span>${t("valueType")}</span><b>${valueType(idx)}</b></div>${code === "HTEI" ? `<div><span>${t("confidence")}</span><b>${fmt((diag.score.confidence_score||diag.score.data_quality||0)*100,0)}%</b></div><div><span>${t("coverage")}</span><b>${intFmt(diag.score.available_components||0)}/6</b></div>` : ""}</div>${uncertainty}<button type="button" class="link-btn" data-gir-action="provenance" data-value-id="${escapeHtml(diag.score.value_id || "")}">${t("provenance")}</button></div></section>
  <section class="grid"><div class="card span7"><div class="chart-title"><h3>${t("map")}</h3><span class="tiny muted">${escapeHtml(idx.authority)}</span></div><div class="map-wrap">${worldMap(code)}</div></div><div class="card span5"><h3>${trendTitle}: ${escapeHtml(countryName(country))}</h3>${trendHtml}</div><div class="card span6"><h3>${t("components")}</h3>${componentBars(diag.components)}</div><div class="card span6"><h3>${t("diagnostics")}</h3>${diagnosticList(diag.components)}</div><div class="card span8"><h3>${t("componentTree")}</h3>${componentTree(payload.component_tree || [])}</div><div class="card span4"><h3>${t("formula")}</h3>${methodCard(idx, payload.components, payload.formula)}</div>${qsBlock}${hteiBlock}<div class="card span12 ranking-card ${isAsof?"asof-coverage-card":""}"><div class="chart-title"><h3>${isAsof?t("asofCoverage"):t("fullRanking")}</h3>${rankingControls(filteredRanking.length)}</div>${rankingBlock}</div></section>`;
  bindDynamic();
}
function uncertaintySummary(profile) {
  if (!profile || profile.mode === "asof_diagnostic") return "";
  const hasScore = profile.score_low != null && profile.score_high != null;
  const hasRank = profile.rank_low != null && profile.rank_high != null;
  if (!hasScore && !hasRank) return `<div class="tiny muted">${state.lang === "ru" ? "Интервалы неопределённости публикуются для строгого сопоставимого ядра." : "Uncertainty intervals are published for the strict comparable core."}</div>`;
  return `<div class="uncertainty-box"><span>${t("uncertainty")}</span><b>${hasScore ? `${fmt(profile.score_low,1)}–${fmt(profile.score_high,1)}` : "—"}</b><small>${hasRank ? `${state.lang === "ru" ? "место" : "rank"} ${profile.rank_low}–${profile.rank_high}` : ""}</small></div>`;
}
function filterRanking(rows) {
  const q = String(state.rankingQuery || "").trim().toLowerCase();
  return q ? rows.filter((r)=>`${r.iso3||""} ${r.name_ru||""} ${r.name_en||""}`.toLowerCase().includes(q)) : rows;
}
function rankingControls(total) {
  const pageCount = Math.max(1, Math.ceil(total / state.rankingPageSize));
  const current = Math.min(pageCount, Math.floor(state.rankingOffset / state.rankingPageSize) + 1);
  return `<div class="ranking-controls"><label>${t("search")}: <input id="rankingSearch" class="input compact-input" value="${escapeHtml(state.rankingQuery)}"></label><label>${t("rowsPerPage")}: ${selectShell(`<select id="rankingPageSize" class="select compact-select"><option value="25" ${state.rankingPageSize===25?"selected":""}>25</option><option value="50" ${state.rankingPageSize===50?"selected":""}>50</option><option value="100" ${state.rankingPageSize===100?"selected":""}>100</option></select>`, String(state.rankingPageSize))}</label><button id="rankingPrev" type="button" class="link-btn" ${current<=1?"disabled":""}>${t("previous")}</button><span class="tiny muted">${t("page")} ${current} / ${pageCount} · ${intFmt(total)}</span><button id="rankingNext" type="button" class="link-btn" ${current>=pageCount?"disabled":""}>${t("next")}</button></div>`;
}
async function refreshHteiMode() {
  const response = await fetch(`/api/index/HTEI/explainer?country=${encodeURIComponent(state.country)}&year=${state.year}&mode=${encodeURIComponent(state.hteiMode)}&lang=${state.lang}`);
  if (!response.ok) throw new Error(`HTEI mode HTTP ${response.status}`);
  DATA.index_payloads.HTEI = await response.json();
  if (state.hteiMode === "asof_diagnostic") state.trendMetric = "score";
  state.rankingOffset = 0;
  state.rankingQuery = "";
  render();
}
function renderUnavailableIndex(payload) {
  const idx = payload.index;
  $("#view").innerHTML = `<section class="hero"><div class="card"><span class="index-badge">${escapeHtml(indexLabel(idx.code))}</span><h1>${escapeHtml(indexFullName(idx))}</h1><p>${escapeHtml(state.lang === "ru" ? idx.description_ru : idx.description_en)}</p>${selectors()}</div><div class="card"><h3>${t("dataQuality")}</h3><p class="muted">${t("notAvailable")}</p></div></section>`;
  bindDynamic();
}
function renderHteiModel() {
  if (window.GIRStage4?.renderTraining) return window.GIRStage4.renderTraining();
  $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(t("hteiModel"))}</h1><p>${state.lang === "ru" ? "Загрузка аналитического рабочего пространства…" : "Loading analytical workspace…"}</p></div></section>`;
}
function renderPolicyCenter() {
  if (window.GIRStage4?.renderPolicy) return window.GIRStage4.renderPolicy();
  $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(t("policyCenter"))}</h1><p>${state.lang === "ru" ? "Загрузка центра рекомендаций…" : "Loading recommendation centre…"}</p></div></section>`;
}

function renderMethodology() {
  const view = $("#view");
  if (!window.GIRMethodology?.render) {
    view.innerHTML = `<section class="method-error"><h1>${state.lang === "ru" ? "Документационный центр недоступен" : "Documentation centre is unavailable"}</h1><p>${state.lang === "ru" ? "Не загружен модуль methodology.js." : "The methodology.js module was not loaded."}</p></section>`;
    return;
  }
  return window.GIRMethodology.render({ lang: state.lang, theme: state.theme });
}
function renderAcceptance() {
  const a = DATA.acceptance || {};
  const items = a.items || [];
  const facts = a.summary?.facts || {};
  $("#view").innerHTML = `<section class="hero"><div class="card hero-main"><h1>${t("acceptance")}</h1><p>${state.lang === "ru" ? "Приёмочная матрица по исходному техническому заданию: формулировка, статус, таблицы БД, источники, UI-экраны, тесты и ограничения." : "Acceptance matrix for the original technical assignment: requirement wording, status, database evidence, sources, UI screens, tests and limitations."}</p>${selectors()}</div><div class="card kpi"><h3>${state.lang === "ru" ? "Статус" : "Status"}</h3><div class="value">${escapeHtml(state.lang==="ru"?(a.summary?.status_label_ru||a.summary?.status):(a.summary?.status_label_en||a.summary?.status) || "")}</div><div class="sub">${intFmt(a.summary?.items_closed || 0)} / ${intFmt(a.summary?.items_total || 0)}</div></div></section>
  <section class="grid"><div class="card span12"><h3>${state.lang === "ru" ? "Факты из БД" : "Database facts"}</h3><div class="quality-list">${Object.entries(facts).map(([k,v])=>`<div><b>${escapeHtml(k)}</b><span>${intFmt(v)}</span></div>`).join("")}</div></div>
  ${items.map((item)=>`<div class="card span6 acceptance-item"><div class="chart-title"><h3>${escapeHtml(item.id)} → ${escapeHtml(item.result_id||"")} · ${escapeHtml(item.status_label || item.status)}</h3><span class="index-badge tz">${t("acceptance")}</span></div><p><b>${escapeHtml(item.requirement)}</b></p><details class="acceptance-result" open><summary><b>${state.lang==="ru"?"Ожидаемый результат":"Expected result"} ${escapeHtml(item.result_id||"")}</b></summary><p>${escapeHtml(item.expected_result||"")}</p></details><div class="mini-table"><div><span>${state.lang==="ru"?"Таблицы БД":"DB tables"}</span><b>${escapeHtml((item.db_tables||[]).join(", "))}</b></div><div><span>${t("sources")}</span><b>${escapeHtml((item.sources||[]).join(", "))}</b></div><div><span>UI</span><b>${escapeHtml((item.ui_screens||[]).join(", "))}</b></div><div><span>${state.lang==="ru"?"Тесты":"Tests"}</span><b>${escapeHtml((item.tests||[]).join(", "))}</b></div></div><p class="tiny muted">${escapeHtml(item.limitations || "")}</p></div>`).join("")}</section>`;
  bindDynamic();
}

function bindDynamic() {
  bindContextControls();
  const mapIndex = $("#mapIndex");
  if (mapIndex) mapIndex.onchange = (e) => { state.index = e.target.value; render(); };
  const trendMetric = $("#trendMetric");
  if (trendMetric) trendMetric.onchange = (e) => { state.trendMetric = e.target.value; render(); };
  const regionSelect = $("#regionSelect");
  if (regionSelect) regionSelect.onchange = (e) => { state.matrixRegion = e.target.value; refreshMatrixData(); };
  const matrixGroup = $("#matrixGroup");
  if (matrixGroup) matrixGroup.onchange = (e) => { state.matrixGroup = e.target.value; refreshMatrixData(); };
  const incomeSelect = $("#incomeSelect");
  if (incomeSelect) incomeSelect.onchange = (e) => { state.matrixIncome = e.target.value; refreshMatrixData(); };
  const matrixMetric = $("#matrixMetric");
  if (matrixMetric) matrixMetric.onchange = (e) => { state.matrixMetric = e.target.value; state.matrixSortDir = state.matrixMetric === "rank" ? "asc" : "desc"; refreshMatrixData(); };
  const matrixTopN = $("#matrixTopN");
  if (matrixTopN) matrixTopN.onchange = (e) => { state.matrixTopN = e.target.value; refreshMatrixData(); };
  const search = $("#matrixSearch");
  if (search) search.onchange = (e) => { state.matrixQuery = e.target.value; refreshMatrixData(); };
  const hteiMode = $("#hteiMode");
  if (hteiMode) hteiMode.onchange = (e) => { state.hteiMode = e.target.value; refreshHteiMode().catch((err)=>openDrawer(`<h3>HTEI</h3><pre>${escapeHtml(err.message)}</pre>`)); };
  const rankingSearch = $("#rankingSearch");
  if (rankingSearch) rankingSearch.oninput = (e) => { state.rankingQuery = e.target.value; state.rankingOffset = 0; renderIndex(state.index); };
  const rankingPageSize = $("#rankingPageSize");
  if (rankingPageSize) rankingPageSize.onchange = (e) => { state.rankingPageSize = Number(e.target.value); state.rankingOffset = 0; renderIndex(state.index); };
  const rankingPrev = $("#rankingPrev");
  if (rankingPrev) rankingPrev.onclick = () => { state.rankingOffset = Math.max(0, state.rankingOffset - state.rankingPageSize); renderIndex(state.index); };
  const rankingNext = $("#rankingNext");
  if (rankingNext) rankingNext.onclick = () => { state.rankingOffset += state.rankingPageSize; renderIndex(state.index); };
  syncAllSelectDisplays();
}

function sparkline(trend, metric = "rank") {
  if (!trend || trend.length < 2) return "";
  const width = 180, height = 38, pad = 3;
  const vals = trend.map((x)=>Number(x[metric]));
  const years = trend.map((x)=>Number(x.year));
  const minX = Math.min(...years), maxX = Math.max(...years);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const x = (yr)=>pad+(yr-minX)/(maxX-minX||1)*(width-pad*2);
  const y = (v)=> metric === "rank" ? pad+(v-minV)/(maxV-minV||1)*(height-pad*2) : height-pad-(v-minV)/(maxV-minV||1)*(height-pad*2);
  const path = trend.map((item,i)=>`${i?"L":"M"}${x(item.year).toFixed(1)},${y(item[metric]).toFixed(1)}`).join(" ");
  return svg(width, height, `<path d="${path}" fill="none" stroke="${cssVar("--chart-accent", "#539D96")}" stroke-width="2"/>`, "sparkline");
}
function lineChart(series, width=520, height=270, metric="score") {
  if (!series.values.length) return `<p class="muted">${t("notAvailable")}</p>`;
  const pad = 38;
  const years = series.values.map((x)=>x.year), vals = series.values.map((x)=>Number(x[metric]));
  const minYear = Math.min(...years), maxYear = Math.max(...years);
  const minVal = Math.min(...vals), maxVal = Math.max(...vals);
  const x = (yr)=>pad+(yr-minYear)/(maxYear-minYear||1)*(width-pad*2);
  const y = (v)=> metric === "rank" ? pad+(v-minVal)/(maxVal-minVal||1)*(height-pad*2) : height-pad-(v-minVal)/(maxVal-minVal||1)*(height-pad*2);
  const path = series.values.map((item,i)=>`${i?"L":"M"}${x(item.year).toFixed(1)},${y(item[metric]).toFixed(1)}`).join(" ");
  const dots = series.values.map((item)=>`<circle cx="${x(item.year)}" cy="${y(item[metric])}" r="4" fill="${cssVar("--chart-accent", "#539D96")}"><title>${item.year}: ${metric==="rank"?"#":""}${fmt(item[metric], metric==="rank"?0:1)}</title></circle>`).join("");
  const labels = series.values.filter((_,i)=>i%Math.max(1,Math.floor(series.values.length/7))===0).map((item)=>`<text x="${x(item.year)}" y="${height-10}" text-anchor="middle" fill="var(--muted)" font-size="11">${item.year}</text>`).join("");
  const gridColor = cssVar("--chart-grid", "rgba(25,47,112,.16)");
  return svg(width, height, `<line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="${gridColor}"/><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}" stroke="${gridColor}"/><path d="${path}" fill="none" stroke="${cssVar("--chart-line", "#2947A0")}" stroke-width="4"/>${dots}${labels}`, t("trend"));
}
function humanCapitalCombinedChart(payload, width=520, height=270) {
  if (!payload || !(payload.display_series || []).length) return `<p class="muted">${t("notAvailable")}</p>`;
  const series = payload.display_series.filter((item)=>Number.isFinite(Number(item.display_score_325)));
  const pad = 44;
  const years = series.map((item)=>Number(item.year));
  const vals = series.map((item)=>Number(item.display_score_325));
  const minYear = Math.min(...years), maxYear = Math.max(...years);
  const minVal = Math.max(0, Math.min(...vals)-20), maxVal = Math.min(325, Math.max(...vals)+20);
  const x = (yr)=>pad+(yr-minYear)/(maxYear-minYear||1)*(width-pad*2);
  const y = (v)=>height-pad-(v-minVal)/(maxVal-minVal||1)*(height-pad*2);
  const historical = series.filter((item)=>item.edition === "HCI");
  const current = series.filter((item)=>item.edition === "HCI+");
  const path = historical.map((item,i)=>`${i?"L":"M"}${x(item.year).toFixed(1)},${y(item.display_score_325).toFixed(1)}`).join(" ");
  const historyDots = historical.map((item)=>`<circle cx="${x(item.year)}" cy="${y(item.display_score_325)}" r="4" fill="var(--surface)" stroke="#2947A0" stroke-width="2"><title>HCI ${item.year}: ${fmt(item.score,1)} / ${fmt(item.display_score_325,1)} visual scale</title></circle>`).join("");
  const currentDots = current.map((item)=>{const cx=x(item.year),cy=y(item.display_score_325),r=7;return `<polygon points="${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}" fill="#539D96" stroke="var(--surface)" stroke-width="2"><title>HCI+ ${item.year}: ${fmt(item.score,0)} / 325</title></polygon>`;}).join("");
  const labels = series.map((item)=>`<text x="${x(item.year)}" y="${height-10}" text-anchor="middle" fill="var(--muted)" font-size="11">${item.year}</text>`).join("");
  const gridColor = cssVar("--chart-grid", "rgba(25,47,112,.16)");
  const chart = svg(width,height,`<line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="${gridColor}"/><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}" stroke="${gridColor}"/>${path?`<path d="${path}" fill="none" stroke="#2947A0" stroke-width="3" stroke-dasharray="8 6"/>`:""}${historyDots}${currentDots}${labels}`, state.lang === "ru" ? "Исторический HCI и HCI+" : "Historical HCI and HCI+");
  const warning = state.lang === "ru" ? payload.warning_ru : payload.warning_en;
  return `${chart}<div class="chart-legend"><span><i style="background:#2947A0;border-radius:50%"></i>HCI 2010–2020</span><span><i style="background:#539D96;transform:rotate(45deg)"></i>HCI+ 2026</span></div><div class="soft-note methodology-warning">${escapeHtml(warning||"")}</div>`;
}

function countrySeries(code, iso3) { const p=indexPayload(code); return {label:iso3, values:(p.series||[]).filter((x)=>x.iso3===iso3).map((x)=>({year:Number(x.year), score:Number(x.score), rank:Number(x.rank)}))}; }
function radar(cards) {
  if (!cards.length) return `<p class="muted">${t("notAvailable")}</p>`;
  const width=520,height=310,cx=260,cy=150,r=105;
  const labels=cards.map((c)=>indexLabel(c.index_code)), values=cards.map((c)=>c.index_code === "HCI_PLUS" ? Number(c.score)/3.25 : Number(c.score));
  const outer=labels.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/labels.length; return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});
  const pts=values.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/values.length; return [cx+Math.cos(a)*r*(v/100),cy+Math.sin(a)*r*(v/100)];});
  const grid=[.25,.5,.75,1].map((step)=>`<polygon points="${outer.map(([x,y])=>[cx+(x-cx)*step,cy+(y-cy)*step].join(',')).join(' ')}" fill="none" stroke="${cssVar("--chart-grid", "rgba(25,47,112,.16)")}"/>`).join("");
  const labs=labels.map((lab,i)=>`<text x="${outer[i][0]}" y="${outer[i][1]}" fill="var(--muted)" font-size="10" text-anchor="middle">${escapeHtml(lab).slice(0,20)}</text>`).join("");
  return svg(width,height,`${grid}<polygon points="${pts.map((p)=>p.join(',')).join(' ')}" fill="rgba(41,71,160,.20)" stroke="${cssVar("--chart-accent", "#539D96")}" stroke-width="2"/>${pts.map((p)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${cssVar("--chart-accent", "#539D96")}"/>`).join("")}${labs}`,"Radar");
}
function bboxOfFeatures(features){let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity;const scan=(coords)=>{if(typeof coords[0]==="number"){const lon=coords[0],lat=coords[1];if(lon<-170||lon>190)return;minLon=Math.min(minLon,lon);maxLon=Math.max(maxLon,lon);minLat=Math.min(minLat,lat);maxLat=Math.max(maxLat,lat);}else coords.forEach(scan);};features.forEach((f)=>scan(f.geometry.coordinates));return{minLon,minLat,maxLon,maxLat};}
function pathFromGeom(geom,w,h,b){const project=(lon,lat)=>[(lon-b.minLon)/(b.maxLon-b.minLon)*w,h-(lat-b.minLat)/(b.maxLat-b.minLat)*h];const ringPath=(ring)=>ring.map((pt,i)=>{const [x,y]=project(pt[0],pt[1]);return `${i?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`;}).join("")+"Z";if(geom.type==="Polygon")return geom.coordinates.map(ringPath).join("");if(geom.type==="MultiPolygon")return geom.coordinates.map((poly)=>poly.map(ringPath).join("")).join("");return "";}
function cssVar(name,fallback){return getComputedStyle(document.documentElement).getPropertyValue(name).trim()||fallback;}
function scoreMap(code){const scores={};(indexPayload(code)?.ranking||[]).forEach((r)=>{scores[r.iso3]=r.score;});return scores;}
function svg(width,height,body,label){return `<svg class="viz" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}">${body}</svg>`;}

const MAP_BIN_COUNT = 7;
function quantile(sorted, probability) {
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position), upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}
function mapPalette() {
  return Array.from({length: MAP_BIN_COUNT}, (_, index) => cssVar(`--map-bin-${index + 1}`, "#2947A0"));
}
function buildMapScale(scores) {
  const values = Object.values(scores).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const thresholds = Array.from({length: MAP_BIN_COUNT - 1}, (_, index) => quantile(values, (index + 1) / MAP_BIN_COUNT));
  return {
    values,
    thresholds,
    palette: mapPalette(),
    min: values[0] ?? null,
    median: quantile(values, .5),
    max: values[values.length - 1] ?? null,
  };
}
function mapBin(value, scale) {
  if (value == null || !Number.isFinite(Number(value)) || !scale.values.length) return null;
  const numeric = Number(value);
  let bin = 0;
  while (bin < scale.thresholds.length && numeric > scale.thresholds[bin]) bin += 1;
  return bin;
}
function colorForMap(value, scale) {
  const bin = mapBin(value, scale);
  return bin == null ? cssVar("--map-empty", "rgba(120,150,180,.15)") : scale.palette[bin];
}
function mapLegend(scale) {
  if (!scale.values.length) return "";
  const x = 22, y = 342, width = 210, segmentWidth = width / MAP_BIN_COUNT;
  const segments = scale.palette.map((color, index) => {
    const lower = index === 0 ? scale.min : scale.thresholds[index - 1];
    const upper = index === MAP_BIN_COUNT - 1 ? scale.max : scale.thresholds[index];
    return `<rect class="map-legend-segment" data-bin="${index}" x="${x + index * segmentWidth}" y="${y}" width="${segmentWidth + .25}" height="10" fill="${color}"><title>${fmt(lower, 1)}\u2013${fmt(upper, 1)}</title></rect>`;
  }).join("");
  return `<g class="map-legend" role="img" aria-label="${escapeHtml(t("mapScale"))}">${segments}<text x="${x}" y="334" fill="var(--muted)" font-size="11">${fmt(scale.min, 1)}</text><text x="${x + width / 2}" y="334" fill="var(--muted)" font-size="11" text-anchor="middle">${fmt(scale.median, 1)}</text><text x="${x + width}" y="334" fill="var(--muted)" font-size="11" text-anchor="end">${fmt(scale.max, 1)}</text><text class="map-legend-caption" x="${x}" y="369" fill="var(--muted)" font-size="10">${escapeHtml(t("mapScale"))}</text></g>`;
}

function worldMap(code) {
  if (!GEO) {
    ensureGeo()
      .then(() => render())
      .catch((err) => {
        console.error("GeoJSON load failed", err);
        setTimeout(() => { if (!GEO) render(); }, 1000);
      });
    return `<div class="soft-note">${state.lang==="ru"?"Карта загружается":"Map is loading"}</div>`;
  }
  const width = 820, height = 380, bounds = bboxOfFeatures(GEO.features), scores = scoreMap(code), scale = buildMapScale(scores);
  let body = "";
  GEO.features.forEach((f) => {
    const iso = f.properties.iso3;
    const val = scores[iso];
    const label = state.lang === "ru" ? (f.properties.name_ru || f.properties.name) : (f.properties.name_en || f.properties.name);
    const d = pathFromGeom(f.geometry, width, height, bounds);
    if (!iso || !d) return;
    const bin = mapBin(val, scale), hasValue = bin != null;
    const scoreAttrs = hasValue ? ` data-score="${Number(val)}" data-map-bin="${bin}"` : "";
    body += `<path class="map-country${hasValue ? ` map-bin-${bin + 1}` : " map-no-data"}" data-iso="${escapeHtml(iso)}" data-index="${escapeHtml(code)}"${scoreAttrs} tabindex="0" role="button" aria-label="${escapeHtml(label)}" data-gir-action="map-country" data-iso="${escapeHtml(iso)}" d="${d}" fill="${colorForMap(val, scale)}" fill-opacity="${hasValue ? 1 : .62}" stroke="${cssVar("--map-stroke","rgba(180,215,255,.35)")}" stroke-width=".45"><title>${escapeHtml(label)} · ${escapeHtml(indexLabel(code))}: ${fmt(val,1)}</title></path>`;
  });
  body += mapLegend(scale);
  return `<svg class="viz map-viz" data-index="${escapeHtml(code)}" data-scale-mode="quantile" data-scale-min="${scale.min ?? ""}" data-scale-max="${scale.max ?? ""}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${escapeHtml(t("map"))}">${body}</svg>`;
}

function leverList(levers, numbered=false){if(!levers.length)return`<p class="muted">${t("notAvailable")}</p>`;return levers.map((l,i)=>`<div class="diagnostic lever"><div><b>${numbered?`${i+1}. `:""}${escapeHtml(componentName(l))}</b><div class="tiny muted">${escapeHtml(indexLabel(l.index_code))} · ${t("peer")}: ${fmt(l.top10_avg,1)} · ${t("score")}: ${fmt(l.normalized_score,1)}</div><div class="bar"><span style="width:${Math.min(100,l.priority_score*1.4)}%"></span></div></div><button type="button" class="priority" aria-label="${t("provenance")} provenance" data-gir-action="provenance" data-value-id="${escapeHtml(l.value_id || "")}">${fmt(l.priority_score,0)}</button></div>`).join("");}
function riskIndexList(items){return items.map((r)=>`<div class="diagnostic"><div><b>${escapeHtml(indexLabel(r.index_code))}: #${r.rank}</b><div class="tiny muted">${t("dataYear")}: ${r.value_year} · ${t("weak")}: ${r.weak_component?escapeHtml(componentName(r.weak_component)):"—"}</div><div class="spark compact-spark">${sparkline(r.trend||[],"rank")}</div></div><span class="priority">${fmt(r.risk_score,0)}</span></div>`).join("");}
function recommendations(recs){return (recs||[]).slice(0,7).map((rec)=>`<div class="diagnostic"><div><b>${escapeHtml(state.lang==="ru"?rec.title_ru:rec.title_en)}</b><div class="tiny muted">${escapeHtml(state.lang==="ru"?rec.text_ru:rec.text_en)}</div></div><span class="priority">${fmt(rec.priority_score,0)}</span></div>`).join("") || `<p class="muted">${t("notAvailable")}</p>`;}
function benchmarkSelector(command){const opts=command.benchmark_options||[];return `<div class="quality-list">${opts.map((o)=>`<div><b>${escapeHtml(state.lang==="ru"?o.label_ru:o.label_en)}</b><span>${escapeHtml((o.iso3||[]).slice(0,8).join(", "))}</span></div>`).join("")}</div><div id="customBenchmark" class="tiny muted">${state.customBenchmark.length?`${state.lang==="ru"?"Custom benchmark":"Custom benchmark"}: ${state.customBenchmark.join(", ")}`:""}</div>`;}
function tzSummary(summary){
  const arr=summary?.[state.lang]||summary?.ru||[];
  return `<div class="tz-grid">${arr.map((x,i)=>`<div class="tz-item"><b>${i+1}</b><span>${escapeHtml(x)}</span></div>`).join("")}</div>`;
}
function tzExact(tz){
  const values=tz?Object.values(tz):[];
  return `<div class="tz-list">${values.map((x,i)=>`<div class="tz-item"><b>${i+1}</b><span>${escapeHtml(String(x))}</span></div>`).join("")}</div>`;
}
function qualityMini(){
  const items=DATA?.data_quality?.indices||[];
  return `<div class="quality-list">${items.map((i)=>`<div><b>${escapeHtml(state.lang==="ru"?i.short_name_ru:i.short_name_en)}</b><span>${intFmt(i.score_rows)} / ${intFmt(i.component_rows)}</span><em>${fmt((i.avg_data_quality||0)*100,0)}%</em></div>`).join("")}</div>`;
}
function releaseReadinessPanel(){
  const r=DATA?.release_readiness||{};
  const blockers=r.blockers||[];
  const warnings=r.warnings||[];
  const acceptance=r.acceptance?.summary||{};
  const facts=r.facts||{};
  const statusLabel=r.release_ready
    ? (state.lang==="ru"?"Готов к окончательной передаче":"Ready for final delivery")
    : (state.lang==="ru"?"Требуется закрыть блокирующие условия":"Blocking conditions remain");
  const level=escapeHtml(r.readiness_level||"—");
  const acceptanceText=state.lang==="ru"
    ? `${intFmt(acceptance.items_closed||0)} из ${intFmt(acceptance.items_total||4)} результатов исходного ТЗ закрыты полностью`
    : `${intFmt(acceptance.items_closed||0)} of ${intFmt(acceptance.items_total||4)} original ToR results are fully closed`;
  const rule=state.lang==="ru"?r.acceptance_rule_ru:r.acceptance_rule_en;
  return `<div class="release-panel ${r.release_ready?"ready":"blocked"}">
    <div class="release-head"><div><b>${statusLabel}</b><small>${level}</small></div><span>${escapeHtml(rule||"")}</span></div>
    <div class="index-summary release-summary">
      <div><span>${state.lang==="ru"?"ТЗ":"ToR"}</span><b>${escapeHtml(acceptanceText)}</b></div>
      <div><span>${state.lang==="ru"?"HTEI core":"HTEI core"}</span><b>${intFmt(facts.htei_v6_profiles||facts.htei_common_support||0)}</b></div>
      <div><span>${state.lang==="ru"?"Источники / snapshots":"Sources / snapshots"}</span><b>${intFmt(facts.raw_snapshots||0)}</b></div>
      <div><span>${state.lang==="ru"?"Блокеры":"Blockers"}</span><b>${intFmt(blockers.length)}</b></div>
    </div>
    ${blockers.length?`<h4>${t("releaseBlockers")}</h4>${blockers.map((b)=>`<div class="diagnostic blocker"><div><b>${escapeHtml(state.lang==="ru"?b.title_ru:b.title_en)}</b><div class="tiny muted">${escapeHtml(b.code)} · ${escapeHtml(JSON.stringify(b.evidence||{}))}</div></div><span class="priority">${escapeHtml(b.severity)}</span></div>`).join("")}`:""}
    ${warnings.length?`<h4>${state.lang==="ru"?"Предупреждения":"Warnings"}</h4>${warnings.map((b)=>`<div class="diagnostic"><div><b>${escapeHtml(state.lang==="ru"?b.title_ru:b.title_en)}</b><div class="tiny muted">${escapeHtml(b.code)}</div></div><span class="priority">${escapeHtml(b.severity)}</span></div>`).join("")}`:""}
  </div>`;
}
function matrixCell(v, metric){
  let main=`#${v.rank??"—"}`;
  let note=`${fmt(v.score,1)} · ${v.value_year||"—"}`;
  if(metric==="score"){main=fmt(v.score,1);note=`#${v.rank??"—"} · ${v.value_year||"—"}`;}
  else if(metric==="rank_delta_1y"){main=v.rank_delta_1y==null?"—":`${v.rank_delta_1y>0?"+":""}${v.rank_delta_1y}`;note=`#${v.rank??"—"} · ${v.value_year||"—"}`;}
  else if(metric==="rank_delta_5y"){main=v.rank_delta_5y==null?"—":`${v.rank_delta_5y>0?"+":""}${v.rank_delta_5y}`;note=`#${v.rank??"—"} · ${v.value_year||"—"}`;}
  else if(metric==="data_quality"){main=`${fmt((v.data_quality||0)*100,0)}%`;note=`#${v.rank??"—"} · ${v.value_year||"—"}`;}
  if(v.stale){note+=state.lang==="ru"?" · ASOF, устар.":" · ASOF, stale";}
  return `<button class="cell-rank ${v.stale?"stale":""}" aria-label="${t("provenance")} provenance" data-gir-action="provenance" data-value-id="${escapeHtml(v.value_id || "")}">${escapeHtml(main)}<small>${escapeHtml(note)}</small></button>`;
}
function matrixTable(countries, indices){return matrixTableV2(countries,indices,"rank");}
function matrixTableV2(countries, indices, metric="rank"){
  return `<div class="table-wrap matrix-wrap"><table class="data-table matrix-table"><thead><tr><th>${t("countryLabel")}</th>${INDEX_ORDER.map((code)=>`<th><button type="button" class="table-head-btn" data-gir-action="sort-matrix" data-code="${escapeHtml(code)}">${escapeHtml(indexLabel(code))}${state.matrixSortCode===code?` ${state.matrixSortDir==="asc"?"↑":"↓"}`:""}</button></th>`).join("")}</tr></thead><tbody>${countries.map((c)=>`<tr><td><button type="button" class="country-row country-link" data-gir-action="country" data-iso="${escapeHtml(c.iso3)}">${flagImage(c,"flag-img inline")}<b>${escapeHtml(countryName(c))}</b></button></td>${INDEX_ORDER.map((code)=>{const v=c.indices?.[code];return `<td>${v?matrixCell(v,metric):"—"}</td>`;}).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function sortMatrix(code){
  if(state.matrixSortCode===code){state.matrixSortDir=state.matrixSortDir==="asc"?"desc":"asc";}
  else{state.matrixSortCode=code;state.matrixSortDir=state.matrixMetric==="rank"?"asc":"desc";}
  refreshMatrixData();
}
function goCountry(iso3){
  state.country=String(iso3||"").toUpperCase();
  state.page="country";
  location.hash="country";
  renderNav();
  renderLoadingShell();
  refreshData().then(()=>{renderNav();render();});
}
function toggleBenchmarkCountry(iso3){
  const code=String(iso3||"").toUpperCase();
  const i=state.customBenchmark.indexOf(code);
  if(i>=0)state.customBenchmark.splice(i,1);else state.customBenchmark.push(code);
  render();
}
function selectMapCountry(iso3,event){
  if(event&&(event.shiftKey||event.ctrlKey||event.metaKey)){toggleBenchmarkCountry(iso3);return;}
  goCountry(iso3);
}
function mapKey(event,iso3){
  if(event.key==="Enter"||event.key===" "){event.preventDefault();selectMapCountry(iso3,event);}
}
function policyRecommendations(items){
  if(!items.length)return`<p class="muted">${t("notAvailable")}</p>`;
  return items.slice(0,6).map((rec,i)=>{
    const problem = state.lang === "ru" ? (rec.problem_ru || rec.problem) : (rec.problem_en || rec.problem);
    const indicator = state.lang === "ru" ? (rec.indicator_ru || rec.indicator) : (rec.indicator_en || rec.indicator);
    const measure = state.lang === "ru" ? (rec.measure_ru || rec.measure) : (rec.measure_en || rec.measure);
    const actor = state.lang === "ru" ? (rec.actor_ru || rec.actor) : (rec.actor_en || rec.actor);
    const effect = state.lang === "ru" ? rec.expected_effect_ru : rec.expected_effect_en;
    const benchmark = state.lang === "ru" ? (rec.benchmark_ru || rec.benchmark) : (rec.benchmark_en || rec.benchmark);
    return `<details class="policy-item" ${i<3?"open":""}><summary><b>${i+1}. ${escapeHtml(rec.title_ru && state.lang === "ru" ? rec.title_ru : rec.title_en && state.lang === "en" ? rec.title_en : problem)}</b><span class="method-chip">${escapeHtml(rec.horizon||"")}</span></summary><p>${escapeHtml(problem||"")}</p><div class="mini-table"><div><span>${state.lang==="ru"?"Показатель":"Indicator"}</span><b>${escapeHtml(indicator||"")} ${rec.current_value==null?"":`· ${fmt(rec.current_value,2)} ${escapeHtml(rec.unit||"")}`}</b></div><div><span>${state.lang==="ru"?"Бенчмарк":"Benchmark"}</span><b>${escapeHtml(benchmark||"")}</b></div><div><span>${state.lang==="ru"?"Мера":"Measure"}</span><b>${escapeHtml(measure||"")}</b></div><div><span>${state.lang==="ru"?"Ответственный":"Actor"}</span><b>${escapeHtml(actor||"")}</b></div>${effect?`<div><span>${state.lang==="ru"?"Ожидаемый эффект":"Expected effect"}</span><b>${escapeHtml(effect)}</b></div>`:""}</div>${rec.evidence_value_id?`<button class="link-btn" data-gir-action="provenance" data-value-id="${escapeHtml(rec.evidence_value_id)}">${t("provenance")}</button>`:""}</details>`;
  }).join("");
}
function freshnessPill(item){
  if(!item)return"";
  const mode = item.ranking_mode || item.mode || item.scientific_profile?.mode;
  const oldest = item.oldest_source_year || item.scientific_profile?.oldest_source_year || item.source_data_year || item.value_year;
  const newest = item.newest_source_year || item.scientific_profile?.newest_source_year || item.source_data_year || item.value_year;
  const lag = item.average_lag ?? item.year_lag;
  if(mode === "asof_diagnostic") {
    const text = state.lang === "ru" ? `Диагностический ASOF-профиль: фактические годы компонентов ${oldest||"—"}–${newest||"—"}; синхронное место не присваивается.` : `Diagnostic ASOF profile: component years ${oldest||"—"}–${newest||"—"}; no synchronous rank is assigned.`;
    return `<div class="soft-note freshness-note warning-note">${escapeHtml(text)}</div>`;
  }
  if(!oldest && !newest)return"";
  const text=state.lang === "ru" ? `Фактические годы компонентов: ${oldest||"—"}–${newest||"—"}${lag==null?"":`; средний лаг ${fmt(lag,1)} г.`}` : `Actual component years: ${oldest||"—"}–${newest||"—"}${lag==null?"":`; average lag ${fmt(lag,1)} years`}`;
  return `<div class="soft-note freshness-note">${escapeHtml(text)}</div>`;
}
function rankingTable(rows, options={}){
  const asof = !!options.asof;
  return `<div class="table-wrap"><table class="data-table ranking-table ${asof?"asof-coverage-table":""}"><thead><tr>${asof?"":"<th>#</th>"}<th>${t("countryLabel")}</th><th>${t("score")}</th><th>${t("dataYear")}</th>${options.code==="HTEI"?`<th>${t("confidence")}</th><th>${t("coverage")}</th>`:""}<th>${t("source")}</th></tr></thead><tbody>${rows.map((r)=>`<tr>${asof?"":`<td><span class="rank-pill">${r.rank==null?"—":r.rank}</span></td>`}<td class="country-row"><button class="country-link" data-gir-action="country" data-iso="${escapeHtml(r.iso3)}">${flagImage(r,"flag-img inline")}<b>${escapeHtml(state.lang==="ru"?r.name_ru:r.name_en)}</b></button></td><td>${fmt(r.score??r.substantive_score,1)}</td><td>${r.newest_source_year||r.source_data_year||r.year||r.release_year||"—"}</td>${options.code==="HTEI"?`<td>${fmt((r.confidence_score||r.data_quality||0)*100,0)}%</td><td>${intFmt(r.available_components||0)}/6</td>`:""}<td>${r.value_id?`<button class="link-btn table-link" aria-label="${t("provenance")} provenance" data-gir-action="provenance" data-value-id="${escapeHtml(r.value_id)}">${escapeHtml(r.source_name||r.source_id||"HTEI v6")}</button>`:`<span class="tiny muted">${asof?t("noSynchronousRank"):"—"}</span>`}</td></tr>`).join("")}</tbody></table></div>`;
}
function componentBars(components){if(!components.length)return`<p class="muted">${t("notAvailable")}</p>`;const width=520,height=Math.max(190,34+components.length*38);let body="";components.forEach((c,i)=>{const y=30+i*38,v=Number(c.normalized_score||0);body+=`<text x="0" y="${y+14}" fill="var(--text)" font-size="12">${escapeHtml(componentName(c)).slice(0,34)}</text><rect x="226" y="${y}" width="220" height="20" fill="${cssVar("--chart-grid", "rgba(25,47,112,.16)")}"/><rect x="226" y="${y}" width="${220*v/100}" height="20" fill="${cssVar("--chart-accent", "#539D96")}"/><text x="458" y="${y+15}" fill="var(--text)" font-size="12">${fmt(v,1)}</text>`;});return svg(width,height,body,t("components"));}
function diagnosticList(components){if(!components.length)return`<p class="muted">${t("notAvailable")}</p>`;return components.map((c)=>`<div class="diagnostic"><div><b>${escapeHtml(componentName(c))}</b><div class="tiny muted">${t("contribution")}: ${fmt(c.weighted_contribution,1)} · ${t("leverage")}: ${fmt(c.rank_leverage,2)} · ${t("dataYear")}: ${c.source_data_year||c.year}</div><div class="bar"><span style="width:${Math.min(100,c.priority_score*1.5)}%"></span></div></div><button class="priority" aria-label="${t("provenance")} provenance" data-gir-action="provenance" data-value-id="${escapeHtml(c.value_id || "")}">${fmt(c.priority_score,0)}</button></div>`).join("");}
function componentTree(components){if(!components.length)return`<p class="muted">${t("notAvailable")}</p>`;return `<div class="component-tree">${components.map((c)=>`<details open><summary><b>${escapeHtml(state.lang==="ru"?c.name_ru:c.name_en)}</b><span>${Math.round(c.weight*100)}%</span></summary><div class="tiny muted">${escapeHtml(c.source_note||"")}</div><div class="mini-table">${(c.top_countries||[]).slice(0,5).map((x)=>`<div><span class="country-row">${flagImage(x,"flag-img inline")}${escapeHtml(state.lang==="ru"?x.country_name_ru:x.country_name_en)}</span><b>${fmt(x.normalized_score,1)}</b></div>`).join("")}</div></details>`).join("")}</div>`;}
function methodCard(index, components, formula){const text=formula?(state.lang==="ru"?formula.formula_text_ru:formula.formula_text_en):t("notAvailable");const norm=formula?(state.lang==="ru"?formula.normalization_ru:formula.normalization_en):"";return `<p class="muted">${escapeHtml(text)}</p><p class="tiny muted">${escapeHtml(norm)}</p><div>${components.map((c)=>`<div class="diagnostic"><span>${escapeHtml(componentName(c))}</span><b>${Math.round(c.weight*100)}%</b></div>`).join("")}</div>`;}
function hteiSourceBlock(payload){
  const sources=payload.source_contribution||[];
  const optional=payload.optional_components||[];
  const profile=payload.scientific_profile?.profile||{};
  const audit=payload.scientific_audit||payload.scientific_profile?.audit||{};
  const coverage=(payload.source_group_coverage||[]).join(" · ");
  const modeExplanation=state.lang === "ru" ? payload.scientific_profile?.mode_explanation_ru : payload.scientific_profile?.mode_explanation_en;
  return `<div class="card span12"><div class="chart-title"><h3>HTEI v6 · ${escapeHtml(hteiModeLabel(payload.mode||state.hteiMode))}</h3><span class="method-chip project">${t("projectIndex")}</span></div>${freshnessPill(profile)}<p>${escapeHtml(modeExplanation||"")}</p><div class="index-summary scientific-summary"><div><span>${t("coverage")}</span><b>${intFmt(profile.available_components||0)}/6</b></div><div><span>${t("confidence")}</span><b>${fmt((profile.confidence_score||0)*100,0)}%</b></div><div><span>${state.lang==="ru"?"Группы источников":"Source groups"}</span><b>${intFmt(profile.source_group_count||0)}</b></div><div><span>${state.lang==="ru"?"Вес доступных компонентов":"Available weight"}</span><b>${fmt((profile.available_weight||0)*100,0)}%</b></div></div><p class="tiny muted">${state.lang==="ru"?"Группы источников":"Source groups"}: ${escapeHtml(coverage||"—")}</p><div class="quality-list">${sources.map((s)=>`<div><b>${escapeHtml(s.component_code)}</b><span>${escapeHtml(s.source_id)} · ${escapeHtml(String(s.source_data_year||""))} · ${escapeHtml(s.proxy_status||"")}</span><em>${fmt(s.normalized_score,1)}</em></div>`).join("")}</div><details class="scientific-audit"><summary><b>${state.lang==="ru"?"Статистический аудит и устойчивость":"Statistical audit and robustness"}</b></summary><div class="mini-table"><div><span>Spearman mean</span><b>${fmt(audit.mean_spearman,3)}</b></div><div><span>Spearman min</span><b>${fmt(audit.min_spearman,3)}</b></div><div><span>${state.lang==="ru"?"Среднее изменение места":"Mean rank change"}</span><b>${fmt(audit.mean_absolute_rank_change,2)}</b></div><div><span>${state.lang==="ru"?"Максимальное изменение места":"Maximum rank change"}</span><b>${intFmt(audit.max_rank_change||0)}</b></div></div></details>${optional.length?`<details><summary><b>${state.lang==="ru"?"Отдельные исследовательские слои":"Separate research layers"}</b></summary><div class="mini-table">${optional.map((o)=>`<div><span>${escapeHtml(o.component_code)}</span><b>${escapeHtml(state.lang==="ru"?o.status_ru:o.status_en)}</b></div>`).join("")}</div></details>`:""}</div>`;
}
function qsTransparencyBlock(summary){if(!summary)return "";const cards=[["top100_count","Top 100"],["top250_count","Top 250"],["top500_count","Top 500"],["best_rank","Best rank"],["median_rank","Median rank"],["mean_rank","Mean rank"],["country_score",t("score")]];return `<div class="index-summary qs-summary">${cards.map(([key,label])=>`<div><span>${escapeHtml(label)}</span><b>${key.includes("rank")||key.includes("count")?intFmt(summary[key]):fmt(summary[key],1)}</b></div>`).join("")}</div><h4>${state.lang==="ru"?"Вклад вузов в страновой балл":"Institution contributions"}</h4><div class="mini-table">${(summary.institution_contributions||[]).slice(0,10).map((i)=>`<div><span>${escapeHtml(i.title)} ${i.rank?`#${i.rank}`:""}</span><b>${fmt((i.contribution_weight||0)*100,1)}%</b></div>`).join("")}</div>`;}
function qsInstitutionBlock(){const qs=DATA.index_payloads.QS_ET;const country=DATA.country.country;const institutions=(qs.qs_institutions||[]);return `<div class="card span12"><h3>${t("qsUniversities")}: ${escapeHtml(countryName(country))}</h3>${qsTransparencyBlock(qs.summary)}${qsInstitutionsTable(institutions)}</div>`;}
function qsInstitutionsTable(rows){if(!rows||!rows.length)return`<p class="muted">${t("notAvailable")}</p>`;return `<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>${state.lang==="ru"?"Университет":"University"}</th><th>${state.lang==="ru"?"Город":"City"}</th><th>${t("score")}</th></tr></thead><tbody>${rows.map((r)=>`<tr><td>${r.rank_display||r.rank||"—"}</td><td><b>${escapeHtml(r.title)}</b></td><td>${escapeHtml(r.city||"")}</td><td>${fmt(r.overall_score,1)}</td></tr>`).join("")}</tbody></table></div>`;}
function trainingRankingTable(rows){if(!rows||!rows.length)return`<p class="muted">${t("notAvailable")}</p>`;return `<div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>${t("countryLabel")}</th><th>${t("score")}</th><th>${t("dataQuality")}</th></tr></thead><tbody>${rows.slice(0,80).map((r)=>`<tr><td><span class="rank-pill">${r.rank}</span></td><td class="country-row">${flagImage(r,"flag-img inline")}<b>${state.lang==="ru"?r.name_ru:r.name_en}</b></td><td>${fmt(r.score,1)}</td><td>${fmt((r.data_quality||0)*100,0)}%</td></tr>`).join("")}</tbody></table></div>`;}
function modelBlocks(blocks){return `<div class="model-blocks">${(blocks||[]).map((b)=>`<div class="model-block"><h3>${escapeHtml(state.lang==="ru"?b.name_ru:b.name_en)} <span class="tiny muted">${fmt(b.score,1)}</span></h3>${(b.components||[]).map((c)=>`<div class="diagnostic"><div><b>${escapeHtml(state.lang==="ru"?c.component_name_ru:c.component_name_en)}</b><div class="tiny muted">${escapeHtml(c.component_ref)} · ${t("dataYear")}: ${c.source_data_year||c.year} · ${escapeHtml(c.source_id||"")}</div></div><span class="priority">${fmt(c.normalized_score,0)}</span></div>`).join("")}</div>`).join("")}</div>`;}
function methodologyRegistryTable(rows){
  if(!rows.length)return`<p class="muted">${t("notAvailable")}</p>`;
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>${state.lang==="ru"?"Модуль":"Module"}</th><th>${t("valueType")}</th><th>${t("components")}</th><th>${t("formula")}</th></tr></thead><tbody>${rows.map((r)=>{const generic=r.index_code==="HTEI"?t("projectIndex"):r.index_code==="QS_ET"?t("derived"):r.index_code==="HCI"?t("historicalOfficial"):t("official");return `<tr><td><b>${escapeHtml(indexLabel(r.index_code))}</b><br><span class="method-chip ${r.index_code==="HTEI"?"project":r.index_code==="QS_ET"?"derived":"official"}">${escapeHtml(generic)}</span></td><td>${escapeHtml(state.lang==="ru"?r.label_ru:r.label_en)}</td><td>${escapeHtml(r.component_status)}</td><td>${escapeHtml(r.formula_status)}</td></tr>`;}).join("")}</tbody></table></div>`;
}
function auditCard(a){
  if(!a)return`<p class="muted">${t("notAvailable")}</p>`;
  return `<div class="index-summary"><div><span>${state.lang==="ru"?"Страны":"Countries"}</span><b>${intFmt(a.countries||0)}</b></div><div><span>${state.lang==="ru"?"Прогонов":"Runs"}</span><b>${intFmt(a.run_count||0)}</b></div><div><span>Spearman min</span><b>${fmt(a.min_spearman,3)}</b></div><div><span>${state.lang==="ru"?"Среднее изменение места":"Mean rank change"}</span><b>${fmt(a.mean_absolute_rank_change,2)}</b></div></div><p class="tiny muted">${escapeHtml(a.methodology_version||"")}</p>`;
}
function sourcesTable(){return `<div class="grid">${DATA.sources.map((s)=>`<div class="src-card span3"><b>${escapeHtml(s.source_name||s.title)}</b><p class="tiny muted">${escapeHtml(s.owner)}<br>${escapeHtml(s.access_mode||"")}<br>${escapeHtml(s.latest_snapshot_id||s.retrieved_at||"")}</p></div>`).join("")}</div>`;}
function indexStack(){const layers=["sourceRegistry","rawSnapshots","rawIndicators","indexEngine","diagnostics","recommendations"];return `<div class="method-grid">${layers.map((k,i)=>`<div class="method-step"><b>${i+1}. ${escapeHtml(t(k))}</b><span class="muted tiny">${state.lang==="ru"?"проверяемый слой":"auditable layer"}</span></div>`).join("")}</div>`;}

function provenanceField(label, value, { html = false } = {}) {
  if (value == null || value === "" || (Array.isArray(value) && !value.length)) return "";
  const content = html ? value : escapeHtml(Array.isArray(value) ? value.join(", ") : value);
  return `<dt>${escapeHtml(label)}</dt><dd>${content}</dd>`;
}

function safeExternalLink(url) {
  const value = String(url || "");
  if (!/^https?:\/\//i.test(value)) return escapeHtml(value || "—");
  return `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
}

function renderProvenance(data) {
  const confidence = data.confidence_score == null ? null : `${fmt(Number(data.confidence_score) * 100, 0)}%`;
  const availableWeight = data.available_weight == null ? null : `${fmt(Number(data.available_weight) * 100, 0)}%`;
  const rowsHtml = [
    provenanceField("value_id", data.value_id),
    provenanceField("profile_id", data.profile_id),
    provenanceField("source_id", data.source_id),
    provenanceField(t("source"), [data.source_name, data.source_owner].filter(Boolean).map(escapeHtml).join("<br>"), { html: true }),
    provenanceField(state.lang === "ru" ? "Официальный URL" : "Official URL", safeExternalLink(data.source_url), { html: true }),
    provenanceField(state.lang === "ru" ? "Год релиза" : "Release year", data.release_year),
    provenanceField(t("dataYear"), data.source_data_year),
    provenanceField(t("retrieved"), data.retrieved_at),
    provenanceField(t("snapshot"), `<code>${escapeHtml(data.raw_snapshot_path || "—")}</code>`, { html: true }),
    provenanceField(t("checksum"), `<code>${escapeHtml(data.raw_snapshot_sha256 || "—")}</code>`, { html: true }),
    provenanceField("transform_id", data.transform_id),
    provenanceField("transformation_run_id", data.transformation_run_id),
    provenanceField(t("formula"), data.formula_version),
    provenanceField(t("dataQuality"), data.quality_flag),
    provenanceField(state.lang === "ru" ? "Режим" : "Mode", data.mode),
    provenanceField(t("confidence"), confidence),
    provenanceField(t("coverage"), data.available_components == null ? null : `${data.available_components} / 6`),
    provenanceField(state.lang === "ru" ? "Доступный вес" : "Available weight", availableWeight),
    provenanceField(state.lang === "ru" ? "Фактические годы" : "Source years", data.oldest_source_year == null ? null : `${data.oldest_source_year}–${data.newest_source_year}`),
    provenanceField(state.lang === "ru" ? "Компонент" : "Component", data.component_code),
    provenanceField(state.lang === "ru" ? "Исходный индикатор" : "Source indicator", data.indicator_code),
    provenanceField(state.lang === "ru" ? "Исходное значение" : "Raw value", data.raw_value),
    provenanceField(state.lang === "ru" ? "Единица" : "Unit", data.unit),
    provenanceField(state.lang === "ru" ? "Нормированный score" : "Normalised score", data.normalized_score),
    provenanceField(state.lang === "ru" ? "Базовый вес" : "Base weight", data.base_weight),
    provenanceField(state.lang === "ru" ? "Эффективный вес" : "Effective weight", data.effective_weight),
    provenanceField(t("contribution"), data.weighted_contribution),
    provenanceField(state.lang === "ru" ? "Статус proxy" : "Proxy status", data.proxy_status),
    provenanceField(state.lang === "ru" ? "Правило отбора" : "Selection rule", data.selection_rule),
    provenanceField(state.lang === "ru" ? "Интерпретация" : "Interpretation", state.lang === "ru" ? data.interpretation_ru : data.interpretation_en),
    provenanceField(state.lang === "ru" ? "Лицензия / условия" : "Licence / terms", data.license_or_terms),
  ].filter(Boolean).join("");
  const sourceGroups = data.source_group_coverage || [];
  const underlying = data.underlying_sources || [];
  const componentIds = data.component_value_ids || [];
  const chips = (label, values) => values.length ? `<section class="drawer-section"><h3>${escapeHtml(label)}</h3><div class="drawer-chip-list">${values.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div></section>` : "";
  const rawJson = data.provenance && Object.keys(data.provenance).length
    ? `<details class="drawer-section"><summary>${escapeHtml(state.lang === "ru" ? "Машиночитаемый provenance" : "Machine-readable provenance")}</summary><pre>${escapeHtml(JSON.stringify(data.provenance, null, 2))}</pre></details>`
    : "";
  return `<dl class="prov-list">${rowsHtml}</dl>${chips(state.lang === "ru" ? "Группы источников" : "Source groups", sourceGroups)}${chips(state.lang === "ru" ? "Исходные системы" : "Underlying sources", underlying)}${chips(state.lang === "ru" ? "Компонентные значения" : "Component values", componentIds)}${rawJson}`;
}

async function openProvenance(valueId, trigger = document.activeElement) {
  if (!valueId) return;
  openDrawer(`<div class="drawer-loading"><strong>${escapeHtml(state.lang === "ru" ? "Проверяется происхождение значения" : "Resolving value provenance")}</strong><p>${escapeHtml(valueId)}</p></div>`, {
    title: t("provenance"),
    kicker: "PROVENANCE",
    trigger,
  });
  try {
    const response = await fetch(`/api/provenance/value/${encodeURIComponent(valueId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.detail;
      throw new Error(typeof detail === "string" ? detail : (state.lang === "ru" ? "Доказательная запись не найдена." : "The evidence record was not found."));
    }
    const content = $("#drawer .drawer-content");
    if (content) content.innerHTML = renderProvenance(data);
  } catch (err) {
    const content = $("#drawer .drawer-content");
    if (content) content.innerHTML = `<div class="drawer-error"><strong>${escapeHtml(state.lang === "ru" ? "Не удалось открыть происхождение данных" : "Could not open provenance")}</strong><p>${escapeHtml(err.message || String(err))}</p></div>`;
  }
}

function openDrawer(html, { title = "", kicker = "", trigger = document.activeElement } = {}) {
  const drawer = $("#drawer");
  drawerReturnFocus = trigger?.focus ? trigger : document.activeElement;
  drawer.innerHTML = `<div class="drawer-backdrop" data-drawer-close></div><aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawerTitle"><header class="drawer-header"><div><span>${escapeHtml(kicker)}</span><h2 id="drawerTitle">${escapeHtml(title || (state.lang === "ru" ? "Подробности" : "Details"))}</h2></div><button type="button" class="drawer-close" data-drawer-close>${escapeHtml(t("close"))}</button></header><div class="drawer-content">${html}</div></aside>`;
  drawer.setAttribute("aria-hidden", "false");
  drawer.classList.add("open");
  $$('[data-drawer-close]', drawer).forEach((control) => { control.onclick = () => closeDrawer(); });
  window.setTimeout(() => $(".drawer-close", drawer)?.focus(), 0);
}

function closeDrawer({ restoreFocus = true } = {}) {
  const drawer = $("#drawer");
  if (!drawer?.classList.contains("open")) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = "";
  const target = drawerReturnFocus;
  drawerReturnFocus = null;
  if (restoreFocus && target?.focus && target.isConnected) target.focus();
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = String(message || "");
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 4200);

}
window.routeTo=routeTo;window.openProvenance=openProvenance;window.closeDrawer=closeDrawer;window.sortMatrix=sortMatrix;window.goCountry=goCountry;window.selectMapCountry=selectMapCountry;window.mapKey=mapKey;

load().catch(renderLoadError);
