import { test, expect } from '@playwright/test'

/**
 * End-to-end proof that the Next-Gen pillar is reachable through the command
 * palette, not just present in the index.
 *
 * `searchService.test.ts` already asserts every registry entry is indexed, but
 * that is a unit-level check against the MiniSearch instance. This spec drives
 * the real UI -- open the palette, type, read rendered results -- which is the
 * only way to catch a regression between the index and the palette (a broken
 * render, a debounce change, a result-limit that buries the pillar).
 */
const QUERIES: { q: string; expect: RegExp }[] = [
  { q: 'agentic identity', expect: /agentic/i },
  { q: 'prompt injection', expect: /prompt injection/i },
  { q: 'post-quantum', expect: /quantum|pqc/i },
  { q: 'business wallet', expect: /wallet/i },
  { q: 'MCP manifest', expect: /mcp/i },
  { q: 'FIDO fleet', expect: /fido|fleet/i },
  { q: 'crypto agility', expect: /crypto agility/i },
  { q: 'delegation chain', expect: /delegation/i },
]

test('the command palette surfaces Next-Gen IAM content for every pillar theme', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000)

  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
    localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
    // Must equal WHATS_NEW_RELEASES[0].version -- the modal opens on any mismatch.
    localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.09.19' } }))
  })

  for (const { q, expect: rx } of QUERIES) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')

    // Target the palette's own input explicitly: the Sidebar's "Jump to..."
    // filter is also an <input type="text"> and comes first in the DOM.
    const input = page.getByPlaceholder(/Search tools, glossary, simulators/i)
    await input.fill(q)
    await page.waitForTimeout(400)

    const rendered = await page.locator('body').innerText()
    expect(rendered, `query "${q}" surfaced no matching result in the palette`).toMatch(rx)
  }
})
