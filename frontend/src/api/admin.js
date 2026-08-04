import client from './client'

export const getAdminStats = () => client.get('/admin/stats')

export const getAdminUsers = () => client.get('/admin/users')