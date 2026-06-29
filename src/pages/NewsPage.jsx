import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import api from '../api/axios'

function Icon({ name, className = 'h-5 w-5' }) {
  const iconPaths = {
    warning: (
      <>
        <path d="M12 3.8 2.9 19h18.2L12 3.8Z" />
        <path d="M12 9.3v4.3M12 16.8h.01" />
      </>
    ),
    check: <path d="m5 12.4 4.1 4.1L19 6.8" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 5.5 6v5.4c0 4.1 2.8 7.6 6.5 8.9 3.7-1.3 6.5-4.8 6.5-8.9V6L12 3.5Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {iconPaths[name]}
    </svg>
  )
}

function ReportCard({ report }) {
  const getReportTypeLabel = (type) => {
    const types = {
      new_help_point: 'Nuevo Punto de Ayuda',
      shelter_full: 'Refugio Lleno',
      hospital_closed: 'Hospital Cerrado',
      road_blocked: 'Vía Bloqueada',
      danger_zone: 'Zona Peligrosa',
      lack_of_supplies: 'Falta de Insumos',
      collapsed_building: 'Edificio Colapsado',
      incorrect_info: 'Información Incorrecta',
      other: 'Otro',
    }
    return types[type] || 'Reporte Ciudadano'
  }

  const date = new Date(report.reviewed_at || report.created_at).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
          <Icon name="warning" className="h-3.5 w-3.5" />
          {getReportTypeLabel(report.report_type)}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {date}
        </span>
      </div>
      <h3 className="mb-2 text-xl font-black text-[#001b3c] dark:text-white leading-tight">
        {report.title}
      </h3>
      {report.description && (
        <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {report.description}
        </p>
      )}
      {report.address && (
        <div className="mb-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-700 dark:text-slate-300">
          <strong>Ubicación:</strong> {report.address}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <Icon name="shield" className="h-4 w-4" />
          Verificado por Operadores
        </span>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/public/reports')
        setReports(response.data.data || [])
      } catch (error) {
        toast.error('Error al cargar las noticias.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f7ff] dark:bg-[#0b1121] font-sans text-[#0d1c2e] dark:text-slate-300">
      <header className="sticky top-0 z-40 border-b border-[#dbe6f7]/70 dark:border-slate-800 bg-[#f8f9ff]/95 dark:bg-[#0b1121]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center px-4 md:h-[84px] md:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2 text-[#001b3c] dark:text-white font-bold hover:opacity-80">
            <Icon name="check" className="h-5 w-5 rotate-180" /> Volver al Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#001b3c] dark:text-white md:text-5xl">
            Noticias y Alertas
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Reportes ciudadanos verificados y moderados por nuestros operadores para combatir la desinformación.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white dark:bg-slate-800" />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="flex flex-col gap-6">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
              No hay reportes verificados en este momento.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
