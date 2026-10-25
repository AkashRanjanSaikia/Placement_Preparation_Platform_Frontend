import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider.jsx'
import { buildLoginUrl } from '../utils/authRedirect.js'

export default function RequireAuth() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50 text-sm">Loading your session…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnPath = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={buildLoginUrl(returnPath)}
        replace
        state={{ from: returnPath }}
      />
    )
  }

  return <Outlet />
}
