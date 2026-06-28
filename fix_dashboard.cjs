const fs = require('fs');

let c = fs.readFileSync('src/pages/admin/DashboardPage.jsx', 'utf8');

c = c.replace(/ðŸ  /g, '🏠')
     .replace(/ðŸ ¥/g, '🏥')
     .replace(/ðŸ“‹/g, '📋')
     .replace(/ðŸ‘¥/g, '👷')
     .replace(/Personas registradas/g, 'Operadores activos')
     .replace(/58762/g, 'valueOf(stats, \'operadores_activos\')')
     .replace(/ðŸš§/g, '🚧')
     .replace(/VÃ­as bloqueadas/g, 'Vías bloqueadas')
     .replace(/312/g, 'valueOf(stats, \'bloqueos_activos\')')
     .replace(/âš ï¸ /g, '⚠️')
     .replace(/74/g, 'valueOf(stats, \'puntos_peligro\')')
     .replace(/ðŸ“¦/g, '📦')
     .replace(/Centros de acopio/g, 'Puntos de Mapa')
     .replace(/96/g, 'valueOf(stats, \'total_puntos\')')
     .replace(/ðŸ‘¨â€ ðŸ’»/g, '👨‍💻')
     .replace(/142/g, 'valueOf(stats, \'operadores_activos\')')
     .replace(/â “/g, '❓')
     .replace(/276/g, 'valueOf(stats, \'puntos_no_verificados\')')
     .replace(/â†‘ [0-9]+% vs ayer/g, ' ')
     .replace(/â†“ [0-9]+% vs ayer/g, ' ')
     .replace(/Todos 128/g, 'Todos {valueOf(stats, \'total_puntos\')}')
     .replace(/Refugios 40/g, 'Refugios {valueOf(stats, \'refugios_activos\')}')
     .replace(/Reportes 52/g, 'Reportes {pending}')
     .replace(/Vías 18/g, 'Vías {valueOf(stats, \'bloqueos_activos\')}');

fs.writeFileSync('src/pages/admin/DashboardPage.jsx', c, 'utf8');
console.log("Done");
