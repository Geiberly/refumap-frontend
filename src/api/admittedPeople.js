import api from './axios'

const PUBLIC_PREFIX = '/public'

export const getAdmittedPeople = (search = '') =>
  api.get(`${PUBLIC_PREFIX}/admitted-people`, { params: { search } })

export const reportAdmittedPerson = (data) =>
  api.post(`${PUBLIC_PREFIX}/admitted-people`, data)

export const adminGetAdmittedPeople = (params = {}) =>
  api.get('/refu-control/admitted-people', { params })

export const adminUpdateAdmittedPerson = (id, data) =>
  api.put(`/refu-control/admitted-people/${id}`, data)

export const adminUpdateAdmittedPersonStatus = (id, visibility_status) =>
  api.patch(`/refu-control/admitted-people/${id}/status`, { visibility_status })
