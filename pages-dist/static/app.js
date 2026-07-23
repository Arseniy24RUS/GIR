const $ = (query, root = document) => root.querySelector(query);
const $$ = (query, root = document) => Array.from(root.querySelectorAll(query));
const INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"];
const INDEX_ROUTE_CODES = [...INDEX_ORDER, "NRI", "EGDI", "GCI", "GARI", "AIPI", "CF_IQI", "TOP500"];
// Compatibility metadata for the specialised digital workspaces. Navigation is
// rendered by index-portfolio.js, while this object keeps route discovery and
// bilingual labels available to the app shell and regression contracts.
const DIGITAL_AI_NAV_META = {
  navDigitalAi: {
    title_ru: "Цифровизация, ИИ и вычисления",
    title_en: "Digitalisation, AI & computing",
    items: [
      { key: "index-NRI", code: "NRI" },
      { key: "index-EGDI", code: "EGDI" },
      { key: "index-GCI", code: "GCI" },
      { key: "index-GARI", code: "GARI" },
      { key: "index-AIPI", code: "AIPI" },
      { key: "index-CF_IQI", code: "CF_IQI" },
      { key: "index-TOP500", code: "TOP500" },
    ],
  },
};
const NAV_INDEX_ORDER = ["HDI", "HCI_PLUS", "PISA_SKI", "GTCI", "GII", "IDI", "QS_ET", "THE_ENG", "ARWU", "HTEI"];
const STANDARD_INDEX_CODES = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET"];
const PORTFOLIO_INDEX_CODES = window.GIRIndexPortfolio?.allCodes?.() || NAV_INDEX_ORDER;
const SIDEBAR_STORAGE_KEY = "gir-sidebar";
const INDEX_GROUPS_STORAGE_KEY = "gir-index-groups-v1";
const PRODUCT_NAMES = {
  ru: "GIR — Глобальный рейтинг индексов",
  en: "GIR — Global Index Ranker",
};
const STATIC_INDEX_META = {
  HDI: { code: "HDI", short_name_ru: "ИЧР", short_name_en: "HDI", name_ru: "Индекс человеческого развития", name_en: "Human Development Index" },
  HCI_PLUS: { code: "HCI_PLUS", short_name_ru: "HCI+", short_name_en: "HCI+", name_ru: "Индекс человеческого капитала плюс", name_en: "Human Capital Index Plus" },
  PISA_SKI: { code: "PISA_SKI", short_name_ru: "PISA", short_name_en: "PISA", name_ru: "Индекс оценки знаний школьников PISA", name_en: "PISA School Knowledge Index" },
  GTCI: { code: "GTCI", short_name_ru: "GTCI", short_name_en: "GTCI", name_ru: "Индекс глобальной конкурентоспособности талантов", name_en: "Global Talent Competitiveness Index" },
  GII: { code: "GII", short_name_ru: "GII", short_name_en: "GII", name_ru: "Глобальный инновационный индекс", name_en: "Global Innovation Index" },
  IDI: { code: "IDI", short_name_ru: "IDI", short_name_en: "IDI", name_ru: "Индекс развития ИКТ", name_en: "ICT Development Index" },
  QS_ET: { code: "QS_ET", short_name_ru: "QS", short_name_en: "QS", name_ru: "QS: университеты и академические дисциплины", name_en: "QS University Intelligence" },
  THE_ENG: { code: "THE_ENG", short_name_ru: "THE", short_name_en: "THE", name_ru: "THE: инженерные науки", name_en: "THE Engineering" },
  ARWU: { code: "ARWU", short_name_ru: "ARWU", short_name_en: "ARWU", name_ru: "ARWU: исследовательские университеты", name_en: "ARWU Research Universities" },
  // GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — metadata
  EPI: { code: "EPI", short_name_ru: "EPI", short_name_en: "EPI", name_ru: "Индекс экологической эффективности", name_en: "Environmental Performance Index", authority: "Yale Center for Environmental Law & Policy / CIESIN", edition: 2026 },
  // GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — metadata
  ND_GAIN: { code: "ND_GAIN", short_name_ru: "ND-GAIN", short_name_en: "ND-GAIN", name_ru: "Страновой индекс ND-GAIN", name_en: "ND-GAIN Country Index", authority: "Notre Dame Global Adaptation Initiative", edition: 2026 },
  // GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — metadata
  ETI: { code: "ETI", short_name_ru: "ETI", short_name_en: "ETI", name_ru: "Индекс энергетического перехода", name_en: "Energy Transition Index", authority: "World Economic Forum / Accenture", edition: 2026 },
  // GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — metadata
  WORLD_RISK_INDEX: { code: "WORLD_RISK_INDEX", short_name_ru: "WRI", short_name_en: "WRI", name_ru: "Всемирный индекс риска", name_en: "WorldRiskIndex", authority: "Bündnis Entwicklung Hilft / IFHV, Ruhr University Bochum", edition: 2025 },
  GPI: { code: "GPI", short_name_ru: "GPI", short_name_en: "GPI", name_ru: "Глобальный индекс миролюбия", name_en: "Global Peace Index", authority: "Institute for Economics & Peace", edition: 2026 },
  GMI: { code: "GMI", short_name_ru: "GMI", short_name_en: "GMI", name_ru: "Глобальный индекс милитаризации", name_en: "Global Militarisation Index", authority: "BICC", edition: 2023 },
  GOCI: { code: "GOCI", short_name_ru: "GOCI", short_name_en: "GOCI", name_ru: "Глобальный индекс организованной преступности", name_en: "Global Organized Crime Index", authority: "GI-TOC", edition: 2025 },
  SIPRI_MILEX: { code: "SIPRI_MILEX", short_name_ru: "SIPRI", short_name_en: "SIPRI", name_ru: "Военные расходы SIPRI", name_en: "SIPRI Military Expenditure", authority: "SIPRI", edition: 2025 },
  DHL_GCI: { code: "DHL_GCI", short_name_ru: "DHL GCI", short_name_en: "DHL GCI", name_ru: "Глобальный индекс связанности DHL", name_en: "DHL Global Connectedness Index", authority: "DHL / NYU Stern", edition: 2026 },
  WORLD_BANK_LPI: { code: "WORLD_BANK_LPI", short_name_ru: "LPI", short_name_en: "LPI", name_ru: "Показатели эффективности логистики Всемирного банка", name_en: "World Bank Logistics Performance Indicators", authority: "World Bank", edition: 2024 },
  UNCTAD_LSCI: { code: "UNCTAD_LSCI", short_name_ru: "LSCI", short_name_en: "LSCI", name_ru: "Индекс связанности линейного судоходства UNCTAD", name_en: "UNCTAD Liner Shipping Connectivity Index", authority: "UN Trade and Development", edition: 2026 },
  SPI: { code: "SPI", short_name_ru: "SPI", short_name_en: "SPI", name_ru: "Индекс социального прогресса", name_en: "Social Progress Index", authority: "Social Progress Imperative" },
  SDG: { code: "SDG", short_name_ru: "SDG", short_name_en: "SDG", name_ru: "Индекс достижения ЦУР", name_en: "SDG Index", authority: "SDSN" },
  WHR: { code: "WHR", short_name_ru: "WHR", short_name_en: "WHR", name_ru: "Всемирный доклад о счастье", name_en: "World Happiness Report", authority: "Wellbeing Research Centre" },
  GGGI: { code: "GGGI", short_name_ru: "GGGI", short_name_en: "GGGI", name_ru: "Глобальный индекс гендерного разрыва", name_en: "Global Gender Gap Index", authority: "World Economic Forum" },
  UHC_SCI: { code: "UHC_SCI", short_name_ru: "UHC", short_name_en: "UHC", name_ru: "Индекс охвата основными медицинскими услугами", name_en: "UHC Service Coverage Index", authority: "WHO / World Bank" },
  CPI: { code: "CPI", short_name_ru: "CPI", short_name_en: "CPI", name_ru: "Индекс восприятия коррупции", name_en: "Corruption Perceptions Index", authority: "Transparency International" },
  WPFI: { code: "WPFI", short_name_ru: "WPFI", short_name_en: "WPFI", name_ru: "Индекс свободы прессы", name_en: "World Press Freedom Index", authority: "Reporters Without Borders" },
  ROLI: { code: "ROLI", short_name_ru: "WJP", short_name_en: "WJP", name_ru: "Индекс верховенства права WJP", name_en: "WJP Rule of Law Index", authority: "World Justice Project" },
  WGI: { code: "WGI", short_name_ru: "WGI", short_name_en: "WGI", name_ru: "Показатели государственного управления", name_en: "Worldwide Governance Indicators", authority: "World Bank", edition: 2025 },
  VDEM: { code: "VDEM", short_name_ru: "V-Dem", short_name_en: "V-Dem", name_ru: "Индексы демократии V-Dem", name_en: "V-Dem Democracy Indices", authority: "V-Dem Institute", edition: 2026 },
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
  country: "flag.svg",
  matrix: "table-2.svg",
  "htei-model": "graduation-cap.svg",
  "policy-center": "briefcase-business.svg",
  "data-lab": "chart-no-axes-combined.svg",
  "data-updates": "database.svg",
  methodology: "database.svg",
  acceptance: "clipboard-check.svg",
  portfolio: "boxes.svg",
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
let navigationGeneration = 0;
window.__GIIP_READY__ = false;

const params = new URLSearchParams(location.search);
const initialUserContext = window.GIRUserContext?.snapshot?.() || { language: "en", country: null };
const initialLang = initialUserContext.language;
const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
const state = {
  page: "landing",
  country: initialUserContext.country || null,
  pisaEntity: (params.get("pisa_entity") || initialUserContext.country || "").toUpperCase() || null,
  year: Number(params.get("year") || 0),
  index: normalizeIndex(params.get("index") || "HTEI"),
  lang: initialLang === "en" ? "en" : "ru",
  theme: ["light", "dark"].includes(params.get("theme") || localStorage.getItem("theme")) ? (params.get("theme") || localStorage.getItem("theme")) : preferredTheme,
  trendMetric: "rank",
  hteiMode: params.get("htei_mode") || "common_support",
  wgiDimension: (["VA", "PV", "GE", "RQ", "RL", "CC"].includes((params.get("dimension") || "GE").toUpperCase()) ? (params.get("dimension") || "GE").toUpperCase() : "GE"),
  vdemDimension: (["EDI", "LDI", "PDI", "DDI", "EGDI"].includes((params.get("dimension") || "EDI").toUpperCase()) ? (params.get("dimension") || "EDI").toUpperCase() : "EDI"),
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
  openIndexGroups: null,
};
state.openIndexGroups = readOpenIndexGroups();

const COPY = {
  ru: {
    landing: "Главная",
    country: "Профиль страны",
    commandTitle: "Панель ЛПР по стране",
    commandText: "Сводная аналитика по международным индексам человеческого капитала, талантов, инноваций, цифровой инфраструктуры, инженерно-технологического образования и высокотехнологичной занятости.",
    landingMeta: "GIR объединяет 44 индекса и рейтинга в восьми тематических направлениях: профили стран, сравнения, исходные данные, методологии и воспроизводимые аналитические модели.",
    matrix: "Сравнение стран",
    methodology: "Методология и источники",
    acceptance: "ТЗ МГИМО / Приёмка",
    hteiModel: "Модель подготовки кадров",
    policyCenter: "Рекомендации России",
    dataLab: "Данные и исследование",
    dataExplorer: "Обозреватель данных",
    dataUpdates: "Обновление данных",
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
    navPortfolio: "Индексы и рейтинги",
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
    landingMeta: "GIR brings 44 indices and rankings across eight thematic groups into one evidence environment for country profiles, comparison, source data and reproducible analytical models.",
    matrix: "Country comparison",
    methodology: "Methodology and sources",
    acceptance: "MGIMO ToR / Acceptance",
    hteiModel: "Training-system model",
    policyCenter: "Russia recommendations",
    dataLab: "Data & research",
    dataExplorer: "Data Explorer",
    dataUpdates: "Data updates",
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
    navPortfolio: "Indices & rankings",
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
  if (["THE", "THEENG", "THE_ENGINEERING", "THE__ENG"].includes(value)) return "THE_ENG";
  if (["PISA", "PISA_SCHOOL", "PISA_SCHOOL_KNOWLEDGE", "SCHOOL_KNOWLEDGE", "PISA__SKI"].includes(value)) return "PISA_SKI";
  if (["SHANGHAI", "SHANGHAI_RANKING", "SHANGHAI_ARWU", "ARWU_GIR"].includes(value)) return "ARWU";
  if (["SOCIAL_PROGRESS", "SOCIAL_PROGRESS_INDEX", "SPI"].includes(value)) return "SPI";
  if (["SDG_INDEX", "SDG"].includes(value)) return "SDG";
  if (["WORLD_HAPPINESS", "HAPPINESS", "WHR"].includes(value)) return "WHR";
  if (["GLOBAL_GENDER_GAP", "GENDER_GAP", "GGGI"].includes(value)) return "GGGI";
  if (["WHO_UHC", "UHC", "UHC_SCI"].includes(value)) return "UHC_SCI";
  if (["PRESS_FREEDOM", "WORLD_PRESS_FREEDOM", "WPFI"].includes(value)) return "WPFI";
  if (["WJP_ROL", "WJP_RULE_OF_LAW", "RULE_OF_LAW", "ROLI"].includes(value)) return "ROLI";
  if (["GLOBAL_PEACE", "PEACE_INDEX", "GPI"].includes(value)) return "GPI";
  if (["GLOBAL_MILITARISATION", "GLOBAL_MILITARIZATION", "MILITARISATION", "GMI"].includes(value)) return "GMI";
  if (["ORG_CRIME", "OC_INDEX", "GLOBAL_ORGANIZED_CRIME", "GOCI"].includes(value)) return "GOCI";
  if (["SIPRI", "MILEX", "SIPRI_MILEX"].includes(value)) return "SIPRI_MILEX";
  if (["DHL_CONNECTEDNESS", "DHL", "GCI_DHL", "DHL_GCI"].includes(value)) return "DHL_GCI";
  if (["LPI", "WB_LPI", "WB_LPI2", "LPI2", "WORLD_BANK_LPI"].includes(value)) return "WORLD_BANK_LPI";
  if (["LSCI", "UNCTAD_LSCI"].includes(value)) return "UNCTAD_LSCI";
  // GIR PATCH:T17 Digitalisation, AI & compute aliases.
  if (["NETWORK_READINESS", "NETWORK_READINESS_INDEX", "NRI"].includes(value)) return "NRI";
  if (["E_GOVERNMENT", "E_GOVERNMENT_DEVELOPMENT", "EGDI"].includes(value)) return "EGDI";
  if (["ITU_GCI", "GLOBAL_CYBERSECURITY_INDEX", "GCI"].includes(value)) return "GCI";
  if (["GOV_AI_READINESS", "GOVERNMENT_AI_READINESS", "GAIR", "GARI"].includes(value)) return "GARI";
  if (["IMF_AIPI", "AI_PREPAREDNESS", "AIPI"].includes(value)) return "AIPI";
  if (["CLOUDFLARE_IQI", "INTERNET_QUALITY_INDEX", "IQI", "CF_IQI"].includes(value)) return "CF_IQI";
  if (["TOP500_COUNTRY", "TOP500_COUNTRY_AGGREGATION", "TOP500"].includes(value)) return "TOP500";
  // GIR PATCH: T16 Economy & Finance aliases.
  if (["PCI", "UNCTAD_PCI"].includes(value)) return "UNCTAD_PCI";
  if (["B_READY", "BUSINESS_READY", "BREADY"].includes(value)) return "BREADY";
  if (["ECI", "ECONOMIC_COMPLEXITY"].includes(value)) return "ECI";
  if (["KOF", "KOFGI", "KOF_GLOBAL", "KOF_GLOBALISATION"].includes(value)) return "KOF_GLOBAL";
  if (["FD", "FDI", "IMF_FDI", "FINANCIAL_DEVELOPMENT"].includes(value)) return "IMF_FDI";
  if (["FINDEX", "GLOBAL_FINDEX"].includes(value)) return "GLOBAL_FINDEX";
  // GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — normalize
  if (value === "EPI") return "EPI";
  // GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — normalize
  if (["ND_GAIN", "NDGAIN"].includes(value)) return "ND_GAIN";
  // GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — normalize
  if (["ETI", "ETI_TRANSITION", "ENERGY_TRANSITION", "ENERGY_TRANSITION_INDEX"].includes(value)) return "ETI";
  // GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — normalize
  if (["WORLD_RISK_INDEX", "WORLD_RISK", "WORLDRISK", "WORLDRISKINDEX", "WRI"].includes(value)) return "WORLD_RISK_INDEX";
  return PORTFOLIO_INDEX_CODES.includes(value) ? value : "HTEI";
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fmt(value, digits = 1) { return value == null || Number.isNaN(Number(value)) ? "—" : Number(value).toFixed(digits); }
function intFmt(value) { return value == null ? "—" : Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US"); }
function isTheEngineeringPage(page) { return normalizeIndex(String(page || "").replace("index-", "")) === "THE_ENG" && String(page || "").startsWith("index-"); }
function isPisaSchoolPage(page) { return normalizeIndex(String(page || "").replace("index-", "")) === "PISA_SKI" && String(page || "").startsWith("index-"); }
function isArwuPage(page) { return normalizeIndex(String(page || "").replace("index-", "")) === "ARWU" && String(page || "").startsWith("index-"); }
// GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — standalone workspace
// GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — standalone workspace
// GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — standalone workspace
// GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — standalone workspace
function isNriPage(page) { return page === "index-NRI"; }
function isEgdiPage(page) { return page === "index-EGDI"; }
function isGciPage(page) { return page === "index-GCI"; }
function isGariPage(page) { return page === "index-GARI"; }
function isAipiPage(page) { return page === "index-AIPI"; }
function isIqiPage(page) { return page === "index-CF_IQI"; }
function isTop500Page(page) { return page === "index-TOP500"; }
function isStandardIndexPage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return STANDARD_INDEX_CODES.includes(normalizeIndex(page.replace("index-", "")));
}
function isPlannedIndexPage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return Boolean(window.GIRIndexPortfolio?.isPlanned?.(normalizeIndex(page.replace("index-", ""))));
}
const SECURITY_CONNECTIVITY_CODES = new Set(["GPI", "GMI", "GOCI", "SIPRI_MILEX", "DHL_GCI", "WORLD_BANK_LPI", "UNCTAD_LSCI"]);
function isSecurityConnectivityPage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return SECURITY_CONNECTIVITY_CODES.has(normalizeIndex(page.replace("index-", "")));
}

const ECONOMY_FINANCE_CODES = new Set(["UNCTAD_PCI", "BREADY", "ECI", "KOF_GLOBAL", "IMF_FDI", "GLOBAL_FINDEX"]);
const ECONOMY_FINANCE_MODULES = Object.freeze({
  UNCTAD_PCI: { global: "GIRPCI", viewClass: "pci-view" },
  BREADY: { global: "GIRBREADY", viewClass: "bready-view" },
  ECI: { global: "GIRECI", viewClass: "eci-view" },
  KOF_GLOBAL: { global: "GIRKOF", viewClass: "kof-view" },
  IMF_FDI: { global: "GIRFDI", viewClass: "fdi-view" },
  GLOBAL_FINDEX: { global: "GIRFindex", viewClass: "findex-view" },
});
function isEconomyFinancePage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return ECONOMY_FINANCE_CODES.has(normalizeIndex(page.replace("index-", "")));
}
function renderEconomyFinanceWorkspace(code) {
  const root = $("#view");
  const config = ECONOMY_FINANCE_MODULES[code];
  const module = config ? window[config.global] : null;
  if (!root || !config || typeof module?.render !== "function") {
    if (root) root.innerHTML = `<section class="card"><h1>${escapeHtml(currentPageLabel())}</h1><p>${escapeHtml(state.lang === "ru" ? "Аналитический модуль временно недоступен." : "The analytical workspace is temporarily unavailable.")}</p></section>`;
    return;
  }
  return module.render({ root, lang: state.lang, theme: state.theme, country: state.country, year: state.year });
}

