import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

export default function PrivateRoute({ children, requiredRole = 'operator' }) {
  const { isAuthenticated, isAdmin, isOperator } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated()) {
    const loginPath = location.pathname.startsWith('/refu-control') ? '/refu-control' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No tienes permiso para ver esta página</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Esta sección es solo para administradores.</p>
        <a href={isAdmin() ? '/refu-control' : '/admin'} style={{ color: '#2563eb', fontWeight: 600 }}>← Ir al panel</a>
      </div>
    )
  }

  if (requiredRole === 'operator' && !isOperator()) {
    return <Navigate to="/login" replace />
  }

  return children
}
