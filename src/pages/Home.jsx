import {
  ArrowRight,
  BarChart3,
  Code2,
  GraduationCap,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider.jsx'
import ThemeProfileControls from '../components/ThemeProfileControls.jsx'
import ThemedBackdrop from '../components/ThemedBackdrop.jsx'
import HomeFeatureShowcase from './Home/HomeFeatureShowcase.jsx'
import LandingNav from './Home/LandingNav.jsx'

const stats = [
  { icon: Users, value: '10K+', label: 'Active Students' },
  { icon: Code2, value: '50K+', label: 'Problems Solved' },
  { icon: BarChart3, value: '95%', label: 'Placement Impact' },
  { icon: GraduationCap, value: '500+', label: 'Colleges Using Prepify' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const featuresSectionRef = useRef(null)
  const [featuresReveal, setFeaturesReveal] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleStartJourney = () => {
    navigate('/dsa-practice')
  }

  const handleExploreFeatures = useCallback(() => {
    setFeaturesReveal(true)
    const node = featuresSectionRef.current
    if (!node) return
    const headerOffset = 100
    const top =
      node.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [])

  const handleScrollToAbout = useCallback(() => {
    const node = document.getElementById('why-prepify')
    if (!node) return
    const headerOffset = 100
    const top =
      node.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [])

  return (
    <div className="relative min-h-screen">
      <ThemedBackdrop variant="landing" />

      <div className="bg-ink/10 pointer-events-none absolute inset-y-0 left-6 z-0 hidden w-px lg:block" />
      <div className="bg-ink/40 pointer-events-none absolute top-24 left-8 z-0 hidden h-2 w-2 rounded-full lg:block" />
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

      <div className="text-ink/50 pointer-events-none absolute top-28 right-10 z-0 hidden text-right font-mono text-[11px] leading-tight lg:top-32 lg:right-14 lg:block">
        <p>Same</p>
        <p>Grind</p>
        <p>Different</p>
        <p>Results</p>
        <p className="mt-1">—</p>
      </div>

      <header
        className={`landing-nav fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-5 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 sm:px-4 lg:px-6 xl:px-8 ${
          navScrolled ? 'landing-nav--scrolled' : 'landing-nav--top'
        }`}
      >
        <Link
          to="/"
          className="justify-self-start font-mono text-lg font-semibold tracking-tight hover:opacity-80"
        >
          &gt;_ Prepify
        </Link>

        <LandingNav onScrollToAbout={handleScrollToAbout} />

        <div className="flex items-center justify-end gap-2 sm:gap-3 justify-self-end">
          <ThemeProfileControls />
        </div>
      </header>

      <div className="relative z-10">
        <div className="mx-auto max-w-350 px-4 pb-0 sm:px-6 lg:px-10">
          <section className="pb-12 pt-28 sm:pt-32 lg:pb-16 lg:pt-36">
            <div className="max-w-xl -ml-2 sm:-ml-4 lg:-ml-10 xl:-ml-14">
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
                  onClick={handleStartJourney}
                  className="bg-ink text-cream hover:bg-ink/90 inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-medium dark:border-gold dark:bg-transparent dark:text-ink dark:hover:bg-gold/10"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Your Journey'}
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleExploreFeatures}
                  className="border-ink/20 hover:border-gold/50 hover:shadow-[0_0_24px_rgba(185,134,47,0.25)] rounded-full border px-6 py-3 text-sm font-medium transition-[border-color,box-shadow] duration-300 dark:hover:shadow-[0_0_28px_rgba(212,160,23,0.22)]"
                >
                  Explore Features
                </button>
              </div>
            </div>
          </section>

          <HomeFeatureShowcase
            sectionRef={featuresSectionRef}
            forceReveal={featuresReveal}
          />

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

          <section
            id="why-prepify"
            className="scroll-mt-[5.75rem] pb-24 text-center"
          >
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
    </div>
  )
}
