/* GIR THE Engineering Stage 2 — dedicated research workspace.
 *
 * The page deliberately keeps the official institution-level THE product and
 * the GIR-derived country layer visually and semantically separate. It renders
 * both the pre-publication governance state and the published analytical state
 * from the same backend contract without inventing placeholder scores.
 */
(() => {
  "use strict";

  const PILLAR_ORDER = [
    "TEACHING",
    "RESEARCH_ENVIRONMENT",
    "RESEARCH_QUALITY",
    "INDUSTRY",
    "INTERNATIONAL_OUTLOOK",
  ];
  const COMPONENT_ORDER = ["RANKED_INSTITUTIONS", "BEST_RANK", "MEDIAN_RANK", "PILLAR_PROFILE"];
  const cache = { status: null, methodology: null, workspace: new Map() };
  let context = null;
  let model = null;
  let renderToken = 0;
  const ui = { activeView: "overview", rankingQuery: "", rankingPage: 1, institutionQuery: "", institutionPage: 1, pageSize: 20 };

  const OFFICIAL_PILLAR_COPY = {
    TEACHING: {
      ru: { title: "Обучение", copy: "Репутация преподавания, соотношение студентов и сотрудников, подготовка докторов и институциональные ресурсы." },
      en: { title: "Teaching", copy: "Teaching reputation, student-to-staff ratio, doctoral training and institutional resources." },
    },
    RESEARCH_ENVIRONMENT: {
      ru: { title: "Исследовательская среда", copy: "Репутация, доходы и продуктивность исследовательской деятельности в инженерных дисциплинах." },
      en: { title: "Research environment", copy: "Reputation, income and productivity of engineering research." },
    },
    RESEARCH_QUALITY: {
      ru: { title: "Качество исследований", copy: "Цитируемость, сила, превосходство и международное влияние научных результатов." },
      en: { title: "Research quality", copy: "Citation impact, research strength, excellence and influence." },
    },
    INDUSTRY: {
      ru: { title: "Индустрия", copy: "Доходы от взаимодействия с индустрией и результативность патентной деятельности." },
      en: { title: "Industry", copy: "Income from industry partnerships and patent performance." },
    },
    INTERNATIONAL_OUTLOOK: {
      ru: { title: "Международная открытость", copy: "Иностранные студенты и сотрудники, а также международное научное соавторство." },
      en: { title: "International outlook", copy: "International students, staff and research co-authorship." },
    },
  };

  const COUNTRY_COMPONENT_COPY = {
    RANKED_INSTITUTIONS: {
      ru: { title: "Масштаб университетского представительства", copy: "Число университетов страны в официальном предметном рейтинге. Перед нормированием используется ln(1+n), чтобы крупные системы не получали линейного преимущества." },
      en: { title: "Ranked-institution breadth", copy: "Number of national universities in the official subject ranking. ln(1+n) is applied before normalisation to limit linear scale advantage." },
    },
    BEST_RANK: {
      ru: { title: "Пиковая университетская позиция", copy: "Лучшая позиция университета страны. Чем меньше место, тем выше нормированная оценка компонента." },
      en: { title: "Best institutional position", copy: "The country's strongest university position. Lower ranks translate into higher normalised component scores." },
    },
    MEDIAN_RANK: {
      ru: { title: "Типичная позиция университетов", copy: "Медиана мест всех представленных университетов показывает не единичный флагман, а центральный уровень национального пула." },
      en: { title: "Median institutional position", copy: "The median rank of all represented universities captures the central level of the national pool rather than a single flagship." },
    },
    PILLAR_PROFILE: {
      ru: { title: "Профиль пяти столпов THE", copy: "Средняя оценка до десяти наиболее высоко расположенных университетов с сохранением официальных весов преподавания, исследований, индустрии и международности." },
      en: { title: "Five-pillar performance profile", copy: "Average profile of up to ten leading universities while retaining the official teaching, research, industry and international weights." },
    },
  };

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
  function pct(value, digits = 0) { return value == null ? "—" : `${fmt(Number(value) * (Number(value) <= 1 ? 100 : 1), digits)}%`; }
  function local(item, fallback = "—") {
    if (!item) return fallback;
    return (lang() === "ru" ? item.name_ru : item.name_en) || item.title || item.name || item.iso3 || fallback;
  }
  function selectedIso3() { return String(context?.country || "").toUpperCase(); }
  function selectedCountryMeta() {
    return context?.platformContext?.countries?.find((item) => item.iso3 === selectedIso3()) || { iso3: selectedIso3(), name_ru: selectedIso3(), name_en: selectedIso3() };
  }
  function status() { return model?.status || {}; }
  function methodology() { return model?.methodology || {}; }
  function workspace() { return model?.workspace || null; }
  function official() { return methodology().official_product || {}; }
  function countryMethod() { return methodology().gir_country_aggregation || {}; }
  function selectedScore() { return workspace()?.selected_country || null; }
  function isPublished() { return Boolean(status().loaded && workspace()?.ranking?.rows?.length); }
  function institutionLayerAvailable() { return workspace()?.institution_access === "authorized" && (workspace()?.institutions || []).length > 0; }
  function externalLink(url, label, className = "the-button is-secondary") {
    return `<a class="${className}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span aria-hidden="true">↗</span></a>`;
  }
  function sectionHeading(number, title, copy) {
    return `<header class="the-section-heading"><span>${esc(number)}</span><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></header>`;
  }
  function keyValue(label, value, note = "") {
    return `<div class="the-key-value"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body?.detail;
      const message = typeof detail === "string" ? detail : detail?.[lang() === "ru" ? "message_ru" : "message_en"];
      throw new Error(message || `HTTP ${response.status}`);
    }
    return body;
  }

  function normaliseStatus(raw) {
    const latest = raw?.loaded?.latest_import || {};
    const institutionRows = Number(raw?.loaded?.institution_rows || 0);
    const countryScores = Number(raw?.gir_country_index?.country_score_rows || 0);
    const loaded = raw?.data_status === "loaded" && countryScores > 0;
    const releaseState = loaded ? "published" : raw?.data_status || "awaiting_authorized_export";
    const officialRanking = raw?.official_ranking || {};
    const expectedInstitutions = Number(officialRanking.university_count || 1555);
    const rowCoverage = Number(latest.row_coverage || (institutionRows && expectedInstitutions ? institutionRows / expectedInstitutions : 0));
    const highCoverage = Boolean(latest.high_coverage_universe && !latest.full_universe);
    const coveragePercent = rowCoverage ? `${(rowCoverage * 100).toFixed(2)}%` : "";
    const missingRows = Math.max(0, expectedInstitutions - institutionRows);
    return {
      ...raw,
      loaded,
      release: {
        edition_year: raw?.edition_year || 2026,
        data_status: releaseState,
        expected_institutions: expectedInstitutions,
        high_coverage_universe: highCoverage,
        row_coverage: rowCoverage,
        missing_rows: missingRows,
        expected_countries: officialRanking.country_territory_count || 95,
        imported_institutions: latest.rows_loaded || institutionRows,
        mapped_institutions: latest.institutions_mapped || 0,
        imported_countries: latest.source_country_count || 0,
        mapped_countries: latest.mapped_country_count || 0,
        validation: latest.import_id ? latest : {},
        redistribution_mode: "exclude_raw_keep_derived",
      },
      counts: {
        institution_rows: institutionRows,
        countries: latest.mapped_country_count || 0,
        published_country_scores: countryScores,
      },
      import_command: raw?.import_contract?.command,
      message_ru: loaded
        ? highCoverage
          ? `Опубликован разрешённый высокополный университетский слой: ${institutionRows} из ${expectedInstitutions} строк (${coveragePercent}); ${missingRows} строк отсутствуют в доступном транспортном представлении и не подменяются.`
          : "Разрешённый полный официальный университетский слой загружен; производная страновая агрегация GIR опубликована."
        : institutionRows > 0
          ? `Опубликованы ${institutionRows} реальных университетских строк из доступного проверенного слоя (${coveragePercent || "частичный охват"}). Страновая оценка GIR не рассчитывается до получения полной официальной вселенной.`
          : "Разрешённый полный экспорт THE Engineering ещё не загружен. Методика, схема, API и строгий импорт готовы; числовые результаты намеренно не заменяются демонстрационными значениями.",
      message_en: loaded
        ? highCoverage
          ? `An authorised high-coverage institution layer is published: ${institutionRows} of ${expectedInstitutions} rows (${coveragePercent}); ${missingRows} rows are unavailable in the accessible transport and are not imputed.`
          : "The authorised complete official institution layer is loaded and the GIR-derived country aggregation is published."
        : institutionRows > 0
          ? `${institutionRows} real institution rows are published from the available verified layer (${coveragePercent || "partial coverage"}). The GIR country score remains withheld until the complete official universe is available.`
          : "An authorised complete THE Engineering export has not yet been loaded. The methodology, schema, API and strict importer are ready; numeric results are deliberately not replaced with demonstration values.",
    };
  }

  function normaliseMethodology(raw, statusPayload, workspacePayload) {
    const officialRaw = raw?.official_methodology || {};
    const officialStatus = statusPayload?.official_ranking || workspacePayload?.official_ranking || {};
    const pillarWeights = Object.fromEntries((officialRaw.pillar_weights || []).map((item) => [item.code, Number(item.weight || 0)]));
    const eligibility = officialRaw.eligibility || {};
    const countryRaw = raw?.gir_country_aggregation || {};
    const weights = Object.fromEntries((countryRaw.components || []).map((item) => [item.code, Number(item.weight || 0)]));
    return {
      ...raw,
      official_product: {
        name: officialStatus.title || "Times Higher Education World University Rankings by Subject: Engineering 2026",
        institutions: officialStatus.university_count || 1555,
        countries_and_territories: officialStatus.country_territory_count || 95,
        indicator_count: officialStatus.indicator_count || officialRaw.indicator_weights?.length || 18,
        indicators: officialRaw.indicator_weights || [],
        disciplines: officialRaw.disciplines || officialStatus.disciplines || [],
        pillar_weights: pillarWeights,
        ranking_url: officialRaw.ranking_url || officialStatus.ranking_url,
        methodology_url: officialRaw.methodology_url || officialStatus.methodology_url,
        eligibility: {
          overall_wur_required: eligibility.overall_wur_required,
          engineering_publications_2020_2024_minimum: eligibility.engineering_publications_2020_2024 || 500,
          engineering_academic_staff_share_minimum: Number(eligibility.engineering_staff_share_percent_or || 4) / 100,
          engineering_academic_staff_count_minimum: eligibility.engineering_staff_fte_or || 40,
        },
      },
      gir_country_aggregation: { ...countryRaw, weights },
      formula: workspacePayload?.formula || {},
      data_governance: {
        raw_redistribution_default: false,
        distribution_decision: "exclude_raw_keep_derived",
        terms_url: raw?.licensing?.terms_url || statusPayload?.licensing?.terms_url,
        attribution: "Times Higher Education World University Rankings by Subject: Engineering",
      },
    };
  }

  function normaliseWorkspace(raw) {
    const rankingRows = Array.isArray(raw?.ranking) ? raw.ranking : raw?.ranking?.rows || [];
    const institutions = raw?.institutions || {};
    return {
      ...raw,
      edition_year: raw?.requested_year || raw?.edition_year || 2026,
      selected_country: raw?.country || raw?.selected_country || null,
      ranking: { rows: rankingRows, total: rankingRows.length },
      institutions: (Array.isArray(institutions) ? institutions : institutions.rows || []).map((item) => ({
        ...item,
        overall_score: item.overall_score ?? item.overall_midpoint,
        rank_is_band: item.rank_is_band ?? !item.rank_exact,
        institution_url: item.institution_url || null,
      })),
      institution_access: Array.isArray(institutions) ? "authorized" : institutions.access || "restricted",
      institution_access_detail: Array.isArray(institutions) ? "" : institutions.detail || "",
      distribution: raw?.distribution || [],
      official_pillar_aggregates: raw?.official_pillar_aggregates || [],
    };
  }

  async function load() {
    const edition = 2026;
    const key = `${selectedIso3()}:${edition}`;
    const statusPromise = cache.status || fetchJson(`/api/the-engineering/status?year=${edition}`);
    const methodologyPromise = cache.methodology || fetchJson("/api/the-engineering/methodology");
    if (!cache.workspace.has(key)) {
      cache.workspace.set(key, fetchJson(`/api/index/THE_ENG/workspace?country=${encodeURIComponent(selectedIso3())}&year=${edition}`));
    }
    const [rawStatus, rawMethodology, rawWorkspace] = await Promise.all([statusPromise, methodologyPromise, cache.workspace.get(key)]);
    cache.status = rawStatus;
    cache.methodology = rawMethodology;
    const workspacePayload = normaliseWorkspace(rawWorkspace);
    const statusPayload = normaliseStatus(rawStatus);
    const methodologyPayload = normaliseMethodology(rawMethodology, rawStatus, rawWorkspace);
    return { status: statusPayload, methodology: methodologyPayload, workspace: workspacePayload };
  }

  function loading() {
    return `<main class="the-workspace"><section class="the-loading" aria-live="polite"><div class="the-loading-mark">THE</div><h1>${tr("Формируется исследовательское пространство", "Building the research workspace")}</h1><p>${tr("Проверяются статус выпуска, методика и доступность доказательного слоя.", "Checking release status, methodology and evidence availability.")}</p></section></main>`;
  }

  function errorState(error) {
    return `<main class="the-workspace"><section class="the-error" role="alert"><span>THE · ENGINEERING</span><h1>${tr("Не удалось открыть страницу", "Could not open the page")}</h1><p>${esc(error?.message || error)}</p><button type="button" class="the-button" data-the-retry>${tr("Повторить", "Retry")}</button></section></main>`;
  }

  function publicationState() {
    const release = status().release || {};
    const state = release.data_status || "awaiting_official_snapshot";
    const labels = {
      awaiting_authorized_export: tr("Ожидается разрешённый официальный экспорт", "Awaiting an authorised official export"),
      awaiting_official_snapshot: tr("Ожидается разрешённый официальный экспорт", "Awaiting an authorised official export"),
      validated_non_publishable: tr("Файл проверен, но не допущен к публикации", "File validated but not cleared for publication"),
      partial_validated_non_publishable: tr("Проверена неполная выборка; публикация заблокирована", "Partial sample validated; publication remains locked"),
      partial_institution_layer_published_country_aggregation_withheld: tr("Опубликован реальный частичный университетский слой", "Real partial institution layer published"),
      validating: tr("Выполняется проверка выпуска", "Release validation in progress"),
      validated: tr("Выпуск проверен и ожидает публикации", "Release validated and awaiting publication"),
      published: tr("Числовой слой опубликован", "Numeric layer published"),
      rejected: tr("Выпуск отклонён проверкой", "Release rejected by validation"),
    };
    return { code: state, label: labels[state] || state };
  }

  function compactStatusLabel() {
    if (isPublished()) return tr("Данные опубликованы", "Data published");
    const state = publicationState().code;
    if (state === "validating") return tr("Выпуск проверяется", "Release validating");
    if (state === "validated") return tr("Готов к публикации", "Ready to publish");
    if (state === "rejected" || state.includes("non_publishable")) return tr("Публикация заблокирована", "Publication blocked");
    return tr("Ожидается экспорт", "Export pending");
  }

  function commandHeader() {
    const product = official();
    const release = status().release || {};
    return `<header class="the-command-header"><div class="the-command-identity"><span class="the-command-mark" aria-hidden="true">THE</span><div><div class="the-command-kicker">${tr("УНИВЕРСИТЕТСКАЯ АНАЛИТИКА", "UNIVERSITY ANALYTICS")} · ENGINEERING · ${esc(release.edition_year || 2026)}</div><h1>THE Engineering</h1><p>${tr("Инженерные университеты, официальные столпы THE и прозрачная страновая агрегация GIR.", "Engineering universities, the official THE pillars and a transparent GIR country aggregation.")}</p></div></div><div class="the-command-actions">${externalLink(product.ranking_url, tr("Официальный рейтинг", "Official ranking"), "the-button is-secondary")}${externalLink(product.methodology_url, tr("Методика THE", "THE methodology"), "the-button is-secondary")}<button type="button" class="the-button" data-the-view="methodology">${tr("Методика GIR", "GIR methodology")}</button></div></header>`;
  }

  function metricTile(label, value, note = "", modifier = "") {
    return `<article class="the-overview-metric ${modifier}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</article>`;
  }

  function overviewMetricStrip() {
    const product = official();
    const release = status().release || {};
    return `<section class="the-overview-metrics" aria-label="${tr("Масштаб и статус рейтинга", "Ranking scale and status")}">${metricTile(tr("Редакция", "Edition"), String(release.edition_year || 2026), tr("предметный рейтинг", "subject ranking"))}${metricTile(tr("Университеты", "Universities"), intFmt(product.institutions || release.expected_institutions || 1555), tr("официальная вселенная", "official universe"))}${metricTile(tr("Страны и территории", "Countries and territories"), intFmt(product.countries_and_territories || release.expected_countries || 95), tr("официальный охват", "official coverage"))}${metricTile(tr("Индикаторы", "Indicators"), intFmt(product.indicator_count || 18), tr("в пяти столпах", "across five pillars"))}${metricTile(tr("Числовой слой GIR", "GIR numeric layer"), compactStatusLabel(), isPublished() ? tr("страновая аналитика доступна", "country analytics available") : tr("без демонстрационных значений", "no demonstration values"), isPublished() ? "is-ready" : "is-pending")}</section>`;
  }

  function overviewCountryPanel() {
    const selected = selectedScore();
    const country = selected || selectedCountryMeta();
    const components = [...(workspace()?.components || [])].sort((a, b) => COMPONENT_ORDER.indexOf(a.component_code) - COMPONENT_ORDER.indexOf(b.component_code));
    const weights = countryMethod().weights || {};
    const componentRows = COMPONENT_ORDER.map((code) => {
      const definition = COUNTRY_COMPONENT_COPY[code][lang()];
      const item = components.find((entry) => entry.component_code === code);
      const weight = Number(item?.weight ?? weights[code] ?? 0.25);
      const score = item?.normalized_score;
      const contribution = item ? Number(item.weighted_contribution ?? Number(score || 0) * weight) : null;
      return `<div class="the-overview-component ${item ? "has-data" : "is-locked"}"><div><b>${esc(definition.title)}</b><span>${tr("вес", "weight")} ${pct(weight, 0)}${contribution == null ? "" : ` · ${tr("вклад", "contribution")} +${fmt(contribution, 1)}`}</span></div><strong>${score == null ? "—" : fmt(score, 1)}</strong><div class="the-overview-track" aria-hidden="true"><i style="width:${score == null ? 0 : Math.max(0, Math.min(100, Number(score)))}%"></i></div></div>`;
    }).join("");
    const metrics = [
      [tr("Оценка GIR", "GIR score"), selected ? fmt(selected.score, 1) : "—", tr("из 100", "out of 100")],
      [tr("Место", "Rank"), selected?.rank == null ? "—" : `#${intFmt(selected.rank)}`, selected ? `${tr("из", "of")} ${intFmt(workspace()?.ranking?.total)}` : tr("после публикации", "after publication")],
      [tr("Процентиль", "Percentile"), selected?.percentile == null ? "—" : `P${fmt(selected.percentile, 0)}`, tr("международное поле", "international field")],
      [tr("Университеты", "Universities"), selected ? intFmt(selected.institution_count || workspace()?.institutions?.length) : "—", tr("в рейтинге", "in the ranking")],
    ];
    return `<article class="the-dashboard-panel the-country-console"><header><div class="the-panel-title"><span>${tr("ПРОФИЛЬ СТРАНЫ", "COUNTRY PROFILE")}</span><h2>${context?.flagImage ? context.flagImage(country, "flag-img inline") : ""}${esc(local(country))}</h2></div><span class="the-layer-label">GIR · ${tr("производная оценка", "derived score")}</span></header><div class="the-country-metrics">${metrics.map(([label, value, note]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`).join("")}</div><div class="the-overview-components">${componentRows}</div>${isPublished() ? `<footer><span>${tr("Итог рассчитан по четырём равновесным компонентам.", "The total is calculated from four equally weighted components.")}</span><button type="button" class="the-text-action" data-the-view="country">${tr("Открыть полный профиль", "Open full profile")} →</button></footer>` : `<div class="the-inline-state"><i aria-hidden="true"></i><div><b>${tr("Страновые результаты ожидают разрешённый полный экспорт", "Country results await an authorised complete export")}</b><p>${tr("Каркас аналитики уже готов: после импорта здесь появятся score, место, процентиль, четыре компонента и provenance. Отсутствие данных не интерпретируется как нулевой результат.", "The analytical framework is ready: after import this panel will show the score, rank, percentile, four components and provenance. Missing data is never interpreted as a zero result.")}</p></div><button type="button" class="the-button is-secondary" data-the-view="publication">${tr("Статус загрузки", "Load status")}</button></div>`}</article>`;
  }

  function overviewPillarPanel() {
    const weights = official().pillar_weights || {};
    const indicators = official().indicators || [];
    return `<article class="the-dashboard-panel the-pillar-console"><header><div class="the-panel-title"><span>${tr("ОФИЦИАЛЬНАЯ МОДЕЛЬ THE", "OFFICIAL THE MODEL")}</span><h2>${tr("Пять столпов", "Five pillars")}</h2></div><strong>100%</strong></header><div class="the-overview-pillars">${PILLAR_ORDER.map((code) => {
      const copy = OFFICIAL_PILLAR_COPY[code][lang()];
      const weight = Number(weights[code] || 0);
      const count = indicators.filter((item) => item.pillar === code).length;
      return `<div><div><b>${esc(copy.title)}</b><span>${count} ${tr("индик.", "ind.")}</span><strong>${pct(weight, weight * 100 % 1 ? 1 : 0)}</strong></div><div class="the-pillar-track"><i style="width:${Math.max(0, weight * 100)}%"></i></div></div>`;
    }).join("")}</div><footer><span>${tr("Веса относятся к официальной предметной методике THE Engineering 2026.", "Weights follow the official THE Engineering 2026 subject methodology.")}</span><button type="button" class="the-text-action" data-the-view="methodology">${tr("Разобрать 18 индикаторов", "Inspect all 18 indicators")} →</button></footer></article>`;
  }

  function overviewReleasePanel() {
    const current = publicationState().code;
    const order = ["awaiting_authorized_export", "validating", "validated", "published"];
    const currentIndex = current === "rejected" || current.includes("non_publishable") ? 1 : Math.max(0, order.indexOf(current));
    const steps = [
      tr("Получить разрешённый экспорт", "Obtain authorised export"),
      tr("Проверить структуру и ISO3", "Validate schema and ISO3"),
      tr("Подтвердить полный выпуск", "Confirm complete release"),
      tr("Опубликовать аналитику", "Publish analytics"),
    ];
    const release = status().release || {};
    return `<article class="the-dashboard-panel the-release-console"><header><div class="the-panel-title"><span>${tr("ГОТОВНОСТЬ ДАННЫХ", "DATA READINESS")}</span><h2>${esc(compactStatusLabel())}</h2></div><span class="the-status-dot ${isPublished() ? "is-ready" : "is-pending"}" aria-hidden="true"></span></header><ol>${steps.map((label, index) => `<li class="${index < currentIndex ? "is-complete" : index === currentIndex ? "is-current" : "is-pending"}"><span>${index + 1}</span><b>${esc(label)}</b><small>${index < currentIndex ? tr("готово", "complete") : index === currentIndex ? tr("текущий этап", "current") : tr("ожидает", "pending")}</small></li>`).join("")}</ol><div class="the-release-mini"><div><span>${tr("Импортировано", "Imported")}</span><strong>${intFmt(release.imported_institutions || 0)} / ${intFmt(release.expected_institutions || 1555)}</strong></div><div><span>${tr("Опубликовано стран", "Countries published")}</span><strong>${intFmt(status().counts?.published_country_scores || 0)}</strong></div></div><button type="button" class="the-button is-secondary" data-the-view="publication">${tr("Открыть контроль выпуска", "Open release control")}</button></article>`;
  }

  function overviewPanel() {
    return `<section class="the-view-panel is-active" id="theOverview" role="tabpanel" aria-labelledby="theViewOverview">${overviewMetricStrip()}<div class="the-dashboard-grid">${overviewCountryPanel()}${overviewPillarPanel()}${overviewReleasePanel()}</div><div class="the-method-boundary is-dashboard"><strong>${tr("Методическая граница", "Methodological boundary")}</strong><p>${tr("THE публикует рейтинг университетов. Страновой score GIR — отдельная производная оценка; это не официальный рейтинг стран THE.", "THE publishes a university ranking. The GIR country score is a separate derived measure; it is not an official THE country ranking.")}</p></div></section>`;
  }

  function lockedAnalyticalView(kind) {
    const configs = {
      country: {
        title: tr("Профиль страны подготовлен к публикации", "The country profile is ready for publication"),
        copy: tr("После разрешённого импорта здесь появятся итоговая оценка, место, процентиль, разложение на четыре компонента и доказательная цепочка каждого значения.", "After an authorised import, this view will show the total score, rank, percentile, four-component decomposition and the evidence chain for every value."),
        columns: [tr("Оценка", "Score"), tr("Место", "Rank"), tr("Процентиль", "Percentile"), tr("Университеты", "Universities")],
      },
      institutions: {
        title: tr("Университетский слой ожидает разрешённый экспорт", "The institution layer awaits an authorised export"),
        copy: tr("Таблица будет содержать официальное отображение места, overall score, пять столпов и provenance. Публичность строк дополнительно зависит от права на их распространение.", "The table will contain the official rank display, overall score, five pillars and provenance. Public row delivery also depends on distribution rights."),
        columns: [tr("Университет", "University"), tr("Место", "Rank"), tr("Общий score", "Overall score"), tr("Пять столпов", "Five pillars")],
      },
      world: {
        title: tr("Международное поле будет рассчитано после полной загрузки", "The international field will be calculated after a complete load"),
        copy: tr("Страны без наблюдаемых университетов не получают нулевое значение. Международный рейтинг появится только после проверки полного выпуска.", "Countries without observed universities do not receive zero values. The international ranking appears only after the complete release is validated."),
        columns: [tr("Место", "Rank"), tr("Страна", "Country"), tr("Оценка", "Score"), tr("Университеты", "Universities")],
      },
    };
    const cfg = configs[kind];
    const geography = kind === "institutions" ? `<div class="the-university-map-host" data-university-map-host="THE_ENG"></div>` : "";
    return `<section class="the-locked-view"><header><span>${tr("ЧИСЛОВОЙ СЛОЙ НЕ ОПУБЛИКОВАН", "NUMERIC LAYER NOT PUBLISHED")}</span><h2>${esc(cfg.title)}</h2><p>${esc(cfg.copy)}</p></header>${geography}<div class="the-locked-kpis">${cfg.columns.map((label) => `<div><span>${esc(label)}</span><strong>—</strong><small>${tr("ожидает данных", "awaiting data")}</small></div>`).join("")}</div><article class="the-locked-table"><div class="the-locked-table-head">${cfg.columns.map((label) => `<span>${esc(label)}</span>`).join("")}</div><div class="the-locked-table-empty"><i aria-hidden="true"></i><b>${tr("Демонстрационные значения не используются", "No demonstration values are used")}</b><p>${tr("Интерфейс показывает структуру будущей аналитики, но не подменяет официальный набор тестовыми строками.", "The interface shows the future analytical structure without replacing the official dataset with test rows.")}</p></div></article><div class="the-locked-actions"><button type="button" class="the-button" data-the-view="publication">${tr("Проверить готовность данных", "Check data readiness")}</button><button type="button" class="the-button is-secondary" data-the-view="methodology">${tr("Открыть методику", "Open methodology")}</button></div></section>`;
  }

  function viewTabs() {
    const items = [
      ["overview", tr("Обзор", "Overview")],
      ["country", tr("Профиль страны", "Country profile")],
      ["institutions", tr("Университеты", "Universities")],
      ["world", tr("Международное поле", "International field")],
      ["publication", tr("Готовность данных", "Data readiness")],
      ["methodology", tr("Методика", "Methodology")],
    ];
    return `<nav class="the-view-tabs" role="tablist" aria-label="${tr("Разделы THE Engineering", "THE Engineering views")}">${items.map(([code, label]) => `<button type="button" id="theView${code[0].toUpperCase()}${code.slice(1)}" role="tab" aria-selected="${ui.activeView === code ? "true" : "false"}" tabindex="${ui.activeView === code ? "0" : "-1"}" data-the-view="${code}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function activeViewPanel() {
    if (ui.activeView === "country") return isPublished() ? countryProfileSection() : lockedAnalyticalView("country");
    if (ui.activeView === "institutions") return institutionLayerAvailable() ? institutionsSection() : lockedAnalyticalView("institutions");
    if (ui.activeView === "world") return isPublished() ? worldSection() : lockedAnalyticalView("world");
    if (ui.activeView === "publication") return releaseSection();
    if (ui.activeView === "methodology") return `${officialModelSection()}${countryModelSection()}${methodSection()}`;
    return overviewPanel();
  }


  function officialPillars() {
    const weights = official().pillar_weights || {};
    const indicators = official().indicators || [];
    return `<div class="the-pillar-band" role="list" aria-label="${tr("Вес пяти официальных столпов THE Engineering", "Weights of the five official THE Engineering pillars")}">${PILLAR_ORDER.map((code, index) => {
      const item = OFFICIAL_PILLAR_COPY[code][lang()];
      const weight = Number(weights[code] || 0);
      const children = indicators.filter((indicator) => indicator.pillar === code);
      return `<article class="the-pillar is-${index + 1}" role="listitem" style="--pillar-share:${Math.max(weight * 100, 7.5)}"><header><span>${String(index + 1).padStart(2, "0")}</span><strong>${pct(weight, weight * 100 % 1 ? 1 : 0)}</strong></header><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p><details><summary>${tr("Индикаторы и веса", "Indicators and weights")} · ${children.length}</summary><dl>${children.map((indicator) => `<div><dt>${esc(lang() === "ru" ? indicator.name_ru : indicator.name_en)}</dt><dd>${pct(indicator.weight, indicator.weight * 100 % 1 ? 1 : 0)}</dd></div>`).join("")}</dl></details></article>`;
    }).join("")}</div>`;
  }

  function disciplineList() {
    const names = {
      "general engineering": tr("Общая инженерия", "General engineering"),
      "electrical and electronic engineering": tr("Электротехника и электроника", "Electrical and electronic engineering"),
      "mechanical and aerospace engineering": tr("Механика и аэрокосмическая инженерия", "Mechanical and aerospace engineering"),
      "civil engineering": tr("Гражданское строительство", "Civil engineering"),
      "chemical engineering": tr("Химическая инженерия", "Chemical engineering"),
    };
    return `<ol class="the-discipline-list">${(official().disciplines || []).map((item, index) => { const key = String(item).toLowerCase(); return `<li><span>${String(index + 1).padStart(2, "0")}</span><b>${esc(names[key] || item)}</b></li>`; }).join("")}</ol>`;
  }

  function officialModelSection() {
    const eligibility = official().eligibility || {};
    return `<section class="the-section" id="theOfficial">${sectionHeading("01", tr("Как THE оценивает инженерные университеты", "How THE evaluates engineering universities"), tr("Официальный предметный рейтинг использует 18 индикаторов, объединённых в пять столпов. Веса перекалиброваны для инженерных дисциплин и не заменяются формулой GIR.", "The official subject ranking uses 18 indicators grouped into five pillars. The weights are recalibrated for engineering and are not replaced by the GIR formula."))}${officialPillars()}<div class="the-official-grid"><article class="the-editorial-panel"><span>${tr("Предметное поле", "Subject coverage")}</span><h3>${tr("Пять инженерных дисциплин", "Five engineering disciplines")}</h3>${disciplineList()}</article><article class="the-editorial-panel"><span>${tr("Критерии включения", "Eligibility criteria")}</span><h3>${tr("В рейтинг попадают только исследовательски активные университеты", "Only research-active universities enter the ranking")}</h3><div class="the-threshold-grid">${keyValue(tr("Публикации", "Publications"), intFmt(eligibility.engineering_publications_2020_2024_minimum || 500), tr("за 2020–2024 гг. в инженерии", "in engineering during 2020–2024"))}${keyValue(tr("Доля сотрудников", "Staff share"), pct(eligibility.engineering_academic_staff_share_minimum || .04, 0), tr("или абсолютный порог", "or the absolute threshold"))}${keyValue(tr("Инженерный персонал", "Engineering staff"), intFmt(eligibility.engineering_academic_staff_count_minimum || 40), tr("академических сотрудников FTE", "academic staff FTE"))}</div><p>${tr("Университет также должен участвовать в общем World University Rankings и быть активным в соответствующей предметной области.", "An institution must also participate in the overall World University Rankings and be active in the relevant subject area.")}</p></article></div></section>`;
  }

  function countryFormula() {
    const formula = methodology().formula || {};
    const formulaText = lang() === "ru" ? formula.formula_text_ru : formula.formula_text_en;
    return `<div class="the-formula"><span>${tr("Формула страновой агрегации", "Country aggregation formula")}</span><code>${esc(formulaText || "THE_ENG = 0.25 × BREADTH* + 0.25 × BEST_RANK* + 0.25 × MEDIAN_RANK* + 0.25 × PILLAR_PROFILE*")}</code></div>`;
  }

  function countryModelSection() {
    const weights = countryMethod().weights || {};
    return `<section class="the-section" id="theCountry">${sectionHeading("02", tr("Как GIR переводит университетские строки в страновую диагностику", "How GIR turns institution rows into a country diagnostic"), tr("Страновой слой создаётся только как отдельный производный аналитический продукт. Его задача — одновременно показать масштаб представительства, пиковую и типичную позицию университетов, а также профиль пяти столпов.", "The country layer is created only as a separate derived analytical product. It simultaneously measures representation breadth, the strongest and typical university position, and the five-pillar profile."))}<div class="the-lineage" aria-label="${tr("Цепочка формирования страновой оценки", "Country-score lineage")}"><div><span>01</span><b>${tr("Официальные строки THE", "Official THE rows")}</b><small>${tr("университет, место, overall score и пять столпов", "institution, rank, overall score and five pillars")}</small></div><i aria-hidden="true">→</i><div><span>02</span><b>${tr("Проверка и гармонизация", "Validation and harmonisation")}</b><small>${tr("страна, диапазоны мест, полнота и контрольная сумма", "country, rank bands, completeness and checksum")}</small></div><i aria-hidden="true">→</i><div><span>03</span><b>${tr("Страновые компоненты", "Country components")}</b><small>${tr("масштаб, лучший и медианный ранг, профиль пяти столпов", "breadth, best and median rank, five-pillar profile")}</small></div><i aria-hidden="true">→</i><div><span>04</span><b>${tr("THE Engineering · GIR", "THE Engineering · GIR")}</b><small>${tr("score 0–100, место и процентиль", "0–100 score, rank and percentile")}</small></div></div><div class="the-country-components">${COMPONENT_ORDER.map((code, index) => {
      const item = COUNTRY_COMPONENT_COPY[code][lang()];
      const weight = Number(weights[code] || 0.25);
      return `<article><header><span>${String(index + 1).padStart(2, "0")}</span><strong>${pct(weight, 0)}</strong></header><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p><div class="the-weight-track"><i style="width:${Math.min(100, weight * 100)}%"></i></div></article>`;
    }).join("")}</div>${countryFormula()}<div class="the-method-boundary"><strong>${tr("Почему два уровня нельзя смешивать", "Why the two levels must not be conflated")}</strong><p>${tr("THE публикует позиции отдельных университетов. GIR использует эти официальные строки как входные данные и создаёт самостоятельную страновую агрегацию. Поэтому на странице всегда отдельно обозначены официальный источник, авторская формула и статус каждого значения.", "THE publishes positions of individual universities. GIR uses those official rows as inputs and creates a separate country aggregation. The page therefore always labels the official source, the platform formula and the status of every value separately.")}</p></div></section>`;
  }

  function contributionChart(components) {
    if (!components?.length) return "";
    const total = components.reduce((sum, item) => sum + Number(item.weighted_contribution || Number(item.normalized_score || 0) * Number(item.weight || 0)), 0);
    return `<div class="the-contribution" role="img" aria-label="${tr("Вклад компонентов в страновую оценку", "Component contributions to the country score")}"><div class="the-contribution-bar">${components.map((item) => {
      const contribution = Number(item.weighted_contribution ?? Number(item.normalized_score || 0) * Number(item.weight || 0));
      const share = total ? contribution / total * 100 : Number(item.weight || 0) * 100;
      return `<span class="is-${esc(item.component_code.toLowerCase())}" style="width:${Math.max(0, share)}%" title="${esc(local(item))}: ${fmt(contribution, 1)}"></span>`;
    }).join("")}</div><div class="the-contribution-legend">${components.map((item) => {
      const contribution = Number(item.weighted_contribution ?? Number(item.normalized_score || 0) * Number(item.weight || 0));
      return `<div><i class="is-${esc(item.component_code.toLowerCase())}"></i><span>${esc(local(item))}</span><b>+${fmt(contribution, 1)}</b></div>`;
    }).join("")}</div></div>`;
  }

  function countryProfileSection() {
    if (!isPublished()) return "";
    const selected = selectedScore();
    if (!selected) {
      return `<section class="the-section" id="theCountryProfile">${sectionHeading("03", tr("Профиль выбранной страны", "Selected-country profile"), tr("Полный выпуск опубликован, но для выбранной страны отсутствует страновая оценка. Это означает отсутствие университетов, удовлетворивших условиям предметного рейтинга, а не нулевой результат.", "The complete release is published, but the selected country has no country score. This means no university met the subject-ranking criteria; it is not a zero result."))}<div class="the-empty-state"><strong>${esc(local(selectedCountryMeta()))}</strong><p>${tr("Выберите другую страну в панели контекста или перейдите к международному рейтингу.", "Choose another country in the context bar or continue to the international ranking.")}</p><button type="button" class="the-button" data-the-scroll="theWorld">${tr("Открыть рейтинг", "Open ranking")}</button></div></section>`;
    }
    const components = [...(workspace().components || [])].sort((a, b) => COMPONENT_ORDER.indexOf(a.component_code) - COMPONENT_ORDER.indexOf(b.component_code));
    const pillars = [...(workspace().official_pillar_aggregates || [])].sort((a, b) => PILLAR_ORDER.indexOf(a.pillar_code) - PILLAR_ORDER.indexOf(b.pillar_code));
    return `<section class="the-section" id="theCountryProfile">${sectionHeading("03", `${tr("Структура результата", "Anatomy of the result")}: ${local(selected)}`, tr("Страновой score раскладывается на четыре компонента GIR, а официальный университетский слой — на пять столпов THE. Оба представления сохраняются рядом, но не смешиваются.", "The country score is decomposed into four GIR components, while the official institution layer is shown across the five THE pillars. The two views stay adjacent but are never conflated."))}<div class="the-profile-summary">${keyValue(tr("Страновой score GIR", "GIR country score"), fmt(selected.score, 1), tr("шкала 0–100", "0–100 scale"))}${keyValue(tr("Международное место", "International rank"), selected.rank == null ? "—" : `#${intFmt(selected.rank)}`, `${tr("из", "of")} ${intFmt(workspace().ranking?.total)}`)}${keyValue(tr("Процентиль", "Percentile"), selected.percentile == null ? "—" : `P${fmt(selected.percentile, 0)}`)}${keyValue(tr("Университетов", "Universities"), intFmt(selected.institution_count || workspace().institutions?.length))}</div>${contributionChart(components)}<div class="the-profile-grid"><article class="the-profile-panel"><header><span>GIR · 4</span><h3>${tr("Компоненты страновой оценки", "Country-score components")}</h3></header><div class="the-component-list">${components.map((item) => `<div><div><b>${esc(local(item))}</b><span>${tr("Вес", "Weight")} ${pct(item.weight, 0)} · ${tr("вклад", "contribution")} ${fmt(item.weighted_contribution ?? Number(item.normalized_score || 0) * Number(item.weight || 0), 1)}</span></div><strong>${fmt(item.normalized_score, 1)}</strong><div class="the-metric-track"><i style="width:${Math.max(0, Math.min(100, Number(item.normalized_score || 0)))}%"></i></div>${item.value_id ? `<button type="button" data-the-provenance="${esc(item.value_id)}">${tr("Происхождение", "Provenance")}</button>` : ""}</div>`).join("")}</div></article><article class="the-profile-panel"><header><span>THE · 5</span><h3>${tr("Средний профиль ведущих университетов", "Average profile of leading universities")}</h3></header><div class="the-pillar-list">${pillars.map((item) => {
      const copy = OFFICIAL_PILLAR_COPY[item.pillar_code]?.[lang()] || { title: item.pillar_code };
      return `<div><div><b>${esc(copy.title)}</b><span>${intFmt(item.institution_count)} ${tr("университетов", "universities")}</span></div><strong>${fmt(item.normalized_score, 1)}</strong><div class="the-metric-track is-pillar"><i style="width:${Math.max(0, Math.min(100, Number(item.normalized_score || 0)))}%"></i></div>${item.value_id ? `<button type="button" data-the-provenance="${esc(item.value_id)}">${tr("Происхождение", "Provenance")}</button>` : ""}</div>`;
    }).join("")}</div></article></div></section>`;
  }

  function institutionMatches(item) {
    const query = ui.institutionQuery.trim().toLowerCase();
    return !query || `${item.institution_name || ""} ${item.rank_display || ""} ${item.country_name || ""}`.toLowerCase().includes(query);
  }

  function institutionsSection() {
    if (workspace().institution_access !== "authorized") {
      return `<section class="the-section" id="theInstitutions">${sectionHeading("04", tr("Университетский слой защищён условиями доступа", "The institution layer is rights-gated"), tr("Страновые производные результаты опубликованы на основании отдельно подтверждённого разрешения. Публичная выдача университетских строк остаётся отключённой, пока для неё не зафиксировано самостоятельное право.", "Derived country results are published under separately confirmed permission. Public institution-row delivery remains disabled until a distinct right is recorded."))}<div class="the-restricted-layer"><div><span>${tr("Доступ к строкам", "Row access")}</span><strong>${tr("Ограничен", "Restricted")}</strong></div><p>${esc(workspace().institution_access_detail || tr("Raw и университетские строки не раздаются через публичный API.", "Raw and institution-level rows are not distributed through the public API."))}</p><div class="the-restricted-facts"><span>${tr("Страновые scores", "Country scores")} · ${tr("доступны", "available")}</span><span>${tr("Пять агрегированных столпов", "Five aggregated pillars")} · ${tr("доступны", "available")}</span><span>${tr("Университетские строки", "Institution rows")} · ${tr("закрыты", "locked")}</span></div></div></section>`;
    }
    const all = workspace().institutions || [];
    const filtered = all.filter(institutionMatches);
    const pages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
    ui.institutionPage = Math.min(ui.institutionPage, pages);
    const start = (ui.institutionPage - 1) * ui.pageSize;
    const rows = filtered.slice(start, start + ui.pageSize);
    return `<section class="the-section" id="theInstitutions">${sectionHeading("04", `${tr("Университетский слой", "Institution layer")}: ${local(selectedScore() || selectedCountryMeta())}`, tr("Таблица сохраняет официальное отображение места, исходный overall score, пять столпов и ссылку на доказательную запись каждой университетской строки.", "The table preserves the official rank display, source overall score, five pillars and the evidence record for every institution row."))}<div class="the-university-map-host" data-university-map-host="THE_ENG"></div><article class="the-data-panel"><div class="the-table-tools"><label><span>${tr("Поиск университета", "Search universities")}</span><input id="theInstitutionSearch" value="${esc(ui.institutionQuery)}" placeholder="${tr("Название или место", "Name or rank")}"></label><div class="the-pagination"><button type="button" data-the-institution-page="prev" ${ui.institutionPage <= 1 ? "disabled" : ""}>${tr("Назад", "Previous")}</button><span>${tr("Страница", "Page")} ${ui.institutionPage}/${pages} · ${intFmt(filtered.length)}</span><button type="button" data-the-institution-page="next" ${ui.institutionPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")}</button></div></div><div class="the-table-wrap" tabindex="0" role="region" aria-label="${tr("Университеты выбранной страны", "Universities in the selected country")}"><table class="the-table is-institutions"><caption>${tr("Университетские строки THE Engineering", "THE Engineering institution rows")}</caption><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Университет", "University")}</th><th>Overall</th><th>${tr("Обучение", "Teaching")}</th><th>${tr("Исследовательская среда", "Research environment")}</th><th>${tr("Качество исследований", "Research quality")}</th><th>${tr("Индустрия", "Industry")}</th><th>${tr("Международность", "International")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${rows.map((item) => `<tr><td><strong>${esc(item.rank_display || (item.rank_exact ? `#${item.rank_exact}` : "—"))}</strong>${item.rank_is_band ? `<small>${tr("середина диапазона используется только в расчёте", "band midpoint used only in computation")}</small>` : ""}</td><td><strong>${item.institution_url ? `<a href="${esc(item.institution_url)}" target="_blank" rel="noopener noreferrer">${esc(item.institution_name)}</a>` : esc(item.institution_name)}</strong><small>${esc(item.country_name || item.iso3)}</small></td><td>${fmt(item.overall_score, 1)}<small>${esc(item.overall_display || item.score_basis || "")}</small></td><td>${fmt(item.teaching_score, 1)}</td><td>${fmt(item.research_environment_score, 1)}</td><td>${fmt(item.research_quality_score, 1)}</td><td>${fmt(item.industry_score, 1)}</td><td>${fmt(item.international_outlook_score, 1)}</td><td><button type="button" data-the-provenance="${esc(item.value_id)}">${tr("Открыть", "Open")}</button></td></tr>`).join("") || `<tr><td colspan="9">${tr("По запросу ничего не найдено.", "No institutions match the query.")}</td></tr>`}</tbody></table></div></article></section>`;
  }

  function distributionSvg() {
    const bins = workspace()?.distribution || [];
    if (!bins.length) return `<div class="the-chart-empty">${tr("Распределение появится после публикации числового слоя.", "The distribution will appear after the numeric layer is published.")}</div>`;
    const width = 760, height = 300, left = 52, right = 22, top = 24, bottom = 45;
    const innerW = width - left - right, innerH = height - top - bottom;
    const maxCount = Math.max(...bins.map((item) => Number(item.count || 0)), 1);
    const gap = 8, barW = innerW / bins.length - gap;
    const selected = Number(selectedScore()?.score);
    const bars = bins.map((item, index) => {
      const count = Number(item.count || 0);
      const h = innerH * count / maxCount;
      const x = left + index * (innerW / bins.length) + gap / 2;
      const y = top + innerH - h;
      const contains = Number.isFinite(selected) && selected >= Number(item.low ?? item.from) && (selected < Number(item.high ?? item.to) || index === bins.length - 1);
      return `<g tabindex="0" role="group" aria-label="${fmt(item.low ?? item.from, 0)}–${fmt(item.high ?? item.to, 0)}: ${intFmt(count)}"><rect x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 1)}" class="${contains ? "is-selected" : ""}"></rect><text x="${x + barW / 2}" y="${height - 18}" text-anchor="middle">${fmt(item.low ?? item.from, 0)}</text><text x="${x + barW / 2}" y="${Math.max(y - 7, 14)}" text-anchor="middle">${count}</text></g>`;
    }).join("");
    const selectedX = Number.isFinite(selected) ? left + innerW * Math.max(0, Math.min(100, selected)) / 100 : null;
    return `<svg class="the-distribution-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="theDistributionTitle theDistributionDesc"><title id="theDistributionTitle">${tr("Распределение страновых scores THE Engineering GIR", "Distribution of THE Engineering GIR country scores")}</title><desc id="theDistributionDesc">${tr("Гистограмма числа стран по десятибалльным диапазонам score. Выбранная страна выделена.", "Histogram of countries by ten-point score bands. The selected country is highlighted.")}</desc>${bars}${selectedX == null ? "" : `<line class="the-selected-line" x1="${selectedX}" x2="${selectedX}" y1="${top}" y2="${top + innerH}"></line><text class="the-selected-label" x="${selectedX}" y="${top - 8}" text-anchor="middle">${esc(selectedIso3())} · ${fmt(selected, 1)}</text>`}</svg>`;
  }

  function rankingMatches(item) {
    const query = ui.rankingQuery.trim().toLowerCase();
    return !query || `${item.iso3 || ""} ${item.name_ru || ""} ${item.name_en || ""}`.toLowerCase().includes(query);
  }

  function worldSection() {
    if (!isPublished()) return "";
    const ranking = workspace().ranking?.rows || [];
    const filtered = ranking.filter(rankingMatches);
    const pages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
    ui.rankingPage = Math.min(ui.rankingPage, pages);
    const start = (ui.rankingPage - 1) * ui.pageSize;
    const rows = filtered.slice(start, start + ui.pageSize);
    const edition = workspace().edition_year || 2026;
    return `<section class="the-section" id="theWorld">${sectionHeading("05", tr("Международное поле", "International field"), tr("Распределение и рейтинг относятся к производной страновой агрегации GIR. Официальные университетские позиции THE остаются доступны в отдельном университетском слое.", "The distribution and ranking refer to the GIR-derived country aggregation. Official THE institution positions remain available in the separate institution layer."))}<div class="the-world-grid"><article class="the-chart-panel"><header><span>${tr("Распределение 0–100", "0–100 distribution")}</span><h3>${tr("Где находится выбранная страна", "Where the selected country sits")}</h3></header><div class="the-chart-wrap">${distributionSvg()}</div></article><article class="the-world-summary"><span>${tr("Редакция", "Edition")}</span><strong>${edition}</strong><dl><div><dt>${tr("Стран с оценкой", "Countries scored")}</dt><dd>${intFmt(workspace().ranking?.total)}</dd></div><div><dt>${tr("Университетских строк", "Institution rows")}</dt><dd>${intFmt(status().counts?.institution_rows)}</dd></div><div><dt>${tr("Статус", "Status")}</dt><dd>${esc(publicationState().label)}</dd></div></dl><a class="the-button is-secondary" href="/api/index/THE_ENG/workspace.csv?year=${encodeURIComponent(edition)}">${tr("Скачать страновой CSV", "Download country CSV")}</a></article></div><article class="the-data-panel"><div class="the-table-tools"><label><span>${tr("Поиск страны", "Search countries")}</span><input id="theRankingSearch" value="${esc(ui.rankingQuery)}" placeholder="${tr("Название или ISO3", "Name or ISO3")}"></label><div class="the-pagination"><button type="button" data-the-ranking-page="prev" ${ui.rankingPage <= 1 ? "disabled" : ""}>${tr("Назад", "Previous")}</button><span>${tr("Страница", "Page")} ${ui.rankingPage}/${pages} · ${intFmt(filtered.length)}</span><button type="button" data-the-ranking-page="next" ${ui.rankingPage >= pages ? "disabled" : ""}>${tr("Далее", "Next")}</button></div></div><div class="the-table-wrap" tabindex="0" role="region" aria-label="${tr("Страновой рейтинг GIR по THE Engineering", "GIR country ranking based on THE Engineering")}"><table class="the-table"><caption>${tr("Производная страновая агрегация THE Engineering", "Derived THE Engineering country aggregation")}</caption><thead><tr><th>${tr("Место", "Rank")}</th><th>${tr("Страна", "Country")}</th><th>${tr("Оценка", "Score")}</th><th>${tr("Процентиль", "Percentile")}</th><th>${tr("Университетов", "Universities")}</th><th>${tr("Доказательство", "Evidence")}</th></tr></thead><tbody>${rows.map((item) => `<tr class="${item.iso3 === selectedIso3() ? "is-selected" : ""}"><td><strong>${item.rank == null ? "—" : `#${intFmt(item.rank)}`}</strong></td><td><button type="button" data-the-country="${esc(item.iso3)}"><span class="the-country-cell">${context?.flagImage ? context.flagImage(item, "flag-img inline") : ""}<span><b>${esc(local(item))}</b><small>${esc(item.iso3)}</small></span></span></button></td><td><strong>${fmt(item.score, 1)}</strong><small>${tr("из 100", "out of 100")}</small></td><td>${item.percentile == null ? "—" : `P${fmt(item.percentile, 0)}`}</td><td>${intFmt(item.institution_count)}</td><td>${item.value_id ? `<button type="button" data-the-provenance="${esc(item.value_id)}">${tr("Открыть", "Open")}</button>` : "—"}</td></tr>`).join("") || `<tr><td colspan="6">${tr("По запросу ничего не найдено.", "No countries match the query.")}</td></tr>`}</tbody></table></div></article></section>`;
  }

  function releaseSteps() {
    const release = status().release || {};
    const current = publicationState().code;
    const order = ["awaiting_authorized_export", "validating", "validated", "published"];
    const currentIndex = current === "rejected" ? 1 : current.includes("non_publishable") ? 1 : Math.max(0, order.indexOf(current));
    const steps = [
      { code: "awaiting_authorized_export", title: tr("Разрешённый экспорт", "Authorised export"), copy: tr("Оператор получает официальный CSV/XLSX на законном основании и фиксирует право на хранение и преобразование.", "An operator obtains an official CSV/XLSX under a valid licence and records storage and transformation rights.") },
      { code: "validating", title: tr("Структура и сопоставление", "Schema and mapping"), copy: tr("Проверяются столбцы, диапазоны мест, ISO3, полнота пяти столпов и отсутствие дубликатов.", "Columns, rank bands, ISO3 mapping, five-pillar completeness and duplicates are checked.") },
      { code: "validated", title: tr("Контроль выпуска", "Release control"), copy: tr("Полный выпуск должен подтвердить 1 555 университетов и 98 стран/территорий либо документированное изменение официальной вселенной.", "The complete release must confirm 1,555 universities and 98 countries/territories or a documented change in the official universe.") },
      { code: "published", title: tr("Публикация аналитики", "Analytics publication"), copy: tr("После проверки создаются страновые компоненты, рейтинг, provenance и разрешённые производные выгрузки.", "After validation, country components, ranking, provenance and permitted derived exports are published.") },
    ];
    return `<ol class="the-release-steps">${steps.map((item, index) => {
      const stateClass = current === "rejected" && index >= 1 ? "is-blocked" : index < currentIndex ? "is-complete" : index === currentIndex ? "is-current" : "is-pending";
      return `<li class="${stateClass}"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></div><b>${index < currentIndex ? tr("Завершено", "Complete") : index === currentIndex ? (current === "rejected" ? tr("Требует исправления", "Needs correction") : tr("Текущий этап", "Current stage")) : tr("Ожидает", "Pending")}</b></li>`;
    }).join("")}</ol>`;
  }

  function releaseSection() {
    const release = status().release || {};
    const counts = status().counts || {};
    const validation = release.validation || {};
    return `<section class="the-section" id="theRelease">${sectionHeading(isPublished() ? "06" : "03", tr("Публикация числового слоя", "Publishing the numeric layer"), tr("Pipeline устроен так, чтобы неполный файл, тестовая выборка или неподтверждённый источник не могли незаметно превратиться в публичный рейтинг.", "The pipeline prevents an incomplete file, test sample or unverified source from silently becoming a public ranking."))}<div class="the-release-layout"><article>${releaseSteps()}</article><aside class="the-release-audit"><span>${tr("Состояние выпуска", "Release state")}</span><h3>${esc(publicationState().label)}</h3><div class="the-audit-grid">${keyValue(tr("Импортировано строк", "Imported rows"), intFmt(release.imported_institutions || counts.institution_rows || 0), `${tr("ожидается", "expected")} ${intFmt(release.expected_institutions || 1555)}`)}${keyValue(tr("Сопоставлено строк", "Mapped rows"), intFmt(release.mapped_institutions || 0))}${keyValue(tr("Стран обнаружено", "Countries detected"), intFmt(release.imported_countries || counts.countries || 0), `${tr("ожидается", "expected")} ${intFmt(release.expected_countries || 98)}`)}${keyValue(tr("Опубликовано стран", "Countries published"), intFmt(counts.published_country_scores || 0))}</div>${Object.keys(validation).length ? `<details><summary>${tr("Протокол последней проверки", "Latest validation report")}</summary><pre>${esc(JSON.stringify(validation, null, 2))}</pre></details>` : `<p>${tr("Протокол проверки появится после загрузки разрешённого файла.", "The validation report will appear after an authorised file is loaded.")}</p>`}<details class="the-admin-details"><summary>${tr("Для администратора данных", "For the data administrator")}</summary><p>${tr("Импорт выполняется локально; raw-файл не публикуется через веб-приложение. Перед запуском необходимо подтвердить права на хранение, преобразование и публикацию производных результатов.", "The import runs locally; the raw file is not exposed by the web application. Storage, transformation and derived-publication rights must be confirmed before execution.")}</p><code>${esc(status().import_command || "python scripts/import_the_engineering_official.py ...")}</code></details></aside></div></section>`;
  }

  function methodSection() {
    const product = official();
    const governance = methodology().data_governance || {};
    const formula = methodology().formula || {};
    return `<section class="the-section" id="theMethod">${sectionHeading(isPublished() ? "07" : "04", tr("Источник, права и ограничения интерпретации", "Source, rights and interpretation limits"), tr("Прозрачность здесь означает не только формулу, но и явное разграничение официального продукта, авторского преобразования и разрешённого режима распространения.", "Transparency here covers not only the formula, but also the boundary between the official product, the platform transformation and the permitted distribution mode."))}<div class="the-method-grid"><article class="the-method-card"><span>${tr("Официальный продукт", "Official product")}</span><h3>${esc(product.name || "Times Higher Education World University Rankings by Subject: Engineering 2026")}</h3><dl><div><dt>${tr("Уровень наблюдения", "Observation level")}</dt><dd>${tr("Университет", "University")}</dd></div><div><dt>${tr("Редакция", "Edition")}</dt><dd>${status().release?.edition_year || 2026}</dd></div><div><dt>${tr("Масштаб", "Universe")}</dt><dd>${intFmt(product.institutions || 1555)} · ${intFmt(product.countries_and_territories || 95)}</dd></div><div><dt>${tr("Индикаторы", "Indicators")}</dt><dd>${intFmt(product.indicator_count || 18)}</dd></div></dl>${externalLink(product.ranking_url, tr("Открыть официальный рейтинг", "Open official ranking"), "the-text-link")}${externalLink(product.methodology_url, tr("Открыть официальную методику", "Open official methodology"), "the-text-link")}</article><article class="the-method-card"><span>${tr("Преобразование GIR", "GIR transformation")}</span><h3>${esc(formula.formula_version || countryMethod().formula_version || "gir-the-engineering-country-v1")}</h3><p>${esc(lang() === "ru" ? formula.method_notes_ru : formula.method_notes_en)}</p><div class="the-formula is-compact"><code>${esc(lang() === "ru" ? formula.normalization_ru : formula.normalization_en)}</code></div><p><b>${tr("Диапазоны мест:", "Rank bands:")}</b> ${tr("в интерфейсе сохраняется официальное обозначение; midpoint применяется только как явно документированная вычислительная аппроксимация.", "the official display is retained; the midpoint is used only as an explicitly documented computational approximation.")}</p></article><article class="the-method-card"><span>${tr("Управление данными", "Data governance")}</span><h3>${tr("Raw-файл не раздаётся публично", "The raw file is not publicly distributed")}</h3><dl><div><dt>${tr("Режим поставки", "Distribution mode")}</dt><dd>${esc(governance.distribution_decision || status().release?.redistribution_mode || "exclude_raw_keep_derived")}</dd></div><div><dt>${tr("Публичные результаты", "Public outputs")}</dt><dd>${tr("Метаданные, методика, страновая агрегация и разрешённые производные выгрузки", "Metadata, methodology, country aggregation and permitted derived exports")}</dd></div><div><dt>${tr("Атрибуция", "Attribution")}</dt><dd>${esc(governance.attribution || "Times Higher Education")}</dd></div></dl>${externalLink(governance.terms_url, tr("Условия использования THE", "THE terms of use"), "the-text-link")}</article></div><div class="the-limit-grid"><article><b>${tr("Не интерпретировать как", "Do not interpret as")}</b><p>${tr("официальный рейтинг стран THE, прямую оценку качества всей национальной системы высшего образования или причинный эффект образовательной политики.", "an official THE country ranking, a direct assessment of an entire national higher-education system or a causal effect of education policy.")}</p></article><article><b>${tr("Корректная интерпретация", "Appropriate interpretation")}</b><p>${tr("сравнительная характеристика представленного в THE сегмента инженерных университетов, чувствительная к широте представительства, лучшей и медианной позиции, а также профилю пяти официальных столпов.", "a comparative profile of the engineering-university segment represented in THE, sensitive to representation breadth, the best and median rank, and the five official pillars.")}</p></article><article><b>${tr("Главное ограничение", "Principal limitation")}</b><p>${tr("страны без университетов в официальной таблице не получают нулевой score: их результат отсутствует, поскольку измеряемая вселенная не наблюдается.", "countries without universities in the official table do not receive a zero score: the result is missing because the measured universe is not observed.")}</p></article></div><div class="the-method-actions"><button type="button" class="the-button" data-the-route="methodology">${tr("Открыть методологическую Wiki GIR", "Open the GIR methodology Wiki")}</button><a class="the-button is-secondary" href="/data-lab">${tr("Перейти к каталогу данных", "Open the data catalogue")}</a></div></section>`;
  }

  function renderPage() {
    context.root.innerHTML = `<main class="the-workspace" data-publication-state="${esc(publicationState().code)}">${commandHeader()}${viewTabs()}${activeViewPanel()}</main>`;
    bind();
  }

  function rerenderWithFocus(selector) {
    renderPage();
    requestAnimationFrame(() => context.root.querySelector(selector)?.focus());
  }

  function bind() {
    context.root.querySelectorAll("[data-the-scroll]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.theScroll)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })));
    context.root.querySelectorAll("[data-the-route]").forEach((button) => button.addEventListener("click", () => context.routeTo?.(button.dataset.theRoute)));
    context.root.querySelectorAll("[data-the-provenance]").forEach((button) => button.addEventListener("click", () => context.openProvenance?.(button.dataset.theProvenance, button)));
    context.root.querySelectorAll("[data-the-country]").forEach((button) => button.addEventListener("click", () => context.selectCountry?.(button.dataset.theCountry)));
    context.root.querySelector("#theInstitutionSearch")?.addEventListener("input", (event) => { ui.institutionQuery = event.target.value; ui.institutionPage = 1; rerenderWithFocus("#theInstitutionSearch"); });
    context.root.querySelector("#theRankingSearch")?.addEventListener("input", (event) => { ui.rankingQuery = event.target.value; ui.rankingPage = 1; rerenderWithFocus("#theRankingSearch"); });
    context.root.querySelectorAll("[data-the-institution-page]").forEach((button) => button.addEventListener("click", () => { ui.institutionPage += button.dataset.theInstitutionPage === "next" ? 1 : -1; renderPage(); document.getElementById("theInstitutions")?.scrollIntoView({ block: "start" }); }));
    context.root.querySelectorAll("[data-the-ranking-page]").forEach((button) => button.addEventListener("click", () => { ui.rankingPage += button.dataset.theRankingPage === "next" ? 1 : -1; renderPage(); document.getElementById("theWorld")?.scrollIntoView({ block: "start" }); }));
    context.root.querySelectorAll("[data-the-view]").forEach((button) => button.addEventListener("click", () => {
      ui.activeView = button.dataset.theView || "overview";
      renderPage();
      requestAnimationFrame(() => context.root.querySelector(`.the-view-tabs [data-the-view="${ui.activeView}"]`)?.focus());
    }));
    const tabs = [...context.root.querySelectorAll(".the-view-tabs [role=tab]")];
    tabs.forEach((tab, index) => tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next == null) return;
      event.preventDefault();
      ui.activeView = tabs[next].dataset.theView || "overview";
      renderPage();
      requestAnimationFrame(() => context.root.querySelector(`.the-view-tabs [data-the-view="${ui.activeView}"]`)?.focus());
    }));
    context.root.querySelector("[data-the-retry]")?.addEventListener("click", () => { invalidate(); render(context); });
    const universityMapHost = context.root.querySelector('[data-university-map-host="THE_ENG"]');
    if (universityMapHost && window.GIRUniversityMap?.render) {
      window.GIRUniversityMap.render(universityMapHost, {
        sourceCode: "THE_ENG",
        year: Number(status().release?.edition_year || 2026),
        lang: lang(),
        selectedCountry: selectedIso3(),
        eyebrow: "THE Engineering 2026",
        title: tr("Мировая карта университетов THE Engineering", "World map of THE Engineering universities"),
        subtitle: tr("Цвет показывает диапазон места, размер — overall score; карта соблюдает отдельный gate публикации университетских строк.", "Colour shows the rank band and size represents the overall score; the map respects the separate institution-row publication gate."),
        openProvenance: context.openProvenance,
        selectCountry: context.selectCountry,
      });
    }
  }

  async function render(nextContext) {
    context = nextContext;
    if (!context?.root || !selectedIso3()) return;
    const token = ++renderToken;
    context.root.innerHTML = loading();
    try {
      model = await load();
      if (token !== renderToken) return;
      ui.rankingPage = 1;
      ui.institutionPage = 1;
      renderPage();
      window.dispatchEvent(new CustomEvent("gir:the-engineering-ready", { detail: { loaded: status().loaded, country: selectedIso3(), edition: status().release?.edition_year || 2026 } }));
    } catch (error) {
      if (token !== renderToken) return;
      context.root.innerHTML = errorState(error);
      bind();
      console.error("THE Engineering workspace failed", error);
    }
  }

  function invalidate({ all = false, country = selectedIso3() } = {}) {
    renderToken += 1;
    if (all) {
      cache.status = null;
      cache.methodology = null;
      cache.workspace.clear();
      return;
    }
    for (const key of cache.workspace.keys()) if (key.startsWith(`${country}:`)) cache.workspace.delete(key);
  }

  window.addEventListener("pagehide", () => { renderToken += 1; });

  window.GIRTHEEngineering = Object.freeze({ render, invalidate });
})();
