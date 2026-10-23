export const CONTEST_SECTION_TYPES = [
  { id: 'DSA', label: 'DSA' },
  { id: 'APTITUDE', label: 'Aptitude' },
  { id: 'CORE_CS', label: 'Core CS' },
]

export const CONTEST_LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python', judge0Id: 71 },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', judge0Id: 63 },
  { id: 'java', label: 'Java', monaco: 'java', judge0Id: 62 },
  { id: 'cpp', label: 'C++', monaco: 'cpp', judge0Id: 54 },
]

export function libraryModelForSectionType(sectionType) {
  return sectionType === 'DSA' ? 'Problem' : 'Question'
}

export function draftStorageKey(contestId, questionKey) {
  return `prepify_contest_draft_${contestId}_${questionKey}`
}
