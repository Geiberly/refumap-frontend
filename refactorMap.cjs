const fs = require('fs');

let viewCode = fs.readFileSync('src/components/map/MapView.jsx', 'utf8');

const newMarkerComponent = `function PointMarker({ point, onPointSelect, getDistanceFromMe, location }) {
  const map = useMap();
  const lat = Number(point.latitude);
  const lng = Number(point.longitude);
  
  return (
    <Marker
      position={[lat, lng]}
      icon={createCustomIcon(point.category, point.status)}
      eventHandlers={{
        click: () => {
          onPointSelect(point);
          map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
        },
      }}
    >
      <Popup autoPan={false} closeButton={false}>
        <div
          style={{ padding: '12px', minWidth: '200px', cursor: 'pointer' }}
          onClick={() => {
            onPointSelect(point);
            map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
          }}
        >
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '2px 8px', borderRadius: '999px', fontSize: '11px',
              fontWeight: 600, background:
                point.status === 'active' ? '#dcfce7' :
                point.status === 'full' ? '#fef3c7' :
                point.status === 'danger' ? '#fee2e2' : '#f3f4f6',
              color:
                point.status === 'active' ? '#14532d' :
                point.status === 'full' ? '#78350f' :
                point.status === 'danger' ? '#7f1d1d' : '#374151',
            }}>
              {point.status === 'active' ? '● Activo' :
               point.status === 'full' ? '● Saturado' :
               point.status === 'danger' ? '⚠ Peligro' :
               point.status === 'closed' ? '● Cerrado' : '○ No verificado'}
            </span>
          </div>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
            {point.category?.icon} {point.name}
          </strong>
          {point.address && (
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, marginBottom: '4px' }}>
              {point.address}
            </p>
          )}
          {location && (
            <p style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, margin: 0 }}>
              📍 {getDistanceFromMe(point.latitude, point.longitude)}
            </p>
          )}
          <p style={{ fontSize: '11px', color: '#2563eb', margin: '6px 0 0', fontWeight: 600 }}>
            Toca para ver detalles →
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapView`;

viewCode = viewCode.replace('export default function MapView', newMarkerComponent);

const mapListReplacement = `      {/* Puntos del mapa */}
      {visiblePoints.map((point) => (
        <PointMarker 
          key={point.id} 
          point={point} 
          onPointSelect={onPointSelect} 
          getDistanceFromMe={getDistanceFromMe} 
          location={location} 
        />
      ))}

      {/* Bloqueos de vía */}`;

viewCode = viewCode.replace(/\{\/\* Puntos del mapa \*\/\}[\s\S]*?\{\/\* Bloqueos de vía \*\/\}/, mapListReplacement);
fs.writeFileSync('src/components/map/MapView.jsx', viewCode, 'utf8');

let pageCode = fs.readFileSync('src/pages/MapPage.jsx', 'utf8');

// Replace Emergency Banner with Weather
const weatherBanner = `        {/* Alerta de clima */}
        {showEmergencyAlert && (
          <div className="pointer-events-none absolute left-3 right-3 top-[8rem] z-[410] sm:left-5 sm:right-auto sm:top-28 sm:max-w-3xl">
            <div className="pointer-events-auto flex items-center gap-3 rounded-[1.25rem] border border-blue-200 bg-blue-50/95 px-5 py-3 text-blue-950 shadow-md backdrop-blur">
              <span className="text-blue-600 text-lg">🌧️</span>
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <b className="text-xs font-black text-blue-800">Estado del clima</b>
                <p className="text-[11px] font-medium text-blue-700/90 leading-tight">Lluvias moderadas en la región central y occidente. Toma previsiones al movilizarte.</p>
              </div>
              <button onClick={() => setShowEmergencyAlert(false)} className="text-blue-700 hover:text-blue-900 shrink-0 text-sm p-1" type="button">✕</button>
            </div>
          </div>
        )}`;

pageCode = pageCode.replace(/\{\/\* Alerta descartable \*\/\}[\s\S]*?\}\)/, weatherBanner);

// Replace FAB Reportar Button
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
          <button onClick={() => setIsFabOpen(v => !v)} className="flex flex-col h-[76px] w-[76px] items-center justify-center rounded-[28px] bg-[#cb161d] text-white shadow-2xl shadow-red-900/40 transition hover:bg-red-700 hover:scale-105 active:scale-95 border-2 border-white" type="button" aria-label="Abrir menú de reportes">
            <span className="text-3xl leading-none font-medium mt-1">{isFabOpen ? '×' : '+'}</span>
            <span className="text-[10px] font-black uppercase mt-0.5 tracking-wider">Reportar</span>
          </button>
        </div>`;

pageCode = pageCode.replace(/\{\/\* FAB Reportar \*\/\}[\s\S]*?<span className="text-\[9px\] font-black uppercase mt-1 tracking-wider">Reportar<\/span>\s*<\/button>\s*<\/div>/, newFab);

fs.writeFileSync('src/pages/MapPage.jsx', pageCode, 'utf8');
