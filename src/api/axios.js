import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
})

// ── Interceptor de request: adjuntar token si existe ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('refumap_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor de response: manejar errores globales ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido — limpiar sesión
      localStorage.removeItem('refumap_token')
      localStorage.removeItem('refumap_user')
      // Redirigir a login si estamos en área admin
      if (window.location.pathname.startsWith('/refu-control')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
