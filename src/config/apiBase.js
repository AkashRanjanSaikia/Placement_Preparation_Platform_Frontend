/**
 * API root. In dev, use BACKEND_URL=/api so Vite proxies to Express (see vite.config.js).
 * Avoids broken calls when the UI is opened via port-forwarding but the API is on the dev host.
 */
export function getApiBase() {
  const raw = import.meta.env.BACKEND_URL
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '')
  }
  return '/api'
}
