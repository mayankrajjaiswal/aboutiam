import { test, expect } from '@playwright/test'
import { ROUTE_META } from '../../src/routeMeta'

/**
 * Site-wide horizontal-overflow guard.
 *
 * A page that scrolls sideways on a phone is a real usability defect, and it
 * is invisible to every component test -- jsdom has no layout engine, so only
 * a real browser at a real viewport can catch it. A sweep at 320px (the
 * narrowest mainstream phone, and the width GEMINI.md §10.8 calls out) found
 * 24 routes scrolling sideways, almost all tracing back to the CSS default
 * `min-width: auto` on grid/flex items -- now floored for narrow viewports in
 * src/index.css.
 *
 * This spec is the regression net for that fix. It walks EVERY route in
 * ROUTE_META rather than a hand-picked sample, specifically because the
 * original bug was in shared chrome that a sample would have missed.
 *
 * 1440px is included so a future "fix" that simply clamps everything cannot
 * pass by collapsing desktop layout -- it asserts <main> keeps a sane width.
 *
 * Runs on chromium in CI for wall-clock reasons (211 routes x 3 viewports).
 * The fix was separately verified on firefox and webkit at 320px and 768px
 * across all 24 originally-failing routes plus the 6 pillar hubs -- worth
 * re-checking on those engines if this rule is ever changed, since the
 * underlying `min-width: auto` behaviour is where layout engines differ.
 */
const ROUTES = [...new Set(ROUTE_META.map((r) => r.path))]

async function bypassFirstVisitOverlays(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
    localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
    // WhatsNewModal opens whenever lastSeenVersion !== WHATS_NEW_VERSION, so a
    // sentinel like '9999.99.99' would *guarantee* it opens. Keep this in sync
    // with WHATS_NEW_RELEASES[0].version in src/data/whatsNewData.ts.
    localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.09.19' } }))
  })
}

for (const vp of [
  { name: '320px phone', width: 320, height: 720 },
  { name: '768px tablet', width: 768, height: 1024 },
  { name: '1440px desktop', width: 1440, height: 900 },
]) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test(`no route scrolls horizontally at ${vp.width}px`, async ({ page }) => {
      test.setTimeout(30 * 60 * 1000)
      await bypassFirstVisitOverlays(page)

      const failures: string[] = []
      for (const route of ROUTES) {
        await page.goto(route)
        await page.waitForLoadState('networkidle')
        const problem = await page.evaluate(() => {
          const de = document.documentElement
          if (de.scrollWidth > de.clientWidth + 1) {
            // Name the widest element so a failure is actionable, not just "something".
            let worst = ''
            let max = 0
            document.querySelectorAll('*').forEach((el) => {
              const b = el.getBoundingClientRect()
              if (b.width > 0 && b.right > max) {
                max = b.right
                worst = `<${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 80)}">`
              }
            })
            return `scrollWidth ${de.scrollWidth} > clientWidth ${de.clientWidth}; widest: ${worst}`
          }
          const main = document.querySelector('main')
          const w = main ? main.getBoundingClientRect().width : -1
          if (w >= 0 && w < 200) return `<main> collapsed to ${Math.round(w)}px`
          return null
        })
        if (problem) failures.push(`${route} -> ${problem}`)
      }

      expect(failures, `routes failing at ${vp.width}px:\n${failures.join('\n')}`).toHaveLength(0)
    })
  })
}
