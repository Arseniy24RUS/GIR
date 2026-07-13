/* GIR Stage 8 — unified research workspace for HDI, HCI+, GTCI, GII, IDI and QS E&T. */
(() => {
  "use strict";

  const cache = new Map();
  const pending = new Map();
  const ui = { query: "", page: 1, pageSize: 25, trendMetric: "score" };
  let context = null;
  let payload = null;
  let renderToken = 0;

  const lang = () => context?.lang || "ru";
  const tr = (ru, en) => lang() === "ru" ? ru : en;
  const esc = (value) => context?.escapeHtml ? context.escapeHtml(value) : String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const fmt = (value, digits = 1) => value == null || !Number.isFinite(Number(value)) ? "—" : Number(value).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const intFmt = (value) => value == null || !Number.isFinite(Number(value)) ? "—" : Math.round(Number(value)).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US");
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const local = (item, prefix = "name") => item?.[`${prefix}_${lang()}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const selectedCountry = () => context?.country || "RUS";
  const requestedYear = () => Number(context?.year || 2026);
  const selectedCode = () => String(context?.code || "HDI").toUpperCase();
  const key = () => `${selectedCode()}:${selectedCountry()}:${requestedYear()}`;
  const scaleMax = () => Number(payload?.index?.scale?.max || 100);
  const score = () => payload?.score || {};
  const country = () => payload?.country || { iso3: selectedCountry(), name_ru: selectedCountry(), name_en: selectedCountry() };
  const scoreValue = () => Number(score().score);
  const percentileValue = () => Number.isFinite(Number(score().percentile)) ? Number(score().percentile) : (Number.isFinite(Number(score().rank)) && Number(payload?.summary?.country_count) ? 100 * (Number(payload.summary.country_count) - Number(score().rank)) / Math.max(1, Number(payload.summary.country_count) - 1) : null);

  function icon(name) {
    return `<img class="iw-icon" src="static/icons/${esc(name)}.svg" alt="" aria-hidden="true">`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.detail || ""; } catch (_) { /* no-op */ }
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  function load() {
    const cacheKey = key();
    if (cache.has(cacheKey)) return Promise.resolve(cache.get(cacheKey));
    if (pending.has(cacheKey)) return pending.get(cacheKey);
    const url = `/api/index/${encodeURIComponent(selectedCode())}/workspace?country=${encodeURIComponent(selectedCountry())}&year=${encodeURIComponent(requestedYear())}`;
    const request = fetchJson(url).then((data) => {
      cache.set(cacheKey, data);
      pending.delete(cacheKey);
      return data;
    }).catch((error) => {
      pending.delete(cacheKey);
      throw error;
    });
    pending.set(cacheKey, request);
    return request;
  }

  function loading() {
    return `<section class="iw-loading" aria-live="polite"><div class="iw-loading-mark">${esc(selectedCode())}</div><h1>${tr("Загрузка исследовательского пространства", "Loading research workspace")}</h1><p>${tr("Собираются оценка, международное положение, компоненты, динамика, источники и воспроизводимая методика.", "Loading score, international position, components, trend, sources and reproducible methodology.")}</p></section>`;
  }

  function errorState(error) {
    return `<section class="iw-error"><h1>${tr("Рабочее пространство не загрузилось", "The workspace could not load")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="iw-button primary" data-iw-retry>${tr("Повторить", "Try again")}</button></section>`;
  }

  function statusLabel() {
    return lang() === "ru" ? payload.index.scale.status_ru : payload.index.scale.status_en;
  }

  function methodologyLabel() {
    const method = payload.index.methodology || {};
    return lang() === "ru" ? (method.label_ru || statusLabel()) : (method.label_en || statusLabel());
  }

  function valueStatus() {
    const status = String(payload.index.official_or_derived || payload.index.methodology?.score_status || "");
    if (status.includes("derived") || selectedCode() === "QS_ET") return tr("Авторская страновая агрегация официальных строк", "Platform country aggregation of official rows");
    if (status.includes("historical")) return tr("Официальная историческая редакция", "Official historical edition");
    return tr("Официальное опубликованное значение", "Official published value");
  }

  function dataYear() {
    return score().source_data_year ?? score().year ?? payload.requested_year ?? "—";
  }

  function hero() {
    const idx = payload.index;
    const p = percentileValue();
    const count = payload.summary?.country_count || payload.ranking?.length || 0;
    const rankText = score().rank == null ? tr("без места", "unranked") : `${intFmt(score().rank)} ${tr("из", "of")} ${intFmt(count)}`;
    const scale = lang() === "ru" ? idx.scale.label_ru : idx.scale.label_en;
    const warning = lang() === "ru" ? idx.methodology?.warning_ru : idx.methodology?.warning_en;
    const lead = lang() === "ru" ? idx.description_ru : idx.description_en;
    const method = methodologyLabel();
    return `<section class="iw-hero" aria-labelledby="iwTitle">
      <article class="iw-hero-main">
        <div>
          <span class="iw-overline">${esc(idx.authority || statusLabel())} · ${esc(idx.code)}</span>
          <h1 id="iwTitle">${esc(local(idx))}</h1>
          <p class="iw-hero-lead">${esc(lead || tr("Международный индекс в едином доказательном контуре GIR.", "International index in the unified GIR evidence environment."))}</p>
          <div class="iw-status-line"><span class="accent">${esc(valueStatus())}</span><span>${esc(scale)}</span><span>${esc(method)}</span>${warning ? `<span>${esc(warning)}</span>` : ""}</div>
        </div>
        <div class="iw-hero-actions">
          <button type="button" class="iw-button primary" data-iw-scroll="iwDiagnosis">${tr("Разобрать результат", "Explain the result")}</button>
          <a class="iw-button" href="/api/index/${encodeURIComponent(idx.code)}/workspace.csv?country=${encodeURIComponent(country().iso3)}&year=${encodeURIComponent(payload.requested_year)}&lang=${lang()}" download="gir-${esc(idx.code.toLowerCase())}-${esc(payload.requested_year)}.csv">${icon("download")}${tr("Скачать рейтинг", "Download ranking")}</a>
          <button type="button" class="iw-button quiet" data-iw-route="methodology">${tr("Методология", "Methodology")}</button>
        </div>
      </article>
      <aside class="iw-score-panel" aria-label="${tr("Положение выбранной страны", "Selected country position")}">
        <span>${esc(local(country()))} · ${esc(country().iso3 || "")}</span>
        <div class="iw-score-value"><strong>${fmt(scoreValue(), selectedCode() === "HDI" ? 1 : 1)}</strong><small>${tr("из", "of")} ${fmt(scaleMax(), 0)}</small></div>
        <div class="iw-rank-line"><div><span>${tr("Место", "Rank")}</span><b>${esc(rankText)}</b></div><div><span>${tr("Процентиль", "Percentile")}</span><b>${p == null ? "—" : `P${fmt(p, 0)}`}</b></div></div>
        <div class="iw-percentile"><header><span>${tr("Положение в международном распределении", "Position in the international distribution")}</span><b>${p == null ? "—" : `${fmt(p, 1)}%`}</b></header><div class="iw-track" aria-hidden="true"><i style="width:${clamp(p)}%"></i></div></div>
        <div class="iw-score-meta"><div><span>${tr("Год данных", "Data year")}</span><b>${esc(dataYear())}</b></div><div><span>${tr("Выпуск", "Release")}</span><b>${esc(score().release_year ?? score().year ?? payload.requested_year)}</b></div><div><span>${tr("Качество", "Quality")}</span><b>${score().data_quality == null ? esc(score().quality_flag || "—") : `${fmt(Number(score().data_quality) * (Number(score().data_quality) <= 1 ? 100 : 1), 0)}%`}</b></div><div><span>${tr("Источник", "Source")}</span><b>${esc(payload.source?.source_id || score().source_id || idx.authority || "—")}</b></div></div>
      </aside>
    </section>`;
  }

  function jumpNav() {
    const items = [
      ["iwDiagnosis", tr("Диагноз", "Diagnosis")],
      ["iwTrend", tr("Динамика", "Trend")],
      ["iwComponents", tr("Компоненты", "Components")],
      ["iwDistribution", tr("Распределение", "Distribution")],
      ["iwRanking", tr("Рейтинг", "Ranking")],
      ["iwMethod", tr("Метод и источники", "Method & sources")],
    ];
    return `<nav class="iw-jump" aria-label="${tr("Разделы индексного рабочего пространства", "Index workspace sections")}">${items.map(([id, label]) => `<button type="button" data-iw-scroll="${id}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function sectionHeading(number, title, description) {
    return `<header class="iw-section-heading"><div><span>${esc(number)}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p></header>`;
  }

  function componentValue(item) {
    const value = item.normalized_score ?? item.raw_value;
    return value == null ? "—" : fmt(value, Math.abs(Number(value)) >= 100 ? 0 : 1);
  }

  function diagnosis() {
    const strongest = payload.component_insight?.strongest;
    const weakest = payload.component_insight?.weakest;
    const median = payload.summary?.median;
    const top = payload.summary?.top10_threshold;
    const gapMedian = Number.isFinite(scoreValue()) && Number.isFinite(Number(median)) ? scoreValue() - Number(median) : null;
    const gapTop = Number.isFinite(scoreValue()) && Number.isFinite(Number(top)) ? scoreValue() - Number(top) : null;
    return `<section class="iw-section" id="iwDiagnosis">${sectionHeading("01", tr("Положение страны без смешения шкал", "Country position without mixing scales"), tr("Исходный score сохраняется в собственной шкале индекса; международное сопоставление выполняется через место, размер вселенной и процентиль.", "The original score remains on the index's own scale; international comparison uses rank, universe size and percentile."))}<div class="iw-findings">
      <article class="iw-finding"><span>${tr("Относительная позиция", "Relative position")}</span><strong>${percentileValue() == null ? "—" : `P${fmt(percentileValue(), 0)}`}</strong><b>${score().rank == null ? tr("Диагностический профиль без места", "Diagnostic profile without rank") : `${intFmt(score().rank)} ${tr("место", "rank")}`}</b><p>${tr(`Рейтинг охватывает ${intFmt(payload.summary?.country_count)} стран и территорий.`, `The ranking covers ${intFmt(payload.summary?.country_count)} countries and territories.`)}</p></article>
      <article class="iw-finding"><span>${tr("Сильнейший компонент", "Strongest component")}</span><strong>${componentValue(strongest || {})}</strong><b>${esc(strongest ? local(strongest) : tr("Компоненты не опубликованы", "Components not published"))}</b><p>${strongest ? tr("Наиболее высокий нормированный или официальный компонент выбранного профиля.", "The highest normalized or official component in the selected profile.") : tr("Итоговое значение опубликовано без доступной компонентной декомпозиции.", "The total is published without an available component decomposition.")}</p></article>
      <article class="iw-finding"><span>${tr("Главный разрыв", "Principal gap")}</span><strong>${componentValue(weakest || {})}</strong><b>${esc(weakest ? local(weakest) : tr("Нет компонентных данных", "No component data"))}</b><p>${weakest ? tr("Наиболее низкий компонент определяет главное направление содержательной диагностики.", "The lowest component identifies the principal direction for substantive diagnosis.") : tr("Разрыв следует интерпретировать только по итоговому score и международному распределению.", "The gap should be interpreted only through the total score and international distribution.")}</p></article>
      <article class="iw-finding"><span>${tr("Разрыв до ориентиров", "Gap to benchmarks")}</span><strong>${gapMedian == null ? "—" : `${gapMedian > 0 ? "+" : ""}${fmt(gapMedian, 1)}`}</strong><b>${tr("к международной медиане", "to the international median")}</b><p>${gapTop == null ? "" : tr(`До порога верхних 10%: ${gapTop > 0 ? "+" : ""}${fmt(gapTop, 1)} пункта.`, `To the top-decile threshold: ${gapTop > 0 ? "+" : ""}${fmt(gapTop, 1)} points.`)}</p></article>
    </div></section>`;
  }

  function trendChart() {
    const values = (payload.trend || []).filter((item) => Number.isFinite(Number(item[ui.trendMetric] ?? item.score)) && Number.isFinite(Number(item.year)));
    if (!values.length) return `<div class="iw-empty">${tr("Для выбранной страны нет сопоставимого временного ряда.", "No comparable time series is available for the selected country.")}</div>`;
    const width = 900, height = 360, margin = { left: 58, right: 36, top: 30, bottom: 54 };
    const metric = ui.trendMetric;
    const getValue = (item) => Number(item[metric] ?? item.score);
    const years = values.map((item) => Number(item.year));
    const scores = values.map(getValue);
    const minYear = Math.min(...years), maxYear = Math.max(...years);
    const minRaw = Math.min(...scores), maxRaw = Math.max(...scores);
    const padValue = Math.max(1, (maxRaw - minRaw) * .14);
    const minValue = metric === "rank" ? Math.max(1, minRaw - padValue) : Math.max(0, minRaw - padValue);
    const maxValue = maxRaw + padValue;
    const x = (year) => margin.left + (Number(year) - minYear) / (maxYear - minYear || 1) * (width - margin.left - margin.right);
    const y = (value) => metric === "rank"
      ? margin.top + (Number(value) - minValue) / (maxValue - minValue || 1) * (height - margin.top - margin.bottom)
      : height - margin.bottom - (Number(value) - minValue) / (maxValue - minValue || 1) * (height - margin.top - margin.bottom);
    const ticks = Array.from({ length: 5 }, (_, index) => minValue + (maxValue - minValue) * index / 4);
    const yearStep = Math.max(1, Math.ceil(values.length / 8));
    let svg = "";
    ticks.forEach((tick) => { const yy = y(tick); svg += `<line class="iw-grid-line" x1="${margin.left}" x2="${width - margin.right}" y1="${yy}" y2="${yy}"/><text class="iw-axis-label" x="${margin.left - 10}" y="${yy + 4}" text-anchor="end">${metric === "rank" ? intFmt(tick) : fmt(tick, 1)}</text>`; });
    values.filter((_, index) => index % yearStep === 0 || index === values.length - 1).forEach((item) => { svg += `<text class="iw-axis-label" x="${x(item.year)}" y="${height - 18}" text-anchor="middle">${item.year}</text>`; });
    for (let index = 1; index < values.length; index += 1) {
      const previous = values[index - 1], current = values[index];
      const comparable = current.comparable_to_current !== false && previous.comparable_to_current !== false && current.edition === previous.edition;
      svg += `<line class="iw-trend-line ${comparable ? "" : "is-break"}" x1="${x(previous.year)}" y1="${y(getValue(previous))}" x2="${x(current.year)}" y2="${y(getValue(current))}"/>`;
    }
    values.forEach((item) => { const label = `${item.year}: ${metric === "rank" ? "#" : ""}${fmt(getValue(item), metric === "rank" ? 0 : 1)}${item.edition ? ` · ${item.edition}` : ""}`; svg += `<circle class="iw-trend-point" cx="${x(item.year)}" cy="${y(getValue(item))}" r="5"><title>${esc(label)}</title></circle>`; });
    svg += `<text class="iw-axis-title" x="${(margin.left + width - margin.right) / 2}" y="${height - 3}" text-anchor="middle">${tr("Год", "Year")}</text>`;
    return `<div class="iw-chart-frame" tabindex="0" role="region" aria-label="${tr("Интерактивная область графика динамики", "Scrollable trend-chart region")}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="iwTrendTitle iwTrendDesc"><title id="iwTrendTitle">${tr("Динамика выбранной страны", "Selected-country trend")}</title><desc id="iwTrendDesc">${tr("Линейный график значений индекса по годам. Пунктир означает методический разрыв между редакциями.", "Line chart of index values by year. A dashed segment indicates a methodological break between editions.")}</desc>${svg}</svg></div>`;
  }

  function trendTable() {
    const values = payload.trend || [];
    return `<details class="iw-accessible-data"><summary>${tr("Открыть табличное описание динамики", "Open tabular trend description")}</summary><div class="iw-table-wrap" tabindex="0" role="region" aria-label="${tr("Таблица временного ряда", "Time-series table")}"><table class="iw-table"><caption>${tr("Временной ряд выбранной страны", "Selected-country time series")}</caption><thead><tr><th>${tr("Год", "Year")}</th><th>${tr("Редакция", "Edition")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Место", "Rank")}</th><th>${tr("Сопоставимость", "Comparability")}</th></tr></thead><tbody>${values.map((item) => `<tr><td>${esc(item.year)}</td><td>${esc(item.edition || payload.index.code)}</td><td>${fmt(item.score ?? item.display_score, 1)}</td><td>${item.rank == null ? "—" : intFmt(item.rank)}</td><td>${item.comparable_to_current === false ? tr("методический разрыв", "methodological break") : tr("сопоставимо внутри редакции", "comparable within edition")}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function trendSection() {
    const breakInfo = payload.methodology_break;
    return `<section class="iw-section" id="iwTrend">${sectionHeading("02", tr("Динамика и методическая сопоставимость", "Trend and methodological comparability"), tr("График показывает только опубликованные значения. Методически несопоставимые редакции не соединяются как единый непрерывный ряд.", "The chart shows published values only. Methodologically non-comparable editions are not presented as one continuous series."))}<div class="iw-analysis-grid"><article class="iw-panel"><header class="iw-panel-head"><div><span>${tr("Временной ряд", "Time series")}</span><h3>${esc(local(country()))}</h3></div><p>${tr("Точные значения доступны в таблице под графиком.", "Exact values are available in the table below the chart.")}</p></header>${trendChart()}${breakInfo?.break ? `<div class="iw-method-break">${esc(lang() === "ru" ? breakInfo.warning_ru : breakInfo.warning_en)}</div>` : ""}${trendTable()}</article><article class="iw-panel"><header class="iw-panel-head"><div><span>${tr("Контекст ряда", "Series context")}</span><h3>${tr("Что можно заключить", "What can be inferred")}</h3></div></header><div class="iw-summary-list"><div><span>${tr("Первый доступный год", "First available year")}</span><b>${payload.trend?.[0]?.year ?? "—"}</b></div><div><span>${tr("Последний доступный год", "Latest available year")}</span><b>${payload.trend?.at(-1)?.year ?? "—"}</b></div><div><span>${tr("Число наблюдений", "Observations")}</span><b>${intFmt(payload.trend?.length || 0)}</b></div><div><span>${tr("Фактический год текущих данных", "Current data year")}</span><b>${esc(dataYear())}</b></div><div><span>${tr("Статус ряда", "Series status")}</span><b>${breakInfo?.break ? tr("несколько редакций", "multiple editions") : tr("единая редакция", "single edition")}</b></div></div></article></div></section>`;
  }

  function componentCard(item, index) {
    const maximum = selectedCode() === "HCI_PLUS" ? 325 : 100;
    const value = Number(item.normalized_score ?? item.raw_value);
    const width = Number.isFinite(value) ? clamp(value / maximum * 100) : 0;
    return `<article class="iw-component"><header><div><span>${String(index + 1).padStart(2, "0")} · ${esc(item.component_code || "")}</span><h3>${esc(local(item))}</h3></div><div class="value">${componentValue(item)}<small>${item.unit ? ` · ${esc(item.unit)}` : ""}</small></div></header><div class="bar" aria-hidden="true"><i style="width:${width}%"></i></div><dl><div><dt>${tr("Вес", "Weight")}</dt><dd>${item.weight == null ? tr("официальный блок", "official pillar") : `${fmt(Number(item.weight) * (Number(item.weight) <= 1 ? 100 : 1), 0)}%`}</dd></div><div><dt>${tr("Год данных", "Data year")}</dt><dd>${esc(item.source_data_year ?? "—")}</dd></div><div><dt>${tr("Источник", "Source")}</dt><dd>${esc(item.source_id || "—")}</dd></div></dl>${item.value_id ? `<button type="button" class="iw-evidence-button" data-iw-provenance="${esc(item.value_id)}">${tr("Происхождение компонента", "Component provenance")} →</button>` : ""}</article>`;
  }

  function componentsSection() {
    const components = payload.components || [];
    const reconciliation = payload.component_insight?.reconciliation;
    return `<section class="iw-section" id="iwComponents">${sectionHeading("03", tr("Компонентная анатомия", "Component anatomy"), tr("Компоненты представлены в тех единицах и методическом статусе, в которых они доступны в официальном источнике или воспроизводимой декомпозиции платформы.", "Components retain the units and methodological status available in the official source or the platform's reproducible decomposition."))}${components.length ? `<div class="iw-components">${components.map(componentCard).join("")}</div>` : `<div class="iw-panel iw-empty">${tr("Источник публикует итоговый score без доступной компонентной декомпозиции для выбранной страны.", "The source publishes the total score without an available component decomposition for the selected country.")}</div>`}${reconciliation ? `<div class="iw-reconciliation"><strong>${tr("Сверка официальных блоков HCI+", "Official HCI+ pillar reconciliation")}: ${fmt(reconciliation.published_component_sum, 0)} → ${fmt(reconciliation.official_total, 0)}</strong><p>${esc(lang() === "ru" ? reconciliation.note_ru : reconciliation.note_en)} ${tr("Разница", "Difference")}: ${fmt(reconciliation.rounding_difference, 0)}.</p></div>` : ""}</section>`;
  }

  function distributionChart() {
    const bins = payload.distribution || [];
    if (!bins.length) return `<div class="iw-empty">${tr("Распределение недоступно.", "Distribution is unavailable.")}</div>`;
    const width = 720, height = 300, margin = { left: 42, right: 24, top: 24, bottom: 50 };
    const maxCount = Math.max(...bins.map((item) => Number(item.count) || 0), 1);
    const barWidth = (width - margin.left - margin.right) / bins.length;
    const selected = scoreValue();
    let svg = "";
    bins.forEach((bin, index) => {
      const value = Number(bin.count) || 0;
      const h = value / maxCount * (height - margin.top - margin.bottom);
      const active = Number.isFinite(selected) && selected >= Number(bin.from) && (selected < Number(bin.to) || index === bins.length - 1);
      const x = margin.left + index * barWidth + 3;
      const y = height - margin.bottom - h;
      svg += `<rect class="${active ? "is-selected" : ""}" x="${x}" y="${y}" width="${Math.max(1, barWidth - 6)}" height="${h}"><title>${fmt(bin.from, 1)}–${fmt(bin.to, 1)}: ${intFmt(value)}</title></rect><text class="iw-axis-label" x="${x + (barWidth - 6) / 2}" y="${height - 23}" text-anchor="middle">${fmt(bin.from, 0)}</text>`;
    });
    svg += `<line class="iw-grid-line" x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}"/><text class="iw-axis-title" x="${width / 2}" y="${height - 3}" text-anchor="middle">${tr("Исходная шкала индекса", "Original index scale")}</text>`;
    return `<div class="iw-chart-frame" tabindex="0" role="region" aria-label="${tr("Интерактивная область международного распределения", "Scrollable international-distribution region")}"><svg class="iw-distribution-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="iwDistributionTitle iwDistributionDesc"><title id="iwDistributionTitle">${tr("Международное распределение оценок", "International score distribution")}</title><desc id="iwDistributionDesc">${tr("Гистограмма показывает число стран по интервалам исходной шкалы; интервал выбранной страны выделен зелёным.", "The histogram shows the number of countries by original-scale intervals; the selected country's interval is highlighted in green.")}</desc>${svg}</svg></div>`;
  }

  function distributionSection() {
    return `<section class="iw-section" id="iwDistribution">${sectionHeading("04", tr("Международное распределение", "International distribution"), tr("Гистограмма показывает, является ли положение страны частью плотной группы или редким крайним значением. Она дополняет место и процентиль, но не заменяет их.", "The histogram shows whether the country belongs to a dense cluster or is an uncommon extreme value. It complements, rather than replaces, rank and percentile."))}<div class="iw-analysis-grid"><article class="iw-panel"><header class="iw-panel-head"><div><span>${tr("Распределение score", "Score distribution")}</span><h3>${esc(payload.index.short_name_ru || payload.index.code)}</h3></div><p>${tr("Зелёным выделен интервал выбранной страны.", "The selected country's interval is highlighted in green.")}</p></header>${distributionChart()}</article><article class="iw-panel"><header class="iw-panel-head"><div><span>${tr("Параметры вселенной", "Universe parameters")}</span><h3>${intFmt(payload.summary?.country_count)} ${tr("стран", "countries")}</h3></div></header><div class="iw-summary-list"><div><span>${tr("Среднее", "Mean")}</span><b>${fmt(payload.summary?.mean, 1)}</b></div><div><span>${tr("Медиана", "Median")}</span><b>${fmt(payload.summary?.median, 1)}</b></div><div><span>${tr("Минимум", "Minimum")}</span><b>${fmt(payload.summary?.minimum, 1)}</b></div><div><span>${tr("Максимум", "Maximum")}</span><b>${fmt(payload.summary?.maximum, 1)}</b></div><div><span>${tr("Порог верхних 10%", "Top-decile threshold")}</span><b>${fmt(payload.summary?.top10_threshold, 1)}</b></div><div><span>${tr("Фактические годы", "Actual data years")}</span><b>${esc(payload.summary?.data_year_min ?? "—")}–${esc(payload.summary?.data_year_max ?? "—")}</b></div></div></article></div></section>`;
  }

  function rankingRows() {
    const query = ui.query.trim().toLowerCase();
    const filtered = (payload.ranking || []).filter((item) => !query || `${item.iso3 || ""} ${item.name_ru || ""} ${item.name_en || ""}`.toLowerCase().includes(query));
    const pages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
    ui.page = Math.min(Math.max(1, ui.page), pages);
    return { filtered, pages, rows: filtered.slice((ui.page - 1) * ui.pageSize, ui.page * ui.pageSize) };
  }

  function rankingTable() {
    const { filtered, pages, rows } = rankingRows();
    return `<article class="iw-panel"><div class="iw-ranking-tools"><label>${tr("Поиск по стране или коду", "Search country or code")}<input id="iwRankingSearch" type="search" value="${esc(ui.query)}" placeholder="${tr("Россия или RUS", "Russia or RUS")}"></label><button type="button" class="iw-button" data-iw-page="prev" ${ui.page <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><button type="button" class="iw-button" data-iw-page="next" ${ui.page >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button><span class="iw-page-meta">${tr("Страница", "Page")} ${ui.page}/${pages} · ${intFmt(filtered.length)}</span></div><div class="iw-table-wrap" tabindex="0" role="region" aria-label="${tr("Международный рейтинг", "International ranking")}"><table class="iw-table"><caption>${esc(local(payload.index))}</caption><thead><tr><th>${tr("Страна", "Country")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Место", "Rank")}</th><th>${tr("Процентиль", "Percentile")}</th><th>${tr("Год данных", "Data year")}</th><th>${tr("Качество", "Quality")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${rows.map((item) => `<tr class="${item.iso3 === country().iso3 ? "is-selected" : ""}"><td><button type="button" class="iw-country-button" data-iw-country="${esc(item.iso3)}"><span class="iw-country-cell">${context.flagImage ? context.flagImage(item, "flag-img inline") : ""}<span><strong>${esc(local(item))}</strong><small>${esc(item.iso3)}</small></span></span></button></td><td><strong>${fmt(item.score, 1)}</strong><small>${tr("из", "of")} ${fmt(scaleMax(), 0)}</small></td><td>${item.rank == null ? "—" : intFmt(item.rank)}<small>${tr("из", "of")} ${intFmt(payload.summary?.country_count)}</small></td><td>${item.percentile == null ? "—" : `P${fmt(item.percentile, 0)}`}</td><td>${esc(item.source_data_year ?? item.year ?? "—")}</td><td>${item.data_quality == null ? esc(item.quality_flag || "—") : `${fmt(Number(item.data_quality) * (Number(item.data_quality) <= 1 ? 100 : 1), 0)}%`}</td><td>${item.value_id ? `<button type="button" class="iw-evidence-button" data-iw-provenance="${esc(item.value_id)}">${tr("Открыть", "Open")}</button>` : "—"}</td></tr>`).join("")}</tbody></table></div></article>`;
  }

  function institutions() {
    const rows = payload.institutions || [];
    if (selectedCode() !== "QS_ET" || !rows.length) return "";
    const summary = payload.qs_summary || {};
    return `<section class="iw-section">${sectionHeading("05A", tr("Университетский слой QS", "QS university layer"), tr("Страновая оценка является воспроизводимой агрегацией официальных университетских строк, а не официальным страновым рейтингом QS.", "The country score is a reproducible aggregation of official university rows, not an official QS country ranking."))}<div class="iw-findings"><article class="iw-finding"><span>${tr("Учреждения", "Institutions")}</span><strong>${intFmt(summary.institution_count || rows.length)}</strong><b>${tr("в профиле страны", "in the country profile")}</b></article><article class="iw-finding"><span>${tr("Лучшее место", "Best rank")}</span><strong>${summary.best_rank == null ? "—" : `#${intFmt(summary.best_rank)}`}</strong><b>${tr("в инженерии и технологиях", "in Engineering & Technology")}</b></article><article class="iw-finding"><span>Top 250</span><strong>${intFmt(summary.top250_count || rows.filter((item) => Number(item.rank) <= 250).length)}</strong><b>${tr("университетов", "universities")}</b></article><article class="iw-finding"><span>Top 500</span><strong>${intFmt(summary.top500_count || rows.filter((item) => Number(item.rank) <= 500).length)}</strong><b>${tr("университетов", "universities")}</b></article></div><div class="iw-institutions">${rows.map((item) => `<article class="iw-institution"><strong>${item.rank == null ? "—" : `#${intFmt(item.rank)}`}</strong><div><b title="${esc(item.title)}">${esc(item.title)}</b><span>${esc(item.city || item.country || "")} · ${item.overall_score == null ? tr("score не опубликован", "score not published") : fmt(item.overall_score, 1)}</span></div></article>`).join("")}</div></section>`;
  }

  function rankingSection() {
    return `<section class="iw-section" id="iwRanking">${sectionHeading("05", tr("Точный международный рейтинг", "Exact international ranking"), tr("Таблица сохраняет исходные оценки, места, процентиль, фактический год данных и проверяемый идентификатор каждого значения.", "The table preserves original scores, ranks, percentile, actual data year and an auditable identifier for every value."))}${rankingTable()}</section>${institutions()}`;
  }

  function formulaText() {
    const formula = payload.formula || {};
    return lang() === "ru" ? (formula.formula_text_ru || formula.method_notes_ru || tr("Формула документирована в официальной методологии источника.", "")) : (formula.formula_text_en || formula.method_notes_en || "The formula is documented in the source's official methodology.");
  }

  function normalizationText() {
    const formula = payload.formula || {};
    return lang() === "ru" ? (formula.normalization_ru || "Нормализация не выполняется платформой сверх указанного преобразования шкалы.") : (formula.normalization_en || "The platform performs no normalization beyond the stated scale transformation.");
  }

  function sourceRows() {
    const source = payload.source || {};
    const rows = [
      [tr("Организация", "Organisation"), source.source_name || payload.index.authority || source.source_id],
      [tr("Идентификатор", "Identifier"), source.source_id],
      [tr("Официальная страница", "Official page"), source.source_url || payload.index.url],
      [tr("Дата получения", "Retrieved"), source.retrieved_at],
      [tr("Raw snapshot", "Raw snapshot"), source.raw_snapshot_path],
      ["SHA-256", source.raw_snapshot_sha256],
      [tr("Качество", "Quality"), source.quality_flag],
    ];
    return rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${String(value || "").startsWith("http") ? `<a href="${esc(value)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>` : esc(value || "—")}</dd></div>`).join("");
  }

  function methodSection() {
    return `<section class="iw-section" id="iwMethod">${sectionHeading("06", tr("Метод, источник и воспроизводимость", "Method, source and reproducibility"), tr("Этот раздел отделяет официально опубликованное значение от преобразований платформы и позволяет проверить первичный источник, формулу, snapshot и контрольную сумму.", "This section separates the officially published value from platform transformations and exposes the primary source, formula, snapshot and checksum."))}<div class="iw-method-grid"><article class="iw-method-card"><span>${tr("Формула и нормализация", "Formula and normalization")}</span><h3>${esc(payload.formula?.formula_version || payload.index.methodology?.methodology_version || tr("Документированная методика", "Documented methodology"))}</h3><div class="iw-formula">${esc(formulaText())}</div><p><b>${tr("Нормализация:", "Normalization:")}</b> ${esc(normalizationText())}</p><p><b>${tr("Методический статус:", "Methodological status:")}</b> ${esc(methodologyLabel())}</p>${selectedCode() === "QS_ET" ? `<p><b>${tr("Ограничение:", "Limitation:")}</b> ${tr("Итог является авторской страновой агрегацией официальных строк QS и не должен цитироваться как официальный страновой рейтинг QS.", "The result is a platform country aggregation of official QS rows and must not be cited as an official QS country ranking.")}</p>` : ""}</article><article class="iw-method-card"><span>${tr("Первичный источник", "Primary source")}</span><h3>${esc(payload.source?.source_name || payload.index.authority || payload.source?.source_id || "—")}</h3><dl class="iw-source-list">${sourceRows()}</dl>${score().value_id ? `<button type="button" class="iw-button" data-iw-provenance="${esc(score().value_id)}">${tr("Открыть provenance итогового значения", "Open total-score provenance")}</button>` : ""}</article></div></section>`;
  }

  function renderPage() {
    context.root.innerHTML = `<main class="index-workspace" data-index-code="${esc(payload.index.code)}">${hero()}${jumpNav()}${diagnosis()}${trendSection()}${componentsSection()}${distributionSection()}${rankingSection()}${methodSection()}</main>`;
    bind();
  }

  function bind() {
    context.root.querySelectorAll("[data-iw-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.iwScroll)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })));
    context.root.querySelectorAll("[data-iw-route]").forEach((button) => button.addEventListener("click", () => context.routeTo?.(button.dataset.iwRoute)));
    context.root.querySelectorAll("[data-iw-provenance]").forEach((button) => button.addEventListener("click", () => button.dataset.iwProvenance && context.openProvenance?.(button.dataset.iwProvenance, button)));
    context.root.querySelectorAll("[data-iw-country]").forEach((button) => button.addEventListener("click", () => context.goCountry?.(button.dataset.iwCountry)));
    context.root.querySelector("#iwRankingSearch")?.addEventListener("input", (event) => { ui.query = event.target.value; ui.page = 1; renderPage(); context.root.querySelector("#iwRankingSearch")?.focus(); });
    context.root.querySelectorAll("[data-iw-page]").forEach((button) => button.addEventListener("click", () => { ui.page += button.dataset.iwPage === "next" ? 1 : -1; renderPage(); document.getElementById("iwRanking")?.scrollIntoView({ block: "start" }); }));
    context.root.querySelector("[data-iw-retry]")?.addEventListener("click", () => { cache.delete(key()); render(context); });
  }

  async function render(nextContext) {
    context = nextContext;
    const token = ++renderToken;
    context.root.innerHTML = loading();
    try {
      payload = await load();
      if (token !== renderToken) return;
      ui.page = 1;
      renderPage();
      window.dispatchEvent(new CustomEvent("gir:index-workspace-ready", { detail: { code: payload.index.code, country: country().iso3, year: payload.requested_year } }));
    } catch (error) {
      if (token !== renderToken) return;
      context.root.innerHTML = errorState(error);
      bind();
      console.error("Index workspace failed", error);
    }
  }

  window.GIRIndexWorkspace = {
    render,
    invalidate(code = selectedCode(), iso3 = selectedCountry(), year = requestedYear()) { cache.delete(`${code}:${iso3}:${year}`); },
  };
})();
