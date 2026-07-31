/**
 * Single source of truth for every localStorage key AboutIAM writes, imported by
 * both the export and import sides of the profile backup (src/lib/backup/profileBackup.ts)
 * so they can never drift apart. Deliberately explicit rather than a naive
 * `Object.keys(localStorage)` scan — that would also capture unrelated browser/
 * extension keys and risk corrupting the export if a non-JSON value is present.
 *
 * Two kinds of entries:
 * - Fixed keys: every Zustand `persist` store, plus the handful of features that
 *   read/write localStorage directly instead of through a store.
 * - Dynamic prefixes: features that write one key per content item (e.g. one
 *   content-feedback flag per Encyclopedia term/breach id) — enumerated at
 *   export time by scanning localStorage for keys starting with the prefix.
 */

export const KNOWN_STORAGE_KEYS: string[] = [
  // Zustand persist stores
  'aboutiam-disclaimer',
  'aboutiam-bookmarks',
  'aboutiam-preferences',
  'aboutiam-drive-sync',
  'aboutiam-spaced-repetition',
  'aboutiam-airplane-mode',
  'aboutiam-sidebar-collapsed',
  'aboutiam-theme-preference',
  'aboutiam-whats-new',
  'aboutiam-guided-tour',
  'aboutiam-search-history',
  // Direct localStorage reads/writes (not behind a Zustand store)
  'aboutiam-academy-progress',
  'aboutiam_labs_completed',
  'aboutiam_labs_stats',
  'aboutiam_cert_name',
  'aboutiam_scenario_configured',
  'aboutiam-museum-visited',
  'aboutiam-builder-configured',
  'aboutiam-challenges-progress',
  'aboutiam-showcase-published',
]

/** Dynamic per-item key prefixes — e.g. `aboutiam-feedback-<contentId>` (see src/lib/contentFeedback.ts). */
export const KNOWN_STORAGE_KEY_PREFIXES: string[] = ['aboutiam-feedback-']

/** True if `key` is a known fixed key or matches a known dynamic prefix. */
export function isKnownStorageKey(key: string): boolean {
  if (KNOWN_STORAGE_KEYS.includes(key)) return true
  return KNOWN_STORAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
}
