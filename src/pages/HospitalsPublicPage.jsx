import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHospitals, reportHospitalNeed } from '../api/hospitalNeeds'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'

export default function HospitalsPublicPage() {
  const [hospitals, setHospitals] = useState([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [reportForm, setReportForm] = useState({ needs: '', description: '', reporter_name: '', reporter_contact: '' })
  const [reportSuccess, setReportSuccess] = useState(null)
  const [reportError, setReportError] = useState(null)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const { data } = await getHospitals()
      setHospitals(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openReportModal = (hospital) => {
    setSelectedHospital(hospital)
    setReportForm({ needs: '', description: '', reporter_name: '', reporter_contact: '' })
    setReportSuccess(null)
    setReportError(null)
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setReporting(true)
    setReportError(null)
    try {
      await reportHospitalNeed({ ...reportForm, hospital_id: selectedHospital.id })
      setReportSuccess('Reporte enviado correctamente. Será validado pronto.')
      setReportForm({ needs: '', description: '', reporter_name: '', reporter_contact: '' })
      setTimeout(() => setSelectedHospital(null), 2500)
    } catch (err) {
      setReportError('Error al enviar el reporte. Inténtalo de nuevo.')
    } finally {
      setReporting(false)
    }
  }

  const renderNeedPriority = (priority) => {
    const badges = {
      low: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Baja' },
      medium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'Media' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', label: 'Alta' },
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Crítica' },
    }
    const b = badges[priority] || badges.medium
    return (
      <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border uppercase tracking-wider ml-2 ${b.bg} ${b.text} ${b.border}`}>
        {b.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    // Assuming status logic or operative status
    if (!status || status === 'active' || status === 'Operativo') return <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Operativo</span>
    if (status === 'Saturado') return <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-full border border-orange-200"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Saturado</span>
    if (status === 'Sin servicio' || status === 'closed') return <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Sin servicio</span>
    return <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {status}</span>
  }

  return (
    <div className="min-h-screen bg-surface pb-12">
      <PageHeader 
        title="Hospitales y Centros de Salud" 
        description="Consulta hospitales y centros de salud activos y sus necesidades actuales." 
        icon="🏥" 
        color="bg-sky-600 text-white" 
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} padding="p-0">
                <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
              </Card>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <EmptyState 
            icon="🏥"
            title="No hay hospitales registrados"
            description="Actualmente no hay hospitales en el sistema."
            actionText="Registrar hospital activo"
            actionTo="/reportar/hospital"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hospitals.map(hospital => {
              const opStatus = hospital.metadata?.operative_status || hospital.status
              return (
                <Card key={hospital.id} padding="p-6" className="flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🏥
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{hospital.name}</h3>
                        <p className="text-sm text-slate-500 mb-2">
                          📍 {hospital.address || 'Sin dirección registrada'}
                          {hospital.contact_phone && <><br/>📞 {hospital.contact_phone}</>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge(opStatus)}
                    {hospital.metadata?.hospital_type && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                        {hospital.metadata.hospital_type}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 flex-1 border border-slate-100 mt-2">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Necesidades Actuales</h4>
                    
                    {/* Necesidades dinámicas desde metadata si existen (reportadas por ciudadano) */}
                    {hospital.metadata?.needs && hospital.metadata.needs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {hospital.metadata.needs.map((need, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 border border-red-100 text-xs px-2 py-1 rounded-md font-medium">
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Necesidades formales reportadas (tabla hospital_needs) */}
                    {hospital.hospital_needs && hospital.hospital_needs.length > 0 ? (
                      <ul className="space-y-1 text-sm text-slate-600">
                        {hospital.hospital_needs.filter(n => n.status === 'active').map(need => (
                          <li key={need.id} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                            {need.need_type} {need.quantity ? <span className="text-slate-400 ml-1">({need.quantity})</span> : ''} 
                            {renderNeedPriority(need.priority)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      (!hospital.metadata?.needs || hospital.metadata.needs.length === 0) && (
                        <p className="text-sm text-slate-400 italic">No hay necesidades específicas registradas en este momento.</p>
                      )
                    )}
                  </div>
                  
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={() => navigate('/mapa', { state: { focusHospital: { id: hospital.id, lat: hospital.latitude, lng: hospital.longitude, name: hospital.name } } })}>
                      🗺️ Ver en mapa
                    </Button>
                    <Button variant="outline" className="border-sky-600 text-sky-600 hover:bg-sky-50" onClick={() => openReportModal(hospital)}>
                      Actualizar info
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal de Reporte */}
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 truncate pr-4">Reportar en {selectedHospital.name}</h3>
                <button onClick={() => setSelectedHospital(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300">
                  ✕
                </button>
              </div>
              
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                <p className="text-sm text-slate-500 mb-6">
                  ¿Estás en el hospital o tienes información verificada sobre lo que hace falta? Repórtalo aquí para actualizar su estado.
                </p>

                {reportSuccess && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">{reportSuccess}</div>}
                {reportError && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">{reportError}</div>}

                <form onSubmit={handleReportSubmit} className="flex flex-col gap-5">
                  <Input 
                    label="¿Qué necesitan? (Agua, insumos, médicos...)" 
                    value={reportForm.needs} 
                    onChange={e => setReportForm({...reportForm, needs: e.target.value})}
                    required
                  />
                  <Textarea 
                    label="Detalles adicionales (Opcional)" 
                    value={reportForm.description} 
                    onChange={e => setReportForm({...reportForm, description: e.target.value})}
                    rows="2"
                  />
                  <Input 
                    label="Tu Nombre (Opcional)" 
                    value={reportForm.reporter_name} 
                    onChange={e => setReportForm({...reportForm, reporter_name: e.target.value})}
                  />
                  
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <Button type="submit" variant="primary" fullWidth size="lg" disabled={reporting} className="bg-sky-600 hover:bg-sky-700">
                      {reporting ? 'Enviando...' : 'Enviar Reporte'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
