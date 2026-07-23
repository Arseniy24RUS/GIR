/* GIR university geography workspace — QS, THE Engineering and ARWU.
 * Coordinates are WGS84 city centroids. Visual point separation is ephemeral.
 */
(() => {
  "use strict";

  const payloadCache = new Map();
  let worldPromise = null;
  let instanceCounter = 0;

  const TEXT = {
    ru: {
      title: "География университетов",
      subtitle: "Расположение университетов и структура международного рейтинга",
      search: "Поиск университета, города или страны",
      searchPlaceholder: "Например, Cambridge или MIT",
      scope: "Охват",
      world: "Весь мир",
      selectedCountry: "Выбранная страна",
      rankLimit: "Диапазон мест",
      all: "Все",
      top50: "Top 50",
      top100: "Top 100",
      top250: "Top 250",
      top500: "Top 500",
      size: "Размер точки",
      sizeScore: "Официальный score",
      sizeRank: "Позиция в рейтинге",
      sizeEqual: "Одинаковый",
      mapped: "на карте",
      countries: "стран",
      cities: "городов",
      coverage: "покрытие",
      reset: "Сбросить карту",
      zoomIn: "Приблизить",
      zoomOut: "Отдалить",
      focusCountry: "Показать выбранную страну",
      methodology: "Как читать карту",
      method: "Точки относятся к центрам городов, а не к точным границам кампусов. Университеты одного города немного разведены только визуально; сохранённые координаты остаются неизменными.",
      source: "Геоданные",
      coordinatePrecision: "Точность",
      cityCentroid: "центр города",
      locationConfidence: "Уверенность сопоставления",
      rank: "Место",
      score: "Score",
      city: "Город",
      country: "Страна",
      evidence: "Происхождение координаты",
      openCountry: "Открыть профиль страны",
      selected: "Выбранный университет",
      prompt: "Выберите точку, чтобы открыть карточку университета и происхождение координаты.",
      noData: "Карта не получила опубликованные университетские точки",
      noDataCopy: "Для выбранного источника и года API не вернул точки карты. Проверьте год, импорт строк и координатный слой; тестовые точки не используются.",
      rightsGated: "Университетские строки защищены условиями доступа",
      rightsCopy: "Карта не раскрывает названия, позиции или координаты университетов, пока право на публичную выдачу строк не подтверждено отдельно.",
      noMatches: "По текущим фильтрам точек нет",
      legend: "Цвет — диапазон места",
      radiusLegend: "Размер — выбранный показатель",
      band1: "1–50",
      band2: "51–100",
      band3: "101–250",
      band4: "251–500",
      band5: "501+",
      lowConfidence: "Низкая уверенность",
      approximate: "Приблизительная координата",
      visible: "видимых точек",
      tableTitle: "Доступная текстовая выборка карты",
      institution: "Университет",
      quality: "Качество координат",
      loading: "Загрузка географии университетов",
      error: "Карта не загрузилась",
      retry: "Повторить",
      attribution: "GeoNames · WGS84 · CC BY 4.0",
      crossSource: "Координата сопоставлена по одноимённой записи другого рейтинга",
    },
    en: {
      title: "University geography",
      subtitle: "Institution locations and the structure of the international ranking",
      search: "Search university, city or country",
      searchPlaceholder: "For example Cambridge or MIT",
      scope: "Scope",
      world: "World",
      selectedCountry: "Selected country",
      rankLimit: "Rank range",
      all: "All",
      top50: "Top 50",
      top100: "Top 100",
      top250: "Top 250",
      top500: "Top 500",
      size: "Point size",
      sizeScore: "Official score",
      sizeRank: "Ranking position",
      sizeEqual: "Equal",
      mapped: "mapped",
      countries: "countries",
      cities: "cities",
      coverage: "coverage",
      reset: "Reset map",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      focusCountry: "Focus selected country",
      methodology: "How to read the map",
      method: "Points represent city centroids rather than exact campus boundaries. Institutions in the same city are separated visually only; stored coordinates remain unchanged.",
      source: "Geodata",
      coordinatePrecision: "Precision",
      cityCentroid: "city centroid",
      locationConfidence: "Match confidence",
      rank: "Rank",
      score: "Score",
      city: "City",
      country: "Country",
      evidence: "Location provenance",
      openCountry: "Open country profile",
      selected: "Selected university",
      prompt: "Select a point to inspect the university and the provenance of its coordinate.",
      noData: "The map did not receive published university points",
      noDataCopy: "The selected source and year returned no map points from the API. Check the year, row import and coordinate layer; no demonstration points are used.",
      rightsGated: "Institution rows are rights-gated",
      rightsCopy: "The map does not disclose institution names, positions or coordinates until a separate right to publish rows is recorded.",
      noMatches: "No points match the current filters",
      legend: "Colour encodes rank band",
      radiusLegend: "Size encodes the selected metric",
      band1: "1–50",
      band2: "51–100",
      band3: "101–250",
      band4: "251–500",
      band5: "501+",
      lowConfidence: "Low confidence",
      approximate: "Approximate coordinate",
      visible: "visible points",
      tableTitle: "Accessible text sample of the map",
      institution: "University",
      quality: "Coordinate quality",
      loading: "Loading university geography",
      error: "The map could not load",
      retry: "Try again",
      attribution: "GeoNames · WGS84 · CC BY 4.0",
      crossSource: "Location matched through an equivalent record in another ranking",
    },
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function fmt(value, digits = 0, lang = "ru") {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return Number(value).toLocaleString(lang === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  function project(longitude, latitude) {
    return [((Number(longitude) + 180) / 360) * 1000, ((90 - Number(latitude)) / 180) * 500];
  }

  function ringPath(ring) {
    let path = "";
    let previous = null;
    let open = false;
    for (const coordinate of ring || []) {
      const lon = Number(coordinate?.[0]);
      const lat = Number(coordinate?.[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      const [x, y] = project(lon, lat);
      const discontinuity = previous != null && Math.abs(lon - previous) > 170;
      if (!open || discontinuity) {
        path += `M${x.toFixed(2)},${y.toFixed(2)}`;
        open = true;
      } else {
        path += `L${x.toFixed(2)},${y.toFixed(2)}`;
      }
      previous = lon;
    }
    return `${path}Z`;
  }

  function geometryPath(geometry) {
    if (!geometry) return "";
    if (geometry.type === "Polygon") return (geometry.coordinates || []).map(ringPath).join("");
    if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon.map(ringPath)).join("");
    return "";
  }

  async function loadWorld() {
    if (!worldPromise) {
      worldPromise = fetch("/static/university-map-world.geojson", { cache: "force-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`World map HTTP ${response.status}`);
          return response.json();
        });
    }
    return worldPromise;
  }

  async function loadPayload(sourceCode, year) {
    const key = `${sourceCode}:${year || "latest"}`;
    if (!payloadCache.has(key)) {
      const params = new URLSearchParams({ source: sourceCode, limit: "5000" });
      if (year) params.set("year", String(year));
      payloadCache.set(key, fetch(`/api/universities/map?${params}`, { cache: "no-store" }).then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.detail || `HTTP ${response.status}`);
        return body;
      }));
    }
    return payloadCache.get(key);
  }

  function band(point) {
    const rank = Number(point?.rank);
    if (!Number.isFinite(rank)) return "unranked";
    if (rank <= 50) return "top50";
    if (rank <= 100) return "top100";
    if (rank <= 250) return "top250";
    if (rank <= 500) return "top500";
    return "rest";
  }

  function deterministicAngle(value) {
    let hash = 2166136261;
    for (const ch of String(value || "")) {
      hash ^= ch.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 360) * Math.PI / 180;
  }

  function layoutPoints(points) {
    const groups = new Map();
    for (const point of points) {
      const key = `${Number(point.latitude).toFixed(5)}:${Number(point.longitude).toFixed(5)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(point);
    }
    const output = [];
    for (const group of groups.values()) {
      group.sort((a, b) => Number(a.rank ?? 99999) - Number(b.rank ?? 99999) || String(a.institution_name).localeCompare(String(b.institution_name)));
      group.forEach((point, index) => {
        const [baseX, baseY] = project(point.longitude, point.latitude);
        const angle = deterministicAngle(point.institution_key) + index * 2.399963;
        const ring = index === 0 ? 0 : 2.4 + 1.8 * Math.sqrt(index);
        output.push({ ...point, mapX: baseX + Math.cos(angle) * ring, mapY: baseY + Math.sin(angle) * ring, visualOffset: ring > 0 });
      });
    }
    return output;
  }

  function sizeFor(point, metric, points) {
    if (metric === "equal") return 4.1;
    if (metric === "score") {
      const values = points.map((item) => Number(item.score)).filter(Number.isFinite);
      const score = Number(point.score);
      if (Number.isFinite(score) && values.length) {
        const low = Math.min(...values);
        const high = Math.max(...values);
        return 2.6 + 6.8 * Math.sqrt((score - low) / Math.max(0.0001, high - low));
      }
    }
    const ranks = points.map((item) => Number(item.rank)).filter(Number.isFinite);
    const rank = Number(point.rank);
    if (!Number.isFinite(rank) || !ranks.length) return 3.2;
    const max = Math.max(...ranks);
    return 2.5 + 6.5 * Math.sqrt((max - rank + 1) / Math.max(1, max));
  }

  function accessibleLabel(point, text, lang) {
    const rank = point.rank_display || (point.rank != null ? `#${fmt(point.rank, 0, lang)}` : "—");
    return `${point.institution_name}; ${point.city || ""}, ${point.country_name || point.iso3 || ""}; ${text.rank}: ${rank}; ${text.score}: ${fmt(point.score, 1, lang)}`;
  }

  class UniversityMap {
    constructor(host, options) {
      this.host = host;
      this.options = options || {};
      this.lang = this.options.lang === "en" ? "en" : "ru";
      this.text = TEXT[this.lang];
      this.id = `ugm-${++instanceCounter}`;
      this.payload = null;
      this.world = null;
      this.state = {
        query: "",
        scope: "world",
        rankMax: this.options.defaultRankMax || (this.options.sourceCode === "ARWU" ? 500 : 250),
        sizeMetric: "score",
        selectedKey: null,
        viewBox: [0, 0, 1000, 500],
      };
    }

    async mount() {
      this.host.innerHTML = `<div class="ugm-loading" aria-live="polite"><span></span><strong>${escapeHtml(this.text.loading)}</strong></div>`;
      try {
        [this.payload, this.world] = await Promise.all([
          loadPayload(this.options.sourceCode, this.options.year),
          loadWorld(),
        ]);
        this.render();
      } catch (error) {
        this.host.innerHTML = `<div class="ugm-error"><strong>${escapeHtml(this.text.error)}</strong><p>${escapeHtml(error?.message || error)}</p><button type="button" data-ugm-retry>${escapeHtml(this.text.retry)}</button></div>`;
        this.host.querySelector("[data-ugm-retry]")?.addEventListener("click", () => {
          payloadCache.delete(`${this.options.sourceCode}:${this.options.year || "latest"}`);
          this.mount();
        });
      }
    }

    filteredPoints() {
      const query = this.state.query.trim().toLowerCase();
      const country = String(this.options.selectedCountry || "").toUpperCase();
      return layoutPoints((this.payload?.points || []).filter((point) => {
        if (this.state.scope === "country" && country && point.iso3 !== country) return false;
        if (this.state.rankMax && Number.isFinite(Number(point.rank)) && Number(point.rank) > Number(this.state.rankMax)) return false;
        if (query) {
          const haystack = `${point.institution_name || ""} ${point.city || ""} ${point.country_name || ""} ${point.iso3 || ""}`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }));
    }

    worldPaths() {
      const selected = String(this.options.selectedCountry || "").toUpperCase();
      return (this.world?.features || []).map((feature) => {
        const iso3 = feature.properties?.iso3 || "";
        const d = geometryPath(feature.geometry);
        return d ? `<path d="${d}" data-country="${escapeHtml(iso3)}" class="${selected && iso3 === selected ? "is-selected-country" : ""}"></path>` : "";
      }).join("");
    }

    graticule() {
      const lines = [];
      for (let lon = -150; lon <= 150; lon += 30) {
        const [x] = project(lon, 0);
        lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="500"></line>`);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const [, y] = project(0, lat);
        lines.push(`<line x1="0" y1="${y}" x2="1000" y2="${y}"></line>`);
      }
      return lines.join("");
    }

    pointMarkup(points) {
      return points.map((point) => {
        const radius = sizeFor(point, this.state.sizeMetric, points);
        const selected = point.institution_key === this.state.selectedKey;
        const selectedCountry = String(this.options.selectedCountry || "").toUpperCase() === point.iso3;
        const confidence = Number(point.match_confidence || 0);
        return `<circle class="ugm-point is-${band(point)}${selected ? " is-selected" : ""}${selectedCountry ? " is-country" : ""}${confidence < 0.8 ? " is-low-confidence" : ""}" cx="${point.mapX.toFixed(2)}" cy="${point.mapY.toFixed(2)}" r="${radius.toFixed(2)}" data-ugm-key="${escapeHtml(point.institution_key)}" tabindex="${Number(point.rank || 9999) <= 100 || selected ? "0" : "-1"}" role="button" aria-label="${escapeHtml(accessibleLabel(point, this.text, this.lang))}"><title>${escapeHtml(accessibleLabel(point, this.text, this.lang))}</title></circle>`;
      }).join("");
    }

    selectedPoint(points) {
      return points.find((point) => point.institution_key === this.state.selectedKey) || null;
    }

    inspector(point) {
      if (!point) {
        return `<aside class="ugm-inspector"><span class="ugm-inspector-kicker">${escapeHtml(this.text.methodology)}</span><h3>${escapeHtml(this.text.title)}</h3><p>${escapeHtml(this.text.prompt)}</p><div class="ugm-method-note"><strong>${escapeHtml(this.text.coordinatePrecision)}</strong><span>${escapeHtml(this.text.method)}</span></div><a href="${escapeHtml(this.payload?.attribution?.source_url || "https://www.geonames.org/")}" target="_blank" rel="noopener noreferrer">${escapeHtml(this.text.attribution)} ↗</a></aside>`;
      }
      const confidence = Number(point.match_confidence || 0);
      return `<aside class="ugm-inspector is-selected"><span class="ugm-inspector-kicker">${escapeHtml(this.text.selected)}</span><h3>${escapeHtml(point.institution_name)}</h3><div class="ugm-inspector-location"><strong>${escapeHtml(point.city || "—")}</strong><span>${escapeHtml(point.country_name || point.iso3 || "")}</span></div><dl><div><dt>${escapeHtml(this.text.rank)}</dt><dd>${escapeHtml(point.rank_display || (point.rank == null ? "—" : `#${fmt(point.rank, 0, this.lang)}`))}</dd></div><div><dt>${escapeHtml(this.text.score)}</dt><dd>${fmt(point.score, 1, this.lang)}</dd></div><div><dt>${escapeHtml(this.text.coordinatePrecision)}</dt><dd>${escapeHtml(point.coordinate_precision === "city_centroid" ? this.text.cityCentroid : point.coordinate_precision || "—")}</dd></div><div><dt>${escapeHtml(this.text.locationConfidence)}</dt><dd>${fmt(confidence * 100, 0, this.lang)}%</dd></div></dl>${point.location_cross_source ? `<p class="ugm-cross-source">${escapeHtml(this.text.crossSource)}</p>` : ""}<div class="ugm-inspector-actions">${point.location_id ? `<button type="button" data-ugm-evidence="${escapeHtml(point.location_id)}">${escapeHtml(this.text.evidence)}</button>` : ""}${point.iso3 && this.options.selectCountry ? `<button type="button" class="is-secondary" data-ugm-country="${escapeHtml(point.iso3)}">${escapeHtml(this.text.openCountry)}</button>` : ""}</div></aside>`;
    }

    emptyOverlay() {
      const status = this.payload?.data_status || "";
      const gated = status.includes("rights") || status === "awaiting_authorized_export" || status === "release_not_published";
      return `<div class="ugm-map-empty"><span>${escapeHtml(this.options.sourceCode || "")}</span><strong>${escapeHtml(gated ? this.text.rightsGated : this.text.noData)}</strong><p>${escapeHtml(gated ? this.text.rightsCopy : this.text.noDataCopy)}</p></div>`;
    }

    controls() {
      const selectedCountry = Boolean(this.options.selectedCountry);
      return `<div class="ugm-controls"><label class="ugm-search"><span>${escapeHtml(this.text.search)}</span><input type="search" data-ugm-query value="${escapeHtml(this.state.query)}" placeholder="${escapeHtml(this.text.searchPlaceholder)}"></label><label><span>${escapeHtml(this.text.scope)}</span><select data-ugm-scope><option value="world"${this.state.scope === "world" ? " selected" : ""}>${escapeHtml(this.text.world)}</option>${selectedCountry ? `<option value="country"${this.state.scope === "country" ? " selected" : ""}>${escapeHtml(this.text.selectedCountry)}</option>` : ""}</select></label><label><span>${escapeHtml(this.text.rankLimit)}</span><select data-ugm-rank><option value="50"${this.state.rankMax === 50 ? " selected" : ""}>${escapeHtml(this.text.top50)}</option><option value="100"${this.state.rankMax === 100 ? " selected" : ""}>${escapeHtml(this.text.top100)}</option><option value="250"${this.state.rankMax === 250 ? " selected" : ""}>${escapeHtml(this.text.top250)}</option><option value="500"${this.state.rankMax === 500 ? " selected" : ""}>${escapeHtml(this.text.top500)}</option><option value="0"${!this.state.rankMax ? " selected" : ""}>${escapeHtml(this.text.all)}</option></select></label><label><span>${escapeHtml(this.text.size)}</span><select data-ugm-size><option value="score"${this.state.sizeMetric === "score" ? " selected" : ""}>${escapeHtml(this.text.sizeScore)}</option><option value="rank"${this.state.sizeMetric === "rank" ? " selected" : ""}>${escapeHtml(this.text.sizeRank)}</option><option value="equal"${this.state.sizeMetric === "equal" ? " selected" : ""}>${escapeHtml(this.text.sizeEqual)}</option></select></label></div>`;
    }

    summary(points) {
      const summary = this.payload?.summary || {};
      const coverage = Number(summary.coverage || 0) * 100;
      return `<div class="ugm-summary"><div><strong>${fmt(summary.mapped || points.length, 0, this.lang)}</strong><span>${escapeHtml(this.text.mapped)}</span></div><div><strong>${fmt(summary.countries, 0, this.lang)}</strong><span>${escapeHtml(this.text.countries)}</span></div><div><strong>${fmt(summary.cities, 0, this.lang)}</strong><span>${escapeHtml(this.text.cities)}</span></div><div><strong>${fmt(coverage, 0, this.lang)}%</strong><span>${escapeHtml(this.text.coverage)}</span></div><div class="ugm-visible"><strong>${fmt(points.length, 0, this.lang)}</strong><span>${escapeHtml(this.text.visible)}</span></div></div>`;
    }

    legend() {
      return `<div class="ugm-legend" aria-label="${escapeHtml(this.text.legend)}"><span>${escapeHtml(this.text.legend)}</span><i class="is-top50"></i><b>${escapeHtml(this.text.band1)}</b><i class="is-top100"></i><b>${escapeHtml(this.text.band2)}</b><i class="is-top250"></i><b>${escapeHtml(this.text.band3)}</b><i class="is-top500"></i><b>${escapeHtml(this.text.band4)}</b><i class="is-rest"></i><b>${escapeHtml(this.text.band5)}</b><em>${escapeHtml(this.text.radiusLegend)}</em></div>`;
    }

    accessibleTable(points) {
      const rows = [...points].sort((a, b) => Number(a.rank ?? 99999) - Number(b.rank ?? 99999)).slice(0, 30);
      return `<details class="ugm-table-details"><summary>${escapeHtml(this.text.tableTitle)} · ${fmt(rows.length, 0, this.lang)}</summary><div class="ugm-table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(this.text.tableTitle)}"><table><thead><tr><th>${escapeHtml(this.text.institution)}</th><th>${escapeHtml(this.text.city)}</th><th>${escapeHtml(this.text.country)}</th><th>${escapeHtml(this.text.rank)}</th><th>${escapeHtml(this.text.score)}</th><th>${escapeHtml(this.text.quality)}</th></tr></thead><tbody>${rows.map((point) => `<tr><td><button type="button" data-ugm-select-row="${escapeHtml(point.institution_key)}">${escapeHtml(point.institution_name)}</button></td><td>${escapeHtml(point.city || "—")}</td><td>${escapeHtml(point.country_name || point.iso3 || "—")}</td><td>${escapeHtml(point.rank_display || (point.rank == null ? "—" : `#${fmt(point.rank, 0, this.lang)}`))}</td><td>${fmt(point.score, 1, this.lang)}</td><td>${fmt(Number(point.match_confidence || 0) * 100, 0, this.lang)}%</td></tr>`).join("")}</tbody></table></div></details>`;
    }

    render() {
      const points = this.filteredPoints();
      if (this.state.selectedKey && !points.some((point) => point.institution_key === this.state.selectedKey)) this.state.selectedKey = null;
      const selected = this.selectedPoint(points);
      const hasSourceRows = Number(this.payload?.summary?.institution_rows || 0) > 0;
      const noPoints = !(this.payload?.points || []).length;
      const [vx, vy, vw, vh] = this.state.viewBox;
      this.host.innerHTML = `<section class="ugm-shell" data-ugm-id="${this.id}"><header class="ugm-header"><div><span>${escapeHtml(this.options.eyebrow || this.options.sourceCode || "")}</span><h3>${escapeHtml(this.options.title || this.text.title)}</h3><p>${escapeHtml(this.options.subtitle || this.text.subtitle)}</p></div><a href="${escapeHtml(this.payload?.attribution?.source_url || "https://www.geonames.org/")}" target="_blank" rel="noopener noreferrer">${escapeHtml(this.text.attribution)} ↗</a></header>${this.summary(points)}${this.controls()}<div class="ugm-stage"><div class="ugm-canvas"><div class="ugm-map-tools"><button type="button" data-ugm-zoom="in" aria-label="${escapeHtml(this.text.zoomIn)}">+</button><button type="button" data-ugm-zoom="out" aria-label="${escapeHtml(this.text.zoomOut)}">−</button><button type="button" data-ugm-reset aria-label="${escapeHtml(this.text.reset)}">↺</button>${this.options.selectedCountry ? `<button type="button" data-ugm-focus-country aria-label="${escapeHtml(this.text.focusCountry)}">◎</button>` : ""}</div><svg viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-labelledby="${this.id}-title ${this.id}-desc"><title id="${this.id}-title">${escapeHtml(this.options.title || this.text.title)}</title><desc id="${this.id}-desc">${escapeHtml(this.text.method)}</desc><g class="ugm-graticule">${this.graticule()}</g><g class="ugm-land">${this.worldPaths()}</g><g class="ugm-points">${this.pointMarkup(points)}</g></svg>${noPoints ? this.emptyOverlay() : (!points.length && hasSourceRows ? `<div class="ugm-map-empty is-filter"><strong>${escapeHtml(this.text.noMatches)}</strong></div>` : "")}<div class="ugm-tooltip" hidden></div></div>${this.inspector(selected)}</div>${this.legend()}${this.accessibleTable(points)}<footer class="ugm-foot"><p>${escapeHtml(this.payload?.method?.[this.lang] || this.text.method)}</p><span>${escapeHtml(this.payload?.attribution?.snapshot_id || "")}</span></footer></section>`;
      this.bind(points);
    }

    bind(points) {
      const query = this.host.querySelector("[data-ugm-query]");
      let searchTimer = null;
      query?.addEventListener("input", (event) => {
        clearTimeout(searchTimer);
        this.state.query = event.target.value;
        searchTimer = setTimeout(() => this.render(), 180);
      });
      this.host.querySelector("[data-ugm-scope]")?.addEventListener("change", (event) => { this.state.scope = event.target.value; this.state.selectedKey = null; this.render(); });
      this.host.querySelector("[data-ugm-rank]")?.addEventListener("change", (event) => { this.state.rankMax = Number(event.target.value) || 0; this.state.selectedKey = null; this.render(); });
      this.host.querySelector("[data-ugm-size]")?.addEventListener("change", (event) => { this.state.sizeMetric = event.target.value; this.render(); });
      this.host.querySelectorAll("[data-ugm-key]").forEach((element) => {
        const key = element.dataset.ugmKey;
        const point = points.find((item) => item.institution_key === key);
        const show = (event) => this.showTooltip(point, event.currentTarget);
        element.addEventListener("pointerenter", show);
        element.addEventListener("focus", show);
        element.addEventListener("pointerleave", () => this.hideTooltip());
        element.addEventListener("blur", () => this.hideTooltip());
        element.addEventListener("click", () => { this.state.selectedKey = key; this.render(); this.host.querySelector(".ugm-inspector")?.focus?.(); });
        element.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this.state.selectedKey = key; this.render(); }
        });
      });
      this.host.querySelectorAll("[data-ugm-select-row]").forEach((button) => button.addEventListener("click", () => {
        this.state.selectedKey = button.dataset.ugmSelectRow;
        this.render();
        this.host.querySelector(`[data-ugm-key="${CSS.escape(this.state.selectedKey)}"]`)?.focus();
      }));
      this.host.querySelector("[data-ugm-evidence]")?.addEventListener("click", (event) => this.options.openProvenance?.(event.currentTarget.dataset.ugmEvidence, event.currentTarget));
      this.host.querySelector("[data-ugm-country]")?.addEventListener("click", (event) => this.options.selectCountry?.(event.currentTarget.dataset.ugmCountry));
      this.host.querySelectorAll("[data-ugm-zoom]").forEach((button) => button.addEventListener("click", () => this.zoom(button.dataset.ugmZoom === "in" ? 0.72 : 1.38)));
      this.host.querySelector("[data-ugm-reset]")?.addEventListener("click", () => { this.state.viewBox = [0, 0, 1000, 500]; this.render(); });
      this.host.querySelector("[data-ugm-focus-country]")?.addEventListener("click", () => this.focusCountry(points));
    }

    showTooltip(point, anchor) {
      if (!point) return;
      const tooltip = this.host.querySelector(".ugm-tooltip");
      if (!tooltip) return;
      tooltip.innerHTML = `<strong>${escapeHtml(point.institution_name)}</strong><span>${escapeHtml(point.city || "—")} · ${escapeHtml(point.country_name || point.iso3 || "")}</span><b>${escapeHtml(point.rank_display || (point.rank == null ? "—" : `#${fmt(point.rank, 0, this.lang)}`))} · ${fmt(point.score, 1, this.lang)}</b>`;
      tooltip.hidden = false;
      const canvas = this.host.querySelector(".ugm-canvas").getBoundingClientRect();
      const box = anchor.getBoundingClientRect();
      const left = Math.min(canvas.width - 240, Math.max(8, box.left - canvas.left + box.width / 2));
      const top = Math.min(canvas.height - 100, Math.max(8, box.top - canvas.top - 16));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
      const tooltip = this.host.querySelector(".ugm-tooltip");
      if (tooltip) tooltip.hidden = true;
    }

    zoom(factor) {
      let [x, y, width, height] = this.state.viewBox;
      const newWidth = Math.max(180, Math.min(1000, width * factor));
      const newHeight = newWidth / 2;
      x = Math.max(0, Math.min(1000 - newWidth, x + (width - newWidth) / 2));
      y = Math.max(0, Math.min(500 - newHeight, y + (height - newHeight) / 2));
      this.state.viewBox = [x, y, newWidth, newHeight];
      this.render();
    }

    focusCountry(points) {
      const iso3 = String(this.options.selectedCountry || "").toUpperCase();
      const selected = points.filter((point) => point.iso3 === iso3);
      if (!selected.length) return;
      const xs = selected.map((point) => point.mapX);
      const ys = selected.map((point) => point.mapY);
      const minX = Math.min(...xs); const maxX = Math.max(...xs);
      const minY = Math.min(...ys); const maxY = Math.max(...ys);
      const width = Math.max(180, Math.min(800, (maxX - minX) * 2 + 100));
      const height = width / 2;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      this.state.viewBox = [Math.max(0, Math.min(1000 - width, centerX - width / 2)), Math.max(0, Math.min(500 - height, centerY - height / 2)), width, height];
      this.render();
    }
  }

  function render(host, options) {
    if (!host) return null;
    const instance = new UniversityMap(host, options);
    instance.mount();
    return instance;
  }

  function invalidate(sourceCode) {
    for (const key of [...payloadCache.keys()]) {
      if (!sourceCode || key.startsWith(`${sourceCode}:`)) payloadCache.delete(key);
    }
  }

  window.GIRUniversityMap = { render, invalidate };
})();
