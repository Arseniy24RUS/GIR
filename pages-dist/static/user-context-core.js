(function exposeGIRUserContextCore(global) {
  "use strict";

  function normaliseLanguage(value) {
    const text = String(value || "").trim().replace(/_/g, "-").toLowerCase();
    const primary = text.split("-", 1)[0];
    return /^[a-z]{2,3}$/.test(primary) ? primary : "";
  }

  function deviceLanguage(navigatorLike) {
    const supplied = Array.isArray(navigatorLike?.languages) ? navigatorLike.languages : [];
    const candidates = [...supplied, navigatorLike?.language];
    return candidates.some((value) => normaliseLanguage(value) === "ru") ? "ru" : "en";
  }

  function resolveLanguage({ queryLanguage, storedLanguage, navigatorLike } = {}) {
    const query = normaliseLanguage(queryLanguage);
    if (query === "ru" || query === "en") return { value: query, source: "url" };
    const stored = normaliseLanguage(storedLanguage);
    if (stored === "ru" || stored === "en") return { value: stored, source: "manual" };
    return { value: deviceLanguage(navigatorLike), source: "device" };
  }

  function normaliseCountry(value) {
    const code = String(value || "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
  }

  function unwrapLongitude(longitude, reference) {
    let value = Number(longitude);
    while (value - reference > 180) value -= 360;
    while (value - reference < -180) value += 360;
    return value;
  }

  function pointInRing(point, ring) {
    const x = Number(point[0]);
    const y = Number(point[1]);
    const longitudes = ring.map((coordinate) => Number(coordinate[0]));
    const crossesAntimeridian = Math.max(...longitudes) - Math.min(...longitudes) > 180;
    const longitude = (value) => crossesAntimeridian ? unwrapLongitude(value, x) : Number(value);
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = longitude(ring[i][0]);
      const yi = Number(ring[i][1]);
      const xj = longitude(ring[j][0]);
      const yj = Number(ring[j][1]);
      const intersects = (yi > y) !== (yj > y)
        && x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function pointInPolygon(point, polygon) {
    if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
    return !polygon.slice(1).some((hole) => pointInRing(point, hole));
  }

  function geometryContains(point, geometry) {
    if (!geometry) return false;
    if (geometry.type === "Polygon") return pointInPolygon(point, geometry.coordinates);
    if (geometry.type === "MultiPolygon") return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
    return false;
  }

  function countryAtCoordinates(longitude, latitude, features) {
    const point = [Number(longitude), Number(latitude)];
    if (!point.every(Number.isFinite)) return null;
    const match = (features || []).find((feature) => geometryContains(point, feature.geometry));
    if (!match) return null;
    const iso3 = normaliseCountry(match.properties?.iso3 || match.properties?.ISO_A3);
    if (!iso3) return null;
    return {
      iso2: String(match.properties?.iso2 || "").toUpperCase() || null,
      iso3,
    };
  }

  global.GIRUserContextCore = Object.freeze({
    normaliseLanguage,
    deviceLanguage,
    resolveLanguage,
    normaliseCountry,
    pointInRing,
    geometryContains,
    countryAtCoordinates,
  });
})(window);
