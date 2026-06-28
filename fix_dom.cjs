const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/DashboardPage.jsx', 'utf8');

let parts = c.split('{/* GESTIÓN DE OPERADORES */}');
if(parts.length > 1) {
  let subParts = parts[1].split('// PANEL DE OPERADOR (ESCRITORIO & MÓVIL)');
  if(subParts.length > 1) {
    const newContent = `
        <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black text-slate-950">Gestión de operadores</h2>
            <Link to="/admin/operators" className="text-xs font-extrabold text-blue-700 hover:underline">Ver todos ›</Link>
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
                  <i className={\`w-2 h-2 rounded-full \${op.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}\`}></i> 
                  {op.status === 'approved' ? 'Activo' : 'En revisión'}
                </span>
              </div>
            ))}
            {(!stats?.operadores_recientes || stats.operadores_recientes.length === 0) && (
              <p className="text-xs text-slate-500 text-center py-4">No hay operadores recientes.</p>
            )}
          </div>
          <Link to="/admin/operators" className="mt-4 flex w-full justify-center rounded-2xl bg-blue-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition">Gestionar operadores</Link>
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
                <i className={\`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] \${
                  report.status === 'verified' ? 'bg-green-100 text-green-600' : 
                  report.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }\`}>
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
          <Link to="/admin/reports" className="mt-4 flex w-full justify-center rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition">Ver toda la actividad</Link>
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
`;
    fs.writeFileSync('src/pages/admin/DashboardPage.jsx', parts[0] + '{/* GESTIÓN DE OPERADORES */}\n' + newContent + subParts[1], 'utf8');
    console.log('Fixed DOM successfully!');
  }
}
