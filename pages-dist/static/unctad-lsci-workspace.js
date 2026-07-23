/* GIR — UNCTAD Liner Shipping Connectivity Index workspace, Stage 14.
 * Native GIR shell and design tokens. Official quarterly scores are loaded only
 * after a verified local import; the static bundle contains metadata only.
 */
(() => {
  "use strict";

  const SCRIPT = Array.from(document.scripts).find((item) => /(?:^|\/)unctad-lsci-workspace\.js(?:\?|$)/.test(item.src || ""));
  const STATIC_BASE = (() => {
    try { return new URL("./", SCRIPT?.src || document.baseURI).href; }
    catch (_) { return "/static/"; }
  })();
  const META_URL = new URL("unctad-lsci/unctad_lsci_frontend_meta.json", STATIC_BASE).href;
  const GEO_URL = new URL("goci/goci-world-geo.json", STATIC_BASE).href;
  const API = "/api/security-connectivity/unctad-lsci";
  const TABLE_CODE = "US.LSCI";
  const STATIC_DATA_MODE = "metadata_only_until_verified_import";
  const DEFAULT_PERIOD = "2026-Q2";
  const DEFAULT_COMPARE = ["CHN", "KOR", "SGP"];

  const COPY = {
    ru: {
      section: "Безопасность и международная связанность",
      title: "Индекс связанности линейного судоходства",
      acronym: "UNCTAD LSCI",
      lead: "Квартальная оценка интеграции экономики в глобальную сеть регулярных контейнерных перевозок — от частоты судозаходов до числа прямых международных связей.",
      officialScore: "официальный балл UNCTAD",
      derivedRank: "место рассчитано GIR",
      quarterly: "квартальная серия",
      release: "Выпуск",
      period: "Период",
      latest: "Последний срез",
      first: "Начало ряда",
      reference: "База шкалы",
      components: "Компонентов",
      selectedCountry: "Выбранная экономика",
      score: "LSCI",
      rank: "Место",
      percentile: "Процентиль",
      qoq: "За квартал",
      yoy: "За год",
      tie: "ничья",
      noObservation: "Для выбранной экономики нет наблюдения в этом квартале",
      awaiting: "Ожидается проверенный локальный импорт официального CSV UNCTAD",
      available: "Числовая аналитика доступна",
      metadataOnly: "Метаданные выпуска доступны; страновые значения в патч не встроены",
      sourceStatus: "Статус источника",
      numericRows: "Числовых строк",
      economies: "Экономик",
      periods: "Кварталов",
      officialBulk: "Официальный bulk CSV",
      importTitle: "Подключение официального набора",
      importText: "Загрузчик проверяет структуру, диапазон периодов, охват, лидера последнего среза и SHA-256. До успешного импорта GIR не показывает пустой или демонстрационный рейтинг.",
      step1: "1 · Получить",
      step2: "2 · Проверить и импортировать",
      copy: "Копировать",
      copied: "Скопировано",
      methodologyKicker: "Методология",
      methodologyTitle: "Шесть измерений морской связанности",
      methodologyText: "UNCTAD формирует единый LSCI из шести характеристик регулярного линейного сообщения. GIR хранит опубликованный балл без пересчёта.",
      weekly_calls: "Регулярные судозаходы в неделю",
      deployed_capacity: "Годовая провозная способность, TEU",
      regular_services: "Регулярные линейные сервисы",
      direct_connections: "Прямые связи без перевалки",
      service_providers: "Линейные судоходные компании",
      largest_ship: "Размер крупнейших судов",
      methodRevision: "Пересмотр 2024 года",
      methodRevisionText: "Компоненты нормируются относительно среднего, а теоретическая средняя экономика в первом квартале 2023 года равна 100. Пересмотренная модель ретроспективно применена к ряду с 2006 года.",
      regionalLeaders: "Региональные лидеры последнего квартала",
      Asia: "Азия",
      "Northern America": "Северная Америка",
      Europe: "Европа",
      Africa: "Африка",
      "Latin America and the Caribbean": "Латинская Америка и Карибы",
      analyticsLocked: "Аналитические экраны откроются после импорта",
      analyticsLockedText: "Профиль страны, временной ряд, карта, сравнение и полный рейтинг используют только проверенные строки официального файла.",
      trendKicker: "Динамика",
      trendTitle: "Квартальный ряд выбранной экономики",
      trendText: "Для текущей методологической редакции доступны сопоставимые значения с первого квартала 2006 года.",
      mapKicker: "География",
      mapTitle: "Распределение морской связанности",
      mapText: "Цвет отражает производный процентиль внутри выбранного квартала. Точное значение и происхождение доступны в таблице и evidence drawer.",
      distribution: "Распределение значений",
      higher: "Выше связанность",
      lower: "Ниже связанность",
      noData: "Нет данных",
      comparisonKicker: "Сравнение",
      comparisonTitle: "Сопоставление экономик в одном квартале",
      comparisonText: "Сравнение не смешивает кварталы и использует одну редакцию пересчитанного ряда UNCTAD.",
      addCountry: "Добавить экономику",
      add: "Добавить",
      reset: "Сбросить",
      remove: "Удалить",
      rankingKicker: "Полный набор",
      rankingTitle: "Рейтинг экономик",
      rankingText: "Баллы официальные; места, процентили и изменения — воспроизводимая аналитика GIR внутри выбранного квартала.",
      search: "Поиск страны или ISO3",
      sort: "Сортировка",
      byRank: "По месту",
      byScore: "По баллу",
      byCountry: "По стране",
      byQoq: "По изменению за квартал",
      byYoy: "По изменению за год",
      ascending: "По возрастанию",
      descending: "По убыванию",
      rows: "Строк на странице",
      previous: "Назад",
      next: "Далее",
      page: "Страница",
      evidence: "Доказательная запись",
      exportCsv: "Экспорт CSV",
      sourceKicker: "Источник и качество",
      sourceTitle: "Официальный ряд UNCTAD с построчным provenance",
      sourceText: "Для каждой строки сохраняются исходное значение, SHA-256 файла и строки, трансформация, статус официальности и признаки производной аналитики.",
      source: "Источник",
      publisher: "Издатель",
      dataPartner: "Поставщик данных",
      license: "Лицензия",
      updated: "Обновлено",
      viewer: "Открыть Data Hub",
      metadata: "Метаданные",
      methodology: "Методология",
      close: "Закрыть",
      country: "Экономика",
      iso3: "ISO3",
      refArea: "Код UNCTAD",
      officialValue: "Официальное значение",
      sourceValue: "Текст источника",
      rankStatus: "Статус места",
      scoreStatus: "Статус балла",
      quality: "Флаг качества",
      rawHash: "SHA-256 исходного CSV",
      rowHash: "SHA-256 строки",
      transform: "Преобразование",
      formula: "Версия кода",
      sourceOrder: "Порядок источника",
      validation: "ВАЛИДАЦИОННЫЙ НАБОР · НЕ ДАННЫЕ UNCTAD",
      loading: "Загрузка модуля UNCTAD LSCI…",
      loadError: "Не удалось загрузить модуль UNCTAD LSCI",
      retry: "Повторить",
      mapKeyboard: "Карта доступна с клавиатуры: Enter или пробел выбирают экономику, стрелки перемещают фокус.",
      scoreDirection: "Больше — выше связанность",
      unavailableExport: "Экспорт откроется после импорта",
    },
    en: {
      section: "Security & international connectivity",
      title: "Liner Shipping Connectivity Index",
      acronym: "UNCTAD LSCI",
      lead: "A quarterly measure of an economy’s integration into global scheduled container shipping networks, from weekly calls to direct international connections.",
      officialScore: "official UNCTAD score",
      derivedRank: "rank derived by GIR",
      quarterly: "quarterly series",
      release: "Release",
      period: "Period",
      latest: "Latest period",
      first: "Series start",
      reference: "Scale reference",
      components: "Components",
      selectedCountry: "Selected economy",
      score: "LSCI",
      rank: "Rank",
      percentile: "Percentile",
      qoq: "Quarter-on-quarter",
      yoy: "Year-on-year",
      tie: "tie",
      noObservation: "No observation for the selected economy in this quarter",
      awaiting: "Awaiting a verified local import of the official UNCTAD CSV",
      available: "Numeric analytics available",
      metadataOnly: "Release metadata are available; country values are not embedded in the patch",
      sourceStatus: "Source status",
      numericRows: "Numeric rows",
      economies: "Economies",
      periods: "Quarters",
      officialBulk: "Official bulk CSV",
      importTitle: "Connect the official dataset",
      importText: "The importer validates structure, period range, coverage, the latest-period leader and SHA-256. GIR does not show an empty or demo ranking before a successful import.",
      step1: "1 · Fetch",
      step2: "2 · Verify and import",
      copy: "Copy",
      copied: "Copied",
      methodologyKicker: "Methodology",
      methodologyTitle: "Six dimensions of maritime connectivity",
      methodologyText: "UNCTAD combines six characteristics of scheduled liner services into the LSCI. GIR preserves the published score without recomputing it.",
      weekly_calls: "Scheduled ship calls per week",
      deployed_capacity: "Annual deployed capacity, TEU",
      regular_services: "Regular liner shipping services",
      direct_connections: "Direct connections without transshipment",
      service_providers: "Liner shipping service providers",
      largest_ship: "Size of the largest ships",
      methodRevision: "2024 methodology revision",
      methodRevisionText: "Components are normalised relative to the average, and a theoretical average economy in Q1 2023 equals 100. The revised model was backcast to the series starting in 2006.",
      regionalLeaders: "Regional leaders in the latest quarter",
      Asia: "Asia",
      "Northern America": "Northern America",
      Europe: "Europe",
      Africa: "Africa",
      "Latin America and the Caribbean": "Latin America & Caribbean",
      analyticsLocked: "Analytics unlock after import",
      analyticsLockedText: "Country profile, trend, map, comparison and full ranking use only verified rows from the official file.",
      trendKicker: "Trend",
      trendTitle: "Quarterly series for the selected economy",
      trendText: "Comparable values under the current methodological revision are available from Q1 2006.",
      mapKicker: "Geography",
      mapTitle: "Distribution of maritime connectivity",
      mapText: "Colour represents a derived percentile within the selected quarter. Exact values and provenance remain available in the table and evidence drawer.",
      distribution: "Value distribution",
      higher: "Higher connectivity",
      lower: "Lower connectivity",
      noData: "No data",
      comparisonKicker: "Comparison",
      comparisonTitle: "Economy comparison within one quarter",
      comparisonText: "The comparison does not mix quarters and uses one backcast UNCTAD methodological series.",
      addCountry: "Add economy",
      add: "Add",
      reset: "Reset",
      remove: "Remove",
      rankingKicker: "Full dataset",
      rankingTitle: "Economy ranking",
      rankingText: "Scores are official; ranks, percentiles and changes are reproducible GIR analytics within the selected quarter.",
      search: "Search economy or ISO3",
      sort: "Sort",
      byRank: "By rank",
      byScore: "By score",
      byCountry: "By economy",
      byQoq: "By quarter-on-quarter change",
      byYoy: "By year-on-year change",
      ascending: "Ascending",
      descending: "Descending",
      rows: "Rows per page",
      previous: "Previous",
      next: "Next",
      page: "Page",
      evidence: "Evidence record",
      exportCsv: "Export CSV",
      sourceKicker: "Source & quality",
      sourceTitle: "Official UNCTAD series with row-level provenance",
      sourceText: "Each row retains the source value, file and row SHA-256, transformation, official status and derived-analysis flags.",
      source: "Source",
      publisher: "Publisher",
      dataPartner: "Data partner",
      license: "Licence",
      updated: "Updated",
      viewer: "Open Data Hub",
      metadata: "Metadata",
      methodology: "Methodology",
      close: "Close",
      country: "Economy",
      iso3: "ISO3",
      refArea: "UNCTAD code",
      officialValue: "Official value",
      sourceValue: "Source text",
      rankStatus: "Rank status",
      scoreStatus: "Score status",
      quality: "Quality flag",
      rawHash: "Raw CSV SHA-256",
      rowHash: "Row SHA-256",
      transform: "Transformation",
      formula: "Code version",
      sourceOrder: "Source order",
      validation: "VALIDATION FIXTURE · NOT UNCTAD DATA",
      loading: "Loading UNCTAD LSCI…",
      loadError: "Unable to load the UNCTAD LSCI module",
      retry: "Retry",
      mapKeyboard: "The map is keyboard accessible: Enter or Space selects an economy; arrow keys move focus.",
      scoreDirection: "Higher means more connected",
      unavailableExport: "Export unlocks after import",
    },
  };

  const S = {
    context: null,
    meta: null,
    geo: null,
    overview: null,
    releases: null,
    methodology: null,
    license: null,
    health: null,
    mode: "metadata",
    period: DEFAULT_PERIOD,
    selectedIso: "",
    ranking: [],
    total: 0,
    countryProfile: null,
    compare: DEFAULT_COMPARE.slice(),
    query: "",
    sort: "rank",
    direction: "asc",
    page: 0,
    pageSize: 25,
    evidence: null,
    loadPromise: null,
    numericPromise: null,
    renderToken: 0,
    validation: false,
    validationData: null,
  };

  const tr = (key) => COPY[S.context?.lang === "en" ? "en" : "ru"][key] || key;
  const esc = (value) => S.context?.escapeHtml ? S.context.escapeHtml(value) : String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const number = (value) => value == null || value === "" ? null : Number(value);
  const fmt = (value, digits = 1) => {
    const numeric = number(value);
    if (!Number.isFinite(numeric)) return "—";
    const resolved = Math.abs(numeric - Math.round(numeric)) < 1e-9 ? 0 : digits;
    return numeric.toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: resolved, minimumFractionDigits: resolved });
  };
  const signed = (value, suffix = "") => {
    const numeric = number(value);
    if (!Number.isFinite(numeric)) return "—";
    return `${numeric > 0 ? "+" : ""}${fmt(numeric, 1)}${suffix}`;
  };
  const intFmt = (value) => value == null ? "—" : Number(value).toLocaleString(S.context?.lang === "en" ? "en-US" : "ru-RU");
  const shortHash = (value) => value ? `${String(value).slice(0, 12)}…${String(value).slice(-8)}` : "—";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function apiJson(url) {
    return fetch(url, { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
      if (!response.ok) {
        let detail = null;
        try { detail = await response.json(); } catch (_) { /* ignore */ }
        const error = new Error(detail?.detail?.message || detail?.message || `${response.status} ${response.statusText}`);
        error.status = response.status;
        error.payload = detail;
        throw error;
      }
      return response.json();
    });
  }

  function periodParts(period) {
    const match = /^(\d{4})-Q([1-4])$/.exec(String(period || ""));
    return match ? { year: Number(match[1]), quarter: Number(match[2]) } : { year: 2026, quarter: 2 };
  }

  function periodsBetween(first, latest) {
    const start = periodParts(first), end = periodParts(latest), periods = [];
    for (let year = start.year; year <= end.year; year += 1) {
      const from = year === start.year ? start.quarter : 1;
      const to = year === end.year ? end.quarter : 4;
      for (let quarter = from; quarter <= to; quarter += 1) periods.push(`${year}-Q${quarter}`);
    }
    return periods.reverse();
  }

  function desiredPeriodFromContext() {
    const year = Number(S.context?.year);
    const latest = periodParts(S.overview?.latest_period || DEFAULT_PERIOD);
    if (!Number.isFinite(year) || year < 2006 || year > latest.year) return S.overview?.latest_period || DEFAULT_PERIOD;
    const current = periodParts(S.period);
    const quarter = year === current.year ? current.quarter : (year === latest.year ? latest.quarter : 4);
    return `${year}-Q${quarter}`;
  }

  async function loadBase(force = false) {
    if (force) S.loadPromise = null;
    if (!S.loadPromise) {
      const validation = window.__GIR_UNCTAD_LSCI_VALIDATION_DATA__ || null;
      S.loadPromise = Promise.all([
        apiJson(META_URL),
        apiJson(GEO_URL).catch(() => null),
      ]).then(async ([meta, geo]) => {
        S.meta = meta;
        S.geo = geo;
        if (validation) {
          S.validationData = validation;
          S.overview = validation.overview || meta.overview;
          S.releases = validation.releases || meta.releases;
          S.methodology = validation.methodology || meta.methodology;
          S.license = validation.license || meta.license;
          S.health = validation.health || { numeric_routes_ready: true, latest_imported_period: validation.latest_period };
          S.validation = true;
          S.mode = "numeric";
          S.period = S.health.latest_imported_period || validation.latest_period || S.overview.latest_period || DEFAULT_PERIOD;
          return meta;
        }
        S.validationData = null;
        const endpoints = ["", "/releases", "/methodology", "/license", "/health"];
        const fallback = [meta.overview, meta.releases, meta.methodology, meta.license, meta.health];
        const results = await Promise.all(endpoints.map((suffix, index) => apiJson(`${API}${suffix}`).catch(() => fallback[index])));
        [S.overview, S.releases, S.methodology, S.license, S.health] = results;
        S.validation = Boolean(S.overview?.validation_fixture || S.health?.validation_fixture);
        S.mode = S.health?.numeric_routes_ready ? "numeric" : "metadata";
        S.period = S.health?.latest_imported_period || S.overview?.latest_period || DEFAULT_PERIOD;
        return meta;
      });
    }
    return S.loadPromise;
  }

  async function loadNumeric(force = false) {
    if (S.mode !== "numeric") return;
    const period = S.period;
    const iso3 = S.selectedIso;
    const key = `${period}|${iso3}`;
    if (!force && S.numericPromise?.key === key) return S.numericPromise.promise;
    if (S.validationData) {
      const promise = Promise.resolve().then(() => {
        const rows = Array.isArray(S.validationData.rows) ? S.validationData.rows : [];
        S.ranking = rows.filter((row) => row.period === period && row.iso3 && !row.is_aggregate)
          .slice().sort((a, b) => (Number(a.rank) || 9999) - (Number(b.rank) || 9999));
        S.total = S.ranking.length;
        const series = rows.filter((row) => row.iso3 === iso3 && !row.is_aggregate)
          .slice().sort((a, b) => String(a.period).localeCompare(String(b.period)));
        S.countryProfile = series.length ? { country: series.at(-1).country, iso3, latest: series.at(-1), series, observation_count: series.length, validation_fixture: true } : null;
        S.validation = true;
        if (!S.compare.some((code) => S.ranking.some((row) => row.iso3 === code))) S.compare = S.ranking.slice(0, 3).map((row) => row.iso3);
        return { items: S.ranking, total: S.total, validation_fixture: true };
      });
      S.numericPromise = { key, promise };
      return promise;
    }
    const promise = Promise.all([
      apiJson(`${API}/ranking?period=${encodeURIComponent(period)}&limit=500&offset=0&sort=rank&direction=asc&include_provenance=true`),
      apiJson(`${API}/countries/${encodeURIComponent(iso3)}?include_provenance=true`).catch((error) => error.status === 404 ? null : Promise.reject(error)),
    ]).then(([ranking, profile]) => {
      S.ranking = ranking.items || [];
      S.total = Number(ranking.total || S.ranking.length);
      S.countryProfile = profile;
      S.validation = S.validation || Boolean(ranking.validation_fixture || profile?.validation_fixture);
      if (!S.compare.some((iso) => S.ranking.some((row) => row.iso3 === iso))) S.compare = S.ranking.slice(0, 3).map((row) => row.iso3);
      return ranking;
    });
    S.numericPromise = { key, promise };
    return promise;
  }

  function platformCountry(iso3) {
    return S.context?.platformContext?.countries?.find((country) => String(country.iso3).toUpperCase() === String(iso3).toUpperCase()) || null;
  }

  function countryName(rowOrIso) {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const platform = platformCountry(iso3);
    if (platform) return S.context?.lang === "en" ? platform.name_en : platform.name_ru;
    if (typeof rowOrIso === "object" && rowOrIso?.country) return rowOrIso.country;
    const meta = S.meta?.countries?.find((country) => country.iso3 === iso3);
    return meta?.name_en || iso3 || "—";
  }

  function flag(rowOrIso, className = "flag-img") {
    const iso3 = typeof rowOrIso === "string" ? rowOrIso : rowOrIso?.iso3;
    const platform = platformCountry(iso3) || { iso3, name_ru: countryName(rowOrIso), name_en: countryName(rowOrIso) };
    return S.context?.flagImage ? S.context.flagImage(platform, className) : `<span class="${className} lsciw-flag-fallback">${esc(iso3)}</span>`;
  }

  function currentRow(iso3 = S.selectedIso) {
    return S.ranking.find((row) => row.iso3 === iso3) || null;
  }

  function ensureState() {
    S.selectedIso = String(S.context?.country || "").toUpperCase();
    const desired = desiredPeriodFromContext();
    if (S.period !== desired && S.mode === "numeric") {
      S.period = desired;
      S.numericPromise = null;
    }
    if (!S.compare.includes(S.selectedIso)) S.compare.unshift(S.selectedIso);
    S.compare = Array.from(new Set(S.compare)).slice(0, 5);
  }

  function sectionHeading(kicker, title, text, extra = "") {
    return `<header class="lsciw-section-head"><div><span class="iw-overline">${esc(kicker)}</span><h2>${esc(title)}</h2></div><div><p>${esc(text)}</p>${extra}</div></header>`;
  }

  function statusLabel() {
    return S.mode === "numeric" ? tr("available") : tr("awaiting");
  }

  function periodSelect() {
    const periods = periodsBetween(S.overview.first_period, S.overview.latest_period);
    return `<label class="lsciw-control"><span>${esc(tr("period"))}</span><select id="lsciwPeriod">${periods.map((period) => `<option value="${period}" ${period === S.period ? "selected" : ""}>${period}</option>`).join("")}</select></label>`;
  }

  function countryHeading(row) {
    const iso3 = row?.iso3 || S.selectedIso;
    const period = row?.period || S.period;
    return `<div class="lsciw-country-heading">${flag(row || iso3)}<div><strong>${esc(countryName(row || iso3))}</strong><small>${esc(iso3)} · ${esc(period)}</small></div></div>`;
  }

  function heroMarkup() {
    const row = currentRow();
    return `<section class="iw-hero lsciw-hero">
      <article class="iw-hero-main">
        <span class="iw-overline">${esc(tr("section"))} · ${esc(tr("acronym"))}</span>
        <h1>${esc(tr("title"))}</h1>
        <p class="iw-hero-lead">${esc(tr("lead"))}</p>
        <div class="iw-status-line"><span class="accent">${esc(tr("officialScore"))}</span><span>${esc(tr("derivedRank"))}</span><span>${esc(tr("quarterly"))}</span><span>CC BY 3.0 IGO</span></div>
        ${S.mode === "numeric" ? `${countryHeading(row)}<div class="lsciw-hero-score"><strong>${fmt(row?.score, 1)}</strong><span>${esc(tr("score"))} · ${esc(S.period)}</span></div>` : `<div class="lsciw-source-state"><span class="${S.mode === "numeric" ? "is-live" : "is-locked"}">${esc(statusLabel())}</span><p>${esc(tr("metadataOnly"))}</p></div>`}
      </article>
      <aside class="iw-hero-side lsciw-release-card">
        <span class="iw-overline">${esc(tr("release"))}</span>
        <strong class="lsciw-release-period">${esc(S.overview.latest_period)}</strong>
        <dl><div><dt>${esc(tr("first"))}</dt><dd>${esc(S.overview.first_period)}</dd></div><div><dt>${esc(tr("reference"))}</dt><dd>${esc(S.overview.reference_period)} = ${fmt(S.overview.reference_value, 0)}</dd></div><div><dt>${esc(tr("components"))}</dt><dd>${intFmt(S.overview.component_count)}</dd></div><div><dt>${esc(tr("updated"))}</dt><dd>${esc(S.overview.last_updated)}</dd></div></dl>
        ${periodSelect()}
      </aside>
    </section>`;
  }

  function summaryMarkup() {
    const row = currentRow();
    const cards = S.mode === "numeric" ? [
      [tr("score"), fmt(row?.score, 1), tr("officialScore")],
      [tr("rank"), row?.rank == null ? "—" : `#${intFmt(row.rank)}`, row?.tied_rank ? tr("tie") : tr("derivedRank")],
      [tr("percentile"), row?.percentile == null ? "—" : `${fmt(row.percentile, 1)}%`, tr("derivedRank")],
      [tr("qoq"), signed(row?.score_change_qoq_pct, "%"), row?.score_change_qoq == null ? "—" : signed(row.score_change_qoq)],
      [tr("yoy"), signed(row?.score_change_yoy_pct, "%"), row?.score_change_yoy == null ? "—" : signed(row.score_change_yoy)],
    ] : [
      [tr("latest"), S.overview.latest_period, S.overview.last_updated],
      [tr("first"), S.overview.first_period, tr("quarterly")],
      [tr("components"), intFmt(S.overview.component_count), S.overview.methodology_revision],
      [tr("numericRows"), "0", tr("metadataOnly")],
      [tr("sourceStatus"), "HTTP 409", tr("awaiting")],
    ];
    return `<section class="lsciw-stat-grid">${cards.map(([label, value, note]) => `<article><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join("")}</section>`;
  }

  function componentsMarkup() {
    const components = S.methodology.components || [];
    const leaders = S.releases?.release?.latest_release_facts?.regional_leaders || {};
    return `<section class="iw-panel lsciw-section" id="lsci-methodology">
      ${sectionHeading(tr("methodologyKicker"), tr("methodologyTitle"), tr("methodologyText"))}
      <div class="lsciw-component-grid">${components.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(tr(item.code))}</h3><small>${esc(item.code)}</small></article>`).join("")}</div>
      <div class="lsciw-method-grid"><article><span class="iw-overline">${esc(tr("methodRevision"))}</span><p>${esc(tr("methodRevisionText"))}</p><div class="lsciw-reference"><strong>${fmt(S.overview.reference_value, 0)}</strong><span>${esc(S.overview.reference_period)}</span></div></article><article><span class="iw-overline">${esc(tr("regionalLeaders"))}</span><dl>${Object.entries(leaders).map(([region, country]) => `<div><dt>${esc(tr(region))}</dt><dd>${esc(country)}</dd></div>`).join("")}</dl></article></div>
    </section>`;
  }

  function importMarkup() {
    const fetchCommand = S.meta.import_workflow.fetch_command;
    const importCommand = S.meta.import_workflow.import_command;
    return `<section class="iw-panel lsciw-section" id="lsci-access">
      ${sectionHeading(tr("sourceStatus"), tr("importTitle"), tr("importText"))}
      <div class="lsciw-access-grid"><article><span class="iw-overline">${esc(tr("step1"))}</span><pre><code>${esc(fetchCommand)}</code></pre><button type="button" class="iw-button" data-lsciw-action="copy" data-command="fetch">${esc(tr("copy"))}</button></article><article><span class="iw-overline">${esc(tr("step2"))}</span><pre><code>${esc(importCommand)}</code></pre><button type="button" class="iw-button" data-lsciw-action="copy" data-command="import">${esc(tr("copy"))}</button></article></div>
      <div class="lsciw-lock-preview"><div><span class="iw-overline">${esc(tr("analyticsLocked"))}</span><h3>${esc(tr("trendTitle"))}</h3><p>${esc(tr("analyticsLockedText"))}</p></div><div class="lsciw-lock-grid">${[tr("selectedCountry"),tr("trendTitle"),tr("mapTitle"),tr("comparisonTitle"),tr("rankingTitle")].map((label) => `<span><i aria-hidden="true">×</i>${esc(label)}</span>`).join("")}</div></div>
    </section>`;
  }

  function rowStats(rows) {
    const values = rows.map((row) => number(row.score)).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return { min: null, max: null, median: null };
    const mid = Math.floor(values.length / 2);
    return { min: values[0], max: values[values.length - 1], median: values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2 };
  }

  function trendSvg(items) {
    const rows = (items || []).filter((row) => Number.isFinite(number(row.score)));
    if (rows.length < 2) return `<div class="lsciw-empty">${esc(tr("noObservation"))}</div>`;
    const width = 1000, height = 300, padX = 38, padY = 28;
    const values = rows.map((row) => number(row.score));
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const points = rows.map((row, index) => ({ row, x: padX + index * (width - padX * 2) / Math.max(1, rows.length - 1), y: height - padY - (number(row.score) - min) * (height - padY * 2) / range }));
    const path = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
    const area = `M${points[0].x.toFixed(2)},${height - padY} ${path.replace(/^M/, "L")} L${points[points.length - 1].x.toFixed(2)},${height - padY} Z`;
    const labels = [0, Math.floor((rows.length - 1) / 2), rows.length - 1].map((index) => `<text x="${points[index].x}" y="${height - 5}" text-anchor="middle">${esc(rows[index].period)}</text>`).join("");
    return `<svg class="lsciw-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(tr("trendTitle"))}"><path class="area" d="${area}"></path><path class="line" d="${path}"></path>${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="${point.row.period === S.period ? 5 : 2.5}" data-period="${esc(point.row.period)}" data-score="${esc(point.row.score)}"></circle>`).join("")}${labels}</svg>`;
  }

  function trendMarkup() {
    const items = S.countryProfile?.series || [];
    return `<section class="iw-panel lsciw-section" id="lsci-trend">${sectionHeading(tr("trendKicker"), tr("trendTitle"), tr("trendText"))}<div class="lsciw-trend-card"><div class="lsciw-chart-head">${countryHeading(currentRow())}<div><strong>${fmt(items[items.length - 1]?.score, 1)}</strong><span>${esc(items[items.length - 1]?.period || S.period)}</span></div></div>${trendSvg(items)}</div></section>`;
  }

  function projectPoint(lon, lat, width = 1000, height = 500) { return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height]; }
  function polygonPath(coordinates) {
    return coordinates.map((ring) => ring.map((point, index) => { const [x, y] = projectPoint(point[0], point[1]); return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ") + " Z").join(" ");
  }
  function geometryPath(geometry) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return polygonPath(geometry.coordinates);
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map(polygonPath).join(" ");
    return "";
  }
  function percentileClass(value) {
    const percentile = number(value);
    if (!Number.isFinite(percentile)) return "nodata";
    if (percentile >= 80) return "q5";
    if (percentile >= 60) return "q4";
    if (percentile >= 40) return "q3";
    if (percentile >= 20) return "q2";
    return "q1";
  }

  function mapSvg() {
    const map = new Map(S.ranking.map((row) => [row.iso3, row]));
    const features = S.geo?.features || [];
    return `<svg class="lsciw-map" viewBox="0 0 1000 500" role="img" aria-label="${esc(tr("mapTitle"))}">${features.map((feature, index) => { const iso3 = feature.properties?.iso3 || feature.id; const row = map.get(iso3); return `<path d="${geometryPath(feature.geometry)}" class="${percentileClass(row?.percentile)} ${iso3 === S.selectedIso ? "selected" : ""}" data-lsciw-action="map-country" data-iso="${esc(iso3)}" tabindex="${index === 0 ? 0 : -1}" role="button" aria-label="${esc(countryName(row || iso3))}${row ? `: ${fmt(row.score, 1)}` : `: ${tr("noData")}`}"></path>`; }).join("")}</svg>`;
  }

  function histogramSvg() {
    const values = S.ranking.map((row) => number(row.score)).filter(Number.isFinite);
    if (!values.length) return "";
    const min = Math.min(...values), max = Math.max(...values), bins = 12, counts = Array(bins).fill(0), span = max - min || 1;
    values.forEach((value) => { counts[Math.min(bins - 1, Math.floor((value - min) / span * bins))] += 1; });
    const peak = Math.max(...counts) || 1;
    return `<svg class="lsciw-histogram" viewBox="0 0 600 190" role="img" aria-label="${esc(tr("distribution"))}">${counts.map((count, index) => { const width = 600 / bins - 4, height = count / peak * 150; return `<rect x="${index * 600 / bins + 2}" y="${170 - height}" width="${width}" height="${height}" rx="1"></rect>`; }).join("")}<text x="4" y="187">${fmt(min, 1)}</text><text x="596" y="187" text-anchor="end">${fmt(max, 1)}</text></svg>`;
  }

  function geographyMarkup() {
    const stats = rowStats(S.ranking);
    return `<section class="iw-panel lsciw-section" id="lsci-map">${sectionHeading(tr("mapKicker"), tr("mapTitle"), tr("mapText"))}<div class="lsciw-geography-grid"><article class="lsciw-map-card">${mapSvg()}<div class="lsciw-map-legend"><span>${esc(tr("lower"))}</span>${[1,2,3,4,5].map((value) => `<i class="q${value}"></i>`).join("")}<span>${esc(tr("higher"))}</span></div><small>${esc(tr("mapKeyboard"))}</small></article><article class="lsciw-distribution-card"><div><span class="iw-overline">${esc(tr("distribution"))}</span><dl><div><dt>Min</dt><dd>${fmt(stats.min, 1)}</dd></div><div><dt>Median</dt><dd>${fmt(stats.median, 1)}</dd></div><div><dt>Max</dt><dd>${fmt(stats.max, 1)}</dd></div></dl></div>${histogramSvg()}</article></div><div class="lsciw-tooltip" role="status"></div></section>`;
  }

  function comparisonMarkup() {
    const rows = S.compare.map((iso3) => currentRow(iso3)).filter(Boolean);
    const max = Math.max(1, ...rows.map((row) => number(row.score) || 0));
    const options = S.ranking.filter((row) => !S.compare.includes(row.iso3)).slice().sort((a, b) => countryName(a).localeCompare(countryName(b), S.context?.lang === "en" ? "en" : "ru"));
    return `<section class="iw-panel lsciw-section" id="lsci-comparison">${sectionHeading(tr("comparisonKicker"), tr("comparisonTitle"), tr("comparisonText"))}<div class="lsciw-compare-toolbar"><label><span>${esc(tr("addCountry"))}</span><select id="lsciwCompareSelect">${options.map((row) => `<option value="${row.iso3}">${esc(countryName(row))} · ${row.iso3}</option>`).join("")}</select></label><button type="button" class="iw-button" data-lsciw-action="add-compare" ${S.compare.length >= 5 || !options.length ? "disabled" : ""}>${esc(tr("add"))}</button><button type="button" class="iw-button secondary" data-lsciw-action="reset-compare">${esc(tr("reset"))}</button></div><div class="lsciw-compare-list">${rows.map((row) => `<article>${countryHeading(row)}<div class="lsciw-compare-score"><strong>${fmt(row.score, 1)}</strong><span>#${intFmt(row.rank)}</span></div><div class="lsciw-bar"><i style="width:${clamp((number(row.score) || 0) / max * 100, 0, 100)}%"></i></div><dl><div><dt>${esc(tr("qoq"))}</dt><dd>${signed(row.score_change_qoq_pct, "%")}</dd></div><div><dt>${esc(tr("yoy"))}</dt><dd>${signed(row.score_change_yoy_pct, "%")}</dd></div></dl><button type="button" class="iw-icon-button" data-lsciw-action="remove-compare" data-iso="${row.iso3}" aria-label="${esc(tr("remove"))}" ${S.compare.length <= 2 ? "disabled" : ""}>×</button></article>`).join("")}</div></section>`;
  }

  function filteredRows() {
    const query = S.query.trim().toLowerCase();
    const rows = S.ranking.filter((row) => !query || countryName(row).toLowerCase().includes(query) || String(row.country || "").toLowerCase().includes(query) || String(row.iso3 || "").toLowerCase().includes(query));
    const accessor = {
      rank: (row) => Number.isFinite(number(row.rank)) ? number(row.rank) : Infinity,
      score: (row) => Number.isFinite(number(row.score)) ? number(row.score) : -Infinity,
      country: (row) => countryName(row),
      qoq: (row) => Number.isFinite(number(row.score_change_qoq_pct)) ? number(row.score_change_qoq_pct) : -Infinity,
      yoy: (row) => Number.isFinite(number(row.score_change_yoy_pct)) ? number(row.score_change_yoy_pct) : -Infinity,
    }[S.sort] || ((row) => Number.isFinite(number(row.rank)) ? number(row.rank) : Infinity);
    return rows.slice().sort((a, b) => {
      const av = accessor(a), bv = accessor(b);
      const comparison = typeof av === "string" ? av.localeCompare(bv, S.context?.lang === "en" ? "en" : "ru") : av - bv;
      return (S.direction === "desc" ? -1 : 1) * comparison || countryName(a).localeCompare(countryName(b));
    });
  }

  function rankingMarkup() {
    const rows = filteredRows(), pages = Math.max(1, Math.ceil(rows.length / S.pageSize));
    S.page = clamp(S.page, 0, pages - 1);
    const visible = rows.slice(S.page * S.pageSize, (S.page + 1) * S.pageSize);
    return `<section class="iw-panel lsciw-section" id="lsci-ranking">${sectionHeading(tr("rankingKicker"), tr("rankingTitle"), tr("rankingText"), `<button type="button" class="iw-button" data-lsciw-action="export">${esc(tr("exportCsv"))}</button>`)}<div class="lsciw-ranking-toolbar"><label class="wide"><span>${esc(tr("search"))}</span><input id="lsciwSearch" type="search" value="${esc(S.query)}" placeholder="${esc(tr("search"))}"></label><label><span>${esc(tr("sort"))}</span><select id="lsciwSort"><option value="rank" ${S.sort === "rank" ? "selected" : ""}>${esc(tr("byRank"))}</option><option value="score" ${S.sort === "score" ? "selected" : ""}>${esc(tr("byScore"))}</option><option value="country" ${S.sort === "country" ? "selected" : ""}>${esc(tr("byCountry"))}</option><option value="qoq" ${S.sort === "qoq" ? "selected" : ""}>${esc(tr("byQoq"))}</option><option value="yoy" ${S.sort === "yoy" ? "selected" : ""}>${esc(tr("byYoy"))}</option></select></label><label><span>${esc(tr("sort"))}</span><select id="lsciwDirection"><option value="asc" ${S.direction === "asc" ? "selected" : ""}>${esc(tr("ascending"))}</option><option value="desc" ${S.direction === "desc" ? "selected" : ""}>${esc(tr("descending"))}</option></select></label><label><span>${esc(tr("rows"))}</span><select id="lsciwPageSize">${[10,25,50,100].map((size) => `<option value="${size}" ${S.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label></div><div class="iw-table-wrap"><table class="iw-table lsciw-table"><thead><tr><th>${esc(tr("rank"))}</th><th>${esc(tr("country"))}</th><th>${esc(tr("score"))}</th><th>${esc(tr("percentile"))}</th><th>${esc(tr("qoq"))}</th><th>${esc(tr("yoy"))}</th><th></th></tr></thead><tbody>${visible.map((row) => `<tr class="${row.iso3 === S.selectedIso ? "selected" : ""}"><td><strong>#${intFmt(row.rank)}</strong>${row.tied_rank ? `<small>${esc(tr("tie"))}</small>` : ""}</td><td><button type="button" class="lsciw-country-button" data-lsciw-action="country" data-iso="${row.iso3}">${flag(row)}<span><strong>${esc(countryName(row))}</strong><small>${esc(row.iso3)} · ${esc(row.ref_area_code)}</small></span></button></td><td>${fmt(row.score, 1)}</td><td>${row.percentile == null ? "—" : `${fmt(row.percentile, 1)}%`}</td><td class="${number(row.score_change_qoq_pct) > 0 ? "positive" : number(row.score_change_qoq_pct) < 0 ? "negative" : ""}">${signed(row.score_change_qoq_pct, "%")}</td><td class="${number(row.score_change_yoy_pct) > 0 ? "positive" : number(row.score_change_yoy_pct) < 0 ? "negative" : ""}">${signed(row.score_change_yoy_pct, "%")}</td><td><button type="button" class="iw-button compact" data-lsciw-action="evidence" data-iso="${row.iso3}">${esc(tr("evidence"))}</button></td></tr>`).join("") || `<tr><td colspan="7">${esc(tr("noData"))}</td></tr>`}</tbody></table></div><footer class="lsciw-pagination"><span>${esc(tr("page"))} ${S.page + 1} / ${pages} · ${intFmt(rows.length)}</span><div><button type="button" class="iw-button secondary" data-lsciw-action="previous-page" ${S.page === 0 ? "disabled" : ""}>${esc(tr("previous"))}</button><button type="button" class="iw-button secondary" data-lsciw-action="next-page" ${S.page + 1 >= pages ? "disabled" : ""}>${esc(tr("next"))}</button></div></footer></section>`;
  }

  function sourceMarkup() {
    return `<section class="iw-panel lsciw-section" id="lsci-source">${sectionHeading(tr("sourceKicker"), tr("sourceTitle"), tr("sourceText"))}<div class="lsciw-source-grid"><dl><div><dt>${esc(tr("publisher"))}</dt><dd>${esc(S.overview.publisher)}</dd></div><div><dt>${esc(tr("dataPartner"))}</dt><dd>${esc(S.overview.data_partner)}</dd></div><div><dt>${esc(tr("license"))}</dt><dd>${esc(S.license.license?.spdx_like || "CC-BY-3.0-IGO")}</dd></div><div><dt>${esc(tr("updated"))}</dt><dd>${esc(S.overview.last_updated)}</dd></div></dl><div class="lsciw-source-links"><a class="iw-button" href="${esc(S.releases?.release?.official_data_viewer_url)}" target="_blank" rel="noopener">${esc(tr("viewer"))}</a><a class="iw-button secondary" href="${esc(S.releases?.release?.official_metadata_url)}" target="_blank" rel="noopener">${esc(tr("metadata"))}</a><a class="iw-button secondary" href="${esc(S.releases?.release?.official_methodology_url)}" target="_blank" rel="noopener">${esc(tr("methodology"))}</a></div></div></section>`;
  }

  function evidenceMarkup() {
    if (!S.evidence) return "";
    const row = currentRow(S.evidence);
    if (!row) return "";
    const provenance = row.provenance || {};
    const fields = [
      [tr("country"), countryName(row)], [tr("iso3"), row.iso3], [tr("refArea"), row.ref_area_code], [tr("period"), row.period], [tr("officialValue"), fmt(row.score, 4)], [tr("sourceValue"), row.source_value_text], [tr("rank"), row.rank == null ? "—" : `#${row.rank}`], [tr("rankStatus"), row.rank_status], [tr("scoreStatus"), row.score_status], [tr("quality"), row.quality_flag], [tr("rawHash"), shortHash(provenance.raw_csv_sha256)], [tr("rowHash"), shortHash(row.row_sha256)], [tr("transform"), provenance.transform_id], [tr("formula"), provenance.transform_code_version], [tr("sourceOrder"), provenance.source_order],
    ];
    return `<div class="lsciw-drawer-backdrop" data-lsciw-action="close-evidence"><aside class="lsciw-drawer" role="dialog" aria-modal="true" aria-label="${esc(tr("evidence"))}"><header>${countryHeading(row)}<button type="button" class="iw-icon-button" data-lsciw-action="close-evidence" aria-label="${esc(tr("close"))}">×</button></header><div class="lsciw-drawer-score"><strong>${fmt(row.score, 1)}</strong><span>${esc(row.period)} · #${intFmt(row.rank)}</span></div><dl>${fields.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value ?? "—")}</dd></div>`).join("")}</dl><div class="lsciw-drawer-links"><a class="iw-button" href="${esc(provenance.source_url || S.releases?.release?.official_data_viewer_url)}" target="_blank" rel="noopener">${esc(tr("source"))}</a><button type="button" class="iw-button secondary" data-lsciw-action="close-evidence">${esc(tr("close"))}</button></div></aside></div>`;
  }

  function validationBanner() {
    return S.validation ? `<div class="lsciw-validation" role="status">${esc(tr("validation"))}</div>` : "";
  }

  function workspaceMarkup() {
    return `<section class="index-workspace lsciw">${validationBanner()}${heroMarkup()}${summaryMarkup()}${S.mode === "numeric" ? `${trendMarkup()}${geographyMarkup()}${comparisonMarkup()}${rankingMarkup()}` : importMarkup()}${componentsMarkup()}${sourceMarkup()}${evidenceMarkup()}</section>`;
  }

  function loadingMarkup() { return `<section class="index-workspace lsciw"><div class="iw-loading"><span></span><p>${esc(tr("loading"))}</p></div></section>`; }
  function errorMarkup(error) { return `<section class="index-workspace lsciw"><article class="iw-panel lsciw-error"><h2>${esc(tr("loadError"))}</h2><p>${esc(error?.message || error)}</p><button type="button" class="iw-button" data-lsciw-action="retry">${esc(tr("retry"))}</button></article></section>`; }

  function exportCsv() {
    if (S.mode !== "numeric" || S.validationData) return;
    const url = `${API}/export.csv?period=${encodeURIComponent(S.period)}`;
    const link = document.createElement("a"); link.href = url; link.download = `unctad_lsci_${S.period}.csv`; document.body.appendChild(link); link.click(); link.remove();
  }

  function tooltip(node, event) {
    const tip = S.context.root.querySelector(".lsciw-tooltip"); if (!tip) return;
    const row = currentRow(node.dataset.iso);
    tip.innerHTML = `<strong>${esc(countryName(row || node.dataset.iso))}</strong><span>${row ? `${fmt(row.score, 1)} · #${intFmt(row.rank)}` : esc(tr("noData"))}</span>`;
    tip.classList.add("is-open");
    const rect = node.getBoundingClientRect();
    tip.style.left = `${clamp(event?.clientX || rect.left + rect.width / 2, 12, window.innerWidth - 280)}px`;
    tip.style.top = `${clamp((event?.clientY || rect.top) + 14, 12, window.innerHeight - 90)}px`;
  }
  function hideTooltip() { S.context.root.querySelector(".lsciw-tooltip")?.classList.remove("is-open"); }

  async function selectCountry(iso3) {
    S.selectedIso = String(iso3 || S.selectedIso).toUpperCase();
    if (!S.compare.includes(S.selectedIso)) S.compare.unshift(S.selectedIso);
    S.compare = Array.from(new Set(S.compare)).slice(0, 5);
    S.context?.setCountry?.(S.selectedIso);
    if (S.mode === "numeric") { S.numericPromise = null; await loadNumeric(true); }
    paint();
  }

  async function setPeriod(period) {
    if (!/^\d{4}-Q[1-4]$/.test(period)) return;
    S.period = period; S.page = 0; S.evidence = null; S.numericPromise = null;
    S.context?.setYear?.(periodParts(period).year);
    if (S.mode === "numeric") await loadNumeric(true);
    paint("lsci-ranking");
  }

  function resetComparison() {
    S.compare = DEFAULT_COMPARE.filter((iso3) => currentRow(iso3));
    if (S.compare.length < 2) S.compare = S.ranking.slice(0, 3).map((row) => row.iso3);
    if (!S.compare.includes(S.selectedIso) && currentRow(S.selectedIso)) S.compare.unshift(S.selectedIso);
    S.compare = Array.from(new Set(S.compare)).slice(0, 5);
  }

  function bind() {
    const root = S.context.root;
    root.addEventListener("click", async (event) => {
      const control = event.target.closest("[data-lsciw-action]"); if (!control) return;
      const action = control.dataset.lsciwAction;
      if (action === "retry") return render(S.context, { force: true });
      if (action === "country" || action === "map-country") return selectCountry(control.dataset.iso);
      if (action === "add-compare") { const iso3 = root.querySelector("#lsciwCompareSelect")?.value; if (iso3 && !S.compare.includes(iso3) && S.compare.length < 5) S.compare.push(iso3); return paint("lsci-comparison"); }
      if (action === "remove-compare") { if (S.compare.length > 2) S.compare = S.compare.filter((iso3) => iso3 !== control.dataset.iso); return paint("lsci-comparison"); }
      if (action === "reset-compare") { resetComparison(); return paint("lsci-comparison"); }
      if (action === "previous-page") { S.page = Math.max(0, S.page - 1); return paint("lsci-ranking"); }
      if (action === "next-page") { S.page += 1; return paint("lsci-ranking"); }
      if (action === "evidence") { S.evidence = control.dataset.iso; return paint(); }
      if (action === "close-evidence") { if (event.target === control || control.closest(".lsciw-drawer")) { S.evidence = null; return paint(); } }
      if (action === "export") return exportCsv();
      if (action === "copy") {
        const command = control.dataset.command === "fetch" ? S.meta.import_workflow.fetch_command : S.meta.import_workflow.import_command;
        try { await navigator.clipboard.writeText(command); control.textContent = tr("copied"); setTimeout(() => { control.textContent = tr("copy"); }, 1200); } catch (_) { /* clipboard may be unavailable */ }
      }
    });
    root.addEventListener("change", async (event) => {
      const target = event.target;
      if (target.id === "lsciwPeriod") return setPeriod(target.value);
      if (target.id === "lsciwSort") { S.sort = target.value; S.page = 0; return paint("lsci-ranking"); }
      if (target.id === "lsciwDirection") { S.direction = target.value; S.page = 0; return paint("lsci-ranking"); }
      if (target.id === "lsciwPageSize") { S.pageSize = Number(target.value) || 25; S.page = 0; return paint("lsci-ranking"); }
    });
    const search = root.querySelector("#lsciwSearch");
    if (search) { let timer; search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { S.query = search.value; S.page = 0; paint("lsci-ranking"); }, 180); }); }
    const mapNodes = Array.from(root.querySelectorAll("[data-lsciw-action='map-country']"));
    mapNodes.forEach((node, index) => {
      node.addEventListener("pointerenter", (event) => tooltip(node, event)); node.addEventListener("pointermove", (event) => tooltip(node, event)); node.addEventListener("pointerleave", hideTooltip); node.addEventListener("focus", () => tooltip(node)); node.addEventListener("blur", hideTooltip);
      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectCountry(node.dataset.iso); }
        else if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); const delta = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1; const next = mapNodes[(index + delta + mapNodes.length) % mapNodes.length]; node.tabIndex = -1; next.tabIndex = 0; next.focus(); }
        else if (event.key === "Escape") hideTooltip();
      });
    });
    document.addEventListener("keydown", escapeEvidence, { once: true });
  }

  function escapeEvidence(event) {
    if (event.key === "Escape" && S.evidence) { S.evidence = null; paint(); }
  }

  function paint(anchor = "") {
    const scrollY = window.scrollY;
    ensureState();
    S.context.root.innerHTML = workspaceMarkup();
    bind();
    document.documentElement.dataset.unctadLsciReady = "true";
    document.documentElement.dataset.unctadLsciMode = S.mode;
    document.documentElement.dataset.unctadLsciPeriod = S.period;
    window.dispatchEvent(new CustomEvent("gir:unctad-lsci-ready", { detail: { mode: S.mode, iso3: S.selectedIso, period: S.period } }));
    if (anchor) S.context.root.querySelector(`#${CSS.escape(anchor)}`)?.scrollIntoView({ block: "start" }); else window.scrollTo({ top: scrollY, behavior: "auto" });
  }

  async function render(context, options = {}) {
    if (!context?.root) throw new Error("UNCTAD LSCI workspace requires a root element");
    if (!context.country) return;
    S.context = context;
    S.selectedIso = String(context.country).toUpperCase();
    const token = ++S.renderToken;
    context.root.innerHTML = loadingMarkup();
    document.documentElement.dataset.unctadLsciReady = "false";
    try {
      if (options.force) { S.loadPromise = null; S.numericPromise = null; }
      await loadBase(Boolean(options.force));
      if (token !== S.renderToken) return;
      ensureState();
      if (S.mode === "numeric") await loadNumeric(Boolean(options.force));
      if (token !== S.renderToken) return;
      paint();
    } catch (error) {
      console.error("UNCTAD LSCI workspace failed", error);
      if (token !== S.renderToken) return;
      context.root.innerHTML = errorMarkup(error);
      context.root.querySelector("[data-lsciw-action='retry']")?.addEventListener("click", () => render(context, { force: true }));
      document.documentElement.dataset.unctadLsciReady = "error";
    }
  }

  function invalidate() { S.renderToken += 1; S.numericPromise = null; }
  const api = Object.freeze({ render, invalidate, getPeriod: () => S.period, version: "14.0.0-stage14-native" });
  window.GIRUNCTADLSCI = api;
  window.GIRUnctadLsciWorkspace = api;
})();
