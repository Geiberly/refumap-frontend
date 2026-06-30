import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportHelpPoint, getMapPoints } from '../../api/mapPoints'
import { FormPageLayout } from '../../components/layout/FormPageLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CheckboxPill } from '../../components/ui/CheckboxPill'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import MapGeocoder from '../../components/map/MapGeocoder'
import L from 'leaflet'

// Corrección de iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const existingHelpPointIcon = L.divIcon({
  html: '📦',
  className: 'text-2xl drop-shadow-md bg-white rounded-full p-1 flex items-center justify-center border-2 border-slate-200',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
})

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    }
  })
  return position ? <Marker position={position} /> : null
}

export default function ReportHelpPointPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialLat = searchParams.get('lat') || '10.4806'
  const initialLng = searchParams.get('lng') || '-66.9036'

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: initialLat, // Default Caracas or from URL
    longitude: initialLng,
    help_types: [],
    description: '',
    reporter_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [existingHelpPoints, setExistingHelpPoints] = useState([])

  useEffect(() => {
    getMapPoints().then(res => {
      const points = res.data?.data || []
      setExistingHelpPoints(points.filter(p => p.category?.slug === 'centro-acopio'))
    }).catch(err => console.error("Error loading help points:", err))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleMapClick = (latlng) => {
    setForm(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }))
  }


  const handleArrayChange = (field, item, checked) => {
    setForm(prev => {
      const current = prev[field]
      return {
        ...prev,
        [field]: checked ? [...current, item] : current.filter(i => i !== item)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    // Validar que al menos haya un tipo de ayuda seleccionado
    if (form.help_types.length === 0) {
      setError('Debes seleccionar al menos un tipo de ayuda.')
      setLoading(false)
      return
    }

    try {
      await reportHelpPoint(form)
      setSuccess('Centro de acopio reportado correctamente. Se verificará antes de aparecer en el mapa.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar el centro de acopio')
    } finally {
      setLoading(false)
    }
  }

  const helpTypesList = [
    { value: 'comida', label: '🍽️ Comida' },
    { value: 'agua', label: '💧 Agua Potable' },
    { value: 'medicinas', label: '💊 Medicinas / Insumos' },
    { value: 'carga-electrica', label: '🔌 Carga Eléctrica' },
    { value: 'ropa', label: '👕 Ropa / Abrigo' },
    { value: 'otros', label: '📦 Otros Suministros' }
  ]

  return (
    <>
      <PageHeader 
        title="Registrar Centro de Acopio" 
        description="Informa sobre lugares donde están repartiendo suministros a la población." 
        icon="📦" 
        color="bg-emerald-600 text-white" 
      />
      
      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Información de la Ayuda</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-3">¿Qué están ofreciendo? <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {helpTypesList.map(type => (
                  <CheckboxPill 
                    key={type.value} 
                    label={type.label} 
                    checked={form.help_types.includes(type.value)} 
                    onChange={(e) => handleArrayChange('help_types', type.value, e.target.checked)} 
                  />
                ))}
              </div>
            </div>

            <Input label="Nombre del Lugar / Organización" name="name" value={form.name} onChange={handleChange} placeholder="Ej. Acopio Plaza Bolívar" required />
            
            <div className="sm:col-span-2">
              <Input label="Punto de Referencia" name="address" value={form.address} onChange={handleChange} hint="Puedes escribir una dirección aproximada o una referencia cercana." required />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">Ubicación exacta en el mapa <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">Busca una dirección o haz clic en el mapa para ubicar con precisión el centro de acopio.</p>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
                <MapContainer 
                  center={[parseFloat(form.latitude) || 10.4806, parseFloat(form.longitude) || -66.9036]} 
                  zoom={form.latitude !== '10.4806' ? 16 : 11} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <MapGeocoder setPosition={handleMapClick} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Mostrar centros de acopio que ya existen en el sistema */}
                  {existingHelpPoints.map(p => (
                    <Marker 
                      key={p.id} 
                      position={[p.latitude, p.longitude]} 
                      icon={existingHelpPointIcon} 
                    >
                      <Popup>
                        <div className="font-sans">
                          <strong className="block text-slate-900">{p.name}</strong>
                          <span className="text-xs text-slate-600 block mt-1">{p.address}</span>
                          <span className="text-xs font-bold text-red-500 block mt-2 border-t border-red-100 pt-1">Este centro ya existe</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* El marcador donde el usuario hace clic para el NUEVO centro */}
                  <LocationPicker 
                    position={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null} 
                    setPosition={handleMapClick} 
                  />
                </MapContainer>
              </div>
            </div>
          </div>

          <Textarea label="Detalles de la Ayuda" name="description" value={form.description} onChange={handleChange} placeholder="Ej. Hay 200 raciones de comida caliente, solo traigan envase." optional hint="Agrega detalles que ayuden a verificar el reporte." />

          <hr className="border-border my-2" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
              🔒 Datos Privados del Reportante
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 sm:mb-2">
            <Input label="Tu Nombre (Privado)" name="reporter_name" value={form.reporter_name} onChange={handleChange} optional />
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:relative sm:p-0 sm:border-0 sm:shadow-none sm:bg-transparent z-50">
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Enviando Reporte...' : 'Enviar Reporte de Ayuda'}
            </Button>
          </div>
        </form>
      </FormPageLayout>
    </>
  )
}
