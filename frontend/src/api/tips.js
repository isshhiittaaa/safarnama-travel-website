import client from './client'

export const submitTip = (data) => {
  let payload = data

  // If passed an object instead of pre-built FormData
  if (!(data instanceof FormData)) {
    payload = new FormData()
    payload.append('place_name', data.place_name)
    payload.append('rating', data.rating)
    payload.append('tip_text', data.tip_text)
    if (data.photo) payload.append('photo', data.photo)
  }

  return client.post('/tips/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getTipsForPlace = (placeName) =>
  client.get(`/tips/place/${encodeURIComponent(placeName)}`)

export const getMyTips = () => client.get('/tips/my')

export const deleteTip = (id) => client.delete(`/tips/${id}`)

// Alias export to resolve 'removeTip' imports in Community.jsx
export const removeTip = deleteTip