import React, { useEffect, useState } from 'react'

const DEFAULT_CENTER = [10.48, -66.9]

export default function WeatherWidget({ center = DEFAULT_CENTER }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const lat = center[0]
        const lng = center[1]
        // Open-Meteo API sin key
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`)
        const data = await res.json()
        if (isMounted && data.current) {
          setWeather(data.current)
        }
      } catch (err) {
        // Fallback silencioso
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchWeather()
    return () => { isMounted = false }
  }, [center])

  if (!weather && !loading) return null

  // WMO Weather interpretation codes
  const getWeatherInfo = (code) => {
    if (code === 0) return { label: 'Despejado', icon: '☀️' }
    if (code === 1 || code === 2 || code === 3) return { label: 'Nublado', icon: '⛅' }
    if (code >= 45 && code <= 48) return { label: 'Niebla', icon: '🌫️' }
    if (code >= 51 && code <= 67) return { label: 'Lluvia', icon: '🌧️' }
    if (code >= 71 && code <= 77) return { label: 'Frío extremo', icon: '❄️' }
    if (code >= 80 && code <= 82) return { label: 'Aguaceros', icon: '🌧️' }
    if (code >= 95 && code <= 99) return { label: 'Tormenta', icon: '⛈️' }
    return { label: 'Desconocido', icon: '☁️' }
  }

  const info = weather ? getWeatherInfo(weather.weather_code) : { label: 'Cargando...', icon: '⌛' }
  const temp = weather ? `${Math.round(weather.temperature_2m)}°` : '--'

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
        {info.icon}
      </span>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <b className="text-sm font-black text-slate-800">{temp}</b>
          <span className="text-[11px] font-bold text-slate-500">{info.label}</span>
        </div>
        <p className="text-[10px] font-medium text-slate-400">En la zona mostrada</p>
      </div>
    </div>
  )
}
