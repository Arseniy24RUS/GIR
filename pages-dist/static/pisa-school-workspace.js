/* GIR · OECD PISA School Knowledge workspace
 * Stage 4 frontend. Official OECD domain means and the GIR-derived equal-domain
 * composite are kept visually, methodologically and semantically distinct.
 */
(() => {
  "use strict";

  const DOMAIN_ORDER = ["MATHEMATICS", "READING", "SCIENCE"];
  const cache = new Map();
  let context = null;
  let model = null;
  let loadToken = 0;
  const ui = {
    view: "overview",
    mode: modeFromUrl(),
    query: "",
    entityType: "all",
    caution: "all",
    page: 1,
    pageSize: 20,
    scatterX: "MATHEMATICS",
    scatterY: "READING",
  };

  function modeFromUrl() {
    try {
      const value = new URL(location.href).searchParams.get("pisa_mode");
      return value === "latest_asof" ? "latest_asof" : "fixed_release";
    } catch (_) { return "fixed_release"; }
  }
  function lang() { return context?.lang === "en" ? "en" : "ru"; }
  function tr(ru, en) { return lang() === "ru" ? ru : en; }
  function esc(value) {
    if (context?.escapeHtml) return context.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }
  function fmt(value, digits = 1) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function intFmt(value) {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 0 });
  }
  function dateFmt(value) {
    if (!value) return "—";
    const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat(lang() === "ru" ? "ru-RU" : "en-US", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    }).format(parsed);
  }
  function local(item, ruKey = "name_ru", enKey = "name_en", fallback = "—") {
    if (!item) return fallback;
    return (lang() === "ru" ? item[ruKey] : item[enKey]) || item[enKey] || item[ruKey] || fallback;
  }
  function selectedCode() { return String(context?.entity || "").toUpperCase(); }
  function status() { return model?.status || {}; }
  function profile() { return model?.profile || {}; }
  function ranking() { return model?.ranking || {}; }
  function rows() { return ranking().ranked_entities || []; }
  function methodology() { return model?.methodology || {}; }
  function benchmarks() { return model?.benchmarks || {}; }
  function isDiagnostic() { return model?.diagnostic_only || ui.mode === "latest_asof"; }
  function selectedAvailable() { return Boolean(profile().available && profile().profile); }
  function selectedEntity() { return profile().entity || null; }
  function selectedCountry() { return profile().country || null; }
  function selectedResult() { return profile().profile || null; }
  function selectedComponents() { return profile().components || []; }
  function selectedName() {
    if (selectedEntity()) return local(selectedEntity(), "entity_name_ru", "entity_name_en", selectedCode());
    if (selectedCountry()) return local(selectedCountry(), "name_ru", "name_en", selectedCode());
    return selectedCode();
  }
  function rowName(row) { return local(row, "entity_name_ru", "entity_name_en", row?.entity_code || "—"); }
  function entityKind(row) {
    const type = row?.entity_type || "country";
    if (type === "economy") return tr("экономика", "economy");
    if (type === "adjudicated_subnational") return tr("частичная территория", "partial territory");
    return tr("страна", "country");
  }
  function countryLike(row) {
    return {
      iso3: row?.iso3 || row?.entity_code,
      name_ru: row?.entity_name_ru || row?.name_ru || row?.entity_code,
      name_en: row?.entity_name_en || row?.name_en || row?.entity_code,
    };
  }
  function flag(row, className = "flag-img inline") {
    if (!context?.flagImage || !row?.iso3) return `<span class="pisa-entity-badge">${esc(row?.entity_code || row?.iso3 || "")}</span>`;
    return context.flagImage(countryLike(row), className);
  }
  function domainDefinition(code) {
    const domains = methodology()?.official_assessment?.domains || [];
    return domains.find((item) => item.code === code) || { code, name_ru: code, name_en: code, weight: 1 / 3 };
  }
  function domainName(code) { return local(domainDefinition(code), "name_ru", "name_en", code); }
  function domainField(code) { return ({ MATHEMATICS: "mathematics", READING: "reading", SCIENCE: "science" })[code]; }
  function domainValue(row, code) { return Number(row?.[domainField(code)]); }
  function oecdAverage(code) { return Number(benchmarks()?.oecd_domain_averages?.[code] ?? methodology()?.official_assessment?.oecd_averages?.[code]); }
  function topSystem() { return benchmarks()?.top_system || rows()[0] || null; }
  function gapClass(value) { return Number(value) >= 0 ? "is-positive" : "is-negative"; }
  function signed(value, digits = 1) { return value == null ? "—" : `${Number(value) >= 0 ? "+" : ""}${fmt(value, digits)}`; }
  function qualityCaution(item) { return Boolean(Number(item?.sampling_caution) || Number(item?.scale_link_caution) || item?.entity_type === "adjudicated_subnational"); }
  function officialLink(url, label) { return `<a class="pisa-button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`; }
  function updateUrl() {
    try {
      const url = new URL(location.href);
      url.searchParams.set("pisa_entity", selectedCode());
      url.searchParams.set("pisa_mode", ui.mode);
      url.searchParams.set("year", "2022");
      history.replaceState(null, "", `${url.pathname}${url.search}${location.hash}`);
    } catch (_) { /* embedded QA documents may not expose a mutable URL */ }
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body?.detail;
      throw new Error(typeof detail === "string" ? detail : detail?.message || `HTTP ${response.status}`);
    }
    return body;
  }
  async function load() {
    const key = `${selectedCode()}:2022:${ui.mode}`;
    if (!cache.has(key)) {
      const query = new URLSearchParams({ country: selectedCode(), year: "2022", mode: ui.mode });
      cache.set(key, fetchJson(`/api/index/PISA_SKI/workspace?${query.toString()}`));
    }
    return cache.get(key);
  }

  function commandHeader() {
    const urls = methodology()?.source_and_rights || {};
    return `<header class="pisa-command">
      <div class="pisa-command-identity">
        <span class="pisa-command-mark" aria-hidden="true">PISA</span>
        <div><div class="pisa-kicker">${tr("ШКОЛЬНЫЕ ЗНАНИЯ · ОЭСР · ЦИКЛ 2022", "SCHOOL KNOWLEDGE · OECD · 2022 CYCLE")}</div><h1>${tr("PISA: знания школьников", "PISA School Knowledge")}</h1><p>${tr("Три официальных предметных результата ОЭСР, международные ориентиры, качество выборки и прозрачная сводная диагностика GIR.", "Three official OECD domain results, international benchmarks, sampling quality and a transparent GIR composite diagnostic.")}</p></div>
      </div>
      <div class="pisa-command-actions">
        ${officialLink(urls.results_url, tr("Результаты ОЭСР", "OECD results"))}
        ${officialLink(urls.database_url, tr("База PISA", "PISA database"))}
        <button type="button" class="pisa-button" data-pisa-view="methodology">${tr("Методика", "Methodology")}</button>
      </div>
    </header>`;
  }

  function entityOptions() {
    const collator = new Intl.Collator(lang() === "ru" ? "ru" : "en", { sensitivity: "base" });
    const withResults = [...rows()].sort((a, b) => collator.compare(rowName(a), rowName(b)));
    const representedCountries = new Set(withResults
      .filter((item) => Number(item.country_profile_eligible) && item.iso3)
      .map((item) => String(item.iso3).toUpperCase()));
    const withoutResults = (context?.platformContext?.countries || [])
      .filter((country) => country.iso3 && !representedCountries.has(String(country.iso3).toUpperCase()))
      .map((country) => ({
        entity_code: String(country.iso3).toUpperCase(),
        iso3: String(country.iso3).toUpperCase(),
        entity_name_ru: country.name_ru || country.iso3,
        entity_name_en: country.name_en || country.iso3,
        entity_type: "country",
        no_result: true,
      }))
      .sort((a, b) => collator.compare(rowName(a), rowName(b)));
    if (![...withResults, ...withoutResults].some((item) => item.entity_code === selectedCode())) {
      const country = selectedCountry() || context?.platformContext?.countries?.find((item) => item.iso3 === selectedCode());
      withoutResults.unshift({ entity_code: selectedCode(), iso3: country?.iso3 || selectedCode(), entity_name_ru: country?.name_ru || selectedCode(), entity_name_en: country?.name_en || selectedCode(), entity_type: "country", no_result: true });
    }
    const option = (item) => `<option value="${esc(item.entity_code)}" ${item.entity_code === selectedCode() ? "selected" : ""}>${esc(rowName(item))}${item.entity_code === item.iso3 || !item.iso3 ? "" : ` · ${esc(item.entity_code)}`}${item.no_result ? ` · ${tr("нет результата", "no result")}` : ""}</option>`;
    return `<optgroup label="${tr("Есть результат PISA 2022", "PISA 2022 result available")}">${withResults.map(option).join("")}</optgroup><optgroup label="${tr("Нет результата PISA 2022", "No PISA 2022 result")}">${withoutResults.map(option).join("")}</optgroup>`;
  }
  function toolbar() {
    const p = selectedResult();
    const warning = !selectedAvailable() || qualityCaution({ ...p, ...(selectedEntity() || {}) });
    let statusText;
    if (!selectedAvailable()) statusText = tr("В цикле 2022 нет опубликованной трёхдоменной оценки", "No published three-domain result in the 2022 cycle");
    else if (isDiagnostic()) statusText = tr("Диагностический ASOF: место не присваивается", "Diagnostic ASOF: no rank is assigned");
    else if (qualityCaution({ ...p, ...(selectedEntity() || {}) })) statusText = tr("Результат доступен с методической оговоркой", "Result available with a methodological caution");
    else statusText = tr("Сопоставимый результат PISA 2022", "Comparable PISA 2022 result");
    return `<section class="pisa-toolbar" aria-label="${tr("Контекст PISA", "PISA context")}">
      <label class="pisa-field"><span>${tr("Образовательная система", "Education system")}</span><select class="pisa-select" data-pisa-entity aria-label="${tr("Образовательная система", "Education system")}">${entityOptions()}</select></label>
      <label class="pisa-field"><span>${tr("Режим сопоставления", "Comparison mode")}</span><select class="pisa-select" data-pisa-mode aria-label="${tr("Режим сопоставления", "Comparison mode")}"><option value="fixed_release" ${ui.mode === "fixed_release" ? "selected" : ""}>${tr("Сопоставимый цикл 2022", "Comparable 2022 cycle")}</option><option value="latest_asof" ${ui.mode === "latest_asof" ? "selected" : ""}>${tr("Последние доступные данные", "Latest available data")}</option></select></label>
      <label class="pisa-field"><span>${tr("Цикл", "Cycle")}</span><select class="pisa-select" aria-label="${tr("Цикл PISA", "PISA cycle")}" disabled><option>2022</option></select></label>
      <div class="pisa-toolbar-status ${warning ? "is-caution" : ""}"><i aria-hidden="true"></i><span>${esc(statusText)}</span></div>
    </section>`;
  }

  function tabs() {
    const items = [
      ["overview", tr("Обзор", "Overview")],
      ["profile", tr("Профиль системы", "System profile")],
      ["international", tr("Международное поле", "International field")],
      ["quality", tr("Данные и качество", "Data & quality")],
      ["methodology", tr("Методика", "Methodology")],
    ];
    return `<nav class="pisa-tabs" role="tablist" aria-label="${tr("Разделы PISA", "PISA views")}">${items.map(([code, label]) => `<button type="button" id="pisaTab${code}" role="tab" aria-selected="${ui.view === code ? "true" : "false"}" aria-controls="pisaView${code}" tabindex="${ui.view === code ? "0" : "-1"}" data-pisa-view="${code}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function metricTile(label, value, note, modifier = "") {
    return `<article class="pisa-kpi ${modifier}"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`;
  }
  function kpiStrip() {
    const p = selectedResult();
    const selectedValue = selectedAvailable() ? fmt(p.score, 1) : tr("Нет результата", "No result");
    const selectedNote = selectedAvailable() ? (isDiagnostic() ? tr("диагностический профиль", "diagnostic profile") : `${tr("место", "rank")} ${intFmt(p.rank)} · ${fmt(p.percentile, 1)}%`) : tr("отсутствие не равно нулю", "missing is not zero");
    return `<section class="pisa-kpis" aria-label="${tr("Ключевые показатели PISA", "PISA key metrics")}">
      ${metricTile(tr("Цикл", "Cycle"), "2022", tr("последний загруженный выпуск", "latest loaded release"))}
      ${metricTile(tr("Системы", "Systems"), intFmt(status().official_reporting_entities || ranking().reporting_entities || 81), tr("страны, экономики и выборки", "countries, economies and samples"))}
      ${metricTile(tr("Официальные домены", "Official domains"), intFmt(status().official_domains || 3), tr("математика · чтение · науки", "mathematics · reading · science"))}
      ${metricTile(tr("Среднее ОЭСР", "OECD average"), fmt(benchmarks().oecd_composite_gir, 1), tr("сводная справочная величина GIR", "GIR reference composite"))}
      ${metricTile(selectedName(), selectedValue, selectedNote, selectedAvailable() ? "is-accent" : "is-warning")}
      ${metricTile(tr("Следующий выпуск", "Next release"), dateFmt(status().next_results_date || "2026-09-08"), tr("первые результаты PISA 2025", "first PISA 2025 results"))}
    </section>`;
  }

  function profileHeader() {
    const entity = selectedEntity() || { entity_code: selectedCode(), iso3: selectedCountry()?.iso3 || selectedCode(), entity_name_ru: selectedCountry()?.name_ru || selectedCode(), entity_name_en: selectedCountry()?.name_en || selectedCode() };
    return `<header><div class="pisa-panel-title"><span>${tr("ПРОФИЛЬ ОБРАЗОВАТЕЛЬНОЙ СИСТЕМЫ", "EDUCATION SYSTEM PROFILE")}</span><h2>${flag(entity)}${esc(selectedName())}</h2></div><span class="pisa-layer-tag">${tr("официальные домены ОЭСР + производная оценка GIR", "official OECD domains + GIR-derived score")}</span></header>`;
  }
  function profileMetrics() {
    const p = selectedResult();
    const values = selectedAvailable() ? [
      [tr("Оценка GIR", "GIR score"), fmt(p.score, 1), tr("баллы PISA", "PISA points")],
      [tr("Место", "Rank"), isDiagnostic() ? "—" : intFmt(p.rank), isDiagnostic() ? tr("не присваивается", "not assigned") : `${tr("из", "of")} ${intFmt(ranking().reporting_entities)}`],
      [tr("Процентиль", "Percentile"), isDiagnostic() ? "—" : `${fmt(p.percentile, 1)}%`, tr("в том же цикле", "within the same cycle")],
      [tr("Разрыв к ОЭСР", "Gap to OECD"), signed(p.gap_to_oecd_composite, 1), tr("баллы", "points")],
    ] : [
      [tr("Оценка GIR", "GIR score"), "—", tr("нет наблюдения", "no observation")],
      [tr("Место", "Rank"), "—", tr("не рассчитывается", "not calculated")],
      [tr("Процентиль", "Percentile"), "—", tr("не рассчитывается", "not calculated")],
      [tr("Домены", "Domains"), "0 / 3", tr("в цикле 2022", "in the 2022 cycle")],
    ];
    return `<div class="pisa-profile-metrics">${values.map(([label, value, note]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`).join("")}</div>`;
  }
  function noDataProfile() {
    return `<div class="pisa-no-data"><span class="pisa-no-data-mark" aria-hidden="true">∅</span><h3>${tr("Для выбранной страны нет результата PISA 2022", "No PISA 2022 result is available for the selected country")}</h3><p>${esc(lang() === "ru" ? profile().availability_reason_ru : profile().availability_reason_en)} ${tr("Система не подставляет ноль, не переносит результат прежнего цикла и не создаёт proxy-оценку. Международное поле 2022 остаётся доступным для исследования.", "The system does not insert a zero, carry forward an older cycle or create a proxy score. The 2022 international field remains available for research.")}</p><div class="pisa-no-data-actions"><button type="button" class="pisa-button is-primary" data-pisa-select-top>${tr("Показать лидирующую систему", "Show the leading system")}</button><button type="button" class="pisa-button" data-pisa-view="international">${tr("Открыть международное поле", "Open international field")}</button></div></div>`;
  }
  function domainRows() {
    if (!selectedAvailable()) return noDataProfile();
    const scaleMin = Math.min(300, ...rows().flatMap((row) => DOMAIN_ORDER.map((code) => domainValue(row, code))).filter(Number.isFinite));
    const scaleMax = Math.max(600, ...rows().flatMap((row) => DOMAIN_ORDER.map((code) => domainValue(row, code))).filter(Number.isFinite));
    return `<div class="pisa-domain-list">${selectedComponents().map((component) => {
      const value = Number(component.mean_score);
      const average = Number(component.oecd_average);
      const width = Math.max(0, Math.min(100, ((value - scaleMin) / (scaleMax - scaleMin)) * 100));
      const marker = Math.max(0, Math.min(100, ((average - scaleMin) / (scaleMax - scaleMin)) * 100));
      return `<div class="pisa-domain-row"><div><b>${esc(local(component, "name_ru", "name_en", domainName(component.domain_code)))}</b><span>${tr("официальное среднее ОЭСР · таблица", "official OECD mean · table")} ${esc(component.source_table || "—")}</span></div><strong>${fmt(value, 0)}</strong><span class="pisa-gap ${gapClass(component.gap_to_oecd_average)}">${signed(component.gap_to_oecd_average, 0)}</span><div class="pisa-domain-track" aria-label="${esc(domainName(component.domain_code))}: ${fmt(value, 0)}; ${tr("среднее ОЭСР", "OECD average")}: ${fmt(average, 0)}"><i style="width:${width}%"></i><em style="left:${marker}%"></em></div></div>`;
    }).join("")}</div>`;
  }
  function selectedProfilePanel(span = 7) {
    return `<article class="pisa-panel span-${span}">${profileHeader()}${profileMetrics()}${domainRows()}${selectedAvailable() ? `<footer class="pisa-panel-footer"><span>${tr("Маркер на каждой шкале показывает среднее ОЭСР.", "The marker on each scale shows the OECD average.")}</span><button type="button" class="pisa-link-button" data-pisa-view="profile">${tr("Разобрать профиль", "Inspect profile")} →</button></footer>` : ""}</article>`;
  }

  function benchmarkPanel() {
    const top = topSystem();
    const topName = top ? rowName(top) : "—";
    return `<article class="pisa-panel span-5"><header><div class="pisa-panel-title"><span>${tr("МЕЖДУНАРОДНЫЕ ОРИЕНТИРЫ", "INTERNATIONAL BENCHMARKS")}</span><h2>${tr("Три предметных шкалы", "Three domain scales")}</h2><p>${tr("Официальные средние результаты доменов не смешиваются с описательным местом GIR.", "Official domain means remain separate from the descriptive GIR rank.")}</p></div><span class="pisa-layer-tag">OECD PISA 2022</span></header><div class="pisa-domain-list">${DOMAIN_ORDER.map((code) => {
      const topValue = top ? domainValue(top, code) : null;
      const avg = oecdAverage(code);
      return `<div class="pisa-domain-row"><div><b>${esc(domainName(code))}</b><span>${tr("среднее ОЭСР", "OECD average")} ${fmt(avg, 0)}</span></div><strong>${fmt(topValue, 0)}</strong><span class="pisa-gap is-positive">${topValue == null ? "—" : signed(topValue - avg, 0)}</span><div class="pisa-domain-track"><i style="width:${Math.max(0, Math.min(100, ((topValue || 300) - 300) / 3))}%"></i><em style="left:${Math.max(0, Math.min(100, (avg - 300) / 3))}%"></em></div></div>`;
    }).join("")}</div><footer class="pisa-panel-footer"><span>${tr("Лидер сводного поля", "Composite field leader")}: <b>${esc(topName)}</b> · ${fmt(top?.score, 1)}</span><button type="button" class="pisa-link-button" data-pisa-select-top>${tr("Открыть профиль", "Open profile")} →</button></footer></article>`;
  }

  function histogramSvg() {
    const values = rows().map((row) => Number(row.score)).filter(Number.isFinite);
    if (!values.length) return `<div class="pisa-empty-chart">${tr("Распределение недоступно в диагностическом режиме.", "The distribution is unavailable in diagnostic mode.")}</div>`;
    const W = 720, H = 260, pad = { l: 42, r: 18, t: 20, b: 38 };
    const min = Math.floor(Math.min(...values) / 20) * 20;
    const max = Math.ceil(Math.max(...values) / 20) * 20;
    const bins = 12;
    const step = (max - min) / bins;
    const counts = Array.from({ length: bins }, () => 0);
    values.forEach((value) => { const index = Math.min(bins - 1, Math.max(0, Math.floor((value - min) / step))); counts[index] += 1; });
    const maxCount = Math.max(...counts, 1);
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
    const barW = plotW / bins;
    const selected = selectedResult()?.score;
    const sx = selected == null ? null : pad.l + ((selected - min) / (max - min)) * plotW;
    const ox = pad.l + ((Number(benchmarks().oecd_composite_gir) - min) / (max - min)) * plotW;
    return `<div class="pisa-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="pisaHistTitle pisaHistDesc"><title id="pisaHistTitle">${tr("Распределение сводной оценки PISA", "PISA composite score distribution")}</title><desc id="pisaHistDesc">${tr("Гистограмма 81 образовательной системы; вертикальная линия показывает справочное среднее ОЭСР, выбранная система выделена.", "Histogram of 81 education systems; the vertical line marks the OECD reference mean and the selected system is highlighted.")}</desc>
      ${[0, .25, .5, .75, 1].map((p) => { const y = pad.t + plotH * (1 - p); return `<line class="grid" x1="${pad.l}" x2="${W-pad.r}" y1="${y}" y2="${y}"></line><text class="label" x="${pad.l-8}" y="${y+3}" text-anchor="end">${Math.round(maxCount*p)}</text>`; }).join("")}
      ${counts.map((count, index) => { const height = (count / maxCount) * plotH; const x = pad.l + index * barW + 2; const binStart = min + index * step; const binEnd = binStart + step; const isSelected = selected != null && selected >= binStart && (index === bins - 1 ? selected <= binEnd : selected < binEnd); return `<rect class="bar ${isSelected ? "is-selected" : ""}" x="${x}" y="${pad.t+plotH-height}" width="${Math.max(2,barW-4)}" height="${height}"><title>${fmt(binStart,0)}–${fmt(binEnd,0)}: ${count}</title></rect>`; }).join("")}
      <line class="benchmark" x1="${ox}" x2="${ox}" y1="${pad.t}" y2="${pad.t+plotH}"></line>
      ${sx == null ? "" : `<line class="median" x1="${sx}" x2="${sx}" y1="${pad.t}" y2="${pad.t+plotH}"></line>`}
      <line class="axis" x1="${pad.l}" x2="${W-pad.r}" y1="${pad.t+plotH}" y2="${pad.t+plotH}"></line>
      ${Array.from({length:6},(_,i)=>{ const value=min+(max-min)*i/5; const x=pad.l+plotW*i/5; return `<text class="label" x="${x}" y="${H-12}" text-anchor="middle">${fmt(value,0)}</text>`; }).join("")}
    </svg></div>`;
  }
  function distributionPanel(span = 7) {
    return `<article class="pisa-panel span-${span}"><header><div class="pisa-panel-title"><span>${tr("РАСПРЕДЕЛЕНИЕ", "DISTRIBUTION")}</span><h2>${tr("Международное поле сводной оценки", "International composite field")}</h2><p>${tr("Равновзвешенное среднее GIR сохраняет шкалу баллов PISA.", "The equal-domain GIR mean preserves the PISA point scale.")}</p></div><span class="pisa-layer-tag">${tr("81 система · цикл 2022", "81 systems · 2022 cycle")}</span></header>${histogramSvg()}<div class="pisa-chart-legend"><span class="selected"><i></i>${tr("выбранная система", "selected system")}</span><span class="caution"><i></i>${tr("среднее ОЭСР", "OECD average")}</span></div></article>`;
  }

  function topRankingPanel() {
    const topRows = rows().slice(0, 8);
    return `<article class="pisa-panel span-5"><header><div class="pisa-panel-title"><span>${tr("ВЕРХНЯЯ ГРУППА", "LEADING GROUP")}</span><h2>${tr("Первые восемь систем", "Top eight systems")}</h2><p>${tr("Описательный порядок GIR, не официальный рейтинг ОЭСР.", "Descriptive GIR ordering, not an official OECD ranking.")}</p></div></header><div class="pisa-quality-list">${topRows.map((row) => `<div class="${qualityCaution(row) ? "is-warning" : ""}"><i aria-hidden="true"></i><b>${intFmt(row.rank)}. ${esc(rowName(row))}</b><strong>${fmt(row.score,1)}</strong><p>${tr("Математика", "Math")} ${fmt(row.mathematics,0)} · ${tr("Чтение", "Reading")} ${fmt(row.reading,0)} · ${tr("Науки", "Science")} ${fmt(row.science,0)}</p></div>`).join("")}</div><footer class="pisa-panel-footer"><span>${tr("Равные scores получают одинаковое competition rank.", "Equal scores receive the same competition rank.")}</span><button type="button" class="pisa-link-button" data-pisa-view="international">${tr("Полный рейтинг", "Full ranking")} →</button></footer></article>`;
  }

  function overviewView() {
    return `<section class="pisa-view" id="pisaViewoverview" role="tabpanel" aria-labelledby="pisaTaboverview">${kpiStrip()}<div class="pisa-grid">${selectedProfilePanel(7)}${benchmarkPanel()}${distributionPanel(7)}${topRankingPanel()}</div><div class="pisa-callout"><strong>${tr("Методическая граница", "Methodological boundary")}</strong><p>${tr("ОЭСР публикует три предметных средних. GIR рассчитывает их прозрачное равновзвешенное среднее только для аналитического сопоставления; это не официальный сводный индекс или официальный рейтинг ОЭСР.", "OECD publishes three domain means. GIR calculates a transparent equal-domain mean only for analytical comparison; it is not an official OECD composite or official OECD ranking.")}</p></div></section>`;
  }

  function compositePanel() {
    if (!selectedAvailable()) return `<article class="pisa-panel span-5"><header><div class="pisa-panel-title"><span>${tr("СВОДНАЯ ОЦЕНКА GIR", "GIR COMPOSITE")}</span><h2>${tr("Расчёт не выполняется", "No calculation")}</h2></div></header>${noDataProfile()}</article>`;
    const components = selectedComponents();
    const total = components.reduce((sum, item) => sum + Number(item.weighted_contribution || 0), 0);
    return `<article class="pisa-panel span-5"><header><div class="pisa-panel-title"><span>${tr("СВОДНАЯ ОЦЕНКА GIR", "GIR COMPOSITE")}</span><h2>${tr("Арифметика результата", "Score arithmetic")}</h2><p>${tr("Три официальных домена имеют одинаковый вес 1/3.", "The three official domains have equal one-third weights.")}</p></div><span class="pisa-layer-tag">${tr("производная оценка", "derived score")}</span></header><div class="pisa-composite-formula"><div class="pisa-formula">(${components.map((item) => fmt(item.mean_score,0)).join(" + ")}) / 3 = ${fmt(selectedResult().score,1)}</div>${components.map((item) => `<div class="pisa-contribution"><b>${esc(local(item,"name_ru","name_en",item.domain_code))}</b><strong>+${fmt(item.weighted_contribution,1)}</strong><div class="pisa-contribution-track"><i style="width:${Math.max(0,Math.min(100,Number(item.weighted_contribution)/2.1))}%"></i></div></div>`).join("")}<div class="pisa-reconcile"><span>${tr("Сумма вкладов", "Sum of contributions")}</span><strong>${fmt(total,6)}</strong></div><button type="button" class="pisa-button" data-pisa-provenance="${esc(selectedResult().provenance_id)}">${tr("Происхождение итоговой оценки", "Composite provenance")}</button></div></article>`;
  }

  function domainEvidencePanel() {
    if (!selectedAvailable()) return selectedProfilePanel(7);
    return `<article class="pisa-panel span-7"><header><div class="pisa-panel-title"><span>${tr("ОФИЦИАЛЬНЫЕ ПРЕДМЕТНЫЕ РЕЗУЛЬТАТЫ", "OFFICIAL DOMAIN RESULTS")}</span><h2>${esc(selectedName())}</h2><p>${tr("Баллы, международный ориентир, источник и доказательная карточка для каждого домена.", "Scores, international benchmark, source and evidence card for every domain.")}</p></div><span class="pisa-layer-tag">OECD · ${esc(selectedComponents()[0]?.source_table ? "Annex B1" : "PISA 2022")}</span></header><div class="pisa-domain-list">${selectedComponents().map((item) => `<div class="pisa-domain-row"><div><b>${esc(local(item,"name_ru","name_en",item.domain_code))}</b><span>${tr("официальная таблица", "official table")} ${esc(item.source_table)} · ${tr("вес в GIR", "GIR weight")} 33,3%</span></div><strong>${fmt(item.mean_score,0)}</strong><button type="button" class="pisa-link-button" data-pisa-provenance="${esc(item.provenance_id)}">${tr("Источник", "Evidence")}</button><div class="pisa-domain-track"><i style="width:${Math.max(0,Math.min(100,(Number(item.mean_score)-300)/3))}%"></i><em style="left:${Math.max(0,Math.min(100,(Number(item.oecd_average)-300)/3))}%"></em></div></div>`).join("")}</div><footer class="pisa-panel-footer"><span>${selectedEntity()?.scope_note_ru || selectedEntity()?.scope_note_en ? esc(lang()==="ru" ? selectedEntity().scope_note_ru : selectedEntity().scope_note_en) : tr("Полная национальная или отдельно публикуемая образовательная система.", "National or separately reported education system.")}</span></footer></article>`;
  }

  function cycleLedgerPanel() {
    const series = model?.trends?.series || [];
    return `<article class="pisa-panel span-12"><header><div class="pisa-panel-title"><span>${tr("ВРЕМЕННАЯ СОПОСТАВИМОСТЬ", "TIME COMPARABILITY")}</span><h2>${tr("Загруженные циклы и правила динамики", "Loaded cycles and trend rules")}</h2><p>${tr("Система не строит ложную многолетнюю линию по единственной точке и не переносит результаты между циклами.", "The platform does not draw a false multi-year line from one point or carry results across cycles.")}</p></div></header><div class="pisa-quality-summary"><div><span>${tr("Загруженные циклы", "Loaded cycles")}</span><strong>${intFmt(status().available_cycles?.length || 1)}</strong></div><div><span>${tr("Математика сопоставима с", "Math comparable since")}</span><strong>2003</strong></div><div><span>${tr("Чтение сопоставимо с", "Reading comparable since")}</span><strong>2000</strong></div><div><span>${tr("Науки сопоставимы с", "Science comparable since")}</span><strong>2006</strong></div></div><div class="pisa-panel-body">${series.length ? `<div class="pisa-table-region" role="region" aria-label="${tr("Загруженные циклы", "Loaded cycles")}" tabindex="0"><table class="pisa-table"><caption>${tr("Загруженные результаты выбранной системы", "Loaded results for the selected system")}</caption><thead><tr><th>${tr("Цикл", "Cycle")}</th><th>${tr("Система", "System")}</th><th>${tr("Сводная оценка", "Composite")}</th><th>${tr("Математика", "Mathematics")}</th><th>${tr("Чтение", "Reading")}</th><th>${tr("Науки", "Science")}</th></tr></thead><tbody>${series.map((item)=>`<tr><td>${item.cycle_year}</td><td>${esc(selectedName())}</td><td>${fmt(item.score,1)}</td><td>${fmt(item.mathematics,0)}</td><td>${fmt(item.reading,0)}</td><td>${fmt(item.science,0)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="pisa-empty-chart">${tr("Для выбранной системы нет загруженных циклов.", "No loaded cycles are available for the selected system.")}</div>`}</div></article>`;
  }
  function profileView() {
    return `<section class="pisa-view" id="pisaViewprofile" role="tabpanel" aria-labelledby="pisaTabprofile">${kpiStrip()}<div class="pisa-grid">${domainEvidencePanel()}${compositePanel()}${cycleLedgerPanel()}</div><div class="pisa-callout"><strong>${tr("Интерпретация места", "Rank interpretation")}</strong><p>${tr("Место GIR — описательный порядок точечных средних. Оно не доказывает статистически значимое отличие от соседних систем. Для такого вывода нужны стандартные ошибки и процедуры множественных сравнений ОЭСР.", "The GIR rank is a descriptive ordering of point estimates. It does not establish a statistically significant difference from neighbouring systems; that requires OECD standard errors and multiple-comparison procedures.")}</p></div></section>`;
  }

  function scatterSvg() {
    const data = rows().filter((row) => Number.isFinite(domainValue(row, ui.scatterX)) && Number.isFinite(domainValue(row, ui.scatterY)));
    if (!data.length) return `<div class="pisa-empty-chart">${tr("Scatterplot доступен только в сопоставимом режиме.", "The scatterplot is available only in the comparable mode.")}</div>`;
    const W=760,H=380,pad={l:55,r:28,t:24,b:48};
    const xVals=data.map((row)=>domainValue(row,ui.scatterX)), yVals=data.map((row)=>domainValue(row,ui.scatterY));
    const xMin=Math.floor((Math.min(...xVals)-10)/20)*20, xMax=Math.ceil((Math.max(...xVals)+10)/20)*20;
    const yMin=Math.floor((Math.min(...yVals)-10)/20)*20, yMax=Math.ceil((Math.max(...yVals)+10)/20)*20;
    const pw=W-pad.l-pad.r, ph=H-pad.t-pad.b;
    const x=(value)=>pad.l+((value-xMin)/(xMax-xMin))*pw, y=(value)=>pad.t+ph-((value-yMin)/(yMax-yMin))*ph;
    const avgX=oecdAverage(ui.scatterX), avgY=oecdAverage(ui.scatterY);
    const labels = new Set([selectedCode(), ...data.slice(0,3).map((row)=>row.entity_code)]);
    return `<div class="pisa-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="pisaScatterTitle pisaScatterDesc"><title id="pisaScatterTitle">${esc(domainName(ui.scatterX))} × ${esc(domainName(ui.scatterY))}</title><desc id="pisaScatterDesc">${tr("Каждая точка представляет образовательную систему. Пунктирные линии показывают средние ОЭСР; выбранная система выделена.", "Each point represents an education system. Dashed lines mark OECD averages and the selected system is highlighted.")}</desc>
      ${[0,.25,.5,.75,1].map((p)=>{ const xx=pad.l+pw*p, yy=pad.t+ph*(1-p); return `<line class="grid" x1="${xx}" x2="${xx}" y1="${pad.t}" y2="${pad.t+ph}"></line><line class="grid" x1="${pad.l}" x2="${pad.l+pw}" y1="${yy}" y2="${yy}"></line><text class="label" x="${xx}" y="${H-18}" text-anchor="middle">${fmt(xMin+(xMax-xMin)*p,0)}</text><text class="label" x="${pad.l-8}" y="${yy+3}" text-anchor="end">${fmt(yMin+(yMax-yMin)*p,0)}</text>`; }).join("")}
      <line class="benchmark" x1="${x(avgX)}" x2="${x(avgX)}" y1="${pad.t}" y2="${pad.t+ph}"></line><line class="benchmark" x1="${pad.l}" x2="${pad.l+pw}" y1="${y(avgY)}" y2="${y(avgY)}"></line>
      ${data.map((row)=>{ const selected=row.entity_code===selectedCode(); const caution=qualityCaution(row); return `<circle class="dot ${selected?"is-selected":""} ${caution&&!selected?"is-caution":""}" cx="${x(domainValue(row,ui.scatterX))}" cy="${y(domainValue(row,ui.scatterY))}" r="${selected?5:3.2}" tabindex="0" data-pisa-row="${esc(row.entity_code)}"><title>${esc(rowName(row))}: ${fmt(domainValue(row,ui.scatterX),0)} / ${fmt(domainValue(row,ui.scatterY),0)}</title></circle>${labels.has(row.entity_code)?`<text class="direct-label" x="${x(domainValue(row,ui.scatterX))+7}" y="${y(domainValue(row,ui.scatterY))-6}">${esc(row.entity_code)}</text>`:""}`; }).join("")}
      <text class="direct-label" x="${pad.l+pw/2}" y="${H-2}" text-anchor="middle">${esc(domainName(ui.scatterX))}</text><text class="direct-label" transform="translate(13 ${pad.t+ph/2}) rotate(-90)" text-anchor="middle">${esc(domainName(ui.scatterY))}</text>
    </svg></div>`;
  }

  function filteredRows() {
    const query = ui.query.trim().toLocaleLowerCase(lang() === "ru" ? "ru" : "en");
    return rows().filter((row) => {
      const matchQuery = !query || `${rowName(row)} ${row.entity_code} ${row.iso3 || ""}`.toLocaleLowerCase(lang() === "ru" ? "ru" : "en").includes(query);
      const matchType = ui.entityType === "all" || row.entity_type === ui.entityType;
      const caution = qualityCaution(row);
      const matchCaution = ui.caution === "all" || (ui.caution === "caution" ? caution : !caution);
      return matchQuery && matchType && matchCaution;
    });
  }
  function rankingTable() {
    const filtered = filteredRows();
    const pages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
    ui.page = Math.min(ui.page, pages);
    const start = (ui.page - 1) * ui.pageSize;
    const slice = filtered.slice(start, start + ui.pageSize);
    return `<article class="pisa-panel span-12"><header><div class="pisa-panel-title"><span>${tr("МЕЖДУНАРОДНЫЙ РЕЙТИНГ GIR", "GIR INTERNATIONAL ORDERING")}</span><h2>${tr("Образовательные системы PISA 2022", "PISA 2022 education systems")}</h2><p>${tr("Описательная сортировка равновзвешенного среднего; официальные доменные значения остаются видимыми в отдельных столбцах.", "Descriptive sorting of the equal-domain mean; official domain values remain visible in separate columns.")}</p></div><a class="pisa-button" href="/api/index/PISA_SKI/workspace.csv?year=2022&mode=fixed_release">CSV ↓</a></header>
      <div class="pisa-table-tools"><input class="pisa-input" type="search" data-pisa-query value="${esc(ui.query)}" placeholder="${tr("Поиск системы или кода", "Search system or code")}" aria-label="${tr("Поиск образовательной системы", "Search education system")}"><select class="pisa-select" data-pisa-type aria-label="${tr("Тип системы", "System type")}"><option value="all">${tr("Все типы", "All types")}</option><option value="country" ${ui.entityType==="country"?"selected":""}>${tr("Страны", "Countries")}</option><option value="economy" ${ui.entityType==="economy"?"selected":""}>${tr("Экономики", "Economies")}</option><option value="adjudicated_subnational" ${ui.entityType==="adjudicated_subnational"?"selected":""}>${tr("Частичные территории", "Partial territories")}</option></select><select class="pisa-select" data-pisa-caution aria-label="${tr("Статус качества", "Quality status")}"><option value="all">${tr("Все статусы", "All statuses")}</option><option value="clean" ${ui.caution==="clean"?"selected":""}>${tr("Без оговорок", "No cautions")}</option><option value="caution" ${ui.caution==="caution"?"selected":""}>${tr("С оговорками", "With cautions")}</option></select><span class="pisa-toolbar-status"><i></i>${intFmt(filtered.length)} ${tr("систем", "systems")}</span></div>
      <div class="pisa-table-region" role="region" aria-label="${tr("Рейтинг PISA", "PISA ranking")}" tabindex="0"><table class="pisa-table"><caption>${tr("Рейтинг образовательных систем по производной оценке GIR", "Education systems ordered by the GIR-derived score")}</caption><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Система", "System")}</th><th>${tr("Тип", "Type")}</th><th>${tr("Оценка GIR", "GIR score")}</th><th>${tr("Математика", "Mathematics")}</th><th>${tr("Чтение", "Reading")}</th><th>${tr("Науки", "Science")}</th><th>${tr("Процентиль", "Percentile")}</th></tr></thead><tbody>${slice.map((row)=>`<tr class="${row.entity_code===selectedCode()?"is-selected":""}" tabindex="0" data-pisa-row="${esc(row.entity_code)}"><td>${intFmt(row.rank)}</td><td><div class="pisa-entity-cell">${flag(row)}<b>${esc(rowName(row))}</b>${qualityCaution(row)?`<span class="pisa-entity-badge is-caution">${tr("оговорка", "caution")}</span>`:""}</div></td><td><span class="pisa-entity-badge">${esc(entityKind(row))}</span></td><td><b>${fmt(row.score,1)}</b></td><td>${fmt(row.mathematics,0)}</td><td>${fmt(row.reading,0)}</td><td>${fmt(row.science,0)}</td><td>${fmt(row.percentile,1)}%</td></tr>`).join("")}</tbody></table></div>
      <div class="pisa-pagination"><span>${tr("Показано", "Showing")} ${filtered.length ? start+1 : 0}–${Math.min(start+ui.pageSize,filtered.length)} ${tr("из", "of")} ${intFmt(filtered.length)} · ${tr("страница", "page")} ${ui.page}/${pages}</span><div><button type="button" data-pisa-page="${ui.page-1}" ${ui.page<=1?"disabled":""}>← ${tr("Назад", "Previous")}</button><button type="button" data-pisa-page="${ui.page+1}" ${ui.page>=pages?"disabled":""}>${tr("Далее", "Next")} →</button></div></div>
    </article>`;
  }
  function internationalView() {
    if (isDiagnostic()) return `<section class="pisa-view" id="pisaViewinternational" role="tabpanel" aria-labelledby="pisaTabinternational">${kpiStrip()}<article class="pisa-panel span-12"><div class="pisa-no-data"><span class="pisa-no-data-mark">i</span><h3>${tr("Международный рейтинг отключён в диагностическом ASOF-режиме", "The international rank is disabled in diagnostic ASOF mode")}</h3><p>${tr("Диагностический режим может объединять последние доступные циклы и поэтому не должен создавать синхронное место. Переключитесь на сопоставимый цикл 2022 для scatterplot и рейтинга.", "The diagnostic mode may combine latest available cycles and therefore must not create a synchronous rank. Switch to the comparable 2022 cycle for the scatterplot and ranking.")}</p><button type="button" class="pisa-button is-primary" data-pisa-mode-button="fixed_release">${tr("Перейти к циклу 2022", "Open the 2022 cycle")}</button></div></article></section>`;
    return `<section class="pisa-view" id="pisaViewinternational" role="tabpanel" aria-labelledby="pisaTabinternational">${kpiStrip()}<div class="pisa-grid"><article class="pisa-panel span-12"><header><div class="pisa-panel-title"><span>${tr("СВЯЗЬ ПРЕДМЕТНЫХ РЕЗУЛЬТАТОВ", "DOMAIN RELATIONSHIP")}</span><h2>${tr("Двумерное поле образовательных систем", "Bivariate field of education systems")}</h2><p>${tr("Выберите две предметные шкалы; средние ОЭСР образуют четыре аналитических квадранта.", "Choose two domain scales; OECD averages form four analytical quadrants.")}</p></div></header><div class="pisa-chart-controls"><label class="pisa-field"><span>X</span><select class="pisa-select" data-pisa-scatter-x>${DOMAIN_ORDER.map((code)=>`<option value="${code}" ${ui.scatterX===code?"selected":""}>${esc(domainName(code))}</option>`).join("")}</select></label><label class="pisa-field"><span>Y</span><select class="pisa-select" data-pisa-scatter-y>${DOMAIN_ORDER.map((code)=>`<option value="${code}" ${ui.scatterY===code?"selected":""}>${esc(domainName(code))}</option>`).join("")}</select></label></div>${scatterSvg()}<div class="pisa-chart-legend"><span><i></i>${tr("система", "system")}</span><span class="selected"><i></i>${tr("выбранная", "selected")}</span><span class="caution"><i></i>${tr("методическая оговорка", "methodological caution")}</span></div></article>${rankingTable()}</div><div class="pisa-callout"><strong>${tr("Статистическая осторожность", "Statistical caution")}</strong><p>${tr("Близость точек или соседство в таблице не означают статистически значимого различия. PISA является выборочным обследованием; официальное сравнение должно учитывать standard errors и multiple comparisons.", "Nearby points or adjacent table positions do not imply a statistically significant difference. PISA is sample-based; official comparison must account for standard errors and multiple comparisons.")}</p></div></section>`;
  }

  function qualityView() {
    const warnings = ranking().warnings || {};
    const source = status().source || {};
    const latestImport = status().latest_import || {};
    const cautionRows = rows().filter(qualityCaution);
    return `<section class="pisa-view" id="pisaViewquality" role="tabpanel" aria-labelledby="pisaTabquality">${kpiStrip()}<div class="pisa-grid"><article class="pisa-panel span-7"><header><div class="pisa-panel-title"><span>${tr("ПОКРЫТИЕ И ОГОВОРКИ", "COVERAGE AND CAUTIONS")}</span><h2>${tr("Качество международного выпуска", "International release quality")}</h2><p>${tr("Quality flags не уменьшают score скрытым штрафом; они меняют способ интерпретации.", "Quality flags do not reduce scores through a hidden penalty; they change interpretation.")}</p></div></header><div class="pisa-quality-summary"><div><span>${tr("Системы", "Systems")}</span><strong>${intFmt(status().official_reporting_entities)}</strong></div><div><span>${tr("Профили стран", "Country profiles")}</span><strong>${intFmt(status().country_profile_eligible_entities)}</strong></div><div><span>${tr("Sampling cautions", "Sampling cautions")}</span><strong>${intFmt(warnings.sampling_caution_entities?.length || 0)}</strong></div><div><span>${tr("Частичные территории", "Partial territories")}</span><strong>${intFmt(warnings.subnational_entities?.length || 0)}</strong></div></div><div class="pisa-quality-list">${[
      [tr("Полный трёхдоменный выпуск", "Complete three-domain release"), `${intFmt(latestImport.domain_values_loaded || 243)} / ${intFmt((latestImport.entities_loaded || 81)*3)}`, tr("Для каждой публикуемой системы доступны математика, чтение и естественные науки.", "Mathematics, reading and science are available for every published system."), false],
      [tr("Sampling standards", "Sampling standards"), intFmt(warnings.sampling_caution_entities?.length || 0), tr("ОЭСР отмечает системы, где одно или несколько стандартов выборки не были выполнены.", "OECD flags systems where one or more sampling standards were not met."), true],
      [tr("Scale-link caution", "Scale-link caution"), intFmt(warnings.scale_link_caution_entities?.length || 0), tr("Отдельная оговорка указывает на проблемы привязки к международной шкале.", "A separate caution identifies difficulties linking to the international scale."), true],
      [tr("Субнациональный охват", "Subnational coverage"), intFmt(warnings.subnational_entities?.length || 0), tr("Такие записи остаются в международном поле, но не выдаются за полную национальную оценку.", "Such records remain in the international field but are not presented as full national estimates."), true],
    ].map(([title,value,copy,warning])=>`<div class="${warning?"is-warning":""}"><i></i><b>${esc(title)}</b><strong>${esc(value)}</strong><p>${esc(copy)}</p></div>`).join("")}</div></article><article class="pisa-panel span-5"><header><div class="pisa-panel-title"><span>${tr("SNAPSHOT И ВОСПРОИЗВОДИМОСТЬ", "SNAPSHOT AND REPRODUCIBILITY")}</span><h2>${tr("Доказательная версия", "Evidence release")}</h2></div></header><div class="pisa-method-card" style="border:0"><div><dl><dt>${tr("Источник", "Source")}</dt><dd>${esc(source.owner || "OECD")} · PISA</dd><dt>${tr("Файл", "File")}</dt><dd>${esc(latestImport.input_filename || "—")}</dd><dt>SHA-256</dt><dd><code>${esc(latestImport.file_sha256 || "—")}</code></dd><dt>${tr("Строки", "Rows")}</dt><dd>${intFmt(latestImport.rows_received)}</dd><dt>${tr("Статус", "Status")}</dt><dd>${esc(latestImport.publication_status || "—")}</dd><dt>${tr("Получено", "Retrieved")}</dt><dd>${esc(source.retrieved_at || latestImport.imported_at || "—")}</dd></dl><div class="pisa-source-links">${officialLink(source.source_url, tr("Официальная база", "Official database"))}<button type="button" class="pisa-button" data-pisa-provenance="${esc(selectedResult()?.provenance_id || "PISA_SKI:2022:SGP")}">${tr("Открыть provenance", "Open provenance")}</button></div></div></div></article><article class="pisa-panel span-12"><header><div class="pisa-panel-title"><span>${tr("ЦЕПОЧКА ПРЕОБРАЗОВАНИЯ", "TRANSFORMATION LINEAGE")}</span><h2>${tr("От официальной таблицы к аналитической оценке", "From official table to analytical score")}</h2></div></header><div class="pisa-lineage">${(model?.data_lineage || []).map((step)=>`<article><span>${step.step}</span><b>${esc(lang()==="ru"?step.ru:step.en)}</b><p>${esc(([tr("Загружаются опубликованные средние по трём доменам и сохраняется ссылка на таблицу ОЭСР.", "Published means for three domains are loaded with their OECD table references."),tr("Проверяются цикл, полнота, тип образовательной системы и территориальный охват.", "Cycle, completeness, system type and territorial scope are validated."),tr("Рассчитывается только прозрачное арифметическое среднее без нормализации и скрытого penalty.", "Only a transparent arithmetic mean is calculated, with no normalisation or hidden penalty."),tr("Создаётся описательный порядок GIR, quality flags и цепочка provenance.", "A descriptive GIR ordering, quality flags and provenance chain are produced.")])[step.step-1])}</p></article>`).join("")}</div></article></div>${cautionRows.length?`<div class="pisa-callout"><strong>${tr("Выбранная система", "Selected system")}</strong><p>${selectedAvailable()&&qualityCaution({...selectedResult(),...(selectedEntity()||{})})?tr("Текущий профиль имеет методическую оговорку; откройте профиль или provenance для точного основания.", "The current profile carries a methodological caution; open the profile or provenance for the exact basis."):tr("Текущий профиль не имеет sampling или scale-link flag в загруженном выпуске.", "The current profile has no sampling or scale-link flag in the loaded release.")}</p></div>`:""}</section>`;
  }

  function methodologyView() {
    const m = methodology();
    const official = m.official_assessment || {};
    const composite = m.gir_composite || {};
    const uncertainty = m.uncertainty || {};
    const scope = m.scope || {};
    const rights = m.source_and_rights || {};
    return `<section class="pisa-view" id="pisaViewmethodology" role="tabpanel" aria-labelledby="pisaTabmethodology"><div class="pisa-method-grid"><article class="pisa-method-card span-2"><header><span>${tr("ОФИЦИАЛЬНАЯ ОСНОВА", "OFFICIAL BASIS")}</span><h2>${esc(official.programme || "OECD PISA")}</h2></header><div><p>${esc(lang()==="ru"?official.target_population_ru:official.target_population_en)}. ${tr("PISA оценивает способность применять знания и умения в ситуациях реальной жизни, а не только воспроизводить школьную программу.", "PISA assesses the capacity to apply knowledge and skills in real-life situations rather than merely reproduce a school curriculum.")}</p><div class="pisa-domain-methods">${(official.domains||[]).map((item)=>`<article><span>${esc(item.code)} · ${(Number(item.weight)*100).toFixed(1)}%</span><h3>${esc(local(item,"name_ru","name_en",item.code))}</h3><p>${esc(lang()==="ru"?item.definition_ru:item.definition_en)}</p><small>${tr("Официальная таблица", "Official table")}: ${esc(item.official_table)} · ${tr("сопоставимый тренд с", "comparable trend since")} ${item.trend_start}</small></article>`).join("")}</div></div></article><article class="pisa-method-card"><header><span>${tr("ПРОИЗВОДНАЯ ОЦЕНКА GIR", "GIR-DERIVED SCORE")}</span><h2>${tr("Равные веса трёх доменов", "Equal weights for three domains")}</h2></header><div><div class="pisa-formula">${esc(composite.formula || "(MATHEMATICS + READING + SCIENCE) / 3")}</div><dl><dt>${tr("Нормализация", "Normalisation")}</dt><dd>${esc(composite.normalisation || "none")}</dd><dt>${tr("Вселенная", "Universe")}</dt><dd>${esc(composite.rank_universe || "—")}</dd><dt>${tr("Перенос между циклами", "Cross-cycle imputation")}</dt><dd>${composite.cross_cycle_imputation?tr("да", "yes"):tr("нет", "no")}</dd><dt>${tr("Скрытый штраф качества", "Hidden quality penalty")}</dt><dd>${composite.hidden_quality_penalty?tr("да", "yes"):tr("нет", "no")}</dd><dt>${tr("Официальный индекс ОЭСР", "Official OECD index")}</dt><dd>${tr("нет — аналитическая конструкция GIR", "no — GIR analytical construct")}</dd></dl></div></article><article class="pisa-method-card"><header><span>${tr("МЕСТО И ПРОЦЕНТИЛЬ", "RANK AND PERCENTILE")}</span><h2>${tr("Описательный порядок", "Descriptive ordering")}</h2></header><div><p>${esc(lang()==="ru"?composite.rank_method?.warning_ru:composite.rank_method?.warning_en)}</p><dl><dt>${tr("Равные значения", "Ties")}</dt><dd>${esc(composite.rank_method?.ties || "—")}</dd><dt>${tr("Процентиль", "Percentile")}</dt><dd>${esc(composite.rank_method?.percentile || "—")}</dd><dt>${tr("Официальное место ОЭСР", "Official OECD rank")}</dt><dd>${tr("не присваивается", "not assigned")}</dd></dl></div></article><article class="pisa-method-card"><header><span>${tr("НЕОПРЕДЕЛЁННОСТЬ", "UNCERTAINTY")}</span><h2>${tr("Выборочное обследование", "Sample-based assessment")}</h2></header><div><p>${esc(lang()==="ru"?uncertainty.reason_ru:uncertainty.reason_en)}</p><dl><dt>${tr("Standard errors доменов", "Domain standard errors")}</dt><dd>${uncertainty.domain_standard_errors_supported?tr("поддерживаются контрактом", "supported by contract"):tr("нет", "no")}</dd><dt>${tr("Загружены в текущем extract", "Loaded in current extract")}</dt><dd>${intFmt(status().domain_values_with_standard_error || 0)}</dd><dt>${tr("Интервал composite", "Composite interval")}</dt><dd>${uncertainty.composite_confidence_interval_published?tr("публикуется", "published"):tr("не рассчитывается без ковариаций", "not calculated without covariance")}</dd></dl></div></article><article class="pisa-method-card"><header><span>${tr("ТЕРРИТОРИАЛЬНЫЙ ОХВАТ", "TERRITORIAL SCOPE")}</span><h2>${tr("Страны, экономики и частичные выборки", "Countries, economies and partial samples")}</h2></header><div><p>${esc(lang()==="ru"?scope.policy_ru:scope.policy_en)}</p><dl><dt>${tr("Частичные записи", "Partial records")}</dt><dd>${esc((scope.subnational_reporting_entities||[]).join(", ")||"—")}</dd><dt>${tr("Не сопоставлены с реестром стран", "Unmapped to country registry")}</dt><dd>${esc((scope.country_registry_unmapped_entities||[]).join(", ")||"—")}</dd><dt>${tr("Публикация как профиль страны", "Country-profile publication")}</dt><dd>${tr("только при полном национальном охвате", "only with full national coverage")}</dd></dl></div></article><article class="pisa-method-card span-2"><header><span>${tr("ИСТОЧНИКИ И ПРАВА", "SOURCES AND RIGHTS")}</span><h2>${tr("Открытая доказательная база ОЭСР", "OECD open evidence base")}</h2></header><div><p>${esc(rights.attribution || "OECD, PISA 2022 Database and PISA 2022 Results (Volume I).")}</p><p>${esc(rights.adaptation_notice || "")}</p><div class="pisa-source-links">${officialLink(rights.results_url,tr("Отчёт PISA 2022", "PISA 2022 report"))}${officialLink(rights.database_url,tr("Public-use database", "Public-use database"))}${officialLink(rights.annex_url,tr("Таблицы результатов", "Results tables"))}${officialLink(rights.terms_url,tr("Условия ОЭСР", "OECD terms"))}</div></div></article></div><div class="pisa-callout"><strong>${tr("Ограничение интерпретации", "Interpretation limit")}</strong><p>${tr("PISA описывает результаты 15-летних учащихся и не является прямой оценкой всей школьной системы, качества отдельных школ или причин наблюдаемых различий. Корректный вывод требует учёта контекста, выборки, социально-экономического состава и статистической неопределённости.", "PISA describes outcomes among 15-year-old students and is not a direct assessment of an entire school system, individual schools or the causes of observed differences. Sound interpretation requires context, sampling, socio-economic composition and statistical uncertainty.")}</p></div></section>`;
  }

  function activeView() {
    if (ui.view === "profile") return profileView();
    if (ui.view === "international") return internationalView();
    if (ui.view === "quality") return qualityView();
    if (ui.view === "methodology") return methodologyView();
    return overviewView();
  }
  function renderPage({ preserveFocus = false } = {}) {
    if (!context?.root || !model) return;
    context.root.innerHTML = `<div class="pisa-workspace">${commandHeader()}${toolbar()}${tabs()}${activeView()}</div>`;
    bindEvents();
    if (preserveFocus) requestAnimationFrame(() => context.root.querySelector(`[data-pisa-view="${ui.view}"]`)?.focus());
  }

  function selectRow(code) {
    const row = rows().find((item) => item.entity_code === code);
    if (!row) return;
    context?.selectEntity?.(row.entity_code, row.iso3, rowName(row));
  }
  function bindEvents() {
    const root = context.root;
    root.querySelectorAll("[data-pisa-view]").forEach((button) => button.addEventListener("click", () => {
      ui.view = button.dataset.pisaView;
      renderPage({ preserveFocus: true });
    }));
    const tabsRoot = root.querySelector(".pisa-tabs");
    tabsRoot?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      const tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length-1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      ui.view = tabs[next].dataset.pisaView;
      renderPage();
      requestAnimationFrame(() => context.root.querySelector(`[data-pisa-view="${ui.view}"]`)?.focus());
    });
    root.querySelector("[data-pisa-entity]")?.addEventListener("change", (event) => {
      const code = event.target.value;
      const row = rows().find((item) => item.entity_code === code);
      context?.selectEntity?.(code, row?.iso3 || code, row ? rowName(row) : event.target.selectedOptions[0]?.textContent || code);
    });
    root.querySelector("[data-pisa-mode]")?.addEventListener("change", async (event) => {
      ui.mode = event.target.value === "latest_asof" ? "latest_asof" : "fixed_release";
      ui.page = 1;
      updateUrl();
      await rerenderWithLoad();
    });
    root.querySelectorAll("[data-pisa-mode-button]").forEach((button) => button.addEventListener("click", async () => {
      ui.mode = button.dataset.pisaModeButton;
      updateUrl();
      await rerenderWithLoad();
    }));
    root.querySelectorAll("[data-pisa-select-top]").forEach((button) => button.addEventListener("click", () => { const top = topSystem(); if (top) selectRow(top.entity_code); }));
    root.querySelectorAll("[data-pisa-row]").forEach((node) => {
      const activate = () => selectRow(node.dataset.pisaRow);
      node.addEventListener("click", activate);
      node.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
    root.querySelectorAll("[data-pisa-provenance]").forEach((button) => button.addEventListener("click", () => context?.openProvenance?.(button.dataset.pisaProvenance, button)));
    root.querySelector("[data-pisa-query]")?.addEventListener("input", (event) => { ui.query = event.target.value; ui.page = 1; renderPage(); requestAnimationFrame(() => { const input=context.root.querySelector("[data-pisa-query]"); input?.focus(); input?.setSelectionRange(ui.query.length,ui.query.length); }); });
    root.querySelector("[data-pisa-type]")?.addEventListener("change", (event) => { ui.entityType=event.target.value; ui.page=1; renderPage(); });
    root.querySelector("[data-pisa-caution]")?.addEventListener("change", (event) => { ui.caution=event.target.value; ui.page=1; renderPage(); });
    root.querySelectorAll("[data-pisa-page]").forEach((button) => button.addEventListener("click", () => { ui.page=Math.max(1,Number(button.dataset.pisaPage)); renderPage(); root.querySelector(".pisa-table-region")?.focus(); }));
    root.querySelector("[data-pisa-scatter-x]")?.addEventListener("change", (event) => { ui.scatterX=event.target.value; if(ui.scatterX===ui.scatterY) ui.scatterY=DOMAIN_ORDER.find((code)=>code!==ui.scatterX)||"READING"; renderPage(); });
    root.querySelector("[data-pisa-scatter-y]")?.addEventListener("change", (event) => { ui.scatterY=event.target.value; if(ui.scatterY===ui.scatterX) ui.scatterX=DOMAIN_ORDER.find((code)=>code!==ui.scatterY)||"MATHEMATICS"; renderPage(); });
  }

  async function rerenderWithLoad() {
    const token = ++loadToken;
    context.root.innerHTML = `<div class="pisa-loading"><span class="pisa-loading-mark">PISA</span><h1>${tr("Обновление аналитики", "Updating analytics")}</h1><p>${tr("Загружается выбранный режим сопоставления.", "Loading the selected comparison mode.")}</p></div>`;
    try {
      const payload = await load();
      if (token !== loadToken) return;
      model = payload;
      renderPage();
    } catch (error) {
      if (token !== loadToken) return;
      context.root.innerHTML = `<div class="pisa-error"><h1>${tr("Не удалось загрузить PISA", "Unable to load PISA")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="pisa-button" data-pisa-retry>${tr("Повторить", "Retry")}</button></div>`;
      context.root.querySelector("[data-pisa-retry]")?.addEventListener("click", () => { cache.clear(); rerenderWithLoad(); });
    }
  }

  async function render(nextContext) {
    context = nextContext;
    if (!context?.root || !selectedCode()) return;
    ui.mode = modeFromUrl();
    const token = ++loadToken;
    context.root.innerHTML = `<div class="pisa-loading"><span class="pisa-loading-mark">PISA</span><h1>${tr("PISA: знания школьников", "PISA School Knowledge")}</h1><p>${tr("Загружаются официальные доменные результаты, международное поле и доказательные метаданные.", "Loading official domain results, the international field and evidence metadata.")}</p></div>`;
    try {
      const payload = await load();
      if (token !== loadToken) return;
      model = payload;
      updateUrl();
      renderPage();
    } catch (error) {
      if (token !== loadToken) return;
      context.root.innerHTML = `<div class="pisa-error"><h1>${tr("Не удалось загрузить PISA", "Unable to load PISA")}</h1><p>${esc(error?.message || error)}</p></div>`;
    }
  }
  function invalidate() { model = null; }

  window.GIRPISASchool = { render, invalidate, _test: { cache, ui } };
})();
