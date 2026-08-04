import client from './client'

export const getFavorites = () => client.get('/favorites/')

export const listFavorites = () => client.get('/favorites/')

export const addFavorite = (place_name, category = 'attractions') => {
  // Supports calling with object ({ place_name, category }) or positional args
  if (typeof place_name === 'object') {
    return client.post('/favorites/', place_name)
  }
  return client.post('/favorites/', { place_name, category })
}

export const removeFavorite = (id) => client.delete(`/favorites/${id}`)