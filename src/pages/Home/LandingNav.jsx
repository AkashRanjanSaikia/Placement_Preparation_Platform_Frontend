import { ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider.jsx'
import { buildLoginUrl } from '../../utils/authRedirect.js'

const PRACTICE_ITEMS = [
  { label: 'DSA Practice', path: '/dsa-practice' },
  { label: 'Aptitude', path: '/aptitude' },
  { label: 'CS Core', path: '/cs-core' },
]

const CONTEST_ITEMS = [
  { label: 'Live', path: '/contests?tab=live' },
  { label: 'Upcoming', path: '/contests?tab=upcoming' },
  { label: 'Completed', path: '/contests?tab=completed' },
]

function NavDropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false), 280)
  }

  const handleOpen = () => {
    clearCloseTimer()
    setOpen(true)
  }

  const handleToggle = () => {
    clearCloseTimer()
    setOpen((v) => !v)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="landing-nav-trigger group/trigger inline-flex items-center gap-1 py-1 transition-colors hover:text-ink"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {label}
        <ChevronDown
          size={14}
          className={`opacity-60 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {/* pt-3 bridge (padding is hoverable; margin was not) */}
      <div
        className={`absolute top-full left-1/2 z-50 w-52 -translate-x-1/2 pt-3 ${
          open ? '' : 'pointer-events-none invisible'
        }`}
        onMouseEnter={handleOpen}
        role="presentation"
      >
        <div
          className={`landing-nav-dropdown ${open ? 'landing-nav-dropdown--open' : ''}`}
          role="menu"
        >
          <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/90 p-1.5 shadow-[0_16px_48px_rgba(20,18,15,0.12)] backdrop-blur-xl dark:border-white/12 dark:bg-zinc-900/92">
            {items.map((item) => (
              <li key={item.path} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink/80 transition-colors duration-200 hover:bg-ink/5 hover:text-ink dark:hover:bg-white/8"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    clearCloseTimer()
                    setOpen(false)
                    onNavigate(item.path)
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function LandingNav({ onScrollToAbout }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const goProtected = useCallback(
    (path) => {
      if (isAuthenticated) {
        navigate(path)
        return
      }
      navigate(buildLoginUrl(path))
    },
    [isAuthenticated, navigate],
  )

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav
      className="text-ink/70 hidden items-center justify-center gap-6 text-sm font-medium md:flex lg:gap-8"
      aria-label="Main"
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="text-ink after:bg-gold relative py-1 after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:content-['']"
      >
        Home
      </button>

      <NavDropdown label="Practice" items={PRACTICE_ITEMS} onNavigate={goProtected} />

      <button
        type="button"
        onClick={() => goProtected('/interview')}
        className="py-1 transition-colors hover:text-ink"
      >
        AI Interview
      </button>

      <NavDropdown label="Contests" items={CONTEST_ITEMS} onNavigate={goProtected} />

      <button
        type="button"
        onClick={onScrollToAbout}
        className="py-1 transition-colors hover:text-ink"
      >
        About
      </button>
    </nav>
  )
}
