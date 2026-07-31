import { ACADEMY_TRACKS } from '../../data/academyTracks'

export type ContinueItemKind = 'academy' | 'playground' | 'bookmark'

export interface ContinueLearningItem {
  id: string
  kind: ContinueItemKind
  title: string
  link: string
  touchedAt: string
}

export interface BookmarkInput {
  id: string
  title: string
  link: string
  addedAt?: string
}

export interface ContinueLearningInputs {
  academyTouched: Record<string, string>
  labsTouched: Record<string, string>
  bookmarks: BookmarkInput[]
}

/** `role_mining_workbench` / `lab-oauth` → `Role Mining Workbench` / `Oauth`. */
function humanizeModuleId(moduleId: string): string {
  return moduleId
    .replace(/^lab-/, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function findAcademyModule(moduleId: string): { title: string; trackId: string } | null {
  for (const track of ACADEMY_TRACKS) {
    const mod = track.modules.find((m) => m.id === moduleId)
    if (mod) return { title: mod.title, trackId: track.id }
  }
  return null
}

/**
 * Ranks the most-recently-touched Academy modules, playground/lab completions, and
 * bookmarks into a single "continue where you left off" list, most recent first.
 * Pure function over explicit inputs — the caller (ContinueLearningCard) gathers the
 * real localStorage/store-backed data — so this stays trivially testable.
 */
export function rankContinueLearningItems(inputs: ContinueLearningInputs, limit = 3): ContinueLearningItem[] {
  const items: ContinueLearningItem[] = []

  for (const [moduleId, touchedAt] of Object.entries(inputs.academyTouched)) {
    const found = findAcademyModule(moduleId)
    if (!found) continue
    items.push({
      id: `academy-${moduleId}`,
      kind: 'academy',
      title: found.title,
      link: `/learn?track=${found.trackId}`,
      touchedAt,
    })
  }

  for (const [moduleId, touchedAt] of Object.entries(inputs.labsTouched)) {
    const isLegacyLab = moduleId.startsWith('lab-')
    items.push({
      id: `playground-${moduleId}`,
      kind: 'playground',
      title: humanizeModuleId(moduleId),
      link: isLegacyLab ? '/labs' : '/playground',
      touchedAt,
    })
  }

  for (const bookmark of inputs.bookmarks) {
    if (!bookmark.addedAt) continue
    items.push({
      id: `bookmark-${bookmark.id}`,
      kind: 'bookmark',
      title: bookmark.title,
      link: bookmark.link,
      touchedAt: bookmark.addedAt,
    })
  }

  return items.sort((a, b) => new Date(b.touchedAt).getTime() - new Date(a.touchedAt).getTime()).slice(0, limit)
}
