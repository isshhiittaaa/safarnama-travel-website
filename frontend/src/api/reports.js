import client from './client'

export const submitReport = (data) => {
  let payload = data

  // If passed an object instead of pre-built FormData
  if (!(data instanceof FormData)) {
    payload = new FormData()
    payload.append('category', data.category)
    payload.append('description', data.description || '')
    payload.append('location_hint', data.location_hint || '')
    if (data.photo) payload.append('photo', data.photo)
  }

  return client.post('/reports/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getMyReports = () => client.get('/reports/my')

export const getAllReports = () => client.get('/reports/all')

export const updateReportStatus = (reportId, status) => {
  // Convert to URL-SearchParams for application/x-www-form-urlencoded endpoint requirement
  const params = new URLSearchParams()
  params.append('status', status)

  return client.patch(`/reports/${reportId}/status`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}