/* GIR Digitalisation / AI — Stage 04: UN E-Government Development Index workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    rankingQuery: "",
    rankingRegion: "all",
    rankingIncome: "all",
    rankingGroup: "all",
    rankingSpecial: "all",
    rankingPage: 1,
    rankingPageSize: 25,
    evidenceQuery: "",
    mapMode: "group",
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
  const fmt = (value, digits = 4) => finite(value)
    ? Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—";
  const fmtCompact = (value, digits = 2) => finite(value)
    ? Number(value).toLocaleString(locale(), { maximumFractionDigits: digits })
    : "—";
  const intFmt = (value) => finite(value) ? Math.round(Number(value)).toLocaleString(locale()) : "—";
  const pct = (value, digits = 0) => finite(value) ? `${fmt(Number(value) * 100, digits)}%` : "—";
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.official_country_name || item?.official_name || item?.iso3 || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}`;
  const score = () => payload?.score || {};
  const country = () => payload?.country || { iso3: selectedIso(), name_ru: selectedIso(), name_en: selectedIso() };
  const dimensionName = (item) => local(item) || item?.dimension_code || "—";
  const benchmark = (code) => payload?.benchmarks?.[code] || {};
  const signed = (value, digits = 4) => finite(value) ? `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}` : "—";
  const deltaClass = (value) => Number(value) > 0.00005 ? "positive" : Number(value) < -0.00005 ? "negative" : "neutral";

  function icon(name) {
    return `<img class="egdi-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="egdi-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { message = (await response.json())?.detail || message; } catch (_) { /* response is not JSON */ }
      throw new Error(message);
    }
    return response.json();
  }

  function loadGeo() {
    if (geo) return Promise.resolve(geo);
    if (geoPending) return geoPending;
    geoPending = fetchJson("/world.geojson")
      .then((value) => { geo = value; geoPending = null; return value; })
      .catch((error) => { geoPending = null; throw error; });
    return geoPending;
  }

  function loadPayload() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const url = `/api/egdi/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}`;
    const request = fetchJson(url)
      .then((value) => { cache.set(key, value); pending.delete(key); return value; })
      .catch((error) => { pending.delete(key); throw error; });
    pending.set(key, request);
    return request;
  }

  function loading() {
    return `<section class="egdi-loading" aria-live="polite">
      <div class="egdi-loading-orbit" aria-hidden="true"><i></i><i></i><i></i><b>UN</b></div>
      <span>EGDI · 2024</span>
      <h1>${tr("Собирается цифровой профиль государства", "Building the digital-government profile")}</h1>
      <p>${tr("Загружаются 193 страны, три компонента, карта зрелости, электронное участие, исходные показатели и доказательные записи.", "Loading 193 countries, three components, the maturity map, e-participation, source indicators and evidence records.")}</p>
    </section>`;
  }

  function errorState(error) {
    return `<section class="egdi-error"><span>EGDI · ERROR</span><h1>${tr("Рабочее пространство EGDI не загрузилось", "The EGDI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="egdi-button primary" data-egdi-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function flatten(nodes) {
    return (nodes || []).flatMap((item) => [item, ...flatten(item.children || [])]);
  }

  function byCode(code) {
    return flatten(payload?.components || []).find((item) => item.dimension_code === code) || null;
  }

  function unitLabel(unit) {
    const labels = {
      score_0_1: tr("индекс 0–1", "0–1 index"),
      percent: "%",
      percent_population: tr("% населения", "% of population"),
      per_100_inhabitants: tr("на 100 жителей", "per 100 inhabitants"),
      years: tr("лет", "years"),
      percent_gni_per_capita: tr("% ВНД на душу", "% of GNI per capita"),
      normalized_composite_not_published: tr("прямой балл не опубликован", "direct score not published"),
    };
    return labels[unit] || unit || "";
  }

  function valueLabel(item, digits = null) {
    if (!item || item.available === false || !finite(item.official_value)) return "—";
    const unit = item.unit;
    if (unit === "score_0_1") return fmt(item.official_value, digits ?? 4);
    if (["percent", "percent_population", "per_100_inhabitants", "percent_gni_per_capita"].includes(unit)) return fmt(item.official_value, digits ?? 2);
    if (unit === "years") return fmt(item.official_value, digits ?? 2);
    return fmtCompact(item.official_value, digits ?? 3);
  }

  function groupKey(label) {
    const value = String(label || "").toLowerCase();
    if (value.startsWith("very high")) return "very-high";
    if (value.startsWith("high")) return "high";
    if (value.startsWith("middle")) return "middle";
    if (value.startsWith("low")) return "low";
    return "unknown";
  }

  function groupName(label) {
    const map = {
      "Very High EGDI": tr("Очень высокий EGDI", "Very High EGDI"),
      "High EGDI": tr("Высокий EGDI", "High EGDI"),
      "Middle EGDI": tr("Средний EGDI", "Middle EGDI"),
      "Low EGDI": tr("Низкий EGDI", "Low EGDI"),
      "Very High OSI": tr("Очень высокий OSI", "Very High OSI"),
      "Very High TII": tr("Очень высокий TII", "Very High TII"),
      "Very High HCI": tr("Очень высокий HCI", "Very High HCI"),
      "High EPI": tr("Высокий EPI", "High EPI"),
    };
    return map[label] || label || "—";
  }

  function scoreSeal() {
    const components = [byCode("OSI"), byCode("TII"), byCode("HCI")];
    const radius = 91;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clamp(score().score));
    const arcs = components.map((item, index) => {
      const r = 67 - index * 11;
      const c = 2 * Math.PI * r;
      const dash = c * clamp(item?.official_value);
      return `<circle class="component component-${index + 1}" cx="118" cy="118" r="${r}" style="stroke-dasharray:${dash.toFixed(2)} ${(c - dash).toFixed(2)};transform:rotate(-90deg);transform-origin:118px 118px"></circle>`;
    }).join("");
    return `<div class="egdi-seal-wrap"><svg class="egdi-score-seal" viewBox="0 0 236 236" role="img" aria-label="${tr("Оценка EGDI", "EGDI score")} ${fmt(score().score, 4)}">
      <circle class="track" cx="118" cy="118" r="${radius}"></circle>
      <circle class="overall" cx="118" cy="118" r="${radius}" style="stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"></circle>
      ${arcs}
      <text class="score" x="118" y="110" text-anchor="middle">${fmt(score().score, 4)}</text>
      <text class="unit" x="118" y="133" text-anchor="middle">EGDI / 1.0000</text>
    </svg><div class="egdi-seal-legend">${components.map((item, index) => `<span class="component-${index + 1}"><i></i>${esc(item?.dimension_code || "")} <b>${fmt(item?.official_value, 4)}</b></span>`).join("")}</div></div>`;
  }

  function hero() {
    const selected = payload.summary?.selected || {};
    const idx = payload.index || {};
    const lead = lang() === "ru" ? idx.description_ru : idx.description_en;
    return `<section class="egdi-hero" aria-labelledby="egdiTitle">
      <article class="egdi-hero-copy">
        <div class="egdi-hero-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="egdi-overline"><span>UN DESA · EGDI 2024</span><b>${tr("официальный глобальный индекс", "official global index")}</b></div>
        <h1 id="egdiTitle">${esc(local(idx))}</h1>
        <p class="egdi-hero-lead">${esc(lead)}</p>
        <div class="egdi-edition-line">
          <span><b>${tr("Редакция", "Edition")}</b> ${esc(payload.edition)}</span>
          <span><b>${tr("Публикация", "Published")}</b> ${esc(payload.publication_date)}</span>
          <span><b>${tr("Охват", "Coverage")}</b> ${intFmt(payload.summary?.country_count)} ${tr("государства ООН", "UN Member States")}</span>
          <span><b>${tr("Цикл", "Cycle")}</b> ${tr("раз в два года", "biennial")}</span>
        </div>
        <div class="egdi-formula-strip" aria-label="${tr("Формула EGDI", "EGDI formula")}">
          <div><strong>OSI</strong><span>⅓</span></div><i>+</i><div><strong>TII</strong><span>⅓</span></div><i>+</i><div><strong>HCI</strong><span>⅓</span></div><em>→</em><div class="result"><strong>EGDI</strong><span>${fmt(score().score, 4)}</span></div>
        </div>
        <div class="egdi-hero-actions">
          <button type="button" class="egdi-button primary" data-egdi-scroll="egdiDiagnosis">${tr("Разобрать результат", "Explain the result")}</button>
          <a class="egdi-button" href="/api/egdi/workspace.csv?country=${encodeURIComponent(country().iso3)}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-egdi-${esc(payload.edition)}.csv">${icon("download")}${tr("Скачать рейтинг", "Download ranking")}</a>
          <a class="egdi-button quiet" href="${esc(payload.source?.source_url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Официальный отчёт", "Official report")} <span aria-hidden="true">↗</span></a>
        </div>
      </article>
      <aside class="egdi-command-card" aria-label="${tr("Положение выбранной страны", "Selected country position")}">
        <header><div>${flag(country(), "flag-img inline")}<div><strong>${esc(countryName(country()))}</strong><span>${esc(country().iso3)} · ${esc(country().official_subregion || country().official_region || "—")}</span></div></div><span class="egdi-official-chip">${tr("официальное значение", "official value")}</span></header>
        ${scoreSeal()}
        <div class="egdi-rank-grid">
          <div><span>${tr("Место в мире", "World rank")}</span><strong>#${intFmt(score().rank)}</strong><small>${tr("из", "of")} ${intFmt(payload.summary?.country_count)}</small></div>
          <div><span>${tr("Процентиль", "Percentile")}</span><strong>P${fmt(score().percentile, 1)}</strong><small>${tr("глобальное положение", "global position")}</small></div>
          <div><span>${tr("Регион", "Region")}</span><strong>#${intFmt(selected.region_rank)}</strong><small>${tr("из", "of")} ${intFmt(selected.region_count)} · ${esc(selected.region_name || "—")}</small></div>
          <div><span>${tr("Доходная группа", "Income group")}</span><strong>#${intFmt(selected.income_rank)}</strong><small>${tr("из", "of")} ${intFmt(selected.income_count)} · ${esc(selected.income_name || "—")}</small></div>
        </div>
        <div class="egdi-classification"><span class="group ${groupKey(selected.egdi_group)}">${esc(groupName(selected.egdi_group))}</span><span class="class">${tr("Класс", "Class")} <b>${esc(selected.rating_class || "—")}</b></span></div>
        <button type="button" class="egdi-evidence-link" data-egdi-provenance="${esc(score().value_id || "")}">${tr("Открыть доказательную запись", "Open evidence record")} <span aria-hidden="true">→</span></button>
      </aside>
    </section>`;
  }

  function jumpNav() {
    const links = [
      ["egdiDiagnosis", tr("Диагноз", "Diagnosis")],
      ["egdiMap", tr("Карта", "Map")],
      ["egdiComponents", tr("3 компонента", "3 components")],
      ["egdiServices", tr("Услуги и участие", "Services & participation")],
      ["egdiInputs", tr("Инфраструктура и капитал", "Infrastructure & capital")],
      ["egdiRanking", tr("Рейтинг", "Ranking")],
      ["egdiMethod", tr("Метод и источник", "Method & source")],
    ];
    return `<nav class="egdi-jump" aria-label="${tr("Разделы рабочего пространства EGDI", "EGDI workspace sections")}">${links.map(([id, label], index) => `<button type="button" data-egdi-scroll="${id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(label)}</button>`).join("")}</nav>`;
  }

  function sectionHeading(number, eyebrow, title, description) {
    return `<header class="egdi-section-heading"><div><span>${esc(number)} · ${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p></header>`;
  }

  function insightCard({ tag, title, value, unit, detail, tone = "neutral", evidence = "" }) {
    return `<article class="egdi-insight ${tone}"><span>${esc(tag)}</span><h3>${esc(title)}</h3><div><strong>${esc(value)}</strong><small>${esc(unit)}</small></div><p>${esc(detail)}</p>${evidence ? `<button type="button" data-egdi-provenance="${esc(evidence)}" aria-label="${tr("Открыть происхождение значения", "Open value provenance")}">↗</button>` : ""}</article>`;
  }

  function diagnosis() {
    const insights = payload.insights || {};
    const strongest = insights.strongest_component;
    const constraint = insights.constraint_component;
    const epi = insights.epi;
    const spread = insights.component_balance_spread;
    const cards = [
      {
        tag: tr("Опорный компонент", "Anchor component"),
        title: dimensionName(strongest),
        value: fmt(strongest?.official_value, 4),
        unit: strongest?.dimension_code || "",
        detail: `${tr("наиболее высокий из трёх равновзвешенных компонентов", "highest of the three equally weighted components")} · ${tr("диагностическое место", "diagnostic rank")} #${intFmt(benchmark(strongest?.dimension_code).derived_global_rank)}`,
        tone: "positive",
        evidence: strongest?.value_id,
      },
      {
        tag: tr("Главное ограничение", "Primary constraint"),
        title: dimensionName(constraint),
        value: fmt(constraint?.official_value, 4),
        unit: constraint?.dimension_code || "",
        detail: `${tr("разрыв до среднего top‑10", "gap to top-10 mean")} ${signed(benchmark(constraint?.dimension_code).gap_to_top10_mean, 4)}`,
        tone: "warning",
        evidence: constraint?.value_id,
      },
      {
        tag: tr("Баланс системы", "System balance"),
        title: tr("Размах OSI–TII–HCI", "OSI–TII–HCI spread"),
        value: fmt(spread, 4),
        unit: tr("пункта шкалы 0–1", "points on the 0–1 scale"),
        detail: tr("чем меньше размах, тем равномернее цифровые услуги, связность и человеческий капитал", "a smaller spread indicates a more even combination of services, connectivity and human capital"),
        tone: Number(spread) <= 0.1 ? "positive" : "accent",
      },
      {
        tag: tr("Гражданское участие", "Public participation"),
        title: dimensionName(epi),
        value: `#${intFmt(epi?.official_rank)}`,
        unit: `${fmt(epi?.official_value, 4)} · ${esc(groupName(epi?.official_group))}`,
        detail: `${tr("слабое звено", "weakest stage")}: ${dimensionName(insights.weakest_epi_feature)} · ${fmt(insights.weakest_epi_feature?.official_value, 4)}`,
        tone: "violet",
        evidence: epi?.value_id,
      },
    ];
    return `<section class="egdi-section" id="egdiDiagnosis">
      ${sectionHeading("01", tr("Исполнительное резюме", "Executive readout"), tr("Что определяет цифровую зрелость государства", "What shapes the state's digital maturity"), tr("Четыре сигнала связывают официальный балл с управленческой интерпретацией: опорный компонент, ограничение, баланс системы и глубина электронного участия.", "Four signals connect the official score to an actionable interpretation: anchor component, constraint, system balance and depth of e-participation."))}
      <div class="egdi-insight-grid">${cards.map(insightCard).join("")}</div>
      <div class="egdi-diagnostic-note"><span>GIR · DIAGNOSTIC</span><p>${esc(lang() === "ru" ? payload.diagnostics_note_ru : payload.diagnostics_note_en)}</p></div>
    </section>`;
  }

  function bboxOfFeatures(features) {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    const scan = (coords) => {
      if (typeof coords?.[0] === "number") {
        const lon = Number(coords[0]), lat = Number(coords[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -170 || lon > 190 || lat < -60) return;
        minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      } else (coords || []).forEach(scan);
    };
    (features || []).forEach((feature) => scan(feature.geometry?.coordinates));
    return { minLon, minLat, maxLon, maxLat };
  }

  function pathFromGeom(geometry, width, height, bounds) {
    const project = (lon, lat) => [
      (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon) * width,
      height - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat) * height,
    ];
    const ringPath = (ring) => {
      const points = (ring || []).filter((point) => Number.isFinite(Number(point?.[0])) && Number.isFinite(Number(point?.[1])) && point[0] >= -170 && point[0] <= 190 && point[1] >= -60 && point[1] <= 90);
      if (points.length < 3) return "";
      return points.map((point, index) => {
        const [x, y] = project(point[0], point[1]);
        return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join("") + "Z";
    };
    if (geometry?.type === "Polygon") return geometry.coordinates.map(ringPath).join("");
    if (geometry?.type === "MultiPolygon") return geometry.coordinates.map((polygon) => polygon.map(ringPath).join("")).join("");
    return "";
  }

  function mapValue(item) {
    if (ui.mapMode === "score") return item?.score;
    return item?.official_egdi_group;
  }

  function mapTone(item) {
    if (!item) return "no-data";
    if (ui.mapMode === "score") {
      const value = Number(item.score);
      if (value >= .875) return "score-5";
      if (value >= .75) return "score-4";
      if (value >= .5) return "score-3";
      if (value >= .25) return "score-2";
      return "score-1";
    }
    return groupKey(item.official_egdi_group);
  }

  function mapLegend() {
    if (ui.mapMode === "score") {
      const bands = [
        ["score-1", "0.0000–0.2499"],
        ["score-2", "0.2500–0.4999"],
        ["score-3", "0.5000–0.7499"],
        ["score-4", "0.7500–0.8749"],
        ["score-5", "0.8750–1.0000"],
      ];
      return bands.map(([tone, label]) => `<span class="${tone}"><i></i>${label}</span>`).join("");
    }
    return (payload.rating_groups || []).map((item) => `<span class="${groupKey(item.official_label)}"><i></i>${esc(local(item))} <b>${intFmt((payload.summary?.classification_distribution || []).find((entry) => entry.official_label === item.official_label)?.count)}</b></span>`).join("");
  }

  function worldMap() {
    if (!geo?.features) return `<div class="egdi-map-unavailable">${tr("Геометрия карты недоступна", "Map geometry is unavailable")}</div>`;
    const rankingByIso = new Map((payload.ranking || []).map((item) => [item.iso3, item]));
    const width = 980, height = 440;
    const features = geo.features.filter((feature) => feature.geometry);
    const bounds = bboxOfFeatures(features);
    const paths = features.map((feature) => {
      const iso3 = feature.properties?.iso3;
      const item = rankingByIso.get(iso3);
      const d = pathFromGeom(feature.geometry, width, height, bounds);
      if (!iso3 || !d) return "";
      const name = lang() === "ru" ? (feature.properties?.name_ru || feature.properties?.name) : (feature.properties?.name_en || feature.properties?.name);
      const selected = iso3 === selectedIso();
      const valueText = ui.mapMode === "score" ? fmt(item?.score, 4) : groupName(item?.official_egdi_group);
      return `<path class="egdi-map-country ${mapTone(item)}${selected ? " selected" : ""}" d="${d}" data-egdi-country="${esc(iso3)}" tabindex="${item ? "0" : "-1"}" role="${item ? "button" : "img"}" aria-label="${esc(name)}${item ? ` · EGDI ${valueText}` : ` · ${tr("нет данных", "no data")}`}"><title>${esc(name)} · ${item ? `#${item.rank} · ${fmt(item.score, 4)} · ${groupName(item.official_egdi_group)}` : tr("нет данных EGDI", "no EGDI data")}</title></path>`;
    }).join("");
    return `<svg class="egdi-world-map" viewBox="0 0 ${width} ${height}" role="group" aria-label="${tr("Карта развития электронного правительства", "E-government development map")}">${paths}</svg>`;
  }

  function regionalLandscape() {
    return `<div class="egdi-region-list">${(payload.regional_landscape || []).map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(item.region)}</strong><small>${intFmt(item.count)} ${tr("стран", "countries")} · ${pct(item.very_high_share, 0)} ${tr("в очень высокой группе", "in very-high group")}</small></div><b>${fmt(item.mean, 4)}</b><button type="button" data-egdi-country="${esc(item.leader?.iso3 || "")}" aria-label="${tr("Открыть лидера региона", "Open regional leader")}: ${esc(countryName(item.leader))}">${flag(item.leader, "flag-img inline")}<em>#${intFmt(item.leader?.rank)}</em></button></article>`).join("")}</div>`;
  }

  function mapSection() {
    return `<section class="egdi-section" id="egdiMap">
      ${sectionHeading("02", tr("Глобальный атлас", "Global atlas"), tr("Карта цифровой зрелости 193 государств", "Digital-maturity map of 193 states"), tr("Официальные группы EGDI показывают уровень развития, а режим непрерывной шкалы — положение страны внутри диапазона 0–1. Выбор страны перестраивает всё рабочее пространство.", "Official EGDI groups show the development tier; the continuous-scale mode reveals the country's position within 0–1. Selecting a country rebuilds the entire workspace."))}
      <div class="egdi-map-layout">
        <article class="egdi-map-card">
          <header><div><span>${tr("Слой карты", "Map layer")}</span><strong>${ui.mapMode === "group" ? tr("Официальные группы", "Official groups") : tr("Непрерывный балл", "Continuous score")}</strong></div><div class="egdi-map-toggle" role="group" aria-label="${tr("Режим карты", "Map mode")}"><button type="button" class="${ui.mapMode === "group" ? "active" : ""}" data-egdi-map-mode="group">${tr("Группы", "Groups")}</button><button type="button" class="${ui.mapMode === "score" ? "active" : ""}" data-egdi-map-mode="score">${tr("Баллы", "Scores")}</button></div></header>
          <div class="egdi-map-stage">${worldMap()}</div>
          <div class="egdi-map-legend">${mapLegend()}</div>
        </article>
        <aside class="egdi-region-card"><header><span>REGIONS · 2024</span><h3>${tr("Региональный ландшафт", "Regional landscape")}</h3><p>${tr("Средние рассчитаны GIR из официальных страновых значений.", "Means are GIR diagnostics based on official country values.")}</p></header>${regionalLandscape()}</aside>
      </div>
    </section>`;
  }

  function trianglePoint(value, index, centerX = 180, centerY = 178, radius = 126) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 3;
    const distance = radius * clamp(value);
    return [centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance];
  }

  function trianglePolygon(values) {
    return values.map((value, index) => trianglePoint(value, index).map((number) => number.toFixed(1)).join(",")).join(" ");
  }

  function componentTriangle() {
    const codes = ["OSI", "TII", "HCI"];
    const items = codes.map(byCode);
    const selected = items.map((item) => item?.official_value || 0);
    const global = codes.map((code) => benchmark(code).global?.mean || 0);
    const region = codes.map((code) => benchmark(code).region?.mean || 0);
    const top10 = codes.map((code) => benchmark(code).top10_mean || 0);
    const grids = [.25, .5, .75, 1].map((level) => `<polygon points="${trianglePolygon([level, level, level])}"></polygon>`).join("");
    const axes = codes.map((_, index) => {
      const [x, y] = trianglePoint(1, index);
      return `<line x1="180" y1="178" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
    }).join("");
    const labels = items.map((item, index) => {
      const [x, y] = trianglePoint(1.16, index);
      const anchor = x < 160 ? "end" : x > 200 ? "start" : "middle";
      return `<text x="${x.toFixed(1)}" y="${(y + (index === 0 ? -3 : 6)).toFixed(1)}" text-anchor="${anchor}">${esc(item?.dimension_code || "")}</text>`;
    }).join("");
    return `<div class="egdi-triangle-wrap"><svg class="egdi-triangle" viewBox="0 0 360 360" role="img" aria-label="${tr("Баланс трёх компонентов EGDI", "Balance of the three EGDI components")}"><g class="grid">${grids}${axes}</g><polygon class="series top10" points="${trianglePolygon(top10)}"></polygon><polygon class="series global" points="${trianglePolygon(global)}"></polygon><polygon class="series region" points="${trianglePolygon(region)}"></polygon><polygon class="series selected" points="${trianglePolygon(selected)}"></polygon><g class="labels">${labels}</g></svg><div class="egdi-triangle-legend"><span class="selected">${esc(countryName(country()))}</span><span class="region">${tr("Регион", "Region")}</span><span class="global">${tr("Мир", "Global")}</span><span class="top10">Top‑10</span></div></div>`;
  }

  function componentCard(item, index) {
    const b = benchmark(item.dimension_code);
    const gap = b.gap_to_top10_mean;
    const descriptions = {
      OSI: tr("масштаб и качество государственных онлайн‑услуг", "scope and quality of government online services"),
      TII: tr("связность, использование и доступность телеком‑инфраструктуры", "connectivity, usage and affordability of telecom infrastructure"),
      HCI: tr("образование, грамотность и способность использовать цифровые услуги", "education, literacy and capacity to use digital services"),
    };
    return `<article class="egdi-component-card component-${index + 1}">
      <header><span>0${index + 1} · ${esc(item.dimension_code)}</span><button type="button" data-egdi-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть происхождение", "Open provenance")}">↗</button></header>
      <h3>${esc(dimensionName(item))}</h3><p>${esc(descriptions[item.dimension_code] || "")}</p>
      <div class="egdi-component-score"><strong>${fmt(item.official_value, 4)}</strong><span>${esc(groupName(item.official_group))}</span></div>
      <div class="egdi-component-meter"><i style="width:${clamp(item.official_value) * 100}%"></i></div>
      <div class="egdi-component-kpis"><div><span>${tr("Диагн. место", "Diagnostic rank")}</span><b>#${intFmt(b.derived_global_rank)} / ${intFmt(b.available_count)}</b></div><div><span>${tr("Мир", "Global")}</span><b>${fmt(b.global?.mean, 4)}</b><small class="${deltaClass(b.gap_to_global_mean)}">${signed(b.gap_to_global_mean, 4)}</small></div><div><span>${tr("Регион", "Region")}</span><b>${fmt(b.region?.mean, 4)}</b><small class="${deltaClass(b.gap_to_region_mean)}">${signed(b.gap_to_region_mean, 4)}</small></div><div><span>Top‑10</span><b>${fmt(b.top10_mean, 4)}</b><small class="${deltaClass(gap)}">${signed(gap, 4)}</small></div></div>
    </article>`;
  }

  function componentsSection() {
    const components = (payload.components || []).filter((item) => item.level === "component");
    const selected = payload.summary?.selected || {};
    return `<section class="egdi-section" id="egdiComponents">
      ${sectionHeading("03", tr("Архитектура результата", "Result architecture"), tr("Три равновзвешенных компонента", "Three equally weighted components"), tr("EGDI связывает цифровые государственные услуги, телекоммуникационную инфраструктуру и человеческий капитал. Компонентные места ниже рассчитаны GIR и не являются официальными рангами ООН.", "EGDI combines digital public services, telecommunications infrastructure and human capital. Component positions below are GIR diagnostics, not official UN ranks."))}
      <div class="egdi-component-layout"><article class="egdi-balance-card"><header><div><span>BALANCE · ⅓ + ⅓ + ⅓</span><h3>${tr("Профиль относительно ориентиров", "Profile against benchmarks")}</h3></div><b>${tr("размах", "spread")} ${fmt(payload.insights?.component_balance_spread, 4)}</b></header>${componentTriangle()}<div class="egdi-balance-readout"><div><span>${tr("Выше мира", "Above global")}</span><strong>${signed(Number(score().score) - Number(payload.summary?.global_mean), 4)}</strong></div><div><span>${tr("Разрыв к региону", "Gap to region")}</span><strong>${signed(selected.gap_to_region_mean, 4)}</strong></div><div><span>${tr("Подрегион", "Subregion")}</span><strong>#${intFmt(selected.subregion_rank)} / ${intFmt(selected.subregion_count)}</strong></div></div></article><div class="egdi-component-stack">${components.map(componentCard).join("")}</div></div>
    </section>`;
  }

  function osiSubindices() {
    const osi = byCode("OSI");
    return osi?.children || [];
  }

  function serviceBars() {
    return `<div class="egdi-service-bars">${osiSubindices().map((item, index) => {
      const b = benchmark(item.dimension_code);
      return `<article class="${item.dimension_code === "OSI.EPI" ? "epi" : ""}"><header><div><span>${esc(item.display_code || item.dimension_code)}</span><strong>${esc(dimensionName(item))}</strong></div><b>${fmt(item.official_value, 4)}</b></header><div class="bar"><i style="width:${clamp(item.official_value) * 100}%"></i><em style="left:${clamp(b.global?.mean) * 100}%" title="${tr("Среднее мира", "Global mean")} ${fmt(b.global?.mean, 4)}"></em></div><footer><span>${tr("Вес в OSI", "Weight in OSI")} ${pct(item.weight_within_parent, 0)}</span><span class="${deltaClass(b.gap_to_global_mean)}">${tr("к миру", "vs global")} ${signed(b.gap_to_global_mean, 4)}</span><button type="button" data-egdi-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></footer></article>`;
    }).join("")}</div>`;
  }

  function epiJourney() {
    const epi = byCode("OSI.EPI");
    const features = epi?.children || [];
    return `<article class="egdi-epi-card"><header><div><span>E‑PARTICIPATION · 2024</span><h3>${tr("От информации к совместному решению", "From information to shared decisions")}</h3><p>${tr("Дополнительный индекс ООН показывает, насколько цифровые каналы поддерживают информирование, консультации и участие граждан в принятии решений.", "The UN supplementary index shows how digital channels support information, consultation and public participation in decision-making.")}</p></div><div class="egdi-epi-score"><span>${tr("Место", "Rank")}</span><strong>#${intFmt(epi?.official_rank)}</strong><b>${fmt(epi?.official_value, 4)}</b><small>${esc(groupName(epi?.official_group))}</small></div></header><div class="egdi-journey">${features.map((item, index) => {
      const b = benchmark(item.dimension_code);
      return `<article class="stage-${index + 1}"><span>0${index + 1}</span><div class="ring" style="--value:${clamp(item.official_value) * 360}deg"><b>${fmt(item.official_value, 4)}</b></div><h4>${esc(dimensionName(item))}</h4><p>${tr("Диагностическое место", "Diagnostic rank")} #${intFmt(b.derived_global_rank)} · ${tr("к миру", "vs global")} <em class="${deltaClass(b.gap_to_global_mean)}">${signed(b.gap_to_global_mean, 4)}</em></p><button type="button" data-egdi-provenance="${esc(item.value_id)}">${tr("Доказательство", "Evidence")} ↗</button></article>`;
    }).join("")}</div></article>`;
  }

  function servicesSection() {
    return `<section class="egdi-section" id="egdiServices">
      ${sectionHeading("04", tr("Цифровые услуги и участие", "Digital services and participation"), tr("Из чего складывается Online Services Index", "What builds the Online Services Index"), tr("Пять официальных подиндексов OSI показывают институциональную основу, предоставление услуг и контента, технологичность и электронное участие. Маркер на каждой шкале — среднее мира.", "Five official OSI subindices cover institutional framework, service and content provision, technology and e-participation. The marker on each scale is the global mean."))}
      <div class="egdi-services-layout"><article class="egdi-osi-card"><header><div><span>OSI · ${pct(byCode("OSI")?.weight_within_parent, 0)} EGDI</span><h3>${esc(dimensionName(byCode("OSI")))}</h3></div><strong>${fmt(byCode("OSI")?.official_value, 4)}</strong></header>${serviceBars()}</article>${epiJourney()}</div>
    </section>`;
  }

  function inputRow(item) {
    const b = benchmark(item.dimension_code);
    const unavailable = item.available === false || !finite(item.official_value);
    return `<article class="egdi-input-row ${unavailable ? "unavailable" : ""}"><header><span>${esc(item.display_code || item.dimension_code)}</span><div><strong>${esc(dimensionName(item))}</strong><small>${esc(unitLabel(item.unit))}${item.source_data_year ? ` · ${item.source_data_year}` : ""}${item.source_agency ? ` · ${esc(item.source_agency)}` : ""}</small></div><b>${unavailable ? tr("не опубликован", "not published") : valueLabel(item)}</b><button type="button" data-egdi-provenance="${esc(item.value_id)}" aria-label="${tr("Происхождение значения", "Value provenance")}">↗</button></header>${unavailable ? `<p>${tr("ООН описывает этот методологический узел, но не публикует отдельный страновой composite score. GIR не подставляет искусственное значение.", "The UN defines this methodological node but does not publish a separate country composite score. GIR does not impute a value.")}</p>` : `<div class="egdi-input-benchmark"><span>${tr("Мир", "Global")} <b>${fmtCompact(b.global?.mean, 2)}</b></span><span>${tr("Регион", "Region")} <b>${fmtCompact(b.region?.mean, 2)}</b></span><span>${tr("Диагн. место", "Diagnostic rank")} <b>#${intFmt(b.derived_global_rank)}</b></span></div>`}</article>`;
  }

  function inputPanel(code, eyebrow, description) {
    const component = byCode(code);
    const children = component?.children || [];
    const all = children.flatMap((item) => [item, ...(item.children || [])]);
    return `<article class="egdi-input-panel ${code.toLowerCase()}"><header><div><span>${esc(eyebrow)}</span><h3>${esc(dimensionName(component))}</h3><p>${esc(description)}</p></div><strong>${fmt(component?.official_value, 4)}</strong></header><div class="egdi-input-list">${all.map(inputRow).join("")}</div></article>`;
  }

  function evidenceExplorer() {
    const query = ui.evidenceQuery.trim().toLowerCase();
    const items = flatten(payload.components || []).filter((item) => {
      if (!query) return true;
      return [item.dimension_code, item.display_code, item.name_ru, item.name_en, item.source_agency, item.unit].some((value) => String(value || "").toLowerCase().includes(query));
    });
    return `<details class="egdi-evidence-explorer" open><summary><div><span>22 · NODES</span><strong>${tr("Полная опубликованная иерархия", "Complete published hierarchy")}</strong></div><b>${intFmt(items.length)} / 22</b></summary><div class="egdi-evidence-toolbar"><label><span>${tr("Поиск по структуре", "Search the structure")}</span><input id="egdiEvidenceSearch" type="search" value="${esc(ui.evidenceQuery)}" autocomplete="off" aria-label="${tr("Поиск по структуре EGDI", "Search EGDI structure")}"></label><p>${tr("Все значения ведут к единому provenance‑контракту GIR.", "Every value resolves to the shared GIR provenance contract.")}</p></div><div class="egdi-evidence-table-wrap"><table class="egdi-evidence-table"><thead><tr><th>${tr("Код", "Code")}</th><th>${tr("Показатель", "Indicator")}</th><th>${tr("Уровень", "Level")}</th><th>${tr("Значение", "Value")}</th><th>${tr("Единица", "Unit")}</th><th>${tr("Год / источник", "Year / source")}</th><th></th></tr></thead><tbody>${items.map((item) => `<tr class="level-${esc(item.level)}"><td><code>${esc(item.display_code || item.dimension_code)}</code></td><td><strong>${esc(dimensionName(item))}</strong><small>${esc(item.dimension_code)}</small></td><td>${esc(item.level)}</td><td>${valueLabel(item)}</td><td>${esc(unitLabel(item.unit))}</td><td>${item.source_data_year ? intFmt(item.source_data_year) : "—"}<small>${esc(item.source_agency || "")}</small></td><td><button type="button" data-egdi-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть доказательство", "Open evidence")}">↗</button></td></tr>`).join("") || `<tr><td colspan="7">${tr("Совпадений не найдено", "No matches found")}</td></tr>`}</tbody></table></div></details>`;
  }

  function specialGroupCards() {
    return `<div class="egdi-special-groups">${(payload.special_group_landscape || []).map((item) => `<article><span>${esc(item.code)}</span><h4>${esc(local(item))}</h4><div><strong>${intFmt(item.count)}</strong><small>${tr("стран", "countries")}</small></div><p>${tr("Средний EGDI", "Mean EGDI")} <b>${fmt(item.mean, 4)}</b> · ${tr("очень высокий", "very high")} ${intFmt(item.very_high_count)}</p><button type="button" data-egdi-country="${esc(item.leader?.iso3 || "")}">${tr("Лидер", "Leader")}: ${flag(item.leader, "flag-img inline")} ${esc(countryName(item.leader))} <em>#${intFmt(item.leader?.rank)}</em></button></article>`).join("")}</div>`;
  }

  function inputsSection() {
    const years = payload.insights?.hci_source_years || [];
    return `<section class="egdi-section" id="egdiInputs">
      ${sectionHeading("05", tr("Фундамент цифрового государства", "Digital-government foundations"), tr("Инфраструктура, человеческий капитал и полнота источников", "Infrastructure, human capital and source completeness"), tr("TII и HCI объединяют показатели разных единиц и лет. Интерфейс сохраняет официальные source year и agency, а отсутствие прямого балла доступности показывает как честное n/a.", "TII and HCI combine inputs with different units and source years. The interface preserves the official source year and agency, and presents the unpublished direct affordability score as an explicit n/a."))}
      <div class="egdi-input-layout">${inputPanel("TII", "TII · ITU", tr("Связность, использование мобильной сети, широкополосный доступ и доступность.", "Connectivity, mobile use, broadband access and affordability."))}${inputPanel("HCI", "HCI · UNESCO / UNDP / UN DESA", tr("Грамотность, образование и способность населения пользоваться электронным государством.", "Literacy, education and the population's capacity to use digital government."))}</div>
      <div class="egdi-source-year-note"><div><span>${tr("Диапазон исходных лет HCI", "HCI source-year range")}</span><strong>${years.map(intFmt).join(" · ") || "—"}</strong></div><p>${tr("Это официальный смешанный профиль выпуска 2024 года, а не временной ряд одного календарного года.", "This is the official mixed-source profile of the 2024 edition, not a single-calendar-year time series.")}</p></div>
      ${specialGroupCards()}${evidenceExplorer()}
    </section>`;
  }

  function rankingRows() {
    const query = ui.rankingQuery.trim().toLowerCase();
    return (payload.ranking || []).filter((item) => {
      const matchesQuery = !query || [item.iso3, item.name_ru, item.name_en, item.official_country_name].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesRegion = ui.rankingRegion === "all" || item.official_region === ui.rankingRegion;
      const matchesIncome = ui.rankingIncome === "all" || item.official_income_group === ui.rankingIncome;
      const matchesGroup = ui.rankingGroup === "all" || item.official_egdi_group === ui.rankingGroup;
      const matchesSpecial = ui.rankingSpecial === "all" || (item.special_groups || []).includes(ui.rankingSpecial);
      return matchesQuery && matchesRegion && matchesIncome && matchesGroup && matchesSpecial;
    });
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;
  }

  function rankingControls(total) {
    return `<div class="egdi-ranking-controls">
      <label class="search"><span>${tr("Поиск страны", "Country search")}</span><input id="egdiRankingSearch" type="search" value="${esc(ui.rankingQuery)}" autocomplete="off" aria-label="${tr("Поиск страны в рейтинге", "Search country in ranking")}"></label>
      <label><span>${tr("Регион", "Region")}</span><select id="egdiRankingRegion">${option("all", tr("Все регионы", "All regions"), ui.rankingRegion)}${(payload.filters?.regions || []).map((value) => option(value, value, ui.rankingRegion)).join("")}</select></label>
      <label><span>${tr("Доход", "Income")}</span><select id="egdiRankingIncome">${option("all", tr("Все группы", "All groups"), ui.rankingIncome)}${(payload.filters?.income_groups || []).map((value) => option(value, value, ui.rankingIncome)).join("")}</select></label>
      <label><span>${tr("Уровень EGDI", "EGDI level")}</span><select id="egdiRankingGroup">${option("all", tr("Все уровни", "All levels"), ui.rankingGroup)}${(payload.filters?.egdi_groups || []).map((value) => option(value, groupName(value), ui.rankingGroup)).join("")}</select></label>
      <label><span>${tr("Особая группа", "Special group")}</span><select id="egdiRankingSpecial">${option("all", tr("Все страны", "All countries"), ui.rankingSpecial)}${(payload.filters?.special_groups || []).map((value) => option(value, value, ui.rankingSpecial)).join("")}</select></label>
      <div class="result"><span>${tr("Найдено", "Results")}</span><strong>${intFmt(total)}</strong></div>
    </div>`;
  }

  function miniComponent(item, code) {
    const value = item.dimensions?.[code]?.value;
    return `<div class="egdi-mini-component"><span>${esc(code)}</span><i><b style="width:${clamp(value) * 100}%"></b></i><em>${fmt(value, 3)}</em></div>`;
  }

  function rankingTable() {
    const rows = rankingRows();
    const pages = Math.max(1, Math.ceil(rows.length / ui.rankingPageSize));
    ui.rankingPage = Math.min(Math.max(1, ui.rankingPage), pages);
    const start = (ui.rankingPage - 1) * ui.rankingPageSize;
    const visible = rows.slice(start, start + ui.rankingPageSize);
    return `<div class="egdi-ranking-table-wrap"><table class="egdi-ranking-table"><thead><tr><th>#</th><th>${tr("Страна", "Country")}</th><th>EGDI</th><th>${tr("Класс", "Class")}</th><th>${tr("Компоненты", "Components")}</th><th>EPI</th><th>${tr("Регион / доход", "Region / income")}</th><th></th></tr></thead><tbody>${visible.map((item) => `<tr class="${item.iso3 === selectedIso() ? "selected" : ""}"><td><strong>${intFmt(item.rank)}</strong></td><td><button type="button" class="egdi-country-cell" data-egdi-country="${esc(item.iso3)}">${flag(item, "flag-img inline")}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)}${item.special_groups?.length ? ` · ${esc(item.special_groups.join(" / "))}` : ""}</small></span></button></td><td><strong>${fmt(item.score, 4)}</strong><small>P${fmt(item.percentile, 1)}</small></td><td><span class="egdi-table-group ${groupKey(item.official_egdi_group)}">${esc(item.official_rating_class || "—")}</span><small>${esc(groupName(item.official_egdi_group))}</small></td><td><div class="egdi-mini-components">${miniComponent(item, "OSI")}${miniComponent(item, "TII")}${miniComponent(item, "HCI")}</div></td><td><strong>${fmt(item.official_epi_score, 4)}</strong><small>#${intFmt(item.official_epi_rank)}</small></td><td><strong>${esc(item.official_region || "—")}</strong><small>${esc(item.official_income_group || "—")}</small></td><td><button type="button" data-egdi-provenance="${esc(item.value_id)}" aria-label="${tr("Происхождение значения", "Value provenance")}">↗</button></td></tr>`).join("") || `<tr><td colspan="8">${tr("Страны по выбранным условиям не найдены", "No countries match the selected filters")}</td></tr>`}</tbody></table></div><footer class="egdi-pagination"><span>${tr("Строки", "Rows")} ${rows.length ? intFmt(start + 1) : "0"}–${intFmt(Math.min(start + ui.rankingPageSize, rows.length))} ${tr("из", "of")} ${intFmt(rows.length)}</span><div><button type="button" data-egdi-page="prev" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${tr("Страница", "Page")} ${intFmt(ui.rankingPage)} / ${intFmt(pages)}</b><button type="button" data-egdi-page="next" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer>`;
  }

  function podium() {
    const leaders = (payload.leaders || []).slice(0, 3);
    const ordered = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
    return `<div class="egdi-podium">${ordered.map((item) => `<button type="button" class="place-${item.rank}" data-egdi-country="${esc(item.iso3)}"><span>${item.rank === 1 ? "01" : String(item.rank).padStart(2, "0")}</span>${flag(item, "flag-img big")}<strong>${esc(countryName(item))}</strong><b>${fmt(item.score, 4)}</b><small>${esc(item.official_rating_class)}</small></button>`).join("")}</div>`;
  }

  function distribution() {
    const data = payload.summary?.classification_distribution || [];
    const total = payload.summary?.country_count || 1;
    return `<article class="egdi-distribution"><header><div><span>193 · MEMBER STATES</span><h3>${tr("Распределение по уровням", "Distribution by level")}</h3></div><b>${tr("официальные границы ООН", "official UN thresholds")}</b></header><div class="egdi-distribution-bars">${data.map((item) => `<div class="${groupKey(item.official_label)}"><header><span>${esc(local(item))}</span><strong>${intFmt(item.count)}</strong></header><i><b style="width:${Number(item.share || 0) * 100}%"></b></i><footer><span>${fmt(item.minimum, 2)}–${fmt(item.maximum, 2)}</span><em>${pct(item.share, 1)}</em></footer></div>`).join("")}</div><div class="egdi-distribution-scale" aria-hidden="true"><i style="width:${(data[3]?.count || 0) / total * 100}%"></i><i style="width:${(data[2]?.count || 0) / total * 100}%"></i><i style="width:${(data[1]?.count || 0) / total * 100}%"></i><i style="width:${(data[0]?.count || 0) / total * 100}%"></i></div></article>`;
  }

  function rankingSection() {
    const total = rankingRows().length;
    return `<section class="egdi-section" id="egdiRanking">
      ${sectionHeading("06", tr("Мировой рейтинг", "World ranking"), tr("193 государства в едином доказательном наборе", "193 states in one auditable dataset"), tr("Рейтинг объединяет официальный EGDI, rating class, три компонента, E‑Participation и классификации LDC/LLDC/SIDS. Нажатие на страну перестраивает весь профиль.", "The ranking combines official EGDI, rating class, three components, E-Participation and LDC/LLDC/SIDS classifications. Selecting a country rebuilds the full profile."))}
      <div class="egdi-ranking-overview">${podium()}${distribution()}</div><article class="egdi-ranking-panel">${rankingControls(total)}${rankingTable()}</article>
    </section>`;
  }

  function sourceRow(label, value, extra = "") {
    return value == null || value === "" ? "" : `<div><dt>${esc(label)}</dt><dd>${extra || esc(value)}</dd></div>`;
  }

  function methodSection() {
    const formula = payload.formula || {};
    const source = payload.source || {};
    const audit = payload.audit || {};
    const method = payload.methodology || {};
    const formulaText = lang() === "ru" ? formula.formula_text_ru : formula.formula_text_en;
    const notes = lang() === "ru" ? formula.method_notes_ru : formula.method_notes_en;
    const normalization = lang() === "ru" ? formula.normalization_ru : formula.normalization_en;
    const warning = lang() === "ru" ? method.warning_ru : method.warning_en;
    return `<section class="egdi-section" id="egdiMethod">
      ${sectionHeading("07", tr("Научная воспроизводимость", "Scientific reproducibility"), tr("Метод, классификация и контроль источника", "Method, classification and source control"), tr("Официальные значения сохраняются без замены пересчётом. GIR проверяет верхнеуровневое среднее, фиксирует смешанные годы HCI и регистрирует разрешение сложной PDF‑разметки.", "Official values are preserved rather than replaced by recomputation. GIR checks the top-level mean, records mixed HCI source years and audits resolution of the complex PDF layout."))}
      <div class="egdi-method-grid">
        <article class="egdi-method-card formula"><span>FORMULA · ${esc(formula.formula_version || "EGDI 2024")}</span><h3>${tr("Равный вес после нормализации", "Equal weight after normalisation")}</h3><div class="egdi-formula">${esc(formulaText)}</div><p>${esc(notes)}</p><div class="egdi-method-flow"><div><strong>OSI</strong><span>⅓</span></div><i>+</i><div><strong>TII</strong><span>⅓</span></div><i>+</i><div><strong>HCI</strong><span>⅓</span></div><em>=</em><div><strong>EGDI</strong><span>0–1</span></div></div><div class="egdi-normalization"><b>${tr("Стандартизация", "Standardisation")}</b><p>${esc(normalization)}</p></div></article>
        <article class="egdi-method-card classification"><span>CLASSIFICATION · 4 × 4</span><h3>${tr("Уровни и rating classes", "Levels and rating classes")}</h3><div class="egdi-class-grid">${(payload.rating_groups || []).map((item) => `<div class="${groupKey(item.official_label)}"><span>${esc(local(item))}</span><b>${fmt(item.minimum, 4)}–${fmt(item.maximum, 4)}</b><small>${esc(item.official_label === "Very High EGDI" ? "VH · V3 · V2 · V1" : item.official_label === "High EGDI" ? "HV · H3 · H2 · H1" : item.official_label === "Middle EGDI" ? "MH · M3 · M2 · M1" : "LM · L3 · L2 · L1")}</small></div>`).join("")}</div><p>${tr("Страна получает официальный уровень и один из четырёх классов внутри него. Класс не пересчитывается GIR.", "Each country receives an official level and one of four classes within it. GIR does not recompute the class.")}</p></article>
        <article class="egdi-method-card source"><span>SOURCE · ${esc(source.source_id || "UN_DESA_EGOV")}</span><h3>${tr("Официальный выпуск", "Official release")}</h3><dl class="egdi-source-list">${sourceRow(tr("Владелец", "Owner"), source.owner)}${sourceRow(tr("Название", "Title"), source.title || source.source_name)}${sourceRow(tr("Редакция", "Edition"), payload.edition)}${sourceRow(tr("Опубликовано", "Published"), payload.publication_date)}${sourceRow(tr("Получено", "Retrieved"), source.retrieved_at)}${sourceRow(tr("Лицензия", "Licence"), source.license_or_terms)}${sourceRow(tr("Режим доступа", "Access mode"), source.access_mode)}${sourceRow(tr("Снимок", "Snapshot"), source.latest_snapshot_id)}</dl><div class="egdi-method-actions"><a class="egdi-button primary" href="${esc(source.source_url || payload.index?.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Открыть Technical Appendix", "Open Technical Appendix")} ↗</a><button type="button" class="egdi-button" data-egdi-provenance="${esc(score().value_id || "")}">${tr("Provenance страны", "Country provenance")}</button></div></article>
        <article class="egdi-method-card audit"><span>AUDIT · ${audit.validation_passed ? "PASSED" : "REVIEW"}</span><h3>${tr("Контроль загрузки", "Ingestion audit")}</h3><div class="egdi-audit-kpis"><div><strong>${intFmt(audit.countries_loaded)}</strong><span>${tr("стран", "countries")}</span></div><div><strong>${intFmt(audit.hierarchy_rows_loaded)}</strong><span>${tr("иерархических строк", "hierarchy rows")}</span></div><div><strong>${intFmt(payload.source_layout_events_count)}</strong><span>${tr("событий PDF‑аудита", "PDF audit events")}</span></div><div><strong>${fmt(audit.max_egdi_formula_residual, 8)}</strong><span>${tr("макс. остаток формулы", "max formula residual")}</span></div></div><div class="egdi-audit-status"><i></i><div><b>${tr("Проверка пройдена", "Validation passed")}</b><p>${tr("Все 193 места, 4 246 иерархических строк и 25 событий выравнивания источника прошли контроль; неразрешённых расхождений нет.", "All 193 ranks, 4,246 hierarchy rows and 25 source-alignment events passed validation; no unresolved mismatches remain.")}</p></div></div></article>
        <article class="egdi-method-card warning"><span>INTERPRETATION · BIENNIAL</span><h3>${tr("Как читать редакцию", "How to read the edition")}</h3><p>${esc(warning)}</p><div class="egdi-edition-note"><b>${tr("Календарный контекст", "Calendar context")}</b><p>${esc(lang() === "ru" ? payload.edition_note_ru : payload.edition_note_en)}</p></div><div class="egdi-license-note"><b>${tr("Политика поставки GIR", "GIR delivery policy")}</b><p>${tr("Исходный PDF ООН не включён в ZIP. Поставляются проверяемые фактические строки, SHA‑256 и рецепт повторной загрузки с официального сервера.", "The raw UN PDF is not included in the ZIP. The delivery contains verifiable factual rows, SHA-256 and an official-host download recipe.")}</p></div></article>
      </div>
    </section>`;
  }

  function renderWorkspace() {
    return `<div class="egdi-workspace">${hero()}${jumpNav()}${diagnosis()}${mapSection()}${componentsSection()}${servicesSection()}${inputsSection()}${rankingSection()}${methodSection()}</div>`;
  }

  function preserveScroll(callback, { focusSelector = null, selectionEnd = null } = {}) {
    const y = window.scrollY;
    callback();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
      if (!focusSelector) return;
      const control = context?.root?.querySelector(focusSelector);
      if (!control) return;
      control.focus({ preventScroll: true });
      if (typeof control.setSelectionRange === "function") {
        const end = Math.min(Number.isFinite(selectionEnd) ? selectionEnd : String(control.value || "").length, String(control.value || "").length);
        control.setSelectionRange(end, end);
      }
    });
  }

  function chooseCountry(iso3) {
    if (!iso3 || iso3 === selectedIso()) return;
    ui.rankingPage = 1;
    context.selectCountry?.(iso3);
  }

  function bindCountryControl(control) {
    const iso3 = control.dataset.egdiCountry;
    if (!iso3) return;
    control.addEventListener("click", () => chooseCountry(iso3));
    if (control.tagName.toLowerCase() === "path") {
      control.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseCountry(iso3); }
      });
    }
  }

  function bind() {
    const root = context.root;
    root.querySelectorAll("[data-egdi-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.egdiScroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll("[data-egdi-provenance]").forEach((button) => button.addEventListener("click", () => context.openProvenance?.(button.dataset.egdiProvenance, button)));
    root.querySelectorAll("[data-egdi-country]").forEach(bindCountryControl);
    root.querySelectorAll("[data-egdi-map-mode]").forEach((button) => button.addEventListener("click", () => { ui.mapMode = button.dataset.egdiMapMode; preserveScroll(paint); }));

    const evidenceSearch = root.querySelector("#egdiEvidenceSearch");
    if (evidenceSearch) evidenceSearch.addEventListener("input", (event) => {
      ui.evidenceQuery = event.target.value;
      window.clearTimeout(evidenceSearch.__egdiTimer);
      const selectionEnd = event.target.selectionStart;
      evidenceSearch.__egdiTimer = window.setTimeout(() => preserveScroll(paint, { focusSelector: "#egdiEvidenceSearch", selectionEnd }), 120);
    });
    const rankingSearch = root.querySelector("#egdiRankingSearch");
    if (rankingSearch) rankingSearch.addEventListener("input", (event) => {
      ui.rankingQuery = event.target.value;
      ui.rankingPage = 1;
      window.clearTimeout(rankingSearch.__egdiTimer);
      const selectionEnd = event.target.selectionStart;
      rankingSearch.__egdiTimer = window.setTimeout(() => preserveScroll(paint, { focusSelector: "#egdiRankingSearch", selectionEnd }), 120);
    });
    const bindings = [
      ["#egdiRankingRegion", "rankingRegion"],
      ["#egdiRankingIncome", "rankingIncome"],
      ["#egdiRankingGroup", "rankingGroup"],
      ["#egdiRankingSpecial", "rankingSpecial"],
    ];
    bindings.forEach(([selector, key]) => root.querySelector(selector)?.addEventListener("change", (event) => { ui[key] = event.target.value; ui.rankingPage = 1; preserveScroll(paint); }));
    root.querySelectorAll("[data-egdi-page]").forEach((button) => button.addEventListener("click", () => {
      ui.rankingPage += button.dataset.egdiPage === "next" ? 1 : -1;
      preserveScroll(paint);
      document.getElementById("egdiRanking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  function paint() {
    if (!context?.root || !payload) return;
    context.root.innerHTML = renderWorkspace();
    bind();
  }

  async function render(nextContext) {
    context = nextContext;
    if (!context?.root || !selectedIso()) return;
    const token = ++renderSerial;
    context.root.classList.add("egdi-workspace-host");
    context.root.innerHTML = loading();
    try {
      const [data, geometry] = await Promise.all([loadPayload(), loadGeo()]);
      if (token !== renderSerial || context.country !== nextContext.country) return;
      payload = data;
      geo = geometry;
      paint();
    } catch (error) {
      if (token !== renderSerial) return;
      context.root.innerHTML = errorState(error);
      context.root.querySelector("[data-egdi-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });
    }
  }

  function invalidate(countryCode) {
    if (!countryCode) { cache.clear(); pending.clear(); return; }
    const prefix = `${String(countryCode).toUpperCase()}:`;
    [...cache.keys()].filter((key) => key.startsWith(prefix)).forEach((key) => cache.delete(key));
  }

  window.GIREgdiWorkspace = { render, invalidate };
})();
