import axios from 'axios'
import csCoreData from './csCoreData.json'

const backendUrl = import.meta.env.BACKEND_URL

export const CS_CORE_CATEGORY = 'core_cs'

export const sectionSubjectMap = {
  core: 'fundamentals',
}

export function findCsCoreSet(setId) {
  if (!setId) return null

  for (const section of csCoreData.sections ?? []) {
    const set = section.sets?.find((item) => item.id === setId)
    if (set) {
      return { section, set }
    }
  }

  return null
}

export function getSubjectForSection(sectionId) {
  return sectionSubjectMap[sectionId] ?? 'fundamentals'
}

export async function fetchQuestionPage({
  subject,
  topic,
  page = 1,
  limit = 10,
}) {
  const res = await axios.get(`${backendUrl}/question`, {
    params: {
      category: CS_CORE_CATEGORY,
      subject,
      topic,
      page,
      limit,
    },
  })
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

export function setHasQuestions(set, topicCounts) {
  if (!set?.id) return false
  return (topicCounts?.[set.id] ?? 0) > 0
}
