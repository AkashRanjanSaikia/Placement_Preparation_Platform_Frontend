import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  getContest,
  registerForContest,
  regenerateJoinCode,
} from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'
import {
  useServerCountdown,
  useUntilStart,
} from './hooks/useServerCountdown.js'
import JoinCodeModal from './components/JoinCodeModal.jsx'

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function ContestDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuth()
  const [contest, setContest] = useState(null)
  const [serverTime, setServerTime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState('')
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [newJoinCode, setNewJoinCode] = useState(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getContest(id, token)
      .then((payload) => {
        if (!cancelled) {
          setContest(payload?.data ?? null)
          setServerTime(payload?.serverTime ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) setMessage('Contest not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, token])

  const untilStart = useUntilStart(contest?.startTime, serverTime)
  const timeLeft = useServerCountdown(
    contest?.status === 'live' ? contest?.endTime : null,
    serverTime,
  )

  async function doRegister(joinCode) {
    setRegistering(true)
    setJoinError('')
    setMessage('')
    try {
      await registerForContest(id, token, joinCode)
      const payload = await getContest(id, token)
      setContest(payload?.data ?? null)
      setMessage('Registered successfully')
      setJoinModalOpen(false)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Registration failed'
      if (joinModalOpen) setJoinError(msg)
      else setMessage(msg)
    } finally {
      setRegistering(false)
    }
  }

  function handleRegisterClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (contest?.requiresJoinCode) {
      setJoinError('')
      setJoinModalOpen(true)
      return
    }
    doRegister()
  }

  useEffect(() => {
    const prefill = searchParams.get('code')
    if (
      prefill &&
      contest?.requiresJoinCode &&
      !contest.registered &&
      isAuthenticated &&
      !loading
    ) {
      setJoinModalOpen(true)
    }
  }, [searchParams, contest, isAuthenticated, loading])

  async function handleRegenerateCode() {
    setRegenerating(true)
    setMessage('')
    try {
      const res = await regenerateJoinCode(id, token)
      setNewJoinCode(res?.data?.joinCode ?? null)
      setMessage('New join code generated. Share it with participants.')
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Could not regenerate code')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <p className="text-ink/50 text-sm">Loading contest…</p>
  }

  if (!contest) {
    return <p className="text-sm text-rose-600">{message || 'Contest not found'}</p>
  }

  return (
    <div className="max-w-3xl">
      <Link to="/contests" className="text-ink/50 text-sm hover:underline">
        ← Back to contests
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{contest.title}</h1>
        <span
          className={
            contest.visibility === 'private'
              ? 'rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs text-violet-800 dark:text-violet-200'
              : 'rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-800 dark:text-emerald-200'
          }
        >
          {contest.visibility === 'private' ? 'Private' : 'Public'}
        </span>
      </div>
      {contest.hostName ? (
        <p className="text-ink/50 mt-1 text-sm">Hosted by {contest.hostName}</p>
      ) : null}
      <p className="text-ink/60 mt-2 text-sm capitalize">Status: {contest.status}</p>
      {contest.status === 'upcoming' && untilStart ? (
        <p className="text-ink/50 mt-1 font-mono text-xs">
          Starts in {untilStart.label}
        </p>
      ) : null}
      {contest.status === 'live' ? (
        <p className="text-ink/50 mt-1 font-mono text-xs">
          Time left: {timeLeft.label}
        </p>
      ) : null}

      <p className="text-ink/70 mt-4 text-sm leading-relaxed whitespace-pre-wrap">
        {contest.description || 'No description yet.'}
      </p>

      <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 mt-6 rounded-2xl border p-5 backdrop-blur-md">
        <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
          Schedule
        </p>
        <p className="mt-2 text-sm">{formatWhen(contest.startTime)}</p>
        <p className="text-sm">{formatWhen(contest.endTime)}</p>
        <p className="text-ink/50 mt-3 text-xs">
          {contest.participantCount ?? 0} participants
        </p>
      </div>

      {contest.rules ? (
        <div className="border-ink/10 mt-4 rounded-2xl border p-5 text-sm whitespace-pre-wrap">
          <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
            Rules
          </p>
          <p className="mt-2">{contest.rules}</p>
        </div>
      ) : null}

      {contest.isHost && contest.visibility === 'private' ? (
        <div className="border-ink/10 mt-4 rounded-2xl border p-4 text-sm">
          <p className="font-medium">Host tools</p>
          <p className="text-ink/60 mt-1 text-xs">
            Regenerate join code if the old one was leaked. Previous codes stop working.
          </p>
          <button
            type="button"
            onClick={handleRegenerateCode}
            disabled={regenerating}
            className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 text-xs disabled:opacity-50"
          >
            {regenerating ? 'Generating…' : 'Regenerate join code'}
          </button>
          {newJoinCode ? (
            <p className="mt-3 font-mono text-lg tracking-widest">{newJoinCode}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {!contest.registered &&
        (contest.status === 'upcoming' || contest.status === 'live') ? (
          <button
            type="button"
            onClick={handleRegisterClick}
            disabled={registering}
            className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
          >
            {registering
              ? 'Registering…'
              : contest.requiresJoinCode
                ? 'Register with code'
                : 'Register'}
          </button>
        ) : null}
        {contest.registered && contest.status === 'live' ? (
          <Link
            to={`/contests/${id}/room`}
            className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
          >
            Enter contest room
          </Link>
        ) : null}
        {contest.status === 'completed' ? (
          <Link
            to={`/contests/${id}/leaderboard`}
            className="border-ink/15 rounded-full border px-5 py-2 text-sm"
          >
            View leaderboard
          </Link>
        ) : null}
      </div>

      {message ? <p className="text-ink/60 mt-4 text-sm">{message}</p> : null}

      <JoinCodeModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSubmit={doRegister}
        loading={registering}
        error={joinError}
      />
    </div>
  )
}
