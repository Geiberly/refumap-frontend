import React from 'react'

const STATUS_CONFIG = {
  active:     { label: 'Activo',         className: 'badge-active',     icon: '●' },
  full:       { label: 'Saturado',        className: 'badge-full',       icon: '●' },
  closed:     { label: 'Cerrado',         className: 'badge-closed',     icon: '●' },
  unverified: { label: 'No verificado',   className: 'badge-unverified', icon: '○' },
  danger:     { label: 'Peligro',         className: 'badge-danger',     icon: '⚠' },
}

const SOURCE_CONFIG = {
  official:   { label: 'Oficial',         className: 'badge-active' },
  operator:   { label: 'Operador',        className: 'badge-unverified' },
  citizen:    { label: 'Ciudadano',       className: 'badge-full' },
  unverified: { label: 'Sin verificar',   className: 'badge-closed' },
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified
  return (
    <span className={`badge ${config.className}`}>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  )
}

export function SourceBadge({ source }) {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.unverified
  return (
    <span className={`badge ${config.className}`} style={{ fontSize: '0.65rem' }}>
      {config.label}
    </span>
  )
}

export function UrgencyBadge({ level }) {
  const configs = {
    1: { label: 'Baja',    color: '#16a34a' },
    2: { label: 'Media',   color: '#d97706' },
    3: { label: 'Alta',    color: '#dc4000' },
    4: { label: 'Crítica', color: '#dc2626' },
  }
  const config = configs[level] || configs[1]
  return (
    <span className="badge" style={{
      background: config.color + '20',
      color: config.color,
      border: `1px solid ${config.color}40`,
      fontSize: '0.65rem',
    }}>
      Urgencia: {config.label}
    </span>
  )
}
