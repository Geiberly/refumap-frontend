import React, { useEffect, useState, useCallback } from 'react'
import {
  adminGetMapPoints, adminDeleteMapPoint,
  adminCreateMapPoint, adminUpdateMapPoint,
  getCategories
} from '../../api/mapPoints'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { toast } from 'sonner'
import { Edit2, Trash2 } from 'lucide-react'

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
    <div style={{
      width: '44px', height: '24px', 
      background: checked ? '#10b981' : '#d1d5db',
      borderRadius: '9999px',
      position: 'relative',
      transition: 'background 0.3s ease',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: '20px', height: '20px',
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'left 0.3s ease, transform 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
  </label>
);

const EMPTY_FORM = {
  category_id: '', name: '', description: '', address: '',
  latitude: '', longitude: '', status: 'unverified', source: 'operator',
  capacity_total: '', capacity_available: '', urgency_level: 1,
  accepts_children: false, accepts_elderly: false, accepts_pets: false,
  has_water: false, has_food: false, has_medicine: false, has_power_charging: false,
  contact_phone: '', notes: '',
}

function CheckboxGroup({ label, name, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--font-size-sm)', userSelect: 'none' }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange}
        style={{ width: 18, height: 18, cursor: 'pointer' }} />
      {label}
    </label>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'relative', zIndex: 1001,
        background: 'white', width: '100%', maxWidth: 600,
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{
          position: 'sticky', top: 0, background: 'white',
          padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 2,
        }}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function MapPointsAdminPage() {
  const [points, setPoints] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editingPoint, setEditingPoint] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ status: '', category_id: '', search: '' })
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 })
  const [deleteError, setDeleteError] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, ...filters }
      const { data } = await adminGetMapPoints(params)
      setPoints(data.data || [])
      setPagination({ current_page: data.current_page, last_page: data.last_page })
      setSelectedIds([]) // Limpiar seleccionados al cambiar de página
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.data || []))
  }, [])

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      toast('¿Seleccionar todos?', {
        description: `¿Estás seguro de marcar los ${points.length} puntos de esta página?`,
        duration: 8000,
        action: {
          label: 'Sí, seleccionar',
          onClick: () => setSelectedIds(points.map(p => p.id))
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => {}
        }
      })
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleBulkAction = (actionType) => {
    if (selectedIds.length === 0) return;
    
    let title = '';
    let successMsg = '';
    
    if (actionType === 'active') {
      title = '¿Activar seleccionados?';
      successMsg = 'activados y verificados';
    } else if (actionType === 'closed') {
      title = '¿Desactivar seleccionados?';
      successMsg = 'desactivados (cerrados)';
    } else if (actionType === 'delete') {
      title = '¿Eliminar seleccionados de forma permanente?';
      successMsg = 'eliminados';
    }

    toast(title, {
      description: `Esta acción aplicará a ${selectedIds.length} puntos.`,
      duration: 10000,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          setLoading(true);
          try {
            if (actionType === 'delete') {
              await Promise.all(selectedIds.map(id => adminDeleteMapPoint(id)));
            } else {
              await Promise.all(selectedIds.map(id => adminUpdateMapPoint(id, { status: actionType })));
            }
            toast.success(`Los puntos fueron ${successMsg} correctamente.`);
            setSelectedIds([]);
            load();
          } catch (err) {
            toast.error('Hubo un problema procesando algunos puntos.');
            setLoading(false);
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  }

  const handleToggleStatus = async (point) => {
    const newStatus = point.status === 'active' ? 'closed' : 'active';
    // Optimizacion: actualizar localmente para que sea instantaneo
    setPoints(points.map(p => p.id === point.id ? { ...p, status: newStatus } : p));
    try {
      await adminUpdateMapPoint(point.id, { status: newStatus });
      toast.success(`Punto ${newStatus === 'active' ? 'Activado' : 'Desactivado'}`);
    } catch (err) {
      toast.error('Error al cambiar el estado del punto');
      load(); // reverted to real state
    }
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingPoint(null)
    setModal('create')
  }

  const openEdit = (point) => {
    setForm({
      category_id: point.category_id || '',
      name: point.name || '',
      description: point.description || '',
      address: point.address || '',
      latitude: point.latitude || '',
      longitude: point.longitude || '',
      status: point.status || 'unverified',
      source: point.source || 'operator',
      capacity_total: point.capacity_total || '',
      capacity_available: point.capacity_available || '',
      urgency_level: point.urgency_level || 1,
      accepts_children: !!point.accepts_children,
      accepts_elderly: !!point.accepts_elderly,
      accepts_pets: !!point.accepts_pets,
      has_water: !!point.has_water,
      has_food: !!point.has_food,
      has_medicine: !!point.has_medicine,
      has_power_charging: !!point.has_power_charging,
      contact_phone: point.contact_phone || '',
      notes: point.notes || '',
    })
    setErrors({})
    setEditingPoint(point)
    setModal('edit')
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (modal === 'create') {
        await adminCreateMapPoint(form)
      } else {
        await adminUpdateMapPoint(editingPoint.id, form)
      }
      setModal(null)
      load()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else setErrors({ _general: err.response?.data?.message || 'Error al guardar.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminDeleteMapPoint(id)
      load()
    } catch (e) {
      setDeleteError('Error al eliminar el punto. Verifica que no tenga dependencias.')
    }
  }

  const handleQuickVerify = async (id) => {
    if (!window.confirm('¿Marcar este punto como Verificado y Activo?')) return;
    try {
      await adminUpdateMapPoint(id, { status: 'active' });
      load();
    } catch (err) {
      setDeleteError('Error al verificar el punto.');
    }
  }

  const PointForm = (
    <form onSubmit={handleSave}>
      {errors._general && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: 'var(--font-size-sm)', color: '#7f1d1d' }}>
          {errors._general}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label required">Categoría</label>
            <select name="category_id" value={form.category_id} onChange={handleFormChange} className={`form-select ${errors.category_id ? 'error' : ''}`}>
              <option value="">Seleccionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category_id && <p className="form-error">⚠ {errors.category_id}</p>}
          </div>
          <div className="form-group">
            <label className="form-label required">Estado</label>
            <select name="status" value={form.status} onChange={handleFormChange} className="form-select">
              <option value="active">✅ Activo</option>
              <option value="full">⚠️ Saturado</option>
              <option value="closed">❌ Cerrado</option>
              <option value="unverified">❓ No verificado</option>
              <option value="danger">🚨 Peligro</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">Nombre</label>
          <input name="name" value={form.name} onChange={handleFormChange} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Nombre del punto" />
          {errors.name && <p className="form-error">⚠ {errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input name="address" value={form.address} onChange={handleFormChange} className="form-input" placeholder="Calle, número, colonia..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label required">Latitud</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleFormChange} className={`form-input ${errors.latitude ? 'error' : ''}`} placeholder="10.4806" />
            {errors.latitude && <p className="form-error">⚠ {errors.latitude}</p>}
          </div>
          <div className="form-group">
            <label className="form-label required">Longitud</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleFormChange} className={`form-input ${errors.longitude ? 'error' : ''}`} placeholder="-66.9036" />
            {errors.longitude && <p className="form-error">⚠ {errors.longitude}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Capacidad total</label>
            <input name="capacity_total" type="number" min="0" value={form.capacity_total} onChange={handleFormChange} className="form-input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Capacidad disponible</label>
            <input name="capacity_available" type="number" min="0" value={form.capacity_available} onChange={handleFormChange} className="form-input" placeholder="0" />
          </div>
        </div>

        <div>
          <p className="form-label" style={{ marginBottom: '0.5rem' }}>Servicios disponibles</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <CheckboxGroup label="💧 Agua" name="has_water" checked={form.has_water} onChange={handleFormChange} />
            <CheckboxGroup label="🍽️ Comida" name="has_food" checked={form.has_food} onChange={handleFormChange} />
            <CheckboxGroup label="💊 Medicinas" name="has_medicine" checked={form.has_medicine} onChange={handleFormChange} />
            <CheckboxGroup label="🔌 Carga eléctrica" name="has_power_charging" checked={form.has_power_charging} onChange={handleFormChange} />
            <CheckboxGroup label="👶 Acepta niños" name="accepts_children" checked={form.accepts_children} onChange={handleFormChange} />
            <CheckboxGroup label="🧓 Adultos mayores" name="accepts_elderly" checked={form.accepts_elderly} onChange={handleFormChange} />
            <CheckboxGroup label="🐾 Acepta mascotas" name="accepts_pets" checked={form.accepts_pets} onChange={handleFormChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notas importantes</label>
          <textarea name="notes" value={form.notes} onChange={handleFormChange} className="form-textarea" rows={2} placeholder="Horarios, condiciones especiales..." />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono de contacto</label>
          <input name="contact_phone" type="tel" value={form.contact_phone} onChange={handleFormChange} className="form-input" placeholder="+502 1234-5678" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
            {saving ? '⟳ Guardando...' : (modal === 'create' ? '✅ Crear punto' : '💾 Guardar cambios')}
          </button>
          <button type="button" onClick={() => setModal(null)} className="btn btn-ghost">Cancelar</button>
        </div>
      </div>
    </form>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>🗺️ Puntos del mapa</h1>
        <button onClick={openCreate} className="btn btn-primary" id="btn-create-point">
          + Agregar punto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Buscar..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="form-input"
          style={{ flex: '1 1 200px', maxWidth: 280 }}
        />
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="form-select"
          style={{ flex: '0 1 160px' }}
        >
          <option value="">Todos los estados</option>
          <option value="active">✅ Activos</option>
          <option value="unverified">⏳ Pendientes (No verificado)</option>
          <option value="full">⚠️ Saturados</option>
          <option value="closed">❌ Cerrados</option>
          <option value="danger">🚨 Peligro</option>
        </select>
        <select
          value={filters.category_id}
          onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}
          className="form-select"
          style={{ flex: '0 1 180px' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        
        {selectedIds.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, paddingRight: '0.5rem' }}>
              {selectedIds.length} seleccionados
            </span>
            <button onClick={() => handleBulkAction('active')} className="btn btn-sm" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.25rem 0.5rem' }}>
              ✅ Activar
            </button>
            <button onClick={() => handleBulkAction('closed')} className="btn btn-sm" style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.25rem 0.5rem' }}>
              ❌ Desactivar
            </button>
            <button onClick={() => handleBulkAction('delete')} className="btn btn-sm" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem' }}>
              🗑️ Eliminar
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#7f1d1d', fontSize: 'var(--font-size-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {deleteError}</span>
          <button onClick={() => setDeleteError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f1d1d', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabla */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem 1rem', width: 40, textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={points.length > 0 && selectedIds.length === points.length} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                </th>
                {['Nombre', 'Categoría', 'Estado', 'Capacidad', 'Actualizado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>⟳ Cargando...</td></tr>
              ) : points.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay puntos con estos filtros.</td></tr>
              ) : points.map(point => (
                <tr key={point.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(point.id)} 
                      onChange={() => toggleSelect(point.id)}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: 200 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{point.name}</span>
                    {point.address && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block' }}>{point.address}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                    {point.category?.icon} {point.category?.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ToggleSwitch 
                        checked={point.status === 'active'} 
                        onChange={() => handleToggleStatus(point)}
                        disabled={loading}
                      />
                      <StatusBadge status={point.status} />
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                    {point.capacity_available != null ? `${point.capacity_available}/${point.capacity_total}` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {new Date(point.updated_at).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {point.status === 'unverified' && (
                        <button onClick={() => handleQuickVerify(point.id)} className="btn btn-sm" style={{ background: '#dcfce7', color: '#14532d', border: 'none' }} title="Aprobar y Verificar">
                          ✅
                        </button>
                      )}
                      <button onClick={() => openEdit(point)} className="btn btn-ghost btn-sm" title="Editar" style={{ color: 'var(--color-text-secondary)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(point.id, point.name)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => load(page)} className={`btn btn-sm ${page === pagination.current_page ? 'btn-primary' : 'btn-ghost'}`}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Agregar nuevo punto' : `Editar: ${editingPoint?.name}`} onClose={() => setModal(null)}>
          {PointForm}
        </Modal>
      )}
    </div>
  )
}
