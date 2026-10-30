import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { listContests, listMyHostedContests } from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'
import ContestRegisterJoinButtons from './components/ContestRegisterJoinButtons.jsx'
import {
  filterContestsByTitle,
  filterContestsByVisibility,
  filterHostedByStatus,
  sortContestsByStartTime,
} from './contestListHelpers.js'
import { formatContestScheduleRange } from './utils/contestDateTime.js'
import { buildLoginUrl } from '../../utils/authRedirect.js'

const visibilityFilters = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
]

const browseTabs = [
  { id: 'live', label: 'Live', badgeClass: 'bg-red-500', showBadge: true },
  { id: 'upcoming', label: 'Upcoming', badgeClass: 'bg-emerald-500', showBadge: true },
  { id: 'completed', label: 'Completed', showBadge: false },
]

const hostStatusFilters = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'draft', label: 'Draft' },
]

const sortOptions = [
  { id: 'start_desc', label: 'Start time (latest first)' },
  { id: 'start_asc', label: 'Start time (earliest first)' },
]

function TabCountBadge({ count, badgeClass }) {
  if (!count || count < 1) return null
  const label = count > 99 ? '99+' : String(count)
  return (
    <span
      className={`${badgeClass} absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-zinc-100 dark:ring-zinc-950`}
      aria-hidden
    >
      {label}
    </span>
  )
}

const viewModes = [
  { id: 'browse', label: 'Join contests' },
  { id: 'mine', label: 'My hosting' },
]

function statusLabel(contest) {
  if (!contest.published) return 'Draft'
  return contest.status ?? '—'
}

const BROWSE_TAB_IDS = new Set(['live', 'upcoming', 'completed'])

