import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ThemedBackdrop from '../../../components/ThemedBackdrop.jsx'
import ThemeProfileControls from '../../../components/ThemeProfileControls.jsx'

export default function ContestRoomShell({
  contestId,
  title,
  onBackToContest,
  children,
}) {
  return (
    <div className="relative flex h-screen min-h-0 flex-col overflow-hidden">
      <ThemedBackdrop variant="focus" />

      <header className="practice-chrome relative z-10 flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onBackToContest ? (
            <button
              type="button"
              onClick={onBackToContest}
              className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          ) : (
            <Link
              to={contestId ? `/contests/${contestId}` : '/contests'}
              className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Contest</span>
            </Link>
          )}
          {title ? (
            <p className="truncate text-sm font-medium sm:text-base">{title}</p>
          ) : null}
        </div>

        <ThemeProfileControls />
      </header>

      <main className="practice-canvas relative z-10 overflow-y-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}
