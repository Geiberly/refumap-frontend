import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportHospital, getMapPoints } from '../../api/mapPoints'
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

const existingHospitalIcon = L.divIcon({
  html: '🏥',
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

export default function ReportHospitalPage() {
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
    contact_phone: '',
    hospital_type: 'Hospital público',
    operative_status: 'Operativo',
    reporter_name: '',
    notes: '',
    services: [],
    needs: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [existingHospitals, setExistingHospitals] = useState([])

  useEffect(() => {
    getMapPoints().then(res => {
      const points = res.data?.data || []
      setExistingHospitals(points.filter(p => p.category?.slug === 'hospital'))
    }).catch(err => console.error("Error loading hospitals:", err))
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
    try {
      await reportHospital(form)
      setSuccess('Hospital reportado correctamente. Aparecerá en el mapa tras validación.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar hospital')
    } finally {
      setLoading(false)
    }
  }

  const servicesList = ['Emergencia', 'Pediatría', 'Cirugía', 'Trauma', 'Ambulancia', 'Primeros auxilios', 'Atención general']
  const needsList = ['Agua', 'Comida', 'Medicinas', 'Insumos médicos', 'Guantes', 'Gasas', 'Tapabocas', 'Suero', 'Sangre', 'Camillas', 'Planta eléctrica', 'Combustible', 'Voluntarios']

  return (
    <>
      <PageHeader 
        title="Reportar Hospital Activo" 
        description="Registra un centro de salud que esté prestando servicio durante la emergencia." 
        icon="🏥" 
        color="bg-primary text-white" 
      />
      
      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Datos del Hospital</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Nombre del Hospital / Clínica" name="name" value={form.name} onChange={handleChange} placeholder="Ej. Hospital Central" required />
            <Input label="Punto de Referencia" name="address" value={form.address} onChange={handleChange} placeholder="Ej. Av. Principal" required />
            
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">Ubicación exacta en el mapa <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">Busca una dirección o haz clic en el mapa para ubicar con precisión el hospital.</p>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
                <MapContainer 
                  center={[parseFloat(form.latitude) || 10.4806, parseFloat(form.longitude) || -66.9036]} 
                  zoom={form.latitude !== '10.4806' ? 16 : 11} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <MapGeocoder setPosition={handleMapClick} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Mostrar hospitales que ya existen en el sistema */}
                  {existingHospitals.map(h => (
                    <Marker 
                      key={h.id} 
                      position={[h.latitude, h.longitude]} 
                      icon={existingHospitalIcon} 
                    >
                      <Popup>
                        <div className="font-sans">
                          <strong className="block text-slate-900">{h.name}</strong>
                          <span className="text-xs text-slate-600 block mt-1">{h.address}</span>
                          <span className="text-xs font-bold text-red-500 block mt-2 border-t border-red-100 pt-1">Este hospital ya existe</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* El marcador donde el usuario hace clic para el NUEVO hospital */}
                  <LocationPicker 
                    position={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null} 
                    setPosition={handleMapClick} 
                  />
                </MapContainer>
              </div>
            </div>

            <Select label="Tipo" name="hospital_type" value={form.hospital_type} onChange={handleChange} required>
              <option value="Hospital público">Hospital público</option>
              <option value="Clínica privada">Clínica privada</option>
              <option value="Ambulatorio">Ambulatorio</option>
              <option value="Centro asistencial">Centro asistencial</option>
              <option value="Punto médico temporal">Punto médico temporal</option>
            </Select>

            <Select label="Estado Operativo" name="operative_status" value={form.operative_status} onChange={handleChange} required>
              <option value="Operativo">🟢 Operativo</option>
              <option value="Parcialmente operativo">🟡 Parcialmente operativo</option>
              <option value="Saturado">🟠 Saturado (Poco cupo)</option>
              <option value="Sin servicio">🔴 Sin servicio (No ir)</option>
              <option value="Desconocido">⚪ Desconocido</option>
            </Select>
            
            <div className="sm:col-span-2">
              <Input label="Teléfono de Contacto (Si lo conoces)" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-3">Servicios Disponibles</label>
            <div className="flex flex-wrap gap-2">
              {servicesList.map(service => (
                <CheckboxPill 
                  key={service} 
                  label={service} 
                  checked={form.services.includes(service)} 
                  onChange={(e) => handleArrayChange('services', service, e.target.checked)} 
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-3">Necesidades Actuales <span className="text-xs text-slate-500 font-normal ml-1">(¿Qué les falta?)</span></label>
            <div className="flex flex-wrap gap-2">
              {needsList.map(need => (
                <CheckboxPill 
                  key={need} 
                  label={need} 
                  checked={form.needs.includes(need)} 
                  onChange={(e) => handleArrayChange('needs', need, e.target.checked)} 
                />
              ))}
            </div>
          </div>

          <Textarea label="Notas o Comentarios Adicionales" name="notes" value={form.notes} onChange={handleChange} placeholder="Médicos voluntarios disponibles, rutas de acceso habilitadas..." />

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

          {/* Fixed bottom bar for mobile */}
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:relative sm:p-0 sm:border-0 sm:shadow-none sm:bg-transparent z-50">
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
              {loading ? 'Enviando Reporte...' : 'Enviar Reporte de Hospital'}
            </Button>
          </div>
        </form>
      </FormPageLayout>
    </>
  )
}
