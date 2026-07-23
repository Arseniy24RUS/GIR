/* GIR Digitalisation / AI — Stage 10: IMF AI Preparedness Index workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    mapMode: "score",
    methodQuery: "",
    methodLevel: "all",
    catalogueQuery: "",
    catalogueRegion: "all",
    catalogueIncome: "all",
    catalogueAvailability: "all",
    cataloguePage: 1,
    cataloguePageSize: 25,
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
  const fmt = (value, digits = 3) => finite(value)
    ? Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  const compact = (value, digits = 1) => finite(value)
    ? Number(value).toLocaleString(locale(), { maximumFractionDigits: digits })
    : "—";
  const intFmt = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const pct = (value, digits = 0) => finite(value) ? `${fmt(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const signed = (value, digits = 3) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}` : "—";
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.source_country_name || item?.iso3 || "—";
  const dimensionName = (item) => local(item) || item?.dimension_code || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}`;
  const score = () => payload?.score || {};
  const selected = () => payload?.summary?.selected || {};
  const selectedCountry = () => payload?.country || selected();
  const dimensions = () => payload?.dimensions || [];
  const dimensionByCode = (code) => dimensions().find((item) => item.dimension_code === code) || {};
  const tones = { DI: "var(--aipi-digital)", HCLMP: "var(--aipi-human)", IEI: "var(--aipi-innovation)", RE: "var(--aipi-regulation)" };

  function icon(name) {
    return `<img class="aipi-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (!item) return `<span class="aipi-flag-fallback" aria-hidden="true">—</span>`;
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="aipi-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { message = (await response.json())?.detail || message; } catch (_) { /* no json */ }
      throw new Error(message);
    }
    return response.json();
  }

  function loadPayload() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const url = `/api/aipi/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}`;
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
    return `<section class="aipi-loading" aria-live="polite"><div class="aipi-loading-orbit" aria-hidden="true"><i></i><i></i><i></i><i></i><b>AI</b></div><span>IMF · AIPI 2023</span><h1>${tr("Собирается профиль готовности экономики к ИИ", "Building the economy AI preparedness profile")}</h1><p>${tr("Загружаются 174 экономики, четыре измерения, два диагностических слоя и 42 узла методологии.", "Loading 174 economies, four dimensions, two diagnostic layers and 42 methodology nodes.")}</p></section>`;
  }

  function errorState(error) {
    return `<section class="aipi-error"><span>AIPI · ERROR</span><h1>${tr("Рабочее пространство AIPI не загрузилось", "The AIPI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="aipi-button primary" data-aipi-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function dimensionShort(code) {
    return ({
      DI: tr("Цифровая среда", "Digital"),
      HCLMP: tr("Люди и труд", "Human & labour"),
      IEI: tr("Инновации", "Innovation"),
      RE: tr("Правила и этика", "Regulation & ethics"),
    })[code] || code;
  }

  function dimensionCopy(code) {
    const values = {
      DI: ["доступная и защищённая связь, электронная коммерция и цифровое государство", "accessible and secure connectivity, e-commerce and digital government"],
      HCLMP: ["образование, цифровые навыки, мобильность труда и социальная защита", "education, digital skills, labour mobility and social protection"],
      IEI: ["исследования, технологическая зрелость и включённость в мировую экономику", "research, technological maturity and integration into the global economy"],
      RE: ["правовые рамки, способность законодательства адаптироваться и качество институтов", "legal frameworks, regulatory adaptability and institutional quality"],
    };
    const item = values[code] || ["", ""];
    return tr(item[0], item[1]);
  }

  function sectionHeading(number, eyebrow, title, copy) {
    return `<header class="aipi-section-heading"><span>${esc(number)}</span><div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }

  function orbit() {
    const value = Number(score().official_score || 0);
    const rings = dimensions().map((item, index) => `<i class="aipi-orbit-ring r${index + 1}" style="--value:${clamp(Number(item.derived_dimension_score)) * 100}%;--tone:${tones[item.dimension_code]}"><span class="sr-only">${esc(dimensionName(item))} ${pct(item.derived_dimension_score, 0)}</span></i>`).join("");
    return `<div class="aipi-aipi-orbit" role="img" aria-label="AIPI ${fmt(value, 3)}; ${tr("официального места нет", "no official rank")}">${rings}<div class="aipi-orbit-core"><small>AIPI</small><strong>${fmt(value, 3)}</strong><em>0 — 1</em></div></div>`;
  }

  function hero() {
    const idx = payload?.index || {};
    const pos = payload?.summary?.positions || {};
    const layers = payload?.layers || {};
    const profileComplete = score().score_available !== false && finite(score().official_score);
    return `<section class="aipi-hero" aria-labelledby="aipiTitle"><article class="aipi-hero-copy"><div class="aipi-neural-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="aipi-overline"><span>IMF · AIPI 2023</span><b>${tr("публикация 25 июня 2024", "published 25 June 2024")}</b><em>${tr("ревизия 23 декабря 2024", "revision 23 December 2024")}</em></div><h1 id="aipiTitle">${esc(lang() === "ru" ? idx.name_ru : idx.name_en)}</h1><p class="aipi-hero-lead">${tr("Оценка готовности экономики к внедрению ИИ по цифровой инфраструктуре, человеческому капиталу и рынку труда, инновациям и интеграции, регулированию и этике.", "An assessment of an economy’s readiness to adopt AI across digital infrastructure, human capital and labour-market policies, innovation and integration, and regulation and ethics.")}</p><div class="aipi-edition-line"><span><b>${tr("Данные", "Data")}</b> 2023</span><span><b>${tr("Охват", "Coverage")}</b> 174 ${tr("экономики", "economies")}</span><span><b>${tr("Полные профили", "Complete profiles")}</b> 165</span><span><b>${tr("Архитектура", "Architecture")}</b> 2 · 4 · 7 · 29</span></div><div class="aipi-formula-strip">${dimensions().map((item) => `<span>${esc(item.dimension_code)}<small>25%</small></span>`).join("<i>+</i>")}<em>→</em><strong>AIPI</strong></div><div class="aipi-hero-actions"><button type="button" class="aipi-button primary" data-aipi-scroll="aipiProfile">${tr("Открыть профиль", "Open profile")}</button><a class="aipi-button" href="/api/aipi/workspace.csv?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-aipi-${payload.edition}.csv">${icon("download")}${tr("Выгрузить каталог", "Download catalogue")}</a><a class="aipi-button quiet" href="${esc(payload.source?.url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">IMF DataMapper ↗</a></div><div class="aipi-correction-banner"><span>${tr("ДИАГНОСТИКА, А НЕ ОФИЦИАЛЬНЫЙ РЕЙТИНГ", "DIAGNOSTIC, NOT AN OFFICIAL RANKING")}</span><p>${tr("GIR сохраняет официальные значения МВФ, но не превращает сортировку по score в место страны. Все позиции и сценарные разрывы ниже обозначены как аналитика GIR.", "GIR preserves official IMF values but does not turn score sorting into a country rank. Every position and scenario gap below is labelled as GIR analysis.")}</p></div></article><aside class="aipi-command-card"><header><div>${flag(selectedCountry())}<span><strong>${esc(countryName(selectedCountry()))}</strong><small>${esc(selectedCountry().iso3)} · ${esc(selected().platform_region || "—")}</small></span></div><mark><i></i>${profileComplete ? tr("официальный score", "official score") : tr("официальный N/A", "official N/A")}</mark></header><div class="aipi-score-core">${orbit()}<span class="aipi-no-rank-chip">${tr("ОФИЦИАЛЬНОГО МЕСТА НЕТ", "NO OFFICIAL COUNTRY RANK")}</span></div><div class="aipi-command-grid"><div><span>${tr("Порядок GIR", "GIR order")}</span><strong>${profileComplete ? `#${intFmt(pos.global_navigation)}` : "N/A"}</strong><small>${tr("только навигация", "navigation only")}</small></div><div><span>${tr("Процентиль GIR", "GIR percentile")}</span><strong>${profileComplete ? `${compact(score().gir_percentile, 0)}%` : "N/A"}</strong><small>${tr("не показатель МВФ", "not an IMF indicator")}</small></div><div><span>${tr("В регионе", "Within region")}</span><strong>${profileComplete ? `${intFmt(pos.region_navigation)} / ${intFmt(pos.region_complete_universe)}` : "N/A"}</strong><small>${esc(selected().platform_region || "—")}</small></div><div><span>${tr("Баланс слоёв", "Layer balance")}</span><strong>${finite(layers.layer_balance) ? pct(layers.layer_balance, 0) : "N/A"}</strong><small>${tr("диагностика GIR", "GIR diagnostic")}</small></div></div><button type="button" class="aipi-evidence-link" data-aipi-provenance="${esc(score().value_id || "")}">${tr("Открыть доказательную запись", "Open evidence record")} <span>↗</span></button></aside></section>`;
  }

  function jump() {
    const items = [
      ["aipiProfile", "01", tr("Профиль", "Profile")],
      ["aipiAtlas", "02", tr("Атлас", "Atlas")],
      ["aipiLayers", "03", tr("Два слоя", "Two layers")],
      ["aipiBridge", "04", tr("Траектория", "Bridge")],
      ["aipiRevision", "05", tr("Ревизия", "Revision")],
      ["aipiMethod", "06", tr("Методика", "Method")],
      ["aipiCatalogue", "07", tr("Каталог", "Catalogue")],
      ["aipiTrust", "08", tr("Доверие", "Trust")],
    ];
    return `<nav class="aipi-jump" aria-label="${tr("Навигация AIPI", "AIPI navigation")}"><span>AIPI / 2023</span>${items.map(([id, n, label]) => `<button type="button" data-aipi-scroll="${id}"><i>${n}</i>${esc(label)}</button>`).join("")}</nav>`;
  }

  function radar() {
    const items = dimensions();
    const center = 150, radius = 112;
    const pointsFor = (getter) => items.map((item, index) => {
      const angle = (-90 + index * 90) * Math.PI / 180;
      const value = clamp(getter(item));
      return `${(center + Math.cos(angle) * radius * value).toFixed(1)},${(center + Math.sin(angle) * radius * value).toFixed(1)}`;
    }).join(" ");
    const selectedPoints = pointsFor((item) => item.derived_dimension_score);
    const worldPoints = pointsFor((item) => item.benchmarks?.global?.mean ?? 0);
    const axes = items.map((item, index) => {
      const angle = (-90 + index * 90) * Math.PI / 180;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const lx = center + Math.cos(angle) * (radius + 29);
      const ly = center + Math.sin(angle) * (radius + 29);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}"></line><text x="${lx}" y="${ly}" text-anchor="middle">${esc(item.dimension_code)}</text>`;
    }).join("");
    return `<svg class="aipi-radar" viewBox="0 0 300 300" role="img" aria-label="${tr("Профиль четырёх измерений AIPI", "Four-dimension AIPI profile")}"><polygon class="grid g1" points="150,38 262,150 150,262 38,150"></polygon><polygon class="grid g2" points="150,66 234,150 150,234 66,150"></polygon><polygon class="grid g3" points="150,94 206,150 150,206 94,150"></polygon>${axes}<polygon class="world" points="${worldPoints}"></polygon><polygon class="selected" points="${selectedPoints}"></polygon>${items.map((item, index) => { const angle=(-90+index*90)*Math.PI/180; const v=clamp(item.derived_dimension_score); return `<circle cx="${(center+Math.cos(angle)*radius*v).toFixed(1)}" cy="${(center+Math.sin(angle)*radius*v).toFixed(1)}" r="4" style="--tone:${tones[item.dimension_code]}"><title>${esc(dimensionName(item))}: ${fmt(item.derived_dimension_score,3)}</title></circle>`; }).join("")}</svg>`;
  }

  function dimensionPulse(item, index) {
    const value = item.derived_dimension_score;
    const selectedValue = finite(value) ? Number(value) : null;
    const global = payload?.summary?.peers?.global?.mean;
    return `<article class="aipi-pulse p${index + 1}" style="--tone:${tones[item.dimension_code]}"><header><span>0${index + 1} · ${esc(item.dimension_code)}</span><button type="button" data-aipi-provenance="${esc(item.value_id || "")}" aria-label="${tr("Открыть происхождение", "Open provenance")}">↗</button></header><div class="aipi-pulse-score" style="--v:${clamp(selectedValue) * 100}%"><strong>${selectedValue == null ? "N/A" : fmt(selectedValue, 3)}</strong><i></i></div><h3>${esc(dimensionName(item))}</h3><p>${esc(dimensionCopy(item.dimension_code))}</p><footer><span>${tr("Вклад", "Contribution")} <b>${fmt(item.official_contribution, 3)}</b></span><span>${tr("Вес", "Weight")} <b>25%</b></span><em>${selectedValue == null ? tr("официальный N/A", "official N/A") : signed(selectedValue - Number(global || 0), 3)}</em></footer></article>`;
  }

  function profileSection() {
    const peers = payload?.summary?.peers || {};
    return `<section class="aipi-section" id="aipiProfile">${sectionHeading("01", tr("Профиль готовности", "Readiness profile"), tr("Четыре равновзвешенных измерения — без псевдоранга", "Four equally weighted dimensions — without a pseudo-rank"), tr("Машиночитаемый набор публикует вклад каждого измерения на шкале 0–0,25. GIR отдельно показывает восстановленную шкалу 0–1 и всегда помечает её как производное представление.", "The machine-readable release publishes each dimension contribution on a 0–0.25 scale. GIR separately shows the reconstructed 0–1 scale and always labels it as a derived representation."))}<div class="aipi-profile-layout"><article class="aipi-radar-card"><header><span>READINESS COMPASS · 4 × 25%</span><h3>${tr("Структура готовности", "Preparedness structure")}</h3></header>${radar()}<footer><span><i class="selected"></i>${tr("Выбранная экономика", "Selected economy")}</span><span><i class="world"></i>${tr("Среднее мира", "Global mean")}</span></footer></article><aside class="aipi-benchmark-card"><header><span>PEERS · GIR DIAGNOSTICS</span><h3>${tr("Контрольные группы", "Peer benchmarks")}</h3><p>${tr("Средние вычислены GIR из официальных значений AIPI и не являются отдельными показателями МВФ.", "Means are calculated by GIR from official AIPI values and are not separate IMF indicators.")}</p></header>${[[tr("Мир", "Global"), peers.global],[selected().platform_region, peers.region],[selected().platform_income_group, peers.income_group],[tr("Верхний квартиль", "Upper quartile"), peers.upper_quartile]].map(([label, block]) => `<article><div><strong>${esc(label || "—")}</strong><small>${intFmt(block?.count)} ${tr("профилей", "profiles")}</small></div><b>${fmt(block?.mean,3)}</b><em class="${Number(block?.selected_gap)>0 ? "positive" : Number(block?.selected_gap)<0 ? "negative" : "neutral"}">${signed(block?.selected_gap,3)}</em><i style="--v:${clamp(block?.mean)*100}%"></i></article>`).join("")}</aside></div><div class="aipi-pulse-grid">${dimensions().map(dimensionPulse).join("")}</div></section>`;
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

  function mapValue(item) {
    if (!item) return null;
    if (ui.mapMode === "score") return item.official_score;
    if (ui.mapMode === "foundational") return item.layers?.foundational_readiness;
    if (ui.mapMode === "second_generation") return item.layers?.second_generation_readiness;
    return item.profile_status === "complete" ? 1 : 0;
  }

  function mapTone(item) {
    if (!item) return "no-data";
    if (ui.mapMode === "availability") return item.profile_status === "complete" ? "score-6" : "score-1";
    const value = Number(mapValue(item));
    if (!finite(value)) return "no-data";
    if (value >= .72) return "score-6";
    if (value >= .60) return "score-5";
    if (value >= .48) return "score-4";
    if (value >= .36) return "score-3";
    if (value >= .24) return "score-2";
    return "score-1";
  }

  function worldMap() {
    if (!geo?.features) return `<div class="aipi-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const byIso = new Map((payload?.map?.economies || []).map((item) => [item.iso3, item]));
    const width = 980, height = 440;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    return `<svg class="aipi-world-map" viewBox="0 0 ${width} ${height}" role="group" aria-label="${tr("Карта готовности к внедрению ИИ", "AI adoption preparedness map")}">${features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = byIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const value = mapValue(item);
      const text = item ? (finite(value) ? fmt(value,3) : "N/A") : tr("нет данных", "no data");
      return `<path class="aipi-map-country ${mapTone(item)}${ui.mapMode === "availability" && item?.profile_status === "incomplete" ? " availability-na" : ""}${iso3 === selectedIso() ? " selected" : ""}" d="${d}" data-aipi-country="${esc(iso3)}" tabindex="${item ? "0" : "-1"}" role="${item ? "button" : "img"}" aria-label="${esc(name)} · ${esc(text)}"><title>${esc(name)} · ${esc(text)}</title></path>`;
    }).join("")}</svg>`;
  }

  function mapLegend() {
    if (ui.mapMode === "availability") return [["score-1",tr("Официальный N/A","Official N/A")],["score-6",tr("Score доступен","Score available")]].map(([tone,label])=>`<span class="${tone}"><i></i>${label}</span>`).join("");
    return [["score-1","0–0.239"],["score-2","0.240–0.359"],["score-3","0.360–0.479"],["score-4","0.480–0.599"],["score-5","0.600–0.719"],["score-6","0.720–1.000"]].map(([tone,label])=>`<span class="${tone}"><i></i>${label}</span>`).join("");
  }

  function regionCards() {
    return `<div class="aipi-region-list">${(payload?.regional_landscape || []).map((item,index)=>`<article><span>${String(index+1).padStart(2,"0")}</span><div><strong>${esc(item.region)}</strong><small>${intFmt(item.complete)} / ${intFmt(item.economies)} ${tr("со score", "scored")} · ${intFmt(item.unavailable)} N/A</small></div><b>${fmt(item.mean,3)}</b><button type="button" data-aipi-country="${esc(item.leader?.iso3 || "")}" aria-label="${tr("Открыть лидера региона", "Open regional leader")}">${flag(item.leader)}<em>${fmt(item.leader?.official_score,3)}</em></button></article>`).join("")}</div>`;
  }

  function atlasSection() {
    const modeLabel = ({score:"AIPI",foundational:tr("Базовая готовность","Foundational readiness"),second_generation:tr("Готовность 2-го поколения","Second-generation readiness"),availability:tr("Доступность после ревизии","Availability after revision")})[ui.mapMode];
    return `<section class="aipi-section" id="aipiAtlas">${sectionHeading("02", tr("Глобальный атлас", "Global atlas"), tr("174 экономики без псевдоранга", "174 economies without a pseudo-rank"), tr("Карта переключается между официальным score, двумя производными слоями GIR и статусом доступности после ревизии.", "The map switches between the official score, two GIR-derived layers and post-revision availability status."))}<div class="aipi-atlas-layout"><article class="aipi-map-card"><header><div><span>${tr("Слой карты", "Map layer")}</span><strong>${esc(modeLabel)}</strong></div><div class="aipi-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode==="score"?"active":""}" data-aipi-map-mode="score">AIPI</button><button type="button" class="${ui.mapMode==="foundational"?"active":""}" data-aipi-map-mode="foundational">${tr("Фундамент", "Foundation")}</button><button type="button" class="${ui.mapMode==="second_generation"?"active":""}" data-aipi-map-mode="second_generation">${tr("2-е поколение", "2nd generation")}</button><button type="button" class="${ui.mapMode==="availability"?"active":""}" data-aipi-map-mode="availability">N/A</button></div></header><div class="aipi-map-stage">${worldMap()}</div><div class="aipi-map-legend">${mapLegend()}</div></article><aside class="aipi-region-card"><header><span>REGIONS · GIR DIAGNOSTICS</span><h3>${tr("Региональный ландшафт", "Regional landscape")}</h3><p>${tr("Средние и позиции рассчитаны GIR из официальных наблюдений и не являются рейтингом МВФ.", "Means and positions are calculated by GIR from official observations and are not an IMF ranking.")}</p></header>${regionCards()}</aside></div></section>`;
  }

  function layerCard(kind) {
    const isFound = kind === "foundational";
    const codes = isFound ? ["DI","HCLMP"] : ["IEI","RE"];
    const value = isFound ? payload?.layers?.foundational_readiness : payload?.layers?.second_generation_readiness;
    const title = isFound ? tr("Базовая готовность", "Foundational readiness") : tr("Готовность второго поколения", "Second-generation readiness");
    const copy = isFound ? tr("Инфраструктура и человеческий капитал определяют способность экономики массово использовать ИИ.", "Infrastructure and human capital determine whether an economy can adopt AI at scale.") : tr("Инновационная система, интеграция, регулирование и этика определяют качество следующей волны внедрения.", "Innovation, integration, regulation and ethics shape the quality of the next adoption wave.");
    return `<article class="aipi-layer-card"><header><span>${isFound?"FOUNDATIONAL":"SECOND-GENERATION"} · GIR</span><span>${tr("не показатель МВФ", "not an IMF indicator")}</span></header><h3>${esc(title)}</h3><p>${esc(copy)}</p><div class="aipi-layer-score"><strong>${finite(value)?fmt(value,3):"N/A"}</strong><span>0 — 1<br>${tr("среднее двух измерений", "mean of two dimensions")}</span></div><div class="aipi-layer-bars">${codes.map(code=>{const item=dimensionByCode(code);return `<div class="aipi-layer-bar"><span>${esc(dimensionShort(code))}</span><i style="--value:${clamp(item.derived_dimension_score)*100}%;--tone:${tones[code]}"></i><b>${finite(item.derived_dimension_score)?fmt(item.derived_dimension_score,3):"N/A"}</b></div>`;}).join("")}</div></article>`;
  }

  function layersSection() {
    return `<section class="aipi-section" id="aipiLayers">${sectionHeading("03", tr("Два слоя готовности", "Two readiness layers"), tr("От цифрового фундамента — к инновациям, регулированию и этике", "From the digital foundation to innovation, regulation and ethics"), tr("Группировка следует концептуальной логике методологии AIPI. Значения слоёв рассчитывает GIR как среднее соответствующих официальных измерений; это не новые индексы МВФ.", "The grouping follows the conceptual logic of the AIPI methodology. GIR calculates each layer as the mean of the relevant official dimensions; these are not new IMF indices."))}<div class="aipi-layer-grid">${layerCard("foundational")}${layerCard("second_generation")}</div></section>`;
  }

  function bridgeSection() {
    const bridge = payload?.bridge || {};
    const reference = bridge.reference || {};
    const available = bridge.available;
    const gaps = bridge.dimension_gaps || [];
    return `<section class="aipi-section" id="aipiBridge">${sectionHeading("04", tr("Траектория готовности", "Readiness bridge"), tr("Следующий сопоставимый рубеж — без прогноза и без рекомендации МВФ", "The next comparable threshold — without an IMF forecast or recommendation"), tr("Bridge показывает диагностический разрыв до границы верхнего квартиля или ближайшего более сильного peer-профиля. Он не моделирует причинность и не обещает изменение score.", "The bridge shows a diagnostic gap to the upper-quartile boundary or the nearest stronger peer profile. It does not model causality or promise a score change."))}<div class="aipi-bridge-layout"><article class="aipi-bridge-card"><header><div><span>READINESS BRIDGE · GIR</span><h3>${available ? tr("От текущего профиля к контрольной границе", "From the current profile to a reference boundary") : tr("Траектория недоступна для неполного профиля", "The bridge is unavailable for an incomplete profile")}</h3></div><span class="aipi-revision-badge">${available ? tr("СЦЕНАРИЙ GIR", "GIR SCENARIO") : tr("ОФИЦИАЛЬНЫЙ N/A", "OFFICIAL N/A")}</span></header>${available?`<div class="aipi-bridge-score"><div class="aipi-bridge-node">${flag(selected())}<strong>${fmt(selected().official_score,3)}</strong><small>${esc(countryName(selected()))}</small></div><div class="aipi-bridge-arrow">→</div><div class="aipi-bridge-node">${flag(reference)}<strong>${fmt(reference.official_score,3)}</strong><small>${esc(countryName(reference))}</small></div></div><div class="aipi-gap-list">${gaps.map((item,index)=>`<article><span>0${index+1}</span><div><strong>${esc(dimensionShort(item.dimension_code))}</strong><small>${fmt(item.selected,3)} → ${fmt(item.reference,3)}</small></div><b>${finite(item.gap)?signed(item.gap,3):"N/A"}</b></article>`).join("")}</div>`:`<div class="aipi-empty-state"><strong>${tr("Сначала нужен полный официальный профиль", "A complete official profile is required first")}</strong><p>${tr(`Отсутствует измерение: ${(bridge.missing_dimensions||[]).join(", ") || "—"}. GIR не выполняет импутацию.`, `Missing dimension: ${(bridge.missing_dimensions||[]).join(", ") || "—"}. GIR does not impute it.`)}</p></div>`}</article><aside class="aipi-revision-card"><header><div><span>REVISION · 2024-12-23</span><h3>${tr("Девять официальных N/A", "Nine official N/A profiles")}</h3></div><mark>${intFmt(payload?.revision_lab?.count)}</mark></header><p>${tr("После ревизии один компонент и общий AIPI отсутствуют для девяти экономик. Нули, средние и прогнозные подстановки запрещены.", "After revision, one component and overall AIPI are unavailable for nine economies. Zeroes, means and forecast substitutions are prohibited.")}</p><div class="aipi-revision-list">${(payload?.revision_lab?.cases || []).map(item=>`<button type="button" data-aipi-country="${esc(item.iso3)}"><span>${flag(item)}</span><span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)} · ${esc(item.platform_region || "—")}</small></span><mark>${esc(item.revised_missing_dimension || (item.missing_dimensions||[]).join(","))}</mark></button>`).join("")}</div></aside></div></section>`;
  }

  function revisionSection() {
    const cases = payload?.revision_lab?.cases || [];
    return `<section class="aipi-section" id="aipiRevision">${sectionHeading("05", tr("Лаборатория ревизии", "Revision lab"), tr("Что именно означает N/A — и почему его нельзя заменять нулём", "What N/A actually means — and why it cannot be replaced by zero"), tr("Для каждого затронутого профиля сохранены доступные официальные компоненты, отсутствующее измерение и provenance. Общий score остаётся NULL.", "For every affected profile, GIR preserves the available official components, the missing dimension and provenance. The overall score remains NULL."))}<div class="aipi-revision-matrix">${cases.map(item=>`<article class="${item.iso3===selectedIso()?"selected":""}"><header><button type="button" data-aipi-country="${esc(item.iso3)}">${flag(item)}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)}</small></span></button><mark>AIPI · N/A</mark></header><div>${["DI","HCLMP","IEI","RE"].map(code=>{const d=item.dimensions?.[code]||{};return `<span class="${d.available?"available":"missing"}"><b>${esc(code)}</b><i style="--v:${clamp(d.derived_dimension_score)*100}%;--tone:${tones[code]}"></i><em>${d.available?fmt(d.derived_dimension_score,3):"N/A"}</em></span>`;}).join("")}</div><footer><span>${tr("Отсутствует", "Missing")}</span><strong>${esc(item.revised_missing_dimension || "—")}</strong><button type="button" data-aipi-provenance="${esc(item.value_id || "")}">↗</button></footer></article>`).join("")}</div></section>`;
  }

  function methodologyRows() {
    const query = ui.methodQuery.trim().toLowerCase();
    return (payload?.methodology_explorer?.flat || []).filter(item => {
      if (ui.methodLevel !== "all" && item.level !== ui.methodLevel) return false;
      if (!query) return true;
      return `${item.dimension_code} ${item.name_ru} ${item.name_en} ${item.source_agency || ""}`.toLowerCase().includes(query);
    });
  }

  function methodologySection() {
    const rows = methodologyRows();
    const counts = payload?.methodology_explorer?.counts || {};
    return `<section class="aipi-section" id="aipiMethod">${sectionHeading("06", tr("Методологический explorer", "Methodology explorer"), tr("2 поколения → 4 измерения → 7 доменов → 29 субиндикаторов", "2 generations → 4 dimensions → 7 domains → 29 subindicators"), tr("Страновые значения опубликованы только для четырёх измерений. Нижние уровни представлены как определения методологии и не получают вымышленных баллов.", "Country values are published only for the four dimensions. Lower levels are shown as methodology definitions and never receive invented scores."))}<div class="aipi-method-toolbar"><label class="aipi-search">${icon("search")}<input id="aipiMethodSearch" type="search" value="${esc(ui.methodQuery)}" placeholder="${tr("Код, название, источник…", "Code, name, source…")}"></label><label class="aipi-select"><span>${tr("Уровень", "Level")}</span><select id="aipiMethodLevel"><option value="all">${tr("Все 42 узла", "All 42 nodes")}</option>${[["generation",tr("Поколения", "Generations")],["dimension",tr("Измерения", "Dimensions")],["domain",tr("Домены", "Domains")],["indicator",tr("Субиндикаторы", "Subindicators")]].map(([value,label])=>`<option value="${value}" ${ui.methodLevel===value?"selected":""}>${esc(label)}</option>`).join("")}</select></label></div><div class="aipi-method-summary"><span>2 ${tr("слоя", "layers")}</span><span>${intFmt(counts.dimensions)} ${tr("измерения", "dimensions")}</span><span>${intFmt(counts.domains)} ${tr("доменов", "domains")}</span><span>${intFmt(counts.indicators)} ${tr("субиндикаторов", "subindicators")}</span><strong>${intFmt(rows.length)} ${tr("показано", "shown")}</strong></div><div class="aipi-method-tree">${rows.map(item=>{const depth=({generation:0,dimension:1,domain:2,indicator:3})[item.level]||0; const value=item.derived_dimension_score; const status=item.level==="dimension"?(item.country_value_available?tr("официальный вклад / производная шкала", "official contribution / derived scale"):tr("официальный N/A", "official N/A")):item.level==="generation"?(finite(value)?tr("слой GIR", "GIR layer"):"N/A"):tr("значение страны не опубликовано", "country value not published"); return `<article class="aipi-method-row" data-level="${esc(item.level)}" style="--depth:${depth}"><code>${esc(item.dimension_code)}</code><div class="aipi-method-name"><strong>${esc(dimensionName(item))}</strong><small>${esc(item.source_agency || "IMF")} · ${esc(item.level)}</small></div><div class="aipi-method-value"><strong class="${!finite(value)&&item.level==="dimension"?"aipi-status-na":item.level==="generation"?"aipi-status-derived":""}">${finite(value)?fmt(value,3):"—"}</strong><small>${esc(status)}</small></div><span>${finite(item.weight_index)?pct(item.weight_index,0):finite(item.weight_within_dimension)?pct(item.weight_within_dimension,0):"—"}</span><button type="button" data-aipi-provenance="${esc(item.value_id || score().value_id || "")}" aria-label="${tr("Открыть источник", "Open source")}">↗</button></article>`;}).join("") || `<div class="aipi-empty-state">${tr("Ничего не найдено", "No matching nodes")}</div>`}</div></section>`;
  }

  function filteredCatalogue() {
    const query = ui.catalogueQuery.trim().toLowerCase();
    return (payload?.catalogue?.countries || []).filter(item => {
      if (ui.catalogueRegion !== "all" && item.platform_region !== ui.catalogueRegion) return false;
      if (ui.catalogueIncome !== "all" && item.platform_income_group !== ui.catalogueIncome) return false;
      if (ui.catalogueAvailability !== "all" && item.profile_status !== ui.catalogueAvailability) return false;
      if (!query) return true;
      return `${item.iso3} ${item.name_ru} ${item.name_en} ${item.source_country_name}`.toLowerCase().includes(query);
    });
  }

  function miniFour(item) {
    return `<div class="aipi-mini-four" aria-label="${tr("Четыре измерения", "Four dimensions")}">${["DI","HCLMP","IEI","RE"].map(code=>`<i style="--v:${clamp(item.dimensions?.[code]?.derived_dimension_score)*100}%;--tone:${tones[code]}"><title>${esc(code)}: ${finite(item.dimensions?.[code]?.derived_dimension_score)?fmt(item.dimensions[code].derived_dimension_score,3):"N/A"}</title></i>`).join("")}</div>`;
  }

  function catalogueSection() {
    const items = filteredCatalogue();
    const pages = Math.max(1, Math.ceil(items.length / ui.cataloguePageSize));
    ui.cataloguePage = Math.min(ui.cataloguePage, pages);
    const start = (ui.cataloguePage - 1) * ui.cataloguePageSize;
    const page = items.slice(start, start + ui.cataloguePageSize);
    return `<section class="aipi-section" id="aipiCatalogue">${sectionHeading("07", tr("Каталог экономик", "Economy catalogue"), tr("174 профиля, официальный score и ни одного выдуманного места", "174 profiles, official scores and not one invented rank"), tr("Таблица использует score-сортировку только для навигации. Поле official_rank остаётся пустым в API и CSV.", "The table uses score ordering only for navigation. The official_rank field remains empty in both API and CSV."))}<div class="aipi-ranking-tools"><label class="aipi-search">${icon("search")}<input id="aipiCatalogueSearch" type="search" value="${esc(ui.catalogueQuery)}" placeholder="${tr("Страна или ISO3…", "Country or ISO3…")}"></label><label class="aipi-select"><span>${tr("Регион", "Region")}</span><select id="aipiCatalogueRegion"><option value="all">${tr("Все регионы", "All regions")}</option>${(payload?.catalogue?.regions||[]).map(value=>`<option value="${esc(value)}" ${ui.catalogueRegion===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label class="aipi-select"><span>${tr("Доход", "Income")}</span><select id="aipiCatalogueIncome"><option value="all">${tr("Все группы", "All groups")}</option>${(payload?.catalogue?.income_groups||[]).map(value=>`<option value="${esc(value)}" ${ui.catalogueIncome===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label><label class="aipi-select"><span>${tr("Доступность", "Availability")}</span><select id="aipiCatalogueAvailability"><option value="all">${tr("Все 174", "All 174")}</option><option value="complete" ${ui.catalogueAvailability==="complete"?"selected":""}>${tr("165 со score", "165 scored")}</option><option value="incomplete" ${ui.catalogueAvailability==="incomplete"?"selected":""}>${tr("9 официальных N/A", "9 official N/A")}</option></select></label></div><div class="aipi-catalogue-note"><b>${tr("НЕТ ОФИЦИАЛЬНОГО РЕЙТИНГА", "NO OFFICIAL RANKING")}</b><span>${tr("Порядок GIR используется только для перемещения по полным профилям.", "GIR order is used only to navigate complete profiles.")}</span></div><div class="aipi-ranking-table-wrap"><table class="aipi-ranking-table aipi-catalogue-table"><thead><tr><th>${tr("Порядок GIR", "GIR order")}</th><th>${tr("Экономика", "Economy")}</th><th>AIPI</th><th>${tr("4 измерения", "4 dimensions")}</th><th>${tr("Два слоя GIR", "Two GIR layers")}</th><th>${tr("Регион / доход", "Region / income")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${page.map(item=>`<tr class="${item.iso3===selectedIso()?"selected":""} ${item.profile_status==="incomplete"?"availability-na":""}"><td><strong>${finite(item.gir_display_order)?`#${intFmt(item.gir_display_order)}`:"N/A"}</strong><small>${tr("не официально", "not official")}</small></td><td><button type="button" class="aipi-country-cell" data-aipi-country="${esc(item.iso3)}">${flag(item)}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)}</small></span></button></td><td><strong class="${finite(item.official_score)?"":"score-na"}">${finite(item.official_score)?fmt(item.official_score,3):"N/A"}</strong><small>${finite(item.official_score)?tr("официальный score", "official score"):tr("официальный пропуск", "official missing")}</small></td><td>${miniFour(item)}</td><td><span>F ${finite(item.layers?.foundational_readiness)?fmt(item.layers.foundational_readiness,2):"N/A"}</span><small>2G ${finite(item.layers?.second_generation_readiness)?fmt(item.layers.second_generation_readiness,2):"N/A"}</small></td><td><span>${esc(item.platform_region || "—")}</span><small>${esc(item.platform_income_group || "—")}</small></td><td><button type="button" class="aipi-row-evidence" data-aipi-provenance="${esc(item.value_id || "")}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></td></tr>`).join("")}</tbody></table></div><footer class="aipi-ranking-footer"><span>${intFmt(start+1)}–${intFmt(Math.min(start+page.length,items.length))} / ${intFmt(items.length)}</span><div><button type="button" data-aipi-page="${ui.cataloguePage-1}" ${ui.cataloguePage<=1?"disabled":""}>←</button><strong>${intFmt(ui.cataloguePage)} / ${intFmt(pages)}</strong><button type="button" data-aipi-page="${ui.cataloguePage+1}" ${ui.cataloguePage>=pages?"disabled":""}>→</button></div></footer></section>`;
  }

  function trustSection() {
    const audit = payload?.audit || {};
    const formula = payload?.formula || {};
    return `<section class="aipi-section" id="aipiTrust">${sectionHeading("08", tr("Методология и доверие", "Methodology and trust"), tr("Официальное значение, производная диагностика и N/A имеют разные статусы", "Official value, derived diagnostic and N/A have different statuses"), tr("Каждая опубликованная величина сохраняет source ID, SHA‑256 снимка, transformation run и версию формулы.", "Every published value preserves its source ID, snapshot SHA‑256, transformation run and formula version."))}<div class="aipi-method-grid">${[["globe-2",tr("Официальный охват", "Official coverage"),"174",tr("экономики в наборе", "economies in the dataset")],["boxes",tr("Архитектура", "Architecture"),"2 · 4 · 7 · 29",tr("42 узла методологии", "42 methodology nodes")],["database",tr("Опубликованные значения", "Published values"),"687",tr("компонентных вкладов", "component contributions")],["clipboard-check",tr("Проверка формулы", "Formula check"),audit.validation_passed?"PASS":"CHECK",tr("без импутации", "without imputation")]].map(([ico,title,value,copy])=>`<article>${icon(ico)}<span>${esc(title)}</span><strong>${esc(value)}</strong><p>${esc(copy)}</p></article>`).join("")}</div><div class="aipi-trust-layout"><article class="aipi-formula-card"><header><span>FORMULA · AIPI 2023</span><h3>${tr("Четыре равных вклада", "Four equal contributions")}</h3></header><div class="aipi-formula-big"><span>DI<small>25%</small></span><i>+</i><span>HCLMP<small>25%</small></span><i>+</i><span>IEI<small>25%</small></span><i>+</i><span>RE<small>25%</small></span><em>=</em><strong>AIPI</strong></div><p>${esc(lang()==="ru"?formula.formula_text_ru:formula.formula_text_en)}</p><small>${esc(lang()==="ru"?formula.method_notes_ru:formula.method_notes_en)}</small></article><article class="aipi-chain-card"><header><span>PROVENANCE · OFFICIAL VALUES</span><h3>${tr("Доказательная цепочка", "Evidence chain")}</h3></header><ol><li><b>01</b><span>IMF · AIPI 2023</span></li><li><b>02</b><span>SHA‑256 · ${esc(String(score().raw_snapshot_sha256||"").slice(0,22))}…</span></li><li><b>03</b><span>${tr("Официальный score и четыре вклада", "Official score and four contributions")}</span></li><li><b>04</b><span>${tr("Производные слои GIR — отдельно", "GIR-derived layers — separate")}</span></li></ol><button type="button" class="aipi-button primary" data-aipi-provenance="${esc(score().value_id || "")}">${tr("Проверить выбранное значение", "Inspect selected value")}</button></article></div><div class="aipi-policy-note"><strong>${tr("Политика научной маркировки", "Scientific labelling policy")}</strong><p>${esc(lang()==="ru"?payload?.methodology?.warning_ru:payload?.methodology?.warning_en)}</p><a href="${esc(payload.source?.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Открыть официальный источник МВФ", "Open the official IMF source")} ↗</a></div></section>`;
  }

  function fullMarkup() {
    return `<div class="aipi-workspace">${hero()}${jump()}${profileSection()}${atlasSection()}${layersSection()}${bridgeSection()}${revisionSection()}${methodologySection()}${catalogueSection()}${trustSection()}</div>`;
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
    if (!iso3 || iso3 === selectedIso()) return;
    context?.selectCountry?.(iso3);
  }

  function bind() {
    const root = context?.root;
    if (!root) return;
    root.querySelectorAll("[data-aipi-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.aipiScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-aipi-country]").forEach((element) => {
      const activate = () => selectCountry(element.dataset.aipiCountry);
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-aipi-provenance]").forEach((button) => button.addEventListener("click", () => { const valueId = button.dataset.aipiProvenance; if (valueId) context?.openProvenance?.(valueId); }));
    root.querySelectorAll("[data-aipi-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.aipiMapMode; preserveScroll(renderReady); }));
    root.querySelectorAll("[data-aipi-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; ui.cataloguePage = Number(button.dataset.aipiPage || 1); preserveScroll(renderReady); document.getElementById("aipiCatalogue")?.scrollIntoView({ block: "start" }); }));
    root.querySelector("[data-aipi-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });
    const methodSearch = root.querySelector("#aipiMethodSearch");
    methodSearch?.addEventListener("input", () => { ui.methodQuery = methodSearch.value; window.clearTimeout(methodSearch._aipiTimer); methodSearch._aipiTimer = window.setTimeout(() => preserveScroll(renderReady, "#aipiMethodSearch"), 90); });
    root.querySelector("#aipiMethodLevel")?.addEventListener("change", (event) => { ui.methodLevel = event.target.value; preserveScroll(renderReady); });
    const catalogueSearch = root.querySelector("#aipiCatalogueSearch");
    catalogueSearch?.addEventListener("input", () => { ui.catalogueQuery = catalogueSearch.value; ui.cataloguePage = 1; window.clearTimeout(catalogueSearch._aipiTimer); catalogueSearch._aipiTimer = window.setTimeout(() => preserveScroll(renderReady, "#aipiCatalogueSearch"), 90); });
    [["#aipiCatalogueRegion","catalogueRegion"],["#aipiCatalogueIncome","catalogueIncome"],["#aipiCatalogueAvailability","catalogueAvailability"]].forEach(([selector,key]) => root.querySelector(selector)?.addEventListener("change", (event) => { ui[key]=event.target.value; ui.cataloguePage=1; preserveScroll(renderReady); }));
  }

  function renderReady() {
    if (!context?.root || !payload) return;
    context.root.className = "view aipi-workspace-host";
    context.root.innerHTML = fullMarkup();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    const serial = ++renderSerial;
    if (!context?.root || !selectedIso()) return;
    context.root.className = "view aipi-workspace-host";
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

  window.GIRAipiWorkspace = { render, invalidate };
})();
