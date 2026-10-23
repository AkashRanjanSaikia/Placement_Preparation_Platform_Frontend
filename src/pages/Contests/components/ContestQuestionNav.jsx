import { memo } from 'react'

function ContestQuestionNav({
  flatQuestions,
  answerByKey,
  activeIndex,
  answeredCount,
  onSelect,
}) {
  return (
    <aside className="border-ink/10 rounded-2xl border p-4">
      <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
        Questions
      </p>
      <p className="text-ink/45 mt-2 text-xs">
        {answeredCount}/{flatQuestions.length} answered
      </p>
      <ul className="mt-3 space-y-1">
        {flatQuestions.map(({ section, question }, index) => {
          const saved = answerByKey.get(question.questionKey)
          const answered = saved?.hasAnswer
          return (
            <li key={question.questionKey}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={
                  activeIndex === index
                    ? 'bg-ink/10 w-full rounded-lg px-3 py-2 text-left text-sm dark:bg-white/10'
                    : 'hover:bg-ink/5 w-full rounded-lg px-3 py-2 text-left text-sm'
                }
              >
                Q{index + 1} · {section.type}
                {answered ? ' ●' : ''}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default memo(ContestQuestionNav)
