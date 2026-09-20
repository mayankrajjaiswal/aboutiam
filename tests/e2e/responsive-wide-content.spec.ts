import { test, expect } from '@playwright/test'

/**
 * The counter-test to responsive-overflow.spec.ts.
 *
 * That spec asserts no page scrolls sideways at 320px. The cheap way to satisfy
 * it would be to force everything to wrap -- which would destroy the content
 * that legitimately needs to stay wide: data tables, ASCII architecture
 * diagrams, code blocks. This spec asserts the opposite half of the contract, so
 * the two together pin the intended behaviour rather than just one side of it:
 *
 *   the PAGE must not scroll horizontally, but wide content must still be
 *   reachable by scrolling ITS OWN container.
 *
 * It exists because src/index.css now sets `min-width: 0` on grid/flex children
 * below 640px. That rule only lowers a shrink floor, so an explicit
 * `overflow-x-auto` wrapper keeps working -- but "should keep working" is
 * exactly the kind of claim that deserves a test rather than a comment.
 */

const CASES = [
  { route: '/tools/raci-builder', sel: 'table' },
  { route: '/next-gen', sel: 'pre' },
  { route: '/references', sel: 'code' },
  { route: '/architecture', sel: 'pre' },
]
test.use({ viewport: { width: 320, height: 720 } })
for (const { route, sel } of CASES) {
  test(`wide content still scrolls in-container: ${route} ${sel}`, async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
      localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
      localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.09.19' } }))
    })
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const r = await page.evaluate((s) => {
      const els = [...document.querySelectorAll(s)] as HTMLElement[]
      if (!els.length) return { found: 0, scrollable: 0, pageScrolls: false }
      let scrollable = 0
      for (const el of els) {
        // walk up for a scroll container that is actually wider than its box
        let cur: HTMLElement | null = el
        for (let i = 0; i < 4 && cur; i++) {
          if (cur.scrollWidth > cur.clientWidth + 1) { scrollable++; break }
          cur = cur.parentElement
        }
      }
      const de = document.documentElement
      return { found: els.length, scrollable, pageScrolls: de.scrollWidth > de.clientWidth + 1 }
    }, sel)
    console.log(`SCROLL ${route} ${sel} -> ${JSON.stringify(r)}`)
    // The page itself must never scroll...
    expect(r.pageScrolls, `${route}: whole page scrolls horizontally`).toBe(false)
    // ...but the wide content must still be reachable by scrolling its container.
    if (r.found > 0) expect(r.scrollable, `${route}: no ${sel} retained an in-container horizontal scroll`).toBeGreaterThan(0)
  })
}
