import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, token, user } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (token && user) {
      navigate(user.role === 'admin' ? '/refu-control/panel' : '/operadores', { replace: true })
    }
  }, [token, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      const u = useAuthStore.getState().user
      navigate(u?.role === 'admin' ? '/refu-control/panel' : '/operadores')
    }
  }

  return (
    <div className="min-h-screen bg-surface font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary p-8 text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">RefuMap</h1>
          <p className="text-white/80 text-sm mt-1">Panel de Operadores</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <Input
            label="Correo electrónico"
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="operador@refumap.local"
            required
          />

          <div className="relative">
            <Input
              label="Contraseña"
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" disabled={isLoading} className="mt-2">
            {isLoading ? '⟳ Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <p className="text-center mt-4 text-sm">
            <Link to="/" className="text-primary font-bold hover:underline">
              ← Volver al mapa público
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