const SOCIETY_INDEX_ORDER = ["SPI", "SDG", "WHR", "GGGI", "UHC_SCI"];
const GOVERNANCE_INDEX_ORDER = ["CPI", "WPFI", "ROLI"];
const GOVERNANCE_DIMENSION_CODES = new Set(["WGI", "VDEM"]);
function isGovernanceDimensionPage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return GOVERNANCE_DIMENSION_CODES.has(normalizeIndex(page.replace("index-", "")));
}
const THEMATIC_INDEX_ORDER = [...SOCIETY_INDEX_ORDER, ...GOVERNANCE_INDEX_ORDER];
const THEMATIC_GROUP_LABELS = { ru: { society: "Общество и человеческое развитие", governance: "Государство и институты" }, en: { society: "Society and human development", governance: "Governance & institutions" } };
const SOCIETY_GOVERNANCE_CODES = new Set(THEMATIC_INDEX_ORDER);
function isSocietyIndexPage(page) {
  if (!String(page || "").startsWith("index-")) return false;
  return SOCIETY_GOVERNANCE_CODES.has(normalizeIndex(page.replace("index-", "")));
}

function pageUsesPlatformContext(page) { return page === "country" || PLATFORM_CONTEXT_PAGES.has(page) || isStandardIndexPage(page) || isTheEngineeringPage(page) || isPisaSchoolPage(page) || isArwuPage(page) || isSecurityConnectivityPage(page) || isSocietyIndexPage(page) || isGovernanceDimensionPage(page) || isNriPage(page) || isEgdiPage(page) || isGciPage(page) || isGariPage(page) || isAipiPage(page) || isIqiPage(page) || isTop500Page(page); }
function activeContext() {
  return DATA || PLATFORM_CONTEXT || {
    countries: window.GIRUserContext?.snapshot?.().countries || [],
    years: [], indices: [], regions: [], income_groups: [],
  };
}
function byCode(code) {
  return DATA?.indices?.find((item) => item.code === code)
    || PLATFORM_CONTEXT?.indices?.find((item) => item.code === code)
    || STATIC_INDEX_META[code]
    || window.GIRIndexPortfolio?.meta?.(code)
    || { code, short_name_ru: code, short_name_en: code, name_ru: code, name_en: code };
}
function indexPayload(code) { return DATA.index_payloads[code]; }
function countryName(country) { return state.lang === "ru" ? country.name_ru : country.name_en; }
function selectUserCountry(iso3) {
  const code = String(iso3 || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return false;
  if (code !== state.country) {
    LANDING_SUMMARY = null;
    LANDING_SUMMARY_LOADING = null;
  }
  state.country = code;
  window.GIRUserContext?.setManualCountry?.(code);
  return true;
}
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
function initialCountryName() { return state.country || (state.lang === "ru" ? "Страна не выбрана" : "Country not selected"); }
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
  return `<span class="flag-slot ${size}"><img class="${className}" src="/static/flags/${iso2}.svg" alt="${label}" loading="lazy" decoding="async" data-flag-image><span class="flag-fallback ${size}" aria-label="${label}">${iso}</span></span>`;
}
function cleanSelectText(text) { return String(text || "").replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").trim(); }
function selectShell(selectHtml, label) { return `<span class="select-shell">${selectHtml}<span class="select-display" aria-hidden="true">${escapeHtml(cleanSelectText(label))}</span></span>`; }
function syncSelectDisplay(select) {
  const display = select.closest(".select-shell")?.querySelector(".select-display");
  if (!display) return;
  display.textContent = cleanSelectText(select.selectedOptions[0]?.textContent || select.value);
  if (select.id === "countrySelect") {
    const country = activeContext().countries?.find((item) => item.iso3 === select.value);
    const iso2 = flagIso2(country) || String(select.selectedOptions[0]?.dataset.iso2 || "").toLowerCase();
    const image = iso2 ? `url("/static/flags/${iso2}.svg")` : "none";
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
  const prefix = "/static/brand/";
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
    else if (state.page === "index-THE_ENG") description.content = state.lang === "ru"
      ? "THE Engineering 2026 в GIR: официальная университетская методика, разрешённый доказательный слой и прозрачная производная страновая диагностика."
      : "THE Engineering 2026 in GIR: the official institution methodology, rights-governed evidence and a transparent derived country diagnostic.";
    else if (state.page === "index-PISA_SKI") description.content = state.lang === "ru"
      ? "PISA 2022 в GIR: официальные результаты ОЭСР по математике, чтению и естественным наукам, международные ориентиры, качество данных и прозрачная сводная оценка GIR."
      : "PISA 2022 in GIR: official OECD mathematics, reading and science results, international benchmarks, data quality and a transparent GIR composite.";
    else if (state.page === "index-ARWU") description.content = state.lang === "ru"
      ? "ARWU 2025 в GIR: официальная методика ShanghaiRanking, университетский слой, международное поле и прозрачная производная страновая диагностика исследовательских университетов."
      : "ARWU 2025 in GIR: the official ShanghaiRanking methodology, institution layer, international field and a transparent derived country research-university diagnostic.";
    else if (state.page === "index-EPI") description.content = state.lang === "ru"
      ? "EPI 2026 в GIR: экологическая результативность 177 стран, 63 компонента, карта, иерархия показателей, рейтинг, методика и provenance."
      : "EPI 2026 in GIR: environmental performance across 177 countries, 63 components, map, indicator hierarchy, ranking, methodology and provenance.";
    else if (state.page === "index-ND_GAIN") description.content = state.lang === "ru"
      ? "ND-GAIN в GIR: климатическая уязвимость и готовность к адаптации, проверенная панель 1995–2021 и отдельно документированный официальный выпуск 2026."
      : "ND-GAIN in GIR: climate vulnerability and adaptation readiness, a verified 1995–2021 panel and a separately documented official 2026 release.";
    else if (state.page === "index-ETI") description.content = state.lang === "ru"
      ? "Energy Transition Index 2026 в GIR: энергетическая система, готовность к переходу, 44 индикатора и международное сравнение 120 стран."
      : "Energy Transition Index 2026 in GIR: energy-system performance, transition readiness, 44 indicators and comparison across 120 countries.";
    else if (state.page === "index-WORLD_RISK_INDEX") description.content = state.lang === "ru"
      ? "WorldRiskIndex 2025 в GIR: риск природных бедствий, экспозиция, уязвимость и официальный сопоставимый ряд 2000–2025 для 193 стран."
      : "WorldRiskIndex 2025 in GIR: disaster risk, exposure, vulnerability and the official harmonised 2000–2025 panel for 193 countries.";
    else if (isSocietyIndexPage(state.page)) description.content = state.lang === "ru"
      ? `${currentPageLabel()}: официальный международный показатель, страновой профиль, компоненты, динамика, методика и доказательная цепочка.`
      : `${currentPageLabel()}: official international measure, country profile, components, trends, methodology and evidence chain.`;
    else if (state.page === "index-WGI") description.content = state.lang === "ru"
      ? "Worldwide Governance Indicators в GIR: шесть официальных измерений Всемирного банка, неопределённость, динамика и source-level данные без искусственного общего индекса."
      : "Worldwide Governance Indicators in GIR: six official World Bank dimensions, uncertainty, trends and source-level evidence without an invented overall index.";
    else if (state.page === "index-VDEM") description.content = state.lang === "ru"
      ? "V-Dem v16 в GIR: пять самостоятельных индексов демократии, исторические политии, интервалы неопределённости и международное сравнение без искусственного среднего."
      : "V-Dem v16 in GIR: five distinct democracy indices, historical polities, uncertainty intervals and international comparison without an invented average.";
    else if (isSecurityConnectivityPage(state.page)) description.content = state.lang === "ru"
      ? `${currentPageLabel()}: международные данные безопасности и связанности, страновой профиль, доказательная база, методика и ограничения интерпретации.`
      : `${currentPageLabel()}: international security and connectedness data, country profile, evidence, methodology and interpretation limits.`;
    else if (isEconomyFinancePage(state.page)) description.content = state.lang === "ru"
      ? `${currentPageLabel()}: официальные международные экономические и финансовые данные, страновой профиль, динамика, международное поле, методика и provenance.`
      : `${currentPageLabel()}: official international economy and finance data, country profile, trends, international field, methodology and provenance.`;
    else if (isPlannedIndexPage(state.page)) {
      const planned = window.GIRIndexPortfolio?.get?.(normalizeIndex(state.page.replace("index-", "")));
      const name = planned ? (state.lang === "ru" ? planned.name_ru : planned.name_en) : currentPageLabel();
      description.content = state.lang === "ru"
        ? `${name}: подготовленная страница тематического портфеля GIR до публикации проверенного числового выпуска.`
        : `${name}: a prepared GIR thematic-portfolio page pending a validated numeric release.`;
    }
    else if (state.page === "data-updates") description.content = state.lang === "ru"
      ? "Центр обновления данных GIR: реестр источников, проверка выпусков, staging, научные gates, атомарная публикация и rollback."
      : "GIR Data Update Center: source registry, release checks, staging, scientific gates, atomic publication and rollback.";
    else description.content = t("commandText");
  }
  const footerBrand = $("#footerBrand");
  if (footerBrand) footerBrand.textContent = state.lang === "ru" ? "© 2026 GIR / МГИМО — ФНИСЦ РАН" : "© 2026 GIR / MGIMO — FCTAS RAS";
  const themeIcon = $("#themeIcon");
  if (themeIcon) themeIcon.src = state.theme === "dark" ? "/static/icons/sun.svg" : "/static/icons/moon.svg";
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
  if (state.page === "data-updates") return t("dataUpdates");
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
  const availableContext = activeContext();
  if (!state.country && (availableContext.countries || []).length) {
    const message = state.lang === "ru"
      ? "Не удалось определить страну автоматически. Выберите её, чтобы открыть страновые данные."
      : "Your country could not be detected automatically. Select it to open country data.";
    bar.hidden = false;
    bar.innerHTML = `<div class="context-heading"><span>${escapeHtml(state.lang === "ru" ? "Контекст пользователя" : "User context")}</span><strong>${escapeHtml(message)}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}" required>${countryOptions()}</select>`, state.lang === "ru" ? "Выберите страну" : "Select a country")}</label></div>`;
    return;
  }
  const isIndependentPage = state.page === "landing" || state.page === "methodology" || isEconomyFinancePage(state.page);
  const isAuxiliaryIndependentPage = state.page === "data-updates" || isPlannedIndexPage(state.page);
  const shouldHideContextBar = isIndependentPage || isAuxiliaryIndependentPage;
  bar.hidden = shouldHideContextBar;
  if (shouldHideContextBar) { bar.replaceChildren(); return; }
  if (isSocietyIndexPage(state.page)) {
    const thematicCode = normalizeIndex(state.page.replace("index-", ""));
    state.index = thematicCode;
    bar.hidden = false;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls" data-society-context-host data-society-code="${escapeHtml(thematicCode)}"><span class="tiny muted">${escapeHtml(state.lang === "ru" ? "Загрузка стран и периодов…" : "Loading countries and periods…")}</span></div>`;
    return;
  }
  const securityContext = {
    "index-GPI": { period: "2026", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-GMI": { period: "GMI 2023 · данные 2022", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-GOCI": { period: "2021 · 2023 · 2025", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-SIPRI_MILEX": { period: "1949–2025", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-DHL_GCI": { period: "2001–2024 / отчёт 2026", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-WORLD_BANK_LPI": { period: "2007–2024", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
    "index-UNCTAD_LSCI": { period: "2006 Q1–2026 Q2", sectionRu: "Безопасность и международная связанность", sectionEn: "Security & international connectedness" },
  }[state.page];
  const digitalContext = {
    "index-NRI": { edition: "2025 · published 04.02.2026" },
    "index-EGDI": { edition: "2024" },
    "index-GCI": { edition: "2024" },
    "index-GARI": { edition: "2025 · corrected 2026" },
    "index-AIPI": { edition: "2023" },
    "index-CF_IQI": { edition: state.lang === "ru" ? "контракт данных" : "data contract" },
    "index-TOP500": { edition: "June 2026" },
  }[state.page];
  if (digitalContext) {
    const ctx = activeContext();
    const selected = (ctx.countries || []).find((item) => item.iso3 === state.country) || { iso3: state.country, name_ru: initialCountryName(), name_en: initialCountryName() };
    bar.hidden = false;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}">${countryOptions()}</select>`, countryName(selected))}</label><div class="context-fixed"><span>${state.lang === "ru" ? "Раздел" : "Section"}</span><strong>${escapeHtml(state.lang === "ru" ? "Цифровизация, ИИ и вычислительные мощности" : "Digitalisation, AI & compute")}</strong></div><div class="context-fixed"><span>${state.lang === "ru" ? "Выпуск" : "Edition"}</span><strong>${escapeHtml(digitalContext.edition)}</strong></div></div>`;
    return;
  }
  if (securityContext) {
  const ctx = activeContext();
    const selected = (ctx.countries || []).find((item) => item.iso3 === state.country) || { iso3: state.country, name_ru: initialCountryName(), name_en: initialCountryName() };
    bar.hidden = false;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}">${countryOptions()}</select>`, countryName(selected))}</label><div class="context-fixed"><span>${state.lang === "ru" ? "Раздел" : "Section"}</span><strong>${escapeHtml(state.lang === "ru" ? securityContext.sectionRu : securityContext.sectionEn)}</strong></div><div class="context-fixed"><span>${state.lang === "ru" ? "Выпуск / период" : "Edition / period"}</span><strong>${escapeHtml(securityContext.period)}</strong></div></div>`;
    return;
  }
  // GIR PATCH: ECOLOGY/NATIVE FRONTEND REVISION 06R — context bar
  const ecologyContext = {
    // GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — context
    "index-EPI": { edition: "2026", sectionRu: "Экология и устойчивость", sectionEn: "Environment & Sustainability" },
    // GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — context
    "index-ND_GAIN": { edition: "1995–2021 / выпуск 2026", sectionRu: "Экология и устойчивость", sectionEn: "Environment & Sustainability" },
    // GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — context
    "index-ETI": { edition: "2026", sectionRu: "Экология и устойчивость", sectionEn: "Environment & Sustainability" },
    // GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — context
    "index-WORLD_RISK_INDEX": { edition: "2000–2025", sectionRu: "Экология и устойчивость", sectionEn: "Environment & Sustainability" },
  }[state.page];
  if (ecologyContext) {
    bar.hidden = false;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div>
      <div class="context-controls context-fixed-controls"><div class="context-fixed"><span>${state.lang === "ru" ? "Раздел" : "Section"}</span><strong>${escapeHtml(state.lang === "ru" ? ecologyContext.sectionRu : ecologyContext.sectionEn)}</strong></div><div class="context-fixed"><span>${state.lang === "ru" ? "Выпуск / период" : "Edition / period"}</span><strong>${escapeHtml(ecologyContext.edition)}</strong></div></div>`;
    return;
  }
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
  if (state.page === "index-PISA_SKI") {
    const pisaSelected = (ctx.countries || []).find((item) => item.iso3 === state.pisaEntity);
    const entityLabel = pisaSelected ? countryName(pisaSelected) : state.pisaEntity;
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls context-fixed-controls"><div class="context-fixed"><span>${state.lang === "ru" ? "Образовательная система" : "Education system"}</span><strong data-pisa-context-entity>${escapeHtml(entityLabel)}</strong></div><div class="context-fixed"><span>${state.lang === "ru" ? "Сопоставимый цикл" : "Comparable cycle"}</span><strong>2022</strong></div></div>`;
    return;
  }
  if (state.page === "index-THE_ENG") {
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}">${countryOptions()}</select>`, countryName(selected))}</label><div class="context-fixed"><span>${state.lang === "ru" ? "Редакция рейтинга" : "Ranking edition"}</span><strong>2026</strong></div></div>`;
    return;
  }
  if (state.page === "index-ARWU") {
    bar.innerHTML = `<div class="context-heading"><span>${t("contextLabel")}</span><strong>${escapeHtml(currentPageLabel())}</strong></div><div class="context-controls"><label><span>${t("countryLabel")}</span>${selectShell(`<select id="countrySelect" class="select" aria-label="${t("countryLabel")}">${countryOptions()}</select>`, countryName(selected))}</label><div class="context-fixed"><span>${state.lang === "ru" ? "Редакция ARWU" : "ARWU edition"}</span><strong>2025</strong></div></div>`;
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
    if (!selectUserCountry(event.target.value)) return;
    if (isNriPage(state.page)) { window.GIRNriWorkspace?.invalidate?.(); render(); }
    else if (isEgdiPage(state.page)) { window.GIREgdiWorkspace?.invalidate?.(); render(); }
    else if (isGciPage(state.page)) { window.GIRGciWorkspace?.invalidate?.(); render(); }
    else if (isGariPage(state.page)) { window.GIRGariWorkspace?.invalidate?.(); render(); }
    else if (isAipiPage(state.page)) { window.GIRAipiWorkspace?.invalidate?.(); render(); }
    else if (isIqiPage(state.page)) { window.GIRIqiWorkspace?.invalidate?.(); render(); }
    else if (isTop500Page(state.page)) { window.GIRTop500Workspace?.invalidate?.(); render(); }
    else if (state.page === "index-THE_ENG") { window.GIRTHEEngineering?.invalidate?.({ country: state.country }); render(); }
    else if (state.page === "index-ARWU") { window.GIRARWU?.invalidate?.({ country: state.country }); render(); }
    else if (isSecurityConnectivityPage(state.page)) {
      const modules = { GPI: window.GIRGPI, GMI: window.GIRGMI, GOCI: window.GIRGOCI, SIPRI_MILEX: window.GIRSIPRIMilex, DHL_GCI: window.GIRDHLGCI, WORLD_BANK_LPI: window.GIRWorldBankLPI, UNCTAD_LSCI: window.GIRUNCTADLSCI };
      modules[state.index]?.invalidate?.();
      render();
    }
    else if (state.page === "country") { window.GIRCountryPortfolioV3?.clearCache?.(); window.GIRCountryProfileV2?.clearCache?.(); render(); }
    else if (isStandardIndexPage(state.page)) { window.GIRIndexWorkspace?.invalidate?.(state.index, state.country, state.year); render(); }
    else if (state.page === "htei-model") { window.GIRStage4?.invalidateTraining?.(state.country, state.year); render(); }
    else refreshData().then(render).catch(renderLoadError);
  };
  const yearSelect = $("#yearSelect");
  if (yearSelect) yearSelect.onchange = (event) => {
    state.year = Number(event.target.value);
    if (state.page === "country") { window.GIRCountryPortfolioV3?.clearCache?.(); window.GIRCountryProfileV2?.clearCache?.(); render(); }
    else if (state.page === "matrix" || isStandardIndexPage(state.page) || state.page === "htei-model") render();
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
  if (toggleIcon) toggleIcon.src = expandedForAria ? "/static/icons/panel-left-close.svg" : "/static/icons/panel-left-open.svg";
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

function readOpenIndexGroups() {
  try {
    const parsed = JSON.parse(localStorage.getItem(INDEX_GROUPS_STORAGE_KEY) || "null");
    const known = new Set((window.GIRIndexPortfolio?.groups?.() || []).map((group) => group.key));
    if (Array.isArray(parsed)) return new Set(parsed.filter((key) => known.has(key)));
  } catch (_) { /* use the deterministic default below */ }
  return new Set(["core"]);
}
function persistOpenIndexGroups() {
  try { localStorage.setItem(INDEX_GROUPS_STORAGE_KEY, JSON.stringify([...state.openIndexGroups])); } catch (_) { /* private mode */ }
}
function activeIndexGroupKey(page = state.page) {
  if (!String(page || "").startsWith("index-")) return "";
  const code = normalizeIndex(String(page).replace("index-", ""));
  return window.GIRIndexPortfolio?.groupForCode?.(code)?.key || "";
}
function openIndexGroupForPage(page = state.page) {
  const key = activeIndexGroupKey(page);
  if (!key) return;
  let hasSavedPreference = false;
  try { hasSavedPreference = localStorage.getItem(INDEX_GROUPS_STORAGE_KEY) !== null; } catch (_) { /* private mode */ }
  if (!hasSavedPreference) state.openIndexGroups.clear();
  state.openIndexGroups.add(key);
  persistOpenIndexGroups();
}
function toggleIndexGroup(key, origin) {
  const group = window.GIRIndexPortfolio?.getGroup?.(key);
  if (!group) return;
  if (sidebarIsOverlay() && !state.sidebarOverlayOpen) openSidebarOverlay(origin);
  if (!sidebarIsOverlay() && !state.sidebarExpanded) {
    state.sidebarExpanded = true;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "expanded");
  }
  if (state.openIndexGroups.has(key)) state.openIndexGroups.delete(key); else state.openIndexGroups.add(key);
  persistOpenIndexGroups();
  renderNav();
  window.requestAnimationFrame(() => document.querySelector(`[data-index-group="${CSS.escape(key)}"]`)?.focus());
}

