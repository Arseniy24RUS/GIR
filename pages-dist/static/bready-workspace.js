/* GIR Economy & Finance · World Bank Business Ready workspace
 * Cumulative patch stage 04. No external runtime dependencies.
 */
(() => {
  "use strict";

  const VERSION = "1.4.0";
  const API_BASE = "/api/economy-finance/bready";
  const ROUTE = "index-BREADY";
  const MAX_COMPARE = 6;
  const instances = new WeakMap();
  const instanceRegistry = new Set();
  let sharedGeoPromise = null;
  let sequence = 0;

  const PILLAR_ORDER = ["regulatory_framework", "public_services", "operational_efficiency"];
  const TOPIC_ORDER = [
    "business_entry", "business_location", "utility_services", "labor", "financial_services",
    "international_trade", "taxation", "dispute_resolution", "market_competition", "business_insolvency",
  ];
  const PILLAR_COLORS = {
    regulatory_framework: "var(--br-mint)",
    public_services: "var(--br-blue)",
    operational_efficiency: "var(--br-amber)",
  };
  const SERIES_COLORS = [
    "var(--br-mint)", "var(--br-blue)", "var(--br-amber)",
    "var(--br-violet)", "var(--br-rose)", "var(--br-cyan)",
  ];

  const COPY = {
    ru: {
      group: "Экономика и финансы",
      eyebrow: "Глобальная аналитическая обсерватория",
      title: "Готовность деловой среды",
      subtitle: "World Bank Business Ready · B-READY",
      intro: "Исследуйте, как правила, государственные услуги и фактическая операционная эффективность формируют условия работы компаний на всём жизненном цикле бизнеса.",
      officialSource: "Официальные данные Всемирного банка",
      noAggregate: "Единого итогового балла нет",
      noAggregateShort: "Без общего балла",
      noAggregateText: "B-READY официально публикует отдельные баллы по трём опорам и десяти темам. GIR не сводит их в искусственный рейтинг стран.",
      officialScore: "Официальный балл",
      derivedRank: "Место рассчитано GIR",
      edition: "Редакция",
      economies: "экономика",
      economiesPlural: "экономик",
      pillars: "опоры",
      topics: "тем",
      topicPillarCells: "диагностических срезов",
      overview: "Обзор",
      ranking: "Проводник по баллам",
      matrix: "Матрица",
      compare: "Сравнение",
      methodology: "Методология",
      selectLens: "Аналитический срез",
      scoreType: "Тип балла",
      pillar: "Опора",
      topic: "Тема",
      pillarScore: "Опора",
      topicScore: "Тема",
      topicPillarScore: "Тема × опора",
      regulatoryFramework: "Нормативно-правовая база",
      publicServices: "Государственные услуги",
      operationalEfficiency: "Операционная эффективность",
      businessEntry: "Создание бизнеса",
      businessLocation: "Размещение бизнеса",
      utilityServices: "Коммунальные услуги",
      labor: "Труд",
      financialServices: "Финансовые услуги",
      internationalTrade: "Международная торговля",
      taxation: "Налогообложение",
      disputeResolution: "Разрешение споров",
      marketCompetition: "Рыночная конкуренция",
      businessInsolvency: "Несостоятельность бизнеса",
      dimensionHintPillar: "Сравнение экономик по одной из трёх официальных опор.",
      dimensionHintTopic: "Сравнение экономик по одной из десяти официальных тем.",
      dimensionHintTopicPillar: "Диагностический балл выбранной темы внутри конкретной опоры.",
      selectedDimension: "Выбранный официальный срез",
      mapTitle: "Карта деловой среды",
      mapHelp: "Цвет показывает выбранный официальный балл. Нажмите на экономику, чтобы открыть профиль.",
      mapUnavailable: "Геометрия карты недоступна. Остальные аналитические представления продолжают работать.",
      lower: "Ниже",
      higher: "Выше",
      leader: "Лидер",
      median: "Медиана",
      average: "Среднее",
      coverage: "Покрытие",
      topEconomies: "Лидеры выбранного среза",
      threePillars: "Три опоры B-READY",
      threePillarsText: "Раздельный взгляд на качество правил, доступность публичных сервисов и реальный опыт компаний.",
      businessLifecycle: "Жизненный цикл бизнеса",
      lifecycleText: "Десять тем охватывают путь фирмы от создания и размещения до конкуренции, споров и реорганизации.",
      institutionalGap: "Институциональный разрыв",
      institutionalGapText: "Сопоставление качества правил с публичными услугами и фактической эффективностью.",
      frameworkVsServices: "Правила ↔ услуги",
      frameworkVsEfficiency: "Правила ↔ практика",
      scatterTitle: "Архитектура деловой среды",
      scatterText: "По горизонтали — нормативная база, по вертикали — государственные услуги. Размер точки отражает операционную эффективность.",
      rank: "Место",
      economy: "Экономика",
      score: "Балл",
      percentile: "Процентиль",
      quintile: "Квинтиль",
      scoreChange: "Δ балла",
      rankChange: "Δ места",
      quality: "Качество",
      search: "Найти экономику",
      searchPlaceholder: "Название или ISO3",
      sortBy: "Сортировка",
      byRank: "по месту",
      byScore: "по баллу",
      byGain: "по росту",
      alphabetical: "по названию",
      exportCsv: "CSV",
      copyLink: "Скопировать ссылку",
      copied: "Ссылка скопирована",
      showing: "Показано",
      of: "из",
      noMatches: "По вашему запросу ничего не найдено",
      clearSearch: "Сбросить поиск",
      quintileLabel: "Q",
      quintile1: "Верхний квинтиль",
      quintile2: "Второй квинтиль",
      quintile3: "Средний квинтиль",
      quintile4: "Четвёртый квинтиль",
      quintile5: "Нижний квинтиль",
      matrixTitle: "Диагностическая матрица",
      matrixText: "Выберите экономику и изучите десять тем по трём опорам. Пустая ячейка означает, что официальный источник не публикует этот срез.",
      selectEconomy: "Выберите экономику",
      topicOverall: "Итог темы",
      strongestCells: "Наиболее сильные сочетания",
      attentionCells: "Зоны внимания",
      economyAtlas: "Атлас экономик",
      economyAtlasText: "Сводная тепловая карта тем для быстрого поиска структурных различий.",
      addEconomy: "Добавить экономику",
      add: "Добавить",
      compareHint: "Добавьте от двух до шести экономик. Сравнение строится отдельно по официальным опорам и темам.",
      noCompare: "Для сравнения нужны минимум две экономики",
      profileAcrossTopics: "Профиль по десяти темам",
      pillarComparison: "Сопоставление трёх опор",
      gaps: "Разрывы между правилами и реализацией",
      remove: "Удалить",
      profile: "Профиль экономики",
      close: "Закрыть",
      officialPillars: "Официальные баллы по опорам",
      topicProfile: "Профиль по темам",
      diagnosticMatrix: "Матрица тема × опора",
      strengths: "Сильные стороны",
      constraints: "Зоны внимания",
      sourceNote: "Баллы: World Bank B-READY. Места, процентили, квинтили и разрывы: аналитический расчёт GIR для выбранного официального среза.",
      methodologyIntro: "B-READY оценивает деловую среду через три опоры и десять тем жизненного цикла компании. GIR сохраняет официальную многомерную структуру и не создаёт несуществующий общий балл.",
      whatMeasures: "Что измеряет B-READY",
      officialArchitecture: "Официальная архитектура",
      officialArchitectureText: "Три опоры повторяются в каждой из десяти тем: качество нормативной базы, публичные услуги и операционная эффективность.",
      howRanks: "Как GIR строит ранги",
      howRanksText: "Ранг рассчитывается только внутри явно выбранного официального среза. Используется сортировка по убыванию и соревновательный ранг 1, 2, 2, 4. Это аналитическое представление GIR, а не официальный рейтинг Всемирного банка.",
      whyNoAggregate: "Почему нет общего рейтинга",
      whyNoAggregateText: "Всемирный банк не публикует единый B-READY-балл экономики. Усреднение трёх опор или десяти тем скрыло бы разные институциональные механизмы и создало бы показатель, отсутствующий в источнике.",
      editionComparability: "Сопоставимость редакций",
      editionComparabilityText: "Географический охват и методика B-READY развивались в период поэтапного внедрения. Изменения между редакциями следует интерпретировать с учётом состава экономик и версии методологии.",
      sourceAndProvenance: "Источник и воспроизводимость",
      sourceOwner: "Правообладатель",
      sourceDataset: "Набор данных",
      projectPage: "Страница проекта",
      dataPage: "Страница данных",
      reproducibility: "Пакет воспроизводимости",
      methodologyHandbook: "Методическое руководство",
      license: "Лицензия",
      retrievedAt: "Получено",
      snapshot: "Исходный снимок",
      checksum: "SHA-256",
      parser: "Версия парсера",
      transformation: "Преобразование ранга",
      provenanceLoading: "Проверяем происхождение выпуска…",
      provenanceUnavailable: "Provenance пока недоступен",
      openSource: "Открыть источник",
      notLoadedTitle: "Backend установлен — официальный выпуск B-READY ещё не опубликован в GIR",
      notLoadedText: "Интерфейс готов, но публикационный шлюз не обнаружил подтверждённый набор World Bank B-READY. Числовые результаты появятся только после проверки официального выпуска.",
      loadData: "Загрузить официальный набор",
      commandDownload: "Автоматическая загрузка",
      commandManual: "Импорт локального файла",
      commandStatus: "Проверка состояния",
      copyCommand: "Копировать команду",
      commandCopied: "Команда скопирована",
      emptyStep1: "Скачайте официальный all-data ZIP/XLSX со страницы B-READY или используйте воспроизводимый пакет World Bank.",
      emptyStep2: "Запустите CLI: он проверит три опоры, десять тем, охват, дубли, диапазоны и происхождение.",
      emptyStep3: "После атомарной публикации нажмите «Повторить» — интерфейс откроется без перезапуска приложения.",
      officialLinks: "Официальные материалы",
      networkTitle: "Не удалось получить данные B-READY",
      networkText: "Backend не ответил или вернул некорректный ответ. Другие разделы GIR не затронуты.",
      technicalDetails: "Технические подробности",
      retry: "Повторить",
      loading: "Загружаем официальный выпуск B-READY…",
      loadingRanking: "Загружаем выбранный официальный срез…",
      loadingMatrix: "Строим диагностическую матрицу…",
      loadingCompare: "Формируем сопоставимый профиль…",
      loadingCountry: "Загружаем профиль экономики…",
      valueUnavailable: "Нет данных",
      official: "официальное",
      derived: "расчёт GIR",
      keyboardHint: "Строки открываются клавишами Enter или Пробел.",
      dataPolicy: "Только проверенный официальный выпуск",
      backendReady: "Backend готов",
      tabPanel: "Аналитическая область B-READY",
      liveRegion: "Обновление интерфейса",
      allTopics: "Все темы",
      allPillars: "Все опоры",
      details: "Подробнее",
      previousEdition: "Предыдущая редакция",
      newEconomy: "Нет сопоставимого предыдущего значения",
      points: "п.",
      places: "мест",
      rankUp: "выше",
      rankDown: "ниже",
      stable: "без изменения",
      matrixMissing: "Срез не опубликован",
      selected: "Выбрано",
      clear: "Очистить",
      dataEdition: "Редакция данных",
      methodologyEdition: "Редакция методики",
    },
    en: {
      group: "Economy & finance",
      eyebrow: "Global analytical observatory",
      title: "Business environment readiness",
      subtitle: "World Bank Business Ready · B-READY",
      intro: "Explore how regulations, public services and real-world operational efficiency shape the conditions firms face across the full business life cycle.",
      officialSource: "Official World Bank data",
      noAggregate: "No single aggregate score",
      noAggregateShort: "No overall score",
      noAggregateText: "B-READY officially reports separate scores for three pillars and ten topics. GIR does not collapse them into an artificial country ranking.",
      officialScore: "Official score",
      derivedRank: "Rank calculated by GIR",
      edition: "Edition",
      economies: "economy",
      economiesPlural: "economies",
      pillars: "pillars",
      topics: "topics",
      topicPillarCells: "diagnostic slices",
      overview: "Overview",
      ranking: "Score explorer",
      matrix: "Matrix",
      compare: "Compare",
      methodology: "Methodology",
      selectLens: "Analytical lens",
      scoreType: "Score type",
      pillar: "Pillar",
      topic: "Topic",
      pillarScore: "Pillar",
      topicScore: "Topic",
      topicPillarScore: "Topic × pillar",
      regulatoryFramework: "Regulatory Framework",
      publicServices: "Public Services",
      operationalEfficiency: "Operational Efficiency",
      businessEntry: "Business Entry",
      businessLocation: "Business Location",
      utilityServices: "Utility Services",
      labor: "Labor",
      financialServices: "Financial Services",
      internationalTrade: "International Trade",
      taxation: "Taxation",
      disputeResolution: "Dispute Resolution",
      marketCompetition: "Market Competition",
      businessInsolvency: "Business Insolvency",
      dimensionHintPillar: "Compare economies on one of the three official pillars.",
      dimensionHintTopic: "Compare economies on one of the ten official topics.",
      dimensionHintTopicPillar: "Official diagnostic score for a selected topic within a specific pillar.",
      selectedDimension: "Selected official slice",
      mapTitle: "Business environment map",
      mapHelp: "Color represents the selected official score. Select an economy to open its profile.",
      mapUnavailable: "Map geometry is unavailable. Other analytical views remain operational.",
      lower: "Lower",
      higher: "Higher",
      leader: "Leader",
      median: "Median",
      average: "Average",
      coverage: "Coverage",
      topEconomies: "Leaders in the selected slice",
      threePillars: "The three B-READY pillars",
      threePillarsText: "Separate views of regulatory quality, public-service provision and firms’ real operational experience.",
      businessLifecycle: "Business life cycle",
      lifecycleText: "Ten topics follow firms from entry and location through competition, disputes and reorganization.",
      institutionalGap: "Institutional delivery gap",
      institutionalGapText: "Compare the quality of rules with public services and real operational efficiency.",
      frameworkVsServices: "Rules ↔ services",
      frameworkVsEfficiency: "Rules ↔ practice",
      scatterTitle: "Business environment architecture",
      scatterText: "Regulatory Framework is on the horizontal axis, Public Services on the vertical axis; dot size reflects Operational Efficiency.",
      rank: "Rank",
      economy: "Economy",
      score: "Score",
      percentile: "Percentile",
      quintile: "Quintile",
      scoreChange: "Δ score",
      rankChange: "Δ rank",
      quality: "Quality",
      search: "Find an economy",
      searchPlaceholder: "Name or ISO3",
      sortBy: "Sort",
      byRank: "by rank",
      byScore: "by score",
      byGain: "by gain",
      alphabetical: "alphabetically",
      exportCsv: "CSV",
      copyLink: "Copy link",
      copied: "Link copied",
      showing: "Showing",
      of: "of",
      noMatches: "No results match your query",
      clearSearch: "Clear search",
      quintileLabel: "Q",
      quintile1: "Top quintile",
      quintile2: "Second quintile",
      quintile3: "Middle quintile",
      quintile4: "Fourth quintile",
      quintile5: "Bottom quintile",
      matrixTitle: "Diagnostic matrix",
      matrixText: "Select an economy and explore ten topics across three pillars. An empty cell means that the official source does not publish that slice.",
      selectEconomy: "Select an economy",
      topicOverall: "Topic score",
      strongestCells: "Strongest combinations",
      attentionCells: "Areas for attention",
      economyAtlas: "Economy atlas",
      economyAtlasText: "A compact topic heatmap for identifying structural differences across economies.",
      addEconomy: "Add economy",
      add: "Add",
      compareHint: "Add two to six economies. Comparison preserves separate official pillar and topic scores.",
      noCompare: "At least two economies are required",
      profileAcrossTopics: "Profile across ten topics",
      pillarComparison: "Three-pillar comparison",
      gaps: "Gaps between rules and delivery",
      remove: "Remove",
      profile: "Economy profile",
      close: "Close",
      officialPillars: "Official pillar scores",
      topicProfile: "Topic profile",
      diagnosticMatrix: "Topic × pillar matrix",
      strengths: "Strengths",
      constraints: "Areas for attention",
      sourceNote: "Scores: World Bank B-READY. Ranks, percentiles, quintiles and gaps: GIR analytical calculations for the selected official slice.",
      methodologyIntro: "B-READY assesses the business environment through three pillars and ten topics covering the life cycle of a firm. GIR preserves this official multidimensional architecture and does not invent an overall score.",
      whatMeasures: "What B-READY measures",
      officialArchitecture: "Official architecture",
      officialArchitectureText: "The three pillars repeat across ten topics: regulatory quality, public services and operational efficiency.",
      howRanks: "How GIR calculates ranks",
      howRanksText: "A rank is calculated only within an explicitly selected official score slice. Scores are sorted descending with competition ranking 1, 2, 2, 4. This is a GIR analytical view, not an official World Bank ranking.",
      whyNoAggregate: "Why there is no overall ranking",
      whyNoAggregateText: "The World Bank does not publish a single B-READY economy score. Averaging the pillars or topics would obscure distinct institutional mechanisms and create a metric absent from the source.",
      editionComparability: "Edition comparability",
      editionComparabilityText: "B-READY coverage and methodology evolved during its staged rollout. Changes across editions should be interpreted with attention to economy coverage and methodology edition.",
      sourceAndProvenance: "Source and reproducibility",
      sourceOwner: "Owner",
      sourceDataset: "Dataset",
      projectPage: "Project page",
      dataPage: "Data page",
      reproducibility: "Reproducibility package",
      methodologyHandbook: "Methodology handbook",
      license: "License",
      retrievedAt: "Retrieved",
      snapshot: "Raw snapshot",
      checksum: "SHA-256",
      parser: "Parser version",
      transformation: "Rank transformation",
      provenanceLoading: "Checking release provenance…",
      provenanceUnavailable: "Provenance is not available yet",
      openSource: "Open source",
      notLoadedTitle: "Backend installed — no official B-READY release has been published in GIR yet",
      notLoadedText: "The workspace is ready, but the publication gate has not found a verified World Bank B-READY dataset. Numeric results appear only after an official release passes validation.",
      loadData: "Load the official dataset",
      commandDownload: "Automatic download",
      commandManual: "Import a local file",
      commandStatus: "Check status",
      copyCommand: "Copy command",
      commandCopied: "Command copied",
      emptyStep1: "Download the official all-data ZIP/XLSX from B-READY or use the World Bank reproducibility package.",
      emptyStep2: "Run the CLI: it validates the three pillars, ten topics, coverage, duplicates, ranges and provenance.",
      emptyStep3: "After atomic publication, select Retry — the workspace opens without restarting the application.",
      officialLinks: "Official materials",
      networkTitle: "B-READY data could not be loaded",
      networkText: "The backend did not respond or returned an invalid payload. Other GIR sections are unaffected.",
      technicalDetails: "Technical details",
      retry: "Retry",
      loading: "Loading the official B-READY release…",
      loadingRanking: "Loading the selected official slice…",
      loadingMatrix: "Building the diagnostic matrix…",
      loadingCompare: "Building a comparable profile…",
      loadingCountry: "Loading economy profile…",
      valueUnavailable: "Not available",
      official: "official",
      derived: "GIR derived",
      keyboardHint: "Rows open with Enter or Space.",
      dataPolicy: "Verified official release only",
      backendReady: "Backend ready",
      tabPanel: "B-READY analytical workspace",
      liveRegion: "Workspace update",
      allTopics: "All topics",
      allPillars: "All pillars",
      details: "Details",
      previousEdition: "Previous edition",
      newEconomy: "No comparable previous value",
      points: "pts",
      places: "places",
      rankUp: "higher",
      rankDown: "lower",
      stable: "unchanged",
      matrixMissing: "Slice not published",
      selected: "Selected",
      clear: "Clear",
      dataEdition: "Data edition",
      methodologyEdition: "Methodology edition",
    },
  };

  const ICONS = {
    grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    matrix: '<path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16M15 4v16" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    compare: '<path d="M7 4v16M17 4v16M4 8h6M14 16h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.9 7.5-9.5V6L12 3Zm-3 9 2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    building: '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M8 10h2M14 10h2M8 13h2M14 13h2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    compass: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    search: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    link: '<path d="M9.5 14.5 14.5 9M7.5 17H6a4 4 0 0 1 0-8h3M16.5 7H18a4 4 0 0 1 0 8h-3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check: '<path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v6M12 7h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    alert: '<path d="M12 4 3 20h18L12 4Zm0 5v5m0 3h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    copy: '<path d="M8 8h11v11H8zM5 16H4V5h11v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    trend: '<path d="m4 17 5-5 4 3 7-8M15 7h5v5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    scale: '<path d="M12 4v16M6 7h12M8 7l-3 6h6L8 7Zm8 0-3 6h6l-3-6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  function icon(name, className = "") {
    return `<svg class="br-icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(String(value || ""), window.location.origin);
      if (!["http:", "https:"].includes(parsed.protocol)) return "#";
      return parsed.href;
    } catch (_error) {
      return "#";
    }
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number(value) || 0));
  }

  function average(values) {
    const clean = values.map(Number).filter(Number.isFinite);
    return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null;
  }

  function median(values) {
    const clean = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return null;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function quantile(values, fraction) {
    const clean = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return null;
    const position = (clean.length - 1) * clamp(fraction, 0, 1);
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) return clean[lower];
    return clean[lower] + (clean[upper] - clean[lower]) * (position - lower);
  }

  function debounce(callback, delay = 180) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  }

  function fileName(path) {
    const value = String(path || "").replace(/\\/g, "/");
    return value.split("/").filter(Boolean).pop() || "—";
  }

  function dateText(value, locale) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function normalizeText(value) {
    return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function isoFromFeature(feature) {
    const properties = feature?.properties || {};
    const candidates = [
      properties.iso_a3, properties.ISO_A3, properties.adm0_a3, properties.ADM0_A3,
      properties.iso3, properties.ISO3, properties.wb_a3, properties.WB_A3,
      properties.sov_a3, properties.SOV_A3, feature?.id,
    ];
    const found = candidates.find((value) => /^[A-Za-z]{3}$/.test(String(value || "")));
    return found ? String(found).toUpperCase() : "";
  }

  function geometryRings(geometry) {
    if (!geometry) return [];
    if (geometry.type === "Polygon") return geometry.coordinates || [];
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
    return [];
  }

  function featurePath(feature, width = 960, height = 500) {
    const rings = geometryRings(feature?.geometry);
    const parts = [];
    rings.forEach((ring) => {
      ring.forEach((coordinate, index) => {
        const longitude = Number(coordinate?.[0]);
        const latitude = Number(coordinate?.[1]);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;
        const x = ((longitude + 180) / 360) * width;
        const clippedLatitude = clamp(latitude, -85, 85);
        const y = ((90 - clippedLatitude) / 180) * height;
        parts.push(`${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`);
      });
      if (ring.length) parts.push("Z");
    });
    return parts.join(" ");
  }

  function scoreColor(value, thresholds) {
    if (!Number.isFinite(Number(value))) return "var(--br-map-empty)";
    const palette = ["#183554", "#235a72", "#267d87", "#32a38f", "#62dca6", "#b4f08c"];
    const index = thresholds.findIndex((threshold) => Number(value) <= threshold);
    return palette[index < 0 ? palette.length - 1 : index];
  }

  function initials(name) {
    return String(name || "—").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function slug(value) {
    return String(value || "").replace(/[^A-Za-z0-9_-]/g, "-");
  }

  function qs(parameters) {
    const output = new URLSearchParams();
    Object.entries(parameters || {}).forEach(([key, value]) => {
      if (value == null || value === "") return;
      if (Array.isArray(value)) value.forEach((item) => output.append(key, item));
      else output.set(key, value);
    });
    const text = output.toString();
    return text ? `?${text}` : "";
  }

  function fetchGeo() {
    if (sharedGeoPromise) return sharedGeoPromise;
    const candidates = [
      "/world.geojson", "/static/world.geojson", "/static/world_countries_lite.geojson",
      "/static/data/world.geojson", "/static/data/world_countries_lite.geojson",
    ];
    sharedGeoPromise = (async () => {
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate, { credentials: "same-origin" });
          if (!response.ok) continue;
          const data = await response.json();
          if (data?.type === "FeatureCollection" && Array.isArray(data.features)) return data;
        } catch (_error) {
          // Continue through local candidates.
        }
      }
      throw new Error("World geometry is unavailable");
    })();
    return sharedGeoPromise;
  }

  class BreadyWorkspace {
    constructor(root, options = {}) {
      this.root = root;
      this.id = `br-${++sequence}`;
      this.abortController = null;
      this.returnFocus = null;
      this.resizeObserver = null;
      this.boundWindowKeydown = (event) => this.onWindowKeydown(event);
      this.state = {
        lang: options.lang === "en" ? "en" : "ru",
        theme: options.theme === "light" ? "light" : "dark",
        status: "loading",
        tab: "overview",
        edition: null,
        scoreType: "pillar",
        pillar: "regulatory_framework",
        topic: "business_entry",
        sort: "rank",
        query: "",
        meta: null,
        dimensions: null,
        editions: [],
        ranking: null,
        matrix: null,
        provenance: null,
        geo: null,
        geoError: null,
        loadingRanking: false,
        loadingMatrix: false,
        loadingCompare: false,
        profileLoading: false,
        compareCodes: [],
        compare: null,
        matrixIso3: null,
        drawerIso3: null,
        drawer: null,
        error: null,
        toast: "",
        compact: false,
      };
      this.parseUrl();
      this.setOptions(options);
    }

    setOptions(options = {}) {
      const nextLang = options.lang === "en" ? "en" : "ru";
      const nextTheme = options.theme === "light" ? "light" : "dark";
      const changed = nextLang !== this.state.lang || nextTheme !== this.state.theme;
      this.state.lang = nextLang;
      this.state.theme = nextTheme;
      if (changed && this.state.status !== "loading") this.render();
    }

    t(key) {
      return COPY[this.state.lang]?.[key] || COPY.en[key] || key;
    }

    locale() {
      return this.state.lang === "ru" ? "ru-RU" : "en-US";
    }

    number(value, digits = 1) {
      if (!Number.isFinite(Number(value))) return "—";
      return Number(value).toLocaleString(this.locale(), {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    }

    integer(value) {
      if (!Number.isFinite(Number(value))) return "—";
      return Math.round(Number(value)).toLocaleString(this.locale());
    }

    signed(value, digits = 1) {
      if (!Number.isFinite(Number(value))) return "—";
      const number = Number(value);
      return `${number > 0 ? "+" : ""}${this.number(number, digits)}`;
    }

    pillarLabel(code) {
      const item = this.state.dimensions?.pillars?.find((entry) => entry.code === code);
      if (item) return item[this.state.lang === "ru" ? "name_ru" : "name_en"] || code;
      return this.t({
        regulatory_framework: "regulatoryFramework",
        public_services: "publicServices",
        operational_efficiency: "operationalEfficiency",
      }[code] || code);
    }

    topicLabel(code) {
      const item = this.state.dimensions?.topics?.find((entry) => entry.code === code);
      if (item) return item[this.state.lang === "ru" ? "name_ru" : "name_en"] || code;
      return this.t({
        business_entry: "businessEntry",
        business_location: "businessLocation",
        utility_services: "utilityServices",
        labor: "labor",
        financial_services: "financialServices",
        international_trade: "internationalTrade",
        taxation: "taxation",
        dispute_resolution: "disputeResolution",
        market_competition: "marketCompetition",
        business_insolvency: "businessInsolvency",
      }[code] || code);
    }

    dimensionLabel() {
      if (this.state.scoreType === "pillar") return this.pillarLabel(this.state.pillar);
      if (this.state.scoreType === "topic") return this.topicLabel(this.state.topic);
      return `${this.topicLabel(this.state.topic)} · ${this.pillarLabel(this.state.pillar)}`;
    }

    dimensionHint() {
      return this.t(this.state.scoreType === "pillar" ? "dimensionHintPillar" : this.state.scoreType === "topic" ? "dimensionHintTopic" : "dimensionHintTopicPillar");
    }

    parseUrl() {
      const hash = String(window.location.hash || "");
      const queryIndex = hash.indexOf("?");
      const routePart = hash.slice(1, queryIndex < 0 ? undefined : queryIndex);
      if (routePart && routePart !== ROUTE) return;
      const params = new URLSearchParams(queryIndex < 0 ? "" : hash.slice(queryIndex + 1));
      const tab = params.get("tab");
      if (["overview", "ranking", "matrix", "compare", "methodology"].includes(tab)) this.state.tab = tab;
      const edition = Number(params.get("edition"));
      if (Number.isInteger(edition) && edition >= 2024) this.state.edition = edition;
      const scoreType = params.get("score_type");
      if (["pillar", "topic", "topic_pillar"].includes(scoreType)) this.state.scoreType = scoreType;
      const pillar = params.get("pillar");
      if (PILLAR_ORDER.includes(pillar)) this.state.pillar = pillar;
      const topic = params.get("topic");
      if (TOPIC_ORDER.includes(topic)) this.state.topic = topic;
      const compare = params.get("compare");
      if (compare) {
        this.state.compareCodes = [...new Set(compare.split(",").map((value) => value.trim().toUpperCase()).filter((value) => /^[A-Z]{3}$/.test(value)))].slice(0, MAX_COMPARE);
      }
      const economy = params.get("economy");
      if (economy && /^[A-Za-z]{3}$/.test(economy)) this.state.matrixIso3 = economy.toUpperCase();
    }

    updateUrl() {
      const params = new URLSearchParams();
      if (this.state.tab !== "overview") params.set("tab", this.state.tab);
      if (this.state.edition) params.set("edition", String(this.state.edition));
      if (this.state.scoreType !== "pillar") params.set("score_type", this.state.scoreType);
      if (this.state.pillar !== "regulatory_framework" || this.state.scoreType === "topic_pillar") params.set("pillar", this.state.pillar);
      if (this.state.topic !== "business_entry" || this.state.scoreType !== "pillar") params.set("topic", this.state.topic);
      if (this.state.compareCodes.length) params.set("compare", this.state.compareCodes.join(","));
      if (this.state.matrixIso3) params.set("economy", this.state.matrixIso3);
      const next = `#${ROUTE}${params.size ? `?${params.toString()}` : ""}`;
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
    }

    async api(path, parameters = {}, options = {}) {
      const url = new URL(`${API_BASE}${path}`, window.location.origin);
      Object.entries(parameters).forEach(([key, value]) => {
        if (value == null || value === "") return;
        if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
        else url.searchParams.set(key, String(value));
      });
      const response = await fetch(url.pathname + url.search, {
        credentials: "same-origin",
        headers: { Accept: options.accept || "application/json" },
        signal: options.signal,
      });
      if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
          const payload = await response.json();
          detail = typeof payload?.detail === "string" ? payload.detail : JSON.stringify(payload?.detail || payload);
        } catch (_error) {
          // Keep HTTP status.
        }
        const error = new Error(detail);
        error.status = response.status;
        throw error;
      }
      return response.json();
    }

    async mount() {
      this.root.classList.add("br-host");
      this.root.setAttribute("data-bready-root", this.id);
      this.render();
      window.addEventListener("keydown", this.boundWindowKeydown);
      try {
        const [meta, dimensions, editions] = await Promise.all([
          this.api("/meta"),
          this.api("/dimensions"),
          this.api("/editions"),
        ]);
        this.state.meta = meta;
        this.state.dimensions = dimensions;
        this.state.editions = Array.isArray(editions?.items) ? editions.items : [];
        if (meta?.backend_status !== "ready" && meta?.backend_status !== "loaded") {
          this.state.status = "not_loaded";
          this.render();
          return;
        }
        const currentEdition = Number(meta?.release?.edition || this.state.editions?.[0]?.edition);
        const available = this.state.editions.map((item) => Number(item.edition));
        if (!this.state.edition || !available.includes(Number(this.state.edition))) this.state.edition = currentEdition;
        this.state.status = "ready";
        this.updateUrl();
        this.render();
        await Promise.allSettled([this.loadRanking(), this.loadMatrix(), this.loadGeo()]);
        if (this.state.tab === "compare" && this.state.compareCodes.length >= 2) await this.loadComparison();
        if (this.state.tab === "methodology") this.loadProvenance();
      } catch (error) {
        this.state.error = error;
        this.state.status = error?.status === 503 ? "not_loaded" : "error";
        this.render();
      }
    }

    destroy() {
      this.abortController?.abort();
      window.removeEventListener("keydown", this.boundWindowKeydown);
      this.resizeObserver?.disconnect();
      this.root.classList.remove("br-host");
      this.root.removeAttribute("data-bready-root");
      instances.delete(this.root);
      instanceRegistry.delete(this);
    }

    async loadGeo() {
      try {
        this.state.geo = await fetchGeo();
        this.state.geoError = null;
      } catch (error) {
        this.state.geoError = error;
      }
      if (this.state.status === "ready") this.renderCurrentPanel();
    }

    dimensionParameters() {
      return {
        edition: this.state.edition,
        score_type: this.state.scoreType,
        pillar: this.state.scoreType === "topic" ? null : this.state.pillar,
        topic: this.state.scoreType === "pillar" ? null : this.state.topic,
        limit: 1000,
        include_previous: true,
      };
    }

    async loadRanking() {
      if (this.state.status !== "ready") return;
      this.state.loadingRanking = true;
      this.renderCurrentPanel();
      const token = JSON.stringify(this.dimensionParameters());
      try {
        const payload = await this.api("/ranking", this.dimensionParameters());
        if (token !== JSON.stringify(this.dimensionParameters())) return;
        this.state.ranking = payload;
        this.state.error = null;
      } catch (error) {
        this.state.error = error;
      } finally {
        this.state.loadingRanking = false;
        this.renderCurrentPanel();
      }
    }

    async loadMatrix() {
      if (this.state.status !== "ready") return;
      this.state.loadingMatrix = true;
      this.renderCurrentPanel();
      const edition = this.state.edition;
      try {
        const payload = await this.api("/matrix", { edition, limit: 1000 });
        if (edition !== this.state.edition) return;
        this.state.matrix = payload;
        const available = payload?.items || [];
        if (!this.state.matrixIso3 || !available.some((item) => item.economy?.iso3 === this.state.matrixIso3)) {
          this.state.matrixIso3 = available[0]?.economy?.iso3 || null;
        }
        this.state.error = null;
      } catch (error) {
        this.state.error = error;
      } finally {
        this.state.loadingMatrix = false;
        this.updateUrl();
        this.renderCurrentPanel();
      }
    }

    async loadComparison() {
      if (this.state.compareCodes.length < 2 || this.state.status !== "ready") return;
      this.state.loadingCompare = true;
      this.renderCurrentPanel();
      const codes = [...this.state.compareCodes];
      try {
        const payload = await this.api("/compare", { iso3: codes, edition: this.state.edition });
        if (codes.join(",") !== this.state.compareCodes.join(",")) return;
        this.state.compare = payload;
        this.state.error = null;
      } catch (error) {
        this.state.error = error;
      } finally {
        this.state.loadingCompare = false;
        this.renderCurrentPanel();
      }
    }

    async loadProfile(iso3, trigger = null) {
      if (!/^[A-Z]{3}$/.test(String(iso3 || "").toUpperCase())) return;
      this.returnFocus = trigger || document.activeElement;
      this.state.drawerIso3 = String(iso3).toUpperCase();
      this.state.drawer = null;
      this.state.profileLoading = true;
      this.renderDrawer();
      try {
        this.state.drawer = await this.api(`/economies/${encodeURIComponent(this.state.drawerIso3)}`, { edition: this.state.edition });
      } catch (error) {
        this.state.drawer = { error: String(error?.message || error) };
      } finally {
        this.state.profileLoading = false;
        this.renderDrawer();
        window.setTimeout(() => this.root.querySelector(".br-drawer__close")?.focus(), 0);
      }
    }

    async loadProvenance() {
      if (this.state.provenance || this.state.status !== "ready") return;
      try {
        this.state.provenance = await this.api("/provenance");
      } catch (error) {
        this.state.provenance = { error: String(error?.message || error) };
      }
      if (this.state.tab === "methodology") this.renderCurrentPanel();
    }

    render() {
      this.root.innerHTML = `
        <section class="br-shell" data-br-shell data-status="${escapeHtml(this.state.status)}">
          <div class="br-ambient" aria-hidden="true"></div>
          <div class="br-live br-sr-only" aria-live="polite" aria-atomic="true">${escapeHtml(this.state.toast || this.t("liveRegion"))}</div>
          ${this.heroMarkup()}
          ${this.state.status === "ready" ? this.controlsMarkup() : ""}
          <section class="br-main" data-br-main aria-label="${escapeHtml(this.t("tabPanel"))}">
            ${this.mainMarkup()}
          </section>
          <div data-br-drawer></div>
          <div data-br-toast></div>
        </section>
      `;
      this.bindShell();
      if (this.state.drawerIso3) this.renderDrawer();
      if (this.state.toast) this.renderToast(this.state.toast);
    }

    heroMarkup() {
      const release = this.state.meta?.release || {};
      const edition = Number(release.edition || this.state.edition || 2025);
      const economyCount = Number(release.economy_count || this.state.matrix?.total || 0);
      const topicPillarCount = Number(release.topic_pillar_score_count || 0);
      const statusLive = this.state.status === "ready";
      return `
        <header class="br-hero">
          <div class="br-hero__mesh" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="br-hero__content">
            <div class="br-breadcrumb"><span>${escapeHtml(this.t("group"))}</span><i></i><strong>B-READY</strong></div>
            <div class="br-kicker"><span class="br-kicker__pulse"></span>${escapeHtml(this.t("eyebrow"))}</div>
            <h1>${escapeHtml(this.t("title"))}</h1>
            <p class="br-hero__subtitle">${escapeHtml(this.t("subtitle"))}</p>
            <p class="br-hero__intro">${escapeHtml(this.t("intro"))}</p>
            <div class="br-hero__badges">
              <span class="br-status-badge ${statusLive ? "is-live" : "is-guarded"}">${icon(statusLive ? "check" : "shield")}${escapeHtml(statusLive ? this.t("backendReady") : this.t("dataPolicy"))}</span>
              <span class="br-origin-badge"><i></i>${escapeHtml(this.t("officialScore"))}</span>
              <span class="br-origin-badge is-derived"><i></i>${escapeHtml(this.t("derivedRank"))}</span>
            </div>
          </div>
          <div class="br-hero__insight">
            <div class="br-no-aggregate">
              <div class="br-no-aggregate__icon">${icon("scale")}</div>
              <div>
                <span>${escapeHtml(this.t("noAggregate"))}</span>
                <p>${escapeHtml(this.t("noAggregateText"))}</p>
              </div>
            </div>
            <div class="br-hero__metrics">
              <article class="br-hero-metric"><span>${escapeHtml(this.t("edition"))}</span><strong>${this.integer(edition)}</strong><small>${escapeHtml(release.methodology_edition || this.t("dataEdition"))}</small></article>
              <article class="br-hero-metric"><span>${escapeHtml(economyCount === 1 ? this.t("economies") : this.t("economiesPlural"))}</span><strong>${economyCount ? this.integer(economyCount) : "—"}</strong><small>${escapeHtml(this.t("coverage"))}</small></article>
              <article class="br-hero-metric"><span>${escapeHtml(this.t("pillars"))}</span><strong>3</strong><small>I · II · III</small></article>
              <article class="br-hero-metric"><span>${escapeHtml(this.t("topics"))}</span><strong>10</strong><small>${topicPillarCount ? `${this.integer(topicPillarCount)} ${escapeHtml(this.t("topicPillarCells"))}` : escapeHtml(this.t("businessLifecycle"))}</small></article>
            </div>
          </div>
        </header>
      `;
    }

    controlsMarkup() {
      const editions = this.state.editions.length ? this.state.editions : [{ edition: this.state.edition }];
      return `
        <section class="br-command" aria-label="${escapeHtml(this.t("selectLens"))}">
          <div class="br-command__primary">
            <label class="br-field br-field--edition">
              <span>${escapeHtml(this.t("edition"))}</span>
              <select data-br-edition aria-label="${escapeHtml(this.t("edition"))}">
                ${editions.map((item) => `<option value="${Number(item.edition)}" ${Number(item.edition) === Number(this.state.edition) ? "selected" : ""}>${Number(item.edition)}</option>`).join("")}
              </select>
              ${icon("chevron")}
            </label>
            <div class="br-lens" role="group" aria-label="${escapeHtml(this.t("scoreType"))}">
              ${[
                ["pillar", "pillarScore"], ["topic", "topicScore"], ["topic_pillar", "topicPillarScore"],
              ].map(([value, key]) => `<button type="button" class="br-lens__button ${this.state.scoreType === value ? "is-active" : ""}" data-br-score-type="${value}" aria-pressed="${this.state.scoreType === value}">${escapeHtml(this.t(key))}</button>`).join("")}
            </div>
            ${this.state.scoreType !== "topic" ? `
              <label class="br-field br-field--dimension">
                <span>${escapeHtml(this.t("pillar"))}</span>
                <select data-br-pillar aria-label="${escapeHtml(this.t("pillar"))}">
                  ${PILLAR_ORDER.map((code) => `<option value="${code}" ${code === this.state.pillar ? "selected" : ""}>${escapeHtml(this.pillarLabel(code))}</option>`).join("")}
                </select>
                ${icon("chevron")}
              </label>
            ` : ""}
            ${this.state.scoreType !== "pillar" ? `
              <label class="br-field br-field--dimension br-field--topic">
                <span>${escapeHtml(this.t("topic"))}</span>
                <select data-br-topic aria-label="${escapeHtml(this.t("topic"))}">
                  ${TOPIC_ORDER.map((code) => `<option value="${code}" ${code === this.state.topic ? "selected" : ""}>${escapeHtml(this.topicLabel(code))}</option>`).join("")}
                </select>
                ${icon("chevron")}
              </label>
            ` : ""}
          </div>
          <div class="br-command__secondary">
            <div class="br-selected-lens">
              <span>${escapeHtml(this.t("selectedDimension"))}</span>
              <strong>${escapeHtml(this.dimensionLabel())}</strong>
              <small>${escapeHtml(this.dimensionHint())}</small>
            </div>
            <button type="button" class="br-icon-button" data-br-copy-link title="${escapeHtml(this.t("copyLink"))}" aria-label="${escapeHtml(this.t("copyLink"))}">${icon("link")}</button>
            <a class="br-icon-button" href="${API_BASE}/ranking.csv${qs(this.dimensionParameters())}" data-br-csv title="${escapeHtml(this.t("exportCsv"))}" aria-label="${escapeHtml(this.t("exportCsv"))}">${icon("download")}</a>
          </div>
        </section>
        <nav class="br-tabs" role="tablist" aria-label="B-READY">
          ${[
            ["overview", "grid", "overview"], ["ranking", "list", "ranking"], ["matrix", "matrix", "matrix"],
            ["compare", "compare", "compare"], ["methodology", "book", "methodology"],
          ].map(([tab, iconName, label]) => `<button type="button" role="tab" aria-selected="${this.state.tab === tab}" class="br-tab ${this.state.tab === tab ? "is-active" : ""}" data-br-tab="${tab}">${icon(iconName)}<span>${escapeHtml(this.t(label))}</span></button>`).join("")}
        </nav>
      `;
    }

    mainMarkup() {
      if (this.state.status === "loading") return this.loadingMarkup(this.t("loading"), "hero");
      if (this.state.status === "not_loaded") return this.emptyMarkup();
      if (this.state.status === "error") return this.errorMarkup(this.state.error);
      return `<section class="br-panel" data-br-panel>${this.panelMarkup()}</section>`;
    }

    panelMarkup() {
      if (this.state.tab === "ranking") return this.rankingMarkup();
      if (this.state.tab === "matrix") return this.matrixMarkup();
      if (this.state.tab === "compare") return this.compareMarkup();
      if (this.state.tab === "methodology") return this.methodologyMarkup();
      return this.overviewMarkup();
    }

    renderCurrentPanel() {
      const panel = this.root.querySelector("[data-br-panel]");
      if (!panel || this.state.status !== "ready") {
        if (this.root.isConnected) this.render();
        return;
      }
      panel.innerHTML = this.panelMarkup();
      this.bindPanel();
      if (this.state.drawerIso3) this.renderDrawer();
    }

    loadingMarkup(label, variant = "panel") {
      return `
        <section class="br-loading br-loading--${variant}" aria-busy="true">
          <div class="br-loading__orb"><span></span><span></span><span></span></div>
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(this.t("officialSource"))}</p>
          <div class="br-loading__skeleton"><i></i><i></i><i></i></div>
        </section>
      `;
    }

    emptyMarkup() {
      const commands = [
        [this.t("commandDownload"), "python -m giip.economy_finance.bready_cli download"],
        [this.t("commandManual"), "python -m giip.economy_finance.bready_cli import-file /path/to/B-READY_ALL_DATA_2025.zip --edition 2025 --methodology-edition \"Edition 2\""],
        [this.t("commandStatus"), "python -m giip.economy_finance.bready_cli status"],
      ];
      const source = this.state.meta?.source || {};
      return `
        <section class="br-empty">
          <div class="br-empty__halo" aria-hidden="true">${icon("building")}</div>
          <div class="br-empty__header">
            <span class="br-empty__status">${icon("shield")}${escapeHtml(this.t("dataPolicy"))}</span>
            <h2>${escapeHtml(this.t("notLoadedTitle"))}</h2>
            <p>${escapeHtml(this.t("notLoadedText"))}</p>
          </div>
          <div class="br-empty__grid">
            <article class="br-empty__steps">
              <h3>${escapeHtml(this.t("loadData"))}</h3>
              <ol>
                <li><span>01</span><p>${escapeHtml(this.t("emptyStep1"))}</p></li>
                <li><span>02</span><p>${escapeHtml(this.t("emptyStep2"))}</p></li>
                <li><span>03</span><p>${escapeHtml(this.t("emptyStep3"))}</p></li>
              </ol>
              <button type="button" class="br-button br-button--primary" data-br-retry>${icon("refresh")}${escapeHtml(this.t("retry"))}</button>
            </article>
            <article class="br-empty__commands">
              ${commands.map(([label, command]) => `
                <div class="br-command-line">
                  <span>${escapeHtml(label)}</span>
                  <code>${escapeHtml(command)}</code>
                  <button type="button" data-br-copy-command="${escapeHtml(command)}" aria-label="${escapeHtml(this.t("copyCommand"))}">${icon("copy")}</button>
                </div>
              `).join("")}
            </article>
          </div>
          <div class="br-empty__links">
            <strong>${escapeHtml(this.t("officialLinks"))}</strong>
            ${[
              [source.project, this.t("projectPage")], [source.data, this.t("dataPage")],
              [source.reproducibility, this.t("reproducibility")], [source.methodology_2025, this.t("methodologyHandbook")],
            ].filter(([url]) => url).map(([url, label]) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}${icon("external")}</a>`).join("")}
          </div>
        </section>
      `;
    }

    errorMarkup(error) {
      return `
        <section class="br-error">
          <div class="br-error__icon">${icon("alert")}</div>
          <h2>${escapeHtml(this.t("networkTitle"))}</h2>
          <p>${escapeHtml(this.t("networkText"))}</p>
          <details><summary>${escapeHtml(this.t("technicalDetails"))}</summary><pre>${escapeHtml(error?.stack || error?.message || String(error || "Unknown error"))}</pre></details>
          <button type="button" class="br-button br-button--primary" data-br-retry>${icon("refresh")}${escapeHtml(this.t("retry"))}</button>
        </section>
      `;
    }

    rankingItems() {
      return Array.isArray(this.state.ranking?.items) ? this.state.ranking.items : [];
    }

    matrixItems() {
      return Array.isArray(this.state.matrix?.items) ? this.state.matrix.items : [];
    }

    profileForIso(iso3) {
      return this.matrixItems().find((item) => item.economy?.iso3 === iso3) || null;
    }

    economyOptions(selected = null, excluded = []) {
      const blocked = new Set(excluded);
      return this.matrixItems()
        .filter((item) => item.economy?.iso3 && !blocked.has(item.economy.iso3))
        .sort((a, b) => String(a.economy.economy_name).localeCompare(String(b.economy.economy_name), this.locale()))
        .map((item) => `<option value="${escapeHtml(item.economy.iso3)}" ${item.economy.iso3 === selected ? "selected" : ""}>${escapeHtml(item.economy.economy_name)} · ${escapeHtml(item.economy.iso3)}</option>`)
        .join("");
    }

    scoreRecord(profile, scoreType = this.state.scoreType, pillar = this.state.pillar, topic = this.state.topic) {
      if (!profile) return null;
      if (scoreType === "pillar") return profile.pillars?.[pillar] || null;
      if (scoreType === "topic") return profile.topics?.[topic] || null;
      return profile.topic_pillar_matrix?.[topic]?.[pillar] || null;
    }

    overviewMarkup() {
      if (this.state.loadingRanking && !this.state.ranking) return this.loadingMarkup(this.t("loadingRanking"));
      if (this.state.error && !this.state.ranking) return this.errorMarkup(this.state.error);
      const items = this.rankingItems();
      const scores = items.map((item) => Number(item.score)).filter(Number.isFinite);
      const leader = items[0];
      const summary = [
        ["trend", this.t("median"), this.number(median(scores), 1), this.dimensionLabel()],
        ["scale", this.t("average"), this.number(average(scores), 1), this.t("officialScore")],
        ["building", this.t("leader"), leader?.economy_name || "—", leader ? `${this.number(leader.score, 1)} · #${this.integer(leader.rank)}` : "—"],
        ["globe", this.t("coverage"), `${this.integer(items.length)} / ${this.integer(this.state.matrix?.total || items.length)}`, this.t("economiesPlural")],
      ];
      return `
        <div class="br-panel-head">
          <div><span>${escapeHtml(this.t("selectedDimension"))} · ${this.integer(this.state.edition)}</span><h2>${escapeHtml(this.t("overview"))}</h2><p>${escapeHtml(this.dimensionHint())}</p></div>
          <div class="br-panel-head__badge">${icon("shield")}<span>${escapeHtml(this.t("noAggregateShort"))}</span></div>
        </div>
        <div class="br-summary-grid">
          ${summary.map(([iconName, label, value, note]) => `<article class="br-summary-card"><div class="br-summary-card__icon">${icon(iconName)}</div><div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></div></article>`).join("")}
        </div>
        <div class="br-dashboard-grid">
          <article class="br-card br-card--map">
            <div class="br-card__head"><div><span>${escapeHtml(this.dimensionLabel())} · ${this.integer(this.state.edition)}</span><h3>${escapeHtml(this.t("mapTitle"))}</h3><p>${escapeHtml(this.t("mapHelp"))}</p></div><div class="br-legend"><span>${escapeHtml(this.t("lower"))}</span><i></i><span>${escapeHtml(this.t("higher"))}</span></div></div>
            ${this.mapMarkup(items)}
          </article>
          <article class="br-card br-card--leaders">
            <div class="br-card__head"><div><span>TOP 8</span><h3>${escapeHtml(this.t("topEconomies"))}</h3></div></div>
            ${this.leadersMarkup(items.slice(0, 8))}
          </article>
        </div>
        <section class="br-section-intro">
          <div><span>I · II · III</span><h2>${escapeHtml(this.t("threePillars"))}</h2><p>${escapeHtml(this.t("threePillarsText"))}</p></div>
          <div class="br-section-intro__rule"></div>
        </section>
        ${this.pillarCardsMarkup()}
        <div class="br-insight-grid">
          <article class="br-card br-card--scatter">
            <div class="br-card__head"><div><span>${escapeHtml(this.t("institutionalGap"))}</span><h3>${escapeHtml(this.t("scatterTitle"))}</h3><p>${escapeHtml(this.t("scatterText"))}</p></div></div>
            ${this.scatterMarkup()}
          </article>
          <article class="br-card br-card--gaps">
            <div class="br-card__head"><div><span>${escapeHtml(this.t("derived"))}</span><h3>${escapeHtml(this.t("institutionalGap"))}</h3><p>${escapeHtml(this.t("institutionalGapText"))}</p></div></div>
            ${this.gapsMarkup()}
          </article>
        </div>
        <article class="br-card br-card--lifecycle">
          <div class="br-card__head"><div><span>10 TOPICS</span><h3>${escapeHtml(this.t("businessLifecycle"))}</h3><p>${escapeHtml(this.t("lifecycleText"))}</p></div></div>
          ${this.lifecycleMarkup()}
        </article>
        <footer class="br-source-note">${icon("info")}<span>${escapeHtml(this.t("sourceNote"))}</span></footer>
      `;
    }

    mapMarkup(items) {
      if (!this.state.geo && !this.state.geoError) return `<div class="br-map-placeholder"><div class="br-loading__orb"><span></span><span></span><span></span></div></div>`;
      if (this.state.geoError || !this.state.geo?.features?.length) return `<div class="br-map-unavailable">${icon("globe")}<p>${escapeHtml(this.t("mapUnavailable"))}</p></div>`;
      const values = items.map((item) => Number(item.score)).filter(Number.isFinite);
      const thresholds = [0.16, 0.32, 0.5, 0.68, 0.84].map((fraction) => quantile(values, fraction));
      const byIso = new Map(items.map((item) => [String(item.iso3 || "").toUpperCase(), item]));
      const paths = this.state.geo.features.map((feature) => {
        const iso3 = isoFromFeature(feature);
        const item = byIso.get(iso3);
        const score = Number(item?.score);
        const label = item ? `${item.economy_name}: ${this.number(score, 1)}` : `${iso3 || "—"}: ${this.t("valueUnavailable")}`;
        return `<path d="${featurePath(feature)}" class="br-map-country ${item ? "has-data" : ""}" fill="${scoreColor(score, thresholds)}" data-br-map-iso="${escapeHtml(iso3)}" tabindex="${item ? "0" : "-1"}" role="${item ? "button" : "img"}" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title></path>`;
      }).join("");
      return `
        <div class="br-map-wrap">
          <svg class="br-map" viewBox="0 0 960 500" role="img" aria-label="${escapeHtml(this.t("mapTitle"))}">
            <defs><filter id="br-map-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            <g>${paths}</g>
          </svg>
          <div class="br-map-axis"><span>${this.number(Math.min(...values), 0)}</span><i></i><span>${this.number(Math.max(...values), 0)}</span></div>
        </div>
      `;
    }

    leadersMarkup(items) {
      if (!items.length) return `<div class="br-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const maximum = Math.max(...items.map((item) => Number(item.score) || 0), 100);
      return `<ol class="br-leader-list">${items.map((item, index) => `
        <li>
          <button type="button" data-br-open-country="${escapeHtml(item.iso3)}">
            <span class="br-rank-token ${index < 3 ? `is-medal is-${index + 1}` : ""}">${this.integer(item.rank)}</span>
            <span class="br-economy-token"><i>${escapeHtml(initials(item.economy_name))}</i><span><strong>${escapeHtml(item.economy_name)}</strong><small>${escapeHtml(item.iso3 || "")}</small></span></span>
            <span class="br-score-token"><strong>${this.number(item.score, 1)}</strong><i><b style="width:${clamp(Number(item.score) / maximum * 100, 0, 100)}%"></b></i></span>
          </button>
        </li>
      `).join("")}</ol>`;
    }

    pillarCardsMarkup() {
      const profiles = this.matrixItems();
      return `<div class="br-pillar-grid">${PILLAR_ORDER.map((code, index) => {
        const records = profiles.map((profile) => ({ profile, record: profile.pillars?.[code] })).filter((item) => Number.isFinite(Number(item.record?.score)));
        records.sort((a, b) => Number(b.record.score) - Number(a.record.score));
        const scores = records.map((item) => Number(item.record.score));
        const leader = records[0];
        const roman = ["I", "II", "III"][index];
        const color = PILLAR_COLORS[code];
        return `
          <article class="br-pillar-card" style="--br-pillar-color:${color}">
            <div class="br-pillar-card__top"><span>${roman}</span><div>${icon(index === 0 ? "scale" : index === 1 ? "building" : "trend")}</div></div>
            <h3>${escapeHtml(this.pillarLabel(code))}</h3>
            <div class="br-pillar-card__stats"><div><span>${escapeHtml(this.t("median"))}</span><strong>${this.number(median(scores), 1)}</strong></div><div><span>${escapeHtml(this.t("leader"))}</span><strong>${escapeHtml(leader?.profile?.economy?.economy_name || "—")}</strong></div></div>
            <div class="br-pillar-card__distribution">${this.sparkDistribution(scores)}</div>
            <button type="button" data-br-select-pillar="${code}"><span>${escapeHtml(this.t("details"))}</span>${icon("arrow")}</button>
          </article>
        `;
      }).join("")}</div>`;
    }

    sparkDistribution(scores) {
      if (!scores.length) return "";
      const bins = Array.from({ length: 10 }, () => 0);
      scores.forEach((value) => { bins[Math.min(9, Math.floor(clamp(value, 0, 99.999) / 10))] += 1; });
      const max = Math.max(...bins, 1);
      return bins.map((count, index) => `<i style="height:${Math.max(8, count / max * 100)}%" title="${index * 10}–${index * 10 + 9}: ${count}"></i>`).join("");
    }

    scatterMarkup() {
      const records = this.matrixItems().map((profile) => ({
        iso3: profile.economy?.iso3,
        name: profile.economy?.economy_name,
        x: Number(profile.pillars?.regulatory_framework?.score),
        y: Number(profile.pillars?.public_services?.score),
        z: Number(profile.pillars?.operational_efficiency?.score),
      })).filter((item) => Number.isFinite(item.x) && Number.isFinite(item.y) && Number.isFinite(item.z));
      if (!records.length) return `<div class="br-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const width = 760; const height = 420; const left = 54; const right = 22; const top = 22; const bottom = 46;
      const x = (value) => left + clamp(value, 0, 100) / 100 * (width - left - right);
      const y = (value) => top + (1 - clamp(value, 0, 100) / 100) * (height - top - bottom);
      const grid = [0, 25, 50, 75, 100].map((tick) => `<g><line x1="${x(tick)}" x2="${x(tick)}" y1="${top}" y2="${height - bottom}"/><line x1="${left}" x2="${width - right}" y1="${y(tick)}" y2="${y(tick)}"/><text x="${x(tick)}" y="${height - 18}">${tick}</text><text x="${left - 12}" y="${y(tick) + 4}" text-anchor="end">${tick}</text></g>`).join("");
      const dots = records.map((item) => {
        const radius = 3.5 + item.z / 100 * 7;
        return `<circle cx="${x(item.x)}" cy="${y(item.y)}" r="${radius}" data-br-scatter-iso="${escapeHtml(item.iso3)}" tabindex="0" role="button" aria-label="${escapeHtml(`${item.name}: ${this.pillarLabel("regulatory_framework")} ${this.number(item.x, 1)}, ${this.pillarLabel("public_services")} ${this.number(item.y, 1)}, ${this.pillarLabel("operational_efficiency")} ${this.number(item.z, 1)}`)}"><title>${escapeHtml(`${item.name} · ${this.number(item.x, 1)} / ${this.number(item.y, 1)} / ${this.number(item.z, 1)}`)}</title></circle>`;
      }).join("");
      return `<div class="br-scatter-wrap"><svg class="br-scatter" viewBox="0 0 ${width} ${height}" role="img"><g class="br-chart-grid">${grid}</g><line class="br-scatter__diagonal" x1="${x(0)}" y1="${y(0)}" x2="${x(100)}" y2="${y(100)}"/><g class="br-scatter__dots">${dots}</g><text class="br-axis-label" x="${(left + width - right) / 2}" y="${height - 2}" text-anchor="middle">${escapeHtml(this.pillarLabel("regulatory_framework"))}</text><text class="br-axis-label" transform="translate(13 ${(top + height - bottom) / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(this.pillarLabel("public_services"))}</text></svg></div>`;
    }

    gapsMarkup() {
      const records = this.matrixItems().map((profile) => {
        const r = Number(profile.pillars?.regulatory_framework?.score);
        const s = Number(profile.pillars?.public_services?.score);
        const e = Number(profile.pillars?.operational_efficiency?.score);
        if (![r, s, e].every(Number.isFinite)) return null;
        return { profile, services: r - s, efficiency: r - e };
      }).filter(Boolean);
      if (!records.length) return `<div class="br-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const averageServices = average(records.map((item) => item.services));
      const averageEfficiency = average(records.map((item) => item.efficiency));
      const largest = [...records].sort((a, b) => Math.abs(b.efficiency) - Math.abs(a.efficiency)).slice(0, 4);
      const gapCard = (label, value, accent) => `<div class="br-gap-metric" style="--br-gap-color:${accent}"><span>${escapeHtml(label)}</span><strong>${this.signed(value, 1)}</strong><small>${escapeHtml(this.t("points"))}</small><i><b style="width:${clamp(Math.abs(value) * 4, 4, 100)}%"></b></i></div>`;
      return `<div class="br-gap-stack">${gapCard(this.t("frameworkVsServices"), averageServices, "var(--br-blue)")}${gapCard(this.t("frameworkVsEfficiency"), averageEfficiency, "var(--br-amber)")}</div><div class="br-gap-list">${largest.map((item) => `<button type="button" data-br-open-country="${escapeHtml(item.profile.economy.iso3)}"><span><i>${escapeHtml(item.profile.economy.iso3)}</i><strong>${escapeHtml(item.profile.economy.economy_name)}</strong></span><b>${this.signed(item.efficiency, 1)}</b></button>`).join("")}</div>`;
    }

    lifecycleMarkup() {
      const profiles = this.matrixItems();
      const values = TOPIC_ORDER.map((code) => {
        const scores = profiles.map((profile) => Number(profile.topics?.[code]?.score)).filter(Number.isFinite);
        return { code, score: average(scores), count: scores.length };
      });
      return `<div class="br-lifecycle"><div class="br-lifecycle__line" aria-hidden="true"></div>${values.map((item, index) => `
        <button type="button" class="br-lifecycle-step" data-br-select-topic="${item.code}" style="--br-step:${index}">
          <span class="br-lifecycle-step__number">${String(index + 1).padStart(2, "0")}</span>
          <div class="br-lifecycle-step__ring" style="--br-value:${clamp(item.score, 0, 100)}"><strong>${this.number(item.score, 0)}</strong></div>
          <h4>${escapeHtml(this.topicLabel(item.code))}</h4>
          <small>${this.integer(item.count)} ${escapeHtml(this.t("economiesPlural"))}</small>
        </button>
      `).join("")}</div>`;
    }

    filteredRankingItems() {
      let items = [...this.rankingItems()];
      const query = normalizeText(this.state.query);
      if (query) items = items.filter((item) => normalizeText(`${item.economy_name} ${item.iso3} ${item.region || ""} ${item.income_group || ""}`).includes(query));
      if (this.state.sort === "score") items.sort((a, b) => Number(b.score) - Number(a.score) || String(a.economy_name).localeCompare(String(b.economy_name), this.locale()));
      else if (this.state.sort === "gain") items.sort((a, b) => (Number.isFinite(Number(b.score_change)) ? Number(b.score_change) : -Infinity) - (Number.isFinite(Number(a.score_change)) ? Number(a.score_change) : -Infinity));
      else if (this.state.sort === "name") items.sort((a, b) => String(a.economy_name).localeCompare(String(b.economy_name), this.locale()));
      else items.sort((a, b) => (Number(a.rank) || Infinity) - (Number(b.rank) || Infinity) || String(a.economy_name).localeCompare(String(b.economy_name), this.locale()));
      return items;
    }

    rankingMarkup() {
      if (this.state.loadingRanking && !this.state.ranking) return this.loadingMarkup(this.t("loadingRanking"));
      if (this.state.error && !this.state.ranking) return this.errorMarkup(this.state.error);
      const allItems = this.rankingItems();
      const items = this.filteredRankingItems();
      const maximum = Math.max(...allItems.map((item) => Number(item.score) || 0), 100);
      const quintileCounts = [1, 2, 3, 4, 5].map((quintile) => allItems.filter((item) => Number(item.quintile) === quintile).length);
      return `
        <div class="br-panel-head br-panel-head--ranking">
          <div><span>${escapeHtml(this.t("officialScore"))} · ${this.integer(this.state.edition)}</span><h2>${escapeHtml(this.t("ranking"))}</h2><p>${escapeHtml(this.dimensionHint())}</p></div>
          <div class="br-panel-head__badge">${icon("scale")}<span>${escapeHtml(this.t("noAggregateShort"))}</span></div>
        </div>
        <div class="br-rank-overview">
          <div class="br-rank-overview__title"><span>${escapeHtml(this.t("selectedDimension"))}</span><strong>${escapeHtml(this.dimensionLabel())}</strong></div>
          <div class="br-quintile-strip" aria-label="${escapeHtml(this.t("quintile"))}">
            ${quintileCounts.map((count, index) => `<div class="is-q${index + 1}" style="--br-count:${count}"><span>Q${index + 1}</span><strong>${this.integer(count)}</strong></div>`).join("")}
          </div>
        </div>
        <div class="br-table-toolbar">
          <label class="br-search">${icon("search")}<span class="br-sr-only">${escapeHtml(this.t("search"))}</span><input type="search" data-br-search value="${escapeHtml(this.state.query)}" placeholder="${escapeHtml(this.t("searchPlaceholder"))}" autocomplete="off"></label>
          <label class="br-field br-field--sort"><span>${escapeHtml(this.t("sortBy"))}</span><select data-br-sort><option value="rank" ${this.state.sort === "rank" ? "selected" : ""}>${escapeHtml(this.t("byRank"))}</option><option value="score" ${this.state.sort === "score" ? "selected" : ""}>${escapeHtml(this.t("byScore"))}</option><option value="gain" ${this.state.sort === "gain" ? "selected" : ""}>${escapeHtml(this.t("byGain"))}</option><option value="name" ${this.state.sort === "name" ? "selected" : ""}>${escapeHtml(this.t("alphabetical"))}</option></select>${icon("chevron")}</label>
          <div class="br-table-toolbar__actions"><button type="button" class="br-button br-button--ghost" data-br-copy-link>${icon("link")}${escapeHtml(this.t("copyLink"))}</button><a class="br-button br-button--ghost" href="${API_BASE}/ranking.csv${qs(this.dimensionParameters())}">${icon("download")}${escapeHtml(this.t("exportCsv"))}</a></div>
        </div>
        <div class="br-ranking-card ${this.state.loadingRanking ? "is-loading" : ""}">
          <div class="br-ranking-table" role="table" aria-label="${escapeHtml(`${this.t("ranking")} · ${this.dimensionLabel()}`)}">
            <div class="br-ranking-row br-ranking-row--head" role="row">
              <span role="columnheader">${escapeHtml(this.t("rank"))}</span><span role="columnheader">${escapeHtml(this.t("economy"))}</span><span role="columnheader">${escapeHtml(this.t("score"))}</span><span role="columnheader">${escapeHtml(this.t("percentile"))}</span><span role="columnheader">${escapeHtml(this.t("quintile"))}</span><span role="columnheader">${escapeHtml(this.t("scoreChange"))}</span><span role="columnheader">${escapeHtml(this.t("rankChange"))}</span>
            </div>
            ${items.length ? items.map((item, index) => this.rankingRowMarkup(item, index, maximum)).join("") : `<div class="br-no-results">${icon("search")}<h3>${escapeHtml(this.t("noMatches"))}</h3><button type="button" data-br-clear-search>${escapeHtml(this.t("clearSearch"))}</button></div>`}
          </div>
          ${this.state.loadingRanking ? `<div class="br-table-loading">${this.loadingMarkup(this.t("loadingRanking"))}</div>` : ""}
        </div>
        <div class="br-table-footer"><span>${escapeHtml(this.t("showing"))} <strong>${this.integer(items.length)}</strong> ${escapeHtml(this.t("of"))} ${this.integer(allItems.length)}</span><span>${escapeHtml(this.t("keyboardHint"))}</span></div>
        <footer class="br-source-note">${icon("info")}<span>${escapeHtml(this.t("sourceNote"))}</span></footer>
      `;
    }

    rankingRowMarkup(item, index, maximum) {
      const scoreChange = Number(item.score_change);
      const rankChange = Number(item.rank_change);
      const rankTone = rankChange > 0 ? "is-positive" : rankChange < 0 ? "is-negative" : "is-neutral";
      const scoreTone = scoreChange > 0 ? "is-positive" : scoreChange < 0 ? "is-negative" : "is-neutral";
      return `
        <button type="button" class="br-ranking-row" role="row" data-br-open-country="${escapeHtml(item.iso3)}" style="--br-row-delay:${Math.min(index, 20)}">
          <span role="cell"><i class="br-rank-token ${Number(item.rank) <= 3 ? `is-medal is-${Number(item.rank)}` : ""}">${this.integer(item.rank)}</i></span>
          <span role="cell" class="br-economy-cell"><i>${escapeHtml(initials(item.economy_name))}</i><span><strong>${escapeHtml(item.economy_name)}</strong><small>${escapeHtml(item.iso3 || "")} ${item.region ? `· ${escapeHtml(item.region)}` : ""}</small></span></span>
          <span role="cell" class="br-score-cell"><strong>${this.number(item.score, 1)}</strong><i><b style="width:${clamp(Number(item.score) / maximum * 100, 0, 100)}%"></b></i><small>${escapeHtml(this.t("official"))}</small></span>
          <span role="cell" class="br-percentile-cell"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16"></circle><circle cx="21" cy="21" r="16" pathLength="100" stroke-dasharray="${clamp(Number(item.percentile), 0, 100)} 100"></circle></svg><strong>${this.number(item.percentile, 0)}</strong></span>
          <span role="cell"><i class="br-quintile is-q${Number(item.quintile) || 5}">Q${this.integer(item.quintile)}</i></span>
          <span role="cell"><i class="br-change ${scoreTone}">${Number.isFinite(scoreChange) ? this.signed(scoreChange, 1) : "—"}</i></span>
          <span role="cell"><i class="br-change ${rankTone}">${Number.isFinite(rankChange) ? this.signed(rankChange, 0) : "—"}</i></span>
        </button>
      `;
    }

    matrixMarkup() {
      if (this.state.loadingMatrix && !this.state.matrix) return this.loadingMarkup(this.t("loadingMatrix"));
      if (this.state.error && !this.state.matrix) return this.errorMarkup(this.state.error);
      const selected = this.profileForIso(this.state.matrixIso3);
      if (!selected) return this.loadingMarkup(this.t("loadingMatrix"));
      const economy = selected.economy || {};
      const allCells = [];
      TOPIC_ORDER.forEach((topic) => PILLAR_ORDER.forEach((pillar) => {
        const record = selected.topic_pillar_matrix?.[topic]?.[pillar];
        if (Number.isFinite(Number(record?.score))) allCells.push({ topic, pillar, record });
      }));
      const strongest = [...allCells].sort((a, b) => Number(b.record.score) - Number(a.record.score)).slice(0, 4);
      const weakest = [...allCells].sort((a, b) => Number(a.record.score) - Number(b.record.score)).slice(0, 4);
      return `
        <div class="br-panel-head">
          <div><span>${escapeHtml(this.t("officialArchitecture"))} · ${this.integer(this.state.edition)}</span><h2>${escapeHtml(this.t("matrixTitle"))}</h2><p>${escapeHtml(this.t("matrixText"))}</p></div>
          <div class="br-panel-head__badge">${icon("matrix")}<span>10 × 3</span></div>
        </div>
        <div class="br-matrix-selector">
          <label class="br-field br-field--economy"><span>${escapeHtml(this.t("selectEconomy"))}</span><select data-br-matrix-economy>${this.economyOptions(this.state.matrixIso3)}</select>${icon("chevron")}</label>
          <div class="br-selected-economy"><i>${escapeHtml(initials(economy.economy_name))}</i><div><strong>${escapeHtml(economy.economy_name)}</strong><span>${escapeHtml(economy.iso3 || "")} ${economy.region ? `· ${escapeHtml(economy.region)}` : ""}</span></div><button type="button" data-br-open-country="${escapeHtml(economy.iso3)}">${escapeHtml(this.t("profile"))}${icon("arrow")}</button></div>
        </div>
        <div class="br-matrix-layout">
          <article class="br-card br-card--diagnostic">
            <div class="br-diagnostic-matrix" role="table" aria-label="${escapeHtml(`${this.t("diagnosticMatrix")} · ${economy.economy_name}`)}">
              <div class="br-diagnostic-row br-diagnostic-row--head" role="row"><span role="columnheader">${escapeHtml(this.t("topic"))}</span>${PILLAR_ORDER.map((pillar, index) => `<span role="columnheader"><i>${["I", "II", "III"][index]}</i>${escapeHtml(this.pillarLabel(pillar))}</span>`).join("")}<span role="columnheader">${escapeHtml(this.t("topicOverall"))}</span></div>
              ${TOPIC_ORDER.map((topic, index) => this.diagnosticRowMarkup(selected, topic, index)).join("")}
            </div>
          </article>
          <aside class="br-matrix-insights">
            ${this.pillarProfileMiniMarkup(selected)}
            ${this.cellInsightMarkup(this.t("strongestCells"), strongest, "strong")}
            ${this.cellInsightMarkup(this.t("attentionCells"), weakest, "weak")}
          </aside>
        </div>
        <article class="br-card br-card--atlas">
          <div class="br-card__head"><div><span>${escapeHtml(this.dimensionLabel())}</span><h3>${escapeHtml(this.t("economyAtlas"))}</h3><p>${escapeHtml(this.t("economyAtlasText"))}</p></div><div class="br-legend"><span>${escapeHtml(this.t("lower"))}</span><i></i><span>${escapeHtml(this.t("higher"))}</span></div></div>
          ${this.atlasMarkup()}
        </article>
        <footer class="br-source-note">${icon("info")}<span>${escapeHtml(this.t("sourceNote"))}</span></footer>
      `;
    }

    diagnosticRowMarkup(profile, topic, index) {
      const topicRecord = profile.topics?.[topic];
      const cells = PILLAR_ORDER.map((pillar) => {
        const record = profile.topic_pillar_matrix?.[topic]?.[pillar];
        if (!Number.isFinite(Number(record?.score))) return `<span role="cell" class="br-matrix-cell is-missing" title="${escapeHtml(this.t("matrixMissing"))}">—</span>`;
        return `<button type="button" role="cell" class="br-matrix-cell" style="--br-score:${clamp(record.score, 0, 100)}" data-br-set-dimension="topic_pillar|${pillar}|${topic}" title="${escapeHtml(`${this.topicLabel(topic)} · ${this.pillarLabel(pillar)}: ${this.number(record.score, 1)}`)}"><strong>${this.number(record.score, 1)}</strong><small>#${this.integer(record.rank)}</small></button>`;
      }).join("");
      const overall = Number.isFinite(Number(topicRecord?.score)) ? `<button type="button" role="cell" class="br-matrix-cell br-matrix-cell--overall" style="--br-score:${clamp(topicRecord.score, 0, 100)}" data-br-set-dimension="topic||${topic}"><strong>${this.number(topicRecord.score, 1)}</strong><small>#${this.integer(topicRecord.rank)}</small></button>` : `<span role="cell" class="br-matrix-cell is-missing">—</span>`;
      return `<div class="br-diagnostic-row" role="row" style="--br-row:${index}"><span role="rowheader"><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeHtml(this.topicLabel(topic))}</strong></span>${cells}${overall}</div>`;
    }

    pillarProfileMiniMarkup(profile) {
      return `<article class="br-matrix-pillar-summary"><span>${escapeHtml(this.t("officialPillars"))}</span><h3>${escapeHtml(profile.economy?.economy_name || "")}</h3><div>${PILLAR_ORDER.map((code, index) => {
        const record = profile.pillars?.[code];
        return `<button type="button" data-br-set-dimension="pillar|${code}|" style="--br-pillar-color:${PILLAR_COLORS[code]}"><i>${["I", "II", "III"][index]}</i><span><small>${escapeHtml(this.pillarLabel(code))}</small><strong>${this.number(record?.score, 1)}</strong></span><b><em style="width:${clamp(record?.score, 0, 100)}%"></em></b></button>`;
      }).join("")}</div></article>`;
    }

    cellInsightMarkup(title, cells, tone) {
      return `<article class="br-cell-insight is-${tone}"><span>${escapeHtml(title)}</span><div>${cells.length ? cells.map((cell) => `<button type="button" data-br-set-dimension="topic_pillar|${cell.pillar}|${cell.topic}"><span><strong>${escapeHtml(this.topicLabel(cell.topic))}</strong><small>${escapeHtml(this.pillarLabel(cell.pillar))}</small></span><b>${this.number(cell.record.score, 1)}</b></button>`).join("") : `<p>${escapeHtml(this.t("valueUnavailable"))}</p>`}</div></article>`;
    }

    atlasMarkup() {
      const order = new Map(this.rankingItems().map((item, index) => [item.iso3, index]));
      const profiles = [...this.matrixItems()].sort((a, b) => (order.get(a.economy?.iso3) ?? 9999) - (order.get(b.economy?.iso3) ?? 9999)).slice(0, 24);
      if (!profiles.length) return `<div class="br-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      return `<div class="br-atlas"><div class="br-atlas__head"><span></span>${TOPIC_ORDER.map((topic, index) => `<span title="${escapeHtml(this.topicLabel(topic))}">${String(index + 1).padStart(2, "0")}</span>`).join("")}</div>${profiles.map((profile) => `<button type="button" class="br-atlas__row ${profile.economy.iso3 === this.state.matrixIso3 ? "is-selected" : ""}" data-br-matrix-select="${escapeHtml(profile.economy.iso3)}"><span><i>${escapeHtml(profile.economy.iso3)}</i><strong>${escapeHtml(profile.economy.economy_name)}</strong></span>${TOPIC_ORDER.map((topic) => { const record = profile.topics?.[topic]; return Number.isFinite(Number(record?.score)) ? `<i class="br-atlas__cell" style="--br-score:${clamp(record.score, 0, 100)}" title="${escapeHtml(`${this.topicLabel(topic)}: ${this.number(record.score, 1)}`)}"><b>${this.number(record.score, 0)}</b></i>` : `<i class="br-atlas__cell is-missing">—</i>`; }).join("")}</button>`).join("")}</div>`;
    }

    compareMarkup() {
      const available = this.matrixItems();
      const selectedProfiles = this.state.compare?.items || this.state.compareCodes.map((code) => this.profileForIso(code)).filter(Boolean);
      return `
        <div class="br-panel-head">
          <div><span>${escapeHtml(this.t("officialArchitecture"))} · ${this.integer(this.state.edition)}</span><h2>${escapeHtml(this.t("compare"))}</h2><p>${escapeHtml(this.t("compareHint"))}</p></div>
          <div class="br-panel-head__badge">${icon("compare")}<span>${this.state.compareCodes.length} / ${MAX_COMPARE}</span></div>
        </div>
        <section class="br-compare-builder">
          <div class="br-compare-chips">
            ${this.state.compareCodes.map((code, index) => {
              const profile = this.profileForIso(code);
              return `<span class="br-compare-chip" style="--br-series:${SERIES_COLORS[index % SERIES_COLORS.length]}"><i>${escapeHtml(code)}</i><strong>${escapeHtml(profile?.economy?.economy_name || code)}</strong><button type="button" data-br-remove-compare="${escapeHtml(code)}" aria-label="${escapeHtml(`${this.t("remove")} ${profile?.economy?.economy_name || code}`)}">${icon("close")}</button></span>`;
            }).join("")}
          </div>
          <div class="br-compare-add">
            <label class="br-field br-field--economy"><span>${escapeHtml(this.t("addEconomy"))}</span><select data-br-compare-select ${this.state.compareCodes.length >= MAX_COMPARE ? "disabled" : ""}><option value="">${escapeHtml(this.t("selectEconomy"))}</option>${available.length ? this.economyOptions(null, this.state.compareCodes) : ""}</select>${icon("chevron")}</label>
            <button type="button" class="br-button br-button--primary" data-br-add-compare ${this.state.compareCodes.length >= MAX_COMPARE ? "disabled" : ""}>${icon("plus")}${escapeHtml(this.t("add"))}</button>
          </div>
        </section>
        ${this.state.compareCodes.length < 2 ? this.compareEmptyMarkup() : this.state.loadingCompare && !this.state.compare ? this.loadingMarkup(this.t("loadingCompare")) : this.state.error && !this.state.compare ? this.errorMarkup(this.state.error) : this.comparisonContentMarkup(selectedProfiles)}
      `;
    }

    compareEmptyMarkup() {
      const suggestions = this.matrixItems().slice(0, 6);
      return `<section class="br-compare-empty"><div class="br-compare-empty__visual">${icon("compare")}<i></i><i></i><i></i></div><h3>${escapeHtml(this.t("noCompare"))}</h3><p>${escapeHtml(this.t("compareHint"))}</p><div>${suggestions.map((profile) => `<button type="button" data-br-quick-compare="${escapeHtml(profile.economy.iso3)}"><i>${escapeHtml(profile.economy.iso3)}</i><span>${escapeHtml(profile.economy.economy_name)}</span>${icon("plus")}</button>`).join("")}</div></section>`;
    }

    comparisonContentMarkup(profiles) {
      if (!profiles.length) return this.loadingMarkup(this.t("loadingCompare"));
      return `
        <div class="br-compare-metrics">
          ${profiles.map((profile, index) => {
            const economy = profile.economy || {};
            return `<article style="--br-series:${SERIES_COLORS[index % SERIES_COLORS.length]}"><div><i>${escapeHtml(economy.iso3 || "")}</i><span><strong>${escapeHtml(economy.economy_name || "")}</strong><small>${escapeHtml(economy.region || economy.income_group || "")}</small></span></div><div class="br-compare-metrics__pillars">${PILLAR_ORDER.map((pillar) => `<span title="${escapeHtml(this.pillarLabel(pillar))}"><i></i><strong>${this.number(profile.pillars?.[pillar]?.score, 1)}</strong></span>`).join("")}</div></article>`;
          }).join("")}
        </div>
        <div class="br-compare-grid">
          <article class="br-card br-card--topic-chart">
            <div class="br-card__head"><div><span>10 TOPICS</span><h3>${escapeHtml(this.t("profileAcrossTopics"))}</h3></div></div>
            ${this.topicComparisonChart(profiles)}
          </article>
          <article class="br-card br-card--pillar-compare">
            <div class="br-card__head"><div><span>I · II · III</span><h3>${escapeHtml(this.t("pillarComparison"))}</h3></div></div>
            ${this.pillarComparisonMarkup(profiles)}
          </article>
        </div>
        <article class="br-card br-card--compare-matrix">
          <div class="br-card__head"><div><span>${escapeHtml(this.t("officialArchitecture"))}</span><h3>${escapeHtml(this.t("diagnosticMatrix"))}</h3></div><div class="br-legend"><span>${escapeHtml(this.t("lower"))}</span><i></i><span>${escapeHtml(this.t("higher"))}</span></div></div>
          ${this.compareHeatmapMarkup(profiles)}
        </article>
        <footer class="br-source-note">${icon("info")}<span>${escapeHtml(this.t("sourceNote"))}</span></footer>
      `;
    }

    topicComparisonChart(profiles) {
      const width = 980; const height = 420; const left = 48; const right = 24; const top = 24; const bottom = 86;
      const x = (index) => left + index / Math.max(1, TOPIC_ORDER.length - 1) * (width - left - right);
      const y = (value) => top + (1 - clamp(value, 0, 100) / 100) * (height - top - bottom);
      const grid = [0, 25, 50, 75, 100].map((tick) => `<g><line x1="${left}" x2="${width - right}" y1="${y(tick)}" y2="${y(tick)}"/><text x="${left - 10}" y="${y(tick) + 4}" text-anchor="end">${tick}</text></g>`).join("");
      const series = profiles.map((profile, profileIndex) => {
        const points = TOPIC_ORDER.map((topic, index) => ({ index, value: Number(profile.topics?.[topic]?.score) })).filter((point) => Number.isFinite(point.value));
        const path = points.map((point, pointIndex) => `${pointIndex ? "L" : "M"}${x(point.index).toFixed(2)},${y(point.value).toFixed(2)}`).join(" ");
        const dots = points.map((point) => `<circle cx="${x(point.index)}" cy="${y(point.value)}" r="4"><title>${escapeHtml(`${profile.economy?.economy_name} · ${this.topicLabel(TOPIC_ORDER[point.index])}: ${this.number(point.value, 1)}`)}</title></circle>`).join("");
        return `<g class="br-topic-series" style="--br-series:${SERIES_COLORS[profileIndex % SERIES_COLORS.length]}"><path d="${path}"/><g>${dots}</g></g>`;
      }).join("");
      const labels = TOPIC_ORDER.map((topic, index) => `<g transform="translate(${x(index)} ${height - bottom + 18})"><text transform="rotate(-38)" text-anchor="end">${escapeHtml(this.topicLabel(topic))}</text></g>`).join("");
      return `<div class="br-topic-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(this.t("profileAcrossTopics"))}"><g class="br-chart-grid">${grid}</g>${series}<g class="br-topic-chart__labels">${labels}</g></svg><div class="br-chart-legend">${profiles.map((profile, index) => `<span style="--br-series:${SERIES_COLORS[index % SERIES_COLORS.length]}"><i></i>${escapeHtml(profile.economy?.economy_name || "")}</span>`).join("")}</div></div>`;
    }

    pillarComparisonMarkup(profiles) {
      return `<div class="br-pillar-compare">${PILLAR_ORDER.map((pillar, pillarIndex) => {
        const sorted = profiles.map((profile, index) => ({ profile, index, score: Number(profile.pillars?.[pillar]?.score) })).filter((item) => Number.isFinite(item.score)).sort((a, b) => b.score - a.score);
        return `<section><div class="br-pillar-compare__head"><i>${["I", "II", "III"][pillarIndex]}</i><strong>${escapeHtml(this.pillarLabel(pillar))}</strong></div><div>${sorted.map((item) => `<button type="button" data-br-open-country="${escapeHtml(item.profile.economy?.iso3)}" style="--br-series:${SERIES_COLORS[item.index % SERIES_COLORS.length]}"><span><i></i><b>${escapeHtml(item.profile.economy?.iso3 || "")}</b></span><em><u style="width:${clamp(item.score, 0, 100)}%"></u></em><strong>${this.number(item.score, 1)}</strong></button>`).join("")}</div></section>`;
      }).join("")}</div>`;
    }

    compareHeatmapMarkup(profiles) {
      return `<div class="br-compare-heatmap"><div class="br-compare-heatmap__head"><span>${escapeHtml(this.t("economy"))}</span>${TOPIC_ORDER.map((topic, index) => `<span title="${escapeHtml(this.topicLabel(topic))}">${String(index + 1).padStart(2, "0")}</span>`).join("")}</div>${profiles.map((profile, profileIndex) => `<button type="button" class="br-compare-heatmap__row" data-br-open-country="${escapeHtml(profile.economy?.iso3)}"><span style="--br-series:${SERIES_COLORS[profileIndex % SERIES_COLORS.length]}"><i></i><strong>${escapeHtml(profile.economy?.economy_name || "")}</strong><small>${escapeHtml(profile.economy?.iso3 || "")}</small></span>${TOPIC_ORDER.map((topic) => { const record = profile.topics?.[topic]; return Number.isFinite(Number(record?.score)) ? `<i style="--br-score:${clamp(record.score, 0, 100)}"><b>${this.number(record.score, 0)}</b></i>` : `<i class="is-missing">—</i>`; }).join("")}</button>`).join("")}</div>`;
    }

    methodologyMarkup() {
      const meta = this.state.meta || {};
      const source = meta.source || {};
      const provenance = this.state.provenance;
      const release = provenance?.release || meta.release || {};
      const facts = [
        ["building", "3", this.t("pillars"), this.t("officialArchitectureText")],
        ["compass", "10", this.t("topics"), this.t("lifecycleText")],
        ["scale", "0–100", this.t("officialScore"), this.t("noAggregateText")],
      ];
      return `
        <div class="br-panel-head">
          <div><span>WORLD BANK · B-READY</span><h2>${escapeHtml(this.t("methodology"))}</h2><p>${escapeHtml(this.t("methodologyIntro"))}</p></div>
          <div class="br-panel-head__badge">${icon("shield")}<span>${escapeHtml(this.t("officialSource"))}</span></div>
        </div>
        <div class="br-method-facts">${facts.map(([iconName, value, label, text]) => `<article><div>${icon(iconName)}</div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(text)}</p></article>`).join("")}</div>
        <div class="br-method-grid">
          <article class="br-card br-method-card br-method-card--architecture">
            <span>01</span><h3>${escapeHtml(this.t("officialArchitecture"))}</h3><p>${escapeHtml(this.t("officialArchitectureText"))}</p>
            <div class="br-method-architecture"><div class="br-method-architecture__pillars">${PILLAR_ORDER.map((code, index) => `<div style="--br-pillar-color:${PILLAR_COLORS[code]}"><i>${["I", "II", "III"][index]}</i><strong>${escapeHtml(this.pillarLabel(code))}</strong></div>`).join("")}</div><div class="br-method-architecture__topics">${TOPIC_ORDER.map((code, index) => `<span><i>${String(index + 1).padStart(2, "0")}</i>${escapeHtml(this.topicLabel(code))}</span>`).join("")}</div></div>
          </article>
          <article class="br-card br-method-card br-method-card--aggregate">
            <span>02</span><h3>${escapeHtml(this.t("whyNoAggregate"))}</h3><p>${escapeHtml(this.t("whyNoAggregateText"))}</p>
            <div class="br-no-aggregate-visual"><div><i>I</i><i>II</i><i>III</i></div><span>${icon("close")}</span><strong>${escapeHtml(this.t("noAggregateShort"))}</strong></div>
          </article>
          <article class="br-card br-method-card">
            <span>03</span><h3>${escapeHtml(this.t("howRanks"))}</h3><p>${escapeHtml(this.t("howRanksText"))}</p>
            <div class="br-rank-rule"><span>${escapeHtml(this.t("officialScore"))} ↓</span><span>${escapeHtml(this.t("ties"))}: =</span><span>${escapeHtml(this.t("derivedRank"))}</span></div>
          </article>
          <article class="br-card br-method-card">
            <span>04</span><h3>${escapeHtml(this.t("editionComparability"))}</h3><p>${escapeHtml(this.t("editionComparabilityText"))}</p>
            <div class="br-edition-flow">${this.state.editions.slice().sort((a, b) => Number(a.edition) - Number(b.edition)).map((item) => `<div><i>${Number(item.edition)}</i><strong>${this.integer(item.economy_count)}</strong><span>${escapeHtml(this.t("economiesPlural"))}</span></div>`).join("") || `<div><i>2024</i><strong>50</strong></div><div><i>2025</i><strong>101</strong></div>`}</div>
          </article>
        </div>
        <article class="br-card br-provenance">
          <div class="br-card__head"><div><span>PROVENANCE</span><h3>${escapeHtml(this.t("sourceAndProvenance"))}</h3></div>${provenance && !provenance.error ? `<span class="br-verified">${icon("check")}VERIFIED</span>` : ""}</div>
          ${!provenance ? this.provenanceSkeletonMarkup() : provenance.error ? `<div class="br-provenance-error">${icon("alert")}<span>${escapeHtml(this.t("provenanceUnavailable"))}</span><code>${escapeHtml(provenance.error)}</code></div>` : `
            <div class="br-provenance-grid">
              <div><span>${escapeHtml(this.t("sourceOwner"))}</span><strong>${escapeHtml(provenance.source?.owner || meta.source_owner || "World Bank Group")}</strong></div>
              <div><span>${escapeHtml(this.t("dataEdition"))}</span><strong>${this.integer(release.edition || this.state.edition)}</strong></div>
              <div><span>${escapeHtml(this.t("methodologyEdition"))}</span><strong>${escapeHtml(release.methodology_edition || "—")}</strong></div>
              <div><span>${escapeHtml(this.t("retrievedAt"))}</span><strong>${escapeHtml(dateText(release.retrieved_at, this.locale()))}</strong></div>
              <div class="is-wide"><span>${escapeHtml(this.t("snapshot"))}</span><strong>${escapeHtml(fileName(release.snapshot_path))}</strong></div>
              <div class="is-wide"><span>${escapeHtml(this.t("checksum"))}</span><code>${escapeHtml(release.snapshot_sha256 || "—")}</code></div>
              <div><span>${escapeHtml(this.t("parser"))}</span><strong>${escapeHtml(meta.parser_version || "—")}</strong></div>
              <div><span>${escapeHtml(this.t("transformation"))}</span><strong>${escapeHtml(provenance.transformations?.rank || "—")}</strong></div>
            </div>
          `}
          <div class="br-source-links">
            ${[
              [source.project || provenance?.source?.project_url, this.t("projectPage")],
              [source.data || provenance?.source?.data_url, this.t("dataPage")],
              [source.reproducibility || provenance?.source?.reproducibility_url, this.t("reproducibility")],
              [source.methodology_2025, this.t("methodologyHandbook")],
              [source.license_url, this.t("license")],
            ].filter(([url]) => url).map(([url, label]) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(label)}</span>${icon("external")}</a>`).join("")}
          </div>
        </article>
      `;
    }

    provenanceSkeletonMarkup() {
      return `<div class="br-provenance-skeleton"><div><i></i><i></i></div><div><i></i><i></i></div><div><i></i><i></i></div><span>${escapeHtml(this.t("provenanceLoading"))}</span></div>`;
    }

    renderDrawer() {
      const host = this.root.querySelector("[data-br-drawer]");
      if (!host) return;
      if (!this.state.drawerIso3) {
        host.innerHTML = "";
        document.documentElement.classList.remove("br-drawer-open");
        return;
      }
      document.documentElement.classList.add("br-drawer-open");
      const profile = this.state.drawer;
      let content = this.loadingMarkup(this.t("loadingCountry"));
      if (profile?.error) content = `<div class="br-drawer-error">${icon("alert")}<h3>${escapeHtml(this.t("networkTitle"))}</h3><code>${escapeHtml(profile.error)}</code></div>`;
      else if (profile) content = this.drawerContentMarkup(profile);
      host.innerHTML = `
        <div class="br-drawer-layer" role="presentation">
          <button type="button" class="br-drawer-backdrop" data-br-close-drawer tabindex="-1" aria-label="${escapeHtml(this.t("close"))}"></button>
          <aside class="br-drawer" role="dialog" aria-modal="true" aria-labelledby="${this.id}-drawer-title">
            <div class="br-drawer__bar"><span>${escapeHtml(this.t("profile"))} · ${this.integer(this.state.edition)}</span><button type="button" class="br-drawer__close" data-br-close-drawer aria-label="${escapeHtml(this.t("close"))}">${icon("close")}</button></div>
            <div class="br-drawer__scroll">${content}</div>
          </aside>
        </div>
      `;
      host.querySelectorAll("[data-br-close-drawer]").forEach((button) => button.addEventListener("click", () => this.closeDrawer()));
      host.querySelectorAll("[data-br-set-dimension]").forEach((button) => button.addEventListener("click", () => this.setDimensionFromToken(button.dataset.brSetDimension)));
    }

    drawerContentMarkup(profile) {
      const economy = profile.economy || {};
      const topicRecords = TOPIC_ORDER.map((code) => ({ code, record: profile.topics?.[code] })).filter((item) => Number.isFinite(Number(item.record?.score)));
      const strongest = [...topicRecords].sort((a, b) => Number(b.record.score) - Number(a.record.score)).slice(0, 3);
      const weakest = [...topicRecords].sort((a, b) => Number(a.record.score) - Number(b.record.score)).slice(0, 3);
      const gapServices = profile.gaps?.public_services_gap;
      const gapEfficiency = profile.gaps?.efficiency_gap;
      return `
        <header class="br-profile-head">
          <div class="br-profile-head__identity"><i>${escapeHtml(initials(economy.economy_name))}</i><div><span>${escapeHtml(economy.iso3 || "")}</span><h2 id="${this.id}-drawer-title">${escapeHtml(economy.economy_name || "")}</h2><p>${escapeHtml([economy.region, economy.income_group].filter(Boolean).join(" · "))}</p></div></div>
          <span class="br-profile-head__badge">${icon("shield")}${escapeHtml(this.t("noAggregateShort"))}</span>
        </header>
        <section class="br-profile-section"><div class="br-profile-section__head"><span>I · II · III</span><h3>${escapeHtml(this.t("officialPillars"))}</h3></div><div class="br-profile-pillars">${PILLAR_ORDER.map((code, index) => this.profilePillarMarkup(code, index, profile.pillars?.[code])).join("")}</div></section>
        <section class="br-profile-gap"><div><span>${escapeHtml(this.t("frameworkVsServices"))}</span><strong class="${Number(gapServices) > 0 ? "is-warn" : "is-good"}">${this.signed(gapServices, 1)}</strong><small>${escapeHtml(this.t("points"))}</small></div><i></i><div><span>${escapeHtml(this.t("frameworkVsEfficiency"))}</span><strong class="${Number(gapEfficiency) > 0 ? "is-warn" : "is-good"}">${this.signed(gapEfficiency, 1)}</strong><small>${escapeHtml(this.t("points"))}</small></div></section>
        <section class="br-profile-section"><div class="br-profile-section__head"><span>10 TOPICS</span><h3>${escapeHtml(this.t("topicProfile"))}</h3></div>${this.profileTopicsMarkup(profile)}</section>
        ${Object.values(profile.topic_pillar_matrix || {}).some((row) => Object.keys(row || {}).length) ? `<section class="br-profile-section"><div class="br-profile-section__head"><span>10 × 3</span><h3>${escapeHtml(this.t("diagnosticMatrix"))}</h3></div>${this.profileMatrixMarkup(profile)}</section>` : ""}
        <div class="br-profile-insights">${this.profileInsightMarkup(this.t("strengths"), strongest, "strong")}${this.profileInsightMarkup(this.t("constraints"), weakest, "weak")}</div>
        <footer class="br-source-note">${icon("info")}<span>${escapeHtml(this.t("sourceNote"))}</span></footer>
      `;
    }

    profilePillarMarkup(code, index, record) {
      const score = Number(record?.score);
      return `<button type="button" class="br-profile-pillar" data-br-set-dimension="pillar|${code}|" style="--br-score:${clamp(score, 0, 100)};--br-pillar-color:${PILLAR_COLORS[code]}"><span><i>${["I", "II", "III"][index]}</i><small>${escapeHtml(this.pillarLabel(code))}</small></span><div class="br-profile-pillar__ring"><strong>${this.number(score, 1)}</strong><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18"></circle><circle cx="22" cy="22" r="18" pathLength="100" stroke-dasharray="${clamp(score, 0, 100)} 100"></circle></svg></div><footer><span>#${this.integer(record?.rank)}</span><span>Q${this.integer(record?.quintile)}</span><span>P${this.number(record?.percentile, 0)}</span></footer></button>`;
    }

    profileTopicsMarkup(profile) {
      return `<div class="br-profile-topics">${TOPIC_ORDER.map((code, index) => {
        const record = profile.topics?.[code];
        const score = Number(record?.score);
        return `<button type="button" data-br-set-dimension="topic||${code}"><span><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeHtml(this.topicLabel(code))}</strong></span><em><u style="width:${clamp(score, 0, 100)}%"></u></em><b>${this.number(score, 1)}</b><small>#${this.integer(record?.rank)}</small></button>`;
      }).join("")}</div>`;
    }

    profileMatrixMarkup(profile) {
      return `<div class="br-profile-matrix"><div class="br-profile-matrix__head"><span></span>${PILLAR_ORDER.map((pillar, index) => `<span title="${escapeHtml(this.pillarLabel(pillar))}">${["I", "II", "III"][index]}</span>`).join("")}</div>${TOPIC_ORDER.map((topic, index) => `<div><span title="${escapeHtml(this.topicLabel(topic))}">${String(index + 1).padStart(2, "0")}</span>${PILLAR_ORDER.map((pillar) => { const record = profile.topic_pillar_matrix?.[topic]?.[pillar]; return Number.isFinite(Number(record?.score)) ? `<button type="button" data-br-set-dimension="topic_pillar|${pillar}|${topic}" style="--br-score:${clamp(record.score, 0, 100)}" title="${escapeHtml(`${this.topicLabel(topic)} · ${this.pillarLabel(pillar)}: ${this.number(record.score, 1)}`)}">${this.number(record.score, 0)}</button>` : `<i>—</i>`; }).join("")}</div>`).join("")}</div>`;
    }

    profileInsightMarkup(title, items, tone) {
      return `<article class="is-${tone}"><span>${escapeHtml(title)}</span>${items.map((item) => `<button type="button" data-br-set-dimension="topic||${item.code}"><i>${escapeHtml(this.topicLabel(item.code))}</i><strong>${this.number(item.record.score, 1)}</strong></button>`).join("")}</article>`;
    }

    bindShell() {
      this.root.querySelectorAll("[data-br-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          this.state.tab = button.dataset.brTab;
          this.updateUrl();
          this.render();
          if (this.state.tab === "methodology") this.loadProvenance();
          if (this.state.tab === "compare" && this.state.compareCodes.length >= 2) this.loadComparison();
          this.root.querySelector("[data-br-panel]")?.focus?.();
        });
      });
      this.root.querySelectorAll("[data-br-score-type]").forEach((button) => {
        button.addEventListener("click", () => {
          const value = button.dataset.brScoreType;
          if (!["pillar", "topic", "topic_pillar"].includes(value) || value === this.state.scoreType) return;
          this.state.scoreType = value;
          this.state.ranking = null;
          this.updateUrl();
          this.render();
          this.loadRanking();
        });
      });
      const edition = this.root.querySelector("[data-br-edition]");
      if (edition) edition.addEventListener("change", () => {
        this.state.edition = Number(edition.value);
        this.state.ranking = null;
        this.state.matrix = null;
        this.state.compare = null;
        this.state.provenance = null;
        this.updateUrl();
        this.render();
        Promise.allSettled([this.loadRanking(), this.loadMatrix()]).then(() => {
          if (this.state.compareCodes.length >= 2) this.loadComparison();
        });
      });
      const pillar = this.root.querySelector("[data-br-pillar]");
      if (pillar) pillar.addEventListener("change", () => {
        this.state.pillar = pillar.value;
        this.state.ranking = null;
        this.updateUrl();
        this.render();
        this.loadRanking();
      });
      const topic = this.root.querySelector("[data-br-topic]");
      if (topic) topic.addEventListener("change", () => {
        this.state.topic = topic.value;
        this.state.ranking = null;
        this.updateUrl();
        this.render();
        this.loadRanking();
      });
      this.root.querySelectorAll("[data-br-copy-link]").forEach((button) => button.addEventListener("click", () => this.copyText(window.location.href, this.t("copied"))));
      this.root.querySelectorAll("[data-br-retry]").forEach((button) => button.addEventListener("click", () => this.retry()));
      this.root.querySelectorAll("[data-br-copy-command]").forEach((button) => button.addEventListener("click", () => this.copyText(button.dataset.brCopyCommand, this.t("commandCopied"))));
      this.bindPanel();
    }

    bindPanel() {
      const search = this.root.querySelector("[data-br-search]");
      if (search) search.addEventListener("input", debounce(() => {
        this.state.query = search.value;
        this.renderCurrentPanel();
        const replacement = this.root.querySelector("[data-br-search]");
        replacement?.focus();
        if (replacement) replacement.setSelectionRange(replacement.value.length, replacement.value.length);
      }, 120));
      const sort = this.root.querySelector("[data-br-sort]");
      if (sort) sort.addEventListener("change", () => { this.state.sort = sort.value; this.renderCurrentPanel(); });
      this.root.querySelectorAll("[data-br-clear-search]").forEach((button) => button.addEventListener("click", () => { this.state.query = ""; this.renderCurrentPanel(); }));
      this.root.querySelectorAll("[data-br-open-country]").forEach((button) => button.addEventListener("click", () => this.loadProfile(String(button.dataset.brOpenCountry || "").toUpperCase(), button)));
      this.root.querySelectorAll("[data-br-map-iso], [data-br-scatter-iso]").forEach((node) => {
        const iso3 = String(node.dataset.brMapIso || node.dataset.brScatterIso || "").toUpperCase();
        if (!iso3) return;
        node.addEventListener("click", () => this.loadProfile(iso3, node));
        node.addEventListener("keydown", (event) => {
          if (["Enter", " "].includes(event.key)) { event.preventDefault(); this.loadProfile(iso3, node); }
        });
      });
      this.root.querySelectorAll("[data-br-select-pillar]").forEach((button) => button.addEventListener("click", () => this.selectDimension("pillar", button.dataset.brSelectPillar, null, "ranking")));
      this.root.querySelectorAll("[data-br-select-topic]").forEach((button) => button.addEventListener("click", () => this.selectDimension("topic", null, button.dataset.brSelectTopic, "ranking")));
      this.root.querySelectorAll("[data-br-set-dimension]").forEach((button) => button.addEventListener("click", () => this.setDimensionFromToken(button.dataset.brSetDimension)));
      const matrixSelect = this.root.querySelector("[data-br-matrix-economy]");
      if (matrixSelect) matrixSelect.addEventListener("change", () => {
        this.state.matrixIso3 = matrixSelect.value;
        this.updateUrl();
        this.renderCurrentPanel();
      });
      this.root.querySelectorAll("[data-br-matrix-select]").forEach((button) => button.addEventListener("click", () => {
        this.state.matrixIso3 = button.dataset.brMatrixSelect;
        this.updateUrl();
        this.renderCurrentPanel();
        this.root.querySelector(".br-matrix-selector")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      }));
      const add = this.root.querySelector("[data-br-add-compare]");
      const compareSelect = this.root.querySelector("[data-br-compare-select]");
      if (add && compareSelect) add.addEventListener("click", () => this.addCompare(compareSelect.value));
      if (compareSelect) compareSelect.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); this.addCompare(compareSelect.value); } });
      this.root.querySelectorAll("[data-br-remove-compare]").forEach((button) => button.addEventListener("click", () => this.removeCompare(button.dataset.brRemoveCompare)));
      this.root.querySelectorAll("[data-br-quick-compare]").forEach((button) => button.addEventListener("click", () => this.addCompare(button.dataset.brQuickCompare)));
    }

    setDimensionFromToken(token) {
      const [scoreType, pillar, topic] = String(token || "").split("|");
      this.selectDimension(scoreType, pillar || null, topic || null, "ranking");
      this.closeDrawer(false);
    }

    selectDimension(scoreType, pillar, topic, tab = this.state.tab) {
      if (!["pillar", "topic", "topic_pillar"].includes(scoreType)) return;
      this.state.scoreType = scoreType;
      if (pillar && PILLAR_ORDER.includes(pillar)) this.state.pillar = pillar;
      if (topic && TOPIC_ORDER.includes(topic)) this.state.topic = topic;
      this.state.tab = tab;
      this.state.ranking = null;
      this.updateUrl();
      this.render();
      this.loadRanking();
    }

    addCompare(value) {
      const code = String(value || "").toUpperCase();
      if (!/^[A-Z]{3}$/.test(code) || this.state.compareCodes.includes(code) || this.state.compareCodes.length >= MAX_COMPARE) return;
      this.state.compareCodes.push(code);
      this.state.compare = null;
      this.updateUrl();
      this.renderCurrentPanel();
      if (this.state.compareCodes.length >= 2) this.loadComparison();
    }

    removeCompare(value) {
      const code = String(value || "").toUpperCase();
      this.state.compareCodes = this.state.compareCodes.filter((item) => item !== code);
      this.state.compare = null;
      this.updateUrl();
      this.renderCurrentPanel();
      if (this.state.compareCodes.length >= 2) this.loadComparison();
    }

    closeDrawer(restore = true) {
      this.state.drawerIso3 = null;
      this.state.drawer = null;
      this.state.profileLoading = false;
      this.renderDrawer();
      if (restore && this.returnFocus?.focus) this.returnFocus.focus();
      this.returnFocus = null;
    }

    onWindowKeydown(event) {
      if (!this.state.drawerIso3) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = this.root.querySelector(".br-drawer");
      if (!drawer) return;
      const focusable = [...drawer.querySelectorAll('button:not([disabled]), a[href], select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((node) => !node.hidden && node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    async copyText(value, message) {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(String(value));
        else {
          const input = document.createElement("textarea");
          input.value = String(value); input.style.position = "fixed"; input.style.opacity = "0";
          document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove();
        }
        this.showToast(message);
      } catch (_error) {
        this.showToast(message);
      }
    }

    showToast(message) {
      this.state.toast = message;
      this.renderToast(message);
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        this.state.toast = "";
        const host = this.root.querySelector("[data-br-toast]");
        if (host) host.innerHTML = "";
      }, 2400);
    }

    renderToast(message) {
      const host = this.root.querySelector("[data-br-toast]");
      if (!host) return;
      host.innerHTML = `<div class="br-toast" role="status">${icon("check")}<span>${escapeHtml(message)}</span></div>`;
    }

    async retry() {
      this.abortController?.abort();
      this.destroy();
      const replacement = new BreadyWorkspace(this.root, { lang: this.state.lang, theme: this.state.theme });
      instances.set(this.root, replacement);
      instanceRegistry.add(replacement);
      await replacement.mount();
    }
  }

  function render(options = {}) {
    const root = options.root || document.querySelector("#view");
    if (!root) return null;
    const existing = instances.get(root);
    if (existing) {
      existing.setOptions(options);
      return existing;
    }
    const workspace = new BreadyWorkspace(root, options);
    instances.set(root, workspace);
    instanceRegistry.add(workspace);
    workspace.mount();
    return workspace;
  }

  function invalidate() {
    [...instanceRegistry].forEach((workspace) => workspace.destroy());
    instanceRegistry.clear();
    sharedGeoPromise = null;
  }

  window.GIRBREADY = Object.freeze({
    version: VERSION,
    route: ROUTE,
    render,
    invalidate,
  });
})();
