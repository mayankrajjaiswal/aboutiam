export interface ChordShortcut {
  /** Space-separated two-key chord, e.g. "g h" for g-then-h. */
  chord: string
  label: string
  path: string
}

/**
 * Gmail/GitHub-style `g`-then-letter chorded navigation to the half-dozen
 * most-visited top-level destinations. Single source of truth consumed by
 * both useChordedShortcuts.ts (the listener) and ShortcutsOverlay.tsx (the
 * `?`-triggered cheat sheet), so the two can never drift apart.
 */
export const CHORDED_SHORTCUTS: ChordShortcut[] = [
  { chord: 'g h', label: 'Home', path: '/' },
  { chord: 'g l', label: 'Academy', path: '/learn' },
  { chord: 'g p', label: 'Playgrounds', path: '/playground' },
  { chord: 'g t', label: 'Tools', path: '/tools' },
  { chord: 'g a', label: 'Assess', path: '/assess' },
  { chord: 'g e', label: 'Encyclopedia', path: '/encyclopedia' },
]
