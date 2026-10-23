import axios from 'axios'

let configured = false

/**
 * Attach Bearer token to requests and clear session on expired token (401).
 */
export function configureAxiosAuth({ getToken, onSessionExpired }) {
  if (configured) return
  configured = true

  axios.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const hadAuth = Boolean(error?.config?.headers?.Authorization)
      if (status === 401 && hadAuth && onSessionExpired) {
        onSessionExpired()
      }
      return Promise.reject(error)
    },
  )
}