function navGroups() {
  return [
    { label: t("navOverview"), items: [{ key: "landing", label: t("landing") }, { key: "country", label: t("country") }, { key: "matrix", label: t("matrix") }] },
    { label: t("navPortfolio"), kind: "portfolio", groups: window.GIRIndexPortfolio?.groups?.() || [] },
    { label: t("navAnalytics"), items: [{ key: "htei-model", label: t("hteiModel") }, { key: "policy-center", label: t("policyCenter") }] },
    { label: t("navMethodology"), items: [{ key: "methodology", label: t("methodology") }, { key: "data-explorer", label: t("dataExplorer"), href: "/data-explorer" }, { key: "data-lab", label: t("dataLab"), href: "/data-lab" }, { key: "data-updates", label: t("dataUpdates") }] },
  ];
}

function countryOptions() {
  const prompt = !state.country ? `<option value="" selected disabled>${escapeHtml(state.lang === "ru" ? "Выберите страну" : "Select a country")}</option>` : "";
  return prompt + (activeContext().countries || []).map((c) => `<option value="${c.iso3}" data-iso2="${escapeHtml(flagIso2(c))}" ${c.iso3 === state.country ? "selected" : ""}>${escapeHtml(countryName(c))}</option>`).join("");
}
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
  $("#langBtn").textContent = state.lang.toUpperCase();
  const chromeLabels = state.lang === "ru"
    ? {
        header: "Шапка платформы",
        institutions: "Организации-партнёры",
        controls: "Управление интерфейсом",
        primaryNav: "Основная навигация",
        sections: "Разделы платформы",
        language: "Язык",
      }
    : {
        header: "Institutional header",
        institutions: "Institutional partners",
        controls: "Interface controls",
        primaryNav: "Primary navigation",
        sections: "Platform sections",
        language: "Language",
      };
  document.querySelector(".institutional-header")?.setAttribute("aria-label", chromeLabels.header);
  document.querySelectorAll(".institutional-strip, .drawer-institutions").forEach((node) => node.setAttribute("aria-label", chromeLabels.institutions));
  document.querySelector(".top-actions")?.setAttribute("aria-label", chromeLabels.controls);
  $("#sidebar")?.setAttribute("aria-label", chromeLabels.primaryNav);
  $("#nav")?.setAttribute("aria-label", chromeLabels.sections);
  $("#langBtn")?.setAttribute("aria-label", chromeLabels.language);
  const themeBtn = $("#themeBtn");
  if (themeBtn) {
    themeBtn.title = state.theme === "dark" ? t("lightTheme") : t("darkTheme");
    themeBtn.setAttribute("aria-label", themeBtn.title);
  }
  $("#footerIndices").textContent = window.GIRIndexPortfolio?.footerSummary?.(state.lang) || NAV_INDEX_ORDER.map(indexLabel).join(" · ");
  const skip = document.querySelector("[data-skip-link]");
  if (skip) skip.textContent = state.lang === "ru" ? "Перейти к основному содержанию" : "Skip to main content";
  applyBrandAssets();
  window.GIRCooperation?.updateLocale?.(state.lang);
  window.GIRAuth?.updateLocale?.(state.lang);
  setSidebarUI();
}
const ECONOMY_FINANCE_LEGACY_ROUTES = Object.freeze({
  "economy-finance-pci": "index-UNCTAD_PCI",
  "economy-finance-bready": "index-BREADY",
  "economy-finance-eci": "index-ECI",
  "economy-finance-kof": "index-KOF_GLOBAL",
  "economy-finance-fdi": "index-IMF_FDI",
  "economy-finance-findex": "index-GLOBAL_FINDEX",
});
function canonicalPage(page) {
  const value = String(page || "landing").replace(/^#/, "");
  if (ECONOMY_FINANCE_LEGACY_ROUTES[value]) return ECONOMY_FINANCE_LEGACY_ROUTES[value];
  return value.startsWith("index-") ? `index-${normalizeIndex(value.slice(6))}` : value;
}
function pageFromParams() {
  const hash = location.hash.replace("#", "");
  if (hash) return canonicalPage(hash);
  if (params.get("index")) return `index-${state.index}`;
  if (params.has("country") || params.has("year")) return "country";
  return "landing";
}

const PAGE_WORKSPACE_APIS = Object.freeze({
  "index-QS_ET": "GIRQSIntelligence",
  "index-NRI": "GIRNriWorkspace",
  "index-EGDI": "GIREgdiWorkspace",
  "index-GCI": "GIRGciWorkspace",
  "index-GARI": "GIRGariWorkspace",
  "index-AIPI": "GIRAipiWorkspace",
  "index-CF_IQI": "GIRIqiWorkspace",
  "index-TOP500": "GIRTop500Workspace",
  "index-PISA_SKI": "GIRPISASchool",
  "index-THE_ENG": "GIRTHEEngineering",
  "index-ARWU": "GIRARWU",
  "index-GPI": "GIRGPI",
  "index-GMI": "GIRGMI",
  "index-GOCI": "GIRGOCI",
  "index-SIPRI_MILEX": "GIRSIPRIMilex",
  "index-DHL_GCI": "GIRDHLGCI",
  "index-WORLD_BANK_LPI": "GIRWorldBankLPI",
  "index-UNCTAD_LSCI": "GIRUNCTADLSCI",
  "index-EPI": "GIREPI",
  "index-WORLD_RISK_INDEX": "GIRWorldRisk",
  "index-SPI": "GIRSocialProgress",
  "index-SDG": "GIRSustainableDevelopment",
  "index-WHR": "GIRWorldHappiness",
  "index-GGGI": "GIRGlobalGenderGap",
  "index-UHC_SCI": "GIRUHCServiceCoverage",
  "index-CPI": "GIRCorruptionPerceptions",
  "index-WPFI": "GIRWorldPressFreedom",
  "index-ROLI": "GIRRuleOfLaw",
  "index-WGI": "GIRWGI",
  "index-VDEM": "GIRVDEM",
  "index-UNCTAD_PCI": "GIRPCI",
  "index-BREADY": "GIRBREADY",
});

// Specialised workspaces are deliberately loaded per route. Loading every
// module on the landing page caused more than one hundred cold requests and
// could starve the shell before auth or the first meaningful paint completed.
const PAGE_WORKSPACE_SCRIPTS = Object.freeze({
  "index-EPI": ["GIREPI", "/static/epi-workspace.js?v=20260723-lazy-1"],
  "index-ND_GAIN": ["GIRNDGAIN", "/static/nd-gain-workspace.js?v=20260723-lazy-1"],
  "index-ETI": ["GIRETI", "/static/eti-transition-workspace.js?v=20260723-lazy-1"],
  "index-WORLD_RISK_INDEX": ["GIRWRI", "/static/world-risk-workspace.js?v=20260723-lazy-1"],
  "index-GPI": ["GIRGPI", "/static/gpi-workspace.js?v=20260723-lazy-1"],
  "index-GMI": ["GIRGMI", "/static/gmi-workspace.js?v=20260723-lazy-1"],
  "index-GOCI": ["GIRGOCI", "/static/goci-workspace.js?v=20260723-lazy-1"],
  "index-SIPRI_MILEX": ["GIRSIPRIMilex", "/static/sipri-milex-workspace.js?v=20260723-lazy-1"],
  "index-DHL_GCI": ["GIRDHLGCI", "/static/dhl-gci-workspace.js?v=20260723-lazy-1"],
  "index-WORLD_BANK_LPI": ["GIRWorldBankLPI", "/static/world-bank-lpi-workspace.js?v=20260723-lazy-1"],
  "index-UNCTAD_LSCI": ["GIRUNCTADLSCI", "/static/unctad-lsci-workspace.js?v=20260723-lazy-1"],
  "index-SPI": ["GIRSocialProgress", "/static/social-progress-workspace.js?v=20260723-lazy-1"],
  "index-SDG": ["GIRSustainableDevelopment", "/static/sdg-workspace.js?v=20260723-lazy-1"],
  "index-WHR": ["GIRWorldHappiness", "/static/world-happiness-workspace.js?v=20260723-lazy-1"],
  "index-GGGI": ["GIRGlobalGenderGap", "/static/global-gender-gap-workspace.js?v=20260723-lazy-1"],
  "index-UHC_SCI": ["GIRUHCServiceCoverage", "/static/uhc-service-coverage-workspace.js?v=20260723-lazy-1"],
  "index-CPI": ["GIRCorruptionPerceptions", "/static/corruption-perceptions-workspace.js?v=20260723-lazy-1"],
  "index-WPFI": ["GIRWorldPressFreedom", "/static/world-press-freedom-workspace.js?v=20260723-lazy-1"],
  "index-ROLI": ["GIRRuleOfLaw", "/static/rule-of-law-workspace.js?v=20260723-lazy-1"],
  "index-WGI": ["GIRWGI", "/static/wgi-workspace.js?v=20260723-lazy-1"],
  "index-VDEM": ["GIRVDEM", "/static/vdem-workspace.js?v=20260723-lazy-1"],
  "index-UNCTAD_PCI": ["GIRPCI", "/static/pci-workspace.js?v=20260723-lazy-1"],
  "index-BREADY": ["GIRBREADY", "/static/bready-workspace.js?v=20260723-lazy-1"],
  "index-ECI": ["GIRECI", "/static/eci-workspace.js?v=20260723-lazy-1"],
  "index-KOF_GLOBAL": ["GIRKOF", "/static/kof-workspace.js?v=20260723-lazy-1"],
  "index-IMF_FDI": ["GIRFDI", "/static/fdi-workspace.js?v=20260723-lazy-1"],
  "index-GLOBAL_FINDEX": ["GIRFindex", "/static/findex-workspace.js?v=20260723-lazy-1"],
  "index-NRI": ["GIRNriWorkspace", "/static/nri-workspace.js?v=20260723-lazy-1"],
  "index-EGDI": ["GIREgdiWorkspace", "/static/egdi-workspace.js?v=20260723-lazy-1"],
  "index-GCI": ["GIRGciWorkspace", "/static/gci-workspace.js?v=20260723-lazy-1"],
  "index-GARI": ["GIRGariWorkspace", "/static/gari-workspace.js?v=20260723-lazy-1"],
  "index-AIPI": ["GIRAipiWorkspace", "/static/aipi-workspace.js?v=20260723-lazy-1"],
  "index-CF_IQI": ["GIRIqiWorkspace", "/static/iqi-workspace.js?v=20260723-lazy-1"],
  "index-TOP500": ["GIRTop500Workspace", "/static/top500-workspace.js?v=20260723-lazy-1"],
});
const PAGE_WORKSPACE_STYLES = Object.freeze({
  "index-EPI": ["ecology-workspaces-native.css", "epi-workspace.css"],
  "index-ND_GAIN": ["ecology-workspaces-native.css", "nd-gain-workspace.css"],
  "index-ETI": ["ecology-workspaces-native.css", "eti-transition-workspace.css"],
  "index-WORLD_RISK_INDEX": ["ecology-workspaces-native.css", "world-risk-workspace.css"],
  "index-GPI": ["security-connectivity-native.css", "gpi-workspace.css"],
  "index-GMI": ["security-connectivity-native.css", "gmi-workspace.css"],
  "index-GOCI": ["security-connectivity-native.css", "goci-workspace.css"],
  "index-SIPRI_MILEX": ["security-connectivity-native.css", "sipri-milex-workspace.css"],
  "index-DHL_GCI": ["security-connectivity-native.css", "dhl-gci-workspace.css"],
  "index-WORLD_BANK_LPI": ["security-connectivity-native.css", "world-bank-lpi-workspace.css"],
  "index-UNCTAD_LSCI": ["security-connectivity-native.css", "unctad-lsci-workspace.css"],
  "index-SPI": ["society-gir-native.css", "social-progress-workspace.css"],
  "index-SDG": ["society-gir-native.css", "sdg-workspace.css"],
  "index-WHR": ["society-gir-native.css", "world-happiness-workspace.css"],
  "index-GGGI": ["society-gir-native.css", "global-gender-gap-workspace.css"],
  "index-UHC_SCI": ["society-gir-native.css", "uhc-service-coverage-workspace.css"],
  "index-CPI": ["society-gir-native.css", "corruption-perceptions-workspace.css"],
  "index-WPFI": ["society-gir-native.css", "world-press-freedom-workspace.css"],
  "index-ROLI": ["society-gir-native.css", "rule-of-law-workspace.css"],
  "index-WGI": ["wgi-workspace.css"],
  "index-VDEM": ["vdem-workspace.css"],
  "index-UNCTAD_PCI": ["pci-workspace.css"],
  "index-BREADY": ["bready-workspace.css"],
  "index-ECI": ["eci-workspace.css"],
  "index-KOF_GLOBAL": ["kof-workspace.css"],
  "index-IMF_FDI": ["fdi-workspace.css"],
  "index-GLOBAL_FINDEX": ["findex-workspace.css"],
  "index-NRI": ["nri-workspace.css"],
  "index-EGDI": ["egdi-workspace.css"],
  "index-GCI": ["gci-workspace.css"],
  "index-GARI": ["gari-workspace.css"],
  "index-AIPI": ["aipi-workspace.css"],
  "index-CF_IQI": ["iqi-workspace.css"],
  "index-TOP500": ["top500-workspace.css"],
});
const STANDARD_ROUTE_ASSETS = Object.freeze({
  scripts: [["university-map.js", "GIRUniversityMap"], ["index-workspace.js", "GIRIndexWorkspace"]],
  styles: ["university-map.css", "index-workspace.css"],
});
const PAGE_CORE_ASSETS = Object.freeze({
  country: {
    scripts: [["country_profile_v2.js", "GIRCountryProfileV2"], ["country_profile_v3.js", "GIRCountryPortfolioV3"]],
    styles: ["country_profile_v2.css", "country_profile_v3.css"],
  },
  matrix: { scripts: [["stage7_comparison.js", "GIRComparison"]], styles: ["stage7_comparison.css"] },
  "htei-model": { scripts: [["stage4.js", "GIRStage4"]], styles: ["stage4.css"] },
  "policy-center": { scripts: [["stage4.js", "GIRStage4"]], styles: ["stage4.css"] },
  methodology: { scripts: [["methodology.js", "GIRMethodology"]], styles: ["methodology.css"] },
  "data-updates": { scripts: [["data-update-center.js", "GIRDataUpdates"]], styles: ["data-update-center.css"] },
  "index-HTEI": { scripts: [["htei-workspace.js", "GIRHTEI"]], styles: ["htei-workspace.css"] },
  "index-PISA_SKI": { scripts: [["pisa-school-workspace.js", "GIRPISASchool"]], styles: ["pisa-school-workspace.css"] },
  "index-QS_ET": {
    scripts: [["university-map.js", "GIRUniversityMap"], ["qs-intelligence-workspace.js", "GIRQSIntelligence"]],
    styles: ["university-map.css", "qs-intelligence-workspace.css"],
  },
  "index-THE_ENG": {
    scripts: [["university-map.js", "GIRUniversityMap"], ["the-engineering-workspace.js", "GIRTHEEngineering"]],
    styles: ["university-map.css", "the-engineering-workspace.css"],
  },
  "index-ARWU": {
    scripts: [["university-map.js", "GIRUniversityMap"], ["arwu-workspace.js", "GIRARWU"]],
    styles: ["university-map.css", "arwu-workspace.css"],
  },
});
const workspaceScriptPromises = new Map();
const workspaceStylePromises = new Map();
const deferredScriptPromises = new Map();
let mathRendererPromise = null;

function ensureWorkspaceStyle(filename) {
  const source = `/static/${filename}?v=20260723-lazy-1`;
  if (workspaceStylePromises.has(source)) return workspaceStylePromises.get(source);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = source;
    link.dataset.workspaceStyle = filename;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`Unable to load workspace style ${filename}`));
    document.head.appendChild(link);
  }).catch((error) => {
    workspaceStylePromises.delete(source);
    throw error;
  });
  workspaceStylePromises.set(source, promise);
  return promise;
}

