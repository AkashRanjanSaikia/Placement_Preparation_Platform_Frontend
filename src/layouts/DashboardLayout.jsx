import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Code2,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Sun,
  Cpu,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useTheme } from '../context/ThemeProvider.jsx'
import { useAuth } from '../context/AuthProvider.jsx'

const services = [
  { to: '/dsa-practice', label: 'DSA Practice', icon: Code2, end: true },
  { to: '/aptitude', label: 'Aptitude', icon: BarChart3 },
  { to: '/cs-core', label: 'CS Fundamentals', icon: Cpu },
  { to: '/contests', label: 'Contests', icon: Trophy },
  { to: '/interview', label: 'AI Interview', icon: MessageSquare },
];

export default function DashboardLayout() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const { logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  const isPractice = location.pathname === '/dashboard'

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${isDark ? '/dark_bg.png' : '/light_bg.jpeg'}')`,
        }}
      />
      <div
        className={
          isDark
            ? 'fixed inset-0 z-0 bg-black/70'
            : 'bg-cream/70 fixed inset-0 z-0'
        }
      />

      <div className="relative z-10 flex min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`border-ink/10 bg-cream/80 dark:border-white/10 dark:bg-black/70 fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <span className="font-mono text-lg font-semibold tracking-tight">
              &gt;_ Prepify
            </span>
            <button
              type="button"
              className="text-ink/70 lg:hidden"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-ink/40 px-5 pb-3 font-mono text-[10px] tracking-widest uppercase">
            Services
          </p>

          <nav className="flex flex-1 flex-col gap-1 px-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <NavLink
                  key={service.to}
                  to={service.to}
                  end={service.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-ink text-cream dark:bg-gold/15 dark:text-ink dark:border dark:border-gold/40'
                        : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                    }`
                  }
                >
                  <Icon size={16} />
                  {service.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="border-ink/10 dark:border-white/10 border-t px-3 py-4">
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="text-ink/70 hover:bg-ink/5 hover:text-ink flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-ink/10 bg-cream/60 dark:border-white/10 dark:bg-black/50 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-xl lg:px-6">
            <button
              type="button"
              className="border-ink/15 text-ink/70 flex h-9 w-9 items-center justify-center rounded-full border lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={16} />
            </button>

            <form
              className="relative max-w-xl flex-1"
              onSubmit={(event) => event.preventDefault()}
            >
              <Search
                size={16}
                className="text-ink/40 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={!isPractice}
                placeholder={
                  isPractice
                    ? 'Search questions...'
                    : 'Search is available on DSA Practice'
                }
                className="border-ink/15 bg-white/70 text-ink placeholder:text-ink/40 focus:border-gold/60 dark:border-white/10 dark:bg-black/40 w-full rounded-full border py-2 pr-4 pl-10 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </form>

            <button
              type="button"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
              className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <Outlet context={{ search, setSearch }} />
          </main>
        </div>
      </div>
    </div>
  )
}
