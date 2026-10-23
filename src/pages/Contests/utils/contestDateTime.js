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
  const endLocal = toDatetimeLocalValue(end)
  if (!isSameContestCalendarDay(start, end)) {
    return toDatetimeLocalValue(endOfLocalDay(startLocal))
  }
  return endLocal
}

/** Same calendar day in the user's local timezone (for datetime-local scheduling). */
export function isSameContestCalendarDay(startIso, endIso) {
  if (!startIso || !endIso) return false
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  )
}

function endOfLocalDay(startLocal) {
  if (!startLocal) return ''
  const [datePart] = String(startLocal).split('T')
  if (!datePart) return startLocal
  return `${datePart}T23:59`
}

export function scheduleTimezoneOffsetForApi() {
  return new Date().getTimezoneOffset()
}

export function formatLocalRange(startIso, endIso) {
  if (!startIso || !endIso) return '—'
  const start = new Date(startIso)
  const end = new Date(endIso)
  return `${start.toLocaleString()} → ${end.toLocaleString()}`
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function ordinalDay(day) {
  const n = Number(day)
  if (!Number.isFinite(n)) return String(day)
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

function formatContestClock(date) {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const suffix = hours >= 12 ? 'pm' : 'am'
  hours %= 12
  if (hours === 0) hours = 12
  if (minutes === 0) return `${hours}${suffix}`
  return `${hours}:${String(minutes).padStart(2, '0')}${suffix}`
}

function formatContestDuration(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours} h ${minutes} min`
  if (hours > 0) return `${hours} h`
  return `${minutes} min`
}

function formatContestDateStamp(date) {
  const year = String(date.getFullYear()).slice(-2)
  return `${ordinalDay(date.getDate())} ${MONTH_SHORT[date.getMonth()]}, ${year}`
}

/**
 * Human-readable contest window for dashboard views.
 * e.g. "1st Jan, 26 2:40pm to 3:45pm (1 h 5 min)"
 */
export function formatContestScheduleRange(startIso, endIso) {
  if (!startIso || !endIso) return '—'
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'

  const duration = formatContestDuration(end.getTime() - start.getTime())
  const sameDay = isSameContestCalendarDay(startIso, endIso)

  if (!sameDay) {
    return `${formatContestDateStamp(start)} ${formatContestClock(start)} to ${formatContestDateStamp(end)} ${formatContestClock(end)} (${duration}) · invalid span`
  }

  return `${formatContestDateStamp(start)} ${formatContestClock(start)} to ${formatContestClock(end)} (${duration})`
}
