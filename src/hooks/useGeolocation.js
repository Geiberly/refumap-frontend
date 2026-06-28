import { useCallback, useState } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setIsLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible.')
            break
          case err.TIMEOUT:
            setError('Tiempo de espera agotado.')
            break
          default:
            setError('Error obteniendo ubicación.')
        }
        setIsLoading(false)
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true },
    )
  }, [])

  // Calcular distancia en km entre dos coordenadas (Haversine)
  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  const getDistanceFromMe = useCallback(
    (lat, lng) => {
      if (!location) return null
      const d = getDistance(location.lat, location.lng, lat, lng)
      if (d < 1) return `${Math.round(d * 1000)}m`
      return `${d.toFixed(1)}km`
    },
    [getDistance, location],
  )

  return { location, error, isLoading, getLocation, getDistanceFromMe }
}
