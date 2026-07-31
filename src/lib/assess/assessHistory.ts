const LAST_ASSESSMENT_KEY = 'aboutiam-last-assessment'

/** Persists the most recently completed self-assessment so the Command Center's
 * "Generate Board Summary" export can reuse it without re-running the wizard. */
export function saveLastAssessment(answers: Record<number, number>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LAST_ASSESSMENT_KEY, JSON.stringify(answers))
}

export function getLastAssessment(): Record<number, number> | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(LAST_ASSESSMENT_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed as Record<number, number>
  } catch {
    return null
  }
}
