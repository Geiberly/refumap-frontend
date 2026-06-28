import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, token, user } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/refu-control/panel', { replace: true })
      } else {
        navigate('/operadores', { replace: true })
      }
    }
  }, [token, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      const u = useAuthStore.getState().user
      if (u?.role === 'admin') {
        navigate('/refu-control/panel')
      } else {
        navigate('/operadores')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 relative">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="text-4xl mb-3 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">🛡️</div>
          <h1 className="text-white text-2xl font-black tracking-tight">Acceso Clasificado</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Panel de Control Estratégico</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2">
              <span className="text-lg leading-none">⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Identificación</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@refumap.local"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Credenciales</label>
            <div className="relative">
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verificando...' : 'Autenticar'}
            {!isLoading && <span className="opacity-70 text-xs">→</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
