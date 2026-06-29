import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import { ChatBot } from '../components/ui/ChatBot'
import 'leaflet/dist/leaflet.css'

const iconPaths = {
  shield: (
    <>
      <path d="M12 3.5 5.5 6v5.4c0 4.1 2.8 7.6 6.5 8.9 3.7-1.3 6.5-4.8 6.5-8.9V6L12 3.5Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 8.8-2 5.1-5.1 2 2-5.1 5.1-2Z" />
    </>
  ),
  map: (
    <>
      <path d="m9 18.5-5.5 2V6.7L9 4.7l6 2.1 5.5-2v13.8l-5.5 2-6-2.1Z" />
      <path d="M9 4.7v13.8M15 6.8v13.8" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="m17.5 12.8 2.8 2.8M20.3 12.8l-2.8 2.8" />
    </>
  ),
  report: (
    <>
      <path d="M6 4.5h8.2L18 8.3v11.2H6v-15Z" />
      <path d="M14 4.5V9h4M9 13h6M9 16h3" />
      <path d="M16.2 14.5v3.2M14.6 16.1h3.2" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  hospital: (
    <>
      <path d="M4.5 20V7.5L12 4l7.5 3.5V20" />
      <path d="M8 20h8M12 8v8M8.5 12h7" />
    </>
  ),
  box: (
    <>
      <path d="M12 3.8 4.5 7.7v8.6L12 20.2l7.5-3.9V7.7L12 3.8Z" />
      <path d="M4.5 7.7 12 11.6l7.5-3.9M12 11.6v8.6" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.8 2.9 19h18.2L12 3.8Z" />
      <path d="M12 9.3v4.3M12 16.8h.01" />
    </>
  ),
  bed: (
    <>
      <path d="M4.5 19V5.5M19.5 19v-5.1a3 3 0 0 0-3-3h-7V19" />
      <path d="M4.5 14h15M7.2 10.8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </>
  ),
  road: (
    <>
      <path d="M4.5 20 9.2 4h5.6l4.7 16" />
      <path d="M12 4v4M12 12v3M7 15.5h10" />
    </>
  ),
  bus: (
    <>
      <path d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v7.5H4V8a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M7 19h.01M17 19h.01M4 11h16" />
    </>
  ),
  more: (
    <>
      <circle cx="6.5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="17.5" cy="12" r="1.2" />
    </>
  ),
  check: <path d="m5 12.4 4.1 4.1L19 6.8" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2v5M12 8h.01" />
    </>
  ),
  phone: (
    <path d="M7 4.7 9.6 4l2 4.3-1.5 1.1a10.2 10.2 0 0 0 4.5 4.5l1.1-1.5 4.3 2-.7 2.6a2.2 2.2 0 0 1-2.2 1.7A13.8 13.8 0 0 1 5.3 6.9c0-1 .7-1.9 1.7-2.2Z" />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.8a2.4 2.4 0 0 1 4.6 1.1c0 1.9-2.4 2.2-2.4 4M12 18h.01" />
    </>
  ),
  users: (
    <>
      <path d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="10" r="3" />
      <path d="M20 18a4 4 0 0 0-3-3.4M4 18a4 4 0 0 1 3-3.4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18M6 6l12 12" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="m20 4-8 8" />
      <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  sos: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 13.7c.7.8 2 .8 2.6.1.8-.9-.2-1.7-1.2-2.1-.9-.4-1.7-1.2-1-2 .6-.8 1.9-.8 2.5 0M12.6 9.5h2.8M12.6 14.5h2.8M12.6 9.5v5M17.6 9.5h1.3c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8h-1.3v-3.6Z" />
    </>
  ),
}

function Icon({ name, className = 'h-5 w-5', strokeWidth = 2.2 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  )
}

function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Ir al inicio">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef4ff] text-[#002045] ring-1 ring-[#d8e5ff] md:h-9 md:w-9">
        <Icon name="shield" className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-xl font-black tracking-tight text-[#001b3c] dark:text-white md:text-2xl">RefuMap Venezuela</span>
        {!compact && <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">Ayuda en emergencias</span>}
      </span>
    </Link>
  )
}

