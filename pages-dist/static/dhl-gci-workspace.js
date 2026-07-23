/* GIR — DHL Global Connectedness Index analytical workspace, cumulative stage 10.
 * Evidence-first, licence-aware and dependency-free. The production bundle ships
 * no DHL country-level numeric rows. Country analytics activate only after an
 * operator-authorized local import; static mode remains a release observatory.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)dhl-gci-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const API_BASE = "/api/security-connectivity/dhl-gci";
  const META_URL = new URL("dhl-gci/dhl_gci_frontend_meta.json", STATIC_BASE).href;
  const GEO_URL = new URL("goci/goci-world-geo.json", STATIC_BASE).href;
  const TOKEN_KEY = "gir-dhl-gci-session-token";
  const LATEST_YEAR = 2024;
  const EARLIEST_YEAR = 2001;
  const DEFAULT_PILLAR = "overall";
  const DEFAULT_DIMENSION = "overall";
  const RANK_LIMIT = 500;

  const COPY = {
    ru: {
      module: "Безопасность и международная связанность",
      title: "Глобальный индекс связанности DHL",
      acronym: "DHL GCI",
      lead: "Доказательная обсерватория международных потоков торговли, капитала, информации и людей — с отдельным измерением глубины и географической широты связей.",
      release: "Выпуск 2026 · страновые баллы по 2024 год",
      loading: "Загружаем обсерваторию связанности",
      loadingText: "Проверяем метаданные выпуска, контур доступа и доступность авторизованного числового слоя.",
      loadError: "Не удалось открыть модуль DHL GCI",
      retry: "Повторить",
      overview: "Обзор выпуска",
      exploreData: "Перейти к аналитике",
      methodology: "Методология",
      officialReport: "Официальный отчёт",
      downloadCenter: "Центр загрузок",
      repository: "Репозиторий данных",
      sourceLayer: "Источник",
      publicMode: "Публичная обсерватория",
      liveMode: "Авторизованная аналитика",
      staticMode: "Статический metadata-слой",
      dataLocked: "Числовой слой не импортирован",
      privateToken: "Требуется приватный токен",
      connected: "Числовой слой подключён",
      validating: "Проверяем доступ",
      edition: "Выпуск",
      countryScores: "Страновые оценки",
      globalFindings: "Глобальные выводы",
      reportYear: "Год отчёта",
      timeSeparation: "Два временных слоя не смешиваются",
      timeSeparationText: "Страновые баллы и места заканчиваются 2024 годом. Глобальные выводы отчёта используют более свежие данные и оценки по 2025 году.",
      countries: "стран и территорий",
      flows: "типов потоков",
      dataPoints: "млн+ наблюдений",
      gdpCoverage: "мирового ВВП",
      populationCoverage: "населения мира",
      recordDepth: "Глобальная глубина",
      stableHeadline: "Связанность остаётся близкой к рекордному уровню",
      stableText: "Отчёт не фиксирует значимого отката глобализации после рекорда 2022 года. Международные потоки меняют конфигурацию, но не исчезают.",
      leaders: "Лидеры выпуска",
      overallLeader: "Общая связанность",
      depthLeader: "Глубина",
      breadthLeader: "Широта",
      increaseLeader: "Рост с 2001 года",
      sourceNote: "Показаны только опубликованные факты уровня отчёта. Полный страновой набор в архив не включён.",
      accessKicker: "Контур доступа",
      accessTitle: "Числа остаются у правообладателя",
      accessText: "Frontend готов к полноценной аналитике, но официальный CSV загружается оператором непосредственно из репозитория и публикуется только при наличии соответствующего основания.",
      noBundledData: "В патче нет страновых значений",
      noImplicitDownload: "Нет скрытого скачивания",
      permissionGate: "Доступ фиксируется в аудите",
      publicExportGate: "Публичный экспорт закрыт по умолчанию",
      importStep1: "Получить официальный CSV",
      importStep1Text: "Скачать файл 2001–2024 непосредственно из официального DOI-репозитория или центра загрузок DHL.",
      importStep2: "Проверить хеш и условия",
      importStep2Text: "Сверить MD5/SHA-256, применимые условия использования и реальное основание хранения или публикации.",
      importStep3: "Выполнить локальный импорт",
      importStep3Text: "Запустить permission-gated импортёр; после проверки структуры, формулы и охвата API активирует аналитический слой.",
      copyCommand: "Копировать команду",
      copied: "Команда скопирована",
      tokenLabel: "Токен приватного API",
      tokenPlaceholder: "Введите X-GIR-DHL-Token",
      connect: "Подключить",
      disconnect: "Отключить",
      tokenNote: "Токен хранится только в sessionStorage текущей вкладки и не попадает в URL или статическую сборку.",
      accessDenied: "Доступ к числовому API не подтверждён",
      accessDeniedText: "Проверьте токен, переменную GIIP_DHL_GCI_PRIVATE_TOKEN и запись разрешения импорта.",
      architectureKicker: "Архитектура индекса",
      architectureTitle: "Четыре потока × два измерения",
      architectureText: "DHL GCI измеряет фактические международные потоки. Общий балл сочетает их величину относительно внутренней активности и распределение по зарубежным партнёрам.",
      depth: "Глубина",
      breadth: "Широта",
      overall: "Общий балл",
      trade: "Торговля",
      capital: "Капитал",
      information: "Информация",
      people: "Люди",
      weight: "Вес",
      coverage: "Охват 2024",
      flowTypes: "Типы потоков",
      depthText: "Объём международных потоков относительно внутренней активности страны.",
      breadthText: "Насколько широко потоки распределены между зарубежными партнёрами.",
      formula: "Общий балл = геометрическое среднее Depth и Breadth",
      formulaNote: "GIR сохраняет опубликованный общий балл. Представления Depth/Breadth 0–100 получаются из компонент официального CSV умножением на два.",
      noEconomicSize: "Не рейтинг размера экономики",
      noEconomicSizeText: "Небольшая открытая экономика может быть глубоко связана с миром, а крупная — иметь большие абсолютные потоки, но меньшую глубину относительно внутренней активности.",
      noSynthetic: "Без нового синтетического композита",
      noSyntheticText: "GIR не объединяет DHL GCI с торговым оборотом, ВВП, логистикой или геополитикой в собственный показатель.",
      comparability: "Сравнимость внутри выпуска",
      comparabilityText: "Исторический ряд 2001–2024 сравнивается внутри одной нормализованной панели выпуска 2026; значения разных выпусков не склеиваются автоматически.",
      profileKicker: "Профиль страны",
      profileTitle: "Как страна соединена с миром",
      profileText: "Общий ранг, баланс глубины и широты, четыре направления потоков и изменения внутри текущей редакции.",
      selectedCountry: "Выбранная страна",
      year: "Год",
      rank: "Место",
      score: "Баллы",
      percentile: "Процентиль",
      change1y: "Изменение за год",
      change2019: "С 2019 года",
      rankChange: "Изменение места",
      noData: "Нет данных",
      officialScore: "Официальный балл",
      officialRank: "Официальное место",
      derivedView: "Представление GIR",
      balance: "Баланс Depth × Breadth",
      depthDriven: "Преимущественно глубина",
      breadthDriven: "Преимущественно широта",
      balanced: "Сбалансированный профиль",
      pillarProfile: "Профиль четырёх потоков",
      matrixKicker: "Глобальная матрица",
      matrixTitle: "Depth × Breadth",
      matrixText: "Все страны в одном аналитическом пространстве: величина международных потоков относительно внутренней активности и их географическое распределение.",
      depthAxis: "Глубина международных потоков",
      breadthAxis: "Географическая широта",
      highHigh: "Глубокая и широкая связанность",
      highDepth: "Глубокая, но концентрированная",
      highBreadth: "Широкая, но неглубокая",
      lowLow: "Ограниченная связанность",
      matrixDiagnostic: "Квадранты являются визуальной диагностикой GIR, а не отдельной классификацией DHL.",
      mapKicker: "Атлас связанности",
      mapTitle: "География международных потоков",
      mapText: "Переключайте направление и измерение, чтобы увидеть, где связанность основана на масштабе потоков, а где — на распределении партнёров.",
      metric: "Показатель",
      pillar: "Направление",
      dimension: "Измерение",
      mapKeyboard: "Карта доступна с клавиатуры: стрелки меняют страну, Enter открывает профиль.",
      distribution: "Распределение стран",
      selectedValue: "Значение выбранной страны",
      trendKicker: "Динамика",
      trendTitle: "Траектория связанности",
      trendText: "Длинный ряд внутри выпуска 2026 позволяет отделить краткосрочный шум от структурного изменения международных связей.",
      period: "Период",
      allYears: "2001–2024",
      since2019: "С 2019",
      last10: "Последние 10 лет",
      latest: "Последнее значение",
      minimum: "Минимум",
      maximum: "Максимум",
      comparisonKicker: "Лаборатория сравнения",
      comparisonTitle: "До пяти стран в одной системе координат",
      comparisonText: "Сопоставляйте не только итоговый балл, но и различия между глубиной, широтой и четырьмя типами потоков.",
      addCountry: "Добавить страну",
      reset: "Сбросить",
      remove: "Удалить",
      rankingKicker: "Полный рейтинг",
      rankingTitle: "Рейтинг стран и территорий",
      rankingText: "Официальные баллы и места с поиском, сортировкой, фильтром по направлению и доступом к доказательной записи каждой строки.",
      search: "Поиск страны или ISO3",
      sortBy: "Сортировка",
      byRank: "По месту",
      byScore: "По баллу",
      byCountry: "По названию",
      byChange: "По изменению",
      direction: "Направление",
      ascending: "По возрастанию",
      descending: "По убыванию",
      rowsPerPage: "Строк на странице",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      results: "результатов",
      exportCsv: "Экспорт CSV",
      exportBlocked: "Экспорт не разрешён текущим основанием доступа",
      evidence: "Доказательная запись",
      provenance: "Происхождение данных",
      close: "Закрыть",
      sourceCsv: "Исходный CSV",
      sourceRow: "Строка источника",
      sourceOrder: "Порядок строки",
      rowHash: "SHA-256 строки",
      csvHash: "SHA-256 CSV",
      csvMd5: "MD5 CSV",
      snapshot: "Snapshot ID",
      transformation: "Transformation run",
      transform: "Transform ID",
      formulaVersion: "Версия формулы",
      quality: "Флаг качества",
      scoreStatus: "Статус балла",
      rankStatus: "Статус места",
      formulaResidual: "Остаток формулы",
      sourceRights: "Правовой статус источника",
      permissionBasis: "Основание доступа",
      openSource: "Открыть официальный источник",
      attribution: "Источник: DHL Global Connectedness Report 2026, Steven A. Altman и Caroline R. Bastian, DHL Group / NYU Stern.",
      validationTitle: "Валидационный числовой слой",
      validationText: "Эта браузерная проверка использует отдельный маркированный fixture. Он не входит в патч и не является данными DHL.",
      validationBadge: "LAB · НЕ ДАННЫЕ DHL",
      zeroResults: "По заданным условиям стран не найдено",
      backend: "FastAPI + SQLite",
      fallback: "Проверенный статический metadata-слой",
      ready: "Готово",
      busy: "Обновляем данные",
      reportFacts: "Факты выпуска",
      dataContract: "Научный контракт",
      interfaceVersion: "Frontend 10.0.0",
      countryScoreLayer: "Страновой слой",
      globalTrendLayer: "Глобальный слой",
      numericAnalytics: "Числовая аналитика",
      gated: "Защищено",
      published: "Опубликовано",
      retrieved: "Получено",
      publisher: "Издатель",
      researchPartner: "Исследовательский партнёр",
      dataAudience: "Аудитория API",
      csvExport: "CSV-экспорт",
      enabled: "Разрешён",
      disabled: "Запрещён",
      status: "Статус",
      sourceCoverage: "Охват источника",
      publicHighlights: "Открытые выводы отчёта",
      mapNoGeometry: "Страна доступна в рейтинге, но не имеет отдельного контура в компактной карте.",
    },
    en: {
      module: "Security & international connectivity",
      title: "DHL Global Connectedness Index",
      acronym: "DHL GCI",
      lead: "An evidence-first observatory of international trade, capital, information and people flows, with depth and geographic breadth kept analytically distinct.",
      release: "2026 edition · country scores through 2024",
      loading: "Loading the connectedness observatory",
      loadingText: "Checking release metadata, access policy and the availability of an authorized numeric layer.",
      loadError: "The DHL GCI module could not be opened",
      retry: "Retry",
      overview: "Release overview",
      exploreData: "Open analytics",
      methodology: "Methodology",
      officialReport: "Official report",
      downloadCenter: "Download centre",
      repository: "Data repository",
      sourceLayer: "Source",
      publicMode: "Public release observatory",
      liveMode: "Authorized analytics",
      staticMode: "Static metadata layer",
      dataLocked: "Numeric layer has not been imported",
      privateToken: "Private token required",
      connected: "Numeric layer connected",
      validating: "Validating access",
      edition: "Edition",
      countryScores: "Country scores",
      globalFindings: "Global findings",
      reportYear: "Report year",
      timeSeparation: "Two time layers are kept separate",
      timeSeparationText: "Country scores and ranks end in 2024. The report's global findings use newer observations and estimates through 2025.",
      countries: "countries and territories",
      flows: "flow types",
      dataPoints: "million+ observations",
      gdpCoverage: "of world GDP",
      populationCoverage: "of world population",
      recordDepth: "Global depth",
      stableHeadline: "Connectedness remains close to its record",
      stableText: "The report finds no meaningful retreat from globalization after the 2022 record. International flows are changing configuration, not disappearing.",
      leaders: "Edition leaders",
      overallLeader: "Overall connectedness",
      depthLeader: "Depth",
      breadthLeader: "Breadth",
      increaseLeader: "Increase since 2001",
      sourceNote: "Only report-level published facts are shown. The full country dataset is not bundled.",
      accessKicker: "Access control",
      accessTitle: "The numbers remain with the rights holder",
      accessText: "The frontend is ready for full analytics, but the official CSV is supplied locally by the operator and exposed only under a recorded applicable basis.",
      noBundledData: "No country values in the patch",
      noImplicitDownload: "No hidden download",
      permissionGate: "Access is audit-recorded",
      publicExportGate: "Public export is closed by default",
      importStep1: "Obtain the official CSV",
      importStep1Text: "Download the 2001–2024 file directly from the official DOI repository or DHL download centre.",
      importStep2: "Verify hash and terms",
      importStep2Text: "Check MD5/SHA-256, applicable terms and the actual basis for storage or publication.",
      importStep3: "Run the local import",
      importStep3Text: "Run the permission-gated importer; after structural, formula and coverage checks, the API activates analytics.",
      copyCommand: "Copy command",
      copied: "Command copied",
      tokenLabel: "Private API token",
      tokenPlaceholder: "Enter X-GIR-DHL-Token",
      connect: "Connect",
      disconnect: "Disconnect",
      tokenNote: "The token is stored only in this tab's sessionStorage and never enters a URL or static build.",
      accessDenied: "Numeric API access was not confirmed",
      accessDeniedText: "Check the token, GIIP_DHL_GCI_PRIVATE_TOKEN and the permission record created during import.",
      architectureKicker: "Index architecture",
      architectureTitle: "Four flows × two dimensions",
      architectureText: "DHL GCI measures actual international flows. The overall score combines their magnitude relative to domestic activity and their geographic distribution across foreign partners.",
      depth: "Depth",
      breadth: "Breadth",
      overall: "Overall",
      trade: "Trade",
      capital: "Capital",
      information: "Information",
      people: "People",
      weight: "Weight",
      coverage: "2024 coverage",
      flowTypes: "Flow types",
      depthText: "International flows relative to a country's domestic activity.",
      breadthText: "How widely flows are distributed across foreign partner countries.",
      formula: "Overall score = geometric mean of Depth and Breadth",
      formulaNote: "GIR preserves the published overall score. The 0–100 Depth/Breadth views equal twice the components stored in the official CSV.",
      noEconomicSize: "Not an economic-size ranking",
      noEconomicSizeText: "A small open economy can be deeply connected, while a large economy may have larger absolute flows but lower depth relative to domestic activity.",
      noSynthetic: "No new synthetic composite",
      noSyntheticText: "GIR does not merge DHL GCI with trade volume, GDP, logistics or geopolitics into a proprietary score.",
      comparability: "Within-edition comparability",
      comparabilityText: "The 2001–2024 history is compared inside one normalized 2026 panel; scores from different report editions are not automatically stitched together.",
      profileKicker: "Country profile",
      profileTitle: "How a country connects to the world",
      profileText: "Official rank, depth–breadth balance, four flow pillars and within-edition changes.",
      selectedCountry: "Selected country",
      year: "Year",
      rank: "Rank",
      score: "Score",
      percentile: "Percentile",
      change1y: "One-year change",
      change2019: "Since 2019",
      rankChange: "Rank change",
      noData: "No data",
      officialScore: "Official score",
      officialRank: "Official rank",
      derivedView: "GIR presentation",
      balance: "Depth × Breadth balance",
      depthDriven: "Depth-led profile",
      breadthDriven: "Breadth-led profile",
      balanced: "Balanced profile",
      pillarProfile: "Four-flow profile",
      matrixKicker: "Global matrix",
      matrixTitle: "Depth × Breadth",
      matrixText: "All countries in one analytical space: the magnitude of international flows relative to domestic activity and their geographic distribution.",
      depthAxis: "Depth of international flows",
      breadthAxis: "Geographic breadth",
      highHigh: "Deep and broad connectedness",
      highDepth: "Deep but concentrated",
      highBreadth: "Broad but shallow",
      lowLow: "Limited connectedness",
      matrixDiagnostic: "Quadrants are a GIR visual diagnostic, not a separate DHL classification.",
      mapKicker: "Connectedness atlas",
      mapTitle: "Geography of international flows",
      mapText: "Switch pillar and dimension to see where connectedness is based on flow magnitude and where it rests on partner distribution.",
      metric: "Metric",
      pillar: "Pillar",
      dimension: "Dimension",
      mapKeyboard: "Keyboard map: arrow keys move between countries and Enter opens a profile.",
      distribution: "Country distribution",
      selectedValue: "Selected-country value",
      trendKicker: "Time series",
      trendTitle: "Connectedness trajectory",
      trendText: "The long panel inside the 2026 edition helps distinguish short-term noise from structural changes in international connections.",
      period: "Period",
      allYears: "2001–2024",
      since2019: "Since 2019",
      last10: "Last 10 years",
      latest: "Latest",
      minimum: "Minimum",
      maximum: "Maximum",
      comparisonKicker: "Comparison lab",
      comparisonTitle: "Up to five countries in one frame",
      comparisonText: "Compare not only the headline score but differences across depth, breadth and the four flow pillars.",
      addCountry: "Add country",
      reset: "Reset",
      remove: "Remove",
      rankingKicker: "Full ranking",
      rankingTitle: "Country and territory ranking",
      rankingText: "Official scores and ranks with search, sorting, pillar filters and an evidence record for every row.",
      search: "Search country or ISO3",
      sortBy: "Sort by",
      byRank: "Rank",
      byScore: "Score",
      byCountry: "Country",
      byChange: "Change",
      direction: "Direction",
      ascending: "Ascending",
      descending: "Descending",
      rowsPerPage: "Rows per page",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      results: "results",
      exportCsv: "Export CSV",
      exportBlocked: "Export is not allowed by the current access basis",
      evidence: "Evidence record",
      provenance: "Data provenance",
      close: "Close",
      sourceCsv: "Source CSV",
      sourceRow: "Source row",
      sourceOrder: "Source order",
      rowHash: "Row SHA-256",
      csvHash: "CSV SHA-256",
      csvMd5: "CSV MD5",
      snapshot: "Snapshot ID",
      transformation: "Transformation run",
      transform: "Transform ID",
      formulaVersion: "Formula version",
      quality: "Quality flag",
      scoreStatus: "Score status",
      rankStatus: "Rank status",
      formulaResidual: "Formula residual",
      sourceRights: "Source rights",
      permissionBasis: "Access basis",
      openSource: "Open official source",
      attribution: "Source: DHL Global Connectedness Report 2026, Steven A. Altman and Caroline R. Bastian, DHL Group / NYU Stern.",
      validationTitle: "Validation numeric layer",
      validationText: "This browser check uses a separate labelled fixture. It is not included in the patch and is not DHL data.",
      validationBadge: "LAB · NOT DHL DATA",
      zeroResults: "No countries match the selected filters",
      backend: "FastAPI + SQLite",
      fallback: "Verified static metadata layer",
      ready: "Ready",
      busy: "Updating data",
      reportFacts: "Release facts",
      dataContract: "Scientific contract",
      interfaceVersion: "Frontend 10.0.0",
      countryScoreLayer: "Country layer",
      globalTrendLayer: "Global layer",
      numericAnalytics: "Numeric analytics",
      gated: "Gated",
      published: "Published",
      retrieved: "Retrieved",
      publisher: "Publisher",
      researchPartner: "Research partner",
      dataAudience: "API audience",
      csvExport: "CSV export",
      enabled: "Enabled",
      disabled: "Disabled",
      status: "Status",
      sourceCoverage: "Source coverage",
      publicHighlights: "Public report findings",
      mapNoGeometry: "The country remains available in ranking but has no separate polygon in the compact map.",
    },
  };

  const ICONS = {
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4.2 6 4.2 9S15 18 12 21M12 3C9 6 7.8 9 7.8 12S9 18 12 21"/></svg>',
    flow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h11M12 4l3 3-3 3M20 17H9M12 14l-3 3 3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5.1-3.3 8.5-8 10-4.7-1.5-8-4.9-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>',
    database: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V5M4 20h16"/><path d="m7 16 4-5 3 2 4-6"/><circle cx="7" cy="16" r="1"/><circle cx="11" cy="11" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="18" cy="7" r="1"/></svg>',
    trade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h13l2 5h3v5H3z"/><path d="M6 7V4h7v3M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>',
    capital: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 18h16M3 21h18"/></svg>',
    information: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M4.9 4.9a10 10 0 0 1 14.2 0M7.8 7.8a6 6 0 0 1 8.4 0M4.9 19.1a10 10 0 0 0 14.2 0M7.8 16.2a6 6 0 0 0 8.4 0"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.4-4.1 2.4-6 6-6s5.6 1.9 6 6M14 15c3.5-.5 5.8 1.2 7 5"/></svg>',
    depth: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    breadth: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="m7 11 10-4M7 13l10 4"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>',
  };

  const S = {
    context: null,
    meta: null,
    geo: null,
    mode: "loading",
    loadKey: "",
    token: "",
    accessError: null,
    selectedIso: "",
    selectedYear: LATEST_YEAR,
    selectedPillar: DEFAULT_PILLAR,
    selectedDimension: DEFAULT_DIMENSION,
    mapPillar: DEFAULT_PILLAR,
    mapDimension: DEFAULT_DIMENSION,
    ranking: [],
    profile: null,
    trend: null,
    compare: ["SGP", "LUX", "NLD"],
    compareTrends: new Map(),
    busy: false,
    query: "",
    sort: "rank",
    direction: "asc",
    page: 0,
    pageSize: 25,
    trendWindow: "all",
    renderToken: 0,
    tooltipTimer: 0,
  };

  function lang() { return S.context?.lang === "en" ? "en" : "ru"; }
  function tr(key) { return COPY[lang()][key] ?? COPY.en[key] ?? key; }
  function icon(name) { return ICONS[name] || ICONS.info; }
  function esc(value) {
    if (S.context?.escapeHtml) return S.context.escapeHtml(String(value ?? ""));
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
  function fmt(value, digits = 1) {
    const n = num(value); if (n === null) return "—";
    return new Intl.NumberFormat(lang() === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  }
  function intFmt(value) {
    const n = num(value); if (n === null) return "—";
    return new Intl.NumberFormat(lang() === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 0 }).format(n);
  }
  function signed(value, digits = 1) { const n = num(value); return n === null ? "—" : `${n > 0 ? "+" : ""}${fmt(n, digits)}`; }
  function shortHash(value) { const text = String(value || ""); return text.length > 24 ? `${text.slice(0, 12)}…${text.slice(-8)}` : text || "—"; }
  function platformCountry(iso3) {
    const key = String(iso3 || "").toUpperCase();
    return S.context?.platformContext?.countries?.find((item) => String(item.iso3 || "").toUpperCase() === key) || null;
  }
  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : (rowOrIso?.iso3 || rowOrIso?.country?.iso3);
    const row = typeof rowOrIso === "object" ? rowOrIso : S.ranking.find((item) => item.iso3 === String(iso3 || "").toUpperCase());
    const country = platformCountry(iso3);
    if (country) return lang() === "ru" ? (country.name_ru || country.name_en || row?.country_name || iso3) : (country.name_en || country.name_ru || row?.country_name || iso3);
    return row?.country_name || row?.country?.name || row?.name || iso3 || "—";
  }
  function release() { return S.meta?.overview?.release || S.meta?.releases?.releases?.[0] || {}; }
  function highlights() { return S.meta?.public_highlights || {}; }
  function pillars() { return S.meta?.pillars?.pillars || S.meta?.methodology?.official_pillars || S.meta?.methodology?.pillars || []; }
  function pillarByCode(code) { return pillars().find((item) => item.pillar_code === code) || { pillar_code: code, name_en: code, name_ru: code, weight: null, latest_coverage: null, flow_types: [] }; }
  function pillarName(code) { const item = pillarByCode(code); return lang() === "ru" ? item.name_ru : item.name_en; }
  function dimensionName(code) { return code === "depth" ? tr("depth") : code === "breadth" ? tr("breadth") : tr("overall"); }
  function pillarIcon(code) { return code === "trade" ? "trade" : code === "capital" ? "capital" : code === "information" ? "information" : code === "people" ? "people" : "globe"; }
  function sourceUrls() { return S.meta?.source_urls || {}; }
  function isLive() { return S.mode.startsWith("live"); }
  function isValidation() { return Boolean(S.meta?.overview?.validation_fixture || S.meta?.validation_fixture); }
  function apiHeaders() { return S.token ? { "X-GIR-DHL-Token": S.token } : {}; }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    try {
      const response = await fetch(url, { cache: "no-store", ...options, signal: controller.signal });
      const contentType = response.headers.get("content-type") || "";
      const body = contentType.includes("json") ? await response.json() : await response.text();
      if (!response.ok) {
        const detail = body?.detail || body;
        const message = detail?.message || detail?.code || (typeof detail === "string" ? detail : `HTTP ${response.status}`);
        const error = new Error(message);
        error.status = response.status;
        error.detail = detail;
        throw error;
      }
      return body;
    } finally { clearTimeout(timeout); }
  }

  async function loadStaticMeta() {
    const payload = await fetchJson(META_URL);
    return payload;
  }

  async function loadApiMeta() {
    const [overview, releasesPayload, pillarsPayload, methodology, licence, health, staticMeta] = await Promise.all([
      fetchJson(API_BASE),
      fetchJson(`${API_BASE}/releases`),
      fetchJson(`${API_BASE}/pillars`),
      fetchJson(`${API_BASE}/methodology`),
      fetchJson(`${API_BASE}/license`),
      fetchJson(`${API_BASE}/health`),
      loadStaticMeta().catch(() => null),
    ]);
    return {
      schema_version: "1.0.0",
      frontend_stage: 10,
      index_code: "DHL_GCI",
      data_mode: "backend_metadata_with_static_release_facts",
      numeric_rows: health?.counts?.score_rows || 0,
      overview,
      releases: releasesPayload,
      pillars: pillarsPayload,
      methodology,
      license: licence,
      health,
      public_highlights: staticMeta?.public_highlights || null,
      attribution: licence?.attribution || staticMeta?.attribution,
      source_urls: { ...(staticMeta?.source_urls || {}), ...(methodology?.source_urls || {}) },
    };
  }

  async function hydrate() {
    S.accessError = null;
    S.token = sessionStorage.getItem(TOKEN_KEY) || "";
    try {
      S.meta = await loadApiMeta();
      S.mode = "locked-api";
      const overview = S.meta.overview || {};
      if (overview.imported && overview.api_audience === "public") {
        S.mode = "live-public-pending";
        await loadLiveData();
      } else if (overview.imported && overview.api_audience === "private_internal") {
        if (S.token) {
          S.mode = "live-private-pending";
          try { await loadLiveData(); }
          catch (error) { S.accessError = error; S.mode = "token"; }
        } else S.mode = "token";
      }
    } catch (_) {
      S.meta = await loadStaticMeta();
      S.mode = "locked-static";
    }
    try { S.geo = await fetchJson(GEO_URL); }
    catch (_) { S.geo = { type: "FeatureCollection", features: [], points: [] }; }
  }

  function rankingParams() {
    return new URLSearchParams({
      year: String(S.selectedYear),
      pillar: S.selectedPillar,
      dimension: S.selectedDimension,
      limit: String(RANK_LIMIT),
      offset: "0",
      sort: "rank",
      direction: "asc",
      include_provenance: "false",
    });
  }

  async function loadLiveData({ preserveSelection = false } = {}) {
    const headers = apiHeaders();
    const ranking = await fetchJson(`${API_BASE}/ranking?${rankingParams()}`, { headers });
    S.ranking = Array.isArray(ranking.rows) ? ranking.rows : [];
    if (!S.ranking.length) throw new Error(tr("noData"));
    const available = new Set(S.ranking.map((row) => row.iso3));
    if (!preserveSelection || !available.has(S.selectedIso)) {
      const requested = String(S.context?.country || S.selectedIso || "").toUpperCase();
      S.selectedIso = available.has(requested) ? requested : String(S.context?.country || "").toUpperCase();
    }
    const [profile, trend] = await Promise.all([
      fetchJson(`${API_BASE}/countries/${encodeURIComponent(S.selectedIso)}?year=${S.selectedYear}`, { headers }),
      fetchJson(`${API_BASE}/trend?iso3=${encodeURIComponent(S.selectedIso)}&pillar=${encodeURIComponent(S.selectedPillar)}&dimension=${encodeURIComponent(S.selectedDimension)}`, { headers }),
    ]);
    S.profile = profile;
    S.trend = trend;
    S.compareTrends.set(`${S.selectedIso}:${S.selectedPillar}:${S.selectedDimension}`, trend);
    if (!S.compare.includes(S.selectedIso)) S.compare = [S.selectedIso, ...S.compare].slice(0, 5);
    S.mode = S.meta?.overview?.api_audience === "public" ? "live-public" : "live-private";
  }

  async function refreshMetric() {
    S.busy = true; paint();
    try { await loadLiveData({ preserveSelection: true }); }
    catch (error) { S.accessError = error; }
    finally { S.busy = false; paint(); }
  }

  function selectedRow() { return S.ranking.find((row) => row.iso3 === S.selectedIso) || null; }
  function profileRecord(code) { return S.profile?.profiles?.find((item) => item.pillar_code === code) || null; }
  function dimensionRecord(profile, code = S.selectedDimension) { return profile?.dimensions?.[code] || null; }
  function rowScore(row, dimension = S.selectedDimension) {
    if (!row) return null;
    return dimension === "depth" ? num(row.depth_level) : dimension === "breadth" ? num(row.breadth_level) : num(row.overall_score ?? row.score);
  }
  function rowRank(row, dimension = S.selectedDimension) {
    if (!row) return null;
    return dimension === "depth" ? num(row.depth_rank) : dimension === "breadth" ? num(row.breadth_rank) : num(row.overall_rank ?? row.rank);
  }
  function rowChange(row, period = "1y", dimension = S.selectedDimension) {
    const prefix = dimension === "depth" ? "depth_level" : dimension === "breadth" ? "breadth_level" : "overall_score";
    return num(row?.[`${prefix}_change_${period === "1y" ? "1y" : "since_2019"}`] ?? row?.[`score_change_${period === "1y" ? "1y" : "since_2019"}`]);
  }
  function rowRankChange(row, period = "1y", dimension = S.selectedDimension) {
    const prefix = dimension === "depth" ? "depth_rank" : dimension === "breadth" ? "breadth_rank" : "overall_rank";
    return num(row?.[`${prefix}_change_${period === "1y" ? "1y" : "since_2019"}`] ?? row?.[`rank_change_${period === "1y" ? "1y" : "since_2019"}`]);
  }
  function displayPercentile(row) {
    const value = num(row?.percentile);
    if (value !== null) return value;
    const rank = rowRank(row); const population = S.ranking.length;
    return rank === null || population < 2 ? null : ((population - rank) / (population - 1)) * 100;
  }
  function flag(row, cls = "dhlg-flag") {
    const iso = row?.iso3 || row?.country?.iso3;
    if (!iso) return `<span class="${cls} placeholder" aria-hidden="true"></span>`;
    const country = platformCountry(iso) || { iso3: iso, name_ru: countryName(row), name_en: countryName(row) };
    if (S.context?.flagImage) return S.context.flagImage(country, cls);
    return `<span class="${cls} placeholder" aria-hidden="true">${esc(iso)}</span>`;
  }

  function sectionHeading(kicker, title, text, id, controls = "") {
    return `<header class="dhlg-section-head"${id ? ` id="${esc(id)}"` : ""}><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(text)}</p></div>${controls}</header>`;
  }

  function validationBannerMarkup() {
    if (!isValidation()) return "";
    return `<aside class="dhlg-validation" role="note">${icon("info")}<div><strong>${esc(tr("validationTitle"))}</strong><p>${esc(tr("validationText"))}</p></div><span>${esc(tr("validationBadge"))}</span></aside>`;
  }

  function heroMarkup() {
    const h = highlights();
    const selected = selectedRow();
    const heroValue = isLive() && selected ? fmt(rowScore(selected), 1) : fmt(h?.global_depth?.year_2025_projected_percent ?? 25, 1);
    const heroUnit = isLive() ? dimensionName(S.selectedDimension) : "%";
    return `<section class="dhlg-hero" id="dhlg-overview"><div class="dhlg-hero-grid"><div class="dhlg-hero-copy"><div class="dhlg-kicker"><b>${esc(tr("acronym"))}</b><span>${esc(tr("module"))}</span></div><h1>${esc(tr("title"))}</h1><p>${esc(tr("lead"))}</p><div class="dhlg-hero-meta"><span>${icon("database")}${esc(tr("release"))}</span><span>${icon("flow")}${esc(`${S.meta?.overview?.latest_country_count || 180} ${tr("countries")}`)}</span><span>${icon("globe")}${esc(`${S.meta?.overview?.flow_type_count || 14} ${tr("flows")}`)}</span></div><div class="dhlg-actions"><button type="button" class="dhlg-btn primary" data-dhlg-action="jump" data-target="${isLive() ? "dhlg-profile" : "dhlg-access"}">${icon(isLive() ? "chart" : "lock")}${esc(isLive() ? tr("exploreData") : tr("accessKicker"))}</button><a class="dhlg-btn" href="${esc(sourceUrls().report || release().official_report_url || "https://www.dhl.com/global-en/microsites/core/global-connectedness/report.html")}" target="_blank" rel="noopener">${icon("external")}${esc(tr("officialReport"))}</a></div></div><div class="dhlg-orbit" aria-label="${esc(isLive() ? `${countryName(selected)}: ${heroValue}` : `${tr("recordDepth")}: ${heroValue}%`)}"><div class="dhlg-globe"><i class="lat a"></i><i class="lat b"></i><i class="lon a"></i><i class="lon b"></i><span class="arc arc-a"></span><span class="arc arc-b"></span><span class="arc arc-c"></span><div class="dhlg-globe-core"><small>${esc(isLive() ? countryName(selected) : tr("recordDepth"))}</small><strong>${esc(heroValue)}</strong><em>${esc(heroUnit)}</em></div></div><div class="dhlg-orbit-card card-a"><span>${esc(tr("countryScores"))}</span><b>2001–2024</b></div><div class="dhlg-orbit-card card-b"><span>${esc(tr("globalFindings"))}</span><b>2025</b></div><div class="dhlg-orbit-card card-c"><span>${esc(tr("edition"))}</span><b>2026</b></div></div></div><div class="dhlg-status-strip"><span class="dhlg-status ${isLive() ? "is-live" : ""}"><i></i>${esc(isLive() ? tr("connected") : S.mode === "token" ? tr("privateToken") : tr("publicMode"))}</span><span><b>${esc(tr("sourceLayer"))}:</b> ${esc(S.meta?.data_mode?.includes("static") ? tr("fallback") : tr("backend"))}</span><span><b>${esc(tr("numericAnalytics"))}:</b> ${esc(isLive() ? tr("enabled") : tr("gated"))}</span><span><b>${esc(tr("interfaceVersion"))}</b></span></div></section>`;
  }

  function timeRailMarkup() {
    return `<section class="dhlg-time-rail"><div class="dhlg-time-line"><article><span>2001</span><strong>${esc(tr("countryScoreLayer"))}</strong><small>${esc(tr("countryScores"))}</small></article><i></i><article><span>2024</span><strong>${esc(tr("latest"))}</strong><small>${esc(tr("officialScore"))}</small></article><i class="dashed"></i><article class="global"><span>2025</span><strong>${esc(tr("globalTrendLayer"))}</strong><small>${esc(tr("globalFindings"))}</small></article><i></i><article class="edition"><span>2026</span><strong>${esc(tr("edition"))}</strong><small>DHL GCR</small></article></div><aside>${icon("info")}<div><strong>${esc(tr("timeSeparation"))}</strong><p>${esc(tr("timeSeparationText"))}</p></div></aside></section>`;
  }

  function publicPulseMarkup() {
    const h = highlights();
    const overall = h?.leaders?.overall || [];
    const leader = (item, label, iconName) => `<article>${icon(iconName)}<div><span>${esc(label)}</span><strong>${esc(lang() === "ru" ? item?.name_ru : item?.name_en)}</strong><small>${item?.rank ? `#${item.rank}${item.score_rounded ? ` · ${fmt(item.score_rounded, 0)}` : ""}` : ""}</small></div></article>`;
    return `<section class="dhlg-section dhlg-public-pulse">${sectionHeading(tr("overview"), tr("stableHeadline"), tr("stableText"), "dhlg-release-facts")}<div class="dhlg-fact-grid"><article><span>${esc(tr("dataPoints"))}</span><strong>${fmt(h?.data_points_millions || 9, 0)}+</strong><small>${esc(tr("reportFacts"))}</small></article><article><span>${esc(tr("countries"))}</span><strong>${intFmt(h?.country_profiles || 180)}</strong><small>99.6% ${esc(tr("gdpCoverage"))}</small></article><article><span>${esc(tr("flows"))}</span><strong>${intFmt(h?.flow_types || 14)}</strong><small>99% ${esc(tr("populationCoverage"))}</small></article><article class="depth"><span>${esc(tr("recordDepth"))}</span><strong>${fmt(h?.global_depth?.year_2024_percent || 25.3, 1)}%</strong><small>${esc(`${h?.global_depth?.record_year || 2022}: ${fmt(h?.global_depth?.record_percent || 25.4, 1)}%`)}</small></article></div><div class="dhlg-leader-grid"><div class="dhlg-leader-copy"><span>${esc(tr("leaders"))}</span><h3>${esc(tr("publicHighlights"))}</h3><p>${esc(tr("sourceNote"))}</p></div>${leader(overall[0] || { name_ru: "Сингапур", name_en: "Singapore", rank: 1 }, tr("overallLeader"), "globe")}${leader(h?.leaders?.depth || { name_ru: "Сингапур", name_en: "Singapore" }, tr("depthLeader"), "depth")}${leader(h?.leaders?.breadth || { name_ru: "Великобритания", name_en: "United Kingdom" }, tr("breadthLeader"), "breadth")}${leader(h?.leaders?.largest_increase_since_2001 || { name_ru: "ОАЭ", name_en: "United Arab Emirates" }, tr("increaseLeader"), "chart")}</div></section>`;
  }

  function importCommand() {
    return `python3 scripts/import_dhl_gci.py --csv data/restricted/dhl_gci/dhl-global-connectedness-scores-ranks-2001-2024.csv --expect-sha256 <TRUSTED_SHA256> --accept-dhl-terms --permission-basis private_research --operator-attestation "Authorized internal research; no public redistribution" --api-audience private_internal --db data/global_index_platform.sqlite --json`;
  }

  function accessMarkup() {
    const imported = Boolean(S.meta?.overview?.imported);
    const permission = S.meta?.overview?.permission || {};
    const live = isLive();
    const statusText = live ? tr("connected") : S.mode === "token" ? tr("privateToken") : tr("dataLocked");
    return `<section class="dhlg-section dhlg-access" id="dhlg-access">${sectionHeading(tr("accessKicker"), tr("accessTitle"), tr("accessText"), "", `<span class="dhlg-chip ${live ? "live" : "locked"}">${icon(live ? "check" : "lock")}${esc(statusText)}</span>`)}<div class="dhlg-access-grid"><article class="dhlg-vault-card"><div class="dhlg-vault-icon">${icon("database")}</div><span>${esc(tr("sourceLayer"))}</span><strong>${esc(release().official_csv_filename || "dhl-global-connectedness-scores-ranks-2001-2024.csv")}</strong><dl><div><dt>${esc(tr("status"))}</dt><dd>${esc(imported ? tr("connected") : tr("dataLocked"))}</dd></div><div><dt>MD5</dt><dd class="mono">${esc(shortHash(release().official_csv_expected_md5 || release().metadata?.release?.official_csv_md5))}</dd></div><div><dt>${esc(tr("sourceRights"))}</dt><dd>${esc(S.meta?.license?.repository_rights || release().repository_rights || "All Rights Reserved")}</dd></div><div><dt>${esc(tr("dataAudience"))}</dt><dd>${esc(S.meta?.overview?.api_audience || "disabled")}</dd></div></dl></article><article class="dhlg-policy-card"><ul><li>${icon("check")}<span><strong>${esc(tr("noBundledData"))}</strong><small>0 numeric rows</small></span></li><li>${icon("check")}<span><strong>${esc(tr("noImplicitDownload"))}</strong><small>fail-closed</small></span></li><li>${icon("shield")}<span><strong>${esc(tr("permissionGate"))}</strong><small>${esc(permission.permission_basis || "operator attestation")}</small></span></li><li>${icon("lock")}<span><strong>${esc(tr("publicExportGate"))}</strong><small>${esc(S.meta?.overview?.csv_export_allowed ? tr("enabled") : tr("disabled"))}</small></span></li></ul></article><article class="dhlg-token-card"><span>${esc(tr("privateToken"))}</span><h3>${esc(live ? tr("connected") : tr("tokenLabel"))}</h3>${live ? `<button type="button" class="dhlg-btn" data-dhlg-action="disconnect">${icon("lock")}${esc(tr("disconnect"))}</button>` : `<form data-dhlg-form="token"><label for="dhlgToken">${esc(tr("tokenLabel"))}</label><div><input id="dhlgToken" type="password" autocomplete="off" placeholder="${esc(tr("tokenPlaceholder"))}"><button class="dhlg-btn primary" type="submit">${icon("shield")}${esc(tr("connect"))}</button></div></form>`}<p>${esc(tr("tokenNote"))}</p>${S.accessError ? `<div class="dhlg-access-error"><strong>${esc(tr("accessDenied"))}</strong><span>${esc(S.accessError.message || tr("accessDeniedText"))}</span></div>` : ""}</article></div><div class="dhlg-import-flow"><article><span>01</span>${icon("download")}<h3>${esc(tr("importStep1"))}</h3><p>${esc(tr("importStep1Text"))}</p></article><article><span>02</span>${icon("shield")}<h3>${esc(tr("importStep2"))}</h3><p>${esc(tr("importStep2Text"))}</p></article><article><span>03</span>${icon("database")}<h3>${esc(tr("importStep3"))}</h3><p>${esc(tr("importStep3Text"))}</p></article></div><div class="dhlg-command"><code>${esc(importCommand())}</code><button type="button" data-dhlg-action="copy-command" data-copy="${esc(importCommand())}">${icon("copy")}${esc(tr("copyCommand"))}</button></div></section>`;
  }

  function architectureMarkup() {
    const cards = pillars().filter((item) => item.pillar_code !== "overall").map((item) => `<article class="pillar ${esc(item.pillar_code)}"><div>${icon(pillarIcon(item.pillar_code))}<span>${item.weight == null ? "—" : `${Math.round(item.weight * 100)}%`}</span></div><h3>${esc(lang() === "ru" ? item.name_ru : item.name_en)}</h3><p>${esc(lang() === "ru" ? item.description_ru : item.description_en)}</p><dl><div><dt>${esc(tr("coverage"))}</dt><dd>${intFmt(item.latest_coverage)}</dd></div><div><dt>${esc(tr("flowTypes"))}</dt><dd>${intFmt(item.flow_types?.length || 0)}</dd></div></dl><ul>${(item.flow_types || []).map((flow) => `<li>${esc(lang() === "ru" ? flow.name_ru : flow.name_en)}</li>`).join("")}</ul></article>`).join("");
    return `<section class="dhlg-section dhlg-architecture" id="dhlg-methodology">${sectionHeading(tr("architectureKicker"), tr("architectureTitle"), tr("architectureText"))}<div class="dhlg-dimensions"><article>${icon("depth")}<span>01</span><h3>${esc(tr("depth"))}</h3><p>${esc(tr("depthText"))}</p><div class="dhlg-depth-rings"><i></i><i></i><i></i><b></b></div></article><div class="dhlg-formula"><small>${esc(tr("formula"))}</small><strong>√(Depth × Breadth)</strong><p>${esc(tr("formulaNote"))}</p></div><article>${icon("breadth")}<span>02</span><h3>${esc(tr("breadth"))}</h3><p>${esc(tr("breadthText"))}</p><div class="dhlg-breadth-network"><b></b><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i></div></article></div><div class="dhlg-pillar-grid">${cards}</div><div class="dhlg-contract-grid"><article>${icon("globe")}<h3>${esc(tr("noEconomicSize"))}</h3><p>${esc(tr("noEconomicSizeText"))}</p></article><article>${icon("shield")}<h3>${esc(tr("noSynthetic"))}</h3><p>${esc(tr("noSyntheticText"))}</p></article><article>${icon("chart")}<h3>${esc(tr("comparability"))}</h3><p>${esc(tr("comparabilityText"))}</p></article></div></section>`;
  }

  function balanceLabel(depth, breadth) {
    if (depth === null || breadth === null) return tr("noData");
    const diff = depth - breadth;
    if (Math.abs(diff) <= 6) return tr("balanced");
    return diff > 0 ? tr("depthDriven") : tr("breadthDriven");
  }

  function profileMarkup() {
    const row = selectedRow();
    const overallProfile = profileRecord("overall") || row;
    const overallDim = dimensionRecord(overallProfile, "overall") || { score: rowScore(row, "overall"), rank: rowRank(row, "overall"), percentile: displayPercentile(row) };
    const depthDim = dimensionRecord(overallProfile, "depth") || { score: rowScore(row, "depth"), rank: rowRank(row, "depth") };
    const breadthDim = dimensionRecord(overallProfile, "breadth") || { score: rowScore(row, "breadth"), rank: rowRank(row, "breadth") };
    const depth = num(depthDim.score); const breadth = num(breadthDim.score);
    const x = clamp((depth || 0), 0, 100); const y = clamp((breadth || 0), 0, 100);
    const pillarCards = ["trade", "capital", "information", "people"].map((code) => {
      const record = profileRecord(code); const dim = dimensionRecord(record, "overall"); const d = dimensionRecord(record, "depth"); const b = dimensionRecord(record, "breadth");
      return `<article class="dhlg-pillar-score ${code}"><header>${icon(pillarIcon(code))}<span>${esc(pillarName(code))}</span><strong>${fmt(dim?.score, 1)}</strong></header><div class="dhlg-mini-lanes"><label><span>${esc(tr("depth"))}</span><i><b style="width:${clamp(num(d?.score) || 0, 0, 100)}%"></b></i><em>${fmt(d?.score, 1)}</em></label><label><span>${esc(tr("breadth"))}</span><i><b style="width:${clamp(num(b?.score) || 0, 0, 100)}%"></b></i><em>${fmt(b?.score, 1)}</em></label></div><footer><span>#${intFmt(dim?.rank)}</span><small>${esc(tr("coverage"))} ${intFmt(pillarByCode(code).latest_coverage)}</small></footer></article>`;
    }).join("");
    return `<section class="dhlg-section dhlg-profile" id="dhlg-profile">${sectionHeading(tr("profileKicker"), tr("profileTitle"), tr("profileText"), "", `<div class="dhlg-year-pill"><span>${esc(tr("year"))}</span><strong>${S.selectedYear}</strong></div>`)}<div class="dhlg-profile-grid"><article class="dhlg-profile-main"><div class="dhlg-country-ident">${flag(row)}<div><span>${esc(tr("selectedCountry"))}</span><h3>${esc(countryName(row))}</h3><small>${esc(row?.iso3 || S.selectedIso)} · ${esc(pillarName(S.selectedPillar))}</small></div></div><div class="dhlg-headline-score"><span>${esc(tr("overall"))}</span><strong>${fmt(overallDim.score, 1)}</strong><em>#${intFmt(overallDim.rank)}</em></div><div class="dhlg-profile-stats"><div><span>${esc(tr("percentile"))}</span><strong>${fmt(overallDim.percentile, 0)}%</strong></div><div><span>${esc(tr("change1y"))}</span><strong class="${num(overallDim.score_change_1y) >= 0 ? "positive" : "negative"}">${signed(overallDim.score_change_1y, 2)}</strong></div><div><span>${esc(tr("change2019"))}</span><strong class="${num(overallDim.score_change_since_2019) >= 0 ? "positive" : "negative"}">${signed(overallDim.score_change_since_2019, 2)}</strong></div><div><span>${esc(tr("rankChange"))}</span><strong>${signed(overallDim.rank_change_1y, 0)}</strong></div></div><button type="button" class="dhlg-btn" data-dhlg-action="evidence" data-iso="${esc(row?.iso3)}">${icon("database")}${esc(tr("evidence"))}</button></article><article class="dhlg-balance-card"><header><span>${esc(tr("balance"))}</span><strong>${esc(balanceLabel(depth, breadth))}</strong></header><div class="dhlg-balance-plane"><div class="grid"></div><span class="x-label">${esc(tr("depth"))} →</span><span class="y-label">${esc(tr("breadth"))} →</span><i style="left:${x}%;bottom:${y}%"><b></b></i></div><dl><div><dt>${esc(tr("depth"))}</dt><dd>${fmt(depth, 1)} <small>#${intFmt(depthDim.rank)}</small></dd></div><div><dt>${esc(tr("breadth"))}</dt><dd>${fmt(breadth, 1)} <small>#${intFmt(breadthDim.rank)}</small></dd></div></dl><p>${esc(tr("matrixDiagnostic"))}</p></article><div class="dhlg-pillar-scores">${pillarCards}</div></div></section>`;
  }

  function median(values) {
    const clean = values.map(num).filter((value) => value !== null).sort((a, b) => a - b);
    if (!clean.length) return null;
    const mid = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
  }

  function matrixQuadrant(row, medDepth, medBreadth) {
    const d = rowScore(row, "depth"); const b = rowScore(row, "breadth");
    if (d === null || b === null) return { key: "none", label: tr("noData") };
    if (d >= medDepth && b >= medBreadth) return { key: "high-high", label: tr("highHigh") };
    if (d >= medDepth) return { key: "high-depth", label: tr("highDepth") };
    if (b >= medBreadth) return { key: "high-breadth", label: tr("highBreadth") };
    return { key: "low-low", label: tr("lowLow") };
  }

  function matrixMarkup() {
    const selected = selectedRow(); const width = 940; const height = 560; const margin = { left: 76, right: 34, top: 38, bottom: 68 };
    const plotW = width - margin.left - margin.right; const plotH = height - margin.top - margin.bottom;
    const x = (value) => margin.left + clamp(value, 0, 100) / 100 * plotW;
    const y = (value) => margin.top + (1 - clamp(value, 0, 100) / 100) * plotH;
    const medDepth = median(S.ranking.map((row) => rowScore(row, "depth"))) ?? 50;
    const medBreadth = median(S.ranking.map((row) => rowScore(row, "breadth"))) ?? 50;
    const grid = [0, 20, 40, 60, 80, 100].map((value) => `<line x1="${x(value)}" x2="${x(value)}" y1="${margin.top}" y2="${margin.top + plotH}"/><line x1="${margin.left}" x2="${margin.left + plotW}" y1="${y(value)}" y2="${y(value)}"/><text x="${x(value)}" y="${height - 30}" text-anchor="middle">${value}</text><text x="${margin.left - 15}" y="${y(value) + 4}" text-anchor="end">${value}</text>`).join("");
    const points = S.ranking.map((row) => {
      const d = rowScore(row, "depth"); const b = rowScore(row, "breadth"); if (d === null || b === null) return "";
      const q = matrixQuadrant(row, medDepth, medBreadth); const active = row.iso3 === S.selectedIso;
      return `<circle class="dhlg-matrix-point ${q.key}${active ? " selected" : ""}" cx="${x(d).toFixed(2)}" cy="${y(b).toFixed(2)}" r="${active ? 8 : 3.8}" tabindex="${active ? "0" : "-1"}" role="button" data-dhlg-action="matrix-country" data-iso="${esc(row.iso3)}" aria-label="${esc(`${countryName(row)}: ${tr("depth")} ${fmt(d, 1)}, ${tr("breadth")} ${fmt(b, 1)}`)}"></circle>`;
    }).join("");
    const selectedQuadrant = matrixQuadrant(selected, medDepth, medBreadth);
    return `<section class="dhlg-section dhlg-matrix" id="dhlg-matrix">${sectionHeading(tr("matrixKicker"), tr("matrixTitle"), tr("matrixText"))}<div class="dhlg-matrix-layout"><div class="dhlg-matrix-card"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("matrixTitle"))}"><g class="grid">${grid}</g><rect class="quad high-high" x="${x(medDepth)}" y="${margin.top}" width="${margin.left + plotW - x(medDepth)}" height="${y(medBreadth) - margin.top}"></rect><rect class="quad high-depth" x="${x(medDepth)}" y="${y(medBreadth)}" width="${margin.left + plotW - x(medDepth)}" height="${margin.top + plotH - y(medBreadth)}"></rect><rect class="quad high-breadth" x="${margin.left}" y="${margin.top}" width="${x(medDepth) - margin.left}" height="${y(medBreadth) - margin.top}"></rect><rect class="quad low-low" x="${margin.left}" y="${y(medBreadth)}" width="${x(medDepth) - margin.left}" height="${margin.top + plotH - y(medBreadth)}"></rect><line class="median depth" x1="${x(medDepth)}" x2="${x(medDepth)}" y1="${margin.top}" y2="${margin.top + plotH}"></line><line class="median breadth" x1="${margin.left}" x2="${margin.left + plotW}" y1="${y(medBreadth)}" y2="${y(medBreadth)}"></line><g>${points}</g><text class="axis-title" x="${margin.left + plotW / 2}" y="${height - 4}" text-anchor="middle">${esc(tr("depthAxis"))} →</text><text class="axis-title" transform="translate(18 ${margin.top + plotH / 2}) rotate(-90)" text-anchor="middle">${esc(tr("breadthAxis"))} →</text><text class="quad-label high-breadth" x="${margin.left + 18}" y="${margin.top + 26}">${esc(tr("highBreadth"))}</text><text class="quad-label high-high" x="${x(medDepth) + 18}" y="${margin.top + 26}">${esc(tr("highHigh"))}</text><text class="quad-label low-low" x="${margin.left + 18}" y="${y(medBreadth) + 30}">${esc(tr("lowLow"))}</text><text class="quad-label high-depth" x="${x(medDepth) + 18}" y="${y(medBreadth) + 30}">${esc(tr("highDepth"))}</text></svg><div class="dhlg-matrix-tooltip" hidden role="status"></div></div><aside class="dhlg-matrix-readout">${flag(selected, "dhlg-flag small")}<span>${esc(tr("selectedCountry"))}</span><h3>${esc(countryName(selected))}</h3><strong>${esc(selectedQuadrant.label)}</strong><dl><div><dt>${esc(tr("depth"))}</dt><dd>${fmt(rowScore(selected, "depth"), 1)}</dd></div><div><dt>${esc(tr("breadth"))}</dt><dd>${fmt(rowScore(selected, "breadth"), 1)}</dd></div><div><dt>${esc(tr("overall"))}</dt><dd>${fmt(rowScore(selected, "overall"), 1)}</dd></div></dl><p>${esc(tr("matrixDiagnostic"))}</p></aside></div></section>`;
  }

  function geoIso(feature) {
    const properties = feature?.properties || {};
    const candidates = [properties.iso3, properties.iso_a3, properties.ISO_A3, properties.adm0_a3, properties.ADM0_A3, properties.sov_a3, properties.id, feature?.id];
    const aliases = { KOS: "XKX" };
    const value = String(candidates.find((item) => item && String(item).length === 3 && item !== "-99") || "").toUpperCase();
    return aliases[value] ?? value;
  }
  function splitRing(ring) {
    if (!Array.isArray(ring) || ring.length < 2) return [];
    const chunks = [[]];
    for (let index = 0; index < ring.length; index += 1) {
      const point = ring[index]; const previous = ring[index - 1];
      if (previous && Math.abs(Number(point[0]) - Number(previous[0])) > 180) chunks.push([]);
      chunks[chunks.length - 1].push(point);
    }
    return chunks.filter((chunk) => chunk.length >= 3);
  }
  function project(point, width, height) { const lon = clamp(Number(point[0]), -180, 180); const lat = clamp(Number(point[1]), -90, 90); return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height]; }
  function ringPath(ring, width, height) { return splitRing(ring).map((chunk) => chunk.map((point, index) => { const [x, y] = project(point, width, height); return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z").join(" "); }
  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return geometry.coordinates.map((ring) => ringPath(ring, width, height)).join(" ");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map((ring) => ringPath(ring, width, height)).join(" ")).join(" ");
    return "";
  }
  function mapValue(row) { return rowScore(row, S.mapDimension); }
  function quantileCuts(values, bins = 7) {
    const sorted = values.map(num).filter((v) => v !== null).sort((a, b) => a - b);
    return Array.from({ length: bins - 1 }, (_, index) => sorted[Math.round((sorted.length - 1) * ((index + 1) / bins))]);
  }
  function quantileClass(value, cuts) { if (num(value) === null) return "nodata"; let index = 0; while (index < cuts.length && Number(value) > cuts[index]) index += 1; return `q${index + 1}`; }

  function mapMarkup() {
    const features = Array.isArray(S.geo?.features) ? S.geo.features : [];
    const rankingByIso = new Map(S.ranking.map((row) => [row.iso3, row]));
    const cuts = quantileCuts(S.ranking.map(mapValue));
    const polygonIsos = new Set(features.map(geoIso).filter(Boolean));
    const paths = features.map((feature) => {
      const iso = geoIso(feature); const row = rankingByIso.get(iso); const path = geometryPath(feature.geometry, 1000, 510); if (!path) return "";
      const value = mapValue(row); const klass = row ? quantileClass(value, cuts) : "nodata"; const active = iso === S.selectedIso ? " selected" : "";
      return `<path class="dhlg-map-country ${klass}${active}" d="${path}" data-dhlg-action="map-country" data-iso="${esc(iso)}" tabindex="${iso === S.selectedIso ? "0" : "-1"}" role="button" aria-label="${esc(row ? `${countryName(row)}: ${fmt(value, 1)}` : tr("noData"))}" ${row ? "" : "aria-disabled=\"true\""}></path>`;
    }).join("");
    const points = (Array.isArray(S.geo?.points) ? S.geo.points : []).filter((point) => !point.has_polygon || !polygonIsos.has(String(point.iso3 || "").toUpperCase())).map((point) => {
      const iso = String(point.iso3 || "").toUpperCase(); const row = rankingByIso.get(iso); if (!row || num(point.lon) === null || num(point.lat) === null) return "";
      const [x, y] = project([point.lon, point.lat], 1000, 510); const value = mapValue(row); const active = iso === S.selectedIso ? " selected" : "";
      return `<circle class="dhlg-map-country dhlg-map-point ${quantileClass(value, cuts)}${active}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${iso === S.selectedIso ? 5.8 : 3.7}" data-dhlg-action="map-country" data-iso="${esc(iso)}" tabindex="${iso === S.selectedIso ? "0" : "-1"}" role="button" aria-label="${esc(`${countryName(row)}: ${fmt(value, 1)}`)}"></circle>`;
    }).join("");
    const selected = selectedRow();
    const controls = `<div class="dhlg-segments"><label><span>${esc(tr("pillar"))}</span><select id="dhlgMapPillar">${pillars().map((item) => `<option value="${esc(item.pillar_code)}" ${item.pillar_code === S.mapPillar ? "selected" : ""}>${esc(lang() === "ru" ? item.name_ru : item.name_en)}</option>`).join("")}</select></label><label><span>${esc(tr("dimension"))}</span><select id="dhlgMapDimension">${["overall", "depth", "breadth"].map((code) => `<option value="${code}" ${code === S.mapDimension ? "selected" : ""}>${esc(dimensionName(code))}</option>`).join("")}</select></label></div>`;
    const histogram = (() => {
      const values = S.ranking.map(mapValue).filter((v) => v !== null); if (!values.length) return "";
      const min = Math.min(...values); const max = Math.max(...values); const bins = Array(18).fill(0);
      values.forEach((value) => { const index = max === min ? 0 : Math.min(bins.length - 1, Math.floor((value - min) / (max - min) * bins.length)); bins[index] += 1; });
      const top = Math.max(...bins, 1);
      return bins.map((value, index) => `<i style="height:${Math.max(4, value / top * 100)}%" class="${index / bins.length * (max - min) + min <= mapValue(selected) ? "before" : ""}"></i>`).join("");
    })();
    return `<section class="dhlg-section dhlg-map" id="dhlg-map">${sectionHeading(tr("mapKicker"), tr("mapTitle"), tr("mapText"), "", controls)}<div class="dhlg-map-layout"><div class="dhlg-map-card"><svg viewBox="0 0 1000 510" role="img" aria-label="${esc(`${pillarName(S.mapPillar)} · ${dimensionName(S.mapDimension)}`)}"><g>${paths}${points}</g></svg><div class="dhlg-map-tooltip" hidden role="status"></div><footer><div class="dhlg-map-scale">${[1,2,3,4,5,6,7].map((n) => `<i class="q${n}"></i>`).join("")}<span>${esc(tr("noData"))}</span></div><small>${esc(tr("mapKeyboard"))}</small></footer></div><aside><div class="dhlg-map-readout">${flag(selected, "dhlg-flag small")}<span>${esc(countryName(selected))}</span><strong>${fmt(mapValue(selected), 1)}</strong><small>${esc(`${pillarName(S.mapPillar)} · ${dimensionName(S.mapDimension)}`)}</small></div><div class="dhlg-distribution"><header><span>${esc(tr("distribution"))}</span><strong>${S.ranking.length}</strong></header><div>${histogram}<b style="left:${clamp(mapValue(selected) || 0, 0, 100)}%"></b></div><footer><span>0</span><em>${esc(tr("selectedValue"))}</em><span>100</span></footer></div><dl><div><dt>${esc(tr("rank"))}</dt><dd>#${intFmt(rowRank(selected, S.mapDimension))}</dd></div><div><dt>${esc(tr("score"))}</dt><dd>${fmt(mapValue(selected), 1)}</dd></div><div><dt>${esc(tr("coverage"))}</dt><dd>${intFmt(pillarByCode(S.mapPillar).latest_coverage)}</dd></div></dl></aside></div></section>`;
  }

  function windowedTrend(values) {
    if (!Array.isArray(values)) return [];
    if (S.trendWindow === "since2019") return values.filter((row) => row.year >= 2019);
    if (S.trendWindow === "last10") return values.filter((row) => row.year >= LATEST_YEAR - 9);
    return values;
  }

  function lineChartSvg(seriesList, { width = 940, height = 420 } = {}) {
    const all = seriesList.flatMap((series) => series.values || []);
    if (!all.length) return `<div class="dhlg-empty">${esc(tr("noData"))}</div>`;
    const years = all.map((row) => Number(row.year)); const values = all.map((row) => rowScore(row, S.selectedDimension)).filter((v) => v !== null);
    const minYear = Math.min(...years); const maxYear = Math.max(...years); const minValue = Math.max(0, Math.floor(Math.min(...values) / 5) * 5 - 5); const maxValue = Math.min(100, Math.ceil(Math.max(...values) / 5) * 5 + 5);
    const margin = { left: 54, right: 24, top: 28, bottom: 48 }; const plotW = width - margin.left - margin.right; const plotH = height - margin.top - margin.bottom;
    const x = (year) => margin.left + (maxYear === minYear ? 0.5 : (year - minYear) / (maxYear - minYear)) * plotW;
    const y = (value) => margin.top + (1 - (value - minValue) / Math.max(1, maxValue - minValue)) * plotH;
    const ticks = Array.from({ length: 6 }, (_, index) => minValue + (maxValue - minValue) * index / 5);
    const grid = ticks.map((value) => `<line x1="${margin.left}" x2="${margin.left + plotW}" y1="${y(value)}" y2="${y(value)}"/><text x="${margin.left - 10}" y="${y(value) + 4}" text-anchor="end">${fmt(value, 0)}</text>`).join("");
    const yearTicks = Array.from(new Set([minYear, Math.round(minYear + (maxYear - minYear) / 3), Math.round(minYear + 2 * (maxYear - minYear) / 3), maxYear])).map((year) => `<text x="${x(year)}" y="${height - 14}" text-anchor="middle">${year}</text>`).join("");
    const lines = seriesList.map((series, index) => {
      const points = (series.values || []).map((row) => `${x(Number(row.year)).toFixed(2)},${y(rowScore(row, S.selectedDimension)).toFixed(2)}`).join(" ");
      const end = series.values?.[series.values.length - 1];
      return `<polyline class="series s${index + 1}" points="${points}"></polyline>${(series.values || []).map((row) => `<circle class="series-dot s${index + 1}" cx="${x(row.year)}" cy="${y(rowScore(row, S.selectedDimension))}" r="${row.year === end?.year ? 4.5 : 2.2}" data-year="${row.year}" data-value="${rowScore(row, S.selectedDimension)}"></circle>`).join("")}`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("trendTitle"))}"><g class="grid">${grid}${yearTicks}</g>${lines}</svg>`;
  }

  function trendMarkup() {
    const values = windowedTrend(S.trend?.values || []); const scores = values.map((row) => rowScore(row, S.selectedDimension)).filter((v) => v !== null);
    const latest = scores.at(-1); const min = scores.length ? Math.min(...scores) : null; const max = scores.length ? Math.max(...scores) : null;
    const controls = `<div class="dhlg-window-switch">${[["all", tr("allYears")], ["since2019", tr("since2019")], ["last10", tr("last10")]].map(([key,label]) => `<button type="button" data-dhlg-action="trend-window" data-window="${key}" class="${S.trendWindow === key ? "active" : ""}">${esc(label)}</button>`).join("")}</div>`;
    return `<section class="dhlg-section dhlg-trend" id="dhlg-trend">${sectionHeading(tr("trendKicker"), tr("trendTitle"), tr("trendText"), "", controls)}<div class="dhlg-trend-grid"><div class="dhlg-chart-card">${lineChartSvg([{ iso3: S.selectedIso, values }])}<div class="dhlg-chart-tooltip" hidden></div></div><aside><article><span>${esc(tr("latest"))}</span><strong>${fmt(latest, 1)}</strong><small>${S.selectedYear}</small></article><article><span>${esc(tr("minimum"))}</span><strong>${fmt(min, 1)}</strong><small>${values.find((row) => rowScore(row, S.selectedDimension) === min)?.year || "—"}</small></article><article><span>${esc(tr("maximum"))}</span><strong>${fmt(max, 1)}</strong><small>${values.find((row) => rowScore(row, S.selectedDimension) === max)?.year || "—"}</small></article><article><span>${esc(tr("period"))}</span><strong>${values[0]?.year || "—"}–${values.at(-1)?.year || "—"}</strong><small>${esc(`${pillarName(S.selectedPillar)} · ${dimensionName(S.selectedDimension)}`)}</small></article></aside></div></section>`;
  }

  async function ensureCompareTrends() {
    const headers = apiHeaders();
    await Promise.all(S.compare.map(async (iso) => {
      const key = `${iso}:${S.selectedPillar}:${S.selectedDimension}`;
      if (S.compareTrends.has(key)) return;
      try {
        const payload = await fetchJson(`${API_BASE}/trend?iso3=${encodeURIComponent(iso)}&pillar=${encodeURIComponent(S.selectedPillar)}&dimension=${encodeURIComponent(S.selectedDimension)}`, { headers });
        S.compareTrends.set(key, payload);
      } catch (_) { /* keep unavailable countries absent */ }
    }));
  }

  function comparisonMarkup() {
    const series = S.compare.map((iso) => {
      const trend = S.compareTrends.get(`${iso}:${S.selectedPillar}:${S.selectedDimension}`);
      return { iso3: iso, name: trend?.country?.name || countryName(S.ranking.find((row) => row.iso3 === iso)), values: windowedTrend(trend?.values || []) };
    }).filter((item) => item.values.length);
    const options = S.ranking.filter((row) => !S.compare.includes(row.iso3)).map((row) => `<option value="${esc(row.iso3)}">${esc(countryName(row))} · ${esc(row.iso3)}</option>`).join("");
    return `<section class="dhlg-section dhlg-comparison" id="dhlg-comparison">${sectionHeading(tr("comparisonKicker"), tr("comparisonTitle"), tr("comparisonText"))}<div class="dhlg-compare-toolbar"><label><span>${esc(tr("addCountry"))}</span><select id="dhlgCompareSelect"><option value="">—</option>${options}</select></label><button type="button" class="dhlg-btn" data-dhlg-action="add-compare" ${S.compare.length >= 5 ? "disabled" : ""}>+ ${esc(tr("addCountry"))}</button><button type="button" class="dhlg-btn" data-dhlg-action="reset-compare">${esc(tr("reset"))}</button></div><div class="dhlg-compare-chart">${lineChartSvg(series, { height: 450 })}<div class="dhlg-legend">${series.map((item, index) => `<span class="s${index + 1}"><i></i>${esc(item.name || item.iso3)}</span>`).join("")}</div></div><div class="dhlg-compare-cards">${S.compare.map((iso, index) => { const row = S.ranking.find((item) => item.iso3 === iso); return `<article class="s${index + 1}">${flag(row, "dhlg-flag tiny")}<div><strong>${esc(countryName(row))}</strong><small>${esc(iso)}</small></div><span>${fmt(rowScore(row), 1)}</span><em>#${intFmt(rowRank(row))}</em><button type="button" data-dhlg-action="remove-compare" data-iso="${esc(iso)}" ${S.compare.length <= 2 ? "disabled" : ""} aria-label="${esc(`${tr("remove")}: ${countryName(row)}`)}">×</button></article>`; }).join("")}</div></section>`;
  }

  function filteredRows() {
    const q = S.query.trim().toLowerCase();
    const rows = S.ranking.filter((row) => !q || countryName(row).toLowerCase().includes(q) || String(row.country_name || row.name || "").toLowerCase().includes(q) || String(row.iso3 || "").toLowerCase().includes(q));
    const factor = S.direction === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      if (S.sort === "country") return countryName(a).localeCompare(countryName(b), lang() === "ru" ? "ru" : "en") * factor;
      if (S.sort === "score") return ((rowScore(a) ?? -Infinity) - (rowScore(b) ?? -Infinity)) * factor;
      if (S.sort === "change") return ((rowChange(a) ?? -Infinity) - (rowChange(b) ?? -Infinity)) * factor;
      return ((rowRank(a) ?? Infinity) - (rowRank(b) ?? Infinity)) * factor;
    });
  }

  function rankingMarkup() {
    const rows = filteredRows(); const pages = Math.max(1, Math.ceil(rows.length / S.pageSize)); if (S.page >= pages) S.page = pages - 1;
    const slice = rows.slice(S.page * S.pageSize, (S.page + 1) * S.pageSize);
    const pillarOptions = pillars().map((item) => `<option value="${esc(item.pillar_code)}" ${item.pillar_code === S.selectedPillar ? "selected" : ""}>${esc(lang() === "ru" ? item.name_ru : item.name_en)}</option>`).join("");
    const dimensionOptions = ["overall", "depth", "breadth"].map((code) => `<option value="${code}" ${code === S.selectedDimension ? "selected" : ""}>${esc(dimensionName(code))}</option>`).join("");
    return `<section class="dhlg-section dhlg-ranking" id="dhlg-ranking">${sectionHeading(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"))}<div class="dhlg-ranking-toolbar"><label><span>${esc(tr("pillar"))}</span><select id="dhlgRankingPillar">${pillarOptions}</select></label><label><span>${esc(tr("dimension"))}</span><select id="dhlgRankingDimension">${dimensionOptions}</select></label><label class="search"><span>${esc(tr("search"))}</span><div>${icon("search")}<input id="dhlgSearch" value="${esc(S.query)}" placeholder="${esc(tr("search"))}"></div></label><label><span>${esc(tr("sortBy"))}</span><select id="dhlgSort"><option value="rank" ${S.sort === "rank" ? "selected" : ""}>${esc(tr("byRank"))}</option><option value="score" ${S.sort === "score" ? "selected" : ""}>${esc(tr("byScore"))}</option><option value="country" ${S.sort === "country" ? "selected" : ""}>${esc(tr("byCountry"))}</option><option value="change" ${S.sort === "change" ? "selected" : ""}>${esc(tr("byChange"))}</option></select></label><label><span>${esc(tr("direction"))}</span><select id="dhlgDirection"><option value="asc" ${S.direction === "asc" ? "selected" : ""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction === "desc" ? "selected" : ""}>${esc(tr("descending"))}</option></select></label><button type="button" class="dhlg-btn" data-dhlg-action="export">${icon("download")}${esc(tr("exportCsv"))}</button></div><div class="dhlg-ranking-meta"><span>${esc(`${pillarName(S.selectedPillar)} · ${dimensionName(S.selectedDimension)} · ${S.selectedYear}`)}</span><strong>${intFmt(rows.length)} ${esc(tr("results"))}</strong><small>${esc(tr("officialScore"))} · ${esc(tr("officialRank"))}</small></div><div class="dhlg-table-wrap"><table><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("selectedCountry"))}</th><th>${esc(tr("score"))}</th><th>${esc(tr("depth"))}</th><th>${esc(tr("breadth"))}</th><th>${esc(tr("change1y"))}</th><th>${esc(tr("change2019"))}</th><th></th></tr></thead><tbody>${slice.length ? slice.map((row) => `<tr class="${row.iso3 === S.selectedIso ? "selected" : ""}"><td><strong>#${intFmt(rowRank(row))}</strong></td><td><button type="button" class="country" data-dhlg-action="country" data-iso="${esc(row.iso3)}">${flag(row, "dhlg-flag tiny")}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)}</small></span></button></td><td><strong>${fmt(rowScore(row), 2)}</strong><small>${fmt(displayPercentile(row), 0)}%</small></td><td><span>${fmt(rowScore(row, "depth"), 2)}</span><small>#${intFmt(rowRank(row, "depth"))}</small></td><td><span>${fmt(rowScore(row, "breadth"), 2)}</span><small>#${intFmt(rowRank(row, "breadth"))}</small></td><td><strong class="${(rowChange(row, "1y") || 0) >= 0 ? "positive" : "negative"}">${signed(rowChange(row, "1y"), 2)}</strong><small>${signed(rowRankChange(row, "1y"), 0)} ${esc(tr("rank"))}</small></td><td><strong class="${(rowChange(row, "2019") || 0) >= 0 ? "positive" : "negative"}">${signed(rowChange(row, "2019"), 2)}</strong><small>${signed(rowRankChange(row, "2019"), 0)} ${esc(tr("rank"))}</small></td><td><button type="button" class="evidence" data-dhlg-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(`${tr("evidence")}: ${countryName(row)}`)}">${icon("database")}</button></td></tr>`).join("") : `<tr><td colspan="8" class="empty">${esc(tr("zeroResults"))}</td></tr>`}</tbody></table></div><footer class="dhlg-pagination"><label><span>${esc(tr("rowsPerPage"))}</span><select id="dhlgPageSize">${[10,25,50,100].map((value) => `<option value="${value}" ${value === S.pageSize ? "selected" : ""}>${value}</option>`).join("")}</select></label><div><button type="button" data-dhlg-action="previous-page" ${S.page === 0 ? "disabled" : ""}>← ${esc(tr("previous"))}</button><span>${esc(tr("page"))} <strong>${S.page + 1}</strong> ${esc(tr("of"))} ${pages}</span><button type="button" data-dhlg-action="next-page" ${S.page >= pages - 1 ? "disabled" : ""}>${esc(tr("next"))} →</button></div></footer></section>`;
  }

  function lockedAnalyticsMarkup() {
    return `<section class="dhlg-section dhlg-locked-analytics"><div class="dhlg-lock-orb">${icon("lock")}<i></i><i></i></div><div><span>${esc(tr("numericAnalytics"))}</span><h2>${esc(tr("dataLocked"))}</h2><p>${esc(tr("accessText"))}</p><button type="button" class="dhlg-btn primary" data-dhlg-action="jump" data-target="dhlg-access">${icon("shield")}${esc(tr("accessKicker"))}</button></div><div class="dhlg-locked-preview"><article><span>${esc(tr("profileTitle"))}</span><i></i><i></i></article><article><span>${esc(tr("matrixTitle"))}</span><div class="dots">${Array(36).fill(0).map((_, i) => `<b style="--x:${(i * 37) % 100}%;--y:${(i * 53) % 100}%"></b>`).join("")}</div></article><article><span>${esc(tr("mapTitle"))}</span><div class="map-ghost"></div></article></div></section>`;
  }

  function evidenceDialogMarkup() {
    return `<dialog id="dhlgEvidenceDialog" class="dhlg-dialog"><div class="dhlg-dialog-shell"><header><div><span>${esc(tr("provenance"))}</span><h2>${esc(tr("evidence"))}</h2></div><button type="button" data-dhlg-action="close-dialog" aria-label="${esc(tr("close"))}">×</button></header><div class="dhlg-dialog-body"><div class="dhlg-loading-inline"><i></i><span>${esc(tr("loading"))}</span></div></div></div></dialog>`;
  }

  function attributionMarkup() {
    const url = sourceUrls().doi || `https://doi.org/${release().doi || "10.58153/rm518-hve77"}`;
    return `<footer class="dhlg-attribution"><span>${esc(tr("attribution"))}</span><a href="${esc(url)}" target="_blank" rel="noopener">${esc(release().doi || "10.58153/rm518-hve77")}</a></footer>`;
  }
  function toastMarkup() { return `<div class="dhlg-toast" role="status" aria-live="polite" hidden></div>`; }

  function workspaceMarkup() {
    const live = isLive();
    return `<div class="dhlg" data-mode="${esc(S.mode)}">${validationBannerMarkup()}${heroMarkup()}${timeRailMarkup()}${publicPulseMarkup()}${accessMarkup()}${live ? `${profileMarkup()}${matrixMarkup()}${mapMarkup()}${trendMarkup()}${comparisonMarkup()}${rankingMarkup()}` : lockedAnalyticsMarkup()}${architectureMarkup()}${attributionMarkup()}${evidenceDialogMarkup()}${toastMarkup()}</div>`;
  }

  function loadingMarkup() { return `<section class="dhlg-loading"><div class="dhlg-loader"><i></i><i></i><i></i><i></i></div><h1>${esc(tr("loading"))}</h1><p>${esc(tr("loadingText"))}</p></section>`; }
  function errorMarkup(error) { return `<section class="dhlg-error">${icon("info")}<h1>${esc(tr("loadError"))}</h1><p>${esc(error?.message || tr("loadingText"))}</p><button type="button" class="dhlg-btn primary" data-dhlg-action="retry">${esc(tr("retry"))}</button></section>`; }

  function toast(message) {
    const node = S.context?.root?.querySelector(".dhlg-toast"); if (!node) return;
    node.textContent = message; node.hidden = false; clearTimeout(node.__timer); node.__timer = setTimeout(() => { node.hidden = true; }, 2400);
  }

  async function selectCountry(iso) {
    const next = String(iso || "").toUpperCase(); if (!next || next === S.selectedIso) return;
    S.selectedIso = next; S.busy = true; paint();
    try {
      const headers = apiHeaders();
      const [profile, trend] = await Promise.all([
        fetchJson(`${API_BASE}/countries/${encodeURIComponent(next)}?year=${S.selectedYear}`, { headers }),
        fetchJson(`${API_BASE}/trend?iso3=${encodeURIComponent(next)}&pillar=${encodeURIComponent(S.selectedPillar)}&dimension=${encodeURIComponent(S.selectedDimension)}`, { headers }),
      ]);
      S.profile = profile; S.trend = trend; S.compareTrends.set(`${next}:${S.selectedPillar}:${S.selectedDimension}`, trend);
      if (!S.compare.includes(next)) S.compare = [next, ...S.compare].slice(0, 5);
      S.context.country = next;
      S.context.setCountry?.(next);
    } catch (error) { S.accessError = error; }
    finally { S.busy = false; paint(); }
  }

  function showPointTooltip(node, kind, event) {
    const row = S.ranking.find((item) => item.iso3 === node.dataset.iso); if (!row) return;
    const selector = kind === "matrix" ? ".dhlg-matrix-tooltip" : ".dhlg-map-tooltip";
    const tooltip = S.context.root.querySelector(selector); if (!tooltip) return;
    tooltip.innerHTML = `<strong>${esc(countryName(row))}</strong><span>${esc(tr("overall"))} ${fmt(rowScore(row, "overall"), 1)} · ${esc(tr("depth"))} ${fmt(rowScore(row, "depth"), 1)} · ${esc(tr("breadth"))} ${fmt(rowScore(row, "breadth"), 1)}</span>`;
    tooltip.hidden = false;
    const card = tooltip.parentElement; const rect = card.getBoundingClientRect(); const target = node.getBoundingClientRect();
    const left = event?.clientX ? event.clientX - rect.left : target.left + target.width / 2 - rect.left;
    const top = event?.clientY ? event.clientY - rect.top : target.top - rect.top;
    tooltip.style.left = `${clamp(left + 12, 10, rect.width - 280)}px`; tooltip.style.top = `${clamp(top + 12, 10, rect.height - 74)}px`;
  }
  function hideTooltips() { S.context.root.querySelectorAll(".dhlg-map-tooltip,.dhlg-matrix-tooltip").forEach((node) => { node.hidden = true; }); }
  function focusNeighbour(node, direction) {
    const nodes = Array.from(S.context.root.querySelectorAll(".dhlg-map-country[data-iso]")); const index = nodes.indexOf(node); if (index < 0) return;
    const next = nodes[(index + direction + nodes.length) % nodes.length]; node.tabIndex = -1; next.tabIndex = 0; next.focus(); showPointTooltip(next, "map");
  }

  async function openEvidence(iso, trigger) {
    const dialog = S.context.root.querySelector("#dhlgEvidenceDialog"); if (!dialog) return;
    dialog.__returnFocus = trigger || document.activeElement;
    const body = dialog.querySelector(".dhlg-dialog-body"); body.innerHTML = `<div class="dhlg-loading-inline"><i></i><span>${esc(tr("loading"))}</span></div>`;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    try {
      const params = new URLSearchParams({ year: String(S.selectedYear), pillar: S.selectedPillar, dimension: S.selectedDimension, limit: "5", offset: "0", q: iso, include_provenance: "true" });
      const payload = await fetchJson(`${API_BASE}/ranking?${params}`, { headers: apiHeaders() });
      const row = payload.rows?.find((item) => item.iso3 === iso) || payload.rows?.[0]; if (!row) throw new Error(tr("noData"));
      const p = row.provenance || {}; const permission = S.meta?.overview?.permission || {};
      const fields = [
        [tr("selectedCountry"), `${countryName(row)} · ${row.iso3}`], [tr("year"), row.year], [tr("pillar"), pillarName(row.pillar_code)], [tr("dimension"), dimensionName(S.selectedDimension)],
        [tr("score"), fmt(rowScore(row), 6)], [tr("rank"), `#${intFmt(rowRank(row))}`], [tr("depth"), fmt(row.depth_level, 6)], [tr("breadth"), fmt(row.breadth_level, 6)],
        [tr("change1y"), signed(rowChange(row, "1y"), 6)], [tr("change2019"), signed(rowChange(row, "2019"), 6)], [tr("formulaResidual"), row.formula_residual],
        [tr("sourceCsv"), p.source_csv_filename || release().official_csv_filename], [tr("sourceOrder"), row.source_order], [tr("rowHash"), row.row_sha256],
        [tr("csvHash"), p.csv_sha256 || release().csv_sha256], [tr("csvMd5"), p.csv_md5 || release().csv_md5 || release().official_csv_expected_md5], [tr("snapshot"), p.snapshot_id],
        [tr("transformation"), p.transformation_run_id], [tr("transform"), p.transform_id], [tr("formulaVersion"), p.formula_version], [tr("quality"), row.quality_flag],
        [tr("scoreStatus"), payload.score_status || "official_dhl_gci_csv_values"], [tr("rankStatus"), payload.rank_status || "official_dhl_gci_csv_ranks"],
        [tr("sourceRights"), S.meta?.license?.repository_rights || release().repository_rights], [tr("permissionBasis"), permission.permission_basis || S.meta?.overview?.api_audience || "—"],
      ];
      dialog.querySelector("h2").textContent = `${countryName(row)} · ${S.selectedYear}`;
      body.innerHTML = `<div class="dhlg-evidence-hero">${flag(row, "dhlg-flag small")}<div><span>${esc(`${pillarName(S.selectedPillar)} · ${dimensionName(S.selectedDimension)}`)}</span><strong>${fmt(rowScore(row), 2)}</strong><small>#${intFmt(rowRank(row))}</small></div></div><dl>${fields.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd class="${String(key).includes("SHA") || [tr("rowHash"),tr("csvHash"),tr("snapshot"),tr("transformation"),tr("transform")].includes(key) ? "mono" : ""}">${esc(value ?? "—")}</dd></div>`).join("")}</dl><footer><a class="dhlg-btn" href="${esc(sourceUrls().repository || release().official_csv_repository_url || sourceUrls().report)}" target="_blank" rel="noopener">${icon("external")}${esc(tr("openSource"))}</a></footer>`;
    } catch (error) { body.innerHTML = `<div class="dhlg-empty">${esc(error.message || tr("noData"))}</div>`; }
    dialog.querySelector("[data-dhlg-action='close-dialog']")?.focus();
  }
  function closeDialog() { const dialog = S.context.root.querySelector("#dhlgEvidenceDialog"); if (!dialog) return; const target = dialog.__returnFocus; if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); if (target?.focus && target.isConnected) target.focus(); }

  async function exportCsv() {
    try {
      const response = await fetch(`${API_BASE}/export.csv?year=${S.selectedYear}&pillar=${encodeURIComponent(S.selectedPillar)}`, { headers: apiHeaders() });
      if (!response.ok) throw new Error(tr("exportBlocked"));
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `dhl_gci_${S.selectedPillar}_${S.selectedYear}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch (error) { toast(error.message || tr("exportBlocked")); }
  }

  function bind() {
    const root = S.context.root;
    root.querySelectorAll("[data-dhlg-action]").forEach((control) => control.addEventListener("click", async () => {
      const action = control.dataset.dhlgAction;
      if (action === "retry") return render(S.context, { force: true });
      if (action === "jump") return root.querySelector(`#${CSS.escape(control.dataset.target || "")}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (action === "copy-command") { try { await navigator.clipboard.writeText(control.dataset.copy || importCommand()); toast(tr("copied")); } catch (_) { toast(importCommand()); } return; }
      if (action === "disconnect") { sessionStorage.removeItem(TOKEN_KEY); S.token = ""; S.mode = S.meta?.overview?.imported ? "token" : "locked-api"; S.ranking = []; S.profile = null; S.trend = null; return paint(); }
      if (action === "trend-window") { S.trendWindow = control.dataset.window || "all"; await ensureCompareTrends(); return paintAt("dhlg-trend"); }
      if (["country", "map-country", "matrix-country"].includes(action)) return selectCountry(control.dataset.iso);
      if (action === "evidence") return openEvidence(control.dataset.iso || S.selectedIso, control);
      if (action === "close-dialog") return closeDialog();
      if (action === "add-compare") { const iso = root.querySelector("#dhlgCompareSelect")?.value; if (iso && !S.compare.includes(iso) && S.compare.length < 5) { S.compare.push(iso); await ensureCompareTrends(); } return paintAt("dhlg-comparison"); }
      if (action === "remove-compare") { if (S.compare.length > 2) S.compare = S.compare.filter((iso) => iso !== control.dataset.iso); return paintAt("dhlg-comparison"); }
      if (action === "reset-compare") { S.compare = Array.from(new Set([S.selectedIso, ...S.ranking.slice(0, 2).map((row) => row.iso3)])).slice(0, 3); await ensureCompareTrends(); return paintAt("dhlg-comparison"); }
      if (action === "previous-page") { S.page = Math.max(0, S.page - 1); return paintAt("dhlg-ranking"); }
      if (action === "next-page") { S.page += 1; return paintAt("dhlg-ranking"); }
      if (action === "export") return exportCsv();
    }));
    root.querySelector("[data-dhlg-form='token']")?.addEventListener("submit", async (event) => {
      event.preventDefault(); const token = root.querySelector("#dhlgToken")?.value?.trim(); if (!token) return;
      S.token = token; sessionStorage.setItem(TOKEN_KEY, token); S.mode = "live-private-pending"; S.busy = true; paint();
      try { await loadLiveData(); await ensureCompareTrends(); }
      catch (error) { S.accessError = error; S.mode = "token"; }
      finally { S.busy = false; paint(); }
    });
    const metricChange = async () => { S.page = 0; await refreshMetric(); await ensureCompareTrends(); paint(); };
    root.querySelector("#dhlgRankingPillar")?.addEventListener("change", async (event) => { S.selectedPillar = event.target.value; S.mapPillar = S.selectedPillar; await metricChange(); });
    root.querySelector("#dhlgRankingDimension")?.addEventListener("change", async (event) => { S.selectedDimension = event.target.value; S.mapDimension = S.selectedDimension; await metricChange(); });
    root.querySelector("#dhlgMapPillar")?.addEventListener("change", async (event) => { S.mapPillar = event.target.value; if (S.mapPillar !== S.selectedPillar) { S.selectedPillar = S.mapPillar; await metricChange(); } else paintAt("dhlg-map"); });
    root.querySelector("#dhlgMapDimension")?.addEventListener("change", async (event) => { S.mapDimension = event.target.value; if (S.mapDimension !== S.selectedDimension) { S.selectedDimension = S.mapDimension; await metricChange(); } else paintAt("dhlg-map"); });
    const search = root.querySelector("#dhlgSearch"); if (search) { let timer; search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { S.query = search.value; S.page = 0; paintAt("dhlg-ranking"); }, 170); }); }
    root.querySelector("#dhlgSort")?.addEventListener("change", (event) => { S.sort = event.target.value; S.page = 0; paintAt("dhlg-ranking"); });
    root.querySelector("#dhlgDirection")?.addEventListener("change", (event) => { S.direction = event.target.value; S.page = 0; paintAt("dhlg-ranking"); });
    root.querySelector("#dhlgPageSize")?.addEventListener("change", (event) => { S.pageSize = Number(event.target.value) || 25; S.page = 0; paintAt("dhlg-ranking"); });
    root.querySelectorAll(".dhlg-map-country").forEach((node) => {
      node.addEventListener("pointerenter", (event) => showPointTooltip(node, "map", event)); node.addEventListener("pointermove", (event) => showPointTooltip(node, "map", event)); node.addEventListener("pointerleave", hideTooltips); node.addEventListener("focus", () => showPointTooltip(node, "map")); node.addEventListener("blur", hideTooltips);
      node.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); selectCountry(node.dataset.iso); } else if (["ArrowRight", "ArrowDown"].includes(event.key)) { event.preventDefault(); focusNeighbour(node, 1); } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); focusNeighbour(node, -1); } else if (event.key === "Escape") hideTooltips(); });
    });
    root.querySelectorAll(".dhlg-matrix-point").forEach((node) => { node.addEventListener("pointerenter", (event) => showPointTooltip(node, "matrix", event)); node.addEventListener("pointermove", (event) => showPointTooltip(node, "matrix", event)); node.addEventListener("pointerleave", hideTooltips); node.addEventListener("focus", () => showPointTooltip(node, "matrix")); node.addEventListener("blur", hideTooltips); node.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); selectCountry(node.dataset.iso); } }); });
    const dialog = root.querySelector("#dhlgEvidenceDialog"); if (dialog) { dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); }); dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); }); }
  }

  function paintAt(id) { const y = window.scrollY; paint(); const target = S.context.root.querySelector(`#${CSS.escape(id)}`); if (target) window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 145), behavior: "auto" }); else window.scrollTo({ top: y, behavior: "auto" }); }
  function paint() {
    if (!S.context?.root || !S.meta) return;
    S.context.root.innerHTML = workspaceMarkup(); bind();
    document.documentElement.dataset.dhlGciReady = "true"; document.documentElement.dataset.dhlGciMode = S.mode;
    window.dispatchEvent(new CustomEvent("gir:dhl-gci-ready", { detail: { mode: S.mode, year: S.selectedYear, pillar: S.selectedPillar, dimension: S.selectedDimension, iso3: S.selectedIso } }));
  }

  async function render(context, options = {}) {
    if (!context?.root) throw new Error("DHL GCI workspace requires a root element");
    if (!context.country) return; S.context = context; S.selectedIso = String(context.country).toUpperCase();
    const requestedYear = Number(context.year); S.selectedYear = Number.isFinite(requestedYear) && requestedYear >= EARLIEST_YEAR && requestedYear <= LATEST_YEAR ? requestedYear : LATEST_YEAR;
    const key = `${context.lang || "ru"}:${context.theme || "dark"}`; const token = ++S.renderToken;
    context.root.innerHTML = loadingMarkup(); document.documentElement.dataset.dhlGciReady = "false";
    try {
      if (!S.meta || S.loadKey !== key || options.force) { await hydrate(); if (token !== S.renderToken) return; S.loadKey = key; }
      if (isLive()) await ensureCompareTrends();
      paint();
    } catch (error) {
      console.error("DHL GCI workspace failed", error); if (token !== S.renderToken) return;
      context.root.innerHTML = errorMarkup(error); context.root.querySelector("[data-dhlg-action='retry']")?.addEventListener("click", () => render(context, { force: true })); document.documentElement.dataset.dhlGciReady = "error";
    }
  }
  function invalidate() { S.meta = null; S.geo = null; S.loadKey = ""; S.ranking = []; S.profile = null; S.trend = null; S.compareTrends.clear(); S.mode = "loading"; }
  const api = Object.freeze({ render, invalidate, version: "10.0.0-stage10" });
  window.GIRDHLGCI = api; window.GIRDHLGCIWorkspace = api;
})();
