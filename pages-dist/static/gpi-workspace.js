/* GIR — Global Peace Index workspace, cumulative patch stage 02.
 * No external charting dependency. Official values remain unchanged; every
 * display-only transformation is labelled as derived in the interface.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)gpi-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const API_BASE = "/api/security-connectivity/gpi";
  const RELEASE_FALLBACK = 2026;
  const SCORE_MIN = 1;
  const SCORE_MAX = 5;
  const METRICS = {
    score: { field: "score", short: "GPI", domain: false },
    ongoing_conflict: { field: "ongoing_conflict_score", short: "Conflict", domain: true },
    safety_security: { field: "societal_safety_security_score", short: "Safety", domain: true },
    militarisation: { field: "militarisation_score", short: "Militarisation", domain: true },
  };
  const DOMAIN_KEYS = ["ongoing_conflict", "safety_security", "militarisation"];

  const COPY = {
    ru: {
      module: "Безопасность и международная связанность",
      title: "Глобальный индекс миролюбия",
      acronym: "GPI",
      lead: "Доказательное пространство для сравнения стран по миролюбивости, общественной безопасности, конфликтам и милитаризации.",
      officialRelease: "Официальный выпуск",
      officialValue: "официальное значение IEP",
      countryCoverage: "стран и территорий",
      indicators: "показателя",
      domains: "домена",
      lowerBetter: "меньше — миролюбивее",
      methodology: "Методология",
      officialReport: "Официальный отчёт",
      source: "Источник",
      rank: "Место",
      of: "из",
      score: "Оценка GPI",
      position: "Позиция миролюбия",
      derived: "расчёт отображения GIR",
      movement: "Изменение места",
      noChange: "без изменения",
      up: "выше",
      down: "ниже",
      worldMedian: "Медиана мира",
      selectedCountry: "Выбранная страна",
      release: "Выпуск",
      countries: "Страны",
      analyticalOverview: "Аналитический обзор",
      overviewTitle: "Миролюбие страны в мировом контексте",
      overviewText: "Официальные значения GPI показаны без пересчёта. Процентили, медианы и визуальные шкалы служат только для навигации и сравнения.",
      map: "Интерактивная карта мира",
      mapHint: "Выберите метрику. Кликните страну или используйте стрелки на клавиатуре; Enter открывает профиль.",
      overall: "Общий GPI",
      conflict: "Текущие внутренние и международные конфликты",
      safety: "Общественная безопасность и защищённость",
      militarisation: "Милитаризация",
      noData: "Нет данных",
      morePeaceful: "Более миролюбиво",
      lessPeaceful: "Менее миролюбиво",
      mapTable: "Текстовая альтернатива карте",
      country: "Страна",
      value: "Значение",
      domainProfile: "Профиль по трём доменам",
      domainProfileText: "Точка страны сопоставлена с мировой медианой на официальной шкале 1–5.",
      countryValue: "Страна",
      median: "Медиана",
      bestDecile: "Порог топ-10%",
      strongestDomain: "Наиболее сильный домен",
      pressureDomain: "Главная зона давления",
      gapToMedian: "Отклонение от медианы",
      betterThanMedian: "лучше медианы",
      worseThanMedian: "хуже медианы",
      distribution: "Распределение официальных оценок",
      distributionText: "Гистограмма показывает число стран в каждой части шкалы; маркер обозначает выбранную страну.",
      comparison: "Лаборатория сравнения",
      comparisonTitle: "Сопоставление профилей миролюбия",
      comparisonText: "Диаграмма использует прозрачное преобразование 100 × (5 − официальный балл) / 4: выше означает миролюбивее. В таблице сохранены исходные значения IEP.",
      addCountry: "Добавить страну",
      add: "Добавить",
      reset: "Сбросить сравнение",
      remove: "Удалить",
      displayScale: "Шкала отображения 0–100",
      officialScores: "Официальные оценки 1–5",
      ranking: "Полный рейтинг стран",
      rankingText: "Поиск, сортировка и доказательная запись для каждой официальной строки выпуска.",
      search: "Поиск страны или ISO3",
      sortBy: "Сортировать по",
      direction: "Направление",
      ascending: "по возрастанию",
      descending: "по убыванию",
      rows: "Строк на странице",
      previous: "Назад",
      next: "Вперёд",
      page: "Страница",
      evidence: "Доказательная запись",
      tied: "совместное место",
      exportCsv: "Экспорт CSV",
      methodologyTitle: "Как читать GPI",
      methodologyText: "GIR публикует официальный итоговый балл, ранг и три доменных балла Institute for Economics & Peace. Методология GPI не воспроизводится и не модифицируется приложением.",
      officialNotRecomputed: "Официальный балл не пересчитывается",
      officialNotRecomputedText: "В интерфейсе используются значения, опубликованные IEP. Производные процентили и шкалы чётко отделены от официального результата.",
      internalExternal: "Внутренний и внешний мир",
      internalExternalText: "В официальной методологии агрегирование учитывает внутренний мир с весом 60% и внешний мир с весом 40%.",
      provenanceByDesign: "Provenance по каждой строке",
      provenanceByDesignText: "Снимок, SHA-256, transform ID, страницы отчёта и хеш строки доступны из рейтинга.",
      indicatorComposition: "Состав доменов",
      sixIndicators: "6 показателей",
      elevenIndicators: "11 показателей",
      dataStatus: "Режим данных",
      backend: "FastAPI + SQLite",
      staticSnapshot: "проверенный статический снимок",
      fallbackNotice: "Запрошенный год отсутствует; показан последний доступный официальный выпуск",
      loading: "Загрузка аналитического пространства GPI",
      loadingText: "Проверяются официальный снимок, география и доказательные метаданные.",
      loadError: "Не удалось открыть пространство GPI",
      retry: "Повторить",
      close: "Закрыть",
      sourceDetails: "Источник и целостность",
      publisher: "Издатель",
      published: "Опубликовано",
      retrieved: "Получено",
      reportPages: "Страницы отчёта PDF",
      snapshotHash: "SHA-256 снимка",
      reportHash: "SHA-256 отчёта",
      rowHash: "SHA-256 строки",
      transform: "Преобразование",
      formulaVersion: "Версия формулы",
      quality: "Статус качества",
      copy: "Копировать",
      copied: "Скопировано",
      rawValues: "Официальная строка",
      openReport: "Открыть отчёт",
      datasetNote: "GPI измеряет отсутствие насилия и страха насилия; меньший балл означает более высокий уровень миролюбия.",
      percentileHelp: "100 соответствует первому месту, 0 — последнему месту среди стран выпуска; это производная позиционная шкала GIR.",
      legendHelp: "Цвет кодирует значение выбранной метрики и не заменяет числовую подпись.",
      keyboardMap: "На карте используйте стрелки для перехода между странами, Enter или пробел для выбора, Escape для закрытия подсказки.",
      metric: "Метрика",
      rankChangeUp: "Поднялась на {n}",
      rankChangeDown: "Опустилась на {n}",
      rankChangeSame: "Место не изменилось",
      topReference: "лидер выпуска",
      medianReference: "страна около медианы",
      peerReference: "сосед по рейтингу",
      selectedReference: "выбранная страна",
      ariaRadar: "Сравнение стран по преобразованной шкале миролюбия 0–100",
      exactTable: "Таблица точных значений",
      zeroResults: "По заданному запросу страны не найдены.",
      releaseCoverage: "Охват выпуска",
      dataIntegrity: "Целостность",
      official: "Официально",
      displayOnly: "Производная визуализация",
      mapLoading: "Карта загружается",
      mapUnavailable: "Географический слой недоступен. Рейтинг и все числовые представления продолжают работать.",
    },
    en: {
      module: "Security & international connectivity",
      title: "Global Peace Index",
      acronym: "GPI",
      lead: "An evidence-first workspace for comparing countries across peacefulness, societal safety, conflict and militarisation.",
      officialRelease: "Official release",
      officialValue: "official IEP value",
      countryCoverage: "countries and territories",
      indicators: "indicators",
      domains: "domains",
      lowerBetter: "lower is more peaceful",
      methodology: "Methodology",
      officialReport: "Official report",
      source: "Source",
      rank: "Rank",
      of: "of",
      score: "GPI score",
      position: "Peace position",
      derived: "GIR display calculation",
      movement: "Rank movement",
      noChange: "no change",
      up: "up",
      down: "down",
      worldMedian: "World median",
      selectedCountry: "Selected country",
      release: "Release",
      countries: "Countries",
      analyticalOverview: "Analytical overview",
      overviewTitle: "A country's peacefulness in global context",
      overviewText: "Official GPI values are shown without recomputation. Percentiles, medians and display scales are navigation and comparison aids only.",
      map: "Interactive world map",
      mapHint: "Choose a metric. Select a country by pointer or use arrow keys; Enter opens its profile.",
      overall: "Overall GPI",
      conflict: "Ongoing domestic and international conflict",
      safety: "Societal safety and security",
      militarisation: "Militarisation",
      noData: "No data",
      morePeaceful: "More peaceful",
      lessPeaceful: "Less peaceful",
      mapTable: "Text alternative to the map",
      country: "Country",
      value: "Value",
      domainProfile: "Three-domain profile",
      domainProfileText: "The country marker is compared with the world median on the official 1–5 scale.",
      countryValue: "Country",
      median: "Median",
      bestDecile: "Top-decile threshold",
      strongestDomain: "Strongest relative domain",
      pressureDomain: "Primary pressure domain",
      gapToMedian: "Gap from median",
      betterThanMedian: "better than median",
      worseThanMedian: "worse than median",
      distribution: "Distribution of official scores",
      distributionText: "The histogram counts countries across the scale; the marker identifies the selected country.",
      comparison: "Comparison lab",
      comparisonTitle: "Compare peacefulness profiles",
      comparisonText: "The chart uses the transparent transformation 100 × (5 − official score) / 4: higher means more peaceful. The table retains exact IEP values.",
      addCountry: "Add country",
      add: "Add",
      reset: "Reset comparison",
      remove: "Remove",
      displayScale: "Display scale 0–100",
      officialScores: "Official scores 1–5",
      ranking: "Full country ranking",
      rankingText: "Search, sorting and an evidence record for every official row in the release.",
      search: "Search country or ISO3",
      sortBy: "Sort by",
      direction: "Direction",
      ascending: "ascending",
      descending: "descending",
      rows: "Rows per page",
      previous: "Previous",
      next: "Next",
      page: "Page",
      evidence: "Evidence record",
      tied: "tied rank",
      exportCsv: "Export CSV",
      methodologyTitle: "How to read GPI",
      methodologyText: "GIR publishes the official overall score, rank and three domain scores from the Institute for Economics & Peace. The GPI methodology is neither reproduced nor altered by the application.",
      officialNotRecomputed: "Official score is not recomputed",
      officialNotRecomputedText: "The interface uses values published by IEP. Derived percentiles and display scales are explicitly separated from the official result.",
      internalExternal: "Internal and external peace",
      internalExternalText: "The official methodology weights internal peace at 60% and external peace at 40% in aggregation.",
      provenanceByDesign: "Row-level provenance",
      provenanceByDesignText: "Snapshot, SHA-256, transform ID, report pages and row hash are available from the ranking.",
      indicatorComposition: "Domain composition",
      sixIndicators: "6 indicators",
      elevenIndicators: "11 indicators",
      dataStatus: "Data mode",
      backend: "FastAPI + SQLite",
      staticSnapshot: "verified static snapshot",
      fallbackNotice: "The requested year is unavailable; the latest official release is shown",
      loading: "Loading the GPI analytical workspace",
      loadingText: "Checking the official snapshot, geography and evidence metadata.",
      loadError: "The GPI workspace could not be opened",
      retry: "Retry",
      close: "Close",
      sourceDetails: "Source and integrity",
      publisher: "Publisher",
      published: "Published",
      retrieved: "Retrieved",
      reportPages: "PDF report pages",
      snapshotHash: "Snapshot SHA-256",
      reportHash: "Report SHA-256",
      rowHash: "Row SHA-256",
      transform: "Transform",
      formulaVersion: "Formula version",
      quality: "Quality status",
      copy: "Copy",
      copied: "Copied",
      rawValues: "Official row",
      openReport: "Open report",
      datasetNote: "GPI measures the absence of violence or fear of violence; a lower score indicates greater peacefulness.",
      percentileHelp: "100 corresponds to first place and 0 to last place within the release; this is a derived GIR positional scale.",
      legendHelp: "Colour encodes the selected metric and never replaces its numeric label.",
      keyboardMap: "On the map, use arrow keys to move between countries, Enter or Space to select, and Escape to dismiss the tooltip.",
      metric: "Metric",
      rankChangeUp: "Moved up {n}",
      rankChangeDown: "Moved down {n}",
      rankChangeSame: "Rank unchanged",
      topReference: "release leader",
      medianReference: "country near median",
      peerReference: "ranking neighbour",
      selectedReference: "selected country",
      ariaRadar: "Country comparison on the derived 0–100 peacefulness display scale",
      exactTable: "Exact-value table",
      zeroResults: "No countries match this query.",
      releaseCoverage: "Release coverage",
      dataIntegrity: "Integrity",
      official: "Official",
      displayOnly: "Derived display",
      mapLoading: "Map is loading",
      mapUnavailable: "The geographic layer is unavailable. Rankings and all numeric representations remain functional.",
    },
  };

  const S = {
    context: null,
    data: null,
    geo: null,
    loadKey: "",
    selectedIso: "",
    metric: "score",
    query: "",
    sort: "rank",
    direction: "asc",
    page: 0,
    pageSize: 25,
    compare: [],
    renderToken: 0,
    tooltipTimer: 0,
  };

  function tr(key) { return COPY[S.context?.lang === "en" ? "en" : "ru"][key] || key; }
  function esc(value) {
    const helper = S.context?.escapeHtml;
    if (typeof helper === "function") return helper(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function fmt(value, digits = 3) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function intFmt(value) {
    return value == null ? "—" : Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU");
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
  function scoreToPeace(value) { return clamp(((SCORE_MAX - Number(value)) / (SCORE_MAX - SCORE_MIN)) * 100, 0, 100); }
  function percentile(row, count) { return count <= 1 ? 100 : clamp(((count - Number(row.rank)) / (count - 1)) * 100, 0, 100); }
  function metricField(key) { return METRICS[key]?.field || "score"; }
  function metricLabel(key) {
    return ({ score: tr("overall"), ongoing_conflict: tr("conflict"), safety_security: tr("safety"), militarisation: tr("militarisation") })[key] || key;
  }
  function domainRows() {
    return [
      { key: "ongoing_conflict", field: "ongoing_conflict_score", label: tr("conflict"), count: 6 },
      { key: "safety_security", field: "societal_safety_security_score", label: tr("safety"), count: 11 },
      { key: "militarisation", field: "militarisation_score", label: tr("militarisation"), count: 6 },
    ];
  }
  function requestUrl(path = "") { return `${API_BASE}${path}`; }
  function assetUrl(path) {
    const clean = String(path || "").replace(/^\/+/, "");
    try { return new URL(clean, STATIC_BASE).href; }
    catch (_) { return `/static/${clean}`; }
  }
  function timeoutSignal(ms) {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
    const controller = new AbortController();
    window.setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }
  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { cache: "no-store", signal: timeoutSignal(8000), ...options });
    if (!response.ok) throw new Error(`${url} · HTTP ${response.status}`);
    return response.json();
  }

  function normalizeBackend(overview, ranking, methodology, requestedYear) {
    const release = overview.release || {};
    const metadata = release.metadata || {};
    return {
      schema_version: 1,
      frontend_bundle_version: "api-live",
      index: overview.index || {},
      release: {
        ...release,
        source_url: release.source_url || metadata.source_url,
        report_url: release.report_url || metadata.report_url,
        methodology_url: release.methodology_url || metadata.methodology_url,
        license_or_terms: release.license_or_terms || metadata.license_or_terms,
        metadata,
      },
      coverage: overview.coverage || {},
      domains: overview.domains || metadata.domains || [],
      methodology: methodology || {},
      rows: ranking.rows || [],
      data_mode: "backend",
      requested_year: requestedYear,
      fallback_year: Number(ranking.release_year) !== Number(requestedYear),
    };
  }

  async function loadBackend(requestedYear) {
    const yearQuery = requestedYear ? `?year=${encodeURIComponent(requestedYear)}` : "";
    try {
      const [overview, ranking, methodology] = await Promise.all([
        fetchJson(requestUrl(yearQuery)),
        fetchJson(requestUrl(`/ranking${yearQuery ? `${yearQuery}&` : "?"}limit=500&offset=0&sort=rank&direction=asc&include_provenance=true`)),
        fetchJson(requestUrl(`/methodology${yearQuery}`)),
      ]);
      return normalizeBackend(overview, ranking, methodology, requestedYear);
    } catch (firstError) {
      if (!requestedYear) throw firstError;
      const [overview, ranking, methodology] = await Promise.all([
        fetchJson(requestUrl()),
        fetchJson(requestUrl("/ranking?limit=500&offset=0&sort=rank&direction=asc&include_provenance=true")),
        fetchJson(requestUrl("/methodology")),
      ]);
      return normalizeBackend(overview, ranking, methodology, requestedYear);
    }
  }

  async function loadStatic(requestedYear) {
    const years = [requestedYear, RELEASE_FALLBACK].filter((value, index, list) => value && list.indexOf(value) === index);
    let lastError;
    for (const year of years) {
      try {
        const payload = await fetchJson(assetUrl(`gpi/gpi_${year}.json`));
        payload.data_mode = "static";
        payload.requested_year = requestedYear;
        payload.fallback_year = Number(payload.release?.release_year) !== Number(requestedYear);
        return payload;
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error("No GPI static snapshot available");
  }

  async function loadData(requestedYear) {
    try { return await loadBackend(requestedYear); }
    catch (_) { return loadStatic(requestedYear); }
  }

  async function loadGeo() {
    if (S.geo) return S.geo;
    const candidates = ["world_countries_lite.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
    let error;
    for (const candidate of candidates) {
      try {
        S.geo = await fetchJson(candidate.startsWith("/") ? candidate : assetUrl(candidate));
        return S.geo;
      } catch (err) { error = err; }
    }
    console.warn("GPI map layer unavailable", error);
    return null;
  }

  function normalizeRows(data) {
    const rows = Array.isArray(data.rows) ? data.rows : [];
    return rows.map((raw, index) => ({
      ...raw,
      release_year: Number(raw.release_year || data.release?.release_year || RELEASE_FALLBACK),
      source_order: Number(raw.source_order || index + 1),
      iso3: String(raw.iso3 || "").toUpperCase(),
      country_name: String(raw.country_name || raw.name_en || raw.iso3 || ""),
      rank: Number(raw.rank),
      tied_rank: Boolean(raw.tied_rank),
      score: Number(raw.score),
      rank_change: Number(raw.rank_change || 0),
      ongoing_conflict_score: Number(raw.ongoing_conflict_score),
      societal_safety_security_score: Number(raw.societal_safety_security_score),
      militarisation_score: Number(raw.militarisation_score),
      value_id: raw.value_id || `GPI:${raw.release_year || data.release?.release_year || RELEASE_FALLBACK}:${String(raw.iso3 || "").toUpperCase()}`,
    })).filter((row) => row.iso3 && Number.isFinite(row.rank) && Number.isFinite(row.score));
  }

  function platformCountry(iso3) {
    return (S.context?.platformContext?.countries || []).find((country) => country.iso3 === iso3) || null;
  }
  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const row = typeof rowOrIso === "object" ? rowOrIso : S.data?.rows?.find((item) => item.iso3 === iso3);
    const country = platformCountry(iso3);
    if (country) return S.context?.lang === "en" ? (country.name_en || country.name_ru || row?.country_name || iso3) : (country.name_ru || country.name_en || row?.country_name || iso3);
    return row?.country_name || iso3 || "—";
  }
  function flag(row, className = "gpiw-flag") {
    const country = platformCountry(row.iso3) || { iso3: row.iso3, name_ru: countryName(row), name_en: countryName(row) };
    if (typeof S.context?.flagImage === "function") return S.context.flagImage(country, className);
    return `<span class="${className} gpiw-flag-fallback" aria-hidden="true">${esc(row.iso3)}</span>`;
  }
  function rowByIso(iso3) { return S.data?.rows?.find((row) => row.iso3 === String(iso3 || "").toUpperCase()) || null; }

  function computeSummary(rows) {
    const keys = ["score", "ongoing_conflict_score", "societal_safety_security_score", "militarisation_score"];
    const summary = {};
    keys.forEach((key) => {
      const values = rows.map((row) => Number(row[key])).filter(Number.isFinite).sort((a, b) => a - b);
      const median = values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
      const quantile = (q) => values[Math.round((values.length - 1) * q)];
      summary[key] = { min: values[0], max: values[values.length - 1], median, p10: quantile(.1), p90: quantile(.9) };
    });
    return summary;
  }

  function ensureSelection(rows) {
    const requested = String(S.context?.country || "").toUpperCase();
    const selected = rows.find((row) => row.iso3 === requested) || null;
    S.selectedIso = selected?.iso3 || "";
    if (!S.compare.length) {
      const leader = rows[0];
      const median = rows[Math.floor(rows.length / 2)];
      const peer = rows[Math.min(rows.length - 1, Math.max(0, (selected?.source_order || 1) - 2))];
      S.compare = Array.from(new Set([selected?.iso3, leader?.iso3, median?.iso3, peer?.iso3].filter(Boolean))).slice(0, 4);
    } else if (!S.compare.includes(S.selectedIso)) {
      S.compare = [S.selectedIso, ...S.compare].slice(0, 5);
    }
    S.compare = S.compare.filter((iso3) => rows.some((row) => row.iso3 === iso3)).slice(0, 5);
    return selected;
  }

  function rankMovement(row) {
    const n = Math.abs(Number(row.rank_change || 0));
    if (!n) return tr("rankChangeSame");
    return (row.rank_change > 0 ? tr("rankChangeUp") : tr("rankChangeDown")).replace("{n}", intFmt(n));
  }
  function movementMarkup(row) {
    const direction = row.rank_change > 0 ? "up" : row.rank_change < 0 ? "down" : "same";
    const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "—";
    return `<span class="gpiw-movement ${direction}" title="${esc(rankMovement(row))}"><span aria-hidden="true">${arrow}</span> ${row.rank_change ? intFmt(Math.abs(row.rank_change)) : tr("noChange")}</span>`;
  }

  function loadingMarkup() {
    return `<section class="gpiw gpiw-state" aria-live="polite"><div class="gpiw-state-mark" aria-hidden="true">GPI</div><h1>${esc(tr("loading"))}</h1><p>${esc(tr("loadingText"))}</p><div class="gpiw-loader" aria-hidden="true"><i></i><i></i><i></i></div></section>`;
  }
  function errorMarkup(error) {
    return `<section class="gpiw gpiw-state gpiw-error"><div class="gpiw-state-mark" aria-hidden="true">!</div><h1>${esc(tr("loadError"))}</h1><p>${esc(error?.message || String(error))}</p><button type="button" class="gpiw-button primary" data-gpi-action="retry">${esc(tr("retry"))}</button></section>`;
  }

  function sourceUrl(name) {
    const value = S.data?.release?.[name] || S.data?.release?.metadata?.[name] || S.data?.methodology?.[name] || "";
    return /^https?:\/\//i.test(value) ? value : "";
  }

  function heroMarkup(selected) {
    const count = S.data.rows.length;
    const peacePosition = percentile(selected, count);
    const releaseYear = S.data.release?.release_year || selected.release_year;
    const fallback = S.data.fallback_year ? `<div class="gpiw-release-note" role="status">${esc(tr("fallbackNotice"))}: ${esc(releaseYear)}</div>` : "";
    const report = sourceUrl("report_url");
    return `${fallback}<section class="gpiw-hero" aria-labelledby="gpiw-title">
      <div class="gpiw-hero-main">
        <div>
          <span class="gpiw-overline">${esc(tr("module"))} · ${esc(tr("officialRelease"))} ${esc(releaseYear)}</span>
          <h1 id="gpiw-title"><span>${esc(tr("acronym"))}</span>${esc(tr("title"))}</h1>
          <p class="gpiw-lead">${esc(tr("lead"))}</p>
          <div class="gpiw-status-line" aria-label="${esc(tr("releaseCoverage"))}">
            <span class="official">${esc(tr("official"))}</span>
            <span>${intFmt(count)} ${esc(tr("countryCoverage"))}</span>
            <span>23 ${esc(tr("indicators"))}</span>
            <span>3 ${esc(tr("domains"))}</span>
            <span>${esc(tr("lowerBetter"))}</span>
          </div>
        </div>
        <div class="gpiw-hero-actions">
          <button type="button" class="gpiw-button primary" data-gpi-action="jump" data-target="gpi-methodology">${esc(tr("methodology"))}</button>
          ${report ? `<a class="gpiw-button" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("officialReport"))}<span aria-hidden="true">↗</span></a>` : ""}
        </div>
      </div>
      <aside class="gpiw-country-panel" aria-label="${esc(tr("selectedCountry"))}">
        <header><span>${esc(tr("selectedCountry"))}</span><span class="gpiw-live-dot">${esc(tr("officialValue"))}</span></header>
        <div class="gpiw-country-name">${flag(selected, "gpiw-hero-flag")}<div><strong>${esc(countryName(selected))}</strong><small>${esc(selected.iso3)} · ${esc(releaseYear)}</small></div></div>
        <div class="gpiw-score-lockup"><span>#${intFmt(selected.rank)}</span><div><strong>${fmt(selected.score)}</strong><small>${esc(tr("score"))}</small></div></div>
        <div class="gpiw-peace-meter" aria-label="${esc(tr("position"))}: ${fmt(peacePosition, 0)} ${esc(tr("derived"))}"><i style="--value:${peacePosition}%"></i><b style="--value:${peacePosition}%"></b></div>
        <div class="gpiw-country-meta">
          <div><span>${esc(tr("position"))}</span><b>${fmt(peacePosition, 0)}/100</b><small>${esc(tr("derived"))}</small></div>
          <div><span>${esc(tr("movement"))}</span><b>${movementMarkup(selected)}</b><small>${esc(rankMovement(selected))}</small></div>
        </div>
        <button type="button" class="gpiw-evidence-link" data-gpi-action="evidence" data-iso="${esc(selected.iso3)}">${esc(tr("evidence"))}<span aria-hidden="true">→</span></button>
      </aside>
    </section>`;
  }

  function findingsMarkup(selected, summary) {
    const count = S.data.rows.length;
    const p = percentile(selected, count);
    const strongest = relativeDomains(selected, summary).sort((a, b) => a.gap - b.gap)[0];
    return `<section class="gpiw-findings" aria-label="${esc(tr("analyticalOverview"))}">
      <article><span>${esc(tr("rank"))}</span><strong>#${intFmt(selected.rank)}<small> / ${intFmt(count)}</small></strong><p>${selected.tied_rank ? esc(tr("tied")) : esc(tr("officialValue"))}</p></article>
      <article><span>${esc(tr("score"))}</span><strong>${fmt(selected.score)}</strong><p>${esc(tr("lowerBetter"))}</p></article>
      <article><span>${esc(tr("position"))}</span><strong>${fmt(p, 0)}<small>/100</small></strong><p>${esc(tr("derived"))}</p></article>
      <article><span>${esc(tr("worldMedian"))}</span><strong>${fmt(summary.score.median)}</strong><p>${esc(selected.score <= summary.score.median ? tr("betterThanMedian") : tr("worseThanMedian"))}</p></article>
      <article><span>${esc(tr("strongestDomain"))}</span><strong class="textual">${esc(strongest.label)}</strong><p>${formatGap(strongest.gap)}</p></article>
    </section>`;
  }

  function sectionHeading(kicker, title, text, id = "") {
    return `<div class="gpiw-section-heading"${id ? ` id="${esc(id)}"` : ""}><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2></div><p>${esc(text)}</p></div>`;
  }

  function quantiles(rows, field, bins = 7) {
    const values = rows.map((row) => row[field]).filter(Number.isFinite).sort((a, b) => a - b);
    const cuts = [];
    for (let i = 1; i < bins; i += 1) cuts.push(values[Math.min(values.length - 1, Math.floor((values.length * i) / bins))]);
    return cuts;
  }
  function quantileClass(value, cuts) {
    if (!Number.isFinite(value)) return "empty";
    let index = 0;
    while (index < cuts.length && value > cuts[index]) index += 1;
    return `q${index + 1}`;
  }
  function geoIso(feature) {
    const p = feature?.properties || {};
    const keys = ["iso3", "ISO3", "iso_a3", "ISO_A3", "adm0_a3", "ADM0_A3", "sov_a3", "SOV_A3", "gu_a3", "GU_A3"];
    for (const key of keys) {
      const value = String(p[key] || "").toUpperCase();
      if (/^[A-Z]{3}$/.test(value) && value !== "-99") return value;
    }
    return "";
  }
  function splitRing(ring) {
    const segments = [];
    let segment = [];
    let previous = null;
    (ring || []).forEach((point) => {
      const lon = Number(point?.[0]);
      const lat = Number(point?.[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
      if (previous != null && Math.abs(lon - previous) > 180 && segment.length > 1) { segments.push(segment); segment = []; }
      segment.push([lon, lat]);
      previous = lon;
    });
    if (segment.length > 1) segments.push(segment);
    return segments;
  }
  function project(point, width, height) {
    const lon = clamp(point[0], -180, 180);
    const lat = clamp(point[1], -90, 90);
    return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
  }
  function ringPath(ring, width, height) {
    return splitRing(ring).map((segment) => segment.map((point, index) => {
      const [x, y] = project(point, width, height);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join("") + "Z").join("");
  }
  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return (geometry.coordinates || []).map((ring) => ringPath(ring, width, height)).join("");
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map((ring) => ringPath(ring, width, height))).join("");
    return "";
  }

  function mapMarkup(selected) {
    const field = metricField(S.metric);
    const cuts = quantiles(S.data.rows, field);
    const byIso = new Map(S.data.rows.map((row) => [row.iso3, row]));
    const width = 960;
    const height = 480;
    let paths = "";
    if (S.geo?.features) {
      paths = S.geo.features.map((feature) => {
        const iso3 = geoIso(feature);
        const row = byIso.get(iso3);
        const path = geometryPath(feature.geometry, width, height);
        if (!path) return "";
        const value = row?.[field];
        const cls = quantileClass(value, cuts);
        const label = row ? `${countryName(row)} — ${metricLabel(S.metric)}: ${fmt(value)}` : `${feature.properties?.name || feature.properties?.NAME || iso3 || tr("noData")} — ${tr("noData")}`;
        return `<path class="gpiw-map-country ${cls}${iso3 === selected.iso3 ? " selected" : ""}" d="${path}" data-iso="${esc(iso3)}" data-value="${Number.isFinite(value) ? esc(value) : ""}" role="${row ? "button" : "img"}" tabindex="${iso3 === selected.iso3 ? "0" : "-1"}" aria-label="${esc(label)}" ${row ? `data-gpi-action="map-country"` : ""}></path>`;
      }).join("");
    }
    const legendValues = [S.data.rows[0]?.[field], ...cuts, S.data.rows[S.data.rows.length - 1]?.[field]].filter(Number.isFinite);
    const mapBody = paths ? `<svg class="gpiw-map-svg" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="gpi-map-title gpi-map-desc"><title id="gpi-map-title">${esc(tr("map"))}: ${esc(metricLabel(S.metric))}</title><desc id="gpi-map-desc">${esc(tr("keyboardMap"))}</desc><g>${paths}</g></svg>` : `<div class="gpiw-map-empty"><strong>${esc(tr("mapUnavailable"))}</strong></div>`;
    return `<article class="gpiw-panel gpiw-map-panel">
      <header class="gpiw-panel-head"><div><span>${esc(tr("map"))}</span><h3>${esc(metricLabel(S.metric))}</h3></div><p>${esc(tr("mapHint"))}</p></header>
      <div class="gpiw-segmented" role="group" aria-label="${esc(tr("metric"))}">${Object.keys(METRICS).map((key) => `<button type="button" class="${S.metric === key ? "active" : ""}" aria-pressed="${S.metric === key}" data-gpi-action="metric" data-metric="${key}">${esc(key === "score" ? "GPI" : metricLabel(key))}</button>`).join("")}</div>
      <div class="gpiw-map-wrap">${mapBody}<div class="gpiw-tooltip" role="tooltip" hidden></div></div>
      <div class="gpiw-map-legend" aria-label="${esc(tr("legendHelp"))}"><span>${esc(tr("morePeaceful"))}</span><div>${Array.from({ length: 7 }, (_, index) => `<i class="q${index + 1}" aria-hidden="true"></i>`).join("")}</div><span>${esc(tr("lessPeaceful"))}</span><small>${legendValues.length ? `${fmt(Math.min(...legendValues))}–${fmt(Math.max(...legendValues))}` : ""}</small></div>
      <details class="gpiw-accessible-data"><summary>${esc(tr("mapTable"))}</summary>${compactMetricTable(field)}</details>
    </article>`;
  }

  function compactMetricTable(field) {
    const rows = [...S.data.rows].sort((a, b) => a[field] - b[field]);
    return `<div class="gpiw-table-wrap"><table class="gpiw-table compact"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("country"))}</th><th>${esc(tr("value"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${intFmt(row.rank)}</td><td>${esc(countryName(row))} <small>${esc(row.iso3)}</small></td><td>${fmt(row[field])}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function relativeDomains(selected, summary) {
    return domainRows().map((domain) => ({ ...domain, value: selected[domain.field], median: summary[domain.field].median, p10: summary[domain.field].p10, gap: selected[domain.field] - summary[domain.field].median }));
  }
  function formatGap(gap) {
    const absolute = fmt(Math.abs(gap), 3);
    return `${gap <= 0 ? "−" : "+"}${absolute} · ${esc(gap <= 0 ? tr("betterThanMedian") : tr("worseThanMedian"))}`;
  }
  function domainProfileMarkup(selected, summary) {
    const domains = relativeDomains(selected, summary);
    const strongest = [...domains].sort((a, b) => a.gap - b.gap)[0];
    const pressure = [...domains].sort((a, b) => b.gap - a.gap)[0];
    return `<article class="gpiw-panel gpiw-domain-panel">
      <header class="gpiw-panel-head"><div><span>${esc(tr("domainProfile"))}</span><h3>${esc(countryName(selected))}</h3></div><p>${esc(tr("domainProfileText"))}</p></header>
      <div class="gpiw-domain-list">${domains.map((domain) => {
        const valuePosition = clamp(((domain.value - SCORE_MIN) / 4) * 100, 0, 100);
        const medianPosition = clamp(((domain.median - SCORE_MIN) / 4) * 100, 0, 100);
        const topPosition = clamp(((domain.p10 - SCORE_MIN) / 4) * 100, 0, 100);
        return `<div class="gpiw-domain-row"><div class="gpiw-domain-title"><span>${esc(domain.label)}</span><strong>${fmt(domain.value)}</strong></div><div class="gpiw-domain-scale" aria-label="${esc(domain.label)}: ${fmt(domain.value)}; ${esc(tr("median"))}: ${fmt(domain.median)}"><i style="--value:${valuePosition}%"></i><b class="country" style="--value:${valuePosition}%"></b><b class="median" style="--value:${medianPosition}%"></b><b class="decile" style="--value:${topPosition}%"></b></div><div class="gpiw-domain-meta"><span>${domain.count} ${esc(tr("indicators"))}</span><span>${esc(tr("median"))} ${fmt(domain.median)}</span><span>${formatGap(domain.gap)}</span></div></div>`;
      }).join("")}</div>
      <div class="gpiw-domain-legend"><span><i class="country"></i>${esc(tr("countryValue"))}</span><span><i class="median"></i>${esc(tr("median"))}</span><span><i class="decile"></i>${esc(tr("bestDecile"))}</span></div>
      <div class="gpiw-domain-insights"><div><span>${esc(tr("strongestDomain"))}</span><b>${esc(strongest.label)}</b><small>${formatGap(strongest.gap)}</small></div><div><span>${esc(tr("pressureDomain"))}</span><b>${esc(pressure.label)}</b><small>${formatGap(pressure.gap)}</small></div></div>
    </article>`;
  }

  function histogramMarkup(selected) {
    const values = S.data.rows.map((row) => row.score).sort((a, b) => a - b);
    const binCount = 18;
    const min = Math.floor(Math.min(...values) * 10) / 10;
    const max = Math.ceil(Math.max(...values) * 10) / 10;
    const width = 900;
    const height = 235;
    const margin = { left: 34, right: 16, top: 22, bottom: 34 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const binWidth = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, index) => ({ start: min + index * binWidth, count: 0 }));
    values.forEach((value) => { const index = Math.min(binCount - 1, Math.max(0, Math.floor((value - min) / binWidth))); bins[index].count += 1; });
    const maxCount = Math.max(...bins.map((bin) => bin.count), 1);
    const bars = bins.map((bin, index) => {
      const x = margin.left + (index * innerW) / binCount + 2;
      const barW = innerW / binCount - 4;
      const barH = (bin.count / maxCount) * innerH;
      const y = margin.top + innerH - barH;
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${barH.toFixed(2)}"><title>${fmt(bin.start, 2)}–${fmt(bin.start + binWidth, 2)}: ${intFmt(bin.count)}</title></rect>`;
    }).join("");
    const markerX = margin.left + ((selected.score - min) / (max - min)) * innerW;
    const ticks = Array.from({ length: 6 }, (_, index) => min + ((max - min) * index) / 5).map((value) => {
      const x = margin.left + ((value - min) / (max - min)) * innerW;
      return `<line x1="${x}" x2="${x}" y1="${margin.top + innerH}" y2="${margin.top + innerH + 6}"></line><text x="${x}" y="${height - 10}" text-anchor="middle">${fmt(value, 1)}</text>`;
    }).join("");
    return `<article class="gpiw-panel gpiw-distribution-panel"><header class="gpiw-panel-head"><div><span>${esc(tr("distribution"))}</span><h3>${esc(tr("score"))} · ${esc(S.data.release?.release_year)}</h3></div><p>${esc(tr("distributionText"))}</p></header><div class="gpiw-chart-frame"><svg class="gpiw-histogram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("distribution"))}"><g class="bars">${bars}</g><g class="axis">${ticks}</g><line class="selected" x1="${markerX}" x2="${markerX}" y1="${margin.top - 5}" y2="${margin.top + innerH}"></line><circle class="selected-dot" cx="${markerX}" cy="${margin.top - 4}" r="5"></circle><text class="selected-label" x="${clamp(markerX + 8, 48, width - 150)}" y="${margin.top + 2}">${esc(countryName(selected))} · ${fmt(selected.score)}</text></svg></div></article>`;
  }

  function referenceRows(selected) {
    const rows = S.data.rows;
    const leader = rows[0];
    const median = rows[Math.floor(rows.length / 2)];
    const peerIndex = clamp((selected.source_order || selected.rank || 1) - 2, 0, rows.length - 1);
    const peer = rows[peerIndex];
    return [
      { row: selected, label: tr("selectedReference") },
      { row: leader, label: tr("topReference") },
      { row: median, label: tr("medianReference") },
      { row: peer, label: tr("peerReference") },
    ];
  }
  function resetComparison(selected) { S.compare = Array.from(new Set(referenceRows(selected).map((item) => item.row?.iso3).filter(Boolean))).slice(0, 4); }

  function radarMarkup(compareRows) {
    const axes = [
      { label: "GPI", field: "score" },
      { label: S.context.lang === "en" ? "Conflict" : "Конфликты", field: "ongoing_conflict_score" },
      { label: S.context.lang === "en" ? "Safety" : "Безопасность", field: "societal_safety_security_score" },
      { label: S.context.lang === "en" ? "Militarisation" : "Милитаризация", field: "militarisation_score" },
    ];
    const width = 620;
    const height = 420;
    const cx = 310;
    const cy = 205;
    const radius = 145;
    const point = (axisIndex, value) => {
      const angle = (-Math.PI / 2) + (axisIndex * Math.PI * 2) / axes.length;
      const r = radius * clamp(value / 100, 0, 1);
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    };
    const grids = [25, 50, 75, 100].map((level) => `<polygon points="${axes.map((_, index) => point(index, level).map((v) => v.toFixed(1)).join(",")).join(" ")}"></polygon>`).join("");
    const axisLines = axes.map((axis, index) => {
      const [x, y] = point(index, 100);
      const [lx, ly] = point(index, 118);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${esc(axis.label)}</text>`;
    }).join("");
    const series = compareRows.map((row, index) => {
      const values = axes.map((axis) => scoreToPeace(row[axis.field]));
      const points = values.map((value, axisIndex) => point(axisIndex, value).map((v) => v.toFixed(1)).join(",")).join(" ");
      return `<polygon class="series series-${index}" points="${points}"><title>${esc(countryName(row))}: ${values.map((value) => fmt(value, 0)).join(", ")}</title></polygon>${values.map((value, axisIndex) => { const [x, y] = point(axisIndex, value); return `<circle class="series-dot series-${index}" cx="${x}" cy="${y}" r="4"></circle>`; }).join("")}`;
    }).join("");
    return `<svg class="gpiw-radar" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("ariaRadar"))}"><g class="grid">${grids}${axisLines}</g><g>${series}</g></svg>`;
  }

  function comparisonMarkup(selected) {
    const compareRows = S.compare.map(rowByIso).filter(Boolean);
    const available = S.data.rows.filter((row) => !S.compare.includes(row.iso3));
    return `<section class="gpiw-comparison" id="gpi-comparison">
      ${sectionHeading(tr("comparison"), tr("comparisonTitle"), tr("comparisonText"))}
      <div class="gpiw-compare-controls"><div class="gpiw-compare-chips">${compareRows.map((row, index) => `<span class="series-${index}"><i aria-hidden="true"></i><b>${esc(countryName(row))}</b><small>${esc(row.iso3)}</small>${compareRows.length > 2 ? `<button type="button" aria-label="${esc(tr("remove"))}: ${esc(countryName(row))}" data-gpi-action="remove-compare" data-iso="${esc(row.iso3)}">×</button>` : ""}</span>`).join("")}</div><div class="gpiw-add-compare"><label><span>${esc(tr("addCountry"))}</span><select id="gpiCompareSelect">${available.map((row) => `<option value="${esc(row.iso3)}">${esc(countryName(row))} · #${intFmt(row.rank)}</option>`).join("")}</select></label><button type="button" class="gpiw-button" data-gpi-action="add-compare" ${compareRows.length >= 5 || !available.length ? "disabled" : ""}>${esc(tr("add"))}</button><button type="button" class="gpiw-button quiet" data-gpi-action="reset-compare">${esc(tr("reset"))}</button></div></div>
      <div class="gpiw-compare-grid"><article class="gpiw-panel"><header class="gpiw-panel-head"><div><span>${esc(tr("displayOnly"))}</span><h3>${esc(tr("displayScale"))}</h3></div><p>100 × (5 − score) / 4</p></header><div class="gpiw-radar-frame">${radarMarkup(compareRows)}</div></article><article class="gpiw-panel"><header class="gpiw-panel-head"><div><span>${esc(tr("official"))}</span><h3>${esc(tr("officialScores"))}</h3></div><p>${esc(tr("lowerBetter"))}</p></header>${comparisonTable(compareRows)}</article></div>
    </section>`;
  }

  function comparisonTable(rows) {
    return `<div class="gpiw-table-wrap"><table class="gpiw-table compare"><caption>${esc(tr("exactTable"))}</caption><thead><tr><th>${esc(tr("country"))}</th><th>GPI</th><th>${esc(tr("conflict"))}</th><th>${esc(tr("safety"))}</th><th>${esc(tr("militarisation"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td><span class="gpiw-country-cell">${flag(row)}<span><strong>${esc(countryName(row))}</strong><small>#${intFmt(row.rank)} · ${esc(row.iso3)}</small></span></span></td><td>${fmt(row.score)}</td><td>${fmt(row.ongoing_conflict_score)}</td><td>${fmt(row.societal_safety_security_score)}</td><td>${fmt(row.militarisation_score)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function sortedRows() {
    const query = S.query.trim().toLocaleLowerCase(S.context?.lang === "en" ? "en" : "ru");
    const field = ({ rank: "rank", score: "score", country: "country_name", movement: "rank_change", ongoing_conflict: "ongoing_conflict_score", safety_security: "societal_safety_security_score", militarisation: "militarisation_score" })[S.sort] || "rank";
    const rows = S.data.rows.filter((row) => !query || `${row.iso3} ${row.country_name} ${countryName(row)}`.toLocaleLowerCase(S.context?.lang === "en" ? "en" : "ru").includes(query));
    rows.sort((a, b) => {
      let result;
      if (field === "country_name") result = countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru");
      else result = Number(a[field]) - Number(b[field]);
      if (!result) result = a.source_order - b.source_order;
      return S.direction === "desc" ? -result : result;
    });
    return rows;
  }

  function rankingMarkup(selected) {
    const rows = sortedRows();
    const pageCount = Math.max(1, Math.ceil(rows.length / S.pageSize));
    S.page = clamp(S.page, 0, pageCount - 1);
    const pageRows = rows.slice(S.page * S.pageSize, (S.page + 1) * S.pageSize);
    const report = sourceUrl("report_url");
    return `<section class="gpiw-ranking" id="gpi-ranking">
      ${sectionHeading(tr("ranking"), tr("ranking"), tr("rankingText"))}
      <article class="gpiw-panel"><div class="gpiw-ranking-tools"><label class="wide"><span>${esc(tr("search"))}</span><input type="search" id="gpiRankingSearch" value="${esc(S.query)}" autocomplete="off"></label><label><span>${esc(tr("sortBy"))}</span><select id="gpiRankingSort"><option value="rank" ${S.sort === "rank" ? "selected" : ""}>${esc(tr("rank"))}</option><option value="country" ${S.sort === "country" ? "selected" : ""}>${esc(tr("country"))}</option><option value="score" ${S.sort === "score" ? "selected" : ""}>GPI</option><option value="ongoing_conflict" ${S.sort === "ongoing_conflict" ? "selected" : ""}>${esc(tr("conflict"))}</option><option value="safety_security" ${S.sort === "safety_security" ? "selected" : ""}>${esc(tr("safety"))}</option><option value="militarisation" ${S.sort === "militarisation" ? "selected" : ""}>${esc(tr("militarisation"))}</option><option value="movement" ${S.sort === "movement" ? "selected" : ""}>${esc(tr("movement"))}</option></select></label><label><span>${esc(tr("direction"))}</span><select id="gpiRankingDirection"><option value="asc" ${S.direction === "asc" ? "selected" : ""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction === "desc" ? "selected" : ""}>${esc(tr("descending"))}</option></select></label><label><span>${esc(tr("rows"))}</span><select id="gpiRankingPageSize">${[10, 25, 50, 100].map((size) => `<option value="${size}" ${S.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label><div class="gpiw-ranking-actions">${S.data.data_mode === "backend" ? `<a class="gpiw-button quiet" href="${esc(requestUrl("/export.csv"))}">${esc(tr("exportCsv"))}</a>` : `<button type="button" class="gpiw-button quiet" data-gpi-action="export-static">${esc(tr("exportCsv"))}</button>`}${report ? `<a class="gpiw-button quiet" href="${esc(report)}" target="_blank" rel="noopener noreferrer">PDF ↗</a>` : ""}</div></div>
      <div class="gpiw-table-wrap" tabindex="0"><table class="gpiw-table ranking"><caption>${esc(tr("ranking"))} ${esc(S.data.release?.release_year)}</caption><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("country"))}</th><th>GPI</th><th>${esc(tr("conflict"))}</th><th>${esc(tr("safety"))}</th><th>${esc(tr("militarisation"))}</th><th>${esc(tr("movement"))}</th><th><span class="sr-only">${esc(tr("evidence"))}</span></th></tr></thead><tbody>${pageRows.length ? pageRows.map((row) => `<tr class="${row.iso3 === selected.iso3 ? "selected" : ""}"><td><strong>${row.tied_rank ? "=" : ""}${intFmt(row.rank)}</strong></td><td><button type="button" class="gpiw-country-button" data-gpi-action="country" data-iso="${esc(row.iso3)}"><span class="gpiw-country-cell">${flag(row)}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)}${row.tied_rank ? ` · ${esc(tr("tied"))}` : ""}</small></span></span></button></td><td><strong>${fmt(row.score)}</strong></td><td>${fmt(row.ongoing_conflict_score)}</td><td>${fmt(row.societal_safety_security_score)}</td><td>${fmt(row.militarisation_score)}</td><td>${movementMarkup(row)}</td><td><button type="button" class="gpiw-evidence-icon" data-gpi-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(tr("evidence"))}: ${esc(countryName(row))}">i</button></td></tr>`).join("") : `<tr><td colspan="8"><div class="gpiw-empty">${esc(tr("zeroResults"))}</div></td></tr>`}</tbody></table></div>
      <footer class="gpiw-pagination"><span>${esc(tr("page"))} ${intFmt(S.page + 1)} / ${intFmt(pageCount)} · ${intFmt(rows.length)}</span><div><button type="button" class="gpiw-button quiet" data-gpi-action="previous-page" ${S.page <= 0 ? "disabled" : ""}>${esc(tr("previous"))}</button><button type="button" class="gpiw-button quiet" data-gpi-action="next-page" ${S.page >= pageCount - 1 ? "disabled" : ""}>${esc(tr("next"))}</button></div></footer>
    </article></section>`;
  }

  function methodologyMarkup() {
    const report = sourceUrl("report_url");
    const source = sourceUrl("source_url") || sourceUrl("methodology_url");
    const release = S.data.release || {};
    return `<section class="gpiw-methodology" id="gpi-methodology">
      ${sectionHeading(tr("methodology"), tr("methodologyTitle"), tr("methodologyText"))}
      <div class="gpiw-method-cards"><article><span>01 · ${esc(tr("official"))}</span><h3>${esc(tr("officialNotRecomputed"))}</h3><p>${esc(tr("officialNotRecomputedText"))}</p></article><article><span>02 · 60 / 40</span><h3>${esc(tr("internalExternal"))}</h3><p>${esc(tr("internalExternalText"))}</p></article><article><span>03 · SHA-256</span><h3>${esc(tr("provenanceByDesign"))}</h3><p>${esc(tr("provenanceByDesignText"))}</p></article></div>
      <div class="gpiw-method-grid"><article class="gpiw-panel"><header class="gpiw-panel-head"><div><span>${esc(tr("indicatorComposition"))}</span><h3>23 ${esc(tr("indicators"))} · 3 ${esc(tr("domains"))}</h3></div><p>${esc(tr("datasetNote"))}</p></header><div class="gpiw-domain-methods">${domainRows().map((domain, index) => `<div><b>0${index + 1}</b><span><strong>${esc(domain.label)}</strong><small>${domain.count === 11 ? esc(tr("elevenIndicators")) : esc(tr("sixIndicators"))}</small></span></div>`).join("")}</div></article><article class="gpiw-panel"><header class="gpiw-panel-head"><div><span>${esc(tr("sourceDetails"))}</span><h3>${esc(release.publisher || "Institute for Economics & Peace")}</h3></div><p>${esc(tr("dataStatus"))}: ${esc(S.data.data_mode === "backend" ? tr("backend") : tr("staticSnapshot"))}</p></header><dl class="gpiw-source-list"><div><dt>${esc(tr("published"))}</dt><dd>${esc(release.published_at || "2026-06-05")}</dd></div><div><dt>${esc(tr("retrieved"))}</dt><dd>${esc(release.retrieved_at || "—")}</dd></div><div><dt>${esc(tr("snapshotHash"))}</dt><dd><code>${esc(release.raw_snapshot_sha256 || "—")}</code></dd></div><div><dt>${esc(tr("transform"))}</dt><dd><code>${esc(release.transform_id || release.metadata?.extraction?.transform_id || "—")}</code></dd></div></dl><div class="gpiw-source-actions">${source ? `<a class="gpiw-button" href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(tr("source"))} ↗</a>` : ""}${report ? `<a class="gpiw-button primary" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("officialReport"))} ↗</a>` : ""}</div></article></div>
    </section>`;
  }

  function dialogMarkup() {
    return `<dialog class="gpiw-dialog" id="gpiEvidenceDialog" aria-labelledby="gpiEvidenceTitle"><div class="gpiw-dialog-shell"><header><div><span>PROVENANCE</span><h2 id="gpiEvidenceTitle">${esc(tr("evidence"))}</h2></div><button type="button" data-gpi-action="close-dialog" aria-label="${esc(tr("close"))}">×</button></header><div class="gpiw-dialog-content"></div></div></dialog><div class="gpiw-toast" role="status" aria-live="polite" hidden></div>`;
  }

  function workspaceMarkup(selected, summary) {
    return `<div class="gpiw" data-gpi-data-mode="${esc(S.data.data_mode)}">${heroMarkup(selected)}${findingsMarkup(selected, summary)}<section class="gpiw-overview">${sectionHeading(tr("analyticalOverview"), tr("overviewTitle"), tr("overviewText"))}<div class="gpiw-analysis-grid">${mapMarkup(selected)}${domainProfileMarkup(selected, summary)}</div>${histogramMarkup(selected)}</section>${comparisonMarkup(selected)}${rankingMarkup(selected)}${methodologyMarkup()}${dialogMarkup()}</div>`;
  }

  function evidenceMarkup(row) {
    const release = S.data.release || {};
    const metadata = release.metadata || {};
    const report = sourceUrl("report_url");
    const domainsPages = row.source_domains_pdf_pages || (metadata.extraction?.domain_pages ? "114, 115, 116" : "—");
    const item = (label, value, copyable = false) => value ? `<div><dt>${esc(label)}</dt><dd>${copyable ? `<code>${esc(value)}</code><button type="button" data-gpi-action="copy" data-copy="${esc(value)}">${esc(tr("copy"))}</button>` : esc(value)}</dd></div>` : "";
    return `<section class="gpiw-evidence-country"><div class="gpiw-country-name">${flag(row, "gpiw-dialog-flag")}<div><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)} · #${intFmt(row.rank)} · ${fmt(row.score)}</small></div></div><span class="gpiw-evidence-status">${esc(tr("officialValue"))}</span></section><section><h3>${esc(tr("rawValues"))}</h3><div class="gpiw-evidence-values"><div><span>GPI</span><b>${fmt(row.score)}</b></div><div><span>${esc(tr("conflict"))}</span><b>${fmt(row.ongoing_conflict_score)}</b></div><div><span>${esc(tr("safety"))}</span><b>${fmt(row.societal_safety_security_score)}</b></div><div><span>${esc(tr("militarisation"))}</span><b>${fmt(row.militarisation_score)}</b></div></div></section><section><h3>${esc(tr("sourceDetails"))}</h3><dl class="gpiw-evidence-list">${item(tr("publisher"), release.publisher || "Institute for Economics & Peace")}${item(tr("published"), release.published_at)}${item(tr("retrieved"), release.retrieved_at)}${item(tr("reportPages"), `${row.source_overall_pdf_page || "12–13"}; ${domainsPages}`)}${item(tr("snapshotHash"), release.raw_snapshot_sha256 || metadata.normalized_snapshot?.sha256, true)}${item(tr("reportHash"), release.source_report_sha256 || metadata.source_report?.sha256, true)}${item(tr("rowHash"), row.row_sha256, true)}${item(tr("transform"), release.transform_id || metadata.extraction?.transform_id)}${item(tr("formulaVersion"), release.formula_version || metadata.extraction?.formula_version)}${item(tr("quality"), row.quality_flag)}</dl>${report ? `<a class="gpiw-button primary" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("openReport"))} ↗</a>` : ""}</section>`;
  }

  function showEvidence(iso3, trigger) {
    const row = rowByIso(iso3);
    const dialog = S.context.root.querySelector("#gpiEvidenceDialog");
    if (!row || !dialog) return;
    dialog.querySelector(".gpiw-dialog-content").innerHTML = evidenceMarkup(row);
    dialog.__returnFocus = trigger || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    dialog.querySelector("[data-gpi-action='close-dialog']")?.focus();
  }
  function closeDialog() {
    const dialog = S.context.root.querySelector("#gpiEvidenceDialog");
    if (!dialog) return;
    const target = dialog.__returnFocus;
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    if (target?.focus && target.isConnected) target.focus();
  }
  function toast(message) {
    const node = S.context.root.querySelector(".gpiw-toast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(node.__timer);
    node.__timer = window.setTimeout(() => { node.hidden = true; }, 2200);
  }

  function selectCountry(iso3) {
    const row = rowByIso(iso3);
    if (!row) return;
    S.selectedIso = row.iso3;
    if (!S.compare.includes(row.iso3)) S.compare = [row.iso3, ...S.compare].slice(0, 5);
    if (typeof S.context?.setCountry === "function") S.context.setCountry(row.iso3);
    else { S.context.country = row.iso3; paint(); }
  }

  function showTooltip(path, event) {
    const tooltip = S.context.root.querySelector(".gpiw-tooltip");
    const row = rowByIso(path.dataset.iso);
    if (!tooltip || !row) return;
    window.clearTimeout(S.tooltipTimer);
    tooltip.innerHTML = `<strong>${esc(countryName(row))}</strong><span>#${intFmt(row.rank)} · ${fmt(row[metricField(S.metric)])}</span>`;
    const wrap = tooltip.closest(".gpiw-map-wrap");
    const rect = wrap.getBoundingClientRect();
    const clientX = event?.clientX || rect.left + rect.width / 2;
    const clientY = event?.clientY || rect.top + rect.height / 2;
    tooltip.style.left = `${clamp(clientX - rect.left + 14, 8, rect.width - 190)}px`;
    tooltip.style.top = `${clamp(clientY - rect.top + 14, 8, rect.height - 74)}px`;
    tooltip.hidden = false;
  }
  function hideTooltip(delay = 80) {
    const tooltip = S.context.root.querySelector(".gpiw-tooltip");
    if (!tooltip) return;
    window.clearTimeout(S.tooltipTimer);
    S.tooltipTimer = window.setTimeout(() => { tooltip.hidden = true; }, delay);
  }
  function focusMapNeighbour(current, delta) {
    const paths = Array.from(S.context.root.querySelectorAll(".gpiw-map-country[data-gpi-action='map-country']"));
    if (!paths.length) return;
    const index = Math.max(0, paths.indexOf(current));
    const target = paths[(index + delta + paths.length) % paths.length];
    paths.forEach((path) => path.setAttribute("tabindex", path === target ? "0" : "-1"));
    target.focus();
    showTooltip(target);
  }

  function exportStaticCsv() {
    const columns = ["release_year", "source_order", "iso3", "country_name", "rank", "tied_rank", "score", "rank_change", "rank_change_direction", "ongoing_conflict_score", "societal_safety_security_score", "militarisation_score", "quality_flag", "row_sha256"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [columns.join(","), ...S.data.rows.map((row) => columns.map((column) => quote(row[column])).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gpi_${S.data.release?.release_year || RELEASE_FALLBACK}_country_scores.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function rerenderAt(anchorId = "") {
    const y = window.scrollY;
    paint();
    if (anchorId) S.context.root.querySelector(`#${CSS.escape(anchorId)}`)?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: y, behavior: "auto" });
  }

  function bind() {
    const root = S.context.root;
    root.querySelectorAll("[data-gpi-action]").forEach((control) => {
      control.addEventListener("click", async (event) => {
        const action = control.dataset.gpiAction;
        if (action === "retry") return render(S.context, { force: true });
        if (action === "jump") return root.querySelector(`#${CSS.escape(control.dataset.target || "")}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (action === "metric") { S.metric = control.dataset.metric || "score"; return rerenderAt("gpiw-title"); }
        if (action === "map-country" || action === "country") return selectCountry(control.dataset.iso);
        if (action === "evidence") return showEvidence(control.dataset.iso, control);
        if (action === "close-dialog") return closeDialog();
        if (action === "copy") {
          try { await navigator.clipboard.writeText(control.dataset.copy || ""); toast(tr("copied")); }
          catch (_) { toast(control.dataset.copy || ""); }
          return;
        }
        if (action === "add-compare") {
          const iso3 = root.querySelector("#gpiCompareSelect")?.value;
          if (iso3 && !S.compare.includes(iso3) && S.compare.length < 5) S.compare.push(iso3);
          return rerenderAt("gpi-comparison");
        }
        if (action === "remove-compare") { if (S.compare.length > 2) S.compare = S.compare.filter((iso3) => iso3 !== control.dataset.iso); return rerenderAt("gpi-comparison"); }
        if (action === "reset-compare") { resetComparison(rowByIso(S.selectedIso)); return rerenderAt("gpi-comparison"); }
        if (action === "previous-page") { S.page = Math.max(0, S.page - 1); return rerenderAt("gpi-ranking"); }
        if (action === "next-page") { S.page += 1; return rerenderAt("gpi-ranking"); }
        if (action === "export-static") return exportStaticCsv();
      });
    });

    const search = root.querySelector("#gpiRankingSearch");
    if (search) {
      let timer;
      search.addEventListener("input", () => { window.clearTimeout(timer); timer = window.setTimeout(() => { S.query = search.value; S.page = 0; rerenderAt("gpi-ranking"); }, 180); });
    }
    const sort = root.querySelector("#gpiRankingSort");
    if (sort) sort.addEventListener("change", () => { S.sort = sort.value; S.page = 0; rerenderAt("gpi-ranking"); });
    const direction = root.querySelector("#gpiRankingDirection");
    if (direction) direction.addEventListener("change", () => { S.direction = direction.value; S.page = 0; rerenderAt("gpi-ranking"); });
    const pageSize = root.querySelector("#gpiRankingPageSize");
    if (pageSize) pageSize.addEventListener("change", () => { S.pageSize = Number(pageSize.value) || 25; S.page = 0; rerenderAt("gpi-ranking"); });

    root.querySelectorAll(".gpiw-map-country[data-gpi-action='map-country']").forEach((path) => {
      path.addEventListener("pointerenter", (event) => showTooltip(path, event));
      path.addEventListener("pointermove", (event) => showTooltip(path, event));
      path.addEventListener("pointerleave", () => hideTooltip());
      path.addEventListener("focus", () => showTooltip(path));
      path.addEventListener("blur", () => hideTooltip());
      path.addEventListener("keydown", (event) => {
        if (["Enter", " "].includes(event.key)) { event.preventDefault(); selectCountry(path.dataset.iso); }
        else if (["ArrowRight", "ArrowDown"].includes(event.key)) { event.preventDefault(); focusMapNeighbour(path, 1); }
        else if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); focusMapNeighbour(path, -1); }
        else if (event.key === "Escape") hideTooltip(0);
      });
    });
    const tooltip = root.querySelector(".gpiw-tooltip");
    if (tooltip) { tooltip.addEventListener("pointerenter", () => window.clearTimeout(S.tooltipTimer)); tooltip.addEventListener("pointerleave", () => hideTooltip()); }
    const dialog = root.querySelector("#gpiEvidenceDialog");
    if (dialog) {
      dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); });
      dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
    }
  }

  function paint() {
    if (!S.context?.root || !S.data?.rows?.length) return;
    const selected = ensureSelection(S.data.rows);
    const summary = computeSummary(S.data.rows);
    S.context.root.innerHTML = workspaceMarkup(selected, summary);
    bind();
    document.documentElement.dataset.gpiReady = "true";
    window.dispatchEvent(new CustomEvent("gir:gpi-ready", { detail: { iso3: selected.iso3, releaseYear: S.data.release?.release_year, dataMode: S.data.data_mode } }));
  }

  async function render(context, options = {}) {
    if (!context?.root) throw new Error("GPI workspace requires a root element");
    if (!context.country) return;
    S.context = context;
    const year = Number(context.year || RELEASE_FALLBACK);
    const key = `${year}:${context.lang || "ru"}`;
    const token = ++S.renderToken;
    context.root.innerHTML = loadingMarkup();
    document.documentElement.dataset.gpiReady = "false";
    try {
      if (!S.data || S.loadKey !== key || options.force) {
        const [data, geo] = await Promise.all([loadData(year), loadGeo()]);
        if (token !== S.renderToken) return;
        data.rows = normalizeRows(data);
        if (!data.rows.length) throw new Error("The GPI release contains no country rows");
        S.data = data;
        S.geo = geo;
        S.loadKey = key;
      }
      paint();
    } catch (error) {
      console.error("GPI workspace failed", error);
      if (token !== S.renderToken) return;
      context.root.innerHTML = errorMarkup(error);
      context.root.querySelector("[data-gpi-action='retry']")?.addEventListener("click", () => render(context, { force: true }));
      document.documentElement.dataset.gpiReady = "error";
    }
  }

  function invalidate() {
    S.data = null;
    S.loadKey = "";
  }

  const publicApi = Object.freeze({ render, invalidate, version: "2.0.0-stage02" });
  window.GIRGPI = publicApi;
  window.GIRGPIWorkspace = publicApi;
})();
