import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider.jsx'
import { readRedirectFromLocation } from '../utils/authRedirect.js'

/** Logged-in users skip login/signup and go to their redirect target (default home). */
export default function GuestOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50 text-sm">Loading…</p>
      </div>
    )
  }

  if (isAuthenticated) {
    const target = readRedirectFromLocation(searchParams, location.state)
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
