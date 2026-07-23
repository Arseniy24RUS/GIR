/* GIR Digitalisation / AI — Stage 02: premium Network Readiness Index workspace. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = {
    architectureQuery: "",
    missingOnly: false,
    rankingQuery: "",
    rankingRegion: "all",
    rankingIncome: "all",
    rankingPage: 1,
    rankingPageSize: 25,
  };
  let context = null;
  let payload = null;
  let renderSerial = 0;

  const lang = () => context?.lang || "ru";
  const tr = (ru, en) => lang() === "ru" ? ru : en;
  const esc = (value) => context?.escapeHtml
    ? context.escapeHtml(value)
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const locale = () => lang() === "ru" ? "ru-RU" : "en-US";
  const fmt = (value, digits = 1) => value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const intFmt = (value) => value == null || !Number.isFinite(Number(value))
    ? "—"
    : Math.round(Number(value)).toLocaleString(locale());
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const countryName = (item) => local(item) || item?.official_country_name || item?.official_name || item?.iso3 || "—";
  const selectedIso = () => String(context?.country || "").toUpperCase();
  const requestedYear = () => Number(context?.year || 2026);
  const cacheKey = () => `${selectedIso()}:${requestedYear()}`;
  const score = () => payload?.score || {};
  const country = () => payload?.country || { iso3: selectedIso(), name_ru: selectedIso(), name_en: selectedIso() };
  const benchmarks = () => payload?.benchmarks || {};
  const dimensionName = (item) => local(item) || item?.dimension_code || "—";
  const deltaClass = (value) => Number(value) > 0.004 ? "positive" : Number(value) < -0.004 ? "negative" : "neutral";
  const signed = (value, digits = 1) => value == null || !Number.isFinite(Number(value))
    ? "—"
    : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;

  function icon(name) {
    return `<img class="nri-icon" src="/static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  function flag(item, className = "flag-img inline") {
    if (context?.flagImage) return context.flagImage(item, className);
    return `<span class="nri-flag-fallback">${esc(item?.iso3 || "")}</span>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { message = (await response.json())?.detail || message; } catch (_) { /* no-op */ }
      throw new Error(message);
    }
    return response.json();
  }

  function load() {
    const key = cacheKey();
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (pending.has(key)) return pending.get(key);
    const url = `/api/nri/workspace?country=${encodeURIComponent(selectedIso())}&year=${encodeURIComponent(requestedYear())}`;
    const request = fetchJson(url)
      .then((data) => { cache.set(key, data); pending.delete(key); return data; })
      .catch((error) => { pending.delete(key); throw error; });
    pending.set(key, request);
    return request;
  }

  function loading() {
    return `<section class="nri-loading" aria-live="polite">
      <div class="nri-loading-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <span>NRI · 2025</span>
      <h1>${tr("Собирается цифровой профиль страны", "Building the country's digital readiness profile")}</h1>
      <p>${tr("Загружаются четыре столпа, двенадцать подстолпов, 53 индикатора, международные бенчмарки и доказательные записи.", "Loading four pillars, twelve sub-pillars, 53 indicators, international benchmarks and evidence records.")}</p>
    </section>`;
  }

  function errorState(error) {
    return `<section class="nri-error"><span>NRI · ERROR</span><h1>${tr("Рабочее пространство NRI не загрузилось", "The NRI workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="nri-button primary" data-nri-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function scoreRing(value) {
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clamp(value) / 100);
    return `<svg class="nri-score-ring" viewBox="0 0 180 180" role="img" aria-label="${tr("Оценка", "Score")} ${fmt(value, 2)} ${tr("из", "out of")} 100">
      <circle class="track" cx="90" cy="90" r="${radius}"></circle>
      <circle class="value" cx="90" cy="90" r="${radius}" style="stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"></circle>
      <text class="number" x="90" y="86" text-anchor="middle">${fmt(value, 2)}</text>
      <text class="unit" x="90" y="109" text-anchor="middle">NRI / 100</text>
    </svg>`;
  }

  function hero() {
    const summary = payload.summary?.selected || {};
    const idx = payload.index || {};
    const publication = payload.publication_date || "2026-02-04";
    const lead = lang() === "ru" ? idx.description_ru : idx.description_en;
    return `<section class="nri-hero" aria-labelledby="nriTitle">
      <article class="nri-hero-copy">
        <div class="nri-hero-network" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="nri-overline"><span>${esc(idx.authority || "Portulans Institute")}</span><b>${tr("официальный международный индекс", "official international index")}</b></div>
        <h1 id="nriTitle">${esc(local(idx))}</h1>
        <p class="nri-hero-lead">${esc(lead)}</p>
        <div class="nri-edition-line">
          <span><b>${tr("Редакция", "Edition")}</b> ${esc(payload.edition)}</span>
          <span><b>${tr("Публикация", "Published")}</b> ${esc(publication)}</span>
          <span><b>${tr("Охват", "Coverage")}</b> ${intFmt(payload.summary?.country_count)} ${tr("экономик", "economies")}</span>
        </div>
        <div class="nri-architecture-strip" aria-label="${tr("Архитектура индекса", "Index architecture")}">
          <div><strong>${intFmt(payload.counts?.pillars)}</strong><span>${tr("столпа", "pillars")}</span></div>
          <i aria-hidden="true"></i>
          <div><strong>${intFmt(payload.counts?.subpillars)}</strong><span>${tr("подстолпов", "sub-pillars")}</span></div>
          <i aria-hidden="true"></i>
          <div><strong>${intFmt(payload.counts?.indicators)}</strong><span>${tr("индикатора", "indicators")}</span></div>
        </div>
        <div class="nri-hero-actions">
          <button type="button" class="nri-button primary" data-nri-scroll="nriDiagnosis">${tr("Разобрать результат", "Explain the result")}</button>
          <a class="nri-button" href="/api/nri/workspace.csv?country=${encodeURIComponent(country().iso3)}&year=${encodeURIComponent(requestedYear())}&lang=${lang()}" download="gir-nri-${esc(payload.edition)}.csv">${icon("download")}${tr("Скачать рейтинг", "Download ranking")}</a>
          <a class="nri-button quiet" href="${esc(payload.source?.source_url || idx.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Официальный отчёт", "Official report")} <span aria-hidden="true">↗</span></a>
        </div>
      </article>
      <aside class="nri-scoreboard" aria-label="${tr("Положение выбранной страны", "Selected country position")}">
        <header><div>${flag(country(), "flag-img inline")}<div><strong>${esc(countryName(country()))}</strong><span>${esc(country().iso3)} · ${esc(country().official_region || "—")}</span></div></div><span class="nri-official-chip">${tr("официальное значение", "official value")}</span></header>
        <div class="nri-scoreboard-main">
          ${scoreRing(score().score)}
          <div class="nri-rank-stack">
            <div><span>${tr("Место в мире", "World rank")}</span><strong>#${intFmt(score().rank)}</strong><small>${tr("из", "of")} ${intFmt(payload.summary?.country_count)}</small></div>
            <div><span>${tr("Процентиль", "Percentile")}</span><strong>P${fmt(score().percentile, 1)}</strong><small>${tr("выше", "above")} ${fmt(score().percentile, 0)}% ${tr("выборки", "of the sample")}</small></div>
          </div>
        </div>
        <div class="nri-peer-positions">
          <div><span>${tr("В регионе", "In region")}</span><b>#${intFmt(summary.region_rank)} / ${intFmt(summary.region_count)}</b><small>${esc(summary.region_name || "—")}</small></div>
          <div><span>${tr("В группе дохода", "In income group")}</span><b>#${intFmt(summary.income_rank)} / ${intFmt(summary.income_count)}</b><small>${esc(summary.income_name || "—")}</small></div>
        </div>
        <button type="button" class="nri-evidence-link" data-nri-provenance="${esc(score().value_id || "")}">${tr("Открыть доказательную запись", "Open evidence record")} <span aria-hidden="true">→</span></button>
      </aside>
    </section>`;
  }

  function jumpNav() {
    const links = [
      ["nriDiagnosis", tr("Диагноз", "Diagnosis")],
      ["nriBenchmarks", tr("4 столпа", "4 pillars")],
      ["nriSubpillars", tr("12 подстолпов", "12 sub-pillars")],
      ["nriArchitecture", tr("53 индикатора", "53 indicators")],
      ["nriRanking", tr("Мировой рейтинг", "World ranking")],
      ["nriMethod", tr("Метод и источник", "Method & source")],
    ];
    return `<nav class="nri-jump" aria-label="${tr("Разделы рабочего пространства NRI", "NRI workspace sections")}">${links.map(([id, text], index) => `<button type="button" data-nri-scroll="${id}"><span>${String(index + 1).padStart(2, "0")}</span>${esc(text)}</button>`).join("")}</nav>`;
  }

  function sectionHeading(number, eyebrow, title, description) {
    return `<header class="nri-section-heading"><div><span>${esc(number)} · ${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p></header>`;
  }

  function insightName(item) {
    return item ? dimensionName(item) : "—";
  }

  function diagnosis() {
    const insights = payload.insights || {};
    const strongest = insights.strongest_pillar;
    const best = insights.best_ranked_subpillar;
    const gap = insights.largest_top10_gap;
    const coverage = Number(insights.coverage_rate || 0) * 100;
    const cards = [
      {
        tag: tr("Сильная сторона", "Strength"),
        title: insightName(strongest),
        value: fmt(strongest?.official_score, 2),
        unit: tr("балла", "points"),
        detail: `${tr("место", "rank")} #${intFmt(strongest?.official_rank)} · ${tr("лучший из четырёх столпов", "highest of four pillars")}`,
        tone: "positive",
      },
      {
        tag: tr("Лучшее положение", "Best position"),
        title: insightName(best),
        value: `#${intFmt(best?.official_rank)}`,
        unit: tr("в мире", "globally"),
        detail: `${fmt(best?.official_score, 2)} · ${tr("самый конкурентный подстолп", "most competitive sub-pillar")}`,
        tone: "accent",
      },
      {
        tag: tr("Разрыв до лидеров", "Gap to leaders"),
        title: dimensionName(gap),
        value: signed(gap?.gap_to_top10_mean, 1),
        unit: tr("пункта к среднему top‑10", "points to top-10 mean"),
        detail: tr("отрицательное значение показывает резерв роста", "a negative value indicates room for improvement"),
        tone: "negative",
      },
      {
        tag: tr("Полнота профиля", "Profile coverage"),
        title: `${intFmt(payload.counts?.available_indicators)} / ${intFmt(payload.counts?.indicators)}`,
        value: `${fmt(coverage, 0)}%`,
        unit: tr("доступных индикаторов", "available indicators"),
        detail: `${intFmt(payload.counts?.missing_indicators)} ${tr("официальных n/a сохранены без подстановок", "official n/a values preserved without imputation")}`,
        tone: "neutral",
      },
    ];
    return `<section class="nri-section" id="nriDiagnosis">
      ${sectionHeading("01", tr("Исполнительное резюме", "Executive readout"), tr("Что определяет позицию страны", "What drives the country's position"), tr("Четыре сигнала превращают официальный профиль NRI в управленческий ответ: сильная сторона, лучшее международное положение, главный разрыв и полнота исходных данных.", "Four signals turn the official NRI profile into an actionable readout: strength, best international position, principal gap and source-data coverage."))}
      <div class="nri-insight-grid">${cards.map((card) => `<article class="nri-insight ${card.tone}"><span>${esc(card.tag)}</span><h3>${esc(card.title)}</h3><div><strong>${esc(card.value)}</strong><small>${esc(card.unit)}</small></div><p>${esc(card.detail)}</p></article>`).join("")}</div>
      <div class="nri-diagnostic-note"><span>GIR · DIAGNOSTIC</span><p>${esc(lang() === "ru" ? payload.diagnostics_note_ru : payload.diagnostics_note_en)}</p></div>
    </section>`;
  }

  function radarPoint(value, index, count, center, radius) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index / count);
    const distance = radius * clamp(value) / 100;
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance];
  }

  function radarPolygon(values, center = 180, radius = 126) {
    return values.map((value, index) => radarPoint(value, index, values.length, center, radius).map((v) => v.toFixed(1)).join(",")).join(" ");
  }

  function radarChart() {
    const pillars = payload.pillars || [];
    const selected = pillars.map((item) => item.official_score || 0);
    const region = pillars.map((item) => item.benchmark?.region?.mean || 0);
    const income = pillars.map((item) => item.benchmark?.income_group?.mean || 0);
    const top10 = pillars.map((item) => item.benchmark?.top10_mean || 0);
    const center = 180;
    const radius = 126;
    const grid = [25, 50, 75, 100].map((level) => `<polygon points="${radarPolygon(Array(4).fill(level), center, radius)}"></polygon>`).join("");
    const axes = pillars.map((_, index) => {
      const [x, y] = radarPoint(100, index, 4, center, radius);
      return `<line x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
    }).join("");
    const labels = pillars.map((item, index) => {
      const [x, y] = radarPoint(116, index, 4, center, radius);
      const anchor = x < center - 10 ? "end" : x > center + 10 ? "start" : "middle";
      const dy = y < center ? -2 : 10;
      return `<text x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${esc(dimensionName(item))}</text>`;
    }).join("");
    return `<div class="nri-radar-wrap"><svg class="nri-radar" viewBox="0 0 360 360" role="img" aria-label="${tr("Сравнение четырёх столпов NRI с международными бенчмарками", "Comparison of four NRI pillars with international benchmarks")}">
      <g class="grid">${grid}${axes}</g>
      <polygon class="series top10" points="${radarPolygon(top10)}"></polygon>
      <polygon class="series income" points="${radarPolygon(income)}"></polygon>
      <polygon class="series region" points="${radarPolygon(region)}"></polygon>
      <polygon class="series selected" points="${radarPolygon(selected)}"></polygon>
      <g class="labels">${labels}</g>
    </svg>
    <div class="nri-radar-legend"><span class="selected">${esc(countryName(country()))}</span><span class="region">${tr("Среднее региона", "Region mean")}</span><span class="income">${tr("Среднее группы дохода", "Income-group mean")}</span><span class="top10">${tr("Среднее top‑10", "Top-10 mean")}</span></div></div>`;
  }

  function benchmarkChip(label, value, delta) {
    return `<div><span>${esc(label)}</span><b>${fmt(value, 1)}</b><small class="${deltaClass(delta)}">${signed(delta, 1)}</small></div>`;
  }

  function pillarCards() {
    return `<div class="nri-pillar-cards">${(payload.pillars || []).map((item, index) => {
      const b = item.benchmark || {};
      return `<article class="nri-pillar-card" data-pillar="${esc(item.dimension_code)}">
        <header><span>${String(index + 1).padStart(2, "0")} · ${esc(item.display_code || item.dimension_code)}</span><button type="button" data-nri-provenance="${esc(item.value_id)}" aria-label="${tr("Происхождение значения", "Value provenance")}">↗</button></header>
        <h3>${esc(dimensionName(item))}</h3>
        <div class="nri-pillar-score"><strong>${fmt(item.official_score, 2)}</strong><span>#${intFmt(item.official_rank)}</span></div>
        <div class="nri-meter" aria-hidden="true"><i style="width:${clamp(item.official_score)}%"></i></div>
        <div class="nri-pillar-benchmarks">
          ${benchmarkChip(tr("Мир", "World"), b.global?.mean, b.gap_to_global_mean)}
          ${benchmarkChip(tr("Регион", "Region"), b.region?.mean, b.gap_to_region_mean)}
          ${benchmarkChip(tr("Доход", "Income"), b.income_group?.mean, b.gap_to_income_mean)}
          ${benchmarkChip("Top‑10", b.top10_mean, b.gap_to_top10_mean)}
        </div>
      </article>`;
    }).join("")}</div>`;
  }

  function benchmarksSection() {
    return `<section class="nri-section" id="nriBenchmarks">
      ${sectionHeading("02", tr("Сравнительный профиль", "Comparative profile"), tr("Четыре столпа на единой шкале", "Four pillars on one common scale"), tr("Официальные оценки страны сопоставлены со средними значениями её региона, доходной группы и десяти мировых лидеров. Сравнения рассчитаны GIR из опубликованных строк NRI.", "Official country scores are compared with means for its region, income group and the global top ten. Comparisons are calculated by GIR from published NRI rows."))}
      <div class="nri-benchmark-layout"><article class="nri-radar-card"><header><div><span>NRI · 4 × 100</span><h3>${tr("Цифровой контур страны", "Country digital contour")}</h3></div><small>${tr("чем дальше от центра, тем выше оценка", "farther from the centre means a higher score")}</small></header>${radarChart()}</article><div>${pillarCards()}</div></div>
    </section>`;
  }

  function subpillarCard(item) {
    const b = item.benchmark || {};
    const gap = b.gap_to_global_mean;
    const topGap = b.gap_to_top10_mean;
    const scoreValue = item.official_score;
    const worldMean = b.global?.mean;
    return `<article class="nri-subpillar-card">
      <header><span>${esc(item.display_code || item.dimension_code)}</span><button type="button" data-nri-provenance="${esc(item.value_id)}" aria-label="${tr("Происхождение", "Provenance")}">↗</button></header>
      <h4>${esc(dimensionName(item))}</h4>
      <div class="nri-subpillar-kpi"><strong>${fmt(scoreValue, 2)}</strong><span>#${intFmt(item.official_rank)}</span></div>
      <div class="nri-dual-track" aria-hidden="true"><i class="mean" style="width:${clamp(worldMean)}%"></i><i class="country" style="width:${clamp(scoreValue)}%"></i></div>
      <dl><div><dt>${tr("к среднему мира", "vs world mean")}</dt><dd class="${deltaClass(gap)}">${signed(gap, 1)}</dd></div><div><dt>${tr("к среднему top‑10", "vs top-10 mean")}</dt><dd class="${deltaClass(topGap)}">${signed(topGap, 1)}</dd></div></dl>
    </article>`;
  }

  function subpillarsSection() {
    return `<section class="nri-section" id="nriSubpillars">
      ${sectionHeading("03", tr("Структурная диагностика", "Structural diagnosis"), tr("Двенадцать подстолпов: где именно возникает разрыв", "Twelve sub-pillars: where the gap actually emerges"), tr("Каждый столп раскрыт на три содержательных блока. Тонкая линия показывает среднее мира, заполненная — официальную оценку выбранной страны.", "Each pillar is expanded into three substantive blocks. The thin line shows the world mean; the filled line shows the selected country's official score."))}
      <div class="nri-subpillar-columns">${(payload.pillars || []).map((pillar, index) => `<section class="nri-subpillar-column"><header><span>${String(index + 1).padStart(2, "0")}</span><div><b>${esc(dimensionName(pillar))}</b><small>${fmt(pillar.official_score, 1)} · #${intFmt(pillar.official_rank)}</small></div></header>${(pillar.children || []).map(subpillarCard).join("")}</section>`).join("")}</div>
      <div class="nri-track-key"><span class="country">${esc(countryName(country()))}</span><span class="mean">${tr("Среднее мира", "World mean")}</span></div>
    </section>`;
  }

  function indicatorRows(subpillar) {
    const query = ui.architectureQuery.trim().toLowerCase();
    return (subpillar.children || []).filter((item) => {
      const text = `${item.display_code || ""} ${item.dimension_code || ""} ${item.name_ru || ""} ${item.name_en || ""}`.toLowerCase();
      return (!query || text.includes(query)) && (!ui.missingOnly || !item.available);
    });
  }

  function indicatorTable(subpillar) {
    const rows = indicatorRows(subpillar);
    if (!rows.length) return `<div class="nri-no-indicators">${tr("Нет индикаторов, соответствующих фильтру.", "No indicators match the filter.")}</div>`;
    return `<div class="nri-indicator-table-wrap"><table class="nri-indicator-table"><thead><tr><th>${tr("Код", "Code")}</th><th>${tr("Индикатор", "Indicator")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Место", "Rank")}</th><th>${tr("Вес", "Weight")}</th><th>${tr("Статус", "Status")}</th><th><span class="sr-only">${tr("Происхождение", "Provenance")}</span></th></tr></thead><tbody>${rows.map((item) => `<tr class="${item.available ? "" : "is-missing"}"><td><code>${esc(item.display_code || item.dimension_code)}</code></td><td><strong>${esc(dimensionName(item))}</strong>${item.profile_marker ? `<small>${esc(item.profile_marker)} ${tr("отмечен в страновом профиле", "highlighted in country profile")}</small>` : ""}</td><td><b>${item.available ? fmt(item.official_score, 2) : "n/a"}</b></td><td>${item.available ? `#${intFmt(item.official_rank)}` : "—"}</td><td>${fmt(item.official_indicator_weight, 1)}</td><td><span class="nri-status ${item.available ? "available" : "missing"}">${item.available ? tr("официально", "official") : tr("официальное n/a", "official n/a")}</span></td><td><button type="button" class="nri-row-evidence" data-nri-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть происхождение значения", "Open value provenance")}">↗</button></td></tr>`).join("")}</tbody></table></div>`;
  }

  function architecturePillar(pillar, index) {
    const visible = (pillar.children || []).filter((sub) => indicatorRows(sub).length > 0);
    if (!visible.length && (ui.architectureQuery || ui.missingOnly)) return "";
    return `<details class="nri-pillar-detail" ${index === 0 ? "open" : ""}>
      <summary><span class="nri-detail-number">${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(dimensionName(pillar))}</strong><small>${intFmt((pillar.children || []).reduce((sum, sub) => sum + (sub.children || []).length, 0))} ${tr("индикаторов", "indicators")}</small></div><div class="nri-detail-score"><b>${fmt(pillar.official_score, 2)}</b><span>#${intFmt(pillar.official_rank)}</span></div><i aria-hidden="true"></i></summary>
      <div class="nri-subpillar-details">${visible.map((sub) => `<details class="nri-subpillar-detail" open><summary><div><span>${esc(sub.display_code || sub.dimension_code)}</span><strong>${esc(dimensionName(sub))}</strong></div><div><b>${fmt(sub.official_score, 2)}</b><small>#${intFmt(sub.official_rank)}</small></div><i aria-hidden="true"></i></summary>${indicatorTable(sub)}</details>`).join("")}</div>
    </details>`;
  }

  function architectureSection() {
    const shownCount = (payload.pillars || []).flatMap((p) => p.children || []).flatMap((s) => indicatorRows(s)).length;
    return `<section class="nri-section" id="nriArchitecture">
      ${sectionHeading("04", tr("Полная модель", "Full model"), tr("От итогового балла до каждого из 53 индикаторов", "From the headline score to every one of 53 indicators"), tr("Иерархия сохраняет официальные оценки, места, веса и n/a. Любое числовое значение открывается до источника, снимка, контрольной суммы и преобразования.", "The hierarchy preserves official scores, ranks, weights and n/a values. Every number opens through to its source, snapshot, checksum and transformation."))}
      <div class="nri-architecture-toolbar"><label><span>${tr("Найти индикатор", "Find an indicator")}</span><input type="search" id="nriArchitectureSearch" value="${esc(ui.architectureQuery)}" placeholder="${tr("Например: ИИ, тарифы, навыки…", "For example: AI, tariffs, skills…")}"></label><label class="nri-check"><input type="checkbox" id="nriMissingOnly" ${ui.missingOnly ? "checked" : ""}><span>${tr("Показать только официальные n/a", "Show official n/a only")}</span></label><div><strong>${intFmt(shownCount)}</strong><span>${tr("показано", "shown")}</span></div></div>
      <div class="nri-architecture-tree">${(payload.pillars || []).map(architecturePillar).join("") || `<div class="nri-no-results">${tr("По этому запросу ничего не найдено.", "Nothing was found for this query.")}</div>`}</div>
    </section>`;
  }

  function filteredRanking() {
    const query = ui.rankingQuery.trim().toLowerCase();
    return (payload.ranking || []).filter((item) => {
      const text = `${item.iso3 || ""} ${item.name_ru || ""} ${item.name_en || ""} ${item.official_country_name || ""}`.toLowerCase();
      return (!query || text.includes(query))
        && (ui.rankingRegion === "all" || item.official_region === ui.rankingRegion)
        && (ui.rankingIncome === "all" || item.official_income_group === ui.rankingIncome);
    });
  }

  function podium() {
    const leaders = (payload.leaders || []).slice(0, 3);
    const order = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
    return `<div class="nri-podium">${order.map((item) => `<button type="button" class="nri-podium-card place-${item.rank}" data-nri-country="${esc(item.iso3)}"><span class="place">0${intFmt(item.rank)}</span>${flag(item, "flag-img inline")}<strong>${esc(countryName(item))}</strong><b>${fmt(item.score, 2)}</b><small>${tr("балла", "points")}</small></button>`).join("")}</div>`;
  }

  function histogram() {
    const bins = payload.summary?.histogram || [];
    const max = Math.max(1, ...bins.map((item) => Number(item.count || 0)));
    const selected = clamp(score().score);
    return `<div class="nri-distribution"><header><div><span>${tr("Распределение", "Distribution")}</span><h3>${tr("Где находится выбранная страна", "Where the selected country sits")}</h3></div><b>${fmt(payload.summary?.global_mean, 1)} <small>${tr("среднее мира", "world mean")}</small></b></header><div class="nri-histogram" role="img" aria-label="${tr("Распределение оценок NRI по 127 экономикам", "Distribution of NRI scores across 127 economies")}">${bins.map((item) => `<i style="height:${Math.max(5, Number(item.count || 0) / max * 100)}%"><span>${intFmt(item.count)}</span></i>`).join("")}<em style="left:${selected}%"><span>${esc(country().iso3)} · ${fmt(score().score, 1)}</span></em></div><div class="nri-histogram-axis"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div></div>`;
  }

  function rankingControls(total) {
    return `<div class="nri-ranking-controls"><label class="search"><span>${tr("Поиск", "Search")}</span><input type="search" id="nriRankingSearch" value="${esc(ui.rankingQuery)}" placeholder="${tr("Страна или ISO", "Country or ISO")}"></label><label><span>${tr("Регион", "Region")}</span><select id="nriRankingRegion"><option value="all">${tr("Все регионы", "All regions")}</option>${(payload.filters?.regions || []).map((value) => `<option value="${esc(value)}" ${ui.rankingRegion === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label><label><span>${tr("Группа дохода", "Income group")}</span><select id="nriRankingIncome"><option value="all">${tr("Все группы", "All groups")}</option>${(payload.filters?.income_groups || []).map((value) => `<option value="${esc(value)}" ${ui.rankingIncome === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label><div class="result"><strong>${intFmt(total)}</strong><span>${tr("экономик", "economies")}</span></div></div>`;
  }

  function rankingTable() {
    const rows = filteredRanking();
    const pageCount = Math.max(1, Math.ceil(rows.length / ui.rankingPageSize));
    ui.rankingPage = Math.min(ui.rankingPage, pageCount);
    const start = (ui.rankingPage - 1) * ui.rankingPageSize;
    const pageRows = rows.slice(start, start + ui.rankingPageSize);
    return `<div class="nri-ranking-table-wrap"><table class="nri-ranking-table"><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Экономика", "Economy")}</th><th>${tr("Регион", "Region")}</th><th>${tr("Группа дохода", "Income group")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Процентиль", "Percentile")}</th><th><span class="sr-only">${tr("Действия", "Actions")}</span></th></tr></thead><tbody>${pageRows.map((item) => `<tr class="${item.iso3 === country().iso3 ? "is-selected" : ""}"><td><b>#${intFmt(item.rank)}</b></td><td><button type="button" class="nri-country-cell" data-nri-country="${esc(item.iso3)}">${flag(item, "flag-img inline")}<span><strong>${esc(countryName(item))}</strong><small>${esc(item.iso3)}</small></span></button></td><td>${esc(item.official_region || "—")}</td><td>${esc(item.official_income_group || "—")}</td><td><strong>${fmt(item.score, 2)}</strong><div class="nri-mini-meter" aria-hidden="true"><i style="width:${clamp(item.score)}%"></i></div></td><td>P${fmt(item.percentile, 1)}</td><td><button type="button" class="nri-row-evidence" data-nri-provenance="${esc(item.value_id)}" aria-label="${tr("Открыть происхождение", "Open provenance")}">↗</button></td></tr>`).join("") || `<tr><td colspan="7" class="nri-empty-row">${tr("Нет строк для выбранных фильтров.", "No rows match the selected filters.")}</td></tr>`}</tbody></table></div><footer class="nri-pagination"><span>${tr("Строки", "Rows")} ${rows.length ? intFmt(start + 1) : "0"}–${intFmt(Math.min(start + ui.rankingPageSize, rows.length))} ${tr("из", "of")} ${intFmt(rows.length)}</span><div><button type="button" data-nri-page="prev" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><b>${intFmt(ui.rankingPage)} / ${intFmt(pageCount)}</b><button type="button" data-nri-page="next" ${ui.rankingPage >= pageCount ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer>`;
  }

  function rankingSection() {
    const total = filteredRanking().length;
    return `<section class="nri-section" id="nriRanking">
      ${sectionHeading("05", tr("Глобальное положение", "Global position"), tr("Мировой рейтинг NRI 2025", "NRI 2025 world ranking"), tr("127 официальных страновых оценок в одном проверяемом наборе. Нажатие на страну перестраивает весь профиль, не покидая рабочее пространство.", "127 official country scores in one auditable dataset. Selecting a country rebuilds the full profile without leaving the workspace."))}
      <div class="nri-ranking-overview">${podium()}${histogram()}</div>
      <article class="nri-ranking-panel">${rankingControls(total)}${rankingTable()}</article>
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
    return `<section class="nri-section" id="nriMethod">
      ${sectionHeading("06", tr("Научная воспроизводимость", "Scientific reproducibility"), tr("Метод, источник и контроль качества", "Method, source and quality control"), tr("Официальные значения сохраняются без замены пересчётом. Независимый пересчёт и контрольные суммы используются как тест согласованности и происхождения данных.", "Official values are preserved rather than replaced by recomputation. Independent recomputation and checksums are used as consistency and provenance tests."))}
      <div class="nri-method-grid">
        <article class="nri-method-card formula"><span>FORMULA · ${esc(formula.formula_version || "NRI 2025")}</span><h3>${tr("Иерархическая формула", "Hierarchical formula")}</h3><div class="nri-formula">${esc(formulaText)}</div><p>${esc(notes)}</p><div class="nri-method-flow"><div><strong>4</strong><span>${tr("столпа × 25%", "pillars × 25%")}</span></div><i>→</i><div><strong>12</strong><span>${tr("подстолпов", "sub-pillars")}</span></div><i>→</i><div><strong>53</strong><span>${tr("нормированных индикатора", "normalised indicators")}</span></div></div><div class="nri-normalization"><b>${tr("Нормализация и включение", "Normalisation and inclusion")}</b><p>${esc(normalization)}</p></div></article>
        <article class="nri-method-card source"><span>SOURCE · ${esc(source.source_id || "PORTULANS_NRI")}</span><h3>${tr("Официальный выпуск", "Official release")}</h3><dl class="nri-source-list">${sourceRow(tr("Владелец", "Owner"), source.owner)}${sourceRow(tr("Название", "Title"), source.title || source.source_name)}${sourceRow(tr("Редакция", "Edition"), payload.edition)}${sourceRow(tr("Опубликовано", "Published"), payload.publication_date)}${sourceRow(tr("Получено", "Retrieved"), source.retrieved_at)}${sourceRow(tr("Лицензия", "Licence"), source.license_or_terms)}${sourceRow(tr("Режим доступа", "Access mode"), source.access_mode)}${sourceRow(tr("Снимок", "Snapshot"), source.latest_snapshot_id)}</dl><div class="nri-method-actions"><a class="nri-button primary" href="${esc(source.source_url || payload.index?.url || "#")}" target="_blank" rel="noopener noreferrer">${tr("Открыть официальный отчёт", "Open official report")} ↗</a><button type="button" class="nri-button" data-nri-provenance="${esc(score().value_id || "")}">${tr("Provenance страны", "Country provenance")}</button></div></article>
        <article class="nri-method-card audit"><span>AUDIT · ${audit.validation_passed ? "PASSED" : "REVIEW"}</span><h3>${tr("Контроль загрузки", "Ingestion audit")}</h3><div class="nri-audit-kpis"><div><strong>${intFmt(audit.countries_loaded)}</strong><span>${tr("стран загружено", "countries loaded")}</span></div><div><strong>${intFmt(audit.hierarchy_rows_loaded)}</strong><span>${tr("иерархических строк", "hierarchy rows")}</span></div><div><strong>${intFmt(audit.ranking_profile_mismatches)}</strong><span>${tr("расхождений профиля и рейтинга", "ranking/profile mismatches")}</span></div><div><strong>${fmt(Math.max(Number(audit.max_overall_residual || 0), Number(audit.max_pillar_residual || 0), Number(audit.max_subpillar_residual || 0)), 4)}</strong><span>${tr("макс. остаток пересчёта", "max reconciliation residual")}</span></div></div><div class="nri-audit-status"><i></i><div><b>${tr("Проверка пройдена", "Validation passed")}</b><p>${tr("Иерархия согласуется с опубликованными значениями в пределах допуска 0,011 пункта.", "The hierarchy reconciles to published values within the 0.011-point tolerance.")}</p></div></div></article>
        <article class="nri-method-card warning"><span>INTERPRETATION</span><h3>${tr("Как читать выпуск", "How to read the edition")}</h3><p>${esc(warning)}</p><div class="nri-license-note"><b>${tr("Политика поставки GIR", "GIR delivery policy")}</b><p>${esc(lang() === "ru" ? source.license_note?.replace("Conservative GIR delivery policy excludes the raw report and supplies factual derived rows plus an official-host download recipe.", "Исходный PDF не включён в патч: поставляются фактические производные строки и проверяемый рецепт загрузки с официального сервера.") : source.license_note)}</p></div></article>
      </div>
    </section>`;
  }

  function renderWorkspace() {
    return `<div class="nri-workspace">${hero()}${jumpNav()}${diagnosis()}${benchmarksSection()}${subpillarsSection()}${architectureSection()}${rankingSection()}${methodSection()}</div>`;
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

  function bind() {
    const root = context.root;
    root.querySelectorAll("[data-nri-scroll]").forEach((button) => {
      button.addEventListener("click", () => document.getElementById(button.dataset.nriScroll)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
    root.querySelectorAll("[data-nri-provenance]").forEach((button) => {
      button.addEventListener("click", () => context.openProvenance?.(button.dataset.nriProvenance, button));
    });
    root.querySelectorAll("[data-nri-country]").forEach((button) => {
      button.addEventListener("click", () => {
        const iso3 = button.dataset.nriCountry;
        if (!iso3 || iso3 === selectedIso()) return;
        ui.rankingPage = 1;
        context.selectCountry?.(iso3);
      });
    });
    const architectureSearch = root.querySelector("#nriArchitectureSearch");
    if (architectureSearch) architectureSearch.addEventListener("input", (event) => {
      ui.architectureQuery = event.target.value;
      window.clearTimeout(architectureSearch.__nriTimer);
      const selectionEnd = event.target.selectionStart;
      architectureSearch.__nriTimer = window.setTimeout(() => preserveScroll(paint, { focusSelector: "#nriArchitectureSearch", selectionEnd }), 120);
    });
    const missing = root.querySelector("#nriMissingOnly");
    if (missing) missing.addEventListener("change", (event) => { ui.missingOnly = event.target.checked; preserveScroll(paint); });
    const rankSearch = root.querySelector("#nriRankingSearch");
    if (rankSearch) rankSearch.addEventListener("input", (event) => {
      ui.rankingQuery = event.target.value;
      ui.rankingPage = 1;
      window.clearTimeout(rankSearch.__nriTimer);
      const selectionEnd = event.target.selectionStart;
      rankSearch.__nriTimer = window.setTimeout(() => preserveScroll(paint, { focusSelector: "#nriRankingSearch", selectionEnd }), 120);
    });
    const region = root.querySelector("#nriRankingRegion");
    if (region) region.addEventListener("change", (event) => { ui.rankingRegion = event.target.value; ui.rankingPage = 1; preserveScroll(paint); });
    const income = root.querySelector("#nriRankingIncome");
    if (income) income.addEventListener("change", (event) => { ui.rankingIncome = event.target.value; ui.rankingPage = 1; preserveScroll(paint); });
    root.querySelectorAll("[data-nri-page]").forEach((button) => button.addEventListener("click", () => {
      ui.rankingPage += button.dataset.nriPage === "next" ? 1 : -1;
      preserveScroll(paint);
      document.getElementById("nriRanking")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    context.root.classList.add("nri-workspace-host");
    context.root.innerHTML = loading();
    try {
      const data = await load();
      if (token !== renderSerial || context.country !== nextContext.country) return;
      payload = data;
      paint();
    } catch (error) {
      if (token !== renderSerial) return;
      context.root.innerHTML = errorState(error);
      context.root.querySelector("[data-nri-retry]")?.addEventListener("click", () => { cache.delete(cacheKey()); render(context); });
    }
  }

  function invalidate(countryCode) {
    if (!countryCode) { cache.clear(); pending.clear(); return; }
    const prefix = `${String(countryCode).toUpperCase()}:`;
    [...cache.keys()].filter((key) => key.startsWith(prefix)).forEach((key) => cache.delete(key));
  }

  window.GIRNriWorkspace = { render, invalidate };
})();
