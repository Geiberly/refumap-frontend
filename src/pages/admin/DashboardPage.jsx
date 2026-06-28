import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetDashboard } from '../../api/mapPoints'
import useAuthStore from '../../store/useAuthStore'
import { SkeletonList } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function valueOf(stats, key, fallback = 0) {
  const value = stats?.[key]
  return value === null || value === undefined ? fallback : value
}

// ----------------------------------------------------------------------
// COMPONENTES COMUNES
// ----------------------------------------------------------------------

function MetricCard({ icon, label, value, sublabel = 'Actual', tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
    slate: 'bg-slate-50 text-slate-700',
  }

  const up = sublabel.includes('↑')
  const down = sublabel.includes('↓')
  const subTone = up ? 'text-green-600' : down ? 'text-red-600' : 'text-slate-500'

  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition-card flex items-start gap-4">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] text-xl ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black leading-none tracking-tight text-slate-950">{value ?? '—'}</p>
        <p className={`mt-2 text-[11px] font-extrabold ${subTone}`}>{sublabel}</p>
      </div>
    </div>
  )
}

function QueueItem({ item, type = 'point' }) {
  const icon = item?.category?.icon || (type === 'report' ? '📋' : '📍')
  const title = item?.title || item?.name || 'Reporte sin título'
  const date = item?.created_at || item?.updated_at
  const priority = item?.urgency_level === 3 ? 'Alta' : item?.urgency_level === 2 ? 'Media' : 'Baja'
  const priorityColor = priority === 'Alta' ? 'text-red-600 bg-red-50' : priority === 'Media' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'

  return (
    <div className="flex items-center gap-3 border-b border-slate-50 py-3 last:border-0 hover:bg-slate-50 rounded-2xl px-2 transition-colors">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-lg border border-slate-100">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{item?.address || 'Ubicación pendiente'}</p>
      </div>
      <div className="text-right">
        {item?.status ? (
          <StatusBadge status={item.status} />
        ) : (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${priorityColor}`}>{priority}</span>
        )}
        <p className="mt-1 text-[10px] font-bold text-slate-400">Hace {Math.floor(Math.random() * 60)} min</p>
      </div>
    </div>
  )
}

function MiniMapCard({ title, linkTo, linkText, height = 'h-[300px]' }) {
  const pins = [
    ['left-[22%] top-[33%]', 'bg-blue-600', '26'],
    ['left-[44%] top-[48%]', 'bg-red-500', '12'],
    ['left-[61%] top-[63%]', 'bg-green-600', '14'],
    ['left-[74%] top-[40%]', 'bg-purple-600', '7'],
    ['left-[34%] top-[68%]', 'bg-amber-500', '8'],
  ]
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black text-slate-950 text-base">{title}</h3>
        <Link to={linkTo} className="text-xs font-extrabold text-blue-700 hover:underline">{linkText} ⬺</Link>
      </div>
      <div className={`refumap-map-preview w-full rounded-[1rem] border border-slate-100 relative flex-1 min-h-[250px] ${height}`}>
        {pins.map(([position, bg, label]) => (
          <span key={position} className={`absolute ${position} z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${bg} text-xs font-black text-white shadow-lg`}>{label}</span>
        ))}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
          <div className="bg-white/90 backdrop-blur rounded-full px-4 py-1.5 shadow-sm border border-slate-100 flex gap-4 text-[10px] font-bold text-slate-600">
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-green-500"></i> Refugios</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-blue-500"></i> Hospitales</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-500"></i> Reportes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, icon, title, description, color = "blue" }) {
  const colors = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    green: "text-green-700 bg-green-50 border-green-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    purple: "text-purple-700 bg-purple-50 border-purple-100"
  }
  
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:border-slate-300 transition-colors group">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-lg ${colors[color]}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700">{title}</p>
        <p className="text-[11px] font-medium text-slate-500">{description}</p>
      </div>
      <span className="text-slate-300 group-hover:text-blue-600">⬺</span>
    </Link>
  )
}

// ----------------------------------------------------------------------
// PANEL DE ADMINISTRADOR (ESCRITORIO & MÓVIL)
// ----------------------------------------------------------------------
function AdminDashboard({ stats, metrics, recentReports, recentPoints, pending }) {
  return (
    <div className="space-y-6">
      {/* 1. MÉTRICAS PRINCIPALES */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      {/* 2. BENTO BOX ROW 1 */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1.3fr_0.8fr]">
        
        {/* COLA DE VERIFICACIÓN */}
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm flex flex-col max-w-full overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black text-slate-950 flex items-center gap-2">
              Cola de verificación <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{pending}</span>
            </h2>
            <Link to="reports" className="text-xs font-extrabold text-blue-700 hover:underline shrink-0">Ver todos ⬺</Link>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 border-b border-slate-50">
            <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold shrink-0">Todos {stats?.total_puntos || 0}</button>
            <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-full text-xs font-bold shrink-0">Refugios {stats?.refugios_activos || 0}</button>
            <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-full text-xs font-bold shrink-0">Reportes {stats?.reportes_pendientes || 0}</button>
            <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-full text-xs font-bold shrink-0">Vías {stats?.bloqueos_activos || 0}</button>
          </div>
          <div className="flex-1">
            {recentReports.slice(0, 4).map(r => <QueueItem key={`report-${r.id}`} item={r} type="report" />)}
            {recentPoints.slice(0, 1).map(p => <QueueItem key={`point-${p.id}`} item={p} />)}
          </div>
          <Link to="reports" className="mt-4 flex w-full justify-center rounded-2xl bg-slate-50 px-4 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition">
            Revisar cola completa
          </Link>
        </section>

        {/* VISTA REGIONAL */}
        <MiniMapCard title="Vista regional" linkTo="map-points" linkText="Todas las regiones" />

        {/* ACCIONES RÁPIDAS */}
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm flex flex-col">
          <h2 className="mb-4 font-black text-slate-950">Acciones rápidas</h2>
          <div className="space-y-3 flex-1">
            <QuickAction to="operators" icon="👷" title="Aprobar operador" description="Revisar y aprobar solicitudes" color="purple" />
            <QuickAction to="reports" icon="🔄" title="Reasignar reportes" description="Balancear carga de trabajo" color="amber" />
            <QuickAction to="." icon="⬇️" title="Exportar datos" description="Descargar reportes y métricas" color="green" />
            <QuickAction to="reports" icon="📋" title="Revisar reportes" description="Ir a la cola de verificación" color="blue" />
          </div>
          <button className="mt-4 text-xs font-extrabold text-slate-500 hover:text-blue-700 w-full text-center">Más acciones ›</button>
        </section>

      </div>

      {/* 3. BENTO BOX ROW 2 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        
      {/* GESTIÓN DE OPERADORES */}

        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black text-slate-950">Gestión de operadores</h2>
            <Link to="operators" className="text-xs font-extrabold text-blue-700 hover:underline">Ver todos ›</Link>
          </div>
          <div className="space-y-3">
            {(stats?.operadores_recientes || []).map((op) => (
              <div key={op.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">{op.name ? op.name.charAt(0).toUpperCase() : '?'}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{op.name || 'Operador'}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{op.role}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                  <i className={`w-2 h-2 rounded-full ${op.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`}></i> 
                  {op.status === 'approved' ? 'Activo' : 'En revisión'}
                </span>
              </div>
            ))}
            {(!stats?.operadores_recientes || stats.operadores_recientes.length === 0) && (
              <p className="text-xs text-slate-500 text-center py-4">No hay operadores recientes.</p>
            )}
          </div>
          <Link to="operators" className="mt-4 flex w-full justify-center rounded-2xl bg-blue-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition">Gestionar operadores</Link>
        </section>

        {/* SALUD DEL SISTEMA */}
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black text-slate-950">Salud del sistema</h2>
            <span className="text-xs font-extrabold text-slate-400">Simulación</span>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-xs"><span className="text-slate-600 font-medium flex items-center gap-2"><i className="text-green-500">✓</i> API y servicios</span><span className="font-bold text-green-600">Operativo</span></div>
            <div className="flex justify-between items-center text-xs"><span className="text-slate-600 font-medium flex items-center gap-2"><i className="text-green-500">✓</i> Base de datos</span><span className="font-bold text-green-600">Operativo</span></div>
            <div className="flex justify-between items-center text-xs"><span className="text-slate-600 font-medium flex items-center gap-2"><i className="text-green-500">✓</i> Mapas y geo</span><span className="font-bold text-green-600">Operativo</span></div>
            <div className="flex justify-between items-center text-xs"><span className="text-slate-600 font-medium flex items-center gap-2"><i className="text-amber-500">⚠️</i> Integraciones</span><span className="font-bold text-amber-600">Advertencia</span></div>
          </div>
          <div className="flex gap-4 border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500">Disponibilidad</p>
              <p className="text-lg font-black text-green-600">99,8%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500">Tiempo resp.</p>
              <p className="text-lg font-black text-blue-600">320 ms</p>
            </div>
          </div>
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black text-slate-950">Actividad reciente</h2>
          </div>
          <div className="space-y-4">
            {recentReports.slice(0, 3).map((report, idx) => (
              <div key={report.id} className="flex gap-3 relative">
                {idx !== 2 && <div className="w-[2px] h-full bg-slate-100 absolute left-[9px] top-4"></div>}
                <i className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] ${
                  report.status === 'verified' ? 'bg-green-100 text-green-600' : 
                  report.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {report.status === 'verified' ? '✅' : report.status === 'rejected' ? '🚨' : '📋'}
                </i>
                <div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{report.title}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{report.status === 'pending' ? 'Creado recientemente' : report.status}</p>
                </div>
              </div>
            ))}
            {recentReports.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No hay actividad reciente.</p>
            )}
          </div>
          <Link to="reports" className="mt-4 flex w-full justify-center rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition">Ver toda la actividad</Link>
        </section>

        {/* CALIDAD Y AUDITORÍA */}
        <section className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-black text-slate-950">Calidad de datos</h2>
              <span className="text-[10px] text-slate-500">(7 días)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center text-lg font-black text-slate-900">87%</div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-[10px]"><span className="text-slate-500">Exactitud</span><span className="font-bold">92%</span></div>
                <div className="flex justify-between text-[10px]"><span className="text-slate-500">Completitud</span><span className="font-bold">84%</span></div>
                <div className="flex justify-between text-[10px]"><span className="text-slate-500">Actualización</span><span className="font-bold">85%</span></div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm flex-1">
             <div className="mb-2 flex items-center justify-between">
              <h2 className="font-black text-slate-950">Auditoría</h2>
              <span className="text-[10px] font-extrabold text-blue-700">Ver ›</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span className="text-slate-600">Acciones</span><span className="font-bold">1.246</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Incidentes</span><span className="font-bold">3</span></div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// PANEL DE OPERADOR (ESCRITORIO & MÓVIL)
// ----------------------------------------------------------------------
function OperatorDashboard({ pending, recentReports, recentPoints }) {
  return (
    <div className="space-y-6">
      {/* 1. MÉTRICAS OPERADOR */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[1.5rem] border-2 border-red-100 bg-red-50 p-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">🚨</div>
          <p className="text-[13px] font-bold text-red-800 mb-1">Pendientes urgentes</p>
          <p className="text-4xl font-black text-red-600">{pending}</p>
          <p className="mt-2 text-[11px] font-bold text-red-700">↑ 7 desde ayer</p>
          <Link to="reports" className="mt-3 block text-[11px] font-extrabold text-red-700 underline">Ver cola ⬺</Link>
        </div>
        <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-[13px] font-bold text-amber-800 mb-1">En revisión</p>
          <p className="text-3xl font-black text-amber-600">18</p>
          <p className="mt-2 text-[11px] font-bold text-amber-700">Verificando ahora</p>
        </div>
        <div className="rounded-[1.5rem] border border-green-100 bg-green-50/50 p-4 shadow-sm">
          <p className="text-[13px] font-bold text-green-800 mb-1">Verificadas hoy</p>
          <p className="text-3xl font-black text-green-600">56</p>
          <p className="mt-2 text-[11px] font-bold text-green-700"> </p>
        </div>
        <div className="rounded-[1.5rem] border border-purple-100 bg-purple-50/50 p-4 shadow-sm">
          <p className="text-[13px] font-bold text-purple-800 mb-1">Descartadas hoy</p>
          <p className="text-3xl font-black text-purple-600">12</p>
          <p className="mt-2 text-[11px] font-bold text-purple-700">Confirmadas falsas</p>
        </div>
        <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/50 p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[13px] font-bold text-blue-800 mb-1">Total reportes</p>
          <p className="text-3xl font-black text-blue-600">1.452</p>
          <p className="mt-2 text-[11px] font-bold text-blue-700">Últimos 7 días</p>
        </div>
      </div>

      {/* 2. MAIN BENTO: COLA & MAPA */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* COLA EN VIVO */}
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm flex flex-col max-w-full overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
             <h2 className="font-black text-slate-950 flex items-center gap-2">
              Cola de verificación en vivo <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-black">{pending} pendientes</span>
            </h2>
            <Link to="reports" className="text-xs font-extrabold text-blue-700 hover:underline shrink-0">Ver todos ⬺</Link>
          </div>
          
          <div className="flex gap-3 mb-4 border-b border-slate-100 pb-4 overflow-x-auto no-scrollbar">
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none shrink-0"><option>Tipo: Todos</option></select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none shrink-0"><option>Prioridad: Todas</option></select>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none shrink-0"><option>Estado: Pendientes</option></select>
            <button className="bg-blue-50 text-blue-700 rounded-xl px-3 py-1.5 text-xs font-bold shrink-0">Y Filtros</button>
          </div>

          <div className="flex-1 space-y-1">
            <div className="hidden md:grid grid-cols-[80px_1fr_120px_60px_100px] gap-2 px-2 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>Prioridad</span><span>Reporte</span><span>Ubicación</span><span>Tiempo</span><span>Acciones</span>
            </div>
            {recentReports.slice(0, 5).map((r, i) => {
              const priorities = ['Alta', 'Alta', 'Media', 'Media', 'Baja']
              const p = priorities[i] || 'Baja'
              const bg = p === 'Alta' ? 'bg-red-50 text-red-600' : p === 'Media' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              return (
                <div key={r.id} className="grid md:grid-cols-[80px_1fr_120px_60px_100px] gap-2 items-center px-2 py-3 border-b border-slate-50 hover:bg-slate-50 rounded-xl transition">
                  <div className="hidden md:block"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${bg}`}>🚨 {p}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">📍</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{r.title || 'Inundación en vía'}</p>
                      <p className="text-[10px] text-slate-500 truncate">R-{r.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-[11px] text-slate-600 truncate">{r.address || 'Caracas, DC'}</div>
                  <div className="hidden md:block text-[11px] font-bold text-red-600">3 min</div>
                  <div><button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-1.5 text-[11px] font-extrabold w-full shadow-sm">Verificar</button></div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
             <span className="text-[10px] font-bold text-slate-500 text-center sm:text-left">Acciones rápidas para el reporte seleccionado</span>
             <div className="flex gap-2 w-full sm:w-auto">
               <button className="bg-amber-50 text-amber-700 rounded-xl px-3 py-1.5 text-[10px] font-bold flex-1 sm:flex-none whitespace-nowrap">Marcar en revisión</button>
               <button className="bg-red-50 text-red-700 rounded-xl px-3 py-1.5 text-[10px] font-bold flex-1 sm:flex-none">Descartar</button>
             </div>
          </div>
        </section>

        {/* MAPA OPERADOR */}
        <MiniMapCard title="Mapa · Reportes activos" linkTo="/mapa" linkText="Ver mapa completo" height="h-full min-h-[400px]" />
      </div>

    </div>
  )
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function DashboardPage() {
  const { isAdmin } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminGetDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const pending = valueOf(stats, 'reportes_pendientes')
  const roleIsAdmin = isAdmin()

  const metrics = useMemo(() => {
    return [
      { icon: '🏠', label: 'Refugios activos', value: valueOf(stats, 'refugios_activos'), tone: 'green', sublabel: 'Verificados' },
      { icon: '🏥', label: 'Hospitales operativos', value: valueOf(stats, 'hospitales_operativos'), tone: 'blue', sublabel: 'Reportados' },
      { icon: '📋', label: 'Reportes pendientes', value: pending, tone: 'amber', sublabel: 'Por revisar' },
      { icon: '👷', label: 'Operadores activos', value: valueOf(stats, 'operadores_activos'), tone: 'purple', sublabel: 'En el sistema' },
      { icon: '🚧', label: 'Vías bloqueadas', value: valueOf(stats, 'bloqueos_activos'), tone: 'red', sublabel: 'Activas' },
      { icon: '⚠️', label: 'Zonas de peligro', value: valueOf(stats, 'puntos_peligro'), tone: 'red', sublabel: 'Alertas' },
      { icon: '👨‍💻', label: 'Operadores activos', value: valueOf(stats, 'operadores_activos'), tone: 'blue', sublabel: 'Verificados' },
      { icon: '❓', label: 'Reportes sin verificar', value: valueOf(stats, 'puntos_no_verificados'), tone: 'amber', sublabel: 'En espera' },
    ]
  }, [stats, pending])

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
        <SkeletonList count={4} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-8 text-center text-red-800">
        <b>Error cargando métricas.</b>
        <p className="mt-2 text-sm">Revisa la conexión con la API e intenta de nuevo.</p>
        <button onClick={load} className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm" type="button">Reintentar</button>
      </div>
    )
  }

  const recentPoints = stats.puntos_recientes || []
  const recentReports = stats.reportes_recientes || []

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            {roleIsAdmin ? 'Centro de control estratégico' : 'Operador'}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {roleIsAdmin ? 'Panel de administración' : 'Panel de Operador'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 max-w-2xl">
            Monitorea, verifica y gestiona la operación de RefuMap
          </p>
        </div>
      </div>

      {roleIsAdmin ? (
        <AdminDashboard stats={stats} metrics={metrics} recentReports={recentReports} recentPoints={recentPoints} pending={pending} />
      ) : (
        <OperatorDashboard pending={pending} recentReports={recentReports} recentPoints={recentPoints} />
      )}
    </div>
  )
}
