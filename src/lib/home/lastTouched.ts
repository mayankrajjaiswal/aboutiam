const ACADEMY_TOUCHED_KEY = 'aboutiam-academy-progress-touched'
const LABS_TOUCHED_KEY = 'aboutiam_labs_completed_touched'

function readTouchedMap(key: string): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  try {
    const saved = window.localStorage.getItem(key)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function writeTouchedMap(key: string, map: Record<string, string>): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(map))
}

/** Records "now" as the last-touched time for an Academy module — called only when a module is marked complete. */
export function touchAcademyModule(moduleId: string): void {
  const map = readTouchedMap(ACADEMY_TOUCHED_KEY)
  map[moduleId] = new Date().toISOString()
  writeTouchedMap(ACADEMY_TOUCHED_KEY, map)
}

/** Records "now" as the last-touched time for a completed playground/lab module. */
export function touchLabCompletion(moduleId: string): void {
  const map = readTouchedMap(LABS_TOUCHED_KEY)
  map[moduleId] = new Date().toISOString()
  writeTouchedMap(LABS_TOUCHED_KEY, map)
}

export function getAcademyTouchedMap(): Record<string, string> {
  return readTouchedMap(ACADEMY_TOUCHED_KEY)
}

export function getLabsTouchedMap(): Record<string, string> {
  return readTouchedMap(LABS_TOUCHED_KEY)
}
