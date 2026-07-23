(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const csv = (value) => [...new Set(String(value || '').split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))];
  const number = (value, digits = 1) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat(state.lang === 'ru' ? 'ru-RU' : 'en-US', {maximumFractionDigits: digits, minimumFractionDigits: 0}).format(n);
  };
  const integer = (value) => number(value, 0);
  const shortNumber = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat(state.lang === 'ru' ? 'ru-RU' : 'en-US', {notation: 'compact', maximumFractionDigits: 1}).format(n);
  };

  const PORTFOLIO_SCHEMA = 'gir-data-explorer-portfolio-v2';
  const DETAIL_SCHEMA = 'gir-data-explorer-v3';

  const TEXT = {
    ru: {
      workspace: 'Исследовательское пространство', explorerTitle: 'Обозреватель данных', platform: 'Платформа', dataLab: 'Лаборатория данных', copyLink: 'Скопировать ссылку', exportCsv: 'Скачать CSV', connected: 'Подключено к рабочей SQLite',
      portfolioMode: 'Портфель 44', detailMode: 'Детальные данные', parameters: 'Параметры выборки', portfolioCopy: 'Выберите модули, страны и аналитическое представление.', detailCopy: 'Выберите набор, показатель, период и измерения.',
      heroKicker: 'GIR · ОБОЗРЕВАТЕЛЬ ДАННЫХ', heroTitle: 'От глобального портфеля — к отдельному наблюдению', heroCopy: 'Соберите воспроизводимую выборку из 44 индексных модулей или раскройте результат до компонентов, исходных рядов и доказательной цепочки.',
      portfolioHero: '44 модуля сохраняют собственные шкалы. Общий процентиль используется только как навигационная шкала и не создаёт нового сводного индекса.', detailHero: 'Детальный слой объединяет компоненты, официальные показатели и исходные наблюдения. Каждая строка сохраняет источник, единицу, год и происхождение данных.',
      modules: 'Модули', groups: 'Направления', countries: 'Страны и территории', datasets: 'Детальные наборы', rows: 'Доступные строки', published: 'Опубликовано', sourceGated: 'Ожидает источник',
      presets: 'Готовые выборки', modulesLabel: 'Индексные модули', countriesLabel: 'Страны', addModule: 'Добавить модуль', addCountry: 'Добавить страну', year: 'Срез', hteiMode: 'Режим Индекса занятости в высокотехнологичных отраслях',
      matrix: 'Матрица', distribution: 'Распределение', scatter: 'Связи', trend: 'Динамика', table: 'Таблица', chart: 'График',
      matrixTitle: 'Исходные значения и международные позиции', matrixCopy: 'Цвет кодирует благоприятный международный процентиль; точное значение остаётся в собственной шкале.',
      distributionTitle: 'Положение в международном распределении', distributionCopy: 'Выбранные страны выделены, остальные формируют контекст всей доступной вселенной.',
      scatterTitle: 'Совместное распределение двух модулей', scatterCopy: 'Связь рассчитывается только по совместным наблюдениям и не интерпретируется как причинность.',
      trendTitle: 'Сопоставимая временная динамика', trendCopy: 'Несопоставимые редакции и диагностические режимы не соединяются одной линией.',
      tableTitle: 'Длинная таблица текущей выборки', tableCopy: 'Таблица пригодна для проверки точных значений, статусов, лет и источников.',
      sourceGatedTitle: 'Числовой выпуск ещё не установлен', sourceGatedCopy: 'Методика, схема, импортёр и аналитическая страница готовы. Обозреватель данных не создаёт демонстрационные значения вместо официального пакета.',
      datasetCatalog: 'Каталог наборов', searchDatasets: 'Найти набор или модуль', measure: 'Показатель', xMeasure: 'Показатель X', yMeasure: 'Показатель Y', period: 'Период', from: 'с', to: 'по', view: 'Представление', all: 'Все', noData: 'Нет наблюдений для выбранных фильтров', loading: 'Формируется исследовательская выборка…',
      selected: 'Выбрано', coverage: 'Покрытие', sources: 'Источники', years: 'Годы', observations: 'Наблюдения', countriesCount: 'Стран', seriesCount: 'Серий', mean: 'Среднее', minMax: 'Диапазон',
      status: 'Состояние', score: 'Оценка', unit: 'Единица', rank: 'Место', percentile: 'Процентиль', series: 'Серия', quality: 'Качество',
      valueId: 'Идентификатор значения', dataset: 'Набор данных', tableLabel: 'Таблица', source: 'Источник', owner: 'Владелец', snapshot: 'Снимок', transform: 'Преобразование', formula: 'Формула', officialSource: 'Официальный источник',
      nativeUnits: 'Исходные единицы сохранены', noComposite: 'Новый сводный индекс не создаётся', rowProvenance: 'Открыть происхождение значения', metadata: 'Метаданные JSON', openModule: 'Открыть страницу модуля',
      statusAvailable: 'Есть данные', statusGated: 'Ожидает источник', statusMissing: 'Нет наблюдения', official: 'официальный', derived: 'производный',
      resultCount: 'результатов', correlation: 'ρ Спирмена', jointN: 'совместных наблюдений', selectAtLeastTwo: 'Выберите не менее двух опубликованных модулей.', selectCountries: 'Добавьте хотя бы одну страну.',
      provenance: 'Происхождение значения', close: 'Закрыть', copied: 'Ссылка скопирована', copyFailed: 'Не удалось скопировать ссылку', apiError: 'Не удалось получить данные',
      line: 'Линии', bars: 'Столбцы', histogram: 'Распределение', scatterChart: 'Диаграмма рассеяния',
      allGroups: 'Все направления', allDatasets: 'Все наборы', reset: 'Сбросить', query: 'Построить', mobileControls: 'Параметры', portfolioIntro: 'Единый срез портфеля', detailIntro: 'Углубление до исходных рядов',
      qsKicker: 'Аналитика QS', qsTitle: 'Рейтинговая экосистема QS', qsCopy: 'Мировой рейтинг университетов (WUR), дисциплины, рейтинг устойчивого развития, региональные и профессиональные проекты сохраняются как самостоятельные продукты. Общий супериндекс QS не создаётся.', qsProjects: 'проектов', qsLoaded: 'с числовыми данными', qsSubjects: 'дисциплин', qsEntities: 'университетов',
    },
    en: {
      workspace: 'Research workspace', explorerTitle: 'Data Explorer', platform: 'Platform', dataLab: 'Data Lab', copyLink: 'Copy link', exportCsv: 'Download CSV', connected: 'Connected to the working SQLite',
      portfolioMode: 'Portfolio 44', detailMode: 'Detailed data', parameters: 'Selection parameters', portfolioCopy: 'Choose modules, countries and an analytical view.', detailCopy: 'Choose a dataset, measure, period and dimensions.',
      heroKicker: 'GIR DATA EXPLORER', heroTitle: 'From the global portfolio to a single observation', heroCopy: 'Build a reproducible selection across 44 index modules or drill down to components, source series and the evidence chain.',
      portfolioHero: 'All 44 modules retain their native scales. A common percentile is used only for navigation and never creates a new composite index.', detailHero: 'The detailed layer brings together components, official indicators and source observations. Every row retains its source, unit, year and provenance.',
      modules: 'Modules', groups: 'Themes', countries: 'Countries & territories', datasets: 'Detailed datasets', rows: 'Available rows', published: 'Published', sourceGated: 'Source-gated',
      presets: 'Selection presets', modulesLabel: 'Index modules', countriesLabel: 'Countries', addModule: 'Add module', addCountry: 'Add country', year: 'Reference year', hteiMode: 'HTEI mode',
      matrix: 'Matrix', distribution: 'Distribution', scatter: 'Relationships', trend: 'Trend', table: 'Table', chart: 'Chart',
      matrixTitle: 'Native values and international positions', matrixCopy: 'Colour encodes the favourable international percentile; the exact value remains in its native scale.',
      distributionTitle: 'Position in the international distribution', distributionCopy: 'Selected countries are highlighted while all available countries provide context.',
      scatterTitle: 'Joint distribution of two modules', scatterCopy: 'Association is calculated from joint observations only and must not be read as causation.',
      trendTitle: 'Comparable change over time', trendCopy: 'Methodologically incompatible editions and diagnostic modes are never connected by one line.',
      tableTitle: 'Long table for the current selection', tableCopy: 'The table exposes exact values, statuses, years and sources for verification.',
      sourceGatedTitle: 'The numerical release has not been installed', sourceGatedCopy: 'The methodology, schema, importer and analytical page are ready. Data Explorer never invents demonstration values in place of an official package.',
      datasetCatalog: 'Dataset catalogue', searchDatasets: 'Find a dataset or module', measure: 'Measure', xMeasure: 'X measure', yMeasure: 'Y measure', period: 'Period', from: 'from', to: 'to', view: 'View', all: 'All', noData: 'No observations match the selected filters', loading: 'Building the research selection…',
      selected: 'Selected', coverage: 'Coverage', sources: 'Sources', years: 'Years', observations: 'Observations', countriesCount: 'Countries', seriesCount: 'Series', mean: 'Mean', minMax: 'Range',
      status: 'Status', score: 'Score', unit: 'Unit', rank: 'Rank', percentile: 'Percentile', series: 'Series', quality: 'Quality',
      valueId: 'Value ID', dataset: 'Dataset', tableLabel: 'Table', source: 'Source', owner: 'Owner', snapshot: 'Snapshot', transform: 'Transform', formula: 'Formula', officialSource: 'Official source',
      nativeUnits: 'Native units retained', noComposite: 'No new composite index', rowProvenance: 'Open value provenance', metadata: 'Metadata JSON', openModule: 'Open module workspace',
      statusAvailable: 'Data available', statusGated: 'Source-gated', statusMissing: 'No observation', official: 'official', derived: 'derived',
      resultCount: 'results', correlation: 'Spearman ρ', jointN: 'joint observations', selectAtLeastTwo: 'Select at least two published modules.', selectCountries: 'Add at least one country.',
      provenance: 'Value provenance', close: 'Close', copied: 'Link copied', copyFailed: 'Could not copy the link', apiError: 'Could not retrieve data',
      line: 'Lines', bars: 'Bars', histogram: 'Distribution', scatterChart: 'Scatterplot',
      allGroups: 'All themes', allDatasets: 'All datasets', reset: 'Reset', query: 'Build view', mobileControls: 'Controls', portfolioIntro: 'Unified portfolio slice', detailIntro: 'Drill down to source series',
      qsKicker: 'QS Intelligence', qsTitle: 'QS ranking ecosystem', qsCopy: 'WUR, subjects, Sustainability, regional and professional projects remain separate products. GIR never creates a single QS super-index.', qsProjects: 'projects', qsLoaded: 'with numerical data', qsSubjects: 'subjects', qsEntities: 'universities',
    },
  };

  const initialUserContext = window.GIRUserContext?.snapshot?.() || {language: document.documentElement.lang, country: null};
  const initialCountry = initialUserContext.country || null;
  const state = {
    lang: initialUserContext.language === 'ru' ? 'ru' : 'en',
    theme: localStorage.getItem('theme') === 'light' ? 'light' : 'dark',
    mode: 'portfolio',
    view: 'matrix',
    year: 2026,
    hteiMode: 'proxy_extended',
    modules: ['HTEI', 'HDI', 'HCI_PLUS', 'NRI', 'CPI', 'GPI'],
    countries: initialCountry ? [initialCountry] : [],
    universe: 'ALL',
    catalogue: null,
    schema: null,
    portfolioPayload: null,
    portfolioViewPayload: null,
    dataset: '',
    datasetGroup: 'all',
    datasetSearch: '',
    measure: '',
    xMeasure: '',
    detailCountries: initialCountry ? [initialCountry] : [],
    yearFrom: null,
    yearTo: null,
    dimensions: {},
    detailView: 'line',
    detailPayload: null,
    loading: true,
    error: '',
    requestToken: 0,
    lastFocus: null,
  };

  const t = (key) => TEXT[state.lang][key] || key;
  const localeText = (item, base) => item?.[`${base}_${state.lang}`] ?? item?.[`${base}_en`] ?? item?.[`${base}_ru`] ?? '';
  const moduleName = (item) => localeText(item, 'name') || item?.short_name || item?.code || '';
  const groupName = (item) => localeText(item, 'label') || localeText(item, 'group_label') || item?.key || item?.group || '';
  const countryName = (item) => localeText(item, 'name') || item?.iso3 || '';
  const datasetTitle = (item) => localeText(item, 'title') || item?.id || '';
  const datasetDescription = (item) => localeText(item, 'description');
  const measureLabel = (item) => localeText(item, 'label') || item?.code || '';

  function parseUrl() {
    const params = new URLSearchParams(location.search);
    state.mode = params.get('mode') === 'detail' ? 'detail' : 'portfolio';
    const allowedViews = new Set(['matrix', 'distribution', 'scatter', 'trend', 'table']);
    const view = params.get('view');
    if (allowedViews.has(view)) state.view = view;
    state.year = clamp(Number(params.get('year') || 2026), 1990, 2100);
    state.hteiMode = params.get('htei') || 'proxy_extended';
    const modules = csv(params.get('modules'));
    if (modules.length) state.modules = modules.slice(0, 12);
    const countries = csv(params.get('countries'));
    if (countries.length) state.countries = countries.slice(0, 12);
    state.universe = params.get('universe') || 'ALL';
    state.dataset = params.get('dataset') || '';
    state.datasetGroup = params.get('group') || 'all';
    state.measure = params.get('measure') || '';
    state.xMeasure = params.get('x_measure') || '';
    const detailCountries = csv(params.get('detail_countries'));
    if (detailCountries.length) state.detailCountries = detailCountries.slice(0, 12);
    state.yearFrom = params.get('year_from') ? Number(params.get('year_from')) : null;
    state.yearTo = params.get('year_to') ? Number(params.get('year_to')) : null;
    state.detailView = ['line', 'bar', 'scatter', 'histogram', 'table'].includes(params.get('detail_view')) ? params.get('detail_view') : 'line';
    for (const [key, value] of params) if (key.startsWith('dim_') && value) state.dimensions[key.slice(4)] = value;
  }

  function syncUrl() {
    const p = new URLSearchParams();
    p.set('mode', state.mode);
    if (state.mode === 'portfolio') {
      p.set('view', state.view);
      p.set('year', String(state.year));
      p.set('htei', state.hteiMode);
      p.set('modules', state.modules.join(','));
      p.set('countries', state.countries.join(','));
      if (state.universe !== 'ALL') p.set('universe', state.universe);
    } else {
      if (state.dataset) p.set('dataset', state.dataset);
      if (state.datasetGroup !== 'all') p.set('group', state.datasetGroup);
      if (state.measure) p.set('measure', state.measure);
      if (state.xMeasure) p.set('x_measure', state.xMeasure);
      p.set('detail_countries', state.detailCountries.join(','));
      if (state.yearFrom != null) p.set('year_from', String(state.yearFrom));
      if (state.yearTo != null) p.set('year_to', String(state.yearTo));
      p.set('detail_view', state.detailView);
      Object.entries(state.dimensions).forEach(([key, value]) => { if (value) p.set(`dim_${key}`, value); });
    }
    history.replaceState(null, '', `${location.pathname}?${p}`);
    updateExportLink();
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {headers: {'Accept': 'application/json'}, ...options});
    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`;
      try { const body = await response.json(); detail = body.detail?.message_ru || body.detail?.message_en || body.detail || detail; } catch (_) { /* no body */ }
      const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async function init() {
    applyTheme();
    applyLanguage();
    if (window.GIRUserContext?.ready) {
      const context = await window.GIRUserContext.ready;
      state.lang = context.language;
      const query = new URLSearchParams(location.search);
      if (context.country && !query.has('countries')) state.countries = [context.country];
      if (context.country && !query.has('detail_countries')) state.detailCountries = [context.country];
    }
    parseUrl();
    applyTheme();
    applyLanguage();
    try {
      const [catalogue, schema] = await Promise.all([
        fetchJson(`/api/data-explorer/portfolio/catalog?year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}`),
        fetchJson('/api/data-explorer/schema'),
      ]);
      if (catalogue.schema_version !== PORTFOLIO_SCHEMA) throw new Error(`Unsupported portfolio schema: ${catalogue.schema_version}`);
      if (schema.schema_version !== DETAIL_SCHEMA) throw new Error(`Unsupported detail schema: ${schema.schema_version}`);
      state.catalogue = catalogue;
      state.schema = schema;
      normaliseDefaults();
      state.loading = false;
      render();
      await loadActiveView();
    } catch (error) {
      state.loading = false;
      state.error = String(error.message || error);
      render();
    }
  }

  function normaliseDefaults() {
    const moduleCodes = new Set(state.catalogue.modules.map((item) => item.code));
    state.modules = state.modules.filter((code) => moduleCodes.has(code)).slice(0, 12);
    if (!state.modules.length) state.modules = ['HTEI', 'HDI', 'HCI_PLUS', 'NRI', 'CPI', 'GPI'].filter((code) => moduleCodes.has(code));
    const countryCodes = new Set(state.catalogue.countries.map((item) => item.iso3));
    state.countries = state.countries.filter((code) => countryCodes.has(code)).slice(0, 12);
    if (!state.countries.length && initialCountry && countryCodes.has(initialCountry)) state.countries = [initialCountry];
    state.detailCountries = state.detailCountries.filter((code) => countryCodes.has(code)).slice(0, 12);
    const datasets = state.schema.datasets;
    if (!state.dataset || !datasets.some((item) => item.id === state.dataset)) {
      state.dataset = datasets.find((item) => item.id === 'htei_v6_component_values')?.id || datasets.find((item) => item.queryable)?.id || datasets[0]?.id || '';
    }
    initialiseDatasetState(true);
  }

  function selectedDataset() { return state.schema?.datasets?.find((item) => item.id === state.dataset) || null; }
  function selectedModules() { return state.modules.map((code) => state.catalogue.modules.find((item) => item.code === code)).filter(Boolean); }
  function selectedCountries() { return state.countries.map((code) => state.catalogue.countries.find((item) => item.iso3 === code)).filter(Boolean); }

  function initialiseDatasetState(preserveUrl = false) {
    const dataset = selectedDataset();
    if (!dataset) return;
    const measures = dataset.measures || [];
    if (!measures.some((item) => item.code === state.measure)) state.measure = dataset.default?.measure || measures[0]?.code || '';
    if (!measures.some((item) => item.code === state.xMeasure)) state.xMeasure = measures.find((item) => item.code !== state.measure)?.code || measures[0]?.code || '';
    if (!preserveUrl) state.detailCountries = csv(dataset.default?.countries || '').slice(0, 12);
    if (!preserveUrl || state.yearFrom == null) state.yearFrom = dataset.year_min ?? null;
    if (!preserveUrl || state.yearTo == null) state.yearTo = dataset.year_max ?? null;
    const allowed = new Set((dataset.dimensions || []).map((item) => item.code));
    Object.keys(state.dimensions).forEach((key) => { if (!allowed.has(key)) delete state.dimensions[key]; });
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem('theme', state.theme);
    const button = $('#dx-theme');
    if (button) {
      const label = state.theme === 'dark' ? (state.lang === 'ru' ? 'Включить светлую тему' : 'Use light theme') : (state.lang === 'ru' ? 'Включить тёмную тему' : 'Use dark theme');
      button.title = label; button.setAttribute('aria-label', label);
    }
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    window.GIRAuth?.updateLocale?.(state.lang);
    const button = $('#dx-lang');
    if (button) {
      button.textContent = state.lang === 'ru' ? 'EN' : 'RU';
      button.setAttribute('aria-label', state.lang === 'ru' ? 'Переключить язык' : 'Switch language');
    }
    $('.dx-brand')?.setAttribute('aria-label', state.lang === 'ru' ? 'Глобальная платформа индексных исследований — главная' : 'Global Index Research — home');
    $$('[data-i18n]').forEach((node) => { const key = node.dataset.i18n; if (TEXT[state.lang][key]) node.textContent = TEXT[state.lang][key]; });
    document.title = state.lang === 'ru' ? 'Обозреватель данных · Глобальная платформа индексных исследований' : 'Data Explorer · Global Index Research';
  }

  function statusLabel(status) {
    return status === 'available' || status === 'published' ? t('statusAvailable') : status === 'source_gated' ? t('statusGated') : t('statusMissing');
  }

  function statusClass(status) {
    return status === 'available' || status === 'published' ? 'available' : status === 'source_gated' ? 'source_gated' : 'no_country_data';
  }

  function render() {
    applyLanguage();
    applyTheme();
    renderHeaderState();
    const app = $('#dx-app');
    if (!app) return;
    if (state.loading) { app.className = 'dx-loading'; app.innerHTML = `<div class="dx-loading-mark">G</div><p>${esc(t('loading'))}</p>`; return; }
    if (state.error) { app.className = 'dx-page'; app.innerHTML = `<div class="dx-content"><div class="dx-error"><strong>${esc(t('apiError'))}</strong><p>${esc(state.error)}</p></div></div>`; return; }
    app.className = 'dx-page';
    app.innerHTML = `${hero()}<div class="dx-content">${viewTabs()}<section class="dx-analysis">${analysisHeader()}${summaryCards()}<div id="dx-workspace">${loadingWorkspace()}</div></section></div>`;
    renderControls();
    bindPage();
    syncUrl();
  }

  function renderHeaderState() {
    $$('.dx-mode').forEach((button) => {
      const active = button.dataset.mode === state.mode;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const title = $('#dx-side-title'); const copy = $('#dx-side-copy');
    if (title) title.textContent = t('parameters');
    if (copy) copy.textContent = state.mode === 'portfolio' ? t('portfolioCopy') : t('detailCopy');
  }

  function hero() {
    const portfolio = state.catalogue.summary;
    const detail = state.schema.summary;
    const proof = state.mode === 'portfolio'
      ? [
          [portfolio.module_count, t('modules'), `${portfolio.numeric_module_count} ${t('published').toLowerCase()}`],
          [portfolio.group_count, t('groups'), `${portfolio.source_gated_module_count} ${t('sourceGated').toLowerCase()}`],
          [portfolio.countries_with_data, t('countries'), `${integer(portfolio.available_country_cells)} cells`],
          [`${portfolio.year_min}–${portfolio.year_max}`, t('years'), t('nativeUnits')],
        ]
      : [
          [detail.dataset_count, t('datasets'), `${detail.published_dataset_count} ${t('published').toLowerCase()}`],
          [detail.group_count, t('groups'), `${detail.source_gated_dataset_count} ${t('sourceGated').toLowerCase()}`],
          [detail.country_count, t('countries'), `${shortNumber(detail.row_count)} ${t('rows').toLowerCase()}`],
          [detail.portfolio_module_count, t('modules'), t('noComposite')],
        ];
    return `<section class="dx-hero"><div class="dx-hero-grid"><div><p class="dx-kicker">${esc(t('heroKicker'))}</p><h1>${esc(t('heroTitle'))}</h1><p>${esc(t('heroCopy'))}</p><div class="dx-hero-actions"><button type="button" class="dx-button primary" data-mode-jump="portfolio">${esc(t('portfolioMode'))}</button><button type="button" class="dx-button ghost" data-mode-jump="detail">${esc(t('detailMode'))}</button></div></div><div class="dx-hero-proof">${proof.map(([value, label, note]) => `<article class="dx-proof"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join('')}</div></div></section>`;
  }

  function viewTabs() {
    const views = state.mode === 'portfolio'
      ? [['matrix','matrix'],['distribution','distribution'],['scatter','scatter'],['trend','trend'],['table','table']]
      : [['line','line'],['bar','bars'],['scatter','scatterChart'],['histogram','histogram'],['table','table']];
    const current = state.mode === 'portfolio' ? state.view : state.detailView;
    return `<div class="dx-view-tabs" role="tablist" aria-label="${esc(t('view'))}">${views.map(([id,key]) => `<button type="button" class="dx-view-tab" role="tab" aria-selected="${current === id}" data-view="${id}">${esc(t(key))}</button>`).join('')}</div>`;
  }

  function analysisHeader() {
    return `<div class="dx-section-head"><div><p class="dx-kicker">${esc(state.mode === 'portfolio' ? t('portfolioIntro') : t('detailIntro'))}</p><h2>${esc(state.mode === 'portfolio' ? t('portfolioMode') : t('detailMode'))}</h2></div><p>${esc(state.mode === 'portfolio' ? t('portfolioHero') : t('detailHero'))}</p></div>`;
  }

  function summaryCards() {
    if (state.mode === 'portfolio') {
      const summary = state.portfolioPayload?.summary;
      const cards = summary ? [
        [summary.selected_module_count, t('modules'), selectedModules().map((item) => item.short_name).join(' · ')],
        [summary.selected_country_count, t('countries'), selectedCountries().map((item) => item.iso3).join(' · ')],
        [summary.available_cell_count, t('observations'), `${summary.selected_cell_count} ${t('selected').toLowerCase()}`],
        [summary.source_count, t('sources'), `${summary.year_min ?? '—'}–${summary.year_max ?? '—'}`],
        [`${summary.selected_cell_count ? number(100 * summary.available_cell_count / summary.selected_cell_count, 0) : 0}%`, t('coverage'), t('nativeUnits')],
      ] : [[state.modules.length,t('modules'),''],[state.countries.length,t('countries'),''],['—',t('observations'),''],['—',t('sources'),''],['—',t('coverage'),'']];
      return `<div class="dx-summary">${cards.map(([v,l,n]) => `<article><span>${esc(l)}</span><strong>${esc(v)}</strong><small>${esc(n)}</small></article>`).join('')}</div>`;
    }
    const d = state.detailPayload?.summary;
    const dataset = selectedDataset();
    const cards = d ? [
      [d.returned_rows, t('rows'), `${d.total_rows} ${t('resultCount')}`],
      [d.country_count, t('countriesCount'), state.detailCountries.join(' · ')],
      [d.series_count, t('seriesCount'), `${d.year_min ?? '—'}–${d.year_max ?? '—'}`],
      [number(d.value_mean,2), t('mean'), `${number(d.value_min,2)}–${number(d.value_max,2)}`],
      [(state.detailPayload.sources || []).length, t('sources'), dataset?.module_code || '—'],
    ] : [
      [dataset?.row_count ?? 0,t('rows'),statusLabel(dataset?.data_status)],
      [dataset?.year_min ?? '—',t('from'),''],[dataset?.year_max ?? '—',t('to'),''],[(dataset?.measures||[]).length,t('measure'),''],[(dataset?.source_ids||[]).length,t('sources'),''],
    ];
    return `<div class="dx-summary">${cards.map(([v,l,n]) => `<article><span>${esc(l)}</span><strong>${esc(v)}</strong><small>${esc(n)}</small></article>`).join('')}</div>`;
  }

  function loadingWorkspace() { return `<div class="dx-workspace"><div class="dx-loading"><div class="dx-loading-mark">G</div><p>${esc(t('loading'))}</p></div></div>`; }

  function renderControls() {
    const controls = $('#dx-controls'); if (!controls || !state.catalogue || !state.schema) return;
    controls.innerHTML = state.mode === 'portfolio' ? portfolioControls() : detailControls();
    bindControls();
  }

  function portfolioControls() {
    const modules = selectedModules(); const countries = selectedCountries();
    const availableModules = state.catalogue.modules.filter((item) => !state.modules.includes(item.code));
    const availableCountries = state.catalogue.countries.filter((item) => !state.countries.includes(item.iso3));
    return `
      <div class="dx-control-group"><span class="dx-control-title">${esc(t('presets'))}</span><div class="dx-preset-list">${presetButtons()}</div></div>
      <div class="dx-control-group"><label for="dx-module-add">${esc(t('modulesLabel'))}</label><div class="dx-inline"><select id="dx-module-add" class="dx-select"><option value="">${esc(t('addModule'))}</option>${availableModules.map((item) => `<option value="${esc(item.code)}">${esc(item.short_name)} · ${esc(moduleName(item))}</option>`).join('')}</select><button class="dx-add" type="button" data-add-module aria-label="${esc(t('addModule'))}">+</button></div><div class="dx-chips">${modules.map((item) => `<span class="dx-chip"><b>${esc(item.short_name)}</b><button type="button" data-remove-module="${esc(item.code)}" aria-label="×">×</button></span>`).join('')}</div></div>
      <div class="dx-control-group"><label for="dx-country-add">${esc(t('countriesLabel'))}</label><div class="dx-inline"><select id="dx-country-add" class="dx-select"><option value="">${esc(t('addCountry'))}</option>${availableCountries.map((item) => `<option value="${esc(item.iso3)}">${esc(item.flag || '')} ${esc(countryName(item))}</option>`).join('')}</select><button class="dx-add" type="button" data-add-country aria-label="${esc(t('addCountry'))}">+</button></div><div class="dx-chips">${countries.map((item) => `<span class="dx-chip"><b>${esc(item.flag || '')} ${esc(item.iso3)}</b><button type="button" data-remove-country="${esc(item.iso3)}" aria-label="×">×</button></span>`).join('')}</div></div>
      <div class="dx-range"><label class="dx-control-group">${esc(t('year'))}<select class="dx-select" data-year>${yearOptions()}</select></label><label class="dx-control-group">${esc(t('hteiMode'))}<select class="dx-select" data-htei><option value="proxy_extended" ${state.hteiMode==='proxy_extended'?'selected':''}>Proxy Extended</option><option value="common_support" ${state.hteiMode==='common_support'?'selected':''}>Common Support</option><option value="direct_core" ${state.hteiMode==='direct_core'?'selected':''}>Direct Core</option><option value="asof_diagnostic" ${state.hteiMode==='asof_diagnostic'?'selected':''}>ASOF</option></select></label></div>
      <div class="dx-side-note">${esc(t('portfolioHero'))}</div>`;
  }

  function presetButtons() {
    const presets = [
      ['RUSSIA_CORE','RUS,CHN,USA,DEU,KOR,IND'],['BRICS','BRA,RUS,IND,CHN,ZAF,EGY,ETH,IRN,ARE'],['G20','ARG,AUS,BRA,CAN,CHN,FRA,DEU,IND,IDN,ITA,JPN,MEX,RUS,SAU,ZAF,KOR,TUR,GBR,USA'],['OECD','AUS,AUT,BEL,CAN,CHL,COL,CRI,CZE,DNK,EST,FIN,FRA,DEU,GRC,HUN,ISL,IRL,ISR,ITA,JPN,KOR,LVA,LTU,LUX,MEX,NLD,NZL,NOR,POL,PRT,SVK,SVN,ESP,SWE,CHE,TUR,GBR,USA'],
    ];
    return presets.map(([code,countries]) => {
      const meta = state.catalogue.presets.find((item) => item.code === code);
      return `<button type="button" class="dx-preset" data-preset="${esc(countries)}" title="${esc(localeText(meta,'description'))}">${esc(localeText(meta,'label') || code)}</button>`;
    }).join('');
  }

  function yearOptions() {
    const min = state.catalogue.summary.year_min || 1990; const max = Math.max(2026, state.catalogue.requested_year || 2026);
    let html = '';
    for (let year = max; year >= min; year--) html += `<option value="${year}" ${year===state.year?'selected':''}>${year}</option>`;
    return html;
  }

  function detailControls() {
    const dataset = selectedDataset();
    const groups = state.schema.dataset_groups || [];
    const measures = dataset?.measures || [];
    const countrySet = new Set(state.detailCountries);
    return `
      <div class="dx-control-group"><label for="dx-dataset-group">${esc(t('groups'))}</label><select id="dx-dataset-group" class="dx-select" data-dataset-group><option value="all">${esc(t('allGroups'))}</option>${groups.map((item) => `<option value="${esc(item.code)}" ${state.datasetGroup===item.code?'selected':''}>${esc(localeText(item,'label'))} · ${item.dataset_count}</option>`).join('')}</select><input class="dx-input" type="search" data-dataset-search placeholder="${esc(t('searchDatasets'))}" value="${esc(state.datasetSearch)}"></div>
      <div class="dx-control-group"><label for="dx-detail-measure">${esc(t('measure'))}</label><select id="dx-detail-measure" class="dx-select" data-detail-measure>${measures.map((item) => `<option value="${esc(item.code)}" ${state.measure===item.code?'selected':''}>${esc(measureLabel(item))}</option>`).join('')}</select>${state.detailView==='scatter'?`<label for="dx-detail-x">${esc(t('xMeasure'))}</label><select id="dx-detail-x" class="dx-select" data-detail-x>${measures.map((item) => `<option value="${esc(item.code)}" ${state.xMeasure===item.code?'selected':''}>${esc(measureLabel(item))}</option>`).join('')}</select>`:''}</div>
      ${dimensionControls(dataset)}
      <div class="dx-control-group"><label for="dx-detail-country">${esc(t('countriesLabel'))}</label><div class="dx-inline"><select id="dx-detail-country" class="dx-select"><option value="">${esc(t('addCountry'))}</option>${state.schema.countries.filter((item)=>!countrySet.has(item.iso3)).map((item)=>`<option value="${esc(item.iso3)}">${esc(item.flag||'')} ${esc(countryName(item))}</option>`).join('')}</select><button class="dx-add" type="button" data-add-detail-country>+</button></div><div class="dx-chips">${state.detailCountries.map((iso3)=>{const item=state.schema.countries.find((c)=>c.iso3===iso3);return `<span class="dx-chip"><b>${esc(item?.flag||'')} ${esc(iso3)}</b><button type="button" data-remove-detail-country="${esc(iso3)}">×</button></span>`}).join('')}</div></div>
      <div class="dx-range"><label class="dx-control-group">${esc(t('from'))}<input class="dx-input" type="number" data-year-from value="${state.yearFrom ?? ''}" min="1900" max="2100"></label><label class="dx-control-group">${esc(t('to'))}<input class="dx-input" type="number" data-year-to value="${state.yearTo ?? ''}" min="1900" max="2100"></label></div>
      <button type="button" class="dx-button primary" data-run-detail>${esc(t('query'))}</button>
      <div class="dx-side-note">${esc(dataset?.data_status==='source_gated' ? t('sourceGatedCopy') : t('detailHero'))}</div>`;
  }

  function dimensionControls(dataset) {
    return (dataset?.dimensions || []).map((dimension) => `<div class="dx-control-group"><label for="dim-${esc(dimension.code)}">${esc(localeText(dimension,'label'))}</label><select id="dim-${esc(dimension.code)}" class="dx-select" data-dimension="${esc(dimension.code)}"><option value="">${esc(t('all'))}</option>${(dimension.options||[]).slice(0,1000).map((option)=>`<option value="${esc(option.value)}" ${state.dimensions[dimension.code]===String(option.value)?'selected':''}>${esc(localeText(option,'label') || option.value)} · ${integer(option.count)}</option>`).join('')}</select></div>`).join('');
  }

  function bindPage() {
    $$('[data-mode-jump]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
    $$('.dx-view-tab').forEach((button) => button.addEventListener('click', async () => {
      if (state.mode === 'portfolio') state.view = button.dataset.view; else state.detailView = button.dataset.view;
      render(); await loadActiveView();
    }));
  }

  function bindControls() {
    $$('[data-preset]').forEach((button) => button.addEventListener('click', async () => { state.countries = csv(button.dataset.preset).slice(0,12); render(); await loadActiveView(); }));
    $('[data-add-module]')?.addEventListener('click', async () => { const code = $('#dx-module-add')?.value; if (code && !state.modules.includes(code)) { state.modules.push(code); state.modules = state.modules.slice(0,12); render(); await loadActiveView(); } });
    $$('[data-remove-module]').forEach((button) => button.addEventListener('click', async () => { if (state.modules.length > 1) { state.modules = state.modules.filter((code)=>code!==button.dataset.removeModule); render(); await loadActiveView(); } }));
    $('[data-add-country]')?.addEventListener('click', async () => { const code = $('#dx-country-add')?.value; if (code && !state.countries.includes(code)) { state.countries.push(code); state.countries = state.countries.slice(0,12); render(); await loadActiveView(); } });
    $$('[data-remove-country]').forEach((button) => button.addEventListener('click', async () => { if (state.countries.length > 1) { state.countries = state.countries.filter((code)=>code!==button.dataset.removeCountry); render(); await loadActiveView(); } }));
    $('[data-year]')?.addEventListener('change', async (event) => { state.year = Number(event.target.value); await reloadCatalogue(); render(); await loadActiveView(); });
    $('[data-htei]')?.addEventListener('change', async (event) => { state.hteiMode = event.target.value; await reloadCatalogue(); render(); await loadActiveView(); });
    $('[data-dataset-group]')?.addEventListener('change', (event) => { state.datasetGroup = event.target.value; renderDatasetWorkspaceOnly(); syncUrl(); });
    $('[data-dataset-search]')?.addEventListener('input', (event) => { state.datasetSearch = event.target.value; renderDatasetWorkspaceOnly(); });
    $('[data-detail-measure]')?.addEventListener('change', (event) => { state.measure = event.target.value; syncUrl(); });
    $('[data-detail-x]')?.addEventListener('change', (event) => { state.xMeasure = event.target.value; syncUrl(); });
    $$('[data-dimension]').forEach((select) => select.addEventListener('change', () => { state.dimensions[select.dataset.dimension] = select.value; syncUrl(); }));
    $('[data-add-detail-country]')?.addEventListener('click', () => { const code=$('#dx-detail-country')?.value; if(code&&!state.detailCountries.includes(code)){state.detailCountries.push(code);state.detailCountries=state.detailCountries.slice(0,12);render();loadActiveView();} });
    $$('[data-remove-detail-country]').forEach((button) => button.addEventListener('click', () => { if(state.detailCountries.length>1){state.detailCountries=state.detailCountries.filter((code)=>code!==button.dataset.removeDetailCountry);render();loadActiveView();} }));
    $('[data-year-from]')?.addEventListener('change',(event)=>{state.yearFrom=event.target.value?Number(event.target.value):null;syncUrl();});
    $('[data-year-to]')?.addEventListener('change',(event)=>{state.yearTo=event.target.value?Number(event.target.value):null;syncUrl();});
    $('[data-run-detail]')?.addEventListener('click',()=>loadDetailView());
  }

  async function reloadCatalogue() {
    state.catalogue = await fetchJson(`/api/data-explorer/portfolio/catalog?year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}`);
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;
    state.error = '';
    render();
    loadActiveView();
  }

  async function loadActiveView() {
    const token = ++state.requestToken;
    const workspace = $('#dx-workspace'); if (workspace) workspace.innerHTML = loadingWorkspace();
    try {
      if (state.mode === 'portfolio') await loadPortfolioView(token); else await loadDetailView(token);
    } catch (error) {
      if (token !== state.requestToken) return;
      const target = $('#dx-workspace'); if (target) target.innerHTML = `<div class="dx-error"><strong>${esc(t('apiError'))}</strong><p>${esc(error.message || error)}</p></div>`;
    }
  }

  async function loadPortfolioView(token) {
    const base = `modules=${encodeURIComponent(state.modules.join(','))}&countries=${encodeURIComponent(state.countries.join(','))}&year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}`;
    state.portfolioPayload = await fetchJson(`/api/data-explorer/portfolio/selection?${base}`);
    if (token !== state.requestToken) return;
    if (state.view === 'matrix') state.portfolioViewPayload = await fetchJson(`/api/data-explorer/portfolio/matrix?${base}`);
    if (state.view === 'distribution') state.portfolioViewPayload = await fetchJson(`/api/data-explorer/portfolio/distribution?module=${encodeURIComponent(state.modules[0])}&year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}&universe=${encodeURIComponent(state.universe)}&selected=${encodeURIComponent(state.countries.join(','))}`);
    if (state.view === 'scatter') {
      const published = selectedModules().filter((item)=>item.numeric_release).map((item)=>item.code);
      if (published.length < 2) state.portfolioViewPayload = {empty:'select_two'};
      else state.portfolioViewPayload = await fetchJson(`/api/data-explorer/portfolio/scatter?x_module=${published[0]}&y_module=${published[1]}&year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}&universe=${encodeURIComponent(state.universe)}&selected=${encodeURIComponent(state.countries.join(','))}`);
    }
    if (state.view === 'trend') state.portfolioViewPayload = await fetchJson(`/api/data-explorer/portfolio/trend?module=${encodeURIComponent(state.modules[0])}&countries=${encodeURIComponent(state.countries.join(','))}&year=${state.year}&htei_mode=${encodeURIComponent(state.hteiMode)}`);
    if (state.view === 'table') state.portfolioViewPayload = state.portfolioPayload;
    if (token !== state.requestToken) return;
    renderPortfolioWorkspace();
    refreshSummary();
  }

  async function loadDetailView(token = ++state.requestToken) {
    const dataset = selectedDataset();
    if (!dataset) return;
    state.detailPayload = null;
    if (!dataset.queryable || dataset.data_status === 'source_gated') {
      if (token !== state.requestToken) return;
      renderDetailWorkspace(); refreshSummary(); return;
    }
    const params = new URLSearchParams({dataset: dataset.id, measure: state.measure, limit: '5000'});
    if (state.detailCountries.length) params.set('countries', state.detailCountries.join(','));
    if (state.yearFrom != null) params.set('year_from', String(state.yearFrom));
    if (state.yearTo != null) params.set('year_to', String(state.yearTo));
    if (state.detailView === 'scatter' && state.xMeasure) params.set('x_measure', state.xMeasure);
    Object.entries(state.dimensions).forEach(([key,value])=>{if(value)params.set(key,value)});
    try { state.detailPayload = await fetchJson(`/api/data-explorer/query?${params}`); }
    catch (error) { if(error.status===409){state.detailPayload=null;} else throw error; }
    if (token !== state.requestToken) return;
    renderDetailWorkspace(); refreshSummary();
  }

  function refreshSummary() {
    const node = $('.dx-summary'); if (!node) return;
    const wrapper = document.createElement('div'); wrapper.innerHTML = summaryCards();
    node.replaceWith(wrapper.firstElementChild);
    updateExportLink(); syncUrl();
  }

  function workspaceHead(title, copy, actions = '') {
    return `<div class="dx-workspace-head"><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div><div class="dx-workspace-actions">${actions}</div></div>`;
  }

  function renderPortfolioWorkspace() {
    const target = $('#dx-workspace'); if (!target) return;
    let body = '';
    if (state.view === 'matrix') body = renderPortfolioMatrix(state.portfolioViewPayload);
    if (state.view === 'distribution') body = renderDistribution(state.portfolioViewPayload);
    if (state.view === 'scatter') body = renderScatter(state.portfolioViewPayload);
    if (state.view === 'trend') body = renderTrend(state.portfolioViewPayload);
    if (state.view === 'table') body = renderPortfolioTable(state.portfolioPayload);
    target.innerHTML = body;
    bindWorkspace();
  }

  function renderPortfolioMatrix(payload) {
    const modules = payload.modules || []; const countries = payload.countries || [];
    return `<div class="dx-workspace">${workspaceHead(t('matrixTitle'),t('matrixCopy'),`<select class="dx-mini-select" data-matrix-mode><option value="percentile">${esc(t('distribution'))}</option><option value="score">${esc(t('score'))}</option><option value="rank">${esc(t('rank'))}</option></select>`)}<div class="dx-matrix-wrap"><table class="dx-matrix"><thead><tr><th>${esc(t('modules'))}</th>${countries.map((country)=>`<th>${esc(country.flag||'')} ${esc(countryName(country))}<small>${esc(country.iso3)}</small></th>`).join('')}</tr></thead><tbody>${modules.map((module)=>`<tr><th><strong>${esc(module.short_name)}</strong><span>${esc(moduleName(module))}</span><small>${esc(module.authority)}</small></th>${countries.map((country)=>matrixCell(payload.cells?.[country.iso3]?.[module.code],module)).join('')}</tr>`).join('')}</tbody></table></div>${portfolioEvidence()}</div>`;
  }

  function matrixCell(cell, module) {
    const status = cell?.status || 'no_country_data';
    if (status !== 'available') return `<td class="dx-matrix-cell empty"><strong>—</strong><span>${esc(statusLabel(status))}</span></td>`;
    const p = clamp(cell.percentile,0,100); const colour = p>=75?'var(--dx-green)':p>=50?'var(--dx-accent)':p>=25?'var(--dx-orange)':'var(--dx-red)';
    return `<td class="dx-matrix-cell" style="--p:${p};--cell:${colour}" ${cell.value_id?`data-provenance="${esc(cell.value_id)}" tabindex="0" role="button"`:''}><strong>${esc(number(cell.score,2))}</strong><span>${esc(state.lang==='ru'?module.unit_ru:module.unit_en)} · P${esc(number(p,0))}</span><small>${cell.rank?`${esc(integer(cell.rank))}/${esc(integer(cell.universe_count))}`:'—'} · ${esc(cell.value_year??'—')}</small></td>`;
  }

  function renderDistribution(payload) {
    const module = state.catalogue.modules.find((item)=>item.code===payload.index_code) || {};
    const points = payload.points || [];
    const width=900,height=440,pad={l:44,r:25,t:28,b:65}; const plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
    const circles=points.map((item,i)=>{const p=clamp(item.cell?.percentile,0,100);const x=pad.l+p/100*plotW;const y=pad.t+plotH-(i%13)/12*plotH;const selected=item.selected;return `<circle class="dx-mark ${selected?'dx-selected':''}" cx="${x}" cy="${y}" r="${selected?6:3.2}" fill="${selected?'var(--dx-accent)':'var(--dx-faint)'}" opacity="${selected?1:.42}" tabindex="${selected?0:-1}" data-tip="${esc(countryName(item))}: P${number(p,1)} · ${number(item.cell?.score,2)}"></circle>`}).join('');
    const ticks=[0,25,50,75,100].map(v=>`<line class="dx-grid" x1="${pad.l+v/100*plotW}" y1="${pad.t}" x2="${pad.l+v/100*plotW}" y2="${pad.t+plotH}"/><text class="dx-label" x="${pad.l+v/100*plotW}" y="${height-28}" text-anchor="middle">P${v}</text>`).join('');
    return `<div class="dx-workspace">${workspaceHead(t('distributionTitle'),t('distributionCopy'))}<div class="dx-visual"><figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(moduleName(module))}">${ticks}${circles}<text class="dx-label-strong" x="${pad.l}" y="18">${esc(moduleName(module))} · n=${integer(payload.n)}</text></svg><figcaption>${esc(module.short_name||payload.index_code)} · ${esc(t('selected'))}: ${integer(payload.selected_count)} · median P${number(payload.median_percentile,1)}</figcaption></figure></div>${portfolioEvidence()}</div>`;
  }

  function renderScatter(payload) {
    if (payload.empty) return emptyWorkspace(t('scatterTitle'),t('selectAtLeastTwo'));
    const xModule=state.catalogue.modules.find((item)=>item.code===payload.x_index)||{}; const yModule=state.catalogue.modules.find((item)=>item.code===payload.y_index)||{};
    const width=900,height=500,pad={l:65,r:30,t:30,b:65};const w=width-pad.l-pad.r,h=height-pad.t-pad.b;
    const grid=[0,25,50,75,100].map(v=>`<line class="dx-grid" x1="${pad.l+v/100*w}" y1="${pad.t}" x2="${pad.l+v/100*w}" y2="${pad.t+h}"/><line class="dx-grid" x1="${pad.l}" y1="${pad.t+(100-v)/100*h}" x2="${pad.l+w}" y2="${pad.t+(100-v)/100*h}"/><text class="dx-label" x="${pad.l+v/100*w}" y="${height-32}" text-anchor="middle">${v}</text><text class="dx-label" x="${pad.l-12}" y="${pad.t+(100-v)/100*h+3}" text-anchor="end">${v}</text>`).join('');
    const points=(payload.points||[]).map(item=>{const x=pad.l+clamp(item.x,0,100)/100*w,y=pad.t+(100-clamp(item.y,0,100))/100*h;return `<circle class="dx-mark ${item.selected?'dx-selected':''}" cx="${x}" cy="${y}" r="${item.selected?6:3.5}" fill="${item.selected?'var(--dx-accent)':'var(--dx-blue)'}" opacity="${item.selected?1:.45}" tabindex="${item.selected?0:-1}" data-tip="${esc(countryName(item))}: ${number(item.x,1)} × ${number(item.y,1)}"></circle>`}).join('');
    return `<div class="dx-workspace">${workspaceHead(t('scatterTitle'),t('scatterCopy'),`<span class="dx-badge available">${esc(t('correlation'))}: ${number(payload.correlation,3)} · n=${integer(payload.n)}</span>`)}<div class="dx-visual"><figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(moduleName(xModule))} × ${esc(moduleName(yModule))}">${grid}<line x1="${pad.l+payload.median_x/100*w}" y1="${pad.t}" x2="${pad.l+payload.median_x/100*w}" y2="${pad.t+h}" stroke="var(--dx-accent)" stroke-dasharray="5 5"/><line x1="${pad.l}" y1="${pad.t+(100-payload.median_y)/100*h}" x2="${pad.l+w}" y2="${pad.t+(100-payload.median_y)/100*h}" stroke="var(--dx-accent)" stroke-dasharray="5 5"/>${points}<text class="dx-label-strong" x="${pad.l+w/2}" y="${height-8}" text-anchor="middle">${esc(xModule.short_name||payload.x_index)} · percentile</text><text class="dx-label-strong" transform="translate(18 ${pad.t+h/2}) rotate(-90)" text-anchor="middle">${esc(yModule.short_name||payload.y_index)} · percentile</text></svg><figcaption>${esc(t('correlation'))}: ${number(payload.correlation,3)} · ${integer(payload.n)} ${esc(t('jointN'))}</figcaption></figure></div>${portfolioEvidence()}</div>`;
  }

  function renderTrend(payload) {
    const series=payload.series||[]; if(!series.some((item)=>item.points?.length)) return emptyWorkspace(t('trendTitle'),t('noData'));
    const all=series.flatMap((item)=>item.points||[]); const xs=all.map((p)=>Number(p.year)); const ys=all.map((p)=>Number(p.score)).filter(Number.isFinite); const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys); const width=900,height=480,pad={l:65,r:30,t:28,b:60},w=width-pad.l-pad.r,h=height-pad.t-pad.b;
    const colour=(i)=>`var(--c${i%8+1})`;
    const paths=series.map((item,i)=>{const pts=(item.points||[]).filter(p=>Number.isFinite(Number(p.score))).map(p=>[pad.l+(Number(p.year)-xmin)/Math.max(1,xmax-xmin)*w,pad.t+(ymax-Number(p.score))/Math.max(1e-9,ymax-ymin)*h,p]);if(!pts.length)return '';return `<path d="${pts.map((p,j)=>`${j?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="${colour(i)}" stroke-width="2"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="4" fill="${colour(i)}" data-tip="${esc(countryName(item))}: ${number(pts.at(-1)[2].score,2)}"></circle><text class="dx-label-strong" x="${pts.at(-1)[0]+7}" y="${pts.at(-1)[1]+3}">${esc(item.iso3)}</text>`}).join('');
    const xticks=[xmin,Math.round((xmin+xmax)/2),xmax].map(v=>`<text class="dx-label" x="${pad.l+(v-xmin)/Math.max(1,xmax-xmin)*w}" y="${height-25}" text-anchor="middle">${v}</text>`).join('');
    return `<div class="dx-workspace">${workspaceHead(t('trendTitle'),t('trendCopy'))}<div class="dx-visual"><figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(payload.index_code)}"><line class="dx-axis" x1="${pad.l}" y1="${pad.t+h}" x2="${pad.l+w}" y2="${pad.t+h}"/><line class="dx-axis" x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t+h}"/>${xticks}${paths}</svg><figcaption>${esc((state.lang==='ru'?payload.warnings_ru:payload.warnings_en||[]).join(' ') || t('trendCopy'))}</figcaption></figure></div>${portfolioEvidence()}</div>`;
  }

  function renderPortfolioTable(payload) {
    const rows=payload.rows||[];
    return `<div class="dx-workspace">${workspaceHead(t('tableTitle'),t('tableCopy'))}<div class="dx-table-wrap" tabindex="0" role="region"><table class="dx-table"><thead><tr><th>ISO3</th><th>${esc(t('countries'))}</th><th>${esc(t('modules'))}</th><th>${esc(t('status'))}</th><th>${esc(t('score'))}</th><th>${esc(t('unit'))}</th><th>${esc(t('rank'))}</th><th>${esc(t('percentile'))}</th><th>${esc(t('year'))}</th><th>${esc(t('sources'))}</th></tr></thead><tbody>${rows.map((row)=>`<tr><td>${esc(row.iso3)}</td><td><strong>${esc(countryName(row))}</strong></td><td>${esc(row.short_name)}<small>${esc(state.lang==='ru'?row.module_name_ru:row.module_name_en)}</small></td><td><span class="dx-badge ${statusClass(row.status)}">${esc(statusLabel(row.status))}</span></td><td>${row.value_id?`<button class="dx-value-button" data-provenance="${esc(row.value_id)}">${esc(number(row.score,2))}</button>`:esc(number(row.score,2))}</td><td>${esc(state.lang==='ru'?row.unit_ru:row.unit_en)}</td><td>${row.rank?`${integer(row.rank)}/${integer(row.universe_count)}`:'—'}</td><td>${row.percentile!=null?`P${number(row.percentile,1)}`:'—'}</td><td>${esc(row.year??'—')}</td><td>${esc(row.source_id||'—')}</td></tr>`).join('')}</tbody></table></div>${portfolioEvidence()}</div>`;
  }

  function portfolioEvidence() {
    return `<div class="dx-evidence"><div><h4>${esc(t('nativeUnits'))}</h4><p>${esc(state.portfolioPayload?.methodology?.[state.lang] || t('portfolioHero'))}</p></div><div><h4>${esc(t('sources'))}</h4><div class="dx-source-list">${[...new Set((state.portfolioPayload?.rows||[]).map((row)=>row.source_id).filter(Boolean))].slice(0,12).map((id)=>`<span>${esc(id)}</span>`).join('')}</div></div></div>`;
  }

  function emptyWorkspace(title, copy, route = '') {
    return `<div class="dx-workspace">${workspaceHead(title,copy)}<div class="dx-empty"><div class="dx-empty-inner"><div class="dx-empty-mark">—</div><h3>${esc(title)}</h3><p>${esc(copy)}</p>${route?`<a class="dx-button primary" href="${esc(route)}">${esc(t('openModule'))}</a>`:''}</div></div></div>`;
  }

  function renderDatasetWorkspaceOnly() {
    const target=$('#dx-workspace'); if(!target)return;
    target.outerHTML=`<div id="dx-workspace">${detailWorkspaceShell()}</div>`;
    bindWorkspace();
  }

  function renderDetailWorkspace() {
    const target=$('#dx-workspace'); if(!target)return;
    target.innerHTML=detailWorkspaceShell();
    bindWorkspace();
  }

  function filteredDatasets() {
    const q=state.datasetSearch.trim().toLowerCase();
    return (state.schema.datasets||[]).filter((item)=>{
      if(state.datasetGroup!=='all'&&item.group_code!==state.datasetGroup)return false;
      if(!q)return true;
      return [item.id,item.module_code,datasetTitle(item),datasetDescription(item),item.group_label_ru,item.group_label_en].join(' ').toLowerCase().includes(q);
    });
  }

  function qsDatasetCallout(dataset) {
    const isQs = dataset && (String(dataset.id || '').startsWith('qs_') || String(dataset.module_code || '') === 'QS_ET');
    if (!isQs) return '';
    const q = state.schema?.qs_portfolio || {};
    return `<section class="dx-qs-callout"><div><span>${esc(t('qsKicker'))}</span><h3>${esc(t('qsTitle'))}</h3><p>${esc(t('qsCopy'))}</p></div><div class="dx-qs-callout__metrics"><div><strong>${integer(q.registered_projects || 0)}</strong><span>${esc(t('qsProjects'))}</span></div><div><strong>${integer(q.loaded_projects || 0)}</strong><span>${esc(t('qsLoaded'))}</span></div><div><strong>${integer(q.subjects || 0)}</strong><span>${esc(t('qsSubjects'))}</span></div><div><strong>${integer(q.entities || 0)}</strong><span>${esc(t('qsEntities'))}</span></div></div><a class="dx-button ghost" href="/#index-QS_ET">${esc(t('openModule'))}</a></section>`;
  }

  function detailWorkspaceShell() {
    const dataset=selectedDataset(); const datasets=filteredDatasets(); const byGroup=new Map();
    datasets.forEach((item)=>{const key=item.group_code||'other';if(!byGroup.has(key))byGroup.set(key,[]);byGroup.get(key).push(item)});
    const list=[...byGroup.entries()].map(([key,items])=>{const group=state.schema.dataset_groups.find((g)=>g.code===key);return `<section class="dx-dataset-group"><h3>${esc(localeText(group,'label')||key)} · ${items.length}</h3>${items.map((item)=>`<button type="button" class="dx-dataset-item" data-dataset="${esc(item.id)}" aria-current="${item.id===state.dataset}"><span><b>${esc(datasetTitle(item))}</b><small>${esc(item.module_code||'')} · ${esc(statusLabel(item.data_status))} · ${shortNumber(item.row_count)}</small></span><span>${esc(item.id)}</span></button>`).join('')}</section>`}).join('');
    return `<div class="dx-dataset-browser"><aside class="dx-dataset-list"><div class="dx-dataset-search"><input class="dx-input" type="search" data-dataset-search-main placeholder="${esc(t('searchDatasets'))}" value="${esc(state.datasetSearch)}"></div>${list||`<div class="dx-empty"><p>${esc(t('noData'))}</p></div>`}</aside><div class="dx-detail-main">${qsDatasetCallout(dataset)}${detailPassport(dataset)}${detailResult(dataset)}</div></div>`;
  }

  function detailPassport(dataset) {
    if(!dataset)return '';
    return `<div class="dx-detail-passport"><div><span>${esc(t('datasetCatalog'))}</span><strong>${esc(datasetTitle(dataset))}</strong><p>${esc(datasetDescription(dataset))}</p></div><div><span>${esc(t('rows'))}</span><strong>${shortNumber(dataset.row_count)}</strong><p>${esc(statusLabel(dataset.data_status))}</p></div><div><span>${esc(t('years'))}</span><strong>${esc(dataset.year_min??'—')}–${esc(dataset.year_max??'—')}</strong><p>${esc(dataset.module_code||'—')}</p></div><div><span>${esc(t('sources'))}</span><strong>${integer((dataset.source_ids||[]).length)}</strong><p>${esc((dataset.source_ids||[]).slice(0,2).join(' · ')||'—')}</p></div></div>`;
  }

  function detailResult(dataset) {
    if(!dataset)return '';
    if(!dataset.queryable||dataset.data_status==='source_gated') return `<div class="dx-empty"><div class="dx-empty-inner"><div class="dx-empty-mark">LOCK</div><h3>${esc(t('sourceGatedTitle'))}</h3><p>${esc(t('sourceGatedCopy'))}</p>${dataset.route?`<a class="dx-button primary" href="${esc(dataset.route)}">${esc(t('openModule'))}</a>`:''}</div></div>`;
    if(!state.detailPayload)return `<div class="dx-loading"><div class="dx-loading-mark">G</div><p>${esc(t('loading'))}</p></div>`;
    const rows=state.detailPayload.rows||[];
    if(!rows.length)return `<div class="dx-empty"><div class="dx-empty-inner"><div class="dx-empty-mark">0</div><h3>${esc(t('noData'))}</h3><p>${esc(datasetDescription(dataset))}</p></div></div>`;
    const toolbar=`<div class="dx-detail-toolbar"><span class="dx-badge available">${esc(measureLabel(state.detailPayload.measure_meta))}</span><span class="dx-badge">${integer(rows.length)} ${esc(t('rows').toLowerCase())}</span><a class="dx-button ghost" href="/api/data-explorer/datasets/${encodeURIComponent(dataset.id)}/metadata.json" target="_blank" rel="noopener">${esc(t('metadata'))}</a>${dataset.route?`<a class="dx-button ghost" href="${esc(dataset.route)}">${esc(t('openModule'))}</a>`:''}</div>`;
    let visual='';
    if(state.detailView==='table')visual=detailTable(rows);
    if(state.detailView==='line')visual=detailLine(rows);
    if(state.detailView==='bar')visual=detailBars(rows);
    if(state.detailView==='scatter')visual=detailScatter(rows);
    if(state.detailView==='histogram')visual=detailHistogram(rows);
    return `${toolbar}<div class="dx-detail-chart">${visual}</div>${detailEvidence()}`;
  }

  function detailTable(rows) {
    return `<div class="dx-table-wrap" tabindex="0" role="region"><table class="dx-table"><thead><tr><th>ISO3</th><th>${esc(t('countries'))}</th><th>${esc(t('year'))}</th><th>${esc(t('series'))}</th><th>${esc(t('measure'))}</th><th>${esc(t('unit'))}</th><th>${esc(t('sources'))}</th><th>${esc(t('quality'))}</th></tr></thead><tbody>${rows.map((row)=>`<tr><td>${esc(row.iso3||'—')}</td><td><strong>${esc(countryName(row))}</strong></td><td>${esc(row.year??'—')}</td><td>${esc(state.lang==='ru'?row.series_ru:row.series_en||row.series_code||'—')}</td><td>${row.value_id?`<button class="dx-value-button" data-provenance="${esc(row.value_id)}">${esc(number(row.value,3))}</button>`:esc(number(row.value,3))}</td><td>${esc(row.unit||'—')}</td><td>${esc(row.source_id||'—')}</td><td>${esc(row.quality_flag||'—')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function detailLine(rows) {
    const valid=rows.filter((row)=>Number.isFinite(Number(row.value))&&Number.isFinite(Number(row.year))); if(!valid.length)return detailBars(rows);
    const key=(row)=>`${row.iso3||'—'} · ${row.series_code||'value'}`; const groups=new Map();valid.forEach(row=>{const k=key(row);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row)});
    const all=valid,years=all.map(r=>Number(r.year)),values=all.map(r=>Number(r.value)),xmin=Math.min(...years),xmax=Math.max(...years),ymin=Math.min(...values),ymax=Math.max(...values); const width=920,height=480,pad={l:70,r:50,t:25,b:65},w=width-pad.l-pad.r,h=height-pad.t-pad.b;
    const paths=[...groups.entries()].slice(0,16).map(([label,items],i)=>{const pts=items.sort((a,b)=>a.year-b.year).map(r=>[pad.l+(r.year-xmin)/Math.max(1,xmax-xmin)*w,pad.t+(ymax-r.value)/Math.max(1e-9,ymax-ymin)*h,r]);const colour=`var(--c${i%8+1})`;return `<path d="${pts.map((p,j)=>`${j?'L':'M'}${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="2"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="4" fill="${colour}" data-tip="${esc(label)}: ${number(pts.at(-1)[2].value,3)}"></circle><text class="dx-label-strong" x="${pts.at(-1)[0]+6}" y="${pts.at(-1)[1]+3}">${esc(label.slice(0,18))}</text>`}).join('');
    return `<figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img"><line class="dx-axis" x1="${pad.l}" y1="${pad.t+h}" x2="${pad.l+w}" y2="${pad.t+h}"/><line class="dx-axis" x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t+h}"/>${paths}<text class="dx-label" x="${pad.l}" y="${height-25}">${xmin}</text><text class="dx-label" x="${pad.l+w}" y="${height-25}" text-anchor="end">${xmax}</text><text class="dx-label" x="${pad.l-10}" y="${pad.t+5}" text-anchor="end">${number(ymax,2)}</text><text class="dx-label" x="${pad.l-10}" y="${pad.t+h}" text-anchor="end">${number(ymin,2)}</text></svg><figcaption>${esc(t('nativeUnits'))} · ${integer(groups.size)} ${esc(t('seriesCount').toLowerCase())}</figcaption></figure>`;
  }

  function detailBars(rows) {
    const valid=rows.filter((row)=>Number.isFinite(Number(row.value))).sort((a,b)=>Number(b.value)-Number(a.value)).slice(0,30);if(!valid.length)return `<p>${esc(t('noData'))}</p>`;const max=Math.max(...valid.map(r=>Math.abs(Number(r.value))),1);const width=920,rowH=25,height=Math.max(260,valid.length*rowH+60);return `<figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img">${valid.map((row,i)=>{const y=25+i*rowH,w=Math.abs(row.value)/max*560;const label=`${row.iso3||''} ${state.lang==='ru'?row.series_ru:row.series_en||row.series_code||''}`.trim();return `<text class="dx-label" x="215" y="${y+12}" text-anchor="end">${esc(label.slice(0,34))}</text><rect class="dx-mark" x="225" y="${y}" width="${w}" height="16" fill="var(--dx-accent)" opacity=".76" data-tip="${esc(label)}: ${number(row.value,3)}"></rect><text class="dx-label-strong" x="${235+w}" y="${y+12}">${number(row.value,3)}</text>`}).join('')}</svg><figcaption>${esc(t('selected'))}: ${integer(valid.length)}</figcaption></figure>`;
  }

  function detailScatter(rows) {
    const valid=rows.filter((row)=>Number.isFinite(Number(row.value))&&Number.isFinite(Number(row.x_value)));if(!valid.length)return `<div class="dx-empty"><p>${esc(t('noData'))}</p></div>`;const xs=valid.map(r=>Number(r.x_value)),ys=valid.map(r=>Number(r.value)),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);const width=920,height=480,pad={l:70,r:35,t:25,b:65},w=width-pad.l-pad.r,h=height-pad.t-pad.b;return `<figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img"><line class="dx-axis" x1="${pad.l}" y1="${pad.t+h}" x2="${pad.l+w}" y2="${pad.t+h}"/><line class="dx-axis" x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t+h}"/>${valid.slice(0,1000).map(row=>{const x=pad.l+(row.x_value-xmin)/Math.max(1e-9,xmax-xmin)*w,y=pad.t+(ymax-row.value)/Math.max(1e-9,ymax-ymin)*h;return `<circle class="dx-mark" cx="${x}" cy="${y}" r="4" fill="var(--dx-blue)" opacity=".55" data-tip="${esc(countryName(row))}: ${number(row.x_value,2)} × ${number(row.value,2)}"></circle>`}).join('')}</svg><figcaption>${integer(valid.length)} ${esc(t('observations').toLowerCase())}</figcaption></figure>`;
  }

  function detailHistogram(rows) {
    const values=rows.map(r=>Number(r.value)).filter(Number.isFinite);if(!values.length)return `<p>${esc(t('noData'))}</p>`;const min=Math.min(...values),max=Math.max(...values),bins=12,step=(max-min||1)/bins,counts=Array(bins).fill(0);values.forEach(v=>counts[Math.min(bins-1,Math.floor((v-min)/step))]++);const width=920,height=430,pad={l:55,r:25,t:25,b:60},w=width-pad.l-pad.r,h=height-pad.t-pad.b,maxCount=Math.max(...counts,1);return `<figure class="dx-figure"><svg viewBox="0 0 ${width} ${height}" role="img">${counts.map((count,i)=>{const bw=w/bins-4,bh=count/maxCount*h,x=pad.l+i*w/bins+2,y=pad.t+h-bh;return `<rect class="dx-mark" x="${x}" y="${y}" width="${bw}" height="${bh}" fill="var(--dx-accent)" opacity=".8" data-tip="${number(min+i*step,2)}–${number(min+(i+1)*step,2)}: ${count}"></rect>`}).join('')}<line class="dx-axis" x1="${pad.l}" y1="${pad.t+h}" x2="${pad.l+w}" y2="${pad.t+h}"/></svg><figcaption>${integer(values.length)} ${esc(t('observations').toLowerCase())}</figcaption></figure>`;
  }

  function detailEvidence() {
    const sources=state.detailPayload?.sources||[];const warnings=state.lang==='ru'?state.detailPayload?.warnings_ru:state.detailPayload?.warnings_en;
    return `<div class="dx-evidence"><div><h4>${esc(t('sources'))}</h4><div class="dx-source-list">${sources.map((item)=>`<span title="${esc(item.owner||'')}">${esc(item.source_id)}</span>`).join('')}</div></div><div><h4>${esc(t('nativeUnits'))}</h4><p>${esc((warnings||[]).join(' ') || datasetDescription(selectedDataset()))}</p></div></div>`;
  }

  function bindWorkspace() {
    $$('[data-provenance]').forEach((node)=>{
      const open=()=>openProvenance(node.dataset.provenance,node);
      node.addEventListener('click',open);node.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
    });
    $$('[data-dataset]').forEach((button)=>button.addEventListener('click',async()=>{state.dataset=button.dataset.dataset;state.measure='';state.xMeasure='';state.dimensions={};state.yearFrom=null;state.yearTo=null;initialiseDatasetState(false);render();await loadActiveView();}));
    $('[data-dataset-search-main]')?.addEventListener('input',(event)=>{state.datasetSearch=event.target.value;const side=$('[data-dataset-search]');if(side)side.value=state.datasetSearch;renderDatasetWorkspaceOnly();});
    $$('[data-tip]').forEach((node)=>{node.addEventListener('pointerenter',(event)=>showTip(event,node.dataset.tip));node.addEventListener('pointermove',(event)=>moveTip(event));node.addEventListener('pointerleave',hideTip);node.addEventListener('focus',(event)=>showTip(event,node.dataset.tip,true));node.addEventListener('blur',hideTip);});
  }

  async function openProvenance(valueId, origin) {
    if(!valueId)return;state.lastFocus=origin||document.activeElement;const dialog=$('#dx-dialog');const body=$('#dx-dialog-body');$('#dx-dialog-kicker').textContent=t('provenance');$('#dx-dialog-title').textContent=valueId;$('#dx-dialog-subtitle').textContent=t('nativeUnits');body.innerHTML=loadingWorkspace();dialog.showModal();$('#dx-dialog-close')?.focus();
    try{const data=await fetchJson(`/api/data-explorer/provenance/${encodeURIComponent(valueId)}`);body.innerHTML=provenanceContent(data);}catch(error){body.innerHTML=`<div class="dx-error">${esc(error.message||error)}</div>`;}
  }

  function provenanceContent(data) {
    const source=data.source||{};const snap=data.snapshot||{};const record=data.record||{};const embedded=data.embedded_provenance&&typeof data.embedded_provenance==='object'?data.embedded_provenance:{};const embeddedSource=embedded.source&&typeof embedded.source==='object'?embedded.source:{};const rows=[
      [t('valueId'),data.value_id],[t('dataset'),data.dataset],[t('tableLabel'),data.table],[t('source'),source.source_name||source.source_id||record.source_id||embedded.source_id||embeddedSource.source_id],[t('owner'),source.owner||embeddedSource.publisher],[t('snapshot'),snap.snapshot_id||embedded.snapshot_id],['SHA-256',snap.sha256||snap.raw_snapshot_sha256||record.raw_snapshot_sha256||embedded.raw_snapshot_sha256],[t('year'),record.year||record.release_year||record.value_year||embedded.release_year],[t('quality'),data.quality_flag||record.quality_flag||embedded.quality_flag],[t('transform'),data.transform_id||embedded.transform_id||embedded.transformation_run_id],[t('formula'),data.formula_version||embedded.formula_version],
    ].filter(([,v])=>v!==undefined&&v!==null&&v!=='');
    const sourceUrl=source.source_url||embedded.source_url||embeddedSource.source_url;
    return `<div class="dx-provenance-grid">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>${sourceUrl?`<p><a class="dx-button ghost" href="${esc(sourceUrl)}" target="_blank" rel="noopener">${esc(t('officialSource'))}</a></p>`:''}`;
  }

  function showTip(event,text,focus=false){const tip=$('#dx-tooltip');if(!tip)return;tip.textContent=text;tip.style.display='block';if(focus){const r=event.currentTarget.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-320,r.left)}px`;tip.style.top=`${Math.max(8,r.top-45)}px`;}else moveTip(event)}
  function moveTip(event){const tip=$('#dx-tooltip');if(!tip||tip.style.display==='none')return;tip.style.left=`${Math.min(innerWidth-320,event.clientX+14)}px`;tip.style.top=`${Math.min(innerHeight-70,event.clientY+14)}px`}
  function hideTip(){const tip=$('#dx-tooltip');if(tip)tip.style.display='none'}

  function updateExportLink() {
    const link=$('#dx-export-link');if(!link)return;
    if(state.mode==='portfolio'){
      const p=new URLSearchParams({modules:state.modules.join(','),countries:state.countries.join(','),year:String(state.year),htei_mode:state.hteiMode,lang:state.lang});link.href=`/api/data-explorer/portfolio/selection.csv?${p}`;link.removeAttribute('aria-disabled');link.removeAttribute('title');
    }else{
      const dataset=selectedDataset();if(!dataset?.queryable||dataset.passport?.export_permitted===false){link.href='#';link.setAttribute('aria-disabled','true');link.title=state.lang==='ru'?'Экспорт строк запрещён условиями источника':'Row export is not permitted by the source terms';return;}const p=new URLSearchParams({dataset:dataset.id,measure:state.measure});if(state.detailCountries.length)p.set('countries',state.detailCountries.join(','));if(state.yearFrom!=null)p.set('year_from',state.yearFrom);if(state.yearTo!=null)p.set('year_to',state.yearTo);if(state.detailView==='scatter'&&state.xMeasure)p.set('x_measure',state.xMeasure);Object.entries(state.dimensions).forEach(([k,v])=>{if(v)p.set(k,v)});link.href=`/api/data-explorer/export.csv?${p}`;link.removeAttribute('aria-disabled');link.removeAttribute('title');
    }
  }

  function toast(message){const node=$('#dx-toast');if(!node)return;node.textContent=message;node.classList.add('visible');setTimeout(()=>node.classList.remove('visible'),2200)}

  $('#dx-theme')?.addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';applyTheme();});
  $('#dx-export-link')?.addEventListener('click',(event)=>{if(event.currentTarget.getAttribute('aria-disabled')==='true')event.preventDefault();});
  $('#dx-lang')?.addEventListener('click',async()=>{state.lang=state.lang==='ru'?'en':'ru';window.GIRUserContext?.setManualLanguage?.(state.lang);render();await loadActiveView();});
  $$('.dx-mode').forEach((button)=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  $('#dx-copy-link')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast(t('copied'));}catch(_){toast(t('copyFailed'));}});
  $('#dx-mobile-controls')?.addEventListener('click',()=>$('#dx-sidebar')?.classList.toggle('mobile-open'));
  $('#dx-dialog-close')?.addEventListener('click',()=>$('#dx-dialog')?.close());
  $('#dx-dialog')?.addEventListener('close',()=>state.lastFocus?.focus?.());
  $('#dx-dialog')?.addEventListener('keydown',(event)=>{
    const dialog=$('#dx-dialog');
    if(event.key==='Escape'){dialog?.close();return;}
    if(event.key!=='Tab'||!dialog?.open)return;
    const focusable=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',dialog).filter((node)=>!node.hidden);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });

  init();
})();
