(() => {
  "use strict";

  const API = "/api/environment/eti-transition";
  const STATIC_CORE = "/static/eti-transition/eti-core.json";
  const STATIC_MANIFEST = "/static/eti-transition/manifest.json";
  const GEO_SOURCES = ["/static/epi-world.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
  const METRICS = ["ETI", "SP", "TR"];
  const GROUP_ORDER = [
    "ADVANCED_ECONOMIES",
    "EMERGING_ASIA",
    "EMERGING_EUROPE",
    "LATIN_AMERICA_CARIBBEAN",
    "MENA_PAKISTAN",
    "SUB_SAHARAN_AFRICA",
  ];

  const COPY = {
    ru: {
      loadingTitle: "Настраиваем энергетическую систему мира",
      loadingText: "Проверяем официальный рейтинг, 120 стран и методическое дерево ETI 2026.",
      errorTitle: "Рабочее пространство ETI временно недоступно",
      retry: "Повторить",
      kicker: "Экология и устойчивость · энергетические системы",
      title: "Energy Transition Index 2026",
      lead: "Сравнение того, насколько эффективно энергетические системы работают сегодня и насколько страны готовы поддерживать переход завтра.",
      sourceBadge: "World Economic Forum × Accenture",
      editionBadge: "Выпуск 18 июня 2026",
      coverageBadge: "120 стран · 44 показателя",
      verifiedBadge: "целостность данных проверена",
      apiMode: "FastAPI · официальный snapshot",
      staticMode: "Проверенная статическая копия",
      country: "Страна",
      searchCountry: "Поиск страны или ISO3",
      copyLink: "Копировать ссылку",
      copied: "Ссылка на профиль скопирована",
      dataPassport: "Паспорт данных",
      excludedTitle: "Страна не включена в ETI 2026",
      excludedText: "В опубликованном рейтинге WEF нет данных для {country}. Показан мировой лидер как прозрачный ориентир; отсутствующее значение не заменено оценкой GIR.",
      selectedCountry: "Выбранная страна",
      globalRank: "Место в мире",
      groupRank: "Место в группе",
      score: "Итоговый ETI",
      systemPerformance: "Результативность системы",
      transitionReadiness: "Готовность перехода",
      balanceGap: "Разрыв SP − TR",
      officialRank: "официальное место WEF",
      derivedRank: "место рассчитано GIR",
      percentileDerived: "процентиль рассчитан GIR",
      jumpCockpit: "Позиция",
      jumpMatrix: "Матрица",
      jumpMap: "Карта",
      jumpPeers: "Сравнение",
      jumpRanking: "Рейтинг",
      jumpMethod: "Методика",
      cockpitKicker: "01 · Командный центр",
      cockpitTitle: "Текущий результат и запас готовности",
      cockpitText: "ETI соединяет результативность сегодняшней энергетической системы с институциональными, финансовыми, инфраструктурными и инновационными условиями будущего перехода.",
      formula: "ETI = 60% результативности + 40% готовности",
      weight: "Вес",
      worldAverage: "Среднее мира",
      groupAverage: "Среднее группы",
      selectedScore: "Оценка страны",
      leader: "Лидер",
      balance: "Баланс системы",
      balancedSignal: "Сбалансированный профиль",
      readinessGapSignal: "Результат опережает готовность",
      executionGapSignal: "Готовность опережает результат",
      balancedText: "Две оси находятся близко друг к другу: текущая система и условия дальнейшего перехода развиваются сопоставимо.",
      readinessGapText: "Текущие результаты сильнее поддерживающих условий. Без укрепления готовности прогресс может стать менее устойчивым.",
      executionGapText: "Условия для перехода сильнее текущего результата. Главный резерв — конвертировать готовность в измеримые изменения системы.",
      frameworkNow: "Что измеряется сегодня",
      frameworkFuture: "Что поддерживает будущее",
      security: "Безопасность",
      equity: "Доступность и справедливость",
      sustainability: "Устойчивость",
      coreEnablers: "Базовые условия",
      enablingFactors: "Факторы реализации",
      matrixKicker: "02 · Стратегическая матрица",
      matrixTitle: "Результативность × готовность",
      matrixText: "Каждая точка — страна. Медианные линии формируют четыре интерпретируемых квадранта и пересчитываются для выбранной группы.",
      group: "Группа стран",
      allGroups: "Все группы",
      matrixLegend: "120 стран · выбранная страна выделена",
      xAxis: "Результативность системы →",
      yAxis: "Готовность перехода →",
      highHigh: "Высокий результат / высокая готовность",
      highLow: "Высокий результат / более низкая готовность",
      lowHigh: "Более низкий результат / высокая готовность",
      lowLow: "Более низкий результат / более низкая готовность",
      frontier: "Фронтир перехода",
      maintain: "Риск потери темпа",
      unlock: "Потенциал реализации",
      priority: "Системный приоритет",
      countries: "стран",
      medians: "Медианы выборки",
      mapKicker: "03 · География перехода",
      mapTitle: "Мировая карта энергетического перехода",
      mapText: "Переключайте итоговый ETI, текущую результативность и готовность. Геометрия используется только для визуализации и не влияет на баллы.",
      mapMetric: "Показатель карты",
      mappedCountries: "Стран представлены",
      mapTable: "Табличный эквивалент карты",
      low: "ниже",
      high: "выше",
      noData: "нет данных ETI",
      noGeometry: "маркер без полигона",
      peersKicker: "04 · Лаборатория сравнения",
      peersTitle: "Профиль страны и сопоставимые траектории",
      peersText: "Сравните до четырёх стран по итоговому ETI и двум его главным осям. Все значения относятся к одному выпуску 2026.",
      addCountry: "Добавить страну",
      add: "Добавить",
      remove: "Убрать",
      compareLimit: "Можно сравнивать до четырёх стран.",
      groupBenchmark: "Средние значения официальных групп WEF",
      groupLeader: "Лидер группы",
      rankingKicker: "05 · Полный рейтинг",
      rankingTitle: "Страновая таблица ETI 2026",
      rankingText: "Официальные места WEF сохранены для итогового ETI. Для двух главных компонентов места и процентили рассчитываются GIR и явно маркируются.",
      metric: "Метрика",
      search: "Поиск",
      rows: "Строк",
      exportCsv: "Экспорт CSV",
      place: "Место",
      countryColumn: "Страна",
      groupColumn: "Группа",
      scoreColumn: "Оценка",
      spShort: "SP",
      trShort: "TR",
      gapShort: "SP − TR",
      action: "Действие",
      open: "Открыть",
      noRows: "По выбранным фильтрам ничего не найдено.",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      records: "записей",
      rankingOfficialNote: "Для ETI отображается опубликованное место WEF. Оно не восстанавливается из округлённого балла.",
      rankingDerivedNote: "Для выбранного компонента используется competition ranking GIR: ничьи сохраняются как 1, 2, 2, 4.",
      methodKicker: "06 · Методика и доказательства",
      methodTitle: "44 активных показателя в прозрачном дереве",
      methodText: "Методическая структура раскрыта полностью. Встроенный официальный snapshot содержит страновые значения ETI, System Performance и Transition Readiness; отсутствующие нижние уровни остаются null.",
      activeIndicators: "Активных показателей",
      systemIndicators: "В System Performance",
      readinessIndicators: "В Transition Readiness",
      newIndicators: "Новых в 2026",
      newAi: "Готовность к ИИ",
      newMinerals: "Зависимость от импорта минералов чистых технологий",
      retired: "Исключены из балла 2026",
      methodologyOnly: "методика · страновой балл не загружен",
      scoreAvailable: "страновой балл доступен",
      officialTranslationNotice: "Русские названия и пояснения подготовлены GIR и не являются официальным переводом WEF.",
      comparabilityTitle: "Сопоставимость выпусков",
      comparabilityText: "WEF ежегодно уточняет источники, нормализацию и состав показателей. Snapshot 2026 не сшит с прошлыми редакциями, а исторические значения не пересчитаны GIR.",
      licenseTitle: "Условия использования",
      licenseText: "Материалы WEF по умолчанию распространяются по CC BY‑NC‑ND 4.0. Коммерческое использование и распространение адаптаций требуют предварительного письменного разрешения.",
      officialMaterials: "Официальные материалы",
      publication: "Публикация ETI 2026",
      framework: "Методическая рамка",
      appendices: "Приложения и источники",
      evidenceKicker: "ETI 2026 · PROVENANCE",
      evidenceTitle: "Паспорт официального snapshot",
      close: "Закрыть",
      dataset: "Набор данных",
      edition: "Редакция",
      publicationDate: "Дата публикации",
      coverage: "Покрытие",
      checksum: "SHA‑256 набора",
      staticChecksum: "SHA‑256 статического файла",
      provider: "Активный провайдер",
      files: "Файлы snapshot",
      scientificContract: "Научный контракт",
      rankPreserved: "Официальное место ETI сохранено",
      scoresNotRecomputed: "Опубликованные баллы не пересчитаны",
      noSplice: "Выпуски не сшиты",
      noZeroFill: "Пропуски не заменены нулём",
      lowerScoresNull: "Отсутствующие нижние баллы остаются null",
      translationUnofficial: "Русская локализация неофициальна",
      copy: "Копировать",
      copiedHash: "SHA‑256 скопирован",
      yes: "да",
      no: "нет",
      bytes: "байт",
      metricEti: "Energy Transition Index",
      metricSp: "Результативность системы",
      metricTr: "Готовность перехода",
      rankOfficialBadge: "WEF",
      rankDerivedBadge: "GIR",
      details: "Подробнее",
    },
    en: {
      loadingTitle: "Calibrating the world's energy systems",
      loadingText: "Validating the official ranking, 120 countries and the ETI 2026 methodology tree.",
      errorTitle: "The ETI workspace is temporarily unavailable",
      retry: "Retry",
      kicker: "Environment & sustainability · energy systems",
      title: "Energy Transition Index 2026",
      lead: "A comparative view of how energy systems perform today and whether countries are ready to sustain transition progress tomorrow.",
      sourceBadge: "World Economic Forum × Accenture",
      editionBadge: "Released 18 June 2026",
      coverageBadge: "120 countries · 44 indicators",
      verifiedBadge: "data integrity verified",
      apiMode: "FastAPI · official snapshot",
      staticMode: "Verified static copy",
      country: "Country",
      searchCountry: "Search country or ISO3",
      copyLink: "Copy link",
      copied: "Profile link copied",
      dataPassport: "Data passport",
      excludedTitle: "Country not covered by ETI 2026",
      excludedText: "The published WEF ranking contains no value for {country}. The global leader is shown as a transparent benchmark; GIR does not impute the missing score.",
      selectedCountry: "Selected country",
      globalRank: "Global rank",
      groupRank: "Group rank",
      score: "Headline ETI",
      systemPerformance: "System performance",
      transitionReadiness: "Transition readiness",
      balanceGap: "SP − TR gap",
      officialRank: "official WEF rank",
      derivedRank: "rank derived by GIR",
      percentileDerived: "percentile derived by GIR",
      jumpCockpit: "Position",
      jumpMatrix: "Matrix",
      jumpMap: "Map",
      jumpPeers: "Compare",
      jumpRanking: "Ranking",
      jumpMethod: "Method",
      cockpitKicker: "01 · Command centre",
      cockpitTitle: "Current performance and readiness reserve",
      cockpitText: "ETI combines today's energy-system outcomes with the institutional, financial, infrastructure and innovation conditions needed for future progress.",
      formula: "ETI = 60% system performance + 40% transition readiness",
      weight: "Weight",
      worldAverage: "World average",
      groupAverage: "Group average",
      selectedScore: "Country score",
      leader: "Leader",
      balance: "System balance",
      balancedSignal: "Balanced profile",
      readinessGapSignal: "Performance is ahead of readiness",
      executionGapSignal: "Readiness is ahead of performance",
      balancedText: "The two axes are close: current outcomes and the conditions for sustained transition are developing at a comparable level.",
      readinessGapText: "Current outcomes are stronger than the enabling environment. Without stronger readiness, progress may become harder to sustain.",
      executionGapText: "Enabling conditions are stronger than current outcomes. The opportunity is to convert readiness into measurable system change.",
      frameworkNow: "What is delivered today",
      frameworkFuture: "What enables tomorrow",
      security: "Security",
      equity: "Equity",
      sustainability: "Sustainability",
      coreEnablers: "Core enablers",
      enablingFactors: "Enabling factors",
      matrixKicker: "02 · Strategic matrix",
      matrixTitle: "System performance × readiness",
      matrixText: "Each point is a country. Median lines create four interpretable quadrants and are recalculated for the selected country group.",
      group: "Country group",
      allGroups: "All groups",
      matrixLegend: "120 countries · selected country highlighted",
      xAxis: "System performance →",
      yAxis: "Transition readiness →",
      highHigh: "High performance / high readiness",
      highLow: "High performance / lower readiness",
      lowHigh: "Lower performance / high readiness",
      lowLow: "Lower performance / lower readiness",
      frontier: "Transition frontier",
      maintain: "Momentum at risk",
      unlock: "Delivery potential",
      priority: "System priority",
      countries: "countries",
      medians: "Sample medians",
      mapKicker: "03 · Transition geography",
      mapTitle: "World map of energy transition",
      mapText: "Switch between headline ETI, current system performance and readiness. Geometry is visual only and never changes scores.",
      mapMetric: "Map metric",
      mappedCountries: "Countries represented",
      mapTable: "Tabular map equivalent",
      low: "lower",
      high: "higher",
      noData: "no ETI data",
      noGeometry: "marker without polygon",
      peersKicker: "04 · Comparison lab",
      peersTitle: "Country profile and comparable systems",
      peersText: "Compare up to four countries across headline ETI and its two main axes. Every value belongs to the same 2026 edition.",
      addCountry: "Add country",
      add: "Add",
      remove: "Remove",
      compareLimit: "Up to four countries can be compared.",
      groupBenchmark: "Official WEF country-group averages",
      groupLeader: "Group leader",
      rankingKicker: "05 · Full ranking",
      rankingTitle: "ETI 2026 country table",
      rankingText: "Official WEF ranks are preserved for headline ETI. For the two sub-indices GIR derives ranks and percentiles and labels them explicitly.",
      metric: "Metric",
      search: "Search",
      rows: "Rows",
      exportCsv: "Export CSV",
      place: "Rank",
      countryColumn: "Country",
      groupColumn: "Group",
      scoreColumn: "Score",
      spShort: "SP",
      trShort: "TR",
      gapShort: "SP − TR",
      action: "Action",
      open: "Open",
      noRows: "No rows match the selected filters.",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      records: "records",
      rankingOfficialNote: "Headline ETI uses the rank published by WEF. It is not reconstructed from rounded scores.",
      rankingDerivedNote: "The selected component uses GIR competition ranking: ties are preserved as 1, 2, 2, 4.",
      methodKicker: "06 · Method and evidence",
      methodTitle: "44 active indicators in a transparent tree",
      methodText: "The full methodology is exposed. The embedded official snapshot contains country values for ETI, System Performance and Transition Readiness; missing lower-level values remain null.",
      activeIndicators: "Active indicators",
      systemIndicators: "In System Performance",
      readinessIndicators: "In Transition Readiness",
      newIndicators: "New in 2026",
      newAi: "AI readiness",
      newMinerals: "Clean-tech minerals import exposure",
      retired: "Removed from the 2026 score",
      methodologyOnly: "method only · no country score loaded",
      scoreAvailable: "country score available",
      officialTranslationNotice: "Russian names and explanations are prepared by GIR and are not an official WEF translation.",
      comparabilityTitle: "Edition comparability",
      comparabilityText: "WEF refines sources, normalization and indicator composition each year. The 2026 snapshot is not spliced to earlier editions and GIR does not backcast historical values.",
      licenseTitle: "Use terms",
      licenseText: "WEF materials default to CC BY‑NC‑ND 4.0. Commercial use and distribution of adaptations require prior written permission.",
      officialMaterials: "Official materials",
      publication: "ETI 2026 publication",
      framework: "Framework",
      appendices: "Appendices and sources",
      evidenceKicker: "ETI 2026 · PROVENANCE",
      evidenceTitle: "Official snapshot passport",
      close: "Close",
      dataset: "Dataset",
      edition: "Edition",
      publicationDate: "Publication date",
      coverage: "Coverage",
      checksum: "Dataset SHA‑256",
      staticChecksum: "Static file SHA‑256",
      provider: "Active provider",
      files: "Snapshot files",
      scientificContract: "Scientific contract",
      rankPreserved: "Official ETI rank preserved",
      scoresNotRecomputed: "Published scores not recomputed",
      noSplice: "Editions not spliced",
      noZeroFill: "Missing values not zero-filled",
      lowerScoresNull: "Missing lower-level scores remain null",
      translationUnofficial: "Russian localization is unofficial",
      copy: "Copy",
      copiedHash: "SHA‑256 copied",
      yes: "yes",
      no: "no",
      bytes: "bytes",
      metricEti: "Energy Transition Index",
      metricSp: "System performance",
      metricTr: "Transition readiness",
      rankOfficialBadge: "WEF",
      rankDerivedBadge: "GIR",
      details: "Details",
    },
  };

  const ISLAND_CENTROIDS = {
    BHR: [50.55, 26.05], BRB: [-59.55, 13.18], CPV: [-23.62, 15.1], CYP: [33.15, 35.12],
    FJI: [178.1, -17.8], JAM: [-77.3, 18.1], MDV: [73.22, 3.2], MLT: [14.38, 35.94],
    MUS: [57.55, -20.25], SGP: [103.82, 1.35], TTO: [-61.25, 10.45],
  };

  const GROUP_CLASS = {
    ADVANCED_ECONOMIES: "group-1",
    EMERGING_ASIA: "group-2",
    EMERGING_EUROPE: "group-3",
    LATIN_AMERICA_CARIBBEAN: "group-4",
    MENA_PAKISTAN: "group-5",
    SUB_SAHARAN_AFRICA: "group-6",
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    country: "",
    excludedCountry: "",
    mapMetric: "ETI",
    rankingMetric: "ETI",
    rankingGroup: "",
    matrixGroup: "",
    rankingQuery: "",
    rankingSort: "rank",
    rankingOrder: "asc",
    page: 1,
    pageSize: 25,
    compare: ["SWE", "FIN", "CHN", "IND"],
    base: null,
    geo: null,
    providerMode: "api",
    context: {},
    dialogReturn: null,
  };

  const cache = { basePromise: null, staticPromise: null, geoPromise: null };
  const tr = (key) => COPY[state.lang]?.[key] || COPY.ru[key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const num = (value) => value == null || value === "" || Number.isNaN(Number(value)) ? null : Number(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const locale = () => state.lang === "ru" ? "ru-RU" : "en-US";
  const fmt = (value, digits = 1) => num(value) == null ? "—" : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signed = (value, digits = 1) => num(value) == null ? "—" : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;
  const mean = (values) => {
    const data = values.map(Number).filter(Number.isFinite);
    return data.length ? data.reduce((sum, value) => sum + value, 0) / data.length : null;
  };
  const median = (values) => {
    const data = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!data.length) return null;
    const middle = Math.floor(data.length / 2);
    return data.length % 2 ? data[middle] : (data[middle - 1] + data[middle]) / 2;
  };
  const localName = (item) => state.lang === "ru" ? (item?.name_ru || item?.name_en || item?.iso3) : (item?.name_en || item?.iso3);
  const localGroup = (item) => state.lang === "ru" ? (item?.group?.name_ru || item?.group?.name_en || "—") : (item?.group?.name_en || "—");
  const metricName = (code) => tr({ ETI: "metricEti", SP: "metricSp", TR: "metricTr" }[code] || "metricEti");
  const metricField = (code) => ({ ETI: "score", SP: "system_performance_score", TR: "transition_readiness_score" })[code] || "score";

  function icon(name, className = "") {
    const paths = {
      bolt: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
      matrix: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 3v18M3 12h18"/>',
      balance: '<path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7ZM17 7l-4 7h8l-4-7Z"/>',
      chart: '<path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/>',
      list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
      tree: '<path d="M12 3v5M6 13v-2h12v2M6 13v5M18 13v5M12 11v7"/><circle cx="12" cy="3" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="12" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
      leaf: '<path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z"/><path d="M4 21c3-6 7-9 13-12"/>',
      shield: '<path d="M12 3 4.5 6v5.3c0 4.7 3.2 8.9 7.5 10.2 4.3-1.3 7.5-5.5 7.5-10.2V6L12 3Z"/><path d="m9 12 2 2 4-5"/>',
    };
    return `<svg class="etx-icon ${esc(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.bolt}</svg>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
  }

  async function sha256Text(text) {
    if (!globalThis.crypto?.subtle) return null;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function loadStaticStore() {
    if (!cache.staticPromise) {
      cache.staticPromise = Promise.all([
        fetchJson(STATIC_MANIFEST),
        fetch(STATIC_CORE, { cache: "no-store" }).then(async (response) => {
          if (!response.ok) throw new Error(`${STATIC_CORE}: HTTP ${response.status}`);
          const text = await response.text();
          return { text, json: JSON.parse(text) };
        }),
      ]).then(async ([manifest, loaded]) => {
        const actual = await sha256Text(loaded.text);
        if (actual && manifest.core?.sha256 && actual !== manifest.core.sha256) throw new Error("ETI static asset checksum mismatch");
        return { ...loaded.json, static_manifest: manifest, static_checksum_verified: !actual || actual === manifest.core.sha256 };
      }).catch((error) => { cache.staticPromise = null; throw error; });
    }
    return cache.staticPromise;
  }

  async function loadApiStore() {
    const [overview, release, provenance, components, hierarchy, groups, ranking, matrix] = await Promise.all([
      fetchJson(API),
      fetchJson(`${API}/release`),
      fetchJson(`${API}/provenance`),
      fetchJson(`${API}/components`),
      fetchJson(`${API}/hierarchy`),
      fetchJson(`${API}/groups`),
      fetchJson(`${API}/ranking?component=ETI&sort=rank&order=asc&limit=500`),
      fetchJson(`${API}/matrix?x=SP&y=TR`),
    ]);
    return {
      schema_version: "gir-eti-frontend-api-store-v1",
      index_code: "ETI",
      dataset_id: overview.dataset_id,
      dataset_sha256: provenance.runtime?.dataset_sha256,
      overview,
      release,
      provenance,
      components,
      hierarchy,
      groups,
      ranking,
      matrix,
      frontend_contract: {
        official_eti_rank_preserved: true,
        scores_recomputed: false,
        release_spliced: false,
        missing_component_scores_are_null: true,
      },
    };
  }

  async function ensureBase() {
    if (!cache.basePromise) {
      cache.basePromise = loadApiStore()
        .then((store) => { state.providerMode = "api"; return store; })
        .catch(async () => {
          const store = await loadStaticStore();
          state.providerMode = "static";
          return store;
        })
        .then((store) => normalizeStore(store))
        .catch((error) => { cache.basePromise = null; throw error; });
    }
    state.base = await cache.basePromise;
    return state.base;
  }

  function competitionRanks(rows, field) {
    const sorted = [...rows].filter((row) => num(row[field]) != null).sort((a, b) => Number(b[field]) - Number(a[field]) || a.iso3.localeCompare(b.iso3));
    const ranks = new Map();
    let previous = null;
    let rank = 0;
    sorted.forEach((row, index) => {
      const value = Number(row[field]);
      if (previous == null || Math.abs(value - previous) > 1e-12) rank = index + 1;
      ranks.set(row.iso3, rank);
      previous = value;
    });
    return ranks;
  }

  function normalizeStore(store) {
    const rows = (store.ranking?.ranking || []).map((row) => ({ ...row }));
    const byIso = new Map(rows.map((row) => [row.iso3, row]));
    const ranks = {
      SP: competitionRanks(rows, "system_performance_score"),
      TR: competitionRanks(rows, "transition_readiness_score"),
    };
    const groupRanks = { ETI: new Map(), SP: new Map(), TR: new Map() };
    const groups = new Map();
    rows.forEach((row) => {
      const code = row.group?.code || "OTHER";
      if (!groups.has(code)) groups.set(code, []);
      groups.get(code).push(row);
    });
    groups.forEach((members) => {
      const etiRanks = competitionRanks(members, "score");
      const spRanks = competitionRanks(members, "system_performance_score");
      const trRanks = competitionRanks(members, "transition_readiness_score");
      members.forEach((row) => {
        groupRanks.ETI.set(row.iso3, row.group_rank || etiRanks.get(row.iso3));
        groupRanks.SP.set(row.iso3, spRanks.get(row.iso3));
        groupRanks.TR.set(row.iso3, trRanks.get(row.iso3));
      });
    });
    return { ...store, rows, byIso, ranks, groupRanks };
  }

  function metricScore(row, metric) {
    return num(row?.[metricField(metric)]);
  }

  function metricRank(row, metric) {
    if (!row) return null;
    if (metric === "ETI") return row.rank;
    return state.base?.ranks?.[metric]?.get(row.iso3) ?? null;
  }

  function metricGroupRank(row, metric) {
    return state.base?.groupRanks?.[metric]?.get(row?.iso3) ?? null;
  }

  function metricPercentile(row, metric) {
    const rank = metricRank(row, metric);
    const total = state.base?.rows?.length || 0;
    return rank == null || total <= 1 ? null : ((total - rank) / (total - 1)) * 100;
  }

  function groupPayload(code) {
    return (state.base?.groups?.groups || []).find((item) => item.code === code) || null;
  }

  function countryRow(iso3 = state.country) {
    return state.base?.byIso?.get(String(iso3 || "").toUpperCase()) || null;
  }

  function countrySelect(id, value, label) {
    const options = [...(state.base?.rows || [])].sort((a, b) => localName(a).localeCompare(localName(b), locale()));
    return `<label class="etx-field"><span>${esc(label)}</span><select id="${esc(id)}">${options.map((row) => `<option value="${row.iso3}" ${row.iso3 === value ? "selected" : ""}>${esc(localName(row))} · ${row.iso3}</option>`).join("")}</select></label>`;
  }

  function metricOptions(value) {
    return METRICS.map((code) => `<option value="${code}" ${code === value ? "selected" : ""}>${esc(metricName(code))}</option>`).join("");
  }

  function groupOptions(value) {
    const groups = [...(state.base?.groups?.groups || [])].sort((a, b) => GROUP_ORDER.indexOf(a.code) - GROUP_ORDER.indexOf(b.code));
    return `<option value="">${esc(tr("allGroups"))}</option>${groups.map((group) => `<option value="${esc(group.code)}" ${group.code === value ? "selected" : ""}>${esc(state.lang === "ru" ? group.name_ru : group.name_en)}</option>`).join("")}`;
  }

  function flag(row, size = "inline") {
    const iso2 = String(row?.iso2 || "").toLowerCase();
    const fallback = esc(row?.iso3 || "—");
    const useImage = iso2 && !globalThis.__GIR_ETI_DISABLE_FLAG_IMAGES__;
    return `<span class="etx-flag etx-flag--${esc(size)}" aria-hidden="true">${useImage ? `<img src="/static/flags/${iso2}.svg" alt="" loading="lazy">` : ""}<b>${fallback}</b></span>`;
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    const requested = String(params.get("country") || state.context.country || "").toUpperCase();
    state.country = requested;
    const mapMetric = String(params.get("eti_map") || state.mapMetric).toUpperCase();
    const rankingMetric = String(params.get("eti_metric") || state.rankingMetric).toUpperCase();
    if (METRICS.includes(mapMetric)) state.mapMetric = mapMetric;
    if (METRICS.includes(rankingMetric)) state.rankingMetric = rankingMetric;
    state.matrixGroup = params.get("eti_matrix_group") || state.matrixGroup;
    state.rankingGroup = params.get("eti_group") || state.rankingGroup;
    const compare = (params.get("eti_compare") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    if (compare.length) state.compare = [...new Set(compare)].slice(0, 4);
  }

  function writeUrl() {
    const params = new URLSearchParams(location.search);
    params.set("index", "ETI");
    params.set("country", state.country);
    params.set("eti_map", state.mapMetric);
    params.set("eti_metric", state.rankingMetric);
    if (state.matrixGroup) params.set("eti_matrix_group", state.matrixGroup); else params.delete("eti_matrix_group");
    if (state.rankingGroup) params.set("eti_group", state.rankingGroup); else params.delete("eti_group");
    params.set("eti_compare", state.compare.join(","));
    const next = `${location.pathname}?${params.toString()}#index-ETI`;
    try { history.replaceState(null, "", next); } catch (_) { /* embedded/opaque preview */ }
  }

  function loadingMarkup() {
    return `<section class="etx-workspace index-workspace gir-native-workspace" data-gir-design="native-06r"><div class="etx-loading-shell" aria-live="polite"><div class="etx-reactor" aria-hidden="true"><span></span><span></span><span></span></div><div><strong>${esc(tr("loadingTitle"))}</strong><p>${esc(tr("loadingText"))}</p></div><div class="etx-loading-bars">${Array.from({ length: 8 }, (_, index) => `<i style="--delay:${index}"></i>`).join("")}</div></div></section>`;
  }

  function errorMarkup(error) {
    return `<section class="etx-workspace index-workspace gir-native-workspace" data-gir-design="native-06r"><div class="etx-error-shell"><span>ETI / ERROR</span><h1>${esc(tr("errorTitle"))}</h1><p>${esc(error?.message || error || "Unknown error")}</p><button class="etx-button etx-button--primary" data-etx-action="retry">${icon("bolt")}${esc(tr("retry"))}</button></div></section>`;
  }

  function providerPill() {
    return `<span class="etx-provider"><i></i>${esc(state.providerMode === "api" ? tr("apiMode") : tr("staticMode"))}</span>`;
  }

  function exclusionMarkup() {
    if (!state.excludedCountry) return "";
    const label = state.excludedCountry;
    return `<aside class="etx-coverage-alert" role="status">${icon("info")}<div><strong>${esc(tr("excludedTitle"))}</strong><p>${esc(tr("excludedText").replace("{country}", label))}</p></div></aside>`;
  }

  function scoreRing(value, rank) {
    const safe = clamp(num(value) || 0, 0, 100);
    const radius = 74;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - safe / 100);
    return `<svg class="etx-score-ring" viewBox="0 0 184 184" role="img" aria-label="${esc(`${tr("score")}: ${fmt(value, 1)}; ${tr("globalRank")}: ${rank}`)}"><circle class="etx-score-ring__track" cx="92" cy="92" r="${radius}"/><circle class="etx-score-ring__value" cx="92" cy="92" r="${radius}" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/><circle class="etx-score-ring__halo" cx="92" cy="92" r="56"/><text x="92" y="86" text-anchor="middle" class="etx-score-ring__score">${esc(fmt(value, 1))}</text><text x="92" y="107" text-anchor="middle" class="etx-score-ring__rank">#${esc(rank)}</text></svg>`;
  }

  function heroMarkup() {
    const row = countryRow();
    const gap = num(row?.balance_gap);
    return `<section class="etx-hero" id="etx-top">
      <div class="etx-hero-grid" aria-hidden="true"></div>
      <div class="etx-orbit" aria-hidden="true"><i></i><i></i><i></i><span></span><span></span></div>
      <div class="etx-hero-copy">
        <p class="etx-kicker">${esc(tr("kicker"))}</p>
        <h1>${esc(tr("title"))}</h1>
        <p class="etx-lead">${esc(tr("lead"))}</p>
        <div class="etx-badges"><span>${icon("database")}${esc(tr("coverageBadge"))}</span><span>${icon("globe")}${esc(tr("sourceBadge"))}</span><span>${icon("check")}${esc(tr("editionBadge"))}</span><span class="is-verified">${icon("shield")}${esc(tr("verifiedBadge"))}</span></div>
        <div class="etx-hero-actions">${countrySelect("etxCountry", state.country, tr("country"))}<button class="etx-button" data-etx-action="copy-link">${icon("copy")}${esc(tr("copyLink"))}</button><button class="etx-button etx-button--primary" data-etx-action="evidence">${icon("database")}${esc(tr("dataPassport"))}</button></div>
        ${providerPill()}
      </div>
      <aside class="etx-country-card" aria-label="${esc(tr("selectedCountry"))}">
        <header>${flag(row, "large")}<div><small>${esc(tr("selectedCountry"))}</small><h2>${esc(localName(row))}</h2><p>${esc(localGroup(row))}</p></div></header>
        <div class="etx-country-score">${scoreRing(row?.score, row?.rank)}</div>
        <div class="etx-country-metrics">
          <div><span>${esc(tr("systemPerformance"))}</span><strong>${esc(fmt(row?.system_performance_score, 1))}</strong><i><b style="width:${clamp(num(row?.system_performance_score) || 0, 0, 100)}%"></b></i></div>
          <div><span>${esc(tr("transitionReadiness"))}</span><strong>${esc(fmt(row?.transition_readiness_score, 1))}</strong><i><b style="width:${clamp(num(row?.transition_readiness_score) || 0, 0, 100)}%"></b></i></div>
        </div>
        <footer><span>${esc(tr("groupRank"))} <b>#${esc(metricGroupRank(row, "ETI"))}</b></span><span>${esc(tr("balanceGap"))} <b class="${gap > 0 ? "is-positive" : gap < 0 ? "is-negative" : ""}">${esc(signed(gap, 1))}</b></span></footer>
      </aside>
    </section>`;
  }

  function jumpNavMarkup() {
    const items = [
      ["etx-cockpit", "balance", "jumpCockpit"],
      ["etx-matrix", "matrix", "jumpMatrix"],
      ["etx-map", "globe", "jumpMap"],
      ["etx-peers", "chart", "jumpPeers"],
      ["etx-ranking", "list", "jumpRanking"],
      ["etx-method", "tree", "jumpMethod"],
    ];
    return `<nav class="etx-jump" aria-label="ETI sections">${items.map(([target, glyph, label], index) => `<button data-etx-action="jump" data-target="${target}"><span>0${index + 1}</span>${icon(glyph)}<b>${esc(tr(label))}</b></button>`).join("")}</nav>`;
  }

  function sectionHeader(kicker, title, text, actions = "") {
    return `<header class="etx-section-header"><div><p>${esc(kicker)}</p><h2>${esc(title)}</h2></div><div class="etx-section-intro"><span>${esc(text)}</span>${actions}</div></header>`;
  }

  function meter(value, label, weight, tone) {
    return `<article class="etx-weight-card ${tone}"><header><span>${esc(label)}</span><strong>${esc(fmt(value, 1))}</strong></header><div class="etx-meter"><i style="width:${clamp(num(value) || 0, 0, 100)}%"></i><span style="left:57.3%" title="${esc(tr("worldAverage"))}"></span></div><footer><span>${esc(tr("weight"))}</span><b>${esc(weight)}</b></footer></article>`;
  }

  function signalFor(row) {
    const gap = num(row?.balance_gap) || 0;
    if (Math.abs(gap) < 3) return { icon: "balance", title: tr("balancedSignal"), text: tr("balancedText"), className: "is-balanced" };
    if (gap > 0) return { icon: "shield", title: tr("readinessGapSignal"), text: tr("readinessGapText"), className: "is-warning" };
    return { icon: "bolt", title: tr("executionGapSignal"), text: tr("executionGapText"), className: "is-opportunity" };
  }

  function benchmarkBar(label, value, maxValue, className = "") {
    return `<div class="etx-benchmark-row ${className}"><span>${esc(label)}</span><i><b style="width:${clamp((num(value) || 0) / maxValue * 100, 0, 100)}%"></b></i><strong>${esc(fmt(value, 1))}</strong></div>`;
  }

  function cockpitMarkup() {
    const row = countryRow();
    const group = groupPayload(row?.group?.code);
    const globalAverage = state.base?.overview?.summary?.global_average ?? 57.3;
    const groupAverage = group?.averages?.ETI;
    const leader = state.base?.rows?.[0];
    const max = Math.max(num(row?.score) || 0, num(globalAverage) || 0, num(groupAverage) || 0, num(leader?.score) || 0, 1);
    const signal = signalFor(row);
    return `<section class="etx-section" id="etx-cockpit">
      ${sectionHeader(tr("cockpitKicker"), tr("cockpitTitle"), tr("cockpitText"))}
      <div class="etx-cockpit-grid">
        <div class="etx-formula-panel">
          <div class="etx-formula-label">${icon("bolt")}<span>${esc(tr("formula"))}</span></div>
          <div class="etx-formula-flow">
            ${meter(row?.system_performance_score, tr("systemPerformance"), "60%", "is-performance")}
            <div class="etx-formula-operator" aria-hidden="true">+</div>
            ${meter(row?.transition_readiness_score, tr("transitionReadiness"), "40%", "is-readiness")}
            <div class="etx-formula-operator" aria-hidden="true">=</div>
            <article class="etx-result-card"><span>${esc(tr("score"))}</span><strong>${esc(fmt(row?.score, 1))}</strong><small>#${esc(row?.rank)} · ${esc(tr("officialRank"))}</small></article>
          </div>
          <div class="etx-framework-strip">
            <div><p>${esc(tr("frameworkNow"))}</p><span>${icon("shield")}${esc(tr("security"))}</span><span>${icon("balance")}${esc(tr("equity"))}</span><span>${icon("leaf")}${esc(tr("sustainability"))}</span></div>
            <div><p>${esc(tr("frameworkFuture"))}</p><span>${icon("database")}${esc(tr("coreEnablers"))}</span><span>${icon("bolt")}${esc(tr("enablingFactors"))}</span></div>
          </div>
        </div>
        <aside class="etx-cockpit-side">
          <article class="etx-signal ${signal.className}"><span>${icon(signal.icon)}</span><div><small>${esc(tr("balance"))}</small><h3>${esc(signal.title)}</h3><p>${esc(signal.text)}</p></div></article>
          <article class="etx-benchmark"><header><span>${esc(tr("selectedScore"))}</span><b>${esc(localName(row))}</b></header>${benchmarkBar(localName(row), row?.score, max, "is-selected")}${benchmarkBar(tr("worldAverage"), globalAverage, max)}${benchmarkBar(tr("groupAverage"), groupAverage, max)}${benchmarkBar(`${tr("leader")} · ${localName(leader)}`, leader?.score, max, "is-leader")}</article>
        </aside>
      </div>
    </section>`;
  }

  function matrixRows() {
    let rows = state.base?.rows || [];
    if (state.matrixGroup) rows = rows.filter((row) => row.group?.code === state.matrixGroup);
    return rows;
  }

  function matrixQuadrant(row, xMedian, yMedian) {
    const xHigh = Number(row.system_performance_score) >= xMedian;
    const yHigh = Number(row.transition_readiness_score) >= yMedian;
    if (xHigh && yHigh) return "HIGH_X_HIGH_Y";
    if (xHigh) return "HIGH_X_LOW_Y";
    if (yHigh) return "LOW_X_HIGH_Y";
    return "LOW_X_LOW_Y";
  }

  function matrixChartMarkup() {
    const rows = matrixRows();
    const width = 920, height = 530;
    const pad = { left: 78, right: 34, top: 38, bottom: 66 };
    const xValues = rows.map((row) => Number(row.system_performance_score));
    const yValues = rows.map((row) => Number(row.transition_readiness_score));
    const xMin = Math.floor(Math.min(...xValues) / 5) * 5 - 2;
    const xMax = Math.ceil(Math.max(...xValues) / 5) * 5 + 2;
    const yMin = Math.floor(Math.min(...yValues) / 5) * 5 - 2;
    const yMax = Math.ceil(Math.max(...yValues) / 5) * 5 + 2;
    const xMedian = median(xValues);
    const yMedian = median(yValues);
    const x = (value) => pad.left + ((value - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
    const y = (value) => height - pad.bottom - ((value - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
    const xTicks = Array.from({ length: 6 }, (_, index) => xMin + ((xMax - xMin) / 5) * index);
    const yTicks = Array.from({ length: 6 }, (_, index) => yMin + ((yMax - yMin) / 5) * index);
    const counts = { HIGH_X_HIGH_Y: 0, HIGH_X_LOW_Y: 0, LOW_X_HIGH_Y: 0, LOW_X_LOW_Y: 0 };
    rows.forEach((row) => counts[matrixQuadrant(row, xMedian, yMedian)] += 1);
    const points = rows.map((row) => {
      const selected = row.iso3 === state.country;
      const label = `${localName(row)} · SP ${fmt(row.system_performance_score, 1)} · TR ${fmt(row.transition_readiness_score, 1)} · ETI ${fmt(row.score, 1)}`;
      return `<g class="etx-matrix-point ${GROUP_CLASS[row.group?.code] || "group-0"} ${selected ? "is-selected" : ""}" data-etx-action="country" data-iso="${row.iso3}" tabindex="0" role="button" aria-label="${esc(label)}" transform="translate(${x(row.system_performance_score).toFixed(2)} ${y(row.transition_readiness_score).toFixed(2)})"><circle r="${selected ? 10 : 5.3}"></circle>${selected ? `<circle class="etx-matrix-pulse" r="17"></circle><text x="14" y="-11">${row.iso3}</text>` : ""}<title>${esc(label)}</title></g>`;
    }).join("");
    const qLabels = [
      ["LOW_X_HIGH_Y", pad.left + 12, pad.top + 24, tr("unlock")],
      ["HIGH_X_HIGH_Y", x(xMedian) + 14, pad.top + 24, tr("frontier")],
      ["LOW_X_LOW_Y", pad.left + 12, y(yMedian) + 30, tr("priority")],
      ["HIGH_X_LOW_Y", x(xMedian) + 14, y(yMedian) + 30, tr("maintain")],
    ].map(([code, lx, ly, label]) => `<text class="etx-quadrant-label" x="${lx}" y="${ly}">${esc(label)} · ${counts[code]}</text>`).join("");
    return `<div class="etx-matrix-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="etxMatrixTitle etxMatrixDesc"><title id="etxMatrixTitle">${esc(tr("matrixTitle"))}</title><desc id="etxMatrixDesc">${esc(tr("matrixText"))}</desc>
      <rect class="etx-q etx-q--unlock" x="${pad.left}" y="${pad.top}" width="${x(xMedian) - pad.left}" height="${y(yMedian) - pad.top}"/>
      <rect class="etx-q etx-q--frontier" x="${x(xMedian)}" y="${pad.top}" width="${width - pad.right - x(xMedian)}" height="${y(yMedian) - pad.top}"/>
      <rect class="etx-q etx-q--priority" x="${pad.left}" y="${y(yMedian)}" width="${x(xMedian) - pad.left}" height="${height - pad.bottom - y(yMedian)}"/>
      <rect class="etx-q etx-q--maintain" x="${x(xMedian)}" y="${y(yMedian)}" width="${width - pad.right - x(xMedian)}" height="${height - pad.bottom - y(yMedian)}"/>
      ${xTicks.map((tick) => `<line class="etx-grid-line" x1="${x(tick)}" x2="${x(tick)}" y1="${pad.top}" y2="${height - pad.bottom}"/><text class="etx-axis-tick" x="${x(tick)}" y="${height - pad.bottom + 25}" text-anchor="middle">${fmt(tick, 0)}</text>`).join("")}
      ${yTicks.map((tick) => `<line class="etx-grid-line" x1="${pad.left}" x2="${width - pad.right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="etx-axis-tick" x="${pad.left - 15}" y="${y(tick) + 4}" text-anchor="end">${fmt(tick, 0)}</text>`).join("")}
      <line class="etx-median-line" x1="${x(xMedian)}" x2="${x(xMedian)}" y1="${pad.top}" y2="${height - pad.bottom}"/><line class="etx-median-line" x1="${pad.left}" x2="${width - pad.right}" y1="${y(yMedian)}" y2="${y(yMedian)}"/>
      ${qLabels}${points}
      <text class="etx-axis-label" x="${(pad.left + width - pad.right) / 2}" y="${height - 16}" text-anchor="middle">${esc(tr("xAxis"))}</text><text class="etx-axis-label" transform="translate(22 ${(pad.top + height - pad.bottom) / 2}) rotate(-90)" text-anchor="middle">${esc(tr("yAxis"))}</text>
    </svg></div>`;
  }

  function matrixMarkup() {
    const rows = matrixRows();
    const xMedian = median(rows.map((row) => row.system_performance_score));
    const yMedian = median(rows.map((row) => row.transition_readiness_score));
    const counts = { HIGH_X_HIGH_Y: 0, HIGH_X_LOW_Y: 0, LOW_X_HIGH_Y: 0, LOW_X_LOW_Y: 0 };
    rows.forEach((row) => counts[matrixQuadrant(row, xMedian, yMedian)] += 1);
    const selected = countryRow();
    const selectedQuadrant = selected && rows.includes(selected) ? matrixQuadrant(selected, xMedian, yMedian) : null;
    const labels = {
      HIGH_X_HIGH_Y: [tr("frontier"), tr("highHigh")],
      HIGH_X_LOW_Y: [tr("maintain"), tr("highLow")],
      LOW_X_HIGH_Y: [tr("unlock"), tr("lowHigh")],
      LOW_X_LOW_Y: [tr("priority"), tr("lowLow")],
    };
    const actions = `<label class="etx-inline-field"><span>${esc(tr("group"))}</span><select id="etxMatrixGroup">${groupOptions(state.matrixGroup)}</select></label>`;
    return `<section class="etx-section" id="etx-matrix">${sectionHeader(tr("matrixKicker"), tr("matrixTitle"), tr("matrixText"), actions)}<div class="etx-matrix-layout">${matrixChartMarkup()}<aside class="etx-matrix-side"><div class="etx-matrix-caption"><span>${icon("matrix")}${esc(tr("matrixLegend"))}</span><b>${esc(tr("medians"))}: SP ${esc(fmt(xMedian, 1))} · TR ${esc(fmt(yMedian, 1))}</b></div>${Object.entries(labels).map(([code, [title, text]]) => `<article class="${selectedQuadrant === code ? "is-active" : ""}"><i></i><div><strong>${esc(title)}</strong><span>${esc(text)}</span></div><b>${counts[code]}</b></article>`).join("")}</aside></div></section>`;
  }

  async function ensureGeo() {
    if (!cache.geoPromise) {
      cache.geoPromise = (async () => {
        let lastError = null;
        for (const source of GEO_SOURCES) {
          try {
            const payload = await fetchJson(source);
            if (payload?.type === "FeatureCollection" && Array.isArray(payload.features) && payload.features.length) return payload;
          } catch (error) { lastError = error; }
        }
        throw lastError || new Error("World geometry unavailable");
      })().catch((error) => { cache.geoPromise = null; throw error; });
    }
    state.geo = await cache.geoPromise;
    return state.geo;
  }

  function featureIso(feature) {
    const properties = feature?.properties || {};
    return String(properties.ISO_A3 || properties.iso_a3 || properties.ADM0_A3 || properties.adm0_a3 || properties.sov_a3 || "").toUpperCase();
  }

  function geoBounds(features) {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    const scan = (coordinates) => {
      if (!Array.isArray(coordinates)) return;
      if (typeof coordinates[0] === "number") {
        const [lon, lat] = coordinates;
        if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) return;
        minLon = Math.min(minLon, lon); minLat = Math.min(minLat, lat); maxLon = Math.max(maxLon, lon); maxLat = Math.max(maxLat, lat);
      } else coordinates.forEach(scan);
    };
    features.forEach((feature) => scan(feature.geometry?.coordinates));
    return { minLon, minLat, maxLon, maxLat };
  }

  function geoPath(geometry, width, height, bounds) {
    const project = (lon, lat) => {
      const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
      const mercatorLat = Math.log(Math.tan(Math.PI / 4 + clamp(lat, -84, 84) * Math.PI / 360));
      const minMercator = Math.log(Math.tan(Math.PI / 4 + clamp(bounds.minLat, -84, 84) * Math.PI / 360));
      const maxMercator = Math.log(Math.tan(Math.PI / 4 + clamp(bounds.maxLat, -84, 84) * Math.PI / 360));
      const y = height - ((mercatorLat - minMercator) / (maxMercator - minMercator)) * height;
      return [x, y];
    };
    const ring = (points) => points.map((point, index) => {
      const [x, y] = project(point[0], point[1]);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join("") + "Z";
    if (!geometry) return "";
    if (geometry.type === "Polygon") return geometry.coordinates.map(ring).join("");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon) => polygon.map(ring)).join("");
    return "";
  }

  function quantiles(values, bins = 7) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return [];
    return Array.from({ length: bins - 1 }, (_, index) => {
      const position = ((index + 1) / bins) * (sorted.length - 1);
      const lower = Math.floor(position), upper = Math.ceil(position), fraction = position - lower;
      return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
    });
  }

  function mapBin(value, thresholds) {
    if (num(value) == null) return -1;
    let index = 0;
    while (index < thresholds.length && Number(value) > thresholds[index]) index += 1;
    return index;
  }

  function mapMetricControls() {
    return `<div class="etx-segmented etx-map-metric" role="group" aria-label="${esc(tr("mapMetric"))}">${METRICS.map((code) => `<button class="${state.mapMetric === code ? "is-active" : ""}" data-etx-action="map-metric" data-metric="${code}" aria-pressed="${state.mapMetric === code}"><span>${code}</span><b>${esc(metricName(code))}</b></button>`).join("")}</div>`;
  }

  function mapChartMarkup() {
    const features = state.geo?.features || [];
    if (!features.length) return `<div class="etx-map-loading">${esc(tr("loadingText"))}</div>`;
    const width = 1120, height = 590;
    const bounds = geoBounds(features);
    const values = (state.base?.rows || []).map((row) => metricScore(row, state.mapMetric)).filter((value) => value != null);
    const thresholds = quantiles(values, 7);
    const geoIso = new Set(features.map(featureIso));
    const paths = features.map((feature) => {
      const iso3 = featureIso(feature);
      const row = countryRow(iso3);
      const value = metricScore(row, state.mapMetric);
      const bin = mapBin(value, thresholds);
      const selected = iso3 === state.country;
      const label = row ? `${localName(row)} · ${metricName(state.mapMetric)} ${fmt(value, 1)} · #${metricRank(row, state.mapMetric)}` : `${feature.properties?.name || iso3} · ${tr("noData")}`;
      return `<path d="${geoPath(feature.geometry, width, height, bounds)}" class="etx-map-country ${bin >= 0 ? `map-bin-${bin}` : "is-no-data"} ${selected ? "is-selected" : ""}" ${row ? `tabindex="0" role="button" data-etx-action="country" data-iso="${iso3}"` : ""} aria-label="${esc(label)}"><title>${esc(label)}</title></path>`;
    }).join("");
    const project = (lon, lat) => {
      const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
      const mercatorLat = Math.log(Math.tan(Math.PI / 4 + clamp(lat, -84, 84) * Math.PI / 360));
      const minMercator = Math.log(Math.tan(Math.PI / 4 + clamp(bounds.minLat, -84, 84) * Math.PI / 360));
      const maxMercator = Math.log(Math.tan(Math.PI / 4 + clamp(bounds.maxLat, -84, 84) * Math.PI / 360));
      const y = height - ((mercatorLat - minMercator) / (maxMercator - minMercator)) * height;
      return [x, y];
    };
    const markerRows = (state.base?.rows || []).filter((row) => !geoIso.has(row.iso3) && ISLAND_CENTROIDS[row.iso3]);
    const markers = markerRows.map((row) => {
      const [x, y] = project(...ISLAND_CENTROIDS[row.iso3]);
      const bin = mapBin(metricScore(row, state.mapMetric), thresholds);
      const selected = row.iso3 === state.country;
      const label = `${localName(row)} · ${metricName(state.mapMetric)} ${fmt(metricScore(row, state.mapMetric), 1)} · ${tr("noGeometry")}`;
      return `<g class="etx-map-marker map-bin-${bin} ${selected ? "is-selected" : ""}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" tabindex="0" role="button" data-etx-action="country" data-iso="${row.iso3}" aria-label="${esc(label)}"><circle r="${selected ? 8 : 4.5}"></circle>${selected ? `<circle class="etx-map-marker-pulse" r="13"></circle>` : ""}<title>${esc(label)}</title></g>`;
    }).join("");
    const selected = countryRow();
    const selectedFeature = features.find((feature) => featureIso(feature) === selected?.iso3);
    let selectedLabel = "";
    if (selectedFeature) {
      const coordinates = [];
      const collect = (items) => {
        if (!Array.isArray(items)) return;
        if (typeof items[0] === "number") coordinates.push(items);
        else items.forEach(collect);
      };
      collect(selectedFeature.geometry?.coordinates);
      const lon = mean(coordinates.map((point) => point[0]));
      const lat = mean(coordinates.map((point) => point[1]));
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        const [x, y] = project(lon, lat);
        selectedLabel = `<g class="etx-map-callout" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><rect x="-36" y="-34" width="72" height="25" rx="12"/><text y="-17" text-anchor="middle">${selected.iso3} · ${fmt(metricScore(selected, state.mapMetric), 1)}</text><path d="M-5 -9L0 0l5-9Z"/></g>`;
      }
    }
    const min = Math.min(...values), max = Math.max(...values);
    return `<div class="etx-map-shell">
      <div class="etx-map-visual"><svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="etxMapTitle etxMapDesc"><title id="etxMapTitle">${esc(tr("mapTitle"))}</title><desc id="etxMapDesc">${esc(tr("mapText"))}</desc><g class="etx-map-graticule">${Array.from({ length: 11 }, (_, index) => `<path d="M${index * width / 10} 0V${height}"/>`).join("")}${Array.from({ length: 6 }, (_, index) => `<path d="M0 ${index * height / 5}H${width}"/>`).join("")}</g><g class="etx-map-land">${paths}</g><g class="etx-map-markers">${markers}</g>${selectedLabel}</svg></div>
      <div class="etx-map-legend"><span>${esc(tr("low"))} · ${esc(fmt(min, 1))}</span><i>${Array.from({ length: 7 }, (_, index) => `<b class="map-bin-${index}"></b>`).join("")}</i><span>${esc(tr("high"))} · ${esc(fmt(max, 1))}</span></div>
    </div>`;
  }

  function mapTableMarkup() {
    const rows = [...(state.base?.rows || [])].sort((a, b) => metricRank(a, state.mapMetric) - metricRank(b, state.mapMetric));
    return `<details class="etx-map-table"><summary>${icon("list")}${esc(tr("mapTable"))}<span>${rows.length}</span></summary><div><table><thead><tr><th>${esc(tr("place"))}</th><th>${esc(tr("countryColumn"))}</th><th>${esc(tr("scoreColumn"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>#${metricRank(row, state.mapMetric)}</td><td><button data-etx-action="country" data-iso="${row.iso3}">${flag(row)}<span>${esc(localName(row))}<small>${row.iso3}</small></span></button></td><td>${fmt(metricScore(row, state.mapMetric), 1)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function mapMarkup() {
    const mapped = (state.base?.rows || []).length;
    const selected = countryRow();
    const metric = state.mapMetric;
    const action = `<div class="etx-map-actions"><span class="etx-map-count">${icon("globe")}<b>${mapped}</b> ${esc(tr("mappedCountries"))}</span>${mapMetricControls()}</div>`;
    return `<section class="etx-section" id="etx-map">${sectionHeader(tr("mapKicker"), tr("mapTitle"), tr("mapText"), action)}<div class="etx-map-selected"><div>${flag(selected, "large")}<span><small>${esc(metricName(metric))}</small><strong>${esc(localName(selected))}</strong></span></div><b>${fmt(metricScore(selected, metric), 1)}</b><span>#${metricRank(selected, metric)} · ${metric === "ETI" ? tr("officialRank") : tr("derivedRank")}</span></div>${mapChartMarkup()}${mapTableMarkup()}</section>`;
  }

  function radarMarkup(rows) {
    const width = 620, height = 480, cx = width / 2, cy = 232, radius = 170;
    const axes = [
      { code: "ETI", angle: -Math.PI / 2 },
      { code: "SP", angle: -Math.PI / 2 + 2 * Math.PI / 3 },
      { code: "TR", angle: -Math.PI / 2 + 4 * Math.PI / 3 },
    ];
    const point = (code, value, scale = 1) => {
      const axis = axes.find((item) => item.code === code);
      const normalized = clamp((num(value) || 0) / 100, 0, 1) * radius * scale;
      return [cx + Math.cos(axis.angle) * normalized, cy + Math.sin(axis.angle) * normalized];
    };
    const rings = [0.25, 0.5, 0.75, 1].map((scale) => `<polygon points="${axes.map((axis) => point(axis.code, 100, scale).join(",")).join(" ")}"/>`).join("");
    const axisLines = axes.map((axis) => {
      const [x, y] = point(axis.code, 100);
      const [lx, ly] = point(axis.code, 118);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><text x="${lx}" y="${ly + (axis.code === "ETI" ? -4 : 5)}" text-anchor="middle">${esc(axis.code === "ETI" ? tr("score") : axis.code === "SP" ? tr("systemPerformance") : tr("transitionReadiness"))}</text>`;
    }).join("");
    const polygons = rows.map((row, index) => {
      const values = { ETI: row.score, SP: row.system_performance_score, TR: row.transition_readiness_score };
      const points = axes.map((axis) => point(axis.code, values[axis.code]).join(",")).join(" ");
      return `<g class="etx-radar-series series-${index + 1}"><polygon points="${points}"/><circle cx="${point("ETI", values.ETI)[0]}" cy="${point("ETI", values.ETI)[1]}" r="4"/><circle cx="${point("SP", values.SP)[0]}" cy="${point("SP", values.SP)[1]}" r="4"/><circle cx="${point("TR", values.TR)[0]}" cy="${point("TR", values.TR)[1]}" r="4"/></g>`;
    }).join("");
    return `<div class="etx-radar"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("peersTitle"))}"><g class="etx-radar-grid">${rings}${axisLines}</g>${polygons}</svg></div>`;
  }

  function compareRows() {
    const unique = [...new Set([state.country, ...state.compare])].slice(0, 4);
    return unique.map((iso3) => countryRow(iso3)).filter(Boolean);
  }

  function compareCard(row, index) {
    const selected = row.iso3 === state.country;
    return `<article class="etx-compare-card series-${index + 1} ${selected ? "is-selected" : ""}"><header>${flag(row)}<div><strong>${esc(localName(row))}</strong><span>${esc(localGroup(row))}</span></div>${!selected ? `<button data-etx-action="remove-compare" data-iso="${row.iso3}" aria-label="${esc(`${tr("remove")} ${localName(row)}`)}">${icon("close")}</button>` : `<i>${esc(tr("selectedCountry"))}</i>`}</header><div class="etx-compare-score"><b>${fmt(row.score, 1)}</b><span>#${row.rank}</span></div><dl><div><dt>SP</dt><dd>${fmt(row.system_performance_score, 1)}</dd></div><div><dt>TR</dt><dd>${fmt(row.transition_readiness_score, 1)}</dd></div><div><dt>${esc(tr("gapShort"))}</dt><dd>${signed(row.balance_gap, 1)}</dd></div></dl></article>`;
  }

  function groupBenchmarksMarkup() {
    const groups = [...(state.base?.groups?.groups || [])].sort((a, b) => GROUP_ORDER.indexOf(a.code) - GROUP_ORDER.indexOf(b.code));
    const max = Math.max(...groups.map((group) => group.averages?.ETI || 0), 1);
    return `<div class="etx-group-benchmarks"><header><span>${icon("globe")}${esc(tr("groupBenchmark"))}</span></header>${groups.map((group) => `<article class="${GROUP_CLASS[group.code] || "group-0"}"><div><i></i><span><strong>${esc(state.lang === "ru" ? group.name_ru : group.name_en)}</strong><small>${group.countries} ${esc(tr("countries"))} · ${esc(tr("groupLeader"))}: ${esc(localName(group.leader))}</small></span></div><div class="etx-group-score"><b>${fmt(group.averages?.ETI, 1)}</b><i><span style="width:${clamp(group.averages?.ETI / max * 100, 0, 100)}%"></span></i></div></article>`).join("")}</div>`;
  }

  function peersMarkup() {
    const rows = compareRows();
    const available = (state.base?.rows || []).filter((row) => !rows.some((item) => item.iso3 === row.iso3)).sort((a, b) => localName(a).localeCompare(localName(b), locale()));
    const addControl = `<div class="etx-compare-add"><label><span>${esc(tr("addCountry"))}</span><select id="etxCompareCountry" ${rows.length >= 4 ? "disabled" : ""}>${available.map((row) => `<option value="${row.iso3}">${esc(localName(row))} · ${row.iso3}</option>`).join("")}</select></label><button class="etx-button" data-etx-action="add-compare" ${rows.length >= 4 ? "disabled" : ""}>${icon("plus")}${esc(tr("add"))}</button></div>`;
    return `<section class="etx-section" id="etx-peers">${sectionHeader(tr("peersKicker"), tr("peersTitle"), tr("peersText"), addControl)}<div class="etx-peers-layout"><div class="etx-radar-panel">${radarMarkup(rows)}<div class="etx-radar-legend">${rows.map((row, index) => `<button class="series-${index + 1}" data-etx-action="country" data-iso="${row.iso3}"><i></i>${esc(localName(row))}</button>`).join("")}</div></div><div class="etx-compare-grid">${rows.map(compareCard).join("")}</div></div>${groupBenchmarksMarkup()}</section>`;
  }

  function filteredRankingRows() {
    const query = state.rankingQuery.trim().toLocaleLowerCase(locale());
    let rows = [...(state.base?.rows || [])];
    if (state.rankingGroup) rows = rows.filter((row) => row.group?.code === state.rankingGroup);
    if (query) rows = rows.filter((row) => [row.iso3, row.name_en, row.name_ru, row.group?.name_en, row.group?.name_ru].some((value) => String(value || "").toLocaleLowerCase(locale()).includes(query)));
    const field = state.rankingSort;
    const direction = state.rankingOrder === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      let av, bv;
      if (field === "rank") { av = metricRank(a, state.rankingMetric); bv = metricRank(b, state.rankingMetric); }
      else if (field === "group_rank") { av = metricGroupRank(a, state.rankingMetric); bv = metricGroupRank(b, state.rankingMetric); }
      else if (field === "score") { av = metricScore(a, state.rankingMetric); bv = metricScore(b, state.rankingMetric); }
      else if (field === "country") { return localName(a).localeCompare(localName(b), locale()) * direction; }
      else if (field === "group") { return localGroup(a).localeCompare(localGroup(b), locale()) * direction || localName(a).localeCompare(localName(b), locale()); }
      else { av = num(a[field]); bv = num(b[field]); }
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (Number(av) - Number(bv)) * direction || localName(a).localeCompare(localName(b), locale());
    });
    return rows;
  }

  function sortButton(label, field) {
    const active = state.rankingSort === field;
    return `<button data-etx-action="sort" data-field="${field}" class="${active ? "is-active" : ""}">${esc(label)}<span>${active ? (state.rankingOrder === "asc" ? "↑" : "↓") : "↕"}</span></button>`;
  }

  function rankBadge(row) {
    const rank = metricRank(row, state.rankingMetric);
    const official = state.rankingMetric === "ETI";
    return `<div class="etx-rank"><strong>#${rank}</strong><span class="${official ? "is-official" : "is-derived"}">${esc(official ? tr("rankOfficialBadge") : tr("rankDerivedBadge"))}</span></div>`;
  }

  function rankingTableMarkup(rows) {
    return `<div class="etx-ranking-table-wrap"><table class="etx-ranking-table"><thead><tr><th>${sortButton(tr("place"), "rank")}</th><th>${sortButton(tr("countryColumn"), "country")}</th><th>${sortButton(tr("groupColumn"), "group")}</th><th>${sortButton(tr("scoreColumn"), "score")}</th><th>${sortButton(tr("spShort"), "system_performance_score")}</th><th>${sortButton(tr("trShort"), "transition_readiness_score")}</th><th>${sortButton(tr("gapShort"), "balance_gap")}</th><th><span>${esc(tr("action"))}</span></th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.iso3 === state.country ? "is-selected" : ""}"><td>${rankBadge(row)}</td><td><button class="etx-country-cell" data-etx-action="country" data-iso="${row.iso3}">${flag(row)}<span><strong>${esc(localName(row))}</strong><small>${row.iso3}</small></span></button></td><td><span class="etx-group-cell ${GROUP_CLASS[row.group?.code] || "group-0"}"><i></i><span>${esc(localGroup(row))}<small>#${metricGroupRank(row, state.rankingMetric)} ${esc(state.lang === "ru" ? "в группе" : "in group")}</small></span></span></td><td><strong class="etx-score-cell">${fmt(metricScore(row, state.rankingMetric), 1)}</strong><small class="etx-percentile">P${fmt(metricPercentile(row, state.rankingMetric), 0)}</small></td><td>${fmt(row.system_performance_score, 1)}</td><td>${fmt(row.transition_readiness_score, 1)}</td><td class="${row.balance_gap > 0 ? "is-positive" : row.balance_gap < 0 ? "is-negative" : ""}">${signed(row.balance_gap, 1)}</td><td><button class="etx-open-button" data-etx-action="country" data-iso="${row.iso3}">${esc(tr("open"))}${icon("arrow")}</button></td></tr>`).join("")}</tbody></table></div>`;
  }

  function rankingCardsMarkup(rows) {
    return `<div class="etx-ranking-cards">${rows.map((row) => `<article class="${row.iso3 === state.country ? "is-selected" : ""}"><header>${rankBadge(row)}${flag(row, "large")}<div><strong>${esc(localName(row))}</strong><span>${row.iso3} · ${esc(localGroup(row))}</span></div><b>${fmt(metricScore(row, state.rankingMetric), 1)}</b></header><div><span>SP <strong>${fmt(row.system_performance_score, 1)}</strong></span><span>TR <strong>${fmt(row.transition_readiness_score, 1)}</strong></span><span>${esc(tr("gapShort"))} <strong>${signed(row.balance_gap, 1)}</strong></span><span>${esc(tr("groupRank"))} <strong>#${metricGroupRank(row, state.rankingMetric)}</strong></span></div><button data-etx-action="country" data-iso="${row.iso3}">${esc(tr("open"))}${icon("arrow")}</button></article>`).join("")}</div>`;
  }

  function paginationMarkup(total) {
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    state.page = clamp(state.page, 1, pages);
    const start = (state.page - 1) * state.pageSize + (total ? 1 : 0);
    const end = Math.min(total, state.page * state.pageSize);
    return `<div class="etx-pagination"><span>${start}–${end} · ${total} ${esc(tr("records"))}</span><div><button data-etx-action="page" data-page="${state.page - 1}" ${state.page <= 1 ? "disabled" : ""}>${icon("arrow", "is-back")}${esc(tr("previous"))}</button><b>${esc(tr("page"))} ${state.page} ${esc(tr("of"))} ${pages}</b><button data-etx-action="page" data-page="${state.page + 1}" ${state.page >= pages ? "disabled" : ""}>${esc(tr("next"))}${icon("arrow")}</button></div></div>`;
  }

  function rankingMarkup() {
    const allRows = filteredRankingRows();
    const pages = Math.max(1, Math.ceil(allRows.length / state.pageSize));
    state.page = clamp(state.page, 1, pages);
    const pageRows = allRows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    const actions = `<div class="etx-ranking-actions"><label><span>${esc(tr("metric"))}</span><select id="etxRankingMetric">${metricOptions(state.rankingMetric)}</select></label><label><span>${esc(tr("group"))}</span><select id="etxRankingGroup">${groupOptions(state.rankingGroup)}</select></label><label class="etx-search-field"><span>${esc(tr("search"))}</span><i>${icon("search")}</i><input id="etxRankingSearch" type="search" value="${esc(state.rankingQuery)}" placeholder="${esc(tr("searchCountry"))}" autocomplete="off"></label><label><span>${esc(tr("rows"))}</span><select id="etxPageSize">${[10, 25, 50, 120].map((size) => `<option value="${size}" ${state.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label><button class="etx-button etx-button--export" data-etx-action="export">${icon("download")}${esc(tr("exportCsv"))}</button></div>`;
    const note = state.rankingMetric === "ETI" ? tr("rankingOfficialNote") : tr("rankingDerivedNote");
    return `<section class="etx-section" id="etx-ranking">${sectionHeader(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"))}<div class="etx-ranking-toolbar">${actions}<div class="etx-rank-note ${state.rankingMetric === "ETI" ? "is-official" : "is-derived"}">${icon("info")}<span>${esc(note)}</span><b>${esc(state.rankingMetric === "ETI" ? tr("rankOfficialBadge") : tr("rankDerivedBadge"))}</b></div></div>${pageRows.length ? `${rankingTableMarkup(pageRows)}${rankingCardsMarkup(pageRows)}${paginationMarkup(allRows.length)}` : `<div class="etx-empty">${icon("search")}<p>${esc(tr("noRows"))}</p></div>`}</section>`;
  }

  function componentScore(code) {
    const row = countryRow();
    if (code === "ETI") return row?.score;
    if (code === "SP") return row?.system_performance_score;
    if (code === "TR") return row?.transition_readiness_score;
    return null;
  }

  function methodNode(node, depth = 0) {
    const children = node.children || [];
    const name = state.lang === "ru" ? (node.name_ru || node.name_en || node.code) : (node.name_en || node.code);
    const description = state.lang === "ru" ? (node.description_ru || node.description_en || "") : (node.description_en || "");
    const score = componentScore(node.code);
    const hasScore = score != null;
    const weight = num(node.weight_within_parent);
    const open = depth < 2 ? "open" : "";
    const header = `<div class="etx-method-node__head"><span class="etx-method-code">${esc(node.code)}</span><div><strong>${esc(name)}</strong>${description ? `<small>${esc(description)}</small>` : ""}</div>${weight != null ? `<em>${fmt(weight * 100, 1)}%</em>` : ""}<span class="etx-method-data ${hasScore ? "is-available" : "is-method"}">${hasScore ? `${fmt(score, 1)} · ${tr("scoreAvailable")}` : tr("methodologyOnly")}</span></div>`;
    if (!children.length) return `<article class="etx-method-leaf level-${esc(node.level)}">${header}</article>`;
    return `<details class="etx-method-node level-${esc(node.level)}" ${open}><summary>${header}</summary><div class="etx-method-children">${children.map((child) => methodNode(child, depth + 1)).join("")}</div></details>`;
  }

  function officialLinksMarkup() {
    const urls = state.base?.provenance?.dataset?.official_urls || {};
    const items = [
      [tr("publication"), urls.publication],
      [tr("framework"), urls.framework],
      [tr("appendices"), urls.appendices],
    ].filter(([, url]) => url);
    return `<div class="etx-official-links"><span>${esc(tr("officialMaterials"))}</span>${items.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}${icon("external")}</a>`).join("")}</div>`;
  }

  function methodMarkup() {
    const root = state.base?.hierarchy?.hierarchy;
    const components = state.base?.components || {};
    return `<section class="etx-section" id="etx-method">${sectionHeader(tr("methodKicker"), tr("methodTitle"), tr("methodText"), `<button class="etx-button etx-button--primary" data-etx-action="evidence">${icon("database")}${esc(tr("dataPassport"))}</button>`)}<div class="etx-method-stats"><article><span>${esc(tr("activeIndicators"))}</span><strong>${components.active_indicators || 44}</strong><small>ETI 2026</small></article><article><span>${esc(tr("systemIndicators"))}</span><strong>22</strong><small>System Performance</small></article><article><span>${esc(tr("readinessIndicators"))}</span><strong>22</strong><small>Transition Readiness</small></article><article><span>${esc(tr("newIndicators"))}</span><strong>2</strong><small>${esc(tr("newAi"))} · ${esc(tr("newMinerals"))}</small></article></div><div class="etx-method-layout"><div class="etx-method-tree">${root ? methodNode(root) : ""}</div><aside class="etx-method-notes"><article>${icon("info")}<div><h3>${esc(tr("comparabilityTitle"))}</h3><p>${esc(tr("comparabilityText"))}</p></div></article><article>${icon("globe")}<div><h3>${esc(tr("officialTranslationNotice"))}</h3><p>${esc(tr("methodText"))}</p></div></article><article class="is-license">${icon("shield")}<div><h3>${esc(tr("licenseTitle"))}</h3><p>${esc(tr("licenseText"))}</p></div></article>${officialLinksMarkup()}</aside></div></section>`;
  }

  function evidenceRow(label, value, mono = false, action = "") {
    return `<div class="etx-evidence-row"><span>${esc(label)}</span><div class="${mono ? "is-mono" : ""}">${esc(value ?? "—")}${action}</div></div>`;
  }

  function evidenceMarkup() {
    const provenance = state.base?.provenance || {};
    const dataset = provenance.dataset || {};
    const runtime = provenance.runtime || {};
    const release = state.base?.release?.release || {};
    const contract = state.base?.frontend_contract || {};
    const files = dataset.files || [];
    const staticManifest = state.base?.static_manifest;
    const datasetHash = runtime.dataset_sha256 || state.base?.dataset_sha256 || "—";
    const staticHash = staticManifest?.core?.sha256 || "—";
    const contractRows = [
      [tr("rankPreserved"), contract.official_eti_rank_preserved !== false],
      [tr("scoresNotRecomputed"), contract.scores_recomputed === false],
      [tr("noSplice"), contract.release_spliced === false],
      [tr("noZeroFill"), dataset.integrity?.nulls_coerced_to_zero === false],
      [tr("lowerScoresNull"), contract.missing_component_scores_are_null !== false],
      [tr("translationUnofficial"), dataset.integrity?.country_names_ru_are_gir_localization_not_official_wef_translation === true],
    ];
    return `<div class="etx-dialog-backdrop" data-etx-action="close-evidence"></div><aside class="etx-evidence-panel" role="dialog" aria-modal="true" aria-labelledby="etxEvidenceTitle"><header><div><p>${esc(tr("evidenceKicker"))}</p><h2 id="etxEvidenceTitle">${esc(tr("evidenceTitle"))}</h2></div><button data-etx-action="close-evidence" aria-label="${esc(tr("close"))}">${icon("close")}</button></header><div class="etx-evidence-body"><section>${evidenceRow(tr("dataset"), dataset.dataset_id || state.base?.dataset_id, true)}${evidenceRow(tr("edition"), dataset.edition || release.edition || 2026)}${evidenceRow(tr("publicationDate"), dataset.published_at || release.published_at || "2026-06-18")}${evidenceRow(tr("coverage"), `${dataset.coverage?.countries || 120} ${tr("countries")} · ${dataset.coverage?.active_indicators || 44} ${tr("activeIndicators").toLocaleLowerCase(locale())}`)}${evidenceRow(tr("provider"), state.providerMode === "api" ? tr("apiMode") : tr("staticMode"))}${evidenceRow(tr("checksum"), datasetHash, true, `<button data-etx-action="copy-hash" data-value="${esc(datasetHash)}">${icon("copy")}${esc(tr("copy"))}</button>`)}${evidenceRow(tr("staticChecksum"), staticHash, true, staticHash !== "—" ? `<button data-etx-action="copy-hash" data-value="${esc(staticHash)}">${icon("copy")}${esc(tr("copy"))}</button>` : "")}</section><section><h3>${esc(tr("files"))}</h3><div class="etx-file-list">${files.map((file) => `<article><div>${icon("database")}<span><strong>${esc(file.path)}</strong><small>${esc(file.role)}</small></span></div><b>${Number(file.bytes || 0).toLocaleString(locale())} ${esc(tr("bytes"))}</b><code>${esc(file.sha256)}</code></article>`).join("")}</div></section><section><h3>${esc(tr("scientificContract"))}</h3><div class="etx-contract-grid">${contractRows.map(([label, passed]) => `<article class="${passed ? "is-pass" : "is-fail"}">${icon(passed ? "check" : "close")}<span>${esc(label)}</span><b>${esc(passed ? tr("yes") : tr("no"))}</b></article>`).join("")}</div></section><section class="etx-evidence-warning"><article>${icon("info")}<div><h3>${esc(tr("comparabilityTitle"))}</h3><p>${esc(tr("comparabilityText"))}</p></div></article><article>${icon("shield")}<div><h3>${esc(tr("licenseTitle"))}</h3><p>${esc(tr("licenseText"))}</p></div></article></section>${officialLinksMarkup()}</div><footer><span>${providerPill()}</span><button class="etx-button etx-button--primary" data-etx-action="close-evidence">${esc(tr("close"))}</button></footer></aside>`;
  }

  function workspaceMarkup() {
    return `<div class="etx-workspace index-workspace gir-native-workspace" data-gir-design="native-06r" data-provider="${esc(state.providerMode)}">${exclusionMarkup()}${heroMarkup()}${jumpNavMarkup()}${cockpitMarkup()}${matrixMarkup()}${mapMarkup()}${peersMarkup()}${rankingMarkup()}${methodMarkup()}<div id="etxDialog"></div><div class="etx-live" id="etxLive" aria-live="polite" aria-atomic="true"></div></div>`;
  }

  function renderWorkspace(anchor = "") {
    if (!state.root) return;
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
    document.documentElement.dataset.etiReady = "true";
    window.__GIR_ETI_READY__ = true;
    if (anchor) requestAnimationFrame(() => state.root.querySelector(anchor)?.scrollIntoView({ block: "start" }));
  }

  function announce(message) {
    const live = state.root?.querySelector("#etxLive");
    if (!live) return;
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = message; });
  }

  function selectCountry(iso3, anchor = "#etx-top") {
    const code = String(iso3 || "").toUpperCase();
    if (!countryRow(code)) return;
    state.country = code;
    state.excludedCountry = "";
    state.context.onCountryChange?.(code);
    if (!state.compare.includes(code)) state.compare = [code, ...state.compare].slice(0, 4);
    writeUrl();
    renderWorkspace(anchor);
  }

  function csvExport() {
    const rows = filteredRankingRows();
    const fields = ["rank", "rank_source", "iso3", "iso2", "name_en", "name_ru", "group_code", "group_en", "group_ru", "group_rank", "metric", "score", "system_performance", "transition_readiness", "balance_gap", "percentile_derived", "edition"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const body = [fields.join(","), ...rows.map((row) => [
      metricRank(row, state.rankingMetric), state.rankingMetric === "ETI" ? "official_wef" : "derived_gir", row.iso3, row.iso2,
      row.name_en, row.name_ru, row.group?.code, row.group?.name_en, row.group?.name_ru, metricGroupRank(row, state.rankingMetric), state.rankingMetric,
      metricScore(row, state.rankingMetric), row.system_performance_score, row.transition_readiness_score, row.balance_gap,
      metricPercentile(row, state.rankingMetric), 2026,
    ].map(quote).join(","))].join("\n");
    const blob = new Blob(["\ufeff", body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `wef-eti-2026-${state.rankingMetric.toLowerCase()}-ranking.csv`; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function openEvidence(trigger) {
    state.dialogReturn = trigger || document.activeElement;
    const host = state.root.querySelector("#etxDialog");
    host.innerHTML = evidenceMarkup();
    document.body.classList.add("etx-dialog-open");
    requestAnimationFrame(() => host.querySelector(".etx-evidence-panel > header button")?.focus());
  }

  function closeEvidence() {
    const host = state.root?.querySelector("#etxDialog");
    if (host) host.innerHTML = "";
    document.body.classList.remove("etx-dialog-open");
    const target = state.dialogReturn; state.dialogReturn = null;
    if (target?.focus && target.isConnected) target.focus();
  }

  function rerenderSection(selector, markup) {
    const current = state.root?.querySelector(selector);
    if (!current) return renderWorkspace();
    const wrapper = document.createElement("div"); wrapper.innerHTML = markup;
    current.replaceWith(wrapper.firstElementChild);
    bindWorkspace();
  }

  function handleChange(event) {
    const target = event.target;
    if (target.id === "etxCountry") return selectCountry(target.value);
    if (target.id === "etxMatrixGroup") { state.matrixGroup = target.value; writeUrl(); return rerenderSection("#etx-matrix", matrixMarkup()); }
    if (target.id === "etxRankingMetric") { state.rankingMetric = target.value; state.page = 1; writeUrl(); return rerenderSection("#etx-ranking", rankingMarkup()); }
    if (target.id === "etxRankingGroup") { state.rankingGroup = target.value; state.page = 1; writeUrl(); return rerenderSection("#etx-ranking", rankingMarkup()); }
    if (target.id === "etxPageSize") { state.pageSize = Number(target.value); state.page = 1; return rerenderSection("#etx-ranking", rankingMarkup()); }
  }

  function handleInput(event) {
    if (event.target.id !== "etxRankingSearch") return;
    state.rankingQuery = event.target.value;
    state.page = 1;
    rerenderSection("#etx-ranking", rankingMarkup());
    const input = state.root?.querySelector("#etxRankingSearch");
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }

  async function handleAction(event) {
    const control = event.target.closest("[data-etx-action]");
    if (!control) return;
    const action = control.dataset.etxAction;
    if (["BUTTON", "A"].includes(control.tagName)) event.preventDefault();
    if (action === "country") return selectCountry(control.dataset.iso, control.closest("section")?.id ? `#${control.closest("section").id}` : "#etx-top");
    if (action === "jump") return state.root.querySelector(`#${CSS.escape(control.dataset.target)}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (action === "map-metric") { state.mapMetric = control.dataset.metric; writeUrl(); return rerenderSection("#etx-map", mapMarkup()); }
    if (action === "copy-link") { writeUrl(); await navigator.clipboard?.writeText?.(location.href); return announce(tr("copied")); }
    if (action === "evidence") return openEvidence(control);
    if (action === "close-evidence") return closeEvidence();
    if (action === "copy-hash") { await navigator.clipboard?.writeText?.(control.dataset.value || ""); return announce(tr("copiedHash")); }
    if (action === "export") return csvExport();
    if (action === "retry") { cache.basePromise = null; cache.staticPromise = null; state.base = null; return render(state.context); }
    if (action === "add-compare") {
      const select = state.root.querySelector("#etxCompareCountry");
      if (select?.value && state.compare.length < 4 && !state.compare.includes(select.value)) state.compare = [...state.compare, select.value].slice(0, 4);
      writeUrl(); return rerenderSection("#etx-peers", peersMarkup());
    }
    if (action === "remove-compare") {
      state.compare = state.compare.filter((iso3) => iso3 !== control.dataset.iso);
      if (!state.compare.length) state.compare = [state.country];
      writeUrl(); return rerenderSection("#etx-peers", peersMarkup());
    }
    if (action === "sort") {
      const field = control.dataset.field;
      if (state.rankingSort === field) state.rankingOrder = state.rankingOrder === "asc" ? "desc" : "asc";
      else { state.rankingSort = field; state.rankingOrder = ["score", "system_performance_score", "transition_readiness_score", "balance_gap"].includes(field) ? "desc" : "asc"; }
      state.page = 1; return rerenderSection("#etx-ranking", rankingMarkup());
    }
    if (action === "page") { state.page = Number(control.dataset.page); return rerenderSection("#etx-ranking", rankingMarkup()); }
  }

  function handleKeydown(event) {
    const control = event.target.closest("[data-etx-action]");
    if (control && !["BUTTON", "A"].includes(control.tagName) && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); handleAction({ target: control, preventDefault() {} }); return; }
    const panel = state.root?.querySelector(".etx-evidence-panel");
    if (!panel) return;
    if (event.key === "Escape") { event.preventDefault(); closeEvidence(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex='-1'])")].filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function bindWorkspace() {
    if (!state.root) return;
    state.root.onclick = handleAction;
    state.root.onchange = handleChange;
    state.root.oninput = handleInput;
    state.root.onkeydown = handleKeydown;
    state.root.querySelectorAll(".etx-flag img").forEach((image) => {
      image.onerror = () => { image.parentElement?.classList.add("is-fallback"); image.remove(); };
    });
  }

  async function render(context = {}) {
    state.context = context;
    state.root = context.root || document.querySelector("#view");
    if (!state.root) return;
    state.lang = context.lang === "en" ? "en" : "ru";
    state.theme = context.theme === "light" ? "light" : "dark";
    state.country = String(new URLSearchParams(location.search).get("country") || context.country || "").toUpperCase();
    if (!state.country) return;
    readUrl();
    state.root.innerHTML = loadingMarkup();
    document.documentElement.dataset.etiReady = "loading";
    window.__GIR_ETI_READY__ = false;
    try {
      await Promise.all([ensureBase(), ensureGeo()]);
      if (!countryRow(state.country)) {
        state.excludedCountry = state.country;
      } else state.excludedCountry = "";
      state.compare = [...new Set([state.country, ...state.compare])].filter((iso3) => countryRow(iso3)).slice(0, 4);
      if (!state.compare.length) state.compare = [state.country];
      writeUrl();
      renderWorkspace();
    } catch (error) {
      console.error("ETI workspace failed", error);
      document.documentElement.dataset.etiReady = "error";
      state.root.innerHTML = errorMarkup(error);
      bindWorkspace();
    }
  }

  window.GIRETI = { render, _state: state, _cache: cache };
})();
