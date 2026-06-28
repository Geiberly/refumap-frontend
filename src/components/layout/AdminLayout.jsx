import React, { useState } from 'react'
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const baseNav = [
  { to: '.', icon: '⌂', label: 'Resumen', exact: true },
  { to: 'map-points', icon: '🗺️', label: 'Puntos', exact: false },
  { to: 'reports', icon: '📋', label: 'Verificación', exact: false },
  { to: 'admitted-people', icon: '👤', label: 'Personas', exact: false },
  { to: 'hospital-needs', icon: '💉', label: 'Necesidades', exact: false },
]

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const roleLabel = user?.role === 'admin' || isAdmin() ? 'Administrador' : 'Operador'

  const navItems = isAdmin()
    ? [
        ...baseNav.slice(0, 3), 
        { to: 'operators', icon: '👥', label: 'Operadores', exact: false }, 
        { to: 'users', icon: '🧑‍💻', label: 'Usuarios', exact: false }, 
        ...baseNav.slice(3)
      ]
    : baseNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-slate-100 p-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-900/20">🗺️</span>
            <span>
              <b className="block text-lg">RefuMap Venezuela</b>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Panel {roleLabel}</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold transition ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-black text-white">!</span>}
            </NavLink>
          ))}
          <Link to="/mapa" className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold text-slate-500 hover:bg-slate-100">
            <span>🌐</span><span>Mapa público</span>
          </Link>
        </nav>

        <div className="space-y-3 border-t border-slate-100 p-4">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">{(user?.name || 'U').slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0">
                <b className="block truncate text-sm">{user?.name || 'Usuario'}</b>
                <span className="text-xs font-medium text-slate-500">{roleLabel}</span>
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
            <b className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Sistema operativo</b>
            <p className="mt-1 text-xs text-green-700/80">API y mapas disponibles</p>
          </div>
          <button onClick={handleLogout} className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 hover:bg-slate-50" type="button">
            Salir
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <Link to="." className="flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">🗺️</span>
              <span>
                <b className="block leading-tight">RefuMap</b>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{roleLabel}</span>
              </span>
            </Link>
            <div className="hidden lg:block">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Centro de control</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-extrabold text-green-700 sm:inline-flex"><i className="h-2 w-2 rounded-full bg-green-500" /> En línea</span>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition" 
                  type="button" aria-label="Notificaciones"
                >
                  🔔
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-12 mt-2 w-72 rounded-2xl border border-slate-100 bg-white shadow-xl z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-black text-slate-900">Notificaciones</h3>
                      <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600 text-sm">✖</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-6 text-center">
                      <div className="text-3xl mb-2">📭</div>
                      <p className="text-sm font-medium text-slate-500">No tienes notificaciones nuevas.</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="hidden rounded-2xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 sm:block" type="button">Salir</button>
            </div>
          </div>

        </header>

        <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>

        <nav 
          className="pb-safe fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto border-t border-slate-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar via inline style block to be safe */}
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-2xl py-2 min-w-[72px] sm:min-w-[80px] transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-400'}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-extrabold text-center leading-tight px-1">{item.label}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout} 
            className="flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-2xl py-2 min-w-[72px] sm:min-w-[80px] text-slate-400" 
            type="button"
          >
            <span className="text-xl leading-none">👤</span>
            <span className="text-[10px] font-bold">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
