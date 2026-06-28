import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportRoadIssue } from '../../api/mapPoints'
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

export default function ReportRoadIssuePage() {
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
    issue_type: 'Vía cerrada',
    urgency_level: 2,
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
      await reportRoadIssue(form)
      setSuccess('Problema vial reportado correctamente. Pronto estará visible en el mapa.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar el problema en la vía')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader 
        title="Reportar Problema Vial" 
        description="Ayuda a otros conductores reportando bloqueos, puentes caídos o vías cerradas." 
        icon="🚧" 
        color="bg-amber-500 text-white" 
      />
      
      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm text-amber-600">Situación en la Vía</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Tipo de Problema" name="issue_type" value={form.issue_type} onChange={handleChange} required>
              <option value="Vía cerrada">Vía cerrada temporalmente</option>
              <option value="Vía bloqueada">Vía bloqueada por escombros/árbol</option>
              <option value="Puente caído">Puente caído o dañado</option>
              <option value="Asfalto hundido">Asfalto hundido / Hueco peligroso</option>
              <option value="Accidente">Accidente de tránsito grave</option>
              <option value="Punto de control">Punto de control imprevisto</option>
              <option value="Otro">Otro problema vial</option>
            </Select>

            <Select label="Impacto en el Tráfico" name="urgency_level" value={form.urgency_level} onChange={handleChange} required>
              <option value={1}>1 - Leve (Paso con lentitud)</option>
              <option value={2}>2 - Moderado (Paso restringido a un canal)</option>
              <option value={3}>3 - Severo (Solo pasan motos o vehículos de emergencia)</option>
              <option value={4}>4 - Total (Paso completamente bloqueado)</option>
            </Select>

            <div className="sm:col-span-2">
              <Input label="Referencia del problema" name="name" value={form.name} onChange={handleChange} placeholder="Ej. Tronco de árbol trancando la vía completa" required />
            </div>
            
            <div className="sm:col-span-2">
              <Input label="Punto de Referencia" name="address" value={form.address} onChange={handleChange} placeholder="Ej. Autopista Francisco Fajardo altura Altamira" required />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">Ubicación exacta en el mapa <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">Busca una dirección o haz clic en el mapa para ubicar con precisión el problema.</p>
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

          <Textarea label="Descripción Breve" name="description" value={form.description} onChange={handleChange} placeholder="Detalles sobre lo ocurrido, si hay vías alternas..." />

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
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading ? 'Enviando Reporte...' : 'Enviar Reporte de Vía'}
            </Button>
          </div>
        </form>
      </FormPageLayout>
    </>
  )
}
