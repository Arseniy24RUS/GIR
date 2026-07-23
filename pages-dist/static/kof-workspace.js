/* GIR · KOF Globalisation Index · native workspace */
(() => {
  "use strict";

  const API_ROOT = "/api/economy-finance/kof";
  const GEO_URLS = ["/static/world_countries_lite.geojson", "/static/world.geojson", "/world.geojson"];
  const SOURCE_URL = "https://kof.ethz.ch/en/forecasts-and-indicators/indicators/kof-globalisation-index.html";
  const MAX_COMPARE = 6;
  const SERIES_CLASSES = ["kof-series-0", "kof-series-1", "kof-series-2", "kof-series-3", "kof-series-4", "kof-series-5"];

  const I18N = {
    ru: {
      loading: "Загрузка KOF Globalisation Index",
      loadingText: "GIR читает опубликованный локальный снимок KOF и готовит аналитический слой.",
      unavailable: "KOF Globalisation Index пока не загружен",
      unavailableText: "Backend установлен, но официальный workbook ETH Zurich ещё не опубликован в локальном хранилище GIR.",
      loadCommand: "python -m giip.economy_finance.kof_cli download",
      importCommand: "python -m giip.economy_finance.kof_cli import-file /path/to/KOFGI_2025_public.xlsx",
      verifyCommand: "python -m giip.economy_finance.kof_cli verify",
      error: "Не удалось открыть рабочую область KOF",
      retry: "Повторить",
      overline: "Экономика и финансы · официальный международный индекс",
      title: "Глобализация",
      lead: "Экономическая, социальная и политическая взаимосвязанность стран — в фактическом и институциональном измерениях.",
      source: "KOF Swiss Economic Institute · ETH Zurich",
      official: "Официальное значение KOF",
      derived: "Место и динамика рассчитаны GIR",
      snapshot: "Локальный воспроизводимый снимок",
      qa: "QA FIXTURE · НЕОФИЦИАЛЬНЫЕ ЗНАЧЕНИЯ",
      sourceButton: "Официальный источник",
      exportCsv: "Скачать CSV",
      economy: "Страна",
      indicator: "Показатель",
      year: "Год данных",
      release: "Выпуск",
      score: "Баллы KOF",
      rank: "Место GIR",
      percentile: "Процентиль",
      economies: "стран",
      navigation: "Навигация по KOF",
      navPosition: "Позиция",
      navMap: "Карта",
      navArchitecture: "Структура",
      navTrend: "Динамика",
      navCompare: "Сравнение",
      navRanking: "Рейтинг",
      navMethod: "Методология",
      s1Kicker: "01 · Позиция страны",
      s1Title: "Текущий профиль глобализации",
      s1Text: "Официальные значения KOF отделены от места, процентиля и изменений, рассчитанных GIR внутри одного снимка.",
      rankOf: "Место среди стран",
      change5: "Изменение за 5 лет",
      rankChange5: "Изменение места за 5 лет",
      distanceMedian: "Отклонение от медианы",
      modeGap: "Разрыв de facto − de jure",
      officialNotice: "GIR импортирует готовые официальные значения KOF и не реконструирует индекс по 42 исходным переменным.",
      derivedNotice: "Соревновательное место, процентиль и изменения — производный аналитический слой GIR.",
      dimensions: "Ключевые измерения",
      overall: "Общая глобализация",
      economic: "Экономическая",
      social: "Социальная",
      political: "Политическая",
      combined: "Совокупный",
      deFacto: "De facto",
      deJure: "De jure",
      s2Kicker: "02 · Пространственное распределение",
      s2Title: "Мировая карта глобализации",
      s2Text: "Карта использует штатную геометрию и цветовую шкалу GIR. Нажатие на страну меняет активный профиль.",
      worldMap: "Значение выбранного показателя по странам",
      mapHint: "Квантили: низкие → высокие",
      mapUnavailable: "Геометрия карты временно недоступна; рейтинг и временные ряды продолжают работать.",
      leaders: "Лидеры выбранного среза",
      selectedContext: "Положение выбранной страны",
      aboveMedian: "выше медианы",
      belowMedian: "ниже медианы",
      s3Kicker: "03 · Архитектура индекса",
      s3Title: "Двадцать семь официальных рядов в одной системе",
      s3Text: "KOF разделяет глобализацию по содержательным измерениям и по режимам de facto и de jure. Таблица показывает профиль выбранной страны без самодельного композита.",
      architecture: "Профиль по измерениям",
      trade: "Торговая",
      financial: "Финансовая",
      interpersonal: "Межличностная",
      informational: "Информационная",
      cultural: "Культурная",
      profileReading: "Как читать профиль",
      profileReadingText: "De facto отражает наблюдаемые потоки и активности, de jure — правила, институты и условия, позволяющие этим потокам возникать.",
      strongest: "Сильнейшее измерение",
      weakest: "Зона внимания",
      widestGap: "Наибольший институциональный разрыв",
      s4Kicker: "04 · Историческая динамика",
      s4Title: "Траектория внутри одного снимка",
      s4Text: "Исторический ряд берётся из одного неизменяемого выпуска: KOF использует панельную нормализацию, поэтому пересмотры могут затрагивать прошлые годы.",
      trend: "Динамика официального значения KOF",
      trendSummary: "Сводка ряда",
      firstYear: "Первый год",
      latestYear: "Последний год",
      minimum: "Минимум",
      maximum: "Максимум",
      mean: "Среднее",
      bestYear: "Лучший год",
      normalisationTitle: "Панельная нормализация",
      normalisationText: "Сравнивайте динамику внутри одного release snapshot. Значения из разных выпусков нельзя автоматически склеивать как неизменную серию.",
      s5Kicker: "05 · Сравнение",
      s5Title: "Сопоставление траекторий стран",
      s5Text: "Выберите до шести стран и один официальный показатель. Все линии используют общий временной диапазон.",
      addEconomy: "Добавить страну",
      compareLimit: "Можно выбрать не более шести стран.",
      remove: "Удалить",
      comparisonChart: "Сравнение выбранного показателя",
      currentComparison: "Текущий срез",
      s6Kicker: "06 · Полный рейтинг",
      s6Title: "Рейтинг по выбранному официальному ряду",
      s6Text: "Таблица сохраняет официальный балл KOF и отдельно маркирует производные поля GIR.",
      search: "Поиск по стране или ISO3",
      sort: "Сортировка",
      sortRank: "По месту",
      sortScore: "По значению",
      sortChange: "По изменению за 5 лет",
      sortName: "По названию",
      shown: "Показано",
      noResults: "По заданному запросу ничего не найдено.",
      officialScore: "KOF · официальный",
      girRank: "Место · GIR",
      girPercentile: "Процентиль · GIR",
      delta1: "Δ 1 год · GIR",
      delta5: "Δ 5 лет · GIR",
      delta10: "Δ 10 лет · GIR",
      openEconomy: "Выбрать страну",
      s7Kicker: "07 · Методология и происхождение",
      s7Title: "Как читать KOF в GIR",
      s7Text: "Рабочая область разделяет официальные показатели, производную аналитику GIR и техническое происхождение выпуска.",
      concept: "Официальная концепция",
      conceptText: "KOF измеряет экономическую, социальную и политическую глобализацию, разделяя наблюдаемые трансграничные потоки и нормативно-институциональные условия.",
      formula: "Аналитический слой GIR",
      formulaText: "Соревновательное место: 1, 2, 2, 4. Процентиль = 100 × (N − место) / (N − 1). Изменения считаются только внутри одного снимка.",
      provenance: "Происхождение выпуска",
      retrieved: "Получено",
      sha256: "SHA-256",
      parser: "Парсер",
      transformations: "Преобразования",
      coverage: "Покрытие",
      period: "Период",
      sourceMember: "Исходный файл / лист",
      notSpecified: "не указано",
      noData: "нет данных",
      officialOrigin: "Источник официального значения",
      girOrigin: "Производные поля",
      officialOwner: "KOF Swiss Economic Institute, ETH Zurich",
      gir: "GIR",
      selected: "Выбрано",
      close: "Закрыть"
    },
    en: {
      loading: "Loading KOF Globalisation Index",
      loadingText: "GIR is reading the published local KOF snapshot and preparing its analytical layer.",
      unavailable: "KOF Globalisation Index has not been loaded yet",
      unavailableText: "The backend is installed, but no official ETH Zurich workbook has been published to GIR's local store.",
      loadCommand: "python -m giip.economy_finance.kof_cli download",
      importCommand: "python -m giip.economy_finance.kof_cli import-file /path/to/KOFGI_2025_public.xlsx",
      verifyCommand: "python -m giip.economy_finance.kof_cli verify",
      error: "The KOF workspace could not be opened",
      retry: "Retry",
      overline: "Economy and finance · official international index",
      title: "Globalisation",
      lead: "Economic, social and political interconnectedness — measured through actual flows and enabling institutions.",
      source: "KOF Swiss Economic Institute · ETH Zurich",
      official: "Official KOF value",
      derived: "Rank and change calculated by GIR",
      snapshot: "Local reproducible snapshot",
      qa: "QA FIXTURE · NON-OFFICIAL VALUES",
      sourceButton: "Official source",
      exportCsv: "Download CSV",
      economy: "Country",
      indicator: "Indicator",
      year: "Data year",
      release: "Release",
      score: "KOF score",
      rank: "GIR rank",
      percentile: "Percentile",
      economies: "countries",
      navigation: "KOF navigation",
      navPosition: "Position",
      navMap: "Map",
      navArchitecture: "Structure",
      navTrend: "Trend",
      navCompare: "Comparison",
      navRanking: "Ranking",
      navMethod: "Methodology",
      s1Kicker: "01 · Country position",
      s1Title: "Current globalisation profile",
      s1Text: "Official KOF values are separated from the rank, percentile and changes calculated by GIR within one snapshot.",
      rankOf: "Rank among countries",
      change5: "Five-year change",
      rankChange5: "Five-year rank change",
      distanceMedian: "Distance from median",
      modeGap: "De facto − de jure gap",
      officialNotice: "GIR imports official KOF values and does not reconstruct the index from its 42 underlying variables.",
      derivedNotice: "Competition rank, percentile and changes are derived GIR analytical fields.",
      dimensions: "Core dimensions",
      overall: "Overall globalisation",
      economic: "Economic",
      social: "Social",
      political: "Political",
      combined: "Combined",
      deFacto: "De facto",
      deJure: "De jure",
      s2Kicker: "02 · Spatial distribution",
      s2Title: "World map of globalisation",
      s2Text: "The map uses GIR's existing geometry and colour scale. Select a country to change the active profile.",
      worldMap: "Selected indicator by country",
      mapHint: "Quantiles: low → high",
      mapUnavailable: "Map geometry is temporarily unavailable; rankings and time series remain available.",
      leaders: "Leaders in the selected view",
      selectedContext: "Selected country position",
      aboveMedian: "above the median",
      belowMedian: "below the median",
      s3Kicker: "03 · Index architecture",
      s3Title: "Twenty-seven official series in one system",
      s3Text: "KOF separates substantive dimensions and de facto/de jure modes. The table shows the selected country's profile without a user-made composite.",
      architecture: "Dimension profile",
      trade: "Trade",
      financial: "Financial",
      interpersonal: "Interpersonal",
      informational: "Informational",
      cultural: "Cultural",
      profileReading: "How to read the profile",
      profileReadingText: "De facto captures observed flows and activities; de jure captures policies, institutions and conditions that enable them.",
      strongest: "Strongest dimension",
      weakest: "Area for attention",
      widestGap: "Largest institutional gap",
      s4Kicker: "04 · Historical trend",
      s4Title: "Trajectory within one snapshot",
      s4Text: "The historical series comes from one immutable release: KOF uses panel normalisation, so revisions can affect earlier years.",
      trend: "Official KOF trend",
      trendSummary: "Series summary",
      firstYear: "First year",
      latestYear: "Latest year",
      minimum: "Minimum",
      maximum: "Maximum",
      mean: "Average",
      bestYear: "Best year",
      normalisationTitle: "Panel normalisation",
      normalisationText: "Compare trends within one release snapshot. Values from different releases should not be silently merged into one unchanged series.",
      s5Kicker: "05 · Comparison",
      s5Title: "Compare country trajectories",
      s5Text: "Select up to six countries and one official indicator. All lines share the same time range.",
      addEconomy: "Add country",
      compareLimit: "You can select up to six countries.",
      remove: "Remove",
      comparisonChart: "Selected indicator comparison",
      currentComparison: "Current view",
      s6Kicker: "06 · Full ranking",
      s6Title: "Ranking by the selected official series",
      s6Text: "The table preserves the official KOF score and labels GIR-derived fields separately.",
      search: "Search by country or ISO3",
      sort: "Sort",
      sortRank: "By rank",
      sortScore: "By value",
      sortChange: "By five-year change",
      sortName: "By name",
      shown: "Shown",
      noResults: "No countries match the current search.",
      officialScore: "KOF · official",
      girRank: "Rank · GIR",
      girPercentile: "Percentile · GIR",
      delta1: "Δ 1 year · GIR",
      delta5: "Δ 5 years · GIR",
      delta10: "Δ 10 years · GIR",
      openEconomy: "Select country",
      s7Kicker: "07 · Methodology and provenance",
      s7Title: "How to read KOF in GIR",
      s7Text: "The workspace separates official indicators, GIR-derived analytics and technical release provenance.",
      concept: "Official concept",
      conceptText: "KOF measures economic, social and political globalisation, separating observed cross-border flows from policy and institutional conditions.",
      formula: "GIR analytical layer",
      formulaText: "Competition rank: 1, 2, 2, 4. Percentile = 100 × (N − rank) / (N − 1). Changes are calculated within one snapshot only.",
      provenance: "Release provenance",
      retrieved: "Retrieved",
      sha256: "SHA-256",
      parser: "Parser",
      transformations: "Transformations",
      coverage: "Coverage",
      period: "Period",
      sourceMember: "Source file / sheet",
      notSpecified: "not specified",
      noData: "no data",
      officialOrigin: "Official value source",
      girOrigin: "Derived fields",
      officialOwner: "KOF Swiss Economic Institute, ETH Zurich",
      gir: "GIR",
      selected: "Selected",
      close: "Close"
    }
  };

  const PROFILE_ROWS = [
    {key: "overall", combined: "KOFGI", deFacto: "KOFGIdf", deJure: "KOFGIdj"},
    {key: "economic", combined: "KOFEcGI", deFacto: "KOFEcGIdf", deJure: "KOFEcGIdj"},
    {key: "trade", combined: "KOFTrGI", deFacto: "KOFTrGIdf", deJure: "KOFTrGIdj"},
    {key: "financial", combined: "KOFFiGI", deFacto: "KOFFiGIdf", deJure: "KOFFiGIdj"},
    {key: "social", combined: "KOFSoGI", deFacto: "KOFSoGIdf", deJure: "KOFSoGIdj"},
    {key: "interpersonal", combined: "KOFIpGI", deFacto: "KOFIpGIdf", deJure: "KOFIpGIdj"},
    {key: "informational", combined: "KOFInGI", deFacto: "KOFInGIdf", deJure: "KOFInGIdj"},
    {key: "cultural", combined: "KOFCuGI", deFacto: "KOFCuGIdf", deJure: "KOFCuGIdj"},
    {key: "political", combined: "KOFPoGI", deFacto: "KOFPoGIdf", deJure: "KOFPoGIdj"}
  ];

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
    indicators: [],
    years: [],
    ranking: [],
    country: null,
    series: [],
    compare: [],
    geo: null,
    indicator: "KOFGI",
    year: null,
    iso3: "",
    compareIso: [],
    search: "",
    sort: "rank"
  };

  const t = (key) => I18N[state.lang]?.[key] ?? I18N.ru[key] ?? key;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"}[char]));
  const num = (value, digits = 1) => Number.isFinite(Number(value)) ? Number(value).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-US", {minimumFractionDigits: digits, maximumFractionDigits: digits}) : "—";
  const signed = (value, digits = 1) => Number.isFinite(Number(value)) ? `${Number(value) > 0 ? "+" : ""}${num(value, digits)}` : "—";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const median = (values) => {
    const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  function indicatorMeta(code = state.indicator) {
    return state.indicators.find((item) => item.code === code) || {code, label_ru: code, label_en: code, mode: "combined", dimension: "overall"};
  }
  function indicatorLabel(code = state.indicator) {
    const meta = indicatorMeta(code);
    return state.lang === "ru" ? meta.label_ru : meta.label_en;
  }
  function economyName(row) {
    return row?.economy_name || row?.name || row?.iso3 || row?.source_code || "—";
  }
  function currentRow() {
    return state.ranking.find((item) => item.iso3 === state.iso3 || item.source_code === state.iso3) || null;
  }
  function countryValue(code) {
    return Number(state.country?.values?.[code]?.value);
  }
  function profileLabel(key) {
    return t(key);
  }
  function releaseLabel() {
    const release = state.meta?.current_release;
    return release?.release_label || release?.release_year || state.meta?.index?.confirmed_release_year || "—";
  }
  function sourceUrl() {
    return state.meta?.index?.source_page_url || state.meta?.index?.source_page || SOURCE_URL;
  }
  function isQa() {
    return Boolean(state.meta?.qa_fixture || state.meta?.index?.qa_fixture);
  }

  async function request(path, params = {}) {
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
    url.searchParams.set("kofIndicator", state.indicator);
    if (state.compareIso.length) url.searchParams.set("kofCompare", state.compareIso.join(","));
    url.hash = "index-KOF_GLOBAL";
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function extractYearItems(payload) {
    return (payload?.items || []).map((item) => Number(item.year)).filter(Number.isFinite).sort((a, b) => a - b);
  }

  async function loadGeo(token = state.token) {
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
    return `<section class="index-workspace kof-native"><div class="iw-loading"><span class="iw-loading-mark">KOF</span><h1>${esc(t("loading"))}</h1><p>${esc(t("loadingText"))}</p></div></section>`;
  }

  function notLoadedMarkup(meta) {
    const source = meta?.index?.source_page_url || meta?.index?.source_page || SOURCE_URL;
    return `<section class="index-workspace kof-native"><div class="iw-error kof-not-loaded">
      <span class="iw-loading-mark">KOF</span>
      <h1>${esc(t("unavailable"))}</h1>
      <p>${esc(t("unavailableText"))}</p>
      <div class="kof-command-stack" aria-label="KOF administrative commands">
        <code>${esc(t("loadCommand"))}</code><code>${esc(t("importCommand"))}</code><code>${esc(t("verifyCommand"))}</code>
      </div>
      <div class="iw-hero-actions"><a class="iw-button primary" href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))}</a></div>
    </div></section>`;
  }

  function errorMarkup(error) {
    return `<section class="index-workspace kof-native"><div class="iw-error"><span class="iw-loading-mark">KOF</span><h1>${esc(t("error"))}</h1><p>${esc(error?.message || error)}</p><button class="iw-button primary" type="button" data-kof-retry>${esc(t("retry"))}</button></div></section>`;
  }

  function optionsMarkup(items, selected, valueFn, labelFn) {
    return items.map((item) => {
      const value = valueFn(item);
      return `<option value="${esc(value)}" ${String(value) === String(selected) ? "selected" : ""}>${esc(labelFn(item))}</option>`;
    }).join("");
  }

  function controlStripMarkup() {
    return `<div class="kof-control-strip" aria-label="KOF controls">
      <label><span>${esc(t("economy"))}</span><select class="select" data-kof-country>${optionsMarkup(state.ranking, state.iso3, (item) => item.iso3 || item.source_code, economyName)}</select></label>
      <label><span>${esc(t("indicator"))}</span><select class="select" data-kof-indicator>${optionsMarkup(state.indicators, state.indicator, (item) => item.code, (item) => `${state.lang === "ru" ? item.label_ru : item.label_en} · ${item.code}`)}</select></label>
      <label><span>${esc(t("year"))}</span><select class="select" data-kof-year>${state.years.slice().reverse().map((year) => `<option value="${year}" ${year === state.year ? "selected" : ""}>${year}</option>`).join("")}</select></label>
      <div class="kof-control-meta"><span>${esc(t("release"))}</span><b>${esc(releaseLabel())}</b><small>${state.ranking.length} ${esc(t("economies"))}</small></div>
    </div>`;
  }

  function heroMarkup(row) {
    const score = Number(row?.value);
    const release = state.meta?.current_release || {};
    const csv = `${API_ROOT}/ranking.csv?indicator=${encodeURIComponent(state.indicator)}&year=${encodeURIComponent(state.year || "")}`;
    return `<header class="iw-hero">
      <div class="iw-hero-main">
        <div>
          <span class="iw-overline">${esc(t("overline"))}</span>
          <h1>${esc(t("title"))}</h1>
          <p class="iw-hero-lead">${esc(t("lead"))}</p>
          <div class="iw-status-line">
            <span class="accent">${esc(t("source"))}</span><span>${esc(t("official"))}</span><span>${esc(t("derived"))}</span><span>${esc(t("snapshot"))}</span>${isQa() ? `<span class="kof-qa-badge">${esc(t("qa"))}</span>` : ""}
          </div>
        </div>
        <div class="iw-hero-actions"><a class="iw-button primary" href="${esc(sourceUrl())}" target="_blank" rel="noopener noreferrer">${esc(t("sourceButton"))}</a><a class="iw-button" href="${esc(csv)}" download>${esc(t("exportCsv"))}</a></div>
      </div>
      <aside class="iw-score-panel" aria-label="${esc(t("official"))}">
        <span>${esc(indicatorLabel())}</span>
        <div class="iw-score-value"><strong>${num(score, 1)}</strong><small>/ 100</small></div>
        <div class="iw-rank-line"><div><span>${esc(t("rank"))}</span><b>#${row?.rank ?? "—"}</b></div><div><span>${esc(t("percentile"))}</span><b>${num(row?.percentile, 1)}%</b></div></div>
        <div class="iw-percentile"><header><span>${esc(t("percentile"))}</span><b>${num(row?.percentile, 1)}%</b></header><div class="iw-track"><i style="width:${clamp(Number(row?.percentile) || 0, 0, 100)}%"></i></div></div>
        <div class="iw-score-meta"><div><span>${esc(t("economy"))}</span><b>${esc(economyName(row))}</b></div><div><span>ISO3</span><b>${esc(row?.iso3 || row?.source_code || "—")}</b></div><div><span>${esc(t("year"))}</span><b>${state.year ?? "—"}</b></div><div><span>${esc(t("release"))}</span><b>${esc(release.release_year || releaseLabel())}</b></div></div>
      </aside>
    </header>`;
  }

  function jumpMarkup() {
    const items = [["kof-position", "navPosition"], ["kof-map", "navMap"], ["kof-architecture", "navArchitecture"], ["kof-trend", "navTrend"], ["kof-compare", "navCompare"], ["kof-ranking", "navRanking"], ["kof-method", "navMethod"]];
    return `<nav class="iw-jump" aria-label="${esc(t("navigation"))}">${items.map(([id, key]) => `<button type="button" data-kof-jump="#${id}">${esc(t(key))}</button>`).join("")}</nav>`;
  }

  function sectionHeading(kicker, title, text) {
    return `<div class="iw-section-heading"><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2></div><p>${esc(text)}</p></div>`;
  }

  function coreDimensionCards() {
    const rows = PROFILE_ROWS.filter((item) => ["overall", "economic", "social", "political"].includes(item.key));
    return `<div class="iw-components">${rows.map((item) => {
      const combined = countryValue(item.combined);
      const df = countryValue(item.deFacto);
      const dj = countryValue(item.deJure);
      return `<article class="iw-component"><header><div><span>${esc(item.combined)}</span><h3>${esc(profileLabel(item.key))}</h3></div><div class="value">${num(combined, 1)} <small>/100</small></div></header><div class="bar"><i style="width:${clamp(combined || 0, 0, 100)}%"></i></div><dl><div><dt>${esc(t("combined"))}</dt><dd>${num(combined, 1)}</dd></div><div><dt>${esc(t("deFacto"))}</dt><dd>${num(df, 1)}</dd></div><div><dt>${esc(t("deJure"))}</dt><dd>${num(dj, 1)}</dd></div></dl></article>`;
    }).join("")}</div>`;
  }

  function positionMarkup(row) {
    const values = state.ranking.map((item) => Number(item.value)).filter(Number.isFinite);
    const med = median(values);
    const overallGap = countryValue("KOFGIdf") - countryValue("KOFGIdj");
    return `<section id="kof-position" class="iw-section">
      ${sectionHeading(t("s1Kicker"), t("s1Title"), t("s1Text"))}
      <div class="iw-findings">
        <article class="iw-finding"><span>${esc(t("rankOf"))}</span><strong>#${row?.rank ?? "—"}</strong><b>${state.ranking.length} ${esc(t("economies"))}</b><p>${esc(t("girOrigin"))}</p></article>
        <article class="iw-finding"><span>${esc(t("change5"))}</span><strong>${signed(row?.value_change_5y, 1)}</strong><b>${esc(indicatorLabel())}</b><p>${esc(t("derived"))}</p></article>
        <article class="iw-finding"><span>${esc(t("modeGap"))}</span><strong>${signed(overallGap, 1)}</strong><b>${esc(t("overall"))}</b><p>${esc(t("deFacto"))} − ${esc(t("deJure"))}</p></article>
        <article class="iw-finding"><span>${esc(t("distanceMedian"))}</span><strong>${signed(Number(row?.value) - Number(med), 1)}</strong><b>${Number(row?.value) >= Number(med) ? esc(t("aboveMedian")) : esc(t("belowMedian"))}</b><p>${esc(t("official"))}</p></article>
      </div>
      <div class="kof-origin-strip"><div><span>${esc(t("officialOrigin"))}</span><b>${esc(t("officialOwner"))}</b></div><div><span>${esc(t("girOrigin"))}</span><b>${esc(t("gir"))}</b></div></div>
      <div class="kof-subheading"><span>${esc(t("dimensions"))}</span><p>${esc(t("officialNotice"))}</p></div>
      ${coreDimensionCards()}
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
      const label = `${iso3 || "N/A"}: ${Number.isFinite(value) ? num(value, 1) : t("noData")}`;
      return `<path d="${path}" class="kof-map-country kof-bin-${binFor(value, thresholds)} ${selected ? "is-selected" : ""}" ${iso3 ? `data-kof-map-iso="${iso3}" tabindex="0" role="button" aria-label="${esc(label)}"` : `aria-label="${esc(label)}"`}><title>${esc(label)}</title></path>`;
    }).join("");
    return `<svg class="kof-map-svg" viewBox="0 0 1000 500" role="img" aria-label="${esc(t("worldMap"))}">${paths}</svg>`;
  }
  function mapMarkup(row) {
    const leaders = state.ranking.slice(0, 7);
    const values = state.ranking.map((item) => Number(item.value)).filter(Number.isFinite);
    const med = median(values);
    return `<section id="kof-map" class="iw-section">
      ${sectionHeading(t("s2Kicker"), t("s2Title"), t("s2Text"))}
      <div class="kof-map-grid"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(indicatorMeta().code)}</span><h3>${esc(t("worldMap"))}</h3></div><p>${esc(indicatorLabel())} · ${state.year}</p></div><div class="kof-map-frame">${mapSvgMarkup()}<div class="kof-map-legend"><span>${esc(t("mapHint"))}</span>${[1,2,3,4,5,6,7].map((bin) => `<i class="kof-bin-${bin}"></i>`).join("")}</div></div></article>
      <aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("leaders"))}</span><h3>${esc(indicatorLabel())}</h3></div><p>${state.year}</p></div><div class="kof-leader-list">${leaders.map((item) => `<button type="button" data-kof-select="${esc(item.iso3)}" class="${item.iso3 === state.iso3 ? "is-selected" : ""}"><span>#${item.rank}</span><b>${esc(economyName(item))}</b><em>${num(item.value, 1)}</em></button>`).join("")}</div><div class="kof-selected-context"><span>${esc(t("selectedContext"))}</span><strong>${esc(economyName(row))}</strong><p>#${row?.rank ?? "—"} · ${num(row?.value, 1)} · ${Number(row?.value) >= Number(med) ? esc(t("aboveMedian")) : esc(t("belowMedian"))}</p></div></aside></div>
    </section>`;
  }

  function profileRows() {
    return PROFILE_ROWS.map((item) => ({
      ...item,
      combinedValue: countryValue(item.combined),
      deFactoValue: countryValue(item.deFacto),
      deJureValue: countryValue(item.deJure)
    }));
  }
  function architectureMarkup() {
    const rows = profileRows();
    const comparable = rows.filter((item) => Number.isFinite(item.combinedValue));
    const strongest = comparable.slice().sort((a, b) => b.combinedValue - a.combinedValue)[0];
    const weakest = comparable.slice().sort((a, b) => a.combinedValue - b.combinedValue)[0];
    const widest = comparable.slice().sort((a, b) => Math.abs(b.deFactoValue - b.deJureValue) - Math.abs(a.deFactoValue - a.deJureValue))[0];
    return `<section id="kof-architecture" class="iw-section">
      ${sectionHeading(t("s3Kicker"), t("s3Title"), t("s3Text"))}
      <div class="iw-analysis-grid"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.iso3)}</span><h3>${esc(t("architecture"))}</h3></div><p>${esc(economyName(currentRow()))} · ${state.year}</p></div><div class="kof-profile-table-wrap" tabindex="0"><table class="kof-profile-table"><caption>${esc(t("architecture"))}</caption><thead><tr><th>${esc(t("dimensions"))}</th><th>${esc(t("combined"))}</th><th>${esc(t("deFacto"))}</th><th>${esc(t("deJure"))}</th><th>${esc(t("modeGap"))}</th></tr></thead><tbody>${rows.map((item) => `<tr><th><span>${esc(item.combined)}</span><b>${esc(profileLabel(item.key))}</b></th><td>${num(item.combinedValue, 1)}<i style="--kof-value:${clamp(item.combinedValue || 0,0,100)}%"></i></td><td>${num(item.deFactoValue, 1)}<i style="--kof-value:${clamp(item.deFactoValue || 0,0,100)}%"></i></td><td>${num(item.deJureValue, 1)}<i style="--kof-value:${clamp(item.deJureValue || 0,0,100)}%"></i></td><td class="${item.deFactoValue - item.deJureValue >= 0 ? "positive" : "negative"}">${signed(item.deFactoValue - item.deJureValue, 1)}</td></tr>`).join("")}</tbody></table></div></article>
      <aside class="iw-panel"><div class="iw-panel-head"><div><span>KOF 2025</span><h3>${esc(t("profileReading"))}</h3></div></div><p class="kof-panel-copy">${esc(t("profileReadingText"))}</p><div class="iw-summary-list"><div><span>${esc(t("strongest"))}</span><b>${esc(strongest ? profileLabel(strongest.key) : "—")} · ${num(strongest?.combinedValue, 1)}</b></div><div><span>${esc(t("weakest"))}</span><b>${esc(weakest ? profileLabel(weakest.key) : "—")} · ${num(weakest?.combinedValue, 1)}</b></div><div><span>${esc(t("widestGap"))}</span><b>${esc(widest ? profileLabel(widest.key) : "—")} · ${signed(widest ? widest.deFactoValue - widest.deJureValue : null, 1)}</b></div></div><div class="iw-method-break"><strong>${esc(t("officialNotice"))}</strong></div></aside></div>
    </section>`;
  }

  function lineChartMarkup(seriesList, selectedYear, compact = false) {
    const all = seriesList.flatMap((series) => series.items || []);
    if (!all.length) return `<div class="iw-empty">${esc(t("noData"))}</div>`;
    const years = all.map((item) => Number(item.year)).filter(Number.isFinite);
    const values = all.map((item) => Number(item.value)).filter(Number.isFinite);
    const minYear = Math.min(...years), maxYear = Math.max(...years);
    const minValue = Math.floor(Math.min(...values) / 5) * 5;
    const maxValue = Math.ceil(Math.max(...values) / 5) * 5 || minValue + 1;
    const width = 900, height = compact ? 300 : 390, left = 58, right = 24, top = 28, bottom = 44;
    const x = (year) => left + (Number(year) - minYear) / Math.max(1, maxYear - minYear) * (width - left - right);
    const y = (value) => top + (maxValue - Number(value)) / Math.max(1, maxValue - minValue) * (height - top - bottom);
    const yTicks = Array.from({length: 5}, (_, i) => minValue + (maxValue - minValue) * i / 4);
    const xTicks = Array.from(new Set([minYear, Math.round(minYear + (maxYear-minYear)*.25), Math.round(minYear + (maxYear-minYear)*.5), Math.round(minYear + (maxYear-minYear)*.75), maxYear]));
    const grids = yTicks.map((tick) => `<line class="iw-grid-line" x1="${left}" y1="${y(tick)}" x2="${width-right}" y2="${y(tick)}"></line><text class="iw-axis-label" x="${left-10}" y="${y(tick)+3}" text-anchor="end">${num(tick,0)}</text>`).join("") + xTicks.map((tick) => `<text class="iw-axis-label" x="${x(tick)}" y="${height-15}" text-anchor="middle">${tick}</text>`).join("");
    const lines = seriesList.map((series, index) => {
      const items = (series.items || []).filter((item) => Number.isFinite(Number(item.value)));
      const path = items.map((item, point) => `${point ? "L" : "M"}${x(item.year).toFixed(2)},${y(item.value).toFixed(2)}`).join(" ");
      const points = seriesList.length === 1 ? items.map((item) => `<circle class="iw-trend-point" cx="${x(item.year)}" cy="${y(item.value)}" r="4"><title>${item.year}: ${num(item.value,1)}</title></circle>`).join("") : "";
      return `<path class="kof-series-line ${SERIES_CLASSES[index % SERIES_CLASSES.length]}" d="${path}"></path>${points}`;
    }).join("");
    const selectedRule = Number.isFinite(Number(selectedYear)) ? `<line class="iw-selected-rule" x1="${x(selectedYear)}" y1="${top}" x2="${x(selectedYear)}" y2="${height-bottom}"></line>` : "";
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t("trend"))}">${grids}${selectedRule}${lines}</svg>`;
  }

  function trendMarkup() {
    const items = state.series || [];
    const values = items.map((item) => Number(item.value)).filter(Number.isFinite);
    const best = items.slice().sort((a,b) => Number(b.value)-Number(a.value))[0];
    return `<section id="kof-trend" class="iw-section">
      ${sectionHeading(t("s4Kicker"), t("s4Title"), t("s4Text"))}
      <div class="iw-analysis-grid"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.iso3)} · ${esc(state.indicator)}</span><h3>${esc(t("trend"))}</h3></div><p>${esc(indicatorLabel())}</p></div><div class="iw-chart-frame">${lineChartMarkup([{items} ], state.year)}</div></article><aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("trendSummary"))}</span><h3>${esc(economyName(currentRow()))}</h3></div></div><div class="iw-summary-list"><div><span>${esc(t("firstYear"))}</span><b>${items[0]?.year ?? "—"}</b></div><div><span>${esc(t("latestYear"))}</span><b>${items.at(-1)?.year ?? "—"}</b></div><div><span>${esc(t("minimum"))}</span><b>${num(values.length ? Math.min(...values) : null,1)}</b></div><div><span>${esc(t("maximum"))}</span><b>${num(values.length ? Math.max(...values) : null,1)}</b></div><div><span>${esc(t("mean"))}</span><b>${num(values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : null,1)}</b></div><div><span>${esc(t("bestYear"))}</span><b>${best?.year ?? "—"}</b></div></div><div class="iw-method-break"><strong>${esc(t("normalisationTitle"))}</strong><br>${esc(t("normalisationText"))}</div></aside></div>
    </section>`;
  }

  function comparisonMarkup() {
    const selectedSet = new Set(state.compareIso);
    const available = state.ranking.filter((item) => !selectedSet.has(item.iso3)).slice(0, 250);
    const series = state.compare.map((item) => ({items: item.items || []}));
    return `<section id="kof-compare" class="iw-section">
      ${sectionHeading(t("s5Kicker"), t("s5Title"), t("s5Text"))}
      <div class="kof-compare-toolbar"><label><span>${esc(t("addEconomy"))}</span><select class="select" data-kof-compare-add><option value="">—</option>${available.map((item) => `<option value="${esc(item.iso3)}">${esc(economyName(item))}</option>`).join("")}</select></label><small>${esc(t("compareLimit"))}</small><div class="kof-current-comparison">${state.compare.map((item,index) => `<button type="button" data-kof-compare-remove="${esc(item.economy?.iso3 || item.economy?.source_code)}"><i class="${SERIES_CLASSES[index % SERIES_CLASSES.length]}"></i><strong>${esc(item.economy?.economy_name || item.economy?.iso3)}</strong><span>${esc(t("remove"))}</span></button>`).join("")}</div></div>
      <div class="kof-comparison-grid"><article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)}</span><h3>${esc(t("comparisonChart"))}</h3></div><p>${esc(indicatorLabel())}</p></div><div class="iw-chart-frame">${lineChartMarkup(series, state.year, true)}</div></article><aside class="iw-panel"><div class="iw-panel-head"><div><span>${esc(t("currentComparison"))}</span><h3>${state.year}</h3></div></div><div class="kof-compare-list">${state.compare.map((item,index) => { const current=(item.items||[]).find((entry)=>Number(entry.year)===Number(state.year)) || (item.items||[]).at(-1); return `<div><i class="${SERIES_CLASSES[index % SERIES_CLASSES.length]}"></i><span>${esc(item.economy?.economy_name || item.economy?.iso3)}</span><b>${num(current?.value,1)}</b></div>`; }).join("")}</div></aside></div>
    </section>`;
  }

  function filteredRows() {
    const query = state.search.trim().toLocaleLowerCase(state.lang === "ru" ? "ru" : "en");
    const rows = state.ranking.filter((item) => !query || economyName(item).toLocaleLowerCase().includes(query) || String(item.iso3 || item.source_code).toLowerCase().includes(query));
    const sorted = rows.slice();
    if (state.sort === "score") sorted.sort((a,b) => Number(b.value)-Number(a.value));
    else if (state.sort === "change") sorted.sort((a,b) => (Number(b.value_change_5y)||-Infinity)-(Number(a.value_change_5y)||-Infinity));
    else if (state.sort === "name") sorted.sort((a,b) => economyName(a).localeCompare(economyName(b), state.lang));
    else sorted.sort((a,b) => Number(a.rank)-Number(b.rank));
    return sorted;
  }

  function rankingMarkup() {
    const rows = filteredRows();
    return `<section id="kof-ranking" class="iw-section">
      ${sectionHeading(t("s6Kicker"), t("s6Title"), t("s6Text"))}
      <article class="iw-panel"><div class="iw-panel-head"><div><span>${esc(state.indicator)} · ${state.year}</span><h3>${esc(indicatorLabel())}</h3></div><p>${esc(t("official"))} · ${esc(t("derived"))}</p></div><div class="iw-ranking-tools"><label><span>${esc(t("search"))}</span><input type="search" data-kof-search value="${esc(state.search)}" placeholder="${esc(t("search"))}"></label><label class="kof-sort-label"><span>${esc(t("sort"))}</span><select class="select" data-kof-sort><option value="rank" ${state.sort==="rank"?"selected":""}>${esc(t("sortRank"))}</option><option value="score" ${state.sort==="score"?"selected":""}>${esc(t("sortScore"))}</option><option value="change" ${state.sort==="change"?"selected":""}>${esc(t("sortChange"))}</option><option value="name" ${state.sort==="name"?"selected":""}>${esc(t("sortName"))}</option></select></label><span class="iw-page-meta">${esc(t("shown"))}: ${rows.length} / ${state.ranking.length}</span></div>
      ${rows.length ? `<div class="iw-table-wrap" tabindex="0"><table class="iw-table kof-ranking-table"><caption>${esc(t("s6Title"))}</caption><thead><tr><th>#</th><th>${esc(t("economy"))}</th><th>${esc(t("officialScore"))}</th><th>${esc(t("girPercentile"))}</th><th>${esc(t("delta1"))}</th><th>${esc(t("delta5"))}</th><th>${esc(t("delta10"))}</th></tr></thead><tbody>${rows.map((item) => `<tr class="${item.iso3===state.iso3?"is-selected":""}"><td>${item.rank ?? "—"}</td><td><button class="iw-country-button" type="button" data-kof-select="${esc(item.iso3)}" aria-label="${esc(t("openEconomy"))}: ${esc(economyName(item))}"><span class="iw-country-cell"><span class="kof-iso-badge">${esc(item.iso3 || item.source_code)}</span><span><strong>${esc(economyName(item))}</strong><small>${esc(item.iso3 || item.source_code)}</small></span></span></button></td><td>${num(item.value,1)}</td><td>${num(item.percentile,1)}%</td><td>${signed(item.value_change_1y,1)}</td><td>${signed(item.value_change_5y,1)}</td><td>${signed(item.value_change_10y,1)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="iw-empty">${esc(t("noResults"))}</div>`}</article>
    </section>`;
  }

  function formatDate(value) {
    if (!value) return t("notSpecified");
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(state.lang === "ru" ? "ru-RU" : "en-GB", {year:"numeric",month:"short",day:"2-digit"});
  }
  function provenanceValue(...keys) {
    const release = state.provenance?.release || state.meta?.current_release || {};
    const snapshot = state.provenance?.snapshot || {};
    for (const key of keys) {
      const value = release[key] ?? snapshot[key] ?? state.provenance?.[key];
      if (value != null && value !== "") return value;
    }
    return null;
  }
  function methodMarkup() {
    const release = state.meta?.current_release || {};
    const transform = state.provenance?.transformations || {};
    const sourceMember = [provenanceValue("source_member"), provenanceValue("source_sheet")].filter(Boolean).join(" · ");
    return `<section id="kof-method" class="iw-section">
      ${sectionHeading(t("s7Kicker"), t("s7Title"), t("s7Text"))}
      <div class="iw-method-grid"><article class="iw-method-card"><span>KOF</span><h3>${esc(t("concept"))}</h3><div class="iw-formula">${esc(t("conceptText"))}</div><p>${esc(state.methodology?.method_notice || t("officialNotice"))}</p><p>${esc(state.methodology?.normalisation_notice || t("normalisationText"))}</p></article><article class="iw-method-card"><span>GIR</span><h3>${esc(t("formula"))}</h3><div class="iw-formula">${esc(t("formulaText"))}</div><p>${esc(t("derivedNotice"))}</p><div class="kof-origin-cards"><div><span>${esc(t("officialOrigin"))}</span><b>${esc(t("officialOwner"))}</b></div><div><span>${esc(t("girOrigin"))}</span><b>${esc(t("gir"))}</b></div></div></article></div>
      <article class="iw-panel kof-provenance-panel"><div class="iw-panel-head"><div><span>PROVENANCE</span><h3>${esc(t("provenance"))}</h3></div><p>${esc(release.release_id || "—")}</p></div><dl class="iw-source-list"><div><dt>${esc(t("source"))}</dt><dd><a href="${esc(sourceUrl())}" target="_blank" rel="noopener noreferrer">${esc(t("officialOwner"))}</a></dd></div><div><dt>${esc(t("release"))}</dt><dd>${esc(release.release_label || release.release_year || "—")}</dd></div><div><dt>${esc(t("period"))}</dt><dd>${esc(`${release.first_year ?? "—"}–${release.latest_year ?? "—"}`)}</dd></div><div><dt>${esc(t("coverage"))}</dt><dd>${release.economy_count ?? release.latest_overall_economies ?? state.ranking.length} ${esc(t("economies"))} · ${state.indicators.length} indicators</dd></div><div><dt>${esc(t("retrieved"))}</dt><dd>${esc(formatDate(release.retrieved_at || release.created_at || provenanceValue("retrieved_at")))}</dd></div><div><dt>${esc(t("sha256"))}</dt><dd><code>${esc(provenanceValue("sha256", "raw_snapshot_sha256") || t("notSpecified"))}</code></dd></div><div><dt>${esc(t("parser"))}</dt><dd>${esc(release.parser_version || t("notSpecified"))}</dd></div><div><dt>${esc(t("sourceMember"))}</dt><dd>${esc(sourceMember || t("notSpecified"))}</dd></div><div><dt>${esc(t("transformations"))}</dt><dd><code>${esc(Object.values(transform).filter(Boolean).join(" · ") || t("notSpecified"))}</code></dd></div></dl></article>
    </section>`;
  }

  function workspaceMarkup() {
    const row = currentRow();
    return `<article class="index-workspace kof-native" data-kof-root>
      ${heroMarkup(row)}${controlStripMarkup()}${jumpMarkup()}${positionMarkup(row)}${mapMarkup(row)}${architectureMarkup()}${trendMarkup()}${comparisonMarkup()}${rankingMarkup()}${methodMarkup()}
      <div class="kof-live-region" aria-live="polite" aria-atomic="true"></div>
    </article>`;
  }

  function announce(message) {
    const live = state.root?.querySelector(".kof-live-region");
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
      if (scrollToTop) state.root.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
      announce(`${economyName(currentRow())}, ${num(currentRow()?.value,1)}`);
    } catch (error) {
      if (token !== state.token) return;
      state.status = "error"; state.error = error; state.root.innerHTML = errorMarkup(error); bindError();
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
      const rankingPayload = await request("/ranking", {indicator, year: state.year, limit: 250, include_changes: true});
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
      state.root.innerHTML = workspaceMarkup(); bindWorkspace(); syncUrl();
    } catch (error) {
      if (token !== state.token) return;
      state.status = "error"; state.error = error; state.root.innerHTML = errorMarkup(error); bindError();
    }
  }

  function bindError() {
    state.root?.querySelector("[data-kof-retry]")?.addEventListener("click", () => render({root: state.root, lang: state.lang, theme: state.theme, country: state.iso3, year: state.year}));
  }

  function bindWorkspace() {
    const root = state.root;
    if (!root) return;
    root.querySelector("[data-kof-country]")?.addEventListener("change", (event) => selectCountry(event.target.value));
    root.querySelector("[data-kof-indicator]")?.addEventListener("change", (event) => changeView({indicator: event.target.value, year: state.year}));
    root.querySelector("[data-kof-year]")?.addEventListener("change", (event) => changeView({indicator: state.indicator, year: Number(event.target.value)}));
    root.querySelectorAll("[data-kof-jump]").forEach((button) => button.addEventListener("click", () => root.querySelector(button.dataset.kofJump)?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"})));
    root.querySelectorAll("[data-kof-select]").forEach((button) => button.addEventListener("click", () => selectCountry(button.dataset.kofSelect)));
    root.querySelectorAll("[data-kof-map-iso]").forEach((path) => {
      const activate = () => selectCountry(path.dataset.kofMapIso);
      path.addEventListener("click", activate);
      path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelector("[data-kof-compare-add]")?.addEventListener("change", async (event) => {
      const code = event.target.value;
      if (!code || state.compareIso.includes(code) || state.compareIso.length >= MAX_COMPARE) return;
      state.compareIso.push(code);
      const token = ++state.token;
      await fetchCompare(token);
      if (token === state.token) { preserveScrollRender(); syncUrl(); }
    });
    root.querySelectorAll("[data-kof-compare-remove]").forEach((button) => button.addEventListener("click", async () => {
      if (state.compareIso.length <= 2) return;
      state.compareIso = state.compareIso.filter((code) => code !== button.dataset.kofCompareRemove);
      const token = ++state.token;
      await fetchCompare(token);
      if (token === state.token) { preserveScrollRender(); syncUrl(); }
    }));
    const search = root.querySelector("[data-kof-search]");
    search?.addEventListener("input", (event) => {
      state.search = event.target.value;
      const tableSection = root.querySelector("#kof-ranking");
      if (!tableSection) return;
      const y = window.scrollY;
      tableSection.outerHTML = rankingMarkup();
      bindWorkspace();
      window.scrollTo(0, y);
      const next = state.root.querySelector("[data-kof-search]");
      next?.focus();
      if (next) next.setSelectionRange(next.value.length, next.value.length);
    });
    root.querySelector("[data-kof-sort]")?.addEventListener("change", (event) => { state.sort = event.target.value; preserveScrollRender(); });
  }

  async function initialize(options, token) {
    state.lang = options.lang === "en" ? "en" : "ru";
    state.theme = options.theme || document.documentElement.dataset.theme || "dark";
    const params = new URLSearchParams(window.location.search);
    state.indicator = params.get("kofIndicator") || "KOFGI";
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

    const [indicatorPayload, methodology, provenance] = await Promise.all([
      request("/indicators"), request("/methodology"), request("/provenance")
    ]);
    if (token !== state.token) return;
    state.indicators = indicatorPayload.items || [];
    state.methodology = methodology;
    state.provenance = provenance;
    if (!state.indicators.some((item) => item.code === state.indicator)) state.indicator = indicatorPayload.default_indicator || "KOFGI";

    const yearsPayload = await request("/years", {indicator: state.indicator});
    if (token !== state.token) return;
    state.years = extractYearItems(yearsPayload);
    const requestedYear = Number(options.year || params.get("year"));
    state.year = state.years.includes(requestedYear) ? requestedYear : state.years.at(-1);

    const rankingPayload = await request("/ranking", {indicator: state.indicator, year: state.year, limit: 250, include_changes: true});
    if (token !== state.token) return;
    state.ranking = rankingPayload.items || [];
    if (!state.ranking.some((item) => item.iso3 === state.iso3)) state.country = null;

    const queryCompare = (params.get("kofCompare") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
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

  window.GIRKOF = Object.freeze({render});
})();
