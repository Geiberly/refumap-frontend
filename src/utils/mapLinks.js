export function buildGoogleMapsSearchUrl(point) {
  const lat = Number(point.latitude)
  const lng = Number(point.longitude)

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  if (point.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}`
  }

  return null
}

export function buildGoogleMapsDirectionsUrl(point) {
  const lat = Number(point.latitude)
  const lng = Number(point.longitude)

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  if (point.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.address)}`
  }

  return null
}

export function buildOpenStreetMapUrl(point) {
  const lat = Number(point.latitude)
  const lng = Number(point.longitude)

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
  }

  return null
}
