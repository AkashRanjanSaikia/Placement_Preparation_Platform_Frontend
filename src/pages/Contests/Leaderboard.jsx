import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContestLeaderboard } from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'

function formatDuration(ms) {
  if (ms == null) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

export default function Leaderboard() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getContestLeaderboard(id, token)
      .then((payload) => {
        if (!cancelled) setRows(payload?.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? 'Leaderboard is not available yet',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, token])

  return (
    <div className="max-w-3xl">
      <Link to={`/contests/${id}`} className="text-ink/50 text-sm hover:underline">
        ← Back to contest
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="text-ink/60 mt-2 text-sm">
        Ranked by total score, then faster completion time.
      </p>

      {loading ? <p className="text-ink/50 mt-6 text-sm">Loading…</p> : null}
      {error ? <p className="mt-6 text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 mt-6 overflow-hidden rounded-2xl border backdrop-blur-md">
          <div className="grid grid-cols-[4rem_1fr_6rem_8rem] gap-3 border-b border-ink/10 px-5 py-3 font-mono text-[11px] tracking-widest uppercase dark:border-white/10">
            <span>Rank</span>
            <span>Name</span>
            <span>Score</span>
            <span>Time</span>
          </div>
          {rows.length === 0 ? (
            <p className="text-ink/50 px-5 py-6 text-sm">No submissions yet.</p>
          ) : (
            rows.map((row) => {
              const isMe = user?.id && row.userId === user.id
              return (
                <div
                  key={row.userId}
                  className={
                    isMe
                      ? 'grid grid-cols-[4rem_1fr_6rem_8rem] gap-3 border-b border-ink/10 bg-gold/10 px-5 py-3 text-sm dark:border-white/10'
                      : 'grid grid-cols-[4rem_1fr_6rem_8rem] gap-3 border-b border-ink/10 px-5 py-3 text-sm dark:border-white/10'
                  }
                >
                  <span>{row.rank}</span>
                  <span>{row.name}</span>
                  <span>{row.totalScore}</span>
                  <span>{formatDuration(row.totalTimeTakenMs)}</span>
                </div>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}
