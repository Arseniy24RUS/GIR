(function bootstrapGIRUserContext(global) {
  "use strict";

  const core = global.GIRUserContextCore;
  if (!core) throw new Error("GIR user-context core is not loaded");

  const LANGUAGE_KEY = "gir-language-preference-v1";
  const COUNTRY_KEY = "gir-country-preference-v1";
  const GEOLOCATION_ATTEMPT_KEY = "gir-geolocation-attempted-v1";
  const AUTO_COUNTRY_KEY = "gir-auto-country-v1";
  const params = new URLSearchParams(global.location.search);

  function read(storage, key) {
    try { return storage.getItem(key); } catch (_) { return null; }
  }
  function write(storage, key, value) {
    try { storage.setItem(key, value); } catch (_) { /* storage can be unavailable in privacy mode */ }
  }
  function remove(storage, key) {
    try { storage.removeItem(key); } catch (_) { /* storage can be unavailable in privacy mode */ }
  }
  function removeQueryParameter(name) {
    const url = new URL(global.location.href);
    if (!url.searchParams.has(name)) return;
    url.searchParams.delete(name);
    global.history.replaceState(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function emit(reason) {
    global.dispatchEvent(new CustomEvent("gir:user-context-change", { detail: { ...publicSnapshot(), reason } }));
  }

  const resolvedLanguage = core.resolveLanguage({
    queryLanguage: params.get("lang"),
    storedLanguage: read(global.localStorage, LANGUAGE_KEY),
    navigatorLike: global.navigator,
  });
  const queryCountry = core.normaliseCountry(params.get("country"));
  const manualCountry = core.normaliseCountry(read(global.localStorage, COUNTRY_KEY));
  const snapshot = {
    language: resolvedLanguage.value,
    languageSource: resolvedLanguage.source,
    country: queryCountry || manualCountry,
    countryIso2: null,
    countrySource: queryCountry ? "url" : (manualCountry ? "manual" : null),
    countryDetected: false,
    countryRequired: !(queryCountry || manualCountry),
    countries: [],
  };
  document.documentElement.lang = snapshot.language;
  document.documentElement.dataset.languageSource = snapshot.languageSource;
  document.documentElement.dataset.country = snapshot.country || "unresolved";
  document.documentElement.dataset.countrySource = snapshot.countrySource || "none";

  let boundaryPromise = null;
  function loadBoundaries() {
    if (!boundaryPromise) {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeout = global.setTimeout(() => controller?.abort(), 5000);
      boundaryPromise = global.fetch("/static/world_countries_lite.geojson", {
        cache: "force-cache",
        credentials: "same-origin",
        ...(controller ? { signal: controller.signal } : {}),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Country boundaries HTTP ${response.status}`);
          return response.json();
        })
        .then((payload) => payload.features || [])
        .finally(() => global.clearTimeout(timeout));
    }
    return boundaryPromise;
  }
  function featureForCountry(features, iso3) {
    return features.find((feature) => core.normaliseCountry(feature.properties?.iso3 || feature.properties?.ISO_A3) === iso3) || null;
  }
  function setCountry(country, source, detected, reason) {
    snapshot.country = core.normaliseCountry(country?.iso3);
    snapshot.countryIso2 = String(country?.iso2 || "").toUpperCase() || null;
    snapshot.countrySource = snapshot.country ? source : null;
    snapshot.countryDetected = Boolean(snapshot.country && detected);
    snapshot.countryRequired = !snapshot.country;
    document.documentElement.dataset.country = snapshot.country || "unresolved";
    document.documentElement.dataset.countrySource = snapshot.countrySource || "none";
    emit(reason);
    return snapshot.country;
  }
  function geolocationAllowed() {
    return Boolean(global.isSecureContext || ["localhost", "127.0.0.1", "::1"].includes(global.location.hostname));
  }
  function browserCoordinates() {
    if (!geolocationAllowed() || !global.navigator.geolocation) return Promise.resolve(null);
    if (read(global.sessionStorage, GEOLOCATION_ATTEMPT_KEY) === "1") return Promise.resolve(null);
    write(global.sessionStorage, GEOLOCATION_ATTEMPT_KEY, "1");
    return new Promise((resolve) => {
      global.navigator.geolocation.getCurrentPosition(
        (position) => resolve({ longitude: position.coords.longitude, latitude: position.coords.latitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 3600000 },
      );
    });
  }
  function fetchClientContext() {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = global.setTimeout(() => controller?.abort(), 4000);
    return global.fetch("/api/client-context", {
      cache: "no-store",
      credentials: "same-origin",
      ...(controller ? { signal: controller.signal } : {}),
    }).finally(() => global.clearTimeout(timeout));
  }
  async function automaticCountry() {
    try {
      const response = await fetchClientContext();
      if (response.ok) {
        const payload = await response.json();
        const country = payload?.country;
        if (country?.detected && core.normaliseCountry(country.iso3)) {
          return setCountry(country, country.detection_source || "trusted_proxy", true, "automatic-country");
        }
        if (payload?.browser_fallback_required === false) return setCountry(null, null, false, "country-required");
      }
    } catch (_) { /* local browser fallback remains available */ }

    const sessionCountry = core.normaliseCountry(read(global.sessionStorage, AUTO_COUNTRY_KEY));
    if (sessionCountry) return setCountry({ iso3: sessionCountry }, "browser_geolocation", true, "automatic-country");

    const coordinates = await browserCoordinates();
    if (!coordinates) return setCountry(null, null, false, "country-required");
    try {
      const features = await loadBoundaries();
      const country = core.countryAtCoordinates(coordinates.longitude, coordinates.latitude, features);
      if (country) write(global.sessionStorage, AUTO_COUNTRY_KEY, country.iso3);
      return setCountry(country, "browser_geolocation", Boolean(country), country ? "automatic-country" : "country-required");
    } catch (_) {
      return setCountry(null, null, false, "country-required");
    }
  }
  async function resolveCountry() {
    if (snapshot.country) {
      try {
        const features = await loadBoundaries();
        const feature = featureForCountry(features, snapshot.country);
        if (feature) {
          snapshot.countryIso2 = String(feature.properties?.iso2 || "").toUpperCase() || null;
          snapshot.countryRequired = false;
          document.documentElement.dataset.country = snapshot.country;
          document.documentElement.dataset.countrySource = snapshot.countrySource;
          return snapshot.country;
        }
      } catch (_) {
        // A syntactically valid explicit country remains usable when the local
        // boundary catalogue cannot be loaded; the API will validate it again.
        return snapshot.country;
      }
      if (snapshot.countrySource === "manual") remove(global.localStorage, COUNTRY_KEY);
      if (snapshot.countrySource === "url") removeQueryParameter("country");
      snapshot.country = null;
      snapshot.countrySource = null;
    }
    return automaticCountry();
  }

  function setManualLanguage(language) {
    const value = core.normaliseLanguage(language);
    if (value !== "ru" && value !== "en") return false;
    removeQueryParameter("lang");
    write(global.localStorage, LANGUAGE_KEY, value);
    write(global.localStorage, "lang", value);
    write(global.localStorage, "gir-lang", value);
    snapshot.language = value;
    snapshot.languageSource = "manual";
    document.documentElement.lang = value;
    document.documentElement.dataset.languageSource = "manual";
    emit("manual-language");
    return true;
  }
  function resetLanguagePreference() {
    removeQueryParameter("lang");
    remove(global.localStorage, LANGUAGE_KEY);
    remove(global.localStorage, "lang");
    remove(global.localStorage, "gir-lang");
    snapshot.language = core.deviceLanguage(global.navigator);
    snapshot.languageSource = "device";
    document.documentElement.lang = snapshot.language;
    document.documentElement.dataset.languageSource = "device";
    emit("device-language");
    return snapshot.language;
  }
  function setManualCountry(iso3) {
    const value = core.normaliseCountry(iso3);
    if (!value) return false;
    removeQueryParameter("country");
    write(global.localStorage, COUNTRY_KEY, value);
    setCountry({ iso3: value }, "manual", false, "manual-country");
    return true;
  }
  async function resetCountryPreference() {
    removeQueryParameter("country");
    remove(global.localStorage, COUNTRY_KEY);
    remove(global.sessionStorage, GEOLOCATION_ATTEMPT_KEY);
    remove(global.sessionStorage, AUTO_COUNTRY_KEY);
    setCountry(null, null, false, "country-detecting");
    return automaticCountry();
  }

  const ready = Promise.all([
    resolveCountry(),
    loadBoundaries().catch(() => []),
  ]).then(([, features]) => {
    snapshot.countries = features.map((feature) => ({
      iso2: String(feature.properties?.iso2 || "").toUpperCase() || null,
      iso3: core.normaliseCountry(feature.properties?.iso3 || feature.properties?.ISO_A3),
      name_ru: feature.properties?.name_ru || feature.properties?.name || feature.properties?.iso3,
      name_en: feature.properties?.name_en || feature.properties?.name || feature.properties?.iso3,
    })).filter((country) => country.iso3);
    return { ...snapshot, countries: [...snapshot.countries] };
  });
  function publicSnapshot() { return { ...snapshot, countries: [...snapshot.countries] }; }
  global.GIRUserContext = Object.freeze({
    initial: publicSnapshot(),
    ready,
    snapshot: publicSnapshot,
    setManualLanguage,
    resetLanguagePreference,
    setManualCountry,
    resetCountryPreference,
    detectCountry: automaticCountry,
  });
})(window);
