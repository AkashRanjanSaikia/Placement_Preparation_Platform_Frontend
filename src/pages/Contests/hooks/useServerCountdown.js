import { useEffect, useMemo, useState } from 'react'

function formatRemaining(ms) {
  if (ms <= 0) return { label: 'Time ended', urgent: true, ms: 0 }
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  parts.push(`${m}m`)
  parts.push(`${s}s`)
  return {
    label: parts.join(' '),
    urgent: ms < 5 * 60 * 1000,
    ms,
  }
}

/**
 * @param {string|Date} endTimeIso
 * @param {string|Date} serverTimeIso - from API on first load
 */
export function useServerCountdown(endTimeIso, serverTimeIso) {
  const [clientNow, setClientNow] = useState(() => Date.now())

  const skewMs = useMemo(() => {
    if (!serverTimeIso) return 0
    return new Date(serverTimeIso).getTime() - Date.now()
  }, [serverTimeIso])

  useEffect(() => {
    const id = window.setInterval(() => setClientNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const endMs = endTimeIso ? new Date(endTimeIso).getTime() : 0
  const nowMs = clientNow + skewMs
  const remaining = endMs - nowMs

  return formatRemaining(remaining)
}

export function useUntilStart(startTimeIso, serverTimeIso) {
  const [clientNow, setClientNow] = useState(() => Date.now())
  const skewMs = useMemo(() => {
    if (!serverTimeIso) return 0
    return new Date(serverTimeIso).getTime() - Date.now()
  }, [serverTimeIso])

  useEffect(() => {
    const id = window.setInterval(() => setClientNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!startTimeIso) return null
  const startMs = new Date(startTimeIso).getTime()
  const diff = startMs - (clientNow + skewMs)
  if (diff <= 0) return null
  return formatRemaining(diff)
}
