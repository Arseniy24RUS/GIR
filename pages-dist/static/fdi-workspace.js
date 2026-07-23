/* GIR · IMF Financial Development Index · native workspace */
(() => {
  "use strict";

  const API_ROOT = "/api/economy-finance/fdi";
  const GEO_URLS = ["/static/world_countries_lite.geojson", "/static/world.geojson", "/world.geojson"];
  const SOURCE_URL = "https://data.imf.org/en/datasets/IMF.MCM%3AFDI";
  const METHODOLOGY_URL = "https://www.imf.org/external/pubs/ft/wp/2016/wp1605.pdf";
  const MAX_COMPARE = 6;
  const SERIES_CLASSES = ["fdi-series-0", "fdi-series-1", "fdi-series-2", "fdi-series-3", "fdi-series-4", "fdi-series-5"];
  const BRANCHES = {
    FI: ["FID", "FIA", "FIE"],
    FM: ["FMD", "FMA", "FME"]
  };
  const ASPECT_LABELS = {
    depth: {ru: "Глубина", en: "Depth"},
    access: {ru: "Доступ", en: "Access"},
    efficiency: {ru: "Эффективность", en: "Efficiency"}
  };

  const I18N = {
    ru: {
      loading: "Загрузка IMF Financial Development Index",
      loadingText: "GIR читает опубликованный локальный снимок IMF и готовит аналитический слой.",
      unavailable: "IMF Financial Development Index пока не загружен",
      unavailableText: "Backend установлен, но официальный SDMX-снимок IMF ещё не опубликован в локальном хранилище GIR.",
      loadCommand: "python -m giip.economy_finance.fdi_cli download",
      importCommand: "python -m giip.economy_finance.fdi_cli import-file /path/to/imf_fdi_export.csv",
      verifyCommand: "python -m giip.economy_finance.fdi_cli verify",
      error: "Не удалось открыть рабочую область IMF FDI",
      retry: "Повторить",
      overline: "Экономика и финансы · официальный международный индекс",
      title: "Финансовое развитие",
      lead: "Глубина, доступность и эффективность финансовых институтов и рынков — в единой сопоставимой системе IMF.",
      source: "International Monetary Fund",
      official: "Официальное значение IMF",
      derived: "Место и динамика рассчитаны GIR",
      snapshot: "Локальный воспроизводимый снимок",
      qa: "QA FIXTURE · НЕОФИЦИАЛЬНЫЕ ЗНАЧЕНИЯ",
      sourceButton: "Официальный источник",
      methodButton: "Методика IMF",
      exportCsv: "Скачать CSV",
      economy: "Страна",
      indicator: "Показатель",
      year: "Год данных",
      release: "Выпуск",
      score: "Индекс IMF",
      rank: "Место GIR",
      percentile: "Процентиль",
      economies: "стран",
      navigation: "Навигация по IMF FDI",
      navPosition: "Позиция",
      navMap: "Карта",
      navArchitecture: "Архитектура",
      navTrend: "Динамика",
      navCompare: "Сравнение",
      navRanking: "Рейтинг",
      navMethod: "Методология",
      s1Kicker: "01 · Позиция страны",
      s1Title: "Текущий профиль финансовой системы",
      s1Text: "Официальные значения IMF отделены от места, процентиля и изменений, рассчитанных GIR внутри одного снимка.",
      rankOf: "Место среди стран",
      change5: "Изменение за 5 лет",
      rankChange5: "Изменение места за 5 лет",
      institutionMarketGap: "Институты − рынки",
      strongestComponent: "Сильнейший компонент",
      distanceMedian: "Отклонение от медианы",
      aboveMedian: "выше медианы",
      belowMedian: "ниже медианы",
      officialNotice: "GIR импортирует девять готовых официальных рядов IMF и не воспроизводит PCA-агрегацию по исходным финансовым показателям.",
      derivedNotice: "Соревновательное место, процентиль и изменения — производный аналитический слой GIR.",
      branches: "Две опоры финансовой системы",
      institutions: "Финансовые институты",
      markets: "Финансовые рынки",
      overall: "Общий индекс",
      depth: "Глубина",
      access: "Доступ",
      efficiency: "Эффективность",
      s2Kicker: "02 · Пространственное распределение",
      s2Title: "Мировая карта финансового развития",
      s2Text: "Карта использует штатную геометрию и цветовую шкалу GIR. Нажатие на страну меняет активный профиль.",
      worldMap: "Значение выбранного показателя по странам",
      mapHint: "Квантили: низкие → высокие",
      mapUnavailable: "Геометрия карты временно недоступна; рейтинг и временные ряды продолжают работать.",
      leaders: "Лидеры выбранного среза",
      selectedContext: "Положение выбранной страны",
      noData: "нет данных",
      s3Kicker: "03 · Архитектура индекса",
      s3Title: "Девять официальных рядов в одной иерархии",
      s3Text: "Общий FD объединяет финансовые институты и рынки; каждая ветвь раскрывается через глубину, доступ и эффективность.",
      architecture: "Пирамида финансового развития",
      selectIndicator: "Открыть показатель",
      balance: "Баланс институтов и рынков",
      balanceText: "Положительное значение означает более высокий показатель финансовых институтов, отрицательное — рынков.",
      aspectMatrix: "Глубина, доступ и эффективность",
      s4Kicker: "04 · Историческая динамика",
      s4Title: "Траектория внутри одного снимка",
      s4Text: "Исторический ряд берётся из одного неизменяемого выпуска; пропуски не интерполируются и не заполняются GIR.",
      trend: "Динамика официального значения IMF",
      trendSummary: "Сводка ряда",
      firstYear: "Первый год",
      latestYear: "Последний год",
      minimum: "Минимум",
      maximum: "Максимум",
      mean: "Среднее",
      bestYear: "Лучший год",
      snapshotTitle: "Сопоставимость снимка",
      snapshotText: "Сравнивайте значения внутри одного release snapshot: IMF может пересматривать исторические данные при обновлении входных источников.",
      s5Kicker: "05 · Сравнение",
      s5Title: "Сопоставление траекторий стран",
      s5Text: "Выберите до шести стран и один официальный показатель. Все линии используют общий диапазон 0–1.",
      addEconomy: "Добавить страну",
      compareLimit: "Можно выбрать не более шести стран.",
      remove: "Удалить",
      comparisonChart: "Сравнение выбранного показателя",
      currentComparison: "Текущий срез",
      s6Kicker: "06 · Полный рейтинг",
      s6Title: "Рейтинг по выбранному официальному ряду",
      s6Text: "Таблица сохраняет официальный показатель IMF и отдельно маркирует производные поля GIR.",
      search: "Поиск по стране или ISO3",
      sort: "Сортировка",
      sortRank: "По месту",
      sortScore: "По значению",
      sortChange: "По изменению за 5 лет",
      sortName: "По названию",
      shown: "Показано",
      noResults: "По заданному запросу ничего не найдено.",
      officialScore: "IMF · официальный",
      girRank: "Место · GIR",
      girPercentile: "Процентиль · GIR",
      delta1: "Δ 1 год · GIR",
      delta5: "Δ 5 лет · GIR",
      delta10: "Δ 10 лет · GIR",
      openEconomy: "Выбрать страну",
      s7Kicker: "07 · Методология и происхождение",
      s7Title: "Как читать IMF FDI в GIR",
      s7Text: "Рабочая область разделяет официальные показатели, производную аналитику GIR и техническое происхождение выпуска.",
      concept: "Официальная концепция",
      conceptText: "IMF оценивает финансовые институты и рынки по трём функциям: глубине, доступности и эффективности; шесть нижних субиндексов агрегируются в FI, FM и общий FD.",
      formula: "Аналитический слой GIR",
      formulaText: "Соревновательное место: 1, 2, 2, 4. Процентиль = 100 × (N − место) / (N − 1). Изменения считаются только внутри одного снимка.",
      caveat: "Ограничение интерпретации",
      caveatText: "Более высокий индекс означает более развитую финансовую систему, но сам по себе не измеряет её устойчивость, справедливость или отсутствие финансовых рисков.",
      provenance: "Происхождение выпуска",
      retrieved: "Получено",
      sha256: "SHA-256",
      parser: "Парсер",
      transformations: "Преобразования",
      coverage: "Покрытие",
      period: "Период",
      sourceMember: "Исходный файл / лист",
      notSpecified: "не указано",
      officialOrigin: "Источник официального значения",
      girOrigin: "Производные поля",
      officialOwner: "International Monetary Fund",
      gir: "GIR",
      selected: "Выбрано"
    },
    en: {
      loading: "Loading IMF Financial Development Index",
      loadingText: "GIR is reading the published local IMF snapshot and preparing its analytical layer.",
      unavailable: "IMF Financial Development Index has not been loaded yet",
      unavailableText: "The backend is installed, but no official IMF SDMX snapshot has been published to GIR's local store.",
      loadCommand: "python -m giip.economy_finance.fdi_cli download",
      importCommand: "python -m giip.economy_finance.fdi_cli import-file /path/to/imf_fdi_export.csv",
      verifyCommand: "python -m giip.economy_finance.fdi_cli verify",
      error: "The IMF FDI workspace could not be opened",
      retry: "Retry",
      overline: "Economy and finance · official international index",
      title: "Financial development",
      lead: "Depth, access and efficiency of financial institutions and markets in one comparable IMF framework.",
      source: "International Monetary Fund",
      official: "Official IMF value",
      derived: "Rank and change calculated by GIR",
      snapshot: "Local reproducible snapshot",
      qa: "QA FIXTURE · NON-OFFICIAL VALUES",
      sourceButton: "Official source",
      methodButton: "IMF methodology",
      exportCsv: "Download CSV",
      economy: "Country",
      indicator: "Indicator",
      year: "Data year",
      release: "Release",
      score: "IMF index",
      rank: "GIR rank",
      percentile: "Percentile",
      economies: "countries",
      navigation: "IMF FDI navigation",
      navPosition: "Position",
      navMap: "Map",
      navArchitecture: "Architecture",
      navTrend: "Trend",
      navCompare: "Comparison",
      navRanking: "Ranking",
      navMethod: "Methodology",
      s1Kicker: "01 · Country position",
      s1Title: "Current financial-system profile",
      s1Text: "Official IMF values are separated from the rank, percentile and changes calculated by GIR within one snapshot.",
      rankOf: "Rank among countries",
      change5: "Five-year change",
      rankChange5: "Five-year rank change",
      institutionMarketGap: "Institutions − markets",
      strongestComponent: "Strongest component",
      distanceMedian: "Distance from median",
      aboveMedian: "above median",
      belowMedian: "below median",
      officialNotice: "GIR imports the nine official IMF series and does not reproduce their PCA aggregation from underlying financial indicators.",
      derivedNotice: "Competition rank, percentile and changes are derived GIR analytical fields.",
      branches: "Two pillars of the financial system",
      institutions: "Financial institutions",
      markets: "Financial markets",
      overall: "Overall index",
      depth: "Depth",
      access: "Access",
      efficiency: "Efficiency",
      s2Kicker: "02 · Spatial distribution",
      s2Title: "World map of financial development",
      s2Text: "The map uses GIR's native geometry and colour scale. Selecting a country updates the active profile.",
      worldMap: "Selected official indicator by country",
      mapHint: "Quantiles: low → high",
      mapUnavailable: "Map geometry is temporarily unavailable; rankings and time series remain accessible.",
      leaders: "Leaders in the selected slice",
      selectedContext: "Selected country position",
      noData: "no data",
      s3Kicker: "03 · Index architecture",
      s3Title: "Nine official series in one hierarchy",
      s3Text: "Overall FD combines financial institutions and markets; each branch is decomposed into depth, access and efficiency.",
      architecture: "Financial-development pyramid",
      selectIndicator: "Open indicator",
      balance: "Institutions and markets balance",
      balanceText: "A positive value indicates stronger financial institutions; a negative value indicates stronger financial markets.",
      aspectMatrix: "Depth, access and efficiency",
      s4Kicker: "04 · Historical trend",
      s4Title: "Trajectory within one snapshot",
      s4Text: "The time series comes from one immutable release; missing observations are not interpolated or imputed by GIR.",
      trend: "Official IMF value over time",
      trendSummary: "Series summary",
      firstYear: "First year",
      latestYear: "Latest year",
      minimum: "Minimum",
      maximum: "Maximum",
      mean: "Average",
      bestYear: "Best year",
      snapshotTitle: "Snapshot comparability",
      snapshotText: "Compare values within one release snapshot: the IMF may revise historical observations when source inputs are refreshed.",
      s5Kicker: "05 · Comparison",
      s5Title: "Compare country trajectories",
      s5Text: "Select up to six countries and one official indicator. All lines use the common 0–1 range.",
      addEconomy: "Add country",
      compareLimit: "Up to six countries can be selected.",
      remove: "Remove",
      comparisonChart: "Selected indicator comparison",
      currentComparison: "Current slice",
      s6Kicker: "06 · Full ranking",
      s6Title: "Ranking for the selected official series",
      s6Text: "The table preserves the official IMF value and labels GIR-derived fields separately.",
      search: "Search country or ISO3",
      sort: "Sort",
      sortRank: "By rank",
      sortScore: "By value",
      sortChange: "By five-year change",
      sortName: "By name",
      shown: "Shown",
      noResults: "No results match the current query.",
      officialScore: "IMF · official",
      girRank: "Rank · GIR",
      girPercentile: "Percentile · GIR",
      delta1: "Δ 1 year · GIR",
      delta5: "Δ 5 years · GIR",
      delta10: "Δ 10 years · GIR",
      openEconomy: "Select country",
      s7Kicker: "07 · Methodology and provenance",
      s7Title: "How to read IMF FDI in GIR",
      s7Text: "The workspace separates official indicators, GIR-derived analytics and technical release provenance.",
      concept: "Official concept",
      conceptText: "The IMF evaluates financial institutions and markets across depth, access and efficiency; six lower-level subindices aggregate into FI, FM and overall FD.",
      formula: "GIR analytical layer",
      formulaText: "Competition rank: 1, 2, 2, 4. Percentile = 100 × (N − rank) / (N − 1). Changes are calculated only within one snapshot.",
      caveat: "Interpretation caveat",
      caveatText: "A higher index indicates a more developed financial system, but does not by itself measure resilience, fairness or the absence of financial risk.",
      provenance: "Release provenance",
      retrieved: "Retrieved",
      sha256: "SHA-256",
      parser: "Parser",
      transformations: "Transformations",
      coverage: "Coverage",
      period: "Period",
      sourceMember: "Source file / sheet",
      notSpecified: "not specified",
      officialOrigin: "Official value source",
      girOrigin: "Derived fields",
      officialOwner: "International Monetary Fund",
      gir: "GIR",
      selected: "Selected"
    }
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    token: 0,
    status: "idle",
    error: null,
    meta: null,
    methodology: null,
    provenance: null,
    architecture: null,
    indicators: [],
    years: [],
    ranking: [],
    country: null,
    series: [],
    compare: [],
    geo: null,
    indicator: "FD",
    year: null,
    iso3: "",
    compareIso: [],
    search: "",
    sort: "rank"
  };

  const t = (key) => I18N[state.lang]?.[key] ?? I18N.ru[key] ?? key;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"}[char]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const num = (value, digits = 3) => Number.isFinite(Number(value)) ? Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US", {minimumFractionDigits: digits, maximumFractionDigits: digits}) : "—";
  const signed = (value, digits = 3) => Number.isFinite(Number(value)) ? `${Number(value) > 0 ? "+" : ""}${num(value, digits)}` : "—";
  const mean = (values) => {
    const clean = values.filter(Number.isFinite);
    return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null;
  };
  const median = (values) => {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  function indicatorMeta(code = state.indicator) {
    return state.indicators.find((item) => item.code === code) || {code, label_ru: code, label_en: code, short_label_ru: code, short_label_en: code, dimension: "overall", aspect: "combined", level: 0};
  }
  function indicatorLabel(code = state.indicator, short = false) {
    const meta = indicatorMeta(code);
    const key = short ? (state.lang === "ru" ? "short_label_ru" : "short_label_en") : (state.lang === "ru" ? "label_ru" : "label_en");
    return meta[key] || meta.code;
  }
  function regionName(alpha2) {
    const code = String(alpha2 || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return null;
    try {
      return new Intl.DisplayNames([state.lang === "ru" ? "ru" : "en"], {type: "region"}).of(code);
    } catch (_error) {
      return null;
    }
  }
  function economyName(row) {
    const explicit = row?.economy_name || row?.name;
    const localized = regionName(row?.source_code);
    return localized || explicit || row?.iso3 || row?.source_code || "—";
  }
  function currentRow() {
    return state.ranking.find((item) => item.iso3 === state.iso3 || item.source_code === state.iso3) || null;
  }
  function countryValue(code) {
    const value = Number(state.country?.values?.[code]?.value);
    return Number.isFinite(value) ? value : null;
  }
  function releaseLabel() {
    const release = state.meta?.current_release;
    return release?.release_label || release?.release_year || state.meta?.index?.release?.edition || "—";
  }
  function sourceUrl() {
    return state.meta?.index?.source_page_url || SOURCE_URL;
  }
  function methodologyUrl() {
    return state.meta?.index?.methodology_url || METHODOLOGY_URL;
  }
  function isQa() {
    return Boolean(window.__GIR_FDI_QA__ || state.meta?.qa_fixture || state.meta?.index?.qa_fixture);
  }

  async function request(path, params = {}) {
    const adapter = window.__GIR_FDI_QA_ADAPTER__;
    if (adapter?.request) return adapter.request(path, params);
    const url = new URL(`${API_ROOT}${path}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value == null || value === "") return;
      if (Array.isArray(value)) value.forEach((entry) => url.searchParams.append(key, entry));
      else url.searchParams.set(key, String(value));
    });
    const response = await fetch(url, {headers: {Accept: "application/json"}, cache: "no-store"});
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload.detail === "string" ? payload.detail : payload.detail?.message || payload.error || `${response.status}`;
      const error = new Error(detail || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("country", state.iso3);
    if (state.year) url.searchParams.set("year", String(state.year));
    url.searchParams.set("fdiIndicator", state.indicator);
    if (state.compareIso.length) url.searchParams.set("fdiCompare", state.compareIso.join(","));
    url.hash = "index-IMF_FDI";
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function extractYearItems(payload) {
    return (payload?.items || []).map((item) => Number(item.year)).filter(Number.isFinite).sort((a, b) => a - b);
  }

  async function loadGeo(token = state.token) {
    const adapter = window.__GIR_FDI_QA_ADAPTER__;
    if (adapter?.geo) {
      try {
        const payload = await adapter.geo();
        if (token === state.token && payload?.type === "FeatureCollection") {
          state.geo = payload;
          preserveScrollRender();
        }
      } catch (_error) {
        // The remaining workspace stays usable without geometry.
      }
      return;
    }
    for (const url of GEO_URLS) {
      try {
        const response = await fetch(url, {cache: "force-cache"});
        if (!response.ok) continue;
        const payload = await response.json();
        if (token !== state.token) return;
        if (payload?.type === "FeatureCollection") {
          state.geo = payload;
          preserveScrollRender();
          return;
        }
      } catch (_error) {
        // Try the next local geometry path.
      }
    }
  }

  async function fetchCountryBundle(token = state.token) {
    const [country, series] = await Promise.all([
      request(`/countries/${encodeURIComponent(state.iso3)}`, {year: state.year, indicator: state.indicator}),
      request(`/countries/${encodeURIComponent(state.iso3)}/series`, {indicator: state.indicator})
    ]);
    if (token !== state.token) return;
    state.country = country;
    state.series = series.items || [];
  }

  async function fetchCompare(token = state.token) {
    if (state.compareIso.length < 2) {
      state.compare = [];
      return;
    }
    const payload = await request("/compare", {iso3: state.compareIso, indicator: state.indicator});
    if (token !== state.token) return;
    state.compare = payload.items || [];
  }

  function loadingMarkup() {
    return `<section class="index-workspace fdi-native"><div class="iw-loading"><span class="iw-loading-mark">IMF</span><h1>${esc(t("loading"))}</h1><p>${esc(t("loadingText"))}</p></div></section>`;
  }

  function notLoadedMarkup(meta) {
    const source = meta?.index?.source_page_url || SOURCE_URL;
    return `<section class="index-workspace fdi-native"><div class="iw-error fdi-not-loaded">
      <span class="iw-loading-mark">IMF</span>
      <h1>${esc(t("unavailable"))}</h1>
      <p>${esc(t("unavailableText"))}</p>
      <div class="fdi-command-stack" aria-label="IMF FDI administrative commands">
        <code>${esc(t("loadCommand"))}</code><code>${esc(t("importCommand"))}</code><code>${esc(t("verifyCommand"))}</code>
      </div>
      <div class="iw-hero-actions"><a class="iw-button primary" href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))}</a></div>
    </div></section>`;
  }

  function errorMarkup(error) {
    return `<section class="index-workspace fdi-native"><div class="iw-error"><span class="iw-loading-mark">IMF</span><h1>${esc(t("error"))}</h1><p>${esc(error?.message || error)}</p><button class="iw-button primary" type="button" data-fdi-retry>${esc(t("retry"))}</button></div></section>`;
  }

  function optionsMarkup(items, selected, valueFn, labelFn) {
    return items.map((item) => {
      const value = valueFn(item);
      return `<option value="${esc(value)}" ${String(value) === String(selected) ? "selected" : ""}>${esc(labelFn(item))}</option>`;
    }).join("");
  }

  function controlStripMarkup() {
    return `<div class="fdi-control-strip" aria-label="IMF FDI controls">
      <label><span>${esc(t("economy"))}</span><select class="select" data-fdi-country>${optionsMarkup(state.ranking, state.iso3, (item) => item.iso3 || item.source_code, economyName)}</select></label>
      <label><span>${esc(t("indicator"))}</span><select class="select" data-fdi-indicator>${optionsMarkup(state.indicators, state.indicator, (item) => item.code, (item) => `${indicatorLabel(item.code)} · ${item.code}`)}</select></label>
      <label><span>${esc(t("year"))}</span><select class="select" data-fdi-year>${state.years.slice().reverse().map((year) => `<option value="${year}" ${year === state.year ? "selected" : ""}>${year}</option>`).join("")}</select></label>
      <div class="fdi-control-meta"><span>${esc(t("release"))}</span><b>${esc(releaseLabel())}</b><small>${state.ranking.length} ${esc(t("economies"))}</small></div>
    </div>`;
  }

  function heroMarkup(row) {
    const csv = `${API_ROOT}/ranking.csv?indicator=${encodeURIComponent(state.indicator)}&year=${encodeURIComponent(state.year || "")}`;
    return `<header class="iw-hero">
      <div class="iw-hero-main">
        <div>
          <span class="iw-overline">${esc(t("overline"))}</span>
          <h1>${esc(t("title"))}</h1>
          <p class="iw-hero-lead">${esc(t("lead"))}</p>
          <div class="iw-status-line"><span class="accent">${esc(t("source"))}</span><span>${esc(t("official"))}</span><span>${esc(t("derived"))}</span><span>${esc(t("snapshot"))}</span>${isQa() ? `<span class="fdi-qa-badge">${esc(t("qa"))}</span>` : ""}</div>
        </div>
        <div class="iw-hero-actions"><a class="iw-button primary" href="${esc(sourceUrl())}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))} ↗</a><a class="iw-button" href="${esc(methodologyUrl())}" target="_blank" rel="noopener noreferrer">${esc(t("methodButton"))} ↗</a><a class="iw-button" href="${esc(csv)}">${esc(t("exportCsv"))} ↓</a></div>
      </div>
      <aside class="iw-score-panel">
        <span>${esc(indicatorLabel())} · ${state.year}</span>
        <div class="iw-score-value"><strong>${num(row?.value, 3)}</strong><small>0–1</small></div>
        <div class="iw-rank-line"><div><span>${esc(t("rank"))}</span><b>#${row?.rank ?? "—"}</b></div><div><span>${esc(t("economy"))}</span><b>${esc(economyName(row))}</b></div></div>
        <div class="iw-percentile"><header><span>${esc(t("percentile"))}</span><b>${num(row?.percentile, 1)}%</b></header><div class="iw-track"><i style="width:${clamp(Number(row?.percentile) || 0, 0, 100)}%"></i></div></div>
        <div class="iw-score-meta"><div><span>${esc(t("indicator"))}</span><b>${esc(state.indicator)}</b></div><div><span>${esc(t("release"))}</span><b>${esc(releaseLabel())}</b></div><div><span>${esc(t("year"))}</span><b>${state.year ?? "—"}</b></div><div><span>${esc(t("score"))}</span><b>${esc(t("official"))}</b></div></div>
      </aside>
    </header>`;
  }

  function jumpMarkup() {
    const items = [["#fdi-position", "navPosition"], ["#fdi-map", "navMap"], ["#fdi-architecture", "navArchitecture"], ["#fdi-trend", "navTrend"], ["#fdi-compare", "navCompare"], ["#fdi-ranking", "navRanking"], ["#fdi-method", "navMethod"]];
    return `<nav class="iw-jump" aria-label="${esc(t("navigation"))}">${items.map(([selector, label]) => `<button type="button" data-fdi-jump="${selector}">${esc(t(label))}</button>`).join("")}</nav>`;
  }

  function sectionHeading(kicker, title, text) {
    return `<div class="iw-section-heading"><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2></div><p>${esc(text)}</p></div>`;
  }

  function componentMeta() {
    return ["FID", "FIA", "FIE", "FMD", "FMA", "FME"].map((code) => ({code, value: countryValue(code), label: indicatorLabel(code, true)}));
  }

  function strongestComponent() {
    return componentMeta().filter((item) => Number.isFinite(item.value)).sort((a, b) => b.value - a.value)[0] || null;
  }

  function branchCard(code) {
    const value = countryValue(code);
    const children = BRANCHES[code] || [];
    return `<article class="iw-component fdi-branch-card">
      <header><div><span>${esc(code)}</span><h3>${esc(indicatorLabel(code))}</h3></div><div class="value">${num(value, 3)} <small>0–1</small></div></header>
      <div class="bar"><i style="width:${clamp((value || 0) * 100, 0, 100)}%"></i></div>
      <dl>${children.map((child) => `<div><dt>${esc(ASPECT_LABELS[indicatorMeta(child).aspect]?.[state.lang] || indicatorLabel(child, true))}</dt><dd><button type="button" class="fdi-inline-indicator" data-fdi-open-indicator="${esc(child)}">${num(countryValue(child), 3)}</button></dd></div>`).join("")}</dl>
    </article>`;
  }

  function positionMarkup(row) {
    const values = state.ranking.map((item) => Number(item.value)).filter(Number.isFinite);
    const med = median(values);
    const fi = countryValue("FI");
    const fm = countryValue("FM");
    const gap = Number.isFinite(fi) && Number.isFinite(fm) ? fi - fm : null;
    const strongest = strongestComponent();
    return `<section id="fdi-position" class="iw-section">
      ${sectionHeading(t("s1Kicker"), t("s1Title"), t("s1Text"))}
      <div class="iw-findings">
        <article class="iw-finding"><span>${esc(t("rankOf"))}</span><strong>#${row?.rank ?? "—"}</strong><b>${esc(economyName(row))}</b><p>${state.ranking.length} ${esc(t("economies"))} · ${state.year}</p></article>
        <article class="iw-finding"><span>${esc(t("change5"))}</span><strong>${signed(row?.value_change_5y, 3)}</strong><b>${signed(row?.rank_change_5y, 0)} ${esc(t("rank"))}</b><p>${esc(t("derived"))}</p></article>
        <article class="iw-finding"><span>${esc(t("institutionMarketGap"))}</span><strong>${signed(gap, 3)}</strong><b>${gap == null ? "—" : gap >= 0 ? esc(t("institutions")) : esc(t("markets"))}</b><p>${esc(t("balanceText"))}</p></article>
        <article class="iw-finding"><span>${esc(t("strongestComponent"))}</span><strong>${num(strongest?.value, 3)}</strong><b>${esc(strongest?.label || "—")}</b><p>${Number(row?.value) >= Number(med) ? esc(t("aboveMedian")) : esc(t("belowMedian"))} · ${signed(Number(row?.value) - Number(med), 3)}</p></article>
      </div>
      <div class="fdi-origin-strip"><div><span>${esc(t("officialOrigin"))}</span><b>${esc(t("officialOwner"))}</b></div><div><span>${esc(t("girOrigin"))}</span><b>${esc(t("gir"))}</b></div></div>
      <div class="fdi-subheading"><span>${esc(t("branches"))}</span><p>${esc(t("officialNotice"))}</p></div>
      <div class="iw-components">${branchCard("FI")}${branchCard("FM")}</div>
      <div class="iw-reconciliation"><strong>${esc(t("derivedNotice"))}</strong><p>${esc(t("officialNotice"))}</p></div>
    </section>`;
  }

  function featureIso(feature) {
    const props = feature?.properties || {};
    const raw = props.iso3 || props.ISO_A3 || props.ADM0_A3 || props.adm0_a3 || props.gu_a3 || props.sov_a3 || props.iso_a3 || props.code || props.id || feature?.id;
    const value = String(raw || "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(value) && value !== "-99" ? value : null;
  }
  function projectPoint(point) {
    const lon = Number(point?.[0]);
    const lat = Number(point?.[1]);
    return [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500];
  }
  function ringPath(ring) {
    if (!Array.isArray(ring) || ring.length < 2) return "";
    return ring.map((point, index) => { const [x, y] = projectPoint(point); return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z";
  }
  function geometryPath(geometry) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath).join(" ");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon) => polygon.map(ringPath)).join(" ");
    return "";
  }
  function quantileThresholds(values, bins = 7) {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return [];
    return Array.from({length: bins - 1}, (_, index) => sorted[Math.min(sorted.length - 1, Math.floor((index + 1) * sorted.length / bins))]);
  }
  function binFor(value, thresholds) {
    if (!Number.isFinite(value)) return 0;
    let bin = 1;
    thresholds.forEach((threshold) => { if (value > threshold) bin += 1; });
    return clamp(bin, 1, 7);
  }
  function mapSvgMarkup() {
    if (!state.geo?.features?.length) return `<div class="iw-empty">${esc(t("mapUnavailable"))}</div>`;
    const lookup = new Map(state.ranking.map((item) => [item.iso3, Number(item.value)]));
    const thresholds = quantileThresholds([...lookup.values()], 7);
    const paths = state.geo.features.map((feature) => {
      const iso3 = featureIso(feature);
      const path = geometryPath(feature.geometry);
      if (!path) return "";
      const value = iso3 ? lookup.get(iso3) : null;
      const selected = iso3 === state.iso3;
      const label = `${iso3 || "N/A"}: ${Number.isFinite(value) ? num(value, 3) : t("noData")}`;
      return `<path d="${path}" class="fdi-map-country fdi-bin-${binFor(value, thresholds)} ${selected ? "is-selected" : ""}" ${iso3 ? `data-fdi-map-iso="${iso3}" tabindex="0" role="button" aria-label="${esc(label)}"` : `aria-label="${esc(label)}"`}><title>${esc(label)}</title></path>`;
    }).join("");
    return `<svg class="fdi-map-svg" viewBox="0 0 1000 500" role="img" aria-label="${esc(t("worldMap"))}">${paths}</svg>`;
  }

  function mapMarkup(row) {
    const leaders = state.ranking.slice(0, 7);
    const med = median(state.ranking.map((item) => Number(item.value)).filter(Number.isFinite));
    return `<section id="fdi-map" class="iw-section">
      ${sectionHeading(t("s2Kicker"), t("s2Title"), t("s2Text"))}
      <div class="fdi-map-grid">
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)}</span><h3>${esc(t("worldMap"))}</h3></div><p>${esc(indicatorLabel())} · ${state.year}</p></div><div class="fdi-map-frame">${mapSvgMarkup()}<div class="fdi-map-legend"><span>${esc(t("mapHint"))}</span>${[1,2,3,4,5,6,7].map((bin) => `<i class="fdi-bin-${bin}"></i>`).join("")}</div></div></article>
        <aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("leaders"))}</span><h3>${esc(indicatorLabel())}</h3></div><p>${state.year}</p></div><div class="fdi-leader-list">${leaders.map((item) => `<button type="button" data-fdi-select="${esc(item.iso3)}" class="${item.iso3 === state.iso3 ? "is-selected" : ""}"><span>#${item.rank}</span><b>${esc(economyName(item))}</b><em>${num(item.value, 3)}</em></button>`).join("")}</div><div class="fdi-selected-context"><span>${esc(t("selectedContext"))}</span><strong>${esc(economyName(row))}</strong><p>#${row?.rank ?? "—"} · ${num(row?.value, 3)} · ${Number(row?.value) >= Number(med) ? esc(t("aboveMedian")) : esc(t("belowMedian"))}</p></div></aside>
      </div>
    </section>`;
  }

  function nodeMarkup(code, size = "normal") {
    const value = countryValue(code);
    const active = code === state.indicator;
    return `<button type="button" class="fdi-node fdi-node-${size} ${active ? "is-active" : ""}" data-fdi-open-indicator="${esc(code)}" aria-label="${esc(`${t("selectIndicator")}: ${indicatorLabel(code)}`)}"><span>${esc(code)}</span><b>${esc(indicatorLabel(code, true))}</b><strong>${num(value, 3)}</strong><i><u style="width:${clamp((value || 0) * 100, 0, 100)}%"></u></i></button>`;
  }

  function architectureMarkup() {
    const fi = countryValue("FI");
    const fm = countryValue("FM");
    const gap = Number.isFinite(fi) && Number.isFinite(fm) ? fi - fm : null;
    const aspects = ["depth", "access", "efficiency"];
    return `<section id="fdi-architecture" class="iw-section">
      ${sectionHeading(t("s3Kicker"), t("s3Title"), t("s3Text"))}
      <article class="iw-panel fdi-architecture-panel">
        <div class="iw-panel-head"><div><span>FD → FI / FM</span><h3>${esc(t("architecture"))}</h3></div><p>${esc(economyName(state.country?.economy))} · ${state.year}</p></div>
        <div class="fdi-pyramid">
          <div class="fdi-pyramid-root">${nodeMarkup("FD", "root")}</div>
          <div class="fdi-pyramid-branches"><div class="fdi-branch-column">${nodeMarkup("FI", "branch")}<div class="fdi-leaves">${BRANCHES.FI.map((code) => nodeMarkup(code, "leaf")).join("")}</div></div><div class="fdi-branch-column">${nodeMarkup("FM", "branch")}<div class="fdi-leaves">${BRANCHES.FM.map((code) => nodeMarkup(code, "leaf")).join("")}</div></div></div>
        </div>
      </article>
      <div class="fdi-architecture-grid">
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("aspectMatrix"))}</span><h3>${esc(t("institutions"))} ↔ ${esc(t("markets"))}</h3></div><p>0–1</p></div><div class="fdi-aspect-matrix">${aspects.map((aspect, index) => { const left = BRANCHES.FI[index]; const right = BRANCHES.FM[index]; return `<div class="fdi-aspect-row"><span>${esc(ASPECT_LABELS[aspect][state.lang])}</span><button type="button" data-fdi-open-indicator="${left}"><b>${esc(indicatorLabel(left, true))}</b><strong>${num(countryValue(left), 3)}</strong></button><i aria-hidden="true"><u style="--fdi-left:${clamp((countryValue(left) || 0) * 100, 0, 100)}%;--fdi-right:${clamp((countryValue(right) || 0) * 100, 0, 100)}%"></u></i><button type="button" data-fdi-open-indicator="${right}"><b>${esc(indicatorLabel(right, true))}</b><strong>${num(countryValue(right), 3)}</strong></button></div>`; }).join("")}</div></article>
        <aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("balance"))}</span><h3>${esc(economyName(state.country?.economy))}</h3></div><p>${esc(t("balanceText"))}</p></div><div class="fdi-balance"><div class="fdi-balance-value ${Number(gap) < 0 ? "is-market" : "is-institution"}">${signed(gap, 3)}</div><div class="fdi-balance-axis"><span>${esc(t("markets"))}</span><i><u style="left:${clamp(50 + (gap || 0) * 100, 0, 100)}%"></u></i><span>${esc(t("institutions"))}</span></div><dl class="iw-summary-list"><div><span>FI</span><b>${num(fi, 3)}</b></div><div><span>FM</span><b>${num(fm, 3)}</b></div><div><span>FD</span><b>${num(countryValue("FD"), 3)}</b></div></dl></div></aside>
      </div>
    </section>`;
  }

  function lineChartMarkup(seriesList, selectedYear, compact = false) {
    const allItems = seriesList.flatMap((series) => series.items || []).filter((item) => Number.isFinite(Number(item.year)) && Number.isFinite(Number(item.value)));
    if (!allItems.length) return `<div class="iw-empty">${esc(t("noData"))}</div>`;
    const years = allItems.map((item) => Number(item.year));
    const first = Math.min(...years);
    const last = Math.max(...years);
    const width = 900;
    const height = compact ? 260 : 330;
    const left = 58, right = 24, top = 24, bottom = 42;
    const x = (year) => left + ((Number(year) - first) / Math.max(1, last - first)) * (width - left - right);
    const y = (value) => top + (1 - clamp(Number(value), 0, 1)) * (height - top - bottom);
    const grid = [0, .25, .5, .75, 1].map((value) => `<line class="iw-grid-line" x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}"></line><text class="iw-axis-label" x="${left-10}" y="${y(value)+3}" text-anchor="end">${num(value, 2)}</text>`).join("");
    const yearTicks = Array.from(new Set([first, Math.round(first + (last-first)/4), Math.round(first + (last-first)/2), Math.round(first + 3*(last-first)/4), last])).map((year) => `<text class="iw-axis-label" x="${x(year)}" y="${height-15}" text-anchor="middle">${year}</text>`).join("");
    const selectedRule = Number.isFinite(Number(selectedYear)) ? `<line class="iw-selected-rule" x1="${x(selectedYear)}" y1="${top}" x2="${x(selectedYear)}" y2="${height-bottom}"></line>` : "";
    const lines = seriesList.map((series, index) => {
      const items = (series.items || []).filter((item) => Number.isFinite(Number(item.year)) && Number.isFinite(Number(item.value))).sort((a,b) => Number(a.year)-Number(b.year));
      const points = items.map((item) => `${x(item.year).toFixed(2)},${y(item.value).toFixed(2)}`).join(" ");
      const lastItem = items.at(-1);
      return `<polyline class="fdi-series-line ${SERIES_CLASSES[index % SERIES_CLASSES.length]}" points="${points}"></polyline>${lastItem ? `<circle class="fdi-series-dot ${SERIES_CLASSES[index % SERIES_CLASSES.length]}" cx="${x(lastItem.year)}" cy="${y(lastItem.value)}" r="4"><title>${esc(`${economyName(series.economy)}: ${num(lastItem.value,3)}`)}</title></circle>` : ""}`;
    }).join("");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t("trend"))}">${grid}${selectedRule}${lines}${yearTicks}</svg>`;
  }

  function trendMarkup() {
    const values = state.series.map((item) => Number(item.value)).filter(Number.isFinite);
    const best = state.series.filter((item) => Number.isFinite(Number(item.value))).sort((a,b) => Number(b.value)-Number(a.value))[0];
    return `<section id="fdi-trend" class="iw-section">
      ${sectionHeading(t("s4Kicker"), t("s4Title"), t("s4Text"))}
      <div class="iw-analysis-grid">
        <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)}</span><h3>${esc(t("trend"))}</h3></div><p>${esc(economyName(state.country?.economy))} · ${esc(indicatorLabel())}</p></div><div class="iw-chart-frame">${lineChartMarkup([{economy: state.country?.economy, items: state.series}], state.year)}</div><div class="iw-method-break"><strong>${esc(t("snapshotTitle"))}</strong><br>${esc(t("snapshotText"))}</div></article>
        <aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("trendSummary"))}</span><h3>${esc(economyName(state.country?.economy))}</h3></div><p>${esc(indicatorLabel())}</p></div><dl class="iw-summary-list"><div><span>${esc(t("firstYear"))}</span><b>${state.series[0]?.year ?? "—"}</b></div><div><span>${esc(t("latestYear"))}</span><b>${state.series.at(-1)?.year ?? "—"}</b></div><div><span>${esc(t("minimum"))}</span><b>${num(values.length ? Math.min(...values) : null, 3)}</b></div><div><span>${esc(t("maximum"))}</span><b>${num(values.length ? Math.max(...values) : null, 3)}</b></div><div><span>${esc(t("mean"))}</span><b>${num(mean(values), 3)}</b></div><div><span>${esc(t("bestYear"))}</span><b>${best?.year ?? "—"}</b></div></dl></aside>
      </div>
    </section>`;
  }

  function comparisonMarkup() {
    const selectedRows = state.compare.map((entry, index) => {
      const latest = entry.items?.find((item) => Number(item.year) === Number(state.year)) || entry.items?.at(-1);
      return {entry, latest, index};
    });
    const available = state.ranking.filter((item) => !state.compareIso.includes(item.iso3));
    return `<section id="fdi-compare" class="iw-section">
      ${sectionHeading(t("s5Kicker"), t("s5Title"), t("s5Text"))}
      <div class="fdi-compare-toolbar"><label><span>${esc(t("addEconomy"))}</span><select class="select" data-fdi-compare-add><option value="">—</option>${available.map((item) => `<option value="${esc(item.iso3)}">${esc(economyName(item))}</option>`).join("")}</select></label><small>${esc(t("compareLimit"))}</small><div class="fdi-current-comparison">${selectedRows.map(({entry,index}) => `<button type="button" data-fdi-compare-remove="${esc(entry.economy?.iso3 || entry.economy?.source_code)}" title="${esc(t("remove"))}"><i class="${SERIES_CLASSES[index % SERIES_CLASSES.length]}"></i><strong>${esc(economyName(entry.economy))}</strong><span>${esc(entry.economy?.iso3 || entry.economy?.source_code || "")}</span></button>`).join("")}</div></div>
      <div class="fdi-comparison-grid"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)}</span><h3>${esc(t("comparisonChart"))}</h3></div><p>${esc(indicatorLabel())}</p></div><div class="iw-chart-frame">${lineChartMarkup(state.compare, state.year)}</div></article><aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("currentComparison"))}</span><h3>${state.year}</h3></div><p>0–1</p></div><div class="fdi-compare-list">${selectedRows.map(({entry,latest,index}) => `<div><i class="${SERIES_CLASSES[index % SERIES_CLASSES.length]}"></i><span>${esc(economyName(entry.economy))}</span><b>${num(latest?.value, 3)}</b></div>`).join("")}</div></aside></div>
    </section>`;
  }

  function filteredRows() {
    const query = state.search.trim().toLocaleLowerCase(state.lang === "ru" ? "ru" : "en");
    let rows = state.ranking.filter((item) => !query || economyName(item).toLocaleLowerCase(state.lang === "ru" ? "ru" : "en").includes(query) || String(item.iso3 || "").toLowerCase().includes(query));
    rows = rows.slice();
    if (state.sort === "score") rows.sort((a,b) => Number(b.value)-Number(a.value));
    else if (state.sort === "change") rows.sort((a,b) => (Number(b.value_change_5y) || -Infinity)-(Number(a.value_change_5y) || -Infinity));
    else if (state.sort === "name") rows.sort((a,b) => economyName(a).localeCompare(economyName(b), state.lang));
    else rows.sort((a,b) => Number(a.rank)-Number(b.rank));
    return rows;
  }

  function rankingMarkup() {
    const rows = filteredRows();
    return `<section id="fdi-ranking" class="iw-section">
      ${sectionHeading(t("s6Kicker"), t("s6Title"), t("s6Text"))}
      <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)} · ${state.year}</span><h3>${esc(indicatorLabel())}</h3></div><p>${state.ranking.length} ${esc(t("economies"))}</p></div><div class="iw-ranking-tools"><label><span>${esc(t("search"))}</span><input type="search" value="${esc(state.search)}" data-fdi-search autocomplete="off"></label><label class="fdi-sort-label"><span>${esc(t("sort"))}</span><select class="select" data-fdi-sort><option value="rank" ${state.sort === "rank" ? "selected" : ""}>${esc(t("sortRank"))}</option><option value="score" ${state.sort === "score" ? "selected" : ""}>${esc(t("sortScore"))}</option><option value="change" ${state.sort === "change" ? "selected" : ""}>${esc(t("sortChange"))}</option><option value="name" ${state.sort === "name" ? "selected" : ""}>${esc(t("sortName"))}</option></select></label><span class="iw-page-meta">${esc(t("shown"))}: ${rows.length}</span></div>${rows.length ? `<div class="iw-table-wrap" tabindex="0"><table class="iw-table fdi-ranking-table"><caption>${esc(t("s6Title"))}</caption><thead><tr><th>${esc(t("girRank"))}</th><th>${esc(t("economy"))}</th><th>${esc(t("officialScore"))}</th><th>${esc(t("girPercentile"))}</th><th>${esc(t("delta1"))}</th><th>${esc(t("delta5"))}</th><th>${esc(t("delta10"))}</th></tr></thead><tbody>${rows.map((item) => `<tr class="${item.iso3 === state.iso3 ? "is-selected" : ""}"><td>#${item.rank}</td><td><button type="button" class="iw-country-button" data-fdi-select="${esc(item.iso3)}" aria-label="${esc(`${t("openEconomy")}: ${economyName(item)}`)}"><span class="iw-country-cell"><i class="fdi-iso-badge">${esc(item.iso3)}</i><span><strong>${esc(economyName(item))}</strong><small>${esc(item.iso3 || item.source_code || "")}</small></span></span></button></td><td><strong>${num(item.value, 3)}</strong><small>${esc(t("official"))}</small></td><td>${num(item.percentile, 1)}%</td><td>${signed(item.value_change_1y, 3)}</td><td>${signed(item.value_change_5y, 3)}</td><td>${signed(item.value_change_10y, 3)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="iw-empty">${esc(t("noResults"))}</div>`}</article>
    </section>`;
  }

  function formatDate(value) {
    if (!value) return t("notSpecified");
    try { return new Intl.DateTimeFormat(state.lang === "ru" ? "ru-RU" : "en-US", {dateStyle: "medium", timeStyle: "short"}).format(new Date(value)); } catch (_error) { return String(value); }
  }
  function provenanceValue(...keys) {
    const release = state.provenance?.release || {};
    const snapshot = state.provenance?.snapshot || {};
    for (const key of keys) {
      if (snapshot[key] != null) return snapshot[key];
      if (release[key] != null) return release[key];
    }
    return null;
  }

  function methodMarkup() {
    const release = state.provenance?.release || state.meta?.current_release || {};
    const transform = state.provenance?.transformations || {};
    const period = release.first_year && release.latest_year ? `${release.first_year}–${release.latest_year}` : state.meta?.index?.release?.period?.join("–") || t("notSpecified");
    const coverage = release.economy_count || state.meta?.index?.release?.coverage || t("notSpecified");
    const sourceMember = [state.provenance?.snapshot?.source_member, state.provenance?.snapshot?.source_sheet].filter(Boolean).join(" · ");
    return `<section id="fdi-method" class="iw-section">
      ${sectionHeading(t("s7Kicker"), t("s7Title"), t("s7Text"))}
      <div class="iw-method-grid"><article class="iw-method-card"><span>${esc(t("concept"))}</span><h3>FD → FI / FM → D / A / E</h3><div class="iw-formula">${esc(t("conceptText"))}</div><p>${esc(t("officialNotice"))}</p><div class="fdi-origin-cards"><div><span>${esc(t("officialOrigin"))}</span><b>${esc(t("officialOwner"))}</b></div><div><span>${esc(t("girOrigin"))}</span><b>${esc(t("gir"))}</b></div></div></article><article class="iw-method-card"><span>${esc(t("formula"))}</span><h3>1, 2, 2, 4</h3><div class="iw-formula">${esc(t("formulaText"))}</div><p><strong>${esc(t("caveat"))}</strong><br>${esc(t("caveatText"))}</p></article></div>
      <article class="iw-panel fdi-provenance-panel"><div class="iw-panel-head"><div><span>${esc(t("provenance"))}</span><h3>${esc(release.release_label || releaseLabel())}</h3></div><p>${esc(t("snapshot"))}</p></div><dl class="iw-source-list"><div><dt>${esc(t("coverage"))}</dt><dd>${esc(String(coverage))}</dd></div><div><dt>${esc(t("period"))}</dt><dd>${esc(period)}</dd></div><div><dt>${esc(t("retrieved"))}</dt><dd>${esc(formatDate(release.retrieved_at))}</dd></div><div><dt>${esc(t("sha256"))}</dt><dd><code>${esc(provenanceValue("sha256", "raw_snapshot_sha256") || t("notSpecified"))}</code></dd></div><div><dt>${esc(t("parser"))}</dt><dd>${esc(release.parser_version || t("notSpecified"))}</dd></div><div><dt>${esc(t("sourceMember"))}</dt><dd>${esc(sourceMember || t("notSpecified"))}</dd></div><div><dt>${esc(t("transformations"))}</dt><dd><code>${esc(Object.values(transform).filter(Boolean).join(" · ") || t("notSpecified"))}</code></dd></div></dl></article>
    </section>`;
  }

  function workspaceMarkup() {
    const row = currentRow();
    return `<article class="index-workspace fdi-native" data-fdi-root>${heroMarkup(row)}${controlStripMarkup()}${jumpMarkup()}${positionMarkup(row)}${mapMarkup(row)}${architectureMarkup()}${trendMarkup()}${comparisonMarkup()}${rankingMarkup()}${methodMarkup()}<div class="fdi-live-region" aria-live="polite" aria-atomic="true"></div></article>`;
  }

  function announce(message) {
    const live = state.root?.querySelector(".fdi-live-region");
    if (live) live.textContent = message;
  }
  function preserveScrollRender() {
    if (!state.root || state.status !== "ready") return;
    const y = window.scrollY;
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
    window.scrollTo(0, y);
  }

  async function selectCountry(iso3, {scrollToTop = false} = {}) {
    const code = String(iso3 || "").toUpperCase();
    if (!code || code === state.iso3) return;
    state.iso3 = code;
    if (!state.compareIso.includes(code)) state.compareIso = [code, ...state.compareIso].slice(0, MAX_COMPARE);
    const token = ++state.token;
    state.root.innerHTML = loadingMarkup();
    try {
      await Promise.all([fetchCountryBundle(token), fetchCompare(token)]);
      if (token !== state.token) return;
      state.status = "ready";
      state.root.innerHTML = workspaceMarkup();
      bindWorkspace();
      syncUrl();
      if (scrollToTop) state.root.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
      announce(`${economyName(currentRow())}, ${num(currentRow()?.value, 3)}`);
    } catch (error) {
      if (token !== state.token) return;
      state.status = "error";
      state.error = error;
      state.root.innerHTML = errorMarkup(error);
      bindError();
    }
  }

  async function changeView({indicator = state.indicator, year = state.year} = {}) {
    const token = ++state.token;
    state.indicator = indicator;
    state.root.innerHTML = loadingMarkup();
    try {
      const yearsPayload = await request("/years", {indicator});
      if (token !== state.token) return;
      state.years = extractYearItems(yearsPayload);
      state.year = state.years.includes(Number(year)) ? Number(year) : state.years.at(-1);
      const rankingPayload = await request("/ranking", {indicator, year: state.year, limit: 1000, include_changes: true});
      if (token !== state.token) return;
      state.ranking = rankingPayload.items || [];
      if (!state.ranking.some((item) => item.iso3 === state.iso3)) state.country = null;
      state.compareIso = state.compareIso.filter((iso3) => state.ranking.some((item) => item.iso3 === iso3));
      if (!state.compareIso.includes(state.iso3)) state.compareIso.unshift(state.iso3);
      while (state.compareIso.length < Math.min(4, state.ranking.length)) {
        const candidate = state.ranking.find((item) => !state.compareIso.includes(item.iso3));
        if (!candidate) break;
        state.compareIso.push(candidate.iso3);
      }
      await Promise.all([fetchCountryBundle(token), fetchCompare(token)]);
      if (token !== state.token) return;
      state.status = "ready";
      state.root.innerHTML = workspaceMarkup();
      bindWorkspace();
      syncUrl();
    } catch (error) {
      if (token !== state.token) return;
      state.status = "error";
      state.error = error;
      state.root.innerHTML = errorMarkup(error);
      bindError();
    }
  }

  function bindError() {
    state.root?.querySelector("[data-fdi-retry]")?.addEventListener("click", () => render({root: state.root, lang: state.lang, theme: state.theme, country: state.iso3, year: state.year}));
  }

  function bindWorkspace() {
    const root = state.root;
    if (!root) return;
    root.querySelector("[data-fdi-country]")?.addEventListener("change", (event) => selectCountry(event.target.value));
    root.querySelector("[data-fdi-indicator]")?.addEventListener("change", (event) => changeView({indicator: event.target.value, year: state.year}));
    root.querySelector("[data-fdi-year]")?.addEventListener("change", (event) => changeView({indicator: state.indicator, year: Number(event.target.value)}));
    root.querySelectorAll("[data-fdi-open-indicator]").forEach((button) => button.addEventListener("click", () => changeView({indicator: button.dataset.fdiOpenIndicator, year: state.year})));
    root.querySelectorAll("[data-fdi-jump]").forEach((button) => button.addEventListener("click", () => root.querySelector(button.dataset.fdiJump)?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"})));
    root.querySelectorAll("[data-fdi-select]").forEach((button) => button.addEventListener("click", () => selectCountry(button.dataset.fdiSelect)));
    root.querySelectorAll("[data-fdi-map-iso]").forEach((path) => {
      const activate = () => selectCountry(path.dataset.fdiMapIso);
      path.addEventListener("click", activate);
      path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelector("[data-fdi-compare-add]")?.addEventListener("change", async (event) => {
      const code = event.target.value;
      if (!code || state.compareIso.includes(code) || state.compareIso.length >= MAX_COMPARE) return;
      state.compareIso.push(code);
      const token = ++state.token;
      await fetchCompare(token);
      if (token === state.token) { preserveScrollRender(); syncUrl(); }
    });
    root.querySelectorAll("[data-fdi-compare-remove]").forEach((button) => button.addEventListener("click", async () => {
      if (state.compareIso.length <= 2) return;
      state.compareIso = state.compareIso.filter((code) => code !== button.dataset.fdiCompareRemove);
      const token = ++state.token;
      await fetchCompare(token);
      if (token === state.token) { preserveScrollRender(); syncUrl(); }
    }));
    const search = root.querySelector("[data-fdi-search]");
    search?.addEventListener("input", (event) => {
      state.search = event.target.value;
      const tableSection = root.querySelector("#fdi-ranking");
      if (!tableSection) return;
      const y = window.scrollY;
      tableSection.outerHTML = rankingMarkup();
      bindWorkspace();
      window.scrollTo(0, y);
      const next = state.root.querySelector("[data-fdi-search]");
      next?.focus();
      if (next) next.setSelectionRange(next.value.length, next.value.length);
    });
    root.querySelector("[data-fdi-sort]")?.addEventListener("change", (event) => { state.sort = event.target.value; preserveScrollRender(); });
  }

  async function initialize(options, token) {
    state.lang = options.lang === "en" ? "en" : "ru";
    state.theme = options.theme || document.documentElement.dataset.theme || "dark";
    const params = new URLSearchParams(window.location.search);
    state.indicator = params.get("fdiIndicator") || "FD";
    state.iso3 = String(options.country || params.get("country") || "").toUpperCase();
    if (!state.iso3) return;
    state.root.innerHTML = loadingMarkup();

    const meta = await request("/meta");
    if (token !== state.token) return;
    state.meta = meta;
    if (meta.backend_status !== "ready" || !meta.current_release) {
      state.status = "not_loaded";
      state.root.innerHTML = notLoadedMarkup(meta);
      return;
    }

    const [indicatorPayload, methodology, provenance, architecture] = await Promise.all([
      request("/indicators"), request("/methodology"), request("/provenance"), request("/architecture")
    ]);
    if (token !== state.token) return;
    state.indicators = indicatorPayload.items || [];
    state.methodology = methodology;
    state.provenance = provenance;
    state.architecture = architecture;
    if (!state.indicators.some((item) => item.code === state.indicator)) state.indicator = indicatorPayload.default_indicator || "FD";

    const yearsPayload = await request("/years", {indicator: state.indicator});
    if (token !== state.token) return;
    state.years = extractYearItems(yearsPayload);
    const requestedYear = Number(options.year || params.get("year"));
    state.year = state.years.includes(requestedYear) ? requestedYear : state.years.at(-1);

    const rankingPayload = await request("/ranking", {indicator: state.indicator, year: state.year, limit: 1000, include_changes: true});
    if (token !== state.token) return;
    state.ranking = rankingPayload.items || [];
    if (!state.ranking.some((item) => item.iso3 === state.iso3)) state.country = null;

    const queryCompare = (params.get("fdiCompare") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    state.compareIso = [state.iso3, ...queryCompare, ...state.ranking.slice(0, 5).map((item) => item.iso3)].filter((value, index, array) => value && array.indexOf(value) === index).slice(0, 4);
    await Promise.all([fetchCountryBundle(token), fetchCompare(token)]);
    if (token !== state.token) return;
    state.status = "ready";
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
    syncUrl();
    loadGeo(token);
  }

  async function render(options = {}) {
    const root = options.root || document.querySelector("#view");
    if (!root) return;
    state.root = root;
    const token = ++state.token;
    state.status = "loading";
    try {
      await initialize(options, token);
    } catch (error) {
      if (token !== state.token) return;
      state.status = "error";
      state.error = error;
      root.innerHTML = errorMarkup(error);
      bindError();
    }
  }

  window.GIRFDI = Object.freeze({render});
})();
