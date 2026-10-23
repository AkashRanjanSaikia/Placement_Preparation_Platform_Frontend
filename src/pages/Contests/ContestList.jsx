import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listContests, listMyHostedContests } from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'

const browseTabs = [
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

const viewModes = [
  { id: 'browse', label: 'Join contests' },
  { id: 'mine', label: 'My hosting' },
]

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function statusLabel(contest) {
  if (!contest.published) return 'Draft'
  return contest.status ?? '—'
}

export default function ContestList() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('browse')
  const [activeTab, setActiveTab] = useState('live')
  const [contests, setContests] = useState([])
  const [myContests, setMyContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadContests = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      setError('')

      try {
        if (viewMode === 'browse') {
          const payload = await listContests({ status: activeTab, token })
          setContests(payload?.data ?? [])
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
    [viewMode, activeTab, token],
  )

  useEffect(() => {
    loadContests()
  }, [loadContests])

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
              if (!token) navigate('/login')
              else navigate('/contests/create')
            }}
            className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
          >
            Host a contest
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
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

      {viewMode === 'browse' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {browseTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? 'bg-ink/10 rounded-full px-4 py-1.5 text-sm dark:bg-white/10'
                  : 'border-ink/15 text-ink/70 rounded-full border px-4 py-1.5 text-sm'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-ink/50 text-sm">Loading contests…</p>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {viewMode === 'mine' && !token ? (
          <p className="text-ink/50 text-sm">
            <Link to="/login" className="underline">Log in</Link> to see contests you host.
          </p>
        ) : null}

        {viewMode === 'browse' && !loading && !error && contests.length === 0 ? (
          <p className="text-ink/50 text-sm">No contests in this tab yet.</p>
        ) : null}

        {viewMode === 'mine' && !loading && !error && myContests.length === 0 ? (
          <p className="text-ink/50 text-sm">
            You have not hosted any contests yet. Create one with Host a contest.
          </p>
        ) : null}

        {viewMode === 'browse'
          ? contests.map((contest) => (
              <article
                key={contest.id}
                className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 rounded-2xl border p-5 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{contest.title}</h2>
                      {contest.visibility === 'private' ? (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] uppercase text-violet-800 dark:text-violet-200">
                          Private
                        </span>
                      ) : null}
                    </div>
                    <p className="text-ink/60 mt-1 text-sm">
                      {formatWhen(contest.startTime)} → {formatWhen(contest.endTime)}
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/contests/${contest.id}`)}
                      className="border-ink/15 rounded-full border px-4 py-1.5 text-sm"
                    >
                      Details
                    </button>
                    {contest.status === 'live' && contest.registered ? (
                      <Link
                        to={`/contests/${contest.id}/room`}
                        className="bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black"
                      >
                        Enter room
                      </Link>
                    ) : null}
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
          ? myContests.map((contest) => (
              <article
                key={contest.id}
                className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 rounded-2xl border p-5 backdrop-blur-md"
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
                      {formatWhen(contest.startTime)} → {formatWhen(contest.endTime)}
                    </p>
                    <p className="text-ink/50 mt-2 text-xs">
                      {contest.sectionCount} sections · {contest.questionCount}{' '}
                      questions
                      {contest.published
                        ? ` · ${contest.participantCount} registered`
                        : ' · not published'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/contests/manage/${contest.id}`)}
                    className="bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black"
                  >
                    Manage
                  </button>
                </div>
              </article>
            ))
          : null}
      </div>
    </div>
  )
}
