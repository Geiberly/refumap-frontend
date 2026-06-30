import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportRefuge, getMapPoints } from '../../api/mapPoints'
import { FormPageLayout } from '../../components/layout/FormPageLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Input } from '../../components/ui/Input'
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

const existingRefugeIcon = L.divIcon({
  html: '🏠',
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

export default function ReportRefugePage() {
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
    capacity_total: '',
    accepts_children: false,
    accepts_elderly: false,
    accepts_pets: false,
    needs: '',
    contact_phone: '',
    reporter_name: '',
    reporter_contact: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [existingRefuges, setExistingRefuges] = useState([])

  useEffect(() => {
    getMapPoints().then(res => {
      const points = res.data?.data || []
      setExistingRefuges(points.filter(p => p.category?.slug === 'refugio'))
    }).catch(err => console.error("Error loading refuges:", err))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleMapClick = (latlng) => {
    setForm(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await reportRefuge(form)
      setSuccess('Refugio reportado correctamente. Aparecerá en el mapa tras la verificación.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar refugio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader 
        title="Reportar Refugio Activo" 
        description="Registro de espacios seguros que brindan resguardo a la población." 
        icon="🏠" 
        color="bg-blue-600 text-white" 
      />
      
      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-success/10 text-success rounded-xl border border-success/20 font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Alerta de Éxito o Info */}
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl text-success">
            <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs shrink-0">✓</div>
            <p className="text-sm font-medium">Tu reporte ayuda a que más personas encuentren lugares seguros.</p>
          </div>

        {/* SECCIÓN 1: DATOS DEL REFUGIO */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="font-bold text-primary-dark uppercase tracking-wider text-xs">Datos del Refugio</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Input 
              label="Nombre del Refugio" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Ej. Escuela Básica Simón Bolívar" 
              required 
            />
            <Input 
              label="Punto de Referencia" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              placeholder="Ej. Calle 5 con Av. Bolívar, al lado de la plaza" 
              hint="Puedes escribir una dirección aproximada o una referencia cercana."
              required 
            />
            
            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-slate-700 block mb-2">Ubicación exacta en el mapa <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">Busca una dirección o haz clic en el mapa para ubicar con precisión el refugio.</p>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
                <MapContainer 
                  center={[parseFloat(form.latitude) || 10.4806, parseFloat(form.longitude) || -66.9036]} 
                  zoom={form.latitude !== '10.4806' ? 16 : 11} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <MapGeocoder setPosition={handleMapClick} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Mostrar refugios que ya existen en el sistema */}
                  {existingRefuges.map(r => (
                    <Marker 
                      key={r.id} 
                      position={[r.latitude, r.longitude]} 
                      icon={existingRefugeIcon} 
                    >
                      <Popup>
                        <div className="font-sans">
                          <strong className="block text-slate-900">{r.name}</strong>
                          <span className="text-xs text-slate-600 block mt-1">{r.address}</span>
                          <span className="text-xs font-bold text-red-500 block mt-2 border-t border-red-100 pt-1">Este refugio ya existe</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* El marcador donde el usuario hace clic para el NUEVO refugio */}
                  <LocationPicker 
                    position={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null} 
                    setPosition={handleMapClick} 
                  />
                </MapContainer>
              </div>
            </div>

            <Input 
              type="number" 
              label="Capacidad Aproximada (Personas)" 
              name="capacity_total" 
              value={form.capacity_total} 
              onChange={handleChange} 
              placeholder="Ej. 80" 
              optional
            />
            <Input 
              label="Teléfono de Contacto" 
              name="contact_phone" 
              value={form.contact_phone} 
              onChange={handleChange} 
              placeholder="Ej. 0412-1234567" 
              hint="Opcional, pero útil para confirmar información."
              optional
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">¿A quiénes aceptan? <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                <CheckboxPill label="Niños" icon="🧒" name="accepts_children" checked={form.accepts_children} onChange={handleChange} />
                <CheckboxPill label="Adultos Mayores" icon="🧓" name="accepts_elderly" checked={form.accepts_elderly} onChange={handleChange} />
                <CheckboxPill label="Mascotas" icon="🐾" name="accepts_pets" checked={form.accepts_pets} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Textarea 
                label="¿Necesitan algo actualmente?" 
                name="needs" 
                value={form.needs} 
                onChange={handleChange} 
                placeholder="Ej. Agua, colchonetas, comida, medicinas..." 
                hint="Selecciona solo lo que realmente se necesita."
                optional
                rows="2"
              />
              <div className="mt-3 flex flex-col gap-2">
                {[
                  { 
                    category: '💧 Básicos', 
                    items: ['Agua potable', 'Comida no perecedera', 'Alimentos enlatados']
                  },
                  { 
                    category: '💊 Primeros Auxilios', 
                    items: ['Acetaminofén', 'Ibuprofeno', 'Alcohol', 'Gasas', 'Vendas', 'Antibióticos', 'Suero oral']
                  },
                  { 
                    category: '🛏️ Insumos de Refugio', 
                    items: ['Colchonetas', 'Sábanas', 'Cobijas', 'Linternas', 'Pilas', 'Artículos de higiene']
                  },
                  { 
                    category: '👶 Bebés y Niños', 
                    items: ['Pañales', 'Fórmula infantil', 'Toallitas húmedas', 'Ropa de niños']
                  }
                ].map(group => (
                  <details key={group.category} className="group border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <summary className="text-[11px] font-bold text-slate-700 uppercase tracking-wider p-2.5 cursor-pointer hover:bg-slate-50 select-none list-none flex justify-between items-center">
                      {group.category}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-open:rotate-180 transition-transform"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </summary>
                    <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
                      {group.items.map(need => (
                        <button 
                          key={need} 
                          type="button" 
                          onClick={() => {
                            setForm(prev => {
                              const current = prev.needs.trim();
                              const newNeeds = current ? `${current}, ${need}` : need;
                              return { ...prev, needs: newNeeds };
                            })
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 text-[11px] rounded-full transition-colors border border-slate-200 shadow-sm font-medium"
                        >
                          + {need}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
             <Textarea 
                label="Notas o Comentarios Adicionales" 
                name="notes" 
                value={form.notes} 
                onChange={handleChange} 
                placeholder="Información adicional que pueda ser útil..." 
                optional
                rows="3"
                maxLength={500}
              />
              <span className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
                {form.notes.length}/500
              </span>
          </div>
        </div>

        <hr className="border-slate-100 my-2" />

        {/* SECCIÓN 2: DATOS PRIVADOS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <h3 className="font-bold text-primary-dark uppercase tracking-wider text-xs">Datos Privados del Reportante</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 sm:mb-4">
            <Input 
              label="Tu Nombre (Privado)" 
              name="reporter_name" 
              value={form.reporter_name} 
              onChange={handleChange} 
              placeholder="Ej. María González" 
              optional
            />
            <Input 
              label="Tu Contacto (Privado)" 
              name="reporter_contact" 
              value={form.reporter_contact} 
              onChange={handleChange} 
              placeholder="Ej. 0412-7654321" 
              optional
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
            />
          </div>
        </div>

        {/* Botón y volver */}
        <div className="flex flex-col gap-4 mt-2">
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            size="lg" 
            disabled={loading} 
            className="shadow-md py-3 text-base flex items-center justify-center gap-2 border-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            {loading ? 'Enviando...' : 'Enviar Reporte de Refugio'}
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => navigate(-1)} className="text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
              ← Volver al inicio
            </button>
          </div>
        </div>

      </form>
    </FormPageLayout>
    </>
  )
}
