import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import axios from 'axios'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Moon,
  Play,
  RotateCcw,
  Send,
  Sun,
} from 'lucide-react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { useTheme } from '../../context/ThemeProvider.jsx'
import Outputpanel from './OutputPanel.jsx'

const backendUrl = import.meta.env.BACKEND_URL

const languages = [
  { id: 'java', label: 'Java', monaco: 'java', judge0Id: 62 },
  { id: 'python', label: 'Python', monaco: 'python', judge0Id: 71 },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', judge0Id: 63 },
  { id: 'cpp', label: 'C++', monaco: 'cpp', judge0Id: 54 },
]

const difficultyStyles = {
  Easy: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  Hard: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
}

function starterCodeByLanguage(starterCode = []) {
  return starterCode.reduce((acc, { language, code }) => {
    if (language) acc[language] = code ?? ''
    return acc
  }, {})
}

function ExampleBlock({ example, index }) {
  const { input, output, explanation } = example

  return (
    <div className="border-ink/10 bg-ink/4 dark:border-white/10 dark:bg-white/5 mt-2 rounded-xl border p-3">
      <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
        Example {index + 1}
      </p>
      {input ? (
        <p className="mt-2 font-mono text-xs whitespace-pre-wrap">
          <span className="text-ink/50">Input: </span>
          {typeof input === 'string' ? input : JSON.stringify(input)}
        </p>
      ) : null}
      {output ? (
        <p className="mt-1 font-mono text-xs whitespace-pre-wrap">
          <span className="text-ink/50">Output: </span>
          {typeof output === 'string' ? output : JSON.stringify(output)}
        </p>
      ) : null}
      {explanation ? (
        <p className="text-ink/70 mt-2 text-xs leading-relaxed">{explanation}</p>
      ) : null}
    </div>
  )
}

function LanguageSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = options.find((item) => item.id === value)

  useEffect(() => {
    if (!open) return

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Programming language"
        onClick={() => setOpen((current) => !current)}
        className="border-ink/15 bg-cream/90 text-ink hover:border-ink/25 hover:bg-cream dark:border-white/12 dark:bg-zinc-900/80 dark:hover:border-white/20 dark:hover:bg-zinc-900 inline-flex min-w-35 items-center justify-between gap-2 rounded-full border py-1.5 pl-3.5 pr-2.5 text-sm font-medium shadow-sm transition-[border-color,background-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
      >
        <span>{selected?.label ?? 'Language'}</span>
        <ChevronDown
          size={16}
          className={`text-ink/55 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Programming language"
          className="border-ink/10 bg-white/95 dark:border-white/12 dark:bg-zinc-900/95 absolute top-[calc(100%+0.375rem)] left-0 z-50 min-w-full overflow-hidden rounded-xl border py-1 shadow-lg shadow-black/10 backdrop-blur-xl dark:shadow-black/40"
        >
          {options.map((item) => {
            const isSelected = item.id === value
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(item.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${isSelected
                      ? 'bg-gold/14 text-ink dark:bg-gold/18 dark:text-gold'
                      : 'text-ink/80 hover:bg-ink/5 dark:text-ink/85 dark:hover:bg-white/8'
                    }`}
                >
                  <span>{item.label}</span>
                  {isSelected ? (
                    <Check size={15} className="text-gold shrink-0" aria-hidden />
                  ) : (
                    <span className="w-3.75 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function ResizeHandle({ orientation = 'horizontal' }) {
  const isRow = orientation === 'vertical'

  return (
    <Separator
      aria-label={isRow ? 'Resize editor and output' : 'Resize problem and editor'}
      className={isRow ? 'panel-separator panel-separator-row' : 'panel-separator panel-separator-col'}
    >
      <span className="panel-separator-line" />
    </Separator>
  )
}

export default function ProblemSolve() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('java')
  const [codeByLanguage, setCodeByLanguage] = useState({})
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const editorShellRef = useRef(null)
  const resizingRef = useRef(false)

  const beginResize = () => {
    if (resizingRef.current) return
    resizingRef.current = true
    editorShellRef.current?.classList.add('is-resizing')
  }

  const endResize = () => {
    resizingRef.current = false
    editorShellRef.current?.classList.remove('is-resizing')
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setProblem(null)

      try {
        const res = await axios.get(`${backendUrl}/problem/${slug}`)
        if (cancelled) return

        const next = res.data?.data
        if (!next) {
          setError('This problem could not be found.')
          return
        }

        setProblem(next)
        setLanguage('java')
        setCodeByLanguage(starterCodeByLanguage(next.starter_code))
      } catch {
        if (!cancelled) setError('This problem could not be found.')
      }
    }

    load().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [slug])

  const monacoLanguage = languages.find((item) => item.id === language)?.monaco

  const code = codeByLanguage[language] ?? problem?.starter_code?.find((item) => item.language === language)?.code ?? ''

  const resetCode = () => {
    const fromProblem =
      problem?.starter_code?.find((item) => item.language === language)?.code ??
      ''
    setCodeByLanguage((current) => ({
      ...current,
      [language]: fromProblem,
    }))
    setOutput('')
  }

  const runCode = async () => {
    const problemSlug = problem?.slug ?? slug
    const languageId = languages.find((item) => item.id === language)?.judge0Id

    if (!problemSlug) {
      setOutput('Load a problem before running.')
      return
    }
    if (!languageId) {
      setOutput('Unsupported language for run.')
      return
    }

    setRunning(true)
    setOutput('Running…')

    try {
      const res = await axios.post(`${backendUrl}/submission/run`, {
        slug: problemSlug,
        code,
        languageId,
      })
      setOutput(res.data)
    } catch (err) {
      const message =
        err.response?.data?.error ??
        err.message ??
        'Run failed. Please try again.'
      setOutput(message)
    } finally {
      setRunning(false)
    }
  }

  const submitCode = async () => {
    const problemSlug = problem?.slug ?? slug
    const languageId = languages.find((item) => item.id === language)?.judge0Id

    if (!problemSlug) {
      setOutput('Load a problem before submitting.')
      return
    }
    if (!languageId) {
      setOutput('Unsupported language for submission.')
      return
    }

    setSubmitting(true)
    setOutput('Submitting…')

    try {
      const res = await axios.post(`${backendUrl}/submission/submit`, {
        slug: problemSlug,
        code,
        languageId,
      })
      setOutput(res.data)
    } catch (err) {
      const message =
        err.response?.data?.error ??
        err.message ??
        'Submission failed. Please try again.'
      setOutput(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-screen min-h-0 flex-col overflow-hidden">
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

      <header className="border-ink/10 bg-cream/70 dark:border-white/10 dark:bg-black/55 relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 py-2.5 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dsa-practice')}
            className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Problems</span>
          </button>

          <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
            &gt;_ Prepify
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={runCode}
            disabled={running || submitting || loading || !problem}
            className="border-ink/15 text-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
          >
            <Play size={14} />
            Run
          </button>
          <button
            type="button"
            onClick={submitCode}
            disabled={submitting || loading || !problem}
            className="bg-ink text-cream hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gold dark:text-black dark:hover:bg-gold/90 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
          >
            <Send size={14} />
            Submit
          </button>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
            className="border-ink/15 text-ink/70 hover:border-ink/30 hover:text-ink flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="relative z-10 min-h-0 flex-1">
        <Group
          orientation="horizontal"
          className="h-full"
          resizeTargetMinimumSize={{ fine: 14, coarse: 28 }}
          onLayoutChange={beginResize}
          onLayoutChanged={endResize}
        >
          {/* Problem Panel (left panel)*/}
          <Panel defaultSize="32" minSize="22" maxSize="65" className="min-h-0">
            <section className="h-full min-h-0 overflow-y-auto px-3 py-3">
              <div className="h-full">
                {loading ? (
                  <p className="text-ink/55 px-2 py-2 text-sm">Loading problem…</p>
                ) : error ? (
                  <div className="border-ink/10 bg-white/80 dark:border-white/12 dark:bg-zinc-800/90 max-w-lg rounded-2xl border p-6 shadow-sm">
                    <p className="font-medium">{error}</p>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="bg-ink text-cream mt-4 rounded-full px-4 py-2 text-sm"
                    >
                      Back to DSA
                    </button>
                  </div>
                ) : problem ? (
                  <article className="border-ink/10 bg-white/80 dark:border-white/12 dark:bg-zinc-800/90 min-h-full rounded-2xl border p-5 shadow-sm">
                    <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
                      {'// Problem'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {problem.title}
                      </h1>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyStyles[problem.difficulty] || difficultyStyles.Medium}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    {problem.description ? (
                      <p className="text-ink/75 mt-5 text-sm leading-relaxed whitespace-pre-wrap">
                        {problem.description}
                      </p>
                    ) : null}

                    {problem.examples?.length ? (
                      <section className="mt-6">
                        <h2 className="text-sm font-semibold">Examples</h2>
                        {problem.examples.map((example, index) => (
                          <ExampleBlock
                            key={index}
                            example={example}
                            index={index}
                          />
                        ))}
                      </section>
                    ) : null}

                    {problem.constraints?.length ? (
                      <section className="mt-6">
                        <h2 className="text-sm font-semibold">Constraints</h2>
                        <ul className="text-ink/70 mt-2 list-disc space-y-1 pl-5 text-sm">
                          {problem.constraints.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </article>
                ) : null}
              </div>
            </section>
          </Panel>

          <ResizeHandle orientation="horizontal" />

          {/* Editor Panel (right panel)*/}
          <Panel minSize="35" className="min-h-0 min-w-0">
            <section className="flex h-full min-h-0 min-w-0 flex-col px-3 py-3">
              <Group
                orientation="vertical"
                className="min-h-0 flex-1"
                resizeTargetMinimumSize={{ fine: 12, coarse: 24 }}
                onLayoutChange={beginResize}
                onLayoutChanged={endResize}
              >
                <Panel defaultSize="72" minSize="30" className="min-h-0">
                  <div className="border-ink/10 bg-white/80 dark:border-white/12 dark:bg-zinc-800/90 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-sm">
                    <div className="border-ink/10 dark:border-white/10 flex flex-wrap items-center gap-2 border-b px-3 py-2">
                      <LanguageSelect
                        value={language}
                        onChange={setLanguage}
                        options={languages}
                      />

                      <button
                        type="button"
                        onClick={resetCode}
                        className="text-ink/70 hover:bg-ink/5 hover:text-ink ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    </div>

                    <div
                      ref={editorShellRef}
                      className="editor-shell min-h-0 flex-1 overflow-hidden"
                    >
                      <Editor
                        height="100%"
                        language={monacoLanguage}
                        theme={isDark ? 'vs-dark' : 'vs'}
                        value={code}
                        onChange={(value) =>
                          setCodeByLanguage((current) => ({
                            ...current,
                            [language]: value ?? '',
                          }))
                        }
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          overviewRulerLanes: 0,
                          overviewRulerBorder: false,
                          scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                            alwaysConsumeMouseWheel: false,
                          },
                          padding: { top: 12, bottom: 12 },
                          tabSize: 2,
                        }}
                      />
                    </div>
                  </div>
                </Panel>

                <ResizeHandle orientation="vertical" />

                <Panel defaultSize="28" minSize="12" className="min-h-0">
                  <Outputpanel result={output} />
                </Panel>
              </Group>
            </section>
          </Panel>
        </Group>
      </div>

    </div>
  )
}