const primaryActions = [
  {
    to: '/mapa',
    title: 'Ver ayuda cerca',
    mobileTitle: 'Ver ayuda',
    description: 'Refugios, hospitales y puntos activos.',
    icon: 'location',
    className: 'bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 text-[#001b3c] dark:text-white',
    descClass: 'text-slate-600 dark:text-slate-400',
    iconClass: 'bg-blue-600 dark:bg-slate-700 text-white',
    arrowClass: 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white',
  },
  {
    to: '/search-person',
    title: 'Buscar persona',
    mobileTitle: 'Buscar persona',
    description: 'Consulta registros y reportes públicos.',
    icon: 'person',
    className: 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 text-white',
    descClass: 'text-blue-50 dark:text-white/90',
    iconClass: 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white',
    arrowClass: 'bg-white/20 dark:bg-black/20 text-white',
  },
  {
    to: '/reportar',
    title: 'Reportar ahora',
    mobileTitle: 'Reportar',
    description: 'Envía información útil para la comunidad.',
    icon: 'report',
    className: 'bg-red-600 dark:bg-red-700 border-red-600 dark:border-red-800 text-white',
    descClass: 'text-red-100 dark:text-white/90',
    iconClass: 'bg-white dark:bg-red-950 text-red-600 dark:text-red-400',
    arrowClass: 'bg-white/20 text-white',
  },
  {
    to: '/mapa',
    title: 'Mapa completo',
    mobileTitle: 'Mapa',
    description: 'Explora Venezuela por filtros.',
    icon: 'map',
    className: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#001b3c] dark:text-white',
    descClass: 'text-slate-600 dark:text-slate-400',
    iconClass: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white',
    arrowClass: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white',
  },
]

const reportTypes = [
  { to: '/reportar/refugio', title: 'Refugio disponible', mobileTitle: 'Refugio', description: 'Lugar seguro recibiendo personas.', icon: 'hospital', color: 'text-[#0b63f6] dark:text-blue-400', bg: 'bg-[#edf4ff] dark:bg-blue-500/20' },
  { to: '/reportar/hospital', title: 'Hospital operativo', mobileTitle: 'Hospital', description: 'Centro de salud atendiendo.', icon: 'hospital', color: 'text-[#0ea66f] dark:text-emerald-400', bg: 'bg-[#eafaf3] dark:bg-emerald-500/20' },
  { to: '/reportar/centro-acopio', title: 'Centro de acopio', mobileTitle: 'Acopio', description: 'Donaciones, comida o insumos.', icon: 'box', color: 'text-[#f97316] dark:text-orange-400', bg: 'bg-[#fff4e7] dark:bg-orange-500/20' },
  { to: '/report-person', title: 'Persona ingresada', mobileTitle: 'Persona', description: 'Alguien trasladado a un centro.', icon: 'bed', color: 'text-[#8b5cf6] dark:text-purple-400', bg: 'bg-[#f4efff] dark:bg-purple-500/20' },
  { to: '/reportar/zona-peligrosa', title: 'Zona peligrosa', mobileTitle: 'Riesgo', description: 'Riesgo, daño o derrumbe.', icon: 'warning', color: 'text-[#dc2626] dark:text-red-400', bg: 'bg-[#fff1f1] dark:bg-red-500/20' },
  { to: '/reportar/falla-camino', title: 'Vía bloqueada', mobileTitle: 'Transporte', description: 'Calles o carreteras afectadas.', icon: 'road', color: 'text-[#64748b] dark:text-slate-400', bg: 'bg-[#eef2f7] dark:bg-slate-500/20' },
]

const navItems = [
  { to: '/mapa', label: 'Mapa' },
  { to: '/search-person', label: 'Personas' },
  { to: '/reportar', label: 'Reportar' },
  { to: '#como-funciona', label: 'Cómo funciona' },
]

