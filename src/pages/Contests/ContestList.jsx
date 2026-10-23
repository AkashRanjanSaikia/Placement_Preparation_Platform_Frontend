import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listContests } from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'

const tabs = [
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function ContestList() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('live')
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    listContests({ status: activeTab, token })
      .then((payload) => {
        if (!cancelled) {
          setContests(payload?.data ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load contests')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, token])

  return (
    <div>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        // Compete weekly
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Contests</h1>
          <p className="text-ink/60 mt-2 max-w-xl text-sm">
            Join timed contests or host your own — public or private with a join code.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!token) navigate('/login')
            else navigate('/contests/create')
          }}
          className="bg-ink text-cream shrink-0 rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
        >
          Host a contest
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black'
                : 'border-ink/15 text-ink/70 hover:border-ink/30 rounded-full border px-4 py-1.5 text-sm'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-ink/50 text-sm">Loading contests…</p>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && contests.length === 0 ? (
          <p className="text-ink/50 text-sm">No contests in this tab yet.</p>
        ) : null}

        {contests.map((contest) => (
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
        ))}
      </div>
    </div>
  )
}
