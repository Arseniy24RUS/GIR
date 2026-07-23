/* GIR HTEI workspace — Stage 3 */
(() => {
  "use strict";

  const ui = {
    search: "",
    page: 0,
    pageSize: 25,
    comparisonIndex: 0,
    lastKey: "",
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
  const fmt = (value, digits = 1) => value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : new Intl.NumberFormat(document.documentElement.lang === "en" ? "en-US" : "ru-RU", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(Number(value));
  const intFmt = (value) => value == null || !Number.isFinite(Number(value))
    ? "—"
    : new Intl.NumberFormat(document.documentElement.lang === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(Number(value));
  const text = (ctx, ru, en) => ctx.lang === "ru" ? ru : en;
  const localized = (ctx, item, stem) => item?.[`${stem}_${ctx.lang}`] || item?.[`${stem}_ru`] || item?.[`${stem}_en`] || "";
  const countryName = (ctx, item) => ctx.lang === "ru" ? item?.name_ru : item?.name_en;
  const flag = (item, className = "htei-flag") => {
    const iso2 = String(item?.iso2 || "").toLowerCase();
    return iso2 ? `<img class="${className}" src="/static/flags/${esc(iso2)}.svg" alt="" aria-hidden="true">` : "";
  };
  const modeName = (ctx, item) => localized(ctx, item, "name");
  const modeShort = (ctx, item) => localized(ctx, item, "short");
  const modeDescription = (ctx, item) => localized(ctx, item, "description");
  const modeReason = (ctx, item) => localized(ctx, item, "reason");
  const componentName = (ctx, item) => localized(ctx, item, "name");
  const componentShort = (ctx, item) => localized(ctx, item, "short");
  const componentMeaning = (ctx, item) => localized(ctx, item, "meaning");
  const sourceName = (ctx, item) => localized(ctx, item, "source_name") || item?.source_name || item?.source_id || "";
  const unitLabel = (ctx, item) => item?.[`unit_${ctx.lang}`] || item?.unit || "";
  const policyTitle = (ctx, item) => localized(ctx, item, "title");
  const policyProblem = (ctx, item) => localized(ctx, item, "problem");
  const policyMeasure = (ctx, item) => localized(ctx, item, "measure");
  const policyActor = (ctx, item) => localized(ctx, item, "actor");
  const policyEffect = (ctx, item) => localized(ctx, item, "expected_effect");
  const policyBenchmark = (ctx, item) => localized(ctx, item, "benchmark");

  function render(ctx) {
    const payload = ctx.payload;
    const key = `${payload.country?.iso3}|${payload.effective_mode}|${ctx.lang}`;
    if (key !== ui.lastKey) {
      ui.search = "";
      ui.page = 0;
      ui.lastKey = key;
    }
    const root = ctx.root || document.querySelector("#view");
    if (!payload.available) {
      root.innerHTML = unavailable(ctx);
      return;
    }
    root.innerHTML = `<div class="htei-workspace">
      ${hero(ctx)}
      ${jumpNav(ctx)}
      ${modeSection(ctx)}
      ${compositionSection(ctx)}
      ${qualitySection(ctx)}
      ${comparisonSection(ctx)}
      ${evidenceSection(ctx)}
      ${worldSection(ctx)}
      ${actionsSection(ctx)}
    </div>`;
    bind(ctx);
  }

  function loading(ctx) {
    const root = ctx.root || document.querySelector("#view");
    root.innerHTML = `<section class="htei-loading" aria-live="polite"><div class="htei-loading-mark">HTEI</div><h1>${esc(text(ctx, "Собирается исследовательский профиль", "Building the research profile"))}</h1><p>${esc(text(ctx, "Проверяются режим, компоненты, бенчмарки и происхождение данных…", "Resolving mode, components, benchmarks and provenance…"))}</p></section>`;
  }

  function error(ctx, message) {
    const root = ctx.root || document.querySelector("#view");
    root.innerHTML = `<section class="htei-loading htei-load-error"><div class="htei-loading-mark">!</div><h1>${esc(text(ctx, "HTEI не удалось загрузить", "HTEI could not load"))}</h1><p>${esc(message)}</p><button type="button" class="htei-button htei-button-primary" data-htei-retry>${esc(text(ctx, "Повторить", "Retry"))}</button></section>`;
    root.querySelector("[data-htei-retry]")?.addEventListener("click", ctx.onRetry);
  }

  function unavailable(ctx) {
    const p = ctx.payload;
    return `<section class="htei-loading htei-load-error"><div class="htei-loading-mark">HTEI</div><h1>${esc(text(ctx, "Для выбранной страны профиль не сформирован", "No profile is available for the selected country"))}</h1><p>${esc(localized(ctx, p, "reason"))}</p></section>`;
  }

  function hero(ctx) {
    const p = ctx.payload;
    const profile = p.profile;
    const summary = p.summary;
    const country = p.country;
    const mode = p.mode_catalog.find((item) => item.code === p.effective_mode);
    const strength = summary.strongest_component;
    const gap = summary.priority_gap_component;
    const ranked = profile.rank != null;
    const fallback = p.fallback;
    return `<section class="htei-hero" aria-labelledby="hteiTitle">
      <div class="htei-hero-main">
        <div class="htei-hero-copy">
          <div class="htei-identity-line"><span>HTEI v6</span><i></i><span>${esc(text(ctx, "авторский индекс проекта", "project composite index"))}</span></div>
          <h1 id="hteiTitle">${esc(text(ctx, "Технологические кадры — от занятости до результата", "Technology workforce — from employment to outcomes"))}</h1>
          <p>${esc(text(ctx,
            "Индекс объединяет структуру занятости, технологические профессии, кадровое ядро НИОКР, образовательный поток, результаты экономики и участие бизнеса в исследованиях. Режимы расчёта позволяют отделить строгую сопоставимость от максимально полного диагностического профиля.",
            "The index connects employment structure, technology-intensive occupations, the R&D workforce, the education pipeline, economic outputs and business participation in research. Calculation modes separate strict comparability from the fullest diagnostic profile."
          ))}</p>
          ${fallback ? `<div class="htei-fallback"><strong>${esc(text(ctx, "Почему показан другой режим", "Why another mode is shown"))}</strong><span>${esc(localized(ctx, fallback, "reason"))} ${esc(text(ctx, `Показан режим «${modeName(ctx, mode)}».`, `The “${modeName(ctx, mode)}” mode is shown instead.`))}</span></div>` : ""}
          <div class="htei-hero-actions">
            <button type="button" class="htei-button htei-button-primary" data-htei-scroll="composition">${esc(text(ctx, "Разобрать оценку", "Decompose the score"))}</button>
            <button type="button" class="htei-button" data-htei-provenance="${esc(profile.value_id)}">${esc(text(ctx, "Проверить происхождение", "Inspect provenance"))}</button>
            <button type="button" class="htei-button htei-button-quiet" data-htei-scroll="evidence">${esc(text(ctx, "Формула и источники", "Formula and sources"))}</button>
          </div>
        </div>
        <div class="htei-hero-findings" aria-label="${esc(text(ctx, "Ключевые выводы", "Key findings"))}">
          <article><span>${esc(text(ctx, "Сильнейший компонент", "Strongest component"))}</span><strong>${esc(componentName(ctx, strength))}</strong><small>${fmt(strength?.normalized_score, 1)} / 100</small></article>
          <article><span>${esc(text(ctx, "Главный измеряемый разрыв", "Largest measured gap"))}</span><strong>${esc(componentName(ctx, gap))}</strong><small>${esc(text(ctx, `${fmt(Math.abs(gap?.gap_to_top10), 1)} пункта до среднего top-10`, `${fmt(Math.abs(gap?.gap_to_top10), 1)} points below the top-10 mean`))}</small></article>
        </div>
      </div>
      <aside class="htei-result-card" aria-label="${esc(text(ctx, "Результат выбранной страны", "Selected-country result"))}">
        <div class="htei-country-heading">${flag(country, "htei-country-flag")}<div><span>${esc(modeShort(ctx, mode))}</span><h2>${esc(countryName(ctx, country))}</h2></div></div>
        <div class="htei-score-line"><strong>${fmt(profile.score, 1)}</strong><span>${esc(text(ctx, "из 100", "out of 100"))}</span></div>
        <div class="htei-position-line">${ranked ? `<b>${esc(text(ctx, `${profile.rank}-е место из ${p.ranking_total}`, `Rank ${profile.rank} of ${p.ranking_total}`))}</b><span>${esc(text(ctx, `${fmt(profile.percentile, 0)}-й процентиль`, `${fmt(profile.percentile, 0)}th percentile`))}</span>` : `<b>${esc(text(ctx, "Диагностический профиль", "Diagnostic profile"))}</b><span>${esc(text(ctx, "международное место не присваивается", "no international rank is assigned"))}</span>`}</div>
        ${scoreInterval(ctx, profile)}
        <div class="htei-result-grid">
          ${resultMetric(text(ctx, "Доверие к данным", "Evidence confidence"), `${fmt(profile.confidence_score * 100, 0)}%`, text(ctx, "публикуется отдельно от score", "reported separately from score"))}
          ${resultMetric(text(ctx, "Покрытие", "Coverage"), `${intFmt(profile.available_components)} / 6`, `${fmt(profile.available_weight * 100, 0)}% ${text(ctx, "веса", "of weight")}`)}
          ${resultMetric(text(ctx, "Фактические годы", "Source years"), `${profile.oldest_source_year}–${profile.newest_source_year}`, text(ctx, `средний лаг ${fmt(profile.average_lag, 1)} г.`, `average lag ${fmt(profile.average_lag, 1)} y.`))}
          ${resultMetric(text(ctx, "Статус свежести", "Freshness status"), freshnessLabel(ctx, profile.freshness_class), text(ctx, `${summary.stale_component_count} компонентов требуют внимания`, `${summary.stale_component_count} components need attention`))}
        </div>
        <div class="htei-score-proof"><span>${esc(text(ctx, "Проверка арифметики", "Arithmetic check"))}</span><strong>${fmt(summary.contribution_sum, 3)} = ${fmt(profile.score, 3)}</strong><small>${esc(text(ctx, `максимальная ошибка ${fmt(summary.score_reconciliation_error, 8)}`, `maximum error ${fmt(summary.score_reconciliation_error, 8)}`))}</small></div>
      </aside>
    </section>`;
  }

  function resultMetric(label, value, note) {
    return `<div><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(note)}</small></div>`;
  }

  function scoreInterval(ctx, profile) {
    if (profile.score_low == null || profile.score_high == null) {
      return `<div class="htei-interval htei-interval-empty"><span>${esc(text(ctx, "Интервал неопределённости", "Uncertainty interval"))}</span><b>${esc(text(ctx, "Не публикуется для диагностического профиля", "Not published for the diagnostic profile"))}</b></div>`;
    }
    const low = clamp(profile.score_low);
    const high = clamp(profile.score_high);
    const score = clamp(profile.score);
    return `<div class="htei-interval"><div><span>${esc(text(ctx, "Интервал оценки", "Score interval"))}</span><b>${fmt(profile.score_low, 1)}–${fmt(profile.score_high, 1)}</b><small>${profile.rank_low != null ? esc(text(ctx, `возможное место ${profile.rank_low}–${profile.rank_high}`, `possible rank ${profile.rank_low}–${profile.rank_high}`)) : ""}</small></div><div class="htei-interval-track" aria-hidden="true"><i style="left:${low}%;width:${Math.max(1, high-low)}%"></i><em style="left:${score}%"></em></div></div>`;
  }

  function freshnessLabel(ctx, value) {
    const labels = {
      current: ["актуальные", "current"],
      recent: ["в основном актуальные", "mostly current"],
      mixed: ["смешанная свежесть", "mixed freshness"],
      stale: ["требуется обновление", "update required"],
    };
    const pair = labels[value] || [String(value || "—"), String(value || "—")];
    return ctx.lang === "ru" ? pair[0] : pair[1];
  }

  function jumpNav(ctx) {
    const items = [
      ["modes", text(ctx, "Режимы", "Modes")],
      ["composition", text(ctx, "Состав оценки", "Score anatomy")],
      ["quality", text(ctx, "Качество данных", "Data quality")],
      ["comparison", text(ctx, "Сопоставимость", "Comparability")],
      ["evidence", text(ctx, "Источники", "Evidence")],
      ["world", text(ctx, "Международный контур", "International field")],
    ];
    return `<nav class="htei-jump-nav" aria-label="${esc(text(ctx, "Навигация по исследованию HTEI", "HTEI research navigation"))}">${items.map(([id, label]) => `<button type="button" data-htei-scroll="${id}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function sectionHead(ctx, number, title, description, aside = "") {
    return `<div class="htei-section-head"><div><span>${esc(number)}</span><h2>${esc(title)}</h2></div><p>${esc(description)}</p>${aside}</div>`;
  }

  function modeSection(ctx) {
    const p = ctx.payload;
    return `<section class="htei-section" id="htei-modes" data-htei-section="modes">
      ${sectionHead(ctx, "01", text(ctx, "Четыре режима — четыре исследовательских вопроса", "Four modes — four research questions"), text(ctx, "Режимы не являются переключателями «лучшего» и «худшего» результата. Они меняют строгость данных, компонентный состав, охват стран и допустимость международного места.", "The modes are not switches between a better and worse result. They change data strictness, component structure, country coverage and whether an international rank is methodologically valid."))}
      <div class="htei-mode-grid">${p.mode_catalog.map((item) => modeCard(ctx, item)).join("")}</div>
      <div class="htei-mode-principle"><strong>${esc(text(ctx, "Принцип публикации", "Publication principle"))}</strong><p>${esc(text(ctx, "Substantive score рассчитывается только из содержательных компонентов. Доверие, полнота, свежесть и тип proxy показываются рядом и не превращаются в скрытый штраф к результату.", "The substantive score is calculated only from substantive components. Confidence, completeness, freshness and proxy status are shown alongside it and never become a hidden penalty."))}</p></div>
    </section>`;
  }

  function modeCard(ctx, item) {
    const active = item.code === ctx.payload.effective_mode;
    const available = item.available_for_country;
    return `<button type="button" class="htei-mode-card ${active ? "is-active" : ""} ${available ? "" : "is-unavailable"}" data-htei-mode="${esc(item.code)}" data-htei-available="${available}" aria-pressed="${active}">
      <span class="htei-mode-top"><i>${esc(item.code.replaceAll("_", " "))}</i><b>${available ? esc(text(ctx, "доступен", "available")) : esc(text(ctx, "нет профиля", "not available"))}</b></span>
      <h3>${esc(modeName(ctx, item))}</h3>
      <p>${esc(modeDescription(ctx, item))}</p>
      <div class="htei-mode-stats"><span><small>${esc(text(ctx, "Страны", "Countries"))}</small><strong>${intFmt(item.countries)}</strong></span><span><small>${esc(text(ctx, "Компоненты", "Components"))}</small><strong>${item.min_components === item.max_components ? intFmt(item.max_components) : `${item.min_components}–${item.max_components}`}</strong></span><span><small>${esc(text(ctx, "Средний лаг", "Mean lag"))}</small><strong>${fmt(item.mean_lag, 1)}</strong></span></div>
      <div class="htei-mode-question">${esc(localized(ctx, item, "comparison_question"))}</div>
      ${!available ? `<small class="htei-mode-reason">${esc(modeReason(ctx, item))}</small>` : ""}
    </button>`;
  }

  function compositionSection(ctx) {
    const p = ctx.payload;
    const components = p.components;
    return `<section class="htei-section" id="htei-composition" data-htei-section="composition">
      ${sectionHead(ctx, "02", text(ctx, "Из чего складывается итоговая оценка", "What builds the final score"), text(ctx, "Каждый компонент показан одновременно как исходное наблюдение, нормированный score, вес, вклад в HTEI и разрыв до международного ориентира.", "Each component is presented as a source observation, normalised score, weight, contribution to HTEI and gap to an international benchmark."))}
      <div class="htei-composition-layout"><div class="htei-contribution-panel">${contributionChart(ctx, components)}${compositionInsights(ctx)}</div><div class="htei-formula-panel">${formulaSummary(ctx)}</div></div>
      <div class="htei-component-list">${components.map((item, index) => componentRow(ctx, item, index)).join("")}</div>
    </section>`;
  }

  function contributionChart(ctx, components) {
    const total = Math.max(1, components.reduce((sum, item) => sum + Number(item.weighted_contribution || 0), 0));
    let cursor = 0;
    const segments = components.map((item, index) => {
      const width = Number(item.weighted_contribution || 0) / total * 100;
      const html = `<i style="left:${cursor}%;width:${width}%;--segment:${index}" title="${esc(componentShort(ctx, item))}: ${fmt(item.weighted_contribution, 2)}"></i>`;
      cursor += width;
      return html;
    }).join("");
    return `<div class="htei-contribution"><div class="htei-contribution-head"><span>${esc(text(ctx, "Взвешенный вклад в HTEI", "Weighted contribution to HTEI"))}</span><strong>${fmt(total, 2)}</strong></div><div class="htei-contribution-track">${segments}</div><div class="htei-contribution-legend">${components.map((item, index) => `<span><i style="--segment:${index}"></i><b>${esc(componentShort(ctx, item))}</b><em>${fmt(item.weighted_contribution, 1)}</em></span>`).join("")}</div></div>`;
  }

  function compositionInsights(ctx) {
    const p = ctx.payload;
    const strongest = p.summary.strongest_component;
    const gap = p.summary.priority_gap_component;
    return `<div class="htei-composition-insights"><article><span>${esc(text(ctx, "Наибольший вклад", "Largest contribution"))}</span><strong>${esc(componentName(ctx, [...p.components].sort((a,b)=>b.weighted_contribution-a.weighted_contribution)[0]))}</strong><small>${fmt([...p.components].sort((a,b)=>b.weighted_contribution-a.weighted_contribution)[0]?.weighted_contribution, 1)} ${esc(text(ctx, "пункта HTEI", "HTEI points"))}</small></article><article><span>${esc(text(ctx, "Наиболее высокая позиция", "Highest relative position"))}</span><strong>${esc(componentName(ctx, strongest))}</strong><small>${strongest?.benchmark?.rank ? esc(text(ctx, `${strongest.benchmark.rank}-е место из ${strongest.benchmark.universe_count}`, `Rank ${strongest.benchmark.rank} of ${strongest.benchmark.universe_count}`)) : "—"}</small></article><article><span>${esc(text(ctx, "Наибольший потенциал", "Largest improvement potential"))}</span><strong>${esc(componentName(ctx, gap))}</strong><small>${esc(text(ctx, `${fmt(Math.abs(gap?.gap_to_top10),1)} пункта до top-10`, `${fmt(Math.abs(gap?.gap_to_top10),1)} points to top 10`))}</small></article></div>`;
  }

  function formulaSummary(ctx) {
    const formula = ctx.payload.formula;
    return `<div class="htei-formula-summary"><span>${esc(text(ctx, "Формула выбранного режима", "Formula for the selected mode"))}</span><h3>${esc(ctx.payload.profile.formula_version)}</h3><p>${esc(ctx.lang === "ru" ? formula.expression_ru : formula.expression_en)}</p><div class="htei-formula-rule"><b>${esc(text(ctx, "Важно", "Important"))}</b><span>${esc(text(ctx, "Вес качества данных не входит в сумму. Интервалы и confidence служат для интерпретации, а не для изменения score.", "Data-quality weight is not part of the sum. Intervals and confidence support interpretation rather than changing the score."))}</span></div><button type="button" class="htei-text-button" data-htei-scroll="evidence">${esc(text(ctx, "Открыть методические детали", "Open methodological details"))} →</button></div>`;
  }

  function componentRow(ctx, item, index) {
    const benchmark = item.benchmark || {};
    const score = clamp(item.normalized_score);
    const median = clamp(benchmark.median);
    const top10 = clamp(benchmark.top10_mean);
    const proxyLabel = item.proxy_kind === "direct"
      ? text(ctx, "прямой показатель", "direct measure")
      : item.proxy_kind === "mixed"
        ? text(ctx, "смешанный слой", "mixed layer")
        : text(ctx, "сопоставимый proxy", "comparable proxy");
    const freshness = (item.data_lag || 0) <= 1 ? "current" : (item.data_lag || 0) <= 3 ? "recent" : "stale";
    return `<article class="htei-component" data-component="${esc(item.component_code)}">
      <div class="htei-component-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="htei-component-main">
        <div class="htei-component-heading"><div><span>${esc(item.component_code)}</span><h3>${esc(componentName(ctx, item))}</h3></div><div class="htei-component-tags"><span class="htei-source-kind ${esc(item.proxy_kind)}">${esc(proxyLabel)}</span><span class="htei-freshness ${freshness}">${item.source_data_year} · ${esc(text(ctx, `лаг ${item.data_lag} г.`, `lag ${item.data_lag} y.`))}</span></div></div>
        <p>${esc(componentMeaning(ctx, item))}</p>
        <div class="htei-component-scale"><div class="htei-scale-labels"><span>0</span><span>${esc(text(ctx, "медиана", "median"))} ${fmt(benchmark.median,1)}</span><span>top-10 ${fmt(benchmark.top10_mean,1)}</span><span>100</span></div><div class="htei-scale-track"><i class="median" style="left:${median}%"></i><i class="top10" style="left:${top10}%"></i><em style="width:${score}%"></em><b style="left:${score}%"></b></div></div>
        <div class="htei-component-facts">
          <div><span>${esc(text(ctx, "Исходное значение", "Source value"))}</span><strong>${fmt(item.raw_value, rawDigits(item))}</strong><small>${esc(unitLabel(ctx, item))}</small></div>
          <div><span>${esc(text(ctx, "Нормированный score", "Normalised score"))}</span><strong>${fmt(item.normalized_score,1)}</strong><small>${benchmark.rank ? esc(text(ctx, `${benchmark.rank}-е место из ${benchmark.universe_count}`, `Rank ${benchmark.rank} of ${benchmark.universe_count}`)) : "—"}</small></div>
          <div><span>${esc(text(ctx, "Вес", "Weight"))}</span><strong>${fmt(item.effective_weight*100,0)}%</strong><small>${esc(text(ctx, "в выбранном режиме", "in selected mode"))}</small></div>
          <div><span>${esc(text(ctx, "Вклад", "Contribution"))}</span><strong>${fmt(item.weighted_contribution,2)}</strong><small>${esc(text(ctx, "пункта HTEI", "HTEI points"))}</small></div>
          <div><span>${esc(text(ctx, "Источник", "Source"))}</span><strong>${esc(sourceName(ctx,item))}</strong><small>${esc(item.indicator_code || "")}</small></div>
          <div><span>${esc(text(ctx, "Разрыв до top-10", "Gap to top 10"))}</span><strong class="${Number(item.gap_to_top10) < 0 ? "negative" : "positive"}">${Number(item.gap_to_top10) > 0 ? "+" : ""}${fmt(item.gap_to_top10,1)}</strong><small>${esc(text(ctx, "пунктов score", "score points"))}</small></div>
        </div>
        <details class="htei-component-method"><summary>${esc(text(ctx, "Как показатель отобран и интерпретируется", "How the measure is selected and interpreted"))}</summary><div><p>${esc(ctx.lang === "ru" ? item.interpretation_ru : item.interpretation_en)}</p><dl><dt>${esc(text(ctx, "Правило отбора", "Selection rule"))}</dt><dd>${esc(item.selection_rule)}</dd><dt>${esc(text(ctx, "Quality flag", "Quality flag"))}</dt><dd>${esc(item.quality_flag)}</dd><dt>${esc(text(ctx, "Raw snapshot", "Raw snapshot"))}</dt><dd>${esc(item.raw_snapshot_path)}</dd></dl></div></details>
      </div>
      <button type="button" class="htei-evidence-button" data-htei-provenance="${esc(item.value_id)}">${esc(text(ctx, "Доказательство", "Evidence"))} ↗</button>
    </article>`;
  }

  function rawDigits(item) {
    if (item.unit?.includes("per_million")) return 0;
    if (item.unit?.includes("percent")) return 2;
    return 2;
  }

  function qualitySection(ctx) {
    const p = ctx.payload;
    return `<section class="htei-section" id="htei-quality" data-htei-section="quality">
      ${sectionHead(ctx, "03", text(ctx, "Свежесть, полнота и неопределённость", "Freshness, completeness and uncertainty"), text(ctx, "Качество доказательной базы не скрывается внутри результата. Пользователь видит, какие компоненты актуальны, где есть временной лаг и насколько устойчивы score и место.", "Evidence quality is not hidden inside the result. The user can see which components are current, where temporal lags exist and how stable the score and rank are."))}
      <div class="htei-quality-grid"><div class="htei-quality-main">${uncertaintyPanel(ctx)}${freshnessPanel(ctx)}</div><div class="htei-distribution-card">${distributionPanel(ctx)}</div></div>
      <div class="htei-quality-principles">${qualityPrinciple(text(ctx,"Содержательный результат","Substantive result"),text(ctx,"Сумма взвешенных компонентных scores. Не штрафуется за качество данных скрытым коэффициентом.","Sum of weighted component scores. It is never penalised by a hidden data-quality coefficient."),"01")}${qualityPrinciple(text(ctx,"Доверие к данным","Evidence confidence"),text(ctx,"Отдельная характеристика происхождения, полноты и методического уровня наблюдений.","A separate characteristic of provenance, completeness and methodological tier."),"02")}${qualityPrinciple(text(ctx,"Свежесть","Freshness"),text(ctx,"Фактический год публикуется для каждого компонента, а не маскируется единым годом релиза.","The source year is published for every component rather than hidden behind a single release year."),"03")}</div>
    </section>`;
  }

  function qualityPrinciple(title, body, number) {
    return `<article><b>${number}</b><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
  }

  function uncertaintyPanel(ctx) {
    const p = ctx.payload;
    const profile = p.profile;
    const has = profile.score_low != null && profile.score_high != null;
    return `<div class="htei-quality-card"><div class="htei-card-title"><span>${esc(text(ctx,"Неопределённость","Uncertainty"))}</span><strong>${has ? `${fmt(profile.score_low,1)}–${fmt(profile.score_high,1)}` : "—"}</strong></div>${has ? `<div class="htei-uncertainty-scale"><span>0</span><div><i style="left:${clamp(profile.score_low)}%;width:${Math.max(1,profile.score_high-profile.score_low)}%"></i><em style="left:${clamp(profile.score)}%"></em></div><span>100</span></div><p>${esc(text(ctx, `При повторном расчёте в допустимых границах методики оценка остаётся в интервале ${fmt(profile.score_low,1)}–${fmt(profile.score_high,1)}, а место — ${profile.rank_low}–${profile.rank_high}.`, `Under admissible methodological variation the score remains within ${fmt(profile.score_low,1)}–${fmt(profile.score_high,1)}, while the rank remains ${profile.rank_low}–${profile.rank_high}.`))}</p>` : `<p>${esc(text(ctx,"ASOF-профиль не получает синхронного международного места, поэтому интервал ранга для него не публикуется.","The ASOF profile receives no synchronous international rank, so no rank interval is published."))}</p>`}</div>`;
  }

  function freshnessPanel(ctx) {
    const components = [...ctx.payload.components].sort((a,b)=>(b.source_data_year||0)-(a.source_data_year||0));
    const years = components.map(x=>Number(x.source_data_year)).filter(Number.isFinite);
    const actualMin = years.length ? Math.min(...years) : Number(ctx.payload.release_year);
    const actualMax = years.length ? Math.max(...years) : Number(ctx.payload.release_year);
    const axisMin = actualMin;
    const axisMax = Math.max(actualMax, Number(ctx.payload.release_year));
    const range = Math.max(1, axisMax-axisMin);
    return `<div class="htei-quality-card"><div class="htei-card-title"><span>${esc(text(ctx,"Фактические годы компонентов","Component source years"))}</span><strong>${actualMin}–${actualMax}</strong></div><div class="htei-freshness-chart"><div class="htei-freshness-axis"><span>${axisMin}</span><span>${Math.round((axisMin+axisMax)/2)}</span><span>${axisMax}</span></div>${components.map(item=>{const pos=(item.source_data_year-axisMin)/range*100;const status=(item.data_lag||0)<=1?"current":(item.data_lag||0)<=3?"recent":"stale";return `<div class="htei-freshness-row"><span>${esc(componentShort(ctx,item))}</span><div><i class="${status}" style="left:${pos}%"></i></div><b>${item.source_data_year}</b></div>`}).join("")}</div><p>${esc(text(ctx,"Разные годы не усредняются и не скрываются: для каждого компонента сохранены исходный год, лаг и snapshot.","Different source years are neither averaged nor hidden: the original year, lag and snapshot are retained for every component."))}</p></div>`;
  }

  function distributionPanel(ctx) {
    const p = ctx.payload;
    const d = p.distribution;
    const score = p.profile.score;
    const min = Number(d.minimum || 0), max = Number(d.maximum || 100), span = Math.max(1, max-min);
    const position = clamp((score-min)/span*100);
    const q25 = clamp((d.q25-min)/span*100), median = clamp((d.median-min)/span*100), q75 = clamp((d.q75-min)/span*100);
    return `<div class="htei-card-title"><span>${esc(text(ctx,"Положение в распределении","Position in the distribution"))}</span><strong>${p.profile.rank != null ? `#${p.profile.rank}` : fmt(score,1)}</strong></div><div class="htei-boxplot"><span>${fmt(min,1)}</span><div><i style="left:${q25}%;width:${Math.max(1,q75-q25)}%"></i><em style="left:${median}%"></em><b style="left:${position}%"></b></div><span>${fmt(max,1)}</span></div><div class="htei-distribution-stats"><div><span>${esc(text(ctx,"Медиана режима","Mode median"))}</span><strong>${fmt(d.median,1)}</strong></div><div><span>${esc(text(ctx,"Верхний квартиль","Upper quartile"))}</span><strong>${fmt(d.q75,1)}</strong></div><div><span>${esc(text(ctx,"Среднее","Mean"))}</span><strong>${fmt(d.mean,1)}</strong></div><div><span>${esc(text(ctx,"Стран","Countries"))}</span><strong>${intFmt(p.ranking_total)}</strong></div></div><p>${esc(text(ctx,"Распределение относится только к выбранному методическому режиму. Scores разных режимов нельзя механически объединять в одну рейтинговую вселенную.","The distribution belongs only to the selected methodological mode. Scores from different modes should not be mechanically combined into one ranking universe."))}</p>`;
  }

  function comparisonSection(ctx) {
    const comparisons = ctx.payload.comparisons || [];
    if (!comparisons.length) return "";
    ui.comparisonIndex = Math.min(ui.comparisonIndex, comparisons.length - 1);
    const active = comparisons[ui.comparisonIndex];
    const left = ctx.payload.mode_catalog.find(m=>m.code===active.left_mode);
    const right = ctx.payload.mode_catalog.find(m=>m.code===active.right_mode);
    return `<section class="htei-section" id="htei-comparison" data-htei-section="comparison">
      ${sectionHead(ctx, "04", text(ctx,"Насколько устойчив результат к методическому режиму","How robust is the result across methodological modes"), text(ctx,"Сопоставление строится только для стран, присутствующих одновременно в обоих рейтингах. Высокая корреляция не отменяет индивидуальных отклонений — они остаются видимыми на scatterplot.","The comparison uses only countries present in both rankings. A high correlation does not erase individual deviations — they remain visible in the scatter plot."))}
      <div class="htei-comparison-tabs" role="tablist">${comparisons.map((item,index)=>{const l=ctx.payload.mode_catalog.find(m=>m.code===item.left_mode);const r=ctx.payload.mode_catalog.find(m=>m.code===item.right_mode);return `<button type="button" role="tab" aria-selected="${index===ui.comparisonIndex}" data-htei-comparison="${index}">${esc(modeShort(ctx,l))}<span>↔</span>${esc(modeShort(ctx,r))}</button>`}).join("")}</div>
      <div class="htei-comparison-layout"><div class="htei-scatter-card">${scatterPlot(ctx,active,left,right)}</div><aside class="htei-comparison-metrics"><h3>${esc(modeShort(ctx,left))} ↔ ${esc(modeShort(ctx,right))}</h3><p>${esc(text(ctx,`Совпадающих стран: ${active.n}.`,`Countries present in both modes: ${active.n}.`))}</p>${comparisonMetric(text(ctx,"Корреляция scores","Score correlation"),active.score_pearson)}${comparisonMetric(text(ctx,"Корреляция мест","Rank correlation"),active.rank_spearman)}${comparisonMetric(text(ctx,"Среднее различие score","Mean score difference"),active.mean_absolute_score_difference)}${comparisonMetric(text(ctx,"Среднее изменение места","Mean rank difference"),active.mean_absolute_rank_difference)}<div class="htei-comparison-note">${comparisonCountryNote(ctx,active,left,right)}</div></aside></div>
    </section>`;
  }

  function comparisonMetric(label,value){return `<div><span>${esc(label)}</span><strong>${fmt(value,3)}</strong></div>`;}
  function comparisonCountryNote(ctx,comparison,left,right){const point=comparison.points.find(p=>p.iso3===ctx.payload.country.iso3);if(point)return `<strong>${esc(countryName(ctx,ctx.payload.country))}</strong><span>${esc(text(ctx,`${modeShort(ctx,left)}: ${fmt(point.left_score,1)} · ${modeShort(ctx,right)}: ${fmt(point.right_score,1)}.`,` ${modeShort(ctx,left)}: ${fmt(point.left_score,1)} · ${modeShort(ctx,right)}: ${fmt(point.right_score,1)}.`))}</span>`;return `<strong>${esc(countryName(ctx,ctx.payload.country))}</strong><span>${esc(text(ctx,"не входит одновременно в обе сравнительные вселенные. Это отсутствие данных, а не нулевой результат.","is not present in both comparison universes. This is missing eligibility, not a zero result."))}</span>`;}

  function scatterPlot(ctx, comparison, left, right) {
    const points = comparison.points || [];
    if (!points.length) return "";
    const values = points.flatMap(item=>[Number(item.left_score),Number(item.right_score)]).filter(Number.isFinite);
    const min = Math.min(...values), max = Math.max(...values), pad = Math.max(2,(max-min)*.08);
    const x0=min-pad,x1=max+pad,y0=min-pad,y1=max+pad;
    const W=760,H=470,m={l:62,r:28,t:28,b:62};
    const x=v=>m.l+(Number(v)-x0)/(x1-x0||1)*(W-m.l-m.r);
    const y=v=>H-m.b-(Number(v)-y0)/(y1-y0||1)*(H-m.t-m.b);
    const ticks=Array.from({length:6},(_,i)=>x0+(x1-x0)*i/5);
    let svg="";
    ticks.forEach(v=>{svg+=`<line x1="${x(v)}" x2="${x(v)}" y1="${m.t}" y2="${H-m.b}" class="htei-chart-grid"/><line x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}" class="htei-chart-grid"/><text x="${x(v)}" y="${H-m.b+22}" text-anchor="middle" class="htei-chart-label">${fmt(v,0)}</text><text x="${m.l-9}" y="${y(v)+4}" text-anchor="end" class="htei-chart-label">${fmt(v,0)}</text>`});
    svg+=`<line x1="${x(x0)}" y1="${y(x0)}" x2="${x(x1)}" y2="${y(x1)}" class="htei-equality-line"/>`;
    points.forEach(point=>{const selected=point.iso3===ctx.payload.country.iso3;svg+=`<circle cx="${x(point.left_score)}" cy="${y(point.right_score)}" r="${selected?7:4.2}" class="htei-scatter-point ${selected?"selected":""}" tabindex="0"><title>${esc((ctx.lang==='ru'?point.name_ru:point.name_en)||point.iso3)} (${point.iso3})\n${esc(modeShort(ctx,left))}: ${fmt(point.left_score,1)} · #${point.left_rank}\n${esc(modeShort(ctx,right))}: ${fmt(point.right_score,1)} · #${point.right_rank}</title></circle>`;if(selected)svg+=`<text x="${x(point.left_score)+10}" y="${y(point.right_score)-9}" class="htei-scatter-label">${esc(point.iso3)}</text>`});
    svg+=`<text x="${(m.l+W-m.r)/2}" y="${H-12}" text-anchor="middle" class="htei-chart-axis-label">${esc(modeName(ctx,left))}</text><text transform="translate(17 ${(m.t+H-m.b)/2}) rotate(-90)" text-anchor="middle" class="htei-chart-axis-label">${esc(modeName(ctx,right))}</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(text(ctx,"Сопоставление scores двух режимов HTEI","Comparison of HTEI scores across two modes"))}">${svg}</svg>`;
  }

  function evidenceSection(ctx) {
    const p=ctx.payload;
    return `<section class="htei-section" id="htei-evidence" data-htei-section="evidence">
      ${sectionHead(ctx,"05",text(ctx,"От исходного наблюдения до HTEI","From source observation to HTEI"),text(ctx,"Каждый компонент сохраняет организацию-источник, показатель, фактический год, snapshot, контрольную сумму и правило отбора. Формула и статистический аудит публикуются рядом.","Every component retains its source organisation, indicator, source year, snapshot, checksum and selection rule. The formula and statistical audit are published alongside it."))}
      <div class="htei-lineage"><div class="htei-lineage-head"><span>${esc(text(ctx,"Источник","Source"))}</span><span>${esc(text(ctx,"Исходный показатель","Source indicator"))}</span><span>${esc(text(ctx,"Компонент","Component"))}</span><span>${esc(text(ctx,"Вклад","Contribution"))}</span><span>HTEI</span></div>${p.components.map(item=>`<div class="htei-lineage-row"><div><strong>${esc(sourceName(ctx,item))}</strong><small>${item.source_data_year} · ${esc(item.source_id)}</small></div><div><strong>${esc(item.indicator_code)}</strong><small>${fmt(item.raw_value,rawDigits(item))} ${esc(unitLabel(ctx,item))}</small></div><div><strong>${esc(componentShort(ctx,item))}</strong><small>${fmt(item.normalized_score,1)} / 100 · ${fmt(item.effective_weight*100,0)}%</small></div><div><strong>+${fmt(item.weighted_contribution,2)}</strong><small>${esc(text(ctx,"пункта","points"))}</small></div><button type="button" class="htei-evidence-button" data-htei-provenance="${esc(item.value_id)}">${esc(text(ctx,"Проверить","Inspect"))} ↗</button></div>`).join("")}<div class="htei-lineage-total"><span>${esc(text(ctx,"Сумма вкладов","Sum of contributions"))}</span><strong>${fmt(p.summary.contribution_sum,3)} / 100</strong><button type="button" class="htei-evidence-button" data-htei-provenance="${esc(p.profile.value_id)}">${esc(text(ctx,"Provenance профиля","Profile provenance"))} ↗</button></div></div>
      <div class="htei-method-grid"><article class="htei-method-card"><span>${esc(text(ctx,"Формула","Formula"))}</span><h3>${esc(p.profile.formula_version)}</h3><p>${esc(ctx.lang==='ru'?p.formula.expression_ru:p.formula.expression_en)}</p><details><summary>${esc(text(ctx,"Нормирование и ограничения","Normalisation and limitations"))}</summary><p>${esc(ctx.lang==='ru'?p.formula.normalization_ru:p.formula.normalization_en)}</p><p>${esc(ctx.lang==='ru'?p.formula.method_notes_ru:p.formula.method_notes_en)}</p></details></article><article class="htei-method-card"><span>${esc(text(ctx,"Статистическая устойчивость","Statistical robustness"))}</span><h3>${p.audit?.sensitivity_passed?esc(text(ctx,"Внутренний аудит пройден","Internal audit passed")):esc(text(ctx,"Нет результата аудита","No audit result"))}</h3><div class="htei-audit-grid"><div><small>${esc(text(ctx,"Сценарии","Runs"))}</small><strong>${intFmt(p.audit?.run_count)}</strong></div><div><small>Spearman mean</small><strong>${fmt(p.audit?.mean_spearman,3)}</strong></div><div><small>Spearman min</small><strong>${fmt(p.audit?.min_spearman,3)}</strong></div><div><small>${esc(text(ctx,"Среднее изменение места","Mean rank change"))}</small><strong>${fmt(p.audit?.mean_absolute_rank_change,2)}</strong></div></div><p>${esc(text(ctx,"Аудит варьирует веса, нормирование и состав компонентов. Он проверяет устойчивость методики, но не превращает альтернативные сценарии в официальный рейтинг.","The audit varies weights, normalisation and component composition. It tests methodological robustness but does not turn alternative scenarios into an official ranking."))}</p></article></div>
      <div class="htei-source-register"><h3>${esc(text(ctx,"Организации-источники выбранного профиля","Source organisations in the selected profile"))}</h3><div>${p.sources.map(source=>`<article><span>${esc(source.source_id)}</span><strong>${esc(ctx.lang==='ru'?source.name_ru:source.name_en)}</strong><small>${source.oldest_source_year}–${source.newest_source_year} · ${source.component_count} ${esc(text(ctx,"комп.","comp."))}</small>${source.source_url?`<a href="${esc(source.source_url)}" target="_blank" rel="noopener">${esc(text(ctx,"Официальный источник","Official source"))} ↗</a>`:""}</article>`).join("")}</div></div>
    </section>`;
  }

  function worldSection(ctx) {
    return `<section class="htei-section" id="htei-world" data-htei-section="world">
      ${sectionHead(ctx,"06",text(ctx,"Международное поле выбранного режима","International field for the selected mode"),text(ctx,"Карта и рейтинг используют одну и ту же методическую вселенную. Для ASOF показывается диагностическое покрытие без порядковых мест.","The map and table use the same methodological universe. ASOF shows diagnostic coverage without ordinal ranks."),`<a class="htei-button" href="/api/htei/workspace.csv?mode=${esc(ctx.payload.effective_mode)}" ${ctx.payload.ranking_is_synchronous?"":"aria-disabled=\"true\" tabindex=\"-1\""}>${esc(text(ctx,"Скачать CSV режима","Download mode CSV"))}</a>`)}
      <div class="htei-world-layout"><div class="htei-map-panel"><div class="htei-map-title"><h3>${esc(text(ctx,"География HTEI","HTEI geography"))}</h3><span>${esc(modeShort(ctx,ctx.payload.mode_catalog.find(m=>m.code===ctx.payload.effective_mode)))}</span></div><div class="htei-map-wrap">${ctx.mapHtml || `<p>${esc(text(ctx,"Карта загружается…","Map is loading…"))}</p>`}</div></div><div class="htei-ranking-panel">${rankingPanel(ctx)}</div></div>
    </section>`;
  }

  function rankingPanel(ctx) {
    const p=ctx.payload;
    const q=ui.search.trim().toLowerCase();
    const filtered=p.ranking.filter(item=>!q||`${item.iso3} ${item.name_ru} ${item.name_en}`.toLowerCase().includes(q));
    const pages=Math.max(1,Math.ceil(filtered.length/ui.pageSize));
    ui.page=Math.min(ui.page,pages-1);
    const start=ui.page*ui.pageSize;
    const rows=filtered.slice(start,start+ui.pageSize);
    return `<div class="htei-ranking-head"><div><h3>${esc(p.ranking_is_synchronous?text(ctx,"Рейтинг стран","Country ranking"):text(ctx,"Диагностическое покрытие","Diagnostic coverage"))}</h3><span>${intFmt(filtered.length)} ${esc(text(ctx,"стран","countries"))}</span></div><label><span>${esc(text(ctx,"Поиск","Search"))}</span><input type="search" value="${esc(ui.search)}" data-htei-ranking-search aria-label="${esc(text(ctx,"Поиск страны или ISO-кода","Search country or ISO code"))}"></label></div><div class="htei-ranking-table-wrap"><table class="htei-ranking-table"><thead><tr>${p.ranking_is_synchronous?`<th>${esc(text(ctx,"Место","Rank"))}</th>`:""}<th>${esc(text(ctx,"Страна","Country"))}</th><th>HTEI</th><th>${esc(text(ctx,"Доверие","Confidence"))}</th><th>${esc(text(ctx,"Годы","Years"))}</th></tr></thead><tbody>${rows.map(item=>`<tr class="${item.iso3===p.country.iso3?"is-selected":""}">${p.ranking_is_synchronous?`<td><span>${item.rank}</span></td>`:""}<td><button type="button" data-htei-country="${esc(item.iso3)}">${flag(item,"htei-table-flag")}<span><strong>${esc(countryName(ctx,item))}</strong><small>${esc(item.iso3)}</small></span></button></td><td><strong>${fmt(item.score,1)}</strong>${item.percentile!=null?`<small>${fmt(item.percentile,0)}%</small>`:""}</td><td><strong>${fmt(item.confidence_score*100,0)}%</strong><small>${intFmt(item.available_components)}/6</small></td><td><strong>${item.oldest_source_year}–${item.newest_source_year}</strong><small>${esc(text(ctx,`лаг ${fmt(item.average_lag,1)} г.`,`lag ${fmt(item.average_lag,1)} y.`))}</small></td></tr>`).join("")}</tbody></table></div><div class="htei-ranking-footer"><span>${esc(text(ctx,`Показаны ${filtered.length?start+1:0}–${Math.min(start+ui.pageSize,filtered.length)} из ${filtered.length}`,`Showing ${filtered.length?start+1:0}–${Math.min(start+ui.pageSize,filtered.length)} of ${filtered.length}`))}</span><div><button type="button" data-htei-page="prev" ${ui.page===0?"disabled":""}>←</button><span>${ui.page+1} / ${pages}</span><button type="button" data-htei-page="next" ${ui.page>=pages-1?"disabled":""}>→</button></div></div>`;
  }

  function actionsSection(ctx) {
    const policies=ctx.payload.policies||[];
    if(!policies.length)return "";
    const top=policies.slice(0,3);
    return `<section class="htei-section htei-actions" id="htei-actions"><div class="htei-actions-heading"><div><span>07</span><h2>${esc(text(ctx,"Что следует из диагностики для России","What the diagnosis implies for Russia"))}</h2></div><p>${esc(text(ctx,"Меры связаны с конкретными компонентами HTEI. Это аналитические рекомендации проекта, а не утверждённая государственная программа.","The actions are linked to specific HTEI components. They are analytical recommendations of the project, not an approved government programme."))}</p></div><div class="htei-policy-list">${top.map((item,index)=>policyCard(ctx,item,index)).join("")}</div><button type="button" class="htei-button" data-htei-country-profile="RUS">${esc(text(ctx,"Открыть полный профиль и все восемь мер","Open the full profile and all eight actions"))} →</button></section>`;
  }

  function policyCard(ctx,item,index){return `<article class="htei-policy-card"><div class="htei-policy-number">${String(index+1).padStart(2,"0")}</div><div><span>${esc(item.horizon||"")}</span><h3>${esc(policyTitle(ctx,item))}</h3><p>${esc(policyProblem(ctx,item))}</p><div class="htei-policy-kpi"><div><small>${esc(text(ctx,"Текущее значение","Current value"))}</small><strong>${item.current_value==null?"—":fmt(item.current_value,2)}</strong><span>${esc(item[`unit_${ctx.lang}`]||item.unit||"")}</span></div><div><small>${esc(text(ctx,"Бенчмарк","Benchmark"))}</small><strong>${esc(policyBenchmark(ctx,item))}</strong></div></div><details><summary>${esc(text(ctx,"Мера, ответственные и ожидаемый эффект","Action, owners and expected effect"))}</summary><dl><dt>${esc(text(ctx,"Мера","Action"))}</dt><dd>${esc(policyMeasure(ctx,item))}</dd><dt>${esc(text(ctx,"Ответственные","Owners"))}</dt><dd>${esc(policyActor(ctx,item))}</dd><dt>${esc(text(ctx,"Ожидаемый эффект","Expected effect"))}</dt><dd>${esc(policyEffect(ctx,item))}</dd></dl></details></div>${item.component_value_id_v6?`<button type="button" class="htei-evidence-button" data-htei-provenance="${esc(item.component_value_id_v6)}">${esc(text(ctx,"Данные","Evidence"))} ↗</button>`:""}</article>`;}

  function bind(ctx) {
    const root=ctx.root||document.querySelector("#view");
    root.querySelectorAll("[data-htei-scroll]").forEach(button=>button.addEventListener("click",()=>root.querySelector(`[data-htei-section="${button.dataset.hteiScroll}"]`)?.scrollIntoView({behavior:"smooth",block:"start"})));
    root.querySelectorAll("[data-htei-mode]").forEach(button=>button.addEventListener("click",()=>{const mode=ctx.payload.mode_catalog.find(item=>item.code===button.dataset.hteiMode);if(!mode?.available_for_country){ctx.onNotice?.(modeReason(ctx,mode));return;}if(mode.code!==ctx.payload.effective_mode)ctx.onModeChange?.(mode.code)}));
    root.querySelectorAll("[data-htei-provenance]").forEach(button=>button.addEventListener("click",()=>ctx.onProvenance?.(button.dataset.hteiProvenance,button)));
    root.querySelectorAll("[data-htei-comparison]").forEach(button=>button.addEventListener("click",()=>{ui.comparisonIndex=Number(button.dataset.hteiComparison)||0;render(ctx);root.querySelector('[data-htei-section="comparison"]')?.scrollIntoView({block:"start"})}));
    root.querySelector("[data-htei-ranking-search]")?.addEventListener("input",event=>{ui.search=event.target.value;ui.page=0;const panel=root.querySelector('.htei-ranking-panel');panel.innerHTML=rankingPanel(ctx);bindRanking(ctx,panel)});
    bindRanking(ctx,root);
    root.querySelectorAll("[data-htei-country]").forEach(button=>button.addEventListener("click",()=>ctx.onCountryChange?.(button.dataset.hteiCountry)));
    root.querySelector("[data-htei-country-profile]")?.addEventListener("click",()=>ctx.onCountryProfile?.("RUS"));
    root.querySelectorAll('.map-country').forEach(path=>{path.onclick=(event)=>{event.preventDefault();ctx.onCountryChange?.(path.dataset.iso)};path.onkeydown=(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();ctx.onCountryChange?.(path.dataset.iso)}}});
  }

  function bindRanking(ctx,root){root.querySelectorAll("[data-htei-page]").forEach(button=>button.addEventListener("click",()=>{ui.page+=button.dataset.hteiPage==='next'?1:-1;const panel=(ctx.root||document.querySelector('#view')).querySelector('.htei-ranking-panel');panel.innerHTML=rankingPanel(ctx);bindRanking(ctx,panel)}));root.querySelectorAll("[data-htei-country]").forEach(button=>button.addEventListener("click",()=>ctx.onCountryChange?.(button.dataset.hteiCountry)));root.querySelector("[data-htei-ranking-search]")?.addEventListener("input",event=>{ui.search=event.target.value;ui.page=0;const panel=(ctx.root||document.querySelector('#view')).querySelector('.htei-ranking-panel');panel.innerHTML=rankingPanel(ctx);bindRanking(ctx,panel)});}

  window.GIRHTEI={render,loading,error};
})();
