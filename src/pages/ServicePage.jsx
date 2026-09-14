import { useLocation } from 'react-router-dom'

const copy = {
  '/dashboard/ai-interview': {
    kicker: '// Mock rounds',
    title: 'AI Interview',
    description:
      'Practice behavioral and technical interviews with an AI interviewer. Full sessions land here next.',
  },
  '/dashboard/aptitude': {
    kicker: '// Quant + logic',
    title: 'Aptitude',
    description:
      'Sharpen quantitative, logical, and verbal skills with timed sets. Question banks are coming soon.',
  },
  '/dashboard/contests': {
    kicker: '// Compete weekly',
    title: 'Contests',
    description:
      'Join timed contests and compare scores with peers. Contest calendar will appear here.',
  },
  '/dashboard/leaderboard': {
    kicker: '// Rankings',
    title: 'Leaderboard',
    description:
      'See who is climbing fastest across DSA, aptitude, and interviews. Rankings go live with real data.',
  },
}

export default function ServicePage() {
  const { pathname } = useLocation()
  const page = copy[pathname] ?? {
    kicker: '// Prepify',
    title: 'Service',
    description: 'This workspace is on the way.',
  }

  return (
    <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 max-w-2xl rounded-2xl border p-8 backdrop-blur-md">
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {page.kicker}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{page.title}</h1>
      <p className="text-ink/60 mt-3 text-sm leading-relaxed">{page.description}</p>
    </div>
  )
}
