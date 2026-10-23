import { useState } from 'react'

export default function HostContestDangerActions({
  contest,
  busy,
  onStop,
  onDelete,
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [stopOpen, setStopOpen] = useState(false)

  if (!contest?.published || contest.deletedAt) {
    return null
  }

  const canStop =
    contest.status === 'live' || contest.status === 'upcoming'

  return (
    <div className="border-rose-500/25 mt-8 rounded-2xl border bg-rose-500/5 p-5">
      <p className="font-medium text-rose-900 dark:text-rose-100">
        Host controls
      </p>
      <p className="text-ink/60 mt-1 text-sm">
        Stopping ends the contest for everyone in the room (answers are saved and
        attempts are closed). Deleting removes the contest from student views.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {canStop && !contest.hostStoppedAt ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStopOpen(true)}
            className="rounded-full border border-amber-600/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-950 disabled:opacity-50 dark:text-amber-100"
          >
            Stop contest now
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setConfirmTitle('')
            setDeleteOpen(true)
          }}
          className="rounded-full border border-rose-600/40 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-50 dark:text-rose-300"
        >
          Delete contest
        </button>
      </div>

      {stopOpen ? (
        <div
          className="border-ink/10 mt-4 rounded-xl border bg-white/90 p-4 dark:bg-zinc-900/90"
          role="dialog"
          aria-label="Confirm stop contest"
        >
          <p className="text-sm font-medium">Stop this contest?</p>
          <p className="text-ink/60 mt-2 text-sm">
            Anyone currently in the contest room will be closed out safely. This
            cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setStopOpen(false)
                onStop?.()
              }}
              className="rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? 'Stopping…' : 'Yes, stop contest'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setStopOpen(false)}
              className="border-ink/15 rounded-full border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="border-ink/10 mt-4 rounded-xl border bg-white/90 p-4 dark:bg-zinc-900/90"
          role="dialog"
          aria-label="Confirm delete contest"
        >
          <p className="text-sm font-medium">Delete this contest permanently?</p>
          <p className="text-ink/60 mt-2 text-sm">
            Type <strong className="font-semibold">{contest.title}</strong> below
            to confirm. Active rooms will be closed first.
          </p>
          <input
            type="text"
            value={confirmTitle}
            onChange={(e) => setConfirmTitle(e.target.value)}
            className="border-ink/15 mt-3 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Contest title"
            autoComplete="off"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                busy || confirmTitle.trim() !== String(contest.title).trim()
              }
              onClick={() => {
                setDeleteOpen(false)
                onDelete?.(confirmTitle.trim())
              }}
              className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Delete contest'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteOpen(false)}
              className="border-ink/15 rounded-full border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
