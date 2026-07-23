/* GIR — World Bank Logistics Performance Indicators workspace, cumulative Stage 12.
 * Native GIR shell and tokens only. LPI 2.0 operational indicators and the
 * discontinued survey-based LPI remain methodologically separate products.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)world-bank-lpi-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const BUNDLE_URL = new URL("world-bank-lpi/world_bank_lpi_frontend_bundle.json", STATIC_BASE).href;
  const GEO_URL = new URL("goci/goci-world-geo.json", STATIC_BASE).href;
  const LPI2_YEARS = [2024, 2023];
  const LEGACY_YEARS = [2023, 2018, 2016, 2014, 2012, 2010, 2007];
  const LEGACY_COMPONENTS = ["overall", "customs", "infrastructure", "international_shipments", "logistics_quality", "tracking_tracing", "timeliness"];
  const DEFAULT_INDICATOR = "AV_DT";
  const DEFAULT_METRIC = "WB_LPI_MD";

  const COPY = {
    ru: {
      section: "Безопасность и международная связанность",
      title: "Показатели эффективности логистики Всемирного банка",
      acronym: "World Bank LPI",
      leadLpi2: "Операционная панель LPI 2.0: 21 показатель реальной работы морской, авиационной и почтовой логистики — без искусственного общего балла.",
      leadLegacy: "Исторический опросный LPI: официальный общий балл и шесть компонентов восприятия качества логистики за семь выпусков 2007–2023 годов.",
      lpi2: "LPI 2.0 · операционные данные",
      legacy: "Опросный LPI · 2007–2023",
      product: "Продукт",
      selectedCountry: "Выбранная страна",
      officialValue: "официальное значение",
      derivedRank: "место рассчитано GIR",
      officialRank: "официальное место",
      noComposite: "единый композит отсутствует",
      discontinued: "серия завершена после 2023 года",
      year: "Год",
      release: "Выпуск",
      indicator: "Показатель",
      metric: "Метрика",
      value: "Значение",
      rank: "Место",
      percentile: "Процентиль",
      coverage: "Охват",
      countries: "экономик и территорий",
      dataStatus: "Статус данных",
      noData: "Нет данных для выбранной страны и комбинации показателя",
      operationalKicker: "LPI 2.0",
      operationalTitle: "Три вида логистики, шесть основных показателей",
      operationalText: "Для морских, авиационных и почтовых потоков показаны отдельные показатели связанности и времени. Они не складываются в единый рейтинг.",
      maritime: "Морская логистика",
      aviation: "Авиационная логистика",
      postal: "Почтовая логистика",
      connectivity: "Связанность",
      time: "Время",
      core: "Основной",
      supplementary: "Дополнительные показатели",
      supplementaryText: "15 дополнительных показателей раскрывают частоту сервисов, надёжность сроков, задержки и структуру перевозок.",
      geographyKicker: "География",
      mapTitle: "Страновое распределение выбранного показателя",
      mapText: "Цвет отражает производный процентиль внутри одного года, показателя и метрики. Точные официальные значения доступны в таблице и доказательной записи.",
      best: "Лучший процентиль",
      middle: "Средний",
      lower: "Ниже",
      noMapData: "Нет данных",
      distribution: "Распределение",
      profile: "Профиль наблюдения",
      direction: "Направление шкалы",
      higherBetter: "выше — лучше",
      lowerBetter: "ниже — лучше",
      observationGroup: "Группа наблюдений",
      observationStatus: "Статус наблюдения",
      observationConfidence: "Признак качества",
      comparisonKicker: "Сравнение",
      comparisonTitle: "Сопоставление стран на одной шкале",
      comparisonText: "Сравнение выполняется только внутри текущего продукта, года, показателя и метрики.",
      addCountry: "Добавить страну",
      add: "Добавить",
      reset: "Сбросить",
      remove: "Удалить",
      rankingKicker: "Полный набор",
      rankingTitle: "Рейтинг по выбранному наблюдению",
      rankingTextLpi2: "Баллы официальные; места и процентили — воспроизводимая аналитика GIR для одной комбинации год × показатель × метрика.",
      rankingTextLegacy: "Баллы и места опубликованы Всемирным банком в соответствующем опросном выпуске.",
      search: "Поиск страны или ISO3",
      sort: "Сортировка",
      byRank: "По месту",
      byValue: "По значению",
      byCountry: "По стране",
      ascending: "По возрастанию",
      descending: "По убыванию",
      rows: "Строк на странице",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      evidence: "Доказательная запись",
      exportCsv: "Экспорт CSV",
      historicalKicker: "Историческая серия",
      historicalTitle: "Динамика опросного LPI",
      historicalText: "Серия основана на оценках международных логистических специалистов и не продолжается показателями LPI 2.0.",
      components: "Компоненты опросного LPI",
      overall: "Общий LPI",
      customs: "Таможня и пограничный контроль",
      infrastructure: "Торговая и транспортная инфраструктура",
      international_shipments: "Организация международных перевозок",
      logistics_quality: "Качество логистических услуг",
      tracking_tracing: "Отслеживание грузов",
      timeliness: "Своевременность доставки",
      familyWarning: "LPI 2.0 и опросный LPI измеряют разные конструкции. GIR не соединяет их в один временной ряд и не рассчитывает общий межсемейный рейтинг.",
      methodologyKicker: "Методология и происхождение",
      methodologyTitle: "Два продукта, две доказательные цепочки",
      methodologyText: "Официальные значения сохранены без изменения. Все производные места LPI 2.0 отмечены отдельно и могут быть воспроизведены из нормализованного снимка.",
      source: "Источник",
      report: "Отчёт 2026",
      methodology: "Методология",
      data360: "Data360",
      license: "Лицензия",
      retrieved: "Получено",
      rawSnapshot: "Официальный снимок",
      normalizedSnapshot: "Нормализованный снимок",
      rowHash: "SHA-256 строки",
      transform: "Преобразование",
      formula: "Версия формулы",
      sourceRow: "Строка источника",
      family: "Семейство данных",
      publisher: "Издатель",
      close: "Закрыть",
      openSource: "Открыть источник",
      openMethodology: "Открыть методологию",
      tie: "ничья",
      coverageNote: "Страновой охват зависит от показателя и вида транспорта.",
      loading: "Загрузка официального набора World Bank LPI…",
      loadError: "Не удалось загрузить модуль World Bank LPI",
      retry: "Повторить",
      worldMedian: "Медиана",
      bestCountry: "Лидер",
      selectedPosition: "Позиция страны",
      availableYears: "Доступные годы",
      indicatorsCount: "Показателей LPI 2.0",
      coreCount: "Основных показателей",
      legacyYears: "Выпусков опросного LPI",
      dataPoints: "Официальных наблюдений",
      scale: "Шкала",
      sourceRows: "Строки исходного набора",
      officialScore: "Официальный балл",
      confidenceInterval: "Доверительный интервал",
      highestPerformer: "% от лидера",
      derivedDiagnostic: "Производная аналитика GIR",
      mapKeyboard: "Карта доступна с клавиатуры: Enter или пробел выбирают страну, стрелки перемещают фокус.",
    },
    en: {
      section: "Security & international connectivity",
      title: "World Bank Logistics Performance Indicators",
      acronym: "World Bank LPI",
      leadLpi2: "LPI 2.0 operational dashboard: 21 indicators of actual maritime, aviation and postal logistics performance, without an invented composite score.",
      leadLegacy: "Historical survey-based LPI: the official overall score and six perception-based logistics components across seven editions from 2007 to 2023.",
      lpi2: "LPI 2.0 · operational data",
      legacy: "Survey LPI · 2007–2023",
      product: "Product",
      selectedCountry: "Selected country",
      officialValue: "official value",
      derivedRank: "rank derived by GIR",
      officialRank: "official rank",
      noComposite: "no single composite",
      discontinued: "series discontinued after 2023",
      year: "Year",
      release: "Release",
      indicator: "Indicator",
      metric: "Metric",
      value: "Value",
      rank: "Rank",
      percentile: "Percentile",
      coverage: "Coverage",
      countries: "economies and areas",
      dataStatus: "Data status",
      noData: "No observation for the selected country and indicator combination",
      operationalKicker: "LPI 2.0",
      operationalTitle: "Three logistics modes, six core indicators",
      operationalText: "Maritime, aviation and postal flows each have separate connectivity and time indicators. They are not combined into one ranking.",
      maritime: "Maritime logistics",
      aviation: "Aviation logistics",
      postal: "Postal logistics",
      connectivity: "Connectivity",
      time: "Time",
      core: "Core",
      supplementary: "Supplementary indicators",
      supplementaryText: "Fifteen supplementary indicators cover service frequency, time reliability, delays and transport structure.",
      geographyKicker: "Geography",
      mapTitle: "Country distribution for the selected indicator",
      mapText: "Colour represents a derived percentile within one year, indicator and metric. Exact official values remain available in the table and evidence record.",
      best: "Best percentile",
      middle: "Middle",
      lower: "Lower",
      noMapData: "No data",
      distribution: "Distribution",
      profile: "Observation profile",
      direction: "Scale direction",
      higherBetter: "higher is better",
      lowerBetter: "lower is better",
      observationGroup: "Observation group",
      observationStatus: "Observation status",
      observationConfidence: "Quality flag",
      comparisonKicker: "Comparison",
      comparisonTitle: "Country comparison on one scale",
      comparisonText: "Comparison is restricted to the current product, year, indicator and metric.",
      addCountry: "Add country",
      add: "Add",
      reset: "Reset",
      remove: "Remove",
      rankingKicker: "Full dataset",
      rankingTitle: "Ranking for the selected observation",
      rankingTextLpi2: "Values are official; ranks and percentiles are reproducible GIR analytics for one year × indicator × metric combination.",
      rankingTextLegacy: "Scores and ranks were published by the World Bank in the corresponding survey edition.",
      search: "Search country or ISO3",
      sort: "Sort",
      byRank: "By rank",
      byValue: "By value",
      byCountry: "By country",
      ascending: "Ascending",
      descending: "Descending",
      rows: "Rows per page",
      previous: "Previous",
      next: "Next",
      page: "Page",
      evidence: "Evidence record",
      exportCsv: "Export CSV",
      historicalKicker: "Historical series",
      historicalTitle: "Survey LPI trend",
      historicalText: "This series is based on assessments by international logistics professionals and is not continued by LPI 2.0 indicators.",
      components: "Survey LPI components",
      overall: "Overall LPI",
      customs: "Customs and border management",
      infrastructure: "Trade and transport infrastructure",
      international_shipments: "International shipments",
      logistics_quality: "Logistics services quality",
      tracking_tracing: "Tracking and tracing",
      timeliness: "Timeliness",
      familyWarning: "LPI 2.0 and the survey LPI measure different constructs. GIR does not join them into one time series or calculate a cross-family rank.",
      methodologyKicker: "Methodology and provenance",
      methodologyTitle: "Two products, two evidence chains",
      methodologyText: "Official values are preserved unchanged. Every derived LPI 2.0 rank is identified and reproducible from the normalized snapshot.",
      source: "Source",
      report: "2026 report",
      methodology: "Methodology",
      data360: "Data360",
      license: "Licence",
      retrieved: "Retrieved",
      rawSnapshot: "Official snapshot",
      normalizedSnapshot: "Normalized snapshot",
      rowHash: "Row SHA-256",
      transform: "Transformation",
      formula: "Formula version",
      sourceRow: "Source row",
      family: "Data family",
      publisher: "Publisher",
      close: "Close",
      openSource: "Open source",
      openMethodology: "Open methodology",
      tie: "tie",
      coverageNote: "Country coverage varies by indicator and transport mode.",
      loading: "Loading the official World Bank LPI dataset…",
      loadError: "The World Bank LPI module could not be loaded",
      retry: "Retry",
      worldMedian: "Median",
      bestCountry: "Leader",
      selectedPosition: "Country position",
      availableYears: "Available years",
      indicatorsCount: "LPI 2.0 indicators",
      coreCount: "Core indicators",
      legacyYears: "Survey LPI editions",
      dataPoints: "Official observations",
      scale: "Scale",
      sourceRows: "Source dataset rows",
      officialScore: "Official score",
      confidenceInterval: "Confidence interval",
      highestPerformer: "% of top performer",
      derivedDiagnostic: "GIR-derived analytics",
      mapKeyboard: "The map is keyboard accessible: Enter or Space selects a country; arrow keys move focus.",
    },
  };

  const S = {
    context: null,
    data: null,
    geo: null,
    parsed: false,
    family: "lpi2",
    selectedIso: "",
    lpi2Year: 2024,
    lpi2Indicator: DEFAULT_INDICATOR,
    lpi2Metric: DEFAULT_METRIC,
    legacyYear: 2023,
    legacyComponent: "overall",
    compare: ["RUS", "DEU", "SGP"],
    query: "",
    sort: "rank",
    direction: "asc",
    page: 0,
    pageSize: 25,
    evidence: null,
    loadPromise: null,
    renderToken: 0,
  };

  const tr = (key) => COPY[S.context?.lang === "en" ? "en" : "ru"][key] || key;
  const esc = (value) => S.context?.escapeHtml ? S.context.escapeHtml(value) : String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const numeric = (value) => value == null || value === "" ? null : Number(value);
  const fmt = (value, digits = 2) => {
    const number = numeric(value);
    if (!Number.isFinite(number)) return "—";
    const resolved = Math.abs(number - Math.round(number)) < 1e-9 ? 0 : digits;
    return number.toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: resolved, minimumFractionDigits: resolved });
  };
  const intFmt = (value) => value == null ? "—" : Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU");
  const shortHash = (value) => value ? `${String(value).slice(0, 12)}…${String(value).slice(-8)}` : "—";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function zip(fields, rows) {
    return rows.map((values) => Object.fromEntries(fields.map((field, index) => [field, values[index]])));
  }

  function parseData() {
    if (S.parsed) return;
    S.data.lpi2Rows = zip(S.data.lpi2.fields, S.data.lpi2.rows).filter((row) => row.type === "economy_or_area" && row.iso3);
    S.data.legacyRows = zip(S.data.legacy.fields, S.data.legacy.rows).filter((row) => row.type === "economy_or_area" && row.iso3);
    S.data.lpi2BySeries = new Map();
    S.data.lpi2ByIso = new Map();
    for (const row of S.data.lpi2Rows) {
      const key = `${row.year}|${row.indicator}|${row.metric}`;
      if (!S.data.lpi2BySeries.has(key)) S.data.lpi2BySeries.set(key, []);
      S.data.lpi2BySeries.get(key).push(row);
      const isoKey = `${row.year}|${row.indicator}|${row.metric}|${row.iso3}`;
      S.data.lpi2ByIso.set(isoKey, row);
    }
    S.data.legacyByYear = new Map();
    S.data.legacyByIso = new Map();
    for (const row of S.data.legacyRows) {
      if (!S.data.legacyByYear.has(Number(row.year))) S.data.legacyByYear.set(Number(row.year), []);
      S.data.legacyByYear.get(Number(row.year)).push(row);
      S.data.legacyByIso.set(`${row.year}|${row.iso3}`, row);
    }
    S.data.lpi2Catalog = S.data.indicators.lpi2_operational.items.slice().sort((a, b) => a.sort_order - b.sort_order);
    S.data.legacyCatalog = S.data.indicators.legacy_survey.items.slice().sort((a, b) => a.sort_order - b.sort_order);
    S.data.indicatorMap = new Map(S.data.lpi2Catalog.map((item) => [item.indicator_code, item]));
    S.data.legacyMap = new Map(S.data.legacyCatalog.map((item) => [item.indicator_code, item]));
    S.parsed = true;
  }

  function scriptJson(url) {
    return fetch(url, { credentials: "same-origin", cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.json();
    });
  }

  async function load() {
    if (!S.loadPromise) {
      S.loadPromise = Promise.all([scriptJson(BUNDLE_URL), scriptJson(GEO_URL).catch(() => null)]).then(([data, geo]) => {
        S.data = data;
        S.geo = geo;
        S.parsed = false;
        parseData();
        return data;
      });
    }
    return S.loadPromise;
  }

  function indicator() { return S.data.indicatorMap.get(S.lpi2Indicator) || S.data.indicatorMap.get(DEFAULT_INDICATOR); }
  function legacyItem() { return S.data.legacyMap.get(S.legacyComponent) || S.data.legacyMap.get("overall"); }
  function indicatorName(item) { return S.context?.lang === "en" ? item?.name_en : item?.name_ru; }
  function modeName(mode) { return tr(mode); }
  function directionName(direction) { return direction === "lower_is_better" ? tr("lowerBetter") : tr("higherBetter"); }
  function metricName(item, code) { return item?.metrics?.find((metric) => metric.code === code)?.name || code; }
  function unitLabel(row) { return row?.unit || ""; }
  function componentName(code) { return tr(code); }

  function platformCountry(iso3) {
    return S.context?.platformContext?.countries?.find((country) => String(country.iso3).toUpperCase() === String(iso3).toUpperCase()) || null;
  }
  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const platform = platformCountry(iso3);
    if (platform) return S.context?.lang === "en" ? platform.name_en : platform.name_ru;
    if (typeof rowOrIso === "object" && rowOrIso?.name) return rowOrIso.name;
    const row = S.data?.lpi2Rows?.find((item) => item.iso3 === iso3) || S.data?.legacyRows?.find((item) => item.iso3 === iso3);
    return row?.name || iso3 || "—";
  }
  function flag(rowOrIso, className = "flag-img") {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const platform = platformCountry(iso3) || { iso3, name_ru: countryName(rowOrIso), name_en: countryName(rowOrIso) };
    return S.context?.flagImage ? S.context.flagImage(platform, className) : `<span class="${className} flag-fallback">${esc(iso3)}</span>`;
  }

  function currentLpi2Rows() {
    return S.data.lpi2BySeries.get(`${S.lpi2Year}|${S.lpi2Indicator}|${S.lpi2Metric}`) || [];
  }
  function currentLpi2Row(iso3 = S.selectedIso) {
    return S.data.lpi2ByIso.get(`${S.lpi2Year}|${S.lpi2Indicator}|${S.lpi2Metric}|${iso3}`) || null;
  }
  function currentLegacyRows() { return S.data.legacyByYear.get(Number(S.legacyYear)) || []; }
  function currentLegacyRow(iso3 = S.selectedIso) { return S.data.legacyByIso.get(`${S.legacyYear}|${iso3}`) || null; }
  function legacyValue(row, component = S.legacyComponent) { return numeric(row?.[`${component}_score`]); }
  function legacyRank(row, component = S.legacyComponent) { return numeric(row?.[`${component}_rank`]); }
  function currentRows() { return S.family === "lpi2" ? currentLpi2Rows() : currentLegacyRows(); }
  function currentRow(iso3 = S.selectedIso) { return S.family === "lpi2" ? currentLpi2Row(iso3) : currentLegacyRow(iso3); }
  function currentValue(row) { return S.family === "lpi2" ? numeric(row?.value_text) : legacyValue(row); }
  function currentRank(row) { return S.family === "lpi2" ? numeric(row?.rank) : legacyRank(row); }
  function currentPercentile(row) {
    if (S.family === "lpi2") return numeric(row?.percentile);
    const rows = currentLegacyRows().filter((item) => legacyRank(item) != null);
    const rank = legacyRank(row);
    return rank == null || rows.length < 2 ? null : 100 * (rows.length - rank) / (rows.length - 1);
  }

  function ensureState() {
    const contextYear = Number(S.context?.year);
    if (LEGACY_YEARS.includes(contextYear) && contextYear !== 2023) {
      S.family = "legacy";
      S.legacyYear = contextYear;
    } else if (LPI2_YEARS.includes(contextYear)) {
      if (contextYear === 2024) S.family = "lpi2";
      if (S.family === "lpi2") S.lpi2Year = contextYear;
      else S.legacyYear = contextYear;
    }
    S.selectedIso = String(S.context?.country || "").toUpperCase();
    if (!S.compare.includes(S.selectedIso)) S.compare.unshift(S.selectedIso);
    S.compare = Array.from(new Set(S.compare)).slice(0, 5);
    const item = indicator();
    const metricCodes = item?.metrics?.map((metric) => metric.code) || [];
    if (!metricCodes.includes(S.lpi2Metric)) S.lpi2Metric = item?.default_metric_code || metricCodes[0] || "_Z";
  }

  function rowStats(rows, valueAccessor = currentValue) {
    const values = rows.map(valueAccessor).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return { min: null, max: null, median: null };
    const mid = Math.floor(values.length / 2);
    return {
      min: values[0], max: values[values.length - 1],
      median: values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2,
    };
  }

  function leader(rows) {
    return rows.slice().filter((row) => currentRank(row) != null).sort((a, b) => currentRank(a) - currentRank(b))[0] || null;
  }

  function countryHeading(row) {
    return `<div class="lpiw-country-heading">${flag(row || S.selectedIso)}<div><strong>${esc(countryName(row || S.selectedIso))}</strong><small>${esc(S.selectedIso)} · ${esc(S.family === "lpi2" ? indicatorName(indicator()) : componentName(S.legacyComponent))}</small></div></div>`;
  }

  function productSwitch() {
    return `<div class="lpiw-product-switch" role="group" aria-label="${esc(tr("product"))}">
      <button type="button" data-lpiw-action="family" data-family="lpi2" class="${S.family === "lpi2" ? "is-active" : ""}" aria-pressed="${S.family === "lpi2"}">${esc(tr("lpi2"))}</button>
      <button type="button" data-lpiw-action="family" data-family="legacy" class="${S.family === "legacy" ? "is-active" : ""}" aria-pressed="${S.family === "legacy"}">${esc(tr("legacy"))}</button>
    </div>`;
  }

  function heroMarkup(row) {
    const isLpi2 = S.family === "lpi2";
    const value = currentValue(row);
    const rank = currentRank(row);
    const percentile = currentPercentile(row);
    const selectedIndicator = indicator();
    const scoreLabel = isLpi2 ? `${fmt(value)}${row?.unit ? ` <small>${esc(row.unit)}</small>` : ""}` : fmt(value, 2);
    return `<section class="iw-hero">
      <article class="iw-hero-main">
        <span class="iw-overline">${esc(tr("section"))} · ${esc(tr("acronym"))}</span>
        ${productSwitch()}
        <h1>${esc(tr("title"))}</h1>
        <p class="iw-hero-lead">${esc(isLpi2 ? tr("leadLpi2") : tr("leadLegacy"))}</p>
        <div class="iw-status-line">
          <span class="accent">${esc(isLpi2 ? tr("officialValue") : tr("officialScore"))}</span>
          <span>${esc(isLpi2 ? tr("derivedRank") : tr("officialRank"))}</span>
          <span>${esc(isLpi2 ? tr("noComposite") : tr("discontinued"))}</span>
          <span>CC BY 4.0</span>
        </div>
        ${countryHeading(row)}
        <p class="lpiw-score-note"><strong>${esc(isLpi2 ? indicatorName(selectedIndicator) : componentName(S.legacyComponent))}</strong><br>${esc(isLpi2 ? `${S.lpi2Year} · ${metricName(selectedIndicator, S.lpi2Metric)} · ${directionName(selectedIndicator?.score_direction)}` : `${S.legacyYear} · ${tr("scale")} 1–5 · ${tr("higherBetter")}`)}</p>
        <nav class="iw-jump" aria-label="Page sections"><button type="button" data-lpiw-action="jump" data-target="lpi-architecture">${esc(isLpi2 ? tr("operationalTitle") : tr("components"))}</button><button type="button" data-lpiw-action="jump" data-target="lpi-geography">${esc(tr("geographyKicker"))}</button><button type="button" data-lpiw-action="jump" data-target="lpi-comparison">${esc(tr("comparisonKicker"))}</button><button type="button" data-lpiw-action="jump" data-target="lpi-ranking">${esc(tr("rankingKicker"))}</button></nav>
      </article>
      <aside class="iw-score-panel">
        <span>${esc(tr("value"))}</span>
        <div class="iw-score-value">${value == null ? "—" : scoreLabel}</div>
        <div class="iw-rank-line"><strong>${rank == null ? "—" : `#${intFmt(rank)}`}</strong><span>${esc(isLpi2 ? tr("derivedRank") : tr("officialRank"))}</span></div>
        <div class="iw-percentile"><span>${esc(tr("percentile"))}</span><b>${percentile == null ? "—" : `${fmt(percentile, 1)}%`}</b></div>
        <dl class="iw-score-meta"><div><dt>${esc(tr("year"))}</dt><dd>${isLpi2 ? S.lpi2Year : S.legacyYear}</dd></div><div><dt>${esc(tr("coverage"))}</dt><dd>${intFmt(currentRows().length)}</dd></div><div><dt>${esc(tr("dataStatus"))}</dt><dd>${esc(row ? tr("officialValue") : tr("noData"))}</dd></div></dl>
        <button type="button" class="iw-button" data-lpiw-action="evidence" data-iso="${esc(S.selectedIso)}" ${row ? "" : "disabled"}>${esc(tr("evidence"))}</button>
      </aside>
    </section>`;
  }

  function findingsMarkup() {
    const rows = currentRows();
    const selected = currentRow();
    const stats = rowStats(rows);
    const best = leader(rows);
    if (S.family === "lpi2") {
      return `<section class="iw-findings" aria-label="Summary">
        <article class="iw-finding"><span>${esc(tr("indicatorsCount"))}</span><strong>21</strong><p>6 ${esc(tr("core").toLowerCase())} · 15 ${esc(tr("supplementary").toLowerCase())}</p></article>
        <article class="iw-finding"><span>${esc(tr("coverage"))}</span><strong>${intFmt(rows.length)}</strong><p>${esc(tr("coverageNote"))}</p></article>
        <article class="iw-finding"><span>${esc(tr("bestCountry"))}</span><strong>${esc(best ? countryName(best) : "—")}</strong><p>${best ? `${fmt(currentValue(best))} ${esc(unitLabel(best))}` : "—"}</p></article>
        <article class="iw-finding"><span>${esc(tr("worldMedian"))}</span><strong>${fmt(stats.median)}</strong><p>${esc(unitLabel(selected || rows[0]))} · ${esc(directionName(indicator()?.score_direction))}</p></article>
      </section>`;
    }
    return `<section class="iw-findings" aria-label="Summary">
      <article class="iw-finding"><span>${esc(tr("legacyYears"))}</span><strong>7</strong><p>2007–2023</p></article>
      <article class="iw-finding"><span>${esc(tr("coverage"))}</span><strong>${intFmt(rows.length)}</strong><p>${esc(tr("countries"))} · ${S.legacyYear}</p></article>
      <article class="iw-finding"><span>${esc(tr("bestCountry"))}</span><strong>${esc(best ? countryName(best) : "—")}</strong><p>${best ? `${fmt(currentValue(best), 2)} · #${intFmt(currentRank(best))}` : "—"}</p></article>
      <article class="iw-finding"><span>${esc(tr("worldMedian"))}</span><strong>${fmt(stats.median, 2)}</strong><p>${esc(tr("scale"))} 1–5</p></article>
    </section>`;
  }

  function indicatorCard(item) {
    const metric = item.default_metric_code || item.metrics?.[0]?.code;
    const row = S.data.lpi2ByIso.get(`${S.lpi2Year}|${item.indicator_code}|${metric}|${S.selectedIso}`);
    const active = item.indicator_code === S.lpi2Indicator;
    return `<button type="button" class="lpiw-indicator-card ${active ? "is-active" : ""}" data-lpiw-action="indicator" data-indicator="${esc(item.indicator_code)}" data-metric="${esc(metric)}">
      <header><span>${esc(item.concept === "time" ? tr("time") : tr("connectivity"))}</span><b>${esc(item.indicator_code)}</b></header>
      <h3>${esc(indicatorName(item))}</h3>
      <div class="lpiw-card-value">${row ? fmt(row.value_text) : "—"} <small>${esc(row?.unit || item.units?.[0]?.name || "")}</small></div>
      <footer><div><span>${esc(tr("coverage"))}</span><b>${intFmt(item.entity_count_union)}</b></div><div><span>${esc(tr("direction"))}</span><b>${esc(directionName(item.score_direction))}</b></div></footer>
    </button>`;
  }

  function lpi2ArchitectureMarkup() {
    const core = S.data.lpi2Catalog.filter((item) => item.category === "core");
    const supplementary = S.data.lpi2Catalog.filter((item) => item.category === "supplementary");
    const modes = ["maritime", "aviation", "postal"];
    return `<section class="iw-section" id="lpi-architecture">
      <div class="iw-section-heading"><span>${esc(tr("operationalKicker"))}</span><h2>${esc(tr("operationalTitle"))}</h2><p>${esc(tr("operationalText"))}</p></div>
      <div class="lpiw-core-grid">${modes.map((mode) => `<div class="lpiw-core-column"><div class="lpiw-mode-label"><span>${esc(modeName(mode))}</span><b>${core.filter((item) => item.logistics_mode === mode).length} / 2</b></div>${core.filter((item) => item.logistics_mode === mode).map(indicatorCard).join("")}</div>`).join("")}</div>
      <details class="lpiw-supplementary"><summary>${esc(tr("supplementary"))} <span>· ${esc(tr("supplementaryText"))}</span></summary><div class="lpiw-supplementary-grid">${supplementary.map((item) => {
        const active = item.indicator_code === S.lpi2Indicator;
        return `<button type="button" class="${active ? "is-active" : ""}" data-lpiw-action="indicator" data-indicator="${esc(item.indicator_code)}" data-metric="${esc(item.default_metric_code || item.metrics?.[0]?.code)}"><span>${esc(modeName(item.logistics_mode))} · ${esc(item.indicator_code)}</span><b>${esc(indicatorName(item))}</b><small>${esc(directionName(item.score_direction))} · ${intFmt(item.entity_count_union)}</small></button>`;
      }).join("")}</div></details>
    </section>`;
  }

  function legacyTrendPoints(component = S.legacyComponent) {
    return LEGACY_YEARS.slice().reverse().map((year) => {
      const row = S.data.legacyByIso.get(`${year}|${S.selectedIso}`);
      return { year, value: legacyValue(row, component), rank: legacyRank(row, component), row };
    }).filter((item) => item.value != null);
  }

  function trendSvg(points) {
    if (!points.length) return `<div class="lpiw-no-data">${esc(tr("noData"))}</div>`;
    const width = 720, height = 280, left = 48, right = 24, top = 20, bottom = 38;
    const minYear = Math.min(...points.map((point) => point.year));
    const maxYear = Math.max(...points.map((point) => point.year));
    const minValue = Math.min(1, ...points.map((point) => point.value));
    const maxValue = Math.max(5, ...points.map((point) => point.value));
    const x = (year) => left + (maxYear === minYear ? 0 : (year - minYear) / (maxYear - minYear)) * (width - left - right);
    const y = (value) => top + (maxValue - value) / (maxValue - minValue) * (height - top - bottom);
    const path = points.map((point, index) => `${index ? "L" : "M"}${x(point.year).toFixed(2)},${y(point.value).toFixed(2)}`).join(" ");
    const grid = [1,2,3,4,5].map((value) => `<line class="grid" x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}"/><text x="${left-10}" y="${y(value)+3}" text-anchor="end">${value}</text>`).join("");
    return `<svg class="lpiw-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("historicalTitle"))}">${grid}<path class="line" d="${path}"/>${points.map((point) => `<g><circle class="point" cx="${x(point.year)}" cy="${y(point.value)}" r="5"/><text x="${x(point.year)}" y="${height-13}" text-anchor="middle">${point.year}</text><text x="${x(point.year)}" y="${y(point.value)-12}" text-anchor="middle">${fmt(point.value,2)}</text></g>`).join("")}</svg>`;
  }

  function legacyArchitectureMarkup() {
    const row = currentLegacyRow();
    const components = LEGACY_COMPONENTS.filter((code) => code !== "overall");
    return `<section class="iw-section" id="lpi-architecture">
      <div class="iw-section-heading"><span>${esc(tr("historicalKicker"))}</span><h2>${esc(tr("historicalTitle"))}</h2><p>${esc(tr("historicalText"))}</p></div>
      <div class="iw-analysis-grid">
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(componentName(S.legacyComponent))}</span><h3>${esc(countryName(row || S.selectedIso))}</h3></div><select id="lpiwLegacyComponent" aria-label="${esc(tr("indicator"))}">${S.data.legacyCatalog.map((item) => `<option value="${esc(item.indicator_code)}" ${item.indicator_code === S.legacyComponent ? "selected" : ""}>${esc(indicatorName(item))}</option>`).join("")}</select></div><div class="iw-chart-frame">${trendSvg(legacyTrendPoints())}</div></article>
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(tr("components"))}</span><h3>${esc(`${S.legacyYear} · ${countryName(row || S.selectedIso)}`)}</h3></div></div><div class="lpiw-component-bars">${components.map((code) => {
          const value = legacyValue(row, code);
          return `<div class="lpiw-component-bar ${value >= 3.5 ? "is-strong" : ""}"><span>${esc(componentName(code))}</span><div class="track"><i style="width:${value == null ? 0 : clamp((value - 1) / 4 * 100, 0, 100)}%"></i></div><b>${fmt(value,2)} · #${intFmt(legacyRank(row, code))}</b></div>`;
        }).join("")}</div></article>
      </div>
      <div class="lpiw-family-warning">${esc(tr("familyWarning"))}</div>
    </section>`;
  }

  function projectPoint(lon, lat, width = 1000, height = 500) {
    return [(lon + 180) / 360 * width, (90 - lat) / 180 * height];
  }
  function polygonPath(coordinates) {
    const ringPath = (ring) => ring.map(([lon, lat], index) => {
      const [x, y] = projectPoint(lon, lat);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") + " Z";
    const polygon = (rings) => rings.map(ringPath).join(" ");
    if (!Array.isArray(coordinates?.[0]?.[0]?.[0])) return polygon(coordinates);
    return coordinates.map(polygon).join(" ");
  }
  function percentileBin(percentile) {
    if (!Number.isFinite(percentile)) return 0;
    return clamp(Math.ceil((percentile + 0.000001) / (100 / 7)), 1, 7);
  }

  function mapSvg(rows) {
    if (!S.geo?.features) return `<div class="lpiw-no-data">${esc(tr("noMapData"))}</div>`;
    const byIso = new Map(rows.map((row) => [row.iso3, row]));
    const pointMap = new Map((S.geo.points || []).map((point) => [point.iso3, point]));
    const polygons = S.geo.features.map((feature) => {
      const iso3 = feature.properties?.iso3 || feature.id;
      const row = byIso.get(iso3);
      const percentile = row ? currentPercentile(row) : null;
      const bin = percentileBin(percentile);
      return `<path class="country ${bin ? `bin-${bin}` : ""} ${iso3 === S.selectedIso ? "is-selected" : ""}" d="${polygonPath(feature.geometry.coordinates)}" data-lpiw-action="map-country" data-iso="${esc(iso3)}" data-value="${esc(row ? fmt(currentValue(row)) : "—")}" data-rank="${esc(row ? currentRank(row) : "")}" tabindex="${iso3 === S.selectedIso ? "0" : "-1"}" aria-label="${esc(`${countryName(row || iso3)}: ${row ? fmt(currentValue(row)) : tr("noData")}`)}"></path>`;
    }).join("");
    const polygonIds = new Set(S.geo.features.map((feature) => feature.properties?.iso3 || feature.id));
    const points = rows.filter((row) => !polygonIds.has(row.iso3) && pointMap.has(row.iso3)).map((row) => {
      const point = pointMap.get(row.iso3); const [x, y] = projectPoint(point.lon, point.lat); const bin = percentileBin(currentPercentile(row));
      return `<circle class="point bin-${bin} ${row.iso3 === S.selectedIso ? "is-selected" : ""}" cx="${x}" cy="${y}" r="3.6" data-lpiw-action="map-country" data-iso="${esc(row.iso3)}" data-value="${esc(fmt(currentValue(row)))}" data-rank="${esc(currentRank(row))}" tabindex="${row.iso3 === S.selectedIso ? "0" : "-1"}" aria-label="${esc(`${countryName(row)}: ${fmt(currentValue(row))}`)}"></circle>`;
    }).join("");
    return `<svg class="lpiw-map" viewBox="0 0 1000 500" role="group" aria-label="${esc(tr("mapTitle"))}">${polygons}${points}</svg>`;
  }

  function histogramSvg(rows) {
    const values = rows.map(currentValue).filter(Number.isFinite);
    if (!values.length) return `<div class="lpiw-no-data">${esc(tr("noData"))}</div>`;
    const min = Math.min(...values), max = Math.max(...values), bins = 12;
    const span = max - min || 1;
    const counts = Array.from({ length: bins }, () => 0);
    values.forEach((value) => counts[Math.min(bins - 1, Math.floor((value - min) / span * bins))]++);
    const maxCount = Math.max(...counts);
    const width = 680, height = 220, left = 36, right = 12, top = 16, bottom = 30;
    const barWidth = (width - left - right) / bins;
    const selected = currentValue(currentRow());
    const selectedBin = Number.isFinite(selected) ? Math.min(bins - 1, Math.floor((selected - min) / span * bins)) : -1;
    return `<svg class="lpiw-histogram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("distribution"))}"><line class="axis" x1="${left}" y1="${height-bottom}" x2="${width-right}" y2="${height-bottom}"/>${counts.map((count, index) => {
      const h = maxCount ? count / maxCount * (height - top - bottom) : 0;
      return `<rect class="bar ${index === selectedBin ? "is-selected" : ""}" x="${left + index * barWidth + 2}" y="${height-bottom-h}" width="${Math.max(1,barWidth-4)}" height="${h}"/><text x="${left + index*barWidth + barWidth/2}" y="${height-10}" text-anchor="middle">${index % 2 === 0 ? fmt(min + span * index / bins, 1) : ""}</text>`;
    }).join("")}</svg>`;
  }

  function observationProfile(row) {
    if (!row) return `<div class="lpiw-no-data">${esc(tr("noData"))}</div>`;
    if (S.family === "lpi2") return `<div class="lpiw-profile-list"><div class="lpiw-profile-row"><span>${esc(tr("indicator"))}</span><b>${esc(indicatorName(indicator()))}</b></div><div class="lpiw-profile-row"><span>${esc(tr("metric"))}</span><b>${esc(metricName(indicator(), S.lpi2Metric))}</b></div><div class="lpiw-profile-row"><span>${esc(tr("direction"))}</span><b>${esc(directionName(indicator()?.score_direction))}</b></div><div class="lpiw-profile-row"><span>${esc(tr("observationGroup"))}</span><b>${esc(row.obs_group || "—")}</b></div><div class="lpiw-profile-row"><span>${esc(tr("observationStatus"))}</span><b>${esc(row.obs_status || "—")}</b></div><div class="lpiw-profile-row"><span>${esc(tr("observationConfidence"))}</span><b>${esc(row.obs_conf || "—")}</b></div></div>`;
    return `<div class="lpiw-profile-list"><div class="lpiw-profile-row"><span>${esc(tr("officialScore"))}</span><b>${fmt(legacyValue(row),2)}</b></div><div class="lpiw-profile-row"><span>${esc(tr("officialRank"))}</span><b>#${intFmt(legacyRank(row))}</b></div><div class="lpiw-profile-row"><span>${esc(tr("confidenceInterval"))}</span><b>${fmt(row.confidence_interval,3)}</b></div><div class="lpiw-profile-row"><span>${esc(tr("highestPerformer"))}</span><b>${fmt(row.highest_performer_percent,1)}%</b></div><div class="lpiw-profile-row"><span>${esc(tr("sourceRow"))}</span><b>${intFmt(row.source_order)}</b></div></div>`;
  }

  function geographyMarkup() {
    const rows = currentRows(); const row = currentRow();
    return `<section class="iw-section" id="lpi-geography">
      <div class="iw-section-heading"><span>${esc(tr("geographyKicker"))}</span><h2>${esc(tr("mapTitle"))}</h2><p>${esc(tr("mapText"))}</p></div>
      <div class="iw-analysis-grid">
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(S.family === "lpi2" ? indicatorName(indicator()) : componentName(S.legacyComponent))}</span><h3>${esc(`${S.family === "lpi2" ? S.lpi2Year : S.legacyYear} · ${tr("coverage")} ${rows.length}`)}</h3></div></div><div class="lpiw-map-frame">${mapSvg(rows)}<div class="lpiw-tooltip" role="status" aria-live="polite"></div></div><div class="lpiw-map-legend"><span><i class="best"></i> ${esc(tr("best"))}</span><span><i class="mid"></i> ${esc(tr("middle"))}</span><span><i class="low"></i> ${esc(tr("lower"))}</span><span><i class="empty"></i> ${esc(tr("noMapData"))}</span><span>${esc(tr("mapKeyboard"))}</span></div></article>
        <div class="iw-panel-stack"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(tr("distribution"))}</span><h3>${esc(S.family === "lpi2" ? metricName(indicator(), S.lpi2Metric) : componentName(S.legacyComponent))}</h3></div></div><div class="iw-chart-frame">${histogramSvg(rows)}</div></article><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(tr("profile"))}</span><h3>${esc(countryName(row || S.selectedIso))}</h3></div><button type="button" class="iw-button" data-lpiw-action="evidence" data-iso="${esc(S.selectedIso)}" ${row ? "" : "disabled"}>${esc(tr("evidence"))}</button></div>${observationProfile(row)}</article></div>
      </div>
    </section>`;
  }

  function compareRows() {
    return S.compare.map((iso3) => currentRow(iso3)).filter(Boolean);
  }
  function comparisonMarkup() {
    const rows = currentRows(); const compared = compareRows(); const stats = rowStats(rows);
    const options = rows.slice().sort((a,b) => countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru")).filter((row) => !S.compare.includes(row.iso3)).map((row) => `<option value="${esc(row.iso3)}">${esc(countryName(row))} · ${esc(row.iso3)}</option>`).join("");
    return `<section class="iw-section" id="lpi-comparison"><div class="iw-section-heading"><span>${esc(tr("comparisonKicker"))}</span><h2>${esc(tr("comparisonTitle"))}</h2><p>${esc(tr("comparisonText"))}</p></div><article class="iw-panel"><div class="lpiw-compare-controls"><label>${esc(tr("addCountry"))}<select id="lpiwCompareSelect">${options || `<option value="">—</option>`}</select></label><button type="button" class="iw-button" data-lpiw-action="add-compare" ${S.compare.length >= 5 || !options ? "disabled" : ""}>${esc(tr("add"))}</button><button type="button" class="iw-button" data-lpiw-action="reset-compare">${esc(tr("reset"))}</button></div><div class="lpiw-compare-list">${compared.map((row) => {
      const value = currentValue(row); const pct = stats.max === stats.min ? 100 : clamp((value - stats.min) / (stats.max - stats.min) * 100, 0, 100);
      return `<div class="lpiw-compare-row"><button type="button" data-lpiw-action="country" data-iso="${esc(row.iso3)}">${flag(row)}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)} · #${intFmt(currentRank(row))}</small></span></button><div class="lpiw-compare-bar"><i style="width:${pct}%"></i></div><b>${fmt(value, S.family === "legacy" ? 2 : 2)} ${esc(S.family === "lpi2" ? row.unit : "")}</b>${S.compare.length > 2 ? `<button type="button" class="iw-button" data-lpiw-action="remove-compare" data-iso="${esc(row.iso3)}" aria-label="${esc(tr("remove"))}">×</button>` : ""}</div>`;
    }).join("") || `<div class="lpiw-no-data">${esc(tr("noData"))}</div>`}</div></article></section>`;
  }

  function rankingRows() {
    const query = S.query.trim().toLocaleLowerCase(S.context?.lang === "en" ? "en" : "ru");
    let rows = currentRows().filter((row) => !query || `${countryName(row)} ${row.name} ${row.iso3}`.toLocaleLowerCase().includes(query));
    const direction = S.direction === "desc" ? -1 : 1;
    rows = rows.slice().sort((a,b) => {
      let result = 0;
      if (S.sort === "country") result = countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru");
      else if (S.sort === "value") result = (currentValue(a) ?? Infinity) - (currentValue(b) ?? Infinity);
      else result = (currentRank(a) ?? Infinity) - (currentRank(b) ?? Infinity);
      return result * direction;
    });
    return rows;
  }

  function metricControls() {
    if (S.family === "legacy") return `<label>${esc(tr("indicator"))}<select id="lpiwRankingComponent">${S.data.legacyCatalog.map((item) => `<option value="${esc(item.indicator_code)}" ${item.indicator_code === S.legacyComponent ? "selected" : ""}>${esc(indicatorName(item))}</option>`).join("")}</select></label><label>${esc(tr("year"))}<select id="lpiwRankingYear">${LEGACY_YEARS.map((year) => `<option value="${year}" ${year === S.legacyYear ? "selected" : ""}>${year}</option>`).join("")}</select></label>`;
    const item = indicator();
    return `<label class="is-wide">${esc(tr("indicator"))}<select id="lpiwRankingIndicator">${S.data.lpi2Catalog.map((entry) => `<option value="${esc(entry.indicator_code)}" ${entry.indicator_code === S.lpi2Indicator ? "selected" : ""}>${esc(indicatorName(entry))}</option>`).join("")}</select></label><label>${esc(tr("metric"))}<select id="lpiwRankingMetric">${item.metrics.map((metric) => `<option value="${esc(metric.code)}" ${metric.code === S.lpi2Metric ? "selected" : ""}>${esc(metric.name)}</option>`).join("")}</select></label><label>${esc(tr("year"))}<select id="lpiwRankingYear">${LPI2_YEARS.map((year) => `<option value="${year}" ${year === S.lpi2Year ? "selected" : ""}>${year}</option>`).join("")}</select></label>`;
  }

  function rankingMarkup() {
    const rows = rankingRows(); const totalPages = Math.max(1, Math.ceil(rows.length / S.pageSize)); S.page = clamp(S.page, 0, totalPages - 1); const pageRows = rows.slice(S.page * S.pageSize, (S.page + 1) * S.pageSize);
    return `<section class="iw-section" id="lpi-ranking"><div class="iw-section-heading"><span>${esc(tr("rankingKicker"))}</span><h2>${esc(tr("rankingTitle"))}</h2><p>${esc(S.family === "lpi2" ? tr("rankingTextLpi2") : tr("rankingTextLegacy"))}</p></div><article class="iw-panel"><div class="lpiw-ranking-tools">${metricControls()}<label class="is-wide">${esc(tr("search"))}<input id="lpiwRankingSearch" type="search" value="${esc(S.query)}" placeholder="${esc(tr("search"))}"></label><label>${esc(tr("sort"))}<select id="lpiwSort"><option value="rank" ${S.sort === "rank" ? "selected" : ""}>${esc(tr("byRank"))}</option><option value="value" ${S.sort === "value" ? "selected" : ""}>${esc(tr("byValue"))}</option><option value="country" ${S.sort === "country" ? "selected" : ""}>${esc(tr("byCountry"))}</option></select></label><label>${esc(tr("sort"))}<select id="lpiwDirection"><option value="asc" ${S.direction === "asc" ? "selected" : ""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction === "desc" ? "selected" : ""}>${esc(tr("descending"))}</option></select></label><label>${esc(tr("rows"))}<select id="lpiwPageSize">${[10,25,50,100].map((size) => `<option value="${size}" ${size === S.pageSize ? "selected" : ""}>${size}</option>`).join("")}</select></label><button type="button" class="iw-button" data-lpiw-action="export">${esc(tr("exportCsv"))}</button></div><div class="iw-table-wrap"><table class="iw-table"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("selectedCountry"))}</th><th>${esc(tr("value"))}</th><th>${esc(tr("percentile"))}</th><th>${esc(tr("dataStatus"))}</th><th><span class="sr-only">${esc(tr("evidence"))}</span></th></tr></thead><tbody>${pageRows.map((row) => `<tr class="${row.iso3 === S.selectedIso ? "is-selected" : ""}"><td><b>#${intFmt(currentRank(row))}</b>${S.family === "lpi2" && row.tied ? `<small>${esc(tr("tie"))}</small>` : ""}</td><td><button type="button" class="iw-country-cell" data-lpiw-action="country" data-iso="${esc(row.iso3)}">${flag(row)}<span><b>${esc(countryName(row))}</b><small>${esc(row.iso3)}</small></span></button></td><td class="${currentPercentile(row) >= 75 ? "is-good" : currentPercentile(row) < 25 ? "is-bad" : ""}"><b>${fmt(currentValue(row), S.family === "legacy" ? 2 : 2)}</b><small>${esc(S.family === "lpi2" ? row.unit : "/ 5")}</small></td><td>${currentPercentile(row) == null ? "—" : `${fmt(currentPercentile(row),1)}%`}</td><td><span class="iw-status-chip">${esc(S.family === "lpi2" ? tr("derivedRank") : tr("officialRank"))}</span></td><td><button type="button" class="lpiw-evidence-button" data-lpiw-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(tr("evidence"))}">i</button></td></tr>`).join("")}</tbody></table></div><div class="lpiw-page-controls"><span>${esc(tr("page"))} ${S.page + 1} / ${totalPages} · ${intFmt(rows.length)}</span><div><button type="button" class="iw-button" data-lpiw-action="previous-page" ${S.page === 0 ? "disabled" : ""}>${esc(tr("previous"))}</button><button type="button" class="iw-button" data-lpiw-action="next-page" ${S.page + 1 >= totalPages ? "disabled" : ""}>${esc(tr("next"))}</button></div></div></article></section>`;
  }

  function methodologyMarkup() {
    const raw = S.data.provenance.raw_snapshots;
    const normalized = S.data.provenance.normalized_snapshots;
    return `<section class="iw-section"><div class="iw-section-heading"><span>${esc(tr("methodologyKicker"))}</span><h2>${esc(tr("methodologyTitle"))}</h2><p>${esc(tr("methodologyText"))}</p></div><div class="iw-method-grid"><article class="iw-method-card"><span>LPI 2.0</span><h3>${esc(tr("operationalTitle"))}</h3><p>${esc(tr("leadLpi2"))}</p><dl><div><dt>${esc(tr("availableYears"))}</dt><dd>2023–2024</dd></div><div><dt>${esc(tr("dataPoints"))}</dt><dd>${intFmt(S.data.lpi2Rows.length)}</dd></div><div><dt>${esc(tr("rawSnapshot"))}</dt><dd><code>${esc(shortHash(raw.lpi2.sha256))}</code></dd></div></dl></article><article class="iw-method-card"><span>Legacy LPI</span><h3>${esc(tr("historicalTitle"))}</h3><p>${esc(tr("leadLegacy"))}</p><dl><div><dt>${esc(tr("availableYears"))}</dt><dd>2007–2023</dd></div><div><dt>${esc(tr("dataPoints"))}</dt><dd>${intFmt(S.data.legacyRows.length)}</dd></div><div><dt>${esc(tr("rawSnapshot"))}</dt><dd><code>${esc(shortHash(raw.legacy.sha256))}</code></dd></div></dl></article><article class="iw-method-card"><span>Provenance</span><h3>${esc(tr("source"))}</h3><p>${esc(S.data.overview.attribution)}</p><dl><div><dt>${esc(tr("license"))}</dt><dd>CC BY 4.0</dd></div><div><dt>${esc(tr("transform"))}</dt><dd><code>${esc(S.data.provenance.extraction.transform_id)}</code></dd></div><div><dt>${esc(tr("normalizedSnapshot"))}</dt><dd><code>${esc(shortHash(S.family === "lpi2" ? normalized.lpi2.sha256 : normalized.legacy.sha256))}</code></dd></div></dl></article></div><div class="iw-source-list"><a href="${esc(S.data.source.official_site)}" target="_blank" rel="noopener noreferrer">${esc(tr("source"))} ↗</a><a href="${esc(S.data.source.report_url)}" target="_blank" rel="noopener noreferrer">${esc(tr("report"))} ↗</a><a href="${esc(S.data.source.methodology_url)}" target="_blank" rel="noopener noreferrer">${esc(tr("methodology"))} ↗</a><a href="${esc(S.family === "lpi2" ? S.data.source.data360_lpi2_url : S.data.source.data360_legacy_url)}" target="_blank" rel="noopener noreferrer">${esc(tr("data360"))} ↗</a></div></section>`;
  }

  function evidenceFields(row) {
    const p = S.data.provenance;
    if (S.family === "lpi2") return [
      [tr("family"), "lpi2_operational"], [tr("publisher"), "World Bank"], [tr("year"), row.year], [tr("indicator"), `${indicatorName(indicator())} (${row.indicator})`], [tr("metric"), `${metricName(indicator(), row.metric)} (${row.metric})`], [tr("value"), `${row.value_text} ${row.unit}`], [tr("rank"), `#${row.rank} · ${tr("derivedRank")}`], [tr("percentile"), `${fmt(row.percentile, 3)}%`], [tr("coverage"), row.population], [tr("sourceRow"), row.source_row], [tr("observationGroup"), row.obs_group], [tr("observationStatus"), row.obs_status], [tr("observationConfidence"), row.obs_conf], [tr("rawSnapshot"), p.raw_snapshots.lpi2.sha256], [tr("normalizedSnapshot"), p.normalized_snapshots.lpi2.sha256], [tr("rowHash"), row.row_sha256], [tr("transform"), p.extraction.transform_id], [tr("formula"), p.extraction.formula_version], [tr("license"), "CC-BY-4.0"],
    ];
    return [
      [tr("family"), "legacy_survey"], [tr("publisher"), "World Bank"], [tr("year"), row.year], [tr("indicator"), componentName(S.legacyComponent)], [tr("officialScore"), fmt(legacyValue(row), 6)], [tr("officialRank"), `#${intFmt(legacyRank(row))}`], [tr("confidenceInterval"), row.confidence_interval], [tr("highestPerformer"), row.highest_performer_percent], [tr("sourceRow"), row.source_order], [tr("sourceRows"), row.source_rows_json], [tr("rawSnapshot"), p.raw_snapshots.legacy.sha256], [tr("normalizedSnapshot"), p.normalized_snapshots.legacy.sha256], [tr("rowHash"), row.row_sha256], [tr("transform"), p.extraction.transform_id], [tr("formula"), p.extraction.formula_version], [tr("license"), "CC-BY-4.0"],
    ];
  }

  function evidenceMarkup() {
    if (!S.evidence) return "";
    const row = currentRow(S.evidence);
    if (!row) return "";
    const fields = evidenceFields(row);
    return `<div class="lpiw-drawer-backdrop" data-lpiw-action="close-evidence"><aside class="lpiw-drawer" role="dialog" aria-modal="true" aria-labelledby="lpiwEvidenceTitle"><header class="lpiw-drawer-head"><div><span>${esc(tr("evidence"))}</span><h2 id="lpiwEvidenceTitle">${esc(countryName(row))}</h2></div><button type="button" class="iw-button" data-lpiw-action="close-evidence" aria-label="${esc(tr("close"))}">×</button></header><div class="lpiw-drawer-body"><section class="lpiw-evidence-card"><h3>${esc(S.family === "lpi2" ? indicatorName(indicator()) : componentName(S.legacyComponent))}</h3><dl class="lpiw-evidence-list">${fields.map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${String(value || value === 0).length > 48 ? `<code>${esc(value)}</code>` : esc(value ?? "—")}</dd></div>`).join("")}</dl></section><section class="lpiw-evidence-card"><h3>${esc(tr("source"))}</h3><div class="iw-source-list"><a href="${esc(S.family === "lpi2" ? S.data.source.data360_lpi2_url : S.data.source.data360_legacy_url)}" target="_blank" rel="noopener noreferrer">${esc(tr("openSource"))} ↗</a><a href="${esc(S.data.source.methodology_url)}" target="_blank" rel="noopener noreferrer">${esc(tr("openMethodology"))} ↗</a></div></section></div></aside></div>`;
  }

  function loadingMarkup() { return `<section class="index-workspace lpiw"><div class="iw-loading"><span></span><p>${esc(tr("loading"))}</p></div></section>`; }
  function errorMarkup(error) { return `<section class="index-workspace lpiw"><article class="iw-panel lpiw-no-data"><div><h2>${esc(tr("loadError"))}</h2><p>${esc(error?.message || error)}</p><button type="button" class="iw-button" data-lpiw-action="retry">${esc(tr("retry"))}</button></div></article></section>`; }

  function workspaceMarkup() {
    const row = currentRow();
    return `<div class="index-workspace lpiw" data-family="${esc(S.family)}" data-year="${S.family === "lpi2" ? S.lpi2Year : S.legacyYear}">${heroMarkup(row)}${findingsMarkup()}${S.family === "lpi2" ? lpi2ArchitectureMarkup() : legacyArchitectureMarkup()}${geographyMarkup()}${comparisonMarkup()}${rankingMarkup()}${methodologyMarkup()}${evidenceMarkup()}</div>`;
  }

  function selectCountry(iso3) {
    S.selectedIso = String(iso3 || S.selectedIso).toUpperCase();
    if (!S.compare.includes(S.selectedIso)) S.compare.unshift(S.selectedIso);
    S.compare = Array.from(new Set(S.compare)).slice(0, 5);
    S.context?.setCountry?.(S.selectedIso);
    rerender();
  }

  function setFamily(family) {
    S.family = family === "legacy" ? "legacy" : "lpi2";
    S.page = 0; S.query = ""; S.evidence = null;
    const year = S.family === "lpi2" ? S.lpi2Year : S.legacyYear;
    S.context?.setYear?.(year, S.family);
    rerender();
  }

  function setIndicator(code, metric) {
    const item = S.data.indicatorMap.get(code);
    if (!item) return;
    S.lpi2Indicator = code;
    const metrics = item.metrics.map((entry) => entry.code);
    S.lpi2Metric = metrics.includes(metric) ? metric : item.default_metric_code || metrics[0];
    S.page = 0; S.query = ""; S.evidence = null;
    rerender("lpi-architecture");
  }

  function resetComparison() {
    const preferred = [S.selectedIso, "DEU", "SGP", "NLD", "USA"];
    S.compare = preferred.filter((iso3, index) => preferred.indexOf(iso3) === index && currentRow(iso3)).slice(0, 3);
    if (S.compare.length < 2) S.compare = currentRows().slice(0, 3).map((row) => row.iso3);
  }

  function exportCsv() {
    const rows = rankingRows();
    const headers = S.family === "lpi2" ? ["year","iso3","country","indicator","metric","unit","official_value","gir_derived_rank","tied_rank","gir_percentile","source_row","row_sha256"] : ["year","iso3","country","component","official_score","official_rank","source_order","row_sha256"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    for (const row of rows) {
      const values = S.family === "lpi2" ? [row.year,row.iso3,countryName(row),row.indicator,row.metric,row.unit,row.value_text,row.rank,row.tied,row.percentile,row.source_row,row.row_sha256] : [row.year,row.iso3,countryName(row),S.legacyComponent,legacyValue(row),legacyRank(row),row.source_order,row.row_sha256];
      lines.push(values.map(quote).join(","));
    }
    const blob = new Blob(["\ufeff", lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `world_bank_lpi_${S.family}_${S.family === "lpi2" ? S.lpi2Year : S.legacyYear}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function tooltip(node, event) {
    const tip = S.context.root.querySelector(".lpiw-tooltip"); if (!tip) return;
    const iso3 = node.dataset.iso; const row = currentRow(iso3);
    tip.innerHTML = `<strong>${esc(countryName(row || iso3))}</strong><span>${row ? `${fmt(currentValue(row))} ${esc(S.family === "lpi2" ? row.unit : "/ 5")} · #${intFmt(currentRank(row))}` : esc(tr("noData"))}</span>`;
    tip.classList.add("is-open");
    const rect = node.getBoundingClientRect();
    tip.style.left = `${clamp(event?.clientX || rect.left + rect.width / 2, 12, window.innerWidth - 280)}px`;
    tip.style.top = `${clamp((event?.clientY || rect.top) + 14, 12, window.innerHeight - 90)}px`;
  }
  function hideTooltip() { S.context.root.querySelector(".lpiw-tooltip")?.classList.remove("is-open"); }

  function bind() {
    const root = S.context.root;
    root.addEventListener("click", (event) => {
      const control = event.target.closest("[data-lpiw-action]"); if (!control) return;
      const action = control.dataset.lpiwAction;
      if (action === "retry") return render(S.context, { force: true });
      if (action === "family") return setFamily(control.dataset.family);
      if (action === "jump") return root.querySelector(`#${CSS.escape(control.dataset.target || "")}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (action === "indicator") return setIndicator(control.dataset.indicator, control.dataset.metric);
      if (action === "country" || action === "map-country") return selectCountry(control.dataset.iso);
      if (action === "add-compare") { const iso3 = root.querySelector("#lpiwCompareSelect")?.value; if (iso3 && !S.compare.includes(iso3) && S.compare.length < 5) S.compare.push(iso3); return rerender("lpi-comparison"); }
      if (action === "remove-compare") { if (S.compare.length > 2) S.compare = S.compare.filter((iso3) => iso3 !== control.dataset.iso); return rerender("lpi-comparison"); }
      if (action === "reset-compare") { resetComparison(); return rerender("lpi-comparison"); }
      if (action === "previous-page") { S.page = Math.max(0, S.page - 1); return rerender("lpi-ranking"); }
      if (action === "next-page") { S.page += 1; return rerender("lpi-ranking"); }
      if (action === "evidence") { S.evidence = control.dataset.iso; return rerender(); }
      if (action === "close-evidence") { if (event.target === control || control.closest(".lpiw-drawer")) { S.evidence = null; return rerender(); } }
      if (action === "export") return exportCsv();
    });
    root.addEventListener("change", (event) => {
      const target = event.target;
      if (target.id === "lpiwLegacyComponent" || target.id === "lpiwRankingComponent") { S.legacyComponent = target.value; S.page = 0; S.evidence = null; return rerender(target.id === "lpiwLegacyComponent" ? "lpi-architecture" : "lpi-ranking"); }
      if (target.id === "lpiwRankingIndicator") return setIndicator(target.value, S.data.indicatorMap.get(target.value)?.default_metric_code);
      if (target.id === "lpiwRankingMetric") { S.lpi2Metric = target.value; S.page = 0; S.evidence = null; return rerender("lpi-ranking"); }
      if (target.id === "lpiwRankingYear") {
        const year = Number(target.value);
        if (S.family === "lpi2") S.lpi2Year = year; else S.legacyYear = year;
        S.context?.setYear?.(year, S.family); S.page = 0; S.evidence = null; return rerender("lpi-ranking");
      }
      if (target.id === "lpiwSort") { S.sort = target.value; S.page = 0; return rerender("lpi-ranking"); }
      if (target.id === "lpiwDirection") { S.direction = target.value; S.page = 0; return rerender("lpi-ranking"); }
      if (target.id === "lpiwPageSize") { S.pageSize = Number(target.value) || 25; S.page = 0; return rerender("lpi-ranking"); }
    });
    const search = root.querySelector("#lpiwRankingSearch");
    if (search) {
      let timer;
      search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { S.query = search.value; S.page = 0; rerender("lpi-ranking"); }, 180); });
    }
    const mapNodes = Array.from(root.querySelectorAll("[data-lpiw-action='map-country']"));
    mapNodes.forEach((node, index) => {
      node.addEventListener("pointerenter", (event) => tooltip(node, event)); node.addEventListener("pointermove", (event) => tooltip(node, event)); node.addEventListener("pointerleave", hideTooltip); node.addEventListener("focus", () => tooltip(node)); node.addEventListener("blur", hideTooltip);
      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectCountry(node.dataset.iso); }
        else if (["ArrowRight","ArrowDown","ArrowLeft","ArrowUp"].includes(event.key)) { event.preventDefault(); const delta = ["ArrowRight","ArrowDown"].includes(event.key) ? 1 : -1; const next = mapNodes[(index + delta + mapNodes.length) % mapNodes.length]; node.tabIndex = -1; next.tabIndex = 0; next.focus(); }
        else if (event.key === "Escape") hideTooltip();
      });
    });
    document.addEventListener("keydown", escapeEvidence, { once: true });
  }

  function escapeEvidence(event) {
    if (event.key === "Escape" && S.evidence) { S.evidence = null; rerender(); }
  }

  function rerender(anchor = "") {
    const scrollY = window.scrollY;
    paint();
    if (anchor) S.context.root.querySelector(`#${CSS.escape(anchor)}`)?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: scrollY, behavior: "auto" });
  }

  function paint() {
    ensureState();
    if (!currentRow() && currentRows().length && !currentRows().some((row) => row.iso3 === S.selectedIso)) {
      // Keep the platform-selected country even when a specific operational indicator has no observation.
    }
    S.context.root.innerHTML = workspaceMarkup();
    bind();
    document.documentElement.dataset.worldBankLpiReady = "true";
    document.documentElement.dataset.worldBankLpiFamily = S.family;
    window.dispatchEvent(new CustomEvent("gir:world-bank-lpi-ready", { detail: { family: S.family, iso3: S.selectedIso, year: S.family === "lpi2" ? S.lpi2Year : S.legacyYear, indicator: S.family === "lpi2" ? S.lpi2Indicator : S.legacyComponent } }));
  }

  async function render(context, options = {}) {
    if (!context?.root) throw new Error("World Bank LPI workspace requires a root element");
    if (!context.country) return;
    S.context = context;
    S.selectedIso = String(context.country).toUpperCase();
    const token = ++S.renderToken;
    context.root.innerHTML = loadingMarkup();
    document.documentElement.dataset.worldBankLpiReady = "false";
    try {
      if (options.force) { S.loadPromise = null; S.data = null; S.parsed = false; }
      await load();
      if (token !== S.renderToken) return;
      paint();
    } catch (error) {
      if (token !== S.renderToken) return;
      console.error("World Bank LPI workspace failed", error);
      context.root.innerHTML = errorMarkup(error);
      context.root.querySelector("[data-lpiw-action='retry']")?.addEventListener("click", () => render(context, { force: true }));
      document.documentElement.dataset.worldBankLpiReady = "error";
    }
  }

  function invalidate() { S.renderToken += 1; }
  window.addEventListener("pagehide", () => { S.renderToken += 1; });
  function setProduct(family) { if (S.data) setFamily(family); else S.family = family === "legacy" ? "legacy" : "lpi2"; }

  const api = Object.freeze({ render, invalidate, setProduct, version: "12.0.0-stage12-native" });
  window.GIRWorldBankLPI = api;
  window.GIRWorldBankLPIWorkspace = api;
})();
