const fs = require('fs');

// 1. UPDATE MapView.jsx
let viewCode = fs.readFileSync('src/components/map/MapView.jsx', 'utf8');

const mapEventsHandler = `function MapEventsHandler() {
  const { setClickedLocation, isDetailOpen, isMapClickPanelOpen } = useMapStore()
  const map = useMap()
  
  useMapEvents({
    click(e) {
      if (!isDetailOpen && !isMapClickPanelOpen) {
        // Validación de límites para Venezuela (aprox)
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        if (lat >= 0.5 && lat <= 12.8 && lng >= -73.5 && lng <= -59.5) {
          setClickedLocation(e.latlng)
          map.flyTo(e.latlng, 15, { duration: 1 })
        }
      }
    },
  })
  return null
}`;

viewCode = viewCode.replace(/function MapEventsHandler\(\) \{[\s\S]*?return null\n\}/, mapEventsHandler);
if (!viewCode.includes('maxZoom={19}')) {
  viewCode = viewCode.replace('minZoom={5}', 'minZoom={5}\n      maxZoom={19}');
}
fs.writeFileSync('src/components/map/MapView.jsx', viewCode, 'utf8');

// 2. UPDATE MapPage.jsx
let pageCode = fs.readFileSync('src/pages/MapPage.jsx', 'utf8');

if (!pageCode.includes('WeatherWidget')) {
  pageCode = pageCode.replace("import MapClickPanel from '../components/map/MapClickPanel'", "import MapClickPanel from '../components/map/MapClickPanel'\nimport WeatherWidget from '../components/map/WeatherWidget'");
}

pageCode = pageCode.replace(/const \[showEmergencyAlert, setShowEmergencyAlert\] = useState\(true\)/, '');

const newWeather = `        {/* Widget de Clima */}
        <div className="pointer-events-none absolute right-3 top-[7.5rem] z-[410] hidden sm:block sm:right-5 sm:top-28">
          <WeatherWidget />
        </div>`;
pageCode = pageCode.replace(/\{\/\* Alerta de clima \*\/\}[\s\S]*?\}\)/, newWeather);

const newFab = `{/* FAB Reportar */}
        <div className={\`absolute right-4 z-[520] transition-all duration-300 sm:right-6 \${isDetailOpen ? 'bottom-7 sm:bottom-36' : 'bottom-28 sm:bottom-7'}\`}>
          {isFabOpen && (
            <div className="animate-slide-up absolute bottom-20 right-0 w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl sm:bottom-20">
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
          <button onClick={() => setIsFabOpen(v => !v)} className="group flex items-center justify-center gap-2 rounded-full bg-[#cb161d] px-5 py-3 sm:px-6 sm:py-4 text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-700 hover:shadow-xl active:scale-95 border-2 border-white" type="button" aria-label="Abrir menú de reportes">
            <span className="text-2xl leading-none font-bold">{isFabOpen ? '×' : '+'}</span>
            <span className="text-[13px] font-black uppercase tracking-wide">Reportar</span>
          </button>
        </div>`;
pageCode = pageCode.replace(/\{\/\* FAB Reportar \*\/\}[\s\S]*?<\/div>\s*\{\/\* Bottom sheet móvil \*\/\}/, newFab + '\n\n        {/* Bottom sheet móvil */}');

fs.writeFileSync('src/pages/MapPage.jsx', pageCode, 'utf8');
