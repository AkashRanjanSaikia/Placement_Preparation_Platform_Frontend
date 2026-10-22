import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Code2,
  GraduationCap,
  MessageSquare,
  Moon,
  Sun,
  Trophy,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider.jsx'

const navLinks = [
  'Home',
  'Practice',
  'AI Interview',
  'Contests',
  'Leaderboard',
  'About',
]

const features = [
  {
    icon: Code2,
    title: 'DSA Practice',
    description: 'Solve curated problems and level up your coding skills.',
  },
  {
    icon: MessageSquare,
    title: 'AI Interviews',
    description: 'Get real interview experience with our AI interviewer.',
  },
  {
    icon: BarChart3,
    title: 'Aptitude Prep',
    description: 'Sharpen your logical and analytical skills.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with peers and climb the ranks.',
  },
]

const stats = [
  { icon: Users, value: '10K+', label: 'Active Students' },
  { icon: Code2, value: '50K+', label: 'Problems Solved' },
  { icon: BarChart3, value: '95%', label: 'Placement Impact' },
  { icon: GraduationCap, value: '500+', label: 'Colleges Using Prepify' },
]

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'
  const goToDashboard = () => navigate('/dsa-practice')

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${isDark ? '/dark_bg.png' : '/light_bg.jpeg'}')`,
        }}
      />
      <div
        className={
          isDark
            ? 'fixed inset-0 z-0 bg-linear-to-r from-black/80 via-black/45 to-black/15'
            : 'bg-cream/20 fixed inset-0 z-0'
        }
      />

      {/* Decorative left rail */}
      <div className="bg-ink/10 pointer-events-none absolute inset-y-0 left-6 z-0 hidden w-px lg:block" />
      <div className="bg-ink/40 pointer-events-none absolute top-6 left-3 z-0 hidden h-2 w-2 rounded-full lg:block" />
      <div className="pointer-events-none absolute top-1/2 left-0 z-0 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-3">
        <span className="border-ink/30 h-8 w-4 rounded-full border" />
        <span
          className="text-ink/40 font-mono text-[10px] tracking-widest uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll to explore
        </span>
        <span className="bg-ink/40 h-1 w-1 rounded-full" />
        <span className="bg-ink/40 h-1 w-1 rounded-full" />
      </div>

      <p className="text-ink/35 pointer-events-none absolute bottom-10 left-8 z-0 hidden max-w-36 font-mono text-[11px] leading-relaxed lg:block">
        “A Developer Builds A Better Tomorrow”
      </p>

      {/* Decorative top-right tagline */}
      <div className="text-ink/50 pointer-events-none absolute top-6 right-8 z-0 hidden text-right font-mono text-[11px] leading-tight lg:block">
        <p>Same</p>
        <p>Grind</p>
        <p>Different</p>
        <p>Results</p>
        <p className="mt-1">—</p>
      </div>

      <p className="text-ink/35 pointer-events-none absolute right-8 bottom-8 z-0 hidden font-mono text-[11px] lg:block">
        keep going..
      </p>

      <div className="relative z-10 mx-auto max-w-350 px-6 lg:px-14">
        {/* Navbar */}
        <header className="flex items-center justify-between py-8">
          <span className="font-mono text-lg font-semibold tracking-tight">
            &gt;_ Prepify
          </span>

          <nav className="text-ink/70 hidden items-center gap-8 text-sm font-medium md:flex">
            {navLinks.map((link, index) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className={
                  index === 0
                    ? 'text-ink after:bg-gold relative after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:content-[""]'
                    : 'hover:text-ink transition-colors'
                }
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
              className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 w-9 items-center justify-center rounded-full border"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="border-ink/15 hover:border-ink/30 rounded-full border px-4 py-2 text-sm font-medium"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="bg-ink text-cream hover:bg-ink/90 rounded-full px-4 py-2 text-sm font-medium"
            >
              Sign Up
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="grid gap-10 pt-6 pb-16 lg:grid-cols-2 lg:gap-8 lg:pt-10">
          <div className="max-w-xl">
            <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
              {'// Practice. Improve. Get placed.'}
            </p>

            <h1 className="mt-4 font-sans text-6xl leading-[0.95] font-bold tracking-tight sm:text-7xl">
              Code
              <br />A Better
              <br />
              You_
            </h1>

            <p className="text-ink/60 mt-6 max-w-md">
              Prepify is your all-in-one platform for DSA practice, aptitude
              preparation, and AI-powered mock interviews. Practice, improve,
              and stay ahead in your placement journey.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={goToDashboard}
                className="bg-ink text-cream hover:bg-ink/90 inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-medium dark:border-gold dark:bg-transparent dark:text-ink dark:hover:bg-gold/10"
              >
                Start Your Journey
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="border-ink/20 hover:border-ink/40 rounded-full border px-6 py-3 text-sm font-medium"
              >
                Explore Features
              </button>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-ink/10 bg-white/60 p-5 backdrop-blur-md transition-colors hover:border-gold/60 hover:shadow-[0_0_28px_rgba(185,134,47,0.18)] dark:border-white/10 dark:bg-black/50 dark:hover:border-gold/60 dark:hover:bg-black/55 dark:hover:shadow-[0_0_32px_rgba(212,160,23,0.28)]"
              >
                <div className="bg-ink/5 flex h-10 w-10 items-center justify-center rounded-lg dark:bg-white/5">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="text-ink/55 mt-1 text-sm">{feature.description}</p>
                <ArrowUpRight
                  size={16}
                  className="text-ink/40 group-hover:text-ink mt-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            )
          })}
        </section>

        {/* Stats bar */}
        <section className="border-ink/10 mb-16 grid gap-6 rounded-2xl border bg-white/60 px-6 py-6 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-black/50">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <Icon size={20} className="text-ink/70" />
                <div>
                  <p className="font-semibold">{stat.value}</p>
                  <p className="text-ink/50 text-xs">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </section>

        {/* Why Prepify teaser */}
        <section className="pb-24 text-center">
          <p className="text-ink/40 font-mono text-xs tracking-widest uppercase">
            {'— // Why Prepify? //'}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-snug font-semibold sm:text-4xl">
            More than just practice.
            <br />A home for{' '}
            <span className="text-gold">future developers</span>.
          </h2>
        </section>
      </div>
    </div>
  )
}
