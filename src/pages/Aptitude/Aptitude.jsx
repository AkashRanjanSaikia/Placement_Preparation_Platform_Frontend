import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import aptitudeData from './aptitudeData.json'
import { setHasQuestions } from './aptitudeHelpers.js'

const difficulties = ['All', 'Easy', 'Medium', 'Hard']

const difficultyStyles = {
  Easy: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  Hard: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
}

function filterSets(sets, query, difficulty) {
  const list = Array.isArray(sets) ? sets : []
  const normalizedQuery = query.trim().toLowerCase()

  return list.filter((set) => {
    const matchesDifficulty =
      difficulty === 'All' || set.difficulty === difficulty
    const matchesSearch =
      !normalizedQuery ||
      set.title?.toLowerCase().includes(normalizedQuery) ||
      set.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))

    return matchesDifficulty && matchesSearch
  })
}

export default function AptitudePage() {
  const { search } = useOutletContext()
  const [difficulty, setDifficulty] = useState('All')

  const sections = useMemo(() => {
    const query = (search ?? '').trim().toLowerCase()
    const rawSections = aptitudeData.sections ?? []

    return rawSections
      .map((section) => {
        const sets = filterSets(section.sets, query, difficulty)
        const sectionMatchesQuery =
          query &&
          (section.title?.toLowerCase().includes(query) ||
            section.description?.toLowerCase().includes(query))

        if (query && sets.length === 0 && !sectionMatchesQuery) {
          return null
        }

        return {
          ...section,
          sets: sectionMatchesQuery && sets.length === 0
            ? filterSets(section.sets, '', difficulty)
            : sets,
        }
      })
      .filter(Boolean)
  }, [search, difficulty])

  const totalSets = sections.reduce((sum, section) => sum + section.sets.length, 0)

  return (
    <div>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {'// Prepify'}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Aptitude</h1>
      <p className="text-ink/60 mt-2 max-w-xl text-sm">
        Practice placement-style sets across general aptitude, verbal ability, and
        reasoning. Question banks below use demo data until the API is wired up.
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

      {totalSets === 0 ? (
        <p className="text-ink/55 mt-8 text-center text-sm">
          No practice sets match your filters.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.id} aria-labelledby={`aptitude-${section.id}`}>
              <div className="mb-4">
                <h2
                  id={`aptitude-${section.id}`}
                  className="text-xl font-semibold tracking-tight"
                >
                  {section.title}
                </h2>
                <p className="text-ink/60 mt-1 max-w-2xl text-sm">
                  {section.description}
                </p>
              </div>

              <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 overflow-hidden rounded-2xl border backdrop-blur-md">
                <div className="text-ink/45 hidden grid-cols-[1fr_6rem_6rem_8rem] gap-3 border-b border-ink/10 px-5 py-3 font-mono text-[11px] tracking-widest uppercase md:grid dark:border-white/10">
                  <span>Set</span>
                  <span>Questions</span>
                  <span>Time</span>
                  <span>Difficulty</span>
                </div>

                <ul>
                  {section.sets.map((set) => (
                    <li
                      key={set.id}
                      className="border-ink/10 hover:bg-ink/3 dark:border-white/10 grid grid-cols-1 gap-2 border-b px-5 py-4 last:border-b-0 md:grid-cols-[1fr_6rem_6rem_8rem] md:items-center md:gap-3"
                    >
                      <div>
                        {setHasQuestions(set) ? (
                          <Link
                            to={`/aptitude/${set.id}`}
                            className="hover:text-gold font-medium"
                          >
                            {set.title}
                          </Link>
                        ) : (
                          <p className="font-medium">
                            {set.title}
                            <span className="text-ink/45 ml-2 text-xs font-normal">
                              (coming soon)
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
                        {set.questionCount}
                      </span>
                      <span className="text-ink/70 font-mono text-sm md:text-center">
                        {set.durationMins}m
                      </span>
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium md:justify-self-start ${difficultyStyles[set.difficulty]}`}
                      >
                        {set.difficulty}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
