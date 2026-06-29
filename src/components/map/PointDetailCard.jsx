import React from 'react'
import useMapStore from '../../store/useMapStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { buildGoogleMapsSearchUrl, buildGoogleMapsDirectionsUrl, buildOpenStreetMapUrl } from '../../utils/mapLinks'

const SERVICE_ICONS = {
  has_water:          { icon: '💧', label: 'Agua' },
  has_food:           { icon: '🍽️', label: 'Comida' },
  has_medicine:       { icon: '💊', label: 'Medicinas' },
  has_power_charging: { icon: '🔌', label: 'Carga' },
  accepts_children:   { icon: '👶', label: 'Niños' },
  accepts_elderly:    { icon: '🧓', label: 'Adultos mayores' },
  accepts_pets:       { icon: '🐾', label: 'Mascotas' },
}

function formatDate(dateStr) {
  if (!dateStr) return 'No registrado'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function PointDetailCard({ point, distance, onClose }) {
  const navigate = useNavigate()

  if (!point) return null

  const services = Object.entries(SERVICE_ICONS).filter(([key]) => point[key])
  
  const googleMapsUrl = buildGoogleMapsSearchUrl(point)
  const directionsUrl = buildGoogleMapsDirectionsUrl(point)
  const osmUrl = buildOpenStreetMapUrl(point)

  const handleReport = () => {
    navigate('/reportar', {
      state: { reportType: 'incorrect_info', pointName: point.name }
    })
  }

  const handleRegisterPerson = () => {
    navigate('/report-person', { state: { prefilledHospitalId: point.id, prefilledHospitalName: point.name } })
  }
  
  const handleSearchPerson = () => {
    navigate('/search-person', { state: { prefilledHospitalId: point.id, prefilledHospitalName: point.name } })
  }

  // Determine colors based on point category
  const iconBg = point.category?.color ? point.category.color + '20' : '#e0e7ff'
  const iconColor = point.category?.color || '#4f46e5'

  return (
    <div className="bg-white p-5 sm:p-6 flex flex-col sm:flex-row gap-6 w-full max-h-[85vh] sm:max-h-none overflow-y-auto">
      
      {/* Content Section */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        
        {/* Header Row */}
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {point.category?.icon || '📍'}
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {point.name}
              </h2>
              {/* Badge "Con cupo" or status */}
              {point.status === 'active' && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">Operativo</span>}
              {point.status === 'verified' && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1"><span className="text-sm leading-none">✅</span> Verificado</span>}
              {point.capacity_available > 0 && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">Con cupo</span>}
              {point.capacity_available === 0 && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">Lleno</span>}
              {point.status === 'danger' && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">Peligro</span>}
            </div>
            
            <p className="text-sm text-slate-500 truncate">
              {point.address || 'Sin dirección registrada'}
              {distance && ` · A ${distance}`}
            </p>
          </div>
        </div>

        {/* Info Rows */}
        <div className="flex flex-col gap-3 mt-1">
          
          {/* Capacity */}
          {(point.capacity_total != null || point.capacity_available != null) && (
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
              {point.capacity_total != null && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <span className="text-slate-400">👥</span> Capacidad: {point.capacity_total}
                </div>
              )}
              {point.capacity_available != null && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <span className="text-slate-400">👤</span> Disponibles: {point.capacity_available}
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
              {services.map(([key, { icon, label }]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{icon}</span> {label}
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {point.notes && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {point.notes}
            </p>
          )}

          {/* Unverified Warning */}
          {(point.status === 'unverified' || point.status === 'no_verificado') && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
              <p className="text-sm text-amber-800 font-semibold flex items-start gap-2">
                <span className="text-lg leading-none">⚠️</span>
                Este punto aún no ha sido verificado. Confirma su estado antes de trasladarte.
              </p>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <span>Actualizado {formatDate(point.updated_at)} por</span>
            <span className="font-semibold text-slate-700">
              {point.source === 'operator' ? 'Operador' : point.source === 'official' ? 'API Oficial' : 'Ciudadano'}
            </span>
            {(point.source === 'operator' || point.source === 'official') && (
              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col gap-3 sm:w-56 shrink-0 justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
        
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            Cómo llegar
          </a>
        )}

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors"
          >
            Ver en Google Maps
          </a>
        )}

        {osmUrl && (
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Ver en OpenStreetMap
          </a>
        )}

        {point.category?.slug === 'hospital' && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
            <Button 
              variant="primary" 
              fullWidth 
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 text-xs"
              onClick={handleSearchPerson}
            >
              🔍 Buscar persona ingresada
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 border-purple-200 text-xs"
              onClick={handleRegisterPerson}
            >
              📝 Registrar persona
            </Button>
          </div>
        )}
        
        <Button 
          variant="secondary" 
          fullWidth 
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 border-0 shadow-none"
          onClick={handleReport}
        >
          Reportar cambio
        </Button>
      </div>

    </div>
  )
}
