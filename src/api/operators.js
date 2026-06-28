import api from './axios'

export const getOperators = () =>
  api.get('/refu-control/operators')

export const getPendingOperators = () =>
  api.get('/refu-control/operators/pending')

export const approveOperator = (id) =>
  api.patch(`/refu-control/operators/${id}/approve`)

export const rejectOperator = (id, reason) =>
  api.patch(`/refu-control/operators/${id}/reject`, { reason })

export const disableOperator = (id) =>
  api.patch(`/refu-control/operators/${id}/disable`)

export const enableOperator = (id) =>
  api.patch(`/refu-control/operators/${id}/enable`)
