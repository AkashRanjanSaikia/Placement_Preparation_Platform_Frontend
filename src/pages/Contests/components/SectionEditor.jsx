import { CONTEST_SECTION_TYPES } from '../contestConstants.js'
import LibraryQuestionPicker from './LibraryQuestionPicker.jsx'
import CustomMcqForm from './CustomMcqForm.jsx'

export function createEmptySection() {
  return {
    sectionKey: crypto.randomUUID(),
    type: 'DSA',
    name: 'DSA section',
    marksPerQuestion: 10,
    libraryItems: [],
    customMcqs: [],
  }
}

export default function SectionEditor({
  sections,
  onChange,
  hostMode = false,
  token,
}) {
  function updateSection(index, patch) {
    const next = sections.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onChange(next)
  }

  function removeSection(index) {
    onChange(sections.filter((_, i) => i !== index))
  }

  function addSection() {
    onChange([...sections, createEmptySection()])
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div
          key={section.sectionKey}
          className="border-ink/10 rounded-2xl border p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
              Section {index + 1}
            </p>
            {sections.length > 1 ? (
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="text-xs text-rose-600"
              >
                Remove section
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              value={section.name}
              onChange={(e) => updateSection(index, { name: e.target.value })}
              placeholder="Section name"
              className="border-ink/15 rounded-xl border px-3 py-2 text-sm"
            />
            <select
              value={section.type}
              onChange={(e) =>
                updateSection(index, {
                  type: e.target.value,
                  libraryItems: [],
                  customMcqs: [],
                })
              }
              className="border-ink/15 rounded-xl border px-3 py-2 text-sm"
            >
              {CONTEST_SECTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={section.marksPerQuestion}
              onChange={(e) =>
                updateSection(index, {
                  marksPerQuestion: Number(e.target.value) || 0,
                })
              }
              placeholder="Marks / question"
              className="border-ink/15 rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <p className="text-ink/50 mb-2 text-xs font-medium">
              From question library
            </p>
            <LibraryQuestionPicker
              sectionType={section.type}
              selectedItems={section.libraryItems}
              onChangeSelected={(items) =>
                updateSection(index, { libraryItems: items })
              }
              hostMode={hostMode}
              token={token}
            />
          </div>

          {section.type !== 'DSA' ? (
            <CustomMcqForm
              items={section.customMcqs}
              onChange={(items) => updateSection(index, { customMcqs: items })}
            />
          ) : (
            <p className="text-ink/45 mt-3 text-xs">
              DSA custom problems need harness templates — pick from the library for now.
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="border-ink/15 w-full rounded-xl border border-dashed py-3 text-sm hover:bg-ink/5"
      >
        + Add section
      </button>
    </div>
  )
}

export function buildSectionsApiPayload(sections) {
  return sections.map((section) => {
    const libraryQuestions = section.libraryItems.map((item) => ({
      source: 'library',
      libraryRef: { model: item.model, id: item.id },
    }))
    const customQuestions = (section.customMcqs ?? []).map((mcq) => ({
      source: 'custom',
      snapshot: {
        questionText: mcq.questionText,
        options: mcq.options,
        correctAnswers: [mcq.correctIndex],
        questionType: 'single',
        difficulty: mcq.difficulty,
      },
    }))

    return {
      sectionKey: section.sectionKey,
      type: section.type,
      name: section.name.trim() || `${section.type} section`,
      marksPerQuestion: section.marksPerQuestion,
      questions: [...libraryQuestions, ...customQuestions],
    }
  })
}

export function countSectionQuestions(section) {
  return (
    (section.libraryItems?.length ?? 0) + (section.customMcqs?.length ?? 0)
  )
}
