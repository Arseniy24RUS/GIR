(function exposeGIRLanding(global) {
  "use strict";

  const ASSET_BASE = "/static/landing";
  const VALID_LANGS = new Set(["ru", "en"]);
  const VALID_THEMES = new Set(["light", "dark"]);
  const WORKFLOW_ICONS = Object.freeze([
    "user-round.svg",
    "table-2.svg",
    "chart-no-axes-combined.svg",
    "map.svg",
    "landmark.svg",
    "database.svg",
  ]);
  const EVIDENCE_ICONS = Object.freeze([
    "landmark.svg",
    "server.svg",
    "network.svg",
    "chart-no-axes-combined.svg",
    "flag.svg",
  ]);
  const AUDIENCE_ICONS = Object.freeze([
    "landmark.svg",
    "graduation-cap.svg",
    "network.svg",
    "briefcase-business.svg",
  ]);

  let LAST_CONTEXT = null;

  const CONTENT = Object.freeze({
    ru: Object.freeze({
      hero: Object.freeze({
        title: "GIR — глобальная платформа анализа стран",
        lead: "44 индекса и рейтинга в восьми тематических направлениях — от человеческого развития и институтов до ИИ, экологии, безопасности и университетов.",
        copy: "Профили стран, международные сравнения, карты, временные ряды и исходные данные — с формулами, версиями и происхождением каждого значения.",
        primary: "Запросить доступ",
        secondary: "Посмотреть платформу",
        portfolio: "Изучить портфель",
        methods: "Научная документация",
        imageAlt: "Глобальная аналитическая среда GIR с картой мира, графиками и потоками данных",
        proof: Object.freeze([
          ["44", "аналитических модуля"],
          ["8", "тематических направлений"],
          ["230", "стран и территорий"],
          ["1990–2026", "временной охват"],
        ]),
      }),
      scale: Object.freeze({
        title: "Масштаб платформы виден сразу",
        copy: "GIR объединяет десятки международных выпусков в единую исследовательскую инфраструктуру. Масштаб показан содержательными объектами — странами, наблюдениями, источниками, снимками и воспроизводимыми расчётами.",
        metrics: Object.freeze([
          Object.freeze({ key: "numeric", label: "модулей с числовыми выпусками", icon: "chart-no-axes-combined.svg" }),
          Object.freeze({ key: "tables", label: "таблиц в локальной аналитической базе", icon: "server.svg" }),
          Object.freeze({ key: "records", label: "записей в опубликованных массивах", icon: "boxes.svg" }),
          Object.freeze({ key: "sources", label: "зарегистрированных источника", icon: "landmark.svg" }),
          Object.freeze({ key: "snapshots", label: "архивных снимков данных", icon: "database.svg" }),
          Object.freeze({ key: "artifacts", label: "артефактов воспроизводимости", icon: "network.svg" }),
        ]),
        note: "Каждый опубликованный модуль имеет отдельную шкалу, редакцию, методический статус и доказательную цепочку. Лендинг показывает только пользовательски значимые release-метрики.",
      }),
      portfolio: Object.freeze({
        title: "Восемь направлений. Сорок четыре способа исследовать страну",
        copy: "Портфель организован по содержательным задачам, а не по внутренней архитектуре проекта. Раскройте направление, чтобы увидеть все входящие индексы, рейтинги и исследовательские модули.",
        searchLabel: "Поиск по портфелю GIR",
        searchPlaceholder: "Найти индекс, рейтинг, тему или организацию",
        searchHint: "Например: V-Dem, энергетический переход, университеты, Всемирный банк",
        searchEmpty: "Совпадений не найдено. Попробуйте название, код, тему или издателя.",
        modules: "модулей",
        published: "числовой выпуск",
        sourceGated: "контур готов",
        open: "Открыть модуль",
        expand: "Показать модули",
        collapse: "Скрыть модули",
      }),
      product: Object.freeze({
        title: "Платформа в работе",
        copy: "GIR — не каталог ссылок и не статичный отчёт. Каждое направление раскрывается через полноценное рабочее пространство с интерактивной аналитикой и переходом к доказательствам.",
        open: "Открыть рабочее пространство",
        views: Object.freeze([
          Object.freeze({
            key: "htei-platform",
            route: "index-HTEI",
            title: "Авторские индексы и компонентная диагностика",
            copy: "Индекс занятости в высокотехнологичных отраслях показывает итоговую оценку, место, неопределённость, свежесть данных и вклад каждого компонента — от технологических профессий до корпоративного участия в НИОКР.",
            alt: "Рабочее пространство Индекса занятости в высокотехнологичных отраслях в платформе GIR",
          }),
          Object.freeze({
            key: "university-map",
            route: "index-QS_ET",
            title: "Аналитика QS",
            copy: "Мировой рейтинг, предметные области, устойчивость, регионы и университетская география объединены в одном исследовательском пространстве без искусственного супериндекса.",
            alt: "Аналитика QS и мировая карта университетов в платформе GIR",
          }),
          Object.freeze({
            key: "data-explorer",
            href: "/data-explorer",
            title: "Исходные показатели как график, таблица или выгрузка",
            copy: "Лаборатория данных позволяет выбрать источник, показатель, страны и годы, построить визуализацию, скачать выборку и проверить происхождение отдельного наблюдения.",
            alt: "Обозреватель данных с экологическими показателями в платформе GIR",
          }),
          Object.freeze({
            key: "gpi-platform",
            route: "index-GPI",
            title: "Специализированные международные рейтинги",
            copy: "От миролюбия и качества институтов до цифровой готовности и устойчивости — каждый рейтинг сохраняет собственную методику, направление шкалы и ограничения интерпретации.",
            alt: "Рабочее пространство Глобального индекса миролюбия в платформе GIR",
          }),
        ]),
      }),
      workflows: Object.freeze({
        title: "Одна платформа — шесть исследовательских сценариев",
        copy: "Пользователь начинает с задачи, а не с названия таблицы. Все сценарии связаны между собой и ведут от краткого вывода к исходным данным.",
        open: "Перейти",
        items: Object.freeze([
          Object.freeze({ route: "country", title: "Профиль страны", copy: "Сводная диагностика по тематическим направлениям, позициям, динамике, разрывам и источникам." }),
          Object.freeze({ route: "matrix", title: "Сравнение стран", copy: "Матрицы, распределения, диаграммы рассеяния и сопоставление групп государств по выбранным показателям." }),
          Object.freeze({ href: "/data-explorer", title: "Обозреватель данных", copy: "44 модуля, исходные показатели, таблицы, графики, фильтры и воспроизводимые выгрузки." }),
          Object.freeze({ route: "index-QS_ET", title: "Аналитика QS", copy: "Мировой рейтинг университетов, 55 дисциплин, страновые системы и пространственная карта образовательной инфраструктуры." }),
          Object.freeze({ route: "methodology", title: "Научная документация", copy: "Формулы, нормализация, пропуски, версии, ограничения, лицензирование и происхождение данных." }),
          Object.freeze({ route: "data-updates", title: "Центр обновления", copy: "Новые выпуски, подготовка, валидация, зависимые пересчёты, публикация и откат." }),
        ]),
      }),
      audience: Object.freeze({
        title: "Создано для решений, исследований и сотрудничества",
        copy: "GIR объединяет научную строгость и продуктовую доступность. Платформа подходит как для быстрого знакомства с международным положением страны, так и для глубокой воспроизводимой работы.",
        items: Object.freeze([
          Object.freeze({ title: "Органы управления", copy: "Комплексная диагностика страны, международные ориентиры, ограничения и практические направления политики." }),
          Object.freeze({ title: "Университеты", copy: "Сравнение национальных систем, университетские рейтинги, образовательные результаты и международная география." }),
          Object.freeze({ title: "Научные организации", copy: "Исходные наблюдения, формулы, версии, флаги качества, воспроизводимость и экспорт исследовательских выборок." }),
          Object.freeze({ title: "Аналитические команды", copy: "Быстрое сопоставление стран и тематик без необходимости собирать десятки разрозненных международных источников." }),
        ]),
      }),
      evidence: Object.freeze({
        title: "От официального выпуска до проверяемого вывода",
        copy: "Доказательная цепочка встроена в пользовательский опыт. Любой вывод можно проследить до исходного файла, версии, преобразования и правила расчёта.",
        steps: Object.freeze([
          Object.freeze({ number: "01", title: "Источник", copy: "Официальный API, файл, отчёт или разрешённый экспорт." }),
          Object.freeze({ number: "02", title: "Снимок данных", copy: "Дата получения, редакция, лицензия, локальный архив и SHA-256." }),
          Object.freeze({ number: "03", title: "Гармонизация", copy: "Страны, годы, единицы, классификации и документированные правила пропусков." }),
          Object.freeze({ number: "04", title: "Расчёт", copy: "Официальное значение или версионируемая формула GIR с отдельными проверками качества." }),
          Object.freeze({ number: "05", title: "Интерпретация", copy: "Позиция, компоненты, динамика, международный контекст и практический вывод." }),
        ]),
      }),
      trust: Object.freeze({
        title: "Научная работа становится видимой частью продукта",
        copy: "Пользователь видит не только красивый график, но и масштаб базы, статус источника, методические ограничения и происхождение значения. Это превращает GIR в исследовательскую инфраструктуру, а не в набор эффектных карточек.",
        metrics: Object.freeze([
          Object.freeze({ key: "tables", label: "таблиц данных и аудита" }),
          Object.freeze({ key: "sources", label: "зарегистрированных источника" }),
          Object.freeze({ key: "snapshots", label: "архивных снимков данных" }),
          Object.freeze({ key: "artifacts", label: "артефактов воспроизводимости" }),
        ]),
      }),
      final: Object.freeze({
        title: "Получите доступ к полной платформе GIR",
        copy: "Расскажите о Вашей исследовательской, образовательной или управленческой задаче. Мы покажем возможности платформы, подготовим доступ и обсудим формат сотрудничества.",
        primary: "Запросить доступ",
        secondary: "Посмотреть научную документацию",
        portfolio: "Вернуться к портфелю",
      }),
    }),
    en: Object.freeze({
      hero: Object.freeze({
        title: "GIR — a global platform for country intelligence",
        lead: "44 indices and rankings across eight thematic domains — from human development and institutions to AI, resilience, security and universities.",
        copy: "Country profiles, international comparisons, maps, time series and source data — with formulas, editions and provenance for every value.",
        primary: "Request access",
        secondary: "See the platform",
        portfolio: "Explore the portfolio",
        methods: "Scientific documentation",
        imageAlt: "GIR global analytical environment with a world map, charts and data flows",
        proof: Object.freeze([
          ["44", "analytical modules"],
          ["8", "thematic domains"],
          ["230", "countries and territories"],
          ["1990–2026", "time coverage"],
        ]),
      }),
      scale: Object.freeze({
        title: "The scale of the platform is visible from the start",
        copy: "GIR brings dozens of international releases into one research infrastructure. Scale is shown through substantive objects: countries, observations, sources, snapshots and reproducible computations.",
        metrics: Object.freeze([
          Object.freeze({ key: "numeric", label: "modules with numeric releases", icon: "chart-no-axes-combined.svg" }),
          Object.freeze({ key: "tables", label: "tables in the local analytics database", icon: "server.svg" }),
          Object.freeze({ key: "records", label: "records in published datasets", icon: "boxes.svg" }),
          Object.freeze({ key: "sources", label: "registered sources", icon: "landmark.svg" }),
          Object.freeze({ key: "snapshots", label: "archived snapshots", icon: "database.svg" }),
          Object.freeze({ key: "artifacts", label: "reproducibility artifacts", icon: "network.svg" }),
        ]),
        note: "Every published module retains its own scale, edition, methodological status and evidence chain. The landing page shows only user-facing release metrics.",
      }),
      portfolio: Object.freeze({
        title: "Eight domains. Forty-four ways to study a country",
        copy: "The portfolio is organised around substantive questions, not the internal architecture of the project. Expand a domain to see every index, ranking and research module it contains.",
        searchLabel: "Search the GIR portfolio",
        searchPlaceholder: "Find an index, ranking, topic or organisation",
        searchHint: "For example: V-Dem, energy transition, universities, World Bank",
        searchEmpty: "No matches. Try a title, code, topic or publisher.",
        modules: "modules",
        published: "numeric release",
        sourceGated: "workspace ready",
        open: "Open module",
        expand: "Show modules",
        collapse: "Hide modules",
      }),
      product: Object.freeze({
        title: "The platform in action",
        copy: "GIR is not a link directory or a static report. Every domain opens into a complete analytical workspace with interactive evidence and a direct path to sources.",
        open: "Open workspace",
        views: Object.freeze([
          Object.freeze({ key: "htei-platform", route: "index-HTEI", title: "Project-developed indices and component diagnostics", copy: "HTEI combines the final score, rank, uncertainty, freshness and the contribution of each component — from technology occupations to business R&D participation.", alt: "HTEI workspace in the GIR platform" }),
          Object.freeze({ key: "university-map", route: "index-QS_ET", title: "QS Intelligence: universities and 55 subjects", copy: "The world ranking, subject areas, sustainability, regions and university geography are combined in one analytical workspace without an invented super-score.", alt: "QS Intelligence and the global university map in the GIR platform" }),
          Object.freeze({ key: "data-explorer", href: "/data-explorer", title: "Source indicators as charts, tables or downloads", copy: "Data Lab lets users choose a source, indicator, countries and years, build a view, download the selection and inspect provenance for a single observation.", alt: "Data Explorer with environmental indicators in the GIR platform" }),
          Object.freeze({ key: "gpi-platform", route: "index-GPI", title: "Specialised international rankings", copy: "From peacefulness and governance to digital readiness and resilience, every ranking keeps its own methodology, direction and interpretive limits.", alt: "Global Peace Index workspace in the GIR platform" }),
        ]),
      }),
      workflows: Object.freeze({
        title: "One platform — six research workflows",
        copy: "Users start with a question, not a database table. Every workflow connects to the next and leads from a concise finding to the source data.",
        open: "Open",
        items: Object.freeze([
          Object.freeze({ route: "country", title: "Country profile", copy: "A thematic diagnosis of positions, trends, gaps and sources." }),
          Object.freeze({ route: "matrix", title: "Country comparison", copy: "Matrices, distributions, scatterplots and comparison of country groups." }),
          Object.freeze({ href: "/data-explorer", title: "Data Explorer", copy: "44 modules, source indicators, charts, tables, filters and reproducible exports." }),
          Object.freeze({ route: "index-QS_ET", title: "QS Intelligence", copy: "World university rankings, 55 subjects, country systems and the spatial structure of educational infrastructure." }),
          Object.freeze({ route: "methodology", title: "Scientific documentation", copy: "Formulas, normalisation, missing data, versions, licensing and provenance." }),
          Object.freeze({ route: "data-updates", title: "Update Center", copy: "New releases, staging, validation, dependent recomputation, publication and rollback." }),
        ]),
      }),
      audience: Object.freeze({
        title: "Built for decisions, research and collaboration",
        copy: "GIR combines scientific rigour with product clarity. It supports both rapid orientation and deep reproducible analysis.",
        items: Object.freeze([
          Object.freeze({ title: "Public institutions", copy: "Integrated country diagnosis, international benchmarks, constraints and policy directions." }),
          Object.freeze({ title: "Universities", copy: "National systems, university rankings, learning outcomes and international geography." }),
          Object.freeze({ title: "Research organisations", copy: "Source observations, formulas, versions, quality flags, reproducibility and exports." }),
          Object.freeze({ title: "Analytical teams", copy: "Fast comparison of countries and themes without assembling dozens of fragmented sources." }),
        ]),
      }),
      evidence: Object.freeze({
        title: "From an official release to a verifiable conclusion",
        copy: "The evidence chain is part of the user experience. Every conclusion can be traced to the source file, edition, transformation and calculation rule.",
        steps: Object.freeze([
          Object.freeze({ number: "01", title: "Source", copy: "Official API, file, report or authorised export." }),
          Object.freeze({ number: "02", title: "Snapshot", copy: "Retrieval date, edition, licence, local archive and SHA-256." }),
          Object.freeze({ number: "03", title: "Harmonisation", copy: "Countries, years, units, classifications and documented missing-data rules." }),
          Object.freeze({ number: "04", title: "Computation", copy: "Official value or a versioned GIR formula with separate quality gates." }),
          Object.freeze({ number: "05", title: "Interpretation", copy: "Position, components, trend, international context and practical conclusion." }),
        ]),
      }),
      trust: Object.freeze({
        title: "Scientific work becomes a visible part of the product",
        copy: "Users see not only a polished chart, but also the scale of the database, source status, methodological limits and provenance. This makes GIR a research infrastructure rather than a collection of attractive cards.",
        metrics: Object.freeze([
          Object.freeze({ key: "tables", label: "data and audit tables" }),
          Object.freeze({ key: "sources", label: "registered sources" }),
          Object.freeze({ key: "snapshots", label: "archived snapshots" }),
          Object.freeze({ key: "artifacts", label: "reproducibility artifacts" }),
        ]),
      }),
      final: Object.freeze({
        title: "Request access to the complete GIR platform",
        copy: "Tell us about your research, education or policy task. We will demonstrate the platform, prepare access and discuss a collaboration format.",
        primary: "Request access",
        secondary: "Scientific documentation",
        portfolio: "Back to the portfolio",
      }),
    }),
  });

  function normalizeLang(lang) { return VALID_LANGS.has(lang) ? lang : "ru"; }
  function normalizeTheme(theme) { return VALID_THEMES.has(theme) ? theme : "dark"; }
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function formatNumber(value, lang, maximumFractionDigits = 0) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "—";
    return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits }).format(numeric);
  }
  function renderArrow() { return '<span class="gir-landing__button-arrow" aria-hidden="true"></span>'; }
  function renderIcon(icon, className = "gir-landing__icon") {
    return `<span class="${className}" style="--landing-icon:url('/static/icons/${escapeHtml(icon)}')" aria-hidden="true"></span>`;
  }
  function renderPicture({ className, file, alt, width, height, eager = false, role = "image" }) {
    return `<picture class="${escapeHtml(className)}" data-asset-role="${escapeHtml(role)}">
      <source srcset="${ASSET_BASE}/${escapeHtml(file)}.webp" type="image/webp">
      <img src="${ASSET_BASE}/${escapeHtml(file)}.png" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>
    </picture>`;
  }
  function renderRouteButton(label, route, variant = "primary") {
    return `<button class="gir-landing__button gir-landing__button--${variant}" type="button" data-route-target="${escapeHtml(route)}"><span>${escapeHtml(label)}</span>${renderArrow()}</button>`;
  }
  function renderExternalButton(label, href, variant = "outline") {
    return `<a class="gir-landing__button gir-landing__button--${variant}" href="${escapeHtml(href)}"><span>${escapeHtml(label)}</span>${renderArrow()}</a>`;
  }
  function renderCooperationButton(label, variant = "primary") {
    return `<button class="gir-landing__button gir-landing__button--${variant}" type="button" data-open-cooperation><span>${escapeHtml(label)}</span>${renderArrow()}</button>`;
  }
  function renderScrollButton(label, target, variant = "outline") {
    return `<button class="gir-landing__button gir-landing__button--${variant}" type="button" data-landing-scroll="${escapeHtml(target)}"><span>${escapeHtml(label)}</span>${renderArrow()}</button>`;
  }

  function readinessSets(summary) {
    return {
      numeric: new Set(summary?.portfolio?.numeric_codes || []),
      gated: new Set(summary?.portfolio?.source_gated_codes || []),
    };
  }

  function portfolioGroups(summary, lang) {
    const status = readinessSets(summary);
    return (global.GIRIndexPortfolio?.groups?.() || []).map((group) => {
      const items = group.items.map((entry) => ({
        ...entry,
        numeric: status.numeric.has(entry.code),
        gated: status.gated.has(entry.code),
      }));
      return {
        ...group,
        label: group[lang === "ru" ? "label_ru" : "label_en"],
        description: group[lang === "ru" ? "description_ru" : "description_en"],
        items,
      };
    });
  }

  function scaleValues(summary) {
    return {
      numeric: summary?.portfolio?.numeric_release_modules,
      records: summary?.portfolio?.observations_total,
      sources: summary?.scale?.registered_sources,
      snapshots: summary?.scale?.raw_snapshots,
      artifacts: summary?.scale?.reproducibility_artifacts,
      tables: summary?.scale?.database_tables,
    };
  }

  function renderHero(summary, copy, theme) {
    const portfolio = summary?.portfolio || {};
    const proof = copy.proof.map(([value, label], index) => {
      const actual = index === 0 ? portfolio.total_modules : index === 1 ? portfolio.groups : index === 2 ? summary?.scale?.countries : `${summary?.scale?.year_min || 1990}–${summary?.scale?.year_max || 2026}`;
      return `<div><strong>${escapeHtml(actual || value)}</strong><span>${escapeHtml(label)}</span></div>`;
    }).join("");
    return `<section class="landing-hero gir-landing__hero" aria-labelledby="gir-landing-title">
      ${renderPicture({ className: "gir-landing__hero-picture", file: `hero/hero-${theme}`, alt: copy.imageAlt, width: 1672, height: 941, eager: true, role: "hero" })}
      <div class="gir-landing__hero-copy">
        <h1 id="gir-landing-title">${escapeHtml(copy.title)}</h1>
        <p class="gir-landing__hero-lead">${escapeHtml(copy.lead)}</p>
        <p class="gir-landing__hero-text">${escapeHtml(copy.copy)}</p>
        <div class="gir-landing__hero-proof" aria-label="${escapeHtml(copy.portfolio)}">${proof}</div>
        <div class="gir-landing__actions">
          ${renderCooperationButton(copy.primary, "primary")}
          ${renderScrollButton(copy.secondary, "#gir-landing-product", "outline")}
        </div>
        <div class="gir-landing__hero-links">
          <button type="button" class="gir-landing__text-link" data-landing-scroll="#gir-landing-portfolio">${escapeHtml(copy.portfolio)}${renderArrow()}</button>
          <button type="button" class="gir-landing__text-link" data-route-target="methodology">${escapeHtml(copy.methods)}${renderArrow()}</button>
        </div>
      </div>
    </section>`;
  }

  function renderScale(summary, copy, lang) {
    const values = scaleValues(summary);
    const metrics = copy.metrics.map((metric) => `<article class="gir-landing__scale-item">
      ${renderIcon(metric.icon, "gir-landing__metric-icon")}
      <div><strong>${formatNumber(values[metric.key], lang)}</strong><span>${escapeHtml(metric.label)}</span></div>
    </article>`).join("");
    return `<section class="gir-landing__section gir-landing__scale" aria-labelledby="gir-landing-scale-title">
      <div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-scale-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div>
      <div class="gir-landing__scale-grid">${metrics}</div>
      <p class="gir-landing__scale-note">${escapeHtml(copy.note)}</p>
    </section>`;
  }

  function renderSearch(copy) {
    return `<div class="gir-landing__portfolio-search">
      <label for="girPortfolioSearch">${escapeHtml(copy.searchLabel)}</label>
      <div class="gir-landing__portfolio-search-field">${renderIcon("search.svg", "gir-landing__search-icon")}<input id="girPortfolioSearch" type="search" autocomplete="off" placeholder="${escapeHtml(copy.searchPlaceholder)}" data-landing-search aria-controls="girPortfolioResults"></div>
      <p>${escapeHtml(copy.searchHint)}</p>
      <div id="girPortfolioResults" class="gir-landing__search-results" data-landing-search-results aria-live="polite" hidden></div>
    </div>`;
  }

  function renderPortfolio(groups, copy, summary, lang) {
    const numericCodes = new Set(summary?.portfolio?.numeric_codes || []);
    const cards = groups.map((group, index) => {
      const items = group.items.map((entry) => {
        const numeric = numericCodes.has(entry.code);
        const name = entry[lang === "ru" ? "name_ru" : "name_en"];
        const short = entry[lang === "ru" ? "short_ru" : "short_en"];
        return `<button type="button" class="gir-landing__portfolio-item" data-route-target="${escapeHtml(entry.route)}" data-module-search="${escapeHtml([entry.code, short, name, entry.authority, group.label, group.description].join(" ").toLowerCase())}">
          <span class="gir-landing__portfolio-code">${escapeHtml(short)}</span>
          <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(entry.authority)} · ${escapeHtml(numeric ? copy.published : copy.sourceGated)}</small></span>
          ${renderArrow()}
        </button>`;
      }).join("");
      const panelId = `girLandingGroup${index}`;
      return `<article class="gir-landing__portfolio-card" data-landing-group-card data-group-key="${escapeHtml(group.key)}">
        <button type="button" class="gir-landing__portfolio-toggle" data-landing-group-toggle aria-expanded="false" aria-controls="${panelId}">
          ${renderIcon(group.icon, "gir-landing__portfolio-icon")}
          <span class="gir-landing__portfolio-copy"><strong>${escapeHtml(group.label)}</strong><small>${escapeHtml(group.description)}</small></span>
          <span class="gir-landing__portfolio-count"><b>${group.items.length}</b><small>${escapeHtml(copy.modules)}</small></span>
          <span class="gir-landing__portfolio-chevron" aria-hidden="true"></span>
        </button>
        <div id="${panelId}" class="gir-landing__portfolio-items" hidden>${items}</div>
      </article>`;
    }).join("");
    return `<section id="gir-landing-portfolio" class="gir-landing__section gir-landing__portfolio" aria-labelledby="gir-landing-portfolio-title">
      <div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-portfolio-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div>
      ${renderSearch(copy)}
      <div class="gir-landing__portfolio-grid">${cards}</div>
    </section>`;
  }

  function renderProductViews(copy) {
    return copy.views.map((view, index) => {
      const action = view.href ? renderExternalButton(copy.open, view.href, "outline") : renderRouteButton(copy.open, view.route, "outline");
      return `<article class="gir-landing__product-row${index % 2 ? " is-reversed" : ""}">
        <div class="gir-landing__product-copy"><span class="gir-landing__sequence" aria-hidden="true">0${index + 1}</span><h3>${escapeHtml(view.title)}</h3><p>${escapeHtml(view.copy)}</p>${action}</div>
        <figure class="gir-landing__product-figure">
          <div class="gir-landing__browser-frame"><div class="gir-landing__browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>GIR · ${escapeHtml(view.title)}</span></div>${renderPicture({ className: "gir-landing__product-picture", file: `showcase/${view.key}`, alt: view.alt, width: 1440, height: 900, eager: index === 0, role: "product-screen" })}</div>
          <figcaption>${escapeHtml(view.title)}</figcaption>
        </figure>
      </article>`;
    }).join("");
  }

  function renderProduct(copy) {
    return `<section id="gir-landing-product" class="gir-landing__section gir-landing__product" aria-labelledby="gir-landing-product-title">
      <div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-product-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div>
      <div class="gir-landing__product-list">${renderProductViews(copy)}</div>
    </section>`;
  }

  function renderWorkflows(copy) {
    const items = copy.items.map((item, index) => {
      const action = item.href ? `<a class="gir-landing__route-link" href="${escapeHtml(item.href)}"><span>${escapeHtml(copy.open)}</span>${renderArrow()}</a>` : `<button type="button" class="gir-landing__route-link" data-route-target="${escapeHtml(item.route)}"><span>${escapeHtml(copy.open)}</span>${renderArrow()}</button>`;
      return `<article class="gir-landing__route-item"><div class="gir-landing__route-number">0${index + 1}</div>${renderIcon(WORKFLOW_ICONS[index], "gir-landing__route-icon")}<div class="gir-landing__route-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></div>${action}</article>`;
    }).join("");
    return `<section class="gir-landing__section gir-landing__routes" aria-labelledby="gir-landing-routes-title"><div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-routes-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div><div class="gir-landing__route-list">${items}</div></section>`;
  }

  function renderAudience(copy) {
    const cards = copy.items.map((item, index) => `<article class="gir-landing__audience-card">${renderIcon(AUDIENCE_ICONS[index], "gir-landing__audience-icon")}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></article>`).join("");
    return `<section class="gir-landing__section gir-landing__audience" aria-labelledby="gir-landing-audience-title"><div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-audience-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div><div class="gir-landing__audience-grid">${cards}</div></section>`;
  }

  function renderEvidence(copy) {
    const steps = copy.steps.map((step, index) => `<article class="gir-landing__evidence-step">${renderIcon(EVIDENCE_ICONS[index], "gir-landing__evidence-icon")}<div><span>${escapeHtml(step.number)}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.copy)}</p></div></article>`).join("");
    return `<section class="gir-landing__section gir-landing__evidence" aria-labelledby="gir-landing-evidence-title"><div class="gir-landing__section-heading is-wide"><h2 id="gir-landing-evidence-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div><div class="gir-landing__evidence-grid">${steps}</div></section>`;
  }

  function renderTrust(summary, copy, lang) {
    const values = scaleValues(summary);
    const metrics = copy.metrics.map((metric) => `<div class="gir-landing__trust-metric"><strong>${formatNumber(values[metric.key], lang)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join("");
    return `<section class="gir-landing__section gir-landing__trust" aria-labelledby="gir-landing-trust-title"><div class="gir-landing__trust-copy"><h2 id="gir-landing-trust-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div><div class="gir-landing__trust-grid">${metrics}</div></section>`;
  }

  function renderFinal(copy) {
    return `<section class="gir-landing__final" aria-labelledby="gir-landing-final-title"><div><h2 id="gir-landing-final-title">${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.copy)}</p></div><div class="gir-landing__actions">${renderCooperationButton(copy.primary, "inverse")}${renderRouteButton(copy.secondary, "methodology", "inverse-outline")}${renderScrollButton(copy.portfolio, "#gir-landing-portfolio", "inverse-outline")}</div></section>`;
  }

  function render(options) {
    const input = options || {};
    const lang = normalizeLang(input.lang);
    const theme = normalizeTheme(input.theme);
    const summary = input.summary || null;
    const copy = CONTENT[lang];
    const groups = portfolioGroups(summary, lang);
    LAST_CONTEXT = { lang, theme, summary, copy, groups };
    return `<div class="landing-page gir-landing" data-page="landing" data-locale="${lang}" data-theme="${theme}">
      ${renderHero(summary, copy.hero, theme)}
      ${renderScale(summary, copy.scale, lang)}
      ${renderProduct(copy.product)}
      ${renderPortfolio(groups, copy.portfolio, summary, lang)}
      ${renderWorkflows(copy.workflows)}
      ${renderAudience(copy.audience)}
      ${renderEvidence(copy.evidence)}
      ${renderTrust(summary, copy.trust, lang)}
      ${renderFinal(copy.final)}
    </div>`;
  }

  function moduleSearchText(entry, lang, group) {
    return [entry.code, entry.short_ru, entry.short_en, entry.name_ru, entry.name_en, entry.authority, group.label_ru, group.label_en, group.description_ru, group.description_en].join(" ").toLocaleLowerCase(lang === "ru" ? "ru" : "en");
  }

  function renderSearchResults(query) {
    const context = LAST_CONTEXT;
    if (!context) return "";
    const normalized = query.trim().toLocaleLowerCase(context.lang === "ru" ? "ru" : "en");
    if (!normalized) return "";
    const numericCodes = new Set(context.summary?.portfolio?.numeric_codes || []);
    const matches = [];
    for (const group of global.GIRIndexPortfolio?.groups?.() || []) {
      for (const entry of group.items) {
        if (!moduleSearchText(entry, context.lang, group).includes(normalized)) continue;
        matches.push({ entry, group, numeric: numericCodes.has(entry.code) });
      }
    }
    if (!matches.length) return `<p class="gir-landing__search-empty">${escapeHtml(context.copy.portfolio.searchEmpty)}</p>`;
    return matches.slice(0, 12).map(({ entry, group, numeric }) => {
      const name = entry[context.lang === "ru" ? "name_ru" : "name_en"];
      const short = entry[context.lang === "ru" ? "short_ru" : "short_en"];
      const groupLabel = group[context.lang === "ru" ? "label_ru" : "label_en"];
      const status = numeric ? context.copy.portfolio.published : context.copy.portfolio.sourceGated;
      return `<button type="button" data-route-target="${escapeHtml(entry.route)}"><b>${escapeHtml(short)}</b><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(groupLabel)} · ${escapeHtml(status)}</small></span>${renderArrow()}</button>`;
    }).join("");
  }

  function bind({ root } = {}) {
    if (!root) return;
    root.querySelectorAll("[data-landing-scroll]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = root.querySelector(button.dataset.landingScroll || "");
        target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    });
    root.querySelectorAll("[data-landing-group-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        const panel = root.querySelector(`#${CSS.escape(button.getAttribute("aria-controls") || "")}`);
        button.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
    const input = root.querySelector("[data-landing-search]");
    const results = root.querySelector("[data-landing-search-results]");
    if (input && results) {
      const update = () => {
        const html = renderSearchResults(input.value);
        results.innerHTML = html;
        results.hidden = !input.value.trim();
      };
      input.addEventListener("input", update);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { input.value = ""; update(); input.blur(); }
        if (event.key === "ArrowDown" && !results.hidden) { event.preventDefault(); results.querySelector("button")?.focus(); }
      });
      results.addEventListener("click", (event) => {
        const resultButton = event.target.closest("[data-route-target]");
        if (!resultButton) return;
        const route = resultButton.dataset.routeTarget;
        const routeProxy = [...root.querySelectorAll("[data-route-target]")].find((item) => item !== resultButton && item.dataset.routeTarget === route);
        routeProxy?.click();
      });
      results.addEventListener("keydown", (event) => {
        const buttons = [...results.querySelectorAll("button")];
        const index = buttons.indexOf(document.activeElement);
        if (event.key === "ArrowDown") { event.preventDefault(); buttons[(index + 1) % buttons.length]?.focus(); }
        if (event.key === "ArrowUp") { event.preventDefault(); (index <= 0 ? input : buttons[index - 1])?.focus(); }
        if (event.key === "Escape") { event.preventDefault(); input.value = ""; update(); input.focus(); }
      });
    }
  }

  global.GIRLanding = Object.freeze({ render, bind });
})(window);