export default function ContestList() {
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { search = '' } = useOutletContext() ?? {}
  const [viewMode, setViewMode] = useState('browse')
  const tabFromUrl = searchParams.get('tab')
  const initialTab = BROWSE_TAB_IDS.has(tabFromUrl) ? tabFromUrl : 'live'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [hostStatusFilter, setHostStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('start_desc')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [contests, setContests] = useState([])
  const [myContests, setMyContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [tabCounts, setTabCounts] = useState({
    live: 0,
    upcoming: 0,
    completed: 0,
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (BROWSE_TAB_IDS.has(tab)) {
      setActiveTab(tab)
      setViewMode('browse')
    }
  }, [searchParams])

  const selectBrowseTab = useCallback(
    (tabId) => {
      setActiveTab(tabId)
      setViewMode('browse')
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tabId)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const loadBrowseTabCounts = useCallback(async () => {
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        listContests({ status: 'live', token }),
        listContests({ status: 'upcoming', token }),
      ])
      setTabCounts({
        live: liveRes?.data?.length ?? 0,
        upcoming: upcomingRes?.data?.length ?? 0,
        completed: 0,
      })
    } catch {
      /* keep previous counts */
    }
  }, [token])

  const loadContests = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      setError('')

      try {
        if (viewMode === 'browse') {
          const payload = await listContests({ status: activeTab, token })
          setContests(payload?.data ?? [])
          await loadBrowseTabCounts()
        } else if (!token) {
          setMyContests([])
        } else {
          const payload = await listMyHostedContests(token)
          setMyContests(payload?.data ?? [])
        }
      } catch {
        setError(
          viewMode === 'browse'
            ? 'Could not load contests'
            : 'Could not load your contests',
        )
      } finally {
        if (!silent) setLoading(false)
        setRefreshing(false)
      }
    },
    [viewMode, activeTab, token, loadBrowseTabCounts],
  )

  useEffect(() => {
    loadContests()
  }, [loadContests])

  const sortKey = sortOrder === 'start_desc' ? 'desc' : 'asc'

  const visibleBrowseContests = useMemo(() => {
    const byVisibility = filterContestsByVisibility(contests, visibilityFilter)
    const filtered = filterContestsByTitle(byVisibility, search)
    return sortContestsByStartTime(filtered, sortKey)
  }, [contests, search, sortKey, visibilityFilter])

  const visibleHostedContests = useMemo(() => {
    const byStatus = filterHostedByStatus(myContests, hostStatusFilter)
    const byVisibility = filterContestsByVisibility(byStatus, visibilityFilter)
    const filtered = filterContestsByTitle(byVisibility, search)
    return sortContestsByStartTime(filtered, sortKey)
  }, [myContests, hostStatusFilter, search, sortKey, visibilityFilter])

  const hasActiveListFilters =
    visibilityFilter !== 'all' || sortOrder !== 'start_desc'

  const activeFilterSummary = useMemo(() => {
    const parts = []
    if (visibilityFilter !== 'all') {
      const label = visibilityFilters.find((v) => v.id === visibilityFilter)?.label
      if (label) parts.push(label)
    }
    if (sortOrder !== 'start_desc') {
      const label = sortOptions.find((s) => s.id === sortOrder)?.label
      if (label) parts.push(label)
    }
    return parts.join(' · ')
  }, [visibilityFilter, sortOrder])

  const resetListFilters = () => {
    setVisibilityFilter('all')
    setSortOrder('start_desc')
  }

  return (
    <div>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {'// Compete weekly'}
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Contests</h1>
          <p className="text-ink/60 mt-2 max-w-xl text-sm">
            Join timed contests or host your own — public or private with a join code.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadContests({ silent: true })}
            disabled={loading || refreshing}
            className="border-ink/15 rounded-full border px-4 py-2 text-sm disabled:opacity-50"
            title="Refresh contest lists and status"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!token) navigate(buildLoginUrl('/contests/create'))
              else navigate('/contests/create')
            }}
            className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
          >
            Host a contest
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={
                  viewMode === mode.id
                    ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30 rounded-full border px-4 py-1.5 text-sm'
                }
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="contest-list-filters"
            className={
              filtersOpen
                ? 'border-ink/25 bg-ink/5 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium dark:border-white/20 dark:bg-white/10'
                : 'border-ink/15 text-ink/80 hover:border-ink/30 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm dark:hover:border-white/20'
            }
          >
            <SlidersHorizontal size={16} className="text-ink/60 shrink-0" aria-hidden />
            Filters
            {hasActiveListFilters ? (
              <span className="bg-gold/20 text-ink dark:text-cream rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                On
              </span>
            ) : null}
            <ChevronDown
              size={16}
              className={`text-ink/50 shrink-0 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>

        {viewMode === 'browse' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {browseTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectBrowseTab(tab.id)}
                className={
                  activeTab === tab.id
                    ? 'relative bg-ink/10 rounded-full py-1.5 pr-5 pl-4 text-sm dark:bg-white/10'
                    : 'relative border-ink/15 text-ink/70 rounded-full border py-1.5 pr-5 pl-4 text-sm'
                }
              >
                {tab.label}
                {tab.showBadge ? (
                  <TabCountBadge
                    count={tabCounts[tab.id]}
                    badgeClass={tab.badgeClass}
                  />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {viewMode === 'mine' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {hostStatusFilters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHostStatusFilter(tab.id)}
                className={
                  hostStatusFilter === tab.id
                    ? 'bg-ink/10 rounded-full px-4 py-1.5 text-sm dark:bg-white/10'
                    : 'border-ink/15 text-ink/70 rounded-full border px-4 py-1.5 text-sm'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        {!filtersOpen && activeFilterSummary ? (
          <p className="text-ink/50 mt-3 text-sm">{activeFilterSummary}</p>
        ) : null}

        <div
          id="contest-list-filters"
          className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
            filtersOpen ? 'mt-3 grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div
            className={`min-h-0 overflow-hidden ${
              filtersOpen ? '' : 'pointer-events-none'
            }`}
          >
            <div className="border-ink/10 dark:border-white/10 rounded-2xl border bg-white/50 p-4 dark:bg-zinc-900/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-ink/50 mb-2 font-mono text-[11px] tracking-widest uppercase">
                    Visibility
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibilityFilters.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVisibilityFilter(opt.id)}
                        className={
                          visibilityFilter === opt.id
                            ? 'bg-ink/10 rounded-full px-3 py-1.5 text-xs font-medium dark:bg-white/10'
                            : 'border-ink/15 text-ink/70 rounded-full border px-3 py-1.5 text-xs'
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="min-w-[min(100%,16rem)] sm:max-w-xs">
                  <label
                    htmlFor="contest-sort"
                    className="text-ink/50 mb-2 block font-mono text-[11px] tracking-widest uppercase"
                  >
                    Sort by
                  </label>
                  <select
                    id="contest-sort"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border-ink/15 bg-white dark:border-white/10 dark:bg-zinc-900 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gold/60"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {hasActiveListFilters ? (
                <div className="border-ink/10 mt-4 flex justify-end border-t pt-3 dark:border-white/10">
                  <button
                    type="button"
                    onClick={resetListFilters}
                    className="text-ink/60 hover:text-ink text-xs underline-offset-2 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-ink/50 text-sm">Loading contests…</p>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {!loading && !error ? (
          <>
            {viewMode === 'mine' && !token ? (
              <p className="text-ink/50 text-sm">
                <Link to="/login" className="underline">
                  Log in
                </Link>{' '}
                to see contests you host.
              </p>
            ) : null}

            {viewMode === 'browse' && contests.length === 0 ? (
              <p className="text-ink/50 text-sm">No contests in this tab yet.</p>
            ) : null}

            {viewMode === 'browse' &&
            contests.length > 0 &&
            visibleBrowseContests.length === 0 ? (
              <p className="text-ink/50 text-sm">
                No contests match your search or filters.
              </p>
            ) : null}

            {viewMode === 'mine' && token && myContests.length === 0 ? (
              <p className="text-ink/50 text-sm">
                You have not hosted any contests yet. Create one with Host a contest.
              </p>
            ) : null}

            {viewMode === 'mine' &&
            token &&
            myContests.length > 0 &&
            visibleHostedContests.length === 0 ? (
              <p className="text-ink/50 text-sm">
                No hosted contests match this filter or search.
              </p>
            ) : null}
          </>
        ) : null}

        {viewMode === 'browse'
          ? visibleBrowseContests.map((contest) => (
              <article
                key={contest.id}
                className="dashboard-panel rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{contest.title}</h2>
                      {contest.registered ? (
                        <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                          You&apos;re registered for this contest
                        </span>
                      ) : null}
                      {contest.visibility === 'private' ? (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] uppercase text-violet-800 dark:text-violet-200">
                          Private
                        </span>
                      ) : null}
                    </div>
                    <p className="text-ink/60 mt-1 text-sm">
                      {formatContestScheduleRange(
                        contest.startTime,
                        contest.endTime,
                      )}
                    </p>
                    {contest.visibility === 'private' ? (
                      <p className="text-ink/55 mt-1 text-xs">
                        Private — ask the host for a join code to register.
                      </p>
                    ) : null}
                    <p className="text-ink/50 mt-2 text-xs">
                      {contest.participantCount ?? 0} registered ·{' '}
                      {contest.sections?.length ?? 0} sections
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/contests/${contest.id}`)}
                      className="border-ink/15 rounded-full border px-4 py-1.5 text-sm"
                    >
                      Details
                    </button>
                    <ContestRegisterJoinButtons
                      contest={contest}
                      token={token}
                      isAuthenticated={isAuthenticated}
                      onUpdated={() => loadContests({ silent: true })}
                    />
                    {contest.status === 'completed' ? (
                      <Link
                        to={`/contests/${contest.id}/leaderboard`}
                        className="bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black"
                      >
                        Leaderboard
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          : null}

        {viewMode === 'mine'
          ? visibleHostedContests.map((contest) => (
              <article
                key={contest.id}
                className="dashboard-panel rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{contest.title}</h2>
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] uppercase">
                        {statusLabel(contest)}
                      </span>
                      {contest.visibility === 'private' ? (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] uppercase text-violet-800">
                          Private
                        </span>
                      ) : null}
                    </div>
                    <p className="text-ink/60 mt-1 text-sm">
                      {formatContestScheduleRange(
                        contest.startTime,
                        contest.endTime,
                      )}
                    </p>
                    <p className="text-ink/50 mt-2 text-xs">
                      {contest.sectionCount} sections · {contest.questionCount}{' '}
                      questions
                      {contest.published
                        ? ` · ${contest.participantCount} registered`
                        : ' · not published'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {(contest.status === 'upcoming' || contest.status === 'live') &&
                    contest.published ? (
                      <Link
                        to={`/contests/${contest.id}/room`}
                        className="contest-btn-enter rounded-full px-4 py-1.5 text-sm font-medium"
                      >
                        {contest.status === 'upcoming' ? 'Preview room' : 'Enter room'}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => navigate(`/contests/manage/${contest.id}`)}
                      className="bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </article>
            ))
          : null}
      </div>
    </div>
  )
}
