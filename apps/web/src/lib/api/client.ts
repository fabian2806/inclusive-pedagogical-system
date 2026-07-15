import axios from 'axios'

const apiClient = axios.create({
  // En dev cae a '/api' (proxy de Vite). En despliegue, VITE_API_URL apunta al backend.
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: agrega el token JWT a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: redirige a /login si el token es inválido o expiró
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url

    if (status === 401 && url !== '/auth/login') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      console.log("Redirigiendo a /login...")
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
