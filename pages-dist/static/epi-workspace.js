(() => {
  "use strict";

  const API = "/api/environment/epi";
  const STATIC_CORE = "/static/epi/epi-core.json";
  const STATIC_SCORES = "/static/epi/epi-scores.json";
  const GEO_SOURCES = [
    "/static/epi-world.geojson",
    "/static/world_countries.geojson",
    "/world.geojson",
    "/static/world_countries_lite.geojson",
  ];
  const DEFAULT_COMPONENT = "EPI";
  const OBJECTIVES = ["ECO", "HLT", "PCC"];
  const SORT_FIELDS = new Set(["rank", "country", "score", "change_10y", "regional_rank"]);

  const COPY = {
    ru: {
      loadingTitle: "Собираем экологический профиль мира",
      loadingText: "Проверяем официальный snapshot EPI 2026, иерархию 1 → 3 → 12 → 47 и доказательную запись.",
      errorCode: "EPI / DATA CONTRACT",
      errorTitle: "Пространство EPI временно недоступно",
      errorText: "Не удалось загрузить официальный набор данных или его проверенную статическую копию.",
      retry: "Повторить",
      skip: "Перейти к аналитике",
      kicker: "Экология и устойчивость · официальный международный индекс",
      title: "Индекс экологической эффективности",
      lead: "Доказательное пространство для анализа экологического здоровья, жизнеспособности экосистем и климатической результативности стран.",
      edition: "Редакция 2026",
      sourceOfficial: "Официальный набор Yale / CIESIN",
      sourceDetail: "177 стран · 47 показателей · 12 категорий · 3 цели политики",
      verified: "целостность проверена",
      country: "Страна",
      countrySearch: "Поиск страны или ISO3",
      noCountries: "Ничего не найдено",
      methodology: "Методология",
      copyLink: "Скопировать ссылку",
      copied: "Ссылка на профиль EPI скопирована",
      apiMode: "FastAPI · официальный snapshot",
      staticMode: "Проверенный статический snapshot",
      officialValues: "Официальные баллы и места",
      derivedNavigation: "Процентиль GIR — только навигация",
      nonCommercial: "CC BY-NC-SA 4.0 · некоммерческое использование",
      countryProfile: "Страновой командный центр",
      score: "Оценка EPI",
      globalRank: "Место в мире",
      regionalRank: "Место в регионе",
      change10y: "Изменение за 10 лет",
      percentile: "Процентиль GIR",
      region: "Регион",
      world: "Мир",
      selectedCountry: "Выбранная страна",
      withinEdition: "официальная динамика внутри методики 2026",
      jumpOverview: "Позиция",
      jumpMap: "Карта",
      jumpStructure: "Архитектура",
      jumpRanking: "Рейтинг",
      jumpMethod: "Методология",
      evidence: "Паспорт данных",
      overviewKicker: "01 · Сигналы",
      overviewTitle: "Что определяет позицию страны",
      overviewText: "Четыре сигнала отделяют официальный результат от интерпретации: сильные и слабые категории, региональный разрыв и допустимая десятилетняя динамика.",
      strongest: "Сильнейшая категория",
      weakest: "Зона наибольшего отставания",
      regionGap: "Разрыв со средним региона",
      momentum: "Десятилетний импульс",
      issueScore: "балл категории",
      points: "пункта",
      above: "выше",
      below: "ниже",
      officialChange: "официальный показатель EPI",
      mapKicker: "02 · География",
      mapTitle: "Мировая карта EPI 2026",
      mapText: "Переключайте любой из 63 компонентов и открывайте страну прямо с карты. Цвет отражает официальный балл выбранного компонента.",
      mapPanel: "География результата",
      mapDescription: "Интерактивная карта официальных баллов Environmental Performance Index 2026 по странам.",
      mapTable: "Таблица данных карты",
      mapTableHint: "Доступное табличное представление текущего картографического среза.",
      workspaceSections: "Разделы аналитического пространства EPI",
      component: "Компонент",
      low: "ниже",
      high: "выше",
      noData: "нет данных / неприменимо",
      currentOutline: "контур выбранной страны",
      leaders: "Лидеры компонента",
      regionalBenchmarks: "Региональные ориентиры",
      mapUnavailable: "Геометрия карты не загрузилась. Рейтинг и остальные аналитические блоки доступны полностью.",
      openCountry: "Открыть профиль",
      structureKicker: "03 · Архитектура",
      structureTitle: "Как складывается итоговый балл",
      structureText: "Три цели экологической политики раскрываются в 12 тематических категориях и 47 индикаторах. Официальные веса сохранены без переинтерпретации.",
      objectiveRadar: "Три цели политики",
      method2026: "официальные веса 2026",
      countryShort: "Страна",
      weight: "Вес",
      rank: "Место",
      objectives: "цели политики",
      categories: "категории",
      indicators: "показатели",
      activeObjective: "Детализация цели",
      categoryIntro: "Раскройте категорию, чтобы увидеть входящие индикаторы, годы данных, баллы, места и официальную динамику.",
      indicator: "Показатель",
      dataYear: "Год данных",
      change: "Изменение",
      compare: "Сравнить в рейтинге",
      missing: "нет / неприменимо",
      rankingKicker: "04 · Сопоставление",
      rankingTitle: "Полный рейтинг любого компонента",
      rankingText: "Поиск, региональный фильтр, официальные ничьи, пропуски мест, отсутствующие значения и экспорт текущего среза сохраняются явно.",
      allRegions: "Все регионы",
      searchCountries: "Поиск по стране",
      includeMissing: "Показывать неприменимые значения",
      rankedCoverage: "Стран с баллом",
      selectedPosition: "Позиция выбранной страны",
      worldMean: "Среднее мира",
      officialSource: "Официальная таблица EPI",
      place: "Место",
      countryColumn: "Страна",
      scoreColumn: "Баллы",
      benchmark: "К среднему мира",
      changeColumn: "10-летняя динамика",
      regionalPlace: "В регионе",
      action: "Действие",
      noRanking: "Нет строк, соответствующих выбранным фильтрам.",
      rowsPerPage: "Строк",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      records: "записей",
      exportCsv: "Экспорт CSV",
      rankingFootnote: "Баллы, места, десятилетняя динамика и региональные места — официальные. Percentile — производное поле GIR. Ничьи и следующие за ними пропуски мест не пересчитываются.",
      methodKicker: "05 · Доказательная база",
      methodTitle: "Прозрачная методика и воспроизводимое происхождение",
      methodText: "Интерфейс показывает структуру весов, ограничения сопоставимости, контрольные суммы и лицензионный режим рядом с данными, а не в скрытом приложении.",
      frameworkTitle: "Иерархия 1 → 3 → 12 → 47",
      frameworkText: "Сводный EPI раскрывается до каждого официального показателя. Нулём не заменяются отсутствующие или неприменимые значения.",
      comparabilityTitle: "Сопоставимость выпусков",
      comparabilityText: "Методика меняется между редакциями. Интерфейс не строит искусственный межвыпусковой ряд и использует только официальное изменение из книги 2026.",
      integrityTitle: "Проверенная целостность",
      integrityText: "Raw XLSX, derived CSV, transformation ID и SHA-256 входят в единый паспорт источника. Официальные места не пересчитаны.",
      licenseTitle: "Лицензия и внедрение",
      licenseText: "EPI 2026 опубликован по CC BY-NC-SA 4.0. Для коммерческой поставки требуется отдельная проверка и, при необходимости, разрешение правообладателя.",
      openEvidence: "Открыть паспорт данных",
      officialLinks: "Официальные материалы",
      results: "Результаты EPI",
      methodologyLink: "Методология 2026",
      downloads: "Файлы и публикации",
      evidenceKicker: "EPI · PROVENANCE",
      evidenceTitle: "Паспорт официального набора",
      evidenceLead: "Источник, трансформация, контрольные суммы, ограничения сопоставимости и лицензия.",
      close: "Закрыть",
      dataset: "Набор данных",
      editionLabel: "Редакция",
      retrieved: "Получено",
      owner: "Правообладатели данных",
      status: "Статус",
      checksums: "Контрольные суммы проверены",
      contract: "Контракт данных валиден",
      ranksPreserved: "Официальные места сохранены",
      noSeries: "Межвыпусковой ряд не создан",
      fingerprint: "Отпечаток набора SHA-256",
      copy: "Копировать",
      rawFiles: "Исходные файлы",
      derivedFiles: "Производные файлы",
      transformation: "Трансформация",
      license: "Лицензия",
      integrityCopied: "SHA-256 скопирован",
      csvReady: "CSV сформирован из текущего официального среза",
      mapLoading: "Загружаем геометрию карты…",
      selected: "выбрано",
      available: "доступно",
      sortAscending: "по возрастанию",
      sortDescending: "по убыванию",
      objectiveECO: "Жизнеспособность экосистем",
      objectiveHLT: "Экологическое здоровье",
      objectivePCC: "Изменение климата",
    },
    en: {
      loadingTitle: "Building the world's environmental profile",
      loadingText: "Validating the official EPI 2026 snapshot, the 1 → 3 → 12 → 47 hierarchy and its evidence record.",
      errorCode: "EPI / DATA CONTRACT",
      errorTitle: "The EPI workspace is temporarily unavailable",
      errorText: "The official dataset and its verified static copy could not be loaded.",
      retry: "Retry",
      skip: "Skip to analytics",
      kicker: "Environment & sustainability · official international index",
      title: "Environmental Performance Index",
      lead: "An evidence workspace for environmental health, ecosystem vitality and climate performance across countries.",
      edition: "2026 edition",
      sourceOfficial: "Official Yale / CIESIN dataset",
      sourceDetail: "177 countries · 47 indicators · 12 categories · 3 policy objectives",
      verified: "integrity verified",
      country: "Country",
      countrySearch: "Search country or ISO3",
      noCountries: "No matches",
      methodology: "Methodology",
      copyLink: "Copy link",
      copied: "EPI profile link copied",
      apiMode: "FastAPI · official snapshot",
      staticMode: "Verified static snapshot",
      officialValues: "Official scores and ranks",
      derivedNavigation: "GIR percentile is navigation only",
      nonCommercial: "CC BY-NC-SA 4.0 · non-commercial use",
      countryProfile: "Country command center",
      score: "EPI score",
      globalRank: "Global rank",
      regionalRank: "Regional rank",
      change10y: "10-year change",
      percentile: "GIR percentile",
      region: "Region",
      world: "World",
      selectedCountry: "Selected country",
      withinEdition: "official within-2026 methodology trend",
      jumpOverview: "Position",
      jumpMap: "Map",
      jumpStructure: "Architecture",
      jumpRanking: "Ranking",
      jumpMethod: "Methodology",
      evidence: "Data passport",
      overviewKicker: "01 · Signals",
      overviewTitle: "What shapes the country's position",
      overviewText: "Four signals separate the official result from interpretation: strongest and weakest categories, regional gap and the supported ten-year change.",
      strongest: "Strongest category",
      weakest: "Largest performance gap",
      regionGap: "Gap to regional mean",
      momentum: "Ten-year momentum",
      issueScore: "category score",
      points: "points",
      above: "above",
      below: "below",
      officialChange: "official EPI measure",
      mapKicker: "02 · Geography",
      mapTitle: "EPI 2026 world map",
      mapText: "Switch among all 63 components and open a country directly from the map. Colour represents the official score for the selected component.",
      mapPanel: "Geography of performance",
      mapDescription: "Interactive map of official 2026 Environmental Performance Index country scores.",
      mapTable: "Map data table",
      mapTableHint: "Accessible tabular equivalent of the active map view.",
      workspaceSections: "EPI analytical workspace sections",
      component: "Component",
      low: "lower",
      high: "higher",
      noData: "missing / not material",
      currentOutline: "selected-country outline",
      leaders: "Component leaders",
      regionalBenchmarks: "Regional benchmarks",
      mapUnavailable: "Map geometry could not be loaded. The ranking and all analytical sections remain fully available.",
      openCountry: "Open profile",
      structureKicker: "03 · Architecture",
      structureTitle: "How the overall score is built",
      structureText: "Three policy objectives open into 12 issue categories and 47 indicators. Official weights are preserved without reinterpretation.",
      objectiveRadar: "Three policy objectives",
      method2026: "official 2026 weights",
      countryShort: "Country",
      weight: "Weight",
      rank: "Rank",
      objectives: "policy objectives",
      categories: "categories",
      indicators: "indicators",
      activeObjective: "Objective detail",
      categoryIntro: "Expand a category to inspect its indicators, data years, scores, ranks and official change.",
      indicator: "Indicator",
      dataYear: "Data year",
      change: "Change",
      compare: "Compare in ranking",
      missing: "missing / not material",
      rankingKicker: "04 · Comparison",
      rankingTitle: "Complete ranking for every component",
      rankingText: "Search, regional filters, official ties, rank gaps, missingness and export of the active slice remain explicit.",
      allRegions: "All regions",
      searchCountries: "Search countries",
      includeMissing: "Show not-material values",
      rankedCoverage: "Countries with a score",
      selectedPosition: "Selected-country position",
      worldMean: "World mean",
      officialSource: "Official EPI table",
      place: "Rank",
      countryColumn: "Country",
      scoreColumn: "Score",
      benchmark: "Against world mean",
      changeColumn: "10-year change",
      regionalPlace: "Regional",
      action: "Action",
      noRanking: "No rows match the selected filters.",
      rowsPerPage: "Rows",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      records: "records",
      exportCsv: "Export CSV",
      rankingFootnote: "Scores, ranks, ten-year change and regional ranks are official. Percentile is GIR-derived. Official ties and subsequent rank gaps are not recomputed.",
      methodKicker: "05 · Evidence base",
      methodTitle: "Transparent method and reproducible provenance",
      methodText: "The interface puts weights, comparability limits, checksums and licence terms next to the data rather than hiding them in an appendix.",
      frameworkTitle: "Hierarchy 1 → 3 → 12 → 47",
      frameworkText: "The composite EPI opens down to every official indicator. Missing and not-material values are never replaced by zero.",
      comparabilityTitle: "Cross-edition comparability",
      comparabilityText: "Methods change between editions. The interface does not create an artificial cross-edition series and uses only the official change field in the 2026 workbook.",
      integrityTitle: "Verified integrity",
      integrityText: "Raw XLSX files, derived CSV files, transformation ID and SHA-256 form one source passport. Official ranks are not recalculated.",
      licenseTitle: "Licence and deployment",
      licenseText: "EPI 2026 is released under CC BY-NC-SA 4.0. Commercial delivery requires a separate terms review and, where needed, permission from the rights holder.",
      openEvidence: "Open data passport",
      officialLinks: "Official materials",
      results: "EPI results",
      methodologyLink: "2026 methodology",
      downloads: "Files and publications",
      evidenceKicker: "EPI · PROVENANCE",
      evidenceTitle: "Official dataset passport",
      evidenceLead: "Source, transformation, checksums, comparability limits and licence.",
      close: "Close",
      dataset: "Dataset",
      editionLabel: "Edition",
      retrieved: "Retrieved",
      owner: "Data owners",
      status: "Status",
      checksums: "Checksums verified",
      contract: "Data contract validated",
      ranksPreserved: "Official ranks preserved",
      noSeries: "No cross-edition series created",
      fingerprint: "Dataset SHA-256 fingerprint",
      copy: "Copy",
      rawFiles: "Raw files",
      derivedFiles: "Derived files",
      transformation: "Transformation",
      license: "Licence",
      integrityCopied: "SHA-256 copied",
      csvReady: "CSV created from the active official slice",
      mapLoading: "Loading map geometry…",
      selected: "selected",
      available: "available",
      sortAscending: "ascending",
      sortDescending: "descending",
      objectiveECO: "Ecosystem Vitality",
      objectiveHLT: "Environmental Health",
      objectivePCC: "Climate Change",
    },
  };

  const state = {
    context: null,
    root: null,
    lang: "ru",
    theme: "dark",
    provider: null,
    providerMode: "api",
    base: null,
    profile: null,
    geo: null,
    country: "",
    component: DEFAULT_COMPONENT,
    activeObjective: "ECO",
    region: "",
    query: "",
    sort: "rank",
    order: "asc",
    page: 0,
    pageSize: 25,
    includeMissing: true,
    pickerOpen: false,
    pickerQuery: "",
    drawerOpen: false,
    loadToken: 0,
    componentBusy: false,
    boundRoot: null,
    scrollObserver: null,
    lastFocus: null,
    documentPointerBound: false,
  };

  const cache = {
    basePromise: null,
    staticPromise: null,
    profiles: new Map(),
    rankings: new Map(),
    geoPromise: null,
  };

  let searchTimer = null;
  let pickerTimer = null;
  let toastTimer = null;

  function tr(key) { return COPY[state.lang]?.[key] || COPY.ru[key] || key; }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }
  function num(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
  function int(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return Math.round(Number(value)).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US");
  }
  function signed(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    const number = Number(value);
    return `${number > 0 ? "+" : ""}${num(number, digits)}`;
  }
  function clamp(value, min = 0, max = 100) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : min;
  }
  function localName(item) { return state.lang === "ru" ? (item?.name_ru || item?.name_en || "") : (item?.name_en || item?.name_ru || ""); }
  function localRegion(item) { return state.lang === "ru" ? (item?.region_ru || item?.region_en || "") : (item?.region_en || item?.region_ru || ""); }
  function localGroup(item) { return state.lang === "ru" ? (item?.group_name_ru || item?.group_name_en || "") : (item?.group_name_en || item?.group_name_ru || ""); }
  function deltaClass(value) {
    if (value === null || value === undefined || Number(value) === 0) return "is-neutral";
    return Number(value) > 0 ? "is-positive" : "is-negative";
  }
  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch (_) { return "#"; }
  }
  function icon(name) {
    const paths = {
      arrow: '<path d="M5 12h13"/><path d="m14 7 5 5-5 5"/>',
      chevron: '<path d="m8 10 4 4 4-4"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      copy: '<rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
      external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7h.01"/>',
      leaf: '<path d="M20 4c-7 0-13 3-13 9 0 3 2 5 5 5 6 0 8-7 8-14Z"/><path d="M4 21c3-6 7-9 13-12"/>',
      heart: '<path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/><path d="M3.8 12h4l2-3 3.2 7 2-4h5"/>',
      climate: '<path d="M12 2v20"/><path d="m4.9 6 14.2 12"/><path d="m19.1 6-14.2 12"/><circle cx="12" cy="12" r="2"/>',
      layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      shield: '<path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',
      trend: '<path d="M3 18 9 12l4 4 8-10"/><path d="M15 6h6v6"/>',
      warning: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
      reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
      sort: '<path d="m8 9 4-4 4 4"/><path d="m16 15-4 4-4-4"/>',
      left: '<path d="m15 18-6-6 6-6"/>',
      right: '<path d="m9 18 6-6-6-6"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.info}</svg>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = typeof body?.detail === "string" ? body.detail : body?.detail?.message_en;
      throw new Error(detail || `${url} · HTTP ${response.status}`);
    }
    return response.json();
  }

  function parseStaticRow(columns, values) {
    const row = {};
    columns.forEach((column, index) => { row[column] = values[index] ?? null; });
    return row;
  }

  async function loadStaticStore() {
    if (!cache.staticPromise) {
      cache.staticPromise = Promise.all([fetchJson(STATIC_CORE), fetchJson(STATIC_SCORES)])
        .then(([core, scores]) => {
          const rows = (scores.rows || []).map((values) => parseStaticRow(scores.columns || [], values));
          const countries = new Map((core.countries || []).map((item) => [item.iso3, item]));
          const components = new Map((core.components?.components || []).map((item) => [item.code, item]));
          const byCountry = new Map();
          const byComponent = new Map();
          rows.forEach((row) => {
            if (!byCountry.has(row.iso3)) byCountry.set(row.iso3, []);
            byCountry.get(row.iso3).push(row);
            if (!byComponent.has(row.component_code)) byComponent.set(row.component_code, []);
            byComponent.get(row.component_code).push(row);
          });
          return { core, rows, countries, components, byCountry, byComponent };
        })
        .catch((error) => { cache.staticPromise = null; throw error; });
    }
    return cache.staticPromise;
  }

  function staticScore(store, row) {
    const country = store.countries.get(row.iso3) || {};
    const component = store.components.get(row.component_code) || {};
    return {
      iso3: row.iso3,
      iso2: country.iso2 || null,
      name_en: country.name_en || row.iso3,
      name_ru: country.name_ru || country.name_en || row.iso3,
      region_en: country.region_en || null,
      region_ru: country.region_ru || country.region_en || null,
      group_name_en: country.group_name_en || null,
      group_name_ru: country.group_name_ru || country.group_name_en || null,
      component_code: row.component_code,
      component_name_en: component.name_en || row.component_code,
      component_name_ru: component.name_ru || component.name_en || row.component_code,
      score: row.score,
      rank: row.rank,
      percentile: row.percentile,
      percentile_is_derived: true,
      change_10y: row.change_10y,
      regional_rank: row.regional_rank,
      regional_mean: row.regional_mean,
      world_mean: row.world_mean,
      edition: 2026,
      most_recent_data_year: row.most_recent_data_year,
      baseline_year: row.baseline_year,
      is_official: true,
      is_recomputed: false,
      quality_flag: "official_epi_2026",
      missing: Boolean(row.missing),
    };
  }

  async function makeStaticProvider() {
    const store = await loadStaticStore();
    function ranking(code) {
      const componentCode = String(code || DEFAULT_COMPONENT).toUpperCase();
      const component = store.components.get(componentCode);
      if (!component) throw new Error(`Unknown EPI component: ${componentCode}`);
      const rows = (store.byComponent.get(componentCode) || []).map((row) => staticScore(store, row));
      rows.sort((a, b) => {
        if (a.rank == null && b.rank == null) return localName(a).localeCompare(localName(b));
        if (a.rank == null) return 1;
        if (b.rank == null) return -1;
        return Number(a.rank) - Number(b.rank) || a.iso3.localeCompare(b.iso3);
      });
      return {
        schema_version: "gir-epi-backend-v1",
        index_code: "EPI",
        edition: 2026,
        component,
        filters: { region: null, query: null, include_missing: true },
        sort: { field: "rank", order: "asc" },
        pagination: { offset: 0, limit: rows.length, returned: rows.length, total: rows.length },
        ranking: rows,
        ranking_note_ru: "Места и баллы официальные; percentile — производное поле GIR на основе официального места.",
        ranking_note_en: "Ranks and scores are official; percentile is a GIR-derived field based on the official rank.",
      };
    }
    function country(iso3) {
      const code = String(iso3 || "").toUpperCase();
      const countryMeta = store.countries.get(code);
      if (!countryMeta) throw new Error(`Unknown country: ${code}`);
      const rowMap = new Map((store.byCountry.get(code) || []).map((row) => [row.component_code, row]));
      const children = new Map();
      (store.core.components?.components || []).forEach((component) => {
        const parent = component.parent_code || "__ROOT__";
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push(component);
      });
      function node(componentCode) {
        const component = store.components.get(componentCode);
        const row = rowMap.get(componentCode);
        return {
          ...component,
          value: row ? staticScore(store, row) : null,
          children: (children.get(componentCode) || []).map((child) => node(child.code)),
        };
      }
      return {
        schema_version: "gir-epi-backend-v1",
        index_code: "EPI",
        edition: 2026,
        country: countryMeta,
        hierarchy: node("EPI"),
        comparability: store.core.provenance?.manifest?.comparability || {},
        source: store.core.overview?.source || {},
      };
    }
    return {
      mode: "static",
      async base() {
        return {
          overview: store.core.overview,
          components: store.core.components,
          regions: store.core.regions,
          baseRanking: store.core.base_ranking,
          provenance: store.core.provenance,
          countries: store.core.countries,
        };
      },
      country,
      ranking: async (code) => ranking(code),
    };
  }

  function makeApiProvider(overview) {
    return {
      mode: "api",
      async base() {
        const [components, regions, baseRanking, provenance] = await Promise.all([
          fetchJson(`${API}/components`),
          fetchJson(`${API}/regions`),
          fetchJson(`${API}/ranking?component=EPI&include_missing=true&limit=500`),
          fetchJson(`${API}/provenance`),
        ]);
        const countries = (baseRanking.ranking || []).map((row) => ({
          iso3: row.iso3,
          iso2: row.iso2,
          name_en: row.name_en,
          name_ru: row.name_ru,
          region_en: row.region_en,
          region_ru: row.region_ru,
          group_name_en: row.group_name_en,
          group_name_ru: row.group_name_ru,
        }));
        return { overview, components, regions, baseRanking, provenance, countries };
      },
      country(iso3) { return fetchJson(`${API}/countries/${encodeURIComponent(String(iso3).toUpperCase())}`); },
      ranking(code) { return fetchJson(`${API}/ranking?component=${encodeURIComponent(String(code).toUpperCase())}&include_missing=true&limit=500`); },
    };
  }

  async function resolveProvider() {
    try {
      return makeApiProvider(await fetchJson(API));
    } catch (apiError) {
      try {
        return await makeStaticProvider();
      } catch (staticError) {
        throw new Error(`${apiError.message}; static fallback: ${staticError.message}`);
      }
    }
  }

  async function ensureBase() {
    if (state.base && state.provider) return state.base;
    if (!cache.basePromise) {
      cache.basePromise = resolveProvider()
        .then(async (provider) => {
          const base = await provider.base();
          state.provider = provider;
          state.providerMode = provider.mode;
          state.base = base;
          if (base.baseRanking) cache.rankings.set("EPI", base.baseRanking);
          return base;
        })
        .catch((error) => { cache.basePromise = null; throw error; });
    }
    return cache.basePromise;
  }

  async function ensureProfile(iso3) {
    const code = String(iso3 || "").toUpperCase();
    if (cache.profiles.has(code)) return cache.profiles.get(code);
    const profile = await state.provider.country(code);
    cache.profiles.set(code, profile);
    return profile;
  }

  async function ensureRanking(code) {
    const componentCode = String(code || DEFAULT_COMPONENT).toUpperCase();
    if (cache.rankings.has(componentCode)) return cache.rankings.get(componentCode);
    const ranking = await state.provider.ranking(componentCode);
    cache.rankings.set(componentCode, ranking);
    return ranking;
  }

  async function ensureGeo() {
    if (state.geo) return state.geo;
    if (!cache.geoPromise) {
      cache.geoPromise = (async () => {
        let lastError = null;
        for (const source of GEO_SOURCES) {
          try {
            const geo = await fetchJson(source);
            if (geo?.features?.length) {
              state.geo = geo;
              return geo;
            }
          } catch (error) { lastError = error; }
        }
        throw lastError || new Error("GeoJSON not found");
      })().catch((error) => {
        cache.geoPromise = null;
        console.warn("EPI map geometry unavailable", error);
        return null;
      });
    }
    return cache.geoPromise;
  }

  function componentByCode(code) {
    return (state.base?.components?.components || []).find((item) => item.code === String(code || "").toUpperCase()) || null;
  }
  function activeRanking() { return cache.rankings.get(state.component) || state.base?.baseRanking || null; }
  function baseRow(iso3 = state.country) { return (state.base?.baseRanking?.ranking || []).find((row) => row.iso3 === iso3) || null; }
  function activeRow(iso3 = state.country) { return (activeRanking()?.ranking || []).find((row) => row.iso3 === iso3) || null; }
  function currentCountry() { return state.profile?.country || baseRow() || null; }
  function flattenTree(root) {
    const rows = [];
    function walk(node, depth = 0) {
      if (!node) return;
      rows.push({ ...node, depth });
      (node.children || []).forEach((child) => walk(child, depth + 1));
    }
    walk(root);
    return rows;
  }
  function profileNodes() { return flattenTree(state.profile?.hierarchy); }
  function profileNode(code) { return profileNodes().find((item) => item.code === String(code || "").toUpperCase()) || null; }
  function objectiveNodes() { return (state.profile?.hierarchy?.children || []).filter((item) => item.type === "PolicyObjective"); }
  function issueNodes(objectiveCode = null) {
    const objectives = objectiveCode ? objectiveNodes().filter((item) => item.code === objectiveCode) : objectiveNodes();
    return objectives.flatMap((item) => (item.children || []).filter((child) => child.type === "IssueCategory"));
  }
  function rootValue() { return state.profile?.hierarchy?.value || baseRow(); }

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    const country = String(params.get("country") || state.country || "").toUpperCase();
    const component = String(params.get("epi_component") || state.component || DEFAULT_COMPONENT).toUpperCase();
    const region = params.get("epi_region") || "";
    if (country) state.country = country;
    if (!state.base || componentByCode(component)) state.component = component;
    state.region = region;
  }

  function writeUrl() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("index", "EPI");
      url.searchParams.set("country", state.country);
      if (state.component !== DEFAULT_COMPONENT) url.searchParams.set("epi_component", state.component);
      else url.searchParams.delete("epi_component");
      if (state.region) url.searchParams.set("epi_region", state.region);
      else url.searchParams.delete("epi_region");
      url.hash = "index-EPI";
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (_) { /* Embedded previews may not expose history. */ }
  }

  function flagMarkup(item, size = "inline") {
    const iso2 = String(item?.iso2 || "").toLowerCase();
    const iso3 = String(item?.iso3 || "").toUpperCase();
    const className = size === "large" ? "epi-flag-wrap--large" : size === "medium" ? "epi-flag-wrap--medium" : "epi-flag-wrap--inline";
    if (!/^[a-z]{2}$/.test(iso2)) return `<span class="epi-flag-wrap ${className} is-fallback"><span class="epi-flag epi-flag--fallback">${esc(iso3 || "—")}</span></span>`;
    return `<span class="epi-flag-wrap ${className}"><img class="epi-flag" src="/static/flags/${esc(iso2)}.svg" alt="" loading="lazy" decoding="async" data-epi-flag><span class="epi-flag epi-flag--fallback">${esc(iso3)}</span></span>`;
  }

  function renderLoading() {
    state.root.innerHTML = `<section class="epi-workspace index-workspace gir-native-workspace"><div class="epi-loading-shell" aria-live="polite">
      <div class="epi-loading-orbit" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="epi-loading-copy"><strong>${esc(tr("loadingTitle"))}</strong><span>${esc(tr("loadingText"))}</span></div>
      <div class="epi-loading-grid" aria-hidden="true">${Array.from({ length: 6 }, (_, index) => `<i style="--delay:${index}"></i>`).join("")}</div>
    </div></section>`;
  }

  function renderError(error) {
    state.root.innerHTML = `<section class="epi-workspace index-workspace gir-native-workspace"><div class="epi-error-shell" role="alert">
      <span class="epi-error-code">${esc(tr("errorCode"))}</span>
      <h1>${esc(tr("errorTitle"))}</h1>
      <p>${esc(tr("errorText"))}</p>
      <p><code>${esc(error?.message || String(error || ""))}</code></p>
      <button class="epi-button epi-button--primary" type="button" data-epi-action="retry">${icon("reset")}${esc(tr("retry"))}</button>
    </div></section>`;
  }

  function countryOptionsMarkup() {
    const needle = state.pickerQuery.trim().toLocaleLowerCase(state.lang === "ru" ? "ru" : "en");
    const rows = (state.base?.countries || [])
      .filter((country) => !needle || `${country.iso3} ${country.name_ru || ""} ${country.name_en || ""} ${country.region_ru || ""} ${country.region_en || ""}`.toLocaleLowerCase().includes(needle))
      .sort((a, b) => localName(a).localeCompare(localName(b), state.lang === "ru" ? "ru" : "en"));
    if (!rows.length) return `<p class="epi-country-empty">${esc(tr("noCountries"))}</p>`;
    return rows.map((country) => {
      const row = baseRow(country.iso3) || {};
      return `<button type="button" class="epi-country-option ${country.iso3 === state.country ? "is-selected" : ""}" role="option" aria-selected="${country.iso3 === state.country}" data-epi-action="select-country" data-iso3="${esc(country.iso3)}">
        ${flagMarkup(country, "inline")}
        <span><strong>${esc(localName(country))}</strong><small>${esc(localRegion(country))} · ${esc(country.iso3)}</small></span>
        <b>${row.rank == null ? "—" : `#${int(row.rank)}`}</b>
      </button>`;
    }).join("");
  }

  function countryControlMarkup() {
    const country = currentCountry() || {};
    return `<div class="epi-country-control">
      <span class="epi-control-label">${esc(tr("country"))}</span>
      <button class="epi-country-trigger" type="button" data-epi-action="toggle-country" aria-haspopup="listbox" aria-expanded="${state.pickerOpen}">
        ${flagMarkup(country, "medium")}
        <span><strong>${esc(localName(country))}</strong><small>${esc(localRegion(country))} · ${esc(country.iso3 || "")}</small></span>
        ${icon("chevron")}
      </button>
      ${state.pickerOpen ? `<div class="epi-country-popover">
        <label class="epi-search-field">${icon("search")}<input id="epiCountrySearch" value="${esc(state.pickerQuery)}" placeholder="${esc(tr("countrySearch"))}" autocomplete="off" aria-label="${esc(tr("countrySearch"))}"><kbd>ESC</kbd></label>
        <div class="epi-country-options" role="listbox" aria-label="${esc(tr("country"))}">${countryOptionsMarkup()}</div>
      </div>` : ""}
    </div>`;
  }

  function gaugeMarkup(value) {
    const score = clamp(value?.score);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);
    return `<div class="epi-score-gauge" aria-label="${esc(tr("score"))}: ${num(value?.score, 2)}">
      <svg viewBox="0 0 130 130" role="img">
        <defs><linearGradient id="epiGaugeGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--epi-cyan)"/><stop offset=".56" stop-color="var(--epi-green)"/><stop offset="1" stop-color="var(--epi-lime)"/></linearGradient></defs>
        <circle class="epi-gauge-track" cx="65" cy="65" r="${radius}"/>
        <circle class="epi-gauge-value" cx="65" cy="65" r="${radius}" stroke-dasharray="${circumference.toFixed(3)}" stroke-dashoffset="${offset.toFixed(3)}"/>
        <circle class="epi-gauge-core" cx="65" cy="65" r="42"/>
      </svg>
      <div class="epi-gauge-copy"><small>EPI 2026</small><strong>${num(value?.score, 2)}</strong><em>0–100</em></div>
    </div>`;
  }

  function benchmarkRow(label, score, className) {
    return `<div class="epi-benchmark-row"><span>${esc(label)}</span><i><b class="${className}" style="width:${clamp(score)}%"></b></i><strong>${num(score, 1)}</strong></div>`;
  }

  function heroMarkup() {
    const country = currentCountry() || {};
    const value = rootValue() || {};
    const region = (state.base?.regions?.regions || []).find((item) => item.region_en === country.region_en) || {};
    const coverage = state.base?.overview?.coverage || {};
    const mode = state.providerMode === "api" ? tr("apiMode") : tr("staticMode");
    return `<section class="epi-hero" id="epi-hero" aria-labelledby="epi-title">
      <div class="epi-hero-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="epi-hero-copy">
        <span class="epi-kicker"><i class="epi-live-dot"></i>${esc(tr("kicker"))}</span>
        <div class="epi-title-row"><h1 id="epi-title">${esc(tr("title"))}</h1><span class="epi-edition">${esc(tr("edition"))}</span></div>
        <p>${esc(tr("lead"))}</p>
        <a class="epi-source-lockup" href="${safeUrl(state.base?.overview?.source?.source_urls?.results_page)}" target="_blank" rel="noopener noreferrer">
          <span class="epi-source-mark">Y</span>
          <span><b>${esc(tr("sourceOfficial"))}</b><small>${esc(tr("sourceDetail"))}</small></span>
          <em>${icon("shield")}${esc(tr("verified"))}</em>
        </a>
        <div class="epi-hero-controls">
          ${countryControlMarkup()}
          <div class="epi-hero-actions">
            <a class="epi-button" href="#epi-methodology">${icon("layers")}${esc(tr("methodology"))}</a>
            <button class="epi-button" type="button" data-epi-action="copy-link">${icon("copy")}${esc(tr("copyLink"))}</button>
          </div>
        </div>
        <div class="epi-hero-foot"><span>${esc(mode)}</span><span>${esc(tr("officialValues"))}</span><span>${esc(tr("nonCommercial"))}</span></div>
      </div>
      <aside class="epi-command-card" data-country="${esc(country.iso3 || state.country)}">
        <header>${flagMarkup(country, "large")}<div><small>${esc(tr("countryProfile"))}</small><h2>${esc(localName(country))}</h2><p>${esc(localRegion(country))}${localGroup(country) ? ` · ${esc(localGroup(country))}` : ""}</p></div><span class="epi-country-code">${esc(country.iso3 || "")}</span></header>
        <div class="epi-command-main">
          ${gaugeMarkup(value)}
          <div class="epi-command-metrics">
            <div><span>${esc(tr("globalRank"))}</span><strong>#${int(value.rank)}</strong><small>${int(coverage.ranked_countries || 177)} ${esc(tr("country")).toLocaleLowerCase()}</small></div>
            <div><span>${esc(tr("regionalRank"))}</span><strong>#${int(value.regional_rank)}</strong><small>${int(region.countries)} · ${esc(localRegion(country))}</small></div>
            <div><span>${esc(tr("change10y"))}</span><strong class="${deltaClass(value.change_10y)}">${signed(value.change_10y, 2)}</strong><small>${esc(tr("withinEdition"))}</small></div>
            <div><span>${esc(tr("percentile"))}</span><strong>${num(value.percentile, 1)}%</strong><small>${esc(tr("derivedNavigation"))}</small></div>
          </div>
        </div>
        <div class="epi-benchmark-bars">
          ${benchmarkRow(tr("selectedCountry"), value.score, "is-country")}
          ${benchmarkRow(localRegion(country), value.regional_mean, "is-region")}
          ${benchmarkRow(tr("world"), value.world_mean, "is-world")}
        </div>
        <footer>${icon("warning")}${esc(tr("rankingFootnote"))}</footer>
      </aside>
    </section>`;
  }

  function jumpMarkup() {
    const items = [
      ["01", "epi-overview", tr("jumpOverview")],
      ["02", "epi-map", tr("jumpMap")],
      ["03", "epi-structure", tr("jumpStructure")],
      ["04", "epi-ranking", tr("jumpRanking")],
      ["05", "epi-methodology", tr("jumpMethod")],
    ];
    return `<nav class="epi-jump" aria-label="${esc(tr("workspaceSections"))}">${items.map(([number, id, label], index) => `<a href="#${id}" data-epi-jump="${id}" ${index === 0 ? 'class="is-active" aria-current="location"' : ""}><span>${number}</span>${esc(label)}</a>`).join("")}<button type="button" data-epi-action="open-evidence" aria-label="${esc(tr("evidence"))}" title="${esc(tr("evidence"))}">${icon("database")}</button></nav>`;
  }

  function sectionHeading(kicker, title, text, compact = false) {
    return `<header class="epi-section-heading ${compact ? "epi-section-heading--compact" : ""}"><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2></div><p>${esc(text)}</p></header>`;
  }

  function insightsData() {
    const issues = issueNodes().filter((item) => item.value && !item.value.missing && item.value.score !== null);
    const strongest = issues.slice().sort((a, b) => Number(b.value.score) - Number(a.value.score))[0];
    const weakest = issues.slice().sort((a, b) => Number(a.value.score) - Number(b.value.score))[0];
    const value = rootValue() || {};
    return {
      strongest,
      weakest,
      gap: value.score == null || value.regional_mean == null ? null : Number(value.score) - Number(value.regional_mean),
      momentum: value.change_10y,
    };
  }

  function overviewMarkup() {
    const data = insightsData();
    const country = currentCountry() || {};
    const cards = [
      { className: "", label: tr("strongest"), title: localName(data.strongest), value: data.strongest?.value?.score, suffix: tr("issueScore"), note: `#${int(data.strongest?.value?.rank)} · ${data.strongest?.code || ""}`, bar: data.strongest?.value?.score },
      { className: "is-weak", label: tr("weakest"), title: localName(data.weakest), value: data.weakest?.value?.score, suffix: tr("issueScore"), note: `#${int(data.weakest?.value?.rank)} · ${data.weakest?.code || ""}`, bar: data.weakest?.value?.score },
      { className: "is-region", label: tr("regionGap"), title: localRegion(country), value: data.gap, signed: true, suffix: tr("points"), note: `${Number(data.gap) >= 0 ? tr("above") : tr("below")} · ${num(rootValue()?.regional_mean, 2)}`, bar: 50 + clamp(data.gap, -30, 30) },
      { className: "is-momentum", label: tr("momentum"), title: tr("officialChange"), value: data.momentum, signed: true, suffix: tr("points"), note: tr("withinEdition"), momentum: true },
    ];
    return `<section id="epi-overview">
      ${sectionHeading(tr("overviewKicker"), tr("overviewTitle"), tr("overviewText"))}
      <div class="epi-insight-grid">${cards.map((card, index) => `<article class="epi-insight-card ${card.className}">
        <span class="epi-insight-index">0${index + 1}</span><small>${esc(card.label)}</small><h3>${esc(card.title || "—")}</h3>
        <div><strong class="${card.signed ? deltaClass(card.value) : ""}">${card.signed ? signed(card.value, 2) : num(card.value, 2)}</strong><em>${esc(card.suffix)}</em></div>
        <p>${esc(card.note || "")}</p>
        ${card.momentum ? '<div class="epi-momentum-line" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b></b></div>' : `<i aria-hidden="true"><b style="width:${clamp(card.bar)}%"></b></i>`}
      </article>`).join("")}</div>
    </section>`;
  }

  function componentOptions() {
    const groups = [
      ["EPI", state.lang === "ru" ? "Сводный индекс" : "Composite index"],
      ["PolicyObjective", state.lang === "ru" ? "Цели политики" : "Policy objectives"],
      ["IssueCategory", state.lang === "ru" ? "Тематические категории" : "Issue categories"],
      ["Indicator", state.lang === "ru" ? "Показатели" : "Indicators"],
    ];
    const components = state.base?.components?.components || [];
    return groups.map(([type, label]) => {
      const rows = components.filter((item) => item.type === type);
      if (!rows.length) return "";
      return `<optgroup label="${esc(label)}">${rows.map((item) => `<option value="${esc(item.code)}" ${item.code === state.component ? "selected" : ""}>${esc(item.code)} · ${esc(localName(item))}</option>`).join("")}</optgroup>`;
    }).join("");
  }

  function regionOptions() {
    return `<option value="">${esc(tr("allRegions"))}</option>${(state.base?.regions?.regions || []).map((item) => `<option value="${esc(item.region_en)}" ${item.region_en === state.region ? "selected" : ""}>${esc(localRegion(item))}</option>`).join("")}`;
  }

  function isoFromFeature(feature) {
    const properties = feature?.properties || {};
    const candidates = [feature?.id, properties.ISO_A3, properties.iso_a3, properties.ADM0_A3, properties.adm0_a3, properties.SOV_A3, properties.sov_a3, properties.ISO3, properties.iso3];
    const aliases = { KOS: "XKX", ROM: "ROU", TMP: "TLS", SDS: "SSD" };
    for (const candidate of candidates) {
      const code = String(candidate || "").toUpperCase();
      if (/^[A-Z]{3}$/.test(code) && code !== "-99") return aliases[code] || code;
    }
    return "";
  }

  function ringPath(ring, width, height) {
    let path = "";
    let open = false;
    let previousLongitude = null;
    (ring || []).forEach((point) => {
      const longitude = Number(point?.[0]);
      const latitude = Number(point?.[1]);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;
      if (previousLongitude !== null && Math.abs(longitude - previousLongitude) > 180) {
        if (open) path += "Z ";
        open = false;
      }
      const x = ((longitude + 180) / 360) * width;
      const y = ((90 - clamp(latitude, -89.9, 89.9)) / 180) * height;
      path += `${open ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)} `;
      open = true;
      previousLongitude = longitude;
    });
    if (open) path += "Z ";
    return path;
  }

  function geometryPath(geometry, width = 1000, height = 500) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return (geometry.coordinates || []).map((ring) => ringPath(ring, width, height)).join("");
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map((ring) => ringPath(ring, width, height))).join("");
    if (geometry.type === "GeometryCollection") return (geometry.geometries || []).map((item) => geometryPath(item, width, height)).join("");
    return "";
  }

  function quantile(sorted, probability) {
    if (!sorted.length) return null;
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
  }

  function mapScale(rows) {
    const values = rows.map((row) => Number(row.score)).filter(Number.isFinite).sort((a, b) => a - b);
    return {
      values,
      min: values[0] ?? null,
      median: quantile(values, 0.5),
      max: values[values.length - 1] ?? null,
      thresholds: Array.from({ length: 6 }, (_, index) => quantile(values, (index + 1) / 7)),
    };
  }

  function mapBin(value, scale) {
    if (value === null || value === undefined || !Number.isFinite(Number(value)) || !scale.values.length) return null;
    let bin = 0;
    while (bin < scale.thresholds.length && Number(value) > scale.thresholds[bin]) bin += 1;
    return bin + 1;
  }

  function mapSvgMarkup() {
    if (!state.geo?.features?.length) return `<div class="epi-map-fallback">${icon("globe")}<p>${esc(tr("mapUnavailable"))}</p></div>`;
    const rows = activeRanking()?.ranking || [];
    const byIso = new Map(rows.map((row) => [row.iso3, row]));
    const scale = mapScale(rows);
    const paths = state.geo.features.map((feature) => {
      const iso3 = isoFromFeature(feature);
      const row = byIso.get(iso3);
      const path = geometryPath(feature.geometry);
      if (!path) return "";
      const country = row || (state.base?.countries || []).find((item) => item.iso3 === iso3) || {};
      const name = localName(country) || feature.properties?.name || feature.properties?.NAME || iso3;
      const bin = mapBin(row?.score, scale);
      const interactive = Boolean(row && iso3);
      const label = `${name}. ${row?.score != null ? `${tr("score")}: ${num(row.score, 2)}. ${tr("rank")}: ${int(row.rank)}.` : tr("noData")} ${interactive ? tr("openCountry") : ""}`.trim();
      return `<path class="epi-map-country ${bin ? `epi-map-bin-${bin}` : "epi-map-bin-empty"} ${iso3 === state.country ? "is-selected" : ""}" d="${path}" data-epi-map-country data-iso3="${esc(iso3)}" data-name="${esc(name)}" data-score="${esc(row?.score ?? "")}" data-rank="${esc(row?.rank ?? "")}" ${interactive ? `role="button" tabindex="0" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><title>${esc(label)}</title></path>`;
    }).join("");
    const grid = [-60, -30, 0, 30, 60].map((latitude) => `<line x1="0" y1="${((90 - latitude) / 180) * 500}" x2="1000" y2="${((90 - latitude) / 180) * 500}"/>`).join("") + [-120, -60, 0, 60, 120].map((longitude) => `<line x1="${((longitude + 180) / 360) * 1000}" y1="0" x2="${((longitude + 180) / 360) * 1000}" y2="500"/>`).join("");
    const accessibleRows = rows.filter((row) => row.score !== null && row.score !== undefined).slice().sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999));
    return `<svg class="epi-world-svg" viewBox="0 0 1000 500" role="img" aria-labelledby="epi-map-title epi-map-desc" preserveAspectRatio="xMidYMid meet">
      <title id="epi-map-title">${esc(tr("mapTitle"))}</title><desc id="epi-map-desc">${esc(tr("mapDescription"))}</desc>
      <rect class="epi-map-ocean" width="1000" height="500"/><g class="epi-map-grid">${grid}</g><g>${paths}</g>
    </svg>
    <details class="epi-map-table"><summary><span>${icon("layers")}<b>${esc(tr("mapTable"))}</b><small>${esc(tr("mapTableHint"))}</small></span><em>${int(accessibleRows.length)}</em>${icon("chevron")}</summary><div><table><caption class="epi-sr-only">${esc(tr("mapTitle"))}</caption><thead><tr><th>${esc(tr("place"))}</th><th>${esc(tr("countryColumn"))}</th><th>${esc(tr("scoreColumn"))}</th></tr></thead><tbody>${accessibleRows.map((row) => `<tr><td>${int(row.rank)}</td><td><button type="button" data-epi-action="select-country" data-iso3="${esc(row.iso3)}">${esc(localName(row))}</button></td><td>${num(row.score, 2)}</td></tr>`).join("")}</tbody></table></div></details>
    <div class="epi-map-tooltip" id="epiMapTooltip" hidden></div>`;
  }

  function mapLegendMarkup() {
    return `<div class="epi-map-legend"><span>${esc(tr("low"))}</span>${Array.from({ length: 7 }, (_, index) => `<i class="epi-map-bin-${index + 1}"></i>`).join("")}<span>${esc(tr("high"))}</span><i class="epi-map-bin-empty"></i><span>${esc(tr("noData"))}</span><b><i></i>${esc(tr("currentOutline"))}</b></div>`;
  }

  function leadersMarkup() {
    const rows = (activeRanking()?.ranking || []).filter((row) => row.score !== null && row.score !== undefined).slice().sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999)).slice(0, 5);
    return `<article class="epi-panel"><header><div><span>TOP 5</span><h3>${esc(tr("leaders"))}</h3></div></header><ol class="epi-leader-list">${rows.map((row, index) => `<li><button type="button" data-epi-action="select-country" data-iso3="${esc(row.iso3)}"><span>${String(index + 1).padStart(2, "0")}</span>${flagMarkup(row, "inline")}<b>${esc(localName(row))}</b><strong>${num(row.score, 1)}</strong></button></li>`).join("")}</ol></article>`;
  }

  function regionsMarkup() {
    const country = currentCountry() || {};
    const rows = (state.base?.regions?.regions || []).slice().sort((a, b) => Number(b.official_mean || 0) - Number(a.official_mean || 0));
    return `<article class="epi-panel"><header><div><span>REGIONS</span><h3>${esc(tr("regionalBenchmarks"))}</h3></div></header><div class="epi-region-strip">${rows.map((item) => `<div class="${item.region_en === country.region_en ? "is-current" : ""}"><span>${esc(localRegion(item))}</span><i><b style="width:${clamp(item.official_mean)}%"></b></i><strong>${num(item.official_mean, 1)}</strong><small>${int(item.countries)}</small></div>`).join("")}</div></article>`;
  }

  function mapMarkup() {
    const component = componentByCode(state.component) || activeRanking()?.component || {};
    return `<section id="epi-map">
      ${sectionHeading(tr("mapKicker"), tr("mapTitle"), tr("mapText"))}
      <div class="epi-map-grid-layout">
        <article class="epi-panel epi-map-panel">
          <header class="epi-panel-head"><div><small>${esc(tr("mapPanel"))}</small><h3>${esc(component.code || "EPI")} · ${esc(localName(component))}</h3></div><label class="epi-select-control"><span class="epi-sr-only">${esc(tr("component"))}</span><select data-epi-control="component" aria-label="${esc(tr("component"))}">${componentOptions()}</select>${icon("chevron")}</label></header>
          <div class="epi-map-canvas" id="epiMapCanvas">${state.geo ? mapSvgMarkup() : `<div class="epi-map-fallback">${icon("globe")}<p>${esc(tr("mapLoading"))}</p></div>`}</div>
          ${mapLegendMarkup()}
        </article>
        <aside class="epi-map-aside">${leadersMarkup()}${regionsMarkup()}</aside>
      </div>
    </section>`;
  }

  function radarPoint(value, index, count = 3, radius = 128, center = 180) {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
    const factor = clamp(value) / 100;
    return [center + Math.cos(angle) * radius * factor, center + Math.sin(angle) * radius * factor];
  }
  function radarPolygon(values) { return values.map((value, index) => radarPoint(value, index).map((point) => point.toFixed(2)).join(",")).join(" "); }
  function radarGrid(step) { return radarPolygon([step, step, step]); }

  function radarMarkup() {
    const objectives = OBJECTIVES.map((code) => profileNode(code)).filter(Boolean);
    const countryValues = objectives.map((item) => item.value?.score);
    const regionValues = objectives.map((item) => item.value?.regional_mean);
    const worldValues = objectives.map((item) => item.value?.world_mean);
    const outer = objectives.map((_, index) => radarPoint(100, index));
    return `<div class="epi-radar-wrap"><svg class="epi-radar" viewBox="0 0 360 360" role="img" aria-label="${esc(tr("objectiveRadar"))}">
      <g class="epi-radar-grid">${[25, 50, 75, 100].map((step) => `<polygon points="${radarGrid(step)}"/>`).join("")}${outer.map(([x, y]) => `<line x1="180" y1="180" x2="${x}" y2="${y}"/>`).join("")}${outer.map(([x, y], index) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" transform="translate(${x < 180 ? -15 : x > 180 ? 15 : 0},${y < 180 ? -14 : 16})">${esc(objectives[index]?.code || "")}</text>`).join("")}</g>
      <polygon class="epi-radar-world" points="${radarPolygon(worldValues)}"/><polygon class="epi-radar-region" points="${radarPolygon(regionValues)}"/><polygon class="epi-radar-country" points="${radarPolygon(countryValues)}"/>
      ${countryValues.map((value, index) => { const [x, y] = radarPoint(value, index); return `<circle cx="${x}" cy="${y}" r="4"><title>${esc(localName(objectives[index]))}: ${num(value, 2)}</title></circle>`; }).join("")}
    </svg></div><div class="epi-radar-legend"><span class="is-country">${esc(tr("countryShort"))}</span><span class="is-region">${esc(tr("region"))}</span><span class="is-world">${esc(tr("world"))}</span></div>`;
  }

  function objectiveIcon(code) { return code === "ECO" ? icon("leaf") : code === "HLT" ? icon("heart") : icon("climate"); }

  function objectiveTableMarkup() {
    const objectives = OBJECTIVES.map((code) => profileNode(code)).filter(Boolean);
    return `<div class="epi-objective-table"><div class="epi-objective-table-head"><span>${esc(tr("objectives"))}</span><span>${esc(tr("scoreColumn"))}</span><span>${esc(tr("region"))}</span><span>${esc(tr("world"))}</span></div>${objectives.map((item) => `<button type="button" data-epi-action="objective" data-objective="${esc(item.code)}"><span><i>${objectiveIcon(item.code)}</i><b>${esc(localName(item))}</b></span><strong>${num(item.value?.score, 1)}</strong><em>${num(item.value?.regional_mean, 1)}</em><em>${num(item.value?.world_mean, 1)}</em></button>`).join("")}</div>`;
  }

  function objectiveCardsMarkup() {
    const objectives = OBJECTIVES.map((code) => profileNode(code)).filter(Boolean);
    return `<div class="epi-objective-cards">${objectives.map((item, index) => `<button type="button" class="epi-objective-card ${item.code === state.activeObjective ? "is-active" : ""}" data-epi-action="objective" data-objective="${esc(item.code)}">
      <span class="epi-objective-number">0${index + 1}</span><span class="epi-objective-icon">${objectiveIcon(item.code)}</span><div><small>${esc(item.code)} · ${num(Number(item.weight_in_epi || 0) * 100, 0)}% ${esc(tr("weight"))}</small><h3>${esc(localName(item))}</h3><p>#${int(item.value?.rank)} · ${signed(item.value?.change_10y, 1)} · ${int((item.children || []).length)} ${esc(tr("categories"))}</p></div><strong>${num(item.value?.score, 1)}</strong><em>${num(item.value?.percentile, 0)}%</em><span class="epi-objective-bar"><b style="width:${clamp(item.value?.score)}%"></b><i style="left:${clamp(item.value?.regional_mean)}%"></i><i style="left:${clamp(item.value?.world_mean)}%"></i></span>
    </button>`).join("")}</div>`;
  }

  function indicatorRowMarkup(item) {
    const value = item.value || {};
    return `<li><div><span>${esc(item.code)}</span><strong>${esc(localName(item))}</strong><small>${esc(item.description_en || item.units || "")}</small></div><div class="epi-indicator-values"><b>${value.missing ? "—" : num(value.score, 1)}</b><span>${value.rank == null ? "—" : `#${int(value.rank)}`}</span><em class="${deltaClass(value.change_10y)}">${signed(value.change_10y, 1)}</em></div><button type="button" data-epi-action="select-component" data-component="${esc(item.code)}" aria-label="${esc(tr("compare"))}: ${esc(localName(item))}">${icon("arrow")}</button></li>`;
  }

  function categoryExplorerMarkup() {
    const objective = profileNode(state.activeObjective) || profileNode("ECO");
    const categories = (objective?.children || []).filter((item) => item.type === "IssueCategory");
    return `<div class="epi-category-explorer"><header><div><span>${esc(tr("activeObjective"))} · ${esc(objective?.code || "")}</span><h2>${esc(localName(objective))}</h2></div><p>${esc(tr("categoryIntro"))}</p></header><div class="epi-category-list">${categories.map((item, index) => {
      const value = item.value || {};
      return `<details class="epi-category-card" ${index === 0 ? "open" : ""}><summary><span class="epi-category-code">${esc(item.code)}</span><div><small>${num(Number(item.weight_in_epi || 0) * 100, 2)}% EPI · ${int((item.children || []).length)} ${esc(tr("indicators"))}</small><h3>${esc(localName(item))}</h3><span class="epi-category-track"><i style="width:${clamp(value.score)}%"></i><b style="left:${clamp(value.world_mean)}%"></b></span></div><div class="epi-category-score"><strong>${value.missing ? "—" : num(value.score, 1)}</strong><span>${value.rank == null ? tr("missing") : `#${int(value.rank)}`}</span><em class="${deltaClass(value.change_10y)}">${signed(value.change_10y, 1)}</em></div>${icon("chevron")}</summary><div class="epi-category-detail"><header><span>${esc(tr("indicator"))}</span><span>${esc(tr("scoreColumn"))}</span><span>${esc(tr("rank"))}</span><span>${esc(tr("change"))}</span><span></span></header><ul>${(item.children || []).map(indicatorRowMarkup).join("")}</ul><button class="epi-text-button" type="button" data-epi-action="select-component" data-component="${esc(item.code)}">${esc(tr("compare"))}${icon("arrow")}</button></div></details>`;
    }).join("")}</div></div>`;
  }

  function structureMarkup() {
    return `<section id="epi-structure">
      ${sectionHeading(tr("structureKicker"), tr("structureTitle"), tr("structureText"))}
      <div class="epi-policy-layout">
        <article class="epi-panel epi-radar-panel"><header><div><small>${esc(tr("objectiveRadar"))}</small><h3>${esc(localName(currentCountry()))}</h3></div><span class="epi-method-chip">${esc(tr("method2026"))}</span></header>${radarMarkup()}${objectiveTableMarkup()}</article>
        ${objectiveCardsMarkup()}
      </div>
      ${categoryExplorerMarkup()}
    </section>`;
  }

  function filteredRanking() {
    let rows = (activeRanking()?.ranking || []).slice();
    if (!state.includeMissing) rows = rows.filter((row) => !row.missing && row.score !== null && row.score !== undefined);
    if (state.region) rows = rows.filter((row) => row.region_en === state.region);
    const needle = state.query.trim().toLocaleLowerCase(state.lang === "ru" ? "ru" : "en");
    if (needle) rows = rows.filter((row) => `${row.iso3 || ""} ${row.name_ru || ""} ${row.name_en || ""}`.toLocaleLowerCase().includes(needle));
    const field = SORT_FIELDS.has(state.sort) ? state.sort : "rank";
    const direction = state.order === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      if (field === "country") return localName(a).localeCompare(localName(b), state.lang === "ru" ? "ru" : "en") * direction;
      const av = a[field];
      const bv = b[field];
      const aMissing = av === null || av === undefined || Number.isNaN(Number(av));
      const bMissing = bv === null || bv === undefined || Number.isNaN(Number(bv));
      if (aMissing && bMissing) return localName(a).localeCompare(localName(b));
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (Number(av) === Number(bv)) return localName(a).localeCompare(localName(b));
      return (Number(av) - Number(bv)) * direction;
    });
    return rows;
  }

  function sortButton(field, label) {
    const active = state.sort === field;
    const ariaSort = active ? (state.order === "asc" ? tr("sortAscending") : tr("sortDescending")) : "";
    return `<button type="button" data-epi-action="sort" data-sort="${field}" aria-label="${esc(label)}${ariaSort ? `, ${esc(ariaSort)}` : ""}"><span>${esc(label)}</span><svg class="epi-sort-icon ${active ? "is-active" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 9 4-4 4 4M16 15l-4 4-4-4"/></svg></button>`;
  }

  function scoreBenchmark(row) {
    if (row.score == null || row.world_mean == null) return `<span>${esc(tr("missing"))}</span>`;
    const score = clamp(row.score);
    const world = clamp(row.world_mean);
    const left = Math.min(score, world);
    const width = Math.abs(score - world);
    return `<div class="epi-rank-benchmark" aria-label="${esc(tr("benchmark"))}: ${signed(Number(row.score) - Number(row.world_mean), 2)}"><i></i><b style="left:${world}%"></b><span class="${score >= world ? "is-above" : "is-below"}" style="left:${left}%;width:${width}%"></span><em style="left:${score}%"></em></div><small>${signed(Number(row.score) - Number(row.world_mean), 2)}</small>`;
  }

  function rankingTableRows(rows) {
    return rows.map((row) => `<tr class="${row.iso3 === state.country ? "is-selected" : ""}">
      <td><span class="epi-rank-number ${Number(row.rank) <= 3 ? "is-medal" : ""}">${row.rank == null ? "—" : `#${int(row.rank)}`}</span><small>${num(row.percentile, 1)}%</small></td>
      <td><button type="button" class="epi-ranking-country" data-epi-action="select-country" data-iso3="${esc(row.iso3)}">${flagMarkup(row, "inline")}<span><strong>${esc(localName(row))}</strong><small>${esc(row.iso3)} · ${esc(localRegion(row))}</small></span></button></td>
      <td><span class="epi-table-score">${row.score == null ? "—" : num(row.score, 2)}</span><small>${row.missing ? esc(tr("missing")) : "0–100"}</small></td>
      <td>${scoreBenchmark(row)}</td>
      <td><span class="epi-table-delta ${deltaClass(row.change_10y)}">${signed(row.change_10y, 2)}</span><small>${row.baseline_year && row.most_recent_data_year ? `${esc(row.baseline_year)}–${esc(row.most_recent_data_year)}` : "EPI 2026"}</small></td>
      <td><span>${row.regional_rank == null ? "—" : `#${int(row.regional_rank)}`}</span><small>${num(row.regional_mean, 2)}</small></td>
      <td><button type="button" class="epi-row-open" data-epi-action="select-country" data-iso3="${esc(row.iso3)}">${esc(tr("openCountry"))}${icon("arrow")}</button></td>
    </tr>`).join("");
  }

  function mobileRankingRows(rows) {
    return `<div class="epi-mobile-ranking">${rows.map((row) => `<article class="${row.iso3 === state.country ? "is-selected" : ""}"><header><button type="button" class="epi-ranking-country" data-epi-action="select-country" data-iso3="${esc(row.iso3)}">${flagMarkup(row, "medium")}<span><strong>${esc(localName(row))}</strong><small>${esc(row.iso3)} · ${esc(localRegion(row))}</small></span></button><span class="epi-rank-number ${Number(row.rank) <= 3 ? "is-medal" : ""}">${row.rank == null ? "—" : `#${int(row.rank)}`}</span></header><dl><div><dt>${esc(tr("scoreColumn"))}</dt><dd>${row.score == null ? "—" : num(row.score, 2)}</dd></div><div><dt>${esc(tr("changeColumn"))}</dt><dd class="${deltaClass(row.change_10y)}">${signed(row.change_10y, 2)}</dd></div><div><dt>${esc(tr("regionalPlace"))}</dt><dd>${row.regional_rank == null ? "—" : `#${int(row.regional_rank)}`}</dd></div><div><dt>${esc(tr("benchmark"))}</dt><dd>${row.score == null || row.world_mean == null ? "—" : signed(Number(row.score) - Number(row.world_mean), 2)}</dd></div></dl></article>`).join("")}</div>`;
  }

  function rankingResultsMarkup() {
    const rows = filteredRanking();
    const pageCount = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.max(0, Math.min(state.page, pageCount - 1));
    const start = state.page * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);
    if (!pageRows.length) return `<div class="epi-table-empty">${esc(tr("noRanking"))}</div>${paginationMarkup(rows.length, pageCount, start)}`;
    return `<div class="epi-table-wrap" tabindex="0"><table class="epi-ranking-table"><caption>${esc(tr("rankingTitle"))}</caption><thead><tr><th>${sortButton("rank", tr("place"))}</th><th>${sortButton("country", tr("countryColumn"))}</th><th>${sortButton("score", tr("scoreColumn"))}</th><th>${esc(tr("benchmark"))}</th><th>${sortButton("change_10y", tr("changeColumn"))}</th><th>${sortButton("regional_rank", tr("regionalPlace"))}</th><th>${esc(tr("action"))}</th></tr></thead><tbody>${rankingTableRows(pageRows)}</tbody></table></div>${mobileRankingRows(pageRows)}${paginationMarkup(rows.length, pageCount, start)}`;
  }

  function paginationMarkup(total, pageCount, start) {
    return `<div class="epi-pagination"><label>${esc(tr("rowsPerPage"))}<select data-epi-control="page-size"><option value="10" ${state.pageSize === 10 ? "selected" : ""}>10</option><option value="25" ${state.pageSize === 25 ? "selected" : ""}>25</option><option value="50" ${state.pageSize === 50 ? "selected" : ""}>50</option></select></label><span>${total ? `${int(start + 1)}–${int(Math.min(start + state.pageSize, total))} · ` : ""}${int(total)} ${esc(tr("records"))} · ${esc(tr("page"))} ${int(state.page + 1)} ${esc(tr("of"))} ${int(pageCount)}</span><div><button type="button" data-epi-action="page-prev" ${state.page <= 0 ? "disabled" : ""}>${icon("left")}<span>${esc(tr("previous"))}</span></button><button type="button" data-epi-action="page-next" ${state.page >= pageCount - 1 ? "disabled" : ""}><span>${esc(tr("next"))}</span>${icon("right")}</button></div></div>`;
  }

  function rankingSummaryMarkup() {
    const payload = activeRanking() || {};
    const component = payload.component || componentByCode(state.component) || {};
    const row = activeRow();
    const availability = component.availability || {};
    return `<div class="epi-ranking-summary"><div><span>${esc(tr("rankedCoverage"))}</span><small>${esc(component.code || state.component)} · ${esc(localName(component))}</small><strong>${int(availability.ranked_or_scored_countries ?? (payload.ranking || []).filter((item) => item.score != null).length)}</strong></div><div><span>${esc(tr("selectedPosition"))}</span><small>${esc(localName(currentCountry()))}</small><strong>${row?.rank == null ? "—" : `#${int(row.rank)}`}</strong></div><div><span>${esc(tr("worldMean"))}</span><small>${esc(tr("officialSource"))}</small><strong>${num(row?.world_mean ?? (payload.ranking || []).find((item) => item.world_mean != null)?.world_mean, 2)}</strong></div><a href="#" data-epi-action="export">${icon("download")}${esc(tr("exportCsv"))}</a></div>`;
  }

  function rankingMarkup() {
    return `<section id="epi-ranking">
      ${sectionHeading(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"))}
      <article class="epi-panel epi-ranking-panel ${state.componentBusy ? "is-loading" : ""}"><div class="epi-ranking-progress" aria-hidden="true"></div>
        <div class="epi-ranking-controls">
          <label class="epi-field"><span>${esc(tr("component"))}</span><div><select data-epi-control="component">${componentOptions()}</select>${icon("chevron")}</div></label>
          <label class="epi-field"><span>${esc(tr("region"))}</span><div><select data-epi-control="region">${regionOptions()}</select>${icon("chevron")}</div></label>
          <label class="epi-field epi-field--search"><span>${esc(tr("searchCountries"))}</span><div>${icon("search")}<input id="epiRankingSearch" value="${esc(state.query)}" placeholder="${esc(tr("countrySearch"))}" autocomplete="off"></div></label>
          <label class="epi-check"><input type="checkbox" data-epi-control="missing" ${state.includeMissing ? "checked" : ""}><span>${icon("check")}</span><b>${esc(tr("includeMissing"))}</b></label>
        </div>
        ${rankingSummaryMarkup()}
        <div id="epiRankingResults" aria-live="polite" aria-busy="${state.componentBusy}">${rankingResultsMarkup()}</div>
        <p class="epi-ranking-footnote">${icon("info")}${esc(tr("rankingFootnote"))}</p>
      </article>
    </section>`;
  }

  function sourceLinksMarkup() {
    const urls = state.base?.overview?.source?.source_urls || state.base?.provenance?.manifest?.source_urls || {};
    return `<div class="epi-source-links"><span>${esc(tr("officialLinks"))}</span><a href="${safeUrl(urls.results_page)}" target="_blank" rel="noopener noreferrer">${icon("external")}${esc(tr("results"))}</a><a href="${safeUrl(urls.methodology)}" target="_blank" rel="noopener noreferrer">${icon("external")}${esc(tr("methodologyLink"))}</a><a href="${safeUrl(urls.downloads)}" target="_blank" rel="noopener noreferrer">${icon("external")}${esc(tr("downloads"))}</a></div>`;
  }

  function methodologyMarkup() {
    const objectives = OBJECTIVES.map((code) => componentByCode(code)).filter(Boolean);
    return `<section id="epi-methodology">
      ${sectionHeading(tr("methodKicker"), tr("methodTitle"), tr("methodText"))}
      <div class="epi-method-grid">
        <article class="epi-method-card is-framework"><span>63</span><h3>${esc(tr("frameworkTitle"))}</h3><p>${esc(tr("frameworkText"))}</p><div>${objectives.map((item) => `<b>${esc(item.code)} · ${num(Number(item.weight_in_epi || 0) * 100, 0)}%</b>`).join("")}<b>12 ${esc(tr("categories"))}</b><b>47 ${esc(tr("indicators"))}</b></div></article>
        <article class="epi-method-card is-compare"><span>≠</span><h3>${esc(tr("comparabilityTitle"))}</h3><p>${esc(tr("comparabilityText"))}</p></article>
        <article class="epi-method-card is-integrity">${icon("shield")}<h3>${esc(tr("integrityTitle"))}</h3><p>${esc(tr("integrityText"))}</p><button class="epi-text-button" type="button" data-epi-action="open-evidence">${esc(tr("openEvidence"))}${icon("arrow")}</button></article>
        <article class="epi-method-card">${icon("warning")}<h3>${esc(tr("licenseTitle"))}</h3><p>${esc(tr("licenseText"))}</p></article>
      </div>
      ${sourceLinksMarkup()}
    </section>`;
  }

  function evidenceFileMarkup(file, raw = false) {
    const name = file.path || "—";
    const url = raw ? file.url : null;
    return `<li><div><strong>${esc(name)}</strong><small>${int(file.bytes)} bytes</small></div><code>${esc(file.sha256 || "—")}</code>${url ? `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}">${icon("external")}</a>` : `<span></span>`}</li>`;
  }

  function evidenceDrawerMarkup() {
    const provenance = state.base?.provenance || {};
    const manifest = provenance.manifest || {};
    const integrity = provenance.integrity || {};
    const transform = manifest.transformation || {};
    const license = manifest.license || {};
    const owners = Array.isArray(manifest.source_owner) ? manifest.source_owner.join(" · ") : manifest.source_owner;
    return `<div class="epi-drawer-backdrop ${state.drawerOpen ? "is-open" : ""}" data-epi-action="close-evidence" ${state.drawerOpen ? "" : "hidden"}></div><aside class="epi-evidence-drawer ${state.drawerOpen ? "is-open" : ""}" role="dialog" aria-modal="true" aria-labelledby="epiEvidenceTitle" ${state.drawerOpen ? "" : "hidden"}>
      <header><div><span>${esc(tr("evidenceKicker"))}</span><h2 id="epiEvidenceTitle">${esc(tr("evidenceTitle"))}</h2><p>${esc(tr("evidenceLead"))}</p></div><button type="button" data-epi-action="close-evidence" aria-label="${esc(tr("close"))}">${icon("close")}</button></header>
      <div class="epi-evidence-body">
        <div class="epi-evidence-summary"><dl><div><dt>${esc(tr("dataset"))}</dt><dd>${esc(manifest.dataset_id || "YALE_EPI_2026")}</dd></div><div><dt>${esc(tr("editionLabel"))}</dt><dd>${esc(manifest.edition || 2026)}</dd></div><div><dt>${esc(tr("retrieved"))}</dt><dd>${esc(manifest.retrieved_at || "—")}</dd></div><div><dt>${esc(tr("owner"))}</dt><dd>${esc(owners || "—")}</dd></div></dl><ul><li>${icon("check")}<span>${esc(tr("checksums"))}: ${integrity.checksums_verified ? "OK" : "—"}</span></li><li>${icon("check")}<span>${esc(tr("contract"))}: ${integrity.contract_validated ? "OK" : "—"}</span></li><li>${icon("check")}<span>${esc(tr("ranksPreserved"))}: ${integrity.official_ranks_preserved ? "OK" : "—"}</span></li><li>${icon("check")}<span>${esc(tr("noSeries"))}: ${integrity.cross_edition_series_created === false ? "OK" : "—"}</span></li></ul></div>
        <section class="epi-fingerprint"><span>${esc(tr("fingerprint"))}</span><div><code>${esc(provenance.dataset_sha256 || "—")}</code><button type="button" data-epi-action="copy-hash">${icon("copy")}${esc(tr("copy"))}</button></div></section>
        <section><header><span>01</span><h3>${esc(tr("rawFiles"))}</h3></header><ul class="epi-evidence-files">${(manifest.raw_files || []).map((file) => evidenceFileMarkup(file, true)).join("")}</ul></section>
        <section><header><span>02</span><h3>${esc(tr("derivedFiles"))}</h3></header><ul class="epi-evidence-files">${(manifest.derived_files || []).map((file) => evidenceFileMarkup(file, false)).join("")}</ul></section>
        <section class="epi-transform"><header><span>03</span><h3>${esc(tr("transformation"))}</h3></header><code>${esc(transform.id || "—")}</code><p>${esc(transform.script || "")}</p><ol>${(transform.notes || []).map((note) => `<li>${esc(note)}</li>`).join("")}</ol></section>
        <section class="epi-license"><header><span>04</span><h3>${esc(tr("license"))}</h3></header><div><strong>${esc(license.identifier || "CC-BY-NC-SA-4.0")}</strong><p>${esc(state.lang === "ru" ? (license.deployment_warning_ru || tr("licenseText")) : tr("licenseText"))}</p><a href="${safeUrl(license.url)}" target="_blank" rel="noopener noreferrer">${icon("external")}${esc(license.url || "Creative Commons")}</a></div></section>
      </div>
    </aside>`;
  }

  function workspaceMarkup() {
    return `<div class="epi-workspace index-workspace gir-native-workspace" data-epi-workspace data-gir-design="native-06r" data-epi-provider="${esc(state.providerMode)}">
      <a class="epi-skip" href="#epi-overview">${esc(tr("skip"))}</a>
      <span id="epiLiveRegion" class="epi-sr-only" aria-live="polite"></span>
      ${heroMarkup()}${jumpMarkup()}${overviewMarkup()}${mapMarkup()}${structureMarkup()}${rankingMarkup()}${methodologyMarkup()}${evidenceDrawerMarkup()}
    </div>`;
  }

  function renderWorkspace({ preserveScroll = false } = {}) {
    if (!state.root || !state.base || !state.profile) return;
    const scrollY = preserveScroll ? window.scrollY : null;
    state.root.innerHTML = workspaceMarkup();
    document.documentElement.classList.toggle("epi-drawer-open", state.drawerOpen);
    syncFlags();
    startScrollSpy();
    if (preserveScroll && scrollY !== null) requestAnimationFrame(() => window.scrollTo(0, scrollY));
    if (state.geo) bindMapPointer();
    if (state.pickerOpen) requestAnimationFrame(() => state.root?.querySelector("#epiCountrySearch")?.focus());
    if (state.drawerOpen) requestAnimationFrame(() => state.root?.querySelector(".epi-evidence-drawer [data-epi-action='close-evidence']")?.focus());
  }

  function syncFlags() {
    state.root?.querySelectorAll("[data-epi-flag]").forEach((image) => {
      const fail = () => image.closest(".epi-flag-wrap")?.classList.add("is-fallback");
      image.addEventListener("error", fail, { once: true });
      if (image.complete && !image.naturalWidth) fail();
    });
  }

  function startScrollSpy() {
    state.scrollObserver?.disconnect();
    const links = Array.from(state.root?.querySelectorAll("[data-epi-jump]") || []);
    if (!links.length || !("IntersectionObserver" in window)) return;
    state.scrollObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        const active = link.dataset.epiJump === visible.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-18% 0px -65%", threshold: [0.05, 0.25, 0.6] });
    ["epi-overview", "epi-map", "epi-structure", "epi-ranking", "epi-methodology"].forEach((id) => {
      const element = state.root.querySelector(`#${id}`);
      if (element) state.scrollObserver.observe(element);
    });
  }

  function mapTooltip(event) {
    const path = event.target instanceof Element ? event.target.closest("[data-epi-map-country]") : null;
    const tooltip = state.root?.querySelector("#epiMapTooltip");
    if (!tooltip) return;
    if (!path || !path.dataset.iso3) { tooltip.hidden = true; return; }
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${esc(path.dataset.name || path.dataset.iso3)}</strong><span>${esc(tr("score"))}: ${esc(path.dataset.score || "—")}</span><small>${esc(tr("rank"))}: ${path.dataset.rank ? `#${esc(path.dataset.rank)}` : "—"}</small>`;
    const frame = tooltip.closest(".epi-map-canvas");
    const rect = frame?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(8, Math.min(rect.width - 190, event.clientX - rect.left + 12));
    const y = Math.max(8, Math.min(rect.height - 90, event.clientY - rect.top + 12));
    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }

  function bindMapPointer() {
    const canvas = state.root?.querySelector("#epiMapCanvas");
    if (!canvas || canvas.dataset.bound === "1") return;
    canvas.dataset.bound = "1";
    canvas.addEventListener("pointermove", mapTooltip);
    canvas.addEventListener("pointerleave", () => { const tooltip = canvas.querySelector("#epiMapTooltip"); if (tooltip) tooltip.hidden = true; });
  }

  function announce(message, error = false) {
    const live = state.root?.querySelector("#epiLiveRegion");
    if (live) live.textContent = String(message || "");
    const notice = state.context?.onNotice || state.context?.showToast;
    if (typeof notice === "function") {
      notice(String(message || ""), error ? "error" : "success");
      return;
    }
    let toast = document.querySelector(".epi-toast[data-epi-owned]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "epi-toast";
      toast.dataset.epiOwned = "1";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.classList.toggle("is-error", error);
    toast.textContent = String(message || "");
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  async function copyText(text, successMessage) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(String(text));
      else {
        const area = document.createElement("textarea");
        area.value = String(text);
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      announce(successMessage);
    } catch (error) { announce(error.message || String(error), true); }
  }

  async function selectCountry(iso3, { scrollTop = false } = {}) {
    const code = String(iso3 || "").toUpperCase();
    if (!code || code === state.country) {
      state.pickerOpen = false;
      renderWorkspace({ preserveScroll: true });
      return;
    }
    const token = ++state.loadToken;
    const oldCountry = state.country;
    state.country = code;
    state.pickerOpen = false;
    state.pickerQuery = "";
    try {
      const profile = await ensureProfile(code);
      if (token !== state.loadToken) return;
      state.profile = profile;
      writeUrl();
      state.context?.onCountryChange?.(code);
      renderWorkspace({ preserveScroll: !scrollTop });
      if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      state.country = oldCountry;
      announce(error.message || String(error), true);
    }
  }

  async function selectComponent(code, { scrollRanking = false } = {}) {
    const componentCode = String(code || "").toUpperCase();
    if (!componentByCode(componentCode) || state.componentBusy) return;
    state.component = componentCode;
    state.page = 0;
    state.componentBusy = true;
    writeUrl();
    const panel = state.root?.querySelector(".epi-ranking-panel");
    panel?.classList.add("is-loading");
    try {
      await ensureRanking(componentCode);
      renderWorkspace({ preserveScroll: true });
      if (scrollRanking) requestAnimationFrame(() => state.root?.querySelector("#epi-ranking")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) { announce(error.message || String(error), true); }
    finally { state.componentBusy = false; state.root?.querySelector(".epi-ranking-panel")?.classList.remove("is-loading"); }
  }

  function updateRankingResults() {
    const host = state.root?.querySelector("#epiRankingResults");
    if (!host) return;
    host.innerHTML = rankingResultsMarkup();
    syncFlags();
    const summary = state.root.querySelector(".epi-ranking-summary");
    if (summary) summary.outerHTML = rankingSummaryMarkup();
  }

  function openEvidence(trigger) {
    state.lastFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    state.drawerOpen = true;
    renderWorkspace({ preserveScroll: true });
  }

  function closeEvidence() {
    state.drawerOpen = false;
    renderWorkspace({ preserveScroll: true });
    requestAnimationFrame(() => state.lastFocus?.focus?.());
  }

  function exportCsv() {
    const rows = filteredRanking();
    const component = componentByCode(state.component) || {};
    const fields = ["official_rank", "iso3", "country_en", "country_ru", "region_en", "region_ru", "score", "change_10y", "regional_rank", "regional_mean", "world_mean", "percentile_gir_derived", "component_code", "component_name_en", "edition"];
    const csv = (value) => {
      if (value === null || value === undefined) return "";
      const text = String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const body = [fields.join(","), ...rows.map((row) => [row.rank, row.iso3, row.name_en, row.name_ru, row.region_en, row.region_ru, row.score, row.change_10y, row.regional_rank, row.regional_mean, row.world_mean, row.percentile, component.code, component.name_en, 2026].map(csv).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF", body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `epi-2026-${String(state.component).toLowerCase()}-ranking.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(tr("csvReady"));
  }

  function handleRootClick(event) {
    const control = event.target instanceof Element ? event.target.closest("[data-epi-action]") : null;
    if (!control) return;
    const action = control.dataset.epiAction;
    if (["export"].includes(action)) event.preventDefault();
    if (action === "retry") {
      invalidate();
      renderLoading();
      loadWorkspace(state.country);
    } else if (action === "toggle-country") {
      state.pickerOpen = !state.pickerOpen;
      renderWorkspace({ preserveScroll: true });
    } else if (action === "select-country") {
      selectCountry(control.dataset.iso3);
    } else if (action === "copy-link") {
      writeUrl();
      copyText(window.location.href, tr("copied"));
    } else if (action === "objective") {
      state.activeObjective = control.dataset.objective || "ECO";
      renderWorkspace({ preserveScroll: true });
      requestAnimationFrame(() => state.root?.querySelector(".epi-category-explorer")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } else if (action === "select-component") {
      selectComponent(control.dataset.component, { scrollRanking: true });
    } else if (action === "sort") {
      const field = control.dataset.sort;
      if (!SORT_FIELDS.has(field)) return;
      if (state.sort === field) state.order = state.order === "asc" ? "desc" : "asc";
      else { state.sort = field; state.order = field === "score" || field === "change_10y" ? "desc" : "asc"; }
      state.page = 0;
      updateRankingResults();
    } else if (action === "page-prev") {
      state.page = Math.max(0, state.page - 1);
      updateRankingResults();
    } else if (action === "page-next") {
      state.page += 1;
      updateRankingResults();
    } else if (action === "export") {
      exportCsv();
    } else if (action === "open-evidence") {
      openEvidence(control);
    } else if (action === "close-evidence") {
      closeEvidence();
    } else if (action === "copy-hash") {
      copyText(state.base?.provenance?.dataset_sha256 || "", tr("integrityCopied"));
    }
  }

  function handleRootChange(event) {
    const control = event.target;
    if (control instanceof HTMLSelectElement) {
      const type = control.dataset.epiControl;
      if (type === "component") selectComponent(control.value);
      else if (type === "region") { state.region = control.value; state.page = 0; writeUrl(); updateRankingResults(); }
      else if (type === "page-size") { state.pageSize = Number(control.value) || 25; state.page = 0; updateRankingResults(); }
    } else if (control instanceof HTMLInputElement && control.dataset.epiControl === "missing") {
      state.includeMissing = control.checked;
      state.page = 0;
      updateRankingResults();
    }
  }

  function handleRootInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.id === "epiRankingSearch") {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.query = input.value; state.page = 0; updateRankingResults(); }, 100);
    } else if (input.id === "epiCountrySearch") {
      clearTimeout(pickerTimer);
      pickerTimer = setTimeout(() => {
        state.pickerQuery = input.value;
        const host = state.root?.querySelector(".epi-country-options");
        if (host) host.innerHTML = countryOptionsMarkup();
        syncFlags();
      }, 70);
    }
  }

  function handleRootKeydown(event) {
    const jump = event.target instanceof Element ? event.target.closest("[data-epi-jump]") : null;
    if (jump && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      const links = Array.from(state.root?.querySelectorAll("[data-epi-jump]") || []);
      const current = links.indexOf(jump);
      if (current >= 0 && links.length) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : event.key === "ArrowRight" ? (current + 1) % links.length : (current - 1 + links.length) % links.length;
        links[next]?.focus();
      }
      return;
    }

    const countryOption = event.target instanceof Element ? event.target.closest(".epi-country-option") : null;
    if (countryOption && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      const options = Array.from(state.root?.querySelectorAll(".epi-country-option") || []);
      const current = options.indexOf(countryOption);
      if (current >= 0 && options.length) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length;
        options[next]?.focus();
      }
      return;
    }

    if (state.drawerOpen && event.key === "Tab") {
      const drawer = state.root?.querySelector(".epi-evidence-drawer:not([hidden])");
      const focusable = drawer ? Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((item) => !item.hasAttribute("hidden")) : [];
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }

    const mapCountry = event.target instanceof Element ? event.target.closest("[data-epi-map-country]") : null;
    if (mapCountry && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectCountry(mapCountry.dataset.iso3);
      return;
    }
    if (event.key === "Escape") {
      if (state.drawerOpen) closeEvidence();
      else if (state.pickerOpen) { state.pickerOpen = false; state.pickerQuery = ""; renderWorkspace({ preserveScroll: true }); }
    }
  }

  function bindRootEvents(root) {
    if (state.boundRoot === root) return;
    if (state.boundRoot) {
      state.boundRoot.removeEventListener("click", handleRootClick);
      state.boundRoot.removeEventListener("change", handleRootChange);
      state.boundRoot.removeEventListener("input", handleRootInput);
      state.boundRoot.removeEventListener("keydown", handleRootKeydown);
    }
    state.boundRoot = root;
    root.addEventListener("click", handleRootClick);
    root.addEventListener("change", handleRootChange);
    root.addEventListener("input", handleRootInput);
    root.addEventListener("keydown", handleRootKeydown);
    if (!state.documentPointerBound) {
      state.documentPointerBound = true;
      document.addEventListener("pointerdown", (event) => {
        if (!state.pickerOpen || !state.root) return;
        if (event.target instanceof Node && state.root.querySelector(".epi-country-control")?.contains(event.target)) return;
        state.pickerOpen = false;
        state.pickerQuery = "";
        renderWorkspace({ preserveScroll: true });
      });
    }
  }

  async function loadWorkspace(requestedCountry) {
    const token = ++state.loadToken;
    try {
      await ensureBase();
      readUrl();
      const available = new Set((state.base?.countries || []).map((item) => item.iso3));
      const code = String(requestedCountry || "").toUpperCase();
      if (!available.has(code)) throw new Error(`Unknown selected country: ${code}`);
      if (!componentByCode(state.component)) state.component = DEFAULT_COMPONENT;
      const [profile] = await Promise.all([ensureProfile(code), ensureRanking(state.component)]);
      if (token !== state.loadToken) return;
      state.country = code;
      state.profile = profile;
      writeUrl();
      renderWorkspace();
      ensureGeo().then((geo) => {
        if (!geo || token !== state.loadToken) return;
        const canvas = state.root?.querySelector("#epiMapCanvas");
        if (canvas) {
          canvas.innerHTML = mapSvgMarkup();
          bindMapPointer();
        }
      });
    } catch (error) {
      if (token === state.loadToken) renderError(error);
    }
  }

  function render(context) {
    if (!context?.root) throw new Error("GIREPI.render requires a root element");
    state.context = context;
    state.root = context.root;
    state.lang = context.lang === "en" ? "en" : "ru";
    state.theme = context.theme || document.documentElement.dataset.theme || "dark";
    bindRootEvents(state.root);
    const requestedCountry = String(new URLSearchParams(window.location.search).get("country") || context.country || "").toUpperCase();
    if (!requestedCountry) return;
    if (!state.base || !state.profile) {
      renderLoading();
      loadWorkspace(requestedCountry);
      return;
    }
    if (requestedCountry !== state.country) {
      selectCountry(requestedCountry);
      return;
    }
    renderWorkspace();
  }

  function invalidate(scope = "all") {
    if (scope === "country") cache.profiles.clear();
    else if (scope === "ranking") cache.rankings.clear();
    else {
      cache.basePromise = null;
      cache.staticPromise = null;
      cache.profiles.clear();
      cache.rankings.clear();
      cache.geoPromise = null;
      state.base = null;
      state.profile = null;
      state.provider = null;
      state.geo = null;
    }
  }

  const publicApi = { render, invalidate };
  window.GIREPI = publicApi;
  window.GIREpiWorkspace = publicApi;
})();
