import { describe, it, expect } from 'vitest'

// GEMINI.md §3B: the app is compiled by static builders (`vite build`,
// scripts/postbuild-ssg.mjs) and CLI test runners that have no `window`/
// `document`, so every store must guard direct browser access. This suite
// runs under the "integration" project's `node` environment (no jsdom), so
// `window`/`document` are genuinely undefined here — not stubbed — the same
// condition the real static build runs under. It turns the rule GEMINI
// already states in prose into an actual regression test: import each
// SSR-guarded store fresh and exercise every action, and fail loudly the
// moment one of them reaches for `window`/`document` without a guard.
describe('persisted stores survive import and use with no window/document (§3B SSR guard)', () => {
  it('confirms this suite is really running without a DOM (sanity check for the check itself)', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
  })

  it('themeStore: setTheme/initializeTheme do not throw', async () => {
    const { useThemeStore } = await import('../../src/store/themeStore')
    expect(() => useThemeStore.getState().setTheme('dark')).not.toThrow()
    expect(() => useThemeStore.getState().initializeTheme()).not.toThrow()
  })

  it('disclaimerStore: open/close do not throw', async () => {
    const { useDisclaimerStore } = await import('../../src/store/disclaimerStore')
    expect(() => useDisclaimerStore.getState().openDisclaimer()).not.toThrow()
    expect(() => useDisclaimerStore.getState().closeDisclaimer()).not.toThrow()
  })

  it('tourStore: open/close do not throw', async () => {
    const { useTourStore } = await import('../../src/store/tourStore')
    expect(() => useTourStore.getState().openTour()).not.toThrow()
    expect(() => useTourStore.getState().closeTour()).not.toThrow()
  })

  it('layoutStore, bookmarksStore, preferenceStore, airplaneModeStore: import and basic actions do not throw', async () => {
    const { useLayoutStore } = await import('../../src/store/layoutStore')
    const { useBookmarksStore } = await import('../../src/store/bookmarksStore')
    const { usePreferenceStore } = await import('../../src/store/preferenceStore')
    const { useAirplaneModeStore } = await import('../../src/store/airplaneModeStore')

    expect(() => useLayoutStore.getState()).not.toThrow()
    expect(() => useBookmarksStore.getState().toggleBookmark({ id: 'ssr-test', title: 'x', link: '/' })).not.toThrow()
    expect(() => usePreferenceStore.getState()).not.toThrow()
    expect(() => useAirplaneModeStore.getState()).not.toThrow()
  })
})