function ActionCard({ action }) {
  return (
    <Link
      to={action.to}
      className={`${action.className} group flex min-h-[7rem] flex-col justify-between rounded-2xl border p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] md:min-h-[12rem] md:rounded-xl md:p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`${action.iconClass} grid h-12 w-12 shrink-0 place-items-center rounded-full md:h-11 md:w-11`}>
          <Icon name={action.icon} className="h-6 w-6" />
        </span>
        <span className={`${action.arrowClass} hidden h-8 w-8 place-items-center rounded-full transition group-hover:translate-x-0.5 md:grid`}>
          <Icon name="chevron" className="h-4 w-4" />
        </span>
      </div>
      <div className="text-center md:text-left">
        <h3 className="text-[15px] font-bold md:text-xl">{action.title}</h3>
        <p className={`mt-1 hidden text-sm leading-5 md:block ${action.descClass}`}>
          {action.description}
        </p>
        <p className="mt-1 text-sm font-semibold md:hidden">{action.mobileTitle}</p>
      </div>
    </Link>
  )
}

function VenezuelaMapPreview({ mobile = false, isDark = false }) {
  const center = [7.5, -66.0]
  // Mapa Satelital de Esri (vívido, realista, verdes fuertes)
  const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

  return (
    <div className={`${mobile ? 'h-[315px] rounded-xl' : 'min-h-[44rem] rounded-[2rem]'} relative overflow-hidden bg-[#0a1424] dark:bg-[#050a12] shadow-[0_14px_40px_rgba(30,64,175,0.08)] ring-1 ring-[#0f1f3a] dark:ring-slate-800 z-0`}>
      <MapContainer 
        center={center} 
        zoom={mobile ? 5 : 6} 
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        className={`absolute inset-0 h-full w-full z-0 pointer-events-none ${isDark ? '[&_.leaflet-layer]:brightness-[0.80] [&_.leaflet-layer]:contrast-[1.1] [&_.leaflet-layer]:saturate-100' : ''}`}
      >
        <TileLayer url={tileUrl} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-10">
        {!mobile && (
          <div className="pointer-events-auto absolute left-7 top-7 rounded-full bg-white dark:bg-slate-900 px-5 py-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mapa activo</p>
            <p className="text-sm font-bold text-[#001b3c] dark:text-white">Venezuela</p>
          </div>
        )}

        <Link
          to="/mapa"
          className={`${mobile ? 'hidden' : 'flex'} pointer-events-auto absolute right-7 top-7 items-center gap-2 rounded-lg bg-blue-950 px-5 py-2.5 text-sm font-black !text-white shadow-md border border-blue-800 transition hover:bg-blue-900`}
        >
          Abrir mapa <Icon name="external" className="h-4 w-4" />
        </Link>

        {mobile && (
          <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/95 dark:bg-slate-900/95 px-4 py-2 text-xs font-semibold text-[#001b3c] dark:text-white shadow-sm backdrop-blur">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0b63f6] dark:bg-blue-400" /> Refugios</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16a3a3] dark:bg-teal-400" /> Hospitales</span>
          </div>
        )}

        <div className="absolute inset-0">
          <MapPin className="left-[42%] top-[45%]" tone="blue" icon="hospital" />
          <MapPin className="left-[48%] top-[38%]" tone="teal" icon="box" />
          <MapPin className="left-[54%] top-[27%]" tone="red" icon="warning" />
          <MapPin className="left-[65%] top-[35%]" tone="red" icon="warning" />
          <MapPin className="left-[72%] top-[55%]" tone="navy" icon="hospital" />
          {mobile && <MapPin className="left-[50%] top-[60%]" tone="cyan" icon="location" />}
        </div>

        {mobile ? (
          <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col gap-3">
            <button aria-label="Acercar" className="grid h-11 w-11 place-items-center rounded-full bg-white dark:bg-slate-800 text-[#001b3c] dark:text-white shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <Icon name="plus" className="h-5 w-5" />
            </button>
            <button aria-label="Alejar" className="grid h-11 w-11 place-items-center rounded-full bg-white dark:bg-slate-800 text-[#001b3c] dark:text-white shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </button>
            <Link to="/mapa" aria-label="Abrir mi ubicación" className="grid h-11 w-11 place-items-center rounded-full bg-[#001b3c] text-white shadow-lg ring-4 ring-white/50">
              <Icon name="location" className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="pointer-events-auto absolute inset-x-7 bottom-7 grid grid-cols-4 gap-3">
            <Stat number="24" label="Refugios" color="text-[#0b63f6] dark:text-blue-400" />
            <Stat number="12" label="Hospitales" color="text-[#1960a3] dark:text-blue-300" />
            <Stat number="18" label="Acopios" color="text-[#003d3c] dark:text-teal-400" />
            <Stat number="8" label="Alertas" color="text-[#c9161d] dark:text-red-400" />
          </div>
        )}
      </div>
    </div>
  )
}

function MapPin({ className, tone, icon }) {
  const tones = {
    blue: 'bg-[#0b63f6]',
    teal: 'bg-[#003d3c]',
    red: 'bg-[#dc2626]',
    navy: 'bg-[#001b3c]',
    cyan: 'bg-[#16a3a3]',
  }
  return (
    <span className={`${className} ${tones[tone]} absolute z-20 grid h-7 w-7 place-items-center rounded-full border-2 border-white text-white shadow-lg md:h-8 md:w-8`}>
      <Icon name={icon} className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.4} />
    </span>
  )
}

function Stat({ number, label, color }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700">
      <p className={`text-4xl font-black leading-none ${color}`}>{number}</p>
      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  )
}

function ReportCard({ report }) {
  return (
    <Link
      to={report.to}
      className="group relative min-h-[11rem] rounded-2xl border border-[#d4e4fc] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#adc7f7] dark:hover:border-slate-500 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <span className="absolute right-6 top-6 text-slate-300 dark:text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-[#001b3c] dark:group-hover:text-white">
        <Icon name="chevron" className="h-4 w-4" />
      </span>
      <span className={`${report.bg} ${report.color} grid h-12 w-12 place-items-center rounded-full`}>
        <Icon name={report.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-6 text-lg font-extrabold text-[#001b3c] dark:text-white">{report.title}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-400">{report.description}</p>
    </Link>
  )
}

function MobileReportButton({ report }) {
  return (
    <Link to={report.to} className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 p-3 text-center shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700">
      <Icon name={report.icon} className={`h-7 w-7 ${report.color}`} />
      <span className="text-xs font-bold text-[#001b3c] dark:text-slate-200">{report.mobileTitle}</span>
    </Link>
  )
}

function BottomNavigation() {
  const items = [
    { to: '/mapa', icon: 'map', label: 'Mapa', active: true },
    { to: '/search-person', icon: 'person', label: 'Personas' },
    { to: '/reportar', icon: 'plus', label: 'Reportar' },
    { to: '#', icon: 'menu', label: 'Menú' },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b1121]/95 shadow-[0_-12px_40px_rgba(15,23,42,0.10)] backdrop-blur md:hidden">
      <div className="grid h-[74px] grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <Link key={item.label} to={item.to} className={`flex flex-col items-center justify-center gap-1.5 text-[11px] font-semibold ${item.active ? 'text-[#001b3c] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            <span className={`${item.active ? 'bg-slate-200 dark:bg-slate-800' : ''} grid h-8 min-w-14 place-items-center rounded-full px-3`}>
              <Icon name={item.icon} className="h-5 w-5" />
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default function HomePage() {
  const [openSection, setOpenSection] = useState(null)
  const toggleSection = (id) => setOpenSection(openSection === id ? null : id)

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-[#f4f7ff] dark:bg-[#0b1121] font-sans text-[#0d1c2e] dark:text-slate-300 selection:bg-[#7db6ff] selection:text-[#001b3c]">
      <header className="sticky top-0 z-40 border-b border-[#dbe6f7]/70 dark:border-slate-800 bg-[#f8f9ff]/95 dark:bg-[#0b1121]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-4 md:h-[84px] md:px-8 lg:px-12">
          <Logo compact />
          <nav className="hidden items-center gap-1 rounded-full bg-slate-200/80 p-1.5 dark:bg-slate-800/80 md:flex">
            {navItems.map((item, index) => (
              <Link 
                key={item.label} 
                to={item.to} 
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  index === 0 
                    ? 'bg-white text-[#001b3c] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200 dark:bg-[#001b3c] dark:ring-transparent dark:text-white' 
                    : 'text-slate-600 hover:text-[#001b3c] dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/login" className="hidden rounded-lg bg-[#001b3c] px-7 py-3 text-sm font-extrabold !text-white shadow-sm transition hover:bg-[#123866] md:inline-flex">
            Acceso Operadores
          </Link>
          <button 
            type="button" 
            onClick={() => setIsDark(!isDark)}
            aria-label="Alternar modo oscuro" 
            className="hidden h-10 w-10 place-items-center rounded-full bg-white dark:bg-slate-800 text-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-700 md:grid"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button 
            type="button" 
            aria-label="Abrir menú" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="grid h-10 w-10 place-items-center rounded-xl text-[#001b3c] dark:text-white md:hidden"
          >
            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>

        {/* Menú Móvil Premium */}
        <div 
          className={`md:hidden fixed inset-x-0 top-[72px] bottom-0 z-50 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className={`w-full bg-white dark:bg-slate-900 shadow-2xl rounded-b-[2rem] border-t border-slate-100 dark:border-slate-800 transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex flex-col gap-1.5">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-3.5 rounded-2xl text-[16px] font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                >
                  {item.label}
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
                    <Icon name="chevron" className="h-4 w-4" />
                  </span>
                </Link>
              ))}
              
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-4"></div>
              
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-[15px] font-extrabold !text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Icon name="shield" className="h-4 w-4 opacity-90" />
                  Acceso Operadores
                </Link>
                <button 
                  type="button" 
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center h-[56px] w-[56px] shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
                  aria-label="Alternar modo oscuro"
                >
                  <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-28 md:pb-0">
        <section className="border-l-4 border-[#dc2626] bg-[#ffdad6] dark:bg-red-950/40 dark:border-red-600">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-12 md:py-4">
            <div className="flex items-start gap-3 text-[#93000a] dark:text-red-400">
              <Icon name="warning" className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold md:text-base">Emergencia activa en Venezuela</p>
                <p className="text-xs font-medium dark:text-red-300 md:text-sm">Verifica la información antes de desplazarte.</p>
              </div>
            </div>
            <Link to="#como-funciona" className="hidden items-center gap-1.5 rounded-full bg-white dark:bg-red-900/50 px-5 py-2 text-xs font-bold text-[#b91c1c] dark:text-red-300 shadow-sm transition hover:bg-[#fff7f7] dark:hover:bg-red-900 border border-red-200 dark:border-red-800 md:flex">
              Más información <Icon name="chevron" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-10 md:grid-cols-[1fr_1.1fr] lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-16 md:px-8 lg:px-12 md:py-20">
          <div className="flex flex-col justify-center">
            <div className="hidden w-fit items-center gap-2 rounded-full bg-[#e5eeff] dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 md:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#1960a3] dark:bg-blue-400" /> Plataforma ciudadana de emergencia
            </div>
            <h1 className="mt-2 text-[2rem] font-black leading-[1.08] tracking-[-0.04em] text-[#001b3c] dark:text-white md:mt-9 md:text-[3.7rem]">
              ¿Qué necesitas <br className="hidden md:block" />hacer ahora?
            </h1>
            <p className="mt-5 hidden max-w-lg text-lg leading-8 text-slate-700 dark:text-slate-400 md:block">
              Encuentra ayuda, reporta información importante y consulta puntos activos en Venezuela desde una interfaz rápida y clara.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 md:mt-10 md:gap-4">
              {primaryActions.map((action) => (
                <ActionCard key={action.title} action={action} />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <VenezuelaMapPreview isDark={isDark} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-4 md:hidden">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-black tracking-tight text-[#001b3c] dark:text-white">Mapa Interactivo</h2>
            <Link to="/mapa" className="flex items-center gap-1 text-sm font-bold text-[#0b63f6] dark:text-blue-400">
              Ver completo <Icon name="chevron" className="h-4 w-4" />
            </Link>
          </div>
          <VenezuelaMapPreview isDark={isDark} mobile />
        </section>

        <section className="mt-8 bg-[#eaf1ff] dark:bg-slate-900/50 px-4 py-7 md:mt-0 md:bg-transparent md:px-0 md:py-0">
          <div className="mx-auto w-full max-w-[1440px] md:px-8 lg:px-12 md:py-14">
            <div className="mb-6 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end">
              <div>
                <p className="hidden text-sm font-black uppercase tracking-[0.2em] text-[#0b63f6] dark:text-blue-400 md:block">Reportes rápidos</p>
                <h2 className="text-2xl font-black tracking-tight text-[#001b3c] dark:text-white md:mt-4 md:text-[2.75rem]">Reporta información útil</h2>
                <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-400 md:hidden">Ayuda a mantener el mapa actualizado para todos.</p>
              </div>
              <p className="hidden max-w-[29rem] text-right text-base leading-7 text-slate-600 dark:text-slate-400 md:block">
                Selecciona el tipo de reporte y completa solo los datos necesarios. Cada punto queda pendiente hasta su revisión.
              </p>
            </div>

            <div className="hidden grid-cols-3 gap-6 md:grid">
              {reportTypes.map((report) => (
                <ReportCard key={report.title} report={report} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 md:hidden">
              {reportTypes.map((report) => (
                <MobileReportButton key={report.title} report={report} />
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3 md:gap-8 md:px-8 lg:px-12 md:py-14">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-[#10b981] bg-white dark:bg-slate-800 p-5 shadow-lg shadow-slate-200/60 dark:shadow-none md:p-7 transition-shadow hover:shadow-xl hover:shadow-slate-200/80">
            <div className="flex items-center gap-4 cursor-pointer md:cursor-default" onClick={() => toggleSection('info')}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eafaf3] text-[#0ea66f]">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-black text-[#001b3c] dark:text-white">Información confiable</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 md:hidden">Fuentes verificadas</p>
              </div>
              <Icon name="chevron" className={`ml-auto h-5 w-5 text-slate-400 md:hidden transition-transform ${openSection === 'info' ? 'rotate-180' : ''}`} />
            </div>
            <ul className={`mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 md:block ${openSection === 'info' ? 'block' : 'hidden'}`}>
              {['Reportes revisables por operadores.', 'Estado visible: verificado o no verificado.', 'Datos personales protegidos.'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Icon name="check" className="mt-0.5 h-4 w-4 text-[#10b981]" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-[#0b63f6] bg-white dark:bg-slate-800 p-5 shadow-lg shadow-slate-200/60 dark:shadow-none md:p-7 transition-shadow hover:shadow-xl hover:shadow-slate-200/80">
            <div className="flex items-center gap-4 cursor-pointer md:cursor-default" onClick={() => toggleSection('como')}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#edf4ff] text-[#0b63f6]">
                <Icon name="info" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-black text-[#001b3c] dark:text-white">Cómo funciona</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 md:hidden">Guía de uso rápido</p>
              </div>
              <Icon name="chevron" className={`ml-auto h-5 w-5 text-slate-400 md:hidden transition-transform ${openSection === 'como' ? 'rotate-180' : ''}`} />
            </div>
            <div className={`mt-6 space-y-3 md:block ${openSection === 'como' ? 'block' : 'hidden'}`}>
              {['Selecciona una acción', 'Envía el reporte', 'La comunidad verifica'].map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-xl bg-[#f5f7ff] dark:bg-slate-900/50 px-4 py-3 text-sm font-semibold text-[#001b3c] dark:text-slate-300">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dbeafe] dark:bg-slate-800 text-xs font-black text-[#0b63f6] dark:text-blue-400">{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 border-l-4 border-l-[#dc2626] bg-[#fff1f1] dark:bg-red-950/20 p-5 shadow-lg shadow-red-200/40 dark:shadow-none md:p-7 transition-shadow hover:shadow-xl hover:shadow-red-200/60">
            <div className="flex items-center gap-4 cursor-pointer md:cursor-default" onClick={() => toggleSection('sos')}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#dc2626] text-white md:bg-transparent md:text-[#dc2626]">
                <Icon name="sos" className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-black text-[#b91c1c]">Ayuda urgente</h3>
                <p className="text-sm text-[#dc2626]/80 md:hidden">Contactos de emergencia</p>
              </div>
              <Icon name="chevron" className={`ml-auto h-5 w-5 text-[#dc2626] md:hidden transition-transform ${openSection === 'sos' ? 'rotate-180' : ''}`} />
            </div>
            <div className={`mt-6 space-y-4 md:block ${openSection === 'sos' ? 'block' : 'hidden'}`}>
              <EmergencyCall label="Emergencias" value="911" phone="911" />
              <EmergencyCall label="Protección Civil" value="0800-PCIVIL-1" phone="08007248451" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-2 md:px-8 lg:px-12 md:pb-24 md:pt-0">
          <div className="relative overflow-hidden rounded-2xl bg-[#0a2a57] dark:bg-[#061833] p-5 text-white shadow-[0_20px_50px_rgba(0,32,69,0.20)] md:bg-[#2563eb] md:dark:bg-[#1e40af] md:p-8">
            <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:18px_18px]" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 md:grid">
                  <Icon name="users" className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-2xl font-black md:text-3xl">¿Quieres colaborar como operador?</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/88 md:text-base">Ayuda a revisar información y mantener el mapa actualizado.</p>
                  <p className="mt-2 text-sm leading-6 text-white/85 md:hidden">Únete como operador voluntario para verificar reportes y ayudar a mantener la red segura.</p>
                </div>
              </div>
              <Link to="/operator-register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-black !text-blue-700 shadow-sm transition hover:bg-slate-50 md:rounded-full">
                <span className="md:hidden">Registrarse como Operador</span>
                <span className="hidden md:inline-flex">Postularme</span>
                <Icon name="chevron" className="h-4 w-4 md:hidden" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1121] md:block">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-8 lg:px-12 py-8 text-sm text-slate-600 dark:text-slate-400">
          <Logo compact />
          <p>© 2025 RefuMap Venezuela. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link to="#" className="hover:text-[#001b3c] dark:hover:text-white transition">Privacidad</Link>
            <Link to="#" className="hover:text-[#001b3c] dark:hover:text-white transition">Términos</Link>
            <Link to="#" className="hover:text-[#001b3c] dark:hover:text-white transition">Contacto</Link>
          </div>
        </div>
      </footer>

      <Link to="/reportar" aria-label="Nuevo reporte rápido" className="fixed bottom-[92px] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#001b3c] text-white shadow-[0_18px_35px_rgba(0,32,69,0.35)] hover:bg-[#002b5e] hover:scale-105 transition-all md:hidden">
        <Icon name="plus" className="h-7 w-7 !text-white" strokeWidth={3} />
      </Link>
      <BottomNavigation />
      <ChatBot />
    </div>
  )
}

function EmergencyCall({ label, value, phone }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
      <span className="text-sm font-semibold text-[#001b3c] dark:text-white">{label}</span>
      <a href={`tel:${phone}`} className="rounded-full bg-[#dc2626] px-4 py-1.5 text-sm font-black text-white hover:bg-[#b91c1c]">
        {value}
      </a>
    </div>
  )
}
