/* GIR Stage 7 — inter-country comparison and visual analytics workspace. */
(() => {
  "use strict";

  const INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"];
  const MAX_SELECTED = 8;
  const DEFAULT_SELECTED = ["RUS", "CHN", "USA", "DEU", "KOR", "IND"];
  const PALETTE = ["--s7-c1", "--s7-c2", "--s7-c3", "--s7-c4", "--s7-c5", "--s7-c6", "--s7-c7", "--s7-c8"];
  const SYMBOLS = ["●", "■", "▲", "◆", "✚", "⬟", "✦", "◉"];
  let context = null;
  let payload = null;
  let requestSerial = 0;
  let initialized = false;
  let debounceTimer = null;

  const ui = {
    group: "G20",
    region: "all",
    income: "all",
    query: "",
    hteiMode: "proxy_extended",
    selected: [...DEFAULT_SELECTED],
    scatterX: "HTEI",
    scatterY: "GII",
    trendIndex: "HTEI",
    trendMetric: "percentile",
    matrixMetric: "percentile",
    sortCode: "HTEI",
    sortDir: "desc",
    topN: "",
    page: 1,
    pageSize: 25,
  };

  const lang = () => context?.lang === "en" ? "en" : "ru";
  const tr = (ru, en) => lang() === "ru" ? ru : en;
  const esc = value => context?.escapeHtml ? context.escapeHtml(value ?? "") : String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const fmt = (value, digits = 1) => value == null || value === "" || !Number.isFinite(Number(value)) ? "—" : context?.fmt ? context.fmt(Number(value), digits) : Number(value).toFixed(digits);
  const intFmt = value => value == null || value === "" ? "—" : context?.intFmt ? context.intFmt(value) : new Intl.NumberFormat(lang() === "ru" ? "ru-RU" : "en-US").format(Number(value));
  const indexMeta = code => payload?.indices?.find(item => item.code === code) || {code, short_name_ru: code, short_name_en: code, name_ru: code, name_en: code};
  const indexShort = code => lang() === "ru" ? (indexMeta(code).short_name_ru || code) : (indexMeta(code).short_name_en || code);
  const indexAxis = code => code === "HCI_PLUS" ? "HCI+" : code === "QS_ET" ? "QS ET" : code;
  const isCompact = () => window.matchMedia?.("(max-width: 767px)")?.matches ?? window.innerWidth <= 767;
  const indexName = code => lang() === "ru" ? (indexMeta(code).name_ru || code) : (indexMeta(code).name_en || code);
  const countryName = country => lang() === "ru" ? country.name_ru : country.name_en;
  const groupLabel = group => lang() === "ru" ? group.label_ru : group.label_en;
  const groupDescription = group => lang() === "ru" ? group.description_ru : group.description_en;
  const cssColor = index => `var(${PALETTE[index % PALETTE.length]})`;
  const selectedIndex = iso3 => Math.max(0, ui.selected.indexOf(iso3));
  const colorFor = iso3 => cssColor(selectedIndex(iso3));
  const symbolFor = iso3 => SYMBOLS[selectedIndex(iso3) % SYMBOLS.length];

  function initialize(ctx) {
    context = ctx;
    if (initialized) return;
    initialized = true;
    const candidate = String(ctx.state?.matrixGroup || "").toUpperCase();
    ui.group = candidate && candidate !== "ALL" ? candidate : "G20";
    ui.region = ctx.state?.matrixRegion || "all";
    ui.income = ctx.state?.matrixIncome || "all";
    ui.query = ctx.state?.matrixQuery || "";
    ui.matrixMetric = ["percentile", "rank", "score", "freshness", "data_quality"].includes(ctx.state?.matrixMetric) ? ctx.state.matrixMetric : "percentile";
    ui.sortCode = ctx.state?.matrixSortCode || "HTEI";
    ui.sortDir = ctx.state?.matrixSortDir || "desc";
  }

  function syncLegacyState() {
    if (!context?.state) return;
    context.state.matrixGroup = ui.group;
    context.state.matrixRegion = ui.region;
    context.state.matrixIncome = ui.income;
    context.state.matrixQuery = ui.query;
    context.state.matrixMetric = ui.matrixMetric;
    context.state.matrixSortCode = ui.sortCode;
    context.state.matrixSortDir = ui.sortDir;
    context.state.matrixTopN = ui.topN;
  }

  function queryString() {
    const query = new URLSearchParams({
      year: String(context.year),
      group: ui.group,
      selected: ui.selected.join(","),
      scatter_x: ui.scatterX,
      scatter_y: ui.scatterY,
      trend_index: ui.trendIndex,
      htei_mode: ui.hteiMode,
    });
    if (ui.region !== "all") query.set("region", ui.region);
    if (ui.income !== "all") query.set("income_group", ui.income);
    if (ui.query.trim()) query.set("q", ui.query.trim());
    return query;
  }

  async function load() {
    const serial = ++requestSerial;
    syncLegacyState();
    renderLoading();
    try {
      const response = await fetch(`/api/comparison/workspace?${queryString()}`, {cache: "no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = await response.json();
      if (serial !== requestSerial) return;
      payload = next;
      ui.group = payload.group.code;
      ui.selected = payload.selected_countries.map(country => country.iso3).slice(0, MAX_SELECTED);
      ui.page = 1;
      renderPage();
    } catch (error) {
      if (serial !== requestSerial) return;
      renderError(error);
    }
  }

  function renderLoading() {
    if (!context?.root) return;
    context.root.innerHTML = `<section class="s7-loading" aria-live="polite"><div class="s7-loading-mark">G</div><h1>${tr("Формируется межстрановое сравнение","Building country comparison")}</h1><p>${tr("Согласуем выборки, процентильные позиции и методические редакции индексов…","Aligning samples, percentile positions and methodological editions…")}</p></section>`;
  }

  function renderError(error) {
    context.root.innerHTML = `<section class="s7-error"><h1>${tr("Не удалось открыть пространство сравнения","Could not open the comparison workspace")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="s7-button s7-primary" data-s7-retry>${tr("Повторить","Retry")}</button></section>`;
    context.root.querySelector("[data-s7-retry]")?.addEventListener("click", load);
  }

  function renderPage() {
    if (!payload) return;
    context.root.innerHTML = `${hero()}${jumpNav()}${profileSection()}${relationshipSection()}${trendSection()}${matrixSection()}${methodSection()}`;
    bindControls();
    bindCharts();
    context.syncAllSelectDisplays?.();
  }

  function hero() {
    const summary = payload.summary;
    const coverage = Math.round((summary.coverage_rate || 0) * 100);
    return `<section class="s7-hero" aria-labelledby="s7Title"><div class="s7-hero-main"><div><span class="s7-overline">GIR · COMPARATIVE INTELLIGENCE</span><h1 id="s7Title">${tr("Сравнение стран: где расходятся результаты и модели развития","Country comparison: where outcomes and development models diverge")}</h1><p>${tr("Единое пространство для структурных профилей, взаимосвязей индексов, динамики позиций и точной матрицы значений. Основной сравнительный масштаб — процентиль 0–100; исходные баллы, места, годы и источники сохраняются без преобразования.","A unified workspace for structural profiles, index relationships, rank dynamics and an exact value matrix. The main comparison scale is the 0–100 percentile; original scores, ranks, years and sources remain intact.")}</p></div><div class="s7-hero-actions"><button type="button" class="s7-button s7-primary" data-s7-scroll="s7Profiles">${tr("Сравнить профили","Compare profiles")}</button><button type="button" class="s7-button" data-s7-scroll="s7Matrix">${tr("Открыть точную матрицу","Open exact matrix")}</button><a class="s7-button s7-quiet" href="/api/comparison/workspace.csv?${queryString()}&lang=${lang()}" download="gir-country-comparison-${payload.requested_year}.csv">CSV</a></div><div class="s7-method-note"><b>${tr("Почему процентили?","Why percentiles?")}</b><span>${tr("HCI+ использует шкалу 0–325, большинство других модулей — 0–100. Процентиль делает положение страны сопоставимым, не подменяя исходный score.","HCI+ uses a 0–325 scale while most other modules use 0–100. Percentiles make country positions comparable without replacing the original score.")}</span></div></div><aside class="s7-hero-proof" aria-label="${tr("Параметры текущего сравнения","Current comparison parameters")}">${proofRow(tr("Группа","Group"), groupLabel(payload.group), groupDescription(payload.group))}${proofRow(tr("Страны","Countries"), intFmt(summary.country_count), tr(`${summary.complete_profiles} полных профилей`,`${summary.complete_profiles} complete profiles`))}${proofRow(tr("Индексные модули","Index modules"), intFmt(summary.index_count), `${intFmt(summary.available_cells)} / ${intFmt(summary.total_cells)}`)}${proofRow(tr("Покрытие","Coverage"), `${coverage}%`, tr(`${summary.stale_cells} устаревающих ячеек`,`${summary.stale_cells} ageing cells`))}${proofRow("HTEI", lang() === "ru" ? payload.htei.label_ru : payload.htei.label_en, payload.htei.release_year ? `${payload.htei.release_year}` : "—")}</aside></section>${globalControls()}`;
  }

  function proofRow(label, value, note) {
    return `<div class="s7-proof-row"><span>${esc(label)}<small>${esc(note || "")}</small></span><strong>${esc(value)}</strong></div>`;
  }

  function globalControls() {
    const groups = payload.groups.map(group => `<option value="${esc(group.code)}" ${group.code === ui.group ? "selected" : ""}>${esc(groupLabel(group))} · ${group.country_count}</option>`).join("");
    const regions = payload.regions.map(value => `<option value="${esc(value)}" ${value === ui.region ? "selected" : ""}>${esc(value)}</option>`).join("");
    const income = payload.income_groups.map(value => `<option value="${esc(value)}" ${value === ui.income ? "selected" : ""}>${esc(value)}</option>`).join("");
    return `<section class="s7-controls" aria-label="${tr("Фильтры сравнения","Comparison filters")}"><label><span>${tr("Сравнимая группа","Comparison group")}</span><select id="matrixGroup" class="select"><option value="ALL" ${ui.group === "ALL" ? "selected" : ""}>${tr("Все страны","All countries")}</option>${groups}</select></label><label><span>${tr("Режим HTEI","HTEI mode")}</span><select id="s7HteiMode" class="select"><option value="proxy_extended" ${ui.hteiMode === "proxy_extended" ? "selected" : ""}>${tr("Расширенный рейтинг","Extended ranking")}</option><option value="common_support" ${ui.hteiMode === "common_support" ? "selected" : ""}>${tr("Основной рейтинг","Primary ranking")}</option><option value="direct_core" ${ui.hteiMode === "direct_core" ? "selected" : ""}>${tr("Строгий прямой слой","Strict direct layer")}</option></select></label><details class="s7-filter-details"><summary>${tr("Дополнительные фильтры","Additional filters")}<span aria-hidden="true">+</span></summary><div class="s7-filter-grid"><label><span>${tr("Регион","Region")}</span><select id="regionSelect" class="select"><option value="all">${tr("Все регионы","All regions")}</option>${regions}</select></label><label><span>${tr("Группа дохода","Income group")}</span><select id="incomeSelect" class="select"><option value="all">${tr("Все группы","All groups")}</option>${income}</select></label><label class="s7-search-label"><span>${tr("Поиск страны","Country search")}</span><input id="matrixSearch" class="input" type="search" value="${esc(ui.query)}" placeholder="${tr("Россия, Germany, KOR…","Russia, Germany, KOR…")}"></label></div></details><button type="button" class="s7-reset" data-s7-reset>${tr("Сбросить","Reset")}</button></section>`;
  }

  function jumpNav() {
    const items = [["s7Profiles", tr("Профили","Profiles")],["s7Relationships",tr("Взаимосвязи","Relationships")],["s7Trends",tr("Динамика","Trends")],["s7Matrix",tr("Точная матрица","Exact matrix")]];
    return `<nav class="s7-jump" aria-label="${tr("Разделы межстранового сравнения","Country comparison sections")}">${items.map(([id,label],index) => `<button type="button" data-s7-scroll="${id}"><span>0${index + 1}</span>${label}</button>`).join("")}</nav>`;
  }

  function sectionHeading(number, title, description, controls = "") {
    return `<header class="s7-section-head"><div><span>${number}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p>${controls ? `<div class="s7-section-controls">${controls}</div>` : ""}</header>`;
  }

  function mobileScrollHint(ru, en) {
    return `<p class="s7-mobile-scroll-hint">↔ ${esc(tr(ru,en))}</p>`;
  }

  function selectedCountriesControl() {
    const selected = payload.selected_countries;
    const available = payload.all_countries.filter(country => !ui.selected.includes(country.iso3));
    return `<div class="s7-country-selection"><div class="s7-selected-list" aria-label="${tr("Выбранные страны","Selected countries")}">${selected.map((country, index) => `<span class="s7-country-token" style="--country-color:${cssColor(index)}"><b>${SYMBOLS[index]}</b>${context.flagImage?.(country,"flag-img inline") || ""}<span>${esc(countryName(country))}</span><button type="button" data-s7-remove-country="${country.iso3}" aria-label="${tr("Удалить страну","Remove country")}: ${esc(countryName(country))}">×</button></span>`).join("")}</div><label class="s7-add-country"><span class="sr-only">${tr("Добавить страну","Add country")}</span><select id="s7AddCountry" class="select"><option value="">+ ${tr("Добавить страну","Add country")}</option>${available.map(country => `<option value="${country.iso3}">${esc(countryName(country))} · ${country.iso3}</option>`).join("")}</select></label></div>`;
  }

  function profileSection() {
    return `<section id="s7Profiles" class="s7-section">${sectionHeading("01",tr("Структурные профили стран","Country structural profiles"),tr("Каждая строка — отдельный индекс; положение по горизонтали — процентиль страны. Медиана выбранной группы показана квадратом M.","Each row is an index; horizontal position is the country's percentile. The selected-group median is marked by an M square."))}${selectedCountriesControl()}<div class="s7-profile-layout"><figure class="s7-figure s7-profile-figure" aria-labelledby="s7ProfileTitle"><div class="s7-figure-title"><div><h3 id="s7ProfileTitle">${tr("Профиль по семи измерениям","Seven-dimension profile")}</h3><p>${tr("Выше и правее — более высокая позиция в соответствующей рейтинговой вселенной.","Higher and further right indicates a stronger position in the corresponding ranking universe.")}</p></div><span class="s7-scale-tag">PERCENTILE · 0–100</span></div>${profileChart()}${countryLegend()}<figcaption>${tr("Число внутри маркера соответствует номеру страны в легенде. Цвет дублируется символом и подписью.","The number inside each marker matches the country number in the legend. Colour is duplicated by symbol and label.")}</figcaption></figure><aside class="s7-insight-panel"><h3>${tr("Что отличает выбранные страны","What differentiates the selected countries")}</h3>${countryInsights()}</aside></div>${profileDataTable()}</section>`;
  }

  function profileChart() {
    if (isCompact()) return mobileProfileChart();
    const width = 960, height = 445, margin = {left: 188, right: 42, top: 48, bottom: 48};
    const plotWidth = width - margin.left - margin.right;
    const rowHeight = (height - margin.top - margin.bottom) / Math.max(1, payload.indices.length);
    const x = value => margin.left + Math.max(0, Math.min(100, Number(value))) / 100 * plotWidth;
    let svg = "";
    [0,25,50,75,100].forEach(tick => {
      const xx = x(tick);
      svg += `<line class="s7-grid-line" x1="${xx}" x2="${xx}" y1="${margin.top - 18}" y2="${height - margin.bottom + 6}"/><text class="s7-axis-label" x="${xx}" y="${height - 15}" text-anchor="middle">${tick}</text>`;
    });
    payload.indices.forEach((index, rowIndex) => {
      const y = margin.top + rowHeight * rowIndex + rowHeight / 2;
      const summary = payload.index_summaries.find(item => item.code === index.code);
      svg += `<line class="s7-row-line" x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}"/><text class="s7-row-code" x="0" y="${y - 3}">${esc(indexShort(index.code))}</text><text class="s7-row-name" x="0" y="${y + 14}">${esc(indexName(index.code).slice(0, 29))}</text>`;
      if (summary?.median_percentile != null) {
        const mx = x(summary.median_percentile);
        svg += `<rect class="s7-median-marker" x="${mx - 8}" y="${y - 8}" width="16" height="16" rx="2"/><text class="s7-median-text" x="${mx}" y="${y + 4}" text-anchor="middle">M</text>`;
      }
      payload.selected_countries.forEach((country, countryIndex) => {
        const cell = country.indices[index.code];
        if (!cell || cell.percentile == null) return;
        const xx = x(cell.percentile);
        const tip = profileTip(country, index.code, cell);
        svg += `<g class="s7-profile-point" tabindex="0" role="button" data-s7-tip="${esc(tip)}" data-value-id="${esc(cell.value_id || "")}" aria-label="${esc(tip.replaceAll("\n", ". "))}"><circle cx="${xx}" cy="${y}" r="12" fill="${cssColor(countryIndex)}"/><text x="${xx}" y="${y + 4}" text-anchor="middle">${countryIndex + 1}</text></g>`;
      });
    });
    return `<svg class="s7-profile-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="s7ProfileSvgTitle s7ProfileSvgDesc"><title id="s7ProfileSvgTitle">${tr("Процентильные профили выбранных стран","Percentile profiles of selected countries")}</title><desc id="s7ProfileSvgDesc">${tr("Семь строк соответствуют индексам. Для каждой выбранной страны показана процентильная позиция от нуля до ста и медиана группы.","Seven rows correspond to indices. Each selected country is shown by its zero-to-one-hundred percentile and the group median.")}</desc>${svg}</svg>`;
  }

  function profileTip(country, code, cell) {
    return `${countryName(country)} · ${indexShort(code)}
${tr("Процентиль","Percentile")}: ${fmt(cell.percentile,1)}
${tr("Место","Rank")}: ${cell.rank ?? "—"} / ${cell.universe_count ?? "—"}
${tr("Оценка","Score")}: ${fmt(cell.score,2)}
${tr("Год","Year")}: ${cell.value_year ?? "—"}`;
  }

  function mobileProfileChart() {
    return `<div class="s7-mobile-profile" role="group" aria-label="${tr("Процентильные профили выбранных стран по семи индексам","Percentile profiles of selected countries across seven indices")}">${payload.indices.map(index => {
      const summary = payload.index_summaries.find(item => item.code === index.code);
      const median = summary?.median_percentile;
      const points = payload.selected_countries.map((country, countryIndex) => {
        const cell = country.indices[index.code];
        return cell && cell.percentile != null ? { country, countryIndex, cell, x: Math.max(0, Math.min(100, cell.percentile)) } : null;
      }).filter(Boolean).sort((a, b) => a.x - b.x);
      const laneEnds = [];
      points.forEach(point => {
        let lane = laneEnds.findIndex(lastX => point.x - lastX >= 10);
        if (lane < 0) { lane = laneEnds.length; laneEnds.push(-Infinity); }
        laneEnds[lane] = point.x;
        point.lane = lane;
      });
      const laneCount = Math.max(1, laneEnds.length);
      return `<section class="s7-mobile-profile-row"><header><div><b>${esc(indexShort(index.code))}</b><span>${esc(indexName(index.code))}</span></div><small>${tr("Медиана","Median")} · P${fmt(median,0)}</small></header><div class="s7-mobile-profile-track" style="--lane-count:${laneCount}">${median == null ? "" : `<i class="s7-mobile-median" style="--x:${Math.max(0,Math.min(100,median))}%" aria-hidden="true">M</i>`}${points.map(point => {
        const tip = profileTip(point.country,index.code,point.cell);
        return `<button type="button" class="s7-profile-point s7-mobile-profile-point" style="--x:${point.x}%;--lane:${point.lane};--country-color:${cssColor(point.countryIndex)}" data-s7-tip="${esc(tip)}" data-value-id="${esc(point.cell.value_id || "")}" aria-label="${esc(tip.replaceAll("\n", ". "))}">${point.countryIndex + 1}</button>`;
      }).join("")}</div><div class="s7-mobile-scale" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div></section>`;
    }).join("")}</div>`;
  }

  function countryLegend() {
    return `<div class="s7-legend">${payload.selected_countries.map((country, index) => `<span><i style="--legend-color:${cssColor(index)}">${index + 1}</i><b>${SYMBOLS[index]}</b>${esc(countryName(country))}<small>${country.iso3}</small></span>`).join("")}<span class="s7-median-legend"><i>M</i>${tr("медиана группы","group median")}</span></div>`;
  }

  function countryInsights() {
    const byIso = new Map(payload.selected_countries.map(country => [country.iso3, country]));
    return payload.country_insights.map((insight, index) => {
      const country = byIso.get(insight.iso3);
      if (!country) return "";
      const strongest = insight.strongest;
      const weakest = insight.weakest;
      return `<article class="s7-insight"><header><span style="--country-color:${cssColor(index)}">${index + 1}</span><div><b>${esc(countryName(country))}</b><small>${country.iso3} · ${insight.coverage_count}/7</small></div><strong>${fmt(insight.mean_percentile,0)}</strong></header><div><span>${tr("Сильнее всего","Strongest")}</span><b>${strongest ? `${esc(indexShort(strongest.index_code))} · P${fmt(strongest.percentile,0)}` : "—"}</b></div><div><span>${tr("Главный разрыв","Largest gap")}</span><b>${weakest ? `${esc(indexShort(weakest.index_code))} · P${fmt(weakest.percentile,0)}` : "—"}</b></div></article>`;
    }).join("");
  }

  function profileDataTable() {
    return `<details class="s7-accessible-data"><summary>${tr("Табличное описание профильного графика","Tabular description of profile chart")}</summary><div class="s7-table-wrap"><table class="s7-table"><caption>${tr("Процентильные позиции выбранных стран","Percentile positions of selected countries")}</caption><thead><tr><th>${tr("Индекс","Index")}</th><th>${tr("Медиана группы","Group median")}</th>${payload.selected_countries.map(country => `<th>${esc(country.iso3)}</th>`).join("")}</tr></thead><tbody>${payload.indices.map(index => { const summary = payload.index_summaries.find(item => item.code === index.code); return `<tr><th>${esc(indexShort(index.code))}</th><td>${fmt(summary?.median_percentile,1)}</td>${payload.selected_countries.map(country => `<td>${fmt(country.indices[index.code]?.percentile,1)}</td>`).join("")}</tr>`; }).join("")}</tbody></table></div></details>`;
  }

  function relationshipSection() {
    const indexOptions = payload.indices.map(index => `<option value="${index.code}">${esc(indexShort(index.code))}</option>`).join("");
    const controls = `<label><span>X</span><select id="s7ScatterX" class="select">${payload.indices.map(index => `<option value="${index.code}" ${index.code === ui.scatterX ? "selected" : ""}>${esc(indexShort(index.code))}</option>`).join("")}</select></label><span class="s7-versus">×</span><label><span>Y</span><select id="s7ScatterY" class="select">${payload.indices.map(index => `<option value="${index.code}" ${index.code === ui.scatterY ? "selected" : ""}>${esc(indexShort(index.code))}</option>`).join("")}</select></label>`;
    return `<section id="s7Relationships" class="s7-section">${sectionHeading("02",tr("Взаимосвязи между индексами","Relationships between indices"),tr("Scatterplot показывает положение стран по двум процентильным шкалам. Корреляционная матрица рассчитывает Spearman по пересечению стран с обоими исходными scores.","The scatterplot positions countries on two percentile scales. The correlation matrix uses Spearman on the overlap of countries with both original scores."),controls)}<div class="s7-relation-layout"><figure class="s7-figure s7-scatter-figure"><div class="s7-figure-title"><div><h3>${esc(indexShort(payload.scatter.x_index))} × ${esc(indexShort(payload.scatter.y_index))}</h3><p>${tr(`Пересечение выборок: ${payload.scatter.n} стран`, `Overlapping sample: ${payload.scatter.n} countries`)}</p></div><div class="s7-stat"><span>Spearman ρ</span><strong>${fmt(payload.scatter.correlation,3)}</strong><small>n = ${payload.scatter.n}</small></div></div>${scatterChart()}${scatterSummary()}<figcaption>${tr("Оси показывают процентиль, поэтому 100 означает верхнюю позицию в рейтинговой вселенной каждого индекса. Корреляция вычисляется по исходным scores и не означает причинность.","Axes show percentile, so 100 indicates the top of each index's ranking universe. Correlation is calculated from original scores and does not imply causation.")}</figcaption></figure><div class="s7-correlation-panel"><div class="s7-figure-title"><div><h3>${tr("Корреляционная матрица","Correlation matrix")}</h3><p>${tr("Коэффициент и объём парной выборки указаны внутри каждой ячейки.","Coefficient and pairwise sample size are printed inside each cell.")}</p></div><span class="s7-scale-tag">SPEARMAN · n≥${payload.correlations.cells[0]?.minimum_n || 15}</span></div>${mobileScrollHint("Проведите по матрице, чтобы увидеть все семь индексов.","Swipe the matrix to inspect all seven indices.")}${correlationMatrix()}${correlationNarrative()}</div></div>${scatterDataTable()}</section>`;
  }

  function scatterChart() {
    const scatter = payload.scatter;
    const compact = isCompact();
    const width = compact ? 360 : 760, height = compact ? 390 : 520;
    const margin = compact ? {left: 44, right: 18, top: 25, bottom: 58} : {left: 70, right: 35, top: 32, bottom: 72};
    const x = value => margin.left + Number(value) / 100 * (width - margin.left - margin.right);
    const y = value => height - margin.bottom - Number(value) / 100 * (height - margin.top - margin.bottom);
    let svg = "";
    [0,25,50,75,100].forEach(tick => {
      svg += `<line class="s7-grid-line" x1="${x(tick)}" x2="${x(tick)}" y1="${margin.top}" y2="${height - margin.bottom}"/><line class="s7-grid-line" x1="${margin.left}" x2="${width - margin.right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="s7-axis-label" x="${x(tick)}" y="${height - 34}" text-anchor="middle">${tick}</text><text class="s7-axis-label" x="${margin.left - 10}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`;
    });
    if (scatter.median_x != null) svg += `<line class="s7-median-line" x1="${x(scatter.median_x)}" x2="${x(scatter.median_x)}" y1="${margin.top}" y2="${height - margin.bottom}"/>`;
    if (scatter.median_y != null) svg += `<line class="s7-median-line" x1="${margin.left}" x2="${width - margin.right}" y1="${y(scatter.median_y)}" y2="${y(scatter.median_y)}"/>`;
    scatter.points.forEach(point => {
      const selected = ui.selected.includes(point.iso3);
      const index = selectedIndex(point.iso3);
      const color = selected ? cssColor(index) : "var(--s7-neutral-point)";
      const radius = selected ? (compact ? 6 : 8) : (compact ? 3.7 : 5);
      const tip = `${lang() === "ru" ? point.name_ru : point.name_en} (${point.iso3})
${indexShort(scatter.x_index)}: P${fmt(point.x,1)} · #${point.x_rank ?? "—"} · ${fmt(point.x_score,2)}
${indexShort(scatter.y_index)}: P${fmt(point.y,1)} · #${point.y_rank ?? "—"} · ${fmt(point.y_score,2)}`;
      const labelRight = Number(point.x) < 82;
      const labelX = x(point.x) + (labelRight ? 8 : -8);
      const anchor = labelRight ? "start" : "end";
      const pointLabel = selected ? `<text x="${labelX}" y="${y(point.y) - 7}" text-anchor="${anchor}">${esc(point.iso3)}</text>` : (!compact && scatter.points.length <= 24 ? `<text x="${x(point.x) + 7}" y="${y(point.y) - 7}">${esc(point.iso3)}</text>` : "");
      svg += `<g tabindex="0" role="img" class="s7-scatter-point ${selected ? "is-selected" : ""}" data-s7-tip="${esc(tip)}" aria-label="${esc(tip.replaceAll("\n", ". "))}"><circle cx="${x(point.x)}" cy="${y(point.y)}" r="${radius}" fill="${color}"/>${selected ? `<circle cx="${x(point.x)}" cy="${y(point.y)}" r="${compact ? 9 : 12}" fill="none" stroke="${color}"/>` : ""}${pointLabel}</g>`;
    });
    svg += `<text class="s7-axis-title" x="${(margin.left + width - margin.right) / 2}" y="${height - 8}" text-anchor="middle">${esc(indexAxis(scatter.x_index))} · ${tr("процентиль","percentile")}</text><text class="s7-axis-title" transform="translate(13 ${(margin.top + height - margin.bottom) / 2}) rotate(-90)" text-anchor="middle">${esc(indexAxis(scatter.y_index))} · ${tr("процентиль","percentile")}</text>`;
    return `<svg class="s7-scatter-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="s7ScatterTitle s7ScatterDesc"><title id="s7ScatterTitle">${esc(indexShort(scatter.x_index))} × ${esc(indexShort(scatter.y_index))}</title><desc id="s7ScatterDesc">${tr("Диаграмма рассеяния стран по двум процентильным позициям. Выбранные страны выделены кольцом и подписью ISO.","Scatterplot of countries by two percentile positions. Selected countries are marked with a ring and ISO label.")}</desc>${svg}</svg>`;
  }

  function scatterSummary() {
    const q = payload.scatter.quadrants;
    return `<div class="s7-quadrants"><div><span>${tr("Высоко по обоим","High on both")}</span><strong>${q.high_high}</strong></div><div><span>${esc(indexShort(payload.scatter.x_index))} ↑ · ${esc(indexShort(payload.scatter.y_index))} ↓</span><strong>${q.high_low}</strong></div><div><span>${esc(indexShort(payload.scatter.x_index))} ↓ · ${esc(indexShort(payload.scatter.y_index))} ↑</span><strong>${q.low_high}</strong></div><div><span>${tr("Ниже медианы по обоим","Below median on both")}</span><strong>${q.low_low}</strong></div></div>`;
  }

  function correlationMatrix() {
    const cellMap = new Map(payload.correlations.cells.map(cell => [`${cell.y}|${cell.x}`, cell]));
    return `<div class="s7-corr-wrap"><table class="s7-corr-table"><caption>${tr("Попарные Spearman-корреляции исходных scores","Pairwise Spearman correlations of original scores")}</caption><thead><tr><th></th>${payload.indices.map(index => `<th>${esc(indexShort(index.code))}</th>`).join("")}</tr></thead><tbody>${payload.indices.map(rowIndex => `<tr><th>${esc(indexShort(rowIndex.code))}</th>${payload.indices.map(columnIndex => { const cell = cellMap.get(`${rowIndex.code}|${columnIndex.code}`); const value = cell?.coefficient; const intensity = value == null ? 0 : Math.min(1, Math.abs(value)); const tone = value == null ? "none" : value >= 0 ? "positive" : "negative"; return `<td><button type="button" class="s7-corr-cell ${tone}" style="--corr-intensity:${intensity}" data-s7-corr-x="${columnIndex.code}" data-s7-corr-y="${rowIndex.code}" aria-label="${esc(`${indexShort(columnIndex.code)} × ${indexShort(rowIndex.code)}: ${value == null ? tr("не публикуется","withheld") : fmt(value,2)}, n=${cell?.n ?? 0}`)}"><strong>${value == null ? "—" : fmt(value,2)}</strong><small>n=${cell?.n ?? 0}</small></button></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function correlationNarrative() {
    const strong = payload.correlations.strongest_pair;
    const weak = payload.correlations.weakest_pair;
    return `<div class="s7-corr-notes"><article><span>${tr("Наиболее согласованная пара","Strongest association")}</span><b>${strong ? `${esc(indexShort(strong.x))} × ${esc(indexShort(strong.y))}` : "—"}</b><strong>${strong ? fmt(strong.coefficient,3) : "—"}</strong><small>${strong ? `n=${strong.n}` : ""}</small></article><article><span>${tr("Наименее согласованная пара","Weakest association")}</span><b>${weak ? `${esc(indexShort(weak.x))} × ${esc(indexShort(weak.y))}` : "—"}</b><strong>${weak ? fmt(weak.coefficient,3) : "—"}</strong><small>${weak ? `n=${weak.n}` : ""}</small></article><p>${tr("Коэффициенты при n<15 скрыты. Низкая корреляция не является недостатком индекса: она может означать, что модули измеряют разные аспекты развития.","Coefficients with n<15 are withheld. A low correlation is not an index defect; it may mean that modules measure different aspects of development.")}</p></div>`;
  }

  function scatterDataTable() {
    const points = payload.scatter.points;
    return `<details class="s7-accessible-data"><summary>${tr("Табличное описание scatterplot","Tabular description of scatterplot")}</summary><div class="s7-table-wrap"><table class="s7-table"><caption>${esc(indexShort(payload.scatter.x_index))} × ${esc(indexShort(payload.scatter.y_index))}</caption><thead><tr><th>${tr("Страна","Country")}</th><th>${esc(indexShort(payload.scatter.x_index))} · P</th><th>${tr("Место","Rank")}</th><th>${esc(indexShort(payload.scatter.y_index))} · P</th><th>${tr("Место","Rank")}</th></tr></thead><tbody>${points.map(point => `<tr><th>${esc(lang() === "ru" ? point.name_ru : point.name_en)}<small>${point.iso3}</small></th><td>${fmt(point.x,1)}</td><td>${point.x_rank ?? "—"}</td><td>${fmt(point.y,1)}</td><td>${point.y_rank ?? "—"}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function trendSection() {
    const controls = `<label><span>${tr("Индекс","Index")}</span><select id="s7TrendIndex" class="select">${payload.indices.map(index => `<option value="${index.code}" ${index.code === ui.trendIndex ? "selected" : ""}>${esc(indexShort(index.code))}</option>`).join("")}</select></label><div class="s7-segmented" role="group" aria-label="${tr("Метрика динамики","Trend metric")}"><button type="button" data-s7-trend-metric="percentile" aria-pressed="${ui.trendMetric === "percentile"}">${tr("Процентиль","Percentile")}</button><button type="button" data-s7-trend-metric="rank" aria-pressed="${ui.trendMetric === "rank"}">${tr("Место","Rank")}</button></div>`;
    return `<section id="s7Trends" class="s7-section">${sectionHeading("03",tr("Как менялось международное положение","How international position changed"),tr("Процентиль учитывает изменение размера рейтинговой вселенной. Режим «место» сохраняет исходный ранг и показывает размер вселенной в tooltip.","Percentile accounts for changes in ranking-universe size. Rank mode preserves the original rank and exposes the universe size in the tooltip."),controls)}<figure class="s7-figure s7-trend-figure"><div class="s7-figure-title"><div><h3>${esc(indexName(payload.trend.index_code))}</h3><p>${tr("Выбранные страны · методические разрывы отмечены пунктиром и ромбом","Selected countries · methodology breaks use a dashed connector and diamond marker")}</p></div><span class="s7-scale-tag">${ui.trendMetric === "rank" ? tr("МЕСТО · ВЫШЕ ЛУЧШЕ","RANK · HIGHER IS BETTER") : "PERCENTILE · 0–100"}</span></div>${trendWarnings()}${trendChart()}${countryLegend()}<figcaption>${tr("Сплошная линия соединяет сопоставимые точки одной редакции. Пунктир к HTEI 2026 обозначает переход к методологии v6, а не непрерывный однородный ряд.","A solid line joins comparable points from one edition. The dashed connector to HTEI 2026 marks the transition to v6 methodology rather than a continuous homogeneous series.")}</figcaption></figure>${trendDataTable()}</section>`;
  }

  function trendWarnings() {
    const warnings = lang() === "ru" ? payload.trend.warnings_ru : payload.trend.warnings_en;
    return warnings?.length ? `<div class="s7-warning">${warnings.map(text => `<p>${esc(text)}</p>`).join("")}</div>` : "";
  }

  function trendChart() {
    const trend = payload.trend;
    const compact = isCompact();
    const allYears = trend.years;
    if (!allYears.length) return `<div class="s7-empty-chart">${tr("Для выбранного индекса нет временного ряда.","No time series is available for the selected index.")}</div>`;
    const years = compact && allYears.length > 12 ? allYears.slice(-12) : allYears;
    const visibleYears = new Set(years);
    const width = compact ? 360 : 1120, height = compact ? 380 : 500;
    const margin = compact ? {left: 42, right: 38, top: 28, bottom: 56} : {left: 72, right: 132, top: 35, bottom: 68};
    const x = year => margin.left + (Number(year) - years[0]) / Math.max(1, years.at(-1) - years[0]) * (width - margin.left - margin.right);
    const allPoints = trend.series.flatMap(series => series.points).filter(point => visibleYears.has(point.year));
    let minValue = 0, maxValue = 100;
    if (ui.trendMetric === "rank") {
      minValue = 1;
      maxValue = Math.max(10, ...allPoints.map(point => Number(point.rank || 0)));
    }
    const y = value => {
      if (ui.trendMetric === "rank") return margin.top + (Number(value) - minValue) / Math.max(1, maxValue - minValue) * (height - margin.top - margin.bottom);
      return height - margin.bottom - Number(value) / 100 * (height - margin.top - margin.bottom);
    };
    const ticks = ui.trendMetric === "rank" ? [1, Math.round(maxValue * .25), Math.round(maxValue * .5), Math.round(maxValue * .75), maxValue] : [0,25,50,75,100];
    const yearStep = compact ? Math.max(1,Math.ceil(years.length / 6)) : 1;
    const yearTicks = years.filter((_,index) => index % yearStep === 0 || index === years.length - 1);
    let svg = "";
    ticks.forEach(tick => {
      svg += `<line class="s7-grid-line" x1="${margin.left}" x2="${width - margin.right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="s7-axis-label" x="${margin.left - 10}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`;
    });
    yearTicks.forEach(year => svg += `<line class="s7-grid-line s7-grid-vertical" x1="${x(year)}" x2="${x(year)}" y1="${margin.top}" y2="${height - margin.bottom}"/><text class="s7-axis-label" x="${x(year)}" y="${height - 30}" text-anchor="middle">${compact ? String(year).slice(-2) : year}</text>`);
    trend.series.forEach((series, index) => {
      const points = series.points.filter(point => visibleYears.has(point.year) && point[ui.trendMetric] != null);
      if (!points.length) return;
      const color = cssColor(index);
      points.forEach((point, pointIndex) => {
        if (pointIndex) {
          const previous = points[pointIndex - 1];
          const dashed = !point.comparable_to_previous || point.segment !== previous.segment;
          svg += `<line class="s7-trend-line ${dashed ? "is-break" : ""}" x1="${x(previous.year)}" y1="${y(previous[ui.trendMetric])}" x2="${x(point.year)}" y2="${y(point[ui.trendMetric])}" stroke="${color}"/>`;
        }
        const tip = `${lang() === "ru" ? series.name_ru : series.name_en} (${series.iso3})
${point.year}
${tr("Процентиль","Percentile")}: ${fmt(point.percentile,1)}
${tr("Место","Rank")}: ${point.rank ?? "—"} / ${point.universe_count ?? "—"}
${tr("Оценка","Score")}: ${fmt(point.score,2)}
${tr("Год данных","Data year")}: ${point.source_data_year ?? "—"}`;
        const px = x(point.year), py = y(point[ui.trendMetric]);
        if (point.segment === "current_v6") svg += `<g tabindex="0" role="img" data-s7-tip="${esc(tip)}" aria-label="${esc(tip.replaceAll("\n", ". "))}"><path class="s7-trend-diamond" fill="${color}" d="M${px},${py-7} L${px+7},${py} L${px},${py+7} L${px-7},${py} Z"/></g>`;
        else svg += `<circle tabindex="0" role="img" class="s7-trend-point" data-s7-tip="${esc(tip)}" aria-label="${esc(tip.replaceAll("\n", ". "))}" cx="${px}" cy="${py}" r="${compact ? 4.5 : 6}" fill="${color}"/>`;
      });
      const last = points.at(-1);
      const rightEdge = x(last.year) > width - margin.right - 28;
      svg += `<text class="s7-trend-label" x="${x(last.year) + (rightEdge ? -8 : 9)}" y="${y(last[ui.trendMetric]) + 4}" text-anchor="${rightEdge ? "end" : "start"}" fill="${color}">${esc(series.iso3)}</text>`;
    });
    const omitted = compact ? trend.series.filter(series => !series.points.some(point => visibleYears.has(point.year) && point[ui.trendMetric] != null)).map(series => series.iso3) : [];
    const note = compact && allYears.length > years.length ? `<p class="s7-mobile-chart-note">${tr(`Мобильный график показывает последние ${years.length} доступных периодов; полный ряд сохранён в таблице ниже.${omitted.length ? ` В текущем окне нет точек: ${omitted.join(", ")}.` : ""}`,`The mobile chart shows the latest ${years.length} available periods; the full series remains in the table below.${omitted.length ? ` No points in the current window: ${omitted.join(", ")}.` : ""}`)}</p>` : "";
    return `${note}<svg class="s7-trend-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="s7TrendTitle s7TrendDesc"><title id="s7TrendTitle">${esc(indexName(trend.index_code))}</title><desc id="s7TrendDesc">${tr("Динамика выбранных стран; сплошные отрезки сопоставимы, пунктир обозначает методический разрыв.","Trends for selected countries; solid segments are comparable and dashed segments indicate a methodology break.")}</desc>${svg}</svg>`;
  }

  function trendDataTable() {
    const years = payload.trend.years;
    return `<details class="s7-accessible-data"><summary>${tr("Табличное описание динамики","Tabular description of trends")}</summary><div class="s7-table-wrap"><table class="s7-table"><caption>${esc(indexName(payload.trend.index_code))}</caption><thead><tr><th>${tr("Страна","Country")}</th>${years.map(year => `<th>${year}</th>`).join("")}</tr></thead><tbody>${payload.trend.series.map(series => `<tr><th>${esc(lang() === "ru" ? series.name_ru : series.name_en)}<small>${series.iso3}</small></th>${years.map(year => { const point = series.points.find(item => item.year === year); return `<td>${point ? `${ui.trendMetric === "rank" ? `#${point.rank}` : `P${fmt(point.percentile,0)}`}<small>${point.segment === "current_v6" ? "v6" : ""}</small>` : "—"}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  }

  function matrixSection() {
    const metricOptions = [["percentile",tr("Процентиль","Percentile")],["rank",tr("Место","Rank")],["score",tr("Исходный score","Original score")],["freshness",tr("Актуальность","Freshness")],["data_quality",tr("Качество данных","Data quality")]];
    const controls = `<label><span>${tr("Ячейка показывает","Cell displays")}</span><select id="matrixMetric" class="select">${metricOptions.map(([value,label]) => `<option value="${value}" ${value === ui.matrixMetric ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label><label><span>Top-N</span><input id="matrixTopN" class="input s7-topn" type="number" min="1" max="${payload.countries.length}" value="${esc(ui.topN)}" placeholder="${payload.countries.length}"></label>`;
    return `<section id="s7Matrix" class="s7-section">${sectionHeading("04",tr("Точная матрица стран и индексов","Exact country × index matrix"),tr("Каждая ячейка сохраняет score, место, размер рейтинговой вселенной, год выпуска, фактический год данных, качество и provenance.","Every cell preserves score, rank, ranking-universe size, release year, actual data year, quality and provenance."),controls)}<div class="s7-matrix-summary"><p>${esc(lang() === "ru" ? payload.summary.diagnostic_mean_note_ru : payload.summary.diagnostic_mean_note_en)}</p><div><a class="s7-button" href="/api/comparison/workspace.csv?${queryString()}&lang=${lang()}" download="gir-country-comparison-${payload.requested_year}.csv">${tr("Расширенная CSV","Extended CSV")}</a><a class="s7-button s7-quiet" href="${legacyCsvHref()}" download="cross-matrix-${payload.requested_year}.csv">${tr("Совместимая CSV","Legacy CSV")}</a></div></div>${mobileScrollHint("Проведите по таблице, чтобы открыть остальные индексные столбцы.","Swipe the table to reveal the remaining index columns.")}${matrixTable()}${matrixPagination()}</section>`;
  }

  function legacyCsvHref() {
    const query = new URLSearchParams({year: String(payload.requested_year), group: ui.group === "ALL" ? "all" : ui.group, income_group: ui.income, metric: ui.matrixMetric === "percentile" || ui.matrixMetric === "freshness" ? "rank" : ui.matrixMetric, sort_index: ui.sortCode, sort_metric: ui.matrixMetric === "percentile" || ui.matrixMetric === "freshness" ? "rank" : ui.matrixMetric, sort_dir: ui.sortDir, lang: lang()});
    if (ui.region !== "all") query.set("region", ui.region);
    if (ui.query) query.set("q", ui.query);
    return `/api/cross-matrix.csv?${query}`;
  }

  function matrixRows() {
    const rows = [...payload.countries];
    const code = ui.sortCode;
    const direction = ui.sortDir === "asc" ? 1 : -1;
    rows.sort((a,b) => {
      const av = matrixSortValue(a.indices[code]);
      const bv = matrixSortValue(b.indices[code]);
      if (av == null && bv == null) return countryName(a).localeCompare(countryName(b));
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av - bv) * direction || countryName(a).localeCompare(countryName(b));
    });
    const limit = Number(ui.topN);
    return limit > 0 ? rows.slice(0, limit) : rows;
  }

  function matrixSortValue(cell) {
    if (!cell) return null;
    if (ui.matrixMetric === "rank") return cell.rank;
    if (ui.matrixMetric === "score") return cell.score;
    if (ui.matrixMetric === "data_quality") return cell.data_quality;
    if (ui.matrixMetric === "freshness") return cell.year_lag;
    return cell.percentile;
  }

  function matrixTable() {
    const rows = matrixRows();
    const start = (ui.page - 1) * ui.pageSize;
    const pageRows = rows.slice(start, start + ui.pageSize);
    return `<div class="s7-table-wrap s7-matrix-wrap"><table class="s7-table matrix-table"><caption>${tr(`Страны: ${rows.length}; индексные модули: ${payload.indices.length}`,`Countries: ${rows.length}; index modules: ${payload.indices.length}`)}</caption><thead><tr><th class="s7-sticky-country">${tr("Страна","Country")}</th><th><button type="button" class="table-head-btn ${ui.sortCode === "PROFILE" ? "active" : ""}" data-s7-sort="PROFILE">${tr("Профиль P","Profile P")}</button></th>${payload.indices.map(index => `<th><button type="button" class="table-head-btn ${ui.sortCode === index.code ? "active" : ""}" data-s7-sort="${index.code}" title="${esc(indexName(index.code))}">${esc(indexShort(index.code))}${ui.sortCode === index.code ? ` <span aria-hidden="true">${ui.sortDir === "asc" ? "↑" : "↓"}</span>` : ""}</button></th>`).join("")}</tr></thead><tbody>${pageRows.map(country => `<tr><td class="s7-sticky-country"><button type="button" class="country-link" data-s7-country-link="${country.iso3}">${context.flagImage?.(country,"flag-img inline") || ""}<span><b>${esc(countryName(country))}</b><small>${country.iso3} · ${country.coverage_count}/7</small></span></button></td><td><div class="s7-profile-summary"><strong>P${fmt(country.mean_percentile,0)}</strong><span>${tr("медиана","median")} P${fmt(country.median_percentile,0)}</span></div></td>${payload.indices.map(index => `<td>${matrixCell(country.indices[index.code], index.code)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function matrixCell(cell, code) {
    if (!cell) return `<span class="s7-missing" aria-label="${tr("Нет данных","No data")}">—<small>${tr("нет данных","no data")}</small></span>`;
    let main, note;
    if (ui.matrixMetric === "rank") { main = cell.rank == null ? "—" : `#${cell.rank}`; note = `${fmt(cell.score,1)} · n=${cell.universe_count ?? "—"}`; }
    else if (ui.matrixMetric === "score") { main = fmt(cell.score,1); note = `#${cell.rank ?? "—"} / ${cell.universe_count ?? "—"}`; }
    else if (ui.matrixMetric === "data_quality") { main = `${fmt(Number(cell.data_quality || 0) * 100,0)}%`; note = `${tr("год","year")} ${cell.source_data_year ?? cell.value_year ?? "—"}`; }
    else if (ui.matrixMetric === "freshness") { main = cell.source_year_min && cell.source_year_max && cell.source_year_min !== cell.source_year_max ? `${cell.source_year_min}–${cell.source_year_max}` : `${cell.source_data_year ?? cell.value_year ?? "—"}`; note = cell.year_lag == null ? tr("лаг неизвестен","lag unknown") : tr(`лаг ${fmt(cell.year_lag,1)} г.`,`lag ${fmt(cell.year_lag,1)} y.`); }
    else { main = `P${fmt(cell.percentile,0)}`; note = `#${cell.rank ?? "—"} / ${cell.universe_count ?? "—"}`; }
    const freshness = cell.freshness || "missing";
    const aria = `${indexShort(code)}. ${tr("Процентиль","Percentile")} ${fmt(cell.percentile,1)}. ${tr("Место","Rank")} ${cell.rank ?? "—"} ${tr("из","of")} ${cell.universe_count ?? "—"}. ${tr("Оценка","Score")} ${fmt(cell.score,2)}. ${tr("Год данных","Data year")} ${cell.source_data_year ?? "—"}.`;
    const style = cell.percentile == null ? "" : `--cell-percentile:${Math.max(0,Math.min(100,cell.percentile))}%`;
    return `<button type="button" class="cell-rank s7-matrix-cell freshness-${freshness}" style="${style}" data-s7-provenance="${esc(cell.value_id || "")}" aria-label="${esc(aria)}"><strong>${esc(main)}</strong><small>${esc(note)}</small><i aria-hidden="true"></i></button>`;
  }

  function matrixPagination() {
    const rows = matrixRows();
    const pages = Math.max(1, Math.ceil(rows.length / ui.pageSize));
    ui.page = Math.min(ui.page, pages);
    return `<div class="s7-pagination"><span>${tr(`Страница ${ui.page} из ${pages} · ${rows.length} стран`,`Page ${ui.page} of ${pages} · ${rows.length} countries`)}</span><div><button type="button" class="s7-button" data-s7-page="prev" ${ui.page <= 1 ? "disabled" : ""}>← ${tr("Назад","Previous")}</button><button type="button" class="s7-button" data-s7-page="next" ${ui.page >= pages ? "disabled" : ""}>${tr("Далее","Next")} →</button></div></div>`;
  }

  function methodSection() {
    const notes = lang() === "ru" ? payload.methodology.notes_ru : payload.methodology.notes_en;
    return `<section class="s7-method"><div><span>METHOD</span><h2>${tr("Как читать сравнение","How to read the comparison")}</h2></div><ol>${notes.map(note => `<li>${esc(note)}</li>`).join("")}</ol><p>${tr("Точная методика и формулы каждого индекса остаются в разделе «Методология и источники»; эта страница не создаёт новый официальный интегральный рейтинг.","The exact methodology and formulas of every index remain in Methodology & Sources; this page does not create a new official composite ranking.")}</p></section><div id="s7Tooltip" class="s7-tooltip" role="tooltip"></div>`;
  }

  function bindControls() {
    context.root.querySelectorAll("[data-s7-scroll]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.s7Scroll)?.scrollIntoView({behavior: "smooth", block: "start"})));
    context.root.querySelector("#matrixGroup")?.addEventListener("change", event => { ui.group = event.target.value; load(); });
    context.root.querySelector("#s7HteiMode")?.addEventListener("change", event => { ui.hteiMode = event.target.value; load(); });
    context.root.querySelector("#regionSelect")?.addEventListener("change", event => { ui.region = event.target.value; load(); });
    context.root.querySelector("#incomeSelect")?.addEventListener("change", event => { ui.income = event.target.value; load(); });
    context.root.querySelector("#matrixSearch")?.addEventListener("input", event => { ui.query = event.target.value; clearTimeout(debounceTimer); debounceTimer = setTimeout(load, 300); });
    context.root.querySelector("[data-s7-reset]")?.addEventListener("click", () => { Object.assign(ui,{group:"G20",region:"all",income:"all",query:"",hteiMode:"proxy_extended",selected:[...DEFAULT_SELECTED],scatterX:"HTEI",scatterY:"GII",trendIndex:"HTEI",trendMetric:"percentile",matrixMetric:"percentile",sortCode:"HTEI",sortDir:"desc",topN:"",page:1}); load(); });
    context.root.querySelector("#s7AddCountry")?.addEventListener("change", event => { const iso = event.target.value; if (!iso) return; if (ui.selected.length >= MAX_SELECTED) { showToast(tr("Можно выбрать не более восьми стран","Up to eight countries can be selected")); return; } ui.selected.push(iso); load(); });
    context.root.querySelectorAll("[data-s7-remove-country]").forEach(button => button.addEventListener("click", () => { if (ui.selected.length <= 1) { showToast(tr("Оставьте хотя бы одну страну","Keep at least one country")); return; } ui.selected = ui.selected.filter(iso => iso !== button.dataset.s7RemoveCountry); load(); }));
    context.root.querySelector("#s7ScatterX")?.addEventListener("change", event => { ui.scatterX = event.target.value; if (ui.scatterX === ui.scatterY) ui.scatterY = payload.indices.find(index => index.code !== ui.scatterX)?.code || "GII"; load(); });
    context.root.querySelector("#s7ScatterY")?.addEventListener("change", event => { ui.scatterY = event.target.value; if (ui.scatterY === ui.scatterX) ui.scatterX = payload.indices.find(index => index.code !== ui.scatterY)?.code || "HTEI"; load(); });
    context.root.querySelectorAll("[data-s7-corr-x]").forEach(button => button.addEventListener("click", () => { if (button.dataset.s7CorrX === button.dataset.s7CorrY) return; ui.scatterX = button.dataset.s7CorrX; ui.scatterY = button.dataset.s7CorrY; load().then?.(() => document.getElementById("s7Relationships")?.scrollIntoView({block:"start"})); }));
    context.root.querySelector("#s7TrendIndex")?.addEventListener("change", event => { ui.trendIndex = event.target.value; load(); });
    context.root.querySelectorAll("[data-s7-trend-metric]").forEach(button => button.addEventListener("click", () => { ui.trendMetric = button.dataset.s7TrendMetric; renderPage(); }));
    context.root.querySelector("#matrixMetric")?.addEventListener("change", event => { ui.matrixMetric = event.target.value; ui.sortDir = ui.matrixMetric === "rank" || ui.matrixMetric === "freshness" ? "asc" : "desc"; ui.page = 1; syncLegacyState(); renderPage(); });
    context.root.querySelector("#matrixTopN")?.addEventListener("change", event => { ui.topN = event.target.value; ui.page = 1; syncLegacyState(); renderPage(); });
    context.root.querySelectorAll("[data-s7-sort]").forEach(button => button.addEventListener("click", () => { const code = button.dataset.s7Sort; if (code === "PROFILE") { ui.sortCode = payload.indices[0].code; ui.matrixMetric = "percentile"; ui.sortDir = "desc"; } else if (ui.sortCode === code) ui.sortDir = ui.sortDir === "asc" ? "desc" : "asc"; else { ui.sortCode = code; ui.sortDir = ui.matrixMetric === "rank" || ui.matrixMetric === "freshness" ? "asc" : "desc"; } ui.page = 1; syncLegacyState(); renderPage(); }));
    context.root.querySelectorAll("[data-s7-page]").forEach(button => button.addEventListener("click", () => { ui.page += button.dataset.s7Page === "next" ? 1 : -1; renderPage(); document.getElementById("s7Matrix")?.scrollIntoView({block:"start"}); }));
    context.root.querySelectorAll("[data-s7-country-link]").forEach(button => button.addEventListener("click", () => context.goCountry(button.dataset.s7CountryLink)));
    context.root.querySelectorAll("[data-s7-provenance]").forEach(button => button.addEventListener("click", () => button.dataset.s7Provenance && context.openProvenance(button.dataset.s7Provenance)));
    context.root.querySelectorAll("[data-value-id]").forEach(point => {
      const open = () => point.dataset.valueId && context.openProvenance(point.dataset.valueId, point);
      point.addEventListener("click", open);
      point.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    });
  }

  function bindCharts() {
    const tooltip = context.root.querySelector("#s7Tooltip");
    if (!tooltip) return;
    const show = (element, event) => {
      tooltip.innerHTML = esc(element.dataset.s7Tip || "").replaceAll("\n", "<br>");
      tooltip.classList.add("visible");
      const rect = element.getBoundingClientRect();
      const x = event?.clientX || rect.left + rect.width / 2;
      const y = event?.clientY || rect.top;
      const left = Math.min(window.innerWidth - tooltip.offsetWidth - 12, Math.max(12, x + 12));
      const top = Math.min(window.innerHeight - tooltip.offsetHeight - 12, Math.max(12, y + 12));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };
    context.root.querySelectorAll("[data-s7-tip]").forEach(element => {
      element.addEventListener("mousemove", event => show(element,event));
      element.addEventListener("mouseenter", event => show(element,event));
      element.addEventListener("focus", event => show(element,event));
      element.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
      element.addEventListener("blur", () => tooltip.classList.remove("visible"));
    });
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  window.GIRComparison = {
    version: "stage7-comparison-v1",
    render(ctx) {
      initialize(ctx);
      context = ctx;
      load();
    },
  };
})();
