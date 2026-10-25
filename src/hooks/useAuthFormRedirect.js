import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { readRedirectFromLocation } from '../utils/authRedirect.js'

export function useAuthFormRedirect() {
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const redirectTo = useMemo(
    () => readRedirectFromLocation(searchParams, location.state),
    [searchParams, location.state],
  )

  const redirectQuery = useMemo(() => {
    const params = new URLSearchParams({ redirect: redirectTo })
    return `?${params.toString()}`
  }, [redirectTo])

  const intentMessage = useMemo(() => {
    if (redirectTo === '/dsa-practice') {
      return 'Sign in to open your practice dashboard and start your journey.'
    }
    if (redirectTo === '/') {
      return null
    }
    return 'Sign in to continue where you left off.'
  }, [redirectTo])

  return { redirectTo, redirectQuery, intentMessage }
}
