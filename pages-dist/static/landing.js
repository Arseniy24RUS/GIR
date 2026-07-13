(function exposeGIRLanding(global) {
  "use strict";

  const ASSET_BASE = "static/landing";
  const VALID_LANGS = new Set(["ru", "en"]);
  const VALID_THEMES = new Set(["light", "dark"]);
  const ROUTE_ICONS = Object.freeze([
    "user-round.svg",
    "table-2.svg",
    "chart-no-axes-combined.svg",
    "graduation-cap.svg",
    "database.svg",
  ]);
  const EVIDENCE_ICONS = Object.freeze([
    "landmark.svg",
    "server.svg",
    "network.svg",
    "chart-no-axes-combined.svg",
    "flag.svg",
  ]);

  const CONTENT = Object.freeze({
    ru: Object.freeze({
      hero: Object.freeze({
        title: "Глобальная аналитика человеческого капитала и технологических кадров",
        lead: "GIR объединяет международные индексы, исходные наблюдения и авторские модели в одной доказательной среде для сравнения стран и разработки решений для России.",
        copy: "Пользователь может перейти от позиции страны к компонентам, фактическим годам данных, источникам, формулам и практическим мерам — без знакомства с кодом и внутренней архитектурой проекта.",
        primary: "Изучить Россию",
        secondary: "Сравнить страны",
        methods: "Методы и источники",
        imageAlt: "Аналитическая система GIR с картой мира, графиками и потоками международных данных",
      }),
      snapshot: Object.freeze({
        title: "Что платформа показывает уже сейчас",
        copy: "Один пример исследовательского маршрута: от международного положения России к структуре результата и направлениям политики.",
        countryLabel: "Россия · релиз 2026",
        hteiTitle: "Индекс занятости в высокотехнологичных отраслях",
        hteiAlias: "HTEI",
        scoreScale: "из 100",
        rank: "место",
        percentile: "процентиль",
        confidence: "доверие к данным",
        coverage: "компонентов учтено",
        mode: "режим расчёта",
        strong: "Наиболее сильный компонент",
        weak: "Главный измеряемый разрыв",
        training: "Конкурентоспособность системы подготовки кадров",
        freshness: "Фактические годы компонентов",
        scoreInterval: "Интервал оценки",
        rankInterval: "Возможный диапазон мест",
        openCountry: "Открыть профиль России",
        openHtei: "Разобрать HTEI",
        note: "Расширенный международный рейтинг применяется, потому что Россия не входит в строгую четырёхкомпонентную вселенную прямых данных. Качество и свежесть показаны отдельно и не изменяют содержательный score.",
        unavailable: "Текущий аналитический срез загружается",
        modeLabels: Object.freeze({
          direct_core: "Строгий слой прямых данных",
          common_support: "Основной международный рейтинг",
          proxy_extended: "Расширенный международный рейтинг",
          asof_diagnostic: "Диагностический профиль последних данных",
        }),
      }),
      scale: Object.freeze({
        title: "Масштаб доказательной базы",
        copy: "Каждая цифра в интерфейсе опирается на сохранённый источник или воспроизводимый расчёт. Ниже показан фактический объём аналитического слоя текущей поставки.",
        metrics: Object.freeze([
          Object.freeze({ key: "countries", label: "стран и территорий", icon: "map.svg" }),
          Object.freeze({ key: "years", label: "временной охват", icon: "chart-no-axes-combined.svg" }),
          Object.freeze({ key: "index_scores", label: "индексных оценок", icon: "boxes.svg" }),
          Object.freeze({ key: "component_values", label: "компонентных значений", icon: "network.svg" }),
          Object.freeze({ key: "source_observations", label: "исходных наблюдений", icon: "server.svg" }),
          Object.freeze({ key: "raw_snapshots", label: "архивных срезов", icon: "database.svg" }),
        ]),
        pdfNote: "из них {value} PDF-документов",
        snapshotNote: "Срез базы обновлён по состоянию на {date}.",
      }),
      routes: Object.freeze({
        title: "Пять способов начать исследование",
        copy: "Главная страница не заставляет угадывать внутреннюю структуру системы. Каждый маршрут сформулирован как задача пользователя.",
        open: "Открыть",
        items: Object.freeze([
          Object.freeze({ target: "country", title: "Понять положение России", copy: "Семь индексных модулей, динамика, компоненты, международные ориентиры и рекомендации в одном профиле." }),
          Object.freeze({ target: "matrix", title: "Сравнить страны", copy: "Сопоставить позиции государств по человеческому капиталу, талантам, инновациям, цифровому развитию и технологической занятости." }),
          Object.freeze({ target: "index-HTEI", title: "Исследовать технологические кадры", copy: "Разобрать авторский HTEI по режимам, компонентам, свежести, неопределённости и происхождению данных." }),
          Object.freeze({ target: "htei-model", title: "Оценить систему подготовки кадров", copy: "Увидеть институциональную среду, образовательную инфраструктуру, корпоративные стратегии и международное сотрудничество." }),
          Object.freeze({ target: "methodology", title: "Проверить методы и источники", copy: "Ознакомиться с формулами, правилами обработки данных, методическими ограничениями и доказательной цепочкой." }),
        ]),
      }),
      indices: Object.freeze({
        title: "Семь взаимосвязанных измерений",
        copy: "Официальные международные индексы дополнены авторскими моделями проекта. Исходные шкалы не смешиваются: для межмодульного сравнения используются место, процентиль и явно обозначенная шкала score.",
        items: Object.freeze([
          Object.freeze({ code: "ИЧР", alias: "HDI", name: "Человеческое развитие", copy: "Здоровье, образование и уровень жизни." }),
          Object.freeze({ code: "HCI+", alias: "HCI+", name: "Человеческий капитал", copy: "Актуальная официальная редакция Всемирного банка." }),
          Object.freeze({ code: "GTCI", alias: "GTCI", name: "Конкурентоспособность талантов", copy: "Привлечение, развитие и удержание талантов." }),
          Object.freeze({ code: "GII", alias: "GII", name: "Инновационное развитие", copy: "Инновационные ресурсы, институты и результаты." }),
          Object.freeze({ code: "IDI", alias: "IDI", name: "Цифровое развитие", copy: "Доступ, использование и навыки в сфере ИКТ." }),
          Object.freeze({ code: "QS", alias: "QS E&T", name: "Инженерное образование", copy: "Международные позиции университетов по инженерии и технологиям." }),
          Object.freeze({ code: "HTEI", alias: "HTEI", name: "Технологические кадры", copy: "Авторская многокомпонентная модель занятости и кадрового потенциала." }),
        ]),
      }),
      product: Object.freeze({
        title: "Результаты раскрываются через рабочие пространства",
        copy: "Каждый экран отвечает на отдельный исследовательский вопрос и сохраняет связь между выводом, исходным значением и методом расчёта.",
        open: "Перейти к анализу",
        views: Object.freeze([
          Object.freeze({ key: "country", target: "country", title: "Профиль страны", copy: "Целостный обзор положения государства: индексы, динамика, сильные и слабые стороны, источники и меры.", alt: "Профиль страны в платформе GIR" }),
          Object.freeze({ key: "htei", target: "index-HTEI", title: "HTEI и технологические кадры", copy: "Международные режимы, компонентная диагностика, фактические годы и неопределённость результата.", alt: "Страница индекса технологической занятости HTEI в платформе GIR" }),
          Object.freeze({ key: "matrix", target: "matrix", title: "Межстрановое сравнение", copy: "Фильтры, сортировка и единое поле семи индексов для анализа сходств, разрывов и групп стран.", alt: "Матрица стран и международных индексов в платформе GIR" }),
        ]),
      }),
      evidence: Object.freeze({
        title: "От официального источника до управленческого вывода",
        copy: "Платформа сохраняет проверяемую цепочку на каждом шаге. Технические детали доступны по запросу, но не мешают сначала понять содержательный результат.",
        steps: Object.freeze([
          Object.freeze({ number: "01", title: "Получение", copy: "Официальные международные выпуски, национальная статистика, рейтинги и отчётность." }),
          Object.freeze({ number: "02", title: "Архивирование", copy: "Дата получения, неизменяемый файл, версия и SHA-256." }),
          Object.freeze({ number: "03", title: "Гармонизация", copy: "Единые страны, годы, единицы измерения и документированные правила выбора." }),
          Object.freeze({ number: "04", title: "Расчёт", copy: "Формулы, веса, режимы сопоставимости и отдельная оценка качества данных." }),
          Object.freeze({ number: "05", title: "Интерпретация", copy: "Рейтинг, компоненты, разрывы, международные бенчмарки и практические меры." }),
        ]),
      }),
      trust: Object.freeze({
        title: "Проверяемость встроена в продукт",
        copy: "Инженерный контур важен не сам по себе, а потому что делает научный результат воспроизводимым. Поэтому здесь показаны доказательные объекты, а не количество тестов или названия библиотек.",
        sourceSystems: "зарегистрированных источников",
        pdfs: "PDF-документов в архиве",
        tables: "таблиц данных и аудита",
        policy: "структурированных мер для России",
      }),
      cta: Object.freeze({
        title: "Начните с результата — и проверьте каждое основание",
        copy: "Откройте профиль России, сравните страны или перейдите к методологии. GIR позволяет двигаться от краткого вывода к исходным данным настолько глубоко, насколько требует задача.",
        primary: "Открыть профиль России",
        secondary: "Методы и источники",
        cooperate: "Обсудить сотрудничество",
      }),
    }),
    en: Object.freeze({
      hero: Object.freeze({
        title: "Global intelligence on human capital and technology workforce",
        lead: "GIR brings international indices, source observations and project models into one evidence environment for country comparison and policy analysis for Russia.",
        copy: "Users can move from a country position to components, actual data years, sources, formulas and practical measures without reading code or understanding the internal architecture.",
        primary: "Explore Russia",
        secondary: "Compare countries",
        methods: "Methods and sources",
        imageAlt: "GIR analytical system with a world map, charts and international data flows",
      }),
      snapshot: Object.freeze({
        title: "What the platform already reveals",
        copy: "One research path from Russia's international position to the structure of the result and policy directions.",
        countryLabel: "Russia · 2026 release",
        hteiTitle: "High-Technology Employment Index",
        hteiAlias: "HTEI",
        scoreScale: "out of 100",
        rank: "rank",
        percentile: "percentile",
        confidence: "data confidence",
        coverage: "components covered",
        mode: "calculation mode",
        strong: "Strongest component",
        weak: "Largest measured gap",
        training: "Training-system competitiveness",
        freshness: "Actual component years",
        scoreInterval: "Score interval",
        rankInterval: "Possible rank range",
        openCountry: "Open Russia profile",
        openHtei: "Analyse HTEI",
        note: "The extended international ranking is used because Russia is outside the strict four-component direct-data universe. Quality and freshness are shown separately and do not alter the substantive score.",
        unavailable: "Loading the current analytical snapshot",
        modeLabels: Object.freeze({
          direct_core: "Strict direct-data tier",
          common_support: "Primary international ranking",
          proxy_extended: "Extended international ranking",
          asof_diagnostic: "Latest-data diagnostic profile",
        }),
      }),
      scale: Object.freeze({
        title: "Scale of the evidence base",
        copy: "Every figure shown in the interface is linked to a preserved source or a reproducible computation. These are the actual volumes of the current analytical release.",
        metrics: Object.freeze([
          Object.freeze({ key: "countries", label: "countries and territories", icon: "map.svg" }),
          Object.freeze({ key: "years", label: "data horizon", icon: "chart-no-axes-combined.svg" }),
          Object.freeze({ key: "index_scores", label: "index scores", icon: "boxes.svg" }),
          Object.freeze({ key: "component_values", label: "component values", icon: "network.svg" }),
          Object.freeze({ key: "source_observations", label: "source observations", icon: "server.svg" }),
          Object.freeze({ key: "raw_snapshots", label: "archived snapshots", icon: "database.svg" }),
        ]),
        pdfNote: "including {value} PDF documents",
        snapshotNote: "Database snapshot updated through {date}.",
      }),
      routes: Object.freeze({
        title: "Five ways to begin",
        copy: "The landing page does not require users to guess the internal structure. Every route is framed as a research task.",
        open: "Open",
        items: Object.freeze([
          Object.freeze({ target: "country", title: "Understand Russia's position", copy: "Seven index modules, trends, components, international benchmarks and recommendations in one profile." }),
          Object.freeze({ target: "matrix", title: "Compare countries", copy: "Compare human capital, talent, innovation, digital development and technology-workforce positions." }),
          Object.freeze({ target: "index-HTEI", title: "Study technology workforce", copy: "Explore the project HTEI by mode, component, freshness, uncertainty and data provenance." }),
          Object.freeze({ target: "htei-model", title: "Assess the training system", copy: "Review institutions, education infrastructure, corporate strategies and international cooperation." }),
          Object.freeze({ target: "methodology", title: "Verify methods and sources", copy: "Read formulas, processing rules, methodological limits and the complete evidence chain." }),
        ]),
      }),
      indices: Object.freeze({
        title: "Seven connected dimensions",
        copy: "Official international indices are complemented by project models. Original scales remain explicit; rank, percentile and a labelled score scale support cross-module reading.",
        items: Object.freeze([
          Object.freeze({ code: "HDI", alias: "HDI", name: "Human development", copy: "Health, education and standard of living." }),
          Object.freeze({ code: "HCI+", alias: "HCI+", name: "Human capital", copy: "The World Bank's current official edition." }),
          Object.freeze({ code: "GTCI", alias: "GTCI", name: "Talent competitiveness", copy: "Attracting, developing and retaining talent." }),
          Object.freeze({ code: "GII", alias: "GII", name: "Innovation performance", copy: "Innovation inputs, institutions and outputs." }),
          Object.freeze({ code: "IDI", alias: "IDI", name: "Digital development", copy: "ICT access, use and skills." }),
          Object.freeze({ code: "QS", alias: "QS E&T", name: "Engineering education", copy: "International university positions in engineering and technology." }),
          Object.freeze({ code: "HTEI", alias: "HTEI", name: "Technology workforce", copy: "A project composite model of employment and workforce capacity." }),
        ]),
      }),
      product: Object.freeze({
        title: "Results unfold through dedicated workspaces",
        copy: "Each screen answers a distinct research question and retains the link between a conclusion, its source value and the calculation method.",
        open: "Start analysing",
        views: Object.freeze([
          Object.freeze({ key: "country", target: "country", title: "Country profile", copy: "A complete country view: indices, trends, strengths, constraints, sources and measures.", alt: "Country profile in the GIR platform" }),
          Object.freeze({ key: "htei", target: "index-HTEI", title: "HTEI and technology workforce", copy: "International modes, component diagnostics, actual data years and uncertainty.", alt: "HTEI technology-workforce page in the GIR platform" }),
          Object.freeze({ key: "matrix", target: "matrix", title: "Cross-country comparison", copy: "Filters, sorting and a seven-index field for analysing similarities, gaps and country groups.", alt: "Country and international-index matrix in the GIR platform" }),
        ]),
      }),
      evidence: Object.freeze({
        title: "From official source to decision insight",
        copy: "The platform preserves an auditable chain at every step. Technical detail is available on demand without preventing users from first understanding the substantive result.",
        steps: Object.freeze([
          Object.freeze({ number: "01", title: "Acquisition", copy: "Official international releases, national statistics, rankings and reporting." }),
          Object.freeze({ number: "02", title: "Archiving", copy: "Retrieval date, immutable file, release version and SHA-256." }),
          Object.freeze({ number: "03", title: "Harmonisation", copy: "Consistent countries, years, units and documented selection rules." }),
          Object.freeze({ number: "04", title: "Computation", copy: "Formulas, weights, comparability modes and a separate assessment of evidence quality." }),
          Object.freeze({ number: "05", title: "Interpretation", copy: "Rankings, components, gaps, international benchmarks and practical measures." }),
        ]),
      }),
      trust: Object.freeze({
        title: "Auditability is part of the product",
        copy: "The engineering layer matters because it makes the scientific result reproducible. The public page therefore shows evidence objects rather than test counts or library names.",
        sourceSystems: "registered sources",
        pdfs: "PDF documents in the archive",
        tables: "data and audit tables",
        policy: "structured measures for Russia",
      }),
      cta: Object.freeze({
        title: "Start with the result — verify every foundation",
        copy: "Open Russia's profile, compare countries or read the methodology. GIR lets users move from a concise finding to source evidence as deeply as the task requires.",
        primary: "Open Russia profile",
        secondary: "Methods and sources",
        cooperate: "Discuss cooperation",
      }),
    }),
  });

  function normalizeLang(lang) {
    return VALID_LANGS.has(lang) ? lang : "ru";
  }

  function normalizeTheme(theme) {
    return VALID_THEMES.has(theme) ? theme : "dark";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(value, lang, maximumFractionDigits = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", {
      maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits,
    }).format(number);
  }

  function formatFlexible(value, lang, maximumFractionDigits = 1) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", {
      maximumFractionDigits,
    }).format(number);
  }

  function formatDate(value, lang) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return String(value).slice(0, 10);
    return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  function renderArrow() {
    return '<span class="gir-landing__button-arrow" aria-hidden="true"><span></span></span>';
  }

  function renderButton(label, target, variant = "primary") {
    return `<button class="gir-landing__button gir-landing__button--${variant}" type="button" data-route-target="${escapeHtml(target)}"><span>${escapeHtml(label)}</span>${renderArrow()}</button>`;
  }

  function renderCooperationButton(label, variant = "outline") {
    return `<button class="gir-landing__button gir-landing__button--${variant}" type="button" data-open-cooperation><span>${escapeHtml(label)}</span>${renderArrow()}</button>`;
  }

  function renderPicture(options) {
    const loading = options.eager ? "eager" : "lazy";
    const priority = options.eager ? ' fetchpriority="high"' : "";
    const selector = options.role === "hero" ? " data-landing-hero" : " data-landing-product";
    return `<picture class="${escapeHtml(options.className)}" data-asset-role="${escapeHtml(options.role)}" data-asset-name="${escapeHtml(options.name)}" data-theme="${escapeHtml(options.theme)}" data-locale="${escapeHtml(options.lang)}">
      <source srcset="${ASSET_BASE}/${escapeHtml(options.file)}.webp" type="image/webp">
      <img src="${ASSET_BASE}/${escapeHtml(options.file)}.png" alt="${escapeHtml(options.alt)}" width="${options.width}" height="${options.height}" loading="${loading}" decoding="async"${priority}${selector}>
    </picture>`;
  }

  function renderIcon(icon, className = "gir-landing__icon") {
    return `<span class="${className}" style="--landing-icon:url('static/icons/${escapeHtml(icon)}')" aria-hidden="true"></span>`;
  }

  const COMPONENT_LABELS = Object.freeze({
    HT_EMPLOYMENT_SHARE: Object.freeze({ ru: "Занятость в высокотехнологичных и наукоёмких секторах", en: "Employment in high-technology and knowledge-intensive sectors" }),
    HIGH_TECH_OCCUPATIONS: Object.freeze({ ru: "Технологические профессии", en: "Technology occupations" }),
    RND_PERSONNEL: Object.freeze({ ru: "Кадровое ядро исследований и разработок", en: "Research and development workforce" }),
    STEM_PIPELINE: Object.freeze({ ru: "Образовательный поток STEM", en: "STEM education pipeline" }),
    TECH_OUTPUTS: Object.freeze({ ru: "Технологические результаты экономики", en: "Technology outputs of the economy" }),
    CORPORATE_STRATEGY_AND_DEMAND: Object.freeze({ ru: "Корпоративное участие в НИОКР", en: "Business participation in R&D" }),
  });

  function componentLabel(component, lang) {
    if (!component) return "—";
    const curated = COMPONENT_LABELS[component.component_code];
    if (curated) return curated[lang === "ru" ? "ru" : "en"];
    return component[lang === "ru" ? "name_ru" : "name_en"] || component.component_code || "—";
  }

  function blockLabel(block, lang) {
    if (!block) return "—";
    return block[lang === "ru" ? "block_name_ru" : "block_name_en"] || block.block_code || "—";
  }

  function renderSnapshot(summary, copy, lang) {
    if (!summary || !summary.htei || !summary.htei.available) {
      return `<div class="gir-landing__snapshot-shell is-loading" data-landing-summary aria-busy="true">
        <div class="gir-landing__snapshot-loading-copy">${escapeHtml(copy.unavailable)}</div>
        <div class="gir-landing__skeleton gir-landing__skeleton--wide"></div>
        <div class="gir-landing__skeleton-grid"><div class="gir-landing__skeleton"></div><div class="gir-landing__skeleton"></div><div class="gir-landing__skeleton"></div></div>
      </div>`;
    }

    const htei = summary.htei;
    const training = summary.training_model || {};
    const strong = htei.strongest_component;
    const weak = htei.weakest_component;
    const modeLabel = copy.modeLabels[htei.mode] || htei.mode;
    const sourceYears = htei.oldest_source_year && htei.newest_source_year
      ? `${htei.oldest_source_year}–${htei.newest_source_year}`
      : "—";
    const scoreInterval = htei.score_low != null && htei.score_high != null
      ? `${formatFlexible(htei.score_low, lang, 1)}–${formatFlexible(htei.score_high, lang, 1)}`
      : "—";
    const rankInterval = htei.rank_low != null && htei.rank_high != null
      ? `${formatNumber(htei.rank_low, lang)}–${formatNumber(htei.rank_high, lang)}`
      : "—";
    const components = (htei.components || []).map((component) => {
      const score = Math.max(0, Math.min(100, Number(component.normalized_score) || 0));
      return `<div class="gir-landing__component-row">
        <div class="gir-landing__component-label"><span>${escapeHtml(componentLabel(component, lang))}</span><strong>${formatFlexible(score, lang, 1)}</strong></div>
        <div class="gir-landing__component-track" aria-hidden="true"><span style="width:${score}%"></span></div>
      </div>`;
    }).join("");

    return `<div class="gir-landing__snapshot-shell" data-landing-summary aria-busy="false" data-htei-mode="${escapeHtml(htei.mode)}">
      <article class="gir-landing__result-panel">
        <div class="gir-landing__result-heading">
          <div>
            <p class="gir-landing__result-context">${escapeHtml(copy.countryLabel)}</p>
            <h3>${escapeHtml(copy.hteiTitle)} <small>${escapeHtml(copy.hteiAlias)}</small></h3>
          </div>
          <div class="gir-landing__score-lockup" data-landing-htei-score>
            <strong>${formatFlexible(htei.score, lang, 1)}</strong>
            <span>${escapeHtml(copy.scoreScale)}</span>
          </div>
        </div>
        <div class="gir-landing__result-metrics">
          <div><strong>${htei.rank == null ? "—" : formatNumber(htei.rank, lang)}</strong><span>${escapeHtml(copy.rank)}${htei.rank_total ? ` ${lang === "ru" ? "из" : "of"} ${formatNumber(htei.rank_total, lang)}` : ""}</span></div>
          <div><strong>${htei.percentile == null ? "—" : `${formatFlexible(htei.percentile, lang, 0)}%`}</strong><span>${escapeHtml(copy.percentile)}</span></div>
          <div><strong>${htei.confidence == null ? "—" : `${formatFlexible(Number(htei.confidence) * 100, lang, 0)}%`}</strong><span>${escapeHtml(copy.confidence)}</span></div>
          <div><strong>${formatNumber(htei.available_components, lang)} / 6</strong><span>${escapeHtml(copy.coverage)}</span></div>
        </div>
        <div class="gir-landing__component-profile" aria-label="${escapeHtml(copy.hteiTitle)}">${components}</div>
        <div class="gir-landing__result-actions">
          ${renderButton(copy.openCountry, "country", "primary")}
          ${renderButton(copy.openHtei, "index-HTEI", "outline")}
        </div>
      </article>
      <aside class="gir-landing__insight-panel">
        <div class="gir-landing__insight-row">
          <span>${escapeHtml(copy.strong)}</span>
          <strong>${escapeHtml(componentLabel(strong, lang))}</strong>
          <small>${formatFlexible(strong && strong.normalized_score, lang, 1)} / 100</small>
        </div>
        <div class="gir-landing__insight-row is-gap">
          <span>${escapeHtml(copy.weak)}</span>
          <strong>${escapeHtml(componentLabel(weak, lang))}</strong>
          <small>${formatFlexible(weak && weak.normalized_score, lang, 1)} / 100</small>
        </div>
        <div class="gir-landing__insight-row">
          <span>${escapeHtml(copy.training)}</span>
          <strong>${training.available ? `${formatNumber(training.rank, lang)} ${lang === "ru" ? "место из" : "of"} ${formatNumber(training.rank_total, lang)}` : "—"}</strong>
          <small>${training.available ? escapeHtml(blockLabel(training.strongest_block, lang)) : ""}</small>
        </div>
        <dl class="gir-landing__method-facts">
          <div><dt>${escapeHtml(copy.mode)}</dt><dd>${escapeHtml(modeLabel)}</dd></div>
          <div><dt>${escapeHtml(copy.freshness)}</dt><dd>${sourceYears}</dd></div>
          <div><dt>${escapeHtml(copy.scoreInterval)}</dt><dd>${scoreInterval}</dd></div>
          <div><dt>${escapeHtml(copy.rankInterval)}</dt><dd>${rankInterval}</dd></div>
        </dl>
        <p class="gir-landing__method-note">${escapeHtml(copy.note)}</p>
      </aside>
    </div>`;
  }

  function metricValue(metric, scale, lang) {
    if (!scale) return "—";
    if (metric.key === "years") return `${scale.year_min}–${scale.year_max}`;
    return formatNumber(scale[metric.key], lang);
  }

  function renderScale(summary, copy, lang) {
    const scale = summary && summary.scale;
    const metrics = copy.metrics.map((metric) => `<article class="gir-landing__scale-item" data-landing-metric="${escapeHtml(metric.key)}">
      ${renderIcon(metric.icon, "gir-landing__metric-icon")}
      <div><strong>${metricValue(metric, scale, lang)}</strong><span>${escapeHtml(metric.label)}</span>${metric.key === "raw_snapshots" && scale ? `<small>${escapeHtml(copy.pdfNote.replace("{value}", formatNumber(scale.pdf_snapshots, lang)))}</small>` : ""}</div>
    </article>`).join("");
    const date = summary && summary.release && summary.release.latest_snapshot_retrieved_at;
    return `<div class="gir-landing__scale-grid">${metrics}</div>
      <p class="gir-landing__snapshot-note">${escapeHtml(copy.snapshotNote.replace("{date}", formatDate(date, lang)))}</p>`;
  }

  function renderRoutes(copy) {
    return copy.items.map((item, index) => `<article class="gir-landing__route-item">
      <div class="gir-landing__route-number">0${index + 1}</div>
      ${renderIcon(ROUTE_ICONS[index], "gir-landing__route-icon")}
      <div class="gir-landing__route-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></div>
      <button type="button" class="gir-landing__route-link" data-route-target="${escapeHtml(item.target)}"><span>${escapeHtml(copy.open)}</span>${renderArrow()}</button>
    </article>`).join("");
  }

  function renderIndices(copy) {
    return copy.items.map((item) => `<article class="gir-landing__index-item">
      <div class="gir-landing__index-code"><strong>${escapeHtml(item.code)}</strong><small>${escapeHtml(item.alias)}</small></div>
      <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.copy)}</p></div>
    </article>`).join("");
  }

  function renderProductViews(copy, lang, theme) {
    return copy.views.map((view, index) => `<article class="gir-landing__product-row${index % 2 ? " is-reversed" : ""}">
      <div class="gir-landing__product-copy">
        <span class="gir-landing__sequence" aria-hidden="true">0${index + 1}</span>
        <h3>${escapeHtml(view.title)}</h3>
        <p>${escapeHtml(view.copy)}</p>
        ${renderButton(copy.open, view.target, "outline")}
      </div>
      <figure class="gir-landing__product-figure">
        ${renderPicture({ lang, theme, className: "gir-landing__product-picture", file: `product/${view.key}-${lang}-${theme}`, role: "product-screen", name: view.key, alt: view.alt, width: 1280, height: 720 })}
        <figcaption>${escapeHtml(view.title)}</figcaption>
      </figure>
    </article>`).join("");
  }

  function renderEvidence(copy) {
    return copy.steps.map((step, index) => `<article class="gir-landing__evidence-step">
      ${renderIcon(EVIDENCE_ICONS[index], "gir-landing__evidence-icon")}
      <div><span>${escapeHtml(step.number)}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.copy)}</p></div>
    </article>`).join("");
  }

  function renderTrust(summary, copy, lang) {
    const scale = summary && summary.scale;
    const values = [
      [scale && scale.registered_sources, copy.sourceSystems],
      [scale && scale.pdf_snapshots, copy.pdfs],
      [scale && scale.database_tables, copy.tables],
      [scale && scale.policy_actions, copy.policy],
    ];
    return values.map(([value, label]) => `<div class="gir-landing__trust-metric"><strong>${formatNumber(value, lang)}</strong><span>${escapeHtml(label)}</span></div>`).join("");
  }

  function render(options) {
    const input = options || {};
    const lang = normalizeLang(input.lang);
    const theme = normalizeTheme(input.theme);
    const summary = input.summary || null;
    const copy = CONTENT[lang];

    return `<div class="landing-page gir-landing" data-page="landing" data-locale="${lang}" data-theme="${theme}">
      <section class="landing-hero gir-landing__hero" aria-labelledby="gir-landing-title">
        ${renderPicture({ lang, theme, className: "gir-landing__hero-picture", file: `hero/hero-${theme}`, role: "hero", name: `hero-${theme}`, alt: copy.hero.imageAlt, width: 1672, height: 941, eager: true })}
        <div class="gir-landing__hero-copy">
          <h1 id="gir-landing-title">${escapeHtml(copy.hero.title)}</h1>
          <p class="gir-landing__hero-lead">${escapeHtml(copy.hero.lead)}</p>
          <p class="gir-landing__hero-text">${escapeHtml(copy.hero.copy)}</p>
          <div class="gir-landing__actions">
            ${renderButton(copy.hero.primary, "country", "primary")}
            ${renderButton(copy.hero.secondary, "matrix", "outline")}
          </div>
          <button class="gir-landing__text-link" type="button" data-route-target="methodology">${escapeHtml(copy.hero.methods)}${renderArrow()}</button>
        </div>
      </section>

      <section class="gir-landing__section gir-landing__snapshot" aria-labelledby="gir-landing-snapshot-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-snapshot-title">${escapeHtml(copy.snapshot.title)}</h2>
          <p>${escapeHtml(copy.snapshot.copy)}</p>
        </div>
        ${renderSnapshot(summary, copy.snapshot, lang)}
      </section>

      <section class="gir-landing__section gir-landing__scale" aria-labelledby="gir-landing-scale-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-scale-title">${escapeHtml(copy.scale.title)}</h2>
          <p>${escapeHtml(copy.scale.copy)}</p>
        </div>
        ${renderScale(summary, copy.scale, lang)}
      </section>

      <section class="gir-landing__section gir-landing__routes" aria-labelledby="gir-landing-routes-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-routes-title">${escapeHtml(copy.routes.title)}</h2>
          <p>${escapeHtml(copy.routes.copy)}</p>
        </div>
        <div class="gir-landing__route-list">${renderRoutes(copy.routes)}</div>
      </section>

      <section class="gir-landing__section gir-landing__indices" aria-labelledby="gir-landing-indices-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-indices-title">${escapeHtml(copy.indices.title)}</h2>
          <p>${escapeHtml(copy.indices.copy)}</p>
        </div>
        <div class="gir-landing__indices-grid">${renderIndices(copy.indices)}</div>
      </section>

      <section class="gir-landing__section gir-landing__product" aria-labelledby="gir-landing-product-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-product-title">${escapeHtml(copy.product.title)}</h2>
          <p>${escapeHtml(copy.product.copy)}</p>
        </div>
        <div class="gir-landing__product-list">${renderProductViews(copy.product, lang, theme)}</div>
      </section>

      <section class="gir-landing__section gir-landing__evidence" aria-labelledby="gir-landing-evidence-title">
        <div class="gir-landing__section-heading is-wide">
          <h2 id="gir-landing-evidence-title">${escapeHtml(copy.evidence.title)}</h2>
          <p>${escapeHtml(copy.evidence.copy)}</p>
        </div>
        <div class="gir-landing__evidence-grid">${renderEvidence(copy.evidence)}</div>
      </section>

      <section class="gir-landing__section gir-landing__trust" aria-labelledby="gir-landing-trust-title">
        <div class="gir-landing__trust-copy">
          <h2 id="gir-landing-trust-title">${escapeHtml(copy.trust.title)}</h2>
          <p>${escapeHtml(copy.trust.copy)}</p>
        </div>
        <div class="gir-landing__trust-grid">${renderTrust(summary, copy.trust, lang)}</div>
      </section>

      <section class="gir-landing__final" aria-labelledby="gir-landing-final-title">
        <div><h2 id="gir-landing-final-title">${escapeHtml(copy.cta.title)}</h2><p>${escapeHtml(copy.cta.copy)}</p></div>
        <div class="gir-landing__actions">
          ${renderButton(copy.cta.primary, "country", "inverse")}
          ${renderButton(copy.cta.secondary, "methodology", "inverse-outline")}
          ${renderCooperationButton(copy.cta.cooperate, "inverse-outline")}
        </div>
      </section>
    </div>`;
  }

  global.GIRLanding = Object.freeze({ render });
})(window);
