import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

function summaryLabel(result) {
  if (result.allPassed) return 'Accepted'

  const failedStatuses = [
    ...new Set(
      (result.verdicts || [])
        .filter((verdict) => !verdict.passed)
        .map((verdict) => verdict.status)
        .filter(Boolean),
    ),
  ]

  if (failedStatuses.length === 1) return failedStatuses[0]
  return 'Wrong Answer'
}

function Summary({ result, showPassCount = false }) {
  const label = summaryLabel(result)
  const runtime =
    result.maxRuntimeMs != null ? `${result.maxRuntimeMs} ms` : null

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p
        className={
          result.allPassed
            ? 'text-sm font-semibold text-emerald-600 dark:text-emerald-400'
            : 'text-sm font-semibold text-rose-600 dark:text-rose-400'
        }
      >
        {label}
      </p>
      {runtime ? (
        <p className="text-ink/50 font-mono text-xs">Runtime: {runtime}</p>
      ) : null}
      {showPassCount || !result.allPassed ? (
        <p className="text-ink/50 font-mono text-xs">
          {result.passedCount}/{result.totalTestCases} test cases passed
        </p>
      ) : null}
    </div>
  )
}

function MetaRow({ label, value }) {
  if (value == null || value === '') return null

  return (
    <p className="text-ink/60 font-mono text-xs">
      <span className="text-ink/40">{label}: </span>
      {value}
    </p>
  )
}

function SubmitSummary({ result }) {
  const label = result.allPassed ? 'Accepted' : 'Rejected'
  const statusDetail =
    !result.allPassed && result.failureStatus
      ? result.failureStatus
      : null

  return (
    <div
      className={
        result.allPassed
          ? 'mt-2 space-y-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3'
          : 'mt-2 space-y-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-3'
      }
    >
      <p
        className={
          result.allPassed
            ? 'text-base font-semibold text-emerald-700 dark:text-emerald-300'
            : 'text-base font-semibold text-rose-700 dark:text-rose-300'
        }
      >
        {label}
      </p>
      <p className="text-ink/70 font-mono text-sm">
        {result.passedCount}/{result.totalTestCases} test cases passed
      </p>
      <MetaRow
        label="Language"
        value={result.language}
      />
      <MetaRow
        label="Max runtime"
        value={
          result.maxRuntimeMs != null ? `${result.maxRuntimeMs} ms` : null
        }
      />
      <MetaRow
        label="Avg runtime"
        value={
          result.avgRuntimeMs != null ? `${result.avgRuntimeMs} ms` : null
        }
      />
      {statusDetail ? (
        <MetaRow label="Status" value={statusDetail} />
      ) : null}
      {result.compileError ? (
        <DetailBlock label="Compile error" value={result.compileError} highlight />
      ) : null}
      {result.runtimeError ? (
        <DetailBlock label="Runtime error" value={result.runtimeError} highlight />
      ) : null}
      {!result.allPassed && !result.compileError && !result.runtimeError ? (
        <p className="text-ink/45 font-mono text-xs">
          Failed on one or more test cases. Inputs and expected outputs are not
          shown for submit.
        </p>
      ) : null}
    </div>
  )
}

function CaseTab({ index, verdict, selected, onSelect }) {
  const Icon = verdict.passed ? Check : X
  const iconClass = verdict.passed
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? 'border-zinc-300/80 bg-zinc-200/70 dark:border-white/15 dark:bg-white/10 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium'
          : 'text-ink/55 hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors'
      }
    >
      <Icon size={14} className={iconClass} strokeWidth={2.5} />
      Case {index + 1}
    </button>
  )
}

function DetailBlock({ label, value, highlight }) {
  if (value == null || value === '') return null

  return (
    <div className="min-w-0">
      <p className="text-ink/45 mb-1 text-xs font-medium">{label}</p>
      <div
        className={
          highlight
            ? 'border-rose-500/30 bg-rose-500/8 dark:border-rose-400/25 dark:bg-rose-500/10 rounded-lg border px-3 py-2'
            : 'rounded-lg border border-zinc-200/80 bg-zinc-100 px-3 py-2 dark:border-white/10 dark:bg-zinc-800/80'
        }
      >
        <pre className="text-ink/85 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {value}
        </pre>
      </div>
    </div>
  )
}

function CaseDetail({ verdict }) {
  const outputMismatch =
    !verdict.passed &&
    verdict.stdout != null &&
    verdict.expected != null &&
    verdict.stdout !== verdict.expected

  return (
    <div className="mt-3 space-y-3">
      <DetailBlock label="Input" value={verdict.stdin} />
      <DetailBlock
        label="Output"
        value={verdict.stdout}
        highlight={outputMismatch}
      />
      <DetailBlock label="Expected" value={verdict.expected} />
      {verdict.stderr ? (
        <DetailBlock label="Error" value={verdict.stderr} highlight />
      ) : null}
      {verdict.compile_output ? (
        <DetailBlock label="Compile" value={verdict.compile_output} highlight />
      ) : null}
      {verdict.hidden ? (
        <p className="text-ink/45 font-mono text-xs">
          Input and expected output are hidden for this case.
        </p>
      ) : null}
    </div>
  )
}

function ResultPanel({ result }) {
  const verdicts = result.verdicts ?? []
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const firstFail = verdicts.findIndex((v) => !v.passed)
    setSelectedIndex(firstFail >= 0 ? firstFail : 0)
  }, [result])

  if (!verdicts.length) {
    return (
      <p className="text-ink/45 mt-2 font-mono text-xs">No test case results.</p>
    )
  }

  const safeIndex = Math.min(selectedIndex, verdicts.length - 1)
  const active = verdicts[safeIndex]

  return (
    <div className="mt-2 min-h-0 flex-1 overflow-auto">
      <Summary result={result} />
      <div className="mt-3 flex flex-wrap gap-1">
        {verdicts.map((verdict, index) => (
          <CaseTab
            key={verdict.testCase}
            index={index}
            verdict={verdict}
            selected={index === safeIndex}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </div>
      {active ? <CaseDetail verdict={active} /> : null}
    </div>
  )
}

export default function OutputPanel({ result }) {
  const isResult = result && typeof result === 'object'
  const isSubmit = isResult && result.mode === 'submit'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 px-4 py-3 shadow-sm dark:border-white/12 dark:bg-zinc-900">
      <p className="text-ink/45 font-mono text-[11px] tracking-widest uppercase">
        Output
      </p>

      {!result ? (
        <p className="text-ink/45 mt-2 font-mono text-xs">
          Run or submit to see output here.
        </p>
      ) : isResult ? (
        isSubmit ? (
          <SubmitSummary result={result} />
        ) : (
          <ResultPanel result={result} />
        )
      ) : (
        <pre className="text-ink/75 mt-2 min-h-0 flex-1 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  )
}