function ensureDeferredScript(filename, globalName) {
  if (window[globalName]) return Promise.resolve();
  const source = `/static/${filename}?v=20260723-lazy-1`;
  if (deferredScriptPromises.has(source)) return deferredScriptPromises.get(source);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.dataset.routeAsset = filename;
    script.onload = () => window[globalName]
      ? resolve()
      : reject(new Error(`Route asset ${filename} loaded without ${globalName}`));
    script.onerror = () => reject(new Error(`Unable to load route asset ${filename}`));
    document.head.appendChild(script);
  }).catch((error) => {
    deferredScriptPromises.delete(source);
    throw error;
  });
  deferredScriptPromises.set(source, promise);
  return promise;
}

function ensureMathRenderer() {
  if (mathRendererPromise) return mathRendererPromise;
  mathRendererPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/static/math-renderer.mjs?v=gir-t24-20260723-lazy-1";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load mathematical renderer"));
    document.head.appendChild(script);
  }).catch((error) => {
    mathRendererPromise = null;
    throw error;
  });
  return mathRendererPromise;
}

function coreAssetsForPage(page) {
  if (PAGE_CORE_ASSETS[page]) return PAGE_CORE_ASSETS[page];
  if (String(page || "").startsWith("index-") && STANDARD_INDEX_CODES.includes(normalizeIndex(page.slice(6)))) return STANDARD_ROUTE_ASSETS;
  return null;
}

