/* GIR Digitalisation / AI — Stage 06: ITU Global Cybersecurity Index workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    mapMode: "tier",
    evidenceQuery: "",
    evidencePillar: "all",
    rankingQuery: "",
    rankingRegion: "all",
    rankingIncome: "all",
    rankingTier: "all",
    rankingPage: 1,
    rankingPageSize: 25,
  };
  let context = null;
  let payload = null;
  let geo = null;
  let geoPending = null;
  let renderSerial = 0;

  const lang = () => context?.lang || "ru";
  const tr = (ru, en) => lang() === "ru" ? ru : en;
  const esc = (value) => context?.escapeHtml
    ? context.escapeHtml(value)
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const locale = () => lang() === "ru" ? "ru-RU" : "en-US";
  const finite = (value) => value != null && Number.isFinite(Number(value));
  const fmt = (value, digits = 2) => finite(value)
    ? Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  const fmtCompact = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { maximumFractionDigits: digits })
    : "—";
  const intFmt = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const pct = (value, digits = 0) => finite(value) ? `${fmt(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.source_country_name || item?.iso3 || "—";
  const dimensionName = (item) => local(item) || item?.dimension_code || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}`;
  const selectedCountry = () => payload?.country || { iso3: selectedIso(), name_ru: selectedIso(), name_en: selectedIso() };
  const score = () => payload?.score || {};
  const tier = () => Number(score().official_tier || 5);
  const signed = (value, digits = 1) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}` : "—";
  const deltaClass = (value) => Number(value) > .005 ? "positive" : Number(value) < -.005 ? "negative" : "neutral";

  function icon(name) {
    return `<img class="gci-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="gci-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { message = (await response.json())?.detail || message; } catch (_) { /* not JSON */ }
      throw new Error(message);
    }
    return response.json();
  }

  function loadPayload() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const url = `/api/gci/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}`;
    const request = fetchJson(url)
      .then((value) => { cache.set(key, value); pending.delete(key); return value; })
      .catch((error) => { pending.delete(key); throw error; });
    pending.set(key, request);
    return request;
  }

  function loadGeo() {
    if (geo) return Promise.resolve(geo);
    if (geoPending) return geoPending;
    geoPending = fetchJson("/world.geojson")
      .then((value) => { geo = value; geoPending = null; return value; })
      .catch((error) => { geoPending = null; throw error; });
    return geoPending;
  }

  function loading() {
    return `<section class="gci-loading" aria-live="polite">
      <div class="gci-loading-core" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b>GCI</b></div>
      <span>ITU · GLOBAL CYBERSECURITY INDEX 2024</span>
      <h1>${tr("Собирается профиль национальной киберготовности", "Building the national cybersecurity posture")}</h1>
      <p>${tr("Загружаются 194 экономики, пять столпов, 20 индикаторов, официальные уровни зрелости и доказательные записи.", "Loading 194 economies, five pillars, 20 indicators, official maturity tiers and evidence records.")}</p>
    </section>`;
  }

  function errorState(error) {
    return `<section class="gci-error"><span>GCI · ERROR</span><h1>${tr("Рабочее пространство GCI не загрузилось", "The GCI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="gci-button primary" data-gci-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function flatten(nodes) {
    return (nodes || []).flatMap((item) => [item, ...flatten(item.children || [])]);
  }

  function byCode(code) {
    return flatten(payload?.pillars || []).find((item) => item.dimension_code === code) || null;
  }

  function tierMeta(number) {
    return (payload?.tiers || []).find((item) => Number(item.tier) === Number(number)) || {};
  }

  function tierName(itemOrNumber) {
    const item = typeof itemOrNumber === "object" ? itemOrNumber : tierMeta(itemOrNumber);
    return lang() === "ru"
      ? (item?.official_tier_name_ru || item?.name_ru || "—")
      : (item?.official_tier_name_en || item?.name_en || "—");
  }

  function tierClass(number) {
    const value = Math.max(1, Math.min(5, Number(number) || 5));
    return `tier-${value}`;
  }

  function pillarDescription(code) {
    const descriptions = {
      LS: ["законы, регулирование и правовые механизмы", "laws, regulation and legal mechanisms"],
      TS: ["операционная защита, CERT и технические стандарты", "operational protection, CERTs and technical standards"],
      OS: ["стратегия, координация и национальное управление", "strategy, coordination and national governance"],
      CDS: ["навыки, образование, исследования и индустрия", "skills, education, research and industry"],
      CS: ["международные, межведомственные и частные партнёрства", "international, inter-agency and private partnerships"],
    };
    const value = descriptions[code] || ["", ""];
    return tr(value[0], value[1]);
  }

  function pillarShort(code) {
    const labels = {
      LS: tr("Право", "Legal"),
      TS: tr("Техника", "Technical"),
      OS: tr("Организация", "Organisation"),
      CDS: tr("Потенциал", "Capacity"),
      CS: tr("Сотрудничество", "Cooperation"),
    };
    return labels[code] || code;
  }

  function sectionHeading(number, eyebrow, title, copy) {
    return `<header class="gci-section-heading"><span>${esc(number)}</span><div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }

  function scoreCore() {
    const value = Number(score().official_score || 0);
    const radius = 92;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clamp(value / 100));
    const pillarArcs = (payload?.pillars || []).map((item, index) => {
      const r = 70 - index * 9;
      const c = 2 * Math.PI * r;
      const ratio = clamp(Number(item.official_value || 0) / Number(item.maximum_score || 20));
      return `<circle class="pillar p${index + 1}" cx="120" cy="120" r="${r}" style="stroke-dasharray:${(c * ratio).toFixed(2)} ${(c * (1 - ratio)).toFixed(2)}"></circle>`;
    }).join("");
    return `<div class="gci-score-core"><svg viewBox="0 0 240 240" role="img" aria-label="${tr("Официальный балл GCI", "Official GCI score")} ${fmt(value, 2)}"><circle class="track" cx="120" cy="120" r="${radius}"></circle><circle class="score-ring ${tierClass(tier())}" cx="120" cy="120" r="${radius}" style="stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"></circle>${pillarArcs}<text class="number" x="120" y="112" text-anchor="middle">${fmt(value, 2)}</text><text class="scale" x="120" y="136" text-anchor="middle">GCI / 100</text></svg><div class="gci-score-core-label ${tierClass(tier())}"><span>${esc(score().official_tier_code || `T${tier()}`)}</span><strong>${esc(tierName(score()))}</strong></div></div>`;
  }

  function tierLadder(compact = false) {
    const selectedTier = tier();
    const selectedScore = Number(score().official_score || 0);
    return `<div class="gci-tier-ladder ${compact ? "compact" : ""}" aria-label="${tr("Пять официальных уровней GCI", "Five official GCI tiers")}">${(payload?.tiers || []).map((item) => {
      const active = Number(item.tier) === selectedTier;
      const count = payload?.summary?.tier_distribution?.find((entry) => Number(entry.tier) === Number(item.tier))?.count;
      return `<div class="${tierClass(item.tier)} ${active ? "active" : ""}"><span><i>T${item.tier}</i><b>${esc(tierName(item))}</b></span><em>${fmtCompact(item.minimum, 0)}–${fmtCompact(item.maximum, 0)}</em>${compact ? "" : `<small>${intFmt(count)} ${tr("экономик", "economies")}</small>`}${active ? `<mark>${fmt(selectedScore, 2)}</mark>` : ""}</div>`;
    }).join("")}</div>`;
  }

  function hero() {
    const idx = payload?.index || {};
    const selected = payload?.summary?.selected || {};
    const lead = lang() === "ru" ? idx.description_ru : idx.description_en;
    return `<section class="gci-hero" aria-labelledby="gciTitle">
      <article class="gci-hero-copy">
        <div class="gci-circuit-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="gci-overline"><span>ITU · GCI 2024</span><b>${tr("пятая редакция", "fifth edition")}</b><em>${tr("официальная tier-модель", "official tier model")}</em></div>
        <h1 id="gciTitle">${esc(local(idx))}</h1>
        <p class="gci-hero-lead">${esc(lead)}</p>
        <div class="gci-edition-line"><span><b>${tr("Редакция", "Edition")}</b> ${payload.edition}</span><span><b>${tr("Публикация", "Published")}</b> ${esc(payload.publication_date)}</span><span><b>${tr("Охват", "Coverage")}</b> ${intFmt(payload.summary?.country_count)} ${tr("экономики", "economies")}</span><span><b>${tr("Архитектура", "Architecture")}</b> 5 × 20</span></div>
        <div class="gci-formula-strip"><span>LS</span><i>+</i><span>TS</span><i>+</i><span>OS</span><i>+</i><span>CDS</span><i>+</i><span>CS</span><em>→</em><strong>GCI / 100</strong></div>
        <div class="gci-hero-actions"><button type="button" class="gci-button primary" data-gci-scroll="gciPosture">${tr("Разобрать профиль", "Explore the posture")}</button><a class="gci-button" href="/api/gci/workspace.csv?country=${encodeURIComponent(selectedCountry().iso3)}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-gci-${payload.edition}.csv">${icon("download")}${tr("Скачать каталог", "Download directory")}</a><a class="gci-button quiet" href="${esc(payload.source?.source_url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Официальный отчёт", "Official report")} <span aria-hidden="true">↗</span></a></div>
        <div class="gci-no-rank-banner"><span>NO OFFICIAL COUNTRY RANK</span><p>${tr("ITU публикует пять уровней зрелости. Порядок GIR используется только для навигации и никогда не называется официальным местом.", "ITU publishes five maturity tiers. GIR's order is navigation-only and is never presented as an official country rank.")}</p></div>
      </article>
      <aside class="gci-command-card" aria-label="${tr("Профиль выбранной экономики", "Selected economy profile")}">
        <header><div>${flag(selectedCountry(), "flag-img inline")}<div><strong>${esc(countryName(selectedCountry()))}</strong><span>${esc(selectedCountry().iso3)} · ${esc(selectedCountry().official_region || "—")}</span></div></div><span class="gci-live-chip"><i></i>${tr("официальные данные", "official data")}</span></header>
        ${scoreCore()}
        <div class="gci-command-facts"><div><span>${tr("Официальный статус", "Official status")}</span><strong>${esc(score().official_tier_code || `T${tier()}`)}</strong><small>${esc(tierName(score()))}</small></div><div><span>${tr("Официальное место", "Official rank")}</span><strong>—</strong><small>${tr("не публикуется ITU", "not published by ITU")}</small></div><div><span>${tr("Региональная позиция", "Regional position")}</span><strong>${intFmt(selected.gir_region_position)} / ${intFmt(selected.region_count)}</strong><small>${tr("диагностика GIR", "GIR diagnostic")}</small></div><div><span>${tr("Процентиль GIR", "GIR percentile")}</span><strong>P${fmtCompact(score().gir_percentile, 1)}</strong><small>${tr("не официальный ранг", "not an official rank")}</small></div></div>
        <button type="button" class="gci-evidence-link" data-gci-provenance="${esc(score().value_id || "")}">${tr("Открыть доказательную запись", "Open evidence record")} <span aria-hidden="true">→</span></button>
      </aside>
    </section>`;
  }

  function jumpNav() {
    const links = [
      ["gciPosture", tr("Профиль", "Posture")],
      ["gciAtlas", tr("Атлас", "Atlas")],
      ["gciPillars", tr("5 столпов", "5 pillars")],
      ["gciSignals", tr("20 индикаторов", "20 indicators")],
      ["gciTiers", tr("Уровни", "Tiers")],
      ["gciDirectory", tr("Страны", "Economies")],
      ["gciMethod", tr("Методология", "Methodology")],
    ];
    return `<nav class="gci-jump" aria-label="${tr("Разделы GCI", "GCI sections")}"><span>GCI / 2024</span>${links.map(([id, label], index) => `<button type="button" data-gci-scroll="${id}"><i>${String(index + 1).padStart(2, "0")}</i>${esc(label)}</button>`).join("")}</nav>`;
  }

  function insightCard(kind, label, item, detail) {
    return `<article class="gci-insight-card ${kind}"><span>${esc(label)}</span><div><strong>${esc(item ? pillarShort(item.dimension_code) : "—")}</strong><b>${fmt(item?.official_value, 2)}<small>/ ${fmtCompact(item?.maximum_score, 0)}</small></b></div><p>${esc(detail)}</p>${item?.value_id ? `<button type="button" data-gci-provenance="${esc(item.value_id)}">${tr("Доказательство", "Evidence")} ↗</button>` : ""}</article>`;
  }

  function radarPoint(value, index, radius = 122, center = 155) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
    const distance = radius * clamp(value);
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance];
  }

  function radarPolygon(values) {
    return values.map((value, index) => radarPoint(value, index).map((number) => number.toFixed(1)).join(",")).join(" ");
  }

  function radar() {
    const pillars = payload?.pillars || [];
    const selected = pillars.map((item) => Number(item.official_value || 0) / Number(item.maximum_score || 20));
    const global = pillars.map((item) => Number(item.benchmark?.global?.mean || 0) / Number(item.maximum_score || 20));
    const region = pillars.map((item) => Number(item.benchmark?.region?.mean || 0) / Number(item.maximum_score || 20));
    const role = pillars.map((item) => Number(item.benchmark?.role_model_tier?.mean || 0) / Number(item.maximum_score || 20));
    const grids = [.25, .5, .75, 1].map((level) => `<polygon points="${radarPolygon([level, level, level, level, level])}"></polygon>`).join("");
    const axes = pillars.map((_, index) => { const [x, y] = radarPoint(1, index); return `<line x1="155" y1="155" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`; }).join("");
    const labels = pillars.map((item, index) => { const [x, y] = radarPoint(1.18, index); const anchor = x < 135 ? "end" : x > 175 ? "start" : "middle"; return `<text x="${x.toFixed(1)}" y="${(y + (index === 0 ? -2 : 5)).toFixed(1)}" text-anchor="${anchor}">${esc(item.dimension_code)}</text>`; }).join("");
    return `<div class="gci-radar-wrap"><svg class="gci-radar" viewBox="0 0 310 310" role="img" aria-label="${tr("Пятиосевой профиль кибербезопасности", "Five-axis cybersecurity posture")}"><g class="grid">${grids}${axes}</g><polygon class="series role" points="${radarPolygon(role)}"></polygon><polygon class="series global" points="${radarPolygon(global)}"></polygon><polygon class="series region" points="${radarPolygon(region)}"></polygon><polygon class="series selected" points="${radarPolygon(selected)}"></polygon><g class="labels">${labels}</g></svg><div class="gci-radar-legend"><span class="selected">${esc(countryName(selectedCountry()))}</span><span class="region">${tr("Регион", "Region")}</span><span class="global">${tr("Мир", "Global")}</span><span class="role">T1 · ${tr("образцовые", "role models")}</span></div></div>`;
  }

  function pillarPulse(item) {
    const value = Number(item.official_value || 0);
    const max = Number(item.maximum_score || 20);
    const b = item.benchmark || {};
    return `<article class="gci-pulse"><header><span>${esc(item.dimension_code)}</span><strong>${esc(pillarShort(item.dimension_code))}</strong><b>${fmt(value, 2)}<small> / ${fmtCompact(max, 0)}</small></b></header><div class="gci-pulse-track"><i style="width:${clamp(value / max) * 100}%"></i><mark style="left:${clamp(Number(b.global?.mean || 0) / max) * 100}%" title="${tr("Среднее мира", "Global mean")}"></mark></div><footer><span>${tr("к миру", "vs global")} <b class="${deltaClass(b.gap_to_global_mean)}">${signed(b.gap_to_global_mean, 2)}</b></span><span>${tr("к T1", "vs T1")} <b class="${deltaClass(b.gap_to_role_model_mean)}">${signed(b.gap_to_role_model_mean, 2)}</b></span></footer></article>`;
  }

  function postureSection() {
    const insights = payload?.insights || {};
    const path = payload?.maturity_path || {};
    const selected = payload?.summary?.selected || {};
    return `<section class="gci-section" id="gciPosture">
      ${sectionHeading("01", tr("Командный профиль", "Command posture"), tr("Где система сильна — и что удерживает следующий уровень", "Where the system is strong — and what blocks the next tier"), tr("Пять официальных столпов сопоставлены со средними мира, региона и уровня T1. Средние и разрывы — прозрачная аналитика GIR, а не дополнительные оценки ITU.", "The five official pillars are compared with global, regional and T1 means. Means and gaps are transparent GIR diagnostics, not additional ITU scores."))}
      <div class="gci-insight-grid">${insightCard("strong", tr("Сильнейший столп", "Strongest pillar"), insights.strongest_pillar, pillarDescription(insights.strongest_pillar?.dimension_code))}${insightCard("constraint", tr("Главное ограничение", "Primary constraint"), insights.constraint_pillar, pillarDescription(insights.constraint_pillar?.dimension_code))}<article class="gci-insight-card path"><span>${tr("До следующего уровня", "To the next tier")}</span><div><strong>${path.is_role_model ? "T1" : `T${path.target_tier}`}</strong><b>${path.is_role_model ? tr("достигнут", "reached") : fmt(path.points_to_next_tier, 2)}</b></div><p>${path.is_role_model ? tr("Экономика уже находится в образцовом официальном уровне.", "The economy is already in the official role-modelling tier.") : tr("балла до официального порога следующего уровня", "points to the next official tier threshold")}</p></article><article class="gci-insight-card balance"><span>${tr("Разброс столпов", "Pillar spread")}</span><div><strong>Δ</strong><b>${fmt(insights.pillar_balance_spread, 2)}</b></div><p>${tr("разница между сильнейшим и слабейшим столпом; меньше означает более ровный профиль", "difference between strongest and weakest pillar; lower means a more balanced posture")}</p></article></div>
      <div class="gci-posture-layout"><article class="gci-radar-card"><header><div><span>5 AXES · OFFICIAL VALUES</span><h3>${tr("Архитектура национальной готовности", "National readiness architecture")}</h3></div><b>${esc(score().official_tier_code || `T${tier()}`)}</b></header>${radar()}</article><article class="gci-pulse-card"><header><div><span>${tr("Пять контрольных контуров", "Five control domains")}</span><h3>${tr("Сравнение с референтными группами", "Benchmark comparison")}</h3></div><small>${tr("маркер = среднее мира", "marker = global mean")}</small></header><div>${(payload?.pillars || []).map(pillarPulse).join("")}</div><footer><span>${tr("Региональная диагностика", "Regional diagnostic")}</span><strong>${intFmt(selected.gir_region_position)} / ${intFmt(selected.region_count)}</strong><small>${esc(selected.region_name || "—")} · ${tr("не официальный ранг", "not an official rank")}</small></footer></article></div>
    </section>`;
  }

  function collectCoordinates(geometry, output) {
    if (!geometry) return;
    const walk = (value) => {
      if (!Array.isArray(value)) return;
      if (typeof value[0] === "number" && typeof value[1] === "number") { output.push(value); return; }
      value.forEach(walk);
    };
    walk(geometry.coordinates);
  }

  function bboxOfFeatures(features) {
    const coords = [];
    features.forEach((feature) => collectCoordinates(feature.geometry, coords));
    const filtered = coords.filter((point) => point[0] >= -170 && point[1] >= -60 && point[1] <= 86);
    const lons = filtered.map((point) => point[0]);
    const lats = filtered.map((point) => point[1]);
    return { minLon: Math.min(...lons), minLat: Math.min(...lats), maxLon: Math.max(...lons), maxLat: Math.max(...lats) };
  }

  function pathFromGeom(geometry, width, height, bounds) {
    const project = (lon, lat) => [(lon - bounds.minLon) / (bounds.maxLon - bounds.minLon) * width, height - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat) * height];
    const ringPath = (ring) => {
      const visible = ring.filter((point) => point[0] >= -170 && point[1] >= -60 && point[1] <= 86);
      if (!visible.length) return "";
      return visible.map((point, index) => { const [x, y] = project(point[0], point[1]); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";
    };
    if (geometry?.type === "Polygon") return geometry.coordinates.map(ringPath).join("");
    if (geometry?.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map(ringPath).join("")).join("");
    return "";
  }

  function mapTone(item) {
    if (!item) return "no-data";
    if (ui.mapMode === "tier") return tierClass(item.official_tier);
    const value = Number(item.official_score || 0);
    if (value >= 95) return "score-5";
    if (value >= 85) return "score-4";
    if (value >= 55) return "score-3";
    if (value >= 20) return "score-2";
    return "score-1";
  }

  function worldMap() {
    if (!geo?.features) return `<div class="gci-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const rankingByIso = new Map((payload?.ranking || []).map((item) => [item.iso3, item]));
    const width = 980, height = 440;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    return `<svg class="gci-world-map" viewBox="0 0 ${width} ${height}" role="group" aria-label="${tr("Карта уровней кибербезопасности", "Cybersecurity maturity-tier map")}">${features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = rankingByIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const selected = iso3 === selectedIso();
      const valueText = item ? `${fmt(item.official_score, 2)} · ${tierName(item)}` : tr("нет данных", "no data");
      return `<path class="gci-map-country ${mapTone(item)}${selected ? " selected" : ""}" d="${d}" data-gci-country="${esc(iso3)}" tabindex="${item ? "0" : "-1"}" role="${item ? "button" : "img"}" aria-label="${esc(name)} · ${esc(valueText)}"><title>${esc(name)} · ${esc(valueText)}${item ? ` · ${tr("официального места нет", "no official rank")}` : ""}</title></path>`;
    }).join("")}</svg>`;
  }

  function mapLegend() {
    if (ui.mapMode === "score") return [["score-1", "0–19.99"], ["score-2", "20–54.99"], ["score-3", "55–84.99"], ["score-4", "85–94.99"], ["score-5", "95–100"]].map(([tone, label]) => `<span class="${tone}"><i></i>${label}</span>`).join("");
    return (payload?.summary?.tier_distribution || []).map((item) => `<span class="${tierClass(item.tier)}"><i></i>T${item.tier} · ${esc(tierName(item))} <b>${intFmt(item.count)}</b></span>`).join("");
  }

  function regionCards() {
    return `<div class="gci-region-list">${(payload?.regional_landscape || []).map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(item.region)}</strong><small>${intFmt(item.count)} ${tr("экономик", "economies")} · T1 ${intFmt(item.role_model_count)} · ${pct(item.upper_tier_share, 0)} T1/T2</small></div><b>${fmt(item.mean, 1)}</b><button type="button" data-gci-country="${esc(item.leader?.iso3 || "")}" aria-label="${tr("Открыть лидера региона", "Open regional leader")}: ${esc(countryName(item.leader))}">${flag(item.leader, "flag-img inline")}<em>${fmt(item.leader?.official_score, 1)}</em></button></article>`).join("")}</div>`;
  }

  function atlasSection() {
    return `<section class="gci-section" id="gciAtlas">
      ${sectionHeading("02", tr("Глобальный атлас", "Global atlas"), tr("Пять уровней киберзрелости на одной карте", "Five cybersecurity maturity tiers on one map"), tr("Цвет показывает официальный tier ITU или непрерывный официальный балл. Выбор экономики перестраивает весь профиль без превращения score-сортировки в официальный рейтинг.", "Colour shows the official ITU tier or continuous official score. Selecting an economy rebuilds the profile without turning score sorting into an official ranking."))}
      <div class="gci-atlas-layout"><article class="gci-map-card"><header><div><span>${tr("Слой карты", "Map layer")}</span><strong>${ui.mapMode === "tier" ? tr("Официальные уровни", "Official tiers") : tr("Официальный балл", "Official score")}</strong></div><div class="gci-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode === "tier" ? "active" : ""}" data-gci-map-mode="tier">${tr("Уровни", "Tiers")}</button><button type="button" class="${ui.mapMode === "score" ? "active" : ""}" data-gci-map-mode="score">${tr("Баллы", "Scores")}</button></div></header><div class="gci-map-stage">${worldMap()}</div><div class="gci-map-legend">${mapLegend()}</div></article><aside class="gci-region-card"><header><span>REGIONS · GCI 2024</span><h3>${tr("Региональный ландшафт", "Regional landscape")}</h3><p>${tr("Средние и доли уровней рассчитаны GIR из официальных страновых значений.", "Means and tier shares are GIR diagnostics based on official country values.")}</p></header>${regionCards()}</aside></div>
    </section>`;
  }

  function pillarCard(item, index) {
    const value = Number(item.official_value || 0);
    const max = Number(item.maximum_score || 20);
    const b = item.benchmark || {};
    const children = item.children || [];
    return `<article class="gci-pillar-card pillar-${index + 1}"><header><span>0${index + 1} · ${esc(item.dimension_code)}</span><button type="button" data-gci-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть происхождение", "Open provenance")}">↗</button></header><div class="gci-pillar-orbit" style="--score:${clamp(value / max) * 360}deg"><strong>${fmt(value, 2)}</strong><small>/ ${fmtCompact(max, 0)}</small></div><h3>${esc(dimensionName(item))}</h3><p>${esc(pillarDescription(item.dimension_code))}</p><div class="gci-pillar-bench"><span>${tr("Мир", "Global")}<b>${fmt(b.global?.mean, 2)}</b></span><span>${tr("Регион", "Region")}<b>${fmt(b.region?.mean, 2)}</b></span><span>T1<b>${fmt(b.role_model_tier?.mean, 2)}</b></span></div><div class="gci-signal-dots" aria-label="${tr("Индикаторы столпа", "Pillar indicators")}">${children.map((child) => `<button type="button" class="${child.available ? "available" : "missing"}" data-gci-provenance="${esc(child.value_id)}" title="${esc(dimensionName(child))}: ${child.available ? fmt(child.official_value, 3) : "n/a"}"><i style="--v:${clamp(child.official_value) * 100}%"></i><span>${esc(child.dimension_code)}</span></button>`).join("")}</div><footer><span>${children.filter((child) => child.available).length}/${children.length} ${tr("сигналов доступны", "signals available")}</span><b class="${deltaClass(b.gap_to_role_model_mean)}">${signed(b.gap_to_role_model_mean, 2)} ${tr("к T1", "vs T1")}</b></footer></article>`;
  }

  function pillarsSection() {
    return `<section class="gci-section" id="gciPillars">${sectionHeading("03", tr("Пять столпов", "Five pillars"), tr("Контуры национальной системы кибербезопасности", "Control domains of the national cybersecurity system"), tr("Каждый официальный столп имеет шкалу 0–20. Внутри показаны опубликованные индикаторы 0–1; их веса уже встроены в значения ITU и не переоцениваются GIR.", "Each official pillar uses a 0–20 scale. Published 0–1 indicators appear within; their ITU weights are already embedded and are not reweighted by GIR."))}<div class="gci-pillar-grid">${(payload?.pillars || []).map(pillarCard).join("")}</div></section>`;
  }

  function evidenceItems() {
    const query = ui.evidenceQuery.trim().toLowerCase();
    return flatten(payload?.pillars || []).filter((item) => item.level === "indicator").filter((item) => {
      const queryMatch = !query || [item.dimension_code, item.display_code, item.name_ru, item.name_en].some((value) => String(value || "").toLowerCase().includes(query));
      const pillarMatch = ui.evidencePillar === "all" || item.parent_code === ui.evidencePillar;
      return queryMatch && pillarMatch;
    });
  }

  function signalCard(item) {
    const b = item.benchmark || {};
    const available = item.available && finite(item.official_value);
    const parent = byCode(item.parent_code);
    return `<article class="gci-signal-card ${available ? "" : "unavailable"}"><header><span class="${item.parent_code?.toLowerCase()}">${esc(item.dimension_code)}</span><button type="button" data-gci-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></header><h3>${esc(dimensionName(item))}</h3><small>${esc(parent ? dimensionName(parent) : item.parent_code || "")}</small>${available ? `<div class="gci-signal-value"><strong>${fmt(item.official_value, 3)}</strong><span>/ ${fmtCompact(item.maximum_score, 0)}</span></div><div class="gci-signal-track"><i style="width:${clamp(Number(item.official_value) / Number(item.maximum_score || 1)) * 100}%"></i><mark style="left:${clamp(Number(b.global?.mean || 0) / Number(item.maximum_score || 1)) * 100}%"></mark></div><footer><span>${tr("Мир", "Global")} <b>${fmt(b.global?.mean, 3)}</b></span><span>${tr("Регион", "Region")} <b>${fmt(b.region?.mean, 3)}</b></span><span>${tr("к T1", "vs T1")} <b class="${deltaClass(b.gap_to_role_model_mean)}">${signed(b.gap_to_role_model_mean, 3)}</b></span></footer>` : `<div class="gci-na-panel"><strong>N/A</strong><p>${tr("ITU включает узел в методологию, но не публикует сопоставимое страновое значение. GIR не выполняет подстановку.", "ITU includes this node in the methodology but does not publish a comparable country value. GIR does not impute one.")}</p></div>`}</article>`;
  }

  function signalsSection() {
    const items = evidenceItems();
    return `<section class="gci-section" id="gciSignals">${sectionHeading("04", tr("Разведка индикаторов", "Indicator intelligence"), tr("20 опубликованных сигналов под официальными столпами", "20 published signals beneath the official pillars"), tr("Поиск работает на русском и английском. Каждый балл открывает provenance: источник, снимок, хеш, преобразование и статус доступности.", "Search works in Russian and English. Every score opens provenance: source, snapshot, hash, transformation and availability status."))}<div class="gci-signal-toolbar"><label><span>${tr("Поиск по 20 индикаторам", "Search 20 indicators")}</span><input id="gciEvidenceSearch" type="search" value="${esc(ui.evidenceQuery)}" autocomplete="off" placeholder="${tr("например, CERT или стратегия", "e.g. CERT or strategy")}" aria-label="${tr("Поиск индикаторов GCI", "Search GCI indicators")}"></label><div role="group" aria-label="${tr("Фильтр столпа", "Pillar filter")}"><button type="button" class="${ui.evidencePillar === "all" ? "active" : ""}" data-gci-evidence-pillar="all">${tr("Все", "All")} · 20</button>${(payload?.pillars || []).map((item) => `<button type="button" class="${ui.evidencePillar === item.dimension_code ? "active" : ""}" data-gci-evidence-pillar="${esc(item.dimension_code)}">${esc(item.dimension_code)} · ${(item.children || []).length}</button>`).join("")}</div><p><b>${intFmt(items.length)}</b> / 20 · ${tr("официальных индикаторов", "official indicators")}</p></div><div class="gci-signal-grid">${items.map(signalCard).join("") || `<div class="gci-empty">${tr("Совпадений не найдено", "No matches found")}</div>`}</div></section>`;
  }

  function distributionBar(item) {
    const selected = Number(item.tier) === tier();
    return `<article class="gci-tier-row ${tierClass(item.tier)} ${selected ? "selected" : ""}"><header><span>T${item.tier}</span><div><strong>${esc(tierName(item))}</strong><small>${fmtCompact(item.minimum, 0)}–${fmtCompact(item.maximum, 0)} ${tr("баллов", "points")}</small></div><b>${intFmt(item.count)}</b><em>${pct(item.share, 1)}</em></header><div><i style="width:${clamp(item.share) * 100}%"></i>${selected ? `<mark style="left:${clamp(Number(score().official_score || 0) / 100) * 100}%">${fmt(score().official_score, 1)}</mark>` : ""}</div></article>`;
  }

  function roleModelCluster() {
    const leaders = (payload?.role_model_cluster || []).slice(0, 12);
    return `<div class="gci-role-model-cluster">${leaders.map((item) => `<button type="button" data-gci-country="${esc(item.iso3)}">${flag(item, "flag-img inline")}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.official_region || "—")}</small></span><b>${fmt(item.official_score, 1)}</b></button>`).join("")}</div>`;
  }

  function maturityScale() {
    const value = clamp(Number(score().official_score || 0) / 100);
    return `<div class="gci-maturity-scale"><div class="bands"><span class="tier-5" style="width:20%">T5</span><span class="tier-4" style="width:35%">T4</span><span class="tier-3" style="width:30%">T3</span><span class="tier-2" style="width:10%">T2</span><span class="tier-1" style="width:5%">T1</span></div><mark style="left:${value * 100}%"><i></i><b>${fmt(score().official_score, 2)}</b><small>${esc(selectedCountry().iso3)}</small></mark><div class="ticks"><span>0</span><span style="left:20%">20</span><span style="left:55%">55</span><span style="left:85%">85</span><span style="left:95%">95</span><span>100</span></div></div>`;
  }

  function tiersSection() {
    const path = payload?.maturity_path || {};
    return `<section class="gci-section" id="gciTiers">${sectionHeading("05", tr("Архитектура зрелости", "Maturity architecture"), tr("Официальные уровни вместо искусственной турнирной таблицы", "Official tiers instead of an artificial league table"), tr("GCI 2024 группирует экономики по диапазонам обязательств. Страны внутри уровня не получают официальных индивидуальных мест — это ограничение сохранено во всех элементах интерфейса.", "GCI 2024 groups economies by commitment bands. Economies within a tier do not receive official individual ranks — this constraint is preserved throughout the interface."))}<div class="gci-tier-layout"><article class="gci-tier-distribution"><header><div><span>194 ECONOMIES · 5 TIERS</span><h3>${tr("Глобальное распределение", "Global distribution")}</h3></div><strong>${esc(score().official_tier_code || `T${tier()}`)}</strong></header>${(payload?.summary?.tier_distribution || []).map(distributionBar).join("")}</article><article class="gci-maturity-card"><header><span>${tr("Траектория выбранной страны", "Selected economy path")}</span><h3>${path.is_role_model ? tr("Образцовый уровень достигнут", "Role-modelling tier reached") : `${fmt(path.points_to_next_tier, 2)} ${tr("балла до", "points to")} T${path.target_tier}`}</h3><p>${tr("Расстояние до порога рассчитано GIR непосредственно из официального score и официальных границ tier.", "Distance to the threshold is calculated by GIR directly from the official score and official tier boundaries.")}</p></header>${maturityScale()}${tierLadder(true)}</article></div><article class="gci-role-card"><header><div><span>T1 · ROLE-MODELLING</span><h3>${tr("Образцовый кластер", "Role-modelling cluster")}</h3><p>${tr("Экономики уровня T1 без присвоения мест внутри кластера. Нажатие открывает полный страновой профиль.", "T1 economies without ranks within the cluster. Select one to open its complete profile.")}</p></div><b>${intFmt(payload?.role_model_cluster?.length)}</b></header>${roleModelCluster()}</article></section>`;
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}" ${String(value) === String(selected) ? "selected" : ""}>${esc(label)}</option>`;
  }

  function rankingRows() {
    const query = ui.rankingQuery.trim().toLowerCase();
    return (payload?.ranking || []).filter((item) => {
      const matchesQuery = !query || [item.iso3, item.name_ru, item.name_en, item.source_country_name].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesRegion = ui.rankingRegion === "all" || item.official_region === ui.rankingRegion;
      const matchesIncome = ui.rankingIncome === "all" || item.platform_income_group === ui.rankingIncome;
      const matchesTier = ui.rankingTier === "all" || Number(item.official_tier) === Number(ui.rankingTier);
      return matchesQuery && matchesRegion && matchesIncome && matchesTier;
    });
  }

  function miniPillars(item) {
    return `<div class="gci-mini-pillars" aria-label="${tr("Пять столпов", "Five pillars")}">${["LS", "TS", "OS", "CDS", "CS"].map((code) => { const entry = item.pillars?.[code] || {}; const ratio = clamp(Number(entry.value || 0) / Number(entry.maximum_score || 20)); return `<span title="${esc(pillarShort(code))}: ${fmt(entry.value, 2)}"><i style="height:${Math.max(4, ratio * 100)}%"></i><small>${esc(code)}</small></span>`; }).join("")}</div>`;
  }

  function directoryRows(items) {
    return items.map((item) => `<tr class="${item.iso3 === selectedIso() ? "selected" : ""}"><td><span class="gci-tier-pill ${tierClass(item.official_tier)}">T${item.official_tier}</span></td><td><button type="button" class="gci-country-cell" data-gci-country="${esc(item.iso3)}">${flag(item, "flag-img inline")}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)} · ${esc(tierName(item))}</small></span></button></td><td><strong>${fmt(item.official_score, 2)}</strong><small>/ 100</small></td><td>${miniPillars(item)}</td><td><span>${esc(item.official_region || "—")}</span><small>${esc(item.platform_income_group || "—")}</small></td><td><span>${intFmt(item.available_indicators)} / 20</span><small>${item.missing_indicators ? `${intFmt(item.missing_indicators)} n/a` : tr("полный профиль", "complete")}</small></td><td><span>#${intFmt(item.gir_display_order)}</span><small>${tr("только навигация", "navigation only")}</small></td><td><button type="button" class="gci-row-evidence" data-gci-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></td></tr>`).join("");
  }

  function directorySection() {
    const filtered = rankingRows();
    const pages = Math.max(1, Math.ceil(filtered.length / ui.rankingPageSize));
    ui.rankingPage = Math.max(1, Math.min(ui.rankingPage, pages));
    const start = (ui.rankingPage - 1) * ui.rankingPageSize;
    const visible = filtered.slice(start, start + ui.rankingPageSize);
    return `<section class="gci-section" id="gciDirectory">${sectionHeading("06", tr("Глобальный каталог", "Global directory"), tr("194 экономики — без фиктивных официальных мест", "194 economies — without fabricated official ranks"), tr("Каталог упорядочен GIR по tier, score и ISO3 исключительно для навигации. Официальными остаются только score и tier; это правило повторено в таблице и CSV.", "The directory is ordered by GIR using tier, score and ISO3 solely for navigation. Only score and tier are official; the rule is repeated in the table and CSV."))}<div class="gci-directory-shell"><div class="gci-directory-toolbar"><label class="search"><span>${tr("Поиск", "Search")}</span><input id="gciRankingSearch" type="search" value="${esc(ui.rankingQuery)}" autocomplete="off" placeholder="${tr("страна или ISO3", "economy or ISO3")}" aria-label="${tr("Поиск экономики", "Search economy")}"></label><label><span>${tr("Регион ITU", "ITU region")}</span><select id="gciRankingRegion">${option("all", tr("Все регионы", "All regions"), ui.rankingRegion)}${(payload?.filters?.regions || []).map((value) => option(value, value, ui.rankingRegion)).join("")}</select></label><label><span>${tr("Доход", "Income")}</span><select id="gciRankingIncome">${option("all", tr("Все группы", "All groups"), ui.rankingIncome)}${(payload?.filters?.income_groups || []).map((value) => option(value, value, ui.rankingIncome)).join("")}</select></label><label><span>${tr("Уровень ITU", "ITU tier")}</span><select id="gciRankingTier">${option("all", tr("Все уровни", "All tiers"), ui.rankingTier)}${(payload?.tiers || []).map((item) => option(item.tier, `T${item.tier} · ${tierName(item)}`, ui.rankingTier)).join("")}</select></label><a class="gci-button" href="/api/gci/workspace.csv?country=${encodeURIComponent(selectedCountry().iso3)}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-gci-${payload.edition}.csv">${icon("download")} CSV</a></div><div class="gci-directory-meta"><span><b>${intFmt(filtered.length)}</b> / ${intFmt(payload?.ranking?.length)} ${tr("экономик", "economies")}</span><p><i></i>${tr("В таблице нет официальной графы rank. # в предпоследней колонке — только технический порядок GIR.", "There is no official rank column. # in the penultimate column is GIR's technical navigation order only.")}</p></div><div class="gci-directory-table-wrap"><table class="gci-directory-table"><thead><tr><th>${tr("Уровень", "Tier")}</th><th>${tr("Экономика", "Economy")}</th><th>${tr("Офиц. балл", "Official score")}</th><th>${tr("5 столпов", "5 pillars")}</th><th>${tr("Регион / доход", "Region / income")}</th><th>${tr("Данные", "Data")}</th><th>${tr("Порядок GIR*", "GIR order*")}</th><th></th></tr></thead><tbody>${directoryRows(visible) || `<tr><td colspan="8" class="gci-empty">${tr("Совпадений не найдено", "No matches found")}</td></tr>`}</tbody></table></div><footer class="gci-pagination"><span>${filtered.length ? `${intFmt(start + 1)}–${intFmt(Math.min(start + ui.rankingPageSize, filtered.length))}` : "0"} / ${intFmt(filtered.length)}</span><div><button type="button" data-gci-page="${ui.rankingPage - 1}" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${intFmt(ui.rankingPage)} / ${intFmt(pages)}</b><button type="button" data-gci-page="${ui.rankingPage + 1}" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer></div></section>`;
  }

  function methodCard(iconName, label, value, copy) {
    return `<article class="gci-method-card">${icon(iconName)}<span>${esc(label)}</span><strong>${esc(value)}</strong><p>${esc(copy)}</p></article>`;
  }

  function methodologySection() {
    const audit = payload?.audit || {};
    const formula = payload?.formula || {};
    const formulaText = lang() === "ru" ? formula.formula_text_ru : formula.formula_text_en;
    const notes = lang() === "ru" ? formula.method_notes_ru : formula.method_notes_en;
    return `<section class="gci-section" id="gciMethod">${sectionHeading("07", tr("Методология и доверие", "Methodology and trust"), tr("От официального score до проверяемой доказательной цепочки", "From official score to a verifiable evidence chain"), tr("GIR хранит источник, снимок, SHA-256, версию формулы и статус каждого значения. Производные сравнения не смешиваются с официальной оценкой ITU.", "GIR stores the source, snapshot, SHA-256, formula version and status of every value. Derived comparisons are never mixed with the official ITU assessment."))}<div class="gci-method-grid">${methodCard("boxes", tr("Архитектура", "Architecture"), "5 + 20", tr("пять столпов и двадцать опубликованных индикаторов", "five pillars and twenty published indicators"))}${methodCard("flag", tr("Охват", "Coverage"), intFmt(audit.countries_loaded), tr("193 государства-члена ITU и Государство Палестина", "193 ITU Member States and the State of Palestine"))}${methodCard("database", tr("Значения", "Values"), intFmt(audit.available_dimension_values), tr("официальных числовых значений; 194 честных n/a", "official numeric values; 194 explicit n/a values"))}${methodCard("clipboard-check", tr("Проверка", "Validation"), audit.validation_passed ? "PASS" : "CHECK", `${tr("макс. остаток формулы", "max formula residual")} ${Number(audit.max_total_formula_residual || 0).toExponential(2)}`)}</div><div class="gci-method-layout"><article class="gci-formula-card"><header><span>FORMULA · ITU GCI 2024</span><h3>${tr("Пять равнопредельных столпов", "Five equally capped pillars")}</h3></header><div class="gci-formula-big"><span>LS<small>0–20</small></span><i>+</i><span>TS<small>0–20</small></span><i>+</i><span>OS<small>0–20</small></span><i>+</i><span>CDS<small>0–20</small></span><i>+</i><span>CS<small>0–20</small></span><em>=</em><strong>GCI<small>0–100</small></strong></div><p>${esc(formulaText || "")}</p><small>${esc(notes || "")}</small></article><article class="gci-trust-card"><header><span>PROVENANCE · REPRODUCIBILITY</span><h3>${tr("Доказательная цепочка", "Evidence chain")}</h3></header><ol><li><b>01</b><span>${tr("Официальный машиночитаемый набор ITU", "Official machine-readable ITU dataset")}</span></li><li><b>02</b><span>SHA‑256 · ${esc(String(score().raw_snapshot_sha256 || "").slice(0, 20))}…</span></li><li><b>03</b><span>${tr("Детерминированное преобразование", "Deterministic transformation")} · ${esc(score().transform_id || "—")}</span></li><li><b>04</b><span>${tr("Проверка суммы столпов и tier", "Pillar-sum and tier validation")}</span></li></ol><button type="button" class="gci-button primary" data-gci-provenance="${esc(score().value_id || "")}">${tr("Проверить выбранное значение", "Inspect selected value")}</button></article></div><div class="gci-policy-note"><strong>${tr("Политика без псевдоранга", "No-pseudorank policy")}</strong><p>${esc(lang() === "ru" ? payload.diagnostics_note_ru : payload.diagnostics_note_en)}</p><a href="${esc(payload.source?.source_url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Перейти к официальному источнику ITU", "Open the official ITU source")} ↗</a></div></section>`;
  }

  function fullMarkup() {
    return `<div class="gci-workspace">${hero()}${jumpNav()}${postureSection()}${atlasSection()}${pillarsSection()}${signalsSection()}${tiersSection()}${directorySection()}${methodologySection()}</div>`;
  }

  function preserveScroll(renderFn, focusSelector = null) {
    const y = window.scrollY;
    renderFn();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "instant" });
      if (!focusSelector) return;
      const target = context?.root?.querySelector(focusSelector);
      if (!target) return;
      target.focus({ preventScroll: true });
      if (typeof target.setSelectionRange === "function") {
        const end = String(target.value || "").length;
        target.setSelectionRange(end, end);
      }
    });
  }

  function selectEconomy(iso3) {
    if (!iso3 || iso3 === selectedIso()) return;
    context?.selectCountry?.(iso3);
  }

  function bind() {
    const root = context?.root;
    if (!root) return;
    root.querySelectorAll("[data-gci-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.gciScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-gci-country]").forEach((element) => {
      const activate = () => selectEconomy(element.dataset.gciCountry);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-gci-provenance]").forEach((button) => button.addEventListener("click", () => { const valueId = button.dataset.gciProvenance; if (valueId) context?.openProvenance?.(valueId); }));
    root.querySelectorAll("[data-gci-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.gciMapMode; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-gci-evidence-pillar]").forEach((button) => button.addEventListener("click", () => { ui.evidencePillar = button.dataset.gciEvidencePillar; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-gci-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.rankingPage = Number(button.dataset.gciPage || 1); preserveScroll(renderReady); document.getElementById("gciDirectory")?.scrollIntoView({ block: "start" }); }));
    root.querySelector("[data-gci-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });

    const evidence = root.querySelector("#gciEvidenceSearch");
    evidence?.addEventListener("input", () => { ui.evidenceQuery = evidence.value; window.clearTimeout(evidence._gciTimer); evidence._gciTimer = window.setTimeout(() => preserveScroll(renderReady, "#gciEvidenceSearch"), 90); });
    const rankingSearch = root.querySelector("#gciRankingSearch");
    rankingSearch?.addEventListener("input", () => { ui.rankingQuery = rankingSearch.value; ui.rankingPage = 1; window.clearTimeout(rankingSearch._gciTimer); rankingSearch._gciTimer = window.setTimeout(() => preserveScroll(renderReady, "#gciRankingSearch"), 90); });
    [["#gciRankingRegion", "rankingRegion"], ["#gciRankingIncome", "rankingIncome"], ["#gciRankingTier", "rankingTier"]].forEach(([selector, key]) => root.querySelector(selector)?.addEventListener("change", (event) => { ui[key] = event.target.value; ui.rankingPage = 1; preserveScroll(renderReady); }));
  }

  function renderReady() {
    if (!context?.root || !payload) return;
    context.root.className = "view gci-workspace-host";
    context.root.innerHTML = fullMarkup();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    const serial = ++renderSerial;
    if (!context?.root || !selectedIso()) return;
    context.root.className = "view gci-workspace-host";
    context.root.innerHTML = loading();
    try {
      const [nextPayload, nextGeo] = await Promise.all([loadPayload(), loadGeo().catch(() => null)]);
      if (serial !== renderSerial) return;
      payload = nextPayload;
      if (nextGeo) geo = nextGeo;
      renderReady();
    } catch (error) {
      if (serial !== renderSerial) return;
      context.root.innerHTML = errorState(error);
      bind();
    }
  }

  function invalidate(countryCode = null) {
    if (countryCode) {
      [...cache.keys()].filter((key) => key.startsWith(`${String(countryCode).toUpperCase()}:`)).forEach((key) => cache.delete(key));
    }
    payload = null;
  }

  window.GIRGciWorkspace = { render, invalidate };
})();
