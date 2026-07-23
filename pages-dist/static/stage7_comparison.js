/* GIR T21 — portfolio-wide country comparison workspace. */
(() => {
  "use strict";

  const MAX_SELECTED = 8;
  const MIN_SELECTED = 2;
  const DEFAULT_SELECTED = ["RUS", "CHN", "USA", "DEU", "KOR", "IND"];
  const COUNTRY_COLORS = ["#34a39a", "#597ee8", "#d59a47", "#d26070", "#8f6bd2", "#5ca562", "#c95caa", "#7d91aa"];
  let context = null;
  let payload = null;
  let requestSerial = 0;
  let initialized = false;
  let searchTimer = null;

  const ui = {
    tab: "overview",
    group: "G20",
    region: "all",
    income: "all",
    selected: [...DEFAULT_SELECTED],
    anchor: "",
    theme: "all",
    hteiMode: "proxy_extended",
    matrixTheme: "all",
    matrixStatus: "all",
    matrixMode: "percentile",
    matrixQuery: "",
    fieldIndex: "HTEI",
    scatterX: "HTEI",
    scatterY: "GII",
    correlationTheme: "core",
    trendIndex: "HDI",
    trendMetric: "percentile",
    expandedGroups: new Set(["core", "education", "governance", "digital"]),
  };

  const lang = () => context?.lang === "en" ? "en" : "ru";
  const tr = (ru, en) => lang() === "ru" ? ru : en;
  const esc = (value) => context?.escapeHtml
    ? context.escapeHtml(value ?? "")
    : String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const fmt = (value, digits = 1) => value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : context?.fmt ? context.fmt(Number(value), digits) : Number(value).toFixed(digits);
  const intFmt = (value) => value == null || value === "" ? "—" : context?.intFmt ? context.intFmt(value) : new Intl.NumberFormat(lang() === "ru" ? "ru-RU" : "en-US").format(Number(value));
  const pctFmt = (value) => value == null ? "—" : `${fmt(value, 0)}${lang() === "ru" ? "-й" : "th"}`;
  const countryName = (country) => lang() === "ru" ? (country?.name_ru || country?.name_en || country?.iso3) : (country?.name_en || country?.name_ru || country?.iso3);
  const moduleName = (module) => lang() === "ru" ? module?.name_ru : module?.name_en;
  const groupName = (group) => lang() === "ru" ? group?.label_ru : group?.label_en;
  const moduleByCode = (code) => payload?.modules?.find((item) => item.code === code) || {code, short_name: code, name_ru: code, name_en: code, group: "core", unit_ru: "", unit_en: ""};
  const groupByKey = (key) => payload?.portfolio_groups?.find((item) => item.key === key) || {key, label_ru: key, label_en: key, codes: []};
  const selectedProfile = (iso3) => payload?.selected_countries?.find((item) => item.iso3 === iso3);
  const colorFor = (iso3) => COUNTRY_COLORS[Math.max(0, ui.selected.indexOf(iso3)) % COUNTRY_COLORS.length];
  const scoreUnit = (module) => lang() === "ru" ? module?.unit_ru : module?.unit_en;

  function readUrlState() {
    try {
      const params = new URL(location.href).searchParams;
      ui.tab = params.get("compare_tab") || ui.tab;
      ui.group = (params.get("compare_group") || context?.state?.matrixGroup || ui.group).toUpperCase();
      ui.region = params.get("compare_region") || context?.state?.matrixRegion || ui.region;
      ui.income = params.get("compare_income") || context?.state?.matrixIncome || ui.income;
      ui.theme = params.get("compare_theme") || ui.theme;
      ui.matrixTheme = params.get("compare_matrix_theme") || ui.matrixTheme;
      ui.fieldIndex = params.get("compare_field") || ui.fieldIndex;
      ui.scatterX = params.get("compare_x") || ui.scatterX;
      ui.scatterY = params.get("compare_y") || ui.scatterY;
      ui.correlationTheme = params.get("compare_corr_theme") || ui.correlationTheme;
      ui.trendIndex = params.get("compare_trend") || ui.trendIndex;
      ui.hteiMode = params.get("htei_mode") || context?.state?.hteiMode || ui.hteiMode;
      ui.anchor = (params.get("compare_anchor") || context?.state?.country || "").toUpperCase();
      const selected = (params.get("compare_selected") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
      if (selected.length >= MIN_SELECTED) ui.selected = [...new Set(selected)].slice(0, MAX_SELECTED);
      if (ui.anchor && !ui.selected.includes(ui.anchor)) ui.selected = [ui.anchor, ...ui.selected].slice(0, MAX_SELECTED);
    } catch (_) {}
  }

  function syncUrlState() {
    try {
      const url = new URL(location.href);
      const values = {
        compare_tab: ui.tab,
        compare_group: ui.group,
        compare_region: ui.region,
        compare_income: ui.income,
        compare_theme: ui.theme,
        compare_matrix_theme: ui.matrixTheme,
        compare_field: ui.fieldIndex,
        compare_x: ui.scatterX,
        compare_y: ui.scatterY,
        compare_corr_theme: ui.correlationTheme,
        compare_trend: ui.trendIndex,
        compare_selected: ui.selected.join(","),
        compare_anchor: ui.anchor,
        htei_mode: ui.hteiMode,
      };
      Object.entries(values).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (_) {}
  }

  function initialize(ctx) {
    context = ctx;
    if (initialized) return;
    initialized = true;
    readUrlState();
  }

  function queryParams() {
    return new URLSearchParams({
      year: String(context?.year || 2026),
      group: ui.group,
      region: ui.region || "all",
      income_group: ui.income || "all",
      selected: ui.selected.join(","),
      scatter_x: ui.scatterX,
      scatter_y: ui.scatterY,
      trend_index: ui.trendIndex,
      theme: ui.correlationTheme,
      field_index: ui.fieldIndex,
      htei_mode: ui.hteiMode,
    });
  }

  function renderLoading() {
    context.root.innerHTML = `<section class="s21-state"><div class="s21-loader" aria-hidden="true"></div><h1>${tr("Собираем межстрановое сравнение", "Building the country comparison")}</h1><p>${tr("Гармонизируем 44 модуля, исходные шкалы и фактические годы.", "Aligning 44 modules, original scales and actual data years.")}</p></section>`;
  }

  function renderError(error) {
    context.root.innerHTML = `<section class="s21-state s21-error"><span class="s21-state-code">!</span><h1>${tr("Сравнение временно недоступно", "Comparison is temporarily unavailable")}</h1><p>${esc(error?.message || error || tr("Не удалось получить данные.", "Could not load data."))}</p><button class="btn primary" type="button" data-s21-action="retry">${tr("Повторить", "Retry")}</button></section>`;
    context.root.querySelector('[data-s21-action="retry"]')?.addEventListener("click", () => load(true));
  }

  async function load(force = false) {
    const serial = ++requestSerial;
    if (!payload || force) renderLoading();
    syncUrlState();
    try {
      const response = await fetch(`/api/comparison/workspace?${queryParams().toString()}`, {headers: {Accept: "application/json"}});
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.detail || `HTTP ${response.status}`);
      if (serial !== requestSerial) return;
      payload = body;
      ui.selected = (payload.selected_codes || ui.selected).slice(0, MAX_SELECTED);
      if (!ui.selected.includes(ui.anchor)) ui.anchor = ui.selected[0] || "";
      renderPage();
    } catch (error) {
      if (serial === requestSerial) renderError(error);
    }
  }

  function statusLabel(status) {
    return ({
      available: tr("Есть результат", "Available"),
      source_gated: tr("Ожидает источник", "Source gated"),
      no_country_data: tr("Нет наблюдения", "No country observation"),
    })[status] || status;
  }

  function freshnessLabel(status) {
    return ({current: tr("Актуально", "Current"), recent: tr("Умеренный лаг", "Moderate lag"), stale: tr("Требует обновления", "Needs update"), unknown: tr("Год не определён", "Year unknown")})[status] || status;
  }

  function percentileClass(value) {
    if (value == null) return "s21-p-na";
    const band = Math.max(0, Math.min(10, Math.floor(Number(value) / 10)));
    return `s21-p${band}`;
  }

  function moduleOptions({numericOnly = false, comparableOnly = false} = {}) {
    return (payload?.modules || []).filter((module) => (!numericOnly || module.numeric_release) && (!comparableOnly || module.direction !== "contextual"));
  }

  function selectOptions(items, current, valueKey, labelFn) {
    return items.map((item) => {
      const value = typeof item === "string" ? item : item[valueKey];
      return `<option value="${esc(value)}" ${String(value) === String(current) ? "selected" : ""}>${esc(labelFn(item))}</option>`;
    }).join("");
  }

  function selectedChips() {
    return ui.selected.map((iso3) => {
      const country = selectedProfile(iso3) || payload?.countries?.find((item) => item.iso3 === iso3) || {iso3};
      return `<span class="s21-country-chip" style="--country-color:${colorFor(iso3)}"><span class="s21-country-dot" aria-hidden="true"></span><button type="button" data-s21-country="${esc(iso3)}" title="${tr("Открыть профиль", "Open profile")}">${esc(country.flag || "")} ${esc(countryName(country))}</button>${ui.selected.length > MIN_SELECTED ? `<button class="s21-chip-remove" type="button" data-s21-remove="${esc(iso3)}" aria-label="${tr("Убрать страну", "Remove country")}: ${esc(countryName(country))}">×</button>` : ""}</span>`;
    }).join("");
  }

  function hero() {
    const summary = payload.summary;
    const group = payload.group;
    const groupText = lang() === "ru" ? group.label_ru : group.label_en;
    const unselected = payload.countries.filter((country) => !ui.selected.includes(country.iso3));
    const availablePct = summary.total_cells ? summary.available_cells / summary.total_cells * 100 : 0;
    return `<section class="s21-hero">
      <div class="s21-hero-main">
        <div>
          <p class="s21-kicker">${tr("Межстрановая аналитика", "Cross-country analytics")}</p>
          <h1>${tr("Сравнение стран по всему портфелю GIR", "Compare countries across the full GIR portfolio")}</h1>
          <p class="s21-lead">${tr("44 индекса и рейтинга объединены в одну исследовательскую среду без смешения исходных шкал. Процентили служат навигацией, а точные значения, годы и методические статусы сохраняются в каждой ячейке.", "Forty-four indices and rankings are brought into one research workspace without mixing original scales. Percentiles guide comparison while exact values, years and methodological status remain available in every cell.")}</p>
        </div>
        <div class="s21-selected" aria-label="${tr("Выбранные страны", "Selected countries")}">${selectedChips()}</div>
        <div class="s21-command-row">
          <label><span>${tr("Добавить страну", "Add country")}</span><select id="s21-add-country" ${ui.selected.length >= MAX_SELECTED ? "disabled" : ""}><option value="">${tr("Выберите…", "Choose…")}</option>${selectOptions(unselected, "", "iso3", (item) => `${item.flag || ""} ${countryName(item)} · ${item.iso3}`)}</select></label>
          <label><span>${tr("Международная вселенная", "Comparison universe")}</span><select id="s21-group">${selectOptions(payload.groups, ui.group, "code", (item) => `${groupName(item)} · ${item.country_count}`)}</select></label>
          <label><span>${tr("Режим HTEI", "HTEI mode")}</span><select id="s21-htei-mode"><option value="proxy_extended" ${ui.hteiMode === "proxy_extended" ? "selected" : ""}>${tr("Расширенный рейтинг", "Extended ranking")}</option><option value="common_support" ${ui.hteiMode === "common_support" ? "selected" : ""}>${tr("Основной рейтинг", "Common support")}</option><option value="direct_core" ${ui.hteiMode === "direct_core" ? "selected" : ""}>${tr("Прямые данные", "Direct core")}</option></select></label>
        </div>
      </div>
      <aside class="s21-hero-side">
        <div class="s21-hero-context"><span>${tr("Текущая вселенная", "Current universe")}</span><strong>${esc(groupText)}</strong><small>${intFmt(summary.universe_country_count)} ${tr("стран и территорий", "countries and territories")}</small></div>
        <div class="s21-kpi-grid">
          <article><strong>${summary.selected_country_count}</strong><span>${tr("стран в сравнении", "countries selected")}</span></article>
          <article><strong>${summary.module_count}</strong><span>${tr("модуля", "modules")}</span></article>
          <article><strong>${fmt(availablePct, 0)}%</strong><span>${tr("заполненных ячеек", "available cells")}</span></article>
          <article><strong>${summary.comparable_cells}</strong><span>${tr("сопоставимых позиций", "comparable positions")}</span></article>
        </div>
        <div class="s21-method-callout"><strong>${tr("Сопоставление без псевдоиндекса", "Comparison without a pseudo-index")}</strong><p>${tr("Тематические медианы и процентили помогают ориентироваться, но не образуют новый интегральный рейтинг стран.", "Thematic medians and percentiles aid navigation but do not create a new composite country ranking.")}</p></div>
        <div class="s21-hero-actions"><a class="btn" href="/api/comparison/workspace.csv?${queryParams().toString()}&lang=${lang()}" download>${tr("Скачать выборку CSV", "Download CSV")}</a><button class="btn" type="button" data-s21-action="copy-link">${tr("Скопировать ссылку", "Copy link")}</button></div>
      </aside>
    </section>`;
  }

  function tabNav() {
    const tabs = [
      ["overview", tr("Обзор", "Overview")],
      ["matrix", tr("Матрица 44 × страны", "44 × countries matrix")],
      ["relationships", tr("Связи", "Relationships")],
      ["trends", tr("Динамика", "Trends")],
      ["quality", tr("Качество данных", "Data quality")],
    ];
    return `<nav class="s21-tabs" role="tablist" aria-label="${tr("Разделы сравнения", "Comparison sections")}">${tabs.map(([key, label]) => `<button type="button" role="tab" data-s21-tab="${key}" aria-selected="${ui.tab === key}" tabindex="${ui.tab === key ? 0 : -1}" class="${ui.tab === key ? "active" : ""}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function heatCell(value, extra = "") {
    return `<span class="s21-heat ${percentileClass(value)}"><strong>${value == null ? "—" : pctFmt(value)}</strong>${extra}</span>`;
  }

  function overviewGroupTable() {
    const groups = payload.portfolio_groups;
    return `<div class="s21-table-shell" role="region" aria-label="${tr("Тематический профиль выбранных стран", "Thematic profile of selected countries")}" tabindex="0"><table class="s21-theme-table"><caption>${tr("Медианный благоприятный процентиль по тематическому направлению", "Median favourable percentile by theme")}</caption><thead><tr><th>${tr("Направление", "Theme")}</th>${payload.selected_countries.map((country) => `<th><span class="s21-th-country" style="--country-color:${colorFor(country.iso3)}"><i></i>${esc(country.flag || "")} ${esc(country.iso3)}</span></th>`).join("")}</tr></thead><tbody>${groups.map((group) => `<tr><th><strong>${esc(groupName(group))}</strong><small>${group.codes.length} ${tr("мод.", "mod.")}</small></th>${payload.selected_countries.map((country) => { const item = country.group_profiles.find((profile) => profile.key === group.key); return `<td>${heatCell(item?.median_percentile, `<small>${item?.available_count || 0}/${item?.module_count || group.codes.length}</small>`)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function countryCards() {
    return `<div class="s21-country-cards">${payload.selected_countries.map((country) => {
      const strong = country.strongest ? moduleByCode(country.strongest.index_code) : null;
      const weak = country.weakest ? moduleByCode(country.weakest.index_code) : null;
      return `<article class="s21-country-card" style="--country-color:${colorFor(country.iso3)}">
        <header><div><span class="s21-country-card-flag">${esc(country.flag || "")}</span><div><h3>${esc(countryName(country))}</h3><p>${esc(country.region || "")} · ${esc(country.income_group || "")}</p></div></div><button type="button" data-s21-country="${country.iso3}">${tr("Профиль", "Profile")}</button></header>
        <div class="s21-country-score"><strong>${pctFmt(country.median_percentile)}</strong><span>${tr("медианный процентиль", "median percentile")}</span></div>
        <div class="s21-mini-meter"><i style="width:${Math.max(0, Math.min(100, country.median_percentile || 0))}%"></i></div>
        <dl><div><dt>${tr("Доступно", "Available")}</dt><dd>${country.available_count}/44</dd></div><div><dt>${tr("Сильнейшая позиция", "Strongest")}</dt><dd>${strong ? `${esc(strong.short_name)} · ${pctFmt(country.strongest.percentile)}` : "—"}</dd></div><div><dt>${tr("Зона внимания", "Attention")}</dt><dd>${weak ? `${esc(weak.short_name)} · ${pctFmt(country.weakest.percentile)}` : "—"}</dd></div></dl>
      </article>`;
    }).join("")}</div>`;
  }

  function peerMedian(groupKey, anchorIso3) {
    const values = payload.selected_countries.filter((country) => country.iso3 !== anchorIso3).map((country) => country.group_profiles.find((item) => item.key === groupKey)?.median_percentile).filter((value) => value != null).sort((a, b) => a - b);
    if (!values.length) return null;
    const middle = Math.floor(values.length / 2);
    return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  }

  function anchorGaps() {
    const anchor = selectedProfile(ui.anchor) || payload.selected_countries[0];
    if (!anchor) return "";
    const rows = payload.portfolio_groups.map((group) => {
      const current = anchor.group_profiles.find((item) => item.key === group.key)?.median_percentile;
      const peer = peerMedian(group.key, anchor.iso3);
      const gap = current != null && peer != null ? current - peer : null;
      return {group, current, peer, gap};
    }).sort((a, b) => (a.gap ?? -999) - (b.gap ?? -999));
    return `<div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Разрывы", "Gaps")}</p><h2>${tr("Положение относительно выбранных стран", "Position relative to selected peers")}</h2></div><label>${tr("Опорная страна", "Anchor country")}<select id="s21-anchor">${selectOptions(payload.selected_countries, anchor.iso3, "iso3", (item) => `${item.flag || ""} ${countryName(item)}`)}</select></label></div><div class="s21-gap-list">${rows.map(({group, current, peer, gap}) => `<article><div><strong>${esc(groupName(group))}</strong><small>${current == null ? tr("Нет сопоставимой позиции", "No comparable position") : `${pctFmt(current)} · ${tr("медиана peers", "peer median")} ${pctFmt(peer)}`}</small></div><span class="s21-gap-value ${gap == null ? "neutral" : gap >= 0 ? "positive" : "negative"}">${gap == null ? "—" : `${gap > 0 ? "+" : ""}${fmt(gap, 0)} п.п.`}</span><div class="s21-gap-track"><i class="${gap != null && gap < 0 ? "negative" : ""}" style="--gap:${Math.min(100, Math.abs(gap || 0))}%"></i></div></article>`).join("")}</div>`;
  }

  function qsPortfolioComparisonPanel() {
    const q = payload.qs_portfolio;
    if (!q || !Number(q.registered_projects || 0)) return "";
    return `<section class="s21-section s21-qs-portfolio"><div><p class="s21-eyebrow">${tr("Аналитика QS", "QS Intelligence")}</p><h2>${tr("Университетская система как портфель проектов", "University systems as a portfolio of projects")}</h2><p>${tr("Строка QS в матрице относится к выбранному проекту и редакции. Мировой рейтинг университетов (WUR), 55 дисциплин, рейтинг устойчивого развития, региональные и профессиональные рейтинги не усредняются в одну оценку.", "The QS row in the matrix refers to a selected project and edition. WUR, 55 subjects, Sustainability, regional and professional rankings are never averaged into one score.")}</p></div><div class="s21-qs-metrics"><div><strong>${intFmt(q.registered_projects)}</strong><span>${tr("проектов", "projects")}</span></div><div><strong>${intFmt(q.loaded_projects)}</strong><span>${tr("с данными", "with data")}</span></div><div><strong>${intFmt(q.subjects)}</strong><span>${tr("дисциплин", "subjects")}</span></div><div><strong>${intFmt(q.entities)}</strong><span>${tr("университетов", "universities")}</span></div></div><a class="btn" href="#index-QS_ET">${tr("Открыть аналитику QS", "Open QS Intelligence")}</a></section>`;
  }

  function renderOverview() {
    return `<section class="s21-section"><div class="s21-section-head"><div><p class="s21-eyebrow">${tr("Восемь измерений", "Eight dimensions")}</p><h2>${tr("Структурный профиль выбранных стран", "Structural profile of selected countries")}</h2><p>${tr("Цвет и число показывают медианный благоприятный процентиль внутри тематического направления. Рядом указано число доступных модулей.", "Colour and value show the median favourable percentile within each theme. The available module count is shown alongside.")}</p></div></div>${overviewGroupTable()}</section>
      ${qsPortfolioComparisonPanel()}
      <section class="s21-section"><div class="s21-section-head"><div><p class="s21-eyebrow">${tr("Страновые сводки", "Country summaries")}</p><h2>${tr("Сильные стороны, разрывы и полнота профиля", "Strengths, gaps and profile coverage")}</h2></div></div>${countryCards()}</section>
      <section class="s21-section s21-gap-panel">${anchorGaps()}</section>
      <section class="s21-note-grid"><article><strong>${tr("Что сравнивается", "What is compared")}</strong><p>${tr("Исходные оценки сохраняются в собственных шкалах. Для тематического обзора используется только положение страны в международном распределении соответствующего модуля.", "Original scores retain their own scales. The thematic overview uses only the country's position within each module's international distribution.")}</p></article><article><strong>${tr("Чего здесь нет", "What is not here")}</strong><p>${tr("Медианы не образуют нового индекса GIR, не задают нормативный вес тем и не заменяют специализированные страницы рейтингов.", "Medians do not form a new GIR index, assign normative weights to themes or replace specialised ranking workspaces.")}</p></article></section>`;
  }

  function cellContent(cell, module) {
    if (cell.status !== "available") return `<span class="s21-cell-state ${cell.status}">${statusLabel(cell.status)}</span>`;
    const score = `${fmt(cell.score, Math.abs(Number(cell.score)) >= 1000 ? 0 : 1)}${scoreUnit(module) ? ` <small>${esc(scoreUnit(module))}</small>` : ""}`;
    const rank = cell.rank != null ? `${intFmt(cell.rank)} / ${intFmt(cell.universe_count)}` : "—";
    if (ui.matrixMode === "score") return `<strong>${score}</strong><small>${tr("место", "rank")} ${rank} · ${pctFmt(cell.percentile)}</small>`;
    if (ui.matrixMode === "rank") return `<strong>${rank}</strong><small>${score} · ${pctFmt(cell.percentile)}</small>`;
    return `<strong>${pctFmt(cell.percentile)}</strong><small>${score} · ${tr("место", "rank")} ${rank}</small>`;
  }

  function matrixRowsForGroup(group) {
    const needle = ui.matrixQuery.trim().toLowerCase();
    return payload.matrix.rows.filter((row) => row.module.group === group.key).filter((row) => ui.matrixStatus === "all" || payload.selected_codes.some((iso3) => row.cells[iso3]?.status === ui.matrixStatus)).filter((row) => !needle || `${row.module.code} ${row.module.name_ru} ${row.module.name_en} ${row.module.authority}`.toLowerCase().includes(needle));
  }

  function renderMatrix() {
    const groups = payload.portfolio_groups.filter((group) => ui.matrixTheme === "all" || group.key === ui.matrixTheme);
    const totalVisible = groups.reduce((sum, group) => sum + matrixRowsForGroup(group).length, 0);
    return `<section class="s21-section"><div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Полный портфель", "Full portfolio")}</p><h2>${tr("Матрица индексов и стран", "Indices × countries matrix")}</h2><p>${tr("Каждая ячейка сохраняет исходную оценку, международное место, процентиль и фактический год. Цвет кодирует только благоприятный процентиль.", "Each cell retains its original score, international rank, percentile and actual year. Colour encodes only the favourable percentile.")}</p></div><span class="s21-result-count">${totalVisible} / 44</span></div>
      <div class="s21-filterbar">
        <label>${tr("Тема", "Theme")}<select id="s21-matrix-theme"><option value="all">${tr("Все восемь направлений", "All eight themes")}</option>${selectOptions(payload.portfolio_groups, ui.matrixTheme, "key", groupName)}</select></label>
        <label>${tr("Состояние", "Status")}<select id="s21-matrix-status"><option value="all">${tr("Все состояния", "All statuses")}</option><option value="available" ${ui.matrixStatus === "available" ? "selected" : ""}>${statusLabel("available")}</option><option value="source_gated" ${ui.matrixStatus === "source_gated" ? "selected" : ""}>${statusLabel("source_gated")}</option><option value="no_country_data" ${ui.matrixStatus === "no_country_data" ? "selected" : ""}>${statusLabel("no_country_data")}</option></select></label>
        <label>${tr("Основное значение", "Primary value")}<select id="s21-matrix-mode"><option value="percentile" ${ui.matrixMode === "percentile" ? "selected" : ""}>${tr("Процентиль", "Percentile")}</option><option value="score" ${ui.matrixMode === "score" ? "selected" : ""}>${tr("Оценка", "Score")}</option><option value="rank" ${ui.matrixMode === "rank" ? "selected" : ""}>${tr("Место", "Rank")}</option></select></label>
        <label class="s21-grow">${tr("Поиск модуля", "Search modules")}<input id="s21-matrix-search" value="${esc(ui.matrixQuery)}" placeholder="${tr("Например, V-Dem или World Bank", "For example, V-Dem or World Bank")}"></label>
      </div>
      <div class="s21-matrix-groups">${groups.map((group) => {
        const rows = matrixRowsForGroup(group);
        if (!rows.length) return "";
        const open = ui.expandedGroups.has(group.key) || ui.matrixTheme !== "all";
        return `<section class="s21-matrix-group ${open ? "open" : ""}"><button class="s21-matrix-group-head" type="button" data-s21-toggle-group="${group.key}" aria-expanded="${open}"><span><strong>${esc(groupName(group))}</strong><small>${rows.length} ${tr("модулей", "modules")}</small></span><i aria-hidden="true"></i></button><div class="s21-matrix-scroll" ${open ? "" : "hidden"} role="region" aria-label="${esc(groupName(group))}" tabindex="0"><table><thead><tr><th>${tr("Индекс / рейтинг", "Index / ranking")}</th>${payload.selected_countries.map((country) => `<th><button type="button" data-s21-country="${country.iso3}" style="--country-color:${colorFor(country.iso3)}"><i></i>${esc(country.flag || "")} ${esc(country.iso3)}</button></th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr><th><button type="button" data-s21-module="${row.module.code}"><strong>${esc(row.module.short_name)}</strong><span>${esc(moduleName(row.module))}</span><small>${esc(row.module.authority)} · ${row.universe_summary?.available_count || 0} ${tr("стран", "countries")}</small></button></th>${payload.selected_codes.map((iso3) => { const cell = row.cells[iso3]; const body = cellContent(cell, row.module); const title = cell.status === "available" ? `${moduleName(row.module)} · ${countryName(selectedProfile(iso3))}: ${fmt(cell.score, 2)}, ${tr("место", "rank")} ${cell.rank ?? "—"}, ${tr("год", "year")} ${cell.source_data_year ?? cell.value_year ?? "—"}` : `${moduleName(row.module)} · ${countryName(selectedProfile(iso3))}: ${statusLabel(cell.status)}`; return `<td><${cell.value_id ? "button" : "div"} class="s21-matrix-cell ${cell.status} ${percentileClass(cell.percentile)}" ${cell.value_id ? `type="button" data-s21-provenance="${esc(cell.value_id)}"` : ""} title="${esc(title)}">${body}<em>${cell.status === "available" ? (cell.source_data_year || cell.value_year || "—") : ""}</em></${cell.value_id ? "button" : "div"}></td>`; }).join("")}</tr>`).join("")}</tbody></table></div></section>`;
      }).join("") || `<div class="s21-empty"><strong>${tr("Ничего не найдено", "No modules found")}</strong><p>${tr("Измените поисковый запрос или фильтры.", "Change the search query or filters.")}</p></div>`}</div>
      <div class="s21-legend"><span>${tr("Благоприятный процентиль", "Favourable percentile")}</span><i class="s21-p1"></i><small>0</small><i class="s21-p3"></i><small>25</small><i class="s21-p5"></i><small>50</small><i class="s21-p7"></i><small>75</small><i class="s21-p10"></i><small>100</small><b>${tr("Контекстные показатели не получают нормативный цвет.", "Contextual measures receive no normative colour.")}</b></div></section>`;
  }

  function svgText(x, y, text, attrs = "") { return `<text x="${x}" y="${y}" ${attrs}>${esc(text)}</text>`; }
  function hashY(code, height) { let hash = 0; for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0; return 34 + (hash % Math.max(1, height - 68)); }

  function fieldPlot() {
    const data = payload.field;
    const width = 920, height = 260, left = 54, right = 28, plotW = width - left - right;
    const x = (value) => left + (Number(value) / 100) * plotW;
    const medianX = data.median_percentile == null ? null : x(data.median_percentile);
    const circles = data.points.map((point) => {
      const px = x(point.cell.percentile || 0), py = hashY(point.iso3, height);
      const selected = point.selected;
      return `<g tabindex="0" role="img" aria-label="${esc(`${countryName(point)}: ${pctFmt(point.cell.percentile)}, ${fmt(point.cell.score, 2)}`)}"><circle cx="${px}" cy="${py}" r="${selected ? 7 : 3.5}" class="${selected ? "selected" : "context"}" style="--point-color:${selected ? colorFor(point.iso3) : "var(--muted)"}"><title>${esc(`${countryName(point)} · ${pctFmt(point.cell.percentile)} · ${fmt(point.cell.score, 2)}`)}</title></circle>${selected ? svgText(px + 9, py + 4, point.iso3, 'class="s21-svg-label"') : ""}</g>`;
    }).join("");
    return `<svg class="s21-field-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="s21-field-title s21-field-desc"><title id="s21-field-title">${esc(`${moduleName(moduleByCode(data.index_code))}: ${tr("международное распределение", "international distribution")}`)}</title><desc id="s21-field-desc">${tr("Горизонтальная ось показывает благоприятный международный процентиль. Вертикальное смещение точек используется только для устранения наложений.", "The horizontal axis shows the favourable international percentile. Vertical jitter is used only to reduce overlap.")}</desc><line x1="${left}" x2="${width-right}" y1="${height-24}" y2="${height-24}" class="s21-axis"/>${[0,25,50,75,100].map((tick) => `<line x1="${x(tick)}" x2="${x(tick)}" y1="20" y2="${height-24}" class="s21-gridline"/>${svgText(x(tick), height-7, tick, 'text-anchor="middle" class="s21-svg-axis-label"')}`).join("")}${medianX == null ? "" : `<line x1="${medianX}" x2="${medianX}" y1="18" y2="${height-24}" class="s21-median-line"/>${svgText(medianX+5, 19, tr("медиана", "median"), 'class="s21-svg-note"')}`}${circles}</svg>`;
  }

  function scatterPlot() {
    const data = payload.scatter;
    const width = 920, height = 430, left = 58, top = 30, right = 28, bottom = 54, plotW = width-left-right, plotH = height-top-bottom;
    const x = (value) => left + Number(value)/100*plotW;
    const y = (value) => top + (100-Number(value))/100*plotH;
    const points = data.points.map((point) => `<g tabindex="0" role="img" aria-label="${esc(`${countryName(point)}: ${point.x_cell.index_code} ${fmt(point.x,0)}, ${point.y_cell.index_code} ${fmt(point.y,0)}`)}"><circle cx="${x(point.x)}" cy="${y(point.y)}" r="${point.selected ? 7 : 4}" class="${point.selected ? "selected" : "context"}" style="--point-color:${point.selected ? colorFor(point.iso3) : "var(--muted)"}"><title>${esc(`${countryName(point)} · ${fmt(point.x,1)} · ${fmt(point.y,1)}`)}</title></circle>${point.selected ? svgText(x(point.x)+9, y(point.y)+4, point.iso3, 'class="s21-svg-label"') : ""}</g>`).join("");
    const xMedian = data.median_x == null ? 50 : data.median_x;
    const yMedian = data.median_y == null ? 50 : data.median_y;
    return `<svg class="s21-scatter-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="s21-scatter-title s21-scatter-desc"><title id="s21-scatter-title">${esc(`${moduleByCode(data.x_index).short_name} × ${moduleByCode(data.y_index).short_name}`)}</title><desc id="s21-scatter-desc">${tr("Обе оси показывают благоприятные международные процентили. Выбранные страны подписаны.", "Both axes show favourable international percentiles. Selected countries are labelled.")}</desc>${[0,25,50,75,100].map((tick) => `<line x1="${x(tick)}" x2="${x(tick)}" y1="${top}" y2="${height-bottom}" class="s21-gridline"/><line x1="${left}" x2="${width-right}" y1="${y(tick)}" y2="${y(tick)}" class="s21-gridline"/>${svgText(x(tick), height-28, tick, 'text-anchor="middle" class="s21-svg-axis-label"')}${svgText(left-10, y(tick)+4, tick, 'text-anchor="end" class="s21-svg-axis-label"')}`).join("")}<line x1="${x(xMedian)}" x2="${x(xMedian)}" y1="${top}" y2="${height-bottom}" class="s21-median-line"/><line x1="${left}" x2="${width-right}" y1="${y(yMedian)}" y2="${y(yMedian)}" class="s21-median-line"/>${points}${svgText(left+plotW/2, height-5, moduleByCode(data.x_index).short_name, 'text-anchor="middle" class="s21-svg-axis-title"')}<text transform="translate(15 ${top+plotH/2}) rotate(-90)" text-anchor="middle" class="s21-svg-axis-title">${esc(moduleByCode(data.y_index).short_name)}</text></svg>`;
  }

  function correlationMatrix() {
    const data = payload.correlations;
    const codes = data.codes || [];
    const map = new Map((data.cells || []).map((cell) => [`${cell.row_code}|${cell.column_code}`, cell]));
    if (!codes.length) return `<div class="s21-empty"><strong>${tr("Нет сопоставимых модулей", "No comparable modules")}</strong></div>`;
    return `<div class="s21-corr-shell" role="region" aria-label="${tr("Матрица корреляций", "Correlation matrix")}" tabindex="0"><table><thead><tr><th></th>${codes.map((code) => `<th>${esc(moduleByCode(code).short_name)}</th>`).join("")}</tr></thead><tbody>${codes.map((rowCode) => `<tr><th>${esc(moduleByCode(rowCode).short_name)}</th>${codes.map((colCode) => { const cell = map.get(`${rowCode}|${colCode}`); const rho = cell?.rho; const strength = rho == null ? 0 : Math.abs(rho); return `<td><span class="s21-corr-cell ${rho == null ? "withheld" : rho >= 0 ? "positive" : "negative"}" style="--strength:${strength}"><strong>${rho == null ? "—" : fmt(rho, 2)}</strong><small>n=${cell?.n || 0}</small><title>${esc(`${moduleByCode(rowCode).short_name} × ${moduleByCode(colCode).short_name}: ${rho == null ? tr("не публикуется", "withheld") : fmt(rho,3)}, n=${cell?.n || 0}`)}</title></span></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function fieldLeaders() {
    const selectedIso = new Set(ui.selected);
    const rows = [...payload.field.points].sort((a,b) => (b.cell.percentile ?? -1) - (a.cell.percentile ?? -1));
    const display = [...rows.slice(0, 8), ...rows.filter((item) => selectedIso.has(item.iso3) && !rows.slice(0,8).some((top) => top.iso3 === item.iso3))];
    return `<div class="s21-rank-list">${display.map((item, index) => `<article class="${item.selected ? "selected" : ""}" style="--country-color:${item.selected ? colorFor(item.iso3) : "var(--muted)"}"><span>${index < 8 ? index+1 : "•"}</span><div><strong>${esc(item.iso3)} · ${esc(countryName(item))}</strong><small>${fmt(item.cell.score, 2)} ${esc(scoreUnit(moduleByCode(payload.field.index_code)) || "")} · ${tr("место", "rank")} ${item.cell.rank ?? "—"}/${item.cell.universe_count ?? "—"}</small></div><b>${pctFmt(item.cell.percentile)}</b></article>`).join("")}</div>`;
  }

  function renderRelationships() {
    const numeric = moduleOptions({numericOnly: true});
    const comparable = moduleOptions({numericOnly: true, comparableOnly: true});
    return `<section class="s21-section"><div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Международное поле", "International field")}</p><h2>${tr("Распределение одного показателя", "Distribution of a single measure")}</h2><p>${tr("Вертикальное положение точек не имеет содержательного значения и служит только для устранения наложений.", "Vertical point position carries no substantive meaning and is used only to reduce overlap.")}</p></div><label>${tr("Модуль", "Module")}<select id="s21-field-index">${selectOptions(numeric, ui.fieldIndex, "code", (item) => `${item.short_name} · ${moduleName(item)}`)}</select></label></div><div class="s21-two-col"><article class="s21-chart-card">${fieldPlot()}</article><article class="s21-list-card"><header><strong>${esc(moduleName(moduleByCode(payload.field.index_code)))}</strong><span>${payload.field.n} ${tr("стран", "countries")}</span></header>${fieldLeaders()}</article></div></section>
      <section class="s21-section"><div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Взаимосвязи", "Relationships")}</p><h2>${tr("Попарное сопоставление международных позиций", "Pairwise comparison of international positions")}</h2></div><div class="s21-inline-controls"><label>X<select id="s21-scatter-x">${selectOptions(comparable, ui.scatterX, "code", (item) => item.short_name)}</select></label><label>Y<select id="s21-scatter-y">${selectOptions(comparable.filter((item) => item.code !== ui.scatterX), ui.scatterY, "code", (item) => item.short_name)}</select></label></div></div><div class="s21-two-col s21-scatter-layout"><article class="s21-chart-card">${scatterPlot()}</article><article class="s21-stat-card"><span>Spearman ρ</span><strong>${payload.scatter.correlation == null ? "—" : fmt(payload.scatter.correlation, 2)}</strong><p>${payload.scatter.n} ${tr("совпадающих стран", "countries in common")}</p><dl><div><dt>${tr("Высоко по обеим осям", "High on both")}</dt><dd>${payload.scatter.quadrants?.high_high || 0}</dd></div><div><dt>${moduleByCode(payload.scatter.x_index).short_name} ↑ / ${moduleByCode(payload.scatter.y_index).short_name} ↓</dt><dd>${payload.scatter.quadrants?.high_low || 0}</dd></div><div><dt>${moduleByCode(payload.scatter.x_index).short_name} ↓ / ${moduleByCode(payload.scatter.y_index).short_name} ↑</dt><dd>${payload.scatter.quadrants?.low_high || 0}</dd></div></dl><small>${tr("Корреляция описывает совместное положение, но не причинную связь.", "Correlation describes co-positioning, not causality.")}</small></article></div></section>
      <section class="s21-section"><div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Структура портфеля", "Portfolio structure")}</p><h2>${tr("Корреляции внутри тематического направления", "Correlations within a theme")}</h2><p>${tr("Публикуются только коэффициенты с не менее чем 15 совместными наблюдениями.", "Coefficients are published only when at least 15 paired observations are available.")}</p></div><label>${tr("Направление", "Theme")}<select id="s21-correlation-theme">${selectOptions(payload.portfolio_groups, ui.correlationTheme, "key", groupName)}</select></label></div>${correlationMatrix()}</section>`;
  }

  function lineChart() {
    const data = payload.trend;
    const series = (data.series || []).filter((item) => item.points?.length);
    if (!series.length) return `<div class="s21-empty"><strong>${tr("Сопоставимого временного ряда нет", "No comparable time series")}</strong><p>${tr("Выберите другой модуль или откройте его методологическую страницу.", "Choose another module or open its methodology workspace.")}</p></div>`;
    const values = series.flatMap((item) => item.points.map((point) => ui.trendMetric === "score" ? point.score : point.percentile).filter((value) => value != null));
    const years = series.flatMap((item) => item.points.map((point) => point.year));
    const minYear = Math.min(...years), maxYear = Math.max(...years), minValue = ui.trendMetric === "percentile" ? 0 : Math.min(...values), maxValue = ui.trendMetric === "percentile" ? 100 : Math.max(...values);
    const width = 980, height = 450, left = 62, top = 28, right = 34, bottom = 52, plotW = width-left-right, plotH = height-top-bottom;
    const x = (year) => left + (maxYear === minYear ? 0.5 : (year-minYear)/(maxYear-minYear))*plotW;
    const y = (value) => top + (maxValue === minValue ? 0.5 : (maxValue-value)/(maxValue-minValue))*plotH;
    const lines = series.map((item) => {
      const usable = item.points.filter((point) => (ui.trendMetric === "score" ? point.score : point.percentile) != null);
      const d = usable.map((point, index) => `${index ? "L" : "M"}${x(point.year).toFixed(1)},${y(ui.trendMetric === "score" ? point.score : point.percentile).toFixed(1)}`).join(" ");
      const colour = colorFor(item.iso3);
      return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="2.6" vector-effect="non-scaling-stroke"/><g>${usable.map((point) => `<circle cx="${x(point.year)}" cy="${y(ui.trendMetric === "score" ? point.score : point.percentile)}" r="3.7" fill="${colour}"><title>${esc(`${countryName(item)} · ${point.year}: ${fmt(ui.trendMetric === "score" ? point.score : point.percentile,2)}`)}</title></circle>`).join("")}</g>`;
    }).join("");
    const yTicks = [0,.25,.5,.75,1].map((ratio) => minValue+(maxValue-minValue)*ratio);
    const xTicks = [...new Set([minYear, Math.round(minYear+(maxYear-minYear)*.25), Math.round(minYear+(maxYear-minYear)*.5), Math.round(minYear+(maxYear-minYear)*.75), maxYear])];
    return `<svg class="s21-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="s21-trend-title s21-trend-desc"><title id="s21-trend-title">${esc(moduleName(moduleByCode(data.index_code)))}</title><desc id="s21-trend-desc">${tr("Временная динамика выбранных стран.", "Time trend for selected countries.")}</desc>${yTicks.map((tick) => `<line x1="${left}" x2="${width-right}" y1="${y(tick)}" y2="${y(tick)}" class="s21-gridline"/>${svgText(left-10,y(tick)+4,fmt(tick,ui.trendMetric === "score" ? 1 : 0),'text-anchor="end" class="s21-svg-axis-label"')}`).join("")}${xTicks.map((tick) => `<line x1="${x(tick)}" x2="${x(tick)}" y1="${top}" y2="${height-bottom}" class="s21-gridline"/>${svgText(x(tick),height-23,tick,'text-anchor="middle" class="s21-svg-axis-label"')}`).join("")}${lines}</svg>`;
  }

  function trendSummary() {
    const series = (payload.trend.series || []).filter((item) => item.points?.length);
    return `<div class="s21-trend-summary">${series.map((item) => {
      const points = item.points.filter((point) => (ui.trendMetric === "score" ? point.score : point.percentile) != null);
      const first = points[0], last = points[points.length-1];
      const start = first ? (ui.trendMetric === "score" ? first.score : first.percentile) : null;
      const end = last ? (ui.trendMetric === "score" ? last.score : last.percentile) : null;
      const delta = start != null && end != null ? end-start : null;
      return `<article style="--country-color:${colorFor(item.iso3)}"><i></i><div><strong>${esc(item.iso3)} · ${esc(countryName(item))}</strong><small>${first?.year || "—"} → ${last?.year || "—"}</small></div><b class="${delta == null ? "" : delta >= 0 ? "positive" : "negative"}">${delta == null ? "—" : `${delta > 0 ? "+" : ""}${fmt(delta,1)}`}</b></article>`;
    }).join("")}</div>`;
  }

  function renderTrends() {
    const numeric = moduleOptions({numericOnly: true});
    return `<section class="s21-section"><div class="s21-panel-head"><div><p class="s21-eyebrow">${tr("Изменение во времени", "Change over time")}</p><h2>${tr("Сопоставимые траектории выбранных стран", "Comparable trajectories for selected countries")}</h2><p>${tr("Линия строится только для методически сопоставимых наблюдений внутри одного модуля. Разрывы редакций не скрываются.", "Lines are drawn only for methodologically comparable observations within one module. Edition breaks are not concealed.")}</p></div><div class="s21-inline-controls"><label>${tr("Модуль", "Module")}<select id="s21-trend-index">${selectOptions(numeric, ui.trendIndex, "code", (item) => `${item.short_name} · ${moduleName(item)}`)}</select></label><label>${tr("Шкала", "Scale")}<select id="s21-trend-metric"><option value="percentile" ${ui.trendMetric === "percentile" ? "selected" : ""}>${tr("Процентиль", "Percentile")}</option><option value="score" ${ui.trendMetric === "score" ? "selected" : ""}>${tr("Оценка", "Score")}</option></select></label></div></div><article class="s21-chart-card s21-trend-card">${lineChart()}</article>${trendSummary()}${(payload.trend.warnings_ru || []).length ? `<div class="s21-warning-list">${(lang() === "ru" ? payload.trend.warnings_ru : payload.trend.warnings_en).map((note) => `<p>${esc(note)}</p>`).join("")}</div>` : ""}</section>`;
  }

  function qualityMatrix() {
    return `<div class="s21-table-shell" role="region" aria-label="${tr("Полнота и актуальность по темам", "Coverage and freshness by theme")}" tabindex="0"><table class="s21-quality-table"><thead><tr><th>${tr("Страна", "Country")}</th>${payload.portfolio_groups.map((group) => `<th>${esc(groupName(group))}</th>`).join("")}</tr></thead><tbody>${payload.selected_countries.map((country) => `<tr><th><span style="--country-color:${colorFor(country.iso3)}"><i></i>${esc(country.flag || "")} ${esc(country.iso3)}</span></th>${payload.portfolio_groups.map((group) => { const profile = country.group_profiles.find((item) => item.key === group.key); const rate = profile?.module_count ? profile.available_count/profile.module_count*100 : 0; return `<td><div class="s21-coverage-cell"><strong>${profile?.available_count || 0}/${profile?.module_count || group.codes.length}</strong><span><i style="width:${rate}%"></i></span><small>${fmt(rate,0)}%</small></div></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function renderQuality() {
    return `<section class="s21-section"><div class="s21-section-head"><div><p class="s21-eyebrow">${tr("Доказательная база", "Evidence base")}</p><h2>${tr("Полнота профиля по направлениям", "Profile coverage by theme")}</h2><p>${tr("Полнота показывает наличие наблюдений, но не является оценкой качества страны. Ожидание источника и отсутствие наблюдения разведены.", "Coverage shows data availability, not country quality. Source-gated and missing country observations are separated.")}</p></div></div>${qualityMatrix()}</section>
      <section class="s21-quality-cards">${payload.selected_countries.map((country) => `<article style="--country-color:${colorFor(country.iso3)}"><header><i></i><strong>${esc(country.flag || "")} ${esc(countryName(country))}</strong></header><dl><div><dt>${tr("Актуально", "Current")}</dt><dd>${country.freshness.current}</dd></div><div><dt>${tr("Умеренный лаг", "Moderate lag")}</dt><dd>${country.freshness.recent}</dd></div><div><dt>${tr("Требует обновления", "Needs update")}</dt><dd>${country.freshness.stale}</dd></div><div><dt>${tr("Ожидает источник", "Source gated")}</dt><dd>${country.freshness.source_gated}</dd></div><div><dt>${tr("Нет наблюдения", "No observation")}</dt><dd>${country.freshness.no_country_data}</dd></div></dl></article>`).join("")}</section>
      <section class="s21-section"><div class="s21-section-head"><div><p class="s21-eyebrow">${tr("Методические гарантии", "Method safeguards")}</p><h2>${tr("Как читать межстрановое сравнение", "How to read the comparison")}</h2></div></div><div class="s21-method-grid">${(lang() === "ru" ? payload.methodology.notes_ru : payload.methodology.notes_en).map((note, index) => `<article><span>0${index+1}</span><p>${esc(note)}</p></article>`).join("")}</div><div class="s21-method-footer"><strong>${tr("Корреляции", "Correlations")}</strong><p>${tr("Используется ранговая корреляция Спирмена по благоприятным процентилям, попарное исключение пропусков и минимальный порог n=15.", "Spearman rank correlation is calculated on favourable percentiles using pairwise-complete observations and a minimum threshold of n=15.")}</p></div></section>`;
  }

  function tabContent() {
    if (ui.tab === "matrix") return renderMatrix();
    if (ui.tab === "relationships") return renderRelationships();
    if (ui.tab === "trends") return renderTrends();
    if (ui.tab === "quality") return renderQuality();
    return renderOverview();
  }

  function hydrateLocalFlags() {
    if (!context?.flagImage) return;
    context.root.querySelectorAll(".s21-matrix-group thead [data-s21-country]").forEach((button) => {
      const country = selectedProfile(button.dataset.s21Country);
      if (!country) return;
      const marker = button.querySelector("i")?.outerHTML || "";
      button.innerHTML = `${marker}${context.flagImage(country, "flag-img inline")}${esc(country.iso3)}`;
    });
    context.root.querySelectorAll(".s21-country-card").forEach((card) => {
      const button = card.querySelector("[data-s21-country]");
      const target = card.querySelector(".s21-country-card-flag");
      const country = selectedProfile(button?.dataset.s21Country);
      if (target && country) target.innerHTML = context.flagImage(country, "flag-img inline");
    });
  }

  function renderPage() {
    context.root.innerHTML = `${hero()}${tabNav()}<main class="s21-workspace" role="tabpanel">${tabContent()}</main>`;
    hydrateLocalFlags();
    bind();
  }

  function changeAndLoad(key, value) {
    ui[key] = value;
    load(true);
  }

  function bindTabs() {
    const tabs = [...context.root.querySelectorAll("[data-s21-tab]")];
    tabs.forEach((button, index) => {
      button.addEventListener("click", () => { ui.tab = button.dataset.s21Tab; syncUrlState(); renderPage(); });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length-1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].click(); tabs[next].focus();
      });
    });
  }

  function bind() {
    bindTabs();
    context.root.querySelector("#s21-add-country")?.addEventListener("change", (event) => {
      const code = event.target.value;
      if (code && !ui.selected.includes(code) && ui.selected.length < MAX_SELECTED) { ui.selected.push(code); if (!ui.anchor) ui.anchor = code; load(true); }
    });
    context.root.querySelector("#s21-group")?.addEventListener("change", (event) => changeAndLoad("group", event.target.value));
    context.root.querySelector("#s21-htei-mode")?.addEventListener("change", (event) => changeAndLoad("hteiMode", event.target.value));
    context.root.querySelectorAll("[data-s21-remove]").forEach((button) => button.addEventListener("click", () => { if (ui.selected.length > MIN_SELECTED) { ui.selected = ui.selected.filter((code) => code !== button.dataset.s21Remove); load(true); } }));
    context.root.querySelectorAll("[data-s21-country]").forEach((button) => button.addEventListener("click", () => context.goCountry?.(button.dataset.s21Country)));
    context.root.querySelectorAll("[data-s21-module]").forEach((button) => button.addEventListener("click", () => context.routeTo?.(`index-${button.dataset.s21Module}`)));
    context.root.querySelectorAll("[data-s21-provenance]").forEach((button) => button.addEventListener("click", () => context.openProvenance?.(button.dataset.s21Provenance)));
    context.root.querySelector('[data-s21-action="copy-link"]')?.addEventListener("click", async (event) => { syncUrlState(); try { await navigator.clipboard.writeText(location.href); event.currentTarget.textContent = tr("Ссылка скопирована", "Link copied"); } catch (_) { event.currentTarget.textContent = tr("Скопируйте адрес страницы", "Copy the page address"); } });
    context.root.querySelector("#s21-anchor")?.addEventListener("change", (event) => { ui.anchor = event.target.value; syncUrlState(); renderPage(); });
    context.root.querySelector("#s21-matrix-theme")?.addEventListener("change", (event) => { ui.matrixTheme = event.target.value; if (ui.matrixTheme !== "all") ui.expandedGroups.add(ui.matrixTheme); syncUrlState(); renderPage(); });
    context.root.querySelector("#s21-matrix-status")?.addEventListener("change", (event) => { ui.matrixStatus = event.target.value; renderPage(); });
    context.root.querySelector("#s21-matrix-mode")?.addEventListener("change", (event) => { ui.matrixMode = event.target.value; renderPage(); });
    context.root.querySelector("#s21-matrix-search")?.addEventListener("input", (event) => { clearTimeout(searchTimer); const value = event.target.value; searchTimer = setTimeout(() => { ui.matrixQuery = value; renderPage(); context.root.querySelector("#s21-matrix-search")?.focus(); }, 180); });
    context.root.querySelectorAll("[data-s21-toggle-group]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.s21ToggleGroup; ui.expandedGroups.has(key) ? ui.expandedGroups.delete(key) : ui.expandedGroups.add(key); renderPage(); }));
    context.root.querySelector("#s21-field-index")?.addEventListener("change", (event) => changeAndLoad("fieldIndex", event.target.value));
    context.root.querySelector("#s21-scatter-x")?.addEventListener("change", (event) => changeAndLoad("scatterX", event.target.value));
    context.root.querySelector("#s21-scatter-y")?.addEventListener("change", (event) => changeAndLoad("scatterY", event.target.value));
    context.root.querySelector("#s21-correlation-theme")?.addEventListener("change", (event) => changeAndLoad("correlationTheme", event.target.value));
    context.root.querySelector("#s21-trend-index")?.addEventListener("change", (event) => changeAndLoad("trendIndex", event.target.value));
    context.root.querySelector("#s21-trend-metric")?.addEventListener("change", (event) => { ui.trendMetric = event.target.value; renderPage(); });
  }

  window.GIRComparison = {
    version: "comparison-portfolio-v2",
    render(ctx) {
      initialize(ctx);
      context = ctx;
      load(!payload || Number(payload.requested_year) !== Number(ctx.year));
    },
  };
})();
