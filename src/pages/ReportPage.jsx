import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { submitReport, getMapPoints } from '../api/mapPoints'
import { isInsideVenezuela } from '../utils/geoValidation'

const REPORT_TYPES = [
  { value: 'shelter_full', icon: '🏠', title: 'Refugio lleno', description: 'Ya no tiene capacidad disponible', tone: 'green' },
  { value: 'hospital_closed', icon: '🏥', title: 'Hospital cerrado', description: 'Centro sin servicio o saturado', tone: 'blue' },
  { value: 'lack_of_supplies', icon: '💊', title: 'Faltan suministros', description: 'Agua, comida, medicinas o insumos', tone: 'purple' },
]

const TONE_STYLES = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
}

function useGPS() {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)

  const getCoords = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => setLoading(false),
      { timeout: 8000 }
    )
  }

  return { coords, loading, getCoords }
}

export default function ReportPage() {
  const location = useLocation()
  const { coords, loading: gpsLoading, getCoords } = useGPS()
  
  const [existingPoints, setExistingPoints] = useState([])
  
  useEffect(() => {
    // Cargar puntos existentes para el selector (Hospitales y Refugios)
    getMapPoints().then(res => {
      setExistingPoints(res.data?.data || [])
    }).catch(err => console.error("Error loading points for report:", err))
  }, [])

  const [form, setForm] = useState({
    report_type: location.state?.reportType || '',
    title: location.state?.pointName ? `Cambio en: ${location.state.pointName}` : '',
    description: '',
    address: '',
    contact_phone: '',
    photo: null,
    metadata: {}
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const selectedType = REPORT_TYPES.find(type => type.value === form.report_type)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo' && files?.[0]) {
      setForm(f => ({ ...f, photo: files[0] }))
      setPhotoPreview(URL.createObjectURL(files[0]))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }))
  }

  const setReportType = (value) => {
    setForm(f => ({ ...f, report_type: value, metadata: { ...f.metadata, map_point_id: null } }))
    if (errors.report_type) setErrors(e => ({ ...e, report_type: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.report_type) errs.report_type = 'Selecciona el tipo de reporte.'
    if (!form.title.trim()) errs.title = 'El título es obligatorio.'
    if (form.title.trim().length < 5) errs.title = 'El título debe tener al menos 5 caracteres.'
    
    // Validación de obligatoriedad de centro existente para reportes específicos
    if (['hospital_closed', 'shelter_full', 'lack_of_supplies'].includes(form.report_type) && !form.metadata?.map_point_id) {
      errs._general = 'Debes seleccionar un centro existente de la lista.'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    
    if (coords && !isInsideVenezuela(coords.lat, coords.lng)) {
      errs._general = 'La ubicación obtenida del GPS está fuera de Venezuela. No se puede crear el reporte.'
    }

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    const fd = new FormData()
    fd.append('report_type', form.report_type)
    fd.append('title', form.title)
    if (form.description) fd.append('description', form.description)
    if (form.address) fd.append('address', form.address)
    if (form.contact_phone) fd.append('contact_phone', form.contact_phone)
    if (form.photo) fd.append('photo', form.photo)
    if (coords) {
      fd.append('latitude', coords.lat)
      fd.append('longitude', coords.lng)
    }
    if (Object.keys(form.metadata).length > 0) {
      fd.append('metadata', JSON.stringify(form.metadata))
    }

    try {
      await submitReport(fd)
      setSuccess(true)
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {}
      setErrors(apiErrors)
      if (err.response?.status === 429) {
        setErrors({ _general: 'Has enviado demasiados reportes. Espera un momento.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-center text-white">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl">✓</div>
          <h1 className="text-3xl font-black">¡Reporte enviado!</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">Tu reporte fue recibido y será revisado por operadores. Gracias por ayudar a tu comunidad.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link to="/" className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Volver al inicio</Link>
            <button onClick={() => setSuccess(false)} className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-extrabold text-white" type="button">Nuevo reporte</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-950">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700">← Volver al inicio</Link>
          <div className="hidden text-right sm:block">
            <b className="block text-slate-900">RefuMap Venezuela</b>
            <span className="text-xs font-medium text-slate-500">Tu reporte salva vidas</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Reportar información</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">¿Qué quieres reportar?</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Completa solo lo necesario. Seleccionar la ubicación correcta ayuda a que los operadores verifiquen rápido.</p>
          </div>
          <div className="rounded-3xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
            <div className="flex font-bold"><span className="mr-2">✓</span> Todos los reportes son revisados</div>
            <div className="mt-1">Tu información privada no será publicada.</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Lado izquierdo: Tipos */}
          <div className="lg:col-span-5 xl:col-span-4">
            <h2 className="mb-4 text-lg font-black text-slate-800">1. Selecciona el tipo</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {REPORT_TYPES.map(type => {
                const isSelected = form.report_type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`flex flex-col items-start rounded-3xl border p-4 text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500/50 scale-[1.02]' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mb-3 text-3xl">{type.icon}</span>
                    <strong className="text-sm font-black text-slate-900">{type.title}</strong>
                    <span className="mt-1 text-xs font-medium text-slate-500 leading-tight">{type.description}</span>
                  </button>
                )
              })}
            </div>
            {errors.report_type && <p className="mt-3 text-sm font-bold text-red-600">{errors.report_type}</p>}
          </div>

          {/* Lado derecho: Formulario */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className={`rounded-[2rem] border bg-white p-5 sm:p-8 transition-opacity duration-300 ${!selectedType ? 'opacity-50 pointer-events-none' : 'opacity-100 shadow-xl shadow-slate-200/50 border-slate-200'}`}>
              
              {selectedType && (
                <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${TONE_STYLES[selectedType.tone]}`}>
                  <span className="text-2xl">{selectedType.icon}</span>
                  <div>
                    <h3 className="font-black">{selectedType.title}</h3>
                    <p className="text-xs font-medium opacity-80">Paso 2 de 3 · Datos principales</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Selector de Hospital/Refugio si aplica */}
                {(form.report_type === 'hospital_closed' || form.report_type === 'shelter_full' || form.report_type === 'lack_of_supplies') && (
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Selecciona el lugar existente <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-3">Este tipo de reporte se asocia directamente a un centro existente.</p>
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={form.metadata?.map_point_id || ''}
                      onChange={(e) => {
                        const pointId = e.target.value
                        const point = existingPoints.find(p => p.id == pointId)
                        if (point) {
                          setForm(f => ({
                            ...f,
                            metadata: { ...f.metadata, map_point_id: point.id },
                            title: `Reporte sobre: ${point.name}`,
                            address: point.address || ''
                          }))
                        } else {
                          setForm(f => ({
                            ...f,
                            metadata: { ...f.metadata, map_point_id: null },
                            title: ''
                          }))
                        }
                      }}
                    >
                      <option value="">Selecciona un lugar de la lista...</option>
                      {existingPoints
                        .filter(p => {
                          if (form.report_type === 'hospital_closed') return p.category?.slug === 'hospital'
                          if (form.report_type === 'shelter_full') return p.category?.slug === 'refugio'
                          return true
                        })
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.address}</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Título breve <span className="text-red-500">*</span></label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
                    placeholder="Ej: Vía bloqueada por árbol caído"
                  />
                  {errors.title && <p className="mt-2 text-xs font-bold text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-bold text-slate-700">Descripción útil</label>
                    <span className="text-xs text-slate-500 font-normal">(opcional)</span>
                  </div>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Agrega detalles: referencias, acceso, si hay heridos, qué se necesita..."
                  />
                  <div className="mt-1 text-right text-xs font-medium text-slate-400">{form.description.length}/1000</div>
                </div>

                {/* Pedimos GPS/Dirección SOLO para reportes que no sean de centros existentes */}
                {!(form.report_type === 'hospital_closed' || form.report_type === 'shelter_full' || form.report_type === 'lack_of_supplies') && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start rounded-2xl bg-slate-50 p-5 border border-slate-100">
                    <button
                      type="button" onClick={getCoords} disabled={gpsLoading}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                    >
                      {gpsLoading ? 'Ubicando...' : <>📍 Usar GPS</>}
                    </button>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-baseline mb-2">
                        <label className="text-sm font-bold text-slate-700">Dirección o referencia</label>
                        <span className="text-xs text-slate-500 font-normal">(opcional si usas GPS)</span>
                      </div>
                      <input
                        name="address" value={form.address} onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ej: Av. principal, frente a la escuela"
                      />
                      {coords && (
                        <p className="mt-2 text-xs font-bold text-green-600">✓ GPS obtenido: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-sm font-bold text-slate-700">Teléfono de contacto privado</label>
                      <span className="text-xs text-slate-500 font-normal">(opcional)</span>
                    </div>
                    <input
                      name="contact_phone" value={form.contact_phone} onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Ej: 0412-1234567"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-sm font-bold text-slate-700">Foto</label>
                      <span className="text-xs text-slate-500 font-normal">(opcional)</span>
                    </div>
                    <input
                      type="file" name="photo" accept="image/*" onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-1 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-200"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-green-50/50 p-5 border border-green-100 text-sm">
                  <strong className="block text-green-800">Tu privacidad es importante</strong>
                  <p className="mt-1 text-green-700/80">El reporte aparecerá como pendiente de verificación. Tus datos personales no se publican.</p>
                </div>

                {errors._general && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {errors._general}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !form.report_type}
                    className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {submitting ? 'Enviando...' : 'Enviar reporte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
