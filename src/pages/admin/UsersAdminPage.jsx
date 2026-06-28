import React, { useState, useEffect, useCallback } from 'react'
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../api/mapPoints'
import { SkeletonList } from '../../components/ui/Skeleton'
import { toast } from 'sonner'
import { Edit2, Trash2, Shield, User } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'operator'
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetUsers()
      // API paginate(20) returns data.data array
      setUsers(data.data || [])
    } catch (e) {
      toast.error('Error al cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
    setModal('create')
  }

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Don't send password unless modifying
    })
    setErrors({})
    setEditingId(user.id)
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    
    // Si editamos y no cambia la contraseña, quitarla
    const dataToSend = { ...form }
    if (modal === 'edit' && !dataToSend.password) {
      delete dataToSend.password
    }

    try {
      if (modal === 'create') {
        await adminCreateUser(dataToSend)
        toast.success('Usuario creado exitosamente.')
      } else {
        await adminUpdateUser(editingId, dataToSend)
        toast.success('Usuario actualizado correctamente.')
      }
      closeModal()
      load()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
        toast.error('Revisa los campos del formulario.')
      } else {
        toast.error(err.response?.data?.message || 'Error al guardar el usuario.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user) => {
    const isActive = user.status === 'approved'
    const newStatus = isActive ? 'disabled' : 'approved'
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    try {
      await adminUpdateUser(user.id, { is_active: !isActive })
      toast.success(`Usuario ${!isActive ? 'activado' : 'desactivado'}.`)
    } catch (err) {
      toast.error('Error al cambiar el estado del usuario.')
      load()
    }
  }

  const handleDelete = async (id, name) => {
    toast(`¿Eliminar al usuario ${name}?`, {
      description: 'Esta acción no se puede deshacer.',
      duration: 10000,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            await adminDeleteUser(id)
            toast.success('Usuario eliminado.')
            load()
          } catch (err) {
            toast.error('Error al eliminar el usuario.')
          }
        }
      },
      cancel: { label: 'Cancelar', onClick: () => {} }
    })
  }

  const UserForm = (
    <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="form-group">
        <label className="form-label required">Nombre completo</label>
        <input name="name" value={form.name} onChange={handleFormChange} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Ej. Juan Pérez" />
        {errors.name && <p className="form-error">⚠ {errors.name[0]}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Correo electrónico</label>
        <input name="email" type="email" value={form.email} onChange={handleFormChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="correo@ejemplo.com" />
        {errors.email && <p className="form-error">⚠ {errors.email[0]}</p>}
      </div>

      <div className="form-group">
        <label className={`form-label ${modal === 'create' ? 'required' : ''}`}>Contraseña</label>
        <input name="password" type="password" value={form.password} onChange={handleFormChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder={modal === 'edit' ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'} />
        {errors.password && <p className="form-error">⚠ {errors.password[0]}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Rol del usuario</label>
        <select name="role" value={form.role} onChange={handleFormChange} className={`form-select ${errors.role ? 'error' : ''}`}>
          <option value="operator">Operador</option>
          <option value="admin">Administrador</option>
        </select>
        {errors.role && <p className="form-error">⚠ {errors.role[0]}</p>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
          {saving ? 'Guardando...' : (modal === 'create' ? 'Crear usuario' : 'Guardar cambios')}
        </button>
        <button type="button" onClick={closeModal} className="btn btn-ghost">Cancelar</button>
      </div>
    </form>
  )

  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <div style={{ width: '44px', height: '24px', background: checked ? '#10b981' : '#d1d5db', borderRadius: '9999px', position: 'relative', transition: 'background 0.3s ease' }}>
        <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: checked ? '22px' : '2px', transition: 'left 0.3s ease' }} />
      </div>
    </label>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>🧑‍💻 Gestión de Usuarios</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={load} className="btn btn-ghost btn-sm" disabled={loading}>⟳ Actualizar</button>
          <button onClick={openCreate} className="btn btn-primary btn-sm">+ Nuevo Usuario</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                {['Usuario', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>⟳ Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay usuarios.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                    {user.role === 'admin' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                        <User size={12} /> Operador
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ToggleSwitch checked={user.status === 'approved'} onChange={() => handleToggleStatus(user)} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: user.status === 'approved' ? '#10b981' : '#6b7280' }}>
                        {user.status === 'approved' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {new Date(user.created_at).toLocaleDateString('es')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(user)} className="btn btn-ghost btn-sm" title="Editar" style={{ color: 'var(--color-text-secondary)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 1001, background: 'var(--color-bg)', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              {modal === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
            </h2>
            {UserForm}
          </div>
        </div>
      )}
    </div>
  )
}
