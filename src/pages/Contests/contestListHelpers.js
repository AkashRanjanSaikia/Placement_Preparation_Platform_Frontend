export function filterContestsByTitle(contests, query) {
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return contests
  return contests.filter((c) => c.title?.toLowerCase().includes(q))
}

export function sortContestsByStartTime(contests, order = 'desc') {
  const list = [...contests]
  list.sort((a, b) => {
    const ta = new Date(a.startTime).getTime() || 0
    const tb = new Date(b.startTime).getTime() || 0
    return order === 'desc' ? tb - ta : ta - tb
  })
  return list
}

export function filterContestsByVisibility(contests, visibilityFilter) {
  if (!visibilityFilter || visibilityFilter === 'all') return contests
  return contests.filter((c) => (c.visibility ?? 'public') === visibilityFilter)
}

export function filterHostedByStatus(contests, statusFilter) {
  if (!statusFilter || statusFilter === 'all') return contests
  if (statusFilter === 'draft') {
    return contests.filter((c) => !c.published)
  }
  return contests.filter((c) => c.status === statusFilter)
}
