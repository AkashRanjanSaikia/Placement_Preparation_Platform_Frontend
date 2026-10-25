import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteHostContest,
  getHostContest,
  publishContest,
  regenerateJoinCode,
  stopHostContest,
} from './api/contestApi.js'
import HostContestDangerActions from './components/HostContestDangerActions.jsx'
import { useAuth } from '../../context/AuthProvider.jsx'
import PublishSuccessPanel from './components/PublishSuccessPanel.jsx'

import { formatContestScheduleRange } from './utils/contestDateTime.js'

export default function HostContestManage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [publishedMeta, setPublishedMeta] = useState(null)
  const [newJoinCode, setNewJoinCode] = useState(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    getHostContest(id, token)
      .then((payload) => {
        if (!cancelled) setContest(payload?.data ?? null)
      })
      .catch((err) => {
        if (!cancelled) {
          setMessage(err?.response?.data?.message ?? 'Could not load contest')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  async function handlePublish() {
    setBusy(true)
    setMessage('')
    try {
      const pub = await publishContest(id, 'host', token)
      setPublishedMeta({
        contestId: id,
        visibility: contest?.visibility ?? 'public',
        joinCode: pub?.data?.joinCode,
      })
      const refreshed = await getHostContest(id, token)
      setContest(refreshed?.data ?? null)
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteDraft() {
    if (!window.confirm('Delete this draft permanently?')) return
    setBusy(true)
    setMessage('')
    try {
      await deleteHostContest(id, token)
      navigate('/contests', { replace: true })
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Delete failed')
      setBusy(false)
    }
  }

  async function handleStopContest() {
    setBusy(true)
    setMessage('')
    try {
      await stopHostContest(id, token)
      const refreshed = await getHostContest(id, token)
      setContest(refreshed?.data ?? null)
      setMessage('Contest stopped. Participants have been closed out safely.')
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Could not stop contest')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeletePublished(confirmTitle) {
    setBusy(true)
    setMessage('')
    try {
      await deleteHostContest(id, token, { confirmTitle })
      navigate('/contests', { replace: true })
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Delete failed')
      setBusy(false)
    }
  }

  async function handleRegenerateCode() {
    setBusy(true)
    setMessage('')
    try {
      const res = await regenerateJoinCode(id, token)
      setNewJoinCode(res?.data?.joinCode ?? null)
      setMessage('New join code generated. Share it with participants.')
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Could not regenerate code')
    } finally {
      setBusy(false)
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/contests/${id}`
    navigator.clipboard?.writeText(url)
    setMessage('Contest link copied.')
  }

  if (loading) {
    return <p className="text-ink/50 text-sm">Loading…</p>
  }

  if (!contest) {
    return <p className="text-sm text-rose-600">{message || 'Contest not found'}</p>
  }

  const isDraft = !contest.published

  return (
    <div className="max-w-3xl">
      <Link to="/contests" className="text-ink/50 text-sm hover:underline">
        ← Back to contests
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{contest.title}</h1>
        <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs capitalize">
          {isDraft ? 'Draft' : contest.status}
        </span>
        <span
          className={
            contest.visibility === 'private'
              ? 'rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs text-violet-800'
              : 'rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-800'
          }
        >
          {contest.visibility === 'private' ? 'Private' : 'Public'}
        </span>
      </div>

      <p className="text-ink/60 mt-2 text-sm">Host dashboard</p>

      <div className="dashboard-panel mt-6 space-y-3 rounded-2xl p-5 text-sm">
        <p>
          <span className="text-ink/50">Schedule:</span>{' '}
          {formatContestScheduleRange(contest.startTime, contest.endTime)}
        </p>
        <p>
          <span className="text-ink/50">Sections:</span> {contest.sectionCount} ·{' '}
          <span className="text-ink/50">Questions:</span> {contest.questionCount}
        </p>
        {contest.published ? (
          <p>
            <span className="text-ink/50">Registered:</span>{' '}
            {contest.participantCount}
            {contest.maxParticipants
              ? ` / ${contest.maxParticipants}`
              : ''}
          </p>
        ) : null}
      </div>

      {publishedMeta ? (
        <PublishSuccessPanel
          contestId={publishedMeta.contestId}
          visibility={publishedMeta.visibility}
          joinCode={publishedMeta.joinCode}
          onDismiss={() => setPublishedMeta(null)}
        />
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {isDraft ? (
          <>
            <Link
              to={`/contests/edit/${id}`}
              className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
            >
              Continue editing
            </Link>
            <button
              type="button"
              onClick={handlePublish}
              disabled={busy}
              className="border-ink/15 rounded-full border px-5 py-2 text-sm disabled:opacity-50"
            >
              {busy ? 'Publishing…' : 'Publish now'}
            </button>
            <button
              type="button"
              onClick={handleDeleteDraft}
              disabled={busy}
              className="text-sm text-rose-600 disabled:opacity-50"
            >
              Delete draft
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={copyShareLink}
              className="border-ink/15 rounded-full border px-5 py-2 text-sm"
            >
              Copy contest link
            </button>
            <Link
              to={`/contests/${id}`}
              className="border-ink/15 rounded-full border px-5 py-2 text-sm"
            >
              Student view
            </Link>
            {contest.status === 'completed' ? (
              <Link
                to={`/contests/${id}/leaderboard`}
                className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
              >
                Leaderboard
              </Link>
            ) : null}
            {contest.visibility === 'private' ? (
              <button
                type="button"
                onClick={handleRegenerateCode}
                disabled={busy}
                className="border-ink/15 rounded-full border px-5 py-2 text-sm disabled:opacity-50"
              >
                Regenerate join code
              </button>
            ) : null}
          </>
        )}
      </div>

      {newJoinCode ? (
        <p className="mt-4 font-mono text-lg tracking-widest">{newJoinCode}</p>
      ) : null}

      <HostContestDangerActions
        contest={contest}
        busy={busy}
        onStop={handleStopContest}
        onDelete={handleDeletePublished}
      />

      {message ? <p className="text-ink/60 mt-4 text-sm">{message}</p> : null}
    </div>
  )
}
