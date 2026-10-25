import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fetchCurrentUser, loginUser, registerUser } from '../services/authApi.js'
import { configureAxiosAuth } from '../services/axiosAuth.js'

const TOKEN_KEY = 'prepify_auth_token'
const USER_KEY = 'prepify_auth_user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => readStoredUser())
  const [isInitializing, setIsInitializing] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_KEY)),
  )
  const tokenRef = useRef(token)
  tokenRef.current = token

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  useEffect(() => {
    configureAxiosAuth({
      getToken: () => tokenRef.current,
      onSessionExpired: () => {
        clearSession()
      },
    })
  }, [clearSession])

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setIsInitializing(false)
      return
    }

    let cancelled = false

    async function bootstrap() {
      try {
        const data = await fetchCurrentUser(stored)
        if (cancelled) return
        if (data?.user) {
          persistSession(stored, data.user)
        } else {
          clearSession()
        }
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setIsInitializing(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [clearSession, persistSession])

  const register = useCallback(
    async ({ name, email, password }) => {
      const data = await registerUser({ name, email, password })
      if (!data?.token || !data?.user) {
        throw new Error('Invalid response from server')
      }
      persistSession(data.token, data.user)
      return data.user
    },
    [persistSession],
  )

  const login = useCallback(
    async ({ email, password }) => {
      const data = await loginUser({ email, password })
      if (!data?.token || !data?.user) {
        throw new Error('Invalid response from server')
      }
      persistSession(data.token, data.user)
      return data.user
    },
    [persistSession],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      register,
      login,
      logout,
    }),
    [token, user, isInitializing, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
