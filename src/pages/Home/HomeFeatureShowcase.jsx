import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Code2,
  Cpu,
  MessageSquare,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    id: 'dsa',
    icon: Code2,
    title: 'DSA Practice',
    description:
      'Work through curated coding problems with difficulty filters, search, and a full editor experience. Track patterns across arrays, trees, graphs, and more—built for daily placement prep.',
    path: '/dsa-practice',
    tag: 'Code',
  },
  {
    id: 'interview',
    icon: MessageSquare,
    title: 'AI Interview',
    description:
      'Practice real interview flow with an AI interviewer. Answer aloud, get structured feedback, and build confidence before campus drives and off-campus rounds.',
    path: '/interview',
    tag: 'Interview',
  },
  {
    id: 'aptitude',
    icon: BarChart3,
    title: 'Aptitude',
    description:
      'Placement-style MCQ sets for quantitative, verbal, and logical reasoning. Filter by difficulty, search questions, and drill the topics companies actually test.',
    path: '/aptitude',
    tag: 'MCQ',
  },
  {
    id: 'cs-core',
    icon: Cpu,
    title: 'CS Fundamentals',
    description:
      'Core CS MCQs on OS, DBMS, networks, and OOP—organized by topic with mixed practice mode. Sharpen theory alongside your coding routine.',
    path: '/cs-core',
    tag: 'Theory',
  },
  {
    id: 'contests',
    icon: Trophy,
    title: 'Contests & Leaderboards',
    description:
      'Join timed contests or host your own—public or private with join codes. Compete live on DSA and MCQ sections, then check leaderboards when events end to see how you rank against peers.',
    path: '/contests',
    tag: 'Compete',
  },
]

export default function HomeFeatureShowcase({ sectionRef, forceReveal }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const observerRef = useRef(null)

  useEffect(() => {
    if (forceReveal) setVisible(true)
  }, [forceReveal])

  useEffect(() => {
    const node = sectionRef?.current
    if (!node) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observerRef.current?.disconnect()
        }
      },
      { rootMargin: '-8% 0px -8% 0px', threshold: 0.12 },
    )

    observerRef.current.observe(node)
    return () => observerRef.current?.disconnect()
  }, [sectionRef])

  const goToFeature = (path) => {
    navigate(path)
  }

  return (
    <section
      id="practice"
      ref={sectionRef}
      className="scroll-mt-[6.25rem] pb-20 pt-10 md:pt-12"
      aria-labelledby="home-features-heading"
    >
      <div className="mb-10 max-w-2xl">
        <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
          {'// Platform'}
        </p>
        <h2
          id="home-features-heading"
          className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Everything you need in one grind
        </h2>
        <p className="text-ink/60 mt-3 text-sm leading-relaxed sm:text-base">
          Pick a module below—each opens the matching tab in your dashboard when
          you&apos;re signed in.
        </p>
      </div>

      <ul className="flex flex-col gap-5 sm:gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          const revealed = visible || forceReveal
          return (
            <li key={feature.id}>
              <button
                type="button"
                onClick={() => goToFeature(feature.path)}
                className={`landing-feature-card group relative flex w-full flex-col gap-5 overflow-hidden rounded-2xl border border-ink/10 bg-white/65 p-5 text-left backdrop-blur-md transition-[border-color,box-shadow,transform] duration-500 ease-out sm:p-6 md:flex-row md:items-center md:gap-8 md:p-8 dark:border-white/10 dark:bg-black/50 ${
                  revealed ? 'landing-feature-card--in' : 'landing-feature-card--pending'
                }`}
                style={{
                  animationDelay: revealed ? `${index * 90}ms` : '0ms',
                }}
              >
                <div className="flex shrink-0 items-start gap-4 md:w-52 md:flex-col md:items-start">
                  <div className="landing-feature-icon flex h-12 w-12 items-center justify-center rounded-xl bg-ink/5 dark:bg-white/5">
                    <Icon size={22} className="text-ink/80" />
                  </div>
                  <span className="text-ink/45 rounded-full border border-ink/10 px-2.5 py-0.5 font-mono text-[10px] tracking-widest uppercase dark:border-white/10">
                    {feature.tag}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-ink/60 mt-2 text-sm leading-relaxed sm:text-[15px]">
                    {feature.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-end md:self-stretch md:justify-between">
                  <span className="text-ink/45 hidden text-xs font-medium md:inline">
                    Open tab
                  </span>
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white/80 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:border-white/15 dark:bg-black/40"
                    aria-hidden
                  >
                    <ArrowUpRight
                      size={18}
                      className="text-ink/50 group-hover:text-gold"
                    />
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="text-ink/45 mt-8 flex items-center gap-2 text-sm">
        <ArrowRight size={14} />
        Not signed in? You&apos;ll be asked to log in first—then we&apos;ll take
        you straight to that feature.
      </p>
    </section>
  )
}
