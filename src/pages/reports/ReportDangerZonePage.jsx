import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportDangerZone } from '../../api/mapPoints'
import { FormPageLayout } from '../../components/layout/FormPageLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import MapGeocoder from '../../components/map/MapGeocoder'
import L from 'leaflet'

// Corrección de iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    }
  })
  return position ? <Marker position={position} /> : null
}

export default function ReportDangerZonePage() {
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
    danger_type: 'Edificio colapsado',
    urgency_level: 4,
    description: '',
    reporter_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleMapClick = (latlng) => {
    setForm(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await reportDangerZone(form)
      setSuccess('Zona peligrosa reportada correctamente. Se verificará urgentemente.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar la zona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader 
        title="Reportar Zona Peligrosa" 
        description="Informa sobre áreas inestables, derrumbes inminentes o peligros mayores." 
        icon="⚠️" 
        color="bg-red-600 text-white" 
      />
      
      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm text-red-600">Situación de Riesgo</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Tipo de Peligro" name="danger_type" value={form.danger_type} onChange={handleChange} required>
              <option value="Edificio colapsado">Edificio colapsado</option>
              <option value="Estructura inestable">Estructura inestable</option>
              <option value="Fuga de gas">Fuga de gas</option>
              <option value="Cableado eléctrico">Cableado eléctrico expuesto</option>
              <option value="Derrumbe">Derrumbe</option>
              <option value="Inundación">Inundación</option>
              <option value="Zona insegura">Zona insegura</option>
              <option value="Otro">Otro</option>
            </Select>

            <Select label="Nivel de Urgencia" name="urgency_level" value={form.urgency_level} onChange={handleChange} required>
              <option value={1}>1 - Bajo (Riesgo potencial a futuro)</option>
              <option value={2}>2 - Medio (Evitar el área)</option>
              <option value={3}>3 - Alto (Daños materiales o heridos leves)</option>
              <option value={4}>4 - Crítico (Riesgo de vida inminente)</option>
            </Select>

            <div className="sm:col-span-2">
              <Input label="Título del Reporte" name="name" value={form.name} onChange={handleChange} placeholder="Ej. Fuga de gas fuerte en el edificio X" required />
            </div>
            <div className="sm:col-span-2">
              <Input label="Punto de Referencia" name="address" value={form.address} onChange={handleChange} placeholder="Ej. Esquina de la plaza Bolívar" required />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">Ubicación exacta en el mapa <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">Busca una dirección o haz clic en el mapa para ubicar con precisión la zona peligrosa.</p>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
                <MapContainer 
                  center={[parseFloat(form.latitude) || 10.4806, parseFloat(form.longitude) || -66.9036]} 
                  zoom={form.latitude !== '10.4806' ? 16 : 11} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <MapGeocoder setPosition={handleMapClick} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker 
                    position={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null} 
                    setPosition={handleMapClick} 
                  />
                </MapContainer>
              </div>
            </div>
          </div>

          <Textarea label="Descripción de lo que ocurre" name="description" value={form.description} onChange={handleChange} required placeholder="Detalles de la situación, heridos si los hay..." />

          <hr className="border-border my-2" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
              🔒 Datos Privados del Reportante
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 sm:mb-2">
            <Input label="Tu Nombre (Opcional - Privado)" name="reporter_name" value={form.reporter_name} onChange={handleChange} />
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:relative sm:p-0 sm:border-0 sm:shadow-none sm:bg-transparent z-50">
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Enviando Reporte...' : 'Enviar Reporte de Peligro'}
            </Button>
          </div>
        </form>
      </FormPageLayout>
    </>
  )
}
