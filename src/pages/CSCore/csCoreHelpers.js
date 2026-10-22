import axios from 'axios'
import csCoreData from './csCoreData.json'

const backendUrl = import.meta.env.BACKEND_URL

export const CS_CORE_CATEGORY = 'core_cs'
export const CS_CORE_SUBJECT = 'fundamentals'
export const ALL_TOPICS_ID = csCoreData.mixedPractice?.id ?? 'all-topics'

const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function formatQuestionDifficulty(value) {
  if (!value) return 'Medium'
  const key = String(value).toLowerCase()
  return DIFFICULTY_LABELS[key] ?? 'Medium'
}

export const questionDifficultyStyles = {
  Easy: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  Hard: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  Mixed: 'bg-sky-500/12 text-sky-800 dark:text-sky-200',
}

export function getAllTopicIds() {
  const ids = []
  for (const section of csCoreData.sections ?? []) {
    for (const set of section.sets ?? []) {
      if (set?.id) ids.push(set.id)
    }
  }
  return ids
}

export function findCsCorePractice(topicId) {
  if (!topicId) return null

  if (topicId === ALL_TOPICS_ID) {
    return {
      id: ALL_TOPICS_ID,
      title: csCoreData.mixedPractice?.title ?? 'All Topics',
      subjectTitle: 'CS Fundamentals',
    }
  }

  for (const section of csCoreData.sections ?? []) {
    const set = section.sets?.find((item) => item.id === topicId)
    if (set) {
      return {
        ...set,
        sectionId: section.id,
        sectionTitle: section.title,
        subjectTitle: section.title,
      }
    }
  }

  return null
}

export function findCsCoreSet(setId) {
  return findCsCorePractice(setId)
}

export function getSubjectForSection() {
  return CS_CORE_SUBJECT
}

/**
 * Difficulty summary for a topic row on the landing page.
 * When `difficultyFilter` is Easy/Medium/Hard, matches the filtered question set (same as the count column).
 * When `difficultyFilter` is All, reflects the full topic bank from the catalog.
 */
export function deriveTopicDifficultyLabel(
  topicId,
  topicDifficultyCounts,
  difficultyFilter = 'All',
) {
  const stats = topicDifficultyCounts?.[topicId]
  if (!stats) return 'Medium'

  if (difficultyFilter && difficultyFilter !== 'All') {
    const key = difficultyFilter.toLowerCase()
    if ((stats[key] ?? 0) > 0) {
      return DIFFICULTY_LABELS[key] ?? difficultyFilter
    }
    return 'Medium'
  }

  const levels = ['easy', 'medium', 'hard'].filter((level) => stats[level] > 0)
  if (levels.length === 0) return 'Medium'
  if (levels.length === 1) {
    return DIFFICULTY_LABELS[levels[0]]
  }
  return 'Mixed'
}

export function countForDifficultyFilter(topicId, difficulty, topicCounts, topicDifficultyCounts) {
  if (!topicId) return 0
  if (difficulty === 'All') {
    return topicCounts?.[topicId] ?? 0
  }
  const key = difficulty.toLowerCase()
  return topicDifficultyCounts?.[topicId]?.[key] ?? 0
}

export function getMixedPracticeCount(difficulty, topicCounts, topicDifficultyCounts) {
  return getAllTopicIds().reduce(
    (sum, id) =>
      sum + countForDifficultyFilter(id, difficulty, topicCounts, topicDifficultyCounts),
    0,
  )
}

export async function fetchQuestionPage({
  topic,
  page = 1,
  limit = 10,
  difficulty,
}) {
  const params = {
    category: CS_CORE_CATEGORY,
    subject: CS_CORE_SUBJECT,
    topic,
    page,
    limit,
  }

  if (difficulty && difficulty !== 'All') {
    params.difficulty = difficulty.toLowerCase()
  }

  const res = await axios.get(`${backendUrl}/question`, { params })
  return res.data
}

export async function fetchCsCoreCatalog() {
  const res = await axios.get(`${backendUrl}/question/catalog`, {
    params: { category: CS_CORE_CATEGORY },
  })
  return res.data
}

export async function checkQuestionAnswer(questionId, selectedIndex) {
  const res = await axios.post(`${backendUrl}/question/${questionId}/check`, {
    selectedIndex,
  })
  return res.data
}

export function setHasQuestions(set, topicCounts, difficulty, topicDifficultyCounts) {
  if (!set?.id) return false
  const count = countForDifficultyFilter(
    set.id,
    difficulty,
    topicCounts,
    topicDifficultyCounts,
  )
  return count > 0
}
