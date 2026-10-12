import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeProvider.jsx'
import { findAptitudeSet } from './aptitudeHelpers.js'

export default function AptitudeSolve() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const match = useMemo(() => findAptitudeSet(setId), [setId])
  const questions = match?.set?.questions ?? []

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)

  const current = questions[index]
  const selected = current ? answers[current.id] : undefined

  const score = useMemo(() => {
    if (!finished) return 0
    return questions.reduce((total, question) => {
      return answers[question.id] === question.correctIndex ? total + 1 : total
    }, 0)
  }, [finished, questions, answers])

  if (!match) {
    return (
      <SolveShell isDark={isDark} toggleTheme={toggleTheme} onBack={() => navigate('/aptitude')}>
        <p className="text-ink/70 text-sm">This practice set was not found.</p>
      </SolveShell>
    )
  }

  if (questions.length === 0) {
    return (
      <SolveShell
        isDark={isDark}
        toggleTheme={toggleTheme}
        title={match.set.title}
        onBack={() => navigate('/aptitude')}
      >
        <p className="text-ink/70 text-sm">Questions for this set are coming soon.</p>
      </SolveShell>
    )
  }

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => setIndex((i) => Math.min(questions.length - 1, i + 1))

  const selectOption = (optionIndex) => {
    if (finished || !current) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
  }

  const finish = () => {
    setFinished(true)
    setIndex(0)
  }

  return (
    <SolveShell
      isDark={isDark}
      toggleTheme={toggleTheme}
      title={match.set.title}
      subtitle={match.section.title}
      onBack={() => navigate('/aptitude')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
          Question {index + 1} of {questions.length}
        </p>
        {finished ? (
          <p className="text-ink font-mono text-sm">
            Score: {score}/{questions.length}
          </p>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black"
          >
            Submit set
          </button>
        )}
      </div>

      {finished ? (
        <div className="mt-6 flex flex-col gap-6">
          <p className="text-ink/70 text-sm">
            Review your answers below. Correct options are highlighted in green.
          </p>
          {questions.map((question, qIndex) => {
            const userPick = answers[question.id]
            const isCorrect = userPick === question.correctIndex

            return (
              <article
                key={question.id}
                className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 rounded-2xl border p-5 backdrop-blur-md"
              >
                <p className="text-ink/45 font-mono text-[11px] tracking-widest uppercase">
                  Q{qIndex + 1}
                </p>
                {question.passage ? (
                  <p className="text-ink/75 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                    {question.passage}
                  </p>
                ) : null}
                <p className="mt-3 font-medium leading-relaxed">{question.text}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {question.options.map((label, optionIndex) => {
                    const isAnswer = optionIndex === question.correctIndex
                    const isUser = optionIndex === userPick
                    let optionClass =
                      'border-ink/15 text-ink/80 dark:border-white/10 border rounded-xl px-4 py-3 text-sm'

                    if (isAnswer) {
                      optionClass =
                        'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border rounded-xl px-4 py-3 text-sm'
                    } else if (isUser && !isCorrect) {
                      optionClass =
                        'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200 border rounded-xl px-4 py-3 text-sm'
                    }

                    return (
                      <li key={optionIndex} className={optionClass}>
                        {label}
                      </li>
                    )
                  })}
                </ul>
                {question.explanation ? (
                  <p className="text-ink/60 mt-3 text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                ) : null}
              </article>
            )
          })}
          <button
            type="button"
            onClick={() => {
              setFinished(false)
              setAnswers({})
              setIndex(0)
            }}
            className="border-ink/15 text-ink/70 hover:border-ink/30 w-fit rounded-full border px-4 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 mt-6 rounded-2xl border p-5 backdrop-blur-md sm:p-6">
          {current.passage ? (
            <p className="text-ink/75 text-sm leading-relaxed whitespace-pre-wrap">
              {current.passage}
            </p>
          ) : null}
          <p className="mt-4 text-lg font-medium leading-relaxed">{current.text}</p>

          <ul className="mt-6 flex flex-col gap-2">
            {current.options.map((label, optionIndex) => {
              const isSelected = selected === optionIndex
              return (
                <li key={optionIndex}>
                  <button
                    type="button"
                    onClick={() => selectOption(optionIndex)}
                    className={
                      isSelected
                        ? 'border-gold/50 bg-gold/15 text-ink w-full rounded-xl border px-4 py-3 text-left text-sm font-medium dark:text-gold'
                        : 'border-ink/15 text-ink/80 hover:border-ink/30 dark:border-white/10 w-full rounded-xl border px-4 py-3 text-left text-sm'
                    }
                  >
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="border-ink/15 text-ink/70 hover:border-ink/30 flex items-center gap-1 rounded-full border px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={index === questions.length - 1}
              className="border-ink/15 text-ink/70 hover:border-ink/30 flex items-center gap-1 rounded-full border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </SolveShell>
  )
}

function SolveShell({
  isDark,
  toggleTheme,
  title,
  subtitle,
  onBack,
  children,
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${isDark ? '/dark_bg.png' : '/light_bg.jpeg'}')`,
        }}
      />
      <div
        className={
          isDark
            ? 'fixed inset-0 z-0 bg-black/75'
            : 'bg-cream/75 fixed inset-0 z-0'
        }
      />

      <header className="border-ink/10 bg-cream/70 dark:border-white/10 dark:bg-black/55 relative z-10 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm"
          >
            <ArrowLeft size={16} />
            Aptitude
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
        <button
          type="button"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
          className="border-ink/15 text-ink/70 hover:border-ink/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}
