/* GIR Stage 2 — country profile analytical workspace */
(() => {
  "use strict";

  const cache = new Map();
  let serial = 0;
  let activeBenchmark = "RUSSIA_CORE";
  let returnFocus = null;
  let drawerKeyboardBound = false;

  const tr = (ru, en) => state.lang === "ru" ? ru : en;
  const esc = (value) => escapeHtml(value == null ? "" : String(value));
  const n = (value) => value == null || value === "" || Number.isNaN(Number(value)) ? null : Number(value);
  const pct = (value, digits = 0) => n(value) == null ? "—" : `${fmt(value, digits)}%`;
  const signed = (value, digits = 1, suffix = "") => n(value) == null ? "—" : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}${suffix}`;
  const countryLabel = (country) => state.lang === "ru" ? country.name_ru : country.name_en;
  const cardName = (card) => state.lang === "ru" ? card.name_ru : card.name_en;
  const cardBadge = (card) => state.lang === "ru" ? card.badge_ru : card.badge_en;
  const componentNameV2 = (item) => state.lang === "ru" ? item.public_name_ru : item.public_name_en;
  const groupName = (group) => state.lang === "ru" ? group.label_ru : group.label_en;
  const groupCopy = (group) => state.lang === "ru" ? group.description_ru : group.description_en;
  const unitName = (item) => state.lang === "ru" ? item.unit_public?.label_ru : item.unit_public?.label_en;
  const policyField = (item, field) => state.lang === "ru" ? item[`${field}_ru`] : item[`${field}_en`];

  const REGION_RU = {
    "Europe": "Европа",
    "East Asia & Pacific": "Восточная Азия и Тихоокеанский регион",
    "Europe & Central Asia": "Европа и Центральная Азия",
    "Latin America & Caribbean": "Латинская Америка и Карибский бассейн",
    "Middle East, North Africa, Afghanistan & Pakistan": "Ближний Восток, Северная Африка, Афганистан и Пакистан",
    "North America": "Северная Америка",
    "South Asia": "Южная Азия",
    "Sub-Saharan Africa": "Африка к югу от Сахары",
  };
  const INCOME_RU = {
    "High income": "Высокий уровень дохода",
    "Upper middle income": "Доход выше среднего",
    "Lower middle income": "Доход ниже среднего",
    "Low income": "Низкий уровень дохода",
  };
  const regionName = (country) => state.lang === "ru" ? (REGION_RU[country.region] || country.region || "—") : (country.region || "—");
  const incomeName = (country) => state.lang === "ru" ? (INCOME_RU[country.income_group] || country.income_group || "—") : (country.income_group || "—");

  function key() { return `${state.country}:${state.year || DATA?.requested_year || 2026}`; }
  function workspace() { return cache.get(key()); }
  function rankLabel(rank, universe) {
    if (rank == null) return tr("место не присваивается", "not ranked");
    return tr(`${intFmt(rank)}-е место из ${intFmt(universe)}`, `${intFmt(rank)} of ${intFmt(universe)}`);
  }
  function ordinal(value) {
    const rounded = Math.round(Number(value));
    const mod100 = rounded % 100;
    const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : ({1:"st",2:"nd",3:"rd"}[rounded % 10] || "th");
    return `${rounded}${suffix}`;
  }
  function percentileLabel(value) {
    if (value == null) return tr("без международного места", "no international rank");
    return tr(`${fmt(value, 0)}-й процентиль`, `${ordinal(value)} percentile`);
  }
  function sourceName(card) { return card.source_owner || card.source_name || card.source_id || "—"; }
  function groupByCode(payload, code) { return payload.benchmark_groups.find((item) => item.code === code) || payload.benchmark_groups[0]; }

  async function fetchWorkspace() {
    if (cache.has(key())) return cache.get(key());
    const response = await fetch(`/api/country/${encodeURIComponent(state.country)}/workspace?year=${encodeURIComponent(state.year || DATA?.requested_year || 2026)}`, {cache: "no-store"});
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || `HTTP ${response.status}`);
    }
    const payload = await response.json();
    cache.set(key(), payload);
    return payload;
  }

  function loading() {
    return `<section class="cp2-loading" aria-live="polite"><div class="cp2-loading-mark">G</div><div><h1>${tr("Формируется профиль страны", "Building country profile")}</h1><p>${tr("Сопоставляем индексы, компоненты, страны и доказательную базу…", "Combining indices, components, peers and evidence…")}</p></div></section>`;
  }

  function render() {
    const view = $("#view");
    const request = ++serial;
    const cached = workspace();
    if (cached) return renderPayload(cached);
    view.innerHTML = loading();
    fetchWorkspace().then((payload) => {
      if (request !== serial || state.page !== "country" || state.country !== payload.country.iso3) return;
      activeBenchmark = payload.default_benchmark || "RUSSIA_CORE";
      renderPayload(payload);
    }).catch((error) => {
      if (request !== serial) return;
      view.innerHTML = `<section class="card cp2-error"><h1>${tr("Не удалось сформировать профиль", "Could not build the profile")}</h1><p>${esc(error.message)}</p><button class="link-btn" data-cp2-retry>${tr("Повторить", "Retry")}</button></section>`;
      view.querySelector("[data-cp2-retry]")?.addEventListener("click", () => { cache.delete(key()); render(); });
    });
  }

  function renderPayload(payload, preserveScroll = false) {
    const position = preserveScroll ? window.scrollY : 0;
    const group = groupByCode(payload, activeBenchmark);
    activeBenchmark = group.code;
    $("#view").innerHTML = `<div class="cp2-page">
      ${hero(payload, group)}
      ${jumpNav(payload)}
      ${summary(payload)}
      ${portfolio(payload, group)}
      ${comparison(payload, group)}
      ${trends(payload)}
      ${diagnostics(payload, group)}
      ${payload.policies.length ? policies(payload) : ""}
      ${evidence(payload)}
    </div>`;
    bind(payload);
    syncAllSelectDisplays();
    if (preserveScroll) requestAnimationFrame(() => window.scrollTo({top: position, behavior: "instant"}));
  }

  function hero(payload, group) {
    const country = payload.country;
    const strongest = payload.insights.strongest_index;
    const weakest = payload.insights.weakest_index;
    const narrative = strongest && weakest
      ? tr(
          `Лучшая относительная позиция — ${cardName(strongest)} (${rankLabel(strongest.rank, strongest.universe)}). Наибольший международный разрыв — ${cardName(weakest)} (${rankLabel(weakest.rank, weakest.universe)}).`,
          `The strongest relative position is ${cardName(strongest)} (${rankLabel(strongest.rank, strongest.universe)}). The largest international gap is in ${cardName(weakest)} (${rankLabel(weakest.rank, weakest.universe)}).`
        )
      : tr("Профиль объединяет доступные международные индексы и компонентные наблюдения страны.", "The profile combines the country's available international indices and component observations.");
    return `<section class="cp2-hero" aria-labelledby="cp2Title">
      <div class="card cp2-hero-main"><div class="cp2-country"><div class="cp2-flag">${flagImage(country, "flag-img big")}</div><div><span>${esc(regionName(country))} · ${esc(incomeName(country))}</span><h1 id="cp2Title">${esc(countryLabel(country))}</h1></div></div><p class="cp2-lead">${esc(narrative)}</p><div class="cp2-actions"><button class="cp2-primary" data-cp2-route="matrix">${tr("Сравнить страны", "Compare countries")} <span>→</span></button><button class="cp2-secondary" data-cp2-route="htei-model">${tr("Исследовать HTEI", "Explore HTEI")}</button><a class="cp2-secondary" href="${esc(state.lang === "ru" ? payload.export.txt_ru : payload.export.txt_en)}" download>${tr("Скачать справку", "Download brief")}</a></div></div>
      <aside class="card cp2-benchmark"><span class="cp2-kicker">${tr("Контекст сравнения", "Comparison context")}</span><h2>${esc(groupName(group))}</h2><p>${esc(groupCopy(group))}</p><label class="cp2-field"><span>${tr("Группа стран", "Country group")}</span><select class="select" id="cp2Benchmark" aria-label="${tr("Группа сравнения", "Comparison group")}">${payload.benchmark_groups.map((item) => `<option value="${esc(item.code)}" ${item.code === group.code ? "selected" : ""}>${esc(groupName(item))}</option>`).join("")}</select></label>${peerCountries(group, country.iso3)}</aside>
    </section>`;
  }

  function peerCountries(group, selectedIso3) {
    const visible = group.countries.slice(0, 7);
    const rest = group.countries.slice(7);
    const buttons = (items) => items.map((country) => `<button class="cp2-peer ${country.iso3 === selectedIso3 ? "is-current" : ""}" type="button" data-cp2-country="${esc(country.iso3)}" title="${esc(countryLabel(country))}">${flagImage(country, "flag-img inline")}<span>${esc(countryLabel(country))}</span><small>${esc(country.iso3)}</small></button>`).join("");
    return `<div class="cp2-peer-list">${buttons(visible)}${rest.length ? `<span class="cp2-peer-more">+${rest.length}</span>` : ""}</div>${rest.length ? `<details class="cp2-peer-details"><summary>${tr("Полный состав группы", "Full group membership")}</summary><div class="cp2-peer-list is-full">${buttons(group.countries)}</div></details>` : ""}`;
  }

  function jumpNav(payload) {
    const links = [
      ["cp2-summary", tr("Итоги", "Summary")], ["cp2-indices", tr("Индексы", "Indices")],
      ["cp2-comparison", tr("Сравнение", "Comparison")], ["cp2-trends", tr("Динамика", "Trends")],
      ["cp2-diagnostics", tr("Диагностика", "Diagnostics")],
      ...(payload.policies.length ? [["cp2-policies", tr("Решения", "Actions")]] : []),
      ["cp2-evidence", tr("Данные", "Evidence")],
    ];
    return `<nav class="cp2-jump" aria-label="${tr("Разделы профиля", "Profile sections")}">${links.map(([id, label]) => `<button type="button" data-cp2-jump="${id}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function sectionHead(kicker, title, copy) {
    return `<header class="cp2-section-head"><div><span>${esc(kicker)}</span><h2>${esc(title)}</h2></div><p>${esc(copy)}</p></header>`;
  }

  function summary(payload) {
    const e = payload.evidence;
    const strong = payload.insights.strongest_index;
    const weak = payload.insights.weakest_index;
    const momentum = payload.insights.best_momentum;
    const fresh = (e.freshness_counts.current || 0) + (e.freshness_counts.recent || 0);
    return `<section class="cp2-section" id="cp2-summary">${sectionHead(tr("Резюме для принятия решений", "Decision summary"), tr("Позиция страны — за одну минуту", "The country position in one minute"), tr("Четыре вывода дают обзор до перехода к отдельным индексам, компонентам и источникам.", "Four findings give an overview before moving to individual indices, components and sources."))}<div class="cp2-insight-grid">
      ${insight(tr("Сильнейшая позиция", "Strongest position"), strong ? cardName(strong) : "—", strong ? `${rankLabel(strong.rank, strong.universe)} · ${percentileLabel(strong.percentile)}` : tr("нет сопоставимых данных", "no comparable data"), "positive")}
      ${insight(tr("Главный международный разрыв", "Largest international gap"), weak ? cardName(weak) : "—", weak ? `${rankLabel(weak.rank, weak.universe)} · ${percentileLabel(weak.percentile)}` : tr("нет сопоставимых данных", "no comparable data"), "negative")}
      ${insight(tr("Лучшее изменение места", "Best rank movement"), momentum ? cardName(momentum) : tr("Сопоставимый ряд отсутствует", "No comparable series"), momentum ? tr(`${signed(momentum.rank_delta_1y, 0)} мест за год`, `${signed(momentum.rank_delta_1y, 0)} ranks in one year`) : tr("Редакции с разной методикой не смешиваются", "Different methodological editions are not mixed"), "neutral")}
      ${insight(tr("Доказательная база", "Evidence base"), tr(`${e.available_indices} индексных модулей`, `${e.available_indices} index modules`), tr(`${e.source_count} источников · данные ${e.source_year_min}–${e.source_year_max} · ${fresh} актуальных модулей`, `${e.source_count} sources · data ${e.source_year_min}–${e.source_year_max} · ${fresh} current modules`), "neutral")}
    </div></section>`;
  }

  function insight(label, title, note, tone) { return `<article class="cp2-insight ${tone}"><span>${esc(label)}</span><h3>${esc(title)}</h3><p>${esc(note)}</p></article>`; }

  function portfolio(payload, group) {
    return `<section class="cp2-section" id="cp2-indices">${sectionHead(tr("Семь взаимодополняющих измерений", "Seven complementary dimensions"), tr("Международная позиция без смешения шкал", "International position without mixing scales"), tr(`Главным сравнительным показателем служит процентиль. Исходный score сопровождается собственной шкалой и фактическим годом данных. Бенчмарк: ${groupName(group)}.`, `Percentile is the primary cross-index comparison metric. Every raw score retains its own scale and actual data year. Benchmark: ${groupName(group)}.`))}<div class="cp2-index-grid">${payload.indices.map((card) => indexCard(card, group)).join("")}</div></section>`;
  }

  function indexCard(card, group) {
    if (!card.available) return `<article class="card cp2-index-card is-unavailable"><div class="cp2-index-top"><span class="index-badge">${esc(cardBadge(card))}</span><span class="cp2-fresh unknown">${tr("нет данных", "not available")}</span></div><h3>${esc(cardName(card))}</h3><p>${tr("В выбранном временном срезе сопоставимое значение отсутствует.", "No comparable value is available in the selected time slice.")}</p><button class="link-btn" data-cp2-index="${esc(card.index_code)}">${tr("Открыть модуль", "Open module")}</button></article>`;
    const peer = card.peer_benchmarks[group.code] || {};
    const weak = card.weak_component;
    const scoreDigits = card.index_code === "HCI_PLUS" ? 0 : 1;
    const dataYears = card.source_year_min && card.source_year_max && card.source_year_min !== card.source_year_max ? `${card.source_year_min}–${card.source_year_max}` : String(card.source_year_max || card.source_data_year || card.value_year || "—");
    const width = Math.max(0, Math.min(100, Number(card.percentile || 0)));
    const interval = card.index_code === "HTEI" && card.score_low != null ? `<span class="cp2-interval">${tr("Интервал оценки", "Score interval")}: ${fmt(card.score_low,1)}–${fmt(card.score_high,1)}${card.rank_low != null ? ` · ${tr("место", "rank")} ${card.rank_low}–${card.rank_high}` : ""}</span>` : "";
    return `<article class="card cp2-index-card ${card.index_code === "HTEI" ? "is-project" : ""}"><div class="cp2-index-top"><span class="index-badge ${card.index_code === "HTEI" ? "tz" : ""}">${esc(cardBadge(card))}</span><span class="cp2-fresh ${esc(card.freshness.status)}"><i></i>${esc(state.lang === "ru" ? card.freshness.label_ru : card.freshness.label_en)}</span></div><h3>${esc(cardName(card))}</h3><div class="cp2-index-position"><div><strong>${esc(rankLabel(card.rank, card.universe))}</strong><span>${esc(percentileLabel(card.percentile))}</span></div><div class="cp2-score"><b>${fmt(card.score, scoreDigits)}</b><span>/ ${intFmt(card.scale.max)}</span></div></div><div class="cp2-percentile" role="progressbar" aria-label="${tr("Процентиль", "Percentile")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${fmt(card.percentile,1)}"><span style="width:${width}%"></span></div><div class="cp2-index-meta"><span>${tr("Публикация", "Edition")}: <b>${intFmt(card.value_year)}</b></span><span>${tr("Фактические данные", "Actual data")}: <b>${esc(dataYears)}</b></span>${card.mode ? `<span>${tr("Режим", "Mode")}: <b>${esc(state.lang === "ru" ? card.mode_ru : card.mode_en)}</b></span>` : ""}</div><div class="cp2-peer-gap ${peer.gap == null ? "" : peer.gap >= 0 ? "positive" : "negative"}"><span>${esc(groupName(group))}</span><b>${peer.gap == null ? tr("нет общей выборки", "no common sample") : signed(peer.gap,1,tr(" п.п."," pp"))}</b></div>${interval}<div class="cp2-attention"><span>${tr("Точка внимания", "Point of attention")}</span><b>${weak ? esc(componentNameV2(weak)) : tr("компонентная декомпозиция не опубликована", "component decomposition not published")}</b></div><div class="cp2-index-actions"><button class="link-btn" data-cp2-index="${esc(card.index_code)}">${tr("Диагностика", "Diagnostics")}</button><button class="link-btn secondary" data-cp2-provenance="${esc(card.value_id)}">${tr("Источник", "Evidence")}</button></div></article>`;
  }

  function comparison(payload, group) {
    const available = payload.indices.filter((card) => card.available && card.percentile != null);
    return `<section class="cp2-section" id="cp2-comparison">${sectionHead(tr("От результата к контексту", "From result to context"), tr(`Профиль относительно группы «${groupName(group)}»`, `Profile against ${groupName(group)}`), tr("Карта показывает географию выбранного индекса. Справа процентили страны сравниваются со средним той же группы в одной редакции каждого индекса.", "The map shows the selected index geographically. The panel compares the country's percentile with the same group's mean within each index edition."))}<div class="cp2-comparison-grid"><article class="card cp2-map-card"><div class="chart-title"><h3>${tr("Международное поле", "International field")}</h3>${selectShell(`<select id="mapIndex" class="select" aria-label="${tr("Индекс на карте", "Map index")}">${INDEX_ORDER.map((code) => `<option value="${code}" ${state.index === code ? "selected" : ""}>${esc(indexLabel(code))}</option>`).join("")}</select>`, indexLabel(state.index))}</div><div class="map-wrap">${worldMap(state.index)}</div></article><article class="card cp2-peer-card"><div class="cp2-peer-legend"><span><i class="country"></i>${esc(countryLabel(payload.country))}</span><span><i class="peer"></i>${esc(groupName(group))}</span></div><div class="cp2-peer-profile">${available.map((card) => peerRow(card, group)).join("")}</div><p class="tiny muted">${tr("Процентили позволяют сопоставлять индексы с разными исходными шкалами. Среднее использует только страны с данными в той же редакции.", "Percentiles allow comparison across different raw scales. The mean uses only countries available in the same edition.")}</p></article></div></section>`;
  }

  function peerRow(card, group) {
    const stats = group.index_stats[card.index_code] || {};
    const country = Math.max(0, Math.min(100, Number(card.percentile || 0)));
    const peer = Math.max(0, Math.min(100, Number(stats.percentile_mean || 0)));
    return `<div class="cp2-peer-row"><div class="cp2-peer-label"><b>${esc(cardBadge(card))}</b><span>${esc(cardName(card))}</span></div><div class="cp2-peer-track"><span style="width:${country}%"></span><i style="left:${peer}%"><em>${fmt(peer,0)}</em></i></div><div class="cp2-peer-values"><b>${fmt(country,0)}</b><span>${fmt(peer,0)}</span><small class="${stats.gap == null ? "" : stats.gap >= 0 ? "positive" : "negative"}">${stats.gap == null ? "—" : signed(stats.gap,1)}</small></div></div>`;
  }

  function trends(payload) {
    return `<section class="cp2-section" id="cp2-trends">${sectionHead(tr("Временной контекст", "Temporal context"), tr("Динамика без искусственного соединения методических редакций", "Trends without artificially joining methodological editions"), tr("Линия строится только внутри одной версии формулы. Если сопоставимой истории нет, интерфейс показывает текущую редакцию и прямо сообщает об ограничении.", "A line is drawn only within one formula version. Where no comparable history exists, the current edition is shown with an explicit limitation."))}<div class="cp2-trend-grid">${payload.indices.map(trendCard).join("")}</div></section>`;
  }

  function trendCard(card) {
    const series = card.trend || [];
    const current = card.available ? `${fmt(card.score, card.index_code === "HCI_PLUS" ? 0 : 1)} / ${intFmt(card.scale.max)}` : "—";
    return `<article class="card cp2-trend-card"><div class="cp2-trend-top"><div><span class="index-badge">${esc(cardBadge(card))}</span><h3>${esc(cardName(card))}</h3></div><strong>${esc(current)}</strong></div>${series.length >= 2 ? trendSvg(series) : `<div class="cp2-trend-empty"><b>${tr("Одна сопоставимая редакция", "One comparable edition")}</b><span>${card.index_code === "HTEI" ? tr("Режимы HTEI и интервалы рассматриваются в отдельном модуле.", "HTEI modes and intervals are explained in its dedicated module.") : tr("Методически разнородные значения не соединяются.", "Methodologically different values are not joined.")}</span></div>`}<div class="cp2-trend-foot"><span>${tr("Текущая публикация", "Current edition")}: ${intFmt(card.value_year)}</span><span>${card.rank_delta_1y == null ? tr("нет сопоставимого годового изменения", "no comparable annual change") : tr(`${signed(card.rank_delta_1y,0)} мест за год`, `${signed(card.rank_delta_1y,0)} ranks in one year`)}</span></div></article>`;
  }

  function trendSvg(series) {
    const width = 360, height = 130, px = 13, py = 17;
    const years = series.map((item) => Number(item.year));
    const scores = series.map((item) => Number(item.score));
    const minYear = Math.min(...years), maxYear = Math.max(...years), minScore = Math.min(...scores), maxScore = Math.max(...scores);
    const x = (year) => px + (year - minYear) / (maxYear - minYear || 1) * (width - px * 2);
    const y = (score) => height - py - (score - minScore) / (maxScore - minScore || 1) * (height - py * 2);
    const d = series.map((item, i) => `${i ? "L" : "M"}${x(Number(item.year)).toFixed(1)},${y(Number(item.score)).toFixed(1)}`).join(" ");
    return `<svg class="cp2-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${tr("Динамика оценки", "Score trend")}"><path class="grid" d="M${px},${height-py}H${width-px}"/><path class="line" d="${d}"/>${series.map((item) => `<circle cx="${x(Number(item.year))}" cy="${y(Number(item.score))}" r="3.2"><title>${item.year}: ${fmt(item.score,2)}</title></circle>`).join("")}<text x="${px}" y="${height-1}">${series[0].year}</text><text x="${width-px}" y="${height-1}" text-anchor="end">${series.at(-1).year}</text></svg>`;
  }

  function diagnostics(payload, group) {
    const components = payload.indices.flatMap((card) => (card.components || []).map((item) => ({...item, index_code: card.index_code, index_badge_ru: card.badge_ru, index_badge_en: card.badge_en}))).filter((item) => item.benchmarks?.[group.code]?.gap != null).sort((a,b) => Number(a.benchmarks[group.code].gap) - Number(b.benchmarks[group.code].gap));
    const weakest = components.slice(0, 6);
    const quick = components.filter((item) => Number(item.actionability || 0) >= .68).sort((a,b) => priority(b, group.code) - priority(a, group.code)).slice(0,4);
    const structural = components.filter((item) => !quick.includes(item)).sort((a,b) => priority(b, group.code) - priority(a, group.code)).slice(0,4);
    return `<section class="cp2-section" id="cp2-diagnostics">${sectionHead(tr("Почему сложился результат", "Why the result looks this way"), tr("Индексные риски, компонентные разрывы и рычаги", "Index risks, component gaps and levers"), tr(`Разрывы рассчитаны относительно группы «${groupName(group)}». Это диагностическая приоритизация, а не автоматическое политическое решение.`, `Gaps are calculated against ${groupName(group)}. This is diagnostic prioritisation, not an automated policy decision.`))}<div class="cp2-diagnostic-grid"><article class="card cp2-diagnostic"><h3>${tr("Наиболее слабые индексные позиции", "Weakest index positions")}</h3>${riskList(payload.insights.risk_indices)}</article><article class="card cp2-diagnostic"><h3>${tr("Крупнейшие компонентные разрывы", "Largest component gaps")}</h3>${gapList(weakest, group)}</article><article class="card cp2-diagnostic"><h3>${tr("Быстрые рычаги", "Near-term levers")}</h3>${leverListV2(quick, group, true)}</article><article class="card cp2-diagnostic"><h3>${tr("Структурные рычаги", "Structural levers")}</h3>${leverListV2(structural, group, false)}</article></div></section>`;
  }

  function priority(item, groupCode) { const gap = item.benchmarks?.[groupCode]?.gap; return Math.max(0, -(Number(gap)||0)) * Math.max(.08, Number(item.weight || 0)) * (.55 + Number(item.actionability || .6)); }
  function riskList(items) { return `<div class="cp2-risk-list">${(items || []).map((card,i) => `<div class="cp2-risk"><span>${String(i+1).padStart(2,"0")}</span><div><h4>${esc(cardName(card))}</h4><p>${esc(rankLabel(card.rank,card.universe))} · ${esc(percentileLabel(card.percentile))}</p><small>${card.weak_component ? `${tr("Точка внимания", "Point of attention")}: ${esc(componentNameV2(card.weak_component))}` : ""}</small></div><button class="link-btn" data-cp2-index="${esc(card.index_code)}">${tr("Открыть", "Open")}</button></div>`).join("")}</div>`; }
  function gapList(items, group) {
    if (!items.length) return `<p class="muted">${tr("Недостаточно общих компонентных наблюдений.", "Not enough common component observations.")}</p>`;
    return `<div class="cp2-gap-list">${items.map((item) => { const bench=item.benchmarks[group.code], own=Number(item.normalized_score||0), peer=Number(bench.mean||0); return `<div class="cp2-gap"><div class="cp2-gap-head"><span>${esc(state.lang === "ru" ? item.index_badge_ru : item.index_badge_en)}</span><button class="cp2-evidence-btn" data-cp2-provenance="${esc(item.value_id)}">${tr("Доказательство", "Evidence")}</button></div><h4>${esc(componentNameV2(item))}</h4><div class="cp2-gap-track"><span style="width:${Math.max(0,Math.min(100,own))}%"></span><i style="left:${Math.max(0,Math.min(100,peer))}%"></i></div><div class="cp2-gap-values"><b>${fmt(own,1)} <small>${tr("страна", "country")}</small></b><span>${fmt(peer,1)} <small>${esc(groupName(group))}</small></span><em>${signed(bench.gap,1,tr(" п.п."," pp"))}</em></div><p>${tr("Фактический год", "Actual year")}: ${item.source_data_year || item.release_year || "—"} · ${esc(item.source_id || "")}</p></div>`; }).join("")}</div>`;
  }
  function leverListV2(items, group, quick) {
    if (!items.length) return `<p class="muted">${tr("Недостаточно общих наблюдений.", "Not enough common observations.")}</p>`;
    return `<div class="cp2-levers">${items.map((item,i) => `<div class="cp2-lever"><span>${String(i+1).padStart(2,"0")}</span><div><h4>${esc(componentNameV2(item))}</h4><p>${esc(state.lang === "ru" ? item.index_badge_ru : item.index_badge_en)} · ${tr("разрыв", "gap")}: ${signed(item.benchmarks[group.code].gap,1,tr(" п.п."," pp"))}</p><div><small>${tr("Управляемость", "Actionability")}</small><b>${pct((item.actionability||.6)*100,0)}</b><small>${quick ? tr("горизонт 1–3 года", "1–3 year horizon") : tr("горизонт 3–7 лет", "3–7 year horizon")}</small></div></div><button class="cp2-evidence-btn" data-cp2-provenance="${esc(item.value_id)}">${tr("Источник", "Evidence")}</button></div>`).join("")}</div>`;
  }

  function policies(payload) {
    return `<section class="cp2-section cp2-policy-section" id="cp2-policies">${sectionHead(tr("От диагностики к программе решений", "From diagnosis to an action programme"), tr("Восемь практических мер для России", "Eight practical actions for Russia"), tr("Каждая мера связана с проблемой, измеряемым показателем, бенчмарком, ответственными акторами, KPI и доказательным значением. Подробности раскрываются по запросу.", "Every action is linked to a problem, measurable indicator, benchmark, accountable actors, KPI and evidence. Details are disclosed on demand."))}<div class="cp2-policy-list">${payload.policies.map(policyCard).join("")}</div></section>`;
  }

  function policyCard(item, index) {
    const current = item.current_value == null ? "—" : `${fmt(item.current_value,2)} ${esc(humanUnit(item.unit))}`;
    return `<article class="cp2-policy"><div class="cp2-policy-number">${String(index+1).padStart(2,"0")}</div><div class="cp2-policy-body"><div class="cp2-policy-head"><div><span>${tr("Приоритет", "Priority")} ${intFmt(item.priority)} · ${esc(item.horizon || "")}</span><h3>${esc(policyField(item,"title"))}</h3></div>${item.evidence_value_id ? `<button class="cp2-evidence-btn" data-cp2-provenance="${esc(item.evidence_value_id)}">${tr("Проверить данные", "Verify evidence")}</button>` : `<span class="cp2-system-evidence">${tr("системная мера", "system-level action")}</span>`}</div><p class="cp2-policy-problem">${esc(policyField(item,"problem"))}</p><div class="cp2-policy-core"><div><span>${tr("Индикатор", "Indicator")}</span><b>${esc(policyField(item,"indicator"))}<em>${current}</em></b></div><div><span>${tr("Бенчмарк", "Benchmark")}</span><b>${esc(policyField(item,"benchmark"))}</b></div><div class="wide"><span>${tr("Предлагаемое действие", "Proposed action")}</span><b>${esc(policyField(item,"measure"))}</b></div></div><details class="cp2-policy-details"><summary>${tr("Исполнение, KPI и риски", "Implementation, KPI and risks")}</summary><div class="cp2-policy-detail-grid"><div><span>${tr("Ответственные", "Actors")}</span><b>${esc(policyField(item,"actor"))}</b></div><div><span>${tr("Целевой KPI", "Target KPI")}</span><b>${esc(policyField(item,"target_kpi"))}</b></div><div><span>${tr("Ожидаемый эффект", "Expected effect")}</span><b>${esc(policyField(item,"expected_effect"))}</b></div><div><span>${tr("Риск", "Risk")}</span><b>${esc(policyField(item,"risk"))}</b></div><div><span>${tr("Ресурсы", "Resources")}</span><b>${esc(policyField(item,"resources"))}</b></div><div><span>${tr("Мониторинг", "Monitoring")}</span><b>${esc(policyField(item,"monitoring"))}</b></div></div></details></div></article>`;
  }

  function humanUnit(code) {
    const ru = {
      percent_of_total_employment:"% общей занятости", percent:"%", points:"пунктов",
      per_million_population:"на 1 млн жителей", per_1000000_population:"на 1 млн жителей",
      rd_personnel_per_million_population:"персонала НИОКР на 1 млн жителей",
      percent_of_tertiary_graduates:"% выпускников высшего образования",
      equal_weight_mean_of_individually_minmax_normalized_indicators_0_100:"сводная шкала 0–100",
      business_rd_percent_of_gerd:"% внутренних затрат на НИОКР",
    };
    const en = {
      percent_of_total_employment:"% of total employment", percent:"%", points:"points",
      per_million_population:"per million population", per_1000000_population:"per million population",
      rd_personnel_per_million_population:"R&D personnel per million population",
      percent_of_tertiary_graduates:"% of tertiary graduates",
      equal_weight_mean_of_individually_minmax_normalized_indicators_0_100:"composite 0–100 scale",
      business_rd_percent_of_gerd:"% of gross domestic expenditure on R&D",
    };
    return (state.lang === "ru" ? ru : en)[code] || String(code || "").replaceAll("_", " ");
  }

  function evidence(payload) {
    const e = payload.evidence;
    return `<section class="cp2-section" id="cp2-evidence">${sectionHead(tr("Проверяемость результата", "Result traceability"), tr("Каждая карточка ведёт к источнику и методу", "Every card links to its source and method"), tr("Таблица не смешивает год публикации и фактический год данных, указывает тип значения и открывает provenance для каждой оценки.", "The table keeps edition and actual data years separate, states the value type and opens provenance for every score."))}<div class="cp2-evidence-summary"><div><span>${tr("Доступные модули", "Available modules")}</span><b>${intFmt(e.available_indices)} / 7</b></div><div><span>${tr("Основные источники", "Primary sources")}</span><b>${intFmt(e.source_count)}</b></div><div><span>${tr("Фактические годы", "Actual years")}</span><b>${e.source_year_min}–${e.source_year_max}</b></div><div><span>${tr("Доказанные меры", "Evidence-linked actions")}</span><b>${intFmt(e.direct_policy_evidence_count)}</b></div></div><article class="card cp2-evidence-card"><div class="table-wrap"><table class="data-table cp2-evidence-table"><thead><tr><th>${tr("Модуль", "Module")}</th><th>${tr("Положение", "Position")}</th><th>${tr("Оценка и шкала", "Score and scale")}</th><th>${tr("Годы", "Years")}</th><th>${tr("Источник", "Source")}</th><th>${tr("Тип значения", "Value type")}</th><th>${tr("Проверка", "Evidence")}</th></tr></thead><tbody>${payload.indices.map(evidenceRow).join("")}</tbody></table></div><div class="cp2-evidence-footer"><p>${tr("Методология объясняет формулы и преобразования, а provenance подтверждает конкретное отображаемое значение. Эти уровни дополняют друг друга.", "Methodology explains formulas and transformations, while provenance verifies the exact displayed value. The two levels complement each other.")}</p><button class="cp2-primary" data-cp2-route="methodology">${tr("Открыть методологию", "Open methodology")} <span>→</span></button></div></article></section>`;
  }

  function evidenceRow(card) {
    if (!card.available) return `<tr><td><b>${esc(cardBadge(card))}</b><small>${esc(cardName(card))}</small></td><td colspan="6">${tr("Нет сопоставимого значения в выбранном срезе", "No comparable value in the selected time slice")}</td></tr>`;
    const years = card.source_year_min !== card.source_year_max ? `${card.source_year_min}–${card.source_year_max}` : String(card.source_year_max || card.source_data_year || card.value_year);
    return `<tr><td><b>${esc(cardBadge(card))}</b><small>${esc(cardName(card))}</small></td><td>${esc(rankLabel(card.rank,card.universe))}<small>${card.percentile == null ? "" : pct(card.percentile,1)}</small></td><td><b>${fmt(card.score,card.index_code === "HCI_PLUS" ? 0 : 2)}</b><small>${esc(state.lang === "ru" ? card.scale.label_ru : card.scale.label_en)}</small></td><td>${tr("публикация", "edition")}: ${intFmt(card.value_year)}<small>${tr("данные", "data")}: ${esc(years)}</small></td><td><b>${esc(sourceName(card))}</b><small>${esc(card.source_id || "")}</small></td><td>${esc(state.lang === "ru" ? card.value_type_ru : card.value_type_en)}<small class="cp2-fresh ${esc(card.freshness.status)}">${esc(state.lang === "ru" ? card.freshness.label_ru : card.freshness.label_en)}</small></td><td><button class="link-btn" data-cp2-provenance="${esc(card.value_id)}">${tr("Происхождение", "Provenance")}</button></td></tr>`;
  }

  function bind(payload) {
    $("#cp2Benchmark")?.addEventListener("change", (event) => { activeBenchmark = event.target.value; renderPayload(payload, true); });
    $$('[data-cp2-country]').forEach((button) => button.addEventListener("click", () => { if (button.dataset.cp2Country && button.dataset.cp2Country !== state.country) goCountry(button.dataset.cp2Country); }));
    $$('[data-cp2-route]').forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.cp2Route)));
    $$('[data-cp2-index]').forEach((button) => button.addEventListener("click", () => routeTo(`index-${button.dataset.cp2Index}`)));
    $$('[data-cp2-jump]').forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.cp2Jump)?.scrollIntoView({behavior:"smooth",block:"start"})));
    $$('[data-cp2-provenance]').forEach((button) => button.addEventListener("click", () => openProvenance(button.dataset.cp2Provenance, button)));
    bindDynamic();
  }

  async function openProvenance(valueId, trigger = document.activeElement) {
    if (!valueId) return;
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    showDrawer(`<div class="cp2-prov-loading"><div class="cp2-loading-mark">G</div><p>${tr("Загружается происхождение значения…", "Loading value provenance…")}</p></div>`);
    try {
      const response = await fetch(`/api/provenance/value/${encodeURIComponent(valueId)}`, {cache:"no-store"});
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : `HTTP ${response.status}`);
      const sourceUrl = /^https?:\/\//i.test(body.source_url || "") ? `<a href="${esc(body.source_url)}" target="_blank" rel="noopener noreferrer">${esc(body.source_url)}</a>` : `<span>${esc(body.source_url || "—")}</span>`;
      const interpretation = state.lang === "ru" ? body.interpretation_ru : body.interpretation_en;
      const groups = Array.isArray(body.source_group_coverage) ? body.source_group_coverage.join(" · ") : body.source_group_coverage;
      showDrawer(`<div class="cp2-prov"><span class="cp2-kicker">PROVENANCE</span><h3>${tr("Происхождение значения", "Value provenance")}</h3><p>${esc(body.value_id)}</p>${interpretation ? `<div class="cp2-prov-note">${esc(interpretation)}</div>` : ""}<dl><dt>${tr("Организация и источник", "Publisher and source")}</dt><dd><b>${esc(body.source_name || body.source_id)}</b>${body.source_owner ? `<br>${esc(body.source_owner)}` : ""}<br>${sourceUrl}</dd><dt>${tr("Фактический год", "Actual data year")}</dt><dd>${esc(body.source_data_year || body.release_year || body.newest_source_year || "—")}</dd>${body.raw_value != null ? `<dt>${tr("Исходное значение", "Raw value")}</dt><dd>${fmt(body.raw_value,4)} ${esc(humanUnit(body.unit))}</dd>` : ""}${body.normalized_score != null ? `<dt>${tr("Нормированная оценка", "Normalised score")}</dt><dd>${fmt(body.normalized_score,4)}</dd>` : ""}<dt>${tr("Получено", "Retrieved")}</dt><dd>${esc(body.retrieved_at || "—")}</dd><dt>${tr("Исходный snapshot", "Source snapshot")}</dt><dd class="cp2-break">${esc(body.raw_snapshot_path || "—")}</dd><dt>SHA-256</dt><dd class="cp2-break">${esc(body.raw_snapshot_sha256 || tr("агрегат нескольких snapshots", "aggregate of multiple snapshots"))}</dd><dt>${tr("Преобразование", "Transformation")}</dt><dd>${esc(body.transform_id || "—")}<br><small>${esc(body.transformation_run_id || "")}</small></dd><dt>${tr("Версия формулы", "Formula version")}</dt><dd>${esc(body.formula_version || "—")}</dd><dt>${tr("Качество", "Quality")}</dt><dd>${esc(body.quality_flag || "—")}${groups ? `<br><small>${esc(groups)}</small>` : ""}</dd></dl></div>`);
    } catch (error) {
      showDrawer(`<div class="cp2-prov-error"><span class="cp2-kicker">PROVENANCE</span><h3>${tr("Не удалось открыть доказательную карточку", "Could not open the evidence record")}</h3><p>${esc(error.message)}</p><button class="link-btn" data-cp2-prov-retry>${tr("Повторить", "Retry")}</button></div>`);
      $("#drawer [data-cp2-prov-retry]")?.addEventListener("click", () => openProvenance(valueId, trigger));
    }
  }

  function showDrawer(content) {
    const drawer = $("#drawer");
    drawer.innerHTML = `<button class="drawer-backdrop" type="button" data-cp2-close aria-label="${tr("Закрыть", "Close")}"></button><aside class="drawer-panel cp2-drawer" role="dialog" aria-modal="true" aria-labelledby="cp2DrawerTitle"><button class="drawer-close" type="button" data-cp2-close>${tr("Закрыть", "Close")}</button><div id="cp2DrawerTitle" class="sr-only">${tr("Происхождение данных", "Data provenance")}</div>${content}</aside>`;
    drawer.setAttribute("aria-hidden","false"); drawer.classList.add("open");
    drawer.querySelectorAll("[data-cp2-close]").forEach((button) => button.addEventListener("click", closeDrawerV2));
    const closeButton = drawer.querySelector(".drawer-close");
    closeButton?.focus({preventScroll:true});
    requestAnimationFrame(() => closeButton?.focus({preventScroll:true}));
    bindDrawerKeyboard();
  }

  function closeDrawerV2() {
    const drawer = $("#drawer");
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); drawer.innerHTML = "";
    if (returnFocus instanceof HTMLElement && document.contains(returnFocus)) returnFocus.focus();
    returnFocus = null;
  }

  function bindDrawerKeyboard() {
    if (drawerKeyboardBound) return;
    drawerKeyboardBound = true;
    document.addEventListener("keydown", (event) => {
      const drawer = $("#drawer");
      if (!drawer?.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeDrawerV2();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',drawer).filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first=focusable[0], last=focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }, true);
  }

  window.GIRCountryProfileV2 = {render, clearCache: () => cache.clear(), openProvenance};
  window.openProvenance = (valueId) => openProvenance(valueId, document.activeElement);
  window.closeDrawer = closeDrawerV2;
})();
