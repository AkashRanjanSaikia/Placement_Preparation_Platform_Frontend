export default function PublishSuccessPanel({
  contestId,
  visibility,
  joinCode,
  onDismiss,
}) {
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/contests/${contestId}`
      : `/contests/${contestId}`

  return (
    <div className="border-emerald-500/30 bg-emerald-500/10 mt-6 rounded-2xl border p-6">
      <p className="font-medium text-emerald-800 dark:text-emerald-200">
        Contest published
      </p>
      <p className="text-ink/70 mt-2 text-sm">
        Share this link with participants:{' '}
        <span className="font-mono text-xs break-all">{shareUrl}</span>
      </p>
      {visibility === 'private' && joinCode ? (
        <div className="mt-4 rounded-xl bg-black/5 p-4 dark:bg-white/5">
          <p className="text-ink/50 text-xs uppercase tracking-wide">
            Join code (save now — shown once)
          </p>
          <p className="mt-2 font-mono text-2xl tracking-widest">{joinCode}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(joinCode)}
            className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 text-xs"
          >
            Copy code
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 text-sm underline"
      >
        Done
      </button>
    </div>
  )
}