function pageHasDeferredAssets(page) {
  return Boolean(PAGE_WORKSPACE_SCRIPTS[page] || coreAssetsForPage(page));
}

function ensurePageAssets(page) {
  const coreAssets = coreAssetsForPage(page);
  const corePromise = coreAssets
    ? Promise.all([
        ...(coreAssets.styles || []).map(ensureWorkspaceStyle),
        ...(coreAssets.scripts || []).map(([filename, globalName]) => ensureDeferredScript(filename, globalName)),
      ])
    : Promise.resolve();
  return Promise.all([corePromise, ensurePageWorkspaceScript(page), ensureMathRenderer()]).then(() => undefined);
}

function ensurePageWorkspaceScript(page) {
  const descriptor = PAGE_WORKSPACE_SCRIPTS[page];
  if (!descriptor) return Promise.resolve();
  const [globalName, source] = descriptor;
  const stylesPromise = Promise.all((PAGE_WORKSPACE_STYLES[page] || []).map(ensureWorkspaceStyle));
  if (window[globalName]) return stylesPromise;
  if (workspaceScriptPromises.has(page)) return workspaceScriptPromises.get(page);
  const scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.dataset.workspaceRoute = page;
    script.onload = () => window[globalName]
      ? resolve()
      : reject(new Error(`Workspace ${page} loaded without ${globalName}`));
    script.onerror = () => reject(new Error(`Unable to load workspace ${page}`));
    document.head.appendChild(script);
  });
  const promise = Promise.all([stylesPromise, scriptPromise]).then(() => undefined).catch((error) => {
    workspaceScriptPromises.delete(page);
    throw error;
  });
  workspaceScriptPromises.set(page, promise);
  return promise;
}

function beginPageTransition(previousPage) {
  const apiName = PAGE_WORKSPACE_APIS[previousPage];
  try { if (apiName) window[apiName]?.invalidate?.({ hard: false }); } catch (_) { /* best-effort cancellation */ }
  if (previousPage === "index-HTEI") invalidateHteiWorkspace();

  // Async workspaces receive the current #view node as their render target. Replacing
  // that node on a route transition leaves late responses attached to a detached tree,
  // so a response from one index cannot overwrite the next index or its error state.
  const currentView = $("#view");
  if (currentView?.parentNode) {
    const freshView = currentView.cloneNode(false);
    freshView.innerHTML = "";
    currentView.parentNode.replaceChild(freshView, currentView);
  }
  closeDrawer({ restoreFocus: false });
}

