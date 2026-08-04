import axios from 'axios'

// Fallback to '/api' so Vite's dev proxy redirects to http://127.0.0.1:8000
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Accept': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token automatically
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Unauthorized globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Avoid infinite loop if user is already on public auth pages
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client