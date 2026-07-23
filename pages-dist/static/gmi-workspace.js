/* GIR — Global Militarisation Index analytical workspace, cumulative stage 04.
 * Dependency-free, bilingual and evidence-first. Published GMI values are
 * never recomputed; percentiles and relative profiles are explicitly derived.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)gmi-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const API_BASE = "/api/security-connectivity/gmi";
  const DATA_YEAR_FALLBACK = 2022;
  const EDITION_YEAR_FALLBACK = 2023;
  const METRICS = {
    score: { field: "score", digits: 0 },
    expenditure: { field: "military_expenditure_index", digits: 2 },
    personnel: { field: "military_personnel_index", digits: 2 },
    heavy_weapons: { field: "heavy_weapons_index", digits: 2 },
  };
  const COMPONENTS = ["expenditure", "personnel", "heavy_weapons"];

  const COPY = {
    ru: {
      module: "Безопасность и международная связанность",
      title: "Глобальный индекс милитаризации",
      acronym: "GMI",
      lead: "Доказательное пространство для анализа относительного веса военного аппарата в обществе — без смешения выпусков, скрытого пересчёта и искусственных трендов.",
      latestReport: "Новейший отчёт",
      activeNumbers: "Активный числовой слой",
      edition: "Издание",
      rankingYear: "рейтинговый год",
      reportCountries: "стран в отчёте",
      numericCountries: "стран в таблице",
      releaseGuardTitle: "Выпуски разделены",
      releaseGuardText: "GMI 2025 зарегистрирован как новейший отчёт. Числа в этой вкладке относятся только к GMI 2023 / данным 2022 года.",
      secondaryLayer: "проверенный вторичный снимок",
      officialCreator: "методология и индекс BICC",
      higherMore: "выше — более милитаризировано",
      noTrend: "тренд не рассчитывается",
      score: "Баллы GMI",
      rank: "Место",
      position: "Позиция милитаризации",
      derivedScale: "производная позиционная шкала GIR",
      selectedCountry: "Выбранная страна",
      worldMedian: "Медиана мира",
      dominantComponent: "Ведущая относительная компонента",
      publishedValue: "опубликованное значение BICC",
      sourceCaveat: "числовая строка из зафиксированного вторичного источника",
      methodology: "Методология",
      officialReport: "Отчёт BICC",
      rankingTable: "Таблица BICC",
      mapKicker: "Глобальная география",
      mapTitle: "Карта относительной милитаризации",
      mapText: "Цвет показывает выбранную метрику среди 149 стран. Выберите страну мышью или клавиатурой; точное значение всегда доступно в подписи.",
      metric: "Метрика",
      overall: "Общий GMI",
      expenditure: "Военные расходы",
      personnel: "Военный персонал",
      heavyWeapons: "Тяжёлые вооружения",
      lessMilitarised: "Ниже",
      moreMilitarised: "Выше",
      noData: "Нет данных",
      textMap: "Текстовая альтернатива карте",
      country: "Страна",
      value: "Значение",
      signatureKicker: "Структура давления",
      signatureTitle: "Относительный профиль страны",
      signatureText: "Три опубликованные компоненты сопоставлены с распределением мира. Процентили служат только для сравнения; исходные значения сохранены рядом.",
      countryPercentile: "Процентиль страны",
      median: "Медиана",
      p90: "Порог верхних 10%",
      relativeIntensity: "Относительная интенсивность",
      exactValue: "Точное значение",
      strongest: "Наиболее выражено относительно мира",
      balanced: "Компоненты близки по относительной позиции",
      architectureKicker: "Архитектура индекса",
      architectureTitle: "Шесть показателей, три подиндекса",
      architectureText: "GMI объединяет нормализованные показатели с весами BICC. GIR показывает архитектуру, но не воспроизводит составной расчёт и скрытую точность.",
      weight: "вес",
      expGdp: "Военные расходы / ВВП",
      expHealth: "Военные расходы / расходы на здравоохранение",
      personnelPopulation: "Военные и парамилитарные силы / население",
      reservistsPopulation: "Резервисты / население",
      personnelDoctors: "Военный персонал / врачи",
      weaponsPopulation: "Тяжёлые вооружения / население",
      distributionKicker: "Распределение",
      distributionTitle: "Где находится страна на мировой шкале",
      distributionText: "Гистограмма использует опубликованные целые баллы GMI. Маркер отмечает выбранную страну; место остаётся авторитетнее совпадающего округлённого балла.",
      scoreBand: "Диапазон баллов",
      countries: "Страны",
      equalScoreGuard: "Одинаковые целые баллы не создают ничью: GIR сохраняет опубликованные последовательные места.",
      comparisonKicker: "Сравнительная лаборатория",
      comparisonTitle: "Сопоставление профилей милитаризации",
      comparisonText: "Радар использует производные процентили 0–100 для общего места и трёх компонент. Таблица ниже содержит только исходные опубликованные значения.",
      addCountry: "Добавить страну",
      add: "Добавить",
      reset: "Сбросить",
      remove: "Удалить",
      derivedRadar: "Производные процентили",
      exactTable: "Таблица точных значений",
      rankingKicker: "Полный набор данных",
      rankingTitle: "Рейтинг 149 стран",
      rankingText: "Поиск, сортировка, экспорт и доказательная карточка для каждой опубликованной строки рейтингового года 2022.",
      search: "Поиск страны или ISO3",
      sortBy: "Сортировать",
      direction: "Направление",
      ascending: "по возрастанию",
      descending: "по убыванию",
      rowsPerPage: "Строк",
      previous: "Назад",
      next: "Вперёд",
      page: "Страница",
      of: "из",
      evidence: "Доказательная запись",
      exportCsv: "Экспорт CSV",
      zeroResults: "Страны по запросу не найдены.",
      sourceMode: "Режим данных",
      backend: "FastAPI + SQLite",
      staticSnapshot: "проверенный статический снимок",
      dataYear: "Год данных",
      reportEdition: "Издание отчёта",
      publisher: "Издатель",
      published: "Опубликовано",
      retrieved: "Получено",
      sourceRevision: "Зафиксированная редакция",
      sourceSnapshot: "Исходный снимок",
      normalizedSnapshot: "Нормализованный снимок",
      rowHash: "SHA-256 строки",
      transform: "Transform ID",
      formula: "Версия формулы",
      quality: "Статус качества",
      license: "Лицензия снимка",
      attribution: "Атрибуция",
      copy: "Копировать",
      copied: "Скопировано",
      close: "Закрыть",
      openSource: "Открыть источник",
      openReport: "Открыть отчёт",
      rowValues: "Опубликованная строка",
      integrity: "Целостность и происхождение",
      methodologyKicker: "Как читать GMI",
      methodologyTitle: "Интерпретация без ложной точности",
      methodologyText: "GMI измеряет относительную значимость военного аппарата по отношению к обществу. Он не является прямой оценкой боеспособности, количества вооружений или вероятности конфликта.",
      noRecomputeTitle: "Без пересчёта композита",
      noRecomputeText: "GIR сохраняет опубликованные балл, место и три компоненты. Исходные шесть показателей и скрытая точность не реконструируются.",
      releaseSeparationTitle: "Отчёт и числовой слой раздельны",
      releaseSeparationText: "Каталог выпусков может быть новее доступной воспроизводимой таблицы. Интерфейс никогда не переименовывает данные 2022 года в GMI 2025.",
      provenanceTitle: "Provenance на уровне строки",
      provenanceText: "Для каждой страны доступны ревизия источника, два SHA-256 снимка, transform ID, версия формулы и отдельный хеш строки.",
      catalogTitle: "Каталог выпусков",
      numericAvailable: "числа доступны",
      metadataOnly: "только метаданные",
      latest: "новейший",
      active: "активный",
      loading: "Загрузка пространства GMI",
      loadingText: "Проверяются числовой снимок, каталог выпусков, география и доказательные метаданные.",
      loadError: "Не удалось открыть пространство GMI",
      retry: "Повторить",
      mapUnavailable: "Географический слой недоступен. Рейтинг и все числовые представления продолжают работать.",
      keyboardMap: "На карте используйте стрелки для перемещения, Enter или пробел для выбора и Escape для закрытия подсказки.",
      percentileHelp: "100 соответствует первому месту по милитаризации, 0 — последнему среди стран активного выпуска. Это не официальный балл BICC.",
      componentHelp: "Компонентный процентиль рассчитывается GIR внутри активной таблицы и не является отдельным показателем BICC.",
      selected: "выбранная",
      leader: "лидер рейтинга",
      medianCountry: "страна около медианы",
      peer: "сосед по рейтингу",
      rankPublished: "опубликованное место",
      scoreTiePossible: "тот же отображаемый балл встречается у нескольких стран",
      noSyntheticTrend: "Историческая динамика не показана: активный снимок содержит только один рейтинговый год.",
      frontendVersion: "Интерфейс stage 04",
    },
    en: {
      module: "Security & international connectivity",
      title: "Global Militarisation Index",
      acronym: "GMI",
      lead: "An evidence-first workspace for analysing the relative weight of the military apparatus in society — without release blending, hidden recomputation or invented trends.",
      latestReport: "Latest report",
      activeNumbers: "Active numeric layer",
      edition: "Edition",
      rankingYear: "ranking year",
      reportCountries: "countries in report",
      numericCountries: "countries in table",
      releaseGuardTitle: "Releases kept separate",
      releaseGuardText: "GMI 2025 is catalogued as the latest report. Every number in this workspace belongs only to GMI 2023 / ranking year 2022.",
      secondaryLayer: "verified secondary snapshot",
      officialCreator: "BICC index and methodology",
      higherMore: "higher means more militarised",
      noTrend: "trend is not calculated",
      score: "GMI score",
      rank: "Rank",
      position: "Militarisation position",
      derivedScale: "derived GIR positional scale",
      selectedCountry: "Selected country",
      worldMedian: "World median",
      dominantComponent: "Leading relative component",
      publishedValue: "published BICC value",
      sourceCaveat: "numeric row from a locked secondary source",
      methodology: "Methodology",
      officialReport: "BICC report",
      rankingTable: "BICC ranking table",
      mapKicker: "Global geography",
      mapTitle: "Map of relative militarisation",
      mapText: "Colour represents the selected metric across 149 countries. Choose a country by pointer or keyboard; the exact value remains available in text.",
      metric: "Metric",
      overall: "Overall GMI",
      expenditure: "Military expenditure",
      personnel: "Military personnel",
      heavyWeapons: "Heavy weapons",
      lessMilitarised: "Lower",
      moreMilitarised: "Higher",
      noData: "No data",
      textMap: "Text alternative to the map",
      country: "Country",
      value: "Value",
      signatureKicker: "Pressure structure",
      signatureTitle: "Country relative profile",
      signatureText: "The three published components are compared with the world distribution. Percentiles are comparison aids only; exact values remain alongside them.",
      countryPercentile: "Country percentile",
      median: "Median",
      p90: "Top-decile threshold",
      relativeIntensity: "Relative intensity",
      exactValue: "Exact value",
      strongest: "Most pronounced relative to the world",
      balanced: "Components occupy similar relative positions",
      architectureKicker: "Index architecture",
      architectureTitle: "Six indicators, three sub-indices",
      architectureText: "GMI combines normalised indicators using BICC weights. GIR displays the architecture but does not reproduce the composite or invent hidden precision.",
      weight: "weight",
      expGdp: "Military expenditure / GDP",
      expHealth: "Military expenditure / health spending",
      personnelPopulation: "Military and paramilitary personnel / population",
      reservistsPopulation: "Reservists / population",
      personnelDoctors: "Military personnel / physicians",
      weaponsPopulation: "Heavy weapons / population",
      distributionKicker: "Distribution",
      distributionTitle: "Where the country sits on the world scale",
      distributionText: "The histogram uses published integer GMI scores. The marker identifies the selected country; published rank remains authoritative when rounded scores coincide.",
      scoreBand: "Score band",
      countries: "Countries",
      equalScoreGuard: "Equal integer scores do not create a tie: GIR preserves the published sequential ranks.",
      comparisonKicker: "Comparison lab",
      comparisonTitle: "Compare militarisation profiles",
      comparisonText: "The radar uses derived 0–100 percentiles for overall position and three components. The table below retains only exact published values.",
      addCountry: "Add country",
      add: "Add",
      reset: "Reset",
      remove: "Remove",
      derivedRadar: "Derived percentiles",
      exactTable: "Exact-value table",
      rankingKicker: "Complete dataset",
      rankingTitle: "Ranking of 149 countries",
      rankingText: "Search, sorting, export and an evidence record for every published row of ranking year 2022.",
      search: "Search country or ISO3",
      sortBy: "Sort by",
      direction: "Direction",
      ascending: "ascending",
      descending: "descending",
      rowsPerPage: "Rows",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      evidence: "Evidence record",
      exportCsv: "Export CSV",
      zeroResults: "No countries match this query.",
      sourceMode: "Data mode",
      backend: "FastAPI + SQLite",
      staticSnapshot: "verified static snapshot",
      dataYear: "Data year",
      reportEdition: "Report edition",
      publisher: "Publisher",
      published: "Published",
      retrieved: "Retrieved",
      sourceRevision: "Locked revision",
      sourceSnapshot: "Source snapshot",
      normalizedSnapshot: "Normalised snapshot",
      rowHash: "Row SHA-256",
      transform: "Transform ID",
      formula: "Formula version",
      quality: "Quality status",
      license: "Snapshot licence",
      attribution: "Attribution",
      copy: "Copy",
      copied: "Copied",
      close: "Close",
      openSource: "Open source",
      openReport: "Open report",
      rowValues: "Published row",
      integrity: "Integrity and lineage",
      methodologyKicker: "How to read GMI",
      methodologyTitle: "Interpretation without false precision",
      methodologyText: "GMI measures the relative importance of the military apparatus in relation to society. It is not a direct measure of combat power, weapons stocks or conflict probability.",
      noRecomputeTitle: "No composite recomputation",
      noRecomputeText: "GIR preserves the published score, rank and three components. The six inputs and hidden precision are not reconstructed.",
      releaseSeparationTitle: "Report and numbers are separate",
      releaseSeparationText: "The report catalogue can be newer than the reproducible table. The interface never relabels 2022 data as GMI 2025.",
      provenanceTitle: "Row-level provenance",
      provenanceText: "Every country exposes the source revision, two snapshot SHA-256 values, transform ID, formula version and a dedicated row hash.",
      catalogTitle: "Report catalogue",
      numericAvailable: "numbers available",
      metadataOnly: "metadata only",
      latest: "latest",
      active: "active",
      loading: "Loading the GMI workspace",
      loadingText: "Checking the numeric snapshot, report catalogue, geography and evidence metadata.",
      loadError: "The GMI workspace could not be opened",
      retry: "Retry",
      mapUnavailable: "The geographic layer is unavailable. Rankings and all numeric views remain functional.",
      keyboardMap: "On the map, use arrow keys to move, Enter or Space to select, and Escape to dismiss the tooltip.",
      percentileHelp: "100 corresponds to first place in militarisation and 0 to last place within the active release. It is not a BICC score.",
      componentHelp: "Component percentiles are calculated by GIR within the active table and are not separate BICC indicators.",
      selected: "selected",
      leader: "ranking leader",
      medianCountry: "country near median",
      peer: "ranking neighbour",
      rankPublished: "published rank",
      scoreTiePossible: "the same displayed score occurs for multiple countries",
      noSyntheticTrend: "No historical trend is shown: the active snapshot contains one ranking year only.",
      frontendVersion: "Stage 04 interface",
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
    if (typeof S.context?.escapeHtml === "function") return S.context.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
  function intFmt(value) {
    return value == null || !Number.isFinite(Number(value)) ? "—" : Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 0 });
  }
  function fmt(value, digits = 2) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function shortHash(value) { return value ? `${String(value).slice(0, 12)}…${String(value).slice(-8)}` : "—"; }
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
    const response = await fetch(url, { cache: "no-store", signal: timeoutSignal(9000), ...options });
    if (!response.ok) throw new Error(`${url} · HTTP ${response.status}`);
    return response.json();
  }
  function metricField(key) { return METRICS[key]?.field || "score"; }
  function metricDigits(key) { return METRICS[key]?.digits ?? 2; }
  function metricLabel(key) {
    return ({ score: tr("overall"), expenditure: tr("expenditure"), personnel: tr("personnel"), heavy_weapons: tr("heavyWeapons") })[key] || key;
  }
  function componentRows() {
    return [
      { key: "expenditure", field: "military_expenditure_index", label: tr("expenditure") },
      { key: "personnel", field: "military_personnel_index", label: tr("personnel") },
      { key: "heavy_weapons", field: "heavy_weapons_index", label: tr("heavyWeapons") },
    ];
  }

  function normalizeBackend(overview, ranking, methodology, reports, requestedYear) {
    const release = overview.active_numeric_release || {};
    return {
      schema_version: 1,
      frontend_bundle_version: "api-live",
      index: overview.index || {},
      active_numeric_release: release,
      latest_report: overview.latest_report || reports?.reports?.find((item) => item.is_latest_report) || null,
      reports: reports?.reports || [],
      coverage: overview.coverage || {},
      components: overview.components || methodology?.components || [],
      methodology: methodology || {},
      interpretation: methodology?.interpretation || {},
      release_guard: overview.release_guard || {},
      rank_guard: overview.rank_guard || {},
      rows: ranking.rows || [],
      data_mode: "backend",
      requested_year: requestedYear,
      fallback_year: Number(ranking.data_year) !== Number(requestedYear),
    };
  }
  async function loadBackend(requestedYear) {
    const query = requestedYear ? `?year=${encodeURIComponent(requestedYear)}` : "";
    try {
      const [overview, ranking, methodology, reports] = await Promise.all([
        fetchJson(requestUrl(query)),
        fetchJson(requestUrl(`/ranking${query ? `${query}&` : "?"}limit=500&offset=0&sort=rank&direction=asc&include_provenance=true`)),
        fetchJson(requestUrl(`/methodology${query}`)),
        fetchJson(requestUrl("/reports")),
      ]);
      return normalizeBackend(overview, ranking, methodology, reports, requestedYear);
    } catch (firstError) {
      if (!requestedYear) throw firstError;
      const [overview, ranking, methodology, reports] = await Promise.all([
        fetchJson(requestUrl()),
        fetchJson(requestUrl("/ranking?limit=500&offset=0&sort=rank&direction=asc&include_provenance=true")),
        fetchJson(requestUrl("/methodology")),
        fetchJson(requestUrl("/reports")),
      ]);
      return normalizeBackend(overview, ranking, methodology, reports, requestedYear);
    }
  }
  async function loadStatic(requestedYear) {
    const years = [requestedYear, DATA_YEAR_FALLBACK].filter((value, index, list) => value && list.indexOf(value) === index);
    let lastError;
    for (const year of years) {
      try {
        const payload = await fetchJson(assetUrl(`gmi/gmi_${year}.json`));
        payload.data_mode = "static";
        payload.requested_year = requestedYear;
        payload.fallback_year = Number(payload.active_numeric_release?.data_year) !== Number(requestedYear);
        return payload;
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error("No GMI static snapshot available");
  }
  async function loadData(requestedYear) {
    try { return await loadBackend(requestedYear); }
    catch (_) { return loadStatic(requestedYear); }
  }
  async function loadGeo() {
    if (S.geo) return S.geo;
    const candidates = ["world_countries_lite.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
    let lastError;
    for (const candidate of candidates) {
      try {
        S.geo = await fetchJson(candidate.startsWith("/") ? candidate : assetUrl(candidate));
        return S.geo;
      } catch (error) { lastError = error; }
    }
    console.warn("GMI map layer unavailable", lastError);
    return null;
  }

  function normalizeRows(data) {
    const release = data.active_numeric_release || {};
    return (Array.isArray(data.rows) ? data.rows : []).map((raw, index) => ({
      ...raw,
      data_year: Number(raw.data_year || release.data_year || DATA_YEAR_FALLBACK),
      edition_year: Number(raw.edition_year || release.edition_year || EDITION_YEAR_FALLBACK),
      source_order: Number(raw.source_order || index + 1),
      iso3: String(raw.iso3 || "").toUpperCase(),
      country_name: String(raw.country_name || raw.name_en || raw.iso3 || ""),
      source_country_name: String(raw.source_country_name || raw.country_name || ""),
      rank: Number(raw.rank),
      tied_rank: Boolean(raw.tied_rank),
      score: Number(raw.score),
      military_expenditure_index: Number(raw.military_expenditure_index),
      military_personnel_index: Number(raw.military_personnel_index),
      heavy_weapons_index: Number(raw.heavy_weapons_index),
      displayed_score_tie_possible: Boolean(raw.displayed_score_tie_possible),
      rank_is_published: raw.rank_is_published !== false,
      value_id: raw.value_id || `GMI:${raw.data_year || release.data_year || DATA_YEAR_FALLBACK}:${String(raw.iso3 || "").toUpperCase()}`,
    })).filter((row) => row.iso3 && Number.isFinite(row.rank) && Number.isFinite(row.score));
  }
  function platformCountry(iso3) {
    return (S.context?.platformContext?.countries || []).find((country) => String(country.iso3).toUpperCase() === String(iso3).toUpperCase()) || null;
  }
  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const row = typeof rowOrIso === "object" ? rowOrIso : S.data?.rows?.find((item) => item.iso3 === iso3);
    const country = platformCountry(iso3);
    if (country) return S.context?.lang === "en" ? (country.name_en || country.name_ru || row?.country_name || iso3) : (country.name_ru || country.name_en || row?.country_name || iso3);
    return row?.country_name || iso3 || "—";
  }
  function flag(row, className = "gmiw-flag") {
    const country = platformCountry(row.iso3) || { iso3: row.iso3, name_ru: countryName(row), name_en: countryName(row) };
    if (typeof S.context?.flagImage === "function") return S.context.flagImage(country, className);
    return `<span class="${className} gmiw-flag-fallback" aria-hidden="true">${esc(row.iso3)}</span>`;
  }
  function rowByIso(iso3) { return S.data?.rows?.find((row) => row.iso3 === String(iso3 || "").toUpperCase()) || null; }

  function computeSummary(rows) {
    const result = {};
    ["score", "military_expenditure_index", "military_personnel_index", "heavy_weapons_index"].forEach((field) => {
      const values = rows.map((row) => Number(row[field])).filter(Number.isFinite).sort((a, b) => a - b);
      const q = (probability) => {
        if (!values.length) return null;
        const pos = (values.length - 1) * probability;
        const lo = Math.floor(pos); const hi = Math.ceil(pos);
        return lo === hi ? values[lo] : values[lo] * (hi - pos) + values[hi] * (pos - lo);
      };
      result[field] = {
        min: values[0], max: values[values.length - 1], median: q(.5), p10: q(.1), p25: q(.25), p75: q(.75), p90: q(.9), values,
      };
    });
    return result;
  }
  function rankPercentile(row, count = S.data?.rows?.length || 1) {
    return count <= 1 ? 100 : clamp(((count - Number(row.rank)) / (count - 1)) * 100, 0, 100);
  }
  function componentPercentile(row, field, summary) {
    const values = summary[field]?.values || [];
    const value = Number(row[field]);
    if (!values.length || !Number.isFinite(value)) return 0;
    let less = 0; let equal = 0;
    for (const item of values) { if (item < value) less += 1; else if (item === value) equal += 1; }
    return clamp(((less + Math.max(0, equal - 1) / 2) / Math.max(1, values.length - 1)) * 100, 0, 100);
  }
  function relativeProfile(row, summary) {
    return componentRows().map((item) => ({ ...item, value: Number(row[item.field]), percentile: componentPercentile(row, item.field, summary) }));
  }
  function dominantComponent(row, summary) {
    const profile = relativeProfile(row, summary).sort((a, b) => b.percentile - a.percentile);
    if (profile.length > 1 && Math.abs(profile[0].percentile - profile[1].percentile) < 4) return { label: tr("balanced"), key: "balanced", percentile: profile[0].percentile };
    return profile[0] || { label: "—", key: "", percentile: 0 };
  }
  function ensureSelection(rows) {
    const requested = String(S.context?.country || "").toUpperCase();
    const selected = rows.find((row) => row.iso3 === requested) || null;
    S.selectedIso = selected?.iso3 || "";
    if (!S.compare.length) resetComparison(selected);
    else if (!S.compare.includes(S.selectedIso)) S.compare = [S.selectedIso, ...S.compare].slice(0, 5);
    S.compare = S.compare.filter((iso3) => rows.some((row) => row.iso3 === iso3)).slice(0, 5);
    return selected;
  }
  function referenceRows(selected) {
    const rows = S.data.rows;
    const leader = rows[0];
    const median = rows[Math.floor(rows.length / 2)];
    const peerIndex = clamp(Number(selected?.source_order || 1), 1, rows.length) - 1;
    const peer = rows[Math.min(rows.length - 1, peerIndex + (peerIndex === 0 ? 1 : -1))];
    return [selected, leader, median, peer].filter(Boolean);
  }
  function resetComparison(selected) {
    S.compare = Array.from(new Set(referenceRows(selected).map((row) => row.iso3))).slice(0, 4);
  }

  function sourceUrl(name) {
    const release = S.data?.active_numeric_release || {};
    const value = release[name] || release.metadata?.[name] || S.data?.methodology?.[name] || "";
    return /^https?:\/\//i.test(value) ? value : "";
  }
  function loadingMarkup() {
    return `<section class="gmiw gmiw-state" aria-live="polite"><div class="gmiw-state-mark" aria-hidden="true">GMI</div><h1>${esc(tr("loading"))}</h1><p>${esc(tr("loadingText"))}</p><div class="gmiw-loader" aria-hidden="true"><i></i><i></i><i></i></div></section>`;
  }
  function errorMarkup(error) {
    return `<section class="gmiw gmiw-state gmiw-error"><div class="gmiw-state-mark" aria-hidden="true">!</div><h1>${esc(tr("loadError"))}</h1><p>${esc(error?.message || String(error))}</p><button type="button" class="gmiw-button primary" data-gmi-action="retry">${esc(tr("retry"))}</button></section>`;
  }

  function releaseRailMarkup() {
    const latest = S.data.latest_report || {};
    const release = S.data.active_numeric_release || {};
    return `<section class="gmiw-release-rail" aria-label="${esc(tr("releaseGuardTitle"))}">
      <article class="gmiw-release-node latest">
        <span>${esc(tr("latestReport"))}</span>
        <strong>GMI ${esc(latest.edition_year || 2025)}</strong>
        <small>${esc(latest.publication_year || 2026)} · ${intFmt(latest.country_count || S.data.coverage?.latest_report_countries)} ${esc(tr("reportCountries"))}</small>
      </article>
      <div class="gmiw-release-connector" aria-hidden="true"><i></i><span>≠</span><i></i></div>
      <article class="gmiw-release-node active">
        <span>${esc(tr("activeNumbers"))}</span>
        <strong>GMI ${esc(release.edition_year || EDITION_YEAR_FALLBACK)}</strong>
        <small>${esc(tr("rankingYear"))} ${esc(release.data_year || DATA_YEAR_FALLBACK)} · ${intFmt(release.country_count || S.data.rows.length)} ${esc(tr("numericCountries"))}</small>
      </article>
      <div class="gmiw-release-message"><strong>${esc(tr("releaseGuardTitle"))}</strong><span>${esc(tr("releaseGuardText"))}</span></div>
    </section>`;
  }

  function miniComponentBars(selected, summary) {
    return relativeProfile(selected, summary).map((item) => `<div class="gmiw-mini-component"><span>${esc(item.label)}</span><i><b style="width:${item.percentile.toFixed(2)}%"></b></i><strong>${fmt(item.value, 2)}</strong></div>`).join("");
  }
  function heroMarkup(selected, summary) {
    const count = S.data.rows.length;
    const release = S.data.active_numeric_release || {};
    const position = rankPercentile(selected, count);
    const dominant = dominantComponent(selected, summary);
    const report = sourceUrl("report_url");
    const ranking = sourceUrl("ranking_url");
    return `<section class="gmiw-hero" aria-labelledby="gmiw-title">
      <div class="gmiw-hero-main">
        <div>
          <span class="gmiw-overline">${esc(tr("module"))} · ${esc(tr("edition"))} ${esc(release.edition_year || EDITION_YEAR_FALLBACK)} · ${esc(tr("rankingYear"))} ${esc(release.data_year || DATA_YEAR_FALLBACK)}</span>
          <h1 id="gmiw-title"><span>${esc(tr("acronym"))}</span>${esc(tr("title"))}</h1>
          <p class="gmiw-lead">${esc(tr("lead"))}</p>
          <div class="gmiw-status-line">
            <span class="verified">${esc(tr("secondaryLayer"))}</span>
            <span>${esc(tr("officialCreator"))}</span>
            <span>${intFmt(count)} ${esc(tr("numericCountries"))}</span>
            <span>6 · 3</span>
            <span>${esc(tr("higherMore"))}</span>
            <span>${esc(tr("noTrend"))}</span>
          </div>
        </div>
        <div class="gmiw-hero-actions">
          <button type="button" class="gmiw-button primary" data-gmi-action="jump" data-target="gmi-methodology">${esc(tr("methodology"))}</button>
          ${report ? `<a class="gmiw-button" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("officialReport"))}<span aria-hidden="true">↗</span></a>` : ""}
          ${ranking ? `<a class="gmiw-button quiet" href="${esc(ranking)}" target="_blank" rel="noopener noreferrer">${esc(tr("rankingTable"))}<span aria-hidden="true">↗</span></a>` : ""}
        </div>
      </div>
      <aside class="gmiw-country-panel" aria-label="${esc(tr("selectedCountry"))}">
        <div class="gmiw-country-panel-head"><span>${esc(tr("selectedCountry"))}</span><span class="gmiw-evidence-status"><i></i>${esc(tr("sourceCaveat"))}</span></div>
        <div class="gmiw-country-ident">${flag(selected)}<div><strong>${esc(countryName(selected))}</strong><span>${esc(selected.iso3)} · ${esc(selected.data_year)}</span></div></div>
        <div class="gmiw-score-lockup"><div><span>#${intFmt(selected.rank)}</span><small>${esc(tr("rankPublished"))}</small></div><div><strong>${intFmt(selected.score)}</strong><small>${esc(tr("score"))}</small></div></div>
        <div class="gmiw-position-meter"><div><i style="width:${position.toFixed(2)}%"></i><b style="left:${position.toFixed(2)}%"></b></div><span>0</span><strong>${fmt(position, 0)}/100 · ${esc(tr("derivedScale"))}</strong><span>100</span></div>
        <div class="gmiw-mini-components">${miniComponentBars(selected, summary)}</div>
        <div class="gmiw-country-panel-foot"><span>${esc(tr("dominantComponent"))}</span><strong>${esc(dominant.label)}</strong><button type="button" data-gmi-action="evidence" data-iso="${esc(selected.iso3)}">${esc(tr("evidence"))}<span aria-hidden="true">→</span></button></div>
      </aside>
    </section>`;
  }

  function statsMarkup(selected, summary) {
    const dominant = dominantComponent(selected, summary);
    const median = summary.score?.median;
    const gap = Number(selected.score) - Number(median);
    const position = rankPercentile(selected);
    return `<section class="gmiw-stat-grid" aria-label="${esc(tr("selectedCountry"))}">
      <article><span>${esc(tr("rank"))}</span><strong>#${intFmt(selected.rank)}<small>/${intFmt(S.data.rows.length)}</small></strong><p>${esc(tr("rankPublished"))}</p></article>
      <article><span>${esc(tr("score"))}</span><strong>${intFmt(selected.score)}</strong><p>${esc(tr("publishedValue"))}</p></article>
      <article><span>${esc(tr("position"))}</span><strong>${fmt(position, 0)}<small>/100</small></strong><p>${esc(tr("derivedScale"))}</p></article>
      <article><span>${esc(tr("worldMedian"))}</span><strong>${fmt(median, 0)}</strong><p>${gap >= 0 ? "+" : ""}${fmt(gap, 0)} · ${esc(tr("score"))}</p></article>
      <article class="wide"><span>${esc(tr("dominantComponent"))}</span><strong>${esc(dominant.label)}</strong><p>${fmt(dominant.percentile, 0)} · ${esc(tr("countryPercentile"))}</p></article>
    </section>`;
  }
  function sectionHeading(kicker, title, text, id = "") {
    return `<header class="gmiw-section-head"${id ? ` id="${esc(id)}"` : ""}><span>${esc(kicker)}</span><div><h2>${esc(title)}</h2><p>${esc(text)}</p></div></header>`;
  }

  function quantiles(rows, field, bins = 7) {
    const values = rows.map((row) => Number(row[field])).filter(Number.isFinite).sort((a, b) => a - b);
    return Array.from({ length: bins - 1 }, (_, index) => values[Math.round((values.length - 1) * ((index + 1) / bins))]);
  }
  function quantileClass(value, cuts) {
    if (!Number.isFinite(Number(value))) return "nodata";
    let index = 0;
    while (index < cuts.length && Number(value) > cuts[index]) index += 1;
    return `q${index + 1}`;
  }
  function geoIso(feature) {
    const properties = feature?.properties || {};
    const candidates = [properties.iso_a3, properties.ISO_A3, properties.adm0_a3, properties.ADM0_A3, properties.sov_a3, properties.id, feature?.id];
    const aliases = { "-99": "", KOS: "XKX" };
    const value = String(candidates.find((item) => item && String(item).length === 3) || "").toUpperCase();
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
  function project(point, width, height) {
    const lon = clamp(Number(point[0]), -180, 180); const lat = clamp(Number(point[1]), -90, 90);
    return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
  }
  function ringPath(ring, width, height) {
    return splitRing(ring).map((chunk) => chunk.map((point, index) => { const [x, y] = project(point, width, height); return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z").join(" ");
  }
  function geometryPath(geometry, width, height) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return geometry.coordinates.map((ring) => ringPath(ring, width, height)).join(" ");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map((ring) => ringPath(ring, width, height)).join(" ")).join(" ");
    return "";
  }
  function compactMetricTable(field) {
    return S.data.rows.slice().sort((a, b) => Number(b[field]) - Number(a[field])).slice(0, 12).map((row) => `<tr><td><button type="button" data-gmi-action="country" data-iso="${esc(row.iso3)}">${esc(countryName(row))}</button></td><td>${fmt(row[field], field === "score" ? 0 : 2)}</td></tr>`).join("");
  }
  function mapMarkup(selected) {
    const field = metricField(S.metric);
    const cuts = quantiles(S.data.rows, field, 7);
    const features = Array.isArray(S.geo?.features) ? S.geo.features : [];
    const paths = features.map((feature) => {
      const iso3 = geoIso(feature); const row = rowByIso(iso3); const path = geometryPath(feature.geometry, 1000, 510);
      if (!path) return "";
      const klass = row ? quantileClass(row[field], cuts) : "nodata";
      const selectedClass = row?.iso3 === selected.iso3 ? " selected" : "";
      return `<path class="gmiw-map-country ${klass}${selectedClass}" d="${path}" data-gmi-action="map-country" data-iso="${esc(iso3)}" tabindex="${row?.iso3 === selected.iso3 ? "0" : "-1"}" role="button" aria-label="${esc(row ? `${countryName(row)}: ${fmt(row[field], field === "score" ? 0 : 2)}` : tr("noData"))}" ${row ? "" : "aria-disabled=\"true\""}></path>`;
    }).join("");
    const tabs = Object.keys(METRICS).map((key) => `<button type="button" class="${S.metric === key ? "active" : ""}" data-gmi-action="metric" data-metric="${key}" aria-pressed="${S.metric === key}">${esc(metricLabel(key))}</button>`).join("");
    return `<section class="gmiw-map-section">
      ${sectionHeading(tr("mapKicker"), tr("mapTitle"), tr("mapText"), "gmi-map")}
      <div class="gmiw-map-toolbar"><span>${esc(tr("metric"))}</span><div>${tabs}</div></div>
      <div class="gmiw-map-layout">
        <div class="gmiw-map-card">
          ${features.length ? `<div class="gmiw-map-wrap"><svg viewBox="0 0 1000 510" role="img" aria-label="${esc(`${tr("mapTitle")}: ${metricLabel(S.metric)}`)}"><g>${paths}</g></svg><div class="gmiw-tooltip" role="status" hidden></div></div>` : `<div class="gmiw-map-unavailable"><strong>${esc(tr("mapUnavailable"))}</strong></div>`}
          <div class="gmiw-map-legend"><span>${esc(tr("lessMilitarised"))}</span><i>${Array.from({ length: 7 }, (_, i) => `<b class="q${i + 1}"></b>`).join("")}</i><span>${esc(tr("moreMilitarised"))}</span><em>${esc(tr("keyboardMap"))}</em></div>
        </div>
        <aside class="gmiw-map-rank"><header><span>${esc(metricLabel(S.metric))}</span><strong>TOP 12</strong></header><table><tbody>${compactMetricTable(field)}</tbody></table><details><summary>${esc(tr("textMap"))}</summary><table><thead><tr><th>${esc(tr("country"))}</th><th>${esc(tr("value"))}</th></tr></thead><tbody>${S.data.rows.map((row) => `<tr><td>${esc(countryName(row))}</td><td>${fmt(row[field], field === "score" ? 0 : 2)}</td></tr>`).join("")}</tbody></table></details></aside>
      </div>
    </section>`;
  }

  function componentProfileMarkup(selected, summary) {
    const profile = relativeProfile(selected, summary);
    const dominant = dominantComponent(selected, summary);
    const lanes = profile.map((item) => {
      const stats = summary[item.field];
      const medianPct = componentPercentile({ [item.field]: stats.median }, item.field, summary);
      const p90Pct = componentPercentile({ [item.field]: stats.p90 }, item.field, summary);
      return `<article class="gmiw-pressure-lane">
        <header><div><span>${esc(item.label)}</span><strong>${fmt(item.value, 2)}</strong></div><b>${fmt(item.percentile, 0)}<small>/100</small></b></header>
        <div class="gmiw-pressure-track"><i class="median" style="left:${medianPct.toFixed(2)}%" title="${esc(tr("median"))}: ${fmt(stats.median, 2)}"></i><i class="p90" style="left:${p90Pct.toFixed(2)}%" title="${esc(tr("p90"))}: ${fmt(stats.p90, 2)}"></i><span style="width:${item.percentile.toFixed(2)}%"></span><b style="left:${item.percentile.toFixed(2)}%"></b></div>
        <footer><span>0</span><em>${esc(tr("median"))} ${fmt(stats.median, 2)}</em><em>${esc(tr("p90"))} ${fmt(stats.p90, 2)}</em><span>100</span></footer>
      </article>`;
    }).join("");
    return `<section class="gmiw-signature-section">
      ${sectionHeading(tr("signatureKicker"), tr("signatureTitle"), tr("signatureText"), "gmi-signature")}
      <div class="gmiw-signature-grid"><div class="gmiw-pressure-list">${lanes}</div><aside class="gmiw-signature-summary"><span>${esc(tr("strongest"))}</span><strong>${esc(dominant.label)}</strong><div class="gmiw-orbit" aria-hidden="true"><i style="--p:${dominant.percentile.toFixed(2)}"></i><b>${fmt(dominant.percentile, 0)}</b><small>/100</small></div><p>${esc(tr("componentHelp"))}</p></aside></div>
    </section>`;
  }

  function architectureMarkup() {
    const groups = [
      { key: "expenditure", title: tr("expenditure"), items: [[tr("expGdp"), 5], [tr("expHealth"), 3]] },
      { key: "personnel", title: tr("personnel"), items: [[tr("personnelPopulation"), 4], [tr("reservistsPopulation"), 2], [tr("personnelDoctors"), 2]] },
      { key: "heavy", title: tr("heavyWeapons"), items: [[tr("weaponsPopulation"), 4]] },
    ];
    return `<section class="gmiw-architecture-section">
      ${sectionHeading(tr("architectureKicker"), tr("architectureTitle"), tr("architectureText"), "gmi-architecture")}
      <div class="gmiw-architecture-grid">${groups.map((group, groupIndex) => `<article class="gmiw-architecture-card ${group.key}"><header><span>0${groupIndex + 1}</span><strong>${esc(group.title)}</strong></header><div>${group.items.map(([label, weight]) => `<div class="gmiw-weight-row"><span>${esc(label)}</span><i><b style="width:${(weight / 5) * 100}%"></b></i><strong>${esc(tr("weight"))} ${weight}</strong></div>`).join("")}</div><footer>${group.items.reduce((sum, item) => sum + item[1], 0)} / 20</footer></article>`).join("")}</div>
    </section>`;
  }

  function histogramMarkup(selected) {
    const values = S.data.rows.map((row) => Number(row.score)).filter(Number.isFinite);
    const min = Math.min(...values); const max = Math.max(...values); const bins = 12; const width = (max - min) / bins || 1;
    const counts = Array.from({ length: bins }, () => 0);
    values.forEach((value) => { counts[Math.min(bins - 1, Math.floor((value - min) / width))] += 1; });
    const maxCount = Math.max(...counts, 1);
    const selectedIndex = Math.min(bins - 1, Math.floor((Number(selected.score) - min) / width));
    const bars = counts.map((count, index) => `<div class="gmiw-hist-bin ${index === selectedIndex ? "selected" : ""}"><span style="height:${Math.max(4, (count / maxCount) * 100)}%"></span><b>${intFmt(count)}</b><small>${Math.round(min + index * width)}–${Math.round(min + (index + 1) * width)}</small></div>`).join("");
    return `<section class="gmiw-distribution-section">
      ${sectionHeading(tr("distributionKicker"), tr("distributionTitle"), tr("distributionText"), "gmi-distribution")}
      <div class="gmiw-distribution-card"><div class="gmiw-histogram" role="img" aria-label="${esc(`${tr("distributionTitle")}: ${countryName(selected)} ${selected.score}`)}">${bars}</div><aside><span>${esc(countryName(selected))}</span><strong>${intFmt(selected.score)}</strong><small>#${intFmt(selected.rank)} · ${fmt(rankPercentile(selected), 0)}/100</small><p>${esc(tr("equalScoreGuard"))}</p></aside></div>
    </section>`;
  }

  function radarPoint(percentile, index, axes, center, radius) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes;
    const r = radius * clamp(percentile, 0, 100) / 100;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  }
  function radarMarkup(rows, summary) {
    const axes = [
      { key: "overall", label: tr("overall"), value: (row) => rankPercentile(row) },
      { key: "expenditure", label: tr("expenditure"), value: (row) => componentPercentile(row, "military_expenditure_index", summary) },
      { key: "personnel", label: tr("personnel"), value: (row) => componentPercentile(row, "military_personnel_index", summary) },
      { key: "weapons", label: tr("heavyWeapons"), value: (row) => componentPercentile(row, "heavy_weapons_index", summary) },
    ];
    const center = 190; const radius = 132;
    const rings = [25, 50, 75, 100].map((level) => `<polygon points="${axes.map((_, index) => radarPoint(level, index, axes.length, center, radius).join(",")).join(" ")}" class="gmiw-radar-ring"></polygon>`).join("");
    const spokes = axes.map((axis, index) => { const point = radarPoint(100, index, axes.length, center, radius); const label = radarPoint(118, index, axes.length, center, radius); return `<line x1="${center}" y1="${center}" x2="${point[0]}" y2="${point[1]}" class="gmiw-radar-spoke"></line><text x="${label[0]}" y="${label[1]}" class="gmiw-radar-label" text-anchor="middle">${esc(axis.label)}</text>`; }).join("");
    const polygons = rows.map((row, index) => `<polygon points="${axes.map((axis, axisIndex) => radarPoint(axis.value(row), axisIndex, axes.length, center, radius).join(",")).join(" ")}" class="gmiw-radar-series s${index + 1}"><title>${esc(countryName(row))}</title></polygon>`).join("");
    return `<svg class="gmiw-radar" viewBox="0 0 380 380" role="img" aria-label="${esc(tr("comparisonText"))}">${rings}${spokes}${polygons}<circle cx="${center}" cy="${center}" r="3" class="gmiw-radar-center"></circle></svg>`;
  }
  function comparisonTable(rows, summary) {
    return `<div class="gmiw-table-scroll"><table class="gmiw-exact-table"><thead><tr><th>${esc(tr("country"))}</th><th>${esc(tr("rank"))}</th><th>${esc(tr("score"))}</th><th>${esc(tr("expenditure"))}</th><th>${esc(tr("personnel"))}</th><th>${esc(tr("heavyWeapons"))}</th><th>${esc(tr("position"))}</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${flag(row, "gmiw-flag small")}<button type="button" data-gmi-action="country" data-iso="${esc(row.iso3)}">${esc(countryName(row))}</button></td><td>#${intFmt(row.rank)}</td><td>${intFmt(row.score)}</td><td>${fmt(row.military_expenditure_index, 2)}</td><td>${fmt(row.military_personnel_index, 2)}</td><td>${fmt(row.heavy_weapons_index, 2)}</td><td>${fmt(rankPercentile(row), 0)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function comparisonMarkup(selected, summary) {
    const rows = S.compare.map(rowByIso).filter(Boolean).slice(0, 5);
    const available = S.data.rows.filter((row) => !S.compare.includes(row.iso3)).sort((a, b) => countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru"));
    const legend = rows.map((row, index) => `<div class="gmiw-series-chip s${index + 1}"><i></i><span>${esc(countryName(row))}</span>${rows.length > 2 ? `<button type="button" data-gmi-action="remove-compare" data-iso="${esc(row.iso3)}" aria-label="${esc(`${tr("remove")}: ${countryName(row)}`)}">×</button>` : ""}</div>`).join("");
    return `<section class="gmiw-comparison-section">
      ${sectionHeading(tr("comparisonKicker"), tr("comparisonTitle"), tr("comparisonText"), "gmi-comparison")}
      <div class="gmiw-comparison-controls"><label><span>${esc(tr("addCountry"))}</span><select id="gmiCompareSelect" ${S.compare.length >= 5 ? "disabled" : ""}>${available.map((row) => `<option value="${esc(row.iso3)}">${esc(countryName(row))}</option>`).join("")}</select></label><button type="button" class="gmiw-button primary" data-gmi-action="add-compare" ${S.compare.length >= 5 || !available.length ? "disabled" : ""}>${esc(tr("add"))}</button><button type="button" class="gmiw-button quiet" data-gmi-action="reset-compare">${esc(tr("reset"))}</button></div>
      <div class="gmiw-comparison-grid"><div class="gmiw-radar-card"><header><span>${esc(tr("derivedRadar"))}</span><strong>0—100</strong></header>${radarMarkup(rows, summary)}<div class="gmiw-series-legend">${legend}</div><p>${esc(tr("percentileHelp"))}</p></div><div class="gmiw-comparison-cards">${rows.map((row, index) => `<article class="s${index + 1}"><header>${flag(row, "gmiw-flag small")}<div><strong>${esc(countryName(row))}</strong><span>${esc(row.iso3)}</span></div><b>#${intFmt(row.rank)}</b></header><div><span>${esc(tr("score"))}</span><strong>${intFmt(row.score)}</strong></div><div><span>${esc(tr("position"))}</span><strong>${fmt(rankPercentile(row), 0)}/100</strong></div><footer>${esc(dominantComponent(row, summary).label)}</footer></article>`).join("")}</div></div>
      <h3 class="gmiw-subtitle">${esc(tr("exactTable"))}</h3>${comparisonTable(rows, summary)}
    </section>`;
  }

  function sortedRows() {
    const query = S.query.trim().toLocaleLowerCase(S.context?.lang === "en" ? "en" : "ru");
    const rows = S.data.rows.filter((row) => !query || countryName(row).toLocaleLowerCase().includes(query) || row.country_name.toLocaleLowerCase().includes(query) || row.source_country_name.toLocaleLowerCase().includes(query) || row.iso3.toLocaleLowerCase().includes(query));
    const field = ({ rank: "rank", score: "score", country: "country_name", expenditure: "military_expenditure_index", personnel: "military_personnel_index", heavy_weapons: "heavy_weapons_index" })[S.sort] || "rank";
    rows.sort((a, b) => {
      let result;
      if (field === "country_name") result = countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru");
      else result = Number(a[field]) - Number(b[field]);
      if (result === 0) result = Number(a.source_order) - Number(b.source_order);
      return S.direction === "desc" ? -result : result;
    });
    return rows;
  }
  function rankingMarkup(selected) {
    const rows = sortedRows(); const totalPages = Math.max(1, Math.ceil(rows.length / S.pageSize));
    S.page = Math.min(S.page, totalPages - 1);
    const start = S.page * S.pageSize; const pageRows = rows.slice(start, start + S.pageSize);
    const backendCsv = requestUrl(`/export.csv?year=${S.data.active_numeric_release?.data_year || DATA_YEAR_FALLBACK}`);
    return `<section class="gmiw-ranking-section">
      ${sectionHeading(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"), "gmi-ranking")}
      <div class="gmiw-ranking-toolbar"><label class="search"><span>${esc(tr("search"))}</span><input id="gmiRankingSearch" type="search" value="${esc(S.query)}" placeholder="${esc(tr("search"))}" autocomplete="off"></label><label><span>${esc(tr("sortBy"))}</span><select id="gmiRankingSort"><option value="rank" ${S.sort === "rank" ? "selected" : ""}>${esc(tr("rank"))}</option><option value="score" ${S.sort === "score" ? "selected" : ""}>${esc(tr("score"))}</option><option value="country" ${S.sort === "country" ? "selected" : ""}>${esc(tr("country"))}</option><option value="expenditure" ${S.sort === "expenditure" ? "selected" : ""}>${esc(tr("expenditure"))}</option><option value="personnel" ${S.sort === "personnel" ? "selected" : ""}>${esc(tr("personnel"))}</option><option value="heavy_weapons" ${S.sort === "heavy_weapons" ? "selected" : ""}>${esc(tr("heavyWeapons"))}</option></select></label><label><span>${esc(tr("direction"))}</span><select id="gmiRankingDirection"><option value="asc" ${S.direction === "asc" ? "selected" : ""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction === "desc" ? "selected" : ""}>${esc(tr("descending"))}</option></select></label><label><span>${esc(tr("rowsPerPage"))}</span><select id="gmiRankingPageSize">${[10, 25, 50, 100].map((value) => `<option value="${value}" ${S.pageSize === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>${S.data.data_mode === "backend" ? `<a class="gmiw-button" href="${esc(backendCsv)}">${esc(tr("exportCsv"))}</a>` : `<button type="button" class="gmiw-button" data-gmi-action="export-static">${esc(tr("exportCsv"))}</button>`}</div>
      <div class="gmiw-ranking-note"><span>${esc(tr("equalScoreGuard"))}</span><span>${esc(tr("noSyntheticTrend"))}</span></div>
      <div class="gmiw-table-scroll"><table class="gmiw-ranking-table"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("country"))}</th><th>${esc(tr("score"))}</th><th>${esc(tr("expenditure"))}</th><th>${esc(tr("personnel"))}</th><th>${esc(tr("heavyWeapons"))}</th><th>${esc(tr("position"))}</th><th>${esc(tr("evidence"))}</th></tr></thead><tbody>${pageRows.length ? pageRows.map((row) => `<tr class="${row.iso3 === selected.iso3 ? "selected" : ""}"><td><strong>#${intFmt(row.rank)}</strong>${row.displayed_score_tie_possible ? `<span class="gmiw-tie-dot" title="${esc(tr("scoreTiePossible"))}"></span>` : ""}</td><td>${flag(row, "gmiw-flag small")}<button type="button" data-gmi-action="country" data-iso="${esc(row.iso3)}"><strong>${esc(countryName(row))}</strong><span>${esc(row.iso3)}</span></button></td><td>${intFmt(row.score)}</td><td>${fmt(row.military_expenditure_index, 2)}</td><td>${fmt(row.military_personnel_index, 2)}</td><td>${fmt(row.heavy_weapons_index, 2)}</td><td><div class="gmiw-table-meter"><i style="width:${rankPercentile(row).toFixed(2)}%"></i><span>${fmt(rankPercentile(row), 0)}</span></div></td><td><button type="button" class="gmiw-evidence-button" data-gmi-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(`${tr("evidence")}: ${countryName(row)}`)}">↗</button></td></tr>`).join("") : `<tr><td colspan="8" class="empty">${esc(tr("zeroResults"))}</td></tr>`}</tbody></table></div>
      <footer class="gmiw-pagination"><span>${rows.length ? `${intFmt(start + 1)}–${intFmt(Math.min(start + S.pageSize, rows.length))}` : "0"} / ${intFmt(rows.length)}</span><div><button type="button" class="gmiw-button quiet" data-gmi-action="previous-page" ${S.page <= 0 ? "disabled" : ""}>${esc(tr("previous"))}</button><strong>${esc(tr("page"))} ${intFmt(S.page + 1)} ${esc(tr("of"))} ${intFmt(totalPages)}</strong><button type="button" class="gmiw-button quiet" data-gmi-action="next-page" ${S.page >= totalPages - 1 ? "disabled" : ""}>${esc(tr("next"))}</button></div></footer>
    </section>`;
  }

  function reportCatalogMarkup() {
    const reports = Array.isArray(S.data.reports) ? S.data.reports : [];
    return `<div class="gmiw-catalog"><h3>${esc(tr("catalogTitle"))}</h3><div>${reports.map((report) => `<article class="${report.is_latest_report ? "latest" : ""} ${report.is_active_numeric_release ? "active" : ""}"><span>${esc(report.publication_year || report.edition_year)}</span><strong>GMI ${esc(report.edition_year)}</strong><p>${intFmt(report.country_count)} ${esc(tr("countries"))}</p><div>${report.is_latest_report ? `<b>${esc(tr("latest"))}</b>` : ""}${report.is_active_numeric_release ? `<b>${esc(tr("active"))}</b>` : ""}<em>${esc(report.is_active_numeric_release ? tr("numericAvailable") : tr("metadataOnly"))}</em></div>${report.report_url ? `<a href="${esc(report.report_url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${tr("openReport")}: GMI ${report.edition_year}`)}">↗</a>` : ""}</article>`).join("")}</div></div>`;
  }
  function methodologyMarkup() {
    return `<section class="gmiw-methodology-section" id="gmi-methodology">
      ${sectionHeading(tr("methodologyKicker"), tr("methodologyTitle"), tr("methodologyText"))}
      <div class="gmiw-methodology-grid"><article><span>01</span><h3>${esc(tr("noRecomputeTitle"))}</h3><p>${esc(tr("noRecomputeText"))}</p></article><article><span>02</span><h3>${esc(tr("releaseSeparationTitle"))}</h3><p>${esc(tr("releaseSeparationText"))}</p></article><article><span>03</span><h3>${esc(tr("provenanceTitle"))}</h3><p>${esc(tr("provenanceText"))}</p></article></div>
      ${reportCatalogMarkup()}
      <div class="gmiw-source-footer"><div><span>${esc(tr("sourceMode"))}</span><strong>${esc(S.data.data_mode === "backend" ? tr("backend") : tr("staticSnapshot"))}</strong></div><div><span>${esc(tr("dataYear"))}</span><strong>${esc(S.data.active_numeric_release?.data_year || DATA_YEAR_FALLBACK)}</strong></div><div><span>${esc(tr("quality"))}</span><strong>${esc(S.data.active_numeric_release?.source_quality || S.data.active_numeric_release?.metadata?.quality_assurance?.status || "—")}</strong></div><div><span>${esc(tr("frontendVersion"))}</span><strong>4.0.0</strong></div></div>
    </section>`;
  }

  function evidenceMarkup(row) {
    const release = S.data.active_numeric_release || {};
    const provenance = row.provenance || {};
    const source = provenance.source_revision_url || release.distribution_source_page || release.metadata?.source_snapshot?.page_url || "";
    const report = release.report_url || release.metadata?.report_url || "";
    const sourceHash = provenance.source_snapshot_sha256 || release.source_snapshot_sha256 || "";
    const normalizedHash = provenance.normalized_snapshot_sha256 || release.normalized_snapshot_sha256 || "";
    const rows = [
      [tr("publisher"), release.publisher || "BICC"],
      [tr("reportEdition"), `GMI ${row.edition_year}`],
      [tr("dataYear"), row.data_year],
      [tr("published"), release.published_at || "—"],
      [tr("retrieved"), release.retrieved_at || "—"],
      [tr("sourceRevision"), provenance.source_revision_id || release.metadata?.source_snapshot?.revision_id || "—"],
      [tr("sourceSnapshot"), shortHash(sourceHash), sourceHash],
      [tr("normalizedSnapshot"), shortHash(normalizedHash), normalizedHash],
      [tr("rowHash"), shortHash(row.row_sha256 || provenance.row_sha256), row.row_sha256 || provenance.row_sha256],
      [tr("transform"), provenance.transform_id || release.transform_id || "—"],
      [tr("formula"), provenance.formula_version || release.formula_version || "—"],
      [tr("quality"), row.quality_flag || release.source_quality || "—"],
      [tr("license"), provenance.license || release.distribution_license || "—"],
    ];
    return `<div class="gmiw-dialog-head"><div>${flag(row)}<div><span>${esc(tr("evidence"))}</span><h2>${esc(countryName(row))}</h2><p>${esc(row.iso3)} · ${esc(tr("rankingYear"))} ${esc(row.data_year)}</p></div></div><button type="button" data-gmi-action="close-dialog" aria-label="${esc(tr("close"))}">×</button></div>
      <div class="gmiw-dialog-warning"><strong>${esc(tr("releaseGuardTitle"))}</strong><span>${esc(tr("releaseGuardText"))}</span></div>
      <section class="gmiw-dialog-values"><h3>${esc(tr("rowValues"))}</h3><div><article><span>${esc(tr("rank"))}</span><strong>#${intFmt(row.rank)}</strong><small>${esc(tr("rankPublished"))}</small></article><article><span>${esc(tr("score"))}</span><strong>${intFmt(row.score)}</strong><small>${esc(tr("publishedValue"))}</small></article><article><span>${esc(tr("expenditure"))}</span><strong>${fmt(row.military_expenditure_index, 2)}</strong></article><article><span>${esc(tr("personnel"))}</span><strong>${fmt(row.military_personnel_index, 2)}</strong></article><article><span>${esc(tr("heavyWeapons"))}</span><strong>${fmt(row.heavy_weapons_index, 2)}</strong></article></div>${row.displayed_score_tie_possible ? `<p>${esc(tr("equalScoreGuard"))}</p>` : ""}</section>
      <section class="gmiw-dialog-lineage"><h3>${esc(tr("integrity"))}</h3><dl>${rows.map(([label, value, copy]) => `<div><dt>${esc(label)}</dt><dd title="${esc(copy || value)}">${esc(value)}</dd>${copy ? `<button type="button" data-gmi-action="copy" data-copy="${esc(copy)}">${esc(tr("copy"))}</button>` : ""}</div>`).join("")}</dl><p>${esc(provenance.attribution || release.metadata?.source_snapshot?.attribution || "")}</p></section>
      <footer class="gmiw-dialog-actions">${source ? `<a class="gmiw-button" href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(tr("openSource"))}<span aria-hidden="true">↗</span></a>` : ""}${report ? `<a class="gmiw-button" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("openReport"))}<span aria-hidden="true">↗</span></a>` : ""}<button type="button" class="gmiw-button primary" data-gmi-action="close-dialog">${esc(tr("close"))}</button></footer>`;
  }
  function dialogMarkup() { return `<dialog class="gmiw-dialog" id="gmiEvidenceDialog" aria-labelledby="gmiEvidenceTitle"><div class="gmiw-dialog-body" data-gmi-dialog-body></div></dialog><div class="gmiw-toast" role="status" hidden></div>`; }
  function workspaceMarkup(selected, summary) {
    return `<div class="gmiw">${releaseRailMarkup()}${heroMarkup(selected, summary)}${statsMarkup(selected, summary)}${mapMarkup(selected)}${componentProfileMarkup(selected, summary)}${architectureMarkup()}${histogramMarkup(selected)}${comparisonMarkup(selected, summary)}${rankingMarkup(selected)}${methodologyMarkup()}${dialogMarkup()}</div>`;
  }

  function showEvidence(iso3, trigger) {
    const row = rowByIso(iso3); const dialog = S.context.root.querySelector("#gmiEvidenceDialog"); const body = dialog?.querySelector("[data-gmi-dialog-body]");
    if (!row || !dialog || !body) return;
    body.innerHTML = evidenceMarkup(row);
    body.querySelectorAll("[data-gmi-action]").forEach((control) => control.addEventListener("click", async () => {
      const action = control.dataset.gmiAction;
      if (action === "close-dialog") closeDialog();
      else if (action === "copy") {
        try { await navigator.clipboard.writeText(control.dataset.copy || ""); toast(tr("copied")); }
        catch (_) { toast(control.dataset.copy || ""); }
      }
    }));
    dialog.__returnFocus = trigger || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    dialog.querySelector("[data-gmi-action='close-dialog']")?.focus();
  }
  function closeDialog() {
    const dialog = S.context.root.querySelector("#gmiEvidenceDialog"); if (!dialog) return;
    const returnFocus = dialog.__returnFocus;
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    if (returnFocus?.focus && returnFocus.isConnected) returnFocus.focus();
  }
  function toast(message) {
    const node = S.context.root.querySelector(".gmiw-toast"); if (!node) return;
    node.textContent = message; node.hidden = false; window.clearTimeout(node.__timer);
    node.__timer = window.setTimeout(() => { node.hidden = true; }, 2200);
  }
  function selectCountry(iso3) {
    const row = rowByIso(iso3); if (!row) return;
    S.selectedIso = row.iso3;
    if (!S.compare.includes(row.iso3)) S.compare = [row.iso3, ...S.compare].slice(0, 5);
    if (typeof S.context?.setCountry === "function") S.context.setCountry(row.iso3);
    else { S.context.country = row.iso3; paint(); }
  }
  function showTooltip(path, event) {
    const tooltip = S.context.root.querySelector(".gmiw-tooltip"); const row = rowByIso(path.dataset.iso); if (!tooltip || !row) return;
    window.clearTimeout(S.tooltipTimer); const field = metricField(S.metric);
    tooltip.innerHTML = `<strong>${esc(countryName(row))}</strong><span>#${intFmt(row.rank)} · ${fmt(row[field], field === "score" ? 0 : 2)}</span>`;
    const wrap = tooltip.closest(".gmiw-map-wrap"); const rect = wrap.getBoundingClientRect();
    const x = event?.clientX || rect.left + rect.width / 2; const y = event?.clientY || rect.top + rect.height / 2;
    tooltip.style.left = `${clamp(x - rect.left + 14, 8, rect.width - 210)}px`; tooltip.style.top = `${clamp(y - rect.top + 14, 8, rect.height - 78)}px`; tooltip.hidden = false;
  }
  function hideTooltip(delay = 80) {
    const tooltip = S.context.root.querySelector(".gmiw-tooltip"); if (!tooltip) return;
    window.clearTimeout(S.tooltipTimer); S.tooltipTimer = window.setTimeout(() => { tooltip.hidden = true; }, delay);
  }
  function focusMapNeighbour(current, delta) {
    const paths = Array.from(S.context.root.querySelectorAll(".gmiw-map-country[data-gmi-action='map-country']:not([aria-disabled='true'])")); if (!paths.length) return;
    const index = Math.max(0, paths.indexOf(current)); const target = paths[(index + delta + paths.length) % paths.length];
    paths.forEach((path) => path.setAttribute("tabindex", path === target ? "0" : "-1")); target.focus(); showTooltip(target);
  }
  function exportStaticCsv() {
    const columns = ["data_year", "edition_year", "source_order", "iso3", "country_name", "source_country_name", "rank", "tied_rank", "score", "military_expenditure_index", "military_personnel_index", "heavy_weapons_index", "quality_flag", "source_dataset_version", "source_variables", "row_sha256"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [columns.join(","), ...S.data.rows.map((row) => columns.map((column) => quote(row[column])).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `gmi_${S.data.active_numeric_release?.data_year || DATA_YEAR_FALLBACK}_country_scores.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }
  function rerenderAt(anchorId = "") {
    const y = window.scrollY; paint();
    if (anchorId) S.context.root.querySelector(`#${CSS.escape(anchorId)}`)?.scrollIntoView({ block: "start" }); else window.scrollTo({ top: y, behavior: "auto" });
  }
  function bind() {
    const root = S.context.root;
    root.querySelectorAll("[data-gmi-action]").forEach((control) => {
      control.addEventListener("click", async () => {
        const action = control.dataset.gmiAction;
        if (action === "retry") return render(S.context, { force: true });
        if (action === "jump") return root.querySelector(`#${CSS.escape(control.dataset.target || "")}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (action === "metric") { S.metric = control.dataset.metric || "score"; return rerenderAt("gmi-map"); }
        if (action === "map-country" || action === "country") return selectCountry(control.dataset.iso);
        if (action === "evidence") return showEvidence(control.dataset.iso, control);
        if (action === "close-dialog") return closeDialog();
        if (action === "copy") { try { await navigator.clipboard.writeText(control.dataset.copy || ""); toast(tr("copied")); } catch (_) { toast(control.dataset.copy || ""); } return; }
        if (action === "add-compare") { const iso3 = root.querySelector("#gmiCompareSelect")?.value; if (iso3 && !S.compare.includes(iso3) && S.compare.length < 5) S.compare.push(iso3); return rerenderAt("gmi-comparison"); }
        if (action === "remove-compare") { if (S.compare.length > 2) S.compare = S.compare.filter((iso3) => iso3 !== control.dataset.iso); return rerenderAt("gmi-comparison"); }
        if (action === "reset-compare") { resetComparison(rowByIso(S.selectedIso)); return rerenderAt("gmi-comparison"); }
        if (action === "previous-page") { S.page = Math.max(0, S.page - 1); return rerenderAt("gmi-ranking"); }
        if (action === "next-page") { S.page += 1; return rerenderAt("gmi-ranking"); }
        if (action === "export-static") return exportStaticCsv();
      });
    });
    const search = root.querySelector("#gmiRankingSearch");
    if (search) { let timer; search.addEventListener("input", () => { window.clearTimeout(timer); timer = window.setTimeout(() => { S.query = search.value; S.page = 0; rerenderAt("gmi-ranking"); }, 180); }); }
    root.querySelector("#gmiRankingSort")?.addEventListener("change", (event) => { S.sort = event.target.value; S.page = 0; rerenderAt("gmi-ranking"); });
    root.querySelector("#gmiRankingDirection")?.addEventListener("change", (event) => { S.direction = event.target.value; S.page = 0; rerenderAt("gmi-ranking"); });
    root.querySelector("#gmiRankingPageSize")?.addEventListener("change", (event) => { S.pageSize = Number(event.target.value) || 25; S.page = 0; rerenderAt("gmi-ranking"); });
    root.querySelectorAll(".gmiw-map-country[data-gmi-action='map-country']:not([aria-disabled='true'])").forEach((path) => {
      path.addEventListener("pointerenter", (event) => showTooltip(path, event)); path.addEventListener("pointermove", (event) => showTooltip(path, event)); path.addEventListener("pointerleave", () => hideTooltip()); path.addEventListener("focus", () => showTooltip(path)); path.addEventListener("blur", () => hideTooltip());
      path.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); selectCountry(path.dataset.iso); } else if (["ArrowRight", "ArrowDown"].includes(event.key)) { event.preventDefault(); focusMapNeighbour(path, 1); } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); focusMapNeighbour(path, -1); } else if (event.key === "Escape") hideTooltip(0); });
    });
    const tooltip = root.querySelector(".gmiw-tooltip"); if (tooltip) { tooltip.addEventListener("pointerenter", () => window.clearTimeout(S.tooltipTimer)); tooltip.addEventListener("pointerleave", () => hideTooltip()); }
    const dialog = root.querySelector("#gmiEvidenceDialog"); if (dialog) { dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); }); dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); }); }
  }
  function paint() {
    if (!S.context?.root || !S.data?.rows?.length) return;
    const selected = ensureSelection(S.data.rows); const summary = computeSummary(S.data.rows);
    S.context.root.innerHTML = workspaceMarkup(selected, summary); bind();
    document.documentElement.dataset.gmiReady = "true";
    window.dispatchEvent(new CustomEvent("gir:gmi-ready", { detail: { iso3: selected.iso3, dataYear: S.data.active_numeric_release?.data_year, editionYear: S.data.active_numeric_release?.edition_year, dataMode: S.data.data_mode } }));
  }
  async function render(context, options = {}) {
    if (!context?.root) throw new Error("GMI workspace requires a root element");
    if (!context.country) return;
    S.context = context; const year = Number(context.year || DATA_YEAR_FALLBACK); const key = `${year}:${context.lang || "ru"}`; const token = ++S.renderToken;
    context.root.innerHTML = loadingMarkup(); document.documentElement.dataset.gmiReady = "false";
    try {
      if (!S.data || S.loadKey !== key || options.force) {
        const [data, geo] = await Promise.all([loadData(year), loadGeo()]); if (token !== S.renderToken) return;
        data.rows = normalizeRows(data); if (!data.rows.length) throw new Error("The GMI release contains no country rows");
        S.data = data; S.geo = geo; S.loadKey = key;
      }
      paint();
    } catch (error) {
      console.error("GMI workspace failed", error); if (token !== S.renderToken) return;
      context.root.innerHTML = errorMarkup(error); context.root.querySelector("[data-gmi-action='retry']")?.addEventListener("click", () => render(context, { force: true })); document.documentElement.dataset.gmiReady = "error";
    }
  }
  function invalidate() { S.data = null; S.loadKey = ""; }
  const publicApi = Object.freeze({ render, invalidate, version: "4.0.0-stage04" });
  window.GIRGMI = publicApi;
  window.GIRGMIWorkspace = publicApi;
})();
