import { Moon, Sun } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider.jsx'
import { useAuth } from '../context/AuthProvider.jsx'
import { buildLoginUrl, buildSignupUrl } from '../utils/authRedirect.js'
import UserProfileMenu from './UserProfileMenu.jsx'

const themeButtonClass =
  'border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors'

/**
 * Theme toggle + account avatar — same cluster as the home page header (top-right).
 */
export default function ThemeProfileControls({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isDark = theme === 'dark'
  const returnPath = `${location.pathname}${location.search}`

  return (
    <div
      className={`flex shrink-0 items-center gap-2 sm:gap-3 ${className}`.trim()}
    >
      <button
        type="button"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={toggleTheme}
        className={themeButtonClass}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      {!isAuthenticated ? (
        <>
          <Link
            to={buildLoginUrl(returnPath)}
            className="border-ink/15 text-ink/80 hover:border-ink/30 rounded-full border px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2"
          >
            Log in
          </Link>
          <Link
            to={buildSignupUrl(returnPath)}
            className="bg-ink text-cream rounded-full px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2 dark:bg-gold dark:text-black"
          >
            Sign up
          </Link>
        </>
      ) : null}
      <UserProfileMenu />
    </div>
  )
}
