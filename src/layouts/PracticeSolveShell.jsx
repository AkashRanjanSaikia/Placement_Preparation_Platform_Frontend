import { ArrowLeft } from 'lucide-react'
import ThemedBackdrop from '../components/ThemedBackdrop.jsx'
import ThemeProfileControls from '../components/ThemeProfileControls.jsx'

/**
 * Full-width muted canvas (like DSA / contest room) with a centered content column.
 */
export default function PracticeSolveShell({
  backLabel,
  onBack,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ThemedBackdrop variant="focus" />

      <header className="practice-chrome relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
          {title ? (
            <div className="min-w-0">
              <p className="truncate font-medium">{title}</p>
              {subtitle ? (
                <p className="text-ink/50 truncate text-xs">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <ThemeProfileControls />
      </header>

      <div className="practice-canvas relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  )
}
