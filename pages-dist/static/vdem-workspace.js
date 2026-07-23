/* GIR Governance Observatory — V-Dem Democracy Indices workspace. */
(() => {
  "use strict";

  const DIMENSIONS = Object.freeze(["EDI", "LDI", "PDI", "DDI", "EGDI"]);
  const WINDOWS = Object.freeze([1789, 1900, 1945, 1990, 2000]);
  const cache = new Map();
  const pending = new Map();
  let context = null;
  let payload = null;
  let polities = null;
  let geoData = null;
  let geoPromise = null;
  let renderSerial = 0;
  let searchTimer = null;
  const ui = { rankingQuery: "", rankingPage: 1, pageSize: 25, polityQuery: "", polityMode: "all", timelineStart: 1789 };

  const tr = (ru, en) => context?.lang === "en" ? en : ru;
  const esc = (value) => context?.escapeHtml ? context.escapeHtml(value) : String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const locale = () => context?.lang === "en" ? "en-US" : "ru-RU";
  const fmt = (value, digits = 3) => finite(value) == null ? "—" : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const intFmt = (value) => finite(value) == null ? "—" : Math.round(Number(value)).toLocaleString(locale());
  const scorePct = (value) => clamp(value) * 100;
  const selectedDimension = () => String(payload?.selected_dimension || context?.dimension || "EDI").toUpperCase();
  const effectiveYear = () => Number(payload?.value_year || context?.year || 2025);
  const observation = () => payload?.observation || {};
  const country = () => payload?.country || { iso3: context?.country || "", name_ru: context?.country || "", name_en: context?.country || "" };
  const localName = (item) => context?.lang === "en" ? (item?.name_en || item?.vdem_country_name || item?.iso3 || "") : (item?.name_ru || item?.name_en || item?.vdem_country_name || item?.iso3 || "");
  const meta = (code = selectedDimension()) => (payload?.dimension_metadata || []).find((item) => item.code === code) || { code, name_ru: code, name_en: code, short_ru: code, short_en: code, description_ru: "", description_en: "" };
  const dimName = (code, short = false) => { const item = meta(code); return context?.lang === "en" ? (short ? item.short_en : item.name_en) : (short ? item.short_ru : item.name_ru); };
  const dimDescription = (code) => { const item = meta(code); return context?.lang === "en" ? item.description_en : item.description_ru; };
  const key = () => `${String(context?.country || "").toUpperCase()}:${Number(context?.year || 2025)}:${String(context?.dimension || "EDI").toUpperCase()}`;

  function icon(name) { return `<img class="vdem-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`; }
  function flag(row, className = "flag-img inline") { return context?.flagImage ? context.flagImage(row, className) : `<span class="vdem-flag-fallback">${esc(row?.iso3 || "")}</span>`; }
  function scoreBand(value) {
    const n = finite(value);
    if (n == null) return "no-data";
    if (n < .2) return "b1";
    if (n < .4) return "b2";
    if (n < .6) return "b3";
    if (n < .8) return "b4";
    return "b5";
  }

  async function getPayload(force = false) {
    const cacheKey = key();
    if (!force && cache.has(cacheKey)) return cache.get(cacheKey);
    if (!force && pending.has(cacheKey)) return pending.get(cacheKey);
    const query = new URLSearchParams({ country: String(context.country || "").toUpperCase(), year: String(Number(context.year || 2025)), dimension: String(context.dimension || "EDI").toUpperCase() });
    const request = fetch(`/api/index/VDEM/workspace?${query}`, { headers: { Accept: "application/json" } })
      .then(async (response) => { if (!response.ok) throw new Error(`${response.status} ${response.statusText}`); const value = await response.json(); cache.set(cacheKey, value); return value; })
      .finally(() => pending.delete(cacheKey));
    pending.set(cacheKey, request);
    return request;
  }

  async function getPolities() {
    if (polities) return polities;
    const response = await fetch("/api/vdem/polities", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    polities = await response.json();
    return polities;
  }

  function loadingMarkup() {
    return `<section class="vdem-workspace vdem-loading" aria-live="polite"><p class="vdem-kicker">V-Dem · v16</p><h1>${tr("Загружается историческая обсерватория демократии", "Loading the historical democracy observatory")}</h1><p>${tr("Пять концепций, временной ряд, неопределённость и политии V-Dem.", "Five concepts, historical series, uncertainty and V-Dem polities.")}</p><div class="vdem-loading-lines">${"<i></i>".repeat(5)}</div></section>`;
  }
  function errorMarkup(error) {
    return `<section class="vdem-workspace vdem-error" role="alert"><p class="vdem-kicker">V-Dem · ERROR</p><h1>${tr("Рабочее пространство V-Dem недоступно", "The V-Dem workspace is unavailable")}</h1><p>${esc(error?.message || error)}</p><button class="vdem-button is-primary" data-vdem-retry type="button">${tr("Повторить", "Retry")}</button></section>`;
  }

  function scoreRing(value) {
    const pct = scorePct(value);
    return `<div class="vdem-score-ring" style="--vdem-score:${pct}" aria-label="${tr("Значение", "Score")}: ${fmt(value)}"><div><strong>${fmt(value)}</strong><span>0–1</span></div></div>`;
  }

  function heroMarkup() {
    const obs = observation();
    const source = payload.source || {};
    const prev = (payload.trend || []).filter((row) => Number(row.year) < effectiveYear()).at(-1);
    const delta = prev && finite(prev.score) != null ? Number(obs.score) - Number(prev.score) : null;
    return `<header class="vdem-hero" data-testid="vdem-hero">
      <div class="vdem-hero-copy">
        <div class="vdem-breadcrumb"><span>${tr("Государство и институты", "Governance and institutions")}</span><i></i><strong>V-Dem Institute · v16</strong></div>
        <div class="vdem-title-row"><span class="vdem-badge">V–DEM</span><div><p class="vdem-kicker">${tr("Историческая обсерватория демократии", "Historical democracy observatory")}</p><h1>${tr("V-Dem: индексы демократии", "V-Dem: Democracy Indices")}</h1></div></div>
        <p class="vdem-lead">${esc(dimDescription(selectedDimension()))}</p>
        <aside class="vdem-no-overall"><span>05</span><div><strong>${tr("Пять концепций — без искусственного среднего", "Five concepts — no artificial average")}</strong><p>${tr("GIR сохраняет пять официальных индексов раздельно и не конструирует общий балл или официальный общий ранг.", "GIR keeps the five official indices separate and constructs no overall score or official overall rank.")}</p></div></aside>
        <div class="vdem-actions"><a class="vdem-button is-primary" href="#vdem-timeline">${icon("chart-no-axes-combined")}${tr("Исследовать траекторию", "Explore trajectory")}</a><a class="vdem-button" href="/api/index/VDEM/workspace.csv?country=${esc(country().iso3)}&year=${effectiveYear()}&dimension=${selectedDimension()}&lang=${context.lang}" download>${icon("download")}${tr("Экспорт CSV", "Export CSV")}</a><button class="vdem-button" data-vdem-copy type="button">${icon("link")}${tr("Скопировать срез", "Copy view")}</button><button class="vdem-button" data-gir-action="provenance" data-value-id="${esc(obs.value_id || "")}" ${obs.value_id ? "" : "disabled"} type="button">${icon("database")}${tr("Доказательство значения", "Value evidence")}</button></div>
        <dl class="vdem-source-strip"><div><dt>${tr("Источник", "Source")}</dt><dd>${esc(source.title || source.source_name || "V-Dem Country-Year Dataset v16")}</dd></div><div><dt>${tr("Охват", "Coverage")}</dt><dd>1789–2025 · ${intFmt(obs.global_count)} ${tr("наблюдений выпуска", "release observations")}</dd></div><div><dt>${tr("Лицензия", "Licence")}</dt><dd>${esc(source.license_or_terms || "CC BY-SA 4.0")}</dd></div></dl>
      </div>
      <aside class="vdem-hero-score">
        <div class="vdem-country-line"><div>${flag(country())}<span><strong>${esc(localName(country()))}</strong><small>${esc(payload.polity?.histname || payload.polity?.vdem_country_name || "")}</small></span></div><b>${esc(selectedDimension())} · ${effectiveYear()}</b></div>
        <p class="vdem-kicker">${tr("Выбранная концепция", "Selected concept")}</p><h2>${esc(dimName(selectedDimension()))}</h2>
        <div class="vdem-score-layout">${scoreRing(obs.score)}<div><span>${tr("Место GIR*", "GIR rank*")}</span><strong>#${intFmt(obs.global_rank_derived)} / ${intFmt(obs.global_count)}</strong><em>P${fmt(obs.percentile_derived, 1)}</em></div></div>
        <div class="vdem-interval"><span>${tr("68% интервал модели", "68% model interval")}</span><b>${fmt(obs.uncertainty_low)}–${fmt(obs.uncertainty_high)}</b><i style="--vdem-low:${scorePct(obs.uncertainty_low)};--vdem-high:${scorePct(obs.uncertainty_high)};--vdem-value:${scorePct(obs.score)}"></i></div>
        <dl class="vdem-mini-facts"><div><dt>${tr("Стандартное отклонение", "Standard deviation")}</dt><dd>${fmt(obs.standard_deviation)}</dd></div><div><dt>${tr("К предыдущему году", "Year-on-year")}</dt><dd class="${delta != null && delta < 0 ? "is-negative" : "is-positive"}">${delta == null ? "—" : `${delta > 0 ? "+" : ""}${fmt(delta)}`}</dd></div><div><dt>${tr("Кодировочная единица", "Coding polity")}</dt><dd>${esc(payload.polity?.histname || payload.polity?.vdem_country_name || "—")}</dd></div></dl>
        <p class="vdem-footnote">* ${tr("Производное competition rank внутри выбранного индекса и года; не официальный рейтинг V-Dem.", "Derived competition rank within the selected index and year; not an official V-Dem ranking.")}</p>
      </aside>
    </header>`;
  }

  function dimensionsMarkup() {
    return `<section class="vdem-section vdem-concepts" data-testid="vdem-dimensions"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Выберите концептуальную линзу", "Choose a conceptual lens")}</p><h2>${tr("Пять разновидностей демократии", "Five varieties of democracy")}</h2></div><p>${tr("Переключение меняет карту, исторический ряд, неопределённость и международное место.", "Switching changes the map, historical series, uncertainty and international rank.")}</p></div><div class="vdem-concept-grid">${payload.dimension_metadata.map((item, index) => `<button type="button" class="vdem-concept ${item.code === selectedDimension() ? "is-active" : ""}" data-vdem-dimension="${item.code}"><span><b>${item.code}</b><i>0${index + 1}</i></span><strong>${esc(context.lang === "en" ? item.name_en : item.name_ru)}</strong><p>${esc(context.lang === "en" ? item.description_en : item.description_ru)}</p><small>${esc(item.years)}</small></button>`).join("")}</div></section>`;
  }

  function profileMarkup() {
    return `<section id="vdem-profile" class="vdem-section" data-testid="vdem-profile"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Профиль страны", "Country profile")}</p><h2>${tr("Пять принципов в одном срезе", "Five principles in one snapshot")}</h2></div><p>${tr("Официальные значения V-Dem; длина полосы выражает исходную шкалу 0–1.", "Official V-Dem values; bar length uses the original 0–1 scale.")}</p></div><div class="vdem-profile-grid">${payload.profile.map((row) => `<article class="vdem-profile-row ${row.dimension_code === selectedDimension() ? "is-selected" : ""}"><div><span>${esc(row.dimension_code)}</span><strong>${esc(dimName(row.dimension_code, true))}</strong></div><div class="vdem-profile-track"><i style="width:${scorePct(row.score)}%"></i><b style="left:${scorePct(row.uncertainty_low)}%;width:${Math.max(1,scorePct(row.uncertainty_high)-scorePct(row.uncertainty_low))}%"></b></div><div><strong>${fmt(row.score)}</strong><small>#${intFmt(row.global_rank_derived)} / ${intFmt(row.global_count)}</small></div></article>`).join("")}</div></section>`;
  }

  function timelineChart() {
    const rows = (payload.trend || []).filter((row) => finite(row.score) != null && Number(row.year) >= ui.timelineStart);
    if (!rows.length) return `<div class="vdem-empty">${tr("Временной ряд отсутствует", "No time series available")}</div>`;
    const width = 1120, height = 400, left = 58, right = 24, top = 26, bottom = 48;
    const minYear = Math.min(...rows.map((r) => Number(r.year))), maxYear = Math.max(...rows.map((r) => Number(r.year)));
    const x = (year) => left + (Number(year) - minYear) / (maxYear - minYear || 1) * (width - left - right);
    const y = (score) => height - bottom - clamp(score) * (height - top - bottom);
    const line = rows.map((row, i) => `${i ? "L" : "M"}${x(row.year).toFixed(1)},${y(row.score).toFixed(1)}`).join(" ");
    const area = `${rows.map((row, i) => `${i ? "L" : "M"}${x(row.year).toFixed(1)},${y(row.uncertainty_high ?? row.score).toFixed(1)}`).join(" ")} ${[...rows].reverse().map((row) => `L${x(row.year).toFixed(1)},${y(row.uncertainty_low ?? row.score).toFixed(1)}`).join(" ")} Z`;
    const ticks = [0,.25,.5,.75,1];
    const yearTicks = [minYear, ...[1800,1850,1900,1945,1990,2000,2010,2020].filter((v) => v > minYear && v < maxYear), maxYear];
    const last = rows.at(-1);
    return `<svg class="vdem-timeline-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Историческая динамика выбранного индекса", "Historical trend of the selected index")}">${ticks.map((v) => `<line x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}" class="vdem-grid-line"/><text x="${left-12}" y="${y(v)+4}" text-anchor="end">${v.toFixed(2)}</text>`).join("")}<path d="${area}" class="vdem-uncertainty-area"/><path d="${line}" class="vdem-trend-line"/>${yearTicks.map((v) => `<text x="${x(v)}" y="${height-16}" text-anchor="middle">${v}</text>`).join("")}<circle cx="${x(last.year)}" cy="${y(last.score)}" r="6" class="vdem-end-dot"/><text x="${x(last.year)-10}" y="${y(last.score)-14}" text-anchor="end" class="vdem-end-label">${fmt(last.score)}</text></svg>`;
  }

  function timelineMarkup() {
    const first = (payload.trend || [])[0]; const last = (payload.trend || []).at(-1);
    return `<section id="vdem-timeline" class="vdem-section" data-testid="vdem-timeline"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Историческая перспектива", "Historical perspective")}</p><h2>${tr("Траектория политии", "Polity trajectory")}: ${esc(payload.polity?.histname || payload.polity?.vdem_country_name || "")}</h2></div><p>${tr("Интервал отражает опубликованную V-Dem кодировочную неопределённость.", "The band reflects V-Dem's published coding uncertainty.")}</p></div><div class="vdem-window-controls">${WINDOWS.map((year) => `<button type="button" data-vdem-window="${year}" class="${ui.timelineStart === year ? "is-active" : ""}">${year === 1789 ? tr("Весь ряд", "Full series") : `${year}+`}</button>`).join("")}</div><div class="vdem-chart-card">${timelineChart()}<dl><div><dt>${tr("Первое наблюдение", "First observation")}</dt><dd>${first?.year || "—"} · ${fmt(first?.score)}</dd></div><div><dt>${tr("Последнее наблюдение", "Latest observation")}</dt><dd>${last?.year || "—"} · ${fmt(last?.score)}</dd></div><div><dt>${tr("Наблюдений", "Observations")}</dt><dd>${intFmt(payload.trend?.length)}</dd></div></dl></div></section>`;
  }

  function uncertaintyMarkup() {
    const obs = observation();
    return `<section class="vdem-section vdem-uncertainty" data-testid="vdem-uncertainty"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Измерительная модель", "Measurement model")}</p><h2>${tr("Неопределённость — часть результата", "Uncertainty is part of the result")}</h2></div><p>${tr("Точечная оценка не должна интерпретироваться без опубликованных границ codelow/codehigh.", "The point estimate should not be read without the published codelow/codehigh bounds.")}</p></div><div class="vdem-uncertainty-grid"><article><span>${tr("Нижняя граница", "Lower bound")}</span><strong>${fmt(obs.uncertainty_low)}</strong></article><article class="is-main"><span>${tr("Оценка", "Estimate")}</span><strong>${fmt(obs.score)}</strong></article><article><span>${tr("Верхняя граница", "Upper bound")}</span><strong>${fmt(obs.uncertainty_high)}</strong></article><article><span>${tr("Стандартное отклонение", "Standard deviation")}</span><strong>${fmt(obs.standard_deviation)}</strong></article></div><div class="vdem-uncertainty-scale"><i style="left:${scorePct(obs.uncertainty_low)}%;width:${Math.max(1,scorePct(obs.uncertainty_high)-scorePct(obs.uncertainty_low))}%"></i><b style="left:${scorePct(obs.score)}%"></b><span>0</span><span>1</span></div></section>`;
  }

  function geometryBounds(features) {
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    const walk=(coords)=>{ if(!Array.isArray(coords)) return; if(typeof coords[0]==="number"){ const lon=Number(coords[0]),lat=Number(coords[1]); if(Number.isFinite(lon)&&Number.isFinite(lat)){minX=Math.min(minX,lon);maxX=Math.max(maxX,lon);minY=Math.min(minY,lat);maxY=Math.max(maxY,lat);} return;} coords.forEach(walk); };
    features.forEach((f)=>walk(f.geometry?.coordinates)); return {minX,minY,maxX,maxY};
  }
  function geomPath(geometry,width,height,bounds){
    const sx=(width-18)/(bounds.maxX-bounds.minX||1), sy=(height-18)/(bounds.maxY-bounds.minY||1), scale=Math.min(sx,sy); const ox=(width-(bounds.maxX-bounds.minX)*scale)/2, oy=(height-(bounds.maxY-bounds.minY)*scale)/2;
    const point=(p)=>`${(ox+(p[0]-bounds.minX)*scale).toFixed(1)},${(height-(oy+(p[1]-bounds.minY)*scale)).toFixed(1)}`;
    const ring=(r)=>`M${r.map(point).join("L")}Z`; if(!geometry) return ""; if(geometry.type==="Polygon") return geometry.coordinates.map(ring).join(""); if(geometry.type==="MultiPolygon") return geometry.coordinates.flatMap((p)=>p.map(ring)).join(""); return "";
  }
  async function loadGeo(){ if(geoData) return geoData; if(!geoPromise) geoPromise=fetch("/static/world_countries_lite.geojson").then((r)=>{if(!r.ok) throw new Error(`GeoJSON ${r.status}`); return r.json();}).then((v)=>{geoData=v;return v;}); return geoPromise; }
  async function renderMap(){
    const host=context.root.querySelector("#vdemMapCanvas"); if(!host) return; host.setAttribute("aria-busy","true");
    try { const geo=await loadGeo(); const rows=new Map((payload.ranking||[]).filter((r)=>r.iso3).map((r)=>[r.iso3,r])); const width=1120,height=530,bounds=geometryBounds(geo.features); const paths=geo.features.map((feature)=>{const iso3=feature.properties?.iso3; const row=rows.get(iso3); const selected=iso3===country().iso3; return `<path d="${geomPath(feature.geometry,width,height,bounds)}" class="vdem-map-country band-${scoreBand(row?.score)}${selected?" is-selected":""}" data-vdem-map-country="${esc(iso3)}" tabindex="${row?"0":"-1"}"><title>${row?`${esc(localName(row))} · ${fmt(row.score)} · #${intFmt(row.global_rank_derived)}`:`${esc(feature.properties?.name_en||iso3)} · ${tr("нет данных","no data")}`}</title></path>`;}).join(""); host.innerHTML=`<svg class="vdem-map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Карта мира V-Dem", "V-Dem world map")}">${paths}</svg><div class="vdem-map-tooltip" hidden></div>`; host.setAttribute("aria-busy","false"); const tooltip=host.querySelector(".vdem-map-tooltip"); host.querySelectorAll("[data-vdem-map-country]").forEach((path)=>{const row=rows.get(path.dataset.vdemMapCountry); if(!row)return; const show=(event)=>{tooltip.hidden=false;tooltip.innerHTML=`<strong>${esc(localName(row))}</strong><span>${esc(dimName(selectedDimension()))}</span><b>${fmt(row.score)} · #${intFmt(row.global_rank_derived)}</b>`;const rect=host.getBoundingClientRect(),x=event.clientX?event.clientX-rect.left:rect.width/2,y=event.clientY?event.clientY-rect.top:rect.height/2;tooltip.style.left=`${Math.min(rect.width-190,Math.max(8,x+12))}px`;tooltip.style.top=`${Math.min(rect.height-90,Math.max(8,y+12))}px`;};path.addEventListener("pointermove",show);path.addEventListener("focus",show);path.addEventListener("pointerleave",()=>tooltip.hidden=true);path.addEventListener("blur",()=>tooltip.hidden=true);path.addEventListener("click",()=>context.onCountryChange?.(path.dataset.vdemMapCountry));path.addEventListener("keydown",(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();context.onCountryChange?.(path.dataset.vdemMapCountry);}});});
    } catch(error){ host.innerHTML=`<div class="vdem-empty">${esc(error.message)}</div>`; }
  }
  function mapMarkup(){ return `<section id="vdem-world" class="vdem-section" data-testid="vdem-world"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Международное поле", "International field")}</p><h2>${tr("Мировая карта", "World map")}: ${esc(dimName(selectedDimension()))}</h2></div><p>${tr("Фиксированная шкала 0–1 обеспечивает сопоставимость между годами; диапазоны являются аналитической легендой GIR.", "A fixed 0–1 scale preserves comparability over time; bands are a GIR analytical legend.")}</p></div><div class="vdem-map-legend">${[["b1","0–0,19"],["b2","0,20–0,39"],["b3","0,40–0,59"],["b4","0,60–0,79"],["b5","0,80–1,00"]].map(([c,l])=>`<span><i class="${c}"></i>${l}</span>`).join("")}</div><div id="vdemMapCanvas" class="vdem-map-canvas" aria-busy="true"></div></section>`; }

  function filteredRanking(){ const q=ui.rankingQuery.trim().toLowerCase(); return (payload.ranking||[]).filter((r)=>!q||`${r.iso3||""} ${r.vdem_country_name||""} ${r.name_ru||""} ${r.name_en||""}`.toLowerCase().includes(q)); }
  function rankingBodyMarkup(){ const rows=filteredRanking(); const pages=Math.max(1,Math.ceil(rows.length/ui.pageSize)); ui.rankingPage=Math.min(ui.rankingPage,pages); const start=(ui.rankingPage-1)*ui.pageSize; const view=rows.slice(start,start+ui.pageSize); return `<div class="vdem-table-wrap"><table class="vdem-table"><thead><tr><th>#</th><th>${tr("Полития / страна", "Polity / country")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Интервал", "Interval")}</th><th>${tr("Процентиль", "Percentile")}</th><th>V-Dem ID</th></tr></thead><tbody>${view.map((r)=>`<tr tabindex="0" data-vdem-country="${esc(r.iso3||"")}" class="${r.iso3===country().iso3?"is-selected":""}"><td><strong>${intFmt(r.global_rank_derived)}</strong></td><td><div class="vdem-table-country">${r.iso3?flag(r):""}<span><b>${esc(localName(r))}</b><small>${esc(r.histname||r.vdem_country_name||r.country_text_id)}</small></span></div></td><td><b>${fmt(r.score)}</b></td><td>${fmt(r.uncertainty_low)}–${fmt(r.uncertainty_high)}</td><td>P${fmt(r.percentile_derived,1)}</td><td class="vdem-mono">${intFmt(r.vdem_country_id)}</td></tr>`).join("")}</tbody></table></div><div class="vdem-pagination"><span>${intFmt(rows.length)} ${tr("наблюдений", "observations")}</span><button data-vdem-page="prev" ${ui.rankingPage<=1?"disabled":""}>← ${tr("Назад", "Previous")}</button><b>${ui.rankingPage} / ${pages}</b><button data-vdem-page="next" ${ui.rankingPage>=pages?"disabled":""}>${tr("Далее", "Next")} →</button></div>`; }
  function rankingMarkup(){ return `<section id="vdem-ranking" class="vdem-section" data-testid="vdem-ranking"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Срез выпуска", "Release snapshot")}</p><h2>${tr("Международное распределение", "International distribution")} · ${effectiveYear()}</h2></div><p>${tr("Место производно и рассчитывается GIR из точных официальных значений одного индекса и года.", "Rank is derived by GIR from exact official values within one index and year.")}</p></div><div class="vdem-table-controls"><label><span>${tr("Поиск", "Search")}</span><input data-vdem-ranking-search value="${esc(ui.rankingQuery)}" placeholder="${tr("Страна, полития или код", "Country, polity or code")}"></label><label><span>${tr("Строк", "Rows")}</span><select data-vdem-page-size>${[10,25,50,100].map((n)=>`<option value="${n}" ${n===ui.pageSize?"selected":""}>${n}</option>`).join("")}</select></label></div><div id="vdemRankingBody">${rankingBodyMarkup()}</div></section>`; }

  function filteredPolities(){ const q=ui.polityQuery.trim().toLowerCase(); return (polities||[]).filter((p)=>{if(ui.polityMode==="current"&&!p.current_in_latest_release)return false;if(ui.polityMode==="historical"&&p.current_in_latest_release)return false;if(ui.polityMode==="unmapped"&&p.iso3)return false;return !q||`${p.vdem_country_name||""} ${p.country_text_id||""} ${p.iso3||""} ${p.name_ru||""} ${p.name_en||""}`.toLowerCase().includes(q);}); }
  function polityBodyMarkup(){ const rows=filteredPolities(); return `<div class="vdem-polity-summary"><strong>${intFmt(rows.length)}</strong><span>${tr("кодировочных единиц", "coding units")}</span></div><div class="vdem-polity-list">${rows.map((p)=>`<article><div>${p.iso3?flag(p):`<span class="vdem-polity-id">${intFmt(p.vdem_country_id)}</span>`}<span><strong>${esc(context.lang==="en"?(p.name_en||p.vdem_country_name):(p.name_ru||p.name_en||p.vdem_country_name))}</strong><small>${esc(p.vdem_country_name)} · ${esc(p.country_text_id)}</small></span></div><dl><div><dt>${tr("Период", "Period")}</dt><dd>${p.first_year}–${p.last_year}</dd></div><div><dt>ISO3</dt><dd>${esc(p.iso3||tr("не сопоставлено","unmapped"))}</dd></div><div><dt>${tr("Статус", "Status")}</dt><dd>${p.current_in_latest_release?tr("текущая","current"):tr("историческая","historical")}</dd></div></dl></article>`).join("")}</div>`; }
  function politiesMarkup(){ return `<section id="vdem-polities" class="vdem-section" data-testid="vdem-polities"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Единицы кодирования", "Coding units")}</p><h2>${tr("Исследователь политий V-Dem", "V-Dem polity explorer")}</h2></div><p>${tr("Исторические государства и специальные единицы не смешиваются с современным ISO-справочником GIR.", "Historical states and special units are kept separate from GIR's modern ISO directory.")}</p></div><div class="vdem-polity-controls"><label><span>${tr("Поиск", "Search")}</span><input data-vdem-polity-search value="${esc(ui.polityQuery)}" placeholder="USSR, Yugoslavia, Zanzibar…"></label><div>${[["all",tr("Все","All")],["current",tr("Текущие","Current")],["historical",tr("Исторические","Historical")],["unmapped",tr("Без ISO","No ISO")]].map(([v,l])=>`<button type="button" data-vdem-polity-mode="${v}" class="${ui.polityMode===v?"is-active":""}">${l}</button>`).join("")}</div></div><div id="vdemPolityBody" class="vdem-polity-body">${polities?polityBodyMarkup():`<div class="vdem-empty">${tr("Загрузка справочника политий…","Loading polity directory…")}</div>`}</div></section>`; }

  function methodMarkup(){ const source=payload.source||{}, formula=payload.formula||{}, methodology=payload.methodology||{}; return `<section id="vdem-method" class="vdem-section vdem-method" data-testid="vdem-methodology"><div class="vdem-section-head"><div><p class="vdem-kicker">${tr("Воспроизводимость", "Reproducibility")}</p><h2>${tr("Методология, происхождение и лицензия", "Methodology, provenance and licence")}</h2></div><p>${esc(context.lang==="en"?methodology.warning_en:methodology.warning_ru)}</p></div><div class="vdem-method-grid"><article><span>01</span><h3>${tr("Пять официальных индексов", "Five official indices")}</h3><p>${esc(context.lang==="en"?formula.formula_text_en:formula.formula_text_ru)}</p></article><article><span>02</span><h3>${tr("Неопределённость", "Uncertainty")}</h3><p>${esc(context.lang==="en"?formula.method_notes_en:formula.method_notes_ru)}</p></article><article><span>03</span><h3>${tr("Историческая граница", "Historical boundary")}</h3><p>${tr("Политии сохраняют идентификаторы и временные границы V-Dem; отсутствующие соответствия современным государствам не заполняются искусственно.", "Polities retain V-Dem identifiers and coding periods; missing links to modern states are not filled artificially.")}</p></article><article><span>04</span><h3>${tr("Лицензия", "Licence")}</h3><p>${esc(source.license_or_terms||"CC BY-SA 4.0")}</p></article></div><div class="vdem-provenance"><div><p class="vdem-kicker">${tr("Источник", "Source")}</p><h3>${esc(source.title||source.source_name||"V-Dem Dataset v16")}</h3><p>${esc(source.owner||"V-Dem Institute, University of Gothenburg")} · ${source.release_year||2026}</p><a href="${esc(source.url||payload.index?.url||"https://www.v-dem.net/data/the-v-dem-dataset/")}" target="_blank" rel="noopener noreferrer">${tr("Открыть источник", "Open source")} ↗</a></div><dl><div><dt>Snapshot ID</dt><dd class="vdem-mono">${esc(source.snapshot_id||source.latest_snapshot_id||"—")}</dd></div><div><dt>SHA-256</dt><dd class="vdem-mono">${esc(source.raw_snapshot_sha256||observation().raw_snapshot_sha256||"—")}</dd></div><div><dt>Transform ID</dt><dd class="vdem-mono">${esc(observation().transform_id||"—")}</dd></div><div><dt>Formula version</dt><dd class="vdem-mono">${esc(observation().formula_version||"—")}</dd></div></dl></div></section>`; }

  function jumpMarkup(){ return `<nav class="vdem-jumps" aria-label="${tr("Разделы V-Dem", "V-Dem sections")}"><a href="#vdem-profile">01 ${tr("Профиль", "Profile")}</a><a href="#vdem-timeline">02 ${tr("Динамика", "Timeline")}</a><a href="#vdem-world">03 ${tr("Карта", "Map")}</a><a href="#vdem-ranking">04 ${tr("Рейтинг", "Ranking")}</a><a href="#vdem-polities">05 ${tr("Политии", "Polities")}</a><a href="#vdem-method">06 ${tr("Метод", "Method")}</a></nav>`; }
  function workspaceMarkup(){ return `<article class="vdem-workspace" data-vdem-workspace data-dimension="${selectedDimension()}">${heroMarkup()}${dimensionsMarkup()}${jumpMarkup()}${profileMarkup()}${timelineMarkup()}${uncertaintyMarkup()}${mapMarkup()}${rankingMarkup()}${politiesMarkup()}${methodMarkup()}</article>`; }

  function refreshRanking(){ const target=context.root.querySelector("#vdemRankingBody"); if(!target)return; target.innerHTML=rankingBodyMarkup(); bindRanking(target); }
  function refreshPolities(){ const target=context.root.querySelector("#vdemPolityBody"); if(target) target.innerHTML=polityBodyMarkup(); }
  function bindRanking(root=context.root){ root.querySelectorAll("[data-vdem-country]").forEach((row)=>{if(!row.dataset.vdemCountry)return; const go=()=>context.onCountryChange?.(row.dataset.vdemCountry); row.addEventListener("click",go);row.addEventListener("keydown",(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});});root.querySelectorAll("[data-vdem-page]").forEach((b)=>b.addEventListener("click",()=>{ui.rankingPage+=b.dataset.vdemPage==="next"?1:-1;refreshRanking();})); }
  function bindEvents(){ const root=context.root; root.querySelectorAll("[data-vdem-dimension]").forEach((b)=>b.addEventListener("click",()=>context.onDimensionChange?.(b.dataset.vdemDimension))); root.querySelector("[data-vdem-copy]")?.addEventListener("click",async()=>{const url=new URL(location.href);url.searchParams.set("country",country().iso3);url.searchParams.set("year",String(effectiveYear()));url.searchParams.set("index","VDEM");url.searchParams.set("dimension",selectedDimension());try{await navigator.clipboard.writeText(url.toString());context.onNotice?.(tr("Ссылка скопирована","Link copied"));}catch{context.onNotice?.(tr("Не удалось скопировать ссылку","Unable to copy link"));}});root.querySelectorAll("[data-vdem-window]").forEach((b)=>b.addEventListener("click",()=>{ui.timelineStart=Number(b.dataset.vdemWindow);root.querySelectorAll("[data-vdem-window]").forEach((x)=>x.classList.toggle("is-active",x===b));root.querySelector(".vdem-chart-card").innerHTML=`${timelineChart()}<dl><div><dt>${tr("Период", "Period")}</dt><dd>${ui.timelineStart}–${effectiveYear()}</dd></div></dl>`;}));const search=root.querySelector("[data-vdem-ranking-search]");if(search)search.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{ui.rankingQuery=search.value;ui.rankingPage=1;refreshRanking();},120);});root.querySelector("[data-vdem-page-size]")?.addEventListener("change",(e)=>{ui.pageSize=Number(e.target.value);ui.rankingPage=1;refreshRanking();});root.querySelector("[data-vdem-polity-search]")?.addEventListener("input",(e)=>{ui.polityQuery=e.target.value;refreshPolities();});root.querySelectorAll("[data-vdem-polity-mode]").forEach((b)=>b.addEventListener("click",()=>{ui.polityMode=b.dataset.vdemPolityMode;root.querySelectorAll("[data-vdem-polity-mode]").forEach((x)=>x.classList.toggle("is-active",x===b));refreshPolities();}));bindRanking(root); }

  async function render(nextContext){ context=nextContext; if(!context?.root||!context.country)return; context.dimension=DIMENSIONS.includes(String(context.dimension||"EDI").toUpperCase())?String(context.dimension||"EDI").toUpperCase():"EDI"; const token=++renderSerial; context.root.innerHTML=loadingMarkup(); try{const result=await getPayload();if(token!==renderSerial)return;payload=result;if(!payload?.available)throw new Error(tr("Для выбранной страны и года нет данных V-Dem.","No V-Dem data are available for the selected country and year."));context.root.innerHTML=workspaceMarkup();bindEvents();Promise.all([loadGeo().then(()=>renderMap()),getPolities().then(()=>{if(token===renderSerial){const body=context.root.querySelector("#vdemPolityBody");if(body)body.innerHTML=polityBodyMarkup();}})]).catch((e)=>console.error("V-Dem auxiliary data",e));document.documentElement.dataset.vdemReady="true";window.__GIIP_READY__=true;}catch(error){if(token!==renderSerial)return;context.root.innerHTML=errorMarkup(error);context.root.querySelector("[data-vdem-retry]")?.addEventListener("click",()=>{cache.delete(key());render(context);});document.documentElement.dataset.vdemReady="error";} }
  function invalidate(countryCode,year,dimension){if(countryCode&&year&&dimension)cache.delete(`${String(countryCode).toUpperCase()}:${Number(year)}:${String(dimension).toUpperCase()}`);else cache.clear();}
  window.GIRVDEM=Object.freeze({render,invalidate,dimensions:DIMENSIONS});
})();
