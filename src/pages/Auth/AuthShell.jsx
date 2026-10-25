import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeProvider.jsx'
import ThemedBackdrop from '../../components/ThemedBackdrop.jsx'

export default function AuthShell({ title, subtitle, banner, children, footer }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="relative flex min-h-screen flex-col">
      <ThemedBackdrop variant="dashboard" />

      <header className="border-ink/10 bg-cream/70 dark:border-white/10 dark:bg-black/55 relative z-10 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl sm:px-6">
        <Link
          to="/"
          className="font-mono text-lg font-semibold tracking-tight"
        >
          &gt;_ Prepify
        </Link>
        <button
          type="button"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
          className="border-ink/15 text-ink/70 hover:border-ink/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 rounded-2xl border p-6 backdrop-blur-md sm:p-8">
          <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
            {'// Prepify'}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-ink/60 mt-2 text-sm">{subtitle}</p>
          ) : null}
          {banner ? (
            <p className="text-ink/70 mt-4 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-sm dark:text-sky-100">
              {banner}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 border-t border-ink/10 pt-6 dark:border-white/10">{footer}</div> : null}
        </div>
      </main>
    </div>
  )
}
