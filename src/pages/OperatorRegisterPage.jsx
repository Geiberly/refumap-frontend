import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerOperator } from '../api/auth'
import { FormPageLayout } from '../components/layout/FormPageLayout'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import venezuelaData from '../utils/venezuelaData.json'

export default function OperatorRegisterPage() {
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    city: '', state: '', motivation: '',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [renderError, setRenderError] = useState(null);

  let statesList = [];
  let availableParishes = [];

  try {
    const rawData = venezuelaData?.default || venezuelaData;
    statesList = Array.isArray(rawData) ? rawData : [];

    const selectedStateData = statesList.find(s => s.state === form.state);
    if (selectedStateData && Array.isArray(selectedStateData.municipalities)) {
      availableParishes = selectedStateData.municipalities.flatMap(m => Array.isArray(m.parishes) ? m.parishes : []);
      availableParishes.sort();
    }
  } catch (err) {
    if (!renderError) setRenderError(err.toString());
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setForm({ ...form, state: value, city: '' }); 
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  if (renderError) {
    return <div className="p-10 text-red-500 font-bold">Error interno de React: {renderError}</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data } = await registerOperator(form)
      setSuccess(data.message)
      setForm({
        name: '', email: '', password: '', organization: '',
        city: '', state: '', motivation: '', coverage_area: ''
      })
      setTimeout(() => navigate('/login'), 4000)
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0]
        setError(firstError)
      } else {
        setError(err.response?.data?.message || 'Error al registrar operador')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormPageLayout title="Registro de Operador" subtitle="Únete como operador verificado para gestionar la ayuda.">
      {error && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">{error}</div>}
      {success && <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium">{success}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex items-start gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl shrink-0">
            <span className="text-primary">🤝</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-dark">Registro de Operador</h2>
            <p className="text-sm text-slate-500 mt-1">Únete como operador verificado para gestionar la ayuda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Nombre Completo" name="name" value={form.name} onChange={handleChange} required disabled={loading} />
          <Input label="Correo Electrónico" type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
          <Input label="Contraseña" type="password" name="password" value={form.password} onChange={handleChange} required minLength="8" disabled={loading} />

          <Select label="Estado" name="state" value={form.state} onChange={handleChange} required disabled={loading}>
            <option value="">Selecciona tu estado</option>
            {Array.isArray(statesList) && statesList.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
          </Select>
          <Select label="Parroquia" name="city" value={form.city} onChange={handleChange} required disabled={loading || !form.state}>
            <option value="">{form.state ? "Selecciona tu parroquia" : "Selecciona un estado primero"}</option>
            {Array.isArray(availableParishes) && availableParishes.map((p, idx) => <option key={`${p}-${idx}`} value={p}>{p}</option>)}
          </Select>
        </div>
        
        <Textarea label="Motivo para ser operador" name="motivation" value={form.motivation} onChange={handleChange} rows="3" disabled={loading} optional />

        <div className="text-xs text-slate-500 mt-2">
          * Al registrarte aceptas los términos de uso responsable y el tratamiento de datos para la gestión de la emergencia. Tu cuenta deberá ser verificada por un administrador antes de poder acceder al sistema.
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} className="mt-4 py-3">
          {loading ? 'Enviando solicitud...' : 'Enviar Solicitud de Operador'}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 mb-2">
            ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-bold hover:underline">Inicia sesión aquí</Link>
          </p>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </form>
    </FormPageLayout>
  )
}
