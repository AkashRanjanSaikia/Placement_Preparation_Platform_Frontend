import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  getContestAttempt,
  getMyContestSubmissions,
  submitContestAnswer,
} from './api/contestApi.js'
import { useAuth } from '../../context/AuthProvider.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import {
  CONTEST_LANGUAGES,
  draftStorageKey,
} from './contestConstants.js'
import { useServerCountdown } from './hooks/useServerCountdown.js'

function starterCodeByLanguage(starterCode = []) {
  return starterCode.reduce((acc, { language, code }) => {
    if (language) acc[language] = code ?? ''
    return acc
  }, {})
}

export default function ContestRoom() {
  const { id } = useParams()
  const { token } = useAuth()
  const { theme } = useTheme()
  const [attempt, setAttempt] = useState(null)
  const [serverTime, setServerTime] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [activeQuestionKey, setActiveQuestionKey] = useState(null)
  const [languageId, setLanguageId] = useState('python')
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const countdown = useServerCountdown(attempt?.endTime, serverTime)

  const flatQuestions = useMemo(() => {
    const items = []
    for (const section of attempt?.sections ?? []) {
      for (const question of section.questions ?? []) {
        items.push({ section, question })
      }
    }
    return items
  }, [attempt])

  const active = flatQuestions.find(
    (item) => item.question.questionKey === activeQuestionKey,
  )

  const submissionByKey = useMemo(() => {
    const map = new Map()
    for (const row of submissions) {
      map.set(row.questionKey, row)
    }
    return map
  }, [submissions])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getContestAttempt(id, token),
      getMyContestSubmissions(id, token),
    ])
      .then(([attemptPayload, submissionPayload]) => {
        if (cancelled) return
        setAttempt(attemptPayload?.data ?? null)
        setServerTime(attemptPayload?.serverTime ?? null)
        setSubmissions(submissionPayload?.data ?? [])
        const firstKey =
          attemptPayload?.data?.sections?.[0]?.questions?.[0]?.questionKey ??
          null
        setActiveQuestionKey(firstKey)
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
    if (!active || !id) return
    const qKey = active.question.questionKey
    const prior = submissionByKey.get(qKey)

    if (active.section.type === 'DSA') {
      const starters = starterCodeByLanguage(
        active.question.snapshot?.starter_code,
      )
      const stored = localStorage.getItem(draftStorageKey(id, qKey))
      const lang =
        Object.keys(starters).includes(languageId) ? languageId : 'python'
      setLanguageId(lang)
      setCode(
        prior?.code ??
          stored ??
          starters[lang] ??
          starters.python ??
          '',
      )
    } else {
      setSelectedIndex(
        prior?.selectedIndex != null ? prior.selectedIndex : null,
      )
    }
  }, [active, submissionByKey, id])

  const persistDraft = useCallback(
    (nextCode) => {
      if (!active || active.section.type !== 'DSA') return
      localStorage.setItem(
        draftStorageKey(id, active.question.questionKey),
        nextCode,
      )
    },
    [active, id],
  )

  const judge0Id =
    CONTEST_LANGUAGES.find((l) => l.id === languageId)?.judge0Id ?? 71
  const monacoLang =
    CONTEST_LANGUAGES.find((l) => l.id === languageId)?.monaco ?? 'python'

  async function handleSubmit() {
    if (!active) return
    if (active.section.type !== 'DSA' && selectedIndex == null) {
      setFeedback('Select an option before submitting')
      return
    }
    setSubmitting(true)
    setFeedback('')
    try {
      const body =
        active.section.type === 'DSA'
          ? {
              questionKey: active.question.questionKey,
              code,
              languageId: judge0Id,
            }
          : {
              questionKey: active.question.questionKey,
              selectedIndex,
            }

      const result = await submitContestAnswer(id, token, body)
      setFeedback(
        result?.data?.isCorrect
          ? `Correct (+${result.data.marksAwarded} marks)`
          : `Incorrect (${result?.data?.marksAwarded ?? 0} marks)`,
      )
      const submissionPayload = await getMyContestSubmissions(id, token)
      setSubmissions(submissionPayload?.data ?? [])
      if (active.section.type === 'DSA') {
        localStorage.removeItem(
          draftStorageKey(id, active.question.questionKey),
        )
      }
    } catch (err) {
      setFeedback(err?.response?.data?.message ?? 'Submit failed')
    } finally {
      setSubmitting(false)
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

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="border-ink/10 rounded-2xl border p-4">
        <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
          Questions
        </p>
        <ul className="mt-3 space-y-1">
          {flatQuestions.map(({ section, question }, index) => {
            const sub = submissionByKey.get(question.questionKey)
            let status = ''
            if (sub?.isCorrect) status = ' ✓'
            else if (sub) status = ' ·'
            return (
              <li key={question.questionKey}>
                <button
                  type="button"
                  onClick={() => setActiveQuestionKey(question.questionKey)}
                  className={
                    activeQuestionKey === question.questionKey
                      ? 'bg-ink/10 w-full rounded-lg px-3 py-2 text-left text-sm dark:bg-white/10'
                      : 'hover:bg-ink/5 w-full rounded-lg px-3 py-2 text-left text-sm'
                  }
                >
                  Q{index + 1} · {section.type}
                  {status}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 rounded-2xl border p-6 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{attempt.title}</h1>
            <p
              className={
                countdown.urgent
                  ? 'mt-1 font-mono text-xs text-rose-600'
                  : 'text-ink/50 mt-1 font-mono text-xs'
              }
            >
              Time left: {countdown.label}
            </p>
          </div>
          <Link to={`/contests/${id}`} className="text-sm underline">
            Exit
          </Link>
        </div>

        {active ? (
          <div className="mt-6">
            <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
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

            {active.section.type === 'DSA' ? (
              <div className="mt-4">
                <select
                  value={languageId}
                  onChange={(e) => {
                    const next = e.target.value
                    const starters = starterCodeByLanguage(
                      active.question.snapshot?.starter_code,
                    )
                    setLanguageId(next)
                    setCode(starters[next] ?? '')
                  }}
                  className="border-ink/15 mb-2 rounded-full border px-3 py-1 text-sm"
                >
                  {CONTEST_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
                <div className="border-ink/15 overflow-hidden rounded-xl border">
                  <Editor
                    height="320px"
                    language={monacoLang}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(value) => {
                      const next = value ?? ''
                      setCode(next)
                      persistDraft(next)
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
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
                      name="mcq"
                      checked={selectedIndex === index}
                      onChange={() => setSelectedIndex(index)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || countdown.ms <= 0}
              className="bg-ink text-cream mt-6 rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
            >
              {submitting ? 'Submitting…' : 'Submit answer'}
            </button>
          </div>
        ) : null}

        {feedback ? <p className="text-ink/60 mt-4 text-sm">{feedback}</p> : null}
      </section>
    </div>
  )
}
