import React, { useState, useEffect, useCallback } from 'react'
import { adminGetHospitalNeedsReports, adminUpdateHospitalNeedsReportStatus } from '../../api/hospitalNeeds'
import { SkeletonList } from '../../components/ui/Skeleton'

const STATUS_STYLES = {
  pending:  { bg: '#fef3c7', color: '#78350f', label: '⏳ Pendiente' },
  reviewed: { bg: '#dcfce7', color: '#14532d', label: '✅ Revisado' },
  rejected: { bg: '#fee2e2', color: '#7f1d1d', label: '❌ Rechazado' },
}

function NeedsBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function HospitalNeedsAdminPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [filters, setFilters] = useState({ status: 'pending' })
  const [processingId, setProcessingId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminGetHospitalNeedsReports()
      const all = data.data || []
      // Filtrar localmente si no hay filtrado en backend
      const filtered = filters.status ? all.filter(r => r.status === filters.status) : all
      setReports(filtered)
    } catch {
      setError('Error al cargar los reportes de necesidades.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleUpdateStatus = async (id, status) => {
    setActionError(null)
    setProcessingId(id)
    try {
      await adminUpdateHospitalNeedsReportStatus(id, status)
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {
      setActionError('Error al actualizar el reporte.')
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>💉 Necesidades Hospitalarias</h1>
        <button onClick={fetchData} className="btn btn-ghost btn-sm" disabled={loading}>⟳ Actualizar</button>
      </div>

      {/* Resumen */}
      {pendingCount > 0 && !loading && (
        <div style={{
          padding: '0.75rem 1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-warning)', marginBottom: '1rem',
          fontSize: 'var(--font-size-sm)', color: '#78350f', fontWeight: 600,
        }}>
          ⏳ Hay {pendingCount} reporte{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de revisión.
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="form-select"
          style={{ flex: '0 1 200px' }}
        >
          <option value="">Todos los estados</option>
          <option value="pending">⏳ Pendientes</option>
          <option value="reviewed">✅ Revisados</option>
          <option value="rejected">❌ Rechazados</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#7f1d1d', fontSize: 'var(--font-size-sm)' }}>
          ⚠ {error}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#7f1d1d', fontSize: 'var(--font-size-sm)' }}>
          ⚠ {actionError}
        </div>
      )}

      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1rem', background: '#f8fafc' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Revisa los reportes ciudadanos sobre lo que falta en hospitales. Al marcar como revisado, el equipo en el centro puede actuar. Si es falso o inapropiado, recházalo.
        </p>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>
            {filters.status === 'pending' ? '¡Sin reportes pendientes!' : 'No hay reportes con estos filtros'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                  {['Hospital', 'Necesidad Reportada', 'Detalle', 'Reportado por', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  const isProcessing = processingId === r.id
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)', opacity: r.status === 'rejected' ? 0.6 : 1 }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: 180 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {r.hospital_name || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', maxWidth: 180 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {r.needs}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>
                          {r.description || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ display: 'block', fontWeight: 600 }}>{r.reporter_name || 'Anónimo'}</span>
                        {r.reporter_contact && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{r.reporter_contact}</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <NeedsBadge status={r.status} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {r.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-success btn-sm"
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(r.id, 'reviewed')}
                            >
                              {isProcessing ? '⟳' : '✓ Revisar'}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#fee2e2', color: '#7f1d1d' }}
                              disabled={isProcessing}
                              onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
