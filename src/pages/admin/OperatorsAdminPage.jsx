import React, { useState, useEffect } from 'react'
import { getOperators, getPendingOperators, approveOperator, rejectOperator, disableOperator, enableOperator } from '../../api/operators'
import { SkeletonList } from '../../components/ui/Skeleton'
import { toast } from 'sonner'

function RejectModal({ operator, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    await onConfirm(operator.id, reason)
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'relative', zIndex: 1001, background: 'white',
        borderRadius: 'var(--radius-xl)', padding: '1.5rem',
        width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-xl)',
      }}>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>❌ Rechazar solicitud</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          ¿Rechazar la solicitud de <strong>{operator?.name}</strong>?
        </p>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Motivo del rechazo (opcional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Ej: No cumple los requisitos de zona de cobertura..."
            style={{ minHeight: 80 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleConfirm} disabled={saving} className="btn btn-danger" style={{ flex: 1 }}>
            {saving ? '⟳ Rechazando...' : 'Confirmar rechazo'}
          </button>
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function OperatorStatusBadge({ status }) {
  const styles = {
    approved:         { bg: '#dcfce7', color: '#14532d', label: '✓ Aprobado' },
    rejected:         { bg: '#fee2e2', color: '#7f1d1d', label: '✕ Rechazado' },
    disabled:         { bg: '#f3f4f6', color: '#374151', label: '— Desactivado' },
    pending_approval: { bg: '#fef3c7', color: '#78350f', label: '⏳ Pendiente' },
  }
  const s = styles[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem',
      fontWeight: 700, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

export default function OperatorsAdminPage() {
  const [operators, setOperators] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [opRes, pendRes] = await Promise.all([getOperators(), getPendingOperators()])
      const allOps = opRes.data.data || []
      setOperators(allOps.filter(o => o.status !== 'pending_approval'))
      setPending(pendRes.data.data || [])
    } catch {
      setError('Error al cargar los operadores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleApprove = (id) => {
    toast('¿Aprobar operador?', {
      description: 'Tendrá acceso completo al panel de administración.',
      duration: 10000,
      action: {
        label: 'Aprobar',
        onClick: async () => {
          try {
            await approveOperator(id)
            toast.success('Operador aprobado correctamente.')
            fetchData()
          } catch {
            toast.error('Error al aprobar operador.')
          }
        }
      },
      cancel: { label: 'Cancelar', onClick: () => {} }
    })
  }

  const handleReject = async (id, reason) => {
    try {
      await rejectOperator(id, reason)
      toast.success('Solicitud rechazada.')
      fetchData()
    } catch {
      toast.error('Error al rechazar operador.')
    }
  }

  const handleToggleStatus = (operator) => {
    const isDisabling = operator.status !== 'disabled'
    toast(isDisabling ? '¿Desactivar operador?' : '¿Reactivar operador?', {
      description: isDisabling ? 'No podrá iniciar sesión en el panel.' : 'Podrá volver a iniciar sesión.',
      duration: 10000,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          try {
            if (isDisabling) await disableOperator(operator.id)
            else await enableOperator(operator.id)
            toast.success(`Operador ${isDisabling ? 'desactivado' : 'reactivado'} correctamente.`)
            fetchData()
          } catch {
            toast.error('Error al cambiar el estado del operador.')
          }
        }
      },
      cancel: { label: 'Cancelar', onClick: () => {} }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>👥 Gestión de Operadores</h1>
        <button onClick={fetchData} className="btn btn-ghost btn-sm" disabled={loading}>⟳ Actualizar</button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#7f1d1d', fontSize: 'var(--font-size-sm)' }}>
          ⚠ {error}
        </div>
      )}

      {loading ? <SkeletonList count={4} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

          {/* Solicitudes Pendientes */}
          <section className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-warning)', maxWidth: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                ⏳ Solicitudes Pendientes
                {pending.length > 0 && (
                  <span style={{ marginLeft: '0.5rem', background: 'var(--color-warning)', color: 'white', borderRadius: '999px', padding: '1px 8px', fontSize: '0.75rem' }}>
                    {pending.length}
                  </span>
                )}
              </h2>
            </div>

            {pending.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                ✅ Sin solicitudes pendientes.
              </p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                      {['Nombre', 'Email', 'Org / Cargo', 'Zona', 'Motivación', 'Registrado', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{p.email}</td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          {p.city ? `${p.city}, ${p.state}` : p.state || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: 200 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                            {p.motivation || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          {formatDate(p.created_at)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(p.id)}>
                              ✓ Aprobar
                            </button>
                            <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#7f1d1d' }} onClick={() => setRejectTarget(p)}>
                              ✕ Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Operadores Registrados */}
          <section className="card" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: '1rem' }}>
              👷 Operadores Registrados ({operators.length})
            </h2>
            {operators.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Sin operadores registrados.</p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                      {['Nombre', 'Email', 'Organización', 'Estado', 'Registrado', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{o.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{o.email}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{o.organization || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}><OperatorStatusBadge status={o.status} /></td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          {formatDate(o.created_at)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {o.status === 'approved' && (
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleToggleStatus(o)}>
                              Desactivar
                            </button>
                          )}
                          {o.status === 'disabled' && (
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => handleToggleStatus(o)}>
                              Reactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          operator={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  )
}
