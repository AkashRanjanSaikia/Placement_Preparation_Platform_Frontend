import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthProvider.jsx'
import AuthShell from './AuthShell.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    if (!trimmedEmail || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      })
      navigate('/dsa-practice', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign up"
      subtitle="Create your Prepify account and start practicing."
      footer={
        <p className="text-ink/60 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-gold font-medium hover:underline">
            Log in
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
          <span className="text-ink/70 font-medium">Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="border-ink/15 bg-white/70 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-xl border px-3 py-2.5 outline-none disabled:opacity-60"
            placeholder="Your name"
          />
        </label>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="border-ink/15 bg-white/70 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-xl border py-2.5 pr-11 pl-3 outline-none disabled:opacity-60"
              placeholder="At least 8 characters"
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

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink/70 font-medium">Confirm password</span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="border-ink/15 bg-white/70 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-xl border px-3 py-2.5 outline-none disabled:opacity-60"
            placeholder="Repeat your password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-cream hover:bg-ink/90 mt-2 rounded-full py-2.5 text-sm font-medium disabled:opacity-60 dark:bg-gold dark:text-black dark:hover:bg-gold/90"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthShell>
  )
}
