/* GIR Digitalisation / AI — Stage 08: Oxford Insights Government AI Readiness workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    mapMode: "rank",
    frameworkQuery: "",
    frameworkPillar: "all",
    rankingQuery: "",
    rankingRegion: "all",
    rankingIncome: "all",
    rankingBand: "all",
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
  const compact = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { maximumFractionDigits: digits })
    : "—";
  const intFmt = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const pct = (value, digits = 0) => finite(value) ? `${fmt(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const signed = (value, digits = 1) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}` : "—";
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.source_country_name || item?.iso3 || "—";
  const dimensionName = (item) => local(item) || item?.dimension_code || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}`;
  const selectedCountry = () => payload?.country || { iso3: selectedIso(), name_ru: selectedIso(), name_en: selectedIso() };
  const score = () => payload?.score || {};
  const selectedSummary = () => payload?.summary?.selected || {};
  const pillarByCode = (code) => (payload?.pillars || []).find((item) => item.dimension_code === code) || null;
  const deltaClass = (value) => Number(value) > .005 ? "positive" : Number(value) < -.005 ? "negative" : "neutral";

  function icon(name) {
    return `<img class="gari-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="gari-flag-fallback">${esc(item?.iso3 || "")}</span>`;
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
    const url = `/api/gari/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}`;
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
    return `<section class="gari-loading" aria-live="polite"><div class="gari-loading-orbit" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><b>AI</b></div><span>OXFORD INSIGHTS · GARI 2025</span><h1>${tr("Собирается профиль готовности государства к ИИ", "Building the government AI readiness profile")}</h1><p>${tr("Загружаются 195 государств, шесть столпов, 14 измерений, методологические определения и исправленные официальные места.", "Loading 195 governments, six pillars, 14 dimensions, methodology definitions and corrected official ranks.")}</p></section>`;
  }

  function errorState(error) {
    return `<section class="gari-error"><span>GARI · ERROR</span><h1>${tr("Рабочее пространство GARI не загрузилось", "The GARI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="gari-button primary" data-gari-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function pillarShort(code) {
    return ({
      PC: tr("Политика", "Policy"),
      AI_INFRA: tr("ИИ-инфраструктура", "AI infrastructure"),
      GOV: tr("Управление", "Governance"),
      PSA: tr("Госсектор", "Public sector"),
      DEV_DIFF: tr("Развитие", "Development"),
      RES: tr("Устойчивость", "Resilience"),
    })[code] || code;
  }

  function pillarCopy(code) {
    const values = {
      PC: ["стратегическое видение и исполнимость государственной политики", "strategic vision and the delivery capacity of public policy"],
      AI_INFRA: ["вычисления, сети, данные и базовая техническая среда", "compute, networks, data and the enabling technical environment"],
      GOV: ["принципы, регулирование, стандарты и институты подотчётности", "principles, regulation, standards and accountability institutions"],
      PSA: ["способность внедрять ИИ и цифровые услуги внутри государства", "the capacity to deploy AI and digital services across government"],
      DEV_DIFF: ["человеческий капитал, зрелость сектора и распространение технологий", "human capital, sector maturity and diffusion of technology"],
      RES: ["общественная адаптация, безопасность и устойчивый переход", "societal adaptation, safety and a resilient transition"],
    };
    const item = values[code] || ["", ""];
    return tr(item[0], item[1]);
  }

  function sectionHeading(number, eyebrow, title, copy) {
    return `<header class="gari-section-heading"><span>${esc(number)}</span><div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }

  function scoreDial() {
    const value = Number(score().derived_score || 0);
    const radius = 92;
    const c = 2 * Math.PI * radius;
    const offset = c * (1 - clamp(value / 100));
    const nodes = (payload?.pillars || []).map((item, index) => {
      const angle = -90 + index * 60;
      const x = 120 + Math.cos(angle * Math.PI / 180) * 105;
      const y = 120 + Math.sin(angle * Math.PI / 180) * 105;
      return `<circle class="node p${index + 1}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="6"><title>${esc(dimensionName(item))}: ${fmt(item.official_value, 2)}</title></circle>`;
    }).join("");
    return `<div class="gari-score-dial"><svg viewBox="0 0 240 240" role="img" aria-label="${tr("Официальное место", "Official rank")} ${intFmt(score().official_rank)}; Score GIR ${fmt(value, 2)}"><circle class="track" cx="120" cy="120" r="${radius}"></circle><circle class="value" cx="120" cy="120" r="${radius}" style="stroke-dasharray:${c.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"></circle>${nodes}<text class="rank" x="120" y="106" text-anchor="middle">#${intFmt(score().official_rank)}</text><text class="official" x="120" y="126" text-anchor="middle">${tr("ОФИЦИАЛЬНО", "OFFICIAL")}</text><text class="derived" x="120" y="157" text-anchor="middle">${fmt(score().derived_score_display, 2)}*</text><text class="scale" x="120" y="177" text-anchor="middle">GIR / 100</text></svg></div>`;
  }

  function hero() {
    const idx = payload?.index || {};
    const selected = selectedSummary();
    return `<section class="gari-hero" aria-labelledby="gariTitle"><article class="gari-hero-copy"><div class="gari-neural-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="gari-overline"><span>OXFORD INSIGHTS · GARI 2025</span><b>${tr("исправленная редакция", "corrected release")}</b><em>${tr("январь 2026", "January 2026")}</em></div><h1 id="gariTitle">${esc(lang() === "ru" ? idx.name_ru : idx.name_en)}</h1><p class="gari-hero-lead">${tr("Насколько государство способно использовать искусственный интеллект в общественных интересах — от стратегии и вычислений до внедрения, распространения и устойчивости.", "How capable a government is of harnessing artificial intelligence for public benefit — from policy and compute to adoption, diffusion and resilience.")}</p><div class="gari-edition-line"><span><b>${tr("Редакция", "Edition")}</b> 2025</span><span><b>${tr("Публикация", "Published")}</b> 2026-01</span><span><b>${tr("Охват", "Coverage")}</b> 195 ${tr("стран", "countries")}</span><span><b>${tr("Архитектура", "Architecture")}</b> 6 · 14 · 69</span></div><div class="gari-formula-strip">${(payload?.pillars || []).map((item) => `<span>${esc(item.dimension_code === "AI_INFRA" ? "AI INFRA" : item.dimension_code)}<small>${compact(Number(item.weight_index) * 100, 0)}%</small></span>`).join("<i>+</i>")}<em>→</em><strong>GARI*</strong></div><div class="gari-hero-actions"><button type="button" class="gari-button primary" data-gari-scroll="gariArchitecture">${tr("Разобрать готовность", "Explore readiness")}</button><a class="gari-button" href="/api/gari/workspace.csv?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-gari-${payload.edition}.csv">${icon("download")}${tr("Скачать рейтинг", "Download ranking")}</a><a class="gari-button quiet" href="${esc(payload.source?.source_url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Исправленный отчёт", "Corrected report")} ↗</a></div><div class="gari-correction-banner"><span>CORRECTED SOURCE</span><p>${tr("Исправленный отчёт января 2026 года заменяет декабрьскую публикацию с неверными баллами и местами. GIR использует только исправленный порядок.", "The corrected January 2026 report supersedes the December publication with incorrect scores and ranks. GIR uses only the corrected order.")}</p></div></article><aside class="gari-command-card"><header><div>${flag(selectedCountry())}<span><strong>${esc(countryName(selectedCountry()))}</strong><small>${esc(selectedCountry().iso3)} · ${esc(selectedCountry().platform_region || "—")}</small></span></div><mark><i></i>${tr("исправленные данные", "corrected data")}</mark></header>${scoreDial()}<div class="gari-command-grid"><div><span>${tr("Официальное место", "Official rank")}</span><strong>#${intFmt(score().official_rank)}</strong><small>Oxford Insights</small></div><div><span>Score GIR*</span><strong>${fmt(score().derived_score_display, 2)}</strong><small>${tr("пересчитан, не официальный", "recomputed, not official")}</small></div><div><span>${tr("В регионе", "Within region")}</span><strong>${intFmt(selected.gir_region_position)} / ${intFmt(selected.region_count)}</strong><small>${tr("диагностика GIR", "GIR diagnostic")}</small></div><div><span>${tr("В группе дохода", "Within income group")}</span><strong>${intFmt(selected.gir_income_position)} / ${intFmt(selected.income_count)}</strong><small>${tr("диагностика GIR", "GIR diagnostic")}</small></div></div><button type="button" class="gari-evidence-link" data-gari-provenance="${esc(score().value_id || "")}">${tr("Открыть доказательную запись", "Open evidence record")} <span>→</span></button></aside></section>`;
  }

  function jumpNav() {
    const links = [
      ["gariArchitecture", tr("6 столпов", "6 pillars")],
      ["gariAtlas", tr("Атлас", "Atlas")],
      ["gariRunway", tr("Траектория", "Runway")],
      ["gariFramework", tr("14 измерений", "14 dimensions")],
      ["gariRanking", tr("195 стран", "195 countries")],
      ["gariTrust", tr("Доверие", "Trust")],
    ];
    return `<nav class="gari-jump" aria-label="${tr("Разделы GARI", "GARI sections")}"><span>GARI / 2025</span>${links.map(([id, label], index) => `<button type="button" data-gari-scroll="${id}"><i>${String(index + 1).padStart(2, "0")}</i>${esc(label)}</button>`).join("")}</nav>`;
  }

  function radar() {
    const items = payload?.pillars || [];
    const cx = 220, cy = 210, radius = 150;
    const point = (index, value = 100) => {
      const angle = (-90 + index * 60) * Math.PI / 180;
      const r = radius * clamp(Number(value) / 100);
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    };
    const rings = [25, 50, 75, 100].map((value) => `<polygon points="${items.map((_, i) => point(i, value).join(",")).join(" ")}"></polygon>`).join("");
    const axes = items.map((_, i) => { const [x, y] = point(i, 100); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line>`; }).join("");
    const values = items.map((item, index) => point(index, item.official_value).join(",")).join(" ");
    const labels = items.map((item, index) => { const [x, y] = point(index, 118); return `<text x="${x}" y="${y}" text-anchor="middle">${esc(item.dimension_code === "AI_INFRA" ? "INFRA" : item.dimension_code === "DEV_DIFF" ? "DEV" : item.dimension_code)}</text>`; }).join("");
    return `<svg class="gari-radar" viewBox="0 0 440 420" role="img" aria-label="${tr("Шестиосевой профиль готовности", "Six-axis readiness profile")}"><g class="grid">${rings}${axes}</g><polygon class="area" points="${values}"></polygon><polyline class="line" points="${values} ${point(0, items[0]?.official_value).join(",")}"></polyline>${items.map((item, index) => { const [x, y] = point(index, item.official_value); return `<circle class="p${index + 1}" cx="${x}" cy="${y}" r="7"><title>${esc(dimensionName(item))}: ${fmt(item.official_value, 2)}</title></circle>`; }).join("")}${labels}</svg>`;
  }

  function pulse(item, index) {
    const b = item.benchmark || {};
    const globalGap = Number(item.official_value) - Number(b.global?.mean || 0);
    return `<article class="gari-pulse p${index + 1}"><header><span>0${index + 1} · ${esc(item.dimension_code)}</span><button type="button" data-gari-provenance="${esc(item.value_id || "")}" aria-label="${tr("Открыть происхождение", "Open provenance")}">↗</button></header><div class="gari-pulse-score" style="--v:${clamp(Number(item.official_value) / 100) * 100}%"><strong>${fmt(item.official_value, 2)}</strong><i></i></div><h3>${esc(dimensionName(item))}</h3><p>${esc(pillarCopy(item.dimension_code))}</p><footer><span>${tr("Мир", "Global")} <b>${fmt(b.global?.mean, 1)}</b></span><span>${tr("Регион", "Region")} <b>${fmt(b.region?.mean, 1)}</b></span><em class="${deltaClass(globalGap)}">${signed(globalGap, 1)}</em></footer></article>`;
  }

  function architectureSection() {
    const strongest = payload?.insights?.strongest_pillar;
    const constraint = payload?.insights?.constraint_pillar;
    return `<section class="gari-section" id="gariArchitecture">${sectionHeading("01", tr("Национальная архитектура ИИ", "National AI architecture"), tr("Шесть столпов — одна способность действовать", "Six pillars — one capacity to act"), tr("Официальные значения столпов показаны отдельно от производных средних GIR. Шестиосевой профиль помогает увидеть не только уровень, но и баланс национальной системы.", "Official pillar values are separated from GIR-derived benchmarks. The six-axis profile reveals both the level and balance of the national system."))}<div class="gari-architecture-top"><article class="gari-radar-card"><header><div><span>READINESS RADAR · 0–100</span><h3>${esc(countryName(selectedCountry()))}</h3></div><mark>${fmt(payload?.insights?.pillar_balance_spread, 1)}<small>${tr("размах", "spread")}</small></mark></header>${radar()}</article><aside class="gari-diagnostic-card"><span>EXECUTIVE DIAGNOSTIC · GIR</span><h3>${tr("Где система сильна — и что ограничивает следующий рывок", "Where the system is strong — and what constrains the next leap")}</h3><div><article class="strong"><small>${tr("Сильнейший столп", "Strongest pillar")}</small><strong>${esc(dimensionName(strongest))}</strong><b>${fmt(strongest?.official_value, 2)}</b><p>${esc(pillarCopy(strongest?.dimension_code))}</p></article><article class="constraint"><small>${tr("Ограничивающий столп", "Constraining pillar")}</small><strong>${esc(dimensionName(constraint))}</strong><b>${fmt(constraint?.official_value, 2)}</b><p>${esc(pillarCopy(constraint?.dimension_code))}</p></article></div><footer><span>${tr("Среднее шести столпов", "Six-pillar mean")} <b>${fmt(payload?.insights?.pillar_mean, 2)}</b></span><p>${tr("Диагностика GIR не меняет официальный ранг.", "GIR diagnostics do not alter the official rank.")}</p></footer></aside></div><div class="gari-pulse-grid">${(payload?.pillars || []).map(pulse).join("")}</div></section>`;
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
    if (ui.mapMode === "rank") {
      const rank = Number(item.official_rank || 999);
      if (rank <= 10) return "rank-1";
      if (rank <= 25) return "rank-2";
      if (rank <= 50) return "rank-3";
      if (rank <= 100) return "rank-4";
      if (rank <= 150) return "rank-5";
      return "rank-6";
    }
    const value = Number(item.derived_score || 0);
    if (value >= 75) return "score-6";
    if (value >= 60) return "score-5";
    if (value >= 45) return "score-4";
    if (value >= 30) return "score-3";
    if (value >= 15) return "score-2";
    return "score-1";
  }

  function worldMap() {
    if (!geo?.features) return `<div class="gari-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const byIso = new Map((payload?.ranking || []).map((item) => [item.iso3, item]));
    const width = 980, height = 440;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    return `<svg class="gari-world-map" viewBox="0 0 ${width} ${height}" role="group" aria-label="${tr("Карта готовности правительств к ИИ", "Government AI readiness map")}">${features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = byIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const text = item ? `#${intFmt(item.official_rank)} · ${fmt(item.derived_score_display, 2)}*` : tr("нет данных", "no data");
      return `<path class="gari-map-country ${mapTone(item)}${iso3 === selectedIso() ? " selected" : ""}" d="${d}" data-gari-country="${esc(iso3)}" tabindex="${item ? "0" : "-1"}" role="${item ? "button" : "img"}" aria-label="${esc(name)} · ${esc(text)}"><title>${esc(name)} · ${esc(text)}</title></path>`;
    }).join("")}</svg>`;
  }

  function mapLegend() {
    const bands = ui.mapMode === "rank"
      ? [["rank-1", "1–10"], ["rank-2", "11–25"], ["rank-3", "26–50"], ["rank-4", "51–100"], ["rank-5", "101–150"], ["rank-6", "151–195"]]
      : [["score-1", "0–14.99"], ["score-2", "15–29.99"], ["score-3", "30–44.99"], ["score-4", "45–59.99"], ["score-5", "60–74.99"], ["score-6", "75–100"]];
    return bands.map(([tone, label]) => `<span class="${tone}"><i></i>${label}</span>`).join("");
  }

  function regionCards() {
    return `<div class="gari-region-list">${(payload?.regional_landscape || []).map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(item.region)}</strong><small>${intFmt(item.count)} ${tr("стран", "countries")} · top‑25 ${intFmt(item.top25_count)}</small></div><b>${fmt(item.mean, 1)}*</b><button type="button" data-gari-country="${esc(item.leader?.iso3 || "")}" aria-label="${tr("Открыть лидера региона", "Open regional leader")}">${flag(item.leader)}<em>#${intFmt(item.leader?.official_rank)}</em></button></article>`).join("")}</div>`;
  }

  function atlasSection() {
    return `<section class="gari-section" id="gariAtlas">${sectionHeading("02", tr("Глобальный атлас", "Global atlas"), tr("195 государств на единой карте готовности", "195 governments on a single readiness map"), tr("Основной слой показывает исправленные официальные места. Второй слой показывает пересчитанный score GIR и всегда отмечен звёздочкой.", "The primary layer shows corrected official ranks. The second layer shows the GIR-recomputed score and is always marked with an asterisk."))}<div class="gari-atlas-layout"><article class="gari-map-card"><header><div><span>${tr("Слой карты", "Map layer")}</span><strong>${ui.mapMode === "rank" ? tr("Официальное место", "Official rank") : "Score GIR*"}</strong></div><div class="gari-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode === "rank" ? "active" : ""}" data-gari-map-mode="rank">${tr("Места", "Ranks")}</button><button type="button" class="${ui.mapMode === "score" ? "active" : ""}" data-gari-map-mode="score">Score GIR*</button></div></header><div class="gari-map-stage">${worldMap()}</div><div class="gari-map-legend">${mapLegend()}</div></article><aside class="gari-region-card"><header><span>REGIONS · GIR DIAGNOSTICS</span><h3>${tr("Региональный ландшафт", "Regional landscape")}</h3><p>${tr("Средние рассчитаны из пересчитанных scores; лидер определяется по исправленному официальному месту.", "Means use recomputed scores; the leader is determined by corrected official rank.")}</p></header>${regionCards()}</aside></div></section>`;
  }

  function runwayScale() {
    const rank = Number(score().official_rank || 195);
    const target = Number(payload?.runway?.target_rank || rank);
    return `<div class="gari-runway-scale"><div class="track"><i style="width:${clamp((195-rank)/194)*100}%"></i><span class="target" style="left:${clamp((195-target)/194)*100}%"><b>#${intFmt(target)}</b><small>${tr("цель", "target")}</small></span><mark style="left:${clamp((195-rank)/194)*100}%"><b>#${intFmt(rank)}</b><small>${esc(selectedIso())}</small></mark></div><div class="ticks"><span>#195</span><span>#150</span><span>#100</span><span>#50</span><span>#25</span><span>#10</span><span>#1</span></div></div>`;
  }

  function runwaySection() {
    const runway = payload?.runway || {};
    const target = runway.target_country || {};
    const priorities = (runway.priorities || []).slice(0, 3);
    const event = payload?.audit?.rank_events?.[0];
    return `<section class="gari-section" id="gariRunway">${sectionHeading("03", tr("Стратегическая траектория", "Strategic runway"), tr("От текущего места к следующему контрольному рубежу", "From the current rank to the next decision milestone"), tr("Runway — это сценарная диагностика GIR, а не прогноз Oxford Insights. Она сопоставляет выбранную страну с официальным рубежом и показывает взвешенные разрывы столпов.", "The runway is a GIR scenario diagnostic, not an Oxford Insights forecast. It compares the selected country with an official-rank milestone and exposes weighted pillar gaps."))}<div class="gari-runway-layout"><article class="gari-runway-card"><header><div><span>MILESTONE · GIR</span><h3>#${intFmt(score().official_rank)} → TOP‑${intFmt(runway.target_rank)}</h3><p>${tr("Контрольная граница", "Boundary reference")}: ${flag(target)} <b>${esc(countryName(target))}</b> · #${intFmt(target.official_rank)} · ${fmt(target.derived_score_display, 2)}*</p></div><mark>${fmt(runway.score_gap_to_target_boundary, 2)}<small>${tr("score до границы", "score to boundary")}</small></mark></header>${runwayScale()}<div class="gari-priority-list">${priorities.map((item, index) => { const pillar = pillarByCode(item.dimension_code); return `<article><span>0${index + 1}</span><div><strong>${esc(dimensionName(pillar))}</strong><small>${tr("взвешенный разрыв", "weighted gap")} ${fmt(item.weighted_gap, 2)}</small></div><b>${fmt(item.selected_value, 1)}<i>→</i>${fmt(item.reference_mean, 1)}</b></article>`; }).join("")}</div></article><aside class="gari-audit-card"><header><span>ROUNDING AUDIT · 1 EVENT</span><h3>${tr("Почему официальный ранг важнее сортировки score GIR", "Why official rank outranks GIR score sorting")}</h3></header>${event ? `<div class="gari-audit-pair"><article>${flag(event.country_a)}<span><strong>${esc(countryName(event.country_a))}</strong><small>#${intFmt(event.official_rank_a)} ${tr("официально", "official")}</small></span><b>${fmt(event.derived_score_a, 3)}*</b></article><i>≠</i><article>${flag(event.country_b)}<span><strong>${esc(countryName(event.country_b))}</strong><small>#${intFmt(event.official_rank_b)} ${tr("официально", "official")}</small></span><b>${fmt(event.derived_score_b, 3)}*</b></article></div>` : ""}<p>${tr("Столпы опубликованы с двумя знаками. На одной соседней паре округление меняет порядок пересчитанных значений; GIR сохраняет исправленный официальный ранг.", "Pillars are printed to two decimals. For one adjacent pair, rounding reverses the recomputed order; GIR preserves the corrected official rank.")}</p><strong>${tr("Решение", "Resolution")}: preserve_corrected_official_rank</strong></aside></div></section>`;
  }

  function frameworkRows() {
    const query = ui.frameworkQuery.trim().toLowerCase();
    const roots = payload?.structure || [];
    return roots.flatMap((root) => (root.children || []).map((dimension) => ({ root, dimension }))).filter(({ root, dimension }) => {
      if (ui.frameworkPillar !== "all" && root.dimension_code !== ui.frameworkPillar) return false;
      if (!query) return true;
      const haystack = [dimension.dimension_code, dimension.name_ru, dimension.name_en, ...(dimension.children || []).flatMap((item) => [item.dimension_code, item.name_ru, item.name_en])].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  function frameworkCard(root, dimension) {
    const indicators = dimension.children || [];
    return `<article class="gari-framework-card"><header><span>${esc(root.dimension_code)} · ${compact(Number(dimension.weight_index) * 100, 2)}%</span><mark>${intFmt(indicators.length)} ${tr("индик.", "ind.")}</mark></header><h3>${esc(dimensionName(dimension))}</h3><p>${tr("Страновое значение не опубликовано", "Country value not published")}</p><div>${indicators.map((item) => `<span><i></i><b>${esc(dimensionName(item))}</b><small>${esc(item.dimension_code)}</small></span>`).join("")}</div><footer><span>${tr("Определение методологии", "Methodology definition")}</span><button type="button" data-gari-provenance="${esc(root.value_id || score().value_id || "")}">${tr("Источник", "Source")} ↗</button></footer></article>`;
  }

  function frameworkSection() {
    const rows = frameworkRows();
    return `<section class="gari-section" id="gariFramework">${sectionHeading("04", tr("Методологический explorer", "Methodology explorer"), tr("6 столпов → 14 измерений → 69 заявленных индикаторов", "6 pillars → 14 dimensions → 69 declared indicators"), tr("Oxford Insights публикует страновые значения шести столпов. Нижний уровень показан как методологическая структура: 63 индикатора названы в доступном framework, ещё шесть не реконструируются предположениями.", "Oxford Insights publishes country values for six pillars. Lower levels are shown as methodology structure: 63 indicators are named in the available framework; six more are not reconstructed by assumption."))}<div class="gari-framework-stats"><span><b>6</b>${tr("столпов", "pillars")}</span><span><b>14</b>${tr("измерений", "dimensions")}</span><span><b>69</b>${tr("заявлено", "declared")}</span><span><b>63</b>${tr("названо", "named")}</span></div><div class="gari-framework-toolbar"><label class="search"><span>${tr("Поиск по структуре", "Search the framework")}</span><input id="gariFrameworkSearch" type="search" value="${esc(ui.frameworkQuery)}" autocomplete="off" aria-label="${tr("Поиск измерения или индикатора", "Search dimension or indicator")}"></label><div class="gari-framework-filters" role="group" aria-label="${tr("Фильтр по столпу", "Filter by pillar")}"><button type="button" class="${ui.frameworkPillar === "all" ? "active" : ""}" data-gari-framework-pillar="all">${tr("Все", "All")}</button>${(payload?.pillars || []).map((item) => `<button type="button" class="${ui.frameworkPillar === item.dimension_code ? "active" : ""}" data-gari-framework-pillar="${esc(item.dimension_code)}">${esc(item.dimension_code === "AI_INFRA" ? "INFRA" : item.dimension_code === "DEV_DIFF" ? "DEV" : item.dimension_code)}</button>`).join("")}</div></div><div class="gari-framework-grid">${rows.map(({root, dimension}) => frameworkCard(root, dimension)).join("") || `<p class="gari-empty">${tr("Совпадений не найдено", "No matches found")}</p>`}</div><div class="gari-framework-note"><strong>${tr("Честная граница данных", "Honest data boundary")}</strong><p>${tr("GIR не создаёт страновые scores для измерений и индикаторов, которых нет в официальной полной таблице. Эти узлы помогают понять конструкцию индекса, но не притворяются наблюдениями.", "GIR does not create country scores for dimensions and indicators absent from the official full table. These nodes explain the index design without masquerading as observations.")}</p></div></section>`;
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}" ${String(value) === String(selected) ? "selected" : ""}>${esc(label)}</option>`;
  }

  function rankingRows() {
    const query = ui.rankingQuery.trim().toLowerCase();
    return (payload?.ranking || []).filter((item) => {
      const queryOk = !query || [item.iso3, item.name_ru, item.name_en, item.source_country_name].some((value) => String(value || "").toLowerCase().includes(query));
      const regionOk = ui.rankingRegion === "all" || item.platform_region === ui.rankingRegion;
      const incomeOk = ui.rankingIncome === "all" || item.platform_income_group === ui.rankingIncome;
      const bandOk = ui.rankingBand === "all" || item.rank_band === ui.rankingBand;
      return queryOk && regionOk && incomeOk && bandOk;
    });
  }

  function miniPillars(item) {
    return `<div class="gari-mini-pillars" aria-label="${tr("Шесть столпов", "Six pillars")}">${["PC","AI_INFRA","GOV","PSA","DEV_DIFF","RES"].map((code) => { const entry = item.pillars?.[code] || {}; return `<span title="${esc(pillarShort(code))}: ${fmt(entry.value, 2)}"><i style="height:${Math.max(4, clamp(Number(entry.value) / 100) * 100)}%"></i><small>${esc(code === "AI_INFRA" ? "AI" : code === "DEV_DIFF" ? "DEV" : code)}</small></span>`; }).join("")}</div>`;
  }

  function directoryRows(items) {
    return items.map((item) => `<tr class="${item.iso3 === selectedIso() ? "selected" : ""}"><td><strong>#${intFmt(item.official_rank)}</strong><small>${tr("официально", "official")}</small></td><td><button type="button" class="gari-country-cell" data-gari-country="${esc(item.iso3)}">${flag(item)}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)}</small></span></button></td><td><strong>${fmt(item.derived_score_display, 2)}*</strong><small>${tr("не официальный", "not official")}</small></td><td>${miniPillars(item)}</td><td><span>${esc(item.platform_region || "—")}</span><small>${esc(item.platform_income_group || "—")}</small></td><td><span>P${compact(item.gir_percentile, 1)}</span><small>${tr("диагностика GIR", "GIR diagnostic")}</small></td><td><button type="button" class="gari-row-evidence" data-gari-provenance="${esc(item.value_id || "")}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></td></tr>`).join("");
  }

  function podium() {
    return `<div class="gari-podium">${(payload?.top10_cluster || []).slice(0, 3).map((item, index) => `<button type="button" class="place-${index + 1}" data-gari-country="${esc(item.iso3)}"><span>#${intFmt(item.official_rank)}</span>${flag(item)}<strong>${esc(countryName(item))}</strong><b>${fmt(item.derived_score_display, 2)}*</b><small>${esc(item.platform_region || "—")}</small></button>`).join("")}</div>`;
  }

  function rankingSection() {
    const filtered = rankingRows();
    const pages = Math.max(1, Math.ceil(filtered.length / ui.rankingPageSize));
    ui.rankingPage = Math.max(1, Math.min(ui.rankingPage, pages));
    const start = (ui.rankingPage - 1) * ui.rankingPageSize;
    const visible = filtered.slice(start, start + ui.rankingPageSize);
    return `<section class="gari-section" id="gariRanking">${sectionHeading("05", tr("Исправленный мировой рейтинг", "Corrected world ranking"), tr("195 стран: официальное место и шесть опубликованных столпов", "195 countries: official rank and six published pillars"), tr("Порядок таблицы полностью следует исправленному отчёту Oxford Insights. Score GIR* помогает анализу, но никогда не используется для перестановки стран.", "Table order follows the corrected Oxford Insights report exactly. GIR score* supports analysis but is never used to reorder countries."))}${podium()}<div class="gari-directory-shell"><div class="gari-directory-toolbar"><label class="search"><span>${tr("Поиск", "Search")}</span><input id="gariRankingSearch" type="search" value="${esc(ui.rankingQuery)}" autocomplete="off" aria-label="${tr("Поиск страны", "Search country")}"></label><label><span>${tr("Регион", "Region")}</span><select id="gariRankingRegion">${option("all", tr("Все регионы", "All regions"), ui.rankingRegion)}${(payload?.filters?.regions || []).map((value) => option(value, value, ui.rankingRegion)).join("")}</select></label><label><span>${tr("Доход", "Income")}</span><select id="gariRankingIncome">${option("all", tr("Все группы", "All groups"), ui.rankingIncome)}${(payload?.filters?.income_groups || []).map((value) => option(value, value, ui.rankingIncome)).join("")}</select></label><label><span>${tr("Диапазон мест", "Rank band")}</span><select id="gariRankingBand">${option("all", tr("Все места", "All ranks"), ui.rankingBand)}${(payload?.filters?.rank_bands || []).map((item) => option(item.code, lang() === "ru" ? item.name_ru : item.name_en, ui.rankingBand)).join("")}</select></label><a class="gari-button" href="/api/gari/workspace.csv?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-gari-${payload.edition}.csv">${icon("download")} CSV</a></div><div class="gari-directory-meta"><span><b>${intFmt(filtered.length)}</b> / ${intFmt(payload?.ranking?.length)} ${tr("стран", "countries")}</span><p><i></i>${tr("Авторитетная сортировка: исправленное официальное место.", "Authoritative sorting: corrected official rank.")}</p></div><div class="gari-directory-table-wrap"><table class="gari-directory-table"><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Страна", "Country")}</th><th>Score GIR*</th><th>${tr("6 столпов", "6 pillars")}</th><th>${tr("Регион / доход", "Region / income")}</th><th>${tr("Процентиль GIR", "GIR percentile")}</th><th></th></tr></thead><tbody>${directoryRows(visible) || `<tr><td colspan="7" class="gari-empty">${tr("Совпадений не найдено", "No matches found")}</td></tr>`}</tbody></table></div><footer class="gari-pagination"><span>${filtered.length ? `${intFmt(start + 1)}–${intFmt(Math.min(start + ui.rankingPageSize, filtered.length))}` : "0"} / ${intFmt(filtered.length)}</span><div><button type="button" data-gari-page="${ui.rankingPage - 1}" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${intFmt(ui.rankingPage)} / ${intFmt(pages)}</b><button type="button" data-gari-page="${ui.rankingPage + 1}" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer></div></section>`;
  }

  function methodCard(iconName, label, value, copy) {
    return `<article class="gari-method-card">${icon(iconName)}<span>${esc(label)}</span><strong>${esc(value)}</strong><p>${esc(copy)}</p></article>`;
  }

  function trustSection() {
    const audit = payload?.audit || {};
    const formula = payload?.formula || {};
    return `<section class="gari-section" id="gariTrust">${sectionHeading("06", tr("Методология и доверие", "Methodology and trust"), tr("Официальный ранг, официальный столп, производный score — три разных статуса", "Official rank, official pillar, derived score — three distinct statuses"), tr("Каждое значение сохраняет source ID, SHA‑256 снимка, transformation run и версию формулы. Исправленная редакция и событие округления остаются видимыми пользователю.", "Every value preserves source ID, snapshot SHA‑256, transformation run and formula version. The corrected release and rounding event remain visible to the user."))}<div class="gari-method-grid">${methodCard("flag", tr("Официальный охват", "Official coverage"), intFmt(audit.countries_loaded), tr("исправленных мест и профилей государств", "corrected ranks and government profiles"))}${methodCard("boxes", tr("Архитектура", "Architecture"), "6 · 14 · 69", tr("шесть столпов, 14 измерений, 69 заявленных индикаторов", "six pillars, 14 dimensions, 69 declared indicators"))}${methodCard("database", tr("Опубликованные значения", "Published values"), intFmt(audit.country_pillar_rows_loaded), tr("официальных страновых значений столпов", "official country-level pillar values"))}${methodCard("clipboard-check", tr("Аудит", "Audit"), audit.validation_passed ? "PASS" : "CHECK", tr("одна округлительная инверсия сохранена и объяснена", "one rounding inversion retained and explained"))}</div><div class="gari-trust-layout"><article class="gari-formula-card"><header><span>FORMULA · GARI* 2025</span><h3>${tr("Официальные веса, пересчёт GIR", "Official weights, GIR recomputation")}</h3></header><div class="gari-formula-big"><span>PC<small>10%</small></span><i>+</i><span>INFRA<small>25%</small></span><i>+</i><span>GOV<small>15%</small></span><i>+</i><span>PSA<small>15%</small></span><i>+</i><span>DEV<small>25%</small></span><i>+</i><span>RES<small>10%</small></span><em>=</em><strong>GARI*</strong></div><p>${esc(lang() === "ru" ? formula.formula_text_ru : formula.formula_text_en)}</p><small>${esc(lang() === "ru" ? formula.method_notes_ru : formula.method_notes_en)}</small></article><article class="gari-chain-card"><header><span>PROVENANCE · CORRECTED RELEASE</span><h3>${tr("Доказательная цепочка", "Evidence chain")}</h3></header><ol><li><b>01</b><span>${tr("Исправленный официальный отчёт января 2026", "Corrected official January 2026 report")}</span></li><li><b>02</b><span>SHA‑256 · ${esc(String(score().raw_snapshot_sha256 || "").slice(0, 22))}…</span></li><li><b>03</b><span>${tr("Официальное место и шесть столпов", "Official rank and six pillars")}</span></li><li><b>04</b><span>${tr("Детерминированный пересчёт score GIR*", "Deterministic GIR score* recomputation")}</span></li></ol><button type="button" class="gari-button primary" data-gari-provenance="${esc(score().value_id || "")}">${tr("Проверить выбранное значение", "Inspect selected value")}</button></article></div><div class="gari-policy-note"><strong>${tr("Политика доказательной маркировки", "Evidence-labelling policy")}</strong><p>${esc(lang() === "ru" ? payload.diagnostics_note_ru : payload.diagnostics_note_en)}</p><a href="${esc(payload.source?.source_url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Открыть исправленный отчёт Oxford Insights", "Open the corrected Oxford Insights report")} ↗</a></div></section>`;
  }

  function fullMarkup() {
    return `<div class="gari-workspace">${hero()}${jumpNav()}${architectureSection()}${atlasSection()}${runwaySection()}${frameworkSection()}${rankingSection()}${trustSection()}</div>`;
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

  function selectCountry(iso3) {
    if (!iso3 || iso3 === selectedIso()) return;
    context?.selectCountry?.(iso3);
  }

  function bind() {
    const root = context?.root;
    if (!root) return;
    root.querySelectorAll("[data-gari-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.gariScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-gari-country]").forEach((element) => {
      const activate = () => selectCountry(element.dataset.gariCountry);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-gari-provenance]").forEach((button) => button.addEventListener("click", () => { const valueId = button.dataset.gariProvenance; if (valueId) context?.openProvenance?.(valueId); }));
    root.querySelectorAll("[data-gari-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.gariMapMode; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-gari-framework-pillar]").forEach((button) => button.addEventListener("click", () => { ui.frameworkPillar = button.dataset.gariFrameworkPillar; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-gari-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.rankingPage = Number(button.dataset.gariPage || 1); preserveScroll(renderReady); document.getElementById("gariRanking")?.scrollIntoView({ block: "start" }); }));
    root.querySelector("[data-gari-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });

    const frameworkSearch = root.querySelector("#gariFrameworkSearch");
    frameworkSearch?.addEventListener("input", () => { ui.frameworkQuery = frameworkSearch.value; window.clearTimeout(frameworkSearch._gariTimer); frameworkSearch._gariTimer = window.setTimeout(() => preserveScroll(renderReady, "#gariFrameworkSearch"), 90); });
    const rankingSearch = root.querySelector("#gariRankingSearch");
    rankingSearch?.addEventListener("input", () => { ui.rankingQuery = rankingSearch.value; ui.rankingPage = 1; window.clearTimeout(rankingSearch._gariTimer); rankingSearch._gariTimer = window.setTimeout(() => preserveScroll(renderReady, "#gariRankingSearch"), 90); });
    [["#gariRankingRegion", "rankingRegion"], ["#gariRankingIncome", "rankingIncome"], ["#gariRankingBand", "rankingBand"]].forEach(([selector, key]) => root.querySelector(selector)?.addEventListener("change", (event) => { ui[key] = event.target.value; ui.rankingPage = 1; preserveScroll(renderReady); }));
  }

  function renderReady() {
    if (!context?.root || !payload) return;
    context.root.className = "view gari-workspace-host";
    context.root.innerHTML = fullMarkup();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    const serial = ++renderSerial;
    if (!context?.root || !selectedIso()) return;
    context.root.className = "view gari-workspace-host";
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

  window.GIRGariWorkspace = { render, invalidate };
})();
