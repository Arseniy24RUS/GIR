(() => {
  "use strict";

  const API = "/api/environment/world-risk";
  const STATIC_CORE = "/static/world-risk/world-risk-core.json";
  const STATIC_MANIFEST = "/static/world-risk/manifest.json";
  const STATIC_INDICATOR_ROOT = "/static/world-risk/";
  const GEO_SOURCES = ["/static/epi-world.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
  const HEADLINE = ["W", "E", "V", "S", "C", "A"];
  const HAZARDS = ["EI_01", "EI_02", "EI_03", "EI_04", "EI_05", "EI_06", "EI_07"];
  const ISLAND_CENTROIDS = {
    AND: [1.58, 42.55], LIE: [9.55, 47.14], MCO: [7.42, 43.74], SMR: [12.46, 43.94],
    ATG: [-61.8, 17.06], BHR: [50.55, 26.05], BRB: [-59.55, 13.18], COM: [43.33, -11.65],
    CPV: [-23.62, 15.1], DMA: [-61.36, 15.42], FJI: [178.1, -17.8], FSM: [158.2, 6.9],
    GRD: [-61.68, 12.12], KIR: [-157.36, 1.87], KNA: [-62.78, 17.35], LCA: [-60.98, 13.91],
    MDV: [73.22, 3.2], MHL: [171.2, 7.1], MLT: [14.38, 35.94], MUS: [57.55, -20.25],
    NRU: [166.93, -0.52], PLW: [134.57, 7.51], SGP: [103.82, 1.35], STP: [6.61, 0.19],
    SYC: [55.45, -4.62], TON: [-175.2, -21.18], TUV: [179.2, -8.52], VCT: [-61.2, 13.25],
    WSM: [-172.1, -13.76],
  };

  const COPY = {
    ru: {
      loadingTitle: "Открываем глобальную картину риска",
      loadingText: "Проверяем официальный выпуск 2025, гармонизированный ряд 2000–2025 и 193 страновых профиля.",
      errorTitle: "Рабочее пространство WorldRiskIndex недоступно",
      retry: "Повторить",
      kicker: "Экология и устойчивость · риск бедствий",
      title: "Всемирный индекс риска 2025",
      lead: "Сопоставление природной подверженности и общественной уязвимости: где экстремальные события с наибольшей вероятностью превращаются в бедствия.",
      edition: "Выпуск 2025",
      coverage: "193 страны · 2000–2025",
      provider: "Bündnis Entwicklung Hilft × IFHV",
      verified: "целостность snapshot проверена",
      apiMode: "FastAPI · официальный snapshot",
      staticMode: "Проверенная статическая копия",
      country: "Страна",
      year: "Год",
      copyLink: "Копировать ссылку",
      copied: "Ссылка на профиль скопирована",
      dataPassport: "Паспорт данных",
      selectedCountry: "Выбранная страна",
      worldRisk: "WorldRiskIndex",
      globalPosition: "Позиция в таблице",
      regionRank: "Место в регионе",
      change1y: "Изменение за год",
      change5y: "Изменение за 5 лет",
      changeSince: "Изменение с 2000",
      higherWorse: "выше = больший риск",
      sourceOrder: "позиция в опубликованном порядке",
      derivedRank: "место рассчитано GIR",
      jumpProfile: "Профиль",
      jumpTrend: "Динамика",
      jumpMatrix: "Матрица",
      jumpMap: "Карта",
      jumpCompare: "Сравнение",
      jumpRanking: "Рейтинг",
      jumpMethod: "Методика",
      architectureKicker: "01 · Архитектура риска",
      architectureTitle: "Риск возникает там, где угрозы встречают уязвимое общество",
      architectureText: "Итоговый индекс — геометрическое среднее подверженности и уязвимости. Уязвимость объединяет восприимчивость, недостаток потенциала реагирования и адаптации.",
      exposure: "Подверженность",
      vulnerability: "Уязвимость",
      susceptibility: "Восприимчивость",
      coping: "Недостаток реагирования",
      adaptation: "Недостаток адаптации",
      formulaRisk: "W = √(E × V)",
      formulaVulnerability: "V = ∛(S × C × A)",
      valueCountry: "Значение страны",
      relativeBand: "Относительный диапазон",
      veryHigh: "Очень высокий",
      high: "Высокий",
      medium: "Средний",
      low: "Низкий",
      trendKicker: "02 · Динамика и профиль угроз",
      trendTitle: "Гармонизированный ряд без сшивания выпусков",
      trendText: "Все годы взяты из официального trend-файла, рассчитанного в единой структуре данных. GIR не объединяет отдельные исторические издания.",
      metric: "Показатель",
      selectedYear: "Выбранный год",
      startValue: "Начало ряда",
      endValue: "Конец ряда",
      totalChange: "Изменение за период",
      hazardProfile: "Профиль природных угроз",
      hazardNote: "Семь доменов подверженности входят в E через геометрическое среднее. Это не частоты событий, а нормированные компоненты индекса.",
      earthquakes: "Землетрясения",
      tsunamis: "Цунами",
      coastalFloods: "Прибрежные наводнения",
      riverFloods: "Речные наводнения",
      cyclones: "Тропические циклоны",
      droughts: "Засухи",
      seaLevel: "Повышение уровня моря",
      matrixKicker: "03 · Матрица риска",
      matrixTitle: "Подверженность × уязвимость",
      matrixText: "Каждая точка — государство. Медианы выбранной совокупности формируют четыре диагностических квадранта.",
      region: "Регион",
      allRegions: "Все регионы",
      lowerExposureLowerVulnerability: "Ниже подверженность / ниже уязвимость",
      higherExposureLowerVulnerability: "Выше подверженность / ниже уязвимость",
      lowerExposureHigherVulnerability: "Ниже подверженность / выше уязвимость",
      higherExposureHigherVulnerability: "Выше подверженность / выше уязвимость",
      resilienceZone: "Относительно благоприятный профиль",
      exposurePriority: "Приоритет снижения подверженности",
      capacityPriority: "Приоритет укрепления потенциала",
      compoundPriority: "Составной высокий риск",
      countries: "стран",
      medians: "Медианы выборки",
      mapKicker: "04 · География риска",
      mapTitle: "Мировая карта WorldRiskIndex",
      mapText: "Переключайте итоговый индекс и его компоненты. Геометрия используется только для визуализации и не влияет на значения.",
      mapMetric: "Показатель карты",
      mappedCountries: "Стран в наборе",
      mapTable: "Табличный эквивалент карты",
      lower: "ниже",
      higher: "выше",
      noData: "нет данных",
      markerOnly: "маркер без полигона",
      compareKicker: "05 · Сравнение стран",
      compareTitle: "Шесть осей риска в одном срезе",
      compareText: "Сравните до четырёх стран по W, E, V, S, C и A. Все значения относятся к одному году официального ряда.",
      addCountry: "Добавить страну",
      add: "Добавить",
      remove: "Убрать",
      compareLimit: "Можно сравнивать до четырёх стран.",
      regionalBenchmarks: "Региональные ориентиры",
      regionMean: "Среднее",
      regionMedian: "Медиана",
      regionMaximum: "Максимум",
      rankingKicker: "06 · Полная страновая таблица",
      rankingTitle: "Рейтинг любого агрегированного компонента",
      rankingText: "Для W в 2025 году сохраняется позиция строки официальной книги. Для других лет и компонентов используется прозрачно маркированный competition ranking GIR.",
      search: "Поиск",
      component: "Компонент",
      rows: "Строк",
      exportCsv: "Экспорт CSV",
      place: "Место",
      countryColumn: "Страна",
      regionColumn: "Регион",
      scoreColumn: "Значение",
      changeColumn: "Δ 5 лет",
      riskBand: "Диапазон",
      action: "Действие",
      open: "Открыть",
      noRows: "По выбранным фильтрам ничего не найдено.",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      of: "из",
      records: "записей",
      rankingNote2025: "В официальной книге нет отдельного столбца rank: показана позиция строки в опубликованной таблице. При равных округлённых баллах соседние позиции могут различаться.",
      rankingNoteDerived: "Competition ranking GIR сохраняет ничьи как 1, 2, 2, 4 и всегда обозначается как производный.",
      methodKicker: "07 · Методика и доказательства",
      methodTitle: "149 узлов и 100 показателей в открытом дереве",
      methodText: "Метаданные источников, формулы, единицы измерения и прямые нормированные значения доступны на уровне показателей. Пропуски остаются null.",
      hierarchyNodes: "Узлов дерева",
      aggregateNodes: "Агрегатов с рядами",
      indicatorMetadata: "Показателей",
      directValues: "С прямыми значениями",
      methodologyTree: "Дерево агрегатов",
      indicatorCatalogue: "Каталог показателей",
      indicatorSearch: "Поиск показателя",
      normalized: "Нормированное",
      baseValue: "Исходное",
      sourceYear: "Год источника",
      apiDetail: "деталь загружена из API",
      staticSample: "полная деталь из проверенного fallback",
      detailUnavailable: "Детальные показатели для выбранного среза отсутствуют в официальном источнике.",
      comparabilityTitle: "Сопоставимость",
      comparabilityText: "Используется официальный гармонизированный файл 2000–2025. Отдельные ежегодные выпуски не сшиваются, а значения GIR не пересчитываются.",
      rankSemanticsTitle: "Семантика места",
      rankSemanticsText: "Опубликованная позиция 2025 и производное место GIR хранятся раздельно. Итоговый балл не восстанавливается из места.",
      licenseTitle: "Лицензия",
      licenseText: "Данные доступны по CC BY 4.0: коммерческое использование и производные материалы разрешены при сохранении атрибуции.",
      evidenceKicker: "WORLDRISKINDEX 2025 · PROVENANCE",
      evidenceTitle: "Паспорт официального набора",
      close: "Закрыть",
      dataset: "Набор данных",
      publicationDate: "Дата публикации",
      coverageLabel: "Покрытие",
      checksum: "SHA‑256 набора",
      staticChecksum: "SHA‑256 frontend snapshot",
      activeProvider: "Активный провайдер",
      owner: "Правообладатели",
      rawFiles: "Официальные исходные файлы",
      derivedFiles: "Производные файлы GIR",
      scientificContract: "Научный контракт",
      scoresNotRecomputed: "Значения не пересчитаны",
      noSplice: "Выпуски не сшиты",
      noZeroFill: "Пропуски не заменены нулём",
      orderPreserved: "Опубликованный порядок 2025 сохранён",
      regionsUnofficial: "Регионы GIR — локализация, не категории WorldRiskIndex",
      copy: "Копировать",
      copiedHash: "SHA‑256 скопирован",
      yes: "да",
      no: "нет",
    },
    en: {
      loadingTitle: "Opening the global risk picture",
      loadingText: "Validating the 2025 edition, the harmonized 2000–2025 panel and 193 country profiles.",
      errorTitle: "The WorldRiskIndex workspace is unavailable",
      retry: "Retry",
      kicker: "Environment & sustainability · disaster risk",
      title: "WorldRiskIndex 2025",
      lead: "A comparison of natural-hazard exposure and societal vulnerability: where extreme events are most likely to become disasters.",
      edition: "2025 edition",
      coverage: "193 countries · 2000–2025",
      provider: "Bündnis Entwicklung Hilft × IFHV",
      verified: "snapshot integrity verified",
      apiMode: "FastAPI · official snapshot",
      staticMode: "Verified static copy",
      country: "Country",
      year: "Year",
      copyLink: "Copy link",
      copied: "Profile link copied",
      dataPassport: "Data passport",
      selectedCountry: "Selected country",
      worldRisk: "WorldRiskIndex",
      globalPosition: "Published-table position",
      regionRank: "Regional rank",
      change1y: "One-year change",
      change5y: "Five-year change",
      changeSince: "Change since 2000",
      higherWorse: "higher = greater risk",
      sourceOrder: "position in published order",
      derivedRank: "rank derived by GIR",
      jumpProfile: "Profile",
      jumpTrend: "Trend",
      jumpMatrix: "Matrix",
      jumpMap: "Map",
      jumpCompare: "Compare",
      jumpRanking: "Ranking",
      jumpMethod: "Method",
      architectureKicker: "01 · Risk architecture",
      architectureTitle: "Risk emerges where hazards meet a vulnerable society",
      architectureText: "The headline index is the geometric mean of exposure and vulnerability. Vulnerability combines susceptibility and deficits in coping and adaptive capacities.",
      exposure: "Exposure",
      vulnerability: "Vulnerability",
      susceptibility: "Susceptibility",
      coping: "Lack of coping capacity",
      adaptation: "Lack of adaptive capacity",
      formulaRisk: "W = √(E × V)",
      formulaVulnerability: "V = ∛(S × C × A)",
      valueCountry: "Country value",
      relativeBand: "Relative band",
      veryHigh: "Very high",
      high: "High",
      medium: "Medium",
      low: "Low",
      trendKicker: "02 · Trend and hazard profile",
      trendTitle: "A harmonized panel without edition splicing",
      trendText: "Every year comes from the official trend file built in one data structure. GIR does not merge separate historical editions.",
      metric: "Metric",
      selectedYear: "Selected year",
      startValue: "Start value",
      endValue: "End value",
      totalChange: "Period change",
      hazardProfile: "Natural-hazard profile",
      hazardNote: "Seven exposure domains enter E through a geometric mean. They are normalized index components, not event frequencies.",
      earthquakes: "Earthquakes",
      tsunamis: "Tsunamis",
      coastalFloods: "Coastal flooding",
      riverFloods: "Riverine flooding",
      cyclones: "Cyclones",
      droughts: "Droughts",
      seaLevel: "Sea-level rise",
      matrixKicker: "03 · Risk matrix",
      matrixTitle: "Exposure × vulnerability",
      matrixText: "Each point is a country. Medians of the selected universe create four diagnostic quadrants.",
      region: "Region",
      allRegions: "All regions",
      lowerExposureLowerVulnerability: "Lower exposure / lower vulnerability",
      higherExposureLowerVulnerability: "Higher exposure / lower vulnerability",
      lowerExposureHigherVulnerability: "Lower exposure / higher vulnerability",
      higherExposureHigherVulnerability: "Higher exposure / higher vulnerability",
      resilienceZone: "Relatively favourable profile",
      exposurePriority: "Exposure-reduction priority",
      capacityPriority: "Capacity-building priority",
      compoundPriority: "Compound high risk",
      countries: "countries",
      medians: "Sample medians",
      mapKicker: "04 · Risk geography",
      mapTitle: "WorldRiskIndex world map",
      mapText: "Switch between the headline index and its components. Geometry is visual only and never changes values.",
      mapMetric: "Map metric",
      mappedCountries: "Countries in dataset",
      mapTable: "Tabular map equivalent",
      lower: "lower",
      higher: "higher",
      noData: "no data",
      markerOnly: "marker without polygon",
      compareKicker: "05 · Country comparison",
      compareTitle: "Six risk axes in one cross-section",
      compareText: "Compare up to four countries across W, E, V, S, C and A. Every value belongs to one year of the official panel.",
      addCountry: "Add country",
      add: "Add",
      remove: "Remove",
      compareLimit: "Up to four countries can be compared.",
      regionalBenchmarks: "Regional benchmarks",
      regionMean: "Mean",
      regionMedian: "Median",
      regionMaximum: "Maximum",
      rankingKicker: "06 · Full country table",
      rankingTitle: "Ranking for every aggregate component",
      rankingText: "For W in 2025 the source workbook row position is preserved. Other years and components use a transparently labelled GIR competition rank.",
      search: "Search",
      component: "Component",
      rows: "Rows",
      exportCsv: "Export CSV",
      place: "Rank",
      countryColumn: "Country",
      regionColumn: "Region",
      scoreColumn: "Value",
      changeColumn: "5y Δ",
      riskBand: "Band",
      action: "Action",
      open: "Open",
      noRows: "No rows match the selected filters.",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      records: "records",
      rankingNote2025: "The official workbook has no explicit rank column: this is the row position in the published table. Equal rounded scores may occupy adjacent positions.",
      rankingNoteDerived: "GIR competition ranking preserves ties as 1, 2, 2, 4 and is always labelled as derived.",
      methodKicker: "07 · Method and evidence",
      methodTitle: "149 nodes and 100 indicators in an open tree",
      methodText: "Source metadata, formulas, units and direct normalized values are exposed at indicator level. Missing observations remain null.",
      hierarchyNodes: "Hierarchy nodes",
      aggregateNodes: "Aggregates with series",
      indicatorMetadata: "Indicators",
      directValues: "With direct values",
      methodologyTree: "Aggregate tree",
      indicatorCatalogue: "Indicator catalogue",
      indicatorSearch: "Search indicators",
      normalized: "Normalized",
      baseValue: "Base value",
      sourceYear: "Source year",
      apiDetail: "detail loaded from API",
      staticSample: "complete detail from verified fallback",
      detailUnavailable: "Indicator detail for the selected slice is absent from the official source.",
      comparabilityTitle: "Comparability",
      comparabilityText: "The official harmonized 2000–2025 file is used. Separate annual editions are not spliced and GIR does not recompute values.",
      rankSemanticsTitle: "Rank semantics",
      rankSemanticsText: "The 2025 published position and the derived GIR rank are stored separately. The headline score is never reconstructed from rank.",
      licenseTitle: "License",
      licenseText: "Data are available under CC BY 4.0: commercial use and derivative works are allowed with attribution.",
      evidenceKicker: "WORLDRISKINDEX 2025 · PROVENANCE",
      evidenceTitle: "Official dataset passport",
      close: "Close",
      dataset: "Dataset",
      publicationDate: "Publication date",
      coverageLabel: "Coverage",
      checksum: "Dataset SHA‑256",
      staticChecksum: "Frontend snapshot SHA‑256",
      activeProvider: "Active provider",
      owner: "Owners",
      rawFiles: "Official raw files",
      derivedFiles: "GIR-derived files",
      scientificContract: "Scientific contract",
      scoresNotRecomputed: "Values not recomputed",
      noSplice: "Editions not spliced",
      noZeroFill: "Missing values not zero-filled",
      orderPreserved: "Published 2025 order preserved",
      regionsUnofficial: "GIR regions are localization metadata, not WorldRiskIndex categories",
      copy: "Copy",
      copiedHash: "SHA‑256 copied",
      yes: "yes",
      no: "no",
    },
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    country: "",
    year: 2025,
    metric: "W",
    trendMetric: "W",
    mapMetric: "W",
    matrixRegion: "",
    rankingRegion: "",
    rankingQuery: "",
    rankingMetric: "W",
    page: 1,
    pageSize: 25,
    compare: ["RUS", "PHL", "IND", "DEU"],
    indicatorQuery: "",
    indicatorGroup: "all",
    provider: "static",
    bundle: null,
    geo: null,
    context: {},
    detail: null,
    detailMode: "none",
    dialogReturn: null,
    initializedFromUrl: false,
  };

  const cache = { bundlePromise: null, geoPromise: null, detail: new Map(), indicatorYears: new Map() };
  const tr = (key) => COPY[state.lang]?.[key] || COPY.ru[key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const num = (value) => value == null || value === "" || Number.isNaN(Number(value)) ? null : Number(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const locale = () => state.lang === "ru" ? "ru-RU" : "en-US";
  const fmt = (value, digits = 2) => num(value) == null ? "—" : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signed = (value, digits = 2) => num(value) == null ? "—" : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;
  const mean = (values) => { const data = values.map(Number).filter(Number.isFinite); return data.length ? data.reduce((sum, value) => sum + value, 0) / data.length : null; };
  const median = (values) => { const data = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b); if (!data.length) return null; const middle = Math.floor(data.length / 2); return data.length % 2 ? data[middle] : (data[middle - 1] + data[middle]) / 2; };
  const debounce = (fn, delay = 180) => { let timer = null; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };

  function componentName(code) {
    const component = state.bundle?.componentMap.get(code);
    if (!component) return code;
    return state.lang === "ru" ? component.name_ru : component.name_en;
  }
  function countryName(country) { return state.lang === "ru" ? country.country_name_ru : country.country_name_en; }
  function countryByIso(iso3) { return state.bundle?.countryMap.get(String(iso3 || "").toUpperCase()) || null; }
  function countryOptions(selected = state.country, omit = []) {
    const blocked = new Set(omit);
    return (state.bundle?.countries || []).filter((item) => !blocked.has(item.iso3)).sort((a, b) => countryName(a).localeCompare(countryName(b), locale())).map((item) => `<option value="${item.iso3}" ${item.iso3 === selected ? "selected" : ""}>${esc(countryName(item))} · ${item.iso3}</option>`).join("");
  }
  function componentOptions(selected, aggregateOnly = true) {
    const items = aggregateOnly ? state.bundle.aggregateComponents : state.bundle.components.items;
    return items.map((item) => `<option value="${item.code}" ${item.code === selected ? "selected" : ""}>${esc(item.code)} · ${esc(state.lang === "ru" ? item.name_ru : item.name_en)}</option>`).join("");
  }
  function regionOptions(selected = "") {
    return `<option value="">${esc(tr("allRegions"))}</option>${state.bundle.regions.map((item) => `<option value="${esc(item.region_en)}" ${item.region_en === selected ? "selected" : ""}>${esc(state.lang === "ru" ? item.region_ru : item.region_en)}</option>`).join("")}`;
  }
  function yearOptions(selected = state.year) { return state.bundle.years.years.slice().reverse().map((year) => `<option value="${year}" ${Number(year) === Number(selected) ? "selected" : ""}>${year}</option>`).join(""); }
  function field(label, control, cls = "") { return `<label class="wri-field ${cls}"><span>${esc(label)}</span>${control}</label>`; }
  function button(label, action, cls = "", attrs = "") { return `<button type="button" class="wri-button ${cls}" data-wri-action="${action}" ${attrs}>${esc(label)}</button>`; }
  function sectionHeading(kicker, title, text, actions = "") { return `<header class="wri-section-heading"><div><p class="wri-section-kicker">${esc(kicker)}</p><h2>${esc(title)}</h2></div>${actions ? `<div class="wri-section-actions">${actions}</div>` : `<p>${esc(text)}</p>`}${actions && text ? `<p style="grid-column:1/-1">${esc(text)}</p>` : ""}</header>`; }

  async function sha256Hex(buffer) {
    if (!globalThis.crypto?.subtle) return null;
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { credentials: "same-origin", ...options });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText || "request failed"}: ${url}`);
    return response.json();
  }
  async function fetchWithTimeout(url, timeout = 1800) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try { return await fetchJson(url, { signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  function decodeCore(core, manifest) {
    const componentMap = new Map(core.components.items.map((item) => [item.code, item]));
    const countryMap = new Map(core.countries.map((item) => [item.iso3, item]));
    const codeIndex = new Map(core.component_codes.map((code, index) => [code, index]));
    const recordMap = new Map();
    core.records.forEach(([year, iso3, values]) => recordMap.set(`${year}|${iso3}`, values));
    const regions = [];
    const seenRegions = new Set();
    core.countries.forEach((country) => {
      if (!seenRegions.has(country.region_en)) {
        seenRegions.add(country.region_en);
        regions.push({ region_en: country.region_en, region_ru: country.region_ru });
      }
    });
    regions.sort((a, b) => (state.lang === "ru" ? a.region_ru : a.region_en).localeCompare(state.lang === "ru" ? b.region_ru : b.region_en, locale()));
    return {
      ...core,
      manifest,
      componentMap,
      countryMap,
      codeIndex,
      recordMap,
      regions,
      aggregateComponents: core.components.items.filter((item) => item.aggregate_score_available),
    };
  }

  async function loadBundle() {
    if (!cache.bundlePromise) {
      cache.bundlePromise = (async () => {
        const manifest = await fetchJson(STATIC_MANIFEST);
        const response = await fetch(STATIC_CORE, { credentials: "same-origin" });
        if (!response.ok) throw new Error(`${response.status}: ${STATIC_CORE}`);
        const buffer = await response.arrayBuffer();
        const hash = await sha256Hex(buffer);
        if (hash && manifest.core_sha256 && hash !== manifest.core_sha256) throw new Error("WorldRisk frontend snapshot checksum mismatch");
        const text = new TextDecoder("utf-8").decode(buffer);
        const core = JSON.parse(text);
        if (core.dataset_id !== manifest.dataset_id || core.dataset_sha256 !== manifest.dataset_sha256) throw new Error("WorldRisk frontend manifest does not match the dataset");
        const bundle = decodeCore(core, manifest);
        try {
          const health = await fetchWithTimeout(`${API}/health`, 1600);
          if (health?.dataset_id === core.dataset_id || health?.status === "ok") state.provider = "api";
        } catch (_) { state.provider = "static"; }
        return bundle;
      })().catch((error) => { cache.bundlePromise = null; throw error; });
    }
    return cache.bundlePromise;
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

  function value(year, iso3, code) {
    const record = state.bundle?.recordMap.get(`${Number(year)}|${String(iso3).toUpperCase()}`);
    const index = state.bundle?.codeIndex.get(code);
    return record && index != null ? num(record[index]) : null;
  }
  function row(year, iso3) {
    const country = countryByIso(iso3);
    if (!country) return null;
    const values = Object.fromEntries(HEADLINE.map((code) => [code, value(year, country.iso3, code)]));
    return { ...country, year: Number(year), values };
  }
  function change(year, iso3, code, lag) {
    const current = value(year, iso3, code);
    const previous = value(Number(year) - lag, iso3, code);
    return current == null || previous == null ? null : current - previous;
  }
  function competitionRanks(year, code, countries = state.bundle.countries) {
    const sorted = countries.map((country) => ({ iso3: country.iso3, score: value(year, country.iso3, code) })).filter((item) => item.score != null).sort((a, b) => b.score - a.score || a.iso3.localeCompare(b.iso3));
    const map = new Map(); let prior = null; let priorRank = 0;
    sorted.forEach((item, index) => { const rank = prior != null && item.score === prior ? priorRank : index + 1; map.set(item.iso3, rank); prior = item.score; priorRank = rank; });
    return map;
  }
  function rankingRows(year = state.year, code = state.rankingMetric, region = state.rankingRegion, query = state.rankingQuery) {
    const needle = String(query || "").trim().toLocaleLowerCase(locale());
    const universe = state.bundle.countries.filter((country) => !region || country.region_en === region);
    const globalRanks = competitionRanks(year, code, state.bundle.countries);
    const regionRanks = new Map();
    state.bundle.regions.forEach((item) => {
      const regionalCountries = state.bundle.countries.filter((country) => country.region_en === item.region_en);
      regionRanks.set(item.region_en, competitionRanks(year, code, regionalCountries));
    });
    const count = state.bundle.countries.length;
    const rows = universe.map((country) => {
      const score = value(year, country.iso3, code);
      const derivedRank = globalRanks.get(country.iso3);
      const publishedPosition = Number(year) === 2025 && code === "W" ? state.bundle.published_positions_2025[country.iso3] : null;
      const displayRank = publishedPosition || derivedRank;
      const percentile = derivedRank ? 100 * (count - derivedRank + 1) / count : null;
      return {
        ...country, score, derivedRank, publishedPosition, displayRank,
        regionRank: regionRanks.get(country.region_en)?.get(country.iso3) || null,
        percentile,
        change1y: change(year, country.iso3, code, 1),
        change5y: change(year, country.iso3, code, 5),
        riskClass: percentile >= 80 ? "very-high" : percentile >= 60 ? "high" : percentile >= 40 ? "medium" : "low",
      };
    }).filter((item) => item.score != null && (!needle || [item.iso3, item.country_name_en, item.country_name_ru, item.source_name_en].some((text) => String(text || "").toLocaleLowerCase(locale()).includes(needle))));
    rows.sort((a, b) => a.displayRank - b.displayRank || a.iso3.localeCompare(b.iso3));
    return rows;
  }
  function selectedRanking() { return rankingRows(state.year, "W", "", "").find((item) => item.iso3 === state.country); }
  function riskLabel(cls) { return ({ "very-high": tr("veryHigh"), high: tr("high"), medium: tr("medium"), low: tr("low") })[cls] || cls; }

  async function loadIndicatorYear(year) {
    const selectedYear = Number(year);
    if (cache.indicatorYears.has(selectedYear)) return cache.indicatorYears.get(selectedYear);
    const meta = state.bundle?.manifest?.indicator_year_files?.[String(selectedYear)];
    if (!meta?.path) return null;
    const promise = (async () => {
      const url = `${STATIC_INDICATOR_ROOT}${String(meta.path).replace(/^\/+/, "")}`;
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`${response.status}: ${url}`);
      const buffer = await response.arrayBuffer();
      const hash = await sha256Hex(buffer);
      if (hash && meta.sha256 && hash !== meta.sha256) throw new Error(`WorldRisk indicator snapshot checksum mismatch for ${selectedYear}`);
      const payload = JSON.parse(new TextDecoder("utf-8").decode(buffer));
      if (payload.dataset_id !== state.bundle.dataset_id || payload.dataset_sha256 !== state.bundle.dataset_sha256 || Number(payload.year) !== selectedYear) {
        throw new Error(`WorldRisk indicator snapshot contract mismatch for ${selectedYear}`);
      }
      const expectedCodes = state.bundle.indicator_fallback?.indicator_codes || [];
      if (expectedCodes.length && JSON.stringify(payload.indicator_codes) !== JSON.stringify(expectedCodes)) {
        throw new Error(`WorldRisk indicator code order mismatch for ${selectedYear}`);
      }
      return { ...payload, recordMap: new Map(payload.records.map(([iso3, values]) => [iso3, values])) };
    })().catch((error) => { cache.indicatorYears.delete(selectedYear); throw error; });
    cache.indicatorYears.set(selectedYear, promise);
    return promise;
  }

  function detailFromStaticYear(payload, iso3) {
    const country = countryByIso(iso3);
    const values = payload?.recordMap?.get(String(iso3).toUpperCase());
    if (!country || !values) return null;
    const items = payload.indicator_codes.map((code, index) => {
      const component = state.bundle.componentMap.get(code) || { code };
      return {
        ...component,
        normalized_value: values[index * 2] ?? null,
        base_value: values[index * 2 + 1] ?? null,
        direct_value_published: Boolean(component.indicator_values_available),
      };
    });
    return {
      year: Number(payload.year),
      country: { ...country },
      total: items.length,
      direct_values: items.filter((item) => item.direct_value_published).length,
      metadata_only: items.filter((item) => !item.direct_value_published).length,
      items,
      missing_values_are_null: true,
      _mode: "static",
    };
  }

  async function loadDetail() {
    const key = `${state.year}|${state.country}`;
    if (cache.detail.has(key)) { state.detail = cache.detail.get(key); state.detailMode = state.detail?._mode || "none"; return; }
    let detail = null;
    if (state.provider === "api") {
      try { detail = await fetchWithTimeout(`${API}/countries/${state.country}/indicators?year=${state.year}`, 3000); if (detail) detail._mode = "api"; }
      catch (_) { detail = null; }
    }
    if (!detail) {
      try { detail = detailFromStaticYear(await loadIndicatorYear(state.year), state.country); }
      catch (_) { detail = null; }
    }
    if (!detail && Number(state.year) === 2025 && state.bundle.indicator_samples?.[state.country]) {
      detail = { ...state.bundle.indicator_samples[state.country], _mode: "static" };
    }
    cache.detail.set(key, detail);
    state.detail = detail;
    state.detailMode = detail?._mode || "none";
  }

  function parseUrlState() {
    if (state.initializedFromUrl) return;
    state.initializedFromUrl = true;
    const params = new URLSearchParams(location.search);
    const country = String(params.get("country") || state.country).toUpperCase();
    const year = Number(params.get("wri_year") || params.get("year") || state.year);
    const metric = String(params.get("wri_metric") || state.metric).toUpperCase();
    const compare = String(params.get("wri_compare") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    if (countryByIso(country)) state.country = country;
    if (state.bundle.years.years.includes(year)) state.year = year;
    if (state.bundle.codeIndex.has(metric)) state.metric = state.trendMetric = state.mapMetric = state.rankingMetric = metric;
    if (compare.length >= 2) state.compare = Array.from(new Set(compare.filter((iso3) => countryByIso(iso3)))).slice(0, 4);
  }
  function updateUrl() {
    try {
      const url = new URL(location.href);
      url.searchParams.set("index", "WORLD_RISK_INDEX");
      url.searchParams.set("country", state.country);
      url.searchParams.set("wri_year", state.year);
      url.searchParams.set("wri_metric", state.metric);
      url.searchParams.set("wri_compare", state.compare.join(","));
      url.hash = "index-WORLD_RISK_INDEX";
      history.replaceState(null, "", url);
    } catch (_) { /* embedded preview */ }
  }
  function notice(message) { (state.context.onNotice || state.context.showToast || (() => {}))(message); }

  function loadingMarkup() {
    return `<section class="wri-loading"><div><p class="wri-kicker">WorldRiskIndex 2025</p><strong>${esc(tr("loadingTitle"))}</strong><p>${esc(tr("loadingText"))}</p><div class="wri-loading-bars" aria-hidden="true"><i></i><i></i><i></i></div></div></section>`;
  }
  function errorMarkup(error) {
    return `<section class="wri-error"><div><p class="wri-kicker">WorldRiskIndex 2025</p><strong>${esc(tr("errorTitle"))}</strong><p>${esc(error?.message || String(error))}</p>${button(tr("retry"), "retry", "primary")}</div></section>`;
  }

  function heroMarkup() {
    const country = countryByIso(state.country);
    const rank = selectedRanking();
    const score = value(state.year, state.country, "W");
    const change1 = change(state.year, state.country, "W", 1);
    const change5 = change(state.year, state.country, "W", 5);
    const changeAll = score == null ? null : score - value(state.bundle.years.first_year, state.country, "W");
    const providerLabel = state.provider === "api" ? tr("apiMode") : tr("staticMode");
    const rankNote = Number(state.year) === 2025 ? tr("sourceOrder") : tr("derivedRank");
    return `<section class="wri-hero" id="wri-profile">
      <article class="wri-hero-copy card"><p class="wri-kicker">${esc(tr("kicker"))}</p><div class="wri-title-row"><h1>${esc(tr("title"))}</h1><span class="wri-edition">${esc(tr("edition"))}</span></div><p class="wri-lead">${esc(tr("lead"))}</p><div class="wri-source-line"><span><i></i>${esc(tr("provider"))}</span><span>${esc(tr("coverage"))}</span><span>${esc(tr("verified"))}</span></div><div class="wri-controls">${field(tr("country"), `<select class="select" id="wriCountry">${countryOptions()}</select>`)}${field(tr("year"), `<select class="select" id="wriYear">${yearOptions()}</select>`)}${button(tr("copyLink"), "copy-link")}${button(tr("dataPassport"), "evidence", "primary")}</div></article>
      <article class="wri-country-card card"><header class="wri-country-head"><div class="wri-country-id"><span class="wri-country-code">${esc(country.iso3)}</span><span><small>${esc(tr("selectedCountry"))}</small><strong>${esc(countryName(country))}</strong></span></div><span class="wri-provider"><i></i>${esc(providerLabel)}</span></header><div class="wri-score-layout"><div class="wri-score-main"><span>${esc(tr("worldRisk"))}</span><strong>${fmt(score,2)}</strong><small>${esc(state.year)} · ${esc(tr("higherWorse"))}</small></div><div class="wri-score-grid"><div><span>${esc(tr("globalPosition"))}</span><b>#${rank?.displayRank ?? "—"}</b><small>${esc(rankNote)}</small></div><div><span>${esc(tr("regionRank"))}</span><b>#${rank?.regionRank ?? "—"}</b><small>${esc(state.lang === "ru" ? country.region_ru : country.region_en)}</small></div><div><span>${esc(tr("change1y"))}</span><b class="${num(change1) <= 0 ? "positive" : "negative"}">${signed(change1,2)}</b><small>${esc(state.year - 1)} → ${esc(state.year)}</small></div><div><span>${esc(tr("change5y"))}</span><b class="${num(change5) <= 0 ? "positive" : "negative"}">${signed(change5,2)}</b><small>${esc(state.year - 5)} → ${esc(state.year)}</small></div></div></div><div class="wri-rank-note">${esc(Number(state.year) === 2025 ? tr("rankingNote2025") : tr("rankingNoteDerived"))} · ${esc(tr("changeSince"))}: ${signed(changeAll,2)}.</div></article>
    </section>`;
  }

  function jumpMarkup() {
    return `<nav class="wri-jumpbar" aria-label="WorldRiskIndex sections"><a href="#wri-profile">${esc(tr("jumpProfile"))}</a><a href="#wri-trend">${esc(tr("jumpTrend"))}</a><a href="#wri-matrix">${esc(tr("jumpMatrix"))}</a><a href="#wri-map">${esc(tr("jumpMap"))}</a><a href="#wri-compare">${esc(tr("jumpCompare"))}</a><a href="#wri-ranking">${esc(tr("jumpRanking"))}</a><a href="#wri-method">${esc(tr("jumpMethod"))}</a><strong>${esc(state.provider === "api" ? tr("apiMode") : tr("staticMode"))}</strong></nav>`;
  }

  function componentCard(code) {
    const score = value(state.year, state.country, code);
    const rank = rankingRows(state.year, code, "", "").find((item) => item.iso3 === state.country);
    const label = componentName(code);
    const width = clamp(score || 0, 0, 100);
    return `<article class="wri-component-card ${state.metric === code ? "is-active" : ""}" tabindex="0" role="button" data-wri-action="metric" data-metric="${code}" aria-pressed="${state.metric === code}"><header><span class="wri-component-code">${code}</span><small>#${rank?.displayRank ?? "—"}</small></header><strong>${fmt(score,2)}</strong><b>${esc(label)}</b><p>${esc(code === "W" && Number(state.year) === 2025 ? tr("sourceOrder") : tr("derivedRank"))}</p><div class="wri-meter"><i style="width:${width}%"></i></div></article>`;
  }
  function architectureMarkup() {
    return `<section class="wri-section" id="wri-architecture">${sectionHeading(tr("architectureKicker"), tr("architectureTitle"), tr("architectureText"))}<div class="wri-formula-strip"><article class="wri-formula-card"><span>${esc(tr("exposure"))}</span><strong>E · ${fmt(value(state.year,state.country,"E"),2)}</strong><p>${esc(tr("hazardProfile"))}: 7 ${esc(tr("countries")) === "countries" ? "hazard domains" : "доменов угроз"}</p></article><div class="wri-formula-operator">×</div><article class="wri-formula-card"><span>${esc(tr("vulnerability"))}</span><strong>V · ${fmt(value(state.year,state.country,"V"),2)}</strong><p>${esc(tr("formulaVulnerability"))}</p></article><div class="wri-formula-operator">→</div><article class="wri-formula-result"><span>${esc(tr("worldRisk"))}</span><strong>${esc(tr("formulaRisk"))} = ${fmt(value(state.year,state.country,"W"),2)}</strong><p>${esc(tr("higherWorse"))}</p></article></div><div class="wri-components-grid">${HEADLINE.map(componentCard).join("")}</div></section>`;
  }

  function trendSeries(code = state.trendMetric) { return state.bundle.years.years.map((year) => ({ year, score: value(year, state.country, code) })).filter((item) => item.score != null); }
  function trendChartMarkup() {
    const values = trendSeries();
    if (!values.length) return `<div class="wri-empty">${esc(tr("noData"))}</div>`;
    const width = 820, height = 360, margin = { left: 58, right: 22, top: 24, bottom: 43 };
    const scores = values.map((item) => item.score);
    let min = Math.min(...scores), max = Math.max(...scores); const padding = Math.max(1, (max - min) * .18); min = Math.max(0, min - padding); max += padding;
    const x = (year) => margin.left + (year - values[0].year) / (values.at(-1).year - values[0].year || 1) * (width - margin.left - margin.right);
    const y = (score) => margin.top + (max - score) / (max - min || 1) * (height - margin.top - margin.bottom);
    const line = values.map((item, index) => `${index ? "L" : "M"}${x(item.year).toFixed(2)},${y(item.score).toFixed(2)}`).join(" ");
    const area = `${line} L${x(values.at(-1).year).toFixed(2)},${height-margin.bottom} L${x(values[0].year).toFixed(2)},${height-margin.bottom} Z`;
    const yTicks = Array.from({ length: 5 }, (_, index) => min + (max - min) * index / 4);
    const xTicks = values.filter((item, index) => index % 5 === 0 || index === values.length - 1);
    const selectedX = x(state.year);
    return `<div class="wri-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("trendTitle"))}">${yTicks.map((tick) => `<line class="wri-grid-line" x1="${margin.left}" x2="${width-margin.right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="wri-axis-label" x="${margin.left-9}" y="${y(tick)+3}" text-anchor="end">${fmt(tick,1)}</text>`).join("")}${xTicks.map((item) => `<text class="wri-axis-label" x="${x(item.year)}" y="${height-17}" text-anchor="middle">${item.year}</text>`).join("")}<path class="wri-trend-area" d="${area}"/><path class="wri-trend-line" d="${line}"/><line class="wri-selected-rule" x1="${selectedX}" x2="${selectedX}" y1="${margin.top}" y2="${height-margin.bottom}"/>${values.map((item) => `<circle class="wri-trend-point" cx="${x(item.year)}" cy="${y(item.score)}" r="${item.year===state.year?5:3}"><title>${item.year} · ${fmt(item.score,2)}</title></circle>`).join("")}<text class="wri-axis-title" x="${width/2}" y="${height-2}" text-anchor="middle">${esc(componentName(state.trendMetric))}</text></svg></div>`;
  }
  function hazardMarkup() {
    const labels = { EI_01: "earthquakes", EI_02: "tsunamis", EI_03: "coastalFloods", EI_04: "riverFloods", EI_05: "cyclones", EI_06: "droughts", EI_07: "seaLevel" };
    return `<article class="wri-panel"><header class="wri-panel-head"><div><span>E · ${esc(tr("exposure"))}</span><h3>${esc(tr("hazardProfile"))}</h3></div><p>${esc(countryName(countryByIso(state.country)))} · ${state.year}</p></header><div class="wri-hazard-list">${HAZARDS.map((code) => { const score=value(state.year,state.country,code); return `<div class="wri-hazard-row"><div><header><strong>${esc(tr(labels[code]))}</strong><small>${code}</small></header><div class="wri-hazard-bar"><i style="width:${clamp(score||0,0,100)}%"></i></div></div><b>${fmt(score,2)}</b></div>`; }).join("")}</div><div class="wri-hazard-note">${esc(tr("hazardNote"))}</div></article>`;
  }
  function trendMarkup() {
    const series = trendSeries();
    const start = series[0], end = series.at(-1);
    const actions = field(tr("metric"), `<select class="select" id="wriTrendMetric">${componentOptions(state.trendMetric)}</select>`);
    return `<section class="wri-section" id="wri-trend">${sectionHeading(tr("trendKicker"),tr("trendTitle"),tr("trendText"),actions)}<div class="wri-analysis-grid"><article class="wri-panel"><header class="wri-panel-head"><div><span>${esc(componentName(state.trendMetric))}</span><h3>${esc(countryName(countryByIso(state.country)))} · ${state.bundle.years.first_year}–${state.bundle.years.last_year}</h3></div><p>${esc(tr("selectedYear"))}: ${state.year} · ${fmt(value(state.year,state.country,state.trendMetric),2)}</p></header>${trendChartMarkup()}<div class="wri-chart-legend"><span><i></i>${esc(componentName(state.trendMetric))}</span><span><i class="selected"></i>${esc(tr("selectedYear"))}: ${state.year}</span><span>${esc(tr("startValue"))}: ${fmt(start?.score,2)}</span><span>${esc(tr("endValue"))}: ${fmt(end?.score,2)}</span><span>${esc(tr("totalChange"))}: ${signed(end?.score-start?.score,2)}</span></div></article>${hazardMarkup()}</div></section>`;
  }

  function matrixRows() {
    return state.bundle.countries.filter((country) => !state.matrixRegion || country.region_en === state.matrixRegion).map((country) => ({ ...country, x:value(state.year,country.iso3,"E"), y:value(state.year,country.iso3,"V"), w:value(state.year,country.iso3,"W") })).filter((item) => item.x != null && item.y != null);
  }
  function matrixChartMarkup() {
    const rows = matrixRows(); if (!rows.length) return `<div class="wri-empty">${esc(tr("noRows"))}</div>`;
    const width=860,height=500,margin={left:60,right:25,top:27,bottom:52}; const xMed=median(rows.map((r)=>r.x)),yMed=median(rows.map((r)=>r.y));
    const xMax=Math.max(50,Math.ceil(Math.max(...rows.map((r)=>r.x))/10)*10), yMax=Math.max(60,Math.ceil(Math.max(...rows.map((r)=>r.y))/10)*10);
    const x=(v)=>margin.left+v/xMax*(width-margin.left-margin.right); const y=(v)=>height-margin.bottom-v/yMax*(height-margin.top-margin.bottom);
    const ticks=Array.from({length:6},(_,i)=>i/5);
    return `<div class="wri-matrix-visual"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("matrixTitle"))}">${ticks.map((t)=>`<line class="wri-grid-line" x1="${x(t*xMax)}" x2="${x(t*xMax)}" y1="${margin.top}" y2="${height-margin.bottom}"/><line class="wri-grid-line" x1="${margin.left}" x2="${width-margin.right}" y1="${y(t*yMax)}" y2="${y(t*yMax)}"/><text class="wri-axis-label" x="${x(t*xMax)}" y="${height-30}" text-anchor="middle">${fmt(t*xMax,0)}</text><text class="wri-axis-label" x="${margin.left-8}" y="${y(t*yMax)+3}" text-anchor="end">${fmt(t*yMax,0)}</text>`).join("")}<line class="wri-median-line" x1="${x(xMed)}" x2="${x(xMed)}" y1="${margin.top}" y2="${height-margin.bottom}"/><line class="wri-median-line" x1="${margin.left}" x2="${width-margin.right}" y1="${y(yMed)}" y2="${y(yMed)}"/><text class="wri-quadrant-label" x="${margin.left+10}" y="${margin.top+16}">${esc(tr("lowerExposureHigherVulnerability"))}</text><text class="wri-quadrant-label" x="${width-margin.right-10}" y="${margin.top+16}" text-anchor="end">${esc(tr("higherExposureHigherVulnerability"))}</text><text class="wri-quadrant-label" x="${margin.left+10}" y="${height-margin.bottom-10}">${esc(tr("lowerExposureLowerVulnerability"))}</text><text class="wri-quadrant-label" x="${width-margin.right-10}" y="${height-margin.bottom-10}" text-anchor="end">${esc(tr("higherExposureLowerVulnerability"))}</text>${rows.map((item)=>`<circle class="wri-matrix-point ${item.iso3===state.country?"is-selected":""}" cx="${x(item.x)}" cy="${y(item.y)}" r="${item.iso3===state.country?7:3.2}" tabindex="0" role="button" data-wri-action="country" data-iso="${item.iso3}"><title>${esc(countryName(item))} · E ${fmt(item.x,2)} · V ${fmt(item.y,2)} · W ${fmt(item.w,2)}</title></circle>`).join("")}<text class="wri-axis-title" x="${width/2}" y="${height-4}" text-anchor="middle">${esc(tr("exposure"))} →</text><text class="wri-axis-title" transform="translate(15 ${height/2}) rotate(-90)" text-anchor="middle">${esc(tr("vulnerability"))} →</text></svg></div>`;
  }
  function matrixMarkup() {
    const rows=matrixRows(),xMed=median(rows.map((r)=>r.x)),yMed=median(rows.map((r)=>r.y)); const counts={ll:0,hl:0,lh:0,hh:0};
    const selected=rows.find((r)=>r.iso3===state.country); let selectedQ="";
    rows.forEach((r)=>{const q=r.x>=xMed?(r.y>=yMed?"hh":"hl"):(r.y>=yMed?"lh":"ll");counts[q]++;if(r.iso3===state.country)selectedQ=q;});
    const cards=[["ll","resilienceZone","lowerExposureLowerVulnerability"],["hl","exposurePriority","higherExposureLowerVulnerability"],["lh","capacityPriority","lowerExposureHigherVulnerability"],["hh","compoundPriority","higherExposureHigherVulnerability"]];
    const actions=field(tr("region"),`<select class="select" id="wriMatrixRegion">${regionOptions(state.matrixRegion)}</select>`);
    return `<section class="wri-section" id="wri-matrix">${sectionHeading(tr("matrixKicker"),tr("matrixTitle"),tr("matrixText"),actions)}<div class="wri-matrix-layout"><article class="wri-matrix-chart"><header class="wri-panel-head"><div><span>${esc(tr("countries"))}: ${rows.length}</span><h3>E × V · ${state.year}</h3></div><p>${esc(tr("medians"))}: E ${fmt(xMed,2)} · V ${fmt(yMed,2)}</p></header>${matrixChartMarkup()}</article><aside class="wri-matrix-side"><div class="wri-matrix-summary"><span>${esc(tr("selectedCountry"))}</span><strong>${esc(countryName(countryByIso(state.country)))} · E ${fmt(selected?.x,2)} · V ${fmt(selected?.y,2)}</strong></div>${cards.map(([q,title,text])=>`<article class="wri-quadrant-card ${selectedQ===q?"is-selected":""}"><i></i><div><strong>${esc(tr(title))}</strong><span>${esc(tr(text))}</span></div><b>${counts[q]}</b></article>`).join("")}</aside></div></section>`;
  }

  function featureIso(feature) { const p=feature?.properties||{}; return String(p.ISO_A3||p.iso_a3||p.ADM0_A3||p.adm0_a3||p.SOV_A3||p.sov_a3||"").toUpperCase(); }
  function geoBounds(features) { let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity; const scan=(coordinates)=>{if(!Array.isArray(coordinates))return;if(typeof coordinates[0]==="number"){const [lon,lat]=coordinates;if(!Number.isFinite(lon)||!Number.isFinite(lat)||lon<-180||lon>180||lat<-90||lat>90)return;minLon=Math.min(minLon,lon);minLat=Math.min(minLat,lat);maxLon=Math.max(maxLon,lon);maxLat=Math.max(maxLat,lat);}else coordinates.forEach(scan);};features.forEach((f)=>scan(f.geometry?.coordinates));return{minLon,minLat,maxLon,maxLat}; }
  function projection(bounds,width,height,lon,lat){const x=(lon-bounds.minLon)/(bounds.maxLon-bounds.minLon)*width;const ml=Math.log(Math.tan(Math.PI/4+clamp(lat,-84,84)*Math.PI/360));const minM=Math.log(Math.tan(Math.PI/4+clamp(bounds.minLat,-84,84)*Math.PI/360));const maxM=Math.log(Math.tan(Math.PI/4+clamp(bounds.maxLat,-84,84)*Math.PI/360));const y=height-(ml-minM)/(maxM-minM)*height;return[x,y];}
  function geoPath(geometry,width,height,bounds){const ring=(points)=>points.map((point,index)=>{const[x,y]=projection(bounds,width,height,point[0],point[1]);return`${index?"L":"M"}${x.toFixed(2)},${y.toFixed(2)}`;}).join("")+"Z";if(!geometry)return"";if(geometry.type==="Polygon")return geometry.coordinates.map(ring).join("");if(geometry.type==="MultiPolygon")return geometry.coordinates.flatMap((p)=>p.map(ring)).join("");return"";}
  function quantiles(values,bins=7){const sorted=values.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return[];return Array.from({length:bins-1},(_,index)=>{const position=(index+1)/bins*(sorted.length-1);const lower=Math.floor(position),upper=Math.ceil(position),fraction=position-lower;return sorted[lower]+(sorted[upper]-sorted[lower])*fraction;});}
  function mapBin(value,thresholds){if(num(value)==null)return-1;let index=0;while(index<thresholds.length&&Number(value)>thresholds[index])index++;return index;}
  function mapMarkup() {
    const actions=field(tr("mapMetric"),`<select class="select" id="wriMapMetric">${componentOptions(state.mapMetric)}</select>`);
    const features=state.geo?.features||[]; const rows=rankingRows(state.year,state.mapMetric,"",""); const selected=rows.find((r)=>r.iso3===state.country);
    let chart=`<div class="wri-empty">${esc(tr("loadingText"))}</div>`;
    if(features.length){const width=1120,height=585,bounds=geoBounds(features),thresholds=quantiles(rows.map((r)=>r.score),7),geoIso=new Set(features.map(featureIso));
      const paths=features.map((feature)=>{const iso3=featureIso(feature),r=rows.find((item)=>item.iso3===iso3),bin=mapBin(r?.score,thresholds),label=r?`${countryName(r)} · ${componentName(state.mapMetric)} ${fmt(r.score,2)} · #${r.displayRank}`:`${feature.properties?.name||iso3} · ${tr("noData")}`;return`<path d="${geoPath(feature.geometry,width,height,bounds)}" class="wri-map-country ${bin>=0?`map-bin-${bin}`:"is-no-data"} ${iso3===state.country?"is-selected":""}" ${r?`tabindex="0" role="button" data-wri-action="country" data-iso="${iso3}"`:""} aria-label="${esc(label)}"><title>${esc(label)}</title></path>`;}).join("");
      const markers=rows.filter((r)=>!geoIso.has(r.iso3)&&ISLAND_CENTROIDS[r.iso3]).map((r)=>{const[x,y]=projection(bounds,width,height,...ISLAND_CENTROIDS[r.iso3]),bin=mapBin(r.score,thresholds);return`<g class="wri-map-marker map-bin-${bin} ${r.iso3===state.country?"is-selected":""}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" tabindex="0" role="button" data-wri-action="country" data-iso="${r.iso3}"><circle r="${r.iso3===state.country?7:4.2}"></circle><title>${esc(countryName(r))} · ${fmt(r.score,2)} · ${tr("markerOnly")}</title></g>`;}).join("");
      const values=rows.map((r)=>r.score); chart=`<div class="wri-map-visual"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("mapTitle"))}"><g class="wri-map-graticule">${Array.from({length:11},(_,i)=>`<path d="M${i*width/10} 0V${height}"/>`).join("")}${Array.from({length:6},(_,i)=>`<path d="M0 ${i*height/5}H${width}"/>`).join("")}</g><g>${paths}</g><g>${markers}</g></svg></div><div class="wri-map-legend"><span>${esc(tr("lower"))} · ${fmt(Math.min(...values),2)}</span><i>${Array.from({length:7},()=>"<b></b>").join("")}</i><span>${esc(tr("higher"))} · ${fmt(Math.max(...values),2)}</span></div>`;}
    return `<section class="wri-section" id="wri-map">${sectionHeading(tr("mapKicker"),tr("mapTitle"),tr("mapText"),actions)}<article class="wri-map-panel"><div class="wri-map-selected"><span class="wri-country-code">${esc(state.country)}</span><span><small>${esc(componentName(state.mapMetric))}</small><strong>${esc(countryName(countryByIso(state.country)))}</strong></span><b>${fmt(selected?.score,2)}</b><em>#${selected?.displayRank??"—"}</em></div>${chart}<details class="wri-map-table"><summary>${esc(tr("mapTable"))}<span>${rows.length}</span></summary><div class="wri-table-wrap"><table class="wri-table"><thead><tr><th>${esc(tr("place"))}</th><th>${esc(tr("countryColumn"))}</th><th>${esc(tr("scoreColumn"))}</th></tr></thead><tbody>${rows.map((r)=>`<tr class="${r.iso3===state.country?"is-selected":""}"><td>#${r.displayRank}</td><td><button data-wri-action="country" data-iso="${r.iso3}">${esc(countryName(r))} · ${r.iso3}</button></td><td>${fmt(r.score,2)}</td></tr>`).join("")}</tbody></table></div></details></article></section>`;
  }

  function compareMarkup() {
    const rows=state.compare.map((iso3)=>row(state.year,iso3)).filter(Boolean); const selectedRegion=countryByIso(state.country)?.region_en; const regional=state.bundle.countries.filter((c)=>c.region_en===selectedRegion); const regionalValues=regional.map((c)=>value(state.year,c.iso3,"W"));
    const addOptions=countryOptions("",state.compare); const actions="";
    return `<section class="wri-section" id="wri-compare">${sectionHeading(tr("compareKicker"),tr("compareTitle"),tr("compareText"),actions)}<div class="wri-compare-layout"><article class="wri-compare-panel"><div class="wri-compare-toolbar">${field(tr("addCountry"),`<select class="select" id="wriCompareCountry"><option value="">—</option>${addOptions}</select>`)}${button(tr("add"),"compare-add","primary")}</div><div class="wri-chip-list">${rows.map((r)=>`<span class="wri-chip"><b>${esc(r.iso3)}</b>${esc(countryName(r))}<button type="button" data-wri-action="compare-remove" data-iso="${r.iso3}" aria-label="${esc(tr("remove"))}">×</button></span>`).join("")}</div><div class="wri-compare-bars">${rows.map((r)=>`<div class="wri-compare-row"><div class="wri-compare-country"><strong>${esc(countryName(r))}</strong><span>${esc(r.region_ru && state.lang==="ru"?r.region_ru:r.region_en)} · ${r.iso3}</span></div>${HEADLINE.map((code)=>{const v=r.values[code];return`<div class="wri-compare-metric"><span>${code}</span><i style="--wri-bar:${clamp(v||0,0,100)}%"><b style="height:${clamp(v||0,0,100)}%;width:${clamp(v||0,0,100)}%"></b></i><strong>${fmt(v,1)}</strong></div>`;}).join("")}</div>`).join("")}</div></article><aside class="wri-compare-side"><header class="wri-panel-head"><div><span>${esc(tr("region"))}</span><h3>${esc(state.lang==="ru"?countryByIso(state.country)?.region_ru:selectedRegion)}</h3></div><p>${regional.length} ${esc(tr("countries"))}</p></header><table class="wri-region-table"><tbody><tr><th>${esc(tr("regionMean"))}</th><td><b>${fmt(mean(regionalValues),2)}</b></td></tr><tr><th>${esc(tr("regionMedian"))}</th><td><b>${fmt(median(regionalValues),2)}</b></td></tr><tr><th>${esc(tr("regionMaximum"))}</th><td><b>${fmt(Math.max(...regionalValues),2)}</b></td></tr><tr><th>${esc(tr("selectedCountry"))}</th><td><b>${fmt(value(state.year,state.country,"W"),2)}</b></td></tr></tbody></table><div class="wri-hazard-note">${esc(tr("regionalBenchmarks"))}: ${state.year}. ${esc(tr("regionsUnofficial"))}</div></aside></div></section>`;
  }

  function rankingTableMarkup() {
    const rows=rankingRows(),total=rows.length,pages=Math.max(1,Math.ceil(total/state.pageSize)); state.page=clamp(state.page,1,pages); const start=(state.page-1)*state.pageSize,pageRows=rows.slice(start,start+state.pageSize);
    const note=Number(state.year)===2025&&state.rankingMetric==="W"?tr("rankingNote2025"):tr("rankingNoteDerived");
    const riskBadge=(r)=>`<span class="wri-risk-badge ${r.riskClass}">${esc(riskLabel(r.riskClass))}</span>`;
    return `<div class="wri-table-wrap"><table class="wri-table"><thead><tr><th>${esc(tr("place"))}</th><th>${esc(tr("countryColumn"))}</th><th>${esc(tr("regionColumn"))}</th><th>${esc(tr("scoreColumn"))}</th><th>${esc(tr("changeColumn"))}</th><th>${esc(tr("riskBand"))}</th><th>${esc(tr("action"))}</th></tr></thead><tbody>${pageRows.map((r)=>`<tr class="${r.iso3===state.country?"is-selected":""}"><td><span class="wri-rank-number">${r.displayRank}</span></td><td><button class="wri-country-cell" data-wri-action="country" data-iso="${r.iso3}"><span class="wri-country-code">${r.iso3}</span><span><strong>${esc(countryName(r))}</strong><small>${esc(r.source_name_en||r.iso3)}</small></span></button></td><td>${esc(state.lang==="ru"?r.region_ru:r.region_en)}<small style="display:block;color:var(--muted);margin-top:3px">#${r.regionRank}</small></td><td><b>${fmt(r.score,2)}</b></td><td class="${num(r.change5y)<=0?"positive":"negative"}">${signed(r.change5y,2)}</td><td>${riskBadge(r)}</td><td>${button(tr("open"),"country","small",`data-iso="${r.iso3}"`)}</td></tr>`).join("")||`<tr><td colspan="7"><div class="wri-empty">${esc(tr("noRows"))}</div></td></tr>`}</tbody></table></div><div class="wri-ranking-cards">${pageRows.map((r)=>`<article class="wri-ranking-card"><header><span class="wri-country-id"><span class="wri-country-code">${r.iso3}</span><span><strong>${esc(countryName(r))}</strong><small>#${r.displayRank}</small></span></span>${riskBadge(r)}</header><dl><div><dt>${esc(tr("scoreColumn"))}</dt><dd>${fmt(r.score,2)}</dd></div><div><dt>${esc(tr("changeColumn"))}</dt><dd>${signed(r.change5y,2)}</dd></div><div><dt>${esc(tr("regionColumn"))}</dt><dd>#${r.regionRank}</dd></div><div><dt>${esc(tr("component"))}</dt><dd>${state.rankingMetric}</dd></div></dl>${button(tr("open"),"country","small",`data-iso="${r.iso3}"`)}</article>`).join("")}</div><div class="wri-pagination">${button(tr("previous"),"page-prev","small",state.page<=1?"disabled":"")}<span>${esc(tr("page"))} ${state.page} ${esc(tr("of"))} ${pages} · ${total} ${esc(tr("records"))}</span>${button(tr("next"),"page-next","small",state.page>=pages?"disabled":"")}</div><div class="wri-ranking-note">${esc(note)}</div>`;
  }
  function rankingMarkup() {
    return `<section class="wri-section" id="wri-ranking">${sectionHeading(tr("rankingKicker"),tr("rankingTitle"),tr("rankingText"))}<article class="wri-ranking-shell"><div class="wri-ranking-controls">${field(tr("search"),`<input class="input" id="wriRankingQuery" value="${esc(state.rankingQuery)}" placeholder="${esc(tr("search"))}">`)}${field(tr("component"),`<select class="select" id="wriRankingMetric">${componentOptions(state.rankingMetric)}</select>`)}${field(tr("region"),`<select class="select" id="wriRankingRegion">${regionOptions(state.rankingRegion)}</select>`)}${field(tr("rows"),`<select class="select" id="wriPageSize">${[10,25,50,100].map((n)=>`<option value="${n}" ${n===state.pageSize?"selected":""}>${n}</option>`).join("")}</select>`)}${button(tr("exportCsv"),"export","primary")}</div>${rankingTableMarkup()}</article></section>`;
  }

  function childComponents(parent) { return state.bundle.components.items.filter((item)=>item.parent_code===parent); }
  function treeNode(code, depth=0) {
    const c=state.bundle.componentMap.get(code); if(!c)return""; const children=childComponents(code).filter((item)=>item.aggregate_score_available); const score=value(state.year,state.country,code);
    if(!children.length)return`<div class="wri-tree-leaf"><span class="wri-component-code">${esc(code)}</span><span><strong>${esc(state.lang==="ru"?c.name_ru:c.name_en)}</strong><span>${esc(c.formula_or_data_codes||"")}</span></span><b>${fmt(score,2)}</b></div>`;
    return `<details class="wri-tree-node" ${depth<2?"open":""}><summary><span class="wri-component-code">${esc(code)}</span><span><strong>${esc(state.lang==="ru"?c.name_ru:c.name_en)}</strong><span>${esc(c.formula_or_data_codes||"")}</span></span><b>${fmt(score,2)}</b></summary><div class="wri-tree-children">${children.map((item)=>treeNode(item.code,depth+1)).join("")}</div></details>`;
  }
  function indicatorRows() {
    const metadata=state.bundle.components.items.filter((item)=>item.level==="indicator"); const values=new Map((state.detail?.items||[]).map((item)=>[item.code,item])); const needle=state.indicatorQuery.trim().toLocaleLowerCase(locale());
    return metadata.map((item)=>({...item,...(values.get(item.code)||{})})).filter((item)=>{if(state.indicatorGroup!=="all"&&!item.code.startsWith(state.indicatorGroup))return false;if(!needle)return true;return[item.code,item.name_ru,item.name_en,item.data_provider].some((text)=>String(text||"").toLocaleLowerCase(locale()).includes(needle));});
  }
  function indicatorsMarkup() {
    const rows=indicatorRows(); const modeText=state.detailMode==="api"?tr("apiDetail"):state.detailMode==="static"?tr("staticSample"):tr("detailUnavailable");
    return `<article class="wri-indicator-panel"><header class="wri-panel-head"><div><span>${esc(tr("indicatorMetadata"))}</span><h3>${esc(tr("indicatorCatalogue"))}</h3></div><p>${esc(modeText)}</p></header><div class="wri-indicator-toolbar"><input class="input" id="wriIndicatorQuery" value="${esc(state.indicatorQuery)}" placeholder="${esc(tr("indicatorSearch"))}"><select class="select" id="wriIndicatorGroup"><option value="all">${esc(tr("allRegions"))}</option><option value="EI_" ${state.indicatorGroup==="EI_"?"selected":""}>E · ${esc(tr("exposure"))}</option><option value="SI_" ${state.indicatorGroup==="SI_"?"selected":""}>S · ${esc(tr("susceptibility"))}</option><option value="CI_" ${state.indicatorGroup==="CI_"?"selected":""}>C · ${esc(tr("coping"))}</option><option value="AI_" ${state.indicatorGroup==="AI_"?"selected":""}>A · ${esc(tr("adaptation"))}</option></select></div><div class="wri-indicator-list">${rows.map((item)=>`<div class="wri-indicator-row"><code>${esc(item.code)}</code><div><strong>${esc(state.lang==="ru"?item.name_ru:item.name_en)}</strong><small>${esc(item.data_provider||"")} · ${esc(tr("sourceYear"))}: ${item.latest_source_year??"—"}</small></div><div class="wri-indicator-value"><b>${fmt(item.normalized_value,2)}</b><span>${esc(tr("normalized"))}${item.base_value!=null?` · ${esc(tr("baseValue"))}: ${fmt(item.base_value,2)}`:""}</span></div></div>`).join("")||`<div class="wri-empty">${esc(tr("noRows"))}</div>`}</div></article>`;
  }
  function methodMarkup() {
    const coverage=state.bundle.overview.coverage;
    return `<section class="wri-section" id="wri-method">${sectionHeading(tr("methodKicker"),tr("methodTitle"),tr("methodText"))}<div class="wri-method-layout"><article class="wri-method-tree"><div class="wri-method-summary"><div><span>${esc(tr("hierarchyNodes"))}</span><strong>${coverage.hierarchy_nodes}</strong></div><div><span>${esc(tr("aggregateNodes"))}</span><strong>${coverage.aggregate_nodes_with_annual_scores}</strong></div><div><span>${esc(tr("indicatorMetadata"))}</span><strong>${coverage.indicator_metadata}</strong></div><div><span>${esc(tr("directValues"))}</span><strong>${coverage.indicators_with_direct_normalized_and_base_values}</strong></div></div><header class="wri-panel-head"><div><span>${esc(tr("methodologyTree"))}</span><h3>${esc(tr("formulaRisk"))}</h3></div><p>${esc(countryName(countryByIso(state.country)))} · ${state.year}</p></header><div class="wri-tree">${treeNode("W")}</div></article>${indicatorsMarkup()}</div><div class="wri-method-notes"><article class="wri-method-note"><span>01</span><strong>${esc(tr("comparabilityTitle"))}</strong><p>${esc(tr("comparabilityText"))}</p></article><article class="wri-method-note"><span>02</span><strong>${esc(tr("rankSemanticsTitle"))}</strong><p>${esc(tr("rankSemanticsText"))}</p></article><article class="wri-method-note"><span>03</span><strong>${esc(tr("licenseTitle"))}</strong><p>${esc(tr("licenseText"))}</p></article></div></section>`;
  }

  function evidenceMarkup() {
    const p=state.bundle.provenance,m=state.bundle.manifest,release=state.bundle.release;
    const yes=(value)=>esc(value?tr("yes"):tr("no")); const files=(items)=>items.map((item)=>`<article class="wri-file"><strong>${esc(item.path)}</strong><span>${esc(item.role)} · SHA-256 ${esc(item.sha256)} · ${Number(item.bytes||0).toLocaleString(locale())} bytes</span></article>`).join("");
    return `<div class="wri-dialog" id="wriDialog" role="dialog" aria-modal="true" aria-labelledby="wriEvidenceTitle" hidden><aside class="wri-evidence"><header><div><span>${esc(tr("evidenceKicker"))}</span><h2 id="wriEvidenceTitle">${esc(tr("evidenceTitle"))}</h2></div>${button("×","close-dialog","icon-only",`aria-label="${esc(tr("close"))}"`)}</header><div class="wri-evidence-body"><section class="wri-evidence-section"><h3>${esc(tr("dataset"))}</h3><dl class="wri-evidence-list"><div><dt>${esc(tr("dataset"))}</dt><dd>${esc(p.dataset_id)}</dd></div><div><dt>${esc(tr("publicationDate"))}</dt><dd>${esc(release.published_at)}</dd></div><div><dt>${esc(tr("coverageLabel"))}</dt><dd>${release.countries} ${esc(tr("countries"))} · ${release.first_year}–${release.last_year} · ${release.observations.toLocaleString(locale())} observations</dd></div><div><dt>${esc(tr("owner"))}</dt><dd>${esc(p.owner)}</dd></div><div><dt>${esc(tr("checksum"))}</dt><dd>${esc(p.dataset_sha256)}</dd></div><div><dt>${esc(tr("staticChecksum"))}</dt><dd>${esc(m.core_sha256)}</dd></div><div><dt>${esc(tr("activeProvider"))}</dt><dd>${esc(state.provider==="api"?tr("apiMode"):tr("staticMode"))}</dd></div></dl></section><section class="wri-evidence-section"><h3>${esc(tr("scientificContract"))}</h3><dl class="wri-evidence-list"><div><dt>${esc(tr("scoresNotRecomputed"))}</dt><dd>${yes(!p.scores_recomputed)}</dd></div><div><dt>${esc(tr("noSplice"))}</dt><dd>${yes(!p.release_spliced)}</dd></div><div><dt>${esc(tr("noZeroFill"))}</dt><dd>${yes(!p.integrity.nulls_coerced_to_zero)}</dd></div><div><dt>${esc(tr("orderPreserved"))}</dt><dd>${yes(p.ranking_semantics.published_position_2025!=null)}</dd></div><div><dt>${esc(tr("regionsUnofficial"))}</dt><dd>${yes(!p.gir_regions_are_official_worldrisk_categories)}</dd></div></dl></section><section class="wri-evidence-section"><h3>${esc(tr("rawFiles"))}</h3>${files(p.raw_files)}</section><section class="wri-evidence-section"><h3>${esc(tr("derivedFiles"))}</h3>${files(p.derived_files)}</section><div class="wri-license-note">${esc(p.licence.attribution)} · ${esc(tr("licenseText"))}</div></div><footer>${button(tr("copy"),"copy-hash")}${button(tr("close"),"close-dialog","primary")}</footer></aside></div>`;
  }

  function workspaceMarkup() {
    return `<div class="wri-workspace index-workspace gir-native-workspace" data-gir-design="native-06r" data-wri-provider="${esc(state.provider)}"><div class="wri-sr-only" aria-live="polite" aria-atomic="true">${esc(countryName(countryByIso(state.country)))} · ${state.year} · ${esc(componentName(state.metric))}</div>${heroMarkup()}${jumpMarkup()}${architectureMarkup()}${trendMarkup()}${matrixMarkup()}${mapMarkup()}${compareMarkup()}${rankingMarkup()}${methodMarkup()}${evidenceMarkup()}<div class="wri-tooltip" id="wriTooltip" hidden></div></div>`;
  }

  function renderWorkspace({ preserveFocus = false } = {}) {
    if (!state.root || !state.bundle) return;
    const active = preserveFocus ? document.activeElement?.id || document.activeElement?.dataset?.wriAction : null;
    state.root.innerHTML = workspaceMarkup();
    bindEvents();
    if (active) {
      const candidate = state.root.querySelector(`#${CSS.escape(active)}`) || state.root.querySelector(`[data-wri-action="${CSS.escape(active)}"]`);
      candidate?.focus?.();
    }
    window.__GIR_WORLD_RISK_READY__ = true;
    document.documentElement.dataset.appReady = "true";
  }

  function setCountry(iso3) {
    const next=String(iso3||"").toUpperCase(); if(!countryByIso(next))return;
    state.country=next; state.page=1; state.context.onCountryChange?.(next); updateUrl(); state.detail=null; state.detailMode="none"; renderWorkspace();
    loadDetail().then(()=>renderWorkspace()).catch(()=>{});
  }
  function setYear(year) {
    const next=Number(year); if(!state.bundle.years.years.includes(next))return;
    state.year=next; state.page=1; updateUrl(); state.detail=null; state.detailMode="none"; renderWorkspace(); loadDetail().then(()=>renderWorkspace()).catch(()=>{});
  }
  function openDialog(trigger) { const dialog=state.root.querySelector("#wriDialog"); if(!dialog)return; state.dialogReturn=trigger||document.activeElement; dialog.hidden=false; document.body.style.overflow="hidden"; dialog.querySelector(".wri-evidence")?.focus?.(); dialog.querySelector("button")?.focus(); }
  function closeDialog() { const dialog=state.root.querySelector("#wriDialog"); if(!dialog)return; dialog.hidden=true; document.body.style.overflow=""; state.dialogReturn?.focus?.(); }
  function exportCsv() {
    if(state.provider==="api") { const url=new URL(`${API}/ranking.csv`,location.origin);url.searchParams.set("year",state.year);url.searchParams.set("component",state.rankingMetric);if(state.rankingRegion)url.searchParams.set("region",state.rankingRegion);if(state.rankingQuery)url.searchParams.set("q",state.rankingQuery);location.href=url.toString();return; }
    const rows=rankingRows(); const headers=["rank","iso3","country_name_en","country_name_ru","region_en","region_ru","year","component","score","change_1y","change_5y"];
    const csv=[headers.join(","),...rows.map((r)=>[r.displayRank,r.iso3,r.country_name_en,r.country_name_ru,r.region_en,r.region_ru,state.year,state.rankingMetric,r.score,r.change1y,r.change5y].map((v)=>`"${String(v??"").replaceAll('"','""')}"`).join(","))].join("\r\n");
    const blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}); const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`world-risk-${state.year}-${state.rankingMetric}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  const rerenderRanking = debounce(() => { state.page=1; renderWorkspace({preserveFocus:true}); }, 170);
  function bindEvents() {
    if (!state.root || state.root.dataset.wriBound === "true") return;
    state.root.dataset.wriBound = "true";
    state.root.addEventListener("click", async (event) => {
      if(event.target?.id==="wriDialog"){closeDialog();return;}
      const target=event.target.closest("[data-wri-action]"); if(!target)return; const action=target.dataset.wriAction;
      if(action==="retry"){cache.bundlePromise=null;state.root.innerHTML=loadingMarkup();start().catch((e)=>state.root.innerHTML=errorMarkup(e));}
      else if(action==="country")setCountry(target.dataset.iso);
      else if(action==="metric"){state.metric=state.trendMetric=state.mapMetric=state.rankingMetric=target.dataset.metric;state.page=1;updateUrl();renderWorkspace();}
      else if(action==="copy-link"){updateUrl();try{await navigator.clipboard.writeText(location.href);notice(tr("copied"));}catch(_){notice(location.href);}}
      else if(action==="evidence")openDialog(target);
      else if(action==="close-dialog")closeDialog();
      else if(action==="copy-hash"){try{await navigator.clipboard.writeText(state.bundle.provenance.dataset_sha256);notice(tr("copiedHash"));}catch(_){notice(state.bundle.provenance.dataset_sha256);}}
      else if(action==="compare-add"){const select=state.root.querySelector("#wriCompareCountry"),iso3=select?.value;if(iso3&&state.compare.length<4&&!state.compare.includes(iso3)){state.compare.push(iso3);updateUrl();renderWorkspace();}else if(state.compare.length>=4)notice(tr("compareLimit"));}
      else if(action==="compare-remove"){if(state.compare.length>2){state.compare=state.compare.filter((iso3)=>iso3!==target.dataset.iso);updateUrl();renderWorkspace();}}
      else if(action==="page-prev"&&state.page>1){state.page--;renderWorkspace();state.root.querySelector("#wri-ranking")?.scrollIntoView({block:"start"});}
      else if(action==="page-next"){state.page++;renderWorkspace();state.root.querySelector("#wri-ranking")?.scrollIntoView({block:"start"});}
      else if(action==="export")exportCsv();
    });
    state.root.addEventListener("change", (event) => {
      const el=event.target;
      if(el.id==="wriCountry")setCountry(el.value);
      else if(el.id==="wriYear")setYear(el.value);
      else if(el.id==="wriTrendMetric"){state.trendMetric=el.value;state.metric=el.value;updateUrl();renderWorkspace();}
      else if(el.id==="wriMapMetric"){state.mapMetric=el.value;state.metric=el.value;updateUrl();renderWorkspace();}
      else if(el.id==="wriMatrixRegion"){state.matrixRegion=el.value;renderWorkspace();}
      else if(el.id==="wriRankingMetric"){state.rankingMetric=el.value;state.metric=el.value;state.page=1;updateUrl();renderWorkspace();}
      else if(el.id==="wriRankingRegion"){state.rankingRegion=el.value;state.page=1;renderWorkspace();}
      else if(el.id==="wriPageSize"){state.pageSize=Number(el.value);state.page=1;renderWorkspace();}
      else if(el.id==="wriIndicatorGroup"){state.indicatorGroup=el.value;renderWorkspace();}
    });
    state.root.addEventListener("input", (event) => {
      if(event.target.id==="wriRankingQuery"){state.rankingQuery=event.target.value;rerenderRanking();}
      else if(event.target.id==="wriIndicatorQuery"){state.indicatorQuery=event.target.value;rerenderRanking();}
    });
    state.root.addEventListener("keydown", (event) => {
      if(event.key==="Escape"&&!state.root.querySelector("#wriDialog")?.hidden){event.preventDefault();closeDialog();}
      if((event.key==="Enter"||event.key===" ")&&event.target.matches("[role=button][data-wri-action]")){event.preventDefault();event.target.click();}
      const dialog=state.root.querySelector("#wriDialog:not([hidden])");
      if(dialog&&event.key==="Tab"){const focusable=Array.from(dialog.querySelectorAll("button,[href],input,select,[tabindex]:not([tabindex='-1'])")).filter((el)=>!el.disabled);if(focusable.length){const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
    });
  }

  async function start() {
    state.bundle=await loadBundle(); parseUrlState(); state.root.innerHTML=loadingMarkup();
    await Promise.allSettled([ensureGeo(),loadDetail()]); renderWorkspace();
  }

  function render(context = {}) {
    state.context=context; state.root=context.root||state.root||document.querySelector("#view"); if(!state.root)return;
    state.lang=context.lang==="en"?"en":"ru"; state.theme=context.theme||state.theme;
    state.country=String(new URLSearchParams(window.location.search).get("country")||context.country||"").toUpperCase();if(!state.country)return;
    if(context.country&&state.bundle?.countryMap.has(String(context.country).toUpperCase()))state.country=String(context.country).toUpperCase();
    document.documentElement.lang=state.lang; state.root.innerHTML=loadingMarkup();
    start().catch((error)=>{window.__GIR_WORLD_RISK_READY__=false;state.root.innerHTML=errorMarkup(error);bindEvents();});
  }

  window.GIRWorldRisk = window.GIRWRI = { render, invalidate() { cache.bundlePromise=null;cache.geoPromise=null;cache.detail.clear();cache.indicatorYears.clear();state.bundle=null;state.geo=null;state.initializedFromUrl=false; } };
})();
