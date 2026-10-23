import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeProvider.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

const themeButtonClass =
  'border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors'

/**
 * Theme toggle + account avatar — same cluster as the home page header (top-right).
 */
export default function ThemeProfileControls({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

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
      <UserProfileMenu />
    </div>
  )
}
