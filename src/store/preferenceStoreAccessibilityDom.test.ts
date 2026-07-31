// @vitest-environment jsdom
// Verifies the actual <html> class toggling side effect — genuinely
// DOM-dependent, so this opts into jsdom per-file rather than moving the
// whole "unit" project off node (same pattern as src/lib/googleDrive.test.ts).
import { describe, it, expect, beforeEach } from 'vitest'
import { usePreferenceStore } from './preferenceStore'

beforeEach(() => {
  usePreferenceStore.setState({ readingMode: false, colorblindSafePalette: false })
  document.documentElement.classList.remove('reading-mode', 'colorblind-safe')
})

describe('accessibility preference DOM class toggling', () => {
  it('setReadingMode(true) adds the reading-mode class to <html>, and false removes it', () => {
    usePreferenceStore.getState().setReadingMode(true)
    expect(document.documentElement.classList.contains('reading-mode')).toBe(true)

    usePreferenceStore.getState().setReadingMode(false)
    expect(document.documentElement.classList.contains('reading-mode')).toBe(false)
  })

  it('setColorblindSafePalette(true) adds the colorblind-safe class to <html>, and false removes it', () => {
    usePreferenceStore.getState().setColorblindSafePalette(true)
    expect(document.documentElement.classList.contains('colorblind-safe')).toBe(true)

    usePreferenceStore.getState().setColorblindSafePalette(false)
    expect(document.documentElement.classList.contains('colorblind-safe')).toBe(false)
  })

  it('initializeAccessibilityPreferences re-applies both classes from persisted state', () => {
    usePreferenceStore.setState({ readingMode: true, colorblindSafePalette: true })
    document.documentElement.classList.remove('reading-mode', 'colorblind-safe')

    usePreferenceStore.getState().initializeAccessibilityPreferences()

    expect(document.documentElement.classList.contains('reading-mode')).toBe(true)
    expect(document.documentElement.classList.contains('colorblind-safe')).toBe(true)
  })
})
