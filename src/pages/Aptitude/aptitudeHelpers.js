import aptitudeData from './aptitudeData.json'

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

export function setHasQuestions(set) {
  return Array.isArray(set?.questions) && set.questions.length > 0
}
