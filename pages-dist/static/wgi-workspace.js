/* GIR Governance Observatory — Worldwide Governance Indicators workspace. */
(() => {
  "use strict";

  const DIMENSIONS = Object.freeze(["VA", "PV", "GE", "RQ", "RL", "CC"]);
  const BANDS = Object.freeze([
    Object.freeze({ code: "very-low", min: 0, max: 20, ru: "0–19 · очень низкий", en: "0–19 · very low" }),
    Object.freeze({ code: "low", min: 20, max: 40, ru: "20–39 · низкий", en: "20–39 · low" }),
    Object.freeze({ code: "middle", min: 40, max: 60, ru: "40–59 · средний", en: "40–59 · middle" }),
    Object.freeze({ code: "high", min: 60, max: 80, ru: "60–79 · высокий", en: "60–79 · high" }),
    Object.freeze({ code: "very-high", min: 80, max: 101, ru: "80–100 · очень высокий", en: "80–100 · very high" }),
  ]);
  const cache = new Map();
  const pending = new Map();
  let geoPromise = null;
  let geoData = null;
  let context = null;
  let payload = null;
  let renderSerial = 0;
  let searchTimer = null;

  const ui = {
    query: "",
    region: "all",
    income: "all",
    sort: "rank",
    direction: "asc",
    page: 1,
    pageSize: 25,
    mapBand: "all",
  };

  const tr = (ru, en) => context?.lang === "en" ? en : ru;
  const esc = (value) => context?.escapeHtml
    ? context.escapeHtml(value)
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const locale = () => context?.lang === "en" ? "en-US" : "ru-RU";
  const fmt = (value, digits = 1) => finite(value) == null ? "—" : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const intFmt = (value) => finite(value) == null ? "—" : Math.round(Number(value)).toLocaleString(locale());
  const signed = (value, digits = 1) => {
    const number = finite(value);
    if (number == null) return "—";
    const sign = number > 0 ? "+" : number < 0 ? "−" : "±";
    return `${sign}${fmt(Math.abs(number), digits)}`;
  };
  const localName = (item) => context?.lang === "en"
    ? (item?.name_en || item?.publisher_country_name || item?.iso3 || "")
    : (item?.name_ru || item?.name_en || item?.publisher_country_name || item?.iso3 || "");
  const dimensionMeta = (code = payload?.selected_dimension) => (payload?.dimension_metadata || []).find((item) => item.code === code) || { code, name_ru: code, name_en: code, description_ru: "", description_en: "" };
  const dimensionName = (code, short = false) => {
    if (short) return code;
    const item = dimensionMeta(code);
    return context?.lang === "en" ? item.name_en : item.name_ru;
  };
  const dimensionDescription = (code) => {
    const item = dimensionMeta(code);
    return context?.lang === "en" ? item.description_en : item.description_ru;
  };
  const country = () => payload?.country || { iso3: context?.country || "", name_ru: context?.country || "", name_en: context?.country || "" };
  const observation = () => payload?.observation || {};
  const ranking = () => Array.isArray(payload?.ranking) ? payload.ranking : [];
  const effectiveYear = () => Number(payload?.value_year || context?.year || 2024);
  const selectedDimension = () => String(payload?.selected_dimension || context?.dimension || "GE").toUpperCase();
  const cacheKey = () => `${String(context?.country || "").toUpperCase()}:${Number(context?.year || 2024)}:${String(context?.dimension || "GE").toUpperCase()}`;

  function icon(name) {
    return `<img class="wgi-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(row, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(row, className);
    return `<span class="wgi-flag-fallback" aria-hidden="true">${esc(row?.iso3 || "")}</span>`;
  }

  function bandFor(value) {
    const score = finite(value);
    if (score == null) return null;
    return BANDS.find((item) => score >= item.min && score < item.max) || BANDS[BANDS.length - 1];
  }

  function rankLabel(row = observation()) {
    return finite(row.global_rank_derived) == null
      ? "—"
      : `${intFmt(row.global_rank_derived)} / ${intFmt(row.global_count)}`;
  }

  function loadingMarkup() {
    return `<section class="wgi-workspace wgi-loading" aria-live="polite">
      <div class="wgi-loading-mark"><span>WGI</span><b>1996—2024</b></div>
      <p class="wgi-kicker">${tr("Государство и институты", "Governance and institutions")}</p>
      <h1>${tr("Загружается шестимерный профиль государственного управления", "Loading the six-dimensional governance profile")}</h1>
      <p>${tr("Официальные оценки Всемирного банка, интервалы неопределённости, источники и международные сопоставления.", "Official World Bank estimates, uncertainty intervals, sources and international comparisons.")}</p>
      <div class="wgi-loading-lines" aria-hidden="true">${"<i></i>".repeat(6)}</div>
    </section>`;
  }

  function errorMarkup(error) {
    return `<section class="wgi-workspace wgi-error" role="alert">
      <div class="wgi-loading-mark"><span>WGI</span><b>ERROR</b></div>
      <p class="wgi-kicker">${tr("Ошибка загрузки", "Loading error")}</p>
      <h1>${tr("Рабочее пространство WGI временно недоступно", "The WGI workspace is temporarily unavailable")}</h1>
      <p>${esc(error?.message || error || tr("Не удалось получить данные.", "Unable to retrieve data."))}</p>
      <button class="wgi-button is-primary" type="button" data-wgi-retry>${tr("Повторить", "Retry")}</button>
    </section>`;
  }

  async function getPayload(force = false) {
    const key = cacheKey();
    if (!force && cache.has(key)) return cache.get(key);
    if (!force && pending.has(key)) return pending.get(key);
    const query = new URLSearchParams({
      country: String(context.country || "").toUpperCase(),
      year: String(Number(context.year || 2024)),
      dimension: String(context.dimension || "GE").toUpperCase(),
    });
    const request = fetch(`/api/index/WGI/workspace?${query}`, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const value = await response.json();
        cache.set(key, value);
        return value;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  }

  function scoreRing(value) {
    const score = clamp(value);
    return `<div class="wgi-score-ring" style="--wgi-score:${score}" aria-label="${tr("Абсолютная оценка", "Absolute score")}: ${fmt(score, 1)} ${tr("из 100", "out of 100")}">
      <div><strong>${fmt(score, 1)}</strong><span>/ 100</span></div>
    </div>`;
  }

  function heroMarkup() {
    const obs = observation();
    const meta = dimensionMeta();
    const name = localName(country());
    return `<header class="wgi-hero" data-testid="wgi-hero">
      <div class="wgi-hero-copy">
        <div class="wgi-breadcrumb"><span>${tr("Государство и институты", "Governance and institutions")}</span><i></i><strong>World Bank · WGI</strong></div>
        <p class="wgi-kicker">${tr("Обсерватория государственного управления", "Governance observatory")}</p>
        <h1>${tr("Всемирные показатели", "Worldwide Governance")}<br><em>${tr("государственного управления", "Indicators")}</em></h1>
        <p class="wgi-hero-lead">${esc(context.lang === "en" ? payload.index.description_en : payload.index.description_ru)}</p>
        <div class="wgi-hero-actions">
          <a class="wgi-button is-primary" href="#wgi-world">${icon("map")}${tr("Мировая карта", "World map")}</a>
          <a class="wgi-button" href="/api/index/WGI/workspace.csv?country=${esc(country().iso3)}&year=${effectiveYear()}&dimension=${selectedDimension()}&lang=${context.lang}" download>${icon("download")}${tr("Экспорт CSV", "Export CSV")}</a>
          <button class="wgi-button" type="button" data-wgi-copy>${icon("link")}${tr("Скопировать ссылку", "Copy link")}</button>
          <button class="wgi-button" type="button" data-wgi-provenance="${esc(obs.value_id || "")}" ${obs.value_id ? "" : "disabled"}>${icon("database")}${tr("Доказательство значения", "Value evidence")}</button>
        </div>
      </div>
      <aside class="wgi-hero-score" aria-label="${esc(dimensionName(selectedDimension()))}">
        <div class="wgi-score-topline"><span>${esc(selectedDimension())}</span><span>${effectiveYear()}</span></div>
        ${scoreRing(obs.absolute_score)}
        <h2>${esc(meta ? (context.lang === "en" ? meta.name_en : meta.name_ru) : selectedDimension())}</h2>
        <p>${esc(meta ? (context.lang === "en" ? meta.description_en : meta.description_ru) : "")}</p>
        <div class="wgi-rank-line"><strong>${rankLabel()}</strong><span>${tr("производное место GIR", "GIR-derived rank")}</span></div>
        <div class="wgi-confidence-mini">
          <span>${tr("90% интервал", "90% interval")}</span>
          <b>${fmt(obs.absolute_ci90_low, 1)}—${fmt(obs.absolute_ci90_high, 1)}</b>
        </div>
      </aside>
    </header>`;
  }

  function advisoryMarkup() {
    return `<aside class="wgi-advisory" data-testid="wgi-no-overall">
      <div class="wgi-advisory-index">06</div>
      <div><strong>${tr("Шесть измерений — не один рейтинг", "Six dimensions — not one league table")}</strong>
      <p>${tr("Всемирный банк не публикует общий WGI-балл или сводное место. GIR не усредняет измерения: карта, динамика и рейтинг всегда относятся к выбранному показателю. Небольшие различия следует читать вместе с 90%-ми интервалами неопределённости.", "The World Bank publishes no overall WGI score or rank. GIR does not average the dimensions: every map, trend and ranking refers to the selected indicator. Small differences should be read together with 90% uncertainty intervals.")}</p></div>
    </aside>`;
  }

  function dimensionTabsMarkup() {
    return `<section class="wgi-dimensions" aria-label="${tr("Измерения WGI", "WGI dimensions")}" data-testid="wgi-dimensions">
      <div class="wgi-section-head compact"><div><p class="wgi-kicker">${tr("Выберите аналитический слой", "Choose an analytical layer")}</p><h2>${tr("Шесть самостоятельных измерений", "Six separate dimensions")}</h2></div><p>${tr("Переключение изменяет весь исследовательский контекст — от карты до источников.", "The selection changes the whole research context, from the map to source evidence.")}</p></div>
      <div class="wgi-dimension-grid">
        ${(payload.dimension_metadata || []).map((item, index) => {
          const row = (payload.profile || []).find((profile) => profile.dimension_code === item.code) || {};
          const active = item.code === selectedDimension();
          return `<button class="wgi-dimension-card${active ? " is-active" : ""}" type="button" data-wgi-dimension="${item.code}" aria-pressed="${active}">
            <span class="wgi-dimension-index">0${index + 1}</span>
            <span class="wgi-dimension-code">${item.code}</span>
            <strong>${esc(context.lang === "en" ? item.name_en : item.name_ru)}</strong>
            <span class="wgi-dimension-value">${fmt(row.absolute_score, 1)}<small>/100</small></span>
            <i style="--value:${clamp(row.absolute_score)}%"></i>
          </button>`;
        }).join("")}
      </div>
    </section>`;
  }

  function jumpNavMarkup() {
    const items = [
      ["profile", tr("Профиль", "Profile")], ["uncertainty", tr("Неопределённость", "Uncertainty")],
      ["world", tr("Карта", "Map")], ["trend", tr("Динамика", "Trend")],
      ["sources", tr("Источники", "Sources")], ["ranking", tr("Рейтинг", "Ranking")], ["method", tr("Методология", "Method")],
    ];
    return `<nav class="wgi-jump-nav" aria-label="${tr("Разделы WGI", "WGI sections")}">${items.map(([id, label], i) => `<a href="#wgi-${id}"><span>0${i + 1}</span>${esc(label)}</a>`).join("")}</nav>`;
  }

  function kpiMarkup() {
    const obs = observation();
    const profile = payload.profile || [];
    const avg = profile.length ? profile.reduce((sum, row) => sum + Number(row.absolute_score || 0), 0) / profile.length : null;
    const previous = [...(payload.trend || [])].reverse().find((row) => Number(row.year) < effectiveYear());
    return `<div class="wgi-kpi-grid">
      <article><span>${tr("Абсолютный балл", "Absolute score")}</span><strong>${fmt(obs.absolute_score, 1)}</strong><small>${tr("официальная шкала 0–100", "official 0–100 scale")}</small></article>
      <article><span>${tr("Место в измерении", "Dimension rank")}</span><strong>${rankLabel()}</strong><small>${tr("расчёт GIR из точных баллов", "GIR-derived from exact scores")}</small></article>
      <article><span>${tr("Стандартизованная оценка", "Standardized estimate")}</span><strong>${signed(obs.governance_estimate, 2)}</strong><small>${tr("официальный estimate WGI", "official WGI estimate")}</small></article>
      <article><span>${tr("Изменение к предыдущему выпуску", "Change from previous release")}</span><strong class="${previous && obs.absolute_score >= previous.absolute_score ? "is-positive" : "is-negative"}">${previous ? signed(obs.absolute_score - previous.absolute_score, 1) : "—"}</strong><small>${previous ? `${previous.year} → ${effectiveYear()}` : tr("нет сопоставимого наблюдения", "no comparable observation")}</small></article>
      <article><span>${tr("Процентиль", "Percentile")}</span><strong>${fmt(obs.percentile_derived, 1)}</strong><small>${tr("внутри выбранного измерения", "within the selected dimension")}</small></article>
      <article><span>${tr("Шесть измерений", "Six dimensions")}</span><strong>${fmt(avg, 1)}</strong><small>${tr("среднее показано только как профиль, не WGI-итог", "profile mean only, not an overall WGI")}</small></article>
    </div>`;
  }

  function profileMarkup() {
    const rows = payload.profile || [];
    const best = [...rows].sort((a, b) => Number(b.absolute_score) - Number(a.absolute_score))[0];
    const weak = [...rows].sort((a, b) => Number(a.absolute_score) - Number(b.absolute_score))[0];
    return `<section id="wgi-profile" class="wgi-section" data-testid="wgi-profile">
      <div class="wgi-section-number">01</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${esc(localName(country()))} · ${effectiveYear()}</p><h2>${tr("Институциональный профиль страны", "Country governance profile")}</h2></div><p>${tr("Официальные абсолютные оценки шести измерений приведены на единой шкале 0–100. Профиль показывает структуру, но не образует новый сводный индекс.", "Official absolute scores for all six dimensions share a 0–100 scale. The profile reveals structure but does not create a new composite index.")}</p></div>
      ${kpiMarkup()}
      <div class="wgi-profile-layout">
        <div class="wgi-profile-bars">
          ${rows.map((row) => `<button type="button" class="wgi-profile-row${row.dimension_code === selectedDimension() ? " is-active" : ""}" data-wgi-dimension="${row.dimension_code}">
            <span class="wgi-profile-code">${row.dimension_code}</span>
            <span class="wgi-profile-name">${esc(dimensionName(row.dimension_code))}</span>
            <span class="wgi-profile-track"><i style="width:${clamp(row.absolute_score)}%"></i></span>
            <strong>${fmt(row.absolute_score, 1)}</strong>
            <small>#${intFmt(row.global_rank_derived)}</small>
          </button>`).join("")}
        </div>
        <aside class="wgi-profile-reading">
          <p class="wgi-kicker">${tr("Как читать профиль", "How to read the profile")}</p>
          <div><span>${tr("Наиболее высокий балл", "Highest score")}</span><strong>${best ? esc(dimensionName(best.dimension_code)) : "—"}</strong><b>${best ? fmt(best.absolute_score, 1) : "—"}</b></div>
          <div><span>${tr("Наиболее низкий балл", "Lowest score")}</span><strong>${weak ? esc(dimensionName(weak.dimension_code)) : "—"}</strong><b>${weak ? fmt(weak.absolute_score, 1) : "—"}</b></div>
          <p>${tr("Разрыв между измерениями отражает неоднородность институтов. Он не является статистической значимостью и должен сопоставляться с интервалами каждого показателя.", "The spread between dimensions reflects institutional heterogeneity. It is not a significance test and should be read alongside each indicator’s interval.")}</p>
        </aside>
      </div>
    </section>`;
  }

  function uncertaintyGraphic() {
    const obs = observation();
    const low = clamp(obs.absolute_ci90_low);
    const high = clamp(obs.absolute_ci90_high);
    const score = clamp(obs.absolute_score);
    return `<div class="wgi-interval" role="img" aria-label="${tr("90-процентный интервал неопределённости", "90 percent uncertainty interval")}: ${fmt(low, 1)}—${fmt(high, 1)}">
      <div class="wgi-interval-scale">${[0, 20, 40, 60, 80, 100].map((n) => `<span style="left:${n}%">${n}</span>`).join("")}</div>
      <div class="wgi-interval-track"><i class="wgi-ci" style="left:${low}%;width:${Math.max(0.7, high - low)}%"></i><b style="left:${score}%"></b></div>
      <div class="wgi-interval-labels"><span style="left:${low}%">${fmt(low, 1)}</span><strong style="left:${score}%">${fmt(score, 1)}</strong><span style="left:${high}%">${fmt(high, 1)}</span></div>
    </div>`;
  }

  function distributionGraphic() {
    const rows = ranking();
    const bins = Array.from({ length: 10 }, (_, i) => ({ from: i * 10, to: (i + 1) * 10, n: 0 }));
    rows.forEach((row) => { const value = clamp(row.absolute_score, 0, 99.999); bins[Math.floor(value / 10)].n += 1; });
    const max = Math.max(1, ...bins.map((bin) => bin.n));
    const selected = clamp(observation().absolute_score);
    return `<div class="wgi-histogram" role="img" aria-label="${tr("Распределение стран по баллу", "Distribution of country scores")}">
      <div class="wgi-hist-bars">${bins.map((bin) => `<div><i style="height:${Math.max(3, bin.n / max * 100)}%"></i><span>${bin.from}</span><b>${bin.n}</b></div>`).join("")}</div>
      <div class="wgi-hist-marker" style="left:${selected}%"><span>${esc(country().iso3)} · ${fmt(selected, 1)}</span></div>
    </div>`;
  }

  function nearestRows() {
    const rows = ranking();
    const index = rows.findIndex((row) => row.iso3 === country().iso3);
    return index < 0 ? [] : rows.slice(Math.max(0, index - 2), Math.min(rows.length, index + 3));
  }

  function uncertaintyMarkup() {
    const obs = observation();
    const overlaps = ranking().filter((row) => row.iso3 !== country().iso3 && finite(row.absolute_ci90_low) != null && Number(row.absolute_ci90_low) <= Number(obs.absolute_ci90_high) && Number(row.absolute_ci90_high) >= Number(obs.absolute_ci90_low)).length;
    return `<section id="wgi-uncertainty" class="wgi-section wgi-uncertainty-section" data-testid="wgi-uncertainty">
      <div class="wgi-section-number">02</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${esc(dimensionName(selectedDimension()))}</p><h2>${tr("Положение и статистическая неопределённость", "Position and statistical uncertainty")}</h2></div><p>${tr("Точечная оценка — не точная граница. Интервал показывает диапазон, совместимый с моделью WGI, и помогает не переинтерпретировать малые различия между странами.", "A point estimate is not a precise boundary. The interval shows a range compatible with the WGI model and guards against over-interpreting small country differences.")}</p></div>
      <div class="wgi-uncertainty-grid">
        <article class="wgi-panel wide"><div class="wgi-panel-head"><div><span>${tr("Официальная абсолютная оценка", "Official absolute score")}</span><h3>${fmt(obs.absolute_score, 1)} <small>/ 100</small></h3></div><div><span>${tr("Стандартная ошибка", "Standard error")}</span><strong>${fmt(obs.absolute_standard_error, 2)}</strong></div></div>${uncertaintyGraphic()}<p class="wgi-panel-note">${tr("Границы 90%-го интервала импортированы из официального набора WGI; GIR их не оценивает повторно.", "The 90% interval bounds are imported from the official WGI dataset; GIR does not re-estimate them.")}</p></article>
        <article class="wgi-panel"><p class="wgi-kicker">${tr("Групповые позиции", "Group positions")}</p><div class="wgi-rank-stack"><div><span>${tr("Мир", "World")}</span><strong>${intFmt(obs.global_rank_derived)}<small>/ ${intFmt(obs.global_count)}</small></strong></div><div><span>${tr("Регион", "Region")}</span><strong>${intFmt(obs.region_rank_derived)}<small>/ ${intFmt(obs.region_count)}</small></strong></div><div><span>${tr("Доходная группа", "Income group")}</span><strong>${intFmt(obs.income_rank_derived)}<small>/ ${intFmt(obs.income_count)}</small></strong></div></div><p class="wgi-panel-note">${tr("Все места являются производными расчётами GIR по точным официальным баллам.", "All ranks are GIR-derived from exact official scores.")}</p></article>
        <article class="wgi-panel"><p class="wgi-kicker">${tr("Перекрывающиеся интервалы", "Overlapping intervals")}</p><strong class="wgi-large-number">${intFmt(overlaps)}</strong><p>${tr("стран имеют 90%-е интервалы, пересекающиеся с интервалом выбранной страны. Это не означает тождественность, но ограничивает уверенность в строгом ранжировании.", "countries have 90% intervals overlapping the selected country. This does not imply equality, but limits confidence in strict ordering.")}</p></article>
        <article class="wgi-panel wide"><div class="wgi-panel-head"><div><span>${tr("Международное распределение", "International distribution")}</span><h3>${intFmt(ranking().length)} ${tr("экономик", "economies")}</h3></div><div><span>${tr("Процентиль страны", "Country percentile")}</span><strong>${fmt(obs.percentile_derived, 1)}</strong></div></div>${distributionGraphic()}</article>
      </div>
      <div class="wgi-neighbours"><p class="wgi-kicker">${tr("Ближайшие позиции", "Nearest positions")}</p>${nearestRows().map((row) => `<button type="button" data-wgi-country="${row.iso3}" class="${row.iso3 === country().iso3 ? "is-selected" : ""}">${flag(row, "flag-img inline")}<span>${esc(localName(row))}</span><strong>#${intFmt(row.global_rank_derived)}</strong><b>${fmt(row.absolute_score, 1)}</b></button>`).join("")}</div>
    </section>`;
  }

  function bbox(features) {
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

  function geomPath(geometry, width, height, bounds) {
    if (!geometry) return "";
    const project = (lon, lat) => [
      (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon || 1) * width,
      height - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1) * height,
    ];
    const ring = (points) => points.map((point, index) => { const [x, y] = project(point[0], point[1]); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";
    if (geometry.type === "Polygon") return geometry.coordinates.map(ring).join("");
    if (geometry.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map(ring).join("")).join("");
    return "";
  }

  function loadGeo() {
    if (geoData) return Promise.resolve(geoData);
    if (!geoPromise) geoPromise = fetch("/static/world_countries_lite.geojson").then((response) => {
      if (!response.ok) throw new Error(`Map ${response.status}`);
      return response.json();
    }).then((value) => { geoData = value; return value; });
    return geoPromise;
  }

  function mapMarkup() {
    return `<section id="wgi-world" class="wgi-section" data-testid="wgi-world-map">
      <div class="wgi-section-number">03</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${effectiveYear()} · ${esc(selectedDimension())}</p><h2>${tr("Мировая география государственного управления", "Global geography of governance")}</h2></div><p>${tr("Фиксированные диапазоны GIR обеспечивают сопоставимый цветовой смысл между измерениями и годами. Это аналитическая визуализация, а не официальная классификация Всемирного банка.", "Fixed GIR bands keep colour meanings comparable across dimensions and years. This is an analytical visualisation, not an official World Bank classification.")}</p></div>
      <div class="wgi-map-toolbar"><div class="wgi-map-legend">${BANDS.map((band) => `<button type="button" data-wgi-band="${band.code}" class="${ui.mapBand === band.code ? "is-active" : ""}"><i class="band-${band.code}"></i>${esc(context.lang === "en" ? band.en : band.ru)}</button>`).join("")}<button type="button" data-wgi-band="all" class="${ui.mapBand === "all" ? "is-active" : ""}"><i class="band-no-data"></i>${tr("Все", "All")}</button></div><span>${tr("Диапазоны GIR · шкала 0–100", "GIR bands · 0–100 scale")}</span></div>
      <div class="wgi-map-shell"><div id="wgiMapCanvas" class="wgi-map-canvas" aria-busy="true"><div class="wgi-map-placeholder">${tr("Загрузка картографического слоя…", "Loading map layer…")}</div></div><aside class="wgi-map-summary"><p class="wgi-kicker">${tr("Выбранная страна", "Selected country")}</p>${flag(country(), "flag-img wgi-map-flag")}<h3>${esc(localName(country()))}</h3><strong>${fmt(observation().absolute_score, 1)}</strong><span>${esc(dimensionName(selectedDimension()))}</span><dl><div><dt>${tr("Место", "Rank")}</dt><dd>${rankLabel()}</dd></div><div><dt>${tr("Регион", "Region")}</dt><dd>${esc(country().publisher_region || country().region || "—")}</dd></div><div><dt>${tr("Источников", "Sources")}</dt><dd>${intFmt(observation().number_of_sources)}</dd></div></dl></aside></div>
    </section>`;
  }

  function renderMap() {
    const container = context?.root?.querySelector("#wgiMapCanvas");
    if (!container || !geoData) return;
    const scoreByIso = new Map(ranking().map((row) => [row.iso3, row]));
    const features = (geoData.features || []).filter((feature) => feature.geometry);
    const bounds = bbox(features);
    const width = 1180, height = 555;
    const paths = features.map((feature) => {
      const iso3 = String(feature.properties?.iso3 || feature.properties?.ISO_A3 || "").toUpperCase();
      const row = scoreByIso.get(iso3);
      const band = row ? bandFor(row.absolute_score) : null;
      const hidden = ui.mapBand !== "all" && (!band || band.code !== ui.mapBand);
      const selected = iso3 === country().iso3;
      return `<path d="${geomPath(feature.geometry, width, height, bounds)}" class="wgi-map-country ${band ? `band-${band.code}` : "band-no-data"}${hidden ? " is-muted" : ""}${selected ? " is-selected" : ""}" data-wgi-map-country="${esc(iso3)}" tabindex="${row ? "0" : "-1"}" aria-label="${row ? `${esc(localName(row))}: ${fmt(row.absolute_score, 1)}` : esc(localName(feature.properties))}"><title>${row ? `${esc(localName(row))} · ${fmt(row.absolute_score, 1)} · #${intFmt(row.global_rank_derived)}` : `${esc(feature.properties?.name_en || iso3)} · ${tr("нет данных", "no data")}`}</title></path>`;
    }).join("");
    container.innerHTML = `<svg class="wgi-map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Карта мира по выбранному измерению WGI", "World map for the selected WGI dimension")}">${paths}</svg><div class="wgi-map-tooltip" hidden></div>`;
    container.setAttribute("aria-busy", "false");
    const tooltip = container.querySelector(".wgi-map-tooltip");
    container.querySelectorAll("[data-wgi-map-country]").forEach((path) => {
      const iso3 = path.dataset.wgiMapCountry;
      const row = scoreByIso.get(iso3);
      if (!row) return;
      const show = (event) => {
        tooltip.hidden = false;
        tooltip.innerHTML = `<strong>${esc(localName(row))}</strong><span>${esc(dimensionName(selectedDimension()))}</span><b>${fmt(row.absolute_score, 1)} · #${intFmt(row.global_rank_derived)}</b>`;
        const rect = container.getBoundingClientRect();
        const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
        const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
        tooltip.style.left = `${Math.min(rect.width - 185, Math.max(8, x + 14))}px`;
        tooltip.style.top = `${Math.min(rect.height - 95, Math.max(8, y + 14))}px`;
      };
      path.addEventListener("pointermove", show);
      path.addEventListener("focus", show);
      path.addEventListener("pointerleave", () => { tooltip.hidden = true; });
      path.addEventListener("blur", () => { tooltip.hidden = true; });
      path.addEventListener("click", () => context.onCountryChange?.(iso3));
      path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); context.onCountryChange?.(iso3); } });
    });
  }

  function trendChart() {
    const rows = (payload.trend || []).filter((row) => finite(row.absolute_score) != null);
    if (!rows.length) return `<div class="wgi-empty">${tr("Временной ряд отсутствует", "No time series available")}</div>`;
    const width = 1100, height = 390, left = 58, right = 24, top = 28, bottom = 48;
    const years = rows.map((row) => Number(row.year));
    const minYear = Math.min(...years), maxYear = Math.max(...years);
    const lows = rows.map((row) => finite(row.absolute_ci90_low) ?? row.absolute_score);
    const highs = rows.map((row) => finite(row.absolute_ci90_high) ?? row.absolute_score);
    const minScore = Math.max(0, Math.floor((Math.min(...lows) - 5) / 10) * 10);
    const maxScore = Math.min(100, Math.ceil((Math.max(...highs) + 5) / 10) * 10);
    const x = (year) => left + (year - minYear) / (maxYear - minYear || 1) * (width - left - right);
    const y = (score) => height - bottom - (score - minScore) / (maxScore - minScore || 1) * (height - top - bottom);
    const line = rows.map((row, index) => `${index ? "L" : "M"}${x(row.year).toFixed(1)},${y(row.absolute_score).toFixed(1)}`).join(" ");
    const upper = rows.map((row, index) => `${index ? "L" : "M"}${x(row.year).toFixed(1)},${y(row.absolute_ci90_high ?? row.absolute_score).toFixed(1)}`).join(" ");
    const lower = [...rows].reverse().map((row) => `L${x(row.year).toFixed(1)},${y(row.absolute_ci90_low ?? row.absolute_score).toFixed(1)}`).join(" ");
    const gridValues = Array.from({ length: 5 }, (_, i) => minScore + i * (maxScore - minScore) / 4);
    const yearLabels = rows.filter((_, i) => i === 0 || i === rows.length - 1 || i % 4 === 0);
    return `<svg class="wgi-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Динамика абсолютного балла и интервала неопределённости", "Trend in absolute score and uncertainty interval")}">
      ${gridValues.map((v) => `<line x1="${left}" y1="${y(v)}" x2="${width - right}" y2="${y(v)}" class="grid"></line><text x="${left - 12}" y="${y(v) + 4}" text-anchor="end">${fmt(v, 0)}</text>`).join("")}
      <path d="${upper}${lower}Z" class="confidence"></path><path d="${line}" class="line"></path>
      ${rows.map((row) => `<circle cx="${x(row.year)}" cy="${y(row.absolute_score)}" r="4" class="dot"><title>${row.year}: ${fmt(row.absolute_score, 1)} (${fmt(row.absolute_ci90_low, 1)}–${fmt(row.absolute_ci90_high, 1)})</title></circle>`).join("")}
      ${yearLabels.map((row) => `<text x="${x(row.year)}" y="${height - 14}" text-anchor="middle">${row.year}</text>`).join("")}
    </svg>`;
  }

  function trendMarkup() {
    const trend = payload.trend || [];
    const first = trend[0], last = trend[trend.length - 1];
    return `<section id="wgi-trend" class="wgi-section" data-testid="wgi-trend">
      <div class="wgi-section-number">04</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${trend.length} ${tr("наблюдений", "observations")} · 1996—2024</p><h2>${tr("Динамика выбранного измерения", "Trend in the selected dimension")}</h2></div><p>${tr("Линия показывает официальный абсолютный балл, полоса — 90%-й интервал. Переход от двухлетних к ежегодным наблюдениям сохранён без интерполяции отсутствующих лет.", "The line shows the official absolute score and the band its 90% interval. The transition from biennial to annual observations is preserved without interpolating missing years.")}</p></div>
      <div class="wgi-trend-layout"><article class="wgi-panel wide">${trendChart()}<div class="wgi-chart-legend"><span><i class="line"></i>${tr("Абсолютный балл", "Absolute score")}</span><span><i class="band"></i>${tr("90% интервал", "90% interval")}</span></div></article><aside class="wgi-trend-summary"><p class="wgi-kicker">${tr("Долгосрочная траектория", "Long-term trajectory")}</p><div><span>${first?.year || "—"}</span><strong>${fmt(first?.absolute_score, 1)}</strong></div><i></i><div><span>${last?.year || "—"}</span><strong>${fmt(last?.absolute_score, 1)}</strong></div><b class="${last && first && last.absolute_score >= first.absolute_score ? "is-positive" : "is-negative"}">${first && last ? signed(last.absolute_score - first.absolute_score, 1) : "—"}</b><p>${tr("Изменение балла не равнозначно причинной оценке реформ; оно отражает изменение агрегированного восприятия в доступных источниках.", "A score change is not a causal evaluation of reforms; it reflects changes in aggregate perceptions across available sources.")}</p></aside></div>
    </section>`;
  }

  function sourcesMarkup() {
    const sources = payload.source_inputs || [];
    const typeCounts = sources.reduce((acc, source) => { const key = String(source.source_type || tr("Не указан", "Unspecified")); acc[key] = (acc[key] || 0) + 1; return acc; }, {});
    return `<section id="wgi-sources" class="wgi-section" data-testid="wgi-sources">
      <div class="wgi-section-number">05</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${intFmt(sources.length)} / ${intFmt(payload.source?.source_series || 35)} ${tr("доступных серий", "available series")}</p><h2>${tr("Источниковая база выбранной оценки", "Source evidence behind the selected estimate")}</h2></div><p>${tr("Показаны опубликованные средние источников после приведения к шкале 0–1. Это не веса модели ненаблюдаемых компонентов: Всемирный банк оценивает информативность источников статистически.", "Published source means are shown after rescaling to 0–1. They are not weights in the unobserved-components model: the World Bank estimates source precision statistically.")}</p></div>
      <div class="wgi-source-layout">
        <div class="wgi-source-list">${sources.length ? sources.map((source, index) => `<article class="wgi-source-row"><span class="wgi-source-number">${String(index + 1).padStart(2, "0")}</span><div class="wgi-source-copy"><div><strong>${esc(source.source_code)}</strong><span>${esc(source.source_type || "")}</span></div><h3>${esc(source.source_name)}</h3><p>${esc(source.organization || "")}</p><div class="wgi-source-bar"><i style="width:${clamp(Number(source.published_mean) * 100)}%"></i></div></div><b>${fmt(Number(source.published_mean) * 100, 1)}<small>/100</small></b></article>`).join("") : `<div class="wgi-empty">${tr("Для выбранного наблюдения источниковые значения не опубликованы.", "No source means are published for this observation.")}</div>`}</div>
        <aside class="wgi-source-summary"><p class="wgi-kicker">${tr("Состав доказательной базы", "Evidence composition")}</p><strong>${intFmt(observation().number_of_sources)}</strong><span>${tr("источников вошли в оценку", "sources contributed to the estimate")}</span><div>${Object.entries(typeCounts).map(([name, count]) => `<p><span>${esc(name)}</span><b>${intFmt(count)}</b></p>`).join("")}</div><hr><p>${tr("Состав источников может различаться между странами, годами и измерениями. Поэтому прямое сравнение отдельных строк источников не заменяет официальный агрегированный estimate.", "The source mix may differ across countries, years and dimensions. Direct comparisons of individual source rows do not replace the official aggregate estimate.")}</p></aside>
      </div>
    </section>`;
  }

  function filteredRanking() {
    let rows = [...ranking()];
    const query = ui.query.trim().toLocaleLowerCase(locale());
    if (query) rows = rows.filter((row) => `${row.iso3} ${row.name_ru || ""} ${row.name_en || ""}`.toLocaleLowerCase(locale()).includes(query));
    if (ui.region !== "all") rows = rows.filter((row) => String(row.publisher_region || row.region) === ui.region);
    if (ui.income !== "all") rows = rows.filter((row) => String(row.publisher_income_group || row.income_group) === ui.income);
    const direction = ui.direction === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      if (ui.sort === "country") return localName(a).localeCompare(localName(b), locale()) * direction;
      if (ui.sort === "score") return (Number(a.absolute_score) - Number(b.absolute_score)) * direction;
      if (ui.sort === "sources") return (Number(a.number_of_sources) - Number(b.number_of_sources)) * direction;
      return (Number(a.global_rank_derived) - Number(b.global_rank_derived)) * direction;
    });
    return rows;
  }

  function rankingBodyMarkup() {
    const rows = filteredRanking();
    const pages = Math.max(1, Math.ceil(rows.length / ui.pageSize));
    ui.page = Math.min(ui.page, pages);
    const start = (ui.page - 1) * ui.pageSize;
    const selected = rows.slice(start, start + ui.pageSize);
    return `<div class="wgi-ranking-table-wrap"><table class="wgi-ranking-table"><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Страна / экономика", "Country / economy")}</th><th>${tr("Баллы", "Score")}</th><th>${tr("90% интервал", "90% interval")}</th><th>${tr("Estimate", "Estimate")}</th><th>${tr("Источников", "Sources")}</th><th>${tr("Регион", "Region")}</th></tr></thead><tbody>${selected.map((row) => `<tr class="${row.iso3 === country().iso3 ? "is-selected" : ""}" data-wgi-country="${row.iso3}" tabindex="0"><td><strong>#${intFmt(row.global_rank_derived)}</strong></td><td><div class="wgi-country-cell">${flag(row, "flag-img inline")}<span><b>${esc(localName(row))}</b><small>${esc(row.iso3)}</small></span></div></td><td><strong>${fmt(row.absolute_score, 1)}</strong></td><td>${fmt(row.absolute_ci90_low, 1)}—${fmt(row.absolute_ci90_high, 1)}</td><td>${signed(row.governance_estimate, 2)}</td><td>${intFmt(row.number_of_sources)}</td><td>${esc(row.publisher_region || row.region || "—")}</td></tr>`).join("") || `<tr><td colspan="7"><div class="wgi-empty">${tr("Ничего не найдено", "No matching rows")}</div></td></tr>`}</tbody></table></div><div class="wgi-pagination"><span>${tr("Показано", "Showing")} ${rows.length ? start + 1 : 0}–${Math.min(start + ui.pageSize, rows.length)} ${tr("из", "of")} ${intFmt(rows.length)}</span><div><button type="button" data-wgi-page="prev" ${ui.page <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><strong>${ui.page} / ${pages}</strong><button type="button" data-wgi-page="next" ${ui.page >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></div>`;
  }

  function rankingMarkup() {
    const regions = [...new Set(ranking().map((row) => row.publisher_region || row.region).filter(Boolean))].sort();
    const incomes = [...new Set(ranking().map((row) => row.publisher_income_group || row.income_group).filter(Boolean))].sort();
    return `<section id="wgi-ranking" class="wgi-section" data-testid="wgi-ranking">
      <div class="wgi-section-number">06</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${effectiveYear()} · ${esc(dimensionName(selectedDimension()))}</p><h2>${tr("Полный международный рейтинг измерения", "Full international ranking for the dimension")}</h2></div><p>${tr("Места рассчитаны GIR методом competition ranking из точных официальных абсолютных баллов. Они не являются официальной таблицей мест Всемирного банка.", "Ranks are GIR-derived with competition ranking from exact official absolute scores. They are not an official World Bank league table.")}</p></div>
      <div class="wgi-ranking-controls"><label class="wgi-search">${icon("search")}<input type="search" data-wgi-search value="${esc(ui.query)}" placeholder="${tr("Страна или код", "Country or code")}" aria-label="${tr("Поиск страны", "Search country")}"></label><label><span>${tr("Регион", "Region")}</span><select data-wgi-region><option value="all">${tr("Все регионы", "All regions")}</option>${regions.map((item) => `<option value="${esc(item)}" ${ui.region === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label><label><span>${tr("Доход", "Income")}</span><select data-wgi-income><option value="all">${tr("Все группы", "All groups")}</option>${incomes.map((item) => `<option value="${esc(item)}" ${ui.income === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label><label><span>${tr("Сортировка", "Sort")}</span><select data-wgi-sort><option value="rank" ${ui.sort === "rank" ? "selected" : ""}>${tr("Место", "Rank")}</option><option value="score" ${ui.sort === "score" ? "selected" : ""}>${tr("Баллы", "Score")}</option><option value="country" ${ui.sort === "country" ? "selected" : ""}>${tr("Страна", "Country")}</option><option value="sources" ${ui.sort === "sources" ? "selected" : ""}>${tr("Источники", "Sources")}</option></select></label><button class="wgi-direction" type="button" data-wgi-direction aria-label="${tr("Изменить направление сортировки", "Reverse sort direction")}">${ui.direction === "asc" ? "↑" : "↓"}</button><label><span>${tr("Строк", "Rows")}</span><select data-wgi-size>${[10,25,50,100].map((n) => `<option ${ui.pageSize === n ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
      <div id="wgiRankingBody">${rankingBodyMarkup()}</div>
    </section>`;
  }

  function methodMarkup() {
    const source = payload.source || {};
    const formula = payload.formula || {};
    return `<section id="wgi-method" class="wgi-section wgi-method" data-testid="wgi-methodology">
      <div class="wgi-section-number">07</div>
      <div class="wgi-section-head"><div><p class="wgi-kicker">${tr("Воспроизводимость и ограничения", "Reproducibility and limitations")}</p><h2>${tr("Методология, происхождение и лицензия", "Methodology, provenance and licence")}</h2></div><p>${esc(context.lang === "en" ? payload.methodology.warning_en : payload.methodology.warning_ru)}</p></div>
      <div class="wgi-method-grid">
        <article><span>01</span><h3>${tr("Официальная модель", "Official model")}</h3><p>${esc(context.lang === "en" ? formula.formula_text_en : formula.formula_text_ru)}</p></article>
        <article><span>02</span><h3>${tr("Статус мест", "Rank status")}</h3><p>${tr("Глобальные, региональные и доходные места воспроизводятся GIR отдельно для каждого измерения и года методом competition ranking.", "Global, regional and income-group ranks are reproduced by GIR separately for every dimension and year using competition ranking.")}</p></article>
        <article><span>03</span><h3>${tr("Источниковая граница", "Source boundary")}</h3><p>${tr("Отображаемые средние отдельных источников опубликованы в книге WGI. Они не трактуются как модельные веса и не используются GIR для повторного расчёта estimate.", "Displayed source means are published in the WGI workbook. They are not treated as model weights and GIR does not use them to re-estimate the score.")}</p></article>
        <article><span>04</span><h3>${tr("Лицензия", "Licence")}</h3><p>${esc(source.license_or_terms || "CC BY 4.0")}</p></article>
      </div>
      <div class="wgi-provenance"><div><p class="wgi-kicker">${tr("Официальный источник", "Official source")}</p><h3>${esc(source.title || source.source_name || "Worldwide Governance Indicators")}</h3><p>${esc(source.owner || "World Bank")} · ${source.release_year || 2025}</p><a href="${esc(source.url || payload.index.url)}" target="_blank" rel="noopener noreferrer">${tr("Открыть страницу источника", "Open source page")} ↗</a></div><dl><div><dt>Snapshot ID</dt><dd class="wgi-mono">${esc(source.snapshot_id || source.latest_snapshot_id || "—")}</dd></div><div><dt>SHA-256</dt><dd class="wgi-mono">${esc(source.raw_snapshot_sha256 || observation().raw_snapshot_sha256 || "—")}</dd></div><div><dt>Transform ID</dt><dd class="wgi-mono">${esc(observation().transform_id || "—")}</dd></div><div><dt>Formula version</dt><dd class="wgi-mono">${esc(observation().formula_version || "—")}</dd></div><div><dt>${tr("Получено", "Retrieved")}</dt><dd>${esc(source.retrieved_at || observation().retrieved_at || "—")}</dd></div></dl></div>
      <aside class="wgi-method-warning"><strong>${tr("Интерпретационное ограничение", "Interpretive limitation")}</strong><p>${esc(context.lang === "en" ? payload.usage_advisory.en : payload.usage_advisory.ru)}</p></aside>
    </section>`;
  }

  function workspaceMarkup() {
    return `<article class="wgi-workspace" data-wgi-workspace data-dimension="${esc(selectedDimension())}">
      ${heroMarkup()}${advisoryMarkup()}${dimensionTabsMarkup()}${jumpNavMarkup()}${profileMarkup()}${uncertaintyMarkup()}${mapMarkup()}${trendMarkup()}${sourcesMarkup()}${rankingMarkup()}${methodMarkup()}
    </article>`;
  }

  function refreshRanking() {
    const target = context?.root?.querySelector("#wgiRankingBody");
    if (!target) return;
    target.innerHTML = rankingBodyMarkup();
    bindCountryRows(target);
    bindPagination(target);
  }

  function bindCountryRows(root = context.root) {
    root.querySelectorAll("[data-wgi-country]").forEach((item) => {
      const activate = () => context.onCountryChange?.(item.dataset.wgiCountry);
      item.addEventListener("click", activate);
      item.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
  }

  function bindPagination(root = context.root) {
    root.querySelectorAll("[data-wgi-page]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.wgiPage === "prev") ui.page = Math.max(1, ui.page - 1);
      else ui.page += 1;
      refreshRanking();
      context.root.querySelector("#wgi-ranking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  function bindEvents() {
    const root = context.root;
    root.querySelectorAll("[data-wgi-provenance]").forEach((button) => button.addEventListener("click", () => context.onProvenance?.(button.dataset.wgiProvenance, button)));
    root.querySelectorAll("[data-wgi-dimension]").forEach((button) => button.addEventListener("click", () => context.onDimensionChange?.(button.dataset.wgiDimension)));
    root.querySelector("[data-wgi-copy]")?.addEventListener("click", async () => {
      const url = new URL(location.href);
      url.searchParams.set("country", country().iso3);
      url.searchParams.set("year", String(effectiveYear()));
      url.searchParams.set("index", "WGI");
      url.searchParams.set("dimension", selectedDimension());
      try { await navigator.clipboard.writeText(url.toString()); context.onNotice?.(tr("Ссылка скопирована", "Link copied")); }
      catch { context.onNotice?.(tr("Не удалось скопировать ссылку", "Unable to copy link")); }
    });
    root.querySelectorAll("[data-wgi-band]").forEach((button) => button.addEventListener("click", () => { ui.mapBand = button.dataset.wgiBand; root.querySelectorAll("[data-wgi-band]").forEach((item) => item.classList.toggle("is-active", item.dataset.wgiBand === ui.mapBand)); renderMap(); }));
    const search = root.querySelector("[data-wgi-search]");
    if (search) search.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { ui.query = search.value; ui.page = 1; refreshRanking(); }, 160); });
    root.querySelector("[data-wgi-region]")?.addEventListener("change", (event) => { ui.region = event.target.value; ui.page = 1; refreshRanking(); });
    root.querySelector("[data-wgi-income]")?.addEventListener("change", (event) => { ui.income = event.target.value; ui.page = 1; refreshRanking(); });
    root.querySelector("[data-wgi-sort]")?.addEventListener("change", (event) => { ui.sort = event.target.value; ui.direction = ui.sort === "rank" ? "asc" : "desc"; ui.page = 1; refreshRanking(); });
    root.querySelector("[data-wgi-direction]")?.addEventListener("click", (event) => { ui.direction = ui.direction === "asc" ? "desc" : "asc"; event.currentTarget.textContent = ui.direction === "asc" ? "↑" : "↓"; refreshRanking(); });
    root.querySelector("[data-wgi-size]")?.addEventListener("change", (event) => { ui.pageSize = Number(event.target.value); ui.page = 1; refreshRanking(); });
    bindCountryRows(root);
    bindPagination(root);
  }

  async function render(nextContext) {
    context = nextContext;
    if (!context?.root || !context.country) return;
    context.dimension = DIMENSIONS.includes(String(context.dimension || "GE").toUpperCase()) ? String(context.dimension || "GE").toUpperCase() : "GE";
    const token = ++renderSerial;
    context.root.innerHTML = loadingMarkup();
    try {
      const result = await getPayload();
      if (token !== renderSerial) return;
      payload = result;
      if (!payload?.available) throw new Error(tr("Для выбранной страны и года нет данных WGI.", "No WGI data are available for the selected country and year."));
      context.root.innerHTML = workspaceMarkup();
      bindEvents();
      loadGeo().then(() => { if (token === renderSerial) renderMap(); }).catch((error) => {
        const canvas = context.root.querySelector("#wgiMapCanvas");
        if (canvas) canvas.innerHTML = `<div class="wgi-empty">${esc(error.message)}</div>`;
      });
      document.documentElement.dataset.wgiReady = "true";
      window.__GIIP_READY__ = true;
    } catch (error) {
      if (token !== renderSerial) return;
      context.root.innerHTML = errorMarkup(error);
      context.root.querySelector("[data-wgi-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });
      document.documentElement.dataset.wgiReady = "error";
    }
  }

  function invalidate(countryCode, year, dimension) {
    if (countryCode && year && dimension) cache.delete(`${String(countryCode).toUpperCase()}:${Number(year)}:${String(dimension).toUpperCase()}`);
    else cache.clear();
  }

  window.GIRWGI = Object.freeze({ render, invalidate, dimensions: DIMENSIONS });
})();
