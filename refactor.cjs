const fs = require('fs');
let c = fs.readFileSync('src/pages/MapPage.jsx', 'utf8');

// Replace Header and Top elements
const newHeader = `
        {/* Header flotante responsive */}
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-[420] sm:left-5 sm:right-5 flex flex-col gap-3">
          <div className="refumap-glass pointer-events-auto rounded-[2rem] p-3 sm:px-6 sm:py-2.5 flex items-center justify-between bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4 flex-1">
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-700 text-base text-white shadow-md">📖</span>
                <span className="hidden sm:block">
                  <b className="block text-[15px] font-black text-slate-900 leading-tight">RefuMap Venezuela</b>
                  <span className="block text-[10px] font-medium text-slate-500">Red ciudadana de ayuda en emergencias</span>
                </span>
              </Link>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="relative flex-1 max-w-md hidden sm:block">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 text-xs">🔎</span>
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Buscar lugar, dirección o referencia..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-12 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button onClick={getLocation} className="absolute inset-y-1.5 right-1.5 flex w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" type="button" aria-label="Usar mi ubicación">
                  ◎
                </button>
              </div>
            </div>
            <div className="hidden items-center gap-1 md:flex shrink-0 ml-4">
              <Link to="/" className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><span>ⓘ</span> Cómo funciona</Link>
              <Link to="/reportar" className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><span>📋</span> Reportes</Link>
              <Link to="/login" className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><span>👤</span> Acceder</Link>
            </div>
          </div>
          
          <div className="pointer-events-auto">
             <FilterBar categories={categories} />
          </div>
        </div>

        {/* Alerta descartable */}
        {showEmergencyAlert && (
          <div className="pointer-events-none absolute left-3 right-3 top-[8rem] z-[410] sm:left-5 sm:right-auto sm:top-28 sm:max-w-3xl">
            <div className="pointer-events-auto flex items-center gap-3 rounded-[1.25rem] border border-red-200 bg-red-50/95 px-5 py-3 text-red-950 shadow-md backdrop-blur">
              <span className="text-red-600 text-lg">⚠️</span>
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <b className="text-xs font-black text-red-800">Información de emergencia</b>
                <p className="text-[11px] font-medium text-red-700/90 leading-tight">Se reportan fuertes lluvias e inundaciones en varias zonas del país. Verifica antes de viajar y comparte solo información confiable.</p>
              </div>
              <button onClick={() => setShowEmergencyAlert(false)} className="text-red-700 hover:text-red-900 shrink-0 text-sm p-1" type="button">✕</button>
            </div>
          </div>
        )}`;

c = c.replace(
  /\{\/\* Header flotante responsive \*\/\}[\s\S]*?\{\/\* Controles del mapa \*\/\}/,
  newHeader + '\n\n        {/* Controles del mapa */}'
);

// Replace FAB Reportar
const newFab = `{/* FAB Reportar */}
        <div className={\`absolute right-4 z-[520] transition-all duration-200 sm:right-6 \${isDetailOpen ? 'bottom-7 sm:bottom-36' : 'bottom-28 sm:bottom-7'}\`}>
          {isFabOpen && (
            <div className="animate-slide-up absolute bottom-24 right-0 w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl sm:bottom-24">
              <div className="border-b border-slate-100 bg-slate-50 p-4">
                <h4 className="text-sm font-extrabold text-slate-900">¿Qué deseas reportar?</h4>
                <p className="mt-1 text-xs text-slate-500">Selecciona una acción rápida.</p>
              </div>
              <div className="grid gap-1 p-2">
                {REPORT_ACTIONS.map(action => (
                  <Link key={action.to} to={action.to} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50">
                    <span className={\`flex h-10 w-10 items-center justify-center rounded-2xl \${action.tone}\`}>{action.icon}</span>
                    <span className="text-sm font-extrabold text-slate-700">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setIsFabOpen(v => !v)} className="flex flex-col h-[72px] w-[72px] items-center justify-center rounded-full bg-[#cb161d] text-white shadow-2xl shadow-red-900/40 transition hover:bg-red-700 hover:scale-105 active:scale-95" type="button" aria-label="Abrir menú de reportes">
            <span className="text-3xl leading-none font-light mt-1">{isFabOpen ? '×' : '+'}</span>
            <span className="text-[9px] font-black uppercase mt-1 tracking-wider">Reportar</span>
          </button>
        </div>`;

c = c.replace(/\{\/\* FAB Reportar \*\/\}[\s\S]*?<span className="mt-1 hidden text-center text-xs font-extrabold text-slate-800 sm:block">Reportar<\/span>\s*<\/div>/, newFab);

fs.writeFileSync('src/pages/MapPage.jsx', c, 'utf8');
