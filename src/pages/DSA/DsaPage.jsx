import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import axios from 'axios'

import { getApiBase } from '../../config/apiBase.js'

const backendUrl = getApiBase()

const difficulties = ['All', 'Easy', 'Medium', 'Hard']

const difficultyStyles = {
  Easy: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  Hard: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
}

export default function DsaPage() {
  const { search } = useOutletContext()
  const [difficulty, setDifficulty] = useState('All')
  const [problems, setProblems] = useState([])

  useEffect(() => {
    axios
      .get(`${backendUrl}/problem`)
      .then((res) => {
        const list = res.data?.data
        setProblems(Array.isArray(list) ? list : [])
      })
      .catch(() => setProblems([]))
  }, [])

  const questions = useMemo(() => {
    const query = (search ?? '').trim().toLowerCase()
    const list = Array.isArray(problems) ? problems : []

    return list.filter((question) => {
      const matchesDifficulty =
        difficulty === 'All' || question.difficulty === difficulty
      const matchesSearch =
        !query ||
        question.title?.toLowerCase().includes(query) ||
        question.tags?.some((tag) => tag.toLowerCase().includes(query))

      return matchesDifficulty && matchesSearch
    })
  }, [search, difficulty, problems])

  return (
    <div>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {'// Practice set'}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        DSA Questions
      </h1>
      <p className="text-ink/60 mt-2 max-w-xl text-sm">
        Demo problems to start grinding. Search by title or tag, then filter by
        difficulty.
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

      <div className="border-ink/10 bg-white/65 dark:border-white/10 dark:bg-black/50 mt-6 overflow-hidden rounded-2xl border backdrop-blur-md">
        <div className="text-ink/45 hidden grid-cols-[3rem_1fr_8rem_10rem_6rem] gap-3 border-b border-ink/10 px-5 py-3 font-mono text-[11px] tracking-widest uppercase md:grid dark:border-white/10">
          <span>#</span>
          <span>Title</span>
          <span>Difficulty</span>
          <span>Tags</span>
          <span className="text-right">Accept</span>
        </div>

        {questions.length === 0 ? (
          <p className="text-ink/55 px-5 py-10 text-center text-sm">
            No questions match your search.
          </p>
        ) : (
          <ul>
            {questions.map((question, index) => (
              <li
                key={question.slug || question._id}
                className="border-ink/10 hover:bg-ink/3 dark:border-white/10 grid grid-cols-1 gap-2 border-b px-5 py-4 last:border-b-0 md:grid-cols-[3rem_1fr_8rem_10rem_6rem] md:items-center md:gap-3"
              >
                <span className="text-ink/40 font-mono text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Link
                  to={`/dsa-practice/${question.slug}`}
                  className="hover:text-gold font-medium"
                >
                  {question.title}
                </Link>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${difficultyStyles[question.difficulty]}`}
                >
                  {question.difficulty}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {question.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="border-ink/10 text-ink/60 dark:border-white/10 rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-ink/50 font-mono text-xs md:text-right">
                  {question.acceptance}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
