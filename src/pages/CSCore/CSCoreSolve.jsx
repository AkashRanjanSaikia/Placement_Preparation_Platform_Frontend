import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import LoginPromptModal from '../../components/LoginPromptModal.jsx'
import { useAuth } from '../../context/AuthProvider.jsx'
import PracticeSolveShell from '../../layouts/PracticeSolveShell.jsx'
import {
  checkQuestionAnswer,
  fetchQuestionPage,
  findCsCorePractice,
  formatQuestionDifficulty,
  questionDifficultyStyles,
} from './csCoreHelpers.js'

const QUESTIONS_PER_PAGE = 10
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

function parseDifficultyParam(value) {
  if (!value) return 'All'
  const normalized =
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  return difficulties.includes(normalized) ? normalized : 'All'
}

export default function CSCoreSolve() {
  const { setId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const match = useMemo(() => findCsCorePractice(setId), [setId])

  const initialDifficulty = parseDifficultyParam(searchParams.get('difficulty'))

  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [apiPage, setApiPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [checks, setChecks] = useState({})
  const [checkingId, setCheckingId] = useState(null)

  useEffect(() => {
    setApiPage(1)
    setChecks({})
    setDifficulty(parseDifficultyParam(searchParams.get('difficulty')))
  }, [setId, searchParams])

  useEffect(() => {
    setApiPage(1)
    setChecks({})
  }, [difficulty])

  useEffect(() => {
    if (!setId || !match) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadPage() {
      setLoading(true)
      setLoadError(false)
      try {
        const data = await fetchQuestionPage({
          topic: setId,
          page: apiPage,
          limit: QUESTIONS_PER_PAGE,
          difficulty,
        })
        if (cancelled) return
        const list = Array.isArray(data.data) ? data.data : []
        setQuestions(list)
        setTotalPages(data.totalPages ?? 0)
        setTotalQuestions(data.total ?? 0)
      } catch {
        if (!cancelled) {
          setQuestions([])
          setLoadError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPage()
    return () => {
      cancelled = true
    }
  }, [setId, match, apiPage, difficulty])

  const handleCheck = useCallback(async (question, optionIndex) => {
    if (!question?._id) return

    if (!isAuthenticated) {
      setLoginPromptOpen(true)
      return
    }

    const checkState = checks[question._id]
    const solved = checkState?.result === 'correct'
    if (checkingId === question._id || solved) return

    setCheckingId(question._id)
    try {
      const data = await checkQuestionAnswer(question._id, optionIndex)
      const result = data.correct ? 'correct' : 'wrong'
      setChecks((prev) => ({
        ...prev,
        [question._id]: {
          selectedIndex: optionIndex,
          result,
          explanation: data.explanation,
        },
      }))
    } catch {
      setChecks((prev) => ({
        ...prev,
        [question._id]: {
          selectedIndex: optionIndex,
          result: 'error',
        },
      }))
    } finally {
      setCheckingId(null)
    }
  }, [checks, checkingId, isAuthenticated])

  if (!match) {
    return (
      <PracticeSolveShell
        backLabel="CS Fundamentals"
        onBack={() => navigate('/cs-core')}
      >
        <p className="text-ink/70 text-sm">This practice topic was not found.</p>
      </PracticeSolveShell>
    )
  }

  if (!loading && (loadError || totalQuestions === 0)) {
    return (
      <PracticeSolveShell
        backLabel="CS Fundamentals"
        title={match.title}
        subtitle={match.subjectTitle}
        onBack={() => navigate('/cs-core')}
      >
        <p className="text-ink/70 text-sm">
          {loadError
            ? 'Could not load questions. Check that the backend is running.'
            : difficulty === 'All'
              ? 'Questions for this topic are coming soon.'
              : `No ${difficulty} questions in this topic. Try All.`}
        </p>
      </PracticeSolveShell>
    )
  }

  const goPrevPage = () => setApiPage((p) => Math.max(1, p - 1))
  const goNextPage = () => setApiPage((p) => Math.min(totalPages, p + 1))

  const pageStart =
    totalQuestions === 0 ? 0 : (apiPage - 1) * QUESTIONS_PER_PAGE + 1
  const pageEnd = Math.min(apiPage * QUESTIONS_PER_PAGE, totalQuestions)

  const subtitle =
    match.sectionTitle && match.title !== match.sectionTitle
      ? `${match.sectionTitle} · ${match.title}`
      : match.subjectTitle

  return (
    <PracticeSolveShell
      backLabel="CS Fundamentals"
      title={match.title}
      subtitle={subtitle}
      onBack={() => navigate('/cs-core')}
    >
      {loading ? (
        <p className="text-ink/60 text-sm">Loading questions…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={
                  difficulty === level
                    ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm font-medium dark:bg-gold dark:text-black'
                    : 'border-ink/15 text-ink/70 hover:border-ink/30 rounded-full border px-4 py-1.5 text-sm'
                }
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
              {totalQuestions} question{totalQuestions === 1 ? '' : 's'}
              {totalPages > 1
                ? ` · Showing ${pageStart}–${pageEnd} (page ${apiPage} of ${totalPages})`
                : ''}
            </p>
            <p className="text-ink/45 font-mono text-[11px]">
              Tap an option to check your answer
            </p>
          </div>

          <ol className="mt-6 flex flex-col gap-6">
            {questions.map((question, questionIndex) => {
              const questionNumber = pageStart + questionIndex
              const checkState = checks[question._id]
              const solved = checkState?.result === 'correct'
              const isChecking = checkingId === question._id
              const options = Array.isArray(question.options)
                ? question.options
                : []
              const difficultyLabel = formatQuestionDifficulty(question.difficulty)
              const difficultyClass =
                questionDifficultyStyles[difficultyLabel] ??
                questionDifficultyStyles.Medium

              return (
                <li
                  key={question._id}
                  className="practice-panel rounded-2xl p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-ink/45 font-mono text-[11px] tracking-widest uppercase">
                      Question {questionNumber}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClass}`}
                    >
                      {difficultyLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-medium leading-relaxed">
                    {question.questionText}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2">
                    {options.map((label, optionIndex) => {
                      const isSelected =
                        checkState?.selectedIndex === optionIndex
                      const showCorrect = solved && isSelected
                      const showWrong =
                        checkState?.result === 'wrong' && isSelected

                      let optionClass =
                        'border-ink/15 text-ink/80 hover:border-ink/30 dark:border-white/10 w-full rounded-xl border px-4 py-3 text-left text-sm disabled:opacity-60'

                      if (showCorrect) {
                        optionClass =
                          'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 w-full rounded-xl border px-4 py-3 text-left text-sm font-medium'
                      } else if (showWrong) {
                        optionClass =
                          'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200 w-full rounded-xl border px-4 py-3 text-left text-sm'
                      } else if (isSelected) {
                        optionClass =
                          'border-gold/50 bg-gold/15 text-ink w-full rounded-xl border px-4 py-3 text-left text-sm font-medium dark:text-gold'
                      }

                      return (
                        <li key={optionIndex}>
                          <button
                            type="button"
                            disabled={isChecking || solved}
                            onClick={() => handleCheck(question, optionIndex)}
                            className={optionClass}
                          >
                            {label}
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  {checkState?.result === 'wrong' ? (
                    <p className="text-rose-700/90 dark:text-rose-300/90 mt-4 text-sm">
                      Not quite — try another option.
                    </p>
                  ) : null}

                  {checkState?.result === 'correct' && checkState.explanation ? (
                    <p className="text-ink/60 mt-4 text-sm leading-relaxed">
                      {checkState.explanation}
                    </p>
                  ) : null}

                  {checkState?.result === 'error' ? (
                    <p className="text-ink/60 mt-4 text-sm">
                      Could not verify your answer. Please try again.
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ol>

          {totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={goPrevPage}
                disabled={apiPage <= 1}
                className="border-ink/15 text-ink/70 hover:border-ink/30 rounded-full border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous page
              </button>
              <span className="text-ink/50 font-mono text-xs">
                Page {apiPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={goNextPage}
                disabled={apiPage >= totalPages}
                className="border-ink/15 text-ink/70 hover:border-ink/30 rounded-full border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next page
              </button>
            </div>
          ) : null}
        </>
      )}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        redirectTo={`${location.pathname}${location.search}`}
        title="Log in to check your answer"
        description="Browse CS fundamentals questions for free. Log in when you are ready to submit an option and see if you are correct."
      />
    </PracticeSolveShell>
  )
}
