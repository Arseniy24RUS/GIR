(() => {
  "use strict";

  const API = "/api/environment/nd-gain";
  const STATIC_CORE = "/static/nd-gain/nd-gain-core.json";
  const STATIC_MANIFEST = "/static/nd-gain/manifest.json";
  const GEO_SOURCES = ["/static/epi-world.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
  const DEFAULT_YEAR = 2021;
  const METRIC_CODES = ["GAIN", "READINESS", "VULNERABILITY"];
  const QUADRANTS = [
    "LOW_VULNERABILITY_HIGH_READINESS",
    "HIGH_VULNERABILITY_HIGH_READINESS",
    "LOW_VULNERABILITY_LOW_READINESS",
    "HIGH_VULNERABILITY_LOW_READINESS",
  ];

  const COPY = {
    ru: {
      loadingTitle: "Собираем климатический профиль мира",
      loadingText: "Проверяем 4 995 наблюдений, ранги GIR и разделение выпусков ND‑GAIN.",
      errorTitle: "Рабочее пространство ND‑GAIN временно недоступно",
      retry: "Повторить",
      kicker: "Экология и устойчивость · климатическая адаптация",
      title: "ND‑GAIN Country Index",
      lead: "Глобальная аналитика климатической уязвимости и способности стран превращать инвестиции в адаптационные действия.",
      archiveBadge: "Встроенная панель 1995–2021",
      releaseBadge: "Официальный выпуск 2026 · данные по 2024",
      sourceBadge: "University of Notre Dame",
      verifiedBadge: "целостность проверена",
      country: "Страна",
      year: "Год панели",
      metric: "Метрика",
      searchCountry: "Поиск страны или ISO3",
      copyLink: "Копировать ссылку",
      copied: "Ссылка на профиль скопирована",
      evidence: "Паспорт данных",
      apiMode: "FastAPI · проверенный snapshot",
      staticMode: "Проверенная статическая копия",
      score: "ND‑GAIN",
      globalRank: "Место в мире",
      regionalRank: "Место в регионе",
      readiness: "Готовность",
      vulnerability: "Уязвимость",
      changeYear: "Изменение за год",
      changePeriod: "Изменение с 1995",
      lowerBetter: "меньше — лучше",
      higherBetter: "больше — лучше",
      derivedRank: "место рассчитано GIR",
      selectedYear: "Выбранный год",
      archiveNotice: "В интерфейсе активна отдельно идентифицированная архивная панель. Официальный выпуск 2026 не подмешан в ряд.",
      jumpPosition: "Позиция",
      jumpMatrix: "Матрица",
      jumpMap: "Карта",
      jumpTrend: "Динамика",
      jumpRanking: "Рейтинг",
      jumpMethod: "Методика",
      signalsKicker: "01 · Позиция страны",
      signalsTitle: "Баланс климатического риска и готовности",
      signalsText: "Итоговый балл растёт, когда готовность усиливается, а уязвимость снижается. Все места и процентили в этой панели являются производными расчётами GIR.",
      balance: "Адаптационный баланс",
      readinessGap: "Отрыв готовности от медианы",
      vulnerabilityGap: "Отклонение уязвимости от медианы",
      quadrant: "Квадрант матрицы",
      trajectory: "Траектория 1995 → выбранный год",
      matrixKicker: "02 · Инвестиционная матрица",
      matrixTitle: "Готовность × уязвимость",
      matrixText: "Каждая точка — страна. Справа выше готовность, сверху ниже уязвимость. Линии показывают медианные пороги всей встроенной панели.",
      matrixLegend: "185 стран · выбранная страна выделена",
      readinessAxis: "Готовность к адаптационным инвестициям →",
      vulnerabilityAxis: "← ниже уязвимость",
      qBest: "Низкая уязвимость / высокая готовность",
      qReadyRisk: "Высокая уязвимость / высокая готовность",
      qStableGap: "Низкая уязвимость / низкая готовность",
      qPriority: "Высокая уязвимость / низкая готовность",
      qBestShort: "Устойчивый фронтир",
      qReadyRiskShort: "Готовы, но уязвимы",
      qStableGapShort: "Низкий риск, слабая готовность",
      qPriorityShort: "Приоритет адаптации",
      countries: "стран",
      mapKicker: "03 · География",
      mapTitle: "Мировая карта адаптационной позиции",
      mapText: "Переключайте итоговый индекс, готовность и уязвимость. Для уязвимости шкала развёрнута: более тёмный класс означает лучший результат.",
      mapMetric: "Показатель карты",
      mappedCountries: "Стран на карте",
      mapTable: "Табличный эквивалент карты",
      low: "ниже",
      high: "выше",
      noData: "нет геометрии",
      trendKicker: "04 · Динамика",
      trendTitle: "Сравнение траекторий",
      trendText: "Сопоставьте до четырёх стран на единой шкале. Значения выпусков не соединяются с официальной редакцией 2026.",
      compareMetric: "Метрика графика",
      addCountry: "Добавить страну",
      add: "Добавить",
      remove: "Убрать",
      startValue: "1995",
      endValue: "2021",
      periodChange: "Изменение",
      rankingKicker: "05 · Сопоставление",
      rankingTitle: "Полный страновой рейтинг",
      rankingText: "Поиск, региональные фильтры, разные направления ранжирования, пагинация и CSV‑экспорт.",
      region: "Регион",
      allRegions: "Все регионы",
      search: "Поиск",
      rows: "Строк",
      exportCsv: "Экспорт CSV",
      place: "Место",
      countryColumn: "Страна",
      scoreColumn: "Значение",
      changeColumn: "Изменение за год",
      hdi: "ИЧР",
      action: "Действие",
      open: "Открыть",
      noRows: "По выбранным фильтрам ничего не найдено.",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      records: "записей",
      rankingNote: "Исходная панель содержит значения, но не официальные места. Competition ranking и процентили рассчитаны GIR внутри каждого года; ничьи сохраняются.",
      methodKicker: "06 · Методика и происхождение",
      methodTitle: "Две оси, 45 индикаторов и прозрачная граница выпусков",
      methodText: "Уязвимость включает 36 индикаторов в шести жизненно важных секторах. Готовность включает девять индикаторов экономической, управленческой и социальной среды.",
      formulaTitle: "Формула headline‑индекса",
      formula: "(Готовность − Уязвимость + 1) × 50",
      vulnerabilityTitle: "Уязвимость",
      vulnerabilityText: "Экспозиция, чувствительность и адаптивная способность в продовольствии, воде, здоровье, экосистемах, среде обитания и инфраструктуре.",
      readinessTitle: "Готовность",
      readinessText: "Экономические, управленческие и социальные условия, позволяющие привлекать и реализовывать адаптационные инвестиции.",
      separationTitle: "Выпуски не сшиты",
      separationText: "В редакции 2026 изменён источник экономической готовности на World Bank B‑READY. Поэтому официальный выпуск хранится отдельно от встроенного ряда 1995–2021.",
      licenseTitle: "Открытая лицензия",
      licenseText: "ND‑GAIN распространяется по CC BY 3.0; требуется атрибуция University of Notre Dame.",
      officialLinks: "Официальные материалы",
      methodology: "Методика ND‑GAIN",
      downloadData: "Загрузка данных",
      technicalReport: "Технический отчёт",
      evidenceKicker: "ND‑GAIN · PROVENANCE",
      evidenceTitle: "Паспорт данных и выпусков",
      close: "Закрыть",
      activeDataset: "Активный набор",
      activeCoverage: "Активное покрытие",
      currentRelease: "Текущий официальный выпуск",
      releaseDate: "Дата выпуска",
      latestOfficialYear: "Последний официальный год данных",
      checksums: "Контрольные суммы",
      validated: "Контракт данных",
      interpolation: "Интерполяция GIR",
      zeroFill: "Замена пропусков нулём",
      officialRanks: "Официальные места",
      derivedRanks: "Производные места GIR",
      merged: "Смешение выпусков",
      rawFiles: "Исходные файлы",
      derivedFiles: "Производные файлы",
      fingerprint: "SHA‑256 набора",
      copy: "Копировать",
      copiedHash: "SHA‑256 скопирован",
      yes: "да",
      no: "нет",
      none: "не выполнялась",
      rankDerived: "нет · рассчитаны GIR",
      notMerged: "нет · хранятся раздельно",
      metricGain: "ND‑GAIN",
      metricReadiness: "Готовность",
      metricVulnerability: "Уязвимость",
      sourceArchival: "Архивная headline‑панель",
      currentDescriptor: "Дескриптор официального выпуска 2026",
      staticVerified: "Статический fallback прошёл SHA‑256",
      allYearsMedian: "Медиана всей панели",
      selectedCountry: "Выбранная страна",
      worldMedian: "Медиана мира",
      regionalMean: "Среднее региона",
    },
    en: {
      loadingTitle: "Building the world's adaptation profile",
      loadingText: "Validating 4,995 observations, GIR-derived ranks and ND‑GAIN release separation.",
      errorTitle: "The ND‑GAIN workspace is temporarily unavailable",
      retry: "Retry",
      kicker: "Environment & sustainability · climate adaptation",
      title: "ND‑GAIN Country Index",
      lead: "Global analytics for climate vulnerability and countries' capacity to convert investment into adaptation action.",
      archiveBadge: "Embedded panel 1995–2021",
      releaseBadge: "Official 2026 release · data through 2024",
      sourceBadge: "University of Notre Dame",
      verifiedBadge: "integrity verified",
      country: "Country",
      year: "Panel year",
      metric: "Metric",
      searchCountry: "Search country or ISO3",
      copyLink: "Copy link",
      copied: "Profile link copied",
      evidence: "Data passport",
      apiMode: "FastAPI · verified snapshot",
      staticMode: "Verified static copy",
      score: "ND‑GAIN",
      globalRank: "Global rank",
      regionalRank: "Regional rank",
      readiness: "Readiness",
      vulnerability: "Vulnerability",
      changeYear: "One-year change",
      changePeriod: "Change since 1995",
      lowerBetter: "lower is better",
      higherBetter: "higher is better",
      derivedRank: "rank derived by GIR",
      selectedYear: "Selected year",
      archiveNotice: "The active interface uses a separately identified archival panel. The official 2026 release is not spliced into the series.",
      jumpPosition: "Position",
      jumpMatrix: "Matrix",
      jumpMap: "Map",
      jumpTrend: "Trends",
      jumpRanking: "Ranking",
      jumpMethod: "Method",
      signalsKicker: "01 · Country position",
      signalsTitle: "Balance of climate risk and readiness",
      signalsText: "The headline score rises as readiness improves and vulnerability falls. Every rank and percentile in this panel is a GIR-derived navigation layer.",
      balance: "Adaptation balance",
      readinessGap: "Readiness gap to median",
      vulnerabilityGap: "Vulnerability gap to median",
      quadrant: "Matrix quadrant",
      trajectory: "Trajectory 1995 → selected year",
      matrixKicker: "02 · Investment matrix",
      matrixTitle: "Readiness × vulnerability",
      matrixText: "Each point is a country. Readiness increases to the right; vulnerability improves upward. Lines use the all-panel median thresholds.",
      matrixLegend: "185 countries · selected country highlighted",
      readinessAxis: "Adaptation readiness →",
      vulnerabilityAxis: "← lower vulnerability",
      qBest: "Low vulnerability / high readiness",
      qReadyRisk: "High vulnerability / high readiness",
      qStableGap: "Low vulnerability / low readiness",
      qPriority: "High vulnerability / low readiness",
      qBestShort: "Resilient frontier",
      qReadyRiskShort: "Ready, yet vulnerable",
      qStableGapShort: "Lower risk, readiness gap",
      qPriorityShort: "Adaptation priority",
      countries: "countries",
      mapKicker: "03 · Geography",
      mapTitle: "World map of adaptation position",
      mapText: "Switch between the headline index, readiness and vulnerability. For vulnerability the scale is reversed: darker classes represent better outcomes.",
      mapMetric: "Map metric",
      mappedCountries: "Countries represented",
      mapTable: "Tabular map equivalent",
      low: "lower",
      high: "higher",
      noData: "no geometry",
      trendKicker: "04 · Trends",
      trendTitle: "Compare trajectories",
      trendText: "Compare up to four countries on one scale. The series is not extended with the official 2026 release.",
      compareMetric: "Chart metric",
      addCountry: "Add country",
      add: "Add",
      remove: "Remove",
      startValue: "1995",
      endValue: "2021",
      periodChange: "Change",
      rankingKicker: "05 · Comparison",
      rankingTitle: "Complete country ranking",
      rankingText: "Search, regional filters, metric-aware ranking direction, pagination and CSV export.",
      region: "Region",
      allRegions: "All regions",
      search: "Search",
      rows: "Rows",
      exportCsv: "Export CSV",
      place: "Rank",
      countryColumn: "Country",
      scoreColumn: "Value",
      changeColumn: "One-year change",
      hdi: "HDI",
      action: "Action",
      open: "Open",
      noRows: "No rows match the selected filters.",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      records: "records",
      rankingNote: "The source panel contains values but not official ranks. Competition ranks and percentiles are derived by GIR within each year; ties are preserved.",
      methodKicker: "06 · Method & provenance",
      methodTitle: "Two dimensions, 45 indicators and an explicit release boundary",
      methodText: "Vulnerability comprises 36 indicators across six life-supporting sectors. Readiness comprises nine indicators for economic, governance and social capacity.",
      formulaTitle: "Headline formula",
      formula: "(Readiness − Vulnerability + 1) × 50",
      vulnerabilityTitle: "Vulnerability",
      vulnerabilityText: "Exposure, sensitivity and adaptive capacity across food, water, health, ecosystems, human habitat and infrastructure.",
      readinessTitle: "Readiness",
      readinessText: "Economic, governance and social conditions that allow adaptation investment to be attracted and implemented.",
      separationTitle: "Releases are not spliced",
      separationText: "The 2026 edition changes the economic-readiness source to World Bank B‑READY. The official release therefore remains separate from the embedded 1995–2021 panel.",
      licenseTitle: "Open licence",
      licenseText: "ND‑GAIN is distributed under CC BY 3.0; attribution to the University of Notre Dame is required.",
      officialLinks: "Official materials",
      methodology: "ND‑GAIN methodology",
      downloadData: "Download data",
      technicalReport: "Technical report",
      evidenceKicker: "ND‑GAIN · PROVENANCE",
      evidenceTitle: "Data and release passport",
      close: "Close",
      activeDataset: "Active dataset",
      activeCoverage: "Active coverage",
      currentRelease: "Current official release",
      releaseDate: "Release date",
      latestOfficialYear: "Latest official data year",
      checksums: "Checksums",
      validated: "Data contract",
      interpolation: "GIR interpolation",
      zeroFill: "Missing values replaced with zero",
      officialRanks: "Official ranks",
      derivedRanks: "GIR-derived ranks",
      merged: "Release splicing",
      rawFiles: "Raw files",
      derivedFiles: "Derived files",
      fingerprint: "Dataset SHA‑256",
      copy: "Copy",
      copiedHash: "SHA‑256 copied",
      yes: "yes",
      no: "no",
      none: "not performed",
      rankDerived: "no · derived by GIR",
      notMerged: "no · provenance-separated",
      metricGain: "ND‑GAIN",
      metricReadiness: "Readiness",
      metricVulnerability: "Vulnerability",
      sourceArchival: "Archival headline panel",
      currentDescriptor: "Official 2026 release descriptor",
      staticVerified: "Static fallback passed SHA‑256",
      allYearsMedian: "All-panel median",
      selectedCountry: "Selected country",
      worldMedian: "World median",
      regionalMean: "Regional mean",
    },
  };

  const ISLAND_CENTROIDS = {
    ATG: [-61.8, 17.1], BHR: [50.55, 26.05], BRB: [-59.55, 13.18], COM: [43.33, -11.88],
    CPV: [-23.62, 15.1], DMA: [-61.36, 15.42], FSM: [158.2, 6.9], GRD: [-61.68, 12.12],
    KNA: [-62.78, 17.35], LCA: [-60.97, 13.9], MDV: [73.22, 3.2], MHL: [171.2, 7.1],
    MLT: [14.38, 35.94], MUS: [57.55, -20.25], NRU: [166.93, -0.52], PLW: [134.58, 7.5],
    SGP: [103.82, 1.35], STP: [6.72, 0.2], SYC: [55.45, -4.65], TON: [-175.2, -21.15],
    WSM: [-172.1, -13.75],
  };

  const cache = {
    basePromise: null,
    staticPromise: null,
    geoPromise: null,
    rankings: new Map(),
    profiles: new Map(),
    matrices: new Map(),
    trends: new Map(),
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    country: "",
    year: DEFAULT_YEAR,
    metric: "GAIN",
    mapMetric: "GAIN",
    trendMetric: "GAIN",
    rankingMetric: "GAIN",
    rankingRegion: "",
    rankingQuery: "",
    rankingSort: "rank",
    rankingOrder: "asc",
    page: 1,
    pageSize: 25,
    compare: ["RUS", "NOR", "CHN"],
    provider: null,
    providerMode: "api",
    base: null,
    profile: null,
    matrix: null,
    ranking: null,
    mapRanking: null,
    trends: null,
    geo: null,
    context: {},
    dialogReturn: null,
  };

  const tr = (key) => COPY[state.lang]?.[key] || COPY.ru[key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const num = (value) => value == null || value === "" || Number.isNaN(Number(value)) ? null : Number(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const locale = () => state.lang === "ru" ? "ru-RU" : "en-US";
  const fmt = (value, digits = 1) => num(value) == null ? "—" : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const fmtMetric = (value, metric = "GAIN") => fmt(value, metric === "GAIN" ? 1 : 3);
  const signed = (value, digits = 1) => num(value) == null ? "—" : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;
  const median = (values) => {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };
  const mean = (values) => {
    const data = values.map(Number).filter(Number.isFinite);
    return data.length ? data.reduce((sum, value) => sum + value, 0) / data.length : null;
  };
  const metricField = (metric) => ({ GAIN: "nd_gain_score", READINESS: "readiness", VULNERABILITY: "vulnerability" })[metric] || "nd_gain_score";
  const metricName = (metric) => tr({ GAIN: "metricGain", READINESS: "metricReadiness", VULNERABILITY: "metricVulnerability" }[metric] || "metricGain");
  const higherIsBetter = (metric) => metric !== "VULNERABILITY";
  const localName = (item) => state.lang === "ru" ? (item?.name_ru || item?.country_name_ru || item?.name_en || item?.iso3) : (item?.name_en || item?.country_name_en || item?.iso3);
  const localRegion = (item) => state.lang === "ru" ? (item?.region_ru || item?.region_en || "—") : (item?.region_en || "—");
  const metricDirectionText = (metric) => higherIsBetter(metric) ? tr("higherBetter") : tr("lowerBetter");

  function icon(name, className = "") {
    const paths = {
      shield: '<path d="M12 3 4.5 6v5.3c0 4.7 3.2 8.9 7.5 10.2 4.3-1.3 7.5-5.5 7.5-10.2V6L12 3Z"/><path d="m9 12 2 2 4-5"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
      matrix: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 3v18M3 12h18"/>',
      trend: '<path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/>',
      list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
      copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
    };
    return `<svg class="ndg-icon ${esc(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.shield}</svg>`;
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

  function metricPayload(core, code) {
    return (core.metrics?.metrics || []).find((item) => item.code === code) || { code, name_en: code, name_ru: code, higher_is_better: higherIsBetter(code), rank_is_derived: true };
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
        if (actual && manifest.core?.sha256 && actual !== manifest.core.sha256) throw new Error("ND-GAIN static asset checksum mismatch");
        const core = loaded.json;
        const countries = new Map((core.countries || []).map((item) => [item.iso3, item]));
        const observations = new Map();
        const byCountry = new Map();
        const byYear = new Map();
        (core.observations || []).forEach((row) => {
          const item = {
            iso3: row[0], year: Number(row[1]), hdi: row[2], readiness: Number(row[3]), vulnerability: Number(row[4]), nd_gain_raw: Number(row[5]), nd_gain_score: Number(row[6]),
          };
          observations.set(`${item.iso3}:${item.year}`, item);
          if (!byCountry.has(item.iso3)) byCountry.set(item.iso3, []);
          if (!byYear.has(item.year)) byYear.set(item.year, []);
          byCountry.get(item.iso3).push(item);
          byYear.get(item.year).push(item);
        });
        return { manifest, core, countries, observations, byCountry, byYear, rankingCache: new Map(), checksumVerified: !actual || actual === manifest.core.sha256 };
      }).catch((error) => { cache.staticPromise = null; throw error; });
    }
    return cache.staticPromise;
  }

  function competitionRanks(items, valueKey, higher) {
    const sorted = [...items].sort((a, b) => {
      const av = Number(a[valueKey]), bv = Number(b[valueKey]);
      return (higher ? bv - av : av - bv) || a.iso3.localeCompare(b.iso3);
    });
    const result = new Map();
    let previous = null;
    let rank = 0;
    sorted.forEach((item, index) => {
      const value = Number(item[valueKey]);
      if (previous == null || Math.abs(value - previous) > 1e-12) rank = index + 1;
      result.set(item.iso3, rank);
      previous = value;
    });
    return { sorted, ranks: result };
  }

  function staticRanking(store, year, metricCode) {
    const code = METRIC_CODES.includes(metricCode) ? metricCode : "GAIN";
    const selectedYear = Number(year || store.core.years?.default_year || DEFAULT_YEAR);
    const key = `${selectedYear}:${code}`;
    if (store.rankingCache.has(key)) return store.rankingCache.get(key);
    const field = metricField(code);
    const rows = store.byYear.get(selectedYear) || [];
    const ranked = competitionRanks(rows, field, higherIsBetter(code));
    const regionGroups = new Map();
    rows.forEach((item) => {
      const meta = store.countries.get(item.iso3);
      const region = meta?.region_en || "Other";
      if (!regionGroups.has(region)) regionGroups.set(region, []);
      regionGroups.get(region).push(item);
    });
    const regionRanks = new Map();
    regionGroups.forEach((items) => {
      const rr = competitionRanks(items, field, higherIsBetter(code)).ranks;
      rr.forEach((value, iso3) => regionRanks.set(iso3, value));
    });
    const total = ranked.sorted.length;
    const resultRows = ranked.sorted.map((item) => {
      const meta = store.countries.get(item.iso3) || { iso3: item.iso3 };
      const previous = store.observations.get(`${item.iso3}:${selectedYear - 1}`);
      const score = Number(item[field]);
      const previousScore = previous ? Number(previous[field]) : null;
      const change = previousScore == null ? null : score - previousScore;
      return {
        ...meta,
        year: selectedYear,
        metric: code,
        score,
        rank: ranked.ranks.get(item.iso3),
        region_rank: regionRanks.get(item.iso3),
        percentile: total <= 1 ? 100 : Number((((total - ranked.ranks.get(item.iso3)) / (total - 1)) * 100).toFixed(4)),
        hdi: item.hdi,
        previous_year_score: previousScore,
        change_1y: change,
        directional_change_1y: change == null ? null : (higherIsBetter(code) ? change : -change),
        readiness: item.readiness,
        vulnerability: item.vulnerability,
        nd_gain_raw: item.nd_gain_raw,
        nd_gain_score: item.nd_gain_score,
        rank_is_official: false,
        rank_is_derived: true,
        percentile_is_derived: true,
        source_release: store.core.overview?.release?.active_dataset_id || "ND_GAIN_ARCHIVAL_PANEL_1995_2021",
      };
    });
    const payload = {
      schema_version: "gir-nd-gain-backend-v1",
      index_code: "ND_GAIN",
      release: store.core.overview?.release,
      year: selectedYear,
      metric: metricPayload(store.core, code),
      pagination: { offset: 0, limit: resultRows.length, returned: resultRows.length, total: resultRows.length },
      ranking: resultRows,
    };
    store.rankingCache.set(key, payload);
    return payload;
  }

  function quadrant(readiness, vulnerability, thresholds) {
    const ready = readiness >= Number(thresholds.readiness);
    const lowVulnerability = vulnerability <= Number(thresholds.vulnerability);
    let code;
    if (ready && lowVulnerability) code = QUADRANTS[0];
    else if (ready) code = QUADRANTS[1];
    else if (lowVulnerability) code = QUADRANTS[2];
    else code = QUADRANTS[3];
    const key = { [QUADRANTS[0]]: "qBest", [QUADRANTS[1]]: "qReadyRisk", [QUADRANTS[2]]: "qStableGap", [QUADRANTS[3]]: "qPriority" }[code];
    return { code, name_en: COPY.en[key], name_ru: COPY.ru[key] };
  }

  function staticCountry(store, iso3) {
    const code = String(iso3 || "").toUpperCase();
    const meta = store.countries.get(code);
    if (!meta) throw new Error(`Unknown ND-GAIN country: ${code}`);
    const values = store.byCountry.get(code) || [];
    const series = values.map((item) => {
      const rows = {};
      METRIC_CODES.forEach((metric) => {
        rows[metric.toLowerCase() === "gain" ? "gain" : metric.toLowerCase()] = staticRanking(store, item.year, metric).ranking.find((row) => row.iso3 === code);
      });
      return { year: item.year, hdi: item.hdi, ...rows };
    });
    const first = values[0], last = values[values.length - 1];
    return {
      schema_version: "gir-nd-gain-backend-v1", index_code: "ND_GAIN", country: meta,
      coverage: { from_year: first.year, to_year: last.year, observations: values.length },
      change: {
        readiness: last.readiness - first.readiness,
        vulnerability: last.vulnerability - first.vulnerability,
        vulnerability_improvement: first.vulnerability - last.vulnerability,
        nd_gain_score: last.nd_gain_score - first.nd_gain_score,
      },
      series,
      release: store.core.overview?.release,
      comparability: store.core.provenance?.bundled_manifest?.comparability || {},
    };
  }

  function staticMatrix(store, year) {
    const selectedYear = Number(year || DEFAULT_YEAR);
    const gainRanking = staticRanking(store, selectedYear, "GAIN");
    const thresholds = store.core.reference_thresholds;
    const countries = gainRanking.ranking.map((row) => ({
      iso3: row.iso3, iso2: row.iso2, name_en: row.name_en, name_ru: row.name_ru,
      region_en: row.region_en, region_ru: row.region_ru, year: selectedYear,
      readiness: row.readiness, vulnerability: row.vulnerability, nd_gain_score: row.nd_gain_score,
      gain_rank: row.rank, hdi: row.hdi, quadrant: quadrant(row.readiness, row.vulnerability, thresholds),
    }));
    return {
      schema_version: "gir-nd-gain-backend-v1", index_code: "ND_GAIN", year: selectedYear,
      axis: { x: { metric: "READINESS", higher_is_better: true }, y: { metric: "VULNERABILITY", higher_is_better: false } },
      reference_thresholds: thresholds,
      selected_year_medians: { readiness: median(countries.map((item) => item.readiness)), vulnerability: median(countries.map((item) => item.vulnerability)) },
      filters: { region: null, query: null }, countries, release: store.core.overview?.release,
    };
  }

  function staticTrends(store, iso3s, metricCode) {
    const code = METRIC_CODES.includes(metricCode) ? metricCode : "GAIN";
    const series = iso3s.map((iso3) => {
      const meta = store.countries.get(iso3);
      if (!meta) return null;
      return {
        country: { iso3, name_en: meta.name_en, name_ru: meta.name_ru },
        points: (store.byCountry.get(iso3) || []).map((item) => {
          const row = staticRanking(store, item.year, code).ranking.find((value) => value.iso3 === iso3);
          return { year: item.year, score: row.score, rank: row.rank, directional_change_1y: row.directional_change_1y };
        }),
      };
    }).filter(Boolean);
    return { schema_version: "gir-nd-gain-backend-v1", index_code: "ND_GAIN", metric: metricPayload(store.core, code), from_year: 1995, to_year: 2021, series, release: store.core.overview?.release };
  }

  async function makeStaticProvider() {
    const store = await loadStaticStore();
    return {
      mode: "static",
      async base() {
        const ranking = staticRanking(store, store.core.years?.default_year || DEFAULT_YEAR, "GAIN");
        return {
          overview: store.core.overview, metrics: store.core.metrics, years: store.core.years,
          countries: store.core.countries, provenance: store.core.provenance,
          officialRelease: store.core.official_release, baseRanking: ranking,
          staticManifest: store.manifest, checksumVerified: store.checksumVerified,
        };
      },
      async ranking(year, metric) { return staticRanking(store, year, metric); },
      async country(iso3) { return staticCountry(store, iso3); },
      async matrix(year) { return staticMatrix(store, year); },
      async trends(countries, metric) { return staticTrends(store, countries, metric); },
      async provenance() { return store.core.provenance; },
      async officialRelease() { return store.core.official_release; },
    };
  }

  function makeApiProvider(overview) {
    return {
      mode: "api",
      async base() {
        const [metrics, years, baseRanking, provenance, officialRelease] = await Promise.all([
          fetchJson(`${API}/metrics`), fetchJson(`${API}/years`),
          fetchJson(`${API}/ranking?year=${overview.summary?.year || DEFAULT_YEAR}&metric=GAIN&limit=500`),
          fetchJson(`${API}/provenance`), fetchJson(`${API}/official-release`),
        ]);
        const countries = (baseRanking.ranking || []).map((row) => ({
          iso3: row.iso3, iso2: row.iso2, name_en: row.name_en, name_ru: row.name_ru, region_en: row.region_en, region_ru: row.region_ru,
        }));
        return { overview, metrics, years, countries, provenance, officialRelease, baseRanking };
      },
      ranking(year, metric) { return fetchJson(`${API}/ranking?year=${encodeURIComponent(year)}&metric=${encodeURIComponent(metric)}&limit=500`); },
      country(iso3) { return fetchJson(`${API}/countries/${encodeURIComponent(iso3)}`); },
      matrix(year) { return fetchJson(`${API}/matrix?year=${encodeURIComponent(year)}`); },
      trends(countries, metric) { return fetchJson(`${API}/trends?countries=${encodeURIComponent(countries.join(","))}&metric=${encodeURIComponent(metric)}`); },
      provenance() { return fetchJson(`${API}/provenance`); },
      officialRelease() { return fetchJson(`${API}/official-release`); },
    };
  }

  async function resolveProvider() {
    try { return makeApiProvider(await fetchJson(API)); }
    catch (apiError) {
      try { return await makeStaticProvider(); }
      catch (staticError) { throw new Error(`${apiError.message}; static fallback: ${staticError.message}`); }
    }
  }

  async function ensureBase() {
    if (state.base && state.provider) return state.base;
    if (!cache.basePromise) {
      cache.basePromise = resolveProvider().then(async (provider) => {
        state.provider = provider;
        state.providerMode = provider.mode;
        state.base = await provider.base();
        if (state.base.baseRanking) cache.rankings.set(`${state.base.baseRanking.year}:GAIN`, state.base.baseRanking);
        return state.base;
      }).catch((error) => { cache.basePromise = null; throw error; });
    }
    return cache.basePromise;
  }

  async function ensureRanking(year = state.year, metric = state.rankingMetric) {
    const key = `${year}:${metric}`;
    if (!cache.rankings.has(key)) cache.rankings.set(key, await state.provider.ranking(year, metric));
    return cache.rankings.get(key);
  }

  async function ensureProfile(iso3 = state.country) {
    const code = String(iso3).toUpperCase();
    if (!cache.profiles.has(code)) cache.profiles.set(code, await state.provider.country(code));
    return cache.profiles.get(code);
  }

  async function ensureMatrix(year = state.year) {
    const key = String(year);
    if (!cache.matrices.has(key)) cache.matrices.set(key, await state.provider.matrix(year));
    return cache.matrices.get(key);
  }

  async function ensureTrends(countries = state.compare, metric = state.trendMetric) {
    const key = `${metric}:${countries.join(",")}`;
    if (!cache.trends.has(key)) cache.trends.set(key, await state.provider.trends(countries, metric));
    return cache.trends.get(key);
  }

  async function ensureGeo() {
    if (state.geo) return state.geo;
    if (!cache.geoPromise) {
      cache.geoPromise = (async () => {
        let last = null;
        for (const source of GEO_SOURCES) {
          try {
            const value = await fetchJson(source);
            if (value?.features?.length) return value;
          } catch (error) { last = error; }
        }
        throw last || new Error("World geometry unavailable");
      })().then((value) => { state.geo = value; return value; }).catch((error) => { console.warn("ND-GAIN map geometry unavailable", error); return null; });
    }
    return cache.geoPromise;
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    const country = String(params.get("country") || state.country || "").toUpperCase();
    const year = Number(params.get("nd_year") || state.year || DEFAULT_YEAR);
    const metric = String(params.get("nd_metric") || state.metric || "GAIN").toUpperCase();
    const mapMetric = String(params.get("nd_map_metric") || state.mapMetric || metric).toUpperCase();
    const trendMetric = String(params.get("nd_trend_metric") || state.trendMetric || "GAIN").toUpperCase();
    const compare = String(params.get("nd_compare") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean).slice(0, 4);
    state.country = country;
    state.year = Number.isFinite(year) ? year : DEFAULT_YEAR;
    state.metric = METRIC_CODES.includes(metric) ? metric : "GAIN";
    state.mapMetric = METRIC_CODES.includes(mapMetric) ? mapMetric : "GAIN";
    state.trendMetric = METRIC_CODES.includes(trendMetric) ? trendMetric : "GAIN";
    state.rankingMetric = state.metric;
    if (compare.length) state.compare = compare;
    if (!state.compare.includes(country)) state.compare = [country, ...state.compare].slice(0, 4);
  }

  function writeUrl() {
    try {
      const url = new URL(location.href);
      url.searchParams.set("index", "ND_GAIN");
      url.searchParams.set("country", state.country);
      url.searchParams.set("nd_year", String(state.year));
      if (state.metric !== "GAIN") url.searchParams.set("nd_metric", state.metric); else url.searchParams.delete("nd_metric");
      if (state.mapMetric !== "GAIN") url.searchParams.set("nd_map_metric", state.mapMetric); else url.searchParams.delete("nd_map_metric");
      if (state.trendMetric !== "GAIN") url.searchParams.set("nd_trend_metric", state.trendMetric); else url.searchParams.delete("nd_trend_metric");
      url.searchParams.set("nd_compare", state.compare.join(","));
      url.hash = "index-ND_GAIN";
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (_) { /* previews may not expose history */ }
  }

  function countryMeta(iso3 = state.country) {
    return (state.base?.countries || []).find((item) => item.iso3 === iso3) || state.profile?.country || { iso3, name_en: iso3, name_ru: iso3 };
  }

  function selectedProfileRow(metric = state.metric, year = state.year) {
    const item = (state.profile?.series || []).find((row) => Number(row.year) === Number(year));
    if (!item) return null;
    return item[metric === "GAIN" ? "gain" : metric.toLowerCase()] || null;
  }

  function flag(item, size = "inline") {
    const iso2 = String(item?.iso2 || "").toLowerCase();
    const iso3 = String(item?.iso3 || "").toUpperCase();
    const cls = `ndg-flag ndg-flag--${size}`;
    if (!/^[a-z]{2}$/.test(iso2)) return `<span class="${cls} is-fallback">${esc(iso3)}</span>`;
    return `<span class="${cls}"><img src="/static/flags/${esc(iso2)}.svg" alt="" loading="lazy"><span>${esc(iso3)}</span></span>`;
  }

  function countrySelect(id, value, label) {
    const countries = [...(state.base?.countries || [])].sort((a, b) => localName(a).localeCompare(localName(b), locale()));
    return `<label class="ndg-field"><span>${esc(label)}</span><select id="${esc(id)}" class="ndg-select">${countries.map((item) => `<option value="${esc(item.iso3)}" ${item.iso3 === value ? "selected" : ""}>${esc(localName(item))} · ${esc(item.iso3)}</option>`).join("")}</select></label>`;
  }

  function metricOptions(value) {
    return METRIC_CODES.map((code) => `<option value="${code}" ${code === value ? "selected" : ""}>${esc(metricName(code))}</option>`).join("");
  }

  function yearOptions(value) {
    return (state.base?.years?.years || []).map((item) => `<option value="${item.year}" ${Number(item.year) === Number(value) ? "selected" : ""}>${item.year}</option>`).join("");
  }

  function loadingMarkup() {
    return `<section class="ndg-workspace index-workspace gir-native-workspace"><div class="ndg-loading" role="status" aria-live="polite">
      <div class="ndg-loading-visual" aria-hidden="true"><span></span><span></span><span></span><i></i></div>
      <div><strong>${esc(tr("loadingTitle"))}</strong><p>${esc(tr("loadingText"))}</p></div>
      <div class="ndg-loading-bars" aria-hidden="true">${Array.from({ length: 7 }, (_, index) => `<i style="--i:${index}"></i>`).join("")}</div>
    </div></section>`;
  }

  function errorMarkup(error) {
    return `<section class="ndg-workspace index-workspace gir-native-workspace"><div class="ndg-error"><span>ND‑GAIN / DATA CONTRACT</span><h1>${esc(tr("errorTitle"))}</h1><p>${esc(error?.message || String(error))}</p><button class="ndg-button ndg-button--primary" data-ndg-action="retry">${icon("arrow")}${esc(tr("retry"))}</button></div></section>`;
  }

  function providerPill() {
    return `<span class="ndg-provider"><i></i>${esc(state.providerMode === "api" ? tr("apiMode") : tr("staticMode"))}</span>`;
  }

  function heroMarkup() {
    const country = countryMeta();
    const row = selectedProfileRow("GAIN");
    return `<header class="ndg-hero" id="ndg-position">
      <div class="ndg-hero-grid" aria-hidden="true"></div>
      <div class="ndg-hero-orbit" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="ndg-hero-copy">
        <p class="ndg-kicker">${esc(tr("kicker"))}</p>
        <h1>${esc(tr("title"))}</h1>
        <p class="ndg-lead">${esc(tr("lead"))}</p>
        <div class="ndg-badges"><span>${icon("database")}${esc(tr("archiveBadge"))}</span><span>${icon("shield")}${esc(tr("releaseBadge"))}</span><span>${icon("globe")}${esc(tr("sourceBadge"))}</span></div>
      </div>
      <div class="ndg-hero-country">
        <div class="ndg-country-heading">${flag(country, "large")}<div><span>${esc(tr("selectedCountry"))}</span><strong>${esc(localName(country))}</strong><small>${esc(localRegion(country))} · ${esc(state.year)}</small></div></div>
        <div class="ndg-hero-score"><div><span>${esc(tr("score"))}</span><strong>${fmt(row?.score, 1)}</strong></div><div class="ndg-rank-orb"><span>#${row?.rank || "—"}</span><small>${esc(tr("derivedRank"))}</small></div></div>
        <div class="ndg-hero-status">${providerPill()}<span class="ndg-verified">${icon("check")}${esc(tr("verifiedBadge"))}</span></div>
      </div>
      <div class="ndg-controls" aria-label="ND-GAIN controls">
        ${countrySelect("ndgCountry", state.country, tr("country"))}
        <label class="ndg-field"><span>${esc(tr("year"))}</span><select id="ndgYear" class="ndg-select">${yearOptions(state.year)}</select></label>
        <label class="ndg-field"><span>${esc(tr("metric"))}</span><select id="ndgMetric" class="ndg-select">${metricOptions(state.metric)}</select></label>
        <button class="ndg-button" data-ndg-action="copy-link">${icon("copy")}${esc(tr("copyLink"))}</button>
        <button class="ndg-button ndg-button--primary" data-ndg-action="evidence">${icon("database")}${esc(tr("evidence"))}</button>
      </div>
      <div class="ndg-release-note">${icon("shield")}<span>${esc(tr("archiveNotice"))}</span></div>
    </header>`;
  }

  function jumpNavMarkup() {
    const items = [
      ["position", "jumpPosition", "shield"], ["matrix", "jumpMatrix", "matrix"], ["map", "jumpMap", "globe"],
      ["trend", "jumpTrend", "trend"], ["ranking", "jumpRanking", "list"], ["method", "jumpMethod", "book"],
    ];
    return `<nav class="ndg-jump" aria-label="ND-GAIN workspace sections">${items.map(([id, key, ico]) => `<button data-ndg-action="jump" data-target="ndg-${id}">${icon(ico)}<span>${esc(tr(key))}</span></button>`).join("")}</nav>`;
  }

  function sectionHeader(kicker, title, text, actions = "") {
    return `<header class="ndg-section-header"><div><p>${esc(kicker)}</p><h2>${esc(title)}</h2><span>${esc(text)}</span></div>${actions ? `<div class="ndg-section-actions">${actions}</div>` : ""}</header>`;
  }

  function gauge(value, metric, label) {
    const normalized = metric === "GAIN" ? clamp(Number(value) / 100, 0, 1) : higherIsBetter(metric) ? clamp(Number(value), 0, 1) : 1 - clamp(Number(value), 0, 1);
    const circumference = 2 * Math.PI * 42;
    return `<div class="ndg-gauge"><svg viewBox="0 0 108 108" role="img" aria-label="${esc(label)} ${fmtMetric(value, metric)}"><circle cx="54" cy="54" r="42" class="ndg-gauge-track"/><circle cx="54" cy="54" r="42" class="ndg-gauge-value" style="--dash:${(normalized * circumference).toFixed(1)};--circ:${circumference.toFixed(1)}"/><circle cx="54" cy="54" r="32" class="ndg-gauge-inner"/><text x="54" y="52" text-anchor="middle">${fmtMetric(value, metric)}</text><text x="54" y="68" text-anchor="middle">${esc(label)}</text></svg></div>`;
  }

  function signalsMarkup() {
    const gain = selectedProfileRow("GAIN");
    const readiness = selectedProfileRow("READINESS");
    const vulnerability = selectedProfileRow("VULNERABILITY");
    const matrixCountry = (state.matrix?.countries || []).find((item) => item.iso3 === state.country);
    const thresholds = state.matrix?.reference_thresholds || {};
    const readinessGap = readiness ? readiness.score - Number(thresholds.readiness) : null;
    const vulnerabilityGap = vulnerability ? Number(thresholds.vulnerability) - vulnerability.score : null;
    const period = state.profile?.change || {};
    return `<section class="ndg-section" id="ndg-position-signals">
      ${sectionHeader(tr("signalsKicker"), tr("signalsTitle"), tr("signalsText"))}
      <div class="ndg-signal-layout">
        <div class="ndg-balance-card">
          <div class="ndg-balance-gauges">${gauge(readiness?.score, "READINESS", tr("readiness"))}${gauge(vulnerability?.score, "VULNERABILITY", tr("vulnerability"))}</div>
          <div class="ndg-formula-line"><span>${esc(tr("balance"))}</span><strong>${fmt(gain?.score, 1)}</strong><code>(${fmt(readiness?.score, 3)} − ${fmt(vulnerability?.score, 3)} + 1) × 50</code></div>
        </div>
        <div class="ndg-kpis">
          <article><span>${esc(tr("globalRank"))}</span><strong>#${gain?.rank || "—"}</strong><small>${esc(tr("derivedRank"))}</small></article>
          <article><span>${esc(tr("regionalRank"))}</span><strong>#${gain?.region_rank || "—"}</strong><small>${esc(localRegion(gain || countryMeta()))}</small></article>
          <article class="${num(gain?.directional_change_1y) >= 0 ? "is-positive" : "is-negative"}"><span>${esc(tr("changeYear"))}</span><strong>${signed(gain?.directional_change_1y, 2)}</strong><small>${esc(metricDirectionText("GAIN"))}</small></article>
          <article class="${num(period.nd_gain_score) >= 0 ? "is-positive" : "is-negative"}"><span>${esc(tr("changePeriod"))}</span><strong>${signed(period.nd_gain_score, 1)}</strong><small>1995 → ${esc(state.profile?.coverage?.to_year || 2021)}</small></article>
        </div>
        <div class="ndg-diagnostic-grid">
          <article><div class="ndg-diagnostic-icon readiness">${icon("arrow")}</div><div><span>${esc(tr("readinessGap"))}</span><strong>${signed(readinessGap, 3)}</strong><small>${esc(tr("allYearsMedian"))}: ${fmt(thresholds.readiness, 3)}</small></div></article>
          <article><div class="ndg-diagnostic-icon vulnerability">${icon("shield")}</div><div><span>${esc(tr("vulnerabilityGap"))}</span><strong>${signed(vulnerabilityGap, 3)}</strong><small>${esc(tr("allYearsMedian"))}: ${fmt(thresholds.vulnerability, 3)}</small></div></article>
          <article><div class="ndg-diagnostic-icon quadrant">${icon("matrix")}</div><div><span>${esc(tr("quadrant"))}</span><strong>${esc(state.lang === "ru" ? matrixCountry?.quadrant?.name_ru : matrixCountry?.quadrant?.name_en)}</strong><small>${esc(tr("selectedYear"))}: ${esc(state.year)}</small></div></article>
        </div>
      </div>
    </section>`;
  }

  function matrixChartMarkup() {
    const data = state.matrix?.countries || [];
    if (!data.length) return "";
    const width = 900, height = 520, left = 74, right = 28, top = 34, bottom = 68;
    const xMin = Math.max(0, Math.min(...data.map((item) => item.readiness)) - 0.04);
    const xMax = Math.min(1, Math.max(...data.map((item) => item.readiness)) + 0.04);
    const yMin = Math.max(0, Math.min(...data.map((item) => item.vulnerability)) - 0.04);
    const yMax = Math.min(1, Math.max(...data.map((item) => item.vulnerability)) + 0.04);
    const x = (value) => left + ((value - xMin) / (xMax - xMin)) * (width - left - right);
    const y = (value) => top + ((value - yMin) / (yMax - yMin)) * (height - top - bottom);
    const thresholds = state.matrix.reference_thresholds;
    const tx = x(Number(thresholds.readiness));
    const ty = y(Number(thresholds.vulnerability));
    const trajectory = (state.profile?.series || []).filter((item) => item.year <= state.year).map((item) => [x(item.readiness.score), y(item.vulnerability.score)]);
    const qCounts = Object.fromEntries(QUADRANTS.map((code) => [code, 0]));
    data.forEach((item) => { qCounts[item.quadrant.code] = (qCounts[item.quadrant.code] || 0) + 1; });
    const grid = Array.from({ length: 6 }, (_, index) => {
      const xx = left + index * (width - left - right) / 5;
      const yy = top + index * (height - top - bottom) / 5;
      return `<path d="M${xx} ${top}V${height - bottom}M${left} ${yy}H${width - right}" class="ndg-chart-grid"/>`;
    }).join("");
    const points = data.map((item) => {
      const selected = item.iso3 === state.country;
      return `<circle class="ndg-matrix-point q-${esc(item.quadrant.code.toLowerCase())}${selected ? " is-selected" : ""}" cx="${x(item.readiness).toFixed(2)}" cy="${y(item.vulnerability).toFixed(2)}" r="${selected ? 8 : 4.1}" tabindex="0" role="button" data-ndg-action="country" data-iso="${esc(item.iso3)}" aria-label="${esc(localName(item))}: ${tr("readiness")} ${fmt(item.readiness, 3)}, ${tr("vulnerability")} ${fmt(item.vulnerability, 3)}"><title>${esc(localName(item))} · #${item.gain_rank} · ${esc(state.lang === "ru" ? item.quadrant.name_ru : item.quadrant.name_en)}</title></circle>`;
    }).join("");
    const selected = data.find((item) => item.iso3 === state.country);
    const trajectoryPath = trajectory.length > 1 ? `<polyline class="ndg-matrix-trajectory" points="${trajectory.map((point) => point.map((value) => value.toFixed(2)).join(",")).join(" ")}"/><circle class="ndg-matrix-origin" cx="${trajectory[0][0].toFixed(2)}" cy="${trajectory[0][1].toFixed(2)}" r="4"/>` : "";
    return `<div class="ndg-matrix-shell">
      <div class="ndg-matrix-visual"><svg viewBox="0 0 ${width} ${height}" role="group" aria-label="${esc(tr("matrixTitle"))}">
        <rect x="${left}" y="${top}" width="${tx - left}" height="${ty - top}" class="ndg-quadrant-bg q-stable"/>
        <rect x="${tx}" y="${top}" width="${width - right - tx}" height="${ty - top}" class="ndg-quadrant-bg q-frontier"/>
        <rect x="${left}" y="${ty}" width="${tx - left}" height="${height - bottom - ty}" class="ndg-quadrant-bg q-priority"/>
        <rect x="${tx}" y="${ty}" width="${width - right - tx}" height="${height - bottom - ty}" class="ndg-quadrant-bg q-ready-risk"/>
        ${grid}<path d="M${tx} ${top}V${height - bottom}M${left} ${ty}H${width - right}" class="ndg-median-line"/>
        ${trajectoryPath}${points}
        <text x="${left}" y="${height - 22}" class="ndg-axis-label">${esc(tr("readinessAxis"))}</text>
        <text transform="translate(20 ${height - bottom}) rotate(-90)" class="ndg-axis-label">${esc(tr("vulnerabilityAxis"))}</text>
        <text x="${left + 12}" y="${top + 22}" class="ndg-quadrant-label">${esc(tr("qStableGapShort"))}</text>
        <text x="${tx + 12}" y="${top + 22}" class="ndg-quadrant-label">${esc(tr("qBestShort"))}</text>
        <text x="${left + 12}" y="${ty + 24}" class="ndg-quadrant-label">${esc(tr("qPriorityShort"))}</text>
        <text x="${tx + 12}" y="${ty + 24}" class="ndg-quadrant-label">${esc(tr("qReadyRiskShort"))}</text>
        ${selected ? `<g class="ndg-matrix-callout"><path d="M${x(selected.readiness)} ${y(selected.vulnerability) - 11}l-7-10h14Z"/><text x="${x(selected.readiness)}" y="${y(selected.vulnerability) - 27}" text-anchor="middle">${esc(selected.iso3)}</text></g>` : ""}
      </svg></div>
      <aside class="ndg-quadrant-list">${QUADRANTS.map((code) => {
        const key = { [QUADRANTS[0]]: "qBest", [QUADRANTS[1]]: "qReadyRisk", [QUADRANTS[2]]: "qStableGap", [QUADRANTS[3]]: "qPriority" }[code];
        return `<article class="q-${code.toLowerCase()}"><i></i><div><strong>${esc(tr(key))}</strong><span>${qCounts[code] || 0} ${esc(tr("countries"))}</span></div></article>`;
      }).join("")}</aside>
    </div>`;
  }

  function matrixMarkup() {
    return `<section class="ndg-section" id="ndg-matrix">
      ${sectionHeader(tr("matrixKicker"), tr("matrixTitle"), tr("matrixText"), `<span class="ndg-mini-status">${icon("matrix")}${esc(tr("matrixLegend"))}</span>`)}
      ${matrixChartMarkup()}
    </section>`;
  }

  function geoBounds(features) {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    const scan = (coords) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === "number") {
        const [lon, lat] = coords;
        if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180) return;
        minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      } else coords.forEach(scan);
    };
    features.forEach((feature) => scan(feature.geometry?.coordinates));
    return { minLon, minLat, maxLon, maxLat };
  }

  function geoPath(geometry, width, height, bounds) {
    const project = (lon, lat) => [((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width, height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height];
    const ring = (points) => points.map((point, index) => { const [x, y] = project(point[0], point[1]); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";
    if (geometry?.type === "Polygon") return geometry.coordinates.map(ring).join("");
    if (geometry?.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map(ring).join("")).join("");
    return "";
  }

  function quantiles(values, count = 7) {
    const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const q = (p) => {
      if (!sorted.length) return null;
      const pos = (sorted.length - 1) * p, low = Math.floor(pos), high = Math.ceil(pos);
      return low === high ? sorted[low] : sorted[low] + (sorted[high] - sorted[low]) * (pos - low);
    };
    return { sorted, thresholds: Array.from({ length: count - 1 }, (_, index) => q((index + 1) / count)), min: sorted[0], median: q(.5), max: sorted[sorted.length - 1] };
  }

  function mapBin(value, scale, metric) {
    if (num(value) == null) return null;
    let bin = 0;
    while (bin < scale.thresholds.length && Number(value) > scale.thresholds[bin]) bin += 1;
    return higherIsBetter(metric) ? bin : 6 - bin;
  }

  function mapMarkup() {
    const ranking = state.mapRanking?.ranking || [];
    const values = new Map(ranking.map((item) => [item.iso3, item]));
    const scale = quantiles(ranking.map((item) => item.score));
    const width = 1020, height = 510, mapHeight = 430;
    if (!state.geo) return `<div class="ndg-map-unavailable"><span>${icon("globe")}</span><p>${esc(tr("noData"))}</p></div>`;
    const features = state.geo.features || [];
    const bounds = geoBounds(features);
    const mapped = new Set();
    const paths = features.map((feature) => {
      const iso = String(feature.properties?.iso3 || feature.properties?.ISO_A3 || feature.properties?.iso_a3 || feature.properties?.ADM0_A3 || "").toUpperCase();
      if (!iso || !values.has(iso)) return "";
      const row = values.get(iso), d = geoPath(feature.geometry, width, mapHeight, bounds);
      if (!d) return "";
      mapped.add(iso);
      const bin = mapBin(row.score, scale, state.mapMetric);
      return `<path class="ndg-map-country map-bin-${bin + 1}${iso === state.country ? " is-selected" : ""}" d="${d}" data-ndg-action="country" data-iso="${esc(iso)}" tabindex="0" role="button" aria-label="${esc(localName(row))}: ${fmtMetric(row.score, state.mapMetric)}"><title>${esc(localName(row))} · ${esc(metricName(state.mapMetric))}: ${fmtMetric(row.score, state.mapMetric)} · #${row.rank}</title></path>`;
    }).join("");
    const project = (lon, lat) => [((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width, mapHeight - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * mapHeight];
    const markers = ranking.filter((row) => !mapped.has(row.iso3) && ISLAND_CENTROIDS[row.iso3]).map((row) => {
      const [x, y] = project(...ISLAND_CENTROIDS[row.iso3]);
      const bin = mapBin(row.score, scale, state.mapMetric);
      mapped.add(row.iso3);
      return `<circle class="ndg-map-marker map-bin-${bin + 1}${row.iso3 === state.country ? " is-selected" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${row.iso3 === state.country ? 5.5 : 3.2}" data-ndg-action="country" data-iso="${esc(row.iso3)}" tabindex="0" role="button"><title>${esc(localName(row))} · ${fmtMetric(row.score, state.mapMetric)} · #${row.rank}</title></circle>`;
    }).join("");
    const legend = Array.from({ length: 7 }, (_, index) => `<i class="map-bin-${index + 1}"></i>`).join("");
    return `<div class="ndg-map-shell">
      <div class="ndg-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="group" aria-label="${esc(tr("mapTitle"))}">${paths}${markers}<g class="ndg-map-legend" transform="translate(40 458)"><text x="0" y="-10">${esc(tr("low"))}</text>${Array.from({ length: 7 }, (_, index) => `<rect x="${index * 34}" y="0" width="34" height="11" class="map-bin-${index + 1}"/>`).join("")}<text x="238" y="-10" text-anchor="end">${esc(tr("high"))}</text><text x="119" y="31" text-anchor="middle">${esc(metricName(state.mapMetric))} · ${esc(state.year)}</text></g></svg></div>
      <aside class="ndg-map-side"><div class="ndg-map-stat"><span>${esc(tr("mappedCountries"))}</span><strong>${mapped.size} / ${ranking.length}</strong><div class="ndg-color-ramp">${legend}</div></div>${ranking.slice(0, 5).map((row) => `<button data-ndg-action="country" data-iso="${row.iso3}">${flag(row)}<span><strong>${esc(localName(row))}</strong><small>#${row.rank}</small></span><b>${fmtMetric(row.score, state.mapMetric)}</b></button>`).join("")}</aside>
    </div>`;
  }

  function mapSectionMarkup() {
    const actions = `<label class="ndg-inline-field"><span>${esc(tr("mapMetric"))}</span><select id="ndgMapMetric" class="ndg-select">${metricOptions(state.mapMetric)}</select></label>`;
    return `<section class="ndg-section" id="ndg-map">${sectionHeader(tr("mapKicker"), tr("mapTitle"), tr("mapText"), actions)}${mapMarkup()}</section>`;
  }

  function trendChartMarkup() {
    const series = state.trends?.series || [];
    if (!series.length) return "";
    const width = 920, height = 390, left = 58, right = 22, top = 30, bottom = 54;
    const allPoints = series.flatMap((item) => item.points || []);
    const values = allPoints.map((point) => point.score).filter(Number.isFinite);
    let minValue = Math.min(...values), maxValue = Math.max(...values);
    const pad = (maxValue - minValue || 1) * .12;
    minValue -= pad; maxValue += pad;
    if (state.trendMetric !== "GAIN") { minValue = Math.max(0, minValue); maxValue = Math.min(1, maxValue); }
    const x = (year) => left + ((year - 1995) / (2021 - 1995)) * (width - left - right);
    const y = (value) => top + (1 - (value - minValue) / (maxValue - minValue)) * (height - top - bottom);
    const grid = Array.from({ length: 6 }, (_, index) => {
      const yy = top + index * (height - top - bottom) / 5;
      const value = maxValue - index * (maxValue - minValue) / 5;
      return `<path d="M${left} ${yy}H${width - right}" class="ndg-chart-grid"/><text x="${left - 10}" y="${yy + 4}" text-anchor="end" class="ndg-chart-tick">${fmtMetric(value, state.trendMetric)}</text>`;
    }).join("");
    const years = [1995, 2000, 2005, 2010, 2015, 2021].map((year) => `<text x="${x(year)}" y="${height - 20}" text-anchor="middle" class="ndg-chart-tick">${year}</text>`).join("");
    const lines = series.map((item, index) => {
      const points = item.points || [];
      const path = points.map((point, pointIndex) => `${pointIndex ? "L" : "M"}${x(point.year).toFixed(2)} ${y(point.score).toFixed(2)}`).join(" ");
      const last = points[points.length - 1];
      return `<g class="ndg-trend-series series-${index + 1}"><path d="${path}" class="ndg-trend-line"/>${points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((point) => `<circle cx="${x(point.year)}" cy="${y(point.score)}" r="3.2"><title>${esc(state.lang === "ru" ? item.country.name_ru : item.country.name_en)} · ${point.year}: ${fmtMetric(point.score, state.trendMetric)} · #${point.rank}</title></circle>`).join("")}<text x="${x(last.year) - 7}" y="${y(last.score) - 10}" text-anchor="end" class="ndg-trend-label">${esc(item.country.iso3)}</text></g>`;
    }).join("");
    return `<div class="ndg-trend-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("trendTitle"))}">${grid}${years}${lines}</svg></div>`;
  }

  function trendSectionMarkup() {
    const candidates = [...(state.base?.countries || [])].filter((item) => !state.compare.includes(item.iso3)).sort((a, b) => localName(a).localeCompare(localName(b), locale()));
    const actions = `<label class="ndg-inline-field"><span>${esc(tr("compareMetric"))}</span><select id="ndgTrendMetric" class="ndg-select">${metricOptions(state.trendMetric)}</select></label>`;
    const cards = (state.trends?.series || []).map((item, index) => {
      const points = item.points || [], first = points[0], last = points[points.length - 1];
      return `<article class="ndg-trend-card series-${index + 1}"><div>${flag(countryMeta(item.country.iso3))}<span><strong>${esc(state.lang === "ru" ? item.country.name_ru : item.country.name_en)}</strong><small>${esc(item.country.iso3)}</small></span>${state.compare.length > 1 ? `<button aria-label="${esc(tr("remove"))}" data-ndg-action="remove-compare" data-iso="${item.country.iso3}">${icon("close")}</button>` : ""}</div><dl><div><dt>${esc(tr("startValue"))}</dt><dd>${fmtMetric(first?.score, state.trendMetric)}</dd></div><div><dt>${esc(tr("endValue"))}</dt><dd>${fmtMetric(last?.score, state.trendMetric)}</dd></div><div><dt>${esc(tr("periodChange"))}</dt><dd>${signed(num(last?.score) - num(first?.score), state.trendMetric === "GAIN" ? 1 : 3)}</dd></div></dl></article>`;
    }).join("");
    return `<section class="ndg-section" id="ndg-trend">${sectionHeader(tr("trendKicker"), tr("trendTitle"), tr("trendText"), actions)}
      <div class="ndg-compare-bar"><div class="ndg-compare-cards">${cards}</div><div class="ndg-add-compare"><label><span>${esc(tr("addCountry"))}</span><select id="ndgCompareCountry" class="ndg-select" ${state.compare.length >= 4 ? "disabled" : ""}>${candidates.map((item) => `<option value="${item.iso3}">${esc(localName(item))} · ${item.iso3}</option>`).join("")}</select></label><button class="ndg-button" data-ndg-action="add-compare" ${state.compare.length >= 4 || !candidates.length ? "disabled" : ""}>${icon("plus")}${esc(tr("add"))}</button></div></div>
      ${trendChartMarkup()}
    </section>`;
  }

  function filteredRankingRows() {
    let rows = [...(state.ranking?.ranking || [])];
    const query = state.rankingQuery.trim().toLocaleLowerCase(locale());
    if (state.rankingRegion) rows = rows.filter((item) => item.region_en === state.rankingRegion);
    if (query) rows = rows.filter((item) => [item.iso3, item.iso2, item.name_en, item.name_ru].some((value) => String(value || "").toLocaleLowerCase(locale()).includes(query)));
    const field = state.rankingSort;
    rows.sort((a, b) => {
      let result;
      if (field === "country") result = localName(a).localeCompare(localName(b), locale());
      else {
        const av = num(a[field]), bv = num(b[field]);
        if (av == null && bv == null) result = 0;
        else if (av == null) result = 1;
        else if (bv == null) result = -1;
        else result = av - bv;
      }
      return (state.rankingOrder === "desc" ? -result : result) || a.iso3.localeCompare(b.iso3);
    });
    return rows;
  }

  function rankingControlsMarkup() {
    const regions = [...new Map((state.base?.countries || []).map((item) => [item.region_en, item])).entries()].sort((a, b) => localRegion(a[1]).localeCompare(localRegion(b[1]), locale()));
    return `<div class="ndg-ranking-controls">
      <label class="ndg-inline-field"><span>${esc(tr("metric"))}</span><select id="ndgRankingMetric" class="ndg-select">${metricOptions(state.rankingMetric)}</select></label>
      <label class="ndg-inline-field"><span>${esc(tr("region"))}</span><select id="ndgRankingRegion" class="ndg-select"><option value="">${esc(tr("allRegions"))}</option>${regions.map(([region, item]) => `<option value="${esc(region)}" ${region === state.rankingRegion ? "selected" : ""}>${esc(localRegion(item))}</option>`).join("")}</select></label>
      <label class="ndg-search-field"><span class="sr-only">${esc(tr("search"))}</span>${icon("search")}<input id="ndgRankingSearch" type="search" value="${esc(state.rankingQuery)}" placeholder="${esc(tr("searchCountry"))}"></label>
      <label class="ndg-inline-field compact"><span>${esc(tr("rows"))}</span><select id="ndgPageSize" class="ndg-select">${[10, 25, 50, 100].map((size) => `<option value="${size}" ${size === state.pageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label>
      <button class="ndg-button" data-ndg-action="export">${icon("download")}${esc(tr("exportCsv"))}</button>
    </div>`;
  }

  function sortButton(label, field) {
    const active = state.rankingSort === field;
    return `<button data-ndg-action="sort" data-field="${field}" class="ndg-sort${active ? " is-active" : ""}">${esc(label)}${active ? `<span>${state.rankingOrder === "asc" ? "↑" : "↓"}</span>` : ""}</button>`;
  }

  function rankingSectionMarkup() {
    const rows = filteredRankingRows();
    const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = clamp(state.page, 1, pages);
    const visible = rows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    const selected = rows.find((item) => item.iso3 === state.country);
    const worldMedian = median((state.ranking?.ranking || []).map((item) => item.score));
    const regionMean = mean((state.ranking?.ranking || []).filter((item) => item.region_en === countryMeta().region_en).map((item) => item.score));
    return `<section class="ndg-section" id="ndg-ranking">${sectionHeader(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"))}
      ${rankingControlsMarkup()}
      <div class="ndg-ranking-summary"><article><span>${esc(tr("selectedCountry"))}</span><strong>#${selected?.rank || "—"}</strong><small>${esc(localName(selected || countryMeta()))}</small></article><article><span>${esc(tr("worldMedian"))}</span><strong>${fmtMetric(worldMedian, state.rankingMetric)}</strong><small>${esc(metricName(state.rankingMetric))}</small></article><article><span>${esc(tr("regionalMean"))}</span><strong>${fmtMetric(regionMean, state.rankingMetric)}</strong><small>${esc(localRegion(countryMeta()))}</small></article><article><span>${esc(tr("records"))}</span><strong>${rows.length}</strong><small>${esc(state.year)}</small></article></div>
      <div class="ndg-table-wrap"><table class="ndg-table"><thead><tr><th>${sortButton(tr("place"), "rank")}</th><th>${sortButton(tr("countryColumn"), "country")}</th><th>${sortButton(tr("scoreColumn"), "score")}</th><th>${esc(tr("readiness"))}</th><th>${esc(tr("vulnerability"))}</th><th>${sortButton(tr("changeColumn"), "directional_change_1y")}</th><th>${sortButton(tr("hdi"), "hdi")}</th><th><span class="sr-only">${esc(tr("action"))}</span></th></tr></thead><tbody>${visible.length ? visible.map((row) => `<tr class="${row.iso3 === state.country ? "is-selected" : ""}"><td><span class="ndg-rank">#${row.rank}</span></td><td><button class="ndg-country-cell" data-ndg-action="country" data-iso="${row.iso3}">${flag(row)}<span><strong>${esc(localName(row))}</strong><small>${esc(localRegion(row))} · ${row.iso3}</small></span></button></td><td><strong>${fmtMetric(row.score, state.rankingMetric)}</strong><small>${esc(metricDirectionText(state.rankingMetric))}</small></td><td>${fmt(row.readiness, 3)}</td><td>${fmt(row.vulnerability, 3)}</td><td class="${num(row.directional_change_1y) >= 0 ? "is-positive" : "is-negative"}">${signed(row.directional_change_1y, state.rankingMetric === "GAIN" ? 2 : 4)}</td><td>${fmt(row.hdi, 3)}</td><td><button class="ndg-row-open" data-ndg-action="country" data-iso="${row.iso3}" aria-label="${esc(tr("open"))}">${icon("chevron")}</button></td></tr>`).join("") : `<tr><td colspan="8" class="ndg-empty">${esc(tr("noRows"))}</td></tr>`}</tbody></table></div>
      <div class="ndg-mobile-ranking">${visible.map((row) => `<article class="${row.iso3 === state.country ? "is-selected" : ""}"><button data-ndg-action="country" data-iso="${row.iso3}"><span class="ndg-mobile-rank">#${row.rank}</span>${flag(row, "medium")}<span class="ndg-mobile-country"><strong>${esc(localName(row))}</strong><small>${esc(localRegion(row))}</small></span><b>${fmtMetric(row.score, state.rankingMetric)}</b>${icon("chevron")}</button><dl><div><dt>${esc(tr("readiness"))}</dt><dd>${fmt(row.readiness, 3)}</dd></div><div><dt>${esc(tr("vulnerability"))}</dt><dd>${fmt(row.vulnerability, 3)}</dd></div><div><dt>${esc(tr("changeYear"))}</dt><dd>${signed(row.directional_change_1y, state.rankingMetric === "GAIN" ? 2 : 4)}</dd></div></dl></article>`).join("")}</div>
      <div class="ndg-pagination"><p>${esc(tr("page"))} <strong>${state.page}</strong> ${esc(tr("of"))} ${pages} · ${rows.length} ${esc(tr("records"))}</p><div><button class="ndg-button" data-ndg-action="page" data-page="${state.page - 1}" ${state.page <= 1 ? "disabled" : ""}>${esc(tr("previous"))}</button><button class="ndg-button" data-ndg-action="page" data-page="${state.page + 1}" ${state.page >= pages ? "disabled" : ""}>${esc(tr("next"))}</button></div></div>
      <p class="ndg-footnote">${icon("shield")}${esc(tr("rankingNote"))}</p>
    </section>`;
  }

  function methodSectionMarkup() {
    return `<section class="ndg-section" id="ndg-method">${sectionHeader(tr("methodKicker"), tr("methodTitle"), tr("methodText"))}
      <div class="ndg-method-grid">
        <article class="ndg-method-card formula"><span>01</span>${icon("matrix")}<h3>${esc(tr("formulaTitle"))}</h3><code>${esc(tr("formula"))}</code><p>${esc(tr("higherBetter"))}</p></article>
        <article class="ndg-method-card"><span>02</span>${icon("shield")}<h3>${esc(tr("vulnerabilityTitle"))}</h3><strong>36</strong><p>${esc(tr("vulnerabilityText"))}</p><div class="ndg-tag-row"><i>Food</i><i>Water</i><i>Health</i><i>Ecosystems</i><i>Habitat</i><i>Infrastructure</i></div></article>
        <article class="ndg-method-card"><span>03</span>${icon("arrow")}<h3>${esc(tr("readinessTitle"))}</h3><strong>9</strong><p>${esc(tr("readinessText"))}</p><div class="ndg-tag-row"><i>Economic</i><i>Governance</i><i>Social</i></div></article>
        <article class="ndg-method-card warning"><span>04</span>${icon("database")}<h3>${esc(tr("separationTitle"))}</h3><p>${esc(tr("separationText"))}</p><b>releases_merged = false</b></article>
        <article class="ndg-method-card licence"><span>05</span>${icon("book")}<h3>${esc(tr("licenseTitle"))}</h3><p>${esc(tr("licenseText"))}</p><b>CC BY 3.0</b></article>
      </div>
      <div class="ndg-official-links"><span>${esc(tr("officialLinks"))}</span><a href="https://gain.nd.edu/our-work/country-index/methodology/" target="_blank" rel="noopener noreferrer">${esc(tr("methodology"))}${icon("external")}</a><a href="https://gain.nd.edu/our-work/country-index/download-data/" target="_blank" rel="noopener noreferrer">${esc(tr("downloadData"))}${icon("external")}</a><a href="https://gain.nd.edu/assets/581554/nd_gain_countryindex_technicalreport_2024.pdf" target="_blank" rel="noopener noreferrer">${esc(tr("technicalReport"))}${icon("external")}</a><button class="ndg-button ndg-button--primary" data-ndg-action="evidence">${icon("database")}${esc(tr("evidence"))}</button></div>
    </section>`;
  }

  function evidenceFile(file) {
    return `<li><div><strong>${esc(file.path || file.role || "—")}</strong><span>${esc(file.role || file.transformation_id || "")}</span></div><code>${esc(String(file.sha256 || "—").slice(0, 20))}…</code></li>`;
  }

  function evidenceMarkup() {
    const provenance = state.base?.provenance || {};
    const manifest = provenance.bundled_manifest || {};
    const current = provenance.current_official_release || state.base?.officialRelease?.release || {};
    const integrity = provenance.integrity || {};
    const datasetSha = provenance.dataset_sha256 || "—";
    return `<div class="ndg-evidence-panel" role="dialog" aria-modal="true" aria-labelledby="ndgEvidenceTitle">
      <button class="ndg-evidence-backdrop" data-ndg-action="close-evidence" aria-label="${esc(tr("close"))}"></button>
      <aside><header><div><p>${esc(tr("evidenceKicker"))}</p><h2 id="ndgEvidenceTitle">${esc(tr("evidenceTitle"))}</h2></div><button data-ndg-action="close-evidence" aria-label="${esc(tr("close"))}">${icon("close")}</button></header>
        <div class="ndg-evidence-body">
          <section class="ndg-evidence-hero"><div><span>${esc(tr("activeDataset"))}</span><strong>${esc(manifest.dataset_id || "ND_GAIN_ARCHIVAL_PANEL_1995_2021")}</strong><small>${esc(tr("sourceArchival"))}</small></div><div><span>${esc(tr("activeCoverage"))}</span><strong>${manifest.coverage?.first_year || 1995}–${manifest.coverage?.last_year || 2021}</strong><small>${manifest.coverage?.countries || 185} ${esc(tr("countries"))} · ${manifest.coverage?.observation_rows || 4995} observations</small></div><div><span>${esc(tr("currentRelease"))}</span><strong>${current.edition || 2026}</strong><small>${esc(tr("latestOfficialYear"))}: ${current.latest_data_year || 2024}</small></div></section>
          <section class="ndg-integrity"><article>${icon("check")}<span>${esc(tr("checksums"))}</span><strong>${integrity.checksums_verified ? "OK" : "—"}</strong></article><article>${icon("check")}<span>${esc(tr("validated"))}</span><strong>${integrity.contract_validated ? "OK" : "—"}</strong></article><article>${icon("shield")}<span>${esc(tr("interpolation"))}</span><strong>${integrity.gir_interpolation_performed ? tr("yes") : tr("none")}</strong></article><article>${icon("shield")}<span>${esc(tr("zeroFill"))}</span><strong>${integrity.nulls_coerced_to_zero ? tr("yes") : tr("no")}</strong></article><article>${icon("matrix")}<span>${esc(tr("officialRanks"))}</span><strong>${esc(tr("rankDerived"))}</strong></article><article>${icon("database")}<span>${esc(tr("merged"))}</span><strong>${esc(tr("notMerged"))}</strong></article></section>
          <section class="ndg-fingerprint"><div><span>${esc(tr("fingerprint"))}</span><code>${esc(datasetSha)}</code></div><button class="ndg-button" data-ndg-action="copy-hash" data-value="${esc(datasetSha)}">${icon("copy")}${esc(tr("copy"))}</button></section>
          <div class="ndg-evidence-files"><section><header><span>01</span><h3>${esc(tr("rawFiles"))}</h3></header><ul>${(manifest.raw_files || []).map(evidenceFile).join("")}</ul></section><section><header><span>02</span><h3>${esc(tr("derivedFiles"))}</h3></header><ul>${(manifest.derived_files || []).map(evidenceFile).join("")}</ul></section></div>
          <section class="ndg-release-separation"><div><span>${esc(tr("currentDescriptor"))}</span><strong>${current.owner || "Notre Dame Global Adaptation Initiative"}</strong><small>${esc(tr("releaseDate"))}: ${current.release_date || "2026-06-26"} · B‑READY</small></div><code>current_and_archival_releases_merged = false</code></section>
        </div>
      </aside>
    </div>`;
  }

  function workspaceMarkup() {
    return `<div class="ndg-workspace index-workspace gir-native-workspace" data-gir-design="native-06r" data-ndg-provider="${esc(state.providerMode)}">
      <a class="ndg-skip" href="#ndg-matrix">${esc(tr("jumpMatrix"))}</a>
      ${heroMarkup()}${jumpNavMarkup()}<main>${signalsMarkup()}${matrixMarkup()}${mapSectionMarkup()}${trendSectionMarkup()}${rankingSectionMarkup()}${methodSectionMarkup()}</main>
      <div id="ndgDialog"></div><div class="ndg-live sr-only" aria-live="polite"></div>
    </div>`;
  }

  function announce(message) {
    const node = state.root?.querySelector(".ndg-live");
    if (node) node.textContent = message;
    state.context?.showToast?.(message);
  }

  async function refreshData({ profile = true, ranking = true, matrix = true, map = true, trends = true } = {}) {
    const tasks = [];
    if (profile) tasks.push(ensureProfile().then((value) => { state.profile = value; }));
    if (ranking) tasks.push(ensureRanking(state.year, state.rankingMetric).then((value) => { state.ranking = value; }));
    if (matrix) tasks.push(ensureMatrix().then((value) => { state.matrix = value; }));
    if (map) tasks.push(ensureRanking(state.year, state.mapMetric).then((value) => { state.mapRanking = value; }));
    if (trends) tasks.push(ensureTrends().then((value) => { state.trends = value; }));
    await Promise.all(tasks);
  }

  async function selectCountry(iso3) {
    const code = String(iso3 || "").toUpperCase();
    if (!countryMeta(code)?.iso3) return;
    state.country = code;
    if (!state.compare.includes(code)) state.compare = [code, ...state.compare].slice(0, 4);
    state.context?.onCountryChange?.(code);
    state.root.innerHTML = loadingMarkup();
    await refreshData({ profile: true, ranking: false, matrix: false, map: false, trends: true });
    writeUrl();
    renderWorkspace();
    state.root.querySelector("#ndg-position")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderWorkspace() {
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
    document.documentElement.dataset.ndGainReady = "true";
    window.__GIR_ND_GAIN_READY__ = true;
  }

  function csvExport() {
    const rows = filteredRankingRows();
    const fields = ["rank", "iso3", "name_en", "name_ru", "region_en", "year", "metric", "score", "readiness", "vulnerability", "directional_change_1y", "hdi", "rank_is_derived"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const body = [fields.join(","), ...rows.map((row) => fields.map((field) => quote(row[field])).join(","))].join("\n");
    const blob = new Blob(["\ufeff", body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `nd-gain-${state.year}-${state.rankingMetric}-ranking.csv`; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function openEvidence(trigger) {
    state.dialogReturn = trigger || document.activeElement;
    const host = state.root.querySelector("#ndgDialog");
    host.innerHTML = evidenceMarkup();
    document.body.classList.add("ndg-dialog-open");
    requestAnimationFrame(() => host.querySelector("aside > header button")?.focus());
  }

  function closeEvidence() {
    const host = state.root.querySelector("#ndgDialog");
    if (host) host.innerHTML = "";
    document.body.classList.remove("ndg-dialog-open");
    const target = state.dialogReturn; state.dialogReturn = null;
    if (target?.focus && target.isConnected) target.focus();
  }

  async function handleChange(event) {
    const target = event.target;
    try {
      if (target.id === "ndgCountry") return selectCountry(target.value);
      if (target.id === "ndgYear") {
        state.year = Number(target.value); state.page = 1; state.root.innerHTML = loadingMarkup();
        await refreshData({ profile: false, ranking: true, matrix: true, map: true, trends: false }); writeUrl(); renderWorkspace(); return;
      }
      if (target.id === "ndgMetric") {
        state.metric = target.value; state.rankingMetric = target.value; state.page = 1; state.root.innerHTML = loadingMarkup();
        await refreshData({ profile: false, ranking: true, matrix: false, map: false, trends: false }); writeUrl(); renderWorkspace(); return;
      }
      if (target.id === "ndgMapMetric") {
        state.mapMetric = target.value; state.root.innerHTML = loadingMarkup();
        await refreshData({ profile: false, ranking: false, matrix: false, map: true, trends: false }); writeUrl(); renderWorkspace(); state.root.querySelector("#ndg-map")?.scrollIntoView({ block: "start" }); return;
      }
      if (target.id === "ndgTrendMetric") {
        state.trendMetric = target.value; state.root.innerHTML = loadingMarkup();
        await refreshData({ profile: false, ranking: false, matrix: false, map: false, trends: true }); writeUrl(); renderWorkspace(); state.root.querySelector("#ndg-trend")?.scrollIntoView({ block: "start" }); return;
      }
      if (target.id === "ndgRankingMetric") {
        state.rankingMetric = target.value; state.metric = target.value; state.page = 1; state.root.innerHTML = loadingMarkup();
        await refreshData({ profile: false, ranking: true, matrix: false, map: false, trends: false }); writeUrl(); renderWorkspace(); state.root.querySelector("#ndg-ranking")?.scrollIntoView({ block: "start" }); return;
      }
      if (target.id === "ndgRankingRegion") { state.rankingRegion = target.value; state.page = 1; renderWorkspace(); state.root.querySelector("#ndg-ranking")?.scrollIntoView({ block: "start" }); return; }
      if (target.id === "ndgPageSize") { state.pageSize = Number(target.value); state.page = 1; renderWorkspace(); state.root.querySelector("#ndg-ranking")?.scrollIntoView({ block: "start" }); }
    } catch (error) { state.root.innerHTML = errorMarkup(error); bindWorkspace(); }
  }

  function handleInput(event) {
    if (event.target.id !== "ndgRankingSearch") return;
    state.rankingQuery = event.target.value; state.page = 1;
    const section = state.root.querySelector("#ndg-ranking");
    if (section) {
      const wrapper = document.createElement("div"); wrapper.innerHTML = rankingSectionMarkup(); section.replaceWith(wrapper.firstElementChild); bindWorkspace();
      state.root.querySelector("#ndgRankingSearch")?.focus();
      const input = state.root.querySelector("#ndgRankingSearch"); if (input) input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  async function handleAction(event) {
    const control = event.target.closest("[data-ndg-action]");
    if (!control) return;
    const action = control.dataset.ndgAction;
    if (["BUTTON", "A"].includes(control.tagName)) event.preventDefault();
    try {
      if (action === "country") return selectCountry(control.dataset.iso);
      if (action === "jump") return state.root.querySelector(`#${CSS.escape(control.dataset.target)}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (action === "copy-link") { writeUrl(); await navigator.clipboard?.writeText?.(location.href); announce(tr("copied")); return; }
      if (action === "evidence") return openEvidence(control);
      if (action === "close-evidence") return closeEvidence();
      if (action === "copy-hash") { await navigator.clipboard?.writeText?.(control.dataset.value || ""); announce(tr("copiedHash")); return; }
      if (action === "export") return csvExport();
      if (action === "retry") { cache.basePromise = null; state.base = null; state.provider = null; return render(state.context); }
      if (action === "add-compare") {
        const select = state.root.querySelector("#ndgCompareCountry");
        if (select?.value && state.compare.length < 4 && !state.compare.includes(select.value)) {
          state.compare.push(select.value); state.root.innerHTML = loadingMarkup(); await refreshData({ profile: false, ranking: false, matrix: false, map: false, trends: true }); writeUrl(); renderWorkspace(); state.root.querySelector("#ndg-trend")?.scrollIntoView({ block: "start" });
        } return;
      }
      if (action === "remove-compare") {
        state.compare = state.compare.filter((iso3) => iso3 !== control.dataset.iso);
        if (!state.compare.length) state.compare = [state.country];
        state.root.innerHTML = loadingMarkup(); await refreshData({ profile: false, ranking: false, matrix: false, map: false, trends: true }); writeUrl(); renderWorkspace(); state.root.querySelector("#ndg-trend")?.scrollIntoView({ block: "start" }); return;
      }
      if (action === "sort") {
        const field = control.dataset.field;
        if (state.rankingSort === field) state.rankingOrder = state.rankingOrder === "asc" ? "desc" : "asc";
        else { state.rankingSort = field; state.rankingOrder = field === "score" || field === "directional_change_1y" || field === "hdi" ? "desc" : "asc"; }
        state.page = 1; renderWorkspace(); state.root.querySelector("#ndg-ranking")?.scrollIntoView({ block: "start" }); return;
      }
      if (action === "page") { state.page = Number(control.dataset.page); renderWorkspace(); state.root.querySelector("#ndg-ranking")?.scrollIntoView({ block: "start" }); }
    } catch (error) { state.root.innerHTML = errorMarkup(error); bindWorkspace(); }
  }

  function handleKeydown(event) {
    const control = event.target.closest("[data-ndg-action]");
    if (control && !["BUTTON", "A"].includes(control.tagName) && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); handleAction({ target: control, preventDefault() {} }); return; }
    const panel = state.root.querySelector(".ndg-evidence-panel");
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
    state.root.querySelectorAll(".ndg-flag img").forEach((image) => {
      image.onerror = () => { image.parentElement?.classList.add("is-fallback"); image.remove(); };
    });
  }

  async function render(context = {}) {
    state.context = context;
    state.root = context.root || document.querySelector("#view");
    if (!state.root) return;
    state.lang = context.lang === "en" ? "en" : "ru";
    state.theme = context.theme === "light" ? "light" : "dark";
    state.country = String(new URLSearchParams(window.location.search).get("country") || context.country || "").toUpperCase();
    if (!state.country) return;
    readUrl();
    state.root.innerHTML = loadingMarkup();
    document.documentElement.dataset.ndGainReady = "loading";
    window.__GIR_ND_GAIN_READY__ = false;
    try {
      await ensureBase();
      const validYears = (state.base.years?.years || []).map((item) => Number(item.year));
      if (!validYears.includes(state.year)) state.year = state.base.years?.default_year || DEFAULT_YEAR;
      if (!countryMeta(state.country)?.iso3) throw new Error(`Unknown selected country: ${state.country}`);
      if (!state.compare.includes(state.country)) state.compare = [state.country, ...state.compare].slice(0, 4);
      await Promise.all([refreshData(), ensureGeo()]);
      writeUrl();
      renderWorkspace();
    } catch (error) {
      console.error("ND-GAIN workspace failed", error);
      document.documentElement.dataset.ndGainReady = "error";
      state.root.innerHTML = errorMarkup(error);
      bindWorkspace();
    }
  }

  window.GIRNDGAIN = { render, _state: state, _cache: cache };
})();
