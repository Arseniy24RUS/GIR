(() => {
  "use strict";

  const win = window;
  const doc = document;
  const nativeFetch = win.fetch.bind(win);
  const scriptNode = doc.currentScript
    || [...(doc.scripts || [])].reverse().find((node) => /(?:^|\/)pages-runtime\.js(?:[?#]|$)/.test(node.src || ""));
  const scriptUrl = new URL(scriptNode?.src || "pages-runtime.js", win.location.href);

  function siteBaseUrl(runtimeUrl) {
    const url = runtimeUrl instanceof URL ? runtimeUrl : new URL(runtimeUrl, win.location.href);
    const staticMarker = "/static/";
    const markerIndex = url.pathname.lastIndexOf(staticMarker);
    if (markerIndex >= 0) {
      return new URL(`${url.pathname.slice(0, markerIndex + 1)}`, url.origin);
    }
    return new URL("./", url);
  }

  const baseUrl = siteBaseUrl(scriptUrl);
  const basePath = baseUrl.pathname.endsWith("/") ? baseUrl.pathname : `${baseUrl.pathname}/`;
  const sessionKey = "gir.pages.auth.session.v1";
  const sessionLifetimeMs = 8 * 60 * 60 * 1000;
  const pbkdf2Iterations = 210000;
  const textEncoder = new TextEncoder();
  const publicApiPaths = new Set([
    "/api/health",
    "/api/landing-summary",
    "/api/client-context",
  ]);
  const capabilities = Object.freeze({
    change_password: false,
    manage_users: false,
    mutate_data_updates: false,
    server_persistence: false,
  });
  const profiles = Object.freeze({
    admin: Object.freeze({
      id: 1,
      username: "admin",
      display_name: "Администратор GIR",
      role: "admin",
      salt: "FQjVHhU3AkaTiSbGONteNg==",
      verifier: "fZfcHUqnxVCYpp2CATGOBcg5MT/oBRuz4S52n4/K/7Y=",
    }),
    mgimo: Object.freeze({
      id: 2,
      username: "MGIMO",
      display_name: "МГИМО",
      role: "user",
      salt: "WBcQ+GuqzoUTuAISQvyPLQ==",
      verifier: "kCj++Ql0zP4PsbKHNiCuniOlIq2haydePckH18/ij9s=",
    }),
  });
  let manifestPromise = null;
  let memorySession = null;

  doc.documentElement.dataset.girPagesRuntime = "true";

  function jsonResponse(payload, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...extraHeaders,
      },
    });
  }

  function errorResponse(status, code, message) {
    return jsonResponse({ detail: { code, message } }, status);
  }

  function readOnlyResponse() {
    return errorResponse(403, "PAGES_READ_ONLY", "Эта операция недоступна.");
  }

  function normalizeMethod(input, options) {
    return String(options?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  }

  function requestUrl(input) {
    return new URL(typeof input === "string" || input instanceof URL ? input : input.url, win.location.href);
  }

  function logicalPath(url) {
    let path = url.pathname;
    if (basePath !== "/" && path.startsWith(basePath)) {
      path = `/${path.slice(basePath.length)}`;
    }
    return path.startsWith("/") ? path : `/${path}`;
  }

  function compareCodePoints(left, right) {
    const a = Array.from(left);
    const b = Array.from(right);
    const length = Math.min(a.length, b.length);
    for (let index = 0; index < length; index += 1) {
      const delta = a[index].codePointAt(0) - b[index].codePointAt(0);
      if (delta) return delta;
    }
    return a.length - b.length;
  }

  function quotePlus(value) {
    const bytes = textEncoder.encode(String(value));
    let result = "";
    for (const byte of bytes) {
      const unreserved = (
        (byte >= 0x41 && byte <= 0x5a)
        || (byte >= 0x61 && byte <= 0x7a)
        || (byte >= 0x30 && byte <= 0x39)
        || byte === 0x2d || byte === 0x2e || byte === 0x5f || byte === 0x7e
      );
      if (unreserved) result += String.fromCharCode(byte);
      else if (byte === 0x20) result += "+";
      else result += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
    return result;
  }

  function canonicalRouteKey(input) {
    const url = input instanceof URL ? input : new URL(input, win.location.href);
    const pairs = [...url.searchParams.entries()].sort((left, right) => (
      compareCodePoints(left[0], right[0]) || compareCodePoints(left[1], right[1])
    ));
    const query = pairs.map(([key, value]) => `${quotePlus(key)}=${quotePlus(value)}`).join("&");
    return `${logicalPath(url)}${query ? `?${query}` : ""}`;
  }

  function decodeBase64(value) {
    const binary = win.atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function bytesEqual(left, right) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
      difference |= left[index] ^ right[index];
    }
    return difference === 0;
  }

  async function verifyPassword(profile, password) {
    if (!win.crypto?.subtle) return false;
    const key = await win.crypto.subtle.importKey(
      "raw",
      textEncoder.encode(String(password ?? "")),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const derived = new Uint8Array(await win.crypto.subtle.deriveBits({
      name: "PBKDF2",
      hash: "SHA-256",
      salt: decodeBase64(profile.salt),
      iterations: pbkdf2Iterations,
    }, key, 256));
    return bytesEqual(derived, decodeBase64(profile.verifier));
  }

  function randomToken(bytes = 32) {
    const value = new Uint8Array(bytes);
    win.crypto.getRandomValues(value);
    let binary = "";
    value.forEach((byte) => { binary += String.fromCharCode(byte); });
    return win.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function clearSession() {
    memorySession = null;
    try {
      win.sessionStorage.removeItem(sessionKey);
    } catch (_) {
      // A memory-only session remains usable when browser storage is unavailable.
    }
  }

  function storedSession() {
    try {
      return JSON.parse(win.sessionStorage.getItem(sessionKey) || "null");
    } catch (_) {
      return memorySession;
    }
  }

  function readSession(now = Date.now()) {
    const session = storedSession() || memorySession;
    const issuedAt = Number(session?.issued_at);
    const expiresAt = Number(session?.expires_at);
    const profile = profiles[String(session?.profile || "").toLowerCase()];
    const valid = (
      profile
      && Number.isFinite(issuedAt)
      && Number.isFinite(expiresAt)
      && issuedAt <= now + 60_000
      && expiresAt > now
      && expiresAt - issuedAt > 0
      && expiresAt - issuedAt <= sessionLifetimeMs
      && typeof session.session_id === "string"
      && typeof session.csrf_token === "string"
    );
    if (!valid) {
      clearSession();
      return null;
    }
    return { ...session, profileRecord: profile };
  }

  function writeSession(profile) {
    const issuedAt = Date.now();
    const session = {
      version: 1,
      profile: profile.username.toLowerCase(),
      issued_at: issuedAt,
      expires_at: issuedAt + sessionLifetimeMs,
      session_id: randomToken(36),
      csrf_token: randomToken(32),
    };
    memorySession = session;
    try {
      win.sessionStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (_) {
      // The in-memory fallback deliberately expires on page reload.
    }
    return readSession(issuedAt);
  }

  function publicUser(profile) {
    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      role: profile.role,
      is_active: true,
      must_change_password: false,
      created_at: "2026-07-23T00:00:00Z",
      updated_at: "2026-07-23T00:00:00Z",
      last_login_at: null,
      locked_until: null,
    };
  }

  function authPayload(session = readSession()) {
    const shared = {
      bootstrap_required: false,
      password_min_length: 8,
      demo_mode: true,
      read_only: true,
      capabilities,
    };
    if (!session) return { authenticated: false, ...shared };
    return {
      authenticated: true,
      ...shared,
      user: publicUser(session.profileRecord),
      csrf_token: session.csrf_token,
      expires_at: new Date(session.expires_at).toISOString(),
      idle_timeout_minutes: 480,
    };
  }

  async function bodyAsJson(input, options) {
    try {
      if (typeof options?.body === "string") return JSON.parse(options.body);
      if (
        options?.body
        && typeof options.body === "object"
        && (typeof FormData === "undefined" || !(options.body instanceof FormData))
      ) {
        return options.body;
      }
      if (input instanceof Request) return await input.clone().json();
    } catch (_) {
      return {};
    }
    return {};
  }

  async function authResponse(path, method, input, options) {
    if (path === "/api/auth/status" && method === "GET") {
      return jsonResponse(authPayload());
    }
    if (path === "/api/auth/login" && method === "POST") {
      const body = await bodyAsJson(input, options);
      const normalized = String(body.username ?? "").trim().toLowerCase();
      const profile = profiles[normalized];
      const comparisonProfile = profile || profiles.admin;
      const accepted = await verifyPassword(comparisonProfile, body.password);
      if (!profile || !accepted) {
        return errorResponse(401, "INVALID_CREDENTIALS", "Неверный логин или пароль.");
      }
      return jsonResponse(authPayload(writeSession(profile)));
    }
    if (path === "/api/auth/logout" && method === "POST") {
      clearSession();
      return jsonResponse({
        status: "ok",
        demo_mode: true,
        read_only: true,
        capabilities,
      });
    }
    if (
      path === "/api/auth/change-password"
      || path.startsWith("/api/auth/users")
      || path.startsWith("/api/auth/audit")
      || path.startsWith("/api/auth/register")
    ) {
      return readOnlyResponse();
    }
    return null;
  }

  async function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = nativeFetch(new URL("api/routes.json", baseUrl), {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      }).then(async (response) => {
        if (!response.ok) throw new Error(`routes:${response.status}`);
        const payload = await response.json();
        if (!payload || typeof payload.routes !== "object" || Array.isArray(payload.routes)) {
          throw new Error("routes:invalid");
        }
        return payload;
      }).catch((error) => {
        manifestPromise = null;
        throw error;
      });
    }
    return manifestPromise;
  }

  async function sha256Hex(buffer) {
    const digest = new Uint8Array(await win.crypto.subtle.digest("SHA-256", buffer));
    return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function snapshotUrl(file) {
    const normalized = String(file || "").replace(/\\/g, "/").replace(/^\.\//, "");
    if (
      !normalized
      || normalized.startsWith("/")
      || normalized.includes("../")
      || normalized.includes("://")
      || !normalized.startsWith("api/snapshots/")
    ) {
      return null;
    }
    const resolved = new URL(normalized, baseUrl);
    return resolved.origin === baseUrl.origin && resolved.pathname.startsWith(`${basePath}api/snapshots/`)
      ? resolved
      : null;
  }

  async function mappedSnapshotUrl(input) {
    const url = input instanceof URL ? input : new URL(input, win.location.href);
    const manifest = await loadManifest();
    const route = manifest.routes[canonicalRouteKey(url)];
    if (!route || typeof route !== "object") return null;
    return snapshotUrl(route.file);
  }

  async function mappedApiResponse(url, method) {
    let manifest;
    try {
      manifest = await loadManifest();
    } catch (_) {
      return errorResponse(503, "PAGES_ROUTE_MANIFEST_UNAVAILABLE", "Данные временно недоступны.");
    }
    const key = canonicalRouteKey(url);
    const route = manifest.routes[key];
    if (!route || typeof route !== "object") {
      return errorResponse(404, "PAGES_ROUTE_NOT_FOUND", "Запрошенный набор данных не найден.");
    }
    const target = snapshotUrl(route.file);
    if (!target) {
      return errorResponse(500, "PAGES_ROUTE_INVALID", "Некорректная запись маршрута данных.");
    }
    const source = await nativeFetch(target, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!source.ok) {
      return errorResponse(502, "PAGES_SNAPSHOT_UNAVAILABLE", "Снимок данных недоступен.");
    }
    const buffer = await source.arrayBuffer();
    if (Number.isFinite(Number(route.bytes)) && Number(route.bytes) !== buffer.byteLength) {
      return errorResponse(502, "PAGES_SNAPSHOT_INTEGRITY", "Проверка целостности данных не пройдена.");
    }
    if (route.sha256) {
      const actual = await sha256Hex(buffer);
      if (actual !== String(route.sha256).toLowerCase()) {
        return errorResponse(502, "PAGES_SNAPSHOT_INTEGRITY", "Проверка целостности данных не пройдена.");
      }
    }
    return new Response(method === "HEAD" ? null : buffer, {
      status: Number(route.status) || 200,
      headers: {
        "Content-Type": String(route.content_type || source.headers.get("content-type") || "application/json; charset=utf-8"),
        "Cache-Control": "no-store",
        ...(route.sha256 ? { "X-GIR-Snapshot-SHA256": String(route.sha256).toLowerCase() } : {}),
      },
    });
  }

  function rebasedStaticUrl(url) {
    if (url.origin !== baseUrl.origin || basePath === "/") return url;
    if (url.pathname.startsWith("/static/") || url.pathname === "/world.geojson") {
      return new URL(`${basePath}${url.pathname.slice(1)}${url.search}${url.hash}`, baseUrl.origin);
    }
    return url;
  }

  async function pagesFetch(input, options = {}) {
    const method = normalizeMethod(input, options);
    const url = requestUrl(input);
    if (url.origin !== win.location.origin) return nativeFetch(input, options);
    const path = logicalPath(url);

    if (path.startsWith("/api/auth/")) {
      const response = await authResponse(path, method, input, options);
      if (response) return response;
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) return readOnlyResponse();

    if (path.startsWith("/api/")) {
      if (method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: { Allow: "GET, HEAD, OPTIONS", "Cache-Control": "no-store" },
        });
      }
      if (!publicApiPaths.has(path) && !readSession()) {
        return errorResponse(
          401,
          "AUTH_REQUIRED",
          "Требуется авторизация.",
        );
      }
      return mappedApiResponse(url, method);
    }

    const rebased = rebasedStaticUrl(url);
    if (rebased.href !== url.href) {
      if (input instanceof Request) return nativeFetch(new Request(rebased, input), options);
      return nativeFetch(rebased, options);
    }
    return nativeFetch(input, options);
  }

  function withBase(value) {
    const source = String(value ?? "");
    if (
      !source.startsWith("/")
      || source.startsWith("//")
      || (basePath !== "/" && source.startsWith(basePath))
      || source.startsWith("/api/")
    ) {
      return source;
    }
    const match = source.match(/^\/([^?#]*)([?#].*)?$/);
    if (!match) return `${basePath}${source.slice(1)}`;
    const path = match[1].replace(/\/+$/, "");
    const suffix = match[2] || "";
    const htmlRoutes = {
      "data-lab": "data-lab.html",
      "data-explorer": "data-explorer.html",
      "personal-data-consent": "personal-data-consent.html",
    };
    if (!path) return `${basePath}${suffix}`;
    if (htmlRoutes[path]) return `${basePath}${htmlRoutes[path]}${suffix}`;
    return `${basePath}${path}${suffix}`;
  }

  function rebaseSrcset(value) {
    return String(value ?? "").split(",").map((candidate) => {
      const parts = candidate.trim().split(/\s+/, 2);
      parts[0] = withBase(parts[0]);
      return parts.join(" ");
    }).join(", ");
  }

  function rebaseMarkup(value) {
    const prefix = basePath === "/" ? "/" : basePath;
    return String(value)
      .replace(
        /(\b(?:src|href|action|poster)=["'])(\/(?!\/|api(?:\/|["']))[^"']*)/gi,
        (_match, attribute, url) => `${attribute}${withBase(url)}`,
      )
      .replace(
        /(\bsrcset=["'])([^"']*)(["'])/gi,
        (_match, attribute, urls, closingQuote) => (
          `${attribute}${rebaseSrcset(urls)}${closingQuote}`
        ),
      )
      .replace(
        /(url\(\s*["']?)\/static\//gi,
        `$1${prefix}static/`,
      );
  }

  function rebaseCssValue(value) {
    if (basePath === "/") return String(value);
    return String(value).replace(/(["'(])\/static\//g, `$1${basePath}static/`);
  }

  function rebaseCssStyle(style) {
    if (!style || basePath === "/") return;
    [...style].forEach((property) => {
      const value = style.getPropertyValue(property);
      if (!value || !value.includes("/static/")) return;
      style.setProperty(
        property,
        rebaseCssValue(value),
        style.getPropertyPriority(property),
      );
    });
  }

  function rebaseCssRules(rules) {
    if (!rules) return;
    [...rules].forEach((rule) => {
      rebaseCssStyle(rule.style);
      if (rule.cssRules) rebaseCssRules(rule.cssRules);
    });
  }

  function rebaseStyleSheet(sheet) {
    try {
      rebaseCssRules(sheet?.cssRules);
    } catch (_) {
      // Only same-origin stylesheets are rewritten; inaccessible sheets are ignored.
    }
  }

  function rebaseLoadedStyles(root = doc) {
    if (basePath === "/") return;
    if (root === doc) [...(doc.styleSheets || [])].forEach(rebaseStyleSheet);
    const links = [];
    if (root.matches?.('link[rel~="stylesheet"]')) links.push(root);
    root.querySelectorAll?.('link[rel~="stylesheet"]').forEach((link) => links.push(link));
    links.forEach((link) => {
      if (link.dataset.girPagesStyleHook === "true") return;
      link.dataset.girPagesStyleHook = "true";
      link.addEventListener("load", () => rebaseStyleSheet(link.sheet), { once: true });
    });
    if (root.style) rebaseCssStyle(root.style);
    root.querySelectorAll?.("[style]").forEach((node) => rebaseCssStyle(node.style));
  }

  function patchUrlProperty(constructor, property, transform = withBase) {
    if (!constructor?.prototype) return;
    const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, property);
    if (!descriptor?.get || !descriptor?.set || descriptor.configurable === false) return;
    Object.defineProperty(constructor.prototype, property, {
      ...descriptor,
      set(value) { descriptor.set.call(this, transform(value)); },
    });
  }

  function patchDomUrls() {
    const originalSetAttribute = win.Element?.prototype?.setAttribute;
    if (originalSetAttribute) {
      win.Element.prototype.setAttribute = function setAttribute(name, value) {
        const key = String(name).toLowerCase();
        const transformed = key === "srcset"
          ? rebaseSrcset(value)
          : ["src", "href", "action", "poster"].includes(key) ? withBase(value) : value;
        return originalSetAttribute.call(this, name, transformed);
      };
    }

    patchUrlProperty(win.HTMLScriptElement, "src");
    patchUrlProperty(win.HTMLLinkElement, "href");
    patchUrlProperty(win.HTMLImageElement, "src");
    patchUrlProperty(win.HTMLSourceElement, "src");
    patchUrlProperty(win.HTMLSourceElement, "srcset", rebaseSrcset);
    patchUrlProperty(win.HTMLAnchorElement, "href");
    patchUrlProperty(win.HTMLFormElement, "action");

    const innerHtml = win.Element
      ? Object.getOwnPropertyDescriptor(win.Element.prototype, "innerHTML")
      : null;
    if (innerHtml?.get && innerHtml?.set && innerHtml.configurable !== false) {
      Object.defineProperty(win.Element.prototype, "innerHTML", {
        ...innerHtml,
        set(value) { innerHtml.set.call(this, rebaseMarkup(value)); },
      });
    }

    const originalInsertAdjacentHtml = win.Element?.prototype?.insertAdjacentHTML;
    if (originalInsertAdjacentHtml) {
      win.Element.prototype.insertAdjacentHTML = function insertAdjacentHTML(position, text) {
        return originalInsertAdjacentHtml.call(this, position, rebaseMarkup(text));
      };
    }
  }

  function moduleImportMap() {
    return {
      imports: {
        "/static/": new URL("static/", baseUrl).href,
      },
    };
  }

  function installImportMap() {
    if (basePath === "/" || !doc.createElement || !doc.head) return;
    const node = doc.createElement("script");
    node.type = "importmap";
    node.textContent = JSON.stringify(moduleImportMap());
    doc.head.appendChild(node);
  }

  const unsupportedSelectors = [
    '[data-auth-action="manage"]',
    '[data-auth-action="password"]',
    '[data-auth-form="change-password"]',
    "#gir-auth-admin-layer",
    '[data-action="check-selected"]',
    '[data-action="preview"]',
    '[data-action="create-plan"]',
    "[data-stage-plan]",
    "[data-publish-job]",
    "[data-rollback]",
    "[data-package-form]",
    '.du2-workspace > .du2-notice[role="status"]:not(.is-success)',
    'html[data-auth-role="user"] .du2-header__actions > span.button',
  ];

  function enforceUnavailableControls(root = doc) {
    const nodes = [];
    if (root?.matches?.(unsupportedSelectors.join(","))) nodes.push(root);
    if (root?.querySelectorAll) nodes.push(...root.querySelectorAll(unsupportedSelectors.join(",")));
    nodes.forEach((node) => {
      node.hidden = true;
      node.setAttribute?.("aria-hidden", "true");
      if ("disabled" in node) node.disabled = true;
      node.querySelectorAll?.("button,input,select,textarea").forEach((control) => {
        control.disabled = true;
        control.setAttribute("aria-hidden", "true");
      });
    });
  }

  function installUiGuards() {
    enforceUnavailableControls();
    rebaseLoadedStyles();
    doc.addEventListener("DOMContentLoaded", () => rebaseLoadedStyles(), { once: true });
    if (win.MutationObserver) {
      const observer = new win.MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            enforceUnavailableControls(node);
            rebaseLoadedStyles(node);
            if (node.sheet) rebaseStyleSheet(node.sheet);
          }
        }));
      });
      observer.observe(doc.documentElement, { childList: true, subtree: true });
    }
    doc.addEventListener("click", (event) => {
      const logout = event.target?.closest?.('[data-auth-action="logout"]');
      if (!logout) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clearSession();
      win.location.href = `${basePath}#landing`;
    }, true);
    doc.addEventListener("click", async (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor || anchor.dataset?.girPagesResolved === "true") return;
      let url;
      try {
        url = new URL(anchor.getAttribute("href"), win.location.href);
      } catch (_) {
        return;
      }
      const path = logicalPath(url);
      if (url.origin !== win.location.origin || !path.startsWith("/api/")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!publicApiPaths.has(path) && !readSession()) {
        win.GIRAuth?.requireLogin?.();
        return;
      }
      let target;
      try {
        target = await mappedSnapshotUrl(url);
      } catch (_) {
        return;
      }
      if (!target) return;
      const originalHref = anchor.getAttribute("href");
      anchor.dataset.girPagesResolved = "true";
      anchor.setAttribute("href", target.href);
      try {
        anchor.click();
      } finally {
        anchor.setAttribute("href", originalHref);
        delete anchor.dataset.girPagesResolved;
      }
    }, true);
    doc.addEventListener("click", (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor || readSession()) return;
      let url;
      try {
        url = new URL(anchor.getAttribute("href"), win.location.href);
      } catch (_) {
        return;
      }
      const protectedPages = new Set([
        `${basePath}data-lab.html`,
        `${basePath}data-explorer.html`,
      ]);
      if (url.origin !== win.location.origin || !protectedPages.has(url.pathname)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      win.GIRAuth?.requireLogin?.({ path: `${url.pathname}${url.search}${url.hash}` });
    }, true);
  }

  installImportMap();
  patchDomUrls();
  installUiGuards();
  win.fetch = pagesFetch;
  win.GIRPagesRuntime = Object.freeze({
    basePath,
    siteBasePath: (value) => {
      const path = siteBaseUrl(new URL(value, win.location.href)).pathname;
      return path.endsWith("/") ? path : `${path}/`;
    },
    withBase,
    canonicalRouteKey,
    quotePlus,
    mappedSnapshotUrl,
    rebaseCssValue,
    rebaseMarkup,
    moduleImportMap,
    authPayload,
    clearSession,
    sessionLifetimeMs,
  });
})();
