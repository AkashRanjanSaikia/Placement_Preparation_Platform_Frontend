import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthProvider.jsx'

export function initialsFromUser(user) {
  if (!user) return '?'
  const name = user.name?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  const email = user.email?.trim()
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

export default function UserProfileMenu() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (!isAuthenticated || !user) return null

  const initials = initialsFromUser(user)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="bg-ink text-cream flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shadow-sm ring-2 ring-white/80 dark:ring-black/40"
      >
        {initials}
      </button>

      {open ? (
        <div
          className="border-ink/10 bg-white/95 dark:border-white/10 dark:bg-zinc-900/95 absolute right-0 z-50 mt-2 w-64 rounded-2xl border p-4 shadow-lg backdrop-blur-xl"
          role="dialog"
          aria-label="Profile"
        >
          <p className="truncate font-medium">{user.name || 'Account'}</p>
          <p className="text-ink/55 mt-0.5 truncate text-sm">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              logout()
              setOpen(false)
              navigate('/')
            }}
            className="border-ink/15 text-ink/80 hover:bg-ink/5 mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}
