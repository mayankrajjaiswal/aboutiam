import { test, expect } from '@playwright/test'

const ROUTES = [
  '/next-gen',
  '/next-gen/agentic-identity',
  '/next-gen/ai-security-fabric',
  '/next-gen/phishing-resistant-auth',
  '/next-gen/digital-wallets',
  '/next-gen/crypto-agility',
  '/tools/mcp-manifest-auditor',
  '/tools/agent-governance-readiness',
  '/tools/passwordless-roi-calculator',
  '/tools/wallet-readiness-assessor',
  '/tools/agent-identity-record',
  '/tools/crypto-agility-inventory',
  '/playground/agent-registry',
  '/playground/delegation-chain',
  '/playground/ai-guardrails',
  '/playground/prompt-injection-escalation',
  '/playground/agent-observability',
  '/playground/fido-fleet-ops',
  '/playground/attestation-policy',
  '/playground/business-wallet',
  '/playground/credential-issuance',
  '/playground/crypto-migration',
]

async function bypassOverlays(page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('aboutiam-disclaimer', JSON.stringify({ state: { hasSeenDisclaimer: true } }))
    localStorage.setItem('aboutiam-guided-tour', JSON.stringify({ state: { hasSeenTour: true } }))
    localStorage.setItem('aboutiam-whats-new', JSON.stringify({ state: { lastSeenVersion: '2026.09.19' } }))
  })
}

test.describe('Next-Gen pillar: horizontal overflow at 320px', () => {
  test.use({ viewport: { width: 320, height: 720 } })
  for (const route of ROUTES) {
    test(`no h-scroll: ${route}`, async ({ page }) => {
      await bypassOverlays(page)
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate(() => {
        const de = document.documentElement
        if (de.scrollWidth <= de.clientWidth + 1) return null
        const bad: string[] = []
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.width > 0 && r.right > de.clientWidth + 1) {
            const e = el as HTMLElement
            bad.push(`<${e.tagName.toLowerCase()} class="${(e.className || '').toString().slice(0, 90)}"> right=${Math.round(r.right)}`)
          }
        })
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders: bad.slice(0, 6) }
      })
      expect(overflow, `overflow on ${route}: ${JSON.stringify(overflow, null, 2)}`).toBeNull()
    })
  }
})

test.describe('Next-Gen pillar: renders in dark mode without crashing', () => {
  for (const route of ROUTES) {
    test(`dark ok: ${route}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
      await bypassOverlays(page)
      await page.evaluate(() => localStorage.setItem('aboutiam-theme-preference', JSON.stringify({ state: { theme: 'dark' } })))
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      expect(isDark, `dark class missing on ${route}`).toBe(true)
      await expect(page.locator('h1, h2').first()).toBeVisible()
      const real = errors.filter((e) => !/favicon|manifest|404|net::ERR|Content Security Policy|ws:/.test(e))
      expect(real, `console errors on ${route}: ${real.join(' | ')}`).toHaveLength(0)
    })
  }
})
