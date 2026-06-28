// Bounds operativos de Venezuela continental e islas principales.
// Bounding box intencional: es rápido, robusto y se replica en backend.
export const VENEZUELA_BOUNDS = {
  minLat: 0.5,
  maxLat: 12.8,
  minLng: -73.5,
  maxLng: -59.5,
};

// Centro visual más estable para iniciar el mapa enfocado en Venezuela.
export const VENEZUELA_CENTER = [7.0, -66.5];

export const VENEZUELA_INITIAL_ZOOM = 6;
export const VENEZUELA_MIN_ZOOM = 6;
export const VENEZUELA_MAX_ZOOM = 18;

export const VENEZUELA_LEAFLET_BOUNDS = [
  [VENEZUELA_BOUNDS.minLat, VENEZUELA_BOUNDS.minLng],
  [VENEZUELA_BOUNDS.maxLat, VENEZUELA_BOUNDS.maxLng],
];

export function parseCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidLatLng(lat, lng) {
  return parseCoordinate(lat) !== null && parseCoordinate(lng) !== null;
}

export function isInsideVenezuela(lat, lng) {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);

  if (parsedLat === null || parsedLng === null) {
    return false;
  }

  return (
    parsedLat >= VENEZUELA_BOUNDS.minLat &&
    parsedLat <= VENEZUELA_BOUNDS.maxLat &&
    parsedLng >= VENEZUELA_BOUNDS.minLng &&
    parsedLng <= VENEZUELA_BOUNDS.maxLng
  );
}

export function normalizeLatLng(lat, lng) {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);

  if (parsedLat === null || parsedLng === null) return null;
  if (!isInsideVenezuela(parsedLat, parsedLng)) return null;

  return { lat: parsedLat, lng: parsedLng };
}

export function getPointLatLng(point) {
  if (!point) return null;
  return normalizeLatLng(point.latitude, point.longitude);
}