function navigationIsCurrent(generation, page) {
  return generation === navigationGeneration && state.page === page;
}
async function load() {
  window.__GIIP_READY__ = false;
  document.documentElement.dataset.appReady = "false";
  document.documentElement.dataset.theme = state.theme;
  setTheme();
  setLang();
  const requestedPage = pageFromParams();

  // The public landing page must not wait for GeoIP/geolocation or analytical
  // workspace assets. Device language is already resolved synchronously by the
  // head bootstrap; country detection can safely enrich the rendered shell.
  if (requestedPage === "landing") {
    state.page = "landing";
    openIndexGroupForPage(state.page);
    if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && !sidebarIsOverlay()) state.sidebarExpanded = false;
    window.GIRCooperation?.init?.({ getLang: () => state.lang });
    window.GIRCooperation?.bindTriggers?.(document);
    setTheme(); setLang(); bindStatic(); renderNav(); render();
    window.__GIIP_READY__ = true;
    document.documentElement.dataset.appReady = "true";
    window.dispatchEvent(new CustomEvent("giip:ready", { detail: { country: state.country, year: state.year, page: state.page } }));

    window.GIRUserContext?.ready?.then((userContext) => {
      state.lang = userContext.language;
      state.country = userContext.country || null;
      if (!params.get("pisa_entity")) state.pisaEntity = state.country;
      setTheme(); setLang(); renderNav(); renderContextBar();
      if (state.page === "landing") renderLanding();
    }).catch((error) => console.error("User context detection failed", error));
    window.GIRAuth?.ready?.catch((error) => console.error("Authentication status failed", error));
    return;
  }

  if (window.GIRUserContext?.ready) {
    const userContext = await window.GIRUserContext.ready;
    state.lang = userContext.language;
    state.country = userContext.country || null;
    if (!params.get("pisa_entity")) state.pisaEntity = state.country;
  }
  if (window.GIRAuth?.ready) await window.GIRAuth.ready;
  state.page = requestedPage;
  if (state.page !== "landing" && !window.GIRAuth?.isAuthenticated?.()) {
    window.GIRAuth?.requireLogin?.({ route: state.page });
    state.page = "landing";
    if (location.hash && location.hash !== "#landing") {
      history.replaceState(null, "", `${location.pathname}${location.search}#landing`);
    }
  }
  openIndexGroupForPage(state.page);
  if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && !sidebarIsOverlay()) {
    state.sidebarExpanded = state.page === "landing" ? false : window.innerWidth >= 1440;
  }
  window.GIRCooperation?.init?.({ getLang: () => state.lang });
  window.GIRCooperation?.bindTriggers?.(document);
  setTheme(); setLang(); bindStatic(); renderNav();

  if (!state.country && pageRequiresCountry(state.page)) {
    if (window.GIRAuth?.isAuthenticated?.()) await ensurePlatformContext();
    render();
    window.__GIIP_READY__ = true;
    document.documentElement.dataset.appReady = "true";
    return;
  }

  if (pageHasDeferredAssets(state.page)) {
    renderLoadingShell();
    try {
      await ensurePageAssets(state.page);
    } catch (error) {
      renderLoadError(error);
      window.__GIIP_READY__ = true;
      document.documentElement.dataset.appReady = "true";
      return;
    }
  }

  if (!pageNeedsAppData(state.page)) {
    if (pageUsesPlatformContext(state.page) || (!state.country && window.GIRAuth?.isAuthenticated?.())) {
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
  if (!state.country) return Promise.resolve(null);
  if (LANDING_SUMMARY) return Promise.resolve(LANDING_SUMMARY);
  if (!LANDING_SUMMARY_LOADING) {
    LANDING_SUMMARY_LOADING = fetch(`/api/landing-summary?country=${encodeURIComponent(state.country)}`)
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
function pageNeedsAppData(page) { return page === "index-HTEI" || page === "acceptance"; }
function pageNeedsGeo(page) { return page === "index-HTEI"; }
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
  if (action === "toggle-index-group") { event.preventDefault(); toggleIndexGroup(control.dataset.indexGroup || "", control); return true; }
  if (action === "provenance") { event.preventDefault(); openProvenance(control.dataset.valueId || "", control); return true; }
  if (action === "country") { event.preventDefault(); if (control.dataset.iso) goCountry(control.dataset.iso); return true; }
  if (action === "sort-matrix") { event.preventDefault(); sortMatrix(control.dataset.code || "HTEI"); return true; }
  if (action === "map-country") { event.preventDefault(); if (control.dataset.iso) selectMapCountry(control.dataset.iso, event); return true; }
  return false;
}
function bindStatic() {
  $("#themeBtn").onclick = () => { state.theme = state.theme === "dark" ? "light" : "dark"; setTheme(); (!pageNeedsAppData(state.page) || DATA) ? render() : renderLoadingShell(); };
  $("#langBtn").onclick = () => { state.lang = state.lang === "ru" ? "en" : "ru"; window.GIRUserContext?.setManualLanguage?.(state.lang); setLang(); if (!pageNeedsAppData(state.page) || DATA) { renderNav(); render(); } else { renderLoadingShell(); } };
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
  page = canonicalPage(page);
  if (page !== "landing" && !window.GIRAuth?.isAuthenticated?.()) {
    window.GIRAuth?.requireLogin?.({ route: page });
    return;
  }
  const previousPage = state.page;
  const generation = ++navigationGeneration;
  if (page !== previousPage) beginPageTransition(previousPage);
  state.page = page;
  openIndexGroupForPage(page);
  if (!localStorage.getItem(SIDEBAR_STORAGE_KEY) && !sidebarIsOverlay()) {
    state.sidebarExpanded = page === "landing" ? false : window.innerWidth >= 1440;
  }
  if (page.startsWith("index-")) {
    state.index = normalizeIndex(page.replace("index-", ""));
    if (state.index === "NRI") state.year = 2025;
    if (state.index === "EGDI") state.year = 2024;
    if (state.index === "GCI") state.year = 2024;
    if (state.index === "GARI") state.year = 2025;
    if (state.index === "AIPI") state.year = 2023;
    if (state.index === "CF_IQI") state.year = 2026;
    if (state.index === "TOP500") state.year = 2026;
    if (state.index === "THE_ENG") state.year = 2026;
    if (state.index === "PISA_SKI") state.year = 2022;
    if (state.index === "ARWU") state.year = 2025;
    if (state.index === "EPI") state.year = 2026;
    if (state.index === "ND_GAIN") state.year = 2021;
    if (state.index === "ETI") state.year = 2026;
    if (state.index === "WORLD_RISK_INDEX") state.year = 2025;
    if (state.index === "GPI") state.year = 2026;
    if (state.index === "GMI") state.year = 2022;
    if (state.index === "GOCI") state.year = 2025;
    if (state.index === "SIPRI_MILEX") state.year = 2025;
    if (state.index === "DHL_GCI") state.year = 2024;
    if (state.index === "WORLD_BANK_LPI") state.year = 2024;
    if (state.index === "UNCTAD_LSCI") state.year = 2026;
    if (state.index === "WGI") state.year = Number(params.get("year") || 2024);
    if (state.index === "VDEM") state.year = Number(params.get("year") || 2025);
  }
  if (updateHash && location.hash !== `#${page}`) location.hash = page;
  if (sidebarIsOverlay()) closeSidebarOverlay({ restoreFocus: false });
  if (pageHasDeferredAssets(page)) {
    renderLoadingShell();
    try {
      await ensurePageAssets(page);
    } catch (error) {
      if (navigationIsCurrent(generation, page)) renderLoadError(error);
      return;
    }
    if (!navigationIsCurrent(generation, page)) return;
  }
  if (!pageNeedsAppData(page)) {
    if (pageUsesPlatformContext(page) && !PLATFORM_CONTEXT) {
      renderLoadingShell();
      try { await ensurePlatformContext(); } catch (err) { if (state.page === page) renderLoadError(err); return; }
      if (!navigationIsCurrent(generation, page)) return;
    }
    renderNav();
    const renderResult = render();
    if (renderResult?.then) await renderResult;
    if (!navigationIsCurrent(generation, page)) return;
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
    if (!navigationIsCurrent(generation, page)) return;
  }
  renderNav(); render();
  if (pageNeedsGeo(page) && !GEO) {
    ensureGeo().then(() => { if (navigationIsCurrent(generation, page)) render(); }).catch((err) => console.error("GeoJSON load failed", err));
  }
}
function routeTo(page) { return navigateTo(page); }
// GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — compact navigation code
// GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — compact navigation code
// GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — compact navigation code
function renderNavLeaf(item) {
  const active = state.page === item.key;
  const code = item.code ? (item.short || ({ QS_ET: "QS", HCI_PLUS: "HCI+", THE_ENG: "THE", PISA_SKI: "PISA", ND_GAIN: "ND+", ETI: "ETI", WORLD_RISK_INDEX: "WRI", SIPRI_MILEX: "SIPRI", DHL_GCI: "DHL", WORLD_BANK_LPI: "LPI", UNCTAD_LSCI: "LSCI" }[item.code] || item.code)) : "";
  const icon = item.code
    ? `<span class="nav-code ${String(code).length > 5 ? "is-long" : ""}" aria-hidden="true">${escapeHtml(code)}</span>`
    : `<span class="nav-icon-box" aria-hidden="true"><img class="nav-icon" src="/static/icons/${NAV_ICONS[item.key] || "database.svg"}" alt=""></span>`;
  const statusLabel = item.status === "planned" ? (state.lang === "ru" ? "в интеграции" : "in integration") : "";
  const meta = code ? `<small><span>${escapeHtml(code)}</span>${statusLabel ? `<span class="nav-index-status is-planned">${escapeHtml(statusLabel)}</span>` : ""}</small>` : "";
  const content = `${icon}<span class="nav-copy"><strong>${escapeHtml(item.label)}</strong>${meta}</span>`;
  if (item.href) return `<a class="nav-item" href="${escapeHtml(item.href)}" title="${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}">${content}</a>`;
  const ariaLabel = statusLabel ? `${item.label} — ${statusLabel}` : item.label;
  return `<button type="button" class="nav-item ${item.status === "planned" ? "is-planned" : ""} ${active ? "active" : ""}" title="${escapeHtml(ariaLabel)}" aria-label="${escapeHtml(ariaLabel)}" ${active ? 'aria-current="page"' : ""} data-gir-action="route" data-route="${escapeHtml(item.key)}">${content}</button>`;
}
// GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — navigation
// GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — navigation
// GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — navigation
// GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — navigation
function renderPortfolioNavigation(section) {
  const activeGroup = activeIndexGroupKey();
  return `<section class="nav-group nav-portfolio-section"><h2>${escapeHtml(section.label)}</h2><div class="nav-portfolio">${section.groups.map((group) => {
    const open = state.openIndexGroups.has(group.key);
    const active = group.key === activeGroup;
    const groupLabel = state.lang === "ru" ? group.label_ru : group.label_en;
    const groupDescription = state.lang === "ru" ? group.description_ru : group.description_en;
    const ready = group.items.filter((entry) => entry.status === "ready").length;
    const summary = state.lang === "ru"
      ? (ready === group.items.length
        ? `${group.items.length} действующих модулей`
        : ready === 0 ? `${group.items.length} модулей · в интеграции` : `${group.items.length} модулей · ${ready} действующих`)
      : (ready === group.items.length
        ? `${group.items.length} live modules`
        : ready === 0 ? `${group.items.length} modules · in integration` : `${group.items.length} modules · ${ready} live`);
    const panelId = `nav-index-group-${group.key}`;
    const items = group.items.map((entry) => renderNavLeaf({
      key: entry.route,
      label: state.lang === "ru" ? entry.name_ru : entry.name_en,
      code: entry.code,
      short: state.lang === "ru" ? entry.short_ru : entry.short_en,
      status: entry.status,
    })).join("");
    return `<div class="nav-index-group ${active ? "is-active" : ""}">
      <button type="button" class="nav-index-group-toggle" data-gir-action="toggle-index-group" data-index-group="${escapeHtml(group.key)}" aria-expanded="${open}" aria-controls="${panelId}" title="${escapeHtml(groupDescription)}">
        <span class="nav-index-group-icon"><img src="/static/icons/${escapeHtml(group.icon)}" alt="" aria-hidden="true"></span>
        <span class="nav-index-group-copy"><strong>${escapeHtml(groupLabel)}</strong><small>${escapeHtml(summary)}</small></span>
        <span class="nav-index-group-count" aria-hidden="true">${group.items.length}</span>
        <img class="nav-index-group-chevron" src="/static/icons/chevron-down.svg" alt="" aria-hidden="true">
      </button>
      <div id="${panelId}" class="nav-index-group-items" ${open ? "" : "hidden"}>${items}</div>
    </div>`;
  }).join("")}</div></section>`;
}
function renderNav() {
  $("#nav").innerHTML = navGroups().map((group) => {
    if (group.kind === "portfolio") return renderPortfolioNavigation(group);
    return `<section class="nav-group"><h2>${escapeHtml(group.label)}</h2><div class="nav-group-items">${group.items.map(renderNavLeaf).join("")}</div></section>`;
  }).join("");
  setSidebarUI();
  const activeGroup = document.querySelector(".nav-index-group.is-active");
  if (activeGroup) window.requestAnimationFrame(() => activeGroup.scrollIntoView({ block: "nearest", inline: "nearest" }));
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
  window.GIRLanding?.bind?.({ root: view });
  window.GIRCooperation?.bindTriggers?.(view);
  if (state.country && !LANDING_SUMMARY && !LANDING_SUMMARY_LOADING) {
    ensureLandingSummary()
      .then(() => { if (state.page === "landing") renderLanding(); })
      .catch((err) => console.error("Landing summary load failed", err));
  }
}
function renderPlannedIndex() {
  const root = $("#view");
  const code = normalizeIndex(state.page.replace("index-", ""));
  if (!window.GIRIndexPortfolio?.renderPlanned?.({ root, code, lang: state.lang })) {
    root.innerHTML = `<section class="card"><h1>${escapeHtml(currentPageLabel())}</h1><p>${escapeHtml(state.lang === "ru" ? "Страница будущего модуля недоступна." : "The future-module page is unavailable.")}</p></section>`;
  }
}

function renderDataUpdates() {
  const root = $("#view");
  if (!window.GIRDataUpdates?.render) {
    root.innerHTML = `<section class="card"><h1>${escapeHtml(t("dataUpdates"))}</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль центра обновлений не загружен." : "The data-update module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRDataUpdates.render({
    root,
    lang: state.lang,
    theme: state.theme,
    routeTo,
    showToast,
    escapeHtml,
  });
}

function renderNriWorkspace() {
  if (!window.GIRNriWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("NRI")))}</h1><p>${state.lang === "ru" ? "Модуль NRI не загружен." : "The NRI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRNriWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRNriWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderEgdiWorkspace() {
  if (!window.GIREgdiWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("EGDI")))}</h1><p>${state.lang === "ru" ? "Модуль EGDI не загружен." : "The EGDI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIREgdiWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIREgdiWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderGciWorkspace() {
  if (!window.GIRGciWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("GCI")))}</h1><p>${state.lang === "ru" ? "Модуль GCI не загружен." : "The GCI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRGciWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRGciWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderGariWorkspace() {
  if (!window.GIRGariWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("GARI")))}</h1><p>${state.lang === "ru" ? "Модуль GARI не загружен." : "The GARI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRGariWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRGariWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderAipiWorkspace() {
  if (!window.GIRAipiWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("AIPI")))}</h1><p>${state.lang === "ru" ? "Модуль AIPI не загружен." : "The AIPI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRAipiWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRAipiWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderIqiWorkspace() {
  if (!window.GIRIqiWorkspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("CF_IQI")))}</h1><p>${state.lang === "ru" ? "Модуль Cloudflare IQI не загружен." : "The Cloudflare IQI module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRIqiWorkspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRIqiWorkspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function renderTop500Workspace() {
  if (!window.GIRTop500Workspace?.render) {
    $("#view").innerHTML = `<section class="hero"><div class="card"><h1>${escapeHtml(indexFullName(byCode("TOP500")))}</h1><p>${state.lang === "ru" ? "Модуль TOP500 / Green500 не загружен." : "The TOP500 / Green500 module is not loaded."}</p></div></section>`;
    return;
  }
  return window.GIRTop500Workspace.render({
    root: $("#view"), country: state.country, year: state.year || 2026, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, openProvenance, goCountry, routeTo,
    selectCountry: (iso3) => { if (!selectUserCountry(iso3)) return; window.GIRTop500Workspace?.invalidate?.(); renderContextBar(); render(); },
  });
}

function pageRequiresCountry(page) {
  return page === "country" || page === "htei-model" || page.startsWith("index-");
}

function qsUrlCountryOverride() {
  if (state.page !== "index-QS_ET") return "";
  const code = String(new URLSearchParams(location.search).get("qs_country") || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "";
}

function renderCountryRequired() {
  const root = $("#view");
  const title = state.lang === "ru" ? "Выберите страну" : "Select a country";
  const copy = state.lang === "ru"
    ? "Платформа не подставляет Россию или другую страну вместо вашего местоположения. Выберите страну в панели контекста."
    : "The platform does not substitute Russia or another country for your location. Select a country in the context bar.";
  root.innerHTML = `<section class="hero"><div class="card hero-main"><h1>${escapeHtml(title)}</h1><p class="muted">${escapeHtml(copy)}</p></div></section>`;
}

function render() {
  document.documentElement.dataset.page = state.page;
  $("#view")?.classList.toggle("landing-view", state.page === "landing");
  $("#view")?.classList.toggle("methodology-view", state.page === "methodology");
  $("#view")?.classList.toggle("data-updates-view", state.page === "data-updates");
  $("#view")?.classList.toggle("portfolio-planned-view", isPlannedIndexPage(state.page));
  $("#view")?.classList.toggle("qsi-root", state.page === "index-QS_ET");
  const economyCode = state.page.startsWith("index-") ? normalizeIndex(state.page.replace("index-", "")) : "";
  Object.values(ECONOMY_FINANCE_MODULES).forEach((item) => $("#view")?.classList.toggle(item.viewClass, item === ECONOMY_FINANCE_MODULES[economyCode]));
  renderContextBar();
  bindContextControls();
  applyBrandAssets();
  setSidebarUI();
  window.GIRCooperation?.updateLocale?.(state.lang);
  if (!state.country && pageRequiresCountry(state.page) && !qsUrlCountryOverride()) return renderCountryRequired();
  if (state.page === "landing") return renderLanding();
  if (state.page === "country" && window.GIRCountryPortfolioV3?.render) return window.GIRCountryPortfolioV3.render();
  if (state.page === "country" && window.GIRCountryProfileV2?.render) return window.GIRCountryProfileV2.render();
  if (state.page === "country") return renderCountry();
  if (state.page === "matrix") return renderMatrix();
  if (state.page === "htei-model") return renderHteiModel();
  if (state.page === "policy-center") return renderPolicyCenter();
  if (state.page === "methodology") return renderMethodology();
  if (state.page === "data-updates") return renderDataUpdates();
  if (state.page === "acceptance") return renderAcceptance();
  if (state.page === "index-NRI") return renderNriWorkspace();
  if (state.page === "index-EGDI") return renderEgdiWorkspace();
  if (state.page === "index-GCI") return renderGciWorkspace();
  if (state.page === "index-GARI") return renderGariWorkspace();
  if (state.page === "index-AIPI") return renderAipiWorkspace();
  if (state.page === "index-CF_IQI") return renderIqiWorkspace();
  if (state.page === "index-TOP500") return renderTop500Workspace();
  if (state.page === "index-HTEI") return renderHteiWorkspace();
  if (state.page === "index-PISA_SKI") return renderPisaSchoolWorkspace();
  if (state.page === "index-THE_ENG") return renderTheEngineeringWorkspace();
  if (state.page === "index-ARWU") return renderArwuWorkspace();
  if (state.page === "index-GPI") return renderGpiWorkspace();
  if (state.page === "index-GMI") return renderGmiWorkspace();
  if (state.page === "index-GOCI") return renderGociWorkspace();
  if (state.page === "index-SIPRI_MILEX") return renderSipriMilexWorkspace();
  if (state.page === "index-DHL_GCI") return renderDhlGciWorkspace();
  if (state.page === "index-WORLD_BANK_LPI") return renderWorldBankLpiWorkspace();
  if (state.page === "index-UNCTAD_LSCI") return renderUnctadLsciWorkspace();
  // GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — render
  if (state.page === "index-EPI") return renderEpiWorkspace();
  // GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — render
  if (state.page === "index-ND_GAIN") return renderNdGainWorkspace();
  // GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — render
  if (state.page === "index-ETI") return renderEtiWorkspace();
  // GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — render
  if (state.page === "index-WORLD_RISK_INDEX") return renderWorldRiskWorkspace();
  if (state.page === "index-SPI") return renderSocialProgressWorkspace();
  if (state.page === "index-SDG") return renderSustainableDevelopmentWorkspace();
  if (state.page === "index-WHR") return renderWorldHappinessWorkspace();
  if (state.page === "index-GGGI") return renderGlobalGenderGapWorkspace();
  if (state.page === "index-UHC_SCI") return renderUHCServiceCoverageWorkspace();
  if (state.page === "index-CPI") return renderCorruptionPerceptionsWorkspace();
  if (state.page === "index-WPFI") return renderWorldPressFreedomWorkspace();
  if (state.page === "index-ROLI") return renderRuleOfLawWorkspace();
  if (state.page === "index-WGI") return renderWgiWorkspace();
  if (state.page === "index-VDEM") return renderVdemWorkspace();
  if (isEconomyFinancePage(state.page)) return renderEconomyFinanceWorkspace(normalizeIndex(state.page.replace("index-", "")));
  if (state.page === "index-QS_ET") return renderQsIntelligenceWorkspace();
  if (isPlannedIndexPage(state.page)) return renderPlannedIndex();
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

function updateGovernanceDimensionUrlState() {
  try {
    const url = new URL(location.href);
    url.searchParams.set("country", state.country);
    url.searchParams.set("year", String(state.year));
    url.searchParams.set("index", state.index);
    if (state.index === "WGI") url.searchParams.set("dimension", state.wgiDimension);
    else if (state.index === "VDEM") url.searchParams.set("dimension", state.vdemDimension);
    history.replaceState(null, "", `${url.pathname}${url.search}${location.hash}`);
  } catch (_) {}
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
      selectUserCountry(countryCode);
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

function updatePisaUrlState() {
  try {
    const url = new URL(location.href);
    url.searchParams.set("pisa_entity", state.pisaEntity);
    url.searchParams.set("year", "2022");
    history.replaceState(null, "", `${url.pathname}${url.search}${location.hash}`);
  } catch (_) {
    // Embedded evidence documents can have an opaque origin. Selection must
    // still update the live analytical state even when URL persistence is unavailable.
  }
}

function renderPisaSchoolWorkspace() {
  state.index = "PISA_SKI";
  state.year = 2022;
  const root = $("#view");
  if (!window.GIRPISASchool?.render) {
    root.innerHTML = `<section class="card"><h1>PISA 2022</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль исследовательского пространства не загружен." : "The research workspace module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRPISASchool.render({
    root,
    lang: state.lang,
    theme: state.theme,
    entity: state.pisaEntity || state.country,
    year: 2022,
    platformContext: PLATFORM_CONTEXT,
    escapeHtml,
    fmt,
    intFmt,
    flagImage,
    openProvenance,
    routeTo,
    selectEntity: (entityCode, iso3, label) => {
      const selectedEntity = String(entityCode || iso3 || "").toUpperCase();
      if (!selectedEntity) return;
      state.pisaEntity = selectedEntity;
      if (iso3) selectUserCountry(iso3);
      updatePisaUrlState();
      const contextLabel = document.querySelector("[data-pisa-context-entity]");
      if (contextLabel && label) contextLabel.textContent = label;
      window.GIRPISASchool.invalidate?.();
      renderPisaSchoolWorkspace();
    },
    openCountryProfile: (iso3) => {
      if (!iso3) return;
      if (!selectUserCountry(iso3)) return;
      routeTo("country");
    },
  });
}

function renderTheEngineeringWorkspace() {
  state.index = "THE_ENG";
  state.year = 2026;
  const root = $("#view");
  if (!window.GIRTHEEngineering?.render) {
    root.innerHTML = `<section class="card"><h1>THE Engineering</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль исследовательского пространства не загружен." : "The research workspace module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRTHEEngineering.render({
    root,
    lang: state.lang,
    theme: state.theme,
    country: state.country,
    year: 2026,
    platformContext: PLATFORM_CONTEXT,
    escapeHtml,
    fmt,
    intFmt,
    flagImage,
    openProvenance,
    routeTo,
    selectCountry: (iso3) => {
      const previous = state.country;
      if (!selectUserCountry(iso3)) return;
      window.GIRTHEEngineering.invalidate({ country: previous });
      renderContextBar();
      render();
    },
  });
}

function renderArwuWorkspace() {
  state.index = "ARWU";
  state.year = 2025;
  const root = $("#view");
  if (!window.GIRARWU?.render) {
    root.innerHTML = `<section class="card"><h1>ARWU 2025</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль исследовательского пространства не загружен." : "The research workspace module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRARWU.render({
    root,
    lang: state.lang,
    theme: state.theme,
    country: state.country,
    year: 2025,
    platformContext: PLATFORM_CONTEXT,
    escapeHtml,
    fmt,
    intFmt,
    flagImage,
    openProvenance,
    routeTo,
    selectCountry: (iso3) => {
      const previous = state.country;
      if (!selectUserCountry(iso3)) return;
      window.GIRARWU.invalidate({ country: previous });
      renderContextBar();
      render();
    },
  });
}

// GIR T13 integration: Security & international connectedness specialist workspaces.
function securityWorkspaceContext(code, api) {
  return {
    root: $("#view"), country: state.country, year: state.year, lang: state.lang, theme: state.theme,
    platformContext: activeContext(), escapeHtml, fmt, intFmt, flagImage, openProvenance, routeTo,
    setCountry: (iso3) => { if (!selectUserCountry(iso3)) return; renderContextBar(); bindContextControls(); api?.render?.(securityWorkspaceContext(code, api)); },
    setYear: (year) => { const next = Number(year); if (Number.isFinite(next)) state.year = next; renderContextBar(); bindContextControls(); api?.render?.(securityWorkspaceContext(code, api)); },
  };
}
function renderGpiWorkspace() { state.index="GPI"; state.year=2026; return window.GIRGPI?.render ? window.GIRGPI.render(securityWorkspaceContext("GPI", window.GIRGPI)) : renderMissingSecurity("GPI"); }
function renderGmiWorkspace() { state.index="GMI"; state.year=2022; return window.GIRGMI?.render ? window.GIRGMI.render(securityWorkspaceContext("GMI", window.GIRGMI)) : renderMissingSecurity("GMI"); }
function renderGociWorkspace() { state.index="GOCI"; if (![2021,2023,2025].includes(Number(state.year))) state.year=2025; return window.GIRGOCI?.render ? window.GIRGOCI.render(securityWorkspaceContext("GOCI", window.GIRGOCI)) : renderMissingSecurity("GOCI"); }
function renderSipriMilexWorkspace() { state.index="SIPRI_MILEX"; state.year=2025; return window.GIRSIPRIMilex?.render ? window.GIRSIPRIMilex.render(securityWorkspaceContext("SIPRI_MILEX", window.GIRSIPRIMilex)) : renderMissingSecurity("SIPRI_MILEX"); }
function renderDhlGciWorkspace() { state.index="DHL_GCI"; if (state.year < 2001 || state.year > 2024) state.year=2024; return window.GIRDHLGCI?.render ? window.GIRDHLGCI.render(securityWorkspaceContext("DHL_GCI", window.GIRDHLGCI)) : renderMissingSecurity("DHL_GCI"); }
function renderWorldBankLpiWorkspace() { state.index="WORLD_BANK_LPI"; if (![2024,2023,2018,2016,2014,2012,2010,2007].includes(Number(state.year))) state.year=2024; return window.GIRWorldBankLPI?.render ? window.GIRWorldBankLPI.render(securityWorkspaceContext("WORLD_BANK_LPI", window.GIRWorldBankLPI)) : renderMissingSecurity("WORLD_BANK_LPI"); }
function renderUnctadLsciWorkspace() { state.index="UNCTAD_LSCI"; if (state.year < 2006 || state.year > 2026) state.year=2026; return window.GIRUNCTADLSCI?.render ? window.GIRUNCTADLSCI.render(securityWorkspaceContext("UNCTAD_LSCI", window.GIRUNCTADLSCI)) : renderMissingSecurity("UNCTAD_LSCI"); }
function renderMissingSecurity(code) { $("#view").innerHTML = `<section class="card"><h1>${escapeHtml(indexFullName(byCode(code)))}</h1><p class="muted">${escapeHtml(state.lang === "ru" ? "Модуль не загружен." : "The module is not loaded.")}</p></section>`; }

// GIR T11 integration: ecology specialist workspaces preserved from GIR-ECOLOGY-STAGE08D.
// GIR PATCH: ECOLOGY/EPI FRONTEND STAGE 02 — workspace adapter
function renderEpiWorkspace() {
  const root = $("#view");
  if (!window.GIREPI?.render) {
    root.innerHTML = `<section class="card"><h1>EPI 2026</h1><p>${escapeHtml(state.lang === "ru" ? "Frontend-модуль EPI не загружен." : "The EPI frontend module is not loaded.")}</p></section>`;
    return;
  }
  return window.GIREPI.render({
    root,
    country: state.country,
    lang: state.lang,
    theme: state.theme,
    onCountryChange: (iso3) => { if (selectUserCountry(iso3)) renderContextBar(); },
    onNotice: showToast,
    showToast,
    routeTo,
  });
}

// GIR PATCH: ECOLOGY/ND-GAIN FRONTEND STAGE 04 — workspace adapter
function renderNdGainWorkspace() {
  const root = $("#view");
  if (!window.GIRNDGAIN?.render) {
    root.innerHTML = `<section class="card"><h1>ND-GAIN</h1><p>${escapeHtml(state.lang === "ru" ? "Frontend-модуль ND-GAIN не загружен." : "The ND-GAIN frontend module is not loaded.")}</p></section>`;
    return;
  }
  return window.GIRNDGAIN.render({
    root,
    country: state.country,
    lang: state.lang,
    theme: state.theme,
    onCountryChange: (iso3) => { if (selectUserCountry(iso3)) renderContextBar(); },
    onNotice: showToast,
    showToast,
    routeTo,
  });
}

// GIR PATCH: ECOLOGY/ETI FRONTEND STAGE 06 — workspace adapter
function renderEtiWorkspace() {
  const root = $("#view");
  if (!window.GIRETI?.render) {
    root.innerHTML = `<section class="card"><h1>ETI 2026</h1><p>${escapeHtml(state.lang === "ru" ? "Frontend-модуль ETI не загружен." : "The ETI frontend module is not loaded.")}</p></section>`;
    return;
  }
  return window.GIRETI.render({
    root,
    country: state.country,
    lang: state.lang,
    theme: state.theme,
    onCountryChange: (iso3) => { if (selectUserCountry(iso3)) renderContextBar(); },
    onNotice: showToast,
    showToast,
    routeTo,
  });
}

// GIR PATCH: ECOLOGY/WORLD-RISK FRONTEND STAGE 08 — workspace adapter
function renderWorldRiskWorkspace() {
  const root = $("#view");
  if (!window.GIRWRI?.render) {
    root.innerHTML = `<section class="card"><h1>WorldRiskIndex 2025</h1><p>${escapeHtml(state.lang === "ru" ? "Frontend-модуль WorldRiskIndex не загружен." : "The WorldRiskIndex frontend module is not loaded.")}</p></section>`;
    return;
  }
  return window.GIRWRI.render({
    root,
    country: state.country,
    lang: state.lang,
    theme: state.theme,
    onCountryChange: (iso3) => { if (selectUserCountry(iso3)) renderContextBar(); },
    onNotice: showToast,
    showToast,
    routeTo,
  });
}

// GIR_PATCH:T14_GOVERNANCE_SOCIETY_ADAPTER:BEGIN
let societyContextObserver = null;
let societyContextTimer = 0;

function societyModuleSelectors(code) {
  if (code === "SPI") return { country: "[data-spi-country]", year: "[data-spi-year]" };
  if (code === "SDG") return { country: "[data-sdg-country]", year: "[data-sdg-year]" };
  if (code === "WHR") return { country: "[data-whr-country]", year: "[data-whr-year]" };
  if (code === "GGGI") return { country: "[data-gggi-country]", year: "[data-gggi-year]" };
  if (code === "UHC_SCI") return { country: "[data-uhc-country]", year: "[data-uhc-year]" };
  if (code === "CPI") return { country: "[data-cpi-country]", year: "[data-cpi-year]" };
  if (code === "WPFI") return { country: "[data-wpfi-country]", year: "[data-wpfi-year]" };
  return { country: "[data-roli-country]", year: "[data-roli-period]" };
}

function societyOptionMarkup(source) {
  return Array.from(source?.options || []).map((option) => `<option value="${escapeHtml(option.value)}" ${option.selected ? "selected" : ""}>${escapeHtml(option.textContent || option.value)}</option>`).join("");
}

function syncSocietyContextBar(code) {
  const host = document.querySelector(`[data-society-context-host][data-society-code="${code}"]`);
  const root = $("#view");
  if (!host || !root || !isSocietyIndexPage(state.page) || state.index !== code) return;
  const selectors = societyModuleSelectors(code);
  const sourceCountry = root.querySelector(selectors.country);
  const sourceYear = root.querySelector(selectors.year);
  if (!sourceCountry || !sourceYear) {
    host.innerHTML = `<span class="tiny muted">${escapeHtml(state.lang === "ru" ? "Загрузка стран и периодов…" : "Loading countries and periods…")}</span>`;
    return;
  }
  const countryLabel = sourceCountry.selectedOptions[0]?.textContent || sourceCountry.value;
  const yearLabel = sourceYear.selectedOptions[0]?.textContent || sourceYear.value;
  host.innerHTML = `<label><span>${t("countryLabel")}</span>${selectShell(`<select id="societyCountrySelect" class="select" aria-label="${escapeHtml(t("countryLabel"))}">${societyOptionMarkup(sourceCountry)}</select>`, countryLabel)}</label><label><span>${t("year")}</span>${selectShell(`<select id="societyYearSelect" class="select context-year" aria-label="${escapeHtml(t("year"))}">${societyOptionMarkup(sourceYear)}</select>`, yearLabel)}</label>`;
  const countrySelect = $("#societyCountrySelect");
  const yearSelect = $("#societyYearSelect");
  if (countrySelect) countrySelect.onchange = (event) => {
    const latest = $("#view")?.querySelector(societyModuleSelectors(code).country);
    if (!latest) return;
    latest.value = event.target.value;
    selectUserCountry(event.target.value);
    latest.dispatchEvent(new Event("change", { bubbles: true }));
    syncSelectDisplay(event.target);
  };
  if (yearSelect) yearSelect.onchange = (event) => {
    const latest = $("#view")?.querySelector(societyModuleSelectors(code).year);
    if (!latest) return;
    latest.value = event.target.value;
    state.year = Number(String(event.target.value).split("-").pop()) || state.year;
    latest.dispatchEvent(new Event("change", { bubbles: true }));
    syncSelectDisplay(event.target);
  };
  state.country = String(sourceCountry.value || state.country || "").toUpperCase() || null;
  state.year = Number(String(sourceYear.value).split("-").pop()) || state.year;
  syncAllSelectDisplays();
}

function scheduleSocietyContextSync(code) {
  window.clearTimeout(societyContextTimer);
  societyContextTimer = window.setTimeout(() => syncSocietyContextBar(code), 0);
}

function observeSocietyContext(code) {
  societyContextObserver?.disconnect();
  const root = $("#view");
  if (!root) return;
  societyContextObserver = new MutationObserver(() => scheduleSocietyContextSync(code));
  societyContextObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["value", "selected"] });
  scheduleSocietyContextSync(code);
}

function societyHostContext(code) {
  return {
    root: $("#view"),
    country: state.country,
    year: state.year,
    lang: state.lang,
    theme: state.theme,
    openDrawer,
    onNotice: showToast,
    onContextChange: ({ country, year }) => {
      if (country) selectUserCountry(country);
      if (year) state.year = Number(year);
      scheduleSocietyContextSync(code);
    },
  };
}

function renderSocialProgressWorkspace() {
  state.index = "SPI";
  if (!window.GIRSocialProgress?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль SPI не загружен" : "SPI module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRSocialProgress.render(societyHostContext("SPI"));
  observeSocietyContext("SPI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("SPI"));
  return result;
}

function renderSustainableDevelopmentWorkspace() {
  state.index = "SDG";
  if (!window.GIRSustainableDevelopment?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль SDG Index не загружен" : "SDG Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRSustainableDevelopment.render(societyHostContext("SDG"));
  observeSocietyContext("SDG");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("SDG"));
  return result;
}

function renderWorldHappinessWorkspace() {
  state.index = "WHR";
  if (!window.GIRWorldHappiness?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль World Happiness Report не загружен" : "World Happiness Report module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRWorldHappiness.render(societyHostContext("WHR"));
  observeSocietyContext("WHR");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("WHR"));
  return result;
}

function renderGlobalGenderGapWorkspace() {
  state.index = "GGGI";
  if (!window.GIRGlobalGenderGap?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль Global Gender Gap Index не загружен" : "Global Gender Gap Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRGlobalGenderGap.render(societyHostContext("GGGI"));
  observeSocietyContext("GGGI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("GGGI"));
  return result;
}

function renderUHCServiceCoverageWorkspace() {
  state.index = "UHC_SCI";
  if (!window.GIRUHCServiceCoverage?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль UHC Service Coverage Index не загружен" : "UHC Service Coverage Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRUHCServiceCoverage.render(societyHostContext("UHC_SCI"));
  observeSocietyContext("UHC_SCI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("UHC_SCI"));
  return result;
}

function renderCorruptionPerceptionsWorkspace() {
  state.index = "CPI";
  if (!window.GIRCorruptionPerceptions?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль Corruption Perceptions Index не загружен" : "Corruption Perceptions Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRCorruptionPerceptions.render(societyHostContext("CPI"));
  observeSocietyContext("CPI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("CPI"));
  return result;
}

function renderWorldPressFreedomWorkspace() {
  state.index = "WPFI";
  if (!window.GIRWorldPressFreedom?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль World Press Freedom Index не загружен" : "World Press Freedom Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRWorldPressFreedom.render(societyHostContext("WPFI"));
  observeSocietyContext("WPFI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("WPFI"));
  return result;
}

function renderRuleOfLawWorkspace() {
  state.index = "ROLI";
  if (!window.GIRRuleOfLaw?.render) {
    $("#view").innerHTML = `<div class="card"><h2>${escapeHtml(state.lang === "ru" ? "Модуль WJP Rule of Law Index не загружен" : "WJP Rule of Law Index module is not loaded")}</h2></div>`;
    return;
  }
  const result = window.GIRRuleOfLaw.render(societyHostContext("ROLI"));
  observeSocietyContext("ROLI");
  Promise.resolve(result).finally(() => scheduleSocietyContextSync("ROLI"));
  return result;
}
// GIR_PATCH:T14_GOVERNANCE_SOCIETY_ADAPTER:END

function renderWgiWorkspace() {
  state.index = "WGI";
  const root = $("#view");
  if (!window.GIRWGI?.render) {
    root.innerHTML = `<section class="card"><h1>WGI</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль Всемирных показателей государственного управления не загружен." : "The Worldwide Governance Indicators module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRWGI.render({
    root, country: state.country, year: state.year || 2024, dimension: state.wgiDimension, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, routeTo,
    onCountryChange: (iso3) => { const code=String(iso3||"").toUpperCase(); if (!code || code===state.country || !selectUserCountry(code)) return; updateGovernanceDimensionUrlState(); render(); },
    onYearChange: (year) => { const value=Number(year); if (!Number.isFinite(value) || value===Number(state.year)) return; state.year=value; updateGovernanceDimensionUrlState(); render(); },
    onDimensionChange: (dimension) => { const code=String(dimension||"GE").toUpperCase(); if (!["VA","PV","GE","RQ","RL","CC"].includes(code) || code===state.wgiDimension) return; state.wgiDimension=code; window.GIRWGI?.invalidate?.(); updateGovernanceDimensionUrlState(); render(); },
    onProvenance: (valueId, trigger) => openProvenance(valueId, trigger), onNotice: (message) => showToast(message),
  });
}

function renderVdemWorkspace() {
  state.index = "VDEM";
  const root = $("#view");
  if (!window.GIRVDEM?.render) {
    root.innerHTML = `<section class="card"><h1>V-Dem</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль индексов демократии V-Dem не загружен." : "The V-Dem Democracy Indices module is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRVDEM.render({
    root, country: state.country, year: state.year || 2025, dimension: state.vdemDimension, lang: state.lang, theme: state.theme,
    platformContext: PLATFORM_CONTEXT, escapeHtml, flagImage, routeTo,
    onCountryChange: (iso3) => { const code=String(iso3||"").toUpperCase(); if (!code || code===state.country || !selectUserCountry(code)) return; updateGovernanceDimensionUrlState(); render(); },
    onYearChange: (year) => { const value=Number(year); if (!Number.isFinite(value) || value===Number(state.year)) return; state.year=value; updateGovernanceDimensionUrlState(); render(); },
    onDimensionChange: (dimension) => { const code=String(dimension||"EDI").toUpperCase(); if (!["EDI","LDI","PDI","DDI","EGDI"].includes(code) || code===state.vdemDimension) return; state.vdemDimension=code; window.GIRVDEM?.invalidate?.(); updateGovernanceDimensionUrlState(); render(); },
    onProvenance: (valueId, trigger) => openProvenance(valueId, trigger), onNotice: (message) => showToast(message),
  });
}

function renderQsIntelligenceWorkspace() {
  state.index = "QS_ET";
  const root = $("#view");
  if (!window.GIRQSIntelligence?.render) {
    root.innerHTML = `<section class="card"><h1>${escapeHtml(state.lang === "ru" ? "Аналитика QS" : "QS Intelligence")}</h1><p>${escapeHtml(state.lang === "ru" ? "Модуль аналитики QS не загружен." : "The QS Intelligence workspace is unavailable.")}</p></section>`;
    return;
  }
  return window.GIRQSIntelligence.render({
    root,
    country: state.country,
    year: state.year || 2026,
    lang: state.lang,
    theme: state.theme,
    platformContext: PLATFORM_CONTEXT,
    escapeHtml,
    flagImage,
    routeTo,
    openProvenance,
    selectCountry: (iso3) => {
      if (!selectUserCountry(iso3)) return false;
      renderContextBar();
      bindContextControls();
      return true;
    },
    onNotice: (message) => showToast(message),
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
  if(!selectUserCountry(iso3))return;
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
