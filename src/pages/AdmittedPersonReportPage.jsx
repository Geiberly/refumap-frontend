import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { reportAdmittedPerson } from '../api/admittedPeople'
import { getHospitals } from '../api/hospitalNeeds'
import { FormPageLayout } from '../components/layout/FormPageLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'

export default function AdmittedPersonReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [form, setForm] = useState({
    full_name: '',
    cedula_type: 'V',
    cedula_number: '',
    alias: '',
    approx_age: '',
    sex: '',
    hospital_id: location.state?.prefilledHospitalId || '',
    status_general: 'ingresada',
    admitted_at: '',
    public_notes: '',
    source: 'Familiar/Ciudadano',
    reporter_name: '',
    reporter_contact: ''
  })
  
  const [hospitals, setHospitals] = useState([])
  const [loadingHospitals, setLoadingHospitals] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getHospitals().then(({ data }) => {
      setHospitals(data.data)
      setLoadingHospitals(false)
    }).catch(() => {
      setLoadingHospitals(false)
    })
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = { ...form }
      if (form.cedula_number) {
        payload.cedula = `${form.cedula_type}-${form.cedula_number}`
      } else {
        delete payload.cedula
      }
      
      await reportAdmittedPerson(payload)
      setSuccess('Persona registrada exitosamente. Ya es visible en las búsquedas públicas.')
      setTimeout(() => navigate('/search-person'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader 
        title="Reportar Persona Ingresada" 
        description="Registra a alguien que se encuentre en un hospital para que sus familiares puedan encontrarle." 
        icon="🛏️" 
        color="bg-purple-600 text-white" 
      />

      <FormPageLayout>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Centro Médico</h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="flex flex-col gap-2">
              {loadingHospitals ? <p className="text-slate-500 text-sm">Cargando hospitales...</p> :
                <Select label="Seleccionar Hospital" name="hospital_id" value={form.hospital_id} onChange={handleChange} required>
                  <option value="">-- Selecciona el hospital --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </Select>
              }
              
              <div className="text-sm text-slate-500 mt-1">
                ¿El hospital no aparece en la lista? Si desea agregar un nuevo hospital, debe hacerlo desde el mapa o desde el <a href="/reportar/hospital" className="text-purple-600 hover:underline">módulo de Hospital Operativo</a>.
              </div>
            </div>
          </div>

          <hr className="border-border my-2" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Datos del Paciente</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input label="Nombre Completo (o aproximado)" name="full_name" value={form.full_name} onChange={handleChange} required />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Cédula de Identidad (Opcional)</label>
              <div className="flex gap-2">
                <select 
                  name="cedula_type" 
                  value={form.cedula_type} 
                  onChange={handleChange} 
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                </select>
                <input 
                  type="text" 
                  name="cedula_number" 
                  value={form.cedula_number} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setForm({ ...form, cedula_number: val })
                  }} 
                  placeholder="Ej. 12345678" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <Input label="Apodo / Referencia" name="alias" value={form.alias} onChange={handleChange} />
            <Input label="Edad Aproximada" name="approx_age" value={form.approx_age} onChange={handleChange} />

            <Select label="Sexo" name="sex" value={form.sex} onChange={handleChange}>
              <option value="">No especificado</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </Select>

            <Select label="Estado del paciente" name="status_general" value={form.status_general} onChange={handleChange} required>
              <option value="ingresada">Ingresada</option>
              <option value="en_observacion">En Observación</option>
              <option value="trasladada">Trasladada a otro centro</option>
              <option value="dada_de_alta">Dada de Alta</option>
              <option value="sin_identificar">Sin Identificar (Inconsciente/Sin Docs)</option>
            </Select>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Fecha/Hora de Ingreso</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 min-h-[44px] bg-white border border-border rounded-lg shadow-sm text-base text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all" name="admitted_at" value={form.admitted_at} onChange={handleChange} min="2026-06-24T18:00" />
            </div>

            <div className="sm:col-span-2">
              <Textarea label="Notas Públicas" name="public_notes" value={form.public_notes} onChange={handleChange} placeholder="Ropa que vestía, señas particulares, acompañantes..." />
            </div>
          </div>

          <hr className="border-border my-2" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
              🔒 Datos Privados del Reportante
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 sm:mb-2">
            <Input label="Tu Nombre (Privado)" name="reporter_name" value={form.reporter_name} onChange={handleChange} />
            <Input label="Tu Contacto (Privado)" name="reporter_contact" value={form.reporter_contact} onChange={handleChange} />
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:relative sm:p-0 sm:border-0 sm:shadow-none sm:bg-transparent z-50">
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading ? 'Registrando...' : 'Registrar Persona'}
            </Button>
          </div>
        </form>
      </FormPageLayout>
    </>
  )
}
