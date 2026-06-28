import React, { useState } from 'react'
import { useMap } from 'react-leaflet'

export default function MapGeocoder({ setPosition }) {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      // Búsqueda restringida a Venezuela usando Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ve&limit=1`)
      const data = await res.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)
        
        // Centrar mapa
        map.flyTo([lat, lon], 15)
        
        // Colocar el marcador
        if (setPosition) {
          setPosition({ lat, lng: lon })
        }
      } else {
        alert('No se encontraron resultados en Venezuela para esa búsqueda.')
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      alert('Hubo un error al buscar la dirección.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute top-2 left-12 md:left-14 z-[1000] flex bg-white rounded-lg shadow-md overflow-hidden border border-slate-200" style={{ minWidth: '250px', maxWidth: '80%' }}>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
        placeholder="Buscar dirección en Venezuela..."
        className="px-3 py-2 text-sm outline-none w-full text-slate-700"
      />
      <button 
        onClick={handleSearch}
        disabled={loading}
        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border-l border-slate-200 flex items-center justify-center"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        )}
      </button>
    </div>
  )
}
