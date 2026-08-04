import client from './client'

export const listAttractions = (limit = 10) =>
  client.get(`/explore/attractions?limit=${limit}`)

export const listFestivals = (limit = 10) =>
  client.get(`/explore/festivals?limit=${limit}`)