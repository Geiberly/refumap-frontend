import api from './axios'

const PUBLIC_PREFIX = '/public'

export const getMapPoints = (filters = {}) =>
  api.get(`${PUBLIC_PREFIX}/map-points`, { params: filters })

export const getMapPointDetail = (id) =>
  api.get(`${PUBLIC_PREFIX}/map-points/${id}`)

export const getCategories = () =>
  api.get(`${PUBLIC_PREFIX}/categories`)

export const getRoadBlocks = () =>
  api.get(`${PUBLIC_PREFIX}/road-blocks`)

export const getStats = () =>
  api.get(`${PUBLIC_PREFIX}/stats`)

export const submitReport = (formData) =>
  api.post(`${PUBLIC_PREFIX}/reports`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const reportRefuge = (data) => api.post(`${PUBLIC_PREFIX}/refuges`, data)
export const reportHospital = (data) => api.post(`${PUBLIC_PREFIX}/hospitals-report`, data)
export const reportRoadIssue = (data) => api.post(`${PUBLIC_PREFIX}/road-issues`, data)
export const reportDangerZone = (data) => api.post(`${PUBLIC_PREFIX}/danger-zones`, data)
export const reportHelpPoint = (data) => api.post(`${PUBLIC_PREFIX}/help-points`, data)

export const adminGetMapPoints = (params = {}) =>
  api.get('/refu-control/map-points', { params })

export const adminCreateMapPoint = (data) =>
  api.post('/refu-control/map-points', data)

export const adminUpdateMapPoint = (id, data) =>
  api.put(`/refu-control/map-points/${id}`, data)

export const adminDeleteMapPoint = (id) =>
  api.delete(`/refu-control/map-points/${id}`)

export const adminGetReports = (params = {}) =>
  api.get('/refu-control/reports', { params })

export const adminVerifyReport = (id, notes) =>
  api.put(`/refu-control/reports/${id}/verify`, { notes })

export const adminRejectReport = (id, notes) =>
  api.put(`/refu-control/reports/${id}/reject`, { notes })

export const adminConvertReport = (id, data) =>
  api.post(`/refu-control/reports/${id}/convert-to-map-point`, data)

export const adminGetDashboard = () =>
  api.get('/refu-control/dashboard')

export const getAdmittedPeople = (params) =>
  api.get('/public/admitted-people', { params })

export const sendChatMessage = (messages, coords = null) =>
  api.post('/public/chat', { messages, coords })

export const adminGetUsers = (params) =>
  api.get('/refu-control/users', { params })

export const adminCreateUser = (data) =>
  api.post('/refu-control/users', data)

export const adminUpdateUser = (id, data) =>
  api.put(`/refu-control/users/${id}`, data)

export const adminDeleteUser = (id) =>
  api.delete(`/refu-control/users/${id}`)


