/* GIR Stage 6 — bilingual methodology wiki. */
(() => {
  "use strict";

  const CONTENT_ROOT = "static/methodology/content";
  const FIGURE_ROOT = "static/methodology/figures";
  const cache = new Map();
  let summaryPromise = null;
  let renderToken = 0;
  let observer = null;
  let popstateBound = false;

  const wikiState = {
    lang: "ru",
    theme: "dark",
    content: null,
    summary: null,
    chapterKey: "",
    anchor: "",
    mode: "chapter",
    routeKey: "",
    searchQuery: "",
    searchOpen: false,
    lastFigureTrigger: null,
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const numberFormat = (value, digits = 0) => {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return Number(value).toLocaleString(wikiState.lang === "ru" ? "ru-RU" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };
  const humanBytes = (value) => {
    let current = Number(value || 0);
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    while (current >= 1024 && index < units.length - 1) {
      current /= 1024;
      index += 1;
    }
    return `${numberFormat(current, index ? 1 : 0)} ${units[index]}`;
  };
  const t = (ru, en) => wikiState.lang === "ru" ? ru : en;
  const chapterCountLabel = (count) => {
    if (wikiState.lang === "en") return count === 1 ? "chapter" : "chapters";
    const mod10 = count % 10, mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "глава";
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "главы";
    return "глав";
  };
  const icon = (name) => {
    const paths = {
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z"></path>',
      arrow: '<path d="M5 12h14"></path><path d="m14 7 5 5-5 5"></path>',
      download: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
      print: '<path d="M7 8V3h10v5"></path><rect x="5" y="14" width="14" height="7"></rect><path d="M5 17H3V9h18v8h-2"></path>',
      link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"></path><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"></path>',
      image: '<rect x="3" y="4" width="18" height="16" rx="1"></rect><circle cx="8.5" cy="9" r="1.5"></circle><path d="m21 15-5-5L5 20"></path>',
      close: '<path d="m6 6 12 12M18 6 6 18"></path>',
      chevron: '<path d="m9 18 6-6-6-6"></path>',
      check: '<path d="m5 12 4 4L19 6"></path>',
      file: '<path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5"></path>',
      expand: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"></path>',
    };
    return `<svg class="method-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  };

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }

  function loadContent(lang) {
    if (!cache.has(lang)) cache.set(lang, fetchJson(`${CONTENT_ROOT}/methodology.${lang}.json`));
    return cache.get(lang);
  }

  function loadSummary() {
    if (!summaryPromise) summaryPromise = fetchJson("/api/methodology/summary");
    return summaryPromise;
  }

  function parseLocation(content) {
    const url = new URL(location.href);
    const requestedKey = url.searchParams.get("method") || wikiState.chapterKey;
    const requestedMode = url.searchParams.get("view") || wikiState.mode;
    const requestedAnchor = url.searchParams.get("section") || "";
    wikiState.mode = requestedMode === "continuous" ? "continuous" : "chapter";
    wikiState.anchor = requestedAnchor;
    const chapter = content.chapters.find((item) => item.key === requestedKey)
      || content.chapters.find((item) => item.role === content.chapters.find((old) => old.key === wikiState.chapterKey)?.role)
      || content.chapters.find((item) => item.key === content.default_chapter_key)
      || content.chapters[0];
    wikiState.chapterKey = chapter?.key || "";
  }

  function updateUrl({ push = false, section = "" } = {}) {
    const url = new URL(location.href);
    url.searchParams.set("method", wikiState.chapterKey);
    if (wikiState.mode === "continuous") url.searchParams.set("view", "continuous");
    else url.searchParams.delete("view");
    if (section) url.searchParams.set("section", section);
    else url.searchParams.delete("section");
    url.hash = "methodology";
    history[push ? "pushState" : "replaceState"]({ methodology: true }, "", url);
  }

  function activeChapter() {
    return wikiState.content?.chapters.find((item) => item.key === wikiState.chapterKey)
      || wikiState.content?.chapters[0];
  }

  function heroFigurePath(file = "01_taxonomy.png") {
    return `${FIGURE_ROOT}/${wikiState.lang}-${wikiState.theme}/${file}`;
  }

  function renderLoading() {
    return `<section class="method-loading" aria-live="polite"><div class="method-loading-mark">G</div><div><strong>${t("Собираем документационный центр", "Loading the documentation centre")}</strong><span>${t("Тексты, схемы и актуальный паспорт базы данных", "Content, figures and the live database passport")}</span></div></section>`;
  }

  function renderError(error) {
    return `<section class="method-error"><h1>${t("Методология не загрузилась", "Methodology could not be loaded")}</h1><p>${escapeHtml(error?.message || error)}</p><button type="button" class="method-button method-button-primary" data-method-retry>${t("Повторить", "Retry")}</button></section>`;
  }

  function renderHero() {
    const content = wikiState.content;
    const scale = wikiState.summary.scale;
    return `<header class="method-hero" aria-labelledby="methodWikiTitle">
      <div class="method-hero-copy">
        <div class="method-document-label"><span>${t("Научная документация GIR", "GIR scientific documentation")}</span><span>${escapeHtml(content.edition)}</span></div>
        <h1 id="methodWikiTitle">${t("Как GIR превращает источники в проверяемые выводы", "How GIR turns sources into auditable findings")}</h1>
        <p>${t(
          "Полная методология данных, индексов, авторских моделей и процедур проверки. Страница отделяет официальные значения от расчётов GIR и позволяет пройти от результата к формуле, исходному наблюдению и ограничению интерпретации.",
          "A complete methodology for data, indices, project models and verification. The page separates official values from GIR calculations and lets the reader move from a result to its formula, source observation and interpretation limit."
        )}</p>
        <div class="method-hero-actions">
          <button type="button" class="method-button method-button-primary" data-method-chapter="${escapeHtml(content.default_chapter_key)}">${icon("book")}${t("Начать с резюме", "Start with the summary")}</button>
          <button type="button" class="method-button" data-method-focus-search>${icon("search")}${t("Найти термин", "Find a term")}</button>
          <a class="method-button method-button-quiet" href="${escapeHtml(content.source_markdown)}" download>${icon("download")}Markdown</a>
        </div>
        <dl class="method-document-passport">
          <div><dt>${t("Объём", "Scope")}</dt><dd>${numberFormat(content.word_count)} ${t("слов", "words")}</dd></div>
          <div><dt>${t("Полное чтение", "Full read")}</dt><dd>≈ ${numberFormat(content.reading_minutes)} ${t("мин", "min")}</dd></div>
          <div><dt>${t("Главы", "Chapters")}</dt><dd>${numberFormat(content.chapter_count)}</dd></div>
          <div><dt>${t("Иллюстрации", "Figures")}</dt><dd>${numberFormat(content.figures.length)} × 4</dd></div>
        </dl>
      </div>
      <div class="method-hero-visual">
        <button type="button" class="method-hero-figure" data-method-figure="01_taxonomy.png" aria-label="${t("Увеличить методологическую типологию", "Enlarge the methodological typology")}">
          <img src="${heroFigurePath()}" alt="${escapeHtml(content.figures[0]?.title || "")}" width="1672" height="941" decoding="async">
          <span>${icon("expand")}${t("Открыть схему", "Open figure")}</span>
        </button>
        <div class="method-live-stamp"><span>${t("Текущая база", "Live database")}</span><strong>${numberFormat(scale.database_tables)} ${t("таблиц", "tables")} · ${numberFormat(scale.raw_snapshots)} snapshots</strong><small>${t("Данные подтягиваются из установленной версии проекта", "Values are read from the installed project database")}</small></div>
      </div>
    </header>`;
  }

  function renderPrinciples() {
    return `<section class="method-principles" aria-label="${t("Методологические принципы", "Methodological principles")}">${wikiState.summary.principles.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${escapeHtml(item[`title_${wikiState.lang}`])}</h2><p>${escapeHtml(item[`text_${wikiState.lang}`])}</p></div></article>`).join("")}</section>`;
  }

  function renderScale() {
    const scale = wikiState.summary.scale;
    const metrics = [
      [scale.countries, t("стран и территорий", "countries and territories")],
      [scale.index_scores, t("индексных оценок", "index scores")],
      [scale.component_values, t("компонентных значений", "component values")],
      [scale.source_observations, t("исходных наблюдений", "source observations")],
      [scale.raw_snapshots, t("снимков источников", "source snapshots")],
      [scale.reproducibility_artifacts, t("артефактов воспроизводимости", "reproducibility artifacts")],
    ];
    return `<section class="method-scale" aria-labelledby="methodScaleTitle"><div class="method-section-heading"><div><span>${t("Живой паспорт доказательной базы", "Live evidence-base passport")}</span><h2 id="methodScaleTitle">${t("Текст объясняет метод; база подтверждает масштаб", "The text explains the method; the database confirms the scale")}</h2></div><p>${t(`Архив первичных источников занимает ${humanBytes(scale.raw_archive_bytes)}. Цифры ниже получены из текущей SQLite-базы, а не захардкожены в странице.`, `The source archive occupies ${humanBytes(scale.raw_archive_bytes)}. The figures below are read from the current SQLite database rather than hard-coded in the page.`)}</p></div><div class="method-scale-grid">${metrics.map(([value, label]) => `<div><strong>${numberFormat(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("")}</div></section>`;
  }

  function renderRoutes() {
    return `<section class="method-routes" aria-labelledby="methodRoutesTitle"><div class="method-section-heading"><div><span>${t("Маршруты чтения", "Reading routes")}</span><h2 id="methodRoutesTitle">${t("Одна методология — четыре уровня погружения", "One methodology — four levels of depth")}</h2></div><p>${t("Выберите задачу: система соберёт последовательность глав, но полный документ всегда останется доступен в навигации.", "Choose a task and the system will assemble a chapter sequence; the full document always remains available in navigation.")}</p></div><div class="method-route-grid">${wikiState.content.quick_routes.map((route, index) => `<button type="button" class="method-route" data-method-route="${escapeHtml(route.key)}"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(route.title)}</h3><p>${escapeHtml(route.description)}</p><small>${route.minutes} ${t("мин", "min")} · ${route.chapter_keys.length} ${chapterCountLabel(route.chapter_keys.length)}</small></div>${icon("arrow")}</button>`).join("")}</div></section>`;
  }

  function renderSearch() {
    return `<div class="method-search"><label for="methodSearch">${t("Поиск по методологии", "Search the methodology")}</label><div class="method-search-control">${icon("search")}<input id="methodSearch" type="search" autocomplete="off" value="${escapeHtml(wikiState.searchQuery)}" placeholder="${t("Формула, источник, proxy, API…", "Formula, source, proxy, API…")}" aria-controls="methodSearchResults"><kbd>⌘ K</kbd></div><div id="methodSearchResults" class="method-search-results" ${wikiState.searchOpen ? "" : "hidden"}></div></div>`;
  }

  function renderToc() {
    const content = wikiState.content;
    const groups = content.groups.filter((group) => group.chapter_keys.length);
    return `<aside class="method-local-nav" aria-label="${t("Содержание методологии", "Methodology contents")}">
      ${renderSearch()}
      <div class="method-progress"><div><span>${t("Прогресс главы", "Chapter progress")}</span><strong id="methodProgressLabel">0%</strong></div><div><i id="methodProgressBar"></i></div></div>
      <nav class="method-chapter-nav">${groups.map((group) => {
        const chapters = group.chapter_keys.map((key) => content.chapters.find((chapter) => chapter.key === key)).filter(Boolean);
        const currentInGroup = chapters.some((chapter) => chapter.key === wikiState.chapterKey);
        const technical = group.id === "reference";
        return `<details ${currentInGroup || (!technical && group.id === "start") ? "open" : ""}><summary>${escapeHtml(group.label)}<span>${chapters.length}</span></summary><div>${chapters.map((chapter) => `<button type="button" data-method-chapter="${escapeHtml(chapter.key)}" class="${chapter.key === wikiState.chapterKey ? "is-active" : ""}" ${chapter.key === wikiState.chapterKey ? 'aria-current="page"' : ""}><span>${escapeHtml(chapter.title)}</span><small>${chapter.reading_minutes} ${t("мин", "min")}</small></button>`).join("")}</div></details>`;
      }).join("")}</nav>
      <div class="method-downloads"><span>${t("Исходный документ", "Source document")}</span><a href="${escapeHtml(content.source_markdown)}" download>${icon("file")}Markdown</a>${content.docx_download ? `<a href="${escapeHtml(content.docx_download)}" download>${icon("file")}DOCX</a>` : ""}<button type="button" data-method-copy-link>${icon("link")}${t("Ссылка на главу", "Chapter link")}</button></div>
    </aside>`;
  }

  function routeBar() {
    if (!wikiState.routeKey) return "";
    const route = wikiState.content.quick_routes.find((item) => item.key === wikiState.routeKey);
    if (!route) return "";
    return `<div class="method-route-bar"><div><span>${t("Маршрут", "Route")}</span><strong>${escapeHtml(route.title)}</strong></div><div>${route.chapter_keys.map((key, index) => {
      const chapter = wikiState.content.chapters.find((item) => item.key === key);
      return `<button type="button" data-method-chapter="${escapeHtml(key)}" class="${wikiState.chapterKey === key ? "is-active" : ""}" aria-label="${escapeHtml(chapter?.title || key)}">${index + 1}</button>`;
    }).join("")}</div><button type="button" class="method-route-clear" data-method-clear-route>${t("Весь документ", "Full document")}</button></div>`;
  }

  function readerToolbar() {
    return `<div class="method-reader-toolbar"><div class="method-view-switch" role="group" aria-label="${t("Режим чтения", "Reading mode")}"><button type="button" data-method-view="chapter" aria-pressed="${wikiState.mode === "chapter"}">${t("По главам", "By chapter")}</button><button type="button" data-method-view="continuous" aria-pressed="${wikiState.mode === "continuous"}">${t("Весь документ", "Full document")}</button></div><div><button type="button" class="method-tool-button" data-method-print title="${t("Печать", "Print")}">${icon("print")}<span>${t("Печать", "Print")}</span></button><button type="button" class="method-tool-button" data-method-copy-link title="${t("Скопировать ссылку", "Copy link")}">${icon("link")}<span>${t("Ссылка", "Link")}</span></button></div></div>`;
  }

  function technicalNote(chapter) {
    if (chapter.operational_snapshot) {
      return `<div class="method-technical-note is-operational"><span>${t("Снимок служебного состояния", "Operational snapshot")}</span><p>${t("Упоминания release status, тестовых прогонов, имён файлов и дат в этом разделе относятся к исходной редакции методологического документа. Они не являются живым статусом установленной сборки; актуальная готовность определяется отдельным служебным release-gate.", "Release statuses, test runs, filenames and dates in this section describe the source methodology snapshot. They are not the live status of the installed build; current readiness is determined by the separate operational release gate.")}</p></div>`;
    }
    if (!chapter.technical) return "";
    return `<div class="method-technical-note"><span>${t("Техническое приложение", "Technical appendix")}</span><p>${t("Раздел сохранён для научного и инженерного аудита. Он не используется как рекламный или приёмочный блок публичного интерфейса.", "This section is retained for scientific and engineering audit. It is not used as a promotional or acceptance-status panel in the public interface.")}</p></div>`;
  }

  function chapterArticle(chapter, { continuous = false } = {}) {
    const technicalClass = chapter.technical || chapter.operational_snapshot ? "is-technical" : "";
    return `<article class="method-chapter ${technicalClass}" data-method-chapter-article="${escapeHtml(chapter.key)}" id="method-chapter-${escapeHtml(chapter.key)}"><header class="method-chapter-head"><div><span>${escapeHtml(wikiState.content.groups.find((group) => group.id === chapter.group)?.label || "")}</span><h2>${escapeHtml(chapter.title)}</h2><p>${escapeHtml(chapter.summary)}</p></div><dl><div><dt>${t("Чтение", "Reading")}</dt><dd>${chapter.reading_minutes} ${t("мин", "min")}</dd></div><div><dt>${t("Слов", "Words")}</dt><dd>${numberFormat(chapter.word_count)}</dd></div></dl></header>${technicalNote(chapter)}<div class="method-prose">${chapter.html}</div>${continuous ? "" : chapterPager(chapter)}</article>`;
  }

  function chapterPager(chapter) {
    const chapters = wikiState.content.chapters;
    const index = chapters.findIndex((item) => item.key === chapter.key);
    const previous = chapters[index - 1];
    const next = chapters[index + 1];
    return `<nav class="method-chapter-pager" aria-label="${t("Переход между главами", "Chapter navigation")}">${previous ? `<button type="button" data-method-chapter="${escapeHtml(previous.key)}"><small>${t("Предыдущая глава", "Previous chapter")}</small><strong>← ${escapeHtml(previous.title)}</strong></button>` : "<span></span>"}${next ? `<button type="button" data-method-chapter="${escapeHtml(next.key)}"><small>${t("Следующая глава", "Next chapter")}</small><strong>${escapeHtml(next.title)} →</strong></button>` : "<span></span>"}</nav>`;
  }

  function renderReader() {
    if (wikiState.mode === "continuous") {
      return `<main class="method-reader" id="methodReader">${routeBar()}${readerToolbar()}<div class="method-continuous">${wikiState.content.chapters.map((chapter) => chapterArticle(chapter, { continuous: true })).join("")}</div></main>`;
    }
    return `<main class="method-reader" id="methodReader">${routeBar()}${readerToolbar()}${chapterArticle(activeChapter())}</main>`;
  }

  function findIndexTarget(code) {
    if (code === "HTEI") return { chapter: wikiState.content.roles.htei, anchor: "" };
    const chapter = wikiState.content.roles.passports;
    const entry = wikiState.content.search.find((item) => item.chapter_key === chapter && new RegExp(`(^|[^A-Z])${code.replace("_PLUS", "\\+")}`, "i").test(item.title));
    return { chapter, anchor: entry?.anchor || "" };
  }

  function renderContextRail() {
    const chapter = activeChapter();
    const headings = wikiState.mode === "chapter" ? (chapter?.headings || []).filter((item) => item.level <= 3).slice(1) : [];
    return `<aside class="method-context-rail"><section><div class="method-context-title"><span>${t("В этой главе", "In this chapter")}</span><strong>${headings.length}</strong></div>${headings.length ? `<nav>${headings.map((item) => `<button type="button" data-method-anchor="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`).join("")}</nav>` : `<p>${t("Используйте поиск или навигацию слева для перехода между разделами.", "Use search or the navigation on the left to move between sections.")}</p>`}</section><section><div class="method-context-title"><span>${t("Паспорта индексов", "Index passports")}</span><strong>${wikiState.summary.index_registry.length}</strong></div><div class="method-index-list">${wikiState.summary.index_registry.map((item) => `<button type="button" data-method-index="${escapeHtml(item.code)}"><span class="method-index-code ${escapeHtml(item.classification)}">${escapeHtml(wikiState.lang === "ru" ? item.short_name_ru : item.short_name_en)}</span><span><strong>${escapeHtml(wikiState.lang === "ru" ? item.name_ru : item.name_en)}</strong><small>${escapeHtml(wikiState.lang === "ru" ? item.classification_ru : item.classification_en)}</small></span></button>`).join("")}</div></section><section><button type="button" class="method-atlas-button" data-method-atlas>${icon("image")}<span><strong>${t("Визуальный атлас", "Visual atlas")}</strong><small>${t("9 схем · RU/EN · light/dark", "9 figures · RU/EN · light/dark")}</small></span>${icon("arrow")}</button></section></aside>`;
  }

  function renderWorkspace() {
    return `<section class="method-workspace" id="methodWorkspace">${renderToc()}${renderReader()}${renderContextRail()}</section>`;
  }

  function renderDialogs() {
    return `<dialog class="method-figure-dialog" id="methodFigureDialog" aria-labelledby="methodFigureTitle"><div class="method-dialog-head"><div><span>${t("Методологическая схема", "Methodology figure")}</span><h2 id="methodFigureTitle"></h2></div><button type="button" data-method-dialog-close aria-label="${t("Закрыть", "Close")}">${icon("close")}</button></div><div id="methodFigureContent" class="method-dialog-content"></div></dialog><div class="method-toast" id="methodToast" role="status" aria-live="polite"></div>`;
  }

  function renderFullPage() {
    return `<div class="methodology-wiki">${renderHero()}${renderPrinciples()}${renderScale()}${renderRoutes()}${renderWorkspace()}${renderDialogs()}</div>`;
  }

  function renderSearchResults() {
    const results = document.querySelector("#methodSearchResults");
    if (!results) return;
    const query = wikiState.searchQuery.trim().toLowerCase();
    if (query.length < 2) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }
    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = wikiState.content.search.map((entry) => {
      const haystack = `${entry.title} ${entry.text}`.toLowerCase();
      const score = tokens.reduce((total, token) => total + (entry.title.toLowerCase().includes(token) ? 5 : 0) + (haystack.includes(token) ? 1 : -20), 0);
      return { entry, score };
    }).filter((item) => item.score >= tokens.length).sort((a, b) => b.score - a.score).slice(0, 12);
    results.hidden = false;
    if (!matches.length) {
      results.innerHTML = `<div class="method-search-empty">${t("Совпадений не найдено", "No matches found")}</div>`;
      return;
    }
    results.innerHTML = matches.map(({ entry }) => {
      const snippet = entry.text.length > 180 ? `${entry.text.slice(0, 180)}…` : entry.text;
      return `<button type="button" data-method-search-result="${escapeHtml(entry.chapter_key)}" data-method-search-anchor="${escapeHtml(entry.anchor)}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(snippet)}</span></button>`;
    }).join("");
    results.querySelectorAll("[data-method-search-result]").forEach((button) => button.addEventListener("click", () => {
      selectChapter(button.dataset.methodSearchResult, { anchor: button.dataset.methodSearchAnchor, push: true });
      wikiState.searchOpen = false;
      results.hidden = true;
    }));
  }

  function toast(message) {
    const node = document.querySelector("#methodToast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove("is-visible"), 2600);
  }

  function applyFigureTheme(root = document) {
    root.querySelectorAll("[data-method-figure-image]").forEach((image) => {
      image.src = heroFigurePath(image.dataset.methodFigureImage);
    });
    root.querySelectorAll(".method-hero-figure img").forEach((image) => { image.src = heroFigurePath(); });
  }

  function openFigure(filename, trigger = null, gallery = false) {
    const dialog = document.querySelector("#methodFigureDialog");
    const content = document.querySelector("#methodFigureContent");
    const title = document.querySelector("#methodFigureTitle");
    if (!dialog || !content || !title) return;
    wikiState.lastFigureTrigger = trigger || document.activeElement;
    if (gallery) {
      title.textContent = t("Визуальный атлас методологии", "Methodology visual atlas");
      content.innerHTML = `<div class="method-atlas-grid">${wikiState.content.figures.map((figure) => `<button type="button" data-method-atlas-figure="${escapeHtml(figure.file)}"><img src="${escapeHtml(figure.paths[wikiState.theme])}" alt="${escapeHtml(figure.title)}" width="1672" height="941" loading="lazy"><span>${escapeHtml(figure.title)}</span></button>`).join("")}</div>`;
      content.querySelectorAll("[data-method-atlas-figure]").forEach((button) => button.addEventListener("click", () => openFigure(button.dataset.methodAtlasFigure, button)));
    } else {
      const figure = wikiState.content.figures.find((item) => item.file === filename);
      title.textContent = figure?.title || filename;
      content.innerHTML = `<figure class="method-dialog-figure"><img src="${heroFigurePath(filename)}" alt="${escapeHtml(figure?.title || filename)}" width="1672" height="941"><figcaption>${escapeHtml(figure?.title || filename)}</figcaption></figure>`;
    }
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-method-dialog-close]")?.focus();
  }

  function closeFigureDialog() {
    const dialog = document.querySelector("#methodFigureDialog");
    if (dialog?.open) dialog.close();
    wikiState.lastFigureTrigger?.focus?.();
    wikiState.lastFigureTrigger = null;
  }

  function scrollToAnchor(anchor, { smooth = true } = {}) {
    if (!anchor) {
      document.querySelector("#methodWorkspace")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      return;
    }
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      window.setTimeout(() => target.focus({ preventScroll: true }), smooth ? 420 : 0);
    }
  }

  function selectChapter(key, { anchor = "", push = true, routeKey = null } = {}) {
    const chapter = wikiState.content.chapters.find((item) => item.key === key);
    if (!chapter) return;
    wikiState.chapterKey = chapter.key;
    wikiState.anchor = anchor;
    if (routeKey !== null) wikiState.routeKey = routeKey;
    if (wikiState.mode === "continuous") {
      updateUrl({ push, section: anchor });
      scrollToAnchor(anchor || `method-chapter-${chapter.key}`);
      return;
    }
    updateUrl({ push, section: anchor });
    renderWorkspaceOnly();
    window.requestAnimationFrame(() => scrollToAnchor(anchor, { smooth: true }));
  }

  function setMode(mode) {
    wikiState.mode = mode === "continuous" ? "continuous" : "chapter";
    updateUrl({ push: true });
    renderWorkspaceOnly();
    document.querySelector("#methodWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderWorkspaceOnly() {
    observer?.disconnect();
    const workspace = document.querySelector("#methodWorkspace");
    if (!workspace) return;
    workspace.outerHTML = renderWorkspace();
    bindWorkspace();
    applyFigureTheme(document);
    startProgressTracking();
  }

  function startProgressTracking() {
    observer?.disconnect();
    const progress = () => {
      const reader = document.querySelector("#methodReader");
      const label = document.querySelector("#methodProgressLabel");
      const bar = document.querySelector("#methodProgressBar");
      if (!reader || !label || !bar) return;
      const rect = reader.getBoundingClientRect();
      const total = Math.max(1, reader.offsetHeight - window.innerHeight * 0.45);
      const passed = Math.min(total, Math.max(0, -rect.top + 150));
      const percent = Math.round(passed / total * 100);
      label.textContent = `${percent}%`;
      bar.style.width = `${percent}%`;
    };
    window.removeEventListener("scroll", startProgressTracking.progressHandler);
    startProgressTracking.progressHandler = progress;
    window.addEventListener("scroll", progress, { passive: true });
    progress();
    if (wikiState.mode === "continuous" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        const key = visible.target.dataset.methodChapterArticle;
        if (key && key !== wikiState.chapterKey) {
          wikiState.chapterKey = key;
          updateUrl({ push: false });
          document.querySelectorAll(".method-chapter-nav button").forEach((button) => {
            const active = button.dataset.methodChapter === key;
            button.classList.toggle("is-active", active);
            if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
          });
        }
      }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
      document.querySelectorAll("[data-method-chapter-article]").forEach((article) => observer.observe(article));
    }
  }

  function enhanceScrollableTables(root = document) {
    root.querySelectorAll(".method-table-scroll").forEach((region, index) => {
      region.tabIndex = 0;
      region.setAttribute("role", "region");
      region.setAttribute("aria-label", t(`Таблица методологии ${index + 1}. Используйте горизонтальную прокрутку для просмотра всех столбцов.`, `Methodology table ${index + 1}. Scroll horizontally to view every column.`));
    });
  }

  function bindWorkspace() {
    enhanceScrollableTables(document);
    document.querySelectorAll("[data-method-chapter]").forEach((button) => button.addEventListener("click", () => selectChapter(button.dataset.methodChapter, { push: true })));
    document.querySelectorAll("[data-method-anchor]").forEach((button) => button.addEventListener("click", (event) => {
      event.preventDefault();
      const anchor = button.dataset.methodAnchor;
      updateUrl({ push: true, section: anchor });
      scrollToAnchor(anchor);
    }));
    document.querySelectorAll("[data-method-view]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.methodView)));
    document.querySelectorAll("[data-method-copy-link]").forEach((button) => button.addEventListener("click", async () => {
      updateUrl({ push: false, section: wikiState.anchor });
      try {
        await navigator.clipboard.writeText(location.href);
        toast(t("Ссылка на раздел скопирована", "Section link copied"));
      } catch {
        toast(location.href);
      }
    }));
    document.querySelectorAll("[data-method-print]").forEach((button) => button.addEventListener("click", () => window.print()));
    document.querySelectorAll("[data-method-index]").forEach((button) => button.addEventListener("click", () => {
      const target = findIndexTarget(button.dataset.methodIndex);
      selectChapter(target.chapter, { anchor: target.anchor, push: true });
    }));
    document.querySelectorAll("[data-method-figure]").forEach((button) => button.addEventListener("click", () => openFigure(button.dataset.methodFigure, button)));
    document.querySelector("[data-method-atlas]")?.addEventListener("click", (event) => openFigure("", event.currentTarget, true));
    document.querySelector("[data-method-clear-route]")?.addEventListener("click", () => {
      wikiState.routeKey = "";
      renderWorkspaceOnly();
    });
    bindSearch();
  }

  function bindSearch() {
    const search = document.querySelector("#methodSearch");
    if (!search) return;
    search.addEventListener("input", () => {
      wikiState.searchQuery = search.value;
      wikiState.searchOpen = true;
      renderSearchResults();
    });
    search.addEventListener("focus", () => {
      if (wikiState.searchQuery.trim().length >= 2) {
        wikiState.searchOpen = true;
        renderSearchResults();
      }
    });
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        wikiState.searchQuery = "";
        search.value = "";
        wikiState.searchOpen = false;
        renderSearchResults();
      }
    });
    renderSearchResults();
  }

  function bindGlobalPage() {
    document.querySelectorAll("[data-method-route]").forEach((button) => button.addEventListener("click", () => {
      const route = wikiState.content.quick_routes.find((item) => item.key === button.dataset.methodRoute);
      if (!route?.chapter_keys.length) return;
      wikiState.routeKey = route.key;
      wikiState.mode = "chapter";
      selectChapter(route.chapter_keys[0], { routeKey: route.key, push: true });
    }));
    document.querySelectorAll("[data-method-focus-search]").forEach((button) => button.addEventListener("click", () => {
      document.querySelector("#methodWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => document.querySelector("#methodSearch")?.focus(), 350);
    }));
    document.querySelectorAll("[data-method-figure]").forEach((button) => button.addEventListener("click", () => openFigure(button.dataset.methodFigure, button)));
    document.querySelector("[data-method-dialog-close]")?.addEventListener("click", closeFigureDialog);
    const dialog = document.querySelector("#methodFigureDialog");
    dialog?.addEventListener("cancel", (event) => { event.preventDefault(); closeFigureDialog(); });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) closeFigureDialog();
    });
    dialog?.addEventListener("keydown", (event) => {
      if (event.key !== "Tab" || !dialog.open) return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
        .filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.querySelector("[data-method-retry]")?.addEventListener("click", () => render({ lang: wikiState.lang, theme: wikiState.theme, force: true }));
    bindWorkspace();
    if (!popstateBound) {
      popstateBound = true;
      window.addEventListener("popstate", () => {
        if (location.hash !== "#methodology" || !wikiState.content) return;
        parseLocation(wikiState.content);
        renderWorkspaceOnly();
        window.requestAnimationFrame(() => scrollToAnchor(wikiState.anchor, { smooth: false }));
      });
      document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && document.documentElement.dataset.page === "methodology") {
          event.preventDefault();
          document.querySelector("#methodSearch")?.focus();
        }
      });
    }
    startProgressTracking();
  }

  async function render({ lang = "ru", theme = "dark", force = false } = {}) {
    const view = document.querySelector("#view");
    if (!view) return;
    const token = ++renderToken;
    wikiState.lang = lang === "en" ? "en" : "ru";
    wikiState.theme = theme === "light" ? "light" : "dark";
    if (force) {
      cache.delete(wikiState.lang);
      summaryPromise = null;
    }
    view.classList.add("methodology-view");
    view.innerHTML = renderLoading();
    try {
      const [content, summary] = await Promise.all([loadContent(wikiState.lang), loadSummary()]);
      if (token !== renderToken) return;
      wikiState.content = content;
      wikiState.summary = summary;
      parseLocation(content);
      view.innerHTML = renderFullPage();
      applyFigureTheme(view);
      bindGlobalPage();
      updateUrl({ push: false, section: wikiState.anchor });
      if (wikiState.anchor) window.requestAnimationFrame(() => scrollToAnchor(wikiState.anchor, { smooth: false }));
      window.dispatchEvent(new CustomEvent("gir:methodology-ready", { detail: { lang: wikiState.lang, theme: wikiState.theme, chapter: wikiState.chapterKey } }));
    } catch (error) {
      if (token !== renderToken) return;
      view.innerHTML = renderError(error);
      bindGlobalPage();
      console.error("Methodology wiki failed", error);
    }
  }

  window.GIRMethodology = { render, applyFigureTheme };
})();
