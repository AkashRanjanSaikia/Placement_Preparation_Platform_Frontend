import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import csCoreData from './csCoreData.json'
import {
  ALL_TOPICS_ID,
  countForDifficultyFilter,
  deriveTopicDifficultyLabel,
  fetchCsCoreCatalog,
  getMixedPracticeCount,
  setHasQuestions,
} from './csCoreHelpers.js'

const difficulties = ['All', 'Easy', 'Medium', 'Hard']

const difficultyStyles = {
  Easy: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  Hard: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  Mixed: 'bg-sky-500/12 text-sky-800 dark:text-sky-200',
}

function questionMatchesDifficulty(questionDifficulty, difficultyFilter) {
  if (difficultyFilter === 'All') return true
  const key = String(questionDifficulty ?? 'medium').toLowerCase()
  const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
  return (labels[key] ?? 'Medium') === difficultyFilter
}

function topicHasMatchingQuestion(topicId, query, difficulty, questionsByTopic) {
  if (!query || !topicId) return false
  const list = questionsByTopic?.[topicId] ?? []
  return list.some((item) => {
    const text = item.questionText?.toLowerCase() ?? ''
    return text.includes(query) && questionMatchesDifficulty(item.difficulty, difficulty)
  })
}

function filterSets(
  sets,
  query,
  difficulty,
  topicCounts,
  topicDifficultyCounts,
  questionsByTopic,
) {
  const list = Array.isArray(sets) ? sets : []
  const normalizedQuery = query.trim().toLowerCase()

  return list.filter((set) => {
    const matchesDifficulty =
      difficulty === 'All' ||
      countForDifficultyFilter(
        set.id,
        difficulty,
        topicCounts,
        topicDifficultyCounts,
      ) > 0
    const matchesSearch =
      !normalizedQuery ||
      set.title?.toLowerCase().includes(normalizedQuery) ||
      topicHasMatchingQuestion(
        set.id,
        normalizedQuery,
        difficulty,
        questionsByTopic,
      )

    return matchesDifficulty && matchesSearch
  })
}

function practiceHref(topicId, difficulty) {
  const params = new URLSearchParams()
  if (difficulty && difficulty !== 'All') {
    params.set('difficulty', difficulty)
  }
  const query = params.toString()
  return query ? `/cs-core/${topicId}?${query}` : `/cs-core/${topicId}`
}

