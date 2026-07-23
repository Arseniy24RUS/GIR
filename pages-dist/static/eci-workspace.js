/* GIR · Harvard Growth Lab Economic Complexity Index · native workspace */
(() => {
  "use strict";

  const API_ROOT = "/api/economy-finance/eci";
  const GEO_URLS = ["/static/world_countries_lite.geojson", "/static/world.geojson"];
  const MAX_COMPARE = 6;
  const SERIES_CLASSES = ["eci-series-0", "eci-series-1", "eci-series-2", "eci-series-3", "eci-series-4", "eci-series-5"];

  const I18N = {
    ru: {
      loading: "Загрузка Economic Complexity Index",
      loadingText: "GIR получает опубликованный снимок Harvard Growth Lab и строит аналитический слой.",
      unavailable: "ECI пока не загружен",
      unavailableText: "Backend установлен, но официальный снимок Harvard Growth Lab ещё не опубликован в локальном хранилище GIR.",
      loadCommand: "python -m giip.economy_finance.eci_cli download",
      importCommand: "python -m giip.economy_finance.eci_cli import-file /path/to/atlas_eci.csv --coverage-profile ranking --year 2024",
      verifyCommand: "python -m giip.economy_finance.eci_cli verify",
      error: "Не удалось открыть рабочую область ECI",
      retry: "Повторить",
      overline: "Экономика и финансы · официальный международный индекс",
      title: "Экономическая сложность",
      lead: "Производственные знания экономики, выраженные через разнообразие экспортной корзины и редкость выпускаемых товаров.",
      source: "Harvard Growth Lab",
      official: "Официальный ECI",
      derived: "Место и динамика рассчитаны GIR",
      snapshot: "Локальный воспроизводимый снимок",
      qa: "QA FIXTURE · НЕОФИЦИАЛЬНЫЕ ЗНАЧЕНИЯ",
      sourceButton: "Официальный источник",
      exportCsv: "Скачать CSV",
      country: "Экономика",
      year: "Год данных",
      release: "Выпуск",
      method: "Методический винтаж",
      score: "ECI",
      rank: "Место GIR",
      percentile: "Процентиль",
      economies: "экономик",
      navigation: "Навигация по ECI",
      navPosition: "Позиция",
      navMap: "Карта",
      navTrend: "Динамика",
      navCompare: "Сравнение",
      navRanking: "Рейтинг",
      navMethod: "Методология",
      s1Kicker: "01 · Позиция экономики",
      s1Title: "Текущее положение в распределении ECI",
      s1Text: "Официальный балл Atlas показан отдельно от ранга, процентиля и изменений, рассчитанных GIR внутри выбранного снимка.",
      rankOf: "Место среди экономик",
      change5: "Изменение ECI за 5 лет",
      rankChange5: "Изменение места за 5 лет",
      distanceMedian: "Отклонение от медианы",
      officialNotice: "ECI — официальное значение Harvard Growth Lab; GIR не пересчитывает сам индекс.",
      derivedNotice: "Соревновательное место, процентиль и изменения — аналитический слой GIR.",
      s2Kicker: "02 · Пространственное распределение",
      s2Title: "Мировая карта экономической сложности",
      s2Text: "Карта использует штатную геометрию GIR и цветовую шкалу платформы. Нажатие на страну меняет выбранную экономику.",
      worldMap: "ECI по странам",
      mapHint: "Квантили: низкие → высокие",
      mapUnavailable: "Геометрия карты временно недоступна; рейтинг и временные ряды продолжают работать.",
      leaders: "Лидеры выбранного года",
      selectedContext: "Положение выбранной экономики",
      aboveMedian: "выше медианы",
      belowMedian: "ниже медианы",
      s3Kicker: "03 · Историческая динамика",
      s3Title: "Траектория ECI внутри снимка",
      s3Text: "Исторический ряд берётся из одного опубликованного снимка. Это исключает незаметное смешение разных перерасчётов Atlas.",
      trend: "Динамика официального ECI",
      trendSummary: "Сводка ряда",
      firstYear: "Первый год",
      latestYear: "Последний год",
      minimum: "Минимум",
      maximum: "Максимум",
      mean: "Среднее",
      bestYear: "Лучший год",
      methodBreakTitle: "Методологический разрыв",
      methodBreakText: "Снимки разных поколений методологии нельзя механически объединять. GIR показывает винтаж каждого выпуска и рассчитывает динамику только внутри него.",
      s4Kicker: "04 · Сравнение",
      s4Title: "Сопоставление траекторий экономик",
      s4Text: "Выберите до шести экономик. Линии используют палитру GIR и один временной диапазон.",
      addEconomy: "Добавить экономику",
      compareLimit: "Можно выбрать не более шести экономик.",
      remove: "Удалить",
      comparisonChart: "Сравнение ECI",
      currentComparison: "Текущий срез",
      s5Kicker: "05 · Полный рейтинг",
      s5Title: "Рейтинг экономик по официальному ECI",
      s5Text: "Таблица сохраняет официальный балл и отдельно маркирует производные поля GIR.",
      search: "Поиск по стране или ISO3",
      sort: "Сортировка",
      sortRank: "По месту",
      sortScore: "По ECI",
      sortChange: "По изменению за 5 лет",
      sortName: "По названию",
      shown: "Показано",
      noResults: "По заданному запросу ничего не найдено.",
      economy: "Экономика",
      officialScore: "ECI · официальный",
      girRank: "Место · GIR",
      girPercentile: "Процентиль · GIR",
      delta1: "Δ 1 год · GIR",
      delta5: "Δ 5 лет · GIR",
      delta10: "Δ 10 лет · GIR",
      openEconomy: "Выбрать экономику",
      s6Kicker: "06 · Методология и происхождение",
      s6Title: "Как читать ECI в GIR",
      s6Text: "В рабочей области разделены официальный показатель, производная аналитика GIR и техническое происхождение выпуска.",
      concept: "Официальная концепция",
      conceptText: "ECI оценивает накопленные производственные знания по структуре экспорта: более разнообразные и менее распространённые товары связаны с более высокой сложностью.",
      formula: "Аналитический слой GIR",
      formulaText: "Соревновательное место: 1, 2, 2, 4. Процентиль = 100 × (N − место) / (N − 1). Изменения считаются между годами одного снимка.",
      provenance: "Происхождение выпуска",
      retrieved: "Получено",
      sha256: "SHA-256",
      parser: "Парсер",
      transformations: "Преобразования",
      coverage: "Покрытие",
      period: "Период",
      sourceMember: "Исходные элементы",
      notSpecified: "не указано",
      noData: "нет данных",
      officialOrigin: "Источник официального значения",
      girOrigin: "Производные поля",
      atlas: "Growth Lab at Harvard University",
      gir: "GIR",
      selected: "Выбрано",
      close: "Закрыть"
    },
    en: {
      loading: "Loading Economic Complexity Index",
      loadingText: "GIR is reading the published Harvard Growth Lab snapshot and preparing its analytical layer.",
      unavailable: "ECI has not been loaded yet",
      unavailableText: "The backend is installed, but no official Harvard Growth Lab snapshot has been published to GIR's local store.",
      loadCommand: "python -m giip.economy_finance.eci_cli download",
      importCommand: "python -m giip.economy_finance.eci_cli import-file /path/to/atlas_eci.csv --coverage-profile ranking --year 2024",
      verifyCommand: "python -m giip.economy_finance.eci_cli verify",
      error: "The ECI workspace could not be opened",
      retry: "Retry",
      overline: "Economy and finance · official international index",
      title: "Economic complexity",
      lead: "Productive knowledge expressed through the diversity of an economy's exports and the rarity of the products it makes.",
      source: "Harvard Growth Lab",
      official: "Official ECI",
      derived: "Rank and change calculated by GIR",
      snapshot: "Local reproducible snapshot",
      qa: "QA FIXTURE · NON-OFFICIAL VALUES",
      sourceButton: "Official source",
      exportCsv: "Download CSV",
      country: "Economy",
      year: "Data year",
      release: "Release",
      method: "Methodology vintage",
      score: "ECI",
      rank: "GIR rank",
      percentile: "Percentile",
      economies: "economies",
      navigation: "ECI navigation",
      navPosition: "Position",
      navMap: "Map",
      navTrend: "Trend",
      navCompare: "Comparison",
      navRanking: "Ranking",
      navMethod: "Methodology",
      s1Kicker: "01 · Economy position",
      s1Title: "Current position in the ECI distribution",
      s1Text: "The official Atlas score is separated from the rank, percentile and changes calculated by GIR within the selected snapshot.",
      rankOf: "Rank among economies",
      change5: "Five-year ECI change",
      rankChange5: "Five-year rank change",
      distanceMedian: "Distance from median",
      officialNotice: "ECI is an official Harvard Growth Lab value; GIR does not recalculate the index itself.",
      derivedNotice: "Competition rank, percentile and changes are GIR analytical fields.",
      s2Kicker: "02 · Spatial distribution",
      s2Title: "World map of economic complexity",
      s2Text: "The map uses GIR's existing geometry and platform colour scale. Select a country to change the active economy.",
      worldMap: "ECI by economy",
      mapHint: "Quantiles: low → high",
      mapUnavailable: "Map geometry is temporarily unavailable; rankings and time series remain available.",
      leaders: "Leaders in the selected year",
      selectedContext: "Selected economy position",
      aboveMedian: "above the median",
      belowMedian: "below the median",
      s3Kicker: "03 · Historical trend",
      s3Title: "ECI trajectory within one snapshot",
      s3Text: "The historical series comes from a single published snapshot, preventing silent mixing of different Atlas recalculations.",
      trend: "Official ECI trend",
      trendSummary: "Series summary",
      firstYear: "First year",
      latestYear: "Latest year",
      minimum: "Minimum",
      maximum: "Maximum",
      mean: "Average",
      bestYear: "Best year",
      methodBreakTitle: "Methodology break",
      methodBreakText: "Snapshots from different methodology generations must not be mechanically merged. GIR exposes the vintage and calculates change only within a snapshot.",
      s4Kicker: "04 · Comparison",
      s4Title: "Compare economy trajectories",
      s4Text: "Select up to six economies. Lines use the GIR palette and a common time range.",
      addEconomy: "Add economy",
      compareLimit: "Up to six economies can be selected.",
      remove: "Remove",
      comparisonChart: "ECI comparison",
      currentComparison: "Current snapshot",
      s5Kicker: "05 · Full ranking",
      s5Title: "Economies ranked by official ECI",
      s5Text: "The table retains the official score and labels GIR-derived fields separately.",
      search: "Search economy or ISO3",
      sort: "Sort",
      sortRank: "By rank",
      sortScore: "By ECI",
      sortChange: "By five-year change",
      sortName: "By name",
      shown: "Showing",
      noResults: "No economies match the query.",
      economy: "Economy",
      officialScore: "ECI · official",
      girRank: "Rank · GIR",
      girPercentile: "Percentile · GIR",
      delta1: "Δ 1 year · GIR",
      delta5: "Δ 5 years · GIR",
      delta10: "Δ 10 years · GIR",
      openEconomy: "Select economy",
      s6Kicker: "06 · Methodology and provenance",
      s6Title: "How to read ECI in GIR",
      s6Text: "The workspace separates the official indicator, GIR-derived analytics and the technical provenance of the release.",
      concept: "Official concept",
      conceptText: "ECI estimates accumulated productive knowledge from export structure: more diverse and less ubiquitous products are associated with higher complexity.",
      formula: "GIR analytical layer",
      formulaText: "Competition rank: 1, 2, 2, 4. Percentile = 100 × (N − rank) / (N − 1). Changes are calculated between years in one snapshot.",
      provenance: "Release provenance",
      retrieved: "Retrieved",
      sha256: "SHA-256",
      parser: "Parser",
      transformations: "Transformations",
      coverage: "Coverage",
      period: "Period",
      sourceMember: "Source members",
      notSpecified: "not specified",
      noData: "no data",
      officialOrigin: "Official-value source",
      girOrigin: "Derived fields",
      atlas: "Growth Lab at Harvard University",
      gir: "GIR",
      selected: "Selected",
      close: "Close"
    }
  };

  const state = {
    root: null,
    lang: "ru",
    theme: "dark",
    token: 0,
    status: "idle",
    meta: null,
    methodology: null,
    provenance: null,
    years: [],
    year: null,
    rows: [],
    selectedIso: null,
    seriesCache: new Map(),
    selectedSeries: [],
    compare: [],
    compareSeries: [],
    search: "",
    sort: "rank",
    geo: null,
    mapError: false,
    preferredCountry: null
  };

  const tr = (key) => I18N[state.lang]?.[key] || I18N.ru[key] || key;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const asNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const asInt = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  };
  const formatNumber = (value, digits = 2) => {
    const number = asNumber(value);
    if (number === null) return "—";
    return new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(number);
  };
  const formatInt = (value) => {
    const number = asInt(value);
    return number === null ? "—" : new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "en-US").format(number);
  };
  const signed = (value, digits = 2) => {
    const number = asNumber(value);
    if (number === null) return "—";
    return `${number > 0 ? "+" : ""}${formatNumber(number, digits)}`;
  };
  const deltaClass = (value) => {
    const number = asNumber(value);
    if (number === null) return "is-na";
    if (number > 0.0005) return "is-positive";
    if (number < -0.0005) return "is-negative";
    return "is-neutral";
  };
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const median = (values) => {
    const list = values.map(asNumber).filter((value) => value !== null).sort((a, b) => a - b);
    if (!list.length) return null;
    const midpoint = Math.floor(list.length / 2);
    return list.length % 2 ? list[midpoint] : (list[midpoint - 1] + list[midpoint]) / 2;
  };
  const mean = (values) => {
    const list = values.map(asNumber).filter((value) => value !== null);
    return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : null;
  };

  function normalizeRow(raw) {
    const iso3 = String(raw.iso3 ?? raw.country_code ?? raw.economy_code ?? raw.code ?? "").trim().toUpperCase();
    return {
      iso3,
      name: String(raw.economy_name ?? raw.country_name ?? raw.economy ?? raw.country ?? raw.name ?? iso3),
      year: asInt(raw.year ?? state.year),
      eci: asNumber(raw.eci ?? raw.score ?? raw.value),
      rank: asInt(raw.rank ?? raw.gir_rank ?? raw.position),
      officialRank: asInt(raw.official_rank ?? raw.source_rank),
      percentile: asNumber(raw.percentile ?? raw.gir_percentile),
      tieCount: asInt(raw.tie_count ?? 1) || 1,
      change1: asNumber(raw.eci_change_1y ?? raw.change_1y),
      rankChange1: asInt(raw.rank_change_1y),
      change5: asNumber(raw.eci_change_5y ?? raw.change_5y),
      rankChange5: asInt(raw.rank_change_5y),
      change10: asNumber(raw.eci_change_10y ?? raw.change_10y),
      rankChange10: asInt(raw.rank_change_10y),
      region: raw.region ?? null,
      incomeGroup: raw.income_group ?? null
    };
  }

  function normalizeSeries(payload) {
    const economy = payload?.economy || {};
    const iso3 = String(economy.iso3 ?? payload?.iso3 ?? "").toUpperCase();
    const name = String(economy.raw_economy_name ?? economy.economy_name ?? economy.name ?? payload?.economy_name ?? iso3);
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return {
      iso3,
      name,
      items: items.map((item) => ({
        year: asInt(item.year),
        eci: asNumber(item.eci ?? item.value ?? item.score),
        rank: asInt(item.rank),
        percentile: asNumber(item.percentile)
      })).filter((item) => item.year !== null && item.eci !== null).sort((a, b) => a.year - b.year)
    };
  }

  async function request(path, params = {}) {
    const adapter = window.__GIR_ECI_QA_ADAPTER__;
    if (adapter && typeof adapter.request === "function") return adapter.request(path, params);
    const url = new URL(`${API_ROOT}${path}`, window.location.origin);
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) value.forEach((entry) => url.searchParams.append(key, String(entry)));
      else if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, {headers: {Accept: "application/json"}, credentials: "same-origin"});
    if (!response.ok) {
      let detail = "";
      try {
        const payload = await response.json();
        detail = typeof payload?.detail === "string" ? payload.detail : JSON.stringify(payload?.detail || payload);
      } catch (_) {
        detail = response.statusText;
      }
      const error = new Error(`${response.status}: ${detail || response.statusText}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function extractYearItems(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return items.map((item) => typeof item === "number" ? item : asInt(item.year)).filter((year) => year !== null).sort((a, b) => a - b);
  }

  async function fetchSeries(iso3, token = state.token) {
    const releaseId = state.meta?.release?.release_id || state.meta?.release_id || "current";
    const key = `${releaseId}:${iso3}`;
    if (state.seriesCache.has(key)) return state.seriesCache.get(key);
    const payload = await request(`/countries/${encodeURIComponent(iso3)}/series`, {release_id: releaseId === "current" ? null : releaseId});
    if (token !== state.token) return null;
    const normalized = normalizeSeries(payload);
    state.seriesCache.set(key, normalized);
    return normalized;
  }

  async function loadGeo(token = state.token) {
    if (state.geo || state.mapError) return state.geo;
    const adapter = window.__GIR_ECI_QA_ADAPTER__;
    if (adapter && typeof adapter.geo === "function") {
      try {
        const value = await adapter.geo();
        if (token === state.token) state.geo = value;
        return value;
      } catch (_) {
        if (token === state.token) state.mapError = true;
        return null;
      }
    }
    for (const url of GEO_URLS) {
      try {
        const response = await fetch(url, {credentials: "same-origin"});
        if (!response.ok) continue;
        const value = await response.json();
        if (token === state.token) state.geo = value;
        return value;
      } catch (_) {
        /* try the next local geometry */
      }
    }
    if (token === state.token) state.mapError = true;
    return null;
  }

  function loadingMarkup() {
    return `<section class="index-workspace eci-native"><div class="iw-loading" role="status" aria-live="polite">
      <div class="iw-loading-mark">ECI</div><h1>${escapeHtml(tr("loading"))}</h1><p>${escapeHtml(tr("loadingText"))}</p>
    </div></section>`;
  }

  function notLoadedMarkup(meta) {
    const sourceUrl = meta?.source?.rankings || "https://atlas.hks.harvard.edu/rankings/";
    return `<section class="index-workspace eci-native">
      <div class="iw-error eci-native-state">
        <div class="iw-loading-mark">ECI</div>
        <span class="iw-overline">${escapeHtml(tr("overline"))}</span>
        <h1>${escapeHtml(tr("unavailable"))}</h1>
        <p>${escapeHtml(tr("unavailableText"))}</p>
        <div class="eci-command-list" aria-label="CLI commands">
          <code>${escapeHtml(tr("loadCommand"))}</code>
          <code>${escapeHtml(tr("importCommand"))}</code>
          <code>${escapeHtml(tr("verifyCommand"))}</code>
        </div>
        <a class="iw-button primary" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("sourceButton"))} ↗</a>
      </div>
    </section>`;
  }

  function errorMarkup(error) {
    return `<section class="index-workspace eci-native"><div class="iw-error" role="alert">
      <div class="iw-loading-mark">ECI</div><h1>${escapeHtml(tr("error"))}</h1>
      <p>${escapeHtml(error?.message || String(error))}</p>
      <button class="iw-button primary" type="button" data-eci-retry>${escapeHtml(tr("retry"))}</button>
    </div></section>`;
  }

  function currentRow() {
    return state.rows.find((row) => row.iso3 === state.selectedIso) || null;
  }

  function sourceUrl() {
    return state.meta?.source?.rankings || state.methodology?.official_concept?.official_glossary || "https://atlas.hks.harvard.edu/rankings/";
  }

  function releaseLabel() {
    return state.meta?.release?.release_label || state.meta?.release_label || state.provenance?.release?.release_label || tr("notSpecified");
  }

  function methodologyVintage() {
    return state.meta?.release?.methodology_vintage || state.meta?.methodology_vintage || state.methodology?.methodology_vintage || tr("notSpecified");
  }

  function optionsMarkup(items, selected, valueKey, labelKey) {
    return items.map((item) => {
      const value = typeof item === "object" ? item[valueKey] : item;
      const label = typeof item === "object" ? item[labelKey] : item;
      return `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeHtml(label)}</option>`;
    }).join("");
  }

  function controlStripMarkup() {
    const countries = [...state.rows].sort((a, b) => a.name.localeCompare(b.name, state.lang === "ru" ? "ru" : "en"));
    return `<section class="iw-panel eci-control-strip" aria-label="${escapeHtml(tr("country"))} / ${escapeHtml(tr("year"))}">
      <label><span>${escapeHtml(tr("country"))}</span><span class="select-shell"><select class="select" data-eci-country>${optionsMarkup(countries, state.selectedIso, "iso3", "name")}</select></span></label>
      <label><span>${escapeHtml(tr("year"))}</span><span class="select-shell eci-year-select"><select class="select" data-eci-year>${optionsMarkup([...state.years].reverse(), state.year)}</select></span></label>
      <div class="eci-control-meta"><span>${escapeHtml(tr("release"))}</span><b>${escapeHtml(releaseLabel())}</b></div>
      <div class="eci-control-meta"><span>${escapeHtml(tr("method"))}</span><b>${escapeHtml(methodologyVintage())}</b></div>
    </section>`;
  }

  function heroMarkup(row) {
    const total = state.rows.length;
    const score = row?.eci;
    const percentile = row?.percentile ?? (row?.rank && total > 1 ? 100 * (total - row.rank) / (total - 1) : null);
    const csvUrl = `${API_ROOT}/ranking.csv?year=${encodeURIComponent(state.year)}`;
    return `<section class="iw-hero">
      <div class="iw-hero-main">
        <div>
          <span class="iw-overline">${escapeHtml(tr("overline"))}</span>
          <h1>${escapeHtml(tr("title"))}</h1>
          <p class="iw-hero-lead">${escapeHtml(tr("lead"))}</p>
          <div class="iw-status-line">
            <span class="accent">${escapeHtml(tr("source"))}</span>
            <span>${escapeHtml(tr("official"))}</span>
            <span>${escapeHtml(tr("derived"))}</span>
            <span>${escapeHtml(tr("snapshot"))}</span>
            ${window.__GIR_ECI_QA__ ? `<span class="eci-qa-chip">${escapeHtml(tr("qa"))}</span>` : ""}
          </div>
        </div>
        <div class="iw-hero-actions">
          <a class="iw-button primary" href="${escapeHtml(sourceUrl())}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("sourceButton"))} ↗</a>
          <a class="iw-button" href="${escapeHtml(csvUrl)}">${escapeHtml(tr("exportCsv"))} ↓</a>
        </div>
      </div>
      <aside class="iw-score-panel" aria-label="${escapeHtml(tr("officialScore"))}">
        <span>${escapeHtml(row?.name || state.selectedIso || tr("noData"))} · ${escapeHtml(state.year)}</span>
        <div class="iw-score-value"><strong>${formatNumber(score, 2)}</strong><small>${escapeHtml(tr("score"))}</small></div>
        <div class="iw-rank-line">
          <div><span>${escapeHtml(tr("rank"))}</span><b>${row?.rank ? `${formatInt(row.rank)} / ${formatInt(total)}` : "—"}</b></div>
          <div><span>${escapeHtml(tr("percentile"))}</span><b>${percentile === null ? "—" : `${formatNumber(percentile, 1)}%`}</b></div>
        </div>
        <div class="iw-percentile"><header><span>${escapeHtml(tr("percentile"))}</span><b>${percentile === null ? "—" : `${formatNumber(percentile, 1)}%`}</b></header><div class="iw-track"><i style="width:${clamp(percentile || 0, 0, 100)}%"></i></div></div>
        <div class="iw-score-meta">
          <div><span>${escapeHtml(tr("release"))}</span><b>${escapeHtml(releaseLabel())}</b></div>
          <div><span>${escapeHtml(tr("method"))}</span><b>${escapeHtml(methodologyVintage())}</b></div>
        </div>
      </aside>
    </section>`;
  }

  function jumpMarkup() {
    const items = [
      ["eci-position", "navPosition"], ["eci-map", "navMap"], ["eci-trend", "navTrend"],
      ["eci-compare", "navCompare"], ["eci-ranking", "navRanking"], ["eci-method", "navMethod"]
    ];
    return `<nav class="iw-jump" aria-label="${escapeHtml(tr("navigation"))}">${items.map(([id, label]) => `<button type="button" data-eci-jump="${id}">${escapeHtml(tr(label))}</button>`).join("")}</nav>`;
  }

  function sectionHeading(kicker, title, text) {
    return `<header class="iw-section-heading"><div><span>${escapeHtml(tr(kicker))}</span><h2>${escapeHtml(tr(title))}</h2></div><p>${escapeHtml(tr(text))}</p></header>`;
  }

  function positionMarkup(row) {
    const values = state.rows.map((item) => item.eci);
    const distributionMedian = median(values);
    const distance = row?.eci !== null && distributionMedian !== null ? row.eci - distributionMedian : null;
    const rankDelta = row?.rankChange5;
    return `<section id="eci-position" class="iw-section">
      ${sectionHeading("s1Kicker", "s1Title", "s1Text")}
      <div class="iw-findings">
        <article class="iw-finding"><span>${escapeHtml(tr("rankOf"))}</span><strong>${row?.rank ? `№ ${formatInt(row.rank)}` : "—"}</strong><b>${formatInt(state.rows.length)} ${escapeHtml(tr("economies"))}</b><p>${escapeHtml(tr("derivedNotice"))}</p></article>
        <article class="iw-finding"><span>${escapeHtml(tr("change5"))}</span><strong class="eci-delta ${deltaClass(row?.change5)}">${signed(row?.change5, 2)}</strong><b>ECI</b><p>${escapeHtml(tr("derivedNotice"))}</p></article>
        <article class="iw-finding"><span>${escapeHtml(tr("rankChange5"))}</span><strong class="eci-delta ${deltaClass(rankDelta)}">${rankDelta === null || rankDelta === undefined ? "—" : `${rankDelta > 0 ? "+" : ""}${formatInt(rankDelta)}`}</strong><b>${escapeHtml(tr("rank"))}</b><p>${escapeHtml(tr("derivedNotice"))}</p></article>
        <article class="iw-finding"><span>${escapeHtml(tr("distanceMedian"))}</span><strong class="eci-delta ${deltaClass(distance)}">${signed(distance, 2)}</strong><b>${distance === null ? "—" : escapeHtml(distance >= 0 ? tr("aboveMedian") : tr("belowMedian"))}</b><p>${escapeHtml(tr("officialNotice"))}</p></article>
      </div>
      <div class="eci-origin-strip"><div><span>${escapeHtml(tr("officialOrigin"))}</span><b>${escapeHtml(tr("atlas"))}</b></div><div><span>${escapeHtml(tr("girOrigin"))}</span><b>${escapeHtml(tr("gir"))}</b></div></div>
    </section>`;
  }

  function featureIso(feature) {
    const props = feature?.properties || {};
    return String(feature?.id ?? props.ISO_A3 ?? props.ADM0_A3 ?? props.iso_a3 ?? props.iso3 ?? props.ISO3 ?? props.code ?? "").trim().toUpperCase();
  }

  function projectPoint(point) {
    const lon = asNumber(point?.[0]);
    const lat = asNumber(point?.[1]);
    if (lon === null || lat === null) return null;
    return [((lon + 180) / 360) * 1000, ((90 - clamp(lat, -90, 90)) / 180) * 500];
  }

  function ringPath(ring) {
    if (!Array.isArray(ring) || !ring.length) return "";
    let output = "";
    let previous = null;
    ring.forEach((point, index) => {
      const projected = projectPoint(point);
      if (!projected) return;
      const [x, y] = projected;
      const jump = previous && Math.abs(x - previous[0]) > 500;
      output += `${index === 0 || jump ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      previous = projected;
    });
    return output ? `${output}Z` : "";
  }

  function geometryPath(geometry) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return (geometry.coordinates || []).map(ringPath).join("");
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map(ringPath)).join("");
    return "";
  }

  function quantileThresholds(values, bins = 7) {
    const list = values.map(asNumber).filter((value) => value !== null).sort((a, b) => a - b);
    if (!list.length) return [];
    const thresholds = [];
    for (let index = 1; index < bins; index += 1) thresholds.push(list[Math.min(list.length - 1, Math.floor((index / bins) * list.length))]);
    return thresholds;
  }

  function binFor(value, thresholds) {
    const number = asNumber(value);
    if (number === null) return 0;
    let bin = 1;
    thresholds.forEach((threshold) => { if (number >= threshold) bin += 1; });
    return clamp(bin, 1, 7);
  }

  function mapSvgMarkup() {
    if (!state.geo?.features?.length) return `<div class="iw-empty">${escapeHtml(tr("mapUnavailable"))}</div>`;
    const rowMap = new Map(state.rows.map((row) => [row.iso3, row]));
    const thresholds = quantileThresholds(state.rows.map((row) => row.eci));
    const features = state.geo.features.map((feature) => {
      const iso3 = featureIso(feature);
      const path = geometryPath(feature.geometry);
      if (!path) return "";
      const row = rowMap.get(iso3);
      const bin = binFor(row?.eci, thresholds);
      const label = row ? `${row.name}: ${formatNumber(row.eci, 2)}` : iso3 || tr("noData");
      return `<path class="eci-map-country ${bin ? `bin-${bin}` : "is-empty"} ${iso3 === state.selectedIso ? "is-selected" : ""}" d="${path}" data-eci-map-iso="${escapeHtml(iso3)}" tabindex="${row ? "0" : "-1"}" role="${row ? "button" : "img"}" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title></path>`;
    }).join("");
    return `<svg class="eci-map-svg" viewBox="0 0 1000 500" role="img" aria-label="${escapeHtml(tr("worldMap"))}" preserveAspectRatio="xMidYMid meet">${features}</svg>`;
  }

  function mapMarkup(row) {
    const leaders = state.rows.filter((item) => item.rank).sort((a, b) => a.rank - b.rank).slice(0, 8);
    const med = median(state.rows.map((item) => item.eci));
    const positionText = row?.eci === null || med === null ? "—" : `${signed(row.eci - med, 2)} · ${row.eci >= med ? tr("aboveMedian") : tr("belowMedian")}`;
    return `<section id="eci-map" class="iw-section">
      ${sectionHeading("s2Kicker", "s2Title", "s2Text")}
      <div class="iw-analysis-grid eci-map-grid">
        <article class="iw-panel">
          <header class="iw-panel-head"><div><span>${escapeHtml(tr("worldMap"))}</span><h3>${escapeHtml(state.year)}</h3></div><p>${escapeHtml(tr("mapHint"))}</p></header>
          <div class="eci-map-frame">${mapSvgMarkup()}<div class="eci-map-legend" aria-hidden="true">${[1,2,3,4,5,6,7].map((bin) => `<i class="bin-${bin}"></i>`).join("")}<span>${escapeHtml(tr("mapHint"))}</span></div></div>
        </article>
        <aside class="iw-panel">
          <header class="iw-panel-head"><div><span>${escapeHtml(tr("leaders"))}</span><h3>${escapeHtml(state.year)}</h3></div><p>${escapeHtml(tr("official"))}</p></header>
          <div class="eci-leader-list">${leaders.map((item) => `<button type="button" data-eci-select="${escapeHtml(item.iso3)}" class="eci-leader-row ${item.iso3 === state.selectedIso ? "is-selected" : ""}"><span>${formatInt(item.rank)}</span><b>${escapeHtml(item.name)}</b><strong>${formatNumber(item.eci, 2)}</strong></button>`).join("")}</div>
          <div class="iw-summary-list eci-selected-summary"><div><span>${escapeHtml(tr("selectedContext"))}</span><b>${escapeHtml(row?.name || "—")}</b></div><div><span>${escapeHtml(tr("distanceMedian"))}</span><b class="eci-delta ${deltaClass(row?.eci !== null && med !== null ? row.eci - med : null)}">${escapeHtml(positionText)}</b></div><div><span>${escapeHtml(tr("rank"))}</span><b>${row?.rank ? `${formatInt(row.rank)} / ${formatInt(state.rows.length)}` : "—"}</b></div></div>
        </aside>
      </div>
    </section>`;
  }

  function lineChartMarkup(seriesList, selectedYear, compact = false) {
    const validSeries = seriesList.filter((series) => series?.items?.length);
    if (!validSeries.length) return `<div class="iw-empty">${escapeHtml(tr("noData"))}</div>`;
    const allPoints = validSeries.flatMap((series) => series.items);
    const years = allPoints.map((item) => item.year);
    const values = allPoints.map((item) => item.eci);
    const yearMin = Math.min(...years);
    const yearMax = Math.max(...years);
    let valueMin = Math.min(...values);
    let valueMax = Math.max(...values);
    const padding = Math.max(0.12, (valueMax - valueMin) * 0.12);
    valueMin -= padding;
    valueMax += padding;
    const width = compact ? 760 : 920;
    const height = compact ? 310 : 390;
    const left = 58, right = 24, top = 24, bottom = 48;
    const plotW = width - left - right, plotH = height - top - bottom;
    const x = (year) => left + ((year - yearMin) / Math.max(1, yearMax - yearMin)) * plotW;
    const y = (value) => top + (1 - (value - valueMin) / Math.max(0.0001, valueMax - valueMin)) * plotH;
    const grid = [];
    for (let index = 0; index <= 4; index += 1) {
      const value = valueMin + ((valueMax - valueMin) * index) / 4;
      const cy = y(value);
      grid.push(`<line class="iw-grid-line" x1="${left}" y1="${cy}" x2="${width-right}" y2="${cy}"></line><text class="iw-axis-label" x="${left-10}" y="${cy+3}" text-anchor="end">${formatNumber(value, 1)}</text>`);
    }
    const tickYears = [...new Set([yearMin, Math.round((yearMin + yearMax) / 2), yearMax, selectedYear].filter((value) => value >= yearMin && value <= yearMax))].sort((a, b) => a - b);
    const yearTicks = tickYears.map((year) => `<text class="iw-axis-label" x="${x(year)}" y="${height-16}" text-anchor="middle">${year}</text>`).join("");
    const paths = validSeries.map((series, index) => {
      const d = series.items.map((item, pointIndex) => `${pointIndex ? "L" : "M"}${x(item.year).toFixed(2)},${y(item.eci).toFixed(2)}`).join("");
      const points = series.items.filter((item) => item.year === selectedYear || validSeries.length === 1 && (item.year === yearMin || item.year === yearMax)).map((item) => `<circle class="eci-series-point ${SERIES_CLASSES[index]}" cx="${x(item.year)}" cy="${y(item.eci)}" r="4"><title>${escapeHtml(series.name)} · ${item.year}: ${formatNumber(item.eci, 2)}</title></circle>`).join("");
      return `<path class="eci-series-line ${SERIES_CLASSES[index]}" d="${d}"></path>${points}`;
    }).join("");
    const selectedRule = selectedYear >= yearMin && selectedYear <= yearMax ? `<line class="iw-selected-rule" x1="${x(selectedYear)}" y1="${top}" x2="${x(selectedYear)}" y2="${height-bottom}"></line>` : "";
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(tr("trend"))}">${grid.join("")}${selectedRule}${paths}${yearTicks}<text class="iw-axis-title" x="${left}" y="15">ECI</text></svg>`;
  }

  function trendMarkup(series) {
    const items = series?.items || [];
    const values = items.map((item) => item.eci);
    const minimum = values.length ? Math.min(...values) : null;
    const maximum = values.length ? Math.max(...values) : null;
    const best = items.find((item) => item.eci === maximum);
    return `<section id="eci-trend" class="iw-section">
      ${sectionHeading("s3Kicker", "s3Title", "s3Text")}
      <div class="iw-analysis-grid">
        <article class="iw-panel"><header class="iw-panel-head"><div><span>${escapeHtml(tr("trend"))}</span><h3>${escapeHtml(series?.name || currentRow()?.name || "—")}</h3></div><p>${escapeHtml(`${items[0]?.year || "—"}–${items.at(-1)?.year || "—"}`)}</p></header><div class="iw-chart-frame">${lineChartMarkup(series ? [series] : [], state.year)}</div><div class="iw-method-break"><strong>${escapeHtml(tr("methodBreakTitle"))}.</strong> ${escapeHtml(tr("methodBreakText"))}</div></article>
        <aside class="iw-panel"><header class="iw-panel-head"><div><span>${escapeHtml(tr("trendSummary"))}</span><h3>${escapeHtml(series?.name || "—")}</h3></div></header><div class="iw-summary-list">
          <div><span>${escapeHtml(tr("firstYear"))}</span><b>${items[0]?.year || "—"}</b></div>
          <div><span>${escapeHtml(tr("latestYear"))}</span><b>${items.at(-1)?.year || "—"}</b></div>
          <div><span>${escapeHtml(tr("minimum"))}</span><b>${formatNumber(minimum, 2)}</b></div>
          <div><span>${escapeHtml(tr("maximum"))}</span><b>${formatNumber(maximum, 2)}</b></div>
          <div><span>${escapeHtml(tr("mean"))}</span><b>${formatNumber(mean(values), 2)}</b></div>
          <div><span>${escapeHtml(tr("bestYear"))}</span><b>${best?.year || "—"}</b></div>
        </div></aside>
      </div>
    </section>`;
  }

  function comparisonMarkup() {
    const selected = new Set(state.compare);
    const available = state.rows.filter((row) => !selected.has(row.iso3)).sort((a, b) => a.name.localeCompare(b.name));
    const currentByIso = new Map(state.rows.map((row) => [row.iso3, row]));
    return `<section id="eci-compare" class="iw-section">
      ${sectionHeading("s4Kicker", "s4Title", "s4Text")}
      <div class="iw-panel eci-compare-toolbar">
        <label><span>${escapeHtml(tr("addEconomy"))}</span><span class="select-shell"><select class="select" data-eci-add-compare><option value="">—</option>${optionsMarkup(available, "", "iso3", "name")}</select></span></label>
        <div class="eci-compare-chips">${state.compare.map((iso3, index) => { const row = currentByIso.get(iso3); return `<span class="eci-compare-chip ${SERIES_CLASSES[index]}"><i></i><b>${escapeHtml(row?.name || iso3)}</b><button type="button" data-eci-remove-compare="${escapeHtml(iso3)}" aria-label="${escapeHtml(`${tr("remove")}: ${row?.name || iso3}`)}">×</button></span>`; }).join("")}</div>
        <small>${escapeHtml(tr("compareLimit"))}</small>
      </div>
      <div class="iw-analysis-grid eci-comparison-grid">
        <article class="iw-panel"><header class="iw-panel-head"><div><span>${escapeHtml(tr("comparisonChart"))}</span><h3>${escapeHtml(`${state.compare.length} ${tr("economies")}`)}</h3></div><p>${escapeHtml(methodologyVintage())}</p></header><div class="iw-chart-frame">${lineChartMarkup(state.compareSeries, state.year, true)}</div></article>
        <aside class="iw-panel"><header class="iw-panel-head"><div><span>${escapeHtml(tr("currentComparison"))}</span><h3>${escapeHtml(state.year)}</h3></div><p>${escapeHtml(tr("official"))}</p></header><div class="eci-current-comparison">${state.compare.map((iso3, index) => { const row = currentByIso.get(iso3); return `<button type="button" data-eci-select="${escapeHtml(iso3)}"><i class="${SERIES_CLASSES[index]}"></i><span><b>${escapeHtml(row?.name || iso3)}</b><small>${escapeHtml(iso3)}</small></span><strong>${formatNumber(row?.eci, 2)}</strong><em>${row?.rank ? `№ ${formatInt(row.rank)}` : "—"}</em></button>`; }).join("")}</div></aside>
      </div>
    </section>`;
  }

  function filteredRows() {
    const query = state.search.trim().toLocaleLowerCase(state.lang === "ru" ? "ru" : "en");
    const rows = state.rows.filter((row) => !query || row.name.toLocaleLowerCase().includes(query) || row.iso3.toLowerCase().includes(query));
    rows.sort((a, b) => {
      if (state.sort === "score") return (b.eci ?? -Infinity) - (a.eci ?? -Infinity) || a.name.localeCompare(b.name);
      if (state.sort === "change") return (b.change5 ?? -Infinity) - (a.change5 ?? -Infinity) || (a.rank ?? 9999) - (b.rank ?? 9999);
      if (state.sort === "name") return a.name.localeCompare(b.name, state.lang === "ru" ? "ru" : "en");
      return (a.rank ?? 9999) - (b.rank ?? 9999) || a.name.localeCompare(b.name);
    });
    return rows;
  }

  function rankingMarkup() {
    const rows = filteredRows();
    return `<section id="eci-ranking" class="iw-section">
      ${sectionHeading("s5Kicker", "s5Title", "s5Text")}
      <article class="iw-panel">
        <div class="iw-ranking-tools">
          <label>${escapeHtml(tr("search"))}<input type="search" value="${escapeHtml(state.search)}" data-eci-search autocomplete="off"></label>
          <label class="eci-sort-label">${escapeHtml(tr("sort"))}<select class="select" data-eci-sort><option value="rank" ${state.sort === "rank" ? "selected" : ""}>${escapeHtml(tr("sortRank"))}</option><option value="score" ${state.sort === "score" ? "selected" : ""}>${escapeHtml(tr("sortScore"))}</option><option value="change" ${state.sort === "change" ? "selected" : ""}>${escapeHtml(tr("sortChange"))}</option><option value="name" ${state.sort === "name" ? "selected" : ""}>${escapeHtml(tr("sortName"))}</option></select></label>
          <a class="iw-button" href="${API_ROOT}/ranking.csv?year=${encodeURIComponent(state.year)}">${escapeHtml(tr("exportCsv"))} ↓</a>
          <span class="iw-page-meta">${escapeHtml(tr("shown"))}: ${formatInt(rows.length)} / ${formatInt(state.rows.length)}</span>
        </div>
        <div class="iw-table-wrap" tabindex="0">
          ${rows.length ? `<table class="iw-table eci-ranking-table"><caption>${escapeHtml(tr("s5Title"))}</caption><thead><tr><th>#</th><th>${escapeHtml(tr("economy"))}</th><th>${escapeHtml(tr("officialScore"))}</th><th>${escapeHtml(tr("girRank"))}</th><th>${escapeHtml(tr("girPercentile"))}</th><th>${escapeHtml(tr("delta1"))}</th><th>${escapeHtml(tr("delta5"))}</th><th>${escapeHtml(tr("delta10"))}</th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.iso3 === state.selectedIso ? "is-selected" : ""}"><td>${formatInt(row.rank)}</td><td><button type="button" class="iw-country-button" data-eci-select="${escapeHtml(row.iso3)}" title="${escapeHtml(tr("openEconomy"))}"><span class="iw-country-cell"><span class="eci-iso-badge">${escapeHtml(row.iso3)}</span><span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.region || row.incomeGroup || row.iso3)}</small></span></span></button></td><td><strong>${formatNumber(row.eci, 2)}</strong><small>${escapeHtml(tr("atlas"))}</small></td><td><strong>${formatInt(row.rank)}</strong><small>${escapeHtml(tr("gir"))}</small></td><td>${row.percentile === null ? "—" : `${formatNumber(row.percentile, 1)}%`}</td><td class="eci-delta ${deltaClass(row.change1)}">${signed(row.change1, 2)}</td><td class="eci-delta ${deltaClass(row.change5)}">${signed(row.change5, 2)}</td><td class="eci-delta ${deltaClass(row.change10)}">${signed(row.change10, 2)}</td></tr>`).join("")}</tbody></table>` : `<div class="iw-empty">${escapeHtml(tr("noResults"))}</div>`}
        </div>
      </article>
    </section>`;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(state.lang === "ru" ? "ru-RU" : "en-US", {year: "numeric", month: "short", day: "2-digit"}).format(date);
  }

  function provenanceValue(...keys) {
    let value = state.provenance;
    for (const key of keys) value = value?.[key];
    return value;
  }

  function methodMarkup() {
    const release = state.provenance?.release || state.meta?.release || {};
    const transformations = release.transform_ids || release.transformations || state.provenance?.transformations || [];
    const sourceMembers = state.provenance?.source_members || [];
    const sha = release.raw_snapshot_sha256 || provenanceValue("provenance_policy", "snapshot_sha256") || state.provenance?.sha256;
    const retrieved = release.retrieved_at || state.provenance?.retrieved_at;
    const parser = release.parser_version || state.meta?.parser_version || state.provenance?.parser_version;
    const period = release.period_start && release.period_end ? `${release.period_start}–${release.period_end}` : `${state.years[0] || "—"}–${state.years.at(-1) || "—"}`;
    const transformText = Array.isArray(transformations) ? transformations.join(" · ") : String(transformations || "—");
    return `<section id="eci-method" class="iw-section">
      ${sectionHeading("s6Kicker", "s6Title", "s6Text")}
      <div class="iw-method-grid">
        <article class="iw-method-card"><span>${escapeHtml(tr("concept"))}</span><h3>Economic Complexity Index</h3><p>${escapeHtml(tr("conceptText"))}</p><div class="iw-formula">${escapeHtml(state.methodology?.official_concept?.summary_ru && state.lang === "ru" ? state.methodology.official_concept.summary_ru : state.methodology?.official_concept?.summary_en || tr("conceptText"))}</div><div class="iw-method-break"><strong>${escapeHtml(tr("methodBreakTitle"))}.</strong> ${escapeHtml(tr("methodBreakText"))}</div></article>
        <article class="iw-method-card"><span>${escapeHtml(tr("formula"))}</span><h3>${escapeHtml(tr("girOrigin"))}</h3><p>${escapeHtml(tr("formulaText"))}</p><div class="eci-origin-cards"><div><span>${escapeHtml(tr("officialScore"))}</span><b>${escapeHtml(tr("atlas"))}</b></div><div><span>${escapeHtml(tr("girRank"))}</span><b>${escapeHtml(tr("gir"))}</b></div><div><span>${escapeHtml(tr("delta5"))}</span><b>${escapeHtml(tr("gir"))}</b></div></div></article>
      </div>
      <article class="iw-panel eci-provenance-panel"><header class="iw-panel-head"><div><span>${escapeHtml(tr("provenance"))}</span><h3>${escapeHtml(releaseLabel())}</h3></div><p>${escapeHtml(methodologyVintage())}</p></header><dl class="iw-source-list">
        <div><dt>${escapeHtml(tr("source"))}</dt><dd><a href="${escapeHtml(sourceUrl())}" target="_blank" rel="noopener noreferrer">${escapeHtml(tr("atlas"))} ↗</a></dd></div>
        <div><dt>${escapeHtml(tr("retrieved"))}</dt><dd>${escapeHtml(formatDate(retrieved))}</dd></div>
        <div><dt>${escapeHtml(tr("sha256"))}</dt><dd><code>${escapeHtml(sha || tr("notSpecified"))}</code></dd></div>
        <div><dt>${escapeHtml(tr("parser"))}</dt><dd>${escapeHtml(parser || tr("notSpecified"))}</dd></div>
        <div><dt>${escapeHtml(tr("transformations"))}</dt><dd>${escapeHtml(transformText || tr("notSpecified"))}</dd></div>
        <div><dt>${escapeHtml(tr("coverage"))}</dt><dd>${formatInt(state.rows.length)} ${escapeHtml(tr("economies"))}</dd></div>
        <div><dt>${escapeHtml(tr("period"))}</dt><dd>${escapeHtml(period)}</dd></div>
        <div><dt>${escapeHtml(tr("sourceMember"))}</dt><dd>${sourceMembers.length ? sourceMembers.map((item) => escapeHtml(item.source_member || item.name || "source")).join(" · ") : escapeHtml(tr("notSpecified"))}</dd></div>
      </dl></article>
    </section>`;
  }

  function workspaceMarkup() {
    const row = currentRow();
    return `<section class="index-workspace eci-native" data-eci-workspace>
      ${heroMarkup(row)}
      ${controlStripMarkup()}
      ${jumpMarkup()}
      ${positionMarkup(row)}
      ${mapMarkup(row)}
      ${trendMarkup(state.selectedSeries)}
      ${comparisonMarkup()}
      ${rankingMarkup()}
      ${methodMarkup()}
      <div class="eci-live-region" aria-live="polite" aria-atomic="true"></div>
    </section>`;
  }

  function announce(message) {
    const live = state.root?.querySelector(".eci-live-region");
    if (live) live.textContent = message;
  }

  function preserveScrollRender() {
    const y = window.scrollY;
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
    window.requestAnimationFrame(() => window.scrollTo({top: y, behavior: "auto"}));
  }

  async function selectCountry(iso3, {scrollToTop = false} = {}) {
    const row = state.rows.find((item) => item.iso3 === iso3);
    if (!row) return;
    const token = state.token;
    state.selectedIso = iso3;
    if (!state.compare.includes(iso3)) state.compare = [iso3, ...state.compare].slice(0, MAX_COMPARE);
    try {
      state.selectedSeries = await fetchSeries(iso3, token);
      state.compareSeries = (await Promise.all(state.compare.map((code) => fetchSeries(code, token)))).filter(Boolean);
      if (token !== state.token) return;
      preserveScrollRender();
      announce(`${row.name}: ${formatNumber(row.eci, 2)}`);
      if (scrollToTop) state.root.querySelector(".iw-hero")?.scrollIntoView({behavior: "smooth", block: "start"});
    } catch (error) {
      console.error("ECI country series failed", error);
    }
  }

  async function changeYear(year) {
    const token = state.token;
    state.year = asInt(year);
    state.root.innerHTML = loadingMarkup();
    try {
      const payload = await request("/ranking", {year: state.year, limit: 1000, include_changes: true});
      if (token !== state.token) return;
      state.rows = (payload.items || []).map(normalizeRow).filter((row) => row.iso3 && row.eci !== null);
      if (!state.rows.some((row) => row.iso3 === state.selectedIso)) state.selectedIso = state.rows.find((row) => row.iso3 === state.preferredCountry)?.iso3 || null;
      const preferred = [state.selectedIso, ...state.compare].filter(Boolean);
      state.compare = [...new Set(preferred)].filter((iso3) => state.rows.some((row) => row.iso3 === iso3)).slice(0, MAX_COMPARE);
      while (state.compare.length < Math.min(4, state.rows.length)) {
        const candidate = state.rows.find((row) => !state.compare.includes(row.iso3));
        if (!candidate) break;
        state.compare.push(candidate.iso3);
      }
      state.selectedSeries = state.selectedIso ? await fetchSeries(state.selectedIso, token) : null;
      state.compareSeries = (await Promise.all(state.compare.map((iso3) => fetchSeries(iso3, token)))).filter(Boolean);
      if (token !== state.token) return;
      state.root.innerHTML = workspaceMarkup();
      bindWorkspace();
    } catch (error) {
      if (token !== state.token) return;
      state.root.innerHTML = errorMarkup(error);
      bindError();
    }
  }

  function bindError() {
    state.root?.querySelector("[data-eci-retry]")?.addEventListener("click", () => render({root: state.root, lang: state.lang, theme: state.theme, country: state.preferredCountry}));
  }

  function bindWorkspace() {
    const root = state.root;
    root.querySelector("[data-eci-country]")?.addEventListener("change", (event) => selectCountry(event.target.value));
    root.querySelector("[data-eci-year]")?.addEventListener("change", (event) => changeYear(event.target.value));
    root.querySelectorAll("[data-eci-jump]").forEach((button) => button.addEventListener("click", () => root.querySelector(`#${CSS.escape(button.dataset.eciJump)}`)?.scrollIntoView({behavior: "smooth", block: "start"})));
    root.querySelectorAll("[data-eci-select]").forEach((button) => button.addEventListener("click", () => selectCountry(button.dataset.eciSelect, {scrollToTop: false})));
    root.querySelectorAll("[data-eci-map-iso]").forEach((path) => {
      const activate = () => path.dataset.eciMapIso && selectCountry(path.dataset.eciMapIso);
      path.addEventListener("click", activate);
      path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelector("[data-eci-add-compare]")?.addEventListener("change", async (event) => {
      const iso3 = event.target.value;
      if (!iso3 || state.compare.includes(iso3) || state.compare.length >= MAX_COMPARE) return;
      state.compare.push(iso3);
      const token = state.token;
      state.compareSeries = (await Promise.all(state.compare.map((code) => fetchSeries(code, token)))).filter(Boolean);
      if (token === state.token) preserveScrollRender();
    });
    root.querySelectorAll("[data-eci-remove-compare]").forEach((button) => button.addEventListener("click", async () => {
      if (state.compare.length <= 2) return;
      state.compare = state.compare.filter((iso3) => iso3 !== button.dataset.eciRemoveCompare);
      const token = state.token;
      state.compareSeries = (await Promise.all(state.compare.map((code) => fetchSeries(code, token)))).filter(Boolean);
      if (token === state.token) preserveScrollRender();
    }));
    const search = root.querySelector("[data-eci-search]");
    search?.addEventListener("input", (event) => {
      state.search = event.target.value;
      preserveScrollRender();
      const next = root.querySelector("[data-eci-search]");
      next?.focus({preventScroll: true});
      if (next) next.setSelectionRange(state.search.length, state.search.length);
    });
    root.querySelector("[data-eci-sort]")?.addEventListener("change", (event) => {
      state.sort = event.target.value;
      preserveScrollRender();
    });
  }

  async function initialize(options, token) {
    state.root.innerHTML = loadingMarkup();
    const meta = await request("/meta");
    if (token !== state.token) return;
    state.meta = meta;
    if (meta.backend_status !== "ready" || !meta.release) {
      state.status = "not_loaded";
      state.root.innerHTML = notLoadedMarkup(meta);
      return;
    }
    const [yearsPayload, methodology, provenance, geo] = await Promise.all([
      request("/years"),
      request("/methodology").catch(() => ({})),
      request("/provenance").catch(() => ({})),
      loadGeo(token)
    ]);
    if (token !== state.token) return;
    state.methodology = methodology;
    state.provenance = provenance;
    state.geo = geo || state.geo;
    state.years = extractYearItems(yearsPayload);
    const requestedYear = asInt(options.year);
    const releaseYear = asInt(meta.release?.period_end);
    state.year = state.years.includes(requestedYear) ? requestedYear : state.years.includes(releaseYear) ? releaseYear : state.years.at(-1);
    const ranking = await request("/ranking", {year: state.year, limit: 1000, include_changes: true});
    if (token !== state.token) return;
    state.rows = (ranking.items || []).map(normalizeRow).filter((row) => row.iso3 && row.eci !== null);
    state.preferredCountry = String(options.country || "").toUpperCase();
    state.selectedIso = state.rows.find((row) => row.iso3 === state.preferredCountry)?.iso3 || null;
    const initialCompare = [state.selectedIso, "CHN", "DEU", "USA", "JPN"].filter((iso3) => iso3 && state.rows.some((row) => row.iso3 === iso3));
    state.compare = [...new Set(initialCompare)].slice(0, 4);
    while (state.compare.length < Math.min(4, state.rows.length)) {
      const candidate = state.rows.find((row) => !state.compare.includes(row.iso3));
      if (!candidate) break;
      state.compare.push(candidate.iso3);
    }
    state.selectedSeries = state.selectedIso ? await fetchSeries(state.selectedIso, token) : null;
    state.compareSeries = (await Promise.all(state.compare.map((iso3) => fetchSeries(iso3, token)))).filter(Boolean);
    if (token !== state.token) return;
    state.status = "ready";
    state.root.innerHTML = workspaceMarkup();
    bindWorkspace();
  }

  async function render(options = {}) {
    const root = options.root || document.querySelector("#view");
    if (!root) return;
    const requestedCountry = String(options.country || new URLSearchParams(window.location.search).get("country") || "").toUpperCase();
    if (!requestedCountry) return;
    options = { ...options, country: requestedCountry };
    const normalizedLang = options.lang === "en" ? "en" : "ru";
    const normalizedTheme = options.theme === "light" ? "light" : "dark";
    const sameRoot = state.root === root;
    state.root = root;
    state.lang = normalizedLang;
    state.theme = normalizedTheme;
    if (sameRoot && state.status === "ready" && state.rows.length) {
      root.innerHTML = workspaceMarkup();
      bindWorkspace();
      return;
    }
    state.token += 1;
    state.seriesCache.clear();
    state.mapError = false;
    try {
      await initialize(options, state.token);
    } catch (error) {
      if (error?.status === 503 && state.meta) {
        state.status = "not_loaded";
        root.innerHTML = notLoadedMarkup(state.meta);
        return;
      }
      console.error("GIR ECI workspace failed", error);
      if (root === state.root) {
        state.status = "error";
        root.innerHTML = errorMarkup(error);
        bindError();
      }
    }
  }

  window.GIRECI = Object.freeze({render});
})();
