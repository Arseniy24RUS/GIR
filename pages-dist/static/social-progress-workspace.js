/* GIR Society Stage 02 — Global Social Progress Index analytical workspace.
 * No numerical country values are bundled here. The workspace renders only
 * published records returned by the Stage 01 SPI API.
 */
(() => {
  "use strict";

  const MODULE_VERSION = "spi-frontend/2.0.0";
  const API = Object.freeze({
    status: "/api/social-progress/status",
    metadata: "/api/social-progress/metadata",
    years: "/api/social-progress/years",
    releases: "/api/social-progress/releases",
    ranking: "/api/social-progress/ranking",
    country: (iso3) => `/api/social-progress/country/${encodeURIComponent(iso3)}`,
    series: (iso3) => `/api/social-progress/country/${encodeURIComponent(iso3)}/series`,
    audit: "/api/social-progress/audit",
  });
  const GEO_URLS = [
    "/static/world_countries_lite.geojson",
    "/static/world_countries.geojson",
    "/world.geojson",
  ];
  const VIEW_KEYS = ["overview", "framework", "trend", "ranking", "methodology"];
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const apiCache = new Map();
  let instanceCounter = 0;

  const COPY = {
    ru: {
      group: "Общество и человеческое развитие",
      indexName: "Глобальный индекс социального прогресса",
      shortName: "SPI",
      lead: "Сравнение того, насколько полно страны обеспечивают базовые потребности, основы благополучия и возможности для человека — без подмены социальных результатов размером экономики.",
      officialData: "Официальные импортированные значения",
      officialSource: "Официальный источник",
      methodology: "Методология",
      premiumAccess: "Доступ к данным",
      loading: "Формируем доказательное пространство SPI",
      loadingDetail: "Проверяем опубликованную редакцию, страновые значения и происхождение данных.",
      unavailableTitle: "Интерфейс готов — официальные значения ещё не опубликованы в GIR",
      unavailableText: "Backend принимает только авторизованную выгрузку Social Progress Imperative. До прохождения проверки и publication gate интерфейс намеренно не показывает числовые значения.",
      unavailableAdmin: "Администратору данных",
      unavailableStep1: "получить официальную выгрузку на законном основании",
      unavailableStep2: "проверить и импортировать её через локальный CLI",
      unavailableStep3: "опубликовать редакцию после успешного аудита SHA-256",
      retry: "Повторить",
      errorTitle: "Не удалось открыть пространство SPI",
      errorText: "Сервер вернул неполный или недоступный набор данных. Другие вкладки GIR не затронуты.",
      country: "Страна",
      year: "Год данных",
      edition: "Редакция",
      sourceStatus: "Статус",
      selectCountry: "Выберите страну",
      selectYear: "Выберите год",
      share: "Скопировать ссылку",
      copied: "Ссылка на выбранный профиль скопирована",
      export: "Экспорт CSV",
      overview: "Обзор",
      framework: "Структура",
      trend: "Динамика",
      ranking: "Рейтинг",
      methodologyTab: "Методология",
      score: "Баллы",
      officialRank: "Официальное место",
      percentile: "Позиция в распределении",
      vsMedian: "К медиане мира",
      gapLeader: "Отставание от лидера",
      oneYearChange: "Изменение к предыдущему наблюдению",
      points: "п.",
      noRank: "не присвоено",
      noData: "Нет данных",
      dataYear: "Год наблюдения",
      releaseYear: "Год редакции",
      tier: "Группа источника",
      evidence: "Происхождение значения",
      overviewHeading: "Социальный прогресс в мировом контексте",
      overviewText: "Карта и сравнительные ориентиры используют только опубликованные официальные значения выбранного года. Цвет — вспомогательная шкала, а не отдельная классификация стран.",
      mapTitle: "География социального прогресса",
      mapHint: "Нажмите на страну с доступным значением. Для управления с клавиатуры используйте селектор страны или таблицу рейтинга.",
      mapUnavailable: "Геометрия карты недоступна; все данные остаются в таблице рейтинга.",
      visualScale: "Визуальная шкала 0–100",
      selectedProfile: "Профиль выбранной страны",
      benchmark: "Сравнительные ориентиры",
      leader: "Лидер",
      worldMedian: "Медиана",
      countriesCovered: "Стран в выбранном году",
      profileNarrativeUp: "Страна расположена выше мировой медианы по общему баллу SPI.",
      profileNarrativeDown: "Страна расположена ниже мировой медианы по общему баллу SPI.",
      profileNarrativeEqual: "Баллы страны близки к мировой медиане.",
      dimensions: "Три измерения",
      components: "Двенадцать компонентов",
      radarTitle: "Баланс трёх измерений",
      radarHint: "Чем ближе контур к внешней границе, тем выше официальный балл измерения.",
      missingMeasures: "В опубликованной выгрузке нет детализированных баллов для этого профиля.",
      frameworkHeading: "Архитектура Social Progress Index",
      frameworkText: "SPI объединяет три равноправных измерения. Каждое измерение раскрывается четырьмя компонентами; GIR не пересчитывает их и не заполняет отсутствующие значения.",
      dimension: "Измерение",
      component: "Компонент",
      scoreOutOf: "из 100",
      quality: "Контроль качества",
      officialValue: "официальное значение",
      notRecomputed: "Места и баллы не пересчитываются GIR",
      trendHeading: "Траектория социального прогресса",
      trendText: "Исторический ряд показывает опубликованные наблюдения для одной страны. Годы редакции и годы наблюдения хранятся раздельно.",
      scoreTrend: "Динамика балла",
      rankTrend: "Динамика места",
      bestValue: "Лучшее значение",
      latestValue: "Последнее значение",
      periodChange: "Изменение за период",
      observations: "Наблюдений",
      chartScoreLabel: "Линейный график баллов SPI по годам",
      chartRankLabel: "Линейный график официального места SPI по годам; меньшее место лучше",
      accessibleTable: "Показать данные графиков таблицей",
      rankingHeading: "Официальный страновой рейтинг",
      rankingText: "Таблица сохраняет официальные места источника. Страны без опубликованного места не получают вычисленного ранга GIR.",
      search: "Поиск страны или ISO3",
      allRegions: "Все регионы",
      allIncome: "Все группы дохода",
      sort: "Сортировка",
      sortRank: "По официальному месту",
      sortScore: "По баллу",
      sortCountry: "По названию страны",
      rowsPerPage: "Строк на странице",
      showing: "Показано",
      of: "из",
      previous: "Назад",
      next: "Далее",
      rank: "Место",
      region: "Регион",
      income: "Группа дохода",
      qualityFlag: "Качество",
      openProfile: "Открыть профиль",
      noMatches: "По выбранным фильтрам стран не найдено.",
      methodologyHeading: "Методология, редакция и аудит",
      methodologyText: "Здесь отделены смысл индекса, параметры опубликованной редакции и техническое происхождение локального снимка данных.",
      indexPrinciple: "Что измеряет SPI",
      indexPrincipleText: "Индекс оценивает социальные и экологические результаты, организованные вокруг базовых потребностей, основ благополучия и возможностей человека.",
      scale: "Шкала",
      direction: "Направление",
      higherBetter: "выше — лучше",
      publisher: "Издатель",
      valuesStatus: "Статус значений",
      importedOfficial: "официальный импорт без пересчёта",
      dataFootprint: "Охват опубликованных данных",
      yearsCovered: "Годы наблюдений",
      releaseDetails: "Паспорт редакции",
      releaseId: "ID редакции",
      retrievedAt: "Получено",
      snapshotHash: "SHA-256 снимка",
      transform: "Преобразование",
      audit: "Аудит происхождения",
      auditPassed: "Снимок найден, контрольная сумма совпадает, ошибок импорта нет",
      auditAttention: "Аудит требует внимания",
      snapshotPresent: "Снимок существует",
      hashMatches: "SHA-256 совпадает",
      storedErrors: "Ошибок импорта",
      technicalContract: "Технический контракт API",
      methodologyNotice: "GIR визуализирует официально импортированные баллы и ранги. Производные элементы интерфейса — медиана, разница, процентиль и визуальные диапазоны — помечены как аналитические ориентиры и не заменяют методологию издателя.",
      sourceLinkLabel: "Открыть официальный сайт SPI в новой вкладке",
      methodologyLinkLabel: "Открыть официальную методологию SPI в новой вкладке",
      provenanceTitle: "Происхождение данных SPI",
      provenanceKicker: "SPI · PROVENANCE",
      field: "Поле",
      value: "Значение",
      countrySourceName: "Название в источнике",
      rawRow: "Строка исходного файла",
      sourceUrl: "URL источника",
      methodologyUrl: "URL методологии",
      transformationId: "ID преобразования",
      transformationVersion: "Версия преобразования",
      rawSnapshot: "Контрольная сумма raw snapshot",
      release: "Редакция",
      observationYear: "Год наблюдения",
      close: "Закрыть",
      downloadName: "spi-ranking",
      notAvailable: "не указано",
      page: "Страница",
      topCountry: "Первая позиция",
      selectedCountry: "Выбранная страна",
      derivedLabel: "аналитический ориентир GIR",
      officialLabel: "официальное значение источника",
      keyboardTabs: "Используйте стрелки влево и вправо для перехода между разделами.",
      current: "Текущее",
      change: "Изменение",
      firstYear: "Первый год",
      lastYear: "Последний год",
      sourceTier: "Группа/уровень источника",
    },
    en: {
      group: "Society & human development",
      indexName: "Global Social Progress Index",
      shortName: "SPI",
      lead: "Compare how fully countries meet basic needs, build foundations of wellbeing and expand opportunity — without substituting economic size for social outcomes.",
      officialData: "Official imported values",
      officialSource: "Official source",
      methodology: "Methodology",
      premiumAccess: "Data access",
      loading: "Building the SPI evidence workspace",
      loadingDetail: "Checking the published edition, country values and data provenance.",
      unavailableTitle: "The interface is ready — official values have not yet been published in GIR",
      unavailableText: "The backend accepts only an authorised Social Progress Imperative export. Until validation and the publication gate pass, the interface intentionally displays no numerical values.",
      unavailableAdmin: "For the data administrator",
      unavailableStep1: "obtain the official export on a lawful basis",
      unavailableStep2: "validate and import it with the local CLI",
      unavailableStep3: "publish the edition after a successful SHA-256 audit",
      retry: "Retry",
      errorTitle: "The SPI workspace could not be opened",
      errorText: "The server returned an incomplete or unavailable dataset. Other GIR workspaces are unaffected.",
      country: "Country",
      year: "Data year",
      edition: "Edition",
      sourceStatus: "Status",
      selectCountry: "Select a country",
      selectYear: "Select a year",
      share: "Copy link",
      copied: "A link to the selected profile has been copied",
      export: "Export CSV",
      overview: "Overview",
      framework: "Framework",
      trend: "Trend",
      ranking: "Ranking",
      methodologyTab: "Methodology",
      score: "Score",
      officialRank: "Official rank",
      percentile: "Distribution position",
      vsMedian: "Versus world median",
      gapLeader: "Gap to leader",
      oneYearChange: "Change from previous observation",
      points: "pts",
      noRank: "not assigned",
      noData: "No data",
      dataYear: "Observation year",
      releaseYear: "Edition year",
      tier: "Source tier",
      evidence: "Value provenance",
      overviewHeading: "Social progress in global context",
      overviewText: "The map and benchmarks use only published official values for the selected year. Colour is an auxiliary scale, not a separate country classification.",
      mapTitle: "Geography of social progress",
      mapHint: "Select a country with an available value. Keyboard users can use the country selector or ranking table.",
      mapUnavailable: "Map geometry is unavailable; all data remain accessible in the ranking table.",
      visualScale: "Visual scale 0–100",
      selectedProfile: "Selected country profile",
      benchmark: "Benchmarks",
      leader: "Leader",
      worldMedian: "Median",
      countriesCovered: "Countries in selected year",
      profileNarrativeUp: "The country is above the world median on the overall SPI score.",
      profileNarrativeDown: "The country is below the world median on the overall SPI score.",
      profileNarrativeEqual: "The country score is close to the world median.",
      dimensions: "Three dimensions",
      components: "Twelve components",
      radarTitle: "Balance across three dimensions",
      radarHint: "The closer the contour is to the outer boundary, the higher the official dimension score.",
      missingMeasures: "The published export has no detailed measure scores for this profile.",
      frameworkHeading: "Social Progress Index architecture",
      frameworkText: "SPI combines three co-equal dimensions. Each dimension is expressed through four components; GIR neither recomputes them nor fills missing values.",
      dimension: "Dimension",
      component: "Component",
      scoreOutOf: "out of 100",
      quality: "Quality control",
      officialValue: "official value",
      notRecomputed: "Ranks and scores are not recomputed by GIR",
      trendHeading: "Social progress trajectory",
      trendText: "The historical series shows published observations for one country. Edition years and observation years are stored separately.",
      scoreTrend: "Score trend",
      rankTrend: "Rank trend",
      bestValue: "Best value",
      latestValue: "Latest value",
      periodChange: "Period change",
      observations: "Observations",
      chartScoreLabel: "Line chart of SPI scores by year",
      chartRankLabel: "Line chart of official SPI rank by year; a lower rank is better",
      accessibleTable: "Show chart data as a table",
      rankingHeading: "Official country ranking",
      rankingText: "The table preserves official source ranks. Countries without a published rank are not assigned a computed GIR rank.",
      search: "Search country or ISO3",
      allRegions: "All regions",
      allIncome: "All income groups",
      sort: "Sort",
      sortRank: "Official rank",
      sortScore: "Score",
      sortCountry: "Country name",
      rowsPerPage: "Rows per page",
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next",
      rank: "Rank",
      region: "Region",
      income: "Income group",
      qualityFlag: "Quality",
      openProfile: "Open profile",
      noMatches: "No countries match the selected filters.",
      methodologyHeading: "Methodology, edition and audit",
      methodologyText: "The index concept, published edition parameters and technical provenance of the local data snapshot are kept distinct.",
      indexPrinciple: "What SPI measures",
      indexPrincipleText: "The index evaluates social and environmental outcomes organised around basic needs, foundations of wellbeing and individual opportunity.",
      scale: "Scale",
      direction: "Direction",
      higherBetter: "higher is better",
      publisher: "Publisher",
      valuesStatus: "Value status",
      importedOfficial: "official import without recomputation",
      dataFootprint: "Published data footprint",
      yearsCovered: "Observation years",
      releaseDetails: "Edition passport",
      releaseId: "Release ID",
      retrievedAt: "Retrieved",
      snapshotHash: "Snapshot SHA-256",
      transform: "Transformation",
      audit: "Provenance audit",
      auditPassed: "Snapshot exists, checksum matches and no import errors are stored",
      auditAttention: "Audit requires attention",
      snapshotPresent: "Snapshot exists",
      hashMatches: "SHA-256 matches",
      storedErrors: "Stored import errors",
      technicalContract: "Technical API contract",
      methodologyNotice: "GIR visualises officially imported scores and ranks. Interface-derived elements — median, differences, percentile and visual bands — are labelled as analytical benchmarks and do not replace the publisher's methodology.",
      sourceLinkLabel: "Open the official SPI website in a new tab",
      methodologyLinkLabel: "Open the official SPI methodology in a new tab",
      provenanceTitle: "SPI data provenance",
      provenanceKicker: "SPI · PROVENANCE",
      field: "Field",
      value: "Value",
      countrySourceName: "Source country name",
      rawRow: "Source file row",
      sourceUrl: "Source URL",
      methodologyUrl: "Methodology URL",
      transformationId: "Transformation ID",
      transformationVersion: "Transformation version",
      rawSnapshot: "Raw snapshot checksum",
      release: "Edition",
      observationYear: "Observation year",
      close: "Close",
      downloadName: "spi-ranking",
      notAvailable: "not provided",
      page: "Page",
      topCountry: "Top country",
      selectedCountry: "Selected country",
      derivedLabel: "GIR analytical benchmark",
      officialLabel: "official source value",
      keyboardTabs: "Use Left and Right Arrow keys to move between sections.",
      current: "Current",
      change: "Change",
      firstYear: "First year",
      lastYear: "Last year",
      sourceTier: "Source tier/group",
    },
  };

  const runtime = {
    id: 0,
    root: null,
    context: {},
    lang: "ru",
    theme: "dark",
    view: "overview",
    year: null,
    iso3: "",
    status: null,
    metadata: null,
    years: [],
    releases: [],
    ranking: null,
    profile: null,
    series: null,
    audit: null,
    geo: null,
    geoError: null,
    loading: false,
    error: null,
    abortController: null,
    rankingQuery: "",
    rankingRegion: "",
    rankingIncome: "",
    rankingSort: "rank",
    rankingPage: 1,
    rankingPageSize: 25,
  };

  function tr(key) {
    return COPY[runtime.lang]?.[key] ?? COPY.en[key] ?? key;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function numeric(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && !value.trim()) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function formatNumber(value, digits = 1) {
    const number = numeric(value);
    if (number == null) return "—";
    return new Intl.NumberFormat(runtime.lang === "ru" ? "ru-RU" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(number);
  }

  function formatInteger(value) {
    const number = numeric(value);
    if (number == null) return "—";
    return new Intl.NumberFormat(runtime.lang === "ru" ? "ru-RU" : "en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  function formatSigned(value, digits = 1) {
    const number = numeric(value);
    if (number == null) return "—";
    const absolute = formatNumber(Math.abs(number), digits);
    if (Math.abs(number) < (digits ? 0.05 : 0.5)) return `±${absolute}`;
    return `${number > 0 ? "+" : "−"}${absolute}`;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(runtime.lang === "ru" ? "ru-RU" : "en-GB", {
      year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(date);
  }

  function countryName(item) {
    if (!item) return runtime.iso3 || "—";
    const preferred = runtime.lang === "ru" ? item.name_ru : item.name_en;
    return preferred || item.country_name_source || item.name_en || item.name_ru || item.iso3 || "—";
  }

  function measureName(item) {
    if (!item) return "—";
    return (runtime.lang === "ru" ? item.name_ru : item.name_en) || item.measure_name_source || item.measure_code;
  }

  function sourceFlag(item, className = "spi-flag") {
    const iso2 = String(item?.iso2 || "").trim().toLowerCase();
    const iso3 = String(item?.iso3 || runtime.iso3 || "").trim().toUpperCase();
    const label = escapeHtml(countryName(item));
    if (!/^[a-z]{2}$/.test(iso2)) {
      return `<span class="${className} spi-flag-fallback" aria-label="${label}">${escapeHtml(iso3)}</span>`;
    }
    return `<span class="${className} spi-flag-slot"><img src="/static/flags/${escapeHtml(iso2)}.svg" alt="${label}" loading="lazy" decoding="async"><span aria-hidden="true">${escapeHtml(iso3)}</span></span>`;
  }

  function cacheKey(url) {
    return String(url);
  }

  async function fetchJson(url, { signal, optional = false, cache = true } = {}) {
    const key = cacheKey(url);
    const now = Date.now();
    const cached = apiCache.get(key);
    if (cache && cached && cached.expiresAt > now) return cached.value;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      const value = await response.json();
      if (cache) apiCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
      return value;
    } catch (error) {
      if (optional && error?.name !== "AbortError") return null;
      throw error;
    }
  }

  async function fetchGeo(signal) {
    for (const url of GEO_URLS) {
      try {
        const value = await fetchJson(url, { signal, optional: false, cache: true });
        if (value?.type === "FeatureCollection" && Array.isArray(value.features)) return value;
      } catch (error) {
        if (error?.name === "AbortError") throw error;
      }
    }
    return null;
  }

  function readDeepLink(context) {
    const query = new URLSearchParams(window.location.search);
    const requestedView = String(query.get("spi_view") || "").toLowerCase();
    const requestedYear = Number(query.get("spi_year") || context.year || 0);
    const requestedCountry = String(query.get("spi_country") || query.get("country") || context.country || "").toUpperCase();
    return {
      view: VIEW_KEYS.includes(requestedView) ? requestedView : "overview",
      year: Number.isInteger(requestedYear) && requestedYear > 0 ? requestedYear : null,
      iso3: /^[A-Z]{3}$/.test(requestedCountry) ? requestedCountry : "",
    };
  }

  function updateDeepLink({ notifyHost = true } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("index", "SPI");
    url.searchParams.set("country", runtime.iso3);
    if (runtime.year) url.searchParams.set("year", String(runtime.year));
    url.searchParams.set("spi_country", runtime.iso3);
    if (runtime.year) url.searchParams.set("spi_year", String(runtime.year));
    url.searchParams.set("spi_view", runtime.view);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash || "#index-SPI"}`);
    if (notifyHost && typeof runtime.context.onContextChange === "function") {
      runtime.context.onContextChange({ country: runtime.iso3, year: runtime.year, view: runtime.view });
    }
  }

  function announce(message) {
    const node = runtime.root?.querySelector("[data-spi-live]");
    if (node) node.textContent = String(message || "");
  }

  function notify(message) {
    if (typeof runtime.context.onNotice === "function") runtime.context.onNotice(message);
    else announce(message);
  }

  function setDocumentMeta() {
    document.title = `${tr("indexName")} · GIR`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = tr("lead");
  }

  function renderLoading() {
    if (!runtime.root) return;
    runtime.root.innerHTML = `
      <section class="spi-workspace spi-state-shell" data-spi-workspace data-version="${MODULE_VERSION}">
        <div class="spi-state-card" role="status" aria-live="polite">
          <div class="spi-loading-mark" aria-hidden="true"><span>SPI</span><i></i></div>
          <p class="spi-kicker">${escapeHtml(tr("group"))}</p>
          <h1>${escapeHtml(tr("loading"))}</h1>
          <p>${escapeHtml(tr("loadingDetail"))}</p>
          <div class="spi-skeleton-grid" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
      </section>`;
  }

  function frameworkTree(metadata) {
    const measures = metadata?.framework?.measures || [];
    const dimensions = measures.filter((item) => item.level === "dimension").sort((a, b) => (a.order_no || 0) - (b.order_no || 0));
    return dimensions.map((dimension) => ({
      ...dimension,
      children: measures.filter((item) => item.level === "component" && item.parent_code === dimension.code).sort((a, b) => (a.order_no || 0) - (b.order_no || 0)),
    }));
  }

  function renderEmptyState() {
    const metadata = runtime.metadata || {};
    const index = metadata.index || {};
    const source = safeUrl(index.official_source_url);
    const method = safeUrl(index.methodology_url);
    const access = safeUrl(index.premium_access_url);
    const tree = frameworkTree(metadata);
    runtime.root.innerHTML = `
      <section class="spi-workspace spi-empty-state" data-spi-workspace data-version="${MODULE_VERSION}">
        <div class="spi-empty-hero">
          <div>
            <p class="spi-kicker">${escapeHtml(tr("group"))}</p>
            <span class="spi-official-chip"><i aria-hidden="true"></i>${escapeHtml(tr("officialData"))}</span>
            <h1>${escapeHtml(tr("indexName"))}</h1>
            <p class="spi-lead">${escapeHtml(tr("lead"))}</p>
            <div class="spi-link-row">
              ${source ? `<a class="spi-text-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a>` : ""}
              ${method ? `<a class="spi-text-link" href="${escapeHtml(method)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("methodology"))}<span aria-hidden="true">↗</span></a>` : ""}
              ${access ? `<a class="spi-text-link" href="${escapeHtml(access)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("premiumAccess"))}<span aria-hidden="true">↗</span></a>` : ""}
            </div>
          </div>
          <div class="spi-empty-message">
            <span aria-hidden="true">01</span>
            <h2>${escapeHtml(tr("unavailableTitle"))}</h2>
            <p>${escapeHtml(tr("unavailableText"))}</p>
            <button type="button" class="spi-button spi-button-secondary" data-spi-action="retry">${escapeHtml(tr("retry"))}</button>
          </div>
        </div>
        <div class="spi-empty-framework" aria-label="${escapeHtml(tr("framework"))}">
          ${tree.map((dimension, indexValue) => `
            <article class="spi-empty-dimension">
              <span>0${indexValue + 1}</span>
              <h2>${escapeHtml(runtime.lang === "ru" ? dimension.name_ru : dimension.name_en)}</h2>
              <ol>${dimension.children.map((item) => `<li>${escapeHtml(runtime.lang === "ru" ? item.name_ru : item.name_en)}</li>`).join("")}</ol>
            </article>`).join("")}
        </div>
        <aside class="spi-admin-note">
          <div><span>CLI</span><h2>${escapeHtml(tr("unavailableAdmin"))}</h2></div>
          <ol>
            <li>${escapeHtml(tr("unavailableStep1"))}</li>
            <li>${escapeHtml(tr("unavailableStep2"))}</li>
            <li>${escapeHtml(tr("unavailableStep3"))}</li>
          </ol>
          <pre><code>python -m giip.social_progress status
python -m giip.social_progress import /secure/spi_export.xlsx ...
python -m giip.social_progress publish &lt;release-id&gt;</code></pre>
        </aside>
        <p class="spi-sr-only" aria-live="polite" data-spi-live></p>
      </section>`;
    bindEvents();
  }

  function renderError(error) {
    runtime.root.innerHTML = `
      <section class="spi-workspace spi-state-shell" data-spi-workspace data-version="${MODULE_VERSION}">
        <div class="spi-state-card spi-state-error" role="alert">
          <div class="spi-error-code" aria-hidden="true">SPI / !</div>
          <p class="spi-kicker">${escapeHtml(tr("group"))}</p>
          <h1>${escapeHtml(tr("errorTitle"))}</h1>
          <p>${escapeHtml(tr("errorText"))}</p>
          <details><summary>${escapeHtml(runtime.lang === "ru" ? "Технические сведения" : "Technical details")}</summary><pre>${escapeHtml(error?.message || String(error || "Unknown error"))}</pre></details>
          <button type="button" class="spi-button" data-spi-action="retry">${escapeHtml(tr("retry"))}</button>
        </div>
      </section>`;
    bindEvents();
  }

  function selectYear(requested, years) {
    const values = years.map((item) => Number(item.observation_year)).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return null;
    if (requested && values.includes(Number(requested))) return Number(requested);
    return values[values.length - 1];
  }

  function selectCountry(requested, items) {
    const code = String(requested || "").toUpperCase();
    if (items.some((item) => item.iso3 === code)) return code;
    return code;
  }

  async function loadWorkspace({ preserveInteraction = false } = {}) {
    if (!runtime.root) return;
    runtime.abortController?.abort();
    const controller = new AbortController();
    runtime.abortController = controller;
    runtime.loading = true;
    runtime.error = null;
    renderLoading();
    try {
      const [status, metadata, yearsPayload, releasesPayload] = await Promise.all([
        fetchJson(API.status, { signal: controller.signal, cache: false }),
        fetchJson(API.metadata, { signal: controller.signal }),
        fetchJson(API.years, { signal: controller.signal, cache: false }),
        fetchJson(API.releases, { signal: controller.signal, cache: false }),
      ]);
      if (controller.signal.aborted) return;
      runtime.status = status;
      runtime.metadata = metadata;
      runtime.years = Array.isArray(yearsPayload?.items) ? yearsPayload.items : [];
      runtime.releases = Array.isArray(releasesPayload?.items) ? releasesPayload.items : [];
      if (status?.data_status !== "available" || !runtime.years.length) {
        runtime.loading = false;
        renderEmptyState();
        return;
      }

      runtime.year = selectYear(runtime.year, runtime.years);
      const rankingUrl = `${API.ranking}?${new URLSearchParams({ year: String(runtime.year), limit: "500", offset: "0" })}`;
      const [ranking, audit, geo] = await Promise.all([
        fetchJson(rankingUrl, { signal: controller.signal, cache: false }),
        fetchJson(API.audit, { signal: controller.signal, optional: true, cache: false }),
        fetchGeo(controller.signal).catch((error) => {
          if (error?.name === "AbortError") throw error;
          runtime.geoError = error;
          return null;
        }),
      ]);
      if (controller.signal.aborted) return;
      runtime.ranking = ranking;
      runtime.audit = audit;
      runtime.geo = geo;
      const items = Array.isArray(ranking?.items) ? ranking.items : [];
      runtime.iso3 = selectCountry(runtime.iso3, items);
      await loadSelectedProfile(controller.signal);
      if (controller.signal.aborted) return;
      runtime.loading = false;
      if (!preserveInteraction) runtime.rankingPage = 1;
      updateDeepLink({ notifyHost: true });
      renderAvailable();
    } catch (error) {
      if (error?.name === "AbortError") return;
      runtime.loading = false;
      runtime.error = error;
      renderError(error);
    }
  }

  async function loadSelectedProfile(signal) {
    const query = new URLSearchParams({ year: String(runtime.year) });
    const [profile, series] = await Promise.all([
      fetchJson(`${API.country(runtime.iso3)}?${query}`, { signal, cache: false }),
      fetchJson(API.series(runtime.iso3), { signal, cache: false }),
    ]);
    runtime.profile = profile;
    runtime.series = series;
  }

  async function changeCountry(iso3, { focusView = false } = {}) {
    const code = String(iso3 || "").toUpperCase();
    if (!/^[A-Z]{3}$/.test(code) || code === runtime.iso3) return;
    runtime.iso3 = code;
    runtime.abortController?.abort();
    const controller = new AbortController();
    runtime.abortController = controller;
    const profilePanel = runtime.root?.querySelector("[data-spi-profile-loading]");
    if (profilePanel) profilePanel.setAttribute("aria-busy", "true");
    try {
      await loadSelectedProfile(controller.signal);
      if (controller.signal.aborted) return;
      updateDeepLink({ notifyHost: true });
      renderAvailable();
      const selectedName = countryName(selectedRankingItem());
      announce(`${tr("selectedCountry")}: ${selectedName}`);
      if (focusView) runtime.root?.querySelector(`[data-spi-panel="${runtime.view}"]`)?.focus({ preventScroll: true });
    } catch (error) {
      if (error?.name !== "AbortError") {
        runtime.error = error;
        renderError(error);
      }
    }
  }

  async function changeYear(year) {
    const value = Number(year);
    if (!Number.isInteger(value) || value === runtime.year) return;
    runtime.year = value;
    runtime.rankingPage = 1;
    await loadWorkspace({ preserveInteraction: true });
  }

  function selectedRankingItem() {
    return (runtime.ranking?.items || []).find((item) => item.iso3 === runtime.iso3) || runtime.profile?.country || null;
  }

  function sortedScores() {
    return (runtime.ranking?.items || []).map((item) => numeric(item.score)).filter((value) => value != null).sort((a, b) => a - b);
  }

  function median(values) {
    if (!values.length) return null;
    const middle = Math.floor(values.length / 2);
    return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  }

  function benchmarkModel() {
    const items = runtime.ranking?.items || [];
    const selected = selectedRankingItem();
    const scores = sortedScores();
    const worldMedian = median(scores);
    const leader = [...items].filter((item) => numeric(item.score) != null).sort((a, b) => numeric(b.score) - numeric(a.score))[0] || null;
    const score = numeric(selected?.score);
    const rank = numeric(selected?.official_rank);
    const totalRanked = items.filter((item) => numeric(item.official_rank) != null).length;
    const percentile = rank != null && totalRanked > 1 ? 100 * (1 - ((rank - 1) / (totalRanked - 1))) : null;
    const series = (runtime.series?.items || []).filter((item) => numeric(item.score) != null).sort((a, b) => Number(a.observation_year) - Number(b.observation_year));
    const currentIndex = series.findIndex((item) => Number(item.observation_year) === Number(runtime.year));
    const latestIndex = currentIndex >= 0 ? currentIndex : series.length - 1;
    const previous = latestIndex > 0 ? series[latestIndex - 1] : null;
    const oneYearChange = score != null && previous ? score - numeric(previous.score) : null;
    return {
      selected,
      score,
      rank,
      scores,
      median: worldMedian,
      leader,
      percentile,
      gapLeader: score != null && numeric(leader?.score) != null ? score - numeric(leader.score) : null,
      vsMedian: score != null && worldMedian != null ? score - worldMedian : null,
      oneYearChange,
      total: items.length,
    };
  }

  function scoreTone(value) {
    const score = numeric(value);
    if (score == null) return "none";
    if (score >= 85) return "7";
    if (score >= 75) return "6";
    if (score >= 65) return "5";
    if (score >= 55) return "4";
    if (score >= 45) return "3";
    if (score >= 35) return "2";
    return "1";
  }

  function metricCard(label, value, note, { derived = false, tone = "" } = {}) {
    return `<article class="spi-metric ${tone ? `is-${escapeHtml(tone)}` : ""}">
      <div><span>${escapeHtml(label)}</span>${derived ? `<em>${escapeHtml(tr("derivedLabel"))}</em>` : `<em>${escapeHtml(tr("officialLabel"))}</em>`}</div>
      <strong>${value}</strong>
      <p>${escapeHtml(note || "")}</p>
    </article>`;
  }

  function controlBar() {
    const items = runtime.ranking?.items || [];
    const years = [...runtime.years].sort((a, b) => Number(b.observation_year) - Number(a.observation_year));
    const selected = selectedRankingItem();
    const selectedRelease = runtime.ranking?.release || runtime.releases.find((item) => item.release_id === runtime.ranking?.release_id) || {};
    return `<div class="spi-control-deck" aria-label="${escapeHtml(runtime.lang === "ru" ? "Контекст анализа SPI" : "SPI analysis context")}">
      <div class="spi-control-primary">
        <label class="spi-field"><span>${escapeHtml(tr("country"))}</span>
          <select data-spi-country aria-label="${escapeHtml(tr("selectCountry"))}">
            ${[...items].sort((a, b) => countryName(a).localeCompare(countryName(b), runtime.lang)).map((item) => `<option value="${escapeHtml(item.iso3)}" ${item.iso3 === runtime.iso3 ? "selected" : ""}>${escapeHtml(countryName(item))} · ${escapeHtml(item.iso3)}</option>`).join("")}
          </select>
        </label>
        <label class="spi-field spi-field-year"><span>${escapeHtml(tr("year"))}</span>
          <select data-spi-year aria-label="${escapeHtml(tr("selectYear"))}">
            ${years.map((item) => `<option value="${escapeHtml(item.observation_year)}" ${Number(item.observation_year) === Number(runtime.year) ? "selected" : ""}>${escapeHtml(item.observation_year)}</option>`).join("")}
          </select>
        </label>
        <div class="spi-context-readout"><span>${escapeHtml(tr("edition"))}</span><strong>${escapeHtml(selectedRelease.edition_name || selectedRelease.release_year || runtime.ranking?.release_id || "—")}</strong></div>
      </div>
      <div class="spi-control-actions">
        <button type="button" class="spi-button spi-button-secondary" data-spi-action="share"><span aria-hidden="true">↗</span>${escapeHtml(tr("share"))}</button>
        <button type="button" class="spi-button" data-spi-action="export"><span aria-hidden="true">↓</span>${escapeHtml(tr("export"))}</button>
      </div>
      <span class="spi-control-selected" aria-hidden="true">${sourceFlag(selected, "spi-control-flag")}<b>${escapeHtml(countryName(selected))}</b></span>
    </div>`;
  }

  function tabs() {
    return `<div class="spi-tabs-wrap">
      <div class="spi-tabs" role="tablist" aria-label="${escapeHtml(tr("indexName"))}" aria-describedby="spi-tabs-hint-${runtime.id}">
        ${VIEW_KEYS.map((key, index) => `<button type="button" role="tab" id="spi-tab-${runtime.id}-${key}" aria-controls="spi-panel-${runtime.id}-${key}" aria-selected="${runtime.view === key}" tabindex="${runtime.view === key ? "0" : "-1"}" data-spi-view="${key}"><span>0${index + 1}</span>${escapeHtml(tr(key === "methodology" ? "methodologyTab" : key))}</button>`).join("")}
      </div>
      <p class="spi-sr-only" id="spi-tabs-hint-${runtime.id}">${escapeHtml(tr("keyboardTabs"))}</p>
    </div>`;
  }

  function hero() {
    const model = benchmarkModel();
    const selected = model.selected || {};
    const country = runtime.profile?.country || selected;
    const source = safeUrl(runtime.metadata?.index?.official_source_url || country.source_url);
    const method = safeUrl(runtime.metadata?.index?.methodology_url || country.methodology_url);
    const rankText = model.rank != null ? `#${formatInteger(model.rank)}` : tr("noRank");
    const ringValue = model.score == null ? 0 : Math.max(0, Math.min(100, model.score));
    return `<section class="spi-hero" data-spi-profile-loading aria-busy="false">
      <div class="spi-hero-main">
        <div class="spi-hero-topline">
          <p class="spi-kicker">${escapeHtml(tr("group"))}</p>
          <span class="spi-official-chip"><i aria-hidden="true"></i>${escapeHtml(tr("officialData"))}</span>
        </div>
        <span class="spi-index-code" aria-hidden="true">SPI</span>
        <h1>${escapeHtml(tr("indexName"))}</h1>
        <p class="spi-lead">${escapeHtml(tr("lead"))}</p>
        <div class="spi-link-row">
          ${source ? `<a class="spi-text-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(tr("sourceLinkLabel"))}">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a>` : ""}
          ${method ? `<a class="spi-text-link" href="${escapeHtml(method)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(tr("methodologyLinkLabel"))}">${escapeHtml(tr("methodology"))}<span aria-hidden="true">↗</span></a>` : ""}
        </div>
      </div>
      <aside class="spi-hero-score" aria-label="${escapeHtml(tr("selectedProfile"))}">
        <div class="spi-country-heading">${sourceFlag(selected, "spi-hero-flag")}<div><span>${escapeHtml(selected.iso3 || runtime.iso3)}</span><h2>${escapeHtml(countryName(selected))}</h2></div></div>
        <div class="spi-score-orbit" style="--spi-score:${ringValue}">
          <svg viewBox="0 0 190 190" aria-hidden="true"><circle cx="95" cy="95" r="78"></circle><circle class="spi-score-progress" cx="95" cy="95" r="78" pathLength="100"></circle></svg>
          <div><span>${escapeHtml(tr("score"))}</span><strong>${formatNumber(model.score, 1)}</strong><small>/ 100</small></div>
        </div>
        <div class="spi-hero-rank"><span>${escapeHtml(tr("officialRank"))}</span><strong>${escapeHtml(rankText)}</strong><small>${escapeHtml(tr("dataYear"))}: ${escapeHtml(runtime.year)}</small></div>
        <button type="button" class="spi-evidence-link" data-spi-action="provenance">${escapeHtml(tr("evidence"))}<span aria-hidden="true">→</span></button>
      </aside>
    </section>`;
  }

  function sectionHeading(kicker, title, text) {
    return `<header class="spi-section-heading"><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div><p>${escapeHtml(text)}</p></header>`;
  }

  function profileMeasures() {
    return Array.isArray(runtime.profile?.measures) ? runtime.profile.measures : [];
  }

  function dimensionModel() {
    const catalog = frameworkTree(runtime.metadata);
    const values = new Map(profileMeasures().map((item) => [item.measure_code, item]));
    return catalog.map((dimension) => ({
      catalog: dimension,
      value: values.get(dimension.code) || null,
      children: dimension.children.map((component) => ({ catalog: component, value: values.get(component.code) || null })),
    }));
  }

  function radarChart(dimensions) {
    const valid = dimensions.map((item) => numeric(item.value?.score));
    if (!valid.some((value) => value != null)) return `<div class="spi-chart-empty">${escapeHtml(tr("missingMeasures"))}</div>`;
    const size = 430;
    const center = size / 2;
    const maxRadius = 152;
    const angles = [-Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 / 3), -Math.PI / 2 + (Math.PI * 4 / 3)];
    const point = (angle, radius) => [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
    const polygon = (ratio) => angles.map((angle) => point(angle, maxRadius * ratio).map((value) => value.toFixed(1)).join(",")).join(" ");
    const dataPoints = angles.map((angle, index) => point(angle, maxRadius * Math.max(0, Math.min(100, valid[index] || 0)) / 100));
    const dataPolygon = dataPoints.map((entry) => entry.map((value) => value.toFixed(1)).join(",")).join(" ");
    const labels = dimensions.map((item, index) => {
      const anchorPoint = point(angles[index], maxRadius + 47);
      const anchor = index === 0 ? "middle" : (index === 1 ? "start" : "end");
      return `<text x="${anchorPoint[0]}" y="${anchorPoint[1]}" text-anchor="${anchor}" class="spi-radar-label"><tspan x="${anchorPoint[0]}" dy="0">${escapeHtml(measureName(item.catalog))}</tspan><tspan x="${anchorPoint[0]}" dy="16" class="spi-radar-value">${formatNumber(valid[index], 1)}</tspan></text>`;
    }).join("");
    const axes = angles.map((angle) => {
      const end = point(angle, maxRadius);
      return `<line x1="${center}" y1="${center}" x2="${end[0]}" y2="${end[1]}"></line>`;
    }).join("");
    return `<svg class="spi-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHtml(tr("radarTitle"))}">
      <g class="spi-radar-grid"><polygon points="${polygon(1)}"></polygon><polygon points="${polygon(.75)}"></polygon><polygon points="${polygon(.5)}"></polygon><polygon points="${polygon(.25)}"></polygon>${axes}</g>
      <polygon class="spi-radar-area" points="${dataPolygon}"></polygon>
      <polyline class="spi-radar-line" points="${dataPolygon} ${dataPoints[0].map((value) => value.toFixed(1)).join(",")}"></polyline>
      ${dataPoints.map((entry) => `<circle class="spi-radar-point" cx="${entry[0]}" cy="${entry[1]}" r="5"></circle>`).join("")}
      ${labels}
    </svg>`;
  }

  function featureIso(feature) {
    const properties = feature?.properties || {};
    const candidates = [
      feature?.id, properties.iso3, properties.ISO3, properties.ISO_A3, properties.ADM0_A3,
      properties.SOV_A3, properties.WB_A3, properties.gu_a3, properties.adm0_a3,
    ];
    const value = candidates.find((candidate) => /^[A-Za-z]{3}$/.test(String(candidate || "")));
    return value ? String(value).toUpperCase() : "";
  }

  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
    const project = (coordinate) => [((Number(coordinate[0]) + 180) / 360) * width, ((90 - Number(coordinate[1])) / 180) * height];
    const paths = [];
    for (const polygon of polygons) {
      for (const ring of polygon || []) {
        let subpath = "";
        let previous = null;
        for (const coordinate of ring || []) {
          if (!Array.isArray(coordinate) || coordinate.length < 2) continue;
          const next = project(coordinate);
          if (!Number.isFinite(next[0]) || !Number.isFinite(next[1])) continue;
          const move = !previous || Math.abs(next[0] - previous[0]) > width * .46;
          subpath += `${move ? "M" : "L"}${next[0].toFixed(1)},${next[1].toFixed(1)}`;
          previous = next;
        }
        if (subpath) paths.push(`${subpath}Z`);
      }
    }
    return paths.join("");
  }

  function mapMarkup() {
    if (!runtime.geo?.features?.length) return `<div class="spi-map-empty"><span aria-hidden="true">⌁</span><p>${escapeHtml(tr("mapUnavailable"))}</p></div>`;
    const rankingByIso = new Map((runtime.ranking?.items || []).map((item) => [item.iso3, item]));
    const width = 1000;
    const height = 510;
    const paths = runtime.geo.features.map((feature) => {
      const iso3 = featureIso(feature);
      const item = rankingByIso.get(iso3);
      const path = geometryPath(feature.geometry, width, height);
      if (!path) return "";
      const score = numeric(item?.score);
      const selected = iso3 === runtime.iso3;
      const label = item ? `${countryName(item)}: ${tr("score")} ${formatNumber(score, 1)}` : iso3 || tr("noData");
      return `<path d="${path}" class="spi-map-country spi-map-bin-${scoreTone(score)} ${selected ? "is-selected" : ""}" data-spi-map-iso="${escapeHtml(iso3)}" data-has-value="${Boolean(item)}" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title></path>`;
    }).join("");
    return `<div class="spi-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("mapTitle"))}">${paths}</svg></div>`;
  }

  function mapLegend() {
    const ranges = ["0–34.9", "35–44.9", "45–54.9", "55–64.9", "65–74.9", "75–84.9", "85–100"];
    return `<div class="spi-map-legend"><span>${escapeHtml(tr("visualScale"))}</span><div>${ranges.map((label, index) => `<span><i class="spi-map-bin-${index + 1}"></i>${label}</span>`).join("")}<span><i class="spi-map-bin-none"></i>${escapeHtml(tr("noData"))}</span></div></div>`;
  }

  function compactRanking(model) {
    const items = runtime.ranking?.items || [];
    const selectedIndex = items.findIndex((item) => item.iso3 === runtime.iso3);
    const start = Math.max(0, Math.min(items.length - 5, selectedIndex - 2));
    const windowItems = items.slice(start, start + 5);
    return `<div class="spi-neighbour-list">
      ${windowItems.map((item) => `<button type="button" data-spi-country-pick="${escapeHtml(item.iso3)}" class="${item.iso3 === runtime.iso3 ? "is-selected" : ""}"><span>${numeric(item.official_rank) != null ? `#${formatInteger(item.official_rank)}` : "—"}</span>${sourceFlag(item, "spi-mini-flag")}<b>${escapeHtml(countryName(item))}</b><strong>${formatNumber(item.score, 1)}</strong></button>`).join("")}
    </div>`;
  }

  function overviewPanel() {
    const model = benchmarkModel();
    const selected = model.selected || {};
    const dimensions = dimensionModel();
    const narrative = model.vsMedian == null ? "" : Math.abs(model.vsMedian) < .05 ? tr("profileNarrativeEqual") : model.vsMedian > 0 ? tr("profileNarrativeUp") : tr("profileNarrativeDown");
    return `<section id="spi-panel-${runtime.id}-overview" class="spi-view-panel" role="tabpanel" tabindex="0" aria-labelledby="spi-tab-${runtime.id}-overview" data-spi-panel="overview">
      ${sectionHeading("01 · " + tr("overview"), tr("overviewHeading"), tr("overviewText"))}
      <div class="spi-metrics-grid">
        ${metricCard(tr("officialRank"), model.rank != null ? `#${formatInteger(model.rank)}` : escapeHtml(tr("noRank")), `${tr("countriesCovered")}: ${formatInteger(model.total)}`)}
        ${metricCard(tr("percentile"), model.percentile != null ? `${formatNumber(model.percentile, 0)}%` : "—", runtime.lang === "ru" ? "100% — верхняя позиция" : "100% is the top position", { derived: true })}
        ${metricCard(tr("vsMedian"), `${formatSigned(model.vsMedian, 1)} ${escapeHtml(tr("points"))}`, narrative, { derived: true, tone: model.vsMedian > 0 ? "positive" : model.vsMedian < 0 ? "negative" : "neutral" })}
        ${metricCard(tr("gapLeader"), `${formatSigned(model.gapLeader, 1)} ${escapeHtml(tr("points"))}`, model.leader ? countryName(model.leader) : "—", { derived: true })}
      </div>
      <div class="spi-overview-grid">
        <article class="spi-panel spi-map-panel">
          <header class="spi-panel-head"><div><span>${escapeHtml(tr("benchmark"))}</span><h3>${escapeHtml(tr("mapTitle"))}</h3></div><p>${escapeHtml(tr("mapHint"))}</p></header>
          ${mapMarkup()}
          ${mapLegend()}
        </article>
        <aside class="spi-panel spi-profile-panel">
          <header class="spi-panel-head"><div><span>${escapeHtml(selected.iso3 || runtime.iso3)}</span><h3>${escapeHtml(tr("selectedProfile"))}</h3></div></header>
          <div class="spi-profile-identity">${sourceFlag(selected, "spi-profile-flag")}<div><h4>${escapeHtml(countryName(selected))}</h4><p>${escapeHtml(selected.region || tr("notAvailable"))}${selected.income_group ? ` · ${escapeHtml(selected.income_group)}` : ""}</p></div></div>
          <dl class="spi-profile-facts">
            <div><dt>${escapeHtml(tr("score"))}</dt><dd>${formatNumber(model.score, 1)}</dd></div>
            <div><dt>${escapeHtml(tr("officialRank"))}</dt><dd>${model.rank != null ? `#${formatInteger(model.rank)}` : "—"}</dd></div>
            <div><dt>${escapeHtml(tr("tier"))}</dt><dd>${escapeHtml(selected.tier || tr("notAvailable"))}</dd></div>
            <div><dt>${escapeHtml(tr("oneYearChange"))}</dt><dd>${formatSigned(model.oneYearChange, 1)}</dd></div>
          </dl>
          <p class="spi-profile-narrative">${escapeHtml(narrative)}</p>
          ${compactRanking(model)}
          <button type="button" class="spi-evidence-link" data-spi-action="provenance">${escapeHtml(tr("evidence"))}<span aria-hidden="true">→</span></button>
        </aside>
      </div>
      <div class="spi-overview-grid spi-overview-grid-secondary">
        <article class="spi-panel">
          <header class="spi-panel-head"><div><span>${escapeHtml(tr("dimensions"))}</span><h3>${escapeHtml(tr("radarTitle"))}</h3></div><p>${escapeHtml(tr("radarHint"))}</p></header>
          <div class="spi-radar-wrap">${radarChart(dimensions)}</div>
        </article>
        <article class="spi-panel">
          <header class="spi-panel-head"><div><span>${escapeHtml(tr("components"))}</span><h3>${escapeHtml(runtime.lang === "ru" ? "Сильные и уязвимые компоненты" : "Component strengths and gaps")}</h3></div><p>${escapeHtml(tr("notRecomputed"))}</p></header>
          ${componentBars(dimensions)}
        </article>
      </div>
    </section>`;
  }

  function componentBars(dimensions) {
    const components = dimensions.flatMap((dimension) => dimension.children.map((child) => ({ ...child, parent: dimension.catalog })));
    if (!components.some((item) => numeric(item.value?.score) != null)) return `<div class="spi-chart-empty">${escapeHtml(tr("missingMeasures"))}</div>`;
    return `<div class="spi-component-bars">${components.map((item) => {
      const score = numeric(item.value?.score);
      return `<div class="spi-component-bar">
        <div><span>${escapeHtml(measureName(item.catalog))}</span><small>${escapeHtml(measureName(item.parent))}</small></div>
        <strong>${formatNumber(score, 1)}</strong>
        <div class="spi-bar-track" role="img" aria-label="${escapeHtml(`${measureName(item.catalog)}: ${formatNumber(score, 1)} / 100`)}"><i style="--spi-width:${score == null ? 0 : Math.max(0, Math.min(100, score))}%"></i></div>
      </div>`;
    }).join("")}</div>`;
  }

  function frameworkPanel() {
    const dimensions = dimensionModel();
    return `<section id="spi-panel-${runtime.id}-framework" class="spi-view-panel" role="tabpanel" tabindex="0" aria-labelledby="spi-tab-${runtime.id}-framework" data-spi-panel="framework">
      ${sectionHeading("02 · " + tr("framework"), tr("frameworkHeading"), tr("frameworkText"))}
      <div class="spi-framework-grid">
        ${dimensions.map((dimension, index) => {
          const score = numeric(dimension.value?.score);
          return `<article class="spi-dimension-card">
            <header><span>0${index + 1} · ${escapeHtml(tr("dimension"))}</span><strong>${formatNumber(score, 1)}<small>/100</small></strong></header>
            <h3>${escapeHtml(measureName(dimension.catalog))}</h3>
            <div class="spi-dimension-meter"><i style="--spi-width:${score == null ? 0 : Math.max(0, Math.min(100, score))}%"></i></div>
            <ol>
              ${dimension.children.map((component, componentIndex) => {
                const componentScore = numeric(component.value?.score);
                return `<li><div><span>${index + 1}.${componentIndex + 1}</span><h4>${escapeHtml(measureName(component.catalog))}</h4></div><strong>${formatNumber(componentScore, 1)}</strong><small>${numeric(component.value?.official_rank) != null ? `#${formatInteger(component.value.official_rank)}` : tr("officialValue")}</small></li>`;
              }).join("")}
            </ol>
          </article>`;
        }).join("")}
      </div>
      <div class="spi-framework-note">
        <span aria-hidden="true">≠</span>
        <div><h3>${escapeHtml(tr("notRecomputed"))}</h3><p>${escapeHtml(tr("methodologyNotice"))}</p></div>
      </div>
    </section>`;
  }

  function chartModel(series, metric) {
    const rows = series.map((item) => ({ year: Number(item.observation_year), value: numeric(item[metric]) })).filter((item) => Number.isFinite(item.year) && item.value != null);
    if (!rows.length) return null;
    const width = 780;
    const height = 340;
    const padding = { top: 35, right: 32, bottom: 48, left: 62 };
    const values = rows.map((item) => item.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const margin = Math.max((max - min) * .12, metric === "score" ? 1 : 2);
    min -= margin;
    max += margin;
    if (metric === "score") { min = Math.max(0, min); max = Math.min(100, max); }
    const x = (year) => padding.left + ((year - rows[0].year) / Math.max(1, rows[rows.length - 1].year - rows[0].year)) * (width - padding.left - padding.right);
    const y = (value) => {
      const ratio = (value - min) / (max - min);
      return metric === "official_rank"
        ? padding.top + ratio * (height - padding.top - padding.bottom)
        : height - padding.bottom - ratio * (height - padding.top - padding.bottom);
    };
    const points = rows.map((item) => ({ ...item, x: x(item.year), y: y(item.value) }));
    const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) * index / 4));
    const grid = ticks.map((value) => {
      const yValue = y(value);
      return `<line x1="${padding.left}" y1="${yValue}" x2="${width - padding.right}" y2="${yValue}"></line><text x="${padding.left - 12}" y="${yValue + 3}" text-anchor="end">${formatNumber(value, metric === "score" ? 1 : 0)}</text>`;
    }).join("");
    const yearTicks = points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.max(1, Math.ceil(points.length / 6)) === 0).map((point) => `<text x="${point.x}" y="${height - 18}" text-anchor="middle">${point.year}</text>`).join("");
    const path = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    return { rows, width, height, padding, grid, yearTicks, path, points, metric };
  }

  function lineChart(series, metric) {
    const model = chartModel(series, metric);
    if (!model) return `<div class="spi-chart-empty">${escapeHtml(tr("noData"))}</div>`;
    const aria = metric === "score" ? tr("chartScoreLabel") : tr("chartRankLabel");
    return `<svg class="spi-line-chart" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-label="${escapeHtml(aria)}">
      <g class="spi-chart-grid">${model.grid}${model.yearTicks}</g>
      <path class="spi-chart-line ${metric === "official_rank" ? "is-rank" : ""}" d="${model.path}"></path>
      ${model.points.map((point) => `<g class="spi-chart-point ${Number(point.year) === Number(runtime.year) ? "is-current" : ""}"><circle cx="${point.x}" cy="${point.y}" r="${Number(point.year) === Number(runtime.year) ? 6 : 4}"></circle><title>${point.year}: ${formatNumber(point.value, metric === "score" ? 1 : 0)}</title></g>`).join("")}
    </svg>`;
  }

  function trendSummary(series) {
    const scoreRows = series.filter((item) => numeric(item.score) != null).sort((a, b) => Number(a.observation_year) - Number(b.observation_year));
    if (!scoreRows.length) return { first: null, latest: null, best: null, change: null };
    const first = scoreRows[0];
    const latest = scoreRows[scoreRows.length - 1];
    const best = [...scoreRows].sort((a, b) => numeric(b.score) - numeric(a.score))[0];
    return { first, latest, best, change: numeric(latest.score) - numeric(first.score) };
  }

  function trendPanel() {
    const series = Array.isArray(runtime.series?.items) ? runtime.series.items : [];
    const summary = trendSummary(series);
    return `<section id="spi-panel-${runtime.id}-trend" class="spi-view-panel" role="tabpanel" tabindex="0" aria-labelledby="spi-tab-${runtime.id}-trend" data-spi-panel="trend">
      ${sectionHeading("03 · " + tr("trend"), tr("trendHeading"), tr("trendText"))}
      <div class="spi-trend-summary">
        ${metricCard(tr("firstYear"), summary.first ? String(summary.first.observation_year) : "—", summary.first ? formatNumber(summary.first.score, 1) : "")}
        ${metricCard(tr("latestValue"), summary.latest ? formatNumber(summary.latest.score, 1) : "—", summary.latest ? String(summary.latest.observation_year) : "")}
        ${metricCard(tr("bestValue"), summary.best ? formatNumber(summary.best.score, 1) : "—", summary.best ? String(summary.best.observation_year) : "")}
        ${metricCard(tr("periodChange"), `${formatSigned(summary.change, 1)} ${escapeHtml(tr("points"))}`, `${tr("observations")}: ${formatInteger(series.length)}`, { derived: true, tone: summary.change > 0 ? "positive" : summary.change < 0 ? "negative" : "neutral" })}
      </div>
      <div class="spi-trend-grid">
        <article class="spi-panel"><header class="spi-panel-head"><div><span>${escapeHtml(tr("score"))}</span><h3>${escapeHtml(tr("scoreTrend"))}</h3></div><p>${escapeHtml(tr("officialLabel"))}</p></header><div class="spi-chart-frame">${lineChart(series, "score")}</div></article>
        <article class="spi-panel"><header class="spi-panel-head"><div><span>${escapeHtml(tr("officialRank"))}</span><h3>${escapeHtml(tr("rankTrend"))}</h3></div><p>${escapeHtml(runtime.lang === "ru" ? "Меньшее место означает более высокую позицию" : "A lower rank means a higher position")}</p></header><div class="spi-chart-frame">${lineChart(series, "official_rank")}</div></article>
      </div>
      <details class="spi-accessible-data"><summary>${escapeHtml(tr("accessibleTable"))}</summary>${seriesTable(series)}</details>
    </section>`;
  }

  function seriesTable(series) {
    return `<div class="spi-table-wrap" tabindex="0"><table class="spi-table"><caption>${escapeHtml(tr("trendHeading"))}: ${escapeHtml(countryName(selectedRankingItem()))}</caption><thead><tr><th scope="col">${escapeHtml(tr("observationYear"))}</th><th scope="col">${escapeHtml(tr("score"))}</th><th scope="col">${escapeHtml(tr("officialRank"))}</th><th scope="col">${escapeHtml(tr("release"))}</th><th scope="col">${escapeHtml(tr("sourceTier"))}</th></tr></thead><tbody>${series.map((item) => `<tr><td>${escapeHtml(item.observation_year)}</td><td>${formatNumber(item.score, 1)}</td><td>${numeric(item.official_rank) != null ? `#${formatInteger(item.official_rank)}` : "—"}</td><td>${escapeHtml(item.edition_name || item.release_year || item.release_id || "—")}</td><td>${escapeHtml(item.tier || "—")}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function rankingFilters() {
    const items = runtime.ranking?.items || [];
    const regions = [...new Set(items.map((item) => item.region).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), runtime.lang));
    const incomes = [...new Set(items.map((item) => item.income_group).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), runtime.lang));
    return `<div class="spi-ranking-tools">
      <label class="spi-field spi-search-field"><span>${escapeHtml(tr("search"))}</span><input type="search" value="${escapeHtml(runtime.rankingQuery)}" data-spi-ranking-query autocomplete="off" placeholder="${escapeHtml(runtime.lang === "ru" ? "Например: Россия или RUS" : "For example: Canada or CAN")}"></label>
      <label class="spi-field"><span>${escapeHtml(tr("region"))}</span><select data-spi-ranking-region><option value="">${escapeHtml(tr("allRegions"))}</option>${regions.map((value) => `<option value="${escapeHtml(value)}" ${runtime.rankingRegion === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
      <label class="spi-field"><span>${escapeHtml(tr("income"))}</span><select data-spi-ranking-income><option value="">${escapeHtml(tr("allIncome"))}</option>${incomes.map((value) => `<option value="${escapeHtml(value)}" ${runtime.rankingIncome === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
      <label class="spi-field"><span>${escapeHtml(tr("sort"))}</span><select data-spi-ranking-sort><option value="rank" ${runtime.rankingSort === "rank" ? "selected" : ""}>${escapeHtml(tr("sortRank"))}</option><option value="score" ${runtime.rankingSort === "score" ? "selected" : ""}>${escapeHtml(tr("sortScore"))}</option><option value="country" ${runtime.rankingSort === "country" ? "selected" : ""}>${escapeHtml(tr("sortCountry"))}</option></select></label>
      <label class="spi-field spi-page-size"><span>${escapeHtml(tr("rowsPerPage"))}</span><select data-spi-ranking-size>${[25, 50, 100].map((value) => `<option value="${value}" ${runtime.rankingPageSize === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    </div>`;
  }

  function filteredRanking() {
    const query = runtime.rankingQuery.trim().toLocaleLowerCase(runtime.lang === "ru" ? "ru" : "en");
    const items = (runtime.ranking?.items || []).filter((item) => {
      const queryMatch = !query || `${countryName(item)} ${item.country_name_source || ""} ${item.iso3}`.toLocaleLowerCase(runtime.lang === "ru" ? "ru" : "en").includes(query);
      return queryMatch && (!runtime.rankingRegion || item.region === runtime.rankingRegion) && (!runtime.rankingIncome || item.income_group === runtime.rankingIncome);
    });
    return items.sort((a, b) => {
      if (runtime.rankingSort === "score") return (numeric(b.score) ?? -Infinity) - (numeric(a.score) ?? -Infinity) || countryName(a).localeCompare(countryName(b), runtime.lang);
      if (runtime.rankingSort === "country") return countryName(a).localeCompare(countryName(b), runtime.lang);
      const rankA = numeric(a.official_rank) ?? Infinity;
      const rankB = numeric(b.official_rank) ?? Infinity;
      return rankA - rankB || (numeric(b.score) ?? -Infinity) - (numeric(a.score) ?? -Infinity);
    });
  }

  function rankingTable() {
    const rows = filteredRanking();
    const pageCount = Math.max(1, Math.ceil(rows.length / runtime.rankingPageSize));
    runtime.rankingPage = Math.max(1, Math.min(runtime.rankingPage, pageCount));
    const start = (runtime.rankingPage - 1) * runtime.rankingPageSize;
    const pageRows = rows.slice(start, start + runtime.rankingPageSize);
    const shownFrom = rows.length ? start + 1 : 0;
    const shownTo = Math.min(rows.length, start + pageRows.length);
    return `<div class="spi-ranking-table-shell">
      <div class="spi-ranking-meta" aria-live="polite"><span>${escapeHtml(tr("showing"))} <strong>${formatInteger(shownFrom)}–${formatInteger(shownTo)}</strong> ${escapeHtml(tr("of"))} <strong>${formatInteger(rows.length)}</strong></span><span>${escapeHtml(tr("page"))} ${formatInteger(runtime.rankingPage)} / ${formatInteger(pageCount)}</span></div>
      <div class="spi-table-wrap" tabindex="0"><table class="spi-table spi-ranking-table"><caption>${escapeHtml(tr("rankingHeading"))}, ${escapeHtml(runtime.year)}</caption><thead><tr><th scope="col">${escapeHtml(tr("rank"))}</th><th scope="col">${escapeHtml(tr("country"))}</th><th scope="col">${escapeHtml(tr("score"))}</th><th scope="col">${escapeHtml(tr("tier"))}</th><th scope="col">${escapeHtml(tr("region"))}</th><th scope="col">${escapeHtml(tr("income"))}</th><th scope="col">${escapeHtml(tr("qualityFlag"))}</th></tr></thead><tbody>
        ${pageRows.length ? pageRows.map((item) => `<tr class="${item.iso3 === runtime.iso3 ? "is-selected" : ""}"><td><strong>${numeric(item.official_rank) != null ? `#${formatInteger(item.official_rank)}` : "—"}</strong></td><td><button type="button" class="spi-country-button" data-spi-country-pick="${escapeHtml(item.iso3)}" aria-label="${escapeHtml(`${tr("openProfile")}: ${countryName(item)}`)}">${sourceFlag(item, "spi-table-flag")}<span><strong>${escapeHtml(countryName(item))}</strong><small>${escapeHtml(item.iso3)}</small></span></button></td><td><strong>${formatNumber(item.score, 1)}</strong><small>/100</small></td><td>${escapeHtml(item.tier || "—")}</td><td>${escapeHtml(item.region || "—")}</td><td>${escapeHtml(item.income_group || "—")}</td><td><span class="spi-quality-chip">${escapeHtml(item.quality_flag || "—")}</span></td></tr>`).join("") : `<tr><td colspan="7" class="spi-no-matches">${escapeHtml(tr("noMatches"))}</td></tr>`}
      </tbody></table></div>
      <div class="spi-pagination"><button type="button" class="spi-button spi-button-secondary" data-spi-page="previous" ${runtime.rankingPage <= 1 ? "disabled" : ""}>← ${escapeHtml(tr("previous"))}</button><span>${escapeHtml(tr("page"))} ${formatInteger(runtime.rankingPage)} / ${formatInteger(pageCount)}</span><button type="button" class="spi-button spi-button-secondary" data-spi-page="next" ${runtime.rankingPage >= pageCount ? "disabled" : ""}>${escapeHtml(tr("next"))} →</button></div>
    </div>`;
  }

  function rankingPanel() {
    return `<section id="spi-panel-${runtime.id}-ranking" class="spi-view-panel" role="tabpanel" tabindex="0" aria-labelledby="spi-tab-${runtime.id}-ranking" data-spi-panel="ranking">
      ${sectionHeading("04 · " + tr("ranking"), tr("rankingHeading"), tr("rankingText"))}
      <article class="spi-panel spi-ranking-panel">${rankingFilters()}${rankingTable()}</article>
    </section>`;
  }

  function auditModel() {
    const releaseId = runtime.ranking?.release_id;
    const item = (runtime.audit?.items || []).find((entry) => !releaseId || entry.release_id === releaseId) || (runtime.audit?.items || [])[0] || null;
    return item;
  }

  function dataFootprint() {
    const years = runtime.years.map((item) => Number(item.observation_year)).filter(Number.isFinite).sort((a, b) => a - b);
    return {
      countries: runtime.ranking?.total ?? runtime.ranking?.items?.length ?? 0,
      years: years.length,
      first: years[0] ?? null,
      last: years[years.length - 1] ?? null,
      dimensions: runtime.metadata?.framework?.dimension_count ?? 3,
      components: runtime.metadata?.framework?.component_count ?? 12,
    };
  }

  function methodologyPanel() {
    const index = runtime.metadata?.index || {};
    const release = runtime.ranking?.release || runtime.releases.find((item) => item.release_id === runtime.ranking?.release_id) || {};
    const audit = auditModel();
    const footprint = dataFootprint();
    const source = safeUrl(index.official_source_url || release.source_url);
    const method = safeUrl(index.methodology_url || release.methodology_url);
    const auditOk = Boolean(runtime.audit?.ok && audit?.snapshot_exists && audit?.snapshot_hash_ok && !numeric(audit?.stored_errors));
    const hash = release.raw_snapshot_sha256 || audit?.raw_snapshot_sha256 || "";
    return `<section id="spi-panel-${runtime.id}-methodology" class="spi-view-panel" role="tabpanel" tabindex="0" aria-labelledby="spi-tab-${runtime.id}-methodology" data-spi-panel="methodology">
      ${sectionHeading("05 · " + tr("methodologyTab"), tr("methodologyHeading"), tr("methodologyText"))}
      <div class="spi-method-grid">
        <article class="spi-method-card spi-method-primary"><span>${escapeHtml(tr("indexPrinciple"))}</span><h3>${escapeHtml(tr("indexName"))}</h3><p>${escapeHtml(tr("indexPrincipleText"))}</p><dl><div><dt>${escapeHtml(tr("scale"))}</dt><dd>0–100</dd></div><div><dt>${escapeHtml(tr("direction"))}</dt><dd>${escapeHtml(tr("higherBetter"))}</dd></div><div><dt>${escapeHtml(tr("publisher"))}</dt><dd>${escapeHtml(index.publisher || "Social Progress Imperative")}</dd></div><div><dt>${escapeHtml(tr("valuesStatus"))}</dt><dd>${escapeHtml(tr("importedOfficial"))}</dd></div></dl><div class="spi-link-row">${source ? `<a class="spi-text-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("officialSource"))}<span aria-hidden="true">↗</span></a>` : ""}${method ? `<a class="spi-text-link" href="${escapeHtml(method)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("methodology"))}<span aria-hidden="true">↗</span></a>` : ""}</div></article>
        <article class="spi-method-card"><span>${escapeHtml(tr("dataFootprint"))}</span><h3>${formatInteger(footprint.countries)} · ${escapeHtml(tr("countriesCovered"))}</h3><div class="spi-footprint-grid"><div><strong>${formatInteger(footprint.years)}</strong><span>${escapeHtml(tr("yearsCovered"))}</span><small>${footprint.first ?? "—"}–${footprint.last ?? "—"}</small></div><div><strong>${formatInteger(footprint.dimensions)}</strong><span>${escapeHtml(tr("dimensions"))}</span></div><div><strong>${formatInteger(footprint.components)}</strong><span>${escapeHtml(tr("components"))}</span></div><div><strong>${escapeHtml(runtime.year)}</strong><span>${escapeHtml(tr("current"))}</span></div></div></article>
        <article class="spi-method-card"><span>${escapeHtml(tr("releaseDetails"))}</span><h3>${escapeHtml(release.edition_name || release.release_year || runtime.ranking?.release_id || "—")}</h3><dl class="spi-source-list"><div><dt>${escapeHtml(tr("releaseId"))}</dt><dd>${escapeHtml(runtime.ranking?.release_id || release.release_id || "—")}</dd></div><div><dt>${escapeHtml(tr("releaseYear"))}</dt><dd>${escapeHtml(release.release_year || "—")}</dd></div><div><dt>${escapeHtml(tr("retrievedAt"))}</dt><dd>${escapeHtml(formatDate(release.retrieved_at))}</dd></div><div><dt>${escapeHtml(tr("snapshotHash"))}</dt><dd><code title="${escapeHtml(hash)}">${escapeHtml(hash ? `${hash.slice(0, 20)}…${hash.slice(-8)}` : "—")}</code></dd></div><div><dt>${escapeHtml(tr("transform"))}</dt><dd><code>${escapeHtml([release.transform_id, release.transform_version].filter(Boolean).join(" · ") || "—")}</code></dd></div></dl></article>
        <article class="spi-method-card spi-audit-card ${auditOk ? "is-ok" : "is-warning"}"><span>${escapeHtml(tr("audit"))}</span><h3>${escapeHtml(auditOk ? tr("auditPassed") : tr("auditAttention"))}</h3><ul><li><i aria-hidden="true">${audit?.snapshot_exists ? "✓" : "!"}</i><span>${escapeHtml(tr("snapshotPresent"))}</span><strong>${audit?.snapshot_exists ? "OK" : "—"}</strong></li><li><i aria-hidden="true">${audit?.snapshot_hash_ok ? "✓" : "!"}</i><span>${escapeHtml(tr("hashMatches"))}</span><strong>${audit?.snapshot_hash_ok ? "OK" : "—"}</strong></li><li><i aria-hidden="true">${!numeric(audit?.stored_errors) ? "✓" : "!"}</i><span>${escapeHtml(tr("storedErrors"))}</span><strong>${formatInteger(audit?.stored_errors || 0)}</strong></li></ul><button type="button" class="spi-evidence-link" data-spi-action="provenance">${escapeHtml(tr("evidence"))}<span aria-hidden="true">→</span></button></article>
      </div>
      <aside class="spi-method-notice"><span aria-hidden="true">i</span><p>${escapeHtml(tr("methodologyNotice"))}</p></aside>
      <details class="spi-technical-contract"><summary>${escapeHtml(tr("technicalContract"))}</summary><pre><code>${escapeHtml(JSON.stringify({ module_version: MODULE_VERSION, api_version: runtime.metadata?.api_version, index_code: runtime.metadata?.index_code, rank_semantics: runtime.ranking?.rank_semantics, data_policy: runtime.metadata?.data_policy }, null, 2))}</code></pre></details>
    </section>`;
  }

  function activePanel() {
    if (runtime.view === "framework") return frameworkPanel();
    if (runtime.view === "trend") return trendPanel();
    if (runtime.view === "ranking") return rankingPanel();
    if (runtime.view === "methodology") return methodologyPanel();
    return overviewPanel();
  }

  function inactivePanelPlaceholders() {
    return VIEW_KEYS
      .filter((key) => key !== runtime.view)
      .map((key) => `<section id="spi-panel-${runtime.id}-${key}" role="tabpanel" aria-labelledby="spi-tab-${runtime.id}-${key}" hidden></section>`)
      .join("");
  }

  function viewStageMarkup() {
    return `${activePanel()}${inactivePanelPlaceholders()}`;
  }

  function renderAvailable() {
    if (!runtime.root) return;
    setDocumentMeta();
    runtime.root.innerHTML = `
      <article class="spi-workspace" data-spi-workspace data-version="${MODULE_VERSION}" data-spi-theme="${escapeHtml(runtime.theme)}">
        ${hero()}
        ${controlBar()}
        ${tabs()}
        <div class="spi-view-stage">${viewStageMarkup()}</div>
        <footer class="spi-workspace-footer"><span>${escapeHtml(tr("officialData"))}</span><span>${escapeHtml(runtime.ranking?.rank_semantics || tr("notRecomputed"))}</span><span>${escapeHtml(`GIR · ${MODULE_VERSION}`)}</span></footer>
        <p class="spi-sr-only" aria-live="polite" aria-atomic="true" data-spi-live></p>
      </article>`;
    bindEvents();
  }

  function provenanceRows() {
    const country = runtime.profile?.country || selectedRankingItem() || {};
    const provenance = country.provenance || {};
    const release = runtime.ranking?.release || {};
    const rows = [
      [tr("country"), `${countryName(selectedRankingItem())} (${runtime.iso3})`],
      [tr("countrySourceName"), country.country_name_source],
      [tr("observationYear"), country.observation_year || runtime.year],
      [tr("score"), numeric(country.score) != null ? formatNumber(country.score, 6) : null],
      [tr("officialRank"), country.official_rank],
      [tr("releaseId"), country.release_id || runtime.ranking?.release_id],
      [tr("releaseYear"), country.release_year || release.release_year],
      [tr("retrievedAt"), country.retrieved_at || release.retrieved_at],
      [tr("sourceUrl"), country.source_url || release.source_url],
      [tr("methodologyUrl"), country.methodology_url || release.methodology_url],
      [tr("transformationId"), country.transform_id || release.transform_id],
      [tr("transformationVersion"), country.transform_version || release.transform_version],
      [tr("rawSnapshot"), country.raw_snapshot_sha256 || release.raw_snapshot_sha256],
      [tr("rawRow"), provenance.source_row ?? provenance.row_number ?? provenance.raw_row],
      [tr("qualityFlag"), country.quality_flag],
    ];
    return rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  function provenanceHtml() {
    const rows = provenanceRows();
    const country = runtime.profile?.country || {};
    const provenance = country.provenance || {};
    return `<div class="spi-provenance"><dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>${Object.keys(provenance).length ? `<details><summary>${escapeHtml(runtime.lang === "ru" ? "Машиночитаемый provenance" : "Machine-readable provenance")}</summary><pre>${escapeHtml(JSON.stringify(provenance, null, 2))}</pre></details>` : ""}</div>`;
  }

  function openProvenance(trigger) {
    if (typeof runtime.context.openDrawer === "function") {
      runtime.context.openDrawer(provenanceHtml(), {
        title: tr("provenanceTitle"),
        kicker: tr("provenanceKicker"),
        trigger,
      });
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.className = "spi-dialog";
    dialog.innerHTML = `<div class="spi-dialog-head"><h2>${escapeHtml(tr("provenanceTitle"))}</h2><button type="button" data-spi-dialog-close>${escapeHtml(tr("close"))}</button></div>${provenanceHtml()}`;
    document.body.append(dialog);
    dialog.querySelector("[data-spi-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("close", () => { dialog.remove(); trigger?.focus?.(); }, { once: true });
    dialog.showModal();
    dialog.querySelector("[data-spi-dialog-close]").focus();
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function exportRanking() {
    const rows = filteredRanking();
    const headers = ["observation_year", "official_rank", "iso3", "country", "score", "tier", "region", "income_group", "quality_flag", "release_id"];
    const body = rows.map((item) => [runtime.year, item.official_rank ?? "", item.iso3, countryName(item), item.score ?? "", item.tier ?? "", item.region ?? "", item.income_group ?? "", item.quality_flag ?? "", runtime.ranking?.release_id ?? ""]);
    const csv = "\uFEFF" + [headers, ...body].map((row) => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tr("downloadName")}-${runtime.year}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function shareProfile() {
    updateDeepLink({ notifyHost: false });
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify(tr("copied"));
    } catch (_) {
      const input = document.createElement("textarea");
      input.value = window.location.href;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      notify(tr("copied"));
    }
  }

  function setView(view, { focusPanel = false, focusTab = false } = {}) {
    if (!VIEW_KEYS.includes(view)) return;
    const changed = view !== runtime.view;
    if (changed) {
      runtime.view = view;
      updateDeepLink({ notifyHost: true });
      renderAvailable();
    }
    if (focusPanel || focusTab) {
      window.requestAnimationFrame(() => {
        const selector = focusTab ? `[data-spi-view="${view}"]` : `[data-spi-panel="${view}"]`;
        runtime.root?.querySelector(selector)?.focus({ preventScroll: focusTab });
      });
    }
  }

  function rerenderRanking({ keepFocus = true } = {}) {
    const active = document.activeElement;
    const selector = active?.matches?.("[data-spi-ranking-query]") ? "[data-spi-ranking-query]" : null;
    const cursor = selector ? active.selectionStart : null;
    runtime.rankingPage = Math.max(1, runtime.rankingPage);
    const stage = runtime.root?.querySelector(".spi-view-stage");
    if (stage) stage.innerHTML = viewStageMarkup();
    bindEvents();
    if (keepFocus && selector) {
      const replacement = runtime.root?.querySelector(selector);
      replacement?.focus({ preventScroll: true });
      if (cursor != null) replacement?.setSelectionRange?.(cursor, cursor);
    }
  }

  function handleTabKeydown(event) {
    const current = event.target.closest("[data-spi-view]");
    if (!current) return;
    const tabs = [...runtime.root.querySelectorAll("[data-spi-view]")];
    const index = tabs.indexOf(current);
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex == null) return;
    event.preventDefault();
    setView(tabs[nextIndex].dataset.spiView, { focusTab: true });
  }

  function bindEvents() {
    const root = runtime.root;
    if (!root) return;
    root.querySelectorAll("[data-spi-action=retry]").forEach((button) => { button.onclick = () => loadWorkspace(); });
    root.querySelectorAll("[data-spi-country]").forEach((select) => { select.onchange = (event) => changeCountry(event.target.value); });
    root.querySelectorAll("[data-spi-year]").forEach((select) => { select.onchange = (event) => changeYear(event.target.value); });
    root.querySelectorAll("[data-spi-view]").forEach((button) => {
      button.onclick = () => setView(button.dataset.spiView, { focusTab: true });
      button.onkeydown = handleTabKeydown;
    });
    root.querySelectorAll("[data-spi-action=provenance]").forEach((button) => { button.onclick = () => openProvenance(button); });
    root.querySelectorAll("[data-spi-action=share]").forEach((button) => { button.onclick = shareProfile; });
    root.querySelectorAll("[data-spi-action=export]").forEach((button) => { button.onclick = exportRanking; });
    root.querySelectorAll("[data-spi-country-pick]").forEach((button) => { button.onclick = () => changeCountry(button.dataset.spiCountryPick, { focusView: false }); });
    root.querySelectorAll("[data-spi-map-iso][data-has-value=true]").forEach((path) => {
      // The SVG map is a compact visual exploration surface. Keyboard users
      // receive the same country action through the native selector and
      // ranking buttons, so map paths are deliberately not exposed as faux
      // buttons without a complete SVG keyboard interaction model.
      path.style.cursor = "pointer";
      path.onclick = () => changeCountry(path.dataset.spiMapIso);
    });
    const search = root.querySelector("[data-spi-ranking-query]");
    if (search) search.oninput = (event) => { runtime.rankingQuery = event.target.value; runtime.rankingPage = 1; rerenderRanking(); };
    root.querySelectorAll("[data-spi-ranking-region]").forEach((select) => { select.onchange = (event) => { runtime.rankingRegion = event.target.value; runtime.rankingPage = 1; rerenderRanking({ keepFocus: false }); }; });
    root.querySelectorAll("[data-spi-ranking-income]").forEach((select) => { select.onchange = (event) => { runtime.rankingIncome = event.target.value; runtime.rankingPage = 1; rerenderRanking({ keepFocus: false }); }; });
    root.querySelectorAll("[data-spi-ranking-sort]").forEach((select) => { select.onchange = (event) => { runtime.rankingSort = event.target.value; runtime.rankingPage = 1; rerenderRanking({ keepFocus: false }); }; });
    root.querySelectorAll("[data-spi-ranking-size]").forEach((select) => { select.onchange = (event) => { runtime.rankingPageSize = Number(event.target.value) || 25; runtime.rankingPage = 1; rerenderRanking({ keepFocus: false }); }; });
    root.querySelectorAll("[data-spi-page]").forEach((button) => { button.onclick = () => { runtime.rankingPage += button.dataset.spiPage === "next" ? 1 : -1; rerenderRanking({ keepFocus: false }); runtime.root.querySelector(".spi-ranking-meta")?.scrollIntoView({ block: "nearest" }); }; });
    root.querySelectorAll("img").forEach((image) => { image.onerror = () => image.closest(".spi-flag-slot, .spi-control-flag, .spi-hero-flag, .spi-profile-flag, .spi-mini-flag, .spi-table-flag")?.classList.add("is-fallback"); });
  }

  function render(context = {}) {
    const root = context.root instanceof Element ? context.root : document.querySelector(context.root || "#view");
    if (!root) throw new Error("GIRSocialProgress.render: root element was not found");
    runtime.abortController?.abort();
    runtime.id = ++instanceCounter;
    runtime.root = root;
    runtime.context = context;
    runtime.lang = context.lang === "en" ? "en" : "ru";
    runtime.theme = context.theme === "light" ? "light" : "dark";
    const deepLink = readDeepLink(context);
    if (!deepLink.iso3) return;
    runtime.view = deepLink.view;
    runtime.year = deepLink.year;
    runtime.iso3 = deepLink.iso3;
    setDocumentMeta();
    return loadWorkspace();
  }

  function invalidate({ hard = false } = {}) {
    runtime.abortController?.abort();
    if (hard) apiCache.clear();
    runtime.status = null;
    runtime.ranking = null;
    runtime.profile = null;
    runtime.series = null;
  }

  window.GIRSocialProgress = Object.freeze({
    version: MODULE_VERSION,
    render,
    invalidate,
    endpoints: API,
    _test: Object.freeze({
      median,
      scoreTone,
      featureIso,
      geometryPath,
      frameworkTree,
      numeric,
      escapeHtml,
    }),
  });
})();
