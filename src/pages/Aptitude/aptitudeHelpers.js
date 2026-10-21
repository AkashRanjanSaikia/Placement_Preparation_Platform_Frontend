import axios from 'axios'
import aptitudeData from './aptitudeData.json'

const backendUrl = import.meta.env.BACKEND_URL

export const APTITUDE_CATEGORY = 'aptitude'

export const sectionSubjectMap = {
  general: 'quantitative',
  verbal: 'verbal',
  reasoning: 'logical',
}

export function findAptitudeSet(setId) {
  if (!setId) return null

  for (const section of aptitudeData.sections ?? []) {
    const set = section.sets?.find((item) => item.id === setId)
    if (set) {
      return { section, set }
    }
  }

  return null
}

export function getSubjectForSection(sectionId) {
  return sectionSubjectMap[sectionId] ?? 'quantitative'
}

export async function fetchQuestionPage({
  subject,
  topic,
  page = 1,
  limit = 10,
}) {
  const res = await axios.get(`${backendUrl}/question`, {
    params: {
      category: APTITUDE_CATEGORY,
      subject,
      topic,
      page,
      limit,
    },
  })
  return res.data
}

export async function fetchAptitudeCatalog() {
  const res = await axios.get(`${backendUrl}/question/catalog`, {
    params: { category: APTITUDE_CATEGORY },
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

