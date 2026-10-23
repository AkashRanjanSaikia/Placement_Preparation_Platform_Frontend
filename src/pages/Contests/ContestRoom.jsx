import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  finalizeContestExam,
  getContestAttempt,
  getMyContestSubmissions,
  runContestDsaCode,
  saveContestAnswer,
} from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import { CONTEST_LANGUAGES } from './contestConstants.js'
import ContestDsaExample from './components/ContestDsaExample.jsx'
import ContestDsaEditor from './components/ContestDsaEditor.jsx'
import ContestQuestionNav from './components/ContestQuestionNav.jsx'
import ContestRoomCountdown from './components/ContestRoomCountdown.jsx'
import OutputPanel from '../DSA/OutputPanel.jsx'

function starterCodeByLanguage(starterCode = []) {
  return starterCode.reduce((acc, { language, code }) => {
    if (language) acc[language] = code ?? ''
    return acc
  }, {})
}

function languageIdFromKey(key) {
  return CONTEST_LANGUAGES.find((l) => l.id === key)?.judge0Id ?? 71
}

function judgeKeyFromLanguageId(languageId) {
  const found = CONTEST_LANGUAGES.find((l) => l.judge0Id === languageId)
  return found?.id ?? 'python'
}

export default function ContestRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { theme } = useTheme()
  const [attempt, setAttempt] = useState(null)
  const [serverTime, setServerTime] = useState(null)
  const [answers, setAnswers] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [languageKey, setLanguageKey] = useState('python')
  const [selectedIndex, setSelectedIndex] = useState(null)
  /** Bootstrap only — editor is uncontrolled; do not update on every keystroke. */
  const [editorMountKey, setEditorMountKey] = useState('')
  const [editorInitialCode, setEditorInitialCode] = useState('')
  const [timeExpired, setTimeExpired] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dsaSaving, setDsaSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const saveTimerRef = useRef(null)
  /** Latest answer draft — updated synchronously so debounced save never reads stale React state. */
  const draftRef = useRef({
    questionKey: '',
    sectionType: null,
    code: '',
    selectedIndex: null,
    languageKey: 'python',
  })
  const examFinalized = Boolean(attempt?.examFinalized)
  const readOnly = examFinalized || false

  const handleTimeExpiredChange = useCallback((expired) => {
    setTimeExpired(expired)
  }, [])

  const flatQuestions = useMemo(() => {
    const items = []
    for (const section of attempt?.sections ?? []) {
      for (const question of section.questions ?? []) {
        items.push({ section, question })
      }
    }
    return items
  }, [attempt])

  const active = flatQuestions[activeIndex] ?? null
  const isLastQuestion = activeIndex === flatQuestions.length - 1
  const isFirstQuestion = activeIndex === 0

  const answeredCount = useMemo(() => {
    let count = 0
    for (const row of answers) {
      if (row.hasAnswer) count += 1
    }
    return count
  }, [answers])

  const answerByKey = useMemo(() => {
    const map = new Map()
    for (const row of answers) {
      map.set(row.questionKey, row)
    }
    return map
  }, [answers])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getContestAttempt(id, token), getMyContestSubmissions(id, token)])
      .then(([attemptPayload, submissionPayload]) => {
        if (cancelled) return
        setAttempt(attemptPayload?.data ?? null)
        setServerTime(attemptPayload?.serverTime ?? null)
        setAnswers(submissionPayload?.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setFeedback(
            err?.response?.data?.message ?? 'Could not open contest room',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, token])

  useEffect(() => {
    if (!active || loading) return
    const qKey = active.question.questionKey
    const prior = answerByKey.get(qKey)
    const sectionType = active.section.type

    if (sectionType === 'DSA') {
      const starters = starterCodeByLanguage(
        active.question.snapshot?.starter_code,
      )
      const lang = prior?.languageId
        ? judgeKeyFromLanguageId(prior.languageId)
        : 'python'
      const nextCode = prior?.code ?? starters[lang] ?? starters.python ?? ''
      setLanguageKey(lang)
      setEditorMountKey(`${qKey}:${lang}`)
      setEditorInitialCode(nextCode)
      draftRef.current = {
        questionKey: qKey,
        sectionType,
        code: nextCode,
        selectedIndex: null,
        languageKey: lang,
      }
      setRunResult(null)
    } else {
      const nextIndex =
        prior?.selectedIndex != null ? prior.selectedIndex : null
      setSelectedIndex(nextIndex)
      draftRef.current = {
        questionKey: qKey,
        sectionType,
        code: '',
        selectedIndex: nextIndex,
        languageKey: 'python',
      }
      setRunResult(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate on question change / initial load only
  }, [activeIndex, active?.question?.questionKey, loading])

  async function handleRunCode() {
    if (readOnly || !active || active.section.type !== 'DSA') return
    const questionKey = draftRef.current.questionKey
    const codeToRun = draftRef.current.code
    const languageId = languageIdFromKey(draftRef.current.languageKey)
    if (!codeToRun?.trim()) {
      setRunResult('Write some code before running.')
      return
    }
    setRunning(true)
    setRunResult(null)
    try {
      const payload = await runContestDsaCode(id, token, {
        questionKey,
        code: codeToRun,
        languageId,
      })
      setRunResult(payload?.data ?? null)
    } catch (err) {
      setRunResult(
        err?.response?.data?.message ?? 'Run failed. Try again in a moment.',
      )
    } finally {
      setRunning(false)
    }
  }

  const buildPayloadFromDraft = useCallback((options = {}) => {
    const { questionKey, sectionType, code, selectedIndex, languageKey } =
      draftRef.current
    if (!questionKey || !sectionType) return null
    if (sectionType === 'DSA') {
      if (!options.forDsaSubmit) return null
      if (!code?.trim()) return null
      return {
        questionKey,
        code,
        languageId: languageIdFromKey(languageKey),
        submitDsaAnswer: true,
      }
    }
    if (selectedIndex == null) return null
    return { questionKey, selectedIndex }
  }, [])

  const mergeSavedAnswerRow = useCallback(
    (payload) => {
      const sectionType = draftRef.current.sectionType
      const submittedAt = new Date().toISOString()
      setAnswers((prev) => {
        const idx = prev.findIndex(
          (row) => row.questionKey === payload.questionKey,
        )
        const row = {
          questionKey: payload.questionKey,
          sectionKey:
            idx >= 0 ? prev[idx].sectionKey : active?.section?.sectionKey,
          sectionType,
          selectedIndex:
            sectionType === 'DSA' ? undefined : payload.selectedIndex,
          code: sectionType === 'DSA' ? payload.code : undefined,
          languageId:
            sectionType === 'DSA' ? payload.languageId : undefined,
          lastSavedAt: submittedAt,
          dsaAnswerSubmittedAt:
            sectionType === 'DSA' ? submittedAt : undefined,
          hasAnswer:
            sectionType === 'DSA'
              ? true
              : payload.selectedIndex != null,
        }
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...prev[idx], ...row }
          return next
        }
        return [...prev, row]
      })
    },
    [active],
  )

  const persistMcqAnswer = useCallback(
    async (silent = true) => {
      if (readOnly || timeExpired) return
      if (draftRef.current.sectionType === 'DSA') return
      const payload = buildPayloadFromDraft()
      if (!payload) return
      if (!silent) setSaving(true)
      try {
        await saveContestAnswer(id, token, payload)
        mergeSavedAnswerRow(payload)
        if (!silent) setFeedback('Answer saved')
      } catch (err) {
        setFeedback(err?.response?.data?.message ?? 'Could not save answer')
      } finally {
        if (!silent) setSaving(false)
      }
    },
    [
      readOnly,
      timeExpired,
      buildPayloadFromDraft,
      id,
      token,
      mergeSavedAnswerRow,
    ],
  )

  const persistDsaAnswer = useCallback(async () => {
    if (readOnly || timeExpired) return
    const payload = buildPayloadFromDraft({ forDsaSubmit: true })
    if (!payload) {
      setFeedback('Write your solution before saving.')
      return
    }
    setDsaSaving(true)
    setFeedback('')
    try {
      await saveContestAnswer(id, token, payload)
      mergeSavedAnswerRow(payload)
      setFeedback('DSA answer saved and submitted for grading.')
    } catch (err) {
      setFeedback(err?.response?.data?.message ?? 'Could not save DSA answer')
    } finally {
      setDsaSaving(false)
    }
  }, [
    readOnly,
    timeExpired,
    buildPayloadFromDraft,
    id,
    token,
    mergeSavedAnswerRow,
  ])

  const scheduleMcqAutosave = useCallback(() => {
    if (readOnly || examFinalized) return
    if (draftRef.current.sectionType === 'DSA') return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      persistMcqAnswer(true)
    }, 1500)
  }, [readOnly, examFinalized, persistMcqAnswer])

  const handleEditorDraftChange = useCallback((nextCode) => {
    draftRef.current.code = nextCode
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const goToIndex = useCallback(
    async (nextIndex) => {
      if (nextIndex === activeIndex) return
      if (!readOnly && draftRef.current.sectionType !== 'DSA') {
        await persistMcqAnswer(true)
      }
      setFeedback('')
      setActiveIndex(nextIndex)
    },
    [activeIndex, readOnly, persistMcqAnswer],
  )

  async function handleNext() {
    if (isLastQuestion) return
    await goToIndex(activeIndex + 1)
  }

  async function handleBack() {
    if (isFirstQuestion) return
    await goToIndex(activeIndex - 1)
  }

  async function handleFinalizeExam() {
    if (!active) return
    setFinalizing(true)
    setFeedback('')
    try {
      const mcqPayload = buildPayloadFromDraft()
      const dsaPayload = buildPayloadFromDraft({ forDsaSubmit: true })
      const finalizeBody =
        draftRef.current.sectionType === 'DSA' && dsaPayload
          ? dsaPayload
          : mcqPayload ?? {}
      await finalizeContestExam(id, token, finalizeBody)
      const attemptPayload = await getContestAttempt(id, token)
      setAttempt(attemptPayload?.data ?? null)
      setFeedback(
        'Exam submitted. Results will be available after the contest ends.',
      )
    } catch (err) {
      setFeedback(err?.response?.data?.message ?? 'Could not submit exam')
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return <p className="text-ink/50 text-sm">Loading contest room…</p>
  }

  if (!attempt) {
    return (
      <div>
        <p className="text-sm text-rose-600">{feedback || 'Room unavailable'}</p>
        <Link to={`/contests/${id}`} className="mt-4 inline-block text-sm underline">
          Back to contest
        </Link>
      </div>
    )
  }

  if (attempt.status !== 'live' && !examFinalized) {
    return (
      <div>
        <p className="text-sm">This contest is not live right now.</p>
        <Link to={`/contests/${id}`} className="mt-4 inline-block text-sm underline">
          Back to contest
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <ContestQuestionNav
        flatQuestions={flatQuestions}
        answerByKey={answerByKey}
        activeIndex={activeIndex}
        answeredCount={answeredCount}
        onSelect={goToIndex}
      />

      <section className="border-ink/10 bg-white/90 dark:border-white/10 dark:bg-zinc-950/90 rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{attempt.title}</h1>
            <ContestRoomCountdown
              endTime={attempt.endTime}
              serverTime={serverTime}
              examFinalized={examFinalized}
              onTimeExpiredChange={handleTimeExpiredChange}
            />
            {examFinalized ? (
              <p className="text-ink/60 mt-1 text-xs">
                Submitted — you can review answers until the contest ends. Scores
                are hidden until then.
              </p>
            ) : (
              <p className="text-ink/45 mt-1 text-xs">
                MCQ choices autosave. DSA requires Save answer per question.
                Submit the exam on the last question.
              </p>
            )}
          </div>
          <Link to={`/contests/${id}`} className="text-sm underline">
            Exit
          </Link>
        </div>

        {active ? (
          <div className="mt-6">
            <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
              Question {activeIndex + 1} of {flatQuestions.length} ·{' '}
              {active.section.name} · {active.section.type}
            </p>
            <h2 className="mt-2 text-lg font-medium">
              {active.question.snapshot?.title ??
                active.question.snapshot?.questionText ??
                'Question'}
            </h2>
            <p className="text-ink/70 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
              {active.question.snapshot?.description ??
                active.question.snapshot?.questionText}
            </p>

            {active.section.type === 'DSA' &&
            (active.question.snapshot?.examples ?? []).length > 0 ? (
              <section className="mt-4">
                <p className="text-sm font-medium">Examples</p>
                {(active.question.snapshot.examples ?? []).map((example, index) => (
                  <ContestDsaExample
                    key={index}
                    example={example}
                    index={index}
                  />
                ))}
              </section>
            ) : null}

            {active.section.type === 'DSA' ? (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select
                  value={languageKey}
                  disabled={readOnly}
                  onChange={(e) => {
                    const next = e.target.value
                    const starters = starterCodeByLanguage(
                      active.question.snapshot?.starter_code,
                    )
                    const nextCode = starters[next] ?? ''
                    setLanguageKey(next)
                    setEditorInitialCode(nextCode)
                    setEditorMountKey(`${active.question.questionKey}:${next}`)
                    draftRef.current.languageKey = next
                    draftRef.current.code = nextCode
                  }}
                  className="border-ink/15 rounded-full border px-3 py-1 text-sm disabled:opacity-60"
                >
                  {CONTEST_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
                  {!readOnly ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRunCode}
                        disabled={running || timeExpired}
                        className="border-ink/15 rounded-full border px-4 py-1 text-sm disabled:opacity-50"
                      >
                        {running ? 'Running…' : 'Run examples'}
                      </button>
                      <button
                        type="button"
                        onClick={persistDsaAnswer}
                        disabled={dsaSaving || timeExpired}
                        className="bg-ink text-cream rounded-full px-4 py-1 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
                      >
                        {dsaSaving ? 'Saving…' : 'Save answer'}
                      </button>
                    </>
                  ) : null}
                </div>
                <div className="border-ink/15 overflow-hidden rounded-xl border">
                  <ContestDsaEditor
                    mountKey={editorMountKey}
                    initialCode={editorInitialCode}
                    languageKey={languageKey}
                    theme={theme}
                    readOnly={readOnly}
                    onDraftChange={handleEditorDraftChange}
                  />
                </div>
                <div className="mt-3 min-h-[140px]">
                  <OutputPanel result={runResult} />
                </div>
                <p className="text-ink/40 mt-2 text-xs">
                  Run uses sample cases only. Save answer to submit your code for
                  grading — unsaved work scores zero.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {(active.question.snapshot?.options ?? []).map((option, index) => (
                  <label
                    key={index}
                    className="border-ink/10 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                  >
                    <input
                      type="radio"
                      name={`mcq-${active.question.questionKey}`}
                      disabled={readOnly}
                      checked={selectedIndex === index}
                      onChange={() => {
                        setSelectedIndex(index)
                        draftRef.current.selectedIndex = index
                        scheduleMcqAutosave()
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {!isFirstQuestion ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={finalizing}
                  className="border-ink/15 rounded-full border px-5 py-2 text-sm"
                >
                  Back
                </button>
              ) : null}
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving || finalizing || readOnly}
                  className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
                >
                  Next
                </button>
              ) : (
                !readOnly ? (
                  <button
                    type="button"
                    onClick={handleFinalizeExam}
                    disabled={finalizing || timeExpired}
                    className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
                  >
                    {finalizing ? 'Submitting…' : 'Submit exam'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/contests/${id}`)}
                    className="border-ink/15 rounded-full border px-5 py-2 text-sm"
                  >
                    Back to contest
                  </button>
                )
              )}
            </div>
            {saving && active?.section?.type !== 'DSA' ? (
              <p className="text-ink/40 mt-2 text-xs">Saving…</p>
            ) : null}
          </div>
        ) : null}

        {feedback ? <p className="text-ink/60 mt-4 text-sm">{feedback}</p> : null}
      </section>
    </div>
  )
}
