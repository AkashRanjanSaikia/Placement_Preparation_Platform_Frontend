import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthProvider.jsx'
import { useAuthFormRedirect } from '../../hooks/useAuthFormRedirect.js'
import AuthShell from './AuthShell.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { redirectTo, redirectQuery, intentMessage } = useAuthFormRedirect()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await login({ email: trimmedEmail, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Continue your placement prep."
      banner={intentMessage}
      footer={
        <p className="text-ink/60 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            to={`/signup${redirectQuery}`}
            className="text-gold font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200"
          >
            {error}
          </p>
        ) : null}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/70 font-medium">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="border-ink/15 bg-white/70 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-xl border px-3 py-2.5 outline-none disabled:opacity-60"
            placeholder="you@college.edu"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/70 font-medium">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="border-ink/15 bg-white/70 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-xl border py-2.5 pr-11 pl-3 outline-none disabled:opacity-60"
              placeholder="Your password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="text-ink/50 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-cream hover:bg-ink/90 mt-2 rounded-full py-2.5 text-sm font-medium disabled:opacity-60 dark:bg-gold dark:text-black dark:hover:bg-gold/90"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}
