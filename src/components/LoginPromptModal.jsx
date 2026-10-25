import { Link } from 'react-router-dom'
import { buildLoginUrl, buildSignupUrl } from '../utils/authRedirect.js'

export default function LoginPromptModal({
  open,
  onClose,
  redirectTo = '/',
  title = 'Log in to continue',
  description = 'Create a free account or log in to submit answers and track your progress.',
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className="border-ink/10 bg-cream dark:border-white/10 dark:bg-zinc-900 w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <h2 id="login-prompt-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-ink/60 mt-2 text-sm leading-relaxed">{description}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border-ink/15 rounded-full border px-4 py-2 text-sm order-2 sm:order-1"
          >
            Keep browsing
          </button>
          <Link
            to={buildSignupUrl(redirectTo)}
            className="border-ink/15 text-center rounded-full border px-4 py-2 text-sm font-medium order-3"
            onClick={onClose}
          >
            Sign up
          </Link>
          <Link
            to={buildLoginUrl(redirectTo)}
            className="bg-ink text-cream text-center rounded-full px-4 py-2 text-sm font-medium order-1 sm:order-4 dark:bg-gold dark:text-black"
            onClick={onClose}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
