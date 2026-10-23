export function toDatetimeLocalValue(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(localValue) {
  if (!localValue) return null
  const d = new Date(localValue)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function defaultContestSchedule() {
  const start = new Date(Date.now() + 15 * 60 * 1000)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  return { start, end }
}

export function addHoursToLocalStart(startLocal, hours) {
  const start = fromDatetimeLocalValue(startLocal)
  if (!start) return ''
  const end = new Date(new Date(start).getTime() + hours * 60 * 60 * 1000)
  return toDatetimeLocalValue(end)
}

export function formatLocalRange(startIso, endIso) {
  if (!startIso || !endIso) return '—'
  const start = new Date(startIso)
  const end = new Date(endIso)
  return `${start.toLocaleString()} → ${end.toLocaleString()}`
}
