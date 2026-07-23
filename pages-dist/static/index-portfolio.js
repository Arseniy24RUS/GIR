(function exposeGIRIndexPortfolio(global) {
  "use strict";

  const GROUPS = Object.freeze([
    Object.freeze({
      key: "core",
      icon: "map.svg",
      label_ru: "Ключевые глобальные индексы",
      label_en: "Global benchmarks",
      description_ru: "Сквозные международные ориентиры человеческого развития, талантов, инноваций, цифровой связанности и технологической занятости.",
      description_en: "Cross-cutting international benchmarks for human development, talent, innovation, digital connectivity and technology employment.",
      items: Object.freeze([
        item("HDI", "ИЧР", "HDI", "Индекс человеческого развития", "Human Development Index", "ready", "UNDP", "https://hdr.undp.org/data-center/human-development-index"),
        item("HCI_PLUS", "HCI+", "HCI+", "Индекс человеческого капитала плюс", "Human Capital Index Plus", "ready", "World Bank", "https://www.worldbank.org/en/publication/human-capital"),
        item("GTCI", "GTCI", "GTCI", "Глобальный индекс конкурентоспособности талантов", "Global Talent Competitiveness Index", "ready", "INSEAD / Portulans Institute", "https://www.insead.edu/global-talent-competitiveness-index"),
        item("GII", "GII", "GII", "Глобальный инновационный индекс", "Global Innovation Index", "ready", "WIPO", "https://www.wipo.int/global_innovation_index/en/"),
        item("IDI", "IDI", "IDI", "Индекс развития ИКТ", "ICT Development Index", "ready", "ITU", "https://www.itu.int/itu-d/reports/statistics/idi2025/"),
        item("HTEI", "HTEI", "HTEI", "Индекс занятости в высокотехнологичных отраслях", "High-Tech Employment Index", "ready", "GIR", "#methodology"),
      ]),
    }),
    Object.freeze({
      key: "education",
      icon: "graduation-cap.svg",
      label_ru: "Образование и университеты",
      label_en: "Education & universities",
      description_ru: "Школьные результаты, мировые университетские рейтинги, 55 дисциплин, устойчивость и международное положение образовательных систем.",
      description_en: "School outcomes, global university rankings, 55 subjects, sustainability and the international position of education systems.",
      items: Object.freeze([
        item("PISA_SKI", "PISA", "PISA", "Оценка знаний школьников PISA", "PISA School Knowledge", "ready", "OECD", "https://www.oecd.org/en/about/programmes/pisa.html"),
        item("QS_ET", "QS", "QS", "Аналитика QS", "QS Intelligence: universities, subjects and education ecosystems", "ready", "QS", "https://www.topuniversities.com/qs-top-uni-wur"),
        item("THE_ENG", "THE", "THE", "THE: инженерные науки", "THE Engineering", "ready", "Times Higher Education", "https://www.timeshighereducation.com/world-university-rankings/2026/subject-ranking/engineering"),
        item("ARWU", "ARWU", "ARWU", "ARWU: исследовательские университеты", "ARWU Research Universities", "ready", "ShanghaiRanking", "https://www.shanghairanking.com/rankings/arwu/2025"),
      ]),
    }),
    Object.freeze({
      key: "institutions",
      icon: "landmark.svg",
      label_ru: "Государство и институты",
      label_en: "Government & institutions",
      description_ru: "Качество управления, верховенство права, коррупционные риски, свобода прессы и демократия.",
      description_en: "Governance quality, rule of law, corruption risks, press freedom and democracy.",
      items: Object.freeze([
        item("CPI", "CPI", "CPI", "Индекс восприятия коррупции", "Corruption Perceptions Index", "ready", "Transparency International", "https://www.transparency.org/en/cpi"),
        item("WPFI", "WPFI", "WPFI", "Индекс свободы прессы", "World Press Freedom Index", "ready", "Reporters Without Borders", "https://rsf.org/en/index"),
        item("ROLI", "WJP", "WJP", "Индекс верховенства права WJP", "WJP Rule of Law Index", "ready", "World Justice Project", "https://worldjusticeproject.org/rule-of-law-index"),
        item("WGI", "WGI", "WGI", "Показатели государственного управления", "Worldwide Governance Indicators", "ready", "World Bank", "https://www.worldbank.org/en/publication/worldwide-governance-indicators"),
        item("VDEM", "V-Dem", "V-Dem", "Индексы демократии V-Dem", "V-Dem Democracy Indices", "ready", "V-Dem Institute", "https://www.v-dem.net/data/the-v-dem-dataset/"),
      ]),
    }),
    Object.freeze({
      key: "digital",
      icon: "server.svg",
      label_ru: "Цифровизация, ИИ и вычислительные мощности",
      label_en: "Digitalisation, AI & compute",
      description_ru: "Сетевая готовность, электронное государство, кибербезопасность, готовность к ИИ и вычислительная инфраструктура.",
      description_en: "Network readiness, digital government, cybersecurity, AI preparedness and computing infrastructure.",
      items: Object.freeze([
        item("NRI", "NRI", "NRI", "Индекс сетевой готовности", "Network Readiness Index", "ready", "Portulans Institute", "https://networkreadinessindex.org/"),
        item("EGDI", "EGDI", "EGDI", "Индекс развития электронного правительства", "E-Government Development Index", "ready", "United Nations", "https://publicadministration.un.org/egovkb/en-us/About/Overview/-E-Government-Development-Index"),
        item("GCI", "GCI", "GCI", "Глобальный индекс кибербезопасности ITU", "ITU Global Cybersecurity Index", "ready", "ITU", "https://www.itu.int/epublications/publication/global-cybersecurity-index-2024"),
        item("GARI", "GARI", "GARI", "Индекс готовности государства к ИИ", "Government AI Readiness Index", "ready", "Oxford Insights", "https://oxfordinsights.com/ai-readiness/ai-readiness-index/"),
        item("AIPI", "AIPI", "AIPI", "Индекс готовности к ИИ МВФ", "IMF AI Preparedness Index", "ready", "IMF", "https://www.imf.org/external/datamapper/AI_PI@AIPI/"),
        item("CF_IQI", "IQI", "IQI", "Индекс качества интернета Cloudflare", "Cloudflare Internet Quality Index", "ready", "Cloudflare Radar", "https://radar.cloudflare.com/quality"),
        item("TOP500", "TOP500", "TOP500", "Страновая агрегация TOP500", "TOP500 Country Aggregation", "ready", "TOP500", "https://www.top500.org/statistics/list/"),
      ]),
    }),
    Object.freeze({
      key: "economy",
      icon: "briefcase-business.svg",
      label_ru: "Экономика и финансы",
      label_en: "Economy & finance",
      description_ru: "Производственные возможности, деловая среда, сложность экономики, глобализация и финансовая доступность.",
      description_en: "Productive capacity, business environment, economic complexity, globalisation and financial inclusion.",
      items: Object.freeze([
        item("UNCTAD_PCI", "PCI", "PCI", "Индекс производственного потенциала UNCTAD", "UNCTAD Productive Capacities Index", "ready", "UNCTAD", "https://unctadstat.unctad.org/datacentre/reportInfo/US.PCI"),
        item("BREADY", "B-READY", "B-READY", "Готовность к ведению бизнеса", "Business Ready", "ready", "World Bank", "https://www.worldbank.org/en/businessready"),
        item("ECI", "ECI", "ECI", "Индекс экономической сложности", "Economic Complexity Index", "ready", "Harvard Growth Lab", "https://atlas.hks.harvard.edu/rankings"),
        item("KOF_GLOBAL", "KOF", "KOF", "Индекс глобализации KOF", "KOF Globalisation Index", "ready", "KOF Swiss Economic Institute", "https://kof.ethz.ch/en/forecasts-and-indicators/indicators/kof-globalisation-index.html"),
        item("IMF_FDI", "FDI", "FDI", "Индекс финансового развития МВФ", "IMF Financial Development Index", "ready", "IMF", "https://www.imf.org/external/datamapper/FDI@FDI/"),
        item("GLOBAL_FINDEX", "Findex", "Findex", "Глобальная база финансовой доступности", "Global Findex", "ready", "World Bank", "https://www.worldbank.org/en/publication/globalfindex"),
      ]),
    }),
    Object.freeze({
      key: "society",
      icon: "user-round.svg",
      label_ru: "Общество и человеческое развитие",
      label_en: "Society & human development",
      description_ru: "Социальный прогресс, достижение ЦУР, благополучие, гендерные разрывы и охват медицинскими услугами.",
      description_en: "Social progress, SDG achievement, well-being, gender gaps and health-service coverage.",
      items: Object.freeze([
        item("SPI", "SPI", "SPI", "Индекс социального прогресса", "Social Progress Index", "ready", "Social Progress Imperative", "https://www.socialprogress.org/social-progress-index"),
        item("SDG", "SDG", "SDG", "Индекс достижения ЦУР", "SDG Index", "ready", "Sustainable Development Solutions Network", "https://dashboards.sdgindex.org/"),
        item("WHR", "WHR", "WHR", "Всемирный доклад о счастье", "World Happiness Report", "ready", "Wellbeing Research Centre", "https://worldhappiness.report/"),
        item("GGGI", "GGGI", "GGGI", "Глобальный индекс гендерного разрыва", "Global Gender Gap Index", "ready", "World Economic Forum", "https://www.weforum.org/publications/global-gender-gap-report-2025/"),
        item("UHC_SCI", "UHC", "UHC", "Индекс охвата основными медицинскими услугами", "WHO UHC Service Coverage Index", "ready", "WHO", "https://www.who.int/data/gho/data/themes/topics/service-coverage"),
      ]),
    }),
    Object.freeze({
      key: "environment",
      icon: "leaf.svg",
      label_ru: "Экология и устойчивость",
      label_en: "Environment & resilience",
      description_ru: "Экологическая результативность, климатическая уязвимость, энергетический переход и природные риски.",
      description_en: "Environmental performance, climate vulnerability, energy transition and disaster risk.",
      items: Object.freeze([
        item("EPI", "EPI", "EPI", "Индекс экологической эффективности", "Environmental Performance Index", "ready", "Yale / Columbia", "https://epi.yale.edu/"),
        item("ND_GAIN", "ND-GAIN", "ND-GAIN", "Страновой индекс ND-GAIN", "ND-GAIN Country Index", "ready", "University of Notre Dame", "https://gain.nd.edu/our-work/country-index/"),
        item("ETI", "ETI", "ETI", "Индекс энергетического перехода", "Energy Transition Index", "ready", "World Economic Forum / Accenture", "https://www.weforum.org/publications/energy-transition-index-2026/"),
        item("WORLD_RISK_INDEX", "WRI", "WRI", "Всемирный индекс риска", "WorldRiskIndex", "ready", "Bündnis Entwicklung Hilft / IFHV", "https://weltrisikobericht.de/worldriskreport/"),
      ]),
    }),
    Object.freeze({
      key: "security",
      icon: "shield-check.svg",
      label_ru: "Безопасность и международная связанность",
      label_en: "Security & international connectedness",
      description_ru: "Мир, милитаризация, организованная преступность, военные расходы, глобальные потоки, логистика и морская связанность.",
      description_en: "Peace, militarisation, organised crime, military spending, global flows, logistics and liner-shipping connectivity.",
      items: Object.freeze([
        item("GPI", "GPI", "GPI", "Глобальный индекс миролюбия", "Global Peace Index", "ready", "Institute for Economics & Peace", "https://www.visionofhumanity.org/maps/"),
        item("GMI", "GMI", "GMI", "Глобальный индекс милитаризации", "Global Militarisation Index", "ready", "BICC", "https://gmi.bicc.de/"),
        item("GOCI", "GOCI", "GOCI", "Глобальный индекс организованной преступности", "Global Organized Crime Index", "ready", "Global Initiative Against Transnational Organized Crime", "https://ocindex.net/"),
        item("SIPRI_MILEX", "SIPRI", "SIPRI", "Военные расходы SIPRI", "SIPRI Military Expenditure", "ready", "SIPRI", "https://www.sipri.org/databases/milex"),
        item("DHL_GCI", "DHL GCI", "DHL GCI", "Глобальный индекс связанности DHL", "DHL Global Connectedness Index", "ready", "DHL / NYU Stern", "https://www.dhl.com/global-en/microsites/core/global-connectedness/report.html"),
        item("WORLD_BANK_LPI", "LPI", "LPI", "Показатели эффективности логистики Всемирного банка", "World Bank Logistics Performance Indicators", "ready", "World Bank", "https://lpi.worldbank.org/"),
        item("UNCTAD_LSCI", "LSCI", "LSCI", "Индекс связанности линейного судоходства UNCTAD", "UNCTAD Liner Shipping Connectivity Index", "ready", "UN Trade and Development", "https://unctadstat.unctad.org/insights/theme/111"),
      ]),
    }),
  ]);

  function item(code, shortRu, shortEn, nameRu, nameEn, status, authority, sourceUrl) {
    return Object.freeze({
      code,
      short_ru: shortRu,
      short_en: shortEn,
      name_ru: nameRu,
      name_en: nameEn,
      status,
      authority,
      source_url: sourceUrl,
      route: `index-${code}`,
    });
  }

  const ITEMS = Object.freeze(GROUPS.flatMap((group) => group.items.map((entry) => Object.freeze({ ...entry, group: group.key }))));
  const ITEM_MAP = new Map(ITEMS.map((entry) => [entry.code, entry]));
  const GROUP_MAP = new Map(GROUPS.map((group) => [group.key, group]));
  const READY_CODES = Object.freeze(ITEMS.filter((entry) => entry.status === "ready").map((entry) => entry.code));
  const PLANNED_CODES = Object.freeze(ITEMS.filter((entry) => entry.status === "planned").map((entry) => entry.code));
  const ALL_CODES = Object.freeze(ITEMS.map((entry) => entry.code));

  function get(code) { return ITEM_MAP.get(String(code || "").toUpperCase().replace(/[-\s]/g, "_")) || null; }
  function getGroup(key) { return GROUP_MAP.get(String(key || "")) || null; }
  function groupForCode(code) { const entry = get(code); return entry ? getGroup(entry.group) : null; }
  function isReady(code) { return get(code)?.status === "ready"; }
  function isPlanned(code) { return get(code)?.status === "planned"; }
  function allCodes() { return [...ALL_CODES]; }
  function readyCodes() { return [...READY_CODES]; }
  function plannedCodes() { return [...PLANNED_CODES]; }
  function groups() { return GROUPS; }
  function meta(code) {
    const entry = get(code);
    if (!entry) return null;
    return {
      code: entry.code,
      short_name_ru: entry.short_ru,
      short_name_en: entry.short_en,
      name_ru: entry.name_ru,
      name_en: entry.name_en,
      authority: entry.authority,
      portfolio_status: entry.status,
      group: entry.group,
      source_url: entry.source_url,
    };
  }
  function stats() {
    return Object.freeze({ groups: GROUPS.length, total: ITEMS.length, ready: READY_CODES.length, planned: PLANNED_CODES.length });
  }
  function footerSummary(lang = "ru") {
    const value = stats();
    return lang === "ru"
      ? `${value.ready} действующих модулей · ${value.groups} тематических направлений · ${value.planned} подключений в плане`
      : `${value.ready} live modules · ${value.groups} thematic groups · ${value.planned} planned integrations`;
  }
  function labels(lang = "ru") {
    return lang === "ru" ? {
      planned: "в интеграции",
      ready: "действующий модуль",
      status: "Подготовлен интерфейс будущего модуля",
      statusText: "Числовой выпуск ещё не опубликован в GIR. Страница зарегистрирована в тематическом портфеле и будет заполнена после завершения backend-интеграции, научной валидации и provenance-контроля.",
      source: "Официальный источник",
      group: "Тематическое направление",
      code: "Код модуля",
      scopeTitle: "Что будет доступно после подключения",
      scopeText: "Новая страница будет использовать тот же доказательный стандарт, что действующие модули GIR: исходная шкала, редакция, международное поле, компоненты, временной ряд, качество и происхождение каждого значения.",
      stagesTitle: "Контур интеграции",
      relatedTitle: "Другие модули направления",
      methods: "Научная документация",
      updates: "Центр обновления данных",
      noSynthetic: "До публикации проверенного выпуска GIR не показывает демонстрационные баллы, нулевые места или proxy-оценки.",
      surfaces: [
        ["Профиль страны", "Score, место, процентиль, редакция и международные ориентиры."],
        ["Структура показателя", "Официальные компоненты, веса, методический статус и ограничения."],
        ["Международное поле", "Распределение, карта, рейтинг, тренды и сопоставление стран."],
        ["Доказательная цепочка", "Источник, snapshot, SHA-256, трансформация, CSV и provenance."],
      ],
      stages: [
        ["Frontend-контракт", "готов", "Маршрут, тематическая навигация и состояния без данных зарегистрированы."],
        ["Backend и источник", "следующий этап", "Импортёр, схема данных и правила обновления будут подключены к официальному выпуску."],
        ["Научная валидация", "после импорта", "Проверка шкал, полноты, сопоставимости, формул и методических ограничений."],
        ["Публикация", "после gates", "Числовая страница появляется только после provenance, QA и release-gate."],
      ],
    } : {
      planned: "in integration",
      ready: "live module",
      status: "Future-module interface prepared",
      statusText: "A numeric release has not yet been published in GIR. The page is registered in the thematic portfolio and will be populated after backend integration, scientific validation and provenance controls are complete.",
      source: "Official source",
      group: "Thematic group",
      code: "Module code",
      scopeTitle: "What will become available after integration",
      scopeText: "The page will follow the same evidence standard as live GIR modules: original scale, edition, international field, components, time series, quality and provenance for every value.",
      stagesTitle: "Integration pathway",
      relatedTitle: "Other modules in this group",
      methods: "Scientific documentation",
      updates: "Data Update Center",
      noSynthetic: "Until a validated release is published, GIR does not show demonstration scores, zero ranks or proxy estimates.",
      surfaces: [
        ["Country profile", "Score, rank, percentile, edition and international benchmarks."],
        ["Index anatomy", "Official components, weights, methodological status and limitations."],
        ["International field", "Distribution, map, ranking, trends and country comparison."],
        ["Evidence chain", "Source, snapshot, SHA-256, transformation, CSV and provenance."],
      ],
      stages: [
        ["Frontend contract", "ready", "The route, thematic navigation and no-data states are registered."],
        ["Backend and source", "next stage", "The importer, data schema and update policy will be connected to the official release."],
        ["Scientific validation", "after import", "Scale, completeness, comparability, formula and methodology checks."],
        ["Publication", "after gates", "Numeric results appear only after provenance, QA and release approval."],
      ],
    };
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function renderPlanned({ root, code, lang = "ru" } = {}) {
    const entry = get(code);
    if (!root || !entry || entry.status !== "planned") return false;
    const group = groupForCode(code);
    const copy = labels(lang);
    const name = lang === "ru" ? entry.name_ru : entry.name_en;
    const short = lang === "ru" ? entry.short_ru : entry.short_en;
    const groupLabel = lang === "ru" ? group.label_ru : group.label_en;
    const groupDescription = lang === "ru" ? group.description_ru : group.description_en;
    const related = group.items.filter((itemEntry) => itemEntry.code !== entry.code);
    root.innerHTML = `
      <section class="portfolio-page" aria-labelledby="portfolio-page-title">
        <header class="portfolio-page__header">
          <div class="portfolio-page__group"><img src="/static/icons/${esc(group.icon)}" alt="" aria-hidden="true"><span>${esc(groupLabel)}</span></div>
          <div class="portfolio-page__title-row">
            <div>
              <div class="portfolio-page__code">${esc(short)}</div>
              <h1 id="portfolio-page-title">${esc(name)}</h1>
              <p>${esc(groupDescription)}</p>
            </div>
            <span class="portfolio-page__status">${esc(copy.planned)}</span>
          </div>
          <div class="portfolio-page__actions">
            <a class="btn primary" href="${esc(entry.source_url)}" target="_blank" rel="noopener noreferrer">${esc(copy.source)} <span aria-hidden="true">↗</span></a>
            <button type="button" class="btn outline" data-gir-action="route" data-route="methodology">${esc(copy.methods)}</button>
            <button type="button" class="btn outline" data-gir-action="route" data-route="data-updates">${esc(copy.updates)}</button>
          </div>
        </header>

        <section class="portfolio-status-panel" aria-labelledby="portfolio-status-title">
          <div class="portfolio-status-panel__mark" aria-hidden="true">01</div>
          <div><h2 id="portfolio-status-title">${esc(copy.status)}</h2><p>${esc(copy.statusText)}</p></div>
          <dl>
            <div><dt>${esc(copy.group)}</dt><dd>${esc(groupLabel)}</dd></div>
            <div><dt>${esc(copy.code)}</dt><dd>${esc(entry.code)}</dd></div>
            <div><dt>${esc(copy.source)}</dt><dd>${esc(entry.authority)}</dd></div>
          </dl>
        </section>

        <section class="portfolio-page__section" aria-labelledby="portfolio-scope-title">
          <div class="portfolio-section-heading"><span>02</span><div><h2 id="portfolio-scope-title">${esc(copy.scopeTitle)}</h2><p>${esc(copy.scopeText)}</p></div></div>
          <div class="portfolio-surface-grid">${copy.surfaces.map((surface, index) => `<article><span>0${index + 1}</span><h3>${esc(surface[0])}</h3><p>${esc(surface[1])}</p></article>`).join("")}</div>
        </section>

        <section class="portfolio-page__section portfolio-integration" aria-labelledby="portfolio-stages-title">
          <div class="portfolio-section-heading"><span>03</span><div><h2 id="portfolio-stages-title">${esc(copy.stagesTitle)}</h2><p>${esc(copy.noSynthetic)}</p></div></div>
          <ol>${copy.stages.map((stage, index) => `<li class="${index === 0 ? "is-complete" : ""}"><span class="portfolio-integration__number">${index + 1}</span><div><div class="portfolio-integration__title"><h3>${esc(stage[0])}</h3><small>${esc(stage[1])}</small></div><p>${esc(stage[2])}</p></div></li>`).join("")}</ol>
        </section>

        <section class="portfolio-page__section" aria-labelledby="portfolio-related-title">
          <div class="portfolio-section-heading"><span>04</span><div><h2 id="portfolio-related-title">${esc(copy.relatedTitle)}</h2></div></div>
          <div class="portfolio-related-list">${related.map((itemEntry) => {
            const itemName = lang === "ru" ? itemEntry.name_ru : itemEntry.name_en;
            const itemShort = lang === "ru" ? itemEntry.short_ru : itemEntry.short_en;
            return `<button type="button" data-gir-action="route" data-route="${esc(itemEntry.route)}"><span>${esc(itemShort)}</span><strong>${esc(itemName)}</strong><small>${esc(itemEntry.status === "ready" ? copy.ready : copy.planned)}</small></button>`;
          }).join("")}</div>
        </section>
      </section>`;
    return true;
  }

  global.GIRIndexPortfolio = Object.freeze({
    groups,
    get,
    getGroup,
    groupForCode,
    isReady,
    isPlanned,
    allCodes,
    readyCodes,
    plannedCodes,
    meta,
    stats,
    footerSummary,
    labels,
    renderPlanned,
  });
})(window);
