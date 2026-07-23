/* GIR — Global Organized Crime Index analytical workspace, cumulative stage 06.
 * Dependency-free, bilingual and evidence-first. Criminality and resilience
 * remain separate official axes. GIR never creates a synthetic GOCI score.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)goci-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const API_BASE = "/api/security-connectivity/goci";
  const LATEST_EDITION = 2025;
  const EDITIONS = [2025, 2023, 2021];
  const CORE_METRICS = ["criminality", "criminal_markets", "criminal_actors", "resilience"];
  const DEFAULT_INDICATOR = "human_trafficking";

  const COPY = {
    ru: {
      module: "Безопасность и международная связанность",
      title: "Глобальный индекс организованной преступности",
      acronym: "GOCI",
      lead: "Мировая панель криминальности и устойчивости: 193 страны, 32 детальных показателя и три сопоставимых выпуска — без искусственного объединения двух шкал.",
      edition: "Выпуск",
      referenceYear: "референсный год",
      countries: "стран",
      officialOpenData: "официальный open-data workbook",
      dualAxis: "две независимые шкалы",
      derivedRanks: "места рассчитаны GIR по официальным баллам",
      noCombined: "синтетический общий балл отсутствует",
      methodology: "Методология",
      officialReport: "Официальный отчёт",
      openData: "Открытые данные",
      selectedCountry: "Выбранная страна",
      criminality: "Криминальность",
      resilience: "Устойчивость",
      criminalMarkets: "Криминальные рынки",
      criminalActors: "Криминальные акторы",
      score: "Баллы",
      rank: "Место",
      rankHighScore: "место среди наибольших значений",
      higherCrime: "выше — больше криминальность",
      higherResilience: "выше — сильнее устойчивость",
      worldAverage: "Среднее по миру",
      worldMedian: "Медиана мира",
      quadrant: "Профиль уязвимости",
      evidence: "Доказательная запись",
      overviewKicker: "Две оси, одна страна",
      overviewTitle: "Криминальность и способность ей противостоять",
      overviewText: "Официальные шкалы 1–10 показаны отдельно. Устойчивость не является обратной величиной криминальности, а общий синтетический рейтинг не создаётся.",
      critical: "Критическая уязвимость",
      contested: "Высокое давление, высокая способность",
      latent: "Низкое давление, слабая способность",
      safeguarded: "Сильные защитные механизмы",
      matrixKicker: "Глобальная матрица",
      matrixTitle: "193 страны в пространстве риска и устойчивости",
      matrixText: "Каждая точка — страна. Горизонталь показывает криминальность, вертикаль — устойчивость. Квадранты служат аналитической рамкой GIR, а не официальной классификацией GI-TOC.",
      lowerCrime: "Ниже криминальность",
      higherCrimeAxis: "Выше криминальность",
      lowerResilience: "Ниже устойчивость",
      higherResilienceAxis: "Выше устойчивость",
      selected: "выбрана",
      matrixDiagnostic: "Квадранты и разность шкал — производная диагностика GIR, не официальный балл или ранг GOCI.",
      mapKicker: "География",
      mapTitle: "Карта организованной преступности и устойчивости",
      mapText: "Переключайте официальные композиты или любой доступный показатель. Точные значения доступны в подсказке, таблице и текстовой альтернативе.",
      mapMetric: "Метрика карты",
      vulnerabilityGap: "Разрыв уязвимости",
      vulnerabilityGapNote: "криминальность − устойчивость; диагностика GIR",
      selectedIndicator: "Выбранный показатель",
      low: "Ниже",
      high: "Выше",
      noData: "Нет данных",
      textMap: "Текстовая альтернатива карте",
      mapUnavailable: "Географический слой недоступен. Все числовые разделы продолжают работать.",
      keyboardMap: "Стрелки перемещают фокус, Enter или пробел выбирают страну, Escape закрывает подсказку.",
      architectureKicker: "Архитектура индекса",
      architectureTitle: "15 рынков, 5 типов акторов и 12 механизмов устойчивости",
      architectureText: "Криминальность формируется из рынков и акторов, устойчивость оценивается отдельно. Все элементы внутри соответствующей группы имеют равный вес в методологии издателя.",
      markets: "Криминальные рынки",
      actors: "Криминальные акторы",
      safeguards: "Механизмы устойчивости",
      currentCountry: "Профиль страны",
      indicatorExplorer: "Проводник по показателям",
      allIndicators: "Все показатели",
      risks: "Риски",
      strengths: "Сильные стороны",
      clickIndicator: "Выберите показатель, чтобы обновить карту и рейтинг.",
      topRisks: "Наиболее выраженные риски",
      topStrengths: "Наиболее сильные механизмы",
      scoreOutOfTen: "из 10",
      historyKicker: "Три выпуска",
      historyTitle: "Динамика страны с защитой от ложных сравнений",
      historyText: "Устойчивость сопоставима во всех выпусках. Общую криминальность 2021 нельзя напрямую сравнивать с 2023: модель была расширена на пять рынков и один тип акторов.",
      methodologyBreak: "Изменение модели",
      breakText: "+5 рынков · +1 тип акторов",
      comparable: "сопоставимо",
      notComparable: "прямое сравнение заблокировано",
      change: "Изменение",
      noTrend: "Нет корректного тренда",
      comparisonKicker: "Сравнительная лаборатория",
      comparisonTitle: "Сопоставление стран без смешения шкал",
      comparisonText: "Выберите от двух до пяти стран. Позиции на матрице и точные официальные значения показаны рядом; разрыв уязвимости остаётся диагностикой GIR.",
      addCountry: "Добавить страну",
      add: "Добавить",
      reset: "Сбросить",
      remove: "Удалить",
      exactValues: "Точные значения",
      rankingKicker: "Полный набор данных",
      rankingTitle: "Рейтинг и 36-метрический каталог",
      rankingText: "Поиск, фильтры, сортировка и evidence-dialog для каждой страны и любого доступного показателя выпуска.",
      metric: "Показатель",
      search: "Поиск страны или ISO3",
      continent: "Континент",
      region: "Регион",
      allContinents: "Все континенты",
      allRegions: "Все регионы",
      sortBy: "Сортировать",
      byRank: "По месту",
      byScore: "По баллу",
      byCountry: "По стране",
      direction: "Направление",
      ascending: "по возрастанию",
      descending: "по убыванию",
      rowsPerPage: "Строк",
      previous: "Назад",
      next: "Вперёд",
      page: "Страница",
      of: "из",
      country: "Страна",
      profile: "Профиль",
      zeroResults: "Страны по выбранным условиям не найдены.",
      exportCsv: "Экспорт CSV",
      sourceMode: "Режим данных",
      backend: "FastAPI + SQLite",
      staticSnapshot: "проверенный статический снимок",
      scoreOfficial: "официальный балл workbook",
      rankDerived: "производное competition rank GIR",
      methodologyKicker: "Как читать GOCI",
      methodologyTitle: "Интерпретация без ложной точности",
      methodologyText: "Индекс описывает распространённость организованной преступности и способность государства и общества ей противостоять. Он не заменяет оценку личной безопасности или прогноз преступности.",
      noSyntheticTitle: "Две шкалы не складываются",
      noSyntheticText: "Криминальность и устойчивость сохраняются как самостоятельные официальные оси. Разность используется только как подписанная диагностическая величина.",
      rankTitle: "Баллы официальные, места производные",
      rankText: "В открытом Excel нет готовых мест. GIR применяет стандартное соревновательное ранжирование к отображаемым официальным баллам; одинаковые баллы получают одинаковое место.",
      breakTitle: "Методологический разрыв 2021 → 2023",
      breakMethodText: "Пять новых рынков и акторы частного сектора изменили состав композита криминальности. Исторический график не соединяет несовместимые точки.",
      provenanceTitle: "Provenance на уровне строки",
      provenanceText: "Для страны доступны workbook, лист, дата получения, SHA-256 источника и нормализованного снимка, transform ID, версия формулы и хеш строки.",
      loading: "Загрузка пространства GOCI",
      loadingText: "Проверяются три выпуска, 36 метрик, география и доказательные метаданные.",
      loadError: "Не удалось открыть пространство GOCI",
      retry: "Повторить",
      close: "Закрыть",
      copy: "Копировать",
      copied: "Скопировано",
      openSource: "Открыть источник",
      openReport: "Открыть отчёт",
      publisher: "Издатель",
      published: "Опубликовано",
      retrieved: "Получено",
      sourceSheet: "Лист Excel",
      sourceOrder: "Порядок строки",
      sourceWorkbook: "Официальный workbook",
      normalizedSnapshot: "Нормализованный снимок",
      rowHash: "SHA-256 строки",
      transform: "Transform ID",
      formula: "Версия формулы",
      quality: "Статус качества",
      license: "Лицензионный статус",
      values: "Значения строки",
      scoreStatus: "Статус баллов",
      rankStatus: "Статус мест",
      model: "Модель выпуска",
      unavailable: "Недоступно в этом выпуске",
      frontendVersion: "Интерфейс stage 06",
    },
    en: {
      module: "Security & international connectivity",
      title: "Global Organized Crime Index",
      acronym: "GOCI",
      lead: "A global criminality and resilience cockpit: 193 countries, 32 detailed indicators and three releases — without collapsing the two scales into an invented composite.",
      edition: "Edition", referenceYear: "reference year", countries: "countries",
      officialOpenData: "official open-data workbook", dualAxis: "two independent axes",
      derivedRanks: "ranks derived by GIR from official scores", noCombined: "no synthetic combined score",
      methodology: "Methodology", officialReport: "Official report", openData: "Open data",
      selectedCountry: "Selected country", criminality: "Criminality", resilience: "Resilience",
      criminalMarkets: "Criminal markets", criminalActors: "Criminal actors", score: "Score", rank: "Rank",
      rankHighScore: "rank among highest scores", higherCrime: "higher means more criminality",
      higherResilience: "higher means stronger resilience", worldAverage: "World average", worldMedian: "World median",
      quadrant: "Vulnerability profile", evidence: "Evidence record",
      overviewKicker: "Two axes, one country", overviewTitle: "Criminality and the capacity to withstand it",
      overviewText: "The official 1–10 scales remain separate. Resilience is not the inverse of criminality, and no synthetic overall ranking is created.",
      critical: "Critical vulnerability", contested: "High pressure, high capacity", latent: "Low pressure, weak capacity", safeguarded: "Strong safeguards",
      matrixKicker: "Global matrix", matrixTitle: "193 countries across criminality and resilience",
      matrixText: "Each point is a country. The horizontal axis is criminality; the vertical axis is resilience. Quadrants are a GIR analytical frame, not an official GI-TOC classification.",
      lowerCrime: "Lower criminality", higherCrimeAxis: "Higher criminality", lowerResilience: "Lower resilience", higherResilienceAxis: "Higher resilience",
      selected: "selected", matrixDiagnostic: "Quadrants and the scale gap are GIR diagnostics, not an official GOCI score or rank.",
      mapKicker: "Geography", mapTitle: "Organized crime and resilience map",
      mapText: "Switch between the official composites or any available indicator. Exact values remain available in the tooltip, table and text alternative.",
      mapMetric: "Map metric", vulnerabilityGap: "Vulnerability gap", vulnerabilityGapNote: "criminality − resilience; GIR diagnostic",
      selectedIndicator: "Selected indicator", low: "Lower", high: "Higher", noData: "No data", textMap: "Text alternative to the map",
      mapUnavailable: "The geographic layer is unavailable. All numerical sections remain functional.",
      keyboardMap: "Use arrow keys to move, Enter or Space to select a country, and Escape to dismiss the tooltip.",
      architectureKicker: "Index architecture", architectureTitle: "15 markets, 5 actor types and 12 resilience measures",
      architectureText: "Criminality is built from markets and actors, while resilience is assessed separately. All elements within each relevant group receive equal weight in the publisher methodology.",
      markets: "Criminal markets", actors: "Criminal actors", safeguards: "Resilience measures", currentCountry: "Country profile",
      indicatorExplorer: "Indicator explorer", allIndicators: "All indicators", risks: "Risks", strengths: "Strengths",
      clickIndicator: "Choose an indicator to update the map and ranking.", topRisks: "Most pronounced risks", topStrengths: "Strongest resilience measures", scoreOutOfTen: "out of 10",
      historyKicker: "Three releases", historyTitle: "Country history with comparability safeguards",
      historyText: "Resilience is comparable across all releases. Overall criminality in 2021 cannot be directly compared with 2023 because five markets and one actor type were added.",
      methodologyBreak: "Model change", breakText: "+5 markets · +1 actor type", comparable: "comparable", notComparable: "direct comparison blocked",
      change: "Change", noTrend: "No valid trend",
      comparisonKicker: "Comparison lab", comparisonTitle: "Compare countries without mixing scales",
      comparisonText: "Choose two to five countries. Matrix positions and exact official values are shown together; the vulnerability gap remains a GIR diagnostic.",
      addCountry: "Add country", add: "Add", reset: "Reset", remove: "Remove", exactValues: "Exact values",
      rankingKicker: "Full dataset", rankingTitle: "Ranking and 36-metric catalogue",
      rankingText: "Search, filter, sort and open an evidence dialog for every country and every available metric in the release.",
      metric: "Metric", search: "Search country or ISO3", continent: "Continent", region: "Region", allContinents: "All continents", allRegions: "All regions",
      sortBy: "Sort by", byRank: "Rank", byScore: "Score", byCountry: "Country", direction: "Direction", ascending: "ascending", descending: "descending",
      rowsPerPage: "Rows", previous: "Previous", next: "Next", page: "Page", of: "of", country: "Country", profile: "Profile",
      zeroResults: "No countries match the selected conditions.", exportCsv: "Export CSV", sourceMode: "Data mode", backend: "FastAPI + SQLite",
      staticSnapshot: "verified static snapshot", scoreOfficial: "official workbook score", rankDerived: "GIR-derived competition rank",
      methodologyKicker: "How to read GOCI", methodologyTitle: "Interpretation without false precision",
      methodologyText: "The index describes the prevalence of organized crime and the capacity of state and society to resist it. It is not a personal-safety score or a crime forecast.",
      noSyntheticTitle: "The two scales are not added", noSyntheticText: "Criminality and resilience remain separate official axes. Their difference is used only as a clearly labelled diagnostic.",
      rankTitle: "Official scores, derived ranks", rankText: "The open workbook does not publish ranks. GIR applies standard-competition ranking to the displayed official scores; equal scores receive equal ranks.",
      breakTitle: "Methodological break from 2021 to 2023", breakMethodText: "Five new markets and private-sector actors changed the criminality composite. The history chart does not connect incompatible points.",
      provenanceTitle: "Row-level provenance", provenanceText: "Each country exposes the workbook, worksheet, retrieval date, source and normalized SHA-256 values, transform ID, formula version and row hash.",
      loading: "Loading the GOCI workspace", loadingText: "Checking three releases, 36 metrics, geography and evidence metadata.", loadError: "The GOCI workspace could not be opened", retry: "Retry",
      close: "Close", copy: "Copy", copied: "Copied", openSource: "Open source", openReport: "Open report", publisher: "Publisher", published: "Published", retrieved: "Retrieved",
      sourceSheet: "Excel worksheet", sourceOrder: "Source row order", sourceWorkbook: "Official workbook", normalizedSnapshot: "Normalized snapshot", rowHash: "Row SHA-256",
      transform: "Transform ID", formula: "Formula version", quality: "Quality status", license: "Licence status", values: "Row values", scoreStatus: "Score status", rankStatus: "Rank status",
      model: "Release model", unavailable: "Unavailable in this release", frontendVersion: "Stage 06 interface",
    },
  };

  const S = {
    context: null,
    data: null,
    geo: null,
    loadKey: "",
    edition: LATEST_EDITION,
    selectedIso: "",
    mapMetric: "criminality",
    indicatorGroup: "all",
    selectedIndicator: DEFAULT_INDICATOR,
    rankingMetric: "criminality",
    query: "",
    continent: "",
    region: "",
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
  function fmt(value, digits = 2) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function intFmt(value) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 0 });
  }
  function signed(value, digits = 2) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;
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
    const controller = new AbortController(); window.setTimeout(() => controller.abort(), ms); return controller.signal;
  }
  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { cache: "no-store", signal: timeoutSignal(12000), ...options });
    if (!response.ok) throw new Error(`${url} · HTTP ${response.status}`);
    return response.json();
  }
  function groupCode(item) { return item.group_code || item.group || ""; }
  function metricCode(item) { return item.indicator_code || item.code || ""; }
  function metricName(item) {
    if (!item) return "—";
    return S.context?.lang === "en" ? (item.name_en || item.name_ru || metricCode(item)) : (item.name_ru || item.name_en || metricCode(item));
  }
  function normalizeCatalog(items) {
    return (items || []).map((item, index) => ({
      ...item,
      indicator_code: metricCode(item),
      group_code: groupCode(item),
      available_from_edition: Number(item.available_from_edition || 2021),
      sort_order: Number(item.sort_order || index + 1),
      is_composite: Boolean(item.is_composite),
      score_direction: item.score_direction || (groupCode(item) === "resilience" || metricCode(item) === "resilience" ? "higher_is_more_resilient" : "higher_is_more_criminality"),
    })).sort((a, b) => a.sort_order - b.sort_order || a.indicator_code.localeCompare(b.indicator_code));
  }
  function availableCatalog(edition = S.edition) { return S.data.indicator_catalog.filter((item) => item.available_from_edition <= Number(edition)); }
  function itemByCode(code) { return S.data?.indicator_catalog?.find((item) => item.indicator_code === code) || null; }
  function isResilienceMetric(code) { const item = itemByCode(code); return code === "resilience" || item?.group_code === "resilience"; }
  function isDiagnosticMetric(code) { return code === "vulnerability_gap"; }
  function metricDirectionLabel(code) { return isResilienceMetric(code) ? tr("higherResilience") : tr("higherCrime"); }

  function platformCountry(iso3) {
    return (S.context?.platformContext?.countries || []).find((country) => String(country.iso3).toUpperCase() === String(iso3).toUpperCase()) || null;
  }
  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const row = typeof rowOrIso === "object" ? rowOrIso : currentRows().find((item) => item.iso3 === iso3);
    const country = platformCountry(iso3);
    if (country) return S.context?.lang === "en" ? (country.name_en || country.name_ru || row?.country_name || iso3) : (country.name_ru || country.name_en || row?.country_name || iso3);
    return row?.country_name || iso3 || "—";
  }
  function flag(row, className = "gociw-flag") {
    const country = platformCountry(row.iso3) || { iso3: row.iso3, name_ru: countryName(row), name_en: countryName(row) };
    if (typeof S.context?.flagImage === "function") return S.context.flagImage(country, className);
    return `<span class="${className} gociw-flag-fallback" aria-hidden="true">${esc(row.iso3)}</span>`;
  }
  function currentRows() { return S.data?.rows_by_edition?.[String(S.edition)] || []; }
  function rowByIso(iso3, edition = S.edition) {
    return (S.data?.rows_by_edition?.[String(edition)] || []).find((row) => row.iso3 === String(iso3 || "").toUpperCase()) || null;
  }
  function releaseByEdition(edition = S.edition) { return S.data?.releases?.find((item) => Number(item.edition_year) === Number(edition)) || null; }
  function score(row, code) {
    if (!row) return null;
    if (code === "vulnerability_gap") return row.vulnerability_gap;
    return row.scores?.[code] ?? row[code] ?? null;
  }
  function rank(row, code) {
    if (!row || code === "vulnerability_gap") return null;
    return row.ranks?.[code] ?? row[`${code}_rank`] ?? null;
  }

  function valuesFor(code, edition = S.edition) { return (S.data?.rows_by_edition?.[String(edition)] || []).map((row) => Number(score(row, code))).filter(Number.isFinite).sort((a, b) => a - b); }
  function quantile(values, probability) {
    if (!values.length) return null;
    const pos = (values.length - 1) * probability; const low = Math.floor(pos); const high = Math.ceil(pos);
    return low === high ? values[low] : values[low] + (values[high] - values[low]) * (pos - low);
  }
  function summary(code, edition = S.edition) {
    const fromBundle = S.data?.summary_by_edition?.[String(edition)]?.metrics?.[code] || (code === "vulnerability_gap" ? S.data?.summary_by_edition?.[String(edition)]?.vulnerability_gap : null);
    if (fromBundle) return { min: fromBundle.minimum, max: fromBundle.maximum, mean: fromBundle.mean, median: fromBundle.median, p25: fromBundle.p25, p75: fromBundle.p75, p90: fromBundle.p90, values: valuesFor(code, edition) };
    const values = valuesFor(code, edition);
    return { min: values[0], max: values.at(-1), mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null, median: quantile(values, .5), p25: quantile(values, .25), p75: quantile(values, .75), p90: quantile(values, .9), values };
  }
  function percentile(row, code) {
    const values = valuesFor(code); const value = Number(score(row, code));
    if (!values.length || !Number.isFinite(value)) return 0;
    let less = 0; let equal = 0;
    values.forEach((item) => { if (item < value) less += 1; else if (item === value) equal += 1; });
    return clamp(((less + Math.max(0, equal - 1) / 2) / Math.max(1, values.length - 1)) * 100, 0, 100);
  }
  function quadrant(row, edition = S.edition) {
    const release = releaseByEdition(edition);
    const means = release?.workbook_means || {};
    const criminalityMean = Number(means.criminality ?? summary("criminality", edition).mean ?? 5);
    const resilienceMean = Number(means.resilience ?? summary("resilience", edition).mean ?? 5);
    const highCrime = Number(score(row, "criminality")) >= criminalityMean;
    const highResilience = Number(score(row, "resilience")) >= resilienceMean;
    if (highCrime && !highResilience) return { key: "critical", label: tr("critical") };
    if (highCrime && highResilience) return { key: "contested", label: tr("contested") };
    if (!highCrime && !highResilience) return { key: "latent", label: tr("latent") };
    return { key: "safeguarded", label: tr("safeguarded") };
  }

  function computeEditionSummary(rows, catalog) {
    const metricSummary = {};
    catalog.forEach((item) => {
      const values = rows.map((row) => Number(score(row, item.indicator_code))).filter(Number.isFinite).sort((a, b) => a - b);
      metricSummary[item.indicator_code] = { count: values.length, minimum: values[0] ?? null, maximum: values.at(-1) ?? null, mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null, median: quantile(values, .5), p25: quantile(values, .25), p75: quantile(values, .75), p90: quantile(values, .9) };
    });
    const gapValues = rows.map((row) => Number(row.vulnerability_gap)).filter(Number.isFinite).sort((a, b) => a - b);
    return { countries: rows.length, continents: [...new Set(rows.map((row) => row.continent).filter(Boolean))].sort(), regions: [...new Set(rows.map((row) => row.region).filter(Boolean))].sort(), metrics: metricSummary, vulnerability_gap: { count: gapValues.length, minimum: gapValues[0] ?? null, maximum: gapValues.at(-1) ?? null, mean: gapValues.length ? gapValues.reduce((sum, value) => sum + value, 0) / gapValues.length : null, median: quantile(gapValues, .5), p25: quantile(gapValues, .25), p75: quantile(gapValues, .75), p90: quantile(gapValues, .9) } };
  }

  function normalizeBackendRows(dataset, catalog, edition) {
    return (dataset.rows || []).map((raw, index) => {
      const scores = {}; const ranks = {}; const tiedRanks = {};
      catalog.filter((item) => item.available_from_edition <= edition).forEach((item) => {
        const metric = raw.metrics?.[item.indicator_code];
        scores[item.indicator_code] = metric?.score == null ? null : Number(metric.score);
        ranks[item.indicator_code] = metric?.rank == null ? null : Number(metric.rank);
        tiedRanks[item.indicator_code] = Boolean(metric?.tied_rank);
      });
      return {
        edition_year: Number(raw.edition_year || edition), reference_year: Number(raw.reference_year), source_order: Number(raw.source_order || index + 1),
        source_sheet: `api_release_${edition}`, continent: raw.continent || "", region: raw.region || "", iso3: String(raw.iso3 || "").toUpperCase(),
        country_name: raw.country_name || raw.iso3, source_country_name: raw.country_name || raw.iso3, scores, ranks, tied_ranks: tiedRanks,
        quality_flag: "official_open_data_api_derived_ranks", row_sha256: raw.row_sha256 || "",
        vulnerability_gap: scores.criminality != null && scores.resilience != null ? Number((scores.criminality - scores.resilience).toFixed(2)) : null,
      };
    }).filter((row) => row.iso3 && row.scores.criminality != null && row.scores.resilience != null);
  }

  async function loadBackend() {
    const [releasePayload, catalogPayload, methodology] = await Promise.all([
      fetchJson(requestUrl("/releases")),
      fetchJson(requestUrl(`/indicators?edition=${LATEST_EDITION}&include_unavailable=true`)),
      fetchJson(requestUrl(`/methodology?edition=${LATEST_EDITION}`)),
    ]);
    const catalog = normalizeCatalog(catalogPayload.indicators);
    const releaseEditions = (releasePayload.releases || []).map((item) => Number(item.edition_year)).filter((value) => EDITIONS.includes(value));
    if (releaseEditions.length !== EDITIONS.length) throw new Error("Backend does not expose all GOCI releases");
    const loaded = await Promise.all(EDITIONS.map(async (edition) => {
      const codes = catalog.filter((item) => item.available_from_edition <= edition).map((item) => item.indicator_code);
      const [dataset, overview] = await Promise.all([
        fetchJson(requestUrl(`/dataset?edition=${edition}&metrics=${encodeURIComponent(codes.join(","))}&limit=193&offset=0`)),
        fetchJson(requestUrl(`?edition=${edition}`)),
      ]);
      const rows = normalizeBackendRows(dataset, catalog, edition);
      if (rows.length !== 193) throw new Error(`Backend GOCI ${edition} returned ${rows.length} rows`);
      return { edition, rows, overview };
    }));
    const rowsByEdition = {}; const summaryByEdition = {}; const releases = [];
    loaded.forEach(({ edition, rows, overview }) => {
      rowsByEdition[String(edition)] = rows;
      summaryByEdition[String(edition)] = computeEditionSummary(rows, catalog.filter((item) => item.available_from_edition <= edition));
      const fromCatalog = releasePayload.releases.find((item) => Number(item.edition_year) === edition) || {};
      releases.push({ ...fromCatalog, ...overview.release, workbook_means: overview.workbook_means, reported_global_averages: overview.publisher_reported_global_averages, available_metric_count: catalog.filter((item) => item.available_from_edition <= edition).length, model_break_from_previous: edition === 2023 });
    });
    return {
      schema_version: 1, frontend_bundle_version: "6.0.0-stage06-api", index: { code: "GOCI", name_en: "Global Organized Crime Index", name_ru: "Глобальный индекс организованной преступности", publisher: methodology.publisher, model: "dual_axis", synthetic_combined_score: false },
      latest_edition_year: LATEST_EDITION, releases: releases.sort((a, b) => b.edition_year - a.edition_year), indicator_catalog: catalog,
      rows_by_edition: rowsByEdition, summary_by_edition: summaryByEdition, methodology: methodology.model || {}, score_scale: methodology.score_scale || {}, comparability: methodology.comparability || {},
      provenance: { ...(methodology.provenance || {}), source_page: methodology.source_page, dataset_url: methodology.dataset_url, report_url: methodology.report_url, methodology_url: methodology.methodology_url, publisher: methodology.publisher, license: methodology.license },
      frontend_safeguards: { two_axes_separate: true, no_synthetic_combined_score: true, vulnerability_gap_status: "gir_derived_diagnostic_criminality_minus_resilience_not_official_score_or_rank", rank_status: "gir_derived_standard_competition_rank_from_official_displayed_score", model_break_2021_to_2023: true },
      data_mode: "backend",
    };
  }
  async function loadStatic() {
    const payload = await fetchJson(assetUrl("goci/goci_frontend_bundle.json"));
    payload.indicator_catalog = normalizeCatalog(payload.indicator_catalog);
    payload.data_mode = "static";
    return payload;
  }
  async function loadData() {
    try { return await loadBackend(); }
    catch (error) { console.info("GOCI backend unavailable; using verified static bundle", error); return loadStatic(); }
  }
  async function loadGeo() {
    if (S.geo) return S.geo;
    const candidates = ["goci/goci-world-geo.json", "world_countries_lite.geojson", "/static/world_countries_lite.geojson", "/world.geojson"];
    let lastError;
    for (const candidate of candidates) {
      try { S.geo = await fetchJson(candidate.startsWith("/") ? candidate : assetUrl(candidate)); return S.geo; }
      catch (error) { lastError = error; }
    }
    console.warn("GOCI map layer unavailable", lastError); return null;
  }

  function ensureSelection() {
    const rows = currentRows();
    const requested = String(S.context?.country || "").toUpperCase();
    const selected = rows.find((row) => row.iso3 === requested) || null;
    S.selectedIso = selected?.iso3 || "";
    if (!S.compare.length) resetComparison(selected);
    S.compare = S.compare.filter((iso3) => rowByIso(iso3)).slice(0, 5);
    if (!S.compare.includes(S.selectedIso)) S.compare = [S.selectedIso, ...S.compare].slice(0, 5);
    if (!itemByCode(S.selectedIndicator) || itemByCode(S.selectedIndicator).available_from_edition > S.edition) {
      S.selectedIndicator = availableCatalog().find((item) => !item.is_composite && item.group_code === "criminal_market")?.indicator_code || "criminality";
    }
    if (!itemByCode(S.rankingMetric) || itemByCode(S.rankingMetric).available_from_edition > S.edition) S.rankingMetric = "criminality";
    if (S.mapMetric !== "vulnerability_gap" && !itemByCode(S.mapMetric)) S.mapMetric = "criminality";
    return selected;
  }
  function resetComparison(selected) {
    const rows = currentRows();
    const highCrime = rows.slice().sort((a, b) => Number(score(b, "criminality")) - Number(score(a, "criminality")))[0];
    const highResilience = rows.slice().sort((a, b) => Number(score(b, "resilience")) - Number(score(a, "resilience")))[0];
    const mean = releaseByEdition()?.workbook_means?.criminality || 5;
    const middle = rows.slice().sort((a, b) => Math.abs(Number(score(a, "criminality")) - mean) - Math.abs(Number(score(b, "criminality")) - mean))[0];
    S.compare = [...new Set([selected?.iso3, highCrime?.iso3, highResilience?.iso3, middle?.iso3].filter(Boolean))].slice(0, 4);
  }
  function setEdition(edition) {
    const next = Number(edition); if (!EDITIONS.includes(next) || next === S.edition) return;
    S.edition = next; S.page = 0; S.continent = ""; S.region = "";
    ensureSelection();
    if (typeof S.context?.setYear === "function") S.context.setYear(next);
    else rerenderAt("goci-top");
  }
  function selectCountry(iso3) {
    const row = rowByIso(iso3); if (!row) return;
    S.selectedIso = row.iso3;
    if (!S.compare.includes(row.iso3)) S.compare = [row.iso3, ...S.compare].slice(0, 5);
    if (typeof S.context?.setCountry === "function") S.context.setCountry(row.iso3);
    else { S.context.country = row.iso3; rerenderAt("goci-top"); }
  }

  function sourceUrl(key) {
    const release = releaseByEdition() || {}; const provenance = S.data?.provenance || {};
    const value = release[key] || release.metadata?.[key] || provenance[key] || "";
    return /^https?:\/\//i.test(value) ? value : "";
  }
  function loadingMarkup() {
    return `<section class="gociw gociw-state" aria-live="polite"><div class="gociw-state-mark" aria-hidden="true">GOCI</div><h1>${esc(tr("loading"))}</h1><p>${esc(tr("loadingText"))}</p><div class="gociw-loader" aria-hidden="true"><i></i><i></i><i></i></div></section>`;
  }
  function errorMarkup(error) {
    return `<section class="gociw gociw-state error"><div class="gociw-state-mark" aria-hidden="true">!</div><h1>${esc(tr("loadError"))}</h1><p>${esc(error?.message || error)}</p><button type="button" class="gociw-button primary" data-goci-action="retry">${esc(tr("retry"))}</button></section>`;
  }
  function sectionHeading(kicker, title, text, id = "") {
    return `<header class="gociw-section-head"${id ? ` id="${esc(id)}"` : ""}><span>${esc(kicker)}</span><div><h2>${esc(title)}</h2><p>${esc(text)}</p></div></header>`;
  }
  function editionRail() {
    return `<section class="gociw-release-rail" aria-label="${esc(tr("edition"))}">${[2021, 2023, 2025].map((edition, index) => {
      const release = releaseByEdition(edition); const active = edition === S.edition;
      return `${index === 1 ? `<div class="gociw-model-break"><i></i><strong>${esc(tr("methodologyBreak"))}</strong><span>${esc(tr("breakText"))}</span></div>` : ""}<button type="button" class="gociw-release-node ${active ? "active" : ""}" data-goci-action="edition" data-edition="${edition}" aria-pressed="${active}"><span>${esc(tr("edition"))}</span><strong>${edition}</strong><small>${esc(tr("referenceYear"))} ${esc(release?.reference_year || edition - 1)} · 193 ${esc(tr("countries"))}</small></button>`;
    }).join("")}</section>`;
  }

  function heroMarkup(selected) {
    const release = releaseByEdition(); const q = quadrant(selected); const crim = score(selected, "criminality"); const res = score(selected, "resilience");
    const report = sourceUrl("report_url"); const data = sourceUrl("dataset_url");
    return `<section class="gociw-hero" id="goci-top" aria-labelledby="gociw-title">
      <div class="gociw-hero-main">
        <div>
          <span class="gociw-overline">${esc(tr("module"))} · ${esc(tr("edition"))} ${S.edition} · ${esc(tr("referenceYear"))} ${esc(release?.reference_year || "—")}</span>
          <h1 id="gociw-title"><span>${esc(tr("acronym"))}</span>${esc(tr("title"))}</h1>
          <p class="gociw-lead">${esc(tr("lead"))}</p>
          <div class="gociw-status-line"><span class="verified">${esc(tr("officialOpenData"))}</span><span>${esc(tr("dualAxis"))}</span><span>193 ${esc(tr("countries"))}</span><span>15 · 5 · 12</span><span>${esc(tr("derivedRanks"))}</span><span>${esc(tr("noCombined"))}</span></div>
        </div>
        <div class="gociw-hero-actions"><button type="button" class="gociw-button primary" data-goci-action="jump" data-target="goci-methodology">${esc(tr("methodology"))}</button>${report ? `<a class="gociw-button" href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("officialReport"))}<span>↗</span></a>` : ""}${data ? `<a class="gociw-button quiet" href="${esc(data)}" target="_blank" rel="noopener noreferrer">${esc(tr("openData"))}<span>↗</span></a>` : ""}</div>
      </div>
      <aside class="gociw-country-cockpit" aria-label="${esc(tr("selectedCountry"))}">
        <header><div>${flag(selected)}<span><strong>${esc(countryName(selected))}</strong><small>${esc(selected.iso3)} · ${esc(release?.reference_year || "")}</small></span></div><button type="button" data-goci-action="evidence" data-iso="${esc(selected.iso3)}">${esc(tr("evidence"))}<span>→</span></button></header>
        <div class="gociw-dual-axis">
          <article class="crime"><span>${esc(tr("criminality"))}</span><strong>${fmt(crim, 2)}</strong><small>#${intFmt(rank(selected, "criminality"))} · ${esc(tr("rankHighScore"))}</small><i><b style="width:${clamp((Number(crim) - 1) / 9 * 100, 0, 100).toFixed(2)}%"></b></i><em>${esc(tr("higherCrime"))}</em></article>
          <div class="gociw-axis-divider"><span>≠</span><small>${esc(tr("noCombined"))}</small></div>
          <article class="resilience"><span>${esc(tr("resilience"))}</span><strong>${fmt(res, 2)}</strong><small>#${intFmt(rank(selected, "resilience"))} · ${esc(tr("rankHighScore"))}</small><i><b style="width:${clamp((Number(res) - 1) / 9 * 100, 0, 100).toFixed(2)}%"></b></i><em>${esc(tr("higherResilience"))}</em></article>
        </div>
        <footer class="${q.key}"><span>${esc(tr("quadrant"))}</span><strong>${esc(q.label)}</strong><small>${esc(tr("vulnerabilityGap"))}: ${signed(selected.vulnerability_gap, 2)}</small></footer>
      </aside>
    </section>`;
  }

  function statsMarkup(selected) {
    const release = releaseByEdition(); const means = release?.workbook_means || {}; const selectedIndicator = itemByCode(S.selectedIndicator);
    return `<section class="gociw-stat-grid" aria-label="${esc(tr("overviewTitle"))}">
      <article class="crime"><span>${esc(tr("criminality"))}</span><strong>${fmt(score(selected, "criminality"), 2)}</strong><p>${esc(tr("worldAverage"))} ${fmt(means.criminality, 2)} · #${intFmt(rank(selected, "criminality"))}</p></article>
      <article class="resilience"><span>${esc(tr("resilience"))}</span><strong>${fmt(score(selected, "resilience"), 2)}</strong><p>${esc(tr("worldAverage"))} ${fmt(means.resilience, 2)} · #${intFmt(rank(selected, "resilience"))}</p></article>
      <article><span>${esc(tr("criminalMarkets"))}</span><strong>${fmt(score(selected, "criminal_markets"), 2)}</strong><p>15 ${esc(tr("markets").toLowerCase())}</p></article>
      <article><span>${esc(tr("criminalActors"))}</span><strong>${fmt(score(selected, "criminal_actors"), 2)}</strong><p>5 ${esc(tr("actors").toLowerCase())}</p></article>
      <article class="wide"><span>${esc(metricName(selectedIndicator))}</span><strong>${fmt(score(selected, S.selectedIndicator), 2)}</strong><p>#${intFmt(rank(selected, S.selectedIndicator))} · ${esc(metricDirectionLabel(S.selectedIndicator))}</p></article>
    </section>`;
  }

  function overviewMarkup(selected) {
    const q = quadrant(selected); const release = releaseByEdition(); const means = release?.workbook_means || {};
    const row = (code, klass) => { const value = Number(score(selected, code)); const average = Number(means[code]); return `<div class="gociw-overview-row ${klass}"><header><span>${esc(code === "criminality" ? tr("criminality") : tr("resilience"))}</span><strong>${fmt(value, 2)}</strong></header><div><i style="width:${clamp((value - 1) / 9 * 100, 0, 100).toFixed(2)}%"></i><b style="left:${clamp((average - 1) / 9 * 100, 0, 100).toFixed(2)}%" title="${esc(tr("worldAverage"))} ${fmt(average, 2)}"></b></div><footer><span>1</span><em>${esc(tr("worldAverage"))} ${fmt(average, 2)}</em><span>10</span></footer></div>`; };
    return `<section class="gociw-overview-section">
      ${sectionHeading(tr("overviewKicker"), tr("overviewTitle"), tr("overviewText"), "goci-overview")}
      <div class="gociw-overview-grid"><div class="gociw-overview-lanes">${row("criminality", "crime")}${row("resilience", "resilience")}<div class="gociw-gap-note"><span>${esc(tr("vulnerabilityGap"))}</span><strong>${signed(selected.vulnerability_gap, 2)}</strong><p>${esc(tr("vulnerabilityGapNote"))}</p></div></div><aside class="gociw-quadrant-card ${q.key}"><span>${esc(tr("quadrant"))}</span><strong>${esc(q.label)}</strong><div class="gociw-quadrant-mini"><i style="left:${clamp((Number(score(selected, "criminality")) - 1) / 9 * 100, 0, 100).toFixed(2)}%;bottom:${clamp((Number(score(selected, "resilience")) - 1) / 9 * 100, 0, 100).toFixed(2)}%"></i></div><p>${esc(tr("matrixDiagnostic"))}</p></aside></div>
    </section>`;
  }

  function matrixMarkup(selected) {
    const rows = currentRows(); const release = releaseByEdition(); const means = release?.workbook_means || {}; const width = 920; const height = 530; const margin = { left: 72, right: 36, top: 34, bottom: 64 };
    const plotW = width - margin.left - margin.right; const plotH = height - margin.top - margin.bottom;
    const x = (value) => margin.left + ((Number(value) - 1) / 9) * plotW;
    const y = (value) => margin.top + (1 - (Number(value) - 1) / 9) * plotH;
    const xMean = x(means.criminality || 5); const yMean = y(means.resilience || 5);
    const grid = [1,2,3,4,5,6,7,8,9,10].map((value) => `<line x1="${x(value)}" x2="${x(value)}" y1="${margin.top}" y2="${margin.top + plotH}"/><line x1="${margin.left}" x2="${margin.left + plotW}" y1="${y(value)}" y2="${y(value)}"/><text x="${x(value)}" y="${height - 29}" text-anchor="middle">${value}</text><text x="${margin.left - 15}" y="${y(value) + 3}" text-anchor="end">${value}</text>`).join("");
    const points = rows.map((row) => { const q = quadrant(row); const active = row.iso3 === selected.iso3; return `<circle class="gociw-matrix-point ${q.key}${active ? " selected" : ""}" cx="${x(score(row, "criminality")).toFixed(2)}" cy="${y(score(row, "resilience")).toFixed(2)}" r="${active ? 8 : 3.7}" tabindex="${active ? "0" : "-1"}" role="button" data-goci-action="matrix-country" data-iso="${esc(row.iso3)}" aria-label="${esc(`${countryName(row)}: ${tr("criminality")} ${fmt(score(row, "criminality"), 2)}, ${tr("resilience")} ${fmt(score(row, "resilience"), 2)}`)}"></circle>`; }).join("");
    return `<section class="gociw-matrix-section">
      ${sectionHeading(tr("matrixKicker"), tr("matrixTitle"), tr("matrixText"), "goci-matrix")}
      <div class="gociw-matrix-layout"><div class="gociw-matrix-card"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("matrixTitle"))}"><g class="grid">${grid}</g><rect class="quadrant safeguarded" x="${margin.left}" y="${margin.top}" width="${xMean-margin.left}" height="${yMean-margin.top}"></rect><rect class="quadrant contested" x="${xMean}" y="${margin.top}" width="${margin.left+plotW-xMean}" height="${yMean-margin.top}"></rect><rect class="quadrant latent" x="${margin.left}" y="${yMean}" width="${xMean-margin.left}" height="${margin.top+plotH-yMean}"></rect><rect class="quadrant critical" x="${xMean}" y="${yMean}" width="${margin.left+plotW-xMean}" height="${margin.top+plotH-yMean}"></rect><line class="mean crime" x1="${xMean}" x2="${xMean}" y1="${margin.top}" y2="${margin.top+plotH}"></line><line class="mean resilience" x1="${margin.left}" x2="${margin.left+plotW}" y1="${yMean}" y2="${yMean}"></line><g class="points">${points}</g><text class="axis-title x" x="${margin.left+plotW/2}" y="${height-3}" text-anchor="middle">${esc(tr("criminality"))} →</text><text class="axis-title y" transform="translate(16 ${margin.top+plotH/2}) rotate(-90)" text-anchor="middle">${esc(tr("resilience"))} →</text><text class="q-label safeguarded" x="${margin.left+18}" y="${margin.top+24}">${esc(tr("safeguarded"))}</text><text class="q-label contested" x="${xMean+18}" y="${margin.top+24}">${esc(tr("contested"))}</text><text class="q-label latent" x="${margin.left+18}" y="${yMean+28}">${esc(tr("latent"))}</text><text class="q-label critical" x="${xMean+18}" y="${yMean+28}">${esc(tr("critical"))}</text></svg><div class="gociw-matrix-tooltip" role="status" hidden></div></div><aside class="gociw-matrix-readout"><span>${esc(tr("selectedCountry"))}</span><div class="gociw-country-ident">${flag(selected, "gociw-flag small")}<strong>${esc(countryName(selected))}</strong><small>${esc(selected.iso3)}</small></div><dl><div><dt>${esc(tr("criminality"))}</dt><dd>${fmt(score(selected, "criminality"), 2)}</dd></div><div><dt>${esc(tr("resilience"))}</dt><dd>${fmt(score(selected, "resilience"), 2)}</dd></div><div><dt>${esc(tr("vulnerabilityGap"))}</dt><dd>${signed(selected.vulnerability_gap, 2)}</dd></div></dl><strong class="gociw-q-label ${quadrant(selected).key}">${esc(quadrant(selected).label)}</strong><p>${esc(tr("matrixDiagnostic"))}</p></aside></div>
    </section>`;
  }

  function geoIso(feature) {
    const properties = feature?.properties || {}; const candidates = [properties.iso3, properties.iso_a3, properties.ISO_A3, properties.adm0_a3, properties.ADM0_A3, properties.sov_a3, properties.id, feature?.id];
    const aliases = { KOS: "XKX" }; const value = String(candidates.find((item) => item && String(item).length === 3 && item !== "-99") || "").toUpperCase(); return aliases[value] ?? value;
  }
  function splitRing(ring) {
    if (!Array.isArray(ring) || ring.length < 2) return [];
    const chunks = [[]]; for (let index = 0; index < ring.length; index += 1) { const point = ring[index]; const previous = ring[index - 1]; if (previous && Math.abs(Number(point[0]) - Number(previous[0])) > 180) chunks.push([]); chunks[chunks.length - 1].push(point); }
    return chunks.filter((chunk) => chunk.length >= 3);
  }
  function project(point, width, height) { const lon = clamp(Number(point[0]), -180, 180); const lat = clamp(Number(point[1]), -90, 90); return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height]; }
  function ringPath(ring, width, height) { return splitRing(ring).map((chunk) => chunk.map((point, index) => { const [x, y] = project(point, width, height); return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z").join(" "); }
  function geometryPath(geometry, width, height) {
    if (!geometry) return ""; if (geometry.type === "Polygon") return geometry.coordinates.map((ring) => ringPath(ring, width, height)).join(" ");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map((ring) => ringPath(ring, width, height)).join(" ")).join(" "); return "";
  }
  function quantileCuts(code, bins = 7) { const values = valuesFor(code); return Array.from({ length: bins - 1 }, (_, index) => values[Math.round((values.length - 1) * ((index + 1) / bins))]); }
  function quantileClass(value, cuts) { if (!Number.isFinite(Number(value))) return "nodata"; let index = 0; while (index < cuts.length && Number(value) > cuts[index]) index += 1; return `q${index + 1}`; }
  function mapMetricLabel(code) { if (code === "vulnerability_gap") return tr("vulnerabilityGap"); return metricName(itemByCode(code)); }
  function mapMarkup(selected) {
    const code = S.mapMetric === "selected_indicator" ? S.selectedIndicator : S.mapMetric; const cuts = quantileCuts(code); const features = Array.isArray(S.geo?.features) ? S.geo.features : [];
    const polygonIsos = new Set(features.map(geoIso).filter(Boolean));
    const paths = features.map((feature) => { const iso3 = geoIso(feature); const row = rowByIso(iso3); const path = geometryPath(feature.geometry, 1000, 510); if (!path) return ""; const value = score(row, code); const klass = row ? quantileClass(value, cuts) : "nodata"; const selectedClass = row?.iso3 === selected.iso3 ? " selected" : ""; return `<path class="gociw-map-country ${klass}${selectedClass}" d="${path}" data-goci-action="map-country" data-iso="${esc(iso3)}" tabindex="${row?.iso3 === selected.iso3 ? "0" : "-1"}" role="button" aria-label="${esc(row ? `${countryName(row)}: ${fmt(value, 2)}` : tr("noData"))}" ${row ? "" : "aria-disabled=\"true\""}></path>`; }).join("");
    const points = (Array.isArray(S.geo?.points) ? S.geo.points : []).filter((point) => !point.has_polygon || !polygonIsos.has(String(point.iso3 || "").toUpperCase())).map((point) => { const iso3 = String(point.iso3 || "").toUpperCase(); const row = rowByIso(iso3); if (!row || !Number.isFinite(Number(point.lon)) || !Number.isFinite(Number(point.lat))) return ""; const [x, y] = project([point.lon, point.lat], 1000, 510); const value = score(row, code); const klass = quantileClass(value, cuts); const selectedClass = row.iso3 === selected.iso3 ? " selected" : ""; return `<circle class="gociw-map-country gociw-map-point ${klass}${selectedClass}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${row.iso3 === selected.iso3 ? "5.8" : "3.8"}" data-goci-action="map-country" data-iso="${esc(iso3)}" tabindex="${row.iso3 === selected.iso3 ? "0" : "-1"}" role="button" aria-label="${esc(`${countryName(row)}: ${fmt(value, 2)}`)}"></circle>`; }).join("");
    const metricButtons = ["criminality", "resilience", "vulnerability_gap", "selected_indicator"].map((key) => `<button type="button" class="${S.mapMetric === key ? "active" : ""}" data-goci-action="map-metric" data-metric="${key}" aria-pressed="${S.mapMetric === key}">${esc(key === "selected_indicator" ? `${tr("selectedIndicator")}: ${metricName(itemByCode(S.selectedIndicator))}` : mapMetricLabel(key))}</button>`).join("");
    const topRows = currentRows().filter((row) => Number.isFinite(Number(score(row, code)))).sort((a, b) => Number(score(b, code)) - Number(score(a, code))).slice(0, 10);
    const scaleClass = isResilienceMetric(code) ? "resilience" : isDiagnosticMetric(code) ? "gap" : "crime";
    return `<section class="gociw-map-section ${scaleClass}">
      ${sectionHeading(tr("mapKicker"), tr("mapTitle"), tr("mapText"), "goci-map")}
      <div class="gociw-map-toolbar"><span>${esc(tr("mapMetric"))}</span><div>${metricButtons}</div></div>
      <div class="gociw-map-layout"><div class="gociw-map-card">${features.length || points ? `<div class="gociw-map-wrap"><svg viewBox="0 0 1000 510" role="img" aria-label="${esc(`${tr("mapTitle")}: ${mapMetricLabel(code)}`)}"><g class="gociw-map-polygons">${paths}</g><g class="gociw-map-points">${points}</g></svg><div class="gociw-tooltip" role="status" hidden></div></div>` : `<div class="gociw-map-unavailable"><strong>${esc(tr("mapUnavailable"))}</strong></div>`}<div class="gociw-map-legend"><span>${esc(tr("low"))}</span><i>${Array.from({ length: 7 }, (_, index) => `<b class="q${index + 1}"></b>`).join("")}</i><span>${esc(tr("high"))}</span><em>${esc(tr("keyboardMap"))}</em></div></div><aside class="gociw-map-rank"><header><span>${esc(mapMetricLabel(code))}</span><strong>TOP 10</strong></header><ol>${topRows.map((row) => `<li><button type="button" data-goci-action="country" data-iso="${esc(row.iso3)}"><span>${flag(row, "gociw-flag tiny")}${esc(countryName(row))}</span><strong>${fmt(score(row, code), 2)}</strong></button></li>`).join("")}</ol><details><summary>${esc(tr("textMap"))}</summary><table><tbody>${currentRows().map((row) => `<tr><td>${esc(countryName(row))}</td><td>${fmt(score(row, code), 2)}</td></tr>`).join("")}</tbody></table></details></aside></div>
    </section>`;
  }

  function groupLabel(group) { return ({ criminal_market: tr("markets"), criminal_actor: tr("actors"), resilience: tr("safeguards"), composite: tr("allIndicators") })[group] || group; }
  function indicatorGroups() { return ["criminal_market", "criminal_actor", "resilience"]; }
  function architectureMarkup(selected) {
    const catalog = availableCatalog(); const detail = catalog.filter((item) => !item.is_composite);
    const groupTabs = ["all", ...indicatorGroups()].map((group) => `<button type="button" class="${S.indicatorGroup === group ? "active" : ""}" data-goci-action="indicator-group" data-group="${group}" aria-pressed="${S.indicatorGroup === group}">${esc(group === "all" ? tr("allIndicators") : groupLabel(group))}<span>${group === "all" ? detail.length : detail.filter((item) => item.group_code === group).length}</span></button>`).join("");
    const visible = detail.filter((item) => S.indicatorGroup === "all" || item.group_code === S.indicatorGroup);
    const cards = visible.map((item) => { const value = score(selected, item.indicator_code); const active = item.indicator_code === S.selectedIndicator; const positive = item.group_code === "resilience"; return `<button type="button" class="gociw-indicator-card ${positive ? "positive" : "risk"} ${active ? "active" : ""}" data-goci-action="indicator" data-indicator="${esc(item.indicator_code)}" aria-pressed="${active}"><span><i>${esc(groupLabel(item.group_code))}</i><strong>${esc(metricName(item))}</strong></span><b>${fmt(value, 2)}</b><em><i style="width:${clamp((Number(value) - 1) / 9 * 100, 0, 100).toFixed(2)}%"></i></em><small>#${intFmt(rank(selected, item.indicator_code))}</small></button>`; }).join("");
    const risks = detail.filter((item) => item.group_code !== "resilience").map((item) => ({ item, value: Number(score(selected, item.indicator_code)) })).filter((entry) => Number.isFinite(entry.value)).sort((a,b) => b.value-a.value).slice(0,5);
    const strengths = detail.filter((item) => item.group_code === "resilience").map((item) => ({ item, value: Number(score(selected, item.indicator_code)) })).filter((entry) => Number.isFinite(entry.value)).sort((a,b) => b.value-a.value).slice(0,5);
    const markets = Number(score(selected, "criminal_markets")); const actors = Number(score(selected, "criminal_actors")); const resilience = Number(score(selected, "resilience"));
    const topList = (items, klass) => `<ol class="${klass}">${items.map((entry) => `<li><button type="button" data-goci-action="indicator" data-indicator="${esc(entry.item.indicator_code)}"><span>${esc(metricName(entry.item))}</span><strong>${fmt(entry.value, 2)}</strong></button></li>`).join("")}</ol>`;
    return `<section class="gociw-architecture-section">
      ${sectionHeading(tr("architectureKicker"), tr("architectureTitle"), tr("architectureText"), "goci-architecture")}
      <div class="gociw-architecture-overview"><div class="gociw-pyramid" aria-label="${esc(tr("architectureTitle"))}"><div class="gociw-pyramid-stage actors" style="--score:${actors}"><span>${esc(tr("actors"))}</span><strong>${fmt(actors,2)}</strong><small>5</small></div><div class="gociw-pyramid-stage markets" style="--score:${markets}"><span>${esc(tr("markets"))}</span><strong>${fmt(markets,2)}</strong><small>${releaseByEdition()?.criminal_market_count || 15}</small></div><div class="gociw-resilience-tower" style="--score:${resilience}"><span>${esc(tr("safeguards"))}</span><strong>${fmt(resilience,2)}</strong><small>12</small><i></i></div><div class="gociw-pyramid-caption"><span>${esc(tr("criminality"))}</span><strong>${fmt(score(selected,"criminality"),2)}</strong></div></div><div class="gociw-frontiers"><article><header><span>${esc(tr("topRisks"))}</span><strong>${esc(tr("risks"))}</strong></header>${topList(risks, "risks")}</article><article><header><span>${esc(tr("topStrengths"))}</span><strong>${esc(tr("strengths"))}</strong></header>${topList(strengths, "strengths")}</article></div></div>
      <div class="gociw-indicator-explorer"><header><div><span>${esc(tr("indicatorExplorer"))}</span><strong>${esc(countryName(selected))}</strong></div><p>${esc(tr("clickIndicator"))}</p></header><nav>${groupTabs}</nav><div class="gociw-indicator-grid">${cards}</div></div>
    </section>`;
  }

  function historyMarkup(selected) {
    const history = EDITIONS.slice().reverse().map((edition) => rowByIso(selected.iso3, edition)).filter(Boolean); const width = 760; const height = 330; const positions = [100, 380, 660]; const y = (value) => 35 + (1 - (Number(value) - 1) / 9) * 230;
    const crimPoints = history.map((row, index) => `${positions[index]},${y(score(row,"criminality"))}`); const resPoints = history.map((row,index) => `${positions[index]},${y(score(row,"resilience"))}`);
    const grid = [1,2,3,4,5,6,7,8,9,10].map((value) => `<line x1="65" x2="705" y1="${y(value)}" y2="${y(value)}"></line><text x="50" y="${y(value)+4}" text-anchor="end">${value}</text>`).join("");
    const releaseCards = history.map((row) => { const active = row.edition_year === S.edition; const criminalityComparable = row.edition_year !== 2021; return `<button type="button" class="gociw-history-card ${active ? "active" : ""}" data-goci-action="edition" data-edition="${row.edition_year}"><span>${esc(tr("edition"))} ${row.edition_year}</span><strong>${esc(tr("referenceYear"))} ${row.reference_year}</strong><dl><div><dt>${esc(tr("criminality"))}</dt><dd>${fmt(score(row,"criminality"),2)}</dd></div><div><dt>${esc(tr("resilience"))}</dt><dd>${fmt(score(row,"resilience"),2)}</dd></div></dl><small>${criminalityComparable ? esc(tr("comparable")) : esc(tr("notComparable"))}</small></button>`; }).join("");
    const current = rowByIso(selected.iso3, S.edition); const previous = S.edition === 2025 ? rowByIso(selected.iso3, 2023) : S.edition === 2023 ? rowByIso(selected.iso3, 2021) : null;
    const crimChange = previous && S.edition === 2025 ? Number(score(current,"criminality"))-Number(score(previous,"criminality")) : null; const resChange = previous ? Number(score(current,"resilience"))-Number(score(previous,"resilience")) : null;
    return `<section class="gociw-history-section">
      ${sectionHeading(tr("historyKicker"), tr("historyTitle"), tr("historyText"), "goci-history")}
      <div class="gociw-history-layout"><div class="gociw-history-chart"><header><span>${esc(countryName(selected))}</span><div><i class="crime"></i>${esc(tr("criminality"))}<i class="resilience"></i>${esc(tr("resilience"))}</div></header><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("historyTitle"))}"><g class="grid">${grid}</g><rect class="break-zone" x="226" y="35" width="28" height="230"></rect><text class="break-label" transform="translate(244 151) rotate(-90)" text-anchor="middle">${esc(tr("methodologyBreak"))}</text><polyline class="resilience-line" points="${resPoints.join(" ")}"></polyline><polyline class="crime-line comparable" points="${crimPoints.slice(1).join(" ")}"></polyline><line class="crime-break" x1="${crimPoints[0].split(",")[0]}" y1="${crimPoints[0].split(",")[1]}" x2="${crimPoints[1].split(",")[0]}" y2="${crimPoints[1].split(",")[1]}"></line>${history.map((row,index) => `<circle class="crime" cx="${positions[index]}" cy="${y(score(row,"criminality"))}" r="6"></circle><circle class="resilience" cx="${positions[index]}" cy="${y(score(row,"resilience"))}" r="6"></circle><text class="year" x="${positions[index]}" y="302" text-anchor="middle">${row.edition_year}</text>`).join("")}</svg><footer><div><span>${esc(tr("criminality"))}</span><strong>${crimChange == null ? esc(tr("noTrend")) : signed(crimChange,2)}</strong></div><div><span>${esc(tr("resilience"))}</span><strong>${resChange == null ? "—" : signed(resChange,2)}</strong></div></footer></div><aside><div class="gociw-break-callout"><span>${esc(tr("methodologyBreak"))}</span><strong>${esc(tr("breakText"))}</strong><p>${esc(tr("breakMethodText"))}</p></div><div class="gociw-history-cards">${releaseCards}</div></aside></div>
    </section>`;
  }

  function comparisonMarkup(selected) {
    const rows = S.compare.map((iso3) => rowByIso(iso3)).filter(Boolean); const options = currentRows().filter((row) => !S.compare.includes(row.iso3)).sort((a,b) => countryName(a).localeCompare(countryName(b))).map((row) => `<option value="${esc(row.iso3)}">${esc(countryName(row))} · ${esc(row.iso3)}</option>`).join("");
    const width=720,height=430,margin=55,plotW=610,plotH=320; const x=(v)=>margin+((Number(v)-1)/9)*plotW; const y=(v)=>35+(1-(Number(v)-1)/9)*plotH; const release=releaseByEdition(); const xm=x(release?.workbook_means?.criminality||5); const ym=y(release?.workbook_means?.resilience||5);
    return `<section class="gociw-comparison-section">
      ${sectionHeading(tr("comparisonKicker"), tr("comparisonTitle"), tr("comparisonText"), "goci-comparison")}
      <div class="gociw-compare-controls"><label><span>${esc(tr("addCountry"))}</span><select id="gociCompareSelect">${options}</select></label><button type="button" class="gociw-button primary" data-goci-action="add-compare" ${rows.length>=5||!options?"disabled":""}>${esc(tr("add"))}</button><button type="button" class="gociw-button quiet" data-goci-action="reset-compare">${esc(tr("reset"))}</button></div>
      <div class="gociw-comparison-grid"><div class="gociw-compare-matrix"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("comparisonTitle"))}"><line class="axis" x1="${xm}" x2="${xm}" y1="35" y2="355"></line><line class="axis" x1="55" x2="665" y1="${ym}" y2="${ym}"></line>${rows.map((row,index)=>`<g class="country c${index}"><circle cx="${x(score(row,"criminality"))}" cy="${y(score(row,"resilience"))}" r="12"></circle><text x="${x(score(row,"criminality"))+16}" y="${y(score(row,"resilience"))+4}">${esc(row.iso3)}</text></g>`).join("")}<text class="x-title" x="360" y="410" text-anchor="middle">${esc(tr("criminality"))} →</text><text class="y-title" transform="translate(16 195) rotate(-90)" text-anchor="middle">${esc(tr("resilience"))} →</text></svg></div><div class="gociw-compare-cards">${rows.map((row,index)=>`<article class="c${index}"><header>${flag(row,"gociw-flag small")}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)}</small></span>${rows.length>2?`<button type="button" data-goci-action="remove-compare" data-iso="${esc(row.iso3)}" aria-label="${esc(tr("remove"))}">×</button>`:""}</header><dl><div><dt>${esc(tr("criminality"))}</dt><dd>${fmt(score(row,"criminality"),2)} <small>#${intFmt(rank(row,"criminality"))}</small></dd></div><div><dt>${esc(tr("resilience"))}</dt><dd>${fmt(score(row,"resilience"),2)} <small>#${intFmt(rank(row,"resilience"))}</small></dd></div><div><dt>${esc(tr("vulnerabilityGap"))}</dt><dd>${signed(row.vulnerability_gap,2)}</dd></div><div><dt>${esc(metricName(itemByCode(S.selectedIndicator)))}</dt><dd>${fmt(score(row,S.selectedIndicator),2)}</dd></div></dl><footer class="${quadrant(row).key}">${esc(quadrant(row).label)}</footer></article>`).join("")}</div></div>
      <div class="gociw-exact-table"><table><thead><tr><th>${esc(tr("country"))}</th><th>${esc(tr("criminality"))}</th><th>${esc(tr("resilience"))}</th><th>${esc(tr("criminalMarkets"))}</th><th>${esc(tr("criminalActors"))}</th><th>${esc(metricName(itemByCode(S.selectedIndicator)))}</th></tr></thead><tbody>${rows.map((row)=>`<tr><td>${flag(row,"gociw-flag tiny")} ${esc(countryName(row))}</td><td>${fmt(score(row,"criminality"),2)}</td><td>${fmt(score(row,"resilience"),2)}</td><td>${fmt(score(row,"criminal_markets"),2)}</td><td>${fmt(score(row,"criminal_actors"),2)}</td><td>${fmt(score(row,S.selectedIndicator),2)}</td></tr>`).join("")}</tbody></table></div>
    </section>`;
  }

  function filteredRanking() {
    const code=S.rankingMetric; const q=S.query.trim().toLocaleLowerCase();
    const rows=currentRows().filter((row)=>{ const matchQ=!q||countryName(row).toLocaleLowerCase().includes(q)||row.iso3.toLowerCase().includes(q); return matchQ&&(!S.continent||row.continent===S.continent)&&(!S.region||row.region===S.region)&&score(row,code)!=null; });
    const direction=S.direction==="desc"?-1:1;
    rows.sort((a,b)=>{ let av,bv; if(S.sort==="country"){av=countryName(a);bv=countryName(b);return av.localeCompare(bv)*(direction);} if(S.sort==="score"){av=Number(score(a,code));bv=Number(score(b,code));} else {av=Number(rank(a,code));bv=Number(rank(b,code));} return ((av??Infinity)-(bv??Infinity))*direction||Number(a.source_order)-Number(b.source_order); });
    return rows;
  }
  function rankingMarkup() {
    const catalog=availableCatalog(); const rows=filteredRanking(); const pages=Math.max(1,Math.ceil(rows.length/S.pageSize)); S.page=clamp(S.page,0,pages-1); const slice=rows.slice(S.page*S.pageSize,(S.page+1)*S.pageSize); const metric=itemByCode(S.rankingMetric); const continents=S.data.summary_by_edition?.[String(S.edition)]?.continents||[...new Set(currentRows().map((row)=>row.continent).filter(Boolean))].sort(); const regions=[...new Set(currentRows().filter((row)=>!S.continent||row.continent===S.continent).map((row)=>row.region).filter(Boolean))].sort();
    const metricOptions=catalog.map((item)=>`<option value="${esc(item.indicator_code)}" ${item.indicator_code===S.rankingMetric?"selected":""}>${esc(metricName(item))}</option>`).join("");
    return `<section class="gociw-ranking-section">
      ${sectionHeading(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"), "goci-ranking")}
      <div class="gociw-ranking-toolbar"><label class="metric"><span>${esc(tr("metric"))}</span><select id="gociRankingMetric">${metricOptions}</select></label><label class="search"><span>${esc(tr("search"))}</span><input id="gociRankingSearch" value="${esc(S.query)}" placeholder="${esc(tr("search"))}"></label><label><span>${esc(tr("continent"))}</span><select id="gociContinent"><option value="">${esc(tr("allContinents"))}</option>${continents.map((value)=>`<option ${value===S.continent?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label><span>${esc(tr("region"))}</span><select id="gociRegion"><option value="">${esc(tr("allRegions"))}</option>${regions.map((value)=>`<option ${value===S.region?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label><span>${esc(tr("sortBy"))}</span><select id="gociSort"><option value="rank" ${S.sort==="rank"?"selected":""}>${esc(tr("byRank"))}</option><option value="score" ${S.sort==="score"?"selected":""}>${esc(tr("byScore"))}</option><option value="country" ${S.sort==="country"?"selected":""}>${esc(tr("byCountry"))}</option></select></label><label><span>${esc(tr("direction"))}</span><select id="gociDirection"><option value="asc" ${S.direction==="asc"?"selected":""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction==="desc"?"selected":""}>${esc(tr("descending"))}</option></select></label><button type="button" class="gociw-button" data-goci-action="export-static">${esc(tr("exportCsv"))}<span>↓</span></button></div>
      <div class="gociw-ranking-meta"><span>${esc(metricName(metric))}</span><strong>${intFmt(rows.length)} / ${intFmt(currentRows().length)}</strong><em>${esc(metricDirectionLabel(S.rankingMetric))}</em><small>${esc(tr("scoreOfficial"))} · ${esc(tr("rankDerived"))}</small></div>
      <div class="gociw-table-wrap"><table class="gociw-ranking-table"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("country"))}</th><th>${esc(metricName(metric))}</th><th>${esc(tr("criminality"))}</th><th>${esc(tr("resilience"))}</th><th>${esc(tr("profile"))}</th><th></th></tr></thead><tbody>${slice.length?slice.map((row)=>`<tr class="${row.iso3===S.selectedIso?"selected":""}"><td><strong>#${intFmt(rank(row,S.rankingMetric))}</strong>${row.tied_ranks?.[S.rankingMetric]?`<small>=</small>`:""}</td><td><button type="button" class="country" data-goci-action="country" data-iso="${esc(row.iso3)}">${flag(row,"gociw-flag tiny")}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)} · ${esc(row.region)}</small></span></button></td><td><strong>${fmt(score(row,S.rankingMetric),2)}</strong><small>${esc(metricDirectionLabel(S.rankingMetric))}</small></td><td><span class="score crime">${fmt(score(row,"criminality"),2)}</span><small>#${intFmt(rank(row,"criminality"))}</small></td><td><span class="score resilience">${fmt(score(row,"resilience"),2)}</span><small>#${intFmt(rank(row,"resilience"))}</small></td><td><span class="gociw-profile-pill ${quadrant(row).key}">${esc(quadrant(row).label)}</span></td><td><button type="button" class="evidence" data-goci-action="evidence" data-iso="${esc(row.iso3)}" aria-label="${esc(`${tr("evidence")}: ${countryName(row)}`)}">→</button></td></tr>`).join(""):`<tr><td colspan="7" class="empty">${esc(tr("zeroResults"))}</td></tr>`}</tbody></table></div>
      <footer class="gociw-pagination"><label><span>${esc(tr("rowsPerPage"))}</span><select id="gociPageSize">${[10,25,50,100].map((value)=>`<option value="${value}" ${value===S.pageSize?"selected":""}>${value}</option>`).join("")}</select></label><div><button type="button" data-goci-action="previous-page" ${S.page===0?"disabled":""}>← ${esc(tr("previous"))}</button><span>${esc(tr("page"))} <strong>${S.page+1}</strong> ${esc(tr("of"))} ${pages}</span><button type="button" data-goci-action="next-page" ${S.page>=pages-1?"disabled":""}>${esc(tr("next"))} →</button></div></footer>
    </section>`;
  }

  function methodologyMarkup() {
    return `<section class="gociw-methodology-section">
      ${sectionHeading(tr("methodologyKicker"), tr("methodologyTitle"), tr("methodologyText"), "goci-methodology")}
      <div class="gociw-methodology-grid"><article><span>01</span><strong>${esc(tr("noSyntheticTitle"))}</strong><p>${esc(tr("noSyntheticText"))}</p></article><article><span>02</span><strong>${esc(tr("rankTitle"))}</strong><p>${esc(tr("rankText"))}</p></article><article><span>03</span><strong>${esc(tr("breakTitle"))}</strong><p>${esc(tr("breakMethodText"))}</p></article><article><span>04</span><strong>${esc(tr("provenanceTitle"))}</strong><p>${esc(tr("provenanceText"))}</p></article></div>
      <footer class="gociw-methodology-foot"><div><span>${esc(tr("sourceMode"))}</span><strong>${esc(S.data.data_mode==="backend"?tr("backend"):tr("staticSnapshot"))}</strong></div><div><span>${esc(tr("publisher"))}</span><strong>${esc(S.data.index?.publisher||S.data.provenance?.publisher||"GI-TOC")}</strong></div><div><span>${esc(tr("frontendVersion"))}</span><strong>${esc(S.data.frontend_bundle_version||"6.0.0-stage06")}</strong></div></footer>
    </section>`;
  }

  function evidenceMarkup(row) {
    const release=releaseByEdition(); const provenance=S.data.provenance||{}; const metric=itemByCode(S.rankingMetric); const model=`${release?.criminal_market_count||"—"} + ${release?.criminal_actor_count||"—"} + ${release?.resilience_indicator_count||"—"}`;
    const source=sourceUrl("source_page")||sourceUrl("dataset_url"); const report=sourceUrl("report_url");
    const field=(label,value,copy=false)=>`<div><dt>${esc(label)}</dt><dd>${esc(value??"—")}${copy&&value?`<button type="button" data-goci-action="copy" data-copy="${esc(value)}">${esc(tr("copy"))}</button>`:""}</dd></div>`;
    return `<dialog class="gociw-dialog" id="gociEvidenceDialog" aria-labelledby="gociEvidenceTitle"><div class="gociw-dialog-shell"><header><div>${flag(row)}<span><small>${esc(tr("evidence"))}</small><h2 id="gociEvidenceTitle">${esc(countryName(row))}</h2><p>${esc(row.iso3)} · ${esc(tr("edition"))} ${S.edition} · ${esc(tr("referenceYear"))} ${esc(row.reference_year)}</p></span></div><button type="button" data-goci-action="close-dialog" aria-label="${esc(tr("close"))}">×</button></header><div class="gociw-dialog-score"><article class="crime"><span>${esc(tr("criminality"))}</span><strong>${fmt(score(row,"criminality"),2)}</strong><small>#${intFmt(rank(row,"criminality"))}</small></article><article class="resilience"><span>${esc(tr("resilience"))}</span><strong>${fmt(score(row,"resilience"),2)}</strong><small>#${intFmt(rank(row,"resilience"))}</small></article><article><span>${esc(metricName(metric))}</span><strong>${fmt(score(row,S.rankingMetric),2)}</strong><small>#${intFmt(rank(row,S.rankingMetric))}</small></article></div><div class="gociw-dialog-body"><section><h3>${esc(tr("values"))}</h3><dl>${field(tr("criminalMarkets"),fmt(score(row,"criminal_markets"),2))}${field(tr("criminalActors"),fmt(score(row,"criminal_actors"),2))}${field(tr("vulnerabilityGap"),signed(row.vulnerability_gap,2))}${field(tr("quadrant"),quadrant(row).label)}${field(tr("scoreStatus"),provenance.score_status||"official_open_data_workbook_values")}${field(tr("rankStatus"),provenance.rank_status||S.data.frontend_safeguards?.rank_status)}</dl></section><section><h3>Provenance</h3><dl>${field(tr("publisher"),S.data.index?.publisher||"GI-TOC")}${field(tr("published"),release?.published_at||provenance.published_at)}${field(tr("retrieved"),provenance.retrieved_at)}${field(tr("sourceSheet"),row.source_sheet)}${field(tr("sourceOrder"),row.source_order)}${field(tr("model"),model)}${field(tr("sourceWorkbook"),shortHash(provenance.source_workbook_sha256),true)}${field(tr("normalizedSnapshot"),shortHash(provenance.normalized_snapshot_sha256),true)}${field(tr("rowHash"),shortHash(row.row_sha256),true)}${field(tr("transform"),provenance.transform_id,true)}${field(tr("formula"),provenance.formula_version)}${field(tr("quality"),row.quality_flag||provenance.quality_status)}${field(tr("license"),typeof provenance.license==="string"?provenance.license:(provenance.license?.formal_license_status||provenance.license?.patch_decision||"pending legal review"))}</dl></section></div><footer>${source?`<a href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(tr("openSource"))} ↗</a>`:""}${report?`<a href="${esc(report)}" target="_blank" rel="noopener noreferrer">${esc(tr("openReport"))} ↗</a>`:""}<button type="button" class="gociw-button primary" data-goci-action="close-dialog">${esc(tr("close"))}</button></footer></div></dialog>`;
  }

  function workspaceMarkup(selected) {
    return `<div class="gociw" data-edition="${S.edition}" data-source="${esc(S.data.data_mode)}">${editionRail()}${heroMarkup(selected)}${statsMarkup(selected)}${overviewMarkup(selected)}${matrixMarkup(selected)}${mapMarkup(selected)}${architectureMarkup(selected)}${historyMarkup(selected)}${comparisonMarkup(selected)}${rankingMarkup()}${methodologyMarkup()}${evidenceMarkup(selected)}<div class="gociw-toast" role="status" hidden></div></div>`;
  }

  function showMatrixTooltip(node, event) {
    const tooltip=S.context.root.querySelector(".gociw-matrix-tooltip"); const row=rowByIso(node.dataset.iso); if(!tooltip||!row)return;
    window.clearTimeout(S.tooltipTimer); tooltip.innerHTML=`<strong>${esc(countryName(row))}</strong><span>${esc(tr("criminality"))} ${fmt(score(row,"criminality"),2)} · ${esc(tr("resilience"))} ${fmt(score(row,"resilience"),2)}</span>`;
    const wrap=tooltip.closest(".gociw-matrix-card"); const rect=wrap.getBoundingClientRect(); const x=event?.clientX||rect.left+rect.width/2; const y=event?.clientY||rect.top+rect.height/2; tooltip.style.left=`${clamp(x-rect.left+14,8,rect.width-270)}px`; tooltip.style.top=`${clamp(y-rect.top+14,8,rect.height-78)}px`; tooltip.hidden=false;
  }
  function showMapTooltip(node,event) {
    const tooltip=S.context.root.querySelector(".gociw-tooltip"); const row=rowByIso(node.dataset.iso); if(!tooltip||!row)return; const code=S.mapMetric==="selected_indicator"?S.selectedIndicator:S.mapMetric;
    window.clearTimeout(S.tooltipTimer); tooltip.innerHTML=`<strong>${esc(countryName(row))}</strong><span>${esc(mapMetricLabel(code))} · ${fmt(score(row,code),2)}</span>`;
    const wrap=tooltip.closest(".gociw-map-wrap"); const rect=wrap.getBoundingClientRect(); const x=event?.clientX||rect.left+rect.width/2; const y=event?.clientY||rect.top+rect.height/2; tooltip.style.left=`${clamp(x-rect.left+14,8,rect.width-250)}px`; tooltip.style.top=`${clamp(y-rect.top+14,8,rect.height-78)}px`; tooltip.hidden=false;
  }
  function hideTooltip(selector,delay=80){const tooltip=S.context.root.querySelector(selector);if(!tooltip)return;window.clearTimeout(S.tooltipTimer);S.tooltipTimer=window.setTimeout(()=>{tooltip.hidden=true;},delay);}
  function focusNeighbour(current,selector,delta,show){const nodes=Array.from(S.context.root.querySelectorAll(selector)).filter((node)=>node.getAttribute("aria-disabled")!=="true");if(!nodes.length)return;const index=Math.max(0,nodes.indexOf(current));const target=nodes[(index+delta+nodes.length)%nodes.length];nodes.forEach((node)=>node.setAttribute("tabindex",node===target?"0":"-1"));target.focus();show(target);}

  function showEvidence(iso3, trigger) {
    const row=rowByIso(iso3); if(!row)return; const existing=S.context.root.querySelector("#gociEvidenceDialog"); if(existing)existing.remove();
    S.context.root.querySelector(".gociw")?.insertAdjacentHTML("beforeend",evidenceMarkup(row)); const dialog=S.context.root.querySelector("#gociEvidenceDialog"); if(!dialog)return; dialog.__returnFocus=trigger||document.activeElement;
    dialog.querySelectorAll("[data-goci-action]").forEach((control)=>control.addEventListener("click",async()=>{const action=control.dataset.gociAction;if(action==="close-dialog")closeDialog();else if(action==="copy"){try{await navigator.clipboard.writeText(control.dataset.copy||"");toast(tr("copied"));}catch(_){toast(control.dataset.copy||"");}}}));
    dialog.addEventListener("cancel",(event)=>{event.preventDefault();closeDialog();});dialog.addEventListener("click",(event)=>{if(event.target===dialog)closeDialog();}); if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open",""); dialog.querySelector("[data-goci-action='close-dialog']")?.focus();
  }
  function closeDialog(){const dialog=S.context.root.querySelector("#gociEvidenceDialog");if(!dialog)return;const returnFocus=dialog.__returnFocus;if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");if(returnFocus?.focus&&returnFocus.isConnected)returnFocus.focus();}
  function toast(message){const node=S.context.root.querySelector(".gociw-toast");if(!node)return;node.textContent=message;node.hidden=false;window.clearTimeout(node.__timer);node.__timer=window.setTimeout(()=>{node.hidden=true;},2200);}
  function exportStaticCsv(){const catalog=availableCatalog();const columns=["edition_year","reference_year","source_order","continent","region","iso3","country_name",...catalog.flatMap((item)=>[item.indicator_code,`${item.indicator_code}_rank`,`${item.indicator_code}_tied_rank`]),"quality_flag","source_row_sha256"];const quote=(value)=>`"${String(value??"").replace(/"/g,'""')}"`;const lines=[columns.join(","),...currentRows().map((row)=>columns.map((column)=>{if(column.endsWith("_tied_rank")){const code=column.replace(/_tied_rank$/,"");return quote(Number(Boolean(row.tied_ranks?.[code])));}if(column.endsWith("_rank")){const code=column.replace(/_rank$/,"");return quote(rank(row,code));}if(itemByCode(column))return quote(score(row,column));if(column==="source_row_sha256")return quote(row.row_sha256);return quote(row[column]);}).join(","))];const blob=new Blob(["\ufeff",lines.join("\r\n")],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`goci_${S.edition}_country_scores.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);}
  function rerenderAt(anchorId=""){const y=window.scrollY;paint();if(anchorId)S.context.root.querySelector(`#${CSS.escape(anchorId)}`)?.scrollIntoView({block:"start"});else window.scrollTo({top:y,behavior:"auto"});}

  function bind() {
    const root=S.context.root;
    root.querySelectorAll("[data-goci-action]").forEach((control)=>control.addEventListener("click",async()=>{
      const action=control.dataset.gociAction;
      if(action==="retry")return render(S.context,{force:true});
      if(action==="jump")return root.querySelector(`#${CSS.escape(control.dataset.target||"")}`)?.scrollIntoView({behavior:"smooth",block:"start"});
      if(action==="edition")return setEdition(control.dataset.edition);
      if(action==="country"||action==="map-country"||action==="matrix-country")return selectCountry(control.dataset.iso);
      if(action==="map-metric"){S.mapMetric=control.dataset.metric||"criminality";return rerenderAt("goci-map");}
      if(action==="indicator-group"){S.indicatorGroup=control.dataset.group||"all";return rerenderAt("goci-architecture");}
      if(action==="indicator"){S.selectedIndicator=control.dataset.indicator||DEFAULT_INDICATOR;S.mapMetric="selected_indicator";S.rankingMetric=S.selectedIndicator;S.page=0;return rerenderAt("goci-architecture");}
      if(action==="evidence")return showEvidence(control.dataset.iso,control);
      if(action==="close-dialog")return closeDialog();
      if(action==="copy"){try{await navigator.clipboard.writeText(control.dataset.copy||"");toast(tr("copied"));}catch(_){toast(control.dataset.copy||"");}return;}
      if(action==="add-compare"){const iso3=root.querySelector("#gociCompareSelect")?.value;if(iso3&&!S.compare.includes(iso3)&&S.compare.length<5)S.compare.push(iso3);return rerenderAt("goci-comparison");}
      if(action==="remove-compare"){if(S.compare.length>2)S.compare=S.compare.filter((iso3)=>iso3!==control.dataset.iso);return rerenderAt("goci-comparison");}
      if(action==="reset-compare"){resetComparison(rowByIso(S.selectedIso));return rerenderAt("goci-comparison");}
      if(action==="previous-page"){S.page=Math.max(0,S.page-1);return rerenderAt("goci-ranking");}
      if(action==="next-page"){S.page+=1;return rerenderAt("goci-ranking");}
      if(action==="export-static")return exportStaticCsv();
    }));
    const search=root.querySelector("#gociRankingSearch");if(search){let timer;search.addEventListener("input",()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>{S.query=search.value;S.page=0;rerenderAt("goci-ranking");},180);});}
    root.querySelector("#gociRankingMetric")?.addEventListener("change",(event)=>{S.rankingMetric=event.target.value;S.page=0;rerenderAt("goci-ranking");});
    root.querySelector("#gociContinent")?.addEventListener("change",(event)=>{S.continent=event.target.value;S.region="";S.page=0;rerenderAt("goci-ranking");});
    root.querySelector("#gociRegion")?.addEventListener("change",(event)=>{S.region=event.target.value;S.page=0;rerenderAt("goci-ranking");});
    root.querySelector("#gociSort")?.addEventListener("change",(event)=>{S.sort=event.target.value;S.page=0;rerenderAt("goci-ranking");});
    root.querySelector("#gociDirection")?.addEventListener("change",(event)=>{S.direction=event.target.value;S.page=0;rerenderAt("goci-ranking");});
    root.querySelector("#gociPageSize")?.addEventListener("change",(event)=>{S.pageSize=Number(event.target.value)||25;S.page=0;rerenderAt("goci-ranking");});
    root.querySelectorAll(".gociw-map-country[data-goci-action='map-country']:not([aria-disabled='true'])").forEach((node)=>{node.addEventListener("pointerenter",(event)=>showMapTooltip(node,event));node.addEventListener("pointermove",(event)=>showMapTooltip(node,event));node.addEventListener("pointerleave",()=>hideTooltip(".gociw-tooltip"));node.addEventListener("focus",()=>showMapTooltip(node));node.addEventListener("blur",()=>hideTooltip(".gociw-tooltip"));node.addEventListener("keydown",(event)=>{if(["Enter"," "].includes(event.key)){event.preventDefault();selectCountry(node.dataset.iso);}else if(["ArrowRight","ArrowDown"].includes(event.key)){event.preventDefault();focusNeighbour(node,".gociw-map-country[data-goci-action='map-country']",1,showMapTooltip);}else if(["ArrowLeft","ArrowUp"].includes(event.key)){event.preventDefault();focusNeighbour(node,".gociw-map-country[data-goci-action='map-country']",-1,showMapTooltip);}else if(event.key==="Escape")hideTooltip(".gociw-tooltip",0);});});
    root.querySelectorAll(".gociw-matrix-point").forEach((node)=>{node.addEventListener("pointerenter",(event)=>showMatrixTooltip(node,event));node.addEventListener("pointermove",(event)=>showMatrixTooltip(node,event));node.addEventListener("pointerleave",()=>hideTooltip(".gociw-matrix-tooltip"));node.addEventListener("focus",()=>showMatrixTooltip(node));node.addEventListener("blur",()=>hideTooltip(".gociw-matrix-tooltip"));node.addEventListener("keydown",(event)=>{if(["Enter"," "].includes(event.key)){event.preventDefault();selectCountry(node.dataset.iso);}else if(["ArrowRight","ArrowDown"].includes(event.key)){event.preventDefault();focusNeighbour(node,".gociw-matrix-point",1,showMatrixTooltip);}else if(["ArrowLeft","ArrowUp"].includes(event.key)){event.preventDefault();focusNeighbour(node,".gociw-matrix-point",-1,showMatrixTooltip);}else if(event.key==="Escape")hideTooltip(".gociw-matrix-tooltip",0);});});
    const dialog=root.querySelector("#gociEvidenceDialog");if(dialog){dialog.addEventListener("cancel",(event)=>{event.preventDefault();closeDialog();});dialog.addEventListener("click",(event)=>{if(event.target===dialog)closeDialog();});}
  }

  function paint() {
    if(!S.context?.root||!S.data)return;const requested=Number(S.context.year||S.edition||LATEST_EDITION);if(EDITIONS.includes(requested))S.edition=requested;const selected=ensureSelection();if(!selected)throw new Error("GOCI release contains no country rows");S.context.root.innerHTML=workspaceMarkup(selected);bind();document.documentElement.dataset.gociReady="true";document.documentElement.dataset.gociSource=String(S.data.data_mode||"unknown");window.dispatchEvent(new CustomEvent("gir:goci-ready",{detail:{iso3:selected.iso3,editionYear:S.edition,referenceYear:releaseByEdition()?.reference_year,dataMode:S.data.data_mode}}));
  }
  async function render(context,options={}) {
    if(!context?.root)throw new Error("GOCI workspace requires a root element");if(!context.country)return;S.context=context;const requested=Number(context.year||LATEST_EDITION);S.edition=EDITIONS.includes(requested)?requested:LATEST_EDITION;const key=`${context.lang||"ru"}`;const token=++S.renderToken;context.root.innerHTML=loadingMarkup();document.documentElement.dataset.gociReady="false";
    try{if(!S.data||S.loadKey!==key||options.force){const[data,geo]=await Promise.all([loadData(),loadGeo()]);if(token!==S.renderToken)return;data.indicator_catalog=normalizeCatalog(data.indicator_catalog);S.data=data;S.geo=geo;S.loadKey=key;}paint();}
    catch(error){console.error("GOCI workspace failed",error);if(token!==S.renderToken)return;context.root.innerHTML=errorMarkup(error);context.root.querySelector("[data-goci-action='retry']")?.addEventListener("click",()=>render(context,{force:true}));document.documentElement.dataset.gociReady="error";}
  }
  function invalidate(){S.data=null;S.loadKey="";}
  const publicApi=Object.freeze({render,invalidate,version:"6.0.0-stage06"});window.GIRGOCI=publicApi;window.GIRGOCIWorkspace=publicApi;
})();
