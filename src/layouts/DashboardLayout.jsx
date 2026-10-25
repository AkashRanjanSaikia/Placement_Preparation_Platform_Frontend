import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Code2,
  Menu,
  MessageSquare,
  Search,
  Cpu,
  Trophy,
  X,
} from 'lucide-react'
import ThemedBackdrop from '../components/ThemedBackdrop.jsx'
import ThemeProfileControls from '../components/ThemeProfileControls.jsx'

const services = [
  { to: '/dsa-practice', label: 'DSA Practice', icon: Code2, end: true },
  { to: '/aptitude', label: 'Aptitude', icon: BarChart3 },
  { to: '/cs-core', label: 'CS Fundamentals', icon: Cpu },
  { to: '/contests', label: 'Contests', icon: Trophy },
  { to: '/interview', label: 'AI Interview', icon: MessageSquare },
];

export default function DashboardLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  const path = location.pathname
  const isDsaPractice = path === '/dsa-practice'
  const isAptitude = path === '/aptitude'
  const isCsCore = path === '/cs-core'
  const isContests = path === '/contests' || path.startsWith('/contests/')
  const searchEnabled =
    isDsaPractice || isAptitude || isCsCore || isContests
  const searchPlaceholder = isContests
    ? 'Search contests by name...'
    : searchEnabled
      ? 'Search questions...'
      : 'Search on practice or contests tabs'

  return (
    <div className="relative min-h-screen">
      <ThemedBackdrop variant="dashboard" />

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
          className={`dashboard-sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <Link
              to="/"
              className="font-mono text-lg font-semibold tracking-tight hover:opacity-80"
            >
              &gt;_ Prepify
            </Link>
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
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="dashboard-chrome sticky top-0 z-10 flex shrink-0 items-center gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              className="border-ink/15 text-ink/70 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={16} />
            </button>

            <form
              className="relative w-full max-w-xl min-w-0 shrink-0"
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
                disabled={!searchEnabled}
                placeholder={searchPlaceholder}
                className="border-ink/15 bg-zinc-50 text-ink placeholder:text-ink/40 focus:border-gold/60 dark:border-white/10 dark:bg-zinc-800 w-full rounded-full border py-2 pr-10 pl-10 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              {searchEnabled && search.trim() ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                  className="text-ink/45 hover:text-ink hover:bg-ink/5 absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              ) : null}
            </form>

            <div className="min-w-3 flex-1" aria-hidden="true" />

            <ThemeProfileControls />
          </header>

          <main className="dashboard-canvas p-4 lg:p-8">
            <Outlet context={{ search, setSearch }} />
          </main>
        </div>
      </div>
    </div>
  )
}
