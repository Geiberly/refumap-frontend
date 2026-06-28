const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/DashboardPage.jsx', 'utf8');

const replacements = [
  ["return ' '", "return '—'"],
  ["sublabel.includes('  ')", "sublabel.includes('↑')"],
  ["sublabel.includes('  ')", "sublabel.includes('↓')"],
  ["value ?? ' '", "value ?? '—'"],
  ["type === 'report' ? '=' : 'x '", "type === 'report' ? '📋' : '📍'"],
  ["M VIL", "MÓVIL"],
  ["M0TRICAS", "MÉTRICAS"],
  ["VERIFICACI N", "VERIFICACIÓN"],
  ["icon=\"x  \"", "icon='🔄'"],
  ["icon=\"x `\"", "icon='⬇️'"],
  ["icon=\"=\"", "icon='📋'"],
  ["Más acciones R ", "Más acciones ›"],
  ["GESTI N", "GESTIÓN"],
  ["<i className=\"text-green-500\"> </i>", "<i className=\"text-green-500\">✓</i>"],
  ["<i className=\"text-amber-500\"> </i>", "<i className=\"text-amber-500\">⚠️</i>"],
  ["text-[10px]\">=</i>", "text-[10px]\">📋</i>"],
  ["text-[10px]\">S&</i>", "text-[10px]\">✅</i>"],
  ["text-[10px]\">xa</i>", "text-[10px]\">🚨</i>"],
  ["opacity-10\">xa</div>", "opacity-10\">🚨</div>"],
  ["text-red-700\">   7 desde ayer", "text-red-700\">↑ 7 desde ayer"],
  ["text-blue-700\">altimos 7 días", "text-blue-700\">Últimos 7 días"],
  ["font-black ${bg}\">xa {p}", "font-black ${bg}\">🚨 {p}"],
  ["border-blue-100\">x </span>", "border-blue-100\">📍</span>"],
  ["{ icon: 'x', label: 'Refugios", "{ icon: '🏠', label: 'Refugios"],
  ["{ icon: 'x', label: 'Hospitales", "{ icon: '🏥', label: 'Hospitales"],
  ["{ icon: '=', label: 'Reportes", "{ icon: '📋', label: 'Reportes"],
  ["{ icon: '=w', label: 'Operadores", "{ icon: '👷', label: 'Operadores"],
  ["{ icon: '=', label: 'Vas", "{ icon: '🚧', label: 'Vías"],
  ["{ icon: 'a️', label: 'Zonas", "{ icon: '⚠️', label: 'Zonas"],
  ["{ icon: '=', label: 'Puntos", "{ icon: '📦', label: 'Puntos"],
  ["{ icon: 'x ⬍x ', label: 'Operadores", "{ icon: '👨‍💻', label: 'Operadores"],
  ["{ icon: ' ', label: 'Reportes sin", "{ icon: '❓', label: 'Reportes sin"],
  ["x  Exportar", "⬇️ Exportar"],
  ["x & 24 may", "📅 24 may"],
  ["2025 R ", "2025 ▾"]
];

for (const [search, replace] of replacements) {
  // Fix multiple occurrences
  c = c.split(search).join(replace);
}

fs.writeFileSync('src/pages/admin/DashboardPage.jsx', c, 'utf8');
console.log("Done");
