/* GIR T20 — portfolio-scale country analytical workspace */
(() => {
  "use strict";

  const cache = new Map();
  let requestSerial = 0;
  let currentPayload = null;
  let portfolioQuery = "";
  let portfolioGroup = "all";
  let portfolioStatus = "all";

  const tr = (ru, en) => state.lang === "ru" ? ru : en;
  const esc = (value) => escapeHtml(value == null ? "" : String(value));
  const num = (value) => value == null || value === "" || Number.isNaN(Number(value)) ? null : Number(value);
  const format = (value, digits = 1) => num(value) == null ? "—" : new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "en-US", {maximumFractionDigits: digits, minimumFractionDigits: digits}).format(Number(value));
  const integer = (value) => num(value) == null ? "—" : new Intl.NumberFormat(state.lang === "ru" ? "ru-RU" : "en-US", {maximumFractionDigits: 0}).format(Number(value));
  const moduleName = (item) => state.lang === "ru" ? item.name_ru : item.name_en;
  const groupName = (item) => state.lang === "ru" ? item.label_ru : item.label_en;
  const unitName = (item) => state.lang === "ru" ? item.unit_ru : item.unit_en;
  const freshnessName = (item) => state.lang === "ru" ? item?.freshness?.label_ru : item?.freshness?.label_en;

  const GROUP_ICONS = {
    core: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V8m5 11V4m5 15v-7m5 7V9"/><path d="M2 21h20"/></svg>`,
    education: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.2V16c3.5 2.5 8.5 2.5 12 0v-4.8M22 9v6"/></svg>`,
    institutions: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5M5 10v8m5-8v8m4-8v8m5-8v8M3 20h18"/></svg>`,
    digital: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8m-4-4v4M7 9h4v4H7zm8 0h2v4h-2z"/></svg>`,
    economy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 17V9m5 8V5m5 12v-7m5 7V3"/><path d="m4 7 5-3 5 4 7-6"/></svg>`,
    society: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.4-4.2 2.2-6.5 5.5-6.5s5.1 2.3 5.5 6.5M13 15c1-.9 2.2-1.4 3.8-1.4 2.8 0 4.4 2 4.7 5.4"/></svg>`,
    environment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C10 4 5 9 5 16c0 2.2 1.8 4 4 4 7 0 11-6 11-16Z"/><path d="M4 21c2-6 6-10 12-13"/></svg>`,
    security: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.8 3 8 7.5 9.5 4.5-1.5 7.5-4.7 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>`,
  };

  const ROUTES = {
    HDI:"index-HDI", HCI_PLUS:"index-HCI_PLUS", GTCI:"index-GTCI", GII:"index-GII", IDI:"index-IDI", HTEI:"index-HTEI",
    PISA_SKI:"index-PISA_SKI", QS_ET:"index-QS_ET", THE_ENG:"index-THE_ENG", ARWU:"index-ARWU",
    CPI:"index-CPI", WPFI:"index-WPFI", ROLI:"index-ROLI", WGI:"index-WGI", VDEM:"index-VDEM",
    NRI:"index-NRI", EGDI:"index-EGDI", GCI:"index-GCI", GARI:"index-GARI", AIPI:"index-AIPI", CF_IQI:"index-CF_IQI", TOP500:"index-TOP500",
    UNCTAD_PCI:"index-UNCTAD_PCI", BREADY:"index-BREADY", ECI:"index-ECI", KOF_GLOBAL:"index-KOF_GLOBAL", IMF_FDI:"index-IMF_FDI", GLOBAL_FINDEX:"index-GLOBAL_FINDEX",
    SPI:"index-SPI", SDG:"index-SDG", WHR:"index-WHR", GGGI:"index-GGGI", UHC_SCI:"index-UHC_SCI",
    EPI:"index-EPI", ND_GAIN:"index-ND_GAIN", ETI:"index-ETI", WORLD_RISK_INDEX:"index-WORLD_RISK_INDEX",
    GPI:"index-GPI", GMI:"index-GMI", GOCI:"index-GOCI", SIPRI_MILEX:"index-SIPRI_MILEX", DHL_GCI:"index-DHL_GCI", WORLD_BANK_LPI:"index-WORLD_BANK_LPI", UNCTAD_LSCI:"index-UNCTAD_LSCI",
  };

  function cacheKey() { return `${state.country}:${state.year || 2026}:${state.lang}`; }
  function statusLabel(status) {
    return ({available:tr("есть результат","result available"), source_gated:tr("ожидает источник","source pending"), no_country_data:tr("нет наблюдения","no country observation")})[status] || status;
  }
  function scoreText(item) {
    if (item.score == null) return "—";
    const abs = Math.abs(Number(item.score));
    const digits = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 10 ? 2 : 3;
    return `${format(item.score, digits)}${unitName(item) ? ` <small>${esc(unitName(item))}</small>` : ""}`;
  }
  function rankText(item) {
    if (item.rank == null || !item.universe) return tr("место не присваивается", "not ranked");
    return tr(`${integer(item.rank)}-е место из ${integer(item.universe)}`, `${integer(item.rank)} of ${integer(item.universe)}`);
  }
  function pctText(value) { return value == null ? "—" : `${format(value, 0)}%`; }
  function statusClass(item) { return `is-${item.status || "unknown"}`; }
  function freshnessClass(item) { return `is-${item?.freshness?.status || "unknown"}`; }
  function countryName(payload) { return state.lang === "ru" ? payload.country.name_ru : payload.country.name_en; }
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
  function countryMeta(payload) {
    const region = state.lang === "ru" ? (REGION_RU[payload.country.region] || payload.country.region) : payload.country.region;
    const income = state.lang === "ru" ? (INCOME_RU[payload.country.income_group] || payload.country.income_group) : payload.country.income_group;
    return [region, income].filter(Boolean).join(" · ");
  }
  function safeAnchor(id) { return String(id).replace(/[^a-zA-Z0-9_-]/g, "-"); }
  function jumpTo(id) { document.getElementById(id)?.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"}); }
  function moduleRoute(code) { return ROUTES[code] || `index-${code}`; }

  async function fetchPayload() {
    const key = cacheKey();
    if (cache.has(key)) return cache.get(key);
    const response = await fetch(`/api/country/${encodeURIComponent(state.country)}/workspace-v3?year=${encodeURIComponent(state.year || 2026)}`, {cache:"no-store"});
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || `HTTP ${response.status}`);
    }
    const payload = await response.json();
    cache.set(key, payload);
    return payload;
  }

  function loading() {
    return `<section class="cp3-loading" aria-live="polite"><div class="cp3-loading-mark">G</div><div><h1>${tr("Формируется комплексный профиль", "Building the full country profile")}</h1><p>${tr("Сводим 44 модуля, восемь тематических направлений, годы данных и доказательную базу…", "Combining 44 modules, eight themes, data years and evidence…")}</p></div></section>`;
  }

  function heroNarrative(payload) {
    const strong = payload.insights.strongest_group;
    const weak = payload.insights.weakest_group;
    if (!strong && !weak) return tr("Профиль собирает доступные международные данные без подмены отсутствующих наблюдений нулями.", "The profile assembles available international evidence without replacing missing observations with zeroes.");
    const s = strong ? groupName(strong) : "—";
    const w = weak ? groupName(weak) : "—";
    return tr(`Наиболее сильный тематический профиль — «${s}»; наиболее выраженные международные разрывы сосредоточены в направлении «${w}».`, `The strongest thematic profile is “${s}”; the largest international gaps are concentrated in “${w}”.`);
  }

  function hero(payload) {
    const p = payload.portfolio;
    const evidence = payload.evidence;
    const current = payload.freshness.current || 0;
    const recent = payload.freshness.recent || 0;
    const stale = payload.freshness.stale || 0;
    const total = Math.max(1, current + recent + stale);
    const currentW = 100 * current / total;
    const recentW = 100 * recent / total;
    return `<section class="cp3-hero" aria-labelledby="cp3-country-title">
      <div class="cp3-hero-main">
        <div class="cp3-country-kicker"><span class="cp3-flag">${flagImage(payload.country, "flag-img big")}</span><span>${esc(countryMeta(payload).toUpperCase())}</span></div>
        <h1 id="cp3-country-title">${esc(countryName(payload))}</h1>
        <p class="cp3-hero-lead">${esc(heroNarrative(payload))}</p>
        <div class="cp3-actions">
          <button class="primary" type="button" data-cp3-route="matrix">${tr("Сравнить страны", "Compare countries")} <span aria-hidden="true">→</span></button>
          <button type="button" data-cp3-route="data-lab">${tr("Исследовать данные", "Explore data")}</button>
          <a class="button-like" href="${esc(payload.export.csv)}">${tr("Скачать профиль", "Download profile")}</a>
        </div>
      </div>
      <aside class="cp3-hero-summary" aria-label="${tr("Сводка охвата", "Coverage summary")}">
        <div class="cp3-summary-primary"><strong>${integer(p.available_modules)}</strong><span>${tr("модулей с результатом страны", "modules with a country result")}</span></div>
        <div class="cp3-summary-grid">
          <div><strong>${integer(p.total_modules)}</strong><span>${tr("в портфеле", "in portfolio")}</span></div>
          <div><strong>${integer(p.comparable_modules)}</strong><span>${tr("сопоставимы по позиции", "position-comparable")}</span></div>
          <div><strong>${integer(evidence.source_count)}</strong><span>${tr("источников", "sources")}</span></div>
          <div><strong>${evidence.year_min || "—"}–${evidence.year_max || "—"}</strong><span>${tr("годы данных", "data years")}</span></div>
        </div>
        <div class="cp3-fresh-bar" role="img" aria-label="${tr("Актуальность данных", "Data freshness")}"><span style="width:${currentW}%"></span><span style="width:${recentW}%"></span><span></span></div>
        <p>${tr(`${current} актуальных · ${recent} с умеренным лагом · ${stale} требуют обновления`, `${current} current · ${recent} moderate lag · ${stale} refresh recommended`)}</p>
      </aside>
    </section>`;
  }

  function jumpNav() {
    const items = [
      ["cp3-themes", tr("Тематический профиль","Thematic profile")],
      ["cp3-positions", tr("Международные позиции","International positions")],
      ["cp3-portfolio", tr("Все 44 модуля","All 44 modules")],
      ["cp3-freshness", tr("Актуальность","Freshness")],
      ["cp3-trends", tr("Динамика","Trends")],
      ["cp3-diagnostics", tr("Диагностика","Diagnostics")],
      ["cp3-actions", tr("Решения","Actions")],
      ["cp3-evidence", tr("Доказательства","Evidence")],
    ];
    return `<nav class="cp3-jump-nav" aria-label="${tr("Разделы профиля", "Profile sections")}">${items.map(([id,label])=>`<button type="button" data-cp3-jump="${id}">${esc(label)}</button>`).join("")}</nav>`;
  }

  function sectionHead(number, title, copy) {
    return `<header class="cp3-section-head"><div class="cp3-section-number"><span></span>${String(number).padStart(2,"0")}</div><div><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ""}</div></header>`;
  }

  function radar(groups) {
    const cx=160, cy=150, maxR=112, n=groups.length;
    const points=(r)=>groups.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n; return `${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`}).join(" ");
    const data=groups.map((g,i)=>{const a=-Math.PI/2+i*2*Math.PI/n; const r=maxR*Math.max(0,Math.min(100,Number(g.median_percentile||0)))/100; return `${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`}).join(" ");
    const axes=groups.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n; return `<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*maxR}" y2="${cy+Math.sin(a)*maxR}"/>`}).join("");
    const labels=groups.map((g,i)=>{const a=-Math.PI/2+i*2*Math.PI/n; const r=maxR+23; const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(g.label_en.split(/[ &]/)[0].slice(0,12))}</text>`}).join("");
    return `<svg class="cp3-radar" viewBox="0 0 320 300" role="img" aria-label="${tr("Тематические международные позиции", "Thematic international positions")}">
      <g class="grid"><polygon points="${points(maxR)}"/><polygon points="${points(maxR*.66)}"/><polygon points="${points(maxR*.33)}"/>${axes}</g>
      <polygon class="shape" points="${data}"/>${labels}
    </svg>`;
  }

  function themes(payload) {
    const groupCards = payload.groups.map((g)=>{
      const score = g.median_percentile;
      const strongest = g.strongest ? g.strongest.short_name : "—";
      const weakest = g.weakest ? g.weakest.short_name : "—";
      return `<article class="cp3-theme-card ${score == null ? "is-empty" : ""}">
        <div class="cp3-theme-top"><span class="cp3-theme-icon">${GROUP_ICONS[g.key] || ""}</span><span class="cp3-theme-count">${g.available_count}/${g.module_count}</span></div>
        <h3>${esc(groupName(g))}</h3>
        <div class="cp3-theme-score"><strong>${pctText(score)}</strong><span>${tr("медианный процентиль", "median percentile")}</span></div>
        <div class="cp3-theme-meter"><span style="width:${score == null ? 0 : score}%"></span></div>
        <dl><div><dt>${tr("Сильная позиция","Strong position")}</dt><dd>${esc(strongest)}</dd></div><div><dt>${tr("Зона внимания","Attention")}</dt><dd>${esc(weakest)}</dd></div></dl>
        <button type="button" data-cp3-group="${g.key}">${tr("Открыть модули", "Open modules")} <span aria-hidden="true">→</span></button>
      </article>`;
    }).join("");
    return `<section id="cp3-themes" class="cp3-section">${sectionHead(1,tr("Восемь измерений страны","Eight dimensions of the country"),tr("Тематические оценки строятся по международным процентилям. Исходные оценки разных шкал не усредняются.","Thematic positions use international percentiles. Original scores on different scales are never averaged."))}
      <div class="cp3-themes-layout"><div class="cp3-theme-grid">${groupCards}</div><aside class="cp3-radar-panel"><h3>${tr("Сбалансированность профиля","Profile balance")}</h3>${radar(payload.groups)}<p>${tr("Чем ближе контур к внешней границе, тем выше медианная международная позиция доступных модулей направления.","The closer the outline is to the edge, the higher the median international position of available modules.")}</p></aside></div>
    </section>`;
  }

  function positions(payload) {
    const modules = payload.modules.filter(m=>m.status==="available" && m.comparable && m.percentile!=null).sort((a,b)=>b.percentile-a.percentile);
    return `<section id="cp3-positions" class="cp3-section">${sectionHead(2,tr("Международные позиции","International positions"),tr("Единая шкала используется только для сравнения положения страны; официальные значения и единицы сохраняются рядом.","The common scale is used only for position comparison; official values and units remain visible."))}
      <div class="cp3-position-axis" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
      <div class="cp3-position-list">${modules.map((m,i)=>`<article class="cp3-position-row">
        <div class="cp3-pos-order">${String(i+1).padStart(2,"0")}</div>
        <div class="cp3-pos-label"><strong>${esc(m.short_name)}</strong><span>${esc(moduleName(m))}</span></div>
        <div class="cp3-pos-track"><span style="width:${m.percentile}%"></span><i style="left:${m.percentile}%"></i></div>
        <div class="cp3-pos-pct"><strong>${pctText(m.percentile)}</strong><span>${esc(rankText(m))}</span></div>
        <div class="cp3-pos-score">${scoreText(m)}</div>
        <button type="button" class="icon-btn" aria-label="${tr("Открыть модуль","Open module")}" data-cp3-module="${esc(m.code)}">→</button>
      </article>`).join("")}</div>
      <p class="cp3-method-note">${tr("Контекстные показатели без однозначной направленности — например, милитаризация — не включаются в эту шкалу.","Contextual measures without a single normative direction—such as militarisation—are excluded from this scale.")}</p>
    </section>`;
  }

  function portfolioControls(payload) {
    return `<div class="cp3-portfolio-controls">
      <label class="cp3-search"><span class="sr-only">${tr("Поиск модуля","Search modules")}</span><input type="search" value="${esc(portfolioQuery)}" placeholder="${tr("Название, код или организация…","Name, code or publisher…")}" data-cp3-search><span aria-hidden="true">⌕</span></label>
      <label><span>${tr("Направление","Theme")}</span><select data-cp3-group-filter><option value="all">${tr("Все восемь направлений","All eight themes")}</option>${payload.groups.map(g=>`<option value="${g.key}" ${portfolioGroup===g.key?"selected":""}>${esc(groupName(g))}</option>`).join("")}</select></label>
      <label><span>${tr("Состояние","Status")}</span><select data-cp3-status-filter><option value="all">${tr("Все состояния","All statuses")}</option><option value="available" ${portfolioStatus==="available"?"selected":""}>${tr("Есть результат","Result available")}</option><option value="source_gated" ${portfolioStatus==="source_gated"?"selected":""}>${tr("Ожидает источник","Source pending")}</option><option value="no_country_data" ${portfolioStatus==="no_country_data"?"selected":""}>${tr("Нет наблюдения","No observation")}</option></select></label>
      <span class="cp3-result-count" data-cp3-result-count></span>
    </div>`;
  }

  function qsPortfolioExtra(m) {
    const qs = m?.qs_portfolio;
    if (!qs) return "";
    const profile = (qs.profiles || [])[0];
    const methodology = state.lang === "ru" ? qs.methodology?.ru : qs.methodology?.en;
    return `<div class="cp3-qs-ecosystem">
      <div><span>${tr("QS-портфель","QS portfolio")}</span><strong>${integer(qs.loaded_project_count)} / ${integer(qs.registered_projects)}</strong><small>${tr("проектов с данными","projects with data")}</small></div>
      <div><span>${tr("Дисциплины","Subjects")}</span><strong>${integer(qs.subjects)}</strong><small>${integer(qs.broad_subject_areas)} ${tr("областей","areas")}</small></div>
      <div><span>${tr("Университеты страны","Country institutions")}</span><strong>${integer(qs.institution_rows_for_country)}</strong><small>${profile ? esc(state.lang === "ru" ? profile.project_name_ru : profile.project_name_en) : tr("нет загруженного проекта","no loaded project")}</small></div>
      <p>${esc(methodology || tr("Профили рассчитываются отдельно для каждого проекта QS; общий супериндекс не создаётся.","Profiles are calculated separately for each QS project; no cross-project super-index is created."))}</p>
    </div>`;
  }

  function moduleCard(m) {
    const status = statusLabel(m.status);
    const peer = m.peer_benchmarks?.RUSSIA_CORE;
    return `<article class="cp3-module-card ${statusClass(m)}" data-module-code="${esc(m.code)}" data-module-group="${esc(m.group)}" data-module-status="${esc(m.status)}" data-module-search="${esc(`${m.code} ${m.name_ru} ${m.name_en} ${m.authority}`.toLowerCase())}">
      <header><div><span class="cp3-module-code">${esc(m.short_name)}</span><span class="cp3-status-dot"></span></div><span class="cp3-status-label">${esc(status)}</span></header>
      <h3>${esc(moduleName(m))}</h3><p class="cp3-authority">${esc(m.authority)}</p>
      <div class="cp3-module-value"><strong>${scoreText(m)}</strong><span>${m.status==="available" ? esc(rankText(m)) : esc(status)}</span></div>
      ${m.status==="available" && m.percentile!=null ? `<div class="cp3-module-meter"><span style="width:${m.percentile}%"></span></div>` : ""}
      <dl>
        <div><dt>${tr("Год данных","Data year")}</dt><dd>${m.year || "—"}</dd></div>
        <div><dt>${tr("Актуальность","Freshness")}</dt><dd class="${freshnessClass(m)}">${esc(freshnessName(m) || "—")}</dd></div>
        <div><dt>${tr("Процентиль","Percentile")}</dt><dd>${pctText(m.percentile)}</dd></div>
        <div><dt>${tr("Сравнение с peers","Peer gap")}</dt><dd>${peer?.gap==null?"—":`${peer.gap>0?"+":""}${format(peer.gap,0)} п.п.`}</dd></div>
      </dl>
      ${qsPortfolioExtra(m)}
      <footer><button type="button" data-cp3-module="${esc(m.code)}">${tr("Открыть анализ","Open analysis")}</button>${m.value_id ? `<button type="button" class="subtle" data-cp3-provenance="${esc(m.value_id)}">${tr("Источник","Evidence")}</button>` : ""}</footer>
    </article>`;
  }

  function portfolio(payload) {
    return `<section id="cp3-portfolio" class="cp3-section">${sectionHead(3,tr("Полный портфель страны","The full country portfolio"),tr("Все 44 рабочих пространства показаны вместе: опубликованные результаты, отсутствующие наблюдения и подготовленные контуры подключения источников.","All 44 workspaces are shown together: published results, missing observations and source-ready analytical modules."))}
      ${portfolioControls(payload)}
      <div class="cp3-portfolio-groups">${payload.groups.map(g=>`<section class="cp3-module-group" data-portfolio-group="${g.key}"><header><div class="cp3-group-title"><span>${GROUP_ICONS[g.key]||""}</span><div><h3>${esc(groupName(g))}</h3><p>${g.available_count}/${g.module_count} ${tr("модулей с результатом","modules with results")}</p></div></div><button type="button" data-cp3-toggle-group="${g.key}" aria-expanded="true">${tr("Свернуть","Collapse")}</button></header><div class="cp3-module-grid">${payload.modules.filter(m=>m.group===g.key).map(moduleCard).join("")}</div></section>`).join("")}</div>
      <div class="cp3-empty-filter" hidden>${tr("По заданным условиям модули не найдены.","No modules match the selected filters.")}</div>
    </section>`;
  }

  function freshness(payload) {
    const order={current:0,recent:1,stale:2,unknown:3};
    const modules=[...payload.modules].sort((a,b)=>(order[a.freshness.status]-order[b.freshness.status]) || (a.code.localeCompare(b.code)));
    return `<section id="cp3-freshness" class="cp3-section">${sectionHead(4,tr("Актуальность и полнота","Freshness and coverage"),tr("Профиль показывает фактический год каждого наблюдения. Отсутствующий выпуск и отсутствие страны в выпуске — разные состояния.","The profile exposes the actual year of every observation. A missing release and a missing country observation are distinct states."))}
      <div class="cp3-fresh-legend"><span class="is-current">${tr("Актуально","Current")}</span><span class="is-recent">${tr("Умеренный лаг","Moderate lag")}</span><span class="is-stale">${tr("Требует обновления","Refresh recommended")}</span><span class="is-source_gated">${tr("Ожидает источник","Source pending")}</span><span class="is-no_country_data">${tr("Нет наблюдения","No observation")}</span></div>
      <div class="cp3-fresh-grid">${modules.map(m=>`<button type="button" class="cp3-fresh-cell ${m.status!=="available"?`is-${m.status}`:freshnessClass(m)}" data-cp3-module="${esc(m.code)}"><strong>${esc(m.short_name)}</strong><span>${m.status==="available"?(m.year||"—"):esc(statusLabel(m.status))}</span><small>${m.status==="available"?esc(freshnessName(m)):esc(m.authority)}</small></button>`).join("")}</div>
    </section>`;
  }

  function sparkline(item) {
    const values=(item.trend||[]).filter(x=>num(x.score)!=null);
    if(values.length<2) return "";
    const width=260,height=92,pad=8;
    const scores=values.map(x=>Number(x.score)), min=Math.min(...scores), max=Math.max(...scores), span=max-min||1;
    const pts=values.map((x,i)=>`${pad+(width-2*pad)*(i/(values.length-1))},${pad+(height-2*pad)*(1-(x.score-min)/span)}`).join(" ");
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(moduleName(item))}: ${tr("динамика","trend")}"><path d="M${pts.replaceAll(" "," L")}"/><circle cx="${pts.split(" ").at(-1).split(",")[0]}" cy="${pts.split(" ").at(-1).split(",")[1]}" r="3"/></svg>`;
  }

  function trends(payload) {
    const modules=(payload.trend_modules||[]).slice(0,10);
    return `<section id="cp3-trends" class="cp3-section">${sectionHead(5,tr("Динамика сопоставимых рядов","Comparable trends"),tr("Показываются только временные ряды, которые не требуют искусственного соединения методически разных редакций.","Only time series that do not require artificial splicing of methodologically different editions are shown."))}
      ${modules.length ? `<div class="cp3-trend-grid">${modules.map(m=>{const first=m.trend[0],last=m.trend.at(-1),delta=last&&first?Number(last.score)-Number(first.score):null; return `<article class="cp3-trend-card"><header><div><span>${esc(m.short_name)}</span><h3>${esc(moduleName(m))}</h3></div><button type="button" data-cp3-module="${esc(m.code)}">→</button></header>${sparkline(m)}<footer><span>${first?.year||"—"}–${last?.year||"—"}</span><strong>${delta==null?"—":`${delta>0?"+":""}${format(delta,2)}`}</strong><span>${scoreText(m)}</span></footer></article>`}).join("")}</div>` : `<div class="cp3-empty-state">${tr("Для выбранной страны пока нет достаточно длинных сопоставимых рядов.","The selected country does not yet have sufficiently long comparable series.")}</div>`}
    </section>`;
  }

  function diagnosticColumn(title, items, kind) {
    return `<article class="cp3-diagnostic-column is-${kind}"><header><h3>${esc(title)}</h3><span>${items.length}</span></header>${items.slice(0,6).map(m=>`<button type="button" data-cp3-module="${esc(m.code)}"><span><strong>${esc(m.short_name)}</strong><small>${esc(moduleName(m))}</small></span><b>${m.status==="available"?pctText(m.percentile):esc(statusLabel(m.status))}</b></button>`).join("")}</article>`;
  }

  function diagnostics(payload) {
    return `<section id="cp3-diagnostics" class="cp3-section">${sectionHead(6,tr("Диагностический вывод","Diagnostic synthesis"),tr("Сильные стороны, разрывы и пробелы доказательной базы разделены. Отсутствие данных не интерпретируется как слабый результат.","Strengths, gaps and evidence gaps are separated. Missing data are not interpreted as weak performance."))}
      <div class="cp3-diagnostics-grid">${diagnosticColumn(tr("Сильные международные позиции","Strong international positions"),payload.insights.strengths||[],"strength")}${diagnosticColumn(tr("Зоны внимания","Attention areas"),payload.insights.gaps||[],"gap")}${diagnosticColumn(tr("Пробелы доказательной базы","Evidence gaps"),payload.insights.evidence_gaps||[],"evidence")}</div>
    </section>`;
  }

  function policies(payload) {
    const policies=payload.policies||[];
    return `<section id="cp3-actions" class="cp3-section">${sectionHead(7,tr("От диагностики к решениям","From diagnosis to action"),tr("Для России измеряемые разрывы связаны с ранее разработанной программой мер, ответственными акторами и KPI.","For Russia, measured gaps are linked to the established policy programme, responsible actors and KPIs."))}
      ${policies.length ? `<div class="cp3-policy-grid">${policies.slice(0,8).map((p,i)=>`<article class="cp3-policy-card"><div class="cp3-policy-no">${String(i+1).padStart(2,"0")}</div><div><span class="cp3-policy-horizon">${esc(p.horizon||"")}</span><h3>${esc(state.lang==="ru"?p.title_ru:p.title_en)}</h3><p>${esc(state.lang==="ru"?p.problem_ru:p.problem_en)}</p><dl><div><dt>${tr("Показатель","Indicator")}</dt><dd>${esc(state.lang==="ru"?p.indicator_ru:p.indicator_en)}</dd></div><div><dt>${tr("Ответственный","Responsible")}</dt><dd>${esc(state.lang==="ru"?p.actor_ru:p.actor_en)}</dd></div></dl></div></article>`).join("")}</div><button class="cp3-policy-more" type="button" data-cp3-route="policy-center">${tr("Открыть полный центр рекомендаций","Open the full policy centre")} <span>→</span></button>` : `<div class="cp3-empty-state">${tr("Структурированная программа мер опубликована для России.","A structured policy programme is currently published for Russia.")}</div>`}
    </section>`;
  }

  function evidence(payload) {
    const e=payload.evidence;
    return `<section id="cp3-evidence" class="cp3-section cp3-evidence-section">${sectionHead(8,tr("Доказательная основа профиля","Evidence behind the profile"),tr("Каждый опубликованный результат связан с источником, snapshot, контрольной суммой и преобразованием.","Every published result is linked to a source, snapshot, checksum and transformation."))}
      <div class="cp3-evidence-grid"><div><strong>${integer(e.source_count)}</strong><span>${tr("источников в профиле","sources in this profile")}</span></div><div><strong>${integer(e.value_ids)}</strong><span>${tr("проверяемых value ID","traceable value IDs")}</span></div><div><strong>${integer(e.snapshots)}</strong><span>${tr("snapshots платформы","platform snapshots")}</span></div><div><strong>${integer(e.reproducibility_artifacts)}</strong><span>${tr("артефактов воспроизводимости","reproducibility artifacts")}</span></div></div>
      <div class="cp3-lineage" role="region" tabindex="0" aria-label="${tr("Цепочка происхождения данных","Data lineage")}"><div><span>01</span><strong>${tr("Официальный источник","Official source")}</strong></div><i>→</i><div><span>02</span><strong>Snapshot + SHA-256</strong></div><i>→</i><div><span>03</span><strong>${tr("Гармонизация","Harmonisation")}</strong></div><i>→</i><div><span>04</span><strong>${tr("Показатель","Indicator")}</strong></div><i>→</i><div><span>05</span><strong>${tr("Вывод","Insight")}</strong></div></div>
      <div class="cp3-evidence-actions"><button type="button" data-cp3-route="data-lab">${tr("Открыть исходные данные","Open source data")}</button><button type="button" data-cp3-route="methodology">${tr("Изучить методологию","Read methodology")}</button><a href="${esc(payload.export.csv)}">CSV</a><a href="${esc(payload.export.json)}">JSON</a></div>
    </section>`;
  }

  function page(payload) {
    return `<div class="cp3-page">${hero(payload)}${jumpNav()}${themes(payload)}${positions(payload)}${portfolio(payload)}${freshness(payload)}${trends(payload)}${diagnostics(payload)}${policies(payload)}${evidence(payload)}</div>`;
  }

  function applyPortfolioFilters(root) {
    const query=portfolioQuery.trim().toLowerCase();
    let visible=0;
    root.querySelectorAll(".cp3-module-card").forEach(card=>{
      const matchesQuery=!query || card.dataset.moduleSearch.includes(query);
      const matchesGroup=portfolioGroup==="all" || card.dataset.moduleGroup===portfolioGroup;
      const matchesStatus=portfolioStatus==="all" || card.dataset.moduleStatus===portfolioStatus;
      const show=matchesQuery&&matchesGroup&&matchesStatus;
      card.hidden=!show; if(show) visible++;
    });
    root.querySelectorAll(".cp3-module-group").forEach(group=>{
      const cards=[...group.querySelectorAll(".cp3-module-card")];
      group.hidden=!cards.some(card=>!card.hidden);
    });
    root.querySelector("[data-cp3-result-count]").textContent=tr(`${visible} модулей`,` ${visible} modules`);
    root.querySelector(".cp3-empty-filter").hidden=visible!==0;
  }

  function bind(root,payload) {
    root.querySelectorAll("[data-cp3-jump]").forEach(btn=>btn.addEventListener("click",()=>jumpTo(btn.dataset.cp3Jump)));
    root.querySelectorAll("[data-cp3-route]").forEach(btn=>btn.addEventListener("click",()=>routeTo(btn.dataset.cp3Route)));
    root.querySelectorAll("[data-cp3-module]").forEach(btn=>btn.addEventListener("click",()=>routeTo(moduleRoute(btn.dataset.cp3Module))));
    root.querySelectorAll("[data-cp3-provenance]").forEach(btn=>btn.addEventListener("click",()=>window.GIRCountryProfileV2?.openProvenance?.(btn.dataset.cp3Provenance, btn)));
    root.querySelectorAll("[data-cp3-group]").forEach(btn=>btn.addEventListener("click",()=>{portfolioGroup=btn.dataset.cp3Group; portfolioStatus="all"; portfolioQuery=""; jumpTo("cp3-portfolio"); setTimeout(()=>{const select=root.querySelector("[data-cp3-group-filter]"); if(select)select.value=portfolioGroup; applyPortfolioFilters(root);},250);}));
    const search=root.querySelector("[data-cp3-search]"); if(search) search.addEventListener("input",()=>{portfolioQuery=search.value;applyPortfolioFilters(root);});
    root.querySelector("[data-cp3-group-filter]")?.addEventListener("change",e=>{portfolioGroup=e.target.value;applyPortfolioFilters(root);});
    root.querySelector("[data-cp3-status-filter]")?.addEventListener("change",e=>{portfolioStatus=e.target.value;applyPortfolioFilters(root);});
    root.querySelectorAll("[data-cp3-toggle-group]").forEach(btn=>btn.addEventListener("click",()=>{const group=btn.closest(".cp3-module-group"); const grid=group.querySelector(".cp3-module-grid"); const expanded=btn.getAttribute("aria-expanded")!=="false"; btn.setAttribute("aria-expanded",String(!expanded)); grid.hidden=expanded; btn.textContent=expanded?tr("Развернуть","Expand"):tr("Свернуть","Collapse");}));
    applyPortfolioFilters(root);
  }

  function renderPayload(payload) {
    currentPayload=payload;
    const root=document.querySelector("#view");
    root.innerHTML=page(payload);
    bind(root,payload);
    document.title=`${countryName(payload)} — GIR`;
  }

  async function render() {
    const root=document.querySelector("#view");
    const serial=++requestSerial;
    const key=cacheKey();
    if(cache.has(key)){renderPayload(cache.get(key));return;}
    root.innerHTML=loading();
    try{
      const payload=await fetchPayload();
      if(serial!==requestSerial || state.page!=="country")return;
      renderPayload(payload);
    }catch(error){
      if(serial!==requestSerial)return;
      root.innerHTML=`<section class="cp3-error"><h1>${tr("Не удалось сформировать профиль страны","Could not build the country profile")}</h1><p>${esc(error.message)}</p><button type="button" data-retry>${tr("Повторить","Retry")}</button></section>`;
      root.querySelector("[data-retry]")?.addEventListener("click",()=>{cache.delete(key);render();});
    }
  }

  window.GIRCountryPortfolioV3={render,clearCache:()=>cache.clear(),getPayload:()=>currentPayload};
})();
