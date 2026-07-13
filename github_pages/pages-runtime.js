(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const scriptUrl = new URL(document.currentScript.src, window.location.href);
  const siteBase = new URL("../", scriptUrl);
  const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

  const indexCodes = new Set(["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET"]);
  const directRoutes = new Map([
    ["/api/landing-summary", "api/landing-summary.json"],
    ["/api/platform-context", "api/platform-context.json"],
    ["/api/app-data", "api/app-data-RUS-2026.json"],
    ["/api/cross-matrix", "api/cross-matrix.json"],
    ["/api/cross-matrix.csv", "api/cross-matrix.csv"],
    ["/api/htei/workspace", "api/htei-workspace.json"],
    ["/api/htei/workspace.csv", "api/htei-workspace.csv"],
    ["/api/index/HTEI/explainer", "api/htei-explainer.json"],
    ["/api/training/workspace", "api/training-workspace.json"],
    ["/api/training/workspace/export.csv", "api/training-workspace.csv"],
    ["/api/policy/russia/workspace", "api/policy-russia-workspace.json"],
    ["/api/policy/russia/export.csv", "api/policy-russia-workspace.csv"],
    ["/api/methodology/summary", "api/methodology-summary.json"],
    ["/api/methodology/registry", "api/methodology-registry.json"],
    ["/api/comparison/workspace", "api/comparison-workspace.json"],
    ["/api/comparison/workspace.csv", "api/comparison-workspace.csv"],
    ["/api/data-catalog/summary", "api/data-catalog-summary.json"],
    ["/api/data-explorer/schema", "api/data-explorer-schema.json"],
    ["/api/data-catalog/sources", "api/data-catalog-sources.json"],
    ["/api/data-catalog/files", "api/data-catalog-files.json"],
    ["/api/data-explorer/query", "api/data-explorer-query.json"],
    ["/api/data-explorer/export.csv", "api/data-explorer-query.csv"],
    ["/api/data-catalog/manifest.csv", "api/data-catalog-manifest.csv"],
  ]);

  function normalizedPath(url) {
    const basePath = siteBase.pathname.replace(/\/$/, "");
    if (basePath && url.pathname.startsWith(`${basePath}/api/`)) {
      return url.pathname.slice(basePath.length);
    }
    return url.pathname;
  }

  function staticTarget(url) {
    const path = normalizedPath(url);
    if (path === "/world.geojson") return "world.geojson";
    if (directRoutes.has(path)) return directRoutes.get(path);

    const countryWorkspace = path.match(/^\/api\/country\/([^/]+)\/workspace$/);
    if (countryWorkspace && countryWorkspace[1].toUpperCase() === "RUS") {
      return "api/country-RUS-workspace.json";
    }

    const indexWorkspace = path.match(/^\/api\/index\/([^/]+)\/workspace(\.csv)?$/);
    if (indexWorkspace) {
      const code = decodeURIComponent(indexWorkspace[1]).toUpperCase();
      if (indexCodes.has(code)) {
        return `api/index-${code}-workspace.${indexWorkspace[2] ? "csv" : "json"}`;
      }
    }

    const sourceDetails = path.match(/^\/api\/data-catalog\/sources\/([^/]+)$/);
    if (sourceDetails) {
      return `api/data-catalog-source-${encodeURIComponent(decodeURIComponent(sourceDetails[1]))}.json`;
    }

    return null;
  }

  function unsupportedResponse(url) {
    const body = JSON.stringify({
      detail: {
        code: "github_pages_static_snapshot",
        message_ru: "Этот запрос требует локального FastAPI-сервера. В GitHub Pages опубликован зафиксированный срез России за 2026 год.",
        message_en: "This request requires the local FastAPI server. GitHub Pages publishes the fixed Russia 2026 snapshot.",
        repository_url: "https://github.com/Arseniy24RUS/GIR",
        requested_url: url.pathname + url.search,
      },
    });
    return Promise.resolve(new Response(body, { status: 503, headers: jsonHeaders }));
  }

  window.fetch = (input, init) => {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return nativeFetch(input, init);

    const target = staticTarget(url);
    if (target) return nativeFetch(new URL(target, siteBase), init);
    const path = normalizedPath(url);
    if (path.startsWith("/api/")) return unsupportedResponse(url);
    if (path.startsWith("/static/")) {
      return nativeFetch(new URL(path.slice("/static/".length), new URL("static/", siteBase)), init);
    }
    return nativeFetch(input, init);
  };

  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    const url = new URL(link.href, window.location.href);
    const target = staticTarget(url);
    if (target) link.href = new URL(target, siteBase).href;
  }, true);
})();
