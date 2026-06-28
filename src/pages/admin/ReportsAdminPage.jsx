import React, { useEffect, useState, useCallback } from 'react'
import { adminGetReports, adminVerifyReport, adminRejectReport, adminConvertReport, getCategories } from '../../api/mapPoints'
import { SkeletonList } from '../../components/ui/Skeleton'

const REPORT_TYPE_LABELS = {
  new_help_point:     '🆕 Nuevo punto',
  shelter_full:       '🏠 Refugio lleno',
  hospital_closed:    '🏥 Hospital cerrado',
  road_blocked:       '🚧 Vía bloqueada',
  danger_zone:        '⚠️ Zona peligrosa',
  lack_of_supplies:   '📦 Falta de suministros',
  collapsed_building: '🏚️ Edificio colapsado',
  incorrect_info:     '✏️ Info incorrecta',
  other:              '❓ Otro',
}

const STATUS_STYLES = {
  pending:   { label: 'Pendiente',   bg: '#fef3c7', color: '#78350f' },
  verified:  { label: 'Verificado',  bg: '#dcfce7', color: '#14532d' },
  rejected:  { label: 'Rechazado',   bg: '#fee2e2', color: '#7f1d1d' },
  converted: { label: 'Convertido',  bg: '#ede9fe', color: '#4c1d95' },
}

export default function ReportsAdminPage() {
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'pending', report_type: '' })
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null) // 'verify' | 'reject' | 'convert'
  const [notes, setNotes] = useState('')
  const [convertForm, setConvertForm] = useState({ category_id: '', name: '', status: 'unverified', source: 'citizen' })
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [reportsRes, catsRes] = await Promise.all([
        adminGetReports(filters),
        categories.length === 0 ? getCategories() : Promise.resolve(null),
      ])
      setReports(reportsRes.data.data || [])
      if (catsRes) setCategories(catsRes.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters, categories.length])

  useEffect(() => { load() }, [load])

  const handleAction = async () => {
    if (!selected) return
    setSubmitting(true)
    setActionError(null)
    try {
      if (action === 'verify') {
        await adminVerifyReport(selected.id, notes)
      } else if (action === 'reject') {
        await adminRejectReport(selected.id, notes)
      } else if (action === 'convert') {
        await adminConvertReport(selected.id, {
          ...convertForm,
          latitude: selected.latitude,
          longitude: selected.longitude,
        })
      }
      setSelected(null)
      setAction(null)
      setNotes('')
      load()
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error procesando el reporte.')
    } finally {
      setSubmitting(false)
    }
  }

  const openAction = (report, act) => {
    setSelected(report)
    setAction(act)
    setNotes('')
    setConvertForm(f => ({ ...f, name: report.title }))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>📋 Reportes ciudadanos</h1>
        <button onClick={load} className="btn btn-ghost btn-sm">⟳ Actualizar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="form-select" style={{ flex: '0 1 180px' }}>
          <option value="">Todos los estados</option>
          <option value="pending">⏳ Pendientes</option>
          <option value="verified">✅ Verificados</option>
          <option value="rejected">❌ Rechazados</option>
          <option value="converted">🔄 Convertidos</option>
        </select>
        <select value={filters.report_type} onChange={e => setFilters(f => ({ ...f, report_type: e.target.value }))} className="form-select" style={{ flex: '0 1 200px' }}>
          <option value="">Todos los tipos</option>
          {Object.entries(REPORT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Lista de reportes */}
      {loading ? (
        <SkeletonList count={4} />
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</p>
          <p style={{ fontWeight: 600 }}>
            {filters.status === 'pending' ? '¡Sin reportes pendientes!' : 'No hay reportes con estos filtros'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reports.map(report => {
            const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.pending
            return (
              <div key={report.id} className="card" style={{ overflow: 'visible' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                        <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>
                          {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{report.title}</h3>
                      {report.description && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                          {report.description.length > 120 ? report.description.slice(0, 120) + '…' : report.description}
                        </p>
                      )}
                      {report.address && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          📍 {report.address}
                        </p>
                      )}
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {new Date(report.created_at).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {report.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button onClick={() => openAction(report, 'verify')} className="btn btn-success btn-sm" id={`btn-verify-${report.id}`}>
                          ✅ Verificar
                        </button>
                        <button onClick={() => openAction(report, 'convert')} className="btn btn-sm" style={{ background: '#ede9fe', color: '#4c1d95' }} id={`btn-convert-${report.id}`}>
                          🔄 Convertir
                        </button>
                        <button onClick={() => openAction(report, 'reject')} className="btn btn-sm" style={{ background: '#fee2e2', color: '#7f1d1d' }} id={`btn-reject-${report.id}`}>
                          ❌ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de acción */}
      {selected && action && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'relative', zIndex: 1001, background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
              {action === 'verify' ? '✅ Verificar reporte' :
               action === 'reject' ? '❌ Rechazar reporte' : '🔄 Convertir en punto del mapa'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              "{selected.title}"
            </p>

            {actionError && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: 'var(--font-size-sm)', color: '#7f1d1d' }}>
                ⚠ {actionError}
              </div>
            )}

            {action === 'convert' && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label required">Categoría del nuevo punto</label>
                  <select value={convertForm.category_id} onChange={e => setConvertForm(f => ({ ...f, category_id: e.target.value }))} className="form-select">
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label required">Nombre del punto</label>
                  <input value={convertForm.name} onChange={e => setConvertForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select value={convertForm.status} onChange={e => setConvertForm(f => ({ ...f, status: e.target.value }))} className="form-select">
                      <option value="active">Activo</option>
                      <option value="unverified">No verificado</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuente</label>
                    <select value={convertForm.source} onChange={e => setConvertForm(f => ({ ...f, source: e.target.value }))} className="form-select">
                      <option value="citizen">Ciudadano</option>
                      <option value="operator">Operador</option>
                      <option value="official">Oficial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Notas del revisor (opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-textarea" rows={2} placeholder="Motivo o comentarios..." />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAction}
                disabled={submitting || (action === 'convert' && !convertForm.category_id)}
                className={`btn ${action === 'verify' ? 'btn-success' : action === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                style={{ flex: 1 }}
              >
                {submitting ? '⟳ Procesando...' : 'Confirmar'}
              </button>
              <button onClick={() => setSelected(null)} className="btn btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
