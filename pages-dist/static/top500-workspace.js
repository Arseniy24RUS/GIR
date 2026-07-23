/* GIR Digitalisation / AI / Compute — Stage 14: TOP500 / Green500 observatory. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    metric: "SUM_RMAX",
    mapMode: "value",
    architectureScope: "global",
    architectureFacet: "manufacturers",
    countryQuery: "",
    countryRegion: "all",
    countryStatus: "represented",
    countryPage: 1,
    countryPageSize: 20,
    systemList: "TOP500",
    systemQuery: "",
    systemCountry: "all",
    systemManufacturer: "all",
    systemSegment: "all",
    systemPage: 1,
    systemPageSize: 20,
    selectedSystemId: null,
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
  const num = (value, digits = 2) => finite(value)
    ? Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  const compact = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { notation: "compact", maximumFractionDigits: digits })
    : "—";
  const integer = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const percent = (value, digits = 1) => finite(value) ? `${num(value, digits)}%` : "—";
  const share = (value, digits = 0) => finite(value) ? `${num(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}:${ui.metric}`;
  const selectedCountry = () => payload?.country || { iso3: selectedIso(), name_ru: selectedIso(), name_en: selectedIso() };
  const aggregate = () => payload?.aggregate || {};
  const selectedProfile = () => payload?.selected_profile || {};
  const metricDefinition = (code = ui.metric) => (payload?.metrics || []).find((item) => item.metric_code === code) || {};

  function icon(name) {
    return `<img class="top-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="top-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  function countryName(item) {
    return local(item) || item?.source_country_name || item?.iso3 || "—";
  }

  function metricName(item) {
    return local(item) || item?.metric_code || "—";
  }

  function formatPerformance(value) {
    if (!finite(value)) return { value: "—", unit: "TFlop/s" };
    const raw = Number(value);
    if (Math.abs(raw) >= 1_000_000) return { value: num(raw / 1_000_000, 3), unit: "EFlop/s" };
    if (Math.abs(raw) >= 1_000) return { value: num(raw / 1_000, raw >= 100_000 ? 1 : 2), unit: "PFlop/s" };
    return { value: num(raw, raw >= 100 ? 1 : 2), unit: "TFlop/s" };
  }

  function formatMetric(code, value, { compactMode = false } = {}) {
    if (!finite(value)) return { value: "N/A", unit: metricDefinition(code).unit || "" };
    if (["SUM_RMAX", "SUM_RPEAK"].includes(code)) return formatPerformance(value);
    if (code === "WORLD_RMAX_SHARE") return { value: percent(value, Number(value) < 1 ? 3 : 1), unit: "" };
    if (code === "TOTAL_CORES") return { value: compactMode ? compact(value, 2) : integer(value), unit: tr("ядер", "cores") };
    if (["SYSTEM_COUNT", "TOP100_COUNT"].includes(code)) return { value: integer(value), unit: tr("систем", "systems") };
    if (["BEST_GREEN_EFFICIENCY", "MEDIAN_GREEN_EFFICIENCY"].includes(code)) return { value: num(value, 2), unit: "GFlops/W" };
    return { value: num(value, 2), unit: metricDefinition(code).unit || "" };
  }

  function metricShort(code) {
    const labels = {
      SUM_RMAX: ["Rmax", "Rmax"],
      SYSTEM_COUNT: ["Системы", "Systems"],
      SUM_RPEAK: ["Rpeak", "Rpeak"],
      WORLD_RMAX_SHARE: ["Доля Rmax", "Rmax share"],
      TOTAL_CORES: ["Ядра", "Cores"],
      TOP100_COUNT: ["Top‑100", "Top‑100"],
      BEST_GREEN_EFFICIENCY: ["Green max", "Green max"],
      MEDIAN_GREEN_EFFICIENCY: ["Green median", "Green median"],
    };
    const pair = labels[code] || [code, code];
    return tr(pair[0], pair[1]);
  }

  function metricGlyph(code) {
    const paths = {
      SUM_RMAX: `<path d="M4 48C21 48 20 16 38 16s16 26 35 26 18-34 39-34 18 40 38 40"/>`,
      SYSTEM_COUNT: `<rect x="9" y="27" width="26" height="25"/><rect x="47" y="13" width="26" height="39"/><rect x="85" y="4" width="26" height="48"/><rect x="123" y="20" width="26" height="32"/>`,
      SUM_RPEAK: `<polyline points="5,50 28,37 50,41 74,20 98,25 123,7 149,15"/><path d="M126 7h18v18"/>`,
      WORLD_RMAX_SHARE: `<circle cx="78" cy="29" r="25"/><path d="M78 4a25 25 0 0 1 22 37L78 29Z"/><path d="M6 52h144"/>`,
      TOTAL_CORES: `<g>${Array.from({ length: 24 }, (_, i) => `<rect x="${8 + (i % 8) * 18}" y="${5 + Math.floor(i / 8) * 18}" width="11" height="11"/>`).join("")}</g>`,
      TOP100_COUNT: `<path d="M13 49V9h28v40M50 49V20h28v29M87 49V29h28v20M124 49V37h22v12"/><path d="M3 49h150"/>`,
      BEST_GREEN_EFFICIENCY: `<path d="M77 52C35 34 31 10 31 10s27-4 46 18c19-22 46-18 46-18s-4 24-46 42Z"/><path d="M77 52V25"/>`,
      MEDIAN_GREEN_EFFICIENCY: `<path d="M13 30h134"/><circle cx="77" cy="30" r="19"/><path d="M77 11v38M58 30h38"/>`,
    };
    return `<svg viewBox="0 0 156 58" aria-hidden="true">${paths[code] || ""}</svg>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        message = typeof body?.detail === "string" ? body.detail : body?.detail?.message_en || message;
      } catch (_) { /* response is not JSON */ }
      throw new Error(message);
    }
    return response.json();
  }

  function loadPayload() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const url = `/api/top500/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&metric=${encodeURIComponent(ui.metric)}`;
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
    return `<section class="top-loading" aria-live="polite"><div class="top-loading-core" aria-hidden="true"><i></i><i></i><i></i><b>500</b></div><span>TOP500 · GREEN500 · JUNE 2026</span><h1>${tr("Собирается глобальная карта вычислительных мощностей", "Building the global compute-capacity observatory")}</h1><p>${tr("Загружаются 500 официальных систем, восемь страновых линз, архитектурный профиль и отдельный контур энергоэффективности.", "Loading 500 official systems, eight country lenses, the architecture profile and a separate energy-efficiency layer.")}</p></section>`;
  }

  function errorState(error) {
    return `<section class="top-error"><span>TOP500 · ERROR</span><h1>${tr("Рабочее пространство TOP500 не загрузилось", "The TOP500 workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="top-button primary" data-top-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function sectionHeading(number, eyebrow, title, copy) {
    return `<header class="top-section-heading"><span>${esc(number)}</span><div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }

  function metricButtons() {
    return `<div class="top-metric-switcher" role="group" aria-label="${tr("Страновая метрическая линза", "Country metric lens")}">${(payload?.metrics || []).map((item) => `<button type="button" class="${ui.metric === item.metric_code ? "active" : ""}" data-top-metric="${esc(item.metric_code)}"><i></i><span>${esc(metricShort(item.metric_code))}</span><small>${esc(item.unit)}</small></button>`).join("")}</div>`;
  }

  function coreVisual() {
    const represented = Boolean(aggregate().represented_in_top500);
    const value = formatMetric(ui.metric, selectedProfile().value);
    const order = selectedProfile().gir_navigation_order;
    const shareValue = Number(aggregate().share_world_rmax_pct || 0);
    return `<div class="top-core-visual ${represented ? "represented" : "absent"}"><div class="top-core-rings" aria-hidden="true"><i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i><i class="orbit o1"></i><i class="orbit o2"></i><span class="node n1"></span><span class="node n2"></span><span class="node n3"></span></div><div class="top-core-readout"><small>${esc(ui.metric)}</small><strong>${esc(value.value)}</strong><em>${esc(value.unit)}</em><mark>${!represented ? tr("НЕ ПРЕДСТАВЛЕНА", "NOT REPRESENTED") : metricDefinition(ui.metric) && finite(selectedProfile().value) && order ? `${tr("GIR-порядок", "GIR order")} #${integer(order)}*` : tr("N/A · НЕТ ПОРЯДКА", "N/A · NO ORDER")}</mark></div><footer><span>${tr("Систем", "Systems")} <b>${integer(aggregate().systems_count)}</b></span><span>${tr("Доля Rmax", "Rmax share")} <b>${percent(shareValue, shareValue < 1 ? 3 : 1)}</b></span></footer></div>`;
  }

  function hero() {
    const idx = payload?.index || {};
    const metric = selectedProfile();
    const represented = Boolean(aggregate().represented_in_top500);
    return `<section class="top-hero" aria-labelledby="topTitle"><article class="top-hero-copy"><div class="top-grid-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="top-overline"><span>TOP500 · LIST 67</span><b>GREEN500 · JUNE 2026</b><em>${tr("официальные системные места", "official system ranks")}</em></div><h1 id="topTitle">${esc(lang() === "ru" ? idx.name_ru : idx.name_en)}</h1><p class="top-hero-lead">${tr("Глобальная обсерватория высокопроизводительных вычислений: официальные суперкомпьютерные системы, национальные агрегаты мощности и отдельный контур энергоэффективности без искусственного странового индекса.", "A global high-performance-computing observatory: official supercomputer systems, national capacity aggregates and a separate energy-efficiency layer without an artificial country index.")}</p><div class="top-edition-line"><span><b>${tr("Редакция", "Edition")}</b> ${esc(payload?.edition)}</span><span><b>${tr("Публикация", "Published")}</b> ${esc(payload?.release_date)}</span><span><b>${tr("Системы", "Systems")}</b> 500 + 500</span><span><b>${tr("Страны в списке", "Countries represented")}</b> ${integer(payload?.atlas?.represented_countries)}</span></div>${metricButtons()}<div class="top-hero-actions"><button type="button" class="top-button primary" data-top-scroll="topAtlas">${icon("map")} ${tr("Открыть атлас", "Open atlas")}</button><button type="button" class="top-button" data-top-scroll="topSystems">${icon("server")} ${tr("500 систем", "500 systems")}</button><a class="top-button" href="/api/top500/workspace.csv?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&metric=${encodeURIComponent(ui.metric)}&lang=${lang()}" download="gir-top500-${ui.metric.toLowerCase()}-${payload?.value_year}.csv">${icon("download")} CSV</a></div><div class="top-science-banner"><span>NO COMPOSITE · NO OFFICIAL COUNTRY RANK</span><p>${tr("Официальные места принадлежат отдельным системам. Страновой порядок GIR существует только внутри одной выбранной физической метрики и не является рейтингом TOP500.org.", "Official ranks belong to individual systems. A GIR country order exists only within one selected physical metric and is not a TOP500.org country ranking.")}</p></div></article><aside class="top-command-card"><header><div>${flag(selectedCountry(), "flag-img")}<span><strong>${esc(countryName(selectedCountry()))}</strong><small>${esc(selectedCountry().iso3)} · ${esc(selectedCountry().region || "")}</small></span></div><mark>${represented ? tr("В СПИСКЕ", "REPRESENTED") : tr("ВНЕ СПИСКА", "NOT LISTED")}</mark></header>${coreVisual()}<div class="top-command-grid"><div><span>${tr("Выбранная линза", "Selected lens")}</span><strong>${esc(metricShort(ui.metric))}</strong><small>${esc(metricName(metric))}</small></div><div><span>${tr("Лучший компьютер", "Best system")}</span><strong>${aggregate().top_system_rank ? `#${integer(aggregate().top_system_rank)}` : "N/A"}</strong><small>${esc(aggregate().top_system_name || tr("нет системы в снимке", "no system in snapshot"))}</small></div><div><span>${tr("Rmax страны", "Country Rmax")}</span><strong>${formatPerformance(aggregate().sum_rmax_tflops).value}</strong><small>${formatPerformance(aggregate().sum_rmax_tflops).unit}</small></div><div><span>Green500</span><strong>${integer(aggregate().green_efficiency_values_count)}</strong><small>${tr("числовых значений", "numeric values")}</small></div></div><footer><span>${tr("Источник", "Source")} <b>TOP500.org</b></span><button type="button" data-top-provenance="TOP500:${esc(selectedIso())}:2026:metric:${esc(ui.metric)}">${tr("Доказательство", "Evidence")} ↗</button></footer></aside></section>`;
  }

  function jumpNav() {
    const items = [
      ["topProfile", tr("Профиль", "Profile")],
      ["topAtlas", tr("Атлас", "Atlas")],
      ["topCountries", tr("Страны", "Countries")],
      ["topSystems", tr("Системы", "Systems")],
      ["topArchitecture", tr("Архитектура", "Architecture")],
      ["topGreen", "Green500"],
      ["topTrust", tr("Доверие", "Trust")],
    ];
    return `<nav class="top-jump" aria-label="${tr("Разделы TOP500", "TOP500 sections")}">${items.map(([id, label]) => `<button type="button" data-top-scroll="${id}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function benchmarkBar(label, value, maximum, tone = "") {
    const width = maximum > 0 && finite(value) ? clamp(Number(value) / maximum) * 100 : 0;
    return `<div class="top-benchmark-row ${tone}"><span>${esc(label)}</span><i><b style="width:${width.toFixed(2)}%"></b></i><strong>${finite(value) ? num(value, 2) : "—"}</strong></div>`;
  }

  function metricCard(item) {
    const formatted = formatMetric(item.metric_code, item.value, { compactMode: true });
    const max = Math.max(Number(item.world?.maximum || 0), Number(item.value || 0), 1);
    const percentile = Number(item.percentile_gir || 0);
    return `<article class="top-metric-card ${ui.metric === item.metric_code ? "active" : ""}" data-top-metric="${esc(item.metric_code)}" role="button" tabindex="0"><header><span>${String(item.ordinal).padStart(2, "0")} · ${esc(item.metric_code)}</span><mark>${item.available ? `${share(percentile, 0)} GIR` : "N/A"}</mark></header><div class="top-metric-glyph">${metricGlyph(item.metric_code)}</div><h3>${esc(metricName(item))}</h3><div class="top-metric-value"><strong>${esc(formatted.value)}</strong><small>${esc(formatted.unit)}</small></div><div class="top-metric-benchmarks">${benchmarkBar(tr("Страна", "Country"), item.value, max, "country")}${benchmarkBar(tr("Мир · медиана", "World median"), item.world?.median, max)}${benchmarkBar(tr("Регион · среднее", "Region mean"), item.region?.mean, max)}${benchmarkBar("Top‑10 · mean", item.top10?.mean, max)}</div><footer><span>${item.gir_navigation_order ? `${tr("GIR-порядок", "GIR order")} #${integer(item.gir_navigation_order)}*` : tr("нет навигационного порядка", "no navigation order")}</span><button type="button" data-top-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></footer></article>`;
  }

  function normalizedRadar() {
    const profiles = payload?.metric_profiles || [];
    const points = profiles.map((item, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI / profiles.length);
      const radius = 105 * clamp(item.percentile_gir || 0);
      return [140 + Math.cos(angle) * radius, 140 + Math.sin(angle) * radius];
    });
    const grid = [0.25, 0.5, 0.75, 1].map((scale) => {
      const ring = profiles.map((_, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI / profiles.length);
        return `${(140 + Math.cos(angle) * 105 * scale).toFixed(1)},${(140 + Math.sin(angle) * 105 * scale).toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${ring}"/>`;
    }).join("");
    const axes = profiles.map((item, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI / profiles.length);
      const x = 140 + Math.cos(angle) * 105;
      const y = 140 + Math.sin(angle) * 105;
      const lx = 140 + Math.cos(angle) * 126;
      const ly = 140 + Math.sin(angle) * 126;
      return `<line x1="140" y1="140" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${esc(metricShort(item.metric_code))}</text>`;
    }).join("");
    return `<svg class="top-radar" viewBox="0 0 280 280" role="img" aria-label="${tr("Нормированный профиль страны по восьми метрикам", "Normalised country profile across eight metrics")}"><g class="grid">${grid}${axes}</g><polygon class="area" points="${points.map((point) => point.map((v) => v.toFixed(1)).join(",")).join(" ")}"/>${points.map((point, index) => `<circle class="p${index + 1}" cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" r="4"><title>${esc(metricShort(profiles[index].metric_code))}: ${share(profiles[index].percentile_gir, 0)}</title></circle>`).join("")}</svg>`;
  }

  function profileSection() {
    const available = (payload?.metric_profiles || []).filter((item) => finite(item.percentile_gir));
    const strongest = [...available].sort((a, b) => Number(b.percentile_gir) - Number(a.percentile_gir))[0];
    const constraint = [...available].sort((a, b) => Number(a.percentile_gir) - Number(b.percentile_gir))[0];
    return `<section class="top-section" id="topProfile">${sectionHeading("01", tr("Вычислительный профиль", "Compute fingerprint"), tr("Восемь физических линз вместо одного спорного балла", "Eight physical lenses instead of one disputable score"), tr("Мощность, количество систем, ядра и энергоэффективность сохраняют собственные единицы. Нормированный радар показывает только относительное положение GIR и не объединяет метрики в новый индекс.", "Performance, system count, cores and efficiency retain their own units. The normalised radar shows only relative GIR position and does not combine metrics into a new index."))}<div class="top-profile-layout"><article class="top-radar-card"><header><div><span>COMPUTE FINGERPRINT · GIR NORMALISED</span><h3>${flag(selectedCountry())} ${esc(countryName(selectedCountry()))}</h3></div><mark>8<small>${tr("линз", "lenses")}</small></mark></header>${normalizedRadar()}<footer><span>${tr("Сильная сторона", "Strongest lens")} <b>${esc(metricShort(strongest?.metric_code))}</b></span><span>${tr("Ограничение", "Constraint")} <b>${esc(metricShort(constraint?.metric_code))}</b></span></footer></article><aside class="top-diagnostic-card"><span>EXECUTIVE DIAGNOSTIC · GIR</span><h3>${tr("Масштаб, концентрация и технологическая глубина национального контура", "Scale, concentration and technological depth of the national compute layer")}</h3><article class="strong"><small>${tr("Лучший относительный профиль", "Best relative profile")}</small><strong>${esc(metricName(strongest))}</strong><b>${share(strongest?.percentile_gir, 0)}</b><p>${esc(lang() === "ru" ? strongest?.description_ru : strongest?.description_en)}</p></article><article class="constraint"><small>${tr("Наименьшее относительное значение", "Lowest relative profile")}</small><strong>${esc(metricName(constraint))}</strong><b>${share(constraint?.percentile_gir, 0)}</b><p>${esc(lang() === "ru" ? constraint?.description_ru : constraint?.description_en)}</p></article><footer><p>${tr("Процентили рассчитаны GIR только среди стран с доступным значением выбранной метрики.", "Percentiles are calculated by GIR only among countries with an available value for the selected metric.")}</p></footer></aside></div><div class="top-metric-grid">${(payload?.metric_profiles || []).map(metricCard).join("")}</div></section>`;
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
    if (!item?.represented_in_top500) return "not-represented";
    if (ui.mapMode === "representation") return "represented";
    if (!item?.selected_metric_available) return "metric-unavailable";
    const available = Number(payload?.country_catalogue?.available_for_selected_metric || 1);
    const order = Number(item.gir_navigation_order || available);
    const ratio = order / available;
    if (ratio <= 0.05) return "q6";
    if (ratio <= 0.15) return "q5";
    if (ratio <= 0.35) return "q4";
    if (ratio <= 0.60) return "q3";
    if (ratio <= 0.82) return "q2";
    return "q1";
  }

  function worldMap() {
    if (!geo?.features) return `<div class="top-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const byIso = new Map((payload?.countries || []).map((item) => [item.iso3, item]));
    const width = 1020, height = 455;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    return `<svg class="top-world-map" viewBox="0 0 ${width} ${height}" data-mode="${esc(ui.mapMode)}" role="group" aria-label="${tr("Карта национальной вычислительной инфраструктуры", "National computing infrastructure map")}">${features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = byIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const formatted = formatMetric(ui.metric, item?.selected_metric_value, { compactMode: true });
      const text = item?.selected_metric_available ? `${formatted.value} ${formatted.unit} · GIR #${integer(item.gir_navigation_order)}*` : tr("нет системы в текущем списке", "no system in the current list");
      return `<path class="top-map-country ${mapTone(item)}${iso3 === selectedIso() ? " selected" : ""}" d="${d}" data-top-country="${esc(iso3)}" tabindex="0" role="button" aria-label="${esc(name)} · ${esc(text)}"><title>${esc(name)} · ${esc(text)}</title></path>`;
    }).join("")}</svg>`;
  }

  function mapLegend() {
    if (ui.mapMode === "representation") return `<span class="represented"><i></i>${tr("есть система в списке", "system represented")}</span><span class="not-represented"><i></i>${tr("нет системы в снимке", "not represented in snapshot")}</span>`;
    return [
      ["q6", tr("верхние 5%", "top 5%")],
      ["q5", "5–15%"],
      ["q4", "15–35%"],
      ["q3", "35–60%"],
      ["q2", "60–82%"],
      ["q1", tr("нижние 18%", "bottom 18%")],
      ["metric-unavailable", tr("метрика не опубликована", "metric unavailable")],
      ["not-represented", tr("не представлена", "not represented")],
    ].map(([tone, label]) => `<span class="${tone}"><i></i>${esc(label)}</span>`).join("");
  }

  function concentrationPanel() {
    const c = payload?.atlas?.concentration || {};
    return `<article class="top-concentration-card"><header><span>RMAX CONCENTRATION · GIR</span><h3>${tr("Где сосредоточена мощность списка", "Where listed performance is concentrated")}</h3></header><div class="top-concentration-kpis"><div><small>TOP 1</small><strong>${percent(c.top1_share_pct, 1)}</strong></div><div><small>TOP 5</small><strong>${percent(c.top5_share_pct, 1)}</strong></div><div><small>TOP 10</small><strong>${percent(c.top10_share_pct, 1)}</strong></div><div><small>${tr("до 80%", "to 80%")}</small><strong>${integer(c.countries_to_80_pct)}</strong></div></div><div class="top-country-share-list">${(c.top_countries || []).slice(0, 8).map((item, index) => `<button type="button" data-top-country="${esc(item.iso3)}"><span>${String(index + 1).padStart(2, "0")}</span>${flag(item)}<div><strong>${esc(countryName(item))}</strong><i><b style="width:${clamp(Number(item.share_world_rmax_pct || 0) / Math.max(Number(c.top1_share_pct || 1), 1)) * 100}%"></b></i></div><em>${percent(item.share_world_rmax_pct, 1)}</em></button>`).join("")}</div><footer><p>${tr("Доли рассчитаны GIR из суммы официальных Rmax 500 систем текущей редакции.", "Shares are calculated by GIR from the sum of official Rmax values for the 500 systems in this edition.")}</p></footer></article>`;
  }

  function atlasSection() {
    const metric = selectedProfile();
    return `<section class="top-section" id="topAtlas">${sectionHeading("02", tr("Глобальный атлас HPC", "Global HPC atlas"), tr("47 стран представлены системами — 225 профилей сохраняют контекст", "47 countries have listed systems — 225 profiles preserve the context"), tr("Карта окрашивается только по одной выбранной метрике. Серые территории означают отсутствие системы в этом снимке TOP500, а не отсутствие вычислительной инфраструктуры страны.", "The map is coloured by one selected metric only. Grey territories mean no system is present in this TOP500 snapshot, not that the country lacks computing infrastructure."))}<div class="top-atlas-layout"><article class="top-map-card"><header><div><span>${tr("Слой карты", "Map layer")}</span><strong>${esc(metricName(metric))}</strong><small>${metric.available ? `${esc(countryName(selectedCountry()))} · ${formatMetric(ui.metric, metric.value).value} ${formatMetric(ui.metric, metric.value).unit}` : `${esc(countryName(selectedCountry()))} · N/A`}</small></div><div class="top-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode === "value" ? "active" : ""}" data-top-map-mode="value">${tr("Значение", "Value")}</button><button type="button" class="${ui.mapMode === "representation" ? "active" : ""}" data-top-map-mode="representation">${tr("Представленность", "Representation")}</button></div></header><div class="top-map-stage">${worldMap()}</div><div class="top-map-legend">${mapLegend()}</div></article>${concentrationPanel()}</div><div class="top-region-ribbon">${(payload?.atlas?.regional_landscape || []).map((item, index) => `<button type="button" data-top-country="${esc(item.leader?.iso3 || "")}"><span>${String(index + 1).padStart(2, "0")}</span><div><small>${esc(item.region)}</small><strong>${integer(item.represented_countries)} ${tr("стран", "countries")}</strong></div>${flag(item.leader)}<em>${formatMetric(ui.metric, item.leader?.value, { compactMode: true }).value}</em></button>`).join("")}</div></section>`;
  }

  function filteredCountries() {
    const query = ui.countryQuery.trim().toLowerCase();
    return (payload?.countries || []).filter((item) => {
      if (query && !`${item.iso3} ${item.name_ru} ${item.name_en}`.toLowerCase().includes(query)) return false;
      if (ui.countryRegion !== "all" && item.region !== ui.countryRegion) return false;
      if (ui.countryStatus === "represented" && !item.represented_in_top500) return false;
      if (ui.countryStatus === "not-represented" && item.represented_in_top500) return false;
      if (ui.countryStatus === "available" && !item.selected_metric_available) return false;
      return true;
    });
  }

  function selectOptions(values, selected, allLabel) {
    return `<option value="all">${esc(allLabel)}</option>${values.map((value) => `<option value="${esc(value)}" ${selected === value ? "selected" : ""}>${esc(value)}</option>`).join("")}`;
  }

  function countryRows(items) {
    return items.map((item) => {
      const formatted = formatMetric(ui.metric, item.selected_metric_value);
      return `<tr class="${item.iso3 === selectedIso() ? "selected" : ""}"><td><span class="top-order-cell">${item.gir_navigation_order ? `#${integer(item.gir_navigation_order)}*` : "—"}<small>${tr("неофиц.", "unofficial")}</small></span></td><td><button type="button" class="top-country-cell" data-top-country="${esc(item.iso3)}">${flag(item)}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)} · ${esc(item.region || "")}</small></span></button></td><td><strong>${esc(formatted.value)}</strong><small>${esc(formatted.unit)}</small></td><td><span class="top-mini-metric"><b>${integer(item.systems_count)}</b><small>${tr("систем", "systems")}</small></span></td><td><span class="top-mini-metric"><b>${item.top_system_rank ? `#${integer(item.top_system_rank)}` : "—"}</b><small>${esc(item.top_system_name || tr("нет в списке", "not listed"))}</small></span></td><td><span class="top-mini-metric"><b>${item.green_efficiency_values_count ? integer(item.green_efficiency_values_count) : "—"}</b><small>Green500</small></span></td><td><button type="button" class="top-row-open" data-top-country="${esc(item.iso3)}" aria-label="${tr("Открыть страну", "Open country")}">↗</button></td></tr>`;
    }).join("");
  }

  function countriesSection() {
    const filtered = filteredCountries();
    const pages = Math.max(1, Math.ceil(filtered.length / ui.countryPageSize));
    ui.countryPage = Math.min(ui.countryPage, pages);
    const start = (ui.countryPage - 1) * ui.countryPageSize;
    const visible = filtered.slice(start, start + ui.countryPageSize);
    const regions = [...new Set((payload?.countries || []).map((item) => item.region).filter(Boolean))].sort();
    return `<section class="top-section" id="topCountries">${sectionHeading("03", tr("Страновые агрегаты", "Country aggregates"), tr("Навигационный порядок только по выбранной линзе", "Navigation order for the selected lens only"), tr("Каждая строка — воспроизводимая агрегация официальных систем. Пустое официальное место страны сохраняется намеренно: TOP500.org ранжирует компьютеры, а не государства.", "Each row is a reproducible aggregation of official systems. The official country-rank field remains intentionally empty: TOP500.org ranks computers, not states."))}<div class="top-directory-card"><div class="top-directory-controls"><label>${icon("network")}<input id="topCountrySearch" type="search" value="${esc(ui.countryQuery)}" placeholder="${tr("Страна или ISO3", "Country or ISO3")}"></label><label><span>${tr("Регион", "Region")}</span><select id="topCountryRegion">${selectOptions(regions, ui.countryRegion, tr("Все регионы", "All regions"))}</select></label><label><span>${tr("Статус", "Status")}</span><select id="topCountryStatus"><option value="represented" ${ui.countryStatus === "represented" ? "selected" : ""}>${tr("Есть система", "Represented")}</option><option value="available" ${ui.countryStatus === "available" ? "selected" : ""}>${tr("Есть значение линзы", "Lens available")}</option><option value="not-represented" ${ui.countryStatus === "not-represented" ? "selected" : ""}>${tr("Нет системы в снимке", "Not represented")}</option><option value="all" ${ui.countryStatus === "all" ? "selected" : ""}>${tr("Все 225", "All 225")}</option></select></label><a class="top-button" href="/api/top500/workspace.csv?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&metric=${encodeURIComponent(ui.metric)}&lang=${lang()}" download>${icon("download")} CSV</a></div><div class="top-directory-meta"><span><b>${integer(filtered.length)}</b> / ${integer(payload?.countries?.length)} ${tr("профилей", "profiles")}</span><p><i></i>${esc(metricShort(ui.metric))} · ${tr("GIR-порядок не является официальным местом", "GIR order is not an official rank")}</p></div><div class="top-country-table-wrap"><table class="top-country-table"><thead><tr><th>${tr("Порядок GIR", "GIR order")}</th><th>${tr("Страна", "Country")}</th><th>${esc(metricShort(ui.metric))}</th><th>${tr("Системы", "Systems")}</th><th>${tr("Лучшая система", "Best system")}</th><th>Green500</th><th></th></tr></thead><tbody>${countryRows(visible) || `<tr><td colspan="7" class="top-empty">${tr("Совпадений не найдено", "No matches found")}</td></tr>`}</tbody></table></div><footer class="top-pagination"><span>${filtered.length ? `${integer(start + 1)}–${integer(Math.min(start + ui.countryPageSize, filtered.length))}` : "0"} / ${integer(filtered.length)}</span><div><button type="button" data-top-country-page="${ui.countryPage - 1}" ${ui.countryPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${integer(ui.countryPage)} / ${integer(pages)}</b><button type="button" data-top-country-page="${ui.countryPage + 1}" ${ui.countryPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer></div></section>`;
  }

  function systemPower(item) {
    const perf = formatPerformance(item.rmax_tflops);
    return `<span class="top-system-power"><strong>${perf.value}</strong><small>${perf.unit} Rmax</small></span>`;
  }

  function selectedSystemCards() {
    const items = payload?.selected_country_systems?.top500 || [];
    if (!items.length) return `<div class="top-no-systems"><span>0 / 500</span><h3>${tr("В текущем снимке нет системы этой страны", "No system from this country appears in the current snapshot")}</h3><p>${tr("Это не означает нулевую национальную вычислительную мощность: список охватывает только опубликованные позиции TOP500.", "This does not imply zero national computing capacity: the list covers only published TOP500 entries.")}</p></div>`;
    return `<div class="top-selected-system-grid">${items.map((item, index) => `<button type="button" class="top-selected-system" data-top-system="${esc(item.system_id)}"><header><span>${String(index + 1).padStart(2, "0")}</span><mark>TOP500 #${integer(item.official_rank)}</mark></header><div class="top-rack-glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><b style="height:${Math.max(12, 84 - index * 9)}%"></b></div><h3>${esc(item.name || item.system_model || `System ${item.system_id}`)}</h3><p>${esc(item.site)}</p><div>${systemPower(item)}<span><strong>${compact(item.total_cores, 1)}</strong><small>${tr("ядер", "cores")}</small></span></div><footer><span>${esc(item.manufacturer)}</span><em>${item.official_green_rank ? `Green #${integer(item.official_green_rank)}` : "Green N/A"}</em></footer></button>`).join("")}</div>`;
  }

  function globalLeaderRail() {
    return `<div class="top-leader-rail">${(payload?.systems?.leaders || []).map((item) => `<button type="button" data-top-system="${esc(item.system_id)}"><span>#${integer(item.official_rank)}</span>${flag(item)}<div><strong>${esc(item.name || item.system_model)}</strong><small>${esc(countryName(item))} · ${esc(item.manufacturer)}</small></div>${systemPower(item)}</button>`).join("")}</div>`;
  }

  function filteredSystems() {
    const source = ui.systemList === "TOP500" ? (payload?.systems?.top500 || []) : (payload?.systems?.green500 || []);
    const query = ui.systemQuery.trim().toLowerCase();
    return source.filter((item) => {
      if (query && !`${item.system_id} ${item.name || ""} ${item.site || ""} ${item.manufacturer || ""} ${item.computer || ""}`.toLowerCase().includes(query)) return false;
      if (ui.systemCountry !== "all" && item.iso3 !== ui.systemCountry) return false;
      if (ui.systemManufacturer !== "all" && item.manufacturer !== ui.systemManufacturer) return false;
      if (ui.systemSegment !== "all" && item.segment !== ui.systemSegment) return false;
      return true;
    });
  }

  function systemRows(items) {
    return items.map((item) => {
      const topList = ui.systemList === "TOP500";
      const rank = topList ? item.official_rank : item.official_green_rank;
      const performance = formatPerformance(item.rmax_tflops);
      const efficiency = topList ? item.green_efficiency_gflops_w : item.energy_efficiency_gflops_w;
      return `<tr><td><span class="top-system-rank"><b>#${integer(rank)}</b><small>${topList ? "TOP500" : "GREEN500"}</small></span></td><td><button type="button" class="top-system-cell" data-top-system="${esc(item.system_id)}"><span class="top-system-id">${esc(item.system_id)}</span><div><strong>${esc(item.name || item.system_model || tr("Без отдельного имени", "No distinct name"))}</strong><small>${esc(item.site)}</small></div></button></td><td><span class="top-country-inline">${flag(item)}<b>${esc(countryName(item))}</b></span></td><td><strong>${performance.value}</strong><small>${performance.unit}</small></td><td><span class="top-tech-cell"><b>${esc(item.manufacturer || "—")}</b><small>${esc(item.accelerator || item.processor_technology || "—")}</small></span></td><td><span class="top-tech-cell"><b>${finite(efficiency) ? num(efficiency, 2) : "N/A"}</b><small>GFlops/W</small></span></td><td><button type="button" class="top-row-open" data-top-system="${esc(item.system_id)}" aria-label="${tr("Открыть систему", "Open system")}">↗</button></td></tr>`;
    }).join("");
  }

  function systemsRegistry() {
    const filtered = filteredSystems();
    const pages = Math.max(1, Math.ceil(filtered.length / ui.systemPageSize));
    ui.systemPage = Math.min(ui.systemPage, pages);
    const start = (ui.systemPage - 1) * ui.systemPageSize;
    const visible = filtered.slice(start, start + ui.systemPageSize);
    const source = ui.systemList === "TOP500" ? (payload?.systems?.top500 || []) : (payload?.systems?.green500 || []);
    const countries = [...new Set(source.map((item) => item.iso3).filter(Boolean))].sort();
    const countryLabels = Object.fromEntries((payload?.countries || []).map((item) => [item.iso3, countryName(item)]));
    const manufacturers = [...new Set(source.map((item) => item.manufacturer).filter(Boolean))].sort();
    const segments = [...new Set(source.map((item) => item.segment).filter(Boolean))].sort();
    const countryOptions = `<option value="all">${tr("Все страны", "All countries")}</option>${countries.map((value) => `<option value="${esc(value)}" ${ui.systemCountry === value ? "selected" : ""}>${esc(countryLabels[value] || value)}</option>`).join("")}`;
    return `<div class="top-system-registry"><header><div class="top-list-toggle" role="group" aria-label="${tr("Официальный список", "Official list")}"><button type="button" class="${ui.systemList === "TOP500" ? "active" : ""}" data-top-list="TOP500">TOP500</button><button type="button" class="${ui.systemList === "GREEN500" ? "active" : ""}" data-top-list="GREEN500">Green500</button></div><span>${tr("Официальные системные места", "Official system ranks")} · ${esc(payload?.edition)}</span></header><div class="top-system-controls"><label>${icon("server")}<input id="topSystemSearch" type="search" value="${esc(ui.systemQuery)}" placeholder="${tr("Система, площадка, производитель", "System, site, manufacturer")}"></label><select id="topSystemCountry">${countryOptions}</select><select id="topSystemManufacturer">${selectOptions(manufacturers, ui.systemManufacturer, tr("Все производители", "All manufacturers"))}</select><select id="topSystemSegment">${selectOptions(segments, ui.systemSegment, tr("Все сегменты", "All segments"))}</select></div><div class="top-system-table-wrap"><table class="top-system-table"><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Система", "System")}</th><th>${tr("Страна", "Country")}</th><th>Rmax</th><th>${tr("Платформа", "Platform")}</th><th>${tr("Эффективность", "Efficiency")}</th><th></th></tr></thead><tbody>${systemRows(visible) || `<tr><td colspan="7" class="top-empty">${tr("Совпадений не найдено", "No matches found")}</td></tr>`}</tbody></table></div><footer class="top-pagination"><span>${filtered.length ? `${integer(start + 1)}–${integer(Math.min(start + ui.systemPageSize, filtered.length))}` : "0"} / ${integer(filtered.length)}</span><div><button type="button" data-top-system-page="${ui.systemPage - 1}" ${ui.systemPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${integer(ui.systemPage)} / ${integer(pages)}</b><button type="button" data-top-system-page="${ui.systemPage + 1}" ${ui.systemPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer></div>`;
  }

  function systemsSection() {
    return `<section class="top-section" id="topSystems">${sectionHeading("04", tr("Системный реестр", "System registry"), tr("Официальные места принадлежат машинам", "Official ranks belong to machines"), tr("Сначала — национальный стек выбранной страны, затем полный официальный реестр. TOP500 и Green500 сохраняются раздельно и связываются только по System ID.", "First comes the selected country's national stack, followed by the complete official roster. TOP500 and Green500 remain separate and are linked only by System ID."))}<div class="top-subhead"><span>${flag(selectedCountry())} ${esc(countryName(selectedCountry()))}</span><h3>${tr("Национальная вычислительная система", "National compute stack")}</h3><p>${integer(payload?.selected_country_systems?.top500_count)} / 500</p></div>${selectedSystemCards()}<div class="top-subhead global"><span>GLOBAL PERFORMANCE SPINE</span><h3>${tr("Десять наиболее производительных систем", "Ten highest-performance systems")}</h3><p>HPL · Rmax</p></div>${globalLeaderRail()}${systemsRegistry()}</section>`;
  }

  function facetLabels() {
    return {
      manufacturers: tr("Производители", "Manufacturers"),
      processor_technologies: tr("Процессорные технологии", "Processor technologies"),
      accelerators: tr("Ускорители", "Accelerators"),
      interconnect_families: tr("Интерконнекты", "Interconnects"),
      os_families: tr("ОС", "Operating systems"),
      segments: tr("Сегменты", "Segments"),
    };
  }

  function facetBars(items) {
    const max = Math.max(...(items || []).map((item) => Number(item.count || 0)), 1);
    return (items || []).map((item, index) => `<article class="top-facet-row"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(item.label)}</strong><i><b style="width:${clamp(Number(item.count || 0) / max) * 100}%"></b></i><small>${share(item.rmax_share, 1)} Rmax</small></div><em>${integer(item.count)}</em></article>`).join("");
  }

  function siliconStack() {
    const scope = ui.architectureScope === "global" ? payload?.architecture?.global : payload?.architecture?.selected_country;
    const facets = facetLabels();
    const facet = scope?.[ui.architectureFacet] || [];
    return `<article class="top-silicon-card"><header><div><span>SILICON & FABRIC · ${ui.architectureScope.toUpperCase()}</span><h3>${esc(facets[ui.architectureFacet])}</h3></div><mark>${integer(scope?.systems)}<small>${tr("систем", "systems")}</small></mark></header><div class="top-silicon-visual" aria-hidden="true"><div class="chip"><i></i><i></i><i></i><i></i><b>HPC</b></div><div class="fabric f1"></div><div class="fabric f2"></div><div class="fabric f3"></div><span class="rack a"></span><span class="rack b"></span><span class="rack c"></span></div><footer><div><span>${tr("С ускорителем", "Accelerated")}</span><strong>${share(scope?.accelerated_share, 0)}</strong></div><div><span>${tr("Систем", "Systems")}</span><strong>${integer(scope?.systems)}</strong></div></footer><p>${tr("Категории отображают опубликованные поля систем, а не оценку технологического качества.", "Categories display published system fields, not a judgement of technological quality.")}</p></article><article class="top-facet-card"><header><div class="top-scope-toggle"><button type="button" class="${ui.architectureScope === "global" ? "active" : ""}" data-top-architecture-scope="global">${tr("Мир", "World")}</button><button type="button" class="${ui.architectureScope === "selected" ? "active" : ""}" data-top-architecture-scope="selected">${esc(selectedIso())}</button></div><div class="top-facet-tabs">${Object.entries(facets).map(([key, label]) => `<button type="button" class="${ui.architectureFacet === key ? "active" : ""}" data-top-architecture-facet="${esc(key)}">${esc(label)}</button>`).join("")}</div></header><div class="top-facet-list">${facetBars(facet) || `<div class="top-empty">${tr("Нет систем для выбранного профиля", "No systems for the selected profile")}</div>`}</div></article>`;
  }

  function architectureSection() {
    return `<section class="top-section" id="topArchitecture">${sectionHeading("05", tr("Архитектурный ландшафт", "Architecture landscape"), tr("Кто собирает машины — и из каких технологических слоёв", "Who builds the machines — and which technology layers they use"), tr("Производители, процессоры, ускорители, интерконнекты, операционные системы и сегменты анализируются как отдельные опубликованные признаки. Доля Rmax помогает отличить массовое присутствие от концентрации мощности.", "Manufacturers, processors, accelerators, interconnects, operating systems and segments are analysed as separate published fields. Rmax share distinguishes broad presence from concentrated performance."))}<div class="top-architecture-layout">${siliconStack()}</div></section>`;
  }

  function frontierScatter() {
    const items = payload?.systems?.efficiency_frontier || [];
    if (!items.length) return "";
    const values = items.filter((item) => finite(item.rmax_tflops) && finite(item.energy_efficiency_gflops_w));
    const width = 900, height = 350, pad = { l: 72, r: 28, t: 28, b: 52 };
    const logs = values.map((item) => Math.log10(Number(item.rmax_tflops)));
    const effs = values.map((item) => Number(item.energy_efficiency_gflops_w));
    const xmin = Math.min(...logs), xmax = Math.max(...logs), ymin = 0, ymax = Math.max(...effs) * 1.08;
    const x = (value) => pad.l + ((Math.log10(Number(value)) - xmin) / Math.max(0.0001, xmax - xmin)) * (width - pad.l - pad.r);
    const y = (value) => height - pad.b - ((Number(value) - ymin) / Math.max(0.0001, ymax - ymin)) * (height - pad.t - pad.b);
    const xTicks = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000].filter((value) => Math.log10(value) >= xmin && Math.log10(value) <= xmax);
    const yTicks = [0, 15, 30, 45, 60, 75].filter((value) => value <= ymax);
    return `<svg class="top-frontier-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Соотношение Rmax и энергоэффективности Green500", "Rmax and Green500 energy-efficiency relationship")}"><g class="grid">${xTicks.map((value) => `<line x1="${x(value)}" y1="${pad.t}" x2="${x(value)}" y2="${height - pad.b}"/><text x="${x(value)}" y="${height - 18}" text-anchor="middle">${formatPerformance(value).value}${formatPerformance(value).unit[0]}</text>`).join("")}${yTicks.map((value) => `<line x1="${pad.l}" y1="${y(value)}" x2="${width - pad.r}" y2="${y(value)}"/><text x="${pad.l - 12}" y="${y(value) + 4}" text-anchor="end">${value}</text>`).join("")}</g><g class="points">${values.map((item) => `<circle class="${item.iso3 === selectedIso() ? "selected" : ""}" cx="${x(item.rmax_tflops).toFixed(1)}" cy="${y(item.energy_efficiency_gflops_w).toFixed(1)}" r="${item.official_green_rank <= 10 ? 5 : 2.8}" data-top-system="${esc(item.system_id)}" tabindex="0" role="button"><title>#${integer(item.official_green_rank)} ${esc(item.name || item.system_model)} · ${num(item.energy_efficiency_gflops_w, 2)} GFlops/W · ${formatPerformance(item.rmax_tflops).value} ${formatPerformance(item.rmax_tflops).unit}</title></circle>`).join("")}</g><text class="axis-label x" x="${(pad.l + width - pad.r) / 2}" y="${height - 2}" text-anchor="middle">Rmax · log scale</text><text class="axis-label y" x="12" y="${height / 2}" text-anchor="middle" transform="rotate(-90 12 ${height / 2})">GFlops/W</text></svg>`;
  }

  function greenLeaderCards() {
    return `<div class="top-green-leaders">${(payload?.systems?.green_leaders || []).slice(0, 6).map((item) => `<button type="button" data-top-system="${esc(item.system_id)}"><header><span>GREEN #${integer(item.official_green_rank)}</span>${flag(item)}</header><h3>${esc(item.name || item.system_model)}</h3><p>${esc(countryName(item))} · ${esc(item.manufacturer)}</p><strong>${num(item.energy_efficiency_gflops_w, 2)}<small>GFlops/W</small></strong><footer><span>TOP500 #${integer(item.top500_rank_reported)}</span><em>${formatPerformance(item.rmax_tflops).value} ${formatPerformance(item.rmax_tflops).unit}</em></footer></button>`).join("")}</div>`;
  }

  function greenSection() {
    const distribution = payload?.systems?.distribution || {};
    const selectedGreen = payload?.selected_country_systems?.green500 || [];
    const measuredSelected = selectedGreen.filter((item) => finite(item.energy_efficiency_gflops_w));
    return `<section class="top-section" id="topGreen">${sectionHeading("06", tr("Контур Green500", "Green500 layer"), tr("Энергоэффективность — отдельная ось, не поправка к мощности", "Energy efficiency is a separate axis, not a performance adjustment"), tr("Green500 ранжирует системы по HPL-производительности на ватт. Числовая эффективность опубликована для 205 строк; остальные 295 значений остаются официальными пропусками.", "Green500 ranks systems by HPL performance per watt. Numeric efficiency is published for 205 rows; the other 295 values remain official missing values."))}<div class="top-green-status"><article><span>${tr("Опубликовано", "Reported")}</span><strong>${integer(distribution.green_numeric_values)}</strong><small>/ 500</small><i><b style="width:${clamp(Number(distribution.green_numeric_values || 0) / 500) * 100}%"></b></i></article><article><span>${tr("Официальный пропуск", "Official missing")}</span><strong>${integer(distribution.green_missing_values)}</strong><small>/ 500</small><i><b style="width:${clamp(Number(distribution.green_missing_values || 0) / 500) * 100}%"></b></i></article><article><span>${esc(selectedIso())}</span><strong>${integer(measuredSelected.length)}</strong><small>${tr("числовых значений", "numeric values")}</small><p>${measuredSelected.length ? `${tr("Лучшая эффективность", "Best efficiency")} ${num(Math.max(...measuredSelected.map((item) => Number(item.energy_efficiency_gflops_w))), 2)}` : tr("Пропуски не заменяются нулями", "Missing values are not replaced by zero")}</p></article></div>${greenLeaderCards()}<article class="top-frontier-card"><header><div><span>EFFICIENCY FRONTIER · 205 REPORTED VALUES</span><h3>${tr("Мощность и эффективность существуют одновременно", "Performance and efficiency coexist")}</h3></div><mark>${integer(distribution.exascale_systems)}<small>${tr("экзафлопсных систем", "exascale systems")}</small></mark></header>${frontierScatter()}<footer><span>${tr("Ось X логарифмическая", "X-axis is logarithmic")}</span><p>${tr("Точки используют только опубликованные значения Green500. Клик открывает официальный профиль системы.", "Points use reported Green500 values only. Select a point to open the official system profile.")}</p></footer></article></section>`;
  }

  function sourceCard(release) {
    return `<article class="top-source-card"><header><span>${esc(release.list_code)}</span><mark>${release.official_system_ranking ? tr("официальный системный рейтинг", "official system ranking") : ""}</mark></header><h3>${esc(release.edition_label)}</h3><div><span>${tr("Строк", "Rows")} <b>${integer(release.systems_count)}</b></span><span>${tr("Стран", "Countries")} <b>${integer(release.represented_countries)}</b></span><span>${tr("SHA‑256", "SHA‑256")} <b>${esc(String(release.raw_snapshot_sha256 || "").slice(0, 18))}…</b></span></div><a href="${esc(release.source_url)}" target="_blank" rel="noopener noreferrer">${tr("Открыть официальный источник", "Open official source")} ↗</a></article>`;
  }

  function auditDiagram() {
    const audit = payload?.audit?.audit || {};
    const events = payload?.audit?.events || [];
    return `<article class="top-audit-card"><header><span>CROSS-LIST AUDIT · SYSTEM ID</span><h3>${tr("Два списка соединяются идентификатором, не местом", "The two lists are joined by identifier, not rank")}</h3></header><div class="top-audit-diagram"><div class="list top"><span>TOP500</span><strong>500</strong><small>${tr("официальных строк", "official rows")}</small></div><div class="bridge"><i></i><strong>${integer(audit.common_system_ids)}</strong><span>System ID</span><small>${tr("общих систем", "common systems")}</small></div><div class="list green"><span>GREEN500</span><strong>500</strong><small>${tr("официальных строк", "official rows")}</small></div></div><div class="top-audit-kpis"><div><span>TOP500 only</span><strong>${integer(audit.top500_only_system_ids)}</strong></div><div><span>Green500 only</span><strong>${integer(audit.green500_only_system_ids)}</strong></div><div><span>${tr("Различия мест", "Rank differences")}</span><strong>${integer(audit.system_id_linked_rank_disagreements)}</strong></div><div><span>${tr("Ошибки join по месту", "Rank-join mismatches")}</span><strong>${integer(audit.rank_join_identity_mismatches)}</strong></div></div><ol>${events.map((event) => `<li><b>${esc(event.event_type)}</b><span>${esc(event.resolution)}</span><em>${event.system_id ? `ID ${esc(event.system_id)}` : tr("методологическое событие", "methodological event")}</em></li>`).join("")}</ol></article>`;
  }

  function trustSection() {
    return `<section class="top-section" id="topTrust">${sectionHeading("07", tr("Методология и доверие", "Methodology and trust"), tr("Официальная система, производный агрегат и навигационный порядок — разные статусы", "Official system, derived aggregate and navigation order are distinct statuses"), tr("Платформа сохраняет два официальных снимка, связывает их по System ID и документирует каждую агрегацию страны. Отсутствующие значения Green500 не восстанавливаются.", "The platform preserves two official snapshots, links them by System ID and documents every country aggregation. Missing Green500 values are not reconstructed."))}<div class="top-trust-layout">${auditDiagram()}<div class="top-source-stack">${(payload?.releases || []).map(sourceCard).join("")}<article class="top-principles-card"><header><span>SCIENTIFIC CONTRACT</span><h3>${tr("Четыре инварианта модуля", "Four module invariants")}</h3></header><ol><li><b>01</b><span>${tr("Официальное место существует только для системы", "Official rank exists only for a system")}</span></li><li><b>02</b><span>${tr("Страновой агрегат всегда отмечен как расчёт GIR", "A country aggregate is always labelled as a GIR computation")}</span></li><li><b>03</b><span>${tr("Восемь физических метрик не смешиваются в composite", "Eight physical metrics are never mixed into a composite")}</span></li><li><b>04</b><span>${tr("Отсутствие в списке не означает нулевую мощность страны", "Absence from the list does not mean zero national capacity")}</span></li></ol><button type="button" class="top-button primary" data-top-provenance="TOP500:${esc(selectedIso())}:2026:metric:${esc(ui.metric)}">${tr("Проверить выбранное значение", "Inspect selected value")}</button></article></div></div><div class="top-series-complete"><span>GROUP COMPLETE · DIGITALISATION, AI & COMPUTE</span><h3>${tr("Семь модулей направления опубликованы как единая исследовательская линия", "Seven modules now form one complete research line")}</h3><p>${tr("NRI, EGDI, GCI, Government AI Readiness, IMF AIPI, Cloudflare IQI и TOP500/Green500 закрывают цифровую готовность, электронное государство, кибербезопасность, ИИ, качество интернета и вычислительные мощности.", "NRI, EGDI, GCI, Government AI Readiness, IMF AIPI, Cloudflare IQI and TOP500/Green500 cover digital readiness, e-government, cybersecurity, AI, internet quality and computing capacity.")}</p></div></section>`;
  }

  function systemDrawer() {
    if (!ui.selectedSystemId) return "";
    const top = (payload?.systems?.top500 || []).find((item) => String(item.system_id) === String(ui.selectedSystemId));
    const green = (payload?.systems?.green500 || []).find((item) => String(item.system_id) === String(ui.selectedSystemId));
    const base = top || green;
    if (!base) return "";
    const topRank = top?.official_rank;
    const greenRank = green?.official_green_rank || top?.official_green_rank;
    const efficiency = green?.energy_efficiency_gflops_w ?? top?.green_efficiency_gflops_w;
    const performance = formatPerformance(base.rmax_tflops);
    return `<div class="top-system-drawer-backdrop" data-top-close-drawer></div><aside class="top-system-drawer" aria-modal="true" role="dialog" aria-label="${tr("Профиль суперкомпьютерной системы", "Supercomputer system profile")}"><header><div><span>SYSTEM ID · ${esc(base.system_id)}</span><h2>${esc(base.name || base.system_model || `System ${base.system_id}`)}</h2><p>${flag(base)} ${esc(countryName(base))} · ${esc(base.site || "")}</p></div><button type="button" data-top-close-drawer aria-label="${tr("Закрыть", "Close")}">×</button></header><div class="top-drawer-ranks"><article><span>TOP500</span><strong>${topRank ? `#${integer(topRank)}` : "N/A"}</strong><small>${tr("официальное место", "official rank")}</small></article><article><span>GREEN500</span><strong>${greenRank ? `#${integer(greenRank)}` : "N/A"}</strong><small>${tr("официальное место", "official rank")}</small></article><article><span>Rmax</span><strong>${performance.value}</strong><small>${performance.unit}</small></article><article><span>Efficiency</span><strong>${finite(efficiency) ? num(efficiency, 2) : "N/A"}</strong><small>GFlops/W</small></article></div><div class="top-drawer-grid"><div><span>${tr("Производитель", "Manufacturer")}</span><b>${esc(base.manufacturer || "—")}</b></div><div><span>${tr("Модель", "Model")}</span><b>${esc(base.system_model || "—")}</b></div><div><span>${tr("Процессор", "Processor")}</span><b>${esc(base.processor || "—")}</b></div><div><span>${tr("Ускоритель", "Accelerator")}</span><b>${esc(base.accelerator || "—")}</b></div><div><span>${tr("Интерконнект", "Interconnect")}</span><b>${esc(base.interconnect || "—")}</b></div><div><span>${tr("Операционная система", "Operating system")}</span><b>${esc(base.operating_system || "—")}</b></div><div><span>${tr("Ядра", "Cores")}</span><b>${integer(base.total_cores)}</b></div><div><span>${tr("Мощность", "Power")}</span><b>${finite(base.power_kw) ? `${num(base.power_kw, 1)} kW` : "N/A"}</b></div><div><span>Rpeak</span><b>${formatPerformance(base.rpeak_tflops).value} ${formatPerformance(base.rpeak_tflops).unit}</b></div><div><span>${tr("Год", "Year")}</span><b>${integer(base.system_year)}</b></div></div><article class="top-drawer-computer"><span>${tr("Официальное описание конфигурации", "Official configuration description")}</span><p>${esc(base.computer || "")}</p></article><footer><span>${top && green ? tr("Списки связаны по System ID", "Lists linked by System ID") : tr("Строка присутствует только в одном списке", "Row appears in one list only")}</span><a href="${esc(top ? payload?.source?.top500_url : payload?.source?.green500_url)}" target="_blank" rel="noopener noreferrer">${tr("Открыть официальный список", "Open official list")} ↗</a></footer></aside>`;
  }

  function fullMarkup() {
    return `<div class="top-workspace">${hero()}${jumpNav()}${profileSection()}${atlasSection()}${countriesSection()}${systemsSection()}${architectureSection()}${greenSection()}${trustSection()}${systemDrawer()}</div>`;
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

  function activateSystem(systemId) {
    if (!systemId) return;
    ui.selectedSystemId = String(systemId);
    preserveScroll(renderReady);
    window.requestAnimationFrame(() => context?.root?.querySelector(".top-system-drawer [data-top-close-drawer]")?.focus());
  }

  function closeSystem() {
    ui.selectedSystemId = null;
    preserveScroll(renderReady);
  }

  function bind() {
    const root = context?.root;
    if (!root) return;
    root.querySelectorAll("[data-top-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.topScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-top-country]").forEach((element) => {
      const activate = () => selectCountry(element.dataset.topCountry);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-top-system]").forEach((element) => {
      const activate = () => activateSystem(element.dataset.topSystem);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-top-close-drawer]").forEach((element) => element.addEventListener("click", closeSystem));
    root.querySelectorAll("[data-top-provenance]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      const valueId = button.dataset.topProvenance;
      if (valueId) context?.openProvenance?.(valueId);
    }));
    root.querySelectorAll("[data-top-metric]").forEach((element) => {
      const activate = () => {
        const code = element.dataset.topMetric;
        if (!code || code === ui.metric) return;
        ui.metric = code;
        ui.countryPage = 1;
        render(context);
      };
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-top-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.topMapMode; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-top-country-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.countryPage = Number(button.dataset.topCountryPage || 1); preserveScroll(renderReady); document.getElementById("topCountries")?.scrollIntoView({ block: "start" }); }));
    root.querySelectorAll("[data-top-system-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.systemPage = Number(button.dataset.topSystemPage || 1); preserveScroll(renderReady); document.querySelector(".top-system-registry")?.scrollIntoView({ block: "start" }); }));
    root.querySelectorAll("[data-top-list]").forEach((button) => button.addEventListener("click", () => { ui.systemList = button.dataset.topList; ui.systemPage = 1; ui.systemCountry = "all"; ui.systemManufacturer = "all"; ui.systemSegment = "all"; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-top-architecture-scope]").forEach((button) => button.addEventListener("click", () => { ui.architectureScope = button.dataset.topArchitectureScope; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-top-architecture-facet]").forEach((button) => button.addEventListener("click", () => { ui.architectureFacet = button.dataset.topArchitectureFacet; preserveScroll(renderReady); }));
    root.querySelector("[data-top-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });

    const countrySearch = root.querySelector("#topCountrySearch");
    countrySearch?.addEventListener("input", () => {
      ui.countryQuery = countrySearch.value;
      ui.countryPage = 1;
      window.clearTimeout(countrySearch._topTimer);
      countrySearch._topTimer = window.setTimeout(() => preserveScroll(renderReady, "#topCountrySearch"), 80);
    });
    root.querySelector("#topCountryRegion")?.addEventListener("change", (event) => { ui.countryRegion = event.target.value; ui.countryPage = 1; preserveScroll(renderReady); });
    root.querySelector("#topCountryStatus")?.addEventListener("change", (event) => { ui.countryStatus = event.target.value; ui.countryPage = 1; preserveScroll(renderReady); });

    const systemSearch = root.querySelector("#topSystemSearch");
    systemSearch?.addEventListener("input", () => {
      ui.systemQuery = systemSearch.value;
      ui.systemPage = 1;
      window.clearTimeout(systemSearch._topTimer);
      systemSearch._topTimer = window.setTimeout(() => preserveScroll(renderReady, "#topSystemSearch"), 80);
    });
    [["#topSystemCountry", "systemCountry"], ["#topSystemManufacturer", "systemManufacturer"], ["#topSystemSegment", "systemSegment"]].forEach(([selector, key]) => root.querySelector(selector)?.addEventListener("change", (event) => { ui[key] = event.target.value; ui.systemPage = 1; preserveScroll(renderReady); }));

    const drawer = root.querySelector(".top-system-drawer");
    if (drawer) {
      drawer.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSystem(); });
    }
  }

  function renderReady() {
    if (!context?.root || !payload) return;
    context.root.className = "view top-workspace-host";
    context.root.innerHTML = fullMarkup();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    const serial = ++renderSerial;
    if (!context?.root || !selectedIso()) return;
    context.root.className = "view top-workspace-host";
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
    ui.selectedSystemId = null;
  }

  window.GIRTop500Workspace = { render, invalidate };
})();
