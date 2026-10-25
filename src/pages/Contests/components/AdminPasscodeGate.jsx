import { useState } from 'react'
import {
  getStoredAdminKey,
  setStoredAdminKey,
  verifyAdminKey,
} from '../api/contestApi.js'

export default function AdminPasscodeGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => Boolean(getStoredAdminKey()))
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setChecking(true)
    setError('')
    try {
      await verifyAdminKey(passcode)
      setStoredAdminKey(passcode)
      setUnlocked(true)
    } catch {
      setError('Invalid admin passcode')
    } finally {
      setChecking(false)
    }
  }

  if (unlocked) {
    return children
  }

  return (
    <div className="dashboard-panel mx-auto mt-16 max-w-md rounded-2xl p-8">
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        // Admin access
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Contest admin
      </h1>
      <p className="text-ink/60 mt-2 text-sm">
        Enter the passcode from the backend environment to create contests.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Admin passcode"
          className="border-ink/15 bg-cream/80 w-full rounded-xl border px-4 py-2.5 text-sm dark:bg-black/40"
          autoComplete="off"
        />
        {error ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={checking || !passcode.trim()}
          className="bg-ink text-cream w-full rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
        >
          {checking ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
