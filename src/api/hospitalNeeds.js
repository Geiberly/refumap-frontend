import api from './axios'

const PUBLIC_PREFIX = '/public'

export const getHospitals = () =>
  api.get(`${PUBLIC_PREFIX}/hospitals`)

export const getHospital = (id) =>
  api.get(`${PUBLIC_PREFIX}/hospitals/${id}`)

export const reportHospitalNeed = (data) =>
  api.post(`${PUBLIC_PREFIX}/hospital-needs-report`, data)

export const adminUpdateHospitalNeed = (hospitalId, data) =>
  api.post(`/refu-control/hospitals/needs/${hospitalId}`, data)

export const adminGetHospitalNeedsReports = () =>
  api.get('/refu-control/hospital-needs-reports')

export const adminUpdateHospitalNeedsReportStatus = (id, status) =>
  api.patch(`/refu-control/hospital-needs-reports/${id}/status`, { status })
