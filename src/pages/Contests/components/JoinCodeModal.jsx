import { useEffect, useState } from 'react'

export default function JoinCodeModal({ open, onClose, onSubmit, loading, error }) {
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) setCode('')
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-code-title"
    >
      <div className="border-ink/10 bg-cream dark:border-white/10 dark:bg-zinc-900 w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <h2 id="join-code-title" className="text-lg font-semibold">
          Private contest
        </h2>
        <p className="text-ink/60 mt-2 text-sm">
          Enter the join code shared by the host to register.
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ABCD-1234"
          autoComplete="off"
          className="border-ink/15 mt-4 w-full rounded-xl border px-4 py-2.5 font-mono text-sm uppercase tracking-widest"
        />
        {error ? (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-ink/15 rounded-full border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !code.trim()}
            onClick={() => onSubmit(code.trim())}
            className="bg-ink text-cream rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
          >
            {loading ? 'Checking…' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
