import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout } from '../api/auth'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('refumap_user') || 'null'),
  token: localStorage.getItem('refumap_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiLogin(email, password)
      const { token, user } = data

      localStorage.setItem('refumap_token', token)
      localStorage.setItem('refumap_user', JSON.stringify(user))

      set({ user, token, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión.'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  logout: async () => {
    try { await apiLogout() } catch (e) { /* ignorar errores de red */ }
    localStorage.removeItem('refumap_token')
    localStorage.removeItem('refumap_user')
    set({ user: null, token: null, error: null })
  },

  clearError: () => set({ error: null }),

  isAdmin: () => get().user?.role === 'admin',
  isOperator: () => ['admin', 'operator'].includes(get().user?.role),
  isAuthenticated: () => !!get().token,
}))

export default useAuthStore
