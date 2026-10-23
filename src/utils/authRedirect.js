const DEFAULT_AFTER_AUTH = '/'

/**
 * Prevent open redirects — only same-origin relative paths.
 */
export function getSafeRedirectPath(raw, fallback = DEFAULT_AFTER_AUTH) {
  if (raw == null || raw === '') return fallback
  const path = String(raw).trim()
  if (!path.startsWith('/') || path.startsWith('//')) return fallback
  if (path.includes('://') || path.includes('\\')) return fallback
  if (path.startsWith('/login') || path.startsWith('/signup')) return fallback
  return path
}

export function buildLoginUrl(redirectTo = DEFAULT_AFTER_AUTH) {
  const safe = getSafeRedirectPath(redirectTo, DEFAULT_AFTER_AUTH)
  const params = new URLSearchParams({ redirect: safe })
  return `/login?${params.toString()}`
}

export function buildSignupUrl(redirectTo = DEFAULT_AFTER_AUTH) {
  const safe = getSafeRedirectPath(redirectTo, DEFAULT_AFTER_AUTH)
  const params = new URLSearchParams({ redirect: safe })
  return `/signup?${params.toString()}`
}

export function readRedirectFromLocation(searchParams, locationState) {
  const fromQuery = searchParams?.get?.('redirect')
  const fromState = locationState?.from
  return getSafeRedirectPath(fromQuery ?? fromState, DEFAULT_AFTER_AUTH)
}