export default function CSCorePage() {
  const { search } = useOutletContext()
  const [difficulty, setDifficulty] = useState('All')
  const [openSectionIds, setOpenSectionIds] = useState(() => new Set())
  const [topicCounts, setTopicCounts] = useState({})
  const [topicDifficultyCounts, setTopicDifficultyCounts] = useState({})
  const [questionsByTopic, setQuestionsByTopic] = useState({})
  const [countsLoading, setCountsLoading] = useState(true)

  const toggleSection = (sectionId) => {
    setOpenSectionIds((current) => {
      const next = new Set(current)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      setCountsLoading(true)
      try {
        const data = await fetchCsCoreCatalog()
        if (cancelled) return
        setTopicCounts(
          data?.topicCounts && typeof data.topicCounts === 'object'
            ? data.topicCounts
            : {},
        )
        setTopicDifficultyCounts(
          data?.topicDifficultyCounts &&
            typeof data.topicDifficultyCounts === 'object'
            ? data.topicDifficultyCounts
            : {},
        )
        const byTopic = data?.questionsByTopic
        setQuestionsByTopic(
          byTopic && typeof byTopic === 'object' ? byTopic : {},
        )
      } catch {
        if (!cancelled) {
          setTopicCounts({})
          setTopicDifficultyCounts({})
          setQuestionsByTopic({})
        }
      } finally {
        if (!cancelled) setCountsLoading(false)
      }
    }

    loadCounts()
    return () => {
      cancelled = true
    }
  }, [])

  const sections = useMemo(() => {
    const query = (search ?? '').trim().toLowerCase()
    const rawSections = csCoreData.sections ?? []

    return rawSections
      .map((section) => {
        const sets = filterSets(
          section.sets,
          query,
          difficulty,
          topicCounts,
          topicDifficultyCounts,
          questionsByTopic,
        )
        if (query && sets.length === 0) return null
        return { ...section, sets }
      })
      .filter(Boolean)
  }, [search, difficulty, topicCounts, topicDifficultyCounts, questionsByTopic])

  useEffect(() => {
    const query = (search ?? '').trim()
    if (!query) return
    setOpenSectionIds((current) => {
      const next = new Set(current)
      for (const section of sections) {
        if (section.sets.length > 0) next.add(section.id)
      }
      return next
    })
  }, [search, sections])

  const totalSets = sections.reduce((sum, section) => sum + section.sets.length, 0)
  const mixedCount = getMixedPracticeCount(
    difficulty,
    topicCounts,
    topicDifficultyCounts,
  )
  const mixedCountLabel = countsLoading ? '…' : String(mixedCount)

  return (
    <div>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {'// Prepify'}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">CS Fundamentals</h1>
      <p className="text-ink/60 mt-2 max-w-xl text-sm">
        Placement-style MCQs on Operating Systems, DBMS, Computer Networks, and OOP.
        Question banks are loaded from your Prepify backend.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <div className="mt-6">
        {mixedCount > 0 || countsLoading ? (
          <Link
            to={practiceHref(ALL_TOPICS_ID, difficulty)}
            className="dashboard-panel hover:border-gold/45 inline-flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3 transition-colors"
          >
            <span className="font-medium">
              {csCoreData.mixedPractice?.title ?? 'All Topics'} — mixed practice
            </span>
            <span className="text-ink/60 font-mono text-xs">
              {mixedCountLabel} question{mixedCountLabel === '1' ? '' : 's'}
              {difficulty !== 'All' ? ` · ${difficulty}` : ''}
            </span>
          </Link>
        ) : (
          <p className="text-ink/55 text-sm">
            No questions match this difficulty for mixed practice.
          </p>
        )}
      </div>

      {totalSets === 0 ? (
        <p className="text-ink/55 mt-8 text-center text-sm">
          {(search ?? '').trim()
            ? 'No questions match your search.'
            : 'No topics match your filters.'}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {sections.map((section) => {
            const isOpen = openSectionIds.has(section.id)

            return (
            <section key={section.id} aria-labelledby={`cscore-${section.id}`}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                aria-controls={`cscore-sets-${section.id}`}
                className="group mb-4 flex w-full items-start justify-between gap-4 rounded-xl text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
              >
                <div className="min-w-0 flex-1">
                  <span
                    id={`cscore-${section.id}`}
                    role="heading"
                    aria-level={2}
                    className="group-hover:text-gold text-xl font-semibold tracking-tight transition-colors"
                  >
                    {section.title}
                  </span>
                  <p className="text-ink/60 mt-1 max-w-2xl text-sm">
                    {section.description}
                  </p>
                </div>
                <span
                  className="border-ink/15 text-ink/70 group-hover:border-ink/30 group-hover:bg-ink/5 dark:border-white/12 dark:group-hover:border-white/20 dark:group-hover:bg-white/5 inline-flex shrink-0 items-center justify-center rounded-full border p-2 transition-[border-color,background-color,transform]"
                  aria-hidden
                >
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>

              <div
                id={`cscore-sets-${section.id}`}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div
                  className={`min-h-0 overflow-hidden transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
              <div
                className="dashboard-panel overflow-hidden rounded-2xl"
              >
                <div className="text-ink/45 hidden grid-cols-[1fr_6rem_8rem] gap-3 border-b border-ink/10 px-5 py-3 font-mono text-[11px] tracking-widest uppercase md:grid dark:border-white/10">
                  <span>Topic</span>
                  <span>Questions</span>
                  <span>Difficulty</span>
                </div>

                <ul>
                  {section.sets.map((set) => {
                    const count = countForDifficultyFilter(
                      set.id,
                      difficulty,
                      topicCounts,
                      topicDifficultyCounts,
                    )
                    const hasQuestions = setHasQuestions(
                      set,
                      topicCounts,
                      difficulty,
                      topicDifficultyCounts,
                    )
                    const countLabel =
                      countsLoading ? '…' : String(count)
                    const difficultyLabel = deriveTopicDifficultyLabel(
                      set.id,
                      topicDifficultyCounts,
                      difficulty,
                    )

                    return (
                      <li
                        key={set.id}
                        className="border-ink/10 hover:bg-ink/3 dark:border-white/10 grid grid-cols-1 gap-2 border-b px-5 py-4 last:border-b-0 md:grid-cols-[1fr_6rem_8rem] md:items-center md:gap-3"
                      >
                        <div>
                          {hasQuestions ? (
                            <Link
                              to={practiceHref(set.id, difficulty)}
                              className="hover:text-gold font-medium"
                              tabIndex={isOpen ? undefined : -1}
                            >
                              {set.title}
                            </Link>
                          ) : (
                            <p className="font-medium">
                              {set.title}
                              <span className="text-ink/45 ml-2 text-xs font-normal">
                                (no {difficulty === 'All' ? '' : `${difficulty.toLowerCase()} `}
                                questions)
                              </span>
                            </p>
                          )}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {set.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="border-ink/10 text-ink/60 dark:border-white/10 rounded-full border px-2 py-0.5 text-[11px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-ink/70 font-mono text-sm md:text-center">
                          {countLabel}
                        </span>
                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium md:justify-self-start ${difficultyStyles[difficultyLabel] ?? difficultyStyles.Medium}`}
                        >
                          {difficultyLabel}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
                </div>
              </div>
            </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
