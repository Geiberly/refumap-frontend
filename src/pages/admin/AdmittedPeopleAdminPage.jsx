import React, { useState, useEffect, useCallback } from 'react'
import { adminGetAdmittedPeople, adminUpdateAdmittedPersonStatus } from '../../api/admittedPeople'
import { SkeletonList } from '../../components/ui/Skeleton'

const STATUS_BADGES = {
  ingresada:       { bg: '#fef3c7', color: '#78350f', label: 'Ingresada' },
  en_observacion:  { bg: '#dbeafe', color: '#1e3a5f', label: 'En Observación' },
  trasladada:      { bg: '#ede9fe', color: '#4c1d95', label: 'Trasladada' },
  dada_de_alta:    { bg: '#dcfce7', color: '#14532d', label: 'Alta' },
  sin_identificar: { bg: '#fee2e2', color: '#7f1d1d', label: 'Sin ID' },
}

const VISIBILITY_BADGES = {
  active:    { color: 'var(--color-success)',       label: '● Público' },
  hidden:    { color: 'var(--color-warning-dark)',  label: '● Oculto' },
  duplicate: { color: 'var(--color-text-muted)',    label: '● Duplicado' },
  removed:   { color: 'var(--color-danger)',        label: '● Removido' },
}

function StatusBadge({ status }) {
  const b = STATUS_BADGES[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem',
      fontWeight: 700, background: b.bg, color: b.color,
    }}>
      {b.label}
    </span>
  )
}

function PersonDetailModal({ person, onClose, onStatusChange }) {
  const [visibility, setVisibility] = useState(person.visibility_status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const MESSAGES = {
    hidden:    '¿Ocultar este registro? No será visible públicamente.',
    removed:   '¿Remover por información falsa o inapropiada? No se puede deshacer fácilmente.',
    duplicate: '¿Marcar como duplicado?',
    active:    '¿Restaurar la visibilidad de este registro?',
  }

  const handleVisibilityChange = async (newStatus) => {
    if (!window.confirm(MESSAGES[newStatus])) return
    setSaving(true)
    setError(null)
    try {
      await onStatusChange(person.id, newStatus)
      setVisibility(newStatus)
    } catch {
      setError('Error al actualizar el estado.')
    } finally {
      setSaving(false)
    }
  }

  const vis = VISIBILITY_BADGES[visibility] || { color: '#ccc', label: visibility }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'relative', zIndex: 1001, background: 'white',
        borderRadius: 'var(--radius-xl)', padding: '1.5rem',
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>{person.full_name}</h2>
            {person.alias && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Alias: {person.alias}</p>}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: 'var(--font-size-sm)', color: '#7f1d1d' }}>
            ⚠ {error}
          </div>
        )}

        {/* Datos del paciente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>EDAD</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>{person.approx_age || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>SEXO</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>{person.sex || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>ESTADO MÉDICO</p>
            <StatusBadge status={person.status_general} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>VISIBILIDAD</p>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: vis.color }}>{vis.label}</span>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>CENTRO MÉDICO</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>{person.hospital?.name || person.hospital_name_snapshot || '—'}</p>
          </div>
          {person.admitted_at && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>FECHA DE INGRESO</p>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>{new Date(person.admitted_at).toLocaleString('es')}</p>
            </div>
          )}
          {person.public_notes && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2px' }}>NOTAS PÚBLICAS</p>
              <p style={{ fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>"{person.public_notes}"</p>
            </div>
          )}
        </div>

        {/* Datos privados del reportante */}
        {(person.reporter_name || person.reporter_contact) && (
          <div style={{ background: '#f3f4f6', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>🔒 DATOS PRIVADOS DEL REPORTANTE</p>
            {person.reporter_name && <p style={{ fontSize: 'var(--font-size-sm)' }}><b>Nombre:</b> {person.reporter_name}</p>}
            {person.reporter_contact && <p style={{ fontSize: 'var(--font-size-sm)' }}><b>Contacto:</b> {person.reporter_contact}</p>}
          </div>
        )}

        {/* Acciones de moderación */}
        <div>
          <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>CAMBIAR VISIBILIDAD</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleVisibilityChange('active')} disabled={saving || visibility === 'active'} className="btn btn-success btn-sm">
              ✓ Mostrar
            </button>
            <button onClick={() => handleVisibilityChange('hidden')} disabled={saving || visibility === 'hidden'} className="btn btn-sm" style={{ background: '#fef3c7', color: '#78350f' }}>
              👁 Ocultar
            </button>
            <button onClick={() => handleVisibilityChange('duplicate')} disabled={saving || visibility === 'duplicate'} className="btn btn-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              ⊕ Duplicado
            </button>
            <button onClick={() => handleVisibilityChange('removed')} disabled={saving || visibility === 'removed'} className="btn btn-danger btn-sm">
              ✕ Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdmittedPeopleAdminPage() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ search: '', visibility_status: '' })
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminGetAdmittedPeople({ ...filters, page })
      setPeople(data.data || [])
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      })
    } catch {
      setError('Error al cargar los registros. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id, visibility_status) => {
    await adminUpdateAdmittedPersonStatus(id, visibility_status)
    // Actualizar localmente sin recargar si el seleccionado es el mismo
    setPeople(prev => prev.map(p => p.id === id ? { ...p, visibility_status } : p))
    if (selected?.id === id) setSelected(prev => ({ ...prev, visibility_status }))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>🏥 Personas Ingresadas</h1>
        <button onClick={() => load()} className="btn btn-ghost btn-sm" disabled={loading}>
          {loading ? '⟳' : '⟳ Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Buscar por nombre o apodo..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="form-input"
          style={{ flex: '1 1 220px', maxWidth: 320 }}
        />
        <select
          value={filters.visibility_status}
          onChange={e => setFilters(f => ({ ...f, visibility_status: e.target.value }))}
          className="form-select"
          style={{ flex: '0 1 180px' }}
        >
          <option value="">Toda visibilidad</option>
          <option value="active">● Públicos</option>
          <option value="hidden">● Ocultos</option>
          <option value="duplicate">● Duplicados</option>
          <option value="removed">● Removidos</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#7f1d1d', fontSize: 'var(--font-size-sm)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Descripción */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1rem', background: '#f8fafc' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Registros ciudadanos de personas en centros de salud. Haz clic en una fila para ver detalles y moderar la visibilidad. Los datos del reportante son privados y solo visibles aquí.
        </p>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : people.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '2rem' }}>🛏️</p>
          <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>No hay registros con estos filtros</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                  {['Nombre / Apodo', 'Datos', 'Centro Médico', 'Estado', 'Visibilidad', 'Registrado'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map(p => {
                  const vis = VISIBILITY_BADGES[p.visibility_status] || { color: '#ccc', label: p.visibility_status }
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        opacity: p.visibility_status !== 'active' ? 0.65 : 1,
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ display: 'block' }}>{p.full_name}</strong>
                        {p.alias && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Alias: {p.alias}</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                        {p.approx_age || '?'} años / {p.sex || '?'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', maxWidth: 180 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {p.hospital?.name || p.hospital_name_snapshot || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusBadge status={p.status_general} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: vis.color }}>{vis.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {new Date(p.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {pagination.total} registros en total
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => load(page)}
                    className={`btn btn-sm ${page === pagination.current_page ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <PersonDetailModal
          person={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
