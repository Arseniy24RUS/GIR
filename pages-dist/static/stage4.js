/* GIR Stage 4 — training-system competitiveness and Russia policy centre. */
(() => {
  "use strict";

  const cache = {
    training: new Map(),
    trainingPending: new Map(),
    policy: null,
    policyPending: null,
  };

  const ui = {
    benchmark: "TECHNOLOGY_PEERS",
    rankingQuery: "",
    rankingSort: "rank",
    rankingDirection: "asc",
    rankingPage: 1,
    rankingPageSize: 25,
    policyStrand: "all",
    policyHorizon: "all",
    policyQuery: "",
  };

  const blockColors = {
    institutional_environment: "var(--blue2)",
    educational_infrastructure: "var(--green)",
    corporate_strategies: "var(--orange)",
    international_cooperation: "#9b82d8",
  };

  const ru = () => state.lang === "ru";
  const tr = (ruText, enText) => ru() ? ruText : enText;
  const h = (value) => escapeHtml(value ?? "");
  const localName = (item, prefix = "name") => item?.[`${prefix}_${state.lang}`] || item?.[`${prefix}_ru`] || item?.[`${prefix}_en`] || "";
  const signed = (value, digits = 1) => value == null ? "—" : `${Number(value) > 0 ? "+" : ""}${fmt(value, digits)}`;
  const percent = (value, digits = 0) => value == null ? "—" : `${fmt(Number(value) * (Number(value) <= 1 ? 100 : 1), digits)}%`;
  const ordinal = (value) => {
    if (value == null) return "—";
    const number = Math.round(Number(value));
    if (ru()) return `${number}-й`;
    const mod100 = number % 100;
    const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th");
    return `${number}${suffix}`;
  };
  const measureCount = (value) => {
    const count = Number(value) || 0;
    if (!ru()) return `${count} ${count === 1 ? "measure" : "measures"}`;
    const mod10 = count % 10;
    const mod100 = count % 100;
    const noun = mod10 === 1 && mod100 !== 11 ? "мера" : (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? "меры" : "мер");
    return `${count} ${noun}`;
  };
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const trainingKey = () => `${state.country}:${state.year}`;
  const routeButton = (target, label, cls = "secondary") => `<button type="button" class="s4-action ${cls}" data-s4-route="${h(target)}">${h(label)}<span aria-hidden="true">→</span></button>`;
  const icon = (name) => `<img src="static/icons/${h(name)}.svg" alt="" aria-hidden="true">`;
  const dataYearText = (year) => year == null ? "—" : String(year);

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.detail || ""; } catch (_) { /* noop */ }
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  function loading(title, text) {
    return `<section class="s4-loading" aria-live="polite"><div class="s4-loading-mark">G</div><div><h1>${h(title)}</h1><p>${h(text)}</p></div></section>`;
  }

  function errorState(title, error, retryKind) {
    return `<section class="s4-error"><h1>${h(title)}</h1><p>${h(error?.message || error)}</p><button type="button" class="s4-action primary" data-s4-retry="${h(retryKind)}">${tr("Повторить загрузку", "Try again")}</button></section>`;
  }

  function jumpNav(items) {
    return `<nav class="s4-jump" aria-label="${tr("Разделы аналитической страницы", "Analytical page sections")}">${items.map(([id, label]) => `<button type="button" data-s4-jump="${h(id)}">${h(label)}</button>`).join("")}</nav>`;
  }

  function sectionHeading(kicker, title, description, actions = "") {
    return `<header class="s4-section-heading"><div><span>${h(kicker)}</span><h2>${h(title)}</h2></div><div class="s4-section-heading-side"><p>${h(description)}</p>${actions}</div></header>`;
  }

  function countryFlag(country, big = false) {
    return flagImage(country, `flag-img ${big ? "big" : "inline"}`);
  }

  function benchmark(payload) {
    return payload.benchmark_groups.find((item) => item.code === ui.benchmark) || payload.benchmark_groups[0];
  }

  function metric(label, value, note = "") {
    return `<div class="s4-metric"><span>${h(label)}</span><strong>${h(value)}</strong>${note ? `<small>${h(note)}</small>` : ""}</div>`;
  }

  function renderTraining() {
    const view = $("#view");
    if (!view) return;
    const key = trainingKey();
    const payload = cache.training.get(key);
    if (payload) {
      renderTrainingPayload(payload);
      return;
    }
    view.innerHTML = loading(
      tr("Конкурентоспособность системы подготовки технологических кадров", "Competitiveness of the technology workforce training system"),
      tr("Собираются международное положение, четыре блока модели и доказательные компоненты…", "Loading international position, four model blocks and evidence components…"),
    );
    if (!cache.trainingPending.has(key)) {
      const pending = fetchJson(`/api/training/workspace?country=${encodeURIComponent(state.country)}&year=${encodeURIComponent(state.year)}`)
        .then((data) => {
          cache.training.set(key, data);
          cache.trainingPending.delete(key);
          if (state.page === "htei-model" && trainingKey() === key) renderTrainingPayload(data);
          return data;
        })
        .catch((error) => {
          cache.trainingPending.delete(key);
          if (state.page === "htei-model" && trainingKey() === key) {
            view.innerHTML = errorState(tr("Модель не загрузилась", "The model could not load"), error, "training");
            bindShared();
          }
        });
      cache.trainingPending.set(key, pending);
    }
  }

  function renderTrainingPayload(payload) {
    const view = $("#view");
    if (!payload.available) {
      view.innerHTML = `<section class="s4-error"><h1>${h(localName(payload, "title"))}</h1><p>${tr("Для выбранной страны отсутствует опубликованный профиль модели.", "No published model profile is available for the selected country.")}</p></section>`;
      bindDynamic();
      return;
    }
    const score = payload.score;
    const summary = payload.summary;
    const country = payload.country;
    const peer = benchmark(payload);
    const strongest = summary.strongest_block;
    const weakest = summary.weakest_block;
    const trendRank = summary.rank_change_full_period;
    const trendScore = summary.score_change_full_period;
    const heroTakeaway = tr(
      `${country.name_ru} занимает ${score.rank}-е место среди ${summary.universe_count} стран. Сильнейший блок — «${strongest.name_ru}», главный структурный разрыв — «${weakest.name_ru}».`,
      `${country.name_en} ranks ${score.rank}th among ${summary.universe_count} countries. The strongest block is “${strongest.name_en}”; the largest structural gap is “${weakest.name_en}”.`,
    );

    view.innerHTML = `<main class="s4-page training-page">
      <section class="s4-hero s4-training-hero">
        <article class="s4-hero-main">
          <div class="s4-country-identity">${countryFlag(country, true)}<div><span>${tr("Международная аналитическая модель", "International analytical model")}</span><h1>${h(localName(payload, "title"))}</h1></div></div>
          <p class="s4-hero-lead">${h(heroTakeaway)}</p>
          <p class="s4-hero-note">${h(localName(payload, "subtitle"))}</p>
          <div class="s4-hero-actions">
            ${state.country === "RUS" ? routeButton("policy-center", tr("Перейти к программе решений", "Open the action programme"), "primary") : routeButton("country", tr("Открыть профиль страны", "Open country profile"), "primary")}
            <a class="s4-action secondary" href="/api/training/workspace/export.csv?country=${encodeURIComponent(state.country)}&year=${encodeURIComponent(payload.value_year)}&lang=${state.lang}">${icon("download")}${tr("Скачать рейтинг CSV", "Download ranking CSV")}</a>
            ${routeButton("methodology", tr("Методология", "Methodology"), "ghost")}
          </div>
        </article>
        <aside class="s4-score-panel" aria-label="${tr("Итоговая позиция страны", "Country overall position")}">
          <span class="s4-score-label">${tr("Международная позиция", "International position")}</span>
          <div class="s4-rank-value"><strong>${intFmt(score.rank)}</strong><span>${tr(`из ${summary.universe_count}`, `of ${summary.universe_count}`)}</span></div>
          <div class="s4-score-row"><span>${tr("Итоговая оценка", "Overall score")}</span><b>${fmt(score.score, 1)}<small>/100</small></b></div>
          <div class="s4-percentile"><div><span>${tr("Процентиль", "Percentile")}</span><strong>${ordinal(score.percentile)}</strong></div><div class="s4-track"><i style="width:${clamp(score.percentile)}%"></i></div></div>
          <div class="s4-score-meta">
            <div><span>${tr("Качество данных", "Data quality")}</span><b>${percent(score.data_quality, 0)}</b></div>
            <div><span>${tr("Год модели", "Model year")}</span><b>${payload.value_year}</b></div>
            <div><span>${tr("Покрытие блоков", "Block coverage")}</span><b>${percent(score.available_block_weight, 0)}</b></div>
          </div>
        </aside>
      </section>
      ${jumpNav([
        ["s4-overview", tr("Диагноз", "Diagnosis")],
        ["s4-architecture", tr("Четыре блока", "Four blocks")],
        ["s4-components", tr("Компоненты", "Components")],
        ["s4-comparison", tr("Сопоставление", "Comparison")],
        ["s4-ranking", tr("Рейтинг", "Ranking")],
        ["s4-method", tr("Источники и метод", "Sources & method")],
      ])}
      <section class="s4-section" id="s4-overview">
        ${sectionHeading(
          tr("Управленческий диагноз", "Executive diagnosis"),
          tr("Что определяет позицию страны", "What determines the country's position"),
          tr("Четыре карточки отделяют текущий результат, сильную сторону, основной разрыв и направление изменения от технических деталей расчёта.", "Four findings separate the current result, strength, principal gap and direction of change from technical calculation details."),
        )}
        <div class="s4-diagnosis-grid">
          ${diagnosisCard("01", tr("Текущая позиция", "Current position"), tr(`${score.rank}-е место из ${summary.universe_count}`, `Rank ${score.rank} of ${summary.universe_count}`), tr(`Оценка ${fmt(score.score, 1)} из 100; ${fmt(score.percentile, 0)}-й процентиль.`, `Score ${fmt(score.score, 1)} out of 100; ${fmt(score.percentile, 0)}th percentile.`), "rank")}
          ${diagnosisCard("02", tr("Сильная сторона", "Strongest block"), localName(strongest), tr(`${fmt(strongest.score, 1)} балла · место ${strongest.rank} из ${strongest.universe_count}.`, `${fmt(strongest.score, 1)} points · rank ${strongest.rank} of ${strongest.universe_count}.`), "positive")}
          ${diagnosisCard("03", tr("Главный разрыв", "Largest gap"), localName(weakest), tr(`${fmt(weakest.score, 1)} балла · на ${fmt(weakest.upper_quartile - weakest.score, 1)} ниже верхнего квартиля.`, `${fmt(weakest.score, 1)} points · ${fmt(weakest.upper_quartile - weakest.score, 1)} below the upper quartile.`), "warning")}
          ${diagnosisCard("04", tr("Изменение за период", "Change over period"), tr(`${trendRank >= 0 ? "+" : ""}${trendRank || 0} мест`, `${trendRank >= 0 ? "+" : ""}${trendRank || 0} ranks`), tr(`${payload.series[0]?.year}–${payload.value_year}: оценка ${signed(trendScore, 1)}; положительное изменение места означает улучшение.`, `${payload.series[0]?.year}–${payload.value_year}: score ${signed(trendScore, 1)}; a positive rank change means improvement.`), trendRank >= 0 ? "positive" : "warning")}
        </div>
      </section>
      <section class="s4-section" id="s4-architecture">
        ${sectionHeading(
          tr("Архитектура оценки", "Score architecture"),
          tr("Четыре блока модели", "Four model blocks"),
          tr("Сопоставление выполняется по шкале 0–100. Выберите группу, чтобы увидеть разрыв России или другой страны относительно содержательно понятного ориентира.", "All comparisons use a 0–100 scale. Select a group to inspect the gap between the country and a transparent benchmark."),
          benchmarkTabs(payload),
        )}
        <div class="s4-block-grid">${payload.blocks.map((block) => blockCard(block, peer)).join("")}</div>
        ${contributionPanel(payload)}
      </section>
      <section class="s4-section" id="s4-components">
        ${sectionHeading(
          tr("Доказательная декомпозиция", "Evidence decomposition"),
          tr("Из каких показателей складываются блоки", "Indicators behind each block"),
          tr("Каждая строка показывает нормированный score, исходное значение, год, источник, международное место и переход к происхождению данных.", "Each row shows the normalised score, source value, year, source, international rank and a direct route to data provenance."),
        )}
        <div class="s4-component-groups">${payload.blocks.map((block) => componentGroup(block, block.code === weakest.code)).join("")}</div>
      </section>
      <section class="s4-section" id="s4-comparison">
        ${sectionHeading(
          tr("Международное сопоставление", "International comparison"),
          tr("Профиль, динамика и устойчивость вывода", "Profile, trajectory and robustness"),
          tr("Профиль сравнивает четыре блока с выбранной группой. Динамика показана как четыре дискретных выпуска, а устойчивость — по опубликованному методическому аудиту.", "The profile compares all four blocks with the selected peer group. Trajectory is shown as four discrete releases and robustness through the published methodology audit."),
        )}
        <div class="s4-comparison-grid">
          <article class="s4-panel s4-profile-panel"><div class="s4-panel-title"><div><span>${tr("Структурный профиль", "Structural profile")}</span><h3>${h(countryName(country))} · ${h(localName(peer, "label"))}</h3></div></div>${profileComparison(payload.blocks, peer)}</article>
          <article class="s4-panel"><div class="s4-panel-title"><div><span>${tr("Выпуски модели", "Model releases")}</span><h3>${tr("Оценка и место по годам", "Score and rank by year")}</h3></div></div>${trajectoryChart(payload.series)}</article>
          <article class="s4-panel s4-audit-panel"><div class="s4-panel-title"><div><span>${tr("Тест чувствительности", "Sensitivity audit")}</span><h3>${tr("Насколько вывод зависит от весов", "How much the result depends on weights")}</h3></div></div>${auditPanel(payload.audit)}</article>
        </div>
      </section>
      <section class="s4-section" id="s4-ranking">
        ${sectionHeading(
          tr("Международная выборка", "International universe"),
          tr("Рейтинг и четыре блока для 135 стран", "Ranking and four blocks for 135 countries"),
          tr("Поиск, сортировка и пагинация позволяют изучать полный рейтинг без загрузки сотен строк в интерфейс одновременно.", "Search, sorting and pagination support full-universe exploration without rendering hundreds of rows at once."),
          `<a class="s4-action secondary" href="/api/training/workspace/export.csv?country=${encodeURIComponent(state.country)}&year=${payload.value_year}&lang=${state.lang}">${icon("download")}${tr("Экспорт CSV", "Export CSV")}</a>`,
        )}
        ${rankingPanel(payload)}
      </section>
      <section class="s4-section" id="s4-method">
        ${sectionHeading(
          tr("Воспроизводимость", "Reproducibility"),
          tr("Источники, формула и ограничения", "Sources, formula and limitations"),
          tr("Технические идентификаторы не заменяют названия организаций: источник, роль в модели, фактические годы и метод расчёта показаны отдельными слоями.", "Technical identifiers no longer replace organisation names: source, model role, actual years and calculation method are presented as distinct layers."),
        )}
        <div class="s4-method-grid">
          <article class="s4-panel s4-formula-panel">${formulaPanel(payload)}</article>
          <article class="s4-panel s4-limit-panel">${limitationPanel(payload)}</article>
        </div>
        <div class="s4-source-grid">${payload.sources.map(sourceCard).join("")}</div>
      </section>
    </main>`;
    bindTraining(payload);
    bindDynamic();
  }

  function diagnosisCard(number, label, title, text, tone) {
    return `<article class="s4-diagnosis ${h(tone)}"><span>${h(number)} · ${h(label)}</span><h3>${h(title)}</h3><p>${h(text)}</p></article>`;
  }

  function benchmarkTabs(payload) {
    return `<div class="s4-benchmark-tabs" role="group" aria-label="${tr("Группа сопоставления", "Benchmark group")}">${payload.benchmark_groups.map((group) => `<button type="button" data-s4-benchmark="${h(group.code)}" aria-pressed="${group.code === ui.benchmark}"><span>${h(localName(group, "label"))}</span><small>${intFmt(group.country_count)}</small></button>`).join("")}</div>`;
  }

  function blockCard(block, peer) {
    const peerScore = peer.blocks?.[block.code];
    const gap = peerScore == null ? null : block.score - peerScore;
    return `<article class="s4-block-card" style="--s4-block:${blockColors[block.code]}">
      <div class="s4-block-head"><span>${h(localName(block))}</span><strong>${fmt(block.score, 1)}</strong></div>
      <p>${h(localName(block, "description"))}</p>
      <div class="s4-bullet" aria-label="${tr("Сопоставление оценки блока", "Block score comparison")}"><div class="s4-bullet-track"><i style="width:${clamp(block.score)}%"></i><b style="left:${clamp(peerScore)}%" title="${h(localName(peer, "label"))}: ${fmt(peerScore, 1)}"></b><em style="left:${clamp(block.upper_quartile)}%" title="${tr("Верхний квартиль", "Upper quartile")}: ${fmt(block.upper_quartile, 1)}"></em></div><div class="s4-bullet-labels"><span>${tr("Страна", "Country")} ${fmt(block.score, 1)}</span><span>${h(localName(peer, "label"))} ${fmt(peerScore, 1)}</span><span>${tr("Верхний квартиль", "Upper quartile")} ${fmt(block.upper_quartile, 1)}</span></div></div>
      <div class="s4-block-facts">
        <div><span>${tr("Вес", "Weight")}</span><b>${percent(block.weight, 0)}</b></div>
        <div><span>${tr("Вклад", "Contribution")}</span><b>${fmt(block.contribution, 1)}</b></div>
        <div><span>${tr("Место", "Rank")}</span><b>${block.rank}/${block.universe_count}</b></div>
        <div><span>${tr("Разрыв", "Gap")}</span><b class="${gap >= 0 ? "is-positive" : "is-negative"}">${signed(gap, 1)}</b></div>
      </div>
      <div class="s4-block-footer"><span>${tr("Наиболее слабый показатель", "Weakest indicator")}</span><b>${h(localName(block.weakest_component))}</b></div>
    </article>`;
  }

  function contributionPanel(payload) {
    const score = Number(payload.score.score);
    return `<article class="s4-contribution-panel">
      <div class="s4-panel-title"><div><span>${tr("Проверка арифметики", "Arithmetic check")}</span><h3>${tr("Как четыре блока формируют итоговую оценку", "How the four blocks form the overall score")}</h3></div><strong>${fmt(score, 2)} / 100</strong></div>
      <div class="s4-contribution-track" aria-label="${tr("Взвешенные вклады блоков", "Weighted block contributions")}">${payload.blocks.map((block) => `<i style="width:${clamp(block.contribution)}%;--segment:${blockColors[block.code]}" title="${h(localName(block))}: ${fmt(block.contribution, 2)}"></i>`).join("")}<span style="width:${clamp(100 - score)}%"></span></div>
      <div class="s4-contribution-legend">${payload.blocks.map((block) => `<div><i style="--segment:${blockColors[block.code]}"></i><span>${h(localName(block))}</span><b>${fmt(block.contribution, 2)}</b></div>`).join("")}</div>
      <p>${tr("Сумма вкладов совпадает с опубликованной оценкой. Для неполных профилей веса доступных блоков перенормируются, после чего применяется прозрачный коэффициент качества данных.", "The sum of contributions matches the published score. For incomplete profiles, available block weights are renormalised before the transparent data-quality factor is applied.")}</p>
    </article>`;
  }

  function componentGroup(block, open) {
    return `<details class="s4-component-group" ${open ? "open" : ""} style="--s4-block:${blockColors[block.code]}"><summary><span><i></i><b>${h(localName(block))}</b><small>${tr(`${block.components.length} показателя · вклад ${fmt(block.contribution, 1)}`, `${block.components.length} indicators · contribution ${fmt(block.contribution, 1)}`)}</small></span><strong>${fmt(block.score, 1)}</strong></summary><div class="s4-component-list">${block.components.map(componentRow).join("")}</div></details>`;
  }

  function rawValue(component) {
    if (component.raw_value == null) return "—";
    const unit = ru() ? component.unit_label_ru : component.unit_label_en;
    return `${fmt(component.raw_value, Math.abs(component.raw_value) >= 100 ? 0 : 2)}${unit ? ` · ${unit}` : ""}`;
  }

  function freshnessClass(lag) {
    if (lag == null) return "unknown";
    if (lag <= 2) return "current";
    if (lag <= 4) return "recent";
    return "stale";
  }

  function componentRow(component) {
    const name = ru() ? component.component_name_ru : component.component_name_en;
    const sourceName = component.source_name || component.source_id;
    const freshness = freshnessClass(component.data_lag);
    return `<article class="s4-component-row">
      <div class="s4-component-name"><span>${h(name)}</span><small>${h(component.component_ref)}</small></div>
      <div class="s4-component-score"><div class="s4-mini-track"><i style="width:${clamp(component.normalized_score)}%"></i></div><b>${fmt(component.normalized_score, 1)}</b></div>
      <div class="s4-component-data"><span>${tr("Исходное значение", "Source value")}</span><b>${h(rawValue(component))}</b></div>
      <div class="s4-component-data"><span>${tr("Место", "Rank")}</span><b>${component.rank || "—"}/${component.universe_count || "—"}</b></div>
      <div class="s4-component-data"><span>${tr("Источник и год", "Source and year")}</span><b>${h(sourceName)}</b><small class="s4-freshness ${freshness}">${dataYearText(component.source_data_year)}${component.data_lag != null ? ` · ${tr(`лаг ${component.data_lag} г.`, `${component.data_lag}y lag`)}` : ""}</small></div>
      <button type="button" class="s4-evidence-button" data-s4-provenance="${h(component.value_id)}">${tr("Доказательство", "Evidence")}</button>
    </article>`;
  }

  function profileComparison(blocks, peer) {
    return `<div class="s4-profile-legend"><span><i class="country"></i>${tr("Страна", "Country")}</span><span><i class="peer"></i>${h(localName(peer, "label"))}</span><span><i class="quartile"></i>${tr("Верхний квартиль", "Upper quartile")}</span></div><div class="s4-profile-list">${blocks.map((block) => {
      const peerScore = peer.blocks?.[block.code];
      return `<div class="s4-profile-row"><div><b>${h(localName(block))}</b><small>${block.rank}/${block.universe_count}</small></div><div class="s4-profile-track"><i style="width:${clamp(block.score)}%;--s4-block:${blockColors[block.code]}"></i><b style="left:${clamp(peerScore)}%"></b><em style="left:${clamp(block.upper_quartile)}%"></em></div><div><b>${fmt(block.score, 1)}</b><small>${signed(block.score - peerScore, 1)}</small></div></div>`;
    }).join("")}</div><p class="s4-panel-note">${h(localName(peer, "description"))}</p>`;
  }

  function trajectoryChart(series) {
    const maxScore = Math.max(...series.map((item) => Number(item.score) || 0), 1);
    const maxRank = Math.max(...series.map((item) => Number(item.rank) || 0), 1);
    return `<div class="s4-trajectory"><div class="s4-trajectory-row"><span>${tr("Оценка", "Score")}</span><div>${series.map((item) => `<div class="s4-year-column"><div class="s4-column-space"><i style="height:${clamp(item.score / maxScore * 100)}%"></i></div><b>${fmt(item.score, 1)}</b><small>${item.year}</small></div>`).join("")}</div></div><div class="s4-trajectory-row rank"><span>${tr("Место", "Rank")}</span><div>${series.map((item) => `<div class="s4-year-column"><div class="s4-rank-dot-space"><i style="top:${clamp((item.rank - 1) / Math.max(1, maxRank - 1) * 100)}%"></i></div><b>${item.rank}</b><small>${item.year}</small></div>`).join("")}</div></div></div><p class="s4-panel-note">${tr("Для места направление инвертировано: точка выше означает более сильную позицию.", "Rank direction is inverted: a higher dot denotes a stronger position.")}</p>`;
  }

  function auditPanel(audit) {
    if (!audit) return `<p>${tr("Аудит чувствительности отсутствует.", "Sensitivity audit is not available.")}</p>`;
    return `<div class="s4-audit-result ${audit.sensitivity_passed ? "passed" : "failed"}"><span>${audit.sensitivity_passed ? tr("Проверка пройдена", "Audit passed") : tr("Требуется проверка", "Review required")}</span><strong>${fmt(audit.min_spearman, 3)}</strong><small>${tr("минимальная корреляция Спирмена", "minimum Spearman correlation")}</small></div><div class="s4-audit-grid">${metric(tr("Сценариев", "Runs"), intFmt(audit.run_count))}${metric(tr("Полных профилей", "Complete profiles"), intFmt(audit.countries))}${metric(tr("Среднее изменение места", "Mean absolute rank change"), fmt(audit.mean_absolute_rank_change, 2))}${metric(tr("Максимальное изменение", "Maximum rank change"), intFmt(audit.max_rank_change))}</div><p class="s4-panel-note">${tr("Это глобальный тест устойчивости методики при изменении весов, а не персональный интервал места выбранной страны.", "This is a global robustness test under weight perturbations, not a country-specific rank interval.")}</p>`;
  }

  function sortedRanking(payload) {
    const q = ui.rankingQuery.trim().toLowerCase();
    const rows = payload.ranking.filter((item) => !q || `${item.iso3} ${item.name_ru} ${item.name_en}`.toLowerCase().includes(q));
    const key = ui.rankingSort;
    const direction = ui.rankingDirection === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      let av;
      let bv;
      if (key.startsWith("block:")) {
        const code = key.split(":")[1];
        av = a.blocks?.[code]; bv = b.blocks?.[code];
      } else if (key === "country") {
        av = ru() ? a.name_ru : a.name_en; bv = ru() ? b.name_ru : b.name_en;
        return String(av).localeCompare(String(bv), state.lang) * direction;
      } else { av = a[key]; bv = b[key]; }
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (Number(av) - Number(bv)) * direction;
    });
    return rows;
  }

  function sortHeader(label, key) {
    const active = ui.rankingSort === key;
    const arrow = active ? (ui.rankingDirection === "asc" ? "↑" : "↓") : "↕";
    return `<button type="button" data-s4-sort="${h(key)}" aria-label="${tr("Сортировать", "Sort")} ${h(label)}">${h(label)} <span>${arrow}</span></button>`;
  }

  function rankingPanel(payload) {
    const rows = sortedRanking(payload);
    const pages = Math.max(1, Math.ceil(rows.length / ui.rankingPageSize));
    ui.rankingPage = Math.min(ui.rankingPage, pages);
    const start = (ui.rankingPage - 1) * ui.rankingPageSize;
    const current = rows.slice(start, start + ui.rankingPageSize);
    return `<article class="s4-ranking-panel">
      <div class="s4-ranking-toolbar"><label><span>${tr("Поиск", "Search")}</span><input id="s4RankingSearch" class="input" type="search" value="${h(ui.rankingQuery)}" placeholder="${tr("Страна или ISO-код", "Country or ISO code")}"></label><label><span>${tr("Строк", "Rows")}</span><select id="s4RankingPageSize" class="select"><option value="25" ${ui.rankingPageSize === 25 ? "selected" : ""}>25</option><option value="50" ${ui.rankingPageSize === 50 ? "selected" : ""}>50</option><option value="100" ${ui.rankingPageSize === 100 ? "selected" : ""}>100</option></select></label><p>${tr(`Найдено ${rows.length} стран`, `${rows.length} countries found`)}</p></div>
      <div class="s4-table-wrap"><table class="s4-table s4-ranking-table"><thead><tr><th>${sortHeader("#", "rank")}</th><th>${sortHeader(tr("Страна", "Country"), "country")}</th><th>${sortHeader(tr("Итог", "Overall"), "score")}</th>${payload.blocks.map((block) => `<th>${sortHeader(localName(block), `block:${block.code}`)}</th>`).join("")}<th>${tr("Качество", "Quality")}</th></tr></thead><tbody>${current.map((item) => `<tr class="${item.iso3 === state.country ? "is-selected" : ""}"><td><span class="s4-rank-pill">${item.rank}</span></td><td><button type="button" class="s4-country-link" data-s4-country="${h(item.iso3)}">${countryFlag(item)}<span><b>${h(ru() ? item.name_ru : item.name_en)}</b><small>${h(item.iso3)} · ${h(item.region || "")}</small></span></button></td><td><strong>${fmt(item.score, 1)}</strong><small>${fmt(item.percentile, 0)}%</small></td>${payload.blocks.map((block) => `<td>${item.blocks?.[block.code] == null ? "—" : fmt(item.blocks[block.code], 1)}</td>`).join("")}<td>${percent(item.data_quality, 0)}</td></tr>`).join("")}</tbody></table></div>
      <footer class="s4-pagination"><span>${tr(`Страница ${ui.rankingPage} из ${pages}`, `Page ${ui.rankingPage} of ${pages}`)}</span><div><button type="button" class="s4-action ghost" data-s4-page="prev" ${ui.rankingPage <= 1 ? "disabled" : ""}>← ${tr("Назад", "Previous")}</button><button type="button" class="s4-action ghost" data-s4-page="next" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")} →</button></div></footer>
    </article>`;
  }

  function formulaPanel(payload) {
    const f = payload.formula;
    return `<div class="s4-panel-title"><div><span>${tr("Опубликованная формула", "Published formula")}</span><h3>${h(f.formula_version)}</h3></div></div><p class="s4-formula-expression">${h(ru() ? f.expression_ru : f.expression_en)}</p><div class="s4-formula-weights">${payload.blocks.map((block) => `<div><span>${h(localName(block))}</span><b>${percent(f.weights[block.code], 0)}</b></div>`).join("")}</div><div class="s4-detail-list"><div><span>${tr("Минимум блоков", "Minimum blocks")}</span><b>${f.minimum_blocks}</b></div><div><span>${tr("Эффективный порог веса", "Effective weight threshold")}</span><b>${percent(f.effective_minimum_weight, 0)}</b></div><div><span>${tr("Коэффициент качества", "Quality factor")}</span><b>${fmt(f.quality_factor, 3)}</b></div><div><span>${tr("Документ", "Document")}</span><b>${h(payload.methodology_document || "docs/TRAINING_MODEL_METHODOLOGY_V2.md")}</b></div></div><p class="s4-panel-note">${h(ru() ? f.component_rule_ru : f.component_rule_en)}</p>`;
  }

  function limitationPanel(payload) {
    return `<div class="s4-panel-title"><div><span>${tr("Как читать результат", "How to interpret the result")}</span><h3>${tr("Границы корректного сравнения", "Boundaries of valid comparison")}</h3></div></div><ul class="s4-limit-list"><li>${h(ru() ? payload.official_result_notice_ru : payload.official_result_notice_en)}</li><li>${tr("Итоговая оценка не измеряет объём государственного финансирования и не заменяет отраслевой прогноз спроса на профессии.", "The overall score does not measure public funding volume and does not replace an occupational demand forecast.")}</li><li>${tr("Временные лаги компонентов различаются; фактические годы показаны на уровне каждого исходного индикатора.", "Component lags vary; actual years are disclosed for every source indicator.")}</li><li>${tr("Сравнительные группы используются для диагностики и не меняют официальный международный рейтинг.", "Peer groups are diagnostic and do not alter the official international ranking.")}</li></ul><div class="s4-year-range"><span>${tr("Фактические годы источников", "Actual source years")}</span><strong>${payload.summary.oldest_source_year}–${payload.summary.newest_source_year}</strong></div>`;
  }

  function sourceCard(source) {
    const url = source.source_url;
    return `<article class="s4-source-card"><div><span>${h(source.source_id)}</span><strong>${h(ru() ? source.name_ru : source.name_en)}</strong><small>${h(source.owner || "")}</small></div><div class="s4-source-card-stats"><span>${tr("Показателей", "Indicators")} <b>${source.component_count}</b></span><span>${tr("Годы", "Years")} <b>${source.oldest_source_year || "—"}${source.newest_source_year && source.newest_source_year !== source.oldest_source_year ? `–${source.newest_source_year}` : ""}</b></span></div>${url ? `<a href="${h(url)}" target="_blank" rel="noopener">${tr("Официальный источник", "Official source")} ↗</a>` : ""}</article>`;
  }

  function bindTraining(payload) {
    bindShared();
    $$('[data-s4-benchmark]').forEach((button) => button.addEventListener("click", () => {
      ui.benchmark = button.dataset.s4Benchmark;
      renderTrainingPayload(payload);
      document.querySelector("#s4-architecture")?.scrollIntoView({ block: "start" });
    }));
    const search = $("#s4RankingSearch");
    if (search) {
      let timer;
      search.addEventListener("input", (event) => {
        clearTimeout(timer);
        ui.rankingQuery = event.target.value;
        ui.rankingPage = 1;
        timer = setTimeout(() => rerenderRanking(payload, true), 120);
      });
    }
    $("#s4RankingPageSize")?.addEventListener("change", (event) => {
      ui.rankingPageSize = Number(event.target.value);
      ui.rankingPage = 1;
      rerenderRanking(payload);
    });
    $$('[data-s4-sort]').forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.s4Sort;
      if (ui.rankingSort === key) ui.rankingDirection = ui.rankingDirection === "asc" ? "desc" : "asc";
      else {
        ui.rankingSort = key;
        ui.rankingDirection = ["rank", "country"].includes(key) ? "asc" : "desc";
      }
      ui.rankingPage = 1;
      rerenderRanking(payload);
    }));
    $$('[data-s4-page]').forEach((button) => button.addEventListener("click", () => {
      ui.rankingPage += button.dataset.s4Page === "next" ? 1 : -1;
      rerenderRanking(payload);
    }));
    $$('[data-s4-country]').forEach((button) => button.addEventListener("click", async () => {
      const iso3 = button.dataset.s4Country;
      if (!iso3 || iso3 === state.country) return;
      state.country = iso3;
      ui.rankingPage = 1;
      await refreshData();
      render();
    }));
  }

  function rerenderRanking(payload, preserveFocus = false) {
    const panel = document.querySelector(".s4-ranking-panel");
    if (!panel) return;
    const activeId = preserveFocus ? document.activeElement?.id : null;
    panel.outerHTML = rankingPanel(payload);
    bindTrainingRankingOnly(payload);
    if (activeId) document.getElementById(activeId)?.focus();
  }

  function bindTrainingRankingOnly(payload) {
    const search = $("#s4RankingSearch");
    if (search) {
      let timer;
      search.addEventListener("input", (event) => {
        clearTimeout(timer); ui.rankingQuery = event.target.value; ui.rankingPage = 1;
        timer = setTimeout(() => rerenderRanking(payload, true), 120);
      });
    }
    $("#s4RankingPageSize")?.addEventListener("change", (event) => { ui.rankingPageSize = Number(event.target.value); ui.rankingPage = 1; rerenderRanking(payload); });
    $$('[data-s4-sort]').forEach((button) => button.addEventListener("click", () => { const key = button.dataset.s4Sort; if (ui.rankingSort === key) ui.rankingDirection = ui.rankingDirection === "asc" ? "desc" : "asc"; else { ui.rankingSort = key; ui.rankingDirection = ["rank", "country"].includes(key) ? "asc" : "desc"; } ui.rankingPage = 1; rerenderRanking(payload); }));
    $$('[data-s4-page]').forEach((button) => button.addEventListener("click", () => { ui.rankingPage += button.dataset.s4Page === "next" ? 1 : -1; rerenderRanking(payload); }));
    $$('[data-s4-country]').forEach((button) => button.addEventListener("click", async () => { state.country = button.dataset.s4Country; await refreshData(); render(); }));
  }

  function renderPolicy() {
    const view = $("#view");
    if (!view) return;
    if (cache.policy) {
      renderPolicyPayload(cache.policy);
      return;
    }
    view.innerHTML = loading(
      tr("Национальная программа развития технологических кадров России", "Russia technology workforce development programme"),
      tr("Связываются диагностические результаты, целевые показатели, ответственные и дорожная карта…", "Linking diagnostic results, KPIs, accountable actors and roadmap…"),
    );
    if (!cache.policyPending) {
      cache.policyPending = fetchJson('/api/policy/russia/workspace?year=2026')
        .then((data) => {
          cache.policy = data;
          cache.policyPending = null;
          if (state.page === "policy-center") renderPolicyPayload(data);
          return data;
        })
        .catch((error) => {
          cache.policyPending = null;
          if (state.page === "policy-center") {
            view.innerHTML = errorState(tr("Центр рекомендаций не загрузился", "The recommendation centre could not load"), error, "policy");
            bindShared();
          }
        });
    }
  }

  function renderPolicyPayload(payload) {
    const view = $("#view");
    const s = payload.summary;
    const diagnosis = payload.diagnosis;
    const focusItems = [...payload.items].sort((a, b) => b.diagnostic_priority.score - a.diagnostic_priority.score).slice(0, 3);
    view.innerHTML = `<main class="s4-page policy-page">
      <section class="s4-hero s4-policy-hero">
        <article class="s4-hero-main">
          <div class="s4-country-identity">${countryFlag(payload.country, true)}<div><span>${tr("Программа решений на основе данных", "Evidence-based action programme")}</span><h1>${h(localName(payload, "title"))}</h1></div></div>
          <p class="s4-hero-lead">${h(localName(payload, "subtitle"))}</p>
          <p class="s4-hero-note">${tr("Меры образуют портфель: измерение рынка труда, кадровый и образовательный поток, технологические результаты и международная кооперация.", "The measures form one portfolio: labour-market measurement, workforce and education pipeline, technology outcomes and international cooperation.")}</p>
          <div class="s4-hero-actions">${routeButton("htei-model", tr("Открыть модель подготовки кадров", "Open training-system model"), "primary")}${routeButton("index-HTEI", tr("Индекс технологической занятости", "HTEI"), "secondary")}<a class="s4-action secondary" href="/api/policy/russia/export.csv?year=${s.start_year}&lang=${state.lang}">${icon("download")}${tr("Скачать программу CSV", "Download programme CSV")}</a></div>
        </article>
        <aside class="s4-program-summary" aria-label="${tr("Масштаб программы", "Programme scope")}">
          ${metric(tr("Меры", "Measures"), intFmt(s.measure_count), tr("с измеримыми показателями", "with measurable KPIs"))}
          ${metric(tr("Направления", "Policy strands"), intFmt(s.strand_count), tr("единая теория изменений", "one theory of change"))}
          ${metric(tr("Ответственные организации", "Accountable actors"), intFmt(ru() ? s.actor_count_ru : s.actor_count_en), tr("межведомственный контур", "cross-agency system"))}
          ${metric(tr("Горизонт", "Horizon"), `${s.start_year}–${s.end_year}`, tr("аналитическая рамка", "analytical framework"))}
        </aside>
      </section>
      ${jumpNav([
        ["s4-policy-diagnosis", tr("Основание", "Evidence")],
        ["s4-policy-strands", tr("Направления", "Strands")],
        ["s4-policy-roadmap", tr("Дорожная карта", "Roadmap")],
        ["s4-policy-kpi", tr("Показатели", "KPIs")],
        ["s4-policy-actors", tr("Ответственные", "Actors")],
        ["s4-policy-actions", tr("Все меры", "All measures")],
      ])}
      <section class="s4-section" id="s4-policy-diagnosis">
        ${sectionHeading(
          tr("Доказательное основание", "Evidence base"),
          tr("Какие разрывы требуют программы действий", "Which gaps require an action programme"),
          tr("Диагноз объединяет итоговую модель подготовки кадров, Индекс технологической занятости (HTEI) и связанные измеряемые показатели. Рекомендации не заменяют значения, а начинаются с них.", "The diagnosis combines the training-system model, HTEI and linked measurable indicators. Recommendations do not replace the evidence; they begin with it."),
        )}
        <div class="s4-policy-diagnosis-grid">
          ${diagnosisPanel(tr("Система подготовки кадров", "Training system"), diagnosis.training_model.score, diagnosis.training_model.rank, diagnosis.training_model.universe_count, localName(diagnosis.training_model.weakest_block), diagnosis.training_model.value_id, "training")}
          ${diagnosisPanel(tr("Индекс технологической занятости", "HTEI"), diagnosis.htei?.score, diagnosis.htei?.rank, diagnosis.htei?.universe_count || null, tr("Технологическая занятость и кадровое ядро", "Technology employment and workforce core"), diagnosis.htei?.value_id, "htei")}
          <article class="s4-panel s4-priority-panel"><div class="s4-panel-title"><div><span>${tr("Диагностический фокус", "Diagnostic focus")}</span><h3>${tr("Три наиболее напряжённых направления", "Three highest-pressure areas")}</h3></div></div><div class="s4-priority-list">${focusItems.map((item, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><div><b>${h(ru() ? item.title_ru : item.title_en)}</b><small>${h(localName(item.linked_block))} · ${fmt(item.diagnostic_priority.score, 0)}/100</small></div></div>`).join("")}</div><p class="s4-panel-note">${h(ru() ? focusItems[0].diagnostic_priority.basis_ru : focusItems[0].diagnostic_priority.basis_en)}</p></article>
        </div>
      </section>
      <section class="s4-section" id="s4-policy-strands">
        ${sectionHeading(
          tr("Теория изменений", "Theory of change"),
          tr("Четыре взаимосвязанных направления", "Four connected policy strands"),
          tr("Портфель начинается с измерения, укрепляет кадровый и образовательный поток, переводит потенциал в технологические результаты и закрепляет международные связи.", "The portfolio begins with measurement, strengthens the workforce and education pipeline, converts capacity into technology outcomes and reinforces international links."),
        )}
        <div class="s4-strand-flow">${payload.strands.map((strand, index) => strandCard(strand, index)).join("")}</div>
      </section>
      <section class="s4-section" id="s4-policy-roadmap">
        ${sectionHeading(
          tr("Временная логика", "Temporal logic"),
          tr("Аналитическая дорожная карта 2026–2030", "Analytical roadmap 2026–2030"),
          tr("Полосы отражают горизонты, уже заданные в рекомендациях. Это не утверждённый государственный календарный план.", "Bars reflect horizons already stated in the recommendations. This is not an approved government implementation schedule."),
        )}
        ${roadmap(payload)}
      </section>
      <section class="s4-section" id="s4-policy-kpi">
        ${sectionHeading(
          tr("Контур измерения", "Measurement framework"),
          tr("Целевые показатели, текущие значения и ориентиры", "KPIs, current values and benchmarks"),
          tr("Каждая мера связана с наблюдаемым значением или системным блоком. Кнопка доказательства открывает происхождение исходного числа.", "Each measure is linked to an observed value or system block. The evidence control opens the provenance of the underlying number."),
          `<a class="s4-action secondary" href="/api/policy/russia/export.csv?year=${s.start_year}&lang=${state.lang}">${icon("download")}${tr("Экспорт показателей", "Export KPIs")}</a>`,
        )}
        ${kpiTable(payload.items)}
      </section>
      <section class="s4-section" id="s4-policy-actors">
        ${sectionHeading(
          tr("Архитектура реализации", "Delivery architecture"),
          tr("Кто должен координировать изменения", "Who needs to coordinate delivery"),
          tr("Карта не назначает юридическую ответственность, а показывает, где рекомендации требуют совместной работы государства, университетов, бизнеса и исследовательских организаций.", "The map does not assign legal accountability; it shows where recommendations require joint work across government, universities, business and research organisations."),
        )}
        ${actorMap(payload)}
      </section>
      <section class="s4-section" id="s4-policy-actions">
        ${sectionHeading(
          tr("Полный портфель", "Complete portfolio"),
          tr("Восемь мер — от проблемы до мониторинга", "Eight measures — from problem to monitoring"),
          tr("Фильтры помогают изучать программу по направлению и горизонту. В раскрытом состоянии доступны действие, целевой показатель, ответственные, риски, ресурсы и мониторинг.", "Filters support exploration by policy strand and horizon. Expanded records include the action, KPI, actors, risks, resources and monitoring."),
        )}
        ${policyFilters(payload)}
        <div class="s4-action-list" id="s4PolicyActionList">${policyActionList(payload)}</div>
      </section>
    </main>`;
    bindPolicy(payload);
  }

  function diagnosisPanel(title, score, rank, universe, weak, valueId, tone) {
    return `<article class="s4-panel s4-diagnosis-panel ${h(tone)}"><div class="s4-panel-title"><div><span>${tr("Международная позиция", "International position")}</span><h3>${h(title)}</h3></div>${valueId ? `<button type="button" class="s4-evidence-button" data-s4-provenance="${h(valueId)}">${tr("Доказательство", "Evidence")}</button>` : ""}</div><div class="s4-big-score"><strong>${fmt(score, 1)}</strong><span>/100</span></div><div class="s4-diagnosis-rank"><span>${tr("Место", "Rank")}</span><b>${rank || "—"}${universe ? ` / ${universe}` : ""}</b></div><p>${tr("Главный связанный разрыв", "Principal linked gap")}: <b>${h(weak || "—")}</b></p></article>`;
  }

  function strandCard(strand, index) {
    const block = strand.linked_block;
    return `<article class="s4-strand-card" data-strand="${h(strand.code)}"><span>${String(index + 1).padStart(2, "0")}</span><h3>${h(localName(strand))}</h3><p>${h(localName(strand, "description"))}</p><div><span>${tr("Связанный блок", "Linked block")}</span><b>${h(localName(block))}</b><strong>${fmt(block?.score, 1)}</strong></div><small>${h(measureCount(strand.measure_count))}</small></article>`;
  }

  function roadmap(payload) {
    const years = payload.roadmap.years;
    const first = years[0];
    const span = years.length;
    return `<article class="s4-roadmap"><div class="s4-roadmap-head"><span></span>${years.map((year) => `<b>${year}</b>`).join("")}</div><div class="s4-roadmap-body">${payload.roadmap.items.map((item) => {
      const start = Math.max(first, item.start_year || first);
      const end = Math.min(years.at(-1), item.end_year || years.at(-1));
      const left = (start - first) / span * 100;
      const width = (end - start + 1) / span * 100;
      return `<div class="s4-roadmap-row"><div><span>${String(item.priority).padStart(2, "0")}</span><b>${h(ru() ? item.title_ru : item.title_en)}</b><small>${h(item.horizon)}</small></div><div class="s4-roadmap-grid">${years.map(() => `<i></i>`).join("")}<em style="left:${left}%;width:${width}%;--roadmap:${blockColors[payload.strands.find((s) => s.code === item.strand_code)?.linked_block?.code] || "var(--green)"}" title="${h(item.horizon)}"></em></div></div>`;
    }).join("")}</div><footer>${h(ru() ? payload.roadmap.notice_ru : payload.roadmap.notice_en)}</footer></article>`;
  }

  function kpiTable(items) {
    return `<article class="s4-kpi-table-card"><div class="s4-table-wrap"><table class="s4-table s4-kpi-table"><thead><tr><th>#</th><th>${tr("Мера и целевой показатель", "Measure and KPI")}</th><th>${tr("Текущее значение", "Current value")}</th><th>${tr("Ориентир", "Benchmark")}</th><th>${tr("Блок модели", "Model block")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${items.map((item) => `<tr><td><span class="s4-rank-pill">${item.priority}</span></td><td><b>${h(ru() ? item.title_ru : item.title_en)}</b><small>${h(ru() ? item.target_kpi_ru : item.target_kpi_en)}</small></td><td><strong>${item.current_value == null ? "—" : fmt(item.current_value, Math.abs(item.current_value) >= 100 ? 0 : 2)}</strong><small>${h(ru() ? item.unit_label_ru : item.unit_label_en)} · ${dataYearText(item.source_data_year)}</small></td><td>${h(ru() ? item.benchmark_ru : item.benchmark_en)}</td><td><b>${h(localName(item.linked_block))}</b><small>${item.linked_block ? `${fmt(item.linked_block.score, 1)} · ${item.linked_block.rank}/${item.linked_block.universe_count}` : "—"}</small></td><td>${item.evidence_value_id ? `<button type="button" class="s4-evidence-button" data-s4-provenance="${h(item.evidence_value_id)}">${tr("Открыть", "Open")}</button>` : `<span class="s4-status muted">${tr("Системный уровень", "System level")}</span>`}</td></tr>`).join("")}</tbody></table></div></article>`;
  }

  function actorMap(payload) {
    const actors = payload.actors[state.lang] || [];
    const top = actors.slice(0, 12);
    return `<div class="s4-actor-layout"><article class="s4-panel"><div class="s4-panel-title"><div><span>${tr("Координационные узлы", "Coordination nodes")}</span><h3>${tr("Участники с наибольшим числом связанных мер", "Actors linked to the most measures")}</h3></div></div><div class="s4-actor-list">${top.map((actor, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><b>${h(actor.name)}</b><em>${h(measureCount(actor.measure_count))}</em><div>${actor.item_ids.map((id) => `<i>${h(String(id).split("-").at(-1))}</i>`).join("")}</div></div>`).join("")}</div></article><article class="s4-panel s4-governance-panel"><div class="s4-panel-title"><div><span>${tr("Принцип управления", "Governance principle")}</span><h3>${tr("Не один владелец, а согласованный контур", "A coordinated system, not a single owner")}</h3></div></div><div class="s4-governance-layers"><div><b>${tr("Федеральная координация", "Federal coordination")}</b><span>${tr("единые классификации, показатели, данные и ресурсные решения", "shared classifications, KPIs, data and resource decisions")}</span></div><div><b>${tr("Отраслевая реализация", "Sector delivery")}</b><span>${tr("квалификации, корпоративный спрос, лаборатории и технологические проекты", "skills, corporate demand, laboratories and technology projects")}</span></div><div><b>${tr("Университетский контур", "University system")}</b><span>${tr("образовательные программы, исследования, мобильность и международное позиционирование", "programmes, research, mobility and international positioning")}</span></div><div><b>${tr("Независимое наблюдение", "Independent monitoring")}</b><span>${tr("публичные данные, проверяемая методика и регулярная оценка результатов", "public data, auditable methodology and recurrent outcome assessment")}</span></div></div></article></div>`;
  }

  function policyFilters(payload) {
    return `<div class="s4-policy-filter"><label><span>${tr("Поиск", "Search")}</span><input id="s4PolicySearch" class="input" type="search" value="${h(ui.policyQuery)}" placeholder="${tr("Проблема, мера, ответственный или показатель", "Problem, action, actor or KPI")}"></label><div role="group" aria-label="${tr("Направление политики", "Policy strand")}"><button type="button" data-s4-strand="all" aria-pressed="${ui.policyStrand === "all"}">${tr("Все направления", "All strands")}</button>${payload.strands.map((strand) => `<button type="button" data-s4-strand="${h(strand.code)}" aria-pressed="${ui.policyStrand === strand.code}">${h(localName(strand))}<small>${strand.measure_count}</small></button>`).join("")}</div><label><span>${tr("Горизонт", "Horizon")}</span><select id="s4PolicyHorizon" class="select"><option value="all">${tr("Любой", "Any")}</option><option value="short" ${ui.policyHorizon === "short" ? "selected" : ""}>2026–2028</option><option value="long" ${ui.policyHorizon === "long" ? "selected" : ""}>2029–2030</option></select></label></div>`;
  }

  function filteredPolicyItems(payload) {
    const q = ui.policyQuery.trim().toLowerCase();
    return payload.items.filter((item) => {
      if (ui.policyStrand !== "all" && item.strand_code !== ui.policyStrand) return false;
      if (ui.policyHorizon === "short" && Number(item.end_year || 2030) > 2028) return false;
      if (ui.policyHorizon === "long" && Number(item.end_year || 2030) <= 2028) return false;
      if (!q) return true;
      const text = [item.title_ru, item.title_en, item.problem_ru, item.problem_en, item.measure_ru, item.measure_en, item.actor_ru, item.actor_en, item.target_kpi_ru, item.target_kpi_en].join(" ").toLowerCase();
      return text.includes(q);
    });
  }

  function policyActionList(payload) {
    const items = filteredPolicyItems(payload);
    if (!items.length) return `<div class="s4-empty">${tr("По выбранным условиям меры не найдены.", "No measures match the selected filters.")}</div>`;
    return items.map((item, index) => policyActionCard(item, index === 0)).join("");
  }

  function priorityLabel(priority) {
    const map = {
      critical: ["Высокий диагностический приоритет", "High diagnostic priority"],
      high: ["Повышенный диагностический приоритет", "Elevated diagnostic priority"],
      structural: ["Структурная мера", "Structural measure"],
    };
    return tr(...(map[priority?.level] || map.structural));
  }

  function policyActionCard(item, open) {
    const strand = item.strand_code;
    return `<details class="s4-action-card" ${open ? "open" : ""} style="--policy-color:${blockColors[item.linked_block_code] || "var(--green)"}"><summary><span class="s4-action-number">${String(item.priority).padStart(2, "0")}</span><span class="s4-action-summary"><small>${h(priorityLabel(item.diagnostic_priority))} · ${h(item.horizon)}</small><b>${h(ru() ? item.title_ru : item.title_en)}</b><em>${h(localName(item.linked_block))} · ${fmt(item.linked_block?.score, 1)}</em></span><span class="s4-action-chevron" aria-hidden="true">⌄</span></summary><div class="s4-action-body"><p class="s4-action-problem"><span>${tr("Проблема", "Problem")}</span>${h(ru() ? item.problem_ru : item.problem_en)}</p><div class="s4-action-core"><div><span>${tr("Текущее значение", "Current value")}</span><strong>${item.current_value == null ? "—" : fmt(item.current_value, Math.abs(item.current_value) >= 100 ? 0 : 2)}</strong><small>${h(ru() ? item.unit_label_ru : item.unit_label_en)} · ${dataYearText(item.source_data_year)}</small></div><div><span>${tr("Ориентир", "Benchmark")}</span><b>${h(ru() ? item.benchmark_ru : item.benchmark_en)}</b></div><div class="wide"><span>${tr("Предлагаемое действие", "Proposed action")}</span><b>${h(ru() ? item.measure_ru : item.measure_en)}</b></div></div><div class="s4-action-detail-grid"><div><span>${tr("Целевой показатель", "Target KPI")}</span><b>${h(ru() ? item.target_kpi_ru : item.target_kpi_en)}</b></div><div><span>${tr("Ответственные", "Actors")}</span><b>${h(ru() ? item.actor_ru : item.actor_en)}</b></div><div><span>${tr("Ожидаемый эффект", "Expected effect")}</span><b>${h(ru() ? item.expected_effect_ru : item.expected_effect_en)}</b></div><div><span>${tr("Риск", "Risk")}</span><b>${h(ru() ? item.risk_ru : item.risk_en)}</b></div><div><span>${tr("Ресурсы", "Resources")}</span><b>${h(ru() ? item.resources_ru : item.resources_en)}</b></div><div><span>${tr("Мониторинг", "Monitoring")}</span><b>${h(ru() ? item.monitoring_ru : item.monitoring_en)}</b></div></div><footer><span>${h(ru() ? item.evidence_note_ru : item.evidence_note_en)}</span>${item.evidence_value_id ? `<button type="button" class="s4-evidence-button" data-s4-provenance="${h(item.evidence_value_id)}">${tr("Открыть доказательство", "Open evidence")}</button>` : ""}</footer></div></details>`;
  }

  function bindPolicy(payload) {
    bindShared();
    const search = $("#s4PolicySearch");
    if (search) {
      let timer;
      search.addEventListener("input", (event) => {
        clearTimeout(timer); ui.policyQuery = event.target.value;
        timer = setTimeout(() => rerenderPolicyActions(payload, true), 120);
      });
    }
    $$('[data-s4-strand]').forEach((button) => button.addEventListener("click", () => {
      ui.policyStrand = button.dataset.s4Strand;
      renderPolicyPayload(payload);
      document.querySelector("#s4-policy-actions")?.scrollIntoView({ block: "start" });
    }));
    $("#s4PolicyHorizon")?.addEventListener("change", (event) => { ui.policyHorizon = event.target.value; rerenderPolicyActions(payload); });
  }

  function rerenderPolicyActions(payload, preserveFocus = false) {
    const list = $("#s4PolicyActionList");
    if (!list) return;
    const activeId = preserveFocus ? document.activeElement?.id : null;
    list.innerHTML = policyActionList(payload);
    if (activeId) document.getElementById(activeId)?.focus();
    bindEvidenceButtons(list);
  }

  function bindEvidenceButtons(root = document) {
    $$('[data-s4-provenance]', root).forEach((button) => button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;
      try { await openProvenance(button.dataset.s4Provenance, button); }
      catch (error) { console.error(error); }
      finally { button.disabled = false; }
    }));
  }

  function bindShared() {
    $$('[data-s4-route]').forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.s4Route)));
    $$('[data-s4-jump]').forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.s4Jump)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    $$('[data-s4-retry]').forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.s4Retry === "training") { cache.training.delete(trainingKey()); renderTraining(); }
      else { cache.policy = null; renderPolicy(); }
    }));
    bindEvidenceButtons();
  }

  window.GIRStage4 = {
    renderTraining,
    renderPolicy,
    invalidateTraining(country = state.country, year = state.year) { cache.training.delete(`${country}:${year}`); },
  };
})();
