import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContest, getContestLeaderboard } from './api/contestApi.js'
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
  const [sectionColumns, setSectionColumns] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getContestLeaderboard(id, token), getContest(id, token)])
      .then(([lbPayload, contestPayload]) => {
        if (cancelled) return
        setRows(lbPayload?.data ?? [])
        const fromApi = lbPayload?.sectionColumns
        if (fromApi?.length) {
          setSectionColumns(fromApi)
        } else {
          setSectionColumns(
            (contestPayload?.data?.sections ?? []).map((section) => ({
              sectionKey: section.sectionKey,
              name: section.name,
              type: section.type,
            })),
          )
        }
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

  const gridStyle = useMemo(() => {
    const cols = [
      '3.5rem',
      'minmax(8rem,1fr)',
      ...sectionColumns.map(() => '4.5rem'),
      '4rem',
      '5.5rem',
    ]
    return {
      gridTemplateColumns: cols.join(' '),
    }
  }, [sectionColumns])

  return (
    <div className="max-w-5xl">
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
        <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 mt-6 overflow-x-auto rounded-2xl border backdrop-blur-md">
          <div
            className="grid min-w-[32rem] gap-2 border-b border-ink/10 px-4 py-3 font-mono text-[10px] tracking-widest uppercase dark:border-white/10 sm:px-5 sm:text-[11px]"
            style={gridStyle}
          >
            <span>Rank</span>
            <span>Name</span>
            {sectionColumns.map((col) => (
              <span key={col.sectionKey} className="truncate" title={col.name}>
                {col.name}
              </span>
            ))}
            <span>Total</span>
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
                      ? 'grid min-w-[32rem] gap-2 border-b border-ink/10 bg-gold/10 px-4 py-3 text-sm dark:border-white/10 sm:px-5'
                      : 'grid min-w-[32rem] gap-2 border-b border-ink/10 px-4 py-3 text-sm dark:border-white/10 sm:px-5'
                  }
                  style={gridStyle}
                >
                  <span>{row.rank}</span>
                  <span className="truncate">{row.name}</span>
                  {sectionColumns.map((col) => (
                    <span key={col.sectionKey}>
                      {row.sectionScores?.[col.sectionKey] ?? 0}
                    </span>
                  ))}
                  <span className="font-medium">{row.totalScore}</span>
                  <span className="text-ink/70 text-xs sm:text-sm">
                    {formatDuration(row.totalTimeTakenMs)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}
