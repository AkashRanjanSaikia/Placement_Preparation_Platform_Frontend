import { useState } from 'react'

const emptyMcq = () => ({
  id: crypto.randomUUID(),
  questionText: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  difficulty: 'medium',
})

export default function CustomMcqForm({ items, onChange }) {
  const [draft, setDraft] = useState(emptyMcq)

  function addMcq() {
    const text = draft.questionText.trim()
    const options = draft.options.map((o) => o.trim()).filter(Boolean)
    if (!text || options.length < 2) return
    if (draft.correctIndex < 0 || draft.correctIndex >= options.length) return

    onChange([
      ...items,
      {
        id: draft.id,
        questionText: text,
        options,
        correctIndex: draft.correctIndex,
        difficulty: draft.difficulty,
      },
    ])
    setDraft(emptyMcq())
  }

  function removeMcq(id) {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="border-ink/10 mt-4 rounded-xl border p-4">
      <p className="text-ink/50 font-mono text-[10px] tracking-widest uppercase">
        Add custom MCQ (contest-only)
      </p>
      <textarea
        value={draft.questionText}
        onChange={(e) => setDraft({ ...draft, questionText: e.target.value })}
        placeholder="Question text"
        rows={2}
        className="border-ink/15 mt-2 w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="mt-2 space-y-2">
        {draft.options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-mcq"
              checked={draft.correctIndex === index}
              onChange={() => setDraft({ ...draft, correctIndex: index })}
            />
            <input
              value={opt}
              onChange={(e) => {
                const next = [...draft.options]
                next[index] = e.target.value
                setDraft({ ...draft, options: next })
              }}
              placeholder={`Option ${index + 1}`}
              className="border-ink/15 flex-1 rounded-lg border px-3 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addMcq}
        className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 text-xs"
      >
        Add question to section
      </button>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-ink/10 pt-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-2 text-xs text-ink/70"
            >
              <span>{item.questionText}</span>
              <button
                type="button"
                onClick={() => removeMcq(item.id)}
                className="text-rose-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function customMcqToSnapshot(mcq, sectionType) {
  return {
    questionText: mcq.questionText,
    options: mcq.options,
    correctAnswers: [mcq.correctIndex],
    questionType: 'single',
    difficulty: mcq.difficulty,
    sectionType,
  }
}
