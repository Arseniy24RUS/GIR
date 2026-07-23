/* GIR Economy & Finance · UNCTAD Productive Capacities Index workspace
 * Cumulative patch stage 02. No external runtime dependencies.
 */
(() => {
  "use strict";

  const VERSION = "1.2.0";
  const API_BASE = "/api/economy-finance/pci";
  const ROUTE = "index-UNCTAD_PCI";
  const MAX_COMPARE = 5;
  const instances = new WeakMap();
  const instanceRegistry = new Set();
  let instanceSequence = 0;
  let sharedGeoPromise = null;

  const COPY = {
    ru: {
      group: "Экономика и финансы",
      eyebrow: "Глобальная аналитическая обсерватория",
      title: "Производственный потенциал стран",
      subtitle: "UNCTAD Productive Capacities Index",
      intro: "Сравнивайте способность экономик производить товары и услуги, отслеживайте структурные изменения и находите ограничения роста по восьми измерениям.",
      officialSource: "Официальные данные UNCTAD",
      officialScore: "Официальный балл",
      derivedRank: "Место рассчитано GIR",
      updated: "Обновлено",
      release: "Выпуск",
      economies: "экономик",
      yearsCoverage: "временной ряд",
      indicators: "исходных показателя",
      dimensions: "компонентов",
      year: "Год",
      dimension: "Измерение",
      search: "Найти страну",
      searchPlaceholder: "Название или ISO3",
      exportCsv: "CSV",
      copyLink: "Скопировать ссылку",
      copied: "Ссылка скопирована",
      retry: "Повторить",
      overview: "Обзор",
      ranking: "Рейтинг",
      compare: "Сравнение",
      methodology: "Методология",
      globalMedian: "Мировая медиана",
      globalAverage: "Среднее значение",
      leader: "Лидер",
      coverage: "Покрытие",
      positiveMomentum: "Положительная динамика",
      fromLastYear: "к предыдущему году",
      noPrevious: "нет сопоставимого прошлого года",
      worldMap: "Карта производственного потенциала",
      mapHelp: "Нажмите на страну, чтобы открыть её профиль",
      noMap: "Геометрия карты недоступна. Рейтинг и графики продолжают работать.",
      mapLow: "Ниже",
      mapHigh: "Выше",
      topEconomies: "Лидеры рейтинга",
      distribution: "Распределение баллов",
      movers: "Наибольший рост",
      countriesCount: "стран",
      rank: "Место",
      country: "Страна",
      score: "Балл",
      percentile: "Процентиль",
      scoreChange: "Δ балла",
      rankChange: "Δ места",
      quality: "Качество",
      official: "официальное",
      derived: "расчёт GIR",
      showing: "Показано",
      of: "из",
      noMatches: "По вашему запросу ничего не найдено",
      clearSearch: "Сбросить поиск",
      sortBy: "Сортировка",
      rankAscending: "по месту",
      scoreDescending: "по баллу",
      changeDescending: "по росту",
      alphabetical: "по названию",
      addCountry: "Добавить страну",
      add: "Добавить",
      selectCountry: "Выберите страну",
      compareHint: "Добавьте от двух до пяти экономик. Динамика строится по выбранному компоненту, профиль — по всем восьми компонентам.",
      remove: "Удалить",
      trend: "Динамика",
      componentProfile: "Структурный профиль",
      selectedYear: "Выбранный год",
      selectedDimension: "Выбранное измерение",
      noCompare: "Для сравнения нужны минимум две страны",
      loadingComparison: "Формируем сопоставимый профиль…",
      profile: "Профиль страны",
      close: "Закрыть",
      position: "Позиция",
      globalPercentile: "Мировой процентиль",
      annualChange: "Изменение за год",
      historicalTrend: "Историческая динамика",
      strengths: "Сильные стороны",
      constraints: "Зоны внимания",
      allComponents: "Все компоненты",
      methodologyIntro: "PCI — многомерный диагностический инструмент UNCTAD. GIR публикует официальные баллы без пересчёта, а ранги и процентили формирует как прозрачный аналитический слой.",
      scoreMethod: "Что измеряет PCI",
      rankMethod: "Как GIR рассчитывает место",
      rankMethodText: "Сортировка по официальному баллу по убыванию; при равенстве используется соревновательный ранг 1, 2, 2, 4. Региональные агрегаты не ранжируются.",
      scale: "Шкала",
      higherBetter: "0–100, больше — лучше",
      sourceAndProvenance: "Источник и воспроизводимость",
      sourceDataset: "Набор данных",
      sourceOwner: "Правообладатель",
      sourcePage: "Страница индекса",
      dataCentre: "UNCTAD Data Centre",
      methodologyDoc: "Методический документ",
      license: "Лицензия",
      retrievedAt: "Получено",
      snapshot: "Исходный снимок",
      checksum: "SHA-256",
      transform: "Преобразование ранга",
      provenanceLoading: "Проверяем происхождение выпуска…",
      provenanceUnavailable: "Provenance пока недоступен",
      categories: "Восемь категорий PCI",
      methodStatus: "Статус методологии",
      forthcoming: "Методика третьего поколения готовится UNCTAD; интерфейс импортирует готовые официальные баллы и не реконструирует индекс.",
      notLoadedTitle: "Backend установлен — официальный выпуск ещё не загружен",
      notLoadedText: "Интерфейс готов к работе, но публикационный шлюз не обнаружил подтверждённый набор UNCTAD PCI. Числовые результаты появятся только после проверки официального выпуска.",
      loadData: "Загрузить официальный CSV",
      commandDownload: "Автоматическая загрузка",
      commandManual: "Импорт локального файла",
      commandStatus: "Проверка состояния",
      copyCommand: "Копировать команду",
      commandCopied: "Команда скопирована",
      officialLinks: "Официальные материалы",
      emptyStep1: "Экспортируйте полный набор US.PCI из UNCTAD Data Centre или используйте официальный URL загрузки.",
      emptyStep2: "Запустите CLI: он проверит покрытие, компоненты, годы, дубли и происхождение.",
      emptyStep3: "После атомарной публикации нажмите «Повторить» — интерфейс откроет рейтинг без перезапуска приложения.",
      networkTitle: "Не удалось получить данные PCI",
      networkText: "Backend не ответил или вернул некорректный ответ. Другие разделы GIR не затронуты.",
      technicalDetails: "Технические подробности",
      loading: "Загружаем официальный выпуск…",
      mapLoading: "Подготавливаем карту…",
      tableLoading: "Загружаем рейтинг…",
      valueUnavailable: "Нет данных",
      sourceNote: "Баллы: UNCTAD. Места, процентили и изменения места: аналитический расчёт GIR.",
      keyboardHint: "Строки рейтинга открываются клавишами Enter или Пробел.",
      top: "Топ",
      bottom: "Нижняя группа",
      rising: "Растёт",
      falling: "Снижается",
      unchanged: "Без изменения",
      dataFreshness: "Актуальность данных",
      observations: "наблюдений",
      mapped: "сопоставлено с ISO3",
      warning: "Предупреждение",
      openSource: "Открыть источник",
      tabPanel: "Аналитическая область PCI",
      compactMode: "Компактный вид",
      fullMode: "Подробный вид",
      filterActive: "Фильтр активен",
      loadingCountry: "Загружаем профиль страны…",
      countryError: "Профиль страны недоступен",
      compareError: "Не удалось построить сравнение",
      rankUp: "поднялась",
      rankDown: "опустилась",
      places: "мест",
      points: "п.",
      sourceReleaseDate: "Дата выпуска",
      latestAvailable: "Последний доступный год",
      dataPolicy: "Только проверенный официальный выпуск",
      backendReady: "Backend готов",
      liveRegion: "Обновление интерфейса",
    },
    en: {
      group: "Economy & finance",
      eyebrow: "Global analytical observatory",
      title: "Productive capacities of economies",
      subtitle: "UNCTAD Productive Capacities Index",
      intro: "Compare economies’ ability to produce goods and services, track structural change and identify growth constraints across eight dimensions.",
      officialSource: "Official UNCTAD data",
      officialScore: "Official score",
      derivedRank: "Rank calculated by GIR",
      updated: "Updated",
      release: "Release",
      economies: "economies",
      yearsCoverage: "time series",
      indicators: "source indicators",
      dimensions: "components",
      year: "Year",
      dimension: "Dimension",
      search: "Find an economy",
      searchPlaceholder: "Name or ISO3",
      exportCsv: "CSV",
      copyLink: "Copy link",
      copied: "Link copied",
      retry: "Retry",
      overview: "Overview",
      ranking: "Ranking",
      compare: "Compare",
      methodology: "Methodology",
      globalMedian: "Global median",
      globalAverage: "Global average",
      leader: "Leader",
      coverage: "Coverage",
      positiveMomentum: "Positive momentum",
      fromLastYear: "from previous year",
      noPrevious: "no comparable previous year",
      worldMap: "Productive capacities map",
      mapHelp: "Select a country to open its profile",
      noMap: "Map geometry is unavailable. Ranking and charts remain operational.",
      mapLow: "Lower",
      mapHigh: "Higher",
      topEconomies: "Ranking leaders",
      distribution: "Score distribution",
      movers: "Largest gains",
      countriesCount: "countries",
      rank: "Rank",
      country: "Economy",
      score: "Score",
      percentile: "Percentile",
      scoreChange: "Δ score",
      rankChange: "Δ rank",
      quality: "Quality",
      official: "official",
      derived: "GIR derived",
      showing: "Showing",
      of: "of",
      noMatches: "No results match your query",
      clearSearch: "Clear search",
      sortBy: "Sort",
      rankAscending: "by rank",
      scoreDescending: "by score",
      changeDescending: "by gain",
      alphabetical: "alphabetically",
      addCountry: "Add economy",
      add: "Add",
      selectCountry: "Select an economy",
      compareHint: "Add two to five economies. Trends use the selected dimension; the structural profile covers all eight components.",
      remove: "Remove",
      trend: "Trend",
      componentProfile: "Structural profile",
      selectedYear: "Selected year",
      selectedDimension: "Selected dimension",
      noCompare: "At least two economies are required",
      loadingComparison: "Building a comparable profile…",
      profile: "Country profile",
      close: "Close",
      position: "Position",
      globalPercentile: "Global percentile",
      annualChange: "Annual change",
      historicalTrend: "Historical trend",
      strengths: "Strengths",
      constraints: "Areas for attention",
      allComponents: "All components",
      methodologyIntro: "PCI is UNCTAD’s multidimensional diagnostic tool. GIR publishes official scores unchanged and adds ranks and percentiles as a transparent analytical layer.",
      scoreMethod: "What PCI measures",
      rankMethod: "How GIR calculates rank",
      rankMethodText: "Official scores are sorted descending; ties use competition ranking 1, 2, 2, 4. Regional aggregates are excluded from ranking.",
      scale: "Scale",
      higherBetter: "0–100, higher is better",
      sourceAndProvenance: "Source and reproducibility",
      sourceDataset: "Dataset",
      sourceOwner: "Owner",
      sourcePage: "Index page",
      dataCentre: "UNCTAD Data Centre",
      methodologyDoc: "Methodology document",
      license: "License",
      retrievedAt: "Retrieved",
      snapshot: "Raw snapshot",
      checksum: "SHA-256",
      transform: "Rank transformation",
      provenanceLoading: "Checking release provenance…",
      provenanceUnavailable: "Provenance is not available yet",
      categories: "Eight PCI categories",
      methodStatus: "Methodology status",
      forthcoming: "UNCTAD’s third-generation methodology is forthcoming; this interface imports official published scores and does not reconstruct the index.",
      notLoadedTitle: "Backend installed — official release not loaded yet",
      notLoadedText: "The workspace is ready, but the publication gate has not found a verified UNCTAD PCI dataset. Numeric results appear only after an official release passes validation.",
      loadData: "Load official CSV",
      commandDownload: "Automatic download",
      commandManual: "Import a local file",
      commandStatus: "Check status",
      copyCommand: "Copy command",
      commandCopied: "Command copied",
      officialLinks: "Official resources",
      emptyStep1: "Export the full US.PCI dataset from UNCTAD Data Centre or use the official download URL.",
      emptyStep2: "Run the CLI; it validates coverage, components, years, duplicates and provenance.",
      emptyStep3: "After atomic publication select Retry — the ranking opens without restarting the application.",
      networkTitle: "Unable to retrieve PCI data",
      networkText: "The backend did not respond or returned an invalid response. Other GIR workspaces are unaffected.",
      technicalDetails: "Technical details",
      loading: "Loading official release…",
      mapLoading: "Preparing map…",
      tableLoading: "Loading ranking…",
      valueUnavailable: "No data",
      sourceNote: "Scores: UNCTAD. Ranks, percentiles and rank changes: GIR analytical calculations.",
      keyboardHint: "Ranking rows can be opened with Enter or Space.",
      top: "Top",
      bottom: "Lower group",
      rising: "Rising",
      falling: "Falling",
      unchanged: "Unchanged",
      dataFreshness: "Data freshness",
      observations: "observations",
      mapped: "mapped to ISO3",
      warning: "Warning",
      openSource: "Open source",
      tabPanel: "PCI analytical workspace",
      compactMode: "Compact view",
      fullMode: "Detailed view",
      filterActive: "Filter active",
      loadingCountry: "Loading country profile…",
      countryError: "Country profile is unavailable",
      compareError: "Unable to build comparison",
      rankUp: "moved up",
      rankDown: "moved down",
      places: "places",
      points: "pts",
      sourceReleaseDate: "Release date",
      latestAvailable: "Latest available year",
      dataPolicy: "Verified official release only",
      backendReady: "Backend ready",
      liveRegion: "Interface update",
    },
  };

  const CATEGORY_COPY = {
    human_capital: {
      ru: ["Человеческий капитал", "Образование, навыки, здоровье населения и способность общества создавать и применять знания."],
      en: ["Human capital", "Education, skills, population health and the capacity to create and apply knowledge."],
    },
    natural_capital: {
      ru: ["Природный капитал", "Ресурсная база экономики и способность превращать природные активы в устойчивое развитие."],
      en: ["Natural capital", "The economy’s resource base and its ability to convert natural assets into sustainable development."],
    },
    energy: {
      ru: ["Энергетика", "Доступность, надёжность и эффективность энергоснабжения как основы производственной деятельности."],
      en: ["Energy", "Availability, reliability and efficiency of energy supply as a foundation for productive activity."],
    },
    transport: {
      ru: ["Транспорт", "Физическая связанность, логистическая инфраструктура и доступ к внутренним и внешним рынкам."],
      en: ["Transport", "Physical connectivity, logistics infrastructure and access to domestic and external markets."],
    },
    ict: {
      ru: ["ИКТ", "Цифровая связанность и использование информационно-коммуникационных технологий."],
      en: ["ICT", "Digital connectivity and the use of information and communication technologies."],
    },
    institutions: {
      ru: ["Институты", "Качество правил, управления и среды, в которой принимаются экономические решения."],
      en: ["Institutions", "Quality of rules, governance and the environment in which economic decisions are made."],
    },
    private_sector: {
      ru: ["Частный сектор", "Предпринимательская активность, доступ к финансированию и способность компаний расширять производство."],
      en: ["Private sector", "Entrepreneurial activity, access to finance and firms’ ability to expand production."],
    },
    structural_change: {
      ru: ["Структурные изменения", "Диверсификация, усложнение производства и переход к более продуктивным видам деятельности."],
      en: ["Structural change", "Diversification, productive sophistication and movement toward higher-productivity activities."],
    },
  };

  const ICON_PATHS = {
    overview: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z"/>',
    ranking: '<path d="M5 4h14v4H5V4Zm0 6h10v4H5v-4Zm0 6h6v4H5v-4Z"/>',
    compare: '<path d="M7 3v15m10-12v15M3 7l4-4 4 4m2 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    methodology: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm0 0A3.5 3.5 0 0 1 7.5 9H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1m3.1 5.9a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    chevron: '<path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check: '<path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    alert: '<path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    refresh: '<path d="M20 6v5h-5M4 18v-5h5m9.5-4A8 8 0 0 0 5.3 6M5.5 16A8 8 0 0 0 18.7 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    arrowUp: '<path d="m6 14 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    arrowDown: '<path d="m6 10 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5m-16 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" fill="none" stroke="currentColor" stroke-width="2"/>',
    external: '<path d="M14 4h6v6m0-6-9 9M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    spark: '<path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  };

  function icon(name, className = "") {
    return `<svg class="pci-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ICON_PATHS.spark}</svg>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function safeUrl(value) {
    if (value == null || String(value).trim() === "") return "#";
    try {
      const parsed = new URL(String(value), window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
    } catch (_error) {
      return "#";
    }
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function average(values) {
    if (!values.length) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
  }

  function quantile(values, fraction) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * fraction;
    const base = Math.floor(position);
    const remainder = position - base;
    return sorted[base + 1] == null
      ? sorted[base]
      : sorted[base] + remainder * (sorted[base + 1] - sorted[base]);
  }

  function debounce(callback, delay = 180) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), delay);
    };
  }

  function dateText(value, locale) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" }).format(date);
  }

  function fileName(path) {
    return String(path || "").split(/[\\/]/).filter(Boolean).pop() || "—";
  }

  function isoFromFeature(feature) {
    const properties = feature?.properties || {};
    const values = [
      feature?.id,
      properties.ISO_A3,
      properties.iso_a3,
      properties.ADM0_A3,
      properties.adm0_a3,
      properties.SOV_A3,
      properties.WB_A3,
      properties.ISO3,
      properties.iso3,
    ];
    const candidate = values.find((value) => /^[A-Za-z]{3}$/.test(String(value || "")) && String(value).toUpperCase() !== "-99");
    return candidate ? String(candidate).toUpperCase() : null;
  }

  function geometryRings(geometry) {
    if (!geometry) return [];
    if (geometry.type === "Polygon") return geometry.coordinates || [];
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
    return [];
  }

  function featurePath(feature, width = 960, height = 500) {
    const rings = geometryRings(feature?.geometry);
    return rings.map((ring) => {
      if (!Array.isArray(ring) || ring.length < 3) return "";
      let path = "";
      let previousX = null;
      for (let index = 0; index < ring.length; index += 1) {
        const point = ring[index];
        if (!Array.isArray(point) || point.length < 2) continue;
        const longitude = Number(point[0]);
        const latitude = clamp(Number(point[1]), -89.5, 89.5);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
        const x = ((longitude + 180) / 360) * width;
        const y = ((90 - latitude) / 180) * height;
        const jump = previousX != null && Math.abs(x - previousX) > width * 0.55;
        path += `${index === 0 || jump ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        previousX = x;
      }
      return path ? `${path}Z` : "";
    }).join("");
  }

  class HttpError extends Error {
    constructor(message, status, detail = null) {
      super(message);
      this.name = "HttpError";
      this.status = status;
      this.detail = detail;
    }
  }

  class PCIWorkspace {
    constructor(root, options = {}) {
      this.root = root;
      this.id = `pci-${++instanceSequence}`;
      this.options = options;
      this.state = {
        lang: options.lang === "en" ? "en" : "ru",
        theme: options.theme === "light" ? "light" : "dark",
        activeTab: "overview",
        year: null,
        component: "overall",
        query: "",
        sort: "rank",
        compact: false,
        meta: null,
        years: [],
        ranking: null,
        geo: null,
        geoError: null,
        status: "loading",
        error: null,
        compareIso: [],
        compareData: null,
        compareStatus: "idle",
        compareError: null,
        provenance: null,
        provenanceStatus: "idle",
        drawer: null,
      };
      this.abortControllers = new Set();
      this.requestSerial = 0;
      this.mounted = false;
      this.startPromise = null;
      this.lastFocus = null;
      this.onSearchInput = debounce((value) => {
        this.state.query = value.trim();
        this.syncUrl();
        this.renderActivePanel();
      }, 120);
    }

    t(key) {
      return COPY[this.state.lang][key] || key;
    }

    get locale() {
      return this.state.lang === "ru" ? "ru-RU" : "en-US";
    }

    number(value, digits = 1) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return "—";
      return new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(numeric);
    }

    integer(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return "—";
      return new Intl.NumberFormat(this.locale, { maximumFractionDigits: 0 }).format(numeric);
    }

    signed(value, digits = 1) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return "—";
      const sign = numeric > 0 ? "+" : "";
      return `${sign}${this.number(numeric, digits)}`;
    }

    componentLabel(code) {
      const metadata = this.state.meta?.components?.[code];
      if (metadata) return this.state.lang === "ru" ? metadata.label_ru : metadata.label_en;
      if (code === "overall") return this.state.lang === "ru" ? "Общий PCI" : "Overall PCI";
      return CATEGORY_COPY[code]?.[this.state.lang]?.[0] || code;
    }

    render(options = {}) {
      this.options = { ...this.options, ...options };
      this.state.lang = this.options.lang === "en" ? "en" : "ru";
      this.state.theme = this.options.theme === "light" ? "light" : "dark";
      if (!this.mounted || !this.root.querySelector("[data-pci-root]")) {
        this.mount();
        return this.startPromise;
      }
      this.renderChrome();
      this.renderActivePanel();
      this.renderDrawer();
      return this.startPromise;
    }

    mount() {
      this.abortAll();
      this.mounted = true;
      this.readUrlState();
      this.root.classList.add("pci-view");
      this.root.innerHTML = this.shell();
      this.bindEvents();
      this.renderChrome();
      this.renderLoading();
      this.startPromise = this.loadInitialData();
    }

    shell() {
      return `
        <section class="pci-shell" data-pci-root data-pci-version="${VERSION}" aria-label="${escapeHtml(this.t("tabPanel"))}">
          <div class="pci-ambient" aria-hidden="true"></div>
          <header class="pci-hero" data-pci-hero></header>
          <div class="pci-commandbar" data-pci-commandbar></div>
          <nav class="pci-tabs" data-pci-tabs role="tablist" aria-label="${escapeHtml(this.t("tabPanel"))}"></nav>
          <section class="pci-panel" data-pci-panel role="tabpanel" tabindex="-1" aria-live="polite"></section>
          <p class="pci-source-note" data-pci-source-note></p>
          <div class="pci-toast" data-pci-toast role="status" aria-live="polite" aria-atomic="true"></div>
          <div class="pci-map-tooltip" data-pci-map-tooltip role="tooltip" hidden></div>
          <div class="pci-drawer-layer" data-pci-drawer-layer hidden></div>
          <span class="pci-sr-only" data-pci-live aria-live="polite" aria-atomic="true">${escapeHtml(this.t("liveRegion"))}</span>
        </section>
      `;
    }

    renderChrome() {
      const hero = this.root.querySelector("[data-pci-hero]");
      const commandbar = this.root.querySelector("[data-pci-commandbar]");
      const tabs = this.root.querySelector("[data-pci-tabs]");
      const sourceNote = this.root.querySelector("[data-pci-source-note]");
      if (!hero || !commandbar || !tabs || !sourceNote) return;

      const meta = this.state.meta;
      const coverage = meta?.confirmed_coverage || {};
      const release = meta?.current_release;
      const periodStart = release?.period_start ?? coverage.from_year ?? 2000;
      const periodEnd = release?.period_end ?? coverage.to_year ?? 2024;
      const economyCount = release?.economy_count ?? coverage.economies ?? 195;
      const componentCount = Math.max(0, Number(release?.component_count || Object.keys(meta?.components || {}).length || 9) - 1);
      const indicators = coverage.input_indicators ?? 43;
      const statusLabel = meta?.backend_status === "loaded" ? this.t("backendReady") : this.t("dataPolicy");
      const statusClass = meta?.backend_status === "loaded" ? "is-live" : "is-guarded";

      hero.innerHTML = `
        <div class="pci-hero__content">
          <div class="pci-breadcrumb"><span>${escapeHtml(this.t("group"))}</span><span aria-hidden="true">/</span><strong>PCI</strong></div>
          <div class="pci-kicker"><span class="pci-kicker__dot"></span>${escapeHtml(this.t("eyebrow"))}</div>
          <h1>${escapeHtml(this.t("title"))}</h1>
          <p class="pci-hero__subtitle">${escapeHtml(this.t("subtitle"))}</p>
          <p class="pci-hero__intro">${escapeHtml(this.t("intro"))}</p>
          <div class="pci-hero__badges">
            <span class="pci-status-badge ${statusClass}">${icon("check")} ${escapeHtml(statusLabel)}</span>
            <span class="pci-origin-badge"><i></i>${escapeHtml(this.t("officialScore"))}</span>
            <span class="pci-origin-badge is-derived"><i></i>${escapeHtml(this.t("derivedRank"))}</span>
          </div>
        </div>
        <div class="pci-hero__metrics" aria-label="${escapeHtml(this.t("coverage"))}">
          <div class="pci-hero-metric"><strong>${this.integer(economyCount)}</strong><span>${escapeHtml(this.t("economies"))}</span></div>
          <div class="pci-hero-metric"><strong>${escapeHtml(`${periodStart}–${periodEnd}`)}</strong><span>${escapeHtml(this.t("yearsCoverage"))}</span></div>
          <div class="pci-hero-metric"><strong>${this.integer(indicators)}</strong><span>${escapeHtml(this.t("indicators"))}</span></div>
          <div class="pci-hero-metric"><strong>${this.integer(componentCount || 8)}</strong><span>${escapeHtml(this.t("dimensions"))}</span></div>
        </div>
        <div class="pci-hero__orb" aria-hidden="true"><span></span><span></span><span></span></div>
      `;

      commandbar.innerHTML = this.commandbarMarkup();
      tabs.innerHTML = this.tabsMarkup();
      sourceNote.textContent = this.state.meta?.backend_status === "loaded" ? this.t("sourceNote") : "";
      this.syncControlValues();
    }

    commandbarMarkup() {
      const disabled = this.state.status !== "ready";
      const years = this.state.years.map((entry) => Number(entry.year)).filter(Number.isFinite);
      const yearOptions = years.map((year) => `<option value="${year}" ${Number(this.state.year) === year ? "selected" : ""}>${year}</option>`).join("");
      const components = Object.entries(this.state.meta?.components || {}).sort(([, a], [, b]) => Number(a.order || 0) - Number(b.order || 0));
      const componentOptions = components.map(([code]) => `<option value="${escapeHtml(code)}" ${this.state.component === code ? "selected" : ""}>${escapeHtml(this.componentLabel(code))}</option>`).join("");
      const csvQuery = new URLSearchParams({
        year: String(this.state.year || ""),
        component: this.state.component,
        include_aggregates: "false",
        include_unmapped: "true",
      });
      return `
        <div class="pci-commandbar__filters">
          <label class="pci-field pci-field--small">
            <span>${escapeHtml(this.t("year"))}</span>
            <select data-pci-year ${disabled ? "disabled" : ""} aria-label="${escapeHtml(this.t("year"))}">${yearOptions}</select>
          </label>
          <label class="pci-field pci-field--dimension">
            <span>${escapeHtml(this.t("dimension"))}</span>
            <select data-pci-component ${disabled ? "disabled" : ""} aria-label="${escapeHtml(this.t("dimension"))}">${componentOptions}</select>
          </label>
          <label class="pci-field pci-field--search">
            <span>${escapeHtml(this.t("search"))}</span>
            <span class="pci-searchbox">${icon("search")}<input data-pci-search type="search" value="${escapeHtml(this.state.query)}" placeholder="${escapeHtml(this.t("searchPlaceholder"))}" autocomplete="off" ${disabled ? "disabled" : ""}></span>
          </label>
        </div>
        <div class="pci-commandbar__actions">
          <a class="pci-button pci-button--secondary" data-pci-csv href="${API_BASE}/ranking.csv?${csvQuery.toString()}" download aria-disabled="${disabled}">${icon("download")}<span>${escapeHtml(this.t("exportCsv"))}</span></a>
          <button class="pci-button pci-button--secondary" type="button" data-pci-share>${icon("link")}<span>${escapeHtml(this.t("copyLink"))}</span></button>
        </div>
      `;
    }

    tabsMarkup() {
      const tabs = [
        ["overview", "overview"],
        ["ranking", "ranking"],
        ["compare", "compare"],
        ["methodology", "methodology"],
      ];
      return tabs.map(([key, iconName]) => {
        const selected = this.state.activeTab === key;
        return `<button type="button" class="pci-tab ${selected ? "is-active" : ""}" role="tab" aria-selected="${selected}" data-pci-tab="${key}" ${this.state.status === "loading" ? "disabled" : ""}>${icon(iconName)}<span>${escapeHtml(this.t(key))}</span></button>`;
      }).join("");
    }

    syncControlValues() {
      const year = this.root.querySelector("[data-pci-year]");
      const component = this.root.querySelector("[data-pci-component]");
      const search = this.root.querySelector("[data-pci-search]");
      if (year && this.state.year != null) year.value = String(this.state.year);
      if (component) component.value = this.state.component;
      if (search && search.value !== this.state.query) search.value = this.state.query;
    }

    bindEvents() {
      const shell = this.root.querySelector("[data-pci-root]");
      if (!shell) return;
      shell.addEventListener("click", (event) => this.handleClick(event));
      shell.addEventListener("change", (event) => this.handleChange(event));
      shell.addEventListener("input", (event) => this.handleInput(event));
      shell.addEventListener("keydown", (event) => this.handleKeydown(event));
      shell.addEventListener("pointermove", (event) => this.handlePointerMove(event));
      shell.addEventListener("pointerleave", () => this.hideMapTooltip(), true);
    }

    handleClick(event) {
      const target = event.target instanceof Element ? event.target.closest("[data-pci-provenance], [data-pci-action], [data-pci-tab], [data-pci-country], [data-pci-map-iso], [data-pci-share], [data-pci-retry], [data-pci-copy-command], [data-pci-remove-compare]") : null;
      if (!target || !this.root.contains(target)) return;

      if (target.matches("[data-pci-provenance]")) {
        event.preventDefault();
        event.stopPropagation();
        window.openProvenance?.(target.dataset.pciProvenance || "", target);
        return;
      }

      if (target.matches("[data-pci-tab]")) {
        this.state.activeTab = target.dataset.pciTab;
        this.syncUrl();
        this.renderChrome();
        this.renderActivePanel();
        this.root.querySelector("[data-pci-panel]")?.focus({ preventScroll: true });
        return;
      }
      if (target.matches("[data-pci-country]")) {
        this.openCountry(target.dataset.pciCountry, target);
        return;
      }
      if (target.matches("[data-pci-map-iso]")) {
        const iso3 = target.dataset.pciMapIso;
        if (iso3 && this.rankingByIso().has(iso3)) this.openCountry(iso3, target);
        return;
      }
      if (target.matches("[data-pci-share]")) {
        this.copyText(window.location.href, this.t("copied"));
        return;
      }
      if (target.matches("[data-pci-retry]")) {
        this.startPromise = this.loadInitialData({ force: true });
        return;
      }
      if (target.matches("[data-pci-copy-command]")) {
        this.copyText(target.dataset.pciCopyCommand || "", this.t("commandCopied"));
        return;
      }
      if (target.matches("[data-pci-remove-compare]")) {
        this.state.compareIso = this.state.compareIso.filter((code) => code !== target.dataset.pciRemoveCompare);
        this.state.compareData = null;
        this.syncUrl();
        this.renderActivePanel();
        if (this.state.compareIso.length >= 2) this.loadComparison();
        return;
      }
      const action = target.dataset.pciAction;
      if (action === "clear-search") {
        this.state.query = "";
        const input = this.root.querySelector("[data-pci-search]");
        if (input) input.value = "";
        this.syncUrl();
        this.renderActivePanel();
      } else if (action === "add-compare") {
        const select = this.root.querySelector("[data-pci-compare-select]");
        const iso3 = select?.value;
        if (iso3 && !this.state.compareIso.includes(iso3) && this.state.compareIso.length < MAX_COMPARE) {
          this.state.compareIso.push(iso3);
          this.state.compareData = null;
          this.syncUrl();
          this.renderActivePanel();
          if (this.state.compareIso.length >= 2) this.loadComparison();
        }
      } else if (action === "close-drawer") {
        this.closeDrawer();
      } else if (action === "load-provenance") {
        this.loadProvenance();
      } else if (action === "toggle-density") {
        this.state.compact = !this.state.compact;
        this.renderActivePanel();
      }
    }

    handleChange(event) {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.matches("[data-pci-year]")) {
        this.state.year = Number(target.value);
        this.state.compareData = null;
        this.syncUrl();
        this.loadRanking();
      } else if (target.matches("[data-pci-component]")) {
        this.state.component = target.value;
        this.state.compareData = null;
        this.syncUrl();
        this.loadRanking();
      } else if (target.matches("[data-pci-sort]")) {
        this.state.sort = target.value;
        this.renderActivePanel();
      }
    }

    handleInput(event) {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.matches("[data-pci-search]")) {
        this.onSearchInput(target.value);
      }
    }

    handleKeydown(event) {
      const target = event.target instanceof Element ? event.target.closest("[data-pci-country]") : null;
      if (target && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        this.openCountry(target.dataset.pciCountry, target);
        return;
      }
      if (event.key === "Escape" && this.state.drawer) {
        event.preventDefault();
        this.closeDrawer();
      }
    }

    handlePointerMove(event) {
      const target = event.target instanceof Element ? event.target.closest("[data-pci-map-iso]") : null;
      if (!target) {
        this.hideMapTooltip();
        return;
      }
      const iso3 = target.dataset.pciMapIso;
      const item = this.rankingByIso().get(iso3);
      if (!item) return;
      const tooltip = this.root.querySelector("[data-pci-map-tooltip]");
      const shell = this.root.querySelector("[data-pci-root]");
      if (!tooltip || !shell) return;
      tooltip.innerHTML = `<strong>${escapeHtml(item.economy_name)}</strong><span>${escapeHtml(iso3)} · #${this.integer(item.rank)} · ${this.number(item.score, 1)}</span>`;
      tooltip.hidden = false;
      const bounds = shell.getBoundingClientRect();
      tooltip.style.left = `${clamp(event.clientX - bounds.left + 14, 10, bounds.width - 230)}px`;
      tooltip.style.top = `${clamp(event.clientY - bounds.top + 14, 10, bounds.height - 80)}px`;
    }

    hideMapTooltip() {
      const tooltip = this.root.querySelector("[data-pci-map-tooltip]");
      if (tooltip) tooltip.hidden = true;
    }

    readUrlState() {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("pci_tab");
      if (["overview", "ranking", "compare", "methodology"].includes(tab)) this.state.activeTab = tab;
      const component = params.get("pci_component");
      if (component) this.state.component = component;
      const year = Number(params.get("pci_year"));
      if (Number.isFinite(year) && year > 1900) this.state.year = year;
      const compare = (params.get("pci_compare") || "").split(",").map((value) => value.trim().toUpperCase()).filter((value) => /^[A-Z]{3}$/.test(value));
      this.state.compareIso = [...new Set(compare)].slice(0, MAX_COMPARE);
    }

    syncUrl() {
      try {
        const url = new URL(window.location.href);
        url.hash = ROUTE;
        url.searchParams.set("pci_tab", this.state.activeTab);
        if (this.state.year) url.searchParams.set("pci_year", String(this.state.year));
        if (this.state.component) url.searchParams.set("pci_component", this.state.component);
        if (this.state.compareIso.length) url.searchParams.set("pci_compare", this.state.compareIso.join(","));
        else url.searchParams.delete("pci_compare");
        window.history.replaceState(window.history.state, "", url);
      } catch (_error) {
        // URL state is a progressive enhancement.
      }
    }

    async request(path, params = null, controller = null) {
      const url = new URL(`${API_BASE}${path}`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, String(item)));
          else if (value != null && value !== "") url.searchParams.set(key, String(value));
        });
      }
      const localController = controller || new AbortController();
      this.abortControllers.add(localController);
      try {
        const response = await fetch(url.pathname + url.search, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: localController.signal,
        });
        let payload = null;
        try {
          payload = await response.json();
        } catch (_error) {
          payload = null;
        }
        if (!response.ok) {
          throw new HttpError(payload?.detail || `HTTP ${response.status}`, response.status, payload);
        }
        return payload;
      } finally {
        this.abortControllers.delete(localController);
      }
    }

    abortAll() {
      this.abortControllers.forEach((controller) => controller.abort());
      this.abortControllers.clear();
    }

    async loadInitialData({ force = false } = {}) {
      const serial = ++this.requestSerial;
      this.state.status = "loading";
      this.state.error = null;
      if (force) {
        this.state.meta = null;
        this.state.years = [];
        this.state.ranking = null;
      }
      this.renderChrome();
      this.renderLoading();
      try {
        const meta = await this.request("/meta");
        if (serial !== this.requestSerial) return;
        this.state.meta = meta;
        if (meta?.backend_status !== "loaded") {
          this.state.status = "not_loaded";
          this.renderChrome();
          this.renderEmptyState();
          return;
        }
        const [yearsPayload] = await Promise.all([
          this.request("/years"),
          this.loadGeo().catch((error) => {
            this.state.geoError = error;
            return null;
          }),
        ]);
        if (serial !== this.requestSerial) return;
        this.state.years = Array.isArray(yearsPayload?.years) ? yearsPayload.years : [];
        const validYears = this.state.years.map((entry) => Number(entry.year)).filter(Number.isFinite);
        if (!validYears.includes(Number(this.state.year))) {
          this.state.year = Number(yearsPayload?.default_year || validYears.at(-1));
        }
        if (!Object.prototype.hasOwnProperty.call(meta?.components || {}, this.state.component)) {
          this.state.component = "overall";
        }
        this.state.status = "ready";
        this.ensureDefaultCompare();
        this.renderChrome();
        await this.loadRanking({ initial: true });
      } catch (error) {
        if (error?.name === "AbortError" || serial !== this.requestSerial) return;
        this.state.status = error instanceof HttpError && error.status === 503 ? "not_loaded" : "error";
        this.state.error = error;
        this.renderChrome();
        if (this.state.status === "not_loaded") this.renderEmptyState();
        else this.renderErrorState(error);
      }
    }

    async loadGeo() {
      if (this.state.geo) return this.state.geo;
      if (!sharedGeoPromise) {
        const candidates = ["/world.geojson", "/static/world.geojson", "/static/world_countries_lite.geojson"];
        sharedGeoPromise = (async () => {
          let lastError = null;
          for (const path of candidates) {
            try {
              const response = await fetch(path, { cache: "force-cache", headers: { Accept: "application/geo+json, application/json" } });
              if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
              const payload = await response.json();
              if (payload?.type !== "FeatureCollection" || !Array.isArray(payload.features)) throw new Error("Invalid GeoJSON FeatureCollection");
              return payload;
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError || new Error("World geometry unavailable");
        })().catch((error) => {
          sharedGeoPromise = null;
          throw error;
        });
      }
      this.state.geo = await sharedGeoPromise;
      return this.state.geo;
    }

    async loadRanking({ initial = false } = {}) {
      const serial = ++this.requestSerial;
      this.state.status = "ready";
      if (!initial) this.renderPanelLoading();
      try {
        const ranking = await this.request("/ranking", {
          year: this.state.year,
          component: this.state.component,
          limit: 1000,
          offset: 0,
          include_aggregates: false,
          include_unmapped: true,
        });
        if (serial !== this.requestSerial) return;
        this.state.ranking = ranking;
        this.state.year = Number(ranking.year);
        this.ensureDefaultCompare();
        this.renderChrome();
        this.renderActivePanel();
        this.announce(`${this.t("ranking")}: ${this.integer(ranking.total)} ${this.t("economies")}`);
        if (this.state.activeTab === "compare" && this.state.compareIso.length >= 2) this.loadComparison();
      } catch (error) {
        if (error?.name === "AbortError" || serial !== this.requestSerial) return;
        this.state.error = error;
        if (error instanceof HttpError && error.status === 503) {
          this.state.status = "not_loaded";
          this.renderEmptyState();
        } else {
          this.renderErrorState(error);
        }
      }
    }

    ensureDefaultCompare() {
      if (this.state.compareIso.length || !this.state.ranking?.items?.length) return;
      const available = new Set(this.state.ranking.items.map((item) => item.iso3).filter(Boolean));
      const preferred = ["RUS", "CHN", "USA", "DEU", "KAZ"].filter((iso3) => available.has(iso3));
      const fallback = this.state.ranking.items.map((item) => item.iso3).filter(Boolean);
      this.state.compareIso = [...new Set([...preferred, ...fallback])].slice(0, 3);
    }

    renderLoading() {
      const panel = this.root.querySelector("[data-pci-panel]");
      if (!panel) return;
      panel.setAttribute("aria-busy", "true");
      panel.innerHTML = `
        <div class="pci-loading-state">
          <div class="pci-loader" aria-hidden="true"><span></span><span></span><span></span></div>
          <h2>${escapeHtml(this.t("loading"))}</h2>
          <div class="pci-skeleton-grid" aria-hidden="true">
            ${Array.from({ length: 4 }, () => '<div class="pci-skeleton pci-skeleton--metric"></div>').join("")}
          </div>
          <div class="pci-skeleton pci-skeleton--hero" aria-hidden="true"></div>
        </div>
      `;
    }

    renderPanelLoading() {
      const panel = this.root.querySelector("[data-pci-panel]");
      if (!panel) return;
      panel.setAttribute("aria-busy", "true");
      panel.innerHTML = `
        <div class="pci-panel-loading">
          <div class="pci-skeleton-grid">${Array.from({ length: 4 }, () => '<div class="pci-skeleton pci-skeleton--metric"></div>').join("")}</div>
          <div class="pci-skeleton pci-skeleton--hero"></div>
        </div>
      `;
    }

    renderActivePanel() {
      const panel = this.root.querySelector("[data-pci-panel]");
      if (!panel) return;
      panel.setAttribute("aria-busy", "false");
      if (this.state.status === "loading") return this.renderLoading();
      if (this.state.status === "not_loaded") return this.renderEmptyState();
      if (this.state.status === "error") return this.renderErrorState(this.state.error);
      if (!this.state.ranking) return this.renderPanelLoading();

      if (this.state.activeTab === "ranking") panel.innerHTML = this.rankingMarkup();
      else if (this.state.activeTab === "compare") panel.innerHTML = this.compareMarkup();
      else if (this.state.activeTab === "methodology") panel.innerHTML = this.methodologyMarkup();
      else panel.innerHTML = this.overviewMarkup();

      this.afterPanelRender();
    }

    afterPanelRender() {
      if (this.state.activeTab === "compare" && this.state.compareIso.length >= 2 && !this.state.compareData && this.state.compareStatus !== "loading") {
        this.loadComparison();
      }
      if (this.state.activeTab === "methodology" && this.state.provenanceStatus === "idle") {
        this.loadProvenance();
      }
    }

    filteredItems() {
      const items = Array.isArray(this.state.ranking?.items) ? [...this.state.ranking.items] : [];
      const query = this.state.query.toLocaleLowerCase(this.locale);
      let filtered = query ? items.filter((item) => `${item.economy_name || ""} ${item.iso3 || ""}`.toLocaleLowerCase(this.locale).includes(query)) : items;
      if (this.state.sort === "score") filtered.sort((a, b) => Number(b.score ?? -Infinity) - Number(a.score ?? -Infinity));
      else if (this.state.sort === "change") filtered.sort((a, b) => Number(b.score_change ?? -Infinity) - Number(a.score_change ?? -Infinity));
      else if (this.state.sort === "name") filtered.sort((a, b) => String(a.economy_name).localeCompare(String(b.economy_name), this.locale));
      else filtered.sort((a, b) => Number(a.rank ?? Infinity) - Number(b.rank ?? Infinity));
      return filtered;
    }

    rankingByIso() {
      return new Map((this.state.ranking?.items || []).filter((item) => item.iso3).map((item) => [item.iso3, item]));
    }

    overviewStats() {
      const items = (this.state.ranking?.items || []).filter((item) => Number.isFinite(Number(item.score)));
      const scores = items.map((item) => Number(item.score));
      const changes = items.map((item) => Number(item.score_change)).filter(Number.isFinite);
      return {
        items,
        scores,
        median: median(scores),
        average: average(scores),
        leader: items.slice().sort((a, b) => Number(a.rank ?? Infinity) - Number(b.rank ?? Infinity))[0] || null,
        coverage: this.state.ranking?.total || items.length,
        positive: changes.filter((value) => value > 0).length,
        comparable: changes.length,
      };
    }

    overviewMarkup() {
      const stats = this.overviewStats();
      const leader = stats.leader;
      const top = stats.items.slice().sort((a, b) => Number(a.rank) - Number(b.rank)).slice(0, 8);
      const movers = stats.items.filter((item) => Number.isFinite(Number(item.score_change))).sort((a, b) => Number(b.score_change) - Number(a.score_change)).slice(0, 6);
      return `
        <div class="pci-overview">
          <section class="pci-metric-grid" aria-label="${escapeHtml(this.t("overview"))}">
            ${this.metricCard("globalMedian", this.number(stats.median, 1), this.componentLabel(this.state.component), "median")}
            ${this.metricCard("globalAverage", this.number(stats.average, 1), `${this.integer(stats.coverage)} ${this.t("economies")}`, "average")}
            ${this.metricCard("leader", leader ? escapeHtml(leader.economy_name) : "—", leader ? `#${this.integer(leader.rank)} · ${this.number(leader.score, 1)}` : "—", "leader")}
            ${this.metricCard("positiveMomentum", stats.comparable ? `${this.integer(stats.positive)} / ${this.integer(stats.comparable)}` : "—", stats.comparable ? this.t("fromLastYear") : this.t("noPrevious"), "momentum")}
          </section>

          <div class="pci-dashboard-grid">
            <section class="pci-card pci-card--map pci-card--wide">
              <header class="pci-card__header">
                <div><span class="pci-card__eyebrow">${escapeHtml(this.componentLabel(this.state.component))} · ${this.integer(this.state.year)}</span><h2>${escapeHtml(this.t("worldMap"))}</h2><p>${escapeHtml(this.t("mapHelp"))}</p></div>
                <div class="pci-map-legend"><span>${escapeHtml(this.t("mapLow"))}</span><i></i><span>${escapeHtml(this.t("mapHigh"))}</span></div>
              </header>
              <div class="pci-map-wrap">${this.mapMarkup()}</div>
            </section>

            <section class="pci-card pci-card--leaders">
              <header class="pci-card__header"><div><span class="pci-card__eyebrow">${escapeHtml(this.t("top"))} 8</span><h2>${escapeHtml(this.t("topEconomies"))}</h2></div></header>
              <div class="pci-leader-list">${top.map((item) => this.leaderRow(item, stats.scores)).join("")}</div>
              <button class="pci-text-button" type="button" data-pci-tab="ranking">${escapeHtml(this.t("fullMode"))}${icon("chevron")}</button>
            </section>

            <section class="pci-card pci-card--distribution">
              <header class="pci-card__header"><div><span class="pci-card__eyebrow">${this.integer(stats.items.length)} ${escapeHtml(this.t("countriesCount"))}</span><h2>${escapeHtml(this.t("distribution"))}</h2></div></header>
              ${this.histogramMarkup(stats.scores)}
            </section>

            <section class="pci-card pci-card--movers">
              <header class="pci-card__header"><div><span class="pci-card__eyebrow">${escapeHtml(this.t("fromLastYear"))}</span><h2>${escapeHtml(this.t("movers"))}</h2></div></header>
              ${movers.length ? `<div class="pci-movers-list">${movers.map((item) => this.moverRow(item)).join("")}</div>` : `<div class="pci-inline-empty">${escapeHtml(this.t("noPrevious"))}</div>`}
            </section>
          </div>
        </div>
      `;
    }

    metricCard(labelKey, value, note, type) {
      const decorative = {
        median: '<path d="M3 17h18M5 13h14M8 9h8M11 5h2"/>',
        average: '<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>',
        leader: '<path d="M8 21h8M12 17v4M7 3h10v5a5 5 0 0 1-10 0V3Zm0 2H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
        momentum: '<path d="m4 16 5-5 4 4 7-8M15 7h5v5"/>',
      }[type];
      return `
        <article class="pci-metric-card pci-metric-card--${type}">
          <div class="pci-metric-card__icon"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${decorative}</svg></div>
          <div class="pci-metric-card__body"><span>${escapeHtml(this.t(labelKey))}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></div>
        </article>
      `;
    }

    scoreColor(score, minimum, maximum) {
      const numeric = Number(score);
      if (!Number.isFinite(numeric)) return "var(--pci-map-empty)";
      const ratio = maximum > minimum ? clamp((numeric - minimum) / (maximum - minimum), 0, 1) : 0.5;
      const hue = 221 - ratio * 55;
      const saturation = 72 + ratio * 15;
      const lightness = 52 + ratio * 8;
      return `hsl(${hue.toFixed(0)} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%)`;
    }

    mapMarkup() {
      if (this.state.geoError && !this.state.geo) return `<div class="pci-map-empty">${icon("alert")}<p>${escapeHtml(this.t("noMap"))}</p></div>`;
      if (!this.state.geo) return `<div class="pci-map-loading"><div class="pci-loader pci-loader--small"><span></span><span></span><span></span></div><span>${escapeHtml(this.t("mapLoading"))}</span></div>`;
      const byIso = this.rankingByIso();
      const scores = [...byIso.values()].map((item) => Number(item.score)).filter(Number.isFinite);
      const minimum = quantile(scores, 0.05) ?? 0;
      const maximum = quantile(scores, 0.95) ?? 100;
      const paths = this.state.geo.features.map((feature, index) => {
        const iso3 = isoFromFeature(feature);
        const item = iso3 ? byIso.get(iso3) : null;
        const path = featurePath(feature);
        if (!path) return "";
        const classes = ["pci-map-country", item ? "has-data" : "no-data"];
        const attributes = item ? `data-pci-map-iso="${escapeHtml(iso3)}" tabindex="0" role="button" aria-label="${escapeHtml(`${item.economy_name}: ${this.number(item.score, 1)}, #${this.integer(item.rank)}`)}"` : `aria-hidden="true"`;
        return `<path class="${classes.join(" ")}" d="${path}" fill="${this.scoreColor(item?.score, minimum, maximum)}" ${attributes} data-feature-index="${index}"></path>`;
      }).join("");
      return `
        <svg class="pci-world-map" viewBox="0 0 960 500" role="img" aria-label="${escapeHtml(this.t("worldMap"))}" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="${this.id}-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".16"/></pattern>
          </defs>
          <rect x="0" y="0" width="960" height="500" rx="20" class="pci-map-ocean"></rect>
          <rect x="0" y="0" width="960" height="500" rx="20" fill="url(#${this.id}-dots)" class="pci-map-grid"></rect>
          <g class="pci-map-countries">${paths}</g>
        </svg>
      `;
    }

    leaderRow(item, scores) {
      const minimum = Math.min(...scores);
      const maximum = Math.max(...scores);
      const width = maximum > minimum ? 28 + ((Number(item.score) - minimum) / (maximum - minimum)) * 72 : 100;
      return `
        <button class="pci-leader-row" type="button" data-pci-country="${escapeHtml(item.iso3 || "")}">
          <span class="pci-leader-rank">${this.integer(item.rank)}</span>
          <span class="pci-leader-name"><strong>${escapeHtml(item.economy_name)}</strong><small>${escapeHtml(item.iso3 || "—")}</small><i style="--pci-bar:${width.toFixed(1)}%"></i></span>
          <span class="pci-leader-score">${this.number(item.score, 1)}</span>
        </button>
      `;
    }

    histogramMarkup(scores) {
      if (!scores.length) return `<div class="pci-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const bins = 12;
      const minimum = Math.floor(Math.min(...scores) / 5) * 5;
      const maximum = Math.ceil(Math.max(...scores) / 5) * 5 || minimum + 5;
      const step = (maximum - minimum) / bins || 1;
      const counts = Array.from({ length: bins }, () => 0);
      scores.forEach((score) => {
        const index = clamp(Math.floor((score - minimum) / step), 0, bins - 1);
        counts[index] += 1;
      });
      const top = Math.max(...counts, 1);
      const bars = counts.map((count, index) => {
        const height = 10 + (count / top) * 90;
        const from = minimum + index * step;
        const to = from + step;
        return `<g transform="translate(${index * 46 + 18},0)"><rect x="0" y="${112 - height}" width="32" height="${height}" rx="7" class="pci-hist-bar"><title>${this.number(from, 0)}–${this.number(to, 0)}: ${count}</title></rect></g>`;
      }).join("");
      const mid = median(scores);
      const markerX = 18 + clamp((mid - minimum) / (maximum - minimum), 0, 1) * (bins - 1) * 46 + 16;
      return `
        <div class="pci-histogram">
          <svg viewBox="0 0 570 150" role="img" aria-label="${escapeHtml(this.t("distribution"))}">
            <line x1="18" y1="112" x2="558" y2="112" class="pci-chart-axis"></line>
            ${bars}
            <line x1="${markerX}" y1="10" x2="${markerX}" y2="120" class="pci-hist-median"></line>
            <text x="18" y="140" class="pci-chart-label">${this.number(minimum, 0)}</text>
            <text x="558" y="140" text-anchor="end" class="pci-chart-label">${this.number(maximum, 0)}</text>
          </svg>
          <div class="pci-chart-caption"><span><i class="is-median"></i>${escapeHtml(this.t("globalMedian"))}: ${this.number(mid, 1)}</span><span>${escapeHtml(this.t("scale"))}: 0–100</span></div>
        </div>
      `;
    }

    moverRow(item) {
      const change = Number(item.score_change);
      const rankChange = Number(item.rank_change);
      return `
        <button class="pci-mover-row" type="button" data-pci-country="${escapeHtml(item.iso3 || "")}">
          <span class="pci-iso-token">${escapeHtml(item.iso3 || "—")}</span>
          <span class="pci-mover-name"><strong>${escapeHtml(item.economy_name)}</strong><small>#${this.integer(item.rank)}${Number.isFinite(rankChange) && rankChange !== 0 ? ` · ${rankChange > 0 ? "↑" : "↓"}${Math.abs(rankChange)}` : ""}</small></span>
          <span class="pci-change ${change > 0 ? "is-up" : change < 0 ? "is-down" : "is-flat"}">${this.signed(change, 2)}</span>
        </button>
      `;
    }

    rankingMarkup() {
      const items = this.filteredItems();
      const total = this.state.ranking?.items?.length || 0;
      return `
        <section class="pci-ranking-view ${this.state.compact ? "is-compact" : ""}">
          <header class="pci-section-heading">
            <div><span class="pci-card__eyebrow">${escapeHtml(this.componentLabel(this.state.component))} · ${this.integer(this.state.year)}</span><h2>${escapeHtml(this.t("ranking"))}</h2><p>${escapeHtml(this.t("sourceNote"))}</p></div>
            <div class="pci-ranking-tools">
              <label class="pci-inline-select"><span>${escapeHtml(this.t("sortBy"))}</span><select data-pci-sort>
                <option value="rank" ${this.state.sort === "rank" ? "selected" : ""}>${escapeHtml(this.t("rankAscending"))}</option>
                <option value="score" ${this.state.sort === "score" ? "selected" : ""}>${escapeHtml(this.t("scoreDescending"))}</option>
                <option value="change" ${this.state.sort === "change" ? "selected" : ""}>${escapeHtml(this.t("changeDescending"))}</option>
                <option value="name" ${this.state.sort === "name" ? "selected" : ""}>${escapeHtml(this.t("alphabetical"))}</option>
              </select></label>
              <button type="button" class="pci-icon-button" data-pci-action="toggle-density" aria-label="${escapeHtml(this.state.compact ? this.t("fullMode") : this.t("compactMode"))}" title="${escapeHtml(this.state.compact ? this.t("fullMode") : this.t("compactMode"))}"><span></span><span></span><span></span></button>
            </div>
          </header>
          <div class="pci-ranking-summary"><strong>${escapeHtml(this.t("showing"))} ${this.integer(items.length)} ${escapeHtml(this.t("of"))} ${this.integer(total)}</strong>${this.state.query ? `<span class="pci-filter-chip">${icon("search")} ${escapeHtml(this.state.query)} <button type="button" data-pci-action="clear-search" aria-label="${escapeHtml(this.t("clearSearch"))}">${icon("close")}</button></span>` : ""}</div>
          ${items.length ? this.rankingTable(items) : this.noMatchesMarkup()}
          <p class="pci-keyboard-hint">${escapeHtml(this.t("keyboardHint"))}</p>
        </section>
      `;
    }

    rankingTable(items) {
      return `
        <div class="pci-table-wrap">
          <table class="pci-table">
            <caption class="pci-sr-only">${escapeHtml(`${this.t("ranking")}: ${this.componentLabel(this.state.component)}, ${this.state.year}`)}</caption>
            <thead><tr>
              <th scope="col">${escapeHtml(this.t("rank"))}</th>
              <th scope="col">${escapeHtml(this.t("country"))}</th>
              <th scope="col">${escapeHtml(this.t("score"))}</th>
              <th scope="col">${escapeHtml(this.t("percentile"))}</th>
              <th scope="col">${escapeHtml(this.t("scoreChange"))}</th>
              <th scope="col">${escapeHtml(this.t("rankChange"))}</th>
              <th scope="col">${escapeHtml(this.t("quality"))}</th>
              <th scope="col">${escapeHtml(this.t("sourceAndProvenance"))}</th>
            </tr></thead>
            <tbody>${items.map((item) => this.rankingRow(item)).join("")}</tbody>
          </table>
        </div>
      `;
    }

    rankingRow(item) {
      const scoreChange = Number(item.score_change);
      const rankChange = Number(item.rank_change);
      const percentile = Number(item.percentile);
      const quality = item.quality_flag || "official";
      return `
        <tr data-pci-country="${escapeHtml(item.iso3 || "")}" tabindex="0" role="button" aria-label="${escapeHtml(`${item.economy_name}, ${this.t("rank")} ${item.rank}, ${this.t("score")} ${item.score}`)}">
          <td data-label="${escapeHtml(this.t("rank"))}"><span class="pci-rank-token ${Number(item.rank) <= 3 ? `is-top is-${Number(item.rank)}` : ""}">${this.integer(item.rank)}</span></td>
          <td data-label="${escapeHtml(this.t("country"))}"><span class="pci-country-cell"><span class="pci-iso-token">${escapeHtml(item.iso3 || "—")}</span><span><strong>${escapeHtml(item.economy_name)}</strong><small>${escapeHtml(item.source_economy_code || "")}</small></span></span></td>
          <td data-label="${escapeHtml(this.t("score"))}"><span class="pci-score-cell"><strong>${this.number(item.score, 2)}</strong><i><b style="width:${clamp(Number(item.score), 0, 100)}%"></b></i></span></td>
          <td data-label="${escapeHtml(this.t("percentile"))}"><span class="pci-percentile"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"></circle><circle cx="20" cy="20" r="16" style="--pci-ring:${clamp(percentile, 0, 100)}"></circle></svg><span>${this.number(percentile, 0)}</span></span></td>
          <td data-label="${escapeHtml(this.t("scoreChange"))}">${this.changePill(scoreChange, 2)}</td>
          <td data-label="${escapeHtml(this.t("rankChange"))}">${this.rankChangePill(rankChange)}</td>
          <td data-label="${escapeHtml(this.t("quality"))}"><span class="pci-quality"><i></i>${escapeHtml(quality.replaceAll("_", " "))}</span></td>
          <td data-label="${escapeHtml(this.t("sourceAndProvenance"))}">${item.value_id ? `<button type="button" class="pci-icon-button" data-pci-provenance="${escapeHtml(item.value_id)}" aria-label="${escapeHtml(this.t("sourceAndProvenance"))}" title="${escapeHtml(this.t("sourceAndProvenance"))}">${icon("external")}</button>` : ""}</td>
        </tr>
      `;
    }

    changePill(value, digits = 1) {
      if (!Number.isFinite(value)) return '<span class="pci-change is-na">—</span>';
      const stateClass = value > 0 ? "is-up" : value < 0 ? "is-down" : "is-flat";
      return `<span class="pci-change ${stateClass}">${value > 0 ? icon("arrowUp") : value < 0 ? icon("arrowDown") : ""}${this.signed(value, digits)}</span>`;
    }

    rankChangePill(value) {
      if (!Number.isFinite(value)) return '<span class="pci-change is-na">—</span>';
      const stateClass = value > 0 ? "is-up" : value < 0 ? "is-down" : "is-flat";
      return `<span class="pci-change ${stateClass}">${value > 0 ? icon("arrowUp") : value < 0 ? icon("arrowDown") : ""}${value > 0 ? "+" : ""}${this.integer(value)}</span>`;
    }

    noMatchesMarkup() {
      return `<div class="pci-no-results">${icon("search")}<h3>${escapeHtml(this.t("noMatches"))}</h3><button type="button" class="pci-button pci-button--secondary" data-pci-action="clear-search">${escapeHtml(this.t("clearSearch"))}</button></div>`;
    }

    compareMarkup() {
      const allItems = (this.state.ranking?.items || []).filter((item) => item.iso3);
      const available = allItems.filter((item) => !this.state.compareIso.includes(item.iso3));
      const compare = this.state.compareData;
      return `
        <section class="pci-compare-view">
          <header class="pci-section-heading">
            <div><span class="pci-card__eyebrow">${escapeHtml(this.componentLabel(this.state.component))} · ${this.integer(this.state.year)}</span><h2>${escapeHtml(this.t("compare"))}</h2><p>${escapeHtml(this.t("compareHint"))}</p></div>
          </header>
          <div class="pci-compare-builder">
            <div class="pci-compare-chips">${this.state.compareIso.map((iso3) => {
              const item = this.rankingByIso().get(iso3);
              return `<span class="pci-compare-chip"><span class="pci-iso-token">${escapeHtml(iso3)}</span><strong>${escapeHtml(item?.economy_name || iso3)}</strong><button type="button" data-pci-remove-compare="${escapeHtml(iso3)}" aria-label="${escapeHtml(`${this.t("remove")}: ${item?.economy_name || iso3}`)}">${icon("close")}</button></span>`;
            }).join("")}</div>
            <div class="pci-compare-add">
              <label><span>${escapeHtml(this.t("addCountry"))}</span><select data-pci-compare-select ${this.state.compareIso.length >= MAX_COMPARE || !available.length ? "disabled" : ""}><option value="">${escapeHtml(this.t("selectCountry"))}</option>${available.map((item) => `<option value="${escapeHtml(item.iso3)}">${escapeHtml(item.economy_name)} · ${escapeHtml(item.iso3)}</option>`).join("")}</select></label>
              <button type="button" class="pci-button pci-button--primary" data-pci-action="add-compare" ${this.state.compareIso.length >= MAX_COMPARE || !available.length ? "disabled" : ""}>${icon("plus")} ${escapeHtml(this.t("add"))}</button>
            </div>
          </div>
          ${this.state.compareIso.length < 2 ? `<div class="pci-no-results">${icon("compare")}<h3>${escapeHtml(this.t("noCompare"))}</h3></div>` : this.state.compareStatus === "loading" ? this.compareLoadingMarkup() : this.state.compareStatus === "error" ? this.compareErrorMarkup() : compare ? this.compareDashboardMarkup(compare) : this.compareLoadingMarkup()}
        </section>
      `;
    }

    compareLoadingMarkup() {
      return `<div class="pci-compare-loading"><div class="pci-loader"><span></span><span></span><span></span></div><h3>${escapeHtml(this.t("loadingComparison"))}</h3><div class="pci-skeleton pci-skeleton--hero"></div></div>`;
    }

    compareErrorMarkup() {
      return `<div class="pci-no-results pci-no-results--error">${icon("alert")}<h3>${escapeHtml(this.t("compareError"))}</h3><p>${escapeHtml(this.state.compareError?.message || "")}</p><button class="pci-button pci-button--secondary" type="button" data-pci-tab="compare">${icon("refresh")} ${escapeHtml(this.t("retry"))}</button></div>`;
    }

    async loadComparison() {
      if (this.state.compareIso.length < 2) return;
      const serial = ++this.requestSerial;
      this.state.compareStatus = "loading";
      this.state.compareError = null;
      if (this.state.activeTab === "compare") this.renderActivePanel();
      try {
        const [snapshot, ...details] = await Promise.all([
          this.request("/compare", { iso3: this.state.compareIso, year: this.state.year, component: this.state.component }),
          ...this.state.compareIso.flatMap((iso3) => [
            this.request(`/countries/${encodeURIComponent(iso3)}`, { year: this.state.year }),
            this.request(`/countries/${encodeURIComponent(iso3)}/series`, { component: this.state.component }),
          ]),
        ]);
        if (serial !== this.requestSerial) return;
        const profiles = {};
        const series = {};
        this.state.compareIso.forEach((iso3, index) => {
          profiles[iso3] = details[index * 2];
          series[iso3] = details[index * 2 + 1];
        });
        this.state.compareData = { snapshot, profiles, series };
        this.state.compareStatus = "ready";
        if (this.state.activeTab === "compare") this.renderActivePanel();
      } catch (error) {
        if (error?.name === "AbortError" || serial !== this.requestSerial) return;
        this.state.compareStatus = "error";
        this.state.compareError = error;
        if (this.state.activeTab === "compare") this.renderActivePanel();
      }
    }

    compareDashboardMarkup(compare) {
      const snapshotItems = compare.snapshot?.items || [];
      const colors = ["var(--pci-series-1)", "var(--pci-series-2)", "var(--pci-series-3)", "var(--pci-series-4)", "var(--pci-series-5)"];
      const cards = this.state.compareIso.map((iso3, index) => {
        const item = snapshotItems.find((entry) => entry.iso3 === iso3) || this.rankingByIso().get(iso3);
        return `<button type="button" class="pci-compare-scorecard" data-pci-country="${escapeHtml(iso3)}" style="--pci-series:${colors[index]}"><span class="pci-compare-scorecard__line"></span><span class="pci-iso-token">${escapeHtml(iso3)}</span><strong>${escapeHtml(item?.economy_name || iso3)}</strong><b>${this.number(item?.score, 1)}</b><small>#${this.integer(item?.rank)} · P${this.number(item?.percentile, 0)}</small></button>`;
      }).join("");
      return `
        <div class="pci-compare-dashboard">
          <div class="pci-compare-scorecards">${cards}</div>
          <section class="pci-card pci-card--compare-trend">
            <header class="pci-card__header"><div><span class="pci-card__eyebrow">${escapeHtml(this.componentLabel(this.state.component))}</span><h3>${escapeHtml(this.t("trend"))}</h3></div></header>
            ${this.multiSeriesChartMarkup(compare.series, colors)}
          </section>
          <section class="pci-card pci-card--compare-profile">
            <header class="pci-card__header"><div><span class="pci-card__eyebrow">${this.integer(this.state.year)}</span><h3>${escapeHtml(this.t("componentProfile"))}</h3></div></header>
            ${this.componentComparisonMarkup(compare.profiles, colors)}
          </section>
        </div>
      `;
    }

    multiSeriesChartMarkup(seriesByIso, colors) {
      const entries = this.state.compareIso.map((iso3, index) => ({ iso3, color: colors[index], items: seriesByIso?.[iso3]?.items || [] })).filter((entry) => entry.items.length);
      if (!entries.length) return `<div class="pci-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const all = entries.flatMap((entry) => entry.items.map((item) => ({ year: Number(item.year), value: Number(item.score) })).filter((item) => Number.isFinite(item.year) && Number.isFinite(item.value)));
      const minYear = Math.min(...all.map((item) => item.year));
      const maxYear = Math.max(...all.map((item) => item.year));
      const minValue = Math.max(0, Math.floor((Math.min(...all.map((item) => item.value)) - 4) / 5) * 5);
      const maxValue = Math.min(100, Math.ceil((Math.max(...all.map((item) => item.value)) + 4) / 5) * 5);
      const width = 760;
      const height = 300;
      const padding = { left: 52, right: 24, top: 22, bottom: 40 };
      const x = (year) => padding.left + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - padding.left - padding.right);
      const y = (value) => padding.top + (1 - (value - minValue) / Math.max(1, maxValue - minValue)) * (height - padding.top - padding.bottom);
      const horizontal = Array.from({ length: 5 }, (_, index) => {
        const value = minValue + ((maxValue - minValue) / 4) * index;
        const pos = y(value);
        return `<line x1="${padding.left}" y1="${pos}" x2="${width - padding.right}" y2="${pos}" class="pci-chart-grid"></line><text x="${padding.left - 10}" y="${pos + 4}" text-anchor="end" class="pci-chart-label">${this.number(value, 0)}</text>`;
      }).join("");
      const yearTicks = [minYear, Math.round((minYear + maxYear) / 2), maxYear].map((year) => `<text x="${x(year)}" y="${height - 10}" text-anchor="middle" class="pci-chart-label">${year}</text>`).join("");
      const lines = entries.map((entry) => {
        const points = entry.items.map((item) => `${x(Number(item.year)).toFixed(2)},${y(Number(item.score)).toFixed(2)}`).join(" ");
        const last = entry.items.at(-1);
        return `<polyline points="${points}" fill="none" stroke="${entry.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="pci-series-line"></polyline><circle cx="${x(Number(last.year))}" cy="${y(Number(last.score))}" r="5" fill="${entry.color}" class="pci-series-dot"><title>${entry.iso3}: ${this.number(last.score, 1)}</title></circle>`;
      }).join("");
      const legend = entries.map((entry) => `<span><i style="background:${entry.color}"></i>${escapeHtml(entry.iso3)}</span>`).join("");
      return `<div class="pci-line-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(this.t("trend"))}">${horizontal}${yearTicks}${lines}</svg><div class="pci-chart-legend">${legend}</div></div>`;
    }

    componentComparisonMarkup(profiles, colors) {
      const codes = Object.keys(this.state.meta?.components || {}).filter((code) => code !== "overall").sort((a, b) => Number(this.state.meta.components[a].order) - Number(this.state.meta.components[b].order));
      if (!codes.length) return `<div class="pci-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      return `<div class="pci-component-compare"><div class="pci-component-compare__head"><span></span>${this.state.compareIso.map((iso3, index) => `<span><i style="background:${colors[index]}"></i>${escapeHtml(iso3)}</span>`).join("")}</div>${codes.map((code) => {
        const values = this.state.compareIso.map((iso3) => profiles?.[iso3]?.values?.find((value) => value.component?.code === code)?.score ?? null);
        return `<div class="pci-component-compare__row"><strong>${escapeHtml(this.componentLabel(code))}</strong><div class="pci-component-bars">${values.map((value, index) => `<span title="${escapeHtml(`${this.state.compareIso[index]}: ${this.number(value, 1)}`)}"><i style="width:${clamp(Number(value), 0, 100)}%;background:${colors[index]}"></i><b>${this.number(value, 1)}</b></span>`).join("")}</div></div>`;
      }).join("")}</div>`;
    }

    methodologyMarkup() {
      const meta = this.state.meta || {};
      const release = meta.current_release || {};
      const provenance = this.state.provenance;
      const categories = Object.keys(CATEGORY_COPY);
      return `
        <section class="pci-methodology-view">
          <header class="pci-section-heading pci-section-heading--method">
            <div><span class="pci-card__eyebrow">UNCTAD · ${escapeHtml(meta.dataset_code || "US.PCI")}</span><h2>${escapeHtml(this.t("methodology"))}</h2><p>${escapeHtml(this.t("methodologyIntro"))}</p></div>
            <a class="pci-button pci-button--secondary" href="${safeUrl(meta.source_page_url)}" target="_blank" rel="noopener noreferrer">${icon("external")} ${escapeHtml(this.t("openSource"))}</a>
          </header>
          <div class="pci-method-grid">
            <article class="pci-method-card pci-method-card--score"><span class="pci-method-card__number">01</span><h3>${escapeHtml(this.t("scoreMethod"))}</h3><p>${escapeHtml(this.state.lang === "ru" ? "Индекс показывает, насколько ресурсы, предпринимательские возможности и производственные связи позволяют экономике создавать товары и услуги и поддерживать развитие." : "The index shows how productive resources, entrepreneurial capabilities and production linkages enable an economy to create goods and services and sustain development.")}</p><dl><div><dt>${escapeHtml(this.t("scale"))}</dt><dd>${escapeHtml(this.t("higherBetter"))}</dd></div><div><dt>${escapeHtml(this.t("officialScore"))}</dt><dd>UNCTAD</dd></div></dl></article>
            <article class="pci-method-card pci-method-card--rank"><span class="pci-method-card__number">02</span><h3>${escapeHtml(this.t("rankMethod"))}</h3><p>${escapeHtml(this.t("rankMethodText"))}</p><div class="pci-rank-example"><span>1</span><span>2</span><span>2</span><span>4</span></div><dl><div><dt>${escapeHtml(this.t("derivedRank"))}</dt><dd>${escapeHtml(meta.ranking_method?.transform_id || "gir-pci-rank-from-official-score")}</dd></div></dl></article>
          </div>

          <section class="pci-card pci-card--categories">
            <header class="pci-card__header"><div><span class="pci-card__eyebrow">${this.integer(categories.length)} ${escapeHtml(this.t("dimensions"))}</span><h3>${escapeHtml(this.t("categories"))}</h3></div></header>
            <div class="pci-category-grid">${categories.map((code, index) => this.categoryCard(code, index + 1)).join("")}</div>
          </section>

          <section class="pci-card pci-card--method-status">
            <div class="pci-method-status__icon">${icon("alert")}</div><div><span>${escapeHtml(this.t("methodStatus"))}</span><h3>${escapeHtml(this.t("forthcoming"))}</h3></div>
          </section>

          <section class="pci-card pci-card--provenance">
            <header class="pci-card__header"><div><span class="pci-card__eyebrow">${escapeHtml(this.t("officialSource"))}</span><h3>${escapeHtml(this.t("sourceAndProvenance"))}</h3></div>${this.state.provenanceStatus === "error" ? `<button type="button" class="pci-button pci-button--secondary" data-pci-action="load-provenance">${icon("refresh")} ${escapeHtml(this.t("retry"))}</button>` : ""}</header>
            <div class="pci-provenance-grid">
              ${this.provenanceItem("sourceDataset", `${meta.dataset_code || "US.PCI"} · ${meta.name || "Productive Capacities Index"}`)}
              ${this.provenanceItem("sourceOwner", meta.owner || "UNCTAD")}
              ${this.provenanceLink("sourcePage", meta.source_page_url)}
              ${this.provenanceLink("dataCentre", meta.data_centre_url)}
              ${this.provenanceLink("methodologyDoc", meta.methodology_url)}
              ${this.provenanceItem("license", meta.license || "—")}
              ${this.provenanceItem("sourceReleaseDate", release.release_date || "—")}
              ${this.provenanceItem("latestAvailable", release.period_end || this.state.year || "—")}
            </div>
            ${this.provenanceDetailMarkup(provenance)}
          </section>
        </section>
      `;
    }

    categoryCard(code, index) {
      const copy = CATEGORY_COPY[code]?.[this.state.lang] || [this.componentLabel(code), ""];
      return `<article class="pci-category-card"><span>${String(index).padStart(2, "0")}</span><div class="pci-category-card__icon"><i></i></div><h4>${escapeHtml(copy[0])}</h4><p>${escapeHtml(copy[1])}</p><small>${escapeHtml(this.t("officialSource"))}</small></article>`;
    }

    provenanceItem(labelKey, value) {
      return `<div class="pci-provenance-item"><span>${escapeHtml(this.t(labelKey))}</span><strong>${escapeHtml(value ?? "—")}</strong></div>`;
    }

    provenanceLink(labelKey, url) {
      const href = safeUrl(url);
      return `<div class="pci-provenance-item"><span>${escapeHtml(this.t(labelKey))}</span><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(url ? new URL(href).hostname : "—")}${icon("external")}</a></div>`;
    }

    provenanceDetailMarkup(provenance) {
      if (this.state.provenanceStatus === "loading" || this.state.provenanceStatus === "idle") return `<div class="pci-provenance-loading"><div class="pci-loader pci-loader--small"><span></span><span></span><span></span></div>${escapeHtml(this.t("provenanceLoading"))}</div>`;
      if (this.state.provenanceStatus === "error" || !provenance?.release) return `<div class="pci-inline-empty">${escapeHtml(this.t("provenanceUnavailable"))}</div>`;
      const release = provenance.release;
      return `<div class="pci-provenance-detail">
        <div><span>${escapeHtml(this.t("retrievedAt"))}</span><strong>${escapeHtml(dateText(release.retrieved_at, this.locale))}</strong></div>
        <div><span>${escapeHtml(this.t("snapshot"))}</span><strong title="${escapeHtml(release.raw_snapshot_path || "")}">${escapeHtml(fileName(release.raw_snapshot_path))}</strong></div>
        <div class="is-wide"><span>${escapeHtml(this.t("checksum"))}</span><code>${escapeHtml(release.raw_snapshot_sha256 || "—")}</code></div>
        <div class="is-wide"><span>${escapeHtml(this.t("transform"))}</span><code>${escapeHtml(release.rank_transform_id || "—")}</code></div>
        <div><span>${escapeHtml(this.t("observations"))}</span><strong>${this.integer(release.observation_count)}</strong></div>
        <div><span>${escapeHtml(this.t("mapped"))}</span><strong>${this.integer(release.mapped_economy_count)} / ${this.integer(release.economy_count)}</strong></div>
      </div>`;
    }

    async loadProvenance() {
      if (this.state.provenanceStatus === "loading") return;
      this.state.provenanceStatus = "loading";
      if (this.state.activeTab === "methodology") this.renderActivePanel();
      try {
        this.state.provenance = await this.request("/provenance");
        this.state.provenanceStatus = "ready";
      } catch (error) {
        if (error?.name === "AbortError") return;
        this.state.provenanceStatus = "error";
      }
      if (this.state.activeTab === "methodology") this.renderActivePanel();
    }

    renderEmptyState() {
      const panel = this.root.querySelector("[data-pci-panel]");
      if (!panel) return;
      panel.setAttribute("aria-busy", "false");
      const commands = [
        ["commandDownload", "python -m giip.economy_finance.pci_cli download"],
        ["commandManual", "python -m giip.economy_finance.pci_cli import-file /path/to/US.PCI.csv"],
        ["commandStatus", "python -m giip.economy_finance.pci_cli status"],
      ];
      const meta = this.state.meta || {};
      panel.innerHTML = `
        <section class="pci-empty-state">
          <div class="pci-empty-state__visual" aria-hidden="true"><div class="pci-empty-globe"><i></i><i></i><i></i><span>${icon("database")}</span></div></div>
          <div class="pci-empty-state__content">
            <span class="pci-status-badge is-guarded">${icon("check")} ${escapeHtml(this.t("dataPolicy"))}</span>
            <h2>${escapeHtml(this.t("notLoadedTitle"))}</h2>
            <p>${escapeHtml(this.t("notLoadedText"))}</p>
            <ol class="pci-empty-steps"><li><span>1</span>${escapeHtml(this.t("emptyStep1"))}</li><li><span>2</span>${escapeHtml(this.t("emptyStep2"))}</li><li><span>3</span>${escapeHtml(this.t("emptyStep3"))}</li></ol>
            <div class="pci-command-list">${commands.map(([label, command]) => `<div class="pci-command"><div><span>${escapeHtml(this.t(label))}</span><code>${escapeHtml(command)}</code></div><button type="button" data-pci-copy-command="${escapeHtml(command)}" aria-label="${escapeHtml(this.t("copyCommand"))}">${icon("link")}</button></div>`).join("")}</div>
            <div class="pci-empty-actions"><button type="button" class="pci-button pci-button--primary" data-pci-retry>${icon("refresh")} ${escapeHtml(this.t("retry"))}</button><a class="pci-button pci-button--secondary" href="${safeUrl(meta.data_centre_url || "https://unctadstat.unctad.org/datacentre/dataviewer/US.PCI")}" target="_blank" rel="noopener noreferrer">${icon("external")} ${escapeHtml(this.t("dataCentre"))}</a></div>
          </div>
          <aside class="pci-empty-sources"><span>${escapeHtml(this.t("officialLinks"))}</span>${[
            [this.t("sourcePage"), meta.source_page_url || "https://unctadstat.unctad.org/EN/Pci.html"],
            [this.t("dataCentre"), meta.data_centre_url || "https://unctadstat.unctad.org/datacentre/dataviewer/US.PCI"],
            [this.t("methodologyDoc"), meta.methodology_url || "https://unctad.org/system/files/official-document/aldc2023d2_en.pdf"],
          ].map(([label, url]) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(label)}</span>${icon("external")}</a>`).join("")}</aside>
        </section>
      `;
    }

    renderErrorState(error) {
      const panel = this.root.querySelector("[data-pci-panel]");
      if (!panel) return;
      panel.setAttribute("aria-busy", "false");
      panel.innerHTML = `
        <section class="pci-error-state">
          <div class="pci-error-state__icon">${icon("alert")}</div>
          <span class="pci-card__eyebrow">PCI · ${escapeHtml(error?.status ? `HTTP ${error.status}` : "NETWORK")}</span>
          <h2>${escapeHtml(this.t("networkTitle"))}</h2>
          <p>${escapeHtml(this.t("networkText"))}</p>
          <button type="button" class="pci-button pci-button--primary" data-pci-retry>${icon("refresh")} ${escapeHtml(this.t("retry"))}</button>
          <details><summary>${escapeHtml(this.t("technicalDetails"))}</summary><pre>${escapeHtml(error?.stack || error?.message || String(error || "Unknown error"))}</pre></details>
        </section>
      `;
    }

    async openCountry(iso3, origin = null) {
      if (!iso3) return;
      this.lastFocus = origin || document.activeElement;
      this.state.drawer = { iso3, status: "loading", profile: null, series: null, error: null };
      this.renderDrawer();
      try {
        const [profile, series] = await Promise.all([
          this.request(`/countries/${encodeURIComponent(iso3)}`, { year: this.state.year }),
          this.request(`/countries/${encodeURIComponent(iso3)}/series`, { component: this.state.component }),
        ]);
        if (!this.state.drawer || this.state.drawer.iso3 !== iso3) return;
        this.state.drawer = { iso3, status: "ready", profile, series, error: null };
      } catch (error) {
        if (error?.name === "AbortError" || !this.state.drawer || this.state.drawer.iso3 !== iso3) return;
        this.state.drawer = { iso3, status: "error", profile: null, series: null, error };
      }
      this.renderDrawer();
    }

    closeDrawer() {
      this.state.drawer = null;
      this.renderDrawer();
      if (this.lastFocus?.focus) this.lastFocus.focus({ preventScroll: true });
      this.lastFocus = null;
    }

    renderDrawer() {
      const layer = this.root.querySelector("[data-pci-drawer-layer]");
      if (!layer) return;
      const drawer = this.state.drawer;
      if (!drawer) {
        layer.hidden = true;
        layer.innerHTML = "";
        document.documentElement.classList.remove("pci-drawer-open");
        return;
      }
      layer.hidden = false;
      document.documentElement.classList.add("pci-drawer-open");
      const rankingItem = this.rankingByIso().get(drawer.iso3);
      const name = drawer.profile?.economy?.name || rankingItem?.economy_name || drawer.iso3;
      layer.innerHTML = `
        <div class="pci-drawer-backdrop" data-pci-action="close-drawer"></div>
        <aside class="pci-drawer" role="dialog" aria-modal="true" aria-labelledby="${this.id}-drawer-title">
          <header class="pci-drawer__header"><div><span class="pci-iso-token">${escapeHtml(drawer.iso3)}</span><small>${escapeHtml(this.t("profile"))}</small><h2 id="${this.id}-drawer-title">${escapeHtml(name)}</h2></div><button type="button" class="pci-drawer__close" data-pci-action="close-drawer" aria-label="${escapeHtml(this.t("close"))}">${icon("close")}</button></header>
          <div class="pci-drawer__body">${drawer.status === "loading" ? this.drawerLoadingMarkup() : drawer.status === "error" ? this.drawerErrorMarkup(drawer.error) : this.drawerProfileMarkup(drawer.profile, drawer.series)}</div>
        </aside>
      `;
      window.requestAnimationFrame(() => layer.querySelector(".pci-drawer__close")?.focus({ preventScroll: true }));
    }

    drawerLoadingMarkup() {
      return `<div class="pci-drawer-loading"><div class="pci-loader"><span></span><span></span><span></span></div><p>${escapeHtml(this.t("loadingCountry"))}</p><div class="pci-skeleton pci-skeleton--hero"></div></div>`;
    }

    drawerErrorMarkup(error) {
      return `<div class="pci-no-results pci-no-results--error">${icon("alert")}<h3>${escapeHtml(this.t("countryError"))}</h3><p>${escapeHtml(error?.message || "")}</p></div>`;
    }

    drawerProfileMarkup(profile, series) {
      const current = profile?.values?.find((value) => value.component?.code === this.state.component) || profile?.values?.find((value) => value.component?.code === "overall") || {};
      const components = (profile?.values || []).filter((value) => value.component?.code !== "overall");
      const sorted = [...components].sort((a, b) => Number(b.score) - Number(a.score));
      const strengths = sorted.slice(0, 3);
      const constraints = sorted.slice(-3).reverse();
      return `
        <div class="pci-drawer-kpis">
          <div><span>${escapeHtml(this.t("score"))}</span><strong>${this.number(current.score, 1)}</strong><small>${escapeHtml(this.t("official"))}</small></div>
          <div><span>${escapeHtml(this.t("position"))}</span><strong>#${this.integer(current.rank)}</strong><small>${escapeHtml(this.t("derived"))}</small></div>
          <div><span>${escapeHtml(this.t("globalPercentile"))}</span><strong>${this.number(current.percentile, 0)}</strong><small>${escapeHtml(this.t("percentile"))}</small></div>
        </div>
        <section class="pci-drawer-section"><header><span>${escapeHtml(this.componentLabel(this.state.component))}</span><h3>${escapeHtml(this.t("historicalTrend"))}</h3></header>${this.singleSeriesChartMarkup(series?.items || [])}</section>
        <section class="pci-drawer-section"><header><span>${this.integer(profile?.year)}</span><h3>${escapeHtml(this.t("allComponents"))}</h3></header>${this.radarMarkup(components)}</section>
        <div class="pci-strength-grid">
          <section><h3>${escapeHtml(this.t("strengths"))}</h3>${strengths.map((value) => this.profileDimensionRow(value, "strong")).join("")}</section>
          <section><h3>${escapeHtml(this.t("constraints"))}</h3>${constraints.map((value) => this.profileDimensionRow(value, "weak")).join("")}</section>
        </div>
      `;
    }

    singleSeriesChartMarkup(items) {
      const valid = items.map((item) => ({ year: Number(item.year), score: Number(item.score) })).filter((item) => Number.isFinite(item.year) && Number.isFinite(item.score));
      if (!valid.length) return `<div class="pci-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const width = 560;
      const height = 210;
      const padding = { left: 38, right: 18, top: 18, bottom: 32 };
      const minYear = Math.min(...valid.map((item) => item.year));
      const maxYear = Math.max(...valid.map((item) => item.year));
      const minScore = Math.max(0, Math.floor((Math.min(...valid.map((item) => item.score)) - 4) / 5) * 5);
      const maxScore = Math.min(100, Math.ceil((Math.max(...valid.map((item) => item.score)) + 4) / 5) * 5);
      const x = (year) => padding.left + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - padding.left - padding.right);
      const y = (score) => padding.top + (1 - (score - minScore) / Math.max(1, maxScore - minScore)) * (height - padding.top - padding.bottom);
      const points = valid.map((item) => `${x(item.year).toFixed(2)},${y(item.score).toFixed(2)}`).join(" ");
      const area = `${padding.left},${height - padding.bottom} ${points} ${x(maxYear)},${height - padding.bottom}`;
      const last = valid.at(-1);
      return `<div class="pci-single-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(this.t("historicalTrend"))}"><defs><linearGradient id="${this.id}-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pci-accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--pci-accent)" stop-opacity="0"/></linearGradient></defs><line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="pci-chart-axis"></line><polygon points="${area}" fill="url(#${this.id}-area)"></polygon><polyline points="${points}" fill="none" stroke="var(--pci-accent)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></polyline><circle cx="${x(last.year)}" cy="${y(last.score)}" r="5" fill="var(--pci-accent)"></circle><text x="${padding.left}" y="${height - 8}" class="pci-chart-label">${minYear}</text><text x="${width - padding.right}" y="${height - 8}" text-anchor="end" class="pci-chart-label">${maxYear}</text><text x="${x(last.year) - 8}" y="${y(last.score) - 12}" text-anchor="end" class="pci-chart-value">${this.number(last.score, 1)}</text></svg></div>`;
    }

    radarMarkup(values) {
      const items = values.filter((value) => Number.isFinite(Number(value.score)));
      if (items.length < 3) return `<div class="pci-inline-empty">${escapeHtml(this.t("valueUnavailable"))}</div>`;
      const width = 520;
      const height = 360;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 120;
      const point = (index, ratio) => {
        const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
        return [centerX + Math.cos(angle) * radius * ratio, centerY + Math.sin(angle) * radius * ratio];
      };
      const grids = [0.25, 0.5, 0.75, 1].map((ratio) => `<polygon points="${items.map((_, index) => point(index, ratio).join(",")).join(" ")}" class="pci-radar-grid"></polygon>`).join("");
      const axes = items.map((_, index) => { const [x, y] = point(index, 1); return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" class="pci-radar-axis"></line>`; }).join("");
      const polygon = items.map((value, index) => point(index, clamp(Number(value.score) / 100, 0, 1)).join(",")).join(" ");
      const labels = items.map((value, index) => {
        const [x, y] = point(index, 1.25);
        const anchor = x < centerX - 20 ? "end" : x > centerX + 20 ? "start" : "middle";
        const label = this.componentLabel(value.component?.code).replace(this.state.lang === "ru" ? "Информационно-коммуникационные технологии" : "Information and communication technologies", "ICT");
        return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="pci-radar-label"><tspan x="${x}">${escapeHtml(label)}</tspan><tspan x="${x}" dy="15" class="pci-radar-value">${this.number(value.score, 1)}</tspan></text>`;
      }).join("");
      return `<div class="pci-radar"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(this.t("componentProfile"))}">${grids}${axes}<polygon points="${polygon}" class="pci-radar-shape"></polygon>${labels}</svg></div>`;
    }

    profileDimensionRow(value, tone) {
      return `<div class="pci-profile-dimension is-${tone}"><span><strong>${escapeHtml(this.componentLabel(value.component?.code))}</strong><small>#${this.integer(value.rank)}</small></span><b>${this.number(value.score, 1)}</b><i><span style="width:${clamp(Number(value.score), 0, 100)}%"></span></i></div>`;
    }

    showToast(message) {
      const toast = this.root.querySelector("[data-pci-toast]");
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("is-visible");
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
    }

    copyText(value, successMessage) {
      const fallback = () => {
        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        try { document.execCommand("copy"); } catch (_error) { /* noop */ }
        input.remove();
        this.showToast(successMessage);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(() => this.showToast(successMessage)).catch(fallback);
      else fallback();
    }

    announce(message) {
      const region = this.root.querySelector("[data-pci-live]");
      if (region) region.textContent = message;
    }
  }

  window.GIRPCI = {
    version: VERSION,
    route: ROUTE,
    render(options = {}) {
      const root = options.root || document.querySelector("#view");
      if (!root) return null;
      let instance = instances.get(root);
      if (!instance) {
        instance = new PCIWorkspace(root, options);
        instances.set(root, instance);
        instanceRegistry.add(instance);
      }
      return instance.render(options);
    },
    invalidate() {
      instanceRegistry.forEach((instance) => instance.abortAll());
    },
  };
})();
