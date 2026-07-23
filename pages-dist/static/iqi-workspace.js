/* GIR Digitalisation / AI — Stage 12: Cloudflare Radar Internet Quality Index workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    metric: "BANDWIDTH",
    percentile: "p50",
    mapMode: "value",
    catalogueQuery: "",
    catalogueRegion: "all",
    catalogueStatus: "all",
    cataloguePage: 1,
    cataloguePageSize: 24,
    releaseId: "",
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
  const fmt = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  const compact = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { maximumFractionDigits: digits })
    : "—";
  const intFmt = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const pct = (value, digits = 0) => finite(value) ? `${fmt(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.iso3 || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}:${ui.releaseId || "latest"}`;
  const isReady = () => Boolean(payload?.data_ready);
  const metrics = () => payload?.metrics || [];
  const metricMeta = (code = ui.metric) => metrics().find((item) => item.metric_code === code) || {};
  const catalogue = () => payload?.catalogue?.countries || [];
  const selectedItem = () => catalogue().find((item) => item.iso3 === selectedIso()) || payload?.selected_country || {};
  const selectedProfile = () => payload?.selected_profile || {};
  const currentLens = () => (payload?.lenses || []).find((item) => item.metric === ui.metric && item.percentile === ui.percentile) || payload?.lens || {};
  const direction = () => metricMeta().direction || "higher_is_better";
  const unit = () => metricMeta().expected_unit || currentLens().unit || "";
  const percentileLabel = (value = ui.percentile) => ({ p25: "P25", p50: "P50", p75: "P75" })[value] || String(value).toUpperCase();

  function icon(name) {
    return `<img class="iqi-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (!item) return `<span class="iqi-flag-fallback" aria-hidden="true">—</span>`;
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="iqi-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { message = (await response.json())?.detail || message; } catch (_) { /* no json */ }
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }
    return response.json();
  }

  function loadPayload() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const params = new URLSearchParams({
      country: selectedIso(),
      year: String(requestedYear()),
      metric: ui.metric,
      percentile: ui.percentile,
    });
    if (ui.releaseId) params.set("release_id", ui.releaseId);
    const request = fetchJson(`/api/iqi/workspace?${params}`)
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
    return `<section class="iqi-loading" aria-live="polite"><div class="iqi-loading-core" aria-hidden="true"><i></i><i></i><i></i><b>IQI</b></div><span>CLOUDFLARE RADAR · CONTINUOUS</span><h1>${tr("Собирается наблюдательная панель качества интернета", "Building the Internet quality observatory")}</h1><p>${tr("Проверяются три метрики, девять линз, состояние источника и доказательная цепочка.", "Checking three metrics, nine lenses, source state and the evidence chain.")}</p></section>`;
  }

  function errorState(error) {
    return `<section class="iqi-error"><span>IQI · ERROR</span><h1>${tr("Рабочее пространство IQI не загрузилось", "The IQI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="iqi-button primary" data-iqi-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function sectionHeading(number, eyebrow, title, copy) {
    return `<header class="iqi-section-heading"><span>${esc(number)}</span><div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }

  function observation(item, metric = ui.metric, percentile = ui.percentile) {
    return item?.metrics?.[metric]?.percentiles?.[percentile] || null;
  }

  function lensItems() {
    return catalogue().map((item) => {
      const value = observation(item);
      return {
        ...item,
        lens_value: value?.value ?? null,
        lens_confidence_level: value?.confidence_level ?? null,
        lens_observation_id: value?.observation_id ?? null,
      };
    });
  }

  function orderedLensItems() {
    const available = lensItems().filter((item) => finite(item.lens_value));
    available.sort((a, b) => direction() === "higher_is_better"
      ? Number(b.lens_value) - Number(a.lens_value) || a.iso3.localeCompare(b.iso3)
      : Number(a.lens_value) - Number(b.lens_value) || a.iso3.localeCompare(b.iso3));
    return available;
  }

  function selectedLensValue() {
    return observation(selectedItem())?.value ?? null;
  }

  function selectedLensPosition() {
    const index = orderedLensItems().findIndex((item) => item.iso3 === selectedIso());
    return index >= 0 ? index + 1 : null;
  }

  function metricCopy(code) {
    const values = {
      BANDWIDTH: ["Оценочная скорость загрузки при средней загрузке сети", "Estimated download speed under average network utilisation"],
      LATENCY: ["Оценочная задержка туда-обратно при средней загрузке сети", "Estimated round-trip latency under average network utilisation"],
      DNS: ["Оценочное время ответа системы доменных имён", "Estimated Domain Name System response time"],
    };
    const item = values[code] || ["", ""];
    return tr(item[0], item[1]);
  }

  function metricGlyph(code) {
    if (code === "BANDWIDTH") return `<svg viewBox="0 0 120 72" aria-hidden="true"><path d="M9 55 C28 18, 48 63, 66 29 S94 28,111 12"/><path class="ghost" d="M9 61 C34 43, 51 51, 69 39 S93 35,111 30"/><circle cx="111" cy="12" r="4"/></svg>`;
    if (code === "LATENCY") return `<svg viewBox="0 0 120 72" aria-hidden="true"><path d="M9 36 H28 L37 16 L48 57 L59 28 L70 44 L81 23 L92 36 H111"/><path class="ghost" d="M9 56 H111"/><circle cx="92" cy="36" r="4"/></svg>`;
    return `<svg viewBox="0 0 120 72" aria-hidden="true"><circle cx="26" cy="36" r="10"/><circle cx="60" cy="17" r="8"/><circle cx="94" cy="36" r="10"/><circle cx="60" cy="56" r="8"/><path d="M34 31 L52 21 M68 21 L86 31 M86 42 L68 52 M52 52 L34 42"/></svg>`;
  }

  function statusLabel() {
    return isReady()
      ? tr("АВТОРИЗОВАННЫЙ СНИМОК УСТАНОВЛЕН", "AUTHORISED SNAPSHOT INSTALLED")
      : tr("SOURCE GATE АКТИВЕН", "SOURCE GATE ACTIVE");
  }

  function hero() {
    const idx = payload?.index || {};
    const release = payload?.release || {};
    const health = payload?.data_health || {};
    const value = selectedLensValue();
    const position = selectedLensPosition();
    const confidence = observation(selectedItem())?.confidence_level;
    return `<section class="iqi-hero" aria-labelledby="iqiTitle"><article class="iqi-hero-copy"><div class="iqi-signal-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="iqi-overline"><span>CLOUDFLARE RADAR · IQI</span><b>${tr("непрерывные наблюдения", "continuous observations")}</b><em>${isReady() ? tr("локальный снимок", "local snapshot") : tr("контракт источника", "source contract")}</em></div><h1 id="iqiTitle">${esc(lang() === "ru" ? idx.name_ru : idx.name_en)}</h1><p class="iqi-hero-lead">${tr("Наблюдательная система качества соединения при средней загрузке: пропускная способность, задержка и время ответа DNS — каждая метрика рассматривается отдельно.", "An observational view of connection performance under average utilisation: bandwidth, latency and DNS response time, with every metric interpreted separately.")}</p><div class="iqi-edition-line"><span><b>${tr("Режим", "Mode")}</b> ${isReady() ? tr("данные", "measurements") : tr("source gate", "source gate")}</span><span><b>${tr("Метрики", "Metrics")}</b> 3</span><span><b>${tr("Перцентили", "Percentiles")}</b> P25 · P50 · P75</span><span><b>${tr("Линзы", "Lenses")}</b> 9</span></div><div class="iqi-metric-strip">${metrics().map((item) => `<button type="button" class="${ui.metric === item.metric_code ? "active" : ""}" data-iqi-metric="${esc(item.metric_code)}"><i></i><strong>${esc(item.metric_code)}</strong><small>${esc(item.expected_unit)}</small></button>`).join("")}<em>${tr("без общего балла", "no overall score")}</em></div><div class="iqi-hero-actions"><button type="button" class="iqi-button primary" data-iqi-scroll="iqiArchitecture">${tr("Открыть архитектуру", "Open architecture")}</button>${isReady() ? `<a class="iqi-button" href="/api/iqi/workspace.csv?release_id=${encodeURIComponent(release.release_id || "")}&metric=${encodeURIComponent(ui.metric)}&percentile=${encodeURIComponent(ui.percentile)}&lang=${lang()}" download="gir-cloudflare-iqi.csv">${icon("download")}${tr("Выгрузить линзу", "Download lens")}</a>` : `<button type="button" class="iqi-button" data-iqi-scroll="iqiConnector">${icon("server")}${tr("Подключить источник", "Connect source")}</button>`}<a class="iqi-button quiet" href="${esc(payload?.source?.url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">Cloudflare Radar ↗</a></div><div class="iqi-science-banner"><span>${tr("НЕТ COMPOSITE SCORE · НЕТ ОФИЦИАЛЬНОГО МЕСТА", "NO COMPOSITE SCORE · NO OFFICIAL COUNTRY RANK")}</span><p>${tr("GIR не смешивает Mbps и миллисекунды и не превращает сортировку по одной линзе в официальный рейтинг Cloudflare.", "GIR does not mix Mbps with milliseconds and never turns sorting by one lens into an official Cloudflare ranking.")}</p></div></article><aside class="iqi-command-card ${isReady() ? "ready" : "gated"}"><header><div><span class="iqi-live-dot"></span><strong>${esc(statusLabel())}</strong></div><small>${esc(release.release_id || "—")}</small></header><div class="iqi-command-core"><div class="iqi-gate-orbit" role="img" aria-label="${esc(statusLabel())}"><i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i><span><small>${isReady() ? esc(ui.metric) : "IQI"}</small><strong>${isReady() && finite(value) ? fmt(value, ui.metric === "BANDWIDTH" ? 1 : 0) : "0"}</strong><em>${isReady() && finite(value) ? esc(unit()) : tr("значений", "values")}</em></span></div><mark>${isReady() ? `${esc(percentileLabel())} · ${tr("официальное наблюдение", "official observation")}` : tr("измерения не включены в ZIP", "measurements are not bundled")}</mark></div><div class="iqi-command-grid"><div><span>${tr("Локации", "Locations")}</span><strong>${intFmt(health.locations_loaded || 0)}</strong><small>${tr("загружено локально", "loaded locally")}</small></div><div><span>${tr("Наблюдения", "Observations")}</span><strong>${intFmt(health.observations_loaded || 0)}</strong><small>${tr("3 × 3 на профиль", "3 × 3 per profile")}</small></div><div><span>${tr("Confidence", "Confidence")}</span><strong>${finite(confidence) ? `${intFmt(confidence)} / 5` : "N/A"}</strong><small>${tr("метаданные обязательны", "metadata required")}</small></div><div><span>${tr("Порядок GIR", "GIR order")}</span><strong>${finite(position) ? `#${intFmt(position)}` : "N/A"}</strong><small>${tr("не место Cloudflare", "not a Cloudflare rank")}</small></div></div><footer><span>${tr("Лицензия данных", "Data licence")}</span><strong>CC BY‑NC 4.0</strong></footer></aside></section>`;
  }

  function jump() {
    const items = [
      ["iqiArchitecture", tr("01 Архитектура", "01 Architecture")],
      ["iqiAtlas", tr("02 Атлас", "02 Atlas")],
      ["iqiProfile", tr("03 Профиль", "03 Profile")],
      ["iqiConnector", tr("04 Коннектор", "04 Connector")],
      ["iqiReleases", tr("05 Снимки", "05 Releases")],
      ["iqiCatalogue", tr("06 Каталог", "06 Catalogue")],
      ["iqiTrust", tr("07 Доверие", "07 Trust")],
    ];
    return `<nav class="iqi-jump" aria-label="${tr("Навигация по IQI", "IQI workspace navigation")}">${items.map(([target, label]) => `<button type="button" data-iqi-scroll="${target}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function percentileRail() {
    return `<div class="iqi-percentile-rail" role="group" aria-label="${tr("Выбор перцентиля", "Percentile selection")}">${["p25","p50","p75"].map((item) => `<button type="button" class="${ui.percentile === item ? "active" : ""}" data-iqi-percentile="${item}"><strong>${percentileLabel(item)}</strong><span>${item === "p25" ? tr("нижняя граница", "lower quartile") : item === "p50" ? tr("медиана", "median") : tr("верхняя граница", "upper quartile")}</span></button>`).join("")}</div>`;
  }

  function metricCard(item) {
    const active = ui.metric === item.metric_code;
    const selectedMetric = selectedProfile()?.metric_profiles?.find((metric) => metric.metric_code === item.metric_code);
    const p50 = selectedMetric?.percentiles?.p50;
    const valueText = isReady() && p50 ? `${fmt(p50.official_value, item.metric_code === "BANDWIDTH" ? 1 : 0)} ${esc(p50.unit || item.expected_unit)}` : "N/A";
    return `<button type="button" class="iqi-metric-card ${active ? "active" : ""}" data-iqi-metric="${esc(item.metric_code)}"><header><span>${String(item.ordinal).padStart(2,"0")}</span><mark>${item.direction === "higher_is_better" ? tr("БОЛЬШЕ — ЛУЧШЕ", "HIGHER IS BETTER") : tr("МЕНЬШЕ — ЛУЧШЕ", "LOWER IS BETTER")}</mark></header><div class="iqi-metric-glyph">${metricGlyph(item.metric_code)}</div><h3>${esc(local(item))}</h3><p>${esc(metricCopy(item.metric_code))}</p><footer><div><small>${tr("Выбранная страна · P50", "Selected country · P50")}</small><strong>${valueText}</strong></div><span>${esc(item.expected_unit)}</span></footer></button>`;
  }

  function architectureSection() {
    return `<section class="iqi-section" id="iqiArchitecture">${sectionHeading("01", tr("Архитектура сигнала", "Signal architecture"), tr("Три независимые метрики, девять воспроизводимых линз", "Three independent metrics, nine reproducible lenses"), tr("Cloudflare публикует P25, P50 и P75 для каждой метрики. Разные единицы и направления интерпретации сохраняются без искусственного объединения.", "Cloudflare publishes P25, P50 and P75 for every metric. Different units and interpretation directions remain separate, without artificial aggregation."))}<div class="iqi-metric-grid">${metrics().map(metricCard).join("")}</div>${percentileRail()}<div class="iqi-lens-readout"><span>${tr("Активная линза", "Active lens")}</span><strong>${esc(ui.metric)} · ${esc(percentileLabel())}</strong><p>${esc(local(metricMeta(), "description") || metricCopy(ui.metric))}</p><div><b>${direction() === "higher_is_better" ? "↑" : "↓"}</b><span>${direction() === "higher_is_better" ? tr("большее значение означает более высокую оценочную пропускную способность", "a higher value means greater estimated bandwidth") : tr("меньшее значение означает более быстрый отклик", "a lower value means faster response")}</span></div></div></section>`;
  }

  function bboxOfFeatures(features) {
    let minX = 180, maxX = -180, minY = 90, maxY = -90;
    const visit = (coords) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === "number") {
        const [x, y] = coords;
        if (Number.isFinite(x) && Number.isFinite(y)) { minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y); }
      } else coords.forEach(visit);
    };
    features.forEach((feature) => visit(feature.geometry?.coordinates));
    return [minX, minY, maxX, maxY];
  }

  function pathFromGeom(geometry, width, height, bounds) {
    const [minX, minY, maxX, maxY] = bounds;
    const project = (lon, lat) => {
      const x = ((lon - minX) / (maxX - minX || 1)) * width;
      const merc = Math.log(Math.tan(Math.PI / 4 + Math.max(-80, Math.min(84, lat)) * Math.PI / 360));
      const minMerc = Math.log(Math.tan(Math.PI / 4 + Math.max(-80, minY) * Math.PI / 360));
      const maxMerc = Math.log(Math.tan(Math.PI / 4 + Math.min(84, maxY) * Math.PI / 360));
      const y = height - ((merc - minMerc) / (maxMerc - minMerc || 1)) * height;
      return [x, y];
    };
    const ringPath = (ring) => {
      const visible = ring.filter((point) => point[0] >= -180 && point[1] >= -60 && point[1] <= 86);
      if (!visible.length) return "";
      return visible.map((point, index) => { const [x,y]=project(point[0],point[1]); return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";
    };
    if (geometry?.type === "Polygon") return geometry.coordinates.map(ringPath).join("");
    if (geometry?.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map(ringPath).join("")).join("");
    return "";
  }

  function thresholds() {
    const values = orderedLensItems().map((item) => Number(item.lens_value)).sort((a,b)=>a-b);
    if (!values.length) return [];
    const at = (p) => values[Math.min(values.length - 1, Math.max(0, Math.round((values.length - 1) * p)))];
    return [at(.16),at(.33),at(.50),at(.67),at(.84)];
  }

  function mapTone(item, cuts) {
    if (!isReady()) return item?.iso3 === selectedIso() ? "standby-selected" : "standby";
    if (ui.mapMode === "availability") {
      if (!item || !item.observations_available) return "no-data";
      return item.profile_complete ? "band-6" : "band-3";
    }
    const obs = observation(item);
    if (!obs) return "no-data";
    if (ui.mapMode === "confidence") {
      const level = Number(obs.confidence_level || 0);
      return `band-${Math.max(1, Math.min(6, level + 1))}`;
    }
    const value = Number(obs.value);
    let band = 1;
    cuts.forEach((cut) => { if (value >= cut) band += 1; });
    if (direction() === "lower_is_better") band = 7 - band;
    return `band-${Math.max(1, Math.min(6, band))}`;
  }

  function worldMap() {
    if (!geo?.features) return `<div class="iqi-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const byIso = new Map(catalogue().map((item) => [item.iso3, item]));
    const width = 980, height = 440;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    const cuts = thresholds();
    return `<svg class="iqi-world-map" data-mode="${isReady() ? "measurements" : "standby"}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${tr("Карта Internet Quality Index", "Internet Quality Index map")}">${features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = byIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const obs = observation(item);
      let text = tr("снимок не загружен", "snapshot not loaded");
      if (isReady() && obs) text = ui.mapMode === "confidence" ? `${tr("confidence", "confidence")} ${obs.confidence_level}/5` : `${fmt(obs.value, ui.metric === "BANDWIDTH" ? 1 : 0)} ${obs.unit || unit()}`;
      else if (isReady()) text = tr("нет наблюдения", "no observation");
      const interactive = Boolean(isReady() && item?.observations_available);
      return `<path class="iqi-map-country ${mapTone(item, cuts)}${iso3 === selectedIso() ? " selected" : ""}" d="${d}" data-iqi-country="${esc(iso3)}" tabindex="${interactive ? "0" : "-1"}" role="${interactive ? "button" : "img"}" aria-label="${esc(name)} · ${esc(text)}"><title>${esc(name)} · ${esc(text)}</title></path>`;
    }).join("")}<g class="iqi-map-scanner" aria-hidden="true"><line x1="0" y1="120" x2="980" y2="120"/></g></svg>`;
  }

  function mapLegend() {
    if (!isReady()) return `<span class="standby"><i></i>${tr("ожидание локального снимка", "awaiting local snapshot")}</span><span class="selected"><i></i>${tr("выбранная страна", "selected country")}</span>`;
    if (ui.mapMode === "availability") return `<span class="band-6"><i></i>${tr("полный профиль", "complete profile")}</span><span class="band-3"><i></i>${tr("частичный профиль", "partial profile")}</span><span class="no-data"><i></i>${tr("не загружено", "not loaded")}</span>`;
    if (ui.mapMode === "confidence") return [1,2,3,4,5].map((level) => `<span class="band-${level+1}"><i></i>${level}/5</span>`).join("");
    return [1,2,3,4,5,6].map((band) => `<span class="band-${band}"><i></i>${tr("квантиль", "band")} ${band}</span>`).join("");
  }

  function healthPanel() {
    const h = payload?.data_health || {};
    const gates = [
      [tr("API token", "API token"), h.token_required ? tr("требуется", "required") : tr("не требуется", "not required"), h.token_required ? "waiting" : "pass"],
      [tr("Лицензия", "Licence"), "CC BY‑NC 4.0", "warning"],
      [tr("Фиксированное окно", "Fixed window"), payload?.release?.requested_start ? tr("задано", "defined") : tr("не задано", "undefined"), "pass"],
      [tr("Снимок", "Snapshot"), h.snapshot_installed ? tr("установлен", "installed") : tr("не установлен", "not installed"), h.snapshot_installed ? "pass" : "waiting"],
    ];
    return `<aside class="iqi-health-card"><header><span>DATA PLANE · ${isReady() ? "ONLINE" : "STANDBY"}</span><h3>${tr("Состояние наблюдательного слоя", "Observation layer status")}</h3><p>${isReady() ? tr("Frontend читает локальный авторизованный снимок. Значения не передаются во внешний сервис.", "The frontend reads the locally authorised snapshot. Values are not sent to an external service.") : tr("Публичная поставка содержит контракт и коннектор, но не содержит лицензируемые страновые измерения.", "The public delivery contains the contract and connector, but not the licensed country measurements.")}</p></header><div class="iqi-gate-list">${gates.map(([label,value,state], index) => `<div class="${state}"><b>${String(index+1).padStart(2,"0")}</b><span><small>${esc(label)}</small><strong>${esc(value)}</strong></span><i></i></div>`).join("")}</div><div class="iqi-health-numbers"><div><span>${tr("Локации", "Locations")}</span><strong>${intFmt(h.locations_loaded || 0)}</strong><small>/ ${intFmt(h.locations_in_platform_catalogue || 0)} ${tr("в каталоге GIR", "in GIR catalogue")}</small></div><div><span>${tr("Полнота", "Completeness")}</span><strong>${finite(h.observation_completeness_ratio) ? pct(h.observation_completeness_ratio, 0) : "N/A"}</strong><small>${tr("для запрошенных локаций", "for requested locations")}</small></div></div></aside>`;
  }

  function atlasSection() {
    return `<section class="iqi-section" id="iqiAtlas">${sectionHeading("02", tr("Глобальный атлас", "Global atlas"), isReady() ? tr("Одна карта — одна выбранная линза", "One map — one selected lens") : tr("Карта в режиме ожидания — без фиктивной заливки", "Map on standby — without fabricated shading"), isReady() ? tr("Цвет отражает только выбранную метрику, перцентиль и снимок. Порядок и квантильные группы рассчитывает GIR для навигации.", "Colour reflects only the selected metric, percentile and snapshot. Ordering and quantile bands are calculated by GIR for navigation.") : tr("До установки локального снимка геометрия мира остаётся нейтральной: отсутствие данных не интерпретируется как ноль или низкое качество.", "Until a local snapshot is installed, the world geometry remains neutral: missing data is not interpreted as zero or low quality."))}<div class="iqi-atlas-layout"><article class="iqi-map-card"><header><div><span>${tr("Активная линза", "Active lens")}</span><strong>${esc(ui.metric)} · ${esc(percentileLabel())}</strong><small>${esc(unit())} · ${direction() === "higher_is_better" ? "↑" : "↓"}</small></div><div class="iqi-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode === "value" ? "active" : ""}" data-iqi-map-mode="value">${tr("Значение", "Value")}</button><button type="button" class="${ui.mapMode === "confidence" ? "active" : ""}" data-iqi-map-mode="confidence">Confidence</button><button type="button" class="${ui.mapMode === "availability" ? "active" : ""}" data-iqi-map-mode="availability">${tr("Охват", "Coverage")}</button></div></header><div class="iqi-map-stage">${worldMap()}</div><div class="iqi-map-legend">${mapLegend()}</div></article>${healthPanel()}</div></section>`;
  }

  function confidenceDots(level) {
    return `<span class="iqi-confidence-dots" aria-label="confidence ${finite(level) ? level : 0} / 5">${[1,2,3,4,5].map((value) => `<i class="${finite(level) && value <= Number(level) ? "on" : ""}"></i>`).join("")}</span>`;
  }

  function metricProfileCard(item) {
    const values = item?.percentiles || {};
    const p25 = values.p25, p50 = values.p50, p75 = values.p75;
    const available = Boolean(p25 && p50 && p75);
    const max = Math.max(1, ...[p25?.official_value,p50?.official_value,p75?.official_value].filter(finite).map(Number));
    return `<article class="iqi-profile-metric ${available ? "available" : "unavailable"}"><header><div><span>${esc(item.metric_code)}</span><h3>${esc(local(item))}</h3></div><mark>${item.direction === "higher_is_better" ? "↑" : "↓"} ${esc(item.expected_unit)}</mark></header><div class="iqi-range-viz"><div class="iqi-range-axis"><i></i><i></i><i></i><i></i><i></i></div>${available ? `<span class="range" style="--from:${Number(p25.official_value)/max*100}%;--to:${Number(p75.official_value)/max*100}%"></span><b class="median" style="--at:${Number(p50.official_value)/max*100}%"></b>` : `<span class="iqi-empty-signal">${tr("Наблюдение не загружено", "Observation not loaded")}</span>`}</div><div class="iqi-percentile-values">${["p25","p50","p75"].map((code) => { const value = values[code]; return `<div class="${ui.percentile === code ? "active" : ""}"><span>${percentileLabel(code)}</span><strong>${value ? fmt(value.official_value, item.metric_code === "BANDWIDTH" ? 1 : 0) : "N/A"}</strong><small>${esc(value?.unit || item.expected_unit)}</small></div>`; }).join("")}</div><footer><div><span>Confidence</span>${confidenceDots(p50?.confidence_level)}</div>${p50?.observation_id ? `<button type="button" data-iqi-provenance="${esc(p50.observation_id)}">${tr("Доказательство", "Evidence")} ↗</button>` : `<span>${tr("source gate", "source gate")}</span>`}</footer></article>`;
  }

  function profileSection() {
    const country = payload?.selected_country || selectedItem();
    const pos = selectedLensPosition();
    const lens = currentLens();
    return `<section class="iqi-section" id="iqiProfile">${sectionHeading("03", tr("Страновой профиль", "Country profile"), isReady() ? tr("P25 — P50 — P75 и confidence в одной доказательной плоскости", "P25 — P50 — P75 and confidence on one evidence plane") : tr("Контракт готов к данным, но не заполняет пробелы", "The contract is data-ready, but never fills gaps"), isReady() ? tr("Каждая метрика сохраняет собственную единицу, направление, временное окно и уровень уверенности Cloudflare.", "Every metric preserves its own unit, direction, time window and Cloudflare confidence level.") : tr("Профиль показывает честный N/A до установки разрешённого снимка. Это состояние функционально и методологически отличается от нулевого значения.", "The profile shows an honest N/A until a permitted snapshot is installed. This state is functionally and methodologically different from zero."))}<div class="iqi-profile-header"><div>${flag(country, "flag-img")}<span><small>${esc(country.iso3 || selectedIso())}</small><h3>${esc(countryName(country))}</h3><p>${esc(country.region || "—")} · ${esc(country.income_group || "—")}</p></span></div><div><span>${tr("Активная линза", "Active lens")}</span><strong>${finite(selectedLensValue()) ? `${fmt(selectedLensValue(), ui.metric === "BANDWIDTH" ? 1 : 0)} ${esc(unit())}` : "N/A"}</strong><small>${finite(pos) ? `${tr("порядок GIR", "GIR order")} #${intFmt(pos)} / ${intFmt(lens.available_locations)}` : tr("нет официального места", "no official rank")}</small></div></div><div class="iqi-profile-grid">${(selectedProfile()?.metric_profiles || metrics().map((item) => ({...item, percentiles:{}}))).map(metricProfileCard).join("")}</div><div class="iqi-profile-note"><b>${tr("Интерпретация", "Interpretation")}</b><p>${tr("Bandwidth: больше — лучше. Latency и DNS: меньше — лучше. Сравнивать метрики между собой как один балл нельзя.", "Bandwidth: higher is better. Latency and DNS: lower is better. The metrics cannot be combined or compared as a single score.")}</p></div></section>`;
  }

  function commandBlock(command, platform) {
    return `<article class="iqi-command-block"><header><span>${esc(platform)}</span><button type="button" data-iqi-copy="${esc(platform.toLowerCase())}">${tr("Копировать", "Copy")}</button></header><pre><code>${esc(command)}</code></pre></article>`;
  }

  function connectorSection() {
    const connector = payload?.connector || {};
    const steps = [
      ["01",tr("Создать минимальный токен", "Create a least-privilege token"),tr("Разрешение Account → Radar → Read. Токен хранится только в переменной окружения.", "Permission: Account → Radar → Read. The token stays only in an environment variable."),"network"],
      ["02",tr("Проверить режим использования", "Review the intended use"),tr("Данные API распространяются по CC BY‑NC 4.0. Для коммерческой публикации требуется отдельное правовое решение.", "API data is licensed under CC BY-NC 4.0. Commercial publication requires a separate legal decision."),"clipboard-check"],
      ["03",tr("Зафиксировать окно", "Fix the observation window"),tr("Начало и конец периода записываются в release и provenance для воспроизводимости.", "The start and end of the window are stored in the release and provenance for reproducibility."),"database"],
      ["04",tr("Запустить локальный импорт", "Run the local import"),tr("После проверки snapshot frontend автоматически переключится из source-gate в аналитический режим.", "After snapshot validation, the frontend automatically switches from source-gate to analytics mode."),"server"],
    ];
    return `<section class="iqi-section" id="iqiConnector">${sectionHeading("04", tr("Connector control room", "Connector control room"), tr("Данные подключаются локально, токен никогда не попадает в браузер", "Data is connected locally; the token never reaches the browser"), tr("Stage 12 поставляет весь frontend и коннектор, но оставляет решение о допустимости публикации оператору проекта.", "Stage 12 delivers the complete frontend and connector while leaving publication permission to the project operator."))}<div class="iqi-connector-steps">${steps.map(([number,title,copy,ico]) => `<article><div>${icon(ico)}<span>${number}</span></div><h3>${esc(title)}</h3><p>${esc(copy)}</p><i class="${number === "04" && isReady() ? "pass" : number === "02" ? "warning" : "waiting"}"></i></article>`).join("")}</div><div class="iqi-command-layout">${commandBlock(connector.linux_command || "", "Linux / macOS")}${commandBlock(connector.powershell_command || "", "PowerShell")}</div><div class="iqi-licence-gate"><div><span>${tr("ЛИЦЕНЗИОННЫЙ GATE", "LICENCE GATE")}</span><strong>CC BY‑NC 4.0</strong></div><p>${tr("Флаг --acknowledge-cc-by-nc подтверждает только осознанный запуск локального импорта; он не заменяет разрешение на коммерческое использование и не является юридическим заключением.", "The --acknowledge-cc-by-nc flag only confirms an informed local import; it does not replace permission for commercial use and is not legal advice.")}</p><a href="${esc(payload?.source_contract?.license?.url || "https://creativecommons.org/licenses/by-nc/4.0/")}" target="_blank" rel="noopener noreferrer">${tr("Открыть текст лицензии", "Open licence text")} ↗</a></div></section>`;
  }

  function releaseState(item) {
    if (Number(item.observations_loaded) > 0) return tr("СНИМОК УСТАНОВЛЕН", "SNAPSHOT INSTALLED");
    return tr("ТОЛЬКО КОНТРАКТ", "CONTRACT ONLY");
  }

  function releasesSection() {
    const releases = payload?.releases || [];
    const audit = payload?.audit || {};
    return `<section class="iqi-section" id="iqiReleases">${sectionHeading("05", tr("Реестр снимков", "Release ledger"), tr("Непрерывный источник превращается в датированные воспроизводимые наблюдения", "A continuous source becomes dated, reproducible observations"), tr("Каждый локальный импорт получает собственный release ID, временное окно, SHA‑256, состояние охвата и распределение confidence.", "Every local import receives its own release ID, time window, SHA-256, coverage state and confidence distribution."))}<div class="iqi-release-ledger"><div class="iqi-release-table"><table><thead><tr><th>${tr("Состояние", "State")}</th><th>Release ID</th><th>${tr("Окно", "Window")}</th><th>${tr("Локации", "Locations")}</th><th>${tr("Наблюдения", "Observations")}</th><th>Snapshot</th></tr></thead><tbody>${releases.map((item) => `<tr class="${Number(item.observations_loaded) > 0 ? "ready" : "gated"}"><td><span><i></i>${esc(releaseState(item))}</span></td><td><code>${esc(item.release_id)}</code></td><td><strong>${esc(String(item.adjusted_start || item.requested_start || "—").slice(0,10))}</strong><small>→ ${esc(String(item.adjusted_end || item.requested_end || "—").slice(0,10))}</small></td><td>${intFmt(item.locations_loaded || 0)} / ${intFmt(item.locations_requested || 0)}</td><td>${intFmt(item.observations_loaded || 0)}</td><td><code>${item.raw_snapshot_sha256 ? `${esc(item.raw_snapshot_sha256.slice(0,12))}…` : "—"}</code></td></tr>`).join("")}</tbody></table></div><aside><span>INGESTION AUDIT</span><h3>${audit?.validation_passed ? tr("Проверка пройдена", "Validation passed") : tr("Ожидается factual snapshot", "Awaiting factual snapshot")}</h3><dl><div><dt>${tr("Composite scores", "Composite scores")}</dt><dd>0</dd></div><div><dt>${tr("Официальные места", "Official ranks")}</dt><dd>0</dd></div><div><dt>${tr("Токены в данных", "Tokens in data")}</dt><dd>0</dd></div><div><dt>${tr("Source contract", "Source contract")}</dt><dd>${esc(String(payload?.release?.source_contract_sha256 || "").slice(0,12))}…</dd></div></dl></aside></div></section>`;
  }

  function filteredCatalogue() {
    const rawQuery = ui.catalogueQuery.trim();
    const query = rawQuery.toLocaleLowerCase(locale());
    const exactIso3 = /^[A-Za-z]{3}$/.test(rawQuery) ? rawQuery.toUpperCase() : null;
    const items = lensItems().filter((item) => {
      if (exactIso3 && item.iso3 !== exactIso3) return false;
      if (!exactIso3 && query && !`${item.iso3} ${item.name_ru} ${item.name_en}`.toLocaleLowerCase(locale()).includes(query)) return false;
      if (ui.catalogueRegion !== "all" && item.region !== ui.catalogueRegion) return false;
      if (ui.catalogueStatus !== "all") {
        const state = item.observations_available ? (item.profile_complete ? "complete" : "partial") : "not_loaded";
        if (state !== ui.catalogueStatus) return false;
      }
      return true;
    });
    items.sort((a,b) => {
      if (finite(a.lens_value) && finite(b.lens_value)) return direction() === "higher_is_better" ? Number(b.lens_value)-Number(a.lens_value) : Number(a.lens_value)-Number(b.lens_value);
      if (finite(a.lens_value)) return -1;
      if (finite(b.lens_value)) return 1;
      return countryName(a).localeCompare(countryName(b), locale());
    });
    const positions = new Map(orderedLensItems().map((item,index) => [item.iso3,index+1]));
    return items.map((item) => ({...item, gir_navigation_position: positions.get(item.iso3) || null}));
  }

  function miniSignal(item) {
    const values = ["p25","p50","p75"].map((code) => observation(item, ui.metric, code)?.value).filter(finite).map(Number);
    if (!values.length) return `<span class="iqi-mini-empty">N/A</span>`;
    const max = Math.max(...values, 1);
    return `<span class="iqi-mini-signal">${values.map((value,index) => `<i style="--h:${Math.max(10,value/max*100)}%"><b>${index===1?"P50":""}</b></i>`).join("")}</span>`;
  }

  function catalogueSection() {
    const items = filteredCatalogue();
    const pages = Math.max(1, Math.ceil(items.length / ui.cataloguePageSize));
    ui.cataloguePage = Math.min(Math.max(1, ui.cataloguePage), pages);
    const start = (ui.cataloguePage - 1) * ui.cataloguePageSize;
    const page = items.slice(start, start + ui.cataloguePageSize);
    const regions = payload?.catalogue?.regions || [];
    return `<section class="iqi-section" id="iqiCatalogue">${sectionHeading("06", tr("Каталог локаций", "Location catalogue"), isReady() ? tr("Навигация по одной линзе — без официального ранга", "Navigation by one lens — without an official rank") : tr("225 локаций готовы к авторизованной загрузке", "225 locations are ready for authorised loading"), isReady() ? tr("Порядок GIR действует только внутри выбранных metric, percentile и release. В CSV официальная колонка rank остаётся пустой.", "GIR order applies only within the selected metric, percentile and release. The official rank column remains empty in CSV.") : tr("До импорта каталог показывает готовность коннектора, а не значения качества. N/A не заменяется нулём.", "Before import, the catalogue shows connector readiness rather than quality values. N/A is never replaced with zero."))}<div class="iqi-catalogue-toolbar"><label><span>${tr("Поиск", "Search")}</span><input id="iqiCatalogueSearch" type="search" value="${esc(ui.catalogueQuery)}" placeholder="${tr("Страна или ISO3", "Country or ISO3")}"></label><label><span>${tr("Регион", "Region")}</span><select id="iqiCatalogueRegion"><option value="all">${tr("Все регионы", "All regions")}</option>${regions.map((item) => `<option value="${esc(item)}" ${ui.catalogueRegion===item?"selected":""}>${esc(item)}</option>`).join("")}</select></label><label><span>${tr("Состояние", "State")}</span><select id="iqiCatalogueStatus"><option value="all">${tr("Все состояния", "All states")}</option><option value="complete" ${ui.catalogueStatus==="complete"?"selected":""}>${tr("Полный профиль", "Complete profile")}</option><option value="partial" ${ui.catalogueStatus==="partial"?"selected":""}>${tr("Частичный профиль", "Partial profile")}</option><option value="not_loaded" ${ui.catalogueStatus==="not_loaded"?"selected":""}>${tr("Не загружено", "Not loaded")}</option></select></label><div><span>${tr("Линза", "Lens")}</span><strong>${esc(ui.metric)} · ${esc(percentileLabel())}</strong></div></div><div class="iqi-catalogue-table-wrap"><table class="iqi-catalogue-table"><thead><tr><th>${tr("Порядок GIR", "GIR order")}</th><th>${tr("Локация", "Location")}</th><th>${esc(ui.metric)} · ${esc(percentileLabel())}</th><th>P25 · P50 · P75</th><th>Confidence</th><th>${tr("Статус", "Status")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${page.map((item) => { const obs = observation(item); const status = item.observations_available ? (item.profile_complete ? tr("полный", "complete") : tr("частичный", "partial")) : tr("не загружено", "not loaded"); return `<tr class="${item.iso3===selectedIso()?"selected":""} ${item.observations_available?"has-data":"no-data"}"><td><strong>${finite(item.gir_navigation_position)?`#${intFmt(item.gir_navigation_position)}`:"—"}</strong><small>${tr("не официально", "not official")}</small></td><td><button type="button" class="iqi-country-cell" data-iqi-country="${esc(item.iso3)}" ${!item.observations_available?"disabled":""}>${flag(item)}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)} · ${esc(item.region || "—")}</small></span></button></td><td><strong>${obs ? `${fmt(obs.value, ui.metric === "BANDWIDTH" ? 1 : 0)} ${esc(obs.unit || unit())}` : "N/A"}</strong><small>${direction() === "higher_is_better" ? "↑" : "↓"} ${tr("отдельная метрика", "separate metric")}</small></td><td>${miniSignal(item)}</td><td>${confidenceDots(obs?.confidence_level)}</td><td><span class="iqi-status-pill ${item.profile_complete?"complete":item.observations_available?"partial":"empty"}">${esc(status)}</span></td><td>${obs?.observation_id ? `<button type="button" class="iqi-row-evidence" data-iqi-provenance="${esc(obs.observation_id)}">↗</button>` : "—"}</td></tr>`; }).join("")}</tbody></table></div><footer class="iqi-catalogue-footer"><span>${items.length ? `${intFmt(start+1)}–${intFmt(Math.min(start+page.length,items.length))}` : "0"} / ${intFmt(items.length)}</span><div><button type="button" data-iqi-page="${ui.cataloguePage-1}" ${ui.cataloguePage<=1?"disabled":""}>←</button><strong>${intFmt(ui.cataloguePage)} / ${intFmt(pages)}</strong><button type="button" data-iqi-page="${ui.cataloguePage+1}" ${ui.cataloguePage>=pages?"disabled":""}>→</button></div></footer></section>`;
  }

  function trustSection() {
    const principles = [
      ["boxes",tr("Без composite score", "No composite score"),tr("Mbps и миллисекунды не складываются и не нормализуются в скрытый итоговый балл.", "Mbps and milliseconds are not added or normalised into a hidden overall score.")],
      ["table-2",tr("Без официального места", "No official rank"),tr("Любая сортировка подписана как навигация GIR для одной линзы и одного снимка.", "Any ordering is labelled as GIR navigation for one lens and one snapshot.")],
      ["chart-no-axes-combined",tr("Confidence обязателен", "Confidence is mandatory"),tr("Уровень 0–5 и annotations сохраняются вместе с каждым официальным наблюдением.", "The 0–5 level and annotations are preserved with every official observation.")],
      ["database",tr("Пробелы — не outage", "Gaps are not outages"),tr("Недостаток измерений остаётся отсутствием данных и не интерпретируется как сбой сети.", "Insufficient measurements remain missing data and are not interpreted as a network outage.")],
    ];
    return `<section class="iqi-section" id="iqiTrust">${sectionHeading("07", tr("Методология и доверие", "Methodology and trust"), tr("Наблюдение, состояние источника и производная навигация разделены", "Observation, source state and derived navigation are separated"), tr("Frontend показывает научный статус каждого элемента и не скрывает лицензионные, методические или confidence-ограничения.", "The frontend exposes the scientific status of every element and does not hide licensing, methodological or confidence limitations."))}<div class="iqi-principles">${principles.map(([ico,title,copy]) => `<article>${icon(ico)}<h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`).join("")}</div><div class="iqi-trust-layout"><article class="iqi-method-card"><header><span>MEASUREMENT MODEL</span><h3>3 metrics × 3 percentiles</h3></header><div class="iqi-method-diagram"><div><strong>BANDWIDTH</strong><small>Mbps · ↑</small></div><i></i><div><strong>LATENCY</strong><small>ms · ↓</small></div><i></i><div><strong>DNS</strong><small>ms · ↓</small></div></div><p>${tr("IQI оценивает производительность соединения при средней загрузке на основе измерений конечных пользователей по фиксированному набору целей Cloudflare и сторонних сервисов.", "IQI estimates connection performance under average utilisation using end-user measurements against a fixed set of Cloudflare and third-party targets.")}</p></article><article class="iqi-chain-card"><header><span>PROVENANCE</span><h3>${tr("Доказательная цепочка", "Evidence chain")}</h3></header><ol><li><b>01</b><span>Cloudflare Radar API</span></li><li><b>02</b><span>${tr("Фиксированное временное окно", "Fixed observation window")}</span></li><li><b>03</b><span>SHA‑256 · ${esc(String(payload?.release?.raw_snapshot_sha256 || payload?.release?.source_contract_sha256 || "").slice(0,18))}…</span></li><li><b>04</b><span>${tr("Metric + percentile + confidence", "Metric + percentile + confidence")}</span></li></ol><a class="iqi-button primary" href="${esc(payload?.source?.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Открыть официальный Radar", "Open official Radar")} ↗</a></article></div><div class="iqi-source-note"><strong>${tr("Источник и лицензия", "Source and licence")}</strong><p>${tr("Radar API доступен бесплатно, требует API token и публикует данные по CC BY‑NC 4.0. Stage 12 распространяет код интерфейса и source contract, но не перераспределяет страновые значения.", "Radar API is free to access, requires an API token and publishes data under CC BY-NC 4.0. Stage 12 distributes the interface code and source contract, but not country measurements.")}</p><div><a href="${esc(payload?.source_contract?.api_documentation || "#")}" target="_blank" rel="noopener noreferrer">API reference ↗</a><a href="${esc(payload?.source_contract?.authentication?.required ? "https://developers.cloudflare.com/radar/get-started/first-request/" : "#")}" target="_blank" rel="noopener noreferrer">Token setup ↗</a></div></div></section>`;
  }

  function fullMarkup() {
    return `<div class="iqi-workspace">${hero()}${jump()}${architectureSection()}${atlasSection()}${profileSection()}${connectorSection()}${releasesSection()}${catalogueSection()}${trustSection()}</div>`;
  }

  function preserveScroll(callback, focusSelector = null) {
    const y = window.scrollY;
    callback();
    requestAnimationFrame(() => {
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
    const item = catalogue().find((candidate) => candidate.iso3 === iso3);
    if (!item?.observations_available || iso3 === selectedIso()) return;
    context?.selectCountry?.(iso3);
  }

  async function copyCommand(platform, button) {
    const command = platform === "powershell" ? payload?.connector?.powershell_command : payload?.connector?.linux_command;
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      const original = button.textContent;
      button.textContent = tr("Скопировано", "Copied");
      window.setTimeout(() => { button.textContent = original; }, 1400);
    } catch (_) {
      const pre = button.closest("article")?.querySelector("code");
      const selection = window.getSelection();
      const range = document.createRange();
      if (pre && selection) { range.selectNodeContents(pre); selection.removeAllRanges(); selection.addRange(range); }
    }
  }

  function bind() {
    const root = context?.root;
    if (!root) return;
    root.querySelectorAll("[data-iqi-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.iqiScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-iqi-metric]").forEach((button) => button.addEventListener("click", () => { ui.metric = button.dataset.iqiMetric; ui.mapMode = "value"; ui.cataloguePage = 1; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-iqi-percentile]").forEach((button) => button.addEventListener("click", () => { ui.percentile = button.dataset.iqiPercentile; ui.mapMode = "value"; ui.cataloguePage = 1; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-iqi-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.iqiMapMode; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-iqi-country]").forEach((element) => {
      const activate = () => selectCountry(element.dataset.iqiCountry);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-iqi-provenance]").forEach((button) => button.addEventListener("click", () => { const valueId = button.dataset.iqiProvenance; if (valueId) context?.openProvenance?.(valueId); }));
    root.querySelectorAll("[data-iqi-copy]").forEach((button) => button.addEventListener("click", () => copyCommand(button.dataset.iqiCopy, button)));
    root.querySelectorAll("[data-iqi-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.cataloguePage = Number(button.dataset.iqiPage || 1); preserveScroll(renderReady); document.getElementById("iqiCatalogue")?.scrollIntoView({ block: "start" }); }));
    root.querySelector("[data-iqi-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });
    const search = root.querySelector("#iqiCatalogueSearch");
    search?.addEventListener("input", () => { ui.catalogueQuery = search.value; ui.cataloguePage = 1; window.clearTimeout(search._iqiTimer); search._iqiTimer = window.setTimeout(() => preserveScroll(renderReady, "#iqiCatalogueSearch"), 90); });
    root.querySelector("#iqiCatalogueRegion")?.addEventListener("change", (event) => { ui.catalogueRegion = event.target.value; ui.cataloguePage = 1; preserveScroll(renderReady); });
    root.querySelector("#iqiCatalogueStatus")?.addEventListener("change", (event) => { ui.catalogueStatus = event.target.value; ui.cataloguePage = 1; preserveScroll(renderReady); });
  }

  function renderReady() {
    if (!context?.root || !payload) return;
    context.root.className = "view iqi-workspace-host";
    context.root.innerHTML = fullMarkup();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    const serial = ++renderSerial;
    if (!context?.root || !selectedIso()) return;
    context.root.className = "view iqi-workspace-host";
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
    if (countryCode) [...cache.keys()].filter((key) => key.startsWith(`${String(countryCode).toUpperCase()}:`)).forEach((key) => cache.delete(key));
    payload = null;
  }

  window.GIRIqiWorkspace = { render, invalidate };
})();
